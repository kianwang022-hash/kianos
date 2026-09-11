---
type: block_guide
schema_version: 1
content_version: 1
system: 血液—免疫—感染
system_id: hematology_immunity_infection
batch_id: P21
block_id: hematology-h08
title: 多发性骨髓瘤（MM）
order: 8
status: FINAL_EXECUTION
study_refs:
  - source_id: internal-medicine-lecture
    label: 内科学讲义_AI阅读版｜骨髓瘤MM
    sequence_page_start: 203
    sequence_page_end: 205
    action: primary
  - source_id: hematology-h07
    label: H7｜克隆性造血共同语言
    action: recall
  - source_id: hematology-h01
    label: H1｜骨髓、CBC与外周血诊断语言
    action: recall
  - source_id: urinary-k06
    label: K6｜溢出性蛋白尿与肾功能证据
    action: recall_apply
  - source_id: pathology-u019-gate
    label: O9｜肿瘤总论与浆细胞病理接口
    action: recall
outline_units:
  - INT-U081
outline_primary_count: 11
kp_count: 16
prerequisites:
  - hematology-h07
  - hematology-h01
  - pathology-u019-gate
next_blocks:
  - hematology-h09
  - hematology-h10
  - hematology-h11
visual_gates:
  - internal-p203-mm-plasma-cell-bone-lesion
  - internal-p204-m-protein-electrophoresis
  - internal-p204-mm-low-dose-ct-bone-disease
  - internal-p204-durie-salmon-table
  - internal-p204-iss-riss-table
  - internal-p205-mm-mindmap
visual_gate_status: REQUIRED_WITH_INTERNAL_ORIGINAL_PDF_GAP
source_gap_status: SOURCE_BOUNDARY_EXPLICIT
source_boundaries:
  - H8-SB01
  - H8-SB02
  - H8-SB03
system_final_batch: false
---

# H8｜多发性骨髓瘤（MM）
## 一个浆细胞克隆同时占骨髓、拆骨、制造 M 蛋白与游离轻链，于是骨—肾—血液—钙一起出问题

> **FIRST PASS 固定流程**
>
> `Framework → Lecture → Framework Reconstruction → KP Active Recall → Outline optional / low-pressure → TTSX Lecture-attached Questions → Block Complete`
>
> H7 已建立“异常克隆—证据—风险”的共同语言；H8 不再重讲肿瘤总论，而把它应用到浆细胞克隆。

---

# 1｜Framework｜先把 CRAB 看成同一个上游的四个出口

## 1.1 中心问题

MM 最容易被背成：

> “CRAB + M蛋白 + 本周蛋白”

但真正需要建立的是：

```text
浆细胞异常克隆
        ↓
┌──────────────┬────────────────┬──────────────────┐
↓              ↓                ↓
占据骨髓       破坏骨骼          大量单克隆Ig / 轻链
↓              ↓                ↓
贫血/多系少    溶骨、骨痛、      正常多克隆Ig↓
感染/出血接口  病理骨折、Ca²⁺↑   高黏滞、缗钱状、BJP
        \          |              /
         \         |             /
          └────────┴────────────┘
                    ↓
                 肾损害
```

所以 CRAB 不是四个互不相关的症状：

- **C**：骨破坏后高钙；
- **R**：轻链 / 高钙 / 高尿酸 / 淀粉样等多路伤肾；
- **A**：骨髓被克隆占据，正常造血受抑；
- **B**：溶骨性骨病。

## 1.2 本 Block 的病例顺序

```text
中老年 + 腰背 / 胸骨痛
→ CBC是否贫血？
→ TP高但ALB不高？
→ M蛋白 / 浆细胞克隆证据？
→ 有无骨、肾、钙和贫血器官损害？
→ 再分期、判断移植候选与当前Study治疗路径
```

## 1.3 三条独立但汇合的证据线

1. **骨髓线**：浆细胞克隆；
2. **蛋白线**：M 蛋白 / 游离轻链；
3. **器官损害线**：CRAB + 感染 / 高黏滞 / 出血等。

