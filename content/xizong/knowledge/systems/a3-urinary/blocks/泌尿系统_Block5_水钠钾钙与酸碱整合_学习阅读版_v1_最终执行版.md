---
type: block_guide
schema_version: 1
content_version: 1
system_id: urinary
block_id: urinary-b05
title: 水、Na⁺、K⁺、Ca²⁺与酸碱整合
order: 5
study_refs:
  - source_id: surgery-lecture
    label: 27外科精编版【带导图】｜SUR27-U31｜体液、电解质与酸碱失衡 PDF P236–P241
    book_page_start: 191
    book_page_end: 195
  - source_id: physiology-lecture
    label: 生理学讲义｜小管排酸保碱与K⁺-H⁺接口
    page_start: 276
    page_end: 279
    action: recall
  - source_id: respiratory-system
    label: 呼吸系统｜PaCO₂与呼吸性酸碱入口
    action: recall
outline_units:
  - SUR-U047
  - SUR-U048
outline_primary_count: 25
kp_count: 20
prerequisites:
  - urinary-b03
  - urinary-b04
  - respiratory-b02
  - circulation-b12
next_blocks:
  - urinary-b06
  - urinary-b07
---

# Block 5｜水、Na⁺、K⁺、Ca²⁺与酸碱整合
## 学习阅读版 v1｜最终执行版

> **中心问题**：面对脱水、水中毒、电解质异常或酸碱失衡，怎样先分清“容量、张力、总量和跨细胞分布”，再调用肾脏、肺和细胞的调节机制，并识别当前 Study 要求的处理优先级？
>
> **文件性质**：泌尿系统第五个 canonical Block，也是 Global Map 中 O7“容量—水电解质—酸碱”的唯一完整 Primary。循环已经提供有效循环量与休克，呼吸已经提供 PaCO₂，K3–K4已经提供小管、ADH、醛固酮与K⁺ / H⁺机制；本 Block把它们汇合成临床判断语言。
>
> **Primary Study**：`27外科精编版【带导图】.pdf` SUR27-U31，PDF P236–P241《体液失衡》；生理 P276–279排酸保碱与K⁺-H⁺竞争为 Recall；呼吸系统 PaCO₂与呼吸性酸碱入口为 Recall。旧跟课页码仅保留 provenance。
>
> **Primary Outline**：外科 U047 16题 + U048 9题，共 **25题**。
>
> **第一轮流程**：Framework → 外科 Lecture连续学习 → Framework Reconstruction → KP Active Recall → Outline按需扫漏 → TTSX Lecture-attached Questions。
>
> **Source口径边界**：水、Na⁺、K⁺、Ca²⁺阈值、补液 / 补钾规则、高钾处理分类与特殊题源口径继续由现有 Project Lecture 作为 Primary，不被外部资料静默替换。此前缺失的“完整四型 expected compensation + AG / 混合型酸碱算法”已通过 `content/xizong/knowledge/learner/a3-urinary-b05-external-source-contract.json` **窄范围准入**：MSD Manual Professional 只负责 expected compensation / mixed-disorder 诊断，NCBI/StatPearls 只负责低白蛋白 AG 校正与 delta-ratio 辅助判断。该外部 Source **无权**改写纠钠速度、DKA/HHS方案、碳酸氢钠治疗指征、呼吸机或 ICU 治疗。

---

# 0｜先把五个问题拆开

体液失衡最容易混乱，是因为一句“缺水”可能同时涉及五个不同变量：

```text
容量：细胞外液 / 有效循环量够不够？
张力：细胞外液相对高渗还是低渗？
Na⁺：水与钠的相对关系怎样？
K⁺ / Ca²⁺：跨膜兴奋性是否危险？
酸碱：H⁺负荷、PaCO₂和HCO₃⁻怎样变化？
```

固定判断顺序：

```text
先看是否休克 / 低灌注
→ 再看血Na⁺与血浆渗透压，判断张力
→ 再看K⁺ / Ca²⁺是否危及心肌或神经肌肉
→ 再看酸碱的原发入口、expected compensation与混合过程
→ 最后选择当前Study的补液、转移、排出或对抗措施
```

> **容量不稳时先保灌注；膜兴奋性危险时先保护心脏；精细纠正排在生命支持之后。**

---

# 1｜总 Framework

<!-- kianos:framework id="urinary-b05-framework-main" -->

```text
① 建立五变量坐标
   容量 / 张力 / Na / K-Ca / 酸碱
   [KP01]
        ↓
② 三类脱水从“丢钠 vs 丢水”推导
   等渗：比例近似
   低渗：丢钠更多
   高渗：丢水更多
   [KP02–KP04]
        ↓
③ 水过多而非水不足
   水中毒：高容量 + 低钠 + 低渗
   [KP05]
        ↓
④ 补液先按容量和张力选择
   有无休克 → 液体类型 → 公式 / 速度进入MI-D
   [KP06]
        ↓
⑤ 高钾先保护心脏，再降血钾
   病因3类 → 膜电位 / ECG
   → 抗K / 转K / 排K / 稀K
   [KP07–KP10]
        ↓
⑥ 低钾先找丢失、肾排和转入细胞
   表现 → ECG → 见尿补钾
   + 低Mg / DKA / 幽门梗阻
   [KP11–KP14]
        ↓
⑦ K⁺与H⁺耦联只做B3 Recall / Apply
   原发扰动 + 容量/醛固酮 + 远端Na/流量
   + NH₄⁺排泄 / 肾功能
   → 再判断血K与尿pH方向
   [KP15]
        ↓
⑧ Ca²⁺先看总钙阈值与离子钙效应
   高钙ST短；低钙神经肌肉兴奋
   [KP16–KP17]
        ↓
⑨ 酸碱由四层共同维持
   缓冲 → 肺PaCO₂ → 肾HCO₃/H/NH₄ → 细胞交换
   [KP18]
        ↓
⑩ 完整酸碱诊断链
   pH → 原发方向 → expected compensation
   → AG / 白蛋白校正 → delta analysis
   → 列出每一个原发过程 → 回病例语境
   [KP19–KP20]
```

