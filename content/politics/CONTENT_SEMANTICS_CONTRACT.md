# Politics Content Semantics Contract

Status: **CURRENT — Content Semantics**

This file owns the machine-readable **content realization** that sits between Politics Learning Logic and Astro Projection/UI.

Upstream:
- `content/politics/LEARNING_CONTRACT.md`
- `content/politics/INTERACTION_CONTRACT.md`

Sibling Content authority:
- `content/politics/CONTENT_HIERARCHY_CONTRACT.md` — learner attention tier / progressive-disclosure ownership for accepted semantic objects.

Downstream:
- `static-web/PRESENTATION_CONTRACT.md`
- Astro components / layout / state implementation

Core rule:

> **Content should describe what the learner needs to understand, distinguish, retain, reconstruct, locate, and when it deserves learner attention. It must not decide pixels, columns, cards, colors, or component names.**

---

## 1｜Why this layer exists

Politics chapter JSON historically contained good teaching prose such as `core_problem`, `teaching_beats`, and `closure_cue`, but those fields alone leave too much interpretation to whichever consumer happens to read them.

That creates two dangerous shortcuts:

```text
teaching prose → Chat reconstructs a course again
teaching prose → generic Website cards / sections → page
```

Both are wrong when they cause the consumer to decide the learner's model, memory split or attention structure.

The Content Semantics layer makes the cognitive product explicit **before both Chat and Website consume it**.

The intended authority chain is:

```text
Source Truth
→ Learning / Content judgment
→ canonical Politics Content
   ├─ subject / chapter position
   ├─ main model + relations
   ├─ node main prompts
   ├─ Core / boundaries
   ├─ residual Precision / Memory
   └─ Source scope / gaps
→ consumer adaptation
   ├─ Chat explanation / questioning / repair
   └─ Website projection / Recall / evidence
```

`learning_semantics`, chapter compression, accepted main prompts and their learner-attention priority are therefore **Content**, not UI and not runtime Chat inventions.

### 1.1 Content product completeness

A Politics chapter / Natural Unit is semantically complete for a reported scope only when a fresh consumer can recover the following **without inventing missing learning decisions**:

1. **Position and problem** — where this content sits and what problem it solves.
2. **Canonical model** — stable nodes plus meaningful relation / order / hierarchy and decisive conditions.
3. **Node main prompts** — the selected model-bound structured memory that should be actively recovered with each node. Prompt wording may be compact, but its membership and required depth are Content decisions under Learning §§0.7/6.1.
4. **Core / boundary content** — the explanation and distinctions needed to understand and discriminate, including material that is important but not an active memorization target.
5. **Residual Precision / Memory** — only selected exact material that is better practiced independently than carried by a model node.
6. **Source boundary** — owning Source, inspected scope and unresolved or timing-sensitive limitations.

These jobs may be realized through existing chapter JSON, `learning_semantics`, subject/chapter support and precision owners. Do not create a duplicate “Chat version” or “Website version” of the same semantics.

A consumer may expose only the subset appropriate to the current action, but hidden detail remains owned upstream. UI layout, reveal behavior, local storage, scheduling, compiler metadata, hashes and migration witnesses do not become part of Content completeness merely because a downstream system needs them.

**Prompt and Memory are not two independent inventories.** Learning §0.7 first decides which knowledge is worth active retrieval, then Content places naturally model-bound groups in node prompts and keeps only the residual exact items in Precision / Memory. Existing Website card availability cannot reverse this decision.

---

## 2｜Schema

A calibrated Politics Natural Unit may add:

```json
{
  "learning_semantics": {
    "schema": "kianos.politics.learning_semantics.v1",
    "status": "CURRENT_CALIBRATION",
    "content_stage_only": true
  }
}
```

`CURRENT_CALIBRATION` means the semantic model is being proven before broad rollout.

Once the content shape has passed its content audit and is no longer a calibration exception, it may move to `CURRENT`. UI completion is not required for Content to become Current, and UI completion cannot substitute for Content acceptance.

---

## 3｜Allowed semantic objects

Not every Natural Unit needs every object.

### `problem`
The central learner question for this Natural Unit.

Must contain source evidence for the knowledge scope it summarizes.

### `framework_maps`
Zero or more topology / hierarchy / multi-branch relation models whose learner value comes from seeing how parts fit together.

