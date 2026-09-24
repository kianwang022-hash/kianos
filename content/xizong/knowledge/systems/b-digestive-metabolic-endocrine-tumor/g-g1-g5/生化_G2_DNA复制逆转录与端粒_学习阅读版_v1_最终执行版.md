---
type: block_guide
schema_version: 1
content_version: 1
source_cycle: 27考研
primary_source_pdf: 27生化跟课版合集【不带导图】.pdf
source_snapshot: content/xizong/source-snapshots/27/生物化学讲义_AI阅读版_27跟课_UnifiedSource_v1.md
explanatory_substrate: 生物化学讲义_AI阅读版(1).md / 26生化.pdf
system_id: digestive-metabolism-endocrine
block_id: dme-g02
title: DNA复制、逆转录与端粒
order: G2
study_refs:
  - source_id: biochemistry-27-unified
    label: 27生化跟课｜2.3 DNA的合成
    source_pdf: 27生化跟课版合集【不带导图】.pdf
    source_pdf_page_start: 115
    source_pdf_page_end: 127
coverage_source:
  source_id: bio27-current-lecture-attached-questions
embedded_questions_total: 13
embedded_questions_accounted: 13
unmapped_embedded_questions: 0
kp_count: 11
prerequisites:
  - dme-g01
  - dme-m01
next_blocks:
  - dme-g03
  - dme-g05
visual_gates:
  - bio26-p123-p129-replication-fork
  - bio26-p130-p131-prokaryote-vs-eukaryote
  - bio26-p132-telomerase
  - bio26-p133-reverse-transcription
  - bio26-p138-replication-vs-transcription
visual_gate_status: SOURCE_AVAILABLE_EXTERNAL_PRIMARY_27_PDF
source_gap_status: SOURCE_BOUND_CURRENT_27_SPATIAL_ONLY
first_pass_question_probe: CURRENT_SOURCE_POSITION_ACCOUNTED_RELATION_OWNER_SEPARATE
---

# G2｜DNA复制、逆转录与端粒
## 学习阅读版 v1｜最终执行版

> **中心问题**：双链 DNA 怎样在方向性限制下完成快速而高保真的复制；线性染色体末端怎样被补全；RNA 病毒又怎样反向生成 DNA？
>
> **文件性质**：分子支路第二个 canonical Block。它建立复制系统、端粒和逆转录；基因怎样被选择性转录与翻译后置 G3–G4。
>
> **Primary Study**：`生物化学讲义_AI阅读版.md`，原 PDF P123–138，印刷页 P103–116。
>
> **Coverage Safety Net**：Embedded Questions **12 / 12 accounted**；`unmapped_embedded_questions = 0`。
>
> **第一轮流程**：Framework → Lecture及原图 → Framework Reconstruction → KP Active Recall → Embedded Questions optional / low-pressure → TTSX Lecture-attached Questions → Block Complete。

---

# 0｜Current Source / Authority

- Current first-pass Source：BIO27-S17 / P115–P127。
- Source map owner：content/xizong/knowledge/learner/biochemistry-27-source-map.json。
- 26 refined 只作为 explanation reconstruction substrate，不形成第二套 learner Source。
- S17 在一个自然 Source 单元中形成 G2 全部 canonical layers；S22 只回灌 DNA repair support。

# 1｜Canonical Knowledge Hierarchy

## Mother Model｜复制约束 → 复制叉执行与高保真 → 端粒 / 逆转录特殊解法 → 工具与转录出口比较

## L1｜DNA复制执行系统｜KP01–KP07

**Core relation**
- semiconservative + bidirectional + semidiscontinuous；
- primer 提供 3′-OH；
- DNA polymerase 只能 5′→3′ 延长；
- helicase / topoisomerase / SSB / primase 协同复制叉；
- proofreading + repair 维持高保真。

**Boundary**
- 前导 / 后随差异来自模板反向平行与聚合方向限制。
- polymerase 不能从零连接两个游离 dNTP。
- dedicated DNA damage repair taxonomy 归 G5。

**Precision**
- 原核 Pol I / II / III 与真核 α / δ / ε 等 current Study 角色；
- 3′→5′ exonuclease 校对与 Pol I 的 5′→3′ exonuclease 边界；
- PCNA / sliding clamp、Okazaki fragment exactness 回 current 27 Source。

**Connection**
- G1 提供结构 / 方向；G3 从这里切换到“不需引物的转录”。

