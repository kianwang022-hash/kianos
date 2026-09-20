# English E3 Productive Scoring — Fresh Independent / Anti-Anchored Audit

Status: **PASS — FINAL FRESH INDEPENDENT / ANTI-ANCHORED ACCEPTANCE**  
Audit date: 2026-09-21  
Scope: Translation / Small Writing / Big Writing productive scoring validity  
Pre-audit main: `5c1eab2766d696aa36877baa1a4600b19a927189`  
Pre-audit candidate head: `d096a38f061386ce0b1baf96f5ab6f7fa76e5d70`

## 1. Anti-anchoring integrity

Blind phase read only:

- `PRODUCTIVE_SCORING_STANDARD.md`
- `PRODUCTIVE_SCORING_PROVENANCE.md`
- `PRODUCTIVE_SCORING_FIXTURES.v1.json`
- the exact synthetic task owners needed to recover the cited prompts.

Before all blind grades were fixed, the audit did **not** read:

- `PRODUCTIVE_SCORING_FIXTURES_KEY.v1.json`
- `ENGLISH_PRODUCTIVE_SCORING_E3_BUILDER_AUDIT.md`
- Builder score judgments / expected PASS / FAIL.

Therefore the original blind pass was valid and unpolluted.

## 2. Prompt-specific task recovery

### Small Writing · Extension Request

Required task:

- role: student participant;
- audience: course coordinator;
- purpose: request a short extension;
- explain the two-day laboratory closure;
- explicitly request the extension;
- propose Wednesday evening;
- acknowledge inconvenience / show responsibility;
- polite, concise, responsible register.

### Big Writing · Information and Judgment

Material relation:

- both students face abundant online information;
- Student A keeps collecting without deciding what to trust;
- Student B defines the question, compares evidence/relevance, then decides.

Interpretive job:

- preserve the relation between information quantity and judgment;
- explain why a decision rule / clear purpose changes the value of information;
- do not reverse the material into “more information is always better”;
- do not collapse the task into a generic slogan.

## 3. Fixed BLIND RESULTS

These results were fixed before sealed-key reveal and are preserved unchanged here.

