---
type: block_guide
schema_version: 1
content_version: 1
system_id: urinary
block_id: urinary-b07
title: AKI、CKD与透析
order: 7
study_refs:
  - source_id: internal-medicine-lecture
    label: 内科学讲义｜肾衰竭
    page_start: 151
    page_end: 156
outline_units:
  - INT-U063
  - INT-U064
outline_primary_count: 23
kp_count: 20
prerequisites:
  - urinary-b01
  - urinary-b02
  - urinary-b03
  - urinary-b04
  - urinary-b05
  - urinary-b06
next_blocks:
  - urinary-b09
  - urinary-b10
  - urinary-b11
  - urinary-b12
source_gap_ids:
  - urinary-b07-sg01
visual_gate_status: PENDING_ORIGINAL_SOURCE_PAGE
---

# Block 7｜AKI、CKD与透析
## 学习阅读版 v1｜最终执行版

> **中心问题**：肾功能突然下降和长期下降如何区分；AKI 的第一故障究竟在灌注、肾实质还是尿路出口；CKD 为什么会同时出现贫血、骨病、水电酸碱紊乱和心血管并发症；什么时候必须从保守处理升级到透析？
>
> **文件性质**：泌尿系统第七个 canonical Block。K1–K6 已经建立肾血流、GFR、小管、浓缩、水电酸碱和尿液证据语言，本 Block 第一次把这些正常变量放进“功能失败的时间轴”。
>
> **Primary Study**：`内科学讲义_AI阅读版.md` P151–156《肾衰竭》。正文主读取 P151–154；P155–156 为 Lecture-attached Questions，保留给后续 `LectureQuestionBinding`，不在本文件自行挑题。
>
> **Primary Outline**：内科 U063 15题 + U064 8题 = **23 / 23**。
>
> **第一轮流程**：Framework → Lecture P151–154 连续学习 → Framework Reconstruction → KP Active Recall → Outline optional / low-pressure → TTSX Lecture-attached Questions → Block Complete。
>
> **Source boundary**：严格保留当前 Study 对 AKI / CKD 分期、ACEI / ARB、透析阈值和治疗的考试口径，不用外部指南静默更新。P153“CKD分期 + 血Cr”原页的机器可读布局无法安全恢复每个血Cr阈值与5个 CKD stage 的一一对应，已登记 `urinary-b07-sg01`，GFR 分期按正文可明确读取的 Study 值保留，血Cr行必须回原图后再冻结精确列对应。

---

# 0｜这个 Block 到底解决什么

K1–K6 已经把肾脏正常运行拆成：

```text
灌注
→ 滤过
→ 分段重吸收 / 分泌
→ 浓缩 / 稀释
→ 水、电解质、酸碱
→ 尿液证据与总 / 分肾功能
```

K7 反过来问：

```text
如果肾功能下降
→ 是血没到肾？
→ 是肾小管 / 间质等肾实质坏了？
→ 还是尿排不出去、压力顶回来？

如果是急性的
→ 当前处于起始、维持还是恢复？
→ 哪些电解质 / 容量问题会先致命？

如果是慢性的
→ 哪些毒素和内分泌功能长期累积失衡？
→ 为什么出现贫血、出血、骨病、心衰和神经症状？

如果保守处理已经不够
→ 哪些门槛必须透析？
```

因此本 Block 的核心不是背两张“肾衰表”，而是建立：

> **时间轴 × 第一故障层 × 全身后果 × 升级治疗门槛。**

---

# 1｜总 Framework

<!-- kianos:framework id="urinary-b07-framework-main" -->

```text
① 先判急性还是慢性
   时间 / 肾大小 / 长期并发症
   [KP01]
        ↓
② AKI先定位第一故障
   肾前：灌注↓
   肾性：肾实质损伤
   肾后：尿路梗阻→囊内压↑
   [KP02]
        ↓
③ 肾前 vs 缺血性ATN
   看肾脏有没有能力“保Na、浓缩尿”
   [KP03]
        ↓
④ AKI看时间相位
   起始 → 进展/维持 → 恢复/多尿
   危险从高K/水中毒切换为低K/感染
   [KP04–KP05]
        ↓
⑤ 确认AKI
   Scr 48h / 7d + 尿量6h
   → GFR / Ccr / 肾图
   → 肾性病因不明才活检
   [KP06–KP07]
        ↓
⑥ CKD看“长期清除失败 + 内分泌失败”
   毒素累积
   + EPO↓
   + 活性VitD↓
   + 水Na/K/H+排泄失败
   [KP08–KP12]
        ↓
⑦ 急慢性鉴别 + CKD分期
   肾大小 / 特殊不缩小疾病 / GFR stage
   [KP13–KP14]
        ↓
⑧ 延缓进展 + 管理内环境
   ACEI/ARB / BP目标
   水Na/P/蛋白/药物限制
   [KP15–KP16]
        ↓
⑨ 透析升级
   K / pH / Cr-BUN / 严重尿毒症 / 肺水肿
   → IHD / CRRT / PD边界
   → 透析并发症
   [KP17–KP19]
        ↓
⑩ 最终病例决策
   急慢性 → 第一故障 → 危急值 → 可逆原因 → 透析门槛
   [KP20]
```

## 一条总电影