### KP01｜DNA复制的四个总特征

> **讲义定位 →** 生化 Lecture PDF P123–125，印刷页 P103–105。  
> **主提示**：复制4特征｜每个特征各由什么机制保证

    DNA 复制不是“沿一条链一路抄完”，而是四个特征共同成立：

1. **半保留**：两条母链分别进入两个子代 DNA，各自指导新链；
2. **双向**：一个复制起点形成两个方向相反的复制叉；
3. **半不连续**：前导链连续、后随链以冈崎片段不连续合成；
4. **高保真**：严格配对、聚合酶选碱基与校对、复制后修复共同保证。

（易混：双向复制是“一个起点形成两个复制叉”，不是新链既能 5′→3′又能 3′→5′；新链始终 5′→3′。）

**Routing**：CORE｜CONFUSABLE｜MI-G
<!-- kianos:kp id="dme-g02-kp02" -->

### KP02｜复制叉、前导链与后随链：为什么会半不连续

> **讲义定位 →** 生化 Lecture PDF P124、P127–129，印刷页 P104、P107–109。  
> **主提示**：复制叉头尾｜3个固定方向｜前/后随｜冈崎｜引物次数

    复制叉是 Y 形开链区：头部为已解旋模板和正在合成的新链，尾部为尚未打开的母链双螺旋。

半不连续来自三个同时固定的条件：

```text
两条模板反向平行
+ 复制叉向前移动
+ DNA新链只能5′→3′延长
```

于是：

| 链 | 与解链方向 | 合成方式 | 引物 |
|---|---|---|---|
| 前导链 | 同向 | 连续 | 较少 |
| 后随链 | 反向 | 冈崎片段式不连续 | 多次 |

后随链并非反向合成，而是在复制叉不断打开后，分段从新的引物开始，每个片段仍按 5′→3′延长。

**Routing**：CORE｜VISUAL_ONLY｜CONFUSABLE｜MI-G
<!-- kianos:kp id="dme-g02-kp03" -->

### KP03｜dNTP、引物与能量：DNA聚合酶为什么不能从零开始

> **讲义定位 →** 生化 Lecture PDF P124–126，印刷页 P104–106。  
> **主提示**：原料｜延长方向｜为什么需要引物｜dNTP能量从哪来

    DNA 复制以四种 dNTP 为原料。dNTP 进入新链时以 dNMP 形式保留，PPi 离去并提供反应推动力。

DNA 聚合酶不能直接把两个游离 dNTP 首尾相接，因此必须先有引物提供 **3′-OH**：

```text
RNA引物的3′-OH
+ 新dNTP
→ 形成新的3′,5′-磷酸二酯键
→ 新链按5′→3′延长
```

原核引物酶为 DnaG，本质属于依赖 DNA 的 RNA 聚合酶；真核引物接口由 DNApol α 相关体系承担。精确亚基细节进入 MI-D。

（易混：转录不需要引物；DNA复制、逆转录和PCR需要引物，但引物身份不同。）

**Routing**：CORE｜CONFUSABLE｜MI-G
<!-- kianos:kp id="dme-g02-kp04" -->

### KP04｜DNA聚合酶：聚合、校对、切引物与高保真

> **讲义定位 →** 生化 Lecture PDF P125–126，印刷页 P105–106。  
> **主提示**：3类活性｜Pol I/II/III各主事｜Klenow｜校对方向

#### 三类酶学动作

| 活性 | 方向 | 当前作用 |
|---|---|---|
| 聚合 | 5′→3′ | 延长新链 |
| 外切校对 | 3′→5′ | 从新链末端切除错配碱基 |
| 外切切除 | 5′→3′ | 讲义主要归于 DNApol I 小片段，去除 RNA 引物 / 损伤片段 |

#### 原核三类聚合酶的主角色

- DNApol III：复制延长主酶，含滑动夹与校对核心；
- DNApol I：切除 RNA 引物并填补空隙；Klenow 大片段保留聚合功能；
- DNApol II：讲义将其作为应急复制 / 修复接口，低频细节进 MI-D。

<!-- approved-27-audit: B4A-G2-02 -->
Pol I/II/III均有聚合及3′→5′校对活性；Pol I另有5′→3′外切。Pol III 的最小结构识别为 α聚合、ε校对、β滑动夹。

