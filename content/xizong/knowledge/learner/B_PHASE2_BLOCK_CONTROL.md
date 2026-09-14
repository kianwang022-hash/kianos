# B Phase 2 Block Control — 38/38 fresh Learning-control review

Status: **PHASE2_CONSTRUCTION_LEDGER — NOT A SECOND LEARNING OWNER**  
Scope: `B — Digestive / Metabolic / Endocrine / Tumor`  
Execution task: GitHub Issue `#135`  
Inputs: `B_PHASE0_LEARNING_CALIBRATION.md` + `B_PHASE1_ROUTE_DECISION.md` + Current canonical Block owners  
Canonical B Learning owner remains `b-digestive-metabolic-endocrine-tumor-learning.json` and is still `L_CANDIDATE`.

This ledger freezes the Phase-2 Block-level construction decisions. Runtime / Projection must not consume it. It deliberately does **not** rewrite every Logic Group `goal / closure`; that is Phase 3. The final single B Learning owner should be compiled only after Phase 3 has reconciled route + Block controls + final LG semantics, avoiding a half-upgraded canonical owner.

---

# 1｜Phase 2 verdict

**PASS — 38/38 Blocks fresh-reviewed at the Learning-control layer.**

The review confirms that B's main defect is not Block identity or medical Core. Current Block centers and recall spines are generally strong. The systematic debt is the control layer around them.

Aggregate disposition:

```text
first_pass_focus
  KEEP                              38 / 38

stop_line
  UPGRADE                           38 / 38

recall_spine
  KEEP                              36 / 38
  UPGRADE                           M2
  REPARTITION / learner-order fix   G5

prerequisites / hooks
  UPGRADE / make explicit           38 / 38

LG partition at Block-level review
  KEEP as Phase-3 hypothesis        36 / 38
  REPARTITION                       D15
  REORDER / REPARTITION             G5
```

Important negative result: Phase 2 did **not** discover a reason to reopen the accepted 38 Block / 600 KP medical Core.

---

# 2｜Shared Phase-2 control contract

Every B Block must eventually expose these Block-level controls in the single Learning owner:

```text
first_pass_focus
stop_line
recall_spine
requires[]
benefits_from[]
reactivates[] / returns_to[]
partition_verdict
partition_rationale
```

Rules:

1. `requires` is a true readiness gate, not a copied frontmatter Recall list.
2. `benefits_from` reduces cognitive load but may never manufacture a hard scheduler dependency.
3. `reactivates / returns_to` names deliberate later reuse of an already learned model.
4. `stop_line` must say what tempting content stays out and where it really belongs.
5. `partition_verdict=KEEP` means only “plausible enough to enter Phase 3”; it is **not** final LG acceptance.
6. Current LG `goal / closure` templates remain unaccepted until Phase 3.
7. Stable KP identity is frozen; a Learning repartition may reorder/group KPs but may not silently split, merge, renumber or medically rewrite a KP.

---

# 3｜38/38 Block decisions

## GI normal foundation

### D1｜胃肠管道控制

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [] inside B
benefits_from      []
reactivates later  D2, D9, D12, D14
partition          KEEP (3 groups; KP06 singleton justified)
```

**Accepted stop-line:** 只建立正常胃肠管道的平滑肌—ICC慢波—阈值/AP—ENS—外在自主神经—Ca²⁺执行底座。GERD、贲门失弛缓、IBS、肠梗阻和先天性巨结肠只作机制验证，完整诊疗回 D9/D12/D14 等正式 owner；口腔/LES/胃及胰胆小肠的具体运动与分泌进入 D2–D3；完整受体药理不在本 Block 扩写。

**Partition rationale:** KP01–03 构成节律→阈值→收缩强度；KP04–05 构成本地 ENS 与全身自主改档；KP06 从网络/电控制切换到 Ca²⁺–CaM–MLCK 分子执行，单独成组是层级边界而非凑数。

### D2｜口腔、食管与胃

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D1]
reactivates later  D3, D9, D10, D11
partition          KEEP
```

