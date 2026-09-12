# Xizong A3 Urinary Acceptance

Status: CURRENT  
Scope: A3 Urinary  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: A3 scoped Acceptance Truth

This file owns current S/K/L/P/R/E/U readiness claims for A3 Urinary.

It does not own medical Core, lane learning semantics, Work Cursor, or Kian's private learner state.

---

## Gate status

```text
S  PASS — CURRENT_RECONSTRUCTION
K  PASS
L  PASS
P  PASS
R  PASS
E  UNTESTED
U  UNTESTED by every real learner path
```

Current allowed conclusion:

> **A3 Source, System-level Knowledge, first-learning path, learner Projection and executable Runtime are accepted for the recorded scope. The Runtime can carry the approved Lecture-first path from Block learning through Recall, System questions and reviewed-only repair without manufacturing progress or letting stale System evidence survive changed Current content. Evidence semantics and real User Validation remain unaccepted.**

---

## Current evidence boundary

- Source scope owner → `content/xizong/knowledge/learner/a3-urinary-question-scope.json`.
- Accepted Source membership → **243 unique official-question IDs, 2005–2026**; runtime-sorted inventory SHA256 `bd8082bf9b82d00411f5d3dcaa09f56626c0c08b688e108f728f7da6e2f9b84e`.
- Current Question Truth → **3750 immutable IDs**, inventory SHA256 `0abc1a3cadbb41b36808fe86ff58c21ede6f4297312e9fb4c2da62b865ef2c82`.
- Current System-level Knowledge owner → `content/xizong/knowledge/systems/a3-urinary/system.json`, authority `CHAT_APPROVED`.
- Accepted stable substrate → **14 canonical Blocks / 257 stable KPs / 75 Logic Groups**, no Block/KP split, merge or renumbering.
- Block/KP medical truth → `content/xizong/knowledge/systems/a3-urinary/blocks/`.
- Lane learning constitution / first-pass surface ownership → `content/xizong/LEARNING_CONTRACT.md`.
- Detailed shared study policy → `content/xizong/knowledge/learner/study-policy.json`.
- A3 first-pass attention / Logic-Group closure / Block Recall support → `content/xizong/knowledge/learner/a3-urinary-learning.json`.
- B5 narrow supplemental Source boundary → `content/xizong/knowledge/learner/a3-urinary-b05-external-source-contract.json`.
- Projection / Runtime → `static-web/`.
- A3 Runtime acceptance probe → `static-web/scripts/validate-xizong-a3-runtime.mjs`.
- Historical System Guide is transitional/reference evidence only, not a competing Current owner.

---

## S — PASS

Closure path: **bounded Current reconstruction**.

Accepted owner:

`content/xizong/knowledge/learner/a3-urinary-question-scope.json`

Accepted invariants:

- 243 unique official questions across 2005–2026;
- every selected ID resolves from Current Question Truth;
- zero unresolved membership ambiguities and zero delta from the recovered reviewed candidate;
- System membership does not invent Question→Block / Logic Group / KP relations;
- unavailable historical HLK raw bytes are not falsely claimed as freshly re-hashed.

Validation evidence: GitHub Actions run `34713324100` passed A1 learner contract, A3 owner/inventory, A3 Current Question Truth resolution, A3 boundary/provenance, A2 runtime regressions and Astro build.

Gate-order invariant:

> **S validates stable System identity + Source owner + Current Question Truth. S must not depend on accepted K.**

---

## K — PASS

Accepted owner:

`content/xizong/knowledge/systems/a3-urinary/system.json`

Accepted System model:

- mother model = **灌注 → 滤过量/选择性 → 分段小管处理 → 髓质梯度/末端激素调节 → 尿液证据 → 尿路运送/储存/排空**;
- nine Failure Modes cover perfusion, filtration/Kf, barrier leak, tubular transport, concentration/dilution, immune glomerular injury, infection/inflammation, obstruction and structural/mass/trauma failure;
- judgment axes preserve first-fault localization and syndrome/pattern/etiology distinctions before precision details;
- dependency route preserves normal-function foundations before evidence language and disease branches;
- System Recall restores the neutral mother model and reverse-localizes cases before drugs, thresholds, procedures and Source Precision;
- higher endocrine, immune, tumor-general, ICU/fluid-resuscitation and cardio-pulmonary-renal SuperSystem models remain external boundaries.

No Block reopen was required.

