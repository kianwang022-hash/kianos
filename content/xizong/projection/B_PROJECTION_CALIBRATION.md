# B Cognitive Projection Calibration

Status: **P0 + P1 PASS — ATOMIC FULL COMPILE NEXT**  
Scope: `B — Digestive / Metabolic / Endocrine / Tumor`  
Execution: GitHub Issue `#155`  
Gate: `P — Projection`

This file is durable Projection calibration evidence. It is **not** a medical owner, Learning owner, Runtime owner, learner-state owner, or alternative Projection manifest.

---

## 1｜Whole-flow position

B Projection must preserve the accepted learner loop:

```text
System Guide
→ choose ready Block
→ Block orientation
→ Logic Group orientation
→ one whole-LG original Lecture contact in MarginNote
→ one normal return to KianOS
→ KP Recall
→ LG closure
→ next LG
→ Block Recall
→ Block Complete
→ optional non-gating PSR at a natural checkpoint
→ only after actual System learning: System Recall
→ later official System question sweep when S exact qid scope closes
```

Projection therefore organizes **what Kian should see/do on KianOS at each state**. It must not pull the external-primary Lecture back into Astro.

---

## 2｜Existing Projection baseline audit

The existing A1/A2/A3 Projection architecture is reusable and is **not** reopened.

### KEEP

- durable granularity = `SystemProjection + BlockProjection`;
- shared semantic roles / geometry split;
- one Block may carry multiple cognitive objects;
- `OWNER_REF` / `FIELD_REF` over Current owners;
- protected `KP_RECALL_FRONT` / `BLOCK_RECALL_FRONT` / `SYSTEM_RECALL_FRONT`;
- full canonical KP Core after legitimate Recall Reveal rather than AI summary;
- external-primary handoff policy;
- optional enrichment stays optional;
- Mac/Dense-Calm boundary remains downstream from asset semantics.

### B-specific projection constraint

The **architecture** is reused, but not every existing A baseline view composition is copied literally.

A1/A2/A3 baseline assets may expose a whole `CANONICAL_GUIDE` object in `BLOCK_ORIENT`. B's canonical Block Markdown is substantially richer and can include extensive KP/Core teaching detail. Projecting the whole B Markdown at orientation would conflict with the accepted B Learning rule that MarginNote/original Lecture is the continuous teaching owner and KianOS is bounded orientation/retrieval/compression support.

Therefore B `BLOCK_ORIENT` must **not** render the whole canonical Block Markdown by default. Complete canonical KP Core remains available only at the legitimate KP Recall Reveal / repair state from its medical owner. Projection is protecting accepted L, not deleting medical content.

### OPTIMIZE / EXTEND FOR B

Only the owner adapter and B-specific view bindings need extension. No shared learner-flow redesign is justified.

---

## 3｜B topology delta

B cannot legally be compiled by pretending it looks like A1/A2/A3.

### Existing A adapter assumes

```text
stable Block ID like circulation-b01 / respiratory-r01 / urinary-b01
canonical Markdown under systems/<system>/blocks/*.md
Logic Group identity/ranges in system.json#logic_index
```

### Accepted B truth is

```text
stable Blocks = D1–D23 / M1–M10 / G1–G5
canonical Markdown under:
  d-d1-d23/
  m-m1-m10/
  g-g1-g5/
accepted Logic Groups = B Learning owner blocks.<ID>.logic_groups
accepted learner order = B Learning owner blocks.<ID>.learner_order
```

`system.json` explicitly does not own an accepted B `logic_index`. Projection must therefore consume Learning-owned LG semantics. **Do not synthesize `system.logic_index`.**

---

## 4｜Shared validator adapter decision

The shared validator should remain one validator, with a bounded B owner adapter.

### Canonical Block resolution

For B only:

```text
D* → d-d1-d23/*.md
M* → m-m1-m10/*.md
G* → g-g1-g5/*.md
```

Resolution must require exact stable Block identity from frontmatter / exact canonical filename and preserve the already-accepted 600 KP substrate. No fuzzy search.

### Logic Group resolution

For B only, validator owner construction resolves:

```text
learning_source
→ blocks.<block_id>.learner_order
→ blocks.<block_id>.logic_groups
```

Requirements:

- every learner-order ID exists exactly once;
- every group has exact `[start,end]` KP range, label, goal and closure;
- ranges cover the canonical Block KP set exactly once;
- G5 non-file order remains legal because identity and learner order are distinct.

A1/A2/A3 continue using their existing `system.logic_index` path unchanged.

### Safe Logic Map

B `logic_groups` contains answer-bearing goal/closure fields and must never be bound as a neutral Recall-front map.

Add a generic Projection owner reference:

```text
OWNER_REF / LOGIC_GROUP_SET
→ returns only accepted [{id,label}] for the owning Block
```

Use that safe label map for navigation and protected Block Recall scaffolding. Full `logic_groups` remains Learning support for ORIENT / GROUP_CLOSURE / revealed states only.

This also gives future Systems a safe non-duplicated LG map without inventing a second semantic owner.

---

## 5｜B SystemProjection calibration

### Sources

```text
SYSTEM_CORE       → B system.json
LEARNING_SUPPORT  → accepted B Learning owner
```

Both use `RESOLVE_BINDING` freshness because the asset stores exact structured bindings rather than copied medical text.

### System Guide objects

| Object | Role | Geometry | Current binding |
|---|---|---|---|
| mission | PROBLEM | TEXT_STRUCTURE | `system.json#/mission` |
| mother model | MAP | SEQUENCE | `system.json#/mental_model/mother_model` |
| spine | MAP | SEQUENCE | `system.json#/mental_model/spine` |
| parallel controls | MAP | NETWORK | `system.json#/mental_model/parallel_controls` |
| variables | MAP | AXES | `system.json#/core_variables` |
| core relations | MAP | NETWORK | `system.json#/core_relations` |
| Failure Modes | MAP | NETWORK | `system.json#/failure_modes` |
| judgment axes | COMPARE | AXES | `system.json#/judgment_axes` |
| canonical Block labels | MAP | NETWORK | `system.json#/block_route` |
| accepted default learner route | MAP | SEQUENCE | `learning#/system_route/default_route` |

`dependency_dag` is backend/reference support, not a required permanent learner panel. It may be used only when a later reviewed representation materially helps the selected route context.

### PSR view

B adds an optional view/state:

```text
PARTIAL_SYSTEM_RECONSTRUCTION
```

It binds the accepted `system_route.partial_system_reconstructions` but does **not** appear in `SYSTEM_GUIDE` by default.

Runtime later selects an exact eligible checkpoint; Projection must not turn all six PSRs into a permanent progress dashboard.

### System Recall safety

B's `system.json#/system_recall/target` is answer-bearing enough that it must **not** be used as the protected neutral front.

Projection should support a shared generic neutral System-Recall instruction at renderer level (for example, attempt reconstruction before Reveal) without authoring B medical content. The B asset's `SYSTEM_RECALL_FRONT` therefore carries no B answer-bearing object; the shared renderer later supplies the generic attempt instruction.

`SYSTEM_RECALL_REVEAL` may then expose the accepted final reconstruction support from the B Learning owner plus canonical System objects.

This is a Projection-safety adapter, not an L change.

---

## 6｜Baseline B BlockProjection

Every B Block gets one durable BlockProjection.

### Sources

```text
SYSTEM_CORE      → B system.json
LEARNING_SUPPORT → accepted B Learning owner
```

Baseline B Projection does **not** copy a shortened medical Core and does not place the entire canonical Block Markdown into first-view orientation.

### Learning support

Each Block binds exactly:

```text
first_pass_focus
stop_line
recall_spine
logic_groups
```

`learner_order` remains available through the accepted Learning owner / adapter for LG sequencing. `readiness` relations remain backend-only under the accepted L surface contract.

### Baseline objects

```text
problem        → BLOCK CENTER_QUESTION
recall spine   → Learning recall_spine
safe Logic Map → OWNER_REF LOGIC_GROUP_SET (ids + labels only)
```

