# Politics Fresh Independent / Anti-Anchored Freeze Audit Brief

Status: **ACTIVE HARD FREEZE GATE**

Owner: PR #638 / `work/politics-later-readiness-20260920`

Upstream acceptance bar: PR #644 / `EXAM_SUBJECT_MATURITY_STANDARD.md`

Purpose:

> Decide independently whether the exact Politics freeze candidate satisfies the shared mother standard at the `SYSTEM_LOGIC_ACCEPTED` boundary.

This audit does **not** decide whether Kian is personally calibrated or whether unpublished/current-year sources already exist.

## 1. Freshness rule

The evaluator must begin in a genuinely fresh conversation/context.

Before locking the independent verdict, do **not** read:

- `content/politics/MATURITY_PACKAGE.md`;
- `content/politics/MATURITY_ADVERSARIAL_REPORT.md`;
- `content/politics/MATURITY_GAP_MATRIX.md`;
- PR #638 body/comments/reconciliation notes;
- any prior Fresh Independent audit result;
- any chat summary that states the expected Politics maturity verdict or named defects.

If the evaluator has already seen those conclusions before deriving its own verdict:

> **INVALID — blind audit contaminated**

and the evaluator must stop rather than pretend to be independent.

## 2. Revision binding

The audit launcher must supply an **immutable sealed candidate ref and exact SHA**:

~~~text
candidate_ref
candidate_head
shared_standard_ref
shared_standard_head
~~~

At audit start:

1. fetch `candidate_ref` and verify it resolves exactly to `candidate_head`;
2. **do not derive the audited candidate from the moving PR #638 head**;
3. fetch `shared_standard_ref` and verify it resolves exactly to `shared_standard_head`;
4. audit only those exact revisions.

If the supplied sealed ref/SHA pair does not match, or only a moving PR head is supplied:

> **INVALID — candidate revision not immutably bound**

A PASS certifies only `candidate_head`.

Any material repair, semantic rewrite, source-rule change, evidence-rule change, Forecast change, or requirement change after the verdict invalidates PASS and requires another fresh independent audit.

Post-PASS additions limited to:
- the audit result itself;
- status/cursor metadata that only records the already-locked verdict

may inherit the verdict only if they demonstrably do not change governed semantics.

## 3. Blind read order

### Phase A — acceptance bar

Read first:

1. PR #644 `EXAM_SUBJECT_MATURITY_STANDARD.md`;
2. `content/politics/MATURITY_REQUIREMENTS.md`;
3. root `EXAM_ORCHESTRATOR_CONTRACT.md` only for canonical cross-subject target/boundary.

Derive the audit questions yourself.

### Phase B — raw/current owners

Inspect the narrowest evidence needed for each claim, including as relevant:

- `content/politics/SCORE_ABILITY_MATRIX.md`;
- `content/politics/MATERIAL_INVENTORY.md`;
- `content/politics/LEARNING_CONTRACT.md`;
- `content/politics/INTERACTION_CONTRACT.md`;
- `content/politics/CAUSAL_REPAIR_POLICY.md`;
- `content/politics/FORECAST_MODEL.md`;
- `content/politics/FORECAST_STRESS_REPORT.md`;
- `static-web/src/lib/politicsForecast.mjs`;
- Forecast/adversarial tests;
- Analysis bank manifest/prompts/answers and its validator;
- `content/politics/analysis-output/SCORING_RUBRIC.md`;
- Analysis evidence implementation/tests;
- `content/politics/later-stage/INGESTION_RULES.md`;
- `content/politics/mock-final/README.md`;
- current first-round Acceptance/Source-fidelity owners where a claim depends on them;
- current transport/browser tests where a claim depends on execution/restart/stale-state behavior.

Do not substitute the Builder summary for raw evidence.

### Phase C — independent verdict lock

Before reading Builder reconciliation artifacts, write:

~~~text
independent observations
→ independent interpretation
→ requirement-by-requirement status
→ strongest learner-risk defect
→ all-green-but-real-fail attack
→ over-conservative-all-green attack
→ verdict
~~~

Only after the verdict is locked may the evaluator read the Builder package/report to reconcile disagreements.

