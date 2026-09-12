---
type: block_guide
schema_version: 1
content_version: 1
system_id: urinary
block_id: urinary-b10
title: 肾炎分支——急性、急进、IgA与慢性肾炎
order: 10
study_refs:
  - source_id: internal-medicine-lecture
    label: 内科学讲义_AI阅读版｜急性肾炎与急进性肾炎
    sequence_page_start: 160
    sequence_page_end: 162
    action: primary
  - source_id: internal-medicine-lecture
    label: 内科学讲义_AI阅读版｜IgA肾病与慢性肾炎
    sequence_page_start: 165
    sequence_page_end: 167
    action: primary
  - source_id: internal-medicine-lecture
    label: 内科学讲义_AI阅读版｜原发性肾小球疾病病例串联
    sequence_page_start: 167
    sequence_page_end: 175
    action: integration
  - source_id: urinary-b09
    label: K9｜双坐标地图
    action: recall
outline_units:
  - INT-U066
  - INT-U067
  - INT-U069
  - INT-U070
outline_primary_count: 36
kp_count: 26
prerequisites:
  - urinary-b09
next_blocks:
  - urinary-b11
  - urinary-b12
visual_gates:
  - internal-p160-acute-gn-hump-map
  - internal-p161-crescent-formation-map
  - internal-p162-rpgn-three-type-map
  - internal-p165-iga-mesangial-map
  - internal-p166-chronic-gn-map
  - internal-p168-glomerular-disease-master-table
visual_gate_status: REQUIRED_ORIGINAL_SOURCE_REVIEW
source_gap_status: SOURCE_BOUNDARY_EXPLICIT
source_boundaries:
  - K10-SB01
  - K10-SB02
  - K10-SB03
system_final_batch: false
---

# K10｜肾炎分支
## 急性—急进—IgA—慢性：都可有血尿，但时间、肾功能速度、免疫证据和病理结构完全不同

> **中心问题**：面对血尿、蛋白尿、水肿、高血压或 Cr 升高，怎样用“前驱感染时间—肾功能恶化速度—C3—LM / IF / EM—肾脏大小”区分急性肾炎、急进性肾炎、IgA肾病和慢性肾炎？
>
> **Primary Study**：内科 Lecture P160–162、P165–167及 P167–175病例串联。
>
> **Primary Outline**：U066急性/急进14题；U067急进5题；U069 IgA、慢性及病例14题；U070急进/慢性/综合治疗3题，共 **36 / 36**。
>
> **Source boundary**：保留当前 Study 的 Cr、补体、药物与治疗阈值作为 306 Source Precision；不把旧绝对阈值静默提升成 Current 通用临床规则。SLE、过敏性紫癜、ANCA血管炎和 Goodpasture 的全身模型不在本 Block展开。

---

# 0｜FIRST PASS

```text
Framework
→ Lecture P160–162 + P165–167
→ Framework Reconstruction
→ KP Active Recall
→ Outline optional / low-pressure
→ TTSX Lecture-attached Questions
→ Block Complete
```

第一轮先建四条疾病电影，不把所有治疗揉成一张无边界表。

---

# 1｜Framework

```text
血尿 / 蛋白尿 / 水肿 / 高血压
        ↓
先看时间与速度
├─ 感染后1–3周，急性肾炎综合征，C3一过性↓
│  → 急性肾炎
│
├─ 肾功能快速恶化、Cr明显升高、贫血、新月体方向
│  → 急进性肾炎
│     再分 I / II / III
│     I anti-GBM / linear
│     II immune-complex / granular
│     III pauci-immune / often ANCA-associated
│
├─ 上感后1–3天即血尿，系膜IgA优势/共优势沉积
│  → IgA肾病
│
└─ >3个月、隐匿迁延，后期双肾对称缩小
   → 慢性肾炎
```

## 四个主要比较轴

