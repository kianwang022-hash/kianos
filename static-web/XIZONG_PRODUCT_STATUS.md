# Xizong Product / UI Status

Status: **PRODUCT / INTERACTION ACCEPTED · ELIGIBLE PROJECTION V1 FROZEN · RENDERER / MAC ACCEPTANCE OPEN**  
Current routing: `static-web/CURRENT.md` → `content/xizong/CURRENT.md` → exact System Current / Acceptance  
Historical integrated execution documents (including the old #148-era three-subject execution prompt) are provenance only, not Current execution authority.  
Domain router: `content/xizong/CURRENT.md`  
Safety: `XIZONG_UI_REVIEW_PROTOCOL.md`

## 当前范围与边界

此轮核对的 eligible Projection 是 A1/A2/A3：3 System +38 Block，805 KP identities/396 bindings；原 v1 receipt 记录86 mutation/control测试。它们是既有资产验证证据，**不等于这轮浏览器/视觉/U 验收**。当前范围持续由 local Current/Acceptance 与 manifest 决定，B–F 未获允许的不为站点对称提前加入。

已闭合的 Learning/Runtime 是 UI 优化 baseline。读取 `content/xizong/LEARNING_CONTRACT.md`、`knowledge/learner/study-policy.json` 和精确 owner，不能因“反仪式”取消真实正式接触/主动 Recall/completion 条件。

共享平台 baseline 已按一条生产 Runtime 收口；后续全科内容工程属于对稳定 capability slots 的持续填充，不得以“内容还会继续增长”为理由重开并行 Runtime、并行 Evidence 或并行 Visual authority。

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

### Reviewed Question ↔ Knowledge Crosswalk｜Current capability

题目到知识、知识到题目的接口已经进入同一生产 Runtime，但**关系内容本身仍允许增量增长**。

唯一允许进入 learner projection 的关系是 canonical owner 中显式 `REVIEWED` 的 Question→Knowledge relation；Runtime 不根据题干、疾病名或相邻 KP 自动猜 mapping。Question→Knowledge consumer 与 Block/KP→Questions reverse lookup 都从**同一份 canonical relation**现场解析/派生，reverse lookup 不持有第二份 mapping 状态。

缺 mapping 是合法状态：题目仍可完成正常 Question Attempt / Evidence 流程，只是不展示知识回链；relation 指向未通过当前 Projection gate 的对象时 fail closed，不为了“看起来完整”放宽安全边界。未来新增 reviewed relation 后，现有 System sweep / SECOND_PASS / Block reverse lookup 自动获得能力，不需要重做 Runtime 或页面骨架。

Crosswalk 只负责 reviewed relation 的消费与返回入口，不改变 Question Attempt、Repair、mastery、Block completion 或 Evidence authority。

### Visual / Precision capability｜Current 兼容状态

Visual / Precision 现在是同一生产 Runtime 的**可选 enrichment capability**，不是 A2 特例，也不是第二套内容权威。正式边界见 `XIZONG_VISUAL_PRECISION_CAPABILITY.md`。

稳定结构是：

```text
shared renderer / runtime capability
        ↑
stable cue / anchor / Source Object binding
        ↑
independently upgradable content packs
```

A2 已接受的 R3 source-visual slice 继续保留，但元数据由 Current content pack 提供；共享 bridge 按 `*-source-visuals.json` 泛化发现，不再为每个疾病 / Block / KP 手写 import。没有 content pack、只有部分 content pack、或以后补更多图片，都必须继续使用同一 renderer。

Visual 是稀疏高价值增强，不做“全讲义截图搬家”；Precision 是精确数字、阈值、分型边界、药物/时间配对等选择性 exactness 支撑。两者都不能进入 clean Recall front 造成答案泄漏。Source visual 仍只是在合适学习时机提供 micro-task / precise source support，不替代 iPad / MarginNote 原讲义连续学习。

A2 browser acceptance 已执行真实 R3 source-visual 路径与 KP Precision post-Reveal 路径；缺失 enrichment 合法，不造 placeholder，不构造假 completeness。

Source Visual content pack 另有独立 CI integrity guard：检查 manifest ↔ Current learning-cues identity、真实 reviewed Visual cue、唯一 cue ownership、安全 asset path、Source Object/page/accessibility metadata 与 derived asset SHA。该 validator 只保护 provenance / binding integrity，**不成为 renderer 的第二份 Visual authority，也不把内容覆盖率升级成 learner completion gate**。

### Progressive availability｜工程未完成不能伪装成 learner 未完成

内容/工程 availability 与 learner progress、Evidence、Repair、先修依赖正交。

当前共享规则：

```text
capability/content 不存在或尚未开放
≠ learner prerequisite 未完成
≠ learner failure
≠ learner debt
```

未来 System、Question、Crosswalk relation、Visual、Precision、Repair/Challenge 等能力可以逐步填充稳定 slot。已开放的 Learn / Recall / Question / Repair 路径不能因为旁支能力 `COMING` / partial 而被阻塞；completion denominator 只计算当前真实 admitted learner obligations。

产品层冻结的是 **learner journey + capability slots**，不是未来所有内容。后续全科内容工程可以持续把新 System、题目、reviewed relation、Visual / Precision 接进现有接口，而不重建 Runtime 或重新设计页面骨架。

## 展示与 Guide 最新明确要求

`content/xizong/projection/PROJECTION_CONTRACT.md` + manifest + `V1_FREEZE_RECONCILIATION_RECEIPT.md` 管资产。一个 Block 可有多个认知对象；KP Reveal 仍须完整 canonical Core。7 rich calibration Blocks 以外的 baseline 引用不是“所有内容已图形化”的证明。

改 reusable role/geometry/结构化正文 renderer，不按题名/疾病/KP 手工做页面。合法内容变化重验/编译，真正新类型只处理其影响；程序全量coverage，视觉按代表类型/状态/长内容抽验，不逐个805KP签字。

System Guide 是首次建立体系与后续重新定位的持久参考，稳定低摩擦入口/精确返回；非每次必经页、非 read-complete 证据。完整认知密度可滚动，不削成摘要。Block/LG/KP/Memory/Reserve 等逻辑内容也按合法状态承载，不只优化顶层 Guide。

## 保护与执行

neutral front 是整个 workspace 的权限，不仅主卡片；Core/标题/源图/Precision/dock 不得侧漏。A2 enrichment 时机与 source ownership 不因共用组件而丢失；没有的 sidecar 不造。

Fast 与 Hidden 独立；西综 Mark 可稍后回看，不等于 Politics Uncertain 必须停留。holdout 保留；precise repair 只用 reviewed relation。Guide/查阅不得覆盖 first evidence/Resume。

活动 UI PR 以 static-web Current/#113 为准；不修改独立 B Learning 或医学 Core。浏览器、独立审查、合法落库完成以后才可声明当前 eligible family `SUBJECT_CLOSED_FOR_HOME`；U 仍真实使用。旧状态原文在 `design-archive/2026-09-14/XIZONG_STATUS_BEFORE_V3.md`。
