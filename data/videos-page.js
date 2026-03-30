(function () {
  const data = window.KRISPY_VIDEO_DATA || {};
  const pageSize = Number(data.pageSize) > 0 ? Number(data.pageSize) : 8;

  const featuredShell = document.getElementById("featuredPlayerShell");
  const playerFrame = document.getElementById("videosPlayerFrame");
  const playerTitle = document.getElementById("videosPlayerTitle");
  const playerMeta = document.getElementById("videosPlayerMeta");
  const playerNote = document.getElementById("videosPlayerNote");

  const categoryTabs = document.getElementById("videoCategoryTabs");
  const subTabs = document.getElementById("videoSubTabs");
  const latestGrid = document.getElementById("latestVideoGrid");
  const libraryGrid = document.getElementById("videoLibraryGrid");
  const libraryPager = document.getElementById("videoLibraryPager");
  const emptyState = document.getElementById("videoEmptyState");

  let activeCategoryId = (data.categories && data.categories[0] && data.categories[0].id) || "";
  let activeSubTabId = "";
  let selectedVideoId = "";
  let currentPage = 1;

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
    };
  }

  function getCategoryLatestVideos(category) {
    if (!category) return [];
    const videos = (category.subTabs || [])
      .flatMap(tab => (tab.items || []).map(video => normaliseVideo(video, category.title)))
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = Date.parse(a.publishedAt || 0) || 0;
        const bTime = Date.parse(b.publishedAt || 0) || 0;
        return bTime - aTime;
      });

    const seen = new Set();
    return videos.filter(video => {
      if (seen.has(video.videoId)) return false;
      seen.add(video.videoId);
      return true;
    }).slice(0, category.latestCount || 6);
  }

  function getSubTabVideos(tab) {
    if (!tab) return [];
    return (tab.items || [])
      .map(video => normaliseVideo(video, tab.title))
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = Date.parse(a.publishedAt || 0) || 0;
        const bTime = Date.parse(b.publishedAt || 0) || 0;
        return bTime - aTime;
      });
  }

  function setPlayer(video, sourceTitle, isFeaturedDefault) {
    if (!playerFrame || !video) return;

    const src = `https://www.youtube.com/embed/${video.videoId}?autoplay=0&rel=0&modestbranding=1`;
    playerFrame.src = src;
    playerTitle.textContent = video.title || "Featured Video";
    playerMeta.textContent = sourceTitle || "Featured";
    playerNote.textContent = video.note || "";
    selectedVideoId = video.videoId;

    if (featuredShell) {
      featuredShell.classList.toggle("is-selected", !isFeaturedDefault);
    }
  }

  function setDefaultFeaturedPlayer() {
    const featured = data.featured || {};
    if (!featured.videoId) return;

    setPlayer({
      videoId: featured.videoId,
      title: featured.title || "Featured Video",
      note: featured.note || ""
    }, "Featured", true);
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
      });

      categoryTabs.appendChild(button);
    });
  }

  function renderSubTabs() {
    if (!subTabs) return;
    subTabs.innerHTML = "";

    const category = getActiveCategory();
    if (!category) return;

    (category.subTabs || []).forEach(tab => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "videos-subtab" + (tab.id === activeSubTabId ? " active" : "");
      button.textContent = tab.title;

      button.addEventListener("click", () => {
        if (activeSubTabId === tab.id) return;
        activeSubTabId = tab.id;
        currentPage = 1;
        renderLibrary();
      });

      subTabs.appendChild(button);
    });
  }

  function createVideoCard(video, sourceTitle) {
    const article = document.createElement("article");
    article.className = "frame videos-card";

    article.innerHTML = `
      <button type="button" class="videos-thumb-button">
        <span class="videos-thumb" style="background-image:url('${video.thumbnail}')"></span>
      </button>
      <div class="videos-card-copy">
        <div class="videos-card-title">${video.title}</div>
        <div class="videos-card-meta">${sourceTitle || video.tag || "Video"}</div>
        ${video.publishedAt ? `<div class="videos-card-date">${new Date(video.publishedAt).toLocaleDateString()}</div>` : ""}
      </div>
    `;

    const playButton = article.querySelector(".videos-thumb-button");
    playButton.addEventListener("click", () => {
      setPlayer(video, sourceTitle || video.tag || "Video", false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    return article;
  }

  function renderLatest() {
    if (!latestGrid) return;
    latestGrid.innerHTML = "";

    const category = getActiveCategory();
    const latest = getCategoryLatestVideos(category);

    if (!latest.length) {
      latestGrid.innerHTML = `
        <article class="frame videos-placeholder">
          <div class="videos-placeholder-title">No synced videos yet</div>
          <p>This section will show the newest few videos across all ${category ? category.title : ""} sub-playlists once playlist items are added or auto-synced.</p>
        </article>
      `;
      return;
    }

    latest.forEach(video => {
      latestGrid.appendChild(createVideoCard(video, "Latest"));
    });
  }

  function renderLibrary() {
    if (!libraryGrid || !libraryPager || !emptyState) return;

    libraryGrid.innerHTML = "";
    libraryPager.innerHTML = "";
    emptyState.innerHTML = "";

    const tab = getActiveSubTab();
    if (!tab) return;

    const videos = getSubTabVideos(tab);

    if (!videos.length) {
      emptyState.innerHTML = `
        <article class="frame videos-placeholder">
          <div class="videos-placeholder-title">${tab.title}</div>
          <p>This playlist is connected, but no site video items have been synced into the page yet.</p>
          <div class="cta-row">
            <a class="btn primary" href="${tab.playlistUrl}" target="_blank" rel="noopener noreferrer">Open Playlist on YouTube</a>
          </div>
        </article>
      `;
      return;
    }

    const totalPages = Math.max(1, Math.ceil(videos.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * pageSize;
    const pageItems = videos.slice(start, start + pageSize);

    pageItems.forEach(video => {
      libraryGrid.appendChild(createVideoCard(video, tab.title));
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

  function renderAll() {
    const category = getActiveCategory();
    if (category && (!activeSubTabId || !(category.subTabs || []).some(tab => tab.id === activeSubTabId))) {
      activeSubTabId = (category.subTabs && category.subTabs[0] && category.subTabs[0].id) || "";
    }

    renderCategoryTabs();
    renderSubTabs();
    renderLatest();
    renderLibrary();
  }

  setDefaultFeaturedPlayer();
  renderAll();
})();
