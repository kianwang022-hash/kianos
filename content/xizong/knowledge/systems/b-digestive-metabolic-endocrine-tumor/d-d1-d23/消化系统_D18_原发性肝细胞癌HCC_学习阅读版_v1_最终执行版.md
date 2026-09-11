---
type: block_guide
schema_version: 1
content_version: 1
system: 消化—物质代谢—内分泌
system_id: digestive_metabolism_endocrine
block_id: digestive-d18
title: 原发性肝细胞癌 HCC
order: 18
status: FINAL_EXECUTION
study_refs:
  - source_id: pathology-lecture
    label: 病理学讲义_AI阅读版｜原发性肝癌
    pdf_page_start: 20
    pdf_page_end: 21
    action: primary
  - source_id: internal-medicine-lecture
    label: 内科学讲义_AI阅读版｜原发性肝细胞癌
    sequence_page_start: 115
    sequence_page_end: 121
    action: primary
  - source_id: digestive-d16
    label: D16｜病毒性肝炎
    action: recall
  - source_id: digestive-d17
    label: D17｜肝硬化、门脉高压与肝性脑病
    action: recall
  - source_id: tumor-gate
    label: G1–G5 + 病理U019｜分子与肿瘤Gate
    action: recall
outline_units:
  - PATH-U008-HCC-SUBSET
  - INT-U049
  - INT-U050
  - INT-U051
outline_primary_count: 38
kp_count: 15
prerequisites:
  - digestive-d16
  - digestive-d17
  - tumor-gate
next_blocks:
  - digestive-d19
visual_gates:
  - pathology-p020-p021-hcc-gross-histology
  - internal-p115-p121-hcc-imaging
  - internal-p117-liver-lesion-imaging-comparison
visual_gate_status: RETURN_TO_STUDY_ORIGINAL_SOURCE
source_gap_status: SOURCE_BOUNDARY_EXPLICIT
source_boundaries:
  - D18-SB01
  - D18-SB02
system_final_batch: false
---

# D18｜原发性肝细胞癌 HCC
## 在慢性肝损伤背景中，用“肿瘤血供—门静脉侵犯—肝储备”决定识别与治疗

> **中心问题**：HBV/HCV与肝硬化背景中的肝细胞异常克隆，为什么常沿门静脉在肝内播散；如何把肿瘤本身、肝功能储备和血管侵犯同时纳入诊断与治疗？
>
> **Primary Study**：病理 P20–21；内科 P115–121。
>
> **Primary Outline**：病理 U008 中HCC/肝内胆管癌子项 **8** + 内科 U049–U051 **30** = **38 / 38**。
>
> **前置调用**：D16慢性病毒性肝炎；D17肝硬化与Child-Pugh；G1–G5 + 病理U019肿瘤共同语言。
>
> **边界**：本Block只学习肝脏器官特异模型。完整肿瘤基因、所有现代系统治疗、最新分期指南和外部药物更新不在Source范围内扩写。

---

## 0｜第一轮固定流程

```text
Framework Orientation
→ Recall D16：HBV/HCV慢性损伤
→ Recall D17：肝储备、门静脉、Child-Pugh
→ 病理 Lecture P20–21
→ 内科 Lecture P115–121
→ 原图核对：大体、镜下、增强影像
→ Lecture Done
→ Framework Reconstruction
→ KP Active Recall
→ Outline Quick Check（可选）
→ TTSX Lecture-attached Questions
→ Block Complete
```

主线：

```text
慢性肝损伤 / 肝硬化
→ 肝细胞癌变
→ 肝动脉优势供血
→ 门静脉分支侵犯与肝内播散
→ 肿块症状 + 肝功能失代偿
→ AFP/影像/病理确认
→ 同时评估肿瘤范围、血管侵犯、肝储备
→ 切除 / TACE / 消融 / 移植 / 靶向与支持
```

---

# 1｜总 Framework

<!-- kianos:framework id="digestive-d18-framework-main" -->

