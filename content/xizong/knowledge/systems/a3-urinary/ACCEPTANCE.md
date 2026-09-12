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
P  UNTESTED
R  UNTESTED
E  UNTESTED
U  UNTESTED by every real learner path
```

Current allowed conclusion:

> **A3 Source, System-level Knowledge and first-learning path are accepted for the recorded scope. The accepted path is Lecture-first with continuous original-source learning external-primary on iPad / MarginNote, while KianOS owns orientation, active retrieval, closure, compression and repair. A3 is not yet learner-ready because P/R/E remain untested and real User Validation has not occurred.**

---

## Current evidence boundary

- Current System question-scope owner → `content/xizong/knowledge/learner/a3-urinary-question-scope.json`.
- Source owner authority → `CHAT_APPROVED_CURRENT_RECONSTRUCTION`; this is explicitly not a claim that the old historical bytes were recovered exactly.
- Accepted Current membership → **243 unique official-question IDs, 2005–2026**.
- Runtime-sorted membership inventory SHA256 → `bd8082bf9b82d00411f5d3dcaa09f56626c0c08b688e108f728f7da6e2f9b84e`.
- Current Question Truth → **3750 immutable IDs**, inventory SHA256 `0abc1a3cadbb41b36808fe86ff58c21ede6f4297312e9fb4c2da62b865ef2c82`.
- The Source owner preserves System membership only. It does **not** infer Question→Block, Question→LogicGroup or Question→KP relations.
- Current System-level Knowledge owner → `content/xizong/knowledge/systems/a3-urinary/system.json`, authority `CHAT_APPROVED`.
- The accepted System boundary remains **14 canonical Blocks / 257 stable KPs / 75 Logic Groups** with no Block/KP split, merge or renumbering.
- Block/KP medical truth remains owned by `content/xizong/knowledge/systems/a3-urinary/blocks/`; `system.json` only organizes/compresses it at System level.
- Xizong lane-level learning semantics and first-pass surface ownership → `content/xizong/LEARNING_CONTRACT.md` plus detailed shared execution policy in `content/xizong/knowledge/learner/study-policy.json`.
- A3 System-below attention / Logic-Group closure / Block Recall support → `content/xizong/knowledge/learner/a3-urinary-learning.json`. Its own lifecycle text does not self-promote System-level L; scoped Acceptance Truth here owns the L PASS claim.
- `system.json.logic_index` is a structural System index. The learning-support owner controls first-pass attention and compression but does not restate Block/KP medical Core.
- B5 expected-compensation / mixed-disorder Source gap is closed by the narrow admitted external-source contract; existing project Lectures remain Primary for the rest of B5 306 content.
- The historical System Guide is retained as transitional/reference evidence and no longer competes with `system.json` for Current System-level semantics.
- Historical HLK evidence remains reconstruction/reconciliation provenance only. `HLK_SYSTEM_QUESTION_INDEX_v1.jsonl` raw bytes could not be freshly re-hashed because source transport returned 403; no exact-byte claim is made.

---

## Gate boundary

### S — PASS

Closure path used: **Path B — bounded Current reconstruction**.

Accepted owner:

`content/xizong/knowledge/learner/a3-urinary-question-scope.json`

Acceptance basis:

1. the recovered reviewed HLK resolver candidate supplies the exact 243-question membership set rather than a count-only guess;
2. historical urinary range/source authority covers the same 2005–2026 official-question window and all 14 accepted A3 Block identities;
3. historical QA records one primary route per canonical ID, no ownership violation, no source-gap violation and unchanged canonical content;
4. the recovered candidate is reconciled to the Current immutable `xizong-official-YYYY-nNNN` namespace;
5. the Current owner defines explicit inclusion/exclusion rules and records zero unresolved membership ambiguities and zero delta from the recovered candidate;
6. Current runtime validation expands the owner deterministically and resolves every selected ID from Current Question Truth.

Validation evidence on branch commit `e5f3afc34844e3a168e98c2d0f4fd8f157ef99c2`, GitHub Actions run `34713324100`:

- `Validate A1 learner contract` → PASS;
- `Validate A3 owner and inventory` → PASS;
- `Validate A3 Current Question Truth resolution` → PASS;
- `Validate A3 boundary and provenance` → PASS;
- `Validate A2 runtime contracts` → PASS;
- `Build Astro` → PASS.

Gate-order invariant retained:

> **S validates stable System identity + Source owner + Current Question Truth. S must not require accepted System-level K.**

This preserves `S → K → L → P → R → E → U` and prevents Source acceptance from depending on a later gate.

### K — PASS

Accepted System owner:

`content/xizong/knowledge/systems/a3-urinary/system.json`

Bounded System-level audit basis:

1. the accepted 14-Block / 257-KP / 75-Logic-Group substrate was preserved exactly; no stable Block/KP identity change was introduced;
2. the mother model correctly unifies **灌注 → 滤过量/选择性 → 分段小管处理 → 髓质梯度/末端激素调节 → 尿液证据 → 尿路运送/储存/排空** rather than reproducing physiology, internal medicine and urology as separate teacher-order silos;
3. the nine System Failure Modes cover perfusion failure, filtration-driving/Kf failure, filtration-barrier leak, tubular transport failure, concentration/dilution failure, immune glomerular injury, tubulointerstitial/urinary infection-inflammation, urinary obstruction and structural/mass/trauma failure;
4. the judgment axes preserve the high-value discriminations needed before disease-specific precision: prerenal/intrinsic/postrenal, filtration amount vs barrier leak, glomerular vs tubulointerstitial vs outlet, volume vs tonicity/electrolyte/acid-base, acute vs chronic, syndrome vs LM/IF/EM pattern vs etiology, and stability/danger before precision;
5. the dependency DAG is consistent with the accepted Block substrate: normal renal processing precedes evidence language and disease branches; the glomerular dual-coordinate model precedes nephritic/nephrotic branches; outlet/obstruction knowledge precedes downstream urologic tumor/trauma integration;
6. the System Recall skeleton can reconstruct the neutral mother model and reverse-localize a case before invoking drugs, thresholds, procedures or Source Precision;
7. System boundaries explicitly route higher-order endocrine, immune, tumor-general, ICU/fluid-resuscitation and cardio-pulmonary-renal SuperSystem models outward rather than duplicating them;
8. targeted reconciliation against the transitional System Guide and accepted Block/Core material found no System-level semantic blocker requiring a Block reopen. Legacy Guide detail is not promoted merely because it existed historically when the accepted Current Core does not own it as a stable first-pass object.

The historical System Guide therefore remains reference/provenance only. It is not a second Current System owner.

The K branch also exposed and closed a shared gate inversion: Chat-approved System ownership no longer implies Astro projectability. Shared runtime now requires scoped `P PASS` before a System is projected. GitHub Actions run `34716982717` passed A1/A2 regressions, all A3 Source validators and Astro build after that correction.

K PASS does **not** establish projection, runtime, evidence semantics or real learner validation.

### L — PASS

Accepted learning owners/evidence:

- lane constitution → `content/xizong/LEARNING_CONTRACT.md`;
- detailed shared policy → `content/xizong/knowledge/learner/study-policy.json`;
- A3 attention / closure / compression support → `content/xizong/knowledge/learner/a3-urinary-learning.json`;
- accepted System organization and default Block route → `content/xizong/knowledge/systems/a3-urinary/system.json`;
- narrow B5 supplemental Source boundary → `content/xizong/knowledge/learner/a3-urinary-b05-external-source-contract.json`.

Bounded Learning audit basis:

1. **Natural first-pass units are explicit:** System orientation → direct canonical Block route B1→B14 → ordered Logic Groups → stable KPs. Block is the main continuous learning unit; Logic Group protects local continuity; KP identity does not force isolated-card learning or page order.
2. **First-pass surface ownership is explicit:** continuous original Lecture/source learning is external-primary on iPad / MarginNote. KianOS owns orientation, attention boundaries, selective cues, active Recall, closure, compression, repair and later review. Chat is adaptive explanation/repair, not the default continuous Lecture reader.
3. **Lecture continuity is protected:** KianOS cues what to solve and where to stop, then the learner returns to the original Lecture for full explanation/figures/tables/source context. Lecture-attached companion questions remain on the original Lecture/MarginNote surface; KianOS does not re-host them as a second primary course.
4. **A3 first-pass order is causally sensible:** B1–B6 establish normal renal processing, homeostasis and evidence language before AKI/CKD and disease branches; B9 establishes the glomerular clinical/pathology dual-coordinate model before B10/B11; outlet/obstruction knowledge precedes later urologic tumor/trauma integration. The accepted direct B1→B14 route is the default first-pass traversal even where the dependency DAG contains parallel-ready branches, reducing avoidable switching.
5. **Every Block has a bounded learner contract:** `first_pass_focus` tells what problem matters now; `stop_line` prevents future owners from invading working memory; ordered Logic Group goals/closures preserve continuity; `recall_spine` compresses the Block after local learning.
6. **Recall timing does not outrun source contact:** active KP retrieval occurs only after the relevant material has been formally learned; each canonical KP must receive at least one first-pass active Recall before Block completion, without requiring one imperfect first Recall to freeze the mainline indefinitely. Logic Group closure follows the learned local model; Block Recall follows the Block; System Recall occurs only after the 14-Block System has actually been learned.
7. **Question entry is explicit and later than learning:** the official A3 System sweep enters only after pre-question System Recall. It uses the accepted 243-question System scope while preserving learner-selected whole-paper holdout material. Stable correct/reasoned work may pass quickly; Wrong / Uncertain evidence is retained and routed only through reviewed relations; no Question→Block/KP relation may be guessed from membership or intuition.
8. **Repair returns to the mainline:** Wrong / Uncertain → first meaningful failure → smallest sufficient repair → reconstruction when needed → return to the interrupted System path. A short post-question System reconstruction confirms that question exposure did not replace the learner's own model.
9. **B5 has a bounded external exception rather than a source substitution:** project Lectures remain Primary for 306 water/Na/K/Ca, renal acid handling and source-specific treatment Precision; admitted external sources only close expected compensation / mixed-disorder diagnosis and may not expand into general nephrology/ICU treatment.
10. **Learning evidence stays separate from engineering state:** this L PASS establishes an approved path only. It does not mean Kian has opened B1, contacted any Lecture, completed Recall, attempted A3 questions or generated any private learner evidence.

No material learner action remains without a primary surface decision at L. Projection must now implement this path rather than infer a different one from existing Astro capabilities.

### P / R / E / U — UNTESTED

`P` is now the earliest unresolved eligible gate. `R/E/U` remain downstream-frozen until their actual dependencies pass.

Do not treat A3 as learner-ready and do not infer that Kian has started Urinary.

---

## Truth boundaries

### Artifact Truth

- accepted Source scope owner → `content/xizong/knowledge/learner/a3-urinary-question-scope.json`
- Current System-level Knowledge owner → `content/xizong/knowledge/systems/a3-urinary/system.json`
- Xizong lane learning constitution / surface ownership → `content/xizong/LEARNING_CONTRACT.md`
- detailed shared study policy → `content/xizong/knowledge/learner/study-policy.json`
- A3 first-pass attention / closure / compression support → `content/xizong/knowledge/learner/a3-urinary-learning.json`
- B5 admitted external source boundary → `content/xizong/knowledge/learner/a3-urinary-b05-external-source-contract.json`
- transitional/reference System guide → `content/xizong/knowledge/system-guides/西综泌尿系统_System_Guide_v1_完整导学_认知依赖与学习顺序.md`
- canonical medical Core → `content/xizong/knowledge/systems/a3-urinary/blocks/`
- Current Question Truth → `content/xizong/questions/`

### Learner Truth

Private learner/browser/conversation evidence only. This acceptance does not mean Kian has started Urinary.