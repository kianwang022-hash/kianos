---
type: block_guide
schema_version: 1
content_version: 1
system: 血液—免疫—感染
system_id: hematology_immunity_infection
batch_id: P22
block_id: hematology-h10
title: 慢性髓系白血病（CML）
order: 10
status: FINAL_EXECUTION
study_refs:
  - source_id: internal-medicine-lecture
    label: 内科学讲义_AI阅读版｜CML与白血病鉴别
    sequence_page_start: 215
    sequence_page_end: 219
    action: primary
  - source_id: hematology-h09
    label: H9｜急性白血病
    action: recall_compare
  - source_id: hematology-h07
    label: H7｜克隆性造血共同语言
    action: recall
  - source_id: pathology-u019-gate
    label: O9｜肿瘤总论 Gate
    action: recall
  - source_id: molecular-g1-g5
    label: G1–G5｜融合基因与靶向接口
    action: recall
outline_units:
  - INT-U085-CML
  - INT-U086-ACUTE-VS-CML
outline_primary_count: 5
kp_count: 10
prerequisites:
  - hematology-h07
  - hematology-h09
  - pathology-u019-gate
  - molecular-g1-g5
next_blocks:
  - hematology-h11
visual_gates:
  - internal-p214-cml-mature-granulocyte-spectrum
  - internal-p214-cml-phase-thresholds
  - internal-p214-ph-bcr-abl
  - internal-p217-acute-leukemia-vs-cml-table
visual_gate_status: REQUIRED_WITH_INTERNAL_ORIGINAL_PDF_GAP
source_gap_status: SOURCE_BOUNDARY_EXPLICIT
source_boundaries:
  - H10-SB01
  - H10-SB02
  - H10-SB03
system_final_batch: false
---

# H10｜慢性髓系白血病（CML）
## 不是“白细胞多一点”，而是BCR–ABL驱动的成熟粒细胞克隆；疾病沿慢性期—加速期—急变期逐步丢失成熟秩序

> **FIRST PASS 固定流程**
>
> `Framework → Lecture → Framework Reconstruction → KP Active Recall → Outline optional / low-pressure → TTSX Lecture-attached Questions → Block Complete`
>
> H9 已完成急性原始细胞病；H10只做“较成熟粒细胞克隆 + 分子标志 + 三阶段进展”，不重复急性白血病全部分类。

---

# 1｜Framework｜把CML看成同一异常克隆的三段电影

## 1.1 中心问题

```text
t(9;22) → BCR-ABL酪氨酸激酶持续驱动
        ↓
粒系克隆持续扩增，但早期仍能一定程度成熟
        ↓
慢性期：中晚幼及成熟粒细胞为主，正常造血尚未完全崩溃
        ↓
克隆继续积累异常
        ↓
加速期：原治疗失效、脾继续大、blast与嗜碱升、血小板失稳
        ↓
急变期：原始细胞突破WHO急性门槛或出现髓外原始细胞浸润
```

CML 的核心反差：

> **细胞“看起来更成熟”不等于正常；数量极多也不等于防御功能增强。**

## 1.2 三个必问变量

1. **成熟谱**：以原始细胞为主，还是中晚幼 / 杆状 / 分叶细胞为主？
2. **克隆证据**：有无 Ph / BCR–ABL？
3. **阶段**：blast、嗜碱、血小板、脾和治疗反应是否提示进展？

## 1.3 病例入口

```text
乏力 / 消瘦 + WBC显著高 + 各阶段粒细胞
+ 嗜酸 / 嗜碱↑ + 巨脾 + NAP↓
        ↓
骨髓粒系显著增生
        ↓
BCR-ABL / Ph确认克隆
        ↓
按慢性—加速—急变分期
        ↓
TKI为主，评估HSCT与特殊人群干扰素接口
```

---

# 2｜Ownership 与动作边界

