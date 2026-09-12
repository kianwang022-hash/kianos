---
type: block_guide
schema_version: 1
content_version: 1
system_id: urinary
block_id: urinary-b11
title: 肾病综合征分支——大量蛋白漏出与病理类型
order: 11
study_refs:
  - source_id: internal-medicine-lecture
    label: 内科学讲义_AI阅读版｜肾病综合征概念、并发症与治疗
    sequence_page_start: 159
    sequence_page_end: 164
    action: primary
  - source_id: internal-medicine-lecture
    label: 内科学讲义_AI阅读版｜MCD、膜性、MsPGN、MPGN与FSGS
    sequence_page_start: 163
    sequence_page_end: 165
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
  - INT-U067
  - INT-U068
  - INT-U070
outline_primary_count: 33
kp_count: 24
prerequisites:
  - urinary-b09
next_blocks:
  - urinary-b12
  - urinary-b13
visual_gates:
  - internal-p163-nephrotic-complication-map
  - internal-p164-mcd-and-membranous-map
  - internal-p165-mpgn-fsgs-map
  - internal-p168-glomerular-disease-master-table
visual_gate_status: REQUIRED_ORIGINAL_SOURCE_REVIEW
source_gap_status: SOURCE_BOUNDARY_EXPLICIT
source_boundaries:
  - K11-SB01
  - K11-SB02
  - K11-SB03
system_final_batch: false
---

# K11｜肾病综合征分支
## 大量蛋白漏出以后，低白蛋白、水肿、高脂、高凝和感染怎样形成；传统病理索引怎样与病因层分开

> **中心问题**：当滤过屏障大量漏蛋白时，怎样从四联诊断进入并发症和治疗；又怎样用年龄、血尿、补体、LM / IF / EM把 MCD、膜性与 MsPGN / MPGN / FSGS 等传统 306 病理索引分开，同时避免把损伤模式误当成唯一病因？
>
> **Primary Study**：内科 Lecture P159、P163–165及 P167–175病例串联。
>
> **Primary Outline**：U067肾病综合征11题；U068全部19题；U070病例与继发病因3题，共 **33 / 33**。
>
> **Source boundary**：糖皮质激素、抗凝阈值、免疫抑制和饮食数字均保留当前 Study 口径作为 306 Source Precision，不把传统病理标签直接升级成现代病因或治疗 owner。继发性肿瘤、SLE、乙肝、紫癜、糖尿病等完整疾病模型仍归各自系统。

---

# 0｜FIRST PASS

```text
Framework
→ Lecture P159、P163–165
→ Framework Reconstruction
→ KP Active Recall
→ Outline optional / low-pressure
→ TTSX Lecture-attached Questions
→ Block Complete
```

第一轮先掌握：

```text
四联
→ 四类并发症
→ 传统治疗/激素反应考试倾向
→ 五类病理索引的年龄—LM—IF—EM—临床坐标
→ 最后再问病因层
```

---

# 1｜Framework

```text
滤过屏障大量漏蛋白
        ↓
A｜诊断四联
大量蛋白尿
→ 低白蛋白血症
→ 明显水肿
→ 高脂血症
        ↓
B｜全身后果
有效循环量下降 / 血液浓缩
+ 抗凝蛋白丢失 / 凝血纤溶失衡
→ 血栓

免疫蛋白丢失 + 激素治疗
→ 感染

肾间质水肿 / 管型阻塞等
→ AKI
        ↓
C｜治疗分层
先定临床风险与病因 / 病理实体
→ 再使用 Source-specific 激素 / 免疫抑制考试配对
+ 降蛋白、利尿、低盐、并发症处理
        ↓
D｜传统病理索引双向识别
儿童 + LM基本正常 + 足突融合
→ MCD经典模式

中老年 + GBM增厚 / 钉突 + PLA2R
→ 膜性经典模式

系膜细胞 / 基质增生
→ MsPGN形态模式

双轨 + 内皮下/系膜改变
→ MPGN形态模式

局灶 + 节段硬化 + 足突损伤
→ FSGS形态模式
        ↓
E｜病因层
原发实体？
继发 / 适应性？
免疫复合物 / 补体异常？
遗传？
其他系统性疾病？
```