**Accepted stop-line:** 当前只完成口腔/吞咽/LES正常放行、胃容纳—磨碎—排空、胃液细胞地图、胃酸调节与黏膜防御。GERD/失弛缓归 D9，胃炎/HP/PUD/UGIB归 D10，食管胃肿瘤归 D11；十二指肠后的胰胆消化进入 D3；不扩写完整胃肠药理。

**Partition rationale:** 入口/LES、胃运动、胃液调节、黏膜防御是四个连续但可独立闭合的正常功能问题；KP12 单独保留是“侵袭—防御”层从分泌切到屏障的真实转折。

### D3｜胰液、胆汁与小肠消化

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D2]
benefits_from      [D1]
reactivates later  D4, M6, D19, D20
partition          KEEP
```

**Accepted stop-line:** 当前只建立十二指肠酸负荷→促胰液素/HCO₃⁻、CCK→胰酶/胆囊、酶原激活、胆盐乳化/混合微胶粒以及肠道混合推进。脂质进入上皮后的吸收运输归 D4；胆汁酸合成归 M6、胆红素代谢归 M10；胆石/胆道感染与胰腺炎/肿瘤完整模型归 D19–D20。

**Partition rationale:** 胰液/酶原、胆汁脂肪处理、肠运动、激素比较/故障定位分别回答分泌、脂质处理、机械混合和整合判断四个问题。

### D4｜小肠吸收与营养运输

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D3]
benefits_from      [D2]
reactivates later  M5, M7, M8, D5, D12
partition          KEEP
```

**Accepted stop-line:** 当前只建立“腔内已拆解的小分子怎样跨上皮并分流到门静脉/淋巴”，以及 B12、铁、钙的准入门槛。完整贫血归血液系统，PTH/钙磷疾病归 D23，IBD/肠结核归 D12，短肠/复杂营养支持归 D5/相应外科 owner；不把本 Block 扩成全套水电解质转运体目录。

**Partition rationale:** 一般吸收界面/血淋巴去路先立坐标；B12和长链脂质作为特殊接力路线比较；糖/肽/铁/钙最后按选择性转运收口。

---

## Metabolic network

### M1｜蛋白质、酶与维生素

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [] inside metabolic B
benefits_from      [D4]
reactivates later  M2–M10, G1–G5, D20
partition          KEEP as Phase-3 hypothesis; LG02 requires explicit challenge
```

**Accepted stop-line:** 当前只建立蛋白结构—功能、酶活性/动力学/调节、辅因子/维生素共同语言。GSH–NADPH归 M3，一碳单位及氨基酸/尿素归 M8；完整疾病、药理抑制剂长表和维生素缺乏症状长表不在这里展开。

**Partition rationale:** 结构/折叠、蛋白物化与处理、酶动力学调节、辅因子/维生素四块可作为不同认知任务。LG02 的“等电点—评价—分离/降解”并非明显因果链，Phase 3 必须用比较/技术地图而非“主链”语义重新证明边界；Phase 2 不先拆。

### M2｜碳氧化、TCA、OXPHOS与ATP

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       UPGRADE (Phase-0 calibrated four-flow model)
requires           [M1]
reactivates later  M3, M4, M6, M7, M8, D5, D7, D8, D21
partition          KEEP
```

**Accepted stop-line:** 当前只建立葡萄糖碳流如何生成还原当量、还原当量怎样经呼吸链建立质子势能并形成 ATP。成熟 RBC/2,3-DPG/G6PD–GSH归 M3；糖原/糖异生/Cori归 M4；脂肪酸β氧化/酮体归 M7；甲状腺、中毒和肿瘤只作能量模型验证，完整疾病回各自 owner；低频抑制剂长表和线粒体遗传病谱不占当前主线。

**Recall spine:** 糖酵解→乳酸再生NAD⁺/PDH进线粒体→TCA产还原当量→穿梭→I/II–Q–III–Cyt c–IV电子流→I/III/IV泵H⁺→F₀/F₁→P/O与30/32→按电子/质子/ATP三流定位抑制/解偶联。

