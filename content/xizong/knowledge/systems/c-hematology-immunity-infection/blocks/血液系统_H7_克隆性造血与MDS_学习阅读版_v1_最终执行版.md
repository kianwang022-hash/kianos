---
type: block_guide
schema_version: 1
content_version: 1
system: 血液—免疫—感染
system_id: hematology_immunity_infection
batch_id: P21
block_id: hematology-h07
title: 克隆性造血与骨髓增生异常性肿瘤（MDS）
order: 7
status: FINAL_EXECUTION
study_refs:
  - source_id: internal-medicine-lecture
    label: 内科学讲义_AI阅读版｜MDS
    sequence_page_start: 206
    sequence_page_end: 208
    action: primary
  - source_id: hematology-h01
    label: H1｜造血、CBC、Ret与骨髓诊断语言
    action: recall
  - source_id: hematology-h04
    label: H4｜再生障碍性贫血
    action: recall_compare
  - source_id: pathology-u019-gate
    label: O9｜病理U019肿瘤总论 Gate
    action: recall
  - source_id: molecular-g1-g5
    label: G1–G5｜核酸、中心法则、DNA损伤与癌基因
    action: recall
outline_units:
  - INT-U082
outline_primary_count: 12
kp_count: 13
prerequisites:
  - hematology-h01
  - pathology-u019-gate
  - molecular-g1-g5
soft_prerequisites:
  - hematology-h04
next_blocks:
  - hematology-h08
  - hematology-h09
visual_gates:
  - internal-p206-mds-fab-who-classification
  - internal-p207-ipss-r-table
  - internal-p207-mds-dysplasia-morphology
  - internal-p208-mds-aa-megaloblastic-comparison
visual_gate_status: REQUIRED_WITH_INTERNAL_ORIGINAL_PDF_GAP
source_gap_status: SOURCE_BOUNDARY_EXPLICIT
source_boundaries:
  - H7-SB01
  - H7-SB02
system_final_batch: false
---

# H7｜克隆性造血与骨髓增生异常性肿瘤（MDS）
## 骨髓并非“造不动”，而是异常克隆在病态、无效地造；先看质量，再看原始细胞是否继续上升

> **FIRST PASS 固定流程**
>
> `Framework → Lecture → Framework Reconstruction → KP Active Recall → Outline optional / low-pressure → TTSX Lecture-attached Questions → Block Complete`
>
> 本文件负责地图、主动提取与核对。完整深度仍由《内科学讲义_AI阅读版》P206–208承担；Outline只做低压力验漏。

---

# 1｜Framework｜先把 MDS 放回“骨髓工厂”

## 1.1 中心问题

面对贫血或全血细胞减少，不能只问“少了多少”，还要问：

> **骨髓是整体停工，还是被异常克隆接管后仍在生产，但生产出来的细胞形态异常、成熟无效，最终外周反而减少？**

MDS 的主电影：

```text
造血干 / 祖细胞出现异常克隆
→ 分化与成熟质量下降
→ 一系到三系病态造血
→ 多数情况下骨髓仍活跃
→ 但有效成熟、有效输出不足
→ 外周贫血或多系细胞减少
→ 原始细胞逐渐增多 / 克隆继续进展
→ 可向 AML 转化
```

这里第一次真正建立的是：

> **“骨髓活跃”不等于“造血有效”。**

这也是 H7 与 H4 再障最关键的认知分叉。

## 1.2 三个相邻位置

```text
AA
骨髓整体低增生 / 生产量不足
        ↓
MDS
异常克隆 + 病态 / 无效成熟
多数骨髓活跃，但外周可少
        ↓
AML
原始细胞进一步扩张，成熟阻滞成为主矛盾
```

- **H4 AA**：Primary 是“低增生、三系少、巨核显著少”。
- **H7 MDS**：Primary 是“克隆性 + 病态造血 + 无效输出 + 转白风险”。
- **H9 AML**：完整急性白血病模型后置；H7只建立原始细胞门槛接口。

## 1.3 当前 Block 的四个学习问题

1. 为什么 MDS 可以骨髓活跃，外周却贫血 / 全血细胞减少？
2. 什么证据说明它不是单纯营养缺乏或再障，而是病态 / 克隆性造血？
3. 原始细胞、FAB / WHO 分型与 IPSS-R 各在回答什么不同问题？
4. 治疗为什么要按克隆风险、年龄、原始细胞和细胞遗传学分层？

