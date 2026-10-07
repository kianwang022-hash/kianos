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

Politics chapter JSON historically contained good teaching prose such as `core_problem`, `teaching_beats`, and `closure_cue`, but those fields alone leave too much interpretation to the UI.

That creates a dangerous shortcut:

```text
teaching prose
→ generic cards / sections
→ page
```

The Content Semantics layer makes important cognitive shape explicit before UI work begins.

The intended chain is:

```text
Learning Logic
→ Current teaching content
→ learning_semantics
→ Content Hierarchy
→ Presentation grammar
→ Astro implementation
```

`learning_semantics` and its learner-attention priority are therefore **Content**, not UI.

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

Under [Learning Contract §2](LEARNING_CONTRACT.md#2-active-first-round-learning-chain), Chat owns continuous teaching and Chengfeng retains Source ownership. This handoff points to original iPad / MarginNote images/text for necessary Source calibration, with:
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

Learning Contract §3.1.1 requires a reusable chapter teaching package before the chapter is called prepared for cross-Chat continuous learning.

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
- the reviewed admission route or exact pending limitation, plus phase/prerequisite boundaries under the Learning Contract;
- its existing candidate ID / consumer path, or a concrete unresolved mapping. Reuse, revise or retire duplicates against their original owner instead of hand-synchronizing parallel answers.

These are semantic requirements, not permission to invent field names that no consumer reads. Reuse `precision_objects`, `content_support` groups, `statement`, `source_refs` and existing sidecar identities where they fit. A bounded additive extension for an explicit prompt/checking content is allowed only through this Content owner plus the resolved Runtime implementation owner, with loader → catalog → plan/evidence snapshot → renderer → return compatibility proved together. A new registry, new command/state family or cross-system architecture change remains OWNER_UNRESOLVED until Engineer resolves it through the existing architecture owners.

The current catalog contract exposes `prompt`, `answer_items`, `source_refs` and stable IDs. An explicit source-owned prompt must not be silently replaced by `unit title | form`; two different answer sets require distinguishable retrieval questions. Task granularity follows cognition: preserve a meaningful comparison/list, then split only when one response cannot identify the failing part. Correcting wording is not by itself a reason to create a duplicate ID; changed meaning reopens dependent snapshots under the existing freshness contract.

Catalog discovery, content admission and learner scheduling are distinct. A metadata flag alone must not claim that Runtime enforces admission. Preserve enough inspectable admission/provenance at the actual selection boundary to prevent a pending or historical-only target being treated as ready; an unsupported target is blocked locally. Do not bury new answers in plan `reason`, frontend literals or a second generated dictionary. `reason` explains today's selection, not the learning target.

Implemented field mapping for the bounded Memory consumer: existing groups keep `name`/NU/`source_refs` as their legacy ID basis; an explicit stable `id` may be retained, and sidecars keep their existing `id`. `prompt`, `checking_criteria[]`, optional `memory_cue`, and optional `inspected_refs[]` augment existing group `items` / sidecar `statement`. Cue and checking content are revealed only after retrieval. `admission: CANDIDATE_ONLY` remains candidate Content, not learner debt.

Selection requires `admission_basis` with `route`, `review_status: REVIEWED`, `source_edition`, `source_locator`, `review_ref`, `prerequisite`, and `reviewed_target_revision`. The loader checks an existing repo-relative Politics learning review path and unique explicit `<a id="anchor"></a>`; its bounded section must pair the exact target ID in the first cell and reviewed revision in the last cell of one unique audit-table row. Incomplete, duplicate or pending target rows fail closed. A current edition uses a `POL27-` Source identifier; historical LEG26 alone cannot authorize current fixed wording. This verifies the binding, not political Source truth. Missing/pending metadata excludes the target from selection without deleting historical events. No W/U is required for reviewed `FIRST_ROUND_EXACT`; individual/output route interpretation stays with the Learning owner.

`politicsMemoryReviewedTargetRevision(candidate)` computes `sha256:` plus SHA-256 of UTF-8 canonical JSON: recursively sorted object keys, preserved array order, trimmed text; normalized `id`, `subject`, `chapter_id`, `natural_unit_id`, `family`, `prompt`, `answer_items`, `checking_criteria`, `memory_cue`, sorted unique `source_refs`/`inspected_refs`, and admission `route`/edition/locator/prerequisite. Review status/ref/digest are excluded to avoid self-reference. Catalog revision includes the consumed fields; validated plans freeze candidate snapshots. Catalog-bound staged commands remain structurally staged until the actual consumer verifies the current catalog. Recall snapshots/return retain checking and admission provenance. History comparison excludes auxiliary cue and review-location changes, but includes the retrieval prompt, ownership, answer, criteria, Source scope and prerequisite semantics; a changed prompt makes old evidence history-only unless an explicit Content compatibility basis establishes identical retrieval meaning; legacy events remain stored and cannot be relabeled as having tested newly reviewed checking content. Admission-review changes never erase raw evidence or create a schedule.

The chapter C inventory and accepted exact scope must be reconciled with the real catalog before claiming integration. A source-located paragraph that the catalog never consumes is prepared text, not a runnable Memory item. An updated brief does not update old `active_precision` / `active_boundaries` automatically. Source wording conflicts must be resolved before the affected task is presented as exact.

Consumer regression must cover explicit prompt preservation, no ambiguous same-prompt/different-answer collision in a selection, unsupported admission rejection, proactive selection without W/U, old/new wording agreement, no pre-reveal leakage, stale/replay/supersession behavior and revision-aware evidence return. Extend existing validation/test owners; a shape validator cannot certify Source truth, mnemonic quality, or human learning. Do not silently weaken old tests to fit generated content.

---

### 3.2.1 Learner quick-review view is a non-canonical projection

A Kian-specific chapter quick-review view may be stored in the existing chapter teaching brief/support owner after real study produces and accepts it.

Its semantics are:

\`\`\`text
canonical chapter spine
+ actually learned problem blocks
→ Kian mainline sentences
→ non-answer-leaking expansion cues
\`\`\`

It is **not** another Content hierarchy, not a substitute for canonical chapter compression, and not a Memory source. A visual 6–10-line mainline may merge adjacent canonical nodes for fast human review when every merged line remains traceable back to the unchanged canonical spine.

Ownership check for anything omitted from that view:
- teaching/support owns explanatory detail;
- reviewed Precision/Memory owns exact long-term retrieval;
- Source owner/gap owns unresolved evidence.

Reject:
- expansion cues that enumerate the answer rather than cue retrieval;
- chapter-end summaries that introduce a new framework not built during learning;
- automatic generation of quick-review views for untouched chapters;
- any Runtime/Website behavior that treats this personal view as learner progress, admission or scheduling truth.

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
→ same spine with exact Memory targets attached
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

A chapter brief may contain one lightweight **Kian self-use quick-review view** produced during real Chat learning.

It is a reference projection over the canonical chapter model, not another semantic owner. It may:
- group adjacent canonical nodes into fewer learner-facing lines;
- use one short expansion cue per line;
- include an even thinner keyword-only view.

It must:
- keep enough mapping to verify against the canonical spine;
- preserve decisive relations and bridges;
- avoid listing answer members inside the expansion cue;
- route omitted content to existing teaching/support, reviewed Precision/Memory or explicit Source gap;
- never imply that every omitted detail deserves Memory;
- never create a separate Runtime/Website/plan/admission object.

Chapter-close editing of this view is assembly/reconciliation of lines already formed during learning. A newly invented alternative summary at chapter close is invalid when it changes the learner's model rather than thinning the learned one.


---

## 4｜Evidence discipline

Content semantics must remain source-grounded.

- Source and teaching roles inherit [Learning Contract §2](LEARNING_CONTRACT.md#2-active-first-round-learning-chain); Chengfeng retains canonical Source/NU authority and Chat owns continuous teaching.
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
