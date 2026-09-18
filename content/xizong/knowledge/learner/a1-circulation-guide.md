# A1 循环系统｜Beginner Guide

Status: **CURRENT**  
Role: **BEGINNER_EXPLANATION_ONLY**  
Contract: `content/xizong/knowledge/learner/BEGINNER_GUIDE_CONTRACT.md`

## Authority boundary

This Guide explains Current A1; it does not own A1 medical truth.

Current owners:

- System semantics → `content/xizong/knowledge/systems/a1-circulation/system.json`
- first-pass / Logic Group / Recall support → `content/xizong/knowledge/learner/a1-circulation-learning.json`
- medical Core → `content/xizong/knowledge/systems/a1-circulation/blocks/`
- shared learning semantics → `content/xizong/LEARNING_CONTRACT.md` + `content/xizong/knowledge/learner/study-policy.json`

Historical explanatory provenance, bounded to the last full pre-retirement Guide only:

- path: `content/xizong/knowledge/system-guides/西综循环系统_System_Guide_v2_完整导学_认知依赖与学习顺序.md`
- pre-retirement commit: `d2228c07a2f6213a65fd6a3d86871cbfd3f7a87a`
- use: explanatory pattern / metaphor provenance only; **not Current authority**

---

## 1｜先搞懂：循环系统到底在解决什么

第一次学循环，不要把任务压成“把血压维持正常”。

更准确的脑内问题是：

> **怎样让血持续从静脉容量池回到心脏，被泵向前，经血管分配到组织完成交换，再被收回来；而且在容量、阻力、需求和体位变化时，仍尽量维持有效灌注。**

所以几个常见变量不能互相冒充：

- 有压力，不等于一定有足够流量；
- 有总流量，不等于每个器官分配都正常；
- 有足够总血容量，不等于有效回心一定正常；
- EF、CO、灌注压、局部血流各自回答不同问题。

A1 的第一原则不是背疾病名，而是先问：**哪一个循环变量或哪一段管路先出故障？**

---

## 2｜一张脑内母模型

把循环先压成这一圈：

```text
静脉容量池 / 回心
→ 心泵 + 瓣膜
→ 动脉压力与流量
→ 小动脉阻力 / 器官分配
→ 微循环交换
→ 静脉回收
→ 再回心
```

同时有三条平行控制线：

```text
节律 / 电活动
神经—体液—肾容量调节
冠脉自供血 / 氧供—耗氧
```

历史 Guide 曾用“泵—阀—管路—容量池—节律—调节—交换”帮助第一次进入。这里保留的是这个**解释动作**；具体医学内容以现在这套系统模型为准，不把旧 Guide 当作事实来源。

---

## 3｜第一次进入，只先抓两套坐标

### A. 四个基础变量

```text
P  压力：推动血流，但必须说明在哪一段
Q  流量：单位时间真正送出去多少
R  阻力：决定压力差下的流量与分配
V  容量：决定容量池、回心、前负荷和长期工作点
```

三个最小关系只用来描述同一套循环：

```text
CO = HR × SV
MAP ≈ CO × TPR
Q ≈ ΔP / R
```

### B. 四个心泵坐标

```text
preload       进泵前装了多少 / 充盈到什么程度
 afterload     泵出去时要克服多大出口负荷
contractility 心肌自己的收缩能力
compliance    心腔在压力下有多容易被充开
```

后面遇到高血压、瓣膜病、冠心病、心衰、休克时，先把变化放回这些变量，再进入疾病专属规则。

---

## 4｜疾病先按“第一故障”定位

A1 最值得保留的不是一张疾病目录，而是 Failure Mode 语言：

1. **泵弱**：排空失败 → 前向流量下降，同时上游压力升高；
2. **泵硬 / 充盈受限**：舒张或外部限制异常 → 充盈压高、储备差；
3. **瓣膜故障**：狭窄或反流 → 压力 / 容量负荷重新分配；
4. **血管阻力 / 管路狭窄或阻断**：上游负荷或压力升高、下游灌注下降；
5. **节律 / 时序失败**：起搏、传导或同步异常 → 有效充盈 / 射血下降；
6. **容量 / 分布异常**：有效容量、静脉回流或血流分布失配；
7. **微循环交换 / 淋巴失败**：总 CO / MAP 甚至可暂时正常，但组织交换已失败。

再用几条 judgment axes 把问题说清：

```text
上游淤积 ↔ 下游低灌注
压力负荷 ↔ 容量负荷
收缩障碍 ↔ 舒张障碍
氧供下降 ↔ 氧耗增加
急性 ↔ 慢性
代偿 ↔ 失代偿
稳定 ↔ 不稳定
```

