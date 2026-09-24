---
type: block_guide
schema_version: 1
content_version: 1
system_id: urinary
block_id: urinary-b13
title: 肾结核与泌尿系统肿瘤
order: 13
study_refs:
  - source_id: surgery-lecture
    label: 27外科精编版【带导图】｜SUR27-U18｜肾结核与泌尿系统肿瘤
    pdf_page_start: 128
    pdf_page_end: 132
    source_local_asset_start: IMAGE_PAGES/p0129.png
    source_local_asset_end: IMAGE_PAGES/p0133.png
    source_locator_semantics: source-local preprocessing assets, not physical pages in the current merged PDF
  - source_id: respiratory-r07
    label: 呼吸R7｜结核共同病理与化疗（Recall）
outline_units:
  - SUR-U026
outline_primary_count: 12
outline_recall_count: 2
kp_count: 18
prerequisites:
  - urinary-b06
  - urinary-b08
  - urinary-b12
  - respiratory-r07
next_blocks:
  - urinary-b14
visual_gates:
  - surgery-source-local-p0129-renal-tuberculosis-map
  - surgery-source-local-p0130-urinary-tumor-layer-map
  - surgery-source-local-p0131-hematuria-and-exam-map
  - surgery-source-local-p0132-tumor-comparison-map
visual_gate_status: SOURCE_ROUTE_VERIFIED_PIXEL_REVIEW_NOT_CLAIMED
source_gap_status: SOURCE_ROUTING_AND_CLINICAL_BOUNDARIES_EXPLICIT
---

# Block 13｜肾结核与泌尿系统肿瘤
## 学习阅读版 v1｜最终执行版

> **中心问题**：慢性膀胱刺激症、血尿、腰痛、肾区肿块、精索静脉曲张或排尿异常出现时，怎样先按“感染性慢性破坏 vs 肿瘤性占位”分流，再用器官位置、血尿方式、影像、内镜与病理证据完成定位和治疗大方向？
>
> **文件性质**：泌尿系统第十三个 canonical Block。它第一次完整建立肾结核的器官特异模型，以及肾癌、上尿路癌、膀胱癌和前列腺癌的器官特异诊疗框架。
>
> **Primary Study**：`27外科精编版【带导图】.pdf` SUR27-U18，PDF P128–P132《泌外感染和肿瘤》。该单元实际主体为肾结核与泌尿肿瘤，不把细菌性尿路感染重复并入本 Block。历史 `IMAGE_PAGES/p0129.png`–`p0133.png` 只作为兼容 asset id；Current 物理页以 P128–P132 为准。
>
> **Primary Outline**：外科 U026 共14题；其中“分肾功能的三个检查”和“尿三杯”已在 K6 完成唯一 Primary，本 Block只 Recall / Apply。其余 **12 / 12** 为本 Block Primary，`duplicate_primary = 0`。
>
> **第一轮流程**：Framework → 外科 Lecture连续学习与 Source-local Visual Gate → Framework Reconstruction → KP Active Recall → Outline optional / low-pressure → TTSX Lecture-attached Questions → Block Complete。
>
> **Source boundary**：保留当前 Study 对传统病理名称、检查“首选/最佳/金标准”、分期、术式与抗结核疗程的 306 考试口径，但 Current Core 不把这些压缩表升级成跨情境绝对规则。稳定主线是：器官定位 → 风险/分期 → 合适的影像/内镜/病理证据 → 再决定器官保留、切除或系统治疗方向。

---

# 0｜这个 Block 的统一入口：持续血尿是“慢性破坏”还是“肿块出血”

泌尿系统的感染、结核与肿瘤都可能出现尿频、尿急、尿痛、血尿、梗阻和肾积水，但它们不是同一条疾病链。

先按两条主路分流：

```text
A｜肾结核
既往结核背景 / 青壮年
→ 肾内慢性结核性破坏
→ 肾盏肾盂虫蚀样空洞、变形
→ 沿输尿管向下累及膀胱
→ 慢性、进行性膀胱刺激症
→ 血尿常在刺激症之后出现
→ 瘢痕收缩、狭窄、肾自截

B｜泌尿系统肿瘤
肾 / 肾盂-输尿管 / 膀胱 / 前列腺发生肿块
→ 出血、梗阻、癌栓或转移
→ 典型入口多为无痛性肉眼血尿
→ 再按器官位置、血块形态、内镜、影像、标志物和病理定位
→ 风险/分期决定器官保留、切除、放疗或系统治疗大方向
```

> **固定判断顺序**：先判“慢性刺激症先出现，还是无痛血尿先出现” → 再判肾、上尿路、膀胱或前列腺 → 再按临床问题选择 B超 / CT或CTU / MRI / IVU / 内镜 → 最后用微生物学或病理证据确证并决定治疗。

