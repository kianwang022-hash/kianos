---
title: SR6｜泌乳、射乳与正常乳腺
system: 生殖—乳腺
system_stage: B-R｜正常生殖生理桥
system_id: reproductive_breast
block_id: SR6
type: block_learning_reader
version: v1
status: FINAL_EXECUTION
primary_source: 生理学讲义_AI阅读版.md
supporting_source: 病理学讲义_AI阅读版.md + 生殖乳腺System Guide
study_scope: 生理 PDF P394-P395 + P429；病理乳腺结构接口
outline_primary: NONE｜Lecture-derived Primary
outline_primary_count: 0
outline_recall: 生理 U035 神经内分泌/无靶腺激素相关2题
visual_gate_status: VERIFIED_SOURCE_PAGES_AVAILABLE
first_pass_question_probe: READY_PENDING_BINDING
---

# SR6｜泌乳、射乳与正常乳腺
## 产奶、排奶和导管通畅是三件事

> **中心问题**：E/P怎样建立导管与腺泡结构；PRL怎样让腺泡上皮产乳；OT怎样让肌上皮收缩把乳汁推出；婴儿吸吮如何同时启动两条不同激素链；乳汁不能排出为何会成为后续乳腺炎入口？
>
> **Primary ownership**：当前没有独立泌乳Outline单元，本 Block仍按Lecture完成正常乳腺与PRL/OT的独立Primary知识包。U035相关题已由D6 Primary，本 Block只显式Recall；病理/外科乳腺疾病完整主体后置E10–E14。

---

# 0｜Block Contract

## 0.1 正式范围

### Study 主范围

- 生理 PDF P394–395｜书页 P342–343：PRL、OT、神经内分泌、射乳反射；
- 生理 P429｜书页 P373：E促进乳腺导管、P促进腺泡；
- 病理乳腺接口：肌上皮参与射乳，乳腺癌缺失肌上皮的后续鉴别身份；
- System Guide：乳腺腺泡—导管—肌上皮、乳汁淤积—感染接口。

### Coverage 处置

```text
outline_primary_total = 0
U035 explicit recall identities = 2
lecture_derived_primary = COMPLETE
unmapped = 0
missing = 0
duplicate_primary = 0
```

### Learn

- 正常乳腺导管—腺泡—肌上皮功能单元；
- E与P的结构发育分工；
- PRL来源、无靶腺身份与产乳；
- OT来源、储存释放、射乳反射；
- 吸吮对PRL/OT的双链；
- 产乳、射乳、导管排空的差别；
- 肌上皮正常功能与后续病理接口；
- 乳汁淤积—感染入口的最小连续链。

### Recall

- SR1：PRL/OT身份与控制模式；
- SR3：E导管、P腺泡；
- SR5：hPL几乎无催乳、妊娠期E/P与产后阶段边界；
- P0/D6：神经—体液反射、无靶腺激素。

### Apply

- E10：良性乳房疾病；
- E11：哺乳期乳腺炎/脓肿；
- E12–E14：肌上皮、原位/浸润和乳腺癌；
- 乳汁淤积只作感染入口，不展开抗菌药和切开引流。

### Defer

- 乳汁成分、哺乳指导、产后内分泌全套；
- 高泌乳素血症、不孕/闭经；
- 完整乳腺炎、脓肿和乳腺癌模型；
- 现代促泌乳/抑乳药理。

## 0.2 Source Boundary

- 当前Study明确：PRL负责泌乳，OT使肌上皮收缩促进乳汁排出；
- Study还写明OT有类似PRF作用，射乳时可同步增强PRL分泌；按Source保留；
- hPL名称虽似催乳素，但Study强调几乎无催乳作用，不能替代PRL；
- 病理接口只用于说明肌上皮是正常射乳结构和后续浸润鉴别标志，不提前生成乳腺癌正文；
- P394–395及病理相关原页已核验，视觉入口可用。

---

# 1｜普通 Chat 初学与同模型复习

