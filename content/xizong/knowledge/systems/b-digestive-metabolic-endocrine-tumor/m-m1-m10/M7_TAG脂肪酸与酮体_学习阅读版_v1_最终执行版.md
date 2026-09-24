---
title: M7｜三酰甘油、脂肪酸与酮体：储能与空腹燃料怎样切换
system: 消化—物质代谢—内分泌
system_id: digestive_metabolic_endocrine
block_id: M7
type: block_learning_reader
version: v1
status: FINAL_EXECUTION
primary_source: 生物化学讲义_AI阅读版_27跟课_UnifiedSource_v1.md
primary_source_pdf: 27生化跟课版合集【不带导图】.pdf
source_cycle: 27考研
explanatory_substrate: 生物化学讲义_AI阅读版(1).md / 26生化.pdf
coverage_source: current 27 lecture-attached questions + official Question Truth
embedded_questions_primary: 19
visual_status: SOURCE_AVAILABLE_EXTERNAL_PRIMARY_27_PDF
source_conflict_status: NONE_CURRENT_AFTER_27_REBASE
source_gap_status: OPEN
source_boundary_status: OPEN
---

# M7｜三酰甘油、脂肪酸与酮体
## 从餐后合成与储存，到空腹动员、β氧化和肝脏输出酮体

> **中心问题**：过剩糖和脂质怎样合成三酰甘油储存；空腹或糖利用障碍时，脂肪库怎样动员为甘油和游离脂肪酸；长链脂肪酸怎样进入线粒体完成β氧化；乙酰CoA什么时候进入TCA，什么时候在肝内形成酮体；合成与分解怎样避免同时高速运行？
>
> **Primary ownership**：本 Block 首次完整建立 TAG两条合成入口、甘油骨架、脂肪酸从头合成、脂肪动员、肉碱穿梭、β氧化、偶/奇数碳边界、酮体生成—利用—酸中毒和必需脂肪酸。D7与D8后续只按餐后—空腹—糖尿病状态调用，不重新学习通路。

---

## 0｜正式范围与边界

### Study 主范围

- **BIO27-S07｜PDF P036–P044** 是 M7 current 27 primary Source：TAG/脂肪酸合成、脂肪动员、肉碱穿梭、β氧化、酮体、必需脂肪酸、19 道讲义附题与脂代谢总图；
- M2/M3/M4/M6 只提供 ATP、NADPH、糖异生、柠檬酸/HMG-CoA 等调用接口；
- 26 精编只作 verified reconstruction substrate，不形成第二套 learner Source。

### Embedded Questions Primary

- BIO27-S07 / P040–P043：**19 题**；
- 相比旧 baseline 新增：
  - **2025N19｜酮体特点 / 可过血脑屏障**；
  - **2025N143｜花生四烯酸 → PG / TX / LT**；
- **合计 19 / 19 source-position accounted**。

### 前序调用

- **Recall D4**：小肠长链脂质以一酰甘油为骨架重合成TAG，装入CM；中短链脂肪酸直接入血；
- **Recall M2**：乙酰CoA、TCA、NADH/FADH₂、氧化磷酸化与ATP换算；
- **Recall M3**：PPP提供 NADPH；
- **Recall M4**：甘油可糖异生；大部分偶数碳脂肪酸不能净生糖；乙酰CoA激活丙酮酸羧化酶；
- **Recall M6**：柠檬酸—丙酮酸循环、HMG-CoA分叉、胆固醇合成关键酶。

### 当前后置

- 胰岛素 / 胰高血糖素全身餐后—空腹控制：D7；
- DKA / HHS临床识别、补液、胰岛素和电解质处理：D8；
- 脂肪肝、遗传性脂肪酸氧化障碍、肉碱缺陷与酮体酶缺陷完整疾病模型：当前Source不足；
- 前列腺素、白三烯、血栓素完整炎症 / 药理网络：病理炎症与后续系统只作Apply；
- 全部脂肪酸碳数、每种酶名、所有能量计算与低频药物：MI-D。

### Source boundary / Gap

Current 27 revision resolves one old conflict：

- **RETIRED M7-SC01**：旧 26 曾把“磷脂酸→DAG”标为 PLC；current 27 P037 已明确写 **磷脂酸磷酸酶**，不再保留该冲突。

Still open：

```text
SOURCE_GAP
P037 “1分子甘油完全分解生成ATP”数值缺失；不猜。
```

