# Politics Explicit Surface Mapping Contract

Status: **CURRENT CANDIDATE — Projection / learner-surface ownership**

Role: own the explicit mapping from accepted Politics Content + Content Hierarchy into learner-facing semantic slots before Astro rendering.

Upstream:
- `LEARNING_CONTRACT.md`
- `INTERACTION_CONTRACT.md`
- `CONTENT_SEMANTICS_CONTRACT.md`
- `CONTENT_HIERARCHY_CONTRACT.md`

Downstream:
- `content/politics/projection/**`
- `static-web` Politics renderers

---

## 1 | Core invariant

> **Astro must never infer where Politics content belongs or what relation a layout implies.**

The accepted chain is:

```text
Current knowledge / absorbed Suyi
→ learning_semantics: what the learner must understand
→ H1–H5: when it deserves attention
→ explicit surface mapping: where it appears and what relation type it carries
→ Astro: faithful renderer only
```

A renderer may choose responsive pixels for an already-owned semantic slot. It may not:
- turn a generic `Map`, `Chain`, `edges`, `topology` or field name into learner-facing arrows;
- decide that several values are peers, causes, prerequisites, children, stages or inputs;
- merge distinct relations into one visual chain;
- split one semantic object into multiple learner claims without an explicit mapping;
- promote explanatory detail because it is easy to render;
- parse the rendered DOM to reconstruct a new semantic composition.

If the mapping is absent, the learner surface fails closed to a plain truthful statement/list. Missing mapping is a Projection defect, not permission for UI inference.

---

## 2 | Mapping owns semantic display, not CSS

`surface_mapping` belongs to each accepted PASS Natural Unit inside its Projection owner.

It may own:
- learner state: `ORIENT`, `EXTERNAL_LEARN`, `CLOSE`, `VERIFY_POST`, `REPAIR`, `CONTINUE`;
- semantic zone: `PRIMARY`, `COMPANION`, `SUPPORT`, `HANDOFF`, `CLOSURE`, `REPAIR_ONLY`;
- representation primitive: `STATEMENT`, `PARALLEL_SET`, `RELATION_SET`, `DIRECTED_SEQUENCE`, `COMPARE`, `HIERARCHY`, `TIMELINE`;
- exact selected refs/items;
- explicit relation labels / direction when the knowledge owns them;
- grouping boundaries and learner-facing group title;
- semantic visibility: which owned labels / relations must remain learner-visible together in the same surface group.

Owned relation text is **content, not connector chrome**. If a relation label explains why or how one learner object relates to another, that label is a first-class learner claim. The renderer may reflow or stack it responsively, but it may not hide it behind hover, replace it with an unlabeled arrow, collapse it into incidental annotation, or omit it.

It must not own:
- pixel dimensions;
- columns or CSS grid definitions;
- font sizes/colors;
- component names;
- coordinates;
- decorative arrows.

Test:

> If Astro were replaced tomorrow, would this mapping still say exactly what belongs together, what relation the learner should see, which relation text must remain visible, and when it should appear?

If yes, it belongs here.

---

## 3 | Allowed primitives

### `STATEMENT`
One explicit learner claim. No spatial relation is implied.

### `PARALLEL_SET`
Items are peers under one question/category. Order may be convenient but does not imply causality, chronology, hierarchy or prerequisite.

### `RELATION_SET`
Two or more explicitly owned relation claims belong together, but **the relations are not a sequence with one another**.

Each relation owns its own `from → relation → to` direction. The set itself does not imply:
- that the first relation causes the second;
- that targets/sources form levels;
- that the list order is chronological;
- that several relations should be collapsed into one chain.

Use this for patterns such as several properties independently contributing to another concept, or several explicit relations jointly explaining one model.

### `DIRECTED_SEQUENCE`
A direction/order is part of the intended cognition. Each transition must be explicitly owned. Use for causal/process/reasoning sequences only when direction is educationally material.

When a transition owns a `relation` label, that label is part of the learner claim itself. `A → B` and `A → relation → B` are not interchangeable representations unless Current explicitly says the relation label is unnecessary.

### `TIMELINE`
Chronological order is the intended cognition. Dates/stages must be Current-owned.

### `COMPARE`
Two or more items are compared on explicit axes or a decisive distinction.

### `HIERARCHY`
Parent/child or level membership is explicitly Current-owned.

Hard rule:

> **No generic `MAP`, `NETWORK`, `TOPOLOGY` or `CHAIN` primitive exists in learner-facing mapping.**

Those backend shapes are too ambiguous. They must be resolved upstream into one of the explicit primitives above or plain `STATEMENT` / `PARALLEL_SET`.

---

## 4 | Semantic zones

### `PRIMARY`
The main cognitive stage for the current learner state. Usually H1 during ORIENT.

