# Xizong Block Pre-entry Content Contract

Status: **CURRENT**  
Scope: explicit Block-owned `Framework / Memory Routing / MI-G / MI-D` content  
Parent authority: `content/xizong/LEARNING_CONTRACT.md`  
Medical Core owner: canonical Block Markdown under `content/xizong/knowledge/systems/**`  
Runtime adoption: **NOT CLAIMED**

## 1｜Why this contract exists

A canonical Block may already contain high-value material that belongs **before or around the first learning pass**, for example:

- a `总 Framework` / mechanism spine / comparison coordinate;
- a `Memory Routing` section;
- explicit `MI-G` gating memory;
- explicit `MI-D` deferrable exact memory.

Those jobs are different from the medical Core itself, but they are still Current content semantics. They must not disappear merely because a generic learner adapter currently reads only `first_pass_focus / stop_line / recall_spine / logic_groups`.

This contract defines how later content-resolution / Projection work may expose them without manufacturing new truth.

---

## 2｜Authority rule

The canonical Block Markdown remains the sole medical-content owner.

This layer may only **point to / extract / type** content that is explicit in the canonical Block owner. It may not:

- invent a Framework for visual symmetry;
- infer MI-G from importance, frequency, exam yield or typography;
- classify every number / threshold / list as MI-D;
- rewrite medical answers into a second owner;
- create personal mastery, due dates, review queues or scheduling state;
- change Source-contact cadence;
- change Logic Group / KP identity or membership.

If an explicit Current source cannot be resolved, the field is absent. **Absence is valid.**

---

## 3｜Typed content jobs

### `framework`

A Block-level answer-bearing cognitive map used to make the upcoming Core navigable.

Valid explicit forms include:

- `总 Framework`;
- mechanism spine;
- sequence / flow;
- comparison matrix / coordinate system;
- decision tree / localization frame;
- an explicit machine marker such as `kianos:framework` attached to Current Block content.

A Framework is not equivalent to a generic Block title, center question, Logic Map or decorative UI summary.

### `memory_routing`

An explicit Block-owned routing section that states which material must remain in the immediate learning gate and which exact material may move into deferred memory handling.

It is a **content routing decision**, not a review scheduler.

### `mi_g`

Explicit gating memory authored by the Current Block owner.

Semantics:

```text
if missing / unstable
→ continued understanding or downstream retrieval is materially obstructed
→ keep in first-pass carry-now gate
```

Only explicit Current ownership may populate MI-G.

### `mi_d`

Explicit deferrable exact memory authored by the Current Block owner.

Semantics:

```text
item is still exact / retainable
+ correct mechanism location is already known
→ item may leave the immediate mechanism gate
→ later Memory product may schedule it
```

MI-D does not mean optional or low value.

---

## 4｜Canonical extraction boundary

A later compiler may resolve these typed jobs from canonical Block Markdown only when the section is explicit.

Preferred signals, in descending confidence:

1. explicit machine marker bound to a Current section, e.g. `<!-- kianos:framework ... -->`;
2. exact semantic heading such as `总 Framework`, `Memory Routing`, `MI-G`, `MI-D`;
3. a clearly authored equivalent heading whose semantic job is unambiguous and can be reviewed manually.

The compiler must fail closed on ambiguous prose. It may not use keyword similarity or LLM inference as authority for membership.

---

## 5｜Stable output shape for downstream lanes

This lane does **not** implement the Projection / Runtime parser, but downstream asset-closure work should preserve a shape equivalent to:

```text
block_preentry
  framework
    present
    owner_path
    anchor
    content_or_ref

  memory_routing
    present
    owner_path
    anchor
    mi_g[]
    mi_d[]
```

Rules:

- `present=false` or field absence is valid;
- owner path and anchor must resolve back to the canonical Block;
- copied text, if materialized, is a projection of the owner and must retain provenance;
- stable KP / Logic Group IDs should be attached when the canonical content already makes them explicit;
- the output may not become a parallel medical owner.

---

## 6｜Relationship to existing learner support

These jobs are not replacements for:

- `first_pass_focus` — what the learner should focus on now;
- `stop_line` — where first-pass expansion should stop;
- `recall_spine` — compact retrieval skeleton;
- Logic Group goal / closure — local learning and closure semantics;
- Precision — exactness attribute;
- Visual — source-locator + visual micro-task support;
- Extension / Connection — optional expansion or cross-linking.

They answer a different question:

> **Before / during first learning, what explicit Block-owned map and memory split must survive as content?**

---

## 7｜Verified Current examples — evidence, not coverage claim

The 2026-09-17 Guide / Framework lane directly verified explicit pre-entry content in representative canonical Blocks from all four migrated systems:

- A1 `circulation-b01` — explicit `总 Framework` + `Memory Routing` + `MI-G` + `MI-D`;
- A2 first Block — explicit `总 Framework` + `Memory Routing` + `MI-G` + `MI-D`;
- A3 `urinary-b01` — explicit `总 Framework`, including a `kianos:framework` marker, plus `Memory Routing` and `MI-G` / deferred memory structure;
- B `D1` — explicit `总 Framework` + `Memory Routing` + `MI-G` / deferred memory structure.

This list proves the semantic job is real across A1 / A2 / A3 / B. It does **not** assert that every Block has all four sections.

A full compiler must inspect each canonical Block independently and preserve absence.

---

## 8｜Guide handoff

The System Beginner Guide may tell the learner that a Block can expose Framework and Memory Routing, but it must not duplicate or re-author their membership.

Current flow remains conceptually:

```text
System Beginner Guide
→ Block center question / explicit Framework if present
→ accepted original-Lecture contact
→ Logic Group / KP learning and retrieval
→ explicit Memory Routing if present
→ Group / Block closure
```

Exact Source-contact granularity remains owned by the System learning owner and lane learning contract.

---

## 9｜Projection / Memory-product boundary

Projection may later expose these typed content jobs.

The Memory product may later consume MI-G / MI-D semantics as inputs to its own scheduling model.

Neither may infer missing content, and neither may reinterpret this contract as personal learner state.

In particular:

```text
MI-G / MI-D membership = content truth
Weak / due / interval / rating / history = learner state
```

They must remain separate.

---

## 10｜Acceptance

A downstream implementation satisfies this contract only when:

1. an explicit canonical Framework survives as Framework rather than generic prose;
2. explicit MI-G survives as gating memory;
3. explicit MI-D survives as deferrable exact memory;
4. the G / D distinction survives Memory Routing;
5. a Block without explicit material remains absent rather than receiving invented placeholders;
6. every exposed item can resolve back to its canonical owner;
7. no Runtime behavior or learner state is smuggled into content authority.
