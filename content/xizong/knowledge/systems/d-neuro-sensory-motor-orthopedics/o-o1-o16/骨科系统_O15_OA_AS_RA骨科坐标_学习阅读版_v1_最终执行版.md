---
type: block_guide
schema_version: 1
content_version: 1
system: 神经—感觉—运动—骨科
system_id: neuro_sensory_motor_orthopedics
branch: orthopedics
batch_id: P33
block_id: orthopedics-o15
title: O15｜OA、AS与RA骨科坐标
order: 15
status: FINAL_EXECUTION
study_refs:
  - source_id: surgery-ai-lecture | label: 外科学讲义_AI阅读版｜5.5 非化脓性关节炎 P172–P176 | action: primary
  - source_id: hematology-h17 | label: H17｜类风湿关节炎免疫与内科主体 | action: recall_benefit
  - source_id: orthopedics-o10 | label: O10｜股骨头坏死与继发性OA接口 | action: recall_apply_benefit
  - source_id: orthopedics-o14 | label: O14｜骨关节结核与脊柱影像鉴别 | action: recall_compare_benefit
outline_units:
  - SUR-U035
outline_primary_count: 11
kp_count: 12
visual_gates:
  - surgery-p172-oa-cartilage-space-osteophyte
  - surgery-p172-heberden-bouchard-square-hand
  - surgery-p173-sacroiliac-joint-bamboo-spine
  - surgery-p173-as-ra-comparison
  - surgery-p174-oa-ra-comparison
visual_gate_status: READY_IN_PROJECT_SOURCE
source_gap_status: SOURCE_BOUNDARY_AND_CONFLICT_EXPLICIT
source_boundaries:
  - O15-SB01-RA_IMMUNE_AND_MEDICAL_BODY_RECALL_H17
  - O15-SB02-CURRENT_STUDY_SURGICAL_COORDINATES_ONLY
  - O15-SB03-NO_EXTERNAL_BIOLOGIC_OR_REHAB_ALGORITHM_EXPANSION
source_conflicts:
  - O15-SC01-RA_MORNING_STIFFNESS_THRESHOLD_INTERNAL_30_MIN_VS_SURGERY_60_MIN
first_pass_question_probe: READY_PENDING_BINDING
system_final_batch: true
---

# O15｜OA、AS与RA骨科坐标
## 三种慢性关节病不是一个“关节痛表”：先看病变从软骨、骶髂关节还是滑膜开始，再看年龄、分布、影像和功能目标
> **中心问题**：面对慢性关节痛，怎样先从软骨、骶髂关节与附着点或滑膜这个始发组织区分 OA、AS、RA，再结合年龄、分布、影像和功能目标判断？
>

> **FIRST PASS｜WHOLE_BLOCK_SOURCE**  
> `KianOS bounded orientation / attention → 一次连续完成外科 Lecture P172–176 与原图 → 返回 KianOS → O15 全部 LG retrieval + closure → Block Recall`
>
> H17、O10、O14 都是 benefit / bounded reactivation，不是 O15 hard prerequisite。若 RA 免疫主体、AVN 继发 OA 或结核鉴别尚未形成，只补当前比较所需的最小接口，不阻塞 O15 Primary Source。
>
> RA 的免疫机制、系统表现和完整内科治疗仍归 H17。本文件只建立其骨科结构、畸形、影像与 OA / AS 比较坐标，不重复 RA 全文。KP Detailed Expansion 用于 retrieval 后核对、解释、repair 与 reference，不默认要求连续二次通读。

# 1｜Framework｜先找“始发组织”，再看关节分布和力线结果

```text
OA：关节软骨退变
→ 软骨下骨硬化 / 囊变
→ 非对称间隙狭窄 + 边缘骨赘
→ 机械性疼痛、骨擦感、力线畸形

AS：骶髂关节起始的附着点炎
→ 向上脊柱、向下髋膝蔓延
→ 骶髂融合 + 竹节椎
→ 中轴僵硬、驼背和功能受限

RA：滑膜炎起始（可 Recall H17）
→ 对称小关节破坏
→ 晚期不可逆畸形
→ 骨科关注结构与功能重建
```

