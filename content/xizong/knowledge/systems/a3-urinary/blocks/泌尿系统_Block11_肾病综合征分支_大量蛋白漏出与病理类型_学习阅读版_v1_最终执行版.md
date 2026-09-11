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
system_final_batch: false
---

# K11｜肾病综合征分支
## 大量蛋白漏出以后，低白蛋白、水肿、高脂、高凝和感染怎样形成；五类原发病理怎样双向识别

> **中心问题**：当滤过屏障大量漏蛋白时，怎样从四联诊断进入并发症和治疗；又怎样用年龄、血尿、补体、LM / IF / EM把 MCD、膜性、系膜增生、MPGN与FSGS分开？
>
> **Primary Study**：内科 Lecture P159、P163–165及 P167–175病例串联。
>
> **Primary Outline**：U067肾病综合征11题；U068全部19题；U070病例与继发病因3题，共 **33 / 33**。
>
> **Source boundary**：糖皮质激素、抗凝阈值、免疫抑制和饮食数字均保留当前 Study 口径，不以外部指南静默更新。继发性肿瘤、SLE、乙肝、紫癜、糖尿病等完整疾病模型仍归各自系统。

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
→ 激素反应分层
→ 五类病理的年龄—LM—IF—EM—临床坐标
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
激素足量—减量—维持
→ 看敏感 / 依赖 / 抵抗
→ 必要时免疫抑制
+ 降蛋白、利尿、低盐、并发症处理
        ↓
D｜病理类型双向识别
儿童 + LM基本正常 + 足突融合
→ MCD

中老年 + GBM增厚 / 钉突 + PLA2R
→ 膜性

青少年 + 系膜细胞 / 基质增生 + 血尿
→ MsPGN

青少年 + 双轨 + C3持续低
→ MPGN

局灶 + 节段硬化 + 足突融合
→ FSGS
```

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
- 激素足量、缓减、维持；
- 初治单激素三类 vs 激素+环磷酰胺两类；
- MCD：儿童、LM基本正常、足突融合、无沉积、选择性蛋白尿；
- 膜性：中老年、GBM增厚、钉突、上皮下沉积、PLA2R、血栓；
- MsPGN：系膜增生、青少年、肾病综合征但几乎伴血尿；
- MPGN：双轨、三型沉积、C3持续低；
- FSGS：局灶 + 节段 + 硬化；
- 足突融合三类。

## MI-D

- 全部剂量、疗程和复治方案；
- 免疫抑制剂完整药名；
- 预防性抗凝和溶栓细节；
- MCD 60岁后小高峰；
- 膜性病理各阶段染色；
- MPGN I/II/III全部超微细节；
- FSGS五种亚型；
- 儿童青年和中老年继发病因完整口诀；
- 原发性肾病综合征病理总表。

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

阈值与方法保持 Source-bound。

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
## KP10｜激素原则：足量—缓减—长期维持

> **主提示：起始剂量｜8–12周｜缓减原因｜维持半年｜4周/8周判断**

### 快速核对

当前 Study：

- 泼尼松 `1 mg/kg/d`；
- 起始足量 `8–12周`；
- 缓慢减量；
- 长期维持约半年；
- 4周尿蛋白仍+++：继续原剂量；
- 8周仍无效：进入加用环磷酰胺等分层。

不得用外部指南替换本批考试口径。

---

<!-- kianos:kp id="urinary-b11-kp11" -->
## KP11｜初治：单激素3类 vs 激素+环磷酰胺2类

> **主提示：自己吸激3｜依赖/抵抗2｜复治统一1**

### 快速核对

当前 Study：

**初治单用激素：**

- MCD；
- MsPGN；
- FSGS。

**初治激素 + 环磷酰胺：**

- 膜性肾病；
- MPGN。

复治：当前 Lecture统一进入激素 + 环磷酰胺方向。

---

<!-- kianos:kp id="urinary-b11-kp12" -->
## KP12｜难治与支持治疗

> **主提示：常用免疫抑制1｜替代2｜降蛋白3｜盐/蛋白｜白蛋白条件**

### 快速核对

- 常用免疫抑制剂：环磷酰胺；
- 难治性接口：环孢素、吗替麦考酚酯；
- ACEI/ARB、SGLT2i：减少尿蛋白；
- 利尿消肿、低盐；
- 不主张高蛋白饮食；
- 严重低蛋白 + 低血容量时可少量输白蛋白。

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
EM：足突融合消失
IF：阴性
机制：T细胞相关细胞免疫
```

---

<!-- kianos:kp id="urinary-b11-kp14" -->
## KP14｜MCD为什么是选择性蛋白尿、几乎无血尿

> **主提示：电荷vs机械｜漏出蛋白｜血尿/高压｜典型NS**

### 快速核对

当前 Study：

```text
电荷屏障受损
+ 机械屏障相对保留
→ 以白蛋白漏出为主
→ 选择性蛋白尿
→ 典型肾病综合征
→ 几乎无血尿和高血压
```

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
| EM | 足突融合，无沉积 | 上皮下沉积 + 足突融合 |
| 蛋白尿 | 选择性方向 | 可非选择性 |
| 特殊 | AKI常见接口 | 肾静脉血栓最突出 |

