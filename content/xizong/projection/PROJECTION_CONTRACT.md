# Xizong Cognitive Projection Contract

Status: **FULL A1/A2/A3 COMPILATION — VALIDATION / FREEZE CANDIDATE**  
Parent product: `static-web/XIZONG_PRODUCT_BRIEF.md`  
Learning authority: `content/xizong/LEARNING_CONTRACT.md`  
Root evolvability requirement: `PROJECT_DEFINITION.md` R10 + `ARCHITECTURE.md` §7.1  
Shared presentation grammar: `static-web/PRESENTATION_CONTRACT.md`

This contract owns the derived cognitive Projection layer between Current Xizong medical/learning assets and learner-facing workspaces. It does not own medical truth, learning order, question truth, learner evidence, Runtime semantics, or UI styling.

## 1｜Purpose

Projection exists so normal content evolution is usually absorbed as asset revalidation/recompile rather than a page rewrite:

```text
Current medical / learning owners
→ reviewed optional enrichment
→ Xizong Cognitive Projection
→ reusable learner workspace / renderer
→ Runtime / Evidence
```

Hard rule:

> **Projection organizes Current semantics; it does not become a second medical owner.**

It may describe semantic role, useful cognitive geometry and state visibility. It may not author a new mechanism, comparison, boundary, source locator, Question→Knowledge relation, treatment rule or learner evidence.

## 2｜Compiled scope

Current compilation covers the full currently productized A Systems:

```text
A1 Circulation   1 SystemProjection + 12 BlockProjection
A2 Respiratory   1 SystemProjection + 12 BlockProjection
A3 Urinary       1 SystemProjection + 14 BlockProjection

Total            3 SystemProjection + 38 BlockProjection = 41 assets
```

Seven heterogeneous calibration Blocks retain richer explicitly compiled geometry:

- A1 B1 — mechanism chain + formula language + framework;
- A1 B7 — inference + four-valve comparison + boundary;
- A1 B10 — stability-first decision algorithm + ECG boundary;
- A1 B11 — feedback loop + wet/cold decision coordinate;
- A2 R1 — measurement/mechanics + Visual/Precision/Connection enrichment;
- A3 B1 — spatial/directional/measurement/control map + source handoff;
- A3 B5 — five-variable coordinate + priority/acid-base algorithm + narrow external-source provenance.

The remaining 31 Blocks are legal baseline projections over the same schema:

```text
canonical Current Block Guide owner
+ first-pass focus / stop line
+ recall spine
+ Logic Group map
+ external handoff policy
+ protected KP / Block Recall views
+ optional Current enrichment where the System owns it
```

Baseline does **not** mean semantically thin or incomplete: the full canonical Guide/Core remains the medical owner and is projected intact. It means no extra specialized geometry is invented until Current-supported benefit justifies a local richer Projection upgrade.

## 3｜Granularity and identity

Durable granularity:

```text
SystemProjection
BlockProjection
```

KP/LG identities remain canonical owners and are referenced rather than copied into one projection file per KP.

Rules:

- `system_id`, `block_id`, `logic_group_id`, `kp_id` resolve against Current canonical owners;
- page layout changes do not create new canonical identity;
- semantic split/merge/move is an upstream owner change and must be reconciled there first;
- Projection object IDs are presentation identities inside one canonical scope, not new medical identities.

## 4｜Source registry and binding-aware freshness

Every Projection source declares path + baseline blob SHA for provenance. Whether a source blob change invalidates the asset depends on semantic dependency, not file packaging.

Source kinds include:

- `SYSTEM_CORE` — Current `system.json`;
- `MEDICAL_CORE` — canonical Block medical content used for explicit derived fragments;
- `LEARNING_SUPPORT` — focus/LG/closure/recall support;
- `SELECTIVE_CUES` — reviewed Visual/Precision index;
- `PATHWAYS` — reviewed Connection/Failure support;
- `EXTERNAL_SOURCE_CONTRACT` — admitted narrow supplementary authority.

### `STRICT_BLOB`

Use when Projection contains explicit derived fragments from a scope-local text owner, or when a narrow external-source contract change itself requires re-audit.

Default:

```text
MEDICAL_CORE used by DERIVED_FRAGMENT → STRICT_BLOB
EXTERNAL_SOURCE_CONTRACT             → STRICT_BLOB
```

A mismatch makes that dependent asset `STALE` until targeted review/recompile.

### `RESOLVE_BINDING`

Use for structured Current owners where Projection stores exact pointers/item selectors rather than copying the whole source.

Default:

```text
SYSTEM_CORE
LEARNING_SUPPORT
SELECTIVE_CUES
PATHWAYS
→ RESOLVE_BINDING
```

A shared file may change because a sibling Block changed. That must not falsely stale every dependent asset.

```text
blob changed
→ re-resolve this asset's exact binding(s)
→ exact pointer/item/filter remains valid → PASS / REVALIDATED
→ binding removed/renamed/type-invalid → STALE / FAIL
```

This rule is required by R10 Content Evolvability: **file packaging ≠ semantic dependency**.

## 5｜Binding model

Prefer references over copied learner content.

### `FIELD_REF`
Exact structured field in Current JSON/frontmatter.

Supported selectors include:

- `JSON_POINTER`;
- `FRONTMATTER_FIELD`.

### `OWNER_REF`
Stable canonical owner identity. Current roles used by baseline BlockProjection include:

