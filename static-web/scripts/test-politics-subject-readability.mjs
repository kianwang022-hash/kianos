import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { listPoliticsChapterPathsCurrent } from '../src/lib/politicsCurrent.mjs';
import { loadPoliticsFrameProjection } from '../src/lib/politicsFrameProjection.mjs';

const omitted = new Set(['id','natural_unit_id','source_refs','source_evidence','learning_priority']);
const normalize = text => String(text ?? '').normalize('NFKC').replace(/\s+/g, '');
function expectedText(value) {
  if (value == null || typeof value === 'boolean') return [];
  if (typeof value !== 'object') return [String(value)];
  if (Array.isArray(value)) return value.flatMap(expectedText);
  const heading = value.title || value.name || value.label;
  if (Array.isArray(value.nodes) && Array.isArray(value.edges)) return [heading,...value.nodes.flatMap(node=>[node.label,node.meaning,node.detail]),...value.edges.map(edge=>edge.relation)].filter(Boolean);
  if (value.steps) return [heading,...value.steps.flatMap(step=>expectedText(step.text??step))].filter(Boolean);
  return [heading,...Object.entries(value).filter(([key])=>!omitted.has(key)&&!['title','name','label'].includes(key)).flatMap(([,item])=>expectedText(item))].filter(Boolean);
}
function mapsIn(value) {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap(mapsIn);
  if (Array.isArray(value.nodes) && Array.isArray(value.edges)) return [value];
  return Object.entries(value).filter(([key])=>!omitted.has(key)).flatMap(([,item])=>mapsIn(item));
}
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export async function testPoliticsSubjectReadability({browser,base,out,report}) {
  const directory=path.join(out,'subject-readability');fs.mkdirSync(directory,{recursive:true});
  const result={scope:'Politics whole subject / all Current chapter and PASS NU projections',learnerU:'NOT_TESTED',browser:'CI Chromium, not native Mac',chapters:[],units:0,maps:0,edges:0,stringAssertions:0,fontObservations:[],responsive:[],errors:[]};
  const files=['src/styles/politics-readable.css','src/styles/politics-frame-grammar.css','src/components/PoliticsFrameWorkspace.astro','src/components/PoliticsFrameValue.astro','src/components/PoliticsFrameMap.astro','scripts/test-politics-subject-readability.mjs'];
  result.source_sha256=Object.fromEntries(files.map(file=>[file,sha(file)]));
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();page.on('pageerror',error=>result.errors.push(error.message));
  const noOverflow=async label=>{const observation=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(observation.scroll<=observation.width+1,`${label}: horizontal page overflow ${JSON.stringify(observation)}`);};
  const settle=async()=>{await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));};
  const cdp=await context.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
  const sampled=new Set(),representatives=[];
  try {
    const rows=listPoliticsChapterPathsCurrent();
    for(const row of rows){
      const frame=loadPoliticsFrameProjection(row.subject,row.chapter),href=`${base}/politics/${row.subject}/${row.chapter}/`;
      result.current=href;const response=await page.goto(href);assert.equal(response.status(),200,href);
      await page.locator('[data-politics-frame]').waitFor();await settle();
      assert.equal(await page.locator('[data-frame-unit]').count(),frame.units.length,`${href}: eligible NU count`);
      if(frame.units.length)assert.equal(await page.locator('[data-frame-unit-link][aria-current="true"]').count(),1,'Initial location is visible without a fake learner record');
      const chapter={subject:row.subject,chapter:row.chapter,units:frame.units.length,referenceOnly:frame.referenceOnly.length,source:frame.source,checked:[]};result.chapters.push(chapter);
      for(const unit of frame.units){
        result.current=`${href} / ${unit.unit_id}`;
        await page.locator(`[data-frame-unit-link="${unit.unit_id}"]`).click();
        const active=page.locator(`[data-frame-unit="${unit.unit_id}"]`);await active.waitFor({state:'visible'});await settle();
        assert.equal(await page.locator('[data-frame-unit]:visible').count(),1);
        const primary=active.locator('.framePrimary'),actual=normalize(await primary.innerText());
        const values=[...unit.primary_geometry.map(g=>g.content),...unit.secondary_reasoning.map(g=>g.content),unit.boundaries,unit.first_round_exact];
        const strings=values.flatMap(expectedText).map(normalize).filter(Boolean);
        for(const text of strings)assert.ok(actual.includes(text),`${result.current}: missing Current text ${text.slice(0,140)}`);
        result.stringAssertions+=strings.length;
        const maps=values.flatMap(mapsIn),actualMaps=primary.locator('[data-frame-map]');
        assert.equal(await actualMaps.count(),maps.length,`${result.current}: map count`);
        for(let index=0;index<maps.length;index++){
          const map=maps[index],rendered=actualMaps.nth(index);assert.equal(await rendered.locator('[data-graph-node]').count(),map.nodes.length);
          const actualEdges=await rendered.locator('[data-graph-edge]').evaluateAll(edges=>edges.map(edge=>({from:edge.dataset.from,to:edge.dataset.to,relation:edge.querySelector('[data-graph-relation]').textContent})));
          const sortEdges=edges=>edges.map(edge=>JSON.stringify(edge)).sort();
          assert.deepEqual(sortEdges(actualEdges),sortEdges(map.edges.map(edge=>({from:edge.from,to:edge.to,relation:edge.relation}))));
          if(await rendered.locator('[data-acyclic="true"]').count()){await rendered.locator('[data-graph-ready="true"]').waitFor({state:'attached'});assert.equal(await rendered.locator('[data-edge-path]').count(),map.edges.length);}
          result.maps++;result.edges+=map.edges.length;
        }
        const style=await primary.evaluate(element=>{const body=getComputedStyle(element),heading=getComputedStyle(element.closest('[data-frame-unit]').querySelector('.frameProblem'));return {family:body.fontFamily,size:parseFloat(body.fontSize),headingSize:parseFloat(heading.fontSize),headingWeight:Number(heading.fontWeight),synthesis:heading.fontSynthesis};});
        assert.ok(style.family.includes('PingFang SC')&&style.family.includes('WenQuanYi Zen Hei'));
        assert.ok(style.size>=19&&style.headingSize>=25&&style.headingWeight>=650,JSON.stringify(style));
        await noOverflow(result.current);chapter.checked.push(unit.unit_id);result.units++;
      }
      if(frame.units.length){
        await page.locator(`[data-frame-unit-link="${frame.units[0].unit_id}"]`).click();await settle();await page.evaluate(()=>scrollTo(0,0));
        await page.screenshot({path:path.join(directory,`${row.subject}-${row.chapter}-1440.png`)});
        if(!sampled.has(row.subject)){
          sampled.add(row.subject);representatives.push({row,frame,href});
          // CDP reports fonts of actual text-bearing elements, not an empty layout container.
          const doc=await cdp.send('DOM.getDocument');
          for(const selector of ['[data-frame-unit]:not([hidden]) .framePrimary p','[data-frame-unit]:not([hidden]) .frameProblem']){
            const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector});assert.ok(nodeId,selector);
            const observation=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});
            const style=await page.locator(selector).first().evaluate(element=>{const s=getComputedStyle(element);return {family:s.fontFamily,size:s.fontSize,weight:s.fontWeight,synthesis:s.fontSynthesis};});
            result.fontObservations.push({subject:row.subject,selector,style,...observation});
            assert.ok(observation.fonts.length>0,'No rendered platform font evidence');
            assert.ok(!observation.fonts.some(font=>/serif|mincho|songti|times|georgia/i.test(font.familyName)),JSON.stringify(observation));
          }
        }
      }
      console.log(`PASS Politics ${row.subject}/${row.chapter}: ${frame.units.length} Current units; complete selected text + exact edges`);
    }
    for(const {row,frame,href} of representatives){
      for(const width of [1728,1024,390]){
        await page.setViewportSize({width,height:width===1728?1117:900});await page.goto(href);await page.locator('[data-politics-frame]').waitFor();await settle();
        for(const unit of frame.units){await page.locator(`[data-frame-unit-link="${unit.unit_id}"]`).click();await settle();await noOverflow(`${row.subject} ${width}px ${unit.unit_id}`);}
        await page.locator(`[data-frame-unit-link="${frame.units[0].unit_id}"]`).click();await settle();await page.evaluate(()=>scrollTo(0,0));
        await page.screenshot({path:path.join(directory,`${row.subject}-${width}.png`)});result.responsive.push({subject:row.subject,width,units:frame.units.length});
      }
    }
    await page.setViewportSize({width:1728,height:1117});await page.goto(`${base}/politics/marxism/ch00/`);await page.locator('[data-politics-frame]').waitFor();
    const links=page.locator('[data-frame-unit-link]');
    if(await links.count()>1){
      await links.nth(1).click();await settle();const panels=page.locator('[data-frame-unit]:visible .role-framework_maps > .frameValues.parallel > .frameValue');assert.equal(await panels.count(),2);
      const rectangles=await panels.evaluateAll(items=>items.map(item=>{const b=item.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width};}));
      assert.ok(Math.abs(rectangles[0].y-rectangles[1].y)<3&&rectangles.every(item=>item.width>=360),JSON.stringify(rectangles));
      await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(directory,'marxism-c00-s02-two-maps.png'),fullPage:true});
    }
    await page.goto(`${base}/politics/`);await page.locator('[data-politics-home-ready="true"]').waitFor({state:'attached'});await settle();
    const homeType=await page.locator('.politicsSubjectLane>p').evaluateAll(items=>items.map(item=>({size:parseFloat(getComputedStyle(item).fontSize),text:item.textContent})));
    assert.ok(homeType.length===5&&homeType.every(item=>item.size>=18),JSON.stringify(homeType));result.homeType=homeType;
    assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage).filter(key=>key.startsWith('kianos-politics-'))),[],'Visual navigation must not manufacture learning records');
    assert.deepEqual(result.errors,[]);result.status='PASS';delete result.current;
    report.checks.push(`Politics whole-subject readability: ${result.chapters.length} chapters / ${result.units} PASS units / ${result.maps} maps / ${result.edges} exact edges / ${result.stringAssertions} selected-content assertions`);
  }catch(error){result.status='FAIL';result.failure=error.stack;await page.screenshot({path:path.join(directory,'failure.png')}).catch(()=>{});throw error;}
  finally{fs.writeFileSync(path.join(directory,'report.json'),JSON.stringify(result,null,2)+'\n');await context.close();}
}
