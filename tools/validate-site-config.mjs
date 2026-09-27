import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log("Usage: node tools/validate-site-config.mjs [--root <repository-root>] [--tournament-config <candidate-file>]");
  process.exit(0);
}

let root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let tournamentConfigPath = null;
for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  const value = args[index + 1];
  if (argument === "--root" && value) {
    root = path.resolve(value);
    index += 1;
  } else if (argument === "--tournament-config" && value) {
    tournamentConfigPath = path.resolve(value);
    index += 1;
  } else {
    console.error(`Unknown or incomplete argument: ${argument}`);
    console.error("Usage: node tools/validate-site-config.mjs [--root <repository-root>] [--tournament-config <candidate-file>]");
    process.exit(2);
  }
}

const errors = [];
const checkedAssets = new Set();

function fail(location, message) {
  errors.push(`${location}: ${message}`);
}

function requiredString(value, location) {
  if (typeof value !== "string" || !value.trim()) {
    fail(location, "must be a non-empty string");
    return false;
  }
  return true;
}

function uniqueStrings(items, field, location) {
  const seen = new Set();
  for (const [index, item] of items.entries()) {
    const value = item?.[field];
    if (!requiredString(value, `${location}[${index}].${field}`)) continue;
    if (seen.has(value)) fail(`${location}[${index}].${field}`, `duplicate value '${value}'`);
    seen.add(value);
  }
  return seen;
}

function loadClassicScript(relativePath) {
  const filename = relativePath === "data/tournaments.config.js" && tournamentConfigPath
    ? tournamentConfigPath
    : path.join(root, relativePath);
  const context = { window: {} };
  vm.createContext(context);
  try {
    vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename });
  } catch (error) {
    fail(relativePath, `could not be loaded (${error.message})`);
  }
  return context.window;
}

function validateLocalAsset(route, location, { required = false } = {}) {
  if (typeof route !== "string" || !route.trim()) {
    if (required) fail(location, "must name a local asset");
    return;
  }
  if (/^(?:https?:|data:)/i.test(route)) return;
  const relative = route.replace(/^[/\\]+/, "");
  const resolved = path.resolve(root, relative);
  const insideRoot = resolved === root || resolved.startsWith(`${root}${path.sep}`);
  if (!insideRoot) {
    fail(location, "must resolve inside the repository");
    return;
  }
  checkedAssets.add(relative.replaceAll("\\", "/"));
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    fail(location, `local asset does not exist: ${route}`);
  }
}