一条阳性线索不能替代全部诊断链。

---

# 2｜Ownership 与动作边界

| 内容 | 本 Block 动作 | 完整 Primary / 后续边界 |
|---|---|---|
| 克隆性肿瘤共同语言 | Recall | O9 + G1–G5 + H7 |
| CBC / 骨髓穿刺共同语言 | Recall | H1 |
| 溢出性蛋白尿机制 | Recall / Apply | K6 |
| MM临床、诊断、D-S / ISS、当前治疗 | **Primary Learn** | H8 |
| 病理骨折 / 脊髓压迫的完整骨科处理 | Defer | 后续骨科；H8只识别器官威胁 |
| 现代浆细胞病完整分类、SLiM-CRAB、R2-ISS、现代联合方案 | Defer / Not Source | 不在当前 Study Source 扩写 |

### Source Boundary Registry

| ID | 类型 | 内容 | 当前处置 |
|---|---|---|---|
| H8-SB01 | Source Boundary | 当前 Lecture 明确写“MM禁止静脉肾盂造影，易致急性肾衰竭” | 作为 Study 考试口径保留；不扩成现实临床一般建议 |
| H8-SB02 | Source Boundary | 当前 Lecture 写“MM最常见IgG；肾功能损害IgD最常见 / IgD更易导致肾损害” | 原样保留当前考试口径；病例仍需先看最常见IgG |
| H8-SB03 | Source Boundary | D-S、ISS、VD/RD/MVP等均按当前 Study Source；不引入外部新版分期 / 四联方案 | 保持 Source-bound |
| H8-VG01 | Visual Source Gap | AI-readable Lecture文字可读，但浆细胞、M峰、低剂量CT溶骨灶与分期表原图未在本任务视觉层挂载 | 学习时必须回原Source图核对 |

```text
visual_source = AI_READABLE_TEXT_AVAILABLE
visual_source_gap = INTERNAL_ORIGINAL_PDF_NOT_MOUNTED
formal_source_boundary_count = 3
formal_source_conflict_count = 0
```

---

# 3｜浆细胞克隆如何形成多器官病

<!-- kianos:kp id="hematology-h08-kp01" -->
## KP01｜MM 第一身份：浆细胞来源恶性克隆，两个主要产物是“肿瘤细胞”和“M蛋白”

> **主提示：浆细胞克隆｜占骨髓｜M蛋白｜轻链｜3条证据线**

### Detailed Expansion

MM 是浆细胞来源的恶性肿瘤。进入病例时先把“细胞”和“分泌物”分开：

```text
异常浆细胞本身
→ 占据骨髓 / 髓外浸润 / 破坏骨骼

异常浆细胞分泌物
→ 大量单克隆免疫球蛋白或片段
→ M蛋白 / 游离轻链相关后果
```

一个克隆同时造成结构损伤和蛋白负荷，所以 MM 天然就是多系统病。

**Routing**：CORE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h08-kp02" -->
## KP02｜CRAB：四个字母其实是三条上游链的共同器官输出

> **主提示：C高钙｜R肾｜A贫血｜B骨病｜上游3路**

### Detailed Expansion

- **C｜Hypercalcemia**：骨质被破坏，Ca²⁺进入血液；
- **R｜Renal insufficiency**：轻链、代谢异常、淀粉样等共同造成肾损害；
- **A｜Anemia**：骨髓瘤细胞浸润抑制正常造血；
- **B｜Bone disease**：溶骨性骨破坏、骨痛、骨质疏松、病理性骨折。

CRAB 的意义是：看到多系统组合时，应回到同一浆细胞克隆，而不是把骨痛、贫血和肾衰分别拆成三个疾病。

**Routing**：CORE｜RECOGNITION｜MI-G

---

<!-- kianos:kp id="hematology-h08-kp03" -->
## KP03｜骨病：含造血骨髓的骨骼先受累，溶骨把“痛—折—高钙”串成一条链

