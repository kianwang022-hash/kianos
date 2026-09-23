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

Simple questions should stay short. Do not turn explanations into mini-textbooks.

## SECOND_PASS transport discipline

SECOND_PASS is semantic review, not a reason to accumulate repository history.

- Start each newly assigned year / bounded year-group from the latest accepted `main@HEAD`; do not create the next year's branch from the previous year's unmerged SECOND_PASS branch.
- Keep the write-set to the exact explanation shards, explanation manifest synchronization, and explicit pending reviewed-relation transport produced by that review. Do not carry unrelated earlier-year deltas forward.
- Several 25-question semantic chunks may be reviewed inside one bounded year checkpoint. Expensive materialization / integration QA should run once at that checkpoint when possible, not after every tiny semantic write.
- After an accepted merge, the next year / year-group starts again from fresh `main`.
- Existing concurrent branches are not force-rebased merely to satisfy this rule; apply it at the next safe checkpoint and never overwrite another worker's live write-set.

At the reviewed checkpoint, run the existing materializer and manifest sync once
before the single content commit:

```sh
node static-web/scripts/apply-xizong-crosswalk-reviewed-batches.mjs
node static-web/scripts/sync-xizong-question-relations-manifest.mjs --write
```

Commit the affected relation shards, manifest and cursor together. Pending batches
are staging decisions and do not claim learner-visible relations until that
checkpoint. CI is read-only and never pushes an extra materialization commit.
Full integration/browser QA remains available through the explicit workflow
checkpoint; ordinary explanation/decision batches use content validation.

The website and CI must treat explanation-only changes as Xizong content deltas. They do not require rebuilding Lexical Final Learner Objects.

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
