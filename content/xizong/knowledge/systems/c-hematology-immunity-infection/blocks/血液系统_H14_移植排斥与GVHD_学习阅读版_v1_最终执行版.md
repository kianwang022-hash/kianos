---
type: block_guide
schema_version: 1
content_version: 1
system: 血液—免疫—感染
system_id: hematology_immunity_infection
block_id: hematology-h14
title: 移植排斥与 GVHD
order: 14
status: FINAL_EXECUTION
study_refs:
  - source_id: pathology-lecture
    label: 病理学讲义_AI阅读版｜排斥反应与GVHD
    pdf_page_start: 90
    pdf_page_end: 94
    action: primary
  - source_id: hematology-h12
    label: H12｜免疫共同语言、超敏反应与自身耐受
    action: recall
  - source_id: hematology-h02
    label: H2｜血型、交叉配血与成分输血
    action: recall_apply
outline_units:
  - PATH-U010-H14-SUBSET
outline_primary_count: 6
kp_count: 12
prerequisites:
  - hematology-h02
  - hematology-h12
next_blocks:
  - hematology-h15
  - hematology-h20
visual_gates:
  - pathology-with-map-p106-rejection-timeline-and-gvhd
  - pathology-with-map-p107-acute-cellular-vascular-chronic-micrographs
  - pathology-with-map-p107-hypersensitivity-table
visual_gate_status: VISUAL_SOURCE_AVAILABLE
source_gap_status: SOURCE_BOUNDARY_EXPLICIT
source_boundaries:
  - H14-SC01
  - H14-SC02
  - H14-SG01
  - H14-SB02
system_final_batch: false
---

# H14｜移植排斥与 GVHD
## 先判“谁攻击谁”，再判“什么时候发生、主要伤血管还是间质”

> **中心问题**：同种移植后，损伤到底来自受者免疫系统攻击移植物，还是移植物中的免疫活性细胞攻击宿主；超急、急性和慢性排斥又怎样用时间、预存抗体、血管改变与 T细胞浸润分开？
>
> **文件性质**：血液—免疫—感染系统第十四个 canonical Block。H2 已建立 ABO、交叉配血、辐照成分血及输血相关 GVHD 入口；H12 已建立抗体、免疫复合物和 T细胞损伤最低语言。本 Block 只把这些语言放进移植方向与时相。
>
> **Primary Study**：`病理学讲义_AI阅读版.md` PDF P90–94《排斥反应》；原图核对使用 `27病理精编版合集【带导图】.pdf` PDF P106–107。
>
> **Primary Outline**：病理 U010 排斥反应与 GVHD **6 / 6**。
>
> **Source boundary**：当前资料不支持完整器官移植适应证、HLA配型流程、免疫抑制药方案、骨髓移植临床路径和各器官特异排斥形态。只冻结攻击方向、三种时相、核心病理和当前 Study 的免疫口径。

---

## 0｜第一轮固定流程

```text
Framework Orientation
→ Recall H2：ABO / 交叉配血 / 辐照红细胞 / 输血相关GVHD
→ Recall H12：Ⅱ、Ⅲ、Ⅳ型最低语言
→ 病理 Lecture P90–91 连续学习
→ 回原图核对P106–107的时间轴和三类组织图
→ P92–94 真题低压力核对
→ Lecture Done
→ Framework Reconstruction
→ KP Active Recall
→ Outline Quick Check（可选、低压力）
→ TTSX Lecture-attached Questions
→ Block Complete
```

第一轮只抓住这条主链：

```text
同种抗原差异
        ↓
先判攻击方向
  ├─ 受者免疫系统 → 攻击移植物 = 排斥反应
  └─ 移植物免疫活性细胞 → 攻击受者 = GVHD
        ↓
若为排斥，再判时间
  ├─ 数分钟—数小时：超急性
  ├─ 较早、最常见：急性
  └─ 长期：慢性
        ↓
再判病理层
  ├─ 超急：急性小动脉炎 + 纤维素样坏死 + 纤维素性血栓
  ├─ 急性血管型：亚急性血管炎 + 内膜增厚
  ├─ 急性细胞型：间质CD4 / CD8 T细胞浸润
  └─ 慢性：血管内膜纤维化
```

---

# 1｜总 Framework

<!-- kianos:framework id="hematology-h14-framework-main" -->

