# Lexical Current

Role: **Lexical current-task cursor + scope router**

Learner-facing Vocabulary / Lexical belongs under **English**. This file owns only current Lexical task routing. It does not own semantic truth, learner progress, Acceptance Truth, pronunciation truth, runtime truth, or historical evidence.

## Current / Next / Blocker

**Current：** 西综主线并行词汇，词汇语义审核由总控本人完成。第一遍已到 **o3850 / 7946**，成果仍存于 [PR #1245](https://github.com/kianwang022-hash/kianos/pull/1245) 的 `f835f90b0e7313c67fd30b62d237f4ef20f3da09`；对应 CURRENT blob `b49c5f03d6bc09f3666781c8bf55dd00be209b12` 已回读。前1000词已交付。**1001–3850不得作为第一遍未做而重启。** 旧第二千词部分P2/P3未发布文件不可用，不代表第一遍GitHub成果丢失。本轮1001–1050已完成50词及8个Relation的补充复审，保存41词、6个Relation修正候选；P2已完成，P3整词全文已读并纠正一处本轮新增的过度绝对措辞；全部增量已保存至Library checkpoint `libfile_42e6e79c3738819189a2dce184aca294` version10。原稿与第一遍候选的逐文件对应正在核对，未完成前不计该50词最终交付。

**Next：** 先保存1001–1050复审增量，并核对本轮原稿与PR #1245第一遍候选的对应关系，避免丢掉此前修正；后续1001–3850从既有第一遍候选进入第二、三遍。每50词持久备份，每200词三遍齐全后在本聊天交付文件。第一遍的3850进度与第二、三遍交付进度分别记录，不能混算或清零。

**Blocker：** 第一遍成果可回读，无第一遍丢失阻塞。旧P2/P3仅对缺少可靠文件的具体范围不计完成；本轮已保存的补充修正继续保留。

**范围与验收：** 仅做词汇内容审核，由总控本人实读与判断，不交给Work代做语义审核。沿用[Learning §0](LEARNING_CONTRACT.md#0purpose)及[Content §0A / §4A / §14](CONTENT_ASSET_CONTRACT.md)的最高目的：快速、正确、可迁移的词汇提取，Exam-first且保留有用Depth。保留有效Word / Relation / Form身份、内容及历史，不改真实学习记录，不接管其他Chat成果。三遍完成、未决项准确披露、文件已保存可读且200词包已在聊天交付，才计该包交付。无网站、Runtime、构建/部署或自动发布任务；不新增规则、审计架构或全局清理。

**历史边界：** [#1166](https://github.com/kianwang022-hash/kianos/issues/1166)已退休；[PR #1244](https://github.com/kianwang022-hash/kianos/pull/1244)的有限purpose trial已闭合。冻结样本、精确SHA、CI及交付明细保留于[原版本](https://github.com/kianwang022-hash/kianos/blob/3a8a1aa55e67430aa0c3a2206723200ab262537c/content/lexical/CURRENT.md#bounded-purpose-trial-20261007)和原证据owner，不在Current重抄。它们不提供当前Next，不证明全部7946词通过，也不自动恢复B061或授权后续发布。

## Route by need

| Need | Read next |
| --- | --- |
| Ordinary Vocabulary study / where Kian actually stopped | English learner path + native private learner/runtime evidence; bypass this engineering cursor |
| Retired batched-review evidence / unresolved findings | #1166 as history only; no automatic continuation |
| One concrete Word/Form/Relation defect | exact Natural Owner under current Learning / Content rules; check actual concurrent write-set |
| Content rules / learning semantics | `CONTENT_ASSET_CONTRACT.md` / `LEARNING_CONTRACT.md` |
| Materialization / derived Final mechanics | `CONTENT_EXECUTION.md` → exact active tool |
| Derived learner object | `learner/final/` + `FINAL_LEARNER_OBJECT_CONTRACT.md` |
| Product / runtime defect | exact `static-web/` consumer owner; do not absorb it into #1166 merely because the surface is Vocabulary |
| Visual/product design | `static-web/LEXICAL_PRODUCT_BRIEF.md` |
| Acceptance/readiness claim | `ACCEPTANCE.md` |

## Owner map

| Responsibility | Current owner |
| --- | --- |
| Learning Rule / Model | `content/lexical/LEARNING_CONTRACT.md` |
| Content-quality rules | `content/lexical/CONTENT_ASSET_CONTRACT.md` |
| Word semantic truth | `content/lexical/words/` |
| Cross-word confusable / contrast truth | `content/lexical/relations/` |
| Form / spelling / pronunciation / inflection identity | exact Word Form/Identity owner |
| Derived final learner objects | `content/lexical/learner/final/` |
| Independent semantic audit method | `content/lexical/INDEPENDENT_SEMANTIC_AUDIT_CONTRACT.md` |
| Materialization mechanics | `content/lexical/CONTENT_EXECUTION.md` + exact active tool |
| Visual/product design | `static-web/LEXICAL_PRODUCT_BRIEF.md` |
| Final acceptance | `content/lexical/ACCEPTANCE.md` |

## Stable boundaries

- one Main Word remains the learning container;
- cross-word confusion belongs to Relation, not a fake Sense;
- spelling/capitalization/pronunciation/inflection belongs to Form/Identity, not a fake Relation;
- worth knowing does not automatically mean Core or Repair;
- valid low-value truth may remain Reference without default Study/Repair debt;
- lookup alone creates no Repair/mastery state;
- learner evidence may expose a defect but does not become semantic authority;
- content maintenance does not reopen accepted UI/runtime semantics without a real consumer defect;
- Final Learner Objects are derived assets; they never become a competing semantic owner.

Exact semantic, pronunciation, audit and projection rules stay in their existing owners, not this cursor.

## Concurrency / stop

A future bounded task must check current owner/write-set overlap and preserve other active writers. An overlapping writer blocks only the exact shared owner/write-set; unrelated Lexical, English or Website work remains independent.

本轮按上方明确范围和断点继续；退休Issue、历史PR、旧批次及闭合trial都不提供第二个Next。后续实质扩范围或发布仍需当前明确决定。

Historical campaigns and delivery evidence remain in Git history / their exact owners and stay outside normal continuation.