---

# 2｜Ownership 与动作边界

| 内容 | 本 Block 动作 | 完整 Primary / 后续边界 |
|---|---|---|
| 正常三系造血、CBC、Ret、骨穿 vs 活检 | Recall | H1 |
| 肿瘤克隆、分化、DNA损伤、染色体证据 | Recall | O9 + G1–G5 |
| AA低增生骨髓 | Recall / Compare | H4 |
| 巨幼贫 / 一碳与DNA成熟 | Recall / Compare | H3 + M8/M9 |
| MDS病态造血、分型、FISH、IPSS-R、治疗 | **Primary Learn** | H7 |
| AML完整分类、免疫表型、遗传与治疗 | Defer | H9 |
| CML / CMML完整慢性髓系肿瘤模型 | Defer | H10；本处只保留分型边界 |

### Source Boundary Registry

| ID | 类型 | 内容 | 当前处置 |
|---|---|---|---|
| H7-SB01 | Source Boundary | 当前 Lecture 同时保留旧 FAB 与 WHO 第五版 MDS / AML 门槛与命名；考试时按当前 Study Source 识别，不自行改写成外部最新分类 | 原样保留；不外部升级 |
| H7-SB02 | Source Boundary | 当前 Lecture 对孤立 del(5q) 的生物调节剂写作“沙利度胺” | 作为当前 Study 口径保留；不静默替换 |
| H7-VG01 | Visual Source Gap | AI-readable 正文可读，但内科原 PDF / Source Page 图像当前未挂载到本任务的视觉层 | 表格和病态形态必须回原图核对；不凭模型猜图 |

```text
visual_source = AI_READABLE_TEXT_AVAILABLE
visual_source_gap = INTERNAL_ORIGINAL_PDF_NOT_MOUNTED
formal_source_boundary_count = 2
formal_source_conflict_count = 0
```

---

# 3｜从“病态造血”到风险分层

<!-- kianos:kp id="hematology-h07-kp01" -->
## KP01｜MDS 的第一身份：克隆性 + 病态造血 + 无效输出

> **主提示：克隆1｜病态1–3系｜髓多活｜外周少｜转AML**

### Detailed Expansion

MDS 不是“另一种贫血”，而是造血干 / 祖细胞层面的异常克隆性疾病。当前 Study 用“病态造血”概括其最核心身份：细胞可以被造出来，但分化、成熟和形态质量异常，部分细胞甚至在骨髓内就失败。

```text
异常克隆
→ 一系或多系病态成熟
→ 无效造血
→ 有效进入外周的成熟细胞减少
→ 贫血 / 白细胞减少 / 血小板减少
```

所以必须把两个变量分开：

- **骨髓增生程度**：工厂有没有在工作；
- **有效造血**：合格产品有没有真正输出。

MDS 的典型矛盾正是：**多数骨髓增生活跃，却可出现外周细胞减少。**

**Routing**：CORE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h07-kp02" -->
## KP02｜外周血与 Ret：先看“少几系”，再看红系有没有有效反应

> **主提示：RA/RAS贫血｜RAEB多三系少｜Ret↓｜原位溶血例外｜UCB↑**

### Detailed Expansion

当前 Lecture 的外周血入口：

- RA、RAS 多以贫血为主；
- RAEB、RAEB-t 原始细胞负荷更高时，可表现为全血细胞减少；
- MDS 的 Ret 通常下降，符合“有效红系输出不足”。

但 MDS 可有**原位溶血**：异常红系细胞在骨髓内就被破坏，此时可见 UCB↑，Ret 可正常或轻度升高。

因此：

```text
MDS + Ret低
→ 很符合无效红系输出

MDS + Ret不低
≠ 排除MDS
→ 先问是否伴原位溶血
```

//串联：H5已经建立“Ret不是溶血的单一诊断证据”；本处同样不能把 Ret 机械化。

**Routing**：CORE｜CONFUSABLE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h07-kp03" -->
## KP03｜骨髓证据：多数活跃，但“工人长得不对、站得不对、做不出合格产品”

> **主提示：穿刺±活检｜多数活跃｜1–3系病态｜小巨核3怪｜ALIP｜网硬｜集落流产**