普通 Chat 先定位 System 与本 Block 的同一模型，再在自然节点展开正式标题、完整 Prompt 和所需 Core；讲清后压回同一模型复习，答案可见。精确数字、条件、名单与比较按需调用原有 Memory/Precision，不因本次阅读新增准入或学习记录。只有明确要求自测时才隐藏答案。

原来源按下列范围校准；真正影响当前理解的原图、精确条件和认知先修仍在依赖处核对或补讲。Source 接触须以实际阅读为据，不能由 Chat 讲解代替。Outline 只按需查漏；讲义对应练习按原定位在接触相应 Source 后使用，不阻塞每次建模或普通复习。

对应范围与模型接口：

- Source Unit 1：P429 乳腺发育 + 正常导管 / 小叶 / 肌上皮结构接口
- 模型接口：恢复正常乳腺功能单元
- Source Unit 2：P394–395 连续学习 PRL / OT 与吸吮反射
- 模型接口：分开“产乳”与“射乳”
- Source Unit 3：基于已接触 Source 完成“产乳—射乳—排空”的结构功能桥；必要时只回原图核对关键结构
- 模型接口：定位生产 / 射乳 / 引流三个失效位置
- 同模型压缩线索：压回“结构—产乳—射乳—排空”

第一轮守住：

```text
E长导管，P长腺泡
PRL让腺泡上皮产乳
OT让肌上皮收缩射乳
吸吮同时启动两链
有乳 ≠ 能排乳；排乳 ≠ 导管一定通畅
```

---

# 2｜总 Framework

<!-- kianos:framework id="repro-sr6-framework-main" -->

```text
A｜结构准备：生产、动力与通道三层同时在场
腺泡分泌上皮生产 → 肌上皮收缩帮助排出 → 导管输送
  正常乳腺功能单元：导管—腺泡—肌上皮〔3结构｜各1功能｜谁分泌｜谁收缩｜乳汁走向〕
E促进导管发育；P促进腺泡发育，结构发育不等于产乳/射乳
  E长导管，P长腺泡〔E发育1｜P发育1｜共同结果｜阶段调用｜不是谁产乳〕

B–D｜同一吸吮输入协调两条效应链（不把射乳当成产乳之后才有的独立阶段）
  吸吮同时启动两条链〔刺激1｜OT链4步｜PRL链3步｜同步结果2｜谁快谁持续〕
B｜产乳
下丘脑PRF/PIF调节 → 腺垂体PRL → 腺泡分泌上皮 → 乳汁生成
  PRL：来源、控制与产乳〔来源1｜控制因子2｜身份1｜靶细胞1｜结果1｜吸吮如何加〕
PRL直接作用乳腺，为无靶腺激素，不需另一外周激素中转

C｜射乳
吸吮机械刺激 → 神经传入下丘脑 → OT由神经垂体释放入血 → 肌上皮收缩 → 乳汁排出
OT在下丘脑大细胞神经元合成；神经垂体储放、不合成
  OT：来源、反射与射乳〔合成1部位｜储放1部位｜刺激1｜靶1细胞｜结果1｜另1反射〕
催产反射只是OT另一个效应接口，不是射乳反射的下游

D｜双链同步及激素身份比较
当前Study：OT有类似PRF作用 / 下丘脑调节 → PRL↑，排出已有乳汁同时支持后续生产
hPL课程主效应促胎儿生长、几乎无催乳；不可由名称替代PRL
  hPL、PRL、OT：名称相似但职责不同〔hPL来源/主效应｜PRL来源/主效应｜OT来源/主效应｜谁几乎不催乳〕

E｜排空与风险：沿三层找问题，不凭排乳少直接诊断某激素不足
生产看PRL/腺泡，射出看OT/肌上皮，排空看导管与有效吸吮
  产乳、射乳、排空：三个失效位置〔生产看谁｜射出看谁｜通畅看哪｜有乳无排提示｜排乳少的3位置〕
产乳持续 + 排空不足 → 淤积；有细菌进入等条件时感染风险上升，可进展为脓肿
  乳汁淤积—感染入口：只建立最小链〔排空不足｜淤积｜细菌入口｜炎症→脓肿分界｜完整源控制去哪〕
并非淤积必然感染；具体细菌入口/脓肿分界与源控制回E11原owner

F｜同一肌上皮结构的病理接口
正常收缩执行层 → 后续观察保留/缺失支持原位/浸润等鉴别
  肌上皮：正常射乳执行器与后续病理屏障接口〔正常功能1｜受体激素1｜围绕哪2结构｜病理存在/缺失提示｜完整癌模后置〕
不能仅凭一个结构描述完成肿瘤诊断；完整癌模型后置

A–F｜放回正常生殖桥（只调用实际需要的前序关系）
GnRH轴 → 男三细胞 / 女周期与双细胞来源 → 受精后hCG黄体—胎盘接力
产后功能调用本模型PRL产乳 + OT射乳；不把男女分支串成同一时间过程
  正常生殖生理桥的终点：轴—周期—妊娠—泌乳〔GnRH轴｜男3细胞｜女3时间轴｜2细胞来源｜hCG接力｜PRL/OT双链〕
原滚动图提供压缩入口；女三时间轴、双细胞细节按需回SR3/SR4，不要求重读六块
```

