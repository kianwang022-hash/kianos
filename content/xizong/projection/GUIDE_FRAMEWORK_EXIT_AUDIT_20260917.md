# Xizong Guide / Framework Content Exit Audit — 2026-09-17

Status: **CURRENT AUDIT RECEIPT · CONTENT / LEARNER-OBJECT BOUNDARY ONLY**  
Initial base audited: `main@f62ced438c958806d032ec06d4024008872910d8`  
Post-asset-closure recheck: `main@b6d907274fa770a46a97302b5894996021345dd8` after PR #314  
Systems in scope: **A1 / A2 / A3 / B**  
Runtime / DOM changes: **NONE in this lane**

## 1｜Question

This audit answers one narrow question:

> Current System / Block content already owns useful Beginner Guide, Framework, MI-G, MI-D and Memory Routing semantics. Are those semantics Current-resolvable without reviving retired Guide authority, and which of them already survive into the Current learner-object path?

It does **not** judge final UI quality and does not authorize Runtime implementation.

---

## 2｜Current owners inspected

Content / learning:

- A1 / A2 / A3 / B Current `system.json`;
- corresponding System `*-learning.json`;
- canonical Block Markdown;
- `content/xizong/knowledge/learner/shared-fields.json`;
- `content/xizong/knowledge/manifest.json`;
- new Current `guide-bindings.json`;
- new `BEGINNER_GUIDE_CONTRACT.md`;
- new `BLOCK_PREENTRY_CONTENT_CONTRACT.md`.

Projection / learner-object:

- `content/xizong/projection/PROJECTION_CONTRACT.md`;
- representative compiled System / Block Projections;
- `static-web/src/lib/xizongSemanticAdapter.mjs`;
- after PR #314: `content/xizong/LEARNER_OBJECT_CONTRACT.md`;
- after PR #314: `static-web/src/lib/xizongLearnerObject.mjs`.

Historical provenance was bounded to the last full pre-retirement System Guide for A1 / A2 / A3 / B and used only to recover re-verified explanation patterns.

This is an **exit audit**, not a claim that every compiled Block contains identical Framework / Memory sections. Absence must remain absence; no placeholder content may be invented for symmetry.

---

## 3｜Final top-line result after PR #314

| Content job | Current content state | Current learner-object / Projection state | Final lane result |
|---|---|---|---|
| System Beginner Guide explanation | Restored for A1 / A2 / A3 / B | `LEARNER_OBJECT_CONTRACT.md` recognizes Guide as a learner surface, but runtime does not yet resolve these prose assets | **CONTENT CLOSED · RESOLVER ADOPTION OPEN** |
| Current Guide path resolution | `guide-bindings.json` is explicit Current resolver | old `shared-fields.system_fields.*.guide_path` cannot override migrated systems | **CLOSED** |
| Block Framework | Explicit canonical content where present | PR #314 now has a Block `framework` object, but current runtime fields are only `centerQuestion / firstPassFocus / stopLine / recallSpine / cognitiveProjection`; explicit canonical `总 Framework` is not yet a normalized field | **CONTENT CONTRACT CLOSED · TYPED INGESTION OPEN** |
| MI-G | Explicit canonical content where present | no named learner-object field | **CONTENT CONTRACT CLOSED · TYPED INGESTION OPEN** |
| MI-D | Explicit canonical content where present | no named learner-object field | **CONTENT CONTRACT CLOSED · TYPED INGESTION OPEN** |
| Memory Routing | Explicit canonical content where present | no first-class learner-object object today | **CONTENT CONTRACT CLOSED · TYPED INGESTION OPEN** |
| Recall spine | System learning owner | normalized into Block `framework` | **SURVIVES** |
| Logic Groups / closure | System learning owner | normalized into learner object | **SURVIVES** |
| Prompt / Core / Source / Outline / Precision / Visual / Extension / Connection | Current owners | unified by PR #314 learner object | **SURVIVES UNDER CURRENT LEARNER OBJECT** |

The important distinction is now:

```text
content ownership / path resolution
≠
learner-object typed ingestion
≠
UI rendering
```

PR #314 closed the general learner-object composition problem. This lane closes the missing **Guide + Block pre-entry content semantics** that the generic learner object does not yet ingest as first-class fields.

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

### Resolver defect found

`knowledge/learner/shared-fields.json` still contains legacy `system_fields.*.guide_path` values pointing to retired `system-guides/**` files for the migrated systems.