```text
前驱感染：周 vs 天
肾功能速度：一过性 vs 快速恶化 vs 长期进展
免疫证据：驼峰颗粒 / 线-颗粒-pauci-immune / 系膜IgA / 原病型终末改变
肾脏形态：大红蚤咬 / 大白 / 早期正常后期对称缩小
```

---

# 2｜Memory Routing

## MI-G

- 急性肾炎三个别名；
- β溶血性链球菌感染后1–3周；
- 大红肾、蚤咬肾、内皮+系膜增生、上皮下驼峰、颗粒IF；
- C3一过性下降，8周内恢复；
- 急性肾炎自限、对症为主、活检3指征；
- 急进性三个别名与“肾功能快速恶化”；
- 新月体形成链；
- RPGNⅠ/Ⅱ/Ⅲ：线状 / 颗粒 / pauci-immune，EM有无；
- III 型常与 ANCA 相关，但 pauci-immune 不以 ANCA 必阳性为定义；
- 血浆置换与甲泼尼龙冲击的 Source-specific 类型配对；
- IgA上感后1–3天、系膜区 IgA 优势/共优势沉积；LM常见系膜增生但并非固定唯一形态；
- 血IgA与严重度不完全相关；
- 急性GN vs IgA vs 紫癜肾炎；
- 慢性肾炎 >3个月、后期双肾对称缩小；
- 慢性肾炎治疗目标是延缓恶化，不是消灭全部尿异常。

## MI-D

- 全部剂量、疗程与禁忌；
- 各类继发疾病完整名单；
- 新月体细胞—纤维阶段细节；
- IgA五种临床表型的完整处方；
- 慢性肾炎全部限盐限水限蛋白数字；
- 原发性高血压与慢性肾炎全部鉴别细节；
- 病例串联页完整大表。

---

# 3｜急性肾炎

<!-- kianos:kp id="urinary-b10-kp01" -->
## KP01｜急性肾炎三个别名

> **主提示：3名｜临床/病理/病因各1｜细胞2**

### 快速核对

- 急性肾小球肾炎：临床身份；
- 急性弥漫性增生性肾炎 / 毛细血管内增生性肾炎：病理身份；
- 感染后性肾炎：病因时间身份。

LM主轴：内皮细胞和系膜细胞增生。

---

<!-- kianos:kp id="urinary-b10-kp02" -->
## KP02｜前驱感染：为什么要等1–3周

> **主提示：病原1｜感染部位3｜时间｜ASO意义｜感染程度≠病情**

### 快速核对

当前 Study重点是 β-溶血性链球菌等感染：

```text
上呼吸道 / 消化道 / 皮肤感染
→ 约1–3周形成免疫反应
→ 急性肾炎综合征
```

ASO升高提示近期溶血性链球菌感染；感染程度与肾炎轻重不完全相关，因为肾损伤主体是免疫反应，不是细菌直接侵入肾小球。

---

<!-- kianos:kp id="urinary-b10-kp03" -->
## KP03｜急性肾炎病理四联

> **主提示：大体2｜LM2细胞｜EM位置+形状｜IF形态**

### 快速核对

```text
大体：大红肾、蚤咬肾
LM：内皮细胞 + 系膜细胞增生
EM：上皮下驼峰状电子致密物
IF：颗粒状荧光
```

这是“临床急性肾炎综合征”与“病理毛细血管内增生性肾炎”对齐的典型模型。

---

<!-- kianos:kp id="urinary-b10-kp04" -->
## KP04｜急性肾炎为什么同时“漏”和“滤不过”

> **主提示：屏障漏2｜袢狭窄→GFR｜四表现｜贫血/Cr方向**

### 快速核对

```text
滤过屏障损伤
→ 血尿、蛋白尿、管型

内皮 / 系膜增生
→ 毛细血管袢狭窄、有效滤过面积下降
→ GFR下降
→ 少尿、水钠潴留、水肿、高血压
```

当前 Study：Cr多 `<200`，贫血多无或轻度，用于与急进性肾炎比较。

---

