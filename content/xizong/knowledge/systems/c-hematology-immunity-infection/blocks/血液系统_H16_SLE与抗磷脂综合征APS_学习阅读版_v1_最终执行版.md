---
type: block_guide
schema_version: 1
content_version: 1
system: 血液—免疫—感染
system_id: hematology_immunity_infection
block_id: hematology-h16
title: 系统性红斑狼疮与抗磷脂综合征
order: 16
status: FINAL_EXECUTION
study_refs:
  - source_id: pathology-lecture
    label: 病理学讲义_AI阅读版｜系统性红斑狼疮
    pdf_page_start: 87
    pdf_page_end: 87
    action: primary
  - source_id: internal-medicine-lecture
    label: 内科学讲义_AI阅读版｜系统性红斑狼疮
    sequence_page_start: 273
    sequence_page_end: 276
    action: primary
  - source_id: hematology-h12
    label: H12｜免疫共同语言、超敏反应与自身耐受
    action: recall
  - source_id: urinary-system
    label: 泌尿系统｜肾小球双坐标与狼疮肾接口
    action: recall_apply
  - source_id: circulation-system
    label: 循环系统｜血栓与Libman-Sacks接口
    action: recall_apply
outline_units:
  - PATH-U010-H16-SLE-SUBSET
  - INT-U102
outline_primary_count: 23
kp_count: 21
prerequisites:
  - hematology-h12
  - hematology-h15
next_blocks:
  - hematology-h17
  - hematology-h18
  - hematology-h19
visual_gates:
  - pathology-with-map-p103-sle-pathology-panel
  - pathology-with-map-p110-immunity-mindmap
visual_gate_status: VISUAL_SOURCE_AVAILABLE
source_gap_status: SOURCE_CONFLICT_AND_BOUNDARY_EXPLICIT
source_conflicts:
  - H16-SC01
source_boundaries:
  - H16-SG01
  - H16-SB01
  - H16-SB02
system_final_batch: false
---
# H16｜系统性红斑狼疮与抗磷脂综合征
## 同一套自身免疫怎样同时形成免疫复合物病、血细胞破坏和血栓—流产表型

> **中心问题**：SLE为何能同时累及皮肤、关节、血液、肾、神经和浆膜；面对一组自身抗体，怎样区分筛查、标记、活动、器官关联和血栓风险；APS又为何表现为“反复血栓 + 流产 + 血小板减少”，而不是单纯出血病？
>
> **Primary Study**：`病理学讲义_AI阅读版.md` PDF P87《系统性红斑狼疮》；`内科学讲义_AI阅读版.md` 讲义顺序 P273–276《SLE》。
>
> **Primary Outline**：病理 U010 SLE子集 **7项** + 内科 U102 **16题** = **23 / 23**。
>
> **前序调用**：H12的Ⅱ型 / Ⅲ型最低语言；泌尿肾小球证据；循环血栓；H15诊断与药物角色。

---

# 0｜Block Contract

## Learn

- SLE的免疫复合物主轴与细胞毒性血液支路；
- ANA谱的筛查、标记、活动和器官关联；
- APS三抗体与三类临床表现；
- 狼疮小体 / 细胞、白金耳、狼疮带、Libman-Sacks、洋葱脾和血管纤维素样坏死；
- 皮肤黏膜、浆膜、关节、血液、神经和肾受累；
- 当前 Study治疗角色与狼疮危象。

## Recall / Apply / Defer

| 内容 | 动作 | 边界 |
|---|---|---|
| Ⅲ型免疫复合物、Ⅱ型细胞毒性 | Recall H12 | 不扩正常免疫级联 |
| 狼疮肾证据 | Apply | 完整LN分型和肾脏治疗归泌尿系统 |
| 血栓 / 血小板 /妊娠接口 | Apply | APS完整产科与长期抗凝未由当前Source支持 |
| Jaccoud与RA侵蚀性关节病 | Learn + Defer comparison | RA完整主体归H17 |
| 现代SLE分类标准、评分、靶向方案 | Defer / Not Source | 不升级外部指南 |

