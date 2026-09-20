# English Highest Maturity — Stage Plan

Status: **CANDIDATE EXECUTION PLAN · NO IMPLEMENTATION AUTHORITY BY ITSELF**
Date: 2026-09-20
Standard: `content/english/ENGLISH_HIGHEST_MATURITY_STANDARD.md`
Audit: `content/english/ENGLISH_HIGHEST_MATURITY_STANDARD_ADVERSARIAL_AUDIT.md`

Purpose:

> Translate the adapted English maturity standard into a staged closure program, without skipping directly from requirements to code.

Two different timelines stay separate:

1. **System Maturity Closure** — what must be built/proven.
2. **Learner Campaign** — what Kian actually studies from now to the exam.

System work exists to make learner work better. It is not a prerequisite ceremony that may delay useful study without cause.

---

# Part A｜System Maturity Closure

## E0｜Standard adaptation / falsification

### Goal

Make the English maturity bar itself strong enough to judge work.

### Inputs

- Current English Learning Contract;
- Current English manifest/source owners;
- Lexical Learning Contract;
- single-subject mother standard;
- English learner prior.

### Required outputs

- English Highest Maturity Standard;
- English-specific adversarial audit;
- mother-standard coverage readback;
- unresolved standard-level blind spots.

### Current state

- English adaptation exists;
- 29 / 29 mother-standard dimensions are represented;
- two self-attack rounds have found and repaired English-specific blind spots;
- standard remains CANDIDATE.

### Exit condition

Move forward when another self-attack no longer finds a new **material requirement class** that would change English learning/control.

Fresh independent audit remains required before final freeze, but the next stages may prepare evidence in parallel once the bar is stable enough.

---

## E1｜Score → Ability → Material → Method → Evidence Matrix

### Goal

Instantiate the English standard against current assets before changing implementation.

### Work

For every score channel:

```text
Cloze
Reading A
Part B — four forms
Translation
Small Writing
Big Writing
Lexical support
Whole Paper integration
```

build one compact matrix:

```text
score need
→ exact capability
→ failure modes
→ current material
→ current method
→ current evidence
→ missing evidence/material/method
→ learner impact
```

### Required English-specific checks

- Reading strong-prior must reduce unnecessary first-learning work but not erase difficult-mechanism verification;
- Cloze must separate lexical vs task-form gaps;
- Part B must preserve four forms independently;
- Translation/Writing must be treated as uncalibrated productive channels, not assumed zero;
- Lexical must connect to downstream task effect;
- Whole Paper remains integration rather than content.

### Exit artifact

One Gap Matrix sorted by learner impact:

```text
BLOCKER
HIGH
MEDIUM
LOW / DEFER
```

Do **not** modify code merely because a row is aesthetically incomplete.

---

## E2｜Material / Source Fidelity / Ready Inventory Closure

### Goal

Make every material required by E1 genuinely usable before learner demand.

### Work families

#### E2-A Official/authentic inventory

Audit:

- identity;
- exposure;
- answer/reference;
- Reading B geometry;
- Writing visual fidelity;
- Translation segment/reference alignment;
- full-paper constituent identity.

#### E2-B Synthetic baseline

Audit existing:

- Reading A;
- Cloze;
- Part B all forms;
- Translation;
- Small Writing;
- Big Writing.

For each:

```text
semantic quality
+ evidence role
+ answer/reference separation
+ task-native geometry
+ difficulty intent
+ executability
```

#### E2-C Missing material generation

Only generate when the capability matrix proves a real gap.

Likely candidates to test, not assume:

- extra fresh Cloze complete sets;
- additional Reading mechanism Stress tasks;
- Part B form-specific Stress;
- Translation targeted mechanism tasks;
- Writing semantic-theme / relation-diverse transfer prompts.

Targeted post-failure generation remains available later.

#### E2-D External Reading

Keep separate:

- growth inventory;
- source quality;
- OCR flags;
- optional Elastic role.

It is not a Day-1 score blocker unless E1 proves otherwise.

### Exit condition