```text
急性灌注下降 / 肾实质损伤 / 尿路梗阻
→ GFR突然下降
→ 小管处理、浓缩和排泄能力下降
→ 水、K+、H+、含氮代谢产物等快速堆积
→ 少尿期可因高K和水中毒致命
→ 病因解除、肾小管再生后进入多尿恢复
→ 此时反而易低K和感染

若肾单位长期、不可逆减少
→ GFR持续下降
→ 毒素长期蓄积 + EPO不足 + 钙三醇不足
→ 消化、心血管、血液、神经、骨代谢多系统表现
→ 保护残余肾单位 + 控制水电酸碱和营养
→ 超过保守治疗安全边界时进入透析
```

---

# 2｜Ownership 与动作边界

| 内容 | 本 Block动作 | 边界 |
|---|---|---|
| AKI肾前 / 肾性 / 肾后 | **Primary Learn** | K12再完整学习梗阻 / BPH / 结石 |
| 肾前性 AKI vs 缺血性 ATN | **Primary Learn** | 不扩写所有肾毒物药理 |
| AKI时间相位与危险 | **Primary Learn** | K5水电酸碱只 Recall / Apply |
| AKI诊断标准与GFR评估 | **Primary Learn** | 清除率正常机制 Recall K1 |
| CKD毒素与多系统表现 | **Primary Learn** | 各专科完整疾病后置对应 System |
| 肾性贫血 / 出血 | **Learn / Integration** | 完整贫血与出血诊断树后置血液 |
| CKD-MBD | **Learn / Integration** | PTH / VitD完整激素轴后置内分泌 |
| CKD分期与治疗目标 | **Primary Learn** | 当前Study口径，不升级外部指南 |
| 透析指征、方法、并发症 | **Primary Learn** | 完整血液净化 / ICU模式不扩写 |
| 肾小球病造成CKD | **Apply / Defer** | K9–K11建立LM / IF / EM与疾病模型 |
| 尿路梗阻造成肾后AKI | **Interface / Apply** | K12完整学习 |
| AKI / CKD伴贫血分度阈值 | **Coverage Supporting / MI-D** | 全局贫血模型后置血液，不在此重建 |

---

# 3｜先用“时间 × 第一故障层”定位

<!-- kianos:kp id="urinary-b07-kp01" -->

## KP01｜AKI vs CKD：先判时间，再找第一故障层

> **讲义定位 →** 内科 Lecture P151–153。  
> **主提示**：急慢2证据轴｜AKI三层｜CKD长期4输出｜肾小不可机械化｜特殊不缩小×4。

面对 Cr / GFR异常，第一步不是直接背病名，而是先分：

```text
突然下降
→ AKI
→ 再分肾前 / 肾性 / 肾后

长期、不可逆下降
→ CKD / 慢性肾衰
→ 看长期毒素与内分泌失败造成的系统表现
```

慢性支持证据中，Study强调：

- B超、肾图等可辅助急慢性鉴别；
- **双肾明显缩小**支持 CKD；
- 但不能机械写成“CKD一定小肾”。

（特殊×4：多囊肾、双肾多发囊肿、糖尿病肾病、肾淀粉样变性，慢性时双肾常不缩小。）

---

<!-- kianos:kp id="urinary-b07-kp02" -->

## KP02｜AKI三分：血没来、肾坏了、尿出不去

> **讲义定位 →** 内科 Lecture P151；Recall K1/K2。  
> **主提示**：3型｜第一变量｜代表病因｜压力落点｜可逆方向｜肾后串K12。

### A｜肾前性｜最常见

```text
大失血 / 液体丢失过多 / 肝硬化 / 心衰 / 机械通气等
→ 有效循环血量或肾灌注↓
→ 肾小球毛细血管压↓
→ GFR↓
```

关键：**第一故障在肾脏之前的灌注。**早期肾实质仍有保Na、浓缩尿的能力。

### B｜肾性 / 肾实质性

Study代表：

- 急性肾小管坏死 ATN；
- 间质性肾炎等。

机制入口：

- 肾缺血；
- 肾毒物：氨基糖苷、鱼胆、蘑菇、Hb、肌红蛋白、轻链蛋白等；
- 原尿外漏；
- 肾小管阻塞。

关键：**肾组织本身已经损伤**，尤其小管处理能力丢失。

### C｜肾后性

```text
结石 / BPH / 盆腔肿瘤 / 神经源性膀胱尿潴留等
→ 尿路梗阻
→ 肾小囊囊内压↑
→ 有效滤过压↓
→ GFR↓
```

//串联：这里只建立“压力顶回滤过器”的机制。结石、BPH、肾积水、尿潴留和解除梗阻优先级在 K12 完整学习。

---

<!-- kianos:kp id="urinary-b07-kp03" -->

## KP03｜肾前 vs 缺血性 ATN：会不会“拼命保Na和浓缩水”

> **讲义定位 →** 内科 Lecture P151 原表。  
> **主提示**：8指标｜浓缩2｜Na2｜Cr/BUN2｜FENa/RFI｜沉渣｜本质1句。

肾前性 AKI 的肾小管仍在工作，因此会尽量保水、保Na；缺血性 ATN 的小管已损伤，保存能力下降。

