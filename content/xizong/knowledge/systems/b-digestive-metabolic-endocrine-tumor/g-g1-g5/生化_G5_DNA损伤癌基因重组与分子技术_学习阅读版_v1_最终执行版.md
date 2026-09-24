---
type: block_guide
schema_version: 1
content_version: 1
source_cycle: 27考研
primary_source_pdf: 27生化跟课版合集【不带导图】.pdf
source_snapshot: content/xizong/source-snapshots/27/生物化学讲义_AI阅读版_27跟课_UnifiedSource_v1.md
explanatory_substrate: 生物化学讲义_AI阅读版(1).md / 26生化.pdf
system_id: digestive-metabolism-endocrine
block_id: dme-g05
title: DNA损伤、癌基因、重组与分子技术
order: G5
study_refs:
  - source_id: biochemistry-27-unified
    label: 27生化跟课｜2.1 原癌/抑癌、重组与分子技术
    source_pdf: 27生化跟课版合集【不带导图】.pdf
    source_pdf_page_start: 93
    source_pdf_page_end: 104
  - source_id: biochemistry-27-unified
    label: 27生化跟课｜2.8 DNA损伤
    source_pdf: 27生化跟课版合集【不带导图】.pdf
    source_pdf_page_start: 169
    source_pdf_page_end: 170
coverage_source:
  source_id: bio27-current-lecture-attached-questions
embedded_questions_total: 29
embedded_questions_accounted: 29
unmapped_embedded_questions: 0
kp_count: 13
prerequisites:
  - dme-g01
  - dme-g02
  - dme-g03
  - dme-g04
  - dme-m09
next_blocks:
  - pathology-u019-tumor-gate
  - dme-d11-organ-tumor-applications
visual_gates:
  - bio26-p101-p102-oncogene-suppressor-map
  - bio26-p103-p111-recombinant-dna-and-techniques
  - bio26-p181-p183-dna-damage-repair-map
visual_gate_status: SOURCE_AVAILABLE_EXTERNAL_PRIMARY_27_PDF
source_gap_status: SOURCE_BOUND_EXACT_LOW_FIDELITY_POLYMERASE_GLYPH_ONLY
molecular_tumor_gate_status: MOLECULAR_BRANCH_COMPLETE_ONLY
first_pass_question_probe: CURRENT_SOURCE_POSITION_ACCOUNTED_RELATION_OWNER_SEPARATE
---

# G5｜DNA损伤、癌基因、重组与分子技术
## 学习阅读版 v1｜最终执行版

> **中心问题**：正常生长控制怎样因原癌基因激活、抑癌基因失活和DNA修复失败而失控；又怎样用重组DNA、PCR、杂交和相互作用技术识别、复制或操作这些改变？
> **文件性质**：分子支路第五个 canonical Block，也是全局肿瘤 Gate 的**分子半层**。完整 O9 仍需病理 U019 的形态与生物学行为层；本批不是整个 System 最后一批，也不生成 System Integration。

---

# 0｜Current Source / Authority

- Current first-pass Source：BIO27-S15 / P093–P104（原癌/抑癌、重组与分子技术） + BIO27-S22 / P169–P170（DNA损伤）。
- Source map owner：content/xizong/knowledge/learner/biochemistry-27-source-map.json。
- 26 refined 只作为 explanation reconstruction substrate，不形成第二套 learner Source。
- Source order 与 canonical Knowledge order 分离：S15 先形成 b-g05-lg01（原癌油门、抑癌刹车与生长控制失效） 与 b-g05-lg03（重组DNA、PCR、印迹与相互作用技术）；S22 后形成 b-g05-lg02（突变类型与DNA修复系统） 并闭合 G5，但 canonical 内容仍按 b-g05-lg01（原癌油门、抑癌刹车与生长控制失效）→b-g05-lg02（突变类型与DNA修复系统）→b-g05-lg03（重组DNA、PCR、印迹与相互作用技术） 组织。

---