```text
风险背景
  ├─ HBV / HCV
  ├─ 肝硬化
  ├─ 酒精
  ├─ 黄曲霉毒素
  └─ 肝吸虫 → 更偏肝内胆管癌
  ↓
原发性肝癌三类
  ├─ HCC：最常见
  ├─ 肝内胆管癌 ICC
  └─ 混合型
  ↓
HCC生物学
  ├─ 肝动脉供血为主
  ├─ 癌组织血窦样、间质少
  ├─ 早期门静脉分支侵犯 / MVI
  └─ 肝内播散最早最常见
  ↓
临床入口
  ├─ 持续右上腹痛
  ├─ 进行性肝大、硬、结节
  ├─ 体重下降 / 低热
  ├─ 难治或血性腹水 / 黄疸
  ├─ 血管杂音 / 癌栓
  └─ 破裂出血 / 伴癌综合征
  ↓
证据链
  ├─ AFP筛查与趋势
  ├─ B超筛查
  ├─ 增强CT/MRI：快进快出
  ├─ DSA/TACE显示微小病灶
  └─ 病理活检：Study金标准
  ↓
治疗三问
  1. 肿瘤能否完整清除？
  2. 剩余肝能否承受？
  3. 有无大血管/肝外转移？
```

---

# 2｜KP Active Recall

<!-- kianos:kp id="digestive-d18-kp01" -->
## KP01｜病因：慢性病毒/肝硬化是主干，毒物与寄生虫补充

> **主提示：主因1｜病毒2｜另2｜寄生虫→哪型**

### 详细展开

HCC最常见背景是慢性肝病，尤其：

- HBV；
- HCV；
- 肝硬化。

其它Source-bound危险因素：

- 酒精；
- 黄曲霉毒素。

华支睾吸虫等更偏向：

> **肝内胆管癌，而不是典型HCC。**

//串联：D16 HCV最易慢性；D17肝硬化提供反复损伤—再生—癌变背景。

**Routing**：CORE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="digestive-d18-kp02" -->
## KP02｜原发性肝癌三型：先辨细胞来源

> **主提示：3类型｜最常见｜HCC标志｜ICC来源/分泌/间质**

### 详细展开

| 类型 | 来源与特征 |
|---|---|
| 肝细胞癌 HCC | 肝细胞来源，最常见；可表达AFP等 |
| 肝内胆管癌 ICC | 肝内胆管上皮来源，可形成腺管、分泌黏液，间质相对多 |
| 混合型 | 同时具肝细胞与胆管分化成分 |

HCC与ICC的第一判断轴：

```text
肝细胞样 + 胆汁/血窦样 + 间质少 → HCC
腺管 + 黏液 + 间质多 → ICC
```

**Routing**：CORE｜DISCRIMINATION｜MI-G

---

<!-- kianos:kp id="digestive-d18-kp03" -->
## KP03｜HCC大体四型与多套大小口径

> **主提示：4大体｜最常见｜易混硬化型｜3套大小口径各用途**

### 详细展开

HCC大体可见：

- 单结节型；
- 多结节型：Study常强调最常见，易与肝硬化结节混淆；
- 弥漫型；
- 巨块型：常位于右叶，直径可>10 cm，未必合并肝硬化。

### 大小分类不要硬合并

当前Source存在不同用途的口径：

1. 病理/移植相关“小肝癌”口径：单发≤5 cm，或多发不超过3个且最大≤3 cm；
2. 外科大小分类：微小、小、大、巨大，以1/5/10 cm等节点划分；
3. 术式与移植可切除性还结合数量、部位、血管与肝储备。

**SOURCE_BOUNDARY**：它们回答的是不同问题，不作为互相否定的单一“冲突”。

**Routing**：CORE｜BOUNDARY｜MI-G｜MI-D

---

<!-- kianos:kp id="digestive-d18-kp04" -->
## KP04｜HCC镜下：肝细胞样、血窦样、间质少

> **主提示：高分化像谁｜可产什么｜4排列｜血管｜间质｜低分化**

### 详细展开

高分化HCC：

- 细胞较像肝细胞；
- 可形成胆汁；
- 癌巢间血管丰富，呈肝血窦样；
- 间质少。

常见排列：

- 细梁型；
- 粗梁型；
- 假腺管/假腺泡型；
- 实性/片状型。

分化降低时：

- 细胞异型性更明显；
- 正常肝板结构和功能特征下降。

（易混：HCC“血管丰富”与其增强扫描快进相关；ICC间质较多、黏液腺管更突出。）

**Routing**：CORE｜VISUAL_ONLY｜MI-G

---

<!-- kianos:kp id="digestive-d18-kp05" -->
## KP05｜转移：最早最常见是门静脉肝内播散

> **主提示：最早最常见｜MVI用途2｜淋巴首站｜血道首站**

### 详细展开

```text
HCC侵入门静脉分支
→ 癌栓 / 微血管侵犯 MVI
→ 肝内多中心样播散
```

这是最早最常见的转移方式。

