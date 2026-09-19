# Xizong Acceptance

Role: **lane-wide integration Acceptance + scoped acceptance router**
Standard: root `LEARNING_ACCEPTANCE.md`
Work cursor: `content/xizong/CURRENT.md`
Execution brief: `FINAL_LEARNER_ACCEPTANCE_BRIEF.md`

## Post-audit closure reconciliation — 2026-09-19

**Current candidate state: FINAL MERGE-REF REPROOF IN PROGRESS.**

The original four blockers from the fresh independent audit have now been
separated by owner rather than carried forward as one blanket engineering
failure:

1. **D1 shared private learner data — CLOSED ON CURRENT MAIN.** PR #492 landed
   as `b7dc77db`. Xizong durable learner-state/evidence keys are captured by
   the shared private checkpoint; restore writes only into an empty Xizong
   durable store; an unreadable existing checkpoint authorizes zero replacement
   writes. Shared checkpoint tests, Static Web Xizong QA, Golden Journey, A2
   Functional First and Representative Workspace all passed on that change.
2. **D2 typed Chat Return — CLOSED IN THE #491 CANDIDATE, pending final
   latest-main merge-ref proof.** Study Packet v3 now creates an exact handoff
   bound to object, Source hash, evidence version and interrupted Resume. The
   typed Return accepts `NO_ACTION` or bounded `REPAIR`, rejects stale or
   invented identity, is idempotent on identical replay, fails closed on
   conflicting replay, and reuses the existing Repair Inbox. Ubuntu and
   macOS-14 bounded dependent regression passed before integration into #491.
3. **D3 B1 original inline media — SOURCE BLOCKED, not an engineering mystery.**
   The two KP03 PNG paths were searched in Current `kianos`, archived
   `kianos-legacy`, and both repositories' complete path-specific Git commit
   history. The files themselves were never committed; only the Markdown
   references exist. Do not substitute a similar or generated image. This
   remains a scoped Source-availability limitation for those two original
   figures, not a blanket A1/runtime blocker.
4. **D4 Mac System-spine readability — HUMAN GATE PASS.** The accepted
   content-density layout keeps short System spines horizontal and gives dense
   long-label spines a vertical readable sequence. Real macOS 14 at 1512×982
   proved A2 remains horizontal, A3 is vertical with ~968px node reading width,
   and no document horizontal overflow. Kian accepted the candidate on
   2026-09-19.

