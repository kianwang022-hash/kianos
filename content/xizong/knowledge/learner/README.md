# Xizong Shared Learning Support

This README owns routing and freshness only.

## Owners

| Responsibility | Read |
|---|---|
| Construction quality | [Learning Asset Standard](../../../../LEARNING_ASSET_STANDARD.md) |
| Chat-led teaching and Source/evidence principles | [Learning Contract](../../LEARNING_CONTRACT.md) |
| Machine execution details | [study-policy.json](./study-policy.json) |
| Canonical medical assets and identity | [Knowledge manifest](../manifest.json) → exact Current System/Block/KP |
| System-specific Learning | Exact `*-learning.json` block |
| Shared support / identity joins | `shared-fields.json` / `identity-aliases.json` |
| Beginner explanation boundary / path resolver | [Beginner Guide Contract](./BEGINNER_GUIDE_CONTRACT.md) / [guide-bindings.json](./guide-bindings.json) |
| Block pre-entry content | [Block Preentry Contract](./BLOCK_PREENTRY_CONTENT_CONTRACT.md) |
| Precision / MedicalVisual timing indexes | Exact `*-learning-cues.json` and its referenced owners |
| Lecture-replacement organization | [Lecture Replacement Contract](./LECTURE_REPLACEMENT_CONTRACT.md) |
| Website/reconstruction composition | [Projection Contract](../../projection/PROJECTION_CONTRACT.md) |

## Chat-led Block reading entry

