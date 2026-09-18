from pathlib import Path
import json, subprocess
# Fresh rendered readback found two overly broad asset selectors. Preserve all
# canonical KP Core; change only the derived orientation view at its asset owner.
a1=Path('content/xizong/projection/a1-circulation/blocks/b01.projection.json')
x=json.loads(a1.read_text());obj=next(o for o in x['objects'] if o['object_id']=='circulation-b01-framework')
assert obj['binding']['selector']=={'type':'HEADING_EXACT','value':'总 Framework'}
obj['binding']['selector']={'type':'STRUCTURE_AFTER_ANCHOR','anchor':'# 总 Framework','structure_type':'CODE_BLOCK','occurrence':1}
a1.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
a2=Path('content/xizong/projection/a2-respiratory/blocks/r01.projection.json')
x=json.loads(a2.read_text());oid='respiratory-r01-measurement-language'
assert any(o['object_id']==oid for o in x['objects'])
x['objects']=[o for o in x['objects'] if o['object_id']!=oid]
for view in x['views'].values():
 if 'object_ids' in view:view['object_ids']=[i for i in view['object_ids'] if i!=oid]
a2.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
subprocess.run(['git','add',str(a1),str(a2)],check=True)
p=Path('static-web/scripts/test-xizong-final-independent.mjs');s=p.read_text()
anchor="await test('Memory availability is not scheduled debt; Repair never rewrites Recall'"
assert anchor in s
probe="""await test('Framework orientation never duplicates full canonical KP teaching sections',()=>{
 let checked=0;for(const system of listProjectableXizongSystems())for(const ref of system.blocks){const b=buildXizongProductionBlock(loadXizongBlock(system.systemId,ref.slug));
 for(const object of b.cognitiveProjection.stageObjects)assert.ok(!/<h[1-6][^>]*>\\s*KP\\d+[｜|]/i.test(object.html||''),`${b.blockId}:${object.objectId} duplicates KP teaching`);checked++;}
 const b1=buildXizongProductionBlock(loadXizongBlock('circulation','b01'));
 assert.ok(b1.cognitiveProjection.stageObjects.some(x=>x.objectId==='circulation-b01-framework'&&x.html.includes('泵周期')));
 const r1=buildXizongProductionBlock(loadXizongBlock('respiratory','r01'));
 assert.ok(r1.cognitiveProjection.stageObjects.some(x=>x.objectId==='respiratory-r01-framework'));
 return {checked,canonicalCore:'unchanged',baselineCounterexample:'B1 heading swallowed 29 KP sections; R1 Unit A duplicated four KP bodies'};
});
"""
s=s.replace(anchor,probe+anchor)
# New current-head browser samples must select the Framework tab explicitly;
# visiting a System defaults to Guide and cannot prove Framework presentation.
anchor=" await test('Current Mac-wide heterogeneous visible geometry"
assert anchor in s
probe="""
 await test('System Framework is sampled separately from Guide on all mature Systems',async()=>{const {c,page}=await context();try{
 for(const system of ['circulation','respiratory','urinary']){await visit(page,`/xizong/${system}/`);const button=page.getByRole('button',{name:/^framework$/i});assert.equal(await button.count(),1);await button.click();await page.waitForTimeout(150);await page.screenshot({path:path.join(out,`${system}-framework.png`)});assert.ok(await page.locator('body').innerText());}
 }finally{await c.close();}});
"""
s=s.replace(anchor,probe+anchor);p.write_text(s)
