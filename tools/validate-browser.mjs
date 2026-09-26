import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import {
  ALL_PAGES,
  PAGE_ROUTES,
  PROFILE_VIEWPORTS,
  ROOT,
  createResult,
  detectScope,
  findChromiumExecutable,
  parseArgs,
  record
} from "./validation-common.mjs";

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

function createStaticServer(root) {
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

function matrixFor(profile, affectedPages, explicitPages) {
  if (explicitPages) return explicitPages.flatMap(page => PROFILE_VIEWPORTS[profile].map(width => ({ page, width })));
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
  const route = PAGE_ROUTES[pageName];
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
    const events = await page.evaluate(() => window.KRISPY_TOURNAMENTS?.events?.map(event => ({ id: event.id, title: event.title, status: event.status })) || []);
    assert(events.length >= 2, "current and historical tournaments are not both available");
    assert(new Set(events.map(event => event.id)).size === events.length, "tournament IDs are not distinct");
    const current = events.find(event => event.status === "live" || event.status === "awaiting-results");
    const historical = events.find(event => event.status === "completed");
    assert(Boolean(current && historical), "current lifecycle and completed tournament states are required");
    await page.goto(`${baseUrl}/tournaments/?event=${encodeURIComponent(current.id)}`, { waitUntil: "domcontentloaded" });
    if (current.status === "live") {
      const spoilerToggle = page.locator(".tournament-spoiler-toggle");
      assert(await spoilerToggle.count() === 1, "live tournament spoiler control missing");
      assert(await spoilerToggle.getAttribute("aria-pressed") === "false", "live tournament results were hidden by default");
      await spoilerToggle.click();
      assert(await spoilerToggle.getAttribute("aria-pressed") === "true", "spoiler control did not expose its hidden state");
      assert(await page.locator("#tournamentContent").getAttribute("data-spoilers-hidden") === "true", "spoiler presentation state was not applied");
      assert(await page.locator("#tournamentBracketBody").evaluate(element => getComputedStyle(element).display === "none"), "spoiler mode left bracket progression visible");
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator(".tournament-spoiler-toggle").click();
    } else {
      assert((await page.locator("#tournamentHeroMeta").textContent()).includes("Awaiting Results"), "awaiting-results state is not explicit");
      assert(await page.locator(".tournament-spoiler-toggle").count() === 0, "awaiting-results event exposed a live-only spoiler control");
      assert(await page.locator("#tournamentResultsSection").evaluate(element => element.hidden), "awaiting-results event published incomplete results");
    }
    assert(await page.locator("#tournamentPlayers .tournament-player-item").count() > 0, "current participant information is missing");
    assert(await page.locator("#tournamentBracketBody .tournament-manual-match").count() > 0, "current bracket has no matches");
    await page.goto(`${baseUrl}/tournaments/?event=${encodeURIComponent(historical.id)}`, { waitUntil: "domcontentloaded" });
    const renderedTitle = (await page.locator("#tournamentTitle").textContent()).trim();
    assert(renderedTitle === historical.title, `event deep link selected '${renderedTitle}' instead of '${historical.title}'`);
    assert(await page.locator("#tournamentContent").getAttribute("data-spoilers-hidden") === "false", "historical event inherited live spoiler hiding");
    assert(await page.locator(".tournament-spoiler-toggle").count() === 0, "historical event exposed a live-only spoiler control");
    assert(await page.locator("#tournamentBracketBody .tournament-manual-match").count() > 0, "historical results were not rendered");
    await page.goBack({ waitUntil: "domcontentloaded" });
    assert(new URL(page.url()).searchParams.get("event") === current.id, "browser Back did not restore the current event deep link");
    await page.goForward({ waitUntil: "domcontentloaded" });
    assert(new URL(page.url()).searchParams.get("event") === historical.id, "browser Forward did not restore the historical event deep link");
    if (current.status === "live") {
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
    }
    await page.goto(`${baseUrl}/tournaments/?event=__invalid__`, { waitUntil: "domcontentloaded" });
    assert(new URL(page.url()).searchParams.get("event") !== "__invalid__", "invalid event state was not normalized");
    const banner = page.locator("#tournamentHeroBackdrop");
    assert(await banner.count() === 1, "tournament banner surface missing");
    return `${events.length} events, current lifecycle, results isolation, Back/Forward, deep-link fallback and banner surface passed`;
  } finally { await context.close(); }
}