```text
SOURCE_BOUND
P039 含“只有脂肪酸β氧化来源乙酰CoA可成酮体”等宽泛解释；
canonical 只保留当前稳定机制：空腹/糖利用不足 → 脂解与β氧化↑ → 肝线粒体乙酰CoA积聚 → 产酮↑。
```

```text
SOURCE_BOUNDARY
P040 current Study 将亚油酸、亚麻酸、花生四烯酸共同列为必需脂肪酸；
保留考试 Source 口径，不用外部教材静默改写。
```

P036 对从头脂肪酸合成碳源的组织方式也按 current Source 保持，不扩写成超出 Source 的普遍定律。视觉 exactness 以 27 P036–P044 为准。

---

## 1｜第一轮固定流程

```text
Block Framework Orientation
→ 按 global 27 Source lane 连续学习
   BIO27-S07 / P036–P044｜PRIMARY_FORMATION → b-m07-lg01 / KP01–KP06；PRIMARY_FORMATION → b-m07-lg02 / KP07–KP12；PRIMARY_FORMATION → b-m07-lg03 / KP13–KP15；PRIMARY_FORMATION → b-m07-lg04 / KP16–KP16
→ 已形成的既有 Logic Group 释放对应 KP Recall
→ Logic Group closure
→ Block Source closure checkpoint 到达后做 Block Recall
→ Lecture-attached questions 只在原 Source 边界低压力处理
→ Block Complete
```

第一轮局部任务仍由既有 Logic Group 决定：

- **TAG/脂肪酸合成与储能**：把餐后脂肪酸/TAG合成、甘油骨架与NADPH/乙酰CoA来源组织成储能通路，并与分解方向互斥。
- **脂解、肉碱穿梭与β氧化**：从脂肪库动员FFA接到长链脂肪酸肉碱入线粒体和β氧化生成乙酰CoA/NADH/FADH₂。
- **酮体生成—利用—酸中毒**：把肝内乙酰CoA过剩→产酮、肝外利用和过量酮体导致酸中毒接成状态切换链。
- **必需脂肪酸与类花生酸接口**：把必需脂肪酸和类花生酸前体作为独立连接地图，不让其阻塞酮体主链。

Source contact 由 teacher order 决定；LG/KP 负责理解、Retrieval 与 Closure。二者不得互相冒充层级。

---

## 2｜总 Framework

```text
能量充足 / 餐后
→ 胞浆乙酰CoA + NADPH
→ ACC → malonyl-CoA
→ 脂肪酸合成 + TAG储存
→ malonyl-CoA 抑制 CPT-I，避免边合成边β氧化

空腹 / 糖利用不足
→ TAG脂解 → 甘油 + FFA
→ FFA经肉碱进入线粒体 → β氧化
→ NADH / FADH₂ + 乙酰CoA
→ TCA 或肝内产酮
→ 肝外组织利用酮体
```

M7 的核心是**状态开关与碳流方向**，不是分别背“脂肪合成、脂肪分解、β氧化、酮体”四章。

### 一句话恢复

> **TAG/FA合成储存 → 脂解 → 肉碱穿梭/β氧化 → 乙酰CoA → 酮体生成/利用/酸中毒 → 必需FA连接**

---

<!-- kianos:kp id="biochem-m7-kp01" -->
## KP01｜TAG的两条合成入口：小肠接收外源脂质，肝/脂肪细胞处理内源底物

> **主提示：** 一酰甘油途径｜部位｜需CM｜甘油二酯途径｜组织3｜共同终点

### 一酰甘油途径｜Recall D4

- 部位：小肠上皮胞浆；
- 骨架：吸收进入细胞的一酰甘油；
- 长链脂肪酸重合成 TAG；
- 与 apoB48 等组装成 CM，经淋巴输出。

### 甘油二酯途径

- 部位：肝、脂肪细胞等胞浆；
- 先形成3-磷酸甘油与脂酰CoA；
- 经磷脂酸、DAG形成 TAG。

二者不是同一条路径重复命名，而是在不同组织、面对不同脂质入口完成同一终点。

---

---

<!-- kianos:kp id="biochem-m7-kp02" -->
## KP02｜甘油骨架来源：为什么肝能回收甘油，脂肪和骨骼肌更依赖葡萄糖

> **主提示：** 2来源｜甘油激酶｜肝2路｜脂/肌1路｜无效循环边界

