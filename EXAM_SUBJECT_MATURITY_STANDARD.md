# Exam Subject Maturity Standard

Status: **CANDIDATE — highest-bar shared acceptance standard**

Scope: Xizong / English / Politics subject systems.

Purpose:

> A subject is mature only when score goals, abilities, materials, methods, evidence, forecast, dynamic control, future-source handling, Chat↔Website execution, failure recovery and real learner use form one closed learning loop.

This is not a requirement for more architecture. It is a requirement that every retained component materially improves learning, prediction, execution, robustness or learner attention cost.

---

## 0. Score closure

Each subject must define:

- target score;
- protect/floor target where applicable;
- working/upside target;
- score channels / section weights;
- acceptable loss budget;
- what uncertainty remains before current-year evidence arrives.

A total-score target alone is insufficient.

Required artifact:

```text
score target
→ section/channel target
→ loss budget
→ evidence needed to believe the target is currently viable
```

Unknown must remain UNKNOWN. No model may manufacture a current score estimate merely because a planning number is needed.

---

## 1. Ability closure

Every score channel must resolve into trainable cognitive abilities.

Each ability must answer:

- what the learner must actually be able to do;
- what common failure looks like;
- what distinguishes exposure, understanding, repair and stable independent performance;
- what later-phase capability is different from first-round capability.

No generic “mastery” label may replace subject-native cognition.

Required artifact:

```text
score channel
→ capability
→ failure modes
→ training operation
→ valid evidence
```

---

## 2. Material closure

For every required ability, identify the material that trains it.

Classify material as:

- Current canonical source;
- training / question asset;
- derived or synthetic asset;
- historical baseline;
- future current-year source slot;
- reference-only / optional.

Rules:

- Existing high-value material must be prepared before learner demand appears.
- If an ability lacks training material, generate or derive the missing asset when legitimate.
- Synthetic material requires quality gates and cannot impersonate real exam score evidence without calibration.
- Future unpublished facts/content may not be fabricated.
- Prior-year material should be absorbed now as baseline, task geometry, delta scaffold and training design where useful.
- When current-year material arrives, the default is delta ingestion, not redesign.

A subject fails Material Closure if the learner reaches a phase and Chat must invent the training system or hunt for basic material at that moment.

---

## 3. Method closure

Every material family must have a defined learning use.

The method must specify when to:

- first learn / reactivate;
- compress;
- retrieve;
- attempt questions/tasks;
- review;
- repair;
- verify transfer;
- maintain;
- stop;
- escalate to deeper source work.

Rules:

- Stable work stays cheap.
- Wrong/Uncertain does not automatically create one task per event.
- Multiple symptoms sharing one cause should compress into one repair where valid.
- No mandatory ritual survives unless it improves score-relevant learning.
- Quantity completion alone cannot close a capability.

---

## 4. Evidence closure

Subject evidence semantics must be explicit.

Required distinctions include, where applicable:

```text
seen != learned
learned != recalled
immediate recall != delayed stability
correct != understood
same-item correction != fresh transfer
repair != stable capability
single-section stability != whole-paper execution
```

The system must define evidence strength for:

- first attempt / first output;
- repaired attempt;
- changed-context transfer;
- delayed retrieval;
- timed execution;
- whole-task / whole-paper execution;
- contaminated / exposed material.

No evidence state may silently become a mastery score.

---

## 5. Forecast closure

Forecast exists to estimate capacity and Gate risk, not to dictate today's task count.

Each subject forecast must expose:

- remaining structural load;
- observed throughput;
- major uncertainty;
- P20 / P50 / P80 or equivalent conservative ranges when evidence supports them;
- sensitivity to the largest unknown parameters;
- known parameter ranges / thresholds that would flip a material conclusion when identifiable;
- next evidence that would most reduce forecast uncertainty;
- score-path confidence separately from workload confidence.

Forecast must be recalibrated from real learner evidence.

Hard rules:

- No fake precision from arbitrary per-item constants.
- No static completion date survives contradictory evidence.
- No P20/P50/P80 number directly chooses today's learning action.
- Early-phase political/current-year uncertainty is allowed to remain wide.
- A prediction model must be falsifiable and must record which assumptions its conclusion depends on.

---

## 6. Dynamic control closure

Today's action is controlled by current evidence, not by a historical fixed schedule.

A subject must support:

```text
uncalibrated / reactivate
→ build
→ verify
→ secure/stabilize
→ maintain
→ elastic improvement
```

Exact states may differ by subject.

Each capability must have:

- minimum effective exposure / dose where useful;
- performance evidence gate;
- automatic decrease-in-practice triggers;
- automatic increase-in-practice triggers;
- ROI stop rule.

After the protected floor is viable, extra time must compete against other available study actions by marginal score value / risk reduction / transfer value / future compounding / opportunity cost.

---

## 7. Future-source lifecycle closure

Every known annual refresh family must have a prepared slot before arrival.

For each family define:

- expected role;
- prior-year baseline if available;
- current owner;
- ingestion / validation rule;
- delta extraction;
- freshness risks;
- derived assets to update;
- learner-facing use;
- what must never be promoted from legacy alone.

The learner must not need to ask “how do we use this new file?” when a known source family arrives.

---

## 8. Execution and transport closure

The durable execution relation is:

```text
Current durable assets + private learner evidence
→ Chat decision
→ typed plan / instruction
→ Website executes
→ learner evidence
→ Chat
```

Website must not become a second strategy engine.

The execution loop must prove:

- one clear Next Action;
- resume/continue;
- evidence capture;
- stale/invalid plan rejection;
- replay/idempotency where relevant;
- checkpoint/restart recovery;
- no hidden fallback strategy when Chat plan is absent;
- exam-modality fidelity where delivery medium changes performance.

When the real exam uses paper, handwriting, answer-sheet transfer or physical page switching in a score-relevant way, at least some formal execution evidence must preserve or calibrate that cost. Keyboard/browser speed may not silently stand in for handwriting/paper execution.

Normal learner operation should require the fewest manual maintenance actions possible.

---

## 9. Adversarial and failure closure

Each subject requires a dedicated adversarial suite.

The suite must attack at least:

- slower-than-forecast progress;
- higher-than-forecast error rate;
- heterogeneous task sizes;
- duplicated/cross-owned items;
- missing evidence;
- missing timer data;
- corrupted/private state;
- stale plan;
- replayed plan;
- browser restart;
- low-capacity day;
- multi-day bad week;
- false Secure judgment;
- low-ROI task selection;
- repair explosion;
- memory explosion / relapse;
- source conflict;
- current-year source delay;
- second revision of a current-year source;
- whole-task failure despite component stability.

Every attack asks not only “does the program crash?” but:

- does the learning decision become wrong;
- can it manufacture false debt;
- can it contaminate fresh evidence;
- can it promote stale source as Current;
- does learner manual repair become necessary;
- does the system fail closed or degrade safely.

The adversarial suite itself must not be a small fixed set of happy/unhappy scripts. Use, where relevant:

- parameter grids across throughput / error / retention / capacity;
- boundary values and empty/full extremes;
- randomized combinations of otherwise valid learner states;
- counterfactual policy comparisons;
- historical sanity checks against known prior performance/material behavior;
- stale/replay/duplicate/partial transport variants;
- sensitivity sweeps that identify the parameter or threshold at which a Forecast/control conclusion flips;
- metamorphic invariants such as “renaming/reordering irrelevant metadata must not change the learning decision”.

A mature report must distinguish:

- high-confidence conclusions;
- conclusions conditional on one or more learner parameters;
- known flip points / decision boundaries;
- the next evidence with highest value for reducing uncertainty.

A happy-path test suite cannot produce a mature verdict.

---

## 10. Attention-cost closure

Backend complexity is justified only if it reduces learner attention cost or increases decision quality.

Default learner surface should expose only:

- what to do now;
- why only when needed;
- what changed materially;
- whether learner input/decision is required.

The learner should not maintain:

- task ledgers;
- mastery scores;
- review calendars;
- source inventories;
- progress spreadsheets;
- manual forecast parameters.

Normal interaction should be bounded to the smallest necessary learner inputs, typically:

- report material capacity/availability changes only when reality changes materially;
- perform the assigned Next Action;
- provide one bounded Daily/Review handoff when Chat judgment is actually needed;
- use a low-friction override when the learner knows a task is impossible, mis-specified, already exposed, or inconsistent with current reality.

Learner override is evidence/input, not permission to silently rewrite canonical Source truth. The next Chat decision should reconcile it explicitly.

Instrumentation should be automatic where possible and must not distort study behavior merely to collect richer telemetry.

If the system requires ongoing manual bookkeeping from the learner, maturity is not achieved.

---

## 11. Ownership / maintainability closure

A mature subject has one responsible owner for each durable truth.

It must not create:

- a second Knowledge system;
- a second learner-state ledger;
- a second scheduler;
- duplicated source truth;
- UI-owned semantics;
- strategy logic hidden inside the Website.

