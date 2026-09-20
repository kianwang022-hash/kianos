# Exam Orchestrator Contract

Status: **CURRENT**  
Scope: **2027 postgraduate entrance exam cycle / cross-subject scheduling**  
Subjects: **Xizong 306 / English / Politics**

This document is the single canonical owner for KianOS **cross-subject exam orchestration**.

It owns the **shared factual planning context and Chat-planning priors**:

- exam outcome targets;
- phase / milestone / hard-Gate definitions;
- capacity / study-time fact semantics;
- required-pace / observed-pace concepts available to Chat;
- score-closure / re-estimation evidence requirements;
- material-refresh / ingestion timing at the orchestration layer;
- the information budget of the learner-facing global planning surface.

It does **not** own the current allocation decision, next-subject decision, review priority, or daily learning strategy. Those are adaptive Chat decisions.

It does **not** own:

- Xizong / English / Politics domain cognition or learning semantics;
- subject-local Source Truth / Question Truth / content owners;
- subject-local Repair / Review semantics;
- private learner evidence as shared repository truth;
- engineering Work Cursor state for subject construction.

Hard boundary:

```text
subject runtime / evidence
+ current exam facts / Gates / capacity
        ↓
       Chat
strategy / allocation / priority / next action
        ↓
typed private Chat Plan / Session Instruction
        ↓
Website execution + display
        ↓
bounded learner evidence
        ↺ Chat

Website / Exam Orchestrator runtime
≠ strategy engine
≠ second subject learning system
≠ second Source Truth
≠ second mastery ledger
```

The governing repository distinction remains:

```text
Artifact Truth ≠ Acceptance Truth ≠ Learner Truth ≠ Work Cursor
```

## 0｜Current control boundary — Chat owns orchestration

Effective 2026-09-18, the durable product relation is:

```text
GitHub / Current = long-lived assets and exam facts
Chat             = adaptive brain
Runtime          = execution
Website          = learner execution surface
```

Therefore the production Website must not calculate a replacement learning strategy from raw phase, score-gap, review-pressure, workload, priority, or elapsed-time fields.

The Website may:

- record/validate real capacity and study-time facts;
- expose subject-owned Resume/Continue targets;
- expose current Phase / Gate / material-window facts;
- validate a typed Chat plan;
- display the already-decided allocation/next action;
- execute subject Session Instructions;
- capture learner evidence and return it to Chat;
- fail closed when a Chat plan is missing/stale/invalid.

The Website must not:

- allocate elastic capacity among subjects;
- rank subjects by inferred urgency;
- choose the next subject from score/workload heuristics;
- create review debt or repair priority;
- infer a plan because no Chat plan exists.

### Typed private cross-subject plan

The current private control packet is:

```text
kianos.exam.chat-plan.v1

study_day
generated_at
subjects
  xizong / english / politics
    target_minutes   optional
    role             optional learner-facing label
    note             optional Chat rationale
    session_ref      optional pointer to subject Session Instruction
next_subject         optional
attention            optional
```

This packet is private learner/control state. It must not be committed to public canonical Content.

### Legacy scheduling text below

The phase/capacity/score-gap/recoverability rules below remain valuable **planning priors for Chat** and historical rationale.

Whenever later text says that the “Orchestrator” allocates, recalculates, ranks, protects a floor, or chooses a next action, interpret that as:

> **Chat uses these priors plus current learner evidence to decide the plan; the Website does not execute that strategy autonomously.**

This section has precedence over older runtime-allocation wording.

The legacy `buildExamPlan()` implementation may remain temporarily for compatibility/tests during migration, but no production learner surface may call it once the Chat-control cutover is active.

---

# 1｜Outcome target

Cross-subject operational target:

```text
Total      425+
Xizong     270+
English     85+
Politics    70+
```

The component targets sum to 425, so the Orchestrator must not treat them as comfortable stop-lines. Later score evidence may justify an explicit working buffer, but V1 must not invent one before real variance / mock evidence exists.

For cross-subject allocation, the target numbers in this contract control. A lane-local higher stretch target may remain a local design signal but must not silently override cross-subject capacity allocation.

### Xizong single-subject Forecast target authority

The Xizong **capability Forecast** must read the Current Xizong subject target from
'content/xizong/knowledge/learner/study-policy.json' (currently **275+**).

