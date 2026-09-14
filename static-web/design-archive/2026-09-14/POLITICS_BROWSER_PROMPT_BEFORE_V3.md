# Codex 执行提示词｜Politics 肖1000 Workbench 浏览器落地

Status: **ACTIVE PR-SCOPED EXECUTION HANDOFF**  
Scope: **PR #117 / Issue #116 only**  
Branch: `politics-legacy-parity-migration`  
Task type: **post-closure learner-facing product parity + real browser acceptance**  
Do not self-merge.

这是一份给 Codex 的窄执行提示词。目标不是重新讨论 Politics 学习架构，也不是重做 Content / Projection，而是在当前 PR #117 上把肖1000刷题工作台真正落成可日用的浏览器界面，并用真实 Mac-wide 浏览器旅程验收。

---

## 0｜先固定当前事实，禁止继续旧叙事

Politics 五科 Learning / Projection 已经收口：

```text
S / K / L / P / R / E = PASS
U = UNTESTED
```

PR #117 是 **post-closure functional parity / productization**，不是“Politics 学习系统还没做完”。不要重开 Learning / Projection，不制造 learner `U`，也不要把历史 blocker 重新拉回来。

当前 learner-explanation 依赖已经由 PR #124 promotion 完成：

`content/politics/derived/xiao1000-learner-explanations/`

共有 1148 条 authenticated Current-derived learner-facing records，按稳定 `question_id` 精确绑定。

### 最新明确产品决定，优先级最高

Kian 已经最终明确：

> **刷题界面按照 Legacy Workbench 来；肖1000原解析不展示，质量太低。**

因此，任何旧文件 / 旧 Issue 段落 / 旧 v2.1 提示词里仍写着“learner-facing `xiao_reference` / 肖1000原解析必须展示”的内容，**在这个具体产品选择上已经被 supersede**。

实施公式：

```text
Legacy Workbench interaction + information architecture
+ Current Question Truth / ownership / evidence / repair / return
+ promoted takeaway + chat_explanation
- learner-facing Xiao original explanation
- OCR/original-explanation fallback
- due / D1-D3-D7 scheduler resurrection
- new mandatory structure / 易混 / diagnosis ritual
- new question-map / navigation invention
```

`xiao_reference` 可以继续作为 derived asset 内部 provenance 存在，但 Workbench **不得 serialize / render / reveal** 它作为 learner-facing explanation surface。

---

## 1｜进入与 authority 顺序

不要开新的重叠 Politics UI PR。继续 **PR #117**。

开始前：

1. checkout `politics-legacy-parity-migration`；
2. 读取最新 `main@HEAD` 与当前 branch HEAD 的差异；
3. 只有在 shared authority / overlap 真发生变化时才按 `BRANCH_LIFECYCLE.md` 做最小 reconciliation；不要因为 main 有无关提交就机械重做 branch；
4. 保留当前 PR 的独立未合并工作。

最小必读：

```text
AGENTS.md
BRANCH_LIFECYCLE.md
static-web/CURRENT.md
本文件
Issue #116 latest body / decision trail
PR #117 latest body + current diff
static-web/POLITICS_LEGACY_FUNCTION_PARITY.md
static-web/POLITICS_PRODUCT_BRIEF.md
static-web/KIAN_UI_PREFERENCES.md
static-web/UI_STYLE_BRIEF.md
static-web/PRESENTATION_CONTRACT.md
content/politics/LEARNING_CONTRACT.md
content/politics/INTERACTION_CONTRACT.md
```

然后只读本任务实际需要的 implementation owners：

```text
static-web/src/components/PoliticsPracticeWorkbench.astro
static-web/src/pages/politics/practice.astro
static-web/src/lib/politicsPractice.mjs
相关 Politics evidence / first-attempt / return code
相关 QA scripts
```

### Legacy 的使用边界

这是明确授权的 bounded historical presentation recovery。只把以下 Legacy Workbench 当作**交互 / 信息架构 / 几何参考**：

```text
kianos-legacy/runtime/frontend/src/learning/PoliticsWorkbench.jsx
kianos-legacy/runtime/frontend/src/learning/PoliticsWorkbench.css
```

