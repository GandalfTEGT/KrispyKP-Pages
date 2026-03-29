
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
const vol = document.getElementById("playerVolume");
const seek = document.getElementById("playerSeek");
const tracksEl = document.getElementById("tracks");
const statusEl = document.getElementById("playerStatus");
const searchEl = document.getElementById("trackSearch");

function formatTime(seconds){
  if(!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2,"0")}`;
}

function renderList(){
  const query = searchEl.value.trim().toLowerCase();
  tracksEl.innerHTML = "";

  tracks.forEach((track, i) => {
    const hay = `${track.name} ${track.artist}`.toLowerCase();
    if(query && !hay.includes(query)) return;

    const item = document.createElement("div");
    item.className = "track-item" + (i === index ? " active" : "") + (track.available ? "" : " unavailable");
    item.onclick = () => loadTrack(i, false, true);

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.style.backgroundImage = `url(${track.art || 'assets/logo.png'})`;

    const meta = document.createElement("div");
    const name = document.createElement("div");
    name.className = "t-name";
    name.textContent = track.name;

    const artist = document.createElement("div");
    artist.className = "t-artist";
    artist.textContent = track.artist;

    meta.append(name, artist);

    const tag = document.createElement("div");
    tag.className = "t-tag";
    tag.textContent = track.available ? (i === index ? "Loaded" : "Ready") : "Placeholder";

    item.append(thumb, meta, tag);
    tracksEl.appendChild(item);
  });
}

function shuffleArray(arr){
  const copy = [...arr];
  for(let i = copy.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function rebuildShufflePool(excludeIndex = index){
  const available = tracks.map((_, i) => i).filter(i => i !== excludeIndex);
  shufflePool = shuffleArray(available);
}

function setStatus(text){
  statusEl.textContent = text;
}

function loadTrack(i, autoplay = false, pushHistory = true){
  if(i < 0 || i >= tracks.length) return;
  if(pushHistory && i !== index) playHistory.push(index);
  index = i;
  const track = tracks[index];
  artEl.style.backgroundImage = `url(${track.art || 'assets/logo.png'})`;
  songEl.textContent = track.name || "Placeholder track";
  artistEl.textContent = track.artist || "Placeholder artist";
  audio.src = track.file || "";
  audio.currentTime = 0;
  progressEl.style.width = "0%";
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";

  if(autoplay && track.available){
    audio.play().catch(() => {});
    playBtn.textContent = "⏸";
    setStatus("Playing");
  }else{
    audio.pause();
    playBtn.textContent = "▶";
    setStatus(track.available ? "Ready" : "Placeholder file missing");
  }

  if(shuffle){
    shufflePool = shufflePool.filter(item => item !== index);
  }

  renderList();
}

function togglePlay(){
  const track = tracks[index];
  if(!track) return;
  if(!track.available){
    setStatus("Add audio files to /media/music and set available:true in data/tracks.js");
    return;
  }
  if(audio.paused){
    audio.play().catch(() => {});
    playBtn.textContent = "⏸";
    setStatus("Playing");
  } else {
    audio.pause();
    playBtn.textContent = "▶";
    setStatus("Paused");
  }
}

function nextTrack(){
  if(shuffle){
    if(shufflePool.length === 0){
      if(repeat){
        rebuildShufflePool(index);
      } else {
        setStatus("Ended");
        audio.pause();
        playBtn.textContent = "▶";
        return;
      }
    }
    if(shufflePool.length > 0){
      loadTrack(shufflePool.shift(), true, true);
      return;
    }
  }
  let nextIndex = index + 1;
  if(nextIndex >= tracks.length){
    if(repeat){
      nextIndex = 0;
    } else {
      nextIndex = tracks.length - 1;
      audio.pause();
      playBtn.textContent = "▶";
      setStatus("Ended");
      return;
    }
  }
  loadTrack(nextIndex, true, true);
}

function prevTrack(){
  if(shuffle && playHistory.length > 0){
    const previousIndex = playHistory.pop();
    loadTrack(previousIndex, true, false);
    return;
  }
  loadTrack(Math.max(0, index - 1), true, false);
}

function rewindTrack(){
  audio.currentTime = 0;
  setStatus(audio.paused ? statusEl.textContent : "Playing");
}

function toggleShuffle(){
  shuffle = !shuffle;
  shuffleBtn.classList.toggle("active", shuffle);
  if(shuffle){
    rebuildShufflePool(index);
    playHistory = [];
  } else {
    shufflePool = [];
    playHistory = [];
  }
}

function toggleRepeat(){
  repeat = !repeat;
  repeatBtn.classList.toggle("active", repeat);
}

function toggleMute(){
  muted = !muted;
  audio.muted = muted;
  muteBtn.classList.toggle("active", muted);
  muteBtn.textContent = muted ? "Unmute" : "Mute";
}

audio.ontimeupdate = () => {
  if(audio.duration){
    const percent = (audio.currentTime / audio.duration) * 100;
    progressEl.style.width = percent + "%";
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
  }
};

audio.onplay = () => {
  playBtn.textContent = "⏸";
  setStatus("Playing");
};
audio.onpause = () => {
  playBtn.textContent = "▶";
  if(audio.currentTime > 0 && audio.currentTime < (audio.duration || Infinity)) setStatus("Paused");
};
audio.onended = () => nextTrack();
vol.oninput = () => { audio.volume = Number(vol.value); };
seek.onclick = (e) => {
  if(!audio.duration) return;
  const rect = seek.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  audio.currentTime = percent * audio.duration;
};
searchEl.addEventListener("input", renderList);
audio.volume = Number(vol.value);

renderList();
if(tracks.length) loadTrack(0, false, false);
