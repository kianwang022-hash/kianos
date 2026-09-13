# Xizong Block Workspace — accepted design

Status: **ACTIVE SURFACE DESIGN — BASE WORKSPACE ACCEPTED, INNER STATES STILL UNDER DISCUSSION**
Parent: `static-web/XIZONG_PRODUCT_BRIEF.md`
Review safety: `static-web/XIZONG_UI_REVIEW_PROTOCOL.md`

This file records the accepted Mac-wide Block Workspace design only. It does not change Xizong medical Content, Learning Logic, Runtime, Evidence, Repair, Return, or existing S/K/L/P/R/E/U claims.

## 1｜Baseline: optimize the accepted loop, do not redesign it

Preserve the existing mature learner chain:

```text
Block orientation
→ Logic Group orientation
→ iPad / MarginNote continuous original-Lecture study for the whole Logic Group
→ one return to KianOS
→ that Logic Group's KP Recall
→ Logic Group closure
→ next Logic Group
→ Block Recall
→ Block Complete
```

The shared Block UI is a Projection optimization of this accepted loop, not a new learner flow.

## 2｜Mac-wide workspace skeleton — ACCEPTED

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│ Location / Block identity / thin learning-state line                         │
├──────────────────────┬───────────────────────────────────────┬────────────────┤
│ Logic Group Map      │ Primary Cognitive Stage               │ Context        │
│ persistent local map │ current Block/Logic/Recall object     │ conditional    │
├──────────────────────┴───────────────────────────────────────┴────────────────┤
│ current meaningful next action / MarginNote handoff / return                 │
└───────────────────────────────────────────────────────────────────────────────┘
```

Roles:

- **top**: location + a thin learner-stage line; do not spend a full permanent column on the Learning Chain;
- **left**: Logic Group Map, preserving free navigation and local position;
- **center**: the current dominant cognitive object; geometry may vary with Current Block semantics;
- **right**: conditional Context only when useful now — e.g. source locator, Visual, Precision, Connection/Reserve, repair context;
- when no contextual object exists, the center expands instead of leaving an empty permanent rail.

Hard rule:

> The workspace geometry is shared; the cognitive geometry inside the center is not forced into one generic template.

## 3｜Current implementation audit disposition — ACCEPTED DIRECTION

### KEEP

Preserve semantically:

- Logic Group navigation;
- Logic Group continuous-Lecture model;
- one return after the whole Logic Group;
- neutral KP Recall front and answer gating;
- KP Recall evidence semantics;
- Logic Group closure;
- Block Recall and completion gate;
- learner-state guards;
- existing Memory / Repair / Evidence / Return semantics;
- timing semantics of Visual / Precision / Connection / Reserve where Current owns them.

### OPTIMIZE

- full Block orientation should not be hidden behind `需要时看完整 Block 定位` on the primary Mac Guide;
- the Logic Group's KP coverage / return roadmap should not require an extra reveal click when it is useful for the current handoff;
- replace the permanent right-side Learning Chain with a thin state line;
- make the right context region dynamic rather than permanent;
- improve Mac-wide typography, density, hierarchy and spatial use without changing content semantics.

### DEMOTE

- duplicate Outline mode when the Logic Group Map already provides the needed local map;
- permanent keyboard/help chrome;
- engineering/provenance/source-hash chrome;
- learner-irrelevant KP/Outline counts as primary navigation information.

### RESTORE FROM CURRENT

Where the existing Projection hides or over-compresses accepted Current Block orientation, restore it to learner-visible Guide form without rewriting the medical content.

Examples already pressure-tested:

- A1 B1: mechanism spine + formulas + Framework;
- A2 R1: measurement language + mechanics + resistance model + Framework + accepted Visual/Precision timing;
- A3 B1: spatial/direction/measurement/control language + Framework + source-local study references;
- heterogeneous A1 disease Blocks may contain multiple cognitive objects rather than one `projection_shape`.

## 4｜Cross-System rule

A1 / A2 / A3 may store Projection-support information differently. The learner-facing Block Workspace should still provide one coherent capability set.

Do not force identical upstream files merely for symmetry. Use only relations / Visual / Precision / source locators that the relevant System's Current owners actually support; absent data stays absent rather than being guessed.

A shared Block change must not silently lose A2's Current Visual / Precision / Connection timing or A3's richer source-local/Core orientation merely because A1 has a simpler enrichment set.

## 5｜Interaction rule

> **把点击用在切换认知对象，不要用在获得本来就该看到的信息。**

Legitimate clicks/state changes include switching Logic Group, entering external Lecture, returning for Recall, moving through KP Recall, Closure, or Block Recall.

Important first-round Block Guide structure should normally be visible on Mac without repeated accordion/detail opening. Protected answers and truly secondary/later reference remain progressively disclosed.

## 6｜Still open

Not yet frozen here:

- exact Logic Group orientation composition;
- exact MarginNote handoff / return composition;
- exact KP Recall post-Reveal composition;
- exact placement/timing presentation of Visual / Precision / Connection / Reserve;
- exact Block Recall geometry;
- responsive fallback details;
- final visual styling.

These must be discussed against the whole accepted learner loop before implementation.
