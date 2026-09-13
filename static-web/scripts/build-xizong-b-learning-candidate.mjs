import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');
const bRoot = path.join(repoRoot, 'content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor');
const outPath = path.join(repoRoot, 'content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning.json');
const system = JSON.parse(fs.readFileSync(path.join(bRoot, 'system.json'), 'utf8'));

const groupMap = {
  D1:[[1,3,'节律—阈值—收缩门'],[4,5,'ENS与自主神经控制'],[6,6,'Ca²⁺—CaM—MLCK执行']],
  D2:[[1,4,'口腔—食管—LES入口'],[5,7,'胃运动、容纳与排空'],[8,11,'胃液、胃酸与分泌调节'],[12,12,'胃黏膜防御']],
  D3:[[1,4,'胰液、酶原与肠激素'],[5,7,'胆汁、胆盐与脂肪消化'],[8,9,'小肠/大肠运动'],[10,11,'三激素比较与故障定位']],
  D4:[[1,2,'吸收界面与血/淋巴去路'],[3,4,'B12与长链脂质特殊路径'],[5,8,'糖、肽、铁、钙选择性吸收']],
  D5:[[1,6,'能量去路、测量与BMR'],[7,10,'核心温度、产热与散热'],[11,14,'发汗、调定点与发热/中暑'],[15,19,'应激代谢与EN/PN营养支持']],
  D6:[[1,5,'激素身份、分泌方式与轴'],[6,9,'反馈、化学分类与受体'],[10,13,'过多/过少/抵抗与临床定位']],
  D7:[[1,5,'胰岛素信号与葡萄糖感知'],[6,9,'胰岛分泌修饰网络'],[10,13,'胰高血糖素与进食—空腹切换']],
  D8:[[1,5,'分型与自然史'],[6,12,'DKA/HHS急性代谢危象'],[13,16,'慢性器官并发症'],[17,20,'诊断与β细胞功能评估'],[21,25,'长期管理与降糖药']],
  D9:[[1,4,'GERD屏障—清除—黏膜机制'],[5,8,'表现、并发症与客观证据'],[9,10,'抑酸、维持与手术边界'],[11,12,'贲门失弛缓与三病分流']],
  D10:[[1,5,'胃炎、萎缩/化生与癌前背景'],[6,8,'HP致病、检查与根除'],[9,13,'PUD机制、鉴别与并发症地图'],[14,16,'UGIB识别与先复苏后内镜'],[17,19,'穿孔、梗阻与癌变警报'],[20,25,'内科治疗、胃切除与术后并发症']],
  D11:[[1,3,'共同肿瘤语言与壁深度'],[4,8,'食管癌识别—证据—治疗'],[9,13,'胃腺癌身份、形态与扩散'],[14,19,'胃癌证据、分期与治疗目标'],[20,21,'胃淋巴瘤与GIST'],[22,24,'上消化道肿瘤整合分流']],
  D12:[[1,5,'肠结核器官模型'],[6,8,'结核性腹膜炎与腹水证据'],[9,12,'IBD共同底座与Crohn'],[13,17,'UC、CD鉴别与并发症'],[18,21,'IBD诱导/维持治疗'],[22,23,'IBS识别与按主症状治疗']],
  D13:[[1,6,'腹膜感染、液体身份与源控制'],[7,9,'腹部损伤出血/污染底座'],[10,13,'脾肝小肠胰结直肠损伤'],[14,16,'检查—探查—急腹症动作算法']],
  D14:[[1,5,'肠梗阻分类、部位与时相'],[6,11,'闭袢/绞窄血运风险与手术门槛'],[12,16,'阑尾炎主链、体征与手术'],[17,20,'阑尾并发症与特殊人群'],[21,24,'腹股沟空间、疝身份与嵌顿'],[25,28,'疝复位/手术、鉴别与边界']],
  D15:[[1,4,'大肠癌共同入口、扩散与检查'],[5,7,'左右结肠癌与切除决策'],[8,12,'直肠癌括约肌/距离与术式'],[13,14,'癌前通路与齿状线坐标'],[15,19,'痔、肛裂、脓肿、肛瘘定位']],
  D16:[[1,5,'肝炎共同病理语言'],[6,8,'急性、慢性与重型形态'],[9,12,'HAV/HBV/HCV/HDV/HEV快速比较']],
  D17:[[1,5,'肝硬化结构重建与肝功减退'],[6,12,'门脉高压、侧支与腹水'],[13,18,'曲张出血、SBP、HRS、HPS、PVT'],[19,19,'胆石与营养接口'],[20,24,'肝性脑病机制、分期与治疗']],
  D18:[[1,7,'HCC病因、形态、扩散与临床'],[8,11,'AFP、影像与确诊证据'],[12,15,'可切除性、局部治疗、破裂与占位鉴别']],
  D19:[[1,6,'胆道解剖、检查与T管时间轴'],[7,13,'胆囊结石、炎症、息肉与癌'],[14,18,'胆管结石、AOSC、胆管癌与出血'],[19,22,'蛔虫、闭锁、扩张与黄疸定位'],[23,26,'肝脓肿来源、检查、治疗与鉴别']],
  D20:[[1,4,'急性胰腺炎机制、病因与严重度'],[5,9,'临床、局部集合与器官并发'],[10,12,'胰酶、影像与预后证据'],[13,15,'支持治疗、介入门槛与慢性胰腺炎'],[16,19,'胰腺癌识别、可切除性与手术'],[20,22,'胰岛素瘤、胃泌素瘤与APUD']],
  D21:[[1,5,'甲状腺激素合成、作用与反馈'],[6,10,'甲亢定位、Graves与高代谢表现'],[11,15,'甲亢检查、药物、核素、手术与危象'],[16,18,'甲减定位与替代'],[19,22,'甲状腺肿、结节与炎症'],[23,25,'四类甲状腺癌与处理'],[26,29,'甲状腺外科准备与术后安全']],
  D22:[[1,4,'肾上腺分区、GC作用与HPA轴'],[5,6,'原醛定位与Liddle鉴别'],[7,9,'嗜铬表现、检查与α→β围术期'],[10,13,'库欣表型、ACTH定位与治疗'],[14,15,'D6反馈轴整合复原']],
  D23:[[1,6,'CT/PTH/钙三醇与骨—肾—肠反馈'],[7,9,'甲旁减/亢与系统接口'],[10,12,'GH—IGF、生长与代谢']],
  M1:[[1,5,'蛋白质结构、折叠与变性'],[6,8,'等电点、蛋白评价与分离/降解'],[9,14,'酶活性、动力学与调节'],[15,17,'辅因子、维生素与医学酶学']],
  M2:[[1,5,'糖酵解、乳酸与PDH入口'],[6,9,'TCA、底物水平磷酸化与穿梭'],[10,15,'呼吸链、化学渗透与ATP']],
  M3:[[1,3,'RBC糖酵解、ATP与2,3-DPG'],[4,7,'PPP—NADPH—GSH抗氧化']],
  M4:[[1,4,'G-6-P与糖原存取'],[5,8,'糖异生、Cori与能量账'],[9,10,'胰高血糖素与空腹时间轴']],
  M5:[[1,3,'脂蛋白身份、组成与方向'],[4,7,'CM/VLDL-LDL/HDL三条运输线'],[8,10,'apo、酶、受体与运输故障定位']],
  M6:[[1,4,'胆固醇合成与HMG-CoA还原酶'],[5,8,'胆固醇去路、胆汁酸、VitD与类固醇'],[9,11,'甘油磷脂合成与磷脂酶']],
  M7:[[1,6,'TAG/脂肪酸合成与储能'],[7,12,'脂解、肉碱穿梭与β氧化'],[13,16,'酮体切换与必需脂肪酸接口']],
  M8:[[1,7,'氨基酸身份、SAM与活性衍生物'],[8,13,'碳氮分流、转氨与安全运氨'],[14,16,'尿素循环、两个氮与调节'],[17,18,'一碳单位、叶酸与B12']],
  M9:[[1,5,'PRPP与嘌呤从头/补救/分解'],[6,10,'嘧啶、脱氧核苷酸与dTMP'],[11,15,'抗代谢物靶点地图']],
  M10:[[1,4,'血红素合成与含铁卟啉入口'],[5,9,'UCB→CB→肠道与三类黄疸'],[10,13,'Ⅰ相/Ⅱ相生物转化']],
  G1:[[1,6,'核苷酸、核酸链与DNA结构'],[7,9,'RNA、遗传密码与翻译前准确性'],[10,10,'真核基因组组织']],
  G2:[[1,7,'复制叉、聚合酶与复制三阶段'],[8,9,'端粒与逆转录'],[10,11,'核酸工具与复制/转录出口比较']],
  G3:[[1,5,'原核/真核转录起始与延长'],[6,8,'mRNA/tRNA/rRNA加工与质量控制'],[9,13,'翻译体系、起始、延长与终止'],[14,15,'翻译后加工、靶向与干扰']],
  G4:[[1,2,'表达特异性、染色质与表观调控'],[3,6,'原核操纵子负/正与衰减调控'],[7,10,'真核顺式/反式、PIC与转录后调控']],
  G5:[[1,5,'原癌/抑癌/修复三道门'],[6,11,'重组DNA、PCR、杂交与相互作用技术'],[12,13,'突变类型与DNA修复系统']]
};

