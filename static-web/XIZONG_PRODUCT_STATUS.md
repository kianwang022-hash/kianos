# Xizong Product / UI Status

Status: **CURRENT PRODUCT ROUTER · ONE RUNTIME · PROJECTION / DISPLAY RECONCILIATION ACTIVE**  
Domain router: `content/xizong/CURRENT.md`  
Learning authority: `content/xizong/LEARNING_CONTRACT.md` + `content/xizong/knowledge/learner/study-policy.json`  
Presentation authority: `static-web/PRESENTATION_CONTRACT.md`  
Safety / review: `XIZONG_UI_REVIEW_PROTOCOL.md`

Historical integrated execution prompts, old Frozen web contracts, old Issue checklists and PR summaries are provenance only. They may explain how Current was reached but do not override the Current owners above.

---

## 1｜Current product model in one view

Xizong is one learning product and one learner Runtime. Visual, Extension, TTSX checkpoints, Recall, official questions, second pass and Repair are conditional capabilities inside the same learning system; they are not parallel apps or curricula.

The current first-pass model is:

```text
System / Block orientation
→ Attention Projection: what matters now / later / only if needed
→ continuous original Lecture in iPad / MarginNote at accepted Source-contact granularity
→ optional Visual Gate / Extension when the current object genuinely benefits from it
→ natural Lecture subsection boundary
     └─ if reviewed TTSX binding exists:
        KianOS shows a lightweight checkpoint
        → Kian completes TTSX in the Lecture / MarginNote itself
        → reads answer + all options + question-side explanation / expansion
        → KianOS confirms completion and may optionally retain selected question(s) / short note
→ continue Source or return at the accepted retrieval point
→ KP retrieval / LG closure
→ Block Recall
→ Block Complete
→ after the System is actually learned: System Recall
→ official System question sweep in KianOS
→ W/U smallest-sufficient Repair / exact Return
→ short post-question reconstruction
```

Hard distinctions:

```text
Logic Group
= retrieval / local-closure unit

Source-contact segment
= continuous original-Lecture execution unit

Lecture-attached TTSX
= local first-pass probe completed in the original Lecture surface

Official System questions
= KianOS Question Runtime evidence after the System model exists
```

Do not force these into one unit because the current component tree happens to be simpler that way.

---

## 2｜Learner-facing information architecture

The Block workspace should follow three information lanes:

```text
LEFT
Position / Logic Map
"Where am I?"

CENTER
Primary Cognitive Path
"What am I actually learning / recalling / doing now?"

RIGHT
Attention Projection
"How much attention should the other relevant information receive now?"
```

### Left — Position

Use for Block/LG location and lightweight navigation. It is not a second content column and should not expand into engineering metadata.

### Center — Primary Cognitive Path

This is the dominant workspace. Depending on the current learner state it may show:

- Block / current causal problem;
- current Source-contact instruction / exact source;
- an actually useful cognitive Projection object;
- a Visual Gate / Extension when required;
- a TTSX checkpoint at a real Source boundary;
- Recall Front / Reveal / closure;
- official Question Runtime after the System reaches that stage.

Only the current main action should dominate.

### Right — Attention Projection

The right rail is **not primarily a workflow checklist**. Its main job is to spend Kian's attention for him.

Learner-facing groups should be natural-language forms of:

- **本轮带走** — important current material that should survive this pass;
- **按需辅助** — Visual / table / Source / Precision support only when useful now;
- **可以后置** — low-coupling precision / lists / details that must not block the main mechanism;
- **后面再学 / 串联** — a future owner or connection to notice without expanding now.

Backend labels such as `MI-G`, `MI-D`, `CURRENT_CORE`, `RESERVE_LEARNING`, `CONNECTION_HOOK`, `DEFERRED`, Projection roles and geometry are machine semantics. They should normally be translated into the learner-facing result rather than printed as taxonomy badges.

Block / Lecture / Recall / Complete progress may appear lightly, but it must not consume the entire right rail and displace Attention Projection.

---