Every BLOCKER/HIGH material need is either:

```text
READY_EXECUTABLE
or
explicitly BLOCKED / NOT_NEEDED_YET
```

No “file exists, therefore ready.”

---

## E3｜Productive Scoring Validity

### Goal

Make Translation / Small Writing / Big Writing useful as score evidence rather than only repair evidence.

### Translation

Need:

- score dimensions;
- proposition/fidelity anchor;
- acceptable alternative Chinese renderings;
- major/minor loss semantics;
- complete-section score anchor;
- model bias attacks.

### Small Writing

Need:

- task fulfillment;
- communicative completeness;
- register;
- language control;
- delivery.

### Big Writing

Need:

- observation/material grounding;
- core message;
- development/information gain;
- language control;
- task completion;
- delivery.

### Validation

Attack:

- two models agreeing under a bad rubric;
- style bias;
- reference wording bias;
- template/topic-package bias;
- inflated scores for incomplete task fulfillment;
- handwriting degradation.

### Exit condition

A productive first output can produce:

```text
anchored score range
+ uncertainty
+ failure diagnosis
```

without pretending one model score is exact.

---

## E4｜Evidence Semantics / Exposure / Long-horizon Fidelity

### Goal

Prove that the evidence Chat receives means what English strategy thinks it means.

### Attack

- assisted but marked clean;
- prior Chat cue not represented by runtime;
- unknown exposure treated as unseen;
- whole-paper component exposure not reflected in formal calibration;
- Content/source revision after old attempt;
- recent-packet truncation hiding long-term recurrence;
- same material through another route/device/session;
- same prompt repaired then reused as transfer.

### Required behavior

- fail closed on incompatible identity/revision;
- preserve first evidence;
- downgrade contaminated evidence;
- allow targeted deeper history review without shipping full history daily.

### Exit condition

Fresh Chat can distinguish:

```text
clean calibration
vs
useful learning evidence
vs
repair evidence
vs
contaminated/unknown evidence
```

E4 closes when those evidence distinctions survive targeted proof and no decision-relevant contamination path remains. E4 does **not** need to prove Forecast, Dynamic Control, handwriting calibration or full lifecycle maturity.

### Mandatory post-E4 stop check

After E4 closes, do **not** automatically open E5.

Ask:

> If Forecast is not built now, is there a real near-term English or cross-subject decision that cannot be made safely from current evidence, or would likely be materially wrong?

If **NO** — because the important unknowns are still learner parameters — stop maturity engineering and collect Real Learner U.

If **YES**, identify the exact decision and only then open the smallest Forecast scope needed for that decision.

---

## E5｜Forecast v1

### Opening gate — hard requirement

E5 is conditional, not sequential.

Open E5 only when both are true:

1. a real decision needs workload / uncertainty / sensitivity information now; and
2. enough learner evidence exists that Forecast can materially reduce uncertainty rather than restating priors.

Typical minimum evidence before serious E5 work:

- current Objective residual performance after/alongside Lexical reactivation;
- at least one cold complete Translation;
- at least one cold Small Writing;
- at least one cold Big Writing;
- observed task durations;
- an initial delayed Lexical retention trajectory.

If these are missing, E5 remains **DEFERRED TO REAL LEARNER U**.

Forecast may still use lightweight qualitative priors in Chat; that does not authorize building a mature Forecast system.

### Goal

### Goal

Estimate remaining English capacity and Gate risk without becoming the task scheduler.

### Forecast families

Separate:

- Reading A;
- Cloze;
- Part B;
- Translation;
- Small Writing;
- Big Writing;
- Lexical;
- Whole Paper.

### Inputs

- E1 capability gap;
- E2 material availability;
- E3 productive score uncertainty;
- E4 valid evidence;
- actual task duration when available;
- repair recurrence;
- delayed retention;
- whole-paper degradation.

### Initial prior / uncertainty model

Must treat as learner parameters:

- lexical reactivation speed;
- 1d / 3d / 7d / 14d retention;
- Objective residual error after lexical recovery;
- Translation baseline;
- Writing baseline;
- task time;
- scoring variance;
- paper/handwriting penalty;
- whole-paper degradation.

### Outputs

When warranted:

- P20 / P50 / P80 Secure capacity;
- 10/20 Gate risk;
- score-path confidence;
- workload confidence;
- sensitivity;
- decision flip points;
- highest-value next evidence.

### Stress

At least:

```text
English 1h/day
English 1.5h/day
English 2h/day
bad 3-day period
bad week
lexical retention failure
productive output slower than expected
Objective unchanged after lexical recovery
```

### Exit condition

The Forecast can say:

> what is known, what changes the answer, and what evidence is worth collecting next.

It must not say:

> do 17 Reading questions today

merely because a capacity model contains that quantity.

---

## E6｜Dynamic Control / English Decision Policy

### Goal

Turn valid evidence into a good English next action.

### Required decisions

For each task family / mechanism:

- UNCALIBRATED;
- BUILD;
- VERIFY;
- MAINTAIN;
- ELASTIC.

These remain Chat interpretations.

### Must prove

- Minimum Dose is an evidence floor, not quota;
- representative negative space before broad Secure;
- no-new-information stop;
- proportional reopen;
- hysteresis;
- false Secure protection;
- false Unstable protection;
- Lexical does not consume time solely because the 7,946-word universe is large;
- External Reading does not consume time solely because it is high quality.

### Cross-subject boundary

Once English 85+ viability is protected:

> additional English work competes with Xizong / Politics.

No permanent English daily-hour debt.

---

## E7｜Chat ↔ Website / Day‑1 Closure

### Goal

Prove that the strategy from E6 can be executed with low attention cost.

### Reuse

Current accepted:

- Daily Packet;
- English Session Instruction;
- English Resume;
- task workspaces;
- checkpoint;
- source hash / stale/replay guards.

Do not create a second transport.

### Day‑1 journey

Simulate:

```text
Home
→ Daily Packet
→ Fresh Chat
→ English decision
→ typed instruction
→ exact task
→ first attempt
→ correct / wrong / uncertain
→ optional Chat help
→ evidence
→ Chat redecision
→ interrupt / resume
→ day end
→ next-day stale session
```

Also attack:

- override;
- stale packet;
- plan after same-day additional learning;
- duplicate import;
- browser restart;
- checkpoint conflict;
- missing timer;
- unavailable material.

### Exit condition

Kian only needs to:

- study;
- report material reality changes;
- send a bounded handoff when Chat judgment is needed;
- override bad assumptions in plain language.

No manual state maintenance.

---

## E8｜Whole-Paper / Authentic Modality Closure

### Goal

Prove that English capability survives the actual exam resource system.

### Work

- integrated 180-minute execution;
- Objective exact score;
- anchored productive review;
- contamination note;
- paper/handwriting calibration;
- task-order comparison only if evidence suggests value;
- end-of-paper output quality.

### Clean evidence rule

If no truly clean full paper remains:

> use composite calibration with explicitly wider uncertainty.

Do not fabricate a fresh full paper.

### Exit condition

Whole-paper evidence can distinguish:

- local capability gap;
- timing/fatigue gap;
- paper modality gap;
- contamination.

---

## E9｜Full Lifecycle / Adversarial Stress

### Goal

Attack the full English control loop, not merely Runtime.

Use:

- parameter grids;
- boundary cases;
- reproducible random combinations;
- counterfactual policy;
- historical sanity;
- stale/duplicate/missing/corrupt transport;
- decision-flip surfaces;
- metamorphic invariants.

Must include English-specific all-green failures from the standard audit.

### Exit report

State:

- high-confidence conclusions;
- parameter-dependent conclusions;
- flip points;
- model optimism risks;
- model over-conservatism risks;
- highest-value next evidence.

---

## E10｜Fresh Independent Audit / SYSTEM_LOGIC_ACCEPTED

A fresh anti-anchored auditor receives only:

- Current owners;
- English Highest Maturity Standard;
- final compact English Maturity Package.

