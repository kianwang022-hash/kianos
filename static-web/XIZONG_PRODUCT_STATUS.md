# Xizong Product / UI Status

Status: **PRODUCT / INTERACTION ACCEPTED · ELIGIBLE PROJECTION V1 FROZEN · RENDERER / MAC ACCEPTANCE OPEN**  
Execution: `CODEX_ASTRA_THREE_SUBJECT_SITE_EXECUTION.md` **v3.0+ §3–4、§7–11**  
Domain router: `content/xizong/CURRENT.md`  
Safety: `XIZONG_UI_REVIEW_PROTOCOL.md`

## 当前范围与边界

此轮核对的 eligible Projection 是 A1/A2/A3：3 System +38 Block，805 KP identities/396 bindings；原 v1 receipt 记录86 mutation/control测试。它们是既有资产验证证据，**不等于这轮浏览器/视觉/U 验收**。当前范围持续由 local Current/Acceptance 与 manifest 决定，B–F 未获允许的不为站点对称提前加入。

已闭合的 Learning/Runtime 是 UI 优化 baseline。读取 `content/xizong/LEARNING_CONTRACT.md`、`knowledge/learner/study-policy.json` 和精确 owner，不能因“反仪式”取消真实正式接触/主动 Recall/completion 条件。

## 完整产品 family，不仅 Guide

System Guide → Block orientation → LG orientation → 原讲义整 LG 连续学习 → 一次真实返回 → KP Recall Front/Reveal → LG closure → Block Recall → Block Complete → selective After Learn；System 实际学完后还有 System Recall/题目sweep/修复/题后重建。

保留原文件：

- `XIZONG_PRODUCT_BRIEF.md`
- `XIZONG_HOME_DESIGN.md`
- `XIZONG_SYSTEM_GUIDE_DESIGN.md`
- `XIZONG_BLOCK_WORKSPACE_DESIGN.md`
- `XIZONG_SYSTEM_COMPLETION_DESIGN.md`

旧阶段标题不能把已接受设计重开；System sweep 的 phase-aware multi-pass Question Attempt 已在现有 Runtime 内落地。尚未实现的全卷 runtime，以及未来把同一 attempt 语义接入整卷场景，仍是真实待核对项，不能用文档冻结冒充完成。

## Canonical Current Runtime｜禁止并行第二套版本

西综只允许一条生产学习 Runtime。当前生产路由的唯一实现组合是：

```text
/xizong/
→ XizongHomeTools

/xizong/[system]/
→ XizongSystemV6
→ XizongSystemExitRuntime
→ XizongSystemRepairReturn
→ XizongSystemEvidenceGuard
→ XizongRuntimeStageGuard

/xizong/[system]/[block]/
→ XizongBlockV6
→ XizongMemoryReviewV6
→ Block Evidence / Stage / Repair / cue support
```

`V6` 是当前实现文件名留下的历史后缀，**不是第六套同时有效的学习模型**。不得在旁边新增 `V7`、`SecondPassV1/V2` 或另一套 Review/Attempt Runtime。等当前活动视觉/产品分支稳定后，如确有维护收益，可做一次无语义变化的中性命名迁移；迁移完成后旧名字必须退役，而不是长期双轨。

浏览器 localStorage key 中的 `v1/v2` 仅表示**存储 schema / migration identity**。它们不得被解释成多套 learner model；在没有显式迁移和旧数据处理方案前也不得因“去版本号”直接删除。

一轮、二轮、后期复习属于**同一学习模型和同一 Runtime 的 study phase / task condition**，不是三个产品。正式 Learning 语义仍由 `LEARNING_CONTRACT.md` + `study-policy.json` 一次拥有；页面只执行这些语义。

### Multi-pass Question Attempt｜Current 兼容状态

同一个稳定 `question_id` 可以在一轮、二轮、后期或未来整卷中产生多次独立尝试。当前 System sweep 的 Evidence 约束为：

```text
stable question identity
├─ results        = mutable current-round progress only
└─ attemptHistory = append-preserved Question Attempt evidence
     ├─ FIRST_PASS
     ├─ SECOND_PASS
     └─ LATE_REVIEW
```

首次尝试不得被后续答题、Repair 或状态更新覆盖；当前 session 的 `results` / progress 是可变工作态，不再充当历史 Evidence 的唯一真相。下一轮只重置当前 `results`，历史 `attemptHistory` 保持 append-preserved；legacy `results` 迁移使用显式 `BOOTSTRAP_EXISTING_RESULT` provenance，不冒充新的 learner attempt。同一 question 在同一 round 的重复写入 fail closed。

二轮复用继续由现有 `XizongSystemExitRuntime` / System Evidence 链承担，没有创建第二个二轮题目 Runtime。A2 浏览器验收已执行真实路径：一轮同题 Uncertain → W/U Repair → 完成当前轮 → 同一 Runtime 开启 SECOND_PASS → 同题重新作答 Stable；第一条 attempt 保持不变，第二条 attempt 独立追加。Repair 继续作为 `REPAIR_ONLY` 证据解释，不改写原始 Question Attempt，也不自动推断 mastery。

已有 System Recall 的 `PRE_QUESTION / MID_SWEEP / POST_QUESTION` 表示**一次题目流程内部的位置**；跨学习轮次使用正交的 `FIRST_PASS / SECOND_PASS / LATE_REVIEW` study-phase 语义，两种 phase 不共用一个字段。结果可见性、Mark、提示/援助、题目/内容版本等已知条件仍应随 attempt 保留；未来整卷接入继续沿用这一模型，而不是新建平行 authority。

## 展示与 Guide 最新明确要求

`content/xizong/projection/PROJECTION_CONTRACT.md` + manifest + `V1_FREEZE_RECONCILIATION_RECEIPT.md` 管资产。一个 Block 可有多个认知对象；KP Reveal 仍须完整 canonical Core。7 rich calibration Blocks 以外的 baseline 引用不是“所有内容已图形化”的证明。

改 reusable role/geometry/结构化正文 renderer，不按题名/疾病/KP 手工做页面。合法内容变化重验/编译，真正新类型只处理其影响；程序全量coverage，视觉按代表类型/状态/长内容抽验，不逐个805KP签字。

System Guide 是首次建立体系与后续重新定位的持久参考，稳定低摩擦入口/精确返回；非每次必经页、非 read-complete 证据。完整认知密度可滚动，不削成摘要。Block/LG/KP/Memory/Reserve 等逻辑内容也按合法状态承载，不只优化顶层 Guide。

## 保护与执行

neutral front 是整个 workspace 的权限，不仅主卡片；Core/标题/源图/Precision/dock 不得侧漏。A2 enrichment 时机与 source ownership 不因共用组件而丢失；没有的 sidecar 不造。

Fast 与 Hidden 独立；西综 Mark 可稍后回看，不等于 Politics Uncertain 必须停留。holdout 保留；precise repair 只用 reviewed relation。Guide/查阅不得覆盖 first evidence/Resume。

活动 UI PR 以 static-web Current/#113 为准；不修改独立 B Learning 或医学 Core。浏览器、独立审查、合法落库完成以后才可声明当前 eligible family `SUBJECT_CLOSED_FOR_HOME`；U 仍真实使用。旧状态原文在 `design-archive/2026-09-14/XIZONG_STATUS_BEFORE_V3.md`。
