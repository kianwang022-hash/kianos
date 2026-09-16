# Xizong Guide / Framework Content Exit Audit — 2026-09-17

Status: **CURRENT AUDIT RECEIPT · CONTENT / PROJECTION BOUNDARY ONLY**  
Base audited: `main@f62ced438c958806d032ec06d4024008872910d8`  
Systems in scope: **A1 / A2 / A3 / B**  
Runtime / DOM changes: **NONE in this lane**

## 1｜Question

This audit answers one narrow question:

> Current Block / System content已经拥有的 Beginner Guide、Framework、MI-G、MI-D、Memory Routing，进入 Cognitive Projection / shared semantic adapter 时，到底有没有稳定出口？

It does **not** judge final UI quality and does not authorize Runtime implementation.

---

## 2｜Reference owners inspected

Current content / learning:

- `content/xizong/knowledge/systems/a1-circulation/system.json`
- `content/xizong/knowledge/systems/a2-respiratory/system.json`
- `content/xizong/knowledge/systems/a3-urinary/system.json`
- `content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/system.json`
- corresponding System `*-learning.json`
- representative canonical Block Markdown, including A1 B1 with explicit `总 Framework` + `Memory Routing / MI-G / MI-D`

Projection / adapter:

- `content/xizong/projection/PROJECTION_CONTRACT.md`
- A1 B1 calibration Projection
- A1 B2 baseline Projection
- A2 R2 baseline Projection
- A3 B2 baseline Projection
- B D2 baseline Projection
- `static-web/src/lib/xizongSemanticAdapter.mjs`

This is an **exit audit**, not a claim that every one of the 76 compiled Blocks contains identical Framework / Memory sections. Absence must remain absence; no placeholder content may be invented for symmetry.

---

## 3｜Top-line result

| Content job | Current content can own it? | Current Projection exit | Verdict |
|---|---|---|---|
| System Beginner Guide explanation | Yes — now restored as separate Current learner-support assets | Existing `SYSTEM_GUIDE` binds terse `system.json` fields only; new explanation asset not yet consumed | **CONTENT RESTORED · PROJECTION NOT YET ADOPTED** |
| Block Framework | Yes — explicit in canonical Block content where present | rich calibration Blocks may bind explicitly; baseline is inconsistent / opaque | **PARTIAL / UNSTABLE EXIT** |
| MI-G | Yes — explicit Block Memory Routing where present | no named Projection support key / shared adapter field | **EATEN AT SHARED EXIT** |
| MI-D | Yes — explicit Block Memory Routing where present | no named Projection support key; adapter `canDefer` is currently empty | **EATEN AT SHARED EXIT** |
| Memory Routing | Yes — Block-owned routing semantics where present | no first-class binding / object / normalized adapter field | **EATEN AT SHARED EXIT** |
| Recall spine | Yes — System-specific learning owner | explicit `learning_support.recall_spine`; normalized in adapter | **SURVIVES** |
| Logic Groups / closure | Yes — System-specific learning owner | explicit support + normalized adapter | **SURVIVES** |
| Precision / Visual / Extension | Selective optional Current support | adapter has explicit optional channels | **SURVIVES WHEN CURRENT-OWNED** |

---

## 4｜System Beginner Guide gap

### Before this lane

A1 / A2 / A3 / B old `system-guides/` files were correctly retired so they could not compete with Current System / Learning owners.

The side effect was that their useful **beginner explanation layer** disappeared together with the old authority.

Current System Projection already has a `SYSTEM_GUIDE` view, but that view directly binds structured fields such as:

```text
mission
mental_model.spine / parallel_controls
core_variables / core_relations
failure_modes
judgment_axes
block_route
```

Those fields are valid Current semantics, but they are intentionally compressed. They do not by themselves answer “why this model is cognitively useful” or “how a first-time learner should enter it”.

### Content remediation in this branch

Added:

- `knowledge/learner/BEGINNER_GUIDE_CONTRACT.md`
- `knowledge/learner/a1-circulation-guide.md`
- `knowledge/learner/a2-respiratory-guide.md`
- `knowledge/learner/a3-urinary-guide.md`
- `knowledge/learner/b-digestive-metabolic-endocrine-tumor-guide.md`

These are **derived explanation assets with no independent medical authority**. They use Current owners first and bounded last-pre-retirement Guide provenance only for re-verified explanation patterns.

### Projection verdict

`SYSTEM_GUIDE` is therefore no longer missing a content candidate, but current materialized SystemProjection assets do **not yet bind the new Beginner Guide explanation assets**.

This lane deliberately does not recompile / adopt Runtime.

---

## 5｜Block Framework exit

### Current content

Canonical Block Markdown can own explicit pre-learning structure such as:

- center question;
- mechanism spine;
- formula / variable language;
- `总 Framework`;
- decision coordinate / comparison structure;
- Block→next-Block handoff.

A1 B1 is a clear Current example: the Block owns a mechanism spine, formula language, explicit `总 Framework`, and later Memory Routing.

### Projection evidence

#### Rich calibration case

A1 B1 explicitly materializes:

```text
problem
mechanism spine
formula language
framework
```

and exposes all of them in `BLOCK_ORIENT`.

This proves the Projection grammar **can** preserve Framework when compiled deliberately.

#### A1 / A2 / A3 baseline cases

Ordinary baseline assets typically contain:

```text
problem
CANONICAL_GUIDE owner ref
recall spine
logic map
```