### M3｜成熟RBC与PPP

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [M2]
reactivates later  M7, M8, M9, M10
partition          KEEP
```

**Accepted stop-line:** 当前只建立成熟 RBC 无线粒体条件下的糖酵解 ATP、2,3-DPG 与 PPP→NADPH→GSH 抗氧化。完整糖酵解/TCA/OXPHOS回 M2；糖原/糖异生归 M4；G6PD缺乏完整溶血证据归血液系统；核苷酸归 M9、一碳归 M8，Hb完整结构/氧解离曲线回呼吸/血液。

### M4｜糖原与糖异生

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [M2]
reactivates later  M7, M8, D5, D7, D8
partition          KEEP
```

**Accepted stop-line:** 当前只建立 G-6-P 分流、糖原存取、肝肌差异、糖异生绕行/Cori及最低空腹调节。胰岛素/胰高血糖素完整全身控制归 D7，糖尿病/DKA/HHS归 D8；脂肪酸/酮体归 M7，氨基酸碳骨架归 M8，肾糖异生与酸碱回泌尿系统。

### M5｜血浆脂蛋白

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [M1]
benefits_from      [D3, D4]
reactivates later  M6, D7, D8
partition          KEEP
```

**Accepted stop-line:** 当前只建立 CM/VLDL/LDL/HDL 的来源—载荷—去向，以及 apo/LPL/LCAT/受体决定颗粒命运。胆固醇合成/胆汁酸归 M6，TAG合成/脂解/β氧化归 M7；高脂血症完整临床、降脂药物与 AS/冠心病诊疗不在本 Block 重建。

### M6｜胆固醇、磷脂与胆汁酸

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [M1, M2, M5]
benefits_from      [D3]
reactivates later  M7, M10, D19, D22, D23
partition          KEEP
```

**Accepted stop-line:** 当前只建立胆固醇合成/酯化/去路、胆汁酸与肠肝循环、磷脂合成/分解。胆石/胆囊炎/胆管炎/梗阻性黄疸归 D19；PTH/VitD疾病归 D23，肾上腺类固醇轴归 D22；完整受体信号回 P0/D6，降脂药理与罕见脂质病不展开。

### M7｜TAG、脂肪酸与酮体

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [M2, M3, M4, M6]
benefits_from      [D4]
reactivates later  M8, D5, D7, D8, D20
partition          KEEP as Phase-3 hypothesis; LG03 must be challenged
```

**Accepted stop-line:** 当前只建立 TAG/脂肪酸合成储存→脂解→肉碱穿梭→β氧化→乙酰CoA/TCA或酮体的状态切换。全身胰岛素/胰高血糖素控制归 D7，DKA/HHS归 D8；脂肪肝、脂肪酸氧化遗传病/肉碱缺陷不扩写；完整花生四烯酸炎症/药理网络回对应系统。

**Partition rationale:** 储能、动员/β氧化、酮体输出三段成立；但 LG03 同时含酮体主线与必需脂肪酸接口，Phase 3 必须证明其是“脂质输出/必需性边界”而非机械尾包，必要时重分组。

### M8｜氨基酸、氨、尿素与一碳

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [M1, M2, M3, M4, M7]
benefits_from      [D4]
reactivates later  M9, M10, D5, D7, D17, G3, D22
partition          KEEP as Phase-3 hypothesis
```

**Accepted stop-line:** 当前只建立氨基酸身份/碳氮分流、转氨脱氨、丙氨酸/谷氨酰胺安全运氨、尿素循环、SAM/叶酸一碳。肝性脑病归 D17，巨幼贫归血液，肾 NH₃/NH₄⁺酸碱归泌尿；完整遗传氨基酸病和激素/递质系统不展开；核苷酸去 M9。

**Partition rationale:** LG01 的“身份/活性衍生物/SAM”较宽，但都回答“氨基酸除了作为蛋白原料还能提供什么身份和化学功能”；Phase 3 需用 Map/Compare closure 证明，不得强写因果主链。

