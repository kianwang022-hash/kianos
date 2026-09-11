---
title: M2｜碳氧化、TCA、氧化磷酸化与ATP：葡萄糖怎样变成CO₂、H₂O和能量
system: 消化—物质代谢—内分泌
system_id: digestive_metabolic_endocrine
block_id: M2
type: block_learning_reader
version: v1
status: FINAL_EXECUTION
primary_source: 生物化学讲义_AI阅读版.md
coverage_source: 生化_Embedded_Questions_Ledger.md
embedded_questions_primary: 27
visual_status: VISUAL_SOURCE_GAP_OPEN
---

# M2｜碳氧化、TCA、氧化磷酸化与 ATP
## 从胞浆拆糖，到线粒体把电子势能转成 ATP

> **中心问题**：葡萄糖怎样经糖酵解、丙酮酸脱氢、TCA 和呼吸链把碳骨架氧化为 CO₂，把电子交给 O₂ 形成 H₂O，并把释放的能量保存为 ATP？缺氧、呼吸链抑制和解偶联为什么产生不同结果？
>
> **Primary ownership**：本 Block 首次完整建立糖无氧 / 有氧氧化、PDH、TCA、胞浆 NADH 穿梭、呼吸链、化学渗透、P/O 和 ATP 计算。成熟红细胞的完整代谢与 PPP 归 M3；糖原与糖异生归 M4。

---

## 0｜正式范围与边界

### Study 主范围

- 糖无氧 / 有氧氧化：`#pdf-p002`–`#pdf-p007`｜印刷页 P1–6；
- 高能化合物与混合真题：`#pdf-p008`–`#pdf-p013` 中 M2 所有权部分；
- 氧化磷酸化：`#pdf-p014`–`#pdf-p022`｜印刷页 P11–18。

### Embedded Questions Primary

- 糖酵解 / PDH / TCA / 高能化合物：13 题；
- 氧化磷酸化 / 穿梭 / ATP：14 题；
- **合计 27 / 27 accounted**。

P012 的红细胞题 2 道、P013 的红细胞题 1 道唯一 Primary 归 M3，不在 M2 重复。

### 前序调用

- **Recall M1**：关键酶、酶原 / 变构 / 化学修饰、NAD / FAD / TPP / CoA；
- **Recall**：线粒体双层膜、氧供与 Hb 的最低接口；
- **Apply**：运动、缺氧、甲亢、CO / CN 中毒和肿瘤代谢，只用于验证当前能量模型。

### 当前后置

- 成熟 RBC、2,3-DPG、G6PD / GSH：M3；
- 糖原、糖异生、Cori 循环：M4；
- 脂肪酸 β 氧化、酮体：M7；
- 甲状腺疾病、中毒、肿瘤完整模型：后续对应 Block；
- 全部低频呼吸链抑制剂药名、线粒体遗传病谱：MI-D / Source Gap，不扩写。

### Source boundary / Conflict

```text
SOURCE_CONFLICT / 待核对
PDF P003 末段解释性重建将 3-PG→2-PG→PEP 的位置变化
与 1,3-BPG 产ATP、NADH 生成混写。
```

本文件不静默用模型常识“修订”该段，只采用同页明确的 Pathway Spine 与原讲义步骤：

```text
3-P甘油醛 → 1,3-BPG：氧化并生成NADH
1,3-BPG → 3-PG：底物水平磷酸化
3-PG → 2-PG → PEP：中间重排/脱水
PEP → 丙酮酸：底物水平磷酸化
```

`P015–P016` 有若干 `UNCERTAIN_SOURCE_READING`，`P022` 为 `VISUAL_ONLY`；原页未挂载到当前成品目录，均登记 `VISUAL_SOURCE_GAP`。

---

## 1｜第一轮固定流程

```text
Framework Orientation
→ M2a：P002–P007 糖酵解 / PDH / TCA
→ M2b：P014–P018 穿梭 / 呼吸链 / 化学渗透
→ M2c：P019–P022 ATP计算 / 空间原图 / 调节
→ Lecture Done
→ Framework Reconstruction：碳流 + 电子流 + 质子流 + ATP流
→ KP Active Recall
→ Embedded Questions Quick Check（按需、低压力）
→ TTSX Lecture-attached Questions
→ Block Complete
```

