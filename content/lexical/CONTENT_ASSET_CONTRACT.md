# LexicalOS Content Asset Contract

Role: highest Content Realization / Optimization standard for the current **7,946 Main Words**.

Parent learning authority: `content/lexical/LEARNING_CONTRACT.md`

This contract answers one question:

> **What must a lexical content object contain so LexicalOS can reliably decide what is safe to pass quickly, what deserves Depth, and what exactly can later become a local Repair target?**

It does not own private learner state, review scheduling, UI layout, concrete Challenge instance generation, or visual design. It does own the content-side quality standard for derived Repair Test blueprints.

---

## 0. Core principle

The content asset exists to support this learner path:

```text
reliable coverage judgment
→ learner-controlled Fast Pass or Depth
→ rich Recall / Reveal when worthwhile
→ local + only where needed
→ selective Repair / Challenge
→ real-context transfer
```

Hard rule:

> **Every Main Word deserves reliable content judgment; not every Main Word deserves equal learner time or mandatory Depth.**

The purpose of rebuilding 7,946 owners is partly to discover which words are safe to move through quickly.

`7,946/7,946 content coverage != 7,946 learner Depth cards`.

---

## 1. One lexical truth, many learner projections

Canonical lexical truth remains owned by Current Natural Owners:

- Word Natural Owner → word-local Core / Word Feel, senses, constructions, collocations / phraseology, word-family material and same-word polysemy;
- Relation Natural Owner → genuine cross-word semantic / confusable / contrast boundaries;
- Form / identity truth → spelling, capitalization, pronunciation, inflection, lexicalized-form and identity distinctions in the correct canonical owner layer;
- pack membership → asset-management metadata only for the current phase;
- learner state → private evidence, never content truth.

A Study projection may be selective. Canonical truth must not be deleted merely to make a card shorter.

Valid but low-current-value material may move behind Explore/Search/reference-only, but it must remain correctly owned.

---

## 2. Coverage Layer: every Main Word must be classifiable

A reliable content object must permit a bounded coverage judgment of at least these questions:

1. Is the ordinary Core / Word Feel correct and present?
2. Are important current senses present and correctly separated?
3. Is there a familiar-new or hidden branch likely to defeat familiarity?
4. Is there a construction or phrase skeleton whose form itself matters?
5. Is there useful collocation / phraseology that materially improves recognition, selection, translation, or production?
6. Is there a confusable, contronym, or decision boundary that changes interpretation?
7. Is there a material register / stance / intensity / valence distinction?
8. Is there a material spelling / pronunciation / form / capitalization / inflection distinction?
9. Is word-family information learner-worthy rather than decorative?
10. Is low-value historical / specialist material correctly demoted rather than crowding Study?

Coverage judgment is content engineering. It does not infer Kian's personal familiarity.

---

## 3. Static intrinsic learner-risk signals

Content may carry **intrinsic risk signals** that describe the lexical object itself.

Examples:

- `polysemy`
- `familiar_new`
- `construction`
- `phraseology`
- `confusable`
- `contronym`
- `form_pronunciation`
- `register_stance`
- `productive_value`
- `ownership_boundary`

These signals mean:

> **This word contains something that may justify learner attention.**

They do **not** mean:

> Kian currently does not know this word.

Final learner routing later combines:

```text
content intrinsic risk
+ learner history / current evidence
+ Kian's current subjective judgment
→ Fast Pass / Depth / Repair decision
```

Content must never encode private `Unknown / Fuzzy / Known / Mastered` state as shared semantic truth.

---

## 4. Two accepted final content shapes

After final-object readback, a non-blocked Main Word should normally be understandable as one of two content shapes.

### A. SAFE_SIMPLE

The owner is semantically trustworthy and has no material hidden learner risk that requires a rich default Depth object.

Typical properties:

- one or very few ordinary learner-worthy meanings;
- no important familiar-new branch;
- no consequential construction / phrase skeleton;
- no important confusable or form boundary;
- ordinary collocations are optional enrichment rather than learning bottlenecks;
- Core is accurate and compact;
- reference material does not crowd the active object.

`SAFE_SIMPLE` means **Fast-Pass eligible by content**. It does not declare personal mastery.

Example archetype: `ambulance`.

### B. DEPTH_READY

The owner contains real learner risk and supplies a coherent rich learner object sufficient to resolve it.

Typical triggers include:

- meaningful polysemy;
- familiar-new senses;
- construction-heavy use;
- phraseology or collocation that changes access / selection;
- confusable / contronym boundaries;
- material register, pronunciation, form or productive-use distinctions.