> **固定边界**：B11 的“五型”继续承担 306 病理识别价值，但不是五个同层级、互斥、单病因疾病实体。**pattern ≠ etiology**。

---

# 2｜Memory Routing

## MI-G

- 四联及两个必备阈值；
- 水肿与高脂形成机制；
- 四类并发症；
- 膜性最易血栓，肾静脉最常；
- 突发腰痛、血尿/蛋白尿加重、肾大；
- 首选B超、最佳肾静脉造影、白蛋白阈值按 Source；
- 不预防性用抗生素；
- AKI最常见于MCD；
- 当前 Study 的激素足量、缓减、维持原则作为考试 Precision；
- MCD典型激素敏感；传统“原发FSGS”相对更易激素抵抗，但 FSGS lesion 本身不自动规定治疗；
- MCD：儿童、LM基本正常、足突融合、无典型沉积、选择性蛋白尿方向；
- 膜性：中老年、GBM增厚、钉突、上皮下沉积、PLA2R、血栓；
- MsPGN：系膜增生是 LM 模式，不等于单一病因；
- MPGN：双轨是形态模式，需再结合 IF / EM 和病因；
- FSGS：局灶 + 节段 + 硬化是损伤模式，可有不同病因背景；
- 足突融合三类只是共同超微证据。

## MI-D

- 全部剂量、疗程和复治方案；
- 免疫抑制剂完整药名；
- 预防性抗凝和溶栓细节；
- MCD 60岁后小高峰；
- 膜性病理各阶段染色；
- MPGN I/II/III传统超微细节；
- FSGS五种亚型；
- 儿童青年和中老年继发病因完整口诀；
- 原发性肾病综合征传统病理总表。

---

# 3｜共同模型

<!-- kianos:kp id="urinary-b11-kp01" -->
## KP01｜四联诊断：两项必备

> **主提示：4联｜必备2｜3.5/30｜+++边界**

### 快速核对

1. 大量蛋白尿：`>3.5 g/d`，定性常 `+++`及以上；
2. 低蛋白血症：白蛋白 `<30 g/L`；
3. 明显水肿；
4. 高脂血症。

大量蛋白尿和低白蛋白血症为当前 Study 必备。仅有“水肿”或“蛋白尿”不能自动确诊。

---

<!-- kianos:kp id="urinary-b11-kp02" -->
## KP02｜蛋白漏出主链

> **主提示：屏障→尿蛋白｜肝补偿不足｜白蛋白↓｜4后果**

### 快速核对

```text
滤过屏障受损
→ 大量蛋白进入尿
→ 肝脏增加合成仍赶不上丢失与分解
→ 低白蛋白血症
→ 胶体渗透压下降、水肿
+ 肝合成脂蛋白增加
+ 高凝
+ 感染风险
```

---

<!-- kianos:kp id="urinary-b11-kp03" -->
## KP03｜肾病性水肿 vs 肾炎性水肿

> **主提示：低胶渗主｜有效量↓｜RAAS↑｜远端潴留｜vs GFR↓**

### 快速核对

肾病综合征：

```text
大量蛋白尿
→ 低白蛋白
→ 血浆胶体渗透压下降
→ 液体进入组织
→ 有效循环量下降
→ RAAS / ADH激活
→ 水钠进一步潴留
```

当前 Study另保留“原发远端肾单位水钠潴留”接口。

肾炎性水肿主要是 GFR下降导致水钠潴留。

---

<!-- kianos:kp id="urinary-b11-kp04" -->
## KP04｜高脂血症：TG分解少，胆固醇合成多且清除少

> **主提示：TG机制1｜胆固醇机制2｜肝代偿接口**