高保真来自多道门：正确碱基选择、3′→5′校对、复制后修复，而不是密码子简并性。

**SOURCE_CONFLICT / 待核对**：P125 的“DNApol I 大小片段活性”转写存在词序矛盾。本文件只保留讲义整体反复支持的考试主链：DNApol I 去引物并填补，Klenow 保留聚合活性；精确片段酶活性仍需回原图确认。

**Routing**：CORE｜CONFUSABLE｜BOUNDARY｜MI-G/MI-D
<!-- kianos:kp id="dme-g02-kp05" -->

### KP05｜复制叉工具组：松超螺旋、解双链、护单链、做引物

> **讲义定位 →** 生化 Lecture PDF P126–128，印刷页 P106–108。  
> **主提示**：4任务｜Topo I/II差3｜DnaA/B/C/G｜SSB｜引发体不含谁

    复制起始可以按四类任务记：

```text
辨认起点：DnaA
松超螺旋：拓扑异构酶
打开氢键：DnaB解旋酶，DnaC协助
保护单链：SSB
合成RNA引物：DnaG
```

#### 拓扑异构酶 I vs II

| 维度 | I | II / 促旋酶 |
|---|---|---|
| 切几条链 | 一条 | 两条 |
| ATP | 不需 | 需 |
| 主作用 | 松弛拓扑压力 | 改变双链拓扑、讲义强调正→负超螺旋 |

引发体由复制起点、DnaB、DnaC、DnaG等构成；DnaA主要负责辨认起点，不列入讲义的引发体组合。

（易混：拓扑异构酶处理磷酸二酯键和超螺旋；解旋酶解开碱基间氢键；二者不是同一酶。）

**Routing**：CORE｜VISUAL_ONLY｜CONFUSABLE｜MI-G
<!-- kianos:kp id="dme-g02-kp06" -->

### KP06｜原核复制三阶段：起始—延长—终止

> **讲义定位 →** 生化 Lecture PDF P126–129，印刷页 P106–109。  
> **主提示**：起始5步｜延长前/后｜终止2酶｜最后缺口谁封

#### 起始

```text
DnaA辨认富AT起点
→ 拓扑异构酶松弛
→ DnaB/C解旋
→ SSB稳定单链
→ DnaG合成RNA引物
```

#### 延长

DNApol III 以 dNTP 为原料，在两条模板上同步推进：前导链连续，后随链形成冈崎片段。讲义用“回环复制”解释同一复制机器如何协调两条链。

#### 终止与成熟

```text
DNApol I 去除RNA引物并填补
→ 剩余单链缺口
→ DNA连接酶形成磷酸二酯键
→ 完整子代DNA
```

DNA 连接酶只能封闭双链 DNA 中的单链缺口，不能把两条完全游离的单链随意接成双链。

**Routing**：CORE｜CONNECTION｜MI-G
<!-- kianos:kp id="dme-g02-kp07" -->

### KP07｜原核 vs 真核复制：同一逻辑，组织规模不同

> **讲义定位 →** 生化 Lecture PDF P130–131，印刷页 P110。  
> **主提示**：起点数｜速度｜引物/冈崎长短｜Pol｜PCNA｜核小体｜mtDNA

    | 维度 | 原核 | 真核 |
|---|---|---|
| 起点 / 复制子 | 单起点、单复制子为典型 | 多起点、多复制子 |
| 复制速度 | 较快 | 较慢、分段并行 |
| RNA引物 / 冈崎片段 | 相对较长 | 相对较短 |
| 持续合成辅助 | DNApol III β滑动夹 | PCNA辅助 DNApol δ/ε |
| 线性末端 | 无端粒问题 | 有端粒与端粒酶 |
| 复制后包装 | 无核小体装配 | 与核小体装配同步 |
| 线粒体DNA | 无 | DNApol γ，D环复制接口 |

<!-- approved-27-audit: B4A-G2-04 -->
mtDNA 可用 D 环复制、DNApol γ 和两个复制起点不在同一位点作稳定识别；内外环的精确时序继续不写。

**SOURCE_UNCERTAINTY**：P130–131 中 DNApol δ / ε 分别对应前导还是后随链的单元格存在 `[UNCERTAIN_SOURCE_READING]`，且页面重复。本文不强行冻结该精确配对；只保留 δ/ε 为真核核 DNA 主要复制 / 修复聚合酶并需 PCNA 支持的稳定口径。

