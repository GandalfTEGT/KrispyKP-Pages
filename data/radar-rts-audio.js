// Original oscillator effects: no sampled or third-party audio assets.
const KEY = "krispy-radar-sfx-muted";
const TONES = Object.freeze({
  start: [260, 720, .22], select: [620, 830, .07], order: [370, 600, .11],
  fire: [150, 65, .06], hit: [100, 38, .07], destroy: [180, 28, .3],
  ready: [520, 1040, .2], low: [180, 120, .28], storm: [95, 780, .55],
  victory: [400, 1200, .65], defeat: [320, 60, .65]
  , construction: [240, 480, .13], production: [560, 950, .16], repair: [420, 650, .12], sell: [680, 280, .19],
  attack: [460, 210, .13], baseAttack: [280, 180, .22], unitLost: [220, 100, .18], structureLost: [170, 70, .24], stormReady: [480, 1150, .3]
});

export function readSfxMuted() {
  try { return globalThis.localStorage?.getItem(KEY) === "true"; } catch { return false; }
}
export function saveSfxMuted(muted) {
  try { globalThis.localStorage?.setItem(KEY, String(muted)); } catch { /* Session preference still works. */ }
}

export class RadarRTSAudio {
  constructor({ muted = readSfxMuted(), volume = 1, contextFactory } = {}) {
    this.muted = muted; this.volume = volume;
    this.context = null;
    this.voices = new Set();
    this.last = new Map();
    this.lastEvent = 0;
    this.contextFactory = contextFactory || (() => {
      const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
      return Context ? new Context() : null;
    });
  }
  start() {
    if (this.muted) return;
    try { this.context ||= this.contextFactory(); this.context?.resume()?.catch(() => {}); } catch { this.context = null; }
  }
  setMuted(muted) {
    this.muted = muted;
    saveSfxMuted(muted);
    if (muted) this.clear(); else this.start();
  }
  clear() {
    for (const voice of [...this.voices]) { try { voice.osc.stop(); voice.osc.disconnect(); voice.gain.disconnect(); } catch { /* Already ended. */ } }
    this.voices.clear();
    this.last.clear();
  }
  pause() { this.clear(); this.context?.suspend()?.catch(() => {}); }
  play(type) {
    const ctx = this.context, tone = TONES[type];
    if (this.muted || this.volume <= 0 || !ctx || ctx.state !== "running" || !tone || this.voices.size >= 6) return false;
    const now = ctx.currentTime, interval = ["fire", "hit"].includes(type) ? .14 : .08;
    if (now - (this.last.get(type) ?? -Infinity) < interval) return false;
    this.last.set(type, now);
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    const voice = { osc, gain }; this.voices.add(voice);
    osc.type = ["fire", "destroy", "hit"].includes(type) ? "triangle" : "sine";
    osc.frequency.setValueAtTime(tone[0], now); osc.frequency.exponentialRampToValueAtTime(tone[1], now + tone[2]);
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(Math.max(.0001, .045 * this.volume), now + .012); gain.gain.exponentialRampToValueAtTime(.0001, now + tone[2]);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.onended = () => { this.voices.delete(voice); osc.disconnect(); gain.disconnect(); };
    osc.start(now); osc.stop(now + tone[2] + .02);
    return true;
  }
  consume(events) {
    const fresh = events.filter(event => event.id > this.lastEvent);
    this.lastEvent = events.at(-1)?.id ?? this.lastEvent;
    // Prefer important notifications over a burst of weapon sounds.
    fresh.sort((a, b) => Number(["fire", "hit"].includes(a.type)) - Number(["fire", "hit"].includes(b.type)));
    fresh.slice(0, 6).forEach(event => this.play(event.type));
  }
  snapshot() { return { muted: this.muted, contextState: this.context?.state || "none", voices: this.voices.size }; }
  destroy() {
    this.clear();
    this.context?.close()?.catch(() => {});
    this.context = null; this.lastEvent = 0;
  }
}
