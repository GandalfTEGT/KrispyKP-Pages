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

    scheduleCard: document.getElementById("tournamentScheduleCard"),
    schedule: document.getElementById("tournamentSchedule"),

    playersCard: document.getElementById("tournamentPlayersCard"),
    players: document.getElementById("tournamentPlayers"),

    rulesCard: document.getElementById("tournamentRulesCard"),
    rules: document.getElementById("tournamentRules"),

    featuredMatchesCard: document.getElementById("tournamentFeaturedMatchesCard"),
    featuredMatches: document.getElementById("tournamentFeaturedMatches"),

    resultsSection: document.getElementById("tournamentResultsSection"),
    results: document.getElementById("tournamentResults"),

    archiveCardsSection: document.getElementById("tournamentArchiveCardsSection"),
    archiveCardsGrid: document.getElementById("tournamentArchiveCardsGrid"),
    archiveCardsTitle: document.getElementById("tournamentArchiveCardsTitle")
  };

  let currentEventId = data.currentEventId || null;

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

    if (currentEventId) {
      return getEventById(currentEventId);
    }

    if (data.currentEventId) {
      return getEventById(data.currentEventId);
    }

    return (
      events.find((event) => event.status === "live") ||
      events.find((event) => event.status === "upcoming") ||
      events.find((event) => event.status === "completed") ||
      null
    );
  }

  function getOtherActiveEvents(featuredEvent) {
    return getEvents().filter((event) => {
      return event.id !== featuredEvent?.id && (event.status === "live" || event.status === "upcoming");
    });
  }

  function getCompletedEvents(featuredEvent) {
    return getEvents().filter((event) => {
      return event.id !== featuredEvent?.id && event.status === "completed";
    });
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

    items.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = renderItem(item);
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
    if (els.schedule) els.schedule.innerHTML = "";
    if (els.players) els.players.innerHTML = "";
    if (els.rules) els.rules.innerHTML = "";
    if (els.featuredMatches) els.featuredMatches.innerHTML = "";
    if (els.results) els.results.innerHTML = "";

    if (els.scheduleCard) els.scheduleCard.hidden = true;
    if (els.playersCard) els.playersCard.hidden = true;
    if (els.rulesCard) els.rulesCard.hidden = true;
    if (els.featuredMatchesCard) els.featuredMatchesCard.hidden = true;
    if (els.resultsSection) els.resultsSection.hidden = true;
  }

  function resetSwitchers() {
    if (els.switcherGrid) els.switcherGrid.innerHTML = "";
    if (els.archiveCardsGrid) els.archiveCardsGrid.innerHTML = "";
    if (els.switcherSection) els.switcherSection.hidden = true;
    if (els.archiveCardsSection) els.archiveCardsSection.hidden = true;
  }

  function getManualBracketGroups(event) {
    const groups = [];

    if (isArray(event.manualBracketGroups) && event.manualBracketGroups.length) {
      event.manualBracketGroups.forEach((group, index) => {
        const rounds = isArray(group?.rounds);
        if (!rounds.length) return;

        const rawKey = text(group.key, `group-${index + 1}`).toLowerCase();
        let kind = "standard";

        if (rawKey.includes("winner")) kind = "winners";
        else if (rawKey.includes("loser")) kind = "losers";
        else if (rawKey.includes("grand")) kind = "grand-final";

        groups.push({
          key: rawKey,
          kind,
          title: text(group.title, `Bracket ${index + 1}`),
          rounds
        });
      });
    }

    const legacyRounds = isArray(event.manualBracket?.rounds);
    if (!groups.length && legacyRounds.length) {
      groups.push({
        key: "main",
        kind: "standard",
        title: text(event.bracketTitle, "Bracket"),
        rounds: legacyRounds
      });
    }

    return groups;
  }

  function createManualMatchElement(match, matchIndex) {
    const matchEl = document.createElement("article");
    matchEl.className = "tournament-manual-match";

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
    matchEl.append(top, players, footer);

    return matchEl;
  }

  function createManualBracketGroup(group) {
    const groupEl = document.createElement("section");
    groupEl.className = `tournament-manual-group is-${group.kind}`;

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

    groupEl.append(groupHead, bracketEl);
    return groupEl;
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

    groups.forEach((group) => {
      els.manualBracketWrap.appendChild(createManualBracketGroup(group));
    });
  }

  function renderBracket(event) {
    resetBracketArea();

    const mode = text(event.bracketMode, "none");
    const hasEmbed = !!event.bracketEmbedUrl;
    const hasLink = !!event.bracketUrl;
    const hasManual = getManualBracketGroups(event).length > 0;

    if (mode === "none" && !hasLink && !hasEmbed && !hasManual) {
      return;
    }

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

    if (mode === "manual" || hasManual) {
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

    if (els.switcherSection && els.switcherGrid) {
      if (otherActive.length) {
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
    }

    if (els.archiveCardsSection && els.archiveCardsGrid) {
      if (completed.length) {
        els.archiveCardsSection.hidden = false;
        if (els.archiveCardsTitle) {
          els.archiveCardsTitle.textContent = completed.length === 1 ? "Past Event" : "Past Events";
        }

        completed.forEach((event) => {
          els.archiveCardsGrid.appendChild(renderSwitcherCard(event, "Completed Event", "archive"));
        });
      }
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
    renderBracket(event);
    renderSwitchers(event);

    const schedule = isArray(event.schedule);
    if (els.scheduleCard) els.scheduleCard.hidden = !schedule.length;
    if (schedule.length) {
      renderList(
        els.schedule,
        schedule,
        (item) => `
          <div class="tournament-schedule-item">
            <span class="tournament-schedule-label">${escapeHtml(text(item.label, "Stage"))}</span>
            <span class="tournament-schedule-value">${escapeHtml(text(item.value, "TBA"))}</span>
          </div>
        `
      );
    }

    const players = isArray(event.players);
    if (els.playersCard) els.playersCard.hidden = !players.length;
    if (players.length) {
      renderList(els.players, players, (item) => {
        const metaBits = [];
        if (item.flag) metaBits.push(`<span class="tournament-player-meta-pill">${escapeHtml(item.flag)}</span>`);
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

    const featuredMatches = isArray(event.featuredMatches);
    if (els.featuredMatchesCard) els.featuredMatchesCard.hidden = !featuredMatches.length;
    if (featuredMatches.length) {
      renderList(els.featuredMatches, featuredMatches, (item) => `
        <span>${escapeHtml(text(item.title || item.players, "Match"))}</span>
        <span class="muted">${escapeHtml(text(item.time || item.players, ""))}</span>
      `);
    }

    const results = isArray(event.results);
    if (els.resultsSection) els.resultsSection.hidden = !results.length;
    if (results.length) {
      renderList(els.results, results, (item) => `
        <div class="tournament-result-item">
          <span class="tournament-result-place">${escapeHtml(text(item.place, "-"))}</span>
          <span class="tournament-result-name">${escapeHtml(text(item.name, "TBD"))}</span>
          ${item.note ? `<span class="tournament-result-note">${escapeHtml(item.note)}</span>` : ""}
        </div>
      `);
    }
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
        "Tournament information, brackets, players, rules, featured matches, and results will appear here whenever an event is active.";
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

  currentEventId = data.currentEventId || null;
  renderPage();
})();