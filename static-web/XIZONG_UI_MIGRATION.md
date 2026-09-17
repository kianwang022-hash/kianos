# Xizong UI Architecture Migration

Status: **ACTIVE MIGRATION · System / Home / Memory / System Exit CUT OVER · Slice 4 ACTIVE**  
Scope: Xizong learner-facing presentation implementation only  
Parent authority: `content/xizong/CURRENT.md` + `PRESENTATION_CONTRACT.md` + `UI_STYLE_BRIEF.md` + `PROJECT_MANAGEMENT_CONTRACT.md`

This file is a migration ledger / work router. It does not own medical truth, Learning semantics, Runtime semantics, Question Truth, Acceptance Truth, Evidence, Repair semantics, or learner state.

## Goal

Move Xizong learner surfaces from accumulated legacy presentation ownership into a Current architecture with one active visual owner per responsibility:

```text
shared Base Shell / global K rail      <- external Xizong ownership; consume from main
            ↓
shared tokens / presentation grammar
            ↓
Xizong subject primitives
            ↓
exact surface owner
  Home
  System Framework
  Block
  Memory
  System Exit / Question
```

Hard invariant:

> One active visual owner per presentation responsibility. Do not solve a migration by stacking legacy CSS + new surface CSS + page patch + component patch.

## Migration method

```text
read Current owner + real Runtime
→ preserve semantic/runtime behavior
→ isolate one surface responsibility
→ cut DOM/style ownership to one Current owner
→ run targeted static + browser acceptance
→ inspect screenshot, not only CI
→ run broad regressions
→ merge exact accepted head
→ update Current cursor
→ only then move to the next slice
```

Shared Base Shell / collapsible global `K` rail remain outside this lane until the parallel English-owned implementation lands on `main`.

---

## Closed Slice 1 — System Framework

**ACCEPTED / CUT OVER via PR #368 · merge `64231e8c`**

Current chain:

```text
xizong/[system]/index.astro
→ XizongSystemWorkspace.astro
→ xizong-system-workspace.css
```

Closed facts:

- retired `XizongSystemV6.astro` deleted;
- Current DOM uses isolated `xzSystem*` namespace;
- component owns markup + interaction, route owns composition/later-stage wiring, stylesheet owns System Framework presentation;
- component/route visual `<style>` paths removed;
- stale validators that named V6 were migrated to Current owner instead of restoring compatibility;
- A1/A2/A3 browser acceptance proved purpose-first representation, Block selection, Failure behavior, no dependency auto-graph, Mac-wide three-region geometry and 15px visible type floor;
- all triggered broad gates passed before merge.

Unreachable historical System selectors still inside broad `xizong-presentation.css` are dead migration code, not active owners. Physical deletion is reserved for the bounded cleanup slice after adjacent responsibilities are isolated.

---

## Closed Slice 2A — Home

**ACCEPTED / CUT OVER via PR #370 · merge `2782505e`**

Current chain:

```text
xizong/index.astro
→ XizongHomeTools.astro
→ xizong-home-workspace.css
```

Closed facts:

- Current Home uses isolated `xzHome*` namespace;
- `XizongHomeTools.astro` has behavior/markup responsibility only;
- explicit standalone Memory entry is Current;
- A1/A2/A3 current System work remains dominant;
- B–F global orientation moved to a horizontal band below the current workspace rather than stretching the companion rail;
- the first browser-valid layout was rejected after screenshot inspection because it created dead main-area space; the structural layout was revised and re-tested;
- accepted representative geometry: `876px` current-System main region + `310px` companion; visible type floor `15px`;
- all triggered broad gates passed before merge.

Old Home selectors in broad `xizong-presentation.css` are now unreachable dead migration code and remain queued for bounded cleanup.

---

## Closed Slice 2B — Standalone Memory

**ACCEPTED / CUT OVER via PR #371 · merge `c8bb673c`**

Current chain:

```text
xizong/memory/index.astro
→ XizongMemoryWorkspace.astro          markup + exact existing Runtime
→ xizong-memory-workspace.css          presentation only
```

Closed facts:

- the original component-local Memory `<style>` owner was removed;
- route explicitly loads the single Memory stylesheet;
- no second `memory-polish.css`, peripheral override layer, route style patch, or `!important` recovery exists;
- Current Memory markup + Runtime were preserved exactly; the accepted component diff only removes the old `<style>` block;
- an early candidate accidentally changed markup / Runtime-adjacent selectors and was explicitly rejected/reverted before acceptance;
- `Today | Core | Precision | Marked | Repair`, Precision Browse/Recall, Prompt override/reset, Marked fragments, Repair tasks, reveal/rating/keyboard behavior, localStorage state, evidence append semantics and Block Complete auto-release remain Current behavior;
- Memory single-owner validator is wired into the existing Memory workflow rather than creating a parallel QA system;
- real Chromium acceptance covered Empty / Today / Core / Core Reveal / Precision Browse / Precision Recall / Marked / Repair;
- visible learner type floor = `15px` in every tested state;
- accepted representative geometry = `1480px` root / `286px` queue / `932px` dominant stage / `260px` context;
- Block Complete → Memory auto-release browser journey remained green;
- all seven triggered Xizong gates passed before merge.

Memory is therefore closed as an architecture slice. Reopen only for a concrete Current defect or real learner-U finding; do not add a second visual owner.

