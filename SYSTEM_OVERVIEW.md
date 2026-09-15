# KianOS System Overview

Role: **人话版总地图**。用来快速看懂系统怎么跑、每个模块做到哪、哪些内容还需要继续补。

> 这份文件只做“总览”，不替代任何 `CURRENT.md`、`ACCEPTANCE.md`、Learning Contract 或真实 learner state。

Last updated: 2026-09-16

---

## 1｜整个系统怎么运转

核心原则：

> **功能先完整，内容持续增长，GitHub 是 Current，网页直接消费 Current。**

日常链路：

```text
Chat / 人工判断
→ 修改 GitHub Current 内容
→ loader / projection / runtime 读取
→ Astro 网页自动展示和执行
→ 学习产生私有 Evidence
→ Wrong / Uncertain / exact + 进入最小 Repair
→ Chat / Challenge / Source 修复
→ 回到原学习主线
```

理想状态：

> 同类型新内容加入 GitHub 后，不需要再改 Runtime / 页面结构。

---

## 2｜现在四个大模块做到哪

| 模块 | 功能状态 | 内容状态 | UI | 现在还要做什么 |
| --- | --- | --- | --- | --- |
| **English** | ✅ 已收口 | ✅ 主体内容完成 | 🟡 | **只做最终 UI**；真实学习发现 bug 才重开功能 |
| **Politics** | ✅ 已收口 | ✅ 五科 / Projection / 肖1000主链完成 | 🟡 | **只做最终 UI**；不再重开学习架构 |
| **LexicalOS** | 🟡 Repair / Evidence 接近收口 | 🟡 7946 review + audit 完成；canonical 到 **o3374** | 🟡 | 收完 Repair / Challenge；之后持续实现 **o3375+** |
| **Xizong** | 🟢 **System-level 共享 Runtime 已成型**；全卷 Runtime 仍未做 | 🟡 A1/A2/A3 已开放；B 接入中；后续 System 持续扩张 | 🟡 | B Projection / Runtime / Questions；后续 Systems；Visual / Precision 按需持续补 |

---

# 3｜English

## 学习流程

```text
English Home / Resume
→ Reading / Cloze / Part B / Translation / Writing
→ 完整任务作答
→ 提交
→ 没问题：退出 / 下一任务
→ 有问题：最小 Repair
→ 必要时重新执行
→ Return
```

## 当前状态

```text
功能：DONE
内容：DONE
Runtime / Evidence：DONE
剩余：UI
```

以后正常只做两件事：

1. 最终 UI / 浏览器体验；
2. 真实学习时发现具体 bug 再修具体 owner。

**不要因为想继续优化而重开 English 学习架构。**

---

# 4｜Politics

## 学习流程

```text
定位当前 Natural Unit
→ iPad / MarginNote 连续学习乘风原讲义
→ 回 KianOS
→ 肖1000验证
→ 稳定正确：继续
→ Wrong / Uncertain：最小 Repair
→ owning source / Chat
→ exact Return
```

## 当前状态

```text
五科内容：DONE
学习逻辑：DONE
Projection：DONE
肖1000 Workbench：DONE
Runtime / Evidence / Return：DONE
剩余：UI
```

以后不要再从旧 migration / legacy issue 重开 Politics 功能。

**最新决定：Politics 和 English 一样，先视为只剩 UI。**

---

# 5｜LexicalOS

## 学习流程

```text
Coverage
→ 当前 Word
→ 熟：Fast Pass
→ 模糊 / 不熟：Depth
→ Recall → Reveal
→ exact local +（只有真的需要以后再修的对象）
→ Next

Evidence
→ ACTIVE Repair target
→ Challenge / real English evidence
→ 足够稳定：DORMANT
→ 新 exact failure：REACTIVATE
```

English 可以把真实 lexical failure 返回 LexicalOS，但必须是**明确归因 + exact target**，不能把所有英语错题都变成词汇债。

## 内容进度

```text
Main Words                         7946
Production semantic review        7946 / 7946 DONE
Independent semantic audit        7946 / 7946 DONE
Canonical mechanical frontier     o3374
Post-audit corrective closure     o0001–o3374 DONE
o3375+                             NOT YET ACTIVATED
```

## 功能进度

已经有：

- Fast Pass / Depth；
- Recall / Reveal；
- exact local `+`；
- Evidence ledger；
- NONE / ACTIVE / DORMANT；
- manual clear / reactivation；
- Repair 自动从 evidence 投影到 Home；
- Challenge evidence / resume；
- English → Lexical exact evidence bridge；
- form identity 等精确 target。

还要收口：

1. Repair / Evidence Runtime 在最新 main 上最终闭合；
2. Challenge 从“手动粘 Chat JSON”升级成普通用户可直接开始；
3. 明确哪些 target 类型支持 Challenge，哪些暂时 `COMING`；
4. fresh P / R / E acceptance。