3-磷酸甘油可来自：

```text
葡萄糖 → DHAP → 3-磷酸甘油
甘油 --甘油激酶→ 3-磷酸甘油
```

组织差异：

- **肝**：甘油激酶活性高，既可用糖酵解中间物，也可回收脂肪动员产生的甘油；
- **脂肪细胞、骨骼肌**：甘油激酶活性很低甚至缺乏，合成TAG的甘油骨架主要来自糖酵解。

因此脂肪细胞动员出的甘油需要送往肝利用，也有助于避免同一细胞内“刚拆又原样合”的无效循环。

---

---

<!-- kianos:kp id="biochem-m7-kp03" -->
## KP03｜脂肪酸从头合成的原料与区室：乙酰CoA、NADPH和ATP怎样汇合

> **主提示：** 脂肪酸合成原料3｜乙酰CoA怎么到胞浆｜NADPH来源｜区室｜能量状态

当前 Study 的脂肪酸合成：

- 主要组织：肝、脂肪细胞等；
- 主要反应空间：胞浆；延长碳链在内质网或线粒体；
- 碳源：乙酰CoA，主要来自糖，部分来自氨基酸；按当前Study，不把脂肪酸自身分解作为这条从头合成链的常规原料；
- 还原力：NADPH，主要来自 PPP，也来自柠檬酸—丙酮酸循环；
- 能量：ATP等。

### Recall M6

```text
线粒体乙酰CoA
→ 柠檬酸出线粒体
→ 胞浆重新释放乙酰CoA
→ 进入脂肪酸 / 胆固醇合成
```

这条循环代表“能量和碳源充足，开始把底物转为长期储能”的状态。

---

---

<!-- kianos:kp id="biochem-m7-kp04" -->
## KP04｜ACC：把乙酰CoA变成丙二酰CoA，并决定合成开不开

> **主提示：** 反应｜辅因子｜关键酶｜激活4｜抑制2+药｜磷酸化｜双重开关

```text
乙酰CoA + CO₂
--乙酰CoA羧化酶 ACC / 生物素→ 丙二酰CoA
```

- ACC是当前 Study 的脂肪酸合成关键酶；
- 辅因子：生物素；
- 当前 Study列激活方向：柠檬酸、异柠檬酸、乙酰CoA、丙二酰CoA；
- 抑制方向：长链脂酰CoA、胰高血糖素引起的磷酸化；
- 贝特类抑制接口保留为MI-D，不展开完整药理。

最重要的系统意义：

```text
ACC开 → 丙二酰CoA↑ → 脂肪酸合成↑
同时丙二酰CoA抑制CPT-I → β氧化↓
```

即同一个信号把“合成打开、分解关掉”。

---

---

<!-- kianos:kp id="biochem-m7-kp05" -->
## KP05｜ACP vs CoA：合成脂肪酸与延长碳链使用不同载体语境

> **主提示：** 胞浆合成谁载｜维生素｜延长部位2｜谁载｜高能硫酯

- 胞浆从头合成脂肪酸时，脂酰基由 **ACP / 酰基载体蛋白**携带；当前 Study将其与 VitB5接口相连；
- 合成后延长碳链时，部位可在内质网或线粒体，载体转为 **CoA / HSCoA**语境；
- 脂肪酸必须活化为脂酰CoA，高能硫酯键为后续合成与氧化提供反应能力。

（易混：ACP不是血浆载脂蛋白 apo；一个是细胞内合成载体，一个是血浆脂蛋白接口。）

---

---

<!-- kianos:kp id="biochem-m7-kp06" -->
## KP06｜甘油二酯途径怎样把甘油骨架和3条脂肪酸拼成TAG

> **主提示：** G3P→磷脂酸→DAG→TAG｜3条脂酰CoA何时接入

```text
3-磷酸甘油
+ 2脂酰CoA
→ 磷脂酸
→ DAG
+ 第3分子脂酰CoA
→ TAG
```

- 两个脂酰CoA先在甘油1、2位形成酯键；
- 磷脂酸去磷酸后进入DAG；
- DAG再接第三条脂酰基形成TAG。



---

---

<!-- kianos:kp id="biochem-m7-kp07" -->
## KP07｜脂肪动员：ATGL—HSL—MAG脂肪酶连续拆掉三条脂肪酸

> **主提示：** 3步3酶｜关键酶｜产物4｜激活2｜抑制2｜磷酸化特殊