function validatePublishedText(value, location) {
  if (typeof value === "string") {
    if (/[\u00c3\u00c2\uFFFD]|\u00e2[\u20ac\u201a]/u.test(value)) {
      fail(location, "contains a suspicious mojibake marker");
    }
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/u.test(value)) {
      fail(location, "contains an unexpected control character");
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => validatePublishedText(entry, `${location}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, entry]) => validatePublishedText(entry, `${location}.${key}`));
  }
}

function parsePublishedDate(value, location) {
  if (typeof value !== "string" || !value.trim()) return null;
  const normalised = value.trim().replace(" ", "T");
  const timestamp = Date.parse(/(?:Z|[+-]\d\d:?\d\d)$/i.test(normalised) ? normalised : `${normalised}${normalised.length === 10 ? "T00:00:00" : ":00"}Z`);
  if (!Number.isFinite(timestamp)) fail(location, `is not a valid publishing date: '${value}'`);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function validateKnownPlatformUrl(value, location) {
  if (typeof value !== "string" || !value.trim() || !/^https?:/i.test(value)) return;
  let url;
  try { url = new URL(value); }
  catch (_error) {
    fail(location, `is not a valid URL: '${value}'`);
    return;
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);
  if (host === "twitch.tv") {
    if (!/^[a-z0-9_]{1,25}$/i.test(parts[0] || "") || (parts.length > 1 && !(parts.length === 2 && parts[1] === "follow"))) {
      fail(location, `is not a recognised Twitch channel URL: '${value}'`);
    }
  } else if (host === "challonge.com") {
    if (!/^[a-z0-9_-]+$/i.test(parts[0] || "") || (parts.length > 1 && !(parts.length === 2 && parts[1] === "module"))) {
      fail(location, `is not a recognised Challonge event URL: '${value}'`);
    }
  }
}

function validateRules(rules, location) {
  if (Array.isArray(rules)) {
    rules.forEach((rule, index) => requiredString(rule, `${location}[${index}]`));
    return;
  }
  if (!rules || typeof rules !== "object" || !Array.isArray(rules.sections)) {
    fail(location, "must be a legacy string array or structured rules object with sections");
    return;
  }
  if (!rules.sections.length) fail(`${location}.sections`, "must contain at least one section");
  rules.sections.forEach((section, sectionIndex) => {
    const sectionPath = `${location}.sections[${sectionIndex}]`;
    requiredString(section?.title, `${sectionPath}.title`);
    for (const field of ["paragraphs", "bullets"]) {
      if (section?.[field] === undefined) continue;
      if (!Array.isArray(section[field])) {
        fail(`${sectionPath}.${field}`, "must be an array");
      } else {
        section[field].forEach((entry, index) => requiredString(entry, `${sectionPath}.${field}[${index}]`));
      }
    }
  });
  if (rules.mapPool !== undefined) {
    if (!Array.isArray(rules.mapPool)) fail(`${location}.mapPool`, "must be an array");
    else rules.mapPool.forEach((map, index) => requiredString(map, `${location}.mapPool[${index}]`));
  }
}

function validateTournaments() {
  const relativePath = "data/tournaments.config.js";
  const data = loadClassicScript(relativePath).KRISPY_TOURNAMENTS;
  if (!data || typeof data !== "object" || !Array.isArray(data.events)) {
    fail(relativePath, "must define window.KRISPY_TOURNAMENTS.events as an array");
    return { events: 0, matches: 0 };
  }

  const eventIds = uniqueStrings(data.events, "id", "events");
  if (data.currentEventId !== null && data.currentEventId !== undefined) {
    if (requiredString(data.currentEventId, "currentEventId") && !eventIds.has(data.currentEventId)) {
      fail("currentEventId", `does not match an event: '${data.currentEventId}'`);
    }
  }

  const statuses = new Set(["live", "upcoming", "awaiting-results", "completed", "cancelled"]);
  const registrationModes = new Set(["none", "closed", "external", "challonge"]);
  const bracketModes = new Set(["manual", "embed", "link", "none"]);
  let matchCount = 0;

  data.events.forEach((event, eventIndex) => {
    const eventPath = `events[${eventIndex}]`;
    validatePublishedText(event, eventPath);
    requiredString(event?.title, `${eventPath}.title`);
    if (!statuses.has(event?.status)) fail(`${eventPath}.status`, `must be one of ${[...statuses].join(", ")}`);
    if (event?.registrationMode !== undefined && !registrationModes.has(event.registrationMode)) {
      fail(`${eventPath}.registrationMode`, `must be one of ${[...registrationModes].join(", ")}`);
    }
    if (["external", "challonge"].includes(event?.registrationMode)) {
      requiredString(event.registrationUrl, `${eventPath}.registrationUrl`);
    }
    if (!bracketModes.has(event?.bracketMode)) {
      fail(`${eventPath}.bracketMode`, `must be one of ${[...bracketModes].join(", ")}`);
    }
    if (event?.bracketMode === "embed") requiredString(event.bracketEmbedUrl, `${eventPath}.bracketEmbedUrl`);
    if (event?.bracketMode === "link") requiredString(event.bracketUrl, `${eventPath}.bracketUrl`);

    for (const field of ["registrationUrl", "streamUrl", "bracketUrl", "bracketEmbedUrl"]) {
      validateKnownPlatformUrl(event?.[field], `${eventPath}.${field}`);
    }

    const startAt = parsePublishedDate(event?.startDate, `${eventPath}.startDate`);
    const endAt = parsePublishedDate(event?.endDate, `${eventPath}.endDate`);
    const overrideExpiresAt = parsePublishedDate(event?.statusOverrideExpires, `${eventPath}.statusOverrideExpires`);
    const now = Date.now();
    if (startAt && endAt && endAt < startAt) fail(`${eventPath}.endDate`, "must not be earlier than startDate");
    if (event?.status === "live") {
      if (!startAt) fail(`${eventPath}.startDate`, "is required while status is 'live'");
      requiredString(event?.lastUpdated, `${eventPath}.lastUpdated`);
      if (startAt && startAt > now + 15 * 60 * 1000) fail(`${eventPath}.status`, "cannot be 'live' before startDate");
      const liveExpiry = endAt || overrideExpiresAt;
      if (liveExpiry && liveExpiry < now) fail(`${eventPath}.status`, "is stale because the live window/override has expired");
      if (!liveExpiry && startAt && now - startAt > 48 * 60 * 60 * 1000) {
        fail(`${eventPath}.status`, "has remained 'live' for more than 48 hours without endDate or statusOverrideExpires");
      }
    }
    if (event?.status === "upcoming" && startAt && startAt < now - 6 * 60 * 60 * 1000) {
      fail(`${eventPath}.status`, "is 'upcoming' after its startDate");
    }
    if (event?.status === "awaiting-results") {
      if (!startAt) fail(`${eventPath}.startDate`, "is required while status is 'awaiting-results'");
      if (startAt && startAt > now) fail(`${eventPath}.status`, "cannot await results before startDate");
      requiredString(event?.lastUpdated, `${eventPath}.lastUpdated`);
      if (!["closed", "none"].includes(event?.registrationMode)) {
        fail(`${eventPath}.registrationMode`, "must be closed or none while awaiting results");
      }
    }

    validateLocalAsset(event?.bannerImage, `${eventPath}.bannerImage`);
    validateLocalAsset(event?.rulesUrl, `${eventPath}.rulesUrl`);

    const players = Array.isArray(event?.players) ? event.players : [];
    if (!Array.isArray(event?.players)) fail(`${eventPath}.players`, "must be an array");
    uniqueStrings(players, "name", `${eventPath}.players`);
    players.forEach((player, playerIndex) => validateLocalAsset(player?.flagImage, `${eventPath}.players[${playerIndex}].flagImage`));

    if (!Array.isArray(event?.schedule)) fail(`${eventPath}.schedule`, "must be an array");
    if (!Array.isArray(event?.results)) fail(`${eventPath}.results`, "must be an array");
    const results = Array.isArray(event?.results) ? event.results : [];
    if (event?.status === "completed" && !results.length) fail(`${eventPath}.results`, "must contain published placements when status is 'completed'");
    if (!["completed", "awaiting-results"].includes(event?.status) && results.length) {
      fail(`${eventPath}.results`, `must be empty while status is '${event?.status}'`);
    }
    validateRules(event?.rules, `${eventPath}.rules`);

    const groups = Array.isArray(event?.manualBracketGroups) ? event.manualBracketGroups : [];
    if (!Array.isArray(event?.manualBracketGroups)) fail(`${eventPath}.manualBracketGroups`, "must be an array");
    if (event?.bracketMode === "manual" && !groups.length) {
      fail(`${eventPath}.manualBracketGroups`, "must not be empty when bracketMode is 'manual'");
    }
    uniqueStrings(groups, "key", `${eventPath}.manualBracketGroups`);

    const matches = [];
    groups.forEach((group, groupIndex) => {
      const groupPath = `${eventPath}.manualBracketGroups[${groupIndex}]`;
      requiredString(group?.title, `${groupPath}.title`);
      if (!Array.isArray(group?.rounds)) {
        fail(`${groupPath}.rounds`, "must be an array");
        return;
      }
      group.rounds.forEach((round, roundIndex) => {
        const roundPath = `${groupPath}.rounds[${roundIndex}]`;
        requiredString(round?.title, `${roundPath}.title`);
        if (!Array.isArray(round?.matches)) {
          fail(`${roundPath}.matches`, "must be an array");
          return;
        }
        round.matches.forEach((match, matchIndex) => matches.push({ match, location: `${roundPath}.matches[${matchIndex}]` }));
      });
    });
    matchCount += matches.length;
    const matchIds = uniqueStrings(matches.map(({ match }) => match), "id", `${eventPath}.matches`);
    matches.forEach(({ match, location }) => {
      requiredString(match?.title, `${location}.title`);
      for (const field of ["slot1From", "slot2From"]) {
        if (match?.[field] && !matchIds.has(match[field])) fail(`${location}.${field}`, `unknown match id '${match[field]}'`);
      }
    });
  });

  return { events: data.events.length, matches: matchCount };
}

function validateMusic() {
  const relativePath = "data/tracks.js";
  const data = loadClassicScript(relativePath);
  const tracks = data.KRISPY_TRACKS;
  const playlists = data.KRISPY_PLAYLISTS;
  if (!Array.isArray(tracks)) fail(relativePath, "must define window.KRISPY_TRACKS as an array");
  if (!Array.isArray(playlists)) fail(relativePath, "must define window.KRISPY_PLAYLISTS as an array");
  if (!Array.isArray(tracks) || !Array.isArray(playlists)) return { tracks: 0, playlists: 0 };

  const trackIds = uniqueStrings(tracks, "id", "tracks");
  tracks.forEach((track, index) => {
    requiredString(track?.name, `tracks[${index}].name`);
    requiredString(track?.artist, `tracks[${index}].artist`);
    validateLocalAsset(track?.file, `tracks[${index}].file`, { required: track?.available !== false });
    validateLocalAsset(track?.art, `tracks[${index}].art`, { required: true });
  });

  uniqueStrings(playlists, "id", "playlists");
  playlists.forEach((playlist, index) => {
    requiredString(playlist?.name, `playlists[${index}].name`);
    if (["ALL", "CUSTOM"].includes(playlist?.tracks)) return;
    if (!Array.isArray(playlist?.tracks)) {
      fail(`playlists[${index}].tracks`, "must be 'ALL', 'CUSTOM' or an array of track IDs");
      return;
    }
    const seen = new Set();
    playlist.tracks.forEach((trackId, trackIndex) => {
      const location = `playlists[${index}].tracks[${trackIndex}]`;
      if (!requiredString(trackId, location)) return;
      if (seen.has(trackId)) fail(location, `duplicate track id '${trackId}'`);
      seen.add(trackId);
      if (!trackIds.has(trackId)) fail(location, `unknown track id '${trackId}'`);
    });
  });
  return { tracks: tracks.length, playlists: playlists.length };
}

async function validateVideos() {
  const relativePath = "data/video-playlists.config.mjs";
  let categories;
  try {
    ({ VIDEO_PLAYLISTS: categories } = await import(`${pathToFileURL(path.join(root, relativePath)).href}?validation=${Date.now()}`));
  } catch (error) {
    fail(relativePath, `could not be loaded (${error.message})`);
    return { videoCategories: 0, videoPlaylists: 0 };
  }
  if (!Array.isArray(categories)) {
    fail(relativePath, "must export VIDEO_PLAYLISTS as an array");
    return { videoCategories: 0, videoPlaylists: 0 };
  }
  uniqueStrings(categories, "id", "videoCategories");
  let playlistCount = 0;
  const subTabIds = new Set();
  categories.forEach((category, categoryIndex) => {
    const categoryPath = `videoCategories[${categoryIndex}]`;
    requiredString(category?.title, `${categoryPath}.title`);
    if (category?.type === "latest") return;
    if (!Array.isArray(category?.subTabs) || !category.subTabs.length) {
      fail(`${categoryPath}.subTabs`, "must contain at least one playlist tab");
      return;
    }
    category.subTabs.forEach((subTab, subTabIndex) => {
      playlistCount += 1;
      const subTabPath = `${categoryPath}.subTabs[${subTabIndex}]`;
      if (requiredString(subTab?.id, `${subTabPath}.id`)) {
        if (subTabIds.has(subTab.id)) fail(`${subTabPath}.id`, `duplicate value '${subTab.id}'`);
        subTabIds.add(subTab.id);
      }
      requiredString(subTab?.title, `${subTabPath}.title`);
      requiredString(subTab?.playlistId, `${subTabPath}.playlistId`);
    });
  });
  return { videoCategories: categories.length, videoPlaylists: playlistCount };
}

const counts = { ...validateTournaments(), ...validateMusic(), ...(await validateVideos()) };
if (errors.length) {
  console.error(`Configuration validation failed with ${errors.length} error${errors.length === 1 ? "" : "s"}:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Configuration validation passed: ${counts.events} tournament event, ${counts.matches} matches, ` +
  `${counts.tracks} tracks, ${counts.playlists} music playlists, ${counts.videoCategories} video categories, ` +
  `${counts.videoPlaylists} video playlists and ${checkedAssets.size} local asset references.`
);
