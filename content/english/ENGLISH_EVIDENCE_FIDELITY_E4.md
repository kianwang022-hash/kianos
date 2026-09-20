# English E4 — Evidence / Exposure / Long-horizon Fidelity

Status: **CLOSED CANDIDATE · TARGETED PROOF + SELF-ATTACK PASS**
Date: 2026-09-21
Parent: `ENGLISH_HIGHEST_MATURITY_STAGE_PLAN.md#E4`

Purpose:

> Prove that the evidence reaching Chat / Forecast means what English strategy thinks it means, without creating a second learner ledger or making Kian maintain history manually.

---

## 0｜Opening-gate verdict

**OPEN = YES.**

E4 is allowed to exist because the reproduced gaps can directly make a near-term English decision wrong:

- exposed material can be misread as clean calibration;
- prior Chat help can be misread as independent evidence;
- whole-paper scores can lose constituent contamination context;
- bounded recent packets can hide durable recurrence.

Those defects affect Chat interpretation, score calibration and later Forecast inputs **before** any mature Forecast exists.

E4 is therefore decision-relevant evidence repair, not stage-number completion.

E4 is **not** authorization to build Forecast, Dynamic Control, a new memory system, or any learner-facing architecture.

---

## 1｜Current accepted foundations

Already strong:

- first evidence is immutable;
- source-hash mismatch fails closed;
- unknown exposure is not unseen;
- explicit on-page Chat help can downgrade assistance;
- synthetic source/evidence role is bound to first evidence;
- recent exact inventory is bounded to 8 attempts/task;
- all-history task-level summaries remain available;
- Objective / Translation / Writing already own durable Repair/Transfer ledgers;
- whole-paper Seal / source identity / answer revision are accepted.

E4 does not reopen those semantics.

---

## 2｜Reproduced material gaps

### E4-D1 — same exact source can escape exposure through a different object id

Current exposure lookup primarily checks:

`ledger.materials[object_id]`

Events already contain `source_hash`, but first-attempt prior exposure does not scan other object ids for the same exact source hash.

All-green failure:

```text
same rendered source
→ route/object A previously opened
→ same source appears as object B
→ B has no object-local exposure events
→ evidence can start as unseen
```

Repair:

- exact matching `source_hash` anywhere in the exposure ledger downgrades the new attempt to exposed;
- near-derivative material without exact identity remains UNKNOWN unless another owner establishes equivalence.

---

### E4-D2 — Chat help outside the page can be recorded as unassisted

Current runtime can mark assistance after explicit learner help interactions, but an earlier Chat discussion may materially cue the task before the learner opens it.

All-green failure:

```text
Chat explains the exact target mechanism
→ later assigns the task
→ page sees no help button event
→ first evidence says unassisted
```

Repair:

- existing English Session Instruction accepts an optional factual `assistance_context`;
- allowed states: `assisted | unknown` (unassisted remains the default);
- basis: Chat context or learner statement;
- Runtime records that state in first evidence;
- Website does not decide whether the task should be assigned.

No new UI.

---

### E4-D3 — whole-paper capture loses constituent contamination facts

Current `englishExamPayload()` keeps source hash / attempt id and task output, but does not preserve:

- prior exposure;
- assistance;
- source kind;
- evidence role;
- first-evidence timing/independence.

Therefore an exact objective score can be mistaken for cleaner formal score evidence than the underlying sections justify.

Repair:

Every sealed whole-paper step carries a bounded evidence context from the immutable first evidence/binding.

The released objective rows and exam summary expose those facts without converting them into a strategy verdict.

Chat / Forecast decides how much the score is discounted.

---

### E4-D4 — bounded recent packet can hide long-horizon recurrence

Current packet intentionally contains only the latest 8 exact attempts per task.

All-history performance profile retains task-level counts, but a Fresh Chat may not see that a specific mechanism has durable Repair/Transfer history outside the recent exact window.

Repair:

Reuse the existing durable ledgers:

- Objective transfer claims;
- Translation transfer targets;
- Writing evidence targets.

Add a bounded `long_horizon_recurrence` digest to the English Evidence Packet containing:

- total / pending / closed counts;
- bounded current/recent target summaries;
- explicit truncation;
- no mastery/ranking;
- guardrail: absence from recent exact attempts does not prove long-horizon absence.

Do not ship raw full history every day.

---

## 3｜Boundaries

Do not create:

- second attempt ledger;
- cross-task mastery state;
- review calendar;
- generic mechanism ontology;
- Website strategy judge;
- learner-maintained history table.

Long-horizon digest is a **projection over existing durable evidence**, not new learner truth.

---

## 4｜E4 repair order

```text
R1 exact source-hash exposure continuity
R2 Session assistance_context provenance
R3 whole-paper constituent evidence context
R4 bounded long-horizon recurrence digest
R5 targeted structural/runtime proof
R6 browser / handoff proof where learner-visible behavior changes
R7 E4 self-attack
```

---

## 5｜E4 exit

Fresh Chat must be able to distinguish:

```text
clean independent calibration
vs
exposed / assisted / unknown evidence
vs
repair / transfer history
vs
recent-window absence with older recurrence still present
```

