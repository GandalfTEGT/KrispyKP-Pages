import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PAGE_ROUTES = {
  home: "/",
  music: "/music/",
  videos: "/videos/",
  tournaments: "/tournaments/",
  about: "/about/",
  contact: "/contact/"
};
export const ALL_PAGES = Object.keys(PAGE_ROUTES);
export const PROFILE_VIEWPORTS = {
  smoke: [390],
  standard: [390, 1024],
  acceptance: [320, 390, 768, 1024, 1440]
};

export function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd || ROOT,
    encoding: "utf8",
    windowsHide: true,
    env: { ...process.env, ...(options.env || {}) }
  });
}

export function git(args, root = ROOT) {
  return run("git", args, { cwd: root });
}

export function gitText(args, root = ROOT) {
  const result = git(args, root);
  return result.status === 0 ? result.stdout.trim() : "";
}

export function parseArgs(argv) {
  const options = { profile: "standard", screenshots: false, browserOnly: false, json: null, base: null, pages: null, root: ROOT };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--profile" && next) { options.profile = next; index += 1; }
    else if (arg === "--json" && next) { options.json = path.resolve(next); index += 1; }
    else if (arg === "--base" && next) { options.base = next; index += 1; }
    else if (arg === "--pages" && next) { options.pages = next === "all" ? [...ALL_PAGES] : next.split(",").map(value => value.trim()).filter(Boolean); index += 1; }
    else if (arg === "--root" && next) { options.root = path.resolve(next); index += 1; }
    else if (arg === "--screenshots") options.screenshots = true;
    else if (arg === "--browser-only") options.browserOnly = true;
    else if (arg === "--help") options.help = true;
    else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  if (!PROFILE_VIEWPORTS[options.profile]) throw new Error(`Unknown profile '${options.profile}'. Use smoke, standard or acceptance.`);
  if (options.pages) {
    const unknown = options.pages.filter(page => !ALL_PAGES.includes(page));
    if (unknown.length) throw new Error(`Unknown page scope: ${unknown.join(", ")}`);
  }
  return options;
}

function changedFilesForBase(root, base) {
  const files = new Set();
  const addLines = output => output.split(/\r?\n/).map(value => value.trim()).filter(Boolean).forEach(value => files.add(value.replaceAll("\\", "/")));
  const mergeBase = gitText(["merge-base", "HEAD", base], root);
  if (mergeBase) addLines(gitText(["diff", "--name-only", `${mergeBase}...HEAD`], root));
  addLines(gitText(["diff", "--name-only"], root));
  addLines(gitText(["diff", "--name-only", "--cached"], root));
  addLines(gitText(["ls-files", "--others", "--exclude-standard"], root));
  return [...files].sort();
}

export function detectScope({ root = ROOT, base = null, files: providedFiles = null } = {}) {
  const selectedBase = base || (gitText(["rev-parse", "--verify", "origin/main"], root) ? "origin/main" : "main");
  const files = providedFiles ? [...providedFiles].sort() : changedFilesForBase(root, selectedBase);
  const pages = new Set();
  const reasons = [];
  const extras = new Set();
  const add = (...names) => names.forEach(name => pages.add(name));

  const shared = /^(?:styles\/(?:site|command-deck|radar-game)\.css|data\/(?:site-ui|radar-game|radar-effects|radar-rts-(?:definitions|engine|renderer))\.js)$/;
  for (const file of files) {
    if (shared.test(file)) {
      add(...ALL_PAGES);
      reasons.push(`${file}: shared site system`);
    } else if (file === "index.html" || file.startsWith("styles/home") || file.startsWith("data/home-")) {
      add("home");
    } else if (file.startsWith("music/") || /^(?:styles\/music\.css|data\/(?:music-player|lyrics)\.js)$/.test(file)) {
      add("music");
    } else if (file === "data/tracks.js" || file.startsWith("assets/music/")) {
      add("home", "music");
    } else if (file.startsWith("videos/") || /^(?:styles\/videos\.css|data\/videos-page\.js)$/.test(file)) {
      add("videos");
    } else if (/^(?:data\/videos\.generated\.js|data\/video-playlists\.config\.mjs)$/.test(file)) {
      add("home", "videos");
    } else if (file.startsWith("tournaments/") || /^(?:styles\/tournaments\.css|data\/tournaments-page\.js)$/.test(file)) {
      add("tournaments");
    } else if (file === "data/tournaments.config.js") {
      add("home", "tournaments", "contact");
      extras.add("tournament-artifacts");
      extras.add("builder-compatibility");
    } else if (/^(?:tools\/generate-tournament-rules\.py|assets\/trules\/)/.test(file)) {
      add("tournaments");
      extras.add("tournament-artifacts");
      extras.add("builder-compatibility");
    } else if (file.startsWith("about/") || /^(?:styles\/about\.css|data\/about\.js)$/.test(file)) {
      add("about");
    } else if (file.startsWith("contact/") || /^(?:styles\/contact\.css|data\/contact\.js)$/.test(file)) {
      add("contact");
    } else if (file === "robots.txt" || file === "sitemap.xml" || file === "CNAME") {
      extras.add("seo");
    } else if (file.startsWith("assets/") && !/\.(?:md|txt)$/i.test(file)) {
      add(...ALL_PAGES);
      reasons.push(`${file}: unclassified production asset`);
    }
  }

  return { base: selectedBase, files, pages: [...pages], extras: [...extras], reasons };
}

export function createResult(profile, scope) {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    profile,
    status: "PASS",
    scope,
    checks: [],
    failures: [],
    warnings: [],
    manual: []
  };
}

export function record(result, name, passed, details = {}) {
  const entry = { name, status: passed ? "PASS" : "FAIL", ...details };
  result.checks.push(entry);
  if (!passed) {
    result.status = "FAIL";
    result.failures.push(entry);
  }
  return passed;
}

export function writeJson(filename, value) {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function defaultResultPath(root = ROOT) {
  return path.join(root, ".validation", "last-run.json");
}

export function findChromiumExecutable() {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE && fs.existsSync(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE)) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  }
  const candidates = process.platform === "win32" ? [
    path.join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(process.env.PROGRAMFILES || "C:\\Program Files", "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(process.env.PROGRAMFILES || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe")
  ] : process.platform === "darwin" ? [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
  ] : [
    "/usr/bin/google-chrome", "/usr/bin/microsoft-edge", "/usr/bin/chromium", "/usr/bin/chromium-browser"
  ];
  return candidates.find(candidate => fs.existsSync(candidate)) || null;
}

export function platformSummary() {
  return `${os.platform()} ${os.release()} / Node ${process.version}`;
}
