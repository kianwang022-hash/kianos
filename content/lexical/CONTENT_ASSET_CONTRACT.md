# LexicalOS Content Asset Contract

Status: ACTIVE CANDIDATE — Issue #50 implementation line  
Parent learning authority: `content/lexical/LEARNING_CONTRACT.md`  
Migration-integrity evidence: GitHub Issue #6 + `content/lexical/audit/knowledge-reacceptance/`

This contract defines what a high-quality LexicalOS **content asset** must contain and how semantic repair / upgrade is accepted. It does not own private learner progress, review scheduling, or test history.

---

## 1. Product objective

LexicalOS must build **fast, correct, transferable lexical access** from rich but organized learner knowledge.

The content system must not collapse this into either extreme:

- a dictionary-completion dump; or
- a thin Core-only vocabulary list.

The intended object is a **learner-worthy lexical knowledge object**: enough semantic and usage structure to understand, distinguish, retrieve, translate, and when relevant produce the word in real context.

---

## 2. Learning completeness and review selectivity are separate

The durable rule is:

```text
complete learning object != permanent review burden
```

### Learning-time completeness

When a word is worth learning, the learner should be able to inspect the whole high-value semantic/use-space in one coherent Depth object.

This may include:

- Core / Word Feel;
- important senses;
- familiar-new senses;
- genuine polysemy;
- constructions and phrase skeletons;
- collocations / phraseology / multiword units;
- confusable and contrast boundaries;
- register / stance / intensity / valence / discourse feel;
- morphology / lexical family;
- spelling / capitalization / pronunciation / inflection / lexicalized-form distinctions;
- useful bilingual or translation distinctions where they improve learner access;
- exam / corpus / real-context evidence as prioritization evidence.

**Expansion is not optional decoration.** It is the semantic/use-space layer surrounding the Core compression layer.

### Review-time selectivity

The full learned object must not become one-card-per-sense debt.

Only the smallest unstable lexical objects enter active Repair / Challenge / Memory, driven by evidence such as:

- explicit `+`;
- wrong / slow / fuzzy / uncertain use;
- familiar-new-sense miss;
- construction or phrase instability;
- recurring confusable failure;
- productive translation/writing need;
- later real-context failure.

Therefore:

```text
Learning = rich and complete
Review = selective and evidence-driven
```

Do not reduce first-pass learning quality in order to make review scheduling easier.

---

## 3. Core is a compression layer, not the whole word

A high-quality Core / Word Feel should give the learner a compact mental model that helps organize the word.

It must not be used to erase important branches merely because they do not fit one gloss.

A strong Core should:

- capture the most useful semantic center or organizing feel;
- explain why major learner senses belong together when they genuinely do;
- avoid bilingual laundry lists;
- avoid pretending unrelated real polysemy is one meaning;
- avoid low-value historical / specialist branches unless they materially affect normal comprehension;
- remain useful across multiple contexts rather than overfit one example.

When a word is genuinely polysemous, use multiple learner-worthy branches rather than forcing one false umbrella.

---

## 4. Expansion is a first-class content layer

Expansion must be judged by learner value, not by whether a historical operation once mentioned it.

### Senses

Include senses that materially improve real recognition, interpretation, selection, translation, or production.

Prioritize:

- familiar-new senses hidden behind a common meaning;
- senses common enough to appear in serious reading;
- senses that change argument structure or selection behavior;
- senses whose omission would cause a plausible wrong parse;
- academically / professionally relevant senses when they are not merely specialist trivia.

Do not split senses mechanically because POS differs or dictionaries enumerate separate entries.

Do not merge senses merely because Chinese translations overlap.

### Constructions and phrase skeletons

A construction is first-class when the pattern itself carries stable learner value.

Examples of value signals:

- a fixed or semi-fixed argument pattern;
- a meaning shift caused by the construction;
- a high-frequency phrasal / prepositional frame;
- a pattern whose slots matter for correct usage;
- a pattern frequently misread or mistranslated;
- a productive structure useful for writing / translation.

Do not hide important constructions only inside incidental examples.

### Collocations / phraseology / multiword units

Retain them when they materially improve:

- recognition speed;
- idiomatic selection;
- phrase completion;
- translation;
- production;
- disambiguation of a sense.

Do not keep arbitrary corpus co-occurrences for completeness.

### Contrast / confusable relations

A contrast object must explain the decision boundary, not merely assert `A != B`.

Useful dimensions include:

- semantic scope;
- agency / intentionality;
- result vs process;
- degree / intensity;
- register;
- countability / argument structure;
- collocational preference;
- epistemic stance;
- whether one item can replace the other in a realistic sentence.

Cross-word truth belongs to Relation Natural Owners. Same-word polysemy belongs to the Word Natural Owner.

### Form / identity distinctions

Spelling, capitalization, pronunciation, inflection, lexicalized forms and regional variants are learner-facing semantic/content assets when they change recognition or use.