<!-- kianos:kp id="urinary-b10-kp05" -->
## KP05｜C3：一过性下降，8周内恢复

> **主提示：为何低｜持续多久｜恢复意义｜vs两种持续低**

### 快速核对

```text
免疫复合物激活补体
→ C3消耗下降
→ 抗原消失、自限
→ 8周内恢复
```

持续下降方向更应想到Ⅱ型RPGN或MPGN等当前 Study 接口；具体病因仍需结合 IF / EM 和临床背景。

---

<!-- kianos:kp id="urinary-b10-kp06" -->
## KP06｜急性肾炎肾活检3指征

> **主提示：急性肾炎何时肾活检｜肾功能恶化证据｜伴肾病综合征｜病程持续阈值**

### 快速核对

1. 少尿超过1周、尿量进行性减少或Cr持续升高；
2. 伴肾病综合征；
3. 病程超过8周无好转趋势。

一般典型病例可依临床判断；出现非典型或进展证据时用活检明确。

---

<!-- kianos:kp id="urinary-b10-kp07" -->
## KP07｜急性肾炎治疗：自限性 + 对症

> **主提示：治疗性质｜降压顺序2｜抗生素条件｜激素/免疫抑制2不做**

### 快速核对

- 以对症治疗为主；
- 容量依赖性高血压先利尿消肿，再按当前 Study 使用 ACEI/ARB 或 CCB；
- 无现症感染不常规用抗生素；有感染按 Source 处理；
- 不用糖皮质激素和免疫抑制剂；
- 反复扁桃体炎可在病情稳定后处理病灶。

---

<!-- kianos:kp id="urinary-b10-kp08" -->
## KP08｜急性重症出口：左心衰与高血压脑病

> **主提示：容量链｜肺水肿｜脑病｜高血压急症药1｜跨A4**

### 快速核对

```text
GFR下降 + 水钠潴留
→ 前负荷与血压上升
→ 急性左心衰 / 肺水肿
或
→ 高血压脑病
```

当前 Study 的高血压急症入口为硝普钠。完整心衰与脑病处理回循环 / 神经系统。

---

# 4｜急进性肾炎

<!-- kianos:kp id="urinary-b10-kp09" -->
## KP09｜急进性肾炎三个别名

> **主提示：临床1｜LM1｜病变细胞｜突出速度｜Cr/贫血**

### 快速核对

- 快速进行性肾炎：临床强调肾功能快速恶化；
- 毛细血管外增生性肾炎：LM强调病变在毛细血管袢外；
- 新月体性肾炎：肾小囊壁层上皮细胞增生形成新月体。

当前 Study识别：Cr常 `>200`，贫血可达中度及以上。

---

<!-- kianos:kp id="urinary-b10-kp10" -->
## KP10｜新月体形成链

> **主提示：GBM断裂｜纤维素｜2类细胞｜细胞→纤维｜压迫2结果**

### 快速核对

```text
GBM明显断裂
→ 纤维素等大量渗入肾小囊
→ 刺激壁层上皮细胞增生
+ 单核细胞渗出
→ 细胞性新月体
→ 纤维性新月体
→ 压迫毛细血管、囊内压升高
→ GFR快速下降、肾间质缺血
```

大体可进入“大白肾”方向。

---

<!-- kianos:kp id="urinary-b10-kp11" -->
## KP11｜Ⅰ型 RPGN：抗GBM、线状、预后最差

> **主提示：抗体｜原位｜IF｜EM｜继发肺肾｜治疗强化**

### 快速核对

```text
抗GBM抗体
→ 原位抗体型
→ IF连续线状
→ 当前Study：无典型电子致密物
```

继发肺出血—肾炎综合征 / Goodpasture。强化治疗以血浆置换方向最重要；完整全身模型后置免疫。

---

<!-- kianos:kp id="urinary-b10-kp12" -->
## KP12｜Ⅱ型 RPGN：免疫复合物、颗粒、最常见

