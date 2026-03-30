const allTracks = Array.isArray(window.KRISPY_TRACKS) ? window.KRISPY_TRACKS : [];
const builtInPlaylists = Array.isArray(window.KRISPY_PLAYLISTS) ? window.KRISPY_PLAYLISTS : [];
const lyricsLibrary = window.KRISPY_LYRICS || {};

const CUSTOM_SELECTION_KEY = "krispykp_custom_track_ids_v1";
const CUSTOM_PLAYLIST_NAME_KEY = "krispykp_custom_playlist_name_v1";

let activePlaylistId = "all-tracks";
let activeTracks = [];
let currentTrackId = "";
let shuffle = false;
let muted = false;
let repeatMode = "off"; // off | library | playlist | track
let shufflePool = [];
let playHistory = [];

const audio = document.getElementById("audio");
const artEl = document.getElementById("playerArt");
const songEl = document.getElementById("playerSong");
const artistEl = document.getElementById("playerArtist");
const progressEl = document.getElementById("playerProgress");
const currentTimeEl = document.getElementById("playerCurrentTime");
const durationEl = document.getElementById("playerDuration");
const playBtn = document.getElementById("playBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const muteBtn = document.getElementById("muteBtn");
const volumeEl = document.getElementById("playerVolume");
const seekEl = document.getElementById("playerSeek");
const tracksEl = document.getElementById("tracks");
const statusEl = document.getElementById("playerStatus");
const searchEl = document.getElementById("trackSearch");
const playlistSelectEl = document.getElementById("playlistSelect");
const customTracksEl = document.getElementById("customTracks");
const customCountEl = document.getElementById("customCount");
const saveCustomBtn = document.getElementById("saveCustomBtn");
const loadCustomBtn = document.getElementById("loadCustomBtn");
const exportCustomBtn = document.getElementById("exportCustomBtn");
const importCustomBtn = document.getElementById("importCustomBtn");
const importCustomInput = document.getElementById("importCustomInput");
const clearCustomBtn = document.getElementById("clearCustomBtn");
const customPlaylistNameEl = document.getElementById("customPlaylistName");
const lyricsPanelEl = document.getElementById("lyricsPanel");
const lyricsCopyEl = document.getElementById("lyricsCopy");
const lyricsToggleBtn = document.getElementById("lyricsToggleBtn");

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function slugSafeName(name) {
  return String(name || "playlist")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "playlist";
}

function setStatus(text) {
  statusEl.textContent = text;
}

function getPlayableTracks(trackList) {
  return trackList.filter(track => track && track.available && track.file);
}

function getSavedCustomTrackIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_SELECTION_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function saveCustomTrackIds(trackIds) {
  localStorage.setItem(CUSTOM_SELECTION_KEY, JSON.stringify(trackIds));
}

function getSavedCustomPlaylistName() {
  return localStorage.getItem(CUSTOM_PLAYLIST_NAME_KEY) || "My Selection";
}

function saveCustomPlaylistName(name) {
  localStorage.setItem(CUSTOM_PLAYLIST_NAME_KEY, name || "My Selection");
}

function getBuiltInPlaylistById(id) {
  return builtInPlaylists.find(playlist => playlist.id === id) || null;
}

function getCustomSelectedTracks() {
  const selectedIds = getSavedCustomTrackIds();
  return allTracks.filter(track => selectedIds.includes(track.id));
}

function getTracksForPlaylist(playlistId) {
  if (playlistId === "custom-selection") {
    return getCustomSelectedTracks();
  }

  const playlist = getBuiltInPlaylistById(playlistId);

  if (!playlist || playlist.tracks === "ALL") {
    return [...allTracks];
  }

  const trackMap = new Map(allTracks.map(track => [track.id, track]));
  return playlist.tracks
    .map(trackId => trackMap.get(trackId))
    .filter(Boolean);
}

function refreshActiveTracks() {
  activeTracks = getTracksForPlaylist(activePlaylistId);
}

function getCurrentTrackIndex() {
  return activeTracks.findIndex(track => track.id === currentTrackId);
}

function getCurrentTrack() {
  return activeTracks.find(track => track.id === currentTrackId) || null;
}

function updateRepeatButton() {
  const labels = {
    off: "Repeat: Off",
    library: "Repeat: All",
    playlist: "Repeat: List",
    track: "Repeat: 1"
  };

  repeatBtn.textContent = labels[repeatMode] || "Repeat: Off";
  repeatBtn.classList.toggle("active", repeatMode !== "off");
}

function updateLyrics(track) {
  if (!lyricsCopyEl) return;

  const entry = track ? lyricsLibrary[track.id] : null;
  const text = entry && typeof entry.lyrics === "string" && entry.lyrics.trim()
    ? entry.lyrics.trim()
    : "Lyrics are not available for this track yet.";

  lyricsCopyEl.textContent = text;
  lyricsCopyEl.classList.toggle("is-empty", !(entry && entry.lyrics && entry.lyrics.trim()));
}

function syncLyricsPanelForViewport() {
  if (!lyricsPanelEl || !lyricsToggleBtn) return;

  const mobile = window.matchMedia("(max-width: 980px)").matches;

  if (mobile) {
    if (!lyricsPanelEl.dataset.initializedMobile) {
      lyricsPanelEl.classList.add("collapsed");
      lyricsToggleBtn.setAttribute("aria-expanded", "false");
      lyricsToggleBtn.textContent = "Show Lyrics";
      lyricsPanelEl.dataset.initializedMobile = "true";
    }
  } else {
    lyricsPanelEl.classList.remove("collapsed");
    lyricsToggleBtn.setAttribute("aria-expanded", "true");
    lyricsToggleBtn.textContent = "Hide Lyrics";
    delete lyricsPanelEl.dataset.initializedMobile;
  }
}

function toggleLyricsPanel() {
  if (!lyricsPanelEl || !lyricsToggleBtn) return;

  const isCollapsed = lyricsPanelEl.classList.toggle("collapsed");
  lyricsToggleBtn.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
  lyricsToggleBtn.textContent = isCollapsed ? "Show Lyrics" : "Hide Lyrics";
}

function populatePlaylistSelect() {
  const customTracks = getCustomSelectedTracks();
  const customName = getSavedCustomPlaylistName();

  playlistSelectEl.innerHTML = "";

  builtInPlaylists.forEach(playlist => {
    if (playlist.id === "custom-selection" && !customTracks.length) {
      return;
    }

    const option = document.createElement("option");
    option.value = playlist.id;
    option.textContent = playlist.id === "custom-selection" ? customName : playlist.name;
    playlistSelectEl.appendChild(option);
  });

  if (!Array.from(playlistSelectEl.options).some(option => option.value === activePlaylistId)) {
    activePlaylistId = "all-tracks";
  }

  playlistSelectEl.value = activePlaylistId;
}

function renderCustomTrackBuilder() {
  const selectedIds = new Set(getSavedCustomTrackIds());
  const customTracks = getCustomSelectedTracks();

  customTracksEl.innerHTML = "";

  allTracks.forEach(track => {
    const row = document.createElement("label");
    row.className = "custom-track-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = track.id;
    checkbox.checked = selectedIds.has(track.id);

    checkbox.addEventListener("change", () => {
      const nextSelected = new Set(getSavedCustomTrackIds());

      if (checkbox.checked) {
        nextSelected.add(track.id);
      } else {
        nextSelected.delete(track.id);
      }

      saveCustomTrackIds([...nextSelected]);
      renderCustomTrackBuilder();
      populatePlaylistSelect();

      if (activePlaylistId === "custom-selection") {
        const previousTrackId = currentTrackId;
        refreshActiveTracks();

        if (!activeTracks.some(trackItem => trackItem.id === previousTrackId)) {
          currentTrackId = "";
        }

        renderList();

        if (!currentTrackId && activeTracks.length) {
          loadTrackById(activeTracks[0].id, false, false);
        } else if (!activeTracks.length) {
          clearPlayerDisplay();
          setStatus("Custom selection is empty");
        }
      }
    });

    const textWrap = document.createElement("span");
    textWrap.className = "custom-track-copy";
    textWrap.innerHTML = `<strong>${track.name}</strong><span>${track.album || track.artist}</span>`;

    row.append(checkbox, textWrap);
    customTracksEl.appendChild(row);
  });

  customCountEl.textContent = `${customTracks.length} selected`;
  customPlaylistNameEl.value = getSavedCustomPlaylistName();
}

function clearProgress() {
  progressEl.style.width = "0%";
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
}

function clearPlayerDisplay() {
  artEl.style.backgroundImage = "url('assets/logo.png')";
  songEl.textContent = "Select a track";
  artistEl.textContent = "KrispyKP";
  clearProgress();
  playBtn.textContent = "▶";
  updateLyrics(null);
}

function updateTrackDisplay(track) {
  artEl.style.backgroundImage = `url(${track.art || "assets/logo.png"})`;
  songEl.textContent = track.name || "Unknown track";
  artistEl.textContent = track.artist || "Unknown artist";
  updateLyrics(track);
}

function rebuildShufflePool(excludeTrackId = currentTrackId, useLibraryScope = false) {
  const sourceTracks = useLibraryScope ? getPlayableTracks(allTracks) : getPlayableTracks(activeTracks);

  const trackIds = sourceTracks
    .map(track => track.id)
    .filter(trackId => trackId !== excludeTrackId);

  for (let i = trackIds.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [trackIds[i], trackIds[j]] = [trackIds[j], trackIds[i]];
  }

  shufflePool = trackIds;
}

function getFilteredTrackEntries() {
  const query = searchEl.value.trim().toLowerCase();

  return activeTracks
    .map((track, index) => ({ track, index }))
    .filter(({ track }) => {
      const haystack = `${track.name || ""} ${track.artist || ""} ${track.album || ""}`.toLowerCase();
      return !query || haystack.includes(query);
    });
}

function renderList() {
  tracksEl.innerHTML = "";

  const entries = getFilteredTrackEntries();

  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "track-item unavailable";
    empty.innerHTML = `<div class="thumb" style="background-image:url('assets/logo.png')"></div>
      <div><div class="t-name">No tracks match</div><div class="t-artist">Try a different search or playlist.</div></div>
      <div class="t-tag">Empty</div>`;
    tracksEl.appendChild(empty);
    return;
  }

  entries.forEach(({ track, index }) => {
    const item = document.createElement("div");
    item.className = "track-item" + (track.id === currentTrackId ? " active" : "") + (track.available ? "" : " unavailable");
    item.onclick = () => loadTrackByIndex(index, true, true);

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.style.backgroundImage = `url(${track.art || "assets/logo.png"})`;

    const meta = document.createElement("div");

    const name = document.createElement("div");
    name.className = "t-name";
    name.textContent = track.name || "Unknown track";

    const artist = document.createElement("div");
    artist.className = "t-artist";
    artist.textContent = track.album || track.artist || "Unknown artist";

    meta.append(name, artist);

    const tag = document.createElement("div");
    tag.className = "t-tag";

    if (!track.available || !track.file) {
      tag.textContent = "Unavailable";
    } else if (track.id === currentTrackId) {
      tag.textContent = "Loaded";
    } else {
      tag.textContent = "Ready";
    }

    item.append(thumb, meta, tag);
    tracksEl.appendChild(item);
  });
}