### 一句话恢复

> **E/P先造好“管和泡”，PRL负责造奶，OT负责挤奶；问题可分别出在生产、射出或通道。**

---

# 3｜正式内容与完整 Prompt

<!-- kianos:kp id="repro-sr6-kp01" -->
## KP01｜正常乳腺功能单元：导管—腺泡—肌上皮

> **讲义定位 →** 生理 P429；病理乳腺接口。  
> **主提示：3结构｜各1功能｜谁分泌｜谁收缩｜乳汁走向**

### 快速核对

- 腺泡/小叶分泌上皮：生产乳汁；
- 导管：输送乳汁；
- 肌上皮：位于腺泡/导管周围，对OT敏感，收缩促进乳汁排出；
- 正常方向：腺泡生成→肌上皮挤出→导管输送。

### 详细展开

正常乳腺不是一团“腺体”。至少要分清生产单元、动力单元和运输通道。肌上皮既是生理射乳执行器，又是后续病理判断原位/浸润的重要结构标志；但当前只学习正常身份。

**Routing**：CORE｜VISUAL_ONLY｜MI-G

---

<!-- kianos:kp id="repro-sr6-kp02" -->
## KP02｜E长导管，P长腺泡

> **讲义定位 →** 生理 PDF P429｜书页 P373。  
> **主提示：E发育1｜P发育1｜共同结果｜阶段调用｜不是谁产乳**

### 快速核对

- E：促进乳腺导管发育；
- P：促进乳腺腺泡发育；
- 二者完成结构准备；
- 真正产乳由PRL驱动，射乳由OT驱动。

### 详细展开

“乳房发育”不能直接等同“泌乳”。E/P主要建立结构，PRL与OT才分别完成产乳和排乳。这个分层可以解释为何名称相似的胎盘激素、性激素和垂体激素不能放在同一功能栏。

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="repro-sr6-kp03" -->
## KP03｜PRL：来源、控制与产乳

> **讲义定位 →** 生理 PDF P394–396｜书页 P342–344。  
> **主提示：来源1｜控制因子2｜身份1｜靶细胞1｜结果1｜吸吮如何加**

### 快速核对

- 腺垂体分泌；
- 受PRF/PIF双重调节；
- 属无靶腺激素，直接作用乳腺；
- 使腺泡分泌上皮泌乳；
- 吸吮/OT类似PRF接口可使PRL增加。

### 详细展开

PRL解决“有没有乳汁生产”的问题。它不是在神经垂体储存，也不直接让肌上皮收缩。当前Study把PRL列为无靶腺激素，说明它不需要先促使某个外周腺体分泌第二种激素。