### M9｜核苷酸代谢与抗代谢物

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [M1, M3, M8]
reactivates later  G1, G5
partition          KEEP
```

**Accepted stop-line:** 当前只建立嘌呤/嘧啶从头与补救、分解、脱氧核苷酸/dTMP和抗代谢物卡点。DNA/RNA结构、复制、表达、调控、损伤修复归 G1–G5；痛风、血液肿瘤/实体瘤完整诊疗和化疗方案不在本 Block 扩写；低频原子来源/中间产物进 MI-D。

### M10｜血红素、胆红素与生物转化

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [M1, M2, M3, M6, M8]
reactivates later  D16, D17, D19
partition          KEEP
```

**Accepted stop-line:** 当前只建立血红素合成、UCB→白蛋白→肝结合CB→胆道肠道排出、三类黄疸代谢定位以及Ⅰ/Ⅱ相生物转化。完整溶血性贫血归血液；肝炎/肝硬化归 D16–D17，胆石/梗阻性黄疸归 D19；遗传性黄疸/卟啉病、CYP药物相互作用和毒理长表不展开。

---

## Energy / endocrine control

### D5｜能量、体温、应激与临床营养

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D4, M2, M4, M7, M8]
reactivates later  D6, D7, D21–D23
partition          KEEP
```

**Accepted stop-line:** 当前只建立能量测量/BMR、ATP—热—功、产热散热/调定点、应激分解代谢与 EN/PN 选择边界；不重新教学 M 通路。糖尿病/DKA/HHS归 D8，甲状腺/肾上腺/GH等完整疾病归 D21–D23；烧伤/脓毒症/围术期完整复苏与现代复杂营养处方回对应 owner。

### D6｜内分泌共同语言

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [external P0 signal-transduction]
benefits_from      [D5, M1, M6]
reactivates later  D7, D21, D22, D23
partition          KEEP
```

**Accepted stop-line:** 当前只建立激素来源/分泌方式、化学身份/受体、下丘脑—垂体—靶腺轴、反馈、功能过多/过少/抵抗和原发/继发/异位定位语言。甲状腺、肾上腺、钙磷/GH完整疾病归 D21–D23，生殖轴回生殖系统；具体动态试验阈值、药理受体亚型和疾病治疗不在这里堆叠。

### D7｜进食—空腹与胰岛激素

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D5, D6, M2, M3, M4, M5, M6, M7, M8]
reactivates later  D8, D20-functional-islet-tumor interface
partition          KEEP
```

**Accepted stop-line:** 当前只建立正常胰岛 A/B/D 细胞、葡萄糖刺激胰岛素分泌、胰岛素/胰高血糖素对糖脂蛋白的餐后—空腹切换、肠促胰素/神经/旁分泌调节。T1/T2DM、DKA/HHS及降糖药完整决策归 D8；胰岛素瘤等器官肿瘤归 D20；甲状腺/肾上腺/GH完整轴归 D21–D23。

### D8｜糖尿病

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D7]
reactivates        [M2–M8]
benefits_from      [M5, M6 for chronic lipid-risk context]
partition          KEEP
```

**Accepted stop-line:** 当前完整拥有 T1/T2DM分型、DKA/HHS、慢性并发症、糖代谢/β细胞功能检查和当前 Source 支持的降糖治疗；只调用 D7/M2–M8，不重新教学通路。心肾神经眼等器官并发症在本 Block 建立糖尿病接口，但各器官完整诊疗仍归相应系统；不以外部最新指南静默替换当前 306 药物/阈值口径。

---

## Molecular information + Tumor Gate

### G1｜核酸与真核基因组

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [M1, M9]
reactivates later  G2, G3, G4, G5
partition          KEEP; KP10 singleton justified as genome-organization layer
```

**Accepted stop-line:** 当前只回答核苷酸怎样组成有方向的核酸、DNA/RNA结构身份以及真核基因组怎样组织信息。DNA复制/端粒/逆转录归 G2，转录翻译归 G3，表达调控归 G4，损伤修复/癌基因/分子技术归 G5；不提前扩写器官肿瘤。

### G2｜DNA复制、逆转录与端粒

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [G1, M1]
reactivates later  G3, G5
partition          KEEP
```