| 指标 | 肾前性 AKI | 缺血性 ATN |
|---|---:|---:|
| 尿比重 | >1.018 | <1.012 |
| 尿渗透压 | >500 | <250 mOsm/kg·H₂O |
| 尿Na⁺ | <10 mmol/L | >20 mmol/L |
| 尿Cr / 血Cr | >40 | <20 |
| BUN / Cr | >20 | <10–15 |
| FENa | <1% | >1% |
| 肾衰指数 RFI | <1 | >1 |
| 尿沉渣 | 透明管型 | 棕色颗粒管型 |

一条机制：

```text
肾前性
肾实质尚可
→ 小管保Na、保水、浓缩尿

ATN
小管上皮损伤
→ Na和水重吸收差
→ 尿稀、尿Na高、颗粒管型
```

（易混：透明管型并不等于“肾脏有实质损伤”；Study提醒正常人也可出现透明管型。）

---

# 4｜AKI时间轴：同一种疾病，危险会换挡

<!-- kianos:kp id="urinary-b07-kp04" -->

## KP04｜起始→进展/维持：少尿期“3高3低2中毒”

> **讲义定位 →** 内科 Lecture P151；Recall K5。  
> **主提示**：起始1｜少尿/无尿2阈｜3高3低2中毒｜主要死因2｜纠酸特殊×1。

### 起始期

- Study：尚无明显肾实质损伤。

### 少尿 / 进展 / 维持期

尿量：

- <400 mL/d：少尿；
- <100 mL/d：无尿；
- 部分 AKI 可 ≥400 mL/d，为非少尿型，Study认为一般病情较轻。

核心紊乱：

```text
3高：K+ / Mg2+ / P ↑
3低：Ca2+ / Na+ / Cl- ↓
2中毒：水中毒 + 代谢性酸中毒
```

机制主轴：

```text
肾排泄失败
→ K/Mg/P/H+/水排出↓
→ 高K、高Mg、高P、酸中毒、水中毒

肾小管1α-羟化酶功能↓
→ 钙三醇↓
→ 低Ca

水潴留造成稀释
→ 低Na、低Cl
```

**主要死因：高钾血症、水中毒。**

（特殊：酸中毒环境中游离 Ca²⁺比例相对较高，低钙时未必马上抽搐；纠正酸中毒后游离 Ca²⁺下降，反而可能出现手足抽搐。只保留 Study 机制，不扩展额外酸碱公式。）

---

<!-- kianos:kp id="urinary-b07-kp05" -->

## KP05｜多尿 / 恢复期：GFR先回来，小管后回来

> **讲义定位 →** 内科 Lecture P152。  
> **主提示**：谁先恢复｜为什么多尿｜主要死因2｜与少尿期危险反转。

恢复期不是“尿一多就安全”。

```text
肾皮质滤过功能先恢复
→ GFR可先接近正常

但再生中的肾小管上皮仍幼稚
→ 重吸收水、浓缩功能恢复较慢
→ 多尿
```

因此危险从：

```text
少尿期：高K + 水中毒
```

切换成：

```text
多尿期：低K + 感染
```

这就是 AKI 时间轴最需要主动回忆的“危险换挡”。

---

# 5｜AKI怎么被确认：Scr、尿量和GFR各回答什么

<!-- kianos:kp id="urinary-b07-kp06" -->

## KP06｜AKI三条诊断标准：48h、7d、6h

> **讲义定位 →** 内科 Lecture P152。  
> **主提示**：Scr 48h｜Scr 7d｜尿量6h｜3个数字｜先查什么vs最准确。

Study给出三条标准：

1. **48 h内** Scr升高 ≥0.3 mg/dL（≥26.5 μmol/L）；
2. **7 d内** Scr较基础值升高 ≥50%；
3. 尿量 <0.5 mL/(kg·h)，持续 ≥6 h。

临床入口与“最准确”要分开：

- Scr / BUN容易获得，实际可先查；
- Study称 **GFR 是诊断 AKI 最准确的指标**。

（易混：不要把“先查得方便”与“理论上更准确”混成一个问题。）

---

<!-- kianos:kp id="urinary-b07-kp07" -->

## KP07｜GFR三种测法 + 肾图加总 + 肾性病因不明才活检

> **讲义定位 →** 内科 Lecture P152；Recall K1清除率。  
> **主提示**：GFR定义｜3测法｜最准/常用｜肾图注意1｜活检条件2。

GFR定义：

> 单位时间内**双肾**生成的原尿量。

Study三种计算 / 评估方式：

| 方法 | 当前Study定位 |
|---|---|
| 菊粉清除率 | 最准确 |
| 内生肌酐清除率 Ccr | 更常用 |
| 放射性核素肾显像 / 肾图 | 可看分肾功能；计算双肾GFR时要把左右相加 |

活检边界：

```text
拟诊肾性 AKI
+ 病因不能明确
→ 肾穿刺活检
```

不是所有 AKI 都因为 Cr升高就活检。

---

# 6｜CKD：长期清除失败不只等于“尿毒素高”

<!-- kianos:kp id="urinary-b07-kp08" -->

## KP08｜CKD毒素三层：小分子、中分子、大分子

> **讲义定位 →** 内科 Lecture P152；Recall K6蛋白名单。  
> **主提示**：小分子7｜中分子1｜大分子5｜各代表后果｜与K6小蛋白易混1。