这些完成后：

> **Lexical 功能可以冻结，o3375–o7946 只继续补内容。**

---

# 6｜Xizong｜重点总览

## 一句话状态

> **西综的 System-level 学习机器已经成型；现在主要是在把更多 System 按同一套机器接进来，并持续补 Visual / Precision / 题目关系。**

不要把下面三件事混在一起：

```text
共享功能有没有做完
≠ 某个 System 有没有接完
≠ 后续 Visual / Precision 有没有补全
```

---

## 6.1｜西综平时怎么学

```text
System
→ Block
→ Logic Group
→ KianOS 给定位 / 注意点
→ iPad / MarginNote 连续读原讲义
→ 回 KianOS
→ KP Recall
→ Logic Group closure
→ Block Recall
→ Block Complete
→ System Recall
→ Official Questions
→ Wrong / Uncertain Repair
→ owning Block / KP / Chat
→ exact Return
→ 后续同题可进入 SECOND_PASS / LATE_REVIEW
```

Selective 能力：

```text
Visual
Precision
Memory
Reserve
Connection
```

它们是**有则展示**，不是每个 KP 都必须有。

---

## 6.2｜共享功能进度

| 功能 | 状态 | 人话解释 |
| --- | --- | --- |
| System / Block / Logic Group / KP 学习链 | ✅ DONE | 已经有一套通用学习模型，不给每个系统另造一套 |
| MarginNote / 原讲义 handoff | ✅ DONE | 原讲义负责连续学习，网页不做第二本讲义 |
| KP Recall / LG closure / Block Recall / Complete | ✅ DONE | 当前已开放 System 可以正常完整学完一个 Block |
| System Recall | ✅ DONE | System 真学完后再进入 |
| System official-question sweep | ✅ DONE for 已有合法题库的 System | 没有 exact membership 的 System 不猜题目范围 |
| Wrong / Uncertain → Repair → exact Return | ✅ DONE | Repair 不覆盖原始 Recall / Question Attempt |
| Multi-pass attempts | ✅ DONE at System-question level | FIRST_PASS / SECOND_PASS / LATE_REVIEW 共用一套 Runtime |
| 全卷 Runtime | ⏸ NOT YET | 以后做整卷时复用现有 attempt 语义，不新建第二套 Evidence |
| Progressive availability | 🟡 规则已明确 | 未开放内容不能伪装成 learner prerequisite；后续 UI/Runtime 按能力状态呈现 |
| Final UI | 🟡 | 单独 UI lane 收口，不改变上面学习语义 |

### 功能真正还缺什么

目前西综**不是**缺一套新的学习 Runtime。

真正的共享功能缺口主要是：

```text
1. 未来整卷 Runtime
2. 后续 System 接入时证明不需要 system-specific 页面逻辑
3. Progressive availability 在最终网页里的统一呈现
```

其他大部分工作属于**内容接入**，不是再造功能。

---

## 6.3｜各 System 内容 / 接入进度

### A1 循环

```text
功能：✅ DONE
Knowledge / Learning：✅ DONE
Runtime / Evidence：✅ DONE
UI：🟡 待最终收口
真实学习 U：尚未
```

人话：

> **A1 已经能学，工程上不用继续折腾。**

---

### A2 呼吸

```text
12 Blocks / 236 KPs / 62 Logic Groups

功能：✅ DONE
Knowledge / Learning：✅ DONE
Runtime / Evidence：✅ DONE
Source Visual：🟡 按价值持续补
UI：🟡 待最终收口
真实学习 U：尚未
```

人话：

> **A2 已经能完整学习；Visual 是增量内容，不是开放 A2 的前置条件。**

---

### A3 泌尿

```text
14 Blocks / 257 KPs / 75 Logic Groups
243 official questions

功能：✅ DONE
Knowledge / Learning：✅ DONE
Runtime / Evidence：✅ DONE
Questions：✅ exact System sweep 可用
UI：🟡 待最终收口
真实学习 U：尚未
```

人话：

> **A3 已经能学，官方题目链也闭合。**

---

### B 消化 / 代谢 / 内分泌 / 肿瘤

```text
38 Blocks / 600 KPs / 170 Logic Groups

Knowledge：✅ DONE
Learning：✅ DONE
Projection：🟡 NEXT / IN PROGRESS
Runtime / Evidence：⏸ 等 B Projection 接入后完成
Official-question exact membership：⏸ 未闭合
Visual / Precision：后续按需
UI：等可用内容接入共享页面
```

人话：

> **B 的医学内容和学习顺序已经定了；现在是在把它接进现有网页学习机器。**

B 当前最重要的顺序：