**Accepted stop-line:** 当前只建立复制方向限制、复制叉/聚合酶协作、原核/真核复制阶段、端粒补全与逆转录。完整转录/RNA加工/翻译归 G3，DNA损伤修复及分子工具归 G5；不把本 Block 扩成抗病毒药或全套实验技术教程。

### G3｜转录、RNA加工与翻译

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [G1, G2, M1, M8]
reactivates later  G4, G5
partition          KEEP
```

**Accepted stop-line:** 当前只建立 DNA→RNA→成熟模板→翻译→折叠/靶向执行链。基因表达“何时/何地/多少”归 G4，DNA损伤/肿瘤控制与重组/PCR等工具归 G5；完整抗菌药、毒素和翻译抑制药理不在此扩写。

### G4｜基因表达调控

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [G1, G3]
reactivates later  G5
partition          KEEP
```

**Accepted stop-line:** 当前只建立染色质可读性、原核操纵子、真核顺式/反式/PIC及转录后调控。转录翻译执行本身回 G3，损伤修复/癌基因及器官肿瘤归 G5/Tumor Gate 后续；不扩展现代全套表观组学/调控组学。

### G5｜DNA损伤、癌基因、重组与分子技术

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       REPARTITION / UPGRADE
requires           [G1, G2, G3, G4, M9]
reactivates later  Tumor Gate → D11/D15/D18/D20/D21 (+ D19 tumor LGs)
partition          REPARTITION learner order; current 3 membership ranges may remain
```

**Accepted stop-line:** 当前只建立原癌基因激活/抑癌基因失活/DNA修复失败的分子失控，以及重组DNA、PCR、杂交、相互作用技术的最低考试模型。病理肿瘤共同形态/行为归 O9；食管胃/结直肠/HCC/胰腺/甲状腺等器官肿瘤回各 D owner；不扩展现代分子分型、靶向/免疫治疗全套指南。

**Accepted learner order:** `KP01–05 → KP12–13 → KP06–11`，即生长控制失效→突变/修复→如何检测/操作；稳定 KP identity 不变。

---

## Endocrine organ branches

### D21｜甲状腺轴及甲状腺内外科

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D6, Tumor Gate for complete Block]
reactivates        [M2–M7, circulation/renal interfaces]
returns_to later   D23 for calcium/PTH
partition          KEEP
```

**Accepted stop-line:** 当前完整拥有 TH合成/储存/释放/作用/反馈、甲亢/Graves、甲减、炎症/结节、四类甲状腺癌及当前 Source 外科安全。完整 CT/PTH/钙三醇和甲旁疾病归 D23；肿瘤共同语言只 Recall Tumor Gate；现代结节风险分层、完整TNM/分子分型/靶向治疗及外部最新指南不静默引入。

### D22｜肾上腺皮质与髓质

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D6]
benefits_from      [M6, M8, circulation/renal interfaces]
partition          KEEP
```

**Accepted stop-line:** 当前只完整建立 GC/HPA、原醛、嗜铬、库欣及其功能确认→病因定位→当前 Source 治疗。D6轴/反馈只 Recall；M6胆固醇前体、M8酪氨酸以及循环/泌尿的受体、电解质语言只作接口，不重新教学；生殖类固醇轴归生殖系统，最新外部动态试验/药物指南不扩写。

### D23｜钙调节、甲旁与GH

```text
focus              KEEP (explicitly two-branch Block)
stop_line          UPGRADE
recall_spine       KEEP, but must preserve two-branch shape
requires           [D6]
benefits_from      [D21, external renal/VitD interface]
partition          KEEP: LG01–02 calcium/PTH; LG03 GH is a true second branch
```

**Accepted stop-line:** 本 Block 有两个并列子模型：① CT/PTH/钙三醇→骨—肾—肠→甲旁减/亢；② GH→IGF→生长与代谢。甲状腺激素/髓样癌和甲状腺手术主体回 D21，肾1α羟化/CKD-MBD完整模型回泌尿系统；不把骨病、肾病或生长发育疾病扩成第二套系统。

**Partition rationale:** 不强行把 GH 接成钙磷因果链；LG03 被承认为同一 canonical Block 内的独立第二轴，Block Recall 采用“双轴并列恢复”而非伪造单链。

---

## GI / abdominal clinical branches

### D9｜GERD与贲门失弛缓

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D2]
reactivates later  D10, D11
partition          KEEP
```