```text
TAG
--ATGL→ DAG + 1 FFA
--HSL→ MAG + 1 FFA
--MAG脂肪酶→ 甘油 + 1 FFA
```

结果：1分子TAG最终产生 **甘油 + 3分子FFA**。

当前 Study：

- 关键酶：HSL / 激素敏感性脂肪酶；
- 脂解激素：胰高血糖素、儿茶酚胺；
- 抗脂解：胰岛素、前列腺素；
- HSL虽名字不含“磷酸化”，但磷酸化后为活化状态。

（易混：HSL位于脂肪细胞储存库；LPL在血管侧处理CM/VLDL。）

---

---

<!-- kianos:kp id="biochem-m7-kp08" -->
## KP08｜动员后两种产物：甘油去肝，FFA进入氧化

> **主提示：** 脂解后甘油 vs FFA各去哪｜运输方式｜能否净生糖｜乙酰CoA信号意义

### 甘油

可在肝：

1. 再合成脂肪；
2. 进入糖异生；
3. 进入分解供能。

当前 Study明确：2分子甘油用于糖异生消耗2个ATP接口。

### 游离脂肪酸

- 与白蛋白结合在血中运输；
- 在组织活化为脂酰CoA；
- 进入β氧化供能。

### 生糖边界

- TAG中的**甘油**可生糖；
- 大多数偶数碳脂肪酸→乙酰CoA，通常不能净生糖；
- 乙酰CoA可激活丙酮酸羧化酶，促进糖异生状态，但不是净糖异生碳源。

`M7-SG01`：甘油完全氧化ATP数值Source未可靠恢复，不作为第一轮结论。

---

---

<!-- kianos:kp id="biochem-m7-kp09" -->
## KP09｜脂肪酸活化与肉碱穿梭：长链脂酰CoA怎样进入线粒体

> **主提示：** 活化酶｜耗能2键｜CPT-I｜肉碱｜转位酶｜CPT-II｜限速｜丙二酰抑制

```text
脂肪酸
--脂酰CoA合成酶，ATP→AMP→ 脂酰CoA
→ CPT-I把脂酰基转给肉碱
→ 肉碱-脂酰肉碱转位酶跨内膜
→ CPT-II在线粒体侧再生脂酰CoA
→ 进入β氧化
```

- 活化消耗相当于2个高能磷酸键；
- 当前 Study把 **CPT-I / 肉碱脂酰转移酶Ⅰ**定义为β氧化关键 / 限速酶；
- 丙二酰CoA抑制 CPT-I，阻止合成中的脂肪酸立刻被送去分解。

（易混：脂酰CoA不能自由穿过线粒体内膜；肉碱搬运的是脂酰基，不是把整个CoA直接带过去。）

---

---

<!-- kianos:kp id="biochem-m7-kp10" -->
## KP10｜β氧化四步循环：每轮少2个碳并产生三类高能产物

> **主提示：** 4步｜辅酶2｜少2C｜产物3｜部位｜终点

当前 Study先给出一个组织分工接口：正常进食时，肝因葡萄糖激酶亲和力较低而只氧化少量葡萄糖，较多依赖脂肪酸氧化供能；其它器官主要氧化葡萄糖；肝把多余葡萄糖转成糖原和脂肪储存。脂肪的热价最高，葡萄糖不足时可成为重要替代能源。完整餐后—空腹切换后置D7。

在线粒体内，每轮：

```text
脂酰CoA
→ 脱氢（FADH₂）
→ 加水
→ 再脱氢（NADH）
→ 硫解
→ 乙酰CoA + 少2C的脂酰CoA
```

反复进行，直到碳链被拆解。

每轮核心产物：

- 1 FADH₂；
- 1 NADH；
- 1乙酰CoA（末轮结算按完整碳数）；
- 少2C的脂酰CoA继续下一轮。

这些还原当量与乙酰CoA最终调用 M2 的呼吸链、TCA与氧化磷酸化产生大量ATP。

---

---

<!-- kianos:kp id="biochem-m7-kp11" -->
## KP11｜偶数碳脂肪酸能量账：循环次数、乙酰CoA数与活化成本

> **主提示：** 偶数碳脂肪酸：循环次数｜乙酰CoA数｜每轮还原当量｜活化成本｜总能量公式

按当前 Study，含偶数 N 个碳的脂肪酸：

