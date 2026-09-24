# Xizong Representation Gate

Status: **CURRENT — learner-facing representation policy**  
Scope: Xizong System / Block / Logic Group / KP learner surfaces  
Parent presentation authority: `static-web/PRESENTATION_CONTRACT.md`  
Product owner: `static-web/XIZONG_PRODUCT_BRIEF.md`  
Projection owner: `content/xizong/projection/PROJECTION_CONTRACT.md`  
Learner aggregation owner: `content/xizong/LEARNER_OBJECT_CONTRACT.md`

This contract owns one narrow decision:

> **Given already-accepted Xizong semantics, what is the safest and lowest-cost learner-facing representation right now?**

It does not own medical truth, Learning Logic, Source-contact granularity, Projection role/geometry, learner evidence, or asset creation.

---

## 1｜Why this gate exists

Projection can legitimately say that a Current object is a `MAP`, `CHAIN`, `COMPARE`, `BOUNDARY`, `EXACT`, or has geometry such as `SEQUENCE`, `NETWORK`, `TREE`, `MATRIX`, `SPATIAL_MAP`, or `FORMULA_STRIP`.

That does **not** mean Astro must draw a graphic with the same name.

Hard rule:

```text
Projection role / geometry / asset existence
≠ mandatory UI component
≠ mandatory diagram
≠ entitlement to learner-visible area
```

Projection answers:

> What cognitive relation exists?

Representation Gate answers:

> How should that accepted relation be shown now so Kian can understand or retrieve it fastest without accidental semantic invention?

The renderer must never infer new medical hierarchy, causality, centrality, grouping, direction, or importance merely to make an attractive diagram.

---

## 2｜Decision chain

Normal Xizong learner presentation is:

```text
Current medical / learning owner
→ Projection / learner object resolves accepted semantics
→ Representation Gate chooses the safest primitive
→ stage-safe renderer
→ learner UI
```

Never:

```text
geometry = NETWORK
→ run generic graph layout
→ let node position create learner meaning
```

If a representation requires the renderer to guess semantic structure that Current has not explicitly owned, the gate falls back to structured text.

---

## 3｜V1 representation primitives

V1 intentionally keeps the vocabulary small.

### `STRUCTURED_TEXT`

Default safe representation.

Use for:

- parallel concepts;
- concise mechanism statements;
- boundaries;
- anchors;
- framework relations that are understandable without spatial reconstruction;
- `MAP / TREE / NETWORK / AXES / LOOP / SPATIAL_MAP` projection geometry when no explicit visual-fidelity owner exists;
- any ambiguous structure where layout would otherwise invent semantics.

Structured text may use headings, indentation, short rows, labels, emphasis and restrained columns. It is not a plain long article.

### `SIMPLE_CHAIN`

Use only when Current explicitly owns an ordered relation and order itself materially reduces reconstruction cost.

Typical examples:

- causal mechanism;
- physiologic sequence;
- a true temporal/procedural chain.

Do not topologically sort a relation graph and call the result a chain.

### `STRUCTURED_TABLE`

Use for explicit comparisons / matrices / multi-axis discrimination when rows and columns reduce lookup cost.

A table is preferable to a screenshot when the learning value is textual comparison rather than source-specific spatial appearance.

### `FORMULA_STRIP`

Use for an explicit formula or compact quantitative relation together with bounded variable meaning.

Do not convert every variable relation into a network diagram.

### `SOURCE_VISUAL`

Use reviewed original-source visual assets when the source image itself carries irreducible spatial / morphologic / waveform / imaging information.

Examples include:

- pathology / histology;
- CT / MRI / X-ray;
- ECG / action-potential / pressure-volume / pulmonary-function curves;
- anatomy / tract / root / nerve localization;
- fracture force / displacement;
- membrane-side transporter localization;
- cochlear / vestibular spatial relations.

`SOURCE_VISUAL` must come from an accepted visual owner / reviewed source binding. The Representation Gate may choose whether it is useful *now*; it may not manufacture the image.

### `REVIEWED_VISUAL`

Use only for an already-reviewed Current visual/summary asset whose visual composition itself is accepted.

This is not permission for the renderer to generate a graph from raw nodes/edges.

### `DECISION_PATH`

Optional and rare. Use only when Current explicitly owns conditional branching that materially helps a clinical discrimination/action decision.

A list of related facts is not a decision tree.

---

## 4｜Safe defaults for Projection geometry

Geometry is a hint about semantic shape, not a render command.

V1 defaults:

| Projection semantics | Default representation |
| --- | --- |
| `TEXT_STRUCTURE` | `STRUCTURED_TEXT` |
| `CHAIN + SEQUENCE` | `SIMPLE_CHAIN` |
| `FORMULA_STRIP` | `FORMULA_STRIP` |
| `COMPARE + MATRIX/TABLE` | `STRUCTURED_TABLE` |
| `MAP + SEQUENCE` | `STRUCTURED_TEXT` unless an explicit representation owner says otherwise |
| `NETWORK` | `STRUCTURED_TEXT` |
| `TREE` | `STRUCTURED_TEXT` |
| `LOOP` | `STRUCTURED_TEXT` |
| `AXES` | `STRUCTURED_TEXT` by default; use table/labels when explicit axes are the useful cognition |
| `SPATIAL_MAP` | `STRUCTURED_TEXT` unless a reviewed Source/Visual asset or explicit Current spatial representation exists |
| unknown geometry | `STRUCTURED_TEXT` |

The asymmetry is intentional: **falling back to readable text loses decoration; guessing a diagram can create false medical semantics.**

---