When a current-year source arrives, when Chat changes, or when the learner resumes in a fresh conversation, the system should still resolve the same semantic truth from Current owners.

---

## 12. Fresh-Chat and no-Website falsification

Two mandatory acceptance attacks:

### Fresh Chat attack

A completely fresh Chat receives only:

- Current durable owners;
- the current Daily / Resume / subject evidence packet;
- current exam facts.

It must be able to make a defensible next decision without relying on undocumented conversation memory.

### No-Website semantic attack

If the Website is removed, the subject's:

- learning semantics;
- source ownership;
- evidence meaning;
- forecast meaning;
- repair logic

must remain correct.

The Website is an execution surface, not the hidden owner of learning logic.

---

## 13. Real learner U closure

Synthetic/browser/CI proof cannot manufacture learner capability.

A subject remains partially unvalidated until real use supplies enough evidence for:

- throughput;
- friction;
- error structure;
- retention;
- transfer;
- timing;
- actual plan-following cost.

Real learner evidence may reopen any prior engineering or modeling assumption.

Acceptance must distinguish two states:

- **SYSTEM_LOGIC_ACCEPTED** — architecture / semantics / evidence / forecast logic survived engineering, synthetic and adversarial proof;
- **KIAN_SPECIFIC_CALIBRATED** — enough real learner evidence exists to calibrate Kian-specific throughput, error structure, retention, transfer, friction and forecast parameters.

The first may close before sufficient real learner use exists. It must never be described as the second. Lack of enough Learner U blocks Kian-specific claims, not every system-level maturity claim.

---

## 14. Target authority and score semantics

Before freeze, every subject must reconcile score targets against the canonical cross-subject target owner.

A mature target model distinguishes:

- **protect floor** — score path that must remain viable;
- **working target** — the capability level the subject is actively built to support;
- **elastic upside** — additional score/variance improvement that may receive capacity only when marginal value remains competitive.

Rules:

- a subject-local working/stretch target may be higher than the cross-subject protect floor;
- it must not silently replace the shared allocation target;
- contradictory target owners block maturity freeze;
- target changes must trigger re-evaluation of loss budgets, Forecast and Elastic rules.

---

## 15. Construct coverage and negative-space closure

A capability cannot be treated as stable merely because repeated work produces no new defect.

Before No-new-information or reduced-practice logic is trusted, evidence must cover a representative set of the capability's:

- major mechanisms;
- task forms;
- difficulty/risk bands;
- contexts where failure would materially affect score;
- timed/integrated conditions when those are part of the real construct.

Rules:

- untested mechanisms remain UNKNOWN, not implicitly stable;
- a Minimum Dose / evidence floor is necessary but not sufficient;
- homogeneous/easy/familiar sampling cannot justify broad Secure;
- rare but high-impact failure modes may require targeted sampling even when average performance is strong.

---

## 16. Measurement and scoring validity closure

Subjective or model-mediated scoring must carry measurement uncertainty.

Applies especially to:

- English Translation;
- English Writing;
- Politics Analysis Output;
- any generated rubric or model-rated free response.

Requirements:

- one explicit scoring/rubric owner;
- anchored examples / score descriptors appropriate to the real exam task;
- known uncertainty / rater sensitivity reflected in Forecast;
- one Chat/model score cannot alone produce high-confidence score evidence;
- when a score materially changes strategy, use anchored re-score, independent second review, or another accepted calibration method where feasible.

Operational metrics such as completion count, W/U rate, Recall labels, speed, synthetic accuracy or workflow completion are proxies. They may not outrank fresh/authentic whole-task performance on the score-relevant construct.

---

## 17. Decision-quality closure: protect against both optimism and over-conservatism

A mature control loop must attack both:

- **false Secure** — reducing work while capability is unstable;
- **false Unstable** — keeping stable work in Build/Verify and wasting capacity.

For material decisions Chat should be able to reconstruct:

- evidence used;
- important assumptions;
- confidence / known unknowns;
- what evidence would falsify the decision;
- re-check / reopen trigger.

High-impact strategy decisions must be reproducible/challengeable by a fresh audit from durable evidence.

The Website validates identity, freshness and typed instructions; it does not become the second strategy judge.

---

## 18. Evidence observability, revision and material-identity closure

Evidence is often selected rather than random. Missing evidence must not silently mean success.

Requirements:

- evidence coverage / observability is explicit;
- lack of W/U, Memory or Repair records does not prove stability;
- representative baseline/maintenance sampling exists where silent work would otherwise create blind spots;
- important learner evidence binds to task/material identity and the relevant semantic/content revision;
- a semantic revision defines whether prior evidence is PRESERVE / MIGRATE / STALE;
- incompatible evidence fails closed.

Freshness follows material identity where resolvable, not filename, page, device, tab or session identity.

Duplicate / near-derivative materials must be classified before serving as Calibration / Transfer / formal Score evidence. Unknown exposure remains UNKNOWN.

---

## 19. Adaptive generated-asset lifecycle closure

Generated material is allowed to grow from real learner need, but generation itself must not create a new maintenance burden or fake transfer.

Every generated asset used as meaningful evidence should carry, at minimum:

- intended capability / mechanism;
- evidence role: Teaching/Repair, Calibration, Transfer, Maintenance or Stress/Edge;
- source grounding where factual truth matters;
- version / identity;
- independence from the repair example when used for transfer;
- calibration status;
- dedupe / retirement rule.

Rules:

- most one-off Repair material may stay ephemeral;
- reusable validated assets may be promoted;
- a Teaching/Repair object may not later masquerade as independent Transfer for the same mechanism;
- generated bank size is not a maturity metric;
- synthetic success must be challenged periodically by appropriate authentic/fresh evidence.

---

## 20. Value-of-information, learning-latency and latest-useful-date closure

The next evidence or learning action is not chosen only by immediate point gain.

For material uncertainty, Chat should prefer evidence with high **decision value**:

> evidence likely to change Secure status, score confidence, Gate risk or cross-subject allocation.

Evidence collection itself consumes learner time and fresh-material capital.

Marginal-value reasoning should also include:

- time-to-convert learning into reliable performance;
- prerequisite / compounding value;
- probability the gain matures before the next Gate;
- latest useful date;
- downside of delaying a slow-to-build but important capability.

This prevents short-term ROI from starving high-value abilities whose payoff is delayed.

---

## 21. Future-source failure, supersession and rollback closure

Known annual sources must be robust not only to normal arrival but also to:

- late arrival;
- partial release;
- poor/low-value release;
- internal conflict;
- second revision;
- source never arriving.

Every future-source family needs:

- fallback behavior;
- partial-ingestion semantics;
- provenance / quality gate;
- supersession rule;
- rollback or invalidation of dependent derived assets;
- rule for when to stop waiting and use alternative training/evidence.

A later revision must not leave superseded derived content silently active.

---

## 22. Concurrent-state and bounded-context closure

Attack state races such as:

- Daily Packet copied, then more learning occurs before plan import;
- two tabs/devices change private learner state;
- restore checkpoint conflicts with newer local evidence.

Requirements:

- stale plan / restore conflicts fail closed;
- replay remains idempotent;
- no import silently erases newer evidence;
- when possible, typed instructions bind to the relevant study day / evidence identity.

Fresh-Chat maturity also has a context budget:

- ordinary known-scope planning should resolve through a bounded owner path;
- Current + exact subject owner + bounded learner packet should normally suffice;
- repeated broad repository archaeology is an ownership/routing defect.

---

## 23. Independent anti-anchored audit closure

A Candidate may not freeze merely because its Builder wrote a strong self-attack and all Builder-owned checks pass.

Before freeze, one Fresh Independent Audit must:

- start from the acceptance requirements, Current durable owners and raw/primary evidence needed for the claim;
- derive its own verdict before reading the Builder's expected conclusion, reconciliation notes or preferred fix whenever practical;
- attack the strongest plausible learner-risk failure, not merely replay the Builder's happy-path checks;
- record disagreements as evidence questions, not average them away;
- lower confidence / keep UNKNOWN when disagreement cannot be resolved without new evidence.

Builder self-attack and Fresh Independent Audit are complementary. They are not substitutes for one another.

For material claims, the audit result must make clear:

```text
independent observation
→ independent interpretation
→ verdict
→ only then reconciliation with Builder
```

A mature standard cannot certify itself only with tests whose expected answer was defined by the same reasoning that built the Candidate.

---

## 24. Adversarial methodology closure

A mature adversarial suite is not a list of hand-picked scenarios.

Where the model or control decision has meaningful parameters, the audit must use an appropriate mix of:

- parameter grids across major uncertainty axes;
- boundary / extreme values;
- counterfactual substitutions;
- historical backcast / sanity checks where comparable history exists;
- randomized or combinatorial scenario sampling with reproducible seeds / recorded inputs where useful;
- metamorphic invariants: changes that should preserve a conclusion, and changes that must flip it;
- missing / stale / duplicated / corrupted evidence and transport-state failures.