（易混：高泌乳素血症、闭经/溢乳的完整疾病模型当前Source不足，不扩写。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="repro-sr6-kp04" -->
## KP04｜OT：来源、反射与射乳

> **讲义定位 →** 生理 PDF P394–395｜书页 P342–343。  
> **主提示：合成1部位｜储放1部位｜刺激1｜靶1细胞｜结果1｜另1反射**

### 快速核对

- 下丘脑室旁核等大细胞神经元合成；
- 神经垂体储存、释放；
- 婴儿吸吮乳头为机械刺激；
- 使乳腺肌上皮收缩，促进乳汁排出；
- 也参与催产反射/子宫收缩。

### 详细展开

OT解决“已有乳汁能否被推出”的问题。它属于神经—内分泌反射：刺激先沿神经传入下丘脑，再以激素形式入血作用乳腺。神经垂体只储存和释放，不合成OT。

**Routing**：CORE｜MI-G

---

<!-- kianos:kp id="repro-sr6-kp05" -->
## KP05｜吸吮同时启动两条链

> **主提示：刺激1｜OT链4步｜PRL链3步｜同步结果2｜谁快谁持续**

### 快速核对

```text
吸吮
→ 神经传入下丘脑
→ OT释放
→ 肌上皮收缩
→ 射乳

同时
→ OT类似PRF / 下丘脑调节
→ 腺垂体PRL↑
→ 泌乳增强
```

### 详细展开

一次吸吮动作可以同时解决“把现有乳汁排出”和“继续支持后续乳汁生成”。这不是PRL与OT作用相同，而是两条不同效应链被同一感觉输入协调。“谁快谁持续”在此按排出现有乳汁与支持后续生成的功能差别理解；当前Core未给定量反应时间，不补数字。

**Routing**：CORE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="repro-sr6-kp06" -->
## KP06｜产乳、射乳、排空：三个失效位置

> **主提示：生产看谁｜射出看谁｜通畅看哪｜有乳无排提示｜排乳少的3位置**

### 快速核对

| 层级 | 关键结构/激素 | 失败表现的概念入口 |
|---|---|---|
| 产乳 | 腺泡上皮 + PRL | 乳汁生成不足 |
| 射乳 | 肌上皮 + OT | 有乳但难以排出 |
| 排空 | 导管通畅 + 持续有效吸吮 | 淤积、局部压力与感染入口 |

### 详细展开

临床描述“有乳但排不出”应优先想到射乳/排空，而不是自动判断PRL不足。相反，“肌上皮不收缩”与“导管被阻”也不是同一层。当前只建立定位语言，不生成哺乳障碍诊疗。

**Routing**：CORE｜DISCRIMINATION｜MI-G

---

<!-- kianos:kp id="repro-sr6-kp07" -->
## KP07｜hPL、PRL、OT：名称相似但职责不同

> **主提示：hPL来源/主效应｜PRL来源/主效应｜OT来源/主效应｜谁几乎不催乳**

### 快速核对

- hPL：胎盘；几乎无催乳作用，主要促胎儿生长；
- PRL：腺垂体；产乳；
- OT：下丘脑合成、神经垂体释放；射乳/子宫收缩。

### 详细展开

“胎盘催乳素”是最容易被名称误导的词。当前Study明确要求把hPL与真正的PRL分开。PRL与OT也不能合并：一个作用分泌上皮，一个作用肌上皮。

**Routing**：CONFUSABLE｜MI-G

---

<!-- kianos:kp id="repro-sr6-kp08" -->
## KP08｜肌上皮：正常射乳执行器与后续病理屏障接口

> **讲义定位 →** 病理生殖/乳腺接口；生理 P394–395。  
> **主提示：正常功能1｜受体激素1｜围绕哪2结构｜病理存在/缺失提示｜完整癌模后置**

### 快速核对