## 5｜Hard anti-inference rules

The generic renderer must not:

1. infer a hub / center from in-degree, out-degree, node count, frequency, or visual convenience;
2. infer parent/child hierarchy from a generic relation edge;
3. infer cause/effect from left/right or top/bottom placement;
4. infer convergence merely because several edges share a target;
5. infer prerequisite order from source order or graph traversal;
6. topologically sort a graph and expose that order as learner truth;
7. use force/radial/tree layout as a semantic decision procedure;
8. reduce font size to preserve an unnecessary diagram;
9. show every Projection object merely because it exists;
10. show every Visual / Precision / Extension / Connection merely because the learner object contains it.

When any of these would be required, use `STRUCTURED_TEXT` or another explicit low-risk primitive instead.

---

## 6｜Framework composition rule

System Framework and Block Framework are especially vulnerable to object-pile drift.

A Framework may have multiple Projection objects, for example:

```text
Problem
+ Map
+ Chain
+ Compare
+ Formula
+ Boundary
```

This does **not** mean six learner-visible cards.

The Framework presenter should compose them into one coherent orientation surface with a small information budget:

```text
current problem
→ main spine / dominant relation
→ 2–4 decisive axes / comparisons / boundaries
→ formula or exact item only when it belongs in first-pass orientation
→ deeper/reference material on demand
```

Objects preserve provenance and answer-bearing identity internally. The learner sees one Framework, not the backend object inventory.

For a normal first-pass Framework, representation priority is:

```text
Problem
→ one dominant structure
→ decisive compare/boundary/formula
→ reference/deferred support
```

If several objects compete for equal visual weight, composition has failed.

---

## 7｜KP Learn / auxiliary rule

KP Learn remains:

```text
Prompt
+ full canonical Core
+ Source / Outline locators
+ conditional support
```

The dynamic auxiliary region consumes learner-object assets, but asset existence does not guarantee display.

At the current learning moment the gate may select, for example:

```text
one high-value Source Visual
+ one Precision item
```

while keeping a low-value Connection or Reference quiet.

A sparse KP is allowed to have no auxiliary region at all; the center Core should regain that space.

Precision is not automatically a card family. A current exact item may be rendered as a compact `第一轮记准` / exact row when that is clearer than a separate panel.

Connections / Reserve normally appear as lightweight contextual text unless a stronger representation is explicitly useful.

---

## 8｜Recall safety outranks representation

Representation is stage-dependent.

```text
KP Learn
→ answer-bearing Visual / Precision may be visible

KP Recall Front
→ Prompt / neutral identity only
→ all answer-bearing Core / Visual / Precision / Extension / Connection protected

Reveal
→ the same accepted semantics may return through the Representation Gate
```

No representation choice may weaken the workspace-wide neutral-front rule.

---

## 9｜Visual priority in medicine

Xizong is **not** globally text-first.

Medicine contains cognition where spatial / morphologic / waveform fidelity is the knowledge itself. In those cases an accepted Visual should outrank prose because text forces unnecessary mental reconstruction.

High-priority visual classes include:

- anatomy and spatial localization;
- tract / root / named-nerve distribution;
- pathology morphology;
- radiology / imaging recognition;
- waveform / loop / physiologic curve;
- force-displacement geometry;
- membrane-side localization;
- other Source visuals explicitly marked as materially visual by Current owners.

Conversely, parallel lists, simple causes, ordinary mechanism factors, compact boundaries and many precision facts usually remain safer as text/table/formula.

The product goal is not fewer visuals. It is **fewer unjustified visuals and larger, more useful justified visuals**.

---

## 10｜V1 resolver boundary

The first implementation resolver is deliberately conservative.

It may:

- map explicit safe role/geometry combinations to the primitives above;
- preserve the original object and provenance references;
- produce a Framework presentation plan grouped by learner responsibility;
- fail safe to `STRUCTURED_TEXT`;
- admit an explicit reviewed representation override only when the object carries a Current-owned fidelity declaration.

It may not:

- inspect graph topology to choose a layout;
- infer medical meaning from labels;
- rewrite object content;
- create new edges/nodes;
- choose a Source Visual by fuzzy matching;
- decide learner mastery, priority, due state, or completion.

---

## 11｜Acceptance examples

Representative safety checks must include:

### A1 B1

Current Projection contains:

- `PROBLEM + TEXT_STRUCTURE` → `STRUCTURED_TEXT`;
- `CHAIN + SEQUENCE` → `SIMPLE_CHAIN`;
- `MAP + FORMULA_STRIP` → `FORMULA_STRIP`;
- `MAP + SEQUENCE` Framework → **`STRUCTURED_TEXT` by default**, not an auto-generated graph.

### Visual-heavy medical case

A reviewed pathology / imaging / waveform / anatomy source asset may project to `SOURCE_VISUAL` and receive real area in the auxiliary region.

### Unsafe generic graph

```text
role = MAP
geometry = NETWORK
nodes/edges exist
```

without an explicit reviewed visual representation must resolve to:

```text
STRUCTURED_TEXT
```

not a force graph / radial graph / inferred hierarchy.

---

## 12｜Integration order

Use this order for the final Xizong UI convergence:

```text
1. freeze this gate
2. add pure resolver + validation
3. make System / Block Framework consume the gate
4. make KP auxiliary presentation consume the gate
5. keep learner-object semantic ownership unchanged
6. run representative browser acceptance across mechanism / formula / comparison / spatial / visual-heavy Blocks
```

Do not rewrite Projection assets merely to make the first renderer convenient. If Current semantics are already sufficient, fix the representation layer.