```text
Projection
→ Runtime / Evidence 接入
→ exact official-question membership
→ System question sweep
→ 可开放为完整 learner System
```

不要因为 B 还没完全开放，就重做 A1/A2/A3 或重新设计共享 Runtime。

---

### 后续 Systems

```text
状态：COMING / 持续建设
```

原则：

> **新 System 是“接入已有机器”，不是“新建一个网站功能”。**

---

## 6.4｜以后每个新 System 固定怎么做

以后看任何一个新 System，只按这条线看进度：

```text
① Knowledge
   Blocks / KPs / Logic Groups / System model

↓

② Learning
   学习顺序、Lecture handoff、Recall / closure 逻辑

↓

③ Projection
   哪些内容怎么进入 learner-facing 页面

↓

④ Runtime / Evidence 接入
   复用共享 Runtime，证明状态 / Resume / Repair / Return 正常

↓

⑤ Questions
   exact official-question membership
   + reviewed Question → Knowledge relation

↓

⑥ Optional enrichment
   Visual / Precision / Reserve / Connection

↓

⑦ UI
   用共享 task-native 页面呈现，不给每个 System 手工画新网站
```

### System 开放标准

不是要求所有 enrichment 都完成。

一个 System 可以开放，当它的**当前主学习链已经完整可信**：

```text
Knowledge
+ Learning
+ Projection
+ Runtime / Evidence
+ 当前阶段真正需要的 Questions
= OPEN
```

而：

```text
更多 Visual
更多 Precision
更多后期题目关系
更多二轮增强
```

可以继续在 OPEN 之后增长。

---

## 6.5｜Visual / Precision 内容线

PDF 重新读取的目标不是“把所有图搬进网页”，而是：

```text
Source PDF
→ 判断这个东西属于：
   SOURCE VISUAL
   / PROJECTION
   / PRECISION
   / SKIP
→ 绑定 owning Logic Group / KP
→ 在正确学习时刻出现
```

### Visual 的完成标准

不是：

> 所有 PDF 图片都裁完。

而是：

> **真正依赖视觉理解的对象被正确识别和接入；其余内容不为了“完整率”强行做成图片。**

所以 Visual / Precision 是**持续内容线**，不阻塞已经开放的 A1/A2/A3。

---

## 6.6｜西综最值得一直看的未完成项

```text
共享功能
→ 全卷 Runtime
→ Progressive availability 最终网页呈现

B System
→ Projection
→ Runtime / Evidence
→ exact official-question membership
→ official question sweep

后续 Systems
→ 按 Knowledge → Learning → Projection → Runtime → Questions 接入

持续增量
→ Source Visual
→ Precision
→ reviewed Question → Knowledge relations

UI
→ latest Current 上做最终 Mac-wide 收口
```

---

# 7｜内容以后怎么更新

每次只问三个问题：

### A. 功能缺了吗？

如果一种新内容需要改 Runtime 才能显示：

> 先判断是不是通用能力真的缺失。

如果只是多了一个同类型内容：

> **只改 GitHub 内容，不改 Runtime。**

### B. 内容缺了吗？

直接记在对应模块：

```text
DONE
IN PROGRESS
NOT STARTED
COMING
PROTECTED
```

### C. 会不会阻塞现在学习？

必须区分：

```text
工程还没做完
≠ Kian 没学完
≠ 前置条件没满足
```

未开放内容不能制造 learner debt，也不能挡住已经开放的主线。

---

# 8｜最值得持续看的未完成项

```text
English
→ UI

Politics
→ UI

Lexical
→ Repair / Challenge / Evidence final closure
→ o3375+ canonical implementation 持续推进

Xizong
→ B Projection → Runtime / Evidence
→ B official-question exact membership
→ 后续 Systems 持续建设
→ Source Visual / Precision 按认知价值持续补
→ 未来全卷 Runtime

Global / Website
→ 最新 Current 稳定后做统一 UI convergence
→ Home 保持 Mac desktop 一屏核心信息可达
```

---

# 9｜更新这份文件的规则

只在**实质状态变化**时更新，例如：

- 一个功能真正闭合；
- 一个内容 frontier 前进；
- 一个 System 从 `COMING` 变 `OPEN`；
- 一个真实 blocker 被发现或解决；
- UI 从未完成变成已接受。

不要写：

- 历史过程；
- 旧 branch / 旧 PR 故事；
- 每次 CI 运行；
- 详细 contract；
- learner progress。

需要细节时再进入：

```text
SYSTEM_OVERVIEW.md
→ 对应 lane CURRENT.md
→ 必要时 local ACCEPTANCE / exact owner
```

这份文件的目标始终只有一句话：

> **打开 2 分钟，就知道 KianOS 现在有什么、还缺什么、下一步该补哪里。**
