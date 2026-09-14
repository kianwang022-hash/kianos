import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(webRoot, 'scripts', 'build-xizong-b-learning-candidate.mjs');
let source = fs.readFileSync(target, 'utf8');

function replaceOnce(oldText, newText, label) {
  const first = source.indexOf(oldText);
  if (first < 0) throw new Error(`PHASE4_PATCH_MISSING:${label}`);
  if (source.indexOf(oldText, first + oldText.length) >= 0) throw new Error(`PHASE4_PATCH_AMBIGUOUS:${label}`);
  source = source.replace(oldText, newText);
}

const recallUpgrades = [
  ["  D8:'分型/自然史 → DKA/HHS → 慢性并发症 → 诊断/功能评估 → 长期管理/药物选择',", "  D8:'胰岛素不足/抵抗 → 高血糖+脂解/渗透性利尿 → DKA vs HHS危象分流 → 长期微血管/大血管损伤 → 证据定位 → 按主导风险选择生活/药物/胰岛素',"],
  ["  D11:'Tumor Gate/壁深 → 食管癌 → 胃癌身份/扩散 → 胃癌证据/分期/治疗 → lymphoma/GIST → 整合分流',", "  D11:'共同Tumor Gate → 来源/壁深/部位 → 局部症状与扩散路径 → 内镜/病理/影像证据 → 分期/可切除性 → 器官特异治疗；食管/胃/GIST/淋巴瘤作为同坐标分支',"],
  ["  D12:'TB共同病理 → 肠结核/腹膜结核 → IBD共同底座 → CD/UC鉴别 → 诱导/维持治疗 → IBS功能性分流',", "  D12:'慢性腹痛/腹泻/腹水 → 感染(TB) vs 免疫炎症(IBD) vs 功能(IBS) → 分布/组织/肠外证据 → 并发症危险 → 抗感染/诱导维持/症状治疗',"],
  ["  D14:'梗阻分类/部位 → 闭袢/绞窄血运风险 → 阑尾炎标准链/例外 → 腹股沟空间 → 嵌顿/绞窄复位与手术',", "  D14:'腹痛/呕吐/腹股沟包块 → 管腔梗阻 vs 局部炎症(阑尾) vs 腹壁出口(疝) → 血运/腹膜炎危险 → 定位证据 → 减压/复位/切除/引流',"],
  ["  D15:'癌入口/证据 → 围术准备边界 → 左右结肠切除 → 直肠保肛/造口 → 癌前分子 → 齿状线坐标 → 肛周鉴别',", "  D15:'排便改变/便血/肛周症状 → 右结肠/左结肠/直肠/齿状线定位 → 证据与扩散 → 可切除/保肛/造口 → 肛周痛—血—脓—条索分流',"],
  ["  D19:'胆道管道/结石 → 影像/减压/T管 → 胆囊良性炎症 → 胆囊癌 → 胆管石/AOSC → 胆管癌/出血 → 先天/黄疸定位 → 肝脓肿',", "  D19:'疼痛+黄疸+发热+胆囊/上游扩张 → 定位胆囊/肝内/肝外/远端出口 → 结石/炎症/肿瘤/先天分流 → B超/MRCP/ERCP/PTC证据 → 感染梗阻先减压，随后取石/切除/重建',"],
  ["  D20:'胰酶提前激活 → 自我消化/坏死 → 局部集合/器官衰竭 → 证据 → 支持/介入/慢胰 → 胰腺癌 → 功能性胰岛肿瘤',", "  D20:'上腹痛/黄疸/低糖/顽固溃疡 → 酶原提前激活自我消化 vs 导管肿块梗阻 vs 内分泌过度分泌 → 坏死/器衰或肿瘤证据 → 支持/引流/切除',"],
  ["  D21:'TH合成/作用/HPT反馈 → 甲亢确认/定位 → 常规治疗/甲危/特殊边界 → 甲减 → 结节炎症 → 四癌 → 外科安全/颈部残余',", "  D21:'TSH–FT4功能轴+结构/疼痛 → 甲亢/甲减/结节炎症/肿瘤定位 → 病因证据 → 常规治疗 vs 甲危急救 vs 外科安全 → 妊娠/颈部残余边界',"],
  ["  D22:'球束网髓 + HPA → 原醛 → 嗜铬 → 库欣 → D6反馈定位整合',", "  D22:'高血压低钾/阵发交感/库欣表型 → 盐皮质/儿茶酚胺/糖皮质激素过多 → 激素确认 → 肾素/ACTH反馈定位 → 动态试验/影像 → α先行或病因治疗',"]
];
for (const [oldText, newText] of recallUpgrades) replaceOnce(oldText, newText, `recall:${oldText.slice(2,5)}`);

