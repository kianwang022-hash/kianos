---
type: block_guide
schema_version: 1
content_version: 1
system_id: urinary
block_id: urinary-b14
title: 泌尿系外伤
order: 14
study_refs:
  - source_id: surgery-lecture
    label: 27外科精编版【带导图】｜SUR27-U19｜泌尿系外伤
    pdf_page_start: 135
    pdf_page_end: 141
    source_locator_semantics: visual P136-P139 labels are source-local preprocessing/IMAGE_PAGES routes, not current merged-PDF physical page numbers
outline_units:
  - SUR-U027
  - SUR-U028
outline_primary_count: 7
kp_count: 14
prerequisites:
  - urinary-b01
  - urinary-b06
  - urinary-b12
next_blocks: []
system_exit_pending: true
visual_gate_status: MANDATORY_SOURCE_LOCAL_VISUAL_REVIEW_PIXEL_AUDIT_NOT_CLAIMED
---

# Block 14｜泌尿系外伤
## 学习阅读版 v1｜最终执行版

> **中心问题**：会阴骑跨伤、骨盆骨折或腰腹部钝伤后，怎样根据受伤机制、尿道滴血、血尿、尿外渗空间、腹膜刺激征和血流动力学稳定性，定位前尿道、后尿道、膀胱或肾脏损伤；什么情况下应先评估尿道再置管；什么时候影像优先，什么时候必须把止血 / 探查和复苏放在影像之前？
>
> **文件性质**：泌尿系统第十四个疾病 Block。K1 已建立排尿通路，K6 已建立血尿与尿路定位，K12 已建立尿路出口与梗阻。本 Block 第一次把“损伤位置 → 血 / 尿向哪里走 → 稳定性 → 检查 → 引流 / 修补 / 止血”构造成泌尿外伤空间模型。
>
> **Primary Study**：`27外科精编版【带导图】.pdf` SUR27-U19，泌尿系外伤主体 PDF P135–P137，后续 P138–P141 为题目/复核范围。历史 `P136–P139` source-local preprocessing 标识仅作兼容 provenance；Current 物理页以本范围为准。
>
> **Primary Outline**：外科 U027“尿道外伤金标准”1题 + U028 泌尿外伤6题 = **7 / 7**。U028“尿失禁”已由 K12 Primary，不在本 Block重复。
>
> **第一轮流程**：Framework → 27外科精编 PDF P135–P137 连续学习与原图 Visual Gate → Framework Reconstruction → KP Active Recall → Outline optional / low-pressure → TTSX Lecture-attached Questions → Block Complete。
>
> **Source boundary**：保留当前 Study 的前/后尿道、尿生殖膈、膀胱腹膜内外、三型肾外伤和尿外渗空间作为 306 Core；对“RUG金标准、浮动前列腺、腹膜外膀胱手术、大出血一律探查”等旧压缩句加入 Current 情境边界。完整创伤分级与复杂重建仍不展开。
>
> **本批状态边界**：K14 是 System Guide 的最后一个编号 Block，但 A3 System-level K 仍不能关闭，因为 B5 另有独立 acid-base Source/owner blocker；本文件完成不等于 System Final Gate。

---

# 0｜这个 Block 到底解决什么

泌尿外伤最容易被背成四张表：

- 前尿道；
- 后尿道；
- 膀胱；
- 肾。

真正统一它们的是两个问题：

> **第一，患者是否稳定？第二，哪里裂了，血和尿先进入哪里的邻近间隙？**

病例顺序：

```text
血流动力学是否稳定 / 有无其他致命伤
→ 受伤机制
→ 可疑部位
→ 尿道口滴血 / 血尿 / 腹膜刺激征 / 肿块
→ 血和尿外渗到哪里
→ 是否需要RUG / 膀胱造影 / CT
→ 引流、保守、栓塞、修补或探查
```

四个空间入口：

```text
会阴骑跨伤
→ 前尿道球部
→ 尿生殖膈以下外渗

骨盆骨折
→ 后尿道 / 骨盆骨折尿道损伤
→ 尿生殖膈以上、膀胱周围 / 耻骨后外渗

膀胱穹隆 / 腹膜内面破裂
→ 尿进入腹腔、全腹腹膜刺激征

膀胱腹膜外破裂
→ 膀胱周围 / 耻骨后外渗

腰腹部损伤
→ 肾挫伤 / 裂伤 / 肾蒂或血管损伤
→ 血尿、肿块与伤情严重度并不总成比例
```

