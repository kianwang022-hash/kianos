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
E  PASS
U  UNTESTED by every real learner path
```

Current allowed conclusion:

> **A3 is module-ready for learner test. Source, Knowledge, Learning, Projection, Runtime and Evidence are accepted for the recorded scope. U remains untested because no engineering build, CI run, simulated journey or architecture review can substitute for Kian actually using the path. Do not infer that Kian has started Urinary.**

---

## Current evidence boundary

- Source scope owner → `content/xizong/knowledge/learner/a3-urinary-question-scope.json`.
- Accepted Source membership → **243 unique official-question IDs, 2005–2026**; runtime-sorted inventory SHA256 `bd8082bf9b82d00411f5d3dcaa09f56626c0c08b688e108f728f7da6e2f9b84e`.
- Current Question Truth → **3750 immutable IDs**, inventory SHA256 `0abc1a3cadbb41b36808fe86ff58c21ede6f4297312e9fb4c2da62b865ef2c82`.
- Current System-level Knowledge owner → `content/xizong/knowledge/systems/a3-urinary/system.json`, authority `CHAT_APPROVED`.
- Accepted stable substrate → **14 canonical Blocks / 257 stable KPs / 75 Logic Groups**, no Block/KP split, merge or renumbering.
- Block/KP medical truth → `content/xizong/knowledge/systems/a3-urinary/blocks/`.
- Lane learning constitution / first-pass surface ownership → `content/xizong/LEARNING_CONTRACT.md`.
- Shared study policy → `content/xizong/knowledge/learner/study-policy.json`.
- A3 learning support → `content/xizong/knowledge/learner/a3-urinary-learning.json`.
- B5 narrow supplemental Source boundary → `content/xizong/knowledge/learner/a3-urinary-b05-external-source-contract.json`.
- Projection / Runtime / Evidence mechanics → `static-web/`.
- A3 Runtime acceptance probe → `static-web/scripts/validate-xizong-a3-runtime.mjs`.
- A3 Evidence acceptance probe → `static-web/scripts/validate-xizong-a3-evidence.mjs`.
- Shared repair-inbox contract probe → `static-web/scripts/validate-xizong-repair-inbox.mjs`.
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

Validation evidence: GitHub Actions run `34713324100` passed the Source closure suite.

Gate-order invariant:

> **S validates stable System identity + Source owner + Current Question Truth. S must not depend on accepted K.**

---

## K — PASS

Accepted owner:

`content/xizong/knowledge/systems/a3-urinary/system.json`

Accepted System model preserves:

- mother model = **灌注 → 滤过量/选择性 → 分段小管处理 → 髓质梯度/末端激素调节 → 尿液证据 → 尿路运送/储存/排空**;
- nine Failure Modes covering perfusion, filtration/Kf, barrier leak, tubular transport, concentration/dilution, immune glomerular injury, infection/inflammation, obstruction and structural/mass/trauma failure;
- first-fault localization and syndrome/pattern/etiology judgment axes before precision details;
- normal-function foundations before evidence language and disease branches;
- System Recall that restores the neutral mother model and reverse-localizes cases before drugs, thresholds, procedures and Source Precision;
- higher endocrine, immune, tumor-general, ICU/fluid-resuscitation and cardio-pulmonary-renal SuperSystem models as external boundaries.

No Block reopen was required.

K also closed the shared gate inversion where Chat-approved System ownership accidentally implied Astro projectability. Scoped `P PASS` is now required before projection. Validation evidence: run `34716982717`.

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

Validation evidence: run `34717326529`.

---

## P — PASS

Accepted projection owners include the shared Xizong loader/projection helpers, System/Block pages, `XizongSystemV6.astro`, `XizongBlockV6.astro`, `XizongStudyEnhancer.astro`, and the later System Exit components.

Accepted behavior:

- System projection foregrounds Mother Model, variables/relations, judgment axes, Failure Modes and B1→B14 route rather than reproducing a second textbook;
- Block projection foregrounds focus / stop-line / Logic Group continuity, while full web Core remains need-based reference;
- the learner dock explicitly points to `iPad / MarginNote · 原讲义定位`;
- Lecture-attached questions stay external-primary;
- first-pass compact System Recall stays hidden and later System Recall + official questions remain downstream/collapsed;
- the 243-question sweep loads Current Question Truth directly and does not fabricate missing Question→Block/KP relations;
- the shared loader supports canonical A3 prefixed `..._BlockN_...md` files without duplicate assets;
- scoped `P PASS` is the projectability gate.

Validation evidence: run `34717668942` (#172) and final P-head run `34717759514` (#174).

---

## R — PASS

Runtime acceptance preserves:

- browser-local resumable state without pretending it is cross-device/server progress;
- explicit learner confirmation of external original-Lecture contact;
- KP Recall only after formal KP learning contact;
- Block Recall only after complete KP Learn + Recall;
- Block completion only after Lecture contact + KP Learn/Recall + Block Recall;
- System Recall completion only after all 14 Blocks complete;
- System sweep only after whole-System completion, current System Recall and learner-selected whole-paper holdout;
- stable correct question work has a direct no-repair path;
- W/U only enter repair;
- precise repair is reviewed-relation-only and missing mappings stay missing;
- learner state never mutates medical Core, Source or Acceptance Truth.

A real R defect was closed: System evidence versioning now includes Current System hash + A3 learning-support hash + deterministic hash of all 14 projected Block id/path/source contents + question scope/inventory/explanation/relation evidence. A changed Block therefore invalidates old System Recall/sweep/repair evidence rather than leaving it falsely current.

Durable Runtime validation lives in `static-web/scripts/validate-xizong-a3-runtime.mjs`.

Validation evidence: run `34718165223` (#176) and final R-head run `34718263667` (#178).

---

## E — PASS

Evidence acceptance is based on the current shared Block/System evidence model plus the A3-specific probe.

Accepted evidence semantics:

1. **Normal Block evidence has one writer.** `XizongMemoryReviewV6.astro` owns normal KP Recall history, Memory state, Chat repair plan state, repair ratings and Study Packet evidence. `XizongBlockEvidenceGuard.astro` owns Current-version archival/reset only; it does not compete for normal evidence writes.
2. **Every real Recall attempt is evidence.** Each actual KP Recall rating click appends a `KP_RECALL` event, including repeated identical ratings. Existing browser state may be bootstrapped once, but bootstrap deduplication must not collapse later genuine attempts.
3. **First Recall is not rewritten by repair.** Weak Recall may enter selective Memory. Memory `STABLE` can clear the current weak queue, but the original Recall remains historically intact.
4. **Repair is not mastery.** Chat-plan review and System W/U repair imports are explicitly `REPAIR_ONLY`. `known/mastered` may close an active repair task but cannot rewrite original Recall or auto-promote mastery. Stronger closure requires later meaningful fresh Recall/transfer when the learning contract calls for it.
5. **Stable correct work does not manufacture debt.** Stable correct System-question work has a direct pass path. Only Wrong / Uncertain enter the repair handoff.
6. **W/U routing preserves truth boundaries.** Chat returns are scoped to actual current W/U question IDs. Block/KP delivery uses repository-reviewed relations only; absent precise relations remain absent.
7. **System→Block repair is cross-tab safe.** The System page writes an independent `repair inbox`, not the Block evidence store. `XizongRepairInboxBridge.astro` consumes the inbox into the owning Block evidence store, scopes plans to real current Block KP IDs, records question provenance and `REPAIR_ONLY`, and reloads the Block so stale in-memory state cannot overwrite newly imported repair evidence.
8. **Repair-inbox consumption is fail-closed and idempotent.** The Block evidence store must be written successfully before the inbox is cleared. Repeated delivery is deduplicated by inbox identity rather than silently duplicating import evidence.
9. **Open Block tabs receive repair safely.** The bridge listens for the browser `storage` event; a repair sent from the System page can be consumed by an already-open Block tab without requiring the learner to reconstruct the interrupted path manually.
10. **Stale evidence fails closed.** Block source/System source/learning-support changes archive and invalidate Block progress/evidence and pending repair inbox. System-level content/question-evidence changes archive/invalidate System Recall, sweep, repair state, question-derived Block plans and pending Block repair inboxes.
11. **System Recall phases stay distinguishable.** Evidence records PRE_QUESTION / MID_SWEEP / POST_QUESTION rather than flattening every System Recall into the same event.
12. **Holdout remains private learner strategy.** Learner-selected full-paper years are browser-private and excluded wholesale from the ordinary System sweep; shared Current never hard-codes Kian's chosen years.
13. **Evidence granularity does not force workflow granularity.** Internal KP/question evidence may be fine-grained, while the learner-facing path remains Block / Logic Group / System oriented rather than turning first learning into compulsory isolated cards.
14. **Learner evidence remains private.** Progress, Recall history, Memory, W/U results, notes, holdout choices and repair state remain browser/conversation Learner Truth and do not mutate Artifact or Acceptance Truth.

A real E defect was closed during this audit:

> Multiple components/pages could write the same Block evidence document. This could collapse repeated Recall evidence or allow stale in-memory state to resurrect/overwrite repair tasks. Normal Block evidence is now single-writer, while cross-page System→Block repair uses an atomic inbox/bridge handoff with write-before-clear, provenance, idempotency and version invalidation.

Durable validation:

- `static-web/scripts/validate-xizong-a2-evidence.mjs` → shared A2 Evidence regression;
- `static-web/scripts/validate-xizong-a2-repair-return.mjs` → shared repair-return regression;
- `static-web/scripts/validate-xizong-repair-inbox.mjs` → shared inbox/bridge contract;
- `static-web/scripts/validate-xizong-a3-runtime.mjs` → A3 Runtime regression after Evidence changes;
- `static-web/scripts/validate-xizong-a3-evidence.mjs` → A3 Evidence acceptance.

Validation evidence: PR #46 candidate head `c3d68ccbc88a592c54eee3dbd9e5154da789b53d`, GitHub Actions run `34720315859` (#194) completed successfully with:

- `Validate A1 learner contract` → PASS;
- all three A3 Source validators → PASS;
- `Validate A2 runtime contracts` → PASS;
- `Validate shared repair inbox contract` → PASS;
- `Validate A3 runtime contracts` → PASS;
- **`Validate A3 evidence contracts` → PASS**;
- `Build Astro` → PASS.

Runs `34718609160` (#180) and `34719882688` (#181) were superseded failed candidates caused by stale A1 validator expectations during the Evidence-contract migration; they failed before the A3 Evidence step executed and are not A3 Evidence failure evidence.

---

## U — UNTESTED

All engineering acceptance gates are now closed:

```text
S / K / L / P / R / E = PASS
```

The strongest allowed readiness statement is:

> **A3 is module-ready for learner test.**

U requires real learner use. It cannot be closed by CI, simulated clicks, architecture review, another model, or this Acceptance document.

When Kian actually begins A3, validate the real path as used, for example:

- first-learning / MarginNote handoff / return;
- KP + Block Recall flow;
- resume across study sessions;
- later System Recall → official-question sweep;
- Wrong / Uncertain → Chat → repair inbox → owning Block → return to questions;
- sustained friction, density and surface ownership in real study.

Do not infer that any of these paths have already occurred.

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
- Projection / Runtime / Evidence mechanics → `static-web/`
- Current Question Truth → `content/xizong/questions/`

### Acceptance Truth

This file.

### Learner Truth

Private learner/browser/conversation evidence only. No engineering gate in this file means Kian has begun A3.