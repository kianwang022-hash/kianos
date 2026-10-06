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

For continuation, resolve actual learner context first. For a named System/Block lesson:

1. Read [Learning Contract §2｜Ownership](../../LEARNING_CONTRACT.md) → [Knowledge manifest](../manifest.json) → full Current canonical Block and System, including explicit Framework, comparisons, Source locators, boundaries and MI-G/MI-D.
2. Resolve the exact System owner first, then its accepted Learning path; the manifest does not directly map every System to a Learning file. The existing native inspector reports `basis.owners.learning` and `basis.owners.learningShards` from the shared resolver (`static-web/src/lib/xizong.mjs` / `xizongSemanticAdapter.mjs`); read those actual owner files and selectors, not a guessed filename. For A1 this is `a1-circulation-learning.json#/blocks/<block_id>/logic_groups`, checked against `system.json#/logic_index/<block_id>`. The exact System Learning membership/order/goal/closure wins over stale `shared-fields.json#/logic_groups` metadata; System and Learning must agree rather than stitching incompatible lists. [Learning Contract §2｜Ownership](../../LEARNING_CONTRACT.md) owns System-specific refinement; [Projection Contract §2｜Current compiled scope vs eligibility](../../projection/PROJECTION_CONTRACT.md) documents the existing normalization of C explicit `kp_members` and D/E/F top-level `logic_groups`/`system_route` plus Content `block_realization`. Read the actual Learning owner’s learning-mode scope as well: native derived `sourceContact` (including `normalFirstPass`) describes original-Lecture contact execution, not the default teaching order for every Chat-led first pass. Inspect medical figures/Source needed for the current step now; existing formal Source-contact/closure requirements are not satisfied by Chat explanation.
3. Read `shared-fields.json#/kp_fields/<kp_id>/retention_metadata` in full using the actual stable `kp_id` from the canonical/identity resolver, not a displayed short ordinal, including owned `gate_knowledge`, `source_memory_items`, Connections and reserve items when present; retain their anchors, routes and provenance. Also resolve `block_fields/<block_id>` and relevant `system_fields/<system_id>`. Exact Memory/evidence interpretation routes to [Learning Contract §8｜Memory and attention](../../LEARNING_CONTRACT.md); support presence is not private admission or due evidence.
4. Read the exact System `*-learning-cues.json` `precision_index` and `visual_bindings`, matching the actual `visual_bindings[].anchor.block_id` / `logic_group_id` and any other fields actually owned by the binding, plus Source locators; follow the actual MedicalVisual asset/source rather than only the cue label. Resolve Current `*-extensions.json#/assets` by actual `owner.block_id` / `owner.logic_group_id`; use `owner.kp_id` only if that field actually exists, and never discard LG-level support for lacking a KP field, under [Extension Asset Contract](../../EXTENSION_ASSET_CONTRACT.md). Resolve `retention_metadata.connections` and any referenced canonical/System Connection owner under [Learning Contract §1｜Formal Boundary / Connection adoption](../../LEARNING_CONTRACT.md). Do not omit exact retention because the model summary already mentions its topic; absent support remains absent.

Only Website tasks read Website owners. Teaching principles inherit the Learning Contract; old ProductBrief product descriptions do not override it. This router does not define teaching order or evidence semantics.

For Lecture output, read canonical Block/Framework as medical constraints and resolve the accepted teaching input under [Learning Contract §13｜Fresh-Chat / non-drift](../../LEARNING_CONTRACT.md#13fresh-chat--non-drift-rule); apply [Lecture Replacement Contract §3.1](./LECTURE_REPLACEMENT_CONTRACT.md#teaching-topology-annotations).

Then route the requested output to the organization/composition owner above. `static-web/scripts/inspect-xizong-content.mjs` is the existing optional read-only native composition inspector.

## Existing A1 teaching inputs and current-format boundary

Read a teaching input only after its bound Current canonical/System/Learning dependencies are checked. Changed relevant premises require bounded review under the Lecture Replacement Contract; absent/stale support returns to valid Current owners.

The four existing A1 inputs below retain previously reviewed explanatory content. Their old `REVIEWED_DERIVATION` headers do not establish acceptance against the current in-model full-Prompt requirement. They must not prescribe LG/Markdown-order teaching or send ordinary learners to legacy three-column review files. Until the exact current-format teaching package passes its scoped admission, teach from valid Current Knowledge and accepted Learning, preserving the same medical model and its canonical Prompt locators.

The common 159-Block teaching package remains a candidate on [#1150](https://github.com/kianwang022-hash/kianos/pull/1150), with #1145/#1148 dependencies. Use its current admission owner, not a stored head or file count, to decide whether any exact package is adopted. This routing cleanup neither adopts that candidate nor changes private learner evidence.

| Block | Lecture-replacement teaching input | Admission owner |
|---|---|---|
| A1 B1 | [Teaching](../../projection/a1-circulation/chat/b01-teaching.md) | Learning Contract §13 |
| A1 B2 | [Teaching](../../projection/a1-circulation/chat/b02-teaching.md) | Learning Contract §13 |
| A1 B3 | [Teaching](../../projection/a1-circulation/chat/b03-teaching.md) | Learning Contract §13 |
| A1 B4 | [Teaching](../../projection/a1-circulation/chat/b04-teaching.md) | Learning Contract §13 |


Legacy `*-review.md` is outside normal Chat teaching and normal teaching-derived review input. Keep it for bounded migration/audit of unique valid semantics; Issue comments and historical templates are not fallback teaching authority.

Beginner Guide routing uses `guide-bindings.json`; the current explicit set is A1, A2, A3 and B. C/D/E/F have Current System/Learning owners without separate Guide assets. Do not infer a historical fallback from that absence.

## Evidence/history routing

Calibration, audit and phase receipts route to their exact acceptance claim, rather than normal learning/Runtime input. Example: [Guide/Framework exit audit](../../projection/GUIDE_FRAMEWORK_EXIT_AUDIT_20260917.md). Learning/evidence interpretation routes back to Learning Contract; private progress and actual learning records remain with native learner-state owners.