`DEPTH_READY` does not force Kian to enter Depth every time. It means that if Depth is chosen, the content is ready.

Examples: `abstract`, `access`, `sanction`.

### BLOCKED

Use `BLOCKED` when a reliable final learner object cannot yet be produced without guessing, unresolved ownership, or unresolved semantic evidence.

Do not silently pass an ambiguous object to preserve throughput.

---

## 4A. Frozen module generation rules

These rules exist to prevent semantic drift and stylistic churn across repeated content-upgrade passes.

### Global stability rule

A later pass defaults to **PRESERVE**.

A module may be changed only for one or more explicit reasons:

- `CORRECTNESS_GAP` — meaning, usage, boundary or form is wrong;
- `COVERAGE_GAP` — a learner-worthy current branch is missing;
- `DECISION_GAP` — the learner cannot reliably choose among existing branches;
- `STRUCTURE_GAP` — a reusable construction / complement / argument pattern is not represented clearly;
- `PHRASEOLOGY_GAP` — a high-value lexical combination needed for recognition or production is missing;
- `OWNERSHIP_GAP` — truth is stored in the wrong canonical owner or duplicated across owners;
- `REGISTER_FORM_GAP` — a material register / stance / intensity / pronunciation / spelling / inflection distinction is missing;
- `PRODUCTIVE_VALUE_GAP` — an important Translation / Writing retrieval pattern is absent;
- `TESTABILITY_GAP` — an important lexical risk cannot be tested cleanly from current content;
- `REDUNDANCY_NOISE` — duplicated learner-facing content obscures the real object.

`STYLE_POLISH` is **not** an allowed reason.

> **If a module already satisfies its rule and no explicit gap exists, preserve it even if another writer could phrase it differently.**

Every fresh owner receipt must give each module one status:

```text
NOT_NEEDED
PRESERVE
UPGRADED
BLOCKED
```

### A｜Core / Word Feel

**Job:** compress the whole word into the smallest model that helps predict its important uses.

Generate / upgrade Core only when:

- current Core is only a list of Chinese glosses;
- one genuine organizing model can unify important branches;
- a genuine split / contronym must be explicit;
- a rare / technical branch dominates the current summary;
- a high-value branch-selection cue is missing.

Field roles:

- `core_meaning_cn` = compact whole-word summary;
- `core_meaning_en` = concise lexical calibration;
- `mental_model_cn` = how to select / transfer the word across contexts when a decision rule exists;
- `core_clusters` = real branch groups only, never one cluster per dictionary row.

Stop when Core predicts the major learner-worthy uses without flattening genuine polysemy.

Do not concatenate translations, repeat the Sense list, rewrite a good Core for style, or invent a fake metaphor.

### B｜Active Sense

**Job:** represent learner-worthy current meanings that materially change comprehension or use.

Create / keep an active Sense when omission could plausibly cause wrong comprehension, mistranslation, wrong parse / argument structure, wrong branch selection, or loss of an ordinary / professionally useful modern meaning.

Each active Sense should have:

- one distinct learner definition in Chinese;
- one concise English calibration;
- correct POS / governing pattern where material;
- a Sense-local note only when it adds a real boundary;
- Sense-local phraseology only when it truly belongs to that Sense.

Stop when all learner-worthy current branches are present and distinguishable.

Do not split because dictionaries use different rows, merge because Chinese glosses look similar, or create new Senses for Recall-map cosmetics.

### C｜Familiar-new / Secondary Sense

**Job:** expose a hidden branch that a familiar surface form could cause the learner to miss.

Promote only when the surface is likely to feel known, the branch is modern and useful enough to matter, omission could cause a realistic error, and there is a distinct contextual / syntactic / collocational / domain cue.

A familiar-new branch needs a useful selector, not just another Chinese gloss.

`secondary_senses` is a learner-projection role, not lower semantic truth.

Do not create familiar-new content from rare dictionary completeness alone.

### D｜Construction

**Job:** expose a reusable form skeleton whose structure itself carries learning value.

Promote when argument slots matter, preposition / complement choice matters, the pattern selects or changes meaning, it is reusable for Translation / Writing, or hiding it in one example would conceal the rule.

A Construction should state a normalized pattern with slots, what it means / does, optional English calibration when helpful, and R / D / P demand only when material.

Stop at one stable representation per reusable skeleton.

Do not promote every frequent phrase, store one example sentence as a Construction, or duplicate a Sense-local fixed pattern without a separate learner job.

