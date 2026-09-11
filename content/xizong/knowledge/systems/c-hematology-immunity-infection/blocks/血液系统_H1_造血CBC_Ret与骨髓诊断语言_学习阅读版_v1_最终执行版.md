---
type: block_guide
schema_version: 1
content_version: 1
system: 血液—免疫—感染
system_id: hematology_immunity_infection
block_id: hematology-h01
title: 造血、CBC、Ret与骨髓诊断语言
order: 1
status: FINAL_EXECUTION
study_refs:
  - source_id: physiology-lecture
    label: 生理学讲义_AI阅读版｜血液特性
    pdf_page_start: 88
    pdf_page_end: 98
    action: primary
  - source_id: internal-medicine-lecture
    label: 内科学讲义_AI阅读版｜贫血概述与外周血诊断语言
    sequence_page_start: 180
    sequence_page_end: 186
    action: diagnostic_bridge
  - source_id: biochem-m3
    label: M3｜成熟红细胞与磷酸戊糖途径
    action: recall
  - source_id: circulation-c4
    label: 循环C4｜正常止血与病理循环整合
    action: recall
outline_units:
  - PHY-U007
outline_primary_count: 42
kp_count: 13
prerequisites:
  - circulation-c4
  - respiratory-r02
  - urinary-k01
  - urinary-k04
  - biochem-m3
next_blocks:
  - hematology-h02
  - hematology-h03
  - hematology-h04
  - hematology-h05
  - hematology-h07
visual_gates:
  - physiology-p88-rbc-shape-and-raw-materials
  - physiology-p89-esr-and-osmotic-fragility
  - physiology-p90-erythropoiesis-epo-and-clearance
  - physiology-p91-p92-platelet-map-recall
  - physiology-p93-viscosity-osmotic-pressure-ph
  - hematology-cbc-ret-smear-marrow-layer-map
visual_gate_status: READY_IN_PROJECT_SOURCE_WITH_ORIGINAL_REVIEW_REQUIRED
source_gap_status: SOURCE_CONFLICT_EXPLICIT
source_conflicts:
  - H1-SC01
system_final_batch: false
---

# H1｜造血、CBC、Ret与骨髓诊断语言
## 从“骨髓工厂”到“外周读数”：以后所有血液病先用同一套坐标定位

> **中心问题**：骨髓怎样持续产生红细胞、白细胞和血小板；CBC、Ret、外周血涂片、骨髓穿刺与骨髓活检分别在观察哪一层；当某项血细胞异常时，怎样先定位“生产—成熟—释放—破坏/丢失—分布”，再进入具体疾病？
>
> **文件性质**：血液系统第一个 canonical Block。它先建立三系细胞的共同生命史和检查语言，后续 H3–H11 不再从零解释 CBC、Ret、涂片和骨髓。
>
> **Primary ownership**：生理 U007《血液特性》**42 / 42** 在本 Block 完成唯一 Primary。内科 U071–U073 的贫血总论、缺铁和巨幼细胞性贫血题目全部归 H3；本 Block只调用其最低诊断语言，避免重复 Primary。
>
> **Study boundary**：成熟红细胞糖酵解、2,3-DPG、PPP—NADPH—GSH 已在 M3 完整初见；正常血小板黏附—聚集—释放—收缩—吸附已在循环 C4 完整初见。本 Block分别做 **Recall + 血液诊断接口**，不制造第二次完整初见。

---

## 0｜第一轮固定流程

```text
Framework Orientation
→ 生理 Lecture P88–93 连续学习，P94–98题旁内容按需核对
→ Lecture Done
→ Framework Reconstruction
→ KP Active Recall
→ Outline Quick Check（可选、低压力）
→ TTSX Lecture-attached Questions
→ Block Complete
```

第一轮不是把所有正常值和形态一次背死，而是先守住五个定位动作：

```text
看哪一系异常
→ 看数量还是功能 / 形态异常
→ 看Ret是否有红系反应
→ 看外周形态是否提示成熟 / 破坏 / 克隆异常
→ 决定是否需要骨髓细胞层或结构层证据
```

---

# 1｜总 Framework

<!-- kianos:framework id="hematology-h01-framework-main" -->

