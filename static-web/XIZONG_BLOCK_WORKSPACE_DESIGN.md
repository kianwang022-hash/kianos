# Xizong Block Workspace — accepted design

Status: **ACTIVE SURFACE DESIGN — BASE WORKSPACE + LOGIC/HANDOFF + KP RECALL + CLOSURE/BLOCK RECALL ACCEPTED, AFTER-LEARN STILL UNDER DISCUSSION**
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

## 6｜Logic Group orientation — ACCEPTED

Entering a Logic Group changes the current cognitive object but stays inside the same Block Workspace.

Default Mac composition:

```text
Logic Group Map
│
├─ current Logic Group title
├─ goal: this group solves what problem
├─ closure target: what should be possible after learning
├─ KP coverage / range as return roadmap only
├─ relevant Current Visual cue / incoming connection when explicitly owned
└─ action: go to the original Lecture for continuous study
```

Rules:

- `goal` and `closure` remain Current learning-support text; UI does not rewrite their meaning;
- KP identities/range are visible as a roadmap, not as permission to turn first learning into isolated KP cards;
- group-level Visual appears at the learning entrance only when Current owns a relevant cue;
- incoming connection may reactivate a previously learned relation when Current explicitly owns that connection;
- no permanent empty Context rail when no contextual object exists.

## 7｜MarginNote handoff / one return — ACCEPTED

The external-Lecture handoff is a real surface transition and should be low-friction.

Before leaving KianOS, show directly:

```text
current Logic Group
→ exact Current source locator or bounded continuous source range when available
→ KP return roadmap for this Logic Group
→ relevant source-local Visual task when Current owns one
→ one clear instruction: learn this whole Logic Group continuously in MarginNote
```

Do not hide the return roadmap behind a disclosure control.

Do not fabricate source locators. If Current lacks an exact locator, show a bounded generic continuous-source instruction rather than guessing.

The handoff must continue to say, in learner-facing language, that original figures/tables/examples/Lecture-attached questions remain on the original Lecture surface and KianOS is the return surface for retrieval/closure.

### Return evidence

Preserve one meaningful learner confirmation:

```text
this Logic Group's original Lecture contact is complete
→ start this Logic Group's KP Recall
```

This confirmation is not UI ceremony; it records formal Lecture contact required by the accepted Runtime/completion semantics.

Do not add extra `I am back`, double-confirmation, or modal rituals.

## 8｜Visual / Precision timing boundary — ACCEPTED AT RESPONSIBILITY LEVEL

Preserve Current timing semantics rather than filling spare Mac width:

- a group Visual that helps learning now may appear at Logic Group entry / handoff;
- group Precision whose role is later exactness may remain at/after group closure according to its Current timing;
- KP-level Visual / Precision remains tied to the relevant KP learning/Recall context when Current owns it;
- Reserve / Connection Hook remains timing-sensitive and must not become ordinary first-pass Memory merely because it is visible;
- absent cues remain absent.

## 9｜KP Recall — ACCEPTED

KP Recall remains a two-state learner interaction inside the owning Logic Group:

```text
A. Recall Front
   KP identity + neutral Active Prompt only
   → learner reconstructs from memory
   → Reveal

B. Recall Reveal
   Current KP title + complete canonical Core
   + relevant Current context only
   → 1 / 2 / 3 / 4 evidence
   → next unrecalled KP in the same Logic Group
```

### 9.1 Recall Front

Hard rule:

> **Neutral-front protection applies to the whole workspace, not only the main Recall card.**

Before Reveal:

- show current Block / Logic Group position and KP ID;
- show the Current neutral prompt / `主提示` when it is non-answer-leaking;
- do not show the answer-type KP title, canonical Core, Precision answer cue, answer-revealing Visual cue, or other contextual content that leaks the formal answer;
- the left Logic Map remains visible; the current Logic Group may expand to show KP IDs / state only;
- do not expose answer-type titles through a side dock, breadcrumb, inspector, tooltip or shortcut chrome.

A Current implementation risk was identified: the main Recall card correctly hides `kp.title` until Reveal, while the existing `XizongStudyEnhancer` dock can render `KPxx · title` during Recall. Productization must remove this cross-surface leakage and the Projection validator should cover the whole workspace neutral front rather than only the main card.

### 9.2 Recall Reveal

After legitimate Reveal:

- show the Current KP title;
- render the complete canonical Current Core without semantic thinning or AI summarization;
- preserve useful Current internal structure such as chains, tables, formulas, contrasts and headings;
- Mac-wide Projection may improve spatial organization, typography and relation visibility without rewriting medical content;
- relevant KP-level source locator / Visual / Precision may enter the conditional Context region only when Current owns them;
- if no relevant context exists, the Core expands rather than leaving empty chrome.

### 9.3 Evidence / navigation

Preserve current Recall evidence semantics:

```text
1 = 没记住
2 = 模糊
3 = 会了
4 = 稳定
```