---

# 1｜总 Framework

<!-- kianos:framework id="urinary-b13-framework-main" -->

```text
① 先把结核共同病理压缩Recall
   R7已Primary：肉芽肿、干酪坏死、慢性化、播散
   本Block只学习肾—输尿管—膀胱器官路径
   [KP01]
        ↓
② 肾结核按“来源—向下蔓延—瘢痕收缩”连续学习
   肺结核背景 → 单侧肾病变
   → 膀胱刺激症 → 血尿
   → 影像破坏 + 微生物学确证
   → 医疗为主，按破坏/功能决定重建或切除
   [KP02–KP05]
        ↓
③ 遇到血尿先进入器官定位
   无痛全程肉眼血尿优先警惕肿瘤
   血块、输尿管口喷血、精索静脉曲张、DRE硬结各指向不同器官
   [KP06–KP07]
        ↓
④ 四类肿瘤分别建立独立模型
   肾癌：透明细胞 + 肿块/癌栓
   上尿路尿路上皮癌：条状血块/输尿管口喷血
   膀胱尿路上皮癌：Ta/Tis/T1与肌层边界
   前列腺癌：腺癌 + PSA/DRE/MRI + 风险分层
   [KP08–KP14]
        ↓
⑤ 检查按“临床任务”分层
   筛查/初评、局部定位/分期、组织学确证不是一个层级
   [KP15–KP16]
        ↓
⑥ 最后做血尿与四肿瘤比较
   K6尿三杯只Recall
   完整肿瘤共同语言继续Defer
   [KP17–KP18]
```

## 一张器官定位图

```text
肾实质
├─ 肾结核：慢性刺激症 + 破坏性影像 + 结核微生物学
└─ 肾癌：透明细胞癌 + 肿块 / 癌栓 / 不消失的同侧精索静脉曲张

肾盂—输尿管
└─ 上尿路尿路上皮癌（传统：移行细胞癌）：条状血块 + 膀胱镜见输尿管口喷血

膀胱
└─ 尿路上皮癌（传统：移行细胞癌）：凝血块；Ta/Tis/T1属于NMIBC层，T2进入肌层

前列腺
└─ 前列腺腺癌：外周带背景 + PSA/DRE + MRI/活检 + 风险/分期
```

---

# 2｜Ownership 与动作边界

| 内容 | 本 Block动作 | 边界 |
|---|---|---|
| 结核共同病理、原发/继发与化疗共同语言 | **Recall** | R7已完成 Primary |
| 肾结核器官路径、检查、治疗 | **Primary Learn** | 精确现代耐药方案不扩写 |
| 慢性膀胱刺激征与细菌性 UTI | **Recall / Apply** | K8已完成 UTI 主体 |
| 尿液证据、分肾功能、尿三杯 | **Recall / Apply** | K6已完成唯一 Primary |
| 肾癌、上尿路癌、膀胱癌、前列腺癌 | **Primary Learn** | 器官特异模型在此完成 |
| 前列腺BPH | **Recall / Discriminate** | K12已完成 BPH 主体 |
| 旧“首选/最佳/金标准”与固定疗程/术式 | **Source Precision / Boundary** | 不作为跨情境通用临床算法 |
| 完整肿瘤总论与分子肿瘤学 | **Defer** | 后续 O9 / G1–G5 + 病理 U019 |
| 全部 TNM、现代系统治疗与药物更新 | **Defer / MI-D** | 不扩成肿瘤指南课 |

---

# 3｜肾结核：病在肾，症状却常从膀胱开始

<!-- kianos:kp id="urinary-b13-kp01" -->

## KP01｜结核共同病理如何落到肾—输尿管—膀胱

> **主提示：** 共同结核病理4词｜肾→输尿管→膀胱3段｜各段结构后果

### 快速核对

结核共同病理基础：

```text
结核感染
→ 肉芽肿 / 干酪样坏死
→ 慢性破坏与纤维化
→ 可形成空洞、狭窄或播散
```

泌尿器官链：

```text
肾内病变
→ 输尿管受累与瘢痕狭窄
→ 膀胱结核和挛缩
```

---

<!-- kianos:kp id="urinary-b13-kp02" -->

## KP02｜肾结核总链：肺结核背景，单侧肾慢性破坏，再向下累及尿路

> **讲义定位 →** 外科 Lecture P104；source-local asset p0129。  
> **主提示**：来源1｜人群2｜单/双侧｜肾→输尿管→膀胱｜慢性破坏2后果。

Study 口径：

- 多继发于肺结核；
- 青壮年男性多见；
- 多累及单侧肾；
- 病变可由肾向输尿管、膀胱发展；
- 结核破坏缓慢，随后纤维收缩和狭窄逐渐形成。

