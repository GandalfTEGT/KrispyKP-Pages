import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ALL_PAGES, ROOT, detectScope, writeJson } from "./validation-common.mjs";
import { runStaticValidation } from "./validate-static.mjs";
import { runBrowserValidation } from "./validate-browser.mjs";

const targets = {
  javascript: path.join(ROOT, "data", "about.js"),
  html: path.join(ROOT, "about", "index.html"),
  config: path.join(ROOT, "data", "tournaments.config.js"),
  musicCss: path.join(ROOT, "styles", "music.css"),
  sharedCss: path.join(ROOT, "styles", "command-deck.css")
};
const originals = new Map(Object.values(targets).map(filename => [filename, fs.readFileSync(filename)]));
const digest = value => crypto.createHash("sha256").update(value).digest("hex");
const originalDigests = new Map([...originals].map(([filename, value]) => [filename, digest(value)]));
const cases = [];

function restore(filename) {
  fs.writeFileSync(filename, originals.get(filename));
}

function expectFailure(name, result, checkPrefix) {
  const detected = result.status === "FAIL" && result.failures.some(failure => failure.name.startsWith(checkPrefix));
  cases.push({ name, status: detected ? "PASS" : "FAIL", detectedBy: result.failures.map(failure => failure.name) });
}

function expectScope(name, scopeResult, expectedPages, expectedExtras = []) {
  const pagesMatch = expectedPages.every(page => scopeResult.pages.includes(page)) && scopeResult.pages.length === expectedPages.length;
  const extrasMatch = expectedExtras.every(extra => scopeResult.extras.includes(extra));
  cases.push({
    name,
    status: pagesMatch && extrasMatch ? "PASS" : "FAIL",
    pages: scopeResult.pages,
    extras: scopeResult.extras
  });
}

const scope = detectScope({ root: ROOT });
try {
  try {
    fs.appendFileSync(targets.javascript, "\nconst validatorSelfTest = ;\n", "utf8");
    expectFailure("JavaScript syntax error", runStaticValidation({ root: ROOT, profile: "smoke", scope }), "javascript:syntax");
  } finally { restore(targets.javascript); }

  try {
    const source = originals.get(targets.html).toString("utf8").replace("</body>", '<img src="/assets/validator-self-test-missing.png" alt="">\n</body>');
    fs.writeFileSync(targets.html, source, "utf8");
    expectFailure("Missing local asset", runStaticValidation({ root: ROOT, profile: "smoke", scope }), "html:about:references");
  } finally { restore(targets.html); }

  try {
    const source = originals.get(targets.config).toString("utf8");
    const mutated = source.replace(/(["']?currentEventId["']?\s*:\s*)["'][^"']+["']/, '$1"__validator_invalid_event__"');
    if (mutated === source) throw new Error("Could not locate currentEventId fixture point");
    fs.writeFileSync(targets.config, mutated, "utf8");
    expectFailure("Invalid tournament configuration", runStaticValidation({ root: ROOT, profile: "smoke", scope }), "configuration:site");
  } finally { restore(targets.config); }

  try {
    const source = originals.get(targets.config).toString("utf8");
    const mutated = source.replace('"status": "awaiting-results"', '"status": "live"');
    if (mutated === source) throw new Error("Could not locate stale-live fixture point");
    fs.writeFileSync(targets.config, mutated, "utf8");
    expectFailure("Stale live tournament", runStaticValidation({ root: ROOT, profile: "smoke", scope }), "configuration:site");
  } finally { restore(targets.config); }

  try {
    const source = originals.get(targets.html).toString("utf8").replace("</main>", '<p>Broken encoding: Ã¢â‚¬â€œ</p>\n</main>');
    fs.writeFileSync(targets.html, source, "utf8");
    expectFailure("Suspicious mojibake", runStaticValidation({ root: ROOT, profile: "smoke", scope }), "publishing:text-integrity");
  } finally { restore(targets.html); }

  try {
    const source = originals.get(targets.html).toString("utf8").replace("</main>", '<a href="https://www.twitch.tv/krispykp.com">Malformed Twitch fixture</a>\n</main>');
    fs.writeFileSync(targets.html, source, "utf8");
    expectFailure("Malformed known-platform URL", runStaticValidation({ root: ROOT, profile: "smoke", scope }), "publishing:known-platform-urls");
  } finally { restore(targets.html); }

  try {
    const source = originals.get(targets.html).toString("utf8").replace("</body>", '<div id="validator-self-test-overflow" style="width:200vw;height:1px"></div>\n</body>');
    fs.writeFileSync(targets.html, source, "utf8");
    const result = await runBrowserValidation({ root: ROOT, profile: "standard", scope, pages: ["about"] });
    expectFailure("Horizontal document overflow", result, "browser:about:");
  } finally { restore(targets.html); }

  try {
    fs.appendFileSync(targets.musicCss, "\n/* validator scope probe */\n", "utf8");
    expectScope("Music-only change scope", detectScope({ root: ROOT, files: ["styles/music.css"] }), ["music"]);
  } finally { restore(targets.musicCss); }

  try {
    fs.appendFileSync(targets.sharedCss, "\n/* validator scope probe */\n", "utf8");
    expectScope("Shared command-deck scope", detectScope({ root: ROOT, files: ["styles/command-deck.css"] }), ALL_PAGES);
  } finally { restore(targets.sharedCss); }

  try {
    fs.appendFileSync(targets.config, "\n// validator scope probe\n", "utf8");
    expectScope(
      "Tournament schema scope",
      detectScope({ root: ROOT, files: ["data/tournaments.config.js"] }),
      ["home", "tournaments", "contact"],
      ["tournament-artifacts", "builder-compatibility"]
    );
  } finally { restore(targets.config); }
} finally {
  for (const filename of originals.keys()) restore(filename);
}

const restoration = [...originals.keys()].map(filename => ({
  file: path.relative(ROOT, filename).replaceAll("\\", "/"),
  restored: digest(fs.readFileSync(filename)) === originalDigests.get(filename)
}));
const passed = cases.every(test => test.status === "PASS") && restoration.every(item => item.restored);
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  status: passed ? "PASS" : "FAIL",
  cases,
  restoration
};
writeJson(path.join(ROOT, ".validation", "self-test.json"), report);

if (passed) console.log(`SELF-TEST PASS — ${cases.length} detection/scope probes passed; all source bytes restored`);
else {
  console.error("SELF-TEST FAIL");
  cases.filter(test => test.status === "FAIL").forEach(test => console.error(`- not detected: ${test.name}`));
  restoration.filter(item => !item.restored).forEach(item => console.error(`- not restored: ${item.file}`));
  process.exitCode = 1;
}