---

# 1｜总 Framework

<!-- kianos:framework id="urinary-b14-framework-main" -->

```text
① 第一门：血流动力学与致命伤
   不稳定 / 持续出血？
   → 复苏 + 止血/介入/探查优先
   稳定？
   → 进入器官影像定位
   [KP01]
        ↓
② 看受伤机制
   会阴骑跨 → 前尿道球部
   骨盆骨折 → 后尿道 / PFUI
   下腹 / 膀胱充盈受伤 → 膀胱
   腰腹部钝伤 → 肾
   [KP02]
        ↓
③ 若有尿道口滴血 / 高度怀疑尿道伤
   不盲目反复器械操作
   → RUG为男性早期标准检查，必要时柔性镜
   [KP03]
        ↓
④ 尿道损伤按尿生殖膈建立空间
   前尿道：膈下、会阴阴囊阴茎下腹壁
   后尿道：膈上、膀胱周围 / 耻骨后
   [KP04–KP06]
        ↓
⑤ 怀疑膀胱破裂
   → 逆行膀胱造影 / CT膀胱造影
   → 腹膜外 vs 腹膜内
   → uncomplicated 外型多持续引流
   → blunt 内型手术修补
   [KP07–KP09]
        ↓
⑥ 肾外伤先看稳定性再看结构
   稳定 → 多期CT定级，很多病例非手术
   活动出血可选择性栓塞
   持续不稳定 → 探查
   [KP10–KP13]
        ↓
⑦ 最终病例算法
   稳定性→机制→空间→RUG/膀胱造影/CT→引流/介入/修补/探查
   [KP14]
```

## 一条总电影

```text
会阴骑跨伤
→ 尿道球部受损
→ 尿道滴血、排尿困难
→ 尿液和血肿向会阴、阴囊、阴茎、下腹壁扩散
→ RUG定位；避免盲目反复插管

骨盆骨折
→ 后尿道 / PFUI
→ 尿道滴血、排尿困难
→ 膀胱周围和耻骨后外渗
→ RUG为标准早期检查
→ 先处理生命危险，再建立尿流引流

膀胱破裂
→ 膀胱造影分腹膜外或腹膜内
→ uncomplicated腹膜外多导尿持续引流
→ 复杂腹膜外按伤情修补
→ blunt腹膜内因尿入腹腔通常手术修补

肾外伤
→ 先看血流动力学
→ 稳定时CT定位/分级，很多钝伤保守
→ 活动出血可介入栓塞
→ 持续不稳定时探查
```

---

# 2｜Ownership 与动作边界

| 内容 | 本 Block动作 | 边界 |
|---|---|---|
| 前 / 后尿道解剖与尿生殖膈 | **Primary Learn / Visual** | 正常排尿反射不重复 |
| 尿道外伤机制、外渗、RUG | **Primary Learn** | 复杂重建术式不扩写 |
| 膀胱腹膜内 / 外破裂 | **Primary Learn** | 精确修补术式不扩写 |
| 肾外伤稳定性 / 影像 / 处理 | **Primary Learn / Decision** | 不扩完整AAST分级表 |
| 血尿定位 | **Recall + Apply** | K6 Primary |
| 出口梗阻与导尿 | **Recall / Apply** | K12 Primary |
| 休克与整体创伤复苏 | **Recall / Apply** | 循环 / 创伤共同 owner |
| 尿失禁 | **Defer / Recall** | K12 Primary，不在K14重复 |
| source-local P136–139 | **Visual routing** | 不等于合并PDF物理页；不虚报pixel audit |

---

# 3｜第一门：稳定性先于泌尿器官精细分型

<!-- kianos:kp id="urinary-b14-kp01" -->

## KP01｜泌尿外伤第一优先级：血流动力学稳定性与致命伤

> **讲义定位 →** 外科 P111。  
> **主提示**：第一问｜稳定/不稳定两路｜复苏与止血并行｜不要等影像｜旧“休克=手术”边界。

第一问：

> **患者是否血流动力学稳定？是否存在持续大出血或其他需要立即处理的致命伤？**