> **主提示：部位4｜低剂量CT｜凿孔/疏松/骨折｜Ca↑｜地舒肾差｜双膦抑破骨**

### Detailed Expansion

当前 Study 的高频受累部位：

- 脊椎，尤其腰骶部；
- 胸骨；
- 肋骨；
- 颅骨等含造血骨髓的骨骼。

临床常见腰痛、胸痛。

骨病评估当前 Lecture **首选低剂量 CT**，可见：

- 凿孔样溶骨损害；
- 骨质疏松；
- 病理骨折。

骨破坏：

```text
骨基质被破坏
→ 骨痛 / 病理骨折
→ Ca²⁺释放入血
→ 高钙血症
→ 进一步加重肾损害接口
```

当前 Study 用药：

- **地舒单抗**：肾功能不全者；
- **双膦酸盐**：抑制破骨细胞，可减少骨痛并改善高钙血症。

（边界：病理骨折、脊髓压迫的完整骨科处理后置；本处只识别器官威胁。）

**Routing**：CORE｜VISUAL_ONLY｜CONNECTION｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h08-kp04" -->
## KP04｜骨髓占据：先贫血，严重时可多系少；还可髓外浸润

> **主提示：正常造血↓｜贫血｜可三系少｜髓外4地｜感染/出血接口**

### Detailed Expansion

骨髓瘤细胞在骨髓内扩张：

```text
异常浆细胞占位
→ 正常造血空间 / 资源被压制
→ 贫血
→ 严重时可出现全血细胞减少
```

这解释 A，也连接：

- 正常白细胞防御不足 → 感染风险；
- 血小板减少 → 出血风险。

当前 Lecture 还列髓外浸润：

- 肝；
- 脾；
- 淋巴结；
- 肾等。

（易混：MM 的“骨髓被肿瘤占据”与 H7 MDS 的“病态 / 无效造血”不是同一种骨髓故障。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

# 4｜M 蛋白：不是“抗体越多免疫越强”

<!-- kianos:kp id="hematology-h08-kp05" -->
## KP05｜单克隆 Ig ↑，正常多克隆 Ig 反而 ↓：总蛋白高却仍易感染

> **主提示：单克隆↑｜多克隆↓｜感染｜TP↑/ALB不高｜不能抗感染**

### Detailed Expansion

异常浆细胞大量制造同一克隆免疫球蛋白：

```text
M蛋白大量↑
→ 球蛋白 / 总蛋白可明显↑

正常多克隆免疫球蛋白↓
→ 抗体多样性下降
→ 感染易感
```

因此“免疫球蛋白很多”不等于“防御能力强”。题干出现：

> **TP 很高，但白蛋白并不高**

应想到升高的主体可能是球蛋白 / M 蛋白。

**Routing**：CORE｜CONFUSABLE｜RECOGNITION｜MI-G

---

<!-- kianos:kp id="hematology-h08-kp06" -->
## KP06｜高黏滞：蛋白太多把血液变稠；冷球蛋白还能接上雷诺现象

> **主提示：M蛋白→黏｜冷球蛋白｜雷诺4相｜血浆置换｜器官灌注接口**

### Detailed Expansion

大量 M 蛋白可使血浆蛋白负荷增高，形成**高黏滞综合征**。

部分 M 蛋白可表现为冷球蛋白，寒冷时出现小动脉阵发性痉挛；当前 Lecture 以雷诺现象串联：

```text
寒冷
→ 苍白 / 发冷
→ 青紫、疼痛
→ 潮红
→ 复原
```

当前 Study 对高黏滞的重要处理是**血浆置换**。

第一轮只需抓住：

> 高黏滞是“异常蛋白过多”的物理后果，不是贫血本身造成。

**Routing**：CORE｜SPECIAL｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h08-kp07" -->
## KP07｜M 蛋白还能制造三组“附加表现”：出血、淀粉样变、缗钱状 / ESR快