> **主提示：原位/循环｜IF｜EM｜C3｜继发3**

### 快速核对

- 原位或循环免疫复合物；
- IF颗粒状；
- EM有电子致密物；
- C3可持续下降；
- 当前 Study 继发方向：SLE、过敏性紫癜、急性肾炎等；
- 是三型中最常见者。

---

<!-- kianos:kp id="urinary-b10-kp13" -->
## KP13｜Ⅲ型 RPGN：pauci-immune，常与 ANCA 相关

> **主提示：pauci-immune定义｜ANCA高价值但非必需｜无沉积2证据｜系统血管炎接口**

### 快速核对

III 型的**形态 / 免疫模式身份**是 pauci-immune crescentic GN：

```text
IF：免疫球蛋白 / 补体沉积极少或几乎没有
EM：无典型电子致密物
→ pauci-immune
```

它**常与 ANCA 相关小血管炎相连**，因此 306 看到：

```text
ANCA阳性
+ pauci-immune
+ 新月体 / 快速肾功能恶化
```

要高度匹配 III 型。但 **ANCA 阴性的 pauci-immune GN 也存在**，所以“ANCA阳性”是高价值病因证据，不是 pauci-immune 定义本身的必要条件。

当前 Study 接口继续保留：

- MPA：常见 p-ANCA 方向；
- Wegener / GPA：常见 c-ANCA 方向。

完整血管炎疾病谱、抗原特异性和治疗后置免疫系统。

---

<!-- kianos:kp id="urinary-b10-kp14" -->
## KP14｜RPGN三型总轴

> **主提示：I线无｜II颗粒有｜III少/无沉积｜最常/最差｜C3**

### 快速核对

| 型 | 核心 | IF | EM | 记忆边界 |
|---|---|---|---|---|
| I | 抗GBM | 线状 | 无典型沉积 | 预后最差 |
| II | 免疫复合物 | 颗粒 | 有 | 当前Study：最常见，C3可持续低 |
| III | pauci-immune，常与ANCA相关 | 阴性或极弱 | 无 | ANCA并非定义所必需；系统血管炎入口 |

---

<!-- kianos:kp id="urinary-b10-kp15" -->
## KP15｜RPGN强化治疗配对

> **主提示：血浆置换I/III｜肺出血首选｜甲冲II/III｜共同2药｜透析/移植边界**

### 快速核对

当前 Study 的考试配对：

- 血浆置换强化：Ⅰ、Ⅲ型；Goodpasture肺出血尤其重要；
- 甲泼尼龙冲击强化：Ⅱ、Ⅲ型；
- 强化疗法配合泼尼松 + 环磷酰胺；
- 需要时透析；
- 移植需在病情静止并满足当前 Source 条件后考虑。

> **边界**：这里保留的是当前 306 Source 的类型配对，不把它扩成所有具体病因 / 严重度下的现代一刀切方案；最终治疗仍需回具体疾病 owner。

---

<!-- kianos:kp id="urinary-b10-kp16" -->
## KP16｜“急进性综合征”与“新月体”不是绝对同义

> **主提示：临床速度｜病理形态｜可有综合征无新月体｜经典低概率方向**

### 快速核对

- 急进性肾炎综合征：临床上肾功能快速恶化；
- 新月体：病理形态。

当前 Study提示：重症急性肾炎、重症MPGN、IgA肾病等可出现急进性临床表现，但临床速度与新月体负荷不能机械画等号；MCD、膜性肾病在传统 306 识别中通常不是典型新月体 / RPGN 主体。

---

# 5｜IgA肾病

<!-- kianos:kp id="urinary-b10-kp17" -->
## KP17｜IgA身份：临床入口 + IF身份锚点，不锁死单一LM

> **主提示：两个最常｜人群｜感染后几天｜IF身份｜LM常见但可变**

### 快速核对

当前 Study 高价值入口：

- 我国最常见的肾小球疾病；
- 肾小球源性血尿最常见原因；
- 青少年多见；
- 上呼吸道感染后 **1–3天** 出现明显血尿。

