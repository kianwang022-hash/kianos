# English Translation Acceptance

Status: CURRENT
Scope: English Translation learner-facing module
Standard: root `LEARNING_ACCEPTANCE.md`

This file owns current **Acceptance Truth** for Translation.

It does not own Translation learning content, runtime code, Work Cursor, or private learner state.

---

## Gate status

| Gate | Status | Current evidence / boundary |
| --- | --- | --- |
| S — Source | PASS_WITH_DEBT | Current Source boundary is machine-validated from the Current manifest/question bank/scanner. Translation resolves from 1 section, 27 sets and 135 stable prompts. 25 sets have complete reference coverage; 2 are partial with exactly 3 explicit `pending_review` reference debts and zero validator failures. Missing references remain fail-closed and may not be fabricated. |
| K — Knowledge | PASS | Bounded semantic audit of canonical `content/english/modules/translation/learning.md` and the minimal Translation boundary in `content/english/LEARNING_CONTRACT.md` found a capability-native hierarchy, substantive high-value mechanisms, correct LexicalOS routing, active checks/integrated generation, proper material/evidence ownership, and no justified K blocker or debt. Runtime semantics appended later in the file are not accepted by K. |
| L — Learning | PASS | Bounded learning-path audit confirms that first learning is Global Map → four continuous Core Learning Blocks → integrated use → normal Translation task; Skill Map/deep leaves remain later repair/navigation rather than compulsory curriculum; learning is complete-but-skippable without manufacturing mastery; synthetic/exposed material teaches mechanisms while protected unseen material is preserved; repair follows the earliest meaningful failure and requires learner reconstruction; later fresh transfer outranks same-item correction. No justified L blocker or debt was found. |
| P — Projection | PASS | Bounded Projection audit found and repaired two real learner-flow defects before acceptance: concrete Transfer Pending cues could appear during Clean Attempt, contaminating fresh evidence; and `F｜HOW YOU LEARN IT` was folded while `G｜第一次学习出口` tested its concepts. The repaired projection now hides pending-target detail through the clean attempt, renders F on the first-learning main path before G, keeps Skill Map/deep/runtime reference progressively disclosed, and delays canonical references until explicit post-attempt reveal. Post-build gate evidence on PR head `e7ee7602f40ecfaaec439660b23aa723b8aa6afb`: `PASS`, 161 checks, 27/27 task pages inspected, 132 available reference rows checked, 0 leaked reference rows, 0 issues. |
| R — Runtime | UNTESTED | Runtime implementation and deterministic journey validators exist, but P acceptance does not accept their execution semantics. **R is the current active gate under local `CURRENT.md`.** |
| E — Evidence | UNTESTED | Evidence/transfer/persistence semantics exist in candidate implementation. Formal E acceptance remains downstream-frozen until R passes. |
| U — User Validation | UNTESTED | No repository engineering evidence may substitute for real Kian use. U is not eligible until S–E support `Module ready for learner test`. |

`UNTESTED` above is evidence status, not a parallel work queue. Gate activation is controlled by `content/english/modules/translation/CURRENT.md`.

---

## Current readiness claim

Allowed statement:

> **Translation has accepted Source, Knowledge, Learning and Projection boundaries: S is PASS_WITH_DEBT with three explicit fail-closed reference gaps; K/L/P are PASS; R is now the active gate; E remains downstream-frozen; U remains UNTESTED.**

Do not say `Module ready for learner test` until R and E also meet the root acceptance standard.

---

## Accepted Source evidence

The bounded Source validator is `static-web/scripts/validate-translation-source.mjs`; CI persists `translation-source-gate` evidence.

Accepted S evidence:

- decision: `PASS_WITH_DEBT`
- section resolution: `translation` via `current-evidence`
- sets: `27`
- prompts: `135`
- complete reference sets: `25`
- partial reference sets: `2`
- explicit pending reference debts: `3`
- failures: `0`
- canonical question owner SHA-256: `c82b8daa93962cc39a9a4f09a0ba16057914edb6f96a2888c3be455928784986`

Bounded debts:

