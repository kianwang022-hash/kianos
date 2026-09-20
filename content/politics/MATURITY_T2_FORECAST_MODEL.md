# Politics Maturity T2 — Forecast Model

Status: **CANDIDATE · ACTIVE**  
Parent: `MATURITY_STAGE_PLAN.md`  
Evidence prerequisite: `MATURITY_T1_OBJECTIVE_RECONCILIATION.md`

## 0. Role

This is the Politics subject-level maturity Forecast.

It does **not**:

- choose cross-subject allocation;
- replace the Exam Orchestrator;
- create a learner-facing mastery score;
- convert learned Xiao1000 performance directly into exam points;
- claim Analysis readiness from Objective evidence.

Its job is narrower:

> turn Politics-owned facts into a decision-safe statement about current Protect-70 threats, Push-75 upside, remaining workload, and uncertainty.

The Exam Orchestrator may consume this result when deciding cross-subject strategy.

---

## 1. Evidence classes

Politics Forecast must keep four evidence classes separate.

### A. Structural learning evidence

Examples:

- Natural Unit position / verified progression;
- Current catalog question exposure;
- first-attempt coverage;
- single vs multiple exposure;
- open W/U pressure;
- Review compression;
- Memory admission / Recall evidence;
- real Politics minutes.

This evidence is useful early.

It does **not** by itself prove exam score.

### B. Contaminated learning-performance evidence

Xiao1000 is fully consumed for learning.

Therefore:

- first attempt can diagnose current failure shape;
- later repair can show learning;
- changed-context success can show transfer;
- aggregate Xiao1000 accuracy cannot be treated as an unbiased final-score estimator.

### C. Objective calibration evidence

This requires a separately accepted evidence source with known exposure/contamination.

Examples may include suitable official/current-year mock evidence when bound and accepted.

Only this class may materially narrow the Objective score band.

### D. Analysis-output evidence

Separate channel:

- IDENTIFY;
- SKELETON;
- MATERIAL BINDING;
- formulation retrieval;
- timed prose;
- whole-paper execution.

Objective evidence never substitutes for this class.

---

## 2. Fixed current workload truth

Current Xiao1000 source truth:

- total 1148;
- single-choice 528;
- multiple-choice 620.

These are learning-load denominators, not score weights.

Current first-ready/admission truth may temporarily expose fewer than 1148 questions because whole-item prerequisites can legitimately withhold items.

Forecast must therefore distinguish:

```text
full source load
vs
currently admitted catalog
vs
already first-attempted
vs
currently unresolved W/U
```

A withheld item is not automatically debt or a defect.

---

## 3. Early Objective Forecast — allowed now

Before accepted calibration evidence exists, the Objective Forecast may answer only:

### 3.1 Coverage

Per type:

- Current-catalog questions;
- first-attempted questions;
- remaining currently admitted questions;
- W/U counts;
- stable current outcome count;
- learner-cause counts.

Required split:

```text
single
multiple
```

Never hide a materially weaker multiple-choice profile inside aggregate Objective counts.

### 3.2 Pressure

Use W/U as diagnostic pressure, not as one-task-per-question debt.

Pressure interpretation must consider:

- sample size;
- subject/chapter concentration;
- shared root causes;
- learner cause;
- source coverage;
- whether the learner has actually reached representative scope.

Examples:

- many multiple-choice W/U with `options` cause may indicate boundary discrimination work;
- repeated `understanding` across related questions may justify one source/model repair;
- repeated `memory` may justify a small source-grounded Memory admission;
- isolated `careless` should not reopen whole Units.

### 3.3 Structural pace

The Forecast may use:

- real Politics minutes;
- first-attempt Unit/question progression;
- Current navigation;
- observed throughput history.

But:

- last navigation position is not completion;
- Unit question exposure is a lower-bound signal, not proof that all source learning is complete;
- missing source-completion evidence remains UNKNOWN.

### 3.4 Remaining workload

Allowed:

- exact unattempted count inside the current admitted catalog;
- unresolved W/U count;
- bounded Memory pressure;
- explicitly known future Source families.

Not allowed:

- inventing exact hours for unobserved source learning;
- treating all W/U as separate repair jobs;
- adding Review time on top of capacity as automatic debt.

---

## 4. Early Forecast states

Before score calibration, use capability states rather than pseudo-score bands.

### Objective structural state

One of:

- `INSUFFICIENT_EVIDENCE`
- `FIRST_ROUND_ACTIVE`
- `STRUCTURALLY_BROAD`
- `REPAIR_DOMINANT`
- `CALIBRATION_READY`

Interpretation:

#### INSUFFICIENT_EVIDENCE
Too little representative first-attempt evidence to infer a weakness pattern.

Correct action is usually to continue the mainline, not manufacture repair.

#### FIRST_ROUND_ACTIVE
Evidence is accumulating but coverage is still the dominant need.

#### STRUCTURALLY_BROAD
Exposure is broad enough that single/multiple pressure patterns are meaningful, but exam score remains uncalibrated.

#### REPAIR_DOMINANT
New learning is no longer the main bottleneck; a small number of recurring failures dominate.