### Detailed Expansion

当前 Study 的检查入口是：

- **骨髓穿刺**；或
- **骨髓穿刺 + 活检**；
- 不把“单独骨髓活检”作为完整诊断替代。

典型骨髓语言：

1. 多数骨髓增生活跃，一系到三系可增生；
2. 但存在病态造血；
3. 巨核系可见**小巨核细胞、核少分叶、多核**；
4. 不成熟前体细胞可异常定位，当前 Study 称 **ALIP**；
5. 骨髓网硬蛋白纤维可增多，可伴骨髓纤维化；
6. 体外集落培养可形成集落很少或不能形成，当前 Lecture 以“集落流产”帮助记忆。

核心不是背六条，而是形成反差：

> **细胞很多 ≠ 细胞成熟正常 ≠ 外周输出正常。**

（视觉门禁：病态巨核、红系 / 粒系形态与 IPSS-R 图表必须回原 Source 图。）

**Routing**：CORE｜VISUAL_ONLY｜RECOGNITION｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h07-kp04" -->
## KP04｜三系病态形态：记“方向”，完整形态名单进原图与 MI-D

> **主提示：红系核怪+巨幼/铁环｜粒系核/颗粒怪｜巨核小+少分叶/多核｜Auer接口**

### Detailed Expansion

当前 Lecture 的形态表把病态造血按三系展开：

- **红系**：核出芽、核间桥、核碎裂、多核 / 核分叶异常、巨幼变、环状铁粒幼细胞、空泡、PAS阳性等；
- **粒系**：核分叶减少（含类似 Pelger-Huët 方向）、异常分叶、细胞大小异常、颗粒减少 / 缺如或异常颗粒等；
- **巨核系**：小巨核、核少分叶、多核；
- **Auer 小体**：连接高原始细胞分型与后续 AML。

第一轮只要求知道：

```text
不是“细胞数不够”
而是“多个谱系都可出现成熟和形态质量异常”
```

完整形态名单、显微图和低频名词进入 MI-D，不阻塞主线。

**Routing**：SPECIAL｜VISUAL_ONLY｜CONFUSABLE｜MI-D

---

<!-- kianos:kp id="hematology-h07-kp05" -->
## KP05｜MDS → AML：原始细胞上升是“克隆继续进展”的量化出口

> **主提示：转AML｜FAB 30%｜WHO 20%｜Auer例外｜H9后置**

### Detailed Expansion

MDS 可向 **急性髓系白血病 AML** 转化。当前 Study 为考试同时保留两套历史门槛：

- FAB：骨髓原始细胞 **≥30%** 进入急性白血病；
- WHO：骨髓原始细胞 **≥20%** 进入急性白血病。

这个数字不是孤立记忆，而是在表达同一个方向：

```text
MDS异常克隆
→ 原始细胞比例越来越高
→ 成熟输出进一步被挤压
→ 疾病向急性白血病方向进展
```

Auer 小体在当前 MDS 分型中可触发特定高原始细胞类别，即使原始细胞尚未达到相同百分比门槛。

（边界：H7只掌握“转化门槛”。AML完整的系别、形态、免疫表型、染色体和治疗全部到 H9。）

**Routing**：CORE｜BOUNDARY｜CONNECTION｜MI-G

---

# 4｜分型：不是为了背目录，而是把“原始细胞负荷 + 特殊形态 / 遗传”挂到风险轴

<!-- kianos:kp id="hematology-h07-kp06" -->
## KP06｜FAB 旧分型：贫血 → 铁环 → 原始细胞增多 → 转变型 / 单核接口

> **主提示：RA｜RAS+铁环15%｜RAEB 5–20骨髓｜RAEB-t 20–30/Auer/PB≥5｜CMML单核>1**

### Detailed Expansion

按当前 Lecture 的 FAB Study 口径：

| 类型 | 外周血 / 骨髓主门槛 |
|---|---|
| RA | PB原始细胞 <1%；BM原始细胞 <5% |
| RAS | PB原始细胞 <1%；BM原始细胞 <5%；环形铁粒幼细胞 >15% |
| RAEB | PB原始细胞 <5%；BM原始细胞 5%–20% |
| RAEB-t | PB原始细胞 ≥5%，或BM原始细胞 >20%且<30%，或出现 Auer 小体 |
| CMML | PB原始细胞 <5%，单核细胞绝对值 >1×10⁹/L；BM原始细胞 5%–20% |