> **主提示：出血4因｜淀粉样｜缗钱｜ESR↑｜Russell串联**

### Detailed Expansion

### 1｜出血倾向

当前 Lecture 给出多机制：

- Plt减少；
- Plt可被 M 蛋白包裹，功能异常；
- 凝血异常；
- 血管壁受损。

所以 MM 的出血不是单一“血小板低”。

### 2｜淀粉样变

异常免疫球蛋白 / 片段相关蛋白沉积可接入淀粉样变。

### 3｜缗钱状红细胞与 ESR 快

球蛋白增多促进 RBC 叠连：

```text
RBC缗钱状排列
→ 悬浮稳定性下降
→ ESR加快
```

//串联：病理总论已学 Russell 小体 / 淀粉样变与浆细胞异常的接口，本处只 Apply。

**Routing**：CORE｜CONNECTION｜RECOGNITION｜MI-G

---

# 5｜肾损害：把“轻链负荷”挂回 K6 的溢出性蛋白尿

<!-- kianos:kp id="hematology-h08-kp08" -->
## KP08｜本周蛋白尿：肾小球不是第一故障，先是血中游离轻链太多

> **主提示：BJP=游离轻链｜小→可滤过｜溢出性｜可伴血尿｜肾损5路｜IVP边界**

### Detailed Expansion

本周蛋白 / Bence-Jones protein 是游离免疫球蛋白轻链，可经肾小球滤过。

```text
血中游离轻链大量↑
→ 滤过负荷↑
→ 超过正常小管回收能力
→ 溢出性蛋白尿
```

当前 Lecture 的肾损害来源包括：

- 本周 / 游离轻链蛋白；
- 高尿酸；
- 高血钙；
- 淀粉样变性；
- 高黏滞综合征；
- 骨髓瘤细胞浸润。

可伴或不伴血尿。

`H8-SB01`：当前 Study 明确写“禁止静脉肾盂造影，易致急性肾衰竭”。这里将它作为**考试 Source 口径**保存，不外推为现实临床的一般规则。

**Routing**：CORE｜CONNECTION｜BOUNDARY｜MI-G

---

<!-- kianos:kp id="hematology-h08-kp09" -->
## KP09｜病例画像：中老年轴向骨痛 + “蛋白高但白蛋白不高” + CRAB

> **主提示：中老年｜腰/胸痛｜CRAB｜BJP｜缗钱/ESR↑｜TP↑ ALB不高**

### Detailed Expansion

当前 Study 的“可能可能最可能”组合：

- 中老年；
- 腰痛 / 胸痛；
- 高钙、肾功能损害、贫血、骨病；
- 本周蛋白尿；
- 缗钱状 RBC、ESR 快；
- TP 高但 ALB 不高。

真正做病例时不要“逮着一个点开跑”：

```text
骨痛
≠ 自动MM
M蛋白
≠ 自动完成MM全部诊断
BJP
≠ 每例都有
```

当前 Lecture 特别提示 BJP 约只有部分患者阳性，因此诊断标准不能只依赖它。

**Routing**：CORE｜RECOGNITION｜CONFUSABLE｜MI-G

---

# 6｜诊断：用“克隆细胞 + 单克隆蛋白”建立证据

<!-- kianos:kp id="hematology-h08-kp10" -->
## KP10｜诊断两把主钥匙：骨髓单克隆浆细胞 + 免疫电泳 M 峰

> **主提示：骨髓浆≥10%｜免疫电泳单峰｜IgG最常见｜IgD肾损｜BJP非必有**

### Detailed Expansion

当前 Study 的诊断标准核心：

1. **骨髓穿刺**：单克隆浆细胞 ≥10%；
2. **免疫电泳**：单峰突起的单克隆 M 蛋白。

分型：

- IgG 型最常见；
- 当前 Lecture 写肾功能损害以 IgD 型最常见 / IgD 更易导致肾损害。

病例里如果只给肾损害，仍不能越过总体基率直接选 IgD；Lecture 真题旁注强调：**MM最常见仍是 IgG。**