Do not force genuine Form/Identity truth into a Relation object merely because two surface strings are compared.

---

## 5. Information architecture controls load; deletion does not

Rich objects are allowed to be rich.

The main constraint is **scanability and hierarchy**, not uniform shortness.

Preferred learner-facing order:

1. Core / Word Feel;
2. high-value meanings;
3. constructions / phrase skeletons near the relevant meaning;
4. important phraseology / collocations;
5. material contrast boundaries;
6. form / register / usage notes;
7. reference-only material behind Explore/Search.

A genuinely rich familiar word may need substantial depth. Do not impose a fixed small sense cap merely to make every card the same height.

Reference-only, historical, highly technical or completeness-only material should remain available without crowding the main Depth surface.

---

## 6. Semantic repair is final-object reconstruction

Historical audit findings are evidence, not repair instructions to replay blindly.

For every bounded repair / upgrade batch:

```text
historical approved evidence
+ latest Current Natural Owner
+ current learning/content contracts
+ fresh semantic judgment
= latest learner-worthy target
```

A repair is **not accepted** because:

- the patch applied;
- a JSON field now exists;
- an old ADD/REWRITE/RELATE operation was reproduced;
- a validator is green;
- a historical phrase appears verbatim.

Acceptance must inspect the final integrated learner object.

### Final-object questions

For each upgraded rich word ask:

1. Does Core actually compress the word?
2. Are real learner-worthy meanings present?
3. Are familiar-new senses visible enough to defeat familiarity illusion?
4. Are sense boundaries cognitively useful rather than dictionary-mechanical?
5. Are important constructions attached to the right meaning?
6. Are phraseology/collocations sufficient for actual access and use?
7. Are important contrasts explicit and decision-useful?
8. Are register/form distinctions represented in the correct owner layer?
9. Is low-value material demoted without deleting useful knowledge?
10. Is the whole object still scanable?
11. Does learner-facing Depth projection faithfully expose the Current owner truth?

Patch/readback success is necessary but not sufficient.

---

## 7. Whole-asset upgrade, not defect-only patching

R12–R31 closed historical discovery through ordinal 7946, but that does not prove all historically `Current-correct` or direct-pass words already meet the final quality bar.

After known-debt closure, run stratified calibration across the remaining corpus for:

- overly thin Expansion;
- dictionary-dump Expansion;
- missing constructions or phraseology;
- hidden familiar-new senses;
- weak or misleading Core compression;
- overmerge / oversplit;
- weak contrast boundaries;
- bad learner-value ordering;
- wrong ownership between Word / Relation / Form;
- presentation hierarchy that makes complete knowledge unusable.

Simple L0 words should pass quickly when truly simple. Rich words should receive the depth they deserve.

This calibration is bounded and evidence-driven; it is not permission for a blind 7,946-word regeneration.

---

## 8. Batch quality beats throughput

Semantic upgrade batch size is determined by judgment quality.

- simple owners may be reviewed in larger bounded batches;
- rich polysemous / construction-heavy / relation-heavy owners require smaller batches;
- if final-object readback becomes superficial, shrink the batch;
- do not preserve a fixed throughput target at the expense of semantic quality.

The task may use mechanical tooling for routing, deduplication, hashes, referential integrity and projection checks. Mechanical execution does not own semantic judgment.

---

## 9. Ownership rules

Canonical semantic ownership remains:

- Word Natural Owner → word-local Core, senses, constructions and same-word polysemy;
- Relation Natural Owner → genuine cross-word semantic boundaries;
- Word / Identity / Form owner → spelling, capitalization, pronunciation, inflection, lexicalized-form or identity distinctions;
- generated learner projection → derived, not semantic authority;
- learner packets / local state → evidence, not content authority.

When ownership is ambiguous, fail closed and require semantic judgment. Do not create a convenient duplicate owner merely to make the patch easy.

---

## 10. K acceptance impact

Lexical K cannot pass merely because historical audit coverage is complete.

Before K re-acceptance:

- P0 lifecycle/carrier debt = 0;
- known P1 semantic-fidelity debt = 0;
- consolidated repair/upgrade inventory is closed or explicitly dispositioned;
- final-object readback demonstrates high-quality rich-word objects;
- stratified calibration stops exposing systematic content defects;
- learner-facing projection consumes Current truth faithfully;
- a documented stop rule is reached.

Only after K passes should unrestricted full-catalog P/R/E be re-evaluated.

---

## 11. Anti-goals

Do not turn this upgrade into:

- dictionary completion;
- a fixed sense-count target;
- a Core-only simplification program;
- an Expansion deletion program;
- a one-card-per-sense SRS;
- a blanket full-corpus regeneration;
- POS-driven sense splitting;
- old-text restoration without current judgment;
- a UI/build cleanup disguised as semantic acceptance;
- learner-state mutation.

The target is:

> **deep, complete learner knowledge at study time; selective evidence-driven repair at review time; high-quality Natural Owners that transfer into real English.**
