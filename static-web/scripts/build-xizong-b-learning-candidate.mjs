import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const bRoot = path.join(repoRoot, 'content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor');
const outPath = path.join(repoRoot, 'content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning.json');
const system = JSON.parse(fs.readFileSync(path.join(bRoot, 'system.json'), 'utf8'));

const semanticGroups = {
  "D1": [
    {
      "kp": [1,3],
      "label": "节律—阈值—收缩门",
      "cognitive_job": "CAUSAL_PREDICTION",
      "goal": "把平滑肌底座、ICC慢波与机械阈/电阈接成“节律由谁给、收缩何时发生、强度由什么放大”的模型。",
      "closure": "给出慢波幅度、阈值或每个慢波上的动作电位数变化，能分别预测节律与收缩强度，并说明有慢波不等于一定有动作电位、无动作电位也不等于绝无轻收缩。"
    },
    {
      "kp": [4,5],
      "label": "ENS与自主神经控制",
      "cognitive_job": "CONTROL_COMPARE",
      "goal": "建立“ENS是局部控制器，自主神经是全身状态改档器”的两层控制模型，并分开判断管壁、括约肌与腺体。",
      "closure": "面对去外在神经、交感增强或副交感增强场景，能预测运动/分泌/括约肌方向，同时保留ICC起搏和ENS局部独立性。"
    },
    {
      "kp": [6,6],
      "label": "Ca²⁺—CaM—MLCK执行",
      "cognitive_job": "EXECUTION_CHAIN",
      "goal": "把电活动或Gq–IP₃化学信号统一接到Ca²⁺—CaM—MLCK—MLC磷酸化，解释控制信号怎样真正变成平滑肌张力。",
      "closure": "能从L型Ca²⁺通道或Gq–PLC–IP₃两个入口走到收缩，并从Ca²⁺下降/MLCP走到舒张；明确平滑肌依赖CaM–MLCK而不是肌钙蛋白。"
    }
  ],
  "D2": [
    {
      "kp": [1,4],
      "label": "口腔—食管—LES入口",
      "cognitive_job": "ENTRY_CONTROL_COMPARE",
      "goal": "把唾液处理、食管推进和LES放行/重新关闭组织成上消化道入口的正常门控模型。",
      "closure": "给出进食、吞咽或LES松弛/收缩改变，能预测食团通过与反流方向，并能区分唾液神经调节、食管推进和LES高压屏障的职责。"
    },
    {
      "kp": [5,7],
      "label": "胃运动、容纳与排空",
      "cognitive_job": "DYNAMIC_CONTROL",
      "goal": "建立胃头区容纳、尾区磨碎推进以及十二指肠反馈刹车共同决定排空速度的动态模型。",
      "closure": "给出餐量、脂肪/酸/高渗食糜或胃运动变化，能预测胃内压力、混合和排空方向，并解释容受性舒张为什么能增容而不明显增压。"
    },
    {
      "kp": [8,11],
      "label": "胃液、胃酸与分泌调节",
      "cognitive_job": "SECRETORY_CONTROL",
      "goal": "把胃液细胞来源、HCl生成与ACh—胃泌素—组胺协同/生长抑素抑制接成可定位的分泌控制网。",
      "closure": "给出某细胞、受体或调节因子受抑/增强，能预测胃酸、胃蛋白酶或内因子方向，并指出改变发生在细胞来源、泌酸执行还是上游调节。"
    },
    {
      "kp": [12,12],
      "label": "胃黏膜防御",
      "cognitive_job": "DEFENSE_BOUNDARY",
      "goal": "把黏液—HCO₃⁻、上皮屏障、血流与修复压成抵抗酸/蛋白酶的最低防御模型。",
      "closure": "能解释防御下降为何可在胃酸不增加时仍造成黏膜损伤，并把完整胃炎/PUD诊疗明确后置到D10。"
    }
  ],
  "D3": [
    {
      "kp": [1,4],
      "label": "胰液、酶原与肠激素",
      "cognitive_job": "SECRETION_CAUSAL_LOCALIZATION",
      "goal": "从酸性食糜与营养分解产物出发，分别定位Secretin/CCK、胰管HCO₃⁻与腺泡酶原，并接上胰蛋白酶激活级联。",
      "closure": "给出十二指肠酸、脂肪/蛋白产物或胰管/腺泡故障，能预测Secretin/CCK和HCO₃⁻/胰酶方向，并指出酶原提前激活为何危险。"
    },
    {
      "kp": [5,7],
      "label": "胆汁、胆盐与脂肪消化",
      "cognitive_job": "FAT_DIGESTION_TRANSPORT",
      "goal": "建立“乳化—脂肪酶作用—混合微胶粒—胆盐回收”的腔内脂肪处理模型。",
      "closure": "能说明胆盐缺乏、胆囊不排空或回肠胆盐回收受损时脂肪与ADEK吸收为何下降，并不把胆盐误当水解脂肪的酶。"
    },
    {
      "kp": [8,9],
      "label": "小肠/大肠运动",
      "cognitive_job": "MOTILITY_COMPARE",
      "goal": "区分分节运动的混合接触任务、蠕动的推进任务与大肠集团运动/储存任务。",
      "closure": "给出“需要混匀吸收”或“需要向远端推进/排便”的情境，能选对主要运动形式并解释功能后果。"
    },
    {
      "kp": [10,11],
      "label": "三激素比较与故障定位",
      "cognitive_job": "COMPARE_LOCALIZATION",
      "goal": "把高频胃肠激素按刺激、来源、主要靶点与净效应进行比较，并用它们反推分泌/运动故障层。",
      "closure": "看到酸、脂肪/蛋白或胃内刺激时，能选择相应激素并预测胰液、胆囊、胃酸/排空方向；能从异常表现反定位主要激素接口。"
    }
  ],
  "D4": [
    {
      "kp": [1,2],
      "label": "吸收界面与血/淋巴去路",
      "cognitive_job": "ABSORPTION_MAP",
      "goal": "把小肠吸收部位、跨细胞/细胞旁路径和门静脉/淋巴两条出口建立成统一界面地图。",
      "closure": "给出一种营养物或肠段受损，能先判断主要吸收部位，再说明跨上皮后走门静脉还是淋巴及其后果。"
    },
    {
      "kp": [3,4],
      "label": "B12与长链脂质特殊路径",
      "cognitive_job": "SPECIAL_RELAY_COMPARE",
      "goal": "并列学习B12的胃—胰—回肠接力与长链脂质的微胶粒—重合成—乳糜微粒—淋巴接力，突出“多站点才能完成”的特殊性。",
      "closure": "给出胃酸/内因子、胰蛋白酶、回肠、胆盐或乳糜微粒环节缺失，能判断B12或长链脂质链在哪一站断裂；不把两条路径混成同一机制。"
    },
    {
      "kp": [5,8],
      "label": "糖、肽、铁、钙选择性吸收",
      "cognitive_job": "TRANSPORT_COMPARE_BOUNDARY",
      "goal": "按顶端进入、细胞内处理、基底侧输出比较糖/肽与铁/钙的选择性吸收门槛。",
      "closure": "能在糖/小肽、铁、钙场景中说清主要载体/价态或调节门槛与血侧输出方向，并把完整贫血、PTH/钙磷疾病留给后续owner。"
    }
  ],
  "M1": [
    {"kp":[1,5],"label":"蛋白质结构、折叠与变性","cognitive_job":"STRUCTURE_CAUSAL","goal":"把氨基酸序列、四级结构、稳定力与变性/复性接成“结构为何决定功能”的模型。","closure":"给出一级结构改变、非共价力破坏或变性条件，能预测哪些结构层受损、功能是否丢失以及一级结构是否保留。"},
    {"kp":[6,8],"label":"等电点、蛋白评价与分离/降解","cognitive_job":"PHYSICOCHEMICAL_HANDLING","goal":"把pI/电荷、营养学评价、分离方法和蛋白清除视为“如何按理化性质识别/处理蛋白”的技术分类图。","closure":"给出pH与pI、蛋白样品或分离/降解任务，能选择电荷方向或合适技术；不强行把这些点编成一条因果链。"},
    {"kp":[9,12],"label":"酶身份、催化与调节","cognitive_job":"ENZYME_MECHANISM_CONTROL","goal":"从活性中心/降低活化能接到酶特异性、关键酶和变构/共价等调节，建立代谢通量控制语言。","closure":"给出酶量、活性中心或调节方式变化，能预测反应速率/通量方向，并说明酶不改变平衡点。"},
    {"kp":[13,14],"label":"酶动力学与抑制比较","cognitive_job":"KINETIC_PERTURBATION","goal":"用Km/Vmax和竞争/非竞争等抑制方式建立“参数怎样变、增加底物能否克服”的比较模型。","closure":"给出Lineweaver/Michaelis参数或抑制剂场景，能判断抑制类型、Km/Vmax方向与底物补偿可能。"},
    {"kp":[15,17],"label":"辅因子、维生素与医学酶学","cognitive_job":"COFACTOR_VITAMIN_MAP","goal":"把B族维生素/金属等辅因子按搬运电子、氢或基团的任务挂到关键反应，并保留医学酶学接口。","closure":"给出辅酶/维生素缺乏或某类化学转移任务，能匹配主要辅因子并说明其在后续代谢通路的角色。"}
  ],
  "M2": [
    {"kp":[1,5],"label":"糖酵解、乳酸与PDH入口","cognitive_job":"CARBON_ENTRY_BRANCHING","goal":"建立葡萄糖在胞浆到丙酮酸后按缺氧/有氧分成乳酸再生NAD⁺或PDH进入乙酰CoA的第一处分叉。","closure":"能从葡萄糖走到丙酮酸，给出缺氧/无线粒体或有氧条件时预测乳酸/PDH方向，并指出关键不可逆控制点。"},
    {"kp":[6,9],"label":"TCA、底物水平能量与还原当量接驳","cognitive_job":"ENERGY_ACCOUNT_INTERFACE","goal":"把TCA输出的CO₂、NADH/FADH₂和底物水平磷酸化组织成向呼吸链交货的能量账，并接入胞浆NADH穿梭。","closure":"能恢复TCA主环与主要还原当量/底物水平ATP产出，并根据穿梭入口预测胞浆NADH的产能差。"},
    {"kp":[10,15],"label":"电子→质子→ATP与故障定位","cognitive_job":"ETC_FAULT_LOCALIZATION","goal":"把I/II→Q→III→Cyt c→IV→O₂电子流、I/III/IV泵H⁺与ATP合酶统一成电子—质子—ATP三流模型。","closure":"给出呼吸链抑制、ATP合酶阻断或解偶联，能分别判断电子流、氧耗、质子梯度、产热和ATP变化，并解释NADH/FADH₂ P/O差异。"}
  ],
  "M3": [
    {"kp":[1,3],"label":"RBC糖酵解、ATP与2,3-DPG","cognitive_job":"RBC_SPECIAL_BRANCH","goal":"在成熟RBC无线粒体前提下，把无氧糖酵解ATP与2,3-DPG旁路接到膜维持和Hb放氧。","closure":"给出RBC无线粒体、ATP下降或2,3-DPG变化，能预测细胞稳定与氧解离方向。"},
    {"kp":[4,7],"label":"PPP—NADPH—GSH抗氧化","cognitive_job":"REDOX_DEFENSE","goal":"从G-6-P分流到PPP生成NADPH，再维持GSH还原状态抵抗氧化，接到G6PD缺陷接口。","closure":"给出氧化应激、G6PD下降或NADPH/GSH变化，能预测RBC氧化损伤方向，并区分NADPH的抗氧化/合成角色与NADH产ATP角色。"}
  ],
  "M4": [
    {"kp":[1,4],"label":"G-6-P与糖原存取","cognitive_job":"STORAGE_OUTPUT_DECISION","goal":"用G-6-P枢纽组织肝/肌糖原合成与分解，并突出肝能输出血糖而肌只能自用。","closure":"给出餐后/短期空腹或肝肌差异，能预测糖原合成/分解和血糖输出方向，并解释G6Pase边界。"},
    {"kp":[5,8],"label":"糖异生、Cori与能量账","cognitive_job":"GLUCONEOGENESIS_RECONSTRUCTION","goal":"把不可逆糖酵解绕行、乳酸/甘油/氨基酸原料、Cori循环与能量成本组织成维持血糖的重建链。","closure":"给出空腹原料或某关键酶受阻，能恢复糖异生绕行并判断能否净生糖及能量代价。"},
    {"kp":[9,10],"label":"胰高血糖素与空腹时间轴","cognitive_job":"STATE_SWITCH","goal":"把激素调节和肝糖原→糖异生的时间接力压成空腹血糖维持轴。","closure":"给出餐后数小时到延长空腹，能判断主要血糖来源如何切换，并把完整胰岛激素生理留给D7。"}
  ],
  "M5": [
    {"kp":[1,3],"label":"脂蛋白身份、组成与方向","cognitive_job":"LIPOPROTEIN_IDENTITY","goal":"按来源、主要载荷、密度/蛋白脂质比例与运输方向建立CM/VLDL/LDL/HDL身份坐标。","closure":"给出颗粒来源或主要运输任务，能判断最可能脂蛋白并说明外源/内源/逆向转运方向。"},
    {"kp":[4,7],"label":"CM/VLDL-LDL/HDL三条运输线","cognitive_job":"LIPOPROTEIN_TRANSPORT","goal":"把小肠CM、肝VLDL→IDL→LDL和HDL逆向转运三条线按卸货、残粒/受体回收连续运行。","closure":"给出餐后脂质、肝输出或外周胆固醇回收场景，能沿相应颗粒变化与组织去向走完整路径。"},
    {"kp":[8,10],"label":"apo、酶、受体与运输故障定位","cognitive_job":"LIPOPROTEIN_INTERFACE_LOCALIZATION","goal":"把apo、LPL/LCAT和LDL/清道夫受体作为颗粒识别、酶处理和回收接口。","closure":"给出apo/酶/受体缺陷，能预测哪类颗粒积聚或逆向转运受损，并连接动脉粥样硬化/脂肪肝而不重讲其完整病理。"}
  ],
  "M6": [
    {"kp":[1,4],"label":"胆固醇合成与HMG-CoA还原酶","cognitive_job":"CHOLESTEROL_SYNTHESIS_CONTROL","goal":"从线粒体乙酰CoA转运到胞浆合成胆固醇，并把HMG-CoA还原酶作为关键调节点。","closure":"给出乙酰CoA/NADPH供应、胆固醇反馈或关键酶受抑，能预测胆固醇合成方向。"},
    {"kp":[5,8],"label":"胆固醇去路、胆汁酸、VitD与类固醇","cognitive_job":"CHOLESTEROL_DESTINATION_MAP","goal":"把游离/酯化胆固醇与胆汁酸、VitD、类固醇激素等去路组织成前体分配图。","closure":"给出胆固醇进入细胞或某下游需求变化，能指出主要储存/排泄/衍生去路并连接D19/D22/D23。"},
    {"kp":[9,11],"label":"甘油磷脂合成与磷脂酶","cognitive_job":"PHOSPHOLIPID_REACTION_MAP","goal":"把甘油磷脂共同骨架、合成与PLA/PLC等切割位置接到膜结构和信号/脂肪酸衍生接口。","closure":"给出磷脂酶类型或膜磷脂底物，能判断切割产物与进入信号/炎症接口的方向。"}
  ],
  "M7": [
    {"kp":[1,6],"label":"TAG/脂肪酸合成与储能","cognitive_job":"LIPID_STORAGE_SYNTHESIS","goal":"把餐后脂肪酸/TAG合成、甘油骨架与NADPH/乙酰CoA来源组织成储能通路，并与分解方向互斥。","closure":"给出餐后胰岛素高、碳源过剩或合成关键步骤变化，能预测FA/TAG合成与储存方向。"},
    {"kp":[7,12],"label":"脂解、肉碱穿梭与β氧化","cognitive_job":"LIPID_MOBILIZATION_OXIDATION","goal":"从脂肪库动员FFA接到长链脂肪酸肉碱入线粒体和β氧化生成乙酰CoA/NADH/FADH₂。","closure":"给出空腹/儿茶酚胺、肉碱穿梭受阻或奇偶数碳脂肪酸，能预测脂解、β氧化和能量/糖异生接口。"},
    {"kp":[13,15],"label":"酮体生成—利用—酸中毒","cognitive_job":"KETONE_STATE_CHAIN","goal":"把肝内乙酰CoA过剩→产酮、肝外利用和过量酮体导致酸中毒接成状态切换链。","closure":"给出饥饿或糖尿病胰岛素不足，能解释为何肝产酮却不能自身利用、哪些组织使用以及何时进入酮症酸中毒。"},
    {"kp":[16,16],"label":"必需脂肪酸与类花生酸接口","cognitive_job":"ESSENTIAL_FA_CONNECTION","goal":"把必需脂肪酸和类花生酸前体作为独立连接地图，不让其阻塞酮体主链。","closure":"能识别必需脂肪酸来源和向前列腺素/白三烯等炎症介质的接口，并明确完整炎症/药理后置。"}
  ],
  "M8": [
    {"kp":[1,3],"label":"氨基酸身份与分类","cognitive_job":"AA_IDENTITY_CLASSIFICATION","goal":"按必需性、侧链/极性和生糖/生酮去路建立氨基酸多轴身份表。","closure":"给出一个氨基酸或分类任务，能在至少两个高价值轴上正确归类，并不把分类本身等同于代谢反应链。"},
    {"kp":[4,7],"label":"氨基酸衍生物与供体地图","cognitive_job":"AA_DERIVATIVE_DONOR_MAP","goal":"把酪氨酸/色氨酸/组氨酸等衍生活性分子与SAM、硫酸/PAPS等供体组织成跨系统连接图。","closure":"给出儿茶酚胺、甲状腺激素、黑色素、递质或甲基化等产物，能追溯主要氨基酸/供体接口。"},
    {"kp":[8,13],"label":"碳氮分流、转氨与安全运氨","cognitive_job":"NITROGEN_HANDLING","goal":"把转氨/脱氨、碳骨架去向以及丙氨酸/谷氨酰胺安全运氨接成氮从组织到肝的主链。","closure":"给出外周组织产氨、转氨酶或运输形式，能说明氮和碳骨架分别去哪，并预测肝/肾接口。"},
    {"kp":[14,16],"label":"尿素循环、两个氮与调节","cognitive_job":"UREA_CYCLE_EXECUTION","goal":"从线粒体CPS-I起步把尿素循环位置、两个氮来源、能量与TCA接口组织成解毒执行链。","closure":"能闭卷走完尿素循环、指出两个氮来源和关键调节，并解释肝衰时高氨为何出现。"},
    {"kp":[17,18],"label":"一碳单位、叶酸与B12","cognitive_job":"ONE_CARBON_FOLATE_B12","goal":"把FH4一碳单位、叶酸/B12与dTMP/嘌呤、甲基化和巨幼细胞成熟接口连起来。","closure":"给出叶酸/B12缺乏或一碳需求，能预测核苷酸合成/同型半胱氨酸等方向并连接M9/血液系统。"}
  ],
  "M9": [
    {"kp":[1,5],"label":"PRPP与嘌呤从头/补救/分解","cognitive_job":"PURINE_SUPPLY_RECOVERY","goal":"把PRPP枢纽、嘌呤从头/补救和尿酸分解终点组织成供给—回收—清除网络。","closure":"给出PRPP、HGPRT/补救或黄嘌呤氧化等变化，能预测嘌呤供给与尿酸方向。"},
    {"kp":[6,10],"label":"嘧啶、脱氧核苷酸与dTMP","cognitive_job":"PYRIMIDINE_DEOXY_DTMP","goal":"比较嘧啶先造环后接PRPP，并接上核糖核苷酸还原与dUMP→dTMP的一碳依赖。","closure":"能区分嘌呤/嘧啶从头逻辑、CPS-I/II与dTMP所需叶酸接口，并从RNA原料走到DNA原料。"},
    {"kp":[11,15],"label":"抗代谢物靶点地图","cognitive_job":"ANTIMETABOLITE_TARGET_MAP","goal":"把6-MP、别嘌呤醇、5-FU、MTX、阿糖胞苷等放回核苷酸网络的具体阻断层。","closure":"给出药物名或被阻断反应，能定位到嘌呤/嘧啶/叶酸/dTMP/聚合层并预测主要供给后果。"}
  ],
  "M10": [
    {"kp":[1,4],"label":"血红素合成与含铁卟啉入口","cognitive_job":"HEME_SYNTHESIS","goal":"把甘氨酸+琥珀酰CoA、线粒体/胞浆往返与铁插入组织成血红素合成主链。","closure":"给出B6、铅或关键步骤受阻，能预测血红素合成方向并连接RBC/细胞色素接口。"},
    {"kp":[5,9],"label":"UCB→CB→肠道与三类黄疸","cognitive_job":"BILIRUBIN_LOCALIZATION","goal":"从血红素分解形成UCB、白蛋白运肝、UGT结合CB、胆道排肠接到溶血/肝细胞/梗阻三类黄疸。","closure":"给出血/尿胆红素、尿胆原和胆道通畅性，能定位故障在生成、肝处理还是排出，并解释UCB/CB性质差异。"},
    {"kp":[10,13],"label":"Ⅰ相/Ⅱ相生物转化","cognitive_job":"BIOTRANSFORMATION_PHASE_MAP","goal":"把CYP等Ⅰ相引入/暴露官能团与Ⅱ相结合增水溶性组织成肝脏处理外源/内源物的两阶段图。","closure":"给出一种药物/激素处理或结合供体，能判断属于Ⅰ相还是Ⅱ相及对水溶性/排泄的方向；不扩写完整药物相互作用。"}
  ],
  "D5": [
    {"kp":[1,6],"label":"能量去路、测量与BMR","cognitive_job":"ENERGY_MEASUREMENT","goal":"把底物化学能分成ATP、机械功与热，并把直接/间接测热和基础代谢条件接到同一能量账。","closure":"给出耗氧量、呼吸商、基础状态或活动状态变化，能判断适用测量与能量消耗方向，不把BMR与全天总能量消耗混同。"},
    {"kp":[7,10],"label":"核心温度、产热与散热","cognitive_job":"THERMOREGULATION_OUTPUT","goal":"建立核心温度由产热与辐射/传导/对流/蒸发散热平衡决定的物理模型。","closure":"给出环境温度、皮肤血流、运动或蒸发条件变化，能预测核心温度方向并说明主要散热通道如何切换。"},
    {"kp":[11,14],"label":"发汗、调定点与发热/中暑","cognitive_job":"THERMAL_CONTROL_DISCRIMINATION","goal":"区分下丘脑调定点上移导致的发热与散热失败/热负荷过高导致的中暑，并把发汗控制接入。","closure":"面对寒战发热、退热出汗或高热无调定点上移场景，能判断调定点与产散热状态，给出方向正确的处理逻辑。"},
    {"kp":[15,19],"label":"应激代谢与EN/PN营养支持","cognitive_job":"STRESS_NUTRITION_DECISION","goal":"把创伤/感染后的分解代谢、负氮平衡与营养评估、EN优先和PN适应边界接成临床支持决策。","closure":"给出肠道是否可用、应激程度和营养风险，能选择EN/PN大方向并解释为什么应激期会动员糖脂蛋白；不扩写完整重症营养处方。"}
  ],
  "D6": [
    {"kp":[1,3],"label":"激素共同身份与分泌语言","cognitive_job":"GENERAL_HORMONE_LANGUAGE","goal":"建立内分泌/旁分泌/自分泌、节律/脉冲分泌以及血中运输的共同语言。","closure":"面对一种信号分子，能按来源—到达靶细胞方式—分泌时序判断其调节类型，并不把局部旁分泌等同于经典内分泌。"},
    {"kp":[4,5],"label":"下丘脑—垂体架构","cognitive_job":"AXIS_ARCHITECTURE","goal":"把下丘脑释放/抑制激素、垂体前后叶与靶腺组织成可沿轴追踪的层级图。","closure":"给出某垂体或靶腺激素异常，能先指出其上游/下游节点与运输路径，为后续反馈定位建立坐标。"},
    {"kp":[6,7],"label":"分泌调节与反馈","cognitive_job":"REGULATION_FEEDBACK","goal":"建立神经、体液、激素调节以及长/短/超短反馈怎样改变轴输出的方向模型。","closure":"给出靶腺激素升高/降低或上游刺激变化，能预测下丘脑/垂体方向，并区分负反馈与前馈/非反馈调节。"},
    {"kp":[8,9],"label":"化学分类与受体","cognitive_job":"CHEMICAL_CLASS_RECEPTOR","goal":"用肽/胺/类固醇等化学身份预测储存、运输、膜受体或核受体及效应时程。","closure":"给出激素化学类别，能判断是否需载体、受体大致位置和起效特点，并能反向用受体位置排除错误类别。"},
    {"kp":[10,12],"label":"功能过多/过少/抵抗与轴定位","cognitive_job":"CLINICAL_LOCALIZATION","goal":"把“先确认功能状态，再用上下游激素关系定位原发/继发/异位/抵抗”固化成内分泌病例算法。","closure":"给出一对上游—靶腺激素结果，能判断功能过多/过少及病变层级；遇到靶器官抵抗时不机械套负反馈方向。"},
    {"kp":[13,13],"label":"高血压—低钾专项分流","cognitive_job":"APPLICATION_DISCRIMINATION","goal":"把内分泌共同语言应用到高血压+低钾场景，区分醛固酮过多与Liddle等非激素模拟。","closure":"给出肾素、醛固酮及低钾/碱中毒组合，能判断是否为原醛方向、继发RAAS方向或Liddle样靶通道异常。"}
  ],
  "D7": [
    {"kp":[1,3],"label":"胰岛素信号与全身储存作用","cognitive_job":"INSULIN_SIGNAL_STORAGE","goal":"从胰岛素受体—IRS—PI3K/AKT接到糖摄取、糖原/脂肪/蛋白合成，建立餐后储存效应。","closure":"给出胰岛素增加/受体信号下降，能分别预测肝、肌、脂肪组织的糖脂蛋白方向，并指出胰岛素抵抗发生在“信号/效应”层。"},
    {"kp":[4,5],"label":"B细胞葡萄糖感知与双相分泌","cognitive_job":"BETA_CELL_SENSING_SECRETION","goal":"建立葡萄糖进入B细胞→葡萄糖激酶→ATP↑→KATP关闭→去极化→Ca²⁺内流→胰岛素释放，并理解双相分泌。","closure":"给出血糖、KATP或Ca²⁺通道变化，能预测胰岛素释放方向；能区分已储颗粒快速相与后续持续相。"},
    {"kp":[6,9],"label":"胰岛分泌修饰网络","cognitive_job":"SECRETION_MODULATION","goal":"把肠促胰素、神经、旁分泌、氨基酸与K⁺等输入组织成对A/B/D细胞输出的修饰网络。","closure":"给出GLP-1/GIP、交感/副交感、氨基酸或生长抑素变化，能预测胰岛素/胰高血糖素方向并说明主作用层。"},
    {"kp":[10,13],"label":"胰高血糖素与进食—空腹切换","cognitive_job":"FED_FASTING_INTEGRATION","goal":"把胰岛素/胰高血糖素比值接到肝糖原、糖异生、脂解/酮体和蛋白代谢，形成进食—空腹—应激状态切换。","closure":"给出餐后、短期空腹或应激场景，能预测肝糖输出、脂肪动员和酮体方向，并说明胰高血糖素为何主要指向肝。"}
  ],
  "D8": [
    {"kp":[1,5],"label":"糖尿病分型与自然史","cognitive_job":"CLASSIFICATION_NATURAL_HISTORY","goal":"从绝对胰岛素缺乏与胰岛素抵抗+β细胞失代偿两种根机制组织T1/T2及特殊类型自然史。","closure":"给出年龄、体型、酮症倾向、自身抗体/C肽等线索，能判断分型方向并解释病程中β细胞功能变化。"},
    {"kp":[6,12],"label":"DKA/HHS急性代谢危象","cognitive_job":"ACUTE_CRISIS_DISCRIMINATION","goal":"把胰岛素不足导致的高血糖、渗透性利尿、酮体与酸碱/钾变化组织成DKA与HHS对照危象模型。","closure":"给出血糖、酮体、pH、渗透压、血钾/总钾与意识状态，能区分DKA/HHS并按补液—胰岛素—钾等主序列解释治疗风险。"},
    {"kp":[13,16],"label":"慢性器官并发症","cognitive_job":"CHRONIC_ORGAN_DAMAGE","goal":"用微血管/大血管、神经和感染/足病轴组织长期高血糖造成的器官损伤。","closure":"面对肾、眼、神经、心脑血管或足部线索，能定位并发症类别及共同危险因素，不重复邻接系统完整疾病模型。"},
    {"kp":[17,20],"label":"诊断与β细胞功能评估","cognitive_job":"DIAGNOSIS_FUNCTION","goal":"区分血糖诊断证据、HbA1c/OGTT等时间窗口与C肽等β细胞功能/分型工具。","closure":"给出空腹/随机/OGTT/HbA1c或胰岛素/C肽结果，能回答“是否糖尿病”和“胰岛功能如何”这两个不同问题。"},
    {"kp":[21,25],"label":"长期管理与降糖药","cognitive_job":"MANAGEMENT_DRUG_DECISION","goal":"按生活方式、胰岛素需求和各类非胰岛素药物的作用层/禁忌，把长期管理变成选择而非药名清单。","closure":"给出T1/T2、肾功能、低血糖风险、肥胖/心肾背景等场景，能选择治疗大方向并识别必须用胰岛素或需避免某类药的边界。"}
  ],
  "M9": [
    {"kp":[1,5],"label":"PRPP与嘌呤从头/补救/分解","cognitive_job":"PURINE_SUPPLY_RECOVERY","goal":"把PRPP枢纽、嘌呤从头/补救和尿酸分解终点组织成供给—回收—清除网络。","closure":"给出PRPP、HGPRT/补救或黄嘌呤氧化等变化，能预测嘌呤供给与尿酸方向。"},
    {"kp":[6,10],"label":"嘧啶、脱氧核苷酸与dTMP","cognitive_job":"PYRIMIDINE_DEOXY_DTMP","goal":"比较嘧啶先造环后接PRPP，并接上核糖核苷酸还原与dUMP→dTMP的一碳依赖。","closure":"能区分嘌呤/嘧啶从头逻辑、CPS-I/II与dTMP所需叶酸接口，并从RNA原料走到DNA原料。"},
    {"kp":[11,15],"label":"抗代谢物靶点地图","cognitive_job":"ANTIMETABOLITE_TARGET_MAP","goal":"把6-MP、别嘌呤醇、5-FU、MTX、阿糖胞苷等放回核苷酸网络的具体阻断层。","closure":"给出药物名或被阻断反应，能定位到嘌呤/嘧啶/叶酸/dTMP/聚合层并预测主要供给后果。"}
  ],
  "G1": [
    {"kp":[1,3],"label":"核酸身份、方向与测量","cognitive_job":"NUCLEIC_IDENTITY_DIRECTION","goal":"从核苷/核苷酸、5′→3′一级结构接到碱基组成与A260/A280等身份/纯度判断。","closure":"给出DNA/RNA样品、序列方向、碱基组成或吸光比，能判断分子身份/单双链或污染方向，并区分结构信息与样品纯度问题。"},
    {"kp":[4,6],"label":"DNA双螺旋、包装与可逆打开","cognitive_job":"DNA_STRUCTURE_PACKAGING_STABILITY","goal":"把B-DNA稳定力、大/小沟、核小体包装与变性—Tm—复性/杂交组织成“既稳定又可读取”的结构模型。","closure":"给出GC/离子强度、组蛋白/核小体或变性条件变化，能预测Tm/开放性，并说明一级结构是否被破坏及杂交需要什么前提。"},
    {"kp":[7,9],"label":"RNA、遗传密码与翻译前准确性","cognitive_job":"RNA_DECODING_PRECONDITIONS","goal":"把mRNA/tRNA/rRNA角色、密码子特性和aaRS/tRNA/核糖体三层准确性建立成翻译前准备模型。","closure":"给出密码子突变、tRNA/aaRS错误或RNA类型，能判断信息读取/氨基酸装载/核糖体层的后果，并解释简并与移码差异。"},
    {"kp":[10,10],"label":"真核基因组组织","cognitive_job":"EUK_GENOME_ORGANIZATION","goal":"把断裂基因、外显子/内含子/UTR、单顺反子和多复制子作为真核信息组织的独立地图。","closure":"能从前体RNA到成熟mRNA说明哪些序列去留，并比较原核多顺反子/单复制子与真核组织方式；不提前展开G3/G4。"}
  ],
  "G2": [
    {"kp":[1,7],"label":"DNA复制执行系统","cognitive_job":"DNA_REPLICATION_EXECUTION","goal":"用半保留/双向/半不连续/高保真四约束组织复制叉、引物、聚合酶/工具组、起始—延长—成熟及原核/真核差异。","closure":"给出模板方向、引物/聚合酶/解旋/连接等故障，能预测前导/后随链和复制结果，并解释新链始终5′→3′。"},
    {"kp":[8,9],"label":"端粒与逆转录：两种反向复制解法","cognitive_job":"REVERSE_TRANSCRIPTASE_SOLUTIONS","goal":"比较端粒酶用自带RNA模板补线性DNA末端与逆转录病毒用RNA模板生成双链DNA，两者共享逆转录但解决不同问题。","closure":"给出染色体末端缺失或RNA病毒/cDNA场景，能选择端粒酶/逆转录酶并说清模板、引物和校对边界。"},
    {"kp":[10,11],"label":"核酸工具、引物与复制/转录出口比较","cognitive_job":"TOOL_PRIMER_EXIT_COMPARE","goal":"把核酸酶/连接酶、哪些过程需引物，以及DNA复制vs转录的模板/原料/酶/方向作语言切换。","closure":"给出切/接、是否需引物或DNA→DNA/DNA→RNA任务，能选择工具并准确区分复制与转录，为G3入口做好转换。"}
  ],
  "G3": [
    {"kp":[1,5],"label":"转录执行：模板、启动、延长与终止","cognitive_job":"TRANSCRIPTION_EXECUTION","goal":"从模板/编码链方向接到原核RNApol/启动子、起始—延长—两类终止，并纳入真核Pol I/II/III产物比较。","closure":"给出启动子/σ、模板方向、终止结构或RNApol类型，能预测转录是否开始/停止及产物类别，并说明转录无需引物。"},
    {"kp":[6,8],"label":"RNA加工与质量控制","cognitive_job":"RNA_PROCESSING_QUALITY","goal":"把mRNA帽/尾/剪接/编辑、tRNA/rRNA加工和异常mRNA监控组织成前体RNA到可用RNA的质量控制层。","closure":"给出GU-AG、加帽/加尾、编辑或NMD等场景，能判断改变的是成熟度、序列内容还是异常转录物清除。"},
    {"kp":[9,13],"label":"翻译体系、能量与起始—延长—终止","cognitive_job":"TRANSLATION_EXECUTION","goal":"把mRNA、氨酰tRNA、A/P/E位、aaRS能量账与原/真核起始、延长/终止串成完整翻译执行链。","closure":"给出密码子、tRNA装载、起始因子、进位/成肽/转位或终止变化，能定位步骤、能量消耗和原/真核差异。"},
    {"kp":[14,14],"label":"蛋白成熟、折叠与修饰","cognitive_job":"PROTEIN_MATURATION","goal":"把蛋白水解、化学修饰、二硫键、分子伴侣、亚基/辅基装配作为翻译后获得功能的独立闭环。","closure":"给出羟化/糖基化、二硫键或错误折叠场景，能判断改变的是翻译后成熟而非编码序列，并预测功能/定位后果。"},
    {"kp":[15,15],"label":"蛋白靶向与翻译干扰接口","cognitive_job":"TARGETING_INTERFERENCE_BOUNDARY","goal":"在同一KP内保留两条边界轴：信号肽/SRP决定蛋白去向；药物/毒物按核糖体或因子层阻断翻译。","closure":"能根据N端信号肽/核定位序列判断蛋白靶向；也能根据原核/真核大小亚基或因子靶点定位翻译干扰，并明确两轴只是共享“翻译机器接口”。"}
  ],
  "G4": [
    {"kp":[1,2],"label":"表达特异性、染色质与表观调控","cognitive_job":"CHROMATIN_ACCESS","goal":"从时空特异/管家诱导阻遏接到DNA甲基化与组蛋白乙酰化改变染色质可及性，建立表达的第一道闸。","closure":"给出组织/阶段表达、CpG甲基化或组蛋白乙酰化变化，能预测转录可及性与表达方向，并不把DNA复制算作基因表达。"},
    {"kp":[3,6],"label":"原核操纵子负/正与衰减调控","cognitive_job":"OPERON_CONTROL","goal":"用lac的阻遏+CAP正调控和trp的阻遏+衰减比较原核如何按营养状态快速控制多顺反子。","closure":"给出乳糖/葡萄糖或色氨酸高低，能预测操纵子表达强弱、发卡结构/终止状态，并区分粗调和衰减精调。"},
    {"kp":[7,10],"label":"真核顺式/反式、PIC与转录后调控","cognitive_job":"EUK_EXPRESSION_LAYERS","goal":"把顺式元件、反式因子、RNApol II前起始复合物接到RNAi/mRNA稳定和蛋白降解，形成真核多层表达控制图。","closure":"给出增强子/TF、TFIID/TFIIH、miRNA/siRNA或泛素蛋白酶体变化，能定位表达调控发生在DNA可及/转录起始/转录后/蛋白稳定哪一层。"}
  ],
  "G5": [
    {"kp":[1,5],"label":"原癌油门、抑癌刹车与生长控制失效","cognitive_job":"TUMOR_CONTROL_FAILURE","goal":"用原癌基因激活四路、癌基因产物信号链与抑癌基因失活/p53停—修—死建立克隆失控的控制模型。","closure":"给出点突变、扩增、易位/强增强子或p53/RB失活，能判断油门变强还是刹车失灵及位于信号链哪一层。"},
    {"kp":[12,13],"label":"突变类型与DNA修复系统","cognitive_job":"MUTATION_REPAIR","goal":"先把点突变/插缺/移码等“异常怎样产生”接到直接、BER/NER、错配、双链断裂和SOS等“怎样修”，完成基因组稳定层。","closure":"给出损伤/突变类型或修复缺陷，能预测编码后果并选择相应修复类别；解释修复失败为何为肿瘤控制失效提供突变底物。"},
    {"kp":[6,11],"label":"重组DNA、PCR、印迹与相互作用技术","cognitive_job":"MOLECULAR_TOOL_MAP","goal":"在知道异常来源后，再用取—切—接—导—筛、PCR、S/N/W和DNA/蛋白相互作用技术建立“怎样检测/复制/操作”的工具地图。","closure":"给出目标是扩增DNA、测RNA/蛋白、构建重组载体、检测DNA-蛋白或蛋白-蛋白相互作用，能选择正确技术并说明它回答什么问题。"}
  ],
  "D21": [
    {"kp":[1,5],"label":"甲状腺激素合成、作用与反馈","cognitive_job":"THYROID_NORMAL_AXIS","goal":"把碘摄取—氧化/有机化—偶联—储存/释放接到T3/T4作用与HPT负反馈。","closure":"给出TSH、碘利用、合成步骤或T3/T4变化，能预测轴上下游方向和主要代谢效应。"},
    {"kp":[6,10],"label":"甲亢定位、Graves与高代谢表现","cognitive_job":"HYPERTHYROID_MODEL","goal":"从甲状腺毒症功能确认接到Graves自身免疫、高代谢/交感表型和器官特异表现。","closure":"给出TSH/FT4、眼征、甲状腺体征或高代谢表现，能判断甲亢/Graves方向并解释症状来源。"},
    {"kp":[11,11],"label":"甲亢检查与病因定位","cognitive_job":"THYROID_EVIDENCE_MAP","goal":"把功能化验、抗体、摄碘/核素与超声等分别定位到“确认功能”或“判断病因/形态”。","closure":"给出一个甲亢病例，能选择下一项最能回答当前问题的检查，并区分高激素但低摄碘等特殊方向。"},
    {"kp":[12,13],"label":"甲亢药物、核素与手术选择","cognitive_job":"HYPERTHYROID_TREATMENT","goal":"按病因、年龄/妊娠、甲状腺大小和复发等轴比较抗甲药、放射碘和手术。","closure":"给出普通Graves、巨大甲状腺/压迫、复发或特殊人群，能选择治疗大方向并识别禁忌边界。"},
    {"kp":[14,14],"label":"甲状腺危象急救序列","cognitive_job":"THYROID_STORM_EMERGENCY","goal":"把甲危识别与阻断合成、释放/外周转化、控制交感和支持治疗组织成急救顺序。","closure":"给出高热、极度心动过速/意识障碍等甲危场景，能按Source顺序给出关键治疗层并解释为何需要多点阻断。"},
    {"kp":[15,15],"label":"特殊甲亢与妊娠边界","cognitive_job":"SPECIAL_THYROID_BOUNDARY","goal":"把妊娠、亚临床/不典型等Source特殊情况与常规甲亢路径分开，防止机械套药物/核素。","closure":"给出妊娠或不典型实验室场景，能指出哪些常规治疗/检查需要调整，并把精确方案限制在Current Source。"},
    {"kp":[16,18],"label":"甲减定位与替代","cognitive_job":"HYPOTHYROID_LOCALIZATION","goal":"用TSH—FT4关系定位原发/继发甲减并接到甲状腺素替代和危重边界。","closure":"给出TSH/FT4组合和低代谢症状，能判断病变层级、替代原则并识别黏液性水肿昏迷等危险。"},
    {"kp":[19,22],"label":"甲状腺肿、结节与炎症","cognitive_job":"THYROID_MORPHOLOGY_DISCRIMINATION","goal":"把弥漫/结节性肿大、甲状腺炎和单个结节按功能、疼痛、质地和影像/穿刺分流。","closure":"给出疼痛、功能状态、结节超声或FNA线索，能区分炎症/良性结节/需要肿瘤评估的方向。"},
    {"kp":[23,25],"label":"四类甲状腺癌与处理","cognitive_job":"THYROID_TUMOR_GATE","goal":"在Tumor Gate下用细胞来源、传播方式和预后比较乳头/滤泡/髓样/未分化癌。","closure":"给出病理来源、淋巴vs血道、降钙素或年龄/侵袭线索，能识别癌型并给出手术/后续治疗大方向。"},
    {"kp":[26,28],"label":"甲状腺外科准备与术后安全","cognitive_job":"THYROID_SURGICAL_SAFETY","goal":"把甲亢术前准备、喉返/喉上神经、甲旁和术后出血/低钙等组织成甲状腺手术安全地图。","closure":"给出术后声音、低钙、颈部肿胀或术前甲亢状态，能定位并发症并指出紧急处理优先级。"},
    {"kp":[29,29],"label":"甲状舌管囊肿识别","cognitive_job":"NECK_REMNANT_RECOGNITION","goal":"把甲状舌管囊肿作为胚胎残余的独立颈部识别点，不并入甲状腺手术安全链。","closure":"给出中线随吞咽/伸舌移动的颈部包块，能识别甲状舌管囊肿方向及其与甲状腺结节的区别。"}
  ],
  "D22": [
    {"kp":[1,4],"label":"肾上腺分区、GC作用与HPA轴","cognitive_job":"ADRENAL_FOUNDATION","goal":"用球—束—网—髓定位激素来源，并把糖皮质激素作用与HPA反馈建立为后续疾病底座。","closure":"给出皮质分区或ACTH/皮质醇变化，能定位来源、预测反馈和主要代谢/应激效应。"},
    {"kp":[5,6],"label":"原醛定位与Liddle鉴别","cognitive_job":"PRIMARY_ALDOSTERONISM","goal":"从容量性高血压+低钾碱中毒接到肾素—醛固酮定位，并与Liddle进行激素/靶通道鉴别。","closure":"给出肾素/醛固酮组合与电解质，能判断原醛、继发性RAAS或Liddle方向并选择进一步定位。"},
    {"kp":[7,9],"label":"嗜铬表现、检查与α→β围术期","cognitive_job":"PHEO_DECISION","goal":"把阵发性儿茶酚胺表型、代谢物检测/影像和术前先α后β原则组织成一个围术病例闭环。","closure":"给出阵发高血压/心悸出汗、检查或拟手术场景，能识别嗜铬并说明为什么不能先单用β阻滞。"},
    {"kp":[10,13],"label":"库欣表型、ACTH定位与治疗","cognitive_job":"CUSHING_LOCALIZATION","goal":"从高皮质醇表型先确认功能，再按ACTH依赖/非依赖与抑制/影像定位病因。","closure":"给出皮质醇/ACTH和动态试验线索，能定位垂体、肾上腺或异位方向并给出治疗大方向。"},
    {"kp":[14,15],"label":"D6反馈轴整合复原","cognitive_job":"ENDOCRINE_AXIS_RECONSTRUCTION","goal":"用肾上腺三个疾病回测D6的“先功能后定位、上下游反馈、抵抗/异位”共同语言。","closure":"面对混合内分泌高血压病例，能先选择功能轴再定位，不被单一血压/低钾表型带偏。"}
  ],
  "D23": [
    {"kp":[1,6],"label":"CT/PTH/钙三醇与骨—肾—肠反馈","cognitive_job":"CALCIUM_HOMEOSTASIS","goal":"把三种钙调节激素在骨、肾、肠的净效应和血钙/血磷反馈连成稳态轴。","closure":"给出低钙/高钙、PTH或VitD变化，能预测骨吸收、肾钙磷与肠吸收方向并解释反馈。"},
    {"kp":[7,9],"label":"甲旁减/亢与系统接口","cognitive_job":"PARATHYROID_DISEASE","goal":"把低钙兴奋性、甲旁亢骨/肾表现与术后/CKD接口组织成疾病定位。","closure":"给出术后低钙、骨痛结石或PTH/钙磷组合，能区分甲旁减/亢及相关系统接口。"},
    {"kp":[10,12],"label":"GH—IGF、生长与代谢","cognitive_job":"GH_IGF_AXIS","goal":"独立建立GH—IGF的生长与代谢作用、分泌调节以及儿童/成人过多过少结局。","closure":"给出年龄、身高/肢端变化或GH/IGF线索，能判断侏儒、巨人/肢端肥大方向并说明GH对糖脂代谢的影响。"}
  ],
  "D9": [
    {"kp":[1,4],"label":"GERD屏障—清除—黏膜机制","cognitive_job":"GERD_MECHANISM","goal":"把LES/膈脚屏障、食管清除和黏膜耐受三层防线组织成反流发生与损伤程度的分工模型。","closure":"给出LES压力下降、清除变慢或黏膜耐受下降之一，能预测它主要增加反流发生还是加重损伤，并说明相同反流量可产生不同炎症。"},
    {"kp":[5,8],"label":"表现、并发症与客观证据","cognitive_job":"RECOGNITION_EVIDENCE","goal":"把典型/食管外症状、并发症与内镜/反流监测/测压分别挂到“损伤证据、反流证据、动力证据”。","closure":"给出烧心、吞咽困难、Barrett或检查结果，能选择最能回答当前诊断问题的证据层并避免用单一阴性内镜排除NERD。"},
    {"kp":[9,10],"label":"抑酸、维持与手术边界","cognitive_job":"TREATMENT_BOUNDARY","goal":"把PPI等抑酸、维持治疗与抗反流手术的进入条件按症状/证据/并发症分层。","closure":"给出典型GERD控制良好、复发依赖药物或结构性/难治反流场景，能判断继续药物、维持或评估手术的大方向。"},
    {"kp":[11,12],"label":"贲门失弛缓与三病分流","cognitive_job":"ACHALASIA_COMPARE","goal":"用“LES关不住”对照“LES打不开”，并与器质性肿瘤性吞咽障碍进行方向性分流。","closure":"给出固液吞咽困难、烧心/反流、鸟嘴征或进行性消瘦等线索，能区分GERD、失弛缓与肿瘤性梗阻并选相应检查。"}
  ],
  "D10": [
    {"kp":[1,5],"label":"胃炎、萎缩/化生与癌前背景","cognitive_job":"MUCOSAL_DEPTH_REMODELING","goal":"用损伤深度和慢性重塑区分急性糜烂、慢性萎缩/化生与深部溃疡，为后续HP/PUD/癌变警报建立黏膜坐标。","closure":"给出急性刺激、自身免疫/萎缩或肠化生线索，能判断主要损伤层、胃酸/内因子后果及其与PUD/胃癌风险的关系。"},
    {"kp":[6,8],"label":"HP致病、检查与根除","cognitive_job":"HP_CAUSAL_EVIDENCE","goal":"把HP定植—炎症—胃酸/黏膜改变接到检测证据和根除策略。","closure":"给出溃疡类型、HP检测或既往用药场景，能选择检测方式、解释假阴性风险并说明为何根除可改变复发。"},
    {"kp":[9,13],"label":"PUD机制、鉴别与并发症地图","cognitive_job":"PUD_DISCRIMINATION","goal":"用侵袭—防御失衡解释GU/DU节律与部位差异，并建立出血/穿孔/梗阻/癌变的并发症地图。","closure":"给出疼痛节律、酸状态或并发症线索，能区分GU/DU方向并指出下一层危险，不把DU误判为癌变来源。"},
    {"kp":[14,16],"label":"UGIB识别与先复苏后内镜","cognitive_job":"UGIB_DECISION","goal":"把出血量/循环状态、活动性证据和“先复苏→内镜→介入/手术”串成急性上消化道出血动作链。","closure":"给出呕血/黑便、血压、Hb/BUN趋势或内镜表现，能判断是否持续出血、先做什么以及何时升级止血。"},
    {"kp":[17,19],"label":"穿孔、梗阻与癌变警报","cognitive_job":"COMPLICATION_DISCRIMINATION","goal":"把PUD的三种非出血出口按腹膜炎、出口阻塞和慢性恶变警报进行分流。","closure":"面对突发板状腹、隔夜宿食/低氯碱中毒或疼痛失节律+消瘦/持续隐血，能分别定位穿孔、幽门梗阻、癌变警报并给出下一步。"},
    {"kp":[20,25],"label":"内科治疗、胃切除与术后并发症","cognitive_job":"ESCALATION_RECONSTRUCTION","goal":"把抑酸/根除/保护黏膜治疗失败或并发症升级到胃切除，继而理解Billroth重建及其特有并发症。","closure":"给出药物可控与否、手术适应、B-I/B-II解剖或术后呕吐/倾倒/输入输出袢表现，能沿“为什么手术—怎么接—哪里出问题”定位。"}
  ],
  "D11": [
    {"kp":[1,3],"label":"共同肿瘤语言与消化道壁深度","cognitive_job":"COMMON_TUMOR_GATE_WALL","goal":"把Tumor Gate的来源/异型/浸润语言接到消化道壁层次，建立器官肿瘤的共同定位坐标。","closure":"给出上皮来源、浸润深度或扩散方式，能判断它改变的是肿瘤身份、T深度还是转移风险，并不重学完整肿瘤总论。"},
    {"kp":[4,8],"label":"食管癌识别—证据—治疗","cognitive_job":"ESOPHAGEAL_CANCER","goal":"从进行性吞咽困难进入食管癌，用部位/病理、钡餐/内镜证据和可切除性形成完整病例闭环。","closure":"给出吞咽症状、肿瘤部位或检查结果，能判断首选确证与治疗大方向，并区分失弛缓等良性动力障碍。"},
    {"kp":[9,13],"label":"胃腺癌身份、形态与扩散","cognitive_job":"GASTRIC_IDENTITY_SPREAD","goal":"把胃癌来源、大体/组织形态与淋巴、腹膜和血道扩散接成“长在哪—怎么长—往哪走”的模型。","closure":"给出病理形态或转移部位，能反推胃癌类型/扩散路径，并识别Virchow、Krukenberg等典型接口。"},
    {"kp":[14,19],"label":"胃癌证据、分期与治疗目标","cognitive_job":"GASTRIC_EVIDENCE_STAGE_TREATMENT","goal":"把症状/内镜病理、影像分期与可切除性/手术范围放在同一个治疗目标框架里。","closure":"给出早晚期证据、壁深/淋巴/远处转移，能判断是否可根治切除、需何种手术或进入姑息/系统治疗边界。"},
    {"kp":[20,21],"label":"胃淋巴瘤与GIST","cognitive_job":"NON_EPITHELIAL_COMPARE","goal":"把胃淋巴瘤和GIST作为非典型胃上皮癌的来源—标志—治疗比较岛。","closure":"给出淋巴样病理/CD标志或间质瘤/c-KIT等线索，能区别二者及与胃腺癌的治疗逻辑。"},
    {"kp":[22,24],"label":"上消化道肿瘤整合分流","cognitive_job":"INTEGRATED_TUMOR_DECISION","goal":"把食管癌、胃腺癌、淋巴瘤和GIST压回“来源—壁深—扩散—证据—可切除性”统一决策轴。","closure":"面对一个未标明病名的上消化道肿块病例，能按五轴完成身份与下一步分流，而不是靠单一症状猜病。"}
  ],
  "D12": [
    {"kp":[1,5],"label":"肠结核器官模型","cognitive_job":"INTESTINAL_TB","goal":"把结核共同病理放到回盲部等肠道位置，接上溃疡方向、症状、证据与治疗/手术边界。","closure":"给出低热腹痛、回盲部病变、横行溃疡或肉芽肿等线索，能判断肠结核方向、选择证据并识别何时需要手术。"},
    {"kp":[6,8],"label":"结核性腹膜炎与腹水证据","cognitive_job":"TB_PERITONITIS","goal":"把结核感染放入腹膜空间，用腹水性质、腹膜/肠粘连和分型完成定位。","closure":"给出慢性腹水、腹膜增厚/粘连或ADA等Source线索，能与肝硬化腹水、癌性腹水等方向区分。"},
    {"kp":[9,12],"label":"IBD共同底座与Crohn","cognitive_job":"IBD_CROHN","goal":"建立慢性免疫性肠炎共同底座并用节段、全层、纵行裂隙/瘘等特征形成Crohn模型。","closure":"给出病变分布、深度或并发症，能判断是否符合Crohn并解释狭窄/瘘等为何来自全层炎症。"},
    {"kp":[13,17],"label":"UC、CD鉴别与并发症","cognitive_job":"UC_CD_DISCRIMINATION","goal":"在同一轴上比较UC与CD的部位、连续性、深度、粪便表现及癌变/中毒性巨结肠/瘘等并发症。","closure":"给出结肠镜/病理/并发症线索，能在UC/CD间做出有理由的判断，并预测典型危险出口。"},
    {"kp":[18,21],"label":"IBD诱导/维持治疗","cognitive_job":"IBD_TREATMENT","goal":"把治疗按诱导缓解、维持缓解和重症/手术升级分层，而不是背药名清单。","closure":"给出轻中重活动度、激素反应或并发症，能判断诱导与维持策略是否相同以及何时需生物制剂/手术。"},
    {"kp":[22,23],"label":"IBS识别与按主症状治疗","cognitive_job":"IBS_FUNCTIONAL","goal":"把IBS定位为无器质性炎症证据的肠—脑互动/功能性疾病，并按腹泻/便秘/疼痛主症状管理。","closure":"给出长期腹痛伴排便改变但缺乏报警征象的病例，能与IBD/结核分流并选择症状导向处理。"}
  ],
  "D13": [
    {"kp":[1,6],"label":"腹膜感染、液体身份与源控制","cognitive_job":"PERITONEAL_SOURCE_CONTROL","goal":"用腹膜神经/功能、感染来源与穿刺液身份把急腹症先定位为污染/感染，再决定源控制。","closure":"给出腹痛定位、腹膜刺激征、腹水/穿刺液或脓肿位置，能判断感染类型与是否需引流/手术源控制。"},
    {"kp":[7,9],"label":"腹部损伤出血/污染底座","cognitive_job":"TRAUMA_BLEED_CONTAMINATION","goal":"把腹部损伤先按开放/闭合、实质脏器出血与空腔脏器污染两条危险轴组织。","closure":"给出休克、腹膜刺激、穿透伤或影像线索，能判断主要威胁是出血还是污染，并决定复苏/探查优先级。"},
    {"kp":[10,13],"label":"脾肝小肠胰结直肠损伤","cognitive_job":"ORGAN_TRAUMA_LOCALIZATION","goal":"用器官位置、血供与内容物性质比较实质/空腔/腹膜后脏器损伤的表现与处理差异。","closure":"给出损伤机制、腹腔液体或特异影像/体征，能定位主要受伤器官并判断保守、修补、切除等大方向。"},
    {"kp":[14,16],"label":"检查—探查—急腹症动作算法","cognitive_job":"SURGICAL_ACTION_ALGORITHM","goal":"把血流动力学稳定性、FAST/CT/穿刺与剖腹探查指征串成急腹症动作顺序。","closure":"面对稳定或不稳定创伤患者，能选择下一项检查/直接探查，并说明为什么诊断完整性必须让位于生命威胁控制。"}
  ],
  "D14": [
    {"kp":[1,5],"label":"肠梗阻分类、部位与时相","cognitive_job":"OBSTRUCTION_LOCALIZATION","goal":"按机械/动力、单纯/绞窄、高/低位及完全性等轴把“痛吐胀闭”还原为阻塞位置和时相。","closure":"给出呕吐早晚、腹胀、排气排便、肠鸣或影像线索，能判断梗阻类型/部位并预测水电解质后果。"},
    {"kp":[6,11],"label":"闭袢/绞窄血运风险与手术门槛","cognitive_job":"STRANGULATION_DECISION","goal":"把闭袢、肠壁缺血、坏死/穿孔与持续痛、腹膜征、血性液等危险线索接到急诊手术门槛。","closure":"面对梗阻病例，能识别绞窄信号并说明为什么此时不能继续单纯保守减压观察。"},
    {"kp":[12,16],"label":"阑尾炎主链、体征与手术","cognitive_job":"APPENDICITIS_CORE","goal":"从管腔阻塞/感染到脐周痛转右下腹、局部体征和手术形成标准阑尾炎模型。","closure":"给出疼痛迁移、McBurney等体征或实验室线索，能识别典型阑尾炎并说明手术时机。"},
    {"kp":[17,20],"label":"阑尾并发症与例外出口","cognitive_job":"APPENDIX_EXCEPTION_MAP","goal":"把脓肿/穿孔、术后并发症、特殊人群和低频肿瘤当作“标准阑尾炎路径之外”的例外地图。","closure":"给出包块、妊娠/老年、术后发热或病理异常等线索，能指出为什么不能机械套标准急诊阑尾切除路径。"},
    {"kp":[21,24],"label":"腹股沟空间、疝身份与嵌顿","cognitive_job":"HERNIA_SPACE_IDENTITY","goal":"用腹股沟管、内环/直疝三角等空间关系区分斜疝、直疝及嵌顿/绞窄状态。","closure":"给出包块与腹壁关系、是否可回纳或疼痛/肠梗阻，能判断疝类型和是否进入急症。"},
    {"kp":[25,28],"label":"疝复位/手术、鉴别与边界","cognitive_job":"HERNIA_REPAIR_BOUNDARY","goal":"把是否可手法复位、复位禁忌、修补方式与股疝等鉴别接到安全决策。","closure":"面对嵌顿时间、绞窄怀疑或不同腹股沟包块，能判断能否复位、需何种手术大方向并识别危险边界。"}
  ],
  "D15": [
    {"kp":[1,3],"label":"结直肠癌共同入口、扩散与检查","cognitive_job":"CRC_ENTRY_EVIDENCE","goal":"从排便改变/便血/贫血等入口接到肿瘤扩散和肠镜病理等确证证据。","closure":"给出右下腹不适、便血/贫血或排便习惯改变，能识别结直肠癌警报、选择确证检查并说清主要扩散路径。"},
    {"kp":[4,4],"label":"结直肠围术期肠道准备边界","cognitive_job":"PERIOPERATIVE_PREP_BOUNDARY","goal":"把Source支持的肠道准备放在围术期技术边界中，避免它混入肿瘤诊断主链。","closure":"能说清该知识点回答“手术前如何准备”而非“如何诊断/分期癌”，并按Current Source记忆必要操作，不向现代ERAS扩写。"},
    {"kp":[5,7],"label":"左右结肠癌与切除决策","cognitive_job":"COLON_SIDE_SURGERY","goal":"用右侧贫血/肿块与左侧梗阻/排便改变差异接到按血供和肠段选择切除范围。","closure":"给出肿瘤所在结肠段和症状，能判断左右侧表现倾向及对应根治切除大方向。"},
    {"kp":[8,12],"label":"直肠癌括约肌/距离与术式","cognitive_job":"RECTAL_SPHINCTER_DECISION","goal":"把肿瘤距肛缘、浸润、括约肌/肛提肌安全与保肛/造口术式放在同一空间决策。","closure":"给出直肠肿瘤高度和局部侵犯，能判断能否保肛、需何种术式/造口，并解释决定因素不是单一距离数字。"},
    {"kp":[13,13],"label":"癌前通路与分子岛","cognitive_job":"PREMALIGNANT_MOLECULAR_ISLAND","goal":"把腺瘤—癌序列、IBD风险及APC/KRAS/p53/MMR等Source分子接口组织成癌前风险岛。","closure":"给出息肉/遗传或炎症背景，能判断其癌变风险方向与相关分子接口；完整分子机制仍回Tumor Gate。"},
    {"kp":[14,14],"label":"齿状线坐标","cognitive_job":"DENTATE_LINE_COORDINATE","goal":"把齿状线上下的上皮、血供、淋巴和神经差异建立成肛管疾病定位坐标。","closure":"给出病变位于齿状线上/下，能预测疼痛、静脉/淋巴回流和组织来源差异，为后续痔/肛裂/癌定位提供坐标。"},
    {"kp":[15,19],"label":"痔、肛裂、脓肿、肛瘘定位","cognitive_job":"ANORECTAL_DISCRIMINATION","goal":"用疼痛、出血、肿块、脓液和直肠指检把常见肛周疾病进行症状—空间分流。","closure":"给出便后鲜血、剧痛、波动肿块或反复流脓等场景，能区分痔/肛裂/脓肿/肛瘘并判断处理大方向。"}
  ],
  "M10": [
    {"kp":[1,4],"label":"血红素合成与含铁卟啉入口","cognitive_job":"HEME_SYNTHESIS","goal":"把甘氨酸+琥珀酰CoA、线粒体/胞浆往返与铁插入组织成血红素合成主链。","closure":"给出B6、铅或关键步骤受阻，能预测血红素合成方向并连接RBC/细胞色素接口。"},
    {"kp":[5,9],"label":"UCB→CB→肠道与三类黄疸","cognitive_job":"BILIRUBIN_LOCALIZATION","goal":"从血红素分解形成UCB、白蛋白运肝、UGT结合CB、胆道排肠接到溶血/肝细胞/梗阻三类黄疸。","closure":"给出血/尿胆红素、尿胆原和胆道通畅性，能定位故障在生成、肝处理还是排出，并解释UCB/CB性质差异。"},
    {"kp":[10,13],"label":"Ⅰ相/Ⅱ相生物转化","cognitive_job":"BIOTRANSFORMATION_PHASE_MAP","goal":"把CYP等Ⅰ相引入/暴露官能团与Ⅱ相结合增水溶性组织成肝脏处理外源/内源物的两阶段图。","closure":"给出一种药物/激素处理或结合供体，能判断属于Ⅰ相还是Ⅱ相及对水溶性/排泄的方向；不扩写完整药物相互作用。"}
  ],
  "D16": [
    {"kp":[1,5],"label":"肝炎共同病理语言","cognitive_job":"HEPATITIS_PATHOLOGY","goal":"把肝细胞变性/凋亡、点—界—桥—块坏死与炎症、再生、纤维化组织成病毒性肝炎共同病理坐标。","closure":"给出坏死范围和位置，能判断支架破坏与再生/纤维化倾向，并解释桥接坏死为什么把学习自然推进到肝硬化。"},
    {"kp":[6,8],"label":"急性、慢性与重型形态","cognitive_job":"CLINICOPATHOLOGIC_FORM","goal":"用坏死范围、网状支架、再生和纤维化四轴区分急性普通、慢性轻重、急/亚急性重型。","closure":"给出病理形态，能判病型与主要结局；尤其能区分急重“来不及修复”与亚急重“已出现再生/纤维化”。"},
    {"kp":[9,12],"label":"HAV/HBV/HCV/HDV/HEV/EBV快速比较","cognitive_job":"VIRUS_COMPARE","goal":"按传播/依赖、慢性化和高价值病理特殊比较常见肝炎病毒。","closure":"给出毛玻璃/砂粒核、脂肪变+淋巴滤泡、妊娠重症或HBV依赖等线索，能定位病毒并说清慢性化风险。"}
  ],
  "D17": [
    {"kp":[1,5],"label":"肝硬化结构重建与肝功减退","cognitive_job":"CIRRHOSIS_RECONSTRUCTION","goal":"把坏死—支架破坏—结节再生—纤维隔接成假小叶重构，并从结构异常推出合成/代谢功能减退。","closure":"给出白蛋白、凝血、胆红素或假小叶形态，能解释它属于肝细胞功能轴还是结构重建轴，并连回D16。"},
    {"kp":[6,12],"label":"门脉高压、侧支与腹水","cognitive_job":"PORTAL_ASCITES","goal":"把门静脉阻力、侧支循环和腹水的静水压/低白蛋白/水钠潴留/有效循环量恶循环整合。","closure":"给出脾大、侧支、SAAG、腹水或利尿场景，能解释门压与有效循环量并选择腹水处理层级。"},
    {"kp":[13,18],"label":"曲张出血、SBP、HRS、HPS、PVT","cognitive_job":"CIRRHOSIS_COMPLICATIONS","goal":"用门脉高压与有效循环不足两个母轴定位出血、感染、功能性肾衰、低氧和门静脉血栓等并发症。","closure":"给出呕血、发热PMN腹水、少尿低尿钠、低氧或血性腹水/脾骤大，能在并发症间分流并指出急性优先动作。"},
    {"kp":[19,19],"label":"胆石与营养接口","cognitive_job":"CONNECTION_BOUNDARY","goal":"保留肝硬化易胆石与分期蛋白/EN支持两个跨模型接口，不伪装成单一因果链。","closure":"能分别回答“为什么肝硬化更易成石”和“代偿/失代偿/HE时营养蛋白原则如何变”，并明确两者只是同一KP内的连接岛。"},
    {"kp":[20,24],"label":"肝性脑病机制、分期与治疗","cognitive_job":"HEPATIC_ENCEPHALOPATHY","goal":"从氮负荷/门体分流与肝解毒失败接到氨中毒、脑能量/谷氨酰胺改变，再到诱因、分期和降氨/去诱因治疗。","closure":"给出消化道出血、低钾碱中毒、意识改变或血氨相关线索，能识别诱因、解释机制并按先去诱因再降低氮负荷/吸收的原则处理。"}
  ],
  "D18": [
    {"kp":[1,7],"label":"HCC病因、形态、扩散与临床","cognitive_job":"HCC_IDENTITY_SPREAD","goal":"把慢性肝病背景、HCC/ICC来源、病理血供与门静脉早期播散接到典型临床入口。","closure":"给出HBV/HCV/肝硬化、病理形态、门静脉癌栓或肝区痛/肝大等线索，能判断HCC身份并解释其早期肝内播散。"},
    {"kp":[8,11],"label":"AFP、影像与确诊证据","cognitive_job":"HCC_EVIDENCE","goal":"把AFP趋势、B超筛查、增强CT/MRI快进快出和病理证据分层，形成HCC证据链。","closure":"给出AFP/ALT趋势或影像模式，能判断何时更支持HCC、何时仍需补充证据，并不把单一AFP阳性当确诊。"},
    {"kp":[12,14],"label":"可切除性、治疗层级与破裂急救","cognitive_job":"HCC_TREATMENT_EMERGENCY","goal":"用肿瘤范围×肝储备×血管/转移决定切除、TACE/消融/移植等，并单独处理破裂出血的先止血逻辑。","closure":"给出Child/剩余肝、血管侵犯/转移或破裂休克，能判断是否可切除、替代治疗层级或先TAE/TACE/复苏止血。"},
    {"kp":[15,15],"label":"肝占位影像比较","cognitive_job":"LIVER_LESION_IMAGING_COMPARE","goal":"把HCC、转移瘤、血管瘤、囊肿和肝脓肿的典型Source影像放在一个纯比较坐标中。","closure":"给出快进快出、牛眼、灯泡、无强化或环形强化，能提出最匹配病变并说明还需结合肝病/感染/标志物证据。"}
  ],
  "D19": [
    {"kp":[1,3],"label":"胆道基础管道、胆汁Recall与结石身份","cognitive_job":"BILIARY_FOUNDATION","goal":"先建立胆囊/胆总管/共同出口的管道坐标，Recall胆汁作用，再按成分/部位理解胆石。","closure":"给出一个阻塞点或结石类型，能画出上游扩张方向、胆囊是否受累的基本条件，并区分胆固醇/混合/色素结石。"},
    {"kp":[4,6],"label":"影像—减压—T管程序","cognitive_job":"BILIARY_PROCEDURE_MAP","goal":"把B超/MRCP/ERCP/PTC的角色与胆总管探查、T管减压—造影—夹管—拔管放成程序地图。","closure":"给出疑似胆道梗阻或术后T管场景，能选择无创成像/侵入性诊疗工具并按安全顺序处理T管，不把MRCP当治疗。"},
    {"kp":[7,12],"label":"胆囊结石、炎症与息肉","cognitive_job":"GALLBLADDER_BENIGN_INFLAMMATORY","goal":"从胆绞痛、Mirizzi和胆囊炎接到有症状结石手术、无石性胆囊炎与息肉风险，形成胆囊良性/炎症主线。","closure":"给出阵发痛、Murphy、重症无石背景或息肉特征，能区分疾病并判断观察、LC或急性控制的大方向；不调用Tumor Gate。"},
    {"kp":[13,13],"label":"胆囊癌","cognitive_job":"GALLBLADDER_CANCER_TUMOR_GATE","goal":"在Tumor Gate已存在时，单独学习胆囊癌的来源、隐匿性、黄疸/胆囊表现和可切除性。","closure":"给出胆囊壁/肿块、晚期黄疸或高风险胆囊病背景，能识别胆囊癌方向并说明切除范围取决于侵犯，而不反向污染良性胆囊LG。"},
    {"kp":[14,16],"label":"肝内/肝外胆管结石与AOSC","cognitive_job":"BILE_DUCT_STONE_EMERGENCY","goal":"把肝内局部结石与肝外移动梗阻比较，并从Charcot升级到Reynolds/AOSC的感染+梗阻急症。","closure":"给出黄疸波动、寒战高热、休克/精神改变或肝内局限病变，能定位结石层级并在AOSC时优先减压引流+抗感染。"},
    {"kp":[17,17],"label":"胆管癌","cognitive_job":"CHOLANGIOCARCINOMA_TUMOR_GATE","goal":"在Tumor Gate下用上/中/下段位置解释进行性黄疸、胆囊大小和术式差异。","closure":"给出进行性无痛黄疸、胆囊状态或肿瘤位置，能定位胆管癌段位并选择切除/重建或引流大方向。"},
    {"kp":[18,18],"label":"胆道出血","cognitive_job":"HEMOBILIA_EMERGENCY","goal":"把胆绞痛+黄疸+上消化道出血识别为胆道出血，并突出血管造影/栓塞优先。","closure":"给出创伤/操作后消化道出血伴胆道症状，能识别hemobilia并选择介入定位止血，而非按普通PUD出血处理。"},
    {"kp":[19,22],"label":"蛔虫、闭锁、扩张与黄疸定位","cognitive_job":"RARE_CONGENITAL_LOCALIZATION","goal":"把移动性寄生虫梗阻、先天输出闭锁、无明确梗阻点的胆管扩张和黄疸×胆囊大小矩阵放在异常管道定位地图。","closure":"给出钻顶样痛、新生儿持续黄疸、先天扩张或不同胆囊大小，能按阻塞位置/通畅性解释而不是背病名孤岛。"},
    {"kp":[23,26],"label":"肝脓肿来源、证据、引流与鉴别","cognitive_job":"LIVER_ABSCESS","goal":"从胆道/门静脉等感染来源接到寒战高热肝区痛、B超/CT/穿刺证据与抗菌±引流，并比较阿米巴性。","closure":"给出发热肝区痛、影像和脓液/来源线索，能判断细菌性脓肿、选择抗菌/引流并与阿米巴脓肿区分。"}
  ],
  "D20": [
    {"kp":[1,4],"label":"急性胰腺炎机制、病因与严重度","cognitive_job":"PANCREATITIS_MECHANISM","goal":"从胰蛋白酶提前激活接到多酶自我消化、凝固性/脂肪坏死，再用病因和器官衰竭时长定义严重度。","closure":"给出胆石/酒精等病因、坏死类型或器官衰竭持续时间，能解释疾病机制并判断严重度层级。"},
    {"kp":[5,9],"label":"临床、局部集合与器官并发","cognitive_job":"PANCREATITIS_COMPLICATIONS","goal":"把典型腹痛/重症体征接到APFC/假囊/ANC/WON及感染性坏死、ACS和全身器官衰竭。","closure":"给出病程时间、集合内容/包膜、发热气泡或IAP/器官衰竭，能命名局部并发并判断是否需要干预。"},
    {"kp":[10,12],"label":"胰酶、影像与预后证据","cognitive_job":"PANCREATITIS_EVIDENCE","goal":"区分胰酶诊断时间窗、影像找病因/坏死与炎症/器官功能指标评价严重度。","closure":"给出发病时间和淀粉酶/脂肪酶、B超/CT或BUN/CRP等，能选择证据并说明胰酶高度不等于严重度。"},
    {"kp":[13,15],"label":"支持治疗、介入门槛与慢性胰腺炎","cognitive_job":"PANCREAS_TREATMENT_BOUNDARY","goal":"把急性期支持/肠屏障、明确梗阻/感染等介入门槛与慢胰的长期外分泌不足作为治疗边界层。","closure":"给出无菌重症、胆总管嵌顿、感染坏死、症状性集合或慢性钙化脂肪泻，能判断何时支持、何时介入及何时进入胰酶替代。"},
    {"kp":[16,19],"label":"胰腺癌识别、可切除性与手术","cognitive_job":"PANCREATIC_CANCER_TUMOR_GATE","goal":"在Tumor Gate下把胰头导管癌的隐痛→进行性梗阻黄疸接到CT可切除性和Whipple/远端切除。","closure":"给出进行性黄疸、Courvoisier、CA19-9/CT血管侵犯或肿瘤部位，能判断胰腺癌方向与可切除/减黄/手术大方向。"},
    {"kp":[20,22],"label":"胰岛素瘤、胃泌素瘤与APUD","cognitive_job":"FUNCTIONAL_ISLET_TUMORS","goal":"用激素过量表型区分胰岛素瘤、胃泌素瘤及其它胰腺神经内分泌肿瘤，并以侵犯/转移判断良恶。","closure":"给出空腹低血糖Whipple三联征或顽固溃疡+腹泻/高胃泌素，能定位肿瘤类型、相应试验和治疗方向。"}
  ]
};

