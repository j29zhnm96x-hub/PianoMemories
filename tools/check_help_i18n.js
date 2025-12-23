const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const helpKeys = Array.from(html.matchAll(/data-i18n="(help\.[^"]+)"/g)).map(m=>m[1]);
const langs = ['en','hr','pl','it','es'];
function extractBlock(lang){
  const marker = "\n    "+lang+": {";
  const start = js.indexOf(marker);
  if (start < 0) return '';
  const rest = js.slice(start + marker.length);
  // find next language or end of file
  let end = rest.length;
  for(const other of langs){ if (other===lang) continue; const m = rest.indexOf('\n\n    '+other+': {'); if (m>=0 && m<end) end = m; }
  const endObj = rest.indexOf('\n  };', 0);
  if (endObj>=0 && endObj < end) end = endObj;
  return rest.slice(0,end);
}
function extractKeys(block){
  const re = /'([^']+)'\s*:\s*/g;
  const keys = new Set();
  let m;
  while((m = re.exec(block))){ keys.add(m[1]); }
  return keys;
}
const missing = {};
for(const lang of langs){
  const block = extractBlock(lang);
  const keys = extractKeys(block);
  missing[lang] = helpKeys.filter(k => !keys.has(k));
}
console.log(JSON.stringify({helpKeysCount: helpKeys.length, missing}, null, 2));