```text
造血干 / 祖细胞
      ↓ 分化
红系｜粒-单核系｜淋巴系｜巨核-血小板系
      ↓ 成熟
骨髓内完成阶段性形态与功能准备
      ↓ 释放
外周血：RBC / WBC / Plt
      ↓ 执行
携氧｜防御｜维持内皮与止血
      ↓ 衰老 / 清除 / 丢失
脾-肝-骨髓巨噬系统｜血管内破坏｜出血｜组织迁移
      ↓ 反馈
低氧→HIF→EPO｜炎症→CSF/细胞因子｜损伤→血小板消耗与补充
```

同一条生命史对应五个读数层：

```text
CBC
→ 外周“有多少、平均多大、比例怎样”

Ret
→ 红系“骨髓是否正在加速交货”

外周血涂片
→ “交出来的细胞长什么样、成熟到哪一步”

骨髓穿刺
→ “工厂里有哪些细胞、各系数量与形态怎样”

骨髓活检
→ “工厂整体结构、细胞密度、纤维化与浸润怎样”
```

> **最小原则**：血细胞少，不自动等于骨髓不造；血细胞多，也不自动等于骨髓肿瘤。先用读数层级缩小故障位置。

---

# 2｜KP Active Recall

<!-- kianos:kp id="hematology-h01-kp01" -->
## KP01｜三系输出与五层读数：先问“哪一层在说话”

> **主提示：三系3任务｜生命史6步｜CBC/Ret/涂片/穿刺/活检各看哪层**

### 1｜三类外周血细胞不是三个孤立名单

| 细胞 | 主要身份 | 后续主要故障入口 |
|---|---|---|
| RBC | 携带 Hb，承担氧运输 | 贫血、溶血、失血、红细胞生成异常 |
| WBC | 先天 / 适应性防御与炎症效应 | 感染、免疫缺陷、白血病、反应性增多 |
| Plt | 维持内皮完整、参与一期止血 | 血小板减少/功能异常、出血、血栓 |

共同生命史：

```text
产生
→ 分化
→ 成熟
→ 释放
→ 执行功能
→ 衰老 / 清除
```

### 2｜五层读数不能互相替代

- **CBC**：外周数量、比例与红细胞平均指标；
- **Ret**：红系近期输出反应；
- **涂片**：大小、形状、染色、成熟度和异常细胞；
- **穿刺**：骨髓细胞组成与形态；
- **活检**：骨髓结构、总体细胞密度、纤维化或浸润。

例如：

```text
Hb↓
+ Ret↑
→ 骨髓在回应
→ 搜索丢失 / 破坏侧

Hb↓
+ Ret↓或反应不足
→ 搜索原料、EPO、干祖细胞、成熟或骨髓占位
```

（边界：具体贫血算法在 H3，溶血在 H5，再障在 H4，克隆性疾病在 H7–H11。）

**Routing**：CORE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h01-kp02" -->
## KP02｜红细胞原料与双凹圆盘：胞浆、胞核和形状是三条轴

> **主提示：Hb原料2｜成熟原料2｜核老浆幼/核幼浆老｜双凹3收益｜能量接口**

### 1｜两组“原料”分别影响不同层

```text
蛋白质 + Fe²⁺
→ 血红素 / 珠蛋白与Hb合成
→ 主要影响胞浆血红蛋白化
→ 缺铁方向：核老浆幼

叶酸 + Vit B12
→ 核苷酸 / DNA合成与细胞核成熟
→ 主要影响分裂与胞核发育
→ 缺乏方向：核幼浆老
```

本 Block只建立原料—结构入口；缺铁与巨幼的完整诊断在 H3。

### 2｜双凹圆盘不是外观装饰

双凹圆盘使红细胞：

- 表面积 / 体积比高；
- 气体交换界面大；
- 更易在狭小毛细血管和血窦中变形；
- 在相同体积下具有更大的摩擦面积，有利于悬浮稳定。

维持膜、离子梯度和正常形状需要 ATP。成熟 RBC 没有线粒体，完整供能和抗氧化路径回 M3。

**Routing**：CORE｜CONNECTION｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="hematology-h01-kp03" -->
## KP03｜变形性、ESR与渗透脆性：三个指标分别看什么

