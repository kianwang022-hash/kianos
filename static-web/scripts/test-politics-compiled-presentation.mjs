import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadPoliticsCompiledPresentation, resolvePoliticsPresentationRef } from '../src/lib/politicsCompiledPresentation.mjs';
const manifest=JSON.parse(fs.readFileSync('../content/politics/projection/manifest.json','utf8'));
let chapters=0, units=0, referenceOnly=0;
for(const [subject, row] of Object.entries(manifest.subjects)) for(const file of row.files) {
 const projection=JSON.parse(fs.readFileSync('../content/politics/projection/'+file,'utf8'));
 const map=loadPoliticsCompiledPresentation(subject,file.split('/')[1].split('.')[0]);chapters++;
 for(const unit of projection.units) {
  if(unit.projection_disposition==='PASS') { assert(map.has(unit.unit_id)); assert.equal(map.get(unit.unit_id).unitId,unit.unit_id);units++; }
  else { assert(!map.has(unit.unit_id),'Non-teaching owner promoted');referenceOnly++; }
 }
}
const data={pool:[{name:'selected',natural_unit_id:'one',items:['kept']},{name:'other',natural_unit_id:'two',items:['not admitted']}]};
const ref={scope:'chapter',field:'pool',match:{name:'selected',natural_unit_id:'one'}};
assert.deepEqual(resolvePoliticsPresentationRef(ref,data,{}),[data.pool[0]]);
assert.throws(()=>resolvePoliticsPresentationRef({...ref,match:{name:'absent'}},data,{}));
assert.throws(()=>resolvePoliticsPresentationRef(ref,{pool:[data.pool[0],data.pool[0]]},{}));
assert.equal(resolvePoliticsPresentationRef(null,data,{}),null);
assert.equal(resolvePoliticsPresentationRef({scope:'unit',field:'missing'},data,{}),null);
assert.throws(()=>resolvePoliticsPresentationRef({scope:'other',field:'pool'},data,{}));
assert.throws(()=>resolvePoliticsPresentationRef({scope:'unit',field:'__proto__.x'},data,{}));
const idRef={scope:'unit',field:'pool',ids:['kept']};
assert.deepEqual(resolvePoliticsPresentationRef(idRef,{}, {pool:[{id:'kept'},{id:'not-selected'}]}),[{id:'kept'}]);
assert.throws(()=>resolvePoliticsPresentationRef(idRef,{}, {pool:[{id:'kept'},{id:'kept'}]}));
console.log(JSON.stringify({status:'PASS',chapters,units,referenceOnly,selectorNegativeControls:7,meaning:'Exact selected Current refs only; no learner or U claim'},null,2));