**Accepted stop-line:** 当前只完整建立 LES“关不住”的 GERD 与“打不开”的贲门失弛缓，包括症状、证据与当前 Source 治疗。正常 LES/胃动力回 D2；胃炎/HP/PUD/UGIB归 D10，Barrett/食管胃肿瘤器官模型归 D11；不扩写外部最新GERD指南或全套食管动力学。

### D10｜胃炎、HP、PUD与UGIB

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D2, D9]
reactivates later  D11
partition          KEEP
```

**Accepted stop-line:** 当前完整拥有胃炎、HP、PUD、UGIB、穿孔/幽门梗阻及胃大部切除与术后并发症；D2胃酸/屏障只 Recall。胃癌主体归 D11，肝硬化静脉曲张出血归 D17，阑尾/胰腺归 D14/D20。PPI疗程、HP方案、UGIB时限和胃切除术式只按 Current Study 口径，不用外部最新指南替换。

### D11｜食管与胃肿瘤

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D9, D10, Tumor Gate]
partition          KEEP
```

**Accepted stop-line:** 当前只建立食管癌、胃癌、胃淋巴瘤/GIST的器官特异来源、壁深度/形态、扩散、证据、分期/可切除性和当前 Source 治疗。O9+G1–G5肿瘤共同语言、D9/D10癌前背景只 Recall；大肠肿瘤归 D15，不制造第二套肿瘤总论或外部现代全套系统治疗。

### D12｜肠结核、结核性腹膜炎、IBD与IBS

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [external Respiratory R7 TB model for TB path]
benefits_from      [D1, D2, D3, D4]
reactivates later  D15
partition          KEEP
```

**Accepted stop-line:** 当前只建立肠结核/结核性腹膜炎、UC/CD、IBS 的器官分流、证据、并发症和当前 Source 治疗。结核共同免疫病理回呼吸 R7；正常运动/吸收回 D1–D4；穿孔/急腹症/梗阻的外科动作归 D13–D14，大肠癌归 D15；不扩写完整免疫生物制剂/感染学体系。

### D13｜腹膜感染与腹部损伤

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [external inflammation/shock interfaces]
independent_branch true
reactivates later  D14, D19, D20
partition          KEEP
```

**Accepted stop-line:** 当前只建立腹膜刺激/感染、腹部损伤的出血—污染双轴、穿刺/影像与稳定性驱动的源控制/探查。休克完整血流动力学回循环，炎症修复回 P0；阑尾/梗阻/疝归 D14，肝胆胰急腹症归 D19–D20；不扩写完整创伤指南和围术期系统。

### D14｜肠梗阻、阑尾炎与腹外疝

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
benefits_from      [D13]
reactivates        [D1 mechanics]
returns_to later   D15 obstruction interface
partition          KEEP
```

**Accepted stop-line:** 当前完整拥有肠梗阻分类/部位/绞窄危险、阑尾炎进展、腹外疝/嵌顿绞窄和当前 Source 手术门槛。D13腹膜/污染/休克只 Recall；复杂肠系膜血管外科、现代网片/腹腔镜细节、复杂肠瘘/短肠不展开；隐睾/鞘膜积液归 E9，大肠癌导致梗阻归 D15。

### D15｜大肠、直肠与肛管

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [Tumor Gate for complete Block]
benefits_from      [D12, D14]
reactivates        [lower-GI inflammation/obstruction]
partition          REPARTITION
```

