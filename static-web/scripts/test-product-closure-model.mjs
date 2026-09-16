import assert from 'node:assert/strict';
import fs from 'node:fs';
import { emptyExamProfile, validateExamProfile, buildExamPlan, resolveExamPhase, robustMinutes, GATES } from '../src/lib/examOrchestrator.mjs';
import { politicsProductCatalog, examProductCatalog } from '../src/lib/productCatalog.mjs';
import { readPoliticsSnapshot, selectPoliticsReview, resolvePoliticsContinue, PRACTICE_KEYS } from '../src/lib/politicsPracticeState.mjs';
import { readExamDemand, safeProductHref } from '../src/lib/examDemand.mjs';
const checks=[];const check=(name,fn)=>{fn();checks.push(name);console.log('PASS',name);};
const day='2026-09-16';const profile=()=>({...emptyExamProfile(),defaultDailyMinutes:480});
check('unknown capacity produces no fabricated allocations',()=>assert.ok(buildExamPlan({day}).rows.every(r=>r.minutes===null)));
check('Phase-A seed floors and finite remaining main push',()=>assert.deepEqual(buildExamPlan({day,profile:profile()}).rows.map(r=>r.minutes),[270,120,90]));
check('all phase boundaries and overlap resolved without auto acceptance',()=>{
 for(const [d,p] of [['2026-09-27','A'],['2026-09-28','B'],['2026-10-20','B'],['2026-10-21','C'],['2026-11-15','C'],['2026-11-16','D'],['2026-12-04','D'],['2026-12-05','E'],['2026-12-21','DONE']]) assert.equal(resolveExamPhase(d).id,p);
 assert.equal(buildExamPlan({day:'2026-10-22',profile:profile()}).attention.type,'assessment');
});
check('every capacity conserves minutes, with 0..4 minute rounding buffer only',()=>{
 for(let n=0;n<=1440;n++){const p=profile();p.defaultDailyMinutes=n;const plan=buildExamPlan({day,profile:p});assert.equal(plan.rows.reduce((s,r)=>s+r.minutes,0)+plan.unallocated,n);assert.ok(plan.unallocated<5);assert.ok(plan.rows.every(r=>r.reviewMinutes<=r.minutes));}
});
check('rest day, maintenance choice and no historical hour debt',()=>{
 const p=profile();p.capacityByDay[day]=0;assert.ok(buildExamPlan({day,profile:p}).rows.every(r=>r.minutes===0));
 p.capacityByDay[day]=90;p.maintenanceByDay[day]='english';assert.deepEqual(buildExamPlan({day,profile:p}).rows.map(r=>r.minutes),[0,90,0]);
 const q=profile();q.capacityByDay['2026-09-15']=0;assert.deepEqual(buildExamPlan({day,profile:q}).rows,buildExamPlan({day,profile:profile()}).rows);
});
check('confirmed actual time replans remaining capacity without claiming completion',()=>{
 const p=profile();p.observations=[{id:'o1',day,subject:'english',minutes:120,confirmed:true}];
 const plan=buildExamPlan({day,profile:p});assert.equal(plan.capacity,360);assert.equal(plan.rows[1].minutes,0);assert.ok(!JSON.stringify(plan).includes('mastered'));
});
check('forward seven-day sharing differs from daily debt',()=>{const p=profile();p.capacityByDay['2026-09-17']=0;const plan=buildExamPlan({day,profile:p});assert.ok(plan.rows[1].minutes>120);assert.equal(plan.horizonTotal,480*6);});
check('review competes inside allocation, never on top',()=>{const plan=buildExamPlan({day,profile:profile(),demands:{politics:{reviewMinutes:600}}});assert.equal(plan.rows.reduce((n,r)=>n+r.minutes,0),480);assert.ok(plan.rows[2].reviewMinutes<=plan.rows[2].minutes);});
const report=(subject,extra={})=>({subject,day,validThrough:'2026-12-20',evidenceRefs:['confirmed-private-assessment'],note:'经核对的阶段工作量',confidence:'low',recoverability:'high',...extra});
check('required pace, score gap, ceiling and stale report are evidence conditioned',()=>{
 const p=profile();p.reports=[report('politics',{remainingMinutes:5000,gateDate:'2026-09-27',ceilingMinutes:180})];
 const plan=buildExamPlan({day,profile:p});assert.equal(plan.rows[2].minutes,180);assert.equal(plan.rows[2].status,'需要加速');assert.equal(plan.attention.type,'pace');
 p.reports[0].validThrough=day;assert.equal(buildExamPlan({day:'2026-09-17',profile:p}).rows[2].report,null);
});
check('score reports require evidence, expiry, honest English coverage and all three for total',()=>{
 const p=profile();p.reports=[report('english',{scoreBand:[80,86]})];assert.throws(()=>validateExamProfile(p,day),/英语估分/);
 p.reports[0].coverage=['objective','translation','writing'];assert.equal(buildExamPlan({day,profile:p}).totalBand,null);
 p.reports.push(report('xizong',{scoreBand:[255,275]}),report('politics',{scoreBand:[60,72]}));assert.deepEqual(buildExamPlan({day,profile:p}).totalBand,[395,433]);
 p.reports[0].evidenceRefs=[];assert.throws(()=>validateExamProfile(p,day));
});
check('gate conclusions and malformed imports fail closed',()=>{
 for(const v of [{...profile(),defaultDailyMinutes:'480'},{...profile(),observations:{}},{...profile(),capacityByDay:[]},{...profile(),gateReports:[{date:GATES[0].date,outcome:'PASS',recordedOn:day,note:'fake'}]}]) assert.throws(()=>validateExamProfile(v,day));
});
check('material windows do not claim release and disappear outside useful window',()=>{assert.equal(buildExamPlan({day,profile:profile()}).reminder,null);assert.ok(buildExamPlan({day:'2026-11-28',profile:profile()}).reminder.label.includes('未见'));});
check('robust task estimate rejects outliers and insufficient evidence',()=>{assert.equal(robustMinutes([1,2,3,900],3).minutes,2.5);assert.equal(robustMinutes([1,2],3).confidence,'seed');});
const catalog=politicsProductCatalog('/');const full=examProductCatalog('/');const q=catalog.questions[0];
const store={};const storage={getItem:key=>store[key]??null,setItem:()=>{throw new Error('consumer cannot write');}};
const snapshot=()=>readPoliticsSnapshot(storage);
check('Home/Review allowlists never serialize unseen content or answers',()=>{assert.ok(!/"(answer|correct_answer|stem|options|takeaway|chatExplanation|xiao_reference)":/.test(JSON.stringify(full)));});
check('empty and corrupted private storage stay distinct',()=>{
 assert.equal(selectPoliticsReview(catalog,snapshot()).items.length,0);store[PRACTICE_KEYS.attempts]='{';assert.equal(snapshot().errors.length,1);delete store[PRACTICE_KEYS.attempts];
 store[PRACTICE_KEYS.evidence]='{}';assert.equal(snapshot().errors.length,1);delete store[PRACTICE_KEYS.evidence];
});
store[PRACTICE_KEYS.attempts]=JSON.stringify({units:{[q.unitKey]:{attempts:{[q.id]:{question_id:q.id,outcome:'UNCERTAIN',study_day:day}}}}});
check('native W/U included, unattempted discussion and non-current IDs excluded',()=>{
 store[PRACTICE_KEYS.meta]=JSON.stringify({discussion:{[catalog.questions[1].id]:true},latestOutcome:{ghost:'WRONG'}});
 const r=selectPoliticsReview(catalog,snapshot());assert.deepEqual(r.problemIds,[q.id]);assert.equal(r.items.length,1);
});
check('fresh stable revisit leaves immutable first attempt while discussion remains separate',()=>{
 const original=store[PRACTICE_KEYS.attempts];store[PRACTICE_KEYS.meta]=JSON.stringify({latestOutcome:{[q.id]:'STABLE'},discussion:{[q.id]:true}});
 const r=selectPoliticsReview(catalog,snapshot());assert.equal(r.problemIds.length,0);assert.deepEqual(r.discussionIds,[q.id]);assert.equal(store[PRACTICE_KEYS.attempts],original);
});
check('exact native active session survives source repair and stale identity fails closed',()=>{
 store[PRACTICE_KEYS.session]=JSON.stringify({runtimeVersion:2,revision:catalog.revision,id:'exact',ids:[q.id],index:0,status:'active'});
 assert.ok(resolvePoliticsContinue(catalog,snapshot()).href.includes(`question=${q.id}`));
 store[PRACTICE_KEYS.last]=JSON.stringify({href:`${q.unitHref.split('#')[0]}?practiceSession=exact&practiceQuestion=${q.id}#source-${q.unitId}`});assert.ok(resolvePoliticsContinue(catalog,snapshot()).href.includes('#source-'));
 store[PRACTICE_KEYS.session]=JSON.stringify({runtimeVersion:2,revision:'stale',id:'exact',ids:[q.id],index:0,status:'active'});assert.equal(resolvePoliticsContinue(catalog,snapshot()).stale,true);
});
check('chapter/source/Unit/Question return targets remain safe and exact',()=>{
 delete store[PRACTICE_KEYS.session];for(const hash of [q.unitHref.split('#')[1],`source-${q.unitId}`,`politics-question-${q.id}`,`politics-unit-return-${q.unitId}`]){
 store[PRACTICE_KEYS.last]=JSON.stringify({subject:q.subject,chapter:q.chapter,href:`/politics/${q.subject}/${q.chapter}/#${hash}`});assert.ok(!resolvePoliticsContinue(catalog,snapshot()).stale,hash);}
 store[PRACTICE_KEYS.last]=JSON.stringify({subject:q.subject,chapter:q.chapter,href:'https://evil.test/'});assert.equal(resolvePoliticsContinue(catalog,snapshot()).stale,true);
 for(const href of ['javascript:alert(1)','//evil.test','/capital/','https://evil.test']) assert.equal(safeProductHref(href),null);
});
check('Xizong native second-pass eligibility stays phase-aware and holdout-safe',()=>{
 const x=full.xizong[0], target=x.questions[0];const key=`kianos:xizong:system-question-sweep:${x.id}:v1`;
 store[key]=JSON.stringify({round:{studyPhase:'SECOND_PASS',queueMode:'TARGETED'},results:{},attemptHistory:[{type:'QUESTION_ATTEMPT',question_id:target.questionId,system_id:x.id,scope_hash:x.scopeHash,question_inventory_hash:x.inventoryHash,study_phase:'FIRST_PASS',status:'wrong'}]});
 assert.equal(readExamDemand(storage,full).demands.xizong.reviewMinutes,3);
 store['kianos:xizong:full-paper-holdout-years:v1']=JSON.stringify([target.year]);assert.equal(readExamDemand(storage,full).demands.xizong.reviewMinutes,0);
});
fs.mkdirSync('../product-closure-evidence',{recursive:true});fs.writeFileSync('../product-closure-evidence/model.json',JSON.stringify({status:'PASS',checks,privateFixtures:true},null,2));