```text
持续不稳定 / 大出血
→ 复苏同时控制出血
→ 根据整体创伤进入介入或手术探查
→ 不为等待完整泌尿影像而延误救命处理

稳定或复苏后稳定
→ 再用RUG / 膀胱造影 / CT完成器官定位
→ 很多肾脏和腹膜外膀胱损伤可非手术处理
```

### //MI-D｜Source wording

Lecture 写“大出血、休克 → 手术探查 + 抗休克”。考试识别继续保留；Current 将它理解为**持续血流动力学不稳定 / 需要立即止血控制**，而不是只要出现过低血压就一律开腹。

（易混：血尿少不代表安全，肾蒂 / 血管损伤可迅速休克而血尿不突出。）

---

<!-- kianos:kp id="urinary-b14-kp02" -->

## KP02｜受伤机制先定位：前骑球、后骨盆、下腹看膀胱、腰腹看肾

> **主提示**：4机制｜4部位｜各1首发线索｜机制比单一血尿更先行。

| 受伤机制 | 首先定位 |
|---|---|
| 会阴部骑跨伤 | 前尿道，常伤尿道球部 |
| 骨盆骨折 | 后尿道 / pelvic fracture urethral injury |
| 下腹部 / 膀胱充盈时外伤 | 膀胱破裂接口 |
| 腰腹部外伤 / 快速减速 | 肾外伤 |

病例不能只抓“血尿”：

- 尿道口滴血 + 排尿困难更支持尿道损伤；
- 骨盆骨折 + 肉眼血尿应高度警惕膀胱损伤并进入膀胱造影；
- 全腹腹膜刺激征把位置拉向腹膜内膀胱破裂；
- 腰腹部痛、血尿、肿块或快速减速史把位置拉向肾。

---

# 4｜尿道外伤：有尿道滴血时先避免盲目反复器械操作

<!-- kianos:kp id="urinary-b14-kp03" -->

## KP03｜尿道外伤：RUG是男性早期标准检查；“不盲插”不等于永远不能置管

> **主提示**：警报｜RUG身份｜柔性镜替代｜partial/complete边界｜置管安全语言。

若出现：

- 尿道口滴血；
- 排尿困难；
- 会阴骑跨伤或骨盆骨折背景；

应高度怀疑尿道损伤。

当前稳定：

> **逆行尿道造影 RUG 是男性尿道外伤早期标准检查。**柔性膀胱尿道镜在合适场景也是诊断选择。

安全原则：

```text
高度怀疑尿道损伤
→ 不做盲目、反复、暴力导尿
→ 先评估尿道或由有经验人员在明确创伤路径中处理
→ 必要时建立经尿道或耻骨上尿流引流
```

### RUG边界

- 造影剂外漏可确证尿道损伤并帮助定位前 / 后尿道；
- **RUG并不能在所有病例可靠区分“完全断裂 vs 部分断裂”**；旧“造影剂不能进入后尿道 = 完全断裂”只作 Source 提示，不写成绝对诊断规则。

---

<!-- kianos:kp id="urinary-b14-kp04" -->

## KP04｜前尿道外伤：膈下、骑跨、球部、会阴外渗

> **主提示**：膈上/下｜原因1｜部位1｜外渗4区｜病例组合。

前尿道：位于尿生殖膈以下。

当前 Study 典型：

- 原因：会阴部骑跨伤；
- 常伤：尿道球部；
- 尿外渗 / 血肿：会阴、阴囊、阴茎、下腹壁。

病例组合：

```text
骑跨伤
+ 排尿困难
+ 尿道滴血
+ 会阴 / 阴囊肿胀
→ 前尿道球部损伤
```

---

<!-- kianos:kp id="urinary-b14-kp05" -->

## KP05｜后尿道 / PFUI：骨盆骨折、耻骨后外渗；“浮动前列腺”只是旧支持线索

> **主提示**：膈上｜原因｜外渗2区｜DRE旧线索｜不要依赖DRE排除。

传统 306 空间模型：

- 原因：骨盆骨折；
- 常以尿道膜部 / 后尿道损伤记忆；
- 尿外渗 / 血肿：膀胱周围、耻骨后间隙；
- Lecture 写直肠指检可见肿痛、前列腺尖端浮动感。