but they do not name a `FRAMEWORK` binding or medical-core source selector for the Framework.

That is weaker than the calibration representation: even if another resolver can recover some Guide text, the Framework's distinct cognitive job is not guaranteed as a structured Projection object.

#### B baseline case

Representative B baseline (`D2`) contains only:

```text
problem
recall spine
logic map
```

There is no `CANONICAL_GUIDE` object and no Framework binding in `BLOCK_ORIENT`.

### Shared adapter evidence

`xizongSemanticAdapter.mjs` currently builds each Block from:

```text
system route
learning first_pass_focus
stop_line
recall_spine
logic_groups
Precision / Visual cues
Extension refs
optional shared minimalModel
```

It does **not** load canonical Block Markdown or normalize a Framework field.

### Verdict

> **Framework is not globally absent, but it has no stable shared exit.**

Calibration Blocks can preserve it; ordinary baseline / shared adapter paths do not guarantee it.

Future content compile should bind an explicit Framework object **only when Current Block content owns one**. Do not synthesize one merely to make all Blocks symmetrical.

---

## 6｜MI-G exit

### Current meaning

Per `BEGINNER_GUIDE_CONTRACT.md`, MI-G is Current-owned **gating memory**: an explicit exact / compact item whose absence would obstruct continued understanding or retrieval.

### Current evidence

A1 B1 currently has an explicit `Memory Routing` section with a named `MI-G` list.

### Projection / adapter state

Baseline `learning_support` currently exposes only:

```text
first_pass_focus
stop_line
recall_spine
logic_groups
```

The shared adapter's `attention.carryNow` currently derives from:

```text
CURRENT_PROBLEM
optional MINIMAL_MODEL
```

It does not ingest `MI-G`.

### Verdict

> **MI-G exists in Current Block content where explicitly authored, but is eaten before the shared Projection / semantic-adapter exit.**

Future projection semantics should expose MI-G as **Current-owned carry-now / gating content**, not infer it from “important looking” KP text.

---

## 7｜MI-D exit

### Current meaning

MI-D is Current-owned **deferrable exact memory**: it still requires precise retention, but may leave the immediate mechanism gate and enter later memory handling.

### Projection / adapter state

There is no named MI-D binding in baseline Projection.

The shared adapter currently returns:

```text
attention.canDefer = []
```

regardless of Block-owned MI-D sections.

### Verdict

> **MI-D is currently eaten at the shared exit.**

This is not merely a missing UI label. The semantic adapter has no Current-owned input from which `canDefer` can be truthfully populated.

Future implementation must not auto-classify every Precision item, threshold, list or number as MI-D. Only Current explicit routing may populate it.

---

## 8｜Memory Routing exit

### Current meaning

Memory Routing is content semantics:

```text
which explicitly owned items gate continued learning now
vs
which explicitly owned items can move to deferred exact-memory handling
```

It is not personal review schedule, rating, due date, history or browser state.

### Current Projection state

No baseline BlockProjection currently has a first-class:

```text
memory_routing
mi_g
mi_d
```

binding / object / support key.

The shared semantic adapter likewise has no parser or normalized owner for this content.

### Verdict

> **Memory Routing is currently content-owned but Projection-unaddressed.**

That is the upstream reason MI-G / MI-D cannot survive into a generic learner object today.

---

## 9｜What this lane changes vs deliberately does not change

### Changed now

- restored Current Beginner Guide explanation content for A1 / A2 / A3 / B;
- defined a hard no-authority Beginner Guide contract;
- recorded bounded historical provenance rather than reviving old Guide files;
- made Framework / MI-G / MI-D / Memory Routing exit losses explicit and machine-team actionable.

### Not changed now

- no Block Runtime behavior;
- no DOM / component / CSS;
- no learner state / scheduler / Evidence semantics;
- no source-contact cadence;
- no mass rewrite of canonical Block Core;
- no automatic extraction or inference of MI-G / MI-D;
- no Projection recompile / manifest mutation merely to make this audit green.

---

## 10｜Required handoff for a later Projection / learner-object lane

A later content-to-Projection implementation should satisfy these rules:

### Framework

```text
Current explicit Framework exists
→ bind as first-class answer-bearing orientation object

Current explicit Framework absent
→ do not manufacture one
```

### MI-G

```text
Current explicit MI-G exists
→ expose as named gating / carry-now support
→ preserve exact owner identity / provenance
```

### MI-D

```text
Current explicit MI-D exists
→ expose as named deferrable exact-memory support
→ may feed canDefer semantics
→ must not itself create personal review schedule
```

### Memory Routing

```text
Current explicit routing exists
→ preserve G/D distinction as content semantics
→ Runtime may consume it later

No Current routing
→ null / absent, never inference
```

### Beginner Guide

```text
Current System Beginner Guide exists
→ eligible as SYSTEM_GUIDE explanation layer
→ must remain subordinate to system.json / learning / Block Core
```

---

## 11｜Audit conclusion

The historical problem is now separated into two distinct defects:

1. **System-level explanation content gap** — A1 / A2 / A3 / B lost useful first-pass explanation when legacy Guide authority was retired. This branch restores that content correctly under Current learner support.
2. **Block pre-asset exit gap** — Framework / MI-G / MI-D / Memory Routing can already exist in Current Block content, but the shared Projection / semantic-adapter path does not preserve them consistently.

The second defect should not be “fixed” by adding more UI cards. It requires a later content-resolution / Projection compile step that consumes explicit Current owners without inventing new truth.