| 内容 | 本 Block 动作 | 完整 Primary / 后续边界 |
|---|---|---|
| 正常粒系成熟、CBC与骨髓语言 | Recall | H1 |
| 克隆 / 融合基因共同语言 | Recall | H7 + G1–G5 |
| 急性白血病、FAB / WHO与AML / ALL | Recall / Compare | H9 |
| CML慢性期、加速期、急变期、Ph、NAP、治疗 | **Primary Learn** | H10 |
| CLL / 小淋巴细胞淋巴瘤 | Defer | H11仅作接口；当前资料未设独立CLL Block |
| 现代CML分子监测、突变耐药、全部TKI选择 | Not Source | 不静默扩写 |

### Source Boundary Registry

| ID | 类型 | 内容 | 当前处置 |
|---|---|---|---|
| H10-SB01 | Source Boundary | 慢性期 `<10%`、加速期 `≥10%`、急变期 `>20%` 等门槛按当前Lecture | 原样保留，不改用外部分期 |
| H10-SB02 | Source Boundary | 当前Lecture治疗：TKI首选；HSCT可根治；不适合TKI / HSCT或妊娠者用干扰素 | 保持当前Study口径，不扩写现代序贯 |
| H10-SB03 | Source Boundary | Ph / BCR-ABL在CML为诊断与靶向核心；在急性白血病只作当前Source的预后不良标志 | 两种语境明确分开 |
| H10-VG01 | Visual Source Gap | 当前任务未挂载内科原PDF的粒细胞谱、Ph图和鉴别表 | 实际学习必须回原Source图 |

```text
visual_source = AI_READABLE_TEXT_AVAILABLE
visual_source_gap = INTERNAL_ORIGINAL_PDF_NOT_MOUNTED
formal_source_boundary_count = 3
formal_source_conflict_count = 0
```

---

# 3｜一个成熟粒细胞克隆如何走过三个阶段

<!-- kianos:kp id="hematology-h10-kp01" -->
## KP01｜CML第一身份：较成熟粒细胞克隆 + BCR–ABL，而不是反应性中性粒细胞增多

> **主提示：髓系克隆｜成熟谱｜9;22｜BCR-ABL｜3阶段**

### Detailed Expansion

CML 是慢性髓系克隆性肿瘤。早期异常细胞仍能向中、晚幼及成熟粒细胞分化，因此外周血不是“清一色原始细胞”，而是各阶段粒细胞共同增多。

```text
BCR-ABL持续驱动
→ 粒系克隆扩增
→ 仍保留部分成熟能力
→ WBC显著高、嗜酸 / 嗜碱增多、脾大
→ 随克隆进展逐步失去成熟秩序
```

这正是它与 H9 急性白血病“早期成熟阻断”的核心差别。

**Routing**：CORE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h10-kp02" -->
## KP02｜慢性期血象：WBC多>20、可>100；以中晚幼到分叶粒细胞为主，Plt可高

> **主提示：WBC>20可>100｜各阶段粒｜原始<10｜嗜酸碱↑｜Plt可↑｜贫血不显**

### Detailed Expansion

当前 Lecture 的慢性期：

- WBC多 >20×10⁹/L，可 >100×10⁹/L；
- 可有血小板增多；
- 外周 / 骨髓可见各阶段粒细胞，但以中性中幼、晚幼、杆状核及更成熟细胞为主；
- 原始细胞 <10%；
- 嗜酸、嗜碱性粒细胞增多，嗜碱增多有助诊断。

因为较成熟细胞仍占主导，对正常造血的压制早期没有急性白血病那么彻底，所以慢性期贫血、出血不一定突出。

**Routing**：CORE｜RECOGNITION｜MI-G

---

<!-- kianos:kp id="hematology-h10-kp03" -->
## KP03｜骨髓与巨脾：工厂高度活跃，脾成为克隆细胞与髓外造血的巨大容量池

> **主提示：髓明显活跃｜粒系全谱｜巨脾｜左上痛+摩擦=脾梗死｜淋巴结几乎无**

### Detailed Expansion

- 骨髓增生明显活跃，粒系各阶段显著扩增；
- 巨脾是高识别度表现；
- 左上腹明显压痛和摩擦音提示脾梗死；
- CML几乎无淋巴结肿大，这与ALL / CLL和淋巴瘤不同。

