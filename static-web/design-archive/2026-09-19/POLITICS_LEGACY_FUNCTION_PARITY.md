# Archived historical evidence

> **RETIRED / NON-CURRENT.** Preserved only for bounded historical evidence. Current work must route through `AGENTS.md → CURRENT.md → exact owner`. Do not use this file as a progress/status/execution authority.

---

# Politics Legacy Useful-function Parity｜Current-facing capability contract

Status: **CURRENT CONTRACT · XIAO1000 WORKBENCH + EXPLICIT SURFACE MAPPING ON MAIN · REMAINING PRODUCT PARITY OPEN**  
Scope: **#116**；Workbench Current landing: **#183 / `890415ee273ec7baa1f010fbfc180fc18b7005d2`**；representation closure: **#352**  
Program router: `static-web/CURRENT.md` / #113  
Semantic authority: Politics Learning / Interaction / Content / Question Truth / Evidence owners  
Representation authority: `content/politics/SURFACE_MAPPING_CONTRACT.md`

## 0｜已经完成的边界裁决

Kian 要求：保留 Legacy 刷题体验；**原肖1000解析不展示**。后者取代旧文件中的 original-reference required row，不改变 Current 题干/选项/正式答案，也不删除资产 provenance。

#124 已完成 #115 learner-explanation promotion；只消费 `content/politics/derived/xiao1000-learner-explanations/` 的 Current stable question_id 绑定。缺失/stale不 OCR fallback、不模糊匹配、不重生成。

Historical PR #117 的 still-unique Workbench 功能已 fresh-reconcile 到最新 Current，并由 #183 落 main。#117 现在只保留旧实现/截图/浏览器证据，不再是 Runtime 或产品 owner。

PR #352 已关闭 learner-facing representation ownership：151/151 PASS owners 有 explicit Surface Mapping，9/9 REFERENCE_ONLY 保持 non-teaching。Historical downstream PR #336 已因这次上游收口而关闭为 superseded；它的旧 `projection_shape / representation.kind → learner geometry` 路径不得恢复。

对于本账本中的 N1 / N4 / cognition 相关“恢复”语义，当前唯一合法解释是：

```text
exact Projection owner / Current refs
→ explicit surface_mapping
→ resolved surfacePlan.states[state]
→ faithful learner surface
```

不是：

```text
projection_shape / field name / old Map-Chain-topology metadata
→ renderer guesses relation / geometry
```

Mapped PASS state payload、relation type、learner-visible relation text、grouping、Repair payload 都由 Surface Mapping 在 UI 之前决定。Runtime / UI 只负责 state trigger、interaction shell 与视觉实现。

Legacy 下列路径是此前行为提取的证据，不是后续待重新考古的任务清单：`runtime/frontend/src/learning/PoliticsWorkbench.jsx`、`.css`、`PoliticsCurrentRules.js`、`runtime/backend/app/learning_politics/service.py`（kianos-legacy）。实际实现输入为本 Current contract + Current data/runtime；发现未解决历史细节交给 Chat/owner 有界处理，不把旧代码/localhost接进新站。

## 1｜Disposition 规则

每个能力归为 `REQUIRED_CURRENT / CURRENT_EQUIVALENT / PHASE_OWNED / CONDITIONAL_ASSET / SUPERSEDED / BLOCKED`。这些是工程账本，不是 learner 可见标签。

下表合并重复条目，但不删 capability。每行记录 Current 必须保留的能力或明确淘汰边界；共用测试可支持多行，不为每个题目逐项写收据。