病例固定问：

1. 年龄和性别？
2. 中轴还是外周？大关节还是小关节？对称吗？
3. 休息更重还是负重/活动更重？晨僵多长？
4. 影像主词是骨赘、骶髂融合/竹节，还是侵蚀性小关节破坏？

# 2｜Ownership 与边界

| 内容 | 动作 | Primary / 边界 |
|---|---|---|
| 原发/继发 OA 的骨科模型 | **Primary Learn** | O15 |
| AS 的骨科结构、影像、检查与治疗层级 | **Primary Learn** | O15 |
| OA vs RA、AS vs RA 比较 | **Primary Integration** | O15 |
| RA 免疫病理、诊断标准、系统表现与完整药物 | Benefit / Recall | H17 已形成时复用；未形成只补比较所需最小 RA 坐标 |
| AVN IV期等继发OA入口 | Benefit / Recall-Apply | O10 已形成时调用；未形成不阻塞 O15 |
| 结核脊柱破坏与间隙 | Benefit / Recall-Compare | O14 已形成时调用；未形成只补必要空间对照 |
| 完整现代生物制剂、康复处方、关节置换技术 | Source Boundary | 当前 Source 不支持扩写 |

### SOURCE_CONFLICT / 待核对｜RA晨僵门槛

当前正式 Source 同时保留：

- 内科口径：多≥半小时；
- 外科口径：多≥1小时。

本文件不静默裁决。学习时记稳定语义：**RA晨僵明显而持久，显著长于典型OA的＜30分钟**；具体数字在选择题按题目学科和当前 Source 口径判断。

# 3｜KP Active Recall

<!-- kianos:kp id="orthopedics-o15-kp01" -->
## KP01｜三病总坐标：软骨—骶髂—滑膜
> **主提示：OA始于1｜AS始于1｜RA始于1｜人群3｜分布3｜功能结果**

### Detailed Expansion

最小身份：

- OA：始于关节软骨；
- AS：始于骶髂关节/附着点炎；
- RA：始于滑膜炎（Recall H17）。

典型人群与分布：

- OA：中老年，膝、髋、脊柱、DIP，常单侧为主；
- AS：男青年，中轴和大关节；
- RA：女青年/中年女性常见，腕、MCP、PIP，多发对称。

**Routing**：CORE + CONFUSABLE + MI-G

<!-- kianos:kp id="orthopedics-o15-kp02" -->
## KP02｜原发性OA：关节原来没有明确结构病，长期负重和体质使软骨先退变
> **主提示：危险2｜人群1｜部位4｜侧别｜原发vs继发**

### Detailed Expansion

当前 Study：原发性 OA 与遗传、体质及体重增加有关；好发于：

- 中老年；
- 膝；
- 髋；
- 脊柱；
- 远端指间关节；
- 多为单侧主导。

继发性 OA 则是关节本身已有问题，例如：

- 股骨头坏死IV期；
- 先天性结构异常；
- 后天关节面不平整；
- 关节不稳定。

体重超重造成负重劳损在当前题目中可作为原发性危险因素，不能机械等同于“关节本身先天已有病”。

**Routing**：CORE + CONFUSABLE + CONNECTION + MI-G

<!-- kianos:kp id="orthopedics-o15-kp03" -->
## KP03｜OA临床：机械性疼痛 + 骨擦 + 力线/手部骨性结节
> **主提示：症状2｜膝畸形1｜手3｜DIP/PIP配对｜RA手区别**

### Detailed Expansion

当前表现：

- 疼痛；
- 骨擦音 / 骨擦感；
- 膝内翻；
- 方形手；
- Heberden结节：DIP；
- Bouchard结节：PIP。

RA 的典型晚期手畸形是尺侧偏斜、天鹅颈、纽扣花，且RA通常不累及DIP。不要把“PIP结节”与“PIP炎性破坏”混成同一个结构。