const stopLines = {
  D1:'只建立正常胃肠管道的平滑肌—慢波—ENS—自主神经—Ca²⁺执行底座；GERD/失弛缓/IBS/梗阻等只作机制验证，完整疾病回D9/D12/D14；器官运动/分泌在D2–D3，完整药理不展开。',
  D2:'只完成口腔—食管—胃的正常推进、LES、储存排空、胃液/胃酸和黏膜防御；GERD/失弛缓、胃炎/PUD/胃癌等完整诊疗回D9–D11；不补完整吞咽三期或药理。',
  D3:'只完成胰液/酶原、胆汁胆盐、肠激素和肠运动的正常消化模型；吸收运输归D4，胆红素/胆汁酸合成归M10/M6，胆石/胰腺炎/肿瘤完整临床归D19–D20。',
  D4:'只完成营养物跨小肠上皮、门静脉/淋巴分流及B12/铁/钙特殊门槛；完整贫血、PTH/钙磷、IBD/肠结核、短肠营养与外科营养后置相应owner。',
  D5:'只完成能量测量、体温调节、应激代谢与Current支持的EN/PN选择；具体糖脂氮通路只Recall M2/M4/M7/M8，甲状腺/肾上腺/糖尿病完整疾病归D21–D23/D8，完整重症营养/ERAS不扩写。',
  D6:'只建立内分泌共同语言：分泌方式、轴、反馈、化学类别/受体和功能—定位算法；甲状腺/肾上腺/PTH/GH等具体疾病与动态试验细节归D21–D23，生殖轴归后续系统，完整药理不展开。',
  D7:'只建立正常胰岛A/B/D细胞、胰岛素/胰高血糖素及进食—空腹切换；糖脂氮具体通路只Recall M2–M8，糖尿病/DKA/HHS及降糖药完整模型归D8。',
  D8:'完整拥有糖尿病分型、急性危象、慢性并发症、诊断/功能评估与Current降糖治疗；D7正常胰岛和M2–M8代谢只Recall；心肾神经等并发症的邻接系统完整疾病不在这里重复。',
  D9:'只完成GERD/失弛缓的器官特异机制、证据与Current治疗边界；D2正常LES只Recall，Barrett/器官肿瘤完整模型在D11/Tumor Gate，药理和外部指南不扩写。',
  D10:'完整拥有胃炎、HP、PUD、UGIB、穿孔/幽门梗阻及胃切除/术后并发症；D2胃酸/屏障只Recall，胃癌主体归D11，肝硬化曲张出血归D17；PPI/HP/术式按Current Source，不用外部指南替换。',
  D11:'只学习食管/胃器官特异肿瘤来源、壁深、扩散、证据和Current治疗；Tumor Gate只Recall，不重造总论；GERD/PUD前癌接口回D9/D10；现代系统治疗/完整分子分型不扩写。',
  D12:'完整拥有肠结核、结核性腹膜炎、IBD和IBS器官模型；TB共同免疫病理Recall呼吸R7，D1–D4正常肠道只Recall；完整肿瘤/外科梗阻/腹部损伤分别归D15/D14/D13。',
  D13:'只完成腹膜感染/脓肿、腹部损伤、穿刺/影像与源控制/探查共同外科模型；D12结核性腹膜炎、D14梗阻阑尾、D16–D20肝胆胰急腹症只作接口；休克等Recall邻接系统。',
  D14:'只完成肠梗阻/绞窄、阑尾炎及腹外疝的Current外科决策；D1运动和D13腹膜/源控制只Recall，结直肠癌梗阻回D15；不扩写围术期通用管理。',
  D15:'完整拥有结直肠癌、直肠保肛/造口、齿状线和常见肛周疾病；Tumor Gate与D12/D14只Recall；围术准备仅保留Current Source边界，不扩现代ERAS或完整遗传肿瘤学。',
  D16:'只完成病毒性肝炎病理形态、病型和病毒特征；M10胆红素只作接口，完整肝炎临床抗病毒/血清学组合不补写；肝硬化/HCC分别归D17/D18。',
  D17:'完整拥有肝硬化、门脉高压/腹水、主要并发症和HE；D16病理、M8氮、M10胆红素及外部修复/门压接口只Recall；HCC、胆道病分别归D18/D19，外部最新TIPS/肝病指南不替换Current。',
  D18:'只学习HCC器官特异身份、证据、肝储备×肿瘤范围治疗和肝占位影像比较；D16/D17背景与Tumor Gate只Recall；完整现代系统治疗/外部分期指南不扩写。',
  D19:'只完成胆汁管道、黄疸定位、胆石/感染/先天异常、胆道肿瘤和肝脓肿的Current外科决策；M6胆汁酸/M10胆红素不重复Primary；Tumor Gate仅在胆囊癌/胆管癌LG激活，胰腺病归D20。',
  D20:'完整拥有急/慢性胰腺炎及胰腺导管癌/功能性胰岛肿瘤的Current模型；D3/M1/M7/D19只Recall；Tumor Gate仅在KP16–22肿瘤组激活；不扩外部重症评分和现代神经内分泌肿瘤指南。',
  D21:'完整拥有甲状腺正常轴、甲亢/甲减、结节炎症、癌和外科安全；D6共同语言和代谢接口只Recall，Tumor Gate仅癌组调用；PTH主体归D23，外部甲状腺指南不替换Current。',
  D22:'完整拥有GC生理、原醛、嗜铬和库欣；D6轴语言、循环/泌尿及M6/M8前体接口只Recall；不扩生殖类固醇、完整药理或外部内分泌指南。',
  D23:'只完成CT/PTH/钙三醇稳态、甲旁疾病和GH–IGF轴；D6共同语言、D21甲状腺/外科接口和泌尿VitD/CKD-MBD只Recall；不把GH硬并入钙磷因果链。',
  M1:'只建立蛋白结构—酶学—维生素/辅因子共同语言；GSH–NADPH归M3，一碳/氨基酸/尿素归M8，完整疾病/药理/长维生素缺乏表后置；原图动力学/维生素图回MarginNote。',
  M2:'只建立糖酵解→PDH→TCA→呼吸链/ATP主干及故障定位；RBC/PPP归M3，糖原/糖异生归M4，脂肪酸/酮体归M7；低频抑制剂长表/线粒体病不扩写。',
  M3:'只建立成熟RBC供能、2,3-DPG和PPP–NADPH–GSH抗氧化；糖酵解/TCA回M2，糖原回M4，G6PD缺陷完整临床回血液系统，核苷酸/一碳分别归M9/M8。',
  M4:'只建立糖原存取、糖异生/Cori及空腹血糖来源切换；胰岛素/胰高血糖素完整生理归D7，糖尿病归D8，脂肪/氨基酸碳骨架分别归M7/M8。',
  M5:'只建立CM/VLDL/LDL/HDL运输、apo/酶/受体共同语言；胆固醇合成/胆汁酸归M6，TAG/脂解/β氧化归M7，高脂血症完整诊疗和降脂药不在Current Source扩写。',
  M6:'只建立胆固醇合成/去路、胆汁酸和甘油磷脂；胆石临床归D19，PTH/VitD归D23，肾上腺类固醇归D22；完整降脂药/罕见脂质病不扩写。',
  M7:'只建立TAG/FA合成、脂解、肉碱/β氧化、酮体和必需脂肪酸接口；胰岛素/胰高血糖素全身控制归D7，DKA临床归D8，完整遗传脂氧化病/药理不展开。',
  M8:'只建立氨基酸身份/衍生物、氮转运/尿素与一碳；HE完整临床归D17，巨幼贫血归血液，肾泌氨归泌尿；罕见遗传氨基酸病和低频名单不展开。',
  M9:'只建立嘌呤/嘧啶供给、补救/分解、脱氧/dTMP和抗代谢物靶点；DNA/RNA结构/复制表达归G1–G5，痛风/白血病等完整疾病归对应系统，不扩药代/方案。',
  M10:'只建立血红素、UCB→CB→肠道/黄疸定位及Ⅰ/Ⅱ相生物转化；完整溶血归血液，肝炎/肝硬化归D16–D17，胆道梗阻归D19；CYP亚型/药物相互作用长表不展开。',
  G1:'只建立核酸身份、方向/结构、包装、变复性、RNA角色与真核基因组组织；核苷酸代谢Recall M9；复制、表达/调控、损伤/肿瘤分别归G2/G3–G4/G5，完整基因组学不扩写。',
  G2:'只建立DNA复制、端粒和逆转录；DNA结构Recall G1，完整修复归G5，转录/RNA加工归G3，PCR/重组归G5；聚合酶亚型长表和不确定原图细节不冻结。',
  G3:'只建立转录、RNA加工/质控、翻译、蛋白成熟/靶向；核酸/密码子Recall G1，复制Recall G2，表达调控归G4，完整抗菌药理/错误折叠疾病不扩写。',
  G4:'只建立表达特异、染色质可及、原核操纵子、真核顺式/反式/PIC与转录后调控；中心法则执行Recall G3，癌基因异常表达归G5；完整表观遗传/非编码RNA学不扩写。',
  G5:'先学原癌/抑癌控制，再学突变/修复，最后学重组/PCR/印迹/相互作用工具；病理肿瘤形态行为必须再过O9，器官TNM/治疗归器官Block；现代分子分型/肿瘤药理不扩写。'
};

