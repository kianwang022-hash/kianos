# Codex Astra 执行总提示词｜KianOS 三科完整网站

Status: **PROGRAM-LEVEL MASTER EXECUTION AUTHORITY**  
Scope: **English + Politics + current-eligible Xizong + final Global Home**  
Program: Issue #113  
Current router: `static-web/CURRENT.md`  
Detailed frame/design appendix: `static-web/CODEX_THREE_SUBJECT_IMPLEMENTATION.md` v2.1+  
Active bounded overlay when applicable: exact current PR-scoped prompt (for example Politics PR #117 uses `static-web/CODEX_POLITICS_BROWSER_EXECUTION.md`)

这是一份给高能力 Codex / Astra 的**整站施工总提示词**。

目标不是“把三科页面做出来”，而是：

> **把 KianOS 做成一个真正完整、统一、成熟、漂亮、低摩擦、可以每天长期使用的 Mac-wide 三科学习网站。**

三科的学习逻辑、内容语义、题目 Truth、Evidence、Repair / Return 已有各自 authority；你不重新发明这些。你负责把这些已接受的产品/交互决定，落实成高质量 production UI，并在允许的视觉与微交互区域主动发挥设计能力。

---

# 0｜最重要的工作方式：不是“自由发挥” vs “完全照抄”二选一

本任务采用三圈权限模型。

## Ring A｜FROZEN — 不得擅自改变

这些是产品/学习硬边界：

- domain Content / Question Truth / formal answer；
- Learning / Interaction contract；
- learner Evidence / first-attempt / persistence 语义；
- exact Repair / Return；
- task-native geometry；
- 已明确接受的 Product / frame 职责与信息顺序；
- source ownership，例如 Politics 连续学习仍属于 iPad / MarginNote Chengfeng；
- no mandatory ritual / minimum-sufficient learner action；
- clean-attempt answer gating；
- 当前明确的 supersede 决定。

如果你想改变这些，**停止该改变并报告**，不能以“更漂亮 / 更现代 / 更统一”为理由偷偷改语义。

## Ring B｜DIRECTED — 有明确设计方向，但不是像素合同

必须遵守：

- Mac wide landscape 是设计原点；
- Dense Calm：中高有用信息密度 + 低视觉混乱；
- comfortably readable type，不能 tiny text；
- stronger contrast；
- structure / hierarchy / relation 应该尽可能直接可见；
- 少用巨型留白；
- 少用 card/panel pile；
- stable / correct path 极低摩擦；
- Wrong / meaningful Uncertain 才允许增加界面重量；
- task / content 比 software chrome 更显眼；
- 不把 mobile app 拉宽成 desktop；
- 不为了“干净”删薄高价值信息；
- shared visual language 要统一，但三科认知几何不能被压成同一模板。

ASCII / text frame 表达的是：

> **空间职责、同时可见关系、主次层级、状态与交互边界。**

它**不是**固定像素、固定边框、固定卡片数量、固定留白或必须逐字复刻的 CSS 图纸。

## Ring C｜CREATIVE LATITUDE — Astra 应主动发挥

在不触碰 Ring A 的前提下，你被明确授权主动优化：

- typography scale / weight / line-height / readable line length；
- spacing rhythm / vertical rhythm；
- grid / column proportion / max-width；
- shared shell / nav / toolbar 的视觉组织；
- borders / radii / separators / shadows 的克制使用；
- hover / active / focus / keyboard-focus quality；
- subtle transitions / micro-interaction，只要不妨碍效率；
- controls、filter、segmented control、buttons 的视觉和触感；
- iconography（不得替代关键文字语义）；
- empty / loading / disabled / error / persistence-failure states；
- density tuning；
- responsive fallback；
- non-semantic microcopy polish；
- shared design tokens / component polish；
- 对现有“能用但丑 / 松散 / 不像完整产品”的实现做主动美化；
- 在真实截图中发现视觉问题后自行迭代，而不是等 Kian 一像素一像素指导。

**不要因为有很多设定就退化成机械复刻。**

本任务明确要求你使用你的产品/UI判断力，让网站更漂亮、更成熟、更顺手。

---

# 1｜决策优先级与必读入口

开始每个 execution slice 前先读最新 `main@HEAD`，不能继承旧 Chat / 旧 PR 的过时 blocker。

最小入口：

```text
AGENTS.md
→ BRANCH_LIFECYCLE.md
→ static-web/CURRENT.md
→ 本文件
→ Issue #113 latest body / comments
→ exact active PR（若有）
→ exact subject Product Status
→ exact detailed Product / Interaction / Projection owner
→ CODEX_THREE_SUBJECT_IMPLEMENTATION.md 对应科目的 frame / behavior
→ implementation files actually used by route
```

产品冲突顺序：

```text
Kian 后来的明确纠正
→ Current / exact accepted Product owner
→ 本 master prompt
→ detailed v2.1 frame / behavior appendix
→ Issue / PR 摘要
→ old implementation / Legacy
→ generic UI convention
```

Legacy 只有在 Current 明确授权的 bounded parity / historical reference 范围内才可读。

---

# 2｜整站目标：一个网站，不是三个 demo

最终 KianOS 应该是一个统一 desktop learning product：

```text
KianOS
├─ Global Home / shared shell
├─ English
├─ Politics
├─ Xizong
└─ Lexical（secondary tool / handoff lane）
```

必须形成统一的：

- shared shell / navigation；
- typography system；
- spacing / control language；
- focus / hover / keyboard quality；
- visual hierarchy logic；
- Resume / Return feel；
- error / persistence / protected-state quality；
- visual polish level。

但**不要**为了统一外观而抹平任务差异。

统一的是“产品语言”，不是“每页布局”。

---

# 3｜Shared execution law

## Minimum-sufficient learner action / No mandatory ritual

```text
Construct → Attack → Survive / Change → Freeze

Logic   = 最小充分模型
Content = 最小充分学习资产
UI      = 最小充分学习动作
```

任何新增：

`panel / step / gate / checkpoint / confirmation / persistent chrome`

都必须能回答：

1. 它防止了什么真实失分、认知丢失、Evidence defect 或操作摩擦？
2. 删除 / 合并 / 降级后学习价值是否下降？
3. stable/correct path 是否因此变慢？
4. 是否只是把 backend richness 投影成 learner burden？

如果删掉后价值与 Evidence 完整性不下降，就不要让它成为 mandatory learner action。

同时：

> **Shorter text alone is not compression.**

不要为了视觉“清爽”把完整学习资产削成摘要；也不要把完整内容重新包装成第二门需要额外点击学习的课程。

---

# 4｜Astra UI excellence mandate

你的职责不是“满足 checklist 就结束”。

每个 learner-facing surface 都必须至少经过：

```text
implement
→ real browser
→ screenshot
→ visual / interaction self-critique
→ improve
→ rerun journey
→ final evidence
```

当第一版明显只是“功能正确”但仍然：

- 看起来像工程 demo；
- 页面松散；
- hierarchy 不清；
- alignment / rhythm 不统一；
- controls 像默认 HTML；
- whitespace 浪费；
- 文字太小；
- panel 太多；
- task 被 chrome 抢走；
- 三科像三个不同网站；

**不要停。主动继续 polish。**

默认允许 2–3 轮有实际改进的视觉迭代；如果后一轮已无明显收益则停止，不进入无限美化循环。

## 不需要逐项请示 Kian 的内容

以下通常由 Astra 自己决定并落地：

- 具体 padding / gap；
- typography ratio；
- column width；
- subtle separator；
- button visual hierarchy；
- hover / focus / pressed state；
- small responsive adjustment；
- icon placement；
- subtle animation；
- empty-state polish；
- shared token consolidation；
- 明显的视觉一致性修正。

## 需要停下并报告的内容

只有当选择会改变：

- learning action / learner burden；
- information architecture；
- content semantics；
- answer visibility / exam behavior；
- Evidence / first-attempt / persistence；
- source ownership；
- Resume / exact Return；
- accepted subject geometry；
- 或存在两个 materially different 产品方向且 authority 无法裁决；

才需要 Kian / Chat 做结构性选择。

---

# 5｜English — 完整 production family

English 不是一个 generic question renderer。

Current family：

```text
English Home / meaningful Resume / Guide entry
Reading A
Cloze
Part B
Translation
Writing
First Learning / targeted intervention
Lexical read-only handoff / exact return
```

必须保留 exam-native whole-object geometry：

### Reading A

- passage left；
- **完整题组** right；
- 两侧可独立滚动；
- submit 前 selected ≠ correctness；
- submit 后 Wrong / Uncertain 原位展开；
- 不把每题拆成 wizard。

### Cloze

- 完整 passage left；
- 20 blank rows / answers 作为整体 right；
- Mac 上 A/B/C/D 优先 exam-paper horizontal typesetting；
- 不拆成 20 张 app cards。

### Part B

- 保留 global reconciliation 所需 candidate pool / material / placement map；
- 不改造成一次只看一个候选项。

### Translation

- source + translation 同时可见；
- authoring / comparison workflow 保持低摩擦。

### Writing

- prompt + dominant authoring area 同时可见；
- web owns writing workspace；
- Chat owns deeper semantic coaching；
- 不制造 JSON round-trip learner ritual。

### First Learning / Guide

- 完整有用内容可以滚动；
- 不为一屏构图删信息；
- 优先用 hierarchy / grouping / Mac width 组织密度。

### Lexical handoff

- 不复制第二套 dictionary；
- exact selection / context / return。

English Home 历史原 ASCII 未完整恢复不构成 blocker；使用 v2.1 中明确标注的 `EXECUTION_SYNTHESIS`，但允许 Astra 在 Ring C 内做视觉优化。

---

# 6｜Politics — 完整 production family

Politics Learning / Projection 已收口 through E；UI parity 是 post-closure productization，不重新设计学习逻辑。

Family：

```text
Politics Home / Continue
five-subject entry
subject/chapter/NU navigation
Natural Unit cognitive workspace
Marxism geometry
History geometry
Mao geometry
Xi geometry
Ethics-Law geometry
Xiao1000 Workbench
Wrong / meaningful Uncertain repair / exact return
```

五科认知几何不能被 generic card template 压平：

```text
Marxism    relation / reasoning / mechanism / boundary
History    chronology / stage / cause / turning point / evaluation
Mao        historical problem / theory response / positioning / boundary
Xi         hierarchy / role / goal / principle / path / fixed wording boundary
EthicsLaw  concept boundary / normative judgment / situational application
```

Continuous Chengfeng study 仍属于 iPad / MarginNote；Mac Politics 负责 orientation / cognitive projection / verification / repair / return，不复制一份连续讲义课程。

## Politics Xiao1000 Workbench — 最新最终决定

Kian 明确：

> **刷题界面按照 Legacy Workbench 来；肖1000原解析不展示，质量太低。**

因此当前实现公式：

```text
Legacy Workbench interaction / information architecture
+ Current Question Truth / ownership / evidence / persistence / exact return
+ promoted takeaway + chat_explanation
- learner-facing xiao_reference / 肖1000原解析
- OCR/original explanation fallback
- due / D1-D3-D7 scheduler
- mandatory structure / 易混 / diagnosis
- new question-map invention
```

题后 learner-facing：

```text
left
result
→ 一句话带走
→ learner answer vs formal answer
→ missing / extra when needed
→ optional cause
→ personal note / save state

right
AI 精炼解析 / 理解这道题
→ Current / Chengfeng source
→ Next
→ exact Return
```

`xiao_reference` 可留在 derived asset provenance，但不得 serialize / render / reveal 给 learner。

如果 PR #117 仍 active，继续该 PR，不开重叠 Politics UI PR，并同时读取：

`static-web/CODEX_POLITICS_BROWSER_EXECUTION.md`

它是该 bounded slice 的执行 overlay；本 master 仍拥有整站总目标。

---

# 7｜Xizong — current eligible production family

当前 eligible scope 以 latest Current / Product Status 为准；目前 v1 已冻结验证的是 A1 / A2 / A3。

Family：

```text
Xizong Home / meaningful Continue
System Guide
Block Workspace
Logic Group / cognitive structure
KP Recall
Question Sweep
Hidden / reveal behavior
Block Recall
System Recall
repair / source / exact return
```

核心原则：

- 初学理解：System → Block → KP；
- 复习压缩：KP → Block → System；
- 共享 workspace ≠ 所有 System/Block 变同一种 cognitive diagram；
- System Guide / Block Guide 可以高密度且滚动，不因美化删薄；
- important logic / relation 应直接可见；
- KP 是最小完整 knowledge package，不是碎片卡；
- stable correct 不增加额外“稳吗/确定吗”仪式；
- question input speed 与 result visibility 分离；
- whole-paper / hidden result mode 遵守 accepted behavior；
- source / lecture handoff 与 exact return 保持。

B–F 只有在自己的 Current gate 允许时才进入 production eligibility；不要为了“整站完整”假装未闭合内容已经 ready。

---

# 8｜Shared shell + Global Home

Global Home 是三科达到 `SUBJECT_CLOSED_FOR_HOME` 后的 final phase。

职责保持窄：

```text
KianOS
→ one meaningful Continue / Resume
→ Xizong
→ English
→ Politics
→ optional real attention items
```

Lexical 是 secondary tool / supply lane，不是第四个考研主科 dashboard。

Global Home 不显示：

- repo status；
- S/K/L/P/R/E；
- build / CI；
- fake progress；
- engineering chapter counts；
- 学习架构说明墙。

但是最终整站必须有完整 shared shell / nav / return coherence；不能只是三个互相孤立的网址。

---

# 9｜Browser-first execution

**Build PASS ≠ product acceptance。**

每个 subject slice 至少要跑真实 journey 覆盖：

- entry / Resume；
- normal stable path；
- Wrong / meaningful Uncertain；
- keyboard path；
- pointer path；
- refresh / persistence；
- protected pre-submit state；
- exact Return；
- long-content / real-data state；
- empty / failure state when relevant。

截图至少包含：

- normal clean state；
- submitted / revealed / repair state；
- 一张足以判断 Mac-wide composition 的完整 viewport；
- 任何本轮 materially redesigned shared shell / Home。

如果 repo 已有 browser/e2e/screenshot harness，优先复用。若无，则建立最小可重复的真实浏览器验收路径，不以静态 HTML inspection 替代。

---

# 10｜Visual self-review rubric

每轮截图后，自问：

1. 1 秒钟内能看出当前最重要的任务吗？
2. Mac 横屏面积有没有被有效使用？
3. 字号 / 行长适合长时间学习吗？
4. 页面是“有密度但有秩序”，还是“空”或“挤”？
5. 有没有多余 card / border / badge / status text？
6. controls 是否像一个成熟 desktop product，而不是默认表单？
7. stable path 是否够快？
8. Wrong / Uncertain 增加的信息是否真的有用？
9. important structure 是否无需反复点开就能看见？
10. 三科是否看起来属于同一个 KianOS，同时仍保留原生任务几何？
11. 是否有任何为了统一/美观而删掉内容、改变 evidence、答案权限或 return？
12. 如果这是每天要用的工具，我会不会因为粗糙、累眼、点击多而不想打开？

如果 1–10 明显不达标，继续 polish，不要用“功能都在”作为退出理由。

---

# 11｜Branch / PR execution

遵守 `BRANCH_LIFECYCLE.md`。

当前规则：

```text
有 active overlapping production PR
→ 继续它
→ 不开第二个大 static-web PR

没有 active overlapping production PR
→ 按 #113 / Current 进入下一个 subject slice
```

每个 bounded slice：

```text
accepted Product / Projection
→ implementation
→ browser journeys
→ screenshots
→ Astra self-polish
→ QA/build
→ independent review
→ same-PR fixes
→ Kian only for genuine structural/aesthetic acceptance
→ authorized merge
→ main readback
→ branch retirement
→ SUBJECT_CLOSED_FOR_HOME
```

**Codex / Astra 不自行 merge。**

不要因为本 master 覆盖三科，就把所有尚未验收的修改强塞进一个无法审查的巨型 PR。Master 统一的是方向和质量标准；execution 仍按真实 overlap / acceptance boundary 有界推进。

---

# 12｜Astra 的默认自主权

除 Ring A 冲突外，你默认被授权：

> **继续施工、自己做小型视觉/交互决定、自己浏览器验收、自己修明显问题。**

不要每完成一个 section 都问“要不要继续”。

不要因为 prompt 详细就关闭设计判断力。

不要因为模型能力强就重新发明已冻结的产品。

最理想状态是：

```text
Frozen semantics / accepted product intent
        ↓
Astra strong design + implementation judgment
        ↓
beautiful / coherent / fast / trustworthy production UI
```

---

# 13｜每个 slice 的交付回执

完成后必须给出：

```text
scope / PR / final SHA
exact routes changed
frames / owners consumed
semantic invariants preserved
browser journeys PASS/FAIL
QA/build PASS/FAIL
screenshots / artifacts
visual improvements made under Creative Latitude
known real blockers only
next exact program cursor
```

不要把：

- build PASS；
- component exists；
- sample route looks okay；
- screenshot taken；

单独当成“subject closed”。

---

# 启动短指令

当 Kian 把这份 master prompt 交给你时：

```text
进入 kianwang022-hash/kianos。
读取 latest main、static-web/CURRENT.md、本文件、Issue #113 和 exact active PR。

目标是完整三科 KianOS production website，不是三个 demo。
产品/学习语义严格守 Ring A；视觉方向守 Ring B；在 Ring C 内主动用 Astra 的强 UI / product judgment 美化与优化。

不要重新设计已冻结学习逻辑，不要机械照抄 ASCII，也不要只做到“功能能跑”。
真实浏览器 → 截图 → 自我批评 → 2–3 轮有价值 polish 是施工的一部分。

如果 Politics PR #117 仍 active，先继续 #117 并读取 CODEX_POLITICS_BROWSER_EXECUTION.md；否则按 Current / #113 进入下一 bounded subject slice。

三科分别达到 SUBJECT_CLOSED_FOR_HOME 后，再做 shared shell / Global Home final convergence。

不自行 merge；不制造 learner U；不因 main 无关推进而机械重做 branch。
```