function loadTrackById(trackId, autoplay = false, pushHistory = true) {
  const nextIndex = activeTracks.findIndex(track => track.id === trackId);
  if (nextIndex === -1) return;
  loadTrackByIndex(nextIndex, autoplay, pushHistory);
}

function loadTrackByIndex(index, autoplay = false, pushHistory = true) {
  if (index < 0 || index >= activeTracks.length) return;

  const track = activeTracks[index];

  if (pushHistory && currentTrackId && currentTrackId !== track.id) {
    playHistory.push(currentTrackId);
  }

  currentTrackId = track.id;
  updateTrackDisplay(track);

  audio.pause();
  audio.src = track.file || "";
  audio.currentTime = 0;
  clearProgress();

  if (shuffle) {
    shufflePool = shufflePool.filter(trackId => trackId !== currentTrackId);
  }

  renderList();

  if (!track.available || !track.file) {
    playBtn.textContent = "▶";
    setStatus("Track unavailable");
    return;
  }

  if (autoplay) {
    audio.play()
      .then(() => {
        playBtn.textContent = "⏸";
        setStatus("Playing");
      })
      .catch(() => {
        playBtn.textContent = "▶";
        setStatus("Playback blocked by browser");
      });
  } else {
    playBtn.textContent = "▶";
    setStatus("Ready");
  }
}