**Accepted stop-line:** 当前完整拥有结直肠癌的部位/扩散/检查/术式及齿状线上下、痔/肛裂/脓肿/肛瘘定位。肿瘤共同语言只 Recall Tumor Gate；IBD癌变背景回 D12，梗阻危险回 D14；完整肝转移/全身肿瘤治疗和外部现代指南不扩写。

**Required Phase-3 repartition:** 当前 `KP13–14｜癌前通路与齿状线坐标` 把两个无连续性的认知任务绑在一起。癌前/分子通路应回结直肠肿瘤链，齿状线应进入肛管定位链；具体新 LG 边界由 Phase 3 对 KP12–15 邻域 fresh audit 后决定。

---

## Hepatic / biliary / pancreas

### D16｜病毒性肝炎

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [external pathology injury/inflammation gate]
benefits_from      [M10]
reactivates later  D17, D18
partition          KEEP
```

**Accepted stop-line:** 当前只建立病毒性肝炎的变性/坏死位置与范围、急慢性/重型形态及病毒特殊病理。M10胆红素只作处理失败接口；完整临床抗病毒、血清学组合和外部指南不在本 Block 重建。肝硬化/门脉/HE归 D17，HCC归 D18。

### D17｜肝硬化、门脉高压与HE

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D16, M8, M10, external repair/fibrosis, external portal-pressure]
reactivates later  D18, D19
partition          KEEP; KP19 singleton explicitly retained as connection/interface LG
```

**Accepted stop-line:** 当前完整建立假小叶重构→肝功能减退+门脉高压→腹水/侧支→曲张出血/SBP/HRS/HPS/PVT→HE，并保留肝硬化特有营养/胆石接口。HCC归 D18，胆石/胆道完整模型归 D19；肾/肺完整 HRS/HPS 模型回相应系统，营养只保留肝硬化特异原则。

**KP19 rationale:** canonical KP19 同时拥有“肝硬化胆石机制 + 分期蛋白/BCAA营养”两个连接接口。K 已冻结，不能把一个 KP 静默拆成两个。它不适合并入 HE LG（胆石半层无关），也不适合并入门脉并发症；因此保留单 KP 的 `CONNECTION / BOUNDARY` LG，Phase 3 必须用接口型 closure，而非伪造一条因果主链。

### D18｜HCC

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D16, D17, Tumor Gate]
reactivates later  D19 imaging discrimination
partition          KEEP
```

**Accepted stop-line:** 当前只建立慢性肝病背景下 HCC 的器官身份、门静脉播散、AFP/增强影像、病理证据、肝储备/肿瘤范围与当前 Source 局部/手术治疗。肿瘤共同语言只 Recall Tumor Gate；不扩写现代全套分期、靶向/免疫系统治疗；胆道/黄疸转 D19。

### D19｜胆汁、黄疸、胆石、胆道感染与肝脓肿

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D3, M6, M10, D17]
benefits_from      [D18]
reactivates        [Tumor Gate for tumor-containing LGs]
returns_to later   D20
partition          KEEP
```

**Accepted stop-line:** 当前只建立胆汁管道从肝→胆管→胆囊→十二指肠的空间故障定位，胆石/胆囊炎/胆管梗阻感染/黄疸/胆道肿瘤接口与肝脓肿。正常胆汁作用回 D3，胆汁酸/胆固醇回 M6，胆红素回 M10；胰腺炎/胰腺肿瘤归 D20；肿瘤 LG 只调用 Tumor Gate，不扩现代胆道肿瘤全套治疗。

### D20｜急/慢性胰腺炎与胰腺肿瘤

```text
focus              KEEP
stop_line          UPGRADE
recall_spine       KEEP
requires           [D3, M1, M7, D19]
benefits_from      [D7, D2 for endocrine/gastrin interfaces]
reactivates        [Tumor Gate for tumor component]
partition          KEEP
```

**Accepted stop-line:** 当前完整建立胰酶提前激活→自我消化/坏死/器官衰竭、集合/证据/干预门槛，以及胰腺癌、胰岛素瘤/胃泌素瘤的器官模型。正常胰液/酶原回 D3，脂代谢回 M7，胆石性入口回 D19；糖尿病全模型回 D8，肿瘤共同语言只 Recall Tumor Gate；不扩写现代全套胰癌系统治疗。