> **主提示：变形3因1主｜ESR看血浆4正2负｜脆性看RBC｜等渗≠等张｜遗传球三方向**

### 1｜可塑变形性：能否挤过狭窄空间

影响因素：

1. 几何形状，**最重要**；
2. 红细胞膜弹性；
3. 红细胞内黏滞度。

```text
双凹圆盘
→ 表/体比高
→ 易变形

衰老 / 球形化 / 膜弹性下降 / 胞内黏度升高
→ 变形性下降
→ 易滞留于脾血窦
```

### 2｜ESR：主要看血浆是否促进叠连

红细胞叠连后团块表面积 / 体积比下降，下沉更快。

| 血浆成分方向 | ESR |
|---|---|
| 球蛋白、纤维蛋白原、胆固醇↑ | 叠连↑，ESR↑ |
| 白蛋白、卵磷脂↑ | 叠连↓，ESR↓ |

交换实验说明主导因素在血浆：

```text
正常RBC + ESR快者血浆 → ESR快
ESR快者RBC + 正常血浆 → ESR趋于正常
```

Study正常接口：第一小时末约 **≤15–20 mm/h**。MM可因单克隆免疫球蛋白促进缗钱状排列而明显增快。

### 3｜渗透脆性：主要看红细胞自身的“扩容余地”

低渗液中水进入 RBC，细胞由双凹逐渐变圆并最终破裂。表面积 / 体积比低者更早达到极限，因此：

- 衰老 RBC：脆性↑；
- 遗传性球形 RBC：脆性↑。

### 4｜等渗不等于等张

1.9%尿素、5%葡萄糖可与血浆等渗，但溶质能进入细胞，改变细胞内有效渗透粒子和水分布，因此不能保证 RBC 维持正常大小。

```text
等渗：总渗透粒子数量相近
等张：不能自由跨膜的有效溶质决定细胞体积稳定
```

### 5｜遗传球的稳定方向与冲突方向

稳定部分：

```text
球形 → 表/体比↓
→ 变形性↓
→ 渗透脆性↑
```

ESR方向存在同页 Source Conflict：

- 主干串联写作“球形阻碍叠连 → ESR↓”；
- P91题旁又出现“在生理中……遗传球的血沉不变”。

因此：

```text
H1-SC01
→ 不冻结“ESR↓”或“ESR不变”为唯一答案
→ 遇到对应题目回P91原页与正式答案源核对
→ 当前只把变形性↓、脆性↑作为稳定主干
```

不得用一般医学知识静默裁决该冲突。

**Routing**：CORE｜CONFUSABLE｜SPECIAL｜VISUAL_ONLY｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h01-kp04" -->
## KP04｜EPO反馈：肾脏怎样把低氧翻译成红系增产

> **主提示：来源2主次｜触发3｜HIF链｜靶点3｜激素5方向｜炎症因子3**

### 1｜共同主链

```text
缺氧 / 贫血 / 肾血流减少
→ 肾组织氧供不足
→ HIF稳定并促进EPO基因表达
→ EPO↑
→ 骨髓红系输出↑
→ 携氧能力回升
```

### 2｜来源

- 主要：肾皮质肾小管周围间质细胞；
- 次要：肝脏。

因此双肾严重破坏可出现 EPO不足性贫血；完整 CKD贫血在泌尿系统 Recall，疾病鉴别在 H3。

### 3｜EPO不是只“让细胞多分裂”

当前 Study 强调三项：

1. **主要**抑制晚期红系祖细胞凋亡；
2. 促进红系分化、Hb等红系特异基因表达；
3. 促进网织红细胞成熟与释放。

### 4｜其它调节因子

| 因素 | 当前 Study 方向 |
|---|---|
| 雄激素 | EPO↑；可直接刺激红系祖细胞；ALA合酶/Hb合成接口 |
| 甲状腺激素、GH、儿茶酚胺 | 代谢与耗氧↑→局部低氧→EPO接口 |
| 糖皮质激素 | RBC、Plt、中性粒细胞↑；嗜酸粒、淋巴细胞↓ |
| 雌激素 | 降低红系祖细胞对EPO反应 |
| TNF、IFN、TGF-β | 抑制早期红系祖细胞增殖，进入慢性病贫血接口 |