（易混：巨脾不是所有白血病共有；急性白血病多为轻中度肝脾大。）

**Routing**：CORE｜RECOGNITION｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="hematology-h10-kp04" -->
## KP04｜Ph / BCR–ABL：一个标志同时回答“是不是CML”和“药打哪里”

> **主提示：t9;22｜BCR-ABL｜诊断｜TKI靶点｜急性出现=差**

### Detailed Expansion

```text
t(9;22)(q34;q11)
→ Philadelphia染色体
→ BCR-ABL融合基因
→ 异常酪氨酸激酶持续活化
```

在 CML：

- 是核心克隆证据；
- 也是 TKI 的直接治疗靶点。

在急性白血病：当前 Study 只把它作为预后不良标志，不等同于CML。

**Routing**：CORE｜CONNECTION｜BOUNDARY｜MI-G

---

<!-- kianos:kp id="hematology-h10-kp05" -->
## KP05｜NAP与类白血病反应：CML是克隆性“低NAP”，反应性增多常“高NAP”

> **主提示：CML慢性↓｜急变↑｜类白↑｜毒变+去因恢复｜无特染**

### Detailed Expansion

CML慢性期 NAP↓；急性变时可↑。

类白血病反应更支持：

- 明确感染 / 应激病因；
- 去除病因后血象恢复；
- RBC、Plt无明显减少；
- 粒细胞有中毒性空泡等改变；
- NAP明显高；
- 无Ph等特征染色体。

因此 NAP 是“反应性成熟粒细胞活性”与“CML异常克隆”的辅助轴，不能脱离Ph和临床单独定性。

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="hematology-h10-kp06" -->
## KP06｜加速期：不是一个blast数字，而是“克隆失控正在加速”的多证据组合

> **主提示：贫血出血｜脾进大｜原药无效｜blast≥10｜baso>20｜Plt失稳｜新染变**

### Detailed Expansion

当前 Lecture 的加速期信号：

1. 逐渐出现贫血、出血；
2. 脾持续 / 进行性肿大；
3. 原来有效的药物如伊马替尼失效；
4. 外周血或骨髓原始细胞 ≥10%；
5. 外周血嗜碱性粒细胞 >20%；
6. 血小板进行性减少或增加；
7. Ph阳性细胞中出现额外异常，如 +8、双Ph、i(17q)。

主轴是：成熟秩序下降、克隆复杂度增加、治疗敏感性下降。

**Routing**：CORE｜RECOGNITION｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h10-kp07" -->
## KP07｜急变期：原始细胞>20%或髓外原始细胞浸润，疾病生物学已进入急性白血病层

> **主提示：blast>20｜髓外原始｜NAP↑｜多急粒变｜可淋/单/巨/红｜绝不慢淋变**

### Detailed Expansion

当前 Lecture：

- 外周血或骨髓原始细胞 >20%；或
- 出现髓外原始细胞浸润；
- NAP可升高；
- 多数发生急粒变，也可淋巴、单核、巨核、红系等急性变；
- CML不能“变成慢淋 / CLL”。

急变不是单纯“WBC更高”，而是克隆丢失成熟能力，跨入急性原始细胞病。

**Routing**：CORE｜BOUNDARY｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h10-kp08" -->
## KP08｜治疗三路：TKI压BCR–ABL，HSCT承担根治，干扰素处理当前Source特殊人群

> **主提示：首选TKI3｜根治HSCT｜不适合/妊娠IFN｜靶点1**

### Detailed Expansion

当前 Lecture：

- 首选 TKI：伊马替尼 / 格列卫、尼洛替尼、达沙替尼；
- 当前 Source 将 HSCT 作为能够根治 CML 的手段；
- 不适合 TKI 与 HSCT 者或妊娠患者，可用干扰素；
- 干扰素是伊马替尼出现前的首选药物。

（边界：不引入外部突变耐药、分子反应深度和停药标准。）

**Routing**：CORE｜BOUNDARY｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h10-kp09" -->
## KP09｜急性白血病 vs CML：先看成熟度，再看blast、脾、淋巴结、Ph和NAP