A blanket lane-wide readiness headline is **not upgraded yet** merely from these
closure commits. The final proof is the PR #491 **latest-main merge ref**, which
must see Current main (including #492) together with the candidate repairs,
typed Return and accepted A3 layout. Real learner U remains UNTESTED.

---

## Final independent integration result — 2026-09-19

**BLOCKED for sustained, durable, end-to-end learner readiness.**

The audit is executed, not waiting for a new A/B/C planning phase. Several
production defects have bounded repairs and current candidate proof. The
remaining dependency and Human Gate failures below prevent a blanket PASS.
They do not imply every mature learning or Practice action is unusable.

Review: **PR #491**, branch `work/xizong-final-learner-20260919-independent`.
Candidate implementation is **not merged**. This report does not describe the
unrepaired public `main` website as fixed. Real learner **U remains UNTESTED**
for this audit; all generated learner state and test packets are synthetic.

### Evidence boundary

- Independent pre-evidence A/B/C model began at `b8b6c5102d415d1a5917b04dad031ba414004576`.
- Production recovery/repair baseline: `14db655c5dd529d6676702075b785febab7c950c`.
- Final main recheck: `0536e1563b2ad9c52551fefb7369995170a4e103`; the intervening change was Lexical-only, not a Xizong/shared dependency change.
- Repair and proof head: `b7424156de94d60ec55c8e5dad5fefc3d5562373`.
- Final executed workflow: `35408720835`; Ubuntu + real macOS 14, 1512 × 982.
- Earlier full candidate proof: `de5a210a1946cc33de02478d550dc37d260e8bbf`, run `35407983878`.
- An additional visual-state run at `45cf3c3a752562dcc1c589b0d0410bf142ee1fe7`, run `35408465708`, exposed the save-then-Seal race rather than merely producing prettier evidence; the final consumer repair is separately re-tested.

Final artifacts: macOS `10572454711` (SHA-256
`98707e616c496883f6890677dabcd28f07faefbd228ef57a6eaad758c6f32c2c`),
Ubuntu `10572874014` (SHA-256
`f4a4d42d8d359b2a7b3523e9af4c85192b330b6169f7c0bdd2c0574c0eb808ea`).
Their `results.json`, `visual-states.json`, screenshots and bounded regression
logs were downloaded and read back. Both platforms reproduce only the same
three open probe failures (two shared-checkpoint cases and B1 inline media);
the delayed-Seal/Block Recall visual-state probes and six dependent Node
regressions plus compiled-asset validation pass. Workflow transport helpers
were removed; the retained audit workflow is read-only.

Evidence classes: canonical owner readback; exact topology/Core comparison;
adversarial state and source mutation; real production browser transitions;
write/archive failure injection; private-file process restart; isolated Current
mirror sync; actual rendered macOS font inspection; visual inspection.
Post-repair tests by the repairing worker are targeted **SELF** verification,
not an invented second auditor or Kian Human Gate.

No old Acceptance, PR #458 conclusion or historical CI was used to select the
initial expected behavior. Their reconciliation is recorded only below.

## 1. Three priority adjudications

### Source-contact authority

`LEARNING_CONTRACT.md` owns the constitution; each accepted System Learning
owner owns its actual Source-contact granularity. The UI review protocol and
surface summaries cannot promote whole-LG contact into a lane-wide rule.

The actual adapter already preserved materially different models: A1/A2/A3
natural Source units, B whole-LG contact, C Block/canonical Source-unit contact.
C H01 keeps explicit membership `[1,12,13]`, not a fabricated inclusive range.
The correction therefore preserves that adapter model and fixes over-broad
normative text and the downstream contact/return consumers, rather than
rewriting C Learning to fit the old UI.

Where exact natural subdivisions are not provided, Runtime may record an
explicit learner confirmation that all owned Source material has cumulatively
been studied. It may not guess a first-to-last continuous page range or infer
contact from navigation. One confirmation records the exact covered KP set and
source provenance; it is not a required click for every KP. B/C consumer tests
use isolated synthetic fixtures and do not promote their production readiness.

### KP Recall protection

Projection Contract §9 primarily constrains **compiled Projection Front
payloads**. Learner Object / Block Workspace govern the **whole KP workspace**.
These are distinct output channels, not competing medical owners.

KP title, Prompt and approved Current Context may remain. Canonical Core,
explicit answer-bearing auxiliary payload and `POST_REVEAL` material remain
protected. Block/System reconstruction keeps its stricter neutral front.
Approved contextual Recall is not evidence of unaided delayed mastery. The
observation retains its origin/version/context information where available.

### Lecture-contact evidence

Formal contact is coverage of the owned KP by an explicit Source-contact event,
not the number of confirmations. The production test records one cumulative
contact event for 32 A1 B1 KP, followed by independent Recall evidence. Mere
visits do not earn contact; weak Recall may satisfy attempted coverage without
being rewritten as stable mastery.

## 2. Lane integration claim matrix

Statuses refer to the tested candidate and the narrowly named property, not a
synthetic sum of child S/K/L/P/R/E gates.

| Integration property | Result and exact boundary |
| --- | --- |
| Learning model / multi-surface ownership | **PASS** for the adjudicated contract/consumer model. Original Lecture remains external-primary; no second Lecture or mandatory per-KP source switching. Actual iPad/MarginNote human use is not simulated U. |
| Mature first-pass Runtime | **PASS** for tested contact → KP Recall → automatic LG closure → Block Recall → distinct Complete → System release mechanics, including low ratings and A2/A3 contact/refresh samples. Not a claim of complete source-media readiness or durable recovery. |
| Canonical identity / representation | **PASS** for 38 current production Blocks / 805 KP exact Core and LG membership, selective support gating and strict-source failure checks. Compiled-asset validation also passes its separate 4-System/76-Block/80-asset scope; that does not make B learner-ready. |
| B1 inline original-image consumer | **BLOCKED for that inline-media claim**: the current canonical Markdown references absent PNGs, with KP03 reproduced in browser. Other approved Visual bundles work. Missing optional support does not create a new course-completion gate or block all Systems. |
| Recall / local Evidence / eligibility | **PASS** for append preservation, hidden-rating protection, storage-failure suspension, archive-before-invalidation, and exact owned-KP completion at System/Practice/Resume. Browser-local safety does not prove recovery after browser reset. |
| Lecture / TTSX handoff | **PASS** for executable web-side position/contact/return and missing-binding refusal. No reviewed TTSX checkpoints currently appear on the mature sampled path; positive bound release was synthetic. Real source-app opening/reading/return remains **U: UNTESTED**. |
| Shared Practice / W-U / Marked / phases | **PASS** for tested canonical CHAT_SET identity/order, retained queue derivation, Stable fast exit, uncertainty retention, separate Marked, explicit phase and exact-mapping refusal. No automatic diagnosis or phase promotion. |
| Whole-paper Hidden → Seal → score → Review | **PASS** for year-owned scoring, editable drafts, no pre-Seal formal Attempts, idempotent Seal, same-workbench review, and delayed-navigation cancellation after immediate Seal. |
| Subject packet / Daily envelope | **PASS** for visible v3 export and tested envelope composition with exact current location, contact, Recall history, selected notes/marks, Practice and repair evidence. Export is not a database or an accepted typed Return. |
| Typed Chat Return → exact interrupted task | **BLOCKED**. The repaired legacy W/U plan importer and manual CHAT_SET fallback do not close the required typed, identity/version-bound, exact-resume round trip. |
| Automatic durable learner checkpoint | **BLOCKED** on the shared capture/restore and failed-read write-safety owner. Explicit private-file payload restart succeeds, but live Xizong evidence is not automatically captured/restored. |
| Incomplete-System fail closed | **PASS** for sampled production projectability and missing-scope/mapping boundaries. Production resolves A1/A2/A3; B/C/D/E/F are not promoted. C eligibility is not compiled/runtime readiness. |
| Current sync / evolvability | **PASS** for isolated real sync-script execution preserving a separately stored checkpoint, exact binding/type/STRICT_BLOB rejection, and bounded Framework asset repair without medical-Core edits. Automatic subject checkpoint closure remains blocked. |
| Real Mac presentation / Human Gate | Actual macOS screenshots and rendered **PingFang SC** are proved; **BLOCKED on the named System geometry issue; final Human Gate UNTESTED**. Long System-spine readability remains a concrete visual issue, not covered by zero document overflow. No material visual change is auto-approved. |

## 3. Repaired production findings and earliest owners

- **Over-broad Source/Recall specification:** corrected the existing UI protocol,
  Product Brief, Block Workspace, Learner Object and Projection boundaries.
  No new Learning hierarchy or changed medical ontology.
- **Source contact fragmentation / false ranges:** `XizongBlockV6.astro` and its
  learning consumers preserve System granularity, explicit cumulative coverage
  and exact locators without invented continuous ranges.
- **Recall loss / state corruption:** Block Runtime, Recall Evidence Bridge and
  Block/System Evidence Guards preserve original observations; malformed state,
  quota failure and failed archival cannot silently clear records and continue.
- **Premature System/Practice/Resume release:** the former consumer trusted
  `{completed:true}` without KP evidence. `xizongMemoryAutoRelease.mjs` already
  owned the exact Block-completion predicate; System guards now reuse it via an
  identity-only Current requirements read model. Stale known versions and
  invalid completion/timestamp types do not unlock later work.
- **Divergent visible Chat export:** the visible action now consumes the owned
  full v3 builder rather than a separate thinner packet. Legacy repair batches
  validate identities before writes and retain original observations.
- **Missing post-question reconstruction / year endpoint:** the same Practice
  family now returns to the correct short post-round System Recall; correct
  trailing-slash year-bank hydration is tested. No second question store.
- **Framework became a second Lecture:** A1 B1's broad heading selector included
  29 KP teaching sections; A2 R1's Unit-A object duplicated four KP bodies.
  Their two Projection assets now select the actual Framework/bounded objects.
  The complete canonical KP Core is unchanged.
- **Save → immediate Seal race:** an old delayed draft `nextQuestion` callback
  could dismiss the score surface after Seal. `XizongPracticeWorkbench.astro`
  now requires the original task identity and an unsealed paper before that
  delayed action may advance. The test waits beyond the timer before checking
  score access and same-workbench review.

## 4. Remaining closure owners

### D1 — shared private learner data

Owner: `static-web/src/lib/privateCheckpointRuntime.mjs`, consuming
`privateLearnerCheckpoint.mjs` and the shared `SYSTEM_CONTRACT.md` §6 boundary.

Reproduced failures:

1. `saveSharedControlToPrivate` captures shared control keys, not actual Xizong
   subject state; restore likewise does not restore Xizong evidence.
2. A failed/unavailable read of an existing checkpoint is followed by a write
   with empty `subjects`, which can replace unknown durable subject payload.

Required closure: shared write-fail-closed behavior plus accepted subject
capture/restore integration; browser reset → checkpoint recovery → exact
learner resume, without putting private history in public GitHub. This task
has not built a Xizong-specific shadow store or silently repaired sibling
subjects' shared persistence assumptions.

### D2 — typed Xizong Return

Owner: the Xizong Return/import boundary (`XizongSystemRepairReturn.astro`) with
shared Chat handoff / private storage authority.

Current accepted capability is narrower: legacy question-scoped W/U plan
validation and Memory repair, plus explicit CHAT_SET execution. Closure needs
a typed return bound to source evidence/object/version and exact interrupted
mainline cursor, atomic refusal of malformed/unknown identity and replay
safety. Legacy repair success is not mastery or full typed round-trip proof.

### D3 — B1 original media

Owner: canonical B1 inline source-media references and their actual source
asset resolver. `Block1_正常机械循环_v6_assets/` references are unresolved in the
inspected Current scope; KP03's two original PNGs were loaded unsuccessfully.
A bounded Library recovery search found no exact recoverable image target.

Existing reviewed physiology WebP support is not assumed identical merely
because its title is similar. Recover original bytes or review an exact
Source-backed replacement. Do not invent a diagram, silently remove Core,
guess a locator or turn all optional Visual absence into a completion blocker.

### D4 — Mac visual/Human Gate

Owner: the exact Xizong System/Block/Practice surface under current shared
Presentation and Xizong Visual Language. Real Mac output has been inspected,
not only CSS declarations or Linux screenshots. At 1512 × 982, the long A3
spine is squeezed into narrow text columns; no-horizontal-document-overflow
alone does not prove comfortable reading. A bounded System geometry correction
must preserve the accepted model, followed by real Mac/Kian Human Gate.

The candidate's changed Framework/contact/recovery surfaces are not marked
human-approved. U requires Kian's actual study, separately from screenshot
approval. No test fixture or fabricated completion has been written as U.

## 5. Historical reconciliation — performed after independent findings

Scoped A1/A2/A3 prior S–E acceptance remains evidence for its named historical
paths, not proof of all Current integration properties. B/C local construction
and readiness remain owned locally. This report neither sums their labels nor
blanket-invalidates independent content because one integration path failed.

PR **#458** was merged from `ae3684f3e56ff06fe21826e5b9933ed1a6f3ddb4`
(merge `9ae3dad5fc5957094bd04193005003d0a88d5369`). Its valid v3 packet,
legacy repair and learner-chrome fixes are retained. This audit found why a
visible export could still consume another packet, and why browser-local
repair does not prove typed Return or durable browser-reset recovery.

Historical PR-head workflows, including Static Web Xizong QA `35390807960`
and Mac Visual `35390807802`, were successful at their tested head. They do
not refute the new completion, Framework or delayed-Seal counterexamples.
The old Authority Consistency failure `35390807797` is not used to justify
unrelated repository repairs. Commit/test volume is not acceptance quality.

Final proof remains deliberately red for reproduced unresolved dependencies,
not because old broad CI was used as the answer key. Named successful tests
support only the matrix's bounded claims.

## 6. Scoped acceptance router

Exact System Content / S/K/L/P/R/E/U claims remain in their own owners:

- A1: `knowledge/systems/a1-circulation/ACCEPTANCE.md`
- A2: `knowledge/systems/a2-respiratory/ACCEPTANCE.md`
- A3: `knowledge/systems/a3-urinary/ACCEPTANCE.md`
- B: `knowledge/systems/b-digestive-metabolic-endocrine-tumor/ACCEPTANCE.md`
- C: `knowledge/systems/c-hematology-immunity-infection/ACCEPTANCE.md`
- D: `knowledge/systems/d-neuro-sensory-motor-orthopedics/ACCEPTANCE.md`
- E/F: resolve their exact Current scope when a claim is needed; this audit
  grants no readiness by directory existence or shared Runtime capability.

## 7. Stop / continuation boundary

The fresh audit has produced its final **BLOCKED** result and bounded repairs.
Do not restart broad re-acceptance, reconstruct old PR history or expand CI
merely because full readiness cannot yet be claimed. Continue only D1–D4,
then revalidate affected integration paths and update this owner. Keep the
candidate unmerged while its required release/Human Gates remain open.

Allowed conclusion: **tested candidate mechanics repaired; final sustained
Xizong learner readiness blocked on named closures; no learner U claimed.**