const recallSpine = {
  D1:'平滑肌底座 → ICC慢波 → 机械阈/电阈 → ENS局部控制 → 自主神经改档 → Ca²⁺—CaM—MLCK执行',
  D2:'唾液/LES入口 → 胃容纳与排空 → 胃液细胞地图 → ACh/胃泌素/组胺促酸 → 黏膜防御',
  D3:'酸性食糜 → Secretin/HCO₃⁻ → CCK/胰酶/胆囊 → 胆盐脂肪处理 → 肠运动 → 激素/故障定位',
  D4:'小肠吸收界面 → 门静脉vs淋巴 → B12/长链脂质特殊接力 → 糖/肽 → 铁/钙门槛',
  D5:'ATP/热/功 → 能量测量/BMR → 产热散热 → 调定点/发热vs中暑 → 应激分解 → EN优先/PN边界',
  D6:'分泌语言 → 下丘脑—垂体—靶腺 → 调节/反馈 → 化学类别/受体 → 功能确认 → 原发/继发/抵抗定位',
  D7:'胰岛素信号/储存 → B细胞葡萄糖感知/KATP → 分泌修饰网络 → 胰高血糖素 → 进食/空腹/应激切换',
  D8:'胰岛素不足/抵抗 → 高血糖+脂解/渗透性利尿 → DKA vs HHS危象分流 → 长期微血管/大血管损伤 → 证据定位 → 按主导风险选择生活/药物/胰岛素',
  D9:'LES屏障/清除/黏膜 → GERD表现/并发 → 客观证据 → 抑酸/维持/手术 → 失弛缓对照',
  D10:'胃黏膜损伤/萎缩 → HP → PUD → UGIB先复苏 → 穿孔/梗阻/癌变警报 → 药物失败后胃切除/重建并发症',
  D11:'共同Tumor Gate → 来源/壁深/部位 → 局部症状与扩散路径 → 内镜/病理/影像证据 → 分期/可切除性 → 器官特异治疗；食管/胃/GIST/淋巴瘤作为同坐标分支',
  D12:'慢性腹痛/腹泻/腹水 → 感染(TB) vs 免疫炎症(IBD) vs 功能(IBS) → 分布/组织/肠外证据 → 并发症危险 → 抗感染/诱导维持/症状治疗',
  D13:'腹膜感染/液体源 → 损伤出血vs污染 → 器官特异损伤 → 稳定性决定检查/探查/源控制',
  D14:'腹痛/呕吐/腹股沟包块 → 管腔梗阻 vs 局部炎症(阑尾) vs 腹壁出口(疝) → 血运/腹膜炎危险 → 定位证据 → 减压/复位/切除/引流',
  D15:'排便改变/便血/肛周症状 → 右结肠/左结肠/直肠/齿状线定位 → 证据与扩散 → 可切除/保肛/造口 → 肛周痛—血—脓—条索分流',
  D16:'肝细胞损伤/坏死层级 → 再生/纤维化 → 急性/慢性/重型形态 → 病毒特征比较',
  D17:'假小叶重构 → 肝功减退 + 门脉高压/腹水 → 曲张/SBP/HRS/HPS/PVT → 胆石/营养接口 → HE',
  D18:'慢性肝病背景 → HCC身份/门静脉播散 → AFP/增强影像/确证 → 肝储备×肿瘤范围治疗/破裂 → 肝占位影像比较',
  D19:'疼痛+黄疸+发热+胆囊/上游扩张 → 定位胆囊/肝内/肝外/远端出口 → 结石/炎症/肿瘤/先天分流 → B超/MRCP/ERCP/PTC证据 → 感染梗阻先减压，随后取石/切除/重建',
  D20:'上腹痛/黄疸/低糖/顽固溃疡 → 酶原提前激活自我消化 vs 导管肿块梗阻 vs 内分泌过度分泌 → 坏死/器衰或肿瘤证据 → 支持/引流/切除',
  D21:'TSH–FT4功能轴+结构/疼痛 → 甲亢/甲减/结节炎症/肿瘤定位 → 病因证据 → 常规治疗 vs 甲危急救 vs 外科安全 → 妊娠/颈部残余边界',
  D22:'高血压低钾/阵发交感/库欣表型 → 盐皮质/儿茶酚胺/糖皮质激素过多 → 激素确认 → 肾素/ACTH反馈定位 → 动态试验/影像 → α先行或病因治疗',
  D23:'CT/PTH/钙三醇骨—肾—肠稳态 → 甲旁减/亢 → GH—IGF平行生长/代谢轴',
  M1:'序列/结构/折叠 → 蛋白理化评价/分离 → 酶机制/通量控制 → 动力学/抑制 → 辅因子/维生素',
  M2:'葡萄糖 → 糖酵解/丙酮酸 → 乳酸再生NAD⁺或PDH→乙酰CoA → TCA还原当量 → 穿梭 → 呼吸链质子势 → ATP/故障定位',
  M3:'无线粒体RBC → 糖酵解ATP → 2,3-DPG放氧 → PPP生成NADPH → GSH抗氧化/G6PD',
  M4:'G-6-P枢纽 → 糖原合成/分解 → 肝vs肌 → 糖异生绕行 → Cori/能量账 → 空腹来源切换',
  M5:'脂蛋白身份 → CM外源 → VLDL-IDL-LDL内源 → HDL逆运 → apo/酶/受体故障定位',
  M6:'乙酰CoA出线粒体 → 胆固醇合成/调节 → 胆汁酸/VitD/类固醇去路 → 磷脂合成/磷脂酶',
  M7:'TAG/FA合成储存 → 脂解 → 肉碱穿梭/β氧化 → 乙酰CoA → 酮体生成/利用/酸中毒 → 必需FA连接',
  M8:'氨基酸身份 → 衍生物/供体 → 碳氮分流/转氨脱氨 → 丙氨酸/谷氨酰胺运氨 → 尿素 → 一碳/叶酸B12',
  M9:'PRPP → 嘌呤从头/补救/尿酸 → 嘧啶UMP → 脱氧核苷酸/dTMP → 抗代谢物卡点',
  M10:'血红素合成 → UCB生成/白蛋白运输 → 肝结合CB → 肠道排出 → 三类黄疸定位 → Ⅰ相/Ⅱ相生物转化',
  G1:'核酸积木/方向/测量 → B-DNA/核小体/可逆打开 → RNA/密码/tRNA准确性 → 真核基因组组织',
  G2:'复制四特征 → 复制叉/工具/前导后随 → 起始延长成熟/原真核差异 → 端粒酶/逆转录 → 工具/引物/复制vs转录',
  G3:'DNA模板/转录 → RNA加工/质控 → 翻译体系/能量/起始延长终止 → 蛋白成熟 → 靶向/翻译干扰接口',
  G4:'表达时空特异 → 染色质可读性 → Lac/Trp操纵子 → 真核顺式/反式 → PIC → RNAi/蛋白稳定',
  G5:'原癌油门/抑癌刹车 → 激活/失活与信号层 → 突变类型/修复 → 重组DNA → PCR/印迹/相互作用工具 → O9/器官肿瘤'
};