```text
移植后组织损伤
  ↓
第一问｜谁攻击谁？
  ├─ 受者 → 移植物：排斥
  └─ 移植物 → 受者：GVHD
  ↓
第二问｜受者是否已有“准备好的”抗体？
  ├─ 有 → 超急性血管灾难
  └─ 无 / 新启动 → 急性或慢性路径
  ↓
第三问｜主要病理在哪里？
  ├─ 小动脉急性坏死 + 血栓
  ├─ 血管内膜增厚
  ├─ 间质T细胞浸润
  └─ 血管内膜纤维化
  ↓
第四问｜攻击方向与成分来源是否匹配？
  ├─ 器官移植：受者免疫攻击移植物
  ├─ 骨髓 / 胸腺移植：移植物可带大量免疫活性细胞
  └─ 输血：供者淋巴细胞可造成输血相关GVHD
  ↓
最后问｜当前Study是否存在分型冲突？
  ├─ 超急性：教材归Ⅲ型；讲义称本质更接近Ⅱ型
  └─ 慢性：列为Ⅳ型，但又写体液免疫为主、CD4关键
```

---

# 2｜KP Active Recall

<!-- kianos:kp id="hematology-h14-kp01" -->
## KP01｜所有移植题的第一问：谁攻击谁

> **主提示：排斥=谁→谁｜GVHD=谁→谁｜普通输血溶血又是谁打谁**

### 1｜排斥反应

```text
受者免疫系统
→ 识别移植物的同种抗原差异
→ 攻击移植物
```

### 2｜GVHD

```text
移植物内的免疫活性细胞
→ 在受者体内存活
→ 识别并攻击宿主组织
```

### 3｜与普通输血溶血分开

- 普通输血溶血：多为受者抗体攻击供者 RBC；
- 输血相关 GVHD：供者淋巴细胞攻击受者。

先判方向，能直接排除大量干扰项。

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="hematology-h14-kp02" -->
## KP02｜排斥轻重的总入口：供受者 HLA 差异程度

> **主提示：决定轻重1因素｜白细胞抗原vs红细胞抗原｜ABO在哪个时相最关键**

当前 Study 明确：

> **排斥反应轻重取决于供者与受者 HLA 的差异程度。**

HLA 是白细胞抗原语言；ABO 是红细胞抗原语言。两者在超急性排斥中都可成为预存抗体入口：

- 受者已有供者特异性 HLA 抗体；
- 或供受者 ABO 血型不合。

（易混：总的排斥强弱看 HLA差异；超急触发条件可同时出现 HLA预存抗体或 ABO不合。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="hematology-h14-kp03" -->
## KP03｜GVHD成立的两个条件：宿主弱 + 移植物带活性免疫细胞

> **主提示：受者1条件｜移植物1条件｜典型移植2类｜攻击方向｜结果范围**

当前 Study 的 GVHD 条件：

1. 受者免疫功能缺陷，无法有效清除供者免疫细胞；
2. 移植物含大量免疫活性细胞。

典型接口：

- 骨髓移植；
- 胸腺移植。

随后：

```text
供者免疫活性细胞
→ 针对宿主细胞产生免疫反应
→ 宿主全身性组织损伤
```

口诀“倒反天罡”只是帮助记攻击方向，不能替代两个成立条件。

**Routing**：CORE｜RECOGNITION｜MI-G

---

<!-- kianos:kp id="hematology-h14-kp04" -->
## KP04｜排斥三时相：超急、急性、慢性

> **主提示：3型｜超急时间｜谁最常见｜每型1病理关键词**

| 类型 | 当前时间 / 频率语言 | 第一病理关键词 |
|---|---|---|
| 超急性 | 移植后数分钟至数小时 | 急性小动脉炎 + 血栓 |
| 急性 | 当前 Study 标注“常见” | 血管内膜增厚或T细胞浸润 |
| 慢性 | 长期演变 | 血管内膜纤维化 |

当前讲义指出，随着术前配型和评估改善，超急性发生概率较小，临床更多见急性排斥。

（边界：当前 Source 没有给出急性和慢性的完整时间阈值，不用外部知识补数字。）

**Routing**：CORE｜RECOGNITION｜BOUNDARY｜MI-G

---

<!-- kianos:kp id="hematology-h14-kp05" -->
## KP05｜超急性排斥的触发：受者血里已经有“准备好的”抗体

