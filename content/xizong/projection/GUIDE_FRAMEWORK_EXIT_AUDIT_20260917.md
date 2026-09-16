# Xizong Guide / Framework Content Exit Audit — 2026-09-17

Status: **CURRENT AUDIT RECEIPT · CONTENT / PROJECTION BOUNDARY ONLY**  
Initial base audited: `main@f62ced438c958806d032ec06d4024008872910d8`  
Systems in scope: **A1 / A2 / A3 / B**  
Runtime / DOM changes: **NONE in this lane**

## 1｜Question

This audit answers one narrow question:

> Current System / Block content已经拥有的 Beginner Guide、Framework、MI-G、MI-D、Memory Routing，是否有清楚、不会回退到旧 authority 的内容出口，并且进入 Projection / shared semantic adapter 时能否稳定存活？

It does **not** judge final UI quality and does not authorize Runtime implementation.

---

## 2｜Owners inspected

Current content / learning:

- A1 / A2 / A3 / B Current `system.json`;
- corresponding System `*-learning.json`;
- canonical Block Markdown;
- `content/xizong/knowledge/learner/shared-fields.json`;
- `content/xizong/knowledge/manifest.json`.

Projection / adapter:

- `content/xizong/projection/PROJECTION_CONTRACT.md`;
- A1 B1 calibration Projection;
- representative A1 / A2 / A3 baseline Block Projections;
- representative B baseline Projection;
- `static-web/src/lib/xizongSemanticAdapter.mjs`.

Historical provenance was bounded to the last full pre-retirement System Guide for A1 / A2 / A3 / B and used only to recover re-verified explanation patterns.

This is an **exit audit**, not a claim that every compiled Block contains identical Framework / Memory sections. Absence must remain absence; no placeholder content may be invented for symmetry.

---

## 3｜Final top-line result

| Content job | Current content state | Shared / Projection exit | Final lane result |
|---|---|---|---|
| System Beginner Guide explanation | Restored for A1 / A2 / A3 / B | Current Projection does not yet consume prose Guide asset | **CONTENT CLOSED · RUNTIME ADOPTION PENDING** |
| Current Guide path resolution | `guide-bindings.json` is explicit Current resolver | old `shared-fields.system_fields.*.guide_path` can no longer win for migrated systems | **CLOSED** |
| Block Framework | Explicit canonical content where present | calibration can preserve it; baseline shared exit inconsistent | **CONTENT CONTRACT CLOSED · PROJECTION PENDING** |
| MI-G | Explicit canonical content where present | no named shared-adapter field today | **CONTENT CONTRACT CLOSED · PROJECTION PENDING** |
| MI-D | Explicit canonical content where present | no named shared-adapter field today | **CONTENT CONTRACT CLOSED · PROJECTION PENDING** |
| Memory Routing | Explicit canonical content where present | no first-class normalized object today | **CONTENT CONTRACT CLOSED · PROJECTION PENDING** |
| Recall spine | System learning owner | normalized today | **SURVIVES** |
| Logic Groups / closure | System learning owner | normalized today | **SURVIVES** |
| Precision / Visual / Extension | selective Current support | explicit optional channels exist | **SURVIVES WHEN CURRENT-OWNED** |

The important distinction is now explicit:

```text
content ownership / resolution
≠
Projection adoption
≠
Runtime rendering
```

This lane closes the first layer only.

---

## 4｜System Beginner Guide closure

A1 / A2 / A3 / B retired their old `system-guides/` authority correctly, but useful beginner explanation disappeared with it.

This branch restores the explanation layer as Current learner support:

- `knowledge/learner/BEGINNER_GUIDE_CONTRACT.md`
- `knowledge/learner/a1-circulation-guide.md`
- `knowledge/learner/a2-respiratory-guide.md`
- `knowledge/learner/a3-urinary-guide.md`
- `knowledge/learner/b-digestive-metabolic-endocrine-tumor-guide.md`

These assets explain accepted Current structure. They do not own medical Core, Source cadence, Block/KP identity or personal learner state.

### Hidden resolver defect found during continuation

`knowledge/learner/shared-fields.json` still contains legacy `system_fields.*.guide_path` values pointing to retired `system-guides/**` files for the migrated systems.

The current shared semantic adapter does not presently read `guide_path`, so this was not a demonstrated Runtime bug. It **was** a real Current metadata-resolution hazard: a future consumer could incorrectly route A1 / A2 / A3 / B back to retired Guide paths.

### Resolution

Added:

- `knowledge/learner/guide-bindings.json`

and registered it in:

- `knowledge/manifest.json`
- `knowledge/learner/README.md`
- `knowledge/learner/BEGINNER_GUIDE_CONTRACT.md`

Current resolution is now:

```text
A1 / A2 / A3 / B
→ guide-bindings.json
→ learner/*-guide.md
```

For those explicitly migrated systems, a legacy `shared-fields.system_fields.*.guide_path` value is historical projection metadata and **MUST NOT** override the Current binding.

C / D / E / F are intentionally not rebound by symmetry; they retain their own Current / transitional resolution.

This avoids rewriting a large mixed-purpose `shared-fields.json` merely to erase historical provenance while still closing the Current resolver ambiguity.

---