### E｜Collocation / Phraseology / Multiword Unit

**Job:** preserve lexical combinations whose selection is not safely predictable from general grammar alone.

Include only when it materially improves recognition speed, idiomatic selection, phrase completion, translation, writing, or Sense discrimination.

Use `fixed_pattern` when the combination itself should be retrievable; use `usage_example` when it only illustrates a Sense.

One strong phrase is better than several generic corpus co-occurrences.

Do not fill quotas, keep arbitrary frequent neighbors, or duplicate a Construction without a separate lexicalized job.

### F｜Same-word Decision Boundary

**Job:** tell the learner what cue selects one branch of the same word over another.

Required when two active branches are realistically confusable, the word is a contronym, syntax / collocation / object type selects meaning, or a familiar-new branch is easy to misread.

A useful boundary says:

```text
cue / context / syntax
→ branch
→ consequence
```

Same-word boundaries stay Word-owned.

Do not merely restate “A means X; B means Y”.

### G｜Cross-word Relation / Confusable

**Job:** explain when two different words are not interchangeable.

Create only when comparison changes a real learner decision. Material dimensions may include semantic scope, syntax, collocation, register, stance, agency, result vs process, intensity, or writing safety.

Cross-word truth stays Relation-owned.

Do not create thesaurus lists, generic “both mean ...” notes, or Relations without a selection rule.

### H｜Register / Stance / Intensity / Valence

**Job:** preserve pragmatic distinctions that can change interpretation or make production materially inappropriate.

Generate only when the distinction changes a real choice. Attach it to the smallest truthful owner: Sense, Construction, Relation or Form.

Use actionable distinctions such as formal legal vs neutral everyday, approving vs disapproving, strong vs mild, or positive vs negative valence.

Do not add vague labels that do not change what the learner should choose.

### I｜Word Family / Morphology

**Job:** help decode or produce genuinely useful related forms.

Include when the relation adds productive derivation, useful POS shift, a meaning-preserving morphological pattern, important semantic drift, or high-value production support.

A useful family entry explains the relation; “same AWL family” alone is insufficient.

Prefer a few productive links over exhaustive family trees. Decorative family members stay out of default Depth.

### J｜Form / Pronunciation / Spelling / Inflection

**Job:** preserve non-obvious form distinctions that matter for recognition, identity or production.

Generate when material: POS-conditioned pronunciation / stress, irregular inflection, confusing spelling, capitalization changing lexical identity, regional form difference, homograph / heteronym distinction.

Structured Form / identity remains canonical.

Do not duplicate the same pronunciation rule in Sense notes once Form owns it. Routine pronunciation alone is not Expansion.

### K｜Translation / Writing Productive Use

**Job:** mark lexical material worth active retrieval, not create a separate exam-tip layer.

Generate only when an exact Word / Sense / Construction provides high-value reusable production.

A productive cue must identify what form should be retrieved, what semantic / syntactic constraint matters, and whether demand is Production or only Discrimination.

Prefer reusable patterns over memorized complete sentences.

Do not turn every Sense into Production, store generic writing advice, or add non-lexical exam tricks.

### L｜Repair Test Blueprint

**Job:** describe how to diagnose one exact lexical weakness; concrete questions remain freshly generated.

A blueprint is allowed only when the target has stable identity, a wrong answer would change the next Repair decision, and the diagnostic is grounded entirely in current canonical truth.

Required fields:

- exact target identity;
- Recognition / Discrimination / Production demand;
- diagnostic intent;
- decision boundary being tested;
- plausible distractor policy;
- context constraints preventing answer leakage;
- smallest useful Repair if wrong;
- Reconstruction rule using a changed context.

Typical mapping:

- Sense → contextual meaning / paraphrase discrimination;
- familiar-new → branch selection;
- Construction → slot / complement selection;
- phraseology → phrase completion / idiomatic selection;
- Relation → forced contrast;
- Form → pronunciation / spelling / identity discrimination;
- productive target → constrained mini-translation / production.

Hard rules:

- blueprint never invents semantics absent from canonical Content;
- concrete Test instances are normally regenerated fresh;
- one Test answers one diagnostic question;
- distractors come from real neighboring branches / confusions;
- Reconstruction changes context rather than repeating the item;
- if canonical target meaning / boundary changes, the blueprint must be revalidated;
- `SAFE_SIMPLE` may correctly have `NO_TEST_NEEDED`.

### M｜Recall Map and Reference

Recall Map is derived from accepted active learner objects. Never alter semantics merely to make Recall notation neat.

