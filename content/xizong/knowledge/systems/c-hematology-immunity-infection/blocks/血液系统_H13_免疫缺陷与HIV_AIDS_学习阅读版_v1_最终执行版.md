---
type: block_guide
schema_version: 1
content_version: 1
system: 血液—免疫—感染
system_id: hematology_immunity_infection
block_id: hematology-h13
title: 免疫缺陷与 HIV / AIDS
order: 13
status: FINAL_EXECUTION
study_refs:
  - source_id: pathology-lecture
    label: 病理学讲义_AI阅读版｜AIDS与其它免疫缺陷病
    pdf_page_start: 89
    pdf_page_end: 94
    action: primary
  - source_id: hematology-h12
    label: H12｜免疫共同语言、超敏反应与自身耐受
    action: recall
  - source_id: hematology-h11
    label: H11｜淋巴瘤
    action: interface
  - source_id: respiratory-system
    label: 呼吸系统｜肺部机会性感染与肺结核接口
    action: recall_apply
outline_units:
  - PATH-U010-H13-SUBSET
outline_primary_count: 7
kp_count: 13
prerequisites:
  - hematology-h12
next_blocks:
  - hematology-h14
  - hematology-h20
  - hematology-h21
visual_gates:
  - pathology-with-map-p105-hiv-structure-entry-targets
  - pathology-with-map-p106-primary-immunodeficiency-table
  - pathology-with-map-p110-immunity-mindmap
visual_gate_status: VISUAL_SOURCE_AVAILABLE
source_gap_status: SOURCE_BOUNDARY_EXPLICIT
source_boundaries:
  - H13-SG01
  - H13-SG02
  - H13-SR01
  - H13-OM01
system_final_batch: false
---

# H13｜免疫缺陷与 HIV / AIDS
## 不先背病原名单：先判断缺的是 T、B、联合免疫，还是粒细胞杀菌功能

> **中心问题**：当免疫系统某一层缺失时，怎样从“细胞是否存在、功能是否有效、宿主能否组织典型病理反应”定位缺陷；HIV 又怎样通过 CD4 T细胞主损伤和储备池持续存在，最终使机会性感染和肿瘤同时增加？
>
> **文件性质**：血液—免疫—感染系统第十三个 canonical Block。H12 已建立抗体、免疫复合物和 T细胞损伤的最低语言；本 Block 转向“系统不够用”时会发生什么。
>
> **Primary Study**：`病理学讲义_AI阅读版.md` PDF P89–90、P92–94《获得性免疫缺陷综合征 AIDS / 其它免疫缺陷病》。原图核对使用 `27病理精编版合集【带导图】.pdf` PDF P105–110。
>
> **Primary Outline**：病理 U010 中 HIV / AIDS 与原发免疫缺陷 **7个去重后的语义 Primary**。原题纲清洗文本把“原发性免疫缺陷常见类型”在 AIDS 小节与“其它免疫缺陷病”小节各出现一次；本 Block 合并为同一知识身份，不制造重复 Primary。
>
> **Source boundary**：当前 Source 不支持完整 HIV 诊断流程、CD4 分层阈值、抗逆转录病毒治疗、暴露后预防、机会性感染治疗或完整病原谱。只冻结 Lecture 已明确的病理、传播、靶细胞、代表性感染和肿瘤。

---

## 0｜第一轮固定流程

```text
Framework Orientation
→ 病理 Lecture P89–90 连续学习
→ 回原图核对 HIV入侵图与4类原发免疫缺陷表
→ P92–94 真题低压力核对
→ Recall H12：B / T / 抗体 / T细胞最低语言
→ Recall H11：免疫缺陷与淋巴瘤接口
→ Lecture Done
→ Framework Reconstruction
→ KP Active Recall
→ Outline Quick Check（可选、低压力）
→ TTSX Lecture-attached Questions
→ Block Complete
```

第一轮只抓住两条链：