真正的记忆轴：

```text
低原始细胞
→ 加特殊铁环
→ 原始细胞逐级增多
→ 接近急性白血病
```

（易混：RAS 的“>15%”说的是环形铁粒幼细胞；不是 AML 原始细胞门槛。）

**Routing**：CORE｜CONFUSABLE｜MI-D

---

<!-- kianos:kp id="hematology-h07-kp07" -->
## KP07｜WHO 第五版当前 Study：LB → IB1 → IB2，原始细胞逐级上升

> **主提示：LB髓<5/血<2｜IB1髓5–9/血2–4｜IB2髓10–19/血5–19/Auer｜遗传3类**

### Detailed Expansion

当前 Lecture 的形态学分型主轴：

| 类型 | 当前 Study 原始细胞标准 |
|---|---|
| MDS-LB | BM <5% 且 PB <2% |
| MDS-IB1 | BM 5%–9% 或 PB 2%–4% |
| MDS-IB2 | BM 10%–19% 或 PB 5%–19%，或出现 Auer 小体 |

同一张 Source 表还列出按遗传学定义的类别：

- MDS-5q；
- MDS-SF3B1；
- MDS-biTP53；

以及低增生 MDS、伴纤维化 MDS 等扩展身份。

第一轮只需知道：现代分型不只看“贫血名字”，还把**原始细胞 + 关键遗传改变 + 特殊形态**共同用于定义。完整命名表属于 MI-D / 原图核对。

**Routing**：CORE｜SPECIAL｜VISUAL_ONLY｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h07-kp08" -->
## KP08｜FISH：把“看起来病态”推进到可证明的染色体异常

> **主提示：FISH｜-5/5q-｜-7/7q-｜20q-｜+8｜del(5q)**

### Detailed Expansion

当前 Study 列出的常见细胞遗传学异常：

- `-5 / 5q-`；
- `-7 / 7q-`；
- `20q-`；
- `+8`。

`del(5q)` 即 5号染色体长臂缺失。

这类证据的作用不是替代骨髓形态，而是把证据层推进：

```text
CBC / Ret：外周输出
→ 骨髓：增生与病态形态
→ FISH：染色体克隆异常
```

//串联：G5 已学“染色体 / FISH、基因序列 / 测序、蛋白 / IHC-Western”的检测对象方向，本处只 Apply。

**Routing**：CORE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h07-kp09" -->
## KP09｜IPSS-R：五个变量不是五张表，而是在估计“克隆危险度 + 骨髓输出损失”

> **主提示：遗传｜BM blast｜Hb｜ANC｜Plt｜5风险层｜3.5治疗≠4.5高危**

### Detailed Expansion

IPSS-R 当前 Study 的五个轴：

1. 细胞遗传学；
2. 骨髓原始细胞比例；
3. Hb；
4. ANC；
5. Plt。

它把两类信息合并：

```text
克隆本身危险度：遗传 + blast
+
正常造血被损害程度：Hb + ANC + Plt
→ 预后风险
```

当前 Lecture 给出的危险度区间：

- 极低危：≤1.5；
- 低危：>1.5–3；
- 中危：>3–4.5；
- 高危：>4.5–6；
- 极高危：>6。

**易错**：Lecture 的治疗表使用 `IPSS-R >3.5` 作为部分强化治疗入口；而“高危组”本身是 `>4.5`。两个阈值回答的问题不同。

完整每个变量的逐格评分进入 MI-D / 原表。

**Routing**：CORE｜CONFUSABLE｜VISUAL_ONLY｜MI-G｜MI-D

---

# 5｜鉴别：先比较“工厂状态”，再比较“成熟方向”

<!-- kianos:kp id="hematology-h07-kp10" -->
## KP10｜MDS vs 巨幼贫：都可大细胞、原位溶血，但一个是病态克隆，一个是 DNA 成熟原料不足

> **主提示：病态vsB12/叶酸｜MCV范围｜都可原位溶血｜Ret方向｜外周可多系少**

### Detailed Expansion