# 1｜总 Framework

## Mother Model｜生长控制失效 → 突变 / 修复决定基因组稳定 → 分子工具检测、复制和操作这些改变


## 1.1｜第一轮形成顺序

```text
按 global 27 Source lane 连续学习
→ BIO27-S15 / P093–P104｜PRIMARY_FORMATION → b-g05-lg01 / KP01–KP05；PRIMARY_FORMATION → b-g05-lg03 / KP06–KP11
→ BIO27-S17 / P115–P127｜SUPPORT → b-g05-lg02 / KP12–KP13
→ BIO27-S22 / P169–P170｜PRIMARY_FORMATION → b-g05-lg02 / KP12–KP13
→ 已形成的既有 Logic Group 释放对应 KP Recall
→ Logic Group closure
→ Block Source closure checkpoint 后做 Block Recall
```

Source teacher order、canonical KP/file order、learner order 三者允许不同：

```text
Source order = 什么时候遇到材料
canonical order = 稳定 Knowledge identity
learner order = Learning owner 决定怎样形成 / Recall / Closure
```

不得通过物理重排 KP 或新增层级让三者看起来一致。

## 1.2｜Logic Group / ownership boundary

- **b-g05-lg01｜原癌油门、抑癌刹车与生长控制失效**：用原癌基因激活四路、癌基因产物信号链与抑癌基因失活/p53停—修—死建立克隆失控的控制模型。 Closure：给出点突变、扩增、易位/强增强子或p53/RB失活，能判断油门变强还是刹车失灵及位于信号链哪一层。
- **b-g05-lg02｜突变类型与DNA修复系统**：先把点突变/插缺/移码等“异常怎样产生”接到直接、BER/NER、错配、双链断裂和SOS等“怎样修”，完成基因组稳定层。 Closure：给出损伤/突变类型或修复缺陷，能预测编码后果并选择相应修复类别；解释修复失败为何为肿瘤控制失效提供突变底物。
- **b-g05-lg03｜重组DNA、PCR、印迹与相互作用技术**：在知道异常来源后，再用取—切—接—导—筛、PCR、S/N/W和DNA/蛋白相互作用技术建立“怎样检测/复制/操作”的工具地图。 Closure：给出目标是扩增DNA、测RNA/蛋白、构建重组载体、检测DNA-蛋白或蛋白-蛋白相互作用，能选择正确技术并说明它回答什么问题。

这些 Logic Group 是正式局部学习层；下面的 Framework / Boundary / Precision / Connection 内容只服务它们，不再创建第二套 L1/L2/L3 hierarchy。

---

## KP01｜肿瘤分子三道门：生长信号、抑制与DNA修复

> **主提示：** 原癌基因｜抑癌基因｜DNA修复｜三道门各失控后果

### 快速核对

肿瘤分子层先抓三道门：

```text
油门：原癌基因被激活为癌基因
刹车：抑癌基因失活
底盘：DNA损伤累积且修复失败
→ 增殖、存活和基因组稳定失控
```


---

<!-- kianos:kp id="dme-g05-kp02" -->
## KP02｜原癌基因、癌基因与抑癌基因：正常细胞本来就有的两套调节器

> **讲义定位 →** 生化 Lecture PDF P101–102、P109，印刷页 P85–86。  
> **主提示**：原癌基因 vs 抑癌基因｜正常作用方向｜激活/失活后果｜正常细胞是否存在

    - **原癌基因**：正常细胞中高度保守，参与生长、增殖、分化等正向调节；异常激活后成为癌基因。
- **抑癌基因**：限制细胞周期、促进修复或凋亡等负向调节；功能丧失可推动肿瘤。

```text
原癌基因：正常油门
→ 过强 / 持续激活
→ 癌基因效应

抑癌基因：正常刹车
→ 失活
→ 细胞周期与损伤检查失守
```

（易混：肿瘤不是“癌基因凭空出现”；正常原癌基因被突变、扩增、易位或异常调控后才形成持续促生长效应。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="dme-g05-kp03" -->
## KP03｜原癌基因激活的四条路

