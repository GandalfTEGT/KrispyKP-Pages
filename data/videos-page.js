(function () {
  const data = window.KRISPY_VIDEO_DATA || {};
  const pageSize = Number(data.pageSize) > 0 ? Number(data.pageSize) : 8;

  const summaryText = document.getElementById("videosSummaryText");
  const libraryTitle = document.getElementById("videosLibraryTitle");

  const topGrid = document.querySelector(".videos-top-grid");

  const featureState = document.getElementById("videosFeatureState");
  const selectedState = document.getElementById("videosSelectedState");
  const featureFrame = document.getElementById("videosFeatureFrame");
  const featureTitle = document.getElementById("videosFeatureTitle");
  const featureMeta = document.getElementById("videosFeatureMeta");
  const featureNote = document.getElementById("videosFeatureNote");

  const playerFrame = document.getElementById("videosPlayerFrame");
  const playerTitle = document.getElementById("videosPlayerTitle");
  const playerMeta = document.getElementById("videosPlayerMeta");
  const playerNote = document.getElementById("videosPlayerNote");

  const categoryTabs = document.getElementById("videoCategoryTabs");
  const subTabs = document.getElementById("videoSubTabs");
  const libraryGrid = document.getElementById("videoLibraryGrid");
  const libraryPager = document.getElementById("videoLibraryPager");
  const emptyState = document.getElementById("videoEmptyState");

  let activeCategoryId = (data.categories && data.categories[0] && data.categories[0].id) || "";
  let activeSubTabId = "";
  let currentPage = 1;
  let currentVideo = null;

  function getCategoryById(id) {
    return (data.categories || []).find(category => category.id === id) || null;
  }

  function getActiveCategory() {
    return getCategoryById(activeCategoryId);
  }

  function getActiveSubTab() {
    const category = getActiveCategory();
    if (!category) return null;
    return (category.subTabs || []).find(tab => tab.id === activeSubTabId) || null;
  }

  function getThumbnail(videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  function formatDuration(isoDuration) {
    if (!isoDuration) return "";

    const match = isoDuration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
    if (!match) return "";

    const hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);
    const seconds = Number(match[3] || 0);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function normaliseVideo(video, fallbackTag) {
    if (!video || !video.videoId) return null;
    return {
      videoId: video.videoId,
      title: video.title || "Untitled Video",
      note: video.note || "",
      publishedAt: video.publishedAt || "",
      thumbnail: video.thumbnail || getThumbnail(video.videoId),
      tag: video.tag || fallbackTag || "Video",
      url: video.url || `https://www.youtube.com/watch?v=${video.videoId}`
      duration: video.duration || "",
      position: Number.isFinite(video.position) ? video.position : 999999
    };
  }

  function dedupeVideos(items) {
    const seen = new Set();
    return items.filter(video => {
      if (!video || !video.videoId || seen.has(video.videoId)) return false;
      seen.add(video.videoId);
      return true;
    });
  }

  function getCategoryLatestVideos(category) {
    if (!category) return [];

    if (category.id === "latest") {
      return dedupeVideos((category.latest || []).map(video => normaliseVideo(video, "Latest Videos")))
        .sort((a, b) => (Date.parse(b.publishedAt || 0) || 0) - (Date.parse(a.publishedAt || 0) || 0))
        .slice(0, category.latestCount || 8);
    }

    const videos = (category.subTabs || [])
      .flatMap(tab => (tab.items || []).map(video => normaliseVideo(video, tab.title || category.title)))
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = Date.parse(a.publishedAt || 0) || 0;
        const bTime = Date.parse(b.publishedAt || 0) || 0;
        return bTime - aTime;
      });

    return dedupeVideos(videos).slice(0, category.latestCount || 6);
  }

  function getSubTabVideos(tab) {
    if (!tab) return [];
    return (tab.items || [])
      .map(video => normaliseVideo(video, tab.title))
      .filter(Boolean)
      .sort((a, b) => a.position - b.position);
  }

  function getEmbedSrc(videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
  }

  function showFeatured(video, metaLabel) {
    if (!featureFrame || !featureState || !selectedState || !video) return;
    featureFrame.src = getEmbedSrc(video.videoId);
    featureTitle.textContent = video.title || "Featured Video";
    featureMeta.textContent = metaLabel || "Featured";
    featureNote.textContent = video.note || "";
    featureNote.hidden = !video.note;
    featureState.hidden = false;
    selectedState.hidden = true;
    if (topGrid) topGrid.classList.remove("is-selected");
  }

  function showSelected(video, metaLabel, shouldScroll = true) {
    if (!playerFrame || !featureState || !selectedState || !video) return;
    playerFrame.src = getEmbedSrc(video.videoId);
    playerTitle.textContent = video.title || "Selected Video";
    playerMeta.textContent = metaLabel || "Playlist Video";
    playerNote.textContent = video.note || "";
    playerNote.hidden = !video.note;
    featureState.hidden = true;
    selectedState.hidden = false;
    currentVideo = { ...video, metaLabel: metaLabel || "Playlist Video" };

    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function setDefaultTopArea() {
    const featured = data.featured || {};
    if (featured.videoId) {
      currentVideo = null;
      showFeatured({
        videoId: featured.videoId,
        title: featured.title || "Featured Video",
        note: featured.note || ""
      }, "Featured");
    }
  }

  function keepCurrentTopArea() {
    if (!currentVideo) return;
    showSelected(currentVideo, currentVideo.metaLabel, false);
  }

  function renderCategoryTabs() {
    if (!categoryTabs) return;
    categoryTabs.innerHTML = "";

    (data.categories || []).forEach(category => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "videos-tab" + (category.id === activeCategoryId ? " active" : "");
      button.textContent = category.title;

      button.addEventListener("click", () => {
        if (activeCategoryId === category.id) return;
        activeCategoryId = category.id;
        const firstSub = category.subTabs && category.subTabs[0];
        activeSubTabId = firstSub ? firstSub.id : "";
        currentPage = 1;
        renderAll();
        keepCurrentTopArea();
      });

      categoryTabs.appendChild(button);
    });
  }

  function renderSubTabs() {
    if (!subTabs) return;
    subTabs.innerHTML = "";

    const category = getActiveCategory();
    if (!category || !(category.subTabs || []).length) {
      subTabs.hidden = true;
      return;
    }

    subTabs.hidden = false;

    (category.subTabs || []).forEach(tab => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "videos-subtab" + (tab.id === activeSubTabId ? " active" : "");
      button.textContent = tab.title;

      button.addEventListener("click", () => {
        if (activeSubTabId === tab.id) return;
        activeSubTabId = tab.id;
        currentPage = 1;
        renderSubTabs();
        renderLibrary();
      });

      subTabs.appendChild(button);
    });
  }

  function createLatestCard(video, sourceTitle) {
    const article = document.createElement("article");
    article.className = "videos-latest-card";
    article.innerHTML = `
      <button type="button" class="videos-thumb-button">
        <span class="videos-latest-thumb" style="background-image:url('${video.thumbnail}')"></span>
      </button>
      <div class="videos-latest-copy">
        <div class="videos-card-title">${video.title}</div>
        <div class="videos-card-meta">${sourceTitle || video.tag || "Video"}</div>
        ${video.publishedAt ? `<div class="videos-card-date">${new Date(video.publishedAt).toLocaleDateString()}</div>` : ""}
      </div>
    `;

    article.querySelector(".videos-thumb-button").addEventListener("click", () => {
      showSelected(video, sourceTitle || video.tag || "Video");
    });

    return article;
  }

  function createLibraryCard(video, sourceTitle) {
    const article = document.createElement("article");
    article.className = "frame videos-library-card";
    article.innerHTML = `
      <button type="button" class="videos-thumb-button">
        <span class="videos-library-thumb" style="background-image:url('${video.thumbnail}')"></span>
      </button>
      <div class="videos-library-copy">
        <div class="videos-card-title">${video.title}</div>
        <div class="videos-card-meta">${sourceTitle || video.tag || "Video"}</div>
        <div class="videos-card-date-row">
          ${video.publishedAt ? `<div class="videos-card-date">${new Date(video.publishedAt).toLocaleDateString()}</div>` : ""}
          ${video.duration ? `<div class="videos-card-duration">${formatDuration(video.duration)}</div>` : ""}
        </div>
      </div>
    `;

    article.querySelector(".videos-thumb-button").addEventListener("click", () => {
      showSelected(video, sourceTitle || video.tag || "Video");
    });

    return article;
  }

  function renderLibrary() {
    if (!libraryGrid || !libraryPager || !emptyState) return;

    libraryGrid.innerHTML = "";
    libraryPager.innerHTML = "";
    emptyState.innerHTML = "";

    const category = getActiveCategory();
    if (!category) return;

    if (category.id === "latest") {
      const latestVideos = getCategoryLatestVideos(category);
      if (libraryTitle) libraryTitle.textContent = "Latest Videos";

      if (!latestVideos.length) {
        emptyState.innerHTML = `
          <article class="frame videos-placeholder">
            <div class="videos-placeholder-title">Latest Videos</div>
            <p>This tab will fill automatically once the YouTube playlist sync is bringing in items.</p>
          </article>
        `;
        return;
      }

      latestVideos.forEach(video => {
        libraryGrid.appendChild(createLibraryCard(video, "Latest Videos"));
      });
      return;
    }

    const tab = getActiveSubTab();
    if (!tab) return;
    if (libraryTitle) libraryTitle.textContent = tab.title;

    const videos = getSubTabVideos(tab);

    if (!videos.length) {
      emptyState.innerHTML = `
        <article class="frame videos-placeholder">
          <div class="videos-placeholder-title">${tab.title}</div>
          <p>This playlist is connected, but there are no synced site items for it yet.</p>
          ${tab.playlistUrl ? `<div class="cta-row"><a class="btn primary" href="${tab.playlistUrl}" target="_blank" rel="noopener noreferrer">Open Playlist on YouTube</a></div>` : ""}
        </article>
      `;
      return;
    }

    const totalPages = Math.max(1, Math.ceil(videos.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * pageSize;
    const pageItems = videos.slice(start, start + pageSize);

    pageItems.forEach(video => {
      libraryGrid.appendChild(createLibraryCard(video, tab.title));
    });

    if (totalPages > 1) {
      const prev = document.createElement("button");
      prev.type = "button";
      prev.className = "btn";
      prev.textContent = "Previous";
      prev.disabled = currentPage === 1;
      prev.addEventListener("click", () => {
        currentPage -= 1;
        renderLibrary();
      });

      const pageLabel = document.createElement("div");
      pageLabel.className = "videos-page-label";
      pageLabel.textContent = `Page ${currentPage} of ${totalPages}`;

      const next = document.createElement("button");
      next.type = "button";
      next.className = "btn";
      next.textContent = "Next";
      next.disabled = currentPage === totalPages;
      next.addEventListener("click", () => {
        currentPage += 1;
        renderLibrary();
      });

      libraryPager.append(prev, pageLabel, next);
    }
  }

  function updateSummaryText() {
    const category = getActiveCategory();
    if (!summaryText) return;

    if (!category) {
      summaryText.textContent = "Featured content, latest uploads, and curated playlist browsing by game.";
      return;
    }

    if (category.id === "latest") {
      summaryText.textContent = "The latest uploads across the current synced playlists, ready to open in the main player or browse from the latest tab.";
      return;
    }

    const tabCount = (category.subTabs || []).length;
    summaryText.textContent = `${category.title} videos grouped into ${tabCount} playlist${tabCount === 1 ? "" : "s"}, with the latest uploads shown below the player and full playlist browsing underneath.`;
  }

  function renderAll() {
    const category = getActiveCategory();
    if (category && category.id !== "latest" && (!activeSubTabId || !(category.subTabs || []).some(tab => tab.id === activeSubTabId))) {
      activeSubTabId = (category.subTabs && category.subTabs[0] && category.subTabs[0].id) || "";
    }

    renderCategoryTabs();
    renderSubTabs();
    updateSummaryText();
    renderLibrary();
  }

  setDefaultTopArea();
  renderAll();
})();