本周蛋白尿不是每例都有，所以它是重要支持证据，不替代上述主证据。

**Routing**：CORE｜CONFUSABLE｜BOUNDARY｜MI-G

---

# 7｜分期：D-S 看“肿瘤负荷 + 肾”，ISS 用 β₂-MG / 白蛋白压缩风险

<!-- kianos:kp id="hematology-h08-kp11" -->
## KP11｜D-S 的 A / B：先单独把肾功能切开

> **主提示：A Cr<177或Ccr>40｜B Cr≥177或Ccr≤40｜R轴**

### Detailed Expansion

当前 Study：

| 亚型 | 肾功能门槛 |
|---|---|
| A | 血 Cr <177 μmol/L，或 Ccr >40 |
| B | 血 Cr ≥177 μmol/L，或 Ccr ≤40 |

所以 D-S 的数字分期和 A / B 亚型回答两个维度：

- I / II / III：肿瘤负荷；
- A / B：肾功能。

**Routing**：CORE｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h08-kp12" -->
## KP12｜D-S I / II / III：I 要“全部低”，III 只要“任一高”，II 留在中间

> **主提示：I全低｜III任一高｜Hb100/85｜Ca2.65｜M低高｜X线0/孤立 vs >3**

### Detailed Expansion

当前 Study 的四个轴：Hb、血钙、M 蛋白量、X 线骨病。

| 轴 | I期低负荷条件 | III期高负荷条件 |
|---|---|---|
| Hb | >100 g/L | <85 g/L |
| Ca²⁺ | ≤2.65 mmol/L | >2.65 mmol/L |
| M蛋白 | IgG <50；IgA <30；BJP <4 | IgG >70；IgA >50；BJP >12 |
| X线骨病 | 正常或骨型孤立性浆细胞瘤 | 溶骨病灶 >3个 |

规则：

- **I期**：满足所有低负荷条件；
- **III期**：满足任意一项高负荷条件；
- **II期**：介于两者之间。

不要把它背成十几个数字：先记“**I全满足，III任一触发**”，再把数字放 MI-D。

**Routing**：CORE｜CONFUSABLE｜VISUAL_ONLY｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h08-kp13" -->
## KP13｜ISS：β₂-MG + 白蛋白压缩分期；LDH另接肿瘤负荷 / R-ISS

> **主提示：I β2<3.5+Alb≥35｜III β2≥5.5｜II中间｜β2/LDH负荷｜R-ISS原图**

### Detailed Expansion

当前 Source 表的 ISS：

| ISS | 标准 |
|---|---|
| I | 血清 β₂-微球蛋白 <3.5 mg/L，且白蛋白 ≥35 g/L |
| II | 介于 I 与 III 之间 |
| III | 血清 β₂-微球蛋白 ≥5.5 mg/L |

当前 Lecture 还强调：

- β₂-微球蛋白↑；
- LDH↑；

可反映肿瘤负荷 / 预后方向。

同一 Source 图还列 R-ISS，将 ISS 与高危细胞遗传学和 LDH 再组合；该表属于 MI-D / VISUAL_ONLY，本轮不把它扩成第二套分期任务。

**Routing**：CORE｜VISUAL_ONLY｜MI-G｜MI-D

---

# 8｜治疗与预后：先确认“有症状 / 有器官损害”，再看移植候选

<!-- kianos:kp id="hematology-h08-kp14" -->
## KP14｜当前 Study 诱导治疗：移植候选 VD / RD；不适合移植可再选 MVP

> **主提示：有症状→诱导｜移植VD/RD｜非移植+MVP｜美法仑边界｜方案不外扩**

### Detailed Expansion

当前 Lecture 的大前提是：

> **有症状的 MM 需要诱导化疗。**

当前 Study 方案：

### 移植候选者

- VD：硼替佐米 + 地塞米松；
- RD：来那度胺 + 地塞米松。

### 不适合移植者