## 3｜Canonical Current Runtime｜no parallel V7 / second runtime

The production routing remains one Runtime family:

```text
/xizong/
→ XizongHomeTools

/xizong/[system]/
→ XizongSystemV6
→ XizongSystemExitRuntime
→ XizongSystemRepairReturn
→ XizongSystemEvidenceGuard
→ XizongRuntimeStageGuard

/xizong/[system]/[block]/
→ XizongBlockV6
→ XizongMemoryReviewV6
→ Block Evidence / Stage / Repair / cue / enrichment support
```

`V6` is a historical implementation suffix, not a sixth live learner model. Do not create `V7`, a separate `SecondPassRuntime`, a Visual runtime, a TTSX runtime or another Evidence store to solve current integration problems.

When Current Learning semantics expose a mismatch in the component, fix the shared semantic adapter / Runtime / renderer rather than preserving an obsolete component assumption.

---

## 4｜TTSX / Lecture-attached question checkpoint

Lecture-attached TTSX is **not a duplicate KianOS question-taking surface**.

Ownership:

```text
Lecture / MarginNote owns
- answering the TTSX
- answer checking
- all options
- source-local explanation
- question-side expansion / supplements

KianOS owns
- Boundary / Binding release bookkeeping
- lightweight "this group is due" checkpoint
- completion confirmation
- optional question picker
- optional short reason / note
- routing selected W/U / expansion / confusion / connection / precision evidence later
```

Core rule:

```text
Boundary = WHEN
reviewed Binding = WHICH
```

No binding means no invented release. KianOS must not fall back to the official question corpus by similarity or proximity.

Default learner interaction should be minimal:

```text
TTSX · N questions
在讲义原位置完成，并看全部选项 / 题旁拓展

[已完成]

[选择值得留下的题]   [没有，继续]
```

Selecting a question does not immediately mutate canonical Knowledge. A retained note may later be classified as personal note, Memory/Precision, Connection, Repair evidence, Chat debrief or a reviewed Core candidate.

---

## 5｜Official Question Runtime / multi-pass / Crosswalk

Official questions use the existing shared Question Runtime and append-preserved attempt history.

```text
stable question identity
├─ current-round progress
└─ attemptHistory
     ├─ FIRST_PASS
     ├─ SECOND_PASS
     └─ LATE_REVIEW
```

FIRST_PASS official sweep, SECOND_PASS and later review are phases / task conditions of the same question product.

Current second-pass behavior already includes targeted re-entry from previous Wrong / Uncertain / repaired-not-fresh-verified evidence; Stable work does not need mandatory full repetition, while explicit full re-sweep may remain an opt-in mode.

The reviewed Question↔Knowledge interface is also a current capability:

- canonical positive truth is only explicit `REVIEWED` Question→Knowledge relation;
- reverse Block/KP→Questions lookup is derived from the same relation owner;
- missing mapping is legal and does not block practice;
- Runtime must not infer a relation from title, disease name, page adjacency, Block membership or model intuition.

Crosswalk content may continue to grow without changing the product skeleton.

---

## 6｜Visual / Precision / Extension

Visual is conditional support in the main learning chain, not a separate completion program.

Use this conceptual ladder:

```text
Visual Truth
original Lecture / PDF / reviewed source
        ↓
Visual Gate
"does this learner object genuinely require seeing a visual?"
        ↓
Extension Slot (optional)
"is there a persistent web asset that materially improves repeat use?"
        ↓
Attention / Projection timing
"should Kian see it now, after Reveal, or only on demand?"
```

The generic Extension Asset layer is Current and supports:

- `SOURCE_VISUAL`;
- `STRUCTURED_TABLE`;
- `SUMMARY_VISUAL`.

Existing legacy `*-source-visuals.json` packs remain compatible; they are not the preferred reason to keep building a system-wide screenshot catalog.

Hard rule:

> **Visual Gate ≠ required web asset ≠ screenshot backlog ≠ learner completion.**