> **讲义定位 →** 生化 Lecture PDF P101、P109，印刷页 P85。  
> **主提示**：突变｜扩增｜易位/融合｜获启动/增强｜各1例

### 1｜点突变

K-RAS 突变可使 GTP酶开关持续处于活化状态，持续驱动 MAPK 级联。

### 2｜基因扩增

基因拷贝数增加 → 表达量增加。讲义接口：HER2扩增与乳腺癌、MYC扩增与部分肿瘤。

### 3｜染色体易位 / 融合

```text
易位
→ 原癌基因换到强调控区，过度表达
或
→ 产生新的融合基因
```

讲义接口包括 c-MYC易位、BCR-ABL融合。

### 4｜获得启动子 / 增强子

逆转录病毒整合携带强启动子 / LTR，插入原癌基因附近，使其异常高表达。

（易混：这四条路有的改蛋白结构，有的主要改拷贝数或表达量。）

**Routing**：CORE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="dme-g05-kp04" -->
## KP04｜癌基因产物按信号链定位

> **讲义定位 →** 生化 Lecture PDF P101–102、P105–109。  
> **主提示**：5层产物｜配体/受体/胞内/TF/周期｜高频例子各2

    把大量基因名挂回一条信号链：

| 层级 | 讲义例子 / 类型 |
|---|---|
| 生长因子 | SIS 等 |
| 生长因子受体 | ERBB / EGFR、HER2、KIT、FMS、TRK |
| 胞内信号分子 | RAS、RAF、SRC、ABL |
| 转录因子 | MYC、FOS、JUN |
| 细胞周期蛋白 | Cyclin D1 等接口 |

生长因子多数以旁分泌、自分泌方式发挥局部作用；多数生长因子受体为膜受体型酪氨酸激酶或相关受体。

<!-- approved-27-audit: B4C-G5-01,B4C-G5-02 -->
原癌基因在不同组织中分布广泛，部分逆转录病毒可携带病毒癌基因接口。生长因子以正调节为主，也可负调节或双向调节；分泌后以旁分泌/自分泌为主。

//MI-D：完整基因—肿瘤—染色体配对进入记忆岛；第一轮先能按信号链定位产物类型。

**Routing**：CORE｜RECOGNITION｜MI-G/MI-D

---

<!-- kianos:kp id="dme-g05-kp05" -->
## KP05｜抑癌基因怎样失活：甲基化、杂合性丢失与突变

> **讲义定位 →** 生化 Lecture PDF P102、P108–109，印刷页 P86、P92。  
> **主提示**：失活3路｜p53 3输出｜RB/p16检查点｜修不好怎么办

### 三类失活入口

1. 启动子 CpG 岛甲基化 → 染色质压紧 → 表达受抑；
2. 杂合性丢失 / 基因片段丢失；
3. 基因突变使蛋白功能丧失。

### p53

讲义把 p53 称为“基因组卫士”，其产物为转录因子。DNA损伤后可通过：

- p21：细胞周期阻滞；
- GADD45：修复接口；
- BAX：促凋亡接口。

```text
先停
→ 能修则修
→ 修不好则凋亡
```

### RB / p16

两者均进入细胞周期抑制 / G1-S检查点记忆岛。当前 Study不展开完整 cyclin-CDK-RB网络，只保留“限制周期推进”的考试身份。

**Routing**：CORE｜CONNECTION｜MI-G/MI-D

---

<!-- kianos:kp id="dme-g05-kp06" -->
## KP06｜重组DNA的总流程：取—切—接—导—筛—表达

> **讲义定位 →** 生化 Lecture PDF P103–104、P110，印刷页 P87–88。  
> **主提示**：6步｜目的基因3来源｜工具酶4｜载体3条件｜筛选1例

    ```text
取得目的基因
→ 限制酶切目的基因与载体
→ DNA连接酶形成重组DNA
→ 导入受体细胞
→ 用标志筛选重组子
→ 扩增或表达
```