```text
β氧化次数 = N/2 - 1
乙酰CoA数 = N/2
FADH₂数 = N/2 - 1
NADH数 = N/2 - 1
```

采用 M2 的 1.5 / 2.5 / 10 ATP口径：

```text
氧化阶段毛生成 = 7N - 4
扣除活化2个高能磷酸键
净值 = 7N - 6
```

当前 Study例：18C硬脂酸净 **120 ATP**。

（MI-D：能量计算是精确记忆岛；第一轮主门槛是会推公式来源，而不是机械背每条脂肪酸的数值。）

---

---

<!-- kianos:kp id="biochem-m7-kp12" -->
## KP12｜奇数碳脂肪酸：末端丙酰CoA提供少数生糖例外

> **主提示：** 末产2类｜丙酰+CO₂｜琥珀酰｜OAA/PEP｜生糖例外｜非完整TCA

奇数碳脂肪酸β氧化最终形成：

- 多个乙酰CoA；
- 1个丙酰CoA。

```text
丙酰CoA + CO₂
→ 琥珀酰CoA / 当前Study亦称丁二酰CoA
→ 琥珀酸 → 延胡索酸 → 苹果酸 → 草酰乙酸
→ PEP
→ 糖异生
```

因此脂肪“几乎不能生糖”有两个主要例外入口：

1. TAG中的甘油；
2. 少数奇数碳脂肪酸产生的丙酰CoA。

当前 Study提醒：从琥珀酰CoA向草酰乙酸走虽共享TCA中间步骤，但不等同于一轮完整TCA，因为完整循环必须从草酰乙酸+乙酰CoA开始。

---

---

<!-- kianos:kp id="biochem-m7-kp13" -->
## KP13｜酮体生成：肝把过量乙酰CoA包装成三种可输出燃料

> **主提示：** 部位｜起点3步｜3酮体｜肝/肾｜原料来源｜HMG酶辨析

```text
2乙酰CoA
--乙酰乙酰CoA硫解酶→ 乙酰乙酰CoA
--HMG-CoA合酶→ HMG-CoA
--HMG-CoA裂解酶→ 乙酰乙酸
↔ β-羟丁酸
→ 丙酮
```

三种酮体：

- 乙酰乙酸；
- β-羟丁酸；
- 丙酮。

部位与器官：

- 主要在肝线粒体生成；
- 当前 Study指出肾也可少量生成；
- β氧化是当前 Block中提供乙酰CoA的重要上游。

（易混：胆固醇通路用 HMG-CoA还原酶；酮体生成用 HMG-CoA合酶和裂解酶。名称相似但出口不同。）

---

---

<!-- kianos:kp id="biochem-m7-kp14" -->
## KP14｜酮体利用：肝输出，肝外在线粒体把它还原为乙酰CoA

> **主提示：** 肝产不用｜肝外用｜2利用酶｜脑条件｜FA过BBB边界｜丙酮

酮体可以理解为肝向外输出能量的形式：

```text
肝生成酮体
→ 血液运输
→ 肝外组织线粒体
→ 乙酰乙酸活化
→ 乙酰乙酰CoA
→ 2乙酰CoA
→ TCA / OXPHOS
```

当前 Study列出的利用酶接口：

- 琥珀酰CoA转硫酶；
- 乙酰乙酸硫激酶。

器官边界：

- 肝生成但不利用酮体；
- 肝外组织利用；
- 脑不能进行脂肪酸β氧化，且脂肪酸不能直接通过血脑屏障；长期饥饿时，脑可把酮体作为重要替代燃料；
- 丙酮可从呼气排出，形成当前 Study的烂苹果味识别接口。

---

---

<!-- kianos:kp id="biochem-m7-kp15" -->
## KP15｜为什么糖不足会酮体增多，过量又会进入酮症酸中毒

> **主提示：** 糖不足→酮体↑：触发｜OAA去向｜脂解/β氧化｜生成与利用失衡｜酸中毒接口

```text
饥饿 / 糖利用障碍 / 胰岛素绝对不足
→ 脂肪动员↑
→ FFA到肝、β氧化↑
→ 乙酰CoA↑
同时草酰乙酸偏向糖异生、TCA承载受限
→ 乙酰CoA转向酮体
→ 生成超过肝外利用与排出
→ 乙酰乙酸、β-羟丁酸积聚
→ 酮症酸中毒
```

