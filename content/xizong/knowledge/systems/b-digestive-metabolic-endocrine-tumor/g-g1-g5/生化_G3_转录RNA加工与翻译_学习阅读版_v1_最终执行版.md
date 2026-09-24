---
type: block_guide
schema_version: 1
content_version: 1
source_cycle: 27考研
primary_source_pdf: 27生化跟课版合集【不带导图】.pdf
source_snapshot: content/xizong/source-snapshots/27/生物化学讲义_AI阅读版_27跟课_UnifiedSource_v1.md
explanatory_substrate: 生物化学讲义_AI阅读版(1).md / 26生化.pdf
system_id: digestive-metabolism-endocrine
block_id: dme-g03
title: 转录、RNA加工与翻译
order: G3
study_refs:
  - source_id: biochemistry-27-unified
    label: 27生化跟课｜2.4 转录 + DNA复制VS转录
    source_pdf: 27生化跟课版合集【不带导图】.pdf
    source_pdf_page_start: 128
    source_pdf_page_end: 138
  - source_id: biochemistry-27-unified
    label: 27生化跟课｜2.5 翻译
    source_pdf: 27生化跟课版合集【不带导图】.pdf
    source_pdf_page_start: 139
    source_pdf_page_end: 150
coverage_source:
  source_id: bio27-current-lecture-attached-questions
embedded_questions_total: 25
embedded_questions_accounted: 25
unmapped_embedded_questions: 0
kp_count: 15
prerequisites:
  - dme-g01
  - dme-g02
  - dme-m01
  - dme-m08
next_blocks:
  - dme-g04
  - dme-g05
visual_gates:
  - bio26-p139-p149-transcription-and-rna-processing
  - bio26-p150-p155-translation-cycle
  - bio26-p156-p158-folding-and-targeting
  - bio26-p159-p162-translation-question-map
visual_gate_status: SOURCE_AVAILABLE_EXTERNAL_PRIMARY_27_PDF
source_gap_status: SOURCE_BOUND_CURRENT_27_TRANSLATION_SPATIAL_ONLY
first_pass_question_probe: CURRENT_SOURCE_POSITION_ACCOUNTED_RELATION_OWNER_SEPARATE
---

# G3｜转录、RNA加工与翻译
## 学习阅读版 v1｜最终执行版

> **中心问题**：一个被选中的 DNA 片段怎样先生成 RNA，再经加工成为成熟模板，并被核糖体翻译、折叠和送到正确位置？
> **文件性质**：分子支路第三个 canonical Block。它完整建立中心法则的执行链；“什么时候表达、表达多少”后置 G4。

---

# 0｜Current Source / Authority

- Current first-pass Source：BIO27-S18 / P128–P138（转录 + RNA加工） + BIO27-S19 / P139–P150（翻译）。
- Source map owner：content/xizong/knowledge/learner/biochemistry-27-source-map.json。
- 26 refined 只作为 explanation reconstruction substrate，不形成第二套 learner Source。
- S18 形成 b-g03-lg01（转录执行：模板、启动、延长与终止）–b-g03-lg02（RNA加工与质量控制）；S19 形成 b-g03-lg03（翻译体系、能量与起始—延长—终止）–b-g03-lg05（蛋白靶向与翻译干扰接口） 并闭合 G3。

---

# 1｜总 Framework

## Mother Model｜DNA选段 → 转录 → RNA加工/质控 → 翻译 → 蛋白成熟 → 靶向 / 干扰


## 1.1｜第一轮形成顺序

