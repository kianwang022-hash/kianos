# Politics Fresh Independent / Anti-Anchored Freeze Audit Brief

Status: **FINAL AUTOMATIC HARD FREEZE GATE**

Owner: PR #638 / `work/politics-later-readiness-20260920`

Upstream acceptance bar: PR #644 / `EXAM_SUBJECT_MATURITY_STANDARD.md`

Purpose:

> Decide independently whether the exact Politics freeze candidate satisfies the shared mother standard at the `SYSTEM_LOGIC_ACCEPTED` boundary.

This audit does **not** decide whether Kian is personally calibrated or whether unpublished/current-year sources already exist.

## 0. Audit-loop stop rule

This launch is the **last automatically initiated Fresh Independent audit** in the current Politics maturity-closure cycle.

This changes **no acceptance criterion** and must not bias the evaluator toward PASS. The evaluator must still independently return PASS / FAIL / INVALID from the sealed evidence.

After the verdict:

- **PASS** → freeze broad Politics maturity engineering; remaining work is Real-U / Source / authentic-modality gated or concrete-defect maintenance.
- **FAIL because the repaired F-01 stale Chat Plan basis is still materially incomplete** → return only to that exact shared owner. Do not broaden Politics architecture.
- **FAIL on a new unrelated material blocker** → stop the automatic repair → reseal → Fresh-audit loop. Report the new blocker to Kian; another repair/audit cycle requires an explicit decision.
- **INVALID** → fix only the audit protocol/contamination problem. INVALID does not authorize a system redesign.

The purpose is to prevent Fresh Audit from becoming an unbounded meta-engineering loop while preserving genuine independent falsification.

## 1. Freshness rule

The evaluator must begin in a genuinely fresh conversation/context.

Before locking the independent verdict, use a **strict allowlist**, not a best-effort denylist.

Explicitly forbidden pre-lock includes:

- `content/politics/CURRENT.md`;
- `content/politics/ACCEPTANCE.md`;
- every `content/politics/**/ACCEPTANCE.md`;
- every file whose path/name contains `AUDIT`, except this exact audit brief;
- `content/politics/MATURITY_PACKAGE.md`;
- `content/politics/MATURITY_ADVERSARIAL_REPORT.md`;
- `content/politics/MATURITY_GAP_MATRIX.md`;
- PR #638 body/comments/reconciliation notes;
- any prior Fresh Independent audit result;
- any chat summary that states the expected Politics maturity verdict or named defects.

If a needed fact appears only inside a forbidden conclusion-bearing artifact, do not read that artifact pre-lock. Retrieve the underlying raw/source/runtime/test evidence instead.

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

### Phase B — pre-lock read allowlist

Before verdict lock, read only the acceptance bar plus the following candidate artifacts/raw evidence, as needed:

- `content/politics/SCORE_ABILITY_MATRIX.md`;
- `content/politics/MATERIAL_INVENTORY.md`;
- `content/politics/LEARNING_CONTRACT.md`;
- `content/politics/INTERACTION_CONTRACT.md`;
- `content/politics/CAUSAL_REPAIR_POLICY.md`;
- `content/politics/FORECAST_MODEL.md`;
- `content/politics/FORECAST_STRESS_REPORT.md`;
- `static-web/src/lib/politicsForecast.mjs`;
- `static-web/scripts/test-politics-forecast.mjs`;
- `static-web/scripts/test-politics-maturity-adversarial.mjs`;
- Analysis bank manifest/prompts/answers and `validate-politics-analysis-bank.mjs`;
- `content/politics/analysis-output/README.md`;
- `content/politics/analysis-output/SCORING_RUBRIC.md`;
- Analysis evidence implementation/tests;
- `content/politics/later-stage/INGESTION_RULES.md`;
- `content/politics/later-stage/manifest.json`;
- `content/politics/mock-final/README.md`;
- source/question registries and raw content owners that do **not** embed prior acceptance/audit verdicts;
- runtime/evidence/transport implementations and tests that do **not** embed prior acceptance/audit verdicts.

Do **not** read any `CURRENT.md`, `ACCEPTANCE.md`, audit report, Builder reconciliation, PR discussion, or prior verdict pre-lock.

Do not substitute Builder status labels for raw evidence.

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

The sealed `candidate_ref` is **read-only**. Never commit the audit result onto it and never move it.

The launcher must provide a separate `audit_result_ref`. It must start from `candidate_head`, and the only permitted pre-reconciliation write on that ref is the audit-result artifact itself.

Write on `audit_result_ref`:

`content/politics/MATURITY_FRESH_INDEPENDENT_AUDIT.md`

with at least:

~~~text
candidate_ref
candidate_head
audit_result_ref
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


## 9. Candidate-ref immutability check

Immediately before finalizing the result, re-fetch `candidate_ref`.

It must still resolve exactly to `candidate_head`.

If it moved for any reason, including because the auditor wrote its own result onto the candidate branch:

> **INVALID — sealed candidate ref moved**

The audit-result commit belongs only on `audit_result_ref`.