### 目的基因来源

- 从基因组 / cDNA文库筛选；
- PCR扩增；
- 以 mRNA 逆转录合成 cDNA；
- 化学合成接口。

### 关键工具

限制性核酸内切酶、DNA连接酶、逆转录酶、DNApol I / Klenow等。

### 载体

质粒、噬菌体、染色体等。载体需能携带目的序列、在宿主中维持 / 复制，并具有可筛选标志。

插入失活示例：外源 DNA 插入 tetR 后，重组菌可表现为 ampR保留、tetR丢失，用双抗平板筛选。

<!-- approved-27-audit: B4C-G5-11,B4C-G5-13 -->
克隆载体类型与三项基本条件维持原文，不指定“最基本”。筛选只新增三类骨架：载体标记、序列特异性、亲和；每类具体方法等完整27 Lecture。

**Routing**：CORE｜VISUAL_ONLY｜MI-G

---

<!-- kianos:kp id="dme-g05-kp07" -->
## KP07｜限制酶、黏性末端与载体防自连

> **讲义定位 →** 生化 Lecture PDF P103–104、P106–107、P110。  
> **主提示**：RE 3特征｜回文判法｜黏/平端｜同酶连接｜磷酸酶防什么

    限制性核酸内切酶主要来自细菌，具有三项身份：

1. 识别特异序列；
2. 常识别回文 / 反向重复结构；
3. 在双链 DNA 内部特定位点切割。

同一种限制酶切割目的基因和载体，可产生彼此匹配的黏性末端；DNA连接酶再封闭磷酸二酯键。平端也可连接，但缺少突出端互补带来的定位优势。

载体暴露末端可能自行闭合，可用碱性磷酸酶处理载体末端降低自连。

（易混：限制酶负责“切”，DNA连接酶负责“接”；PCR引物与模板退火不叫黏性末端连接。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="dme-g05-kp08" -->
## KP08｜转化、转染与感染：重组DNA怎样进入细胞

> **讲义定位 →** 生化 Lecture PDF P103、P106–107。  
> **主提示**：转化/转染/感染各对象｜病毒作载体归谁｜质粒身份

    讲义的考试区分：

| 动作 | 典型对象 / 方式 |
|---|---|
| 转化 | 外源 DNA 导入细菌、真菌等“菌” |
| 转染 | 以质粒等把外源 DNA 导入真核细胞，如动物细胞 |
| 感染 | 以病毒作载体导入 |

质粒为常见的环状双链 DNA 载体，用于携带目的 DNA 进入受体细胞；它不是为了促进宿主 DNA 复制，也不携带工具酶去剪接宿主 RNA。

（边界：不同技术领域对术语可有更细定义；本文件保留当前 Lecture 的考试口径。）

**Routing**：CORE｜CONFUSABLE｜BOUNDARY｜MI-G

---

<!-- kianos:kp id="dme-g05-kp09" -->
## KP09｜PCR：体外怎样指数扩增目标DNA

> **讲义定位 →** 生化 Lecture PDF P105–107、P111，印刷页 P89–91。  
> **主提示**：5组分｜变复延3温｜2引物｜循环特点｜4类用途

### 反应体系

```text
模板DNA
+ 正向/反向两条特异引物
+ 四种dNTP
+ 耐热Taq DNA聚合酶
+ 缓冲与离子条件
```

### 一个循环

```text
约94℃ 变性
→ 约55℃ 引物复性
→ 约72℃ 延伸
```

反复循环使目标片段指数增加。用途按讲义：获得目的片段、分析变异、结合测序、体外突变、RT-PCR检测RNA / 基因表达接口。

（易混：PCR扩增 DNA；若起始材料是 RNA，需先逆转录形成 cDNA。PCR 本身不是 Western / Northern / Southern 印迹。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="dme-g05-kp10" -->
## KP10｜Southern、Northern、Western与表达检测