这比“看到疾病名就调用整章答案”更适合作为第一次学习的入口。

---

## 5｜12 个 Block 为什么这样排

### 第一层｜先建立正常机器

- **B1 正常机械循环**：先知道血怎样被泵、被分配、交换并回心；
- **B2 循环调节与容量控制**：再回答这些变量偏了以后谁感知、谁执行、谁长期重建工作点；
- **B3 心肌电活动与 ECG 语言**：建立泵“什么时候工作”和电—机械接口；
- **B4 正常止血与病理循环整合**：建立血管破损后怎样封口、限制、拆除，以及血栓事件怎样出现。

### 第二层｜再建立长期结构底物与局部疾病

- **B5 高血压与动脉粥样硬化**：长期压力 / 阻力异常与斑块底物；
- **B6 冠心病与心肌梗死**：把冠脉供需、斑块事件、坏死和再灌注串起来；
- **B7 风湿、感染性心内膜炎与四瓣膜病**：统一处理瓣膜故障；
- **B8 心肌与心包**：区分泵本体、舒张限制与心包外部约束；
- **B9 周围血管疾病**：把管路故障从冠脉扩到外周；
- **B10 心律失常**：把 B3 的电活动变成临床节律判断。

### 第三层｜最后收口成整体循环失败

- **B11 心力衰竭**：泵、负荷、容量、神经体液与重构汇合；
- **B12 休克与心脏骤停**：灌注、分布、泵衰和循环停止汇合。

所以 A1 的路线不是“生理讲完再病理再内科”，而是：

```text
正常运行
→ 调节 / 电 / 止血
→ 长期底物和局部故障
→ 整体泵衰 / 灌注失败
```

---

## 6｜进入一个 Block 时，Guide 到哪里就停

System Guide 只负责把你送到正确的 Block 入口。

进入 Block 后，正常分工是：

```text
中心问题
→ Block Framework / 最小脑内模型
→ 按当前 A1 学习路径规定的 Source contact 学原讲义
→ Logic Group / KP 做局部理解与闭卷恢复
→ Group / Block Closure
→ 进入 Memory Routing
```

注意：这段流程**不意味着每个 Logic Group 都必须重新回一次讲义**。A1 的具体 Source-contact 粒度继续按当前学习路径执行。

---

## 7｜Framework 与 Memory 怎么看

### Framework

Framework 不是“摘要卡片”，而是这个 Block 在学 KP 前先装进脑内的结构。

例如正常机械循环的 Framework 让压力差、瓣膜、容积、SV/CO、动脉压力、静脉回心、微循环与冠脉自供处在同一条链上。后续 KP 是往这张图里填可恢复的细节，而不是把图拆成 30 多个互不相关的小点。

### MI-G

当前 Block 若显式标出 `MI-G`，它代表会阻断后续理解 / Recall 的 gating memory，第一次就要带走。

### MI-D

当前 Block 若显式标出 `MI-D`，它代表需要精确保留、但可以从当前机制主线移到后续间隔记忆的内容。

`MI-D` 不是低价值；它只是**不应该为了一个孤立数字或长名单让整条机制学习停住**。

---

## 8｜这个 Guide 最终希望你留下什么

第一次完成 A1 后，至少应该能闭卷恢复：

```text
血从哪里回来
→ 泵如何把它送出去
→ 压力 / 流量 / 阻力 / 容量怎样互相约束
→ 谁调 HR、收缩性、TPR、静脉容量和水钠
→ 电活动怎样决定时序
→ 冠脉怎样维持泵本身
→ 出现淤血、低灌注、缺血或休克时，第一故障可能在哪
```

如果只能按 B1–B12 背章名，而不能把一个新场景放回这套变量与 Failure Map，System Guide 的任务还没有完成。

---

## 9｜Historical migration receipt

From the bounded pre-retirement Guide, this Current asset intentionally preserves only:

- “泵—阀—管路—容量池—节律—调节—交换”的 beginner metaphor；
- “循环最终不是只维持血压”的系统任务解释；
- 用统一运行模型替代按学科目录重复学习的解释方式；
- 先运行模型、再按 Failure / Block 分支的教学顺序。

Explicitly **not migrated**:

- old page ranges / source tables;
- old Block implementation state;
- old timing / workload estimates;
- old Primary / Recall / Deferred ownership claims;
- any old medical statement not re-resolved to Current A1 owners.
