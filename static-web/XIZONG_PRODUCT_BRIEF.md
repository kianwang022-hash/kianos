# Xizong Product Brief — top-level logic & projection architecture freeze

Status: **TOP-LEVEL LOGIC / ARCHITECTURE FROZEN — SURFACE DETAILS STILL UNDER DISCUSSION**  
Parent UI cursor: `static-web/CURRENT.md`  
Learning authority: `content/xizong/LEARNING_CONTRACT.md`  
Lane router: `content/xizong/CURRENT.md`  
Shared projection grammar: `static-web/PRESENTATION_CONTRACT.md`  
Preference owner: `static-web/KIAN_UI_PREFERENCES.md`  
Style owner: `static-web/UI_STYLE_BRIEF.md`

This file records accepted learner-visible Xizong product and Projection architecture decisions before Codex implementation. It does **not** change medical Content, Learning Logic, Evidence semantics, learner progress, or the S/K/L/P/R/E/U status of any System.

---

# 0｜Optimization-first operating rule

Xizong UI productization starts from the **existing Current closed learning/Projection/Runtime loop**, not from raw Content as if no learner surface existed.

For a System such as A1 whose scoped Acceptance already records `S/K/L/P/R/E = PASS`, normal UI/product discussion must assume the accepted Projection and Runtime are the baseline unless fresh contradictory evidence identifies a concrete defect. Visual/product work does not by itself reopen L, P, R or E.

The default chain for UI work is therefore:

```text
Current Learning / Content authority
→ existing accepted Projection behavior
→ existing Runtime / Evidence / Repair / Return
→ Projection optimization audit
→ Mac-wide product recommendation
```

Not:

```text
Current Content
→ invent a new learner flow / page model from scratch
→ reconnect Runtime afterward
```

## Required four-way Projection audit before recommending changes

Every mature Xizong learner surface must first classify the existing implementation into:

### `KEEP`

The existing Projection/interaction already expresses the accepted cognition or Runtime well enough and must be preserved semantically.

Examples include accepted Logic Group Lecture continuity, neutral Recall fronts, answer gating, learner-state guards, evidence persistence and exact Return behavior.

### `OPTIMIZE`

The existing semantic object / learner behavior is correct, but its Mac-wide geometry, typography, density, hierarchy, simultaneous visibility, interaction cost or visual polish can improve.

`OPTIMIZE` must not silently change the learner contract.

### `RESTORE_FROM_CURRENT`

Current Content / Learning support already owns useful semantics, but the existing Projection drops them, over-compresses them, hides them behind unnecessary disclosure, or projects only a lossy label.

Restoration means exposing **already-authoritative Current semantics** through a better Projection. It is not permission to add new medical explanation.

### `DEMOTE`

The current learner surface exposes something real but it should not compete with the current cognitive action: e.g. engineering/provenance chrome, redundant counts, permanent shortcut instructions, or a legitimate later-stage capability shown before learner eligibility.

Demotion does not delete mature capability. It changes learner-facing timing / prominence while preserving valid Runtime ownership.

## Reopen / redesign threshold

A proposal may move beyond `KEEP / OPTIMIZE / RESTORE_FROM_CURRENT / DEMOTE` only when fresh evidence shows a real upstream defect.

Before proposing a learner-flow redesign, the discussion must be able to name:

```text
which Current semantic / accepted behavior is wrong
→ which owner is responsible
→ which earliest gate / stage must reopen
→ why simple Projection optimization is insufficient
```

Without that evidence, do not redesign the learning flow.

## Recommendation protocol

Before drawing a replacement UI or proposing a new surface model, Sol / Chat must:

```text
1. read the Current Logic / Content owner needed for the surface;
2. read the existing Current Projection implementation;
3. read the relevant Runtime / Evidence / Repair / Return behavior;
4. enumerate the important existing learner-facing functions;
5. classify each material part as KEEP / OPTIMIZE / RESTORE_FROM_CURRENT / DEMOTE;
6. only then recommend Mac-wide geometry or asset changes.
```

A simplified ASCII mockup is allowed only **after** this audit and represents spatial organization, not permission to replace an accepted high-density asset with a thinner summary.

## Relationship to later Projection asset compilation

The later Cognitive Projection Asset Compilation stage is also **optimization-first**.

Its job is to materialize stable ViewModels for the already accepted cognition and product decisions, analogous to the Politics compilation lane. It may improve representation metadata and recover Current semantics currently lost by the renderer, but it must not reinterpret a closed learner loop as a blank-slate content-design task.

---

# 1｜Frozen product boundary

Xizong web is not a second textbook and not a document browser.