The cross-subject table above remains a cross-subject allocation seed until the final
three-subject forecast reconciliation is completed. It must **not** silently downgrade
the Xizong single-subject capability model from 275+ to 270+. Conversely, the
single-subject 275+ target does not by itself rewrite English / Politics allocation or
the total target before that reconciliation.


The Orchestrator optimizes:

1. probability of reaching the total target;
2. probability of keeping each subject on a viable target trajectory;
3. phase completion / score-evidence readiness;
4. marginal value of the next hour of study.

It does **not** allocate time by exam-point weight alone.

---

# 2｜Current learner baseline

For the current cycle, Xizong first-round learner progress must be treated as:

```text
current-pass learning not yet completed
prior exposure / second-attempt background exists
actual current capability = unknown until evidenced
```

Do not treat Kian as zero-background. Do not infer mastery from prior-year exposure either.

Practical consequence:

- first-pass pages may support **fast re-learning / fast pass** when real Recall / task evidence is strong;
- familiar material may compress quickly;
- weak / forgotten material expands;
- no historical familiarity alone may mark a Block / KP mastered.

English and Politics likewise derive learner state only from actual private evidence / current learner use, not engineering readiness.

---

# 3｜Hard timeline and Gates

### Mandatory Hard Checkpoint hierarchy

The exam cycle has exactly three non-skippable strategic checkpoints:

```text
2026-10-20  HARD GATE 1
            application / first formal score-and-risk closure

2026-11-15  HARD GATE 2
            second score-and-strategy closure

2026-12-20  TERMINAL GATE
            exam execution
```

09/27 and 12/05 remain important **internal phase stop-lines**, but they are not peers of the three mandatory Hard Gates above.

Every Hard Gate has automatic shadow audits:

```text
T-7  early risk audit
T-3  intervention audit
T-1  final preflight
T0   mandatory Gate audit / exam execution
```

Shadow audits are backend control events, not extra learner ceremonies. They must surface material risk early enough to act.

Hard Gate audit inputs must include, when phase-appropriate:

- evidence coverage / freshness;
- learner progress and unresolved high-value scope;
- formal score evidence and uncertainty;
- retention / fresh-transfer stability;
- real usable-capacity history;
- nearest-Gate + full-campaign Forecast;
- binding constraint and downstream reserve;
- adversarial downside / compression result.

Missing required evidence yields `UNKNOWN / NOT_READY`, never an optimistic PASS.

Hard Gates constrain Chat strategy. The Website may display the facts/result but must not independently decide school choice, allocation, compression, or strategy.

## Phase A｜2026-09-16 → 2026-09-27
### First-Round Closure

Primary purpose: get the current learning system into a usable first-round closure state without allowing product construction or optional source updates to consume the study window.

### Xizong

- Main capacity owner.
- Treat current work as re-learning / first-pass construction of the learner model.
- Keep the approved first-pass chain:

```text
KianOS orientation / cue
→ original Lecture in MarginNote / iPad
→ active Recall / closure
→ necessary question exposure
```

- Second-attempt familiarity may make the path much faster, but the learner must still generate evidence rather than skip by impression.
- 09/27 is a **stop line, not a manufactured completion deadline**. Forecast may truthfully place first-round closure after 09/27. Remaining tails may roll into the next phase only when their scope and P20/P50/P80 workload are explicitly bounded; do not compress, omit or relabel real work merely to make the calendar date PASS.

### English

- Protect continuity, primarily Objective + Lexical.
- Default planning seed: about **2h/day**, interpreted as a rolling protected floor rather than a daily debt rule.
- Translation / Writing do not need full expansion before 09/27.

### Politics

- Establish and sustain the real first-round loop:

```text
KianOS orientation
→ Chengfeng continuous learning on iPad / MarginNote
→ short closure
→ Xiao1000 verification
→ Wrong / Uncertain smallest repair
→ continue
```

- Default planning seed: about **1.5h/day**, dynamically increased if observed pace threatens the ~10/20 first-round exit.

### 09/27 Gate

The gate asks:

- **Xizong:** is the main first-round model sufficiently closed to switch into score formation, even if bounded weak tails remain?
- **English:** has Objective / Lexical continuity been preserved, with no material drop-out?
- **Politics:** is the first-round pipeline stable and is observed pace sufficient for the ~10/20–10/21 first-round exit?

