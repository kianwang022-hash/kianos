# Xizong Question Explanations — Current Owner

Owner path: `content/xizong/explanations/`

This store is the single Current Chat-reviewed additive explanation layer keyed by stable `question_id`. It does not redefine Question Truth, stems, options, official answers, Question identity, canonical medical Knowledge, or reviewed Question→Knowledge relations.

Current Question Truth owner: `content/xizong/questions/`.  
Current reviewed Question→Knowledge relation owner: `content/xizong/question-relations/`.  
Retired alias/tombstone only: `content/xizong/question_explanations/`.

## Current truth

Coverage and routing are owned by `manifest.json`; do not maintain a second hand-written cursor here.

At the current manifest:
- Question Truth inventory = 3750;
- approved explanation inventory = 3750;
- `next_unreviewed_question_id = null`;
- unresolved / unsafe Question→Knowledge mappings remain legal and are handled separately.

Historical explanation objects are not mapping authority.

## Current explanation review process

A worker should normally be able to start after reading this owner plus the exact Question Truth shard.

For any new or reopened explanation:

```text
Question Truth
→ independently solve the question
→ identify the tested concept / smallest decision axis
→ verify the official answer when the truth/source is materially uncertain
→ write the shortest explanation that preserves the decisive reasoning
→ include only useful distractor boundaries / common trap / transfer rule
→ keep any mapping candidate separate
→ validate against Question Truth
→ materialize
```

A mature explanation should answer, as compactly as the question allows:

- what is actually being tested;
- what single clue / distinction decides it;
- why the official answer follows;
- why an important distractor fails, when that boundary matters;
- what reusable recognition rule is worth keeping.

For explicit SECOND_PASS review, also run a **currency / dispute check** when the item is treatment-, diagnostic-, classification-, threshold-, procedure-, terminology-, or source-era-sensitive, or when an external dispute/outdated-question list nominates it for review. External lists are candidate radar only, never answer authority. Preserve the historical official answer in Question Truth; compare it against Current Knowledge and the exact authoritative current source when needed. Record any real mismatch or ambiguity in the existing `source_conflict_note`, `source_boundary_note`, or `source_gap_note` field rather than silently teaching an old answer as current medicine.

Source-provided or third-party explanation prose is never learner-facing explanation truth. It may help identify a question that deserves re-checking, but the website explanation must come from this Chat-reviewed Explanation owner.

Simple questions should stay short. Do not turn explanations into mini-textbooks.

## Truth boundary

Explanations must not mutate:

- stem;
- options;
- official answer;
- stable question identity.

If explanation work exposes a suspected Question Truth defect:

```text
STOP explanation mutation
→ inspect the exact Question Source / provenance
→ route the defect to content/xizong/questions/
```

Do not “repair” Question Truth inside explanation prose.

## Relation boundary

No Question→Knowledge relation is inferred from an explanation.

A relation is written only after the separate anti-anchored review path independently solves Question Truth, inspects the exact Current Knowledge owner, finds the smallest safe owner, self-attacks the match, and explicitly approves a `REVIEWED` row under `content/xizong/question-relations/`.

Missing mapping remains legal.

## Source boundary

When an explanation depends on a detail not safely supported by Current Question Truth / Current medical Knowledge / verified Source, fail closed rather than inventing certainty.

Use `SOURCE_GATED` for the affected claim and route any real Source defect to its exact owner. Unrelated healthy explanations should continue.
