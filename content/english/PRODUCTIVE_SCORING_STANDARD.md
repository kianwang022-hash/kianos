# English Productive Scoring Standard

Status: **CANDIDATE · E3 PRODUCTIVE SCORING OWNER**
Date: 2026-09-20
Scope: English I Translation / Small Writing / Big Writing
Parent: `ENGLISH_HIGHEST_MATURITY_STAGE_PLAN.md#E3`

Purpose:

> Give Chat a conservative, auditable way to turn productive first outputs into score-relevant evidence without fake auto-scoring or false precision.

This file does **not** create a Website scorer, a learner mastery score, or a new runtime state machine.

---

# 1｜Authority / confidence boundary

## High-confidence exam facts

Current English-I geometry:

- Translation = 5 selected segments / 10 points total;
- Small Writing = 10 points;
- Big Writing = 20 points;
- Writing total = 30 points;
- Translation requires Chinese output that is accurate, complete and readable/natural enough to communicate the source meaning;
- Writing is judged by task fulfillment, content coverage, language use, cohesion/organization, format/register and communicative effect.

These task boundaries agree with Current English owners and widely reproduced postgraduate-exam descriptions.

## Writing band descriptions

Publicly available syllabus-aligned reproductions consistently use the familiar holistic bands:

### Small Writing

- 9–10
- 7–8
- 5–6
- 3–4
- 1–2
- 0

### Big Writing — English I

- 17–20
- 13–16
- 9–12
- 5–8
- 1–4
- 0

The recurring band descriptors are task completion/content points, grammatical and lexical range/accuracy, cohesion/organization, format/register, and intended communicative effect.

Evidence basis currently available to this candidate includes:
- Tsinghua University Press exam-writing guidance reproducing the English-I A/B band ranges and band descriptors;
- multiple independent postgraduate-exam preparation sources reproducing materially the same ranges/descriptors.

**Boundary:** no machine-verifiable current official raw marking manual was found in the public search used for this candidate. Therefore the band system is treated as **syllabus-aligned operational scoring guidance**, not mislabeled as a newly fetched official marking key.

## Translation scoring detail

High-confidence task criterion:

```text
accurate
+ complete
+ readable / fluent Chinese
```

Publicly reproduced practice commonly treats English-I Translation as five 2-point segments and uses point-based meaning units / major-vs-minor error judgment.

**Boundary:** the exact hidden marking-point decomposition for a live exam sentence is not publicly recoverable in advance. KianOS therefore does not pretend to know a universal official sub-point key.

Translation operational scoring uses **segment-level evidence ranges**, not a fabricated exact point checklist.

---

# 2｜Core scoring principles

## 2.1 Band first, not fake weighted arithmetic

Do not score Writing as:

```text
content 3.2
+ grammar 2.7
+ structure 1.9
...
```

unless an accepted official rubric actually defines those weights.

Instead:

```text
task evidence
→ determine plausible holistic band(s)
→ place response inside a bounded range
→ record uncertainty
```

The six Writing primitives remain useful for **diagnosis/repair**. They are not automatically six numerical score buckets.

## 2.2 Translation fidelity first

Translation scoring order:

```text
source proposition / relation
→ coverage / distortion
→ Chinese readability
→ segment score range
```

Reference wording is not unique.

A different Chinese rendering that preserves the same meaning/relation can score as well as the stored reference.

## 2.3 First output is the score anchor

Score the preserved first output when estimating current ability.

A same-prompt rewrite after explanation is repair evidence and must not replace the original score anchor.

## 2.4 Assistance changes evidence role

If Chat materially helped before or during generation:

- the output may still be scored for quality;
- it is not clean independent capability evidence;
- Forecast confidence must be reduced accordingly.

## 2.5 Score uncertainty is mandatory

Every scoring result contains:

- plausible score range;
- central estimate only when useful **and never as an unqualified midpoint shortcut**;
- confidence;
- reasons;
- material scoring ambiguity;
- assistance/exposure caveat;
- whether independent re-score is required.

No single Chat score may collapse uncertainty when strategy materially depends on the result.

---

# 3｜Translation scoring protocol

## 3.1 Unit

Primary scoring unit:

> one complete five-segment Translation section.

Segment analysis supports the total, but do not lose whole-section consistency.

## 3.2 Segment anchor ranges

Each 2-point segment is judged conservatively.

### 1.5–2.0-like

- proposition and major relations accurate;
- materially complete;
- no important scope/attachment/reference distortion;
- Chinese is clear and natural enough;
- only trivial wording/style issues.