最稳定的病理身份锚点不是某一个固定 LM，而是：

> **IF：系膜区 IgA 优势或共优势沉积。**

LM **常见**系膜细胞 / 基质增生，是 306 高频典型；但形态可从接近轻微改变，到系膜增生、节段硬化，重症时也可出现新月体等变化。EM 常见系膜 / 旁系膜电子致密物方向。

因此可以背：

```text
IgA肾病常见系膜增生
```

不能写成：

```text
IgA肾病 = 一个固定的“系膜增生性肾小球肾炎”LM病型
```

---

<!-- kianos:kp id="urinary-b10-kp18" -->
## KP18｜血IgA升高不是严重度尺；确证回系膜IgA

> **主提示：升高比例方向｜严重度相关？｜黏膜接口｜确诊证据**

### 快速核对

当前 Study：部分患者血 IgA 升高，但与病情严重程度不完全相关。关键仍是临床表型与肾活检 IF 中的**系膜区 IgA 优势 / 共优势沉积**；LM形态用于描述损伤模式，不单独承担 IgA 身份定义。

---

<!-- kianos:kp id="urinary-b10-kp19" -->
## KP19｜IgA五种临床表型与治疗分流

> **主提示：单纯血尿｜反复肉眼｜蛋白/高压｜肾病｜肾衰｜各动作**

### 快速核对

当前 Study分流：

1. 单纯血尿：对症、定期复查；
2. 感染后反复肉眼血尿：控制感染，慢性扁桃体炎可处理病灶；
3. 蛋白尿和/或高血压：ACEI/ARB，目标按 Source；
4. 难控蛋白尿 / 高血压：激素接口；
5. 肾病综合征：糖皮质激素为主；
6. 肾衰竭：按肾功能状态处理；
7. 靶向释放布地奈德为当前 Lecture 的新药接口。

这些是当前 306 Source 的考试分流。现代适应证、风险分层和具体免疫治疗不在本 Block静默扩写。

---

<!-- kianos:kp id="urinary-b10-kp20" -->
## KP20｜急性GN vs IgA vs 紫癜肾炎

> **主提示：感染时间3｜沉积IgG/IgA｜C3｜皮肤特征**

### 快速核对

| 轴 | 急性肾炎 | IgA肾病 | 紫癜肾炎 |
|---|---|---|---|
| 前驱感染 | 1–3周 | 1–3天 | 可1–3周 |
| 免疫沉积 | 当前Study以IgG方向 | 系膜IgA优势/共优势 | IgA方向 |
| C3 | 下降，8周内恢复 | 多正常 | 依具体继发模型 |
| 特异线索 | 急性肾炎综合征 | 反复肉眼血尿 | 双下肢对称出血点 |

---

# 6｜慢性肾炎

<!-- kianos:kp id="urinary-b10-kp21" -->
## KP21｜慢性肾炎身份：各种肾小球病的终末路径

> **主提示：3别名｜来源｜进展快慢2代表｜时间门槛**

### 快速核对

- 慢性肾小球肾炎；
- 终末性肾炎；
- 硬化性肾炎。

各种肾小球疾病可最终进入此路径。当前 Study：MPGN进展较快，膜性肾病相对较慢。临床呈慢性肾炎综合征，病程超过3个月。

---

<!-- kianos:kp id="urinary-b10-kp22" -->
## KP22｜慢性肾炎病理与B超

> **主提示：肾小球2改变｜炎细胞2｜血管1｜固缩肾｜B超早晚**

### 快速核对

```text
大量肾小球纤维化 / 玻璃样变、硬化
+ 可有肾小球集中
+ 淋巴细胞、浆细胞浸润
+ 细小动脉玻璃样变
→ 继发性颗粒性固缩肾
```

B超：

- 早期双肾体积可正常；
- 后期双肾对称缩小，当前 Study以长径 `<10 cm` 为识别值。

