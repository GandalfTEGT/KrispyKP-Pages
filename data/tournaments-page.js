(function () {
  const data = window.KRISPY_TOURNAMENTS || { currentEventId: null, events: [] };

  const els = {
    title: document.getElementById("tournamentTitle"),
    subtitle: document.getElementById("tournamentSubtitle"),
    heroMeta: document.getElementById("tournamentHeroMeta"),
    heroActions: document.getElementById("tournamentHeroActions"),
    heroNote: document.getElementById("tournamentHeroNote"),

    emptyState: document.getElementById("tournamentEmptyState"),
    content: document.getElementById("tournamentContent"),

    bannerWrap: document.getElementById("tournamentBannerWrap"),
    banner: document.getElementById("tournamentBanner"),

    description: document.getElementById("tournamentDescription"),
    summaryList: document.getElementById("tournamentSummaryList"),
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
    return getEvents().find(event => event.id === id) || null;
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

  function participantSourceLabel(value) {
    switch (value) {
      case "challonge":
        return "Challonge";
      case "mixed":
        return "Mixed";
      case "manual":
      default:
        return "Manual";
    }
  }

  function bracketModeLabel(value) {
    switch (value) {
      case "embed":
        return "Embedded";
      case "link":
        return "External Link";
      case "manual":
        return "Manual";
      case "none":
      default:
        return "None";
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
      events.find(event => event.status === "live") ||
      events.find(event => event.status === "upcoming") ||
      events.find(event => event.status === "completed") ||
      null
    );
  }

  function getOtherActiveEvents(featuredEvent) {
    return getEvents().filter(event =>
      event.id !== featuredEvent?.id &&
      (event.status === "live" || event.status === "upcoming")
    );
  }

  function getCompletedEvents(featuredEvent) {
    return getEvents().filter(event =>
      event.id !== featuredEvent?.id &&
      event.status === "completed"
    );
  }

  function createMetaPill(label) {
    const el = document.createElement("div");
    el.className = "status-pill";
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
    items.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = renderItem(item);
      container.appendChild(li);
    });
  }

  function resetBracketArea() {
    if (!els.bracketSection) return;

    els.bracketSection.hidden = true;

    if (els.bracketActions) els.bracketActions.innerHTML = "";

    if (els.bracketEmbedWrap) els.bracketEmbedWrap.hidden = true;
    if (els.bracketEmbed) els.bracketEmbed.removeAttribute("src");

    if (els.manualBracketWrap) {
      els.manualBracketWrap.hidden = true;
      els.manualBracketWrap.innerHTML = "";
      els.manualBracketWrap.style.removeProperty("--manual-round-count");
    }

    if (els.bracketFallback) {
      els.bracketFallback.hidden = true;
      els.bracketFallback.textContent = "";
      els.bracketFallback.innerHTML = "";
    }
  }

  function renderManualBracket(event) {
    if (!els.manualBracketWrap) return;

    const rounds = isArray(event.manualBracket?.rounds);
    if (!rounds.length) {
      if (els.bracketFallback) {
        els.bracketFallback.hidden = false;
        els.bracketFallback.textContent = "No manual bracket rounds have been configured yet.";
      }
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "tournament-manual-bracket";

    els.manualBracketWrap.style.setProperty("--manual-round-count", String(Math.max(rounds.length, 1)));

    rounds.forEach((round, roundIndex) => {
      const roundEl = document.createElement("div");
      roundEl.className = "tournament-manual-round frame";

      const roundTitle = document.createElement("div");
      roundTitle.className = "tournament-manual-round-title";
      roundTitle.textContent = text(round.title, `Round ${roundIndex + 1}`);
      roundEl.appendChild(roundTitle);

      const matches = isArray(round.matches);
      const matchesWrap = document.createElement("div");
      matchesWrap.className = "tournament-manual-matches";

      if (!matches.length) {
        const empty = document.createElement("div");
        empty.className = "notice";
        empty.textContent = "No matches added for this round yet.";
        matchesWrap.appendChild(empty);
      } else {
        matches.forEach((match, matchIndex) => {
          const matchEl = document.createElement("div");
          matchEl.className = "tournament-manual-match";

          const top = document.createElement("div");
          top.className = "tournament-manual-match-top";
          top.innerHTML = `
            <span>${escapeHtml(text(match.title, `Match ${matchIndex + 1}`))}</span>
            <span class="muted">${escapeHtml(text(match.note, ""))}</span>
          `;

          const player1 = document.createElement("div");
          player1.className = "tournament-manual-player" + (match.winner && match.winner === match.player1 ? " is-winner" : "");
          player1.innerHTML = `
            <span>${escapeHtml(text(match.player1, "TBD"))}</span>
            <span class="muted">${escapeHtml(text(match.score1, ""))}</span>
          `;

          const player2 = document.createElement("div");
          player2.className = "tournament-manual-player" + (match.winner && match.winner === match.player2 ? " is-winner" : "");
          player2.innerHTML = `
            <span>${escapeHtml(text(match.player2, "TBD"))}</span>
            <span class="muted">${escapeHtml(text(match.score2, ""))}</span>
          `;

          const footer = document.createElement("div");
          footer.className = "tournament-manual-match-footer";
          footer.innerHTML = `
            <span class="muted">${escapeHtml(text(match.time, ""))}</span>
            <span>${match.winner ? `Winner: ${escapeHtml(match.winner)}` : ""}</span>
          `;

          matchEl.append(top, player1, player2, footer);
          matchesWrap.appendChild(matchEl);
        });
      }

      roundEl.appendChild(matchesWrap);
      wrapper.appendChild(roundEl);
    });

    els.manualBracketWrap.hidden = false;
    els.manualBracketWrap.appendChild(wrapper);
  }

  function renderBracket(event) {
    resetBracketArea();

    const mode = text(event.bracketMode, "none");
    const hasEmbed = !!event.bracketEmbedUrl;
    const hasLink = !!event.bracketUrl;
    const hasManual = isArray(event.manualBracket?.rounds).length > 0;

    if (mode === "none" && !hasLink && !hasEmbed && !hasManual) {
      return;
    }

    els.bracketSection.hidden = false;

    if (els.bracketTitle) {
      els.bracketTitle.textContent = text(event.bracketTitle, "Bracket");
    }

    const openBracket = createActionLink("Open Bracket", event.bracketUrl || event.bracketEmbedUrl, true);
    if (openBracket && els.bracketActions) {
      els.bracketActions.appendChild(openBracket);
    }

    if (mode === "embed" && hasEmbed) {
      els.bracketEmbedWrap.hidden = false;
      els.bracketEmbed.src = event.bracketEmbedUrl;
      return;
    }

    if (mode === "manual") {
      renderManualBracket(event);
      return;
    }

    if (mode === "link" && hasLink) {
      els.bracketFallback.hidden = false;
      els.bracketFallback.textContent = "This event uses an external bracket page. Use the button above to open it.";
      return;
    }

    if (mode === "embed" && !hasEmbed && hasLink) {
      els.bracketFallback.hidden = false;
      els.bracketFallback.textContent = "An embedded bracket has not been configured for this event yet. Use the button above to open the bracket externally.";
      return;
    }

    if (hasManual) {
      renderManualBracket(event);
      return;
    }

    els.bracketFallback.hidden = false;
    els.bracketFallback.textContent = "Bracket information is not currently available for this event.";
  }

  function renderQuickInfo(event) {
    const quickInfo = [
      ["Game", text(event.game, "TBA")],
      ["Format", text(event.format, "TBA")],
      ["Status", createStatusLabel(text(event.status, "upcoming"))],
      ["Prize Pool", text(event.prizePool, "TBA")],
      ["Dates", [event.startDate, event.endDate].filter(Boolean).join(" to ") || "TBA"],
      ["Timezone", text(event.timezone, "TBA")],
      ["Organizer", text(event.organizer, "KrispyKP")],
      ["Host Type", event.hostType === "external" ? "External Event" : "KrispyKP Event"],
      ["Players Source", participantSourceLabel(event.participantSource)],
      ["Bracket Mode", bracketModeLabel(event.bracketMode)]
    ];

    renderList(
      els.quickInfo,
      quickInfo,
      ([label, value]) => `<span>${escapeHtml(label)}</span><span class="muted">${escapeHtml(value)}</span>`
    );
  }

  function renderSummaryTags(event) {
    if (!els.summaryList) return;

    els.summaryList.innerHTML = "";

    [
      event.startDate ? `Starts: ${event.startDate}` : "",
      event.endDate ? `Ends: ${event.endDate}` : "",
      event.timezone ? `Timezone: ${event.timezone}` : "",
      event.prizePool ? `Prize Pool: ${event.prizePool}` : "",
      event.registrationMode ? `Signup: ${event.registrationMode}` : "",
      event.participantSource ? `Players: ${event.participantSource}` : "",
      event.bracketMode ? `Bracket: ${event.bracketMode}` : ""
    ]
      .filter(Boolean)
      .forEach(label => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = label;
        els.summaryList.appendChild(tag);
      });
  }

  function renderActions(event) {
    if (!els.heroActions || !els.heroNote) return;

    els.heroActions.innerHTML = "";

    const actions = [];

    if ((event.registrationMode === "challonge" || event.registrationMode === "external") && event.registrationUrl) {
      actions.push(createActionLink("Register", event.registrationUrl, true));
    }

    actions.push(createActionLink("Bracket", event.bracketUrl));
    actions.push(createActionLink("Watch Stream", event.streamUrl));
    actions.push(createActionLink("Rules", event.rulesUrl));

    actions.filter(Boolean).forEach(link => els.heroActions.appendChild(link));

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
        <h3 class="${sectionKind === "archive" ? "tournament-archive-title" : "tournament-switch-title"}">${escapeHtml(text(event.title, "Tournament"))}</h3>
        <p class="${sectionKind === "archive" ? "tournament-archive-text" : "tournament-switch-text"}">${escapeHtml(text(event.subtitle || event.description, "Tournament event."))}</p>
        <div class="${sectionKind === "archive" ? "tournament-archive-meta" : "tournament-switch-meta"} badge-line">
          <span class="tag">${escapeHtml(createStatusLabel(text(event.status, "upcoming")))}</span>
          ${event.game ? `<span class="tag">${escapeHtml(event.game)}</span>` : ""}
        </div>
      </div>
    `;

    const actions = document.createElement("div");
    actions.className = "cta-row tournament-switch-actions";

    actions.appendChild(
      createLocalActionButton("View Event", () => {
        currentEventId = event.id;
        renderPage();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, true)
    );

    if (sectionKind === "archive" && event.bracketUrl) {
      const link = createActionLink("Open Bracket", event.bracketUrl, false);
      if (link) actions.appendChild(link);
    }

    article.appendChild(actions);
    return article;
  }

  function renderSwitchers(featuredEvent) {
    const otherActive = getOtherActiveEvents(featuredEvent);
    const completed = getCompletedEvents(featuredEvent);

    if (els.switcherSection && els.switcherGrid) {
      els.switcherGrid.innerHTML = "";

      if (otherActive.length) {
        els.switcherSection.hidden = false;

        if (els.switcherTitle) {
          els.switcherTitle.textContent = otherActive.length === 1
            ? "Other Active / Upcoming Event"
            : "Other Active / Upcoming Events";
        }

        otherActive.forEach(event => {
          els.switcherGrid.appendChild(
            renderSwitcherCard(event, event.status === "live" ? "Live Event" : "Upcoming Event", "active")
          );
        });
      } else {
        els.switcherSection.hidden = true;
      }
    }

    if (els.archiveCardsSection && els.archiveCardsGrid) {
      els.archiveCardsGrid.innerHTML = "";

      if (completed.length) {
        els.archiveCardsSection.hidden = false;

        if (els.archiveCardsTitle) {
          els.archiveCardsTitle.textContent = completed.length === 1 ? "Past Event" : "Past Events";
        }

        completed.forEach(event => {
          els.archiveCardsGrid.appendChild(renderSwitcherCard(event, "Completed Event", "archive"));
        });
      } else {
        els.archiveCardsSection.hidden = true;
      }
    }
  }

  function renderEvent(event) {
    if (!event) {
      renderEmptyState();
      return;
    }

    if (els.emptyState) els.emptyState.hidden = true;
    if (els.content) els.content.hidden = false;

    if (els.title) els.title.textContent = text(event.title, "Tournament");
    if (els.subtitle) els.subtitle.textContent = text(event.subtitle || event.description, "Event information and coverage.");

    if (els.heroMeta) {
      els.heroMeta.innerHTML = "";
      els.heroMeta.appendChild(createMetaPill(createStatusLabel(text(event.status, "upcoming"))));

      if (event.game) els.heroMeta.appendChild(createMetaPill(event.game));
      if (event.format) els.heroMeta.appendChild(createMetaPill(event.format));
      if (event.prizePool) els.heroMeta.appendChild(createMetaPill(`Prize Pool: ${event.prizePool}`));
    }

    renderActions(event);

    if (els.bannerWrap && els.banner) {
      if (event.bannerImage) {
        els.bannerWrap.hidden = false;
        els.banner.src = event.bannerImage;
        els.banner.alt = `${text(event.title, "Tournament")} banner`;
      } else {
        els.bannerWrap.hidden = true;
        els.banner.removeAttribute("src");
        els.banner.alt = "";
      }
    }

    if (els.description) {
      els.description.textContent = text(event.description, "No description has been added yet.");
    }

    renderSummaryTags(event);
    renderQuickInfo(event);
    renderBracket(event);
    renderSwitchers(event);

    const schedule = isArray(event.schedule);
    if (els.scheduleCard) els.scheduleCard.hidden = !schedule.length;
    if (schedule.length) {
      renderList(
        els.schedule,
        schedule,
        item => `<span>${escapeHtml(text(item.label))}</span><span class="muted">${escapeHtml(text(item.value))}</span>`
      );
    }

    const players = isArray(event.players);
    if (els.playersCard) els.playersCard.hidden = !players.length;
    if (players.length) {
      renderList(els.players, players, item => {
        const left = [item.seed ? `#${item.seed}` : "", text(item.name, "Unnamed Player")].filter(Boolean).join(" ");
        const right = item.note || item.flag || item.discord || "";
        return `<span>${escapeHtml(left)}</span><span class="muted">${escapeHtml(text(right))}</span>`;
      });
    }

    const rules = isArray(event.rules);
    if (els.rulesCard) els.rulesCard.hidden = !rules.length;
    if (rules.length) {
      renderList(els.rules, rules, item => `<span>${escapeHtml(text(item))}</span><span class="muted">Rule</span>`);
    }

    const featuredMatches = isArray(event.featuredMatches);
    if (els.featuredMatchesCard) els.featuredMatchesCard.hidden = !featuredMatches.length;
    if (featuredMatches.length) {
      renderList(els.featuredMatches, featuredMatches, item => {
        const left = item.title || item.players || "Match";
        const right = item.time || item.players || "";
        return `<span>${escapeHtml(text(left))}</span><span class="muted">${escapeHtml(text(right))}</span>`;
      });
    }

    const results = isArray(event.results);
    if (els.resultsSection) els.resultsSection.hidden = !results.length;
    if (results.length) {
      renderList(els.results, results, item => {
        const left = [item.place || "", item.name || ""].filter(Boolean).join(" - ");
        const right = item.note || "";
        return `<span>${escapeHtml(text(left))}</span><span class="muted">${escapeHtml(text(right))}</span>`;
      });
    }
  }

  function renderEmptyState() {
    if (els.emptyState) els.emptyState.hidden = false;
    if (els.content) els.content.hidden = true;

    if (els.title) els.title.textContent = "Events & Coverage";
    if (els.subtitle) {
      els.subtitle.textContent = "Tournament information, brackets, players, rules, featured matches, and results will appear here whenever an event is active.";
    }

    if (els.heroMeta) els.heroMeta.innerHTML = "";
    if (els.heroActions) els.heroActions.innerHTML = "";

    if (els.heroNote) {
      els.heroNote.hidden = true;
      els.heroNote.textContent = "";
    }

    if (els.switcherSection) els.switcherSection.hidden = true;
    if (els.archiveCardsSection) els.archiveCardsSection.hidden = true;
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