## 5｜Block Framework evidence and gap

Canonical Block Markdown can explicitly own answer-bearing pre-entry maps such as:

- center question;
- mechanism spine;
- formula / variable language;
- `总 Framework`;
- comparison coordinate / decision structure.

Representative Current evidence was verified across all four migrated systems:

- A1 first Block: explicit `总 Framework`;
- A2 first Block: explicit `总 Framework`;
- A3 first Block: explicit `总 Framework` plus a `kianos:framework` marker;
- B `D1`: explicit `总 Framework`.

Projection evidence remains asymmetric:

- A1 B1 calibration explicitly preserves Framework;
- representative ordinary A1 / A2 / A3 baseline assets do not expose a named Framework object;
- representative B baseline is even thinner and lacks the generic Guide object seen in A-system baselines;
- `xizongSemanticAdapter.mjs` does not read canonical Block Markdown or normalize Framework.

Verdict:

> Framework is real Current content, but generic Projection / adapter survival is not yet guaranteed.

Content extraction semantics are now owned by:

- `knowledge/learner/BLOCK_PREENTRY_CONTENT_CONTRACT.md`

A downstream compiler must preserve explicit Framework and preserve absence when none exists.

---

## 6｜MI-G / MI-D / Memory Routing evidence and gap

Representative canonical Blocks from A1 / A2 / A3 / B contain explicit Memory Routing structure.

The semantic distinction is:

```text
MI-G
= explicit gating memory
= missing / unstable → blocks continued understanding or retrieval

MI-D
= explicit deferrable exact memory
= still retain, but may leave the immediate mechanism gate

Memory Routing
= Block-owned G/D content decision
≠ learner review schedule
```

Current baseline Projection / shared adapter has no first-class:

```text
memory_routing
mi_g
mi_d
```

input or normalized output.

The adapter's generic `attention.canDefer` therefore cannot truthfully recover Block-owned MI-D today, and its carry-now path cannot truthfully recover explicit MI-G merely from existing learning fields.

Verdict:

> The semantic loss occurs **before** UI rendering. Adding labels/cards alone cannot fix it.

The new `BLOCK_PREENTRY_CONTENT_CONTRACT.md` defines the content-side handoff without implementing the parser.

---

## 7｜Current content-side contract

For downstream asset closure, the stable jobs are now:

```text
block_preentry
  framework
    present / absent
    owner_path
    anchor
    content_or_ref

  memory_routing
    present / absent
    owner_path
    anchor
    mi_g[]
    mi_d[]
```

Hard rules:

1. canonical Block Markdown remains medical owner;
2. explicit marker / semantic heading may be resolved;
3. ambiguous prose fails closed;
4. no inference from importance, typography, exam yield or “looks like Precision”;
5. missing Framework / MI-G / MI-D / Memory Routing remains absent;
6. output must retain canonical provenance;
7. no Weak / due / interval / rating / personal-history state enters this content contract.

---

## 8｜What this lane changed

### Current content assets

- restored A1 Beginner Guide;
- restored A2 Beginner Guide;
- restored A3 Beginner Guide;
- restored B Beginner Guide;
- defined Beginner Guide authority / provenance contract;
- added Current machine-readable Guide path bindings;
- defined Block pre-entry Framework / Memory Routing content contract;
- registered the new Current support owners in the knowledge manifest;
- documented the hidden legacy `guide_path` precedence defect and closed it through explicit Current resolution.

### Deliberately unchanged

- no `static-web` Runtime behavior;
- no DOM / component / CSS;
- no learner state or scheduler;
- no Source-contact cadence;
- no mass rewrite of canonical Block Core;
- no inference / auto-authoring of MI-G or MI-D;
- no Projection recompile;
- no claim that all Blocks contain all pre-entry jobs.

---

## 9｜Required handoff to asset-closure / learner-object lane

The downstream lane should implement, not redefine, these semantics:

### Guide

```text
guide-bindings.json resolves a Current Guide
→ expose it as System explanation support
→ system.json / learning / Block Core remain authority
```

### Framework

```text
explicit Current Framework exists
→ first-class answer-bearing orientation object

absent
→ no placeholder
```

### MI-G

```text
explicit Current MI-G exists
→ named gating / carry-now support
→ preserve owner provenance
```

### MI-D

```text
explicit Current MI-D exists
→ named deferrable exact-memory support
→ may feed canDefer
→ does not itself schedule review
```

### Memory Routing

```text
explicit Current routing exists
→ preserve G / D split

absent
→ null / absent
```

---

## 10｜Conclusion

The original “Guide / Framework 缺口” is now decomposed cleanly:

1. **Beginner explanation gap** — content restored for A1 / A2 / A3 / B.
2. **Guide resolver gap** — explicit Current binding added; migrated systems cannot resolve back to retired Guides through stale metadata.
3. **Block pre-entry semantic gap** — Framework / MI-G / MI-D / Memory Routing now have an explicit content contract and provenance boundary.
4. **Projection / Runtime adoption gap** — still open by design and belongs to the separate asset-closure / Runtime implementation lane.

So this lane no longer needs to solve the problem by adding more prose or more UI. Its remaining useful work is content verification / coverage, while implementation should consume these contracts elsewhere.