---

<!-- kianos:kp id="urinary-b10-kp23" -->
## KP23｜慢性肾炎高血压：容量 + RAAS + 舒血管物质减少

> **主提示：3机制｜ANP方向｜血压先后｜尿证据**

### 快速核对

1. GFR下降 → 水钠潴留 → 容量依赖；
2. 肾缺血 → 交感与RAAS激活 → 肾素依赖；
3. 肾实质受损 → PG、缓激肽等舒血管物质减少；
4. 当前 Lecture提示 ANP下降方向。

---

<!-- kianos:kp id="urinary-b10-kp24" -->
## KP24｜慢性肾炎治疗目标：Current Core 与 Study Precision 分层

> **主提示：目标2｜不追求1｜ACEI/ARB主逻辑｜旧绝对阈值只作Precision｜五限**

### 快速核对

目标：

```text
延缓肾功能恶化
+ 防止心脑血管并发症
≠ 消灭所有肾炎综合征表现
```

稳定 Current Core：

- 利尿消肿；肾功能下降时按容量和肾功能状态选择利尿策略；
- ACEI/ARB 通过降压、降低肾小球内压和减少蛋白尿保护残余肾单位；
- 启用 / 加量后关注血压、肌酐 / eGFR 与 K⁺变化；明显恶化先找低容量、NSAID、肾动脉狭窄等可逆原因；症状性低血压或难以控制的高钾等才进入减量 / 停药决策；
- 限钠、水、磷、蛋白、脂及肾毒性药物等当前 Source 支持的减负方向；
- 保证热量；
- 不把“消灭血尿/蛋白尿”当最终治疗目标。

### //MI-D｜Study Precision

旧 Lecture 的具体 BP / 尿蛋白目标、利尿 GFR 数字和 `Scr >265 μmol/L` 等 ACEI/ARB 绝对禁忌写法继续保留用于题源识别，但**不作为 Current 通用临床禁忌**。该边界继承 B7 已接受的 ACEI/ARB owner，不在 B10 建第二套规则。

---

<!-- kianos:kp id="urinary-b10-kp25" -->
## KP25｜慢性肾炎 vs 原发性高血压 vs 慢性肾盂肾炎

> **主提示：先后顺序｜年龄｜肾损害层级｜肾大小对称性｜靶器官**

### 快速核对

| 轴 | 慢性肾炎 | 原发性高血压肾损害 | 慢性肾盂肾炎 |
|---|---|---|---|
| 先后 | 肾病先，高血压后 | 高血压先 | 感染/小管间质先 |
| 人群 | 青壮年方向 | 中老年方向 | 结合感染与梗阻 |
| 早期损害 | 肾小球尿异常突出 | 浓缩功能 / 远曲小管先 | 小管浓缩先 |
| 肾形态 | 后期双肾对称缩小 | 原发性颗粒固缩肾 | 一侧或双侧不对称、瘢痕 |
| 靶器官 | 相对少，出现提示重 | 心脑眼底更突出 | 尿路感染证据 |

---

<!-- kianos:kp id="urinary-b10-kp26" -->
## KP26｜肾炎分支病例算法

> **主提示：感染时间｜Cr速度｜C3｜IF/EM｜肾大小｜治疗禁用/强化**

### 快速核对

```text
1. 是否有血尿突出
2. 前驱感染是1–3周还是1–3天
3. Cr是一过性轻度、快速恶化，还是长期进展
4. C3是一过性恢复、持续低，还是多正常
5. IF：线状 / 颗粒 / pauci-immune / 系膜IgA
6. EM：驼峰 / 有无沉积 / 系膜或旁系膜沉积
7. LM：内皮/系膜增生、新月体、节段硬化等模式
8. 肾脏：增大、大白，还是后期对称缩小
9. 治疗：
   急性对症
   急进按具体免疫/病因强化
   IgA按表型与风险
   慢性延缓进展
```

---

# 7｜Outline Coverage Safety Net

