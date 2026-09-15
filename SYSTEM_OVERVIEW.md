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

| 模块 | 功能状态 | 内容状态 | 现在还要做什么 |
| --- | --- | --- | --- |
| **English** | **已收口** | 主体内容已完成 | **只做最终 UI**；真实学习发现 bug 才重开功能 |
| **Politics** | **已收口** | 五科内容 / Projection / 肖1000主链已完成 | **只做最终 UI**；不再重开学习架构 |
| **LexicalOS** | Repair / Evidence 接近收口 | 7946 全量语义 review + audit 已完成；canonical 实现到 **o3374** | 收完 Repair / Challenge / English handoff；之后继续实现 **o3375+** 内容 |
| **Xizong** | 通用学习 Runtime 已经能跑完整系统 | A1/A2/A3 已闭合；B 正在继续；后续系统持续扩张 | B Projection/后续 Runtime；继续补后续 Systems、Visual、Precision、题目关系 |

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

# 6｜Xizong

## 通用学习流程

```text
System
→ Block
→ Logic Group
→ KianOS orientation / attention cue
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

## 当前系统进度

### A1 循环

```text
功能 / 内容 / Runtime / Evidence：DONE
下一步：真实学习 + UI
```

### A2 呼吸

```text
12 Blocks / 236 KPs / 62 Logic Groups
功能 / 内容 / Runtime / Evidence：DONE
Source Visual 已开始跑真实案例
下一步：真实学习 + Visual 按需继续补 + UI
```

### A3 泌尿

```text
14 Blocks / 257 KPs / 75 Logic Groups
243 official questions
功能 / 内容 / Runtime / Evidence：DONE
下一步：真实学习 + UI
```

### B 消化 / 代谢 / 内分泌 / 肿瘤

```text
38 Blocks / 600 KPs / 170 Logic Groups
Knowledge：DONE
Learning：DONE
Projection：IN PROGRESS / NEXT
Runtime / Evidence：等待 Projection
Official-question exact membership：仍需闭合
```

### 后续 Systems

```text
持续建设
```

原则：

> 新 System 接入已有通用 Runtime，不重新发明一套学习系统。

## Visual / Precision 内容线

PDF 重新读取的目标不是“把所有图搬进网页”，而是：

```text
Source PDF
→ 判断这个东西属于：
   SOURCE VISUAL / PROJECTION / PRECISION / SKIP
→ 绑定 owning Logic Group / KP
→ 在正确学习时刻出现
```

Visual / Precision 可以持续补，不阻塞已经开放的学习主线。

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