第一轮六个门槛：

```text
糖酵解在胞浆；PDH和TCA在线粒体
无氧分支回收NAD⁺，有氧分支把NADH送入呼吸链
乙酰CoA是三大营养物质共同枢纽
TCA产还原当量，呼吸链才把它们换成大量ATP
复合体II不泵质子
抑制 ≠ 解偶联：氧耗、ATP与产热方向不同
```

---

## 2｜总 Framework

<!-- approved-27-audit: B1-M2-01 -->
当前 Study 的有氧氧化跨段整合：共有7个关键酶，6个受ATP抑制；己糖激酶为例外。此句只作为跨段 Framework 提示，具体各酶仍在相应KP中学习。

```text
A｜碳流
葡萄糖(6C)
→ 糖酵解 → 2丙酮酸(3C)
├─ 缺氧 / 无线粒体：乳酸
└─ 有氧：PDH → 乙酰CoA(2C) → TCA → CO₂
        ↓
B｜还原当量流
糖酵解 / PDH / TCA脱氢
→ NADH、FADH₂
→ 把高能电子送入呼吸链
        ↓
C｜电子流
NADH → 复合体I
FADH₂ → 复合体II
→ CoQ → 复合体III → Cyt c → 复合体IV → O₂ → H₂O
        ↓
D｜质子流
复合体I、III、IV把H⁺泵至膜间隙
→ 建立电化学梯度
→ H⁺经F₀回流
→ F₁合成ATP
        ↓
E｜能量结算
底物水平磷酸化
+ 氧化磷酸化
→ 每葡萄糖按穿梭不同形成30 / 32 ATP的Study口径
```

### 一句话恢复

> **糖酵解拆碳，TCA剥电子，呼吸链泵质子，ATP合酶收势能。**

---

<!-- kianos:kp id="biochem-m2-kp01" -->
## KP01｜氧化、还原与三种葡萄糖去路

> **主提示：** 氧化2形式｜胞浆分叉2｜NADH去向｜终产物｜巴斯德

- 氧化可表现为加氧，也可表现为脱氢；物质代谢中脱氢氧化更常见。

```text
葡萄糖 → 丙酮酸
├─ 无氧：丙酮酸 + NADH → 乳酸 + NAD⁺
└─ 有氧：丙酮酸 → 乙酰CoA → TCA → CO₂
           NADH/FADH₂ → 呼吸链 → O₂还原为H₂O
```

无氧分支的直接意义是让 NADH 把氢交给丙酮酸，重新生成 NAD⁺，使糖酵解得以继续。

**巴斯德效应**：氧充足时，有氧氧化抑制无氧氧化。

---

<!-- kianos:kp id="biochem-m2-kp02" -->
## KP02｜糖酵解：耗能—裂解—放能三段式

> **主提示：** 糖酵解3段｜耗能点｜裂解点｜放能点｜NADH点｜净能量账

```text
葡萄糖
→ G-6-P
→ F-6-P
→ F-1,6-BP
→ 磷酸二羟丙酮 + 3-P甘油醛
→ 2×3-P甘油醛
→ 1,3-BPG
→ 3-PG
→ 2-PG
→ PEP
→ 丙酮酸
```

### 能量账

- 耗能：G→G-6-P、F-6-P→F-1,6-BP，各耗 1 ATP；
- 裂解：1 个 6C 变成 2 个 3C；
- 放能：
  - 1,3-BPG→3-PG，生成 ATP；
  - PEP→丙酮酸，生成 ATP；
  - 两个三碳分子各走一次，因此共生 4 ATP；
- 净得：**2 ATP**；
- 3-P甘油醛→1,3-BPG 时生成 NADH。

（易混：3-P甘油醛加无机磷酸，不直接消耗 ATP。）

---

<!-- kianos:kp id="biochem-m2-kp03" -->
## KP03｜糖酵解三个关键酶：入口、承诺步骤与出口

> **主提示：** 3关键酶｜各催化｜PFK1激活3/抑制2｜PK前馈/抑制2｜HK/GK对比