const newCompression = `const partialSystemReconstructions = [
  {
    id:'PSR-1_GI_INPUT',mode:'NON_GATING_PARTIAL_SYSTEM_RECONSTRUCTION',non_gating:true,
    after_when_ready:['D1','D2','D3','D4'],
    system_truth_refs:['system.json#mental_model.spine[0-3]','system.json#failure_modes/FM1-FM4'],
    target:'motility/control → secretion/digestion → selective absorption → portal/lymph entry',
    prompt:'闭卷画一条食物/底物从入口到门静脉或淋巴的去路；每经过一层都说出控制任务，并指出该层失败首先会留下什么结果。',
    closure:'不按D1–D4标题背诵，也能从推进、消化液、吸收界面和血/淋巴去路重建完整输入链，并把代谢/临床后续接口接出来。'
  },
  {
    id:'PSR-2_METABOLIC_NETWORK',mode:'NON_GATING_PARTIAL_SYSTEM_RECONSTRUCTION',non_gating:true,
    after_when_ready:['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10'],
    system_truth_refs:['system.json#mental_model.spine[4-7]','system.json#core_relations','system.json#failure_modes/FM5-FM10'],
    target:'enzyme/cofactor → carbon/ATP/redox → storage/mobilization → lipid transport → nitrogen/one-carbon → nucleotide supply → bilirubin/hepatic chemical handling',
    incremental_refreshes:[
      {after_when_ready:['M1','M2','M3','M4'],target:'enzyme/cofactor language → carbon oxidation/ATP/redox → glycogen/gluconeogenesis',closure:'能从G-6-P/丙酮酸/乙酰CoA等节点说明碳流、还原当量、ATP与糖储存/输出的方向。'},
      {after_when_ready:['M5','M6','M7','M8'],target:'lipoprotein/cholesterol → FA/TAG/ketone → amino-N/urea → one-carbon',closure:'能在进食/空腹切换下同时追踪脂质和氮的去路，并接回肝脏处理。'},
      {after_when_ready:['M9'],target:'nucleotide supply/degradation → information-flow bridge',closure:'能把PRPP、嘌呤/嘧啶供给和抗代谢物接到G分支，而不重学DNA/RNA结构。'},
      {after_when_ready:['M10'],target:'heme → bilirubin + biotransformation → liver/biliary bridge',closure:'能把UCB/CB与Ⅰ/Ⅱ相处理接到D16–D19，而不把胆红素、胆汁酸和胆道梗阻混为同一层。'}
    ],
    prompt:'从“一个底物进入细胞后去哪”开始，沿碳流、能量/氧化还原、储存/动员、脂质运输、氮、一碳/核苷酸和肝化学处理重建网络；遇到分叉先说状态变量再说通路名。',
    closure:'可以从进食/空腹/应激状态预测主要底物流向，并从ATP、NADH/NADPH、酮体、氨/尿素、核苷酸或胆红素异常反定位第一代谢层。'
  },
  {
    id:'PSR-3_ENDOCRINE_CONTROL',mode:'NON_GATING_PARTIAL_SYSTEM_RECONSTRUCTION',non_gating:true,
    after_when_ready:['D5','D6','D7','D8','D21','D22','D23'],
    system_truth_refs:['system.json#mental_model.spine[8]','system.json#parallel_controls','system.json#failure_modes/FM12'],
    target:'energy state → common feedback language → pancreatic control/diabetes → thyroid/adrenal/calcium-GH localization',
    incremental_refreshes:[
      {after_when_ready:['D5','D6','D7','D8'],target:'energy state → common endocrine language → pancreatic control → diabetes failure',closure:'能从进食/空腹/应激状态说明激素方向，并用“量+效应+反馈”定位胰岛控制失败。'},
      {after_when_ready:['D21','D22','D23'],target:'HPT/HPA/RAAS-mineralocorticoid/PTH-GH branches → shared localization rule',closure:'给出终末激素和上游调节量，能按原发靶腺/上游/异位或抵抗定位，而不是逐病死背。'}
    ],
    prompt:'先用“激素量 + 靶效应 + 反馈关系”作为共同坐标，再把胰岛、甲状腺、肾上腺、PTH/GH放回同一控制语言。',
    closure:'面对激素过多、过少或抵抗场景，能先定位控制层，再调用器官Block；急性危象能优先识别并处理。'
  },
  {
    id:'PSR-4_GI_ABDOMINAL_CLINICAL',mode:'NON_GATING_PARTIAL_SYSTEM_RECONSTRUCTION',non_gating:true,
    after_when_ready:['D9','D10','D11','D12','D13','D14','D15'],
    system_truth_refs:['system.json#failure_modes/FM1-FM4','system.json#failure_modes/FM11','system.json#judgment_axes'],
    target:'movement/outlet vs mucosal/inflammatory vs bleeding/perforation/obstruction vs abdominal-space emergency vs organ-tumor localization',
    prompt:'从反流/吞咽困难、腹痛腹泻、便血、腹膜刺激征、梗阻或肛周症状出发，先定位故障层和当前危险，再进入器官病名。',
    closure:'能把未知GI病例先分到运动/出口、黏膜炎症、出血穿孔梗阻、腹腔空间急症或肿瘤，并给出最能改变下一动作的证据。'
  },
  {
    id:'PSR-5_HEPATOBILIARY_PANCREAS',mode:'NON_GATING_PARTIAL_SYSTEM_RECONSTRUCTION',non_gating:true,
    after_when_ready:['D16','D17','D18','D19','D20'],
    system_truth_refs:['system.json#mental_model.spine[7]','system.json#failure_modes/FM3','system.json#failure_modes/FM8','system.json#failure_modes/FM10-FM11'],
    target:'hepatocyte injury/reconstruction → synthetic/portal failure → tumor vs biliary obstruction/jaundice → pancreatic enzyme or tumor failure',
    prompt:'用肝细胞损伤/合成、门压、胆红素/胆道、肿瘤和胰酶/胰管五个坐标解释黄疸、腹水、右上腹痛、发热或胰腺症状；先问有没有急性出血、感染或梗阻。',
    closure:'能区分肝细胞处理失败、门脉高压、胆道梗阻/感染、肝占位和胰腺自我消化/肿瘤，并在AOSC、破裂出血、重症胰腺炎等场景让急症优先级覆盖病因精修。'
  },
  {
    id:'PSR-6_INFORMATION_TUMOR',mode:'NON_GATING_PARTIAL_SYSTEM_RECONSTRUCTION',non_gating:true,
    after_when_ready:['G1','G2','G3','G4','G5'],external_required:['O9 pathology tumor-general model'],
    system_truth_refs:['system.json#mental_model.spine[9]','system.json#failure_modes/FM13','system.json#core_relations'],
    target:'DNA storage → replication/expression/regulation → mutation+repair → clonal-control failure → pathology tumor behavior → organ application',
    incremental_refreshes:[
      {after_when_ready:['G1','G2','G3','G4','G5'],target:'molecular half: storage → replication/expression/regulation → damage/repair → oncogene/tumor-suppressor failure',closure:'能从一个分子异常定位到信息流/调控/修复层，并选择PCR/印迹/相互作用等技术回答对应问题；此时仍不得宣告完整Tumor Gate。'}
    ],
    prompt:'先重建DNA→RNA→protein与调控/修复，再解释原癌油门、抑癌刹车和修复失守如何允许克隆扩张；最后必须接上O9的形态、浸润、转移、分级/分期语言。',
    closure:'完成G1–G5后能恢复分子半层；只有O9同时可用时，才可从分子异常走到肿瘤行为并进入器官肿瘤Block。'
  }
];

const finalSystemReconstruction = {
  mode:'PRE_QUESTION_SYSTEM_RECONSTRUCTION',
  learner_authorization:'ONLY_AFTER_ALL_38_BLOCKS_ARE_ACTUALLY_LEARNED',
  source_of_truth:['system.json#mental_model','system.json#core_relations','system.json#failure_modes','system.json#judgment_axes'],
  hierarchy_rule:'System → Block → Logic Group → KP remains the only compulsory learner hierarchy; PSR is a non-gating execution checkpoint inside System compression.',
  prompt:[
    'Forward flow: food/substrate input → digestion/absorption → portal/lymph → ATP/storage-mobilization/nitrogen/hepatic processing → endocrine control → DNA/RNA/protein execution.',
    'Control overlay: fed/fasting/stress, GI neural/local/hormonal control, hepatic routing, endocrine feedback and information/repair control.',
    'Reverse localization: from symptoms/labs/imaging/endoscopy/pathology identify the first failed layer before naming a disease.',
    'Urgency override: bleeding, perforation, obstruction, sepsis and metabolic/endocrine crisis can determine the immediate action before etiologic precision.'
  ],
  closure:'不背38个Block或170个LG标题，也能重建System mother model、主要控制层和Failure-Mode families；面对未知病例能选择合适judgment axis、定位第一故障、识别当前危险，并知道何时重新打开具体Block恢复306 Source Precision。',
  forbidden:['recite Block titles as System Recall','use teacher/file/question order as reconstruction order','turn PSR into a mastery gate or Memory debt','duplicate a second System medical model inside Learning owner']
};`;