The canonical Block owner remains authoritative and resolvable for KP Reveal / repair, but the whole document is **not** a default `BLOCK_ORIENT` object for B.

Full LG goal/closure remains Learning support, not a neutral-map payload.

### BLOCK_ORIENT

Default B orientation exposes only what the current cognitive action needs:

```text
center problem
+ first_pass_focus
+ stop_line / bounded current scope
+ safe LG map
+ any explicitly reviewed Current orientation object added later
```

It must not become a second continuous Lecture.

### Other views

```text
LOGIC_GROUP_ORIENT
EXTERNAL_HANDOFF
KP_RECALL_FRONT
KP_RECALL_REVEAL
GROUP_CLOSURE
BLOCK_RECALL_FRONT
BLOCK_RECALL_REVEAL
```

The accepted Xizong Block Workspace behavior is preserved. `KP_RECALL_REVEAL` continues to resolve the **complete canonical Current KP Core**; semantic completeness is preserved without front-loading the whole Block document before learning.

---

## 7｜Heterogeneous calibration pressure test

The baseline/multi-object schema was challenged against seven unlike B Blocks.

### D1｜normal mechanism/control

Needs causal sequence + control comparison + molecular execution. Current focus/stop/LG map are sufficient for bounded orientation; actual teaching stays in the original Lecture, and complete Current Core returns after Recall Reveal. **PASS.**

### M2｜biochemical energy-flow

Needs carbon flow / reducing equivalents / electron-proton-ATP coordination and later failure localization. Chain/network/formula-capable schema is sufficient; no new medical fragment is required merely to draw it. **PASS.**

### D8｜large clinical decision Block

Needs distinct acute crisis, chronic injury, diagnosis/function and treatment-decision objects. Multi-object Block rule prevents one giant generic shape. Whole-LG handoff prevents reading 25 KP as isolated cards. The whole long D8 Markdown must not become the Mac primary reader. **PASS.**

### D15｜anatomic/surgical decision + true boundaries

Current LG structure includes a perioperative singleton, left/right colon decision, rectal sphincter decision, molecular island, dentate-line coordinate and anorectal discrimination. Safe LG labels can remain navigation while goal/closure is timing-gated. **PASS.**

### D19｜biliary localization / emergency / tumor mix

Nine LGs must not become one sequence. Projection can alternate foundation / procedure map / benign-inflammatory / Tumor-Gate / emergency / localization objects within one Block workspace. **PASS.**

### D21｜endocrine function × structure × surgery

The central model requires simultaneous function axis, morphology axis, evidence axis, intervention and safety. Shared Block shell plus local multi-object geometry supports this without making the System-wide renderer thyroid-specific or turning the 29-KP Markdown into a competing Lecture. **PASS.**

### G5｜learner-order exception

Projection must follow `learner_order = KP01–05 → KP12–13 → KP06–11`, not stable/file order. Binding to Learning-owned LG order directly preserves this. **PASS.**

### Calibration conclusion

No B Block forces a new Projection schema or a new learner hierarchy. The existing schema is semantically sufficient once B owner resolution, B orientation composition and neutral-map/front safety are extended.

---

## 8｜Atomic landing rule

Do not land partial B `.projection.json` files under `content/xizong/projection/` before the shared manifest/validator can account for them.

The full compile should land together:

```text
shared validator adapter
+ test extensions
+ B system.projection.json
+ 38 B block projection files
+ manifest eligibility / systems / coverage update
+ compilation receipt
```

Expected post-compile physical coverage:

```text
Systems = 4
Blocks = 76
Projection assets = 80
Canonical KP identities represented by the shared validator = 1405
  existing A1/A2/A3 = 805
  B                  = 600
```

A failing B asset must not silently downgrade or remove a previously passing A asset.

---

## 9｜P0 / P1 verdict

```text
P0 authority + adapter audit                 PASS
P1 System / heterogeneous Block calibration  PASS
P2 atomic full compile                        ACTIVE NEXT
P3 validator + adversarial closure coupled to P2 landing
P4 fresh P acceptance                         FROZEN
```

No K/L reopen is justified. The next legal action is the atomic B asset compile against this calibrated B-specific Projection boundary.