### 快速核对

- 高甘油三酯：主要与分解减少有关；
- 高胆固醇：肝合成 LDL-C 增加 + LDL 清除减少；
- 高脂不是独立偶发现象，而是蛋白丢失后肝脏代偿与脂代谢改变的一部分。

---

<!-- kianos:kp id="urinary-b11-kp05" -->
## KP05｜四类并发症：感染、蛋白脂代谢、血栓、AKI

> **主提示：4类｜不包括2个误项｜各最重要1**

### 快速核对

当前 Study固定：

1. 血栓及栓塞；
2. 蛋白质及脂代谢紊乱；
3. 感染；
4. 急性肾损伤。

不机械加入：

- 水电解质紊乱；
- 慢性肾衰竭。

---

# 4｜血栓、感染与AKI

<!-- kianos:kp id="urinary-b11-kp06" -->
## KP06｜血栓为什么发生

> **主提示：内皮｜浓缩/黏度｜凝抗纤溶｜血小板｜药物2**

### 快速核对

当前 Lecture将高凝归于：

- 血管内皮损伤；
- 有效循环量下降、血液浓缩；
- 高脂导致黏度增加；
- 凝血、抗凝、纤溶系统失衡；
- 血小板活化；
- 利尿剂与糖皮质激素加重高凝。

---

<!-- kianos:kp id="urinary-b11-kp07" -->
## KP07｜肾静脉血栓：膜性最易，肾静脉最常

> **主提示：最易病｜最常血管｜临床5｜首选/最佳｜白蛋白阈值**

### 快速核对

```text
膜性肾病最易发生血栓
肾静脉最常受累
```

提示：

- 突发腰痛 / 肋腹痛；
- 血尿或蛋白尿加重；
- 肾功能减退；
- 肾脏增大。

当前 Study：

- 首选：B超；
- 最佳：肾静脉造影；
- 白蛋白 `<20 g/L`：预防性抗凝入口。

> **边界**：以上检查与白蛋白阈值保留为 Source-specific exam Precision；实际抗凝决策不由一个白蛋白数字单独决定。

---

<!-- kianos:kp id="urinary-b11-kp08" -->
## KP08｜感染：不预防性用抗生素

> **主提示：为什么易感3｜不做1｜发生后动作｜激素边界**

### 快速核对

感染风险来自：

- 蛋白质营养不良；
- 免疫功能紊乱 / 免疫蛋白丢失；
- 糖皮质激素和免疫抑制治疗。

不常规预防性使用抗生素；一旦感染及时治疗，难控制时按当前 Study 调整激素。

---

<!-- kianos:kp id="urinary-b11-kp09" -->
## KP09｜AKI：最常见于MCD

> **主提示：最常病｜表现2｜扩容利尿反应｜机制2接口**

### 快速核对

肾病综合征可并发 **急性** 肾损伤，尤以 MCD 常见。

当前 Lecture接口：

- 少尿 / 无尿；
- 扩容、利尿可无效；
- 肾间质高度水肿压迫小管；
- 大量管型阻塞小管。

---

# 5｜治疗

<!-- kianos:kp id="urinary-b11-kp10" -->
## KP10｜激素原则：当前 Study 的考试 Precision

> **主提示：起始剂量｜8–12周｜缓减｜维持｜4周/8周判断｜不当现代通用模板**

### 快速核对

当前 Study：

- 泼尼松 `1 mg/kg/d`；
- 起始足量 `8–12周`；
- 缓慢减量；
- 长期维持约半年；
- 4周尿蛋白仍+++：继续原剂量；
- 8周仍无效：进入加用环磷酰胺等分层。

这些数字继续作为 306 题源 Precision 保留，但**不把一个统一激素模板外推到所有现代肾病综合征病因 / 病理模式**。真正治疗 owner 必须先明确具体疾病实体和病因背景。

---