病例组合：

```text
骨盆多发骨折
+ 排尿困难 / 尿道滴血
+ 耻骨后或膀胱周围外渗
→ 高度怀疑PFUI / 后尿道损伤
→ RUG/内镜证据确认
```

### //MI-D｜历史体征边界

“高位 / 浮动前列腺”继续作为 306 题源提示，但敏感性和可重复性有限，**不能靠DRE阴性排除尿道损伤**。DRE在现代创伤中更重要的是同时识别直肠损伤等伴随伤线索。

---

<!-- kianos:kp id="urinary-b14-kp06" -->

## KP06｜前尿道 vs 后尿道：空间表保留，检查证据优先于旧体征

> **主提示**：尿生殖膈｜原因｜常伤部｜外渗｜RUG｜DRE边界。

| 比较轴 | 前尿道外伤 | 后尿道 / PFUI |
|---|---|---|
| 与尿生殖膈 | 以下 | 以上方向 |
| 主要原因 | 会阴骑跨伤 | 骨盆骨折 |
| 传统常伤部位 | 尿道球部 | 膜部 / 后尿道 |
| 尿外渗 / 血肿 | 会阴、阴囊、阴茎、下腹壁 | 膀胱周围、耻骨后间隙 |
| 早期标准检查 | RUG | RUG |
| 旧支持线索 | — | DRE高位/浮动前列腺，仅Precision |

这张表必须结合原图和 RUG 空间证据，而不是只背口诀或依赖DRE。

---

# 5｜膀胱破裂：先用膀胱造影分腹膜内外，再决定引流还是修补

<!-- kianos:kp id="urinary-b14-kp07" -->

## KP07｜膀胱外伤：逆行膀胱造影 / CT膀胱造影是诊断层

> **主提示**：何时怀疑｜检查｜2型｜外渗空间｜治疗分流。

共同逻辑：

```text
骨盆骨折 + 肉眼血尿
或高度怀疑膀胱破裂
→ 逆行充盈膀胱造影 / CT膀胱造影
→ 看造影剂外渗是在腹膜外还是腹膜内
→ 再决定持续引流或手术修补
```

两类：

- 腹膜外型膀胱破裂；
- 腹膜内型膀胱破裂。

普通腹部 CT 排泄期被动“让膀胱里有点造影剂”不能替代规范的逆行充盈膀胱造影。

---

<!-- kianos:kp id="urinary-b14-kp08" -->

## KP08｜腹膜外膀胱破裂：空间主干保留，uncomplicated 多持续导尿引流

> **主提示**：外渗空间｜Source前壁｜局部体征｜保守主轴｜何时手术。

传统 Study 空间识别：

- 常记膀胱前壁 / 腹膜外区域；
- 尿外渗 / 血肿：膀胱周围、耻骨后间隙；
- 可见下腹疼痛、压痛、肌紧张等局部体征。

### Current 处理

```text
uncomplicated blunt extraperitoneal rupture
→ 持续膀胱引流（导尿）
→ 随访愈合
```

需要手术修补的复杂因素包括：

- 膀胱颈受累；
- 骨片进入 / 持续损伤膀胱壁；
- 合并直肠、阴道等损伤；
- 膀胱壁嵌顿或同时需要盆腔手术等。

### //MI-D｜Source wording

Lecture 的“下腹正中切口 / 手术”作为旧考试表保留，但**不再写成所有腹膜外破裂的默认治疗**。

---

<!-- kianos:kp id="urinary-b14-kp09" -->

## KP09｜腹膜内膀胱破裂：尿入腹腔，blunt trauma 通常手术修补

> **主提示**：穹隆/顶部｜腹腔外渗｜全腹腹膜征｜造影｜手术修补。

当前稳定：

- 充盈膀胱受打击时，穹隆 / 顶部是典型弱点；
- 尿液进入腹腔；
- 可出现全腹腹膜刺激征、腹胀等；
- 膀胱造影显示腹膜内造影剂包绕肠袢 / 腹腔脏器；
- **钝性腹膜内膀胱破裂通常需要手术探查与修补。**

对照：