| 轴 | MDS | 巨幼细胞性贫血 |
|---|---|---|
| 第一身份 | 病态 / 克隆性造血 | 叶酸 / Vit B12 缺乏导致核成熟障碍 |
| 贫血形态 | 大、正、甚至小细胞均可 | 典型大细胞性 |
| 原位溶血 | 可有 | 可有 |
| 外周 | 贫血或全血细胞减少 | 贫血，也可多系减少 |
| Ret | 通常↓；原位溶血时可正常或轻↑ | 可正常或轻↑；原位溶血时可明显↑ |

病例里不能看到“MCV大 + 全血细胞减少”就直接报巨幼贫，也不能看到“骨髓活跃”就排除 MDS。真正要继续找的是**病态形态、克隆证据和原料缺乏证据**。

**Routing**：CORE｜CONFUSABLE｜CONNECTION｜MI-G

---

<!-- kianos:kp id="hematology-h07-kp11" -->
## KP11｜MDS vs AA：一个强调“质量坏”，一个强调“数量造不出”

> **主提示：病态vs衰竭｜MDS贫血早｜AA正细胞｜Ret都低｜髓多活vs低｜巨核形态vs数量**

### Detailed Expansion

| 轴 | MDS | AA |
|---|---|---|
| 感性身份 | 病态造血 | 骨髓造血衰竭 |
| 贫血 | 最基本表现 | 当前 Lecture称多在后期突出 |
| 贫血分类 | 大 / 正 / 小均可 | 正细胞性 |
| 外周血 | 贫血或全血细胞减少 | 全血细胞减少 |
| Ret | ↓；原位溶血可不低 | ↓ |
| 骨髓 | 多数活跃 | 多数低增生 |
| 巨核 | 小巨核、少分叶、多核等病态形态 | 数量显著减少，可全片未见 |

一句话：

```text
AA：工厂熄火
MDS：工厂还在转，但生产线本身已经克隆性失真
```

**Routing**：CORE｜CONFUSABLE｜CONNECTION｜MI-G

---

# 6｜治疗与病例决策

<!-- kianos:kp id="hematology-h07-kp12" -->
## KP12｜治疗四路：化疗、HSCT、去甲基化、特定 5q 生物调节

> **主提示：IPSS-R>3.5化疗｜HSCT根治4条件｜去甲基2药→延AML｜孤立5q→1药｜Source边界**

### Detailed Expansion

当前 Study 治疗路由：

### 1｜联合化疗

- 适合 IPSS-R >3.5 的患者；
- 当前 Lecture 方案：**蒽环类 + 阿糖胞苷**。

### 2｜HSCT

- 当前 Study 把 HSCT 作为**根治**路径；
- `IPSS-R >3.5 + 年轻 + 原始细胞增多 + 预后不良染色体核型` 是首选倾向的高价值提示。

### 3｜去甲基化

- 阿扎胞苷；
- 地西他滨；
- 目标：延缓 MDS 向 AML 转化。

### 4｜特定 5q 当前 Source 口径

- 当前 Lecture 写：孤立 `del(5q)` 对**沙利度胺**疗效好。

这里严格保存 Study 口径，不用外部现代治疗知识静默替换。

**Routing**：CORE｜BOUNDARY｜MI-G｜MI-D

---

<!-- kianos:kp id="hematology-h07-kp13" -->
## KP13｜最终病例算法：先问“骨髓少，还是骨髓病态”，再问 blast 和克隆证据

> **主提示：CBC/Ret｜髓增生｜三系病态｜FISH｜blast门槛｜AA/巨幼/AML分流｜治疗风险**

### Detailed Expansion

```text
贫血 / 多系细胞减少
→ CBC：少几系？
→ Ret：有效红系反应够不够？
→ 骨髓：低增生，还是多数活跃但病态？
    ├─ 明显低增生 + 巨核数量少 → 回H4 AA
    └─ 病态形态 / 表里不一 → MDS方向
→ 有无染色体克隆异常？
→ 原始细胞比例多少？有无Auer？
    ├─ MDS范围 → 分型 + IPSS-R
    └─ 达急性白血病门槛 → 进入H9
→ 再按年龄、blast、遗传和血细胞减少程度选择当前Study治疗层级
```

这个算法比背 FAB / WHO 名字更重要：**先定位故障，再用分类表命名。**

**Routing**：CORE｜RECOGNITION｜CONFUSABLE｜MI-G

---

# 7｜Framework Reconstruction｜闭卷重建三条链