### 1.0–1.5-like

- core proposition substantially correct;
- one or more minor losses / awkward reconstructions;
- no major distortion of the sentence's main relation;
- still clearly usable.

### 0.5–1.0-like

- meaningful part of the source is recovered;
- but one material relation / attachment / scope / omission error reduces fidelity;
- or Chinese expression materially obscures part of the meaning.

### 0–0.5-like

- fragments / isolated meaning recovered;
- major misunderstanding, omission or relation distortion;
- output only partially usable.

### 0-like

- blank;
- unrelated;
- meaning not recoverable.

These are **broad operational anchors**, not claims that an official marker mechanically awards these exact decimals. Avoid quarter-point pseudo-precision unless an accepted scoring source or repeated calibrated rater evidence justifies it.

## 3.3 Severity coding

For diagnosis record, when relevant:

- `MAJOR_MEANING_DISTORTION`
- `MAJOR_OMISSION`
- `RELATION_SCOPE_ERROR`
- `ATTACHMENT_REFERENCE_ERROR`
- `LEXICAL_MEANING_ERROR`
- `CHINESE_RECONSTRUCTION_COST`
- `MINOR_WORDING_STYLE`

Do not double-penalize one root cause under several labels.

## 3.4 Total Translation estimate

For each segment:

```text
low_i … high_i
```

Then:

```text
section_low = sum(low_i)
section_high = sum(high_i)
```

Round only for reporting.

Do not automatically take the arithmetic midpoint as the “true score.”

## 3.5 Independent re-score trigger

Require a second anchored review when any is true:

- plausible section range width > 1.5 points;
- score estimate crosses a strategy threshold;
- a disputed segment contains multiple valid renderings;
- evaluator diagnosis depends on subtle scope/attachment;
- first evaluator uses reference-wording similarity instead of fidelity.

---

# 4｜Small Writing scoring protocol

## 4.1 Prompt-specific task checklist before banding

Before judging style, derive the current prompt's required communicative moves / content points from the exact task.

A scorer must be able to state:

```text
what the prompt required
→ what the first draft actually completed
→ what was omitted / distorted
```

Only then assign a holistic band.

## 4.2 Band decision dimensions

Use the holistic band descriptors, with English-specific diagnostic mapping:

### Task / communicative fulfillment
- role;
- audience;
- purpose;
- required moves;
- essential useful details.

### Language
- grammatical / lexical accuracy;
- range sufficient for task;
- meaning remains clear.

### Cohesion / organization
- compact readable sequencing;
- no unnecessary repetition.

### Format / register
- appropriate genre conventions;
- tone fits relationship/purpose.

### Intended effect
- the target reader can act/understand as intended.

## 4.3 Operational band anchors

### 9–10
Very strong completion of the communicative task; all essential moves/details present; language natural and accurate; organization concise; register/format appropriate; intended effect fully achieved.

### 7–8
Task substantially complete; minor omission/weakness may exist; language basically accurate; organization clear; register/format generally appropriate; intended effect achieved.

### 5–6
Task basically complete but with visible omissions / generic content / limited language; errors do not destroy understanding; organization simple but usable; intended effect only basically achieved.

### 3–4
Important task requirements missing or poorly developed; language limitations/errors interfere with communication; weak organization/register; intended effect not clearly achieved.

### 1–2
Major task failure; little relevant content; severe language/control problems; reader cannot reliably recover the intended communication.

### 0
Too little language to assess / unrelated / unreadable.

## 4.4 Hard guard

A polished template that misses a required communicative move cannot be placed in the top band merely because the English sounds advanced.

---

# 5｜Big Writing scoring protocol

## 5.1 Prompt/material-specific checklist before banding

Before assigning a band, explicitly recover:

- what the source material actually shows;
- what interpretive job the prompt requires;
- what key content relation must not be reversed or invented.

Then judge fulfillment/development.

## 5.2 Band decision dimensions

### Material grounding
- observation is faithful to the supplied material;
- no major misread / invented relationship.

### Task fulfillment / core message
- interprets the material;
- produces a clear, developable central claim.

### Development
- information gain;
- causal/operational explanation;
- consequence / example / contrast / implication where useful.

### Language
- grammar/lexicon accurate enough;
- range supports intended relations;
- errors do not materially obscure meaning.

### Cohesion / organization
- paragraph and sentence progression;
- relation markers used appropriately.