## Source Boundary / Conflict

- 当前 Source不支持完整狼疮肾炎分型与治疗、APS正式分类标准、妊娠管理和长期抗凝路径；
- 内科真题区一题把“活动性相关抗体”答案指向 rRNP，而正文与正式 Outline稳定指向 anti-dsDNA；登记 `H16-SC01`，不静默改题；
- 自身耐受丧失的完整机制仍是 H12已登记 Source Gap；
- 病理原图可回 `27病理精编版合集【带导图】.pdf` 实际 PDF P103核对。

---

# 1｜第一轮固定流程

```text
Framework Orientation
→ Recall H12：免疫复合物 / 细胞毒性
→ 病理P87 + 原图P103连续学习
→ 内科P273–276连续学习
→ Framework Reconstruction：抗体角色 × 器官落点 × 活动/损害
→ KP Active Recall
→ Outline Quick Check（可选、低压力）
→ TTSX Lecture-attached Questions
→ Block Complete
```

---

# 2｜总 Framework

<!-- kianos:framework id="hematology-h16-framework-main" -->

```text
自身耐受失衡（机制Source Gap）
        ↓
自身抗体形成
        ↓
├─ 免疫复合物沉积 / 血管炎主轴
│  ├─ 皮肤：狼疮带、蝶形/盘状红斑
│  ├─ 肾：白金耳、蛋白尿/管型
│  ├─ 浆膜：胸膜/心包
│  └─ 小血管：纤维素样坏死
│
├─ 抗组织细胞抗体
│  ├─ RBC → 溶血 / Coombs+
│  ├─ PLT → 血小板减少
│  └─ 神经元 → NPLE接口
│
└─ 抗磷脂抗体
   ├─ 动静脉血栓
   ├─ 反复流产
   └─ 血小板减少
        ↓
证据角色
ANA筛查
→ dsDNA诊断/活动/肾
→ Sm高特异标记
→ ENA器官关联
→ 补体与器官指标判活动/损害
        ↓
治疗
避光 / 背景HCQ
→ GC + 免疫抑制剂
→ 危象冲击
```

### 一句话恢复

> **SLE先按“免疫复合物落点 + 抗细胞抗体 + 抗磷脂血栓”拆成三路，再把每个抗体放回筛查、特异、活动或器官关联角色。**

---

# 3｜KP Active Recall
    <!-- kianos:kp id="hematology-h16-kp01" -->
    ## KP01｜SLE总机制：Ⅲ型主轴，Ⅱ型血液支路，APS血栓支路

    > **主提示：主轴1｜血液支路1｜APS支路1｜器官6｜耐受机制边界**

    ### 快速核对

```text
自身抗体 + 抗原
→ 免疫复合物形成并沉积
→ 补体 / 炎症效应
→ 血管、肾、皮肤、浆膜等多器官损伤
```

这是当前 SLE的**Ⅲ型免疫复合物主轴**。

并行还有：

- 抗RBC / PLT等 → Ⅱ型细胞毒性血液表现；
- 抗磷脂抗体 → 血栓、流产、血小板减少。

（边界：为什么自身耐受丧失，当前Source没有完整答案；不补写。）

    **Routing**：CORE｜CONNECTION｜BOUNDARY｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp02" -->
    ## KP02｜SLE抗体总地图：三大类先分角色

    > **主提示：ANA谱3类｜APL3｜组织细胞3｜其他2｜角色4层**

    ### 快速核对

SLE抗体可按当前 Study分为：

1. **抗核抗体谱**：ANA、dsDNA、ENA；
2. **抗磷脂抗体**：LA、aCL、anti-β2GPI；
3. **抗组织细胞抗体**：抗RBC、抗PLT、抗神经元；
4. 其它可阳性：RF、ANCA等，均非SLE专属。

使用时不是背总表，而是问：