**Routing**：CORE + RECOGNITION + CONFUSABLE + MI-G

<!-- kianos:kp id="orthopedics-o15-kp04" -->
## KP04｜OA影像链：软骨看不见，但间隙、软骨下骨和边缘会把退变写出来
> **主提示：始发1｜软骨下2｜间隙1特征｜边缘1｜硬碰硬链**

### Detailed Expansion

```text
关节软骨退变
→ 负重缓冲下降
→ 软骨下骨硬化与囊变
→ 关节间隙 / 椎间隙非对称狭窄
→ 边缘骨质增生形成骨赘
```

“非对称”是 OA 与部分炎性关节病比较的关键。骨赘是边缘增生，不等于恶性骨膜反应。

**Routing**：CORE + VISUAL_ONLY + MI-G

<!-- kianos:kp id="orthopedics-o15-kp05" -->
## KP05｜OA治疗：从减负与功能，到止痛润滑，再到力线和关节重建
> **主提示：非药物｜NSAID｜腔内1｜手术3｜置换门槛1**

### Detailed Expansion

当前 Study 顺序：

1. 非药物治疗；
2. NSAIDs；
3. 关节腔注射透明质酸钠；
4. 手术：
   - 关节镜清理；
   - 关节力线矫正术，如胫骨高位或腓骨近端截骨；
   - 关节明显畸形者人工关节置换。

统一目标：

```text
减轻负重与疼痛
→ 改善润滑/活动
→ 矫正错误力线
→ 必要时重建毁损关节
```

**Routing**：CORE + BOUNDARY + MI-G + MI-D

<!-- kianos:kp id="orthopedics-o15-kp06" -->
## KP06｜AS蔓延方向：从骶髂向上锁住脊柱，也可向下累及髋膝
> **主提示：始发1｜向上1｜向下2｜少累及1｜男青年｜Bechterew方向**

### Detailed Expansion

AS 的当前 Study 电影：

```text
骶髂关节附着点炎
→ 向上蔓延至脊柱
→ 可向下波及髋、膝
→ 很少累及手关节
```

男青年多见。少数病变从颈椎开始，逐渐向下波及胸腰椎，易致上肢瘫痪和呼吸困难，当前 Study 称 Bechterew 病，预后差。

**Routing**：CORE + SPECIAL + MI-G

<!-- kianos:kp id="orthopedics-o15-kp07" -->
## KP07｜AS识别：休息更重、活动减轻，骶髂关节是不能缺席的入口
> **主提示：症状节律｜体征3｜标志1｜关键影像部位｜无骶髂？**

### Detailed Expansion

典型：

- 慢性腰背痛；
- 休息后加重、活动后减轻；
- 驼背畸形；
- 4字试验；
- Schober征；
- HLA-B27。

当前 Study 强调：骶髂关节影像是诊断关键。如果骶髂关节没有问题，不应轻率考虑 AS。

**Routing**：CORE + RECOGNITION + BOUNDARY + MI-G

<!-- kianos:kp id="orthopedics-o15-kp08" -->
## KP08｜AS影像：MRI抓早期，后期从骶髂狭窄融合走向竹节椎
> **主提示：早期1｜关键1部位｜骶髂2变｜脊柱1征｜TB/OA对比**

### Detailed Expansion

- 早期：MRI；
- 关键：骶髂关节影像；
- 骶髂关节变窄、融合；
- 脊柱呈竹节椎。

对比：

- 脊柱结核：椎体破坏 + 椎间隙狭窄 + 冷脓肿；
- 脊柱 OA：边缘骨赘 + 间隙狭窄；
- AS：骶髂病变 + 竹节椎。

**Routing**：CORE + CONFUSABLE + VISUAL_ONLY + MI-G

<!-- kianos:kp id="orthopedics-o15-kp09" -->
## KP09｜AS治疗：保持功能、抗炎、改善病情，结构毁损后再手术
> **主提示：非药物｜NSAID｜DMARD｜手术2｜GC中轴无效｜外周例外**