```json
[
  {
    "fixture_id": "tr-cal-01-strong-a",
    "channel": "translation",
    "score_range": {"low": 1.5, "high": 2.0},
    "central_estimate": null,
    "confidence": "HIGH",
    "band": null,
    "major_score_reasons": [
      "core proposition preserved",
      "expected-vs-actual-future contrast preserved",
      "complete and natural Chinese"
    ],
    "primary_failure": null,
    "uncertainty_reasons": ["segment anchors are operational rather than a live official micro-key"],
    "requires_independent_rescore": false
  },
  {
    "fixture_id": "tr-cal-01-strong-b-alt",
    "channel": "translation",
    "score_range": {"low": 1.5, "high": 2.0},
    "central_estimate": null,
    "confidence": "MEDIUM",
    "band": null,
    "major_score_reasons": [
      "main contrast preserved",
      "surface restructuring is legitimate",
      "Chinese is natural"
    ],
    "primary_failure": "minor semantic intensification: 往往只看 adds an exclusivity implication not present in the source",
    "uncertainty_reasons": ["the fixture is not a perfectly clean semantic-equivalence control"],
    "requires_independent_rescore": false
  },
  {
    "fixture_id": "tr-cal-01-mid",
    "channel": "translation",
    "score_range": {"low": 1.0, "high": 1.5},
    "central_estimate": null,
    "confidence": "HIGH",
    "band": null,
    "major_score_reasons": [
      "main contrast substantially recovered",
      "useful-plan and expected-future precision weakened",
      "Chinese reconstruction is usable but imprecise"
    ],
    "primary_failure": "precision loss",
    "uncertainty_reasons": [],
    "requires_independent_rescore": false
  },
  {
    "fixture_id": "tr-cal-01-fluent-wrong",
    "channel": "translation",
    "score_range": {"low": 0.0, "high": 0.5},
    "central_estimate": null,
    "confidence": "HIGH",
    "band": null,
    "major_score_reasons": [
      "Chinese is fluent",
      "core proposition is reversed",
      "the source concession is destroyed"
    ],
    "primary_failure": "MAJOR_MEANING_DISTORTION",
    "uncertainty_reasons": [],
    "requires_independent_rescore": false
  },
  {
    "fixture_id": "tr-cal-01-fragment",
    "channel": "translation",
    "score_range": {"low": 0.0, "high": 0.5},
    "central_estimate": null,
    "confidence": "HIGH",
    "band": null,
    "major_score_reasons": [
      "isolated lexical meaning survives",
      "proposition and contrast are not reconstructed"
    ],
    "primary_failure": "major incompleteness / relation loss",
    "uncertainty_reasons": [],
    "requires_independent_rescore": false
  },
  {
    "fixture_id": "sw-extension-strong",
    "channel": "writing_small",
    "score_range": {"low": 9, "high": 10},
    "central_estimate": null,
    "confidence": "HIGH",
    "band": "9-10",
    "major_score_reasons": [
      "all required communicative moves completed",
      "specific Wednesday deadline proposed",
      "responsible and appropriate register",
      "stable language"
    ],
    "primary_failure": null,
    "uncertainty_reasons": [],
    "requires_independent_rescore": false
  },
  {
    "fixture_id": "sw-extension-polished-missing-request",
    "channel": "writing_small",
    "score_range": {"low": 3, "high": 4},
    "central_estimate": null,
    "confidence": "HIGH",
    "band": "3-4",
    "major_score_reasons": [
      "polished and polite English",
      "situation is explained",
      "actual extension request is absent",
      "Wednesday deadline is absent"
    ],
    "primary_failure": "core communicative task not completed",
    "uncertainty_reasons": [],
    "requires_independent_rescore": false
  },
  {
    "fixture_id": "sw-extension-plain-complete",
    "channel": "writing_small",
    "score_range": {"low": 7, "high": 9},
    "central_estimate": null,
    "confidence": "MEDIUM",
    "band": "7-8 / 9-10",
    "major_score_reasons": [
      "all essential moves completed",
      "plain but clear English",
      "reader can act on the request"
    ],
    "primary_failure": null,
    "uncertainty_reasons": ["response is materially shorter than the about-100-word target and the standard had no stable length operation"],
    "requires_independent_rescore": true
  },
  {
    "fixture_id": "sw-extension-low",
    "channel": "writing_small",
    "score_range": {"low": 2, "high": 4},
    "central_estimate": null,
    "confidence": "MEDIUM",
    "band": "1-2 / 3-4",
    "major_score_reasons": [
      "some request intent is recoverable",
      "specific new deadline is missing",
      "language control is weak",
      "register and completeness are weak"
    ],
    "primary_failure": "incomplete request plus limited language control",
    "uncertainty_reasons": ["very short response compounds the task/language defects"],
    "requires_independent_rescore": true
  },
  {
    "fixture_id": "bw-info-strong",
    "channel": "writing_big",
    "score_range": {"low": 17, "high": 20},
    "central_estimate": null,
    "confidence": "HIGH",
    "band": "17-20",
    "major_score_reasons": [
      "material relation correctly grounded",
      "specific core message",
      "real mechanism and information gain",
      "coherent organization and stable English"
    ],
    "primary_failure": null,
    "uncertainty_reasons": [],
    "requires_independent_rescore": true
  },
  {
    "fixture_id": "bw-info-generic-slogan",
    "channel": "writing_big",
    "score_range": {"low": 7, "high": 10},
    "central_estimate": null,
    "confidence": "MEDIUM",
    "band": "5-8 / 9-12",
    "major_score_reasons": [
      "theme is loosely relevant",
      "development is mostly generic slogan",
      "little material-specific mechanism or information gain"
    ],
    "primary_failure": "generic development",
    "uncertainty_reasons": ["response is far below the 160-word target, confounding development quality with delivery length"],
    "requires_independent_rescore": true
  },
  {
    "fixture_id": "bw-info-fluent-misread",
    "channel": "writing_big",
    "score_range": {"low": 4, "high": 7},
    "central_estimate": null,
    "confidence": "HIGH",
    "band": "1-4 / 5-8",
    "major_score_reasons": [
      "English is fluent and coherent",
      "central material relation is reversed",
      "essay advocates the failure mode shown by the material"
    ],
    "primary_failure": "MATERIAL_MISREAD",
    "uncertainty_reasons": ["exact holistic band impact of a fluent central misread is not tightly calibrated"],
    "requires_independent_rescore": true
  },
  {
    "fixture_id": "bw-info-simple-strong",
    "channel": "writing_big",
    "score_range": {"low": 14, "high": 18},
    "central_estimate": null,
    "confidence": "MEDIUM",
    "band": "13-16 / 17-20",
    "major_score_reasons": [
      "correct material grounding",
      "real mechanism and useful example",
      "simple language remains clear and accurate",
      "balanced boundary avoids overclaiming"
    ],
    "primary_failure": null,
    "uncertainty_reasons": ["response is below the 160-word target in the original fixture bank"],
    "requires_independent_rescore": true
  },
  {
    "fixture_id": "bw-info-low",
    "channel": "writing_big",
    "score_range": {"low": 3, "high": 6},
    "central_estimate": null,
    "confidence": "MEDIUM",
    "band": "1-4 / 5-8",
    "major_score_reasons": [
      "mostly ignores the actual contrast",
      "generic Internet-is-good content",
      "little task-specific interpretation or development"
    ],
    "primary_failure": "major task / material under-fulfillment",
    "uncertainty_reasons": ["very short response compounds the content failure"],
    "requires_independent_rescore": true
  }
]
```