Reference-only stores valid low-current-value truth that should remain searchable without crowding Study. Demotion requires a semantic reason; it is not a layout tool.

---

## 5. Core / Word Feel

Core is a compression layer, not a bilingual definition list.

A strong Core should:

- give one compact organizing feel when a real common model exists;
- preserve genuine branch separation when one umbrella would be false;
- help predict or recognize major uses across contexts;
- avoid simply concatenating Chinese glosses;
- avoid allowing a rare / technical branch to define the whole word;
- remain useful after the learner leaves the current example sentence.

For genuine contronyms or strongly separated polysemy, Core may explicitly contain a structured split rather than pretending there is one ordinary meaning.

Example principle for `sanction`:

> the learner needs a useful authority / permission-versus-penalty organization and context-selection boundary, not only the string `批准；制裁`.

---

## 6. Active Senses

Include senses that materially improve real comprehension, discrimination, translation, or useful production.

Prioritize:

- ordinary current meanings;
- familiar-new meanings hidden behind a very familiar surface;
- branches common enough to affect serious reading;
- branches that change argument structure or likely parse;
- academically / professionally useful meanings when not specialist trivia;
- meanings whose omission could cause a plausible wrong answer or mistranslation.

Do not:

- split mechanically because dictionaries list different POS rows;
- merge merely because Chinese translations overlap;
- promote low-frequency specialist senses above ordinary modern ones;
- keep an active sense only because historical data happened to contain it.

Sense identity should remain stable when truth is continuous; semantic repair should not create needless new IDs.

---

## 7. Recall Map compatibility

Content must be able to support compact Recall notation such as:

- `3A + 2N + (1+1)V`
- `2N + 1V`
- `by ~`
- `~ A from B`

The count represents **learner-worthy active meanings**, not dictionary sense count.

A parenthesized / `+` branch may mark a high-value hidden branch behind familiarity.

Content must not manipulate sense structure merely to make Recall notation look neat. Recall Map is derived from accepted semantics.

---

## 8. Expansion is first-class

For this learner, Expansion is a major value layer, not optional decoration.

Expansion may include:

- familiar-new senses;
- construction / argument skeletons;
- collocation / phraseology / multiword units;
- contrast / confusable decision boundaries;
- register / stance / intensity / valence;
- morphology / word family;
- pronunciation / stress / spelling / capitalization / inflection / regional-form boundaries;
- useful translation / production distinctions.

Hard rule:

> **Rich content is allowed to be rich. Control future burden with hierarchy and selective Repair, not by deleting useful Expansion.**

Expansion must still earn learner value. Do not preserve arbitrary corpus co-occurrences, dictionary trivia, or mechanically enumerated micro-senses merely to look complete.

---

## 9. Construction versus collocation

A construction is first-class when the pattern itself carries stable reusable learning value.

Promote a pattern when, for example:

- argument slots matter;
- preposition / complement choice materially changes correctness or meaning;
- the construction creates a meaning shift;
- the pattern is productive for reading, translation, or writing;
- hiding it inside one example would make the reusable structure invisible.

Example:

> `abstract A from B` should be represented as a reusable construction if that pattern is learner-worthy, not buried only as an incidental collocation.

Collocations / phraseology remain valuable when they improve recognition speed, idiomatic selection, phrase completion, translation, production, or sense discrimination.

Do not promote every common co-occurrence into a construction.

---

## 10. Decision boundaries

For high-risk polysemy, contronyms and confusables, merely listing definitions is insufficient.

The content should expose a **decision-useful boundary** when material:

- what semantic / syntactic / collocational cue selects one branch;
- what context makes two near-synonyms non-interchangeable;
- what typical phrase points to one reading;
- what register / agency / result / process / intensity distinction matters.

Example principle:

```text
economic / trade sanctions → penalty branch
sanction a plan / action → authorize branch
```

The purpose is transferable branch selection, not memorizing two Chinese labels.

Cross-word truth remains Relation-owned; same-word branch selection remains Word-owned.

---

## 11. Recognition / Discrimination / Production demand

Content may represent learner demand sparsely when it materially changes what should be practiced.

Useful demand dimensions:

- `R` — Recognition: seeing the item should produce fast correct comprehension;
- `D` — Discrimination: the learner should select the correct branch / construction / contrast under context;
- `P` — Production: the item is valuable enough to retrieve actively for Translation / Writing.

Not every lexical object needs explicit `R/D/P` metadata.

