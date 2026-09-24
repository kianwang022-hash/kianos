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

### Explain estimates when they affect a decision

Observed study time, attempts and source identities are facts. Remaining workload, future capacity, retention and future scores are estimates or assumptions; their presence in a Packet does not turn them into facts. A target is an intention, not a predicted outcome.

When Kian asks whether the plan is realistic or why it changed, Chat should explain briefly in natural language:

- which current observations support the answer, and their subject/task/source scope;
- the conditional range and the assumptions about usable time or pace;
- what is still unknown or unpriced, including material outside the estimate;
- which plausible change would alter the decision, and the next useful bounded action.

Do not present empirical sample quantiles as a future confidence interval or sample count as proof of calibration. Never pool unrelated subjects/tasks, count repeated observations as independent evidence, infer current capability from stale source identities, or add subject ranges into a calibrated total-score probability. Preserve native UNKNOWN / PROVISIONAL / UNPRICED boundaries. Historical scores describe those attempts; fresh score prediction needs appropriate independent current evidence.

Missing or unreliable Forecast must not block ordinary learning. Chat can propose a short, explicitly provisional next step from healthy evidence and available capacity, then revise after actual use. Do not consume fresh exam material, create extra tests for Kian, or ask for repeated manual reports merely to make the model look calibrated. A failed estimate does not authorize the Website to invent a replacement strategy.

When an admitted material revision replaces the same native learning object, the Website may notify Kian and offer one-click entry into the current version while preserving old records. A source hash change alone does not require Chat approval or a new plan. Bring the change to Chat only when its substance affects learning strategy or the current arrangement; unavailable or ambiguous source identity still blocks that affected entry.

### Frontstage week / day visibility

The learner-facing control surface may show a compact **Today / This Week / Next Gate** projection, provided it remains downstream of Chat and current canonical facts.

```text
phase / Gate facts                    <- this contract / current canonical owners
rolling week reference                <- Chat / Steward judgment
Today tasks / current-day allocation  <- resolved Chat plan
Calendar blocks                       <- time placement only
subject Runtime evidence              <- actual learning truth
```

A future UI may let Kian check a Today item. That check is presentation/execution acknowledgement only; it is not learner evidence, mastery, a score claim, or permission to suppress native Wrong/Uncertain/Recall state. Weekly progress may display supported counts/ranges or `UNKNOWN`; Website must not infer a percent from missing evidence.

This visibility layer must not become:
- a second scheduler;
- a second learner ledger;
- automatic carry-over debt;
- an autonomous weekly quota engine;
- a replacement for the fixed Hard Gate hierarchy or subject-native Resume/evidence.

Calendar answers **when**. The task projection answers **what**. Chat owns **why / change**. The Website only renders the current resolved projection and keeps any UI-only check state semantically separate.

No new packet/task database is required merely to display this. If implementation later needs additional optional presentation fields, extend the existing Chat-controlled path rather than creating another planning owner.


#### Existing Chat Plan presentation projection

The existing `kianos.exam.chat-plan.v1` may carry one optional `presentation` object. This is a **read-only frontstage projection** of the same resolved Chat / Steward decision; it does not change the schema owner, create a scheduler, or become learner evidence.

```json
{
  "presentation": {
    "today_tasks": [{"id":"stable-id","subject":"xizong | english | politics | null","label":"learner-facing task","note":"optional context"}],
    "week_reference": [{"id":"stable-id","subject":"xizong | english | politics | null","label":"weekly reference","detail":"optional","value":"optional","progress_ratio":"optional 0..1 only when supported"}],
    "schedule_blocks": [{"id":"stable-id","subject":"xizong | english | politics | null","start":"HH:MM","end":"HH:MM | null","label":"calendar title","detail":"optional"}]
  }
}
```

Hard boundaries:

- `today_tasks` are display/checklist rows only. Website-local check state is UI state and **must not** enter Chat Plan, Daily Packet, learner evidence, mastery, score or Forecast.
- `week_reference` is a rolling reference, not debt or an autonomous quota. `progress_ratio` is omitted when current evidence does not support a meaningful ratio.
- `schedule_blocks` contains **today only**. Steward should project the same resolved solo study / recovery / Review blocks that it renders to Calendar; Home is a glanceable mirror, not proof that Google Calendar sync succeeded and not a second calendar ledger.
- The existing right-side `next_subject` + native `session_ref` path remains the **single Chat-controlled exact execution route**. Presentation rows do not invent task URLs.
- Left Xizong / English / Politics Resume surfaces remain subject-native and available even when the Chat Plan is missing, stale or rejected.
- A full Calendar link may leave KianOS for Google Calendar; editing Calendar does not mutate learner evidence.

### Typed private cross-subject plan

The current private control packet is:

```text
kianos.exam.chat-plan.v1

study_day
generated_at
learner_evidence_basis  required; copy the current same-day Daily Packet basis exactly
subjects
  xizong / english / politics
    target_minutes   optional
    role             optional learner-facing label
    note             optional Chat rationale
    session_ref      optional pointer to subject Session Instruction
next_subject         optional
attention            optional
```