### 小分子毒素

Study列：

- K⁺；
- P；
- H⁺；
- BUN / 尿素氮；
- 胍类；
- 胺类；
- 酚类。

可导致糖耐量下降 / 胰岛素抵抗接口。

### 中分子毒素

- PTH。

Study联系：肾性骨营养不良、软组织钙化。

### 大分子毒素 / 蛋白质

- 核糖核酸酶；
- 溶菌酶；
- β₂-微球蛋白；
- VitA结合蛋白；
- 氨甲酰化蛋白。

（易混：K6肾小管性蛋白尿名单有轻链蛋白；本组大分子毒素没有轻链蛋白，而有氨甲酰化蛋白。）

---

<!-- kianos:kp id="urinary-b07-kp09" -->

## KP09｜CKD系统表现：消化最先，心衰最致命

> **讲义定位 →** 内科 Lecture P152–153。  
> **主提示**：最先1｜主要死因1｜循环4线｜神经4线｜“清除失败+内分泌失败”。

### 最先出现

- **消化系统表现**。

### 主要死因

- **心衰**。

循环系统主链：

```text
水钠潴留 → 前负荷↑
高血压 → 后负荷↑
贫血 → 心脏代偿负担↑
尿毒素 / Ca2+超载等
→ 心肌病 / 心衰
```

还可有：

- 心包炎；
- 水电解质与酸中毒相关心血管负担。

神经系统：

- 尿毒症脑病；
- 癫痫发作；
- 肢端袜套样感觉丧失；
- 不宁腿综合征。

这组表现要挂回同一原因：**肾单位长期丢失后，排泄和内分泌两套功能一起失败。**

---

<!-- kianos:kp id="urinary-b07-kp10" -->

## KP10｜肾性贫血与出血：EPO少；血小板数量可正常但功能差

> **讲义定位 →** 内科 Lecture P152；Recall K1 EPO。  
> **主提示**：贫血机制1｜出血机制1｜治疗4｜贫血阈3人群｜分度4级｜边界。

### 肾性贫血

```text
肾皮质肾小管周围间质细胞功能受损
→ EPO生成↓
→ 红系生成不足
→ CKD多轻—中度贫血
```

Study治疗四类：

- EPO；
- 罗沙司他 / HIF模拟；
- 铁；
- 叶酸。

### 出血

```text
尿毒素蓄积
→ 血小板功能降低
→ 出血倾向
```

关键边界：这里不是以“血小板数量下降”为主解释。

### //MI-D｜Lecture紧邻的贫血诊断阈值

当前内科 Lecture 同页附带诊断学阈值：

- 男性 Hb <120 g/L；
- 女性 Hb <110 g/L；
- 妊娠 Hb <100 g/L。

分度：

- 轻度 >90；
- 中度 60–90；
- 重度 30–59；
- 极重度 <30 g/L。

**Ownership边界**：这些阈值用于覆盖 U063 的附带考点；完整贫血分类、病因树和治疗模型后置血液系统，不在 K7 另造第二套贫血课。

---

# 7｜CKD-MBD：一个“活性VitD少—PTH高”的长期骨代谢后果

<!-- kianos:kp id="urinary-b07-kp11" -->

## KP11｜高转化性骨病：钙三醇↓ → 低钙 → PTH长期升高

> **讲义定位 →** 内科 Lecture P153；Recall K1肾脏1α-羟化酶。  
> **主提示**：机制链4步｜最常见｜PTH效应｜表现4｜原醛式“继发”边界。

Study链：

```text
肾衰
→ 1α-羟化酶 / 钙三醇生成↓
→ 低钙
→ 长期继发PTH↑
→ 高转化性骨病（最常见）
```

Study强调大剂量 / 长期升高的 PTH 使破骨活动增强，表现：

- 骨质疏松；
- 易骨折；
- 骨骼囊样缺损；
- 纤维囊性骨炎。

//串联：完整 PTH—VitD—Ca/P 调节轴仍归后续内分泌；K7只掌握 CKD 为什么触发这条轴。

---

<!-- kianos:kp id="urinary-b07-kp12" -->

## KP12｜低转化性骨病：骨再生不良 vs 骨软化

> **讲义定位 →** 内科 Lecture P153。  
> **主提示**：2型｜各自触发｜PTH方向｜矿化是否障碍｜骨软化表现2。

### A｜骨再生不良

Study入口：

- 长期过量骨化三醇；
- 钙剂；
- 透析液钙含量偏高。

```text
Ca / 钙三醇偏高
→ PTH相对偏低
→ 成骨刺激不足
→ 骨再生不良
```

### B｜骨软化症

```text
钙三醇不足 / 铝中毒
→ 骨组织矿化障碍
→ 未钙化骨组织堆积
→ 脊柱、骨盆变形
```

（易混：低转化性骨病包括**骨再生不良 + 骨软化**，不是把“骨硬化”机械塞进来。）

---

# 8｜急慢性鉴别与CKD分期

<!-- kianos:kp id="urinary-b07-kp13" -->

## KP13｜急慢性鉴别：小肾支持CKD，但4种慢病可以不小

> **讲义定位 →** 内科 Lecture P153。  
> **主提示**：检查2类｜小肾方向｜4个不缩小｜长期并发症3｜不能单轴判定。