### Detailed Expansion

当前 Study：

```text
非药物
→ NSAIDs
→ DMARDs
→ 手术：脊柱截骨矫形 / 关节置换
```

糖皮质激素对中轴关节病变无效；当前 Source 提示外周髋、膝等可有不同应用边界。不要把 RA 的糖皮质激素角色机械复制到 AS 中轴病变。

**Routing**：CORE + BOUNDARY + MI-G + MI-D

<!-- kianos:kp id="orthopedics-o15-kp10" -->
## KP10｜RA在 O15 只需要恢复哪些骨科结构坐标，哪些内容必须回 H17？
> **主提示：始发组织｜典型关节分布｜对称性｜DIP边界｜晚期结构结果｜H17所有权**

### Detailed Expansion

若 H17 已形成，可直接 Recall：

- 病变始于滑膜；
- 典型腕、MCP、PIP；
- 多发、对称；
- 可向心性累及更大关节；
- DIP最少见；
- 晚期尺侧偏斜、天鹅颈、纽扣花，且不可逆。

若 H17 尚未形成，只用上述最小结构坐标完成 O15 比较；RF、CCP、系统表现、DMARDs完整方案仍回 H17，O15 不把它们扩成新 Primary。

**Routing**：CONNECTION + RECALL + CONFUSABLE + MI-G

<!-- kianos:kp id="orthopedics-o15-kp11" -->
## KP11｜OA vs RA：机械性软骨退变对炎性滑膜破坏
> **主提示：始发｜年龄｜晨僵口径2｜部位/侧别｜手畸形｜治疗角色**

### Detailed Expansion

| 轴 | OA | RA |
|---|---|---|
| 始发 | 软骨 | 滑膜 |
| 人群 | 中老年 | 青年/中年女性常见 |
| 晨僵 | 多＜30分钟 | 明显持久；内科≥0.5h、外科≥1h冲突保留 |
| 部位 | 膝髋脊柱DIP，单侧为主 | 腕/MCP/PIP，多发对称 |
| 手 | 方形手、Heberden、Bouchard | 尺偏、天鹅颈、纽扣花 |
| 治疗主角 | NSAIDs、透明质酸、力线/置换 | NSAIDs或GC + DMARDs；骨科手术为结构出口 |

**Routing**：CORE + CONFUSABLE + SOURCE_CONFLICT + MI-G

<!-- kianos:kp id="orthopedics-o15-kp12" -->
## KP12｜AS vs RA：男青年大关节/中轴，对女青年对称小关节
> **主提示：人群｜大/小｜HLA/CCP-RF｜休息后｜对称｜GC边界**

### Detailed Expansion

| 轴 | AS | RA |
|---|---|---|
| 人群 | 男青年 | 女青年多见 |
| 关节 | 中轴/大关节，手少见 | 小关节，多发对称 |
| 标志 | HLA-B27 | CCP、RF |
| 症状节律 | 休息后加重、活动后减轻 | 晨僵明显持久 |
| 影像入口 | 骶髂融合、竹节椎 | 小关节侵蚀与畸形 |
| GC | 中轴病变无效 | 可作为当前内科治疗角色之一 |

共同：均可从非药物、NSAIDs、DMARDs进入，结构毁损后由骨科手术处理。

**Routing**：CORE + CONFUSABLE + MI-G

# 4｜Framework Reconstruction

```text
中老年 + 单侧膝/髋/DIP + 负重痛 + 骨赘
→ OA

男青年 + 慢性腰痛 + 休息重活动轻 + 骶髂病变/竹节椎
→ AS

对称腕/MCP/PIP + 持久晨僵 + 尺偏/天鹅颈/纽扣花
→ RA（完整内科模型回H17）
```

# 5｜MI-G

