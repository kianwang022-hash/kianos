import assert from 'node:assert/strict';
import * as f from '../src/lib/englishForecastModel.mjs';
const copy=v=>JSON.parse(JSON.stringify(v));
const checks=[];const test=(name,fn)=>{fn();checks.push(name);};
const maintenance=()=>({schema:f.ENGLISH_FORECAST_INPUT_SCHEMA,task_families:Object.fromEntries(f.ENGLISH_FORECAST_FAMILIES.map(id=>[id,{scope_complete:true,operating_mode:'MAINTAIN',open_mechanisms:[],work_buckets:[]}]))});
const workload=(units=2)=>{const input=maintenance();input.task_families.reading_a={scope_complete:true,operating_mode:'BUILD',open_mechanisms:['inference'],work_buckets:[{id:'repair',remaining_units:units,minutes_per_unit_samples:[20,30,40]}]};return input;};
test('zero required placeholder cannot price open BUILD demand',()=>{
 const model=f.buildEnglishWorkloadForecast(workload(0));assert.equal(model.workload.full_band_minutes,null);
 assert.ok(model.workload.unpriced_bucket_ids.includes('reading_a:OPEN_DEMAND_WITHOUT_REQUIRED_WORK'));
});
test('optional workload cannot discharge required open demand',()=>{
 const input=workload(5);input.task_families.reading_a.work_buckets[0].required=false;
 assert.equal(f.buildEnglishWorkloadForecast(input).workload.full_band_minutes,null);
});
test('explicit maintenance with no demand may genuinely require zero work',()=>assert.deepEqual(f.buildEnglishWorkloadForecast(maintenance()).workload.full_band_minutes,{p20:0,p50:0,p80:0}));
test('positive measured work remains usable without a confidence certificate',()=>{
 const model=f.buildEnglishWorkloadForecast(workload());assert.deepEqual(model.workload.full_band_minutes,{p20:48,p50:60,p80:72});
 assert.equal(model.workload.families[0].buckets[0].sample_count,3);
 for(const key of ['full_scope_priced','workload_confidence'])assert.equal(Object.hasOwn(model.workload,key),false);
 for(const key of ['forecast_state','score_path_confidence'])assert.equal(Object.hasOwn(model,key),false);
});
for(const invalid of [null,'',false,[],{},'0'])test('invalid units do not become zero: '+String(invalid),()=>{
 const model=f.buildEnglishWorkloadForecast(workload(invalid));assert.equal(model.workload.full_band_minutes,null);
});
test('invalid timing remains explicit, not silently dropped',()=>{
 const input=workload();input.task_families.reading_a.work_buckets[0].minutes_per_unit_samples=[10,false,20];
 const model=f.buildEnglishWorkloadForecast(input);assert.equal(model.workload.full_band_minutes,null);
 assert.equal(model.workload.families[0].buckets[0].invalid_sample_count,1);
});
test('scope missing or corrupt stays unpriced',()=>{
 const input=maintenance();delete input.task_families.lexical;assert.equal(f.buildEnglishWorkloadForecast(input).workload.full_band_minutes,null);
 input.task_families.lexical={scope_complete:true,operating_mode:'MAINTAIN',work_buckets:false};assert.equal(f.buildEnglishWorkloadForecast(input).workload.full_band_minutes,null);
});
test('increasing workload cannot reduce any bound',()=>{
 const a=f.buildEnglishWorkloadForecast(workload(2)).workload.full_band_minutes,b=f.buildEnglishWorkloadForecast(workload(6)).workload.full_band_minutes;
 for(const k of ['p20','p50','p80'])assert.ok(b[k]>=a[k]);
});
test('capacity shock and three bad days do not delete workload',()=>{
 const model=f.buildEnglishWorkloadForecast(workload(10));const options={startDay:'2026-09-21',deadlineDay:'2026-09-23',dailyMinutes:150};
 const normal=f.assessEnglishDeadlineFeasibility(model,options);assert.equal(normal.fit.p80,true);
 const shock=f.assessEnglishDeadlineFeasibility(model,{...options,dailyMinutes:45});assert.equal(shock.fit.p20,false);
 const bad=f.assessEnglishDeadlineFeasibility(model,{...options,capacityMinutesByDay:{'2026-09-21':0,'2026-09-22':0,'2026-09-23':0}});assert.equal(bad.capacity.minutes,0);assert.equal(bad.fit.p20,false);
 assert.deepEqual(model.workload.full_band_minutes,{p20:240,p50:300,p80:360});
});
test('explicit unknown capacity is not replaced by fallback',()=>{
 const result=f.assessEnglishDeadlineFeasibility(f.buildEnglishWorkloadForecast(workload()),{startDay:'2026-09-21',deadlineDay:'2026-09-21',dailyMinutes:120,capacityMinutesByDay:{'2026-09-21':null}});
 assert.equal(result.capacity,null);assert.equal(result.fit,null);
});
test('malformed explicit capacity maps cannot silently use the daily fallback',()=>{
 const model=f.buildEnglishWorkloadForecast(workload());
 for(const capacityMinutesByDay of [[],[{'2026-09-21':null}],'unknown',false,0,120]){
  const result=f.assessEnglishDeadlineFeasibility(model,{startDay:'2026-09-21',deadlineDay:'2026-09-21',dailyMinutes:120,capacityMinutesByDay});
  assert.equal(result.capacity,null);assert.equal(result.fit,null);assert.equal(result.required_average_minutes_per_day,null);
 }
});
test('incomplete scope cannot make a full deadline-fit claim',()=>{
 const input=workload();input.task_families.lexical.scope_complete=false;
 const result=f.assessEnglishDeadlineFeasibility(f.buildEnglishWorkloadForecast(input),{startDay:'2026-09-21',deadlineDay:'2026-09-30',dailyMinutes:120});
 assert.equal(result.fit,null);assert.equal(result.full_scope,false);assert.equal(result.known_lower_bound_fit.p80,true);
});
test('invalid calendar date remains unknown',()=>{
 const result=f.assessEnglishDeadlineFeasibility(f.buildEnglishWorkloadForecast(workload()),{startDay:'2026-02-31',deadlineDay:'2026-03-10',dailyMinutes:120});assert.equal(result.capacity,null);
});
test('sensitivity returns calculations, never selected evidence or priority',()=>{
 const result=f.buildEnglishForecastFalsifiability(workload(),{startDay:'2026-09-21',deadlineDay:'2026-09-23'});
 assert.equal(result.workload_grid.length,9);assert.equal(Object.hasOwn(result,'next_high_value_evidence'),false);
 assert.equal(Object.hasOwn(result,'evidence_candidates'),false);assert.equal(JSON.stringify(result).includes('information_priority'),false);
});
const row={id:'one-real-observation',actual_workload_minutes:30,predicted_workload_band:{p20:20,p50:30,p80:40},actual_score:85,predicted_score_range:{low:80,high:90}};
test('one observation copied three times is one observation, not BACKTESTED',()=>{
 const result=f.backtestEnglishForecastHistory([row,copy(row),copy(row)]);assert.equal(result.workload.sample_count,1);assert.equal(result.score.sample_count,1);assert.equal(result.duplicate_row_count,2);
 assert.equal(Object.hasOwn(result.workload,'status'),false);assert.equal(Object.hasOwn(result.score,'status'),false);
});
test('aliases of the same canonical observation cannot inflate counts',()=>{
 const result=f.backtestEnglishForecastHistory([{...row,id:'alias1',observation_id:'actual-1'},{...row,id:'alias2',observation_id:'actual-1'}]);assert.equal(result.workload.sample_count,1);
});
test('same-ID contradictory outcomes are excluded, not first-wins',()=>{
 const result=f.backtestEnglishForecastHistory([row,{...row,actual_score:40}]);assert.equal(result.workload.sample_count,0);assert.equal(result.score.sample_count,0);assert.deepEqual(result.conflicting_observation_ids,[row.id]);
});
test('absent observation identity is not certified by row count',()=>{
 const unknown={...row};delete unknown.id;const result=f.backtestEnglishForecastHistory([unknown,unknown,unknown]);assert.equal(result.score.sample_count,0);assert.equal(result.missing_identity_row_count,3);
});
test('invalid history is visible and never converted to zero',()=>{
 const result=f.backtestEnglishForecastHistory([{...row,actual_score:null,actual_workload_minutes:false}]);assert.equal(result.score.sample_count,0);assert.equal(result.workload.sample_count,0);assert.deepEqual(result.score.unusable_observation_ids,[row.id]);assert.deepEqual(result.workload.unusable_observation_ids,[row.id]);
});
test('distinct observations with equal outcomes are retained as distinct facts',()=>{
 const result=f.backtestEnglishForecastHistory([row,{...row,id:'actual2'},{...row,id:'actual3'}]);assert.equal(result.score.sample_count,3);assert.equal(Object.hasOwn(result.score,'status'),false);
});
test('typed/contaminated evidence remains useful but not formal calibration',()=>{
 const input=maintenance();input.whole_paper={score_range:{low:85,high:90},score_eligible:true,evidence_quality:'CLEAN',modality:'TYPED',productive_scoring_standard_version:f.ENGLISH_PRODUCTIVE_SCORING_STANDARD_VERSION};
 let model=f.buildEnglishWorkloadForecast(input);assert.deepEqual(model.score.integrated_whole_paper.range,{low:85,high:90});assert.equal(model.score.integrated_whole_paper.score_eligible,false);
 input.whole_paper.modality='PAPER';input.whole_paper.evidence_quality='EXPOSED';assert.equal(f.buildEnglishWorkloadForecast(input).score.integrated_whole_paper.score_eligible,false);
 input.whole_paper.evidence_quality='CLEAN';input.whole_paper.score_range.low=null;assert.equal(f.buildEnglishWorkloadForecast(input).score.integrated_whole_paper.range,null);
});
const report={status:'PASS',tests:checks.length,checks,execution:'Node pure-model synthetic tests; not population calibration or native browser proof'};
console.log(JSON.stringify(report,null,2));
