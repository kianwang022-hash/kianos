# Xizong Question Explanations — Current Owner

Owner path: `content/xizong/explanations/`

This store is the single Current Chat-reviewed additive Question Explanation layer keyed by stable `question_id`.

It does **not** redefine:

- Question Truth, stem, options, official answer or canonical question identity;
- canonical medical Knowledge;
- Question→Knowledge relations;
- learner attempts / mastery / review state.

Current owners:

```text
Question Truth              → content/xizong/questions/
Question Explanation        → content/xizong/explanations/
Question→Knowledge relation → content/xizong/question-relations/
```

The retired `content/xizong/question_explanations/` path is historical only and must not be revived.

---

## Current status

Current object coverage is **3,750 / 3,750 official questions**. The manifest and shard inventory are the machine-readable coverage owners.

Important distinction:

> **3,750 explanation objects ≠ 3,750 equally deep explanations.**

The current corpus deliberately contains explanations at different depths. Some later rows explicitly use `review.format = FAST_OWNER`; earlier/deeper reviewed rows may contain richer discrimination fields without a format label.

There is no current linear "next unreviewed question" cursor. Future Explanation work is **defect/value driven**, not "make every row equally long".

---

## Production rule

### Goal: sufficient explanation, adaptive depth

The production target is:

> **Every question gets enough explanation for its real learning value; explanation depth scales with question complexity and expected reuse.**

Do **not** normalize all questions to one fixed seven-field essay.

A simple, stable, single-decision question may stay thin.

A question becomes a deep-review candidate when one or more are materially true:

- the decisive axis is not obvious from the correct answer alone;
- distractors encode high-value boundaries or recurrent confusions;
- it is a case / multi-condition / multi-step reasoning question;
- conditions can change while the underlying rule transfers;
- the question is a strong second-pass discrimination target;
- source wording / answer version / correction needs careful boundary handling;
- real Wrong / Uncertain evidence shows the current explanation is insufficient;
- a current explanation is factually correct but too shallow to support the intended SECOND_PASS review behavior.

### FAST_OWNER / thin explanation

`FAST_OWNER` means:

> **The question is intentionally owned by a compact explanation because extra depth would add little learning value.**

It is **not** technical debt merely because optional deep fields are absent.

A thin explanation must preserve the smallest sufficient learner decision:

- `exam_target` — what is actually being tested;
- `decision_axis` — the decisive check.

Additional fields such as a short `reasoning_chain`, `correct_option_reason`, or `transfer_rule` are added only when they materially improve understanding or reuse. They are not mandatory merely because the schema can hold them.

Do not manufacture distractors, failure nodes or extra prose just to fill fields.

### Deeper reviewed explanation

When the question genuinely earns more analysis, useful fields may include:

- `exam_target`;
- `decision_axis`;
- `reasoning_chain`;
- `correct_option_reason`;
- `valuable_distractors`;
- `common_failure_node`;
- `transfer_rule`.

Depth is justified by semantic value, not visual symmetry.

### Source and authority discipline

Explanation production must read the exact Current Question Truth and use Current medical Knowledge / approved reviewed sources when a claim needs support.

Hard rules:

- do not change Question Truth from inside Explanation;
- do not infer Question→Knowledge mapping from Explanation prose;
- `mapping_decision` is review/routing information only; positive canonical relations live only in `question-relations/`;
- do not promote model intuition into medical Core;
- source-version-sensitive or corrected questions must preserve that boundary rather than generalize old wording as timeless Current truth.

### Acceptance meaning

`explanation_status = APPROVED` means the explanation object was admitted to the Current explanation corpus. It does **not** mean every object has identical depth or that future learner evidence can never reopen it.

A real defect reopens the smallest question explanation owner.

---

## Future continuation

There is no default 3,750-row enrichment campaign.

Prioritize future work by:

```text
real learner Wrong / Uncertain
→ explanation visibly insufficient for the failure
→ high-value second-pass / case / distractor / transfer question
→ source correction / conflict
→ bounded audit sample
```

Stable simple `FAST_OWNER` rows should normally remain untouched.

If a systematic audit is explicitly opened, use bounded heterogeneous batches and report:

- thin explanations that are sufficient → PASS / NO_CHANGE;
- complex/high-value explanations that are too shallow → UPGRADE;
- factual/source defect → reopen earliest responsible Source/Knowledge owner;
- unsafe relation inference → leave mapping unresolved.

---

## Runtime boundary

The current System Question Runtime may consume reviewed fields such as:

- `decision_axis`;
- `valuable_distractors`;
- `transfer_rule`.

Runtime may render only what the Current Explanation owner provides. Missing optional fields are legal and must not be synthesized by UI.

FIRST_PASS may remain thin. SECOND_PASS may reveal richer reviewed explanation only after Submit, according to the accepted Xizong Learning / Runtime policy.

---

## Recovery note

The former README still pointed to the removed path:

`learning/xizong/question-explanation-process.md`

and still described an obsolete 20-object cursor after the Current corpus had already reached 3,750 objects.

This README now owns the recovered production semantics directly so a future owner migration cannot leave the corpus with data but no production rule.