const readiness = {
  D1:{requires:[],benefits_from:[],reactivates:['P0 membrane/electrical/signaling language'],returns_to:['D2','D3','D9','D12','D14']},
  D2:{requires:['D1'],benefits_from:[],reactivates:[],returns_to:['D9','D10','D11']},
  D3:{requires:['D2'],benefits_from:['D1'],reactivates:[],returns_to:['D4','M6','D19','D20']},
  D4:{requires:['D3'],benefits_from:['D2'],reactivates:[],returns_to:['M5','M7','M8','D5','D12','D15']},
  M1:{requires:[],benefits_from:['D4 protein absorption context'],reactivates:[],returns_to:['M2','M5','M6','M8','M9','M10','G1','G2','G3','D20']},
  M2:{requires:['M1'],benefits_from:[],reactivates:[],returns_to:['M3','M4','M6','M7','M8','M10','D5','D7','D8']},
  M3:{requires:['M2'],benefits_from:[],reactivates:[],returns_to:['M7','M8','M9','M10']},
  M4:{requires:['M2'],benefits_from:['M3 neighboring G-6-P branch'],reactivates:[],returns_to:['M7','M8','D5','D7','D8']},
  M5:{requires:['M1'],benefits_from:['D3','D4'],reactivates:[],returns_to:['M6','D8 chronic-risk context']},
  M6:{requires:['M1','M2','M5'],benefits_from:['D3'],reactivates:[],returns_to:['M7','M10','D19','D22','D23']},
  M7:{requires:['M2','M3','M4','M6'],benefits_from:['D4'],reactivates:[],returns_to:['M8','D5','D7','D8','D20']},
  M8:{requires:['M1','M2','M3','M4','M7'],benefits_from:['D4'],reactivates:[],returns_to:['M9','M10','G3','D5','D7','D17','D22']},
  D5:{requires:['D4','M2','M4','M7','M8'],benefits_from:[],reactivates:['circulation/renal/inflammation interfaces'],returns_to:['D6','D7','D8']},
  D6:{requires:['P0 signal-transduction language'],benefits_from:['D5','M1','M6'],reactivates:[],returns_to:['D7','D21','D22','D23']},
  D7:{requires:['D5','D6','M2','M3','M4','M5','M6','M7','M8'],benefits_from:[],reactivates:[],returns_to:['D8']},
  D8:{requires:['D7'],benefits_from:['M5','M6'],reactivates:['M2–M8 metabolic state model'],returns_to:['later cardio/renal/neuro/surgical applications']},
  M9:{requires:['M1','M3','M8'],benefits_from:['M2 energy language'],reactivates:[],returns_to:['G1','G5','tumor/hematology drug interfaces']},
  G1:{requires:['M1','M9'],benefits_from:[],reactivates:[],returns_to:['G2','G3','G4','G5']},
  G2:{requires:['G1','M1'],benefits_from:[],reactivates:[],returns_to:['G3','G5']},
  G3:{requires:['G1','G2','M1','M8'],benefits_from:[],reactivates:[],returns_to:['G4','G5']},
  G4:{requires:['G1','G3'],benefits_from:[],reactivates:[],returns_to:['G5']},
  G5:{requires:['G1','G2','G3','G4','M9'],benefits_from:[],reactivates:[],returns_to:['O9 pathology tumor-general gate','D11','D15','D18','D20','D21','D19 tumor LGs']},
  D21:{requires:['D6','Tumor Gate for KP23–25'],benefits_from:['M6','M8'],reactivates:['M2–M7 metabolic effects'],returns_to:['D23 surgery/C-cell interface']},
  D22:{requires:['D6'],benefits_from:['M6','M8','circulation/renal interfaces'],reactivates:[],returns_to:[]},
  D23:{requires:['D6'],benefits_from:['D21','renal/VitD interface'],reactivates:[],returns_to:[]},
  D9:{requires:['D2'],benefits_from:[],reactivates:[],returns_to:['D11']},
  D10:{requires:['D2','D9'],benefits_from:[],reactivates:[],returns_to:['D11']},
  D11:{requires:['D9','D10','Tumor Gate'],benefits_from:[],reactivates:[],returns_to:[]},
  D12:{requires:['Respiratory R7 TB common model for TB-specific path'],benefits_from:['D1','D2','D3','D4'],reactivates:[],returns_to:['D15']},
  D13:{requires:['external inflammation/shock interfaces'],benefits_from:[],reactivates:[],returns_to:['D14','D19/D20 acute-abdomen reasoning']},
  D14:{requires:[],benefits_from:['D13'],reactivates:['D1 motility mechanics'],returns_to:['D15 obstruction interface']},
  D15:{requires:['Tumor Gate for KP1–13'],benefits_from:['D12','D14'],reactivates:['lower-GI inflammation/obstruction location'],returns_to:['D16–D18 liver metastasis interface']},
  M10:{requires:['M1','M2','M3','M6','M8'],benefits_from:[],reactivates:[],returns_to:['D16 interface','D17','D19','hematology hemolysis interface']},
  D16:{requires:['external pathology injury/inflammation gate'],benefits_from:['M10'],reactivates:['M10 bilirubin/hepatic processing'],returns_to:['D17','D18']},
  D17:{requires:['D16','M8','M10','external repair/fibrosis','external portal-pressure interface'],benefits_from:[],reactivates:[],returns_to:['D18','D19']},
  D18:{requires:['D16','D17','Tumor Gate'],benefits_from:[],reactivates:[],returns_to:['D19 imaging discrimination']},
  D19:{requires:['D3','M6','M10','D17'],benefits_from:['D18'],reactivates:['Tumor Gate only for KP13 and KP17'],returns_to:['D20']},
  D20:{requires:['D3','M1','M7','D19'],benefits_from:[],reactivates:['Tumor Gate for KP16–22'],returns_to:[]}
};

