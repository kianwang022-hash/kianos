# A3 泌尿系统｜Beginner Guide

Status: **CURRENT**  
Role: **BEGINNER_EXPLANATION_ONLY**  
Contract: `content/xizong/knowledge/learner/BEGINNER_GUIDE_CONTRACT.md`

## Authority boundary

This Guide explains Current A3; it does not own A3 medical truth.

Current owners:

- System semantics → `content/xizong/knowledge/systems/a3-urinary/system.json`
- first-pass / Logic Group / Recall support → `content/xizong/knowledge/learner/a3-urinary-learning.json`
- medical Core → `content/xizong/knowledge/systems/a3-urinary/blocks/`
- shared learning semantics → `content/xizong/LEARNING_CONTRACT.md` + `study-policy.json`

Bounded historical explanatory provenance:

- path: `content/xizong/knowledge/system-guides/西综泌尿系统_System_Guide_v1_完整导学_认知依赖与学习顺序.md`
- last full pre-retirement ref: `6c4f2a6de4368c6270b24169803fb5f0cbd6dc03`
- use: explanation pattern only; **not Current authority**

---

## 1｜先搞懂：肾脏不是一个“排尿器官”

A3 真正难的地方，不是疾病名多，而是同一套肾单位同时承担：

```text
废物排出
容量稳态
渗透压 / 张力稳态
Na / K / Ca 等电解质
酸碱
内分泌
以及把最终尿液安全排出体外
```

所以第一遍不要先背“肾炎、肾病、AKI、结石、BPH”。先建立一个工作机器，再问第一故障发生在哪一层。

---

## 2｜一张脑内母模型

A3 的 mother model 可以直接压成：

```text
血液进入肾脏
→ 肾灌注与肾单位血管空间
→ 肾小球决定“滤多少 / 漏什么”
→ 小管分段选择性回收与分泌
→ 髓质梯度 + ADH 等决定终尿浓缩 / 稀释
→ 末端 Na-K-H 精调
→ 尿液成为系统日志
→ 尿路负责运送、储存与排空
```

历史 Guide 里“**大量滤过 → 绝大部分回收 → 少量精细调节 → 形成终尿**”是很好的 beginner explanation。这里保留这套解释动作，但具体滤过、转运、激素、酸碱和疾病内容以当前 A3 系统模型为准。

---

## 3｜第一次进入，先钉住五个大区别

### ① 滤得少 vs 屏障漏

这是肾小球学习最重要的第一刀：

- **滤得少**：先看灌注、滤过压力、RPF / GFR、Kf；
- **屏障漏**：先看选择性损伤，为什么蛋白或血细胞进入尿液。

不要用一个 Cr 或一个蛋白尿把两类问题混成一件事。

### ② 容量 vs 张力 / 血钠

- Na 平衡主要组织 ECF 容量；
- 水平衡主要组织张力；
- 血清 Na 不等于体内总 Na。

这条区分是后面脱水、水中毒、容量激素、心肾接口和酸碱判断的底座。

### ③ 肾前 vs 肾实质 vs 肾后

碰到肾功能下降先问：

```text
血没送到？
肾本体坏了？
尿排不出去？
```

这是 AKI 的入口，也是整套 A3 的空间定位语言。

### ④ 肾小球 vs 小管-间质 vs 尿路出口

尿液证据不是疾病名，而是在告诉你损伤可能发生在哪个空间。

### ⑤ 临床综合征 vs LM / IF / EM 模式 vs 最终病因

肾小球病不能把一个病理 pattern 直接等同于唯一病因。先分层描述，再完成病因定位。

---

## 4｜Failure Map：第一故障发生在哪

A3 可以先压成 9 类故障：

1. **肾灌注不足**：血送不到肾或有效动脉血容量不足；
2. **滤过动力 / Kf 异常**：滤过量下降；
3. **滤过屏障选择性破坏**：蛋白或血细胞异常漏入尿；
4. **小管分段转运失败**：糖、电解质、酸碱或小分子处理异常；
5. **浓缩 / 稀释失败**：髓质梯度、水通透性或控制异常；
6. **免疫性肾小球损伤**：不同免疫机制形成不同损伤模式；
7. **小管-间质 / 尿路感染炎症**；
8. **尿流通路受阻**：结石、BPH、狭窄、肿瘤、排空异常等；
9. **结构破坏、肿块或外伤**。

面对一个新病例，优先沿这些层级定位，而不是先猜病名。