**Routing**：CORE｜CONNECTION｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h01-kp05" -->
## KP05｜红系成熟与Ret：网织红是骨髓刚交付的“半成品”

> **主提示：成熟7站｜何时脱核｜Ret残留物｜正常值｜高/低各指哪侧**

### 1｜成熟顺序

```text
造血干细胞
→ 红系祖细胞
→ 原红细胞
→ 早幼红细胞
→ 中幼红细胞
→ 晚幼红细胞
→ 网织红细胞
→ 成熟红细胞
```

晚幼红细胞不再分裂，Hb已接近成熟水平，随后脱核形成 Ret。Ret入血后通过自噬清除残留线粒体、核糖体等细胞器，成为成熟 RBC。

### 2｜为什么Ret能反映骨髓反应

Ret是刚从骨髓释放的红系细胞，正常约占 RBC **0.5%–1.5%**。

```text
外周RBC减少
+ 骨髓反应良好
→ Ret释放增加

外周RBC减少
+ Ret没有相应增加
→ 生产 / 原料 / EPO / 成熟 / 骨髓环境侧需要优先搜索
```

（易混：Ret反映的是**红系**反应，不等于骨髓三系整体功能；具体病例还要结合贫血程度、时相和是否存在原位溶血，完整算法在 H3。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="hematology-h01-kp06" -->
## KP06｜红细胞120天后的去向：90%在单核—巨噬系统，10%在血管内

> **主提示：寿命｜90/10｜血外3地1主｜Hb拆4物｜触珠蛋白｜溢出尿**

### 1｜两条清除路线

正常 RBC平均寿命约 **120天**。

```text
约90%血管外破坏
→ 脾为主，肝 / 骨髓等单核—巨噬系统
→ Hb分解
→ 铁和氨基酸再利用
→ 胆红素进入肝胆处理

约10%血管内破坏
→ 游离Hb进入血浆
→ 与触珠蛋白结合
→ 肝摄取
```

若血管内破坏过多，游离 Hb超过触珠蛋白结合能力：

```text
游离Hb经肾小球滤过
→ 血红蛋白尿
```

后续 H5 会把“血管内 vs 血管外溶血”升级为证据组合；本处只建立正常清除基线。

**Routing**：CORE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h01-kp07" -->
## KP07｜白细胞基础身份：数量变化先分“池子移动”还是“真正增产”

> **主提示：中性2池｜肾上腺素方向｜单核→巨噬｜T/B成熟地与免疫类型｜CSF**

### 1｜中性粒细胞的两个血管池

- 循环池：随血流运行，常规 WBC计数主要反映这一部分；
- 边缘池：滚动 / 附着在小血管内皮附近。

肾上腺素可使边缘池细胞进入循环池。因此外周中性粒细胞升高不一定都意味着骨髓立即新造了大量细胞。

### 2｜单核—巨噬细胞连续谱

```text
骨髓单核细胞
→ 入血
→ 约1天后进入组织
→ 发育为巨噬细胞
```

功能包括吞噬病原和衰老细胞、分泌细胞因子、抗原加工与呈递等。

### 3｜淋巴细胞最低身份

- T细胞：胸腺成熟，细胞免疫；
- B细胞：骨髓成熟，体液免疫。

完整免疫共同语言在 H12。当前只保存血细胞来源与后续路由。

### 4｜CSF接口

巨噬细胞等可释放集落刺激因子，促进粒细胞生成。完整感染时白细胞动力学后置 H20–H26。

**Routing**：CORE｜CONFUSABLE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h01-kp08" -->
## KP08｜血小板身份：不是细胞核完整的细胞，而是巨核细胞胞质片段

> **主提示：来源1细胞｜成熟大小特殊｜清除3地｜基础任务1｜巨核/巨噬/单核别混**

### 1｜来源

```text
骨髓巨核细胞成熟
→ 胞质裂解 / 脱落
→ 形成血小板
```

血小板是胞质片段。巨核细胞成熟时体积越来越大，这是“多数血细胞成熟时越来越小”的重要反例。

### 2｜去向与功能

衰老血小板可在脾、肝、肺组织被吞噬清除。其基础任务是维持血管内皮完整，并在损伤时进入一期止血。