## 4. Sealed-key reconciliation

After all blind grades were fixed, the sealed key was revealed.

Result:

- every blind range overlaps the sealed expected range / band;
- all five original Translation range hints were matched exactly;
- all three original pairwise invariants passed;
- no blind result was rewritten after key reveal.

Original pairwise results:

1. **Translation semantic equivalence — direction PASS, proof quality DEFECTIVE**
   - both variants remained in the same high range;
   - however the alt fixture contained `只看`, a real semantic intensification, so it was not a clean equivalence control.

2. **Small Task > Style — PASS**
   - plain complete `7–9` > polished missing-request `3–4`.

3. **Big Grounding > Fluency — PASS**
   - simple grounded `14–18` > fluent material-misread `4–7`.

## 5. POST-KEY REASSESSMENT

The blind results remain unchanged. Post-key review only records where the old harness allowed too much grader variance.

- `sw-extension-polished-missing-request`: the blind 3–4 range was probably too narrow. The sealed 3–6 envelope is defensible because strong language/organization still matter after task failure.
- `bw-info-generic-slogan`: blind 7–10 vs sealed 9–12 exposed an uncontrolled variable: the original output had only ~89 words.
- `bw-info-fluent-misread`: blind 4–7 vs sealed 5–12 shows that the exact penalty for a fluent central misread is not tightly calibrated even though the required ordering is clear.
- `bw-info-simple-strong`: blind 14–18 vs sealed 13–16 was confounded by the original ~137-word length.

Conclusion:

> Broad ordering was stable, but the original fixture bank was not clean enough to validate absolute score-range reliability for Forecast.

## 6. Adversarial re-score

### Most likely blind overestimate

`sw-extension-plain-complete` top end (9) was most vulnerable because the original response was only ~61 words despite an about-100-word task.

### Most likely blind underestimate

`sw-extension-polished-missing-request` was most vulnerable to under-scoring. Missing the actual request/new deadline is a major task failure, but the old blind 3–4 range may have over-applied the Task > Style guard and under-preserved holistic-language value.

### Duplicate penalty attack

A central Big-Writing material misread must not be numerically punished once for grounding, again for task fulfillment, again for core message, and again for development as though four independent failures occurred.

Diagnosis may name downstream effects, but scoring remains holistic.

### Duplicate reward attack

Advanced vocabulary / fluency must not receive separate hidden rewards under language, style, organization and “model-answer likeness”.

### Reasonable-grader cross-band attack

The original bank allowed reasonable graders to cross bands on:

- polished-but-missing Small Writing;
- generic-slogan Big Writing;
- fluent material-misread Big Writing;
- simple grounded Big Writing.

The dominant cause was not unstable ordering. It was under-specified uncertainty plus uncontrolled length.

## 7. Material all-green failure scenarios

### A. Clean ordering but dirty calibration fixtures — FOUND

All original pairwise invariants can pass while Writing ranges remain wrong because intended task/style variables were confounded by major word-count differences.

Materiality: **YES**. This can change Writing Secure state, 85+ Forecast and task allocation.

### B. Semantic-equivalence fixture is not actually equivalent — FOUND

The old alt Translation inserted an exclusivity implication through `只看`.

Materiality: **YES for proof validity**. A grader could legitimately penalize it, so the old fixture could not distinguish semantic discipline from reference-wording bias.

### C. Segment logic passes while 10-point Translation aggregation fails — FOUND