Do not turn all Expansion into production obligations. A low-frequency useful sense may be `R`; a confusable may need `D`; a high-value writing construction may justify `P`.

These are content-learning demands, not personal mastery state.

---

## 12. Reference-only material

Reference-only content remains available for Explore/Search when valid but low-current-value.

Typical examples:

- historical / archaic uses;
- highly specialist technical micro-senses;
- rare regional or dated uses;
- completeness-only word-family material;
- low-value lexicalized variants.

Demotion must be semantically justified. Do not mark an ordinary modern branch reference-only merely to make the Study card shorter.

Reference-only does not mean deleted, wrong, or unavailable.

---

## 13. Pack boundary for the current phase

Current learner scope is the existing 7,946 Main Words.

Pack membership remains metadata such as `kaoyan`, `cet`, `toefl`, `awl`, etc.

For this Content rebuild:

- do not duplicate Word semantics by pack;
- do not create TOEFL / IELTS-specific copies of a word;
- do not let number of pack memberships determine Depth;
- do not implement multi-profile demand overlays yet;
- preserve pack provenance so future incremental expansion remains possible.

One Word owner remains the semantic truth regardless of how many packs include it.

---

## 14. Final-object readback acceptance

A Word owner is not accepted because:

- JSON parses;
- a field exists;
- a historical patch was replayed;
- a validator is green;
- a fixed number of senses or expansions was reached;
- the UI can render it.

For each final object, ask:

1. Is the ordinary Core true and useful?
2. Are all learner-worthy current senses present?
3. Is familiarity risk handled rather than hidden?
4. Are sense boundaries cognitively useful?
5. Are important constructions promoted correctly?
6. Are phraseology / collocations sufficient but not noisy?
7. Are decision boundaries explicit where needed?
8. Are material form / register / family distinctions in the correct owner layer?
9. Is low-value material demoted without loss of valid truth?
10. Can a simple word safely support Fast Pass?
11. Can a rich word support a coherent high-value Depth encounter?
12. Could a learner later `+` the smallest meaningful local object rather than the whole word by necessity?
13. Is the object scanable despite any necessary richness?
14. Does no field encode private learner familiarity / mastery?

Only final integrated readback can close semantic Content judgment.

---

## 15. Coverage proof for all 7,946 Main Words

Every Main Word must receive one fresh **Content coverage conclusion** under this contract.

The conclusion is about the content asset, not learner mastery.

Allowed terminal content outcomes:

```text
SAFE_SIMPLE
DEPTH_READY
BLOCKED
```

`SAFE_SIMPLE` and `DEPTH_READY` may be reached either with no semantic mutation or after an upgrade.

Therefore operation history is separate from final quality:

```text
NO_CHANGE + SAFE_SIMPLE
NO_CHANGE + DEPTH_READY
UPGRADED + SAFE_SIMPLE
UPGRADED + DEPTH_READY
BLOCKED
```

This avoids confusing “was edited” with “is good”.

Coverage accounting must prove each ordinal was concluded exactly once for the current acceptance generation, while Relation / Form mutations are reconciled by their true canonical owners.

---

## 16. Batch execution boundary

A large Chat ownership range is allowed for operational convenience, but acceptance must close locally enough that semantic judgment does not turn into a deferred repair queue.

Hard rule:

```text
read bounded owners
→ fresh judgment
→ mutate exact owner when needed
→ final-object readback
→ local receipt / acceptance closure
→ continue
```

Do not return to:

```text
inspect hundreds of words
→ accumulate repair specs
→ later bulk-apply everything
```

Batch size is adaptive. Simple healthy owners may close quickly; rich polysemy / construction / Relation-heavy owners require smaller semantic units.

Word ordinal ranges may be worked independently only while their write sets are actually independent. Relation / Form owners that cross ranges must be reconciled against the latest integration truth before acceptance.

---

## 17. Anti-goals

Do not turn the 7,946-word rebuild into:

- 7,946 mandatory learner Depth cards;
- dictionary completion;
- one sense = one permanent review card;
- one Pack = one duplicate lexicon;
- fixed sense-count targets;
- forced Expansion deletion;
- mandatory production for every valid item;
- historical wording restoration;
- audit → queue → later repair bureaucracy;
- validator/build-driven semantic PASS;
- learner-state mutation;
- UI cleanup disguised as Content acceptance.

The target is:

> **trustworthy lexical truth, reliable Fast-Pass safety for simple words, rich high-value Depth for risky words, first-class Expansion for refinement, and local repairability without manufacturing review debt.**