The approved first-pass model remains external-primary:

```text
System orientation
→ choose Block
→ Block orientation
→ current Logic Group orientation
→ iPad / MarginNote original Lecture: continuous study of the whole Logic Group
→ return once to KianOS
→ KP Recall for that Logic Group
→ Logic Group closure
→ next Logic Group
→ Block Recall
→ Block Complete
```

After the relevant System has actually been learned, later stages may expose:

```text
System Recall
→ official System question sweep
→ Wrong / meaningful Uncertain repair
→ short post-question System reconstruction
```

Runtime capability never authorizes a learner-facing stage before the learner has legitimately reached it.

Hard learner-facing boundaries:

- original Lecture in MarginNote remains the continuous first-learning owner;
- KianOS owns orientation, cognitive positioning, selective cues, retrieval, closure, verification, repair routing and later review;
- KP is a stable canonical knowledge identity, **not automatically the learner-facing first-learning order**;
- Logic Group is the local continuity / closure unit inside a Block;
- stable correct work must remain cheap;
- Wrong / meaningful Uncertain opens only the smallest useful repair;
- engineering readiness must never be rendered as learner progress.

---

# 2｜Content authority vs Projection asset upgrade

## 2.1 Content remains authoritative and unchanged by UI work

Medical / learning owners decide **what is true and what the learner contract means**.

UI / Projection work may not silently:

- rewrite medical claims;
- alter accepted terminology merely for cleaner copy;
- invent causal links, hierarchy, comparison, ownership, priority or learner order that Current does not support;
- infer Question→KP relations;
- convert historical / Legacy material back into Current authority;
- turn Projection into a hidden second Lecture.

## 2.2 Projection assets may be upgraded substantially

Projection is allowed to create a better learner-facing **representation layer** without semantic drift.

Allowed Projection work includes:

- regrouping Current fields into learner-facing semantic objects;
- defining stable Cognitive ViewModels;
- assigning Current structures to representation roles such as chain / map / matrix / compare / hierarchy / decision structure **when the Current semantics support that shape**;
- specifying first-view hierarchy, spatial placement, simultaneous visibility and stateful emphasis;
- preserving one Current semantic object across ORIENT / RECALL / REPAIR / CLOSE states with different visibility;
- compiling source locators, Logic Group ownership, KP coverage and existing learner-support fields into stable presentation assets;
- defining `projection_shape` / geometry metadata as presentation semantics, provided it does not create new domain semantics.

Accepted architecture:

```text
Current Medical / Learning Content
→ Xizong Cognitive Projection Assets
→ stable System / Block / Logic / KP ViewModels
→ reusable Mac-wide learner workspaces
→ existing Runtime / Evidence / Repair / Return
```

Forbidden architecture:

```text
Current
→ AI invents a cleaner summary / relation
→ UI presents that invention as canonical learning content
```

Projection upgrade therefore means **presentation/representation engineering**, not medical-content rewriting.

---

# 3｜Politics pattern reused only at the architecture level

Xizong should reuse the successful Politics productization pattern:

```text
Current Content
→ semantic projection
→ stable Cognitive ViewModel
→ reusable cognitive primitives
→ shared Mac-wide workspace shell
→ existing Runtime / Evidence / Repair / Return
```

But Xizong must not inherit Politics cognitive shapes.

Xizong owns its own likely representation families, including where Current supports them:

- mechanism / causal chain;
- System mother model;
- variable / coordinate model;
- failure propagation;
- comparison / discrimination;
- hierarchy / classification;
- decision structure;
- Visual Gate;
- exact / precision object;
- Logic Group map;
- Block/System reconstruction.

The shell may be shared; cognition-specific geometry must remain local to the actual System / Block / Logic object.

---

# 4｜Primary environment: Mac wide landscape

Mac wide landscape is the design origin for Xizong learner surfaces.

iPad remains the companion device for continuous original-Lecture reading in MarginNote. Narrow layouts remain required as responsive fallback but do not define the primary information architecture.

Hard spatial principle:

> **Use width to keep simultaneously useful cognitive relations visible; use state changes for real learning-sequence transitions.**

Mac-wide Xizong should prefer:

- horizontal parallelism where relations are simultaneous;
- side-by-side comparison where discrimination matters;
- persistent local context when it materially helps the current cognitive task;
- comfortable readable text and dense useful information;
- local scrolling / long surfaces when semantic density genuinely requires it;
- typography, alignment, spatial grouping and relation drawing before card piles.

Do not pursue `one viewport` as a goal when it would thin a genuine high-density Guide.

Accepted density rule:

> **Presentation compression ≠ semantic compression.**

A Guide may be long and information-dense. UI should reduce disorder and interaction tax, not delete useful first-round content for visual cleanliness.

---

# 5｜Shared Xizong workspace grammar

The common Mac-wide workspace may use these spatial roles:

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│ Location / current cognitive state / meaningful Resume                       │
├──────────────────────┬───────────────────────────────────────┬────────────────┤
│ Object Map / Nav     │ Primary Cognitive Stage               │ Context        │
│ conditional          │ dominant learner object / action      │ conditional    │
├──────────────────────┴───────────────────────────────────────┴────────────────┤
│ local next action / external handoff / return when needed                    │
└───────────────────────────────────────────────────────────────────────────────┘
```

These are **roles, not mandatory fixed columns**.

Hard rule:

> **Shell can stay stable; cognitive geometry must vary with Current semantics.**

Do not force every System, Block or Logic Group into one diagram or generic card template.

Examples of legitimate variation to test later:

- normal mechanical circulation may emphasize a mechanism chain / variable model;
- valve disease may require comparison geometry;
- arrhythmia may require discrimination / decision geometry;
- heart failure may require failure / compensation propagation;
- another Block may need an entirely different Current-supported geometry.

These examples are **pressure-test categories**, not frozen medical Projection content.

---

# 6｜Frozen learner-facing surface family

The Xizong product family is frozen at the following responsibility level. These do not have to be separate URLs; several may be states of one workspace.

## A｜Xizong Home

Responsibilities:

```text
meaningful Continue
→ free System entry
→ real Wrong / Uncertain handoff only when useful
```

Do not foreground engineering counts, repository readiness, fake progress or permanent method explanation.

## B｜System Guide / Orientation

Responsibilities:

```text
understand the Current System-level model
→ preserve Current System coordinates / relations / boundaries
→ understand the available Block route
→ choose a Block
```

System Guide is a learner-facing Guide, not a chapter catalogue and not a thin poster. It may be high-density and extend beyond one viewport.

System Recall / System Exit stays later-stage and must not compete with first-pass orientation before learner eligibility.

## C｜Block Workspace

Responsibilities:

```text
Block orientation
+ current Logic Group positioning
+ existing Logic Projection continuity
+ MarginNote handoff / return
```

Block Workspace must preserve the already accepted Logic Projection behavior:

```text
Logic Group orientation
→ continuous original-Lecture contact for the whole Logic Group
→ one return
→ this Logic Group's KP Recall
→ group closure
```

Do not regress to KP-by-KP app switching.

## D｜KP Recall Workspace

Responsibilities:

- neutral Recall front;
- protect answer-type title / canonical answer until legitimate Reveal;
- retain the accepted `Space / 1–4 / Enter / ← / →` Recall interaction grammar as governed by shared Presentation + domain Evidence semantics;
- show canonical Current Core after Reveal without learner-facing semantic rewriting;
- preserve the owning Logic Group context;
- collect Recall evidence without turning scoring UI into the medical model.

## E｜Block Recall

Responsibility:

> reconstruct / run the Block model after the owned Logic Groups close, rather than rereading all KP.

Exact UI remains open for surface-level discussion.

## F｜System Completion / later System stage

Only when learner state legitimately permits:

```text
System Recall
→ official question sweep
→ smallest W/U repair
→ post-question System reconstruction
```

The exact System Recall / official-question UI remains open.

## G｜After-Learn

Includes existing responsibilities such as:

- Memory for formally learned but unstable objects;
- Reserve / deferred relations where Current owns them;
- bounded Chat repair / review handoff;
- evidence-preserving return.

Do not redesign these from scratch merely for visual consistency; preserve mature Runtime/Evidence behavior and optimize learner-facing Projection.

---

# 7｜Protected existing Logic Projection contract

Current A1 Projection acceptance already protects these behaviors and future UI work must preserve them unless the upstream Learning contract is explicitly reopened:

```text
P1  Logic Group continuous Lecture contact; no KP-by-KP app switching
P2  neutral Recall front; formal answer stays gated until Reveal
P3  later stages fail closed against learner-state prerequisites
P4  System Recall / Exit are later-stage; first-pass System is orientation-first
P5  governance/provenance metadata stays out of learner chrome
P6  Projection does not invent Question→KP binding
```

The UI productization is therefore a **Projection optimization**, not a new learner-flow invention.

---

# 8｜Interaction principle: click to change cognition, not to recover hidden structure

Accepted Xizong interaction rule:

> **把点击用在切换认知对象，不要用在获得本来就该看到的信息。**

On Mac wide:

- important first-round Guide structure should normally be visible by default;
- switching System / Block / Logic Group / KP is a legitimate cognitive-object change;
- moving from orientation to external Lecture, Recall, Repair or Closure is a legitimate state change;
- repeated accordions / details / modals whose only purpose is hiding useful orientation information should be removed or demoted;
- progressive disclosure remains appropriate for true reference/deep/later material and for protected answers.

---

# 9｜Projection compilation stage — later, not now

Do **not** mass-compile Xizong Cognitive Projection assets before the product/surface design is frozen.

After the UI family is accepted, open a separate bounded Projection Compilation lane analogous to Politics.

Expected compilation responsibilities:

```text
read Current System / learning-support / Block Core / existing Projection contract
→ identify Current-supported cognitive structure
→ produce stable learner-facing ViewModel
→ preserve provenance / identity
→ no medical semantic mutation
```

Likely ViewModel families to design later:

```text
SystemProjection
BlockProjection
LogicGroupProjection
KPProjection / RecallProjection
```

Possible presentation-only fields may include:

```text
projection_shape
spatial_groups
visible_relations
context_roles
state_visibility
handoff_locators
```

These field names are not frozen implementation schema yet. Their **responsibility boundary** is frozen: presentation metadata may organize existing semantics but may not invent new domain truth.

---

# 10｜Design / implementation sequence

Frozen program order:

```text
Phase 1  freeze Xizong learning/product architecture
Phase 2  freeze learner-facing surfaces one by one
         Home
         → System Guide
         → Block Workspace
         → KP Recall
         → Block Recall
         → System Recall / Questions
         → After-Learn