Gate outcome may be:

```text
PASS
PARTIAL_ADVANCE
BLOCKED
```

`PARTIAL_ADVANCE` means a bounded tail continues inside the next phase without keeping the whole system in Phase A.

---

## Phase B｜2026-09-28 → 2026-10-20
### Score Formation I

Primary purpose: turn learning into the first defensible score evidence by the mandatory 10/20 Hard Gate.

### Xizong

Default cognitive direction switches from:

```text
knowledge → recall → questions
```

toward:

```text
questions / application
→ expose weakness
→ smallest Recall / Repair
→ fresh verification
```

The second-pass / score-formation workload is **not** “159 Blocks again”. It is derived from real evidence and expected effective study time.

Workload classes may include:

```text
Block activation
+ question attempt
+ repair clusters
+ System recall / case / calibration / performance work
```

Stable material stays cheap; weak material expands.

### English

Build the evidence required for an 85+ estimate:

```text
Objective maintenance
+ Translation real tasks
+ Writing real tasks
+ Lexical support
```

The 85+ estimate must not be inferred from Reading performance alone.

### Politics

Continue first-round progression toward ~10/20 closure. Xiao1000 remains verification, not the owner of learning order. If the observed Natural Unit pace is below the required pace, increase Politics capacity before the deadline rather than discovering the problem at the end.

### 10/13–10/20 Hard-Gate calibration window

10/13 is the T-7 shadow audit. Prepare formal score evidence before the mandatory 10/20 closure. Do not force three full exams onto the single calendar day 10/21.

Prefer:

- clean / first-attempt conditions;
- timed or execution-faithful evidence;
- least-contaminated available material;
- fresh / holdout evidence over memorized repetition;
- explicit uncertainty when evidence quality is limited.

---

## Hard Gate 1｜2026-10-20
### Application / First Formal Score & Risk Closure

10/20 is the first mandatory **Hard Gate** and the evidence checkpoint Kian uses for the application decision. The system supplies evidence and risk; Kian makes the school/application choice.

By this point all three subjects must have phase-appropriate performance evidence sufficient to produce a defensible estimate, plus a forward risk view through 11/15 and 12/20.

### Xizong

Primary anchor:

- one least-contaminated official full paper / large calibration slice where feasible;
- recent official-question performance;
- error / weakness structure.

Do not burn all later full-paper holdout.

Output:

- current score band toward the Current Xizong subject target (currently 275+);
- confidence / contamination note;
- major loss clusters;
- recoverable score gap.

### English

Primary anchor:

- one least-contaminated official complete paper or equivalent complete evidence;
- Objective + Translation + Writing all represented;
- Lexical used as supporting causal evidence where relevant.

Output:

- current score band toward 85+;
- section bottlenecks;
- confidence;
- maintenance vs output-training decision.

### Politics

October Politics evidence has intentionally higher uncertainty because late memory / current affairs / subjective-answer / sprint materials are not fully realized yet.

Use the strongest current objective evidence and phase-appropriate current-year evidence. Do not pretend October Politics score certainty equals Xizong / English.

Output:

- current objective-performance evidence;
- wider total-score band / 70+ path judgment;
- remaining score-conversion opportunities.

### Gate output

Frontend should surface only:

1. defensible current band per subject;
2. confidence / uncertainty;
3. total band toward 425+;
4. largest recoverable gaps;
5. allocation change for 10/21 → 11/15;
6. material updates entering the next useful window.

Backend must also produce an **Application Decision Evidence Packet** for Kian containing:

- current three-subject score bands + confidence / contamination;
- 10/20 evidence coverage and major unknowns;
- P50 / conservative completion windows to 11/15 and 12/20 when evidence supports them;
- binding constraint and downside scenario;
- realistic usable-capacity history;
- full-scope vs core/COMPRESS state;
- largest plausible failure path if current strategy is kept;
- what evidence would most change the judgment.

This packet informs the application decision; it must not choose a school for Kian.

Detailed weighting / contamination logic stays backend/debug.

---

## Phase C｜2026-10-21 → 2026-11-15
### Score Repair / Consolidation

This phase is driven by the 10/20 Hard Gate result, not by a permanent static ranking of subjects.

### Shared scheduling rule

Every subject gets a protected floor. Elastic capacity is allocated by:

```text
current score gap
× recoverability
× near-term phase urgency
× expected marginal value of time
```

