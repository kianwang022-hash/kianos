import { readExamChatPlanForDisplay, examScheduleInterval, assertExamChatPlanTimeReadable } from './examChatPlan.mjs';
import { STUDY_TIMER_TIMEZONE, studyDayAt, buildStudyTimerReadModel, readStudyTimerLedger, readStudyTimerState, aggregateStudyTime } from './studyTimer.mjs';
import * as reality from './stewardReality.mjs';

const SUBJECTS={xizong:'西综',english:'English',politics:'政治'};
const STATUS={RECORDED:'数值已记录',COMPLETED:'已完成',MODIFIED:'有修改',SKIPPED:'已跳过'};
const REENTRY={RESTORED:'恢复明显',PARTIAL:'部分恢复',NOT_RESTORED:'仍未恢复'};
const METHODS={walk:'走动',eyes_closed:'闭眼',water:'补水',phone:'手机',food:'吃点东西'};
const clock=at=>new Intl.DateTimeFormat('en-GB',{timeZone:STUDY_TIMER_TIMEZONE,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(at));
const minutes=ms=>{const m=Math.max(0,Math.round(ms/60000));return m<60?`${m}m`:`${Math.floor(m/60)}h${m%60?' '+m%60+'m':''}`;};
const addDay=(d,n)=>{const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10);};
const el=(tag,cls,text='')=>{const n=document.createElement(tag);n.className=cls;n.textContent=text;return n;};
const appendText=(node,tag,cls,text)=>{const n=el(tag,cls,text);node.append(n);return n;};
const button=(text,action,cls='')=>{const b=el('button',cls,text);b.type='button';b.onclick=action;return b;};
const amountLabel=(food,n)=>n==null?'份量未记录':`${Number(n.toFixed?.(2)??n)} ${food.unit||''}`;
const eventTime=e=>e.observedAt??e.startedAt;