Legacy 不拥有 Current 的 Content、Question Truth、Evidence、learner state、scheduler 或学习逻辑。

如果 Legacy 行为与后来 Kian 的明确决定冲突：**后来明确决定赢。**

---

## 2｜这次 Codex 的唯一产品目标

不是“做一个现代化政治刷题页”。

而是：

> **把 Legacy Workbench 的成熟刷题手感和题后信息架构，接到 Current 架构上，再用当前共享视觉系统做克制的视觉 polish。**

验收公式：

```text
historical Workbench capability preserved
+ Current-native truth / evidence / exact return
+ Dense Calm visual polish
+ real browser proof
+ zero new learner process burden
```

不要为了显得“新”而重新设计。

---

## 3｜Practice entry / setup：保留能力，但不要做成首页 Hero

必须保留：

- Continue / Resume；
- subject filter；
- chapter filter；
- Natural Unit filter；
- question type filter；
- session length 5 / 10 / 20 / 40 或等价能力；
- normal scoped practice；
- random；
- wrong；
- favorite。

明确禁止：

- `due`；
- D1 / D3 / D7 / D14；
- fake mastery/progress；
- engineering counts 占据主要视线；
- 大块课程介绍 / 方法介绍；
- 一个营销页式的大 Hero 抢走题目工作区。

### Mac-wide 视觉职责

setup 应该是 **quiet + compact + quickly dismissible / collapsible when session starts**。

进入题组以后，题目本身必须成为第一视觉对象。不要让：

- “肖1000训练”大标题；
- 大面积统计卡；
- 大量说明文字；
- setup panel

长期压缩真正的作答面积。

如果当前 branch 的 Hero / stats / details 结构和真实 Legacy Workbench 的工作感冲突，允许在不丢功能的前提下收紧或重组。

---

## 4｜Clean attempt：按 Legacy 作答工作台来，不新造流程

Clean attempt 不做新的左右分栏 review layout。

Mac-wide 主形态：

```text
session / scope context  — quiet, compact

full-width question stem

A / B
C / D
(当选项长度允许时采用 2×2；长选项可安全降级)

Favorite · Uncertain · Mark for discussion · timer
Normal / Fast
Submit / progression
```

必须保留：

- verified structured question text 为正常题面；
- optional original **question image/source-face check** 在真实 asset 存在时可用；
- single / multiple 行为正确；
- Favorite；
- Uncertain；
- mark-for-discussion；
- elapsed question time；
- answer-change trajectory；
- keyboard 与 pointer 同语义；
- 输入 note 等 typed field 时全局快捷键暂停；
- submit 前绝不泄漏正确答案、正确/错误样式、takeaway、chat explanation。

### Normal / Fast

必须以 Legacy 的低摩擦意图为准：

- **single + Fast**：选择后允许快速提交 / 自动推进，但必须先满足 Current first-attempt / persistence 保护；
- stable correct 才允许无额外仪式地快速推进；
- **multiple**：始终 toggle selections + explicit submit，Fast 不得猜“选完了”；
- Wrong / meaningful Uncertain 不得被自动跳过需要的题后信息。

不要凭印象重新设计快捷键。先核对 Legacy Workbench 实际 keyboard semantics，再迁移到 Current；不安全或与 Current Evidence 冲突的旧快捷行为要按 Current 约束修正。

---

## 5｜Submitted result：最终 learner-facing 结构

题后必须保留 Legacy 的 bounded Mac-wide result workspace。

历史约 32 / 68 只是参考职责，不是死 CSS 数字。真实内容决定最终宽度，但不能造一个空左栏或让右栏挤成窄文章。

### Left — result / learner evidence

```text
Correct / Wrong
→ 一句话带走 (takeaway)
→ 我的答案 vs 正确答案
→ missing / extra options（仅需要时）
→ optional error cause
→ personal note + visible save state
```

要求：

- `takeaway` 必须来自 promoted learner-explanation exact-ID binding；
- optional cause 是可选，不是强制复盘门槛；
- note 必须稳定持久化，不能静默丢失；
- 正确题不因为系统富信息而增加 mandatory ritual。