const recallSpine = {
  D1:'平滑肌底座 → 慢波/两道阈值 → ENS局部控制 → 自主神经调状态 → Ca²⁺—CaM—MLCK执行',
  D2:'唾液/LES入口 → 胃容纳与排空 → 胃液细胞地图 → ACh/胃泌素/组胺促酸 → 黏膜防御',
  D3:'酸性食糜 → 促胰液素/HCO₃⁻ → CCK/胰酶/胆囊 → 胆盐脂肪消化 → 肠运动 → 故障定位',
  D4:'小肠吸收界面 → 门静脉vs淋巴 → B12/脂类特殊路线 → 糖/肽 → 铁/钙门槛',
  D5:'ATP/热/功 → 能量测量/BMR → 产热散热/调定点 → 发热vs中暑 → 应激分解 → EN优先/PN边界',
  D6:'来源/分泌方式 → 下丘脑—垂体—靶腺 → 反馈 → 化学分类/受体 → 过多/过少/抵抗 → 动态定位',
  D7:'胰岛素受体/代谢 → B细胞葡萄糖感知 → 分泌修饰 → 胰高血糖素肝输出 → 进食/空腹/应激切换',
  D8:'分型/自然史 → DKA/HHS → 慢性并发症 → 诊断/功能评估 → 胰岛素与非胰岛素药物选择',
  D9:'LES屏障/清除/黏膜 → GERD表现/并发 → 反流证据 → 抑酸/维持/手术 → 失弛缓对照',
  D10:'胃黏膜损伤 → HP/胃炎 → PUD深部自身消化 → 出血先复苏 → 穿孔/梗阻/癌变 → 内科/外科重建',
  D11:'共同肿瘤语言/壁深度 → 食管癌 → 胃癌身份/扩散 → 证据/分期/可切除性 → lymphoma/GIST → 整合决策',
  D12:'结核共同病理 → 肠结核/腹膜结核 → IBD共同底座 → CD/UC定位 → 诱导/维持治疗 → IBS功能性分流',
  D13:'腹膜三能力 → 感染/液体源 → 出血vs污染损伤轴 → 脏器空间 → 稳定性决定检查/探查/源控制',
  D14:'梗阻类型/部位 → 血运绞窄风险 → 阑尾炎转移痛与阶段 → 阑尾并发 → 腹股沟空间 → 嵌顿/绞窄处理',
  D15:'排便改变/便血 → 右左结肠分流 → 直肠括约肌/距离决策 → 齿状线坐标 → 痔/裂/脓肿/瘘',
  D16:'变性/坏死层级 → 再生/纤维化 → 急性/慢性/重型形态 → HAV/HEV vs HBV/HCV/HDV',
  D17:'假小叶重构 → 肝功减退 + 门脉高压 → 腹水/侧支 → 出血/SBP/HRS/HPS/PVT → 氨中毒/HE',
  D18:'慢性肝病背景 → HCC身份/门静脉播散 → AFP/增强影像 → 病理确证 → 肝储备+肿瘤范围 → 切除/TACE/消融/移植',
  D19:'胆汁管道地图 → B超/MRCP/ERCP/PTC → 胆囊病 → 胆管梗阻/感染/癌 → 黄疸定位 → 肝脓肿',
  D20:'胰酶提前激活 → 自我消化/坏死/器官衰竭 → 集合与证据 → 支持/介入门槛 → 胰腺癌 → 功能性胰岛肿瘤',
  D21:'TH合成/作用/HPT反馈 → TSH–FT4功能定位 → Graves/甲亢 → 甲减 → 肿大/结节/炎症 → 四癌 → 外科安全',
  D22:'球束网髓 → GC/HPA底座 → 原醛 → 嗜铬 → 库欣 → ACTH/肾素反馈轴整合',
  D23:'CT/PTH/钙三醇 → 骨肾肠反馈 → 甲旁减/亢 → CKD/结石/术后接口 → GH/IGF与三年龄结局',
  M1:'序列/结构/折叠 → 活性中心 → 酶动力学/抑制 → 调节通量 → 辅因子/维生素搬运化学基团',
  M2:'糖酵解 → PDH → TCA → NADH/FADH₂ → 呼吸链泵质子 → ATP合酶 → 抑制vs解偶联',
  M3:'无线粒体RBC → 糖酵解ATP → 2,3-DPG放氧 → PPP生成NADPH → GSH抗氧化/G6PD',
  M4:'G-6-P枢纽 → 糖原合成/分解 → 肝vs肌 → 糖异生旁路 → Cori/能量账 → 空腹切换',
  M5:'脂蛋白颗粒身份 → CM外源 → VLDL-IDL-LDL内源 → HDL逆运 → apo/酶/受体 → 故障定位',
  M6:'乙酰CoA出线粒体 → 胆固醇合成/调节 → 胆汁酸/VitD/类固醇去路 → 磷脂合成 → 磷脂酶',
  M7:'TAG/FA合成 → 脂库动员 → 肉碱穿梭 → β氧化 → 乙酰CoA → 肝酮体输出/肝外利用',
  M8:'氨基酸身份/衍生物 → 碳氮分流 → 转氨/脱氨 → 丙氨酸/谷氨酰胺运氨 → 尿素 → SAM/一碳',
  M9:'PRPP → 嘌呤从头/补救/尿酸 → 嘧啶UMP → 脱氧核苷酸/dTMP → 抗代谢物逐层卡点',
  M10:'血红素合成 → UCB生成/白蛋白运输 → 肝结合CB → 肠道排出 → 三类黄疸 → Ⅰ相/Ⅱ相生物转化',
  G1:'核苷酸 → 核酸方向/一级结构 → B-DNA/核小体 → RNA身份 → 遗传密码/tRNA准确性 → 真核基因组',
  G2:'复制共同特征 → 复制叉/前导后随 → 聚合酶/工具组 → 三阶段 → 端粒 → 逆转录 → 与转录分界',
  G3:'DNA模板 → 转录起始/延长/终止 → RNA加工/质控 → 翻译起始/延长/终止 → 加工/折叠/靶向',
  G4:'染色质可读性 → 操纵子语言 → Lac正负调控/Trp衰减 → 真核顺式/反式 → PIC → 转录后调控',
  G5:'原癌油门/抑癌刹车/修复 → 激活与失活 → 重组DNA流程 → PCR/杂交/相互作用 → 突变/修复'
};