酮体过多可来自两类失衡：生成增加，或当前 Study所列的酮体分解关键酶缺乏导致利用障碍。

当前 Study特别把 I型糖尿病与 DKA相连，并在Embedded Question中强调其主要脂代谢紊乱是脂肪酸β氧化加强、乙酰乙酸与β-羟丁酸增加方向。

（边界：补液、胰岛素、钾与酸碱处理属于D8完整疾病模型，不在此展开。）

当前 Study另指出：酮体合成未指定单一关键酶，而利用/分解阶段存在限速酶接口；本文件保持该口径，不用外部版本替换。

---

---

<!-- kianos:kp id="biochem-m7-kp16" -->
## KP16｜必需脂肪酸与活性衍生物：从膜脂肪酸接到炎症、血小板和气道

> **主提示：** 必需脂肪酸：种类/来源｜不饱和性｜AA衍生物3类｜炎症/血小板/气道

当前 Study先用键型作低频识别：以单键为主归饱和脂肪酸；出现双键 / 三键归不饱和脂肪酸。

按当前 Study口径，必需脂肪酸包括：

- 亚油酸；
- 亚麻酸；
- 花生四烯酸。

特点：

- 属于多不饱和脂肪酸；
- 主要从食物，尤其植物油脂获得；
- 当前 Study将其列为体内不能合成。

花生四烯酸衍生物接口：

- 前列腺素 PG；
- 白三烯 LT；
- 血栓素 TXA₂。

//串联：LT作为慢反应物质前体接口连接哮喘与炎症；PG连接HSL抑制和多系统炎症；TXA₂连接血小板。完整介质网络不在本 Block重复。

---

---

## 3｜Framework Reconstruction 与高密度比较轴

### 图1｜储存

```text
葡萄糖 → G3P
乙酰CoA → 丙二酰CoA → FA → 脂酰CoA
G3P + 3脂酰CoA → TAG
```

### 图2｜动员

```text
TAG --ATGL→ DAG --HSL→ MAG → 甘油 + 3FFA
```

### 图3｜氧化

```text
FA → 脂酰CoA → CPT-I/肉碱 → 线粒体
→ 脱氢—加水—脱氢—硫解
→ 乙酰CoA + NADH + FADH₂
```

### 图4｜酮体

```text
肝乙酰CoA → 乙酰乙酰CoA → HMG-CoA
→ 乙酰乙酸 / β-羟丁酸 / 丙酮
→ 肝外利用
```

最后补一个总开关：

```text
丙二酰CoA↑
→ 合成方向↑
→ CPT-I↓
→ β氧化↓
```

---

### TAG/脂肪酸合成与储能

**Core relation**
```text
过剩碳源
→ 柠檬酸把乙酰CoA碳带到胞浆
→ ACC：乙酰CoA → malonyl-CoA
→ ACP承载脂酰基 → 脂肪酸
→ 甘油骨架 + 3脂酰CoA → TAG储存
```

**Boundary**
- 小肠甘油一酯途径与肝/脂肪细胞甘油二酯途径是不同入口；
- 脂肪细胞/骨骼肌甘油激酶低，甘油骨架更依赖糖酵解；
- ACP 是胞浆脂肪酸合成载体，不是血浆 apo。

**Precision**
- ACC 是脂肪酸合成关键酶，需生物素；
- malonyl-CoA 是合成中间物，同时抑制 CPT-I；
- NADPH 主要调用 PPP / 柠檬酸—丙酮酸循环。

**Connection**
- M6 提供柠檬酸—乙酰CoA与 HMG-CoA 对照；
- D7 只调用餐后合成状态，不重建通路。

---

### 脂解、肉碱穿梭与β氧化

**Core relation**
```text
TAG --ATGL/HSL/MAG lipase→ 甘油 + 3 FFA
FFA + CoA → 脂酰CoA
→ CPT-I / 转位酶 / CPT-II
→ 线粒体脂酰CoA
→ β氧化：脱氢 → 加水 → 再脱氢 → 硫解
→ 每轮 FADH₂ + NADH + 乙酰CoA
```

**Boundary**
- HSL = 脂肪细胞内储存 TAG 动员；LPL = 血管侧 CM/VLDL 卸货；
- 肉碱搬运脂酰基，不是把 CoA 本体穿过内膜；
- 大多数偶数碳脂肪酸不能净生糖；奇数碳通过丙酰CoA→琥珀酰CoA形成例外接口。

