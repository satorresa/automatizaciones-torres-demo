import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {routeTable,LABS} from '../dist/routes.mjs';
const root=fileURLToPath(new URL('..',import.meta.url)),dist=path.join(root,'dist');
const data=JSON.parse(await fs.readFile(path.join(dist,'cases.json'),'utf8'));
const base=await fs.readFile(path.join(dist,'index.html'),'utf8');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const generated=[];
for(const route of routeTable(data.cases)){
 if(route.path==='/')continue;
 if(!/^\/[a-z0-9/-]+$/.test(route.path)||route.path.includes('..'))throw Error('Unsafe route');
 const folder=path.resolve(dist,'.'+route.path);if(!folder.startsWith(dist+path.sep))throw Error('Outside dist');
 const title=route.view==='case'?data.cases.find(x=>x.id===route.caseId).title[route.language]:route.view==='lab'?LABS.find(x=>x.id===route.legacyId).name[route.language]:route.language==='en'?'Featured developments':'Desarrollos destacados';
 const html=base.replace('<html lang="es">',`<html lang="${route.language}">`).replace(/<title>[^<]*<\/title>/,`<title>${esc(title)} · Automatizaciones Torres</title>`).replace('href="https://demo.automatizacionestorres.com/"',`href="https://demo.automatizacionestorres.com${route.path}"`);
 await fs.mkdir(folder,{recursive:true});await fs.writeFile(path.join(folder,'index.html'),html,'utf8');generated.push(route.path+'/index.html');
}
await fs.writeFile(path.join(dist,'route-manifest.json'),JSON.stringify({generatedFrom:'cases.json + routes.mjs',routes:routeTable(data.cases),generatedFiles:generated},null,2)+'\n');
console.log(JSON.stringify({routes:generated.length+1,generated:generated.length,knownDirectLinksHaveHtml:true}));