（易混：巨核细胞产生血小板；单核细胞进入组织变巨噬细胞；巨噬细胞负责吞噬与抗原呈递。三者名称相似、身份完全不同。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="hematology-h01-kp09" -->
## KP09｜血小板五动作Recall：识别—连桥—放大—收紧—搭凝血平台

> **主提示：5动作｜GPIb/vWF｜GPIIbIIIa/Fbg/Ca｜两时相｜颗粒3组｜血清vs血浆｜PF**

> **动作身份：Recall。** 正常止血完整初见已在循环 C4；本节为 U007 Coverage 与后续出血病诊断保留必要接口。

### 1｜五动作最小链

```text
内皮损伤、胶原暴露
→ 黏附：GPIb—vWF—胶原
→ 聚集：GPIIb/IIIa—纤维蛋白原—Ca²⁺桥接相邻血小板
→ 释放：ADP、TXA₂等放大
→ 收缩：血凝块回缩
→ 吸附：磷脂表面集中凝血因子
```

### 2｜促进与抑制

- 促进聚集：ADP、TXA₂等；
- 正常内皮抑制：PGI₂提高cAMP，NO提高cGMP。

第二聚集时相较慢、不可逆，主要依赖活化后释放的内源性 ADP、TXA₂等正反馈。

### 3｜释放物按来源分

- 临时合成：TXA₂；
- 致密体：ADP、ATP、5-HT、Ca²⁺；
- α颗粒：PF4、β血小板球蛋白等。

全部低频名单进入 MI-D。

### 4｜收缩、血清与血浆

血小板收缩蛋白作用：

```text
血凝块回缩
→ 挤出血清
→ 凝块更坚实
```

血清与血浆相比，最突出的是凝血后缺少被消耗的纤维蛋白原等凝血因子，同时可含血小板释放物。

### 5｜吸附平台

血小板表面磷脂提供局部反应面，使多种凝血因子集中，连接一期止血与凝血级联。

药物靶点只作 Recall：

- 阿司匹林 / 吲哚布芬：COX-1—TXA₂；
- 氯吡格雷 / 替格瑞洛：ADP受体；
- 阿昔单抗 / 替罗非班：GPIIb/IIIa；
- 前列环素 / 双嘧达莫：cAMP接口；
- 利多格雷：TXA₂合成酶接口。

完整止血、抗凝、纤溶和抗栓边界回循环 C4；出血性疾病在 H6。

**Routing**：CORE｜RECOGNITION｜CONNECTION｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h01-kp10" -->
## KP10｜Hct与黏度：一个是相对浓度，一个是流动阻力的重要决定因素

> **主提示：Hct定义｜主要代表谁｜全血2因1主｜血浆1因｜贫血/失血方向｜切率**

### 1｜Hct是什么

> 血细胞在全血中所占的容积百分比。

由于 RBC数量最多，Hct主要反映红细胞相对浓度，而不是单纯“红细胞总量”。

### 2｜全血与血浆黏度看不同对象

| 项目 | 当前 Study主要决定因素 |
|---|---|
| 全血黏度 | Hct为主 + 血流切率 |
| 血浆黏度 | 血浆蛋白含量 |

因此：

- 贫血可使 Hct下降；
- 急性失血后随着体液补充 / 水钠重吸收，Hct可下降；
- Hct改变会影响血液流动阻力，但完整循环后果回循环系统。

（易混：Hct是“细胞占容积的比例”，不是 Hb浓度、RBC计数或总血容量的同义词。）

**Routing**：CORE｜CONFUSABLE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h01-kp11" -->
## KP11｜晶体压、胶体压与pH：血液作为内环境还要维持水和酸碱

> **主提示：晶/胶主成分｜各维持哪边水｜pH范围｜缓冲2层｜肺/肾方向**

### 1｜两类渗透压分工

| 变量 | 主要来源 | 主要维持 |
|---|---|---|
| 血浆晶体渗透压 | 电解质，NaCl为主 | 细胞内外水分布 |
| 血浆胶体渗透压 | 血浆蛋白，白蛋白为主 | 血管内外水分布 |

Study数值接口：