```text
先天 / 原发缺陷
  ├─ 胸腺发育不良 → T细胞缺陷
  ├─ Bruton → B细胞 + γ球蛋白缺陷
  ├─ SCID → T、B联合缺陷
  └─ CGD → 粒细胞存在，但过氧化氢相关杀菌功能差

HIV获得性缺陷
  HIV为RNA病毒
  → gp120 + CD4 + CXCR4 / CCR5进入相关细胞
  → CD4 T细胞为主要靶细胞
  → 巨噬细胞 / 滤泡树突状细胞成为储备池
  → 早期淋巴滤泡增生
  → 晚期淋巴细胞耗竭、典型肉芽肿反而少见
  → 机会性感染 + Kaposi肉瘤 / 淋巴瘤
```

---

# 1｜总 Framework

<!-- kianos:framework id="hematology-h13-framework-main" -->

```text
免疫缺陷定位
  ↓
先分来源
  ├─ 原发 / 先天
  └─ 获得 / 继发：HIV / AIDS为本Block主体
  ↓
再分故障层
  ├─ T细胞层
  ├─ B细胞 / 抗体层
  ├─ T + B联合层
  └─ 粒细胞杀菌功能层
  ↓
判断“有细胞”还是“有功能”
  ├─ 数量 / 发育缺陷
  └─ 细胞存在但杀菌能力差
  ↓
看宿主后果
  ├─ 机会性感染
  ├─ 典型组织反应减弱或改变
  ├─ 多器官受累
  └─ 恶性肿瘤增加
  ↓
HIV特异主线
  靶细胞 / 储备池
  → 入侵受体
  → 传播与体液
  → 早晚期淋巴组织变化
  → AIDS四个出口表现
```

---

# 2｜KP Active Recall

<!-- kianos:kp id="hematology-h13-kp01" -->
## KP01｜免疫缺陷总坐标：原发 / 获得 × T / B / 联合 / 粒细胞功能

> **主提示：来源2类｜故障4层｜细胞在不在vs功能行不行｜后果2大类**

### 1｜来源

- **原发性免疫缺陷**：以 Study 列举的先天性胸腺发育不良、Bruton、SCID、慢性肉芽肿病为代表；
- **获得性 / 继发性免疫缺陷**：AIDS 为当前主体。

### 2｜四个故障层

```text
T细胞缺陷
B细胞 / 抗体缺陷
T、B联合缺陷
粒细胞功能缺陷
```

### 3｜先问“数量”还是“功能”

慢性肉芽肿病的关键不是粒细胞不存在，而是：

> **粒细胞功能缺陷，过氧化氢产生障碍，不能完成当前 Study 所指的有效杀菌。**

这建立一个后续通用判断：

```text
细胞数量存在
≠
细胞功能一定正常
```

### 4｜两大后果

- 病原控制失败 → 机会性感染；
- 免疫控制下降 → 肿瘤风险增加。

当前 Source 不提供完整“缺陷类型—全部病原”表，不在这里扩写。

**Routing**：CORE｜BOUNDARY｜MI-G

---

<!-- kianos:kp id="hematology-h13-kp02" -->
## KP02｜四个原发性免疫缺陷原型：一眼定位故障层

> **主提示：DiGeorge=T｜Bruton=B+γ｜SCID=T+B｜CGD=粒功能/H₂O₂**

| 疾病 | 当前 Study 身份 | 最小定位 |
|---|---|---|
| 先天性胸腺发育不良 / DiGeorge | T细胞缺陷 | 胸腺—T细胞层 |
| Bruton 综合征 | X连锁隐性；B细胞和γ球蛋白缺陷 | B细胞—抗体层 |
| 原发性重症联合免疫缺陷病 | T、B细胞缺陷 | 联合免疫层 |
| 慢性肉芽肿病 CGD | 粒细胞功能缺陷；过氧化氢产生障碍 | 吞噬细胞有，但杀菌功能差 |