function togglePlay() {
  const track = getCurrentTrack();

  if (!track || !track.available || !track.file) {
    setStatus("Track unavailable");
    return;
  }

  if (audio.paused) {
    audio.play()
      .then(() => {
        playBtn.textContent = "⏸";
        setStatus("Playing");
      })
      .catch(() => {
        setStatus("Playback blocked by browser");
      });
  } else {
    audio.pause();
    playBtn.textContent = "▶";
    setStatus("Paused");
  }
}

function moveToTrack(trackId, autoplay = true, pushHistory = true) {
  if (activeTracks.some(track => track.id === trackId)) {
    loadTrackById(trackId, autoplay, pushHistory);
    return;
  }

  activePlaylistId = "all-tracks";
  refreshActiveTracks();
  populatePlaylistSelect();
  renderList();
  loadTrackById(trackId, autoplay, pushHistory);
}

function getNextTrackIdInLibrary() {
  const libraryTracks = getPlayableTracks(allTracks);
  if (!libraryTracks.length) return "";

  const currentLibraryIndex = libraryTracks.findIndex(track => track.id === currentTrackId);

  if (currentLibraryIndex === -1) {
    return libraryTracks[0].id;
  }

  const nextIndex = (currentLibraryIndex + 1) % libraryTracks.length;
  return libraryTracks[nextIndex].id;
}