```text
用于筛查？
用于高特异标记？
用于活动判断？
还是解释某个器官表现？
```

    **Routing**：CORE｜RECOGNITION｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp03" -->
    ## KP03｜ANA：最敏感筛查入口，阳性不能单独确诊

    > **主提示：敏感最高｜筛查｜阴性意义｜阳性不特异｜活动无关**

    ### 快速核对

- ANA敏感性最高，适合作为筛查；
- 当前 Lecture强调：ANA阴性可显著降低 / 基本排除 SLE可能；
- ANA阳性不等于SLE，可见于其它结缔组织病甚至其它状态；
- ANA与活动性无关，不能替代 dsDNA、补体和器官指标。

（易混：最敏感 ≠ 最特异 ≠ 最佳活动指标。）

    **Routing**：CORE｜CONFUSABLE｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp04" -->
    ## KP04｜anti-dsDNA与anti-Sm：活动标记与高特异标记分工

    > **主提示：dsDNA 4役｜Sm 3役｜谁看活动｜谁最特异｜谁与肾**

    ### 快速核对

| 抗体 | 当前 Study角色 |
|---|---|
| anti-dsDNA | SLE标记 / 诊断；判断活动最佳；与狼疮肾相关；敏感和特异均较高 |
| anti-Sm | 特异性最高；早期、不典型或回顾性诊断有价值；与活动无关 |

稳定作答轴：

```text
筛查最敏感 = ANA
活动 / 狼疮肾 = dsDNA
特异最高 = Sm
```

`H16-SC01`：真题区个别答案与此稳定正文口径冲突，保留冲突，不用模型常识改题。

    **Routing**：CORE｜CONFUSABLE｜SOURCE_CONFLICT｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp05" -->
    ## KP05｜ENA器官地图：SSA/SSB、RNP与rRNP

    > **主提示：ENA5｜SSA 6联｜SSB 1联｜RNP 3联｜rRNP 1联**

    ### 快速核对

ENA包括：Sm、SSA、SSB、RNP、rRNP。

- **SSA**：肌肉受累、继发干燥、光过敏 / 皮损、白细胞减少、血管炎、新生儿狼疮 / 心传导阻滞接口；
- **SSB**：继发干燥接口；
- **RNP**：雷诺、肺动脉高压、混合性结缔组织病接口；
- **rRNP**：NPLE接口；
- Sm：见KP04。

//串联：SSA / SSB在H18学习原发干燥时再次调用，不在这里重复干燥完整模型。

    **Routing**：CORE｜CONNECTION｜MI-G｜MI-D

    ---
    <!-- kianos:kp id="hematology-h16-kp06" -->
    ## KP06｜抗磷脂抗体三件套：名称与检测身份

    > **主提示：LA｜aCL｜β2GPI｜名称反直觉｜APS接口**

    ### 快速核对

抗磷脂抗体：

1. 狼疮抗凝物（LA）；
2. 抗心磷脂抗体（aCL）；
3. 抗 β2糖蛋白Ⅰ抗体（anti-β2GPI）。

（易混：“抗凝物”是实验室名称，APS临床主轴却是血栓倾向；不能按名字直接推临床结果。）

    **Routing**：CORE｜CONFUSABLE｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp07" -->
    ## KP07｜APS临床三轴：血栓、流产、血小板减少

    > **主提示：血管2类｜产科1｜PLT方向｜出血不是主轴｜后置2项**

    ### 快速核对

```text
抗磷脂抗体
→ 动脉或静脉血栓
→ 反复自然流产
→ 血小板减少
```

核心是**血栓性自身免疫表型**，不是单纯出血性疾病。

（边界：当前 Source不支持完整APS分类标准、抗凝疗程、妊娠处理和现代风险分层；全部Defer。）

    **Routing**：CORE｜CONFUSABLE｜BOUNDARY｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp08" -->
    ## KP08｜抗组织细胞抗体：血细胞减少与Coombs / Ret方向

    > **主提示：RBC｜PLT｜神经元｜Coombs｜Ret方向｜一系/全血**

    ### 快速核对

