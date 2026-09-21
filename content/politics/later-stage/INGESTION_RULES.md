# Politics Future Source Ingestion Rules

Status: **READY — applies when known 2027 later sources arrive**

Purpose: make known annual Politics sources plug into the existing system without forcing a redesign or learner-side material management.

Known families:

1. memory / sprint handbook;
2. current affairs / 形势与政策;
3. Xiao8;
4. Xiao4.

This file owns ingestion behavior only. It does not own the source content itself and does not create learner debt before a real source is accepted.

---

## Shared arrival pipeline

For every family:

```text
real source bytes / source-faithful extraction
→ identity + provenance
→ fidelity validation
→ compare with Current stable Knowledge + prior-year baseline
→ classify delta
→ update only responsible derived/current-year owner
→ transitively invalidate stale downstream objects
→ targeted validation
→ learner use
```

Delta classes:

- STABLE
- UPDATED
- NEW
- RETIRED
- CURRENT_YEAR_ONLY
- UNCLEAR / BLOCKED

No source may skip directly from uploaded file to durable Memory or final answer truth.

---

## Source fidelity gate

Validate, at risk-appropriate depth:

- file identity / edition / year;
- answer-key alignment;
- page/section order;
- OCR negation;
- numbers / dates / thresholds;
- option order where questions are involved;
- tables/images when they carry semantic relations;
- extraction completeness for the learner role.

If a high-impact field is unresolved:

```text
affected learner use = BLOCKED
```

Do not silently repair from model memory.

---

## Family 1 — memory / sprint handbook

### Role
- admit exact Memory/Precision that is worth carrying;
- provide source-grounded formulations for Analysis EXACT;
- reduce broad rereading into a finite current-year recall set.

### Baseline
- LEG26 historical memory/output baseline metadata;
- current stable Chengfeng/Current Knowledge;
- existing candidate Memory/Precision sidecars.

### On arrival
1. bind provenance/fidelity;
2. compare each relevant topic with stable Current + LEG26 baseline;
3. classify stable/updated/new/retired;
4. admit only source-grounded exact targets that serve Objective discrimination or Analysis production;
5. do **not** convert the handbook into a second course.

### Partial arrival
Use only accepted sections. Unreleased sections remain UNKNOWN; no placeholder Memory debt.

### Late arrival
Continue Current objective/concept work and stable Analysis structure. Delay only exact/current-year recall that truly depends on the handbook.

### Low-value/redundant release
Ingest only useful deltas. Do not force full-book consumption.

### v2 / correction
Invalidate affected:
- exact Memory;
- Precision;
- formulation drills;
- analysis hooks/overlays;
- active final queue;
- Forecast assumptions that depended on the old wording.

Raw historical Recall events remain history; current eligibility may become STALE.

### Never arrives
Use strongest accepted alternative current-year source for exactness where available; otherwise preserve UNKNOWN and avoid unsupported exact claims.

---

## Family 2 — current affairs / 形势与政策

### Role
- current-year event/policy/material cues;
- current-year analysis overlays;
- current-year Objective exactness where tested.

### Baseline
- stable Current Knowledge;
- LEG26 current-affairs/output baseline only for comparison geometry.

### On arrival
1. bind source date/version;
2. separate durable principle from current event/policy delta;
3. map current event to existing Knowledge owner when possible;
4. create current-year-only overlay only when no stable owner exists;
5. generate Analysis material cues/tasks without rewriting stable theory.

### Partial arrival
Use the released scope only; keep uncovered domains UNKNOWN.

### Late arrival
Train material→principle→skeleton with stable assets meanwhile. Do not fabricate event facts.

### v2 / correction
Transitive invalidation is mandatory for:
- current-affairs notes;
- exact Memory;
- Analysis materials;
- answer keys/rubrics;
- Mock interpretation;
- final queue;
- score-path confidence if affected.

### Never arrives
Use another accepted current-year source if available. If not, exact/current-affairs claims remain BLOCKED rather than guessed.

---

## Family 3 — Xiao8

### Role
- fresh/current-year Objective transfer;
- timed mixed-set evidence;
- Analysis current-year task geometry;
- Mock/execution evidence when worthwhile.

### Baseline
- prior-year Xiao8 geometry/review workflow metadata;
- current Xiao1000 learning history;
- existing Mock/Final rules.

### On arrival
1. preserve clean first attempt;
2. keep questions/answers/explanations separated before attempt;
3. do not pre-expose answer logic through derived assets;
4. classify each failure:
   - Knowledge / boundary;
   - exact retention;
   - Analysis identify/skeleton/binding/delivery;
   - timing/execution;
5. route failures to the smallest existing owner.

### Partial arrival
Treat available papers as available fresh capital; do not infer unreleased sets.

### Late arrival
Do not hold back first-round learning waiting for Xiao8. Use accepted transfer/synthetic assets for mechanism work; preserve score uncertainty.

### Low-value set
May be REFERENCE_ONLY or skipped if it adds little exam-like transfer or decision value.

### v2 / correction
Correct answer/explanation changes invalidate:
- affected score/calibration evidence;
- derived repair interpretation;
- any current plan built on the old key.

First raw attempt remains historical evidence but must be reinterpreted against the corrected source.

### Never arrives
Use another accepted current-year mock source. Do not substitute repeated Xiao1000 as fresh score calibration.

---

## Family 4 — Xiao4

### Role
- final current-year high-value Objective/Analysis evidence;
- final exact/current-year answer material;
- final compression input.

### Baseline
- prior-year final-paper geometry;
- current admitted Memory;
- current Analysis skeletons;
- Mock-exposed weaknesses.

### On arrival
1. preserve clean first attempt where score/execution evidence matters;
2. identify genuinely new/high-value current-year exact material;
3. update Analysis/Memory overlays;
4. build the final finite queue;
5. do not turn Xiao4 into a new broad course.

### Partial/late arrival
Use only what can still mature before the exam. Apply latest-useful-date / marginal-value filter.

### Low-value/redundant content
Skip or compress.

### v2 / correction
Invalidate affected final queue/exact wording/answer interpretation immediately.

### Never arrives
Use strongest accepted current-year final source available; do not create unsupported final answers.

---

## Transitive invalidation graph

A source revision may affect:

```text
Source
→ extracted/derived asset
→ Memory / Precision
→ Analysis drill / answer key
→ Review / Repair interpretation
→ learner evidence eligibility
→ active plan / Resume
→ Forecast / score-path confidence
→ final queue
```

The system must reclassify every affected downstream object as:

- PRESERVE
- MIGRATE
- STALE
- INVALID

No downstream object stays current merely because its own file did not change.

---

## Learner-facing behavior

Kian should not manage this lifecycle.

When a known source arrives, normal learner interaction should be:

```text
source becomes available
→ backend ingestion/validation
→ Chat sees only meaningful new learner work
→ Website/Chat presents the next action
```

Kian should not maintain source version tables, delta notes or invalidation lists.

---

## Stop rule

A source is fully ingested when:

- the accepted delta that can change learner behavior is represented;
- stale dependent assets are invalidated;
- the learner-facing path knows what, if anything, changes;
- further extraction would not change study or score decisions.

Then stop processing the source and return to study.