const defaultRoute = ['D1','D2','D3','D4','M1','M2','M3','M4','M5','M6','M7','M8','D5','D6','D7','D8','M9','G1','G2','G3','G4','G5','D21','D22','D23','D9','D10','D11','D12','D13','D14','D15','M10','D16','D17','D18','D19','D20'];

const partialSystemReconstructions = [
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
};

const surfaceHandoffContract = {
  primary_sequence:[
    'KianOS bounded System/Block/Logic-Group orientation and selective cue',
    'one bounded whole-Logic-Group original Lecture contact in iPad / MarginNote',
    'one normal return to KianOS after the relevant formal Lecture contact',
    'active KP retrieval in accepted learner order',
    'cognition-specific Logic Group closure',
    'Block Recall only after all Block Logic Groups close'
  ],
  normal_switching_rule:'Do not bounce KP-by-KP between KianOS and MarginNote during normal first learning. One whole-LG Lecture contact followed by one normal return is the default; extra source returns are only for learner-requested source checks, visuals or smallest-sufficient repair.',
  lecture_owns:['continuous explanation','figures and tables','source-local examples','annotation context','Lecture-attached questions'],
  kianos_owns:['orientation','current causal target','attention boundary','selective cue','active retrieval','Logic Group closure','Block/System compression','Wrong/Uncertain routing','later review'],
  chat_owns:['adaptive explanation when the model is unclear','mechanism linking','smallest-sufficient repair','personalized clarification','cross-System reasoning when needed'],
  recall_timing:{kp:'AFTER_RELEVANT_FORMAL_LECTURE_CONTACT',logic_group:'AFTER_WHOLE_LG_LECTURE_CONTACT',block:'AFTER_ALL_BLOCK_LGS_CLOSE',psr:'NATURAL_CHECKPOINT_ONLY_AND_SKIPPABLE',system:'ONLY_AFTER_ALL_38_BLOCKS_ARE_ACTUALLY_LEARNED'},
  context_visibility:{always:['what is being learned now','current mechanism / causal question','main prompt','forward/back movement'],conditional:['Precision','Visual Gate / source locator','Reserve learning','Connection Hook / Boundary','Lecture or attached-question locator'],backend_only:['readiness relations','construction_receipts','semantic_acceptance','partition_rationale','cognitive_job codes','system_truth_refs','coverage/audit/migration/status metadata']},
  repair_return:{trigger:'model unclear, learner request, or meaningful Wrong/Uncertain gap',scope:'smallest sufficient object or boundary',chat_evidence_is_mastery:false,return_rule:'after repair, return to the interrupted B mainline; do not open a whole future Block unless that Block is the accepted owner'},
  memory_interruption:{rule:'first Recall instability or Weak/Uncertain evidence may be recorded without automatically stopping the mainline indefinitely',connection_hook_memory:'Connection Hooks do not enter normal Memory before formal target-owner learning',precision_rule:'important current-owner Precision may start memory on first pass, but Precision must not become a permanent always-visible panel'}
};