| ID | 能力 | Current disposition / 不可丢边界 |
| --- | --- | --- |
| H1 | Home有意义Continue/last location，五科自由入口 | REQUIRED_CURRENT；真实状态，不是最近随便打开的页面 |
| H2 | 有价值的今日Wrong/Uncertain、未完repair与精简Chat包 | CURRENT_EQUIVALENT；有内容才显示，不造due debt |
| H3 | subject/chapter/NU浏览与快速跳转 | REQUIRED_CURRENT；不限制成wizard |
| N1 | current NU问题/下一步、Chengfeng locator/look-for、外部连续学习与返回 | REQUIRED_CURRENT；learner payload消费 resolved Surface Mapping；Source ownership不等于surface ownership，不复制讲义 |
| N2 | first-ready题目、cross-Unit deferral、明确owner边界 | REQUIRED_CURRENT；optional close不允许题目提前释放 |
| N3 | 旧 mandatory Lecture→短Recall→Xiao gate | SUPERSEDED；Current optional轻闭合，仍保留真实学习前置 |
| N4 | NU Recall/precision/后续compression资产 | PHASE_OWNED；mapped first-round/close payload 只能来自 Surface Mapping；不因取消旧gate一起删除，也不自动变第一轮常驻流程 |
| W1 | Continue active session / Resume / exact deep link | REQUIRED_CURRENT；恢复准确题组/当前题，不偷换未解析目标 |
| W2 | 科目、章节、NU、题型、session长度（5/10/20/40或等价能力） | REQUIRED_CURRENT；安静setup，开刷后不占主舞台 |
| W3 | 可选知识点过滤 | CONDITIONAL_ASSET；只有reviewed Current mapping时精确启用，不能猜 |
| W4 | 普通范围、random、wrong、favorite；有用mixed/free practice | REQUIRED_CURRENT；free mode不绕开fresh/phase保护 |
| W5 | due/D1/D3/D7/D14/D0 | SUPERSEDED；无第二scheduler，无时间到即自动债务 |
| W6 | verified structured题面、完整题干/选项 | REQUIRED_CURRENT；正式内容只来自Current Question Truth |
| W7 | optional原始题面/图片核对 | CONDITIONAL_ASSET；真实可得且answer-safe时提供；素材缺失明确记录，不与已完成解析promotion混淆 |
| W8 | single/multiple、Normal/Fast、键盘/鼠标 | REQUIRED_CURRENT；Fast单选可即时submit、保存后稳定正确继续；多选显式submit；Wrong/meaningfulUncertain不被跳过；输入时快捷键让位 |
| W9 | Favorite / Uncertain / mark-for-discussion | REQUIRED_CURRENT；彼此不同，不合成generic Marked，不推导mastery |
| W10 | 单题/题组时间与answer-change轨迹 | REQUIRED_CURRENT；保存真实操作，不制造证据 |
| W11 | clean answer gating | REQUIRED_CURRENT；未submit不得从正文/tooltip/侧栏/样式/统计漏答案与解析 |
| R1 | 题后结果、learner/formal答案与必要missing/extra delta | REQUIRED_CURRENT；保留成熟左右职责，不新增复盘步骤 |
| R2 | takeaway一句话带走 + chat_explanation AI精炼解析 | REQUIRED_CURRENT；Current-derived exact-ID消费，完整内容，禁止OCR冒充 |
| R3 | 肖1000原解析/xiao_reference learner展示 | SUPERSEDED by Kian 2026-09-14；不得序列化/render/reveal/fallback；源资产provenance可留 |
| R4 | Current/Chengfeng source review、source-gap标识 | CONDITIONAL_ASSET / REQUIRED_CURRENT where admitted；保留scope与真实locator，不伪造来源 |
| R5 | optional error cause（记忆/理解/选项/粗心等已支持分类）、personal note | REQUIRED_CURRENT；可选不做mandatory gate |
| R6 | autosave/可见保存状态/退出与导航不静默丢失 | REQUIRED_CURRENT；storage失败不能伪装成功推进 |
| R7 | Next / Return到owning NU或原始practice入口 | REQUIRED_CURRENT；repair后能回这一题；未知或stale target fail closed |
| E1 | first-attempt不可变、question/session/NU identity、revision/repair另存 | REQUIRED_CURRENT；修对不覆盖首答，不产生假mastery |
| E2 | Current event-local repair provenance、reviewed Question→Unit/node、inbox/return bridge | CURRENT_EQUIVALENT；复用成熟Current组件/semantics，不回植Legacy state code；mapped Repair learner payload 只有一个 Surface Mapping writer |
| E3 | start、progress、refresh/back/Resume、complete→origin | REQUIRED_CURRENT；不重复首答，不丢note/signals，不把完成题组当学会 |
| A1 | session result：数量、准确率、耗时/错因 | REQUIRED_CURRENT as secondary practice result；不能成为学习掌握率 |
| A2 | unique answered、first/total accuracy、chapter/subject coverage、active wrong | CURRENT_EQUIVALENT / secondary capability；真实attempt来源，非Home dashboard，不静默失去已有可用能力 |
| A3 | weak-area/recommendation | CONDITIONAL_ASSET/EVIDENCE；充分真实证据 + reviewed关系才出现，单错不贴永久弱项 |
| V1 | QUESTION_RETRY / meaningful W-U回访 | CURRENT_EQUIVALENT；保留有用回访，不复活due |
| V2 | FRESH_VALIDATION / MIXED_SESSION | PHASE_OWNED / optional合法自由练习；reusable claim有价值才验证，不自动召唤任务 |
| V3 | KP/Precision/NU Recall复习 | PHASE_OWNED；Current允许才呈现，不把有资产等同今天必做 |
| V4 | daily study pack / imported Chat repair plan与精确返回 | CURRENT_EQUIVALENT；只保留实际有价值的Current state；无仅为展示而强制JSON来回 |
| X1 | 旧target-score/stage/engineering dashboard主导Home | SUPERSEDED；真实可用practice信息可次级，不冒充掌握/进度 |
| X2 | 原backend/private API/旧source路径、旧mastery意义、连续Chengfeng网页reader | SUPERSEDED；不是需要恢复的learner capability |