```text
肺结核背景 / 结核播散接口
→ 单侧肾组织慢性破坏
→ 肾盏肾盂受累
→ 输尿管结核、瘢痕狭窄
→ 膀胱结核
→ 膀胱容量与排尿功能受损
```

（易混：肾结核病变主体在肾，但患者主诉常先突出下尿路刺激症。）

---

<!-- kianos:kp id="urinary-b13-kp03" -->

## KP03｜“病变在肾，表现在膀胱”：慢性刺激症先行，血尿常随后出现

> **讲义定位 →** 外科 Lecture P104；Recall K8。  
> **主提示**：症状时序｜刺激症3｜血尿先后｜疼痛为何不突出｜急性膀胱炎对比。

典型链：

```text
肾结核向下累及输尿管和膀胱
→ 慢性尿频、尿急、尿痛
→ 症状进行性加重
→ 血尿常在膀胱刺激症之后出现
```

Study 旁注解释肾区疼痛可不突出：感觉神经主要在肾包膜，而肾结核多先破坏肾盂肾盏、一般较少首先累及包膜。

与 K8 急性膀胱炎的最小区别：

| 轴 | 肾结核 | 急性膀胱炎 |
|---|---|---|
| 时间 | 慢性、进行性 | 急性起病 |
| 背景 | 结核病史 / 结核线索 | 细菌性下尿路感染入口 |
| 血尿 | 常在刺激症后出现 | 可伴终末血尿 |
| 普通抗菌药 | 不能据此获得典型有效反应 | 细菌性模型中有效 |

---

<!-- kianos:kp id="urinary-b13-kp04" -->

## KP04｜肾结核证据：微生物学定身份，影像定位置与破坏范围

> **讲义定位 →** 外科 Lecture P104、P106；source-local assets p0129/p0131。  
> **主提示**：培养/PCR｜影像看什么｜IVU Source角色｜肾自截链｜分肾功能。

### Current 稳定证据层

```text
持续非特异泌尿症状 + 结核背景
→ 尿抗酸杆菌培养等微生物学参考标准
+ 适当PCR检测接口
+ 影像评估位置、梗阻和破坏范围
```

### Study 影像识别

IVU / IVP 可见：

- 虫蚀样空洞；
- 肾盏、肾盂变形；
- 肾自截。

肾自截可理解为：

```text
慢性结核破坏 + 广泛钙化
+ 输尿管瘢痕狭窄 / 闭锁
→ 患肾不再正常排泄、显影
```

### //MI-D｜Source-specific exam Precision

- Lecture 把 IVU / IVP 写成“决定治疗不可缺少”的检查；
- Lecture 把尿结核杆菌培养写成“金标准”。

保留用于题源识别，但 Current 不用一个旧影像标签替代微生物学 + 现代横断面影像 + 功能评估的组合。

分肾功能的核素肾图、CTU、IVU / IVP 已在 K6 Primary，此处只调用。

---

<!-- kianos:kp id="urinary-b13-kp05" -->

## KP05｜肾结核治疗：医疗为主，手术按破坏、梗阻与功能个体化

> **讲义定位 →** 外科 Lecture P104；source-local asset p0129。  
> **主提示**：Current六个月主轴｜手术按结构/功能｜旧6–9月与术前后疗程Precision｜重建接口。

### Current 稳定主轴

新诊断泌尿生殖系统结核以**规范抗结核药物治疗为第一线**；对药敏结核，稳定学习锚点是标准**6个月**方案。手术 / 重建要根据：

- 破坏范围；
- 梗阻与狭窄；
- 患肾是否无功能 / 严重毁损；
- 膀胱挛缩及尿路重建需要；
- 耐药与治疗反应等背景；

个体化决定，不由一个时间数字单独触发。

### //MI-D｜306 Source Precision

当前 Lecture 仍需识别：

- 抗结核 **6–9个月无效**；
- 肾盏破坏严重；
- 患肾无功能；
- 术前抗结核 >2周；
- 术后继续抗结核3–6个月；
- 膀胱结核痊愈后按尿道狭窄 / 膀胱挛缩选择尿流改道或扩大术。

这些作为历史考试口径保留，不作为 Current 唯一手术门槛。

---

# 4｜血尿先定位：不是所有血尿都来自同一个器官

<!-- kianos:kp id="urinary-b13-kp06" -->

## KP06｜泌尿肿瘤共同入口：无痛性肉眼全程血尿

> **讲义定位 →** 外科 Lecture P105–106；Recall K6。  
> **主提示**：4字入口｜概率4级｜血尿量≠严重度｜疼痛出现2接口｜肾小球病边界。

