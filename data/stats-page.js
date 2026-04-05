(function () {
  const STATS_CONFIG = {
    proxyBase: "https://script.google.com/macros/s/AKfycbxAGb2VAsGBuilkko3eW-M-xXo0leUFLPC0ukLzN5n8me68TkQCTBYEjwwxSEr0zMhCfA/exec",
    defaultSteamId: "76561198056653731",
    defaultSeason: "23",
    defaultGame: "TD",
    searchResultLimit: 8
  };

  const els = {
    game: document.getElementById("statsGame"),
    season: document.getElementById("statsSeason"),
    playerSearch: document.getElementById("statsPlayerSearch"),
    searchButton: document.getElementById("statsSearchButton"),
    searchStatus: document.getElementById("statsSearchStatus"),
    searchResults: document.getElementById("statsSearchResults"),

    playerName: document.getElementById("statsPlayerName"),
    playerId: document.getElementById("statsPlayerId"),
    rank: document.getElementById("statsRank"),
    points: document.getElementById("statsPoints"),
    wins: document.getElementById("statsWins"),
    losses: document.getElementById("statsLosses"),
    ratio: document.getElementById("statsRatio"),
    ratioChange: document.getElementById("statsRatioChange"),

    latestMatch: document.getElementById("statsLatestMatch"),
    matchesBody: document.getElementById("statsMatchesBody"),

    opponentSearch: document.getElementById("statsOpponentSearch"),
    opponentButton: document.getElementById("statsOpponentButton"),
    h2h: document.getElementById("statsH2H")
  };

  let leaderboardRows = [];
  let currentPlayer = null;
  let currentMatches = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeText(value) {
    return String(value ?? "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "");
  }

  function truncate(value, max = 28) {
    const text = String(value ?? "");
    return text.length > max ? `${text.slice(0, max)}…` : text;
  }

  function formatMapName(name) {
    if (!name) return "--";

    const clean = String(name).trim().toLowerCase();
    const replacements = new Map([
      ["monkey in the middle", "Monkey"],
      ["tournament desert", "Desert"],
      ["tournament middle camp", "Middle Camp"],
      ["quarry", "Quarry"],
      ["green acres", "Green Acres"],
      ["heavy metal", "Heavy Metal"],
      ["elevation", "Elevation"]
    ]);

    return replacements.get(clean) || name;
  }

  function formatResult(win) {
    if (win === true) return "Win";
    if (win === false) return "Loss";
    return "--";
  }

  function ratioPercent(wins, losses) {
    const total = wins + losses;
    if (!total) return 0;
    return Math.round((wins / total) * 100);
  }

  function formatDuration(secondsValue) {
    const seconds = Number(secondsValue || 0);
    if (!Number.isFinite(seconds) || seconds <= 0) return "--";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    return `${minutes}:${String(secs).padStart(2, "0")}`;
  }

  function formatDateTime(value) {
    if (!value) return "--";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function getSettings() {
    const game = (els.game?.value || STATS_CONFIG.defaultGame).trim().toUpperCase();
    const season = (els.season?.value || STATS_CONFIG.defaultSeason).trim();
    return { game, season };
  }

  async function fetchJson(type, extraParams = {}) {
    const params = new URLSearchParams({
      type,
      ...extraParams,
      t: Date.now().toString()
    });

    const response = await fetch(`${STATS_CONFIG.proxyBase}?${params.toString()}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  async function loadLeaderboard() {
    const { game, season } = getSettings();
    const data = await fetchJson("leaderboard", { game, season });
    leaderboardRows = Array.isArray(data?.positions) ? data.positions : [];
    return leaderboardRows;
  }

  function renderSearchResults(items) {
    if (!els.searchResults) return;

    if (!items.length) {
      els.searchResults.hidden = true;
      els.searchResults.innerHTML = "";
      return;
    }

    els.searchResults.hidden = false;
    els.searchResults.innerHTML = "";

    items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "stats-search-result";
      button.innerHTML = `
        <div class="stats-search-result-copy">
          <div class="stats-search-result-name">${escapeHtml(item.name || "Unknown Player")}</div>
          <div class="stats-search-result-meta">
            Rank ${escapeHtml(item.rank ?? "--")} // Points ${escapeHtml(Math.round(Number(item.points || 0)).toString())} // Wins ${escapeHtml(item.wins ?? "--")} // Losses ${escapeHtml(item.losses ?? "--")}
          </div>
        </div>
        <span class="btn">Load</span>
      `;

      button.addEventListener("click", () => {
        els.playerSearch.value = item.name || "";
        loadPlayerById(item.playerId, item.name);
      });

      els.searchResults.appendChild(button);
    });
  }

  function searchLeaderboard() {
    const query = String(els.playerSearch?.value || "").trim();
    if (!query) {
      renderSearchResults([]);
      if (els.searchStatus) {
        els.searchStatus.textContent = "Type a player name to search the current leaderboard.";
      }
      return;
    }

    const normalizedQuery = normalizeText(query);

    const results = leaderboardRows
      .map((row) => ({
        ...row,
        _normalized: normalizeText(row?.name || "")
      }))
      .filter((row) => row._normalized.includes(normalizedQuery))
      .sort((a, b) => Number(a.rank || 999999) - Number(b.rank || 999999))
      .slice(0, STATS_CONFIG.searchResultLimit);

    if (els.searchStatus) {
      els.searchStatus.textContent = results.length
        ? `${results.length} matching player${results.length === 1 ? "" : "s"} found.`
        : "No matching players found on the current leaderboard.";
    }

    renderSearchResults(results);
  }

  function renderSummary(playerData, matchesData, fallbackName = "Krispy") {
    const position = playerData?.position || null;

    if (!position) {
      els.playerName.textContent = fallbackName;
      els.playerId.textContent = "No player profile found";
      els.rank.textContent = "--";
      els.points.textContent = "--";
      els.wins.textContent = "--";
      els.losses.textContent = "--";
      els.ratio.textContent = "--";
      els.ratioChange.textContent = "Previous ratio: --";
      return;
    }

    const wins = Number(position.wins ?? 0);
    const losses = Number(position.losses ?? 0);
    const currentRatio = ratioPercent(wins, losses);

    let previousWins = wins;
    let previousLosses = losses;
    let previousRatio = currentRatio;

    if (Array.isArray(matchesData) && matchesData.length > 0) {
      const latest = matchesData[0];

      if (latest.win === true) {
        previousWins = Math.max(0, wins - 1);
      } else if (latest.win === false) {
        previousLosses = Math.max(0, losses - 1);
      }

      previousRatio = ratioPercent(previousWins, previousLosses);
    }

    els.playerName.textContent = position.name || fallbackName;
    els.playerId.textContent = `Steam ID: ${position.playerId || "--"}`;
    els.rank.textContent = `#${position.rank ?? "--"}`;
    els.points.textContent = `${Math.round(Number(position.points || 0))}`;
    els.wins.textContent = `${wins}`;
    els.losses.textContent = `${losses}`;
    els.ratio.textContent = `${currentRatio}%`;
    els.ratioChange.textContent = `Previous ratio: ${previousRatio}%`;
  }

  function renderLatestMatch(match) {
    if (!els.latestMatch) return;

    if (!match) {
      els.latestMatch.innerHTML = `<div class="notice">No recent matches were returned for this player.</div>`;
      return;
    }

    const resultText = formatResult(match.win);
    const resultClass = match.win === true ? "stats-result-win" : match.win === false ? "stats-result-loss" : "";

    els.latestMatch.innerHTML = `
      <article class="stats-latest-card">
        <div class="stats-info-row">
          <span class="stats-info-label">Opponent</span>
          <span class="stats-info-value">${escapeHtml(match.opponentName || "--")}</span>
        </div>
        <div class="stats-info-row">
          <span class="stats-info-label">Map</span>
          <span class="stats-info-value">${escapeHtml(formatMapName(match.mapName || "--"))}</span>
        </div>
        <div class="stats-info-row">
          <span class="stats-info-label">Result</span>
          <span class="stats-info-value ${resultClass}">${escapeHtml(resultText)}</span>
        </div>
        <div class="stats-info-row">
          <span class="stats-info-label">Duration</span>
          <span class="stats-info-value">${escapeHtml(formatDuration(match.matchDuration))}</span>
        </div>
        <div class="stats-info-row">
          <span class="stats-info-label">Started</span>
          <span class="stats-info-value">${escapeHtml(formatDateTime(match.starttime))}</span>
        </div>
      </article>
    `;
  }

  function renderMatches(matches) {
    if (!els.matchesBody) return;

    if (!Array.isArray(matches) || !matches.length) {
      els.matchesBody.innerHTML = `
        <tr>
          <td colspan="5" class="stats-empty-row">No recent matches found.</td>
        </tr>
      `;
      return;
    }

    els.matchesBody.innerHTML = matches.map((match) => {
      const resultText = formatResult(match.win);
      const resultClass = match.win === true ? "stats-result-win" : match.win === false ? "stats-result-loss" : "";

      return `
        <tr>
          <td>${escapeHtml(truncate(match.opponentName || "--", 22))}</td>
          <td>${escapeHtml(formatMapName(match.mapName || "--"))}</td>
          <td class="${resultClass}">${escapeHtml(resultText)}</td>
          <td>${escapeHtml(formatDuration(match.matchDuration))}</td>
          <td>${escapeHtml(formatDateTime(match.starttime))}</td>
        </tr>
      `;
    }).join("");
  }

  function buildHeadToHead(opponentName) {
    if (!Array.isArray(currentMatches) || !currentMatches.length) {
      return {
        wins: 0,
        losses: 0,
        lastTen: [],
        found: false
      };
    }

    const target = normalizeText(opponentName);
    const relevant = currentMatches.filter((match) => normalizeText(match?.opponentName || "") === target);

    if (!relevant.length) {
      return {
        wins: 0,
        losses: 0,
        lastTen: [],
        found: false
      };
    }

    const wins = relevant.filter((row) => row.win === true).length;
    const losses = relevant.filter((row) => row.win === false).length;
    const lastTen = relevant.slice(0, 10).map((row) => (row.win === true ? "W" : "L"));

    return {
      wins,
      losses,
      lastTen,
      found: true
    };
  }

  function renderHeadToHead(opponentName) {
    if (!els.h2h) return;

    const name = String(opponentName || "").trim();
    if (!name) {
      els.h2h.innerHTML = `<div class="notice">Enter an opponent name to build a head to head view.</div>`;
      return;
    }

    const h2h = buildHeadToHead(name);

    if (!h2h.found) {
      els.h2h.innerHTML = `<div class="notice">No recent matches against ${escapeHtml(name)} were found in the currently loaded history.</div>`;
      return;
    }

    const pills = h2h.lastTen.length
      ? h2h.lastTen.map((entry) => {
          const cls = entry === "W" ? "is-win" : "is-loss";
          return `<span class="stats-form-pill ${cls}">${entry}</span>`;
        }).join("")
      : `<span class="muted">No form data</span>`;

    els.h2h.innerHTML = `
      <article class="stats-h2h-card">
        <div class="stats-info-row">
          <span class="stats-info-label">Opponent</span>
          <span class="stats-info-value">${escapeHtml(name)}</span>
        </div>
        <div class="stats-info-row">
          <span class="stats-info-label">Wins</span>
          <span class="stats-info-value">${escapeHtml(String(h2h.wins))}</span>
        </div>
        <div class="stats-info-row">
          <span class="stats-info-label">Losses</span>
          <span class="stats-info-value">${escapeHtml(String(h2h.losses))}</span>
        </div>
        <div>
          <div class="stats-info-label" style="margin-bottom:8px;">Last Ten</div>
          <div class="stats-form-row">${pills}</div>
        </div>
      </article>
    `;
  }

  async function loadPlayerById(playerId, fallbackName = "Krispy") {
    const { game, season } = getSettings();

    els.searchStatus.textContent = "Loading player profile…";

    try {
      const [playerData, matchesData] = await Promise.all([
        fetchJson("player", { game, season, playerId }),
        fetchJson("matches", { game, season, playerId })
      ]);

      currentPlayer = playerData?.position || null;
      currentMatches = Array.isArray(matchesData) ? matchesData : [];

      renderSummary(playerData, currentMatches, fallbackName);
      renderLatestMatch(currentMatches[0] || null);
      renderMatches(currentMatches);

      if (els.opponentSearch?.value.trim()) {
        renderHeadToHead(els.opponentSearch.value.trim());
      } else {
        els.h2h.innerHTML = `<div class="notice">Enter an opponent name to build a head to head view from the loaded match history.</div>`;
      }

      els.searchStatus.textContent = currentPlayer
        ? `Loaded ${currentPlayer.name || fallbackName}.`
        : "Player profile could not be loaded.";
    } catch (error) {
      console.error("stats page player load failed", error);
      els.searchStatus.textContent = "Player data is currently unavailable.";
      renderSummary(null, [], fallbackName);
      renderLatestMatch(null);
      renderMatches([]);
      els.h2h.innerHTML = `<div class="notice">Head to head data is unavailable.</div>`;
    }
  }

  async function init() {
    els.game.value = STATS_CONFIG.defaultGame;
    els.season.value = STATS_CONFIG.defaultSeason;
    els.playerSearch.value = "Krispy";

    try {
      els.searchStatus.textContent = "Loading leaderboard…";
      await loadLeaderboard();
      els.searchStatus.textContent = `Leaderboard loaded. ${leaderboardRows.length} players available for search.`;
    } catch (error) {
      console.error("leaderboard load failed", error);
      els.searchStatus.textContent = "Leaderboard could not be loaded.";
    }

    await loadPlayerById(STATS_CONFIG.defaultSteamId, "Krispy");
  }

  els.searchButton?.addEventListener("click", async () => {
    try {
      els.searchStatus.textContent = "Refreshing leaderboard…";
      await loadLeaderboard();
      searchLeaderboard();
    } catch (error) {
      console.error("leaderboard refresh failed", error);
      els.searchStatus.textContent = "Search is currently unavailable.";
    }
  });

  els.playerSearch?.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    els.searchButton?.click();
  });

  els.game?.addEventListener("change", async () => {
    await init();
  });

  els.season?.addEventListener("change", async () => {
    await init();
  });

  els.opponentButton?.addEventListener("click", () => {
    renderHeadToHead(els.opponentSearch?.value || "");
  });

  els.opponentSearch?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    renderHeadToHead(els.opponentSearch?.value || "");
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();