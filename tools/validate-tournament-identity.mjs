import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

export async function validateTournamentIdentity(browser, baseUrl, { root, captureDir = null }) {
  let eventCases = 0;
  let matchCases = 0;
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    try {
      await context.route("**/*", route => {
        if (route.request().url().startsWith(baseUrl)) return route.continue();
        return route.abort("blockedbyclient");
      });
      // A unique sentinel proves omission by field, beyond the known phrase scan.
      await context.route("**/data/tournaments.config.js", route => route.fulfill({
        contentType: "text/javascript; charset=utf-8",
        body: fs.readFileSync(path.join(root, "data/tournaments.config.js"), "utf8") + `\n
          for (const event of window.KRISPY_TOURNAMENTS.events) {
            for (const player of event.players) player.provenance = "PRIVATE_AUDIT_SENTINEL_PLAYER";
            for (const result of event.results) result.provenance = "PRIVATE_AUDIT_SENTINEL_RESULT";
            for (const group of event.manualBracketGroups) for (const round of group.rounds)
              for (const match of round.matches) match.provenance = (match.provenance || "") + " PRIVATE_AUDIT_SENTINEL_MATCH";
          }`
      }));
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(`${baseUrl}/tournaments/`, { waitUntil: "domcontentloaded" });
      const events = await page.evaluate(() => window.KRISPY_TOURNAMENTS.events);
      for (const event of events) {
        const references = new Map();
        const currentNames = event.players.map(player => player.name.trim());
        const aliasOwners = new Map();
        for (const player of events.flatMap(item => item.players)) {
          if (!currentNames.includes(player.name.trim()) || !player.inGameName) continue;
          const key = player.inGameName.trim().toLowerCase();
          if (!aliasOwners.has(key)) aliasOwners.set(key, new Set());
          aliasOwners.get(key).add(player.name.trim());
        }
        for (const [alias, names] of aliasOwners) if (names.size === 1) references.set(alias, [...names][0]);
        for (const player of event.players) references.set(player.name.trim().toLowerCase(), player.name.trim());
        const canonical = value => references.get(String(value).trim().toLowerCase()) || String(value).trim();
        const stageIdentity = value => {
          const parts = value.match(/^(.+?)(\s+[—–-]\s+.*)$/);
          return parts ? canonical(parts[1]) + parts[2] : canonical(value);
        };
        await page.goto(`${baseUrl}/tournaments/?event=${encodeURIComponent(event.id)}`, { waitUntil: "domcontentloaded" });
        // Open the ordinary mobile disclosures so every public surface is rendered.
        await page.locator("#tournamentContent details").evaluateAll(elements => elements.forEach(element => element.open = true));
        const rendered = await page.evaluate(() => ({
          names: [...document.querySelectorAll("#tournamentPlayers .tournament-player-name")].map(element => element.textContent.trim()),
          aliases: [...document.querySelectorAll("#tournamentPlayers .tournament-player-in-game-name")].map(element => element.textContent.trim()),
          matches: [...document.querySelectorAll(".tournament-manual-match")].map(element => ({
            id: element.dataset.matchId,
            names: [...element.querySelectorAll(".tournament-manual-player-name")].map(item => item.textContent.trim()),
            scores: [...element.querySelectorAll(".tournament-manual-player-score")].map(item => item.textContent.trim()),
            winner: element.querySelector(".tournament-manual-match-footer > span:last-child").textContent.trim(),
            note: element.querySelector(".tournament-manual-match-top > span:last-child").textContent.trim()
          })),
          results: [...document.querySelectorAll(".tournament-result-name")].map(element => element.textContent.trim()),
          stages: [...document.querySelectorAll(".tournament-stage-summary li")].map(element => element.textContent.trim()),
          body: document.body.innerText,
          html: document.getElementById("tournamentContent").outerHTML,
          structured: [...document.querySelectorAll('script[type="application/ld+json"]')].map(element => element.textContent).join(" "),
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          aliasesSecondary: [...document.querySelectorAll(".tournament-player-item")].every(element => !element.querySelector(".tournament-player-main .tournament-player-in-game-name"))
        }));
        // Ignore surrounding display whitespace while preserving owner source strings.
        assert.deepEqual(rendered.names, event.players.map(player => player.name.trim()), `${event.id}/${width}: canonical participant names`);
        assert.deepEqual(rendered.aliases, event.players.map(player => player.inGameName?.trim()).filter(Boolean), `${event.id}/${width}: secondary aliases retained`);
        assert(rendered.aliasesSecondary, `${event.id}/${width}: alias moved into primary identity`);
        const matches = event.manualBracketGroups.flatMap(group => group.rounds.flatMap(round => round.matches));
        assert.equal(rendered.matches.length, matches.length, `${event.id}/${width}: match count`);
        for (const match of matches) {
          const actual = rendered.matches.find(item => item.id === match.id);
          assert(actual, `missing match ${event.id}/${match.id}`);
          assert.deepEqual(actual.names, [canonical(match.player1 || "TBD"), canonical(match.player2 || "TBD")], `${event.id}/${match.id}: canonical entrants`);
          assert.deepEqual(actual.scores, [String(match.score1 ?? ""), String(match.score2 ?? "")], `${event.id}/${match.id}: scores unchanged`);
          assert.equal(actual.winner, match.winner ? `Winner: ${canonical(match.winner)}` : "", `${event.id}/${match.id}: canonical winner`);
          assert.equal(actual.note, (match.note || "").trim(), `${event.id}/${match.id}: public note preserved`);
          matchCases++;
        }
        assert.deepEqual(rendered.results, event.results.map(result => canonical(result.name)), `${event.id}/${width}: canonical results`);
        assert.deepEqual(rendered.stages, (event.stageSummaries || []).flatMap(stage => stage.entries.map(stageIdentity)), `${event.id}/${width}: canonical standings with authored scores/context retained`);
        if (event.id === "td-invasion-red-alert-2025") {
          assert.deepEqual(rendered.results, ["WTF", "TRIO"], "2025 stored result aliases must resolve to canonical players");
          assert(rendered.stages.includes("WTF — 12 pts (4-0-0)"), "2025 stored standings alias must resolve to canonical player");
          assert(rendered.stages.includes("DR.MURK — 1 pt (0-4-0)"), "2025 shortened alias must resolve via verified identity in another event");
        }
        if (event.id === "td-oceania-championship-2023") assert(rendered.matches.some(match => match.names.includes("NOBLE")), "NOBLESUB legacy references must resolve to canonical NOBLE");
        assert(!/PRIVATE_AUDIT_SENTINEL|screenshot evidence|reconstructed from screenshot|owner(?:-supplied historical)? recollection|uncertain source note|internal confidence note/i.test(`${rendered.body} ${rendered.html} ${rendered.structured}`), `${event.id}/${width}: internal provenance leaked`);
        assert(!rendered.overflow, `${event.id}/${width}: document overflows`);
        assert.equal(errors.length, 0, `${event.id}/${width}: runtime errors: ${errors.join(", ")}`);
        if (captureDir) {
          fs.mkdirSync(captureDir, { recursive: true });
          await page.locator("#tournamentPlayersCard").screenshot({ path: path.join(captureDir, `${event.id}-${width}-players.png`) });
          await page.locator("#tournamentBracketSection").screenshot({ path: path.join(captureDir, `${event.id}-${width}-bracket.png`) });
          if (event.results.length) await page.locator("#tournamentResultsSection").screenshot({ path: path.join(captureDir, `${event.id}-${width}-results.png`) });
          if (event.stageSummaries?.length) await page.locator("#tournamentStageSection").screenshot({ path: path.join(captureDir, `${event.id}-${width}-stages.png`) });
        }
        eventCases++;
      }
      await context.unroute("**/data/tournaments.config.js");
      await context.route("**/data/tournaments.config.js", route => route.fulfill({
        contentType: "text/javascript; charset=utf-8",
        body: fs.readFileSync(path.join(root, "data/tournaments.config.js"), "utf8") + `\n
          const fixture = structuredClone(window.KRISPY_TOURNAMENTS.events[0]);
          fixture.id = "identity-fixture"; fixture.status = "completed";
          fixture.players = [
            { name: "CANON_A", inGameName: "shared" },
            { name: "CANON_B", inGameName: "shared" },
            { name: "CANON_C", inGameName: "CANON_A" }
          ];
          fixture.manualBracketGroups = [{ key: "fixture", title: "Fixture", rounds: [{ title: "Final", matches: [
            { id: "fixture-match", title: "Final", player1: "shared", player2: "CANON_A", winner: "CANON_A", score1: "", score2: "" }
          ] }] }];
          fixture.results = [{ place: "1st", name: "CANON_A" }, { place: "2nd", name: "shared" }, { place: "3rd", name: "Unknown identity" }];
          fixture.stageSummaries = [{ title: "Fixture", entries: ["shared — 7 pts", "CANON_A — 8 pts", "Unknown identity — 2 pts"] }];
          window.KRISPY_TOURNAMENTS.events.push(fixture);`
      }));
      await page.goto(`${baseUrl}/tournaments/?event=identity-fixture`, { waitUntil: "domcontentloaded" });
      assert.deepEqual(await page.locator(".tournament-result-name").allTextContents(), ["CANON_A", "shared", "Unknown identity"], "canonical references outrank aliases; ambiguous/unknown references are not guessed");
      assert.deepEqual(await page.locator(".tournament-stage-summary li").allTextContents(), ["shared — 7 pts", "CANON_A — 8 pts", "Unknown identity — 2 pts"], "standings preserve ambiguous/unknown identity and authored context");
      assert.equal(await page.locator(".tournament-manual-player.is-winner .tournament-manual-player-name").textContent(), "CANON_A", "winner identity uses canonical priority");
    } finally { await context.close(); }
  }
  return `${eventCases} event/viewport cases, ${matchCases} matches; canonical cards/entrants/winners/results/standings, secondary aliases, public notes, unknown scores and rendered provenance omission passed`;
}
