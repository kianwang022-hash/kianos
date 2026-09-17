# Xizong UI Architecture Migration

Status: **ACTIVE MIGRATION · Home / System / Memory / System Exit CUT OVER · closed-surface cleanup through Slice 4C LANDED · ownership-graph audit ACTIVE**  
Scope: Xizong learner-facing presentation implementation only  
Parent authority: `content/xizong/CURRENT.md` + `PRESENTATION_CONTRACT.md` + `UI_STYLE_BRIEF.md` + `PROJECT_MANAGEMENT_CONTRACT.md`

This file is a migration ledger / work router. It does not own medical truth, Learning semantics, Runtime semantics, Question Truth, Acceptance Truth, Evidence, Repair semantics, Shared Platform semantics, or learner state.

## Goal

Move Xizong learner surfaces from accumulated presentation overlap into a Current architecture with one active visual owner per responsibility:

```text
shared Base Shell / global K rail      <- Shared Platform owner; consume from main
            ↓
shared tokens / presentation grammar
            ↓
Xizong subject primitives
            ↓
exact Xizong surface owner
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
→ isolate one presentation responsibility
→ cut ownership to one Current owner
→ run targeted static + browser acceptance
→ inspect screenshots when geometry can change
→ run broad regressions
→ honor KianOS Semantic Base validity for newer main changes
→ merge the accepted product head
→ update Current/status only after landed fact
```

`main` SHA movement alone is not a reason to rebase or merge-from-main. Follow `KianOS Semantic Base`: reconcile only when a newer change hits this work's real Impact Cone.

The shared Base Shell / collapsible global `K` rail is already Current on `main` via PR #367 and is owned outside Xizong. Xizong consumes that registered Shared Platform owner and must not fork it.

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
- component owns markup + interaction, route owns composition/wiring, stylesheet owns System Framework presentation;
- component/route visual `<style>` paths removed;
- A1/A2/A3 browser acceptance proved purpose-first representation, Block selection, Failure behavior, Mac-wide geometry and 15px visible type floor;
- shared Shell remained external ownership and was consumed from `main`.

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
- standalone Memory entry is explicit;
- current A1/A2/A3 System work remains dominant and later domains remain orientation, not learner debt;
- accepted representative geometry = `876px` current-System main + `310px` companion;
- visible type floor = `15px`;
- screenshot review rejected one browser-valid but visually wasteful candidate before the accepted structure landed.

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

- component-local Memory `<style>` owner removed;
- exact Memory markup + Runtime behavior preserved;
- no second polish stylesheet, route patch or cascade-recovery layer exists;
- Empty / Today / Core / Core Reveal / Precision Browse / Precision Recall / Marked / Repair browser states passed;
- Block Complete → Memory auto-release remained green;
- accepted geometry = `1480px` root / `286px` queue / `932px` stage / `260px` context;
- visible type floor = `15px`.

Memory reopens only for a concrete Current defect or real learner-U finding.

---

## Closed Slice 3 — System Exit / official Question

**ACCEPTED / CUT OVER via PR #374 · merge `0354db9c`**

Current chain:

```text
xizong/[system]/index.astro
→ XizongSystemExitRuntime.astro        markup + exact existing Runtime
→ XizongQuestionCrosswalkConsumer.astro
→ XizongSystemRepairReturn.astro
→ xizong-system-exit-workspace.css     dedicated later-stage presentation owner
```

Closed facts:

- route uses `xzExitStage`; Current-only `xzExitCard`, `xzExitStem`, `xzExitOptions` prevent broad legacy interception;
- behavior selectors such as `.xseQuestion`, `.xseOption` and `data-*` remain intact;
- component-local styles were removed from Exit, Crosswalk and Repair Return;
- no route-level duplicate Recall fallback or new peripheral stylesheet was admitted;
- Runtime script semantics remained unchanged by the migration;
- legal journey passed: completed System prerequisite → System Recall → holdout → official Question → W/U Repair → targeted SECOND_PASS → exact reviewed Crosswalk / explicit missing-mapping fallback;
- A1 Question Truth remained `376` qids;
- accepted geometry = `1256px` stage / `1254px` exit root / `1226px` step board;
- visible type floor = `15px`.

The later cleanup slices below found and removed presentation debt that #374's first validator did not yet enumerate; they did not reopen Exit Runtime semantics.

---

## Closed Slice 4A — broad closed-surface legacy cleanup

**ACCEPTED / CUT OVER via PR #376 · merge `8e6dfa66`**

Acceptance question:

> Can unreachable Home / retired System Framework / broad System Exit rules be physically removed from `xizong-presentation.css` while preserving Current Block presentation and learner Runtime behavior?

Closed facts:

- removed `135` lines of unreachable closed-surface presentation debt;
- removed retired Home families (`xzOverview*`, `xzSystemWorkbench`, `xzOpenDomain*`, `xzSystemRow*`, `xizongHomeTools`, `xizongContinue`);
- removed retired System Framework `xv6System*` / mother-spine-failure/dependency families;
- removed broad Exit families such as `xseCard`, `xseStem`, `xseOptions`, `xseRecall`, `xseNav`, `xseActions`, `xseToolbar`, `xizongRepairInbox`;
- Current Block rules in the same broad file were intentionally preserved;
- ownership validators were advanced from “unreachable debt” to “physically absent”;
- Home / System / Exit / Representative / Golden / A2 / Static Xizong gates passed on the accepted head.

---

## Closed Slice 4B — later-stage residue cleanup

**ACCEPTED / CUT OVER via PR #377 · merge `0c8985e7`**

Acceptance question:

> Can the obsolete `.xizongLaterStage` family be removed from `xizong-system-workspace.css` after `xzExitStage` became the dedicated later-stage owner?

Closed facts:

- deleted only `46` dead `.xizongLaterStage` base / summary / child / responsive lines;
- every Current `xzSystem*` System Framework rule remained unchanged;
- `validate-xizong-system-exit-style-ownership.mjs` now requires the retired family to be physically absent;
- System Exit workflow now runs when the System workspace stylesheet changes because its ownership validator reads that file;
- System Workspace, System Exit Workspace and Static Web Xizong QA all passed on the accepted head;
- no Runtime / store / Question / Evidence / Learning semantics changed.

---

## Closed Slice 4C — dense-calm hidden-owner cleanup

**ACCEPTED / CUT OVER via PR #379 · merge `dd9e8d00`**

Fresh audit finding:

`xizong-dense-calm.css` was globally imported and still contained retired Home/System selectors plus **live `.xse*` Exit overrides**. Because Current Exit intentionally retains `.xse*` behavior classes, those rules still participated in the cascade; `.xseOption` even carried an `!important`. This was a real hidden second visual owner, not merely dead code.

Closed facts:

- deleted `148` lines of closed Home / retired System / competing Exit presentation from `xizong-dense-calm.css`;
- preserved its still-current Block and after-Learn rules unchanged;
- Home / System / Exit validators now inspect dense-calm and forbid it from reacquiring `xzHome*`, `xzSystem*`, `xzExit*`, `.xse*`, Crosswalk or Repair Return presentation responsibility;
- Home / System / Exit / Representative / Golden / A2 / Static Xizong QA plus Authority Consistency all passed on exact product head `6cb08440`;
- Exit Recall and Question screenshots were manually inspected after removing the competing `!important`; hierarchy, full-width Question options, neutral-green treatment and 15px floor remained accepted;
- `KianOS Semantic Base` classified later unrelated `main` movement as safe; the PR was not mechanically rebased solely for SHA drift;
- no Block markup / Runtime / Learning / Evidence or Shared Shell behavior changed.

---

## Active — remaining Xizong ownership graph audit

**STATE: AUDIT BEFORE NEXT SLICE**

Closed-surface cleanup is now reconciled through 4C. Do not invent another migration slice from historical file names or symmetry.

The audit must classify every remaining Xizong presentation path that can still affect a Current learner surface as one of:

```text
CURRENT EXACT-SURFACE OWNER
CURRENT BLOCK OWNER / BEHAVIOR-COUPLED GEOMETRY
SHARED PLATFORM OWNER
UNREACHABLE CLOSED-SURFACE DEBT
AMBIGUOUS — PRESERVE UNTIL PROVEN
```

Priority inspection area is the Current Block workspace because it predates the single-owner migration and currently composes several layers. This is a **candidate audit target, not yet an accepted rewrite mandate**.

At minimum inspect together:

- `XizongBlockV6.astro` component-local `<style>`;
- `XizongBlockWorkspaceShell.astro` global workspace styling;
- `XizongVisibleTypeFloor.astro` cascade-recovery type floor;
- `XizongBlockAuxLayoutSync.astro` behavior-coupled dynamic column geometry;
- remaining Block rules in `xizong-presentation.css`;
- remaining Block / after-Learn rules in `xizong-dense-calm.css`;
- Xizong rules in shared/broad style files such as `site-visual-tuning.css` and `viewport-workspaces.css`;
- any shared Shell/tokens only to classify ownership, never to fork them locally.

The audit must separate presentation from Runtime. A JS-computed geometry value used to reflect live aux weight/collapse state is not automatically legacy merely because it affects layout.

### Shared Shell boundary

Shared Base Shell / global `K` rail is already accepted Current infrastructure from the registered Shared Platform owner. Xizong has already run its later surface browser acceptance under that Shell.

Therefore:

```text
consume registered Shell from main
→ adapt only Xizong-local geometry when a real Xizong defect exists
→ route shared defects to the Shared Platform owner
→ never create a Xizong-specific fork of rail/navigation behavior
```

### Audit exit

Only after the graph is explicit may a next bounded implementation slice be named. Its acceptance question must identify one presentation responsibility, preserve exact Runtime semantics, and reuse existing browser evidence instead of creating a parallel QA system.

## PR discipline

Each implementation PR answers one acceptance question. Do not mix Shared Platform work, Xizong semantic changes, content changes, unrelated lane work, or multiple presentation responsibilities into the same PR.