- 抗RBC抗体 → 免疫性溶血、Coombs试验阳性、Ret可升高；
- 抗PLT抗体 → 血小板减少；
- 抗神经元抗体 → NPLE接口；
- SLE可出现一系或全血细胞减少。

所以CBC下降并不都等于骨髓生产失败；要结合 Ret、溶血证据和临床活动判断。

    **Routing**：CORE｜CONNECTION｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp09" -->
    ## KP09｜活动度与器官损害：不要把“抗体阳性”当成活动

    > **主提示：活动抗体1｜补体方向｜炎症2｜血尿2｜与活动无关4**

    ### 快速核对

活动判断组合：

- anti-dsDNA升高；
- 补体下降；
- ESR / CRP等炎症指标；
- 新发或加重的器官证据：蛋白尿、RBC管型、血细胞减少、神经或肺等表现。

当前 Study列为与活动无关的抗体：**ANA、Sm、SSA、SSB**。

（易混：抗体“有诊断价值”不等于“随活动同步变化”。）

    **Routing**：CORE｜CONFUSABLE｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp10" -->
    ## KP10｜狼疮小体与狼疮细胞：核物质被挤出，再被吞噬

    > **主提示：自身抗体作用｜核肿胀挤出｜小体是谁｜细胞是谁｜直接毒性边界**

    ### 快速核对

当前病理链：

```text
自身抗体作用于受损细胞核
→ 核肿胀、被挤出细胞
→ 均质嗜酸性核物质 = 狼疮小体 / 苏木素小体
→ 被中性粒细胞或巨噬细胞吞噬
→ 含小体的吞噬细胞 = 狼疮细胞
```

（易混：小体是被挤出的核物质；细胞是吞噬了小体的白细胞。）

    **Routing**：CORE｜VISUAL_ONLY｜CONFUSABLE｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp11" -->
    ## KP11｜狼疮肾与白金耳：内皮下免疫复合物形成粗大环

    > **主提示：部位1｜沉积1｜形态1｜尿证据2｜完整分型后置**

    ### 快速核对

弥漫增生性狼疮肾炎中：

```text
肾小球内皮下大量免疫复合物沉积
→ 毛细血管袢粗大、均质
→ “白金耳 / wire-loop”
```

临床入口：蛋白尿、肾小球源性血尿、RBC管型、肾功能变化。

（边界：完整狼疮肾炎分型、IF / EM与治疗归泌尿系统，H16只建立SLE器官落点。）

    **Routing**：CORE｜VISUAL_ONLY｜CONNECTION｜BOUNDARY｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp12" -->
    ## KP12｜狼疮皮与狼疮带：免疫复合物落在真皮—表皮交界

    > **主提示：沉积位置｜皮损2型｜光敏｜瘙痒边界｜原图**

    ### 快速核对

- 免疫复合物沉积于表皮—真皮交界 / 浅层真皮方向；
- 可形成狼疮带；
- 代表皮损：蝶形红斑、盘状红斑；
- 可有光过敏；当前 Study提示SLE皮疹多无明显瘙痒。

原图必须回病理 PDF P103核对，不凭文字想象带状沉积和皮损形态。

    **Routing**：CORE｜VISUAL_ONLY｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp13" -->
    ## KP13｜Libman-Sacks、洋葱脾与血管坏死：三处病理锚

    > **主提示：心1｜血栓成分1｜易脱落否｜脾1｜血管坏死1**

    ### 快速核对

- **Libman-Sacks心内膜炎**：非细菌性疣状赘生物，白色血栓，以血小板为主，不易脱落；
- **洋葱脾**：脾中央 / 小动脉周围同心圆样纤维化；
- **小动脉纤维素样坏死**：SLE血管损伤的重要形态。

（易混：Libman-Sacks不是感染性心内膜炎；不要把细菌、脓性炎和易脱落赘生物套入。）

    **Routing**：CORE｜VISUAL_ONLY｜CONFUSABLE｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp14" -->
    ## KP14｜皮肤黏膜入口：蝶形/盘状 + 通常不痛的溃疡

    > **主提示：红斑2｜黏膜部位2｜痛否｜脱发｜光敏**

    ### 快速核对