## 2｜Workbench Current 状态

#183 已把以下能力落到 main，并在 fresh Current 上重新执行 parity / synthetic / formal browser acceptance：

- W1/W2/W4/W6/W8/W9/W10/W11；
- R1/R2/R5/R6/R7；
- E1/E3；
- first-attempt、save-failure、stale-return、protected-unowned 等负控制。

Current 数据口径仍为：1148 exact learner-explanation bindings；1127 当前可练；21 canonical-NU-unowned fail closed。两种覆盖口径不得混成“1148全可练”。

Clean：全宽题干，合适时2×2选项，compact scope/Normal-Fast/signals/timer；不加新的题目地图或固定知识复盘分栏。

Submitted：左结果/一句话/答案delta/可选cause-note，右AI解析/Current来源/Next-Return。移除原解析后自然重新分配空间，不保留空洞。原32/68是参考比例，不是死CSS。

不新增 mandatory 结构/易混/diagnosis，也不把五科认知图放到每道题。完整能力不意味着所有控件常驻。

## 3｜#116 剩余产品 closure

Workbench 不再是迁移 blocker。#116 继续收口：

- H1/H2/H3：Politics Home / meaningful Continue / useful attention；
- N1/N2/N4：五科 cognition、NU、Chengfeng source handoff、phase-owned recall/precision；
- E2 / V1–V4 等跨 surface repair/return consistency；
- conditional assets 在真实 owner / 权限存在时才显示；
- Mac-wide visual convergence 与真实截图验收。

五科 cognition 的“subject-native”含义已经更新：差异必须来自 exact Surface Mapping primitive / grouping / relation text / state payload，不得从 subject 名称、`projection_shape`、`representation.kind` 或 raw field 名称重新推导。

完整 #116 closure 要求所有适用能力有明确 disposition，required/current-equivalent 有 Current 实现/等价证据，conditional/phase-owned 边界诚实，superseded 不回归。未关闭关键 blocker 不报 full parity。

Relevant QA/build + representative Mac journeys/screenshots + independent review + Kian 必要视觉接受 → 才关闭 #116。工程测试不制造 learner U。

原完整历史 contract 保留在 `design-archive/2026-09-14/POLITICS_PARITY_BEFORE_V3.md`。正常执行只读本 Current contract，不再走旧 M0 考古 / #115 / #117 / #336 迁移流程。
