# Xizong Cognitive Projection Contract

Status: **A1/A2/A3/B/C/D/E/F COMPILED ASSETS · CURRENT ELIGIBILITY RECONCILED · C/D/E/F TESTED P/R/E ACCEPTED ON SHARED PRODUCT**
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
C  Hematology / Immunity / Infection   1 SystemProjection + 27 BlockProjection
D  Neuro / Sensory / Motor / Ortho      1 SystemProjection + 27 BlockProjection
E  Reproductive / Breast                1 SystemProjection + 20 BlockProjection
F  Remaining Clinical                   1 SystemProjection +  9 BlockProjection

Compiled total                         8 SystemProjection + 159 BlockProjection = 167 assets
```

C is compiled and tested on the shared product with its accepted sharded Learning owner, explicit/non-contiguous `kp_members`, and Block/canonical-Source-unit contact. D is also compiled and tested on the same product; its accepted top-level `logic_groups + system_route + Content block_realization` shape is normalized without rewriting Learning and preserves `WHOLE_BLOCK_SOURCE`, `NATURAL_SOURCE_UNITS`, `INTEGRATION_PRIMARY`, plus hard-readiness edges.

E and F use the same accepted top-level owner shape and now have materialized Projection assets plus executed shared-product P/R/E acceptance. E/F keep their distinct Source-unit, Visual-gap and integration boundaries without a System-local product fork.

Current eligible accounting therefore is:

```text
A1 / A2 / A3 / B / C / D / E / F   eligible + compiled   159 Blocks
--------------------------------------------------------------------
Current eligible Systems                                    8
Current eligible Blocks                                    159
```

C materially differs from the older contiguous-range assumption:

- accepted Logic Group membership may be explicit and non-contiguous (`kp_members`);
- Logic Group remains a retrieval / local-closure unit;
- C Source contact is Block / accepted canonical Source-unit oriented and must not be collapsed into LG-by-LG Source trips;
- the shared semantic adapter owns this Current normalization before Projection / renderer consumption.

D/E/F add a second accepted Learning-owner shape rather than a second product:

- block route comes from accepted System `block_families` plus Learning `system_route.default_route`;
- Logic Groups are top-level per-Block arrays with explicit ordinal `members`;
- accepted Content `block_realization` owns whole-block / natural-Source-unit / integration-primary contact;
- natural Source units may release multiple LGs and must not be collapsed to LG-by-LG Source bouncing;
- integration-primary does not manufacture a new continuous Lecture pass;
- D hard readiness (`N1+N5+N8 → N11`, `N11 → O3/O4/O5`) is enforced from the accepted owner rather than inferred from default route.

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

<a id="block-review-generation"></a>
### 7.1｜KianOS Website / reconstruction generation — medical topology, not three columns

**Scope boundary:** this section governs the KianOS Website/reconstruction Projection lane. It explicitly does **not** govern standalone Lecture-replacement teaching assets.

Lecture-replacement first-pass teaching is owned by [`knowledge/learner/LECTURE_REPLACEMENT_CONTRACT.md`](../knowledge/learner/LECTURE_REPLACEMENT_CONTRACT.md). In that separate lane, the teaching model/framework is the body and matching canonical KP title + **full formal Prompt** are semantic locators only; canonical KP Core is not auto-expanded or mirrored into the teaching surface.

This section owns the generation/composition rule for newly authored or migrated KianOS Block study/reconstruction views. It adopts the reconstruction decision from [#1147](https://github.com/kianwang022-hash/kianos/issues/1147); that Issue retains task progress and candidate review, not a competing permanent generation contract. The rule does not assert that any existing asset, Website surface or Human Gate has already migrated.

The **KianOS Website/reconstruction** output grammar is:

```text
Current System position + complete Block content and real supports
→ reviewed medical topology
→ 知识标题〔完整正式主提示〕 with its canonical content bound/rendered according to this Website/reconstruction view
→ the same objects/relations at compressed density + necessary condition labels
```

Do not reuse this grammar for Lecture-replacement teaching. That separate teaching lane is:

```text
reviewed teaching model/framework
+ matching canonical 知识标题〔完整正式主提示〕 as locator
→ no automatic canonical Core expansion
```

**Replace the old left-mechanism / middle-expansion / right-KP production template, not its valid knowledge.** LG sections, KP numbering and document order must not become the visual backbone. A Block remains one reconstructable medical model containing heterogeneous local objects under §7, not one forced chain, tree, viewport or mandatory Canvas.

#### Content inheritance and in-place KP composition

- Read the complete Current Block and applicable System/Learning owners through the [Chat-led reading entry](../knowledge/learner/README.md#chat-led-block-reading-entry), plus actually owned teaching/review, Framework, comparison, counterfactual, MI-G/MI-D, Precision, MedicalVisual and Source support. Prompt inventories and old acceptance reports are not substitutes for this content.
- Keep all valid medical meaning, full formal titles and Prompts, necessary conditions, comparison axes, exact facts and Source locators. Merge duplicate expression, not distinct contexts or cognitive jobs. A source conflict or genuine defect returns to its existing owner; presentation migration does not silently reconcile it or rewrite medical Core.
- Every KP has an identifiable in-place semantic anchor: a node, branch, comparison or verification object. Its title and full formal Prompt belong there, followed by its actual content; do not explain a mechanism and then repeat the same answer in a separate KP list. One content identity may have several connection/reference entrances, but its maintained complete answer remains the canonical Core; Projection keeps identity/relations/conditions and resolves that Core rather than maintaining another full answer. A composite KP may span linked local subparts without splitting its canonical identity or copying its Core.
- **Website-only clarification:** the preceding Core-binding rule applies only to this KianOS Website/reconstruction lane. It must never be used to inject Core into `*-teaching.md` or a Lecture-replacement Teaching Map.
- Non-KP Framework, model relations and support also have explicit destinations. Complete coverage does not mean every support item is permanently visible. Nor is a full-text appendix sufficient when the main model omits reasoning-critical content.
- Medical relations, disease time course, teaching/retrieval order and clinical priority are distinct. Preserve the reviewed type, direction, endpoints and conditions of flow/process, causal influence, parallel structure, feedback, comparison, evidence, decision and reference. Neither the generator nor Focus infers these from numbering, placement, similar titles or graph traversal. Formal Boundary/Connection adoption still follows `LEARNING_CONTRACT.md`; a diagram edge does not create a new formal support identity.

#### Encoding / consumer boundary

- The production learner surface must consume reviewed topology through the existing BlockProjection responsibility (or a bounded, validated extension of that existing Projection schema). Do **not** make the Website parse Issue comments, legacy three-column prose, Markdown position or free-form Chat text to infer nodes/edges.
- Canonical KP title / Prompt / Core remain resolved from their Current owners. A reviewed topology asset stores identity, relation, condition/compression metadata and owned support bindings; it does not become a hand-maintained second full-answer corpus.
- The current v1 BlockProjection assets do not by themselves prove that the new KP-level integrated topology is materialized. A B1 content candidate may drive a prototype, but production cutover requires the accepted topology to be represented in the existing Projection owner and pass its real validator/consumer boundary. Do not bridge the gap with an untracked frontend-only graph.
- Legacy `*-review.md` files are therefore temporary inheritance/audit inputs while unique reviewed semantics are being rehomed. Once a Block's unique valid review content has been accounted for in Current owners + reviewed Projection and the consumer has cut over, retire the legacy duplicate instead of preserving two mutable review bodies indefinitely.

#### One model, two densities, separate learning evidence

- Expanded and compressed outputs consume the same bound objects and relations. Expansion exposes complete mechanism, comparison and necessary detail; compression retains the medical backbone, formal title, **complete formal Prompt**, essential formulas/relations and the conditions needed to prevent a changed inference. It is not a separately authored summary.
- Short condition labels may replace long condition prose only when the subject, scope, negation, timing and decision-changing meaning survive. Do not hide a decisive condition in Context/Boundary or leave a bare unqualified arrow. Source/provenance and optional extensions need not occupy the compressed reading stream.
- In-place expansion preserves the medical region, relative relationships and current reading anchor, not every absolute pixel. Local space may grow or reflow without changing knowledge position or forcing the learner to locate the object again. KP IDs remain available for provenance/navigation but are not ordinary reading content; lawful private Prompt overrides remain private.
- Chat teaching remains adaptive, continuous explanation of the same knowledge, with current LG goals/order/closure retained for teaching coverage and formal retrieval. The study/reconstruction view organizes that knowledge for expansion and model rebuilding; it is not a script Chat must read aloud or a replacement for full canonical/Source reading.
- This rule grants no new visibility state, gate bypass or evidence write. A compressed study graph is **not** a KP/Block/System Recall Front. Existing Front/Reveal protection, complete canonical Core verification, Source contact, Recall, completion, Memory evidence and private-state rules remain unchanged. Preserve System-specific external-primary and Source-unit policies; a new review format does not turn every Block orientation into a second Lecture.

#### Memory, MedicalVisual and System scope

Model and Memory are complementary uses of the same owned knowledge, not two independent answer banks. Keep reasoning-critical precision/conditions in the model. Use existing Memory admission and scheduling for exact facts **and eligible Core/mechanism retrieval**; availability, owner-context-only support, independent cards and due debt remain distinct. Do not invent items/counts or split a list into new cards for display. MedicalVisual needed for current understanding must be available at that knowledge position and timing, not uniformly relegated to a later drawer; unresolved locators/assets stay explicit.

The System locator is thin and derives its positions from the full Current System, including applicable normal, control, electrical, interface and disease/failure roles. It is not a reduced B1 flow chart or a collage of every Block. This does not delete the System's richer formal content. Different Blocks may use different local geometries. Cross-Block/System专题重建 stays Chat-led and on demand, using existing models/KPs and their Primary owners; this migration creates no separate thematic model, webpage, KP set or Memory queue.

#### Migration and acceptance

Keep existing `*-teaching.md` paths when their purpose and scope remain the same. Existing reviewed three-column `*-review.md` files are temporary content-inheritance inputs while their unique valid semantics are being migrated; `review` names a use, not a mandatory three-column layout or a requirement to keep a second full-answer Markdown forever. Do not create a parallel model owner, registry or hand-maintained full-answer file. Their old left/middle/right instructions are legacy-format descriptions, **not instructions for new generation**. A still-valid medical review witness does not prove compliance with the new composition rule; do not blindly advance that witness or relabel an unconverted file as an integrated map. After a Block has full inheritance + reviewed topology + consumer cutover, delete/retire the obsolete duplicate or replace it only with a thin generated/reference view if a human-readable review surface is still useful.

For each converted Block, replace the old view only after the actual content/topology review, retain its upstream identity and reviewed-against witnesses, and update its existing reading link/format description in the same coherent change. Candidates remain in the existing task/branch until accepted; do not route ordinary teaching to an unaccepted Issue draft. A missing or stale optional view does not block teaching from valid Current owners. Historical templates remain history/inheritance material, not fallback generation authority.

Before calling a Block migration complete, verify:

1. **Bidirectional inheritance:** each formal KP and each Prompt axis, including counted/composite subitems, has real content; each new displayed claim/relation has an existing accepted basis. Non-KP and real support destinations are checked too.
2. **Whole-model reading:** with LG/KP numbers hidden, the Block's purpose, main path, branches, feedback and observation/decision windows can be reconstructed. Nothing is made a causal next step merely to connect the page.
3. **Density fidelity:** both densities preserve identities, full Prompts, relation types and decisive conditions; no duplicated complete answer or separately maintained compressed text appears.
4. **Support and evidence safety:** actual Memory/Precision/MedicalVisual/Source roles, timing, provenance and absence survive; browsing/expansion/Focus creates no learner evidence or review debt and leaks no protected Recall answer.
5. **Consumer cutover:** the authoring instruction, Chat reading route and published view description agree about the actual accepted format. Check the concrete resulting view, not just counts or this rule's presence. Website/reading usability is a separate downstream test, not proved by Markdown, hashes or a pretty interface.

Reuse the existing inspection and review evidence; these checks are not a new learner form or audit registry. Apply the rule within the authorized migration scope. B1 calibration does not authorize automatic B2–B12 or all-System regeneration, invalidate unrelated acceptance, or alter existing learning records. A documentation-only rule/route update must not be reported as completed content or Website migration.

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

The shared product composition uses roles rather than fixed columns:

```text
Structure = System / Block position + optional local navigation
Main      = dominant current medical / cognitive object
Context   = conditional Source / MedicalVisual / Precision / Connection / repair support
```

For an integrated Block medical-map view, Main may take nearly the full width; Structure may be a thin System locator plus collapsible/secondary LG/KP navigation, and Context appears only when useful. This is compatible with LG membership/order/evidence remaining Current backstage state. Projection supplies semantic objects/relations to these roles; it does not force a permanent left rail, three content columns or one panel per object.

These are workspace roles, not a requirement to generate a left-mechanism / middle-expansion / right-KP review. KianOS Website/reconstruction content follows §7.1. **Standalone Lecture-replacement teaching does not enter this Website workspace contract and is not a Runtime input.** Concrete geometry and existing Recall surfaces remain owned by `static-web/XIZONG_BLOCK_WORKSPACE_DESIGN.md` and its applicable Visual parents; this contract does not prescribe fixed columns or install a new interface.

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

It validates the **materialized A1/A2/A3/B/C/D/E/F asset set** and its exact bindings / view safety. C/D/E/F each have executed shared-runtime acceptance evidence; Human Gate and learner U remain separate claims.

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

- A1/A2/A3/B/C/D/E/F remain compiled;
- C explicit/non-contiguous membership and Block/canonical-Source-unit semantics remain intact;
- D/E/F top-level accepted Learning + Content realization normalize into the same shared semantic shape without a System-local fork;
- B whole-LG Source contact survives;
- D natural Source units remain accepted Source boundaries rather than LG boundaries;
- D integration-primary blocks do not gain a fabricated continuous Lecture pass;
- D hard-readiness identities resolve to stable Block IDs;
- compiled manifest slots exist only when real System/Block Projection assets validate against Current owners.

Both gates are required in Current Xizong QA. A green compiled-asset validator cannot make stale eligibility metadata true, and a green Current semantic adapter cannot make absent Projection assets compiled.

Executed evidence belongs to the actual CI run/report. Test implementation and self-review remain `SELF` evidence, not an independent P acceptance.

A passing suite does **not** by itself freeze all production semantics. No-invention in medical meaning, preservation of useful learner content, renderer compliance, Runtime/Evidence integration, visual acceptance and real learning require their own evidence. Re-pinning in mutation fixtures tests recovery mechanics; it is not authorization to blindly re-pin changed medical content in production.

## 14｜Runtime boundary

There is no separate Projection-level requirement to invent another Runtime or another question-attempt store.

Current official Question Runtime already owns append-preserved, phase-aware attempts. Projection remains read-only semantic presentation. The active downstream work is to make the existing production Block renderer consume Current semantic / Projection objects without changing medical truth, learner state, Evidence meaning or creating `V7` / a parallel Runtime.

This Projection reconciliation changes no learner state, question evidence, Block completion, or S/K/L/P/R/E/U acceptance by itself.

## 15｜Validation metadata revision 1.3 Current reconciliation

The existing v1.1 bounded migration added `FIELD_REF.value_type`, explicit object `answer_bearing`, restricted front `logic_map_policy`, explicit KP neutral policy and the corrected A3 B5 external-contract root pointer.

The Current reconciliation preserves that asset schema family while adding a higher-level invariant:

> **Compiled asset topology and Current accepted learning topology are checked separately and must agree where they overlap.**

No canonical medical text, stable medical identity, learner order, Source-contact decision or question evidence is rewritten. C/D/E/F are compiled and tested on the same shared product. None has a System-local product fork. Producers and future consumers must honor these declared boundaries; ignoring them is not compatible adoption.
