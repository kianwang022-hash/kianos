import fs from 'node:fs';
import { chromium } from 'playwright';
import { loadLexicalWordByOrdinal } from '../src/lib/lexical.mjs';

const argv=process.argv.slice(2);
const arg=(name,fallback)=>{
  const index=argv.indexOf('--'+name);
  return index>=0&&argv[index+1]!=null?argv[index+1]:fallback;
};
const integer=(name,fallback)=>{
  const value=Number(arg(name,fallback));
  if(!Number.isInteger(value))throw new Error('INVALID_'+name.toUpperCase());
  return value;
};

const start=integer('start',1);
const end=integer('end',start);
const reportEvery=Math.max(1,integer('report-every',100));
const base=String(arg('base','http://127.0.0.1:4321')).replace(/\/+$/,'');
const out=String(arg('out','')).trim();
if(start<1||end<start||end>7946)throw new Error('INVALID_TRAVERSAL_RANGE');

const forbidden=/Final Learner Object|event identity|lexical evidence|手动载入\s*\/\s*调试|Paste Challenge Packet|sha256:|Canonical projection|Search all Current Words|Current 词库|source_locator|target_locator|target_revision/i;

const expected=new Map();
for(let ordinal=start;ordinal<=end;ordinal+=1){
  const loaded=loadLexicalWordByOrdinal(ordinal);
  const record=loaded.record||{};
  const reference=record.reference&&typeof record.reference==='object'?record.reference:{};
  const hasReference=Boolean(
    (Array.isArray(reference.confusables)&&reference.confusables.length)
    ||(Array.isArray(reference.relations)&&reference.relations.length)
    ||(reference.form&&typeof reference.form==='object')
    ||(Array.isArray(reference.family)&&reference.family.length)
  );
  expected.set(ordinal,{
    ordinal,
    word:String(record.word||''),
    senseCount:(Array.isArray(record.senses)?record.senses.length:0)
      +(Array.isArray(record.secondary_senses)?record.secondary_senses.length:0),
    constructionCount:Array.isArray(record.constructions)?record.constructions.length:0,
    hasReference
  });
}

const readCurrent=async()=>{
  try{
    const response=await fetch(base+'/__kianos-current.json?t='+Date.now(),{cache:'no-store'});
    return response.ok?await response.json():null;
  }catch{return null}
};

const initialCurrent=await readCurrent();
if(initialCurrent?.state&&initialCurrent.state!=='synced'){
  throw new Error('CURRENT_NOT_SYNCED:'+JSON.stringify(initialCurrent));
}
const initialSha=String(initialCurrent?.sha||'');

let browser;
const result={
  schema:'kianos.lexical.runtime_traversal.v1',
  base,
  start,
  end,
  release_sha:initialSha||null,
  checked:0,
  first_word:expected.get(start)?.word||null,
  last_word:null,
  document_navigation_delta:null,
  status:'RUNNING',
  anomaly:null
};

const saveResult=()=>{
  if(!out)return;
  fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
};

const fail=(ordinal,word,checks)=>{
  result.status='FAIL';
  result.anomaly={ordinal,word,checks};
  saveResult();
  console.error(JSON.stringify({status:'FAIL',ordinal,word,checks},null,2));
  process.exitCode=1;
};