function getPrevTrackIdInLibrary() {
  const libraryTracks = getPlayableTracks(allTracks);
  if (!libraryTracks.length) return "";

  const currentLibraryIndex = libraryTracks.findIndex(track => track.id === currentTrackId);

  if (currentLibraryIndex === -1) {
    return libraryTracks[0].id;
  }

  const prevIndex = (currentLibraryIndex - 1 + libraryTracks.length) % libraryTracks.length;
  return libraryTracks[prevIndex].id;
}

function nextTrack() {
  if (!activeTracks.length) return;

  if (repeatMode === "track") {
    audio.currentTime = 0;
    audio.play().catch(() => {
      setStatus("Playback blocked by browser");
    });
    return;
  }

  if (shuffle) {
    if (shufflePool.length === 0) {
      if (repeatMode === "playlist") {
        rebuildShufflePool(currentTrackId, false);
      } else if (repeatMode === "library") {
        rebuildShufflePool(currentTrackId, true);
      } else {
        audio.pause();
        playBtn.textContent = "▶";
        setStatus("Ended");
        return;
      }
    }

    if (shufflePool.length > 0) {
      const nextTrackId = shufflePool.shift();
      moveToTrack(nextTrackId, true, true);
      return;
    }
  }

  const currentIndex = getCurrentTrackIndex();

  if (currentIndex === -1) {
    const firstPlayable = getPlayableTracks(activeTracks)[0];
    if (firstPlayable) {
      loadTrackById(firstPlayable.id, true, true);
    }
    return;
  }

  let nextIndex = currentIndex + 1;
  while (nextIndex < activeTracks.length && (!activeTracks[nextIndex].available || !activeTracks[nextIndex].file)) {
    nextIndex += 1;
  }

  if (nextIndex < activeTracks.length) {
    loadTrackByIndex(nextIndex, true, true);
    return;
  }

  if (repeatMode === "playlist") {
    const firstPlayable = getPlayableTracks(activeTracks)[0];
    if (firstPlayable) {
      loadTrackById(firstPlayable.id, true, true);
      return;
    }
  }

  if (repeatMode === "library") {
    const nextLibraryTrackId = getNextTrackIdInLibrary();
    if (nextLibraryTrackId) {
      moveToTrack(nextLibraryTrackId, true, true);
      return;
    }
  }

  audio.pause();
  playBtn.textContent = "▶";
  setStatus("Ended");
}

