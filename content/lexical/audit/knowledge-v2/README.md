# Lexical Knowledge Audit v2

## Active construction stage

`Truth / Knowledge Boundary = ACTIVE`

Downstream stages are `FROZEN_PENDING_UPSTREAM` for this rebuild:

- Learning Logic — existing `LEARNING_CONTRACT.md` is preserved, but is not being redesigned or used to excuse Knowledge defects;
- Content Realization / Optimization — frozen; this audit defines target truth but does not yet rewrite Word Owners;
- Projection / Interaction — frozen;
- Runtime Loop — frozen;
- Evidence / Acceptance — frozen except for audit evidence about the active Truth stage.

This audit follows root `LEARNING_ASSET_STANDARD.md`.

## Read authority

Normal audit reads only current `main@HEAD` / the active branch derived from it:

- `content/lexical/words/by-ordinal/` — Current Word semantic owners;
- `content/lexical/relations/by-id/` — Current cross-word relation owners;
- current lexical manifests/schema where needed for ownership and identity.

Do not use Git history, old Issues, old branches, `kianos-legacy`, old compiler packets, old approval cursors, or migration-era semantic claims as semantic authority.

Reference/provenance fields inside Current may help locate an identity, but they do not decide what the learner should learn.

## Stage goal

Determine and re-accept the semantic **target truth** for all **7,946 / 7,946** Current Word Owners.

The Natural Owner cutover proves ownership/reconstruction, not semantic correctness. Every word therefore receives a new Truth-stage Knowledge judgment.

Full coverage does **not** mean equal effort per word:

- simple, unambiguous L0 words may receive a fast direct PASS;
- genuine polysemy, familiar-new senses, academic uses, constructions, phrases, collocations, and confusables receive deeper review;
- rare, obsolete, highly technical, domain-specialist, or dictionary-completeness material must not crowd the main learner asset merely because it exists.

Machine triage may prioritize review. It never grants semantic PASS automatically.

## Word-level semantic review

For every Word Owner, review these dimensions.

### 1. Core

- Is the semantic center correct?
- Does it cover the ordinary word rather than a rare or specialist branch?
- Is `Word Feel / mental model` genuinely compressive when the word benefits from one, rather than merely repeating a Chinese translation?

### 2. Learner-worthy active meanings

- Are ordinary/high-value meanings present?
- Are major familiar-new or academic meanings missing?
- Are near-duplicate meanings split unnecessarily?
- Are rare/obsolete/technical micro-senses incorrectly promoted into the main learner asset?
- Is POS/meaning organization semantically coherent?

### 3. Structure

- Are high-value constructions, proposition frames, phrase skeletons, phrasal patterns, or fixed collocations represented as semantic learning objects when they materially change access?
- Are trivial examples being mistaken for important structures?
- Is the same structure duplicated across sense/collocation/construction objects without a learning reason?
- Is a construction accidentally modeled as the wrong part of speech or as an ordinary lexical sense?

### 4. Boundaries

- Are genuine confusables / semantic contrasts present when they materially prevent misreading or wrong selection?
- Are low-value, stale, mismatched, or artificial relations adding noise?

### 5. Noise / scope

- Identify unsupported wording, accidental dictionary artifacts, stale specialist material, or completeness-only branches that should not remain in the main learner map.
- Reference/explore material may remain available without becoming learner-worthy Active Knowledge.

### 6. Internal coherence

- Core, active meanings, structures, and relations must not contradict one another.
- The same semantic object must not be duplicated as both an Active sense and a secondary/deep object without a real distinction.
- Stable object identities should be preserved later when the semantic object survives.

## Decision vocabulary

Each reviewed word ends in exactly one Truth-stage decision:

- `PASS` — current semantic target is accepted as learner-worthy as-is;
- `REVISE` — the target truth differs from Current; record exactly what must eventually change, but do **not** implement the repair in this stage;
- `SOURCE_CHECK` — semantic judgment genuinely requires authoritative verification before deciding; this is not a pass or a deferral of obvious work.

A word may be `PASS` even if future Learning Logic or Projection could be improved. Those stages are not being judged now.

## Verification policy

For simple ordinary English, direct semantic judgment is acceptable.

Use authoritative contemporary dictionaries/corpora selectively when a decision turns on:

- rare vs ordinary usage;
- domain restriction;
- dated/obsolete status;
- transitivity or construction licensing;
- close confusable boundaries;
- competing senses whose learner value is uncertain.

Do not web-check every trivial word merely to create ritual evidence.

## Batching

Default semantic review batch: **200 ordinals**. Smaller calibration slices may be used at the start of a new audit rule, but they roll up into the same 200-ordinal batch.

Batching controls review load only; it does not weaken full-corpus coverage or permit downstream work.

Each batch must record:

- ordinal range;
- `PASS` count;
- `REVISE` count;
- `SOURCE_CHECK` count;
- exact target-truth change required for each `REVISE` word;
- resolved/unresolved source checks;
- relation-owner truth decisions when relevant;
- confirmation that no Content/Projection/Runtime semantic mutation occurred.

## Stage exit

Truth / Knowledge Boundary closes only when:

1. all 7,946 Word Owners have an explicit new v2 Truth-stage decision;
2. every `SOURCE_CHECK` is resolved or explicitly shown to be outside the intended lexical Knowledge scope;
3. every `REVISE` item has a sufficiently precise target-truth specification for later Content Realization;
4. Current Relation owners implicated by reviewed word boundaries have an explicit truth decision where needed;
5. no unresolved question remains about **what the lexical asset should teach** for the audited corpus;
6. a full-corpus closure report states exactly what is accepted, what target truth must change, and what is excluded from main learner Knowledge.

Only then may Lexical proceed to **Learning Logic verification**. Content owner repair remains frozen until that Learning stage is checked and the construction sequence reaches Content Realization / Optimization.