| 关键酶 | 反应 | 当前 Study 调节 |
|---|---|---|
| 己糖激酶 | G→G-6-P | G-6-P、长链脂酰CoA抑制；底物G激活 |
| PFK-1 | F-6-P→F-1,6-BP | AMP、ADP、F-2,6-BP激活；F-2,6-BP最强；ATP、柠檬酸抑制 |
| 丙酮酸激酶 | PEP→丙酮酸并产ATP | F-1,6-BP前馈激活；ATP、丙氨酸抑制 |

### 己糖激酶 vs 葡萄糖激酶

- 葡萄糖激酶是己糖激酶 IV 型同工酶，位于肝和胰岛 β 细胞；
- Km 高、亲和力低，高血糖时才明显处理葡萄糖；
- 当前 Study 强调低血糖时优先保证脑等使用高亲和力己糖激酶的组织。

（边界：完整胰岛激素控制后置 D7。）

---

<!-- kianos:kp id="biochem-m2-kp04" -->
## KP04｜乳酸分支：缺氧快速供能与 NAD⁺再生

> **主提示：** 反应方向｜氢来源｜2意义+RBC/肿瘤接口｜LDH代表谁｜巴斯德

```text
丙酮酸 + NADH + H⁺
↔ 乳酸 + NAD⁺
```

- 丙酮酸加氢是还原；
- 氢来自糖酵解中生成的 NADH；
- 再生 NAD⁺使糖酵解在缺氧时继续；
- 适合步骤少、速度快的快速供能；
- 成熟 RBC 因无线粒体，被动依赖该路线；
- 恶性肿瘤即使氧供正常仍偏向无氧氧化，当前 Study 称瓦伯格效应。

LDH 催化丙酮酸—乳酸可逆反应，其活性可作为无氧氧化活跃的接口指标；完整胸水 / 肿瘤诊断模型后置。

---

<!-- kianos:kp id="biochem-m2-kp05" -->
## KP05｜PDH：把胞浆丙酮酸送入线粒体碳氧化主线

> **主提示：** 部位｜反应4产物｜6辅因子｜不可逆意义｜B1缺乏链｜M1 Recall

```text
丙酮酸
→ 乙酰CoA + NADH + H⁺ + CO₂
```

- 部位：线粒体；
- 反应：氧化脱羧；
- 酶：丙酮酸脱氢酶复合体；
- 辅因子：FAD(VitB2)、Mg²⁺、硫辛酸、TPP(VitB1)、NAD(VitPP)、CoA(VitB5)。

PDH 反应不可逆，因此乙酰 CoA不能按原路返回丙酮酸；当前 Study 用此解释大部分脂肪酸不能净生成葡萄糖。

```text
VitB1缺乏
→ TPP不足
→ PDH等受阻
→ 丙酮酸堆积并转乳酸
→ 血管扩张 / 高排量心衰接口
```

完整脚气病与心衰模型不在此展开。

---

<!-- kianos:kp id="biochem-m2-kp06" -->
## KP06｜TCA 路线：乙酰CoA进入、草酰乙酸再生

> **主提示：** 8中间物顺序｜起点2底物｜回到谁｜部位｜共同枢纽

```text
草酰乙酸 + 乙酰CoA
→ 柠檬酸
→ 异柠檬酸
→ α-酮戊二酸
→ 琥珀酰CoA
→ 琥珀酸
→ 延胡索酸
→ 苹果酸
→ 草酰乙酸
```

TCA 在线粒体进行。乙酰 CoA 是糖、脂和氨基酸碳骨架的共同进入点；草酰乙酸在循环末端再生，使通路能继续接纳新的乙酰 CoA。

当前 Study 另强调：同位素示踪下，首轮释放的 CO₂碳原子可来自草酰乙酸。按 Study 口径保留，不在本文件外部扩写碳原子多轮追踪。

---

<!-- kianos:kp id="biochem-m2-kp07" -->
## KP07｜TCA 的“1—2—3—4”压缩身份

> **主提示：** 1部位/1底物磷酸化｜2脱羧｜3关键酶｜4脱氢｜每乙酰10ATP

### 1

- 一个主要部位：线粒体；
- 一次底物水平磷酸化：琥珀酰 CoA→琥珀酸，生成 GTP / ATP。

### 2

