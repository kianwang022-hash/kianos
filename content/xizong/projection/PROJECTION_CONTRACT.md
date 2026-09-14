# Xizong Cognitive Projection Contract

Status: **V1 FROZEN — A1/A2/A3 CURRENT COMPILATION VALIDATED**  
Schema family: `kianos.xizong.cognitive_projection.*.v1`  
Parent product: `static-web/XIZONG_PRODUCT_BRIEF.md`  
Learning authority: `content/xizong/LEARNING_CONTRACT.md`  
Root evolvability requirement: `PROJECT_DEFINITION.md` R10 + `ARCHITECTURE.md` §7.1  
Shared presentation grammar: `static-web/PRESENTATION_CONTRACT.md`

This contract owns the derived cognitive Projection layer between Current Xizong medical/learning assets and learner-facing workspaces. It does not own medical truth, learning order, Question Truth, learner evidence, Runtime semantics, or UI styling.

## 1｜Purpose and semantic boundary

```text
Current medical / learning owners
→ reviewed optional enrichment
→ Xizong Cognitive Projection
→ reusable learner workspace / renderer
→ Runtime / Evidence
```

Hard rule:

> **Projection organizes Current semantics; it never becomes a second medical or learning owner.**

Projection may store stable identity, exact Current bindings, semantic role, cognitive geometry, state visibility, optional enrichment bindings and provenance/freshness metadata. It may not author a new mechanism, comparison, boundary, source locator, Question→Knowledge relation, treatment rule, learner order or learner evidence.

Reference-heavy compilation is preferred. Full canonical medical bodies remain in their Current owners and are resolved by identity/binding rather than copied into Projection.

## 2｜Current compiled scope

The v1 freeze currently accounts for the Current-eligible productized A Systems:

```text
A1 Circulation   1 SystemProjection + 12 BlockProjection
A2 Respiratory   1 SystemProjection + 12 BlockProjection
A3 Urinary       1 SystemProjection + 14 BlockProjection

Total            3 SystemProjection + 38 BlockProjection = 41 assets
```

Seven heterogeneous calibration Blocks carry richer explicit Current-supported geometry:

- A1 B1 — mechanism chain + formula language + framework;
- A1 B7 — inference + four-valve comparison + boundary;
- A1 B10 — stability-first decision structure + ECG/perfusion boundary;
- A1 B11 — feedback loop + wet/cold coordinate;
- A2 R1 — measurement/mechanics + reviewed Visual/Precision/Connection enrichment;
- A3 B1 — spatial/directional/measurement/control map + source handoff;
- A3 B5 — five-variable coordinate + priority/acid-base structure + narrow external-source provenance.

The other eligible Blocks use legal `BASELINE_CURRENT` Projection: canonical Block identity/Guide reference + first-pass support + Logic Group map + recall spine + protected views + optional Current enrichment where it exists. Baseline does not authorize invented diagrams.

Eligibility is Current-derived, not filename-derived. Systems that have files but do not yet have accepted upstream authority stay outside compiled coverage and are recorded as noneligible in the manifest.

## 3｜Durable granularity and identity

Durable owners:

```text
SystemProjection
BlockProjection
```

KP and Logic Group identities remain canonical upstream identities and are referenced; v1 does not create one Projection file per KP.

Identity rules:

- `system_id`, `canonical_id`, `block_id`, Logic Group and KP/KP-set identities must resolve against Current owners;
- Projection object IDs are stable presentation identities inside canonical scope, not medical identities;
- semantic split/merge/move is an upstream owner change and must be reconciled there first;
- page/layout changes do not create canonical medical identity;
- `OWNER_REF` must resolve to a real Current owner/scope; it is not a free-form label.

## 4｜Required vs optional schema fields

### SystemProjection required

```text
schema
status
system_id
canonical_id
sources[]
objects[]
views.SYSTEM_GUIDE
views.SYSTEM_RECALL_FRONT
views.SYSTEM_RECALL_REVEAL
```

### BlockProjection required

```text
schema
status
system_id
block_id
sources[]
canonical_scope
learning_support.first_pass_focus
learning_support.stop_line
learning_support.recall_spine
learning_support.logic_groups
kp_set
objects[]
views.BLOCK_ORIENT
views.LOGIC_GROUP_ORIENT
views.EXTERNAL_HANDOFF
views.KP_RECALL_FRONT
views.KP_RECALL_REVEAL
views.GROUP_CLOSURE
views.BLOCK_RECALL_FRONT
views.BLOCK_RECALL_REVEAL
```

### Optional

```text
projection_level
stage_role
answer_bearing
handoff_bindings[]
provenance_bindings[]
enrichment_bindings[]
calibration_notes[]
Current-owned optional System objects such as failure views
```