> **主提示：早停vs晚停｜30/20 vs <10/≥10/>20｜脾轻中vs巨｜结可vs几乎无｜Ph差vs诊断｜NAP分型**

### Detailed Expansion

| 轴 | 急性白血病 | CML |
|---|---|---|
| 分化 | 原始 / 早幼为主 | 中晚幼 / 成熟粒细胞为主 |
| 进展 | 快 | 慢性期后可加速 / 急变 |
| RBC / Plt | 多下降 | 慢性期可相对保留，Plt可高；进展期失稳 |
| blast | FAB≥30或WHO≥20 | 慢性<10；加速≥10；急变>20 |
| 脾 | 多轻中度 | 巨脾高频 |
| 淋巴结 | ALL常有、AML可有 | 几乎无 |
| Ph | 出现提示当前Source预后差 | 核心诊断 / 靶向标志 |
| NAP | 急粒↓、急淋↑ | 慢性↓，急变↑ |

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="hematology-h10-kp10" -->
## KP10｜最终病例算法：成熟谱 + 巨脾 + NAP低提示CML，Ph / BCR–ABL完成定性，再判阶段

> **主提示：WBC巨高｜成熟粒谱｜嗜酸碱↑｜巨脾｜NAP↓｜Ph/BCR｜10/20分期｜TKI**

### Detailed Expansion

```text
WBC显著升高
→ 看血涂片是否为各阶段粒细胞、以中晚幼和成熟细胞为主
→ 看嗜酸 / 嗜碱、Plt、贫血与巨脾
→ NAP辅助排类白血病反应
→ 骨髓确认粒系克隆谱
→ Ph / BCR-ABL完成定性
→ blast、baso、Plt、脾和治疗反应分慢性 / 加速 / 急变
→ TKI为主，评估HSCT / 干扰素接口
```

**Routing**：CORE｜RECOGNITION｜MI-G

---

# 4｜Framework Reconstruction｜闭卷重建四条链

### 4.1 驱动链

```text
t(9;22) → BCR-ABL → 酪氨酸激酶持续驱动 → 粒系克隆扩增
```

### 4.2 慢性期链

```text
仍有成熟能力
→ 各阶段粒细胞增多
→ 原始<10
→ WBC高、嗜酸碱↑、巨脾、NAP↓
```

### 4.3 进展链

```text
克隆复杂化
→ 药物失效 / 脾进大 / blast与baso上升 / Plt失稳
→ 加速期
→ blast>20或髓外原始细胞
→ 急变期
```

### 4.4 决策链

```text
成熟谱 + Ph定性
→ 判阶段
→ TKI
→ HSCT根治接口
→ 特殊人群干扰素
```

---

# 5｜Memory Routing

## 5.1 MI-G｜第一轮必须即时掌握

- BCR–ABL / Ph；
- 慢性期成熟粒细胞谱、嗜酸嗜碱、巨脾、NAP↓；
- 慢性 / 加速 / 急变的blast门槛；
- 加速期多证据组合；
- TKI首选、HSCT根治接口；
- CML vs 急性白血病与类白血病反应。

## 5.2 MI-D｜延迟记忆

- WBC、嗜碱、Plt各精确数字；
- +8、双Ph、i(17q)；
- TKI完整名单；
- 干扰素特殊人群；
- 脾梗死体征；
- 急变的全部细胞系类型。

---

# 6｜原图门禁

1. CML外周血各阶段粒细胞谱；
2. 慢性 / 加速 / 急变分期表；
3. Philadelphia染色体与BCR–ABL关系；
4. NAP染色；
5. 急性白血病 vs CML综合鉴别表。

```text
VISUAL_SOURCE_GAP_OPEN
AI-readable Lecture文字层可用；内科原PDF视觉层未在本任务挂载。
```

---

# 7｜Outline Coverage Safety Net

## 7.1 Primary Ledger

```text
INT-U085_CML_total = 4
INT-U086_acute_vs_CML_total = 1
outline_primary_total = 5
mapped = 5
unmapped = 0
missing = 0
duplicate_primary = 0
```