try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1512,height:900}});
  const page=await context.newPage();

  // Browser QA is isolated from Kian's durable private checkpoint.
  await page.route('**/__kianos-private/checkpoint*',async(route)=>{
    if(route.request().method()==='GET'){
      return route.fulfill({status:404,contentType:'application/json',body:'{"status":"missing","checkpoint":null}'});
    }
    return route.fulfill({status:200,contentType:'application/json',body:'{"status":"saved"}'});
  });

  let documentRequests=0;
  page.on('request',(request)=>{
    if(request.resourceType()==='document')documentRequests+=1;
  });

  const pageErrors=[];
  page.on('pageerror',(error)=>pageErrors.push(String(error?.message||error)));

  await page.goto(base+'/vocabulary/'+start+'/?mode=lookup',{
    waitUntil:'domcontentloaded',
    timeout:10000
  });
  await page.locator('[data-vocab-ordinal="'+start+'"]').waitFor({state:'attached',timeout:5000});
  await page.waitForTimeout(80);
  const documentBaseline=documentRequests;

  for(let ordinal=start;ordinal<=end;ordinal+=1){
    const exp=expected.get(ordinal);
    if(ordinal!==start){
      await page.evaluate((target)=>{
        window.dispatchEvent(new CustomEvent('kianos:vocabulary-navigate',{
          detail:{ordinal:target,mode:'lookup',history:'replace'}
        }));
      },ordinal);
      await page.locator('[data-vocab-ordinal="'+ordinal+'"]').waitFor({state:'attached',timeout:5000});
    }

    const observed=await page.evaluate(()=>{
      const root=document.querySelector('[data-local-port="vocabulary"]');
      const body=root?.querySelector('[data-vocab-body]');
      const details=root?.querySelector('[data-vocab-details]');
      const dock=document.querySelector('[data-vocab-action-dock]');
      const canvas=document.querySelector('.kianosShellMain > .productCanvas');
      const rail=root?.querySelector('.portedVocabEvidenceColumn');
      const rect=root?.getBoundingClientRect();
      const senseRows=[...(root?.querySelectorAll('.lexicalSenseRow')||[])].map((row)=>({
        cn:String(row.querySelector('.lexicalSenseMeaning > p')?.textContent||'').trim(),
        en:String(row.querySelector('.lexicalSenseMeaning > strong')?.textContent||'').trim()
      }));
      const constructionCount=root?.querySelectorAll('.lexicalPatternList article').length||0;
      const text=String(root?.innerText||'');
      const rootOverflow=root?Math.max(0,root.scrollWidth-root.clientWidth):0;
      const canvasOverflow=canvas?Math.max(0,canvas.scrollWidth-canvas.clientWidth):0;

      const scrollCandidates=[details,canvas,document.scrollingElement].filter(Boolean);
      let requiredScroll=false;
      let scrollPath=true;
      for(const node of scrollCandidates){
        if(!(node instanceof HTMLElement))continue;
        if(node.scrollHeight<=node.clientHeight+2)continue;
        requiredScroll=true;
        const prior=node.scrollTop;
        node.scrollTop=Math.min(24,node.scrollHeight-node.clientHeight);
        if(node.scrollTop<=0)scrollPath=false;
        node.scrollTop=prior;
        if(scrollPath)break;
      }

      return {
        ordinal:Number(root?.getAttribute('data-vocab-ordinal')||0),
        word:String(root?.getAttribute('data-vocab-word')||''),
        mode:String(root?.getAttribute('data-vocab-mode')||''),
        revealed:String(root?.getAttribute('data-vocab-revealed')||''),
        hasReference:String(body?.getAttribute('data-has-reference')||''),
        railCount:rail?1:0,
        senseRows,
        constructionCount,
        dockDisplay:dock?getComputedStyle(dock).display:'',
        engineeringText:text,
        rootOverflow,
        canvasOverflow,
        rect:rect?{width:rect.width,height:rect.height,top:rect.top,bottom:rect.bottom}:null,
        requiredScroll,
        scrollPath
      };
    });

    const checks=[];
    if(observed.ordinal!==ordinal)checks.push(['ORDINAL_IDENTITY',observed.ordinal,ordinal]);
    if(observed.word!==exp.word)checks.push(['WORD_IDENTITY',observed.word,exp.word]);
    if(observed.mode!=='lookup')checks.push(['LOOKUP_MODE',observed.mode,'lookup']);
    if(observed.revealed!=='true')checks.push(['LOOKUP_NOT_REVEALED',observed.revealed,'true']);
    if(observed.dockDisplay!=='none')checks.push(['LOOKUP_DOCK_VISIBLE',observed.dockDisplay,'none']);
    if(observed.senseRows.length!==exp.senseCount)checks.push(['SENSE_COUNT',observed.senseRows.length,exp.senseCount]);
    for(const [index,row] of observed.senseRows.entries()){
      const cn=row.cn==='—'?'':row.cn;
      const en=row.en==='—'?'':row.en;
      if(!cn&&!en)checks.push(['EMPTY_LEARNER_SENSE',index,row]);
    }
    if(observed.constructionCount!==exp.constructionCount){
      checks.push(['CONSTRUCTION_COUNT',observed.constructionCount,exp.constructionCount]);
    }
    const domReference=observed.hasReference==='true'&&observed.railCount===1;
    const domNoReference=observed.hasReference==='false'&&observed.railCount===0;
    if(exp.hasReference?!domReference:!domNoReference){
      checks.push(['REFERENCE_EARNING',{attr:observed.hasReference,rail:observed.railCount},exp.hasReference]);
    }
    const leaked=observed.engineeringText.match(forbidden)?.[0]||'';
    if(leaked)checks.push(['ENGINEERING_LABEL_LEAK',leaked]);
    if(observed.rootOverflow>4||observed.canvasOverflow>4){
      checks.push(['HORIZONTAL_OVERFLOW',{root:observed.rootOverflow,canvas:observed.canvasOverflow}]);
    }
    const rect=observed.rect;
    if(!rect||![rect.width,rect.height,rect.top,rect.bottom].every(Number.isFinite)||rect.width<100||rect.height<100){
      checks.push(['ROOT_GEOMETRY',rect]);
    }
    if(observed.requiredScroll&&!observed.scrollPath)checks.push(['NO_VERTICAL_SCROLL_PATH']);
    if(documentRequests!==documentBaseline){
      checks.push(['DOCUMENT_NAVIGATION_DELTA',documentRequests-documentBaseline,0]);
    }
    if(pageErrors.length)checks.push(['PAGE_ERROR',pageErrors.splice(0)]);

    if(checks.length){
      fail(ordinal,exp.word,checks);
      break;
    }

    result.checked+=1;
    result.last_word=exp.word;
    if(result.checked%reportEvery===0||ordinal===end){
      console.log(JSON.stringify({
        status:'PROGRESS',
        range:[start,end],
        checked:result.checked,
        last_ordinal:ordinal,
        last_word:exp.word,
        document_navigation_delta:documentRequests-documentBaseline
      }));
    }
  }

  if(!process.exitCode){
    const finalCurrent=await readCurrent();
    if(initialSha&&finalCurrent?.sha&&finalCurrent.sha!==initialSha){
      fail(end,expected.get(end)?.word||'',[
        ['CURRENT_CHANGED_DURING_TRAVERSAL',initialSha,finalCurrent.sha]
      ]);
    }
  }

  if(!process.exitCode){
    result.status='PASS';
    result.document_navigation_delta=documentRequests-documentBaseline;
    saveResult();
    console.log(JSON.stringify({
      status:'PASS',
      start,
      end,
      checked:result.checked,
      release_sha:initialSha||null,
      document_navigation_delta:result.document_navigation_delta
    }));
  }

  await context.close();
}finally{
  if(browser)await browser.close();
}
