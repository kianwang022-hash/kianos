import assert from 'node:assert/strict';
import { buildChatControlledExamReadModel } from '../src/lib/examPlanReadModel.mjs';

const chatModel = buildChatControlledExamReadModel({
  day: '2026-09-17',
  chatPlanState: {
    status: 'ready',
    plan: {
      schema: 'kianos.exam.chat-plan.v1',
      study_day: '2026-09-17',
      generated_at: '2026-09-17T01:00:00.000Z',
      subjects: {
        xizong: { target_minutes: 360, role: '主推进', note: '', session_ref: null },
        english: null,
        politics: null
      },
      next_subject: 'xizong',
      attention: null,
      capacity: {
        state: 'REDUCED',
        summary: '高负荷窗口后容量下降。',
        basis: '主观状态 + 学习表现',
        load: '西综高认知主块',
        action: '恢复后再决定是否继续高负荷。',
        recheck: '下一块持续注意'
      },
      presentation: {
        today_tasks: [{ id: 'xz-b1', subject: 'xizong', label: '西综 · 当前 Block', note: '真实速度样本' }],
        week_reference: [{ id: 'week-xz', subject: 'xizong', label: '真实速度采集中', detail: '再积累 2–3 天', value: '采样中', progress_ratio: null }],
        schedule_blocks: [
          { id: 'xz-morning', subject: 'xizong', start: '09:00', end: '11:00', label: '西综', detail: '主块' },
          { id: 'lunch', subject: null, start: '12:00', end: '12:30', label: '午餐', detail: '', meal_id: 'meal-lunch' },
          { id: 'training', subject: null, start: '19:00', end: '19:30', label: '训练', detail: '', training_session_id: 'training-a' }
        ],
        nutrition: { owner_ref:'personal/nutrition', target_label:'今日餐食', foods:[{id:'salmon',label:'三文鱼',unit:'g',grams_per_unit:1,recommended_amount:200,nutrition:{basis:'PER_100G',kcal:208,protein_g:20,carb_g:0,fat_g:13}}], meals:[{id:'meal-lunch',label:'午餐',note:'',targets:null,items:[{food_id:'salmon',amount:200,role:'main',macro:null}]}], active_meal_id:'meal-lunch', topup_pool:[], quick_add:[] },
        training: { owner_ref:'personal/training', session_id:'training-a', title:'今日训练', duration_label:'30m', mode:'CONCISE', exercises:[{id:'squat',label:'深蹲',note:'',prescription:'2组',sets_value:2,time_label:'',rest_note:'',stop_note:'',load_value:null,load_unit:'',reps_value:null,reps_unit:'reps',rpe:null,alternatives:[]}] }
      }
    }
  },
  nativeContinue: {
    xizong: { href: '/kianos/xizong/a1/', title: 'A1' },
    english: { href: '/kianos/english/', title: 'English' },
    politics: { href: '/kianos/politics/', title: '政治' }
  }
});
assert.equal(chatModel.next.subject, 'xizong',
  'Chat-selected next subject identity must survive even when native Continue omits subject');
assert.equal(chatModel.subjects.xizong.continue.subject, 'xizong',
  'subject Continue projection must preserve its owner identity');
assert.equal(chatModel.presentation.todayTasks[0].id, 'xz-b1');
assert.equal(chatModel.presentation.weekReference[0].value, '采样中');
assert.equal(chatModel.presentation.scheduleBlocks[0].start, '09:00');
assert.equal(chatModel.presentation.nutrition.meals[0].id, 'meal-lunch');
assert.equal(chatModel.presentation.training.session_id, 'training-a');
assert.equal(chatModel.capacity.judgment.state, 'REDUCED');
assert.match(chatModel.capacity.judgment.action, /恢复后/);

console.log('PASS exam plan read model');


