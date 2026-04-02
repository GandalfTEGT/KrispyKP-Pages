(function () {
  const data = window.KRISPY_TOURNAMENTS || { currentEventId: null, events: [] };

  const els = {
    title: document.getElementById("tournamentTitle"),
    subtitle: document.getElementById("tournamentSubtitle"),
    heroMeta: document.getElementById("tournamentHeroMeta"),
    heroActions: document.getElementById("tournamentHeroActions"),
    heroNote: document.getElementById("tournamentHeroNote"),
    heroBackdrop: document.getElementById("tournamentHeroBackdrop"),

    emptyState: document.getElementById("tournamentEmptyState"),
    content: document.getElementById("tournamentContent"),

    description: document.getElementById("tournamentDescription"),
    organizerPanel: document.getElementById("tournamentOrganizerPanel"),
    organizerValue: document.getElementById("tournamentOrganizerValue"),
    quickInfo: document.getElementById("tournamentQuickInfo"),

    bracketSection: document.getElementById("tournamentBracketSection"),
    bracketTitle: document.getElementById("tournamentBracketTitle"),
    bracketActions: document.getElementById("tournamentBracketActions"),
    bracketEmbedWrap: document.getElementById("tournamentBracketEmbedWrap"),
    bracketEmbed: document.getElementById("tournamentBracketEmbed"),
    manualBracketWrap: document.getElementById("tournamentManualBracketWrap"),
    bracketFallback: document.getElementById("tournamentBracketFallback"),

    switcherSection: document.getElementById("tournamentSwitcherSection"),
    switcherTitle: document.getElementById("tournamentSwitcherTitle"),
    switcherGrid: document.getElementById("tournamentSwitcherGrid"),

    scheduleSection: document.getElementById("tournamentScheduleSection"),
    scheduleCard: document.getElementById("tournamentScheduleCard"),
    schedule: document.getElementById("tournamentSchedule"),

    playersCard: document.getElementById("tournamentPlayersCard"),
    players: document.getElementById("tournamentPlayers"),

    rulesCard: document.getElementById("tournamentRulesCard"),
    rules: document.getElementById("tournamentRules"),

    resultsSection: document.getElementById("tournamentResultsSection"),
    results: document.getElementById("tournamentResults"),

    archiveCardsSection: document.getElementById("tournamentArchiveCardsSection"),
    archiveCardsGrid: document.getElementById("tournamentArchiveCardsGrid"),
    archiveCardsTitle: document.getElementById("tournamentArchiveCardsTitle")
  };

  let currentEventId = data.currentEventId || null;
  let bracketResizeRaf = 0;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function text(value, fallback = "") {
    return value == null || value === "" ? fallback : String(value);
  }

  function isArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function getEvents() {
    return isArray(data.events);
  }

  function getEventById(id) {
    return getEvents().find((event) => event.id === id) || null;
  }

  function createStatusLabel(status) {
    switch (status) {
      case "live":
        return "Live";
      case "completed":
        return "Completed";
      case "upcoming":
      default:
        return "Upcoming";
    }
  }

  function getCurrentEvent() {
    const events = getEvents();
    if (!events.length) return null;

    if (currentEventId) return getEventById(currentEventId);
    if (data.currentEventId) return getEventById(data.currentEventId);

    return (
      events.find((event) => event.status === "live") ||
      events.find((event) => event.status === "upcoming") ||
      events.find((event) => event.status === "completed") ||
      null
    );
  }

  function getOtherActiveEvents(featuredEvent) {
    return getEvents().filter((event) => (
      event.id !== featuredEvent?.id &&
      (event.status === "live" || event.status === "upcoming")
    ));
  }

  function getCompletedEvents(featuredEvent) {
    return getEvents().filter((event) => (
      event.id !== featuredEvent?.id &&
      event.status === "completed"
    ));
  }

  function jumpToTop() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  function selectEvent(eventId) {
    currentEventId = eventId;
    jumpToTop();

    requestAnimationFrame(() => {
      renderPage();
      requestAnimationFrame(() => {
        jumpToTop();
      });
    });
  }

  function createMetaPill(label, status = "") {
    const el = document.createElement("div");
    el.className = `status-pill${status ? ` is-${status}` : ""}`;
    el.textContent = label;
    return el;
  }

  function createActionLink(label, href, primary = false) {
    if (!href) return null;

    const a = document.createElement("a");
    a.className = primary ? "btn primary" : "btn";
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = label;
    return a;
  }

  function createLocalActionButton(label, onClick, primary = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = primary ? "btn primary" : "btn";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function renderList(container, items, renderItem) {
    if (!container) return;
    container.innerHTML = "";

    items.forEach((item, index) => {
      const li = document.createElement("li");
      li.innerHTML = renderItem(item, index);
      container.appendChild(li);
    });
  }

  function setHeroBackdrop(event) {
    if (!els.heroBackdrop) return;

    if (event?.bannerImage) {
      els.heroBackdrop.hidden = false;
      els.heroBackdrop.style.backgroundImage = `
        linear-gradient(180deg, rgba(5, 9, 12, 0.28), rgba(5, 9, 12, 0.80)),
        linear-gradient(90deg, rgba(6, 9, 11, 0.92), rgba(6, 9, 11, 0.58)),
        url("${event.bannerImage}")
      `;
    } else {
      els.heroBackdrop.hidden = true;
      els.heroBackdrop.style.removeProperty("background-image");
    }
  }

  function resetBracketArea() {
    if (els.bracketSection) els.bracketSection.hidden = true;
    if (els.bracketActions) els.bracketActions.innerHTML = "";

    if (els.bracketEmbedWrap) els.bracketEmbedWrap.hidden = true;
    if (els.bracketEmbed) els.bracketEmbed.removeAttribute("src");

    if (els.manualBracketWrap) {
      els.manualBracketWrap.hidden = true;
      els.manualBracketWrap.innerHTML = "";
      els.manualBracketWrap.classList.remove("is-scrollable");
    }

    if (els.bracketFallback) {
      els.bracketFallback.hidden = true;
      els.bracketFallback.textContent = "";
      els.bracketFallback.innerHTML = "";
    }
  }

  function resetDataAreas() {
    if (els.quickInfo) els.quickInfo.innerHTML = "";
    if (els.schedule) els.schedule.innerHTML = "";
    if (els.players) els.players.innerHTML = "";
    if (els.rules) els.rules.innerHTML = "";
    if (els.results) els.results.innerHTML = "";

    if (els.scheduleSection) els.scheduleSection.hidden = true;
    if (els.scheduleCard) els.scheduleCard.hidden = true;
    if (els.playersCard) els.playersCard.hidden = true;
    if (els.rulesCard) els.rulesCard.hidden = true;
    if (els.resultsSection) els.resultsSection.hidden = true;
  }

  function resetSwitchers() {
    if (els.switcherGrid) els.switcherGrid.innerHTML = "";
    if (els.archiveCardsGrid) els.archiveCardsGrid.innerHTML = "";
    if (els.switcherSection) els.switcherSection.hidden = true;
    if (els.archiveCardsSection) els.archiveCardsSection.hidden = true;
  }

  function getManualBracketGroups(event) {
    return isArray(event.manualBracketGroups)
      .map((group, index) => {
        const rawKey = text(group?.key, `group-${index + 1}`).toLowerCase();
        let kind = "standard";

        if (rawKey.includes("winner")) kind = "winners";
        else if (rawKey.includes("loser")) kind = "losers";
        else if (rawKey.includes("grand")) kind = "grand-final";

        return {
          key: rawKey,
          kind,
          title: text(group?.title, `Bracket ${index + 1}`),
          rounds: isArray(group?.rounds)
        };
      })
      .filter((group) => group.rounds.length > 0);
  }

  function formatLongDate(dateString) {
    if (!dateString) return "";
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function formatScheduleText(item, event) {
    const title = text(item.title || item.label, "Stage");
    const time = text(item.time, "");
    const date = text(item.date, "");
    const timezone = text(item.timezone || event.timezone, "");

    if (time || date || timezone) {
      const parts = [];
      if (time) parts.push(time);
      if (date) parts.push(`on ${formatLongDate(date)}`);

      let detail = parts.join(" ");
      if (timezone) detail += `${detail ? " " : ""}(${timezone})`;

      return {
        title,
        detail: detail || "TBA"
      };
    }

    return {
      title,
      detail: text(item.value, "TBA")
    };
  }

  function getGroupConnectorColor(groupKind) {
    if (groupKind === "winners") return "rgba(125, 255, 136, 0.55)";
    if (groupKind === "losers") return "rgba(255, 211, 110, 0.55)";
    if (groupKind === "grand-final") return "rgba(79, 210, 255, 0.75)";
    return "rgba(79, 210, 255, 0.45)";
  }

  function createSvg(tagName) {
    return document.createElementNS("http://www.w3.org/2000/svg", tagName);
  }

  function getContentRelativeRect(element, container) {
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return {
      left: elementRect.left - containerRect.left + container.scrollLeft,
      right: elementRect.right - containerRect.left + container.scrollLeft,
      top: elementRect.top - containerRect.top + container.scrollTop,
      bottom: elementRect.bottom - containerRect.top + container.scrollTop,
      width: elementRect.width,
      height: elementRect.height
    };
  }

  function createManualMatchElement(match, matchIndex) {
    const matchEl = document.createElement("article");
    matchEl.className = "tournament-manual-match";

    if (match.id) matchEl.dataset.matchId = match.id;
    if (match.slot1From) matchEl.dataset.slot1From = match.slot1From;
    if (match.slot2From) matchEl.dataset.slot2From = match.slot2From;

    const sourceBits = [match.slot1From, match.slot2From].filter(Boolean);
    const sourceMarkup = sourceBits.length
      ? `<div class="tournament-manual-match-source">Feeds from ${sourceBits.map((item) => escapeHtml(item)).join(" / ")}</div>`
      : "";

    const top = document.createElement("div");
    top.className = "tournament-manual-match-top";
    top.innerHTML = `
      <span>${escapeHtml(text(match.title, `Match ${matchIndex + 1}`))}</span>
      <span class="muted">${escapeHtml(text(match.note, ""))}</span>
    `;

    const players = document.createElement("div");
    players.className = "tournament-manual-match-players";

    const player1 = document.createElement("div");
    player1.className =
      "tournament-manual-player" + (match.winner && match.winner === match.player1 ? " is-winner" : "");
    player1.innerHTML = `
      <span class="tournament-manual-player-name">${escapeHtml(text(match.player1, "TBD"))}</span>
      <span class="tournament-manual-player-score">${escapeHtml(text(match.score1, ""))}</span>
    `;

    const player2 = document.createElement("div");
    player2.className =
      "tournament-manual-player" + (match.winner && match.winner === match.player2 ? " is-winner" : "");
    player2.innerHTML = `
      <span class="tournament-manual-player-name">${escapeHtml(text(match.player2, "TBD"))}</span>
      <span class="tournament-manual-player-score">${escapeHtml(text(match.score2, ""))}</span>
    `;

    const footer = document.createElement("div");
    footer.className = "tournament-manual-match-footer";
    footer.innerHTML = `
      <span class="muted">${escapeHtml(text(match.time, ""))}</span>
      <span>${match.winner ? `Winner: ${escapeHtml(match.winner)}` : ""}</span>
    `;

    players.append(player1, player2);
    matchEl.append(top, players);

    if (sourceMarkup) {
      const sourceWrap = document.createElement("div");
      sourceWrap.innerHTML = sourceMarkup;
      matchEl.appendChild(sourceWrap.firstElementChild);
    }

    matchEl.append(footer);
    return matchEl;
  }

  function sanitizeGroupKey(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getElementRectRelativeToStage(element, stage) {
    const elementRect = element.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    return {
      left: elementRect.left - stageRect.left,
      right: elementRect.right - stageRect.left,
      top: elementRect.top - stageRect.top,
      bottom: elementRect.bottom - stageRect.top,
      width: elementRect.width,
      height: elementRect.height
    };
  }

  function isDesktopBracketLayout() {
    return !window.matchMedia("(max-width: 980px)").matches;
  }

  function createManualBracketGroup(group) {
    const groupEl = document.createElement("section");
    const groupKeyClass = sanitizeGroupKey(group.key);
    groupEl.className = `tournament-manual-group is-${group.kind} group-key-${groupKeyClass}`;
    groupEl.dataset.groupKind = group.kind;
    groupEl.dataset.groupKey = group.key;

    const groupHead = document.createElement("div");
    groupHead.className = "tournament-manual-group-head";

    let routeText = "";
    if (group.kind === "winners") routeText = "Feeds winner into Grand Final";
    else if (group.kind === "losers") routeText = "Feeds survivor into Grand Final";
    else if (group.kind === "grand-final") routeText = "Final meeting of Winners and Losers brackets";

    groupHead.innerHTML = `
      <div class="tournament-manual-group-kicker-row">
        <div class="section-title">Manual Bracket</div>
        ${routeText ? `<div class="tournament-manual-route">${escapeHtml(routeText)}</div>` : ""}
      </div>
      <div class="tournament-manual-group-title-row">
        <div class="tournament-manual-group-title">${escapeHtml(text(group.title, "Bracket"))}</div>
        <div class="tournament-manual-group-badge">${escapeHtml(
          group.kind === "winners"
            ? "Upper"
            : group.kind === "losers"
            ? "Lower"
            : group.kind === "grand-final"
            ? "Final"
            : "Bracket"
        )}</div>
      </div>
    `;

    const bracketSurface = document.createElement("div");
    bracketSurface.className = "tournament-manual-group-surface";

    const connectorSvg = createSvg("svg");
    connectorSvg.classList.add("tournament-manual-connector-svg");
    connectorSvg.setAttribute("aria-hidden", "true");

    const bracketEl = document.createElement("div");
    bracketEl.className = "tournament-manual-bracket";

    group.rounds.forEach((round, roundIndex) => {
      const roundEl = document.createElement("section");
      roundEl.className = "tournament-manual-round";

      const roundHead = document.createElement("div");
      roundHead.className = "tournament-manual-round-head";

      const roundTitle = document.createElement("div");
      roundTitle.className = "tournament-manual-round-title";
      roundTitle.textContent = text(round.title, `Round ${roundIndex + 1}`);

      const matches = isArray(round.matches);

      const roundCount = document.createElement("div");
      roundCount.className = "tournament-manual-round-count";
      roundCount.textContent = `${matches.length} match${matches.length === 1 ? "" : "es"}`;

      roundHead.append(roundTitle, roundCount);

      const matchesWrap = document.createElement("div");
      matchesWrap.className = "tournament-manual-matches";

      if (!matches.length) {
        const empty = document.createElement("div");
        empty.className = "notice";
        empty.textContent = "No matches added for this round yet.";
        matchesWrap.appendChild(empty);
      } else {
        matches.forEach((match, matchIndex) => {
          matchesWrap.appendChild(createManualMatchElement(match, matchIndex));
        });
      }

      roundEl.append(roundHead, matchesWrap);
      bracketEl.appendChild(roundEl);
    });

    bracketSurface.append(connectorSvg, bracketEl);
    groupEl.append(groupHead, bracketSurface);
    return groupEl;
  }

  function drawGroupConnectors(groupEl) {
    const bracketEl = groupEl.querySelector(".tournament-manual-bracket");
    const svg = groupEl.querySelector(".tournament-manual-connector-svg");
    if (!bracketEl || !svg) return;

    const matchEls = Array.from(groupEl.querySelectorAll(".tournament-manual-match[data-match-id]"));
    const matchMap = new Map();

    matchEls.forEach((matchEl) => {
      matchMap.set(matchEl.dataset.matchId, matchEl);
      matchEl.classList.remove("is-feed-target", "is-feed-source");
    });

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    svg.setAttribute("width", String(Math.ceil(bracketEl.scrollWidth)));
    svg.setAttribute("height", String(Math.ceil(bracketEl.scrollHeight)));
    svg.setAttribute("viewBox", `0 0 ${Math.ceil(bracketEl.scrollWidth)} ${Math.ceil(bracketEl.scrollHeight)}`);

    const color = getGroupConnectorColor(groupEl.dataset.groupKind || "standard");
    const nodes = [];

    matchEls.forEach((targetEl) => {
      const sources = [targetEl.dataset.slot1From, targetEl.dataset.slot2From].filter(Boolean);

      sources.forEach((sourceId) => {
        const sourceEl = matchMap.get(sourceId);
        if (!sourceEl) return;

        sourceEl.classList.add("is-feed-source");
        targetEl.classList.add("is-feed-target");

        const sourceRect = getContentRelativeRect(sourceEl, bracketEl);
        const targetRect = getContentRelativeRect(targetEl, bracketEl);

        const x1 = sourceRect.right;
        const y1 = sourceRect.top + sourceRect.height / 2;
        const x4 = targetRect.left;
        const y4 = targetRect.top + targetRect.height / 2;
        const midX = x1 + Math.max(24, (x4 - x1) * 0.5);

        const path = createSvg("path");
        path.setAttribute("class", "tournament-manual-connector-path");
        path.setAttribute("d", `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y4}, ${x4} ${y4}`);
        path.setAttribute("stroke", color);
        path.setAttribute("fill", "none");
        nodes.push(path);

        const sourceDot = createSvg("circle");
        sourceDot.setAttribute("class", "tournament-manual-connector-node");
        sourceDot.setAttribute("cx", String(x1));
        sourceDot.setAttribute("cy", String(y1));
        sourceDot.setAttribute("r", "3");
        sourceDot.setAttribute("fill", color);
        nodes.push(sourceDot);

        const targetDot = createSvg("circle");
        targetDot.setAttribute("class", "tournament-manual-connector-node");
        targetDot.setAttribute("cx", String(x4));
        targetDot.setAttribute("cy", String(y4));
        targetDot.setAttribute("r", "3");
        targetDot.setAttribute("fill", color);
        nodes.push(targetDot);
      });
    });

    nodes.forEach((node) => svg.appendChild(node));
  }

  function drawStageConnectors(stageEl) {
    const stageSvg = stageEl.querySelector(".tournament-manual-stage-svg");
    if (!stageSvg) return;

    while (stageSvg.firstChild) stageSvg.removeChild(stageSvg.firstChild);

    if (!isDesktopBracketLayout()) {
      stageSvg.setAttribute("width", "0");
      stageSvg.setAttribute("height", "0");
      stageSvg.setAttribute("viewBox", "0 0 0 0");
      return;
    }

    const matchEls = Array.from(stageEl.querySelectorAll(".tournament-manual-match[data-match-id]"));
    const matchMap = new Map();

    matchEls.forEach((matchEl) => {
      matchMap.set(matchEl.dataset.matchId, matchEl);
    });

    const width = Math.ceil(stageEl.scrollWidth || stageEl.getBoundingClientRect().width);
    const height = Math.ceil(stageEl.scrollHeight || stageEl.getBoundingClientRect().height);

    stageSvg.setAttribute("width", String(width));
    stageSvg.setAttribute("height", String(height));
    stageSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const nodes = [];

    matchEls.forEach((targetEl) => {
      const targetGroup = targetEl.closest(".tournament-manual-group");
      if (!targetGroup) return;

      const sources = [targetEl.dataset.slot1From, targetEl.dataset.slot2From].filter(Boolean);

      sources.forEach((sourceId) => {
        const sourceEl = matchMap.get(sourceId);
        if (!sourceEl) return;

        const sourceGroup = sourceEl.closest(".tournament-manual-group");
        if (!sourceGroup || sourceGroup === targetGroup) return;

        const sourceRect = getElementRectRelativeToStage(sourceEl, stageEl);
        const targetRect = getElementRectRelativeToStage(targetEl, stageEl);

        const x1 = sourceRect.right;
        const y1 = sourceRect.top + sourceRect.height / 2;
        const x4 = targetRect.left;
        const y4 = targetRect.top + targetRect.height / 2;
        const midX = x1 + Math.max(36, (x4 - x1) * 0.5);

        const path = createSvg("path");
        path.setAttribute("class", "tournament-manual-stage-path");
        path.setAttribute("d", `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y4}, ${x4} ${y4}`);
        path.setAttribute("stroke", "rgba(79, 210, 255, 0.78)");
        path.setAttribute("fill", "none");
        nodes.push(path);

        const sourceDot = createSvg("circle");
        sourceDot.setAttribute("class", "tournament-manual-stage-node");
        sourceDot.setAttribute("cx", String(x1));
        sourceDot.setAttribute("cy", String(y1));
        sourceDot.setAttribute("r", "3.5");
        sourceDot.setAttribute("fill", "rgba(79, 210, 255, 0.88)");
        nodes.push(sourceDot);

        const targetDot = createSvg("circle");
        targetDot.setAttribute("class", "tournament-manual-stage-node");
        targetDot.setAttribute("cx", String(x4));
        targetDot.setAttribute("cy", String(y4));
        targetDot.setAttribute("r", "3.5");
        targetDot.setAttribute("fill", "rgba(79, 210, 255, 0.88)");
        nodes.push(targetDot);
      });
    });

    nodes.forEach((node) => stageSvg.appendChild(node));
  }

  function scheduleConnectorDraw() {
    cancelAnimationFrame(bracketResizeRaf);
    bracketResizeRaf = requestAnimationFrame(() => {
      if (!els.manualBracketWrap || els.manualBracketWrap.hidden) return;

      const groups = els.manualBracketWrap.querySelectorAll(".tournament-manual-group");
      groups.forEach((groupEl) => drawGroupConnectors(groupEl));

      const stage = els.manualBracketWrap.querySelector(".tournament-manual-stage");
      if (stage) drawStageConnectors(stage);
    });
  }

  function renderManualBracket(event) {
    if (!els.manualBracketWrap) return;

    const groups = getManualBracketGroups(event);

    if (!groups.length) {
      if (els.bracketFallback) {
        els.bracketFallback.hidden = false;
        els.bracketFallback.textContent = "No manual bracket rounds have been configured yet.";
      }
      return;
    }

    els.manualBracketWrap.innerHTML = "";
    els.manualBracketWrap.hidden = false;
    els.manualBracketWrap.classList.add("is-scrollable");

    const hasWinners = groups.some((group) => group.kind === "winners");
    const hasLosers = groups.some((group) => group.kind === "losers");
    const hasGrandFinal = groups.some((group) => group.kind === "grand-final");

    const stage = document.createElement("div");
    stage.className = "tournament-manual-stage";
    if (hasWinners && hasLosers && hasGrandFinal) {
      stage.classList.add("is-double-elim");
    }

    const stageSvg = createSvg("svg");
    stageSvg.classList.add("tournament-manual-stage-svg");
    stageSvg.setAttribute("aria-hidden", "true");

    stage.appendChild(stageSvg);

    groups.forEach((group) => {
      stage.appendChild(createManualBracketGroup(group));
    });

    els.manualBracketWrap.appendChild(stage);
    scheduleConnectorDraw();
  }

  function renderBracket(event) {
    resetBracketArea();

    const mode = text(event.bracketMode, "none");
    const hasEmbed = !!event.bracketEmbedUrl;
    const hasLink = !!event.bracketUrl;
    const hasManual = getManualBracketGroups(event).length > 0;

    if (mode === "none" && !hasLink && !hasEmbed && !hasManual) return;

    if (els.bracketSection) els.bracketSection.hidden = false;
    if (els.bracketTitle) els.bracketTitle.textContent = text(event.bracketTitle, "Bracket");

    const openBracket = createActionLink("Open Bracket", event.bracketUrl || event.bracketEmbedUrl, true);
    if (openBracket && els.bracketActions) {
      els.bracketActions.appendChild(openBracket);
    }

    if (mode === "embed" && hasEmbed) {
      if (els.bracketEmbedWrap) els.bracketEmbedWrap.hidden = false;
      if (els.bracketEmbed) els.bracketEmbed.src = event.bracketEmbedUrl;
      return;
    }

    if (mode === "manual" && hasManual) {
      renderManualBracket(event);
      return;
    }

    if (mode === "link" && hasLink) {
      if (els.bracketFallback) {
        els.bracketFallback.hidden = false;
        els.bracketFallback.textContent = "This event uses an external bracket page. Use the button above to open it.";
      }
      return;
    }

    if (mode === "embed" && !hasEmbed && hasLink) {
      if (els.bracketFallback) {
        els.bracketFallback.hidden = false;
        els.bracketFallback.textContent =
          "An embedded bracket has not been configured for this event yet. Use the button above to open the bracket externally.";
      }
      return;
    }

    if (els.bracketFallback) {
      els.bracketFallback.hidden = false;
      els.bracketFallback.textContent = "Bracket information is not currently available for this event.";
    }
  }

  function renderQuickInfo(event) {
    const quickInfo = [
      ["Game", text(event.game, "TBA")],
      ["Format", text(event.format, "TBA")],
      ["Status", createStatusLabel(text(event.status, "upcoming"))],
      ["Prize Pool", text(event.prizePool, "TBA")],
      ["Dates", [event.startDate, event.endDate].filter(Boolean).join(" to ") || "TBA"],
      ["Timezone", text(event.timezone, "TBA")]
    ];

    renderList(
      els.quickInfo,
      quickInfo,
      ([label, value]) => `
        <span class="tournament-detail-label">${escapeHtml(label)}</span>
        <span class="tournament-detail-value">${escapeHtml(value)}</span>
      `
    );
  }

  function renderActions(event) {
    if (!els.heroActions || !els.heroNote) return;

    els.heroActions.innerHTML = "";

    const actions = [];

    if ((event.registrationMode === "challonge" || event.registrationMode === "external") && event.registrationUrl) {
      actions.push(createActionLink("Register", event.registrationUrl, true));
    }

    actions.push(createActionLink("Bracket", event.bracketUrl || event.bracketEmbedUrl));
    actions.push(createActionLink("Watch Stream", event.streamUrl));
    actions.push(createActionLink("Rules", event.rulesUrl));

    actions.filter(Boolean).forEach((link) => els.heroActions.appendChild(link));

    if (event.registrationMode === "closed") {
      els.heroNote.hidden = false;
      els.heroNote.textContent = "Registrations are currently closed.";
    } else if (event.registrationMode === "none") {
      els.heroNote.hidden = false;
      els.heroNote.textContent = "This event does not use public signup through the site.";
    } else {
      els.heroNote.hidden = true;
      els.heroNote.textContent = "";
    }
  }

  function renderSwitcherCard(event, label, sectionKind) {
    const article = document.createElement("article");
    article.className = "frame " + (sectionKind === "archive" ? "tournament-archive-item" : "tournament-switch-item");

    const banner = event.bannerImage
      ? `<div class="${sectionKind === "archive" ? "tournament-archive-banner" : "tournament-switch-thumb"}" style="background-image:url('${escapeHtml(event.bannerImage)}')"></div>`
      : `<div class="tournament-switch-thumb tournament-switch-thumb--empty"></div>`;

    article.innerHTML = `
      ${banner}
      <div class="${sectionKind === "archive" ? "tournament-archive-copy" : "tournament-switch-copy"}">
        <div class="section-title">${escapeHtml(label)}</div>
        <h3 class="${sectionKind === "archive" ? "tournament-archive-title" : "tournament-switch-title"}">
          ${escapeHtml(text(event.title, "Tournament"))}
        </h3>
        <p class="${sectionKind === "archive" ? "tournament-archive-text" : "tournament-switch-text"}">
          ${escapeHtml(text(event.subtitle || event.description, "Tournament event."))}
        </p>
        <div class="${sectionKind === "archive" ? "tournament-archive-meta" : "tournament-switch-meta"} badge-line">
          <span class="tag">${escapeHtml(createStatusLabel(text(event.status, "upcoming")))}</span>
          ${event.game ? `<span class="tag">${escapeHtml(event.game)}</span>` : ""}
        </div>
      </div>
    `;

    const actions = document.createElement("div");
    actions.className = "cta-row tournament-switch-actions";

    actions.appendChild(
      createLocalActionButton(
        "View Event",
        () => {
          selectEvent(event.id);
        },
        true
      )
    );

    if (sectionKind === "archive" && event.bracketUrl) {
      const link = createActionLink("Open Bracket", event.bracketUrl, false);
      if (link) actions.appendChild(link);
    }

    article.appendChild(actions);
    return article;
  }

  function renderSwitchers(featuredEvent) {
    resetSwitchers();

    const otherActive = getOtherActiveEvents(featuredEvent);
    const completed = getCompletedEvents(featuredEvent);

    if (els.switcherSection && els.switcherGrid && otherActive.length) {
      els.switcherSection.hidden = false;
      if (els.switcherTitle) {
        els.switcherTitle.textContent =
          otherActive.length === 1 ? "Other Active / Upcoming Event" : "Other Active / Upcoming Events";
      }

      otherActive.forEach((event) => {
        els.switcherGrid.appendChild(
          renderSwitcherCard(event, event.status === "live" ? "Live Event" : "Upcoming Event", "active")
        );
      });
    }

    if (els.archiveCardsSection && els.archiveCardsGrid && completed.length) {
      els.archiveCardsSection.hidden = false;
      if (els.archiveCardsTitle) {
        els.archiveCardsTitle.textContent = completed.length === 1 ? "Past Event" : "Past Events";
      }

      completed.forEach((event) => {
        els.archiveCardsGrid.appendChild(renderSwitcherCard(event, "Completed Event", "archive"));
      });
    }
  }

  function renderEvent(event) {
    if (!event) {
      renderEmptyState();
      return;
    }

    resetDataAreas();
    resetBracketArea();
    resetSwitchers();

    if (els.emptyState) els.emptyState.hidden = true;
    if (els.content) els.content.hidden = false;

    if (els.title) els.title.textContent = text(event.title, "Tournament");
    if (els.subtitle) {
      els.subtitle.textContent = text(event.subtitle || event.description, "Event information and coverage.");
    }

    setHeroBackdrop(event);

    if (els.heroMeta) {
      els.heroMeta.innerHTML = "";
      els.heroMeta.appendChild(createMetaPill(createStatusLabel(text(event.status, "upcoming")), text(event.status, "upcoming")));

      if (event.game) els.heroMeta.appendChild(createMetaPill(event.game));
      if (event.format) els.heroMeta.appendChild(createMetaPill(event.format));
      if (event.startDate) els.heroMeta.appendChild(createMetaPill(`Starts: ${event.startDate}`));
      if (event.prizePool) els.heroMeta.appendChild(createMetaPill(`Prize Pool: ${event.prizePool}`));
    }

    renderActions(event);

    if (els.description) {
      const descriptionText = text(event.description, "");
      els.description.textContent = descriptionText;
      els.description.hidden = !descriptionText;
    }

    if (els.organizerPanel && els.organizerValue) {
      const organizerText = text(event.organizer, "");
      els.organizerPanel.hidden = !organizerText;
      els.organizerValue.textContent = organizerText;
    }

    renderQuickInfo(event);

    const results = isArray(event.results);
    const showResults = event.status === "completed" && results.length > 0;
    if (els.resultsSection) els.resultsSection.hidden = !showResults;

    if (showResults) {
      renderList(
        els.results,
        results,
        (item) => `
          <div class="tournament-result-item">
            <span class="tournament-result-place">${escapeHtml(text(item.place, "-"))}</span>
            <span class="tournament-result-name">${escapeHtml(text(item.name, "TBD"))}</span>
            ${item.note ? `<span class="tournament-result-note">${escapeHtml(item.note)}</span>` : ""}
          </div>
        `
      );
    }

    renderBracket(event);

    const players = isArray(event.players);
    if (els.playersCard) els.playersCard.hidden = !players.length;

    if (players.length) {
      renderList(els.players, players, (item) => {
        const metaBits = [];

        if (item.flagImage) {
          metaBits.push(`
            <span class="tournament-player-meta-pill tournament-player-flag-pill">
              <img
                class="tournament-player-flag-image"
                src="${escapeHtml(item.flagImage)}"
                alt="${escapeHtml(text(item.flag, "Flag"))}"
                loading="lazy"
                decoding="async">
              <span>${escapeHtml(text(item.flag, ""))}</span>
            </span>
          `);
        } else if (item.flag) {
          metaBits.push(`<span class="tournament-player-meta-pill">${escapeHtml(item.flag)}</span>`);
        }

        if (item.note) metaBits.push(`<span class="tournament-player-meta-pill">${escapeHtml(item.note)}</span>`);
        if (item.discord) metaBits.push(`<span class="tournament-player-meta-pill">@${escapeHtml(item.discord)}</span>`);

        return `
          <div class="tournament-player-item">
            <div class="tournament-player-main">
              ${item.seed != null && item.seed !== "" ? `<span class="tournament-player-seed">#${escapeHtml(item.seed)}</span>` : ""}
              <span class="tournament-player-name">${escapeHtml(text(item.name, "Unnamed Player"))}</span>
            </div>
            ${metaBits.length ? `<div class="tournament-player-meta">${metaBits.join("")}</div>` : ""}
          </div>
        `;
      });
    }

    const rules = isArray(event.rules);
    if (els.rulesCard) els.rulesCard.hidden = !rules.length;

    if (rules.length) {
      renderList(
        els.rules,
        rules,
        (item) => `
          <span>${escapeHtml(text(item))}</span>
          <span class="muted">Rule</span>
        `
      );
    }

    const schedule = isArray(event.schedule);
    const showSchedule = schedule.length > 0;
    if (els.scheduleSection) els.scheduleSection.hidden = !showSchedule;
    if (els.scheduleCard) els.scheduleCard.hidden = !showSchedule;

    if (showSchedule) {
      renderList(
        els.schedule,
        schedule,
        (item) => {
          const formatted = formatScheduleText(item, event);
          return `
            <div class="tournament-schedule-item">
              <span class="tournament-schedule-title">${escapeHtml(formatted.title)}</span>
              <span class="tournament-schedule-detail">${escapeHtml(formatted.detail)}</span>
            </div>
          `;
        }
      );
    }

    renderSwitchers(event);
  }

  function renderEmptyState() {
    resetDataAreas();
    resetBracketArea();
    resetSwitchers();

    if (els.emptyState) els.emptyState.hidden = false;
    if (els.content) els.content.hidden = true;

    if (els.title) els.title.textContent = "Events & Coverage";
    if (els.subtitle) {
      els.subtitle.textContent =
        "Tournament information, brackets, players, rules, and results will appear here whenever an event is active.";
    }

    if (els.heroMeta) els.heroMeta.innerHTML = "";
    if (els.heroActions) els.heroActions.innerHTML = "";

    if (els.heroNote) {
      els.heroNote.hidden = true;
      els.heroNote.textContent = "";
    }

    if (els.heroBackdrop) {
      els.heroBackdrop.hidden = true;
      els.heroBackdrop.style.removeProperty("background-image");
    }

    if (els.organizerPanel) els.organizerPanel.hidden = true;
  }

  function renderPage() {
    const featured = getCurrentEvent();

    if (!featured) {
      renderEmptyState();
      return;
    }

    renderEvent(featured);
  }

  window.addEventListener("resize", scheduleConnectorDraw);
  renderPage();
})();