import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export class ManagementError extends Error {
  constructor(code, message, field = null) { super(message); this.code = code; this.field = field; }
}
export function requireThat(condition, code, message, field = null) {
  if (!condition) throw new ManagementError(code, message, field);
}
export const sha = value => crypto.createHash('sha256').update(value).digest('hex').toUpperCase();
export const json = value => JSON.stringify(value);
const comparable = value => process.platform==='win32'?value.toLowerCase():value;
export function separateRoots(first,second){
  const a=comparable(path.resolve(first)),b=comparable(path.resolve(second));
  requireThat(a!==b && !a.startsWith(b+path.sep) && !b.startsWith(a+path.sep),'ROOT','Candidate and immutable baseline must be separate, non-nested roots.');
}
const trees = new Set(['assets','media','data','styles','scripts','tools','music','videos','tournaments','about','contact','privacy','.well-known']);
const roots = new Set(['index.html','CNAME','robots.txt','sitemap.xml','site.webmanifest','manifest.webmanifest','package.json','package-lock.json','favicon.ico','favicon.png','README-tournament-rules.md']);
const excluded = new Set(['node_modules','bin','obj','__pycache__']);

export function relativePath(value) {
  requireThat(typeof value === 'string' && value.length > 0 && !value.includes('\\') && !/[:%?#\x00-\x1f]/.test(value), 'PATH', 'Expected a canonical relative file path.');
  requireThat(!path.isAbsolute(value) && value.split('/').every(p => p && p !== '.' && p !== '..' && !/[. ]$/.test(p) && !/^(?:con|prn|aux|nul|com\d|lpt\d)(?:\.|$)/i.test(p)), 'PATH', 'File path is escaping, reserved or ambiguous.');
  return value;
}
export function included(value) {
  const parts = relativePath(value).split('/');
  if (parts.some(p => (p.startsWith('.') && p !== '.well-known') || excluded.has(p.toLowerCase()) || /^(?:credentials|secrets)(?:\.|$)/i.test(p))) return false;
  if (/\.(?:pem|key|pfx|p12|env|exe|dll|log)$/i.test(value)) return false;
  return roots.has(value) || value === 'docs/TOURNAMENT-CONTRACT.md' || (parts.length > 1 && trees.has(parts[0]));
}
export function safeRoot(root) {
  const resolved = path.resolve(root);
  requireThat(fs.existsSync(resolved) && fs.statSync(resolved).isDirectory(), 'ROOT', 'Source root must be an existing directory.');
  requireThat(fs.realpathSync(resolved).toLowerCase() === resolved.toLowerCase() && !fs.lstatSync(resolved).isSymbolicLink(), 'SYMLINK', 'Linked roots are not supported.');
  return resolved;
}
export function safeFile(root, relative, { existing = true } = {}) {
  const base = safeRoot(root); relativePath(relative);
  let current = base;
  for (const segment of relative.split('/')) {
    current = path.join(current, segment);
    if (fs.existsSync(current)) requireThat(!fs.lstatSync(current).isSymbolicLink(), 'SYMLINK', 'Linked files/directories are refused.', relative);
  }
  requireThat(current.startsWith(base + path.sep), 'PATH', 'File escaped source root.', relative);
  if (existing) requireThat(fs.existsSync(current) && fs.statSync(current).isFile(), 'MISSING_FILE', 'Required source file is missing.', relative);
  return current;
}
export function inventory(root) {
  root = safeRoot(root);
  const files = []; const folded = new Set();
  function visit(directory, prefix = '') {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name,'en'))) {
      const relative = prefix + entry.name;
      if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
      if (excluded.has(entry.name.toLowerCase())) continue;
      if (!prefix && !trees.has(entry.name) && !roots.has(entry.name) && entry.name !== 'docs') continue;
      const filename = path.join(directory, entry.name);
      requireThat(!fs.lstatSync(filename).isSymbolicLink(), 'SYMLINK', 'Snapshot traversal refuses linked files/directories.', relative);
      if (entry.isDirectory()) visit(filename, relative + '/');
      else if (included(relative)) {
        requireThat(!folded.has(relative.toLowerCase()), 'PATH', 'Case-colliding snapshot paths are refused.', relative);
        folded.add(relative.toLowerCase());
        const bytes = fs.readFileSync(filename);
        files.push({ path: relative, sha256: sha(bytes), bytes: bytes.length });
      }
    }
  }
  visit(root); return files.sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}
export function snapshot(root, sourceId) {
  requireThat(typeof sourceId === 'string' && sourceId.length > 0 && sourceId.length <= 200 && !/[\x00-\x1f]/.test(sourceId), 'IDENTITY', 'A bounded source identity is required.');
  const value = { schemaVersion: 1, sourceId, files: inventory(root) };
  requireThat(value.files.length > 0, 'IDENTITY', 'Empty snapshots cannot establish a baseline.');
  return { ...value, sha256: sha(json(value)) };
}
export function verifySnapshot(root, identity, expectedDigest) {
  requireThat(identity?.schemaVersion === 1 && typeof identity.sourceId === 'string' && Array.isArray(identity.files), 'IDENTITY', 'Malformed immutable baseline identity.');
  const digest = sha(json({ schemaVersion: 1, sourceId: identity.sourceId, files: identity.files }));
  requireThat(typeof expectedDigest === 'string' && digest === expectedDigest && identity.sha256 === digest, 'STALE_BASELINE', 'Pinned baseline identity/hash does not match.');
  requireThat(json(inventory(root)) === json(identity.files), 'STALE_BASELINE', 'Baseline bytes/paths differ from the immutable snapshot.');
  return identity;
}
export function changedFiles(baselineFiles, candidateFiles) {
  const before = new Map(baselineFiles.map(file => [file.path,file.sha256]));
  const after = new Map(candidateFiles.map(file => [file.path,file.sha256]));
  return [...new Set([...before.keys(),...after.keys()])].filter(file => before.get(file) !== after.get(file)).sort();
}
export function assertCandidateShape(root){
  root=safeRoot(root);
  function visit(directory,prefix=''){
    for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
      if(!prefix && ['node_modules','.git'].includes(entry.name))continue;
      const relative=prefix+entry.name,filename=path.join(directory,entry.name);
      requireThat(!fs.lstatSync(filename).isSymbolicLink(),'SYMLINK','Candidate contains linked published paths.',relative);
      if(entry.isDirectory()){
        requireThat((!prefix && (trees.has(entry.name)||entry.name==='docs')) || (prefix && !entry.name.startsWith('.') && !excluded.has(entry.name.toLowerCase())),'PRIVATE_ASSET','Unexpected/private candidate directory is outside snapshot scope.',relative);
        visit(filename,relative+'/');
      }else requireThat(included(relative),'PRIVATE_ASSET','Unexpected/private candidate file is outside snapshot scope.',relative);
    }
  }
  visit(root);
}
export function privateOutput(filename, rootsToProtect) {
  const output = path.resolve(filename);
  for (const root of rootsToProtect) {
    const base = comparable(path.resolve(root));const comparedOutput=comparable(output);
    requireThat(comparedOutput !== base && !comparedOutput.startsWith(base + path.sep), 'PRIVATE_OUTPUT', 'Receipts/identities must stay outside source, baseline and candidate roots.');
  }
  let current = path.parse(output).root;
  for (const part of output.slice(current.length).split(path.sep)) {
    current = path.join(current,part);
    if (fs.existsSync(current)) requireThat(!fs.lstatSync(current).isSymbolicLink(), 'SYMLINK', 'Private output traverses a linked path.');
  }
  fs.mkdirSync(path.dirname(output), { recursive: true });
  return output;
}