> **讲义定位 →** 生化 Lecture PDF P105–107、P111。  
> **主提示**：S/N/W各对象｜RT-PCR｜基因诊断不能用谁｜表达量常用谁

    | 技术 | 主要检测对象 |
|---|---|
| Southern blotting | DNA |
| Northern blotting | RNA |
| Western blotting | 蛋白质 |
| RT-PCR / qPCR接口 | RNA先逆转录后检测，常用于表达或RNA病原 |

因此：

- 分析蛋白质表达量优先想到 Western；
- 检测基因表达可看 RNA 或蛋白层；
- 核酸分子杂交 / 基因诊断不能用仅检测蛋白的 Western 替代；
- Southern 不直接回答蛋白表达量。

//MI-D：各印迹具体操作步骤不在当前 Source展开。

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="dme-g05-kp11" -->
## KP11｜相互作用与序列分析技术：先问“研究哪两类分子”

> **讲义定位 →** 生化 Lecture PDF P105–107、P111。  
> **主提示**：蛋白-蛋白4法｜DNA-蛋白3法｜测序1法｜启动子分析组合

### 蛋白质—蛋白质

- 酵母双杂交；
- 免疫共沉淀；
- GST pull-down；
- FRET 接近 / 能量转移接口。

### DNA—蛋白质

- 电泳迁移率变动测定 EMSA；
- 染色质免疫沉淀 ChIP，适合体内相互作用；
- 酵母单杂交接口。

### 序列

DNA链末端合成终止法用于测序；PCR结合测序、DNA—蛋白质相互作用技术可用于启动子结构分析。

<!-- approved-27-audit: B4C-G5-19 -->
启动子结构分析还可使用生物信息学预测；本处不扩成完整方法学教程。

（易混：酵母“双”杂交看蛋白—蛋白；ChIP主要看体内DNA—蛋白；不要把蛋白质印迹当相互作用实验。）

**Routing**：CORE｜CONFUSABLE｜MI-G/MI-D

---

<!-- kianos:kp id="dme-g05-kp12" -->
## KP12｜突变类型：点突变、错义、无义、同义与移码

> **讲义定位 →** 生化 Lecture PDF P181、P183，印刷页 P154–155。  
> **主提示**：点突变3结局｜插/缺×3倍数｜移码｜重排｜镰贫例

### 点突变的三类翻译结果

<!-- approved-27-audit: B4C-G5-20 -->
DNA突变首先是核酸一级结构/碱基序列的改变。

- 同义：密码子改变但氨基酸不变，调用G1的密码子简并性；
- 错义：氨基酸改变；讲义用血红蛋白β链相关的镰状细胞贫血 Glu→Val作例；
- 无义：提前形成终止密码子。

### 插入 / 缺失

```text
非3倍数
→ 可读框整体移动
→ 后续密码子连续改变

3的倍数
→ 增加或减少若干氨基酸
→ 后续阅读框可不移位
```

<!-- approved-27-audit: B4C-G5-22,B4C-G5-23 -->
移码会连锁改变后续密码子，调用G1的密码子连续性；这里只链接原因轴，不重复遗传密码正文。

重排、易位可改变大片段或基因组合，是癌基因激活与结构变异的接口。

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="dme-g05-kp13" -->
## KP13｜DNA修复系统：直接修、切掉重补、纠错、双链断裂与SOS

> **讲义定位 →** 生化 Lecture PDF P181–183，印刷页 P154–155。  
> **主提示**：5大类｜光修/连接｜BER链｜NER识别｜双断裂｜SOS特点｜缺陷病

### 1｜直接修复

- 光裂合酶直接拆开紫外线造成的嘧啶二聚体；
- DNA连接酶可封闭双链 DNA 中的单链缺口。

### 2｜切除修复

<!-- approved-27-audit: B4C-G5-24 -->
按当前Study口径，切除/纠错层并列BER、NER与错配修复，且“切除修复最普遍”仅作为当前讲义框架语言，不外推为通用taxonomy。