---

## Closed Slice 3 — System Exit / official Question

**ACCEPTED / CUT OVER via PR #374 · merge `0354db9c`**

Current chain:

```text
xizong/[system]/index.astro
→ XizongSystemExitRuntime.astro        markup + exact existing Runtime
→ XizongQuestionCrosswalkConsumer.astro
→ XizongSystemRepairReturn.astro
→ xizong-system-exit-workspace.css     single later-stage presentation owner
```

Closed facts:

- Current later-stage route uses isolated outer namespace `xzExitStage`;
- broad legacy interception points were cut away with Current-only `xzExitCard`, `xzExitStem` and `xzExitOptions` classes while behavior selectors such as `.xseQuestion`, `.xseOption` and `data-*` remained intact;
- component-local `<style>` owners were removed from System Exit, reviewed Crosswalk and Repair Return;
- no route-level duplicate Recall fallback, second peripheral stylesheet or `!important` recovery layer was admitted;
- accepted `XizongSystemExitRuntime.astro` script semantics were unchanged by the presentation migration;
- Recall / holdout / FIRST_PASS / SECOND_PASS / W/U / exact reviewed Crosswalk / legal missing mapping / Repair Return storage and evidence contracts remained intact;
- the first browser-gate failure was traced to an invalid test fixture that attempted System Recall before all Blocks were completed; the product's existing `XizongRuntimeStageGuard` correctly blocked it, so the fixture was repaired instead of weakening Runtime semantics;
- real Chromium acceptance then proved the legal flow from completed-System prerequisite → System Recall → whole-paper holdout → official Question → Wrong/Repair → targeted SECOND_PASS → reviewed exact Crosswalk and missing-mapping fallback;
- A1 Current Question Truth remained `376` qids in the gate;
- visible learner type floor = `15px` in every tested Recall / Question / Answer / Crosswalk / Repair state;
- accepted representative later-stage geometry = `1256px` stage / `1254px` exit root / `1226px` three-step region;
- clean-head Recall and Question screenshots were manually inspected before merge;
- Static Web Xizong QA, Representation Gate, Production Semantic Projection, Golden Journey, A2 Functional First Journey, Representative Workspace and the dedicated System Exit Workspace gate all passed on the exact accepted head;
- PR diff returned to the intended 8-file scope after temporary diagnostics were removed.

System Exit / official Question is therefore closed as an architecture slice. Reopen only for a concrete Current Runtime/presentation defect or real learner-U finding; do not add another visual owner.

Unreachable historical later-stage selectors still physically present in broad Xizong styles are cleanup debt only and move to Slice 4.

---

## Active Slice 4 — Bounded legacy cleanup + gated shared Shell adoption

**STATE: ACTIVE**

This slice is cleanup/integration only. It must not reopen the accepted System/Home/Memory/System Exit architectures merely because old selectors still exist elsewhere.

### First action — prove deadness before deletion

Audit broad legacy Xizong selectors against Current DOM for the already-isolated surfaces:

- System Framework (`xzSystem*` owner already Current);
- Home (`xzHome*` owner already Current);
- standalone Memory (`xizong-memory-workspace.css` owner already Current);
- System Exit / official Question (`xzExit*` + `xizong-system-exit-workspace.css` owner already Current).

Classify each legacy rule as:

```text
UNREACHABLE CLOSED-SURFACE DEBT    delete in bounded groups
STILL-CURRENT BLOCK RULE           preserve
SHARED / CROSS-SURFACE RULE        preserve unless a Current owner replaces it
AMBIGUOUS                           do not delete until reachability is proven
```

Primary cleanup targets may include dead selectors in broad `xizong-presentation.css` and legacy child selectors in `xizong-system-workspace.css`, but file name alone is never evidence that a rule is dead.

### Block boundary

Block has a Current one-screen workspace but has not been admitted into this migration merely for symmetry. Do not delete Block rules because adjacent surfaces now have isolated owners. A Block presentation ownership decision must be explicit and independently accepted.

### Shared Shell gate

Shared Base Shell / collapsible global `K` rail remain owned by the parallel English UI lane.

```text
if accepted shared Shell is on main
  → consume it
  → adapt only Xizong-local geometry where necessary
else
  → do not reimplement or locally patch the Shell
  → continue only the bounded dead-selector cleanup that is independently safe
```

A shared-shell defect found from Xizong must be routed back to the shared-shell owner rather than fixed with a Xizong fork.

### Acceptance requirements

At minimum:

- every deleted selector has a demonstrated no-Current-DOM reachability basis;
- no new visual owner or compatibility stylesheet appears;
- no Runtime / Learning / Question / Evidence semantics change;
- Block/current shared rules remain intact unless separately admitted and proven;
- targeted owner validators remain green;
- Astro build remains green;
- representative A1/A2/A3 browser journeys remain green;
- System Exit dedicated browser acceptance remains green;
- screenshots are inspected if geometry changes at all;
- broad Xizong regressions are green on the exact accepted head;
- shared Shell is consumed only from accepted `main`, never reconstructed here.

Migration closes only when competing active paths are gone **and** dead migration code is either physically removed or explicitly retained for a named still-current owner.

## PR discipline

Each implementation PR answers one acceptance question. Do not mix shared-shell work, Xizong semantic changes, content changes, unrelated lane work, or multiple presentation slices into the same PR.