This state requires root-cause compression, not simply a high raw W/U count.

#### CALIBRATION_READY
First-round structural evidence is broad enough that an accepted low-contamination Objective calibration source can now add real information.

This does not mean the score target is already met.

---

## 5. Protect-70 threat output before calibration

Early Forecast may output:

- `UNKNOWN`
- `STRUCTURAL_THREAT`
- `REPAIR_THREAT`
- `NO_CURRENT_OBJECTIVE_THREAT_DEMONSTRATED`

It may **not** output “Objective 40+ secured” without appropriate calibration evidence.

### UNKNOWN

Use when:

- evidence is sparse;
- source progress is not representative;
- timing/progression facts are missing;
- the apparent profile could reverse with ordinary new exposure.

### STRUCTURAL_THREAT

Use when:

- required first-round scope is unlikely to close under observed pace/capacity;
- major prerequisite areas remain unrepresented;
- the system lacks enough time/evidence to reach calibration readiness safely.

### REPAIR_THREAT

Use when:

- representative exposure is broad;
- recurring high-value failure patterns remain;
- the pattern is not explained by a few cheap fixes already in progress.

### NO_CURRENT_OBJECTIVE_THREAT_DEMONSTRATED

This means only:

> current structural evidence has not shown an Objective blocker.

It is **not** a score guarantee.

---

## 6. Multiple-choice protection rule

Multiple-choice must be treated as its own high-risk channel.

Trigger a specific warning only when all are true:

1. multiple-choice sample is large/broad enough to be interpretable;
2. its W/U pressure is materially worse than single-choice or its own recent changed-context evidence;
3. the difference persists after obvious coverage confounding is removed;
4. the recommended action would actually change.

If these conditions are not met, report uncertainty rather than “multiple-choice weakness.”

The action should target the dominant cause:

```text
options/boundary
→ discrimination / competing propositions

understanding
→ smallest owning relation/source repair

memory
→ selective source-grounded precision

careless
→ execution cue / no content expansion
```

---

## 7. Objective calibration — later

Once an accepted calibration source exists, bind:

- source identity;
- date/current-year relevance;
- exposure history;
- section/item composition;
- single/multiple split;
- timing;
- first-attempt integrity;
- review contamination.

Then the Forecast may produce an Objective score band with:

- central band;
- explicit uncertainty;
- contamination note;
- weak-channel diagnosis;
- evidence freshness.

One set must not narrow the band aggressively by itself.

If calibration evidence conflicts with Xiao1000 learning evidence, prefer the calibration result for score inference and use Xiao1000 to diagnose why.

---

## 8. Analysis channel

Analysis Forecast is separate.

Early states:

- `UNKNOWN`
- `IDENTIFY_ONLY`
- `SKELETON_CAPABLE`
- `MATERIAL_BINDING_CAPABLE`
- `FORMULATION_READY`
- `TIMED_OUTPUT_READY`

Current-year readiness additionally requires approved later Source where exact/current wording matters.

A total Politics Protect-70 judgment may become narrow only when both channels are supported:

```text
Objective calibration
+
Analysis-output evidence
+
timed execution
```

Until then, total score uncertainty remains deliberately wider.

---

## 9. Protect 70 vs Push 75

Forecast actions are classified:

### Protect 70

Examples:

- representative multiple-choice weakness;
- first-round pace failure;
- unresolved high-value conceptual/boundary cluster;
- inability to identify/skeleton Analysis material;
- timed output failure;
- missing current-year essential Source ingestion.

### Push 75

Examples after floor threats are controlled:

- marginal Objective precision gains;
- additional high-value exact formulations;
- better material binding;
- improved timed prose quality;
- current-year mock-specific refinement.

Push-75 work must not consume large capacity while a Protect-70 threat remains materially open unless its marginal return is clearly higher.

---

## 10. Adversarial conclusion-flip grid

Every material Forecast revision should test whether the recommended action changes under:

- Natural Unit pace -30%;
- usable Politics capacity -30%;
- multiple-choice W/U materially above single-choice;
- multiple-choice weakness disappearing after more representative coverage;
- W/U count high but collapsing to one root cause;
- Memory retention materially worse than observed;
- apparently stable Memory relapsing;
- current packet missing timer/progress fields;
- source arrival delayed;
- calibration set materially worse than learning evidence;
- calibration set materially better than learning evidence;
- Analysis first output materially below expectation.

If plausible parameter changes flip the next action, confidence must stay low and the missing evidence should be named.

---

## 11. Current implementation boundary

Existing runtime now exposes the required factual split in:

`kianos.politics.forecast-progress.v1.objective_evidence_by_type`

for:

- single;
- multiple;
- first-attempt count;
- current STABLE / WRONG / UNCERTAIN;
- four existing learner-cause buckets.

This field remains:

`FACTUAL_SUBJECT_PROGRESS_SIGNAL_ONLY`

It does not gain score or Gate authority.

Next implementation should consume these facts into a compact Politics Demand/Forecast summary without creating a second packet or autonomous learner scheduler.