- 正常：肌上皮对OT敏感，收缩促进射乳；
- 位置：围绕腺泡和导管上皮；
- 后续病理：肌上皮保留/缺失可作为原位/浸润及硬化性腺病鉴别接口；
- 完整乳腺癌病理归E12；肌上皮保留/缺失只是鉴别接口，不能单凭这一项替代完整病理判断。

### 详细展开

同一结构在正常生理和病理诊断中承担不同信息。这里先学“肌上皮是射乳动力层”；等到乳腺癌时，只需Recall它的正常位置，再判断肿瘤是否突破这层结构，而不需要第二次初见。

**Routing**：CORE｜CONNECTION｜BOUNDARY｜MI-G

---

<!-- kianos:kp id="repro-sr6-kp09" -->
## KP09｜乳汁淤积—感染入口：只建立最小链

> **主提示：排空不足｜淤积｜细菌入口｜炎症→脓肿分界｜完整源控制去哪**

### 快速核对

```text
产乳持续
+ 射乳/导管排空不足
→ 乳汁淤积
→ 细菌进入与局部炎症风险
→ 可进展为乳腺炎 / 脓肿
```

### 详细展开

当前Block只说明为什么正常排空是防止淤积的重要环节。发热、红肿热痛、波动感、抗感染和切开引流等完整诊疗全部后置E11；这里不提前展开。

**Routing**：CONNECTION｜DEFERRED_MODEL｜MI-G

---

<!-- kianos:kp id="repro-sr6-kp10" -->
## KP10｜正常生殖生理桥的终点：轴—周期—妊娠—泌乳

> **主提示：GnRH轴｜男3细胞｜女3时间轴｜2细胞来源｜hCG接力｜PRL/OT双链**

### 快速核对

```text
GnRH→FSH/LH→性腺
├─ 男：支持/间质/生精→精子+雄激素
└─ 女：卵泡→E→LH峰→排卵→黄体P
               ↓受精
            hCG→妊娠黄体→胎盘
                         ↓产后功能
               PRL产乳 + OT射乳
```

### 详细展开

这是B-R桥的滚动复习入口。后续进入女性生殖病理和乳腺疾病时，只需用这张图恢复正常时间轴和组织结构，不再重学SR1–SR6正文。

**Routing**：FRAMEWORK_RECONSTRUCTION｜MI-G

---

# 4｜高密度比较表

## 4.1 结构—激素—动作

| 层 | 建立者/控制者 | 动作 |
|---|---|---|
| 导管 | E | 结构发育、运输 |
| 腺泡 | P建立结构；PRL驱动分泌 | 乳汁生成 |
| 肌上皮 | OT | 收缩、射乳 |
| 排空 | 吸吮 + 肌上皮 + 导管通畅 | 防止淤积 |

---

# 5｜Memory Routing

## MI-G

- E导管、P腺泡；
- PRL来源与产乳；
- OT来源与射乳；
- 吸吮双链；
- 产乳/射乳/排空三层；
- hPL/PRL/OT区别；
- 肌上皮正常功能与病理接口。

## MI-D

- PRF/PIF详细调节；
- OT全部核团与信号通路；
- 乳汁成分、哺乳药理；
- 乳腺炎、脓肿、癌的完整诊疗。

---

# 6｜Study 原图门禁

```text
physiology_visual_gate = VERIFIED_SOURCE_PAGES_AVAILABLE
pathology_visual_gate = VERIFIED_SOURCE_PAGES_AVAILABLE
```

必须回原图：

1. 生理 P394：下丘脑—神经垂体OT来源；
2. 生理 P395：吸吮—OT射乳—PRL泌乳双链；
3. 生理 P429：E导管、P腺泡；
4. 病理乳腺相关原页：肌上皮位置与后续鉴别接口；
5. 生殖System Guide原图门禁54、65项：正常导管/小叶/肌上皮与淤积—感染链。

当前包可定位病理P107导管—小叶裁图，能见导管与乳腺小叶结构，但此裁图不能独自核验完整肌上皮层或PRL/OT反射。本轮不以它外推其他原图已重新核验。