支持 CKD：

- B超、肾图等发现双肾明显缩小；
- 长期贫血、CKD-MBD、长期水电酸碱问题等慢性后果也支持时间较长。

特殊不缩小：

1. 多囊肾；
2. 双肾多发囊肿；
3. 糖尿病肾病；
4. 肾淀粉样变性。

因此病例判断采用：

> **病程 + 肾脏大小 + 长期并发症**，而不是“一看到大肾就排除 CKD”。

---

<!-- kianos:kp id="urinary-b07-kp14" -->

## KP14｜CKD GFR分期：90—60—45—30—15

> **讲义定位 →** 内科 Lecture P153 原表。  
> **主提示**：CKD G1–G5｜G3再分哪两级｜各GFR阈点｜透析落点｜Cr边界

按当前 Study 可明确读取的 GFR 分期：

| CKD stage | GFR（mL/min/1.73m²） |
|---|---:|
| G1 | ≥90 |
| G2 | 60–89 |
| G3a | 45–59 |
| G3b | 30–44 |
| G4 | 15–29 |
| G5 | <15 或透析 |

### SOURCE GAP｜`urinary-b07-sg01`

P153 原页同时给出血Cr一行：`<177`、`<442`、`<707`、`≥707 μmol/L`，但当前 AI-readable 文本未可靠保留它们与5个 CKD stage 的列对应关系；机器化恢复会制造假映射。

因此：

- **GFR分期可冻结**；
- **血Cr精确分期列必须回原表**；
- Outline U064“GFR + 血Cr范围”已路由到本 KP，但 Cr 部分标记 `UNCERTAIN_SOURCE_READING / VISUAL_SOURCE_GAP`，不静默补全。

---

# 9｜保住残余肾单位：降压、减蛋白尿、控制输入

<!-- kianos:kp id="urinary-b07-kp15" -->

## KP15｜ACEI / ARB：降压 + 减少蛋白滤过；Study禁忌按当前口径保留

> **讲义定位 →** 内科 Lecture P153。  
> **主提示**：治疗目标2｜出球方向｜BP两目标｜禁忌5｜其他目标MI-D。

Study治疗主线：

```text
尿蛋白 / 高血压持续损伤肾单位
→ ACEI / ARB
→ 降压
+ 选择性舒张出球小动脉
→ 滤过压力下降
→ 尿蛋白减少
→ 保护残余肾单位
```

当前 Study BP 目标：

- CKD1–5，尿白蛋白 / Cr ≥30 mg/g：**<130/80 mmHg**；
- 尿白蛋白 / Cr <30 mg/g：**<140/90 mmHg**。

当前 Study 列的 ACEI / ARB 禁忌 / 不宜条件：

- Scr >265 μmol/L；
- K⁺ >5.5 mmol/L；
- 双肾动脉狭窄；
- 妊娠；
- 低血压。

> **边界**：以上为本 Lecture 的当前考试口径；不根据外部指南静默修改。

//MI-D｜原页治疗目标还包括：糖尿病空腹血糖5.0–7.2、睡前6.1–8.3 mmol/L；HbA1c 6.5%–8.0%；蛋白尿<0.5 g/24h；GFR下降速度<4 mL/(min·1.73m²·年)；Scr升高速率<50 μmol/(L·年)。

---

<!-- kianos:kp id="urinary-b07-kp16" -->

## KP16｜水、Na、P、蛋白与药物：输入端也要减负

> **讲义定位 →** 内科 Lecture P154；Recall K5。  
> **主提示**：水2公式｜P结合剂2｜限蛋白/脂/肾毒药｜保热量。

### 水 / Na

- 少尿期每日补液 = **前一日尿量 +500 mL**；
- 多尿期每日补液 = **每日排出水量的 1/3–1/2**。

### 磷

不含钙的磷结合剂：

- 司维拉姆；
- 碳酸镧。

### 饮食 / 药物

Study要求：

- 限蛋白；
- 限脂；
- 限相关肾毒性药物；
- 保证足够热量，避免负氮平衡。

Lecture列需要警惕：

- 氨基糖苷类；
- 一 / 二代头孢；
- NSAIDs；
- 含马兜铃酸中药等。

（边界：本节只保留当前 Study 的饮食和药物减负方向，不扩写现代 CKD 营养处方。）

---

# 10｜透析：什么时候不能再等

<!-- kianos:kp id="urinary-b07-kp17" -->

## KP17｜透析指征：K、pH、Cr/BUN、严重尿毒症、肺水肿

> **讲义定位 →** 内科 Lecture P154；Recall K5高K / 酸中毒。  
> **主提示**：K｜pH｜Cr2阈｜BUN｜严重尿毒症3｜肺水肿｜“保守无效”门槛。

当前 Study 的考试口径：

```text
K+ >6.5 mmol/L
或严重心律失常

pH <7.2

Cr >442 或 707 μmol/L

BUN >21.4 mmol/L

严重尿毒症：
心包炎 / 脑病 / 癫痫

利尿无效的严重肺水肿
```

决策本质：

> 当高K、严重酸中毒、容量负荷或尿毒症器官损害已经超过保守纠正的安全边界，就不再只是“继续观察Cr”。

