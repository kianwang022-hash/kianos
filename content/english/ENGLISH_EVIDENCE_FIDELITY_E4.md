# English E4 — Evidence / Exposure / Long-horizon Fidelity

Status: **ACTIVE CANDIDATE**
Date: 2026-09-21
Parent: `ENGLISH_HIGHEST_MATURITY_STAGE_PLAN.md#E4`

Purpose:

> Prove that the evidence reaching Chat / Forecast means what English strategy thinks it means, without creating a second learner ledger or making Kian maintain history manually.

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

E4 remains open until these claims survive targeted proof.