### Register / delivery
- appropriate academic/expository register;
- complete answer in required form/length range.

## 5.3 Operational band anchors

### 17–20
Very strong fulfillment; grounded interpretation; all key content effectively developed; rich/sufficient language with very few errors; coherent, well organized; appropriate style/register; intended effect fully achieved.

### 13–16
Good fulfillment; main material relation and task handled correctly; content mostly complete though one or two secondary weaknesses may exist; language basically accurate; organization clear and cohesive; intended effect achieved.

### 9–12
Basic fulfillment; main idea visible but development may be generic/thin; language and organization are sufficient but limited; errors exist without destroying understanding; intended effect only basically achieved.

### 5–8
Incomplete/weak task fulfillment; important material/content development missing; repetitive or poorly organized; language errors/limitations interfere with understanding.

### 1–4
Major task failure; very little relevant/developed content; severe language/organization problems.

### 0
Too little language to assess / unrelated / unreadable.

## 5.4 Topic-package guard

Different prompt IDs do not prove transfer when the learner reuses the same memorized content package.

Scoring must reward actual grounding/development in the current material, not topical familiarity alone.

---

# 6｜Score result schema

Chat scoring output should be representable as:

```json
{
  "channel": "translation | writing_small | writing_big",
  "object_id": "...",
  "score_range": {"low": 0, "high": 0},
  "central_estimate": null,
  "confidence": "HIGH | MEDIUM | LOW",
  "evidence_quality": "INDEPENDENT | ASSISTED | EXPOSED | UNKNOWN",
  "band": null,
  "major_score_reasons": [],
  "primary_failure": null,
  "uncertainty_reasons": [],
  "requires_independent_rescore": false
}
```

This object is scoring evidence for Chat/Forecast.

It is not a Website mutation instruction by default.

The evidence object should also carry:

- scoring-standard version;
- task/source hash;
- first-attempt identity;
- scoring timestamp;
- rater/review mode;
- paper/typed modality.

If the rubric changes materially, old score evidence must be reinterpreted as PRESERVE / MIGRATE / STALE rather than silently rescored under new semantics.

---

# 7｜Calibration / bias attacks

The scoring system must survive at least these counterexamples.

## Translation
- different Chinese wording, same fidelity;
- fluent Chinese with wrong source relation;
- literal awkward Chinese with accurate meaning;
- one major scope error hidden in otherwise strong translation;
- reference wording mismatch without semantic error.

## Small Writing
- beautiful template missing required move;
- plain language completing every communicative move;
- format/register mismatch;
- one essential detail omitted;
- high vocabulary with weak reader utility.

## Big Writing
- sophisticated language + material misread;
- correct material read + generic slogan development;
- simple language + strong grounded mechanism;
- memorized topic package pasted onto a different material relation;
- coherent essay that does not answer the actual interpretive job.

---

# 9｜Calibration fixtures

Use synthetic / engineering fixtures only.

Do not consume protected Kian true-exam first outputs merely to test the scorer.

Fixture set should contain:

- clearly high / medium / low Translation versions of the same synthetic segment;
- Small Writing outputs with controlled task-fulfillment defects;
- Big Writing outputs with controlled grounding/development/language defects;
- semantic-equivalent alternative Translation renderings;
- adversarial style/template cases.

Fixtures test evaluator consistency and bias.

Fresh scoring audit must:
- grade a blind fixture bank without access to the expectation key;
- randomize or at least vary fixture order when practical;
- compare to the sealed key only after grading;
- report both under-scoring and over-scoring failures.

Fixtures do not calibrate real exam-score distribution by themselves.

---

# 10｜Forecast use

Forecast may use productive score evidence only if:

- first output is preserved;
- scoring standard version is known;
- assistance/exposure is known or explicitly UNKNOWN;
- score range/uncertainty is carried forward;
- score evidence is not overwritten by same-prompt repair.

English total score synthesis must not assume Translation/Writing scoring error is independent from fatigue/whole-paper delivery.

---

# 11｜E3 closure criteria

E3 closes only when:

1. this scoring owner is accepted;
2. calibration fixtures exist;
3. at least one independent scoring pass + adversarial re-score shows the rubric separates known high/medium/low defects;
4. equivalent Translation wording is not unfairly penalized;
5. Writing task failure cannot be hidden by style;
6. score uncertainty is preserved;
7. no Website fake auto-score is introduced;
8. a cold learner productive output can be turned into an anchored **range**, not a fake exact point.

Real Kian score calibration remains Learner U-dependent.
