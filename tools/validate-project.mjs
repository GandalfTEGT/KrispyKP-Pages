import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ROOT,
  defaultResultPath,
  detectScope,
  parseArgs,
  platformSummary,
  writeJson
} from "./validation-common.mjs";
import { runStaticValidation } from "./validate-static.mjs";
import { runBrowserValidation } from "./validate-browser.mjs";

function usage() {
  console.log("Usage: node tools/validate-project.mjs [--profile smoke|standard|acceptance] [--browser-only] [--screenshots] [--pages all|home,music,...] [--base <ref>] [--json <file>]");
}
function combine(options, scope, staticResult, browserResult) {
  const children = [staticResult, browserResult].filter(Boolean);
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    platform: platformSummary(),
    profile: options.profile,
    status: children.every(child => child.status === "PASS") ? "PASS" : "FAIL",
    scope,
    summary: {
      checks: children.reduce((sum, child) => sum + child.checks.length, 0),
      failures: children.reduce((sum, child) => sum + child.failures.length, 0),
      warnings: children.reduce((sum, child) => sum + child.warnings.length, 0)
    },
    manual: [...new Set(children.flatMap(child => child.manual))],
    results: children
  };
}

function print(report, outputFile) {
  const pages = report.scope.pages.length ? report.scope.pages.join(", ") : "none (tooling/docs only)";
  console.log(`Scope: ${report.scope.files.length} changed file(s); affected pages: ${pages}`);
  if (report.scope.extras.length) console.log(`Additional review: ${report.scope.extras.join(", ")}`);
  if (report.status === "PASS") {
    console.log(`${report.profile.toUpperCase()} PASS — ${report.summary.checks} checks; result ${path.relative(ROOT, outputFile)}`);
  } else {
    console.error(`${report.profile.toUpperCase()} FAIL — ${report.summary.failures} failure${report.summary.failures === 1 ? "" : "s"}; result ${path.relative(ROOT, outputFile)}`);
    for (const result of report.results) {
      result.failures.forEach(failure => console.error(`- ${failure.name}: ${failure.message || "failed"}`));
    }
  }
  if (report.manual.length) console.log(`Manual boundary: ${report.manual.length} item(s) recorded in JSON.`);
}

export async function runProjectValidation(options) {
  const scope = detectScope({ root: options.root, base: options.base });
  const staticResult = options.browserOnly ? null : runStaticValidation({ ...options, scope });
  const browserResult = await runBrowserValidation({ ...options, scope });
  const report = combine(options, scope, staticResult, browserResult);
  const outputFile = options.json || defaultResultPath(options.root);
  writeJson(outputFile, report);
  return { report, outputFile };
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) usage();
    else {
      const { report, outputFile } = await runProjectValidation(options);
      print(report, outputFile);
      process.exitCode = report.status === "PASS" ? 0 : 1;
    }
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 2;
  }
} // isCli