除上述方案外，还可选：

- MVP：美法仑 / 马法兰 + 硼替佐米 + 泼尼松。

Lecture 真题旁注强调：计划自体造血干细胞移植者，诱导阶段不宜选美法仑，因为会抑制骨髓。

`H8-SB03`：这里只保存当前 Study 方案，不自行加入外部最新版 MM 联合治疗。

**Routing**：CORE｜BOUNDARY｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h08-kp15" -->
## KP15｜预后与器官威胁：分期之外，还看年龄、遗传、肾、LDH；先识别能立即伤器官的出口

> **主提示：预后5｜年龄/遗传/ISS/肾/LDH｜MI-G威胁3｜不展开骨科**

### Detailed Expansion

当前 Lecture 列影响预后的因素：

1. 年龄；
2. 细胞遗传学异常；
3. ISS 分期；
4. 肾功能；
5. LDH。

System Guide 还把以下列为 MM 第一轮不能后置的**器官威胁识别**：

- 脊髓压迫；
- 高钙血症；
- 肾损害。

这里要求的是“看到就知道病情优先级改变”，不是在 H8 展开完整骨科 / 急诊处理流程。

**Routing**：CORE｜RECOGNITION｜BOUNDARY｜MI-G

---

<!-- kianos:kp id="hematology-h08-kp16" -->
## KP16｜最终病例算法：不要把一个 M 峰、一个骨痛或一个 BJP 当成整套诊断

> **主提示：年龄/骨痛｜CBC/TP-ALB｜骨髓浆｜M峰｜CRAB｜D-S/ISS｜移植候选**

### Detailed Expansion

```text
中老年 + 轴向骨痛 / 乏力
→ CBC：有无贫血 / 多系少？
→ TP 与 ALB：是否“总蛋白高、白蛋白不高”？
→ 骨髓：单克隆浆细胞是否达到当前Study标准？
→ 免疫电泳：是否单峰M蛋白？
→ 尿：BJP是否存在？
→ 器官层：C / R / A / B 是否成立？
→ 低剂量CT评估骨病
→ D-S：I/II/III + A/B
→ ISS：β₂-MG / Alb
→ 有症状后进入当前Study诱导治疗，并判断是否移植候选
```

三个不能机械跳结论：

1. **骨痛 ≠ MM**；
2. **M蛋白 ≠ 单独完成全部 MM 诊断**；
3. **BJP阴性 ≠ 排除 MM**。

**Routing**：CORE｜RECOGNITION｜CONFUSABLE｜MI-G

---

# 9｜Framework Reconstruction｜闭卷重建四条链

### 9.1 克隆—器官链

```text
浆细胞克隆
→ 骨髓占据 + 溶骨 + M蛋白 / 轻链
→ CRAB + 感染 / 高黏滞 / 出血
```

### 9.2 肾损害链

```text
游离轻链 / BJP
+ 高钙
+ 高尿酸
+ 淀粉样 / 高黏滞 / 浸润
→ 肾功能损害
```

### 9.3 诊断链

```text
骨髓单克隆浆细胞
+ 免疫电泳M峰
+ 器官损害证据
→ MM模型成立
```

### 9.4 分期链

```text
D-S：肿瘤负荷 I/II/III + 肾功能 A/B
ISS：β₂-MG + Alb
→ 再连接遗传、LDH与预后
```

---

# 10｜Memory Routing

## 10.1 MI-G｜第一轮必须即时掌握

- 浆细胞克隆 → 骨髓占据 + 溶骨 + M蛋白 / 轻链；
- CRAB 的共同上游；
- 正常多克隆 Ig↓，所以蛋白高仍易感染；
- 高黏滞、血浆置换；
- BJP / 游离轻链 = 溢出性蛋白尿接口；
- 低剂量 CT 是当前 Study 骨病首选评估；
- 骨髓单克隆浆细胞 ≥10% + 免疫电泳单峰 M 蛋白；
- IgG最常见；
- D-S “I全部低、III任一高” + A/B肾功能轴；
- ISS I / III 的 β₂-MG 门槛；
- 有症状后诱导；VD / RD 与非移植 MVP 的角色；
- 高钙、肾损害、脊髓压迫等器官威胁识别。