It attacks:

> all checks PASS but 85+ is still materially endangered or learner attention cost remains high.

If material defect:

```text
smallest responsible repair
→ targeted proof
→ re-audit
```

Freeze SYSTEM_LOGIC_ACCEPTED only when remaining uncertainty is:

- Kian-specific learner data;
- genuinely unavailable evidence;
- low-value unknown that cannot alter current action.

---

## E11｜Real Learner U / KIAN_SPECIFIC_CALIBRATED

Begins immediately when Kian studies.

Real evidence updates:

- task durations;
- lexical retention;
- Objective residual failure;
- productive scores;
- scoring variance;
- repair efficiency;
- transfer;
- whole-paper degradation;
- paper/handwriting cost;
- handoff friction.

Real U may reopen any model assumption.

It should not automatically reopen stable architecture.

---

# Part B｜Learner Campaign

System stages above do not replace the exam campaign.

## Phase A｜Now → 09/27

English learner objective:

> **calibrate + reactivate, not finish English.**

Likely learner work, subject to real Chat control:

- Lexical fast reactivation;
- delayed retention sample;
- small current Objective calibration;
- one cold complete Translation;
- one cold Small Writing;
- one cold Big Writing;
- only the Guide nodes exposed by those attempts.

By 09/27, English should know:

- lexical recovery speed;
- whether Objective residual loss remains after lexical recovery;
- Translation baseline;
- Small/Big Writing baseline;
- actual time costs.

This should narrow Forecast materially.

---

## Phase B｜09/28 → 10/20

English learner objective:

> **form defensible 85+ capability.**

Primary:

- remove known recurring Objective defects;
- build productive channels;
- verify independent transfer;
- confirm lexical downstream benefit;
- first formal integrated execution / composite calibration;
- preserve clean material capital.

10/20 must output:

- Objective section evidence;
- productive anchored bands + uncertainty;
- whole-paper/integration evidence;
- English total band;
- contamination;
- remaining Secure workload;
- highest-value next action.

---

## Phase C｜10/21 → 11/15

If 85+ path is strong:

- reduce isolated Objective practice;
- let Whole Paper / normal work carry Maintenance;
- focus only remaining productive/execution variability;
- shrink English protected capacity when another subject is higher ROI.

If below:

- attack the actual limiting channel;
- no generic Reading-volume increase when productive is binding.

---

## Phase D｜11/16 → 12/04

Primary:

- complete output;
- whole-paper timing;
- handwriting/paper;
- task switching;
- fatigue;
- variance reduction;
- small repairs only.

---

## Phase E｜12/05 → 12/20

Primary:

- preserve stable Objective;
- preserve Translation/Writing delivery;
- whole-paper/exam rhythm;
- exact high-value repairs only.

Almost no broad new method expansion.

Elastic work continues only if it still wins cross-subject ROI and can mature before the exam.

---

# Stage-opening gate

No stage opens because the prior stage closed or because a number exists in this file.

Before E5 / E6 / E7 / E8 / E9 / E10, ask:

> If this stage is not opened now, will a real near-term learning decision become impossible, materially wrong, evidence-invalid, or meaningfully higher-friction?

If the answer is NO, or the missing information mainly depends on Real Learner U:

> **do not open the stage; return to study.**

System stages may reopen later from concrete learner evidence, Forecast miss, execution friction, invalid evidence, or a real new source need.

---

# Day‑1 blocker policy

Do not delay tomorrow's real learning for non-critical maturity work.

A system issue is a Day‑1 blocker only if it prevents:

- correct task selection;
- valid learner attempt;
- preservation of first evidence;
- safe answer/reference gating;
- evidence return;
- resume/recovery;
- a defensible next Chat decision.

Non-blocking work may continue behind real learning.

---

# Stop rule

Do not finish E0–E10 merely because there are numbered stages.

At every stage ask:

> Does the remaining work still change English learning behavior, evidence validity, Forecast quality, execution safety or learner attention cost?

If no:

> stop system work and study.