| Outline考点 | Primary归属 |
|---|---|
| CML慢性期：WBC、成熟谱、blast、嗜酸碱、巨脾、Ph、NAP | KP02–KP05 |
| 加速期：症状、blast、baso、Plt、附加染色体 | KP06 |
| 急变期：转化类型、blast、NAP | KP07 |
| TKI、HSCT、干扰素 | KP08 |
| 急性白血病 vs CML八轴比较 | KP09 |

### Ownership说明

- U085前9题急性白血病治疗归H9；后4题CML归H10；
- U086前2题化疗药副作用归H9；综合鉴别题归H10；
- H11只调用T-ALL / CLL与淋巴瘤接口，不重复CML主体。

---

# 8｜Lecture Knowledge Routing Audit

| Lecture范围 | 路由 | Knowledge Role | Memory |
|---|---|---|---|
| P214 MRD后进入CML三期 | KP01–KP03 | CORE + CONNECTION | MI-G |
| P214 Ph / BCR-ABL | KP04 | CORE + BOUNDARY | MI-G |
| P214 NAP与类白反应 | KP05 | CORE + CONFUSABLE | MI-G |
| P214 加速期 | KP06 | CORE + RECOGNITION | MI-G / MI-D |
| P214 急变期 | KP07 | CORE + BOUNDARY | MI-G |
| P214 TKI / HSCT / IFN | KP08 | CORE + BOUNDARY | MI-G / MI-D |
| P216–217 CML真题 | KP10 | RECOGNITION + REDUNDANT_EXPOSITION | MI-G |
| P217–218 急性白血病 vs CML | KP09 | CONFUSABLE + VISUAL_ONLY | MI-G |

```text
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
```

---

# 9｜First-pass Question Probe

```text
source = TTSX Lecture-attached Questions
selection = LectureQuestionBinding
status = READY_PENDING_BINDING
question_to_kp_semantic_graph = DEFERRED_TO_BREAKTHROUGH
```

---

# 10｜建议学习切片

```text
H10-A｜KP01–KP05
身份、慢性期、脾、Ph与NAP

H10-B｜KP06–KP10
加速、急变、治疗与鉴别算法
```

---

# 11｜Block Exit｜闭卷 10 问

1. CML为什么以成熟粒细胞为主仍属于恶性肿瘤？
2. 慢性期血象和骨髓最关键的五个方向是什么？
3. 巨脾与左上腹摩擦音分别提示什么？
4. Ph / BCR–ABL怎样同时服务诊断和治疗？
5. NAP怎样区分CML与类白血病反应？
6. 加速期为何要看blast、baso、Plt、脾和治疗反应组合？
7. 急变期的门槛、NAP与转化类型是什么？
8. 当前Study的TKI、HSCT、干扰素如何分工？
9. 急性白血病与CML在成熟、blast、脾、结、Ph、NAP上怎样比较？
10. 面对WBC 90×10⁹/L、巨脾、各阶段粒细胞和NAP低，如何完成定性、分期与治疗入口？

---

# 12｜Block Production Gate

```text
Study_continuity = PASS
natural_mechanism_split = 0
repeated_first_exposure = 0
Framework_is_map = PASS
KP_natural_units = 10
prompt_leakage = PASS
Outline_total = 5
Outline_mapped = 5
unmapped = 0
missing = 0
duplicate_primary = 0
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
First_pass_question_probe = READY_PENDING_BINDING
Source_gap = SOURCE_BOUNDARY_EXPLICIT
formal_source_boundary_count = 3
formal_source_conflict_count = 0
Visual_gate = REQUIRED_WITH_INTERNAL_ORIGINAL_PDF_GAP
System_final_gate = NOT_RUN_NON_FINAL_BATCH
```

---

# 13｜Block Complete

```text
Framework viewed
+ Lecture P214–218 completed
+ Framework reconstructed
+ KP active recall completed
+ Outline optional safety-net checked as needed
+ TTSX Lecture-attached Questions completed after binding
= H10 Block Complete
```