Do not turn this into a fake permanent numeric score formula in V1. Use rule-based arbitration backed by real evidence.

### Xizong

- question / case-driven application;
- discrimination and decisive-condition work;
- Precision stabilization;
- smallest repair;
- fresh verification;
- early/mid-November case-analysis / 狂背 material may enter as delta / targeted support, not as a new full lecture course.

### English

- if near 85+, emphasize maintenance + stable complete-task execution;
- if Translation / Writing is the real gap, target those rather than simply increasing Reading volume.

### Politics

- enter second-pass compression;
- Xiao1000 Wrong / Uncertain repair;
- selective Exact / memory stabilization;
- prepare for later mock / sprint material.

### 10/22-ish real-world interruption

Use **Maintenance Mode**:

- protect minimal continuity;
- do not create hour-debt;
- recalculate on return.

### 10/27 calibration

Treat the planned mock / assessment as an early calibration point. If it materially contradicts 10/20, bounded reallocation may occur before 11/15.

### Hard Gate 2｜11/15

Must output:

1. score band v2 / phase-appropriate evidence for all three subjects;
2. delta vs 10/20;
3. whether the prior reallocation worked;
4. remaining dominant score gaps / bottlenecks;
5. new allocation for 11/16 → 12/05.

At 11/15, workload-completion metrics are subordinate to score conversion. The audit must additionally answer:

- which subject/component is now the binding 425+ constraint;
- whether fresh-transfer / delayed-retrieval evidence supports the apparent score;
- whether the current plan survives a realistic bad-week scenario;
- which remaining work is CORE vs FULL vs ELASTIC;
- which work is explicitly stopped because its marginal score value is too low;
- whether 11/16 → 12/20 reserve is sufficient for simulation, repair and final stabilization.

A strategy that needs near-perfect days to survive is not GREEN.

---

## Phase D｜2026-11-16 → 2026-12-05
### Output Intensification / Mock Formation

Primary purpose: convert repaired knowledge into stable exam execution and make the final 15-day decision set finite.

### Xizong

Primary work:

- cases / integrated reasoning;
- cross-System switching;
- official questions / mocks;
- repeated Wrong / Uncertain;
- high-value Precision;
- compressed retrieval rather than broad relearning.

Around late November, TTSX four-set / 小凯 / other external papers may enter as unseen assessment assets. They are not new textbooks.

### English

Primary work:

- stable Objective performance;
- full Translation output;
- full Writing output;
- timing / variance / full-task execution.

Avoid expanding low-value new methods merely because material exists.

### Politics

Primary work:

- second-pass compression output;
- current-year memory / current-affairs support;
- Xiao8 / mock evidence when available;
- high-value exactness / confusable boundaries;
- preparation for final sprint.

### 12/05 Gate

Must answer:

1. latest defensible subject score bands;
2. remaining loss sources that have truly converged;
3. which capabilities can still improve materially in the remaining window;
4. which content / repair paths are now explicitly stopped.

12/05 changes the optimization target from broad capability growth to final exam conversion.

---

## Phase E｜2026-12-05 → 2026-12-20
### Final Sprint

Primary question:

> Which remaining actions can still materially improve 425+ with acceptable risk before the exam?

Shared rules:

- new large learning scopes are presumptively rejected;
- stable areas stay cheap;
- review is compression-first;
- protect sleep / exam rhythm / execution stability;
- do not trade exam-day performance for low-value late content;
- new material must pass a latest-useful-date / marginal-value filter.

### Xizong

- timed full-paper / large-set execution;
- high-value Wrong / Uncertain repair;
- case discrimination / cross-System switching;
- unstable Precision;
- final compressed recall;
- TTSX four-set / external mocks remain assessment assets;
- final “five-hour” material is delta-ingested and only truly new / high-value content surfaces.

### English

- preserve 85+ output stability;
- full-task execution, time, variance, Translation, Writing;
- almost no broad new method expansion.

### Politics

- final memory / subjective-answer / current-affairs conversion;
- Xiao4 and other current-year final materials when supplied / available;
- current-year material may still matter late, but must be compressed into usable output structures rather than become a new course.

---

## Terminal Hard Gate｜2026-12-20
### Exam Execution

12/20 is not another learning-completion review. It is the terminal execution Gate.