**Precision**
- 长链脂肪酸活化消耗 2 个高能磷酸键；
- CPT-I 是 current Study 的长链脂肪酸入线粒体限速门；
- malonyl-CoA 抑制 CPT-I；
- β氧化每轮缩短 2C。

**Connection**
- 甘油 → M4 糖异生；
- NADH/FADH₂/乙酰CoA → M2；
- 奇数碳琥珀酰CoA → TCA / 糖异生接口。

---

### 酮体生成—利用—酸中毒

**Core relation**
```text
空腹 / 糖利用障碍
→ 脂解↑ → β氧化↑
→ 肝线粒体乙酰CoA↑
+ 草酰乙酸被糖异生牵引
→ 乙酰CoA更难进入TCA
→ HMG-CoA途径产酮
→ 乙酰乙酸 / β-羟丁酸 / 丙酮
→ 肝外组织转回乙酰CoA利用
```

**Boundary**
- 肝负责产酮，但缺乏利用酮体的关键转硫/硫激酶接口，不能把自己产的酮体作为主要燃料；
- 酮体可过血脑屏障，长时间饥饿时脑可大量利用；脂肪酸本身不能作为脑常规主要燃料；
- 酮体不能净转成葡萄糖。

**Precision**
- 三种酮体：乙酰乙酸、β-羟丁酸、丙酮；
- HMG-CoA合酶 / 裂解酶属于产酮链；
- 乙酰乙酸硫激酶 / 琥珀酰CoA转硫酶属于利用接口；
- current 27 新增 2025N19 强化“易过血脑屏障”Precision。

**Connection**
- 饥饿状态回 D7；
- DKA 完整临床诊疗归 D8，只调用“糖利用障碍→脂解/产酮↑”机制。

---

### 必需脂肪酸与类花生酸接口

**Core relation**
```text
current Source 必需脂肪酸集合
→ 亚油酸 / 亚麻酸 / 花生四烯酸
→ 花生四烯酸
→ 前列腺素 / 血栓素 / 白三烯
```

**Boundary**
- 这是高价值连接层，不应阻塞 TAG—β氧化—酮体主线；
- current Study 的“必需脂肪酸”名单按 Source 保留，不用外部教材静默覆盖；
- 完整炎症介质合成、COX/LOX药理归相应 owner。

**Precision**
- 2025N143 current Source 新增：花生四烯酸可转 PG / TX / LT；
- 泛素不属于该衍生链。

**Connection**
- 磷脂 PLA2 释放花生四烯酸接口来自 M6；
- 完整炎症/药理网络后置。

---

> 这些局部比较只承担 Framework / Boundary / Precision / Connection 压缩；正式局部学习单元仍是 Learning owner 中的 Logic Group。

---

## 4｜Memory Routing

### MI-G

- TAG两条合成入口；
- 肝 vs 脂肪/肌的甘油激酶差异；
- 乙酰CoA、NADPH、ATP与柠檬酸转运；
- ACC / 生物素 / 丙二酰CoA；
- ACP vs CoA；
- ATGL—HSL—MAG脂肪酶；
- HSL激活 / 抑制方向；
- 脂酰CoA活化与肉碱穿梭；
- CPT-I为关键 / 限速酶；
- β氧化四步；
- 偶数碳不能净生糖、奇数碳丙酰CoA例外；
- 三种酮体；
- 肝产酮、肝外用酮；
- 糖不足—脂解—β氧化—酮体—酸中毒链；
- 当前 Study三类必需脂肪酸与PG/LT/TXA₂接口。

### MI-D

- ACC全部激活 / 抑制剂；
- ACP与所有脂肪酸合成酶步骤；
- TAG合成每一步酶名；
- β氧化全部中间物与酶名；
- 偶数碳能量公式与各碳数计算；
- 奇数碳完整辅酶与中间反应；
- 酮体合成 / 分解全部酶与罕见缺陷；
- 贝特类等药物；
- eicosanoid完整炎症和药理网络。

---

---

## 5｜Current 27 Source Visual / Exactness Gate

BIO27-S07 / P036–P044 is current visual truth：

- P036–P037：FA/TAG合成、ACC、脂解；
- P038：肉碱穿梭、β氧化与能量；
- P039：酮体生成 / 利用；
- P040：必需脂肪酸 + 讲义题起点；
- P041–P043：其余讲义附题；
- P044：全脂代谢总图。