### 7.1 病理生理链

```text
异常造血克隆
→ 病态成熟 / 无效造血
→ 多数骨髓活跃但外周细胞减少
→ 贫血 / 感染 / 出血
→ blast增加
→ AML接口
```

### 7.2 证据链

```text
CBC / Ret
→ 骨髓增生 + 三系形态
→ FISH / 细胞遗传学
→ blast比例 / Auer
→ IPSS-R
```

### 7.3 鉴别链

```text
骨髓低增生 → AA
病态造血 + 克隆证据 → MDS
DNA成熟原料不足 → 巨幼贫
blast成为主矛盾 / 达门槛 → H9 AML
```

能在不看文件时重建这三条链，Framework 才算真正建立。

---

# 8｜Memory Routing

## 8.1 MI-G｜第一轮必须即时掌握

- MDS = 克隆性病态 / 无效造血；
- “多数骨髓活跃但外周少”的反差；
- Ret通常下降，原位溶血是例外接口；
- 小巨核、核少分叶 / 多核等病态造血方向；
- MDS vs AA、MDS vs 巨幼贫的核心轴；
- FAB 30% vs WHO 20% 的当前 Study AML门槛；
- WHO LB / IB1 / IB2 的原始细胞递进；
- FISH 常见 `-5/5q-、-7/7q-、20q-、+8`；
- IPSS-R五变量；
- HSCT根治、去甲基延缓转AML的治疗角色。

## 8.2 MI-D｜延迟记忆，不阻塞主线

- FAB 每型的全部百分比；
- WHO第五版全部遗传学定义类别；
- 三系病态形态长名单；
- IPSS-R 每格具体评分与全部细胞遗传学档次；
- 危险度所有精确分界；
- 全部药物名单与低频方案；
- ALIP、网硬蛋白、集落培养等低频形态 / 实验细节。

---

# 9｜原图门禁

必须回当前内科 Source Page / 原 PDF 核对：

1. P206 FAB 原始细胞坐标图；
2. P206 WHO 第五版 MDS 分类表；
3. P207 IPSS-R 表；
4. P207 三系病态形态表与原始显微图；
5. P208 MDS vs 巨幼贫 / AA 比较与思维导图。

```text
VISUAL_SOURCE_GAP_OPEN
AI-readable Lecture文字层已完成重构；原始视觉图未在本任务中挂载。
```

---

# 10｜Outline Coverage Safety Net

## 10.1 Primary Ledger

```text
INT-U082_total = 12
mapped = 12
unmapped = 0
missing = 0
duplicate_primary = 0
```

| U082考点 | Primary归属 |
|---|---|
| MDS→AML；FAB / WHO 白血病门槛 | KP05 |
| FAB：RA / RAS / RAEB / RAEB-t / CMML | KP06 |
| WHO：LB / IB1 / IB2 | KP07 |
| 联合化疗适用与方案 | KP12 |
| IPSS-R>3.5、年轻、blast↑、不良核型首选 | KP12 |
| 去甲基化延缓转AML与药物 | KP12 |
| 孤立del(5q)生物调节剂 | KP12 + H7-SB02 |
| Ret方向、原位溶血 | KP02 |
| FISH常见染色体异常 | KP08 |
| 骨穿 / 活检、骨髓增生、表里不一、典型骨髓象 | KP03–KP04 |
| MDS vs 巨幼贫 | KP10 |
| MDS vs 再障 | KP11 |

### Ownership说明

- U082 全部 12 题唯一 Primary 在 H7；
- U083 白血病完整范围属于 H9，不在 H7 重复计数；
- H7只保留“转 AML / blast 门槛”的必要接口；
- Outline 学习者侧仅用于低压力扫漏，不是 Block Complete 的强制题库。

---

# 11｜Lecture Knowledge Routing Audit