（边界：Cr 的两个阈值按当前 Study 原样保留，不自行解释为所有病例的统一现代指南门槛。）

---

<!-- kianos:kp id="urinary-b07-kp18" -->

## KP18｜三类透析：IHD、CRRT、PD；严重AKI的Study选择

> **讲义定位 →** 内科 Lecture P154。  
> **主提示**：3方法｜CRRT两路｜严重AKI谁不宜｜原因2｜本文件不扩哪些。

Study列：

1. **间歇性血液透析 IHD**；
2. **连续肾脏替代治疗 CRRT**：
   - 连续性静—静脉血液滤过；
   - 连续性动—静脉血液滤过；
3. **腹膜透析 PD**。

当前 Lecture 明确：

> 严重 AKI 不宜选腹膜透析，理由是效率低，且易并发腹膜炎。

因此 Outline U064“重症AKI透析方式”按本 Study 口径回答 IHD / CRRT 分支，不静默替换为外部实践更新。

---

<!-- kianos:kp id="urinary-b07-kp19" -->

## KP19｜透析并发症：先记5个有独立机制的，再把长表放MI-D

> **讲义定位 →** 内科 Lecture P154 原正文 + 原表。  
> **主提示**：核心5｜各自机制｜初次透析特殊1｜β2-MG｜长表MI-D。

### 核心5个

1. **高排量心衰**：动静脉内瘘建立低阻力通路；
2. **加重动脉粥样硬化**；
3. **骨再生不良**：透析液钙 / 钙三醇过多 → PTH相对偏低接口；
4. **透析失衡综合征**：多见初次透析，颅内高压样表现——恶心、呕吐、头痛；
5. **透析相关性淀粉样变骨病**：β₂-微球蛋白相关。

### //MI-D｜原页并发症表还列

- 低血压；
- 血栓；
- 空气栓塞；
- 痛性肌痉挛；
- 透析器首次使用综合征；
- 发热；
- 心律失常；
- 低血糖；
- 出血与急性溶血；
- 蛋白质—能量营养不良；
- 血小板减少症。

//边界：Lecture题旁还写“透析禁忌脂溶性中毒”，本文件只登记为 `SPECIAL / BOUNDARY / MI-D`，完整中毒血液净化归后续中毒模块。

---

<!-- kianos:kp id="urinary-b07-kp20" -->

## KP20｜K7最终病例算法：时间→位置→危急值→可逆原因→透析

> **主提示**：5步｜急慢｜肾前/性/后｜高K/水/酸｜可逆病因｜透析5门。

```text
1. 急性还是慢性？
   Scr变化速度 / 肾大小 / 长期贫血骨病等

2. AKI第一故障在哪里？
   灌注不足 / 肾实质 / 尿路梗阻

3. 当前最危险的不是“Cr高”而是什么？
   K+ / 水负荷 / 酸中毒 / 尿毒症器官损害

4. 是否有可逆原因必须先处理？
   低容量、缺血/肾毒物、感染、梗阻等

5. 是否达到透析升级门槛？
   K / pH / Cr-BUN / 严重尿毒症 / 利尿无效肺水肿
```

病例中如果只会说“AKI / CKD”，但不能回答**第一故障层和当前致命变量**，就还没有完成 K7。

---

# 11｜Framework Reconstruction

Lecture完成后闭卷完成：

```text
1. 画AKI三分：肾前—肾性—肾后，并标第一变量。
2. 不看表写出肾前 vs ATN 的8项指标方向。
3. 画起始→维持→恢复期，并写每期主要死因。
4. 写出“3高3低2中毒”并解释纠酸后低钙抽搐。
5. 写AKI三条诊断标准。
6. 写GFR三种方法、最准/常用及肾图加总。
7. 画CKD“清除失败 + 内分泌失败”总图。
8. 写毒素三层。
9. 从EPO和血小板功能解释贫血 / 出血。
10. 画CKD-MBD高转化 vs 低转化。
11. 写急慢性鉴别与4个“小肾例外”。
12. 写G1–G5 GFR分期；血Cr行标注待原图核对。
13. 写ACEI/ARB作用、BP目标和Study禁忌。
14. 写少尿 / 多尿补液、磷结合剂和肾毒药物边界。
15. 写透析5类指征、3类方法和核心并发症。
16. 用KP20跑一个未知肾衰病例。
```

---

# 12｜Memory Routing

## 12.1 MI-G｜第一轮必须即时掌握

- AKI肾前 / 肾性 / 肾后三分；
- 肾前性 vs ATN 的机制与核心指标方向；
- 少尿 <400、无尿 <100；
- 少尿期“3高3低2中毒”；
- 少尿期主要死因：高K、水中毒；
- 多尿期主要死因：低K、感染；
- AKI三条诊断标准的时间轴；
- GFR定义与菊粉 / Ccr / 肾图定位；
- CKD消化最先、心衰主要死因；
- EPO↓导致肾性贫血，尿毒素导致血小板功能低；
- CKD高转化骨病主链；
- 急慢性鉴别和“小肾不绝对”；
- CKD GFR分期；
- ACEI/ARB减蛋白尿主逻辑；
- 高K、严重酸中毒、尿毒症器官损害、肺水肿等透析门槛；
- IHD / CRRT / PD当前Study边界；
- 透析失衡综合征。