空间关系无法可靠线性化时保持 `SOURCE_BOUND`；旧 26 图不再是 learner Source。

---

---

## 6｜Embedded Questions Coverage Safety Net

```text
embedded_questions_total = 19
source_position_accounted = 19
unaccounted_source_questions = 0
question_to_kp_relations_inferred_here = 0
duplicate_primary = 0
```

BIO27-S07 / P040–P043 共 19 题；新增 **2025N19** 与 **2025N143** 已纳入 current Source coverage。

---

---

## 7｜Lecture Knowledge Routing Ledger

| Current 27 Source | Canonical Knowledge | Role |
|---|---|---|
| BIO27-S07 / P036–P044 | b-m07-lg01（TAG/脂肪酸合成与储能） + b-m07-lg02（脂解、肉碱穿梭与β氧化） + b-m07-lg03（酮体生成—利用—酸中毒） + b-m07-lg04（必需脂肪酸与类花生酸接口） | PRIMARY_FORMATION + M7 SOURCE CLOSURE |

One Source unit forms four Logic Groups without creating four separate Source reads.

---

---

## 8｜First-pass Question Probe

19 道 M7-owned 讲义附题随 BIO27-S07 / P040–P043 处理。Question→Knowledge 关系仍由 reviewed relation owner 决定。

---

---

## 9｜Block Exit｜闭卷 24 问

1. TAG的两条合成入口分别位于哪里？
2. 为什么小肠长链脂质需要CM？
3. 甘油骨架有哪两个来源？
4. 为什么肝能用游离甘油，而脂肪和骨骼肌更依赖糖酵解？
5. 脂肪酸合成的三类原料与主要部位是什么？
6. 柠檬酸—丙酮酸循环在M7做什么？
7. ACC催化什么、需要什么辅因子？
8. 丙二酰CoA怎样同时协调合成与分解？
9. ACP和CoA分别在哪种语境工作？
10. 磷脂酸—DAG—TAG主链怎样恢复？
11. 脂肪动员三步三酶是什么？
12. HSL受哪些激素方向调节？
13. HSL和LPL的空间与任务有什么不同？
14. 甘油与FFA动员后各去哪？
15. 脂肪酸怎样活化并经肉碱进入线粒体？
16. 为什么CPT-I是限速门？
17. β氧化四步与每轮产物是什么？
18. 偶数碳能量公式怎样由循环数推出来？
19. 为什么偶数碳脂肪酸通常不能净生糖？
20. 奇数碳脂肪酸怎样经丙酰CoA接入糖异生？
21. 三种酮体与三步生成链是什么？
22. 为什么肝产酮却由肝外利用？
23. 糖不足怎样一路推到酮症酸中毒？
24. 当前Study列出的必需脂肪酸和三类衍生物是什么？

---

---

## 10｜Block Production Gate（backend）

```text
Study_continuity = PASS
natural_mechanism_split = 0
repeated_first_exposure = 0
Framework_is_map = PASS
KP_natural_units = 16
prompt_leakage = PASS
embedded_questions_total = 17
embedded_questions_accounted = 17
unmapped_embedded_questions = 0
duplicate_primary = 0
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
First_pass_question_probe = READY_PENDING_BINDING
Source_conflict_open = M7-SC01
Source_gap_open = M7-SG01,M7-SG02
Source_boundary_open = M7-SB01
Visual_gate = VISUAL_SOURCE_GAP_OPEN
```

### Block Complete 定义

```text
27 Source lane 已到达 BIO27-S07 / P044
+ b-m07-lg01（TAG/脂肪酸合成与储能）–b-m07-lg04（必需脂肪酸与类花生酸接口） KP Core 已形成
+ 能闭卷恢复“储存 ↔ 动员 → β氧化 → 乙酰CoA分流 / 产酮”状态链
+ ACC—malonyl-CoA—CPT-I 开关可解释
+ current Source Gap / Boundary / exactness 已显式保留
+ 四个 Logic Group Retrieval 已达到当前要求
+ 19 道讲义附题 source-position accounted；不在本 Block 推断 Question→KP relation
```

允许：**Block Complete + explicit Source Gap / Boundary + non-gating SOURCE_BOUND + MI-D Open**。只有 HSL/LPL、ACC/CPT-I、β氧化、偶/奇数生糖边界或肝产酮—肝外用酮仍混乱时，才修最小失败轴。