| 腹膜外 | 腹膜内 |
|---|---|
| 膀胱周围、耻骨后外渗 | 腹腔外渗 |
| 多为骨盆骨折相关 | 常见充盈膀胱压力骤升、穹隆破裂 |
| uncomplicated 多持续导尿 | blunt injury 通常手术修补 |
| 复杂因素才升级手术 | 腹膜炎/腹腔尿外渗风险高 |

---

# 6｜肾外伤：稳定性决定“CT后保守/介入”还是“立即控制出血”

<!-- kianos:kp id="urinary-b14-kp10" -->

## KP10｜肾外伤入口：稳定患者用多期CT；不稳定患者先救命

> **主提示**：血尿/腰腹线索｜稳定性门｜CT身份｜血尿可无｜何时不能先CT。

可疑肾外伤线索：

- 腰腹部疼痛、压痛；
- 肉眼或镜下血尿；
- 快速减速伤、穿透伤或明显伴随损伤；
- 腰腹部肿块等。

Current：

```text
血流动力学稳定 / 足以进入影像
→ 多期增强CT是疑似肾外伤诊断和分级的主检查

持续不稳定、需要立即止血控制
→ 复苏与止血优先
→ 不为CT延误探查/损伤控制
```

血尿可以明显、轻微，甚至缺如；不能因“没有大量血尿”排除重伤。

---

<!-- kianos:kp id="urinary-b14-kp11" -->

## KP11｜肾挫伤：传统三型中最轻，稳定时通常非手术

> **主提示**：严重度｜血尿可有无｜稳定处理｜与裂伤对照。

肾挫伤是当前 Study 三型中最轻。

Lecture-attached Questions 支持：

- 可有肉眼血尿；
- 可有镜下血尿；
- 也可无血尿。

稳定患者以观察、监测等非手术管理为主；单纯挫伤通常不以腰腹部肿块作为典型识别物。

---

<!-- kianos:kp id="urinary-b14-kp12" -->

## KP12｜肾裂伤 / 肾蒂伤：传统轻重轴保留，但不是“分型=固定手术”

> **主提示**：传统3型｜裂伤表现｜肾蒂最重｜稳定性｜栓塞/非手术/探查。

当前 Study 三型：

1. 肾挫伤：最轻；
2. 肾裂伤；
3. 肾蒂损伤：最重。

肾全层裂伤可见：

- 腰腹部肿块；
- 大量全程肉眼血尿；
- 腹膜刺激征；
- 休克。

肾蒂 / 主血管损伤可迅速出现失血性休克和肾功能丧失。

### Current 处理边界

- **稳定的钝性肾外伤很多可非手术处理**，包括相当一部分高等级损伤；
- 活动性肾出血、患者稳定且无其他必须开腹原因时，可进入选择性血管栓塞等器官保留路径；
- 持续血流动力学不稳定且出血归因于肾损伤，或开腹时发现扩张 / 搏动性肾周血肿等，才进入探查。

因此：

> **传统“挫伤—裂伤—肾蒂伤”用于结构识别；真正处理优先级由稳定性、出血和整体创伤共同决定。**

---

<!-- kianos:kp id="urinary-b14-kp13" -->

## KP13｜血尿—严重度脱钩：轻伤可血尿，重伤可血尿少

> **主提示**：不相关1结论｜轻重各1反例｜为什么不能据血尿排除｜下一证据2。

当前 Study 反复强调：

> 血尿与病变程度不一定相关。

因此：

```text
血尿明显
≠ 一定最重

血尿不明显
≠ 可以排除肾蒂 / 血管损伤或严重出血
```

下一步证据：

- 血流动力学是否稳定；
- 稳定患者的 CT 结构 / 血管 / 尿外渗证据。

这条原则也适用于 K12 的结石：血尿不能单独反推梗阻或损伤严重度。

---

# 7｜最终定位与处理算法

<!-- kianos:kp id="urinary-b14-kp14" -->

## KP14｜泌尿外伤8步：稳定性—机制—空间—影像—引流/介入/修补

> **主提示**：稳定性门｜尿道RUG｜膀胱造影｜肾CT｜保守/介入/手术｜休克并行。

