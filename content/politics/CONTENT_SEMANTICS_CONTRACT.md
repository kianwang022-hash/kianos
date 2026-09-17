# Politics Content Semantics Contract

Status: CURRENT CANDIDATE — Content Phase

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

#### Relation fidelity / arity

A framework relation must preserve the **semantic arity owned by Source / reviewed Knowledge**.

`edges[]` are **binary relation claims only**. One edge means the accepted Content really owns:

```text
one source node → one relation → one target node
```

Hard rule:

> **Do not atomize one collective / n-ary source relation into several binary edges merely because a graph schema or renderer is easier to implement.**

For a relation such as:

```text
A + B + C collectively → R → X
```

the Current map must use one `collective_relations[]` object:

```json
{
  "id": "stable-relation-id",
  "member_ids": ["A", "B", "C"],
  "relation": "R",
  "target_id": "X",
  "text": "A、B、C … X。",
  "source_evidence": ["..."]
}
```

Semantics:

- `member_ids` are jointly involved in **one** relation claim;
- `target_id` is the shared target of that collective claim;
- `relation` is the relation predicate, not a UI connector;
- `text` is the learner-readable complete claim;
- `source_evidence` grounds the collective relation directly.

A `collective_relations[]` object is not permission for Projection/UI to expand it back into one edge per member. If a future surface needs a diagram, the downstream mapping must preserve the collective object as one semantic relation.

If Current cannot represent a source relation without changing its arity, use one truthful source-grounded `Anchor` / statement temporarily rather than inventing a lossier graph.

This rule does **not** mean that several binary edges sharing one target are invalid. They are valid when Source/Knowledge truly owns them as independent binary relations. The forbidden move is specifically:

```text
collective source claim
→ implementation-convenient atomization
→ several stronger/different binary claims
```

Mechanical validators can prove structural integrity, but semantic equivalence to Source still requires the bounded Content audit.

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

For first-round Politics Chengfeng learning this points to the original iPad / MarginNote surface, with:
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

## 4｜Evidence discipline

Content semantics must remain source-grounded.

- Chengfeng remains the continuous first-learning mainline and primary first-learning semantic owner.
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
