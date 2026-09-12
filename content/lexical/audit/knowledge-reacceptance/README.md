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

P2 asks whether the learner-facing lexical model is worth learning **now**, under the latest `LEARNING_CONTRACT.md`, rather than merely whether an older approved operation survived migration.

Optimize for:
- familiar-new senses;
- real polysemy boundaries;
- Word Feel / mental compression;
- constructions and phrase skeletons;
- collocation families;
- confusable/contrast boundaries;
- demotion of obsolete or low-value dictionary noise;
- fast contextual recognition and selection rather than dictionary completion.

Simple L0/monosemous words should direct-pass quickly. Model attention belongs on high-information words.

### D. Dual-judgment rule — R15+ default

From R15 onward, re-acceptance must not be only a historical migration audit. Every high-information or historically affected target carries **two separate judgments**:

1. **Migration fidelity:** did Current correctly realize the historical Chat-approved decision?
2. **Latest semantic target:** under the current Learning Contract, what should the learner-facing Natural Owner / Relation actually be now?

The second judgment may explicitly supersede the first. Typical outcomes:
- `HISTORICAL_STILL_VALID` — old approved target remains the right Current target;
- `CURRENT_ALREADY_BETTER` — Current should be preserved even if it differs from history;
- `UPGRADE_TARGET` — keep the historical intent but improve compression, boundary, register, construction landing, or learner priority;
- `DEMOTE_OR_DROP_NOW` — old target was defensible historically but no longer earns main Depth space;
- `NEEDS_FRESH_CHAT_SEMANTIC_JUDGMENT` — history and Current do not provide enough trustworthy evidence.

Important boundaries:
- bulk/mechanical tooling may detect existence, lifecycle, relation direction, anchors, and candidate matches; it **must not** make the latest semantic judgment;
- P2 target judgment may be recorded during the same bulk audit so the corpus does not require a second word-by-word pass later;
- semantic mutation still waits for the consolidated repair phase. Audit first records the latest target state; repair later applies that target state;
- the repair inventory must therefore encode the **latest approved target**, not blindly reproduce historical wording;
- simple/direct-pass regions do not receive gratuitous fresh rewriting. Use calibrated samples plus high-information/risk signals to focus Chat attention.

### Latest learner-facing target shape

When fresh judgment is needed, use `LEARNING_CONTRACT.md` as the optimization boundary:

- Core / Word Feel should compress the word into a useful mental model, not restate a dictionary list;
- Active meanings should be the minimal sufficient set of learner-worthy boundaries;
- high-value familiar-new senses should stay visible even when the base word is familiar;
- constructions / phrase skeletons should attach to the relevant meaning when possible rather than becoming fake standalone senses;
- genuine cross-word competition belongs in Relation Owners; within-word form, pronunciation, morphology, or grammatical realization should not be forced into fake semantic relations;
- low-value historical, technical, regional, or completeness-only senses belong in reference/Explore unless they materially affect recognition;
- no per-word richness quota and no forced one-card-per-sense model.

## Review cadence

Do not return to one-word GitHub reads.

1. Recover/freeze one historical authority round.
2. Bulk-read all affected Current Word / Relation Owners and generate compact risk packets.
3. Chat reviews P0/P1 anomalies, high-information words, and calibrated green samples; when material, record the latest P2 target in the same pass.
4. Produce one consolidated exact repair inventory using latest approved targets.
5. Apply one consolidated repair batch.
6. Exact Current readback.
7. Increase batch size when error classes stabilize; reduce only when semantic density genuinely requires it.

The progression is evidence-driven rather than fixed by ordinal count: deep/small for unstable polysemy, medium for recurring defect classes, large/light for simple direct-pass regions. Historical rounds of roughly 300 ordinals may be processed in one bulk readback when the risk packet keeps Chat review bounded.

## K acceptance conditions

Lexical K remains BLOCKED until all of the following hold:
- P0 = 0;
- known P1 authority-fidelity defects = 0;
- known approved semantic debt has been classified and closed;
- repeated stratified samples stop finding systematic lifecycle/binding defects;
- rich-word samples show trustworthy learner-value selection rather than dictionary accumulation;
- latest-target P2 samples stop exposing systematic under-modeling, over-splitting, stale register, or low-value Active noise;
- a documented stop rule has been reached.

Passing storage roundtrip, lookup closure, build, UI rendering, or exact reconstruction is supporting evidence only. None substitutes for K.

## Learner-use boundary

Until K passes, do not present unrestricted full-catalog LexicalOS use as learner validation. Controlled UX smoke tests may use a semantically accepted subset, but they do not count as full-module U.
