# English Final Learner Acceptance — Current Integration Result

Status: **BLOCKED FOR RELEASE — engineering acceptance passed for the named tested boundaries; bounded Source + Mac Human Gate remain; learner U is UNTESTED**  
Integration PR: **#498** — `work/english-final-integration-20260919-v3`  
Current reconciliation base: `main@d7406f578677bcd6e7944223dfb02f4000014872`  
Latest product-proof head: `d6323cb318e653f53197e3ea09eeb15a7d122e4d`  
Standard: `LEARNING_ACCEPTANCE.md`; execution brief: `FINAL_LEARNER_ACCEPTANCE_BRIEF.md`.

This file records the English-wide Current integration result after fresh independent audit, repair, targeted proof, bounded regression and reconciliation. Child Acceptance owners still own local module claims. CI and synthetic fixtures are engineering evidence only; they never manufacture learner history.

## 1. Final learning-design judgment

**Learning Logic: PASS.**

Retain task-first learning with targeted, skippable First Learning. A learner who can already execute a task does not need compulsory Guide completion; a learner who cannot execute it receives the smallest effective continuous learning model for that capability.

Natural units remain source-native:

- Reading A: one passage + its full question set;
- Cloze: one passage + all blanks;
- Part B: one complete source-native mapping task;
- Translation: one complete set;
- Writing: one complete essay task.

`current question` is a focus cursor, not permission to hide the rest of a Reading A question set. Wrong / Uncertain is evidence, not automatic diagnosis, repair debt or a mandatory Chat session. Chat owns cross-task strategy; the website may execute validated explicit instructions but must not invent priorities.

## 2. English-wide path verdicts

| Path / claim | Current verdict |
| --- | --- |
| Reading A | **PASS.** Full question set remains visible; one current question is only keyboard / attention focus. Exact attempt + source identity is required for return paths. |
| Cloze | **PASS.** Continuous passage context and all blanks remain one task; strengthened return identity does not convert a new material into an assumed fresh attempt. |
| Part B | **PASS.** Gap / heading / ordering / comment forms retain distinct cognition, fixed-given rules and source-native candidate policy. |
| Objective Runtime / Evidence | **PASS.** Old test assumptions were reconciled to Current rules: exact attempt/source identity, no automatic fresh-on-material-change, and rejected stale/invalid return is correctly treated as rejection. Latest Objective Learner Journey is green. |
| Translation | **PASS for tested runtime/evidence paths.** Five-segment first attempt, whole-source context, reference gate, immutable first output, exact typed return and learner reconstruction remain intact. |
| Writing | **Engineering PASS; release presentation still gated.** Direct mode does not invent a plan; Planned mode preserves the learner's real plan; first draft/regeneration/return identity persist; no automatic ghostwriting. Material entry/original-image presentation still needs Kian Mac Human Gate. |
| English ↔ Lexical | **PASS for the tested handoff boundary.** Exact Current target / ordinal / revision / demand is preserved; lookup stays state-neutral; replay is idempotent; Recognition cannot close Production; return is exact and all-or-nothing. |
| Chat Resume | **PASS.** Current catalog validation, stale/future/duplicate/conflict rejection, atomic import, idempotent replay, explicit ordering and free navigation are preserved. |
| Whole paper | **PASS for tested session mechanics.** One absolute 180-minute session, nine task instances, autosave capture, irreversible Seal, objective release out of 60, and original productive outputs for Chat review. No fake subjective auto-score. |
| Shared durability | **PASS for the tested English + Lexical private checkpoint boundary.** Unsafe remote read cannot write; subject payloads round-trip; conflicting local evidence wins; restore is atomic. |
| Navigation | **PASS.** English hierarchy remains coherent after Objective / Translation / Writing / Vocabulary / External Reading integration. |
| External Reading | **PASS as an executable continuous Content lane for the implemented boundary.** TPO 56–65 is the primary growth pool and IELTS Academic 17–19 secondary. Public repo owns identity/inventory/compiler/runtime; copyrighted bytes stay in the private Mac source bundle. Compatible surfaces reuse the Reading-family architecture while preserving source-native cognition. This does **not** replace 考研 Reading A strategy. |
| Mac presentation | **BLOCKED pending Kian Human Gate.** Material changed learner-facing presentation cannot be accepted by CI on Kian's behalf. |
| Learner U | **UNTESTED.** No synthetic fixture, recovered source, screenshot or CI run counts as Kian having learned or attempted the material. |

## 3. What was actually repaired

1. **Objective return identity and old-test drift.** Runtime correctly requires exact attempt/source identity. Historical depth tests were updated so they no longer assume identity-less return, automatic freshness after changing material, or successful import of a return that Current runtime deliberately rejects.
2. **Writing source deliverability.** Original-image Source truth is rendered from exact verified bytes where available; mismatching bytes fail closed; engineering prose is not appended to learner prompts.
3. **Writing entry / calibration.** Calibration is targeted and skippable rather than a permanent unlock gate.
4. **First evidence safety.** Immutable first attempt/output, consumed source revision, stale-write rejection and exact return identity prevent later state from rewriting history.
5. **Chat-controlled session import.** Invented IDs, duplicate steps, conflicting replay and stale instructions are rejected atomically.
6. **Whole-paper state boundaries.** Duration/deadline, late capture, stale-tab reopen, release replay and unfinished autosave at Seal were repaired.
7. **Exposure truth.** Ordinary study and mock share material identity; unknown is not unseen; later lookup cannot rewrite first-attempt conditions.
8. **Lexical lookup side effects.** English lookup mode no longer mutates coverage / ledger / lineage merely by inspecting a target.
9. **Demand identity.** Exact Current target + demand + attempt identity is validated before evidence commit.
10. **External Reading product boundary.** Inventory-only status was replaced by an executable continuous Content lane with manifest/schema, compiler, private-source bridge/store and synthetic browser/session proofs. No protected fresh learner material was consumed for engineering verification.
11. **Shared durability.** English and Lexical private learner payloads now participate in one shared atomic checkpoint boundary rather than an English-only persistence fork.