T-7 / T-3 / T-1 preflight must prioritize:

- stable retrieval and exam execution;
- latest defensible score/risk evidence;
- sleep / rhythm / usable cognition protection;
- unresolved high-value errors only;
- timing / variance control;
- logistics and required exam materials where known.

The closer the exam gets, the higher the burden of proof for opening new learning scope.

At T-1, broad new learning is rejected unless a concrete, high-value, low-risk exception is demonstrated.

At T0:

```text
no architecture work
no forecast-model tuning
no historical-hour debt
no broad new scope
→ execute the exam
```

# 4｜Capacity scheduling model

## 4.1 Cross-subject currency

Do **not** normalize subjects by task count.

Natural units stay local:

- Xizong: System / Block / Logic Group / question / Repair / case;
- English: passage / set / Translation / Writing / Lexical workload;
- Politics: Natural Unit / Xiao1000 / memory / mock / Repair.

Cross-subject arbitration uses:

```text
expected effective study time
```

Each meaningful task type may carry:

```text
natural quantity
estimated minutes
actual minutes
```

Seed estimates may be rough. Replace them with Kian's observed data using robust rolling estimates rather than fake fixed constants.

## 4.2 Rolling scheduling

Use a rolling multi-day / ~7-day capacity model rather than strict daily debt accounting.

A short bad day does not create a historical hour debt.

Daily schedule is recalculated from:

- current Gate / days remaining;
- real usable capacity;
- protected subject floors;
- required pace vs observed pace;
- high-value review / Repair demand;
- current material readiness;
- performance evidence / score gap when available.

## 4.3 Floors / targets / ceilings

A subject may have:

- **Floor** — minimum capacity needed to preserve continuity / phase viability;
- **Target allocation** — normal current allocation;
- **Practical ceiling** — point after which an extra hour has lower marginal value than another subject.

Floors are phase-dependent, not eternal constants.

Initial Phase-A seeds:

```text
English  ≈ 2h/day rolling protected floor
Politics ≈ 1.5h/day rolling protected floor
Xizong   receives remaining main capacity
```

These are starting priors only. Real pace may change them.

## 4.4 Dynamic replanning

When actual duration differs from plan:

```text
observe actual
→ update throughput / workload estimate
→ recompute Gate risk / phase slack
→ reallocate future capacity
```

Do not automatically label the day a failure or create hour-debt.

If a Gate becomes infeasible, the response order is:

1. increase subject capacity where useful;
2. reduce low-value work;
3. compress Review / stable work;
4. defer optional phase tasks;
5. only then reconsider a hard stop-line.

---

# 5｜Evidence → mastery/stability estimate → workload

The Orchestrator consumes evidence; it does not invent subject mastery truth.

Shared causal chain:

```text
Subject Runtime
→ Evidence Events
→ private Mastery / Stability Estimate
→ Remaining Workload Estimate
→ subject Demand
→ cross-subject allocation
```

One observation must never equal mastery.

Preserve:

- studied ≠ recalled;
- immediate Recall ≠ delayed stability;
- one correct item ≠ reusable application;
- diagnosis ≠ Repair;
- Repair ≠ mastery;
- same-item correction ≠ fresh verification;
- fresh / delayed / changed-context performance is stronger evidence.

Possible hidden estimate dimensions:

```text
retrieval
application
precision
stability
confidence
freshness
```

These are estimator dimensions, not learner-facing mandatory labels.

Private learner estimate state must not be committed into shared canonical Current.

---

# 6｜Review / Repair capacity boundary

Subject runtimes own what counts as a real review / Repair candidate.

The Exam Orchestrator owns only **cross-subject capacity arbitration**.

Rules:

- stable correct work should remain cheap;
- backend uncertainty alone must not manufacture learner debt;
- multiple errors with one root cause should be compressible into one Repair cluster;
- Review granularity should compress as mastery improves;
- Repair completion alone does not prove future stability;
- verification should be embedded opportunistically in later normal work where possible.

Global Review Budget means Review competes inside the same daily capacity; it is not automatically added on top of the subject allocation.

---

# 7｜Subject demand interface

Each subject may expose a compact hidden `Demand` summary to the Orchestrator.

Conceptually it should answer:

- next hard Gate;
- days remaining;
- critical remaining load;
- Review / Repair pressure;
- required pace;
- observed pace;
- estimate confidence;
- protected Floor;
- normal Target allocation;
- practical Ceiling;
- current best next action / Continue target.