```text
1. 患者稳定吗？有没有必须立即处理的致命出血/伴随伤？
   不稳定 → 复苏 + 止血/探查优先

2. 受伤机制是什么？
   骑跨 / 骨盆骨折 / 下腹 / 腰腹 / 快速减速

3. 是否有尿道口滴血和排尿困难？
   有 → 避免盲目反复器械操作
   → 男性早期RUG ± 柔性镜

4. 血和尿外渗到哪里？
   会阴阴囊阴茎下腹壁 → 前尿道
   膀胱周围 / 耻骨后 → 后尿道或腹膜外膀胱
   腹腔 → 腹膜内膀胱

5. 怀疑膀胱破裂时做什么？
   逆行膀胱造影 / CT膀胱造影
   uncomplicated腹膜外 → 持续引流
   blunt腹膜内 → 手术修补

6. 怀疑肾外伤且稳定时做什么？
   多期CT

7. 肾外伤怎样处理？
   稳定 → 多数非手术，必要时选择性栓塞/引流
   持续不稳定 → 探查

8. 最后复核一个陷阱：
   血尿多少不能代表伤情轻重
```

---

# 8｜Framework Reconstruction

完成 Lecture 后，闭卷完成：

```text
第一层｜稳定性门
不稳定 → 复苏/止血优先
稳定 → 器官影像定位

第二层｜尿生殖膈
├─ 以下：前尿道球部
│  → 会阴、阴囊、阴茎、下腹壁
└─ 以上：后尿道 / PFUI
   → 膀胱周围、耻骨后

第三层｜膀胱
├─ 腹膜外
│  → 膀胱周围、耻骨后
│  → uncomplicated多持续引流
└─ 腹膜内
   → 腹腔、全腹腹膜刺激征
   → blunt injury通常修补

第四层｜肾
稳定 → CT → 多数非手术/必要时栓塞
不稳定 → 探查
```

再写三句优先级：

> **尿道滴血：先评估、不要盲目反复插管。**  
> **膀胱破裂：先造影分内外，腹膜外不等于一律手术。**  
> **肾外伤：稳定性决定 CT/保守/介入 vs 探查；血尿不能判断轻重。**

---

# 9｜Memory Routing

## 9.1 MI-G｜第一轮必须即时掌握

- 血流动力学稳定性是泌尿外伤第一决策门；
- 会阴骑跨伤 → 前尿道球部；骨盆骨折 → PFUI / 后尿道方向；
- 尿道滴血 / 可疑尿道伤时避免盲目反复导尿；RUG为男性早期标准检查；
- 前尿道尿外渗：会阴、阴囊、阴茎、下腹壁；
- 后尿道尿外渗：膀胱周围、耻骨后；“浮动前列腺”只作旧支持线索；
- 膀胱损伤用逆行膀胱造影 / CT膀胱造影分腹膜内外；
- uncomplicated blunt 腹膜外破裂：持续导尿引流；复杂型才手术；
- blunt 腹膜内破裂：通常手术修补；
- 稳定可疑肾外伤：多期CT；稳定钝伤多数非手术，必要时介入栓塞；
- 持续不稳定且肾出血：探查；
- 血尿与损伤程度不相关。

## 9.2 MI-D｜进入 MarginNote 3

- 尿生殖膈以上 / 以下的精确空间；
- 前尿道外渗四个区域；
- DRE高位/浮动前列腺的历史考试线索；
- RUG complete/partial 的旧题源判断；
- 膀胱腹膜内外典型壁位置；
- 腹膜外膀胱复杂型手术指征名单；
- 肾挫伤可有 / 无血尿的选项口径；
- 复杂尿道 / 膀胱重建术式和完整肾外伤现代分级，当前只认归属，不展开。

---

# 10｜Visual Review｜必须回 source-local 原图

泌尿外伤高度依赖空间关系，属于强制 Visual Gate。

历史 AI-reading 路由：

1. source-local `P136`：前 / 后尿道、尿生殖膈、球部 / 膜部、尿外渗空间；
2. source-local `P137`：腹膜内 / 外膀胱破裂与肾挫伤 / 裂伤 / 肾蒂伤；
3. source-local `P138–139`：Lecture-attached Questions 中的尿外渗位置、骑跨伤 / 骨盆骨折与肾挫伤识别。

> **重要**：这些 `P136–P139` 是 source preprocessing / IMAGE_PAGES 语境中的 locator，不是当前合并 PDF 物理页码。本批确认了文本与 asset route，但当前工具没有渲染这些原图，因此不声称 pixel-level Visual PASS。