按需自测（不作过关门槛）：可画“导管—腺泡—肌上皮”并在旁边标E/P/PRL/OT。

---

# 7｜Outline Coverage Safety Net

```text
outline_primary_total = 0
U035_prior_primary_recall = 2
lecture_derived_primary = COMPLETE
unmapped = 0
missing = 0
duplicate_primary = 0
```

| Outline身份 | 处置 |
|---|---|
| U035 神经内分泌 | Recall → KP04–KP05 |
| U035 无靶腺激素 | Recall → KP03 |
| U041 E/P乳房作用 | 已在SR3 Primary，SR6 Apply → KP02 |
| U041 胎盘hPL | 已在SR5 Primary，SR6 Recall → KP07 |
| 泌乳/射乳 | 无独立Outline；由Lecture Routing完整覆盖 |

---

# 8｜Lecture Knowledge Routing Ledger

| Routing | 当前归属 |
|---|---|
| CORE | 乳腺功能单元、E/P发育、PRL产乳、OT射乳 |
| SPECIAL | OT类似PRF；hPL几乎无催乳；肌上皮病理接口 |
| CONFUSABLE | 产乳vs射乳；PRLvsOT；hPLvsPRL；腺泡vs肌上皮 |
| CONNECTION | E11乳腺炎；E12乳腺癌；SR3/SR5 |
| BOUNDARY | 不扩哺乳管理、高PRL疾病、乳腺疾病诊疗 |
| MI-G | 四激素—三结构—三动作 |
| MI-D | 调节因子、药理、乳汁成分 |
| VISUAL_ONLY | 乳腺结构、双反射图、肌上皮 |
| DEFERRED_MODEL | 乳腺炎/脓肿/癌→E11–E14 |
| REDUNDANT_EXPOSITION | 重复内分泌总论与乳腺病理旁注已合并 |

```text
unrouted_lecture_knowledge = 0
unsupported_expansion = 0
```

---

# 9｜First-pass Question Probe

```text
source = TTSX Lecture-attached Questions
selection = LectureQuestionBinding
binding_scope = physiology P394-P395 + P429 + pathology breast source anchors
status = READY_PENDING_BINDING
```

---

# 10｜同模型复习与按需自测

以下用于本块模型查漏与按需自测；普通复习可看答案，不作为完成或后续学习门槛：

1. 画导管—腺泡—肌上皮功能单元；
2. 解释E/P分别建立哪种乳腺结构；
3. 说明PRL来源、控制方式、靶细胞和产乳作用；
4. 说明OT来源、释放方式、靶细胞和射乳作用；
5. 从吸吮推导OT与PRL两条链；
6. 区分产乳、射乳和排空失败；
7. 比较hPL、PRL、OT；
8. 说明肌上皮为何同时是正常射乳结构与后续病理接口；
9. 用最小链连接乳汁淤积与乳腺炎，但不提前展开诊疗；
10. 按需重建SR1–SR6总图。

> **B-R正常生殖生理桥出口**：能用一张图恢复“生殖轴—男性三细胞—女性周期—性激素来源—hCG黄体胎盘接力—PRL/OT泌乳射乳”。后续E阶段只Recall这张图，不做第二次初见。

---

# 11｜Block Production Gate

```text
Study continuity = PASS
KP_natural_units = 10
outline_primary_total = 0
prior_primary_recall = 2
lecture_derived_primary = COMPLETE
unmapped = 0
missing = 0
duplicate_primary = 0
unrouted_lecture_knowledge = 0
unsupported_expansion = 0
main_prompt_low_friction = PASS
Detailed_Expansion_density = PASS
First_pass_question_probe = READY_PENDING_BINDING
Visual_gate = VERIFIED_SOURCE_PAGES_AVAILABLE
canonical_freeze_ready = YES
System_Final_Gate = NOT_RUN
reason = B-R桥完成，但生殖—乳腺System的E1-E14仍未完成
```