---

# 4｜Phase-2 structural findings for Phase 3

## Confirmed `REPARTITION`

### D15
Current `KP13–14` group mixes:

```text
colorectal premalignant / molecular pathway
+
dentate-line anatomic coordinate
```

These are not one continuous cognitive job. Phase 3 must repartition the KP12–15 neighborhood.

### G5
Membership ranges may remain, but learner order must change:

```text
LG01 KP01–05
→ LG03 KP12–13
→ LG02 KP06–11
```

The molecular-tool group is downstream of understanding what abnormal change exists and why it matters.

## Explicitly NOT repartitioned in Phase 2

- D1 KP06 singleton: valid layer transition to smooth-muscle molecular execution.
- D17 KP19 singleton: retained as a canonical mixed connection/interface KP because K is frozen; Phase 3 must give it an interface closure rather than inventing a false chain.
- G1 KP10 singleton: genome organization is a legitimate abstraction-layer closure after molecule-level nucleic-acid structure.
- D23 GH branch: kept separate from calcium/PTH branch inside one canonical Block; Block Recall must preserve two parallel axes.

## Mandatory Phase-3 falsification candidates even though current partition is provisionally KEEP

- M1 LG02 — pI / protein evaluation / separation / degradation: prove as a comparison/tool map, not a causal chain.
- M7 LG03 — ketone-state logic + essential-fatty-acid tail: challenge split/merge.
- M8 LG01 — amino-acid identity / derivatives / SAM: prove one map/identity job or repartition.
- D21 LG03 — investigation + chronic treatment + RAI/surgery + crisis: challenge whether crisis deserves separate closure.
- D19 tumor-containing gallbladder/bile-duct groups: ensure Tumor Gate reactivation does not fracture source continuity.

---

# 5｜Phase-2 negative-space / falsification

### Alternative A｜Rewrite all focus/spines so every Block looks stylistically identical
Rejected. 38/38 focus statements already answer a real learner problem, and most spines are runnable. Rewrite-by-default would erase useful domain shape and violate optimization-first.

### Alternative B｜Treat every canonical frontmatter prerequisite as `REQUIRES`
Rejected by Phase 1 and re-confirmed here. D5 `M1–M10`, D7 `M1–M10`, D8 `M2–M9` contain broad Recall/interface sets, not all hard readiness gates.

### Alternative C｜Because stop_line is generic, assume Block medical boundary is unknown
Rejected. Canonical Block Core already contains detailed Learn/Recall/Apply/Defer/Source boundaries; Phase 2 restores these to the learner-control layer without changing medical truth.

### Alternative D｜Fix generic LG semantics now while reviewing each Block
Rejected. That would collapse Phase 2 into Phase 3 and encourage template rewriting rather than independent per-LG judgment.

### Alternative E｜Preserve every current LG because coverage is 600/600
Rejected. D15 and G5 already demonstrate that coverage completeness does not prove learner-order/continuity correctness.

---

# 6｜Phase-2 exit gate

**PASS.**

38/38 Blocks can now answer, at the construction-decision level:

> Why this Block now? What model is built? What stays out? What prior model is actually required? What is deliberately reactivated later? What compressed model remains? Why is the current LG partition plausible, or where must it be challenged/repartitioned?

No Block/KP medical Core identity changed.

`P / R / E` remain frozen.

## Next eligible phase

**Phase 3 — full Logic Group semantic re-acceptance across all 600 stable KPs.**

Phase 3 must:

- independently fresh-review every LG boundary and membership;
- replace generic `goal / closure` with cognition-specific semantics;
- execute confirmed D15 repartition and G5 learner-order correction;
- challenge the named Phase-3 falsification candidates;
- preserve 600/600 stable KP coverage without treating the current 150 LG count as a target;
- then compile Phase 0 + Phase 1 + Phase 2 + final Phase-3 LG decisions into the **single canonical B Learning owner**.
