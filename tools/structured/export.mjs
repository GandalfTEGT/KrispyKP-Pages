import {requireThat as must} from '../management/files.mjs';
import {exact} from './model.mjs';
// Scope is private owner journal metadata, never part of a public typed request.
export function publicOperations(journal){
  must(Array.isArray(journal)&&journal.length<=2000&&Buffer.byteLength(JSON.stringify(journal))<=50331648,'STRUCTURED_LIMIT','Private journal exceeds bounded export input.');
  for(const row of journal)must(exact(row,['scope','operation'])&&['private','public'].includes(row.scope)&&row.operation&&typeof row.operation==='object'&&!Array.isArray(row.operation),'STRUCTURED_PRIVACY','Malformed private/public journal row.');
  return structuredClone(journal.filter(r=>r.scope==='public').map(r=>r.operation));
}