## 12.2 MI-D｜进入 MarginNote 3

- 肾前 vs ATN 全部数值；
- AKI Scr精确阈值与单位；
- CKD毒素完整名单；
- 贫血男女 / 妊娠阈值与四级分度；
- 罗沙司他等药名；
- CKD-MBD低频细节；
- 血Cr分期原表（待视觉核对）；
- ACEI / ARB禁忌精确数字；
- CKD全部治疗目标数字；
- 少尿 / 多尿补液公式；
- 司维拉姆、碳酸镧；
- 透析所有数值阈值；
- CRRT全称；
- 透析并发症长表；
- “脂溶性中毒”透析边界。

---

# 13｜Study 原图 / 表格门禁

## 必须回原图

1. P151｜肾前性 AKI vs 缺血性 ATN 8项指标表；
2. P151｜AKI阶段与“3高3低2中毒”组织图；
3. P153｜CKD GFR / 血Cr分期原表；
4. P153｜CKD治疗目标表；
5. P154｜血液透析体外循环示意图；
6. P154｜血液透析并发症长表。

### VISUAL_SOURCE_GAP

当前正式主读取层 `内科学讲义_AI阅读版.md` 可安全恢复正文和多数表格关系，但本批环境中未找到可直接打开的原始 `内科精编版小合集2【胃食管反流病→肾衰竭】.pdf` 页面资产。

因此：

```text
visual_textual_reconstruction = available
original_visual_truth = pending
CKD_Cr_stage_column_mapping = unresolved
```

不假装已看过原图。后续原 PDF / Source Page 可访问时，仅定点核对上述视觉项，不重写已通过正文。

---

# 14｜Lecture Knowledge Routing Audit

| Lecture范围 | Knowledge Role | Memory Route | 去向 |
|---|---|---|---|
| P151 AKI三机制 | CORE / CONNECTION | MI-G | KP02 |
| P151肾前 vs ATN表 | CORE / CONFUSABLE / VISUAL_ONLY | MI-G+MI-D | KP03 |
| P151少尿期、电解质、纠酸 | CORE / SPECIAL / CONNECTION | MI-G | KP04 |
| P152恢复期 | CORE / CONFUSABLE | MI-G | KP05 |
| P152 AKI诊断标准 | CORE / RECOGNITION | MI-G+MI-D | KP06 |
| P152 GFR方法与活检 | CORE / RECOGNITION | MI-G | KP07 |
| P152 CKD毒素 | CORE / CONFUSABLE | MI-D | KP08 |
| P152–153系统表现 | CORE / CONNECTION | MI-G | KP09 |
| P152肾性贫血 / 出血 / 诊断学阈值 | CORE / CONNECTION / BOUNDARY | MI-G+MI-D | KP10 |
| P153高转化骨病 | CORE / CONNECTION | MI-G | KP11 |
| P153低转化骨病 | CONFUSABLE / SPECIAL | MI-G+MI-D | KP12 |
| P153急慢鉴别 | CORE / RECOGNITION | MI-G | KP13 |
| P153 CKD分期 | CORE / VISUAL_ONLY / BOUNDARY | MI-G+MI-D | KP14 + SG01 |
| P153 ACEI/ARB与目标 | CORE / RECOGNITION / BOUNDARY | MI-G+MI-D | KP15 |
| P154饮食、补液、磷结合剂、肾毒药 | CORE / SPECIAL | MI-G+MI-D | KP16 |
| P154透析指征 | CORE / RECOGNITION | MI-G+MI-D | KP17 |
| P154透析方法 | CORE / BOUNDARY | MI-G | KP18 |
| P154透析并发症正文+表 | CORE / SPECIAL / VISUAL_ONLY | MI-G+MI-D | KP19 |
| P155–156 Lecture-attached Questions | BOUNDARY | — | First-pass Question Probe待绑定，不自行抽题 |
| 完整贫血 / PTH / 免疫 / 梗阻 / ICU模型 | DEFERRED_MODEL | — | 后续owner |
| 题旁重复口诀和同义解释 | REDUNDANT_EXPOSITION | — | 合并到对应KP |

```text
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
```

---

# 15｜Outline Coverage Safety Net

## 15.1 生成侧｜23 / 23

| Outline item | 题数 | 路由 |
|---|---:|---|
| U063 AKI肾前/肾性/肾后机制 | 1 | KP02 |
| U063 肾前 vs ATN | 1 | KP03 |
| U063 少尿期水电酸碱 | 1 | KP04 |
| U063 少尿期死因 + 纠酸低钙 | 1 | KP04 |
| U063 多尿期死因 | 1 | KP05 |
| U063 AKI三条诊断标准 | 1 | KP06 |
| U063 GFR定义 + 3种计算 | 1 | KP07 |
| U063 肾图加总 + 肾性病因不明活检 | 1 | KP07 |
| U063 CKD小/中/大分子毒素 | 1 | KP08 |
| U063 首发表现 + 主要死因 | 1 | KP09 |
| U063 CKD贫血 / 出血机制 | 1 | KP10 |
| U063 肾性贫血4类治疗 | 1 | KP10 |
| U063 贫血人群阈值 + 分度 | 1 | KP10（Supporting / MI-D；不接管血液系统） |
| U063 高转化性骨病 | 1 | KP11 |
| U063 低转化性骨病 | 1 | KP12 |
| U064 AKI vs CKD + 不缩小特殊 | 1 | KP13 |
| U064 CKD分期GFR + 血Cr | 1 | KP14；Cr部分显式SG01 |
| U064 ACEI/ARB + BP目标 | 1 | KP15 |
| U064 少尿/多尿补液 + 饮食 | 1 | KP16 |
| U064 不含钙磷结合剂 | 1 | KP16 |
| U064 透析指征 | 1 | KP17 |
| U064 严重AKI透析方法 | 1 | KP18 |
| U064 透析并发症 | 1 | KP19 |
| **合计** | **23** | **23 / 23** |