The old bank tested only one source segment even though the scoring owner declares the full five-segment section the primary unit.

Materiality: **YES**. Section-range aggregation and “one major error inside four strong segments” directly affect the 10-point Translation contribution to Forecast.

### D. Single Chat systematic bias — FOUND AS AN OPEN CONTROL GAP

The old standard said uncertainty was mandatory but did not give all-channel Writing/Forecast independent re-score triggers as concretely as Translation.

Materiality: **YES** when a single score can move Secure / 85+ / Dynamic Control.

### E. Scoring-version drift — FOUND

The old schema required “scoring-standard version” but the standard had no explicit version identity.

Materiality: **YES**. Old learner evidence could otherwise silently survive a rubric change under ambiguous semantics.

### F. Writing bands mislabeled as official — NOT FOUND

The provenance correctly labels the public band system as MEDIUM-confidence syllabus-aligned operational guidance, not a newly fetched official raw marking manual.

### G. Translation folklore silently promoted to official — NOT FOUND

The standard already labels detailed segment anchors as operational. Fresh source recheck found dated CHSI corroboration for major-distortion ≤0.5 and half-point granularity, but this remains dated/secondary evidence rather than current-official truth.

### H. Typed output silently becomes exam-mode score — NOT FOUND

The standard explicitly separates typed output from exam-mode score.

### I. Handwriting/readability silently ignored — NOT FOUND, BUT REMAINS LEARNER-U/PAPER CALIBRATION

Publicly available publisher guidance reproduces a one-band downgrade when handwriting materially affects marking. Current E3 correctly refuses to infer this from typed output.

### J. First draft replaced by repair rewrite — NO SCORING-LAYER DEFECT FOUND

Current Writing owner explicitly preserves the first meaningful plan + first draft and treats same-prompt regeneration as repair evidence, not mastery. E3 did not reopen the already accepted Runtime implementation.

### K. Assistance/exposure pollution — CONTROL PRESENT

The scoring schema carries evidence quality and the standard explicitly downgrades assisted/exposed outputs.

### L. Forecast sums section uncertainty as independent variables — CONTROL PRESENT, FUTURE INTEGRATION STILL MUST HONOR IT

The standard explicitly forbids assuming Translation/Writing scoring error is independent from fatigue / whole-paper delivery.

## 8. Source reliability recheck

Fresh external corroboration during this audit:

- Tsinghua University Press public sample chapter, *考研英语高分写作100篇（第2版）*: band-first scoring, English-I A 9–10 / 7–8 / 5–6 / 3–4 / 1–2 / 0; B 17–20 / 13–16 / 9–12 / 5–8 / 1–4 / 0; A≈100 words; B=160–200 words; non-compliant length discretionary deduction; poor handwriting affecting marking may lower one band.
  - https://www.tup.tsinghua.edu.cn/upload/books/yz/101427-06.pdf
- Historical CHSI scoring reproductions support the same broad writing geometry / length principle and Translation “accurate, complete, readable” geometry.
  - https://yz.chsi.com.cn/kyzx/en/200812/20081203/11232756.html
  - https://yz.chsi.com.cn/kyzx/en/200909/20090911/32480034.html

Boundary:

> These strengthen operational confidence but do not become a falsely claimed current official raw marking manual.

## 9. Bounded repair staged

Only E3 scoring owners / audit harness were changed.

### Scoring standard

- explicit `english.productive-scoring.v2` identity;
- all-channel independent re-score triggers;
- Task > Style / Grounding > Fluency defined as ordering constraints, not fixed automatic caps;
- conservative Writing length handling with no invented fixed deduction;
- no double penalty for one root cause;
- complete-section Translation calibration required.

### Provenance

- Writing length / handwriting evidence boundary clarified;
- dated Translation secondary corroboration recorded without promoting it to current-official status.

### Blind fixtures

- Translation alt-equivalence wording repaired to remove hidden `只` semantic overstatement;
- non-length Small/Big fixtures normalized near the prompt length target;
- dedicated Small/Big under-length stress fixtures added;
- two full five-segment Translation section fixtures added, including one with a single major relation error.

### Sealed key

- resealed for the repaired fixtures;
- new section-aggregation and length invariants added;
- expected uncertainty / re-score requirement carried on length-stress / mixed-section cases.

### Validator