and a whole-paper score must not lose constituent contamination facts.

E4 closes when:

1. exact-source exposure cannot be laundered through another object id;
2. material Chat/learner assistance is preserved as evidence provenance;
3. whole-paper release retains section-level and paper-level contamination facts;
4. bounded long-horizon recurrence remains visible without shipping raw history;
5. broken/stale evidence fails closed or remains UNKNOWN;
6. targeted structural + learner-facing proof finds no material decision-changing evidence defect.

E4 does **not** need to prove:
- Kian's current score;
- Forecast accuracy;
- handwriting calibration;
- Dynamic Control;
- full lifecycle maturity.

### Post-E4 rule

Closing E4 does **not** open E5.

Default after E4:

```text
stop maturity engineering
→ begin / continue real English study
→ collect Real Learner U
```

Only a later real decision that materially needs workload/uncertainty forecasting may open E5 under the Stage Plan opening gate.


---

## 6｜Candidate implementation status

Implemented on this ref:

- **R1 exact source-hash exposure continuity** — an exact rendered source already exposed under another object id now downgrades the new attempt to exposed;
- **R2 Session assistance provenance** — Chat may declare only `assisted` / `unknown` evidence context with factual provenance; it may not manufacture an `unassisted` declaration;
- **R3 whole-paper constituent evidence context** — sealed/released section evidence carries exposure, assistance, source kind, evidence role, timing status and independent-transfer eligibility;
- **R4 bounded long-horizon recurrence digest** — Daily Evidence Packet projects existing Objective / Translation / Writing durable Repair/Transfer targets without creating a second ledger;
- **R5 structural/runtime validator** — dedicated E4 validator attacks source-hash laundering, assistance provenance, long-horizon truncation and whole-paper contamination;
- **R6 browser proof hook** — the existing synthetic five-task browser journey now imports a Chat-level assisted Reading step and requires the first evidence to record `assisted`.

Current status:

```text
R1–R6 IMPLEMENTED_CANDIDATE
→ latest-head CI / browser proof pending
→ E4 NOT CLOSED
```

No new learner UI, scheduler, mastery state or review calendar was added.


---

## 7｜Bounded self-attack

Attacked all-green failure cases:

1. same exact rendered source exposed under object A, then presented as object B;
2. learner explicitly declares an exact source exposed before opening it, then the same source appears under another object id;
3. later Chat attempts to overwrite known exposure with an `unseen` declaration;
4. prior Chat discussion materially cues the task but no on-page help button was used;
5. recent exact attempts omit an older recurring Repair / Transfer target;
6. long-horizon recurrence ledger is unreadable/corrupt;
7. Whole Paper objective score is exact but one or more constituent tasks are exposed / assisted;
8. content-specific Chat help occurs before a Whole Paper without identifying a specific section;
9. source revision differs from the attempt's bound source hash;
10. first evidence is revisited after later Repair.

Result:

- exact-source aliases cannot regain clean/unseen status;
- Chat may downgrade evidence to assisted/unknown but cannot manufacture unassisted;
- unreadable recurrence remains UNKNOWN and can require deeper review;
- recent-window absence is not treated as long-horizon absence;
- Whole Paper keeps section-level contamination plus paper-level assistance context;
- source revision remains fail-closed under existing attempt/session invariants;
- first evidence remains immutable.

No new material all-green evidence-fidelity failure was found.

---

## 8｜Targeted proof

Latest tested candidate:

`b164fc8f45b8218cec37fd9014a18ca900515509`

Relevant PASS:

- English Family Coherence — PASS
- Private Chat Control — PASS
- Objective Learner Journey — PASS
- Static Web Writing QA — PASS
- Static Web Translation QA — PASS
- English Exam Session — PASS
- Final Cross-subject Regression — PASS
- Semantic Base Validity — PASS

The Private Chat Control red seen on earlier heads was traced to three browser fixtures with hard-coded `2026-09-20` study dates after the Shanghai study day had advanced to 2026-09-21. Product/runtime behavior was not changed; the fixtures were made study-day-relative. The same latest head then passed Private Chat Control.

Governance Anti-Entropy remains red on the existing repository-wide Current-length rule and is not an E4 evidence-fidelity regression.

---

## 9｜E4 final verdict

**CLOSED CANDIDATE.**

The evidence reaching Chat / later Forecast can now preserve:

```text
exact source identity
+ exposure
+ assistance
+ first-evidence identity
+ source revision
+ long-horizon Repair / Transfer recurrence
+ Whole Paper constituent contamination
+ paper-level prior assistance
```

without creating a second learner ledger, mastery score, scheduler or Website strategy engine.

Remaining unknowns after E4 are not evidence-fidelity blockers. They primarily concern:

- Kian's current Objective residual performance;
- productive first-output level;
- task durations;
- delayed Lexical retention;
- paper/handwriting modality;
- real learner friction.

Next action is **not automatic E5 implementation**.

Next:

> audit remaining maturity domains against existing English owners; mark satisfied domains as satisfied and repair only concrete SYSTEM_LOGIC gaps.