Study 的考试入口：

> **无痛性全程肉眼血尿，首先警惕泌尿系统恶性肿瘤。**

血尿出现概率排序（Source Precision）：

```text
膀胱癌
> 上尿路癌（肾盂、输尿管）
> 肾癌
> 前列腺癌
```

边界：

- 肾癌只有波及肾盂肾盏时才容易明显血尿；
- 前列腺癌好发外周带，血尿不是最典型早期入口；
- 肿瘤梗阻、肾积水或继发感染后可出现腰痛、尿频尿痛；
- 血尿量与病变严重度不能机械等同；
- 肾小球肾炎也可血尿，但其尿沉渣与肾小球证据走 K6 / K9–K11 路径。

---

<!-- kianos:kp id="urinary-b13-kp07" -->

## KP07｜四个器官的识别线索：肿块、条状血块、凝血块、DRE硬结

> **讲义定位 →** 外科 Lecture P105–106。  
> **主提示**：肾癌2体征｜上尿路2线索｜膀胱2线索｜前列腺3线索｜血块2型。

| 器官 | 当前 Study 识别线索 |
|---|---|
| 肾癌 | 腹部肿块；同侧精索静脉曲张且平卧不消失，提示肾静脉 / 下腔静脉癌栓 |
| 上尿路癌 | 条状血块；膀胱镜下输尿管口喷血 |
| 膀胱癌 | 凝血块；早期可无膀胱刺激症，晚期肿瘤坏死或继发感染后出现 |
| 前列腺癌 | 直肠指检硬结；PSA主轴；酸性磷酸酶和成骨性骨转移为历史考试接口 |

（特殊：Study 强调右侧精索静脉曲张且平卧不消失尤其需要警惕肾静脉 / 下腔静脉癌栓，因为原发性精索静脉曲张更常见于左侧。）

---

# 5｜肾癌：肾实质肿块与静脉癌栓

<!-- kianos:kp id="urinary-b13-kp08" -->

## KP08｜肾癌身份：透明细胞癌多见，增强CT主导诊断/分期；穿刺有适应场景

> **讲义定位 →** 外科 Lecture P105；source-local asset p0130。  
> **主提示**：病理1｜肿块/癌栓｜血尿条件｜增强CT｜穿刺不是人人必需。

当前 Study 识别：

- 肾细胞癌又称肾癌 / 肾腺癌；
- 透明细胞癌多见；
- 可出现腹部肿块；
- 同侧精索静脉曲张且平卧不消失，提示肾静脉或下腔静脉癌栓；
- 肿瘤波及肾盂肾盏时可出现血尿。

Current 检查主轴：

```text
肾占位
→ 多期增强CT进行诊断与分期
→ MRI在静脉癌栓、造影禁忌或CT不确定时补充
→ 肾肿瘤穿刺只在会改变决策的选择性场景使用
```

例如主动监测候选、消融前、无既往病理而准备系统治疗、影像不确定等。**若无论活检结果都计划手术，并非人人必须术前穿刺。**

---

<!-- kianos:kp id="urinary-b13-kp09" -->

## KP09｜肾癌治疗大边界：部分切除或根治性肾切除

> **讲义定位 →** 外科 Lecture P105。  
> **主提示**：2术式｜肾单位保留方向｜不扩写项3。

Study 当前列出：

- 肾部分切除术；
- 根治性肾切除术。

第一轮稳定：

> 局限性肾实质肿瘤的外科治疗围绕“能否安全肾单位保留”与肿瘤范围选择部分或根治性切除。

//MI-D｜具体肿瘤大小阈值、复杂分期、靶向 / 免疫治疗和转移性肾癌路径不在当前 Source 范围内，不自行补写。

---

# 6｜上尿路癌：同一尿路上皮，先影像/尿细胞学，再决定是否输尿管镜

<!-- kianos:kp id="urinary-b13-kp10" -->

## KP10｜上尿路尿路上皮癌：传统“移行细胞癌” + 条状血块 + CTU主轴

> **讲义定位 →** 外科 Lecture P105；source-local asset p0130。  
> **主提示**：范围2器官｜术语新旧｜血块1｜镜下1｜CTU｜URS情境｜根治术Source口径。

上尿路癌包括：

- 肾盂癌；
- 输尿管癌。

术语：

> **Current：尿路上皮癌（urothelial carcinoma, UC）**；`移行细胞癌` 是当前 306 Source 中的历史同义称呼，保留用于识别，不另建一个疾病实体。

Study 主链：

```text
上尿路尿路上皮来源
→ 上尿路出血
→ 条状血块
→ 膀胱镜可见患侧输尿管口喷血
```

Current 诊断层：