> **主提示：预存抗体2路｜HLA/ABO｜时相｜为什么来得快**

### 1｜两条触发入口

- 受者血液中已有供者特异性 HLA 抗体；
- 或供者与受者 ABO 血型不符。

### 2｜为何“超急”

```text
抗体在移植前已经存在
→ 移植物血流一恢复即可识别靶点
→ 无需等待新的免疫反应逐步建立
→ 数分钟至数小时出现
```

这条“已经准备好”的时间逻辑，是超急与急性最稳定的区别。

**Routing**：CORE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h14-kp06" -->
## KP06｜超急性排斥的病理：小动脉炎—坏死—血栓—缺血

> **主提示：血管4步｜坏死类型｜血栓类型｜最终结局**

当前 Study 病理链：

```text
广泛急性小动脉炎
→ 血管壁纤维素样坏死
→ 纤维素性血栓形成
→ 移植物缺血性坏死
```

它是“血管灾难”，不是以间质淋巴细胞浸润为主。

（易混：血管内膜增厚属于急性血管型；血管内膜纤维化属于慢性；纤维素样坏死 + 纤维素性血栓属于超急性。）

**Routing**：CORE｜CONFUSABLE｜VISUAL_ONLY｜MI-G

---

<!-- kianos:kp id="hematology-h14-kp07" -->
## KP07｜急性血管型：从“坏死”降一级到内膜增厚

> **主提示：急性血管型｜炎症时相｜内膜方向｜与超急/慢性各差1词**

当前 Study：

```text
急性排斥—血管型
→ 亚急性血管炎为主
→ 血管内膜增厚
```

三者顺序可用一条形态轴恢复：

```text
超急：纤维素样坏死
急性血管型：内膜增厚
慢性：内膜纤维化
```

“降个级”只是讲义记忆提示；真正要记的是血管壁损伤从急性坏死转向增厚，再到慢性纤维化。

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="hematology-h14-kp08" -->
## KP08｜急性细胞型：间质 CD4 / CD8 T细胞为主

> **主提示：急性细胞型｜位置1｜细胞2｜单核vs多核｜超敏类型**

当前 Study：

- 主要部位：间质；
- 主要细胞：CD4 和 CD8 T细胞；
- 炎细胞身份：单个核细胞浸润；
- 超敏接口：Ⅳ型迟发型。

（易混：这里的“单个核细胞”不是说只出现一个细胞，而是与中性粒细胞等多叶核细胞相对的形态类别。）

原图门禁：P107左侧“细胞型排斥反应”图显示间质内大量单个核细胞浸润，应与血管型图分开看。

**Routing**：CORE｜VISUAL_ONLY｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="hematology-h14-kp09" -->
## KP09｜慢性排斥：血管内膜纤维化是最稳形态锚

> **主提示：慢性1形态｜CD4关键｜体液为主？｜2条下游｜来源冲突**

### 1｜形态

```text
慢性排斥
→ 血管内膜纤维化
→ 管腔逐渐受限
→ 长期缺血 / 功能下降接口
```

当前 Source 最稳的考试答案是：

> **血管内膜纤维化。**

### 2｜当前 Study 的免疫说明

讲义写：

- CD4 Th细胞发挥关键作用；
- CD4可促进 B细胞产生特异性抗体、激活补体；
- 也可诱导 CD8 CTL、NK细胞和巨噬细胞活化；
- 当前表述认为免疫攻击以体液免疫为主。

因此可以恢复为：

```text
CD4为枢纽
  ├─ B细胞—抗体—补体方向
  └─ CD8 / NK / 巨噬细胞方向
```

### 3｜来源冲突必须保留

同一 Lecture 又把慢性排斥列入Ⅳ型迟发型超敏，同时强调其“体液免疫为主”。本文件不借一般免疫学知识强行统一：

- 题问病理形态 → 答内膜纤维化；
- 题问当前 Lecture 的主要免疫攻击 → 保留体液免疫为主、CD4关键；
- 题问超敏反应表 → 按当前表列Ⅳ型，并注明冲突。

**Routing**：CORE｜CONFUSABLE｜BOUNDARY｜MI-G

---

<!-- kianos:kp id="hematology-h14-kp10" -->
## KP10｜一张时间—形态表：不要把“内膜增厚”和“内膜纤维化”混掉