- fixture/key set parity still required;
- scoring-standard version bound;
- non-length Writing fixture word-count deconfounding guarded;
- dedicated under-length fixtures guarded;
- complete five-segment Translation section structure guarded;
- six pairwise invariants now required.

## 10. Structural post-repair self-check

Post-repair repository inspection confirms:

- 18 fixture IDs;
- 18 sealed expectations;
- 0 missing / extra / duplicate fixture IDs;
- 2 complete Translation section fixtures, both 1→5;
- non-length Small fixtures: 85–101 words;
- dedicated Small length stress: 46 words;
- non-length Big fixtures: 160–176 words;
- dedicated Big length stress: 87 words;
- 6 pairwise invariants;
- scoring-standard v2 markers present;
- validator contains section / length / version guards.

This is **not** a new blind PASS.

The auditor has now seen the old key and authored the repaired fixtures/key, so this same Chat is no longer eligible to provide a valid fresh blind verdict on v2.

## 11. Verdict / cursor

```text
FAIL — material scoring blind spots remain
```

The material blind spots found in the original E3 candidate have been bounded and repaired, but E3 remains open until a **new independent anti-anchored grader** blind-scores v2 without seeing the resealed key.

Do not advance to E4 yet.

Next:

```text
new fresh Chat
→ PRODUCTIVE_SCORING_FRESH_AUDIT_BRIEF.md
→ blind-score v2 fixtures
→ reveal v2 sealed key only after all scores fixed
→ PASS or bounded repair
```


---

## 12. Fresh v2 re-audit attempt — calibration proof still failed

A second independent attempt blind-scored the repaired v2 bank before reading the sealed key.

Observed scorer behavior was broadly healthy:

- semantic-equivalent Translation stayed in the same high range;
- fluent meaning-reversed Translation stayed low;
- plain complete Small Writing outranked polished prose that omitted the actual request;
- grounded simple Big Writing outranked fluent material misread;
- generic slogan development stayed below grounded mechanism;
- complete-section Translation kept one major segment error visible;
- materially short Writing widened/lowered the range instead of receiving an invented fixed deduction;
- score uncertainty and independent re-score triggers were used.

However, the run could not serve as final Fresh acceptance proof.

### Material calibration-proof defects

1. **Blind fixture IDs leaked expected quality / defect type.**
   Examples included semantic labels such as `strong`, `low`, `fluent-wrong`, `missing-request`, `underlength`, and `mixed-major-error`.

2. **Blind row metadata leaked calibration intent.**
   `controlled_axis: "length_deficit"` explicitly identified the intended stress dimension.

3. **One sealed Small Writing expectation was inconsistent with the v2 rubric.**
   The response formerly identified as `sw-extension-low` explained the problem, requested additional time, apologized, and remained understandable; only the required specific Wednesday deadline was missing and language control was weak. A broad `3–6` expectation is more faithful to the v2 holistic rubric than the previous `1–4` cap.

4. **The re-audit itself read `content/english/CURRENT.md` before blind grading.**
   That file contained prior E3 defect summaries. The sealed key was not read early, but the run was still not clean enough to be the final anti-anchored acceptance proof.

### Bounded calibration-layer repair

The scorer standard itself was **not** rewritten.

The calibration package was repaired by:

- replacing all 18 semantic fixture IDs with opaque IDs:
  - `ps-tr-001…007`
  - `ps-sw-001…005`
  - `ps-bw-001…006`;
- removing `controlled_axis` and other calibration-intent metadata from blind rows;
- keeping calibration axes only in the sealed key;
- reordering blind arrays so presentation order is intentionally non-ordinal;
- recalibrating the disputed Small Writing expectation to `MID_LOW / 3–6`;
- strengthening the validator so semantic IDs or calibration metadata in the blind bank fail CI;
- strengthening the Fresh Audit Brief so pre-blind entry uses branch/ref metadata only and forbids `CURRENT.md`, prior audit reports, Builder judgments and history until blind results are locked.

### Current acceptance state

```text
E3 scoring logic: materially healthy under two independent scoring passes
E3 final fresh acceptance proof: NOT YET VALID
Calibration package: repaired for a third clean blind audit
```

The next auditor must start from `PRODUCTIVE_SCORING_FRESH_AUDIT_BRIEF.md`, obey the pre-blind read boundary, freeze all blind scores, and only then reveal the sealed key.


---

## 13. Fresh protocol self-deadlock correction