（易混：CGD 名称含“肉芽肿”，当前 Block 的考点却是粒细胞杀菌功能缺陷；不要只按名称判断其病理身份。）

**Routing**：CORE｜RECOGNITION｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="hematology-h13-kp03" -->
## KP03｜HIV基本身份：RNA病毒；主要摧毁 CD4 T细胞系统

> **主提示：病毒核酸1｜主要细胞1｜不感染谁｜储备池2｜另累及1系统**

当前 Study 冻结：

- HIV 为 **RNA病毒**；
- 主要感染 **CD4 T细胞 / 辅助性T细胞**；
- 不以 B淋巴细胞为当前靶细胞；
- 单核—巨噬细胞与滤泡树突状细胞可作为储备池；
- 神经系统也可受累。

主次必须分开：

```text
主要被持续削弱的免疫主轴
= CD4 T细胞

可长期携带并帮助病毒扩散的储备池
= 巨噬细胞 + 滤泡树突状细胞
```

（易混：CD8 T细胞是细胞毒性 T细胞；不是当前 HIV“主要细胞”的答案。）

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="hematology-h13-kp04" -->
## KP04｜HIV进入细胞：gp120、CD4与两个共受体

> **主提示：病毒配体1｜主受体1｜共受体2｜CXCR4偏谁｜CCR5偏谁**

当前 Lecture 给出的入侵链：

```text
HIV包膜 gp120
→ 结合细胞膜 CD4受体
→ 同时识别共受体 CXCR4 / CCR5
→ 进入细胞
```

Study 旁注进一步区分：

- **CXCR4**：HIV 附着淋巴细胞所必需；
- **CCR5**：促进 HIV 进入巨噬细胞。

这里不展开病毒复制、整合、装配和药物靶点，因为当前 Source 未系统提供。

**Routing**：CORE｜VISUAL_ONLY｜MI-G

---

<!-- kianos:kp id="hematology-h13-kp05" -->
## KP05｜主要靶细胞 vs 储备池：为什么病毒能持续存在

> **主提示：CD4=主战损｜巨噬/FDC=2池｜谁不易快死｜谁为主储备池｜扩散后果**

### 1｜CD4 T细胞是主要损伤对象

其显著减少是完全型 AIDS 的核心表现之一。

### 2｜巨噬细胞与滤泡树突状细胞是储备池

当前 Study 说明：

- 单核—巨噬细胞较能抵抗 HIV 的致细胞病变作用，不会迅速死亡；
- 因而可成为储存场所，并在病毒扩散中发挥作用；
- 淋巴结生发中心的滤泡树突状细胞也可感染并成为储备池；
- 讲义旁注强调以滤泡树突状细胞为主。

所以：

```text
“主要被攻击”
≠
“最适合长期储存病毒”
```

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="hematology-h13-kp06" -->
## KP06｜传播与体液：按传播路径反推，不把所有体液都算进去

> **主提示：传播4路｜有病毒体液5｜无5｜职业暴露归哪路**

### 1｜当前 Study 的4类传播入口

1. 性传播；
2. 血液传播；
3. 母婴传播；
4. 医务人员职业传播。

职业传播的本质仍是血液暴露接口。

### 2｜当前 Study 列出的5类主要体液

- 血液；
- 精液；
- 子宫分泌物；
- 阴道分泌物；
- 乳汁。

### 3｜常见干扰体液

当前讲义明确排除：

- 唾液；
- 泪液；
- 消化液；
- 尿液；
- 汗液。

（边界：本段只冻结当前 Study 的考试列表，不扩写现代公共卫生暴露风险评估。）

**Routing**：CORE｜RECOGNITION｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h13-kp07" -->
## KP07｜淋巴结时间轴：早期“生机勃勃”，晚期“一片荒芜”

> **主提示：早2变｜晚4变｜病原多/肉芽肿少｜为什么不能只看病原**

### 1｜早期

```text
淋巴结肿大
+ 淋巴滤泡明显增生
```

