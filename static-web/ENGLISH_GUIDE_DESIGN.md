# English Guide Design

Status: ACCEPTED DESIGN BOUNDARY  
Parent: `static-web/ENGLISH_PRODUCT_BRIEF.md`  
Preference owner: `static-web/KIAN_UI_PREFERENCES.md`  
Semantic authority: `content/english/LEARNING_CONTRACT.md` + task-specific Current learning assets

This file owns the learner-visible Guide design boundary for English. It does not change English learning semantics, task ownership, Runtime, Evidence, Lexical ownership, or learner progress.

---

## 1｜Why English needs Guide surfaces

English already owns rich validated First Learning assets for Objective, Translation and Writing. The product problem is not missing knowledge; it is that those assets can appear hidden, secondary, or overly course-like relative to Performance Runtime.

Accepted rule:

> English keeps **Performance First**, while Task Guides become clear first-class optional entry surfaces.

Guide is not a compulsory course and not a new learner debt.

```text
English Home / task route
├─ direct Performance Runtime
└─ Task Guide when Kian wants orientation, first learning, or targeted repair
```

The learner may skip a Guide entirely when performance is already stable.

---

## 2｜Critical density rule

Kian explicitly rejected the idea that Guide presentation should simplify a dense knowledge asset merely to create a clean one-screen diagram.

Hard rule:

> **Reorganize the content; do not semantically thin it.**

Therefore:

- existing validated Global Map, Core, Skill Map, boundaries, execution rules and other first-round useful detail remain available at their accepted level of detail;
- a diagram or summary rail may orient the learner but may not replace the complete useful Guide content;
- do not reduce a rich First Learning asset to a few cards just because those cards fit neatly on one viewport;
- do not split one coherent reasoning object into many tiny click-to-reveal fragments merely to keep the page visually sparse;
- a Guide may be longer than one viewport and may use local scrolling;
- Mac width should be used to show related structures simultaneously where that improves understanding;
- semantic omission/deferment is allowed only when English Learning authority marks content as genuinely secondary, repair-only, later-phase or reference material.

The earlier simplified Reading-A ASCII mockup is **orientation-only**, not the accepted content-density target.

---

## 3｜English Guide hierarchy

### English Home = lane-level orientation / routing

English Home may expose the overall scoring/capability map and route to both Guide and Performance. It should not duplicate complete task Guides.

### Task Guide = complete task cognition at the appropriate accepted density

Current task families:

```text
Reading A
Cloze
Part B
Translation
Writing
```

Objective may retain a shared Global Map / shared decision kernel, but Reading A / Cloze / Part B keep distinct task cognition and must not be flattened into one generic Objective guide.

---

## 4｜Task-specific information preservation

### Reading A

Preserve the accepted knowledge structure including, where owned by Current assets:

```text
Global Model
Question Demand
Evidence Boundary
Option Proposition
Adjudication
Skill Map
Boundary / Cause / Attribution / Local→Global / True-but-Irrelevant distinctions
Execution
shared Representation when relevant
```

Presentation may build a strong global relation map and spatial comparisons, but those are navigation/attention devices over the full asset, not replacements for it.

### Cloze

Preserve:

```text
Global Model
Slot Demand
Constraint Stack
Competition / Best Fit
lexical / syntactic / discourse constraints
collocation / relation distinctions
Execution / Exam Compression
```

Do not reduce Cloze Guide to only `slot → constraints → best fit` if doing so drops accepted distinctions and usable teaching detail.

### Part B

Preserve:

```text
Global Model
Discourse Skeleton
Position Demand
Candidate Role
Global Reconcile
Local / Global interaction
Coupled errors
Reference / cohesion structures
Execution
```

The Guide should support whole-map reasoning rather than atomized mini-cards.

### Translation

Preserve the accepted complete First Learning asset around:

```text
Global Map
Representation
Reconstruction
Execution
Fidelity as a cross-cutting invariant
Skill Map / deep repair when needed
```

`Represent → Reconstruct faithfully → Deliver` is the organizing spine, not a license to delete richer accepted content below it.

### Writing

Preserve the six genuine primitives and their full useful content:

```text
Task / Genre
Content Generation
Organization / Development
English Realization
Register + high-value Error Control
Timed Delivery
```

Small / Big Writing remain task specializations. Synthetic practice and deeper Skill Map remain available under their existing learning role.

---

## 5｜Mac-wide presentation rule

Guide surfaces should optimize for:

> **high information density + strong hierarchy + low interaction tax**

Preferred techniques:

- wide relation maps;
- parallel comparison columns;
- persistent task map / local navigation;
- readable dense text blocks under clear hierarchy;
- stable contextual rails;
- independent/local scrolling where useful;
- first-round useful structures visible without repeated accordion opening;
- direct task/runtime exit always available.

Avoid:

- giant empty hero areas;
- generic card piles;
- one-card-per-concept decomposition;
- excessive reveal controls;
- reducing detailed assets into attractive but semantically thin diagrams;
- forcing linear completion through Guide sections.

---

## 6｜Guide / Runtime relationship

Guide remains optional and performance-oriented:

```text
know the task already
→ direct Runtime

need orientation / first learning
→ Guide
→ Runtime

Runtime exposes a real recurring / high-cost failure
→ return to the smallest relevant Guide/Skill object or Chat
→ back to Runtime
```

No Guide completion percentage, required checklist, or manufactured review debt.

---

## 7｜Implementation boundary

Later Codex implementation must read the existing task learning assets before redesigning the Guide. It may change layout/navigation and projection, but it must not infer that a simplified mockup is the semantic target.

Acceptance requires checking both:

```text
visual hierarchy / usability
+
semantic density / content preservation
```

A visually beautiful Guide that silently drops accepted learning content is a failure.
