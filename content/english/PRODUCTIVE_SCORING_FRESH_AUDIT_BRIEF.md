# English Productive Scoring — Fresh Independent Audit Brief

Status: **CANDIDATE AUDIT BRIEF**
Scope: E3 Productive Scoring Validity
Rule: anti-anchored; do not read the sealed expectation key before grading.

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

Blind-grade every fixture.

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
- score first output quality, not repair potential;
- do not award style over task fulfillment;
- do not use quarter-point pseudo-precision in Translation;
- do not use a midpoint merely because a band exists.

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

## Verdict

PASS only if:

- broad ordering is stable;
- pairwise invariants hold;
- major task/fidelity errors dominate cosmetic style;
- uncertainty is preserved;
- no exact-score fiction is introduced.

If a material defect is found:

> repair the scoring standard / fixture design, not the learner output.

This audit proves scoring-logic validity only. It does not calibrate Kian's actual productive score.
