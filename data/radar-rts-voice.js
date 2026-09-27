// Original phrases, spoken only by an installed local system voice. No remote speech service.
export const VOICE_LINES = Object.freeze({
  select: ["Command link ready.", 1], order: ["Moving to coordinates.", 1], attack: ["Engaging designated target.", 2],
  construction: ["Construction authorised.", 2], ready: ["Construction complete.", 3], production: ["Unit operational.", 2],
  low: ["Power reserve depleted.", 4], baseAttack: ["Command perimeter under attack.", 5],
  unitLost: ["Unit signal lost.", 3], structureLost: ["Structure signal lost.", 4],
  stormReady: ["Ion array is ready.", 4], storm: ["Ion strike confirmed.", 5],
  repair: ["Repair crews assigned.", 2], sell: ["Structure decommissioned.", 2],
  victory: ["Hostile command neutralised. Mission secured.", 6], defeat: ["Command link lost. Mission ended.", 6]
});
const KEY = "krispy-radar-voice-enabled";
export function readVoiceEnabled() { try { return globalThis.localStorage?.getItem(KEY) === "true"; } catch { return false; } }
export function saveVoiceEnabled(value) { try { globalThis.localStorage?.setItem(KEY, String(value)); } catch { /* session fallback */ } }
export class RadarRTSVoice {
  constructor({ enabled = false, volume = .65, synth = globalThis.speechSynthesis, utterance = text => new SpeechSynthesisUtterance(text), now = () => performance.now() } = {}) {
    this.enabled = enabled; this.synth = synth; this.utterance = utterance; this.now = now;
    this.lastEvent = 0; this.last = new Map(); this.lastSpoken = -Infinity; this.active = null; this.paused = false;
    this.volume = volume; this.queue = [];
  }
  localVoice() { return this.synth?.getVoices().find(v => v.localService && /^en(?:-|_)/i.test(v.lang)) || null; }
  play(type) {
    const line = VOICE_LINES[type], voice = this.localVoice(), time = this.now();
    if (!this.enabled || this.paused || !line || !voice || time - (this.last.get(type) ?? -Infinity) < 12000) return false;
    // Only critical warnings interrupt. Routine and strategic notifications wait,
    // with bounded lifetime so a busy battle cannot accumulate stale chatter.
    if (this.active && !(line[1] >= 5 && line[1] > this.active.priority)) {
      if (!this.queue.some(item => item.type === type)) this.queue.push({ type, priority: line[1], expires: time + (line[1] <= 2 ? 3000 : 6500) });
      this.queue.sort((a,b) => b.priority - a.priority); this.queue.length = Math.min(4, this.queue.length);
      return false;
    }
    if (this.active) { const previous = this.active; this.active = null; previous.speech.onend = previous.speech.onerror = null; this.synth.cancel(); }
    const speech = this.utterance(line[0]); speech.voice = voice; speech.volume = this.volume; speech.rate = 1;
    this.active = { speech, priority: line[1] }; this.lastSpoken = time; this.last.set(type, time);
    const finish = () => { if (this.active?.speech === speech) { this.active = null; this.drain(); } };
    speech.onend = finish; speech.onerror = finish; this.synth.speak(speech); return true;
  }
  drain() {
    this.queue = this.queue.filter(item => item.expires > this.now());
    if (this.active || !this.enabled || this.paused) return;
    while (this.queue.length && !this.active) this.play(this.queue.shift().type);
  }
  consume(events) {
    const fresh = events.filter(e => e.id > this.lastEvent).sort((a, b) => (VOICE_LINES[b.type]?.[1] || 0) - (VOICE_LINES[a.type]?.[1] || 0));
    this.lastEvent = events.at(-1)?.id ?? this.lastEvent;
    for (const event of fresh) this.play(event.type);
    this.drain();
  }
  clear() { this.queue = []; const previous = this.active; this.active = null; if (previous) { previous.speech.onend = previous.speech.onerror = null; this.synth?.cancel(); } }
  pause() { this.paused = true; this.clear(); }
  resume() { this.paused = false; }
  setEnabled(value) { this.enabled = value; if (!value) this.clear(); }
  snapshot() { return { enabled: this.enabled, available: Boolean(this.localVoice()), speaking: Boolean(this.active), queued: this.queue.length }; }
  destroy() { this.clear(); this.enabled = false; this.last.clear(); this.lastEvent = 0; }
}