```text
按 global 27 Source lane 连续学习
→ BIO27-S18 / P128–P138｜PRIMARY_FORMATION → b-g03-lg01 / KP01–KP05；PRIMARY_FORMATION → b-g03-lg02 / KP06–KP08
→ BIO27-S19 / P139–P150｜PRIMARY_FORMATION → b-g03-lg03 / KP09–KP13；PRIMARY_FORMATION → b-g03-lg04 / KP14–KP14；PRIMARY_FORMATION → b-g03-lg05 / KP15–KP15
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

- **b-g03-lg01｜转录执行：模板、启动、延长与终止**：从模板/编码链方向接到原核RNApol/启动子、起始—延长—两类终止，并纳入真核Pol I/II/III产物比较。 Closure：给出启动子/σ、模板方向、终止结构或RNApol类型，能预测转录是否开始/停止及产物类别，并说明转录无需引物。
- **b-g03-lg02｜RNA加工与质量控制**：把mRNA帽/尾/剪接/编辑、tRNA/rRNA加工和异常mRNA监控组织成前体RNA到可用RNA的质量控制层。 Closure：给出GU-AG、加帽/加尾、编辑或NMD等场景，能判断改变的是成熟度、序列内容还是异常转录物清除。
- **b-g03-lg03｜翻译体系、能量与起始—延长—终止**：把mRNA、氨酰tRNA、A/P/E位、aaRS能量账与原/真核起始、延长/终止串成完整翻译执行链。 Closure：给出密码子、tRNA装载、起始因子、进位/成肽/转位或终止变化，能定位步骤、能量消耗和原/真核差异。
- **b-g03-lg04｜蛋白成熟、折叠与修饰**：把蛋白水解、化学修饰、二硫键、分子伴侣、亚基/辅基装配作为翻译后获得功能的独立闭环。 Closure：给出羟化/糖基化、二硫键或错误折叠场景，能判断改变的是翻译后成熟而非编码序列，并预测功能/定位后果。
- **b-g03-lg05｜蛋白靶向与翻译干扰接口**：在同一KP内保留两条边界轴：信号肽/SRP决定蛋白去向；药物/毒物按核糖体或因子层阻断翻译。 Closure：能根据N端信号肽/核定位序列判断蛋白靶向；也能根据原核/真核大小亚基或因子靶点定位翻译干扰，并明确两轴只是共享“翻译机器接口”。

这些 Logic Group 是正式局部学习层；下面的 Framework / Boundary / Precision / Connection 内容只服务它们，不再创建第二套 L1/L2/L3 hierarchy。

---

<!-- kianos:kp id="dme-g03-kp01" -->
## KP01｜转录的模板、编码链与反应体系

> **讲义定位 →** 生化 Lecture PDF P138–139，印刷页 P116–117。  
> **主提示**：模板/编码链3关系｜原料｜方向｜引物？｜校对？

    转录只选择某个基因的一条 DNA 链局部作为模板：

```text
RNApol 沿模板链 3′→5′移动
→ RNA 按 5′→3′合成
→ RNA序列除U替T外，与编码链同向同序
```

原料是 NTP（A/G/C/U），加入 RNA 链时以 NMP 形式保留并释放 PPi。RNA 聚合酶能直接连接最初两个 NTP，因此不需要引物；讲义口径为缺乏 3′→5′外切校对，错误率高于复制。

（易混：同一条 DNA 单链不是永远充当模板；不同基因可在两条链上交替选择。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="dme-g03-kp02" -->
## KP02｜原核RNA聚合酶与启动子：谁决定从哪里开始

> **讲义定位 →** 生化 Lecture PDF P139–140，印刷页 P117–118。  
> **主提示**：RNA聚合酶组成/分工｜启动子3位点｜谁识别起始｜起始后谁离开

    原核 RNA 聚合酶全酶为 `α₂ββ′ωσ`：

| 亚基 | 讲义主角色 |
|---|---|
| α | 转录特异性 / 组装接口 |
| β | 催化磷酸二酯键；利福平靶点 |
| β′ | 结合 DNA，并打开局部双链 |
| ω | 稳定 β′并协助募集 σ |
| σ | 识别启动子 / 转录起始入口 |

启动子位于 DNA 上、转录起始点上游：

```text
-35区 TTGACA
-10区 TATAAT / Pribnow box
+1 转录起始点
```

起始需要全酶；σ脱离后，核心酶 `α₂ββ′ω` 继续延长。

**Routing**：CORE｜MI-G

---

<!-- kianos:kp id="dme-g03-kp03" -->
## KP03｜原核转录起始：闭合—开放—首键—启动子逃逸

> **讲义定位 →** 生化 Lecture PDF P140，印刷页 P118。  
> **主提示**：起始4步｜闭/开差别｜首核苷酸磷酸｜流产式界线

    ```text