### Right — understanding / source / return

```text
AI 精炼解析 / 理解这道题 (chat_explanation)
→ Current / Chengfeng source review
→ Next
→ exact Return to owning Natural Unit / originating entry
```

明确没有：

```text
肖1000原解析 panel
xiao_reference expansion
OCR explanation fallback
“结构” panel
“易混” panel
mandatory diagnosis step
generic cognitive diagram on every question
```

删除原解析以后不要故意留下“缺了一块”的洞。让 AI 精炼解析 + Current/Chengfeng source 自然占据知识复盘区域。

---

## 6｜Current-native invariants：视觉施工不能破

### Question Truth

题干 / 选项 / 正式答案只能来自 Current Xiao1000 Question Truth。

### Learner explanation

1148 / 1148 精确 stable `question_id` binding：

```text
takeaway
chat_explanation
```

缺失 / stale / unbound 必须 fail closed。

不得：

- OCR 补位；
- original explanation 补位；
- 临时重新生成 1148 条再冒充 Current asset；
- fuzzy match question text。

### First attempt / persistence

必须继续使用 Current 的 first-attempt 语义，例如 `recordPoliticsFirstAttempt` 所拥有的不可变 first attempt。

在 Evidence / storage 应持久化而失败时：

> **fail closed，当前题不推进。**

不要为了 Fast 手感让写入失败被吞掉。

### Distinct learner-owned signals

这些不能互相折叠：

```text
Favorite
Uncertain
Mark for discussion
Wrong
Optional error cause
Personal note
```

它们不是 mastery labels。

### Exact Return

保留：

- exact owning Natural Unit；
- exact originating practice entry；
- repair / source handoff 后能回当前题 / Unit；
- stale / unknown target fail closed，不偷换成别的题。

---

## 7｜视觉系统：Mac-wide Dense Calm，不是“Legacy 像素复刻”

Legacy 拥有 Workbench 的交互 / 信息架构参考，不要求复刻旧色值和旧组件皮肤。

遵守 Kian 的当前 UI preference：

- Mac wide landscape 为设计原点；
- comfortable readable type；
- stronger contrast；
- medium / high useful density；
- low disorder；
- restrained / mature / desktop-product feel；
- Apple-like predictability / Raycast-level restraint可以作为质量感参照，但不要 clone；
- task 比 software chrome 更显眼。

避免：

- tiny text；
- giant whitespace；
- card/panel pile；
- flashy saturation；
- engineering/debug metadata；
- mobile app 拉宽；
- 为了“干净”把真正有用的信息藏成反复展开。

### 题目页的重点

Clean attempt：题干 / 选项 / 当前选择是主角。

Submitted result：左边快速判断与自我证据，右边理解与来源同时可见；不是两个互相隔离的页面。

---

## 8｜真实浏览器旅程是本任务的一部分，不是最后可选项

不要停在 `npm run build`。

至少完成这些真实浏览器 journey：

### J1 — clean single / Normal

- 进入 Politics practice；
- 选一个真实 scope；
- start；
- 确认 submit 前无任何答案 / takeaway / explanation leak；
- 用 pointer 作答并 submit；
- 进入 submitted result。

### J2 — clean multiple

- multiple question；
- toggle 多项；
- 未 submit 前不判定；
- submit 后 learner/formal answer delta 正确。

### J3 — submitted correct

确认：

```text
result
+ takeaway
+ my/formal answer
+ optional cause/note
+ chat_explanation
+ source
+ Next / Return
```

且 **没有肖1000原解析**。

### J4 — submitted wrong

确认：

- missing / extra delta；
- Wrong evidence；
- note / cause；
- Current source；
- exact return。

### J5 — Fast single

- single + Fast；
- persistence 成功后 low-friction progression；
- Wrong / Uncertain 不被错误跳过；
- multiple 不自动猜提交。

### J6 — learner signals

至少验证：

- Favorite；
- Uncertain；
- mark-for-discussion；
- Wrong / Favorite mode 能基于真实 retained state 取回题目。