视觉任务：

```text
不看文字指出：
尿生殖膈在哪里
前尿道和后尿道各在哪里
前后尿道尿外渗分别向哪里扩散
膀胱腹膜内外破裂的空间差别
肾挫伤、裂伤、肾蒂伤的传统结构层级
```

```text
mandatory_visual_only = 3
visual_source_route = VERIFIED
pixel_level_visual_audit = NOT_CLAIMED
```

---

# 11｜Lecture Knowledge Routing Audit

| Lecture范围 | Knowledge Role | Memory Route | 去向 |
|---|---|---|---|
| P110尿道外伤总论 / RUG | CORE / DECISION + BOUNDARY | MI-G | KP03 |
| P110前尿道 | CORE / VISUAL_ONLY / RECOGNITION | MI-G | KP04 |
| P110后尿道 | CORE / VISUAL_ONLY / RECOGNITION + PRECISION | MI-G+MI-D | KP05 |
| P110前后尿道比较 | CONFUSABLE / VISUAL_ONLY | MI-G+MI-D | KP06 |
| P111膀胱外伤 / 膀胱造影 | CORE / DECISION / VISUAL_ONLY | MI-G | KP07 |
| P111腹膜外型 | CORE / RECOGNITION + CURRENT_CORRECTION | MI-G | KP08 |
| P111腹膜内型 | CORE / RECOGNITION | MI-G | KP09 |
| P111肾外伤表现 / CT | CORE / DECISION | MI-G | KP10 |
| P111肾挫伤 | CORE / SPECIAL | MI-G+MI-D | KP11 |
| P111肾裂伤 / 肾蒂伤 | CORE / RECOGNITION + STABILITY_GATE | MI-G | KP12 |
| 血尿与严重度 | CORE / CONFUSABLE | MI-G | KP13 |
| 大出血 / 休克 | CORE / CONNECTION / DECISION | MI-G | KP01、KP14 |
| 休克完整机制 | RECALL / DEFERRED_MODEL | — | 循环系统Primary |
| P112尿失禁 | DEFERRED_MODEL / RECALL | — | K12 Primary |
| P112–113 Lecture-attached Questions | BOUNDARY | — | First-pass Question Probe待绑定 |
| 复杂重建 / 现代AAST分级 | DEFERRED_MODEL / BOUNDARY | — | 当前Source外 |
| 题旁重复口诀 / 图注复述 | REDUNDANT_EXPOSITION | — | 合并进对应KP |

```text
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
```

---

# 12｜Outline Coverage Safety Net

## 12.1 生成侧｜7 / 7

| Outline item | 题数 | 路由 |
|---|---:|---|
| U027-外伤-Q1 尿道外伤金标准 | 1 | KP03（Source称金标准；Current为早期标准检查） |
| U028-外伤-Q2 前 / 后尿道鉴别 | 1 | KP04–KP06 |
| U028-外伤-Q3 DRE前列腺浮动感 | 1 | KP05（Source Precision） |
| U028-外伤-Q4 腹膜内 / 外膀胱破裂 | 1 | KP07–KP09 |
| U028-外伤-Q5 肾外伤表现 / 首选影像 | 1 | KP10（稳定患者CT） |
| U028-外伤-Q6 三型肾外伤 | 1 | KP11–KP13 |
| U028-外伤-Q7 大出血 / 休克处理 | 1 | KP01、KP14 |
| **合计** | **7** | **7 / 7** |

```text
total = 7
mapped = 7
unmapped = 0
missing = 0
duplicate_primary = 0
```

## 12.2 学习者侧

Outline只用于低压力扫漏：

- 前后尿道空间混乱：回原图 + KP06；
- 膀胱腹膜内外混乱：回 KP07–KP09，记得腹膜外并非一律手术；
- 肾外伤轻重混乱：先回稳定性门，再回 KP10–KP13；
- 尿失禁题属于 K12，不因出现在 U028 就重复完整学习；
- 不要求7题逐题清零后才算完成。

---

# 13｜建议学习切片