表示免疫组织受到刺激并作出反应。

### 2｜晚期

- 淋巴细胞几乎消失殆尽；
- 仅残留少量巨噬细胞和浆细胞；
- 血管和纤维组织增生；
- 可见大量分枝杆菌、真菌等；
- 却很少见到典型肉芽肿。

### 3｜最重要的病理认识

```text
病原很多
+ 宿主免疫反应很弱
→ 不一定形成“更典型”的肉芽肿
```

所以组织形态由：

> **病原性质 × 宿主免疫能力**

共同决定。

**Routing**：CORE｜CONNECTION｜VISUAL_ONLY｜MI-G

---

<!-- kianos:kp id="hematology-h13-kp08" -->
## KP08｜脾与胸腺：不同淋巴器官的晚期表现并不一样

> **主提示：脾大但白髓？｜成人胸腺2种｜儿童胸腺1变｜共同方向**

当前 Study：

### 脾

- 脾大是 AIDS 的常见体征；
- 淋巴细胞高度耗竭；
- 白髓仅残留少量，甚至完全消失。

### 胸腺

- 成人 AIDS：可无明显病变，也可出现滤泡增生；
- 儿童 AIDS：胸腺过早退化。

（易混：器官“变大”不等于有效免疫细胞增多；脾大可与白髓耗竭并存。）

**Routing**：CORE｜SPECIAL｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h13-kp09" -->
## KP09｜完全型 AIDS：4个出口表现

> **主提示：抗体1｜CD4方向｜机会感染3器官｜恶性肿瘤2类**

当前 Study 的4项：

1. 抗 HIV 抗体阳性；
2. CD4 T细胞显著减少；
3. 多发机会性感染；
4. 恶性肿瘤增加。

不要把“抗 HIV 抗体阳性”误解成保护性免疫已经足够。当前病例结构是：

```text
抗体可阳性
但CD4系统持续衰竭
→ 仍可进入严重机会感染与肿瘤阶段
```

当前 Source 没有提供完整诊断分期与实验室阈值，不能由本 Block补齐。

**Routing**：CORE｜CONFUSABLE｜MI-G

---

<!-- kianos:kp id="hematology-h13-kp10" -->
## KP10｜机会性感染：先记器官入口，再记当前 Study 的代表病原

> **主提示：常见器官3｜肺70%｜CNS 3病原｜HPV位置边界｜完整治疗？**

### 1｜三个常见受累系统

- 中枢神经系统；
- 肺；
- 消化道。

### 2｜当前 Lecture 的高频比例与代表

- 约70%可出现当前 Study 所称的**孢子菌肺炎**；
- 中枢列举：新型隐球菌、弓形虫、巨细胞病毒 CMV；
- Lecture 另写“HPV多见”。

### 3｜Source reading boundary

“HPV多见”在原页排版紧邻中枢病原列表，但其具体器官归属没有在 AI-readable 文字中安全展开。因此本文件：

- 保留 HPV 多见这一考试识别；
- 不把它强行列为中枢机会感染；
- 不扩写各病原治疗。

**Routing**：CORE｜RECOGNITION｜BOUNDARY｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h13-kp11" -->
## KP11｜恶性肿瘤：Kaposi 肉瘤与淋巴瘤同时进入警戒

> **主提示：Kaposi 30%｜另一常见瘤1｜来源2内皮｜组成2｜分界？｜部位3**

当前 Study：

- 约30%患者可出现 Kaposi 肉瘤；
- 其它常见伴发肿瘤为淋巴瘤。

Kaposi 肉瘤病理：

- 来源于血管或淋巴内皮细胞；
- 由梭形细胞和血管构成；
- 瘤细胞弥漫分布；
- 实质与间质分界不清；
- 可累及皮肤、黏膜、肺等。

//串联：淋巴瘤完整来源—结构—免疫表型模型归 H11；H13只解释免疫缺陷为何使其风险上升。