Optional means absent is legal. Absence must never be converted into a guessed placeholder merely for schema symmetry.

Each object requires `object_id + role + geometry + binding`. `answer_bearing` is required for any non-`PROBLEM` object exposed on a protected neutral front. `PROBLEM` is defined as a prompt/problem statement rather than its answer; it may therefore be neutral-front safe by role.

## 5｜Source registry and binding-aware freshness

Every source dependency declares:

```text
id
kind
path
baseline_blob_sha or blob_sha
freshness (explicit or contract default)
```

Current source kinds:

- `SYSTEM_CORE`;
- `MEDICAL_CORE`;
- `LEARNING_SUPPORT`;
- `SELECTIVE_CUES`;
- `PATHWAYS`;
- `EXTERNAL_SOURCE_CONTRACT`.

### `STRICT_BLOB`

Use when Projection contains explicit derived fragments from a scope-local text owner, or when a narrow external contract itself must be re-audited.

Default:

```text
MEDICAL_CORE used by DERIVED_FRAGMENT → STRICT_BLOB
EXTERNAL_SOURCE_CONTRACT             → STRICT_BLOB
```

Any hash mismatch makes the dependent Projection invalid until targeted review/recompile.

### `RESOLVE_BINDING`

Use for shared/structured Current owners whose relevant semantic dependency is an exact pointer/item/filter rather than the packaging file as a whole.

Default:

```text
SYSTEM_CORE
LEARNING_SUPPORT
SELECTIVE_CUES
PATHWAYS
→ RESOLVE_BINDING
```

```text
shared file changes
→ re-resolve this asset's exact binding(s)
→ binding still exact/valid → REVALIDATED
→ binding missing / malformed / ambiguous → STALE / FAIL
```

This is the R10 rule:

> **File packaging ≠ semantic dependency.**

Changing one sibling Block inside a shared structured owner must not falsely stale unrelated Block Projections.

## 6｜Binding contract

Projection must prefer exact references over copied learner content.

### `FIELD_REF`

Exact field in Current structured content.

Supported selector types:

- `JSON_POINTER`;
- `FRONTMATTER_FIELD`.

### `OWNER_REF`

Stable canonical owner identity such as System, Block, Logic Group or KP/KP-set. Current Block roles include `CENTER_QUESTION` and `CANONICAL_GUIDE`. Owner identity must resolve against Current; the renderer may not infer a different owner by topic similarity.

### `DERIVED_FRAGMENT`

Exact structural fragment from Current text when Current is not sufficiently structured for a field ref.

Supported selectors:

- `MARKER_ID`;
- `HEADING_EXACT`;
- `LABELED_BLOCKQUOTE`;
- `STRUCTURE_AFTER_ANCHOR`.

Exactness rules:

- a selector with no `occurrence` must resolve uniquely;
- when `occurrence` is supplied it is 1-based and must resolve that exact occurrence;
- `MARKER_ID` is globally unique in its source;
- `STRUCTURE_AFTER_ANCHOR` must find the requested structure in the selected anchor's bounded local section, not somewhere arbitrarily later in the file;
- ambiguity, missing anchors or unsupported structure types fail closed;
- fuzzy semantic rescue is forbidden.

### `INDEX_REF`

Exact unique reviewed item ID inside a Current enrichment index. Duplicate IDs are invalid.

### `INDEX_MATCH`

Deterministic exact-equality filtering over explicit Current-owned fields.

Example:

```json
{"kind":"INDEX_MATCH","index":"precision_index","where":{"anchor.block_id":"respiratory-r05"}}
```

Rules:

- `where` must be non-empty;
- every predicate path must exist in the Current index schema/data; a misspelled field is invalid, not an innocent zero-match;
- no fuzzy matching or semantic widening;
- zero matches is legal only after the predicate path itself validates;
- returned objects keep their Current timing semantics.

### `EXTERNAL_CONTRACT_REF`

Reference to an admitted external-source contract. It carries provenance/scope permission only and may not widen that source into a second learner owner.

## 7｜Role and geometry are separate

`role` expresses cognitive responsibility:

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

`geometry` expresses Mac-wide spatial form:

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

Geometry is presentation metadata, not medical truth. A geometry upgrade normally changes Projection only.

## 8｜Multi-object Block semantics

A Block is a scope of cognitive objects, never one mandatory shape.

```text
BlockProjection
├─ objects[]
├─ learning-support bindings
├─ Logic Group / KP identity bindings
├─ optional enrichment / handoff / provenance
└─ views
```

Chain + Compare + Boundary + Map + Exact + Handoff may coexist when Current supports them. Generic schema/renderer code must never require A1-specific, A2-specific or A3-specific cognition.

## 9｜State views and multi-pass compatibility

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