<!-- kianos:kp id="urinary-b11-kp11" -->
## KP11｜传统初治配对：考试倾向 ≠ 从形态直接推出治疗

> **主提示：Study配对5类｜MCD典型敏感｜原发FSGS反应较差｜pattern不自动决定免疫抑制**

### 快速核对

当前 Study 的传统考试配对继续保留：

**初治单用激素：**

- MCD；
- MsPGN；
- FSGS。

**初治激素 + 环磷酰胺：**

- 膜性肾病；
- MPGN。

复治：当前 Lecture统一进入激素 + 环磷酰胺方向。

但 learner-canonical 必须多加一层：

```text
先明确具体疾病实体 / 病因背景
→ 再谈免疫抑制
```

高价值稳定倾向：

- **MCD 典型激素敏感**，继续作为 306 核心识别；
- 传统“原发 FSGS”比 MCD 更易激素抵抗 / 反应较差；
- **FSGS lesion 本身只是局灶+节段硬化的损伤模式**，可有原发、遗传、继发 / 适应性等背景，不能写成“看到 FSGS 病理 = 一律按原发 FSGS 激素方案”；
- MsPGN / MPGN 也先是形态模式，具体治疗必须回病因层。

因此上面的五类配对属于 **Source-specific exam Precision**，不是通用 Current 治疗算法。

---

<!-- kianos:kp id="urinary-b11-kp12" -->
## KP12｜难治与支持治疗

> **主提示：Source药物接口｜降蛋白｜盐/蛋白｜白蛋白条件｜病因优先**

### 快速核对

当前 Study列：

- 常用免疫抑制剂：环磷酰胺；
- 难治性接口：环孢素、吗替麦考酚酯；
- ACEI/ARB、SGLT2i：减少尿蛋白；
- 利尿消肿、低盐；
- 不主张高蛋白饮食；
- 严重低蛋白 + 低血容量时可少量输白蛋白。

稳定边界：支持治疗可作为共同层；免疫抑制方案则必须回具体病因 / 疾病 owner，不能仅按一个 LM pattern 推出。

---

# 6｜MCD 与膜性肾病

<!-- kianos:kp id="urinary-b11-kp13" -->
## KP13｜MCD三名字 + 三个最核心身份

> **主提示：3名｜人群｜LM｜EM｜IF｜免疫类型**

### 快速核对

- 脂性肾病；
- 足突病；
- 微小病变性肾病。

```text
儿童最常见肾病综合征
LM：肾小球基本正常；近端小管可脂质沉积
EM：足突融合 / effacement
IF：阴性
机制：足细胞功能损伤；当前Study以T细胞相关细胞免疫解释
```

---

<!-- kianos:kp id="urinary-b11-kp14" -->
## KP14｜MCD选择性蛋白尿：保留经典电荷模型，但不把它当唯一机制

> **主提示：306经典电荷模型｜Current足细胞/裂隙膜功能｜选择性蛋白尿｜典型NS**

### 快速核对

当前 Study 的经典考试模型：

```text
电荷选择性受损
+ 大小 / 机械屏障相对保留
→ 以白蛋白漏出为主
→ 选择性蛋白尿
→ 典型肾病综合征
→ 几乎无血尿和高血压
```

这条用于 306 识别继续保留；但 Current 机制边界继承 B2：**MCD 的稳定结构/功能身份是足细胞与裂隙膜屏障功能异常、足突融合**，不能把疾病机制简化成“某一个电荷分子缺失”。经典大小 / 电荷选择性是学习模型，不是唯一现代分子解释。

60岁后可出现发病小高峰，并可更常伴高血压、肾功能损害；不能把“儿童病”绝对化。

---

<!-- kianos:kp id="urinary-b11-kp15" -->
## KP15｜膜性肾病：中老年 + PLA2R + GBM增厚

> **主提示：人群｜原位抗足突｜LM4词｜EM位置｜IF｜抗体｜并发症**

### 快速核对

