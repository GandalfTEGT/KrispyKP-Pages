import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ALL_PAGES,
  PAGE_ROUTES,
  ROOT,
  createResult,
  detectScope,
  parseArgs,
  record,
  run
} from "./validation-common.mjs";

const PAGE_FILES = {
  home: "index.html",
  music: "music/index.html",
  videos: "videos/index.html",
  tournaments: "tournaments/index.html",
  about: "about/index.html",
  contact: "contact/index.html"
};

function walk(root, filter, directory = root, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", ".validation", ".npm-cache"].includes(entry.name)) continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(root, filter, filename, output);
    else if (filter(filename)) output.push(filename);
  }
  return output;
}

function stripQueryAndHash(value) {
  return value.split(/[?#]/, 1)[0];
}

function resolveReference(root, sourceFile, reference) {
  const clean = stripQueryAndHash(reference.trim());
  if (!clean || clean.startsWith("#") || /^(?:https?:|mailto:|tel:|data:|blob:|javascript:)/i.test(clean)) return null;
  const decoded = decodeURIComponent(clean);
  const candidate = decoded.startsWith("/")
    ? path.join(root, decoded.replace(/^\/+/, ""))
    : path.resolve(path.dirname(sourceFile), decoded);
  if (decoded.endsWith("/")) return path.join(candidate, "index.html");
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return path.join(candidate, "index.html");
  return candidate;
}

function htmlReferences(source) {
  const references = [];
  const attributePattern = /\b(?:src|href|poster|action)\s*=\s*["']([^"']+)["']/gi;
  for (const match of source.matchAll(attributePattern)) references.push(match[1]);
  const srcsetPattern = /\bsrcset\s*=\s*["']([^"']+)["']/gi;
  for (const match of source.matchAll(srcsetPattern)) {
    match[1].split(",").forEach(item => references.push(item.trim().split(/\s+/, 1)[0]));
  }
  return references;
}

function validateHtml(root, result) {
  for (const [page, relative] of Object.entries(PAGE_FILES)) {
    const filename = path.join(root, relative);
    if (!fs.existsSync(filename)) {
      record(result, `html:${page}:exists`, false, { file: relative, message: "page file is missing" });
      continue;
    }
    const source = fs.readFileSync(filename, "utf8");
    const h1Count = (source.match(/<h1\b/gi) || []).length;
    const mainCount = (source.match(/<main\b/gi) || []).length;
    record(result, `html:${page}:structure`, h1Count === 1 && mainCount === 1, {
      file: relative,
      message: `expected one H1 and one main; found H1=${h1Count}, main=${mainCount}`
    });

    const ids = [...source.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]);
    const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    record(result, `html:${page}:ids`, duplicates.length === 0, {
      file: relative,
      message: duplicates.length ? `duplicate IDs: ${duplicates.join(", ")}` : `${ids.length} unique IDs`
    });

    const badReferences = [];
    for (const reference of htmlReferences(source)) {
      const resolved = resolveReference(root, filename, reference);
      if (resolved && (!resolved.startsWith(root + path.sep) || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile())) {
        badReferences.push(reference);
      }
    }
    record(result, `html:${page}:references`, badReferences.length === 0, {
      file: relative,
      message: badReferences.length ? `missing local references: ${badReferences.join(", ")}` : "local references resolve"
    });

    for (const [index, match] of [...source.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].entries()) {
      try {
        JSON.parse(match[1]);
        record(result, `html:${page}:json-ld:${index + 1}`, true, { file: relative });
      } catch (error) {
        record(result, `html:${page}:json-ld:${index + 1}`, false, { file: relative, message: error.message });
      }
    }
  }
}

function validateCssReferences(root, result) {
  const files = walk(root, filename => filename.endsWith(".css"));
  const missing = [];
  for (const filename of files) {
    const source = fs.readFileSync(filename, "utf8");
    for (const match of source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
      const resolved = resolveReference(root, filename, match[1]);
      if (resolved && (!resolved.startsWith(root + path.sep) || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile())) {
        missing.push(`${path.relative(root, filename)} -> ${match[1]}`);
      }
    }
  }
  record(result, "css:local-references", missing.length === 0, {
    message: missing.length ? missing.join("; ") : `${files.length} stylesheets checked`
  });
}

function validateJavaScript(root, result) {
  const files = walk(root, filename => /\.(?:js|mjs|cjs)$/.test(filename));
  const failures = [];
  for (const filename of files) {
    const checked = run(process.execPath, ["--check", filename], { cwd: root });
    if (checked.status !== 0) failures.push(`${path.relative(root, filename)}: ${(checked.stderr || checked.stdout).trim().split(/\r?\n/).slice(-2).join(" ")}`);
  }
  record(result, "javascript:syntax", failures.length === 0, {
    message: failures.length ? failures.join("; ") : `${files.length} JavaScript files parsed`
  });
}

function validateConfiguration(root, result) {
  const check = run(process.execPath, [path.join(root, "tools", "validate-site-config.mjs"), "--root", root], { cwd: root });
  record(result, "configuration:site", check.status === 0, {
    message: (check.status === 0 ? check.stdout : check.stderr || check.stdout).trim()
  });
}

function validateRadarRts(root, result) {
  const filename = path.join(root, "tools", "validate-radar-rts.mjs");
  if (!fs.existsSync(filename)) return;
  const check = run(process.execPath, [filename], { cwd: root });
  record(result, "radar-rts:deterministic-loop", check.status === 0, {
    message: (check.status === 0 ? check.stdout : check.stderr || check.stdout).trim()
  });
}

function validateGitDiff(root, result) {
  const check = run("git", ["diff", "--check"], { cwd: root });
  record(result, "git:diff-check", check.status === 0, {
    message: check.status === 0 ? "no whitespace errors" : (check.stderr || check.stdout).trim()
  });
}

function validateSeo(root, result) {
  const robotsFile = path.join(root, "robots.txt");
  const sitemapFile = path.join(root, "sitemap.xml");
  const robots = fs.existsSync(robotsFile) ? fs.readFileSync(robotsFile, "utf8") : "";
  const sitemap = fs.existsSync(sitemapFile) ? fs.readFileSync(sitemapFile, "utf8") : "";
  const expected = Object.values(PAGE_ROUTES).map(route => `https://krispykp.com${route}`);
  const missingRoutes = expected.filter(url => !sitemap.includes(`<loc>${url}</loc>`));
  record(result, "seo:robots", Boolean(robots) && /User-agent:\s*\*/i.test(robots) && /Sitemap:\s*https:\/\/krispykp\.com\/sitemap\.xml/i.test(robots), {
    message: robots ? "robots directives checked" : "robots.txt missing"
  });
  record(result, "seo:sitemap", Boolean(sitemap) && missingRoutes.length === 0, {
    message: missingRoutes.length ? `missing routes: ${missingRoutes.join(", ")}` : `${expected.length} primary routes present`
  });
}

function validateJson(root, result) {
  const files = walk(root, filename => filename.endsWith(".json"));
  const failures = [];
  for (const filename of files) {
    try { JSON.parse(fs.readFileSync(filename, "utf8")); }
    catch (error) { failures.push(`${path.relative(root, filename)}: ${error.message}`); }
  }
  record(result, "json:syntax", failures.length === 0, { message: failures.length ? failures.join("; ") : `${files.length} JSON files parsed` });
}

export function runStaticValidation({ root = ROOT, profile = "standard", scope = null } = {}) {
  const resolvedScope = scope || detectScope({ root });
  const result = createResult(profile, resolvedScope);
  result.kind = "static";
  validateJavaScript(root, result);
  validateConfiguration(root, result);
  validateRadarRts(root, result);
  validateGitDiff(root, result);
  validateHtml(root, result);
  validateCssReferences(root, result);
  validateJson(root, result);
  validateSeo(root, result);
  if (resolvedScope.extras.includes("builder-compatibility")) {
    result.manual.push("Public tournament schema changed: private Tournament Builder compatibility requires separate authorised evidence.");
  }
  if (resolvedScope.extras.includes("tournament-artifacts")) {
    result.manual.push("Tournament rules/PDF artifacts changed: render and visually inspect generated PDFs; do not overwrite source during validation.");
  }
  return result;
}

function print(result) {
  if (result.status === "PASS") console.log(`STATIC PASS — ${result.checks.length} checks`);
  else {
    console.error(`STATIC FAIL — ${result.failures.length} failure${result.failures.length === 1 ? "" : "s"}`);
    result.failures.forEach(failure => console.error(`- ${failure.name}: ${failure.message || "failed"}`));
  }
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = runStaticValidation(options);
    print(result);
    process.exitCode = result.status === "PASS" ? 0 : 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
