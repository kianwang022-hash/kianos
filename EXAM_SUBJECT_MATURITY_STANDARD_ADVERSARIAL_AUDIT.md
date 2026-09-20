# Exam Subject Maturity Standard — Adversarial Audit

Status: **CANDIDATE SELF-ATTACK · NOT A FREEZE VERDICT**

Target branch: `work/exam-subject-maturity-standard-20260920`

Purpose:

> Attack the acceptance requirements themselves before they are allowed to judge Xizong / English / Politics.

This audit asks whether a subject could satisfy the written checklist and still fail the exam, waste learner time, corrupt evidence, overfit synthetic material, mis-handle future sources, or depend on hidden Chat history.

---

## A1｜Target-authority drift — MATERIAL DEFECT

Attack:

- shared Exam Orchestrator currently protects Xizong 270+, English 85+, Politics 70+;
- candidate subject standards currently use Xizong 275+ and English “protect 80-level / push 85+”.

Failure mode:

- Forecast / Secure / Elastic may optimize against different targets depending on which file a fresh Chat reads;
- a subject may PASS its own requirement while violating cross-subject allocation truth.

Required repair:

- every subject requirement must distinguish **protect floor / working target / elastic upside**;
- the canonical target owner must be named;
- contradictory target owners block freeze rather than being silently reconciled by Chat.

---

## A2｜No-new-information can be false reassurance — MATERIAL DEFECT

Attack:

A learner repeatedly succeeds on homogeneous / easy / familiar tasks. New attempts produce no actionable defect.

Naive conclusion:

> no new information → reduce practice.

Counterexample:

- difficult inference, rare case geometry, one Part-B form, case integration or high-pressure execution was never sampled.

Required repair:

- No-new-information stop is legal only after **representative coverage** of the required mechanism / difficulty / context distribution;
- each required capability needs a negative-space / coverage audit so unobserved mechanisms do not disappear merely because they never produced errors.

---

## A3｜Subjective scoring can be the weakest measurement layer — MATERIAL DEFECT

Attack:

Translation / Writing / Politics Analysis first output receives one Chat score and appears to meet the score target.

Failure mode:

- score variance across raters/rubrics exceeds the predicted gain;
- Forecast becomes falsely narrow;
- a generated rubric may reward style that is not exam-relevant.

Required repair:

- subjective channels require explicit scoring anchors / rubric owner;
- score uncertainty must be carried into Forecast;
- one model judgment cannot by itself create high-confidence score evidence;
- when material, use anchored re-score / independent second review / exemplar calibration rather than fake precision.

---

## A4｜False Secure is only half the decision-risk problem — MATERIAL DEFECT

Attack:

The standard protects against declaring unstable work Secure, but a conservative Chat can also keep stable work in Build/Verify indefinitely.

Failure mode:

- learner time is wasted;
- high-value Xizong/Politics work is crowded out by unnecessary English maintenance;
- system appears “safe” while lowering total score.

Required repair:

- adversarial suite must test **false unstable / over-conservative control**;
- decision quality is symmetric: avoid both undertraining and overtraining;
- a Stable/Maintain claim should have explicit evidence basis and a re-open trigger.

---

## A5｜Chat judgment needs a second line of defense — MATERIAL DEFECT

Attack:

Chat selects a low-ROI task or marks one mechanism Secure using a plausible but wrong interpretation.

Current standard tests the scenario but does not define the guard.

Required repair:

Each material decision should be reconstructable from:

- evidence used;
- major assumptions;
- confidence / uncertainty;
- what evidence would falsify the decision;
- when to re-check.

High-impact decisions must be challengeable by a fresh audit / fresh Chat from durable evidence. The Website should validate identity / freshness / schema, but must not become the strategy judge.

---

## A6｜Observed evidence is selected, not random — MATERIAL DEFECT

Attack:

Only difficult items, W/U, or explicitly reviewed outputs are richly recorded. Stable material may stay silent.

Failure mode:

- absence of negative evidence is misread as evidence of stability;
- Forecast treats incomplete observation as a representative sample.

Required repair:

- evidence coverage / observability must be explicit;
- missingness may be informative or unknown;
- no model may infer “stable” solely from lack of W/U / Repair records;
- baseline / periodic representative sampling is needed where silent stable work would otherwise create blind spots.

---

## A7｜Evidence can become semantically stale after Content / Rule updates — MATERIAL DEFECT

Attack:

A source, task, scoring rubric, derived asset, or capability definition changes after learner evidence was collected.

Failure mode:

- old evidence is interpreted under new semantics;
- a repaired old item closes a newly redefined capability;
- current-year revision leaves stale derived training marked valid.

Required repair:

- important evidence binds to task/material identity + relevant revision;
- semantic revisions define preserve / migrate / stale rules;
- incompatible evidence fails closed rather than being silently reinterpreted.

---

## A8｜Material identity / exposure can leak across copies and surfaces — MATERIAL DEFECT

Attack:

The same passage/question/source appears in PDF, website, teacher notes, synthetic derivative, mock compilation or another session.

Failure mode:

- “fresh” evidence is actually exposed;
- duplicate material consumes limited holdout capital twice.

Required repair:

- exposure follows semantic material identity where resolvable, not page/file/session identity;
- duplicates / near-derivatives must be classified before they can serve Calibration / Transfer / Score evidence;
- unknown exposure remains UNKNOWN.

---

## A9｜Adaptive generation can overfit and bloat — MATERIAL DEFECT

Attack:

Every learner defect generates another permanent synthetic asset.

Failure mode:

- task bank expands without bound;
- later tasks mirror diagnosed failures too closely;
- transfer appears strong because generated examples leak the repair structure.

Required repair:

Generated assets need lifecycle semantics:

- purpose / mechanism;
- evidence role;
- source grounding when factual;
- version;
- independence from the repair example;
- calibration status;
- dedupe / retire rule.

Most one-off generated Repair assets may stay ephemeral. Only reusable validated assets deserve durable promotion.

---

## A10｜ROI can be short-sighted near Gates — MATERIAL DEFECT

Attack:

An action has high eventual value but requires several days before score conversion; another gives smaller immediate gain.

Failure mode:

- naive “next hour ROI” favors fast payoff and starves abilities with long learning latency.

Required repair:

ROI must include:

- time-to-convert;
- latest useful date;
- prerequisite / compounding value;
- probability the gain matures before the Gate;
- downside of delaying the action.

---

## A11｜Future-source lifecycle must survive partial / bad / missing releases — MATERIAL DEFECT

Attack:

A known annual source:

- arrives late;
- arrives in pieces;
- is lower quality than last year;
- conflicts internally;
- receives a second revision;
- never arrives.

Required repair:

Each future-source slot needs:

- fallback behavior;
- partial-ingestion semantics;
- quality / provenance gate;
- supersession / rollback rule;
- dependency invalidation for derived assets;
- a rule for “do not wait any longer; use alternative training/evidence”.

---

## A12｜Concurrent / conflicting learner state is under-attacked — MATERIAL DEFECT

Attack:

- Daily Packet copied, then more study occurs before Chat Plan returns;
- two tabs/devices update state;
- a restore checkpoint conflicts with newer local evidence.

Required repair:

- stale-plan detection must include relevant learner-state / study-day identity where available;
- conflicting restores fail closed;
- replay remains idempotent;
- no plan/import may erase newer learner evidence silently.

---

## A13｜Fresh-Chat attack needs a context budget — QUALITY DEFECT

Attack:

A fresh Chat can technically recover the decision only after reading dozens of contracts and historical files.

Failure mode:

- semantics are durable but operationally unusable;
- every fresh Chat becomes expensive and error-prone.

Required repair:

- Fresh-Chat success requires a **bounded owner path**;
- ordinary known-scope planning should resolve from compact Current / subject owner / learner packet, not broad archaeology;
- if repeated broad search is necessary, owner routing is defective.

---

## A14｜The next evidence should be chosen by value of information — QUALITY DEFECT

Attack:

Forecast uncertainty is high, but the system collects easy evidence that does not change the decision.

Required repair:

Forecast must answer:

> Which feasible evidence has the highest expected value for reducing a decision-relevant uncertainty?

Evidence collection itself consumes learner time and fresh-material capital. Prefer evidence likely to change allocation, Secure status, score confidence or Gate risk.

---

## A15｜Subjective / proxy metrics can Goodhart — QUALITY DEFECT

Attack:

System optimizes:

- completion count;
- low W/U rate;
- Memory stability labels;
- synthetic accuracy;
- fast task time;

without preserving real exam capability.

Required repair:

- every operational metric is subordinate to the score-relevant construct it is meant to proxy;
- whole-task / fresh / authentic evidence periodically challenges proxy success;
- metric improvement without downstream transfer must not count as maturity.

---

## A16｜The maturity standard itself can over-engineer — QUALITY DEFECT

Attack:

Every newly imagined failure produces another permanent contract, state, dashboard or validator.

Required repair:

A requirement earns durability only if it protects:

- a real score pathway;
- evidence validity;
- forecast validity;
- execution safety;
- future-source lifecycle;
- learner attention cost.

The standard must support **requirement deletion** when a rule adds maintenance but cannot change a learning or control decision.

---

# Subject-specific consequences

## Xizong

- target authority must reconcile the current cross-subject 270+ target with the candidate 275+ working target;
- representative coverage must include decisive-condition / case / cross-System / whole-paper stress, not only repeated official-question accuracy;
- case / mock copies need exposure identity so later score evidence is not silently contaminated;
- late case / 狂背 / four-set / five-hour revisions need derived-asset invalidation and fallback rules.

## English

- current English Learning Contract says hard target **85+**; the candidate “protect 80-level / push 85+” wording is stale unless 80 is explicitly defined as recovery floor only;
- Translation / Writing require scoring-calibration uncertainty;
- module Maintain cannot hide one open mechanism;
- No-new-information requires representative mechanism/form/difficulty coverage;
- generated task lifecycle must prevent repair-overfit and permanent bank bloat.

## Politics

- Protect-70 / Push-75 distinction is sound;
- consuming all Xiao1000 for learning means Xiao1000 cannot later become unbiased score calibration; formal objective calibration needs another appropriate evidence source;
- Analysis scoring requires anchored uncertainty, not one Chat judgment;
- future handbook/current-affairs/Xiao8/Xiao4 slots need partial/late/second-revision/fallback semantics;
- stable first-round evidence cannot stand in for analysis-output readiness.

---

# Current audit verdict

**DO NOT FREEZE v1 YET.**

The candidate standard has the correct architecture boundary and is already much stronger than ordinary study planning, but the defects above can still produce either:

- checklist PASS + real exam failure;
- checklist PASS + evidence contamination;
- or an over-conservative system that wastes substantial learner time.

Next step:

1. repair the shared maturity standard for A1–A16;
2. repair only subject requirements materially affected by those findings;
3. rerun this adversarial audit using counterexamples against the revised text;
4. freeze only when remaining uncertainty depends on real Learner U or genuinely unavailable future Source.


---

# Round 2 readback — 2026-09-20

After repairing A1–A16, a second self-attack added three further requirements:

1. **Adversarial-method quality** — named scenarios are insufficient; the mature suite now explicitly requires parameter grids, boundary values, randomized valid-state combinations, counterfactual policy comparisons, historical sanity checks, transport variants, conclusion-flip sensitivity and metamorphic invariants.
2. **Exam-modality fidelity** — browser/keyboard execution cannot silently stand in for paper, handwriting, page switching or answer-sheet transfer when those costs affect the real exam.
3. **Low-friction learner override** — a learner must be able to report that reality/task/exposure is wrong without manually maintaining the model; Chat reconciles the signal rather than forcing the learner to adapt to the plan.

Targeted textual regression after Round 2: **22 / 22 PASS** for the attacked requirement classes:

- target authority;
- representative negative-space coverage;
- subjective scoring uncertainty;
- false-Unstable protection;
- decision falsifiers;
- observability;
- revision binding;
- material identity;
- generated-asset lifecycle;
- value of information / learning latency;
- future-source fallback;
- concurrent-state safety;
- Fresh-Chat context budget;
- parameter grids / counterfactual / history sanity;
- conclusion flip points;
- exam modality;
- learner override;
- Xizong target-drift detection;
- English hard-85 alignment;
- English subjective scoring;
- Politics non-Xiao1000 formal calibration;
- Politics Analysis scoring anchors.

## Remaining blocker before freeze

**TARGET_AUTHORITY_UNRESOLVED**

Current shared Exam Orchestrator still uses Xizong **270+** while the Xizong highest-bar candidate uses **275+** as its working target.

The revised standard correctly treats this as a freeze blocker rather than guessing. Before v1 freeze, resolve whether the durable semantics are:

```text
protect floor = 270+
working target = 275+
elastic upside = above 275
```

or another explicitly chosen relation.

No further requirement-layer repair should silently choose this value.

## Round 2 verdict

**CANDIDATE REMAINS OPEN.**

The standard is materially stronger and the known self-attack classes are now represented, but it is not frozen while target authority remains unresolved and before at least one fresh independent audit attempts to falsify the revised standard without anchoring on this report.

After target reconciliation + fresh independent audit:

- if a new material blind spot is found → repair and rerun;
- if only future Source / real Learner U uncertainty remains → freeze v1 and begin subject gap-matrix execution.