```text
Unit A｜KP01–KP06
稳定性 → 受伤机制 → 前 / 后尿道空间与RUG

Unit B｜KP07–KP09
膀胱造影 → 腹膜内 / 外膀胱破裂 → 引流/修补

Unit C｜KP10–KP14
肾外伤稳定性 → CT / 非手术 / 栓塞 / 探查 → 最终算法
```

每个 Unit：

```text
Framework定位
→ Lecture连续学习 / Source-local原图
→ Framework Reconstruction
→ KP Active Recall
→ Outline按需扫漏
```

---

# 14｜Block Exit｜闭卷 18 问

1. 泌尿外伤第一决策门是什么？
2. 会阴骑跨伤与骨盆骨折分别提示哪段尿道？
3. 尿道滴血时为什么不能盲目反复导尿？
4. 男性尿道外伤早期标准检查是什么？它能否总是可靠区分完全/部分断裂？
5. 前尿道与后尿道怎样以尿生殖膈分层？
6. 前尿道常伤哪一部位，尿外渗到哪里？
7. PFUI / 后尿道方向尿外渗到哪里？
8. “浮动前列腺”在Current中是什么证据层级？
9. 怀疑膀胱破裂时应做什么专门影像？
10. uncomplicated腹膜外膀胱破裂通常怎样处理，哪些复杂因素要手术？
11. blunt腹膜内膀胱破裂为什么通常要修补？
12. 稳定疑似肾外伤的主影像是什么？
13. 肾挫伤、肾裂伤、肾蒂伤的传统结构排序是什么？
14. 为什么很多稳定钝性肾外伤不需要手术？
15. 什么时候考虑选择性血管栓塞？
16. 什么时候必须进入肾探查？
17. 为什么血尿不能判断肾外伤严重度？
18. 如何用“稳定性—机制—空间—RUG/膀胱造影/CT—引流/介入/修补”完成最终定位？

**最低出口**：面对骑跨伤、骨盆骨折、膀胱破裂或腰腹外伤，先判稳定性，再按尿生殖膈和腹膜空间定位；知道尿道滴血避免盲目器械、RUG和膀胱造影各回答什么、稳定肾外伤为何先CT且多非手术，以及持续不稳定为什么进入探查。

---

# 15｜First-pass Question Probe

```text
来源：
TTSX Lecture-attached Questions

选择方式：
LectureQuestionBinding 自动提供

绑定范围：
外科学讲义书页 P112–113《泌外梗阻和外伤》Lecture-attached Questions
并结合 P110–111 Lecture Section 的 source-position relation

状态：
待绑定
```

不得从 U027 / U028 自行挑题冒充 Lecture-attached Questions；Question → KP / Framework 留到后续 BREAKTHROUGH。

---

# 16｜Block Production Gate

```text
Study_continuity = PASS
natural_mechanism_split = 0
repeated_first_exposure = 0
Framework_is_map = PASS
KP_natural_units = 14
prompt_leakage = PASS
Outline_total = 7
Outline_mapped = 7
unmapped = 0
missing = 0
duplicate_primary = 0
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
First_pass_question_probe = READY_PENDING_BINDING
Source_gap = none_medical
Source_boundary = TRAUMA_STABILITY_AND_TREATMENT_BOUNDARIES_EXPLICIT
Visual_gate = MANDATORY_SOURCE_LOCAL_VISUAL_REVIEW_PIXEL_AUDIT_NOT_CLAIMED
System_final_gate = NOT_RUN_B5_STILL_BLOCKED
```

---

# 17｜Block Complete 定义

```text
Framework已建立
+ 27外科精编 PDF P135–P137 已完成 Current Source 重绑定；历史 source-local Visual Gate 路由只保留兼容引用
+ 能闭卷重建稳定性门、前后尿道、腹膜内外膀胱与肾外伤空间图
+ 能说明RUG、膀胱造影、CT、持续引流、栓塞和探查各解决什么问题
+ 不再把腹膜外膀胱破裂等同于一律手术
+ 不再把“有休克/有血尿”机械映射为固定肾手术
+ KP Active Recall完成
+ Outline按需扫漏
+ TTSX Lecture-bound Question Probe完成或等待正式绑定
```

精确外渗区域、旧DRE线索和复杂重建细节进入 MI-D；只有“稳定性—受伤机制—空间定位—检查 / 处理”仍无法重建时，才先做最小修复。