- 中老年最常见的肾病综合征；
- 原位免疫复合物方向；
- GBM明显增厚；
- 钉状突起、齿梳样、虫蚀样空隙；
- 上皮下电子致密物；
- 毛细血管壁颗粒状 IgG / C3；
- 足突可融合；
- PLA2R可辅助诊断、疗效与复发监测；
- 最易并发肾静脉血栓。

（边界：经典形态身份稳定；原发 / 继发与具体抗原层仍需后续病因证据。）

---

<!-- kianos:kp id="urinary-b11-kp16" -->
## KP16｜MCD vs 膜性：都有足突融合，但不是同一病

> **主提示：年龄｜LM｜IF/EM沉积｜蛋白选择性｜血栓**

### 快速核对

| 轴 | MCD | 膜性 |
|---|---|---|
| 年龄 | 儿童/青年 | 中老年 |
| LM | 肾小球基本正常 | GBM明显增厚、钉突 |
| IF | 阴性 | 颗粒状 |
| EM | 足突融合，无典型免疫沉积 | 上皮下沉积 + 足突融合 |
| 蛋白尿 | 选择性方向 | 可非选择性 |
| 特殊 | AKI常见接口 | 肾静脉血栓最突出 |

---

# 7｜系膜、双轨与硬化

<!-- kianos:kp id="urinary-b11-kp17" -->
## KP17｜MsPGN：先认系膜增生模式，再问病因

> **主提示：LM模式｜传统人群/临床｜血尿方向｜pattern≠etiology｜易混MPGN**

### 快速核对

核心 LM 模式：

- 系膜细胞增生；
- 系膜基质增多。

当前 306 Study 的传统“原发性 MsPGN”识别继续保留：青少年方向，可呈肾病综合征并常伴血尿。

但 learner-canonical 必须明确：

> **Mesangial proliferative pattern 是形态描述，不是一个单病因标签。**

同类系膜增生模式可出现在 IgA、狼疮等不同免疫性疾病背景。遇到该 LM 后要继续看 IF / EM、临床和系统性病因，不从“系膜增生”一步跳到唯一疾病。

---

<!-- kianos:kp id="urinary-b11-kp18" -->
## KP18｜MPGN：双轨是形态模式，不是唯一病因

> **主提示：双轨形成｜传统人群/临床｜C3方向｜pattern≠etiology｜三型后接KP19**

### 快速核对

传统又称膜增生性 / 系膜毛细血管性肾炎。

```text
系膜细胞和基质增生
+ 系膜插入 / 毛细血管壁重塑
→ 毛细血管壁双轨 / 双线 / 分层征
```

当前 Study 的传统考试组合：青少年方向，常呈肾病综合征并伴血尿，C3可持续下降。

但 **MPGN 首先是 LM 损伤模式**。不同免疫复合物、补体异常等机制都可以产生类似形态，因此：

```text
看到双轨
→ 先认MPGN pattern
→ 再看IF/EM与补体/病因背景
→ 才进入具体疾病实体
```

---

<!-- kianos:kp id="urinary-b11-kp19" -->
## KP19｜MPGN传统三型：保留306沉积索引，现代病因层不在这里展开

> **主提示：I内皮下+系膜｜II致密层带状｜III内+上皮下｜Source Precision**

### 快速核对

当前 Study 传统形态分型：

- Ⅰ型：最常见；系膜区 + 内皮下电子致密物；
- Ⅱ型：致密沉积物病；GBM致密层带状沉积；
- Ⅲ型：内皮下 + 上皮下沉积。

这些作为 306 LM / EM 识别索引保留。完整现代免疫复合物性 MPGN、C3 glomerulopathy 等病因重组不在当前 Source 扩写；**传统 type ≠ 唯一现代病因。**

---

<!-- kianos:kp id="urinary-b11-kp20" -->
## KP20｜FSGS：局灶+节段硬化先是损伤模式

