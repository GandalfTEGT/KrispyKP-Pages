import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, detectScope, git, gitText } from "./validation-common.mjs";

function refExists(ref) {
  return git(["rev-parse", "--verify", ref]).status === 0;
}

function aheadBehind(base) {
  const output = gitText(["rev-list", "--left-right", "--count", `${base}...HEAD`]);
  const [behind = 0, ahead = 0] = output.split(/\s+/).map(Number);
  return { ahead, behind };
}

function taskSummaries() {
  const directory = path.join(ROOT, "tasks");
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter(name => name.endsWith(".md") && name !== "TASK_TEMPLATE.md")
    .map(name => {
      const source = fs.readFileSync(path.join(directory, name), "utf8");
      const title = source.match(/^#\s+(.+)$/m)?.[1] || name;
      const status = source.match(/^##\s+Status\s*\r?\n+\s*`?([^`\r\n]+)`?/mi)?.[1]?.trim() || "UNKNOWN";
      return { file: `tasks/${name}`, title, status };
    });
}

export function getProjectStatus() {
  const base = refExists("origin/main") ? "origin/main" : "main";
  const statusLines = gitText(["status", "--porcelain=v1"]);
  const branch = gitText(["branch", "--show-current"]) || "DETACHED";
  const upstream = gitText(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"]);
  const scope = detectScope({ base });
  return {
    schemaVersion: 1,
    workspace: ROOT,
    branch,
    head: gitText(["rev-parse", "HEAD"]),
    headSubject: gitText(["show", "-s", "--format=%s", "HEAD"]),
    base,
    baseCommit: gitText(["rev-parse", base]),
    mergeBase: gitText(["merge-base", "HEAD", base]),
    upstream: upstream || null,
    ...aheadBehind(base),
    dirty: Boolean(statusLines),
    changes: statusLines ? statusLines.split(/\r?\n/) : [],
    affectedPages: scope.pages,
    validationExtras: scope.extras,
    tasks: taskSummaries(),
    remoteNote: `${base} is the last fetched local remote-tracking state; run git fetch when fresh remote evidence is required.`
  };
}

function print(status) {
  console.log(`Workspace: ${status.workspace}`);
  console.log(`Branch: ${status.branch}`);
  console.log(`HEAD: ${status.head} (${status.headSubject})`);
  console.log(`Base: ${status.base} ${status.baseCommit}; merge-base ${status.mergeBase}`);
  console.log(`Divergence: ahead ${status.ahead}, behind ${status.behind}; upstream ${status.upstream || "not configured"}`);
  console.log(`Worktree: ${status.dirty ? `DIRTY (${status.changes.length} path${status.changes.length === 1 ? "" : "s"})` : "clean"}`);
  console.log(`Affected pages: ${status.affectedPages.length ? status.affectedPages.join(", ") : "none"}`);
  if (status.validationExtras.length) console.log(`Additional validation: ${status.validationExtras.join(", ")}`);
  console.log(`Durable tasks: ${status.tasks.length ? status.tasks.map(task => `${task.title} [${task.status}]`).join("; ") : "none in repository"}`);
  console.log(`Remote: ${status.remoteNote}`);
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const status = getProjectStatus();
  if (process.argv.includes("--json")) console.log(JSON.stringify(status, null, 2));
  else print(status);
}