Future Visual / Extension content should usually be added or improved because actual learning shows repeated value, a visual-recognition need, a spatial/mechanistic need, or a superior reviewed MarginNote/user summary exists. Do not bulk-produce an entire System merely for visual coverage symmetry.

Precision remains orthogonal to Visual. High-value exactness may be current or deferred based on learning timing; it is not automatically a large UI component.

Current formal Extension ownership / replacement rules live in `content/xizong/EXTENSION_ASSET_CONTRACT.md`; capability boundaries live in `XIZONG_VISUAL_PRECISION_CAPABILITY.md`.

---

## 7｜Projection / semantic presentation

Projection exists between learning/content semantics and final Astro layout:

```text
Current medical / learning owners
→ shared semantic adapter
→ cognitive / semantic presentation objects
→ shared renderer
→ learner UI
```

Projection may decide semantic role, cognitive geometry and stage-safe visibility. It may not invent medical truth, learner state, question relations or Source locators.

Current durable role / geometry ideas remain useful, but historical Projection assets and manifest status are not allowed to overrule newer accepted Learning owners.

Known Current reconciliation facts:

- A1 / A2 / A3 / B already have compiled Projection assets;
- C now has accepted Knowledge + Learning and is eligible for Projection, including explicit / non-contiguous LG membership;
- the old Projection manifest still contains stale C eligibility / runtime-adoption status and must be reconciled before the next P promotion;
- production Block rendering historically bypassed much of the rich Projection layer; active Projection→Astro work must consume the unified semantic adapter rather than duplicate legacy System-specific loaders;
- System-specific Source-contact semantics must survive: B and C need not use identical Source-contact granularity simply to share one renderer.

Do not interpret `role / geometry` as learner-facing labels. The learner should see the mechanism chain, comparison, boundary or exact item itself, not `CHAIN / MATRIX / EXACT` engineering words.

---

## 8｜Content / System availability

Knowledge inventory and product readiness are different dimensions.

The lane has a broad canonical Knowledge base; individual Systems may be at different K/L/P/R/E stages. Progressive availability remains legal:

```text
engineering/content not yet available
≠ learner prerequisite failed
≠ learner debt
≠ permission to fake placeholder content
```

A1/A2/A3 have accepted engineering learner paths through Evidence for their named scopes; B/C have accepted modern K/L owners but still require downstream Projection/product reconciliation; later Systems continue their own content/learning acceptance work independently.

Do not wait for every System, every Visual, every Crosswalk relation or every future Extension before improving the shared learner product. Conversely, do not claim a later System is ready merely because the shared renderer exists.

---

## 9｜Presentation / visual direction

Current Mac-wide direction remains:

- useful density, not tiny text;
- continuous workspace, not endless independent cards;
- large readable learner text;
- low decorative chrome;
- real horizontal space usage;
- task-native geometry;
- no engineering terminology on the learner surface;
- no second Lecture reader in Astro;
- neutral Recall fronts are workspace-wide, including side rails / visuals / precision / tooltips.

A System / Block / LG / KP / Visual / question is not entitled to a separate card just because it exists as a data object.

The Presentation Contract remains binding:

```text
Learning Logic
→ content semantics
→ cognitive state
→ semantic presentation objects
→ spatial representation
→ Astro
```

Not:

```text
JSON fields / Markdown headings
→ cards / sections / buttons
→ page
```

---

## 10｜Current next product sequence

Do not continue broad UI polish or bulk Visual production before the shared semantics are reconciled.

```text
1. Current learning/product authority consolidation
2. shared A1/A2/A3/B/C semantic adapter
   - Logic Group identity/membership
   - Source-contact segment
   - retrieval point
   - TTSX boundary/binding checkpoint
   - Attention items
   - Visual Gate / Extension refs
3. reconcile Projection manifest / compiler with Current Learning truth
4. update production Block renderer to consume semantic objects
5. representative Golden Journey
6. B + C compatibility acceptance
7. only then final Xizong UI convergence
8. later Systems / Visuals / Crosswalk continue additively
```

Real learner U remains external and path-scoped.