> **主提示：两个“部分”｜LM｜EM｜临床接口｜原发/遗传/继发背景**

### 快速核对

```text
局灶
→ 少数肾小球受累（<50%）

节段
→ 单个肾小球内少数毛细血管袢受累（<50%）

硬化
→ 受累节段玻璃样变、硬化、毛细血管闭塞
```

可伴足突融合，临床可呈肾病综合征或蛋白尿。

**FSGS lesion 是损伤模式，不单独规定病因。**可有原发、遗传、继发 / 适应性等背景。当前 306 Source 中“原发 FSGS”的经典肾病综合征与激素反应倾向继续保留，但病理看到 FSGS 后仍要问病因背景。

---

<!-- kianos:kp id="urinary-b11-kp21" -->
## KP21｜足突融合三类：共同证据，不是共同病因

> **主提示：自己摸足3｜共同证据｜各自差异1｜不能反推病因**

### 快速核对

足突融合 / effacement 可见：

1. MCD；
2. 膜性肾病；
3. FSGS。

足突融合只是共同超微证据，必须再用 LM、IF、沉积、年龄和病因背景分开，不能从“足突融合”直接反推出某一个唯一疾病。

---

# 8｜病理总表与病例

<!-- kianos:kp id="urinary-b11-kp22" -->
## KP22｜传统五类病理考试索引：识别形态，不直接等于病因

> **主提示：MCD｜膜性｜MsPGN｜MPGN｜FSGS｜各1个最强识别｜pattern边界**

### 快速核对

| 传统索引 | 最强识别 | ontology 边界 |
|---|---|---|
| MCD | 儿童、LM基本正常、IF阴性、足突融合 | 经典实体相对稳定；仍可有继发背景 |
| 膜性 | 中老年、GBM增厚/钉突、上皮下沉积、PLA2R | 经典形态稳定；原发/继发需病因层 |
| MsPGN | 系膜细胞/基质增生、传统青少年/血尿方向 | 首先是系膜增生 pattern |
| MPGN | 双轨、补体/沉积位置传统索引 | 首先是 MPGN pattern，需按机制/病因再分 |
| FSGS | 局灶+节段硬化、足突融合 | 首先是损伤 pattern，可多病因 |

> 这张表用于 306 快速识别，不是“五个形态 = 五个单病因疾病”的 ontology。

---

<!-- kianos:kp id="urinary-b11-kp23" -->
## KP23｜继发性肾病综合征：年龄只用于加权，不替代病因证据

> **主提示：儿童青年组｜中老年组｜肿瘤/感染/免疫接口｜病理+病因**

### 快速核对

当前 Outline要求按年龄回忆继发病因，但当前 Block不扩成完整系统病教材。

决策：

```text
年龄 + 病史
→ 提高某类继发病因权重
→ 尿证据、血液/免疫/感染证据
→ 必要时肾穿刺明确LM/IF/EM模式
→ 再把病理模式与具体病因合并成最终诊断
```

系统性病因完整模型回对应系统。

---

<!-- kianos:kp id="urinary-b11-kp24" -->
## KP24｜K11病例算法：综合征→模式→病因→治疗

> **主提示：先四联｜并发4｜年龄/血尿/C3｜LM/IF/EM｜病因｜治疗owner**

### 快速核对

```text
1. 确认大量蛋白尿 + 低白蛋白
2. 查水肿、高脂与血栓/感染/AKI
3. 看年龄、血尿、高血压、C3
4. 肾穿刺：
   LM / IF / EM
5. 先识别病理模式：
   MCD / 膜性经典模式
   或 MsPGN / MPGN / FSGS pattern
6. 再搜病因：
   原发 / 继发 / 遗传 / 免疫复合物 / 补体等
7. 只有疾病实体 / 病因层明确后，才决定是否以及如何免疫抑制
8. 同时处理血栓、感染、AKI、容量与蛋白尿
```

---

# 9｜Outline Coverage Safety Net