## 一条总电影

```text
体液丢失或增加
→ ECF容量与渗透压改变
→ ADH / RAAS / ANP和细胞水移动响应
→ 尿量、尿比重、血Na⁺变化

同时：
K⁺ / Ca²⁺改变膜兴奋性
→ 肌力、反射、ECG与致命心律风险

H⁺负荷或PaCO₂改变
→ 缓冲系统先反应
→ 肺改变CO₂
→ 肾重吸收HCO₃⁻、分泌H⁺与NH₄⁺
→ 细胞离子交换参与
→ 实测代偿若偏离expected range，提示第二个原发酸碱过程
```

---

# 2｜Ownership 与动作边界

| 内容 | 本 Block动作 | 完整主体 / 边界 |
|---|---|---|
| 三类脱水、水中毒 | **Primary Learn** | 外科U047 |
| 高钾、低钾、补钾、钙失衡 | **Primary Learn** | 外科U047–U048 |
| ADH、醛固酮、ANP | **Recall / Apply** | K4 |
| 小管HCO₃⁻、H⁺、NH₄⁺和K-H耦联 | **Recall / Apply** | **B3唯一机制 owner**；B5不建第二套四格 |
| PaCO₂与呼吸性酸碱 | **Recall / Integrate** | 呼吸系统 |
| 休克与复苏 | **Recall / Apply** | 循环B12 |
| DKA / HHS、原醛、甲旁疾病 | **Interface / Defer** | 内分泌 |
| AKI / CKD导致的电解质酸碱异常 | **Interface / Defer** | K7 |
| 四型expected compensation / AG / mixed algorithm | **Primary Integrate** | B5；由窄范围 external source contract 补齐原Source Gap |
| 纠钠速度、碳酸氢钠治疗、完整DKA/HHS/ICU | **Defer / Forbidden expansion** | 不由此次external source扩写 |

---

# 3｜五变量坐标与三类脱水

<!-- kianos:kp id="urinary-b05-kp01" -->

## KP01｜体液病例先问五件事

> **讲义定位 →** 外科 Lecture P191–193。  
> **主提示**：5变量｜先救什么｜Na代表什么｜K/Ca危险层｜酸碱2原发轴。

1. **容量**：有没有血容量不足、低灌注或休克？
2. **张力**：血浆渗透压低、正常还是高？
3. **Na⁺**：反映水与Na⁺的相对关系，不能脱离容量理解；
4. **K⁺ / Ca²⁺**：是否已影响心肌与神经肌肉兴奋性？
5. **酸碱**：第一改变来自 PaCO₂，还是 HCO₃⁻ / 固定酸负荷？

处理优先级：

```text
灌注不稳
> 致命高钾 / 严重兴奋性异常
> 精细张力和酸碱纠正
> 低频数字与公式
```

（易混：血Na⁺是浓度，不等于体内总Na⁺量；低钠可伴低容量、正常容量或高容量，本节先按外科三类脱水和水中毒学习。）

---

<!-- kianos:kp id="urinary-b05-kp02" -->

## KP02｜等渗性脱水：水钠近似同比例丢，先缩小ECF

> **讲义定位 →** 外科 Lecture P191。  
> **主提示**：定义｜Na范围｜渗透压范围｜细胞内液方向｜急性5%链｜尿比重｜首选/次选液。

```text
水与Na⁺近似同比例丢失
→ 血Na⁺ 135–150 mmol/L
→ 血浆渗透压 280–310 mmol/L（Study口径）
→ 主要缩小细胞外液
→ 细胞内外张力差不显著
```

按本节 Study：

- 尿比重↑；
- 短期丢失达体重约5%可形成血容量不足：脉细速、肢端湿冷、血压下降；
- 首选平衡盐溶液；
- 次选等渗盐水。

（Recall：休克完整复苏归循环B12；当前只保留“有休克先恢复有效循环量”的接口。）

---

<!-- kianos:kp id="urinary-b05-kp03" -->

## KP03｜低渗性脱水：丢钠多于丢水，组织间液掉得更明显

> **讲义定位 →** 外科 Lecture P191。  
> **主提示**：丢失比例｜Na三级｜渗透压｜水入细胞方向｜尿比重｜尿量早/晚｜组织间液｜有/无休克处理。

```text
丢Na⁺ > 丢水
→ 血Na⁺ <135 mmol/L
→ 血浆渗透压 <280 mmol/L
→ ECF低渗
→ 水向细胞内移动
→ 组织间液减少更明显
```

Study分级：

- 轻：Na⁺ 130–135；
- 中：120–130；
- 重：<120 mmol/L。

尿液方向：

- 尿比重↓；
- Study描述初期尿量可↑、后期随容量下降尿量↓。

处理边界：

- 有休克：按等渗性脱水先纠正容量；
- 无休克：按Study钠缺失公式与含钠液体纠正，精确公式进入 MI-D。

（易混：低渗并不意味着“水一定多”；这里总体是脱水，只是Na⁺丢得更重。）

---

<!-- kianos:kp id="urinary-b05-kp04" -->