**Routing**：CORE｜VISUAL_ONLY｜CONNECTION｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h13-kp12" -->
## KP12｜感染很多却肉芽肿少：宿主反应本身也是病理图的一部分

> **主提示：病原量↑｜肉芽肿方向｜原因1｜与结核H21串联**

当前 Study 明确强调：

```text
HIV晚期免疫力下降
→ 分枝杆菌 / 真菌等可大量存在
→ 但组织难以组织典型肉芽肿
```

这与“病原越多，肉芽肿越明显”的机械想法相反。

//串联：H21 结核跨器官整合中，HIV 合并结核更偏向免疫缺乏宿主表现，可出现肺门 / 纵隔淋巴结肿大、肺外播散，空洞、肉芽肿和 PPD反应可减少。完整结核模型后置 H21。

**Routing**：CORE｜CONFUSABLE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h13-kp13" -->
## KP13｜反向定位算法：从感染和病理反应推测缺陷层

> **主提示：先原/继｜再T/B/联合/粒功能｜再宿主反应｜最后HIV4证据**

```text
反复 / 机会性感染
→ 先问原发还是获得
→ 看T、B、联合还是粒细胞功能
→ 问细胞是否存在但功能差
→ 看能否形成典型肉芽肿 / 淋巴结构
→ 若考虑HIV：
   CD4 T显著↓？
   主要靶细胞与储备池是否符合？
   是否有机会感染？
   是否有Kaposi / 淋巴瘤？
```

不能凭某一个病原直接倒推出唯一缺陷，因为当前 Source 没有给完整感染谱映射。

**Routing**：CORE｜RECOGNITION｜BOUNDARY｜MI-G

---

# 3｜高密度比较与病例算法

## 3.1 四类原发免疫缺陷原型

| 判断轴 | DiGeorge | Bruton | SCID | CGD |
|---|---|---|---|---|
| 主要故障层 | T细胞 | B细胞 / γ球蛋白 | T + B | 粒细胞杀菌功能 |
| Study关键词 | 胸腺发育不良 | X连锁隐性 | 重症联合 | 过氧化氢产生障碍 |
| 关键边界 | 不是B缺陷 | 抗体层 | 多条通路 | 细胞可存在但功能差 |

## 3.2 HIV主链快速核对

```text
RNA病毒
→ gp120结合CD4 + CXCR4 / CCR5
→ CD4 T细胞为主要靶细胞
→ 巨噬细胞 / 滤泡树突状细胞为储备池
→ 性 / 血 / 母婴 / 职业传播
→ 早期滤泡增生
→ 晚期淋巴细胞耗竭、肉芽肿少
→ 抗HIV抗体阳性 + CD4显著↓
→ 多发机会感染 + Kaposi / 淋巴瘤
```

## 3.3 病例固定起手式

```text
感染部位与病原线索
→ 宿主是否形成典型炎症 / 肉芽肿
→ CBC / 淋巴组织是否提示细胞耗竭
→ 原发缺陷原型还是获得性HIV
→ 若HIV：靶细胞、传播、早晚期、机会感染、肿瘤五层核对
```

---

# 4｜Framework Reconstruction

完成 Lecture 后闭卷重建：

```text
① 写原发 / 获得两类免疫缺陷。
② 写T / B / 联合 / 粒细胞功能四个故障层。
③ 不看表写DiGeorge、Bruton、SCID、CGD对应关系。
④ 解释CGD为何是“有粒细胞但杀菌差”。
⑤ 写HIV的病毒核酸类型。
⑥ 写HIV主要靶细胞、两个储备池和不感染的细胞。
⑦ 画gp120—CD4—CXCR4 / CCR5入侵链。
⑧ 写传播4路和有 / 无病毒体液。
⑨ 画淋巴结“早增生—晚荒芜”时间轴。
⑩ 写脾与成人 / 儿童胸腺变化。
⑪ 写完全型AIDS四项。
⑫ 写机会感染3个常见器官、70%肺炎和CNS代表病原。
⑬ 写Kaposi 30%、来源、组成、分界和部位。
⑭ 解释为何晚期病原多而肉芽肿少。
⑮ 说出当前不能补写的诊断、ART和治疗范围。
```