---

## 5｜14 个 Block 为什么这样排

### 第一层｜先把正常肾单位学成一台机器

- **B1 肾脏总地图、清除率、肾血流与内分泌**：先知道器官结构、血流、测量语言和传感器；
- **B2 肾小球滤过屏障与 GFR**：解决“滤多少 / 漏什么”；
- **B3 分段小管转运与利尿剂**：沿肾单位逐段看回收、分泌和药物靶点；
- **B4 容量激素与尿液浓缩稀释**：把 RAAS、ADH、ANP、髓质梯度与终尿接起来。

### 第二层｜把稳态变量和诊断语言补齐

- **B5 水钠钾钙与酸碱整合**：把全身稳态接口统一起来；
- **B6 尿液证据与肾功能诊断语言**：学会从尿、Cr/eGFR、影像和分肾功能反推位置与功能。

### 第三层｜进入肾实质与感染疾病

- **B7 AKI、CKD 与透析**：把灌注、实质、梗阻和危险处理汇合；
- **B8 细菌性尿路感染**：沿尿路空间处理感染；
- **B9 肾小球免疫机制与双坐标地图**：先建立机制 + 病理 pattern 语言；
- **B10 肾炎分支**：进入急性、急进、IgA、慢性肾炎；
- **B11 肾病综合征分支**：进入大量蛋白漏出与病理类型。

### 第四层｜尿路出口与泌尿外科空间

- **B12 排尿梗阻、结石、BPH 与尿失禁**；
- **B13 肾结核与泌尿系统肿瘤**；
- **B14 泌尿系外伤**。

这条路线不是把“肾内科”和“泌尿外科”硬串成一条疾病链，而是先共享**解剖、尿液证据、梗阻和肾功能语言**，再在后半段分成不同故障模型。

---

## 6｜进入一个 Block 后怎么接

System Guide 到 Block 入口就停。

正常分工：

```text
中心问题
→ Block Framework / 最小模型
→ 按当前 A3 学习路径规定的 Source contact 学原讲义
→ Logic Group / KP 理解与闭卷恢复
→ Group / Block Closure
→ 进入 Memory Routing
```

A3 的空间、方向和变量非常多，所以 Framework 尤其重要：先知道“血在哪、滤液在哪、这一段做什么、这个变量往哪变”，再去记具体 transporter、数字或疾病 pattern。

---

## 7｜Memory Routing：不要让精确细节堵住肾单位主线

若当前 Block 显式给出：

- **MI-G**：后续 Block 会直接调用，当前必须带走；
- **MI-D**：需要准确记住，但不应阻断当前机制推进。

典型思路是：

```text
方向 / 空间 / 因果 / 变量边界
→ 先作为 gating cognition 建稳

精确正常值 / 完整名单 / pattern 细节 / 术式与阈值
→ 只有当前学习内容明确归位后再进入对应 Memory 路由
```

这不是降低精确记忆要求，而是防止“精确记忆”把肾单位这条连续电影拆碎。

---

## 8｜第一次完成 A3 后应该留下什么

面对新的肾脏 / 尿路问题，能先现场运行：

```text
灌注够不够？
→ 滤过量还是滤过选择性出了问题？
→ 哪一段小管处理失败？
→ 水盐酸碱控制是否失配？
→ 尿液 / 肾功能 / 影像提示故障在哪里？
→ 是肾前、肾实质还是肾后？
→ 若是肾小球病，临床综合征、LM/IF/EM 与病因分别是什么层？
→ 若是尿路问题，感染、梗阻、结石、肿瘤还是外伤？
```

如果只能背“B1–B14 各讲什么”，而不能从尿液和稳态变量反推第一故障，System Guide 的任务还没完成。

---

## 9｜Historical migration receipt

Intentionally migrated after Current re-verification:

- “大量滤过 → 绝大部分回收 → 少量精调 → 终尿”的 beginner explanation；
- 用一条统一肾单位主线连接生理、内科和泌尿外科入口；
- “肾内科与泌尿外科共享空间 / 尿液 / 梗阻 / 功能语言，但主体不同”的边界解释；
- 不让孤立数字、病理形态和术式阻塞机制主线的学习解释。

Explicitly not migrated:

- old source page ranges / Scope Audit；
- old statement about missing independent renal pathology lecture as a Current fact owner；
- old implementation state and provisional source decisions；
- old Primary / Recall / Deferred ownership；
- any historical fact not resolved to Current A3 owners.
