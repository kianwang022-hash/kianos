# Xizong Cognitive Projection Contract

Status: **A1/A2/A3/B COMPILED ASSETS · CURRENT ELIGIBILITY RECONCILED · C ELIGIBLE NOT COMPILED · RUNTIME ADOPTION NOT CLAIMED**  
Parent product: `static-web/XIZONG_PRODUCT_BRIEF.md`  
Learning authority: `content/xizong/LEARNING_CONTRACT.md`  
Current semantic adapter: `static-web/src/lib/xizongSemanticAdapter.mjs`  
Root evolvability requirement: `PROJECT_DEFINITION.md` R10 + `ARCHITECTURE.md` §7.1  
Shared presentation grammar: `static-web/PRESENTATION_CONTRACT.md`

This contract owns the derived cognitive Projection layer between Current Xizong medical/learning assets and learner-facing workspaces. It does not own medical truth, learning order, Source-contact granularity, question truth, learner evidence, Runtime semantics, or UI styling.

## 1｜Purpose

Projection exists so normal content evolution is usually absorbed as semantic re-resolution / asset revalidation / targeted recompile rather than a page rewrite:

```text
Current medical / learning owners
→ shared Current semantic adapter
→ reviewed optional enrichment
→ Xizong Cognitive Projection
→ reusable learner workspace / renderer
→ Runtime / Evidence
```

Hard rule:

> **Projection organizes Current semantics; it does not become a second medical or learning owner.**

It may describe semantic role, useful cognitive geometry and state visibility. It may not author a new mechanism, comparison, boundary, Source-contact segment, source locator, Question→Knowledge relation, treatment rule or learner evidence.

## 2｜Current compiled scope vs eligibility

Compiled Projection and Current eligibility are different claims.

Current materialized Projection assets cover:

```text
A1 Circulation                         1 SystemProjection + 12 BlockProjection
A2 Respiratory                         1 SystemProjection + 12 BlockProjection
A3 Urinary                             1 SystemProjection + 14 BlockProjection
B  Digestive / Metabolic / Endocrine   1 SystemProjection + 38 BlockProjection

Compiled total                         4 SystemProjection + 76 BlockProjection = 80 assets
```

Current accepted Knowledge + Learning makes **C Hematology / Immunity / Infection eligible for Projection**, but C remains deliberately **not compiled** in the manifest until an explicit C Projection compile is built and validated. Eligibility is not a P PASS and is not permission to invent a placeholder asset.

Current eligible accounting therefore is:

```text
A1 / A2 / A3 / B   eligible + compiled        76 Blocks
C                   eligible + not compiled    27 Blocks
--------------------------------------------------------
Current eligible Systems                       5
Current eligible Blocks                       103
```

C materially differs from the older contiguous-range assumption:

- accepted Logic Group membership may be explicit and non-contiguous (`kp_members`);
- Logic Group remains a retrieval / local-closure unit;
- C Source contact is Block / accepted canonical Source-unit oriented and must not be collapsed into LG-by-LG Source trips;
- the shared semantic adapter owns this Current normalization before Projection / renderer consumption.

The older A systems retain seven heterogeneous calibration Blocks with richer explicitly compiled geometry:

- A1 B1 — mechanism chain + formula language + framework;
- A1 B7 — inference + four-valve comparison + boundary;
- A1 B10 — stability-first decision algorithm + ECG boundary;
- A1 B11 — feedback loop + wet/cold decision coordinate;
- A2 R1 — measurement/mechanics + Visual/Precision/Connection enrichment;
- A3 B1 — spatial/directional/measurement/control map + source handoff;
- A3 B5 — five-variable coordinate + priority/acid-base algorithm + narrow external-source provenance.

B additionally has calibrated representative assets while keeping its orientation bounded; its whole canonical Block Markdown is not promoted into a second Lecture surface.

Baseline Projection preserves references to complete canonical owners rather than authoring shortened medical truth. Asset existence does not prove that the production renderer already presents the semantic hierarchy well; renderer compliance and browser acceptance remain downstream.