- `CENTER_QUESTION`;
- `CANONICAL_GUIDE`;
- canonical Block/LG/KP/KP-set identity.

`OWNER_REF` means the consumer resolves the Current owner; Projection does not copy its medical body.

### `DERIVED_FRAGMENT`
Structurally selected fragment from a Current text owner when Current is not already structured enough.

Supported selectors:

- `MARKER_ID`;
- `HEADING_EXACT`;
- `LABELED_BLOCKQUOTE`;
- `STRUCTURE_AFTER_ANCHOR`.

Selectors fail closed. Runtime must never perform fuzzy semantic search to rescue a broken selector.

### `INDEX_REF`
Exact reviewed item ID inside an enrichment index.

### `INDEX_MATCH`
Deterministic filtering over a reviewed Current index. It is allowed only over explicit Current-owned fields and exact equality predicates, e.g.:

```json
{"kind":"INDEX_MATCH","index":"precision_index","where":{"anchor.block_id":"respiratory-r05"}}
```

or Connection direction:

```json
{"index":"connections","where":{"source.block_id":"respiratory-r05"}}
{"index":"connections","where":{"target.block_id":"respiratory-r05"}}
```

Rules:

- no fuzzy matching;
- no semantic widening;
- zero matches is legal for optional enrichment;
- the renderer may expose only the matched Current objects and must preserve their timing semantics.

### `EXTERNAL_CONTRACT_REF`
Reference to an admitted external-source contract. It carries provenance/scope permission only; it may not copy/widen the external source into a second learner owner.

## 6｜Role vs geometry

Keep two dimensions separate.

`role` answers what cognitive job an object performs:

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

`geometry` answers how Current semantics may be spatialized on Mac:

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

Geometry is presentation metadata, not medical truth. A geometry upgrade should normally not require changing the canonical medical owner.

## 7｜Multi-object Block rule

A Block is a scope containing cognitive objects, **not one projection shape**.

```text
BlockProjection
├─ objects[]
├─ learning-support bindings
├─ Logic Group / KP identity bindings
├─ optional enrichment bindings
└─ views
```

One Block may carry Chain + Compare + Boundary + Map + Formula objects when Current supports them. Never force one `projection_shape` per Block merely to simplify rendering.

## 8｜Views and multi-pass compatibility

The same canonical cognition is reused across learner states.

Current Block views:

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

Current System views:

```text
SYSTEM_GUIDE
SYSTEM_RECALL_FRONT
SYSTEM_RECALL_REVEAL
```

A view selects bound Current objects/support; it does not duplicate medical text.

Future passes may add `SECOND_PASS_REVIEW` / `LATE_REVIEW`, but this compilation does not pre-author second-pass discrimination, distractor, condition-mutation, case or cross-System content. Those require accepted Current authority first.

## 9｜Neutral-front safety

Protected Recall is workspace-wide.

Any view with `protection: NEUTRAL_FRONT` may expose only explicitly non-answer-bearing objects. It must not leak canonical Guide/Core, recall spine, Precision, answer-bearing Visual, Failure answer or hidden title through sidebars, route labels, inspectors, tooltips or shortcuts.

A2 optional enrichment therefore uses `NO_ANSWER_LEAK` on protected views.

## 10｜Optional enrichment is first-class

Systems do not need symmetrical sidecars.

```text
reviewed enrichment exists → Projection may bind it
reviewed enrichment absent → stays absent
```

A2 may bind Visual/Precision/Connection; A1/A3 do not manufacture placeholders. A3 B5 may bind a narrow external-source contract without turning every Block into a multi-source object.

## 11｜Mac / Dense Calm boundary

Projection preserves semantic structure needed by the accepted Mac-wide product but does not become CSS.

Allowed semantic intent includes cognitive role/geometry and primary/context relationship. Projection must not own pixels, colors, font sizes, shadows, card radii or theme styling.

Mac acceptance remains downstream and must follow Kian's preferences:

- wide-landscape design origin;
- larger comfortable text and strong contrast;
- medium/high useful density with low disorder;
- no giant-whitespace minimalism;
- no default card/panel pile;
- stable/correct path extremely fast;
- important first-round structure visible without unnecessary clicks;
- real screenshots required for aesthetic acceptance.

## 12｜Question boundary

Cognitive Projection is not a second question database. Official Question Truth, explanations and reviewed Question→Knowledge relations remain in dedicated owners. Question workbenches may compose those owners with Cognitive Projection; Block/System Projection may not copy official questions or answers.

## 13｜Validation / freeze tests

Production freeze requires validator evidence for:

1. identity resolution;
2. binding-aware freshness;
3. no invention / exact selectors;
4. optional enrichment without fake symmetry;
5. multi-object Block support;
6. state reuse without copied medical summaries;
7. workspace-wide neutral-front safety;
8. R10 local-change absorption / no false sibling stale fan-out;
9. full manifest coverage: A1 12 + A2 12 + A3 14 Blocks and 3 System projections.

## 14｜Separate Runtime blocker

Question attempt history is not solved by this layer. Before multi-pass question Runtime productization, attempts must become append-preserved and phase-aware rather than overwriting first-pass evidence with a later result.

This Projection compilation changes no learner state, question Runtime, Evidence semantics, Astro/CSS/JS, or S/K/L/P/R/E/U acceptance.
