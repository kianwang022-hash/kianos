// Local-only state-free assembly. Never deploy this fixture overlay as Production.
import fs from'node:fs';import path from'node:path';
const target=path.resolve('../output/playwright/issue148/human-gate-site');
if(!fs.existsSync('dist/index.html')||!fs.existsSync('scripts/fixtures/site-frame/dist/human-gate/index.html'))throw Error('BUILD_BOTH_PRODUCTION_AND_FIXTURES_FIRST');
fs.mkdirSync(target,{recursive:true});fs.cpSync('dist',target,{recursive:true});fs.cpSync('scripts/fixtures/site-frame/dist',target,{recursive:true});console.log(target);
