# English E3 — Productive Scoring Builder Audit

Status: **CANDIDATE SELF-ATTACK**
Date: 2026-09-20
Target:
- `PRODUCTIVE_SCORING_STANDARD.md`
- `PRODUCTIVE_SCORING_PROVENANCE.md`
- `PRODUCTIVE_SCORING_FIXTURES.v1.json`
- `PRODUCTIVE_SCORING_FIXTURES_KEY.v1.json`

Purpose:

> Attack the scoring layer before it is allowed to narrow the English 85+ Forecast.

---

## A1｜False precision — CLOSED IN CANDIDATE

Risk:

A seemingly sophisticated scorer returns 1.75 / 1.25 Translation segment scores or a Writing total such as 22.3, despite no official evidence supporting that precision.

Repair already applied:

- Translation anchors widened to coarse operational ranges;
- quarter-point pseudo-precision is explicitly rejected;
- Writing is band-first, not weighted arithmetic;
- central estimate is optional and cannot be an unqualified midpoint shortcut.

Remaining uncertainty:

Real marker variance is still uncalibrated.

---

## A2｜Reference-style overfit — CLOSED IN CANDIDATE

Risk:

A semantically valid Chinese translation is marked down because it differs from stored reference wording.

Repair:

- fidelity / proposition / relation precede wording similarity;
- multiple valid Chinese renderings are explicitly accepted;
- blind fixtures contain two very different but semantically equivalent strong translations;
- Fresh Audit must prove their score ranges overlap.

---

## A3｜Fluency hiding meaning error — CLOSED IN CANDIDATE

Risk:

A fluent Chinese sentence that reverses the source proposition receives a high score.

Repair:

- Translation scoring checks source proposition/relation before Chinese style;
- controlled fixture `tr-cal-01-fluent-wrong` is intentionally fluent but meaning-reversed.

Required Fresh Audit invariant:

> strong accurate translations must outrank fluent-but-wrong translation.

---

## A4｜Writing style hiding task failure — CLOSED IN CANDIDATE

Risk:

A polished Small Writing response omits the actual required request / deadline but receives a high band because vocabulary and tone look good.

Repair:

- prompt-specific required-move checklist occurs before holistic banding;
- Small Writing fixture pair directly attacks task-over-style bias.

Required invariant:

> plain complete response > polished incomplete response.

---

## A5｜Big Writing language hiding material misread — CLOSED IN CANDIDATE

Risk:

A fluent essay reverses the source material relation but receives 13+ because English is strong.

Repair:

- material-specific observation / task checklist occurs before banding;
- controlled fixture pair tests grounded simple writing against fluent misread writing.

Required invariant:

> grounded/developed response > fluent material misread.

---

## A6｜Topic-package overfit — PARTIALLY CLOSED

Risk:

Different prompt IDs share the same abstract theme; memorized arguments appear to transfer.

Current protection:

- scoring standard requires current-material grounding;
- English Highest Maturity Standard requires semantic-theme / relation diversity;
- writing synthetic bank already spans multiple themes.

Still requires:

- E2/E9 diversity audit over the actual reusable Writing transfer bank;
- Real Learner U to determine whether Kian develops topic-package dependence.

Not an E3 blocker if scoring reliably penalizes non-grounded reuse.

---

## A7｜Typed score silently becoming exam-mode score — CLOSED SEMANTICALLY / U-DEPENDENT

Risk:

Typing produces stable Translation/Writing, but handwriting/paper delivery lowers real exam performance.

Repair:

- scoring result separates typed-output range from exam-mode confidence;
- E8 owns paper/handwriting calibration;
- E3 may score typed quality but cannot claim high-confidence exam score before E8/Real U.

---

## A8｜Rubric-version drift — CLOSED SEMANTICALLY

Risk:

Later scoring-standard changes silently reinterpret an old first output.

Repair:

score evidence must carry:
- scoring standard version;
- task/source identity;
- first-attempt identity;
- scoring timestamp / review mode;
- modality.

Material rubric changes require PRESERVE / MIGRATE / STALE treatment.

No need for a new learner ledger at E3; raw first output remains canonical learner truth.

---

## A9｜Blind-audit anchoring — CLOSED STRUCTURALLY

Risk:

Fresh grader sees expected scores before grading.

Repair:

- fixture bank contains no expected score/band;
- expectation key is separate and sealed;
- structural validator rejects expectation leakage into blind bank;
- Fresh Audit brief explicitly forbids reading the key before grading.

---

## A10｜Writing band source confidence — OPEN BUT NON-FATAL

Current fact:

Publicly accessible sources strongly agree on the familiar Small/Big Writing band geometry/descriptors, and Tsinghua University Press reproduces them, but the current candidate did not retrieve a directly machine-verifiable live official NEEA marking manual.

Risk:

A secondary-source convention could be mislabeled official.

Protection:

- provenance classes mark the writing rubric as MEDIUM / syllabus-aligned operational guidance;
- wording never claims a newly fetched official raw marking key;
- if direct official current source appears later, confidence can upgrade without redesigning the scorer.

E3 may proceed with explicit uncertainty.

---

## A11｜Translation hidden marking-point folklore — OPEN BUT CONTAINED

Current fact:

The exam task criterion “accurate / complete / readable” is strong; detailed 2-point sentence micro-allocation is not directly recoverable as a universal current official key.

Risk:

Internet folklore becomes fake official scoring.

Protection:

- no hidden phrase-level official key is claimed;
- operational severity/ranges remain LOW-confidence;
- score result is a range;
- high-impact threshold decisions trigger independent re-score.

E3 may proceed conservatively.

---

## A12｜One-model self-consistency pretending independence — OPEN / FRESH AUDIT REQUIRED

Risk:

The Builder writes the rubric and then “validates” it using the same anchored reasoning.

Protection:

- E3 cannot close on Builder self-audit;
- anti-anchored Fresh Audit Brief exists;
- fresh grader sees only standard/provenance/blind bank before sealed key.

This is the main remaining E3 blocker.

---

# Builder verdict

**E3 NOT CLOSED.**

Current candidate has closed the major structural bias paths:

- false precision;
- reference wording bias;
- style-over-task bias;
- language-over-grounding bias;
- typed-vs-exam conflation;
- blind fixture leakage;
- scoring revision ambiguity.

Remaining material blocker:

> Fresh independent blind grading must demonstrate that the rubric actually produces the intended broad ordering without access to the sealed expectation key.

Real Kian productive score remains Learner U-dependent even after E3 system-logic closure.