> **主提示：超急4词｜急血管2词｜急细胞3词｜慢性1词**

| 类型 | 触发 / 主体 | 关键形态 | 高频区分 |
|---|---|---|---|
| 超急性 | 预存HLA抗体或ABO不合 | 急性小动脉炎、纤维素样坏死、纤维素性血栓、缺血坏死 | 数分钟—数小时 |
| 急性血管型 | 新启动排斥的血管损伤 | 亚急性血管炎、内膜增厚 | 不是纤维化 |
| 急性细胞型 | CD4 / CD8 T细胞 | 间质单个核细胞浸润 | 细胞型、Ⅳ型接口 |
| 慢性 | 长期免疫攻击 | 血管内膜纤维化 | 最稳形态锚 |

原图 P107 顶部三张图依次展示：细胞型间质浸润、血管型内膜炎性改变、慢性血管腔狭窄 / 纤维化方向。学习时必须回图确认。

**Routing**：CORE｜VISUAL_ONLY｜RECOGNITION｜MI-G

---

<!-- kianos:kp id="hematology-h14-kp11" -->
## KP11｜超敏分型中的两个 Source Conflict：只登记，不私自修教材

> **主提示：超急Ⅱ/Ⅲ冲突｜慢性Ⅳ/体液冲突｜考试时先看题问哪层**

### 1｜超急性排斥

当前 Lecture：

- 表格按10版教材归Ⅲ型；
- 旁注写按定义本质更接近Ⅱ型，但病理变化类似Ⅲ型。

### 2｜慢性排斥

当前 Lecture：

- 超敏表列Ⅳ型迟发型；
- 机制说明又强调体液免疫为主、CD4为关键。

### 3｜安全答题规则

```text
题问当前表格分类
→ 按Study表格回答，并保留冲突意识

题问具体病理
→ 回到血管坏死 / 增厚 / T细胞浸润 / 纤维化

题问攻击方向
→ 回到受者→移植物或移植物→宿主
```

不把模型常识凌驾于 Source，也不把 Source 内部不一致藏掉。

**Routing**：CONFUSABLE｜BOUNDARY｜MI-G

---

<!-- kianos:kp id="hematology-h14-kp12" -->
## KP12｜输血相关 GVHD 与骨髓移植 GVHD：共同点是供者免疫细胞打受者

> **主提示：共同攻击方向｜供者细胞从哪来2场景｜受者条件｜辐照作用｜与溶血区别**

### 1｜共同方向

```text
供者免疫活性细胞
→ 在受者体内存活
→ 攻击受者组织
```

### 2｜两个场景

- 骨髓 / 胸腺移植：移植物本身含大量免疫活性细胞；
- 输血：供者淋巴细胞随血液成分进入受者。

### 3｜H2 Recall

H2 已完成：

- 辐照红细胞用于灭活供者淋巴细胞，预防输血相关 GVHD；
- 输血相关 GVHD 可出现全血细胞减少接口；
- 普通溶血与 GVHD 的攻击方向相反。

H14不重复成分输血全章，只把该接口接入移植模型。

**Routing**：CORE｜CONNECTION｜CONFUSABLE｜MI-G

---

# 3｜高密度比较与病例算法

## 3.1 排斥 vs GVHD

| 判断轴 | 排斥反应 | GVHD |
|---|---|---|
| 谁发动攻击 | 受者免疫系统 | 移植物中的免疫活性细胞 |
| 谁被攻击 | 移植物 | 受者 / 宿主组织 |
| 关键前提 | 同种抗原差异、受者可发动免疫 | 受者免疫弱 + 移植物免疫细胞多 |
| 典型场景 | 器官移植 | 骨髓 / 胸腺移植、输血相关 |

## 3.2 三时相固定区分

```text
超急
= 已有抗体
= 分钟—小时
= 小动脉炎 + 纤维素样坏死 + 血栓

急性
= 最常见
= 血管型内膜增厚 或 细胞型T细胞浸润

慢性
= 内膜纤维化
```

## 3.3 病例固定起手式

```text
移植后组织损伤
→ 先判谁攻击谁
→ 若受者攻击移植物：看时间
→ 分钟—小时：查预存HLA抗体 / ABO不合与血管血栓
→ 急性：看内膜增厚还是间质CD4 / CD8
→ 慢性：看内膜纤维化
→ 若供者攻击受者：看免疫活性细胞来源与受者免疫状态
```