**Routing**：CORE｜CONFUSABLE｜BOUNDARY｜MI-G/MI-D
<!-- kianos:kp id="dme-g02-kp08" -->

## L2｜端粒与逆转录：两种 RNA模板→DNA 解法｜KP08–KP09

**Core relation**
- linear chromosome end problem → telomerase carries its own RNA template → extends maternal 3′ end → conventional primer/DNA synthesis fills complement；
- RNA genome / RNA template → reverse transcriptase → DNA → dsDNA。

**Boundary**
- 端粒酶与病毒逆转录酶都可做 RNA→DNA，但解决的问题不同。
- 端粒 = DNA + associated proteins，不只是重复序列本身。

**Precision**
- current 27 P123 的端粒酶组成与爬行机制；
- reverse-transcriptase template / primer / fidelity exactness 以 Source 为准。

**Connection**
- G5 重组 / cDNA 工具调用逆转录能力。

### KP08｜端粒与端粒酶：线性DNA末端怎样避免越复制越丢

> **讲义定位 →** 生化 Lecture PDF P131–132，印刷页 P110–111。  
> **主提示**：端粒2作用｜位置/序列｜端粒酶3组分｜爬行5步｜肿瘤接口

    线性 DNA 去除末端 RNA 引物后，常规 DNA 聚合酶无法从零补回最末端，因此真核染色体需要端粒系统。

#### 端粒

- 维持染色体末端稳定；
- 保证复制完整性；
- 位于线性 DNA 末端，讲义强调 3′端富含 GT、可形成 G 四联体接口。

#### 端粒酶

```text
RNA模板
+ 逆转录酶
+ 协同蛋白
```

工作链：识别母链 3′端 GT → 自带 RNA 对齐 → 逆转录延长母链 → 爬行重复延长 → 常规引物酶 / DNApol 补子链。

//串联：端粒酶活性、细胞衰老和癌细胞持续增殖是 G5 / 病理 U019 的接口；当前不扩成完整肿瘤机制。

**Routing**：CORE｜VISUAL_ONLY｜CONNECTION｜MI-G
<!-- kianos:kp id="dme-g02-kp09" -->

### KP09｜逆转录：RNA信息怎样变成双链DNA

> **讲义定位 →** 生化 Lecture PDF P133–134，印刷页 P112–113。  
> **主提示**：4阶段｜3活性｜引物谁｜缺1校对｜2类应用

    逆转录病毒的最小主链：

```text
RNA
→ RNA/DNA杂化双链
→ 单链DNA
→ 双链DNA
```

逆转录酶的三种活性：

1. RDDP：以 RNA 为模板合成 DNA；
2. RNase H：水解杂化双链中的 RNA；
3. DDDP：以 DNA 为模板合成第二条 DNA。

病毒使用自身 tRNA 作引物。讲义强调逆转录酶缺乏 3′→5′外切校对活性，因此逆转录病毒更易发生变异。

应用接口：补充中心法则的方向；从 mRNA 制备 cDNA；理解 RNA 病毒致病致癌和 G5 基因工程工具。

**Routing**：CORE｜CONNECTION｜MI-G
<!-- kianos:kp id="dme-g02-kp10" -->

## L3｜核酸工具、引物与复制—转录出口比较｜KP10–KP11

**Core relation**
- cut nucleic acid → nuclease；
- seal DNA nick → ligase；
- copy DNA → primer required；
- transcribe DNA→RNA → no primer；
- 工具选择由 molecule + reaction + direction 决定。

**Boundary**
- nuclease / ligase 是化学任务分类，不等于某一完整实验技术。
- 复制与转录共享模板读取，但原料、酶、引物需求和产物不同。

**Precision**
- endonuclease / exonuclease、ligase、primer comparison 按 current S17。

**Connection**
- G3 直接接转录；G5 工具层再使用 cut / ligate 语言。

### KP10｜核酸酶、连接酶与“谁需要引物”的总比较

> **讲义定位 →** 生化 Lecture PDF P133–134，印刷页 P112–113。  
> **主提示**：内/外切｜限制酶识别｜连接酶3场景｜引物4过程

#### 核酸酶

- DNase / RNase：按底物分类；
- 外切酶：从链末端水解；
- 内切酶：从链内部切割；
- 限制性核酸内切酶：识别特异回文 / 反向重复序列并切双链 DNA，是 G5 重组 DNA 的“剪刀”。