const directRoute = ['D1','D2','D3','D4','M1','M2','M3','M4','D5','D6','D7','D8','D21','D22','D23','M5','M6','M7','M8','M9','M10','D9','D10','D11','D12','D13','D14','D15','D16','D17','D18','D19','D20','G1','G2','G3','G4','G5'];
const arcs = [
  {id:'ARC1_GI_INPUT',label:'管道—消化—吸收',blocks:['D1','D2','D3','D4'],reason:'先建立食物如何被推进、拆解并进入血/淋巴的正常功能地图。'},
  {id:'ARC2_CORE_METABOLISM',label:'蛋白/酶—ATP—RBC—糖储存',blocks:['M1','M2','M3','M4'],reason:'为能量状态、糖尿病和后续代谢分支建立最小底层化学语言。'},
  {id:'ARC3_CONTROL',label:'能量—内分泌—糖尿病—靶腺',blocks:['D5','D6','D7','D8','D21','D22','D23'],reason:'把底物利用与反馈轴连到真实内分泌疾病和危象。'},
  {id:'ARC4_METABOLIC_BRANCHES',label:'脂质—氮—核苷酸—血红素/胆红素',blocks:['M5','M6','M7','M8','M9','M10'],reason:'补齐脂质运输、空腹燃料、氮解毒、一碳/核苷酸及肝化学处理，为肝胆疾病提供接口。'},
  {id:'ARC5_GI_CLINICAL',label:'食管胃—肠—腹膜—梗阻—结直肠',blocks:['D9','D10','D11','D12','D13','D14','D15'],reason:'把D1–D4正常模型转成症状、证据和外科空间决策。'},
  {id:'ARC6_HEPATOBILIARY_PANCREAS',label:'肝炎—肝硬化/HCC—胆道—胰腺',blocks:['D16','D17','D18','D19','D20'],reason:'在M8/M10和胆脂代谢接口上完成肝胆胰疾病链。'},
  {id:'ARC7_INFORMATION',label:'DNA→RNA→蛋白—调控—损伤/肿瘤',blocks:['G1','G2','G3','G4','G5'],reason:'最后把分子信息流压成独立可调用分支，并回扣器官肿瘤与药物靶点。'}
];

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
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m?.[1]) return m[1].trim();
  }
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
for (const blockId of directRoute) {
  const source = byOrder.get(blockId);
  if (!source) throw new Error(`B_L_SOURCE_BLOCK_MISSING:${blockId}`);
  if (source.kpCount !== routeCount.get(blockId)) throw new Error(`B_L_KP_COUNT_MISMATCH:${blockId}:${source.kpCount}:${routeCount.get(blockId)}`);
  const groups = groupMap[blockId];
  if (!groups?.length) throw new Error(`B_L_GROUP_MAP_MISSING:${blockId}`);
  const flattened = groups.flatMap(([s,e])=>Array.from({length:e-s+1},(_,i)=>s+i));
  if (flattened.length !== source.kpCount || flattened.some((n,i)=>n!==i+1)) throw new Error(`B_L_GROUP_COVERAGE_INVALID:${blockId}`);
  if (groups.some(([s,e])=>e-s+1>7)) throw new Error(`B_L_GROUP_TOO_LARGE:${blockId}`);
  const logicGroups = {};
  groups.forEach(([start,end,label],index)=>{
    const stem = `${blockId[0].toLowerCase()}${String(Number(blockId.slice(1))).padStart(2,'0')}`;
    const id = `b-${stem}-lg${String(index+1).padStart(2,'0')}`;
    logicGroups[id] = {
      kp:[start,end],
      label,
      goal:`把「${label}」压成一个连续的局部因果/判断模型。`,
      closure:`能闭卷恢复 KP${String(start).padStart(2,'0')}–KP${String(end).padStart(2,'0')} 的主链，并说明至少一个决定性方向、边界或条件变化。`
    };
    logicGroupCount += 1;
  });
  blocks[blockId] = {
    first_pass_focus:centerQuestion(source.text) || `建立 ${blockId} 的完整局部因果模型，并能从结果反推第一故障。`,
    stop_line:'只完成本 Block 的中心问题与 canonical KP；跨 owner 细节按原 Block 的 Learn/Recall/Apply/Defer 或“当前后置”边界延迟，不顺藤摸瓜扩成下一本讲义。',
    recall_spine:recallSpine[blockId],
    logic_groups:logicGroups
  };
}
if (logicGroupCount !== 150) throw new Error(`B_L_LOGIC_GROUP_TOTAL_MISMATCH:${logicGroupCount}`);
if (new Set(directRoute).size !== 38 || directRoute.length !== 38) throw new Error('B_L_DIRECT_ROUTE_IDENTITY_INVALID');