```text
CTU + 尿细胞学 / 膀胱镜排查
→ 若仍不能完成诊断或风险分层
→ 诊断性输尿管镜 ± 靶向活检
```

因此输尿管镜活检不是“所有病例必须先做的独立金标准”，而是高价值确证/风险分层工具。

### //MI-D｜Source治疗口径

传统根治范围：

```text
患侧肾
+ 全长输尿管
+ 输尿管开口部膀胱壁
```

这是高危 UTUC 的经典根治性肾输尿管切除框架；Current 还存在风险分层后的肾单位保留路径，不在本 Block扩写。

---

# 7｜膀胱癌：Ta、Tis、T1不能混，是否进入肌层仍是关键分层

<!-- kianos:kp id="urinary-b13-kp11" -->

## KP11｜膀胱癌身份：尿路上皮癌为主；传统“移行细胞癌”是旧同义词

> **讲义定位 →** 外科 Lecture P105；source-local asset p0130。  
> **主提示**：术语｜血块｜刺激症时相｜典型入口｜诊断主轴。

当前稳定：

- **尿路上皮癌**是膀胱恶性肿瘤最主要的病理类型；
- 当前 306 Source 使用“移行细胞癌”这一传统同义称呼；
- 膀胱容量大，出血可形成凝血块；
- 典型入口是无痛性肉眼血尿；
- 早期可无膀胱刺激症，晚期肿瘤坏死或继发感染后可出现尿频、尿急、尿痛。

诊断主轴：

```text
血尿 / 可疑膀胱病变
→ 膀胱镜观察
→ TURBT / 活检获得病理和肌层信息
```

MRI 是**局部分期**工具之一，不能替代膀胱镜 / TURBT 的组织学诊断身份。

---

<!-- kianos:kp id="urinary-b13-kp12" -->

## KP12｜膀胱癌分层：Ta ≠ Tis；NMIBC 与肌层浸润边界

> **讲义定位 →** 外科 Lecture P105；source-local asset p0130。  
> **主提示**：Ta/Tis/T1/T2｜NMIBC3类｜TURBT｜BCG Source接口｜肌层后大边界。

正确分层：

| 分期 | 含义 |
|---|---|
| **Ta** | 非浸润性乳头状癌（non-invasive papillary carcinoma） |
| **Tis** | 原位癌 / 平坦型高等级病变（carcinoma in situ） |
| **T1** | 侵犯黏膜下 / 固有层，即 subepithelial connective tissue |
| **T2** | 侵犯逼尿肌 / 肌层 |
| T3–T4 | 超出肌层进入膀胱周围或邻近结构 |

> **真错误修正：Ta 不是原位癌。Tis 才是 CIS。**

Ta / T1 / Tis 统称 **NMIBC** 是治疗管理分组，不代表三者病理含义相同。

### NMIBC 主轴

- TURBT 获得完整病理、分期并切除可见肿瘤；
- BCG 是高危 NMIBC / CIS 的重要膀胱内免疫治疗接口；
- 具体风险分层、二次电切、BCG维持等后置肿瘤 owner。

### 肌层浸润大边界

进入 T2 及以上后，治疗进入根治性膀胱切除 / 放化疗膀胱保留等更高层决策。当前 Source 的“根治切除 + 尿流改道”继续作为 306 高价值主干，但不扩写完整现代多学科方案。

---

# 8｜前列腺癌：外周带腺癌，PSA/DRE进入，MRI/活检完成风险分层

<!-- kianos:kp id="urinary-b13-kp13" -->

## KP13｜前列腺癌识别：腺癌、外周带、PSA + DRE；酸性磷酸酶降为旧Precision

> **讲义定位 →** 外科 Lecture P106；Recall K12。  
> **主提示**：病理1｜带区1｜PSA/DRE｜MRI/活检｜酸性磷酸酶旧口径｜骨转移影像情境。

与 K12 BPH 的最小对比：

| 轴 | BPH | 前列腺癌 |
|---|---|---|
| 好发带区 | 移行带 | 外周带 |
| DRE | 增大，中间沟变浅或消失 | 可触及硬结 |
| 主体 | 良性出口梗阻 | 腺癌 |

Current 诊断主轴：

```text
PSA / DRE 提示风险
→ 风险计算与前列腺MRI
→ 可疑病灶时MRI靶向/系统性取样活检
→ ISUP grade + PSA + 临床分期完成风险分层
```

### //MI-D｜Source-specific exam Precision

- 酸性磷酸酶↑；
- 成骨性骨转移时碱性磷酸酶↑；
- “DRE首选”“MRI最佳”“ECT骨转移首选”等旧标签继续用于题源识别，但不作为所有现代患者的固定检查顺序。