- 晶体渗透压约 290–310 mmol/L；
- 胶体渗透压约 25 mmHg。

完整水肿机制在循环 / 泌尿；本处只保存血液环境身份。

### 2｜pH最低工作语言

血浆 pH约 **7.35–7.45**。

- 血浆主要缓冲对：NaHCO₃ / H₂CO₃；
- RBC缓冲接口：KHb / Hb；
- 肺：通气改变 PaCO₂；
- 肾：分泌H⁺、重吸收HCO₃⁻、NH₃ / NH₄⁺接口。

完整酸碱在泌尿 K5与呼吸系统，本 Block不重复代偿算法。

**Routing**：CORE｜BOUNDARY｜CONNECTION｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h01-kp12" -->
## KP12｜CBC—Ret—涂片—骨髓：四层证据怎样逐步缩小搜索空间

> **主提示：CBC看3类｜Ret只看哪系｜涂片看4维｜穿刺看细胞｜活检看结构｜何时升级**

### 1｜CBC：先找“哪一系、哪种方向”

```text
Hb / RBC / Hct / MCV等
→ 红系数量与平均形态

WBC总数 + 分类
→ 白细胞数量与构成

Plt
→ 血小板数量
```

CBC先提示故障分支，但不直接给出病因。

### 2｜Ret：判断红系是否正在回应

```text
贫血 + Ret相对高
→ 骨髓正在补偿
→ 丢失 / 破坏 / 治疗反应侧优先

贫血 + Ret低或不恰当地正常
→ 生产不足 / 成熟障碍侧优先
```

### 3｜涂片：看细胞“长什么样”

主要观察：

- 大小；
- 形状；
- 染色与中央淡染；
- 成熟度 / 是否出现不应在外周出现的幼稚细胞；
- 是否有缗钱状、靶形、球形、泪滴形等识别线索。

### 4｜骨髓：外周问题还是工厂问题

当出现下列情况时，骨髓证据价值上升：

- 全血细胞减少；
- 原始 / 幼稚细胞；
- 不明原因持续细胞减少或增多；
- 怀疑骨髓衰竭、病态造血、克隆占位、纤维化或浸润。

**Routing**：CORE｜RECOGNITION｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h01-kp13" -->
## KP13｜穿刺vs活检 + 最终故障树：看“工人”还是看“工厂”

> **主提示：穿刺2问｜活检3问｜干抽｜三系少4入口｜单系少4入口｜下一步Block**

### 1｜两种骨髓检查的最低分工

| 检查 | 主要回答 |
|---|---|
| 骨髓穿刺 | 细胞组成、比例、成熟和形态；像抽取“工人样本” |
| 骨髓活检 | 组织结构、总体细胞密度、纤维化、浸润；像查看“工厂建筑与布局” |

二者互补，不是简单“谁更高级”。若穿刺出现干抽或怀疑结构性病变，活检的价值增加；具体疾病指征留到 H4、H7–H11。

### 2｜最终故障树

```text
一系异常
├─ 生产 / 原料不足
├─ 成熟失败
├─ 外周破坏
├─ 丢失
└─ 分布 / 池子变化

两系或三系异常
├─ 骨髓整体衰竭
├─ 病态造血 / 克隆占位
├─ 骨髓浸润 / 纤维化
├─ 严重原料缺乏或系统性抑制
└─ 外周共同破坏 / 脾亢等
```

### 3｜进入后续 Block

- Hb下降 → H3先做 MCV × Ret；
- 三系低 + Ret低 → H4 / H7等骨髓分支；
- 黄疸 / Hb尿 + Ret高 → H5溶血；
- Plt低 / 出血 → H6；
- 原始细胞、M蛋白、淋巴结或巨脾 → H7–H11。

> H1的出口不是记住所有病名，而是能把病例送进正确的后续模型。

**Routing**：CORE｜CONNECTION｜BOUNDARY｜MI-G

---

# 3｜高密度诊断表

## 3.1 五层证据表