## KP04｜高渗性脱水：丢水多于丢钠，细胞内液也被抽走

> **讲义定位 →** 外科 Lecture P191。  
> **主提示**：高渗性脱水：丢水/丢Na比例｜Na/渗透压｜细胞水方向｜表现/病因｜ADH/尿比重｜补液

```text
丢水 > 丢Na⁺
→ 血Na⁺ >150 mmol/L
→ 血浆渗透压 >310 mmol/L
→ ECF高渗
→ 水由细胞内移向细胞外
→ 细胞内液减少
```

Study临床方向：

- 轻者以口渴为突出；
- 加重可出现中枢症状，重者可休克；
- ADH↑、尿比重↑。

本节例子：

- 大量出汗；
- 大面积烧伤暴露疗法；
- 晚期食管癌饮水困难等。

按本节 Study以补水为主，列 5%葡萄糖；HHS的具体补液—胰岛素转换只保留接口，完整模型后置内分泌。

---

<!-- kianos:kp id="urinary-b05-kp05" -->

## KP05｜水中毒：高容量、低钠、低渗，血液被稀释

> **讲义定位 →** 外科 Lecture P191。  
> **主提示**：水中毒：容量｜Na/渗透压｜总Na量｜血液稀释指标｜治疗｜与低渗脱水区别

按本节 Study：

```text
水相对过多
→ 高容量性低钠血症
→ 血Na⁺ <130 mmol/L
→ 低渗
→ 体内总Na⁺可正常或增加
→ 血液被稀释
→ RBC、Hb、Hct下降
```

Study列甘露醇、呋塞米作为治疗接口。

| 轴 | 低渗性脱水 | 水中毒 |
|---|---|---|
| 总体水量 | 减少 | 增多 |
| ECF容量 | 低 | 高 |
| 血Na⁺ / 张力 | 低 | 低 |
| 核心问题 | 丢钠更重 | 水相对过多 |

---

<!-- kianos:kp id="urinary-b05-kp06" -->

## KP06｜补液决策：先看休克，再看张力；公式只做MI-D

> **讲义定位 →** 外科 Lecture P191、P193。  
> **主提示**：补液顺序：休克？→张力？｜三类液体方向｜何时用公式｜常用正常值/换算

### 1｜先判休克

```text
有低灌注 / 休克
→ 优先恢复有效循环量
→ 不先纠缠精细Na⁺公式
```

### 2｜再按张力

- 等渗性脱水：平衡盐首选、等渗盐水次选；
- 低渗性脱水：有休克先按等渗处理；无休克再补Na⁺；
- 高渗性脱水：按本节以补水为主，Study列5%葡萄糖；
- 水中毒：限制水与促进排水接口。

### 3｜Study公式与数据

低渗性脱水无休克时，Study列钠缺失量：

```text
(142 - 实际Na⁺) × 0.6（男）或0.5（女）× 体重kg
```

常用换算：

- 17 mmol Na⁺ ≈ 1 g NaCl；
- 13.4 mmol K⁺ ≈ 1 g KCl。

（边界：公式、补液总量与速度必须按当前 Study / 题干使用；本文件不扩写现代重症纠钠速度和全部液体选择。）

---

# 4｜高钾血症：先保护心脏

<!-- kianos:kp id="urinary-b05-kp07" -->

## KP07｜高钾病因三分：进得多、排得少、移到细胞外

> **讲义定位 →** 外科 Lecture P191–192。  
> **主提示**：阈值｜病因3类｜例子各2–4｜肾端断点｜药物2组｜组织损伤链。

按本节 Study，高钾血症：**血K⁺ >5.5 mmol/L**。

### 1｜摄入 / 输入过多

- 大量输库存血等。

### 2｜排出过少

- 肾衰；
- 保钾利尿剂；
- 醛固酮不足或RAAS被抑制的ACEI / ARB接口。

### 3｜向细胞外转移

- 溶血；
- 挤压等组织损伤；
- 酸中毒。

统一模型：

```text
摄入 - 细胞内外分布 - 肾排出
```

任何一层都可使血K⁺升高。

---

<!-- kianos:kp id="urinary-b05-kp08" -->

## KP08｜高钾的危险：早期可能兴奋，严重时去极化阻滞

> **讲义定位 →** 外科 Lecture P191–192；Recall细胞电活动。  
> **主提示**：最危险2｜ECG1｜静息电位链｜骨骼肌/心肌兴奋性方向｜为何不是一直兴奋。

Study突出：

- 最危险：室颤或心搏骤停；
- 典型 ECG：高尖 T 波。

电生理入口：

```text
细胞外K⁺明显升高
→ K⁺外流驱动力下降
→ 静息膜电位去极化
→ 早期更接近阈电位
→ 持续严重去极化使Na⁺通道失活
→ 动作电位幅度 / 0期速度下降
→ 传导性与兴奋性反而下降
→ 去极化阻滞
```

按本节 Study：

- 骨骼肌：兴奋性先↑后↓；
- 心肌：兴奋性先↑后↓。

（易混：“静息电位更接近阈值”只解释早期；严重高钾时Na⁺通道失活，不能推出兴奋性持续升高。）

---

<!-- kianos:kp id="urinary-b05-kp09" -->

## KP09｜高钾急救四路：抗K、转K、排K、稀K

> **讲义定位 →** 外科 Lecture P192。  
> **主提示**：先停什么｜抗K首选｜转K组合｜排K3类｜稀K药｜各自只改变哪一层。

首先按 Study：停止一切含钾药物 / 输入。

### A. 抗K｜先保护心肌

