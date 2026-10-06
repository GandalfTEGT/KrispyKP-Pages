import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { validateRadarDesktop } from "./validate-radar-desktop.mjs";
import { validateRadarControls } from "./validate-radar-controls.mjs";
import { validateRadarRemediation } from "./validate-radar-browser.mjs";
import {
  PROFILE_VIEWPORTS,
  ROOT,
  createResult,
  detectScope,
  findChromiumExecutable,
  parseArgs,
  record
} from "./validation-common.mjs";

import {routeTable} from "./pages/rules.mjs";

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".pdf": "application/pdf"
};

export function createStaticServer(root) {
  const server = http.createServer((request, response) => {
    try {
      const url = new URL(request.url || "/", "http://127.0.0.1");
      let relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      if (!relative || relative.endsWith("/")) relative += "index.html";
      const filename = path.resolve(root, relative);
      if (!(filename === root || filename.startsWith(root + path.sep)) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }
      response.writeHead(200, {
        "Content-Type": MIME[path.extname(filename).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store"
      });
      fs.createReadStream(filename).pipe(response);
    } catch (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.message);
    }
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

function matrixFor(profile, affectedPages, explicitPages, root) {
  if (explicitPages) return explicitPages.flatMap(page => PROFILE_VIEWPORTS[profile].map(width => ({ page, width })));
  const ALL_PAGES=Object.keys(routeTable(root));
  if (profile === "acceptance") return ALL_PAGES.flatMap(page => PROFILE_VIEWPORTS.acceptance.map(width => ({ page, width })));
  if (profile === "smoke") return ALL_PAGES.map(page => ({ page, width: 390 }));
  const keys = new Set(ALL_PAGES.map(page => `${page}:390`));
  affectedPages.forEach(page => keys.add(`${page}:1024`));
  return [...keys].map(key => {
    const [page, width] = key.split(":");
    return { page, width: Number(width) };
  });
}

async function preparePage(browser, baseUrl, width) {
  const context = await browser.newContext({ viewport: { width, height: width <= 430 ? 844 : 900 }, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const runtime = { consoleErrors: [], pageErrors: [], assetErrors: [] };
  page.on("console", message => {
    if (message.type() !== "error") return;
    const location = message.location().url || "";
    if (!location || location.startsWith(baseUrl)) runtime.consoleErrors.push(message.text());
  });
  page.on("pageerror", error => runtime.pageErrors.push(error.message));
  page.on("response", response => {
    if (response.url().startsWith(baseUrl) && response.status() >= 400) runtime.assetErrors.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", request => {
    if (request.url().startsWith(baseUrl)) runtime.assetErrors.push(`request failed ${request.url()}`);
  });
  await page.route("**/*", route => {
    const url = route.request().url();
    if (/^(?:data:|blob:|about:)/.test(url) || url.startsWith(baseUrl)) route.continue();
    else route.abort("blockedbyclient");
  });
  return { context, page, runtime };
}

async function checkPage(browser, baseUrl, root, result, pageName, width, screenshots) {
  const { context, page, runtime } = await preparePage(browser, baseUrl, width);
  const route = routeTable(root)[pageName];
  let response = null;
  let metrics = null;
  try {
    response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(120);
    metrics = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      main: document.querySelectorAll("main").length,
      documentClient: document.documentElement.clientWidth,
      documentScroll: document.documentElement.scrollWidth,
      bodyClient: document.body.clientWidth,
      bodyScroll: document.body.scrollWidth
    }));
    if (screenshots && [390, 1440].includes(width)) {
      const directory = path.join(root, ".validation", "screenshots");
      fs.mkdirSync(directory, { recursive: true });
      await page.screenshot({ path: path.join(directory, `${pageName}-${width}.png`), fullPage: true });
    }
  } catch (error) {
    runtime.pageErrors.push(error.message);
  }
  const passed = Boolean(response && response.ok() && metrics && metrics.h1 === 1 && metrics.main === 1 &&
    metrics.documentScroll <= metrics.documentClient + 1 && metrics.bodyScroll <= metrics.bodyClient + 1 &&
    runtime.consoleErrors.length === 0 && runtime.pageErrors.length === 0 && runtime.assetErrors.length === 0);
  record(result, `browser:${pageName}:${width}`, passed, {
    page: pageName,
    viewport: width,
    message: passed ? "loaded; one H1/main; no first-party errors or document overflow" : JSON.stringify({
      status: response?.status() || null,
      metrics,
      ...runtime
    })
  });
  await context.close();
}

async function functionalCase(result, name, callback) {
  try {
    const details = await callback();
    record(result, `functional:${name}`, true, { message: details || "passed" });
  } catch (error) {
    record(result, `functional:${name}`, false, { message: error.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runHomeTest(browser, baseUrl) {
  const { context, page } = await preparePage(browser, baseUrl, 390);
  try {
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    const menu = page.locator(".nav-toggle");
    assert(await menu.count() === 1, "mobile menu trigger missing");
    await menu.click();
    assert(await menu.getAttribute("aria-expanded") === "true", "mobile menu did not expand");
    await page.keyboard.press("Escape");
    assert(await menu.getAttribute("aria-expanded") === "false", "Escape did not close mobile menu");
    const schedule = page.locator(".home-schedule");
    if (await schedule.count()) assert(!(await schedule.evaluate(element => element.open)), "mobile schedule should default closed");
    await schedule.locator("summary").click();
    assert(await schedule.evaluate(element => element.open), "schedule disclosure did not open");
    await page.setViewportSize({ width: 1440, height: 900 });
    assert(await schedule.evaluate(element => element.open), "desktop breakpoint overrode the user-opened schedule");
    await schedule.evaluate(element => { element.open = false; });
    await page.reload({ waitUntil: "domcontentloaded" });
    assert(!(await page.locator(".home-schedule").evaluate(element => element.open)), "desktop schedule should default closed");
    const twitchFrame = page.locator("#homeTwitchFrame");
    assert(!(await twitchFrame.getAttribute("src")), "Twitch loaded before visitor choice");
    assert(await page.locator("#homeTwitchGate").isVisible(), "first-party Twitch gate is not visible");
    await page.locator("#loadTwitchPlayer").click();
    assert((await twitchFrame.getAttribute("src") || "").includes("player.twitch.tv"), "Twitch player did not load after visitor choice");
    assert(!(await page.locator("#homeTwitchGate").isVisible()), "Twitch gate remained visible after activation");
    const uplinkBeforeFocus = await page.evaluate(() => {
      const uplink = document.querySelector(".home-uplink-section");
      const focus = document.querySelector(".home-focus-panel")?.closest(".section");
      return Boolean(uplink && focus && (uplink.compareDocumentPosition(focus) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    assert(uplinkBeforeFocus, "Current Uplink is not before Current Focus and Command Feed");
    const heroBottoms = await page.evaluate(() => {
      const left = document.querySelector(".hero-grid > .frame")?.getBoundingClientRect();
      const live = document.querySelector(".hero-card > .frame")?.getBoundingClientRect();
      return { left: left?.bottom || 0, live: live?.bottom || 0 };
    });
    assert(Math.abs(heroBottoms.left - heroBottoms.live) <= 2, "desktop Live Stream and Battlefield panels do not align at the bottom");
    return "mobile menu, semantic schedule state, click-to-load Twitch gate, Uplink order and desktop hero alignment passed";
  } finally { await context.close(); }
}

async function runHomeLayoutTest(browser, baseUrl, root, screenshots) {
  const viewports = [
    { width: 320, height: 844 },
    { width: 390, height: 844 },
    { width: 768, height: 900 },
    { width: 1024, height: 900 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 2560, height: 1440 }
  ];
  const violations = [];
  const within = (inner, outer, tolerance = 1) => inner.left >= outer.left - tolerance &&
    inner.top >= outer.top - tolerance && inner.right <= outer.right + tolerance && inner.bottom <= outer.bottom + tolerance;

  for (const viewport of viewports) {
    const { context, page } = await preparePage(browser, baseUrl, viewport.width);
    try {
      await page.setViewportSize(viewport);
      await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(120);
      const before = await page.evaluate(() => {
        const rect = selector => document.querySelector(selector)?.getBoundingClientRect().toJSON();
        const logo = document.querySelector(".hero-logo");
        return {
          heroPanel: rect(".hero-grid > .frame"),
          panel: rect(".hero-card > .frame"),
          embed: rect(".home-twitch-gate"),
          gate: rect("#homeTwitchGate"),
          logo: rect(".hero-logo"),
          logoNatural: { width: logo?.naturalWidth || 0, height: logo?.naturalHeight || 0 },
          documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      });
      const renderedRatio = before.logo.width / before.logo.height;
      const naturalRatio = before.logoNatural.width / before.logoNatural.height;
      if (!Number.isFinite(naturalRatio) || Math.abs(renderedRatio - naturalRatio) > naturalRatio * 0.02) {
        violations.push(`${viewport.width}x${viewport.height}: hero logo ratio ${renderedRatio.toFixed(3)} does not match intrinsic ${naturalRatio.toFixed(3)}`);
      }
      if (!within(before.logo, before.heroPanel)) {
        violations.push(`${viewport.width}x${viewport.height}: hero logo is not contained by its panel`);
      }
      if (!within(before.gate, before.embed) || !within(before.embed, before.panel) || before.documentOverflow > 1) {
        violations.push(`${viewport.width}x${viewport.height}: Twitch gate is not contained (${JSON.stringify({ panel: before.panel, embed: before.embed, gate: before.gate })})`);
      }
      if (screenshots) {
        const directory = path.join(root, ".validation", "screenshots");
        fs.mkdirSync(directory, { recursive: true });
        await page.screenshot({ path: path.join(directory, `home-retest-${viewport.width}x${viewport.height}-gate.png`), fullPage: true });
      }
      await page.locator("#loadTwitchPlayer").click();
      const after = await page.evaluate(() => {
        const rect = selector => document.querySelector(selector)?.getBoundingClientRect().toJSON();
        return {
          panel: rect(".hero-card > .frame"),
          embed: rect(".home-twitch-gate"),
          frame: rect("#homeTwitchFrame"),
          documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      });
      if (!within(after.frame, after.embed) || !within(after.embed, after.panel) || after.documentOverflow > 1) {
        violations.push(`${viewport.width}x${viewport.height}: loaded Twitch frame is not contained (${JSON.stringify({ panel: after.panel, embed: after.embed, frame: after.frame })})`);
      }
      if (screenshots) {
        const directory = path.join(root, ".validation", "screenshots");
        await page.screenshot({ path: path.join(directory, `home-retest-${viewport.width}x${viewport.height}-loaded.png`), fullPage: true });
      }
    } finally {
      await context.close();
    }
  }
  assert(violations.length === 0, violations.join("; "));
  return "hero logo aspect ratio and Twitch gate/player containment passed at seven owner-retest viewports";
}

async function runMusicTest(browser, baseUrl) {
  const { context, page } = await preparePage(browser, baseUrl, 1024);
  try {
    await page.goto(`${baseUrl}/music/`, { waitUntil: "domcontentloaded" });
    const rows = page.locator(".track-item:not(.unavailable)");
    assert(await rows.count() > 1, "playable track rows missing");
    const target = rows.nth(1);
    const id = await target.getAttribute("data-track-id");
    await target.click();
    await page.waitForFunction(() => document.querySelector("#playerArt")?.dataset.artState !== "loading");
    assert(await page.locator("#playerArt").getAttribute("data-art-state") === "ready", "selected artwork did not reach its ready state");
    assert(await page.locator("#importCustomBtn").getAttribute("aria-controls") === "importCustomInput", "Import JSON control is not associated with its file input");
    assert(new URL(page.url()).searchParams.get("track") === id, "track selection did not update URL state");
    assert(await target.getAttribute("class").then(value => value.includes("active")), "selected track did not become active");
    await page.goto(`${baseUrl}/music/?track=${encodeURIComponent(id)}`, { waitUntil: "domcontentloaded" });
    const deep = page.locator(`.track-item[data-track-id="${id}"]`);
    assert((await deep.getAttribute("class")).includes("active"), "deep-linked track was not selected");
    assert(await page.locator("#audio").evaluate(audio => audio.paused), "deep-linked track autoplayed");
    const shuffle = page.locator("#shuffleBtn");
    await shuffle.click();
    assert(await shuffle.getAttribute("aria-pressed") === "true", "shuffle active state is not exposed");
    const repeat = page.locator("#repeatBtn");
    await repeat.click();
    assert(await repeat.getAttribute("aria-pressed") === "true", "repeat active state is not exposed");
    assert(await repeat.getAttribute("data-repeat-mode") === "library", "repeat mode did not advance");
    const mute = page.locator("#muteBtn");
    await mute.click();
    assert(await mute.getAttribute("aria-pressed") === "true", "mute active state is not exposed");
    await page.locator("#stopBtn").click();
    assert(await page.locator("#stopBtn").getAttribute("aria-pressed") === "true", "stopped playback state is not exposed");
    await page.goto(`${baseUrl}/music/?track=__invalid__`, { waitUntil: "domcontentloaded" });
    assert(new URL(page.url()).searchParams.get("track") !== "__invalid__", "invalid track state was not normalized");
    assert(await page.locator(".track-item.active").count() === 1, "invalid track state did not fall back safely");
    return "selection, artwork state, import-control association, command states, valid/invalid deep links and no-autoplay passed";
  } finally { await context.close(); }
}

async function runVideosTest(browser, baseUrl) {
  const { context, page } = await preparePage(browser, baseUrl, 1440);
  try {
    await page.goto(`${baseUrl}/videos/`, { waitUntil: "domcontentloaded" });
    const measureCards = async () => ({
      count: await page.locator(".videos-library-card").count(),
      width: await page.locator(".videos-library-card").first().evaluate(element => element.getBoundingClientRect().width)
    });
    const selectCategory = value => page.locator("#videoCategorySelect").evaluate((select, next) => {
      select.value = next;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
    const eight = await measureCards();
    assert(eight.count === 8, `expected full page of 8 cards, received ${eight.count}`);
    await selectCategory("tiberian-dawn");
    await page.locator(".videos-subtab").nth(1).click();
    const one = await measureCards();
    assert(one.count === 1, `expected 1-card playlist fixture, received ${one.count}`);
    await selectCategory("starcraft-2");
    const two = await measureCards();
    assert(two.count === 2, `expected 2-card playlist fixture, received ${two.count}`);
    await page.evaluate(() => {
      const category = window.KRISPY_VIDEO_DATA.categories.find(item => item.id === "tiberian-dawn");
      category.subTabs[2].items.splice(6);
    });
    await selectCategory("tiberian-dawn");
    await page.locator(".videos-subtab").nth(2).click();
    const six = await measureCards();
    assert(six.count === 6, `expected 6-card resilience fixture, received ${six.count}`);
    [one, two, six].forEach(sample => assert(Math.abs(sample.width - eight.width) < 1, `video card width changed with result count (${sample.width} vs ${eight.width})`));
    await selectCategory("latest");
    const first = page.locator(".videos-thumb-button").first();
    assert(await first.count() === 1, "video cards missing");
    await first.click();
    const selectedUrl = new URL(page.url());
    const id = selectedUrl.searchParams.get("video");
    assert(Boolean(id), "video selection did not update URL state");
    assert(!(await page.locator("#videosSelectedState").evaluate(element => element.hidden)), "selected video state stayed hidden");
    await page.goto(`${baseUrl}/videos/?video=${encodeURIComponent(id)}`, { waitUntil: "domcontentloaded" });
    assert(!(await page.locator("#videosSelectedState").evaluate(element => element.hidden)), "video deep link did not load selected state");
    await page.goto(`${baseUrl}/videos/?video=__invalid__`, { waitUntil: "domcontentloaded" });
    assert(new URL(page.url()).searchParams.get("video") !== "__invalid__", "invalid video state was not normalized");
    assert(await page.locator(".videos-library-card").count() > 0, "video library became incoherent after invalid state");
    return "stable 1/2/6/8-card sizing, selection and valid/invalid deep links passed";
  } finally { await context.close(); }
}

async function runTournamentTest(browser, baseUrl) {
  const { context, page } = await preparePage(browser, baseUrl, 1024);
  try {
    await page.goto(`${baseUrl}/tournaments/`, { waitUntil: "domcontentloaded" });
    const events = await page.evaluate(() => window.KRISPY_TOURNAMENTS?.events?.map(event => ({
      id: event.id,
      title: event.title,
      status: event.status,
      lastUpdated: event.lastUpdated,
      aliasedPlayer: event.players?.find(player => player.inGameName && player.inGameName !== player.name)
    })) || []);
    assert(events.length >= 2, "current and historical tournaments are not both available");
    assert(new Set(events.map(event => event.id)).size === events.length, "tournament IDs are not distinct");
    const current = events.find(event => event.status === "live" || event.status === "awaiting-results");
    const historical = events.find(event => event.status === "completed");
    assert(Boolean(current && historical), "current lifecycle and completed tournament states are required");
    await page.goto(`${baseUrl}/tournaments/?event=${encodeURIComponent(current.id)}`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.removeItem("krispykp:tournaments:hide-live-results"));
    await page.reload({ waitUntil: "domcontentloaded" });
    const spoilerToggle = page.locator(".tournament-spoiler-toggle");
    assert(await spoilerToggle.count() === 1, "active incomplete tournament spoiler control missing");
    assert(await spoilerToggle.getAttribute("aria-pressed") === "false", "active incomplete tournament results were hidden by default");
    assert(await page.locator("#tournamentPlayers .tournament-player-item").count() > 0, "non-spoiler participant information is missing");
    await spoilerToggle.focus();
    await page.keyboard.press("Enter");
    assert(await spoilerToggle.getAttribute("aria-pressed") === "true", "keyboard spoiler control did not expose its hidden state");
    assert(await page.locator("#tournamentContent").getAttribute("data-spoilers-hidden") === "true", "spoiler presentation state was not applied");
    assert(await page.locator("#tournamentBracketBody").evaluate(element => getComputedStyle(element).display === "none" && element.inert && element.getAttribute("aria-hidden") === "true"), "spoiler mode left bracket progression exposed");
    await page.reload({ waitUntil: "domcontentloaded" });
    assert(await page.locator(".tournament-spoiler-toggle").getAttribute("aria-pressed") === "true", "spoiler preference did not persist after refresh");
    await page.locator(".tournament-spoiler-toggle").click();
    assert(await page.locator("#tournamentBracketBody").evaluate(element => !element.inert && !element.hasAttribute("aria-hidden")), "show results did not restore bracket accessibility");
    if (current.status === "awaiting-results") {
      assert((await page.locator("#tournamentHeroMeta").textContent()).includes("Awaiting Results"), "awaiting-results state is not explicit");
    }
    assert(await page.locator("#tournamentQuickInfo > li").count() === 6, "Last Updated was left as a seventh detail-grid cell");
    if (current.lastUpdated) assert(await page.locator("#tournamentLastUpdated time").count() === 1, "Last Updated metadata is missing");
    const heroActions = page.locator("#tournamentHeroActions");
    assert(await heroActions.evaluate(element => parseFloat(getComputedStyle(element).backgroundColor.slice(5)) !== 0 || getComputedStyle(element).backgroundImage !== "none"), "hero actions lack an opaque action surface");
    assert(await page.locator("#tournamentPlayers .tournament-player-item").count() > 0, "current participant information is missing");
    assert(await page.locator("#tournamentBracketBody .tournament-manual-match").count() > 0, "current bracket has no matches");
    await page.goto(`${baseUrl}/tournaments/?event=${encodeURIComponent(historical.id)}`, { waitUntil: "domcontentloaded" });
    const renderedTitle = (await page.locator("#tournamentTitle").textContent()).trim();
    assert(renderedTitle === historical.title, `event deep link selected '${renderedTitle}' instead of '${historical.title}'`);
    assert(await page.locator("#tournamentContent").getAttribute("data-spoilers-hidden") === "false", "historical event inherited live spoiler hiding");
    assert(await page.locator(".tournament-spoiler-toggle").count() === 0, "historical event exposed a live-only spoiler control");
    assert(await page.locator("#tournamentBracketBody .tournament-manual-match").count() > 0, "historical results were not rendered");
    if (historical.aliasedPlayer) {
      const playerText = await page.locator("#tournamentPlayers").textContent();
      assert(playerText.includes(historical.aliasedPlayer.inGameName), "historical alias is not the archived participant's primary identity");
      assert(playerText.includes(`Canonical identity: ${historical.aliasedPlayer.name}`), "historical canonical identity is not preserved as secondary context");
      const outcomeText = `${await page.locator("#tournamentBracketBody").textContent()} ${await page.locator("#tournamentResultsSection").textContent()} ${await page.locator("#tournamentStageSection").textContent()}`;
      assert(outcomeText.includes(historical.aliasedPlayer.inGameName), "historical aliases were not applied consistently to outcome presentation");
    }
    await page.goBack({ waitUntil: "domcontentloaded" });
    assert(new URL(page.url()).searchParams.get("event") === current.id, "browser Back did not restore the current event deep link");
    await page.goForward({ waitUntil: "domcontentloaded" });
    assert(new URL(page.url()).searchParams.get("event") === historical.id, "browser Forward did not restore the historical event deep link");
    const fallbackPage = await context.newPage();
    await fallbackPage.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new Error("storage unavailable"); };
      Storage.prototype.setItem = () => { throw new Error("storage unavailable"); };
    });
    await fallbackPage.goto(`${baseUrl}/tournaments/?event=${encodeURIComponent(current.id)}`, { waitUntil: "domcontentloaded" });
    const fallbackToggle = fallbackPage.locator(".tournament-spoiler-toggle");
    await fallbackToggle.click();
    assert(await fallbackPage.locator("#tournamentContent").getAttribute("data-spoilers-hidden") === "true", "spoiler control failed when storage was unavailable");
    await fallbackPage.close();
    await page.goto(`${baseUrl}/tournaments/?event=__invalid__`, { waitUntil: "domcontentloaded" });
    assert(new URL(page.url()).searchParams.get("event") !== "__invalid__", "invalid event state was not normalized");
    const banner = page.locator("#tournamentHeroBackdrop");
    assert(await banner.count() === 1, "tournament banner surface missing");
    return `${events.length} events, active spoiler control/persistence/fallback, historical identity, metadata, Back/Forward, deep-link fallback and banner surface passed`;
  } finally { await context.close(); }
}

async function runRadarTest(browser, baseUrl, root, screenshots) {
  const { context, page } = await preparePage(browser, baseUrl, 1440);
  const capture = async name => {
    if (!screenshots) return;
    const directory = path.join(root, ".validation", "screenshots", "radar");
    fs.mkdirSync(directory, { recursive: true });
    await page.screenshot({ path: path.join(directory, `${name}.png`) });
  };
  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    assert(await page.locator(".radar-game-trigger").count() === 1, "Radar trigger missing");
    await page.setViewportSize({ width: 1199, height: 1000 });
    await page.waitForTimeout(50);
    assert(await page.locator(".radar-game-trigger").isDisabled(), "1199x1000 incorrectly offers Radar");
    await capture("gate-1199x1000-unsupported");
    await page.setViewportSize({ width: 1200, height: 999 });
    await page.waitForTimeout(50);
    assert(await page.locator(".radar-game-trigger").isDisabled(), "1200x999 incorrectly offers Radar");
    await capture("gate-1200x999-unsupported");
    await page.setViewportSize({ width: 1200, height: 1000 });
    await page.waitForTimeout(50);
    assert(await page.locator(".radar-game-trigger").isEnabled(), "1200x1000 did not offer Radar");
    await capture("gate-1200x1000-supported");
    assert(await page.evaluate(() => window.KRISPY_RADAR_GAME?.getState() === "idle"), "Radar was active before activation");
    assert(await page.locator(".radar-game-overlay").count() === 0, "Radar created its simulation UI before activation");
    await page.locator(".radar-game-trigger").click();
    await page.waitForFunction(() => document.body.dataset.radarGameState === "menu", null, { timeout: 4000 });
    const menuSnapshot = await page.evaluate(() => window.KRISPY_RADAR_GAME.getSnapshot());
    assert(menuSnapshot.simulation === null && menuSnapshot.animationActive === false, "Radar menu started simulation or a gameplay animation loop");
    assert(await page.locator('[data-action="start"]').isVisible(), "Radar start control missing");
    assert((await page.locator("[data-panel='start']").textContent()).includes("1.5.0"), "Radar menu lost the 1.5.0 version");
    assert((await page.locator("[data-panel='start']").textContent()).includes("same units and balance"), "faction symmetry note missing");
    await page.locator('[data-action="help"]').click();
    assert(await page.locator("[data-start-help]").isVisible(), "Radar menu help did not open");
    await page.locator('[data-action="exit"]').first().click();
    await page.waitForFunction(() => window.KRISPY_RADAR_GAME.getState() === "idle");
    await page.locator(".radar-game-trigger").click();
    await page.waitForFunction(() => window.KRISPY_RADAR_GAME.getState() === "menu");
    await page.locator('[data-action="start"]').click();
    await page.waitForFunction(() => document.body.dataset.radarGameState === "playing", null, { timeout: 4000 });
    assert(await page.locator(".radar-game-screen").count() === 1, "Radar activation lost the battlefield canvas");
    assert(await page.locator(".radar-rts-minimap").count() === 1, "Radar minimap missing");
    assert(await page.locator(".radar-rts-command [data-hud=credits]").isVisible(), "sidebar lost credits");
    assert(await page.locator(".radar-rts-command [data-power-cell]").isVisible(), "sidebar lost power");
    const initial = await page.evaluate(() => window.KRISPY_RADAR_GAME.getSnapshot());
    assert(initial.simulation.structures.some(item => item.type === "hq" && item.side === "player"), "player Command Hub missing");
    assert(initial.simulation.structures.some(item => item.type === "hq" && item.side === "enemy"), "enemy Command Hub missing");
    assert(initial.simulation.resources.length >= 4, "resource fields missing");
    const buildStarted = await page.evaluate(() => window.KRISPY_RADAR_GAME.command.startStructure("powerPlant"));
    assert(buildStarted.available, "browser construction command did not start");
    await page.waitForTimeout(200);
    assert((await page.locator('[data-hud="construction"]').textContent()).includes("Pulse Reactor"), "HUD does not identify current construction");
    assert(Number(await page.locator('[data-progress="construction"]').getAttribute("value")) > 0, "construction progress did not become visible");
    await page.locator('[data-action="restart"]').first().click();
    await page.locator('[data-action="pause"]').first().click();
    assert(await page.evaluate(() => window.KRISPY_RADAR_GAME.getState() === "paused"), "Radar pause control failed");
    const pausedTime = await page.evaluate(() => window.KRISPY_RADAR_GAME.getSnapshot().simulation.time);
    await page.waitForTimeout(250);
    assert(await page.evaluate(t => window.KRISPY_RADAR_GAME.getSnapshot().simulation.time === t, pausedTime), "Radar simulation advanced while paused");
    await page.locator('[data-action="resume"]').click();
    assert(await page.evaluate(() => window.KRISPY_RADAR_GAME.getState() === "playing"), "Radar resume control failed");
    await page.waitForTimeout(150);
    assert(await page.evaluate(t => window.KRISPY_RADAR_GAME.getSnapshot().simulation.time > t, pausedTime), "Radar simulation did not resume");
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    assert(await page.evaluate(() => window.KRISPY_RADAR_GAME.getState() === "paused"), "focus loss did not pause Radar");
    await page.evaluate(() => window.KRISPY_RADAR_GAME.resume());
    const beforeResize = await page.evaluate(() => window.KRISPY_RADAR_GAME.getSnapshot());
    await page.setViewportSize({ width: 1199, height: 1000 }); await page.waitForTimeout(120);
    assert(await page.locator('[data-panel="viewport"]').isVisible(), "undersized live viewport message missing");
    assert(await page.evaluate(() => window.KRISPY_RADAR_GAME.getState() === "paused"), "undersized viewport did not pause");
    assert((await page.evaluate(() => window.KRISPY_RADAR_GAME.getSnapshot().simulation.structures.length)) === beforeResize.simulation.structures.length, "undersized viewport changed entities");
    await page.setViewportSize({ width: 1200, height: 1000 }); await page.waitForTimeout(120);
    assert(await page.evaluate(() => window.KRISPY_RADAR_GAME.getState() === "playing"), "restored viewport did not resume");
    await page.keyboard.press("Escape");
    assert(await page.evaluate(() => window.KRISPY_RADAR_GAME.getState() === "paused"), "Escape did not open game menu");
    assert(await page.locator('[data-panel="pause"]').isVisible(), "Escape game menu not visible");
    await page.locator('[data-panel="pause"] [data-action="resume"]').click();
    assert(await page.evaluate(() => window.KRISPY_RADAR_GAME.getState() === "playing"), "game menu resume failed");
    await page.keyboard.press("Escape");
    await page.locator('[data-panel="pause"] [data-action="quit-match"]').click();
    assert(await page.evaluate(() => window.KRISPY_RADAR_GAME.getState() === "menu"), "Quit match did not return to Command");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => document.body.dataset.radarGameState === "idle", null, { timeout: 4000 });
    await page.locator(".radar-game-trigger").click(); await page.waitForFunction(() => document.body.dataset.radarGameState === "menu");
    assert(await page.locator(".radar-game-overlay").count() === 1, "repeated activation duplicated the overlay");
    await page.locator('[data-action="exit"]').first().click(); await page.waitForFunction(() => window.KRISPY_RADAR_GAME.getState() === "idle");
    for (const route of Object.values(routeTable(root))) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      assert(await page.locator(".radar-game-trigger").count() === 1, `Radar trigger missing on ${route}`);
      assert(await page.evaluate(() => window.KRISPY_RADAR_GAME.getState() === "idle"), `Radar active by default on ${route}`);
    }
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator(".radar-game-trigger").click();
    await page.waitForFunction(() => window.KRISPY_RADAR_GAME.getState() === "menu");
    await page.locator('[data-action="exit"]').first().click();
    await page.waitForFunction(() => window.KRISPY_RADAR_GAME.getState() === "idle");
    return "exact desktop gate, dormancy/start menu, RTS world, strategic build HUD, pause/focus/resume, live resize preservation, overflow, reduced motion, Command menu/Escape choices, cleanup, repeated activation and all-public-route availability passed";
  } finally { await context.close(); }
}

export async function runBrowserValidation({ root = ROOT, profile = "standard", scope = null, pages = null, screenshots = false } = {}) {
  const resolvedScope = scope || detectScope({ root });
  const result = createResult(profile, resolvedScope);
  result.kind = "browser";
  result.manual.push("Chromium automation does not prove subjective visual quality, physical touch, screen-reader quality, true zoom, non-Chromium behavior, hidden-tab behavior or external service delivery.");
  const executablePath = findChromiumExecutable();
  if (!executablePath) {
    record(result, "browser:launch", false, { message: "No Edge/Chrome/Chromium executable found; set PLAYWRIGHT_CHROMIUM_EXECUTABLE." });
    return result;
  }

  const affected = pages || resolvedScope.pages;
  const matrix = matrixFor(profile, affected, pages, root);
  const { server, baseUrl } = await createStaticServer(root);
  let browser;
  try {
    browser = await chromium.launch({ executablePath, headless: true });
    record(result, "browser:launch", true, { message: executablePath });
    for (const item of matrix) await checkPage(browser, baseUrl, root, result, item.page, item.width, screenshots);
    if (fs.existsSync(path.join(root, 'data/site-management.json'))) {
      const { checkBindings } = await import('./management/render.mjs');
      await functionalCase(result, 'management-bindings', () => checkBindings(browser, baseUrl, root));
    }
    if (fs.existsSync(path.join(root, 'data/site-layout.json'))) {
      const { checkLayout } = await import('./layout/render.mjs');
      await functionalCase(result, 'layout-contract', () => checkLayout(browser, baseUrl, root));
    }

    if (fs.existsSync(path.join(root, "data/site-pages-contract.json"))) {
      const {checkPageFoundation}=await import("./pages/render.mjs");
      await functionalCase(result,"page-foundation",()=>checkPageFoundation(browser,baseUrl,root));
    }

    const functionalPages = profile === "acceptance" ? Object.keys(routeTable(root)) : (pages || resolvedScope.pages);
    if (profile !== "smoke") {
      if (functionalPages.includes("home")) {
        await functionalCase(result, "home", () => runHomeTest(browser, baseUrl));
        await functionalCase(result, "home-layout", () => runHomeLayoutTest(browser, baseUrl, root, screenshots));
      }
      if (functionalPages.includes("music")) await functionalCase(result, "music", () => runMusicTest(browser, baseUrl));
      if (functionalPages.includes("videos")) await functionalCase(result, "videos", () => runVideosTest(browser, baseUrl));
      if (functionalPages.includes("tournaments")) await functionalCase(result, "tournaments", () => runTournamentTest(browser, baseUrl));
      if (profile === "acceptance" || resolvedScope.files.some(file => /radar-game|site-ui|command-deck/.test(file))) {
        const captureDir = screenshots ? path.join(root, ".validation", "screenshots", "radar") : null;
        if (captureDir) fs.mkdirSync(captureDir, { recursive: true });
        await functionalCase(result, "radar", () => runRadarTest(browser, baseUrl, root, screenshots));
        await functionalCase(result, "radar-remediation-2", () => validateRadarRemediation(browser, baseUrl, { captureDir }));
        await functionalCase(result, "radar-desktop-1.3", () => validateRadarDesktop(browser, baseUrl, { captureDir }));
        await functionalCase(result, "radar-controls-1.4", () => validateRadarControls(browser, baseUrl, { captureDir }));
      }
    }
  } catch (error) {
    record(result, "browser:harness", false, { message: error.stack || error.message });
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  return result;
}

function print(result) {
  const cases = result.checks.filter(check => check.name.startsWith("browser:") && /:\d+$/.test(check.name)).length;
  if (result.status === "PASS") console.log(`BROWSER PASS — ${cases} page/viewport cases, ${result.checks.length - cases - 1} functional checks`);
  else {
    console.error(`BROWSER FAIL — ${result.failures.length} failure${result.failures.length === 1 ? "" : "s"}`);
    result.failures.forEach(failure => console.error(`- ${failure.name}: ${failure.message || "failed"}`));
  }
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = await runBrowserValidation(options);
    print(result);
    process.exitCode = result.status === "PASS" ? 0 : 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