A later audit attempt stopped with `INVALID — blind audit contaminated` before grading because its inherited conversation context contained generic historical E3 failure / defect information.

That INVALID exposed an audit-protocol defect rather than a scoring defect.

The previous brief defined contamination too broadly: generic awareness that E3 had failed or that historical calibration defects existed could make a normal fresh Chat self-invalidate even when it had no knowledge of how any **current opaque fixture** should score.

### Corrected anti-anchoring boundary

Fresh independence now protects the information that can actually bias current fixture grading.

Pre-blind INVALID is reserved for leakage of current-fixture-specific expectations, including:

- sealed key content;
- expected range / band / confidence for a current opaque fixture;
- current opaque-ID → defect / quality / calibration-axis mapping;
- pairwise expected ordering tied to current opaque IDs;
- prior scores / Builder judgments tied to current opaque IDs.

Generic knowledge that E3 had prior FAIL / INVALID results, or that historical defects involved categories such as length, semantic equivalence or blind labeling, is not sufficient to invalidate an audit.

The current opaque fixture identities were rotated after this correction. Stale IDs / mappings from prior chats therefore do not identify the current fixtures.

This correction changes only the proof protocol / blind identity layer. It does not relax the scoring standard or sealed expectations.


---

## 14. Final Fresh Independent PASS — 2026-09-21

Final audited candidate:

`work/english-highest-maturity-adaptation-20260920 @ 2066019e657ea6d479c924c26ea5cbe418c89fe7`

Pre-close HEAD recheck:

```text
candidate == 2066019e657ea6d479c924c26ea5cbe418c89fe7
drift = 0 commits
```

### Blind validity

```text
VALID — no current-fixture-specific contamination
```

Generic knowledge of prior E3 FAIL / repair history was present but did not reveal any current opaque-fixture expected treatment. Under the corrected anti-anchoring contract, this does not contaminate the audit.

All 18 current fixtures were blind-graded and locked before sealed-key reveal.

Blind lock SHA256:

`a0c34170255f5f461405080183964a837cc4ebe2774db7a93531ce637fb18270`

### Core blind results

Translation:

- two semantically equivalent valid Chinese renderings: both `1.5–2`;
- fluent but source-meaning-reversed rendering: `0–0.5`;
- five-segment section with one major relation reversal: `6–8.5`;
- five-segment section with all five substantially correct: `7.5–10`.

Small Writing:

- polished but missing the actual extension request / new deadline: `3–4`;
- plain but complete: `9–10`;
- 46-word stress case: `6–8`, with independent re-score required.

Big Writing:

- fluent but materially misread: `6–8`;
- simpler but grounded/developed: `17–19`;
- 87-word stress case: `10–13`, with independent re-score required.

### Mandatory attack result

All 12 mandatory attacks passed:

- semantic-equivalent Translation preserved;
- fluent semantic error not hidden by Chinese quality;
- Small `Task > Style`;
- Big `Grounding > Fluency`;
- order-change instability not material;
- uncertainty preserved;
- vocabulary/style bias not material;
- duplicate penalty/reward not material;
- complete-section Translation aggregation conservative;
- under-length Writing handled without fixed folklore deduction or duplicate content penalty;
- Forecast-sensitive Writing retains independent re-score path;
- scoring-standard identity explicit.

Scoring-standard identity:

`english.productive-scoring.v2`

### Key reconciliation

One non-material drift:

`fx-04cd95`

Blind range:

`7.5–10`

Sealed broad hint:

`8–10`

Assessment:

- 0.5-point conservative lower-bound difference;
- key explicitly declares `exact_score_gold: false`;
- HIGH_SECTION classification unchanged;
- pairwise ordering unchanged;
- no guardrail or strategy-relevant decision changed.

Verdict impact:

`NON-MATERIAL`

### Final verdict

```text
PASS — E3 Fresh Independent / Anti-Anchored Audit
```

Meaning:

> E3 productive-scoring logic is accepted for the tested system boundary and may now supply bounded productive score evidence + uncertainty to the later English Forecast.

This PASS does **not** calibrate Kian's actual productive score and does not collapse:

- handwriting / paper-mode uncertainty;
- real marker variance;
- whole-paper fatigue interaction;
- Learner-U-dependent productive level.

Those remain later-stage inputs.

Next:

```text
E3 CLOSED CANDIDATE
→ E4 Evidence / Exposure / long-horizon fidelity
```