const overCapacity = buildChatControlledExamReadModel({
  day: '2026-09-17',
  dayCapacity: 300,
  chatPlanState: {
    status: 'ready',
    plan: {
      schema: 'kianos.exam.chat-plan.v1',
      study_day: '2026-09-17',
      generated_at: '2026-09-17T01:00:00.000Z',
      subjects: {
        xizong: { target_minutes: 240, role: '主推进', note: '', session_ref: 'xz-session' },
        english: { target_minutes: 90, role: '保连续', note: '', session_ref: null },
        politics: { target_minutes: 30, role: '稳推进', note: '', session_ref: null }
      },
      next_subject: 'xizong',
      attention: null
    }
  },
  nativeContinue: {
    xizong: { href: '/kianos/xizong/a1/', title: 'A1', sessionRef: 'xz-session' },
    english: { href: '/kianos/english/', title: 'English' },
    politics: { href: '/kianos/politics/', title: '政治' }
  }
});
assert.equal(overCapacity.control.planStatus,'capacity_conflict');
assert.equal(overCapacity.control.capacityConflict,true);
assert.equal(overCapacity.capacity.plannedTargetMinutes,360);
assert.equal(overCapacity.capacity.overplannedMinutes,60);
assert.equal(overCapacity.next,null,
  'Home must not auto-execute a Chat Plan whose known target minutes exceed usable day capacity');
assert.equal(overCapacity.attention.type,'chat_plan_capacity');
assert.match(overCapacity.attention.text,/超过今日可用/);
assert.equal(overCapacity.subjects.xizong.continue.href,'/kianos/xizong/a1/',
  'manual subject entry remains available; Website refuses only the unsafe automatic plan');
assert.equal(overCapacity.subjects.xizong.confidence,'capacity-conflict');

const exactCapacity = buildChatControlledExamReadModel({
  day: '2026-09-17',
  dayCapacity: 360,
  chatPlanState: {
    status: 'ready',
    plan: {
      schema: 'kianos.exam.chat-plan.v1',
      study_day: '2026-09-17',
      generated_at: '2026-09-17T01:00:00.000Z',
      subjects: {
        xizong: { target_minutes: 240, role: '主推进', note: '', session_ref: 'xz-session' },
        english: { target_minutes: 90, role: '保连续', note: '', session_ref: null },
        politics: { target_minutes: 30, role: '稳推进', note: '', session_ref: null }
      },
      next_subject: 'xizong',
      attention: null
    }
  },
  nativeContinue: {
    xizong: { href: '/kianos/xizong/a1/', title: 'A1', sessionRef: 'xz-session' },
    english: { href: '/kianos/english/', title: 'English' },
    politics: { href: '/kianos/politics/', title: '政治' }
  }
});
assert.equal(exactCapacity.control.planStatus,'ready');
assert.equal(exactCapacity.control.capacityConflict,false);
assert.equal(exactCapacity.next.subject,'xizong');