高风险/局部进展病例的转移筛查可用 PSMA PET/CT（可及条件下）或经典横断面影像 + 骨显像；低风险患者不需要机械全套骨扫描。

---

<!-- kianos:kp id="urinary-b13-kp14" -->

## KP14｜前列腺癌治疗：不要用“是否突破包膜”一个开关决定全部方案

> **讲义定位 →** 外科 Lecture P106。  
> **主提示**：Source二分法｜Current风险/分期/寿命｜手术/放疗/ADT｜与BPH手术易混。

### Current 稳定主轴

前列腺癌治疗由：

```text
PSA + ISUP grade + 临床/影像分期
+ 预期寿命 / 合并症 / 患者偏好
→ 风险分层
→ 主动监测 / 根治性前列腺切除 / 放疗
   ± 不同强度和时长的ADT / 其他系统治疗
```

因此“突破前列腺包膜”不是从手术瞬间切换到“只能抗雄+去势”的唯一开关；局限性和局部进展性疾病都可能有多模式根治路径。

### //MI-D｜306 Source Precision

当前 Lecture 的传统二分仍需识别：

```text
癌局限于前列腺
→ 根治性前列腺切除术

癌突破前列腺
→ 抗雄激素药 + 去势治疗接口
```

这张表用于考试压缩，不作为 Current 全部治疗算法。

（易混：K12 的 TURP / TUIP / EEP 用于 BPH 出口梗阻；它们不是前列腺癌根治治疗的同一术式身份。）

---

# 9｜检查层级：先问任务，再选检查

<!-- kianos:kp id="urinary-b13-kp15" -->

## KP15｜旧“首选 / 最佳”表完整保留，但 Current 必须情境化

> **讲义定位 →** 外科 Lecture P106；source-local asset p0131。  
> **主提示**：Source表｜Current任务层｜不能把MRI/ECT/穿刺写成万能最佳。

### //MI-D｜当前 Study 检查表

| 临床任务 | Study 标签 |
|---|---|
| 泌外感染和肿瘤首选 | B超 |
| 肾癌 | 增强CT最佳 |
| 上尿路癌 | CTU最佳 |
| 膀胱癌 / 前列腺癌 | MRI最佳 |
| 怀疑前列腺癌骨转移 | ECT首选 |
| 决定肾结核治疗 | IVP / IVU不可缺少 |

### Current Core｜按任务分层

```text
肾占位诊断/分期
→ 多期增强CT主轴

上尿路尿路上皮癌
→ CTU + 细胞学；必要时URS/活检

膀胱癌诊断
→ 膀胱镜/TURBT病理
局部分期需要时
→ MRI可提供肌层/局部信息

前列腺癌
→ PSA/DRE风险入口 → pre-biopsy MRI → 风险适配活检
转移分期
→ 依风险/症状选择PSMA PET/CT或经典CT+骨显像

GUTB
→ 微生物学 + 影像评估破坏/梗阻
```

所以“首选、最佳、金标准”必须先说明**回答哪个临床问题**。

---

<!-- kianos:kp id="urinary-b13-kp16" -->

## KP16｜确证：结核靠微生物学；肿瘤靠病理，但取材不是人人同一路径

> **讲义定位 →** 外科 Lecture P106。  
> **主提示**：结核微生物学｜膀胱TURBT｜UTUC URS情境｜RCC选择性穿刺｜前列腺MRI导向活检。

### 肾结核

- 尿抗酸杆菌培养仍是微生物学参考标准之一；
- PCR 可作为高价值辅助；
- 影像用于位置、破坏和梗阻评估。

### 肿瘤组织学

- 膀胱癌：膀胱镜 / TURBT 获得病理；
- 上尿路癌：CTU + 细胞学后，诊断/风险仍不足时用输尿管镜 ± 活检；
- 肾癌：影像高度典型且计划手术时不要求人人术前穿刺；选择性场景再做肾肿瘤活检；
- 前列腺癌：MRI风险定位后行靶向 ± 系统取样活检。

### K6 Recall

分肾功能知识仍调用 K6 owner，不在本 Block重建第二套。

---

# 10｜两个最终鉴别图

<!-- kianos:kp id="urinary-b13-kp17" -->

## KP17｜尿三杯只 Recall，再把血尿方式挂回疾病

> **讲义回看 →** K6；外科 Lecture P106“尿三杯”。  
> **主提示**：初始1位置｜终末1位置｜全程2主体｜结核2方式｜肿瘤4字。

K6 已完成尿三杯唯一 Primary，本 Block只调用：

```text
初始血尿 → 前尿道
终末血尿 → 膀胱出口 / 膀胱相关病变
全程血尿 → 上尿路或出血量大的泌尿肿瘤
```

应用：