## 10.2 MI-D｜延迟记忆

- D-S 全部 Hb / Ca / M蛋白 / 骨病数字；
- ISS / R-ISS 完整表；
- Ig亚型细节；
- 骨病药物完整细则；
- 诱导方案全部字母与药名；
- 预后因素长名单；
- 冷球蛋白 / 雷诺等低频表现；
- 出血的全部分机制。

---

# 11｜原图门禁

必须回当前内科 Source Page / 原 PDF：

1. P203 骨病低剂量 CT 与溶骨原图；
2. P204 血清蛋白电泳 M 峰；
3. P204 MM 相关影像 / 浆细胞图；
4. P204 D-S 分期表；
5. P204 ISS / R-ISS 表；
6. P205 思维导图与病例分期图。

```text
VISUAL_SOURCE_GAP_OPEN
AI-readable Lecture文字层可用；原图未在本任务视觉层挂载。
```

---

# 12｜Outline Coverage Safety Net

## 12.1 Primary Ledger

```text
INT-U081_total = 11
mapped = 11
unmapped = 0
missing = 0
duplicate_primary = 0
```

| U081考点 | Primary归属 |
|---|---|
| 骨髓瘤细胞浸润破坏表现 | KP03–KP04 |
| 骨骼部位、症状、低剂量CT、地舒单抗 / 双膦酸盐 | KP03 |
| M蛋白：多克隆Ig、高黏滞 / 雷诺 / 置换、缗钱与ESR | KP05–KP07 |
| 肾损害、BJP、IVP边界、慢性肾损来源 | KP08 |
| CRAB | KP02 |
| 诊断标准、IgG / IgD | KP10 |
| D-S A / B | KP11 |
| D-S I / II / III | KP12 |
| ISS + 肿瘤负荷指标 | KP13 |
| 移植候选 / 非候选诱导方案 | KP14 |
| 预后因素 | KP15 |

### Ownership说明

- INT-U081 11题唯一 Primary 在 H8；
- K6拥有“溢出性蛋白尿”的正常机制语言，H8只 Apply 到 BJP；
- 后续骨科只接病理骨折 / 脊髓压迫等结构与处理，不重复 MM 内科主体；
- Outline仅作低压力 Coverage Safety Net。

---

# 13｜Lecture Knowledge Routing Audit

| Lecture范围 | 路由 | Knowledge Role | Memory |
|---|---|---|---|
| P203 骨骼受累部位、低剂量CT、骨病药 | KP03 | CORE + VISUAL_ONLY | MI-G / MI-D |
| P203 贫血 / 全血少与髓外浸润 | KP04 | CORE | MI-G |
| P203 多克隆Ig下降 / 感染 | KP05 | CORE + CONFUSABLE | MI-G |
| P203 高黏滞 / 冷球蛋白 / 雷诺 / 置换 | KP06 | CORE + SPECIAL | MI-G / MI-D |
| P203 出血 / 淀粉样 / 缗钱 / ESR | KP07 | CORE + CONNECTION | MI-G / MI-D |
| P203 BJP与肾损害、IVP边界 | KP08 | CORE + BOUNDARY + CONNECTION | MI-G |
| P203 CRAB病例入口 | KP02 + KP09 | CORE + RECOGNITION | MI-G |
| P204 骨髓浆细胞≥10%、M峰、IgG/IgD | KP10 | CORE + BOUNDARY | MI-G |
| P204 D-S A/B | KP11 | CORE | MI-G / MI-D |
| P204 D-S I–III | KP12 | CORE + VISUAL_ONLY | MI-G / MI-D |
| P204 ISS / R-ISS、β₂-MG / LDH | KP13 | CORE + VISUAL_ONLY | MI-G / MI-D |
| P204 诱导化疗与移植候选 | KP14 | CORE + BOUNDARY | MI-G / MI-D |
| P204 预后因素 | KP15 | CORE | MI-D |
| P205 真题病例与思维导图 | KP16 | RECOGNITION + REDUNDANT_EXPOSITION | MI-G |

