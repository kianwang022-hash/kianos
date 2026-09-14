# Xizong Cognitive Projection Contract

Status: **CALIBRATION ACTIVE — NOT YET RUNTIME AUTHORITY**  
Parent product: `static-web/XIZONG_PRODUCT_BRIEF.md`  
Learning authority: `content/xizong/LEARNING_CONTRACT.md`  
Root evolvability requirement: `PROJECT_DEFINITION.md` R10 + `ARCHITECTURE.md` §7.1  
Shared presentation grammar: `static-web/PRESENTATION_CONTRACT.md`

This contract owns the **derived cognitive Projection layer** between Current Xizong medical/learning assets and learner-facing workspaces.

It does not own medical truth, learning order, question truth, learner evidence, Runtime semantics, or UI styling.

## 1｜Purpose

Projection exists so that normal content evolution is usually absorbed as an asset recompile rather than a page rewrite:

```text
Current medical / learning owners
→ reviewed optional enrichment
→ Xizong Cognitive Projection
→ reusable learner workspace / renderer
→ Runtime / Evidence
```

Hard rule:

> **Projection organizes Current semantics; it does not become a second medical owner.**

A Projection asset may say *what semantic role an existing Current object plays, how it may be spatialized, and in which learner state it is visible*. It may not silently author a new mechanism, comparison, boundary, source locator, Question→Knowledge relation, or treatment rule.

## 2｜Calibration scope

The first calibration batch intentionally spans heterogeneous Current Blocks:

- A1 B1 — mechanism chain + formula language + framework;
- A1 B7 — decision/inference + comparison + boundary + mechanism chains;
- A1 B10 — stability-first decision algorithm + ECG boundary;
- A1 B11 — feedback loop + directional failure model + wet/cold decision coordinate;
- A2 R1 — measurement + mechanics + resistance + Visual/Precision/Connection enrichment;
- A3 B1 — spatial/directional/measurement/control map + source handoff;
- A3 B5 — five-variable coordinate + priority/acid-base algorithms + narrow external-source provenance.

Calibration proves schema expressivity only. These assets are not permission for Runtime/Codex implementation until the schema is separately frozen.

## 3｜Granularity and identity

Initial durable granularity:

```text
SystemProjection
BlockProjection
```

Calibration currently materializes only representative `BlockProjection` assets. KP/LG identities remain canonical owners and are referenced rather than copied into one projection file per KP.

Stable identity rules:

- `system_id`, `block_id`, `logic_group_id`, `kp_id` resolve against Current canonical owners;
- page layout changes do not create new canonical identity;
- if a semantic owner splits/merges/moves, that is an upstream change and Projection must be rebuilt after the responsible owner is reconciled;
- Projection object IDs are stable presentation identities inside one canonical scope, not medical identities.

## 4｜Source registry and freshness

Every Projection asset declares the exact Current source files it depends on with blob SHA.

A source may be:

- `MEDICAL_CORE` — canonical System/Block medical content;
- `LEARNING_SUPPORT` — approved first-pass focus, Logic Groups, closure, recall spine;
- `SELECTIVE_CUES` — reviewed Visual/Precision trigger index;
- `PATHWAYS` — reviewed Connection/Failure projection support;
- `EXTERNAL_SOURCE_CONTRACT` — admitted narrow supplementary authority;
- another explicitly approved Current owner.

Freshness is fail-closed:

```text
referenced source blob changes
→ dependent Projection = STALE
→ targeted recompile / review
→ only then DERIVED_CURRENT again
```

A renderer must never silently keep using stale Projection merely because it can still parse the file.

## 5｜Binding model

Projection should prefer **references over copied learner content**.

Allowed binding kinds:

### `FIELD_REF`
Exact structured field in a Current JSON/frontmatter owner.

Typical selector:

```json
{"source_id":"learning","selector":{"type":"JSON_POINTER","value":"/blocks/circulation-b01/recall_spine"}}
```

For Markdown frontmatter, `FRONTMATTER_FIELD` is allowed.

### `OWNER_REF`
Stable canonical owner identity, e.g. a Block/LG/KP. The consumer resolves content from the canonical owner rather than from Projection.

### `DERIVED_FRAGMENT`
A structurally selected fragment of a Current text owner when the source is not already structured enough for direct field binding.

Allowed calibration selectors include:

- `MARKER_ID` — explicit Current marker such as `kianos:framework id=...`;
- `HEADING_EXACT` — exact heading section;
- `LABELED_BLOCKQUOTE` — exact labelled blockquote such as `中心问题`;
- `STRUCTURE_AFTER_ANCHOR` — exact textual anchor + structure type/occurrence for a table/code block/list inside the same source section.

Derived fragments must retain source path + blob SHA. Selectors fail closed if no exact Current match exists. No fuzzy semantic search is allowed at Runtime.

### `INDEX_REF`
Exact reviewed item ID inside an enrichment index such as Visual, Precision or Pathways.

### `EXTERNAL_CONTRACT_REF`
Reference to an admitted external-source contract. It carries provenance/scope permission only; it must not copy the external source into a second content owner or widen the admitted scope.