K CI also exposed and closed a shared gate inversion: Chat-approved System ownership no longer implies Astro projectability. Shared Xizong runtime requires scoped `P PASS` before a System may be projected. GitHub Actions run `34716982717` passed A1/A2 regressions, all A3 Source validators and Astro build after that correction.

---

## L — PASS

Accepted learner path:

```text
System orientation in KianOS
→ B1…B14 in the accepted direct route
→ current Block focus / stop-line / ordered Logic Group
→ continuous original Lecture contact on iPad / MarginNote
→ active retrieval only after relevant formal learning contact
→ Logic Group closure
→ Block Recall
→ after all 14 Blocks are actually learned: pre-question System Recall
→ official A3 System question sweep from the accepted 243-question scope, preserving learner-selected whole-paper holdout
→ Wrong / Uncertain smallest-sufficient repair through reviewed relations only
→ short post-question System reconstruction
```

Surface ownership:

- **iPad / MarginNote** → primary continuous Lecture/source reading, original figures/tables, annotation, source-local examples and Lecture-attached questions;
- **KianOS** → System/Block orientation, attention boundaries, selective cues, active Recall, closure, compression, W/U routing and later review;
- **Chat** → adaptive explanation, linking and repair; not the default continuous Lecture reader.

Important L invariants:

- KianOS must not become a second primary Lecture reader;
- Lecture-attached questions remain on the original Lecture/MarginNote surface;
- System Recall is never authorized before the real learner has completed the System;
- official System questions do not own the learning sequence and do not create inferred Question→KP relations;
- B5 project Lectures remain Primary; admitted external material is narrow supplementation for expected compensation / mixed acid-base diagnosis only;
- L PASS is path acceptance, not evidence that Kian has begun A3.

Validation evidence: GitHub Actions run `34717326529` passed A1/A2 regressions, all A3 Source validators and Astro build after the lane-level surface-ownership correction.

---

## P — PASS

Accepted projection owners:

- shared System/Block loader → `static-web/src/lib/xizong.mjs`;
- projection text filter → `static-web/src/lib/xizongProjection.mjs`;
- System page → `static-web/src/pages/xizong/[system]/index.astro` + `XizongSystemV6.astro`;
- Block page → `static-web/src/pages/xizong/[system]/[block].astro` + `XizongBlockV6.astro`;
- original-Lecture handoff / local companion state → `XizongStudyEnhancer.astro`;
- later official-question sweep → `static-web/src/lib/xizongQuestions.mjs` + System Exit components.

Accepted behavior:

- System projection foregrounds Mother Model, variables/relations, judgment axes, Failure Modes and B1→B14 route rather than reproducing a second textbook;
- Block projection foregrounds focus / stop-line / Logic Group continuity, while full web Core remains need-based reference;
- the learner dock explicitly points to `iPad / MarginNote · 原讲义定位`;
- Lecture-attached questions stay external-primary;
- first-pass compact System Recall stays hidden and the later System Recall + official-question workspace stays downstream/collapsed;
- the 243-question sweep loads Current Question Truth directly and does not fabricate missing Question→Block/KP relations;
- the shared loader supports canonical A3 prefixed `..._BlockN_...md` files without duplicate assets;
- scoped `P PASS` is the projectability gate; learning-support lifecycle labels do not become a second P gate.

Validation evidence:

- run `34717668942` (#172) passed all A1/A2/A3 validators + Astro build while A3 was actually projectable;
- final P head run `34717759514` (#174) passed again after formal `P PASS` and cursor move to R.

---

## R — PASS

Accepted Runtime owners include:

- `static-web/src/components/XizongBlockV6.astro`;
- `static-web/src/components/XizongStudyEnhancer.astro`;
- `static-web/src/components/XizongRuntimeStageGuard.astro`;
- `static-web/src/components/XizongBlockEvidenceGuard.astro`;
- `static-web/src/components/XizongSystemExitRuntime.astro`;
- `static-web/src/components/XizongSystemRepairReturn.astro`;
- `static-web/src/components/XizongSystemEvidenceGuard.astro`;
- `static-web/src/components/XizongMemoryReviewV6.astro`;
- `static-web/src/components/XizongLastLocation.astro`;
- `static-web/scripts/validate-xizong-a3-runtime.mjs`.

Runtime acceptance basis:

1. **Local state is honest and resumable:** each Block persists its stage / Logic Group / KP / learned / Recall / Block Recall / completed state in browser-local state, while `XizongLastLocation` preserves the last learner location. No claim is made that this is cross-device or server-synced progress.
2. **External Lecture contact remains explicit rather than inferred:** Runtime cannot observe MarginNote directly. The learner explicitly confirms the original Lecture round; final Block completion remains blocked until that confirmation and the accepted Core gates are present.
3. **KP Recall cannot manufacture learning:** a KP rating is rejected unless that KP has already recorded formal learning contact. Free navigation remains available; only evidence-producing actions are gated.
4. **Block completion preserves the accepted first-pass contract:** all KPs must have learning contact and first Recall, Block Recall must be completed, and original-Lecture contact must be confirmed before the Block can close.
5. **System Recall cannot manufacture a learned System:** recording System Recall completion requires all 14 accepted Blocks to be completed. The System area may still be freely viewed before then.
6. **System question entry has two independent prerequisite layers:** `XizongSystemExitRuntime` requires a completed System Recall + learner-selected whole-paper holdout, while `XizongRuntimeStageGuard` directly re-checks 14/14 Block completion when the sweep is started.
7. **Stale System evidence is now version-safe:** the System evidence version includes the Current System hash, A3 learning-support hash, a deterministic hash of every projected Block id/path/source content, question scope/inventory hashes and question explanation/relation evidence. Any relevant Current content change archives and invalidates old System Recall, sweep, repair state and question-derived Block review plans before continuing.
8. **Block evidence remains version-safe:** Block source / System source / learning-support changes archive stale local Block evidence rather than silently treating it as Current.
9. **Stable correct question work has a clean path:** stable correct answers can continue without manufactured repair or review debt; W/U alone enter the repair handoff.
10. **Repair return is executable and bounded:** imported Chat plans are restricted to actual current W/U question IDs; precise repair tasks are emitted only where reviewed relations provide Block + primary KP identity; missing mappings remain missing rather than guessed.
11. **Repair evidence does not overwrite mastery:** returned Chat repair tasks are recorded as `CHAT_PLAN_REVIEW` / `REPAIR_ONLY`, preserving original first-pass Recall evidence.
12. **Runtime state remains Learner Truth/evidence:** no browser action mutates medical Core, Acceptance Truth or Source ownership, and R PASS does not infer that Kian has actually started A3.

A real R defect was closed during this audit:

> Before R acceptance, a Block source update could reset the Block locally while an older System Recall/sweep remained current because System evidence versioning did not include Block contents. System evidence now versions all projected Block contents and the System learning-support owner, and the sweep action also directly re-checks whole-System completion.

Durable validation was added to the normal Xizong QA:

`static-web/scripts/validate-xizong-a3-runtime.mjs`

It loads and validates the Current A3 Runtime surface as **14 Blocks / 257 KPs / 75 Logic Groups / 243 official questions** and asserts the Lecture, KP/Block/System Recall, sweep, version-invalidation, W/U repair and resume contracts above.

Validation evidence: PR #45 branch head `f79957276c7682c424b880c419f3b53188e7bf12`, GitHub Actions run `34718165223` (#176) passed:

- `Validate A1 learner contract` → PASS;
- all three A3 Source validators → PASS;
- `Validate A2 runtime contracts` → PASS;
- **`Validate A3 runtime contracts` → PASS**;
- `Build Astro` → PASS.

---

## E / U — UNTESTED

`E` is now the earliest unresolved eligible gate. U remains real-learner-only and downstream-frozen.

Do not infer that Kian has started Urinary.

---

## Truth boundaries

### Artifact Truth

- Source scope → `content/xizong/knowledge/learner/a3-urinary-question-scope.json`
- System Knowledge → `content/xizong/knowledge/systems/a3-urinary/system.json`
- medical Core → `content/xizong/knowledge/systems/a3-urinary/blocks/`
- lane Learning constitution → `content/xizong/LEARNING_CONTRACT.md`
- shared study policy → `content/xizong/knowledge/learner/study-policy.json`
- A3 learning support → `content/xizong/knowledge/learner/a3-urinary-learning.json`
- B5 external Source contract → `content/xizong/knowledge/learner/a3-urinary-b05-external-source-contract.json`
- Projection / Runtime / evidence mechanics → `static-web/`
- Current Question Truth → `content/xizong/questions/`

### Acceptance Truth

This file.

### Learner Truth

Private learner/browser/conversation evidence only. No gate in this file means Kian has begun A3.