The exact machine schema is implementation-owned and should remain minimal. Do not duplicate subject Truth into this layer merely to fill fields.

## 7.1｜Xizong workload Forecast contract

The Xizong Forecast exists to answer:

> Given Current learner evidence, how much **effective Xizong work** remains, how uncertain is that estimate, and what evidence would most change it?

It is an estimator, not a strategy engine.

~~~text
Current subject Truth + private learner evidence + real timer evidence
→ component workload estimates
→ planning P20 / P50 / P80
→ adversarial stress
→ Chat uses the result for scheduling
~~~

The Website / Runtime may calculate and transport factual workload estimates, but it
must not convert them into cross-subject allocation, next-subject choice, compression
policy or a learner strategy.

### Required workload components

First-round closure must keep these components separate:

1. **Knowledge closure** — Block / KP / LG Source-contact + active Recall + Block closure;
2. **System Recall** — pre-question System reconstruction and post-FIRST_PASS reconstruction;
3. **Official sweep** — Current exact System official-question scope after Holdout removal;
4. **Wrong / Uncertain Repair** — root-cause Repair clusters, not one debt item per wrong question.

Score-formation workload additionally includes:

5. **Fresh verification** — repaired / prior W-U questions that still require an independent later attempt;
6. **Formal score calibration** — least-contaminated sealed whole paper or equivalent large calibration evidence.

Completion of components 1–4 is **not** proof of 275+ capability. Components 5–6 and
actual performance evidence are required for score-formation confidence.

### Exact inventory rules

- Current canonical Block/KP/LG scope comes from Xizong Current owners.
- Official question workload may decrease only from a
  **FIRST_PASS + SYSTEM_SWEEP + Current scope hash + Current inventory hash** attempt.
- Whole-paper, Chat-set, retained, stale or unbound attempts remain performance evidence
  but do not silently reduce the first-pass System-sweep workload.
- Holdout years are subtracted from the exact current union.
- Cross-System duplicate memberships must be union-deduplicated.
- A System whose exact question scope is not accepted remains **UNKNOWN**, never zero.
- Therefore a Forecast with an unresolved System scope is a known lower bound, not a
  complete workload estimate.

### Throughput calibration

Do not assign a universal “minutes per Block / KP / question / Repair” constant.

Knowledge throughput must independently estimate at least:

~~~text
minutes / completed Block
minutes / canonical KP
minutes / Logic Group
~~~

using real route-timer evidence to completed Blocks.

The three structural estimators are intentionally redundant. Their divergence is model
uncertainty, not something to average away invisibly.

Question throughput uses real first-pass practice-route minutes per attempt.

Repair compression uses observed:

~~~text
Wrong/Uncertain source questions
→ root-cause Repair clusters
~~~

and Repair-time evidence remains provisional when timer windows are contaminated by
other Block work.

System Recall uses its own observed Recall-route timing.

### Evidence sufficiency / no fake precision

For any empirical rate family:

~~~text
0 samples    → NO_SAMPLES
1–2 samples  → REFERENCE_ONLY
3–4 samples  → PROVISIONAL P20/P50/P80
5+ samples   → empirical band may be used
~~~

Five samples alone do not make the whole model mature. Confidence must still be reduced
when, for example:

- all completed Block samples come from one System;
- Block/KP/LG estimators materially diverge;
- timer evidence is missing or suspicious;
- exact question scope is incomplete;
- W/U compression has not been observed;
- Repair duration has not been observed;
- formal score evidence is missing.

Started-but-incomplete Blocks are not given optimistic fractional credit merely from a
KP cursor. Until a stronger time-calibrated fractional signal exists, they remain fully
priced in the remaining Knowledge workload.

### P20 / P50 / P80 semantics

These are **planning workload percentiles under the Current empirical-rate model**:

- P20 = optimistic workload band;
- P50 = central workload band;
- P80 = conservative workload band.

They are not guarantees. If a required component cannot be priced, the full band is
withheld and only the known-priced lower bound may be shown.

### Future material / scenario injection

Current-year case-analysis / 狂背, four-set papers, and final five-hour material enter
the Forecast only after delta reconciliation.

Use:

~~~text
raw new material
→ deduplicate against Current owners / existing practice
→ identify replacement work
→ net new effective minutes
→ scenario injection
~~~

Do **not** add raw source duration on top of the plan when the material replaces work
already budgeted.

A scenario such as “+5h net new Xizong work” means exactly +300 effective minutes.
At a hypothetical 300 Xizong minutes/day it shifts the workload by about one Xizong
day; this arithmetic does not decide whether that material should be admitted.

### Mandatory adversarial attacks

Before calling a Xizong Forecast mature, the estimator must fail safely under at least:

- no timer evidence;
- only 1–2 completed Block samples;
- all calibration coming from one familiar System;
- highly heterogeneous Block sizes;
- stale / wrong-scope question attempts;
- cross-System duplicate question membership;
- Holdout subtraction;
- incomplete F (or any System) exact question scope;
- 30% W/U stress;
- missing Repair compression;
- missing Repair timing;
- case / 狂背 full-admission net-increment stress;
- final five-hour net-increment stress;
- missing formal whole-paper evidence.

A failed attack must either repair the estimator or lower confidence / withhold the
affected number. It must never be “explained away” while the same false precision
remains visible.

---

# 8｜Material refresh / ingestion contract

## 8.1 No continuous monitoring

Do **not** maintain an always-on public-web monitoring loop for ordinary exam materials.

Use:

- prior-year release / use rhythm as a scheduling baseline;
- fixed phase-linked reminders;
- Kian-push current-year files / updates;
- current-year public timing only as advisory evidence when explicitly checked.

Do not claim release merely because a historical date has arrived.

## 8.2 Known fixed refresh families

### Xizong — 5 fixed refresh families

1. current-year Biochemistry material;
2. TTSX current-year ten-year true-question course / transcript layer;
3. current-year case-analysis / 狂背;
4. current-year four-set sprint papers;
5. current-year final five-hour compression material.

Open external pool:

- 小凯自主命题;
- other third-party / private / semi-private mock papers.

### Politics — 4 fixed refresh families

1. current-year memory / sprint handbook support;
2. current-year current-affairs / 形势与政策 material;
3. Xiao8;
4. Xiao4.

Current 2027 Xiao1000 is already Current Question Truth and is not waiting for yearly refresh.

### English

No fixed annual refresh family is required before this exam unless Kian explicitly introduces a new external source.

## 8.3 Prior-year baseline / delta-first rule

When Kian supplies a current-year update:

```text
prior-year baseline
+ current-year source
+ Current KianOS owner(s)
→ source-preserving delta extraction
→ semantic / question / precision / priority / strategy classification
→ validate important deltas
→ update only responsible Current owners
→ existing frontend consumes the result
```

Do not rebuild the whole source merely because the packaging / video year changed.

## 8.4 No-video-first policy

Video is a Source format, not a mandatory learner surface.

Default behavior for TTSX / similar material:

```text
video / subtitle / PDF arrives
→ ingest
→ align to prior-year baseline
→ align to Current KianOS
→ extract useful delta
→ surface only learner-relevant change
```

Recommend direct video watching only when a material dynamic visual / demonstration / context dependency cannot be preserved reliably through ingestion, or real learner evidence proves the mediated version insufficient.

## 8.5 External assessment / holdout boundary

小凯 / third-party mock papers are primarily **assessment / transfer assets**, not automatic medical Knowledge Truth.

Requirements:

- preserve unseen attempt-before-explanation;
- do not leak answers / explanations before the attempt;
- external answer keys / teacher claims remain source claims until validated where necessary;
- post-attempt Wrong / Uncertain may map back into existing Xizong Repair owners;
- do not spawn a parallel knowledge system;
- screen for value before spending learner time.

Use external papers when they add at least one meaningful value such as:

- exam-like task geometry;
- high-quality unfamiliar cases;
- cross-System transfer;
- current-year framing / new question style;
- targeted diagnosis of a real weakness;
- useful full-paper execution practice.

Low-value strange / redundant papers may be `REFERENCE_ONLY` or skipped.

## 8.6 Reference timing baseline

Use previous-year timing only as a planning baseline:

```text
TTSX ten-year true-question window   ~09/16–10/24
case-analysis / 狂背                ~11/02–11/22
four-set window                      ~11/28–12/13
five-hour reference dates            ~12/17 / historical later date
```

Current-year exam reality always outranks historical release timing.

