import fs from 'node:fs/promises';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4173';
const payload={goal:'automate',stage:'existing',features:['leads','integration'],context:'Demo workflow',budget:'discuss',timing:'flexible'};
let jsBytes=0,jsGzipBytes=0,cssBytes=0,cssGzipBytes=0;
async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const target=path.join(dir,entry.name);if(entry.isDirectory())await walk(target);else if(/\.(js|css)$/.test(target)){const content=await fs.readFile(target);if(target.endsWith('.js')){jsBytes+=content.length;jsGzipBytes+=gzipSync(content).length;}else{cssBytes+=content.length;cssGzipBytes+=gzipSync(content).length;}}}}
await walk('dist/client');
async function call(){const start=performance.now();const response=await fetch(new URL('/api/blueprint',base),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!response.ok)throw new Error(`API returned ${response.status}`);const body=await response.json();if(body.blueprint.service!=='AI & workflow automation')throw new Error('Unexpected blueprint');return performance.now()-start;}
await call();const samples=[];for(let i=0;i<30;i++)samples.push(await call());samples.sort((a,b)=>a-b);
const result={measuredAt:new Date().toISOString(),environment:process.env.MEASUREMENT_ENV||'local development preview; warm sequential HTTP requests; no throttling',baseURL:base,node:process.version,requests:30,apiMedianMs:Number(((samples[14]+samples[15])/2).toFixed(2)),apiP95Ms:Number(samples[28].toFixed(2)),jsBytes,jsGzipBytes,cssBytes,cssGzipBytes,assetMethod:'Sum of all emitted JS/CSS files; each independently gzip-compressed. Not a measured browser transfer or a before/after comparison.'};
await fs.mkdir('docs/evidence',{recursive:true});await fs.writeFile('docs/evidence/metrics.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
