// Synthetic-only data for the actual producer/consumer browser journey.
export async function seedStewardFixture({studyDay, capacity='ORDINARY', fullDay=true}) {
  const mod=await import('/src/lib/examChatPlan.mjs');
  const basis=mod.buildExamChatPlanBasis(localStorage,studyDay);
  const candidate = {
        schema: 'kianos.exam.chat-plan.v1',
        study_day: studyDay,
        generated_at: new Date().toISOString(),
        learner_evidence_basis: basis,
        subjects: {
          xizong: { target_minutes: 240, role: '主推进', note: '', session_ref: null },
          english: null,
          politics: null
        },
        next_subject: 'xizong',
        attention: null,
        capacity: {
          state: 'REDUCED',
          summary: '上午高负荷后可用认知容量下降，但仍可继续推进。',
          basis: '主观状态 + 学习表现 + 当前可用 Health 上下文',
          load: '西综高负荷主块后出现恢复需求',
          action: '先做一次足量低输入恢复，再回到当前主线',
          recheck: '看下一学习块是否恢复持续注意和处理速度'
        },
        presentation: {
          today_tasks: [
            { id: 'life-sunscreen', subject: null, label: '防晒', note: '' },
            { id: 'life-walk', subject: null, label: '饭后走 10 分钟', note: '' },
            { id: 'life-skincare', subject: null, label: '晚间护肤', note: '' }
          ],
          week_reference: [],
          schedule_blocks: [
            { id: 'steward-xz-am', subject: 'xizong', start: '08:30', end: '11:30', label: '西综高认知主块', detail: '强窗口' },
            { id: 'steward-en-mid', subject: 'english', start: '12:10', end: '13:20', label: 'English 连续性', detail: '中低负荷窗口' }
          ],
          nutrition: {
            owner_ref: 'kianwang022-hash/kian-personal-os/health/personal-day/NUTRITION.md',
            target_label: '目标 2200–2450 kcal · P 150–175g',
            active_meal_id: 'z02',
            foods: [
              { id: 'yogurt', label: '高蛋白 Greek yogurt', unit: '盒', grams_per_unit: 300, recommended_amount: 1, note: '300g/盒', nutrition: { basis: 'PER_100G', kcal: 56.9, protein_g: 10, carb_g: 4, fat_g: 0 } },
              { id: 'rye', label: '黑麦片', unit: 'g', recommended_amount: 50, nutrition: { basis: 'PER_100G', kcal: 344.9, protein_g: 13, carb_g: 63.2, fat_g: 1.6 } },
              { id: 'blueberry', label: '蓝莓', unit: 'g', recommended_amount: 120, nutrition: { basis: 'PER_100G', kcal: 57, protein_g: .7, carb_g: 14.5, fat_g: .3 } },
              { id: 'nuts', label: '混合坚果', unit: '小包', grams_per_unit: 12, recommended_amount: 1, note: '12g/小包', nutrition: { basis: 'PER_100G', kcal: 600, protein_g: 18, carb_g: 20, fat_g: 52 } },
              { id: 'salmon', label: '三文鱼', unit: 'g', recommended_amount: 200, nutrition: { basis: 'PER_100G', kcal: 208, protein_g: 20, carb_g: 0, fat_g: 13 } },
              { id: 'shrimp', label: '北极甜虾', unit: 'g', recommended_amount: 170, nutrition: { basis: 'PER_100G', kcal: 74, protein_g: 17.1, carb_g: 1, fat_g: 0 } }
            ],
            meals: [
              { id: 'b01', label: 'B01 · 熟悉早餐', note: '酸奶 + 黑麦 + 蓝莓 + 少量坚果', items: [{ food_id: 'yogurt', amount: 1 }, { food_id: 'rye', amount: 50 }, { food_id: 'blueberry', amount: 120 }, { food_id: 'nuts', amount: 1 }] },
              { id: 'z02', label: 'Z02 · 三文鱼午餐', note: '饱腹 / 训练支持', items: [{ food_id: 'salmon', amount: 200 }, { food_id: 'rye', amount: 50 }, { food_id: 'yogurt', amount: 1 }] },
              { id: 'z03', label: 'Z03 · 甜虾午餐', note: '更轻的午餐候选', items: [{ food_id: 'shrimp', amount: 170 }, { food_id: 'rye', amount: 50 }, { food_id: 'yogurt', amount: 1 }] }
            ],
            topup_pool: [
              { food_id: 'yogurt', amount: 1, role: '补蛋白' },
              { food_id: 'rye', amount: 30, role: '补碳水' },
              { food_id: 'nuts', amount: 1, role: '补脂肪' }
            ],
            quick_add: [
              { food_id: 'yogurt', amount: 1 },
              { food_id: 'rye', amount: 50 },
              { food_id: 'blueberry', amount: 120 },
              { food_id: 'nuts', amount: 1 },
              { food_id: 'salmon', amount: 200 },
              { food_id: 'shrimp', amount: 170 }
            ]
          },
          training: {
            owner_ref: 'kianwang022-hash/kian-personal-os/health/personal-day/TRAINING.md',
            session_id: 'strength-reentry-a',
            title: '全身力量',
            duration_label: '3 个动作 · 约 25–30 分钟',
            exercises: [
              { id: 'KN01', label: 'Smith squat', note: '下肢主力 · 2 × 6–8 · RPE 6–7', prescription: '70 kg × 8', load_value: 70, load_unit: 'kg', reps_value: 8, reps_unit: 'reps', rpe: 6, alternatives: [{ id: 'KN02', label: 'Goblet squat', note: '低疲劳替换', prescription: '12 reps · RPE 6', reps_value: 12, reps_unit: 'reps', rpe: 6 }] },
              { id: 'PR01', label: 'Smith flat bench press', note: '水平推 · 2 × 6–8 · RPE 6–7', prescription: '60 kg × 8', load_value: 60, load_unit: 'kg', reps_value: 8, reps_unit: 'reps', rpe: 6, alternatives: [{ id: 'PR02', label: 'DB flat bench press', note: '哑铃替换', prescription: '10 reps · RPE 6', reps_value: 10, reps_unit: 'reps', rpe: 6 }] },
              { id: 'PU03', label: 'One-arm cable row', note: '水平拉 · 2 × 10–14 / side', prescription: '5 档 × 12', load_value: 5, load_unit: '档', reps_value: 12, reps_unit: 'reps', rpe: 7, alternatives: [{ id: 'PU05', label: 'One-arm DB row', note: '低设置摩擦替换', prescription: '12 reps / side', reps_value: 12, reps_unit: 'reps', rpe: 7 }] }
            ]
          }
        }
      };
  candidate.capacity.state=capacity;
  candidate.presentation.training.mode='CONCISE';
  for(const e of candidate.presentation.training.exercises)e.sets_value=2;
  if(fullDay){
    const times=[['06:30','06:35','起床',null],['06:35','07:00','Lexical','english'],['07:00','07:20','早餐',null],
      ['07:20','08:20','西综预热','xizong'],['08:20','08:30','休息',null],['08:30','11:30','西综上午主块','xizong'],
      ['11:30','11:55','午餐',null],['11:55','12:10','散步',null],['12:10','13:50','中负荷学习','english'],
      ['13:50','14:00','休息',null],['14:00','17:00','西综下午主块','xizong'],['17:00','17:25','晚饭',null],
      ['17:25','17:40','轻走',null],['17:40','19:00','English','english'],['19:00','19:30','训练',null],
      ['19:30','19:40','洗澡',null],['19:40','21:50','西综晚间','xizong'],['21:50','22:15','收尾',null],
      ['22:15','22:30','洗漱',null],['22:30','23:59','睡眠',null]];
    candidate.presentation.schedule_blocks=times.map(([start,end,label,subject],i)=>({id:'qa-'+i,start,end,label,subject,detail:'',
      ...(label==='午餐'||label==='晚饭'?{meal_id:'z02'}:{}),...(label==='早餐'?{meal_id:'b01'}:{}),
      ...(label==='训练'?{training_session_id:'strength-reentry-a'}:{})}));
  }
  mod.writeExamChatPlan(localStorage,candidate,studyDay);
  window.dispatchEvent(new Event('kianos:control-command-applied'));
  return candidate;
}