The current runtime does not consume that field as its Guide resolver, so this was not a demonstrated live Runtime bug. It was still a real Current metadata-resolution hazard.

### Resolution

`knowledge/learner/guide-bindings.json` now explicitly resolves:

```text
A1 / A2 / A3 / B
→ learner/*-guide.md
```

and `knowledge/manifest.json` registers this file as the Current explanatory Guide resolver.

For those explicitly migrated systems, a legacy `shared-fields.system_fields.*.guide_path` value is historical projection metadata and **MUST NOT** override the Current binding.

C / D / E / F are intentionally not rebound by symmetry; they retain their own Current / transitional resolution.

---

## 5｜Block Framework evidence and Current learner-object gap

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

After PR #314, the learner object now exposes a Block `framework` container. However the current runtime implementation only normalizes:

```text
centerQuestion
firstPassFocus
stopLine
recallSpine
cognitiveProjection
```

It does **not** yet parse canonical Block Markdown to populate the explicit answer-bearing `总 Framework` as a typed field.

Verdict:

> Framework now has a learner-object home, but canonical Framework content still lacks typed ingestion.

`BLOCK_PREENTRY_CONTENT_CONTRACT.md` defines the content-side extraction boundary. A future resolver change may consume it; this lane deliberately does not change Runtime.

---

## 6｜MI-G / MI-D / Memory Routing evidence and Current learner-object gap

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

Neither the pre-#314 shared adapter nor the post-#314 learner-object implementation currently has first-class:

```text
memory_routing
mi_g
mi_d
```

fields.

Therefore:

- `MI-G` cannot truthfully be reconstructed from generic importance / Precision / visual emphasis;
- `MI-D` cannot truthfully be reconstructed from every threshold / list / number;
- personal Memory scheduling must remain separate from this content routing decision.

Verdict:

> The remaining gap is typed ingestion, not UI decoration and not missing medical prose.

---

## 7｜Current content-side interface

The stable content handoff is:

```text
system_guide
  guide_binding
  guide_asset
  authority_boundary

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

1. canonical System / Block owners remain medical authority;
2. explicit marker / semantic heading may be resolved;
3. ambiguous prose fails closed;
4. no inference from importance, typography, exam yield or “looks like Precision”;
5. missing Framework / MI-G / MI-D / Memory Routing remains absent;
6. output must retain canonical provenance;
7. no Weak / due / interval / rating / personal-history state enters this content contract;
8. learner-object / Runtime may consume these fields but may not invent them.

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
- documented and closed the legacy `guide_path` precedence ambiguity.

### Deliberately unchanged

- no `static-web` Runtime behavior;
- no DOM / component / CSS;
- no learner state or scheduler;
- no Source-contact cadence;
- no mass rewrite of canonical Block Core;
- no inference / auto-authoring of MI-G or MI-D;
- no claim that all Blocks contain all pre-entry jobs.

---

## 9｜Integration status with PR #314

PR #314 has already landed on `main` and now owns the generic learner-object composition for:

```text
Prompt / Core / Source / Outline
Precision / Visual / Extension / Connection
Logic Group composition
Recall answer protection
Block framework container
```

This branch does **not** duplicate or replace that work.

Instead, it supplies two Current content interfaces that the existing learner-object may consume in a later implementation change:

```text
guide-bindings.json
BLOCK_PREENTRY_CONTENT_CONTRACT.md
```

The remaining implementation work is therefore narrowly scoped:

```text
existing learner-object resolver
+ Current Guide binding
+ explicit canonical Framework extraction
+ explicit MI-G / MI-D / Memory Routing extraction
```

No new semantic authority is required.

---

## 10｜Conclusion

The original “Guide / Framework 缺口” is closed for this content lane:

1. **Beginner explanation gap** — closed for A1 / A2 / A3 / B.
2. **Guide resolver gap** — closed through explicit Current bindings; migrated systems cannot resolve back to retired Guides.
3. **Block pre-entry semantic definition gap** — closed through explicit Framework / MI-G / MI-D / Memory Routing content and provenance rules.
4. **Generic learner-object composition gap** — already closed separately by PR #314.
5. **Typed learner-object ingestion of these newly formalized Guide / pre-entry fields** — intentionally remains an implementation follow-up outside this content-only lane.

This branch has no further content task. It should be merged once CI is green.