| 层级 | 代表工具 | 最先回答 | 不能单独回答 |
|---|---|---|---|
| 外周数量 | CBC | 哪一系高/低，红细胞平均指标 | 具体病因 |
| 新近红系输出 | Ret | 骨髓是否有红系反应 | 三系整体功能 |
| 外周形态 | 涂片 | 大小、形状、成熟、异常细胞 | 骨髓结构 |
| 骨髓细胞 | 穿刺 | 细胞比例、成熟、形态 | 全局结构与纤维化 |
| 骨髓组织 | 活检 | 细胞密度、结构、纤维、浸润 | 细胞细节的全部替代 |

## 3.2 一个病例的固定起手式

```text
1. 哪一系异常？
2. 单系还是多系？
3. 数量问题还是形态 / 功能问题？
4. 贫血时Ret是否匹配？
5. 涂片有没有方向性线索？
6. 外周证据是否足够？
7. 是否需要骨髓细胞层 / 结构层确认？
```

---

# 4｜Framework Reconstruction

完成 Lecture 后，闭卷重建：

```text
① 画出骨髓生产→成熟→释放→功能→清除→反馈主链。
② 写出RBC/WBC/Plt三系的核心任务。
③ 画CBC—Ret—涂片—穿刺—活检五层读数。
④ 用双凹圆盘解释变形性、ESR与渗透脆性的不同观察对象。
⑤ 画低氧→HIF→EPO→晚期红系祖细胞→Ret链。
⑥ 写红系成熟顺序与120天后90/10清除。
⑦ 区分中性粒循环池/边缘池、单核/巨噬、巨核/血小板。
⑧ Recall血小板五动作，但不重学完整凝血级联。
⑨ 解释Hct、全血黏度、晶体/胶体渗透压与pH各看什么。
⑩ 面对单系 / 三系异常，画第一轮故障树。
```

---

# 5｜Memory Routing

## MI-G｜第一轮必须即时掌握

1. 三系共同生命史与五层读数；
2. Hb原料 vs 核成熟原料；
3. 双凹圆盘—变形性；
4. ESR主要受血浆叠连因素影响；
5. 渗透脆性主要是RBC自身；
6. 等渗不等于等张；
7. 低氧—HIF—EPO主链及EPO主要靶点；
8. 红系成熟顺序、Ret 0.5%–1.5%；
9. RBC寿命120天、90%血管外；
10. 中性粒循环池 / 边缘池；
11. 单核—巨噬、巨核—血小板严格区分；
12. 血小板来源及五动作Recall；
13. Hct与全血黏度；
14. CBC—Ret—涂片—穿刺—活检分层；
15. 穿刺看细胞、活检看结构。

## MI-D｜进入 MarginNote 3

- ESR精确正常值与全部促/抑制因子；
- 低渗NaCl开始 / 完全溶血浓度；
- 遗传球全部辅助检查数字；
- EPO所有次级调节因子；
- 全部成熟阶段形态；
- 白细胞停留时间与低频功能；
- 血小板全部致聚剂、颗粒内容物；
- 抗血小板药物全名单；
- 血清与血浆全部差异成分；
- 晶体 / 胶体渗透压数字；
- 全部pH缓冲对；
- 骨髓细胞比例、形态和特殊染色。

---

# 6｜Study 原图门禁

必须回正式 Study / 原图核对：

1. P88 双凹圆盘、表面积 / 体积与红细胞原料；
2. P89 ESR交换实验、叠连与渗透脆性；
3. P90 EPO反馈、红系成熟与90/10清除；
4. P91 中性粒两池、单核—巨噬、巨核—血小板；
5. P91–92 血小板黏附 / 聚集 / 释放 / 收缩 / 吸附图，只作 Recall；
6. P93 Hct、黏度、晶体 / 胶体渗透压和pH图；
7. CBC、Ret、涂片与骨髓穿刺 / 活检的原始形态或结构图。

## Conflict Registry

| ID | 位置 | 内容 | 当前处置 |
|---|---|---|---|
| H1-SC01 | 生理P91 | 遗传球ESR方向出现“↓”与“不变”两种同页表述 | 不冻结唯一答案；回原页与正式答案源定点核对 |

```text
visual_source = AVAILABLE_IN_PROJECT
visual_gate = REQUIRED_ORIGINAL_REVIEW
visual_source_gap = 0
formal_source_conflict_count = 1
silent_source_correction = 0
```

---

# 7｜Outline Coverage Safety Net

## 7.1 Primary ledger

