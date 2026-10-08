# Lexical Current

Role: **Lexical current-task cursor + scope router**

Learner-facing Vocabulary / Lexical belongs under **English**. This file owns only current Lexical task routing. It does not own semantic truth, learner progress, Acceptance Truth, pronunciation truth, runtime truth, or historical evidence.

## Current / Next / Blocker

**Current：** 当前优先西综A1/A2/A3及政治内容收口，本任务保持较低优先级。前1000词已交付。本轮由总控本人从1001–1200重新完成三遍内容审核；1001–1050的现行语义内容已由本人逐词读过，保存31词首轮草稿（含部分仅标签修复）；Relation、去重/准入裁决与第二/三遍仍未完成，不计50词或200词交付。已按50词保存Library libfile_42e6e79c3738819189a2dce184aca294 version1：50原稿、31草稿、逐项来源与未决均可恢复。第二千词旧P2/P3本地文件现不可用，旧累计与旧PASS不得计入本轮完成或交付。

**Next：** 继续1001–1050的三遍审核，再依次处理该200词包其余范围。每50词保存可恢复的有效断点，注明精确范围、三遍分别进度、具体未决问题、可读文件/版本及下一步；每200词完成三遍后，在当前聊天交付可下载包。200词交付替代原250词方案。

**Blocker：** 旧文件缺失只使其证据不可复用，不推定内容已完成；从可回读的当前原稿继续。若本轮必要原稿或保存文件不可读取，只阻塞对应范围，不能用旧进度补算。

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
