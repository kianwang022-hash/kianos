import fs from'node:fs';import{spawn}from'node:child_process';import{createHash}from'node:crypto';
export async function runCurrentPoliticsFrame({subject,formal}){
 const page=fs.readFileSync('src/pages/politics/[subject]/[chapter].astro','utf8');
 if(!page.includes('<PoliticsFrameWorkspace'))return;
 if(!page.includes('<PoliticsPracticeBridge'))throw Error('CURRENT_FRAME_WITHOUT_EXACT_RETURN');
 console.log('Current acceptance: native frame -> Workbench'+(formal?' / whole-subject readability + Home + formal Workbench':` / ${subject}`));
 const code=await new Promise(resolve=>{const child=spawn(process.execPath,['scripts/test-politics-frame-journey.mjs'],{stdio:'inherit',env:{...process.env,POLITICS_FRAME_SUBJECT:subject,POLITICS_FRAME_FORMAL:formal?'1':'0'}});child.on('error',()=>resolve(1));child.on('exit',resolve)});
 for(const name of ['functional','mao-runtime','mao-evidence','xi-runtime','xi-evidence','ethics-runtime','ethics-evidence']){const dir=`../politics-${name}-audit`;fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(`${dir}/current-integration.json`,JSON.stringify({consumer:'native frame / #117 Workbench',report:'output/playwright/issue148/politics-frame/report.json',formal,subject,exit:code}));}
 if(formal){
  const source='../output/playwright/issue148/politics-frame',target='../politics-functional-audit/native-frame';
  if(fs.existsSync(source))fs.cpSync(source,target,{recursive:true});
  const files=['src/layouts/Base.astro','src/components/PoliticsHomeTools.astro','src/components/PoliticsFrameWorkspace.astro','src/components/PoliticsFrameValue.astro','src/components/PoliticsFrameMap.astro','src/styles/politics-readable.css','src/styles/politics-frame-grammar.css','scripts/test-politics-home-journey.mjs','scripts/test-politics-subject-readability.mjs','scripts/test-politics-frame-journey.mjs'];
  const fingerprints=Object.fromEntries(files.map(file=>[file,createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
  fs.writeFileSync('../politics-functional-audit/source-fingerprints.json',JSON.stringify({github_sha:process.env.GITHUB_SHA||null,source_sha256:fingerprints,learnerU:'NOT_TESTED'},null,2)+'\n');
 }
 process.exit(code||0);
}
