import fs from "node:fs";
import vm from "node:vm";

const [configPath, eventId] = process.argv.slice(2);
if (!configPath || !eventId) {
  console.error("Usage: node tools/export-tournament-config.mjs <config-path> <event-id|--all>");
  process.exit(2);
}

const context = { window: {} };
vm.createContext(context);

try {
  vm.runInContext(fs.readFileSync(configPath, "utf8"), context, { filename: configPath });
} catch (error) {
  console.error(`Unable to load tournament configuration: ${error.message}`);
  process.exit(1);
}

const events = context.window.KRISPY_TOURNAMENTS?.events;
if (!Array.isArray(events)) {
  console.error("Tournament configuration must define window.KRISPY_TOURNAMENTS.events.");
  process.exit(1);
}

if (eventId === "--all") {
  process.stdout.write(JSON.stringify(context.window.KRISPY_TOURNAMENTS));
  process.exit(0);
}

const event = events.find((candidate) => candidate?.id === eventId);
if (!event) {
  console.error(`Tournament event not found: ${eventId}`);
  process.exit(1);
}

process.stdout.write(JSON.stringify(event));