Fixed upload / refresh checkpoints:

- around 09/27–09/28 — current-year Xizong updates / Biochemistry / Score Formation prep;
- 10/21 — next-phase Xizong delta + Politics memory/current-affairs refresh;
- ~11/02 — case-analysis / 狂背 upload window;
- ~11/28 — four-set / 小凯 / external mock holdout window + late Politics simulation refresh;
- 12/05 — final Politics sprint-material refresh + final integration;
- ~12/17 — final five-hour / Xizong compression delta, constrained by real exam timing.

---

# 9｜Learner-facing information budget

Principle:

> **Backend may be complex; learner frontend must stay simple. Complexity is used to make decisions, not to display complexity.**

## Level 1｜Default Home

Show only what changes today's behavior:

- next hard Gate + days remaining;
- today's subject allocations;
- simple subject state such as `normal / needs acceleration / overloaded`;
- Continue;
- at most one actionable Attention item;
- actionable material reminder only when relevant.

Example shape:

```text
10/21 First Formal Score Closure · 18 days

Xizong   main push · 5h30
English  maintain  · 2h
Politics progress · 2h

Continue → current highest-value action

Attention → only if action really changes
```

## Level 2｜Why / on-demand

May show:

- why one subject receives more / less capacity;
- major Review / Repair pressure;
- material-readiness issue;
- plain-language Gate-risk / phase-slack explanation.

## Level 3｜Diagnostic / debug only

May show:

- raw mastery/stability estimate dimensions;
- detailed workload pools;
- confidence / freshness internals;
- evidence history;
- timing distributions;
- calculation traces.

V1 must be fully usable without Level 3.

Do not place on the default learner surface:

- raw mastery percentages;
- engineering taxonomy;
- audit / routing / canonical labels;
- large review-debt counters;
- dozens of status cards;
- fake-precision workload numbers that do not change action.

---

# 10｜Daily operating loop

The Orchestrator should behave conceptually as:

```text
Morning / entry
→ resolve current Phase + next Gate
→ read real capacity
→ read compact subject Demand summaries
→ protect Floors
→ allocate elastic capacity
→ surface Today / Continue / Attention

Study
→ subject runtimes execute their own cognition
→ meaningful learner evidence accumulates privately

Replan
→ actual time / progress / evidence updates estimates
→ future allocation recalculates
```

The learner should mostly do two things:

1. report / expose meaningful real-world capacity changes when needed;
2. actually study.

Current website ↔ Chat daily handoff is:

```text
Home / private learner state
→ kianos.daily-learning-packet.v1
→ Chat planning under this contract
→ kianos.exam.chat-plan.v1 for the same study_day
→ Home validates/imports
→ subject study
```

The Daily Learning Packet is factual learner/runtime evidence, not an engineering-control request. A fresh Chat should not enter root engineering Current merely because the packet mentions KianOS. Subject-specific typed Returns remain separate from this cross-subject plan.

The learner should not be required to maintain the scheduling model manually.

---

# 11｜Non-goals / stop rules

The Exam Orchestrator is **not**:

- a fourth exam subject;
- a second mastery truth;
- a giant task-management dashboard;
- a fixed timetable that produces debt when reality changes;
- a universal subject-learning workflow;
- a reason to reopen stable subject cognition;
- a requirement to consume every external material;
- a reason to watch a course merely because the source is video;
- permission to burn protected holdout material for bookkeeping;
- a reason to keep optimizing KianOS instead of studying.

After learner-facing V1 supports correct Today / Continue / Attention / Gate behavior, further orchestration complexity requires real learner evidence that the simpler model is insufficient.

---

# 12｜Implementation handoff

Implementation belongs downstream of this contract.

The consumer / runtime must:

- read subject-local Current semantics without taking ownership of them;
- keep private learner evidence private;
- use current subject runtime/evidence as inputs rather than duplicating them;
- preserve holdout boundaries;
- preserve domain-specific natural units;
- support rolling capacity replanning;
- surface only the minimal frontend described above;
- remain compatible with Global Home as a single-viewport Mac command center.

If implementation appears to require changing a subject's learning semantics, evidence meaning, Source ownership, or mastery definition, stop and return the issue to the responsible subject owner rather than modifying it inside the Orchestrator.

Design provenance: Issue #211. Implementation follow-up: Issue #224.