#### DNA连接酶的三类场景

1. 复制中连接冈崎片段；
2. DNA 损伤修复中封闭缺口；
3. 基因重组中连接目的基因与载体。

<!-- approved-27-audit: B4A-G2-05 -->
磷酸二酯键的生成/水解对照：DNA连接酶生成缺口处的3′,5′磷酸二酯键；核酸内切酶/外切酶水解该键，差异在切割位置。

#### 引物总表

| 过程 | 是否需引物 | 引物 |
|---|---|---|
| DNA复制 | 需 | RNA，引物酶生成 |
| 逆转录病毒 | 需 | 病毒 tRNA |
| PCR | 需 | 两条特异 DNA 引物，G5详学 |
| 转录 | 不需 | — |

**Routing**：CORE｜CONFUSABLE｜CONNECTION｜MI-G
<!-- kianos:kp id="dme-g02-kp11" -->

### KP11｜DNA复制 vs 转录：进入G3前的出口比较

> **讲义定位 →** 生化 Lecture PDF P138，印刷页 P116。  
> **主提示**：模板范围｜原料｜引物｜酶/校对｜配对｜产物｜共同方向

    | 维度 | DNA复制 | 转录 |
|---|---|---|
| 信息流 | DNA→DNA | DNA→RNA |
| 模板 | 两条 DNA 全长分别作模板 | 某基因的一条模板链局部 |
| 原料 | dNTP，含T | NTP，含U |
| 引物 | 需要 | 不需要 |
| 主酶 | DNA聚合酶等多酶系统，有校对 | RNA聚合酶，讲义口径无校对 |
| 配对 | A-T、G-C | A-U、T-A、G-C |
| 产物 | 两个双链DNA | mRNA、tRNA、rRNA等 |
| 新链方向 | 5′→3′ | 5′→3′ |

这张表只负责切换语言：G2 结束后，G3 将从“复制整个基因组”转向“选择某个基因表达”。

**Routing**：CORE｜CONFUSABLE｜MI-G


# 2｜Derived Learner Support

> 以下只消费 canonical Knowledge；Recall、Memory、Questions 与网站呈现都不得反向定义 G2。

## 2.1｜Memory Routing

## MI-G

- 半保留、双向、半不连续、高保真；
- 前导 / 后随链与引物；
- DNApol III、I，3′→5′校对；
- DnaA/B/C/G、SSB、拓扑异构酶的角色；
- 起始—延长—去引物—连接；
- 真核多复制子与 PCNA；
- 端粒酶三组分及爬行链；
- 逆转录三活性；
- 复制 vs 转录总表。

## MI-D

- 原核 / 真核引物和冈崎片段精确长度；
- DNApol α/β/γ/δ/ε 的全部分工；
- topo I/II 低频结构细节；
- 端粒重复次数、每次缩短量；
- 复制蛋白亚基与工具酶完整名单。

---

## 2.2｜Current 27 Source Visual / Exactness Gate

Current visual truth = BIO27-S17。复制叉、前导/后随、原/真核 polymerase、端粒与逆转录图若不能唯一线性化，保持 SOURCE_BOUND。

旧 26 P125/P130/P131 uncertain reading 不再作为 current debt。

## 2.3｜Embedded Questions Coverage

embedded_questions_total = 13
source_position_accounted = 13
unaccounted_source_questions = 0
question_to_kp_relations_inferred_here = 0

S17 共 13/13；新增 current 27：2025N22。
正式 Question→Knowledge relation 仍由 reviewed relation owner 决定。

## 2.4｜First-pass Lecture-attached Question Contact

讲义附题在 current 27 Source 原位置随课处理；不在 Block 末尾制造第二套题库。Source-position accounting 不等于 Question→KP semantic mapping。

## 2.5｜Block Exit

闭卷重建：

```text
半保留 / 双向 / 半不连续 / 高保真
→ 起点—解旋—引物—延长—去引物—连接
→ 原核 / 真核复制差异
→ 端粒酶补末端
→ 逆转录三活性
→ 复制 vs 转录切换
```

能回答：

1. 为什么 DNA 聚合酶不能从零开始？
2. 前导链与后随链为何都仍按 5′→3′合成？
3. 拓扑异构酶、解旋酶和 SSB 各处理什么？
4. 端粒酶如何利用自带 RNA 模板？
5. 逆转录酶为何与病毒高变异相连？
