# Lexical Final Learner Object Contract

Status: **CURRENT — Content-owned direct-consumption learner object layer**

Authority chain:

```text
Current Natural Owners
→ Content-owned Final Learner Object build
→ Website direct render
```

This layer is derived Content. It is not a second semantic authority.

The website must not infer importance, merge survival, ownership, or semantic equivalence. Any default Study compression happens here before rendering.

## 1. Goal

The Final Learner Object exists to make accepted lexical truth directly consumable without exposing backend redundancy.

A rich canonical owner may legitimately contain overlapping representations for semantic ownership, evidence, identity, and repairability. The default learner surface must not repeat the same idea merely because it exists in multiple canonical fields.

One-screen fit is a useful density signal, **not a hard requirement**. A genuinely rich word may scroll. Repetition alone must not create extra length.

## 2. Default Depth ownership

### Word Feel

Default Depth uses:

- Chinese Core summary;
- Chinese mental model / decision boundary when it adds information.

Default Depth does **not** separately repeat:

- Core cluster cards when active Senses already carry those branches;
- English Core summary / English mental model when active Sense English definitions already provide lexical calibration.

Canonical Core clusters and English Core remain available to Explore/reference and remain canonical truth.

### Sense

Sense owns:

- POS / governing pattern;
- Chinese learner definition;
- English lexical calibration;
- sense-local usage note;
- sense-local collocations / phraseology.

### Construction

Word-owned Construction remains first-class when it is a surviving learner object.

If a Construction explicitly carries `presentation_merge.surviving_object_id` and that exact surviving collocation ID is already materialized in an active/secondary Sense, the merged Construction is omitted from the Final Learner Object. This is identity-based merge closure, not semantic inference.

If the declared survivor is not materialized, keep the Construction rather than guessing or losing knowledge.

### Reference

Reference owns genuine extra boundaries only:

- cross-word Relation / Confusable;
- Form / Pronunciation;
- productive Family / other accepted reference objects.

Do not manufacture Reference content from same-word Sense/Core repetition.

When a structured Form object already exposes the usable distinction directly:

- keep POS / learner key / IPA;
- omit explanatory prose that merely restates the same pronunciation rule;
- omit `initial/final` labels when the learner key itself already marks the stress;
- omit Sense usage notes whose only purpose is repeating the same pronunciation/stress distinction.

Canonical prose remains upstream for Explore/reference. Default Depth keeps the smallest learner-useful form.

## 3. Builder invariant

> **Final Learner Object builder may resolve explicit ownership and projection decisions; it may not discover semantic equivalence.**

In plain terms:

> **builder 可以执行决定，不能做决定。**

A suppression / promotion is valid only when an explicit Content-owned role, merge, disposition, or projection override already says so.

### Sparse explicit decision owner

Default rule is **preserve**. Exceptional default-Depth dispositions live in:

`content/lexical/final-learner-object-decisions.json`

This is derived Content, not semantic Truth. It may reference only stable Current identities, is consumed only by the canonical Final Learner Object materializer, and must remain sparse.

Example:

```text
word:abstract
→ sense:... adjective pronunciation note = EXPLORE_ONLY
→ sense:... verb pronunciation note      = EXPLORE_ONLY
```

The canonical materializer `tools/lexical_build_final_learner_objects.py` may execute that exact ID-bound override. It may not inspect note text to decide that it "looks like Form".

Sense-local fields may also carry explicit, stable-ID-bound default-Depth dispositions when another surviving learner object already owns the same learner job. Current field-level decisions include `sense_usage_notes` and `sense_governing_patterns`. A governing pattern may be `EXPLORE_ONLY` only when the same reusable skeleton remains directly available in a surviving learner object, normally a Word-owned Construction. A broader selector or argument pattern must stay in the Sense when the surviving Construction is narrower.

For structured `form_identity.variants`, the default Depth mapping is fixed rather than heuristic:

```text
pos
learner_key
ipa
```

Canonical `boundary`, `stress`, provenance and identity metadata may remain upstream for Explore/reference, but they are not duplicated into the default structured Form learner object merely because they exist.

### Ordinary headword IPA projection

The authorized Vocabulary IPA surface consumes `record.form_identity.headword_pronunciations` through Final `pronunciation_support`, separately from `reference.form`. Ordinary pronunciation support creates no Reference module, Repair target or learning debt. The existing Form reference and its variants/boundaries remain intact.

The fixed projection preserves each complete literal IPA, explicit `en-US`/`en-GB` locales, applicability (including exact Sense IDs and exclusions, case, POS and conditions), spelling binding and derived-transcription basis. Missing/fragmentary transcriptions remain absent. Unmarked locales remain unknown; audio, source entry POS and another region are never locale evidence. The builder does not select a first/default reading or normalize phonemes across transcription systems.

Sense placement uses only explicit applicability Sense IDs minus exclusions. Unbound headword observations stay beside the word, without a guessed primary-meaning assignment. Existing complete Form variants remain independent positive evidence: their explicit POS may bind to exact matching current Sense POS, and a terminal ` · US`/` · UK` learner-key label supplies that variant's region. Existing complete literal `boundaries[].pronunciation` fields retain their condition as unmarked-region headword support, without parsing that condition into Sense IDs or extracting more IPA from prose/mixed strings. A newer observation's exclusion does not erase an older valid Form reading.

The front may show the selected region's literal IPA alternatives plus explicitly unmarked alternatives. Restricted readings carry a neutral reminder to inspect their scope after Reveal, without exposing POS, meaning, case/strong-weak conditions or source-derived limitations before Recall. Revealed headword/Sense support preserves those conditions, marks derived transcriptions and same-lexeme spelling donors, and never presents an unknown reading as American/British. Browser speech remains system TTS, not source-recorded audio or proof that a particular displayed alternative was spoken.

Legacy variants with an explicit `surface`/`canonical_form` differing from the headword stay in the existing Form reference; an inflected spelling is not the headword's pronunciation. When the owner explicitly declares `choice_rule: sense_selects_pronunciation`, `identity_rule: sense_selects_pronunciation` or `form_type: heteronym_sense_conditioned_pronunciation`, POS alone cannot select the intended Sense. Only explicit variant Sense IDs may bind those readings; otherwise they remain unbound headword alternatives with their existing learner condition, never a blanket noun/verb assignment. Approved observation scopes/exclusions are not broadened by an unbound legacy fallback.

Changing background IPA changes the real `source_fingerprint`; revision guards remain intact. For a manual Repair removal, the existing evidence bridge must clear the exact selected target's retained revision. It must not substitute the newly displayed source revision, clear every version sharing a locator, or rewrite old evidence. New marks continue to use Current source revision.

## 4. No heuristic semantic dedupe

The builder may use:

- stable IDs;
- explicit `presentation_merge`;
- explicit owner roles;
- exact Current Relation refs.

The builder must not use:

- fuzzy string similarity;
- model judgment;
- priority / score thresholds;
- UI-space pressure;
- ad-hoc “this looks similar” suppression.

Any further semantic compression requires an explicit Content-owned projection decision or richer canonical metadata.

## 5. Direct-render invariant

After this build:

> Website 有啥画啥。

The renderer may choose typography, spacing, columns, cards, and interaction. It may not remove or promote learner fields based on semantic judgment.