async function runRadarTest(browser, baseUrl) {
  const { context, page } = await preparePage(browser, baseUrl, 1024);
  try {
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    assert(await page.locator(".radar-game-overlay").count() === 1, "Radar overlay missing");
    assert(await page.evaluate(() => window.KRISPY_RADAR_GAME?.getState() === "idle"), "Radar was active before activation");
    assert(await page.locator(".radar-game-overlay").evaluate(element => element.hidden), "Radar overlay visible before activation");
    await page.locator(".radar-game-trigger").click();
    await page.waitForFunction(() => document.body.dataset.radarGameState === "playing", null, { timeout: 4000 });
    assert(await page.locator(".radar-game-canvas").count() === 1, "Radar activation duplicated or lost the core canvas");
    assert((await page.locator(".radar-game-hud").textContent()).includes("Armour"), "Radar HUD does not use British ARMOUR spelling");
    assert((await page.locator(".radar-game-hud").textContent()).includes("0.4.0"), "Radar HUD lost the 0.4.0 prototype version");
    assert(await page.locator(".radar-game-trigger").isVisible(), "active Radar exit trigger is not visible in its site corner");
    const desktopHelp = await page.evaluate(() => {
      const help = document.querySelector(".radar-game-help");
      const screen = document.querySelector(".radar-game-screen");
      return {
        before: help.getBoundingClientRect().bottom <= screen.getBoundingClientRect().top + 1,
        fontSize: parseFloat(getComputedStyle(help).fontSize)
      };
    });
    assert(desktopHelp.before && desktopHelp.fontSize >= 16, "desktop Radar instructions are not large and above the battlefield");
    await page.locator('[data-game-action="pause"]').click();
    assert(await page.evaluate(() => window.KRISPY_RADAR_GAME.getState() === "paused"), "Radar pause control failed");
    await page.locator('[data-game-action="resume"]').click();
    assert(await page.evaluate(() => window.KRISPY_RADAR_GAME.getState() === "playing"), "Radar resume control failed");
    assert(await page.locator(".radar-game-top-exit").isVisible(), "desktop top-screen Radar exit is not visible");
    await page.locator(".radar-game-top-exit").click();
    await page.waitForFunction(() => document.body.dataset.radarGameState === "idle", null, { timeout: 4000 });
    await page.locator(".radar-game-trigger").click();
    await page.waitForFunction(() => document.body.dataset.radarGameState === "playing", null, { timeout: 4000 });
    await page.locator(".radar-game-trigger").click();
    await page.waitForFunction(() => document.body.dataset.radarGameState === "idle", null, { timeout: 4000 });
    await page.locator(".radar-game-trigger").click();
    await page.waitForFunction(() => document.body.dataset.radarGameState === "playing", null, { timeout: 4000 });
    assert(await page.locator(".radar-game-overlay").count() === 1, "repeated activation duplicated the overlay");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => document.body.dataset.radarGameState === "idle", null, { timeout: 4000 });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator(".radar-game-trigger").click();
    await page.waitForFunction(() => document.body.dataset.radarGameState === "playing", null, { timeout: 4000 });
    assert(await page.locator(".radar-game-screen").evaluate(el => el.getBoundingClientRect().height >= 250), "portrait Radar battlefield is too short");
    assert(await page.locator(".radar-game-trigger").isVisible(), "portrait Radar corner exit is not visible");
    assert(!(await page.locator(".radar-game-top-exit").isVisible()), "portrait Radar unexpectedly shows the desktop/landscape top exit");
    const twoThumb = await page.evaluate(() => {
      const move = document.querySelector('[data-game-joystick="move"]');
      const aim = document.querySelector('[data-game-joystick="aim"]');
      const moveKnob = move.querySelector(".radar-game-joystick-knob");
      const aimKnob = aim.querySelector(".radar-game-joystick-knob");
      const mr = move.getBoundingClientRect();
      const ar = aim.getBoundingClientRect();
      const emit = (target, type, pointerId, x, y) => target.dispatchEvent(new PointerEvent(type, {
        bubbles: true, pointerId, pointerType: "touch", clientX: x, clientY: y
      }));
      emit(move, "pointerdown", 11, mr.left + mr.width / 2, mr.top + mr.height / 2);
      emit(aim, "pointerdown", 12, ar.left + ar.width / 2, ar.top + ar.height / 2);
      emit(move, "pointermove", 11, mr.right - 8, mr.top + mr.height / 2);
      emit(aim, "pointermove", 12, ar.left + 8, ar.top + ar.height / 2);
      const changed = moveKnob.style.transform !== "translate(-50%, -50%)" && aimKnob.style.transform !== "translate(-50%, -50%)";
      emit(move, "pointerup", 11, mr.right - 8, mr.top + mr.height / 2);
      emit(aim, "pointerup", 12, ar.left + 8, ar.top + ar.height / 2);
      return changed && moveKnob.style.transform === "translate(-50%, -50%)" && aimKnob.style.transform === "translate(-50%, -50%)";
    });
    assert(twoThumb, "independent two-thumb move and aim/fire controls did not operate and reset together");
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(100);
    assert(await page.locator(".radar-game-screen").evaluate(el => el.getBoundingClientRect().height >= 200), "landscape Radar battlefield collapsed after orientation resize");
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), "Radar orientation transition caused document overflow");
    assert(await page.locator(".radar-game-top-exit").isVisible(), "landscape top Radar exit is not visible");
    assert(!(await page.locator(".radar-game-fire").isVisible()), "landscape retained the separate Fire button");
    assert(!(await page.locator(".radar-game-trigger").isVisible()), "landscape retained the corner exit instead of the top control");
    await page.locator(".radar-game-top-exit").click();
    await page.waitForFunction(() => document.body.dataset.radarGameState === "idle", null, { timeout: 4000 });
    return "inactive, pause/resume, both desktop exits, Escape, repeated activation, portrait/landscape controls, resize and overflow passed";
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
  const matrix = matrixFor(profile, affected, pages);
  const { server, baseUrl } = await createStaticServer(root);
  let browser;
  try {
    browser = await chromium.launch({ executablePath, headless: true });
    record(result, "browser:launch", true, { message: executablePath });
    for (const item of matrix) await checkPage(browser, baseUrl, root, result, item.page, item.width, screenshots);

    const functionalPages = profile === "acceptance" ? ALL_PAGES : (pages || resolvedScope.pages);
    if (profile !== "smoke") {
      if (functionalPages.includes("home")) {
        await functionalCase(result, "home", () => runHomeTest(browser, baseUrl));
        await functionalCase(result, "home-layout", () => runHomeLayoutTest(browser, baseUrl, root, screenshots));
      }
      if (functionalPages.includes("music")) await functionalCase(result, "music", () => runMusicTest(browser, baseUrl));
      if (functionalPages.includes("videos")) await functionalCase(result, "videos", () => runVideosTest(browser, baseUrl));
      if (functionalPages.includes("tournaments")) await functionalCase(result, "tournaments", () => runTournamentTest(browser, baseUrl));
      if (profile === "acceptance" || resolvedScope.files.some(file => /radar-game|site-ui|command-deck/.test(file))) {
        await functionalCase(result, "radar", () => runRadarTest(browser, baseUrl));
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