---

# 7｜系膜、双轨与硬化

<!-- kianos:kp id="urinary-b11-kp17" -->
## KP17｜MsPGN：系膜细胞与基质增生

> **主提示：人群｜LM2｜临床主型｜血尿方向｜易混MPGN**

### 快速核对

- 系膜细胞和系膜基质增生；
- 青少年常见；
- 主要可呈肾病综合征；
- 几乎伴血尿。

它的重点是“系膜增生”；不等于 MPGN 的“系膜插入GBM—内皮之间形成双轨”。

---

<!-- kianos:kp id="urinary-b11-kp18" -->
## KP18｜MPGN：系膜插入造成双轨

> **主提示：2名｜双轨形成｜人群/临床｜C3｜三型位置**

### 快速核对

又称膜增生性肾炎。

```text
系膜细胞和基质增生
+ 插入GBM与内皮之间
→ 原有GBM + 新基膜样物质
→ 双轨 / 双线 / 分层征
```

青少年多见，常呈肾病综合征并几乎伴血尿，C3持续下降。

---

<!-- kianos:kp id="urinary-b11-kp19" -->
## KP19｜MPGN三型沉积位置

> **主提示：I内皮下+系膜｜II致密层带状｜III内+上皮下｜最常/别名**

### 快速核对

- Ⅰ型：最常见；系膜区 + 内皮下电子致密物；
- Ⅱ型：致密沉积物病；GBM致密层带状沉积；
- Ⅲ型：内皮下 + 上皮下沉积。

完整现代C3肾小球病不在当前 Source扩写。

---

<!-- kianos:kp id="urinary-b11-kp20" -->
## KP20｜FSGS：两个“部分”不能混

> **主提示：FSGS两个“部分”分别指什么｜LM｜EM｜临床接口**

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

---

<!-- kianos:kp id="urinary-b11-kp21" -->
## KP21｜足突融合三类

> **主提示：自己摸足3｜共同证据｜各自差异1**

### 快速核对

足突融合可见：

1. MCD；
2. 膜性肾病；
3. FSGS。

足突融合只是共同超微证据，必须再用 LM、IF、沉积与年龄分开。

---

# 8｜病理总表与病例

<!-- kianos:kp id="urinary-b11-kp22" -->
## KP22｜五类原发肾病综合征总表

> **主提示：MCD｜膜性｜MsPGN｜MPGN｜FSGS｜各1个最强识别**

### 快速核对

| 类型 | 最强识别 |
|---|---|
| MCD | 儿童、LM基本正常、IF阴性、足突融合 |
| 膜性 | 中老年、GBM增厚/钉突、上皮下沉积、PLA2R |
| MsPGN | 系膜细胞/基质增生、青少年、血尿常见 |
| MPGN | 双轨、C3持续低、沉积位置分型 |
| FSGS | 局灶+节段硬化、足突融合 |

---

<!-- kianos:kp id="urinary-b11-kp23" -->
## KP23｜继发性肾病综合征：年龄只用于加权，不替代活检

> **主提示：儿童青年组｜中老年组｜肿瘤/感染/免疫接口｜金标准**

### 快速核对

当前 Outline要求按年龄回忆继发病因，但当前 Block不扩成完整系统病教材。

决策：

```text
年龄 + 病史
→ 提高某类继发病因权重
→ 仍需尿证据、血液/免疫/感染证据
→ 必要时肾穿刺明确病理
```

系统性病因完整模型回对应系统。

---

<!-- kianos:kp id="urinary-b11-kp24" -->
## KP24｜K11病例算法

> **主提示：先四联｜再并发4｜年龄/血尿/C3｜LM/IF/EM｜激素反应｜继发入口**

### 快速核对

```text
1. 确认大量蛋白尿 + 低白蛋白
2. 查水肿、高脂与血栓/感染/AKI
3. 看年龄、血尿、高血压、C3
4. 肾穿刺：
   LM / IF / EM
5. 病理分流：
   MCD / 膜性 / MsPGN / MPGN / FSGS
6. 看初治激素反应
7. 搜索继发病因
8. 处理并发症和降蛋白
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
| P163治疗 | KP10–KP12 | CORE + BOUNDARY |
| P163–164 MCD | KP13–KP16 | CORE + VISUAL_ONLY |
| P164膜性 | KP15–KP16 | CORE + VISUAL_ONLY |
| P165 MsPGN / MPGN / FSGS | KP17–KP21 | CORE + CONFUSABLE + VISUAL_ONLY |
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
| K11-SB01 | 激素、免疫抑制、白蛋白与抗凝阈值为当前 Study 口径 | 保留，不外部更新 |
| K11-SB02 | FSGS亚型、继发病因与完整现代治疗未由本段Source完整支持 | MI-D或Defer |
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
+ 激素反应分层可恢复
+ MCD/膜性/MsPGN/MPGN/FSGS可双向识别
+ 能识别血栓、感染和AKI警报
+ KP Active Recall完成
+ Outline按需扫漏
+ Question Probe完成或等待Binding
```