```text
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
```

---

# 14｜First-pass Question Probe

```text
source = TTSX Lecture-attached Questions
selection = LectureQuestionBinding
status = READY_PENDING_BINDING
question_to_kp_semantic_graph = DEFERRED_TO_BREAKTHROUGH
```

不得从 U081 手工挑题冒充 Lecture-attached Questions。

---

# 15｜建议学习切片

```text
H8-A｜KP01–KP04
浆细胞克隆、CRAB、骨病与骨髓占据

H8-B｜KP05–KP10
M蛋白、高黏滞、出血、BJP肾损与诊断

H8-C｜KP11–KP16
D-S / ISS、治疗、预后与最终病例算法
```

---

# 16｜Block Exit｜闭卷 16 问

1. 浆细胞克隆为什么能同时造成骨、肾、贫血和高钙？
2. CRAB 每个字母怎样回到共同上游？
3. MM 为什么偏爱含造血骨髓的轴向骨骼？
4. 当前 Study 评估 MM 骨病首选什么检查，典型三种骨表现是什么？
5. 为什么单克隆 Ig 多，患者反而更易感染？
6. 高黏滞与冷球蛋白怎样连接雷诺现象，当前 Study 如何处理？
7. MM 出血为什么不是单一血小板减少？
8. BJP 为什么属于溢出性而不是“肾小球第一故障”蛋白尿？
9. MM 肾损伤还有哪些非轻链路径？
10. 当前 Study 的两项核心诊断证据是什么？
11. IgG 与 IgD 的当前考试口径分别是什么？
12. D-S A / B 看什么？
13. 为什么 D-S I期要“全部低”，III期只需“任一高”？
14. ISS I / III 的 β₂-MG / Alb 门槛是什么？
15. 移植候选与非候选的当前 Study 诱导方案如何分？
16. 从“中老年腰痛 + Hb低 + TP高”开始，如何一步步确认 MM 并完成分期？

---

# 17｜Block Production Gate

```text
Study_continuity = PASS
natural_mechanism_split = 0
repeated_first_exposure = 0
Framework_is_map = PASS
KP_natural_units = 16
prompt_leakage = PASS
Outline_total = 11
Outline_mapped = 11
unmapped = 0
missing = 0
duplicate_primary = 0
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
First_pass_question_probe = READY_PENDING_BINDING
Source_gap = SOURCE_BOUNDARY_EXPLICIT
formal_source_conflict_count = 0
formal_source_boundary_count = 3
Visual_gate = REQUIRED_WITH_INTERNAL_ORIGINAL_PDF_GAP
System_final_gate = NOT_RUN_NON_FINAL_BATCH
```

---

# 18｜Block Complete

```text
Framework已建立
+ 内科P203–205已按“克隆细胞 / M蛋白 / 器官损害”连续学习
+ 能把CRAB重建成共同上游链
+ 能解释低剂量CT、BJP、高黏滞、缗钱与ESR
+ 能用骨髓浆细胞与M峰建立诊断证据
+ 能恢复D-S的I/II/III + A/B双轴
+ 能恢复ISS主门槛
+ 能按当前Study区分移植候选与非候选诱导方案
+ 能识别高钙、肾损害、脊髓压迫等器官威胁
+ KP Active Recall完成
+ Outline按需低压力扫漏
+ TTSX Lecture-attached Questions待绑定或已完成
```

**最低出口**：面对“骨痛 + 贫血 + 蛋白异常 + 肾损害”时，能先回到**浆细胞克隆 → 骨髓占据 / 溶骨 / M蛋白与轻链**，再用证据、器官损害与分期完成判断，而不是把 CRAB 当成四个孤立记忆点。