### J7 — Resume / refresh

- active session refresh；
- resume exact position；
- 不重复制造 first attempt；
- note / signals 不静默消失。

### J8 — exact Return

从一题进入对应 Current / Chengfeng review 或 owning Unit，然后返回，确认 exact identity 保留。

---

## 9｜截图验收

必须有真实 Mac-wide 浏览器截图，至少：

1. **clean attempt**；
2. **submitted correct**；
3. **submitted wrong**。

建议以真实 Mac-wide viewport（例如 1440×900、1512×982 或当前 Codex Mac viewport）为主，不要用窄 viewport 截图冒充主验收。

截图检查：

- 首屏是不是题目而不是 Hero；
- 字号是否舒服；
- 题干与选项是否有效利用横向空间；
- setup/session chrome 是否压住题目；
- result 两区是否有自然信息密度；
- 删除 Xiao 原解析后是否没有空洞；
- source / Next / Return 是否找得到但不喧宾夺主；
- 整体是否像日用 desktop workbench，而不是 component demo。

不要因为 CI 绿就宣布视觉完成。发现明显问题，直接在同一 PR 内修一轮再重新截图。

---

## 10｜QA / implementation checks

在 `static-web/` 至少运行：

```bash
npm run qa:politics
```

它必须继续覆盖：

- 1148 questions / unique IDs；
- 1148 refined explanation bindings；
- no learner-facing `xiaoReference` / original explanation leak；
- no due scheduler；
- route wiring；
- Normal / Fast；
- single / multiple；
- first attempt；
- persistence failure guard；
- exact return 所需 identity。

如果实际实现改变了受保护行为，补**行为测试**，不要只补 token/string assertion 来骗绿。

Build PASS 是必要条件，不是产品验收。

---

## 11｜允许修改 / 不允许顺手修改

本 PR 的正常 write-set：

```text
static-web Politics practice implementation
必要的 Politics practice loader / exact-ID consumer
必要的 Current-native evidence / return integration glue
relevant QA / browser journey tests
本 prompt / PR execution notes
```

不要顺手：

- 重写 Politics Content；
- 改五科 Projection grammar；
- 重开 Learning Contract；
- 改 Question Truth 来迁就 UI；
- 创建第二 scheduler；
- 改 Global Home / English / Xizong；
- 新开重叠 shared-static-web PR。

如果发现真正上游语义 defect，明确报告最小 owner，不要把它伪装成 CSS/Runtime 修复。

---

## 12｜Codex 完成时必须回报

最终不要只说“implemented”。给出：

```text
1. branch / final commit SHA
2. 具体改了哪些 learner-visible behaviors
3. clean-attempt 视觉变化
4. submitted-result 视觉变化
5. Legacy capability ledger 中本轮实际闭合的项
6. Current invariants 如何保持
7. npm run qa:politics 结果
8. real browser journey J1–J8 结果
9. clean / submitted-correct / submitted-wrong 截图或可访问 artifact
10. 仍然真实未闭合的 blocker（如果有）
```

然后保持 PR #117 **Draft**，等待 independent product/parity review 和 Kian 的真实视觉接受。

### 不允许 Codex 自己做

- 不 self-merge；
- 不把 branch 当 Current owner；
- 不制造 learner `U=PASS`；
- 不因为 1148 binding / build 绿就宣称整个 Politics learner product 已接受；
- 不把任何新的“看起来更专业”的流程强加给 learner。

---

## 一句启动指令

> 继续 PR #117，在 `politics-legacy-parity-migration` 上按本文件完成 Politics 肖1000 Workbench 的 Current-native Legacy parity 浏览器落地。优先恢复 Legacy 刷题手感与题后 IA，严格保留 Current Question Truth / first-attempt / persistence / exact return；只展示 `takeaway + chat_explanation + Current/Chengfeng source`，禁止 learner-facing 肖1000原解析与 OCR fallback。以 Mac-wide Dense Calm 做视觉 polish，完成真实 browser journeys、截图与 `npm run qa:politics`，同一 PR 内修正明显视觉/行为问题，保持 Draft，不自行 merge。