const psrPattern = /const partialSystemReconstructions = \[[\s\S]*?\n\];/;
if (!psrPattern.test(source)) throw new Error('PHASE4_PATCH_MISSING:partialSystemReconstructions');
source = source.replace(psrPattern, newCompression);

replaceOnce(
  "schema:'kianos.xizong.system_learning_support.v1',status:'L_CANDIDATE',construction_status:'PHASE3_SEMANTIC_CLOSED_PENDING_PROGRESSIVE_COMPRESSION_AUDIT',authority:'CURRENT_PHASE0_3_COMPILED_LEARNING_CONSTRUCTION'",
  "schema:'kianos.xizong.system_learning_support.v1',status:'L_CANDIDATE',construction_status:'PHASE4_COMPRESSION_CLOSED_PENDING_CROSS_SURFACE_AUDIT',authority:'CURRENT_PHASE0_4_COMPILED_LEARNING_CONSTRUCTION'",
  'output:construction_status'
);
replaceOnce(
  "construction_receipts:['content/xizong/knowledge/learner/B_PHASE0_LEARNING_CALIBRATION.md','content/xizong/knowledge/learner/B_PHASE1_ROUTE_DECISION.md','content/xizong/knowledge/learner/B_PHASE2_BLOCK_CONTROL.md']",
  "construction_receipts:['content/xizong/knowledge/learner/B_PHASE0_LEARNING_CALIBRATION.md','content/xizong/knowledge/learner/B_PHASE1_ROUTE_DECISION.md','content/xizong/knowledge/learner/B_PHASE2_BLOCK_CONTROL.md','content/xizong/knowledge/learner/B_PHASE3_LOGIC_GROUP_REACCEPTANCE.md','content/xizong/knowledge/learner/B_PHASE4_PROGRESSIVE_COMPRESSION.md']",
  'output:receipts'
);
replaceOnce(
  "  question_stage:{timing:'AFTER_REAL_SYSTEM_LEARNING_AND_PRE_QUESTION_SYSTEM_RECALL'",
  "  compression:{block_recall:{field:'blocks.*.recall_spine',rule:'Block Recall is a compressed causal/localization/decision model, never a replay of all Logic Group labels or KP prompts.',audit:{reviewed:38,keep:29,upgraded:9,upgraded_blocks:['D8','D11','D12','D14','D15','D19','D20','D21','D22']}},partial_system_reconstruction:{count:6,rule:'PSR is non-gating and creates no canonical unit, score, completion state or Memory debt.',source:'system_route.partial_system_reconstructions'},final_system_reconstruction:finalSystemReconstruction},\n  question_stage:{timing:'AFTER_REAL_SYSTEM_LEARNING_AND_PRE_QUESTION_SYSTEM_RECALL'",
  'output:compression'
);
replaceOnce(
  "semantic_acceptance:{phase3_status:'PASS_BY_FRESH_SEMANTIC_REVIEW',reviewed_blocks:38,reviewed_stable_kps:600,final_logic_groups:170,boilerplate_goal_closure_remaining:0,known_mixed_task_groups_remaining:0,learner_order_exception:{G5:['KP01–KP05','KP12–KP13','KP06–KP11']},note:'This is still not L PASS. Progressive compression, cross-surface negative-space audit, and fresh independent L acceptance remain downstream.'}",
  "semantic_acceptance:{phase3_status:'PASS_BY_FRESH_SEMANTIC_REVIEW',reviewed_blocks:38,reviewed_stable_kps:600,final_logic_groups:170,boilerplate_goal_closure_remaining:0,known_mixed_task_groups_remaining:0,learner_order_exception:{G5:['KP01–KP05','KP12–KP13','KP06–KP11']},phase4_status:'PASS_BY_PROGRESSIVE_COMPRESSION_AUDIT',block_recall_audit:{reviewed:38,keep:29,upgraded:9,blocked:0},psr_audit:{count:6,non_gating:6,staged_refresh_psrs:['PSR-2_METABOLIC_NETWORK','PSR-3_ENDOCRINE_CONTROL','PSR-6_INFORMATION_TUMOR']},final_system_reconstruction:'SYSTEM_GROUNDED_AND_EXPLICIT',extra_compulsory_hierarchy_required:false,note:'This is still not L PASS. Cross-surface/negative-space audit and fresh independent L acceptance remain downstream.'}",
  'output:semantic_acceptance'
);
replaceOnce(
  "console.log(`B Learning Phase-3 candidate built | Blocks=${Object.keys(blocks).length} | KPs=600 | LogicGroups=${logicGroupCount} | path=${path.relative(repoRoot,outPath)}`);",
  "console.log(`B Learning Phase-4 compression candidate built | Blocks=${Object.keys(blocks).length} | KPs=600 | LogicGroups=${logicGroupCount} | PSRs=${partialSystemReconstructions.length} | path=${path.relative(repoRoot,outPath)}`);",
  'output:console'
);

fs.writeFileSync(target, source, 'utf8');
console.log('B Phase-4 compression patch applied to generator');