```text
10%葡萄糖酸钙
→ Ca²⁺膜稳定作用
→ 对抗高K⁺对心脏的毒性
→ 当前Study作为首选
```

它**不直接把总K⁺移走**，作用是先稳定心肌。

### B. 转K｜暂时移入细胞

```text
胰岛素 + 葡萄糖
→ 促进K⁺进入细胞
→ 血K⁺暂时下降
```

### C. 排K｜真正移出体外

Study列：

- 排钾利尿剂；
- 阳离子交换树脂；
- 透析。

### D. 稀K / NaHCO₃接口

Study把 5% NaHCO₃归入“稀K”并列出：

- 促 K⁺移入细胞；
- 促进尿中排K接口；
- 高渗液增加血容量、稀释K⁺；
- Na⁺对抗K⁺对传导的影响；
- 同时纠正酸中毒。

> 四路任务不同：钙剂保心、胰岛素转移、利尿/树脂/透析排出、NaHCO₃按Study多轴对抗。

---

<!-- kianos:kp id="urinary-b05-kp10" -->

## KP10｜“10%制剂”易混：葡萄糖和钙剂不是同一瓶

> **讲义定位 →** 外科 Lecture P192–193。  
> **主提示**：10%葡萄糖2场景｜10%葡萄糖酸钙2场景｜胰岛素是否搭配｜甲旁减用哪类制剂｜勿混药名。

本节 Study 把多个“10%”放在一起串联，必须按制剂拆开：

```text
10%葡萄糖
→ 低血糖
→ 高钾时与胰岛素合用，防低血糖并促K⁺转入细胞

10%葡萄糖酸钙 / 钙剂
→ 高钾时稳定心肌
→ 低钙 / 甲状旁腺功能减退接口补钙
```

（易混：题干问“10%葡萄糖”时不能选成“10%葡萄糖酸钙”；共同点只是数字，不是药物身份。）

---

# 5｜低钾血症：先找原因，再安全补钾

<!-- kianos:kp id="urinary-b05-kp11" -->

## KP11｜低钾病因三分：丢得多、肾排多、移入细胞

> **讲义定位 →** 外科 Lecture P192。  
> **主提示**：阈值｜病因3类｜例子各2–4｜利尿剂/醛固酮｜胰岛素/碱中毒/甲亢。

按本节 Study，低钾血症：**血K⁺ <3.5 mmol/L**。

### 1｜消化道等丢失过多

- 呕吐；
- 腹泻；
- 胃肠减压。

### 2｜肾排出过多

- 排钾利尿剂；
- 醛固酮过多。

### 3｜向细胞内转移

- 胰岛素；
- 碱中毒；
- 甲亢；
- 嗜铬细胞瘤接口。

（易混：总钾缺失和“分布性低钾”不是同一问题；后者可因K⁺暂时移入细胞而出现。）

---

<!-- kianos:kp id="urinary-b05-kp12" -->

## KP12｜低钾表现：肌无力最早，肠麻痹 + 心律失常 + U波

> **讲义定位 →** 外科 Lecture P192。  
> **主提示**：最早1｜肌力顺序｜反射｜消化3｜心律3｜ECG4｜代谢/尿｜兴奋性骨骼肌vs心肌。

### 临床主轴

- 最早：肌无力；
- 先累及四肢，后可累及躯干和呼吸肌；
- 腱反射减弱；
- 肠麻痹：腹胀、呕吐等；
- 心动过速、室早、传导阻滞等心律失常。

### ECG

- ST段和T波低平；
- U波明显；
- Study列 QT 间期延长接口。

### 酸碱与尿

- 代谢性碱中毒方向；
- Source常把低钾与“反常性酸性尿”配对；该配对必须通过 KP15 的 B3 context gate 使用，不能写成无条件规律。

### 兴奋性

按本节 Study：

- 骨骼肌低钾：兴奋性↓；
- 心肌低钾：兴奋性先↑后↓。

（边界：完整膜电位推导属于P0 / 心肌电生理；这里保留考试方向与临床识别。）

---

<!-- kianos:kp id="urinary-b05-kp13" -->

## KP13｜静脉补KCl：量、浓度、速度、尿量四道门

> **讲义定位 →** 外科 Lecture P193。  
> **主提示**：日量｜浓度｜速度｜尿量｜见尿补钾｜补不起来查什么｜禁止静推边界。

按当前 Study：

```text
补钾量：40–80 mmol/d（KCl 3–6 g/d）
浓度：<40 mmol/L（约3 g KCl/L接口）
速度：<20 mmol/h
尿量：>40 mL/h再补钾
```

核心原则：

> **见尿补钾。**

因为尿量不足可能提示肾排钾能力下降，继续补入会增加高钾风险。

补钾后仍不改善：考虑合并低 Mg²⁺。

（边界：本文件按Study保留考试数字；临床具体输注需结合监测，不在本任务扩写为处方。）

---

<!-- kianos:kp id="urinary-b05-kp14" -->

## KP14｜三个补钾特殊：低Mg、幽门梗阻、DKA

> **讲义定位 →** 外科 Lecture P193；Recall K3。  
> **主提示**：低Mg—ROMK链｜幽门梗阻3异常+补什么｜DKA按K/尿量4格。

### A. 低Mg导致低钾难纠正

Study模型：Mg²⁺平时限制 ROMK；低Mg时通道持续开放，K⁺不断从主细胞进入管腔，因此单纯灌入K⁺仍会继续丢失。

### B. 幽门梗阻

```text
低钾 + 低氯 + 代谢性碱中毒
→ KCl + 平衡盐
  或Study列5%葡萄糖盐水 / 生理盐水接口
```