---

# 5｜Memory Routing

## MI-G｜第一轮必须即时掌握

1. 免疫缺陷先分原发 / 获得；
2. DiGeorge = T；Bruton = B + γ球蛋白；SCID = T + B；CGD = 粒细胞功能；
3. HIV为RNA病毒；
4. HIV主要感染CD4 T细胞；不以B细胞为主要靶；
5. 巨噬细胞与滤泡树突状细胞为储备池；
6. gp120—CD4—CXCR4 / CCR5；
7. 性、血、母婴、职业传播；
8. 早期滤泡增生，晚期淋巴细胞耗竭；
9. 晚期病原可多、肉芽肿反而少；
10. 完全型AIDS四项；
11. 机会感染常累及CNS、肺、消化道；
12. Kaposi肉瘤与淋巴瘤增加。

## MI-D｜进入 MarginNote 3

- HIV结构全部蛋白；
- CXCR4 / CCR5细节；
- 传播体液完整列表；
- 70%与30%比例；
- 全部机会性感染病原；
- Kaposi所有形态；
- 成人 / 儿童胸腺细节；
- 原发免疫缺陷其它疾病名单；
- HIV诊断阈值、ART、PEP和感染治疗，等待完整 Source。

---

# 6｜Study 原图门禁与 Source Registry

必须回正式 Study / 原图核对：

1. `27病理精编版合集【带导图】.pdf` P105：HIV结构、gp120—CD4 / 共受体入侵图与受累器官图；
2. P106：DiGeorge / Bruton / SCID / CGD四行对照表；
3. P105：早晚期淋巴组织文字与机会感染 / 肿瘤比例；
4. P110：免疫性疾病思维导图与HIV真题收口；
5. 原始淋巴结早晚期形态和Kaposi切片若单独提供，应回原图识别，不凭文字想象。

## Registry

| ID | 类型 | 内容 | 当前处置 |
|---|---|---|---|
| H13-SG01 | Source Gap | 当前没有完整正常免疫学和“缺陷类型—全部感染谱”Lecture | 只保留4个原发缺陷原型和HIV主体；不扩百科式病原映射 |
| H13-SG02 | Source Gap | 当前没有完整HIV诊断、ART、PEP与机会感染治疗 | 全部Defer，不用外部指南静默补齐 |
| H13-SR01 | Source Reading Boundary | “HPV多见”紧邻中枢病原列表，但AI-readable Source未安全说明器官归属 | 保留HPV多见；不强行归入CNS清单 |
| H13-OM01 | Outline Metadata | U010清洗文本将“原发免疫缺陷常见类型”在AIDS与其它免疫缺陷两处重复表达 | 合并为1个Primary identity；H13总计7项 |

```text
visual_source = AVAILABLE_PATHOLOGY_WITH_MAP_PDF
formal_source_gap_count = 2
formal_source_conflict_count = 0
formal_source_boundary_count = 1
outline_metadata_exception_count = 1
silent_source_correction = 0
```

---

# 7｜Outline Coverage Safety Net

## 7.1 Primary ledger

```text
PATH-U010-H13_raw_semantic_lines = 8
merged_duplicate_identity = 1
outline_primary_total = 7
mapped = 7
unmapped = 0
missing = 0
duplicate_primary = 0
```

| Outline语义身份 | 计数 | Primary KP |
|---|---:|---|
| HIV感染细胞、主要靶细胞与储备池 | 1 | KP03–KP05 |
| 传播途径与体液 | 1 | KP06 |
| 淋巴组织早晚期病理 | 1 | KP07–KP08 |
| 完全型AIDS四项、机会感染与肿瘤 | 1 | KP09–KP11 |
| 原发免疫缺陷类型与故障层 | 1 | KP01–KP02 |
| HIV为RNA病毒 | 1 | KP03 |
| Kaposi肉瘤病理 | 1 | KP11 |
| **合计** | **7** | **7 / 7** |