- 两次氧化脱羧：
  - 异柠檬酸→α-酮戊二酸；
  - α-酮戊二酸→琥珀酰 CoA。

### 3

- 柠檬酸合酶；
- 异柠檬酸脱氢酶；
- α-酮戊二酸脱氢酶复合体。

### 4

- 3 次生成 NADH；
- 1 次生成 FADH₂（琥珀酸→延胡索酸）。

按当前 P/O 口径：1 个乙酰 CoA 经 TCA 约产生 **10 ATP**。

---

<!-- kianos:kp id="biochem-m2-kp08" -->
## KP08｜底物水平磷酸化与高能化合物：不经过呼吸链也能直接产能

> **主提示：** 底物磷酸化3处｜高能键2类｜NTP/NDP/NMP｜磷酸肌酸｜6非典型｜排除3

三处高频底物水平磷酸化：

1. 1,3-BPG→3-PG，ADP→ATP；
2. PEP→丙酮酸，ADP→ATP；
3. 琥珀酰 CoA→琥珀酸，GDP→GTP / ADP→ATP。

高能化合物包括：

- 高能硫酯：各种酰 CoA；
- 高能磷酸：NTP / NDP、1,3-BPG、PEP、磷酸肌酸、氨基甲酰磷酸、PRPP、G-1-P 等当前 Study 例。

- NTP 有 2 个高能磷酸键；NDP 有 1 个；NMP 无；
- 2,3-DPG、F-1,6-BP、IP₃不是高能化合物；
- ATP 是中心能量货币但不是唯一：蛋白质合成用 GTP，糖原合成用 UTP，磷脂合成用 CTP。

磷酸肌酸在骨骼肌、心肌、脑作为快速 ATP 缓冲储备。

---

<!-- kianos:kp id="biochem-m2-kp09" -->
## KP09｜胞浆 NADH 为什么需要穿梭

> **主提示：** 胞浆NADH为何不能直接进去｜2条穿梭/组织｜受体形式｜ATP差异｜谁更高效

胞浆 NADH 不能直接穿过线粒体内膜，因此把“还原当量”交给可跨膜的中间物。

| 穿梭 | 主要组织 | 线粒体接收形式 | 当前能量口径 |
|---|---|---|---|
| α-磷酸甘油—磷酸二羟丙酮 | 脑、骨骼肌 | FADH₂ | 1.5 ATP / 胞浆NADH |
| 苹果酸—天冬氨酸 | 肝、心、肾 | NADH | 2.5 ATP / 胞浆NADH |

- α-磷酸甘油穿梭：胞浆 NADH 将磷酸二羟丙酮还原为 α-磷酸甘油；在线粒体侧脱氢生成 FADH₂；
- 苹果酸—天冬氨酸穿梭保留 NADH 等级，效率更高；草酰乙酸 / 天冬氨酸是识别中间物。

---

<!-- kianos:kp id="biochem-m2-kp10" -->
## KP10｜呼吸链两条入口与四个复合体

> **主提示：** NADH链｜FADH₂链｜I–IV酶/辅基｜Q/Cytc游离｜双/单电子｜终受体

| 复合体 | 当前 Study 名称 | 主要辅基 / 特点 |
|---|---|---|
| I | NADH—泛醌还原酶 | FMN、Fe-S；NADH入口；泵H⁺ |
| II | 琥珀酸—泛醌还原酶 | FAD、Fe-S；FADH₂入口；**不泵H⁺** |
| III | 泛醌—Cyt c还原酶 | 血红素、Fe-S；Q循环；泵H⁺ |
| IV | Cyt c氧化酶 | 血红素、CuA、CuB；把电子交给O₂；泵H⁺ |

```text
NADH → I ─┐
           ├→ CoQ → III → Cyt c → IV → O₂ → H₂O
FADH₂ → II┘
```

- CoQ 脂溶，可在线粒体内膜自由扩散；
- Cyt c 水溶，与内膜结合较疏松；
- 两者不固定属于某个复合体；
- CoQ 可携双电子，Cyt c 单电子，复合体 III 用 Q 循环衔接。

<!-- approved-27-audit: B1-M2-02 -->
当前 Study 的递氢体/递电子体可按入口识别：NADH 经复合体 I 入链；FADH₂经复合体 II 入链，琥珀酸脱氢反应是典型 FADH₂ 来源。两条链在 CoQ 汇合后共用 III、Cyt c 与 IV。