- MVI与肿瘤大小共同用于评估复发风险和治疗选择；
- 淋巴转移常先到肝门淋巴结；
- 经肝静脉进入体循环后，肝外血道转移以肺常见。

（易混：HCC不是“癌都先淋巴”；它属于Study强调的血道/门静脉早期传播特殊。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="digestive-d18-kp06" -->
## KP06｜中晚期临床：痛—大—硬—瘦—杂音

> **主提示：人群2｜首发1｜肝体征3｜全身3｜血流1**

### 详细展开

典型背景：中年男性、慢性肝病/肝硬化。

最常见首发表现：

- 持续性右上腹/肝区疼痛。

肝脏体征：

- 进行性肝大；
- 质硬；
- 表面不规则或结节。

全身与肝硬化叠加表现：

- 体重下降、食欲差；
- 低热；
- 黄疸、腹水；
- 难治性或血性腹水；
- 肿瘤血供丰富可闻及血管杂音。

病例识别要把“肝硬化失代偿突然加速”视为HCC警报，而不是只看一个AFP。

**Routing**：CORE｜CLINICAL_ENTRY｜MI-G

---

<!-- kianos:kp id="digestive-d18-kp07" -->
## KP07｜三类高危后果：破裂、癌栓、伴癌综合征

> **主提示：破裂3征｜IVC/右房癌栓→哪儿肿｜伴癌2主+4少见**

### 详细展开

### 肿瘤破裂

- 突发右上腹痛；
- 腹膜刺激征；
- 血容量下降/休克，常伴腹腔出血。

### 血管癌栓

肝静脉癌栓可延伸至下腔静脉和右心房，引起下肢水肿等静脉回流障碍。

### 伴癌综合征

主要：

- 自发性低血糖；
- 红细胞增多。

较少见：高钙、高脂、类癌样表现等。

**Routing**：CORE｜EMERGENCY｜SPECIAL｜MI-G

---

<!-- kianos:kp id="digestive-d18-kp08" -->
## KP08｜AFP：看阈值，更看持续与ALT是否分离

> **主提示：筛查｜2诊断阈值｜4假阳｜AFP/ALT平行vs分离**

### 详细展开

AFP是常用筛查指标。当前Study诊断口径包括：

- AFP>400 ng/mL；或
- AFP>200 ng/mL持续约8周；
- 同时排除妊娠、生殖细胞肿瘤和活动性肝炎等。

AFP也可在以下情况升高：

- 妊娠；
- 生殖腺胚胎性肿瘤；
- 肝炎；
- 肝硬化。

趋势判断：

```text
AFP与ALT同步升高 → 更偏活动性肝炎
AFP持续升高而ALT不随之升高 / 两者分离 → 更警惕HCC
```

ICC和多数转移性肝癌不以AFP升高为典型。

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="digestive-d18-kp09" -->
## KP09｜AFP阴性并不排除：3类补充标志物

> **主提示：AFP阴性补3类｜各自用途｜不单独定诊**

### 详细展开

当前Lecture给出的AFP阴性补充指标包括：

- PIVKA-II / DCP；
- γ-GT同工酶Ⅱ；
- 游离miRNA等。

它们用于提高提示能力，但仍需结合影像、肝病背景和病理。

其他实验室变化可能反映：

- 肝储备下降；
- 胆汁淤积；
- 肿瘤负荷；
- 伴癌综合征。

原则：

> **肿瘤标志物是证据链的一层，不是替代影像与病理的万能确诊工具。**

**Routing**：RECOGNITION｜BOUNDARY｜MI-D

---

<!-- kianos:kp id="digestive-d18-kp10" -->
## KP10｜影像路线：B超筛查，增强CT/MRI看“快进快出”

> **主提示：筛查1｜重要2｜典型1｜微小不明1｜分期疗效1**

### 详细展开

- B超：常用筛查；
- 增强CT / MRI：诊断和评估非常重要；
- 典型HCC：动脉期强化、门静脉/延迟期洗脱，即“快进快出”；
- DSA：对不确定微小HCC显示价值高，并可连接TACE；
- PET：用于分期和疗效评价接口。

影像必须同时回答：

1. 病灶数量和位置；
2. 血供模式；
3. 大血管侵犯；
4. 肝外转移；
5. 剩余肝和切除可能。

**Routing**：CORE｜VISUAL_ONLY｜MI-G

---

<!-- kianos:kp id="digestive-d18-kp11" -->
## KP11｜确诊与病例整合：Study金标准为病理活检

> **主提示：肝癌确诊证据层｜病理何时需要/何时谨慎｜病例6线索**

### 详细展开

