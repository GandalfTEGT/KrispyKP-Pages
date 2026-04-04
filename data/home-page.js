(function () {
  const videoData = window.KRISPY_VIDEO_DATA || {};
  const allTracks = Array.isArray(window.KRISPY_TRACKS) ? window.KRISPY_TRACKS : [];
  const builtInPlaylists = Array.isArray(window.KRISPY_PLAYLISTS) ? window.KRISPY_PLAYLISTS : [];
  const tournamentData = window.KRISPY_TOURNAMENTS || { currentEventId: null, events: [] };

  const HOME_FEATURE_CONFIG = {
    forcedVideoId: "MUpIlUdrX7c",
    forcedTrackIds: [],
    shuffleTracksOnLoad: true,
    randomVideoFromLatest: false
  };

  const els = {
    featuredVideoFrame: document.getElementById("homeFeaturedVideoFrame"),
    featuredVideoTitle: document.getElementById("homeFeaturedVideoTitle"),
    featuredVideoMeta: document.getElementById("homeFeaturedVideoMeta"),
    featuredVideoNote: document.getElementById("homeFeaturedVideoNote"),
    featuredVideoLink: document.getElementById("homeFeaturedVideoLink"),

    featuredTracksGrid: document.getElementById("homeFeaturedTracksGrid"),
    featuredTrackAudio: document.getElementById("homeFeaturedTrackAudio"),
    tournamentCard: document.getElementById("homeTournamentCard"),
    tournamentBanner: document.getElementById("homeTournamentBanner"),
    tournamentStatus: document.getElementById("homeTournamentStatus"),
    tournamentTitle: document.getElementById("homeTournamentTitle"),
    tournamentText: document.getElementById("homeTournamentText"),
    tournamentMeta: document.getElementById("homeTournamentMeta"),
    tournamentLink: document.getElementById("homeTournamentLink")
  };

  function parseDate(value) {
    return Date.parse(value || 0) || 0;
  }

  function formatDate(value) {
    const timestamp = parseDate(value);
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function getThumbnail(videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  function normaliseVideo(video, fallbackTag) {
    if (!video || !video.videoId) return null;

    return {
      videoId: video.videoId,
      title: video.title || "Untitled Video",
      note: video.note || video.description || "",
      publishedAt: video.videoPublishedAt || video.publishedAt || "",
      thumbnail: video.thumbnail || getThumbnail(video.videoId),
      tag: video.tag || fallbackTag || "Video",
      url: video.url || `https://www.youtube.com/watch?v=${video.videoId}`,
      duration: video.duration || "",
      position: Number.isFinite(video.position) ? video.position : 999999
    };
  }

  function dedupeVideos(items) {
    const seen = new Set();

    return items.filter((video) => {
      if (!video || !video.videoId || seen.has(video.videoId)) {
        return false;
      }

      seen.add(video.videoId);
      return true;
    });
  }

  function shuffleArray(items) {
    const copy = [...items];

    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  }

  function getAllVideos() {
    const categories = Array.isArray(videoData.categories) ? videoData.categories : [];

    const videos = categories.flatMap((category) => {
      if (category && category.id === "latest") {
        return Array.isArray(category.latest)
          ? category.latest.map((video) => normaliseVideo(video, "Latest Videos"))
          : [];
      }

      const subTabs = Array.isArray(category?.subTabs) ? category.subTabs : [];

      return subTabs.flatMap((tab) => {
        const items = Array.isArray(tab?.items) ? tab.items : [];
        return items.map((video) => normaliseVideo(video, tab.title || category.title || "Video"));
      });
    });

    return dedupeVideos(videos)
      .filter(Boolean)
      .sort((a, b) => parseDate(b.publishedAt) - parseDate(a.publishedAt));
  }

  function getForcedVideo() {
    if (!HOME_FEATURE_CONFIG.forcedVideoId) return null;
    return getAllVideos().find((video) => video.videoId === HOME_FEATURE_CONFIG.forcedVideoId) || null;
  }

  function getFeaturedVideo() {
    const forced = getForcedVideo();
    if (forced) return forced;

    const allVideos = getAllVideos();
    if (!allVideos.length) return null;

    if (HOME_FEATURE_CONFIG.randomVideoFromLatest) {
      const latestPool = allVideos.slice(0, Math.min(6, allVideos.length));
      return latestPool[Math.floor(Math.random() * latestPool.length)] || allVideos[0];
    }

    return allVideos[0];
  }

  function getEmbedSrc(videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
  }

  function renderFeaturedVideo() {
    const video = getFeaturedVideo();

    if (!els.featuredVideoFrame || !els.featuredVideoTitle || !els.featuredVideoMeta) {
      return;
    }

    if (!video) {
      els.featuredVideoTitle.textContent = "No synced video yet";
      els.featuredVideoMeta.textContent = "Add a video to the site library";

      if (els.featuredVideoNote) {
        els.featuredVideoNote.textContent =
          "The homepage will automatically show the latest synced upload once your video data contains items.";
      }
      return;
    }

    els.featuredVideoFrame.src = getEmbedSrc(video.videoId);
    els.featuredVideoTitle.textContent = video.title;
    els.featuredVideoMeta.textContent = [
      video.tag || "Video",
      video.publishedAt ? `Published ${formatDate(video.publishedAt)}` : ""
    ].filter(Boolean).join(" // ");

    if (els.featuredVideoNote) {
      els.featuredVideoNote.textContent =
        video.note || "Pulled automatically from the synced video library.";
    }

    if (els.featuredVideoLink) {
      els.featuredVideoLink.href = video.url || "videos.html";
      els.featuredVideoLink.target = "_blank";
      els.featuredVideoLink.rel = "noopener noreferrer";
      els.featuredVideoLink.textContent = "Watch on YouTube";
    }
  }

  function getPlayableTracks(trackList) {
    return trackList.filter((track) => track && track.available && track.file);
  }

  function getPlaylistById(id) {
    return builtInPlaylists.find((playlist) => playlist.id === id) || null;
  }

  function getTracksForPlaylist(playlistId) {
    if (playlistId === "custom-selection") {
      return [];
    }

    const playlist = getPlaylistById(playlistId);

    if (!playlist || playlist.tracks === "ALL") {
      return [...allTracks];
    }

    const trackMap = new Map(allTracks.map((track) => [track.id, track]));

    return playlist.tracks
      .map((trackId) => trackMap.get(trackId))
      .filter(Boolean);
  }

  function uniqueTracks(items) {
    const seen = new Set();

    return items.filter((track) => {
      if (!track || !track.id || seen.has(track.id)) {
        return false;
      }

      seen.add(track.id);
      return true;
    });
  }

  function getForcedTracks() {
    const forcedIds = Array.isArray(HOME_FEATURE_CONFIG.forcedTrackIds)
      ? HOME_FEATURE_CONFIG.forcedTrackIds.filter(Boolean)
      : [];

    if (!forcedIds.length) return [];

    const trackMap = new Map(allTracks.map((track) => [track.id, track]));

    return forcedIds
      .map((id) => trackMap.get(id))
      .filter((track) => track && track.available && track.file)
      .slice(0, 3);
  }

  function getFeaturedTracks() {
    const forced = getForcedTracks();
    if (forced.length) return forced;

    const soundtrackTracks = getTracksForPlaylist("krispykp-mini-soundtrack")
      .filter((track) => track && track.available && track.file);

    const deadGameTracks = getTracksForPlaylist("thanks-jim-dead-game-chronicles")
      .filter((track) => track && track.available && track.file);

    const fallbackTracks = getPlayableTracks(allTracks);

    let picks = uniqueTracks([
      ...soundtrackTracks.slice(0, 3),
      ...deadGameTracks.slice(0, 3),
      ...fallbackTracks
    ]);

    if (HOME_FEATURE_CONFIG.shuffleTracksOnLoad) {
      picks = shuffleArray(picks);
    }

    return picks.slice(0, 3);
  }

  function getTrackTag(track) {
    return track?.album ? "Featured Release" : "Featured Track";
  }

  function getTrackMeta(track) {
    return track?.album || "Standalone Release";
  }

  function createTrackCard(track, audio) {
    const article = document.createElement("article");
    article.className = "home-featured-track-card";
    article.dataset.trackId = track.id || "";
    article.dataset.trackName = track.name || "Untitled Track";

    const head = document.createElement("div");
    head.className = "home-featured-track-head";

    const art = document.createElement("div");
    art.className = "thumb home-featured-track-art";
    art.style.backgroundImage = `url("${track.art || "assets/logo.png"}")`;

    const copy = document.createElement("div");
    copy.className = "home-featured-track-copy";

    const name = document.createElement("div");
    name.className = "t-name";
    name.textContent = track.name || "Untitled Track";

    const tag = document.createElement("div");
    tag.className = "t-tag";
    tag.textContent = getTrackTag(track);

    const meta = document.createElement("div");
    meta.className = "t-artist";
    meta.textContent = getTrackMeta(track);

    copy.append(name, tag, meta);
    head.append(art, copy);

    const actions = document.createElement("div");
    actions.className = "cta-row home-featured-track-actions";

    const playButton = document.createElement("button");
    playButton.className = "btn primary";
    playButton.type = "button";
    playButton.textContent = "Play Preview";

    playButton.addEventListener("click", async () => {
      if (!audio || !track.file) {
        return;
      }

      const isCurrentTrack = audio.dataset.trackId === track.id;

      if (isCurrentTrack && !audio.paused) {
        audio.pause();
        return;
      }

      audio.src = track.file;
      audio.dataset.trackId = track.id || "";
      audio.dataset.trackName = track.name || "Untitled Track";

      try {
        await audio.play();
      } catch (error) {
        console.error("Unable to play preview:", error);
      }

      syncTrackButtons();
    });

    actions.appendChild(playButton);
    article.append(head, actions);

    return article;
  }

  function syncTrackButtons() {
    if (!els.featuredTracksGrid || !els.featuredTrackAudio) {
      return;
    }

    const audio = els.featuredTrackAudio;
    const cards = els.featuredTracksGrid.querySelectorAll(".home-featured-track-card");

    cards.forEach((card) => {
      const button = card.querySelector(".home-featured-track-actions .btn");
      if (!button) return;

      const isActive =
        !audio.paused &&
        audio.dataset.trackId === card.dataset.trackId;

      button.textContent = isActive ? "Pause Preview" : "Play Preview";
    });
  }

  function renderFeaturedTracks() {
    if (!els.featuredTracksGrid || !els.featuredTrackAudio) {
      return;
    }

    const audio = els.featuredTrackAudio;
    const tracks = getFeaturedTracks();

    els.featuredTracksGrid.innerHTML = "";

    if (!tracks.length) {
      const empty = document.createElement("article");
      empty.className = "home-featured-track-card";
      empty.innerHTML = `
        <div class="home-featured-track-copy">
          <div class="t-name">No playable tracks yet</div>
          <div class="t-artist">Add tracks to the site music library and this area will populate automatically.</div>
        </div>
      `;
      els.featuredTracksGrid.appendChild(empty);
      return;
    }

    tracks.forEach((track) => {
      els.featuredTracksGrid.appendChild(createTrackCard(track, audio));
    });

    audio.addEventListener("pause", syncTrackButtons);
    audio.addEventListener("play", syncTrackButtons);
    audio.addEventListener("ended", syncTrackButtons);

    syncTrackButtons();
  }

  function rotateLiveCards() {
    const cards = Array.from(document.querySelectorAll(".home-uplink-grid .mini"));
    if (cards.length < 2) return;

    let activeIndex = 0;

    function setActive() {
      cards.forEach((card, index) => {
        card.classList.toggle("home-live-pulse", index === activeIndex);
      });

      activeIndex = (activeIndex + 1) % cards.length;
    }

    setActive();
    window.setInterval(setActive, 2600);
  }

  function enableDashboardTimeStamp() {
    const feed = document.querySelector(".home-dashboard-timestamp");
    if (!feed) return;

    function update() {
      const now = new Date();
      feed.textContent = `Last sync // ${now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
      })}`;
    }

    update();
    window.setInterval(update, 30000);
  }

  function getTournamentEvents() {
  return Array.isArray(tournamentData.events) ? tournamentData.events : [];
}

  function getTournamentById(id) {
    return getTournamentEvents().find((event) => event.id === id) || null;
  }

  function getFeaturedTournament() {
    const events = getTournamentEvents();
    if (!events.length) return null;

    if (tournamentData.currentEventId) {
      return getTournamentById(tournamentData.currentEventId);
    }

    return (
      events.find((event) => event.status === "live") ||
      events.find((event) => event.status === "upcoming") ||
      events.find((event) => event.status === "completed") ||
      null
    );
  }

  function getTournamentStatusLabel(status) {
    switch (status) {
      case "live":
        return "Live Event";
      case "completed":
        return "Completed Event";
      case "upcoming":
      default:
        return "Upcoming Event";
    }
  }

  function createTournamentMetaTag(label) {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = label;
    return span;
  }

  function renderFeaturedTournament() {
    if (!els.tournamentCard || !els.tournamentTitle || !els.tournamentText) {
      return;
    }

    const event = getFeaturedTournament();

    if (!event) {
      if (els.tournamentStatus) {
        els.tournamentStatus.textContent = "Tournament Hub";
      }

      els.tournamentTitle.textContent = "Tournaments";
      els.tournamentText.textContent =
        "Upcoming events, signups, brackets, results, and stream-linked coverage will live here.";

      if (els.tournamentMeta) {
        els.tournamentMeta.innerHTML = "";
      }

      if (els.tournamentLink) {
        els.tournamentLink.href = "tournaments.html";
        els.tournamentLink.textContent = "View Events";
      }

      if (els.tournamentBanner) {
        els.tournamentBanner.classList.add("home-tournament-banner--empty");
        els.tournamentBanner.style.removeProperty("background-image");
      }

      return;
    }

    if (els.tournamentStatus) {
      els.tournamentStatus.textContent = getTournamentStatusLabel(event.status);
    }

    els.tournamentTitle.textContent = event.title || "Featured Tournament";
    els.tournamentText.textContent =
      event.subtitle ||
      event.description ||
      "Open the tournaments hub for full details, brackets, and event coverage.";

    if (els.tournamentMeta) {
      els.tournamentMeta.innerHTML = "";

      [
        event.game,
        event.format,
        event.startDate,
        event.prizePool
      ]
        .filter(Boolean)
        .slice(0, 4)
        .forEach((value) => {
          els.tournamentMeta.appendChild(createTournamentMetaTag(String(value)));
        });
    }

    if (els.tournamentLink) {
      els.tournamentLink.href = "tournaments.html";
      els.tournamentLink.textContent =
        event.status === "live" ? "Open Live Event" : "View Event";
    }

    if (els.tournamentBanner) {
      if (event.bannerImage) {
        els.tournamentBanner.classList.remove("home-tournament-banner--empty");
        els.tournamentBanner.style.backgroundImage = `url("${event.bannerImage}")`;
      } else {
        els.tournamentBanner.classList.add("home-tournament-banner--empty");
        els.tournamentBanner.style.removeProperty("background-image");
      }
    }
  }

  function init() {
    renderFeaturedVideo();
    renderFeaturedTracks();
    rotateLiveCards();
    enableDashboardTimeStamp();
    renderFeaturedTournament();
  }

  init();
})();