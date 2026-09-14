# KianOS 三科 Productization｜Integrated Execution / Acceptance Protocol

Status: **ACTIVE PROGRAM PROTOCOL**  
Parent: #113  
Integrated execution owner: #148  
Execution master: `CODEX_ASTRA_THREE_SUBJECT_SITE_EXECUTION.md` v3.1+

## 1｜Stage 的新角色

#138–#143 仍保留，但现在是 **acceptance ledger / bookkeeping owner**，不是要求 Kian 每一段工程都手工放行的流水线。

它们继续帮助说明：

- 哪一类能力/科目最终要证明什么；
- 哪些旧证据已经成立，不能重做；
- 哪个 blocker 属于哪个 owner；
- 最终整站回执如何分科对账。

它们**不再要求**：完成一个内部 Stage → 停下来让 Kian 复制下一段 prompt → 再开始下一科。

当前执行以 #148 为准：

```text
faithful frame landing
→ integrated Astra polish
→ full-corpus / task-family QA
→ representative browser stress
→ one KIAN FULL-SITE HUMAN GATE
→ independent review + Kian merge decision
```

## 2｜Authority split

### Composition authority

`static-web/design-archive/2026-09-14/THREE_SUBJECT_TEXT_FRAMES_V2_1.md`

负责：空间职责、主次层级、同时可见关系、task geometry、Mac-wide density、navigation / Return relationships。

### Semantic/state authority

Latest Current / Learning / Question Truth / Evidence / Runtime owners。

负责：内容身份、答案、学习顺序/前置、first attempt、Evidence、Memory、source ownership、Repair/Return、learner state 与 fail-closed 边界。

因此 frame rollback 不得恢复旧 Xiao 原解析 learner display、OCR fallback、due、旧 mandatory ritual、stale ownership 或其他已被 Current 取代的行为。

## 3｜Astra autonomous execution

Astra 在 #148 内连续施工，必须：

- 从最新 `main`、`static-web/CURRENT.md`、master、#113/#148 和 actual active PR/diff 恢复完整 Program；
- 复用已经成立的 Runtime/loader/evidence/tests，不为“重新开始整站”而重做 PASS 工作；
- 先忠实落 archived composition，再做 typography/spacing/control/responsive/focus/subtle-motion 等 polish；
- 主动检查真实 browser、route、loader、state、long-content 与失败态；
- scope 内 bug 直接修；scope 外问题记录准确 identity/影响/是否阻断，不无边界扩张；
- 不逐疾病/NU/KP/题号手工装修，不运行时 LLM 猜语义；
- 不自行 merge，不制造 learner U。

## 4｜当前整站范围

### Politics

保留 #117 已完成的正式 Workbench Runtime/Current 证据，按 archived P10/P11 及 Politics frames 对齐 composition，再完成 Home、五科 cognition、NU、Chengfeng handoff、repair/source/exact Return。

### English

Home/Resume；Reading A；Cloze；Part B 四 form；Translation；Small/Big Writing；Objective/Translation/Writing Guide；Lexical read-only handoff/return。必须保持 task-native archived geometry。

### Xizong

只做 Current-eligible A1/A2/A3：Home/Continue、System Guide、Block/LG、Lecture handoff、KP Recall Front/Reveal、LG/Block closure、System Recall、question/repair/Return。A 是当前 production/calibration corpus，不 hard-code 永久范围；不读/猜/预设计 B–F。

### Shared / Global Home

三科当前 surfaces coherent 后完成 shared shell、meaningful Resume/Return 与 Global Home。不得发明跨科 scheduler/mastery/debt/dashboard。

## 5｜机器验收与独立 review

机器负责：

- supported corpus/schema/programmatic coverage；
- existing QA / production build；
- browser journeys by task family × state × long-content/failure stress；
- answer protection、storage failure、refresh/back-forward、exact Return、unknown/stale/unbound fail-closed；
- frame-to-view representative screenshot comparison；
- shared grammar regression。

旧证据可以复用，但只在相关实现/依赖没有变化时继续有效；相关 surface 改动后跑受影响回归，不为仪式重跑全世界，也不能用旧 PASS 掩盖新回归。

独立 review 必须区分：

- SELF evidence；
- independent technical/product review；
- Kian Human Gate；
- learner U。

它们不能互相冒充。

## 6｜Kian Human Product Gate

默认只在整站机器/浏览器闭合后给 **一次 FULL-SITE HUMAN GATE**。

Kian 检查的是机器难以判断的事情：

- 第一眼焦点是否正确；
- 信息密度、阅读节奏、点击负担是否适合日用；
- 完整内容有没有因为“美观”被拆薄；
- Politics / English / Xizong 是否共享产品语言但仍保持自己的认知几何；
- Guide / Recall / question / repair 是否像真实学习，不像工程 demo；
- Continue / Resume / exact Return 是否符合人的预期；
- 整站是否愿意每天打开。

Final Gate 用少量代表 journeys 覆盖 Politics、English、Current-eligible Xizong、Global Home，不做 exhaustive page checklist。

Kian 不需要核 hash、读 diff、跑 CI、判断 branch mechanics，除非 Kian主动要求。

## 7｜允许提前打断 Kian 的情况

只在以下情况中途停：

1. Latest Current 与 archived frame 出现无法自动裁决的真实语义冲突；
2. frame/Current 都没解决的结构性产品选择；
3. 必须由 Kian 在 materially different learner experiences 中二选一；
4. 真 blocker 若继续会要求猜内容、猜 ownership、伪造 Evidence/state。

普通 bug、CSS、responsive、CI ownership、branch reconciliation、known fail-closed subset、loader/test 问题都不是 Kian micro-stage。

## 8｜Merge / closure

完成 integrated receipt、独立 review 与 FULL-SITE HUMAN GATE 后，Kian 决定：`MERGE / HOLD / REPAIR`。

授权后才 merge → main readback → branch retirement。Stage ledger 在此时按真实最终证据更新/关闭。learner `U` 仍只来自真实学习使用，不由产品验收自动产生。

## 9｜全局回读格式

遇到局部 bug/CI/回执时，先恢复：

```text
Program: #113
Integrated execution: #148
Current main / active PR(s)
What is already proven and must not be redone
Current real blocker(s)
Independent parallel lanes: Lexical / Xizong B–F / ...
Does this issue actually require Kian now? yes/no + why
```

禁止看到一个局部错误就把整个三科任务缩成那个错误，也禁止把旧 Stage 文本重新变成 mandatory stop sequence。