const crossSystemHandoff = {
  rule:'Readiness labels are backend routing metadata. They may not become learner-facing Connection Hooks unless a formal Current target owner is named below; assumed-baseline concepts are reactivated or minimally repaired, not scheduled as invented future owners.',
  formal_target_owners:{
    circulation:'content/xizong/knowledge/systems/a1-circulation/',
    respiratory:'content/xizong/knowledge/systems/a2-respiratory/',
    urinary:'content/xizong/knowledge/systems/a3-urinary/',
    hematology_immunity_infection:'content/xizong/knowledge/systems/c-hematology-immunity-infection/',
    reproductive_breast:'content/xizong/knowledge/systems/e-reproductive-breast/',
    tumor_general:'content/xizong/knowledge/overlays/o9-tumor-general/'
  },
  explicit_routes:[
    {from:'D12',concept:'tuberculosis common model',target_owner:'content/xizong/knowledge/systems/a2-respiratory/',granularity:'SYSTEM_LEVEL_UNTIL_REVIEWED_FINER_OWNER'},
    {from:'D13',concept:'shock / hemodynamic-stability interface',target_owner:'content/xizong/knowledge/systems/a1-circulation/',granularity:'SYSTEM_LEVEL_UNTIL_REVIEWED_FINER_OWNER'},
    {from:'D17',concept:'pressure-flow / portal-hemodynamic interface',target_owner:'content/xizong/knowledge/systems/a1-circulation/',granularity:'SYSTEM_LEVEL_UNTIL_REVIEWED_FINER_OWNER'},
    {from:'D22',concept:'circulation interface',target_owner:'content/xizong/knowledge/systems/a1-circulation/',granularity:'SYSTEM_LEVEL_UNTIL_REVIEWED_FINER_OWNER'},
    {from:'D22,D23',concept:'renal / volume / VitD-CKD interface',target_owner:'content/xizong/knowledge/systems/a3-urinary/',granularity:'SYSTEM_LEVEL_UNTIL_REVIEWED_FINER_OWNER'},
    {from:'D4,M3,M8,M10',concept:'anemia / hemolysis / megaloblastic interface',target_owner:'content/xizong/knowledge/systems/c-hematology-immunity-infection/',granularity:'SYSTEM_LEVEL_UNTIL_REVIEWED_FINER_OWNER'},
    {from:'G5 and tumor-bearing organ Logic Groups',concept:'tumor-general morphology and behavior',target_owner:'content/xizong/knowledge/overlays/o9-tumor-general/',granularity:'OVERLAY_OWNER'},
    {from:'B endocrine exclusions',concept:'reproductive / pregnancy endocrine management',target_owner:'content/xizong/knowledge/systems/e-reproductive-breast/',granularity:'SYSTEM_LEVEL_UNTIL_REVIEWED_FINER_OWNER'}
  ],
  assumed_baseline:[
    {concept:'membrane / electrical / common signal-transduction language',learner_behavior:'reactivate if already learned; otherwise Chat smallest-sufficient repair; do not create a deferred owner, mastery gate or Memory debt'},
    {concept:'general injury / inflammation / repair-fibrosis language',learner_behavior:'reactivate if already learned; otherwise Chat smallest-sufficient repair; do not invent a Block/KP owner or future learner schedule'}
  ],
  fine_grain_rule:'When a finer reviewed external Block/KP owner is absent, the System/Overlay target above is the maximum routing precision allowed. Runtime/Projection must not infer a finer mapping from titles, proximity or model intuition.',
  connection_hook_rule:'A learner-facing deferred Connection Hook requires one formal target owner and must be re-surfaced when that owner is entered. Assumed-baseline concepts are not Connection Hooks and create no future review debt.'
};