当前Study把病理活检列为肝癌诊断金标准。

典型“可能最可能”组合：

```text
慢性HBV/HCV或肝硬化
+ 中年男性
+ 持续肝区痛
+ 进行性硬性肝大/结节
+ AFP持续升高或典型增强影像
± 血性腹水 / 破裂 / 癌栓
```

（边界：现实临床中是否必须活检取决于具体影像与风险；本文件保持Study考试口径，不用外部指南静默改写。）

**Routing**：CORE｜BOUNDARY｜MI-G

---

<!-- kianos:kp id="digestive-d18-kp12" -->
## KP12｜手术评估：肿瘤能切，还要剩余肝能活

> **主提示：肝癌能切≠能手术｜Child/ICG｜剩余肝比例｜手术成败关键｜C级边界**

### 详细展开

手术切除是首选根治方向，但必须同时满足：

### 肝功能储备

- Child-Pugh A为主要安全入口；
- ICG 15分钟滞留率<30%等Source指标；
- 无明显纤维化时剩余标准肝体积约≥30%；
- 有纤维化时约≥40%。

### 肿瘤范围

- 能完整切除；
- 无不可接受的大血管侵犯/肝外扩散；
- 剩余肝血流和功能可维持。

手术成败关键：

> **切净肿瘤与保留足够功能肝的平衡。**

Child C等肝储备差者按Study先改善/替代肝功能并重新评估，不可机械套切除。

**Routing**：CORE｜DECISION｜MI-G｜MI-D

---

<!-- kianos:kp id="digestive-d18-kp13" -->
## KP13｜不能直接切时：TACE—消融—移植—靶向

> **主提示：不宜切首选｜消融对象｜移植2禁区｜靶向1**

### 详细展开

- 不符合切除条件：当前Study常以TACE作为重要首选；
- 局部消融：适用于小、局限病灶等Source范围；
- 肝移植：同时替换肿瘤所在肝与失代偿肝，但大血管侵犯或肝外转移时不建议；
- 分子靶向：当前Lecture以索拉非尼等为代表；
- 其它系统治疗不从外部指南扩写。

决策顺序：

```text
能安全切除？
  ├─ 是 → 切除
  └─ 否 → 是否局限小病灶 / 移植适应 / 肝动脉介入 / 系统治疗
```

**Routing**：CORE｜DECISION｜BOUNDARY｜MI-G

---

<!-- kianos:kp id="digestive-d18-kp14" -->
## KP14｜HCC破裂出血：先止血，再判断切除

> **主提示：稳定？｜TAE/TACE｜急诊切除条件｜无法处理时1**

### 详细展开

肝癌破裂可快速形成腹腔内出血和休克。

处理主线：

1. 复苏和止血；
2. TAE / TACE控制肿瘤供血；
3. 条件允许可急诊切除；
4. 情况危急或术中不能切除时，当前Study可采用填塞等临时止血。

判断不应只看“肿瘤可切”，还要看：

- 血流动力学；
- 肝储备；
- 肿瘤范围；
- 出血控制可能。

**Routing**：EMERGENCY｜DECISION｜MI-G

---

<!-- kianos:kp id="digestive-d18-kp15" -->
## KP15｜肝占位影像：快出、牛眼、灯泡、无强化、环形

> **主提示：HCC｜转移｜血管瘤｜囊肿｜脓肿：5征**

### 详细展开

| 病变 | 典型Source影像提示 |
|---|---|
| HCC | 快进快出 |
| 转移性肝癌 | 边缘强化、牛眼征 |
| 肝血管瘤 | 灯泡征、早出晚归/周边向中心填充接口 |
| 肝囊肿 | 不强化 |
| 急性肝脓肿 | 环形/边缘强化、低密度灶等感染性表现 |

这张表只作为影像识别入口，最终仍需结合：

```text
肝病背景 + 发热/感染 + 标志物 + 血供模式 + 病理
```

//串联：肝脓肿完整模型进入D19。

**Routing**：DISCRIMINATION｜VISUAL_ONLY｜MI-G

---

# 3｜高密度核对

## 3.1 HCC vs ICC

| 轴 | HCC | ICC |
|---|---|---|
| 来源 | 肝细胞 | 肝内胆管上皮 |
| 常见风险 | HBV/HCV/肝硬化 | 肝内胆管慢性炎症、肝吸虫等 |
| 标志物 | AFP可升高 | AFP通常不典型 |
| 组织 | 肝细胞样、胆汁、血窦样、间质少 | 腺管、黏液、间质多 |
| 早期扩散 | 门静脉肝内播散 | 胆管/淋巴等按器官特异路径 |

