import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { loadLexicalWordByOrdinal } from '../src/lib/lexical.mjs';
import { lexicalWordRuntimeHref } from '../src/lib/lexicalRuntimeRoute.mjs';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.resolve(webRoot, '../lexical-visual-review');
const port = Number(process.env.KIANOS_UI_REVIEW_PORT || 4331);
const origin = `http://127.0.0.1:${port}`;
const astroBin = path.join(webRoot, 'node_modules', '.bin', 'astro');
const wordUrl = (ordinal, mode = 'study') => `${origin}${lexicalWordRuntimeHref('/', ordinal, mode)}`;

fs.mkdirSync(outputRoot, { recursive: true });
const server = spawn(astroBin, ['preview', '--host', '127.0.0.1', '--port', String(port)], {
  cwd: webRoot,
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe']
});
let serverLog = '';
server.stdout.on('data', (chunk) => { serverLog += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverLog += chunk.toString(); });

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(wordUrl(2), { redirect: 'manual' });
      if (response.ok) return;
    } catch (error) { lastError = error; }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Astro preview did not start: ${lastError?.message || ''}\n${serverLog}`);
}

function assert(condition, label, detail = '') {
  if (!condition) throw new Error(`LEXICAL_VISUAL_FAIL:${label}${detail ? `:${detail}` : ''}`);
}

// Isolated, synthetic checkpoint transport. No private endpoint is ever contacted.
async function isolatePrivateCheckpoint(context) {
  const requests = [];
  await context.route('**/__kianos-private/**', async route => {
    const request = route.request();
    requests.push({ method:request.method(), path:new URL(request.url()).pathname });
    await route.fulfill({ status:request.method()==='GET'?404:200, contentType:'application/json',
      body:JSON.stringify(request.method()==='GET'?{status:'missing',checkpoint:null}:{status:'saved',synthetic:true}) });
  });
  return requests;
}

async function reveal(page, ordinal) {
  await page.goto(wordUrl(ordinal), { waitUntil: 'networkidle' });
  const revealButton = page.locator('[data-vocab-reveal]');
  if (await revealButton.isVisible()) await revealButton.click();
  await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
}

async function audit(page, { ordinal, expectedWord, sparse }) {
  await reveal(page, ordinal);
  const result = await page.evaluate(({ expectedWord, sparse }) => {
    const css = (node) => node instanceof HTMLElement ? getComputedStyle(node) : null;
    const rect = (node) => node instanceof HTMLElement ? node.getBoundingClientRect() : null;
    const word = document.querySelector('.lexicalWordIdentity h2');
    const englishDefinition = document.querySelector('.lexicalSenseMeaning>strong');
    const englishUsage = document.querySelector('.lexicalSenseUsage li>b');
    const sheet = document.querySelector('.portedVocabStudySheet');
    const rows = [...document.querySelectorAll('.lexicalSenseRow:not([data-vocab-reference-sense-id])')].filter((node) => node instanceof HTMLElement && node.getClientRects().length > 0);
    const firstUsableRow = rows.find((row) => row.querySelector('.lexicalSenseUsage li>b')) || rows[0];
    const pos = firstUsableRow?.querySelector('header>span');
    const meaning = firstUsableRow?.querySelector('.lexicalSenseMeaning>p');
    const englishMeaning = firstUsableRow?.querySelector('.lexicalSenseMeaning>strong');
    const usage = firstUsableRow?.querySelector('.lexicalSenseUsage li>b');
    const body = document.querySelector('[data-vocab-body]');
    const reference = document.querySelector('.portedVocabEvidenceColumn');
    const patternSection = document.querySelector('.lexicalWordPatterns');
    const contentNodes = [...document.querySelectorAll(
      '.lexicalCoreHeadline>p,.lexicalCoreHeadline>b,.lexicalCoreHeadline>small,.lexicalSenseMeaning>p,.lexicalSenseMeaning>strong,.lexicalSenseNote,.lexicalSenseUsage li>b,.lexicalSenseUsage li>span,.lexicalExpansionSection>header>span,.portedVocabEvidenceList>article>b,.portedVocabEvidenceList>article>p,.portedVocabEvidenceList>article>small,.lexicalFormBoundary,.lexicalFormVariants b,.lexicalFormVariants span,.lexicalFamilyRows b'
    )].filter((node) => node instanceof HTMLElement && node.getClientRects().length > 0 && css(node).display !== 'none');
    const posRect = rect(pos);
    const meaningRect = rect(meaning);
    const englishMeaningRect = rect(englishMeaning);
    const usageRect = rect(usage);
    // Authorized Sense IPA is now the first learner-visible Meaning-column line.
    // Keep definition geometry for Chinese-before-English/collision checks below.
    const visibleSenseIpa = [...(firstUsableRow?.querySelectorAll('.lexicalSensePronunciation [data-vocab-ipa-locale]') || [])]
      .find((node) => node instanceof HTMLElement && !node.hidden && node.getClientRects().length > 0 && Boolean(node.querySelector('b')?.textContent?.trim()));
    const meaningFirstLine = visibleSenseIpa || meaning;
    const meaningFirstLineRect = rect(meaningFirstLine);
    const tops = [posRect?.top, meaningFirstLineRect?.top, usageRect?.top].filter((value) => Number.isFinite(value));
    const rowStyle = css(firstUsableRow);
    const referenceStyle = css(reference);
    const sheetRect = rect(sheet);
    const wordStyle = css(word);
    const definitionStyle = css(englishDefinition);
    const usageStyle = css(englishUsage);
    return {
      expectedWord,
      sparse,
      wordText:(word?.textContent || '').trim(),
      wordFont:wordStyle?.fontFamily || '',
      definitionFont:definitionStyle?.fontFamily || '',
      usageFont:usageStyle?.fontFamily || '',
      senseCount:rows.length,
      firstUsableIsLast:firstUsableRow === rows.at(-1),
      row:{
        radius:rowStyle?.borderRadius || '',
        shadow:rowStyle?.boxShadow || '',
        bottom:rowStyle?.borderBottomWidth || ''
      },
      alignmentSpread:tops.length >= 2 ? Math.max(...tops)-Math.min(...tops) : null,
      chineseBeforeEnglish:Boolean(meaningRect && englishMeaningRect && meaningRect.top < englishMeaningRect.top),
      columnGaps:{
        posMeaning:posRect && meaningRect ? meaningRect.left-posRect.right : null,
        meaningUsage:meaningRect && usageRect ? usageRect.left-meaningRect.right : null
      },
      hasReferenceFlag:body instanceof HTMLElement && body.dataset.hasReference === 'true',
      referencePresent:reference instanceof HTMLElement,
      reference:{
        radius:referenceStyle?.borderRadius || '',
        shadow:referenceStyle?.boxShadow || ''
      },
      patternPresent:patternSection instanceof HTMLElement,
      minContentFont:contentNodes.length ? Math.min(...contentNodes.map((node) => parseFloat(css(node).fontSize))) : null,
      sheetHeight:sheetRect?.height || null,
      viewport:{width:window.innerWidth,height:window.innerHeight},
      bodyScrollWidth:document.documentElement.scrollWidth,
      bodyClientWidth:document.documentElement.clientWidth
    };
  }, { expectedWord, sparse });

  // Always leave a real screenshot behind, even when a geometry assertion fails.
  await page.screenshot({ path: path.join(outputRoot, `lexical-${expectedWord}.png`), fullPage: false });

  const serif = /Georgia|Times|serif/i;
  assert(result.wordText === expectedWord, 'word_identity', `${ordinal}:${result.wordText}`);
  assert(serif.test(result.wordFont), 'word_serif', result.wordFont);
  assert(!result.definitionFont || serif.test(result.definitionFont), 'definition_serif', result.definitionFont);
  assert(!result.usageFont || serif.test(result.usageFont), 'usage_serif', result.usageFont);
  assert(result.senseCount >= 1, 'sense_rows_present', String(ordinal));
  assert(parseFloat(result.row.radius || '0') <= 8, 'sense_semantic_radius_bounded', result.row.radius);
  assert(result.row.shadow === 'none', 'sense_not_generic_card_shadow', result.row.shadow);
  if (result.senseCount > 1 && !result.firstUsableIsLast) {
    assert(parseFloat(result.row.bottom || '0') >= 1, 'sense_rule_boundary', result.row.bottom);
  }
  assert(result.alignmentSpread === null || result.alignmentSpread <= 12, 'sense_first_line_alignment', String(result.alignmentSpread));
  assert(result.chineseBeforeEnglish, 'sense_chinese_before_english', String(ordinal));
  assert(result.columnGaps.posMeaning === null || result.columnGaps.posMeaning >= 12, 'pos_meaning_no_collision', String(result.columnGaps.posMeaning));
  assert(result.columnGaps.meaningUsage === null || result.columnGaps.meaningUsage >= 12, 'meaning_usage_no_collision', String(result.columnGaps.meaningUsage));
  assert(result.minContentFont === null || result.minContentFont >= 15, 'learner_content_font_floor', String(result.minContentFont));
  assert(result.referencePresent === result.hasReferenceFlag, 'earned_reference_rail', `${ordinal}:${result.referencePresent}/${result.hasReferenceFlag}`);
  if (result.referencePresent) {
    assert(parseFloat(result.reference.radius || '0') <= 1, 'reference_rail_is_not_card', result.reference.radius);
    assert(result.reference.shadow === 'none', 'reference_rail_not_shadowed', result.reference.shadow);
  }
  if (sparse) assert(result.senseCount >= 1, 'sparse_surface_still_has_semantic_content', String(result.senseCount));
  assert(result.bodyScrollWidth <= result.bodyClientWidth + 2, 'no_horizontal_overflow', `${result.bodyScrollWidth}/${result.bodyClientWidth}`);
  return result;
}

async function auditBoundedReadableRows(page, ordinal, stem, outputRoot, suppliedTargets = null) {
  const exact = {
    2024: ['sense:foul:766c01bb73185d64'],
    2052: ['sense:friendly:800bdfcfc6e039d0'],
    2056: ['sense:fringe:aeea9ad07372b227'],
  };
  const ids = exact[ordinal] || ([3185, 856].includes(ordinal)
    ? await page.locator('.portedVocabSenseList > .lexicalSenseRow:visible').evaluateAll(rows => rows
      .filter(row => row.querySelector(':scope > header > small')?.textContent.trim())
      .map(row => row.getAttribute('data-vocab-sense-id')))
    : []);
  const targets = suppliedTargets || ids.map(id => ({id,selector:`.portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id="${id}"]`}));
  const results = [];
  for (const [index, {id,selector}] of targets.entries()) {
    const row = page.locator(selector);
    assert(await row.count()===1, 'batch_readable_exact_target_present', `${stem}:${id}`);
    // Normal scrolling only: no hidden overlays, viewport resize, forced clicks or state mutation.
    await row.evaluate(el => el.scrollIntoView({block:'center', inline:'nearest', behavior:'instant'}));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const evidence = await row.evaluate(el => {
      const rect = n => {const r=n.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
      const dock=document.querySelector('.lexicalActionDock');
      const dockVisible=dock && getComputedStyle(dock).display!=='none' && dock.getClientRects().length;
      const viewport={left:0,right:innerWidth,top:0,bottom:dockVisible?Math.min(innerHeight,rect(dock).top):innerHeight};
      const ancestors=[];
      for(let p=el.parentElement;p;p=p.parentElement) {
        const s=getComputedStyle(p),r=p.getBoundingClientRect();
        const clipsY=/(auto|scroll|hidden|clip)/.test(s.overflowY);
        const clipsX=/(auto|scroll|hidden|clip)/.test(s.overflowX);
        if(clipsY){viewport.top=Math.max(viewport.top,r.top+p.clientTop);viewport.bottom=Math.min(viewport.bottom,r.top+p.clientTop+p.clientHeight);}
        if(clipsX){viewport.left=Math.max(viewport.left,r.left+p.clientLeft);viewport.right=Math.min(viewport.right,r.left+p.clientLeft+p.clientWidth);}
        if(clipsY||clipsX)ancestors.push({tag:p.tagName,className:p.className,scrollTop:p.scrollTop,scrollHeight:p.scrollHeight,clientHeight:p.clientHeight,overflowY:s.overflowY,box:rect(p)});
      }
      const fragments=[],problems=[];
      const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
      while(walker.nextNode()) {
        const text=walker.currentNode,parent=text.parentElement;
        if(!text.textContent.trim()||parent.closest('button,[hidden]'))continue;
        const style=getComputedStyle(parent);
        if(style.display==='none'||style.visibility==='hidden')continue;
        const range=document.createRange();range.selectNodeContents(text);
        for(const r of range.getClientRects()) {
          if(r.width<=0||r.height<=0)continue;
          const f={text:text.textContent.trim(),left:r.left,right:r.right,top:r.top,bottom:r.bottom};
          const inViewport=r.left>=viewport.left-1&&r.right<=viewport.right+1&&r.top>=viewport.top-1&&r.bottom<=viewport.bottom+1;
          const hit=document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);
          const unobscured=Boolean(hit&&(hit===parent||parent.contains(hit)));
          fragments.push({...f,inViewport,unobscured});
          if(!inViewport||!unobscured)problems.push({...f,inViewport,unobscured,hit:hit?{tag:hit.tagName,className:hit.className}:null});
        }
      }
      return {id:el.getAttribute('data-vocab-sense-id'),row:rect(el),viewport,dock:dockVisible?rect(dock):null,ancestors,fragments,problems,pass:fragments.length>0&&problems.length===0};
    });
    // Page screenshot does not auto-scroll the target again, unlike locator.screenshot().
    const screenshot=`${stem}-readable-${index+1}.png`;
    await page.screenshot({path:path.join(outputRoot,screenshot),fullPage:false});
    results.push({...evidence,id,screenshot});
  }
  return results;
}


// Public current Final -> actual DOM: no semantic decisions, no repaired-text inference.
// Compare ordered stable targets and their learner fields, not just row counts.
function expectedBatchProjection(current, mode) {
  const text = value => String(value ?? '').replace(/\s+/g,' ').trim();
  const target = (repair,kind,id,locator) => ({kind:repair?.target_kind||kind,id:repair?.target_id||id||'',locator:repair?.target_locator||locator||''});
  const admitted = sense => mode==='lookup'||sense.disposition!=='EXPLORE_ONLY';
  return {
    word:current.word, wordId:current.word_id, ordinal:String(current.ordinal), fingerprint:current.source_fingerprint,
    core:current.word_feel?{summary:text(current.word_feel.summary_cn),decision:text(current.word_feel.decision_cn)}:null,
    senses:(current.senses||[]).filter(admitted).map(s=>({
      id:s.id,cn:text(s.definition_cn||'—'),en:text(s.definition_en||'—'),pattern:text(s.governing_pattern),note:text(s.note),
      repair:target(s.repair,'sense',s.id,s.source_locator),
      usage:(s.usage||[]).map(u=>({phrase:text(u.phrase),meaning:text(u.meaning_cn),fixed:u.kind==='fixed_pattern',
        repair:u.repair?target(u.repair,'collocation',u.id,u.source_locator):null}))
    })),
    secondary:(current.secondary_senses||[]).filter(admitted).map(s=>({
      cn:text(s.definition_cn||'—'),en:text(s.definition_en||'—'),pattern:text(s.pattern),note:text(s.note),
      repair:target(s.repair,'secondary_sense',s.id,s.source_locator)
    })),
    constructions:(current.constructions||[]).map(c=>({id:c.id,senseId:c.sense_id||'',pattern:text(c.pattern),
      lines:(c.lines||[]).map(l=>text(l.text)),repair:target(c.repair,'construction',c.id,c.source_locator)})),
    reference:(current.reference?.senses||[]).map(s=>({
      id:s.sense_id||s.stable_sense_id||s.id,visible:mode==='lookup',cn:text(s.definition_cn),en:text(s.definition_en),
      pattern:text(s.governing_pattern),note:text(s.usage_note),
      usage:(s.collocations||[]).map(u=>({id:u.collocation_id,phrase:text(u.phrase),meaning:text(u.meaning_cn)}))
    }))
  };
}

async function auditBatchProjection(page, current, mode) {
  const expected = expectedBatchProjection(current,mode);
  const actual = await page.evaluate(() => {
    const text = value => String(value ?? '').replace(/\s+/g,' ').trim();
    const visible = node => node instanceof HTMLElement && !node.closest('[hidden]') && node.getClientRects().length>0 && getComputedStyle(node).visibility!=='hidden';
    const read = (node,selector) => text(node.querySelector(selector)?.textContent);
    const readVisible = (node,selector) => {const field=node.querySelector(selector);return visible(field)?text(field.textContent):'';};
    const repair = button => button?{kind:button.getAttribute('data-target-kind')||'',id:button.getAttribute('data-target-id')||'',locator:button.getAttribute('data-target-locator')||''}:null;
    const root = document.querySelector('[data-local-port="vocabulary"]');
    const core = root.querySelector('.lexicalCoreHeadline');
    return {
      word:root.getAttribute('data-vocab-word'),wordId:root.getAttribute('data-vocab-object'),ordinal:root.getAttribute('data-vocab-ordinal'),fingerprint:root.getAttribute('data-vocab-source-hash'),
      core:core?{summary:readVisible(core,':scope > p'),decision:readVisible(core,'.lexicalCoreDecision > b')}:null,
      senses:[...root.querySelectorAll('.portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id]')].filter(visible).map(row=>({
        id:row.getAttribute('data-vocab-sense-id'),cn:readVisible(row,'.lexicalSenseMeaning > p'),en:readVisible(row,'.lexicalSenseMeaning > strong'),
        pattern:readVisible(row,':scope > header > small'),note:readVisible(row,'.lexicalSenseNote'),repair:repair(row.querySelector(':scope > header > [data-vocab-repair]')),
        usage:[...row.querySelectorAll(':scope > .lexicalSenseUsage > li')].filter(visible).map(li=>({phrase:readVisible(li,':scope > b'),meaning:readVisible(li,':scope > span'),
          fixed:li.classList.contains('isFixedPattern'),repair:repair(li.querySelector(':scope > [data-vocab-repair]'))}))
      })),
      secondary:[...root.querySelectorAll('.portedVocabSenseList > .lexicalSecondarySenseRow')].filter(visible).map(row=>({
        cn:readVisible(row,'.lexicalSenseMeaning > p'),en:readVisible(row,'.lexicalSenseMeaning > strong'),pattern:readVisible(row,'.lexicalSecondaryUsage > code'),
        note:readVisible(row,'.lexicalSenseNote'),repair:repair(row.querySelector(':scope > header > [data-vocab-repair]'))
      })),
      constructions:[...root.querySelectorAll('.lexicalPatternList > article')].filter(visible).map(row=>({
        id:row.getAttribute('data-vocab-construction-id'),senseId:row.getAttribute('data-vocab-construction-sense-id')||'',pattern:readVisible(row,':scope > b'),
        lines:[...row.querySelectorAll('.lexicalPatternText > span')].map(l=>visible(l)?text(l.textContent):''),repair:repair(row.querySelector(':scope > [data-vocab-repair]'))
      })),
      reference:[...root.querySelectorAll('[data-vocab-reference-sense-id]')].map(row=>({
        id:row.getAttribute('data-vocab-reference-sense-id'),visible:visible(row),cn:read(row,'.lexicalSenseMeaning > p'),en:read(row,'.lexicalSenseMeaning > strong'),
        pattern:read(row,':scope > header > small'),note:read(row,'.lexicalSenseMeaning > small'),
        usage:[...row.querySelectorAll('[data-vocab-reference-collocation-id]')].map(li=>({id:li.getAttribute('data-vocab-reference-collocation-id'),phrase:read(li,'code'),meaning:read(li,'span')}))
      }))
    };
  });
  return {expected,actual,pass:JSON.stringify(actual)===JSON.stringify(expected)};
}

// Frozen Final identity, Scope overlay and typed retirement checks; test-only.
function batchStableJson(value) {
  if (Array.isArray(value)) return `[${value.map(batchStableJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${batchStableJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

function batchFinalSha256(current) {
  return createHash('sha256').update(batchStableJson(current)).digest('hex');
}

function expectedBatchScope(current, mode) {
  const text = value => String(value ?? '').replace(/\s+/g,' ').trim();
  const target = repair => ({kind:repair?.target_kind||'form_identity',id:repair?.target_id||'',locator:repair?.target_locator||''});
  return {
    lineage:current.sense_lineage||[],
    relations:[...(current.reference?.confusables||[]),...(current.reference?.relations||[])].map(r=>({title:text(r.title),lines:(r.lines||[]).map(l=>({text:text(l.text),lang:l.lang==='cn'?'cn':'en'})),differences:(r.differences||[]).map(d=>({key:text(d.key),value:text(d.value)})),repair:{kind:r.repair?.target_kind||'relation',id:r.repair?.target_id||r.id||'',locator:r.repair?.target_locator||''}})),
    overlays:(current.senses||[]).filter(s=>mode==='lookup'||s.disposition!=='EXPLORE_ONLY')
      .flatMap(s=>s.identity_overlay?.text?[{senseId:s.id,text:text(s.identity_overlay.text),repair:target(s.identity_overlay.repair)}]:[])
  };
}

async function auditBatchScope(page, current, mode) {
  const expected=expectedBatchScope(current,mode);
  const actual=await page.evaluate(()=>{
    const visible=node=>node instanceof HTMLElement&&!node.closest('[hidden]')&&node.getClientRects().length>0&&getComputedStyle(node).visibility!=='hidden';
    const root=document.querySelector('[data-local-port="vocabulary"]');
    const text=node=>visible(node)?String(node.textContent??'').replace(/\s+/g,' ').trim():'';
    const repair=button=>button?{kind:button.getAttribute('data-target-kind')||'',id:button.getAttribute('data-target-id')||'',locator:button.getAttribute('data-target-locator')||''}:null;
    return {
      lineage:JSON.parse(root.querySelector('[data-vocab-identity-lineage]')?.textContent||'null'),
      relations:[...root.querySelectorAll('.lexicalRelationSection .portedVocabEvidenceList > article')].filter(visible).map(row=>({title:text(row.querySelector(':scope > b')),lines:[...row.querySelectorAll('.lexicalRelationText > p')].map(line=>({text:text(line),lang:line.classList.contains('is-cn')?'cn':'en'})),differences:[...row.querySelectorAll('.lexicalRelationDecision > div')].map(d=>({key:text(d.querySelector('dt')),value:text(d.querySelector('dd'))})),repair:repair(row.querySelector(':scope > [data-vocab-repair]'))})),
      overlays:[...root.querySelectorAll('.portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id]')].filter(visible)
        .flatMap(row=>[...row.querySelectorAll('.portedVocabIdentityOverlay')].filter(visible).map(overlay=>({senseId:row.getAttribute('data-vocab-sense-id'),text:text(overlay.querySelector(':scope > b')),repair:repair(overlay.querySelector(':scope > [data-vocab-repair]'))})))
    };
  });
  return {expected,actual,pass:batchStableJson(expected)===batchStableJson(actual)};
}

// Reference content must be actually visible in Lookup, not merely present as textContent.
// Study hidden-reference assertions remain in the unchanged original geometry guard.
async function auditBatchReferenceVisibility(page, current, mode) {
  if(mode!=='lookup') return {mode,checkedBy:'original Study hidden-reference guard',pass:true};
  const text=value=>String(value??'').replace(/\s+/g,' ').trim();
  const expected=(current.reference?.senses||[]).map(s=>({id:s.sense_id||s.stable_sense_id||s.id,cn:text(s.definition_cn),en:text(s.definition_en),pattern:text(s.governing_pattern),note:text(s.usage_note),usage:(s.collocations||[]).map(c=>({id:c.collocation_id,phrase:text(c.phrase),meaning:text(c.meaning_cn)}))}));
  const actual=await page.evaluate(()=>{
    const visible=node=>node instanceof HTMLElement&&!node.closest('[hidden]')&&node.getClientRects().length>0&&getComputedStyle(node).visibility!=='hidden';
    const read=(row,selector)=>{const field=row.querySelector(selector);return visible(field)?String(field.textContent??'').replace(/\s+/g,' ').trim():'';};
    return [...document.querySelectorAll('[data-vocab-reference-sense-id]')].map(row=>({id:row.getAttribute('data-vocab-reference-sense-id'),cn:read(row,'.lexicalSenseMeaning > p'),en:read(row,'.lexicalSenseMeaning > strong'),pattern:read(row,':scope > header > small'),note:read(row,'.lexicalSenseMeaning > small'),usage:[...row.querySelectorAll('[data-vocab-reference-collocation-id]')].map(child=>({id:child.getAttribute('data-vocab-reference-collocation-id'),phrase:read(child,'code'),meaning:read(child,'span')}))}));
  });
  return {mode,expected,actual,pass:batchStableJson(expected)===batchStableJson(actual)};
}

function batchRetirementDeclarations(current, baseline) {
  const prior=baseline?.sense_lineage||[];
  const reference=current.reference?.senses||[];
  const changed=(current.sense_lineage||[]).filter(line=>line.status==='deprecated'&&line.to_target_id===null&&!prior.some(old=>batchStableJson(old)===batchStableJson(line)));
  return changed.map(line=>({kind:line.target_kind,id:line.from_target_id,
    representation:line.target_kind==='sense'&&reference.some(s=>(s.sense_id||s.stable_sense_id||s.id)===line.from_target_id)?'reference-sense'
      :line.target_kind==='collocation'&&reference.some(s=>(s.collocations||[]).some(c=>c.collocation_id===line.from_target_id))?'reference-collocation':'source-archive-only'}));
}

function batchRetirementPass(declaration, actual) {
  const valid=['sense','secondary_sense','collocation','construction','form_identity'];
  if(!valid.includes(declaration.kind)||!declaration.id||actual.activeCount!==0||actual.repairCount!==0) return false;
  if(declaration.representation==='reference-sense') return declaration.kind==='sense'&&actual.referenceSenseCount===1&&actual.referenceChildCount===0;
  if(declaration.representation==='reference-collocation') return declaration.kind==='collocation'&&actual.referenceChildCount>=1&&actual.referenceSenseCount===0;
  return declaration.representation==='source-archive-only'&&actual.referenceSenseCount===0&&actual.referenceChildCount===0;
}

async function auditBatchRetirements(page, declarations) {
  const results=[];
  for(const declaration of declarations) {
    const actual=await page.evaluate(({kind,id})=>{
      const root=document.querySelector('[data-local-port="vocabulary"]');
      const matching=(selector,attribute)=>[...root.querySelectorAll(selector)].filter(node=>node.getAttribute(attribute)===id).length;
      const activeSelector={sense:['.portedVocabSenseList > [data-vocab-sense-id]','data-vocab-sense-id'],construction:['[data-vocab-construction-id]','data-vocab-construction-id']}[kind];
      const repairCount=[...root.querySelectorAll('[data-vocab-repair]')].filter(node=>node.getAttribute('data-target-kind')===kind&&node.getAttribute('data-target-id')===id).length;
      return {activeCount:activeSelector?matching(...activeSelector):repairCount,repairCount,
        referenceSenseCount:matching('[data-vocab-reference-sense-id]','data-vocab-reference-sense-id'),
        referenceChildCount:matching('[data-vocab-reference-collocation-id]','data-vocab-reference-collocation-id')};
    },declaration);
    results.push({...declaration,actual,pass:batchRetirementPass(declaration,actual)});
  }
  return {declarations:results,pass:results.every(row=>row.pass)};
}

// #1302: bounded rendered regression evidence, not a second content authority.
async function auditThirdQualityBatch(browser) {
  const bindingStatus = "FROZEN_FOR_BROWSER";
  assert(bindingStatus==='FROZEN_FOR_BROWSER','batch_final_freeze_required',bindingStatus);
  const fixtures = [
    {
      "ordinal": 2206,
      "word": "grim",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "37c8db91d9694b203ff047259ccfd19d9b54973283962cfeb11f19baec711e2f",
      "expectedFinalSha256": "f72bf8e09a217d69f72fd6e2633cecff7279033a71f3dbf9d613897a84407f70",
      "input_path": "frozen-inputs/o2206.json",
      "input_file_sha256": "09c19a79969d25d48dbd9d7fee8e1795fc87c25ef37e5d68a05231f28424fccf",
      "retiredIdentities": [],
      "readableTargets": {}
    },
    {
      "ordinal": 2209,
      "word": "grip",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "41697d4f78ff6a7bd6ec98187e215a1bee93119f338c2ebf9bd9f8a4728d966d",
      "expectedFinalSha256": "18142069707063e5fdea9aa4ce119ad238b65503abf7af95bdf4a7f2da2a1088",
      "input_path": "frozen-inputs/o2209.json",
      "input_file_sha256": "a645690b1315c962fdada26e64fbee4bfd38f015455b4e8d63e0e90dbe6a58ee",
      "retiredIdentities": [
        {
          "kind": "sense",
          "id": "sense:grip:a4e6998d28c058e2",
          "representation": "reference-sense"
        },
        {
          "kind": "collocation",
          "id": "collocation:96b725d6c0029e3e2988",
          "representation": "reference-collocation"
        }
      ],
      "readableTargets": {
        "study": [
          {
            "kind": "sense",
            "id": "sense:grip:d2305fcb77939e27",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:grip:d2305fcb77939e27\"]",
            "reason": "new split contrast or fixed longest-row regression"
          },
          {
            "kind": "sense",
            "id": "sense:grip:3a7720987827c013",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:grip:3a7720987827c013\"]",
            "reason": "new split contrast or fixed longest-row regression"
          },
          {
            "kind": "sense",
            "id": "sense:grip:a66d2228352e8e09",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:grip:a66d2228352e8e09\"]",
            "reason": "new split contrast or fixed longest-row regression"
          }
        ],
        "lookup": [
          {
            "kind": "reference-sense",
            "id": "sense:grip:a4e6998d28c058e2",
            "selector": "[data-vocab-reference-sense-id=\"sense:grip:a4e6998d28c058e2\"]",
            "reason": "retired merged Chinese meaning stays reference-only; no Repair"
          }
        ]
      }
    },
    {
      "ordinal": 2212,
      "word": "grope",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "18058cb17861db762a3dc9f6e683c8e546e2dbd4157245b87f34024fa49f5315",
      "expectedFinalSha256": "692e76b234044f5bb275fc46afcc0095a3c30d7978a6256d28cf4586d52e2846",
      "input_path": "frozen-inputs/o2212.json",
      "input_file_sha256": "9d3f661a3a8db1864a4ad2faf25db28d44bc456796d5e51fe51f052a29bb8885",
      "retiredIdentities": [],
      "readableTargets": {
        "study": [
          {
            "kind": "construction",
            "id": "construction:bc976c09c2ec8a7e464e",
            "selector": ".lexicalPatternList > article[data-vocab-construction-id=\"construction:bc976c09c2ec8a7e464e\"]",
            "reason": "long Chinese condition; have title separately identifies arrangement vs unwanted experience"
          }
        ]
      }
    },
    {
      "ordinal": 2223,
      "word": "guidance",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "8f2c8f9e5380d03fc710153f37b6a5e42ba686ad7588b5219753f8eec39b73fc",
      "expectedFinalSha256": "5e934e900a95b8739f3596786b068e17fafe35c2541c78cd1141dd3d5a25c0d1",
      "input_path": "frozen-inputs/o2223.json",
      "input_file_sha256": "8b73895da802fc144a5ba5471764d54158510ba8a2f8ca51e72cb2175d06b397",
      "retiredIdentities": [],
      "readableTargets": {}
    },
    {
      "ordinal": 2231,
      "word": "gum",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "bc86f69a532185f7e51a53405957dfe8d158d8e047c20c602021c488b9fb1321",
      "expectedFinalSha256": "7fb2f1c850c3a614674c8735bbe3468039e9d392d962fe83367ac3dd5e7a1e73",
      "input_path": "frozen-inputs/o2231.json",
      "input_file_sha256": "bdc4976424b454a1f6ba4683d352559242864cd2f453ef28c05bfee195b8d386",
      "retiredIdentities": [
        {
          "kind": "sense",
          "id": "sense:gum:ac62661705355ea1",
          "representation": "reference-sense"
        }
      ],
      "readableTargets": {
        "study": [
          {
            "kind": "sense",
            "id": "sense:gum:8995595443016393",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:gum:8995595443016393\"]",
            "reason": "new split contrast or fixed longest-row regression"
          },
          {
            "kind": "sense",
            "id": "sense:gum:ea43fa1dfe115faf",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:gum:ea43fa1dfe115faf\"]",
            "reason": "new split contrast or fixed longest-row regression"
          }
        ],
        "lookup": [
          {
            "kind": "reference-sense",
            "id": "sense:gum:ac62661705355ea1",
            "selector": "[data-vocab-reference-sense-id=\"sense:gum:ac62661705355ea1\"]",
            "reason": "retired merged Chinese meaning stays reference-only; no Repair"
          }
        ]
      }
    },
    {
      "ordinal": 2232,
      "word": "gun",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "5f72a8af92afb92570be62fad0879e9a47f015bfb843014d9fbe86bf91378f31",
      "expectedFinalSha256": "0d3af0e73797219b017cdbacbbfe80fbaa6804a4ae20202d234356b60c7fe8ff",
      "input_path": "frozen-inputs/o2232.json",
      "input_file_sha256": "1e710cdbe854cc65275f0b919f5a58f7a12c97d3c1efbf34bff1bcd1cd4663fd",
      "retiredIdentities": [],
      "readableTargets": {
        "study": [
          {
            "kind": "sense",
            "id": "sense:gun:753d83db9a9e9043",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:gun:753d83db9a9e9043\"]",
            "reason": "final new Chinese contrast or long condition; both widths"
          },
          {
            "kind": "sense",
            "id": "sense:gun:d9f0e40bf586d0d5",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:gun:d9f0e40bf586d0d5\"]",
            "reason": "final new Chinese contrast or long condition; both widths"
          }
        ]
      }
    },
    {
      "ordinal": 2236,
      "word": "habit",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "a56b7648493a840ed93e99495d42d497a2295bdf2b6be5872a490e8d9733def6",
      "expectedFinalSha256": "816e832450d65baeefaf6d6d77498d8b38ac63cddc5360146c88db1bbdf219e9",
      "input_path": "frozen-inputs/o2236.json",
      "input_file_sha256": "c758b7a0abd29b7bd6f8c3ab824469976455db31a14de5bb2b0d550f6d8a5081",
      "retiredIdentities": [],
      "readableTargets": {
        "study": [
          {
            "kind": "sense",
            "id": "sense:habit:85f29d59fcf2af89",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:habit:85f29d59fcf2af89\"]",
            "reason": "final new Chinese contrast or long condition; both widths"
          }
        ]
      }
    },
    {
      "ordinal": 2238,
      "word": "hail",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "7c9b585bd4452027612cef7e438b103b7afb88c3027fa3250002fee200abf3c9",
      "expectedFinalSha256": "25f61f269ff7f183716234271af4cadeff94edefd7d947927bb0ad7f8250d4cc",
      "input_path": "frozen-inputs/o2238.json",
      "input_file_sha256": "d3e7b777cadf10a6a3d6de105264febf5bc09ef68e16bcc43f202c383f316f0f",
      "retiredIdentities": [
        {
          "kind": "sense",
          "id": "sense:hail:ce1775e9726d54d1",
          "representation": "reference-sense"
        }
      ],
      "readableTargets": {
        "study": [
          {
            "kind": "sense",
            "id": "sense:hail:d33c2c1e4cf2588c",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:hail:d33c2c1e4cf2588c\"]",
            "reason": "new split contrast or fixed longest-row regression"
          },
          {
            "kind": "sense",
            "id": "sense:hail:38fd14036c38bc34",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:hail:38fd14036c38bc34\"]",
            "reason": "new split contrast or fixed longest-row regression"
          }
        ],
        "lookup": [
          {
            "kind": "reference-sense",
            "id": "sense:hail:ce1775e9726d54d1",
            "selector": "[data-vocab-reference-sense-id=\"sense:hail:ce1775e9726d54d1\"]",
            "reason": "retired merged Chinese meaning stays reference-only; no Repair"
          }
        ]
      }
    },
    {
      "ordinal": 2245,
      "word": "hammer",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "520f8db1cac1961470066942388d6f75f9fe076c725777a1389ad3ddbc4a3e77",
      "expectedFinalSha256": "8f932f5909df7c396df1edd6d5ecb02224ddd663073ab4fd5b4ddf78d1030e84",
      "input_path": "frozen-inputs/o2245.json",
      "input_file_sha256": "3ef20058345b35a4686c5d40acb30f8e2fd20faa4169ffed745194334aebd4c1",
      "retiredIdentities": [],
      "readableTargets": {}
    },
    {
      "ordinal": 2253,
      "word": "handsome",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "b0869d8c7e8a07e9572659f449d6d13ede54fc644ffc0d0532bc5fe60c5f538c",
      "expectedFinalSha256": "f0408d0b8bd2b2457770abe3601f8872283056346ff209ba865061583d77dd2a",
      "input_path": "frozen-inputs/o2253.json",
      "input_file_sha256": "7e8d67ed761c19c31872f55059551184268007493da723e897e7bb34502ada69",
      "retiredIdentities": [],
      "readableTargets": {}
    },
    {
      "ordinal": 2255,
      "word": "handy",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "c1286fdeb8ff5171e69894b7be8e3200a94d512df07c5f272bbb83625352f9f5",
      "expectedFinalSha256": "3319030853bc50971629b4e25676069ea119c50f792d33c023240f24f46c1722",
      "input_path": "frozen-inputs/o2255.json",
      "input_file_sha256": "ffa0fc9fc48ee90c94a8fe5f721d83f480da6f7938367d684e6d8c8b28e664c1",
      "retiredIdentities": [
        {
          "kind": "sense",
          "id": "sense:handy:cf81091d4fb15020",
          "representation": "reference-sense"
        }
      ],
      "readableTargets": {
        "study": [
          {
            "kind": "sense",
            "id": "sense:handy:adec52728bba2148",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:handy:adec52728bba2148\"]",
            "reason": "new split contrast or fixed longest-row regression"
          },
          {
            "kind": "sense",
            "id": "sense:handy:28b581bf9b1fc02e",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:handy:28b581bf9b1fc02e\"]",
            "reason": "new split contrast or fixed longest-row regression"
          }
        ],
        "lookup": [
          {
            "kind": "reference-sense",
            "id": "sense:handy:cf81091d4fb15020",
            "selector": "[data-vocab-reference-sense-id=\"sense:handy:cf81091d4fb15020\"]",
            "reason": "retired merged Chinese meaning stays reference-only; no Repair"
          }
        ]
      }
    },
    {
      "ordinal": 2256,
      "word": "hang",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "f89feeb53f7f785b31133d7afe784ecbe27c87a5ad1ad77dd20ba9b60bef8459",
      "expectedFinalSha256": "2239939eccba167b16a834cdce98f110478237d4ad82116cce1d733037c7efd2",
      "input_path": "frozen-inputs/o2256.json",
      "input_file_sha256": "e59763bbf4b0cc2e58fa394c17247362a70c8e5fc4d41d8f80ab35cc62f6b979",
      "retiredIdentities": [],
      "readableTargets": {
        "study": [
          {
            "kind": "sense",
            "id": "sense:hang:7a28d8f0f4c25076",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:hang:7a28d8f0f4c25076\"]",
            "reason": "final new Chinese contrast or long condition; both widths"
          }
        ]
      }
    },
    {
      "ordinal": 2258,
      "word": "happy",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "79742ce7d0e67e83d90cda2968e501a53d2dec21c9849df3206bbd245e2a408a",
      "expectedFinalSha256": "bd63c22786594fb37c22be36c7d59747c68f450dc02b0bde56435e45394ea404",
      "input_path": "frozen-inputs/o2258.json",
      "input_file_sha256": "93ac356a4b0bd24440b4b48e32bc59331c5b4288402241cb56a4564d61a9a360",
      "retiredIdentities": [
        {
          "kind": "sense",
          "id": "sense:happy:18def78bf68755ea",
          "representation": "reference-sense"
        }
      ],
      "readableTargets": {
        "study": [
          {
            "kind": "sense",
            "id": "sense:happy:63f503ac544466ca",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:happy:63f503ac544466ca\"]",
            "reason": "new split contrast or fixed longest-row regression"
          },
          {
            "kind": "sense",
            "id": "sense:happy:d4acfd45e6f3ee81",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:happy:d4acfd45e6f3ee81\"]",
            "reason": "new split contrast or fixed longest-row regression"
          }
        ],
        "lookup": [
          {
            "kind": "reference-sense",
            "id": "sense:happy:18def78bf68755ea",
            "selector": "[data-vocab-reference-sense-id=\"sense:happy:18def78bf68755ea\"]",
            "reason": "retired merged Chinese meaning stays reference-only; no Repair"
          }
        ]
      }
    },
    {
      "ordinal": 2270,
      "word": "harvest",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "666920b2d3518e677cb230fbb03650cfecbf4097cf49e629358d0b1cb32580f1",
      "expectedFinalSha256": "2a60274e6f4f99d3c2839121f604d85c2621b76422cb9b679c394969ec7df44c",
      "input_path": "frozen-inputs/o2270.json",
      "input_file_sha256": "8e2d05eb9fb05a1fe0b5ed17537f0a73762647ad7faeff58ba4950ce6b65a4ac",
      "retiredIdentities": [
        {
          "kind": "sense",
          "id": "sense:harvest:d7a5dce656fd529e",
          "representation": "reference-sense"
        }
      ],
      "readableTargets": {
        "study": [
          {
            "kind": "sense",
            "id": "sense:harvest:f784027a60a8cea6",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:harvest:f784027a60a8cea6\"]",
            "reason": "new split contrast or fixed longest-row regression"
          },
          {
            "kind": "sense",
            "id": "sense:harvest:e0fb2a8f1a77c476",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:harvest:e0fb2a8f1a77c476\"]",
            "reason": "new split contrast or fixed longest-row regression"
          }
        ],
        "lookup": [
          {
            "kind": "reference-sense",
            "id": "sense:harvest:d7a5dce656fd529e",
            "selector": "[data-vocab-reference-sense-id=\"sense:harvest:d7a5dce656fd529e\"]",
            "reason": "retired merged Chinese meaning stays reference-only; no Repair"
          }
        ]
      }
    },
    {
      "ordinal": 2277,
      "word": "haul",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "aea901d9675e9996ae66496f8afaf67760e27ac1f9cdab5a0b4f669747bb5a97",
      "expectedFinalSha256": "2a7647366c29b53fd96db704f5f477c93a97031689956f4f136bbdcc66179394",
      "input_path": "frozen-inputs/o2277.json",
      "input_file_sha256": "25f1b8c5c61f0105bc5bf5c246ba667cd0b70cf3beb5be8676cf84984614e459",
      "retiredIdentities": [],
      "readableTargets": {
        "study": [
          {
            "kind": "sense",
            "id": "sense:haul:d8dd94aac5a552f6",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:haul:d8dd94aac5a552f6\"]",
            "reason": "final new Chinese contrast or long condition; both widths"
          }
        ]
      }
    },
    {
      "ordinal": 2278,
      "word": "have",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "c15f2dea070e5413acbec31f56af6e52e1f8ae9c6ad80295419097f4267d94da",
      "expectedFinalSha256": "031e054075161af3966d6d207fb8489f96b037d9c0f8a9dd791639417c626466",
      "input_path": "frozen-inputs/o2278.json",
      "input_file_sha256": "f15d1ea8004c73bd5ececa5bb12b1bcd96f590959d8797ee557379bbfb6b75ff",
      "retiredIdentities": [
        {
          "kind": "construction",
          "id": "construction:ee7f7b218eabd0154442",
          "representation": "source-archive-only"
        }
      ],
      "readableTargets": {
        "study": [
          {
            "kind": "construction",
            "id": "construction:2dab5f5eb6e8c6446998",
            "selector": ".lexicalPatternList > article[data-vocab-construction-id=\"construction:2dab5f5eb6e8c6446998\"]",
            "reason": "long Chinese condition; have title separately identifies arrangement vs unwanted experience"
          },
          {
            "kind": "construction",
            "id": "construction:4cf5e01e464577e922df",
            "selector": ".lexicalPatternList > article[data-vocab-construction-id=\"construction:4cf5e01e464577e922df\"]",
            "reason": "long Chinese condition; have title separately identifies arrangement vs unwanted experience"
          },
          {
            "kind": "relation",
            "id": "deep:semantic_contrast:own:65f0bc2efd9295ef",
            "selector": ".lexicalRelationSection .portedVocabEvidenceList > article:has(> [data-vocab-repair][data-target-kind=\"relation\"][data-target-id=\"deep:semantic_contrast:own:65f0bc2efd9295ef\"])",
            "reason": "same authorized Chinese boundary visible in both actual consumers; own is not a word review"
          }
        ]
      }
    },
    {
      "ordinal": 2281,
      "word": "hazard",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "a5ab1738b258c5715e3b108af81daa20386686064d02b689a736728e1624cc94",
      "expectedFinalSha256": "d315311b0f7a47ddaaa997b2721aea69b796e3f60b31e877b04a391f7deacfa6",
      "input_path": "frozen-inputs/o2281.json",
      "input_file_sha256": "e9fee21f5b87483cbf3f396ad6beb7fd2284704c573304eb5ea903511faedbb7",
      "retiredIdentities": [
        {
          "kind": "sense",
          "id": "sense:hazard:7edeff450521505c",
          "representation": "reference-sense"
        }
      ],
      "readableTargets": {
        "study": [
          {
            "kind": "sense",
            "id": "sense:hazard:a77247c6f310bde2",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:hazard:a77247c6f310bde2\"]",
            "reason": "new split contrast or fixed longest-row regression"
          },
          {
            "kind": "sense",
            "id": "sense:hazard:10e6a85e14c913af",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:hazard:10e6a85e14c913af\"]",
            "reason": "new split contrast or fixed longest-row regression"
          }
        ],
        "lookup": [
          {
            "kind": "reference-sense",
            "id": "sense:hazard:7edeff450521505c",
            "selector": "[data-vocab-reference-sense-id=\"sense:hazard:7edeff450521505c\"]",
            "reason": "retired merged Chinese meaning stays reference-only; no Repair"
          }
        ]
      }
    },
    {
      "ordinal": 2282,
      "word": "he",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "4ebf3cb444a4d1fb94b29589641d4ff3a18c71c83e56ed2a24d783974a71a3bb",
      "expectedFinalSha256": "838d0745e59a1a05bafdd1b7d74c9b7843e32c622965604c8e3347b55412a6f3",
      "input_path": "frozen-inputs/o2282.json",
      "input_file_sha256": "610111b8984559865d50e88e4785c25f7075e582f18faec2aa7b17504ec9f033",
      "retiredIdentities": [],
      "readableTargets": {}
    },
    {
      "ordinal": 2283,
      "word": "head",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "19d139986ebfb800984bc90ab77fd6a09bce5b748ea2a9973519d65d6b5df5c9",
      "expectedFinalSha256": "8f3db8f5833bd6fee8880a3a2301aec4c1536e35bf6d9ccbe2c45c11c7b6087a",
      "input_path": "frozen-inputs/o2283.json",
      "input_file_sha256": "891d62b8a88cc19e99bb4743760b42352795e2e60d4c34b83ea08478e1efcd1d",
      "retiredIdentities": [],
      "readableTargets": {}
    },
    {
      "ordinal": 2287,
      "word": "headquarters",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "da4818d1baacb9bbca12eaf5e8c4a9bcbab0b8cecc7422afab6026bef26b912b",
      "expectedFinalSha256": "c26fcdeb0f68079e8db010c8ff1490d95f66e8480fecfe4df0b4afba5d893bb6",
      "input_path": "frozen-inputs/o2287.json",
      "input_file_sha256": "df8ed1595d914c77b40a5cb66dd9f0ebe3c2c01593259838ce437fe938ecfc00",
      "retiredIdentities": [],
      "readableTargets": {}
    },
    {
      "ordinal": 2294,
      "word": "heart",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "a6b2d9c037c2c47de7cddb7f50f02913822cab4fee0ac8f9f8b6e13d66da63a4",
      "expectedFinalSha256": "3459e6b5d699cc9bd44fd1a9f5a52d4c05deb258c5e8cd2eb54e01ef959112cd",
      "input_path": "frozen-inputs/o2294.json",
      "input_file_sha256": "5d141c4ef8809b4f24a965b6717e1be223f3dc72b0ba1852ef2f246a9fcb86ab",
      "retiredIdentities": [],
      "readableTargets": {
        "study": [
          {
            "kind": "sense",
            "id": "sense:heart:f6a126f0968181f2",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:heart:f6a126f0968181f2\"]",
            "reason": "final new Chinese contrast or long condition; both widths"
          }
        ]
      }
    },
    {
      "ordinal": 2295,
      "word": "heat",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "ed399ba4b7b24e2794d9c7354a10b8c103ccea1ebc4be0475ed3a7bf91efdcc7",
      "expectedFinalSha256": "722bcbbb35092acdd9b56f5766f3e651959b9aeb18e63166ae8a3d4b7d333cd5",
      "input_path": "frozen-inputs/o2295.json",
      "input_file_sha256": "8a5d9f4bd530637945f1bd9cc379085e22c026fa184f24cb4cf9ad04994fab01",
      "retiredIdentities": [],
      "readableTargets": {}
    },
    {
      "ordinal": 2299,
      "word": "hedge",
      "coverage": "batch-2200-2299-target",
      "expectedSourceFingerprint": "990d2e5bb4b5e2bb6c7faaafce805485a3dd8fe6e1434624bd77ca79c3a04276",
      "expectedFinalSha256": "8fe743d1216139732406c949e7eaadce1bc0e76cd6229676f1422a960a1f1c50",
      "input_path": "frozen-inputs/o2299.json",
      "input_file_sha256": "6baeb9c658af2524bf871ee8fba48c337a7be6a8ac05d21171ca6315186adc05",
      "retiredIdentities": [],
      "readableTargets": {}
    },
    {
      "ordinal": 2214,
      "word": "ground",
      "coverage": "unchanged-rich-control",
      "expectedSourceFingerprint": "122fc3076006db7c21866d2bbedcc167f3395597e1025cd03d875d35ee6d6879",
      "expectedFinalSha256": "802e9d5c9cb8f878960f9c1c91e1f44cb1bdf08c9897dd0ed903196d6ea8ccd0",
      "input_path": "frozen-inputs/o2214.json",
      "input_file_sha256": "dbd7ba2921226d54aa81afaaa997d0d9c19c7ae19285933fa8e3d2736fc380f9",
      "retiredIdentities": [],
      "readableTargets": {}
    },
    {
      "ordinal": 2247,
      "word": "hand",
      "coverage": "unchanged-rich-control",
      "expectedSourceFingerprint": "7a5edc7ffd75410f75c720e17fd8aa7077e0e4915cf081eca2bbe3a578ce6d62",
      "expectedFinalSha256": "c32f9eee1cdb4d4375f0e5a37836f1068082bc772fee313c684a4597c3204a11",
      "input_path": "frozen-inputs/o2247.json",
      "input_file_sha256": "c482c0126d154ff938f33c5d54819c57faa938d51961f012d1daf8a310c99fac",
      "retiredIdentities": [],
      "readableTargets": {}
    },
    {
      "ordinal": 3185,
      "word": "natural",
      "coverage": "fixed-collision-regression",
      "expectedSourceFingerprint": "731648794e6108382ce3d2c117f02ae9ac60bd3b1110c4d76bef31266d0d05c3",
      "expectedFinalSha256": "c291c343e347b5c8c2da808b3ee222b2a8aa04309a658c5bb6897d3eb7b6c445",
      "input_path": "frozen-inputs/o3185.json",
      "input_file_sha256": "d8e05470114d8711e06023d100203d99b33e72dcfd540eecf5978b1341f8cf6a",
      "retiredIdentities": [],
      "readableTargets": {
        "study": [
          {
            "kind": "sense",
            "id": "sense:natural:d6b11c3d7a05cb31",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:natural:d6b11c3d7a05cb31\"]",
            "reason": "new split contrast or fixed longest-row regression"
          }
        ]
      }
    },
    {
      "ordinal": 856,
      "word": "close",
      "coverage": "fixed-collision-regression",
      "expectedSourceFingerprint": "da2b969ad555eac242f09a1e927069561edc3c84d6c1ac6f2f7f2b45efafde8f",
      "expectedFinalSha256": "8ed9d6960563e20b878e6bc1945884ac749f273fca775b5440940a68a4f04338",
      "input_path": "frozen-inputs/o856.json",
      "input_file_sha256": "6a940014720aa3cf79c7647e82142723ee2e69909ac6654d5dbe2d956773c9f8",
      "retiredIdentities": [],
      "readableTargets": {
        "study": [
          {
            "kind": "sense",
            "id": "sense:close:341282390f479362",
            "selector": ".portedVocabSenseList > .lexicalSenseRow[data-vocab-sense-id=\"sense:close:341282390f479362\"]",
            "reason": "new split contrast or fixed longest-row regression"
          }
        ]
      }
    },
    {
      "ordinal": 3431,
      "word": "own",
      "coverage": "shared-relation-dependent-only",
      "expectedSourceFingerprint": "a6a670d90dc94f64de7481a9e33cdda95ae30d5462b08bcac59971e12fb788bd",
      "expectedFinalSha256": "f15fa320b9b160d64709c52f732c53d47556f88dd57720043ce1fa29b8baa75e",
      "input_path": "frozen-inputs/o3431.json",
      "input_file_sha256": "4737100f4e3936917e07cbb0f494032422f32d7f03750cfdfc47564b9924f3a0",
      "retiredIdentities": [],
      "readableTargets": {
        "study": [
          {
            "kind": "relation",
            "id": "deep:semantic_contrast:own:65f0bc2efd9295ef",
            "selector": ".lexicalRelationSection .portedVocabEvidenceList > article:has(> [data-vocab-repair][data-target-kind=\"relation\"][data-target-id=\"deep:semantic_contrast:own:65f0bc2efd9295ef\"])",
            "reason": "same authorized Chinese boundary visible in both actual consumers; own is not a word review"
          }
        ]
      }
    }
  ];
  const relationId='deep:semantic_contrast:own:65f0bc2efd9295ef';
  const relationCn=ordinal=>(loadLexicalWordByOrdinal(ordinal).record.reference?.relations||[])
    .filter(r=>r.repair?.target_id===relationId).map(r=>(r.lines||[]).filter(l=>l.lang==='cn').map(l=>l.text));
  const haveRelation=relationCn(2278),ownRelation=relationCn(3431);
  assert(haveRelation.length===1&&ownRelation.length===1&&batchStableJson(haveRelation)===batchStableJson(ownRelation),'batch_have_own_relation_chinese_bidirectional');
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  const privateRequests = await isolatePrivateCheckpoint(context);
  const page = await context.newPage();
  const report = { status: 'RUNNING', scope:'batch-2200-2299', bindingStatus, synthetic:true, cases: [], navigation: [], errors: [], privateRequests };
  page.on('pageerror', error => report.errors.push(String(error)));
  const save = () => fs.writeFileSync(path.join(outputRoot, 'batch-2200-2299-rendered.json'), `${JSON.stringify(report, null, 2)}\n`);
  const ready = async (ordinal, mode) => {
    await page.locator(`[data-local-port="vocabulary"][data-vocab-ordinal="${ordinal}"][data-vocab-initialized="true"][data-vocab-mode="${mode}"]`).waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
  };
  try {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }]) {
      await page.setViewportSize(viewport);
      for (const fixture of fixtures) {
        const current = loadLexicalWordByOrdinal(fixture.ordinal).record;
        assert(current.word === fixture.word, 'batch_current_identity', `${fixture.ordinal}:${current.word}`);
        assert(current.source_fingerprint===fixture.expectedSourceFingerprint,'batch_frozen_source_fingerprint',String(fixture.ordinal));
        assert(batchFinalSha256(current)===fixture.expectedFinalSha256,'batch_frozen_final_digest',String(fixture.ordinal));
        for (const mode of ['study', 'lookup']) {
          const stateSnapshot = () => page.evaluate(word => ({ cursor:localStorage.getItem('kianos-vocabulary-last-ordinal'), word:localStorage.getItem(`kianos-vocabulary-astro-v2:word:${word}`) }), fixture.word);
          const beforeLookup = mode === 'lookup' ? await stateSnapshot() : null;
          await page.goto(wordUrl(fixture.ordinal, mode), { waitUntil: 'networkidle' });
          await ready(fixture.ordinal, mode);
          if (mode === 'study' && await page.locator('[data-vocab-front]').isVisible()) {
            await page.locator('[data-vocab-reveal]').click(); // Real enabled/visible action; never force.
          }
          await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
          const stem = `batch-${fixture.ordinal}-${fixture.word}-${mode}-${viewport.width}x${viewport.height}`;
          await page.screenshot({ path: path.join(outputRoot, `${stem}.png`), fullPage: true });
          const geometry = await page.evaluate(() => {
            const visible = node => node instanceof HTMLElement && !node.closest('[hidden]') && node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden';
            const box = node => { const r = node.getBoundingClientRect(); return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height }; };
            const overlaps = (a,b) => Math.min(a.right,b.right)-Math.max(a.left,b.left)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
            // Text fragments, not just grid boxes: catches long collocations escaping their column.
            const fragments = node => {
              const out=[]; const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
              while(walker.nextNode()) { const text=walker.currentNode; if(!text.textContent.trim() || !visible(text.parentElement)) continue;
                const range=document.createRange();range.selectNodeContents(text);out.push(...[...range.getClientRects()].map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom}))); }
              return out;
            };
            const collisions=[];
            const rows=[...document.querySelectorAll('.portedVocabSenseList > .lexicalSenseRow')].filter(visible);
            const rowInfo=rows.map((row,index)=>{
              const columns=[...row.children].filter(node=>visible(node)&&node.matches('header,.lexicalSenseMeaning,.lexicalSenseUsage'));
              for(let i=0;i<columns.length;i++) for(let j=i+1;j<columns.length;j++) {
                if(fragments(columns[i]).some(a=>fragments(columns[j]).some(b=>overlaps(a,b)))) collisions.push(`row:${index}:columns:${i}/${j}`);
              }
              const usages=[...row.querySelectorAll('.lexicalSenseUsage > li')].filter(visible);
              for(let i=1;i<usages.length;i++) if(overlaps(box(usages[i-1]),box(usages[i]))) collisions.push(`row:${index}:collocations:${i-1}/${i}`);
              for(const [i,li] of usages.entries()) {
                const phrase=li.querySelector('b'), gloss=li.querySelector('span');
                if(phrase&&gloss&&fragments(phrase).some(a=>fragments(gloss).some(b=>overlaps(a,b)))) collisions.push(`row:${index}:collocation:${i}:phrase/gloss`);
                const button=li.querySelector('[data-vocab-repair]');
                if(button&&visible(button)) for(const text of [...li.children].filter(n=>n!==button&&visible(n))) {
                  if(fragments(text).some(r=>overlaps(r,box(button)))) collisions.push(`row:${index}:collocation:${i}:repair`);
                }
              }
              return { index,id:row.getAttribute('data-vocab-sense-id'),box:box(row),collocations:usages.length };
            });
            for(let i=1;i<rowInfo.length;i++) {
              if(overlaps(rowInfo[i-1].box,rowInfo[i].box)) collisions.push(`rows:${i-1}/${i}`);
              if(fragments(rows[i-1]).some(a=>fragments(rows[i]).some(b=>overlaps(a,b)))) collisions.push(`row-text:${i-1}/${i}`);
            }
            return { rows:rowInfo,collisions,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
              referenceIds:[...document.querySelectorAll('[data-vocab-reference-sense-id]')].map(n=>({id:n.getAttribute('data-vocab-reference-sense-id'),visible:visible(n),repair:n.querySelectorAll('[data-vocab-repair]').length})),
              visibleLookupOnly:[...document.querySelectorAll('[data-vocab-lookup-only]')].filter(visible).length };
          });
          const actualText = await page.locator('[data-vocab-details]').innerText();
          const expectedIds = (current.reference?.senses || []).map(s => s.sense_id || s.stable_sense_id || s.id).sort();
          const expectedActive = (current.senses || []).filter(s => mode === 'lookup' || s.disposition !== 'EXPLORE_ONLY').length;
          const projection = await auditBatchProjection(page,current,mode);
          const scope = await auditBatchScope(page,current,mode);
          const referenceVisibility = await auditBatchReferenceVisibility(page,current,mode);
          const retirements = await auditBatchRetirements(page,fixture.retiredIdentities);
          const result = { ordinal:fixture.ordinal,word:fixture.word,coverage:fixture.coverage,mode,viewport,projection,scope,referenceVisibility,retirements,screenshot:`${stem}.png`,geometry,expectedActive,pinnedText:fixture.text || null,pinnedTextVisible:!fixture.text || actualText.includes(fixture.text) };
          report.cases.push(result); save();
          if(mode==='lookup') assert(JSON.stringify(await stateSnapshot())===JSON.stringify(beforeLookup),'batch_lookup_keeps_coverage_and_word_state',stem);
          assert(result.pinnedTextVisible, 'batch_pinned_text', stem);
          assert(projection.pass, 'batch_current_final_matches_actual_dom', stem);
          assert(scope.pass,'batch_visible_scope_relations_and_typed_lineage',stem);
          assert(referenceVisibility.pass,'batch_lookup_reference_fields_visible',stem);
          assert(retirements.pass,'batch_retired_identity_kind_and_representation',stem);
          assert(geometry.rows.filter(r=>r.id).length === expectedActive, 'batch_active_sense_projection', stem);
          assert(JSON.stringify(geometry.referenceIds.map(r=>r.id).sort()) === JSON.stringify(expectedIds), 'batch_reference_retained', stem);
          assert(geometry.referenceIds.every(r=>r.visible === (mode==='lookup') && r.repair===0), 'batch_reference_visibility_and_no_repair', stem);
          if(mode==='study') assert(geometry.visibleLookupOnly===0, 'batch_lookup_hidden_in_study', stem);
          assert(geometry.overflow<=2, 'batch_no_horizontal_overflow', `${stem}:${geometry.overflow}`);
          assert(geometry.collisions.length===0, 'batch_no_row_collocation_collision', `${stem}:${geometry.collisions.join(',')}`);
          // Every row retains full DOM/collision checks; scroll only bounded high-value targets.
          if (fixture.readableTargets[mode]?.length) {
            const targets = fixture.readableTargets[mode];
            const rows=await auditBoundedReadableRows(page,fixture.ordinal,stem,outputRoot,targets);
            report.readability ||= [];
            report.readability.push({ordinal:fixture.ordinal,mode,viewport,rows});save();
            assert(rows.length>0 && rows.every(r=>r.pass),'batch_target_text_reachable_above_dock',stem);
          }
        }
      }
    }
    for (const viewport of [{ width:1440,height:900 }, { width:1280,height:800 }]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => localStorage.removeItem('kianos-vocabulary-astro-v2:word:grin'));
      await page.goto(wordUrl(2206), { waitUntil:'networkidle' }); await ready(2206,'study');
      if(await page.locator('[data-vocab-front]').isVisible()) await page.locator('[data-vocab-reveal]').click();
      await page.locator('[data-vocab-details]').waitFor({state:'visible'});
      await page.locator('[data-vocab-route="known"]').click();
      await page.waitForURL('**/vocabulary/2207/'); await ready(2207,'study');
      assert((await page.locator('[data-vocab-front] h2').innerText()).trim()==='grin','batch_next_word_identity');
      await page.keyboard.press('Backspace'); await page.waitForURL('**/vocabulary/2206/'); await ready(2206,'study');
      assert(await page.locator('[data-local-port="vocabulary"]').getAttribute('data-vocab-word')==='grim','batch_undo_word_identity');
      report.navigation.push({from:2206,next:2207,undo:2206,viewport,status:'PASS'});save();
      await page.screenshot({path:path.join(outputRoot,`batch-navigation-undo-${viewport.width}x${viewport.height}.png`),fullPage:true});
    }
    report.coverage = { words:fixtures.length,expectedCases:fixtures.length*4,actualCases:report.cases.length,
      readabilityGroups:report.readability?.length||0,readabilityTargets:(report.readability||[]).reduce((n,g)=>n+g.rows.length,0),navigationJourneys:report.navigation.length };
    assert(report.cases.length===fixtures.length*4 && report.navigation.length===2 && report.coverage.readabilityTargets===70 && report.coverage.readabilityGroups===48,'batch_complete_matrix',JSON.stringify(report.coverage));
    assert(report.errors.length===0,'batch_no_page_errors',report.errors.join('\n'));
    report.status='PASS';save();
  } catch(error) {
    report.status='FAIL';report.failure=String(error);save();
    await page.screenshot({path:path.join(outputRoot,'batch-failure.png'),fullPage:true}).catch(()=>{});
    throw error;
  } finally { await context.close(); }
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await isolatePrivateCheckpoint(page.context());
  const reports = [];
  await auditThirdQualityBatch(browser);

  // Architecture-v2 Human Gate evidence.
  const initialVocabularyResponse = await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });
  const initialVocabularyHtml = await initialVocabularyResponse?.text() || '';
  assert(initialVocabularyHtml.includes('data-lexical-home-ready="false"'), 'v2_home_ssr_marks_state_pending');
  assert(initialVocabularyHtml.includes('读取学习进度…'), 'v2_home_ssr_does_not_fake_resume');
  assert(initialVocabularyHtml.includes('data-lexical-same-day-count>—</strong>'), 'v2_home_ssr_does_not_fake_same_day_zero');
  assert(!initialVocabularyHtml.includes('data-lexical-overview-continue-meta>#1 /'), 'v2_home_ssr_does_not_fake_ordinal_one');
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  assert(await page.locator('[data-lexical-home]').getAttribute('data-lexical-home-ready') === 'true', 'v2_home_state_becomes_ready');
  assert(await page.locator('[data-kianos-global-rail]').isVisible(), 'v2_home_keeps_global_rail');
  assert(await page.locator('[data-kianos-subject-bar="english"]').count() === 0, 'v2_vocabulary_suppresses_parent_english_l2');
  assert(await page.locator('.lexicalLocalNav').count() === 1, 'v2_vocabulary_has_one_local_top_nav');
  assert(await page.locator('.lexicalBackEnglish').isVisible(), 'v2_home_has_parent_english_return');
  assert((await page.locator('.lexicalBackEnglish').getAttribute('href') || '').endsWith('/english/'), 'v2_home_parent_return_targets_english');
  assert(await page.locator('[data-lexical-panel="overview"]').isVisible(), 'v2_home_defaults_to_overview');
  const localJobs = [
    ...(await page.locator('[data-lexical-tab]').allTextContents()).map((row) => row.trim()),
    (await page.locator('[data-lexical-learn-nav]').innerText()).trim()
  ];
  assert(localJobs.sort().join('|') === ['Overview','Learn','Repair','Research'].sort().join('|'), 'v2_home_four_local_jobs', localJobs.join('|'));
  assert(await page.locator('[data-lexical-daily-limit]').inputValue() === '50', 'v2_home_daily_new_limit_default_50');
  assert((await page.locator('[data-lexical-same-day-count]').innerText()).trim() === '0', 'v2_home_same_day_revisit_starts_empty');
  const sameDayCatalogRow = await page.evaluate(() => {
    const rows = JSON.parse(document.querySelector('[data-lexical-catalog]')?.textContent || '[]');
    return rows[0] || null;
  });
  assert(Boolean(sameDayCatalogRow), 'v2_home_catalog_has_same_day_fixture');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-home-1440x900.png'), fullPage: false });

  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  const homeVocabularyLink = page.locator('.homeL3TaskLinks a[href$="vocabulary/"]');
  assert(await homeVocabularyLink.isVisible(), 'home_learning_jump_has_vocabulary');
  assert((await homeVocabularyLink.innerText()).trim() === 'Vocabulary', 'home_learning_jump_vocabulary_label');

  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });

  // Same-day revisit is ephemeral card routing support, not Repair debt.
  await page.evaluate((row) => {
    const now = new Date().toISOString();
    localStorage.setItem('kianos-lexical-card-routing-v1', JSON.stringify({
      schema:'kianos.lexical.card_routing.v1',
      history:[{ event_id:'visual-same-day-1', word_id:row.objectId, ordinal:row.ordinal, word:row.word, route:'UNKNOWN', observed_at:now }],
      latest_by_word:{ [row.objectId]:{ event_id:'visual-same-day-1', word_id:row.objectId, ordinal:row.ordinal, word:row.word, route:'UNKNOWN', observed_at:now } }
    }));
  }, sameDayCatalogRow);
  await page.reload({ waitUntil: 'networkidle' });
  assert((await page.locator('[data-lexical-same-day-count]').innerText()).trim() === '1', 'v2_home_same_day_unknown_surfaces');
  const directLearnHref = await page.locator('[data-lexical-learn-nav]').getAttribute('href');
  const overviewContinueHref = await page.locator('[data-lexical-overview-continue]').getAttribute('href');
  assert(Boolean(directLearnHref) && directLearnHref === overviewContinueHref, 'v2_learn_nav_is_direct_coverage_action', String(directLearnHref));
  assert(await page.locator('[data-lexical-panel="learn"]').count() === 0, 'v2_learn_has_no_duplicate_home_panel');
  const sameDayHref = await page.locator('[data-lexical-same-day-start]').getAttribute('href');
  assert(Boolean(sameDayHref) && sameDayHref !== '#', 'v2_same_day_metric_jumps_directly_to_revisit', String(sameDayHref));

  await page.evaluate(() => {
    const routing = JSON.parse(localStorage.getItem('kianos-lexical-card-routing-v1') || '{}');
    const wordId = Object.keys(routing.latest_by_word || {})[0];
    const prior = routing.latest_by_word?.[wordId];
    const now = new Date().toISOString();
    const event = { ...prior, event_id:'visual-same-day-2', route:'KNOWN', observed_at:now };
    routing.history = [...(routing.history || []), event];
    routing.latest_by_word[wordId] = event;
    localStorage.setItem('kianos-lexical-card-routing-v1', JSON.stringify(routing));
  });
  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });
  assert((await page.locator('[data-lexical-same-day-count]').innerText()).trim() === '0', 'v2_home_same_day_known_clears');
  assert(await page.locator('[data-lexical-same-day-start]').getAttribute('aria-disabled') === 'true', 'v2_home_same_day_action_disables_when_empty');
  await page.evaluate(() => localStorage.clear());

  // Repair is a direct Chat-compiled Test session, not a list-management page.
  await page.goto(wordUrl(4), { waitUntil: 'networkidle' });
  if (!(await page.locator('[data-vocab-details]').isVisible())) await page.locator('[data-vocab-reveal]').click();
  const repairRoot = page.locator('[data-local-port="vocabulary"]');
  const repairPlus = page.locator('[data-vocab-repair]').first();
  const repairTargetId = (await repairPlus.getAttribute('data-target-id')) || null;
  const repairTarget = {
    word_id: await repairRoot.getAttribute('data-vocab-object'),
    ordinal: Number(await repairRoot.getAttribute('data-vocab-ordinal')),
    word: await repairRoot.getAttribute('data-vocab-word'),
    target_kind: await repairPlus.getAttribute('data-target-kind'),
    target_id: repairTargetId,
    target_locator: (await repairPlus.getAttribute('data-target-locator')) || null,
    target_revision: repairTargetId ? null : await repairRoot.getAttribute('data-vocab-source-hash')
  };
  await repairPlus.click();
  await page.evaluate((target) => {
    localStorage.setItem('kianos-lexical-challenge-packet-v1', JSON.stringify({
      schema:'kianos.lexical.challenge_packet.v1',
      study_day:'2099-09-18',
      generated_at:'2099-09-18T08:00:00Z',
      challenges:[{
        challenge_id:'visual-repair-session-1',
        ...target,
        source_evidence:'Depth 中手动 +',
        demand:'discrimination',
        question_type:'spatial_choice',
        stem:'哪个选项最符合当前要修的这个词义边界？',
        options:[
          { key:'up', text:'上方干扰项' },
          { key:'left', text:'左侧干扰项' },
          { key:'right', text:'右侧干扰项' },
          { key:'down', text:'正确选项' }
        ],
        correct_key:'down',
        repair:'只修当前局部边界，不重新学习整张词卡。',
        reconstruction:{
          stem:'换一个语境，再判断一次同一个局部边界。',
          options:[
            { key:'left', text:'干扰项' },
            { key:'right', text:'正确项' }
          ],
          correct_key:'right'
        }
      }]
    }));
  }, repairTarget);
  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });
  await page.locator('[data-lexical-tab="repair"]').click();
  await page.locator('[data-challenge-question-panel]').waitFor({ state: 'visible' });
  assert(await page.locator('[data-challenge-import-panel]').isHidden(), 'v2_repair_synced_test_skips_import_surface');
  assert((await page.locator('[data-challenge-word]').innerText()).trim() === repairTarget.word, 'v2_repair_current_word_matches_target');
  assert(await page.locator('[data-challenge-choice]:visible').count() === 4, 'v2_repair_spatial_four_choice_surface');
  const repairCurrentBox = await page.locator('.lexicalRepairCurrent').boundingBox();
  const repairQuestionBox = await page.locator('.lexicalRepairQuestion').boundingBox();
  assert(Boolean(repairCurrentBox && repairQuestionBox), 'v2_repair_mac_wide_geometry_exists');
  assert(repairQuestionBox.width > repairCurrentBox.width * 2.5, 'v2_repair_question_dominates_current_meta', `${repairQuestionBox?.width}/${repairCurrentBox?.width}`);
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-repair-active-1440x900.png'), fullPage: false });

  // Wrong answer expands only the minimum Repair, then Reconstruction keeps the same four-direction language.
  await page.locator('[data-challenge-choice="up"]').click();
  assert((await page.locator('[data-challenge-feedback]').innerText()).includes('只修当前局部边界'), 'v2_repair_wrong_shows_minimum_repair');
  assert((await page.locator('[data-challenge-continue]').innerText()).includes('Reconstruct'), 'v2_repair_wrong_offers_reconstruction');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-repair-wrong-1440x900.png'), fullPage: false });
  await page.locator('[data-challenge-continue]').click();
  assert((await page.locator('[data-challenge-progress]').innerText()).includes('Reconstruct'), 'v2_repair_enters_reconstruction');
  assert(await page.locator('[data-challenge-choice]:visible').count() === 2, 'v2_repair_reconstruction_uses_compact_spatial_choice');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-repair-reconstruction-1440x900.png'), fullPage: false });

  await page.evaluate(() => localStorage.clear());
  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });
  await page.locator('[data-lexical-tab="repair"]').click();
  assert(await page.locator('[data-challenge-import-panel]').isVisible(), 'v2_repair_empty_uses_waiting_surface');
  assert((await page.locator('[data-challenge-waiting-title]').innerText()).includes('没有需要处理的 Repair'), 'v2_repair_empty_state_is_calm');
  assert(await page.locator('[data-challenge-empty-learn]').isVisible(), 'v2_repair_empty_returns_to_learn');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-repair-empty-1440x900.png'), fullPage: false });
  await page.locator('[data-lexical-tab="overview"]').click();

  // Research modes must browse real Final Learner Object facets, not decorative categories.
  await page.locator('[data-lexical-open-research="familiar"]').click();
  assert(await page.locator('[data-lexical-panel="research"]').isVisible(), 'v2_research_quick_entry_opens_panel');
  assert(await page.locator('[data-lexical-search-box]').isHidden(), 'v2_research_browse_hides_search_box');
  assert(await page.locator('[data-lexical-search-results] .lexicalWordRow').count() > 0, 'v2_research_familiar_has_real_rows');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-research-familiar-1440x900.png'), fullPage: false });
  for (const mode of ['relations', 'constructions', 'family', 'form']) {
    await page.locator(`[data-lexical-research-mode="${mode}"]`).click();
    assert(await page.locator('[data-lexical-search-results] .lexicalWordRow').count() > 0, `v2_research_${mode}_has_real_rows`);
  }
  await page.locator('[data-lexical-research-mode="search"]').click();
  assert(await page.locator('[data-lexical-search-box]').isVisible(), 'v2_research_search_restores_input');
  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });

  // My / Settings is a real utility layer, not decorative chrome.
  await page.evaluate(() => {
    const rows = JSON.parse(document.querySelector('[data-lexical-catalog]')?.textContent || '[]');
    const row = rows[0];
    if (!row) throw new Error('NO_LEXICAL_CATALOG_ROW');
    const now = new Date().toISOString();
    localStorage.setItem('kianos-lexical-card-routing-v1', JSON.stringify({
      schema:'kianos.lexical.card_routing.v1',
      history:[{ event_id:'visual-mastered-1', word_id:row.objectId, ordinal:row.ordinal, word:row.word, route:'MASTERED', observed_at:now }],
      latest_by_word:{ [row.objectId]:{ event_id:'visual-mastered-1', word_id:row.objectId, ordinal:row.ordinal, word:row.word, route:'MASTERED', observed_at:now } }
    }));
  });
  await page.locator('[data-lexical-settings-open]').click();
  assert(await page.locator('[data-lexical-settings-dialog]').isVisible(), 'v2_settings_dialog_opens');
  assert((await page.locator('[data-lexical-mastered-count]').innerText()).trim() === '1', 'v2_settings_mastered_count_reads_latest_routing');
  assert(await page.locator('[data-lexical-mastered-list] .lexicalWordRow').count() === 1, 'v2_settings_mastered_list_renders_current_mastered');

  await page.locator('[data-lexical-pronunciation="en-GB"]').click();
  assert(await page.locator('[data-lexical-pronunciation="en-GB"]').getAttribute('aria-pressed') === 'true', 'v2_settings_default_pronunciation_changes');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-settings-1440x900.png'), fullPage: false });
  await page.locator('.lexicalSettingsClose').click();

  await page.locator('[data-lexical-daily-limit]').selectOption('30');
  const savedSettings = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-lexical-settings-v1') || '{}'));
  assert(savedSettings.daily_new_limit === 30, 'v2_settings_daily_limit_updates');
  assert(savedSettings.default_pronunciation === 'en-GB', 'v2_settings_daily_limit_preserves_pronunciation');

  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-lexical-settings-open]').click();
  await page.locator('[data-lexical-export-state]').click();
  const download = await downloadPromise;
  assert(download.suggestedFilename().startsWith('kianos-lexical-backup-'), 'v2_settings_backup_downloads_json', download.suggestedFilename());

  await page.evaluate(() => {
    localStorage.setItem('kianos-lexical-settings-v1', JSON.stringify({
      schema:'kianos.lexical.settings.v1',
      daily_new_limit:20,
      default_pronunciation:'en-US'
    }));
  });
  await page.locator('[data-lexical-import-file]').setInputFiles({
    name:'lexical-restore-test.json',
    mimeType:'application/json',
    buffer:Buffer.from(JSON.stringify({
      schema:'kianos.lexical.local_backup.v1',
      exported_at:new Date().toISOString(),
      data:{
        'kianos-lexical-settings-v1':JSON.stringify({
          schema:'kianos.lexical.settings.v1',
          daily_new_limit:30,
          default_pronunciation:'en-GB'
        })
      }
    }))
  });
  await page.waitForFunction(() => document.querySelector('[data-lexical-backup-status]')?.textContent?.includes('已恢复'));
  const restoredSettings = await page.evaluate(() => JSON.parse(localStorage.getItem('kianos-lexical-settings-v1') || '{}'));
  assert(restoredSettings.daily_new_limit === 30, 'v2_settings_backup_restores_daily_limit');
  assert(restoredSettings.default_pronunciation === 'en-GB', 'v2_settings_backup_restores_pronunciation');
  assert((await page.locator('[data-lexical-backup-status]').innerText()).includes('已恢复'), 'v2_settings_backup_reports_restore');
  await page.locator('.lexicalSettingsClose').click();

  await page.goto(wordUrl(1), { waitUntil: 'networkidle' });
  assert(await page.locator('[data-vocab-default-speak]').first().getAttribute('data-vocab-speak') === 'en-GB', 'v2_word_study_uses_default_pronunciation');
  assert((await page.locator('[data-vocab-default-speak]').first().innerText()).includes('英音'), 'v2_word_study_default_pronunciation_label');
  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());

  // English → Vocabulary → exact English return is one shared bridge, not a second dictionary.
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(`${origin}/vocabulary/`, { waitUntil: 'networkidle' });
  const lexicalWords = await page.evaluate(() => {
    const rows = JSON.parse(document.querySelector('[data-lexical-catalog]')?.textContent || '[]');
    return rows.map((row) => String(row.word || '').toLowerCase()).filter(Boolean);
  });
  await page.goto(`${origin}/reading/`, { waitUntil: 'networkidle' });
  const firstReadingHref = await page.locator('[data-reading-continue]').getAttribute('href');
  assert(Boolean(firstReadingHref), 'v2_english_handoff_has_reading_fixture');
  await page.goto(new URL(firstReadingHref, origin).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo({ top: Math.min(360, document.documentElement.scrollHeight - innerHeight), behavior: 'instant' }));
  const readingReturnHref = await page.evaluate(() => location.pathname + location.search + location.hash);
  const expectedReturnY = await page.evaluate(() => window.scrollY);
  const paragraphTexts = await page.locator('[data-reading-passage] p').allTextContents();
  let selectionFixture = null;
  const knownLexicalWords = new Set(lexicalWords);
  for (const minimumLength of [3, 2]) {
    for (let index = 0; index < paragraphTexts.length && !selectionFixture; index += 1) {
      const tokens = String(paragraphTexts[index] || '').match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g) || [];
      const word = tokens.find((token) => token.length >= minimumLength && knownLexicalWords.has(token.toLowerCase()));
      if (word) selectionFixture = { index, word };
    }
    if (selectionFixture) break;
  }
  assert(Boolean(selectionFixture), 'v2_english_handoff_has_current_lexical_token');
  const selected = await page.evaluate(({ index, word }) => {
    const root = document.querySelectorAll('[data-reading-passage] p')[index];
    if (!(root instanceof HTMLElement)) return false;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const target = word.toLowerCase();
    const isLetter = (char) => Boolean(char && /[A-Za-z]/.test(char));
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const value = node.nodeValue || '';
      const lower = value.toLowerCase();
      let cursor = lower.indexOf(target);
      while (cursor >= 0) {
        const before = cursor > 0 ? value[cursor - 1] : '';
        const afterIndex = cursor + word.length;
        const after = afterIndex < value.length ? value[afterIndex] : '';
        if (!isLetter(before) && !isLetter(after)) {
          const range = document.createRange();
          range.setStart(node, cursor);
          range.setEnd(node, cursor + word.length);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          (node.parentElement || root).dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 120, clientY: 160 }));
          return true;
        }
        cursor = lower.indexOf(target, cursor + 1);
      }
    }
    return false;
  }, selectionFixture);
  const selectedWord = selectionFixture.word;
  assert(selected, 'v2_english_handoff_selects_current_lexical_word', selectedWord);
  await page.locator('[data-english-selection-menu]').waitFor({ state: 'visible' });
  assert(await page.locator('[data-selection-lexical]').isVisible(), 'v2_english_selection_exposes_lexical_action');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-english-selection-1440x900.png'), fullPage: false });

  await page.locator('[data-selection-lexical]').click();
  await page.waitForURL(/\/vocabulary\/\d+\/?\?mode=lookup$/);
  await page.locator('[data-local-port="vocabulary"][data-vocab-mode="lookup"]').waitFor({ state: 'visible' });
  assert((await page.locator('.lexicalWordIdentity h2').innerText()).trim().toLowerCase() === selectedWord.toLowerCase(), 'v2_english_handoff_opens_exact_owner', selectedWord);
  assert(await page.locator('[data-english-lexical-return]').isVisible(), 'v2_english_handoff_keeps_return_context');
  assert((await page.locator('[data-english-return-meta]').innerText()).includes('不推进 Coverage'), 'v2_english_handoff_lookup_is_nonprogressing');
  const routingAfterLookup = await page.evaluate(() => localStorage.getItem('kianos-lexical-card-routing-v1'));
  assert(routingAfterLookup === null, 'v2_english_lookup_does_not_create_card_routing');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-english-handoff-lookup-1440x900.png'), fullPage: false });

  await page.locator('[data-english-return-action]').click();
  await page.waitForURL((url) => url.pathname + url.search + url.hash === readingReturnHref);
  await page.waitForTimeout(120);
  const returnedY = await page.evaluate(() => window.scrollY);
  assert(Math.abs(returnedY - expectedReturnY) < 120, 'v2_english_handoff_restores_window_position', `${expectedReturnY}->${returnedY}`);
  const returnContext = await page.evaluate(() => sessionStorage.getItem('kianos-english-lexical-return-v1'));
  assert(returnContext === null, 'v2_english_handoff_clears_return_context_after_restore');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-english-handoff-return-1440x900.png'), fullPage: false });

  // Daily new-word ceiling is a real capacity guard, not decorative Home state.
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('kianos-lexical-settings-v1', JSON.stringify({ schema:'kianos.lexical.settings.v1', daily_new_limit:1 }));
  });
  await page.goto(wordUrl(3), { waitUntil: 'networkidle' });
  await page.locator('[data-vocab-action-dock] [data-vocab-route="known"]').click();
  await page.waitForURL('**/vocabulary/?limit=reached');
  assert((await page.locator('[data-lexical-today-new]').first().innerText()).trim() === '1', 'v2_daily_limit_records_first_new_word');
  assert((await page.locator('[data-lexical-new-remaining]').innerText()).trim() === '0', 'v2_daily_limit_remaining_zero');
  assert(await page.locator('[data-lexical-overview-continue]').getAttribute('aria-disabled') === 'true', 'v2_daily_limit_blocks_next_new_word');
  assert(await page.locator('[data-lexical-learn-nav]').getAttribute('aria-disabled') === 'true', 'v2_daily_limit_blocks_direct_learn_nav');
  await page.evaluate(() => localStorage.clear());

  await page.addInitScript(() => {
    window.__kianosSpoken = [];
    class MockUtterance {
      constructor(text) { this.text = text; this.lang = ''; this.rate = 1; }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: MockUtterance, configurable: true });
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel() {},
        speak(utterance) {
          window.__kianosSpoken.push({ text: utterance.text, lang: utterance.lang, rate: utterance.rate });
        }
      },
      configurable: true
    });
  });
  await page.goto(wordUrl(3), { waitUntil: 'networkidle' });
  assert(await page.locator('[data-kianos-global-rail]').isHidden(), 'v2_word_study_hides_global_rail');
  assert(await page.locator('[data-study-timer-dock]').isVisible(), 'v2_word_study_keeps_shared_timer');
  assert(await page.locator('[data-vocab-front]').isVisible(), 'v2_safe_fast_pass_front_visible');
  const initialSpeech = await page.evaluate(() => window.__kianosSpoken || []);
  const frontWord = (await page.locator('[data-vocab-front] h2').innerText()).trim();
  assert(initialSpeech.length === 1, 'v2_word_front_autoplays_once', JSON.stringify(initialSpeech));
  assert(initialSpeech[0]?.text === frontWord, 'v2_word_front_autoplay_matches_word', JSON.stringify(initialSpeech));
  assert(await page.locator('[data-vocab-details]').isHidden(), 'v2_safe_fast_pass_depth_protected');
  assert(await page.locator('[data-vocab-action-dock] [data-vocab-route="known"]').isVisible(), 'v2_safe_fast_pass_known_visible');
  assert(await page.locator('[data-vocab-action-dock] [data-vocab-route="mastered"]').isVisible(), 'v2_safe_fast_pass_mastered_visible');
  assert(await page.locator('[data-vocab-action-dock] [data-vocab-route="unknown"]').isHidden(), 'v2_safe_fast_pass_unknown_hidden_before_reveal');
  assert(await page.locator('[data-vocab-action-dock] [data-vocab-route="fuzzy"]').isHidden(), 'v2_safe_fast_pass_fuzzy_hidden_before_reveal');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-safe-fast-pass-1440x900.png'), fullPage: false });

  await page.goto(wordUrl(5477), { waitUntil: 'networkidle' });
  assert(await page.locator('[data-vocab-front][data-recall-density="rich"]').isVisible(), 'v2_rich_recall_front_visible');
  assert((await page.locator('[data-vocab-front] h2').innerText()).trim() === 'write', 'v2_rich_fixture_is_write');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-rich-recall-1440x900.png'), fullPage: false });
  await page.keyboard.press('Space');
  await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
  const richCanvasScroll = await page.locator('.kianosShellMain > .productCanvas').evaluate((node) => ({
    overflowY: getComputedStyle(node).overflowY,
    scrollHeight: node.scrollHeight,
    clientHeight: node.clientHeight
  }));
  assert(['auto', 'scroll'].includes(richCanvasScroll.overflowY), 'v2_rich_word_uses_scrollable_canvas', JSON.stringify(richCanvasScroll));
  if (richCanvasScroll.scrollHeight > richCanvasScroll.clientHeight + 4) {
    await page.locator('.kianosShellMain > .productCanvas').evaluate((node) => { node.scrollTop = 120; });
    const scrollTop = await page.locator('.kianosShellMain > .productCanvas').evaluate((node) => node.scrollTop);
    assert(scrollTop > 0, 'v2_rich_word_can_scroll_down', String(scrollTop));
  }
  const speechAfterReveal = await page.evaluate(() => window.__kianosSpoken || []);
  assert(speechAfterReveal.length === 1, 'v2_reveal_does_not_replay_pronunciation', JSON.stringify(speechAfterReveal));
  assert(await page.locator('[data-vocab-action-dock] [data-vocab-route="unknown"]').isVisible(), 'v2_depth_dock_exposes_unknown');
  assert(await page.locator('[data-vocab-action-dock] [data-vocab-route="fuzzy"]').isVisible(), 'v2_depth_dock_exposes_fuzzy');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-rich-depth-1440x900.png'), fullPage: false });

  // Rule → Content → Visual Human-Gate fixtures.
  const depthFixtures = [
    {
      ordinal: 4248,
      word: 'sanction',
      expectPatterns: true,
      expectReference: false,
      expectText: [
        '同一个“官方权力”词可以走两个相反方向：批准，或处罚/制裁',
        '先看权力是在“放行”还是“惩罚”',
        '正式批准；授权',
        '官方制裁；处罚',
        'impose sanctions on/against sb/sth',
        'sanction sb for (doing) sth'
      ],
      expectAbsent: [
        'an institutional-authority word with two opposing branches',
        'ask what authority is doing'
      ]
    },
    {
      ordinal: 19,
      word: 'abstract',
      expectPatterns: true,
      expectReference: true,
      expectText: [
        '把具体细节拿开，只保留概念或关键信息；名词还表示论文/文章的摘要',
        'adj = 从具体实例抽离；noun = 把论文压成摘要；verb = 从材料中抽取/抽象出。',
        'AB-stract',
        '/ˈæb.strækt/',
        'ab-STRACT',
        '/əbˈstrækt/',
        'abstractly',
        'abstract (adjective) → abstractly (adverb): 表示以抽象、概念化方式，而不是针对具体实例',
        'in an abstract or conceptual way rather than through a concrete instance'
      ],
      expectAbsent: [
        'Adjective/noun and verb remain one Word identity; POS selects the stress pattern.',
        'As adjective/noun, stress is normally on the first syllable: AB-stract.',
        'As a verb, stress normally shifts to the second syllable: ab-STRACT.',
        'initial',
        'final'
      ]
    },
    {
      ordinal: 5477,
      word: 'write',
      expectPatterns: false,
      expectReference: true,
      expectText: [
        'write ↔ right',
        'write 是动词“写”；right 可表正确、权利或右侧'
      ]
    }
  ];
  for (const fixture of depthFixtures) {
    // Each Human-Gate fixture is independent evidence; do not inherit learner/browser state
    // from the preceding rich-word interaction.
    await page.evaluate(() => localStorage.clear());
    await page.goto(wordUrl(fixture.ordinal), { waitUntil: 'networkidle' });
    await page.locator('[data-vocab-front]').waitFor({ state: 'visible' });
    assert((await page.locator('[data-vocab-front] h2').innerText()).trim() === fixture.word, `v2_depth_fixture_${fixture.word}`);
    await page.keyboard.press('Space');
    await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
    assert(await page.locator('.lexicalCoreHeadline').isVisible(), `v2_word_feel_header_${fixture.word}`);
    assert(await page.locator('.lexicalCoreRow').count() === 0, `v2_no_duplicate_core_card_${fixture.word}`);
    const patternVisible = await page.locator('.lexicalWordPatterns').isVisible().catch(() => false);
    assert(patternVisible === fixture.expectPatterns, `v2_word_owned_patterns_${fixture.word}`, String(patternVisible));
    const constructionInReference = await page.locator('.portedVocabEvidenceColumn .lexicalConstructionSection').count();
    assert(constructionInReference === 0, `v2_no_construction_in_reference_${fixture.word}`, String(constructionInReference));
    const referenceVisible = await page.locator('.portedVocabEvidenceColumn').isVisible().catch(() => false);
    assert(referenceVisible === fixture.expectReference, `v2_reference_presence_${fixture.word}`, String(referenceVisible));
    const familyDebug = fixture.word === 'abstract'
      ? await page.locator('.lexicalFamilySection').evaluateAll((nodes) => nodes.map((node) => ({
          text: node.innerText,
          html: node.innerHTML
        })))
      : [];
    if (fixture.word === 'abstract') {
      console.log('LEXICAL_ABSTRACT_FAMILY_DEBUG', JSON.stringify(familyDebug));
    }
    await page.screenshot({ path: path.join(outputRoot, `lexical-v2-depth-${fixture.word}-1440x900.png`), fullPage: false });
    const renderedText = await page.locator('[data-vocab-details]').innerText();
    for (const expectedText of fixture.expectText || []) {
      assert(
        renderedText.includes(expectedText),
        `v2_direct_render_${fixture.word}_${expectedText}`,
        fixture.word === 'abstract' ? JSON.stringify(familyDebug) : ''
      );
    }
    for (const forbiddenText of fixture.expectAbsent || []) {
      assert(
        !renderedText.includes(forbiddenText),
        `v2_no_repeated_info_${fixture.word}_${forbiddenText}`,
        renderedText
      );
    }
    assert(await page.locator('.lexicalCoreBranches').count() === 0, `v2_no_core_cluster_cards_${fixture.word}`);
    const fixtureDock = await page.locator('[data-vocab-action-dock]').boundingBox();
    assert(Boolean(fixtureDock && fixtureDock.y + fixtureDock.height <= 900), `v2_depth_dock_in_view_${fixture.word}`, JSON.stringify(fixtureDock));
    if (fixture.word === 'abstract') {
      const studyForm = page.locator('.lexicalFormSection');
      assert(await studyForm.count() === 1 && await studyForm.isHidden(), 'v2_abstract_background_form_hidden_in_study');
      assert(await studyForm.locator('[data-vocab-repair], [data-vocab-target-row]').count() === 0,
        'v2_abstract_background_form_has_no_repair');
      const leftTop = await page.locator('.lexicalSenseRow').first().boundingBox();
      // Lookup-only source sections remain in the DOM but have no Study geometry.
      const visibleReference = page.locator('.portedVocabEvidenceColumn .lexicalExpansionSection:visible');
      assert(await visibleReference.count() > 0, 'v2_abstract_visible_reference_section_present');
      const rightTop = await visibleReference.first().boundingBox();
      assert(
        Boolean(leftTop && rightTop && Math.abs(leftTop.y - rightTop.y) <= 2),
        'v2_abstract_reference_top_aligns_with_first_sense',
        JSON.stringify({leftTop,rightTop})
      );
      await page.goto(wordUrl(fixture.ordinal, 'lookup'), { waitUntil: 'networkidle' });
      await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
      assert(await page.locator('.lexicalFormSection').isVisible(), 'v2_abstract_form_visible_in_lookup');
      const formRows = await page.locator('.lexicalFormVariants article').evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height };
        })
      );
      assert(formRows.every(row => row.width > 0 && row.height > 0), 'v2_abstract_lookup_form_rows_have_nonzero_geometry', JSON.stringify(formRows));
      assert(formRows.length >= 2, 'v2_abstract_form_rows_present', JSON.stringify(formRows));
      assert(formRows[1].top >= formRows[0].bottom - 1, 'v2_abstract_form_rows_do_not_overlap', JSON.stringify(formRows));
      assert(Math.abs(formRows[1].left - formRows[0].left) <= 1, 'v2_abstract_form_rows_align_left', JSON.stringify(formRows));

    }
  }

  // Final Learner Object pressure-test fixtures across distinct content shapes.
  // Semantic counts/text come from the Current Final Learner Object rather than
  // being duplicated here as a second content truth.
  const finalObjectFixtures = [
    { ordinal: 15, word: 'absence' },
    { ordinal: 16, word: 'absent' },
    { ordinal: 29, word: 'access' },
    { ordinal: 177, word: 'ambulance' },
    { ordinal: 761, word: 'charge' },
    { ordinal: 4209, word: 'row' },
    { ordinal: 4323, word: 'seem' },
    { ordinal: 4680, word: 'stationary' }
  ];

  for (const fixture of finalObjectFixtures) {
    const current = loadLexicalWordByOrdinal(fixture.ordinal).record;
    const primarySenseCount = Array.isArray(current.senses) ? current.senses.length : 0;
    const secondarySenseCount = Array.isArray(current.secondary_senses) ? current.secondary_senses.length : 0;
    const reference = current.reference && typeof current.reference === 'object' ? current.reference : {};
    const familyCount = Array.isArray(reference.family) ? reference.family.length : 0;
    const referenceExpected = Boolean(
      (reference.form && reference.form.disposition !== 'EXPLORE_ONLY')
      || familyCount
      || (Array.isArray(reference.confusables) && reference.confusables.length)
      || (Array.isArray(reference.relations) && reference.relations.length)
    );

    await page.evaluate((word) => localStorage.removeItem(`kianos-vocabulary-astro-v2:word:${word}`), fixture.word);
    await page.goto(wordUrl(fixture.ordinal), { waitUntil: 'networkidle' });
    await page.locator('[data-vocab-front]').waitFor({ state: 'visible' });
    assert((await page.locator('[data-vocab-front] h2').innerText()).trim() === fixture.word, `final_fixture_${fixture.word}`);
    await page.keyboard.press('Space');
    await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });

    assert(
      await page.locator('.portedVocabSenseList > .lexicalSenseRow:not(.lexicalSecondarySenseRow)').count() === primarySenseCount,
      `final_${fixture.word}_primary_sense_projection_current`,
      String(primarySenseCount)
    );
    assert(
      await page.locator('.lexicalSecondarySenseRow').count() === secondarySenseCount,
      `final_${fixture.word}_secondary_sense_projection_current`,
      String(secondarySenseCount)
    );

    // Lookup Reference shares row styling, but does not belong to the active Sense list.
    assert(await page.locator('[data-vocab-lookup-only]:visible').count() === 0,
      `final_${fixture.word}_reference_senses_hidden_in_study`);

    const familyVisible = await page.locator('.lexicalFamilySection').isVisible().catch(() => false);
    assert(
      familyVisible === (familyCount > 0),
      `final_${fixture.word}_family_projection_current`,
      String(familyCount)
    );

    const referenceVisible = await page.locator('.portedVocabEvidenceColumn').isVisible().catch(() => false);
    assert(
      referenceVisible === referenceExpected,
      `final_${fixture.word}_reference_projection_current`,
      JSON.stringify({ familyCount, hasForm: Boolean(reference.form) })
    );

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflow <= 2, `final_fixture_no_horizontal_overflow_${fixture.word}`, String(overflow));
    await page.screenshot({ path: path.join(outputRoot, `lexical-final-audit-${fixture.word}-1440x900.png`), fullPage: false });
    if (reference.form?.disposition === 'EXPLORE_ONLY') {
      const studyForm = page.locator('.lexicalFormSection');
      assert(await studyForm.count() === 1 && await studyForm.isHidden(), `final_${fixture.word}_background_form_hidden_in_study`);
      assert(await studyForm.locator('[data-vocab-repair], [data-vocab-target-row]').count() === 0, `final_${fixture.word}_background_form_has_no_repair`);
      await page.goto(wordUrl(fixture.ordinal, 'lookup'), { waitUntil: 'networkidle' });
      await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
      const lookupForm = page.locator('.lexicalFormSection');
      assert(await lookupForm.isVisible(), `final_${fixture.word}_background_form_visible_in_lookup`);
      assert(await lookupForm.locator('[data-vocab-repair], [data-vocab-target-row]').count() === 0, `final_${fixture.word}_lookup_form_has_no_repair`);
      const rows = lookupForm.locator('.lexicalFormVariants article');
      assert(await rows.count() === (reference.form.variants || []).length, `final_${fixture.word}_lookup_form_variants_complete`);
      const geometry = await rows.evaluateAll(nodes => nodes.map(node => { const r = node.getBoundingClientRect(); return {width:r.width,height:r.height}; }));
      assert(geometry.every(row => row.width > 0 && row.height > 0), `final_${fixture.word}_lookup_form_geometry`, JSON.stringify(geometry));
    }

  }

  // Tighter Mac landscape evidence: same learning geometry, reduced secondary density.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.evaluate(() => localStorage.removeItem('kianos-vocabulary-astro-v2:word:write'));
  await page.goto(wordUrl(5477), { waitUntil: 'networkidle' });
  assert(await page.locator('[data-vocab-front]').isVisible(), 'v2_mac_compact_recall_visible');
  const compactRecallOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(compactRecallOverflow <= 2, 'v2_mac_compact_recall_no_horizontal_overflow', String(compactRecallOverflow));
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-rich-recall-1280x800.png'), fullPage: false });
  await page.keyboard.press('Space');
  await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
  const compactDepthOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(compactDepthOverflow <= 2, 'v2_mac_compact_depth_no_horizontal_overflow', String(compactDepthOverflow));
  const dockBox = await page.locator('[data-vocab-action-dock]').boundingBox();
  assert(Boolean(dockBox && dockBox.y + dockBox.height <= 800), 'v2_mac_compact_dock_stays_in_view', JSON.stringify(dockBox));
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-rich-depth-1280x800.png'), fullPage: false });
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.evaluate(() => {
    localStorage.setItem('kianos-vocabulary-last-ordinal', '77');
    localStorage.removeItem('kianos-vocabulary-astro-v2:word:answer');
  });
  await page.goto(wordUrl(209, 'lookup'), { waitUntil: 'networkidle' });
  await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
  assert(await page.locator('[data-vocab-front]').isHidden(), 'v2_lookup_skips_recall');
  assert(await page.locator('[data-card-routing-controls]').count() === 0, 'v2_lookup_has_no_whole_card_routing');
  const lookupState = await page.evaluate(() => ({
    cursor: localStorage.getItem('kianos-vocabulary-last-ordinal'),
    wordState: localStorage.getItem('kianos-vocabulary-astro-v2:word:answer')
  }));
  assert(lookupState.cursor === '77', 'v2_lookup_does_not_advance_coverage', String(lookupState.cursor));
  assert(lookupState.wordState === null, 'v2_lookup_does_not_create_word_state');
  await page.screenshot({ path: path.join(outputRoot, 'lexical-v2-lookup-1440x900.png'), fullPage: false });

  // Legacy keyboard contract + v2 exact Repair contract.
  const routingKey = 'kianos-lexical-card-routing-v1';
  const routeCases = [
    ['ArrowLeft', 'UNKNOWN'],
    ['ArrowUp', 'FUZZY'],
    ['ArrowRight', 'KNOWN'],
    ['ArrowDown', 'MASTERED']
  ];
  for (const [key, expected] of routeCases) {
    await page.goto(wordUrl(5477), { waitUntil: 'networkidle' });
    await page.evaluate((routingKey) => localStorage.removeItem(routingKey), routingKey);
    await page.keyboard.press('Space');
    await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
    await page.keyboard.press(key);
    await page.waitForURL('**/vocabulary/5478/');
    const route = await page.evaluate((routingKey) => {
      const value = JSON.parse(localStorage.getItem(routingKey) || 'null');
      return value?.history?.at(-1)?.route || '';
    }, routingKey);
    assert(route === expected, `v2_keyboard_${expected.toLowerCase()}`, route);
  }

  await page.goto(wordUrl(5477), { waitUntil: 'networkidle' });
  await page.evaluate((routingKey) => localStorage.removeItem(routingKey), routingKey);
  await page.keyboard.press('Space');
  await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
  await page.keyboard.press('ArrowRight');
  await page.waitForURL('**/vocabulary/5478/');
  await page.keyboard.press('Backspace');
  await page.waitForURL('**/vocabulary/5477/');
  const undoHistoryLength = await page.evaluate((routingKey) => {
    const value = JSON.parse(localStorage.getItem(routingKey) || 'null');
    return value?.history?.length || 0;
  }, routingKey);
  assert(undoHistoryLength === 0, 'v2_backspace_undo', String(undoHistoryLength));

  await page.goto(wordUrl(5477), { waitUntil: 'networkidle' });
  await page.keyboard.press('Space');
  await page.locator('[data-vocab-details]').waitFor({ state: 'visible' });
  await page.keyboard.press('j');
  const selectedBeforeRepair = await page.locator('[data-vocab-target-row].keyboard-target [data-vocab-repair]').count();
  assert(selectedBeforeRepair === 1, 'v2_j_selects_exact_object', String(selectedBeforeRepair));
  await page.keyboard.press('+');
  const selectedRepairPressed = await page.locator('[data-vocab-target-row].keyboard-target [data-vocab-repair]').getAttribute('aria-pressed');
  assert(selectedRepairPressed === 'true', 'v2_plus_toggles_exact_repair', String(selectedRepairPressed));
  await page.keyboard.press('k');
  assert(await page.locator('[data-vocab-target-row].keyboard-target [data-vocab-repair]').count() === 1, 'v2_k_moves_exact_object');

  reports.push(await audit(page, { ordinal: 1, expectedWord: 'a', sparse: false }));
  reports.push(await audit(page, { ordinal: 2, expectedWord: 'abandon', sparse: true }));
  reports.push(await audit(page, { ordinal: 13, expectedWord: 'abroad', sparse: true }));

  fs.writeFileSync(path.join(outputRoot, 'report.json'), `${JSON.stringify({ status:'PASS', reports }, null, 2)}\n`);
  console.log(`Lexical visual convergence PASS → ${outputRoot}`);
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
