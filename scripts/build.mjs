import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFile(path.join(root,p),'utf8');
const config = JSON.parse(await read('site-config.json'));
if (typeof config.reportEndpoint !== 'string') throw new Error('reportEndpoint must be a public URL, or an empty string.');
if (config.reportEndpoint && !/^https:\/\//.test(config.reportEndpoint)) throw new Error('The production report endpoint must use HTTPS.');
// Avoid accidentally publishing a credential in place of the endpoint.
if (/github_pat_|ghp_|\d{8,}:[A-Za-z0-9_-]{20,}|api\.telegram\.org|[?&](token|key)=/i.test(config.reportEndpoint)) throw new Error('Do not put a token into site-config.json.');
const rawEngine = await read('src/engine.mjs');
const names = [...rawEngine.matchAll(/^export\s+(?:function|const)\s+(\w+)/gm)].map(m=>m[1]);
const engine = 'const Algebra = (() => {\n' + rawEngine.replace(/^export\s+/gm,'') + '\nreturn {'+names.join(',')+'};\n})();';
let fonts = '';
for (const [file,family,weight] of [['golos-regular','Golos',400],['golos-semibold','Golos',600],['golos-extrabold','Golos',800],['caveat-semibold','Caveat',600]]) {
 const data = await readFile(path.join(root,'assets/fonts/'+file+'.woff2'));
 fonts += `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${data.toString('base64')}) format('woff2')}\n`;
}
let html = await read('src/template.html');
for (const [tag,content] of [['/* FONTS */',fonts],['/* STYLES */',await read('src/styles.css')],['/* SITE_CONFIG */','// Public URL only. Never put bot tokens here.\nwindow.ANICHKOV_CONFIG = '+JSON.stringify(config,null,2)+';'],['/* ENGINE */',engine],['/* APP */',await read('src/app.js')]]) html = html.replace(tag,()=>content);
await writeFile(path.join(root,'index.html'),html);
try {
 const worker=await read('worker/handler.mjs');
 const standalone=engine+'\n'+worker.replace(/^import\s+\{([\s\S]*?)\}\s+from\s+['"]\.\.\/src\/engine\.mjs['"];?/m,(_,keys)=>'const {'+keys+'} = Algebra;');
 await writeFile(path.join(root,'worker/telegram-worker.mjs'),standalone);
} catch(e) { if(e.code!=='ENOENT')throw e; }
await mkdir(path.join(root,'site'),{recursive:true});
await writeFile(path.join(root,'site/index.html'),html);
await writeFile(path.join(root,'site/.nojekyll'),'');
console.log(`Ready: index.html (${Math.round(Buffer.byteLength(html)/1024)} KiB), self-contained; site/ for GitHub Pages.`);