## 3.2 治疗三问

```text
1. 肿瘤范围：数量、大小、位置、血管、肝外？
2. 肝储备：Child、ICG、剩余肝体积？
3. 患者稳定：破裂、出血、肝衰？
```

---

# 4｜Framework Reconstruction

闭卷重建：

```text
HBV/HCV/肝硬化背景
→ HCC肝动脉优势供血
→ 门静脉早期侵犯与肝内播散
→ 痛、大、硬、瘦、杂音
→ AFP趋势 + 快进快出影像 + 病理
→ 肿瘤范围 × 肝储备 × 血管/转移
→ 切除 / TACE / 消融 / 移植 / 靶向
```

---

# 5｜Memory Routing

## MI-G

- HCC病因与三型原发性肝癌；
- 多结节型、门静脉早期播散；
- HCC vs ICC；
- AFP阈值与AFP/ALT平行/分离；
- 快进快出；
- 切除需同时看肿瘤与肝储备；
- TACE/消融/移植大边界；
- 破裂出血处理。

## MI-D

- 多套大小分类全部数字；
- HCC镜下全部排列；
- AFP阴性三项标志物；
- ICG、剩余肝体积和九版手术指征细节；
- 各介入/消融适应证细项；
- 影像学低频鉴别措辞。

---

# 6｜Study 原图门禁与 Source Registry

## 必须回原图

1. HCC四种大体型；
2. HCC梁状/假腺管与ICC腺管；
3. 门静脉癌栓与MVI；
4. 增强CT/MRI“快进快出”；
5. 转移瘤、血管瘤、囊肿、脓肿比较。

## Source Registry

```text
D18-SB01｜HCC大小分类在病理/移植口径与外科直径分类中并存，分别保留用途，不强行统一。
D18-SB02｜“病理活检为金标准”按当前Study冻结；不以外部最新指南静默替换。
```

---

# 7｜Outline Coverage Safety Net

| Outline | Primary题数 | 绑定 | Coverage |
|---|---:|---|---:|
| 病理 U008 HCC/ICC子项 | 8 | KP01–KP05 | 8 / 8 |
| 内科 U049–U051 | 30 | KP01、KP03、KP05–KP15 | 30 / 30 |
| **合计** | **38** | — | **38 / 38** |

```text
total_questions = 38
mapped_questions = 38
unmapped = 0
missing = 0
duplicate_primary = 0
```

病理U008其余食管/胃/大肠肿瘤题不归D18，不制造重复Primary。

---

# 8｜Lecture Knowledge Routing Audit

```text
CORE：病因、类型、病理、转移、临床、AFP、影像、治疗
SPECIAL：伴癌综合征、破裂、IVC/右房癌栓、AFP阴性标志物
CONFUSABLE：HCCvsICC；肝炎AFPvsHCC AFP；多套大小口径
CONNECTION：D16/D17前癌背景；肝脓肿进入D19
RECOGNITION：镜下排列、影像征、靶向药
BOUNDARY：不扩写外部肝癌指南与完整系统治疗
VISUAL_ONLY：大体、镜下、增强影像、占位鉴别
DEFERRED_MODEL：胆道癌D19、胰腺肿瘤D20
REDUNDANT_EXPOSITION：重复口诀与例题排版

unrouted_lecture_knowledge = 0
unsupported_expansion = 0
```

---

# 9｜First-pass Question Probe

- **来源**：TTSX Lecture-attached Questions
- **选择方式**：LectureQuestionBinding自动提供
- **状态**：`READY_PENDING_BINDING`

---

# 10｜Block Production Gate

```text
Study_continuity = PASS
natural_mechanism_split = 0
repeated_first_exposure = 0
Framework_is_map = PASS
主提示低摩擦 = PASS
Outline_coverage = 38/38
unmapped = 0
missing = 0
duplicate_primary = 0
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
VISUAL_GATE = REQUIRED_RETURN_TO_STUDY
System_final_gate = NOT_RUN_NON_FINAL_BATCH
```

---

# 11｜Block Complete

完成标准：

- 能把HCC放回HBV/HCV—肝硬化链；
- 能解释为什么最早最常见是门静脉肝内播散；
- 能用AFP趋势与增强影像建立证据；
- 能用“肿瘤范围 × 肝储备 × 血管/转移”选择治疗层级。

下一 Block：**D19｜胆汁、黄疸、胆石、胆道感染与肝脓肿。**
