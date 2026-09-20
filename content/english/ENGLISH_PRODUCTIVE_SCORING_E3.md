# English E3 — Productive Scoring Validity

Status: **BUILDER CANDIDATE COMPLETE · FRESH AUDIT REQUIRED**
Date: 2026-09-20
Parent: `ENGLISH_HIGHEST_MATURITY_STAGE_PLAN.md#E3`

Purpose:

> Make Translation / Small Writing / Big Writing usable as conservative score evidence for the 85+ Forecast without fake auto-scoring or fake precision.

---

## 1｜Candidate scoring assets

Current candidate owns:

- `PRODUCTIVE_SCORING_STANDARD.md`
- `PRODUCTIVE_SCORING_PROVENANCE.md`
- `PRODUCTIVE_SCORING_FIXTURES.v1.json` — blind response bank
- `PRODUCTIVE_SCORING_FIXTURES_KEY.v1.json` — sealed expectation key
- `PRODUCTIVE_SCORING_FRESH_AUDIT_BRIEF.md`
- `ENGLISH_PRODUCTIVE_SCORING_E3_BUILDER_AUDIT.md`

No Website auto-scorer was created.

---

## 2｜Translation scoring result

Candidate semantics:

```text
source proposition / relation
→ completeness / distortion
→ Chinese readability
→ broad segment range
→ complete-section range
```

Protected boundaries:

- stored reference wording is not a unique gold answer;
- multiple valid Chinese renderings may receive the same broad range;
- major meaning/relation distortion dominates surface fluency;
- quarter-point pseudo-precision is rejected;
- exact hidden live-exam marking points remain UNKNOWN.

Source confidence:

- task geometry + accurate/complete/readable requirement = HIGH;
- segment severity → numeric range mapping = OPERATIONAL / lower confidence.

---

## 3｜Writing scoring result

Candidate uses holistic band-first scoring.

Small Writing:

```text
9–10
7–8
5–6
3–4
1–2
0
```

Big Writing — English I:

```text
17–20
13–16
9–12
5–8
1–4
0
```

Before banding, scorer must reconstruct the exact prompt requirements.

Small Writing protects:

- required communicative moves;
- useful details;
- language;
- organization;
- register/format;
- intended reader effect.

Big Writing protects:

- material grounding;
- interpretive job;
- Core Message;
- development / information gain;
- language;
- organization;
- delivery.

Hard guards:

- polished prose cannot hide missing task moves;
- fluent Big Writing cannot hide a material misread;
- simple but complete/grounded writing may outscore ornate but task-wrong writing;
- six learning primitives are diagnostic dimensions, not invented numerical sub-scores.

---

## 4｜External/source confidence

Public research used by this candidate found:

- Tsinghua University Press writing guidance reproduces the English-I Writing A/B score bands and holistic band descriptors;
- the same source describes band-first grading, within-band adjustment, length penalties and handwriting/readability downgrade;
- multiple other public postgraduate-exam sources reproduce materially the same writing band geometry;
- public Translation descriptions consistently preserve five segments / 10 points / accurate-complete-readable output, but detailed live marking-point decomposition is not directly available as a current official key.

Therefore:

- Writing band rubric = **MEDIUM confidence syllabus-aligned operational guidance**;
- Translation micro-scoring detail = **OPERATIONAL**, not mislabeled official.

---

## 5｜Bias-attack fixtures

Blind fixture bank currently attacks:

### Translation
- strong accurate wording A;
- semantically equivalent alternative wording B;
- partially accurate mid response;
- fluent but meaning-reversed response;
- fragmentary response.

### Small Writing
- strong complete;
- polished but missing the actual request;
- plain but complete;
- weak/incomplete.

### Big Writing
- grounded/developed strong;
- generic slogan;
- fluent material misread;
- simple but grounded strong;
- low / mostly off-task.

Sealed invariants include:

```text
semantic-equivalent Translation A ≈ Translation B

plain complete Small
> polished task-incomplete Small

simple grounded Big
> fluent material-misread Big
```

---

## 6｜Builder self-attack result

Closed candidate defects:

- false decimal precision;
- reference-style overfit;
- fluent Translation hiding meaning error;
- Writing style hiding task failure;
- Big Writing language hiding material misread;
- typed output silently becoming exam-mode score;
- rubric-version drift;
- blind-audit expectation leakage.

Open but contained:

- public Writing bands are not being mislabeled as a newly fetched official raw marking manual;
- Translation hidden micro-point rules remain UNKNOWN.

Material open blocker:

> the Builder cannot independently prove its own scoring behavior.

---

## 7｜Targeted proof on PR #640

Latest candidate proof:

- English productive scoring structure validator: **PASS**;
- blind bank contains no expected scores: **PASS**;
- sealed key fixture identity coverage: **PASS**;
- coarse Translation range guard: **PASS**;
- semantic-equivalence / task-over-style / grounding-over-fluency invariants registered: **PASS**;
- English Family build: **PASS**;
- English Family existing synthetic / full-paper browser journeys: **PASS** on the same candidate family;
- Static Web Writing QA: **PASS**;
- Static Web Translation QA: **PASS**;
- English Exam Session: **PASS**;
- Final Cross-subject Regression: **PASS**;
- Objective Learner Journey: functional/runtime/evidence steps **PASS**;
- Semantic Base Validity / Authority Consistency: **PASS**.

Governance Anti-Entropy remains the known repository Current-length red already present on main; no E3 scoring defect is attributed to it.

---

## 8｜E3 current verdict

**BUILDER CANDIDATE COMPLETE · NOT CLOSED.**

Only material system-logic blocker:

```text
Fresh independent grader
→ read scoring standard + provenance + blind fixtures
→ grade without sealed key
→ then reveal sealed key
→ compare broad ranges / pairwise invariants
→ adversarial re-score
```

If Fresh Audit finds a material scoring bias:

> repair the scoring owner, not learner output.

If Fresh Audit passes:

> E3 CLOSED CANDIDATE → advance Current to E4 Evidence / Exposure / long-horizon fidelity.

Real Kian productive score still remains Learner U-dependent.
