---
type: block_guide
schema_version: 1
content_version: 1
system_id: digestive-metabolism-endocrine
block_id: dme-g05
title: DNA损伤、癌基因、重组与分子技术
order: G5
study_refs:
  - source_id: biochemistry-lecture-ai
    label: 生物化学讲义｜原癌基因、抑癌基因、基因重组与分子技术
    source_pdf: 26生化.pdf
    source_pdf_page_start: 101
    source_pdf_page_end: 111
    book_page_start: 85
    book_page_end: 92
  - source_id: biochemistry-lecture-ai
    label: 生物化学讲义｜DNA损伤与修复
    source_pdf: 26生化.pdf
    source_pdf_page_start: 181
    source_pdf_page_end: 183
    book_page_start: 154
    book_page_end: 155
coverage_source:
  source_id: bio26-embedded-questions
  question_pages: [105, 106, 107, 108, 181]
embedded_questions_total: 26
embedded_questions_accounted: 26
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
visual_gate_status: VISUAL_SOURCE_GAP
source_gap_status: VISUAL_SOURCE_GAP + SOURCE_CONFLICT_DSB_REPAIR_TAXONOMY
molecular_tumor_gate_status: MOLECULAR_BRANCH_COMPLETE_ONLY
first_pass_question_probe: PENDING_LECTUREQUESTION_BINDING
---

# G5｜DNA损伤、癌基因、重组与分子技术
## 学习阅读版 v1｜最终执行版

> **中心问题**：正常生长控制怎样因原癌基因激活、抑癌基因失活和DNA修复失败而失控；又怎样用重组DNA、PCR、杂交和相互作用技术识别、复制或操作这些改变？
>
> **文件性质**：分子支路第五个 canonical Block，也是全局肿瘤 Gate 的**分子半层**。完整 O9 仍需病理 U019 的形态与生物学行为层；本批不是整个 System 最后一批，也不生成 System Integration。
>
> **Primary Study**：`生物化学讲义_AI阅读版.md`，原 PDF P101–111（印刷页 P85–92）及 P181–183（印刷页 P154–155）。
>
> **Coverage Safety Net**：Embedded Questions **26 / 26 accounted**；`unmapped_embedded_questions = 0`。
>
> **第一轮流程**：Framework → Lecture及原图 → Framework Reconstruction → KP Active Recall → Embedded Questions optional / low-pressure → TTSX Lecture-attached Questions → Block Complete。

---

# 0｜统一入口：异常生长与分子工具是同一条问题链

```text
生长信号异常增强
+ 细胞周期 / 凋亡刹车失活
+ DNA损伤修复失败
→ 突变与克隆选择累积
→ 肿瘤分子身份

识别目标序列 / 蛋白
→ 取、切、接、导、筛、扩增、检测
→ 分子诊断与实验操作
```

先学“异常怎样产生”，再学“怎样检测和操作”；不要把技术名单与肿瘤机制分成两个孤立记忆岛。

---

# 1｜总 Framework

<!-- kianos:framework id="dme-g05-framework-main" -->

```text
A｜正常控制
生长因子 → 受体 → 胞内信号 → 转录因子 → 细胞周期
抑癌基因 / 修复系统提供刹车

B｜异常激活
突变 / 扩增 / 易位融合 / 获强启动子增强子
→ 原癌基因变癌基因

C｜刹车失活
甲基化 / 杂合性丢失 / 突变
→ p53、RB、p16等失效

D｜DNA损伤与突变
点突变 / 插缺 / 移码 / 重排
→ 直接、切除、错配、双链断裂、SOS修复

E｜重组DNA
取 → 切 → 接 → 导 → 筛 → 表达

F｜分子检测
PCR / 印迹 / 杂交 / 测序
+ DNA-蛋白 / 蛋白-蛋白相互作用

G｜向病理与器官肿瘤输出
分子异常
→ 病理U019的异型、浸润、转移、分级/分期
→ 器官肿瘤应用
```

## 1.1 Ownership 与边界

| 内容 | 动作 | 边界 |
|---|---|---|
| 核酸、复制、表达、调控 | **Recall** | G1–G4 |
| 癌基因 / 抑癌基因、DNA修复、分子技术 | **Primary Learn** | 本 Block |
| 病理肿瘤形态与行为 | **Interface / Defer** | 病理 U019，未在本批生成 |
| 器官肿瘤分型、TNM、治疗 | **Defer** | 后续器官 Block |
| 完整肿瘤药理和现代分子分型 | **Source Boundary** | 当前 Study 不支持完整扩写 |

---

<!-- kianos:kp id="dme-g05-kp01" -->

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
当前Study的SOS相关聚合酶为DNApol IV/V。MI-D缺陷配对：NER→着色性干皮病/毛发低硫营养不良/Cockayne；错配修复→遗传性非息肉病性结肠癌；重组修复→遗传性乳腺癌/Bloom。

**SOURCE_CONFLICT / 待核对**：P183 把“重组修复”与 DNA-PK/XRCC4 放在同一条双链断裂链中，未细分同源重组与非同源末端连接。本文按 Study 保留“均属双链断裂修复入口”，不擅自改写专业分类。

//MI-D：修复缺陷疾病完整配对——着色性干皮病、遗传性非息肉病性结肠癌、遗传性乳腺癌等——进入记忆岛。

**Routing**：CORE｜CONFUSABLE｜BOUNDARY｜MI-G/MI-D


# 15｜Memory Routing

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

# 16｜Study 原图门禁

**VISUAL_SOURCE_GAP**：

- P101–102：原癌 / 抑癌与信号链图；
- P103–104：重组DNA总流程、质粒插入失活；
- P109–111：癌基因分类、PCR、相互作用技术整合图；
- P181–183：DNA损伤修复思维导图和具体切除链。

P102、P109–111和P183含部分重构 / 未可靠识别信息；精确视觉、实验流程和修复分类必须回原页。

---

# 17｜Embedded Questions Coverage

| 题目组 | Accounted 状态 | 主要归属 |
|---|---|---|
| P105 Q01–Q06 | mapped_primary | KP02–KP05、KP09–KP11 |
| P106 Q01–Q07 | mapped_primary | KP06–KP11 |
| P107 Q01–Q07 | mapped_primary | KP03–KP11 |
| P108 Q01 | mapped_primary | KP05 |
| P181 Q01–Q05 | mapped_primary | KP12–KP13 |

```text
embedded_questions_total = 26
accounted = 26
mapped_primary = 26
unmapped_embedded_questions = 0
```

---

# 18｜First-pass Question Probe

**来源**：TTSX Lecture-attached Questions  
**选择方式**：LectureQuestionBinding 自动提供  
**状态**：**待绑定**

---

# 19｜Block Exit

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