Use an **array** because one Natural Unit can contain more than one genuinely distinct map. Do not force unrelated structures into one mega-map merely to satisfy schema shape.

Each map should contain a stable `id`, title, nodes and meaningful edges when relations exist.

Each node should state:
- stable id;
- learner-readable label;
- meaning;
- source evidence.

Edges describe semantic relations, not screen coordinates.

Calibration note: the first S01 draft used singular `framework_map`. S02 exposed that this was overfit; Current calibration now uses `framework_maps[]`.

### `relation_chains`
A causal, historical, reasoning, or process sequence.

Use this when order/transition is the important cognition.

### `boundaries`
A high-value distinction that prevents a predictable confusion.

A boundary should explain *why* the two sides differ, not merely print `A ≠ B`.

### `anchors`
Scarce organizing statements worth carrying through the Natural Unit.

Do not make every bullet an Anchor.

### `precision_objects`
Exact facts whose learning behavior differs from broad understanding: fixed formulations, identity, date, work, legal wording, list membership, etc.

Each precision object must declare its learning priority so Orientation does not silently become a memorization wall.

### `source_handoff`
The stable cross-surface learning target already authorized by Logic.

Under [Learning §2](LEARNING_CONTRACT.md#2-active-first-round-learning-chain), Chengfeng owns detailed-study and compression input; Chat offers clarification and compression. This handoff locates original text/images for source study or calibration, with:
- source locator;
- source owners;
- a small `look_for` list.

It does not contain a copied Chengfeng lecture.

### `recall_seed`
A content-owned reconstruction target that can later be projected as Recall.

It states what relation/model should be reconstructable after source learning. It does not decide the UI widget or reveal animation.

### `suyi_dispositions`
Machine-readable accounting for Suyi evidence used during content closure.

Allowed dispositions inherit `INTERACTION_CONTRACT.md`:
- `ABSORBED`
- `DUPLICATE`
- `CROSS_UNIT`
- `REPAIR_ONLY`
- `REFERENCE_ONLY`
- `REJECTED / UNSUPPORTED`

Every `ABSORBED` Suyi source must actually contribute to a semantic object. Suyi evidence used by a semantic object must be accounted for by a disposition.

### `audit`
Path to the bounded human-readable delta/content audit supporting the calibration or closure.

### 3.1 `learner_tier` override

Most semantic objects inherit their learner-attention tier from `CONTENT_HIERARCHY_CONTRACT.md`; **manual tagging is not required by default**.

A genuine semantic exception may add:

```json
{
  "learner_tier": "H2_FIRST_ROUND_CARRY"
}
```

Allowed values:
- `H1_ORIENTATION_CORE`
- `H2_FIRST_ROUND_CARRY`
- `H3_SUPPORTING_UNDERSTANDING`
- `H4_ON_DEMAND`
- `H5_REPAIR_REFERENCE`

`learner_tier` describes learner attention priority, not layout.
It cannot request cards, columns, diagrams, colors, size, or placement.

The defaults and hard promotion/demotion guards are owned by `CONTENT_HIERARCHY_CONTRACT.md`.

---

### 3.1.1 Prepared chapter package realization

Learning Contract §3.1.1 governs optional prepared Chat teaching. Current source-compression and retention jobs follow §2 / §6.1; historical brief stage/C instructions do not override those jobs. Existing packages remain reusable support, not a mandatory course or a ready-made must-memorize syllabus.

Realize that package through existing Content owners. The exact file split is flexible, but the following learner jobs must be inspectably owned rather than inferred at runtime:

- canonical subject total model plus the chapter reconstruction spine / mother model and their explicit chapter-within-subject relation;
- stable progressive teaching stages or batches, each with a recoverable identity, **problem/tension being resolved**, owned spine/content range and next-question/closure relation; the stage route is a teaching argument over the fixed spine, not a second framework or a numbered-spine recital;
- substantive explanation attached to those stages;
- deliberate confusable/boundary teaching pass;
- same-model compression;
- reviewed exact-retrieval targets and Memory handoff.

A teacher brief may carry the long-form exposition and confusion pass while chapter JSON carries the stable spine, stage routing and precision objects. That is one package when both resolve to the same chapter/NU identities and reviewed meaning; it is not permission for two competing versions.

Stage labels such as “first fill” / “second fill” are pedagogical routing only. Do not promote them into new Natural Units or Runtime states. Their labels/anchors may still be stable content-routing identities. What matters is that a fresh Chat can deterministically recover **which stage it is in, which fixed-spine nodes/content it owns, what comes next and what already prepared asset to teach**, without synthesizing a new chapter course from Source.

The Content review must reject:
- subject total model missing or a chapter unable to state where it sits in that model;
- fixed chapter spine present but no reusable substantive teaching content;
- full prose present but no stable teaching-stage routing, leaving each Chat to choose a new fill order;
- a “prepared route” whose stage identity is merely “nodes 01–04 / 05–07 / 08–10” with no chapter-level problem/dependency logic, so first teaching degenerates into reading the reconstruction spine;
- “易混/边界” recoverable only by rereading raw questions rather than prepared Content;
- compression that introduces a new framework;
- precision lists that are not attached to the same model;
- teacher brief and chapter/Memory objects that disagree on the same claim.

### 3.2 Model-to-memory content realization

Learning Contract §§3.2/6.1 owns learning and admission meaning. This section owns its realization in the existing chapter semantics / precision groups / `*.memory.json` path; it does not create another catalog or scheduler.

A usable exact-retention object/group must resolve:

- stable chapter/NU and content identity, the owning explanation/model relation, and inspected Source/edition provenance;
- a specific retrieval prompt, authoritative answer and essential checking criteria: allowed paraphrase, complete membership, exact pairing, decisive qualifiers and any meaningful order;
- a useful memory cue/grouping/contrast where needed, explicitly distinguishable from the authoritative answer and safe to withhold before retrieval;
- the reviewed admission route or exact pending limitation, plus phase/prerequisite boundaries under Learning §6.1; the existing review distinguishes source correctness, retention necessity/accuracy, and model-bound versus independent-fragment placement under §0.7, citing the exact Leg passage for either new proactive baseline route;
- its existing candidate ID / consumer path, or a concrete unresolved mapping. Reuse, revise or retire duplicates against their original owner instead of hand-synchronizing parallel answers.

These are semantic requirements, not permission to invent field names that no consumer reads. Reuse `precision_objects`, `content_support` groups, `statement`, `source_refs` and existing sidecar identities where they fit. A bounded additive extension for an explicit prompt/checking content is allowed only through this Content owner plus the resolved Runtime implementation owner, with loader → catalog → plan/evidence snapshot → renderer → return compatibility proved together. A new registry, new command/state family or cross-system architecture change remains OWNER_UNRESOLVED until Engineer resolves it through the existing architecture owners.

The current catalog contract exposes `prompt`, `answer_items`, `source_refs` and stable IDs. An explicit source-owned prompt must not be silently replaced by `unit title | form`; two different answer sets require distinguishable retrieval questions. Task granularity follows cognition: preserve a meaningful comparison/list, then split only when one response cannot identify the failing part. Correcting wording is not by itself a reason to create a duplicate ID; changed meaning reopens dependent snapshots under the existing freshness contract.

Catalog discovery, content admission and learner scheduling are distinct. A metadata flag alone must not claim that Runtime enforces admission. Preserve enough inspectable admission/provenance at the actual selection boundary to prevent a pending or historical-only target being treated as ready; an unsupported target is blocked locally. Do not bury new answers in plan `reason`, frontend literals or a second generated dictionary. `reason` explains today's selection, not the learning target.

Implemented field mapping for the bounded Memory consumer: existing groups keep `name`/NU/`source_refs` as their legacy ID basis; an explicit stable `id` may be retained, and sidecars keep their existing `id`. `prompt`, `checking_criteria[]`, optional `memory_cue`, and optional `inspected_refs[]` augment existing group `items` / sidecar `statement`. Cue and checking content are revealed only after retrieval. `admission: CANDIDATE_ONLY` remains candidate Content, not learner debt.

Selection requires `admission_basis` with `route`, `review_status: REVIEWED`, `source_edition`, `source_locator`, `review_ref`, `prerequisite`, and `reviewed_target_revision`. The loader checks an existing repo-relative Politics learning review path and unique explicit `<a id="anchor"></a>`; its bounded section must pair the exact target ID in the first cell and reviewed revision in the last cell of one unique audit-table row. Incomplete, duplicate or pending target rows fail closed. A current edition uses a `POL27-` Source identifier; historical LEG26 alone cannot authorize current fixed wording. This verifies source binding, not political truth or the Leg-informed recommended baseline. Missing/pending metadata excludes the target from selection without deleting historical events. New `FIRST_ROUND_EXACT` necessity follows Learning §6.1; existing CF-only reviewed cards may remain optional practice without being relabeled must-retain. No new retention judgment is inferred from a matching hash.

`politicsMemoryReviewedTargetRevision(candidate)` computes `sha256:` plus SHA-256 of UTF-8 canonical JSON: recursively sorted object keys, preserved array order, trimmed text; normalized `id`, `subject`, `chapter_id`, `natural_unit_id`, `family`, `prompt`, `answer_items`, `checking_criteria`, `memory_cue`, sorted unique `source_refs`/`inspected_refs`, and admission `route`/edition/locator/prerequisite. Review status/ref/digest are excluded to avoid self-reference. Catalog revision includes the consumed fields; validated plans freeze candidate snapshots. Catalog-bound staged commands remain structurally staged until the actual consumer verifies the current catalog. Recall snapshots/return retain checking and admission provenance. History comparison excludes auxiliary cue and review-location changes, but includes the retrieval prompt, ownership, answer, criteria, Source scope and prerequisite semantics; a changed prompt makes old evidence history-only unless an explicit Content compatibility basis establishes identical retrieval meaning; legacy events remain stored and cannot be relabeled as having tested newly reviewed checking content. Admission-review changes never erase raw evidence or create a schedule.

The chapter C inventory and accepted exact scope must be reconciled with the real catalog before claiming integration. A source-located paragraph that the catalog never consumes is prepared text, not a runnable Memory item. An updated brief does not update old `active_precision` / `active_boundaries` automatically. Source wording conflicts must be resolved before the affected task is presented as exact.

Consumer regression must cover explicit prompt preservation, no ambiguous same-prompt/different-answer collision in a selection, unsupported admission rejection, proactive selection without W/U, old/new wording agreement, no pre-reveal leakage, stale/replay/supersession behavior and revision-aware evidence return. Extend existing validation/test owners; a shape validator cannot certify Source truth, mnemonic quality, or human learning. Do not silently weaken old tests to fit generated content.

---

### 3.2.1 Learner quick-review view is a non-canonical projection

A source-faithful review lives in the existing chapter brief/support owner. Explicitly requested preparation may be a labeled draft without asserting real study, final retention selection or learner acceptance.

Learning §0.7 owns the cognitive division; §6.1 owns necessity for **both** memory destinations:

```text
actual Chengfeng text / necessary tables and images → source-faithful main model
inspected designated Leg support + appropriate exam/learner need → selected retention scope and accuracy
same selected scope → model-bound main prompts + complementary independent fragments
```

Main prompts are compact retrieval handles for selected content remembered through the model. They are not a generic index of everything explained. Necessary conceptual relationships remain prose even without a prompt. An exact fragment may still have a conceptual parent while being cheaper to practice separately.

Reuse the existing chapter/NU/content identities and substantive answers. A working draft may use one small disposition table in this same owner to show source, necessity status, first-answer location, proposed model/fragment destination and existing ID if known; do not create a new schema, registry or second catalog. Unresolved Leg support stays pending, not invented certainty.

Accept only when every main prompt has a source-supported answer explained at first encounter; its count/members and required accuracy are justified. Hide members in the miniature prompt, not in first-reading prose. Check that model memory plus residual Memory covers the justified retention scope without default duplicate practice. Do not infer a memory obligation from a prompt or from an existing card.

Omitted understanding/recognition/reference material stays in source/support; uncertainties stay in Source gaps. Reconcile recommended use in existing owners; preserve optional cards and history, and **claim current-year re-filtering only when the exact owner records that completed review**. No Runtime/Website/plan/schema change is implied merely by the content projection.

Reject a replacement framework, arbitrary enumeration, answerless cue, generic branch index mislabeled as memory, unselected lists smuggled into main prompts, unrequested whole-course generation, and using prepared content as learner or admission evidence.

---

### 3.3 Fixed reconstruction spine realization

Learning Contract §0.5 owns the stable-review rule. Content realizes it with the chapter's existing semantic assets; do **not** create a parallel framework registry merely to mark something “fixed”.

For an admitted chapter, designate one canonical reconstruction scaffold from the existing owner:
- when `chapter_compression.reconstruction_chain` already exists and represents the chapter model, it is the default canonical review spine;
- for a genuinely non-linear subject shape, the owning stable `framework_maps` / hierarchy / timeline plus its declared decisive relations may serve the same job;
- `anchors`, `boundaries`, Precision and Recall prompts attach to that scaffold rather than competing with it.

The accepted spine preserves stable learner-facing labels and meaningful relation/order. Supporting prose may change density, but ordinary content refinement must not silently produce several interchangeable chapter summaries.

A later review may project:
```text
full spine + explanation
→ same spine with shorter node meanings
→ same spine with hidden nodes / retrieval prompts
→ same spine with selected model-bound main prompts, complemented by separately retrievable exact fragments
```

It may not project:
```text
review 1: chain A
→ review 2: equally plausible chain B
→ review 3: new mnemonic hierarchy C
```
when Current chapter semantics have not changed.

If the canonical spine must change, update the original chapter/semantic owner and reconcile dependent review prompts, Memory cues and Projection. Do not preserve both versions as two learner truths.

### 3.3.1 Kian self-use quick-review realization

Use §3.2.1 for the existing chapter view and Learning §0.7 for the model-memory / fragment-memory division. Keep original model identities and valid relationships; grouping is presentation, not a new knowledge map. Update the same accepted view rather than maintain a second prompt specification here.


---

## 4｜Evidence discipline

Content semantics must remain source-grounded.

- Source and teaching roles inherit [Learning Contract §2](LEARNING_CONTRACT.md#2-active-first-round-learning-chain); Chengfeng retains canonical Source/NU authority and detailed-study primacy; Chat provides requested explanation and source-faithful compression.
- Suyi may strengthen structure, relation, boundary, or repair without becoming a second course.
- Suyi richness does not create new first-learning blocks by default.
- OCR fragments must not be silently repaired into new claims when their meaning is uncertain.
- A useful Suyi relation may be absorbed even when its underlying facts are already Chengfeng-owned; this is representation/value delta, not duplicate knowledge ownership.
- Reference/precision detail stays demoted unless the Learning Logic or question evidence makes it first-ready.
- A semantic object being valid does not mean all of its internal detail shares the same learner tier; relation skeleton, explanatory meaning, and provenance may belong to different tiers.

---

## 5｜Content / UI boundary

Forbidden inside `learning_semantics`:

- Astro component names;
- card names chosen only for rendering;
- CSS/class names;
- pixel dimensions;
- column counts/widths;
- colors;
- font sizes;
- screen coordinates;
- decorative layout instructions.

Allowed:

- semantic node/edge relations;
- knowledge hierarchy;
- causal sequence;
- learner distinction;
- source handoff identity;
- precision priority;
- learner attention tier;
- reconstruction target.

Test:

> **If Astro were replaced tomorrow, would this content model still describe the correct learner cognition and attention priority?**

If no, the object probably belongs downstream in Projection/UI.

---

## 6｜Calibration and rollout

Do not mass-convert all Politics chapters from one untested schema draft.

Rollout order:

1. choose one representative Natural Unit;
2. close its Suyi/content delta;
3. encode `learning_semantics` additively without breaking existing runtime fields;
4. run `audit-politics-learning-semantics.mjs` plus the Content Hierarchy audit and existing Politics QA/build;
5. inspect whether the semantic model can support a good Mac-landscape projection without inventing missing knowledge or equalizing all valid detail;
6. test at least one materially different cognitive shape before freezing the schema for wider rollout;
7. only then expand by subject-specific batches.

Calibration owners:

1. `POL27-CF-MARX-C00-S01` — formation / causal / boundary shape;
2. `POL27-CF-MARX-C00-S02` — feature hierarchy / organizing relation / contemporary-value shape.

Suyi audits:

- `content/politics/learning/marxism/ch00.suyi-delta.md`
- `content/politics/learning/marxism/ch00.s02.suyi-delta.md`

---

## 7｜Subject-specific shapes remain valid

The shared schema does not require every subject to become a concept map.

- Marxism may emphasize relation Map / Chain / Boundary.
- History may emphasize stage story / timeline Chain / turning-point Boundary.
- Mao may emphasize historical problem → theory response → theory-sequence position.
- Xi may emphasize hierarchy / role / confusable formulation boundary.
- Ethics/Law may emphasize concept boundary + normative/situational judgment.

The Content contract standardizes provenance, semantic explicitness, and learner priority — not one cognition shape.