### 7.2 Ownership说明

- H12拥有最低免疫语言和四型超敏；H13只Recall；
- H11拥有淋巴瘤完整模型；H13只保留免疫缺陷下风险增加；
- H20–H24拥有感染主体；H13只学习机会感染入口和宿主反应改变；
- H21拥有HIV合并结核的跨器官整合；H13只保留“病原多、肉芽肿少”的机制接口；
- H14拥有移植排斥与GVHD；不在H13扩写。

学习者侧：Outline用于低压力验漏，不要求做完全部题才完成Block。

---

# 8｜Lecture Knowledge Routing Audit

| Lecture范围 | 路由 | Knowledge Role | 边界 |
|---|---|---|---|
| P89 HIV靶细胞与入侵 | KP03–KP05 | CORE + CONFUSABLE + VISUAL_ONLY | 不展开复制周期 |
| P89传播与体液 | KP06 | CORE + RECOGNITION | 不扩公共卫生算法 |
| P89早晚期淋巴结 | KP07 | CORE + VISUAL_ONLY | 原始切片需回图 |
| P89脾 / 胸腺 | KP08 | SPECIAL + MI-D | 不扩器官免疫学 |
| P89完全型AIDS | KP09–KP10 | CORE + CONNECTION | 诊断阈值 / 治疗后置 |
| P90 Kaposi | KP11 | CORE + VISUAL_ONLY | 完整肿瘤学后置 |
| P90其它免疫缺陷 | KP01–KP02 | CORE + RECOGNITION | 只保留4个Source原型 |
| HIV肉芽肿接口 | KP12 | CONFUSABLE + CONNECTION | 完整结核归H21 |
| 病理P92–94真题 | Coverage / Probe | RECOGNITION | Question relation待绑定 |

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
病理免疫性疾病 P89–94 中 HIV / AIDS与免疫缺陷题旁内容

状态：
待绑定
```

不得从病理 U010 手工挑题冒充 Lecture-attached Questions。

---

# 10｜Block Production Gate

```text
Study_continuity = PASS
natural_mechanism_split = 0
repeated_first_exposure = 0
Framework_is_map = PASS
KP_natural_units = 13
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
Source_gap = SOURCE_BOUNDARY_EXPLICIT
formal_source_conflict_count = 0
formal_source_boundary_count = 3
outline_metadata_exception_count = 1
Visual_gate = REQUIRED_AND_AVAILABLE
System_final_gate = NOT_RUN_NON_FINAL_BATCH
```

---

# 11｜Block Complete

```text
Framework已建立
+ 病理P89–90已连续学习并核对P92–94
+ 能按原发 / 获得与T / B / 联合 / 粒功能定位
+ 能不看表写DiGeorge、Bruton、SCID、CGD
+ 能解释“粒细胞存在但功能差”
+ 能写HIV主要靶细胞、储备池与不感染的细胞
+ 能画gp120—CD4—CXCR4 / CCR5入侵链
+ 能写传播4路和有 / 无病毒体液
+ 能重建早期增生—晚期荒芜时间轴
+ 能写完全型AIDS四项
+ 能识别机会感染3器官与Kaposi / 淋巴瘤
+ 能解释病原多而肉芽肿少
+ 能明确诊断、ART、PEP和感染治疗属于Source Boundary
+ KP Active Recall完成
+ Outline按需低压力扫漏
+ TTSX Lecture-attached Questions待绑定或已完成
```

**最低出口**：面对“反复感染 / 机会感染”的病例，先判断 **原发还是获得 → T、B、联合还是粒细胞功能 → 宿主能否形成典型组织反应**；若考虑 HIV，再核对 **CD4、储备池、早晚期淋巴变化、机会感染和肿瘤**。