function prevTrack() {
  if (!activeTracks.length) return;

  if (shuffle && playHistory.length > 0) {
    const previousTrackId = playHistory.pop();
    moveToTrack(previousTrackId, true, false);
    return;
  }

  if (repeatMode === "library") {
    const previousTrackId = getPrevTrackIdInLibrary();
    if (previousTrackId) {
      moveToTrack(previousTrackId, true, false);
      return;
    }
  }

  const currentIndex = getCurrentTrackIndex();

  if (currentIndex <= 0) {
    const firstPlayable = getPlayableTracks(activeTracks)[0];
    if (firstPlayable) {
      loadTrackById(firstPlayable.id, true, false);
    }
    return;
  }

  let previousIndex = currentIndex - 1;
  while (previousIndex >= 0 && (!activeTracks[previousIndex].available || !activeTracks[previousIndex].file)) {
    previousIndex -= 1;
  }

  if (previousIndex >= 0) {
    loadTrackByIndex(previousIndex, true, false);
  }
}

function stopTrack() {
  audio.pause();
  audio.currentTime = 0;
  playBtn.textContent = "▶";
  setStatus("Stopped");
}

function toggleShuffle() {
  shuffle = !shuffle;
  shuffleBtn.classList.toggle("active", shuffle);

  if (shuffle) {
    rebuildShufflePool(currentTrackId, repeatMode === "library");
    playHistory = [];
  } else {
    shufflePool = [];
    playHistory = [];
  }
}

function toggleRepeat() {
  const order = ["off", "library", "playlist", "track"];
  const currentPosition = order.indexOf(repeatMode);
  repeatMode = order[(currentPosition + 1) % order.length];
  updateRepeatButton();

  if (shuffle) {
    rebuildShufflePool(currentTrackId, repeatMode === "library");
  }
}

function toggleMute() {
  muted = !muted;
  audio.muted = muted;
  muteBtn.classList.toggle("active", muted);
  muteBtn.textContent = muted ? "Unmute" : "Mute";
}

function saveCustomSelection() {
  const selectedIds = Array.from(customTracksEl.querySelectorAll('input[type="checkbox"]:checked'))
    .map(input => input.value);

  saveCustomTrackIds(selectedIds);
  saveCustomPlaylistName(customPlaylistNameEl.value.trim() || "My Selection");
  renderCustomTrackBuilder();
  populatePlaylistSelect();

  if (selectedIds.length) {
    activePlaylistId = "custom-selection";
    refreshActiveTracks();
    playlistSelectEl.value = activePlaylistId;
    renderList();
    setStatus("Custom selection saved");
  } else {
    setStatus("No tracks selected");
  }
}

function loadSavedCustomSelection() {
  const selectedIds = getSavedCustomTrackIds();

  if (!selectedIds.length) {
    setStatus("No saved custom selection");
    return;
  }

  activePlaylistId = "custom-selection";
  refreshActiveTracks();
  populatePlaylistSelect();
  playlistSelectEl.value = activePlaylistId;
  renderCustomTrackBuilder();
  renderList();

  const firstPlayable = getPlayableTracks(activeTracks)[0];
  if (firstPlayable) {
    loadTrackById(firstPlayable.id, false, false);
  }

  setStatus("Loaded saved selection");
}

function clearCustomSelection() {
  saveCustomTrackIds([]);
  saveCustomPlaylistName("My Selection");
  renderCustomTrackBuilder();
  populatePlaylistSelect();

  if (activePlaylistId === "custom-selection") {
    activePlaylistId = "all-tracks";
    refreshActiveTracks();
    playlistSelectEl.value = activePlaylistId;
    renderList();

    const firstPlayable = getPlayableTracks(activeTracks)[0];
    if (firstPlayable) {
      loadTrackById(firstPlayable.id, false, false);
    } else {
      clearPlayerDisplay();
    }
  }

  setStatus("Custom selection cleared");
}

