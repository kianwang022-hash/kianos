# Politics Maturity T1 — Objective Gap Reconciliation

Status: **CLOSED — NO FIRST-ROUND STRUCTURAL REBUILD REQUIRED**  
Parent: `MATURITY_STAGE_PLAN.md`  
Scope: T1 only — first-round structural/evidence gap reconciliation.

## Verdict

The current first-round Politics engine is structurally sufficient to continue into maturity Forecast work.

T1 found **no justification** for rebuilding Natural Unit routing, Xiao1000 release order, Review, Memory, Home, packet, or learner-state architecture.

The remaining maturity work is downstream:

```text
existing first-round evidence
→ richer factual Objective split
→ early Forecast
→ Analysis-output foundation
→ future-source delta ingestion
```

## 1. Structural coverage

Current independent Acceptance already proves the repaired catalog boundary:

- 1148 Xiao1000 training records are accounted for;
- 1127 have a Current ready owner;
- 21 remain intentionally withheld because whole-question prerequisites are not yet ready;
- 24 reference-only material records are not training questions;
- six previously premature K03 releases were already moved to later valid owners;
- whole-question readiness must include decisive distractor dependencies, not merely a current-unit hit.

Conclusion:

**PASS.** The 21 withheld items are not missing coverage and must not be force-released for cosmetic completeness.

No new question-order or Natural Unit repair is authorized by T1.

## 2. Objective load truth

Machine reconciliation against `source/xiao_2027_question_assets.json`:

- total: **1148**
- single-choice: **528**
- multiple-choice: **620**

This matches the Politics maturity requirement and may be used as the fixed learning-load denominator for the current Xiao1000 catalog.

It is a workload fact, not score evidence.

## 3. W/U evidence and root-cause compression

Current Workbench already records:

- outcome: STABLE / WRONG / UNCERTAIN;
- optional learner cause:
  - `memory` — 没记住
  - `understanding` — 没想明白
  - `options` — 选项没辨清
  - `careless` — 看错 / 粗心
- optional learner note;
- first-attempt source context;
- later outcome without overwriting first evidence.

The learner-triggered Return packet also freezes:

```text
group_by_underlying_failure = true
keep_unrelated_failures_separate = true
no_follow_up_is_valid = true
```

and exports cause/note/context per question.

### Decision

Do **not** expand the learner UI into a larger cause taxonomy.

More specific maturity distinctions such as:

- multi-select boundary;
- actor / identity;
- chronology;
- hat / scope / wording;
- incomplete prerequisite coverage

can be diagnosed from the question type/content/source context plus learner note during Chat Review.

Adding more learner buttons would increase friction without proving better diagnosis.

### Remaining evidence boundary

The architecture supports many-W/U → few-root-causes compression, but real learner effectiveness still requires actual Review batches.

Therefore:

- engineering semantics: **PASS**
- real learner compression quality: **U / pending real evidence**

This is not a reason to block T2.

## 4. Memory admission

Current Learning/Runtime already enforce:

- candidate != review debt;
- source support required;
- explanation richness alone does not admit Memory;
- stable correct alone does not admit Memory;
- cross-day FORGOT / FUZZY / STABLE are evidence, not mastery;
- stale/deleted/changed candidates fail closed;
- no fixed D1/D3/D7 Politics scheduler.

Conclusion:

**PASS for architecture.**

Real retention quality remains learner evidence, not something T1 can manufacture.

## 5. Forecast-input readiness

Current `kianos.politics.study_packet.v1` already exports:

- first-attempt evidence;
- current outcome;
- W/U counts;
- learner cause/note;
- Unit progress;
- open Review pressure;
- Continue state.

Current `forecast_progress` is correctly labeled:

`FACTUAL_SUBJECT_PROGRESS_SIGNAL_ONLY`

and explicitly refuses to claim score/mastery authority.

### Material gap found

The packet currently aggregates Politics attempts without exposing the key maturity split:

```text
single-choice
vs
multiple-choice
```

This prevents a fresh Chat / Forecast from safely detecting the required failure mode:

> multiple-choice materially weaker than single-choice.

This is the one concrete T1 → T2 engineering gap.

## 6. T1 closure

```text
P1.1 structural coverage      PASS
P1.2 W/U capture semantics    PASS
P1.2 real compression U       PENDING REAL LEARNER BATCH
P1.3 Memory admission         PASS
P1.4 528/620 load truth       PASS
P1.4 per-type evidence split  GAP → T2
```

## Next

T2 starts with the smallest responsible change:

> extend the existing Politics factual evidence packet with single/multiple Objective breakdown; do not add a new packet or scheduler.

Then build early Forecast on those facts with UNKNOWN preserved where score calibration is not legitimate.