1. `english1-2022-translation-main-q48` — `pending_review`
2. `english1-2022-translation-main-q49` — `pending_review`
3. `english1-2025-translation-main-q46` — `pending_review`

These are Source gaps, not learner debt, and do not authorize generated/fabricated reference translations.

---

## Accepted Knowledge evidence

K was audited semantically against:

- `content/english/modules/translation/learning.md` blob `69719c5d81fb577386bd4bc901b4d1c5aad0ce67`
- `content/english/LEARNING_CONTRACT.md` blob `7ad75e87fcec18fd2dec29b4f5de5155b09aa9ec`

Accepted K hierarchy:

```text
Global Map
→ English Representation
→ Preservation & Fidelity
→ Chinese Reconstruction
→ Exam Execution
→ integrated use
→ later Skill Map / selective Skill Content
```

The asset teaches the high-value mechanisms rather than merely naming them; lexical ownership routes to LexicalOS; teacher material remains a Repair Reservoir; synthetic/exposed/protected material and private learner evidence are separated; long-tail ambiguity/personalized drill remains adaptive Chat territory. No justified K debt was found.

The later Frozen Runtime appendix was not used to grant K and remains downstream candidate semantics.

---

## Accepted Learning evidence

L judges **how the ability is formed**, not merely whether the content is correct.

Accepted learner path:

```text
Global Map
→ B1 English Representation
→ B2 Preservation & Fidelity
→ B3 Chinese Reconstruction
→ B4 Exam Execution
→ integrated use
→ normal Translation task
```

Accepted constraints:

- Skill Map/deep leaves are later repair/navigation, not compulsory first learning;
- complete-but-skippable navigation does not create mastery/evidence;
- synthetic/exposed material may teach mechanisms while protected unseen material remains diagnostic capital;
- clean first output precedes diagnosis/reference use;
- repair starts at the earliest meaningful failure;
- smallest sufficient repair must be followed by learner reconstruction;
- same-item correction is weaker than later fresh transfer;
- long-tail ambiguity and personalized micro-drills remain Chat territory.

L decision: **PASS**. No justified L debt was found.

---

## Accepted Projection evidence

P was not inferred from “the page exists” or from Runtime validators. It combined a bounded learner-facing audit with a dedicated post-build Projection gate.

### Projection defects found and repaired

#### 1. Transfer Pending cue leak before clean attempt

Before P closure, `TranslationWorkspace` rendered concrete pending-target labels and `underlyingDemand` during the `attempt` stage whenever an old transfer target existed. That violated the Home promise that specific pending weaknesses stay hidden until the complete first version is locked and could cue the demand that a fresh task is supposed to test.

Repair:

- task projection now applies `protectCleanAttempt` to keep `[data-pending-panel]` hidden whenever the Clean Attempt stage is visible;
- the guard observes both attempt-stage visibility and pending-panel visibility, so ordinary render/reset operations cannot re-expose the cues during a fresh attempt;
- after the first attempt is frozen and the attempt stage ends, relevant pending detail can become visible for later review/verification.

This was a real P blocker and is now repaired, not recorded as debt.

#### 2. First-learning teach/test inversion

Before P closure, `F｜HOW YOU LEARN IT` was grouped inside the folded `Material Routing + HOW YOU LEARN IT + Runtime v1` reference while `G｜第一次学习出口` remained on the visible main path and asked why first translation must be preserved and why same-item correction is not mastery.

Repair:

- F is now visible on the first-learning main path after the integrated walkthrough and before G;
- navigation exposes `How You Learn It` as a natural bridge to real Translation;
- E Material Routing and H Runtime v1 remain folded system/reference material;
- C/D Skill Map + Deep Skills remain folded, preserving progressive disclosure and preventing taxonomy from becoming first-learning curriculum.

This restores “teach before exit check” without adding a new knowledge block.

### Reference / protected-evidence projection

The task page projects `references: []` initially and uses `TranslationReferenceLoader` for delayed reference retrieval. Canonical reference rows are not server-rendered into the clean-attempt task HTML. Reference loading remains behind explicit reveal/open behavior, except restoration of a reference panel that the same local attempt had already opened.

### Learner-facing structure

The accepted projection now preserves the intended cognitive units:

- Home foregrounds First Learning before catalog browsing while retaining free navigation;
- First Learning shows the continuous capability trunk, with long diagnostic/runtime material folded;
- task view keeps source visible and projects one whole task/set as the review unit;
- Segment inputs preserve finer first-evidence granularity without turning review into isolated-item workflow;
- PASS / Review / Reconstruction / Reference controls are progressively revealed by stage;
- provenance and history are secondary/folded rather than competing with the immediate learning action;
- responsive layouts collapse the two-column task view on narrower screens without changing semantics.

### Executed Projection gate

Validator: `static-web/scripts/validate-translation-projection.mjs`  
Workflow: `.github/workflows/static-web-translation-qa.yml`  
PR-head run: `34698611076` on `e7ee7602f40ecfaaec439660b23aa723b8aa6afb`

Machine evidence:

- schema: `kianos.english.translation.projection-gate-validation.v1`
- gate: `P`
- decision: `PASS`
- checks: `161`
- Current Translation sets: `27`
- built task pages inspected: `27`
- available reference rows checked: `132`
- leaked reference rows in clean-attempt task HTML: `0`
- issues: `0`
- first-learning bridge before exit: `true`
- Skill/Runtime progressive disclosure: `true`
- clean-attempt reference payload empty: `true`
- pending-cue guard: `true`

P decision: **PASS**. No remaining Projection defect justifies `PASS_WITH_DEBT`.

---

## Candidate evidence for staged acceptance

### Runtime candidates — active now

- `content/english/modules/translation/learning.md` — Frozen Runtime v1 appendix only as the accepted intended Runtime contract candidate
- `static-web/src/lib/translationRuntimeModel.mjs`
- `static-web/src/components/TranslationWorkspace.astro`
- `static-web/src/components/TranslationPersistenceGuard.astro`
- `static-web/src/components/TranslationReferenceLoader.astro` only where runtime reveal/load behavior must be traced
- `static-web/scripts/validate-translation-runtime.mjs`
- Translation task pages only where runtime wiring must be verified

Existing runtime-validator success is candidate evidence, not R acceptance. R must establish that the intended state transitions can actually be executed without forced debt or broken handoff/return behavior.

### Evidence candidates — preserved, downstream-frozen

- `static-web/src/components/TranslationEvidenceGuard.astro`
- `static-web/scripts/validate-translation-evidence-guard.mjs`
- transfer/persistence portions of `translationRuntimeModel.mjs`

Do not use them to leapfrog R.

---

## Acceptance next action

Run a bounded **R-only** Translation Runtime audit:

1. recover the intended Runtime contract from the Frozen Runtime appendix and accepted K/L/P boundary;
2. verify a complete clean attempt can freeze and choose PASS without manufactured review/repair debt;
3. verify Need Review enters whole-set diagnosis and Chat handoff preserves immutable first output without prematurely adding Reference;
4. verify valid Chat return can produce PASS or one primary failure + smallest repair and route to learner Reconstruction;
5. verify incomplete/malformed/wrong-task return fails closed rather than mutating another task;
6. verify Reconstruction can save and naturally exit to repaired / transfer-pending paths without treating same-item success as mastery;
7. verify local persistence/re-entry/reset/history behavior does not lose or overwrite required runtime state;
8. classify concrete Runtime defects as blocker, bounded debt, or absent;
9. write R PASS / PASS_WITH_DEBT / BLOCKED only from executed evidence;
10. if R passes, advance local `CURRENT.md` to E without auditing E in the same step;
11. keep U `UNTESTED` until real learner use.

If R exposes a real Projection or upstream defect, reopen the earliest responsible gate rather than compensating in evidence logic.

---

## Truth boundaries

### Artifact Truth
Actual Translation source/content/projection/runtime owners listed above.

### Acceptance Truth
This file records S as `PASS_WITH_DEBT`, K as `PASS`, L as `PASS`, and P as `PASS`. R/E/U remain unaccepted unless explicitly stated otherwise.

### Learner Truth
Private learner/runtime state only. This file does not claim Kian has started Translation, completed first learning, attempted a task, repaired an error, or closed a transfer target.