## 3｜Granularity and identity

Durable Projection granularity:

```text
SystemProjection
BlockProjection
```

KP/LG identities remain canonical owners and are referenced rather than copied into one Projection file per KP.

Rules:

- `system_id`, `block_id`, `logic_group_id`, `kp_id` resolve against Current canonical owners;
- page layout changes do not create new canonical identity;
- semantic split/merge/move is an upstream owner change and must be reconciled there first;
- Projection object IDs are presentation identities inside one canonical scope, not new medical identities;
- Logic Group membership may be contiguous or explicit/non-contiguous when the accepted Learning owner says so;
- Source-contact identity is not derivable from Logic Group identity merely for renderer convenience.

## 4｜Source registry and binding-aware freshness

Every compiled Projection source declares path + baseline blob SHA for provenance. Whether a source blob change invalidates the asset depends on semantic dependency, not file packaging.

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

A mismatch makes that dependent asset `STALE` until targeted review/recompile. Missing hashes or changing a derived-fragment source to `RESOLVE_BINDING` cannot bypass the guard.

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

This rule is required by R10 Content Evolvability: **file packaging ≠ semantic dependency**. A same-type text change is mechanically resolvable, not automatically a medically or pedagogically accepted change. Upstream authority still owns its meaning.

## 5｜Binding model

Prefer references over copied learner content.

### `FIELD_REF`

Exact structured field in Current JSON/frontmatter. Requires `value_type` matching the resolved value (`string`, `object`, `array`, `number`, or `boolean`). A consumer must not treat pointer existence alone as type compatibility.

Supported selectors:

- `JSON_POINTER`;
- `FRONTMATTER_FIELD`.

The empty string `""` is the JSON root pointer; `"/"` selects an empty-string key and is not a root alias. Array indexes and `~0` / `~1` escapes are exact. Frontmatter selection returns the selected field's source text, not an inferred YAML object.

### `OWNER_REF`

Stable canonical owner identity. Current roles used by baseline BlockProjection include:

- `CENTER_QUESTION`;
- `CANONICAL_GUIDE`;
- canonical Block/LG/KP/KP-set identity.

`OWNER_REF` means the consumer resolves the Current owner; Projection does not copy its medical body. Resolution must check System/Block identity, exact canonical file, LG ownership and KP membership.

For current learner topology, the shared semantic adapter is the normal cross-System normalization layer. It supports accepted contiguous ranges and explicit/non-contiguous membership without rewriting either into the other. A compiled asset validator may use a narrower System adapter for the assets it actually validates; that narrower adapter must not be mistaken for the global Current learning model.

### `DERIVED_FRAGMENT`

Structurally selected fragment from a Current text owner when Current is not already structured enough.

Supported selectors:

- `MARKER_ID`;
- `HEADING_EXACT`;
- `LABELED_BLOCKQUOTE`;
- `STRUCTURE_AFTER_ANCHOR`.

Selectors fail closed. Runtime must never perform fuzzy semantic search to rescue a broken selector. Headings/markers/anchors must be unambiguous and outside code fences. Markers must adjoin their owning section. An anchored structure must be adjacent, not rescued from a later unrelated section; current v1 uses occurrence 1. Empty or malformed structures fail.

### `INDEX_REF`

Exact unique reviewed item ID inside an enrichment index. Returned values and declared anchors must resolve to Current-owned endpoints.

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
- supported filter fields and owning scope must be checked;
- return the actual matching objects, not an unconditional boolean;
- zero matches is legal for optional enrichment;
- the renderer may expose only matched Current objects and must preserve timing semantics.

### `EXTERNAL_CONTRACT_REF`

Reference to an admitted external-source contract. It carries provenance/scope permission only; it may not copy/widen the external source into a second learner owner. Requires a strict source pin, `DO_NOT_WIDEN_ADMITTED_SCOPE`, and provenance-only learner-content policy.

## 6｜Role vs geometry

Keep two dimensions separate.

`role` answers what cognitive job an object performs:

```text
PROBLEM MAP CHAIN COMPARE BOUNDARY EXACT HANDOFF RECALL CLOSURE REFERENCE
```

`geometry` answers how Current semantics may be spatialized on Mac:

```text
SEQUENCE LOOP MATRIX AXES TREE NETWORK TABLE FORMULA_STRIP SPATIAL_MAP TEXT_STRUCTURE
```

Geometry is presentation metadata, not medical truth. A geometry upgrade should normally not require changing the canonical medical owner. Known role/geometry names do not prove their semantic suitability for a particular source fragment.

These are backend semantics. The learner-facing UI should normally render the mechanism / comparison / boundary / exact item itself, not labels such as `CHAIN`, `MATRIX` or `EXACT`.

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

Likewise, do not flatten the semantic adapter into one generic card list. Projection geometry exists precisely to preserve different cognitive structures inside one shared renderer.

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

A view selects bound Current objects/support; it does not duplicate medical text. Every referenced object/support/handoff must exist in the same asset. Unknown presentation channels cannot silently expose payload.

Future passes may add `SECOND_PASS_REVIEW` / `LATE_REVIEW`, but this compilation does not pre-author second-pass discrimination, distractor, condition-mutation, case or cross-System content. Those require accepted Current authority first. A new view label does not implement a learning behavior or alter Evidence.

## 9｜Neutral-front safety

This section constrains the **compiled cognitive-object Front channel**, not the complete KP learner-object workspace. Its objects may not smuggle answer payloads through maps, labels, inspectors or hidden semantic slots. Each cognitive object declares an explicit boolean `answer_bearing`. A false flag alone is never sufficient evidence of safety.

The named Recall Front states remain protected even if a producer omits their `protection` flag; omission must fail validation rather than disable validation.

The KP learner object separately follows `LEARNER_OBJECT_CONTRACT.md` / Block Workspace §9: same identity/title, Prompt, exact locators and Current-approved Context may remain visible. That permission does not override an asset's explicit `answer_bearing` or `POST_REVEAL` restriction, nor authorize copying canonical Core into an auxiliary slot. Block/System reconstruction remains stricter. These are different output layers, not rival Learning models.

The current **compiled-channel** declarative allowlist is:

- `SYSTEM_RECALL_FRONT`: only the Current System's neutral prompt / generic attempt instruction, never a medical answer object;
- `KP_RECALL_FRONT`: `ID_AND_NEUTRAL_PROMPT_ONLY`, no Block answer objects;
- `BLOCK_RECALL_FRONT`: Current center question and the already accepted optional LG label map; `logic_map_policy: LABELS_AND_IDS_ONLY` restricts that map to IDs/labels, never its closures, goals, KP answers or future added answer fields.

No protected compiled view may expose canonical Guide/Core, recall spine, Precision, answer-bearing Visual, Failure answer, source/provenance payload or answer-type title through a second channel. Learning-support and handoff payloads are forbidden on the Front. Enriched assets require explicit `NO_ANSWER_LEAK` front policy.

The asset validator checks declarations and provides a bounded testable neutral payload projection. It does not execute the production browser renderer. DOM, accessibility text, tooltips, hidden inspectors, keyboard actions and real runtime-state transitions still require downstream browser tests.

## 10｜Optional enrichment is first-class

Systems do not need symmetrical sidecars.

```text
reviewed enrichment exists → Projection may bind it
reviewed enrichment absent → stays absent
```

A2 may bind Visual/Precision/Connection; A1/A3/B/C do not manufacture placeholders merely for parity. A3 B5 may bind a narrow external-source contract without turning every Block into a multi-source object.

Visual Gate remains a conditional learning cue, not an asset-completeness requirement. Missing Extension content is legal and must not block Block completion or Projection eligibility.

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

The shared product layout remains conceptually:

```text
LEFT   Position / Logic Map
CENTER Primary Cognitive Path
RIGHT  Attention Projection
```

Projection may supply semantic objects to these lanes; it does not turn every object into its own panel.