```text
INT-U067_nephrotic = 11
INT-U068_nephrotic_pathology = 19
INT-U070_case_secondary = 3
--------------------------------
outline_primary_total = 33
mapped = 33
unmapped = 0
missing = 0
duplicate_primary = 0
```

| 范围 | 题数 | Primary KP |
|---|---:|---|
| 并发症、血栓检查与抗凝 | 5 | KP05–KP09 |
| 激素、免疫抑制、支持治疗 | 9 | KP10–KP12 |
| MCD | 5 | KP13–KP16 |
| 膜性 | 3 | KP15–KP16 |
| MsPGN / MPGN / FSGS | 8 | KP17–KP21 |
| 病例总表与继发病因 | 3 | KP22–KP24 |
| **合计** | **33** | **33 / 33** |

---

# 10｜Lecture Knowledge Routing

| Lecture范围 | 路由 | 角色 |
|---|---|---|
| P159诊断与水肿/高脂 | KP01–KP04 | CORE + CONFUSABLE |
| P163并发症 | KP05–KP09 | CORE + RECOGNITION |
| P163治疗 | KP10–KP12 | CORE + BOUNDARY + SOURCE_PRECISION |
| P163–164 MCD | KP13–KP16 | CORE + VISUAL_ONLY + B2_BOUNDARY |
| P164膜性 | KP15–KP16 | CORE + VISUAL_ONLY |
| P165 MsPGN / MPGN / FSGS | KP17–KP21 | CORE + CONFUSABLE + VISUAL_ONLY + ONTOLOGY_BOUNDARY |
| P167–175总表/病例 | KP22–KP24 | RECOGNITION + VISUAL_ONLY |
| 继发病完整模型 | 其他系统 | DEFERRED_MODEL |

```text
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
```

---

# 11｜Source Boundary Registry

| ID | 内容 | 处置 |
|---|---|---|
| K11-SB01 | 激素、免疫抑制、白蛋白与抗凝阈值为当前 Study 口径 | 保留为 306 exam Precision，不升级为跨病因通用治疗算法 |
| K11-SB02 | FSGS亚型、继发病因与完整现代治疗未由本段Source完整支持 | MI-D或Defer；FSGS lesion 与病因分层 |
| K11-SB03 | MCD“电荷屏障”与五型治疗配对容易覆盖上游 Current owner | 电荷模型保留为经典考试模型；MCD机制继承B2足细胞/裂隙膜；治疗先病因后方案 |
| K11-VG01 | MCD、膜性、MPGN、FSGS及总表需回原图 | Visual Gate Open |

---

# 12｜First-pass Question Probe

```text
来源：
TTSX Lecture-attached Questions

选择方式：
LectureQuestionBinding 自动提供

绑定范围：
内科 P167–175 与 P159、P163–165 的 source-position relation

状态：
待绑定
```

---

# 13｜Block Production Gate

```text
Study_continuity = PASS
Framework_is_map = PASS
KP_natural_units = 24
prompt_leakage = PASS
outline_total = 33
outline_mapped = 33
unmapped = 0
missing = 0
duplicate_primary = 0
unrouted_lecture_knowledge = 0
unsupported_expansion = 0
First_pass_question_probe = READY_PENDING_BINDING
Source_gap = SOURCE_BOUNDARY_AND_VISUAL_GATE_EXPLICIT
System_final_gate = NOT_RUN_NON_FINAL_BLOCK
```

# 14｜Block Complete

```text
Framework已建立
+ 四联及四类并发症可闭卷恢复
+ 能把Source治疗配对识别为考试Precision，而不是从LM pattern直接推出现代治疗
+ MCD/膜性经典形态可双向识别
+ MsPGN/MPGN/FSGS可识别传统306形态，同时知道pattern≠etiology
+ 能识别血栓、感染和AKI警报
+ KP Active Recall完成
+ Outline按需扫漏
+ Question Probe完成或等待Binding
```