```text
outline_unit = PHY-U007
outline_total = 42
mapped = 42
unmapped = 0
missing = 0
duplicate_primary = 0
```

| U007范围 | 题数 | Primary KP |
|---|---:|---|
| 红细胞原料、特性、ESR、脆性、EPO、生成与破坏 | 22 | KP02–KP06 |
| 白细胞基础身份 | 2 | KP07 |
| 血小板来源与五动作 Recall / Coverage | 13 | KP08–KP09 |
| 血液黏度与Hct | 2 | KP10 |
| 血浆渗透压 | 1 | KP11 |
| 血浆pH | 2 | KP11 |
| **合计** | **42** | **42 / 42** |

### 7.2 Ownership说明

- 生理 U007 全量唯一 Primary在 H1；
- 生理 U008 正常止血唯一 Primary仍在循环 C4；
- H1的 P91–92 血小板内容用于 U007所有权与后续诊断 Recall，不重新抢占 U008；
- 内科 U071–U073 全量唯一 Primary在 H3，本 Block不重复计题。

学习者侧：Outline只用于快速扫漏；不要求清空42题后才能完成 Block。

---

# 8｜Lecture Knowledge Routing Audit

| Lecture范围 | 路由 | Knowledge Role | 边界 |
|---|---|---|---|
| P88 RBC原料 / 形状 | KP02 | CORE + CONNECTION | 缺铁/巨幼完整模型→H3 |
| P88–P91 变形/ESR/脆性 | KP03 | CORE + CONFUSABLE + VISUAL_ONLY | 低频数字→MI-D |
| P90 EPO与生成调节 | KP04 | CORE + CONNECTION | CKD贫血→泌尿/H3 |
| P90 红系成熟 / 破坏 | KP05–KP06 | CORE | 溶血证据→H5 |
| P91 WBC | KP07 | CORE + BOUNDARY | 完整免疫→H12 |
| P91–P92 Plt | KP08–KP09 | CORE + RECOGNITION + CONNECTION | 正常止血完整初见→循环C4 |
| P93 黏度 / Hct | KP10 | CORE + CONFUSABLE | 循环后果→循环 |
| P93 渗透压 / pH | KP11 | CORE + BOUNDARY | 水电酸碱→泌尿/呼吸 |
| 内科P180–186诊断接口 | KP01、KP12–KP13 | CONNECTION + RECOGNITION | 疾病主体→H3–H11 |
| M3 RBC代谢 | Framework / Recall | CONNECTION + DEFERRED_MODEL | 不重复完整通路 |

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
生理学讲义 P94–98《血液特性》题旁内容
并结合 P88–93 Lecture Section 的 source-position relation

状态：
待绑定
```

不得从 U007 手工选题冒充 Lecture-attached Questions；Question → KP / Framework relation留到后续 BREAKTHROUGH。

---

# 10｜Block Production Gate

```text
Study_continuity = PASS
natural_mechanism_split = 0
repeated_first_exposure = 0
Framework_is_map = PASS
KP_natural_units = 13
prompt_leakage = PASS
Outline_total = 42
Outline_mapped = 42
unmapped = 0
missing = 0
duplicate_primary = 0
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
First_pass_question_probe = READY_PENDING_BINDING
Source_gap = SOURCE_CONFLICT_EXPLICIT
formal_source_conflict_count = 1
Visual_gate = MANDATORY_ORIGINAL_SOURCE_REVIEW
System_final_gate = NOT_RUN_NON_FINAL_BATCH
```

---

# 11｜Block Complete

```text
Framework已建立
+ 生理Lecture P88–93连续学习并核对必要原图
+ 能闭卷画三系生命史和五层读数
+ 能用Ret判断红系反应方向
+ 能区分ESR、脆性、Hct、渗透压与pH观察对象，并知晓H1-SC01
+ 能Recall血小板五动作而不重复重学止血
+ KP Active Recall完成
+ Outline按需低压力扫漏
+ TTSX Lecture-attached Questions待绑定或已完成
```

**最低出口**：面对一份异常 CBC，不直接猜病名；先回答“哪一系、单系还是多系、Ret是否匹配、涂片提示什么、需不需要骨髓细胞层或结构层证据”。