### C. DKA补钾｜Study口径

- K⁺ <3.5：立即补钾；
- K⁺正常且尿量 >40 mL/h：立即补钾；
- K⁺正常且尿量 <30 mL/h：暂缓，待尿量增加；
- K⁺ >5.5：暂缓补钾。

完整 DKA补液、胰岛素和酸碱方案后置内分泌。

---

<!-- kianos:kp id="urinary-b05-kp15" -->

## KP15｜K⁺—H⁺整合：只 Recall B3 owner，先过情境门再判方向

> **讲义回看 →** B3 KP11–KP14；生理 P279；外科 P191–192。  
> **主提示**：B3唯一owner｜原发扰动｜容量/醛固酮｜远端Na/流量｜NH₄排泄/肾功能｜Source经典反常尿｜库存血双机制。

### 先钉 owner

K⁺—H⁺小管耦联的 Current 机制 **只由 B3 Primary**。B5 的任务是把它放进临床体液病例，不再建第二套“高钾/低钾四格 + 尿pH”真相。

每次预测血K⁺或尿pH前先问：

```text
1. 谁是原发扰动？
   酸碱异常 / K异常 / 容量-醛固酮 / 肾功能？

2. ECF容量和醛固酮方向是什么？

3. 远端Na⁺递送与小管液流量如何？

4. NH₄⁺生成/排泄和整体肾功能是否完整？

5. 当前药物、呕吐/腹泻、肾衰等背景是否改变远端处理？
```

然后再从 B3 主细胞 / 闰细胞电路判断方向。

### Source经典模式｜用于题源识别，不是无条件定律

- 代谢性酸中毒常与血K⁺升高方向相联，但程度取决于病因和肾功能；
- 代谢性碱中毒常与低K⁺方向相联；
- 低K⁺合并代谢性碱中毒时，特定容量/醛固酮背景可出现“反常性酸性尿”；
- 高K⁺相关代谢性酸中毒时，尿pH与净排酸仍受NH₄⁺、肾功能和远端Na⁺递送影响，不能机械写成固定“反常碱性尿”。

> **尿pH不是血K⁺的单变量函数。**

### 两个 Source 特殊

#### 1｜大量库存血：两条独立入口

```text
储存时间延长
→ RBC storage lesion / K⁺从细胞向保存液上清累积
→ 大量或快速输入时K⁺负荷↑
→ 高钾方向
```

不是把默认机制写成“红细胞大量破裂”。

另一条独立机制：

```text
库存血中的枸橼酸
→ 体内代谢形成碱负荷 / HCO₃⁻方向
→ 代谢性碱中毒方向
```

因此“高钾 + 碱中毒”来自**两条并行机制**，不是K-H四格的例外格。

#### 2｜原醛

原醛进入：容量 / 醛固酮↑ + ENaC/远端Na递送背景 → 排K、排H增强，产生低K + 代谢性碱中毒方向。尿pH仍不能只从“低K”单变量推断。

---

# 6｜Ca²⁺：神经肌肉与心肌平台期接口

<!-- kianos:kp id="urinary-b05-kp16" -->

## KP16｜高钙血症：>2.75，Study重点是病因与ST缩短

> **讲义定位 →** 外科 Lecture P193。  
> **主提示**：阈值｜病因2类｜ECG｜MM D-S特殊阈值｜完整钙轴后置。

按本节 Study：

- 高钙血症：血 Ca²⁺ > **2.75 mmol/L**；
- 常见病因例：甲状旁腺功能亢进、骨质破坏如骨肿瘤；
- 典型 ECG：ST段缩短。

MI-D特殊：多发性骨髓瘤 D-S 分期所用 Ca²⁺上限按本节为 **2.65 mmol/L**，不能与高钙定义阈值混成同一个数字。

完整 PTH—VitD—骨代谢轴后置内分泌。

---

<!-- kianos:kp id="urinary-b05-kp17" -->

## KP17｜低钙血症：<2.25，离子钙下降使神经肌肉兴奋

> **讲义定位 →** 外科 Lecture P193。  
> **主提示**：低钙血症：阈值｜病因｜真正决定症状的变量｜症状/体征｜ECG｜治疗

按本节 Study：

- 低钙血症：血 Ca²⁺ < **2.25 mmol/L**；
- 真正直接影响神经肌肉兴奋性的是**离子化钙**。

Study病因例：

- VitD缺乏；
- 急性胰腺炎；
- 甲状旁腺功能减退；
- 肾衰；
- 小肠瘘；
- 癔症所致呼吸性碱中毒接口。

表现：

- 麻木、针刺感；
- 痉挛、抽搐；
- 腱反射亢进；
- 呼吸困难；
- Chvostek征、Trousseau征；
- ECG：ST段延长。

Study治疗接口：补充钙剂，可加服骨化三醇。

---

# 7｜酸碱：四层调节 + expected compensation + mixed algorithm

<!-- kianos:kp id="urinary-b05-kp18" -->

## KP18｜维持酸碱的四层系统：缓冲、肺、肾、细胞

> **讲义定位 →** 外科 Lecture P193；Recall 生理P276–279与呼吸。  
> **主提示**：4层｜各自调什么｜速度快慢｜肾3动作｜细胞交换｜肝解氨边界。

### 1｜体液缓冲系统

Study列：NaHCO₃ / H₂CO₃、KHb / Hb等。它们先接受或释放 H⁺，反应最快，但本身不能把总酸负荷完全移出机体。

### 2｜肺

通过改变通气调节 PaCO₂：

```text
通气↑ → PaCO₂↓
通气↓ → PaCO₂↑
```