- 泌尿恶性肿瘤：典型无痛性肉眼全程血尿；
- 膀胱癌：可表现全程血尿，部分情境可见终末血尿；
- 肾 / 膀胱结核：典型终末血尿伴刺激症，少数肾结核可全程肉眼血尿；
- 前尿道损伤：初始血尿，主体在 K14。

（边界：不要把“尿三杯”单独当成病理确诊；它只是空间定位入口。）

---

<!-- kianos:kp id="urinary-b13-kp18" -->

## KP18｜病例反向算法：血尿—刺激症—血块—器官—任务—确证

> **讲义定位 →** 外科 Lecture P104–107综合。  
> **主提示**：先问5件｜结核支路｜肿瘤4器官｜检查按任务｜治疗按风险/分期。

面对病例，按以下顺序：

```text
1. 血尿痛不痛、肉眼还是镜下、初始/终末/全程？
2. 膀胱刺激症是急性、慢性进行性，还是肿瘤晚期才出现？
3. 有无结核病史、普通抗菌药反应、同侧不消失的精索静脉曲张？
4. 血块是条状还是凝血块？DRE是中间沟消失还是硬结？
5. 当前任务是什么？
   找肾占位 / 上尿路 / 膀胱 / 前列腺 / 结核破坏？
6. 按任务选增强CT / CTU / 膀胱镜-TURBT / MRI-活检 / 微生物学。
7. 结核先规范药物治疗，再按破坏和功能决定重建/切除；肿瘤按器官、风险和分期决定器官保留、切除、放疗或系统治疗方向。
```

---

# 11｜Memory Routing

## 11.1 MI-G｜第一轮必须即时掌握

- 肾结核：慢性膀胱刺激症，血尿常在其后；破坏性影像；微生物学确证；规范药物治疗优先。
- 无痛性肉眼全程血尿首先警惕泌尿系统恶性肿瘤。
- 肾癌：透明细胞癌、肿块、同侧不消失精索静脉曲张 / 癌栓；增强CT主轴。
- 上尿路尿路上皮癌：传统移行细胞癌、条状血块、输尿管口喷血、CTU + 必要时URS。
- 膀胱癌：Ta非浸润乳头状、Tis原位癌、T1固有层、T2肌层；膀胱镜/TURBT诊断。
- 前列腺癌：外周带腺癌、PSA/DRE → MRI/活检风险分层；治疗不是单一包膜开关。
- 检查分层：先问“诊断、局部分期、转移分期还是病理确证”。

## 11.2 MI-D｜进入延迟记忆流

- 肾结核 6–9个月无效、术前 >2周、术后3–6个月等历史精确时段；
- 膀胱重建与尿流改道术式名称；
- “移行细胞癌”历史术语；
- Source 的 B超/CTU/MRI/ECT/IVU 首选/最佳表；
- 酸性磷酸酶与经典骨扫描口径；
- 前列腺癌“局限手术/突破去势”传统二分；
- 全部现代 TNM、系统治疗和药物细节。

---

# 12｜原图 / Source-local Asset 门禁

| Visual Gate | 必须回看的内容 | 状态 |
|---|---|---|
| source-local `p0129` | 肾结核器官路径、虫蚀样空洞、肾自截、传统治疗分流 | ROUTE VERIFIED |
| source-local `p0130` | 四类肿瘤位置、膀胱壁层次、Ta/Tis/T1/T2关系 | ROUTE VERIFIED |
| source-local `p0131` | 检查层级、尿三杯与血尿位置图 | ROUTE VERIFIED |
| source-local `p0132` | 四种泌尿肿瘤比较图与病例识别入口 | ROUTE VERIFIED |

> 这些编号来自历史 `外科学讲义_AI阅读版.md` preprocessing / IMAGE_PAGES 兼容路由，**不等于当前合并 PDF 的物理页码**。本批已验证 source route，但当前工具未成功渲染每一张原图，因此这里不声称 pixel-level visual audit。学习时仍须按 route 回原图。

---

# 13｜Outline Coverage Safety Net

## 13.1 Primary Coverage｜SUR-U026

| U026 原题身份 | 题数 | Primary KP |
|---|---:|---|
| 肾结核临床表现 | 1 | KP02–KP03 |
| 肾结核检查与影像 | 1 | KP04 |
| 肾结核治疗 | 1 | KP05 |
| 四类泌尿恶性肿瘤一般特点 | 1 | KP06–KP14 |
| 四肿瘤血尿概率排序 | 1 | KP06 |
| 肾癌、上尿路癌治疗 | 1 | KP09–KP10 |
| 膀胱癌分期与治疗 | 1 | KP11–KP12 |
| 前列腺癌检查、标志物、骨转移酶 | 1 | KP13 |
| 前列腺癌治疗 | 1 | KP14 |
| 结核 / 肿瘤确证 | 1 | KP16 |
| 肾结核治疗不可缺少检查（Source） | 1 | KP04、KP15 |
| 各器官首选 / 最佳影像（Source） | 1 | KP15 |
| **Primary 合计** | **12** | **12 / 12** |

