# LexicalOS Knowledge Re-acceptance

Status: **ACTIVE — K BLOCKED**

This lane exists because learner-facing lexical content must be re-accepted as Knowledge before full learner use. It replaces the mistaken assumption that a green canonical landing/readback automatically proves semantic correctness.

## Why this lane exists

The Natural Owner cutover itself is lossless: Current owners reconstruct the pre-cutover canonical plane with semantic delta zero. The discovered defect is upstream of that cutover: some historical Chat-approved semantic operations were compiled into the wrong Current targets before the canonical landing.

A concrete regression sentinel is `word:affluent` (ordinal 104). Historical authority says to demote the rare noun `an affluent person` and technical noun `tributary stream`, while keeping adjective `富裕的；富有的` normal Active. The old compiler instead bound the DEMOTE source target to the adjective sense. The final canonical asset therefore became internally consistent but semantically opposite to the approved operation.

Historical pointers:
- semantic authority: `kianwang022-hash/kianos-legacy` Issue #113
- 101–300 realization authority: `content/lexical/apply-plane/OWNER_REALIZATION_0101_0300_v1.md`
- final legacy landing commit: `c3c00e0136abb1b62e124cbc36516d779b283930`
- old compiler: `tools/lexical_owner_compiler_v2.py`

## Root compiler failure class

The old compiler's source selection treated literal fragments inside one authority sentence as broadly equivalent candidate anchors. For operation-bearing statements such as:

`DEMOTE X and Y; keep Z normal Active`

`X/Y` are negative-operation targets while `Z` is an explicit keep/exclude constraint. They must never compete in one undifferentiated source-matching pool.

Any replacement compiler or repair generator MUST distinguish at least:
- operation target clauses (`DEMOTE`, `MERGE`, `REWRITE`, `RECLASSIFY`, `ADD`, `PROMOTE`);
- keep/preserve clauses;
- exclude/do-not-touch clauses;
- target wording from explanatory/context wording.

A `keep/preserve/main Active` object is an exclusion from DEMOTE/REMOVE source binding unless a later, more specific authority explicitly overrides it.

## Re-acceptance layers

### A. Asset integrity — P0

P0 means the Current owner is not safe as a learner Knowledge object even before nuanced semantic judgment.

Examples:
- non-empty Core/Word meaning but zero Active senses;
- Core cluster references a non-Active sense;
- Current Active sense identity is missing or not `active`;
- Current word identity is internally inconsistent.

P0 must be zero before LexicalOS can claim Knowledge-ready for unrestricted learner use.

### B. Authority fidelity — P1

P1 asks whether previously frozen Chat semantic decisions were actually realized in Current.

Historical authority is evidence, not an untouchable ontology. Use it first to recover intended operations cheaply; if fresh semantic review finds the old decision itself weak, replace it explicitly rather than silently preserving a bad result.

Required behavior:
1. Compare operation-specific end state, not string presence.
2. Respect KEEP/PRESERVE/EXCLUDE constraints.
3. Prefer exact stable-object reuse over new objects.
4. Never bulk-approve a binding merely because authority wording appears somewhere in the owner.
5. Read back the learner-facing Current owner after every repair batch.

### C. Learning optimization — P2

Only after P0/P1 are controlled do we optimize learner value:
- familiar-new senses;
- real polysemy boundaries;
- Word Feel / mental compression;
- constructions and phrase skeletons;
- collocation families;
- confusable/contrast boundaries;
- demotion of obsolete or low-value dictionary noise.

Simple L0/monosemous words should direct-pass quickly. Model attention belongs on high-information words.

## Review cadence

Do not return to one-word GitHub reads.

1. Bulk-read Current owners and generate compact risk packets.
2. Chat reviews a bounded high-risk calibration batch.
3. Apply one consolidated repair batch.
4. Exact Current readback.
5. Increase batch size only when error classes stabilize.

Suggested progression is evidence-driven rather than fixed by ordinal count: deep/small for unstable polysemy, medium for recurring defect classes, large/light for simple direct-pass regions.

## K acceptance conditions

Lexical K remains BLOCKED until all of the following hold:
- P0 = 0;
- known P1 authority-fidelity defects = 0;
- known approved semantic debt has been classified and closed;
- repeated stratified samples stop finding systematic lifecycle/binding defects;
- rich-word samples show trustworthy learner-value selection rather than dictionary accumulation;
- a documented stop rule has been reached.

Passing storage roundtrip, lookup closure, build, UI rendering, or exact reconstruction is supporting evidence only. None substitutes for K.

## Learner-use boundary

Until K passes, do not present unrestricted full-catalog LexicalOS use as learner validation. Controlled UX smoke tests may use a semantically accepted subset, but they do not count as full-module U.