---

# 4｜Framework Reconstruction

完成 Lecture 后闭卷重建：

```text
① 写排斥与GVHD两个攻击方向。
② 写决定排斥轻重的HLA差异。
③ 写GVHD成立的2个条件与2类典型移植。
④ 写排斥3个时相。
⑤ 写超急性出现时间和2条预存抗体入口。
⑥ 写超急性血管4步病理链。
⑦ 写急性血管型的2个关键词。
⑧ 写急性细胞型的位置、2类T细胞和细胞形态类别。
⑨ 写慢性排斥最稳形态锚。
⑩ 画CD4连接体液与细胞两路的当前Study图。
⑪ 明确超急Ⅱ/Ⅲ与慢性Ⅳ/体液两个Source Conflict。
⑫ 比较输血溶血、输血GVHD、器官排斥三种攻击方向。
⑬ 说明辐照成分血预防的对象。
```

---

# 5｜Memory Routing

## MI-G｜第一轮必须即时掌握

1. 排斥 = 受者打移植物；GVHD = 移植物打受者；
2. 排斥轻重看 HLA差异；
3. GVHD = 宿主免疫弱 + 移植物免疫细胞多；
4. 超急性数分钟至数小时；
5. 超急由预存供者特异性 HLA抗体或 ABO不合触发；
6. 超急：小动脉炎、纤维素样坏死、纤维素性血栓、缺血坏死；
7. 急性血管型：亚急性血管炎、内膜增厚；
8. 急性细胞型：间质 CD4 / CD8 T细胞浸润；
9. 慢性：血管内膜纤维化；
10. CD4在慢性排斥当前 Study 中是关键枢纽；
11. 超急与慢性超敏分类存在显式 Source Conflict；
12. 辐照用于灭活供者淋巴细胞、预防输血相关 GVHD。

## MI-D｜进入 MarginNote 3

- HLA全部类别与配型细节；
- 各器官特异排斥形态；
- 免疫抑制药完整名单、剂量和方案；
- 急性 / 慢性完整临床时间阈值；
- 血管型与细胞型的全部组织学表现；
- GVHD器官特异临床表现；
- 两个 Source Conflict 的教材版本说明。

---

# 6｜Study 原图门禁与 Source Registry

必须回正式 Study / 原图核对：

1. `27病理精编版合集【带导图】.pdf` P106：GVHD条件、超急—急性—慢性排斥文字时间轴；
2. P107顶部左图：急性细胞型排斥，间质单个核细胞浸润；
3. P107顶部中图：急性血管型排斥，血管内膜炎性改变 / 增厚；
4. P107顶部右图：慢性排斥，血管壁纤维化与管腔受限方向；
5. P107下方超敏反应表：核对两个来源冲突的原始位置；
6. H2中辐照红细胞与输血相关 GVHD 接口。

## Registry

| ID | 类型 | 内容 | 当前处置 |
|---|---|---|---|
| H14-SC01 | Source Conflict | 超急性排斥在表格归Ⅲ型；旁注称本质更接近Ⅱ型、病理类似Ⅲ型 | 双口径保留；按题目所问层级作答 |
| H14-SC02 | Source Conflict | 慢性排斥列Ⅳ型迟发型，同时机制段写体液免疫为主、CD4关键 | 形态、机制、表格分层保留，不强行统一 |
| H14-SG01 | Source Gap | 当前无完整免疫抑制治疗、HLA配型与器官特异移植 Lecture | 不用外部指南补写 |
| H14-SB02 | Ownership Boundary | 成分输血、辐照与普通输血反应Primary归H2 | H14只Recall攻击方向和GVHD接口 |

```text
visual_source = AVAILABLE_PATHOLOGY_WITH_MAP_PDF
formal_source_gap_count = 1
formal_source_conflict_count = 2
formal_source_boundary_count = 1
silent_source_correction = 0
```

---

# 7｜Outline Coverage Safety Net

## 7.1 Primary ledger

```text
PATH-U010-H14_total = 6
mapped = 6
unmapped = 0
missing = 0
duplicate_primary = 0
```