For continuation, resolve actual learner context first. First retain [Learning Contract §0 — highest learner-facing invariant](../../LEARNING_CONTRACT.md#learning-outcome). For a named System/Block lesson:

1. Read [Learning Contract §2｜Ownership](../../LEARNING_CONTRACT.md) → [Knowledge manifest](../manifest.json) → full Current canonical Block and System, including explicit Framework, comparisons, Source locators, boundaries and MI-G/MI-D.
2. Resolve the exact System owner first, then its accepted Learning path; the manifest does not directly map every System to a Learning file. The existing native inspector reports `basis.owners.learning` and `basis.owners.learningShards` from the shared resolver (`static-web/src/lib/xizong.mjs` / `xizongSemanticAdapter.mjs`); read those actual owner files and selectors, not a guessed filename. For A1 this is `a1-circulation-learning.json#/blocks/<block_id>/logic_groups`, checked against `system.json#/logic_index/<block_id>`. The exact System Learning membership/order/goal/closure wins over stale `shared-fields.json#/logic_groups` metadata; System and Learning must agree rather than stitching incompatible lists. [Learning Contract §2｜Ownership](../../LEARNING_CONTRACT.md) owns System-specific refinement; [Projection Contract §2｜Current compiled scope vs eligibility](../../projection/PROJECTION_CONTRACT.md) documents the existing normalization of C explicit `kp_members` and D/E/F top-level `logic_groups`/`system_route` plus Content `block_realization`. Read the actual Learning owner’s learning-mode scope as well: native derived `sourceContact` (including `normalFirstPass`) describes original-Lecture contact execution, not the default teaching order for every Chat-led first pass. Inspect medical figures/Source needed for the current step now; existing formal Source-contact/closure requirements are not satisfied by Chat explanation.
3. Read `shared-fields.json#/kp_fields/<kp_id>/retention_metadata` in full using the actual stable `kp_id` from the canonical/identity resolver, not a displayed short ordinal, including owned `gate_knowledge`, `source_memory_items`, Connections and reserve items when present; retain their anchors, routes and provenance. Also resolve `block_fields/<block_id>` and relevant `system_fields/<system_id>`. Exact Memory/evidence interpretation routes to [Learning Contract §8｜Memory and attention](../../LEARNING_CONTRACT.md); support presence is not private admission or due evidence.
4. Read the exact System `*-learning-cues.json` `precision_index` and `visual_bindings`, matching the actual `visual_bindings[].anchor.block_id` / `logic_group_id` and any other fields actually owned by the binding, plus Source locators; follow the actual MedicalVisual asset/source rather than only the cue label. Resolve Current `*-extensions.json#/assets` by actual `owner.block_id` / `owner.logic_group_id`; use `owner.kp_id` only if that field actually exists, and never discard LG-level support for lacking a KP field, under [Extension Asset Contract](../../EXTENSION_ASSET_CONTRACT.md). Resolve `retention_metadata.connections` and any referenced canonical/System Connection owner under [Learning Contract §1｜Formal Boundary / Connection adoption](../../LEARNING_CONTRACT.md). Do not omit exact retention because the model summary already mentions its topic; absent support remains absent.

Only Website tasks read Website owners. Teaching principles inherit the Learning Contract; old ProductBrief product descriptions do not override it. This router does not define teaching order or evidence semantics.

For Lecture output, read canonical Block/Framework as medical constraints and resolve the accepted teaching input under [Learning Contract §13｜Fresh-Chat / non-drift](../../LEARNING_CONTRACT.md#13fresh-chat--non-drift-rule); apply [Lecture Replacement Contract §3.1](./LECTURE_REPLACEMENT_CONTRACT.md#teaching-topology-annotations).

Then route the requested output to the organization/composition owner above. `static-web/scripts/inspect-xizong-content.mjs` is the existing optional read-only native composition inspector.

## Teaching basis resolution

Only an exact teaching package accepted against [Learning Contract §0](../../LEARNING_CONTRACT.md#learning-outcome) may be the stable teaching/compressed-review basis. Refresh its relevant canonical/System/Learning dependencies; freshness or an old `REVIEWED_DERIVATION` header alone is not current-format admission.

### Accepted B1 teaching basis

For **A1 Circulation / circulation-b01 only**, the [exact B1 adoption receipt](../systems/a1-circulation/ACCEPTANCE.md#b1-teaching-adoption-20261006) admits [the B1 teaching/compressed-review model](../../projection/a1-circulation/chat/b01-teaching.md) as the stable normal Chat input under Learning Contract §0 and §13. Read the receipt and refresh the canonical/System/Learning owners above before using the same model for teaching or compressed reconstruction.

This is the corrected `2ea5d4df25a98c60241d0233a9c04cac650ffa44` B1 view, explicitly adopted by Kian on 2026-10-06 and merged by [#1197](https://github.com/kianwang022-hash/kianos/pull/1197). Its saved `CANDIDATE_DERIVATION` header and candidate wording record the review-time artifact boundary; the current adoption state is owned by the exact Acceptance receipt. They remain byte-preserved with the tested teaching content and do not create medical authority. This routing exception admits no other Block or old review file.

### Accepted B2 teaching basis

For **A1 Circulation / circulation-b02 only**, the [exact B2 adoption receipt](../systems/a1-circulation/ACCEPTANCE.md#b2-teaching-adoption-20261006) admits [the B2 teaching/compressed-review model](../../projection/a1-circulation/chat/b02-teaching.md) as the stable normal Chat input under Learning Contract §0 and §13. Read the receipt and refresh the canonical/System/Learning owners above before using the same model for teaching or compressed reconstruction.

This is the B2 composition tested at `e6a0b9f3f86d03975564a52135ace879c4f6e621` in [#1203](https://github.com/kianwang022-hash/kianos/pull/1203), adopted under Kian's task-scoped authorization in [#1113](https://github.com/kianwang022-hash/kianos/issues/1113) after the bounded reader and actual Website retrieval checks recorded in the receipt. Its saved `CANDIDATE_DERIVATION` header and candidate wording remain review-time provenance; the exact Acceptance receipt supersedes that admission boundary only for this B2 teaching use. Medical ownership, dependency freshness, Source gates and private learner evidence remain with their existing owners. This routing exception admits no other Block or old review file.

### Accepted remaining A1 teaching basis

For **A1 Circulation / circulation-b03 through circulation-b12**, the [one-System adoption receipt](../systems/a1-circulation/ACCEPTANCE.md#a1-remaining-teaching-adoption-20261006) admits the following exact teaching/same-model compressed-review inputs under Learning Contract §0 and §13. Read that receipt and refresh the full Current System, canonical Block/KP and accepted Learning owners before use.

- [B3 心肌电活动与 ECG 语言](../../projection/a1-circulation/chat/b03-teaching.md)
- [B4 正常止血与病理循环整合](../../projection/a1-circulation/chat/b04-teaching.md)
- [B5 高血压与动脉粥样硬化](../../projection/a1-circulation/chat/b05-teaching.md)
- [B6 冠心病与心肌梗死](../../projection/a1-circulation/chat/b06-teaching.md)
- [B7 风湿、感染性心内膜炎与四瓣膜病](../../projection/a1-circulation/chat/b07-teaching.md)
- [B8 心肌与心包](../../projection/a1-circulation/chat/b08-teaching.md)
- [B9 周围血管疾病](../../projection/a1-circulation/chat/b09-teaching.md)
- [B10 心律失常](../../projection/a1-circulation/chat/b10-teaching.md)
- [B11 心力衰竭](../../projection/a1-circulation/chat/b11-teaching.md)
- [B12 休克与心脏骤停](../../projection/a1-circulation/chat/b12-teaching.md)

This is the coherent composition accepted at `5dd646f017d67132e82feef5d764f5d36393d6ce` in [#1206](https://github.com/kianwang022-hash/kianos/pull/1206), after the bounded ten-reader and representative actual Website checks recorded in the receipt. The existing A1 cue index admits only the reviewed original prepared identities; 79 retained rows remain unadmitted. Use complete existing xpg owners and all required scopes/current-Core witnesses rather than copying source aliases into duplicate cards. Navigation or prepared availability creates no Source, completion, mastery or Today claim.

The files' preserved candidate headers and review-time language record their provenance. This exact Acceptance receipt supersedes that admission boundary only for the ten named inputs; medical authority, freshness, original Source limits and learner evidence retain their owners. B1/B2 remain governed by their accepted entries above. This route does not adopt other Systems, old review files or the whole #1150 branch.

The common teaching package on [#1150](https://github.com/kianwang022-hash/kianos/pull/1150) remains a candidate until its exact admission owner says otherwise. Resolve acceptance there, not from a stored head or file count. Without an accepted package, teach from Current canonical Knowledge and accepted Learning while explicitly retaining the unaccepted-package boundary.

Except for the explicitly accepted B1, B2 and B3–B12 teaching entries above, old A1 teaching/review files are deliberately not linked as normal lesson inputs here. They may be opened only for a bounded migration/audit of unique reviewed content. Preserve valid explanation, comparison and memory preparation with the existing responsible owners before retiring a legacy file; do not use its LG-order instructions, three-column layout or old acceptance label as the current teaching template. Legacy `*-review.md`, old Library exports, old PR prose and old screenshots are not fallback lesson authority.


Beginner Guide routing uses `guide-bindings.json`; the current explicit set is A1, A2, A3 and B. C/D/E/F have Current System/Learning owners without separate Guide assets. Do not infer a historical fallback from that absence.

## Evidence/history routing

Calibration, audit and phase receipts route to their exact acceptance claim, rather than normal learning/Runtime input. Example: [Guide/Framework exit audit](../../projection/GUIDE_FRAMEWORK_EXIT_AUDIT_20260917.md). Learning/evidence interpretation routes back to Learning Contract; private progress and actual learning records remain with native learner-state owners.
