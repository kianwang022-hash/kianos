# A2 呼吸系统｜Beginner Guide

Status: **CURRENT**  
Role: **BEGINNER_EXPLANATION_ONLY**  
Contract: `content/xizong/knowledge/learner/BEGINNER_GUIDE_CONTRACT.md`

## Authority boundary

This Guide explains Current A2; it does not own A2 medical truth.

Current owners:

- System semantics → `content/xizong/knowledge/systems/a2-respiratory/system.json`
- first-pass / Logic Group / Recall support → `content/xizong/knowledge/learner/a2-respiratory-learning.json`
- medical Core → `content/xizong/knowledge/systems/a2-respiratory/blocks/`
- shared learning semantics → `content/xizong/LEARNING_CONTRACT.md` + `content/xizong/knowledge/learner/LECTURE_REPLACEMENT_CONTRACT.md`

Historical migration provenance is preserved in Git history only and is not part of Current routing.

---

## 1｜先搞懂：呼吸系统不是“肺病目录”

整个 A2 先只追一个运输问题：

> **外界 O₂ 怎样沿气道进入肺泡、跨呼吸膜进入血液，再由 Hb 携带送向组织；呼吸肌／胸廓／胸膜在气路旁驱动通气，肺血流与肺泡通气并行到达交换面。组织产生的 CO₂ 怎样沿反方向排出，同时维持 PaO₂、PaCO₂ 与酸碱稳定。**

第一次学习最容易犯的错误，是把“低氧”当成一个单一问题。实际上至少要先区分：

```text
空气有没有到肺泡？
肺泡有没有真正开放？
气体能不能过膜？
通气和血流有没有匹配？
血里有没有足够 Hb / O2 content？
呼吸控制器有没有发出正确驱动？
```

同一个“喘”或“低氧”，第一故障层可以完全不同。

---

## 2｜同一张整系统模型

沿当前 System，把气体路径、并行机械支、气血匹配与反馈放在同一张图上：

```text
O₂去程：外界空气 → 传导气道 → 肺泡气 ──跨呼吸膜──→ 血液中的O₂ → Hb携氧 → 组织供氧
                                  ↑                 ↑
                            肺泡通气 VA         肺血流 Q
                                  └──并行匹配于同一交换面──┘

并行机械支：呼吸肌 / 胸廓 / 胸膜耦联
           → 肺扩张与肺泡压差 → 驱动空气经气道进出肺泡
           弹性负荷与气道流阻同时约束这次通气

CO₂回程：组织 → 血液 → 肺泡 → 传导气道 → 外界

反馈：血气 / H⁺ → 外周与中枢呼吸调节 → 呼吸频率、深度与时程
                → 有效肺泡通气 VA → 血气 / H⁺改变 → 返回调节输入
```

呼吸肌、胸廓与胸膜负责驱动气流；肺泡通气与肺血流并行到达交换面；CO₂反向运输，控制器持续反馈。它们不构成气体依次穿过的一串站点。

这份 Guide 只解释当前 System 的关系，系统语义仍由原 System 文件负责；疾病定位继续使用同一 Failure Mode 框架。

---

## 3｜第一次进入，先钉住五个区分

### ① 通气量不等于有效肺泡通气

```text
VE = VT × f
VA = (VT - VD) × f
```

真正更直接关联 CO₂ 清除的是有效肺泡通气，而不是只看一分钟吸了多少气。

### ② 通气失败不等于换气失败

- 通气：空气有没有有效到肺泡；
- 换气：肺泡气体能不能通过弥散与 VA/Q 匹配进入/离开血液。

### ③ PaO₂ / SaO₂ 不等于 CaO₂ / 组织氧供

肺把氧装进血液只是运输链的一段。Hb 数量与结合状态也决定最终能带多少氧。

### ④ 阻塞性不等于限制性

一个主要是“气出不去 / 阻力高”，一个主要是“肺或胸廓扩不开 / 容量小”；先定位机械层，再解释肺功能指标。

### ⑤ 死腔样不等于分流样

- 高 VA/Q：通气相对多、血流相对少；
- 低 VA/Q：血流相对多、通气相对少。

不要把所有低氧都压成“弥散差”。

---

## 4｜按第一故障层看疾病