| Outline范围 | 题数 | Primary KP |
|---|---:|---|
| 决定排斥轻重的HLA差异 | 1 | KP02 |
| GVHD定义、条件与攻击方向 | 1 | KP01、KP03、KP12 |
| 排斥反应三型 | 1 | KP04、KP10 |
| 超急性触发与病理 | 1 | KP05–KP06、KP11 |
| 急性血管型 / 细胞型 | 1 | KP07–KP08、KP10 |
| 慢性排斥内膜纤维化与免疫口径 | 1 | KP09–KP11 |
| **合计** | **6** | **6 / 6** |

### 7.2 Ownership说明

- H2拥有 ABO、交叉配血、成分输血、辐照与输血相关反应；H14只接管完整排斥 / GVHD方向；
- H12拥有四型超敏最低语言；H14只应用，并登记来源冲突；
- 完整免疫抑制治疗与器官特异移植当前为 Source Boundary；
- H13免疫缺陷主体不重复，只把“受者免疫功能缺陷”作为 GVHD成立条件。

学习者侧：Outline用于低压力扫漏，不要求完成6题后才能 Block Complete。

---

# 8｜Lecture Knowledge Routing Audit

| Lecture范围 | 路由 | Knowledge Role | 边界 |
|---|---|---|---|
| P90 HLA与排斥轻重 | KP02 | CORE + RECOGNITION | 不扩HLA配型全章 |
| P90 GVHD | KP01、KP03、KP12 | CORE + CONFUSABLE | 输血成分主体Recall H2 |
| P90超急性 | KP04–KP06 | CORE + VISUAL_ONLY | 超敏归类冲突另记 |
| P90急性血管型 | KP07、KP10 | CORE + CONFUSABLE + VISUAL_ONLY | 不扩器官特异形态 |
| P90急性细胞型 | KP08、KP10 | CORE + VISUAL_ONLY | 完整T细胞免疫学缺Source |
| P90慢性排斥 | KP09–KP11 | CORE + SOURCE_CONFLICT + VISUAL_ONLY | 不静默统一体液 / Ⅳ型表述 |
| P91超敏表 | KP11 | CONFUSABLE + SOURCE_CONFLICT | H12为Primary，H14为Apply |
| P92–94真题 | Coverage / Probe | RECOGNITION | Question relation待绑定 |

```text
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
```

---

# 9｜First-pass Question Probe

```text
来源：
TTSX Lecture-attached Questions

选择方式：
LectureQuestionBinding 自动提供

绑定范围：
病理免疫性疾病 P90–94 中移植排斥 / GVHD题旁内容

状态：
待绑定
```

不得从病理 U010 手工挑题冒充 Lecture-attached Questions。

---

# 10｜Block Production Gate

```text
Study_continuity = PASS
natural_mechanism_split = 0
repeated_first_exposure = 0
Framework_is_map = PASS
KP_natural_units = 12
prompt_leakage = PASS
Outline_total = 6
Outline_mapped = 6
unmapped = 0
missing = 0
duplicate_primary = 0
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
First_pass_question_probe = READY_PENDING_BINDING
Source_gap = SOURCE_BOUNDARY_EXPLICIT
formal_source_conflict_count = 2
formal_source_boundary_count = 2
Visual_gate = REQUIRED_AND_AVAILABLE
System_final_gate = NOT_RUN_NON_FINAL_BATCH
```

---

# 11｜Block Complete

```text
Framework已建立
+ 已Recall H2与H12必要接口
+ 病理P90–91已连续学习并核对P92–94
+ 能先判排斥vsGVHD攻击方向
+ 能说出GVHD两个成立条件
+ 能写决定排斥轻重的HLA差异
+ 能重建超急 / 急性 / 慢性时间轴
+ 能写超急性血管4步病理链
+ 能区分急性血管型与细胞型
+ 能写慢性排斥的内膜纤维化
+ 能重建CD4连接体液与细胞两路的当前Study口径
+ 能显式说出两个Source Conflict
+ 能区分普通输血溶血与输血相关GVHD
+ KP Active Recall完成
+ Outline按需低压力扫漏
+ TTSX Lecture-attached Questions待绑定或已完成
```

**最低出口**：面对移植后损伤，第一句先回答 **谁攻击谁**；随后按 **时间 → 预存抗体 → 血管坏死 / 内膜增厚 / T细胞浸润 / 内膜纤维化** 定位，而不是只背“超急、急、慢”三个名词。