The purpose is to discover **decision flip surfaces**, not to manufacture a large test count.

For every material conclusion, the audit should identify when evidence supports it:

- which inputs it is robust to;
- which learner-specific parameters it depends on;
- which parameter or combination can reverse the decision;
- the smallest new evidence likely to move the conclusion across that boundary.

A suite fails this requirement if all scenarios are independently reasonable but no interaction between parameters is tested when interaction could change the learning decision.

---

## 25. Causal repair and discrimination closure

Wrong / Uncertain / weak Recall / low score is an observation, not automatically the root cause.

When two plausible causes would imply materially different repairs, the system must prefer the smallest discriminating check that can separate them before reopening larger scope.

Examples of distinct causes may include:

- knowledge model missing;
- precision retrieval unstable;
- option / distractor boundary failure;
- task-form misunderstanding;
- timing / fatigue;
- wording or language failure;
- contaminated familiarity;
- execution / transport artifact.

Rules:

- if the same low-cost reversible action fits all plausible causes, explicit diagnosis may be skipped;
- if repairs differ materially, guessing the cause is not acceptable;
- improvement on the same repaired item is insufficient causal confirmation;
- Repair completion must preserve the original observation and be followed by changed-context / delayed / fresh evidence appropriate to the capability;
- repeated symptoms may compress into one Repair only when shared cause is supported, not merely convenient.

A mature loop minimizes both under-repair and unnecessary reopening of large content scope.

---

## 26. Subject-specificity / anti-homogenization closure

The shared standard defines the **questions every subject must answer**. It does not define one universal answer shape.

A Fresh Audit must actively look for accidental cross-subject leakage such as:

- copying one subject's review cadence into another;
- turning English Minimum Dose into a generic fixed-quantity requirement;
- turning Xizong delayed-stability logic into a Politics scheduler;
- turning Politics Memory behavior into a universal learner-state model;
- using one cross-subject mastery score, Repair policy or Secure threshold where subject-native cognition differs.

Shared infrastructure may own transport primitives such as Home, Chat Plan, Daily Packet, Timer and checkpoint/replay semantics.

Subject-native owners must continue to own:

- capability semantics;
- evidence meaning;
- material use;
- Repair logic;
- retention / maintenance behavior;
- score-calibration semantics;
- Forecast parameters and readiness Gates.

Cross-subject consistency is a virtue only when the underlying responsibility is genuinely shared. If a shared rule worsens a subject's learning decision, the subject-specific rule wins within the shared transport boundary.

---

## 27. Stop rule


Maturity does not mean infinite optimization.

Stop expanding when:

- the score/ability/material/method/evidence/forecast/execution loop is closed;
- adversarial attacks no longer reveal material learner-risk defects;
- remaining uncertainty is genuinely dependent on future source or real learner use;
- another architecture layer would not change learning behavior or decision quality.

At that point:

```text
real study
> more architecture
```

---

# Required subject-level acceptance package

Each subject must eventually provide a compact acceptance package containing:

1. Score → Ability → Material → Method → Evidence matrix.
2. Full material inventory including future-source slots and derived/synthetic gaps.
3. Subject-native dynamic control rules.
4. Forecast model + sensitivity / calibration report.
5. Adversarial stress report.
6. Chat↔Website execution proof.
7. Real learner U status and known unknowns.
8. Explicit remaining blockers / future-source dependencies.
9. Fresh Independent Audit result with anti-anchored verdict and reconciliation.
10. Adversarial methodology report including parameter interactions / decision flip points where material.
11. Causal Repair / discrimination policy for observations that admit multiple materially different causes.
12. Real Learner U state: SYSTEM_LOGIC_ACCEPTED vs KIAN_SPECIFIC_CALIBRATED.

A subject may not be declared “mature” while one of these is absent and material to the target score.

The acceptance package must also name:

- canonical target authority and protect/working/elastic target semantics;
- representative coverage gaps / unobserved high-risk mechanisms;
- subjective scoring uncertainty where applicable;
- decision falsifiers / reopen triggers;
- evidence revision / exposure-identity policy;
- future-source fallback / supersession rules;
- proof that shared requirements have not silently imposed another subject's cadence, evidence semantics or control policy.

This standard itself is subject to the same economy rule as the product: a requirement should be deleted or collapsed when it adds maintenance but cannot change a learning, evidence, forecast, execution-safety or attention-cost decision.