Phase 3  pressure-test Block workspace against materially different Blocks
         at minimum use examples such as B1 + B7 + B10 + B11
         without assuming one cognitive geometry

Phase 4  freeze Xizong Product / Projection Design

Phase 5  separate Cognitive Projection Asset Compilation lane
         Current → stable Projection assets

Phase 6  Codex implementation
         Astro / CSS / JS consumes Current-facing Projection assets
         Codex does not rediscover learner logic or archaeology

Phase 7  real Mac-wide browser screenshots
         → Sol review
         → Kian structural / aesthetic acceptance
         → same-PR iteration
         → zero-semantic-diff gate
```

No Codex implementation begins merely because this top-level architecture is frozen.

---

# 11｜Future design read path

For ordinary Xizong UI discussion, use Current-first reads:

```text
content/xizong/LEARNING_CONTRACT.md
→ relevant System K owner (`system.json`)
→ relevant System L owner (`*-learning.json`)
→ exact Block medical Core when needed
→ existing Current Logic Projection / Projection acceptance
→ existing Runtime / Evidence component for the surface
→ product discussion
```

For a mature/accepted surface, **do not stop after the upstream owners**. Existing Projection/Runtime is part of the product baseline and must be read before a replacement recommendation.

Do not default to retired System Guides, Legacy repos, historical branches, old audit sidecars or old Chat narratives.

Historical material may be used only for an explicitly bounded migration/recovery/reference task and never silently becomes semantic authority.

---

# 12｜What is frozen now vs still open

## Frozen now

- external-primary first-pass learner chain;
- System → Block → Logic Group → continuous MarginNote Lecture → KP Recall → group closure → Block Recall semantics;
- **optimization-first UI method: accepted Current Projection/Runtime is the baseline, not a blank-slate target**;
- **KEEP / OPTIMIZE / RESTORE_FROM_CURRENT / DEMOTE audit before recommendation**;
- **reopen/redesign only on fresh concrete upstream defect evidence**;
- Mac-wide primary environment;
- high-density / low-disorder Guide principle;
- Content authority vs Projection asset-upgrade boundary;
- Current → Cognitive Projection → ViewModel → Mac UI → existing Runtime architecture;
- stable shell roles + variable cognition-specific geometry;
- seven learner-facing surface responsibility families;
- protected existing Logic Projection behaviors;
- UI-before-compilation-before-Codex program sequence;
- no mass asset upgrade until surface family is discussed/frozen.

## Still open

- exact System Guide geometry and visual composition;
- exact Block Workspace geometry;
- exact KP Recall post-Reveal composition;
- how Visual / Precision / Reserve objects enter each Current state;
- exact Block Recall representation;
- exact later System Recall / official-question composition;
- specific Xizong Cognitive Projection schema;
- reusable Xizong cognitive primitive/component vocabulary;
- responsive fallback details;
- final styling and aesthetic acceptance.

These remain discussion targets and must not be inferred by Codex from this file.