### 3｜肾

```text
重吸收滤过HCO₃⁻
+ 分泌H⁺（Na-H交换、质子泵）
+ 分泌 / 排泄NH₃-NH₄⁺
→ 排酸保碱
```

### 4｜组织细胞

Study列 H⁺—K⁺等跨细胞交换接口，能改变血中离子分布。

（易混：肾脏分泌氨用于缓冲和排酸；肝脏鸟氨酸循环用于氨解毒。）

---

<!-- kianos:kp id="urinary-b05-kp19" -->

## KP19｜四类原发酸碱入口 + expected compensation

> **来源 →** Project Lecture：pH / PaCO₂ / HCO₃⁻基础与肾肺机制；窄范围 external source contract：expected compensation。  
> **主提示**：4类｜基线40/24｜Winter｜代碱PaCO₂｜呼酸急/慢｜呼碱急/慢｜超出expected=混合。

### 1｜先找原发方向

以常用基线 **PaCO₂≈40 mmHg、HCO₃⁻≈24 mmol/L** 作为计算锚点：

| 原发过程 | 原发改变 | pH方向 | 主要代偿 |
|---|---|---|---|
| 代谢性酸中毒 | HCO₃⁻↓ / 固定酸↑ | 酸 | 肺降PaCO₂ |
| 代谢性碱中毒 | HCO₃⁻↑ | 碱 | 肺升PaCO₂ |
| 呼吸性酸中毒 | PaCO₂↑ | 酸 | 肾升HCO₃⁻ |
| 呼吸性碱中毒 | PaCO₂↓ | 碱 | 肾降HCO₃⁻ |

> 单纯代偿是把 pH 拉回正常方向，**不会把原发酸中毒“代偿成碱中毒”或反之**。接近正常 pH 也不能排除混合型。

### 2｜代谢性酸中毒｜Winter formula

```text
expected PaCO₂
= 1.5 × HCO₃⁻ + 8 ± 2 mmHg
```

解释：

```text
实测PaCO₂在expected范围
→ 呼吸代偿与单纯代酸相符

实测PaCO₂ > expected上限
→ 另有呼吸性酸中毒成分

实测PaCO₂ < expected下限
→ 另有呼吸性碱中毒成分
```

### 3｜代谢性碱中毒｜expected PaCO₂

```text
ΔPaCO₂ ≈ 0.6–0.75 × ΔHCO₃⁻

即：
expected PaCO₂
≈ 40 + 0.6–0.75 × (HCO₃⁻ - 24)
```

MSD Source 提示单纯代碱的代偿性 PaCO₂ 通常不会高到约 **55 mmHg以上**。实测明显偏离 expected 方向 / 范围，考虑第二个呼吸性原发过程。

### 4｜呼吸性酸中毒｜急性 vs 慢性

PaCO₂每升高 **10 mmHg**：

```text
急性：HCO₃⁻约升 1–2 mmol/L
慢性：HCO₃⁻约升 3–4 mmol/L
```

实测 HCO₃⁻若明显不符 acute/chronic expected range：

- 偏高 → 另有代谢性碱中毒方向；
- 偏低 → 另有代谢性酸中毒方向；
- 同时要重新检查“急/慢”分类是否判断错。

### 5｜呼吸性碱中毒｜急性 vs 慢性

PaCO₂每降低 **10 mmHg**：

```text
急性：HCO₃⁻约降 1–2 mmol/L
慢性：HCO₃⁻约降 4–5 mmol/L
```

实测 HCO₃⁻明显高于 expected → 代谢性碱中毒方向；明显低于 expected → 代谢性酸中毒方向。

> **规则只有一句**：先提出一个 primary disorder，再问身体“应该代偿到哪里”；**实测不在 expected range，不叫“代偿过度/不足”，而是要找第二个原发酸碱过程或重新检查急慢性假设。**

---

<!-- kianos:kp id="urinary-b05-kp20" -->

## KP20｜K5最终病例算法：危险优先 → expected compensation → AG / delta → 列出全部原发过程

> **来源 →** Project Lecture + admitted MSD / NCBI narrow source contract。  
> **主提示**：危险优先｜pH｜原发轴｜代偿公式｜AG｜白蛋白校正｜delta ratio｜混合型｜临床回扣。

### A｜先排立即危险

```text
1. 休克 / 低灌注？
2. 高钾是否已有ECG / 心肌危险？
3. Ca²⁺是否造成严重神经肌肉或心电异常？
4. 是否有严重呼吸 / 通气问题？
```

生命支持优先于做漂亮的酸碱计算。

### B｜酸碱诊断九步

```text
Step 1｜看 pH
<7.35：acidemia方向
>7.45：alkalemia方向
接近正常：不能排除混合型

Step 2｜同时看 PaCO₂ 与 HCO₃⁻
提出最可能的 primary metabolic / respiratory process

Step 3｜按 KP19 算 expected compensation
实测落在expected范围 → 暂支持simple disorder
实测超出expected → 再加一个primary process或重查acute/chronic

Step 4｜只要有代谢性酸中毒，就算AG
AG = Na⁺ - (Cl⁻ + HCO₃⁻)

Step 5｜低白蛋白时先校正AG
corrected AG
= measured AG + 2.5 × [4.0 - albumin(g/dL)]

Step 6｜若为HAGMA，找第二个代谢过程
ΔAG = corrected AG - 12
corrected HCO₃⁻ = measured HCO₃⁻ + ΔAG

也可用：
delta ratio
= (corrected AG - 12) / (24 - measured HCO₃⁻)

Step 7｜解释delta
<1 → 合并正常AG代谢性酸中毒方向
1–2 → 多与单纯HAGMA相符
>2 → 合并代谢性碱中毒 / 原先HCO₃⁻较高方向

Step 8｜把每个原发过程逐条写出来
不要写“代偿过度”
要写：代酸 + 呼碱 / 呼酸 + 代碱 / HAGMA + NAGMA 等

Step 9｜回病例语境
呕吐？腹泻？乳酸？酮症？肾衰？COPD？过度通气？
计算必须和真实病因链对得上
```

