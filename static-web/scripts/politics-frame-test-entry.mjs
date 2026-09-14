import fs from'node:fs';import{spawn}from'node:child_process';
export async function runCurrentPoliticsFrame({subject,formal}){
 const page=fs.readFileSync('src/pages/politics/[subject]/[chapter].astro','utf8');
 if(!page.includes('<PoliticsFrameWorkspace'))return; // legacy-only checkout remains auditable
 if(!page.includes('<PoliticsPracticeBridge'))throw Error('CURRENT_FRAME_WITHOUT_EXACT_RETURN');
 console.log('Current acceptance: native frame -> Workbench'+(formal?' / full formal 23-group regression':` / ${subject}`));
 const code=await new Promise(resolve=>{const child=spawn(process.execPath,['scripts/test-politics-frame-journey.mjs'],{stdio:'inherit',env:{...process.env,POLITICS_FRAME_SUBJECT:subject,POLITICS_FRAME_FORMAL:formal?'1':'0'}});child.on('error',()=>resolve(1));child.on('exit',resolve)});
 // Keep legacy workflow artifact locations useful, without relabeling old evidence.
 for(const name of ['functional','mao-runtime','mao-evidence','xi-runtime','xi-evidence','ethics-runtime','ethics-evidence']){const dir=`../politics-${name}-audit`;fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(`${dir}/current-integration.json`,JSON.stringify({consumer:'native frame / #117 Workbench',report:'output/playwright/issue148/politics-frame/report.json',formal,subject,exit:code}));}
 process.exit(code||0);
}