### `COMPANION`
Small high-value material that should be simultaneously available but not compete with PRIMARY. Usually decisive H2 boundary/first-round carry.

### `SUPPORT`
Readable H3 supporting explanation, normally collapsed or secondary.

### `HANDOFF`
Original Chengfeng iPad/MarginNote locator + look-for only. Never a duplicated lecture reader.

### `CLOSURE`
H2 carry + timely H4 reconstruction/next bridge after source learning.

### `REPAIR_ONLY`
Smallest relevant H2–H5 object promoted by an actual failure/uncertainty shape.

A semantic zone is a learner-attention role, not a screen coordinate. Responsive UI may stack zones without changing their ownership.

---

## 5 | Required shape

Each PASS Projection unit must resolve an explicit `surface_mapping`.

Example:

```json
{
  "surface_mapping": {
    "ORIENT": [
      {
        "zone": "PRIMARY",
        "primitive": "PARALLEL_SET",
        "title": "为什么会产生",
        "items": [
          {"scope":"unit","field":"learning_semantics.framework_maps","match":{"id":"..."},"select_node_ids":["social_root","class_basis","thought_source"]}
        ]
      },
      {
        "zone": "PRIMARY",
        "primitive": "DIRECTED_SEQUENCE",
        "title": "产生以后怎样发展",
        "items": ["creation","theory_system","development"],
        "transitions": [
          {"from":"creation","to":"theory_system","relation":"形成相互联系的理论体系"},
          {"from":"theory_system","to":"development","relation":"理论体系不是封闭终点"}
        ]
      }
    ]
  }
}
```

The exact wire schema may evolve during the bounded migration, but the ownership rule may not weaken: **grouping, relation type, selected members, learner-visible relation text and direction are explicit before Astro.**

---

## 6 | Relation fidelity

The mapper must distinguish at least these cases:

```text
A / B / C are three sources                         → PARALLEL_SET
A → X, B → X, C → X are separate owned relations   → RELATION_SET
A leads to B leads to C                             → DIRECTED_SEQUENCE
A happened before B                                 → TIMELINE
A differs from B on X                               → COMPARE
A contains B / B belongs to level A                 → HIERARCHY
A is simply important                                → STATEMENT
```

Never compress two relation types into one chain merely to make a neat graphic.

If one Unit contains both peer conditions and a later development sequence, map them as two semantic groups even when they came from one backend `framework_map`.

---

## 7 | H1–H5 integration

H1–H5 owns **attention priority**. `surface_mapping` owns **semantic placement and relation fidelity**.

They must agree:
- ORIENT PRIMARY normally selects H1 only;
- ORIENT COMPANION may use only the smallest justified H2;
- H3 belongs to SUPPORT by default;
- H4 appears only when its state becomes timely;
- H5 cannot enter default learner surfaces;
- `REFERENCE_ONLY` never receives teaching mapping.

A rich semantic object may be split explicitly:

```text
framework map labels / decisive relation  → H1 + ORIENT PRIMARY
node explanatory meanings                 → H3 + SUPPORT
provenance / source ids                    → H5 + REPAIR_ONLY/reference
```

The old behavior `whole primary object → H1 → renderer decides` is not sufficient.

---

## 8 | Migration / acceptance

This is a system-wide repair, not a C00 patch.

Acceptance requires:
1. all 53 Politics chapters / 160 Natural Unit owners are accounted;
2. all 151 PASS units have explicit mapping for every learner state they expose;
3. 9 REFERENCE_ONLY owners remain non-teaching;
4. zero default learner relation is inferred from field names / Projection shape names / DOM structure;
5. no renderer reconstructs semantics by reading rendered node/edge DOM;
6. all explicit `RELATION_SET` / `DIRECTED_SEQUENCE` / `TIMELINE` / `HIERARCHY` relations trace to Current semantic relations;
7. parallel conditions/features remain parallel unless Current owns a stronger relation;
8. representative browser acceptance covers all five subjects and heterogeneous primitives;
9. Xiao1000 Question Truth / Evidence / exact Return / first attempt remain unchanged;
10. Chengfeng remains the original continuous learning mainline;
11. every owned learner-facing relation label remains explicitly visible with its related objects and is not reduced to decorative connector metadata.

Until this acceptance closes, broad Politics learner-surface productization must not claim semantic mapping closure.

---

## 9 | Stop rule for UI

UI implementation may:
- render the declared primitive;
- choose responsive stacking;
- apply typography/spacing without changing semantic prominence;
- preserve interaction state.

UI implementation may not:
- decide content meaning;
- hide or omit an owned learner-facing relation label;
- replace an owned relation with an unlabeled decorative arrow;
- demote a first-class learner relation into incidental annotation.

> **The renderer receives a learner surface plan. It does not author one.**
