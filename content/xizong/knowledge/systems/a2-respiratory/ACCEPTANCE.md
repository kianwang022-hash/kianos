# Xizong A2 Respiratory Acceptance

Status: CURRENT  
Scope: A2 Respiratory  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: A2 scoped Acceptance Truth

This file owns current S/K/L/P/R/E/U readiness claims for A2 Respiratory.

It does not own medical Core, lane/System learning semantics, Work Cursor, or Kian's private learner state.

---

<a id="a2-r01-r04-r12-deep-model-quality-20261008"></a>
## 2026-10-08｜R4–R12 模型与 R1/R4–R12 原有依赖深度复核

**限定医学内容、既有依赖与原生消费者：PASS；完整构建与浏览器证据单列，不授予 Stable 或真实学习 U。** 本批承接 [#1113](https://github.com/kianwang022-hash/kianos/issues/1113)，使用已经合并的 [R2/R3 #1279](https://github.com/kianwang022-hash/kianos/pull/1279) 内容作为复核基线 `09ce94b10c45c5c973b9b5cb60a344b53ad9b149`。继续执行原 [Learning Contract §0](../../../LEARNING_CONTRACT.md#learning-outcome) 和 [Lecture Replacement Contract §3.1–§4](../../learner/LECTURE_REPLACEMENT_CONTRACT.md#teaching-topology-annotations)，不新增学习步骤或 Memory 准入标准。

### 同一医学模型与完整原注释

下列九块均完整读过 canonical Core、现有 System/Learning、旧 teaching、全部正式 title/Prompt 和相关 Source，再由另一位执行者独立交叉。模型中的测量、表现、病理结果、决策条件和反馈各归其医学关系；初学和压缩复述读取同一 canonical 原文。旧 teaching 文件保持原字节，其有效解释可接回相应节点；旧顺排目录不再作为另一个主模型。

| 唯一 canonical owner | 最终审定 Git blob | 完整 KP | 本批恢复的医学关系 |
|---|---|---:|---|
| [R4](./blocks/Block4_支气管哮喘_可逆性气流受限_学习阅读版_v1_最终执行版.md) | `577895fb353f85946e4c6a0adee9e57244432068` | 19 | 炎症与神经反应并行汇合到可逆气流受限；急性危险与长期控制分别选择，证据是观察，急救各措施按适应证并行。 |
| [R5](./blocks/Block5_肺炎_病变空间病原体与严重度_学习阅读版_v1_最终执行版.md) | `89a7be9e60ccbf11c7b25d3957979ae8b2180c9a` | 18 | 场景、病变空间、病原和证据是相互约束的维度；严重度从接诊即持续评估，并与病因取证及治疗同时推进。 |
| [R6](./blocks/Block6_支气管扩张与肺脓肿_结构破坏脓腔与引流_学习阅读版_v1_最终执行版.md) | `d453d18cfcd17c15483b651a70134b776dc39ea8` | 16 | 支扩的结构破坏与清除障碍形成反馈；肺脓肿的误吸、阻塞和血源入口并列，右心赘生物直接进入肺动脉；感染、引流和咯血各有处置条件。 |
| [R7](./blocks/Block7_肺结核_肉芽肿空洞播散与化疗_学习阅读版_v1_最终执行版.md) | `fdc1046a906d7ca0478df664a04a4371293df044` | 25 | 感染与宿主免疫决定可并存的病理结果；活动性、传染性和治疗必要性分别取证，原疗程与现代适用边界保留。 |
| [R8](./blocks/Block8_间质性肺疾病与硅肺_限制弥散纤维化与硅结节_学习阅读版_v1_最终执行版.md) | `74e2a0b87e4316858c1f1bcf6e5aafc5a80a9368` | 16 | 顺应性、弥散和区域 VA/Q 并行影响功能；Scadding 为影像分类，不能画成每名患者必经的进展时间线。 |
| [R9](./blocks/Block9_肺动脉高压肺心病与急性肺血栓栓塞_慢性阻力急性阻塞与右心负荷_学习阅读版_v1_最终执行版.md) | `927ca550ece5649a9f5c6fae6673677c53afd846` | 22 | 血管阻力、变化速度和右室储备共同决定负荷后果；急性 PE 的取证、抗凝和紧急再灌注按危险分层、出血风险与时机协调。 |
| [R10](./blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md) | `778bcc0d1802cef0689d0540874407f69a170284` | 23 | 胸膜高压、失血失容和胸壁失稳是不同入口；高压同时压肺和阻碍静脉回流；紧急减压/止血/支持与必要取证衔接，稳定后完善病因。 |
| [R11](./blocks/Block11_肺癌与纵隔_位置组织学分期与纵隔定位_学习阅读版_v1_最终执行版.md) | `bf06a1af5abe2f786a5d6472284c8a0c1884b3f4` | 23 | 位置与组织学为双坐标；阻塞、侵犯、转移和副肿瘤表现并行；组织证据、分期、可切除性、耐受与靶点共同约束治疗，纵隔定位单列。 |
| [R12](./blocks/Block12_ARDS与呼吸衰竭_屏障损伤氧合失败与通气失败_学习阅读版_v1_最终执行版.md) | `56f312009dd91235fc59e888b53ba9b98ffd0c58` | 22 | 氧合与通气失败可共存，ARDS 是有定义条件的分支；内皮/上皮损伤并行汇合，取证及支持形成反馈，急性右心后果明确负荷超过储备的条件。 |

本批九块 **184 KP** 的完整标题〔原 Prompt〕各在模型中出现一次；隐藏全部括注后仍能解释因果、并行、条件与反馈。R1 的既有模型和 R2/R3 已合并模型不再改写。对全部 A2 的实际 native 读取证明：**236 KP × 10 字段中 2,355 项与基线精确相同，另外 5 项均为下表明确审定的 Core**。所有稳定 ID、标题、完整 Prompt、Source/Outline locator、组归属保持原值；不能把这五项实际语义修正描述成“Core 全部未变”。

原位模型、Framework、中心问题和同模型 Exit 之外，只同步逐段列出的已有 MI-G/病例重建/退出问句：例如 R5 严重度前置、R6 感染与引流终点、R7 治疗条件、R8 分期解释、R9 再灌注条件及 R10–R12 对应急迫性与治疗边界。每份最终文件都已按全部审定段逆向精确还原至基线；未列出的正文、原教学文件、Source、图门禁与辅助资产保持字节不变。

### 五项明确的 Core 修正

| 原 owner | 最小修正与依据 | 保留边界 |
|---|---|---|
| R8 KP08 | 保留原四期表，只修表后“必经过程”解释；Scadding 描述当前影像形态/分布，不要求依次进展，也不能仅凭肺门淋巴结不显大判改善。原内科 UnifiedSource 2530–2531 与 [TSANZ 官方立场文件](https://thoracic.org.au/wp-content/uploads/2024/09/TSANZ-SarcoidosisPaper-2018-web-v3.pdf) 印刷页 15 的分期限制已实际复读。 | 原表、标题和 Prompt 不改；课程分期与临床纵向判断明确区分。 |
| R10 KP06 | 将“纵隔移位即大量积液、无摩擦音”限定到大量积液向健侧推移时的积液覆盖区域。原内科 UnifiedSource 6722–6729 已复读。 | 不把任何病因的移位等同大量积液，不推为全胸绝无摩擦音。 |
| R10 KP18 | 修正唯一文字图：胸膜腔高压下分出患肺受压/通气下降，与静脉回流受阻/前负荷及心排量下降；取消“通气下降导致回流下降”的误串。原内科 UnifiedSource 6986–6993 明确高压的直接作用；[NHLBI 官方胸膜疾病说明](https://www.nhlbi.nih.gov/health/pleural-disorders/types) 亦区分压肺与血流受阻。 | 立即减压的原条件保留，未加“等低血压出现”的前提。 |
| R11 KP17 | 坏死组织排出形成空洞；肿块本有的分叶、毛刺作为另一形态输入，取消“空洞导致分叶毛刺”的误串。原内科 UnifiedSource 6213–6217 的“又因”关系已复读。 | 其余肿瘤证据、诊断与治疗不扩写。 |
| R12 KP18 | 保留课程药物配对及原脑干出血例子的出处，明确中央抑制不能自动推出多沙普仑适用；原内科 UnifiedSource 5687–5693 与 [DailyMed 现行标签](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=954859c0-a121-34d6-e053-2a95a90a1e19) 的脑血管事件、脑水肿、癫痫/惊厥禁忌存在需保留的来源冲突。 | 标签禁忌不降成仅“慎用”；不添剂量或一套新 ICU 方案，不修改正式题答案。 |

### Learning 与既有 Memory

Learning 仅变更 **20 个既有字符串**，使 first-pass focus、recall spine 和指定 LG goal/closure 与上述关系一致；组成员、身份、Source、stop line 和政策不变。R11 LG03 的“最常见”限定回 **2026 N129 原题**；R12 LG02 以血气、影像、心源证据共同判定义，保留心源因素共存的可能。

**32 条 cue、26 项既有准入、17 个 visual binding、全部 item/完整答案/助记/ID/anchor/成员/依赖次序保持原值。** 物理索引只更新 **20 个 owner hash 与 3 个 Core ref hash**：R8 LG03 的 KP08，以及原来依赖 R10 KP18 的 KP16、KP19 两张卡。三张完整答案逐项复读仍成立；依赖没有删除或换成方便通过的知识点。尤其 R8 答案开头本就按影像分布/形态组织，“不能判好转”保留为观察限制，不据此断言人人经历淋巴结消失的时间过程。R10 两张卡的动态危险及紧急/后续处理边界与修正后的并行模型一致。

R7 LG06 的 Learning “足量”本轮与原 Core “适量”同步，**该文字冲突现已解决；其既有未准入状态仍保留**。2026-10-06 回执记录的是当时未准入原因，本次不将当时状态改写成现在仍有同一文字冲突，也不凭本轮模型修订自动准入候选。

原 frozen fixtures/goldens 未改。测试逐项要求真实新 source、owner、Core 与语义 revision，随后只在独立历史比较副本中恢复明确列出的旧值，继续验证全部原答案/上下文/未变字段；运行时及私人学习历史不做这种恢复。九份原 source 的未审段、两份原 raw/pre-entry 基线和原 descriptor 基线均独立复现。**旧 pre-entry consumer 的 A2 Framework 在旧版和当前都 absent**；本轮不冒称该 consumer 已恢复 Framework，canonical `--model` 的实际消费另有完整验证。

### 既有题目从原见证逐题重审

本批只重审原 **R1/R4–R12 共 265 条**关系：18 个原 effective Knowledge blob 和 104 个原 Question Truth blob 均有实际读取，265 个完整正式题对象与原 witness 以及冻结输入相同。248 条保留原 target 并更新已复审见证，其中 **68 条原作用域精确连续、180 条按当前医学重新逐题审定**；17 条保留原完整关系对象及旧见证。正式题干、选项、题型、答案和 Primary/supporting/Block 级路由未修改。

| 范围 | 原 scope 精确、保留 | 当前逐题实审、保留 | 原整条 HOLD |
|---|---:|---:|---:|
| R1 | 3 | 18 | 1 |
| R4–R6 | 22 | 46 | 5 |
| R7–R9 | 21 | 47 | 4 |
| R10–R12 | 22 | 69 | 7 |
| 本批合计 | 68 | 180 | 17 |

以下缺口不通过移动 target、改答案或仅刷新 hash 关闭；既有 Explanation 可以保留已明确的来源限定，但不能补成缺失的 Knowledge owner：

| 原题，均保留原整行 | 本轮实际判定依据 |
|---|---|
| `xizong-official-2005-n140` | 正式BC要求局灶型境界清楚、以增生为主。原Primary只有KP07、无support；当前及旧effective KP07仅给六型及局灶型典型非活动身份，不能提供BC两个关键病理特征。实际可支持BC的是邻近KP08，但本任务不获准新增/替换target；旧Explanation亦不能替代Knowledge owner，因此原整条保持stale。 |
| `xizong-official-2006-n060` | 正式答案D（错误项）。原KP05/06明给反复咯血、大量脓痰、固定湿啰音及HRCT扩张气道，覆盖A/B/C/E；但没有胸部X线平片异常率，“HRCT可见扩张”不能证明“平片多无异常”为假。旧basis最后一句越过当前原target证据。 |
| `xizong-official-2006-n142` | 正式答案ABD。原KP10明确多发易变结节、脓肿及空洞，支持A/B的关键方向，但既有Core及原basis均未提供D“早期肺部体征明显，可管状呼吸音”的依据。即使原scope Core精确连续，也不能据A/B局部支持刷新整条多选。 |
| `xizong-official-2007-n062` | 正式B是剑突下心脏收缩期搏动。原Primary KP04及support KP06分别给右室形态和颈静脉/三尖瓣收缩期杂音/肝界机制，未给剑突下体表定位与搏动性质；检索当前整个R9也无剑突。旧Explanation补了右室在胸骨后剑突附近的解剖，但它不是Current Knowledge owner，不能代签原两锚。原scope虽精确相同，仍HOLD完整原row。 |
| `xizong-official-2007-n080` | 正式D为呼酸合并代碱，原Primary仅KP20。当前KP20已明确适当肾性HCO3升高是代偿，合并代碱须超出预期并结合病因；本题pH7.35、PaCO2 75、AB42及低K/Cl需要预期代偿定量/电解质病因辨别。KP20本身没有该定量或低K/Cl判别，完整公式已明确交泌尿K5；不能沿用旧自动HCO3高即代碱的basis给原单锚续绿，暂HOLD而不改答案/target。 |
| `xizong-official-2007-n125` | 正式D为极度呼吸困难、发绀，KP18张力气胸的呼吸循环障碍仍支持Primary；本轮已按原Source把高压对肺与静脉回流改为并行。原supporting KP15及旧basis的叩诊内容未被本题考到，也不是选D的独立必要依据。按CALIBRATION D2保留原整行HOLD，不因Primary成立而续签无依据supporting。 |
| `xizong-official-2007-n154` | 正式C“长期大量吸烟者周围型肺癌发病率高”为错误项，原三目标给吸烟风险、腺癌周围型/非吸烟者较多、鳞癌吸烟/中央型。Current02同时明确吸烟仍增加腺癌风险，故C按字面风险升高不能直接排除；旧Explanation把它改读为吸烟者“更偏周围型”的隐含比较。独立交叉已重读正式Truth及三锚，确认不能偷加比较对象，保留原整行HOLD，不改C或反写为吸烟不增加周围型风险。 |
| `xizong-official-2008-n091` | 正式B为胸膜增厚伴粘连。当前KP05给积液的典型语颤下降，但明确体征可受液量/分布影响；KP06仅给明显增厚粘连可牵向患侧、轻病可不移。整Block没有把本题语颤正常、气管居中、局部叩浊和呼吸音低独立归因为增厚粘连的判别。旧Explanation的该诊断扩写不能补Knowledge owner；原Block+supporting05/06整行HOLD。 |
| `xizong-official-2009-n023` | 正式答案A。原Primary KP11只列组织回缩与表面张力两个来源，supporting KP12只说明表活降低张力及吸气做功；二者未给出本题“主要来源”所需相对贡献。Current KP10才给弹性约70%、表面张力约占肺弹性2/3，但不在原target中。 |
| `xizong-official-2010-n067` | 正式答案A。Current整Block可区分典型/非典型病原并列各药物接口，但KP09没有原basis所声称的“重症CAP大环内酯单药肺炎链球菌覆盖不足/耐药”判断。KP12的大环内酯耐药属于支原体，不能移给肺炎链球菌。 |
| `xizong-official-2012-n065` | 正式答案D。Current整Block的KP09明确流感嗜血杆菌与铜绿高危治疗支，但未给包含肺炎链球菌的完整常见菌谱，也无肺炎支原体“不属常见”的显式判断；不能用名单未列名当作排除证据。 |
| `xizong-official-2012-n170` | 正式答案AD不选B下叶后基底段；原Primary KP05当前正文却把上叶尖后段、下叶背段和后基底段并列为好发，表格再次列后基底段。原effective Core虽精确相同，亦不能证明本题完整多选答案一致。原Explanation称B非题源高频典型，但Current owner没有作此区分；不以解释层弱化Core，原整条HOLD。 |
| `xizong-official-2012-n175` | 正式ACD含C“为保持管腔通畅，要经常挤压引流管”。当前KP19拥有讲义高/低位定位、屏气时相及通畅/残留评估，能对照A/B/D，却没有该反复挤压操作依据。现存Explanation还明确常规反复挤奶并非现代标准，不能用其替代缺少的Knowledge owner；保留原Primary和旧答案、整行HOLD。 |
| `xizong-official-2014-n063` | 正式A为旧AECC PaO2/FiO2≤200并PCWP≤18。当前KP08写Berlin下P/F≤300及条件，KP09写通常PAWP<18且可与心源水肿并存；整Block没有旧AECC的这对精确诊断阈值owner。Explanation的历史/Current冲突注释可保留旧答案，却不能替代缺失Knowledge分类依据；原Block整行HOLD。 |
| `xizong-official-2018-n044` | 正式A把低血压“或晕厥”并列作为应考虑溶栓的指征。当前原Primary KP21已要求心搏骤停、阻塞性休克或有持续时间/排他条件的低血压；没有把单独晕厥列为高危或治疗指征。KP16/17只说明晕厥可出现，不能拿症状发生链代替治疗指征。原Explanation亦仍把晕厥写成高危入口、没有明确Source校准，原整条HOLD，不替换答案或target。 |
| `xizong-official-2018-n046` | 正式答案D。旅行、腹泻、低钠与β-内酰胺无效的军团菌病例，当前明确owner是KP13；原Primary KP14当前及原历史均是病毒性肺炎，原basis错称KP14拥有军团菌。未授权且不应默改原target。 |
| `xizong-official-2022-n075` | 正式A为氧疗、机械通气，原Primary KP13+supporting KP12的旧basis却重写成低潮气量、平台压和PEEP策略；题干/选项没有独立考这些参数，且未给P/F不能称重度。真正呼吸支持方向在KP11，按CALIBRATION D2不能为原supporting12制造必要性；保留整行HOLD，不偷改为KP11或自动移除supporting。 |

原 manifest synchronizer 写入并反查 PASS。实际 freshness resolver 得 **全库 2,046 current / 997 stale / 3,043 总数**；980 条非本批 stale 逐对象与已合并基线相同。A2 合计 **305 current / 18 stale / 323 原关系**，包括先前 R2 的 `2015-n009`。关闭缓存后，原生 `loadReviewedXizongQuestionRelation` 实际验证本批 248 条可消费（166 KP 路由、82 Block 路由），全部原 target 保留；17 条 HOLD 返回不可消费，未更改 fail-closed 条件。全库 strict freshness 仍非全绿。

### Surgery 绑定的限定复核

SUR27-U04 印刷 P028–P031 对应 R10 LG05/KP20–23 与 R11 LG06/KP23。五个完整 KP 和两个完整 LG 与上一见证精确相同；新模型中的胸壁创伤、稳定性和纵隔分区已分别交叉复核。R10 KP06/KP18 与 R11 KP17 的 Core 例外不在这五个原绑定 KP 内。原 Source map、全部 59 绑定、其余 50 个 Knowledge owner 和七项 Learning 见证保持原值。

仅将现有 Surgery lifecycle 中 R10/R11 两个 `reviewed_against` hash 与必需 Knowledge/downstream 汇总 hash 更新，共四个现有字段；所有其他字节、历史 Source 检视回执、Q/X、Learning 和私人证据均保留。真实 Current-owner validator 得 **159/159 owner PASS；Surgery 38 单元/59 绑定/52 Block/7 Learning PASS**，精确见证负例仍拒绝。

### 实际执行结果及证据上限

- canonical 内容读取 **196 PASS**：A1 B1–B12、A2 R1–R12 与原异构样例，含完整模型、每个原注释一次、隐藏注释及错误身份/范围反证。
- prepared Memory **A2 212 / A3 229 / B 611 PASS**；原 pre-entry **A3 89 / B 327 PASS**。这些结果在五项最终 Core 修正、20 个 Learning 字符串及全部 23 个 cue hash 写入后取得。
- 26 份原教学材料真实 marked HTML/native title/Prompt 检查 **2,498 PASS**。原 post-Chat controller/stage/evidence bridge 对 A1 12、A2 12、A3 14 块 PASS；B 的 38 块/170 LG/600 KP controller 与独立 Source raw-owner 变异 PASS。均为原生或合成 DOM/storage 证据。
- Semantic Adapter、Projection Python self-test/Current reconciliation、Representation、Production Projection、Learner Object、B/C/D compatibility、Learning 及 Learning-owner lifecycle PASS；Source Visual/Extension、A3 Source、A2 Runtime、A2 repair-return 与 A2 evidence 单独执行 PASS。
- `npm run validate:xizong` **整体未通过**：在未修改的 `validate-xizong-functional-first.mjs` 第 55 行触发 `runtime-group-close-does-not-check-missing-recall`。已在冻结的 `09ce94b…` 工作树完整复现同一失败；该脚本、gate helper、runtime 与 loader 逐字相同。脚本查找旧 `!state.ratings?.[id]` 单条件整句，而实际同一位置检查 `!state.ratings?.[id] || needsFreshKpRecall(state, id)`。保留原脚本，不将此批写成全套 PASS；后续六个 gate 已单独执行并通过。
- 现有原图、Source-contact、定位冲突及六项未准入 cue 未关闭。实际看过的既存 crop 不等于重审所有原 PDF 像素。没有浏览器录入、真实学习/掌握、Memory 重新准入或 Stable 发布证据。

最终提交与 PR 的确切 CI、统一 Astro 构建和浏览器结果以交付记录为准；前批已观察到的 Politics 投影版本问题仍归其原 owner。本回执不将仓库其他内容的报错解释成医学审查结论。

---

<a id="a2-teaching-adoption-20261006"></a>
<a id="a2-r02-r03-deep-model-quality-20261008"></a>
## 2026-10-08｜R2–R3 连续模型与原有依赖深度复核

**限定内容与原生消费者验收：PASS。范围为 R2、R3；不提升原图、浏览器、Stable 或真实学习 U 的验收。** 本次依 [#1113](https://github.com/kianwang022-hash/kianos/issues/1113) 和现有 [Learning Contract §0](../../../LEARNING_CONTRACT.md#learning-outcome)、[Lecture Replacement Contract §3.1–§4](../../learner/LECTURE_REPLACEMENT_CONTRACT.md#teaching-topology-annotations) 持续推进。A1 深验已由 [#1277](https://github.com/kianwang022-hash/kianos/pull/1277) 交付；R1 的既有验收保留，不从此处外推其余 A2 或全部 A/B 的医学质量。

### 原位模型与实际阅读入口

| 唯一 canonical owner | 已实读、交叉复核的医学关系 | 原完整标题与 Prompt |
|---|---|---|
| [R2 肺换气、气体运输与呼吸调节](./blocks/Block2_肺换气_气体运输与呼吸调节_学习阅读版_v1_最终执行版.md)，blob `66439342b04a031869535068055ef30a2642263b` | VA 与 Q 同时供给交换单位；梯度定向、膜条件约束通量；O₂ 去程与 CO₂ 回程由 Bohr/Haldane 耦合；外周/中枢输入并行，通气输出回调血气。氧合、携氧、利用和 CO₂ 排出分别定位，呼衰类型依条件和实际血气。 | 16 项，原样附于对应自然节点；隐藏括注后仍有完整关系与反馈。 |
| [R3 COPD](./blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md)，blob `11f169fb064d0f192e1c505e84036d84202262fc` | 气道/肺实质损伤按表型并行汇合；呼气受限与呼气时间不足解释动态未排空/PEEPi；区域 VA/Q、弥散面积、整体有效通气分开；肺高压、右心负荷、呼衰和气胸各接自己的上游；稳定与急性处理按当前状态选择。 | 21 项，原样附于对应自然节点；测量和症状是观察，未被写成病因阶段。 |

原 System、37 个完整 native KP 记录和所有解释性 Core 保留；对 12 个 A2 Block 的实际 native 读取也证明 **236 KP × 10 个字段**均与原复核基线 `4ad568852c6ecda4c584c14196ac25ec9da26105` 相同，涵盖 identity、title、Prompt、Core、Source/Outline 和组归属。旧 teaching 全文未改，其有效解释继续接在 Current 模型的对应节点；[正常 Chat 入口](../../learner/README.md#accepted-a2-respiratory-teaching-basis) 已选择这两份 canonical §1A，教学与压缩复述使用同一原文。实际 `--model` 与原生检查返回完整 authored 模型，不再选择旧 teaching 的顺排目录。

模型区之外仅有三个明确同步点，均消除与既有 Core 的矛盾：R2 MI-G14 区分严重低氧与过高 CO₂ 的直接抑制；R2 Exit12 不再预设 CO 中毒 PvO₂ 恒下降；R3 Exit11 不再预设所有 COPD 必经“先动态、后静态顺应性”的时序。其余 MI-G/MI-D、Exit、学习切片、出处和图门禁逐字保留。Learning 仅修正 R2/R3 各自 first-pass focus 与 recall spine，以及 R2 LG01 的 closure（梯度决定方向、膜厚/面积影响通量）；组成员、stop lines 和其他政策未改。

### 既有 Memory 的真实依赖变化

保持原 **32 条 cue、26 项 prepared admission、17 个 visual binding**，所有 item、完整答案、助记、ID、anchor、成员、Core refs、Source 和六项未准入状态不变。五项既有 `owner_sha256` 在逐字段对比原/当前 owner 后最小更新：`a2-r01-kp02-precision`、`a2-r02-kp03-precision`、`a2-r02-lg04-precision`、`a2-r03-lg03-precision`、`a2-r03-lg05-precision`。R1 KP02 的既有 R3 KP06 依赖，以及 R3 LG05 的既有 R2 KP15 依赖均保留，未凭本地 Block 文件未变而漏掉跨块影响。

这些 Learning 变更具有真实语义。当前 descriptor 保留 R1 KP02、R2 KP03/LG01/LG04/Block、R3 LG03/LG05/Block 及相关五张卡的实际 revision 变化；未将其归零为纯包装等价，也未改私人历史或制造完成/掌握。26 个物理 receipt 均与实际 `preparedNativeCueWitness` 相符，12 个实际 descriptor 与写入前审定候选一致。原 frozen golden 不变：测试先严格断言已审新值，再在独立比较副本中恢复精确列出的历史元数据，继续校验全部原答案、身份、上下文及未变字段；任意答案、owner、revision 或缺卡的变异仍失败。

### 从原历史见证复核的题目关系

原 R2/R3 共 **58 条**正式关系全部对照完整题干、选项、题型、答案和原映射理由。使用四个原 effective Knowledge blob 的实际 native 快照，以及 43 个原 Question Truth blob；58 个正式题目对象与原 Truth 逐对象相同。原基线已有 51 条 stale，不能用本次 Core 未变自动续签这些旧见证。

- **8 条**原映射 scope 的 Core、identity/title 与 Current 精确连续，保留原医学理由；**49 条**经实际 Current 题目复审后保留原 target 并写入新的逐题理由。
- **57 条 current / 1 条原样保留 stale**；正式题目和答案、Primary/supporting、原有 Block 级路由均不改。其余关系逐对象保留。全库此时为 **1,842 current / 1,201 stale / 3,043 总计**，1,200 条非 R2/R3 stale 与 A1 已交付版本完全相同；全库 strict freshness 仍非全绿。

| 保留原 stale 的正式题目 | 精确证据缺口与边界 |
|---|---|
| `xizong-official-2015-n009`，原 Primary `respiratory-r02-kp05` | 题干写“吸入气的氧分压大于 60 mmHg”，原 Primary 定义氧分压/含量/容量/饱和度；KP07/11 的饱和度阈值是动脉血 PaO₂，不能直接代替吸入气或肺泡 PO₂。现有 Explanation 也混写区室，未建立独立 Source conflict 边界。本轮保留原整条关系、答案和 target，不改题干来制造通过。 |

### 实际执行与未提升的证据

- 原内容入口检查 **158 PASS**，覆盖 A1 全 12 Block、R1–R3 及既有异构样例；包括 R2/R3 完整原文、37 个准确注释、隐藏注释、错误身份反证和实际 CLI。
- 原生 prepared Memory **A2 212 / A3 229 / B 611 PASS**；既有 pre-entry **A3 89 / B 327 PASS**。两份历史 raw/pre-entry 基线均从原输入独立复现；R2/R3 在这个旧 pre-entry consumer 的 Framework 原本与当前均为 absent，唯一实际输出差异是已审 R2 MI-G14。此测试不冒称该 consumer 新增了 Framework 恢复。
- A3 browser 脚本只将原历史 descriptor 比较接入同一已验证断言，语法检查 PASS；本轮未运行 browser。生产 runtime、全部原 fixtures/goldens 与工作流未改。
- 原生题目 manifest 同步与正常 Crosswalk 检查 PASS。保留一个有具体证据缺口的 stale，不降低 fail-closed 规则。
- Semantic Adapter、Production Projection 与 Projection Current reconciliation PASS；159/159 Current owners 和 Surgery 的 38 单元/59 绑定/52 Block/7 Learning 依赖仍 PASS。本次 R2/R3 Projection 使用既有 `RESOLVE_BINDING` / `OWNER_REF`，没有失效的 strict canonical witness 或旧自然语言 selector，未添加派生补丁。
- 保留 R2 的 65 可见 Outline 行与 catalog 64、原 O₂/CO₂ 符号差异、CO 旧说法等既有 Source 边界；R2 10 项、R3 14 项原图门禁未因模型或已存在资产而关闭。R2 三张既存图的本轮检视不代表全部原 PDF 像素已复核。

本回执不承诺学习者已接触原 Source、进入 Recall、掌握模型或产生私人 Memory/Repair 证据。网站构建及浏览器结果以该批 PR 的确切 CI 为准；A1 阶段已证实的 Politics 投影版本阻塞仍归其原 owner。

## 2026-10-06｜A2 teaching and prepared Memory System adoption

**Status: ACCEPTED — respiratory-r01 through respiratory-r12 only.** Under Kian's task-scoped one-System authorization in [#1113](https://github.com/kianwang022-hash/kianos/issues/1113), this receipt adopts the twelve reviewed compact teaching/same-model compressed-review inputs and their bounded post-Chat/prepared-Memory integration in [#1207](https://github.com/kianwang022-hash/kianos/pull/1207). The tested product head is `428d41d7d50faaac3dc95f1653f0831d684b8c50`; the [normal Chat route](../../learner/README.md#accepted-a2-respiratory-teaching-basis) lists all twelve exact inputs.

**Reader-consumption correction (2026-10-06):** the [bounded A2/A3 repair receipt](../a3-urinary/ACCEPTANCE.md#a2-a3-reader-consumer-repair-20261006) supersedes the earlier blanket compressed-reader/external-route proof for these twelve inputs. R5–R8 regain existing model-node full Prompts; R9–R12 receive existing-owner footer routes; R1–R4 are unchanged. The accepted model, Core, all prepared identities/answers and all six unadmitted cues below are preserved. The linked receipt owns the exact repair proof and remaining delivery/U limits.

### Teaching and existing-owner scope

- All twelve actual compact defaults and expanded narratives were independently read against Current System/Learning and [Learning Contract §0](../../../LEARNING_CONTRACT.md#learning-outcome). Their natural models, full canonical title〔Prompt〕 bindings, System bridges and model/external coverage retain **236 KP / 62 LG**, all **111 MI-D topic destinations** and the original visual/Source obligations. These are observed accounting results, not an instruction to derive topology from KP/LG order or make 111 cards. R8→R12 respiratory-failure support and R9's exact arrhythmia qualifier were corrected before reader freeze.
- The twelve reader files are byte-preserved from independent acceptance. Their original `CANDIDATE_DERIVATION` headers and candidate wording remain review-time provenance; this receipt supersedes that admission boundary only for this exact teaching use. `medical_authority:false`, dependency freshness and original Source limits remain binding. No new canonical medical model, Core, System, Learning membership, question relation or visual asset is introduced.
- **26 original Precision identities are admitted: 16 KP-owned and 10 LG-owned.** All **32 original cue IDs, cue text, KP/LG anchors and ordered memberships**, plus all **17 visual cues**, remain intact. Existing `shared-fields.json#/precision_fields/{cue-id}` owns each complete answer, condition, aid and provenance; the existing A2 index alone admits it through a discriminated `NATIVE_CUE` ref. Whole native member/Core witnesses and every required dependency's identity/metadata/Block qualifications fail closed on missing, stale, moved, duplicate or extra witnesses. No new registry, parser, cache, per-member card, fake KP owner or dependency-created learning target is added.
- All **176 A1 prepared identities and native descriptors** remain unchanged. Genuine LG cards keep empty `kpId` and real `logicGroupId`; historical owner equality, evidence, marks, released-at and content history survive. A2 same-ID owner-context upgrades now retain the old context/resolution/owner in the existing history path. Both generic A2 descriptor paths omit new fallback cards for unadmitted cues, while general historical records remain preserved and selected prepared views exclude them.

### Exact admission holds and Source limits

Six original cues remain unadmitted; no partial answer or broad-Core fallback is relabeled as their exact delivery:

- `a2-r04-lg03-precision`: missing FeNO numeric scope and unspecified weekly PEF calculation.
- `a2-r04-lg05-precision`: course severe-attack PEF percentage lacks its denominator.
- `a2-r07-lg05-precision`: PPD millimetre thresholds absent from frozen Current.
- `a2-r08-lg05-precision`: the original additional low-frequency imaging-number scope is unsupported.
- `a2-r09-kp18-precision`: requested acute-PE ECG numbers are absent; chronic-cor-pulmonale numbers are not substitutes.
- `a2-r07-lg06-precision`: at this 2026-10-06 adoption, the treatment proposal remained unadmitted because Learning said 足量 while Core said 适量. The [2026-10-08 bounded review](#a2-r01-r04-r12-deep-model-quality-20261008) synchronizes that Learning wording; the original unadmitted state still remains. This historical receipt did not itself amend Learning or admit the proposal.

R4 and R7 consequently have zero prepared availability. Supported Core, unchanged awareness cues and Source destinations remain accessible. R12's candidate-only AB/SB standardization definition remains excluded; the existing A3 destination is routing, not a new A3 review. R6/R11 pathology page-locator conflicts, R9's partial different-source visual support, original question-count discrepancies and R1/R10 older Extension shortcuts keep their recorded boundaries. Frozen Current course/drug/procedure/oxygen/edition qualifications remain explicit; no fresh original-PDF pixels, guideline validity, Source contact or clinical competence is claimed.

### Executed native and actual consumer proof

- Independent native/adversarial proof passes **212 checks** with frozen pre-integration content/identity oracles. Independent execution of the actual shipped A2 controllers passes **58 checks**, including the reproduced/fixed R11 title/sidebar answer leak. A1 actual controllers pass **46** and A1 native regression passes **60**. All **12 A1 + 12 A2** post-Chat controller fixtures retain Source, visual, prerequisite, TTSX and completion gates, save-failure behavior and real rating semantics.
- [Final Memory CI run37472841320](https://github.com/kianwang022-hash/kianos/actions/runs/37472841320) built the actual website and passed **13 grouped A2 browser cases**, the unchanged **25 A1 prepared cases**, **54 Workspace cases** and **36 genuine full-release cases**. [Artifact11417587778](https://github.com/kianwang022-hash/kianos/actions/runs/37472841320/artifacts/11417587778), ZIP SHA256 `f3ae0e249270749f2efcda84ff123c13588c8d0a4119d1cc3f15f5f5f5e8248d`, was independently hash-verified and actual screenshots inspected.
- A2 browser cases cover KP R1, true multi-KP LG R2, qualified anticoagulation/procedure/staging/ventilation samples R9–R12, held KP/LG/R7 LG06, old same-ID owner-context history, Browse, hidden Recall, full Reveal, explicit rating, reload/reopen, failed availability/rating save and unavailable-writer behavior. The final R11 KP21/KP22/LG whole visible Recall screenshots show original answer-free cues in headers and the complete sidebar; numeric T thresholds and contralateral M/N answer assignments no longer leak from canonical owner titles. Browse retains the canonical titles; content/identity/evidence are untouched.
- [Final Block Workspace run37472841014](https://github.com/kianwang022-hash/kianos/actions/runs/37472841014) passed **78 checks** in the actual built-preview KP Learn/Recall journey, including iPad Source-confirmation reachability, exact native title/position, personal Prompt/marks, clean Front, Source/TTSX and completion semantics. [Artifact11416524546](https://github.com/kianwang022-hash/kianos/actions/runs/37472841014/artifacts/11416524546), ZIP SHA256 `3eb57e26c3d0583ca9f6f960f12d6ed45e7193e50f47a0b2d2f4a7d947837d1c`, was independently hash-verified; final iPad and clean-Recall screenshots were read. A development-only Astro toolbar was the proven earlier hit-test interceptor; the same assertion now tests the built product. Display-number heuristics were replaced by exact canonical-title/native-ID assertions, not removed. No product layout was changed for that environment defect.
- Overall exact-product CI is **9 PASS / 4 known-owner FAIL**, not all green. [A2 relation](https://github.com/kianwang022-hash/kianos/actions/runs/37472841168), [B+C](https://github.com/kianwang022-hash/kianos/actions/runs/37472841077), [Mac](https://github.com/kianwang022-hash/kianos/actions/runs/37472841706) and [QA Return](https://github.com/kianwang022-hash/kianos/actions/runs/37472840987) retain their earlier-main exact failures: `reviewed_relation_question_exists`, `b_biochemistry_repair_missing_axis_fails_closed`, `wrong_auto_flips_to_back` and `reviewed_wu_creates_one_visible_memory_repair:0`. Their existing owners remain responsible; no assertion, mapping rule or source witness was weakened to make this batch pass.

### Evidence and delivery boundary

The current Learning Contract's lawful sequence is Chat model → native KP retrieval/prepared Memory → Block/System reconstruction → broad Lecture/question calibration. Earlier Lecture-first engineering sequences below retain their recorded scope; they are not the sole legal entry for these accepted Chat lessons. Navigation, post-Chat entry, dependency reads and prepared availability alone create no Source contact, Learned, rating, completion, full-Block release or Today debt. Explicit Recall observations and later genuine completion retain their existing native requirements.

**Learner U remains UNTESTED.** This scoped adoption does not mean Kian has studied Respiratory, viewed original images, mastered the content or created due work. It does not adopt other Systems, the whole #1150 branch, legacy/Library retirement or unrelated performance/relation repairs. Main merge placement and actual Current/Stable served-SHA delivery are separate claims; this receipt does not assert either.

---

## Gate status

```text
S  PASS
K  PASS — fresh bottom-up re-accepted
L  PASS
P  PASS
R  PASS — executed Functional First browser journey
E  PASS — executed state/evidence/repair journey
U  UNTESTED by every real learner path
```

Allowed conclusion:

> **A2 Respiratory is Functional First ready for actual study. S/K/L/P/R/E are accepted for the recorded scope. Every real learner U path remains UNTESTED.**

Not allowed:

> learner-validated / Respiratory learned / System Recall due now / questions due now.

---

## Current evidence boundary

### S — PASS

Current Source scope remains exactly **359 official A2 Question Truth IDs** under the accepted fail-closed source boundary. The fresh audit found no evidence requiring a new A2 Source unit merely because a topic is clinically interesting outside Current 306 scope.

### K — PASS · fresh re-accepted

The fresh audit independently attacked completeness, minimality and ownership rather than treating stable counts or old Acceptance as the answer.

Accepted result:

- **12 canonical Blocks / 236 stable KPs / 62 Logic Groups** remain;
- no Block/KP split, merge or renumber is justified;
- R1/R2/R3/R4/R5/R7 remain coherent natural units;
- the most suspicious combined Blocks also survive minimality attack:
  - R6: chronic suppuration + structural destruction + drainage/cavity discrimination;
  - R8: restrictive–diffusion–hypoxemia discrimination across ILD/silicosis and related alveolar patterns;
  - R9: chronic PVR load vs acute pulmonary vascular obstruction under one RV-load model;
  - R11: lung-cancer Primary with a small mediastinal spatial-localization tail;
  - R12: shared oxygenation/ventilation failure endpoint;
- no new medical Block or broad Content rewrite is required.

A real System-level defect was repaired:

- old failure language omitted **blood O2-carrying / oxygen-content failure**, even though R2 teaches that PaO2/SaO2 does not equal Hb/CaO2 or tissue oxygen delivery;
- broad “persistent structural destruction / occupying lesion” was demoted from primitive status because those diseases compose from more specific functional failures;
- ventilatory mechanics/pump failure is now separated from respiratory controller/neural-drive failure;
- a judgment axis explicitly distinguishes **PaO2/SaO2 hypoxemia vs Hb/CaO2 carrying failure**;
- matching `a2-respiratory-pathways.json` failure views were reconciled.

Current minimal A2 failure language is:

```text
FM1 airway obstruction
FM2 ventilatory mechanics / pump expansion failure
FM3 alveolar filling or collapse
FM4 diffusion-membrane failure
FM5 V/Q mismatch
FM6 pulmonary vascular resistance / pathway failure
FM7 respiratory controller / neural-drive failure
FM8 blood O2-carrying / oxygen-content failure
```

Complete anemia, toxicology and other non-respiratory etiologies remain with their owning Systems; A2 only owns the interface needed to localize oxygen-delivery failure correctly.

### L — PASS

The accepted Xizong learning constitution remains sufficient and was not expanded during this closure:

`System orientation → Block/Logic Group Lecture-first learning → KP Recall → Logic Group closure → Block Recall → System Recall before questions → official System sweep → smallest-sufficient W/U repair → return → post-question reconstruction`.

Continuous Lecture consumption remains external-primary on iPad/MarginNote. KianOS remains orientation, retrieval, compression, evidence and repair rather than a second mandatory Lecture reader.

No new A2 ritual, Recall layer, question set or learner burden was introduced by the fresh audit.

### P — PASS

No visual redesign was required. Current shared System/Block surfaces project the accepted semantics sufficiently for Functional First use. Presentation polish is not part of this gate closure.

### R — PASS · executed browser evidence

The current Runtime was exercised through a real Playwright browser journey rather than accepted from page existence or source inspection alone.

`Xizong A2 Functional First Journey` run `34755440083` passed after correcting an earlier **test-only locator bug**. The successful journey executed:

- R1 first-learning state write;
- refresh resume at the saved stage/KP;
- premature Recall fail-closed behavior;
- Lecture evidence as a hard Block-completion prerequisite;
- successful Block completion only after required evidence;
- home Continue → recent Block;
- completed-System → System Recall;
- learner-selected whole-paper holdout;
- official System question sweep;
- correct-but-Uncertain state transition;
- W/U repair handoff and return path.

`Static Web Xizong QA` run `34755440116` passed Current validators and Astro build on the same repaired candidate.

### E — PASS · executed evidence semantics

The same browser journey verified the critical evidence contracts in execution:

- an unlearned KP cannot manufacture Recall evidence;
- a Block cannot manufacture `completed=true` without Lecture + Learn + Recall + Block Recall evidence;
- question results remain keyed to real Question Truth IDs;
- stable work is not forced into repair;
- repair input accepts only current real Wrong/Uncertain question IDs;
- precise Question→Block/KP routing uses repository-reviewed relations only;
- routed repair reaches the owning Block through the repair inbox;
- imported repair evidence is `REPAIR_ONLY`;
- repair does not rewrite the original question evidence;
- the original sweep tab/mainline remains available for natural return;
- Current-version evidence guards continue to archive/invalidate stale Block/System/question/repair evidence rather than silently reusing it.

Evidence class:

> **EXECUTED BROWSER ENGINEERING EVIDENCE — NOT REAL LEARNER U**

### U — UNTESTED

No repository, CI, fixture or headless browser run can establish real learner validation. Only Kian's actual use can create U evidence, and U remains path-scoped.

---

## Functional First stop rule

A2 engineering is complete for the current scope.

Do not reopen accepted gates for visual polish or speculative improvement. New work requires concrete contradictory Source, medical, state/evidence, Runtime or real learner evidence and must reopen only the smallest responsible owner.

Visual/interaction implementation may later be delegated to Codex. Codex may improve layout, responsiveness, components and micro-interactions, but must not change canonical medical ownership, Block/KP identity or learner order, Lecture-first semantics, completion/state meanings, evidence semantics, Memory admission, Question ownership/reviewed routing, W/U repair semantics, or repair/return progression.

---

## U paths awaiting real evidence

All remain `UNTESTED` until Kian genuinely uses them:

- sustained System orientation → Block first-learning flow;
- real iPad/MarginNote ↔ KianOS handoff;
- real weak KP Recall → Memory / Chat repair → natural return;
- real completed System → System Recall → holdout → question sweep → W/U repair → post-question Recall;
- sustained multi-session Continue/resume behavior.

Passing one later U path must not silently promote the others.

---

## Truth boundaries

### Artifact Truth

- System owner → `content/xizong/knowledge/systems/a2-respiratory/system.json`
- medical Core → `content/xizong/knowledge/systems/a2-respiratory/blocks/`
- lane learning semantics → `content/xizong/LEARNING_CONTRACT.md`
- detailed learning policy/support/pathways → `content/xizong/knowledge/learner/`
- official questions / explanations / reviewed relations → Xizong content roots
- learner Runtime / Functional First journey → `static-web/`

### Learner Truth

Private learner/browser/conversation evidence only.

This Acceptance does not mean Kian has started Respiratory, reached any Recall stage, attempted official questions, created repair/review debt, or validated any U path.

## R1 continuous causal teaching model / full-Prompt acceptance — 2026-10-08

**Bounded content / derived-consumer verification: PASS. Live learner acceptance: UNTESTED.**

This scoped improvement implements existing [Xizong Learning Contract §0](../../../LEARNING_CONTRACT.md#learning-outcome) and [Lecture Replacement Contract §3.1–§4](../../learner/LECTURE_REPLACEMENT_CONTRACT.md#teaching-topology-annotations); no new learning rule, standalone asset or extra learner step is created.

- **Current owner:** canonical [R1 Block §1A](./blocks/Block1_正常通气力学与肺功能_学习阅读版_v1_最终执行版.md) (Git blob `335ed66dd2ba02d79d03ce2a894e3350a4289d18`). It replaces only the compressed in-model Prompt tree with one authored continuous physiological flow: respiratory-muscle input → pleural mechanical coupling / transpulmonary pressure → alveolar-versus-atmosphere pressure gradient → gas flow; elastic/airway resistance modify this same process, with capacities, spirometry and effective ventilation remaining **measurements**, never upstream drivers. Pressure/flow conditions, inspiratory/expiratory phase differences, obstruction/restriction discrimination and downstream R2/disease boundaries remain explicit. Measurement-first is still permitted as a preparatory vocabulary order; it is not represented as a causal stage of ventilation.
- **Identity/preservation:** exactly 15 current titles and full formal Prompts are attached to existing mechanism, load, evidence and reconstruction locations. Hiding every annotation leaves a continuous physiological model; it does not rely on KP order for medical arrows. All text outside §1A is byte-identical to pre-change canonical R1, including all 15 KP identities, original titles/Prompts/Core, Source/Outline and diagram gates, MI-G/MI-D and existing review conditions. Current reviewed Memory/Precision and private learner state were not changed. Remaining A2 Blocks and A1 B1/A3 B5/B D8 models were not modified.
- **Native consumer:** the existing read-only `inspect-xizong-content.mjs respiratory r01 --model` returns this exact Current model, not a separate diagram. The existing learner route now selects canonical R1 §1A as the primary model; old b01 teaching is optional explanatory presentation, not alternate medical authority. Cognitive Projection's single R1 Core blob witness was refreshed because its unchanged original owners are still used by the Website.
- **Actual verification:** 99 content-inspection checks, native semantic adapter, Production Projection, Projection Current reconciliation, reviewed relation freshness and question-manifest synchronization all PASS in the isolated candidate. Three current reviewed Question→Knowledge records referring to R1's prior whole-file blob update only their `knowledge_revalidated_blob_sha`, after confirming the text outside §1A is identical. Question mapping, formal answer, source-revision witnesses and primary/support identities remain unchanged; the manifest was regenerated by its native synchronizer.
- **Limits:** the bounded checks do not assert independently reaudited original Source accuracy, real source contact, user understanding, Memory re-admission, website Stable release, full A/B 76-Block quality acceptance or real learner U evidence. Existing unrelated A1/A2 browser assertions and historical acceptance remain separately owned.