The same canonical cognition is reused across states. V1 does not pre-author `SECOND_PASS_REVIEW` or `LATE_REVIEW` semantic content. Those names may be added later without schema redesign once accepted Current authority exists.

## 10｜Neutral-front safety is fail-closed

Any view with `protection: NEUTRAL_FRONT` may expose only neutral objects/context.

It must not expose:

- canonical Guide/Core;
- recall spine or closure answer text;
- answer-bearing Precision/Visual/Failure content;
- answer-type KP titles;
- hidden answer content via sidebars, inspectors, tooltips, shortcuts or handoff/provenance bindings.

Asset-level rules:

- every referenced non-`PROBLEM` object must explicitly declare `answer_bearing: false`;
- `answer_bearing: true` always fails;
- neutral views may not request `learning_support_keys`, handoff bindings or provenance bindings;
- when an asset has optional enrichment, a neutral view must use `enrichment_policy: NO_ANSWER_LEAK`;
- neutral KP content may use only the accepted ID/state/neutral-prompt policy;
- Logic Group names/IDs/state may remain as the structural scaffold, consistent with the accepted Block Recall product contract.

This asset gate complements later whole-workspace browser validation; it does not claim downstream UI is already safe.

## 11｜Optional enrichment is first-class

```text
reviewed enrichment exists → bind it exactly
reviewed enrichment absent → remain absent
```

A2 may bind Visual/Precision/Connection and optional failure views. A1/A3 do not receive fake matching sidecars. A3 B5 may bind its narrow external-source contract without making all Blocks multi-source.

## 12｜Mac / Dense Calm boundary

Projection preserves semantic structure needed by accepted Mac-wide product design but does not own CSS.

Allowed: cognitive role/geometry, primary/context relation, state visibility.  
Forbidden: pixels, colors, font sizes, shadows, card radii, decorative theme truth.

Downstream acceptance still requires Mac-wide Dense Calm behavior, comfortable text, strong contrast, useful density, low disorder, minimal stable-path friction, and real screenshots. Projection validation is not visual acceptance.

## 13｜Question boundary

Projection is not a second question database. Official Question Truth, explanations and reviewed Question→Knowledge relations remain in their dedicated owners. Projection may not infer or copy official question-answer semantics.

## 14｜Manifest and disposition contract

Every currently Projection-eligible Block receives exactly one accounting disposition:

```text
PASS
REFERENCE_ONLY
BLOCKED
```

Manifest accounting must record at least:

- source Current head used for compilation;
- Projection compilation commit;
- schema version;
- eligible System coverage;
- noneligible System scope and reason;
- every eligible Block's disposition and asset path when applicable;
- current validation freshness state (`FRESH` / `STALE` / `BLOCKED`);
- validator contract/result;
- separate Runtime adoption status.

`PASS` means a Projection asset exists and validates. `REFERENCE_ONLY` means Current authority is intentionally consumed by reference without a richer Projection object where the contract allows it. `BLOCKED` means exact safe compilation cannot be completed from Current authority. None of these statuses may be inferred from filesystem presence alone.

## 15｜Validator contract

V1 freeze requires machine validation for:

1. JSON/schema shape and required fields;
2. stable owner identity resolution;
3. source existence and binding-aware freshness;
4. exact selector uniqueness / occurrence semantics;
5. exact index IDs and index predicate fields;
6. absent optional enrichment remaining absent;
7. neutral-front fail-closed safety;
8. multi-object support and state reuse without copied medical summaries;
9. full manifest accounting;
10. R10 local-change absorption without false sibling stale fan-out;
11. no System/topic-specific medical truth in generic validator/renderer assumptions.

The validator must derive compiled Systems/counts/source paths from manifest + Current owners. Hard-coding A1/A2/A3 topic semantics or fixed block counts in generic validation code is forbidden.

## 16｜R10 Content Change Absorption Test

At minimum, self-test must prove:

```text
shared structured sibling-only mutation
→ target Block exact bindings still resolve
→ target Block does not falsely stale

referenced pointer removal / malformed selector
→ validation fails

scope-local STRICT_BLOB mutation
→ only the dependent Projection scope is invalidated

ambiguous text selector / malformed INDEX_MATCH path
→ validation fails rather than silently choosing a nearby/zero result
```

Normal content refinement should therefore be absorbed by revalidation/recompile rather than named-topic renderer branches.

## 17｜Separate Runtime blocker and acceptance boundary

Question attempt history / multi-pass evidence migration is not solved here. Before multi-pass question Runtime productization, attempts must remain append-preserved and phase-aware.

This v1 freeze means only:

> **Current-eligible Xizong cognition can be compiled into stable, fail-closed, evolvable Projection assets for downstream consumption.**

It does not claim Astro adoption, Mac screenshot acceptance, learner completion, second-pass semantic content, or any S/K/L/P/R/E/U promotion.
