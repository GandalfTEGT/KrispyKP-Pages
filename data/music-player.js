const tracks = Array.isArray(window.KRISPY_TRACKS) ? window.KRISPY_TRACKS : [];

let index = 0;
let shuffle = false;
let repeat = false;
let muted = false;
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

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function renderList() {
  const query = searchEl.value.trim().toLowerCase();
  tracksEl.innerHTML = "";

  tracks.forEach((track, i) => {
    const haystack = `${track.name || ""} ${track.artist || ""}`.toLowerCase();
    if (query && !haystack.includes(query)) return;

    const item = document.createElement("div");
    item.className = "track-item" + (i === index ? " active" : "") + (track.available ? "" : " unavailable");
    item.onclick = () => loadTrack(i, true, true);

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.style.backgroundImage = `url(${track.art || "logo.png"})`;

    const meta = document.createElement("div");
    const name = document.createElement("div");
    name.className = "t-name";
    name.textContent = track.name || "Unknown track";

    const artist = document.createElement("div");
    artist.className = "t-artist";
    artist.textContent = track.artist || "Unknown artist";

    meta.append(name, artist);

    const tag = document.createElement("div");
    tag.className = "t-tag";
    tag.textContent = track.available ? (i === index ? "Loaded" : "Ready") : "Unavailable";

    item.append(thumb, meta, tag);
    tracksEl.appendChild(item);
  });
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function rebuildShufflePool(excludeIndex = index) {
  const availableIndexes = tracks
    .map((track, i) => ({ track, i }))
    .filter(({ track, i }) => track.available && i !== excludeIndex)
    .map(({ i }) => i);

  shufflePool = shuffleArray(availableIndexes);
}

function resetProgress() {
  audio.currentTime = 0;
  progressEl.style.width = "0%";
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
}

function updateTrackDisplay(track) {
  artEl.style.backgroundImage = `url(${track.art || "logo.png"})`;
  songEl.textContent = track.name || "Unknown track";
  artistEl.textContent = track.artist || "Unknown artist";
}

function loadTrack(i, autoplay = false, pushHistory = true) {
  if (i < 0 || i >= tracks.length) return;

  if (pushHistory && i !== index) {
    playHistory.push(index);
  }

  index = i;
  const track = tracks[index];
  updateTrackDisplay(track);
  resetProgress();

  if (track.available && track.file) {
    audio.src = track.file;
  } else {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    playBtn.textContent = "▶";
    setStatus("Track unavailable");
    renderList();
    return;
  }

  if (shuffle) {
    shufflePool = shufflePool.filter((item) => item !== index);
  }

  renderList();

  if (autoplay) {
    audio.play().then(() => {
      playBtn.textContent = "⏸";
      setStatus("Playing");
    }).catch(() => {
      playBtn.textContent = "▶";
      setStatus("Playback blocked by browser");
    });
  } else {
    audio.pause();
    playBtn.textContent = "▶";
    setStatus("Ready");
  }
}

function togglePlay() {
  const track = tracks[index];
  if (!track || !track.available || !track.file) {
    setStatus("Track unavailable");
    return;
  }

  if (audio.paused) {
    audio.play().then(() => {
      playBtn.textContent = "⏸";
      setStatus("Playing");
    }).catch(() => {
      setStatus("Playback blocked by browser");
    });
  } else {
    audio.pause();
    playBtn.textContent = "▶";
    setStatus("Paused");
  }
}

function nextTrack() {
  if (!tracks.length) return;

  if (shuffle) {
    if (shufflePool.length === 0) {
      if (repeat) {
        rebuildShufflePool(index);
      } else {
        audio.pause();
        playBtn.textContent = "▶";
        setStatus("Ended");
        return;
      }
    }

    if (shufflePool.length > 0) {
      loadTrack(shufflePool.shift(), true, true);
      return;
    }
  }

  let nextIndex = index + 1;
  while (nextIndex < tracks.length && !tracks[nextIndex].available) {
    nextIndex += 1;
  }

  if (nextIndex >= tracks.length) {
    if (repeat) {
      nextIndex = tracks.findIndex((track) => track.available);
      if (nextIndex === -1) {
        setStatus("No playable tracks");
        return;
      }
    } else {
      audio.pause();
      playBtn.textContent = "▶";
      setStatus("Ended");
      return;
    }
  }

  loadTrack(nextIndex, true, true);
}

function prevTrack() {
  if (!tracks.length) return;

  if (shuffle && playHistory.length > 0) {
    const previousIndex = playHistory.pop();
    loadTrack(previousIndex, true, false);
    return;
  }

  let previousIndex = index - 1;
  while (previousIndex >= 0 && !tracks[previousIndex].available) {
    previousIndex -= 1;
  }

  if (previousIndex < 0) {
    previousIndex = tracks.findIndex((track) => track.available);
    if (previousIndex === -1) {
      setStatus("No playable tracks");
      return;
    }
  }

  loadTrack(previousIndex, true, false);
}

function rewindTrack() {
  audio.currentTime = 0;
  setStatus(audio.paused ? statusEl.textContent : "Playing");
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
    rebuildShufflePool(index);
    playHistory = [];
  } else {
    shufflePool = [];
    playHistory = [];
  }
}

function toggleRepeat() {
  repeat = !repeat;
  repeatBtn.classList.toggle("active", repeat);
}

function toggleMute() {
  muted = !muted;
  audio.muted = muted;
  muteBtn.classList.toggle("active", muted);
  muteBtn.textContent = muted ? "Unmute" : "Mute";
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

seekEl.onclick = (event) => {
  if (!audio.duration) return;
  const rect = seekEl.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  audio.currentTime = percent * audio.duration;
};

searchEl.addEventListener("input", renderList);

audio.volume = Number(volumeEl.value);
renderList();

if (tracks.length) {
  const firstPlayable = tracks.findIndex((track) => track.available && track.file);
  loadTrack(firstPlayable >= 0 ? firstPlayable : 0, false, false);
}