- 蝶形红斑、盘状红斑；
- 口腔或鼻咽部溃疡，通常不痛；
- 光过敏；
- 脱发；
- 指掌、甲周红斑或指端缺血等可见。

（易混：贝赫切特口腔溃疡通常疼痛、反复，并是诊断必需入口；完整比较见H19。）

    **Routing**：CORE｜CONFUSABLE｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp15" -->
    ## KP15｜浆膜与关节：非侵蚀性滑膜炎，Jaccoud可复

    > **主提示：浆膜2处｜关节3特性｜Jaccoud原因｜可复｜X线**

    ### 快速核对

- 浆膜炎：胸膜 / 心包等；SLE胸水为渗出性接口；
- 关节：对称性、多关节滑膜炎，常累及指、腕、膝；
- 关节软骨通常不被侵蚀破坏；
- **Jaccoud关节病**：关节周围肌腱受损导致，可复性非侵蚀性半脱位，X线多无骨破坏。

（易混：外观看似晚期RA畸形，但Jaccoud可复、非侵蚀。）

    **Routing**：CORE｜CONFUSABLE｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp16" -->
    ## KP16｜血液系统：一系或全血下降，先分破坏、消耗与骨髓

    > **主提示：Hb/WBC/PLT｜Ret方向｜Coombs｜APS血栓｜活动PLT**

    ### 快速核对

SLE可见：

- 溶血性贫血；
- 白细胞减少；
- 血小板减少；
- 一系或全血细胞减少。

判断时结合：Ret、Coombs、溶血指标、活动度和药物 / 感染背景。

//串联：APS可同时有血小板减少和血栓；“PLT低”不意味着临床主轴一定是出血。

    **Routing**：CORE｜CONNECTION｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp17" -->
    ## KP17｜神经与肾：多系统病例的两个高风险出口

    > **主提示：NPLE 2例｜肾3证据｜谁与肾相关｜危象入口｜后置**

    ### 快速核对

- NPLE：癫痫、精神异常等；rRNP为当前 Study关联抗体；
- 肾：蛋白尿、RBC管型、肾功能异常；dsDNA与狼疮肾相关；
- 神经或快速进展肾损害均可进入狼疮危象评估。

完整神经定位与狼疮肾分型 / 治疗分别回神经与泌尿系统。

    **Routing**：CORE｜CONNECTION｜BOUNDARY｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp18" -->
    ## KP18｜SLE诊断顺序：年轻女性只是先验，器官组合 + 抗体才闭环

    > **主提示：人群1｜发热1｜皮黏2｜器官5｜抗体4｜排除陷阱**

    ### 快速核对

典型病例顺序：

```text
育龄女性 + 低/中度发热
→ 皮肤黏膜
→ 非侵蚀性关节 / 浆膜
→ 血液、肾、神经
→ ANA筛查
→ dsDNA / Sm校正
→ APL、补体、Coombs和器官证据
```

任何单个表现都不够：关节炎可见于多数风湿病；ANA阳性也非SLE专属。

    **Routing**：CORE｜RECOGNITION｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp19" -->
    ## KP19｜SLE治疗层级：避光、背景、系统控制、难治升级

    > **主提示：日常1｜背景1｜首选组合2｜难治2｜活疫苗边界**

    ### 快速核对

- 避免紫外线；
- 缓解期可接种疫苗，但慎用活疫苗；
- **羟氯喹**作为背景治疗；
- 主要方案：糖皮质激素 + 免疫抑制剂，当前 Study代表环磷酰胺、MMF；
- 疗效不佳可用贝利尤单抗、泰它西普等当前 Study列出的生物制剂。

