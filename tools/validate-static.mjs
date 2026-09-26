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
  contact: "contact/index.html",
  privacy: "privacy/index.html"
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

    const imageTags = [...source.matchAll(/<img\b[^>]*>/gi)].map(match => match[0]);
    const imagesWithoutDimensions = imageTags.filter(tag => !/\bwidth\s*=\s*["']\d+["']/i.test(tag) || !/\bheight\s*=\s*["']\d+["']/i.test(tag));
    record(result, `html:${page}:image-dimensions`, imagesWithoutDimensions.length === 0, {
      file: relative,
      message: imagesWithoutDimensions.length ? `${imagesWithoutDimensions.length} image(s) missing intrinsic width/height` : `${imageTags.length} image(s) include intrinsic dimensions`
    });

    const requiredMetadata = [
      ["title", /<title>[^<]+<\/title>/i],
      ["description", /<meta\s+name=["']description["']\s+content=["'][^"']+["']/i],
      ["canonical", /<link\s+rel=["']canonical["']\s+href=["']https:\/\/krispykp\.com\//i],
      ["Open Graph title", /<meta\s+property=["']og:title["']\s+content=["'][^"']+["']/i],
      ["Twitter title", /<meta\s+name=["']twitter:title["']\s+content=["'][^"']+["']/i]
    ];
    const missingMetadata = requiredMetadata.filter(([, pattern]) => !pattern.test(source)).map(([label]) => label);
    record(result, `html:${page}:metadata`, missingMetadata.length === 0, {
      file: relative,
      message: missingMetadata.length ? `missing ${missingMetadata.join(", ")}` : "core SEO/social metadata present"
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

function validatePublishingControls(root, result) {
  const contentFiles = [
    ...walk(path.join(root, "data"), filename => /\.(?:js|mjs|json)$/i.test(filename)),
    ...Object.values(PAGE_FILES).map(relative => path.join(root, relative))
  ].filter(filename => fs.existsSync(filename));
  const mojibake = [];
  const malformedUrls = [];
  const urlPattern = /https?:\/\/[^\s"'<>\\)]+/gi;

  for (const filename of contentFiles) {
    const source = fs.readFileSync(filename, "utf8");
    if (/[\u00c3\u00c2\uFFFD]|\u00e2[\u20ac\u201a]|\\u00(?:0[0-8BCEF]|1[0-9A-Fa-f])/u.test(source)) {
      mojibake.push(path.relative(root, filename).replaceAll("\\", "/"));
    }
    for (const match of source.matchAll(urlPattern)) {
      const raw = match[0].replace(/[.,;:!?]+$/, "");
      let url;
      try { url = new URL(raw); }
      catch (_error) { continue; }
      const host = url.hostname.toLowerCase().replace(/^www\./, "");
      const parts = url.pathname.split("/").filter(Boolean);
      if (host === "twitch.tv" && (!/^[a-z0-9_]{1,25}$/i.test(parts[0] || "") || (parts.length > 1 && !(parts.length === 2 && parts[1] === "follow")))) {
        malformedUrls.push(`${path.relative(root, filename)} -> ${raw}`);
      }
      if (host === "challonge.com" && (!/^[a-z0-9_-]+$/i.test(parts[0] || "") || (parts.length > 1 && !(parts.length === 2 && parts[1] === "module")))) {
        malformedUrls.push(`${path.relative(root, filename)} -> ${raw}`);
      }
    }
  }
  record(result, "publishing:text-integrity", mojibake.length === 0, {
    message: mojibake.length ? `suspicious encoding markers: ${mojibake.join(", ")}` : `${contentFiles.length} published content files checked for mojibake/control escapes`
  });
  record(result, "publishing:known-platform-urls", malformedUrls.length === 0, {
    message: malformedUrls.length ? malformedUrls.join("; ") : "known Twitch and Challonge URL shapes checked"
  });

  const securityFile = path.join(root, ".well-known", "security.txt");
  const security = fs.existsSync(securityFile) ? fs.readFileSync(securityFile, "utf8") : "";
  const contact = security.match(/^Contact:\s*(\S+)/mi)?.[1] || "";
  const expires = security.match(/^Expires:\s*(\S+)/mi)?.[1] || "";
  const expiresAt = Date.parse(expires);
  record(result, "publishing:security-txt", Boolean(contact) && Number.isFinite(expiresAt) && expiresAt > Date.now(), {
    file: ".well-known/security.txt",
    message: !security ? "security.txt missing" : `Contact ${contact || "missing"}; Expires ${expires || "missing/invalid"}`
  });

  const manifestFile = path.join(root, "site.webmanifest");
  let manifest = null;
  try { manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8")); } catch (_error) { /* covered by JSON syntax */ }
  const icons = Array.isArray(manifest?.icons) ? manifest.icons : [];
  const manifestIconsValid = icons.length > 0 && icons.every(icon => {
    const resolved = resolveReference(root, manifestFile, icon?.src || "");
    return Boolean(icon?.sizes && icon?.type && resolved && fs.existsSync(resolved));
  });
  const manifestValid = Boolean(manifest?.name?.trim() && manifest?.short_name?.trim() && manifest?.theme_color && manifest?.background_color && manifestIconsValid);
  record(result, "publishing:web-manifest", manifestValid, {
    file: "site.webmanifest",
    message: manifestValid ? `${icons.length} manifest icons and required identity fields checked` : "manifest identity, colours or icons are incomplete"
  });

  const contactFile = path.join(root, "contact", "index.html");
  const contactSource = fs.readFileSync(contactFile, "utf8");
  const forms = [...contactSource.matchAll(/<form\b[\s\S]*?<\/form>/gi)].map(match => match[0]).filter(form => /formspree\.io/i.test(form));
  const disclosed = forms.length === 2 && forms.every(form => /Formspree/i.test(form) && /href=["']\/privacy\/["']/i.test(form));
  const primaryPagesLinkPrivacy = Object.entries(PAGE_FILES)
    .filter(([page]) => page !== "privacy")
    .every(([, relative]) => /href=["']\/privacy\/["']/i.test(fs.readFileSync(path.join(root, relative), "utf8")));
  record(result, "publishing:privacy-disclosure", disclosed && primaryPagesLinkPrivacy, {
    file: "contact/index.html",
    message: disclosed && primaryPagesLinkPrivacy ? "both Formspree forms disclose processing and every primary page links privacy information" : "missing adjacent Formspree disclosure or global privacy link"
  });
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
  validateGitDiff(root, result);
  validateHtml(root, result);
  validatePublishingControls(root, result);
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
