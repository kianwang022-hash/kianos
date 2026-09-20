# English Productive Scoring Provenance

Status: **CANDIDATE · E3 SOURCE / CONFIDENCE MAP**
Date: 2026-09-20
Parent: `PRODUCTIVE_SCORING_STANDARD.md`

Purpose:

> Keep exam fact, public rubric reproduction, KianOS operational anchor and model inference separate.

---

# 1｜Confidence classes

## A — HIGH

Use directly as exam/task truth.

Examples:

- English I total = 100;
- Translation = 10;
- Small Writing = 10;
- Big Writing = 20;
- Translation requires accurate / complete / readable Chinese rendering;
- Writing A/B task geometry and word-count bands as owned by Current English source/manifest.

Primary durable owner for current KianOS use:
- `content/english/manifest.json`
- exact official/current source owners.

Public corroboration:
- university / publisher / exam-information pages that reproduce the English-I task geometry.

## B — MEDIUM

Use as syllabus-aligned scoring guidance, not as a newly fetched official raw marking key.

Writing holistic bands consistently reproduced in public exam-preparation material:

- Small: 9–10 / 7–8 / 5–6 / 3–4 / 1–2 / 0
- Big English I: 17–20 / 13–16 / 9–12 / 5–8 / 1–4 / 0

Recurring descriptors:
- task completion / content points;
- grammatical and lexical range/accuracy;
- cohesion / organization;
- format / register;
- communicative effect.

Public evidence used to build this candidate:
- Tsinghua University Press, *考研英语高分写作100篇（第2版）* sample chapter: states Writing A/B score geometry, band-first grading, English-I bands, under-length deduction, and handwriting/readability downgrade;
- multiple independent postgraduate-exam preparation sources reproducing materially the same bands.

The Tsinghua University Press sample chapter specifically states that graders first determine a band from content/language, then adjust within that band; poor handwriting that affects marking may lower the response by one band. This supports the KianOS choice to keep scoring holistic/band-first and to separate typed-output quality from exam-mode handwriting calibration.

Rule:

> do not relabel this candidate as a current official NEEA marking manual unless a direct official source is actually obtained.

## C — LOW / OPERATIONAL

Use only for calibration aid / bias attack.

Examples:

- Translation broad segment ranges such as “1.5–2.0-like / 1.0–1.5-like …”;
- commonly reported sentence-level marking-point practice;
- any inferred mapping from one diagnosis to an exact decimal score.

These support conservative score ranges, not exact official marks.

---

# 2｜Public-source notes

## Writing

A Tsinghua University Press exam-writing guide publicly reproduces the standard English-I writing bands:

- A section 9–10 / 7–8 / 5–6 / 3–4 / 1–2 / 0;
- B section English I 17–20 / 13–16 / 9–12 / 5–8 / 1–4 / 0;

with descriptors centered on:
- completion of task requirements;
- content points;
- grammar/lexicon;
- cohesion;
- format/register;
- intended reader effect.

Other public postgraduate-exam preparation sources reproduce the same broad band geometry.

Use:
- band geometry and holistic dimensions = MEDIUM-confidence operational rubric.

Do not use:
- unsupported invented micro-weights such as “content exactly 3 points”.

## Translation

Public English-I descriptions consistently state:
- five selected parts;
- 10 total points;
- accurate / complete / fluent/readable Chinese rendering;
- emphasis on accurate understanding of conceptually/structurally complex English.

Some secondary descriptions report point-based scoring within the 2-point sentence.

Use:
- task geometry / accurate-complete-readable = HIGH;
- segment error severity to support a score range = operational;
- exact hidden phrase-by-phrase live marking key = UNKNOWN.

---

# 3｜KianOS scoring-source rule

Every productive scoring conclusion should be traceable to:

```text
exam task truth
+
accepted operational rubric
+
specific learner first output
+
explicit assistance/exposure/timing
+
uncertainty
```

No conclusion may rest on:

- one model's intuition;
- reference wording similarity;
- stylistic preference;
- unsupported exact micro-weights.

---

# 4｜What would upgrade confidence

Writing scoring guidance can move closer to HIGH if a direct current official examination syllabus/marking-method source with the same bands is acquired and verified.

Translation scoring detail can move upward if a direct official scoring-method source defining segment-level treatment is acquired.

Until then:

> preserve uncertainty rather than filling the gap with folklore.