（边界：不补外部剂量、筛查、妊娠用药和现代分层方案。）

    **Routing**：CORE｜BOUNDARY｜MI-G｜MI-D

    ---
    <!-- kianos:kp id="hematology-h16-kp20" -->
    ## KP20｜狼疮危象：重要器官快速恶化，进入冲击治疗

    > **主提示：危象8组｜核心共同点｜治疗1｜不是所有发热｜感染鉴别**

    ### 快速核对

当前 Study列出的危象入口包括：

- 严重心肌损害；
- 狼疮肺炎、弥漫性肺泡出血；
- 快速进展肾炎；
- 中枢神经狼疮；
- 严重血管炎；
- 严重溶血、血小板减少性紫癜、粒细胞缺乏；
- 狼疮肝炎等重要器官损害。

处理入口：大剂量糖皮质激素冲击。

（边界：发热和细胞减少也可来自感染；当前Block保留鉴别警报，不扩感染完整路径。）

    **Routing**：CORE｜RECOGNITION｜BOUNDARY｜MI-G

    ---
    <!-- kianos:kp id="hematology-h16-kp21" -->
    ## KP21｜SLE与APS出口：炎症性器官损伤 vs 血栓性表型并行

    > **主提示：SLE主轴1｜APS主轴1｜PLT共同点｜肾/流产｜下一Block**

    ### 快速核对

```text
SLE主轴
= 免疫复合物 / 自身抗体造成多器官炎症与损伤

APS主轴
= 抗磷脂抗体造成动静脉血栓、流产、血小板减少
```

二者可共存，但病例逻辑不同：

- 蛋白尿、低补体、dsDNA升高 → 活动性SLE / 狼疮肾方向；
- 反复血栓或流产 + APL → APS方向。

最低出口：先判断当前危险来自**炎症性器官损害**还是**血栓性事件**。

    **Routing**：CORE｜CONFUSABLE｜MI-G

    ---
# 4｜Framework Reconstruction

```text
① 画SLE三路：免疫复合物、抗细胞抗体、APS。
② 写ANA / dsDNA / Sm三者分工。
③ 写ENA五项及SSA、RNP、rRNP器官关联。
④ 写APL三抗体和三类临床表现。
⑤ 写抗RBC / PLT / 神经元三路与Ret / Coombs方向。
⑥ 写活动指标和4个活动无关抗体。
⑦ 区分狼疮小体与狼疮细胞。
⑧ 写白金耳、狼疮带、Libman-Sacks、洋葱脾、纤维素样坏死。
⑨ 写皮黏、浆膜、非侵蚀关节、血液、肾、神经表现。
⑩ 解释Jaccoud为何“像RA但不是侵蚀性RA”。
⑪ 写治疗4层和狼疮危象入口。
⑫ 明确H16-SC01与三个Source Boundary。
```

---

# 5｜Memory Routing

## MI-G

1. Ⅲ型免疫复合物是SLE主轴，血细胞破坏有Ⅱ型接口；
2. ANA筛查、dsDNA活动/肾、Sm最高特异；
3. APL三抗体与血栓—流产—PLT低；
4. 狼疮小体 / 细胞、白金耳、狼疮带、Libman-Sacks、洋葱脾；
5. 非侵蚀性关节炎和Jaccoud；
6. 低补体 + dsDNA + 器官证据判断活动；
7. 背景HCQ，GC + 免疫抑制剂，危象冲击；
8. 炎症性器官损害与APS血栓分流。

## MI-D

- ENA全部器官配对；
- 狼疮危象完整清单；
- 所有皮肤血管表现；
- 生物制剂完整药名与适应证；
- APS正式标准、抗凝和产科管理；
- 狼疮肾完整分型与治疗；
- H16-SC01的题目版本冲突。

---

# 6｜Study 原图门禁与 Source Registry

## 原图门禁

1. `27病理精编版合集【带导图】.pdf` 实际 PDF P103：狼疮小体 / 细胞、白金耳、蝶形 / 盘状红斑、Libman-Sacks、洋葱脾；
2. 同页病理形态必须以原图学习，不依赖文字想象；
3. 内科抗体谱与临床总图若需视觉重建，回原 Lecture / MarginNote。