- OA始于软骨；AS始于骶髂；RA始于滑膜；
- OA：中老年、膝髋脊柱DIP、单侧，骨赘/非对称间隙；
- Heberden=DIP，Bouchard=PIP；
- AS：男青年、骶髂起始、休息重活动轻、HLA-B27、竹节椎；
- RA：腕/MCP/PIP、多发对称、DIP少、晚期三畸形；
- RA晨僵数字冲突显式保留：内科≥0.5h，外科≥1h；
- AS中轴病变糖皮质激素无效；
- 继发OA需先有原关节结构问题，如AVN IV期。

# 6｜MI-D

- OA手术三类；
- 透明质酸钠；
- Bechterew病方向；
- Schober征；
- AS脊柱截骨/置换；
- RA完整药物与系统表现回 H17。

# 7｜VISUAL_ONLY｜必须回 Study 原图

1. OA软骨退变、软骨下硬化/囊变、非对称间隙和骨赘；
2. 方形手、Heberden、Bouchard；
3. 骶髂关节变窄融合；
4. 竹节椎；
5. RA尺偏、天鹅颈与纽扣花；
6. OA / AS / RA对比总图。

```text
visual_gate_status = READY_IN_PROJECT_SOURCE
```

# 8｜Outline Coverage Safety Net

```text
SUR-U035 非化脓性关节炎 = 11 / 11 → O15
-------------------------------------------
O15 outline_primary_total       = 11
O15 outline_primary_mapped      = 11
unmapped                        = 0
missing                         = 0
duplicate_primary               = 0
```

RA 免疫/内科主体由 H17 保持唯一 Primary；O15 只拥有骨科坐标与比较，不重复登记 H17 Outline。

# 9｜Lecture Knowledge Routing Ledger

| Lecture范围 | 知识包 | Role | Memory | 归宿 |
|---|---|---|---|---|
| P172 | 原发/继发OA、人群部位与表现 | CORE + CONFUSABLE | MI-G | KP01–03 |
| P172 | OA影像与治疗 | CORE + VISUAL_ONLY | MI-G/MI-D | KP04–05 |
| P173 | AS蔓延、人群、Bechterew | CORE + SPECIAL | MI-G/MI-D | KP06 |
| P173 | AS临床、MRI、骶髂、竹节椎 | CORE + RECOGNITION | MI-G | KP07–08 |
| P173 | AS治疗与GC边界 | CORE + BOUNDARY | MI-G/MI-D | KP09 |
| P173–174 | RA骨科Recall | CONNECTION + RECALL | MI-G | KP10 |
| P173–174 | OA/RA、AS/RA比较 | CORE + CONFUSABLE | MI-G | KP11–12 |
| Source交叉 | RA晨僵数字差异 | SOURCE_CONFLICT + BOUNDARY | MI-G | KP11 |

```text
unrouted_lecture_knowledge = 0
```

# 10｜First-pass Question Probe

**来源：** TTSX Lecture-attached Questions  
**选择方式：** LectureQuestionBinding 自动提供  
**状态：** `READY_PENDING_BINDING`

# 11｜Block Exit

完成 O15 后，应能：

1. 用始发组织、年龄、分布和影像一次区分 OA / AS / RA；
2. 从软骨退变推导 OA 的骨赘、间隙和力线畸形；
3. 从骶髂起始推导 AS 的中轴蔓延、竹节椎和功能风险；
4. 只调用 H17 的 RA 模型，不重复免疫与完整内科治疗；
5. 显式处理 RA 晨僵数字冲突，而不是静默选一个答案。

# 12｜Block Production Gate

```text
Study_continuity = PASS
natural_mechanism_split = 0
repeated_first_exposure = 0
Framework_is_map = PASS
kp_count = 12
outline_primary_total = 11
outline_primary_mapped = 11
unmapped = 0
missing = 0
duplicate_primary = 0
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
legacy_first_pass_flow = 0
visual_gate = READY_IN_PROJECT_SOURCE
source_conflict = O15-SC01_EXPLICIT
first_pass_question_probe = READY_PENDING_BINDING
block_status = PASS_FROZEN_WITH_EXPLICIT_SOURCE_CONFLICT
```
