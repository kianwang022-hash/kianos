# Xizong UI Architecture Migration

Status: **ACTIVE MIGRATION · System / Home / Memory CUT OVER · Slice 3 ACTIVE**  
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

## Active Slice 3 — System Exit / official Question

**STATE: ACTIVE**

### Purpose

Converge the later-stage learner surface without changing the already-accepted execution chain:

```text
System learned
→ System Recall
→ official System question sweep
→ W/U evidence
→ smallest-sufficient Repair / exact Return
```

### First action: ownership audit, not polish

Before writing CSS, identify the Current ownership graph for:

- `XizongSystemExitRuntime.astro`;
- System route composition/wiring;
- official Question workspace markup;
- broad `xizong-presentation.css` / other Xizong styles that currently match the later-stage DOM;
- component-local or route-local style blocks;
- existing browser/contract validators that consume the later-stage surface.

Classify each current responsibility as:

```text
SEMANTIC / RUNTIME OWNER        preserve
CURRENT VISUAL OWNER            migrate or retain explicitly
LEGACY COMPETING OWNER          cut over / retire
DEAD SELECTOR                   queue for bounded cleanup
TEST CONSUMER                   migrate with owner if needed
```

### Hard boundaries

Preserve exactly:

- System Recall state/reveal/completion;
- holdout behavior;
- Question Truth and exact System membership boundaries;
- FIRST_PASS / SECOND_PASS / LATE_REVIEW attempt history;
- reviewed Crosswalk behavior and legal missing mapping;
- Wrong / Uncertain repair routing;
- Evidence / Repair / Return semantics;
- no learner-U claim from CI.

Do not inherit from draft PR #351 by default:

- `xizong-peripheral-workspaces.css` as a second visual owner;
- route-level duplicate Recall-dialog click fallback;
- inline typography recovery.

The #351 fallback may return only if a fresh browser journey proves a real defect in the actual Runtime owner; repair that owner rather than keeping duplicate route behavior.

### Target architecture

One explicit later-stage presentation owner. Exact filename/component boundary must be chosen only after the ownership audit proves where the Current responsibility actually belongs.

### Acceptance requirements

At minimum:

- static single-owner / no-cascade-recovery gate;
- Astro build;
- real A1 System Recall journey;
- real official-question entry and answer persistence;
- reviewed relation + missing relation behavior preserved;
- W/U repair/return behavior preserved;
- second-pass behavior preserved where already Current;
- 15px visible type floor across Recall + Question states;
- representative Mac geometry;
- screenshot inspection before merge;
- broad Xizong regressions green on the accepted exact head.

---

## Later Slice 4 — Bounded legacy cleanup + shared Shell adoption

Only after active surfaces are isolated:

- identify broad `xizong-presentation.css` selectors no Current DOM can reach;
- physically delete obsolete System/Home/later-stage compatibility code in bounded groups;
- preserve Block rules until Block receives an explicit ownership decision rather than deleting them for symmetry;
- resync from `main` after English-owned shared Base Shell / collapsible global `K` rail lands;
- adapt only Xizong-local geometry needed to coexist with that accepted shared Shell;
- never reimplement the global rail inside Xizong.

Migration closes only when competing active paths are gone **and** dead migration code is either physically removed or explicitly retained for a named still-current owner.

## PR discipline

Each implementation PR answers one acceptance question. Do not mix shared-shell work, Xizong semantic changes, content changes, unrelated lane work, or multiple presentation slices into the same PR.
