# Politics UI Review Protocol — explicit Surface Mapping first

Status: **CURRENT DESIGN / IMPLEMENTATION SAFETY PROTOCOL**  
Scope: learner-facing Politics UI implementation / product optimization  
Learning authority: `content/politics/LEARNING_CONTRACT.md`  
Interaction authority: `content/politics/INTERACTION_CONTRACT.md`  
Representation authority: `content/politics/SURFACE_MAPPING_CONTRACT.md`  
Product owner: `static-web/POLITICS_PRODUCT_BRIEF.md`  

This protocol does not own Politics knowledge, Learning Logic, Question Truth, Runtime semantics, Evidence semantics, learner progress, or new semantic design.

Its hard rule is:

> **Politics UI starts from the resolved explicit Surface Mapping. The renderer may optimize presentation, but it may not rediscover or invent Politics semantics from Projection shape names, raw fields, old geometry metadata, or DOM structure.**

## 1 | Accepted product chain

```text
Current Politics Content / Learning Logic
→ Projection selects exact Current owners / refs
→ explicit Surface Mapping owns learner composition
→ resolved surfacePlan.states[state]
→ existing Runtime / Evidence / Repair / Return
→ bounded Mac-wide UI implementation
```

Not:

```text
raw chapter JSON / projection_shape / representation.kind
→ renderer guesses cognitive geometry
→ learner relation appears
```

All five Politics subjects are already accepted through `S/K/L/P/R/E`; `U` remains learner-only. A normal UI change does not reopen those gates.

## 2 | Whole learner loop before local optimization

Before changing a Politics learner surface, reconstruct the relevant live loop:

```text
Politics Home / meaningful Continue
→ subject / chapter / current Natural Unit orientation
→ Chengfeng continuous study on original iPad / MarginNote
→ return / optional close
→ Xiao1000 clean verification
→ stable correct → continue cheaply
   OR Wrong / meaningful Uncertain
   → smallest sufficient repair
   → owning source / Chat when earned
   → exact Return
→ next question / Unit / meaningful Resume
```

Do not optimize one panel in isolation if the change can break source ownership, Natural Unit identity, clean-attempt protection, Evidence, Repair provenance, Return, or private learner state.

## 3 | Representation ownership

For mapped PASS owners, Surface Mapping owns:

- which objects appear together;
- semantic relation type;
- learner-visible relation text when it is part of knowledge;
- primary / companion / support / handoff / repair / closure grouping;
- learner payload for `ORIENT / EXTERNAL_LEARN / CLOSE / REPAIR / CONTINUE`.

Accepted primitives:

```text
STATEMENT
PARALLEL_SET
RELATION_SET
DIRECTED_SEQUENCE
TIMELINE
COMPARE
HIERARCHY
```

Directed transition modes:

```text
LABELED_RELATION → visible relation text is owned content
ORDER_ONLY       → direction/order only; UI invents no connector prose
```

Runtime / UI owns only timing, trigger, interaction shell, responsive arrangement, typography, spacing, alignment, borders, colors and other visual implementation.

### Forbidden downstream reconstruction

Once an owner has explicit mapping, Runtime/UI must not repopulate learner payload from:

- `projection_shape`;
- `representation.kind`;
- generic `Map / Chain / topology / edges` metadata;
- raw teaching fields;
- legacy hierarchy / handoff / closure objects;
- rendered DOM;
- field names that merely sound causal, hierarchical or chronological.

If a mapped surface is semantically insufficient, reopen the earliest responsible Surface Mapping owner. Do not patch meaning into the renderer.

## 4 | Four-way UI audit

Before a material UI change, classify the existing learner-facing element as one of:

### `KEEP`

Behavior and semantic payload are already correct and must survive materially unchanged.

Typical examples: Chengfeng handoff, one active Natural Unit, clean Xiao1000 attempt, stable-correct fast path, Wrong/Uncertain repair admission, exact Return and first-attempt preservation.

### `OPTIMIZE`

Mapped payload and behavior are fixed; visual treatment can improve with zero semantic diff.

Allowed examples:

- wider layout for a mapped `PARALLEL_SET`;
- clearer hierarchy for mapped `HIERARCHY`;
- better spacing around mapped `RELATION_SET`;
- responsive stacking for a mapped `DIRECTED_SEQUENCE`;
- stronger readable treatment for mapped relation text;
- demoting chrome without moving or hiding owned learner content.

`OPTIMIZE` may not change relation type, grouping, state payload, learning order, evidence meaning or source ownership.

### `RESTORE_FROM_SURFACE_MAPPING`

