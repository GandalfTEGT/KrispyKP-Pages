import fs from "node:fs";
import vm from "node:vm";

const [flagsPath] = process.argv.slice(2);
if (!flagsPath) {
  console.error("Usage: node tools/export-flag-catalog.mjs <flags-path>");
  process.exit(2);
}

const context = { window: {}, encodeURIComponent };
vm.createContext(context);
try {
  vm.runInContext(fs.readFileSync(flagsPath, "utf8"), context, { filename: flagsPath });
} catch (error) {
  console.error(`Unable to load flag catalogue: ${error.message}`);
  process.exit(1);
}

const flags = context.window.FLAG_SVGS;
if (!flags || typeof flags !== "object" || Array.isArray(flags)) {
  console.error("Flag catalogue must define window.FLAG_SVGS.");
  process.exit(1);
}
process.stdout.write(JSON.stringify(flags));