## 4. Required audit scope

Audit the shared standard's actual sections **§0–§28**, including especially:

- canonical target authority and protect/working/elastic semantics;
- material/source fidelity rather than filename/provenance only;
- evidence identity, exposure and semantic revision;
- subjective Analysis scoring validity boundary;
- Forecast assumptions, interaction stress and decision flip surfaces;
- false Secure and false Unstable;
- Value-of-Information / latest-useful-date behavior;
- generated-asset calibration/dedupe/retirement lifecycle;
- future-source late/partial/v2/never-arrives behavior;
- concurrent stale/replay/restore behavior;
- causal Repair discrimination;
- attention/maintenance burden;
- subject-specificity / anti-homogenization;
- Fresh Chat and no-Website semantics.

For §28, do not duplicate the shared 425+ composition engine inside Politics. Verify instead that Politics exposes sufficient bounded demand/target/risk evidence and does not override the shared owner.

## 5. Required acceptance-package audit

Independently verify that the candidate can provide all subject-level deliverables required by the mother standard:

1. Score → Ability → Material → Method → Evidence matrix.
2. Full material inventory.
3. Subject-native dynamic control.
4. Forecast + sensitivity/calibration report.
5. Adversarial stress report.
6. Chat↔Website execution proof.
7. Real Learner U status / known unknowns.
8. Explicit blockers / future-source dependencies.
9. Fresh Independent audit result.
10. Adversarial methodology / parameter-interaction & flip report.
11. Causal Repair / discrimination policy.
12. Explicit `SYSTEM_LOGIC_ACCEPTED` vs `KIAN_SPECIFIC_CALIBRATED` separation.

The evaluator must not call item 9 satisfied by its own unfinished audit. It becomes satisfied only when the final result is written.

## 6. Mandatory falsification attempts

Attempt at least two top-level failure constructions:

### A. all-green-but-real-fail

Try to construct a state where visible/system statuses look healthy while Protect 70 is materially endangered, including possible combinations of:

- weak multiple-choice transfer;
- Analysis skeleton without material binding;
- scoring rubric shared bias;
- contaminated generated transfer;
- hidden current-year exactness gap;
- missing/selected evidence;
- bad-week capacity;
- stale or superseded Source;
- whole-paper/timing failure.

### B. over-conservative-all-green

Try to construct a state where rules remain safe but the system wastes material learner time, including:

- stable capability repeatedly sent back to Build;
- excessive full-answer writing;
- unnecessary mock/calibration consumption;
- candidate Memory becoming debt;
- duplicate/near-derived generated tasks;
- forecast-uncertainty reduction with no decision value.

## 7. Evidence boundary

The audit may conclude:

- system semantics/engineering are sufficient;
- a system defect exists;
- a claim is SOURCE GATED;
- a claim is REAL-U GATED;
- a claim is AUTHENTIC-MODALITY gated;
- evidence is UNKNOWN.

It may **not** manufacture:

- Kian-specific throughput;
- Kian-specific error/retention parameters;
- a precise Politics current score;
- 2027 source content;
- handwriting/whole-paper performance.

Those gates are allowed to remain open when the system handles them correctly.

## 8. Output contract

Write:

`content/politics/MATURITY_FRESH_INDEPENDENT_AUDIT.md`

with at least:

~~~text
candidate_ref
candidate_head
shared_standard_ref
shared_standard_head
audit_started_at
contamination_status

independent observations
independent interpretation

§0–§28 verdict matrix
required-package 1–12 matrix

all-green-but-real-fail result
over-conservative-all-green result

material findings
non-blocking unknowns
source/Real-U gates

FINAL VERDICT:
PASS
or
FAIL
or
INVALID — blind audit contaminated
~~~

If FAIL:
- name the smallest responsible owner for each material finding;
- do not redesign broad Politics;
- after repair, require a **new** Fresh Independent audit.

If PASS:
- `SYSTEM_LOGIC_ACCEPTED` may be promoted only for the audited candidate revision;
- `KIAN_SPECIFIC_CALIBRATED` remains separate and cannot be promoted without real learner evidence.
