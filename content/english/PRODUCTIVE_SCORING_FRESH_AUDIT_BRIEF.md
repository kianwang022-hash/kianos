# English Productive Scoring — Fresh Independent Audit Brief

Status: **CANDIDATE AUDIT BRIEF**
Scope: E3 Productive Scoring Validity
Rule: anti-anchored; do not read the sealed expectation key or any prior E3 judgment before grading.

## Pre-blind entry — branch metadata only

This audit is a bounded exception to ordinary Current-first engineering continuation.

Before blind scores are fixed:

- confirm the requested candidate ref / HEAD using branch or ref metadata only;
- do **not** read `AGENTS.md`, `static-web/CURRENT.md`, `content/english/CURRENT.md`, PR discussion, prior E3 audit reports, Builder audit, commit messages that summarize E3 findings, or historical Chat summaries;
- do not search repository history for Productive Scoring judgments.

Reason: those control/history surfaces may legitimately contain prior defect summaries and would contaminate a scoring-blind acceptance proof.

If any prior E3 scoring judgment / defect summary / sealed expectation is read before blind results are fixed, report:

```text
INVALID — blind audit contaminated
```

and stop. Do not continue as a nominal fresh audit.

## Read only

1. `content/english/PRODUCTIVE_SCORING_STANDARD.md`
2. `content/english/PRODUCTIVE_SCORING_PROVENANCE.md`
3. `content/english/PRODUCTIVE_SCORING_FIXTURES.v1.json`
4. exact synthetic prompt owner(s) referenced by a fixture only when task context is needed.

Do **not** read:

- `PRODUCTIVE_SCORING_FIXTURES_KEY.v1.json`
- Builder notes;
- prior score judgments;
- expected PASS/FAIL.

## Task

Blind-grade every fixture exactly as presented in the blind bank. Fixture IDs and order carry no scoring meaning. Do not infer expected quality from either.

If any blind fixture ID or row metadata itself contains a quality/error hint such as `strong`, `low`, `wrong`, `misread`, `missing-request`, `underlength`, `major-error`, `controlled_axis`, `guardrail`, or expected-score fields, report the audit package as contaminated/invalid before grading.

For each fixture return:

```json
{
  "fixture_id": "...",
  "channel": "translation | writing_small | writing_big",
  "score_range": {"low": 0, "high": 0},
  "central_estimate": null,
  "confidence": "HIGH | MEDIUM | LOW",
  "band": null,
  "major_score_reasons": [],
  "primary_failure": null,
  "uncertainty_reasons": []
}
```

Requirements:

- derive prompt-specific task requirements before judging Writing;
- preserve multiple-valid-rendering tolerance in Translation;
- for complete-section Translation, grade all five segments first, then aggregate conservatively and preserve section-level range width;
- measure Writing length rather than guessing it;
- measure the length of **every** Writing fixture; if an output is materially short, apply the current discretionary-length rule without inventing a fixed point deduction;
- do not double-penalize the same root cause as both “short” and “underdeveloped” unless they are independently evidenced;
- score first output quality, not repair potential;
- do not award style over task fulfillment;
- do not use quarter-point pseudo-precision in Translation;
- do not use a midpoint merely because a band exists;
- if a Writing range crosses a band or any score could affect Secure / Forecast / Dynamic Control, mark independent re-score as required.

## Blind-result lock

Before revealing the key:

1. finish every fixture;
2. freeze one complete blind-result block containing every fixture ID and score judgment;
3. do not edit that block after key reveal;
4. any later change must be written separately as `POST-KEY REASSESSMENT`.

## After all grading is complete

Only then read:

`content/english/PRODUCTIVE_SCORING_FIXTURES_KEY.v1.json`

Compare the blind grading to:

- expected broad range / band;
- pairwise invariants;
- guardrails.

## Mandatory attacks

1. Can fluent but meaning-wrong Translation outrank accurate plain Translation?
2. Can polished Small Writing missing the actual request outrank plain complete Writing?
3. Can fluent Big Writing that misreads the material outrank simple but grounded writing?
4. Does alternative valid Chinese wording get unfairly penalized?
5. Do the same responses receive materially different scores when fixture order changes?
6. Can the scorer explain uncertainty instead of forcing a point estimate?
7. Does the rubric systematically overreward vocabulary sophistication?
8. Does one dimension get double-counted under several labels?
9. Does a five-segment Translation section keep one major semantic error visible after aggregation?
10. Does under-length Writing lower/widen the range without becoming an invented fixed deduction or a duplicate content penalty?
11. Can a single-rater score that would affect 85+ Forecast escape independent re-score?
12. Is the scoring-standard version explicit and carried by the fixture/key pair?

## Verdict

PASS only if:

- broad ordering is stable;
- pairwise invariants hold;
- major task/fidelity errors dominate cosmetic style;
- uncertainty is preserved;
- no exact-score fiction is introduced;
- complete-section Translation aggregation behaves conservatively;
- Writing length is handled without confounding the main task/style fixtures;
- forecast-sensitive Writing scores have an independent re-score path;
- scoring-standard version identity is explicit.

If a material defect is found:

> repair the scoring standard / fixture design, not the learner output.

After key reconciliation and adversarial re-score, only then may the auditor read `content/english/CURRENT.md` / prior audit history for status write-back.

This audit proves scoring-logic validity only. It does not calibrate Kian's actual productive score.
