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
- no hidden fallback strategy when Chat plan is absent.

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

---

## 14. Stop rule

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

A subject may not be declared “mature” while one of these is absent and material to the target score.