function fm(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*([^\\n]+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}
function orderOf(text, filename) {
  const order = fm(text, 'order');
  if (order && /^[DMG]\d{1,2}$/i.test(order)) return order.toUpperCase();
  const blockId = fm(text, 'block_id');
  if (blockId) {
    const direct = blockId.match(/^([DMG])(\d{1,2})$/i);
    if (direct) return `${direct[1].toUpperCase()}${Number(direct[2])}`;
    const normalized = blockId.match(/(?:^|-)([dmg])(\d{1,2})$/i);
    if (normalized) return `${normalized[1].toUpperCase()}${Number(normalized[2])}`;
  }
  const byName = filename.match(/(?:^|_)([DMG])(\d{1,2})(?:_|\b)/i);
  return byName ? `${byName[1].toUpperCase()}${Number(byName[2])}` : null;
}
function centerQuestion(text) {
  const patterns = [/^>\s*\*\*中心问题\*\*[：:]\s*(.+)$/m,/^>\s*\*\*中心问题[：:]\*\*\s*(.+)$/m,/^>\s*\*\*中心问题\*\*[：:]?\s*(.+)$/m];
  for (const pattern of patterns) { const m = text.match(pattern); if (m?.[1]) return m[1].trim(); }
  return '';
}

const sourceFiles = [];
for (const dir of ['d-d1-d23','m-m1-m10','g-g1-g5']) {
  for (const filename of fs.readdirSync(path.join(bRoot, dir)).filter((x)=>x.endsWith('.md'))) {
    const full = path.join(bRoot, dir, filename);
    const text = fs.readFileSync(full, 'utf8');
    const order = orderOf(text, filename);
    const kpCount = [...text.matchAll(/^##\s+KP\d+[｜|]/gm)].length;
    sourceFiles.push({order,text,kpCount});
  }
}
const byOrder = new Map(sourceFiles.map((x)=>[x.order,x]));
const routeCount = new Map(system.block_route.map((x)=>[x.id,Number(x.kp)]));
const blocks = {};
let logicGroupCount = 0;

for (const blockId of defaultRoute) {
  const source = byOrder.get(blockId);
  if (!source) throw new Error(`B_L_SOURCE_BLOCK_MISSING:${blockId}`);
  if (source.kpCount !== routeCount.get(blockId)) throw new Error(`B_L_KP_COUNT_MISMATCH:${blockId}:${source.kpCount}:${routeCount.get(blockId)}`);
  const groups = semanticGroups[blockId];
  if (!groups?.length) throw new Error(`B_L_GROUP_SPEC_MISSING:${blockId}`);
  const flattened = groups.flatMap((g)=>Array.from({length:g.kp[1]-g.kp[0]+1},(_,i)=>g.kp[0]+i));
  const sorted = [...flattened].sort((a,b)=>a-b);
  if (sorted.length !== source.kpCount || new Set(sorted).size !== source.kpCount || sorted.some((n,i)=>n!==i+1)) throw new Error(`B_L_GROUP_COVERAGE_INVALID:${blockId}`);
  if (groups.some((g)=>g.kp[1]-g.kp[0]+1>7)) throw new Error(`B_L_GROUP_TOO_LARGE:${blockId}`);
  const logicGroups = {};
  const learnerOrder = [];
  groups.forEach((group,index)=>{
    const stem = `${blockId[0].toLowerCase()}${String(Number(blockId.slice(1))).padStart(2,'0')}`;
    const id = `b-${stem}-lg${String(index+1).padStart(2,'0')}`;
    const [start,end] = group.kp;
    const prev = groups[index-1], next = groups[index+1];
    logicGroups[id] = {
      kp:[start,end],label:group.label,cognitive_job:group.cognitive_job,goal:group.goal,closure:group.closure,
      continuity_rationale:[`KP${String(start).padStart(2,'0')}–KP${String(end).padStart(2,'0')}共同完成“${group.label}”这一${group.cognitive_job}任务。`,prev?`前一组“${prev.label}”承担不同的${prev.cognitive_job}任务。`:'这是本Block当前学习顺序的第一个闭环任务。',next?`后一组“${next.label}”切换到不同的${next.cognitive_job}任务。`:'这是本Block当前学习顺序的最后一个闭环任务。'].join('')
    };
    learnerOrder.push(id); logicGroupCount += 1;
  });
  blocks[blockId] = {
    first_pass_focus:centerQuestion(source.text)||`建立 ${blockId} 的完整局部模型，并能从结果反推第一故障。`,
    stop_line:stopLines[blockId],recall_spine:recallSpine[blockId],readiness:readiness[blockId],
    partition_rationale:`Phase 3按认知任务而非KP数量重审；最终顺序为：${groups.map((g)=>`${g.label}[${g.cognitive_job}]`).join(' → ')}。`,
    learner_order:learnerOrder,logic_groups:logicGroups
  };
}
if (logicGroupCount !== 170) throw new Error(`B_L_LOGIC_GROUP_TOTAL_MISMATCH:${logicGroupCount}`);
if (new Set(defaultRoute).size !== 38 || defaultRoute.length !== 38) throw new Error('B_L_DEFAULT_ROUTE_IDENTITY_INVALID');
if (Object.keys(blocks).length !== 38) throw new Error('B_L_BLOCK_TOTAL_INVALID');

const output = {
  schema:'kianos.xizong.system_learning_support.v1',status:'L_CANDIDATE',construction_status:'PHASE5_CROSS_SURFACE_CLOSED_PENDING_INDEPENDENT_L_ACCEPTANCE',authority:'CURRENT_PHASE0_5_COMPILED_LEARNING_CONSTRUCTION',system_id:'digestive-metabolic-endocrine-tumor',canonical_id:'B',scope:'ALL_38_CANONICAL_BLOCKS_SYSTEM_BELOW_ONLY',study_policy:'content/xizong/knowledge/learner/study-policy.json',medical_core_owner:'content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/',system_knowledge_owner:'content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/system.json',
  construction_receipts:['content/xizong/knowledge/learner/B_PHASE0_LEARNING_CALIBRATION.md','content/xizong/knowledge/learner/B_PHASE1_ROUTE_DECISION.md','content/xizong/knowledge/learner/B_PHASE2_BLOCK_CONTROL.md','content/xizong/knowledge/learner/B_PHASE3_LOGIC_GROUP_REACCEPTANCE.md','content/xizong/knowledge/learner/B_PHASE4_PROGRESSIVE_COMPRESSION.md','content/xizong/knowledge/learner/B_PHASE5_CROSS_SURFACE_NEGATIVE_SPACE.md'],
  role:'FIRST_PASS_ATTENTION_CONTINUITY_RECALL_AND_CLOSURE_SUPPORT_ONLY',rule:'This is the single B learner-support owner. It organizes stable Block/KP identities into a causal readiness graph and fresh-reviewed Logic Groups without restating or overriding medical Core. It does not manufacture learner progress, question membership, or Question→Knowledge relations.',
  identity:{stable_block_count:38,stable_kp_count:600,logic_group_count:170,logic_group_coverage:'EXACTLY_ONCE_PER_BLOCK; LEARNER_ORDER_MAY_DIFFER_FROM_STABLE_KP_ORDER',stable_block_or_kp_identity_change:false},
  surface_ownership:{continuous_primary:'iPad / MarginNote original Lecture/source',kianos:'System/Block orientation, attention boundary, selective cue, active retrieval, Logic Group closure, Block/System compression, W/U routing and later review',chat:'adaptive explanation, linking and smallest-sufficient repair',hard_rule:'KianOS must not become a second continuous Lecture reader. Normal first-pass handoff is KianOS orientation → bounded whole-Logic-Group original Lecture contact in MarginNote → KianOS retrieval/closure.'},
  surface_handoff_contract:surfaceHandoffContract,
  cross_system_handoff:crossSystemHandoff,
  first_pass_chain:['System orientation in KianOS','enter current Block / Logic Group with focus and explicit stop-line','continuous whole-Logic-Group original Lecture contact in iPad / MarginNote','return once to KianOS after relevant formal Lecture contact','active KP retrieval in the accepted learner order','cognition-specific Logic Group closure','Block Recall after all Block groups close','short non-gating Partial-System Reconstruction when a natural branch checkpoint closes','after all 38 Blocks are actually learned: pre-question System Recall','official B System question sweep only after S exact qid membership closes and learner-selected whole-paper holdout is excluded','Wrong / Uncertain smallest-sufficient repair through reviewed relations only','short post-question System reconstruction'],
  system_route:{mode:'CAUSAL_READINESS_DAG_WITH_LOW_SWITCHING_DEFAULT',legality_owner:'readiness relations below; default_route does not manufacture prerequisites',default_route:defaultRoute,tumor_gate:{definition:'G1–G5 molecular branch complete + O9 pathology tumor-general model available',rule:'Only tumor-bearing Logic Groups require/reactivate the Tumor Gate when a mixed organ Block contains substantial non-tumor learning.'},readiness,partial_system_reconstructions:partialSystemReconstructions,checkpoint_rule:'PSR is a short partial-System reconstruction only: no new canonical unit, mastery score, completion gate, or Memory debt.',flex_rule:'Any Block may move earlier once its hard prerequisites are satisfied when original-Lecture continuity materially reduces friction; stable Block/KP identity never changes.'},
  compression:{block_recall:{field:'blocks.*.recall_spine',rule:'Block Recall is a compressed causal/localization/decision model, never a replay of all Logic Group labels or KP prompts.',audit:{reviewed:38,keep:29,upgraded:9,upgraded_blocks:['D8','D11','D12','D14','D15','D19','D20','D21','D22']}},partial_system_reconstruction:{count:6,rule:'PSR is non-gating and creates no canonical unit, score, completion state or Memory debt.',source:'system_route.partial_system_reconstructions'},final_system_reconstruction:finalSystemReconstruction},
  question_stage:{timing:'AFTER_REAL_SYSTEM_LEARNING_AND_PRE_QUESTION_SYSTEM_RECALL',exact_membership_gate:'S_BLOCKED_UNTIL_CURRENT_B_QUESTION_SCOPE_ACCEPTED',question_order_owns_learning:false,lecture_attached_questions:'remain with original Lecture / MarginNote',repair:'Wrong / Uncertain only; precise Block/KP routing uses reviewed relations only',whole_paper_holdout:'learner-selected and private; excluded wholesale from ordinary System sweep'},
  memory_and_precision:{rule:'Recall weakness may enter selective Memory; important current-owner Precision is identified and begins memory on first pass, but first instability does not stall the mainline indefinitely.',connection_hooks:'Cross-Block/cross-System knowledge may be postponed only with an explicit target owner; hidden knowledge must not disappear.'},
  semantic_acceptance:{phase3_status:'PASS_BY_FRESH_SEMANTIC_REVIEW',reviewed_blocks:38,reviewed_stable_kps:600,final_logic_groups:170,boilerplate_goal_closure_remaining:0,known_mixed_task_groups_remaining:0,learner_order_exception:{G5:['KP01–KP05','KP12–KP13','KP06–KP11']},phase4_status:'PASS_BY_PROGRESSIVE_COMPRESSION_AUDIT',block_recall_audit:{reviewed:38,keep:29,upgraded:9,blocked:0},psr_audit:{count:6,non_gating:6,staged_refresh_psrs:['PSR-2_METABOLIC_NETWORK','PSR-3_ENDOCRINE_CONTROL','PSR-6_INFORMATION_TUMOR']},final_system_reconstruction:'SYSTEM_GROUNDED_AND_EXPLICIT',extra_compulsory_hierarchy_required:false,phase5_status:'PASS_BY_CROSS_SURFACE_NEGATIVE_SPACE_AUDIT',cross_surface_audit:{surface_ownership:'PASS',whole_lg_handoff:'PASS',conditional_context_visibility:'PASS',backend_metadata_visibility:'BACKEND_ONLY',chat_repair_return:'PASS',cross_system_owner_routing:'SYSTEM_LEVEL_FAIL_CLOSED_FINE_GRAIN'},negative_space_violations_remaining:0,note:'This is still not L PASS. Fresh independent L acceptance remains downstream.'},blocks
};
fs.writeFileSync(outPath, `${JSON.stringify(output,null,2)}\n`, 'utf8');
console.log(`B Learning Phase-5 surface-safe candidate built | Blocks=${Object.keys(blocks).length} | KPs=600 | LogicGroups=${logicGroupCount} | PSRs=${partialSystemReconstructions.length} | path=${path.relative(repoRoot,outPath)}`);