---

<!-- kianos:kp id="biochem-m2-kp11" -->
## KP11｜化学渗透：电子传递怎样变成质子势能

> **主提示：** 呼吸链泵哪些复合体｜H⁺方向｜质子势能｜回流通道｜F₀/F₁分工｜H⁺/ATP

```text
电子沿呼吸链传递并逐级放能
→ 复合体I、III、IV把H⁺从基质泵到膜间隙
→ 建立H⁺电化学梯度
→ H⁺经ATP合酶F₀通道顺梯度回流基质
→ 释放势能驱动F₁把ADP磷酸化为ATP
```

- 复合体 II 不具质子泵功能；
- ATP 合酶 / 复合体 V：F₀ 疏水、构成离子通道；F₁ 亲水、合成 ATP；
- 当前 Study 按 **4 H⁺回流 / 1 ATP** 组织 P/O 计算。

（易混：H⁺回流不是“消耗ATP把H泵回去”，而是顺梯度放能并驱动ATP生成。）

---

<!-- kianos:kp id="biochem-m2-kp12" -->
## KP12｜P/O 比值：同样一对电子为什么 NADH 比 FADH₂产能多

> **主提示：** P/O定义｜NADH vs FADH₂泵H⁺差异｜ATP差异｜差在哪个复合体｜特殊电子供体

P/O：生成 ATP 数与消耗 1/2 O₂的比值。

- NADH 从复合体 I 进入：I(4H)+III(4H)+IV(2H)=10H → **2.5 ATP**；
- FADH₂从复合体 II 进入：II(0H)+III(4H)+IV(2H)=6H → **1.5 ATP**；
- 差异来自 FADH₂绕过复合体 I；
- 当前 Study 另记抗坏血酸 P/O=1。

---

<!-- kianos:kp id="biochem-m2-kp13" -->
## KP13｜一分子葡萄糖的 30 / 32 ATP 怎样结算

> **主提示：** 葡萄糖总ATP账：前期耗能｜底物磷酸化｜胞浆NADH穿梭｜PDH｜TCA｜为何两种总数

### 糖酵解

- 消耗 2 ATP；
- 生成 4 ATP；
- 净底物水平 ATP：2；
- 生成 2 个胞浆 NADH：
  - α-磷酸甘油穿梭：2×1.5；
  - 苹果酸—天冬氨酸穿梭：2×2.5。

### 丙酮酸脱氢

- 2 个丙酮酸各产生 1 NADH：2×2.5。

### TCA

- 2 个乙酰 CoA：2×10 ATP。

```text
总计：30 ATP 或 32 ATP
差值仅来自胞浆NADH穿梭方式
```

（易混：TCA 打包的 10 ATP 已包含其 1 次底物水平磷酸化。）

---

<!-- kianos:kp id="biochem-m2-kp14" -->
## KP14｜氧化磷酸化调节：ADP 是最直接的“缺能量信号”

> **主提示：** 最强调节1｜转运2｜mtDNA｜甲状腺2链｜负反馈

- ADP 是最主要促进因素：ATP消耗→ADP↑→氧化磷酸化加速→ATP回升；
- ATP—ADP转位和线粒体内膜选择性转运会限制过程；
- mtDNA 突变可破坏呼吸链复合体，形成能量代谢障碍接口；
- 甲状腺激素经核受体促进基因表达：
  - 诱导 Na⁺-K⁺泵，ATP利用↑、ADP↑，间接促进氧化磷酸化；
  - 诱导解偶联蛋白，使更多能量转化为热。

完整甲状腺轴与线粒体遗传病后置。

---

<!-- kianos:kp id="biochem-m2-kp15" -->
## KP15｜抑制剂、ATP合酶抑制剂与解偶联剂：看电子、质子和ATP三条流

> **主提示：** 3故障层｜直接断点｜O₂/磷酸化｜ATP｜热｜代表药5｜CN/CO边界