## 4. External Reading — frozen interpretation

External Reading exists to add authoritative reading volume beyond the finite 考研真题 pool and to support later TOEFL preparation.

Current pool policy:

- **TOEFL TPO 56–65:** primary;
- **IELTS Academic 17–19:** secondary.

The architecture is deliberately boring:

```text
source package
→ normalized manifest / object identity
→ private source bytes on Mac
→ Reading-family learner surface
→ source-native answer / evidence
→ same English private checkpoint boundary
```

It is a continuously updatable Content layer, analogous to Vocabulary being a continuing content stream. It does not rewrite the canonical cognition of 考研 Reading A. TOEFL / IELTS material keeps its own task semantics while sharing compatible shell/runtime infrastructure.

## 5. Source availability

Verified candidate Writing source-ready set remains:

- **22 Small Writing tasks**
- **25 Big Writing tasks**
- **47 total source-ready true-exam Writing tasks**
- **20 structurally complete integrated papers** for the currently complete-year set

Two Big Writing originals remain unavailable with the required exact identity:

| Object | Required SHA-256 | Status |
| --- | --- | --- |
| `english1-2011-writing-b-main` | `dc85eace135fee376e1b21c02d963438256158855a0c720d873805b8163bc461` | exact original bytes still missing |
| `english1-2026-writing-b-main` | `c46e6f7af0a61816a0293440a6ad362d0dcfe64263df3747cb49cb684163b46b` | exact original bytes still missing |

Different bytes must remain rejected rather than accepted by changing the expected hash. Those two Big Writing tasks and dependent whole-paper assemblies stay withheld; unrelated modules are not globally blocked.

## 6. Latest exact-head proof

Latest product-proof head: `d6323cb318e653f53197e3ea09eeb15a7d122e4d`.

Relevant GitHub Actions on that head:

| Workflow | Result |
| --- | --- |
| Objective Learner Journey — run `35417707345` | **PASS** |
| English Family Coherence — run `35417707351` | **PASS** |
| English Exam Session — run `35417707326` | **PASS** |
| Static Web Writing QA — run `35417707329` | **PASS** |
| Static Web Translation QA — run `35417707355` | **PASS** |
| English Navigation Hierarchy — run `35417707359` | **PASS** |
| LexicalOS Current Runtime — run `35417707350` | **PASS** |
| Semantic Base Validity — run `35417707344` | **PASS** |

The Objective pass is the important closure: the main browser journey and the deep Runtime/Evidence assumptions now agree with Current contract semantics.

## 7. Broad-CI isolation

Broad red jobs were inspected rather than used as a reason to expand scope.

- **Lexical Functional First** fails in full-catalog intrinsic/projection integrity with owner-local projection drift and registry/lifecycle drift before it reaches the English↔Lexical bridge steps. It is not evidence that the English handoff regressed.
- **Authority Consistency** reports lane-wide shared-route declarations across English / Xizong / Politics / Lexical. English now routes explicitly through `AUTHORITY_INHERITANCE_CONTRACT.md` and `AUTHORITY_OWNERSHIP.json`; remaining other-lane debt is not an English acceptance blocker.
- **Governance Anti-Entropy** reported English Current at 183 lines plus pre-existing Xizong / Lexical size debt. English Current is compressed by this closure; other-lane debt remains outside scope.
- **Politics QA / Lexical Visual Convergence** are unrelated to English learner acceptance.

No learner rule was weakened merely to make a broad CI job green.

## 8. Reconciliation against Current main and prior evidence

At final reconciliation, PR #498 is **ahead of `main@d7406f578677bcd6e7944223dfb02f4000014872` and behind by 0**. The integration preserves concurrent main work; the shared private-checkpoint overlap was reconciled rather than overwritten.

Earlier child Acceptance remains useful only inside its proven local boundary. The final English-wide answer comes from this integration evidence, not from historical child PASS, old PR #493 status, or a static validator count.

Historical conclusions narrowed by the fresh audit:

- local module PASS does not imply whole-paper / cross-owner / disaster-recovery PASS;
- identity-less stale return fixtures are obsolete, not evidence against exact Current return guards;
- source inventory alone is not deliverability;
- lookup success is not learner evidence;
- correctness with unknown exposure/timing is not automatically stable transfer;
- engineering PASS is not learner U.

## 9. Final allowed conclusion

> **English Learning Logic and the named Current engineering paths have passed the fresh independent acceptance and integration proof, including Objective depth, Translation, Writing Runtime/Evidence, English↔Lexical, Chat Resume, the 180-minute whole paper, shared durability, navigation, and the executable External Reading Content lane. The English release is still BLOCKED only by the two exact missing Big Writing originals and Kian's Mac Human Gate for material changed learner-facing presentation. Learner U remains UNTESTED until genuine study.**

No broader Lexical / Politics / Xizong debt should be pulled into this conclusion without a real dependency.