A rating is a real Recall attempt and must remain append-preserved evidence. Memory or later repair does not rewrite the original Recall.

Keep the interaction cheap:

- Reveal first;
- rating only after Reveal;
- after rating, move to the next unrecalled KP in the same Logic Group;
- after all owned KP in the Logic Group have real Recall evidence, move to Logic Group Closure;
- no per-KP `add to Memory`, `confirm answer read`, or other ceremony in the first-pass mainline.

Keyboard / shortcut behavior must fail closed under the same gating: no hidden shortcut may rate or reveal content before the legitimate state permits it.

### 9.4 Information-density rule inside Recall

High-density Core stays complete after Reveal; density is organized spatially rather than deleted.

Do not turn a long accepted KP Core into a thin summary merely because it sits inside a Recall surface. The learner action is still `Recall → verify against canonical Core`, not `Recall → verify against an AI-generated abstract`.

## 10｜Logic Group Closure — ACCEPTED

Logic Group Closure is a **local model closure**, not a second KP test and not a new mastery gate.

After all owned KP in the Logic Group have real Recall evidence:

```text
KP Recall complete
→ return to the Logic Group problem
→ confirm the group now closes around its Current closure target
→ expose timing-appropriate Precision / outgoing Connection / Reserve when Current owns them
→ continue the mainline
```

Mac responsibilities:

- keep the owning Logic Group visible in the Logic Map;
- show the Current `goal` and `closure` as the local problem / closure target;
- do not restate every KP or require another per-KP check;
- weak Recall evidence remains preserved for later Memory/repair but does not block the first-pass mainline merely because one KP is not yet stable;
- group-level Precision may appear here when its Current role is later exactness;
- outgoing Connection / Reserve may appear here when Current explicitly owns the relation and timing;
- no extra Closure rating, checklist, `mastered?` ceremony or forced Memory admission.

Closure must remain cheap: the learner should be able to recognize that the local model closes and move on.

## 11｜Block Recall / Reconstruction — ACCEPTED

Block Recall is the first formal compression from many KP / Logic Groups back into one Block model.

Hard rule:

> **Block Recall tests whether the Block model can be reconstructed; it does not repeat all KP Recall.**

### 11.1 Block Recall Front

After all Logic Groups have closed, enter a neutral Block-level reconstruction state.

Show:

- Block identity;
- Current `centerQuestion`;
- the Logic Group Map as a high-level structural scaffold;
- a simple instruction to reconstruct / run the Block from memory.

Do not show before Reveal:

- `recallSpine`;
- Logic Group closure text;
- Block Guide body;
- KP titles / canonical Core;
- other answer-revealing contextual objects.

The Logic Group names may remain visible because they are the natural higher-level Block skeleton, not a replay of every KP answer.

### 11.2 Block Recall Reveal

After the learner has genuinely attempted reconstruction, Reveal shows the Current compression assets rather than reopening the full Lecture-like Block text:

```text
centerQuestion
+ recallSpine
+ Logic Group closure targets
+ Current-supported compressed cognitive geometry for this Block
```

The same Block may therefore have different geometry in different learning states:

```text
Block Guide        = complete orientation / first-pass map
Block Recall Front = protected reconstruction prompt
Block Recall Reveal= compressed reconstruction / verification
```

Do not author a second, independent Recall summary. The Recall view must be a state-specific projection of the same Current Block cognition.

Examples already pressure-tested:

- A1 B1 may reconstruct as a mechanical circulation spine;
- A1 B7 may reconstruct through the valve inference spine plus its Logic Group closures;
- A1 B10 may reconstruct through pulse/stability → rate → width → regularity → P-QRS → mechanism → treatment;
- A1 B11 may reconstruct through pump/filling failure → low perfusion + congestion → compensation/remodeling → downstream coordinates.

These examples illustrate geometry variation; they do not authorize content invention.

### 11.3 Recovery when blocked

If reconstruction exposes a local gap, the learner may navigate back to the responsible Logic Group through the persistent Logic Map.

That navigation must not automatically:

- reopen the whole Block;
- erase existing evidence;
- create Wrong/Uncertain question evidence;
- manufacture review debt;
- reset already completed Logic Groups.

It is learner-controlled local recovery inside the accepted Block mainline.

### 11.4 Block Recall evidence and completion

Preserve the Current distinction:

```text
Block Recall done
≠
Block completed
```

Do not merge these state writes merely to remove one click without a dedicated Runtime/Evidence review.

Current completion semantics remain:

```text
all owned KP formal Lecture contact
+ all owned KP Recall evidence
+ Block Recall
= Block completion eligible
```

The final completion action may be visually lightweight, but its accepted evidence meaning remains intact.

## 12｜Still open

Not yet frozen here:

- After-Learn Memory / Reserve / Chat-repair product composition and timing;
- responsive fallback details;
- final visual styling.

These must be discussed against the whole accepted learner loop before implementation.