| 故障 | 当前 Source 明确的直接断点 | O₂利用 / 磷酸化 | ATP | 热 |
|---|---|---|---|---|
| 呼吸链抑制 | I–IV某处电子传递受阻 | O₂利用下降或停止；氧化磷酸化受阻 | ↓ | 当前 Source 未单列 |
| ATP合酶抑制 | F₀/F₁；寡霉素结合F₀-c亚基 | ATP合成受抑；当前 Source 未单列其氧耗与产热方向 | ↓ | 当前 Source 未单列 |
| 解偶联 | H⁺绕过ATP合酶回流、梯度被破坏 | O₂利用继续，但磷酸化停止 | ↓ | ↑ |

当前 Source 代表：

- 复合体 I：鱼藤酮；
- 复合体 II / 琥珀酸脱氢酶：丙二酸竞争性抑制接口；
- 复合体 III：抗霉素等；
- 复合体 IV：CN⁻、叠氮化物、CO；
- ATP合酶：寡霉素结合 F₀ 的 c 亚基；DCCD；
- 解偶联：2,4-二硝基苯酚、解偶联蛋白、游离脂肪酸。

### 临床识别边界

- CN⁻抑制细胞利用 O₂，当前 Study 用“静脉血氧分压升高”解释；
- CO 也可抑制呼吸链，但当前 Study 强调其主要问题是与 Hb 结合、血氧含量下降。

<!-- approved-27-audit: B1-M2-03 -->
因此在本 Study 的比较中，CN⁻直接阻断复合体 IV 的电子交给氧；CO既可作用于该末端，又以与 Hb 结合造成血氧含量下降为主要临床识别轴。

这里只保留当前讲义口径，不扩写完整中毒诊疗。

---

## 3｜Framework Reconstruction｜四条流闭卷重建

```text
碳流：G → 丙酮酸 → 乳酸 / 乙酰CoA → TCA → CO₂
电子流：NADH / FADH₂ → I/II → Q → III → Cytc → IV → O₂
质子流：基质 → 膜间隙 → F₀回流 → F₁
ATP流：底物水平 + 氧化磷酸化 → 30/32
```

能在不看图的情况下说清这四条流，再回原图核对空间方向，才算 Framework 成立。

---

## 4｜Memory Routing

### MI-G

- 糖酵解三段、3个关键酶、净2 ATP；
- 乳酸分支回收 NAD⁺；
- PDH反应、部位和6类辅因子；
- TCA顺序与1—2—3—4；
- 三处底物水平磷酸化；
- 两种穿梭及1.5 / 2.5；
- 呼吸链 I–IV、Q、Cyt c；
- I/III/IV泵质子，II不泵；
- F₀ / F₁；P/O；30 / 32；
- 抑制 vs 解偶联的方向。

### MI-D

- 糖酵解全部中间物口诀；
- TCA每步酶、全部抑制剂；
- 高能化合物长名单；
- 呼吸链全部辅基顺序；
- mtDNA疾病和低频药名；
- 当前 Source 中低频毒物、P/O特殊值。

---

## 5｜原图门禁

必须回 `26生化.pdf`：

1. P2–P7 糖酵解 / PDH / TCA总图；
2. P14 两种穿梭；
3. P15 呼吸链复合体与电子顺序；
4. P16–P21 H⁺泵、F₀/F₁和解偶联空间图；
5. P19 30 / 32 ATP 计算图；
6. P22 全节思维导图。

```text
VISUAL_SOURCE_GAP_OPEN
AI Lecture有Pathway Reconstruction，原图未嵌入本文件。
```

---

## 6｜Embedded Questions Coverage Safety Net

```text
embedded_questions_total = 27
accounted = 27
mapped_primary = 27
unmapped_embedded_questions = 0
duplicate_primary = 0
```