const output = {
  schema:'kianos.xizong.system_learning_support.v1',
  status:'L_CANDIDATE',
  authority:'CHAT_APPROVED_UPGRADE_WORK',
  system_id:'digestive-metabolic-endocrine-tumor',
  canonical_id:'B',
  scope:'ALL_38_CANONICAL_BLOCKS_SYSTEM_BELOW_ONLY',
  study_policy:'content/xizong/knowledge/learner/study-policy.json',
  medical_core_owner:'content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/',
  system_knowledge_owner:'content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/system.json',
  role:'FIRST_PASS_ATTENTION_CONTINUITY_RECALL_AND_CLOSURE_SUPPORT_ONLY',
  rule:'This is the B learner-support owner. It organizes stable Block/KP identities into a causal learner route and Logic Groups without restating or overriding medical Core. It does not manufacture learner progress, question membership, or Question→Knowledge relations.',
  identity:{stable_block_count:38,stable_kp_count:600,logic_group_count:150,logic_group_coverage:'CONTIGUOUS_WITHIN_EACH_BLOCK_NO_GAP_NO_OVERLAP',stable_block_or_kp_identity_change:false},
  surface_ownership:{continuous_primary:'iPad / MarginNote original Lecture/source',kianos:'System/Block orientation, attention boundary, selective cue, active retrieval, Logic Group closure, Block/System compression, W/U routing and later review',chat:'adaptive explanation, linking and smallest-sufficient repair',hard_rule:'KianOS must not become a second continuous Lecture reader. Normal first-pass handoff is KianOS orientation → original Lecture contact in MarginNote → KianOS retrieval/closure.'},
  first_pass_chain:['System orientation in KianOS','enter current Block / Logic Group with focus and stop-line','continuous original Lecture contact in iPad / MarginNote','active KP retrieval only after relevant formal learning contact','Logic Group closure','Block Recall after all Block groups close','after all 38 Blocks are actually learned: pre-question System Recall','official B System question sweep only after S exact qid membership closes and learner-selected whole-paper holdout is excluded','Wrong / Uncertain smallest-sufficient repair through reviewed relations only','short post-question System reconstruction'],
  system_route:{mode:'CAUSAL_DEFAULT_WITH_SOURCE_CONTINUITY_FLEX',direct_route:directRoute,arcs,flex_rule:'The direct route is the default causal path, not a forced scheduler. A branch may move earlier after its true prerequisites are learned when original-Lecture continuity materially reduces friction; stable Block/KP identity never changes.'},
  question_stage:{timing:'AFTER_REAL_SYSTEM_LEARNING_AND_PRE_QUESTION_SYSTEM_RECALL',exact_membership_gate:'S_BLOCKED_UNTIL_CURRENT_B_QUESTION_SCOPE_ACCEPTED',question_order_owns_learning:false,lecture_attached_questions:'remain with original Lecture / MarginNote',repair:'Wrong / Uncertain only; precise Block/KP routing uses reviewed relations only',whole_paper_holdout:'learner-selected and private; excluded wholesale from ordinary System sweep'},
  memory_and_precision:{rule:'Recall weakness may enter selective Memory; important current-owner Precision is identified and begins memory on first pass, but first instability does not stall the mainline indefinitely.',connection_hooks:'Cross-Block/cross-System knowledge may be postponed only with an explicit target owner; hidden knowledge must not disappear.'},
  blocks
};
fs.writeFileSync(outPath, `${JSON.stringify(output,null,2)}\n`, 'utf8');
console.log(`B Learning candidate built | Blocks=${Object.keys(blocks).length} | KPs=600 | LogicGroups=${logicGroupCount} | path=${path.relative(repoRoot,outPath)}`);