The resolved Surface Mapping already owns learner content, but the UI drops it, hides it unnecessarily, duplicates it, or replaces it with legacy payload.

Restoration source:

```text
content/politics/projection/<subject>/<chapter>.projection.json
→ exact surface_mapping owner
→ resolved surfacePlan.states[state]
```

The renderer restores that resolved plan exactly; it does not reinterpret raw Projection geometry.

Historical text using `RESTORE_FROM_PROJECTION` should now be read narrowly as this case only. It does **not** authorize shape inference from Projection metadata.

### `DEMOTE`

A legitimate element should not compete with the current learner action: engineering metadata, counts, deep provenance, implementation state labels, repeated architecture explanation, or later-phase material shown too early.

Demotion changes prominence/timing only. It may not demote owned relation text or other mapped learner content into decorative microcopy.

## 5 | Protected behaviors

### Surface ownership

```text
Suyi       framework / orientation / exactness cross-check input
Chengfeng  continuous first-round mainline on original iPad / MarginNote
Xiao1000   verification / transfer evidence in Astro
KianOS     orientation / selective cognition / verification / repair companion
Chat       adaptive semantic repair when earned
```

`Source ownership ≠ Surface ownership.` Astro must not become a second continuous Chengfeng reader.

### State chain

```text
ORIENT
→ EXTERNAL_LEARN
→ RETURN / CLOSE
→ VERIFY
→ stable correct → CONTINUE
→ Wrong / Uncertain → REPAIR → VERIFY or CONTINUE
```

Mapped state payload comes from the resolved Surface Mapping. State timing and trigger remain Runtime concerns.

### Repair single writer

Mapped `REPAIR` is the only learner-content writer for repair payload. Question/Evidence logic decides when Repair opens; it may not author a second explanation.

### Xiao1000 Workbench

The accepted Workbench remains protected. UI work may modernize appearance and exact Current binding but must not add a new mandatory diagnosis/structure ritual, leak answers before submission, overwrite first-attempt evidence, or break exact Return.

## 6 | Subject differences without renderer inference

The five subjects should not collapse into one generic visual template. But subject-specific expression now emerges from **owned mapped primitives and content**, not from a renderer table keyed by subject or `projection_shape`.

Examples:

- Marxism may resolve to relation sets, directed reasoning sequences, comparisons or parallel conditions;
- History may resolve to timelines, hierarchy, directed order or parallel causal factors;
- Mao may resolve to theory-response relations, statements, comparisons or ordered development;
- Xi may resolve to hierarchy, identity statements, parallel requirements or strategic order;
- Ethics-Law may resolve to comparisons, concept boundaries, relation sets or situational statements.

These are outcomes of exact mappings. They are not permissions for the UI to guess a shape from subject identity.

## 7 | Required read path

For ordinary Politics UI implementation/review:

```text
1. content/politics/CURRENT.md
2. content/politics/SURFACE_MAPPING_CONTRACT.md
3. static-web/POLITICS_PRODUCT_BRIEF.md
4. this POLITICS_UI_REVIEW_PROTOCOL.md
5. content/politics/LEARNING_CONTRACT.md
6. content/politics/INTERACTION_CONTRACT.md
7. exact chapter Projection owner
8. exact mapped state(s) / resolved surfacePlan
9. existing Runtime / Evidence / Repair / Return implementation touched
10. relevant visual preference / presentation rules
```

Do not start from raw chapter JSON or Legacy archaeology.

## 8 | Global-impact check

Before accepting a local change, check internally:

```text
Learning Logic impact              none / named
Surface Mapping impact             none / named
Mapped-state payload impact        none / named
Runtime gating impact              none / named
Evidence impact                    none / named
Repair / Return impact             none / named
Chengfeng surface impact           none / named
Xiao1000 clean-attempt impact      none / named
Private learner-state impact       none / named
```

If a non-trivial semantic impact appears, stop treating the task as visual optimization and reopen the correct upstream owner.

## 9 | Acceptance order

```text
A. locate the surface in the whole learner loop
B. identify exact mapped owner/state
C. KEEP / OPTIMIZE / RESTORE_FROM_SURFACE_MAPPING / DEMOTE
D. implement bounded visual/product change
E. verify upstream/downstream behavior
F. run representative browser journey
G. review real Mac-wide / responsive geometry
H. accept only with zero semantic diff
```

A good-looking screenshot is not sufficient evidence.

## 10 | Compact rule

> **政治 UI 只消费已经解析好的 Surface Mapping：关系是什么、哪些内容一起出现、关系文字是否直接可见、每个 state 展示什么，都在 UI 之前决定。UI 可以让它更清楚、更宽、更顺眼，但不能重新猜。**