**碱基切除修复 BER**：

```text
糖苷酶去异常碱基
→ AP位点
→ AP内切酶切开
→ DNApol填补
→ 连接酶封口
```

**核苷酸切除修复 NER**：识别 DNA 双螺旋空间扭曲，讲义联系 XP 蛋白和着色性干皮病。

<!-- approved-27-audit: B4C-G5-25 -->
NER识别对照：原核Uvr系统；真核XP蛋白。

### 3｜错配修复

识别复制后错配并切除、重补，是高保真的后续保障。

### 4｜双链断裂 / 重组修复接口

讲义把原核 RecA、真核 DNA-PK / XRCC4 列为双链断裂修复入口。

### 5｜SOS修复

面对广泛损伤的紧急、低特异、高错误率修复；属于“先救命、可带来突变”的原核接口。

<!-- approved-27-audit: B4C-G5-28,B4C-G5-29 -->
当前Study的SOS相关聚合酶为DNApol IV/V。

**27 生化跟课 Source update（PDF P170）**：原页把低保真复制做成“原核 vs 真核”对照，明确提示**真核也存在低保真 / 跨损伤聚合酶组**。当前 MD/OCR 对该手写组首字符存在 `ξ/ζ` 字形歧义，因此本轮只升级这一**机制边界**，不把首字符写成硬背的 exact recall；需要精确希腊字母时回原页视觉 Source。

MI-D缺陷配对：NER→着色性干皮病/毛发低硫营养不良/Cockayne；错配修复→遗传性非息肉病性结肠癌；重组修复→遗传性乳腺癌/Bloom。

**SOURCE_CONFLICT / 待核对**：P183 把“重组修复”与 DNA-PK/XRCC4 放在同一条双链断裂链中，未细分同源重组与非同源末端连接。本文按 Study 保留“均属双链断裂修复入口”，不擅自改写专业分类。

//MI-D：修复缺陷疾病完整配对——着色性干皮病、遗传性非息肉病性结肠癌、遗传性乳腺癌等——进入记忆岛。

**Routing**：CORE｜CONFUSABLE｜BOUNDARY｜MI-G/MI-D

---

# 2｜高密度比较 / Boundary / Connection Map

## 原癌油门、抑癌刹车与生长控制失效

**Core relation**
- normal proto-oncogene / growth signaling；
- activation by mutation / amplification / translocation / enhancer capture → oncogenic drive↑；
- tumor suppressor / checkpoint 通过 mutation / LOH / methylation 等失活 → brake↓；
- 两类变化共同推动 clonal growth-control failure。

**Boundary**
- 原癌基因是正常细胞已有基因；癌基因是异常激活状态。
- “油门增强”和“刹车失效”是不同故障类型。
- 分子异常不直接等于器官肿瘤 TNM / 治疗。

**Precision**
- 点突变、扩增、易位 / 融合、获得强调控元件四类激活；
- p53 / RB-p16 等 current Study 控制轴。

**Connection**
- G4 提供表达调控语言；病理 Tumor Gate 负责形态行为和器官肿瘤应用。

## 突变类型与DNA修复系统

**Core relation**
- damage / replication error → mutation class；
- direct repair / BER / NER / mismatch / recombination-DSB repair；
- widespread damage → SOS / translesion low-fidelity bypass；
- repair success preserves genome；repair failure feeds clonal evolution。

**Boundary**
- 点突变可错义 / 无义 / 同义；插入缺失是否移码取决于 3 的倍数。
- current 27 明确 DSB 的 exam route = recombination repair。
- SOS / 低保真是“容忍损伤继续复制”，不是高保真恢复原序列。

**Precision**
- current 27 P170：原核 SOS polymerase IV / V；真核低保真 / translesion polymerase group 只保留 group-level identity。
- 第一枚希腊字形 exact identity 仍保持 SOURCE_BOUND，不冻结 ξ / ζ 争议。