The machine owners are [plan validation](static-web/src/lib/examChatPlan.mjs) and [control command validation](static-web/src/lib/privateControlCommand.mjs). Exact private submission, retry and receipt routing is [Personal OS control delivery](https://github.com/kianwang022-hash/kian-personal-os/blob/main/runtime/kianos-control/README.md). A missing/stale basis allows advice and native Resume, not a fabricated executable plan.

This packet is private learner/control state. It must not be committed to public canonical Content.

### Approved integrated surface extension — not current wire capability

The 2026-09-24 product direction separates strategic Home, detailed Steward (Today/Week/Month/Review plus life execution), filtered Radar and shared quick-capture Dock. Exact requirements stay in [Personal surface projection](https://github.com/kianwang022-hash/kian-personal-os/blob/main/HOME_PROJECTION.md) and [execution contract](https://github.com/kianwang022-hash/kian-personal-os/blob/main/exam/STEWARD_CONSOLE_CONTRACT.md); [INTAKE](https://github.com/kianwang022-hash/kian-personal-os/blob/main/exam/roles/INTAKE.md) owns mail/Radar filtering and obligation closure.

The `presentation` shape and UI-only checklist boundaries above remain the CURRENT machine contract. Week/month Steward data, life actuals, exact per-block native task links and proposed Steward/Radar command kinds require an explicit versioned adapter/validator/consumer/checkpoint extension; they cannot be smuggled into old fields or treated as implemented. Keep future reference plans distinct from today's basis-bound executable plan.

Internal Steward time placement is not a Calendar write and is not restricted to categories authorized for Calendar mirroring. Calendar native commitments retain their source and action permissions. Schedule occupancy is not a net study target; recorded timer time is not mastery. Preserve whole-day `target_minutes` accounting and exact native learner basis.

A same resolved day's coupled exam/execution projections must apply consistently, with immutable command ID/hash, latest-base reconciliation and verified applied effect. Radar and native mail/Calendar actions are independently acknowledged, never fabricated as part of a universal transaction. Runtime reality is private and semantically separate from subject evidence; public content/builds must never contain personal payloads. UI geometry remains pending Kian discussion.

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
- 09/27 is a **stop line**. Small remaining tails may roll into the next phase as bounded closure backlog; the whole phase must not remain indefinitely “first round”.

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

- current score band toward 270+;
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


## 4.5 Recovery / cognitive-capacity input

KianOS does **not** own Kian's personal recovery / readiness model.

Current ownership:

```text
Health / wearable source facts
→ native Health source

personal recovery / capacity interpretation
→ Personal `health/RECOVERY.md`

exam demand / subject priority / cross-subject planning priors
→ this contract + subject owners

adaptive allocation / day plan
→ Chat
```

When recovery materially affects exam execution, Chat may consume a **bounded Personal recovery/capacity conclusion** such as:

```text
usable capacity: normal | constrained | unknown
high-load tolerance: normal | reduced | unknown
placement / recovery constraint: bounded natural-language conclusion
confidence / important missingness when decision-relevant
```

This is an interface boundary, not a requirement for a fixed schema. Missing Personal/Health evidence degrades only the dependent recovery claim; it does not block ordinary native study or authorize KianOS to reconstruct a replacement personal model.

KianOS owns only the **exam/product consequence** of that input:

- preserve Gate / Demand / score / workload priority semantics;
- place or shorten high-load work when the accepted constraint justifies it;
- keep lower-load work available where useful;
- preserve user agency and UNKNOWN;
- never turn favorable recovery into extra study obligation;
- never convert health interpretation into learner mastery or public repository truth.

Raw health samples and personal calibration remain outside shared KianOS Content. Real task-performance evidence remains KianOS learner/execution evidence and may return to Chat / Personal for interpretation.

The retired `RECOVERY_COGNITIVE_CAPACITY_MODEL.md` and its Acceptance file are provenance only and are not Current planning authority.

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
→ read real clock-time capacity
→ when current private wearable/Health evidence is available and useful, build Recovery Context under §4.5
→ resolve usable cognitive-capacity / load-placement constraints without inventing missing Health data
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
+ optional current private Recovery Context from connected Health / wearable evidence
→ Chat planning under this contract
→ kianos.exam.chat-plan.v1 for the same study_day
→ Home validates/imports
→ subject study
```

The Daily Learning Packet is factual learner/runtime evidence, not an engineering-control request. A fresh Chat should not enter root engineering Current merely because the packet mentions KianOS. Subject-specific typed Returns remain separate from this cross-subject plan.

Recovery Context is optional private planning evidence. Missing, stale or unsynced Health data must not block ordinary planning; Chat falls back to real capacity + subject evidence and states the recovery uncertainty only when it changes the decision. Raw wearable samples are not copied into shared GitHub or treated as learner mastery evidence.

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
