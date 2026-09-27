// Browser-independent input/preferences. Reserved browser chords are never captured.
export const COMMANDS = Object.freeze({
  "center-base": ["Center base", "Home"], stop: ["Stop", "s"], guard: ["Guard location", "g"],
  scatter: ["Scatter", "d"], "force-fire": ["Force fire", "f"], "attack-move": ["Attack move", "a"],
  repair: ["Repair", "r"], sell: ["Sell", "x"], special: ["Ion Storm target", "i"],
  "select-army": ["Select combat units", "u"], "build-tab": ["Construction tab", "b"], pause: ["Pause / resume", " "]
});
export const DEFAULT_BINDINGS = Object.freeze(Object.fromEntries(Object.entries(COMMANDS).map(([id, value]) => [id, value[1]])));
export const HOTKEYS = Object.freeze({ ...Object.fromEntries(Object.entries(DEFAULT_BINDINGS).map(([id, key]) => [key, id])), Escape: "escape" });
const KEY = "krispy-radar-settings-v1";
export function validBinding(key) { return typeof key === "string" && (/^[a-z]$/.test(key) || ["Home", "End", " "].includes(key)); }
export function bindKey(bindings, command, key) {
  key = key.length === 1 ? key.toLowerCase() : key;
  if (!COMMANDS[command] || !validBinding(key)) return { error: "Use a letter, Space, Home or End. Browser shortcuts and group keys are reserved." };
  if (Object.entries(bindings).some(([id, bound]) => id !== command && bound === key)) return { error: "That key already belongs to another command." };
  return { bindings: { ...bindings, [command]: key } };
}
export function normaliseSettings(value = {}) {
  const settings = { edgeScroll: value.edgeScroll !== false, edgeSpeed: Math.max(150, Math.min(1400, Number(value.edgeSpeed) || 700)), edgeMargin: Math.max(20, Math.min(72, Number(value.edgeMargin) || 44)), middlePan: value.middlePan !== false, rightDragPan: value.rightDragPan === true,
    mouseModel: value.mouseModel === "classic-left" ? "classic-left" : "right-action", sfxVolume: Math.max(0, Math.min(1, Number.isFinite(value.sfxVolume) ? value.sfxVolume : 1)),
    voiceVolume: Math.max(0, Math.min(1, Number.isFinite(value.voiceVolume) ? value.voiceVolume : .65)), bindings: { ...DEFAULT_BINDINGS } };
  const candidate = value.bindings;
  if (candidate && Object.keys(COMMANDS).every(id => validBinding(candidate[id])) && new Set(Object.values(candidate)).size === Object.keys(COMMANDS).length) settings.bindings = Object.fromEntries(Object.keys(COMMANDS).map(id => [id, candidate[id]]));
  return settings;
}
export function readSettings(storage) { try { return normaliseSettings(JSON.parse((storage || globalThis.localStorage)?.getItem(KEY) || "{}") || {}); } catch { return normaliseSettings(); } }
export function saveSettings(value, storage) { try { (storage || globalThis.localStorage)?.setItem(KEY, JSON.stringify(value)); } catch { /* current-session values remain live */ } }
export function hotkeyCommand(event, bindings = DEFAULT_BINDINGS) {
  if (event.key === "Escape") return "escape";
  if (event.ctrlKey || event.metaKey || event.altKey || event.target?.isContentEditable || /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(event.target?.tagName || "")) return null;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  return Object.entries(bindings).find(([, bound]) => bound === key)?.[0] || ({ArrowLeft:"camera-left",ArrowRight:"camera-right",ArrowUp:"camera-up",ArrowDown:"camera-down"})[key] || null;
}
export function groupCommand(event) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.target?.isContentEditable || /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(event.target?.tagName || "")) return null;
  const number = /^Digit([1-9])$/.exec(event.code || "")?.[1] || (/^[1-9]$/.test(event.key) ? event.key : null);
  return number ? { number, assign: Boolean(event.shiftKey) } : null;
}
export class ControlGroups {
  constructor() { this.groups = new Map(); this.last = null; }
  assign(number, units) { this.groups.set(String(number), units.filter(u => !u.dead && u.controllerId === "commander").map(u => u.id)); }
  recall(number, units, now) {
    number = String(number);
    const ids = (this.groups.get(number) || []).filter(id => units.some(u => u.id === id && !u.dead && u.controllerId === "commander"));
    this.groups.set(number, ids);
    const center = this.last?.number === number && now - this.last.time < 400;
    this.last = { number, time: now }; return { ids, center };
  }
  clear() { this.groups.clear(); this.last = null; }
}
export function edgeVelocity(point, width, height, margin = 24) {
  if (!point || point.x < 0 || point.y < 0 || point.x > width || point.y > height) return { x: 0, y: 0 };
  const axis = (value, limit) => value < margin ? -(1 - value / margin) : value > limit - margin ? 1 - (limit - value) / margin : 0;
  const x = axis(point.x, width), y = axis(point.y, height), length = Math.max(1, Math.hypot(x, y));
  return { x: x / length, y: y / length };
}