export function initStewardWorkspace(root) {
  if(!(root instanceof HTMLElement))return;
  const storage=window.localStorage,$=q=>root.querySelector(q),all=q=>[...root.querySelectorAll(q)];
  const scrollTop=()=>{root.closest('.productCanvas')?.scrollTo(0,0);window.scrollTo(0,0);};
  let view='today',mode='schedule',today=studyDayAt(Date.now()),weekCursor=today,monthCursor=today.slice(0,7);
  let selectedMealId=null,selectedPlan=null,openExercises=new Set(),editingQuick=null,undoQuick=null;
  let suppress=false,frame=null;
  const feedback=(text='',error=false)=>{const n=$('[data-steward-feedback]');n.hidden=!text;n.textContent=text;n.dataset.error=String(error);};
  function save(action,message='',editors=true) {
    try {const result=action();feedback(message);suppress=true;window.dispatchEvent(new Event('kianos:steward-reality-change'));suppress=false;render(editors);return result;}
    catch(e){suppress=false;feedback(/CONFLICT|REVISION/.test(String(e))?'记录已变化，尚未保存这次修改；请先核对最新内容。':'没有保存成功。当前输入保留，请重试。',true);return null;}
  }
  function read() {
    today=studyDayAt(Date.now());
    const planState=readExamChatPlanForDisplay(storage,today);
    let timer=null,activity={kind:'UNKNOWN',status:'unavailable'};
    try {assertExamChatPlanTimeReadable(storage);timer=buildStudyTimerReadModel(storage,Date.now());activity=reality.readStewardCurrentActivity(storage,{now:Date.now()});}catch{}
    return {planState,plan:planState.plan,presentation:planState.plan?.presentation||{},timer,activity};
  }
  function activityCopy(a) {
    if(a.status==='conflict')return {label:'当前活动需核对',detail:'有重叠计时，请确认实际正在做什么',action:'核对记录'};
    if(!['active','paused'].includes(a.status))return {label:'当前没有可确认活动',detail:'实际尚未记录',action:null};
    const label=[a.kind==='STUDY'?SUBJECTS[a.subject]:null,a.label].filter(Boolean).join(' · ');
    return {label,detail:a.status==='paused'?'已暂停':`${a.kind==='STUDY'?'已学习':a.kind==='TRAINING'?'已训练':'已进行'} ${minutes(a.elapsedMs)}`,action:a.kind==='STUDY'?'回到学习':a.kind==='TRAINING'?'回到训练':'继续当前'};
  }
  function dock(action) {window.dispatchEvent(new CustomEvent('kianos:steward-dock-action',{detail:{action}}));}
  function schedule(data) {return (data.presentation.schedule_blocks||[]).map(b=>({...b,...examScheduleInterval(b,data.plan.study_day)})).sort((a,b)=>a.start-b.start);}
  function sessions(day,now=Date.now()) {
    const begin=Date.parse(day+'T00:00:00+08:00'),end=Math.min(begin+86400000,now);
    const rows=readStudyTimerLedger(storage).sessions.filter(e=>!e.excluded);
    const s=readStudyTimerState(storage);
    if(s.running&&s.segmentStartedAt!=null)rows.push({id:'active',subject:s.subject,context:s.context,startedAt:s.segmentStartedAt,endedAt:now});
    return rows.map(x=>({...x,startedAt:Math.max(begin,x.startedAt),endedAt:Math.min(end,x.endedAt)})).filter(x=>x.endedAt>x.startedAt);
  }
  function recordRows(day=today) {
    const state=reality.readStewardReality(storage);
    if(state.unavailable)return null;
    let study=[];try{assertExamChatPlanTimeReadable(storage);study=sessions(day).map(x=>({at:x.startedAt,text:`${SUBJECTS[x.subject]||''} · ${x.context?.detailLabel||'学习'} · ${minutes(x.endedAt-x.startedAt)}`}));}catch{}
    const rows=state.events.filter(x=>!x.deletedAt&&studyDayAt(eventTime(x))===day&&eventTime(x)<=Date.now());
    const superseded=new Set(rows.map(x=>x.supersedes).filter(Boolean));
    return [...study,...rows.filter(x=>!superseded.has(x.id)).map(e=>({at:eventTime(e),event:e,text:describe(e)}))].sort((a,b)=>b.at-a.at);
  }
  function describe(e) {
    if(e.kind==='BREAK')return [e.endedAt==null?'休息中':`休息 ${minutes(e.endedAt-e.startedAt)}`,...e.methods.map(x=>METHODS[x]||x),e.customMethod,REENTRY[e.reentry?.status],e.note].filter(Boolean).join(' · ');
    if(e.kind==='QUICK')return [{WATER:'饮水',COFFEE:'咖啡',ENERGY:'状态',FOCUS:'专注',NOTE:'备注',WEIGHT:'体重'}[e.type],e.value==null?'':String(e.value)+(e.unit?' '+e.unit:''),e.note].filter(Boolean).join(' · ');
    if(e.kind==='MEAL')return `${e.label} · ${e.status==='CONFIRMED'?'已吃':e.status==='SKIPPED'?'未吃':'选择草稿'}`;
    if(e.kind==='TRAINING')return `${e.label} · ${e.exercises.filter(x=>x.status==='COMPLETED').length} 项明确完成${e.effect?' · 已记训练后感受':''}`;
    return `${e.label} · ${e.status==='RUNNING'?'进行中':e.status==='PAUSED'?'暂停':'已结束'}`;
  }
  function renderRecords() {
    const rows=recordRows(),short=$('[data-steward-reality]'),full=$('[data-steward-history-rows]');short.replaceChildren();full.replaceChildren();
    if(rows==null){appendText(short,'p','stewardEmpty','记录暂不可读取，原数据未改动。');return;}
    if(!rows.length)appendText(short,'p','stewardEmpty','今天还没有实际记录。');
    for(const [i,r] of rows.entries()) {
      const row=el('div','stewardRealityRow');row.append(el('time','',clock(r.at)),el('span','',r.text));
      if(i<4)short.append(row.cloneNode(true));
      if(r.event?.kind==='QUICK') {
        row.append(button('修正',()=>editQuick(r.event),'stewardTextButton'));
        row.append(button('删除',()=>{const changed=save(()=>reality.correctStewardQuickReality(storage,r.event.id,{deletedAt:Date.now()},{expectedRevision:r.event.revision}),'记录已删除，可撤销。');if(changed){undoQuick=changed;renderRecords();}},'stewardTextButton'));
      }
      full.append(row);
    }
    if(undoQuick)full.prepend(button('撤销删除',()=>{if(save(()=>reality.correctStewardQuickReality(storage,undoQuick.id,{deletedAt:null},{expectedRevision:undoQuick.revision}),'已恢复记录。')){undoQuick=null;renderRecords();}}));
    const weights=$('[data-steward-weights]');weights.replaceChildren();
    const s=reality.readStewardReality(storage);
    for(const e of s.events.filter(x=>x.kind==='QUICK'&&x.type==='WEIGHT'&&!x.deletedAt).slice(-7).reverse())appendText(weights,'p','',`${studyDayAt(e.observedAt)} · ${e.value} kg${e.note?' · '+e.note:''}`);
    if(!weights.childElementCount)appendText(weights,'p','stewardEmpty','尚无可确认的测量记录。');
  }
  function editQuick(e) {
    editingQuick=e;$('[data-steward-edit-note]').value=e.note;$('[data-steward-edit-value]').disabled=!['WATER','COFFEE','WEIGHT'].includes(e.type);$('[data-steward-edit-value]').value=typeof e.value==='number'?e.value:'';$('[data-steward-edit-dialog]').showModal();
  }
  function renderCapacity(data) {
    const section=$('[data-steward-capacity-section]');
    const cap=data.planState.status==='ready'&&data.plan?.capacity?.state!=='ORDINARY'?data.plan?.capacity:null;
    const latest=(reality.stewardRealityEventsForDay(storage,today)||[]).at(-1);
    const failed=latest&&['PARTIAL','NOT_RESTORED'].includes(latest.reentry?.status)&&Date.now()-latest.reentry.at<4*3600000;
    section.hidden=!(cap||failed);if(section.hidden)return;
    $('[data-steward-capacity-state]').textContent=cap?({REDUCED:'容量降低',RECOVER_FIRST:'先恢复',UNCERTAIN:'待确认'}[cap.state]||''):REENTRY[latest.reentry.status];
    $('[data-steward-capacity-summary]').textContent=cap?.summary||'你记录了尚未充分恢复；是否调整，由接下来的真实表现决定。';
    for(const name of ['load','action','recheck']){const value=cap?.[name]||'';$(`[data-steward-capacity-${name}-row]`).hidden=!value;$(`[data-steward-capacity-${name}]`).textContent=value;}
    $('[data-steward-capacity-recovery]').textContent=latest?describe(latest):'';
  }
  function renderAgenda(data) {
    const rows=schedule(data),now=Date.now(),past=rows.filter(x=>(x.end??x.start)<=now),future=rows.filter(x=>x.start>now),current=rows.find(x=>x.start<=now&&x.end>now);
    const state=$('[data-steward-plan-state]');state.dataset.state=data.planState.status;
    state.textContent=({ready:'今日安排',reference:'已采用的安排 · 判断依据有更新',missing:'暂无今日安排',stale:'今日安排待更新',invalid:'安排暂不可用',unavailable:'安排暂不可读取'}[data.planState.status]||'');
    $('[data-steward-past-summary]').textContent=`已过去的安排 · ${past.length} 项`;
    $('[data-steward-past-fold]').hidden=!past.length;
    const pastNode=$('[data-steward-past-rows]');pastNode.replaceChildren();
    let actualRows=[];try{actualRows=sessions(today);}catch{}
    for(const b of past){const row=el('div','stewardPastRow');row.append(el('time','',clock(b.start)+(b.end?'–'+clock(b.end):'')),el('strong','',b.label));const linked=actualRows.filter(x=>Math.min(x.endedAt,b.end??b.start)>Math.max(x.startedAt,b.start));appendText(row,'span','stewardMuted',linked.length?'有实际记录':'实际未确认');pastNode.append(row);}
    const timeline=$('[data-steward-timeline]');timeline.replaceChildren();
    const c=activityCopy(data.activity),row=el('article','stewardCurrentRow'),card=el('div','stewardCurrentCard');card.dataset.actual=data.activity.kind;
    row.append(el('time','stewardAgendaTime',current?clock(current.start)+'–'+clock(current.end):clock(now)),card);
    const head=el('header','');head.append(el('span','stewardEyebrow',data.activity.status==='paused'?'已暂停':'现在'),el('time','',clock(now)));card.append(head);appendText(card,'h3','',c.label);
    const meta=el('dl','stewardCurrentMeta');meta.append(el('dt','','计划'),el('dd','',current?.label||'此刻没有计划时段'),el('dt','','实际'),el('dd','',c.detail));card.append(meta);
    const actions=el('div','stewardCurrentActions');
    if(c.action&&data.activity.status!=='conflict')actions.append(button(c.action,()=>data.activity.kind==='TRAINING'?activateMode('training'):dock('return'),'stewardPrimary'));
    if(['active','paused'].includes(data.activity.status))actions.append(button(data.activity.status==='paused'?'继续':'暂停',()=>dock('pause')));
    actions.append(button('记录一下',()=>dock('record')));card.append(actions);timeline.append(row);
    if(!rows.length)appendText(timeline,'p','stewardEmpty','没有安排也可以学习、休息和记录实际。');
    for(const b of future){const r=el('article','stewardAgendaRow');r.append(el('time','stewardAgendaTime',clock(b.start)+(b.end?'–'+clock(b.end):'')));const body=el('div','stewardAgendaBody');appendText(body,'strong','',b.label);if(b.detail)appendText(body,'p','',b.detail);r.append(body);if(b.meal_id)r.append(button('看餐食',()=>{selectedMealId=b.meal_id;activateMode('nutrition');},'stewardTextButton'));if(b.training_session_id)r.append(button('看训练',()=>activateMode('training'),'stewardTextButton'));timeline.append(r);}
    $('[data-steward-now-subject]').textContent=c.label;$('[data-steward-now-elapsed]').textContent=c.detail;$('[data-steward-now-plan]').textContent=current?.label||'此刻没有计划时段';$('[data-steward-next]').textContent=future[0]?clock(future[0].start)+' '+future[0].label:'没有后续安排';
    $('[data-steward-study-total]').textContent=data.timer?minutes(data.timer.today.totalMs):'—';for(const s of Object.keys(SUBJECTS))$(`[data-steward-total="${s}"]`).textContent=data.timer?minutes(data.timer.today.bySubject[s]?.ms||0):'—';
    const tasks=data.presentation.today_tasks||[],taskNode=$('[data-steward-tasks]');$('[data-steward-task-section]').hidden=!tasks.length;taskNode.replaceChildren();
    // Reuse Home's existing UI-only checklist key. This is never reality/mastery evidence.
    const checksKey=`kianos-exam-home-task-checks-v1:${today}`;
    for(const t of tasks){
      const row=el('label','stewardTaskRow'),input=document.createElement('input');input.type='checkbox';input.dataset.stewardTaskCheck=t.id;
      try{const state=JSON.parse(storage.getItem(checksKey)||'{}');input.checked=Object.hasOwn(state,t.id)&&state[t.id]===true;}catch{input.disabled=true;}
      input.onchange=()=>{try{const state=JSON.parse(storage.getItem(checksKey)||'{}');if(!state||typeof state!=='object'||Array.isArray(state))throw Error('CHECKS_INVALID');if(input.checked)Object.defineProperty(state,t.id,{value:true,enumerable:true,configurable:true,writable:true});else delete state[t.id];const bytes=JSON.stringify(state);storage.setItem(checksKey,bytes);if(storage.getItem(checksKey)!==bytes)throw Error('CHECKS_READBACK');feedback();}catch{input.checked=!input.checked;feedback('事项勾选尚未保存，请重试。',true);}};
      row.append(input,el('span','',t.label));taskNode.append(row);
    }
    // An optional action, not a daily required checklist or an inferred Review score.
    $('[data-steward-review]').hidden=!(recordRows()||[]).some(r=>r.event?.kind==='QUICK'||r.event?.kind==='TRAINING'||r.event?.reentry?.status==='NOT_RESTORED');
  }
  function renderMealHistory() {
    const node=$('[data-steward-meal-history]');node.replaceChildren();const rows=reality.stewardMealHistoryForDay(storage,today);
    if(rows==null){appendText(node,'p','stewardEmpty','记录暂不可读取。');return;}
    const superseded=new Set(rows.map(x=>x.supersedes).filter(Boolean));
    for(const e of rows.filter(x=>x.status!=='SELECTED').slice().reverse()) {
      const row=el('div','stewardHistoryEntry');appendText(row,'strong','',`${e.label} · ${e.status==='SKIPPED'?'未吃':'已吃'}${superseded.has(e.id)?'（已修订）':''}`);appendText(row,'p','',e.items.map(x=>x.label+' '+amountLabel(x,x.amount)).join(' · ')+(e.uncertain?' · 份量不确定':''));node.append(row);
    }
    if(!node.childElementCount)appendText(node,'p','stewardEmpty','尚未确认餐食实际。');
  }
  function renderNutrition(data) {
    renderMealHistory();
    const p=data.presentation.nutrition,readable=!reality.readStewardReality(storage).unavailable,available=readable&&!!p?.meals?.length&&!!p?.foods?.length;
    $('[data-steward-nutrition-unavailable] h2').textContent=readable?'今天还没有餐食推荐':'餐食记录暂不可读取';
    $('[data-steward-nutrition-unavailable]').hidden=available;$('[data-steward-nutrition-workspace]').hidden=!available;if(!available)return;
    const planAt=data.plan.generated_at;
    if(selectedPlan!==planAt){selectedPlan=planAt;selectedMealId=p.active_meal_id||p.meals[0].id;}
    const meal=p.meals.find(x=>x.id===selectedMealId)||p.meals[0];selectedMealId=meal.id;
    const map=new Map(p.foods.map(x=>[x.id,x]));let draft=reality.readStewardMealDraft(storage,{studyDay:today,mealId:meal.id});
    const stale=!!draft&&draft.planGeneratedAt!==planAt;
    let items=draft&&!stale?draft.items.map(x=>({food_id:x.foodId,amount:x.amount})):meal.items.map(x=>({...x})),uncertain=draft&&!stale?draft.uncertain:false;
    const common=()=>({studyDay:today,observedAt:Date.now(),mealId:meal.id,label:meal.label,ownerRef:p.owner_ref,planGeneratedAt:planAt});
    const serialized=next=>next.map(x=>{const f=map.get(x.food_id);return {foodId:f.id,label:f.label,amount:x.amount,unit:f.unit,nutrition:f.nutrition,gramsPerUnit:f.grams_per_unit,sourceRevision:f.source_revision||planAt};});
    const persist=(next=items,nextUncertain=uncertain,rebuild=false)=>{
      const result=save(()=>reality.saveStewardMealDraft(storage,{...common(),items:serialized(next),uncertain:nextUncertain},{expectedRevision:draft?.revision||0}),'',false);
      if(result){draft=result;items=next;uncertain=nextUncertain;if(rebuild)renderNutrition(read());else renderNumbers();}return result;
    };
    $('[data-steward-meal-title]').textContent=meal.label+' · 选择和实际';$('[data-steward-nutrition-target]').textContent=p.target_label||'';
    const tabs=$('[data-steward-meal-list]');tabs.replaceChildren();for(const m of p.meals){const b=button(m.label,()=>{selectedMealId=m.id;renderNutrition(read());},m.id===meal.id?'active':'');b.dataset.stewardMealPreset=m.id;tabs.append(b);}
    $('[data-steward-meal-recommendation]').textContent=meal.items.map(x=>map.get(x.food_id)?.label+' '+amountLabel(map.get(x.food_id),x.amount)).join(' · ');$('[data-steward-meal-note]').textContent=meal.note||'';
    const rows=$('[data-steward-meal-rows]');rows.replaceChildren();
    items.forEach((item,index)=>{
      const food=map.get(item.food_id);if(!food)return;
      const row=el('div','stewardMealRow');row.dataset.stewardMealItem=food.id;const name=el('div','stewardFoodIdentity');appendText(name,'strong','',food.label);appendText(name,'small','',food.note||'推荐 '+amountLabel(food,food.recommended_amount));
      const select=document.createElement('select');select.setAttribute('aria-label','替换 '+food.label);for(const f of p.foods){const o=el('option','',f.label);o.value=f.id;o.selected=f.id===food.id;select.append(o);}select.onchange=()=>{const f=map.get(select.value);persist(items.map((x,i)=>i===index?{food_id:f.id,amount:f.recommended_amount}:x),uncertain,true);};name.append(select);
      const wrap=el('label','stewardGramInput');const input=document.createElement('input');input.type='number';input.min='0';input.max='10000';input.step='any';input.value=item.amount==null?'':String(item.amount);input.placeholder='未知';input.setAttribute('aria-label',food.label+'份量');input.dataset.stewardFoodInput=food.id;
      input.onchange=()=>{const n=input.value.trim()===''?null:Number(input.value);if(n!=null&&(!Number.isFinite(n)||n<0||n>10000)){feedback('份量需要为非负数，留空表示未知。',true);return;}persist(items.map((x,i)=>i===index?{...x,amount:n}:x));};wrap.append(input,el('span','',food.unit));
      const remove=button('×',()=>persist(items.filter((_,i)=>i!==index),uncertain,true));remove.setAttribute('aria-label','移除 '+food.label);row.append(name,wrap,remove);rows.append(row);
    });
    if(!items.length)appendText(rows,'p','stewardEmpty','选择还没有食物，可以从右侧添加。');
    function renderNumbers() {
      const sums={kcal:0,protein:0,carb:0,fat:0};let known=0,unknown=0;
      for(const i of items){const f=map.get(i.food_id);if(i.amount==null||!f?.nutrition){unknown++;continue;}const n=f.nutrition,scale=n.basis==='PER_UNIT'?i.amount:i.amount*f.grams_per_unit/100;if(!Number.isFinite(scale)){unknown++;continue;}known++;for(const [key,field] of [['kcal','kcal'],['protein','protein_g'],['carb','carb_g'],['fat','fat_g']])sums[key]+=n[field]*scale;}
      $('[data-steward-estimate-label]').textContent=unknown?'已知部分 · 估算':'这次选择 · 估算';for(const key of Object.keys(sums))$(`[data-steward-macro="${key}"]`).textContent=known?`${Math.round(sums[key])} ${key==='kcal'?'kcal':'g'}`:'—';
      $('[data-steward-estimate-note]').textContent=unknown?'还有未知份量或营养数据；这些不是完整总量。':uncertain?'份量不确定，数字仅为粗略估算。':'按当前选择估算；确认后才成为已吃记录。';
      $('[data-steward-topup-note]').textContent=unknown||uncertain?'信息不全，不判断确定缺口；仍可自己选择今日允许项。':'今天已允许的补缺选项，是否添加由你决定。';
      $('[data-steward-meal-uncertain]').setAttribute('aria-pressed',String(uncertain));
      const eaten=(reality.stewardMealActualsForDay(storage,today)||[]).find(x=>x.mealId===meal.id);
      $('[data-steward-meal-state]').textContent=draft&&draft.planGeneratedAt!==planAt?'选择属于旧安排；请套用或编辑本次推荐后再确认。':eaten?'已有实际记录；这里的编辑不会覆盖它。':draft?'选择已保存，尚未确认已吃。':'当前为推荐，尚未确认已吃。';
      $('[data-steward-meal-confirm]').disabled=!items.length||(!!draft&&draft.planGeneratedAt!==planAt);
    }
    const actions=(selector,entries)=>{const node=$(selector);node.replaceChildren();for(const e of entries||[]){const f=map.get(e.food_id);if(!f)continue;node.append(button('+ '+f.label+' '+amountLabel(f,e.amount),()=>{const next=items.map(x=>({...x})),found=next.find(x=>x.food_id===f.id);if(found)found.amount=found.amount==null?null:found.amount+e.amount;else next.push({food_id:f.id,amount:e.amount});persist(next,uncertain,true);}));}if(!node.childElementCount)appendText(node,'p','stewardEmpty','暂无额外推荐项。');};
    actions('[data-steward-quick-add]',p.quick_add);actions('[data-steward-topup-list]',p.topup_pool);
    $('[data-steward-meal-half]').onclick=()=>persist(items.map(x=>({...x,amount:x.amount==null?null:x.amount/2})),uncertain,true);
    $('[data-steward-meal-uncertain]').onclick=()=>persist(items,!uncertain);
    $('[data-steward-meal-reset]').onclick=()=>persist(meal.items.map(x=>({...x})),false,true);
    $('[data-steward-meal-confirm]').onclick=()=>{
      if(!draft&&!persist())return;
      save(()=>reality.confirmStewardMealDraft(storage,{studyDay:today,mealId:meal.id,expectedRevision:draft.revision}),'已保存这次已吃记录。');
    };
    $('[data-steward-meal-skip]').onclick=()=>save(()=>reality.skipStewardMeal(storage,{...common()}),'已记录这餐未吃。');
    renderNumbers();
  }
  function renderTraining(data) {
    const history=$('[data-steward-training-history]');history.replaceChildren();const actuals=reality.stewardTrainingActualsForDay(storage,today)||[];for(const e of actuals)appendText(history,'p','',describe(e));if(!actuals.length)appendText(history,'p','stewardEmpty','暂无训练实际记录。');
    const p=data.presentation.training,readable=!reality.readStewardReality(storage).unavailable,available=readable&&!!p&&(!!p.exercises?.length||p.mode==='REST');$('[data-steward-training-unavailable] h2').textContent=readable?'今天还没有训练安排':'训练记录暂不可读取';$('[data-steward-training-unavailable]').hidden=available;$('[data-steward-training-workspace]').hidden=!available;if(!available)return;
    const planAt=data.plan.generated_at;let stored=reality.readStewardTrainingDraft(storage,{studyDay:today,sessionId:p.session_id});let draft=stored?.planGeneratedAt===planAt?stored:null;
    const actual=actuals.find(x=>x.sessionId===p.session_id&&x.planGeneratedAt===planAt)||null;
    const common=()=>({studyDay:today,sessionId:p.session_id,label:p.title||'训练',observedAt:Date.now(),ownerRef:p.owner_ref,planGeneratedAt:planAt});
    const persistDraft=(exercise,rebuild=false)=>{
      const result=save(()=>reality.saveStewardTrainingDraft(storage,{...common(),exercises:[...(draft?.exercises||[]).filter(x=>x.exerciseId!==exercise.exerciseId),exercise],note:draft?.note||''},{expectedRevision:stored?.revision||0}),'',false);
      if(result){stored=result;draft=result;if(rebuild)renderTraining(read());}return result;
    };
    $('[data-steward-training-title]').textContent=p.title||'今天训练';$('[data-steward-training-duration]').textContent=[{NORMAL:'常规',CONCISE:'精简',RECOVERY:'恢复',REST:'休息'}[p.mode],p.duration_label].filter(Boolean).join(' · ');
    const active=reality.latestActiveStewardActivity(storage);$('[data-steward-training-start]').hidden=!!active||p.mode==='REST';$('[data-steward-training-end]').hidden=!active||active.sessionId!==p.session_id;
    $('[data-steward-training-session-state]').textContent=active?`${active.status==='RUNNING'?'进行中':'已暂停'} · ${minutes(reality.stewardActivityElapsedMs(active))}`:'尚未开始计时';
    $('[data-steward-training-start]').onclick=()=>save(()=>{const state=reality.readStewardReality(storage);if(state.unavailable)throw Error(state.unavailable);window.KianOSStudyTimer.pause();return reality.beginStewardActivity(storage,{activityKind:'TRAINING',label:p.title||'训练',sessionId:p.session_id});},'已开始训练计时；学习保持暂停。');
    $('[data-steward-training-end]').onclick=()=>save(()=>reality.transitionStewardActivity(storage,'ENDED'),'训练计时已结束；不会自动恢复学习或标记动作完成。');
    const list=$('[data-steward-exercise-list]');list.replaceChildren();
    for(const [i,base] of (p.exercises||[]).entries()) {
      const edited=draft?.exercises.find(x=>x.exerciseId===base.id),recorded=actual?.exercises.find(x=>x.exerciseId===base.id),variants=[base,...(base.alternatives||[])];const selected=variants.find(x=>x.id===(edited?.variantId||recorded?.variantId||base.id))||base;
      const card=el('article','stewardExerciseCard');card.dataset.stewardExercise=base.id;
      const head=el('header','stewardExerciseHead'),name=el('div','stewardExerciseIdentity');name.append(el('span','stewardExerciseRank',String(i+1)));const copy=el('div','');copy.append(el('strong','',selected.label),el('p','',selected.note||''));name.append(copy);head.append(name);
      const rx=el('div','stewardExercisePrescription');appendText(rx,'strong','','计划 '+(selected.prescription||'按本次安排'));for(const text of [selected.sets_value!=null?`${selected.sets_value} 组`:'',selected.rpe!=null?`RPE ${selected.rpe}`:'',selected.time_label,selected.rest_note,selected.stop_note].filter(Boolean))appendText(rx,'span','',text);head.append(rx);card.append(head);
      const actions=el('div','stewardExerciseActions');const replace=button('替换',()=>{const n=variants[(variants.indexOf(selected)+1)%variants.length];persistDraft({exerciseId:base.id,variantId:n.id===base.id?'':n.id,label:n.label,loadValue:null,setsValue:null,repsValue:null,rpe:null},true);});replace.dataset.action='replace';replace.hidden=variants.length<2;actions.append(replace);
      const toggle=button(openExercises.has(base.id)?'收起记录':'记录实际',()=>{openExercises.has(base.id)?openExercises.delete(base.id):openExercises.add(base.id);renderTraining(read());});toggle.dataset.action='record';toggle.setAttribute('aria-expanded',String(openExercises.has(base.id)));actions.append(toggle);card.append(actions);
      const editor=el('div','stewardExerciseActual');editor.hidden=!openExercises.has(base.id);const fields=el('div','stewardSetRow');
      const definitions=[['load','loadValue',selected.load_unit||'重量'],['sets','setsValue','组数'],['reps','repsValue',selected.reps_unit||'次数'],['rpe','rpe','RPE']];
      for(const [key,prop,label] of definitions){const wrap=el('label','',label),input=document.createElement('input');input.type='number';input.min='0';input.step=key==='rpe'?'0.5':'any';if(key==='rpe')input.max='10';input.placeholder='未记录';input.dataset.stewardTrainingInput=key;input.setAttribute('aria-label',selected.label+' 实际'+label);const value=edited?edited[prop]:recorded?.[prop];input.value=value==null?'':String(value);wrap.append(input);fields.append(wrap);}
      const measurements=()=>Object.fromEntries(definitions.map(([key,prop])=>{const value=fields.querySelector(`[data-steward-training-input="${key}"]`).value;return [prop,value.trim()===''?null:Number(value)];}));
      const rowValue=()=>({exerciseId:base.id,variantId:selected.id===base.id?'':selected.id,label:selected.label,...measurements(),loadUnit:selected.load_unit||'',repsUnit:selected.reps_unit||''});
      fields.onchange=()=>persistDraft(rowValue());
      const writeActual=status=>save(()=>reality.upsertStewardTrainingActual(storage,{...common(),exercises:[...(actual?.exercises||[]).filter(x=>x.exerciseId!==base.id),{...rowValue(),status}],effect:actual?.effect||null,note:actual?.note||''},{expectedRevision:actual?.revision||0}),'已保存实际记录。');
      const saveButton=button('保存实际',()=>writeActual(recorded?.status||'RECORDED'));saveButton.dataset.action='save-actual';editor.append(fields,saveButton);card.append(editor);
      const states=el('div','stewardExerciseStatuses');for(const [status,label] of [['COMPLETED','完成'],['MODIFIED','有修改'],['SKIPPED','跳过']]){const b=button(label,()=>writeActual(status),recorded?.status===status?'active':'');b.dataset.stewardTrainingStatus=status;states.append(b);}card.append(states);list.append(card);
    }
    if(p.mode==='REST'&&!p.exercises.length)appendText(list,'p','stewardEmpty','今天已安排休息，没有待完成的训练动作。');
    const summary=$('[data-steward-training-summary]');summary.replaceChildren();for(const base of p.exercises||[]){const a=actual?.exercises.find(x=>x.exerciseId===base.id),row=el('div','stewardHistoryEntry');appendText(row,'strong','',a?.label||base.label);appendText(row,'p','',a?[STATUS[a.status],a.loadValue!=null?`${a.loadValue} ${a.loadUnit}`:'',a.setsValue!=null?`${a.setsValue} 组`:'',a.repsValue!=null?`${a.repsValue} ${a.repsUnit}`:'',a.rpe!=null?`RPE ${a.rpe}`:''].filter(Boolean).join(' · '):'待记录');summary.append(row);}
    const note=$('[data-steward-training-note]');note.value=draft?.note||actual?.note||'';
    note.onchange=()=>{const r=save(()=>reality.saveStewardTrainingDraft(storage,{...common(),exercises:draft?.exercises||[],note:note.value},{expectedRevision:stored?.revision||0}),'',false);if(r){draft=r;stored=r;}};
    for(const b of all('[data-steward-training-effect]')){b.classList.toggle('active',actual?.effect===b.dataset.stewardTrainingEffect);b.onclick=()=>save(()=>reality.upsertStewardTrainingActual(storage,{...common(),exercises:actual?.exercises||[],effect:b.dataset.stewardTrainingEffect,note:note.value},{expectedRevision:actual?.revision||0}),'已记录训练后感受。');}
  }
  function renderWeek(data) {
    const date=new Date(weekCursor+'T12:00:00Z'),monday=addDay(weekCursor,-((date.getUTCDay()+6)%7));$('[data-steward-week-label]').textContent=`${monday} — ${addDay(monday,6)}`;
    const grid=$('[data-steward-week-grid]');grid.replaceChildren();grid.append(el('div','stewardWeekCorner','时间'));
    for(let i=0;i<7;i++)grid.append(el('div','stewardWeekDayHead',`${'一二三四五六日'[i]} ${addDay(monday,i).slice(5)}`));
    const axis=el('div','stewardWeekAxis');for(let h=0;h<24;h+=2){const t=el('time','',String(h).padStart(2,'0')+':00');t.style.top=(h/24*100)+'%';axis.append(t);}grid.append(axis);
    for(let i=0;i<7;i++) {
      const day=addDay(monday,i),col=el('div','stewardWeekDay'),start=Date.parse(day+'T00:00:00+08:00');
      const rows=[];if(day===data.plan?.study_day)rows.push(...schedule(data).map(x=>({start:x.start,end:x.end??x.start+15*60000,label:x.label,type:'plan'})));
      for(const r of recordRows(day)||[])rows.push({start:r.at,end:r.event?.endedAt??r.at+15*60000,label:r.text,type:'actual'});
      for(const r of rows){const n=el('div','stewardWeekBlock '+r.type,r.label);n.title=(r.type==='plan'?'计划 ':'实际 ')+clock(r.start)+' '+r.label;n.style.top=Math.max(0,(r.start-start)/864000)+'%';n.style.height=Math.min(100,Math.max(2,(r.end-r.start)/864000))+'%';col.append(n);}grid.append(col);
    }
    const ref=$('[data-steward-week-reference]');ref.replaceChildren();for(const r of data.presentation.week_reference||[])appendText(ref,'p','',`${r.label}${r.detail?' · '+r.detail:''}`);
  }
  function dayDetail(day,data) {
    const rows=recordRows(day)||[],planned=day===data.plan?.study_day?schedule(data):[];const node=$('[data-steward-month-detail]');node.replaceChildren();appendText(node,'h3','',day);
    for(const b of planned)appendText(node,'p','',`计划 ${clock(b.start)} · ${b.label}`);for(const r of rows)appendText(node,'p','',`实际 ${clock(r.at)} · ${r.text}`);if(!rows.length&&!planned.length)appendText(node,'p','stewardEmpty','这一天没有可读取的安排或实际记录。');
  }
  function renderMonth(data) {
    const [y,m]=monthCursor.split('-').map(Number),first=new Date(Date.UTC(y,m-1,1)),days=new Date(Date.UTC(y,m,0)).getUTCDate(),offset=(first.getUTCDay()+6)%7;
    $('[data-steward-month-label]').textContent=`${y} 年 ${m} 月`;const grid=$('[data-steward-month-grid]');grid.replaceChildren();for(const d of '一二三四五六日')grid.append(el('div','stewardMonthHead',d));
    for(let i=0;i<Math.ceil((offset+days)/7)*7;i++){const n=i-offset+1;if(n<1||n>days){grid.append(el('div','stewardMonthCell empty'));continue;}const day=monthCursor+'-'+String(n).padStart(2,'0'),b=button('',()=>dayDetail(day,read()),'stewardMonthCell'+(day===today?' today':''));b.append(el('strong','',String(n)));const count=(recordRows(day)||[]).length;appendText(b,'span','',count?`${count} 条实际记录`:day===data.plan?.study_day?'已有安排':'');grid.append(b);}
  }
  function render(editors=false) {
    const data=read();if(view==='week'){renderWeek(data);return;}if(view==='month'){renderMonth(data);return;}
    renderAgenda(data);renderCapacity(data);renderRecords();if(editors){renderNutrition(data);renderTraining(data);}
  }
  function activateMode(next) {mode=next;all('[data-steward-mode]').forEach(b=>b.classList.toggle('active',b.dataset.stewardMode===next));all('[data-steward-mode-panel]').forEach(n=>n.classList.toggle('active',n.dataset.stewardModePanel===next));render(true);scrollTop();}
  function activateView(next) {view=next;all('[data-steward-view]').forEach(b=>b.classList.toggle('active',b.dataset.stewardView===next));all('[data-steward-view-panel]').forEach(n=>n.classList.toggle('active',n.dataset.stewardViewPanel===next));render(true);scrollTop();}
  for(const b of all('[data-steward-mode]'))b.onclick=()=>activateMode(b.dataset.stewardMode);
  for(const b of all('[data-steward-view]'))b.onclick=()=>activateView(b.dataset.stewardView);
  for(const b of all('[data-steward-back-today]'))b.onclick=()=>activateMode('schedule');
  for(const b of all('[data-steward-record]'))b.onclick=()=>dock('record');
  $('[data-steward-time-review]').onclick=()=>dock('details');
  for(const b of all('[data-steward-adjust],[data-steward-review]'))b.onclick=()=>{$('[data-steward-chat-title]').textContent=b.hasAttribute('data-steward-review')?'复盘今天':'调整今天';$('[data-steward-chat-dialog]').showModal();};
  $('[data-steward-week-prev]').onclick=()=>{weekCursor=addDay(weekCursor,-7);render();};$('[data-steward-week-next]').onclick=()=>{weekCursor=addDay(weekCursor,7);render();};$('[data-steward-week-now]').onclick=()=>{weekCursor=today;render();};
  const moveMonth=n=>{const d=new Date(monthCursor+'-01T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+n);monthCursor=d.toISOString().slice(0,7);render();};$('[data-steward-month-prev]').onclick=()=>moveMonth(-1);$('[data-steward-month-next]').onclick=()=>moveMonth(1);$('[data-steward-month-now]').onclick=()=>{monthCursor=today.slice(0,7);render();};
  $('[data-steward-weight-form]').onsubmit=e=>{e.preventDefault();if(save(()=>reality.recordStewardQuickReality(storage,{type:'WEIGHT',value:Number($('[data-steward-weight]').value),unit:'kg',note:$('[data-steward-weight-note]').value}),'已保存测量记录。'))$('[data-steward-weight-form]').reset();};
  $('[data-steward-edit-cancel]').onclick=()=>$('[data-steward-edit-dialog]').close();
  $('[data-steward-edit-form]').onsubmit=e=>{e.preventDefault();if(!editingQuick)return;const patch={note:$('[data-steward-edit-note]').value};if(!$('[data-steward-edit-value]').disabled)patch.value=$('[data-steward-edit-value]').value===''?null:Number($('[data-steward-edit-value]').value);if(save(()=>reality.correctStewardQuickReality(storage,editingQuick.id,patch,{expectedRevision:editingQuick.revision}),'已保存修正。'))$('[data-steward-edit-dialog]').close();};
  const refresh=()=>{if(suppress||frame)return;frame=requestAnimationFrame(()=>{frame=null;try{render(!root.querySelector('input:focus,select:focus,textarea:focus'));}catch{feedback('部分记录暂不可读取，当前输入与原数据均保留。',true);}});};
  for(const name of ['kianos:study-timer-change','kianos:steward-reality-change','kianos:control-command-applied','storage','focus'])window.addEventListener(name,refresh);
  const tick=setInterval(()=>{if(document.visibilityState==='visible'&&!root.querySelector('input:focus,select:focus,textarea:focus'))render(false);},30000);
  window.addEventListener('pagehide',()=>clearInterval(tick),{once:true});
  activateView('today');
}