```text
INT-U066_acute_RPGN = 14
INT-U067_RPGN = 5
INT-U069_IgA_chronic_cases = 14
INT-U070_RPGN_chronic_treatment = 3
--------------------------------
outline_primary_total = 36
mapped = 36
unmapped = 0
missing = 0
duplicate_primary = 0
```

| 范围 | 题数 | Primary KP |
|---|---:|---|
| 急性肾炎身份、病理、补体、活检、治疗 | 10 | KP01–KP08 |
| RPGN三型、新月体、强化治疗 | 9 | KP09–KP16 |
| IgA肾病 | 6 | KP17–KP20 |
| 慢性肾炎 | 8 | KP21–KP25 |
| 病例与治疗综合 | 3 | KP26及相关KP |
| **合计** | **36** | **36 / 36** |

U070综合治疗题只在本 Block拥有肾炎分支的 Primary；其中肾病综合征药物配对由 K11 supporting recall，不制造 duplicate Primary。

---

# 8｜Lecture Knowledge Routing

| Lecture范围 | 路由 | 角色 |
|---|---|---|
| P160–161 急性GN | KP01–KP08 | CORE + RECOGNITION |
| P161–162 RPGN | KP09–KP16 | CORE + CONFUSABLE + VISUAL_ONLY |
| P165–166 IgA | KP17–KP20 | CORE + CONFUSABLE + ONTOLOGY_BOUNDARY |
| P166–167 慢性GN | KP21–KP25 | CORE + CONNECTION |
| P167–175病例串联 | KP20、KP25–KP26 | RECOGNITION + VISUAL_ONLY |
| 系统性免疫病完整模型 | 后续免疫 | DEFERRED_MODEL |
| 药物完整现代方案 | Source边界 | BOUNDARY |

```text
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
```

---

# 9｜Source Boundary Registry

| ID | 内容 | 处置 |
|---|---|---|
| K10-SB01 | Cr、血压、尿蛋白、移植等待期等阈值为当前 Study 口径 | 保留为考试 Precision，不自动升级为 Current 通用临床阈值 |
| K10-SB02 | GPA/Wegener命名、IgA靶向药与强化方案为当前 Lecture 口径 | 保留并标记 Source-bound |
| K10-SB03 | 慢性肾炎 ACEI/ARB 的旧绝对 Scr 禁忌与 B7 Current owner 冲突 | Current Core 继承 B7；旧数字仅 MI-D / exam Precision |
| K10-VG01 | 驼峰、新月体、双肾形态与总表需回原图 | Visual Gate Open |

---

# 10｜First-pass Question Probe

```text
来源：
TTSX Lecture-attached Questions

选择方式：
LectureQuestionBinding 自动提供

绑定范围：
内科 P167–175 与 P160–162、P165–167 的 source-position relation

状态：
待绑定
```

---

# 11｜Block Production Gate

```text
Study_continuity = PASS
Framework_is_map = PASS
KP_natural_units = 26
prompt_leakage = PASS
outline_total = 36
outline_mapped = 36
unmapped = 0
missing = 0
duplicate_primary = 0
unrouted_lecture_knowledge = 0
unsupported_expansion = 0
First_pass_question_probe = READY_PENDING_BINDING
Source_gap = SOURCE_BOUNDARY_AND_VISUAL_GATE_EXPLICIT
System_final_gate = NOT_RUN_NON_FINAL_BLOCK
```

# 12｜Block Complete

```text
Framework已建立
+ 四条疾病电影可闭卷恢复
+ 急性GN四联证据可重建
+ RPGN三型可用IF/EM区分，且知道pauci-immune不要求ANCA必阳性
+ IgA与急性GN可按感染时间区分，并以系膜IgA IF而非单一LM病型钉住身份
+ 慢性GN可用病程和双肾形态识别，治疗规则不与B7 Current owner冲突
+ KP Active Recall完成
+ Outline按需扫漏
+ Question Probe完成或等待Binding
```