A2 可以先压成 8 类 Failure：

1. **气道阻塞**：空气进出肺泡受阻；
2. **通气机械 / 风箱失败**：肺、胸廓、胸膜或呼吸肌不能建立足够扩张；
3. **肺泡充填或塌陷**：有血流但局部通气显著下降；
4. **呼吸膜异常**：膜增厚或有效面积下降，弥散受限；
5. **VA/Q 失配**：通气与肺血流没有配在一起；
6. **肺血管 / 通路异常**：肺血流下降或右心后负荷上升；
7. **呼吸控制器 / 神经驱动异常**：通气驱动和 PaCO₂ 控制失稳；
8. **携氧失败**：PaO₂ 可以不低，但 Hb / SaO₂ / CaO₂ 已经让组织氧输送不足。

碰到一个新病例，先定位 Failure 层，再进入疾病特异标准。

---

## 5｜12 个 Block 是怎样从正常链分出去的

### 正常底座

- **R1 正常通气力学与肺功能**：先学风箱、压力、顺应性、阻力、容量和肺功能语言；
- **R2 肺换气、气体运输与呼吸调节**：把弥散、VA/Q、Hb 运输、PaCO₂ 与控制器接上。

### 气道阻塞分支

- **R3 COPD**：持续气流受限、过度充气与慢性后果；
- **R4 支气管哮喘**：可变气道阻塞、炎症与反应性。

### 感染 / 结构 / 间质分支

- **R5 肺炎**：肺泡充填与感染证据；
- **R6 支气管扩张与肺脓肿**：结构破坏、引流失败与化脓；
- **R7 肺结核**：结核特异病理—临床—诊疗链；
- **R8 间质性肺疾病与硅肺**：呼吸膜 / 间质与限制性力学。

### 肺血管 / 胸膜 / 肿瘤分支

- **R9 肺动脉高压、慢性肺心病与急性肺血栓栓塞**：肺血流、PVR 与右心后负荷；
- **R10 胸膜空间与胸部损伤**：把胸膜腔、胸壁与通气力学接到急症；
- **R11 肺癌与纵隔**：器官特异肿瘤与空间定位。

### 系统出口

- **R12 ARDS 与呼吸衰竭**：前面各种 Failure 最终在低氧、CO₂ 潴留和支持治疗上汇合。

所以 A2 的学习路线是：

```text
正常空气运输链
→ 按第一 Failure 层分支
→ 在 R12 汇合成呼吸系统整体失败
```

---

## 6｜进入一个 Block 后怎么接

System Guide 到 Block 入口就停止扩写。当前推理需要原图或原资料时在对应节点查看；LG 不规定固定停顿或测试，普通复习可直接展开完整精记答案，自测时再按要求遮住答案。

正常分工：

```text
System 中的位置与中心问题
→ 当前 Block 已采用的连续模型
→ 在自然节点展开既有 Core，嵌入知识标题〔完整 Prompt〕
→ 压缩并普通复习同一模型
→ 按既有 Memory Routing 取用完整精记答案，并接回 System
```

A2 已有 Precision / Visual / Connection 等选择性内容支持，但它们是辅助索引，不替代 Framework、Core 或原讲义。

---

## 7｜Memory 不是“把所有数字现在背完”

若当前 Block 显式给出：

- **MI-G**：会阻断后续理解或 Recall，当前必须带走；
- **MI-D**：需要精确保留，但可以进入后续间隔记忆，不阻塞当前机制主线。

对呼吸尤其重要：机械变量、VA/Q、气体运输与判别坐标属于模型底座；大量病原谱、阈值、检查数字和分期细节只有在当前学习内容明确归位后才进入对应 Memory 路径，不能让它们把正常链切碎。

---

## 8｜第一次完成 A2 后应该能做什么

不要求先背出所有病名，而要能面对“喘、低氧、CO₂ 高、肺功能异常、影像异常”时先问：

```text
气道？
风箱 / 胸膜 / 呼吸肌？
肺泡？
呼吸膜？
VA/Q？
肺血管？
控制器？
Hb / CaO2？
```

然后再进入对应 Block。

如果只记住 COPD、肺炎、结核、肺癌四套章节，而不能把它们放回同一条气体运输链，System Guide 的任务还没有完成。