**Connection**
- G2 提供复制 / 校对；b-g05-lg01（原癌油门、抑癌刹车与生长控制失效） 把 repair failure 当作肿瘤演化的突变输入。

## 重组DNA、PCR、印迹与相互作用技术

**Core relation**
- define target → obtain DNA / cDNA → restriction cut → ligate into vector → deliver → select / express；
- PCR → amplify DNA；
- Southern / Northern / Western → DNA / RNA / protein；
- interaction assays → protein-protein or DNA-protein；
- sequence analysis → read identity。

**Boundary**
- 工具按“研究哪种分子、回答什么问题”选择，不按名字背诵。
- cloning workflow 与 PCR / blot / interaction assay 是不同实验任务层。

**Precision**
- restriction palindrome / sticky ends / vector anti-self-ligation；
- transformation / transfection / infection；
- PCR denature–anneal–extend 与关键试剂；
- S / N / W 的分子对象。

**Connection**
- G1 / G2 / G3 提供核酸、复制和表达语言；工具层只负责检测与操作。

> 这一节是 Block-owned Content compression，不是新的 Knowledge hierarchy。

---

# 3｜Memory Routing

## MI-G

- 原癌基因 vs 抑癌基因；
- 激活四路：突变、扩增、易位/融合、获强启动子/增强子；
- 癌基因产物五层定位；
- 抑癌失活三路与 p53 的停—修—死；
- 重组DNA六步；
- 限制酶、连接酶、质粒、转化 / 转染 / 感染；
- PCR五组分与三温循环；
- S/N/W印迹对象；
- 蛋白—蛋白 vs DNA—蛋白技术；
- 突变类型；
- BER、NER、错配、双链断裂、SOS修复。

## MI-D

- 全部原癌基因及肿瘤配对；
- 受体 / 激酶 / 转录因子完整名单；
- 质粒筛选标志和工具酶细节；
- PCR衍生技术完整列表；
- 相互作用与测序技术的实验步骤；
- DNA修复缺陷疾病配对；
- 细胞周期蛋白与检查点全部分子。

---

---

# 4｜Current 27 Source Visual / Exactness Gate

Current visual truth = S15 + S22。肿瘤基因、重组/PCR、repair 分类图保持 current 27。

旧 DSB repair taxonomy conflict 已由 current 27 2023N25 明确为重组修复后退休。仅真核低保真 polymerase 第一枚希腊字形 exact identity 保持 SOURCE_BOUND。

---

# 5｜Embedded Questions Coverage

embedded_questions_total = 29
source_position_accounted = 29
unaccounted_source_questions = 0
question_to_kp_relations_inferred_here = 0

S15 24题 + S22 5题 = 29/29；新增 current 27：2025N26、2025N28、2025N147。
正式 Question→Knowledge relation 仍由 reviewed relation owner 决定。

---

# 6｜First-pass Lecture-attached Question Contact

讲义附题在 current 27 Source 原位置随课处理；不在 Block 末尾制造第二套题库。Source-position accounting 不等于 Question→KP semantic mapping。

---

# 7｜Block Exit

闭卷重建：

```text
正常生长信号链
→ 原癌基因激活4路
→ 抑癌基因失活3路
→ DNA损伤 / 突变 / 修复
→ 重组DNA取切接导筛
→ PCR / 印迹 / 相互作用技术
→ 病理U019与器官肿瘤接口
```

能回答：

1. 点突变、扩增、易位和增强子插入分别怎样激活原癌基因？
2. p53怎样实现“停—修—死”？
3. 重组DNA为什么要同时考虑目的基因、载体、工具酶和筛选标志？
4. Southern / Northern / Western 与PCR分别回答什么问题？
5. BER、NER、错配、双链断裂和SOS分别解决哪类损伤？

> **Gate 状态**：G1–G5 分子支路完成后，可进入病理 U019 与首批密集器官肿瘤；但在 U019 未完成前，不得宣告全局肿瘤 Gate 已完成。