## 13.2 Explicit Recall｜不重复 Primary

| U026 原题身份 | 题数 | Canonical Primary | 本 Block动作 |
|---|---:|---|---|
| 分肾功能三个检查 | 1 | K6 | KP16 Recall / Apply |
| 尿三杯与血尿定位 | 1 | K6 | KP17 Recall / Apply |

```text
outline_primary_total = 12
outline_primary_mapped = 12
explicit_recall = 2
unmapped = 0
missing = 0
duplicate_primary = 0
```

---

# 14｜Lecture Knowledge Routing Ledger

| Lecture 知识身份 | Knowledge Role | Memory Route | 落点 |
|---|---|---|---|
| 肾结核来源、人群、单侧性与向下蔓延 | CORE | MI-G | KP01–KP03 |
| 慢性刺激症、血尿时序与包膜疼痛旁注 | CORE + CONFUSABLE | MI-G | KP03 |
| IVU破坏征、培养与传统治疗分流 | CORE + SOURCE_PRECISION | MI-G+MI-D | KP04–KP05 |
| 肾结核 vs 慢性肾盂肾炎 | CONFUSABLE | MI-G | KP03 |
| 四肿瘤血尿概率与器官线索 | CORE + DISCRIMINATION | MI-G | KP06–KP07 |
| 肾癌、上尿路癌、膀胱癌、前列腺癌独立模型 | CORE + BOUNDARY | MI-G | KP08–KP14 |
| Ta/Tis/T1/T2 | CORE / FACTUAL_CORRECTION | MI-G | KP12 |
| 旧移行细胞癌、酸性磷酸酶等 | SOURCE_PRECISION | MI-D | KP10–KP15 |
| 检查首选/最佳表 | SOURCE_PRECISION + CONFUSABLE | MI-D | KP15–KP16 |
| 分肾功能与尿三杯 | CONNECTION + RECALL | MI-G | KP16–KP17；Primary在K6 |
| 完整肿瘤分子学、全部TNM和现代系统治疗 | DEFERRED_MODEL + BOUNDARY | MI-D | 后续O9 / G1–G5 |
| 讲义重复口诀、重复解释 | REDUNDANT_EXPOSITION | — | 不重复入正文 |

```text
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
```

---

# 15｜Framework Reconstruction

读完 Lecture 后，不看正文，用下面六个节点重建：

```text
① 肾结核：来源—向下蔓延—慢性刺激症—微生物学+影像—医疗为主/按功能重建
② 血尿：痛/不痛—初始/终末/全程—血块—器官位置
③ 肾癌：透明细胞—肿块/癌栓—增强CT—部分/根治切除
④ 上尿路UC：条状血块/喷血—CTU+细胞学—必要时URS—按风险器官保留/根治
⑤ 膀胱UC：Ta≠Tis—T1固有层—T2肌层—TURBT病理→NMIBC/MIBC分流
⑥ 前列腺癌：外周带—PSA/DRE—MRI/活检—风险/分期→多模式治疗
```

能闭卷恢复六节点及主要检查层级，即完成本 Block Framework Reconstruction。

---

# 16｜First-pass Question Probe

**来源：**  
TTSX Lecture-attached Questions

**选择方式：**  
LectureQuestionBinding 自动提供

**状态：**  
**待绑定**

> 本文件没有从 Outline 猜题，也没有提前创建 Question → KP / Framework 语义关系。

---

# 17｜Block Complete

本 Block 第一轮完成标准：

```text
Framework已定位
→ 外科Lecture P104–107及source-local asset完整学习
→ 能闭卷重建肾结核器官链与四类肿瘤模型
→ 能正确区分Ta/Tis/T1/T2
→ 能从血尿、血块、肿块、DRE和临床任务选择检查层级
→ 知道旧首选/最佳、固定疗程和前列腺癌二分表属于Source Precision
→ KP Active Recall完成
→ Outline按需要低压力扫漏
→ TTSX Lecture-attached Questions待绑定或已完成
→ MI-G掌握、MI-D归位
```

```text
block_production_gate = PASS
source_routing_boundary = EXPLICIT
clinical_source_precision_boundary = EXPLICIT
outline_primary_coverage = 12 / 12
explicit_recall = 2
unrouted_lecture_knowledge = 0
canonical_freeze_ready = YES_AFTER_AUDIT_CLOSURE
```
