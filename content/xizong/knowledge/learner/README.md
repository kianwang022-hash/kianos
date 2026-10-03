# Xizong Shared Learning Support

`content/xizong/knowledge/learner/` carries Chat-approved shared learning-policy and projection support for Current Xizong knowledge.

It does **not** own medical Core and it is **not** personal learner state.

Lane-level learning constitution is owned by `content/xizong/LEARNING_CONTRACT.md`.

## Current owners

- lane learning constitution → `content/xizong/LEARNING_CONTRACT.md`: stable natural-unit model, phase linkage, Lecture/KianOS boundary, question/Repair/Review/Transfer relationship and governance boundary;
- `study-policy.json` — detailed machine-readable shared execution policy inside that constitution: stage responsibilities, mastery ladder, exact first-pass gates, Lecture/KianOS execution detail, question reuse, Memory admission, compression and lossless scheduling;
- `shared-fields.json` — reviewed shared projection fields where already materialized;
- `identity-aliases.json` — stable identity joins/aliases;
- System-specific `*-learning.json` files may add compact learning guidance such as Logic Group goals, closure cues and Recall skeletons;
- `BEGINNER_GUIDE_CONTRACT.md` — contract for Current System-level beginner explanation assets. These Guides explain accepted Current System / Learning / Block structure but have **no independent medical semantic authority**;
- `guide-bindings.json` — Current path resolver for beginner explanation assets. For systems explicitly bound there, this resolver wins over stale legacy `system_fields.*.guide_path` metadata in `shared-fields.json`; it does not create medical or learning-route authority;
- System-specific `*-guide.md` files — Current beginner-readable explanation / orientation assets where explicitly accepted. They may recover re-verified explanatory patterns from bounded historical provenance, but may not revive legacy System Guide authority, add new medical facts or become a second textbook;
- `BLOCK_PREENTRY_CONTENT_CONTRACT.md` — typed content boundary for explicit canonical Block `Framework / Memory Routing / MI-G / MI-D`. It defines what downstream compilation may expose and forbids inferred membership or personal learner-state semantics;
- System-specific `*-learning-cues.json` files may add **selective, non-authoritative indexes** for Precision awareness and Visual timing. They reference stable Block / Logic Group / KP identities, do not copy canonical answers, and absence from the index never means canonical content is unimportant or omitted;
- [Projection Contract §7.1](../../projection/PROJECTION_CONTRACT.md#block-review-generation) — generation/composition owner for Block study/reconstruction views: medical topology, in-place KP content and two densities of the same model. It replaces the old three-column production template, not medical or Learning authority.

Current Beginner Guide set introduced by the 2026-09-17 Guide / Framework content lane:

- `a1-circulation-guide.md`
- `a2-respiratory-guide.md`
- `a3-urinary-guide.md`
- `b-digestive-metabolic-endocrine-tumor-guide.md`

These four files are the currently accepted Beginner Guide assets. C / D / E / F already have canonical Current System/Learning owners but do not yet have separate Beginner Guide assets; absence means no Guide is rendered, not permission to fall back to an older System Guide.

`guide-bindings.json` is the only Current beginner-Guide path resolver. Historical System Guide provenance lives in Git history and is not part of normal routing.

## Block pre-entry content boundary

Canonical Block Markdown may explicitly own several learner-facing content jobs before or during first learning:

```text
Framework
Memory Routing
  ├─ MI-G
  └─ MI-D
```

These are content semantics, not UI cards and not personal review state. Downstream Projection / learner-object work must preserve explicit Current ownership and provenance; a missing Framework or Memory section remains missing rather than being synthesized for symmetry.

`BLOCK_PREENTRY_CONTENT_CONTRACT.md` owns that extraction boundary. It does not itself recompile Projection or change Runtime.

## Evidence / receipt boundary

Files whose role is calibration, audit, re-acceptance or phase receipt (for example `*_PHASE*.md`, independent-acceptance receipts and similar builder/auditor records) are **evidence about how a Current owner was reached**, not an alternative Current learning model and not a Runtime input.

Normal learning / Runtime consumers must resolve the Current owners above rather than reading receipt history as competing semantic authority. A receipt may justify or challenge an acceptance claim; it may not silently override `LEARNING_CONTRACT.md`, `study-policy.json`, canonical medical owners or the relevant accepted System learning asset.

`content/xizong/projection/GUIDE_FRAMEWORK_EXIT_AUDIT_20260917.md` is such a boundary audit: it records whether Guide / Framework / MI-G / MI-D / Memory Routing currently survive Projection, but it does not itself become a learning or Runtime owner.

## Chat-led Block reading entry

For a named, structured System/Block lesson, resolve these existing owners before teaching. A self-contained medical question does not require this entry, and a continuation still needs the actual learner context rather than an assumed first Block.

1. `content/xizong/LEARNING_CONTRACT.md` owns teaching and evidence rules. Apply its Chat-led causal-model flow and reasoning-critical precision now; do not infer teaching rules from Website layout.
2. Resolve the exact System/Block through `content/xizong/knowledge/manifest.json` and the Current System owner. Read the full canonical Block, including explicit Framework, comparisons, Source locators, boundaries and MI-G/MI-D; a title/Prompt inventory is not the lesson.
3. Read the exact System Learning block. Its accepted LG membership/order and goal/closure win over stale shared-field group metadata. The relevant System owner and Learning support must agree; do not stitch incompatible group lists. Retaining LG coverage/order does not require splitting the medical explanation or reconstruction view into numbered LG columns.
4. Resolve the Block's actual reviewed support owners: relevant `shared-fields.json` KP retention items, System cues/MedicalVisuals, Extensions and Connections when present. `source_memory_items` are content support, not proof that the learner has admitted or owes every item in Memory. Preserve owner and timing; absent support stays absent.
5. A fresh reviewed teaching view may help Chat explain the same canonical model; an **accepted integrated** study/reconstruction view may help expansion and model rebuilding. Legacy three-column review files below are migration/audit inputs only, not normal reconstruction surfaces. When authoring or migrating a view, consume [Projection Contract §7.1](../../projection/PROJECTION_CONTRACT.md#block-review-generation), not the old file's left/middle/right instructions. Read provenance and actual format: if the referenced canonical blob or relevant Learning/System value changed, re-read Current and review the affected view before relying on it. A stale/absent optional view does not block teaching from valid Current owners, and an Issue candidate is not a normal formal-lesson fallback.
6. At a natural teaching breakpoint, check actual KP/Source coverage and unresolved distinctions. Teaching, an explanation being understood and native Recall/Complete remain separate. Do not manufacture missing source contact or personal evidence.

Existing `static-web/scripts/inspect-xizong-content.mjs` is the read-only native composition inspector when execution is available. It is not a prerequisite for ordinary Chat: repository readers follow the same owner references above and must not claim native resolution they did not execute.

### Reviewed A1 teaching and reconstruction inputs

These recover the already-prepared B1–B4 teaching materials and legacy review material against their published medical owners. Original M0 inputs remain historical evidence, not the current reading entrance. Later chapters use their formal owners and real supports until a view is actually reviewed; do not invent a symmetric file or silently fall back to an old candidate.

Normal named-Block teaching should read Current owners plus the teaching input when it is still fresh. The linked review files below contain the **legacy three-column format** and are now migration/audit inputs only: open them when converting that Block or when a specific already-reviewed comparison/boundary/Source note has not yet been rehomed. Do not preload them as the default reconstruction model, and do not let their left/middle/right layout instructions drive new output. Preserve their valid content until migration proves it has a destination under [Projection Contract §7.1](../../projection/PROJECTION_CONTRACT.md#block-review-generation).

| Block | Chat teaching input | Legacy review inheritance input | Normal use |
|---|---|---|---|
| A1 B1 | [Teaching](../../projection/a1-circulation/chat/b01-teaching.md) | [Legacy review](../../projection/a1-circulation/chat/b01-review.md) | Teaching: yes when fresh; legacy review: migration/audit only |
| A1 B2 | [Teaching](../../projection/a1-circulation/chat/b02-teaching.md) | [Legacy review](../../projection/a1-circulation/chat/b02-review.md) | Teaching: yes when fresh; legacy review: migration/audit only |
| A1 B3 | [Teaching](../../projection/a1-circulation/chat/b03-teaching.md) | [Legacy review](../../projection/a1-circulation/chat/b03-review.md) | Teaching: yes when fresh; legacy review: migration/audit only |
| A1 B4 | [Teaching](../../projection/a1-circulation/chat/b04-teaching.md) | [Legacy review](../../projection/a1-circulation/chat/b04-review.md) | Teaching: yes when fresh; legacy review: migration/audit only |

Candidate review and migration progress live only in [#1147](https://github.com/kianwang022-hash/kianos/issues/1147), not in a second status ledger here. Ordinary teaching need not read that Issue. When a Block's integrated topology is accepted, materialize it through the existing Projection owner/consumer path, verify inheritance, then retire the obsolete legacy review duplicate once no unique reviewed content remains there. Until then the legacy file stays frozen as an input, not a template. Chat teaching remains continuous explanation of Current knowledge and is not replaced by compressed graph prose or forced to follow display order.

## Hard boundary

Shared learner support may answer **how and when to learn** a Current knowledge object. It may not silently change **what the medical knowledge is**.

The lane contract and detailed policy are not competing copies: constitutional decisions belong to the lane contract; executable policy detail belongs to `study-policy.json`; System-specific guidance belongs to the relevant System learning owner. If those layers ever appear to disagree, fail closed and reconcile the responsible owner rather than guessing.

Beginner explanation is likewise subordinate: if a `*-guide.md` explanation conflicts with Current `system.json`, canonical Block Core or accepted System learning support, the Guide must be corrected; it never wins by having more prose.

Precision is an exactness attribute, not a mastery stage or an automatic Memory queue. Visual bindings are source-locator + micro-task triggers, not copied medical content. Cross-block reserve learning and connection hooks remain distinct from ordinary Memory admission.

Personal progress, ratings, Wrong/Uncertain state, notes, comments, timing, scheduling and history remain browser interaction state and are outside shared Current content.