## 6｜Semantic role vs geometry

Keep two dimensions separate.

`role` answers **what cognitive job this object performs**. Calibration uses shared Presentation roles where applicable:

```text
PROBLEM
MAP
CHAIN
COMPARE
BOUNDARY
EXACT
HANDOFF
RECALL
CLOSURE
REFERENCE
```

Xizong may add a domain role only when cognition genuinely requires it.

`geometry` answers **how that owned semantic object can be spatialized on Mac**. Calibration geometry vocabulary:

```text
SEQUENCE
LOOP
MATRIX
AXES
TREE
NETWORK
TABLE
FORMULA_STRIP
SPATIAL_MAP
TEXT_STRUCTURE
```

Geometry is presentation metadata, not medical truth. A future geometry change must normally be possible without changing the medical owner.

## 7｜Multi-object Block rule

A Block is a scope containing cognitive objects, **not one projection shape**.

```text
BlockProjection
├─ objects[]
├─ Logic Group binding
├─ KP-set binding
├─ optional enrichment bindings
└─ views
```

One Block may legitimately contain Chain + Compare + Boundary + Decision/Map + Formula objects when Current supports them. Do not force one `projection_shape` per Block merely to simplify rendering.

## 8｜Views and multi-pass compatibility

Projection should reuse the same canonical cognition across learner states.

Calibration view vocabulary:

```text
BLOCK_ORIENT
LOGIC_GROUP_ORIENT
EXTERNAL_HANDOFF
KP_RECALL_FRONT
KP_RECALL_REVEAL
GROUP_CLOSURE
BLOCK_RECALL_FRONT
BLOCK_RECALL_REVEAL
```

A `view` selects already-bound objects / support fields and their learner-facing role. It does not duplicate medical text.

Future passes may add views such as:

```text
SECOND_PASS_REVIEW
LATE_REVIEW
```

but **calibration must not pre-author second-pass content**. Later discrimination, distractor, condition-mutation, case or cross-System assets require their own accepted authority before they can project.

## 9｜Neutral-front safety

Protected recall states are workspace-wide.

`KP_RECALL_FRONT`, `BLOCK_RECALL_FRONT`, and future System Recall Front must not expose answer-bearing title/Core/Precision/Visual/inspector content through any Projection object, route label, tooltip or side region.

A view may explicitly declare `protection: NEUTRAL_FRONT`; consumers must fail closed if an object not admitted to that front is requested.

## 10｜Optional enrichment is first-class

Current Systems need not own symmetrical sidecars.

Rules:

```text
reviewed enrichment exists → Projection may bind it
reviewed enrichment absent → field/object stays absent
```

Do not manufacture placeholder Precision, Visual, Connection, source-local or pathway files just so A1/A2/A3 look structurally identical.

A2 Visual/Precision/Pathway support and A3 B5 external-source support are calibration tests for this rule.

## 11｜Mac layout boundary

Projection may preserve **semantic layout intent** needed by the accepted Mac-wide product, e.g.:

```text
PRIMARY_STAGE
SECONDARY_STAGE
CONTEXT
REFERENCE
SIDE_BY_SIDE
FULL_WIDTH
```

Projection must not encode CSS pixels, colors, font sizes, rounded-card decisions, or theme styling. Those remain Product/UI implementation responsibilities governed by Kian's Mac/Dense Calm preferences.

The schema must retain enough semantic structure for a Mac renderer to avoid giant whitespace/card piles, but content assets do not become CSS.

## 12｜Question boundary

Cognitive Projection is not a second question database.

Official Question Truth, explanations and reviewed Question→Knowledge relations remain in their dedicated owners. Question workbenches may combine those owners with Cognitive Projection at Runtime/Projection composition time, but Block Projection must not copy official questions or answers.

## 13｜Calibration acceptance tests

A schema calibration passes only if all are true:

1. **Identity** — all System/Block/LG/KP references resolve to stable Current identity.
2. **Freshness** — changed source hash makes the dependent derived asset stale.
3. **No invention** — Current-absent relations/cues/locators remain absent.
4. **Optional enrichment** — enriched and non-enriched Systems are both legal without fake symmetry.
5. **Multi-object Block** — one Block can carry multiple cognitive shapes without special-case page code.
6. **State reuse** — Orient/Recall/Closure views reuse the same owned cognition rather than copied summaries.
7. **Neutral-front safety** — protected Recall fronts remain answer-safe across the whole workspace.
8. **R10 Content Change Absorption** — a legitimate content/projection-support change should normally require only the affected asset recompile + targeted validation, not named-topic branching in Astro/Runtime.

## 14｜Runtime blocker outside this lane

Question attempt history is a separate Runtime/Evidence compatibility requirement. The future multi-pass question model must append-preserve attempts/phases rather than overwrite first-pass evidence with a later result.

This calibration lane does not change learner state, question Runtime, evidence semantics, Astro/CSS/JS, or S/K/L/P/R/E/U acceptance.
