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
P  PASS — BRANCH_CANDIDATE; requires branch CI/projectability verification before merge
R  UNTESTED
E  UNTESTED
U  UNTESTED by every real learner path
```

Current branch conclusion:

> **A3 Source, Knowledge and Learning are accepted. The learner Projection is a branch candidate now being exercised as a real projectable System; do not treat P as merged Acceptance Truth until A3 enters the static build successfully and regression checks remain green.**

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
- no claim that unavailable historical HLK raw bytes were freshly re-hashed.

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

K CI also exposed and closed a shared gate inversion: Chat-approved System ownership no longer implies Astro projectability. Shared Xizong runtime now requires scoped `P PASS` before a System may be projected. GitHub Actions run `34716982717` passed A1/A2 regressions, all A3 Source validators and Astro build after that correction.

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

GitHub Actions run `34717326529` passed A1/A2 regressions, all A3 Source validators and Astro build after the lane-level surface-ownership correction.

---

## P — PASS candidate on this branch

Projection owners under audit:

- shared System/Block loader → `static-web/src/lib/xizong.mjs`;
- projection text filter → `static-web/src/lib/xizongProjection.mjs`;
- System page → `static-web/src/pages/xizong/[system]/index.astro` + `XizongSystemV6.astro`;
- Block page → `static-web/src/pages/xizong/[system]/[block].astro` + `XizongBlockV6.astro`;
- explicit original-Lecture handoff / local companion state → `XizongStudyEnhancer.astro`;
- later official-question sweep → `static-web/src/lib/xizongQuestions.mjs` + System Exit components.

Candidate acceptance basis:

1. **System projection foregrounds the accepted System model rather than a teacher-order textbook:** Mother Model, causal spine, parallel controls, core variables/relations, judgment axes, Failure Modes and the B1→B14 route are primary. First-pass compact System Recall is hidden; System Recall + official questions remain in a collapsed later-stage System Exit.
2. **Block projection foregrounds attention and continuity:** current Block focus, stop-line and Logic Group goal/closure are primary. Full Block orientation, complete web Core and visual/reference material are subordinate/expand-on-demand rather than the default reading surface.
3. **The primary Lecture surface is visible and honest:** the learner dock explicitly says `iPad / MarginNote · 原讲义定位`; the completion contact refers to the original Lecture, while web Core is described as need-based reference.
4. **Lecture-attached questions stay external-primary:** the Block surface tells the learner to do companion questions in the original Lecture and does not fabricate bindings.
5. **Recall does not leak answers by default:** KP Recall requires reveal before Core is shown; Block Recall asks for reconstruction before optional spine/group checks.
6. **Later System questions remain downstream:** the System page labels them as a later stage after System learning + System Recall. The sweep loads the accepted 243-question scope directly from Current Question Truth. Missing/unreviewed fine-grained relations remain null; Projection does not require or fabricate Question→Block/KP mappings.
7. **A3 filename shape is now a supported projection input:** the shared loader resolves both `BlockN_...md` and prefixed `..._BlockN_...md` files without renaming medical assets or creating duplicate copies.
8. **Acceptance Truth remains the projection gate:** `P PASS` in scoped `ACCEPTANCE.md` decides projectability. A System-specific learning-support lifecycle label is not allowed to become a second independent P gate; the loader still requires Chat-approved learning support identity and complete Block/Logic Group coverage.
9. **Existing A1/A2 behavior is intended to remain unchanged:** the shared fixes broaden accepted filename/lifecycle handling but do not bypass their P gate, change their medical content or infer learner state.
10. **P does not claim Runtime closure:** exact state transitions, stage ordering, persistence semantics, event evidence and completion guards remain R work. In particular, P does not use the existing implementation of KP-Recall timing as proof that R is accepted.

Branch-candidate condition:

> This section becomes merged `P PASS` only after CI actually includes A3 as projectable and successfully builds the A3 System page plus all 14 Block pages while A1/A2 regressions remain green.

---

## R / E / U — UNTESTED

R/E/U remain downstream-frozen until P is formally verified and merged.

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
- Projection/Runtime code → `static-web/`
- Current Question Truth → `content/xizong/questions/`

### Acceptance Truth

This file.

### Learner Truth

Private learner/browser/conversation evidence only. No gate in this file means Kian has begun A3.