σ识别-35区
→ RNApol与DNA形成闭合复合物
→ -10区附近局部解链，形成开放复合物
→ β亚基催化第1、2个NTP形成首个磷酸二酯键
→ RNA链增长并逃离启动子
```

第一个 RNA 核苷酸保留三磷酸。讲义将短于约 10 nt 的反复失败释放称为流产式起始，用作启动子校对接口。

（易混：启动子是 DNA 序列；转录起始点是结构基因的 +1 位置；二者相邻但不是同一概念。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="dme-g03-kp04" -->
## KP04｜原核延长与终止：转录泡、羽毛状与两类终止

> **讲义定位 →** 生化 Lecture PDF P141，印刷页 P119。  
> **主提示**：延长3象｜ρ终止2步｜内在终止2结构｜原核为何边转边译

    延长时核心酶形成移动的转录泡，RNA 按 5′→3′延长，酶走过后 DNA 重新配对。原核没有核膜分隔，因此新 mRNA 尚未转录完就可结合多个核糖体，形成“羽毛状”边转录边翻译。

### 依赖 ρ 因子

ρ 结合 RNA 终止信号，并解开 RNA—DNA 杂化区，使 RNA 释放。

<!-- approved-27-audit: B4B-G3-01 -->
ρ依赖终止的最小识别接口：RNA上的 poly-C 富集区提示ρ结合/追赶；ρ以解旋酶样动作解除RNA—DNA杂化区。

### 不依赖 ρ 因子

```text
GC富集反向重复序列
→ RNA形成稳定发夹
+ poly-U尾
→ 复合物解离
```

（易混：DNA上的终止子、mRNA上的终止密码子和翻译释放因子分别属于三层对象。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="dme-g03-kp05" -->
## KP05｜真核三类RNA聚合酶：位置、产物与毒物敏感性

> **讲义定位 →** 生化 Lecture PDF P142，印刷页 P120。  
> **主提示**：I/II/III｜位置｜3组产物｜鹅膏蕈碱敏感顺序

    | 聚合酶 | 主要位置 | 主要产物 | 讲义毒物口径 |
|---|---|---|---|
| RNApol I | 核仁 | 45S 前体 rRNA → 18S、5.8S、28S | 不敏感 |
| RNApol II | 核基质 | hnRNA / mRNA、部分非编码 RNA | 最敏感 |
| RNApol III | 核内 | tRNA、5S rRNA、部分 snRNA | 中度敏感 |

这张表是后续加工的入口：不同聚合酶先生产不同前体，随后在不同位置完成加工。

（易混：5S rRNA 由 RNApol III 直接转录，不来自 RNApol I 的 45S 前体。）

**Routing**：CORE｜CONFUSABLE｜MI-G/MI-D

---

<!-- kianos:kp id="dme-g03-kp06" -->
## KP06｜真核mRNA加帽与加尾：先保护，再准备翻译

> **讲义定位 →** 生化 Lecture PDF P142–143，印刷页 P120–121。  
> **主提示**：帽3点｜尾信号｜尾3作用｜DNA/RNA信号差1字母

### 5′帽

- 7-甲基鸟苷结构；
- 通过特殊 5′—5′三磷酸键连接；
- 甲基由 SAM 提供；
- 保护 mRNA，并参与翻译起始。

### 3′ polyA 尾

DNA 编码链信号写作 AATAAA，RNA 上为 AAUAAA。切割后由加尾系统添加 polyA。

主要作用：

1. 增加 mRNA 稳定性；
2. 参与核质转运和翻译起始；
3. 与尾结合蛋白共同抵抗降解。

<!-- approved-27-audit: B4B-G3-02 -->
加帽由加帽酶及甲基转移酶完成；加尾在切割后发生。两者均属转录后加工。

（易混：帽和尾是转录后加工产物；TATA盒、AAUAAA分别是转录起始调控和加尾信号，不是同一层。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="dme-g03-kp07" -->
## KP07｜剪接、选择性剪接与RNA编辑：一个前体怎样形成不同成品

> **讲义定位 →** 生化 Lecture PDF P143–144、P147–148，印刷页 P121–122、P125–126。  
> **主提示**：剪接体｜剪接边界信号｜2次反应/套索｜选择性剪接 vs RNA编辑

### 剪接

```text
hnRNA含外显子对应序列 + 内含子对应序列
→ snRNA + 蛋白质形成snRNP / 剪接体
→ 识别5′GU与3′AG
→ 内含子套索化，经两次转酯反应去除
→ 外显子对应序列连接
```

选择性剪接通过选择不同外显子组合，提高同一基因的蛋白质多样性。

<!-- approved-27-audit: B4B-G3-03 -->
剪接错误可连接地中海贫血的最小疾病接口；完整遗传病模型不在本KP扩写。

### RNA编辑

编辑直接改变 RNA 编码序列，使蛋白质氨基酸序列不再与原 hnRNA 编码序列完全对应。讲义以 apoB100 / apoB48 为接口；这里保留机制，不扩写治疗应用。

（易混：剪接主要做“删内含子、拼外显子”；编辑改变保留下来的编码信息。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="dme-g03-kp08" -->
## KP08｜tRNA、rRNA加工与mRNA质量监控

> **讲义定位 →** 生化 Lecture PDF P145–146，印刷页 P123–124。  
> **主提示**：tRNA 4步｜45S→3个｜自剪2型｜正常降解3路｜异常4监控

### 前体 tRNA 的四步

1. RNase P 等切除 5′多余核苷酸，3′端另行修整；
2. 3′端加 CCA；
3. 化学修饰形成稀有碱基；
4. 必要时剪接内含子。

### 前体 rRNA

45S rRNA 在核仁经 snoRNP 加工为 18S、5.8S、28S；5S rRNA 不在此链中。

### 自身剪接

组 I 型和组 II 型内含子可依靠 RNA 自身催化，不需蛋白质；切除产物分别偏线状 / 套索状识别。

### mRNA降解

正常转录物可经脱腺苷酸化—脱帽—外切酶或核酸内切酶途径降解；异常转录物由 NMD、NSD、NGD 等质量监控防止产生有害截短或停滞蛋白。

//MI-D：各核酸酶、降解通路全名和细节不阻断主线。

**Routing**：CORE｜RECOGNITION｜MI-G/MI-D

---

<!-- kianos:kp id="dme-g03-kp09" -->
## KP09｜翻译体系：20+1氨基酸、mRNA、tRNA与核糖体

> **讲义定位 →** 生化 Lecture PDF P150–152，印刷页 P127–129。  
> **主提示**：翻译原料/模板/适配器/场所｜特殊AA｜定位信号｜tRNA准确性｜A/P/E

    翻译把 mRNA 密码子转换为多肽，核心体系为：

```text
编码氨基酸
+ mRNA模板
+ 氨酰-tRNA
+ 核糖体A/P/E位
+ 蛋白因子
+ ATP/GTP
```

讲义口径为 20 种常规编码氨基酸 + 硒代半胱氨酸；特定情形 UGA 可编码硒代半胱氨酸，见于谷胱甘肽过氧化酶和甲状腺素脱碘酶接口。

原核 mRNA 的 S-D 序列位于起始 AUG 上游，与 16S rRNA 互补，帮助小亚基准确定位。

<!-- approved-27-audit: B4B-G3-06 -->
S-D序列的当前 Study 识别序列为 AGGAGG。

A/P/E 位：新氨酰-tRNA进 A 位，肽酰-tRNA在 P 位，空载 tRNA 经 E 位离开。多聚核糖体是一条 mRNA 上多个核糖体并行翻译，提高总产量，但不缩短单条肽链自己的合成时间。

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="dme-g03-kp10" -->
## KP10｜氨基酰-tRNA合成酶与翻译能量账

> **讲义定位 →** 生化 Lecture PDF P151、P154，印刷页 P128、P130。  
> **主提示**：aaRS做什么｜ATP耗到哪｜翻译各阶段耗能｜每个肽键最低能量账

    氨基酰-tRNA 合成酶负责：识别氨基酸、识别 tRNA、催化装载并校对错误酯键。

能量主账：

```text
氨基酸活化：ATP → AMP，消耗2个高能磷酸键
进位：1 GTP
成肽：讲义口径不直接耗能
转位：1 GTP
→ 每形成一个肽键至少4个高能磷酸键
```

（易混：ATP主要花在氨基酸活化；GTP贯穿起始、延长和终止。糖原合成用UTP、磷脂合成用CTP是讲义串联，不在本 Block展开。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="dme-g03-kp11" -->
## KP11｜原核翻译起始：小亚基怎样找到AUG并把起始tRNA放进P位

> **讲义定位 →** 生化 Lecture PDF P152、P154，印刷页 P129–130。  
> **主提示**：起始因子3｜小亚基找AUG靠什么｜起始tRNA身份｜先落哪个位点｜复合物顺序

    ```text