```text
total = 23
mapped = 23
unmapped = 0
missing = 0
duplicate_primary = 0
```

`U064 CKD分期` 已有明确路由，但血Cr列属于 `mapped_with_source_gap`，不是 silent unmapped。

## 15.2 学习者侧

Outline 只作为 Coverage Safety Net：

- 主模型稳定：快速扫题即可；
- 表格数字记不牢：进入 MI-D，不重读整章；
- 肾前 / ATN 方向错：回 KP03 + 原表；
- 透析门槛错：回 KP17；
- CKD血Cr列：等待原图核对，不凭记忆强行补。

---

# 16｜建议学习切片

```text
Unit A｜KP01–KP07
AKI定位 → 肾前vsATN → 时间轴 → 诊断

Unit B｜KP08–KP12
CKD毒素 → 系统表现 → 贫血/出血 → 骨病

Unit C｜KP13–KP16
急慢鉴别 → 分期 → ACEI/ARB → 输入端减负

Unit D｜KP17–KP20
透析指征 → 方法 → 并发症 → 最终病例算法
```

每个 Unit 按冻结流程：

```text
Framework定位
→ Lecture连续学习 / 表格回看
→ Framework Reconstruction
→ KP Active Recall
→ Outline按需扫漏
```

---

# 17｜Block Exit｜闭卷 24 问

1. AKI三类第一故障分别在哪里？
2. 肾前性AKI为什么能保Na保水，而ATN做不到？
3. 肾后性AKI为什么会降低GFR？
4. 肾前 vs ATN 的尿比重和尿渗透压如何变？
5. 尿Na、FENa、RFI如何比较？
6. BUN/Cr、尿Cr/血Cr如何比较？
7. 两者尿沉渣分别是什么？
8. 少尿和无尿阈值是什么？
9. “3高3低2中毒”是什么？
10. 少尿期主要死因是什么？
11. 为什么纠正酸中毒后反而可出现手足抽搐？
12. 多尿期为何出现，主要死因是什么？
13. AKI三条诊断标准是什么？
14. GFR三种测法、最准和常用分别是什么？
15. 什么情况下AKI需要肾活检？
16. CKD小 / 中 / 大分子毒素分别是什么？
17. CKD最先出现哪个系统表现，主要死因是什么？
18. 肾性贫血和出血各是什么机制？
19. 高转化性骨病与低转化性骨病如何分？
20. 哪4种CKD双肾可不缩小？
21. CKD G1–G5 的GFR阈值是什么？
22. ACEI/ARB如何减蛋白尿，当前Study禁忌有哪些？
23. 哪些情况达到透析门槛？
24. IHD、CRRT、PD当前Study边界与透析失衡综合征是什么？

**最低出口**：面对一个 Cr升高 / 少尿病例，能在数分钟内完成“急慢性 → 肾前/肾性/肾后 → 当前致命变量 → 可逆原因 → 是否透析”的决策链，而不是只背“肾衰竭”三个字。

---

# 18｜First-pass Question Probe

```text
来源：
TTSX Lecture-attached Questions

选择方式：
LectureQuestionBinding 自动提供

绑定范围：
内科学讲义 P155–156《肾衰竭》真题解析
并结合其对应 P151–154 Lecture Section 的 source-position relation

状态：
待绑定
```

不得在本文件中从 U063 / U064 或题目语义自行挑题冒充 Lecture-attached Questions。

---

# 19｜Block Production Gate

```text
Study_continuity = PASS
natural_mechanism_split = 0
repeated_first_exposure = 0
Framework_is_map = PASS
KP_natural_units = 20
prompt_leakage = PASS
Outline_total = 23
Outline_mapped = 23
unmapped = 0
missing = 0
duplicate_primary = 0
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
First_pass_question_probe = READY_PENDING_BINDING
Source_gap = urinary-b07-sg01
Visual_gate = PENDING_ORIGINAL_SOURCE_PAGE
```

---

# 20｜Block Complete 定义

```text
Framework已建立
+ Lecture P151–154已连续学习
+ 肾前vsATN / CKD分期 / 透析表已按当前可用Source核对
+ CKD血Cr列的视觉Gap已知晓、不自行补写
+ 能闭卷重建AKI时间轴与CKD多系统后果
+ KP Active Recall完成
+ Outline按需扫漏
+ TTSX Lecture-bound Question Probe完成或等待正式绑定
```

允许：

> **Block Complete + Visual Source Gap Open**

数字阈值、长药名与透析并发症长表进入 MI-D；只有“急慢性—第一故障层—危急变量—透析门槛”仍无法重建时，才先做最小修复。