## 12｜Question / TTSX boundary

Cognitive Projection is not a second question database.

Official Question Truth, explanations and reviewed Question→Knowledge relations remain in dedicated owners. Question workbenches may compose those owners with Cognitive Projection; Block/System Projection may not copy official questions or answers.

Lecture-attached TTSX is also not owned here. Current rule remains:

```text
Boundary = WHEN
reviewed Binding = WHICH
```

The original Lecture / MarginNote owns answering and source-local expansion. Projection / renderer may expose a lightweight checkpoint only when an accepted reviewed binding exists. Missing binding stays absent; no similarity-based fallback to the official question corpus is allowed.

## 13｜Validation / reconciliation gates

There are now two complementary gates.

### Compiled Projection asset gate

```text
python3 content/xizong/projection/tools/validate_projection.py --self-test --json <report-path>
```

It validates the **materialized A1/A2/A3/B asset set** and its exact bindings / view safety. It does not pretend that C has already been compiled.

The companion mutation suites run adversarial cases through the real validator using in-memory overlays rather than altering canonical source files.

Compiled asset validation covers:

1. System/Block/LG/KP identity resolution for compiled assets;
2. binding-aware freshness and required pins/types;
3. exact selector resolution, ambiguity and unsupported fields;
4. optional enrichment resolution without fake symmetry;
5. multi-object shape and scoped reference integrity;
6. state-view reference integrity;
7. declarative neutral-front allowlists;
8. R10 local stale/revalidation behavior with unaffected siblings still passing;
9. compiled manifest coverage reconciled to the Current owners supported by that asset validator.

### Current eligibility / learning-topology reconciliation gate

```text
node static-web/scripts/validate-xizong-projection-current.mjs
```

This gate consumes the shared Current semantic adapter and checks what the compiled asset validator cannot legitimately claim:

- A1/A2/A3/B remain compiled;
- C is eligible but intentionally uncompiled;
- C's explicit/non-contiguous LG membership survives exactly;
- B whole-LG Source contact survives;
- C Block/canonical-unit Source contact is not collapsed into LG-by-LG bouncing;
- C does not silently appear in compiled manifest slots before real assets exist.

Both gates are required in Current Xizong QA. A green compiled-asset validator cannot make stale eligibility metadata true, and a green Current semantic adapter cannot make absent Projection assets compiled.

Executed evidence belongs to the actual CI run/report. Test implementation and self-review remain `SELF` evidence, not an independent P acceptance.

A passing suite does **not** by itself freeze all production semantics. No-invention in medical meaning, preservation of useful learner content, renderer compliance, Runtime/Evidence integration, visual acceptance and real learning require their own evidence. Re-pinning in mutation fixtures tests recovery mechanics; it is not authorization to blindly re-pin changed medical content in production.

## 14｜Runtime boundary

There is no separate Projection-level requirement to invent another Runtime or another question-attempt store.

Current official Question Runtime already owns append-preserved, phase-aware attempts. Projection remains read-only semantic presentation. The active downstream work is to make the existing production Block renderer consume Current semantic / Projection objects without changing medical truth, learner state, Evidence meaning or creating `V7` / a parallel Runtime.

This Projection reconciliation changes no learner state, question evidence, Block completion, or S/K/L/P/R/E/U acceptance by itself.

## 15｜Validation metadata revision 1.2 Current reconciliation

The existing v1.1 bounded migration added `FIELD_REF.value_type`, explicit object `answer_bearing`, restricted front `logic_map_policy`, explicit KP neutral policy and the corrected A3 B5 external-contract root pointer.

The Current reconciliation preserves that asset schema family while adding a higher-level invariant:

> **Compiled asset topology and Current accepted learning topology are checked separately and must agree where they overlap.**

No canonical medical text, stable medical identity, learner order, Source-contact decision or question evidence is rewritten. C's eligibility is now recorded without manufacturing C Projection files; C compilation remains an explicit future construction step. Producers and future consumers must honor these declared boundaries; ignoring them is not compatible adoption.