### C｜delta 不是孤立诊断机器

- AG 的实验室正常值可因测定方法不同而不同；`12 / 24` 是本补充算法的常用计算锚点；
- 低白蛋白可把真实 HAGMA“藏起来”，所以明显低白蛋白时先校正；
- delta ratio 是筛查第二个代谢过程的辅助量，**不能脱离临床、expected compensation和病程单独下最终诊断**。

### D｜这次 Source admission 没有授权什么

本算法只补**诊断**，不因此扩写：

- 现代低钠 / 高钠纠正速度；
- DKA / HHS完整治疗；
- NaHCO₃治疗指征；
- 呼吸机 / ICU 通气方案；
- 复杂肾替代治疗。

这些仍归其正式 owner / 后续 Source。

---

# 8｜Framework Reconstruction

Lecture完成后闭卷完成：

```text
1. 画出容量、张力、Na、K-Ca、酸碱五变量坐标。
2. 用丢钠/丢水比例推导三类脱水的ECF/ICF方向。
3. 比较低渗性脱水与水中毒。
4. 画高钾“进多—排少—外移”三分病因。
5. 写出抗K—转K—排K—稀K四路及任务。
6. 画低钾病因、表现与四道补钾门。
7. 重建DKA补钾四格和幽门梗阻处理接口。
8. 用B3 context gate解释K-H耦联；说明为什么尿pH不能由血K单变量决定；拆开库存血K负荷与枸橼酸碱负荷。
9. 比较高钙/低钙阈值、ECG和神经肌肉方向。
10. 画缓冲—肺—肾—细胞四层酸碱系统。
11. 闭卷写四类 expected compensation：Winter、代碱PaCO₂、急/慢呼酸、急/慢呼碱。
12. 跑一遍完整酸碱算法：pH → primary → expected compensation → AG/albumin correction → delta → 列出全部primary process。
```

---

# 9｜Memory Routing

## 9.1 MI-G｜第一轮必须即时掌握

1. 容量与张力不是同一变量；
2. 三类脱水的丢水 / 丢钠关系；
3. 低渗性脱水 vs 水中毒；
4. 休克优先于精细纠钠；
5. 高钾病因三分与去极化阻滞；
6. 高钾首要保护心肌；
7. 抗K、转K、排K、稀K任务不同；
8. 低钾肌无力、肠麻痹、ECG与心律风险；
9. 见尿补钾；
10. 低Mg导致难纠正低钾；
11. K-H只调用B3 context-gated owner，尿pH不是血K单变量函数；
12. 库存血高钾与枸橼酸碱负荷是两条机制；
13. 高钙ST短、低钙ST长与神经肌肉兴奋；
14. 酸碱四层系统；
15. 四类原发酸碱方向；
16. expected compensation超界 = 第二个原发过程 / 重查急慢，不是“过度代偿”；
17. 代谢性酸中毒要算AG；低白蛋白时校正AG；
18. HAGMA用delta分析筛第二个代谢过程。

## 9.2 MI-D｜进入 MarginNote 3

- 血Na⁺、渗透压、K⁺、Ca²⁺全部阈值；
- 低渗性脱水三级数字；
- 钠缺失公式；
- 17 mmol Na⁺与13.4 mmol K⁺换算；
- 补钾量、浓度、速度、尿量；
- DKA四格精确数字；
- 多发性骨髓瘤D-S 2.65 mmol/L；
- 10%制剂易混；
- 具体液体名称和特殊场景；
- 四类expected compensation精确数字；
- albumin-corrected AG公式；
- delta ratio公式与 `<1 / 1–2 / >2` 解释；
- 全部真题年份。

---

# 10｜Study原图 / 表格门禁

必须回 `27外科精编版【带导图】.pdf` SUR27-U31 原页：

1. P191三类脱水总表；
2. P191水中毒与高钾病因表；
3. P192高钾处理“抗/排/转/稀”图；
4. P192低钾表现、兴奋性与ECG图；
5. P193补钾规则、Ca²⁺与酸碱四层图；
6. 生理 P279 K-H经典图：**只作Source Pattern，解释时调用B3 context gate**；
7. K3的主细胞 / 闰细胞图；
8. 呼吸系统 PaCO₂—通气关系图。

酸碱代偿公式 / AG / delta 为文本计算规则，不要求额外 Visual Gate；其 Source authority 由 external source contract 持久化。

---

# 11｜Lecture / Source Knowledge Routing Audit