- PDF P011｜5：BIO26-P011-Q01-2013N28A；BIO26-P011-Q02-2013N30A；BIO26-P011-Q03-2014N28A；BIO26-P011-Q04-2014N29A；BIO26-P011-Q05-2015N28A
- PDF P012｜5：BIO26-P012-Q02-2016N29A；BIO26-P012-Q04-2018N20A；BIO26-P012-Q05-2019N20A；BIO26-P012-Q06-2020N19A；BIO26-P012-Q07-2020N20A
- PDF P013｜3：BIO26-P013-Q01-2022N19A；BIO26-P013-Q02-2023N20A；BIO26-P013-Q04-2024N21A
- PDF P017｜6：BIO26-P017-Q01-2014N32A；BIO26-P017-Q02-2015N32A；BIO26-P017-Q03-2015N127-128B；BIO26-P017-Q04-2016N28A；BIO26-P017-Q05-2016N32A；BIO26-P017-Q06-2017N20A
- PDF P018｜7：BIO26-P018-Q01-2018N21A；BIO26-P018-Q02-2018N143X；BIO26-P018-Q03-2019N21A；BIO26-P018-Q04-2019N142X；BIO26-P018-Q05-2020N22A；BIO26-P018-Q06-2021N19A；BIO26-P018-Q07-2023N22A
- PDF P019｜1：BIO26-P019-Q01-2024N23A

P012 的 RBC 两题与 P013 的 RBC 一题已显式路由 M3，不构成 M2 silent unmapped。

学习者只按需扫题；Ledger 中 `NOT_EXPLICIT_IN_SOURCE` 的答案身份不由本文件伪造。

---

## 7｜Lecture Knowledge Routing Ledger

| Lecture 范围 | 路由 | Knowledge Role | 边界 |
|---|---|---|---|
| P002–P007 | KP01–KP07 | CORE + CONFUSABLE | M2 Primary |
| P008 高能化合物 | KP08 | CORE + MI-D | RBC部分→M3 |
| P009–P010 | Framework / Visual Gate | REDUNDANT_EXPOSITION + VISUAL_ONLY | 不另造KP |
| P011–P013 | Coverage + KP02–KP08 | RECOGNITION | 3道RBC题→M3 |
| P014 | KP09 / KP08 | CORE + VISUAL_ONLY | 穿梭原图 |
| P015–P016 | KP10–KP15 | CORE + CONFUSABLE | UNCERTAIN项显式保留 |
| P017–P019 | Coverage + KP09–KP15 | RECOGNITION + CONNECTION | 题目/能量计算 |
| P020–P021 | KP11 | VISUAL_ONLY + CORE | 空间方向 |
| P022 | Framework | VISUAL_ONLY | Visual Gap |

```text
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
source_conflict_open = P003-explanatory-paragraph
```

---

## 8｜First-pass Question Probe

```text
来源：
TTSX Lecture-attached Questions

选择方式：
LectureQuestionBinding 自动提供

绑定范围：
26生化 Lecture P002–P022 中属于 M2 的 source-position relation

状态：
待绑定
```

Embedded Questions accounting 与 LectureQuestionBinding 分开，当前不建立 Question → KP 语义图。

---

## 9｜Block Exit｜闭卷 20 问

1. 有氧与无氧真正在哪个节点分流？
2. 糖酵解为什么先耗能再放能？
3. 三个关键酶分别卡在哪个位置？
4. 乳酸分支为什么能维持糖酵解？
5. PDH反应与辅因子是什么？
6. TCA中间物顺序如何恢复？
7. TCA的1—2—3—4是什么？
8. 三处底物水平磷酸化在哪里？
9. 高能硫酯与高能磷酸怎样区分？
10. 两种胞浆NADH穿梭有何差别？
11. NADH与FADH₂分别从哪个复合体进入？
12. CoQ与Cyt c为什么不固定属于某复合体？
13. 复合体II为什么产能较少？
14. 化学渗透链怎样从电子到ATP？
15. F₀与F₁各做什么？
16. P/O的定义和2.5/1.5来源是什么？
17. 30与32 ATP差在哪里？
18. ADP怎样调节氧化磷酸化？
19. 呼吸链抑制、ATP合酶抑制与解偶联，当前Source各明确了哪些方向？
20. CN与CO在当前Study的主要识别边界是什么？

### Block Complete 定义

```text
Framework已建立
+ P002–P022对应连续内容已学
+ 关键原图已核对或Visual Gap显式保留
+ 碳流/电子流/质子流/ATP流可闭卷重建
+ KP Active Recall完成
+ Embedded Questions按需扫漏
+ TTSX Lecture-bound Question Probe完成或待绑定
```

允许：**Block Complete + Source Conflict / Visual Gap Open**。只有四条流仍混乱，或抑制与解偶联方向错误时，才先做最小修复再进入 M3。