| Lecture范围 | 路由 | Knowledge Role | Memory |
|---|---|---|---|
| P206 MDS→AML与两套门槛 | KP05 | CORE + BOUNDARY | MI-G |
| P206 FAB分型 | KP06 | CORE + CONFUSABLE | MI-D |
| P206 WHO第五版分型与遗传学类别 | KP07 | CORE + SPECIAL + VISUAL_ONLY | MI-G / MI-D |
| P207 治疗四路 | KP12 | CORE + BOUNDARY | MI-G / MI-D |
| P207 贫血 / 多系减少与Ret / 原位溶血 | KP02 | CORE + CONFUSABLE | MI-G |
| P207 FISH异常 | KP08 | CORE + CONNECTION | MI-G |
| P207 骨穿±活检、活跃骨髓、病态造血 | KP03 | CORE + RECOGNITION | MI-G |
| P207 ALIP / 网硬蛋白 / 集落流产 | KP03 | SPECIAL | MI-D |
| P207 三系形态表 | KP04 | VISUAL_ONLY + SPECIAL | MI-D |
| P207 IPSS-R变量与风险 | KP09 | CORE + CONFUSABLE + VISUAL_ONLY | MI-G / MI-D |
| P208 MDS vs 巨幼贫 | KP10 | CONFUSABLE + CONNECTION | MI-G |
| P208 MDS vs AA / ITP接口 | KP11 | CONFUSABLE + CONNECTION | MI-G |

```text
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
```

---

# 12｜First-pass Question Probe

```text
source = TTSX Lecture-attached Questions
selection = LectureQuestionBinding
status = READY_PENDING_BINDING
question_to_kp_semantic_graph = DEFERRED_TO_BREAKTHROUGH
```

不得从 U082 手工挑题冒充 Lecture-attached Questions。

---

# 13｜建议学习切片

```text
H7-A｜KP01–KP05
病态 / 无效造血、外周与骨髓、MDS→AML

H7-B｜KP06–KP09
FAB / WHO、FISH、IPSS-R

H7-C｜KP10–KP13
MDS vs 巨幼 / AA、治疗与病例算法
```

---

# 14｜Block Exit｜闭卷 13 问

1. 为什么 MDS 可“骨髓活跃但外周细胞减少”？
2. MDS 的 Ret 通常怎样，原位溶血为什么构成例外？
3. MDS 骨髓“表里不一”的核心形态是什么？
4. 红、粒、巨核三系病态造血各抓哪个方向？
5. FAB 与 WHO 当前 Study 的 AML 门槛分别是多少？
6. RA / RAS / RAEB / RAEB-t 是沿哪条轴递进？
7. WHO LB / IB1 / IB2 的原始细胞范围如何递进？
8. FISH 的四类常见异常是什么？
9. IPSS-R 五个变量各在估计什么？
10. 为什么 `>3.5` 治疗入口不能直接等同于“高危组 >4.5”？
11. MDS vs 巨幼贫最关键的病因与证据轴是什么？
12. MDS vs AA 最关键的骨髓和巨核差别是什么？
13. 面对多系细胞减少病例，如何从 CBC / Ret 一直走到 MDS、AA 或 AML 分流？

---

# 15｜Block Production Gate

```text
Study_continuity = PASS
natural_mechanism_split = 0
repeated_first_exposure = 0
Framework_is_map = PASS
KP_natural_units = 13
prompt_leakage = PASS
Outline_total = 12
Outline_mapped = 12
unmapped = 0
missing = 0
duplicate_primary = 0
unrouted_lecture_knowledge = 0
external_medical_expansion = 0
silent_source_correction = 0
First_pass_question_probe = READY_PENDING_BINDING
Source_gap = SOURCE_BOUNDARY_EXPLICIT
formal_source_conflict_count = 0
formal_source_boundary_count = 2
Visual_gate = REQUIRED_WITH_INTERNAL_ORIGINAL_PDF_GAP
System_final_gate = NOT_RUN_NON_FINAL_BATCH
```

---

# 16｜Block Complete

```text
Framework已建立
+ 内科P206–208已按自然连续小板块学习
+ 能解释克隆性病态 / 无效造血
+ 能从CBC / Ret / 骨髓识别“表里不一”
+ 能区分MDS、AA、巨幼贫与AML入口
+ 能恢复FAB / WHO分类的主轴
+ 能说明FISH与IPSS-R各回答什么
+ 能按当前Study分层治疗角色
+ KP Active Recall完成
+ Outline按需低压力扫漏
+ TTSX Lecture-attached Questions待绑定或已完成
```

**最低出口**：看到贫血或多系细胞减少时，能先问“骨髓是低增生，还是多数活跃却病态？Ret、三系形态、克隆证据和 blast 在说什么？”而不是把 MDS 当成一个需要背分型表的孤立病名。