| Source范围 | 路由 | 去向 |
|---|---|---|
| P191三类脱水 | CORE / DISCRIMINATION / MI-G | KP01–KP04 |
| P191水中毒 | CORE / CONFUSABLE | KP05 |
| P191–192高钾 | CORE / RECOGNITION / DECISION | KP07–KP10 |
| P192–193低钾与补钾 | CORE / RECOGNITION / MI-G / MI-D | KP11–KP14 |
| 生理K-H与库存血/原醛特殊 | RECALL / SPECIAL / CONFUSABLE；B3 owner | KP15 |
| P193钙失衡 | CORE / RECOGNITION / MI-D | KP16–KP17 |
| P193酸碱四层 | CORE / CONNECTION | KP18 |
| MSD expected-compensation / mixed-disorder diagnosis | ADMITTED_EXTERNAL_CURRENT / NARROW_SCOPE | KP19–KP20 |
| NCBI albumin-corrected AG / delta ratio | ADMITTED_EXTERNAL_CURRENT / NARROW_SCOPE | KP20 / MI-D |
| 现代纠钠指南、DKA/HHS治疗、碱治疗、通气治疗 | FORBIDDEN_EXTERNAL_EXPANSION / DEFERRED | 不在B5新增 |
| 重复题旁解释 | REDUNDANT_EXPOSITION | 合并进对应KP |

```text
unrouted_lecture_knowledge = 0
source_gap_complete_compensation = RESOLVED_BY_ADMITTED_EXTERNAL_SOURCE
```

---

# 12｜Outline U047–U048 Coverage Safety Net

## 12.1 生成侧

| Outline范围 | 题数 | 路由 |
|---|---:|---|
| 等渗/低渗/高渗脱水与水中毒 | 6 | KP01–KP06 |
| 高钾血症 | 7 | KP07–KP10、KP15 |
| 低钾血症 | 3 | KP11–KP12 |
| 补钾 / 幽门梗阻 / DKA | 3 | KP13–KP14 |
| 钙失衡 | 4 | KP16–KP17 |
| 酸碱维持 | 1 | KP18–KP20 |
| 常用数据 | 1 | KP06、MI-D |
| **合计** | **25** | **25 / 25** |

```text
total = 25
mapped = 25
unmapped = 0
missing = 0
duplicate_primary = 0
```

## 12.2 学习者侧

- Outline只扫漏，不作为25题必清零任务；
- 数字错但模型对：归MI-D，不重读整 Block；
- 高钾处理顺序错：回 KP09；
- 脱水分类错：回 Framework + KP02–KP05；
- K-H尿pH题：先回B3 context gate，不再背无条件四格；
- 酸碱复杂题：按 KP20 算 expected compensation / AG / delta；若算法和临床语境冲突，重新检查 primary assumption，而不是猜“过度代偿”。

---

# 13｜建议学习切片

```text
Unit A｜KP01–KP06
五变量、三类脱水、水中毒与补液入口

Unit B｜KP07–KP10
高钾病因、电生理和四路处理

Unit C｜KP11–KP15
低钾、补钾、特殊与B3 K-H应用

Unit D｜KP16–KP20
Ca²⁺ → 酸碱四层 → expected compensation → AG/delta mixed algorithm
```

---

# 14｜Block Exit｜闭卷 24 问

1. 容量和张力分别回答什么？
2. 三类脱水的丢水 / 丢钠关系是什么？
3. 等渗性脱水主要改变哪个液体区？
4. 低渗性脱水为什么组织间液下降更明显？
5. 高渗性脱水为什么会抽走细胞内水？
6. 低渗性脱水与水中毒怎样区分容量？
7. 有休克时为什么不先算精细补钠公式？
8. 高钾病因三分是什么？
9. 高钾为何先兴奋、后去极化阻滞？
10. 高钾最危险的结局与典型ECG是什么？
11. 抗K、转K、排K、稀K各做什么？
12. 10%葡萄糖和10%葡萄糖酸钙如何区分？
13. 低钾病因三分是什么？
14. 低钾最早表现、消化和ECG表现是什么？
15. 静脉补KCl四道门是什么？
16. 低钾补不起来为什么查Mg²⁺？
17. 幽门梗阻与DKA的补钾边界是什么？
18. 为什么K-H不能再背成无条件尿pH四格？预测前要过哪几个context gate？
19. 库存血为什么可以同时带来高钾方向和碱中毒方向，这两条机制分别是什么？
20. 高钙和低钙阈值、ECG方向是什么？
21. 酸碱四层系统各调什么？
22. 四类原发酸碱失衡的 expected compensation 怎么算？
23. 代谢性酸中毒时怎样用AG、白蛋白校正和delta ratio寻找第二个代谢过程？
24. 为什么实测代偿超出expected range时应写“第二个原发过程”，而不是“代偿过度/不足”？

**最低出口**：能在病例中先判灌注、张力和致命电解质风险；再用 pH / PaCO₂ / HCO₃⁻ 提出 primary process，计算 expected compensation；代谢性酸中毒进一步算 AG / 必要时白蛋白校正 / delta，最后把每一个原发酸碱过程明确列出并与真实病因链核对。

---

# 15｜First-pass Question Probe

```text
来源：
TTSX Lecture-attached Questions

选择方式：
LectureQuestionBinding 自动提供

绑定范围：
外科 Lecture P191–195《体液失衡》对应讲义配套题

状态：
待绑定
```

> external acid-base source只补诊断算法，不生成另一套题库；First-pass Question Probe仍以 Lecture-attached Questions 为主。

---

# 16｜Block Complete 定义

```text
Framework已建立
+ 外科体液失衡Lecture已完整学习
+ K3/K4与呼吸PaCO₂接口已完成Recall
+ B3 K-H context owner已正确调用
+ expected compensation / AG / delta mixed-disorder算法可闭卷重建
+ KP Active Recall完成
+ Outline按需扫漏
+ TTSX Lecture-bound Question Probe完成或待绑定
```

允许 `Block Complete + Weakness Open`。水电解质阈值、补液/补钾公式、四型代偿数字和delta ratio进入 MI-D；只有“容量—张力—电解质危险—primary acid-base—expected compensation—mixed process”仍无法重建时，才进行最小模型修复后进入 K6。
