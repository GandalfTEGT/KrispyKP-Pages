import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

// Explicit migration for the reviewed owner export, not runtime note filtering.
const [ownerPath, canonicalPath, outputPath, reportPath] = process.argv.slice(2);
if (!ownerPath || !canonicalPath || !outputPath || !reportPath) {
  console.error("Usage: node tools/migrate-tournament-provenance.mjs <owner-config> <preserved-canonical-config> <output-config> <report-json>");
  process.exit(2);
}
const inputs = [ownerPath, canonicalPath].map(value => path.resolve(value).toLowerCase());
assert(!inputs.includes(path.resolve(outputPath).toLowerCase()), "Output must not overwrite either preserved input");
assert(!inputs.includes(path.resolve(reportPath).toLowerCase()), "Report must not overwrite either preserved input");
function load(filename) {
  const source = fs.readFileSync(filename, "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename });
  return { source, data: JSON.parse(JSON.stringify(context.window.KRISPY_TOURNAMENTS)) };
}
const owner = load(ownerPath);
const canonical = load(canonicalPath);
const result = structuredClone(owner.data);
const clauses = ["screenshot evidence supplied by owner", "owner-supplied historical recollection"];
const changes = [];
const matches = event => (event.manualBracketGroups || []).flatMap(group => (group.rounds || []).flatMap(round => round.matches || []));
for (const event of result.events) {
  const baseline = canonical.data.events.find(item => item.id === event.id);
  const canonicalMatches = new Map(matches(baseline || {}).map(match => [match.id, match]));
  for (const match of matches(event)) {
    const originalNote = match.note;
    const publicParts = String(match.note || "").split(" · ");
    const evidence = publicParts.filter(part => clauses.includes(part));
    const prior = canonicalMatches.get(match.id);
    const priorEvidence = String(prior?.note || "").split(" · ").filter(part => clauses.includes(part));
    const preserved = [...new Set([match.provenance, ...evidence, prior?.provenance, ...priorEvidence].filter(Boolean))];
    if (!preserved.length) continue;
    match.note = publicParts.filter(part => !clauses.includes(part)).join(" · ");
    match.provenance = preserved.join("\n");
    changes.push({ eventId: event.id, matchId: match.id, originalNote, publicNote: match.note, provenance: match.provenance, recoveredFromCanonical: priorEvidence.some(value => !evidence.includes(value)) });
  }
}

// Prove that reverting only the explicit migration yields the exact owner data.
const restored = structuredClone(result);
for (const change of changes) {
  const match = matches(restored.events.find(event => event.id === change.eventId)).find(item => item.id === change.matchId);
  const original = matches(owner.data.events.find(event => event.id === change.eventId)).find(item => item.id === change.matchId);
  if (original.note === undefined) delete match.note; else match.note = original.note;
  if (original.provenance === undefined) delete match.provenance; else match.provenance = original.provenance;
}
assert.deepEqual(restored, owner.data, "Migration changed data beyond explicit note/provenance separation");
const assignment = owner.source.search(/^window\.KRISPY_TOURNAMENTS\s*=/m);
assert(assignment >= 0, "Owner config assignment was not found");
const prefix = owner.source.slice(0, assignment);
fs.writeFileSync(outputPath, `${prefix}window.KRISPY_TOURNAMENTS = ${JSON.stringify(result, null, 2)};\n`, "utf8");
const digest = filename => crypto.createHash("sha256").update(fs.readFileSync(filename)).digest("hex");
const report = {
  ownerPath: path.resolve(ownerPath), ownerSha256: digest(ownerPath),
  canonicalPath: path.resolve(canonicalPath), canonicalSha256: digest(canonicalPath),
  outputSha256: digest(outputPath), ownerDataRetained: true,
  events: result.events.length, players: result.events.reduce((sum, event) => sum + event.players.length, 0),
  matches: result.events.reduce((sum, event) => sum + matches(event).length, 0),
  changes, recoveredEvidenceCount: changes.filter(change => change.recoveredFromCanonical).length
};
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Owner data retained: ${report.events} events, ${report.players} players, ${report.matches} matches; ${changes.length} provenance migrations (${report.recoveredEvidenceCount} recovered).`);