30S小亚基分离
→ IF3防止过早合大亚基
→ IF1占A位
→ S-D与16S rRNA配对，把AUG定位到P位
→ IF2-GTP携fMet-tRNA进入P位
→ 因子释放，50S结合
→ 70S起始复合物
```

原核起始氨基酸为甲酰甲硫氨酸 fMet；真核起始为 Met。起始 tRNA 直接进入 P 位，是与后续氨酰-tRNA进 A 位的重要区别。

<!-- approved-27-audit: B4B-G3-07 -->
EF-Ts是EF-Tu的调节亚基；当前Source明确IF2、EF-Tu、RF3为GTPase。EF-G仅保留“介导转位且过程需GTP”，不写为已定论GTPase。

**Routing**：CORE｜VISUAL_ONLY｜MI-G

---

<!-- kianos:kp id="dme-g03-kp12" -->
## KP12｜延长与终止：进位—成肽—转位—释放

> **讲义定位 →** 生化 Lecture PDF P152–154，印刷页 P129–130。  
> **主提示**：延长3步｜A/P/E位移｜肽链生长方向｜终止密码识别｜释放因子分工

### 延长循环

```text
进位：EF-Tu帮助氨酰-tRNA进入A位
→ 成肽：23S rRNA转肽酶把P位肽链转给A位氨基酸
→ 转位：EF-G推动核糖体移动一个密码子
→ 肽酰-tRNA A→P，空载tRNA P→E→释放
```

肽链从 N 端向 C 端延长。

### 终止

- RF1 识别 UAA、UAG；
- RF2 识别 UAA、UGA；
- RF1/2 诱导转肽酶转为酯酶，水解肽酰-tRNA酯键；
- RF3 促终止因子脱离，核糖体复位。

**SOURCE_CONFLICT / 待核对**：Lecture 在 EF-G 是否“自身具有 GTP酶活性”的解释与题旁口径存在内部不一致。本文仅冻结：EF-Tu 为题目明确考到的 GTP酶；EF-G 介导转位且过程需要 GTP。精确酶活性描述须回原图 / 勘误确认。

**Routing**：CORE｜CONFUSABLE｜BOUNDARY｜MI-G

---

<!-- kianos:kp id="dme-g03-kp13" -->
## KP13｜原核 vs 真核翻译起始

> **讲义定位 →** 生化 Lecture PDF P155，印刷页 P131。  
> **主提示**：原核 vs 真核起始：核糖体｜起始AA｜因子｜mRNA识别｜结合顺序

    | 维度 | 原核 | 真核 |
|---|---|---|
| 核糖体 | 70S | 80S |
| 起始氨基酸 | fMet | Met |
| 因子 | IF1/2/3 | eIF种类更多 |
| mRNA定位 | S-D序列与16S rRNA | 5′帽、3′尾与eIF4复合体接口 |
| 先后 | 小亚基先结合mRNA，再接起始tRNA | 小亚基先与起始tRNA形成复合物，再寻找mRNA |
| 转录—翻译 | 可耦联 | 胞核转录加工后再到胞质翻译 |

这张表用于识别，不扩展完整真核起始扫描机制。

**Routing**：CORE｜CONFUSABLE｜MI-G/MI-D

---

<!-- kianos:kp id="dme-g03-kp14" -->
## KP14｜翻译后加工与折叠：新生肽链怎样成为有功能蛋白

> **讲义定位 →** 生化 Lecture PDF P156–157，印刷页 P132–133。  
> **主提示**：5类加工｜化学修饰7字｜二硫键｜伴侣3类｜亚基/辅基

    新生肽链离开核糖体后仍需完成：

1. **蛋白水解**：去起始残基、去信号肽、酶原激活、前体切成多个活性肽；
2. **化学修饰**：甲基化、乙酰化、羟化、糖基化、磷酸化等；
3. **二硫键形成**：连接半胱氨酸，稳定空间构象；
4. **折叠**：一级结构决定折叠方向，Hsp70、伴侣蛋白、二硫键异构酶与肽脯氨酰异构酶提供正确环境；
5. **亚基聚合与辅基连接**：形成最终多亚基或结合辅基的蛋白。

（易混：羟脯氨酸等是翻译后形成，不直接作为编码氨基酸掺入；硒代半胱氨酸可在特定情形直接编码。）

<!-- approved-27-audit: B4B-G3-08 -->
翻译后加工改变已合成多肽的修饰、折叠或切割；一级结构由翻译时密码子决定。羟脯氨酸/羟赖氨酸与二硫键相关半胱氨酸为典型识别残基。

**Routing**：CORE｜CONFUSABLE｜MI-G/MI-D

---

<!-- kianos:kp id="dme-g03-kp15" -->
## KP15｜蛋白靶向与翻译干扰：做出来以后送到哪里，药物在哪一层截断

> **讲义定位 →** 生化 Lecture PDF P157–161，印刷页 P133–137。  
> **主提示**：3类分拣信号｜SRP 5步｜干扰5层｜原/真核边界

### 三类分拣信号

| 蛋白 | 信号位置 |
|---|---|
| 分泌 / 跨膜蛋白 | N端信号肽 |
| 内质网驻留蛋白 | C端滞留信号 |
| 核蛋白 | 核定位序列，位置不固定 |

### SRP主链

```text
游离核糖体合成N端信号肽
→ scRNA+蛋白质组成SRP并识别
→ 对接内质网SRP受体
→ 肽链进入内质网继续合成
→ 高尔基体加工 / 分选
```

### 翻译干扰按层定位

- 起始复合物；
- 原核大亚基成肽；
- 原核小亚基读码、进位、转位；
- 真核大亚基或 eEF2；
- EF-Tu / EF-G 等蛋白因子；
- 干扰素通过 eIF2 与病毒 mRNA降解接口。

完整药物名单属于 MI-D；第一轮先会“作用于原核/真核、大小亚基、起始/成肽/进位/转位/因子”的定位轴。

**Routing**：CORE｜CONNECTION｜MI-G/MI-D

---

# 2｜高密度比较 / Boundary / Connection Map

## 转录执行：模板、启动、延长与终止

**Core relation**
- promoter selects start；
- RNA polymerase 读取 DNA template 3′→5′；
- RNA 5′→3′ 生长且不需 primer；
- elongation → termination → primary RNA transcript。

**Boundary**
- 编码链与模板链方向不能混。
- 原核 σ / 启动子与真核 Pol I/II/III 是不同层级。
- 转录执行与表达调控分开，G4 才拥有“为什么开 / 关”。

**Precision**
- 原核启动子 / σ 与两类终止；
- 真核 Pol I/II/III 产物与 current Source 药物敏感性。

**Connection**
- G2 提供复制对照；G4 调用 promoter / RNApol 作为调控执行器。

## RNA加工与质量控制

**Core relation**
- primary RNA → cap / poly(A)；
- splice introns / join exons；
- editing where applicable；
- tRNA / rRNA maturation；
- abnormal RNA surveillance / degradation；
- 最终形成 usable RNA pool。

**Boundary**
- 加工改变成熟度 / 稳定性；编辑可改变序列信息；二者不等同。
- alternative splicing 不改变 genomic DNA 本身。

**Precision**
- 5′ cap、3′ polyA、GU-AG、NMD 等 current Study 口径。

**Connection**
- G1 的真核断裂基因组织在这里被真正执行。

## 翻译体系、能量与起始—延长—终止

**Core relation**
- aa + tRNA --aaRS + ATP→ aminoacyl-tRNA；
- initiation 把起始 tRNA 放入 P site；
- A-site entry → peptide bond → translocation；
- stop codon + release factor → polypeptide。

**Boundary**
- aaRS 装载正确性与 ribosome 解码是两层。
- peptidyl transferase / translocation / release 不能混成一个“核糖体功能”。
- 原核 / 真核起始 machinery 分开比较。

**Precision**
- A/P/E 位、GTP/ATP 能量节点、起始/延长因子按 current Source。
- 若某 EF-G / GTPase 视觉标注无法唯一线性化，保持 SOURCE_BOUND，不制造冲突结论。

**Connection**
- G1 密码 / tRNA 前提在此兑现成蛋白。

## 蛋白成熟、折叠与修饰

**Core relation**
- nascent polypeptide → folding / chaperone assistance；
- cleavage / disulfide / chemical modifications；
- subunit / cofactor assembly；
- functional protein。

**Boundary**
- 翻译后加工改变成熟蛋白，不等于重新编码 DNA / RNA。

**Precision**
- current Source 只保留高频修饰与折叠接口。

**Connection**
- M1 的蛋白结构语言在这里作为“产物质量”被重新调用。

## 蛋白靶向与翻译干扰接口

**Core relation**
- sorting signal → SRP / ER or organelle / nuclear targeting → protein reaches correct compartment；
- translation inhibitor / toxin → locate ribosomal subunit / factor / step → predict synthesis failure。

**Boundary**
- 靶向与药物干扰只是共用翻译机器接口，不是一条机制。
- 完整抗菌 / 毒理药理后置。

**Precision**
- signal peptide / SRP、核定位等 current Source 主轴。

**Connection**
- 后续各器官只调用“蛋白去哪 / 哪一步被阻断”。

> 这一节是 Block-owned Content compression，不是新的 Knowledge hierarchy。

---

# 3｜Memory Routing

## MI-G

- 模板链 / 编码链 / RNA方向；
- 原核RNApol亚基与-35/-10启动子；
- 起始—延长—两类终止；
- RNApol I/II/III产物；
- 帽、尾、GU-AG剪接、选择性剪接、编辑；
- tRNA/rRNA加工和NMD入口；
- A/P/E位、20+1、SD序列；
- 起始—进位—成肽—转位—终止；
- ATP/GTP能量账；
- 翻译后加工、折叠与SRP靶向。

## MI-D

- 全部转录因子 / 翻译因子缩写；
- 各核酸酶与mRNA降解通路全名；
- 原核 / 真核翻译干扰药物完整名单；
- 所有化学修饰位点、信号序列和低频核酶；
- RNApol毒物敏感性细节、rRNA组合口诀。

---

---

# 4｜Current 27 Source Visual / Exactness Gate

Current visual truth = S18 + S19。转录泡、RNA加工、A/P/E位、翻译因子、SRP / 靶向图若不能唯一线性化，保持 SOURCE_BOUND。

旧 26 EF-G conflict 不继续作为 current conflict；current 27 若某因子 exact label 仍不清，只保持 visual exactness boundary。

---

# 5｜Embedded Questions Coverage

embedded_questions_total = 25
source_position_accounted = 25
unaccounted_source_questions = 0
question_to_kp_relations_inferred_here = 0

S18 9题 + S19 16题 = 25/25；新增 current 27：2025N24、2025N120-121。
正式 Question→Knowledge relation 仍由 reviewed relation owner 决定。

---

# 6｜First-pass Lecture-attached Question Contact

讲义附题在 current 27 Source 原位置随课处理；不在 Block 末尾制造第二套题库。Source-position accounting 不等于 Question→KP semantic mapping。

---

# 7｜Block Exit

闭卷重建：

```text
模板链选择
→ 原核转录起始/延长/终止
→ 真核三类RNApol
→ 帽尾剪编 + tRNA/rRNA加工
→ 翻译体系与A/P/E位
→ 起始/延长/终止与能量
→ 翻译后加工、折叠、靶向
```

能回答：

1. RNA 为何不需要引物，错误率却高于复制？
2. 原核转录为什么可形成羽毛状现象？
3. 剪接、选择性剪接和编辑分别改变什么？
4. 每形成一个肽键的最低能量账怎样算？
5. SRP 怎样把分泌蛋白送入内质网？