## Registry

| ID | 类型 | 内容 | 当前处置 |
|---|---|---|---|
| H16-SC01 | Source Conflict | 内科真题区活动性抗体答案与正文/Outline稳定口径不一致 | 正文保持dsDNA为最佳活动指标；题目原答案不静默改写，待正式Source核对 |
| H16-SG01 | Source Gap | 当前无完整APS标准、长期抗凝和妊娠管理 | 只学习抗体与血栓/流产/PLT低主轴 |
| H16-SB01 | Ownership Boundary | 狼疮肾完整分型和治疗归泌尿系统 | H16只建立器官落点和危重入口 |
| H16-SB02 | Ownership Boundary | 超敏反应最低语言归H12 | H16只Apply，不重复完整初见 |

```text
formal_source_gap_count = 1
formal_source_conflict_count = 1
formal_source_boundary_count = 2
visual_source = AVAILABLE_PATHOLOGY_WITH_MAP_PDF
silent_source_correction = 0
```

---

# 7｜Outline Coverage Safety Net

```text
PATH-U010-H16_total = 7
INT-U102_total = 16
Outline_total = 23
mapped = 23
unmapped = 0
missing = 0
duplicate_primary = 0
```

| Outline范围 | 题数 | Primary KP |
|---|---:|---|
| 病理5类表现、狼疮小体/细胞、白金耳、狼疮皮、Libman-Sacks、洋葱脾 | 7 | KP10–KP13 |
| 抗核抗体谱与角色 | 3 | KP02–KP05、KP09 |
| APL | 1 | KP06–KP07 |
| 抗组织细胞抗体 | 1 | KP08 |
| RF / ANCA及病例识别 | 2 | KP02、KP18 |
| 活动指标 | 1 | KP04、KP09 |
| 生活与治疗 | 4 | KP19–KP20 |
| 诊断、溃疡、滑膜炎、Jaccoud | 4 | KP14–KP18 |
| **合计** | **23** | **23 / 23** |

---

# 8｜Lecture Knowledge Routing Audit

| Lecture范围 | 路由 | 边界 |
|---|---|---|
| 自身抗体与免疫复合物主轴 | KP01–KP09 | 不补耐受机制全章 |
| 病理形态 | KP10–KP13 | 原图必回Study |
| 临床表现与诊断 | KP14–KP18 | 肾分型和神经定位后置 |
| 治疗与危象 | KP19–KP20 | 保持当前Study口径 |
| APS | KP06–KP07、KP21 | 不扩抗凝/产科 |

```text
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
```

---

# 9｜First-pass Question Probe

```text
来源：TTSX Lecture-attached Questions
选择方式：LectureQuestionBinding 自动提供
绑定范围：病理P87 / 内科P273–276的source-position relation
状态：待绑定
```

---

# 10｜Block Production Gate

```text
Study_continuity = PASS
natural_mechanism_split = 0
repeated_first_exposure = 0
Framework_is_map = PASS
KP_natural_units = 21
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
Source_gap = SOURCE_CONFLICT_AND_BOUNDARY_EXPLICIT
Visual_gate = REQUIRED_AND_AVAILABLE
System_final_gate = NOT_RUN_NON_FINAL_BATCH
```

---

# 11｜Block Complete

```text
Framework已建立
+ H12最低免疫语言已Recall
+ 病理P87与原图P103已学习
+ 内科P273–276已连续学习
+ 能给每类抗体标注筛查/特异/活动/器官角色
+ 能重建SLE三条损伤支路
+ 能识别五个病理形态锚
+ 能区分SLE炎症器官损害与APS血栓表型
+ 能识别狼疮危象
+ KP Active Recall完成
+ Outline按需低压力扫漏
+ TTSX题待绑定或已完成
```

**最低出口**：看到 SLE病例时，不背“多系统”四个字；要能指出是哪条免疫支路、哪个器官落点、哪个指标看活动、当前是否已进入器官危象或APS血栓事件。