// Fresh top-layer audit: a legal whole-day target must not reuse elapsed time.
const subjectIds = ['xizong', 'english', 'politics'];
const replan = (targets, actual, capacity, state = 'ready') => buildChatControlledExamReadModel({
  day: '2026-09-21',
  dayCapacity: capacity,
  actualBySubject: Object.fromEntries(subjectIds.map((subject, index) => [subject, actual[index]])),
  nativeContinue: Object.fromEntries(subjectIds.map((subject) => [subject, { href: `/${subject}/`, title: subject }])),
  chatPlanState: {
    status: state,
    plan: state === 'ready' ? {
      schema: 'kianos.exam.chat-plan.v1',
      study_day: '2026-09-21',
      generated_at: '2026-09-21T04:00:00.000Z',
      subjects: Object.fromEntries(subjectIds.map((subject, index) => [subject, { target_minutes: targets[index] }])),
      next_subject: 'english'
    } : null
  }
});
for (const [name, targets, actual, capacity, over] of [
  ['overspent subject', [100, 120, 80], [180, 0, 0], 300, 80],
  ['unbudgeted switch', [null, 120, 80], [180, 0, 0], 300, 80],
  ['capacity loss', [240, 120, 60], [240, 30, 0], 330, 90]
]) {
  const result = replan(targets, actual, capacity);
  assert.equal(result.control.planStatus, 'capacity_conflict', name);
  assert.equal(result.capacity.overplannedMinutes, over, name);
  assert.equal(result.next, null, name);
  assert.equal(result.subjects.xizong.continue.href, '/xizong/', 'manual entry survives');
}
const midday = replan([240, 60, 0], [180, 0, 0], 300);
assert.equal(midday.control.planStatus, 'ready');
assert.equal(midday.subjects.xizong.remainingMinutes, 60, '180 done + 60 further = 240 whole-day target');
assert.equal(midday.subjects.english.remainingMinutes, 60);
const unknownTargets = replan([null, null, null], [180, 0, 0], 300);
assert.equal(unknownTargets.subjects.xizong.remainingMinutes, null, 'unknown is not zero');
assert.equal(unknownTargets.control.planStatus, 'ready', 'unknown targets do not invent a conflict');
assert.equal(replan([240, 120, 60], [180, 0, 0], null).control.planStatus, 'ready', 'unknown capacity is not zero');
assert.equal(replan([60, 0, 0], [180, 0, 0], 120).capacity.overplannedMinutes, 0, 'completed overrun is not future debt');
for (const state of ['missing', 'stale', 'invalid', 'unavailable']) {
  const result = replan([100, 100, 100], [0, 0, 0], 300, state);
  assert.equal(result.control.planStatus, state);
  assert.equal(result.next, null, 'no automatic fallback for rejected evidence/plan');
}
console.log('PASS exam plan remaining-capacity regression');

// The shared presentation model consumes only an admitted same-day reference.
// It retains intent, not stale capacity, exact session binding or execution.
{
  const referencePlan={schema:'kianos.exam.chat-plan.v1',study_day:'2026-09-30',generated_at:'2026-09-30T00:00:00Z',subjects:{xizong:{target_minutes:90,role:'主线',session_ref:'old-session'},english:null,politics:null},next_subject:'xizong',capacity:{state:'REDUCED',summary:'old'},attention:{text:'old strategy'},presentation:{today_tasks:[{id:'t',label:'西综'}],week_reference:[{id:'w',label:'本周'}],schedule_blocks:[{id:'s',start:'08:00',end:'10:00',label:'主块'}],nutrition:{owner_ref:'p/n',target_label:'',foods:[],meals:[],active_meal_id:null,topup_pool:[],quick_add:[]},training:{owner_ref:'p/t',session_id:'rest-day',title:'休息',duration_label:'',mode:'REST',exercises:[]}}};
  const state={status:'reference',plan:referencePlan,error:'CHAT_PLAN_EVIDENCE_BASIS_STALE',executable:false,guidanceFresh:false};
  const ref=buildChatControlledExamReadModel({day:'2026-09-30',chatPlanState:state,dayCapacity:0,nativeContinue:{xizong:{href:'/xizong/',title:'原生入口'}}});
  assert.equal(ref.presentation.todayTasks.length,1);
  assert.equal(ref.presentation.weekReference.length,1);
  assert.equal(ref.presentation.nutrition.owner_ref,'p/n');
  assert.equal(ref.presentation.training.mode,'REST');
  assert.equal(ref.subjects.xizong.role,'主线');
  assert.equal(ref.control.planStatus,'reference');
  assert.equal(ref.control.executable,false);
  assert.equal(ref.control.capacityConflict,false);
  assert.equal(ref.capacity.judgment,null);
  assert.equal(ref.next,null);
  assert.equal(ref.attention,null);
  assert.equal(ref.subjects.xizong.sessionRef,null);
  const invalid=buildChatControlledExamReadModel({day:'2026-09-30',chatPlanState:{...state,status:'invalid'}});
  assert.equal(invalid.presentation,null);
  console.log('PASS reference retains intentions without re-admitting strategy or session binding');
}