function exportCustomSelection() {
  const selectedIds = getSavedCustomTrackIds();

  if (!selectedIds.length) {
    setStatus("No custom selection to export");
    return;
  }

  const payload = {
    name: getSavedCustomPlaylistName(),
    trackIds: selectedIds,
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugSafeName(payload.name)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  setStatus("Custom selection exported");
}

function importCustomSelection(file) {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      const availableIds = new Set(allTracks.map(track => track.id));
      const importedIds = Array.isArray(parsed.trackIds)
        ? parsed.trackIds.filter(trackId => availableIds.has(trackId))
        : [];

      if (!importedIds.length) {
        setStatus("Imported file contains no valid tracks");
        return;
      }

      saveCustomTrackIds(importedIds);
      saveCustomPlaylistName(parsed.name || "My Selection");
      activePlaylistId = "custom-selection";

      refreshActiveTracks();
      populatePlaylistSelect();
      renderCustomTrackBuilder();
      renderList();

      const firstPlayable = getPlayableTracks(activeTracks)[0];
      if (firstPlayable) {
        loadTrackById(firstPlayable.id, false, false);
      }

      setStatus("Custom selection imported");
    } catch (error) {
      setStatus("Invalid playlist file");
    }
  };

  reader.readAsText(file);
}

playlistSelectEl.addEventListener("change", () => {
  activePlaylistId = playlistSelectEl.value;
  refreshActiveTracks();
  playHistory = [];
  shufflePool = [];
  renderList();

  const firstPlayable = getPlayableTracks(activeTracks)[0];
  if (firstPlayable) {
    loadTrackById(firstPlayable.id, false, false);
  } else {
    audio.pause();
    currentTrackId = "";
    clearPlayerDisplay();
    setStatus("No playable tracks in this list");
  }
});

searchEl.addEventListener("input", renderList);

saveCustomBtn.addEventListener("click", saveCustomSelection);
loadCustomBtn.addEventListener("click", loadSavedCustomSelection);
exportCustomBtn.addEventListener("click", exportCustomSelection);
importCustomBtn.addEventListener("click", () => importCustomInput.click());
importCustomInput.addEventListener("change", event => {
  const file = event.target.files && event.target.files[0];
  if (file) {
    importCustomSelection(file);
  }
  importCustomInput.value = "";
});
clearCustomBtn.addEventListener("click", clearCustomSelection);

if (lyricsToggleBtn) {
  lyricsToggleBtn.addEventListener("click", toggleLyricsPanel);
  window.addEventListener("resize", syncLyricsPanelForViewport);
}

audio.ontimeupdate = () => {
  if (!audio.duration) return;

  const percent = (audio.currentTime / audio.duration) * 100;
  progressEl.style.width = `${percent}%`;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
};

audio.onplay = () => {
  playBtn.textContent = "⏸";
  setStatus("Playing");
};

audio.onpause = () => {
  playBtn.textContent = "▶";
  if (audio.currentTime > 0 && audio.currentTime < (audio.duration || Infinity)) {
    setStatus("Paused");
  }
};

audio.onended = () => nextTrack();

volumeEl.oninput = () => {
  audio.volume = Number(volumeEl.value);
};

seekEl.onclick = event => {
  if (!audio.duration) return;
  const rect = seekEl.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  audio.currentTime = percent * audio.duration;
};

audio.volume = Number(volumeEl.value);

populatePlaylistSelect();
refreshActiveTracks();
renderCustomTrackBuilder();
updateRepeatButton();
renderList();
syncLyricsPanelForViewport();

const firstPlayable = getPlayableTracks(activeTracks)[0];
if (firstPlayable) {
  loadTrackById(firstPlayable.id, false, false);
} else {
  clearPlayerDisplay();
}
