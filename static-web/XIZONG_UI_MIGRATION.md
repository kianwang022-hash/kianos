# Xizong UI Architecture Migration

Status: **ACTIVE MIGRATION · Slice 1 ACCEPTED · Slice 2A HOME ACCEPTED · Slice 2B MEMORY ACTIVE**  
Scope: Xizong learner-facing presentation implementation only  
Parent authority: `content/xizong/CURRENT.md` + `PRESENTATION_CONTRACT.md` + `UI_STYLE_BRIEF.md` + `PROJECT_MANAGEMENT_CONTRACT.md`

This file is a migration ledger, not a new Product/Learning/Runtime/Acceptance truth owner.

## Goal

Move Xizong learner surfaces from accumulated legacy presentation ownership into the Current UI architecture without changing medical truth, learning semantics, learner state, Memory semantics, Question truth, Evidence or Repair behavior.

Target architecture:

```text
shared Base Shell / global K rail      <- owned outside Xizong; consume from main
            ↓
shared tokens / presentation grammar
            ↓
Xizong subject shell primitives
            ↓
exact surface owner
  Home
  System
  Block
  Memory
  System Exit / Question
```

Hard invariant:

> One active visual owner per presentation responsibility. No permanent cascade stack of legacy lane CSS + new surface CSS + page inline patch + component inline patch.

## Migration method

Follow small vertical replacement slices:

```text
observe existing Current behavior
→ preserve semantic/runtime behavior
→ move one surface to its intended owner
→ prove representative browser behavior
→ cut over that responsibility
→ remove the superseded path from the active runtime
→ physically delete dead compatibility/legacy code when its containing owner can be safely cleaned
→ only then expand or close the migration
```

Shared Base Shell / global rail are explicitly out of scope until the parallel English-owned shared-shell change lands on `main`.

---

## Slice 1 — System Workspace single visual owner

**State:** **ACCEPTED / CUT OVER ON MAIN via PR #368**

### OLD

System Workspace behavior was Current after PR #339, but presentation responsibility was split across:

- `static-web/src/styles/xizong-presentation.css` legacy System rules;
- `static-web/src/styles/xizong-system-workspace.css` convergence overrides;
- `static-web/src/components/XizongSystemV6.astro` component-local `<style>`;
- `static-web/src/pages/xizong/[system]/index.astro` page-global style patch.

The learner effect could be acceptable while ownership was not.

### NEW CURRENT

Current route:

```text
xizong/[system]/index.astro
→ XizongSystemWorkspace.astro
→ xizong-system-workspace.css
```

Implementation boundary:

- `XizongSystemWorkspace.astro` owns semantic markup + interaction only;
- the route owns composition + later-stage wiring only;
- `xizong-system-workspace.css` owns first-pass System presentation;
- Current DOM uses an `xzSystem*` namespace;
- retired `xv6System*` / related legacy selectors therefore cannot match the Current System DOM;
- `XizongSystemV6.astro` is deleted;
- route/component visual `<style>` blocks are deleted.

The old System selector block inside broad `xizong-presentation.css` is now **inactive dead migration code**, not an active visual owner. Its physical removal is tracked under final legacy cleanup because that broad file still owns other not-yet-migrated Xizong surfaces.

### ACCEPTANCE EVIDENCE

PR #368 was promoted only after all triggered gates passed on the accepted head:

- Xizong System Workspace — PASS;
- Xizong Representation Gate — PASS;
- Xizong Production Semantic Projection — PASS;
- Xizong Representative Workspace — PASS;
- Static Web Xizong QA — PASS;
- Xizong Golden Journey — PASS;
- Xizong A2 Functional First Journey — PASS.

Representative browser evidence additionally confirmed A1/A2/A3 System Current namespace, purpose-first representation, Block selection, Failure behavior, no dependency auto-graph, Mac-wide three-region geometry and a 15px visible learner-text floor.

Three stale validation consumers that still named `XizongSystemV6.astro` were migrated to the Current owner during acceptance rather than restoring a compatibility V6 path:

- `validate-xizong-representation-gate.mjs`;
- `validate-xizong-learning.mjs`;
- `validate-xizong-a1-projection.mjs`.

### MACHINE GUARDS

- `scripts/validate-xizong-system-style-ownership.mjs` fails if the route/component regains CSS ownership, legacy `xv6*` class tokens return to the Current component, `!important` recovery appears, or the retired V6 component returns;
- `scripts/test-xizong-system-workspace.mjs` checks A1/A2/A3 Current namespace, purpose-first representation, 15px visible-text floor, three-region geometry, Block selection, Failure behavior and no generated dependency graph;
- `.github/workflows/xizong-system-workspace.yml` provides targeted build + browser acceptance for this surface.

### CLOSED CUTOVER

Already removed from the active runtime:

- `XizongSystemV6.astro`;
- component-local System style block;
- page-local System style block;
- Current DOM dependency on `xv6System*` selectors.

Remaining physical dead-code deletion:

- remove the unreachable historical System selectors from `xizong-presentation.css` during the bounded legacy-cleanup slice after adjacent owners are separated, so editing that broad file cannot accidentally damage Home/Block/other still-current rules.

### ROLLBACK / FAIL-CLOSED

A future System defect must be repaired at the Current owner. Do not restore a compatibility V6 component, duplicate route CSS or second System visual stylesheet.

---

## Slice 2A — Home single visual owner

**State:** **ACCEPTED / CUT OVER ON MAIN via PR #370**

### OLD

Home presentation was split between broad `xizong-presentation.css` (`xzOverview*`, `xzSystemWorkbench`, `xzOpenDomain`, etc.) and component-local tiny-font CSS in `XizongHomeTools.astro`. Standalone Memory was not a first-class Home action.

### NEW CURRENT

Current Home now uses:

```text
xizong/index.astro
→ XizongHomeTools.astro
→ xizong-home-workspace.css
```

- Current DOM uses isolated `xzHome*` classes;
- `XizongHomeTools.astro` owns Continue/Memory behavior and markup only;
- `xizong-home-workspace.css` is the Home visual owner;
- Home exposes explicit standalone Memory access;
- A1/A2/A3 current System work remains dominant;
- the current learning chain is the bounded companion;
- B–F future-domain orientation is a horizontal band after the current workspace, not a tall companion rail.

### VISUAL ACCEPTANCE

The first browser-valid candidate was **rejected visually**: future B–F domains stretched the right rail and left a large dead region under A3. The layout was changed structurally rather than repaired with spacing overrides.

The accepted second candidate was manually screenshot-reviewed and then promoted after all triggered gates passed. Representative Home geometry at the acceptance viewport:

- Home workspace width: `1188px`;
- current Systems main region: `876px`;
- companion: `310px`;
- visible learner-text floor: `15px`;
- future band begins immediately after the current workspace.

### ACCEPTANCE EVIDENCE

PR #370 was promoted only after all triggered gates passed on the accepted head:

- Xizong Home Workspace — PASS;
- Xizong Representation Gate — PASS;
- Xizong Production Semantic Projection — PASS;
- Xizong Representative Workspace — PASS;
- Static Web Xizong QA — PASS;
- Xizong Golden Journey — PASS;
- Xizong A2 Functional First Journey — PASS.

Targeted Home acceptance additionally guards:

- one Home visual owner;
- no route/component `<style>` ownership;
- no retired Home class namespace in Current DOM;
- no `!important` recovery;
- explicit standalone Memory route;
- last-location Continue restoration;
- 15px visible type floor;
- current workspace dominance;
- future-domain horizontal placement outside the companion.

### CLOSED CUTOVER

Removed from active Home runtime ownership:

- component-local Home tool CSS;
- Current DOM dependency on old `xzOverview* / xizongHomeTools / xizongContinue` presentation classes.

Old Home selectors inside broad `xizong-presentation.css` are now unreachable dead migration code and remain queued for bounded physical cleanup after adjacent responsibilities are separated.

---

## Slice 2B — Memory single-owner readability migration

**State:** **ACTIVE**

### CURRENT ARCHITECTURE FACT

Memory is different from old Home/System: broad `xizong-presentation.css` does not currently own `xzMemory*`, so Memory is not suffering from an active two-stylesheet cascade.

Its problem is that its **single component-local visual owner is itself legacy**. `XizongMemoryWorkspace.astro` still contains a large inline `<style>` block with many default-visible learner labels and controls at roughly `8–13px`, far below the Current shared 15px floor.

Examples include queue metadata, tabs, toolbar text, card labels/meta, reveal/rating controls, Repair labels and context rail copy.

### NEW TARGET

Preserve all Memory Runtime semantics while moving presentation into one explicit Memory surface owner:

```text
xizong/memory/index.astro
→ XizongMemoryWorkspace.astro      markup + runtime only
→ xizong-memory-workspace.css      presentation only
```

Hard boundaries:

- preserve `Today | Core | Precision | Marked | Repair`;
- preserve localStorage keys/state shape, learner ratings, Marked/Repair behavior, Prompt editing, reveal gating and keyboard behavior;
- preserve Memory/Evidence semantics exactly;
- do not create `memory-polish.css`, `peripheral-workspaces.css`, route-inline fixes or `!important` recovery;
- 15px is the visible learner-text floor, not the target body size;
- use Mac width to preserve readable queue/stage/context geometry rather than compensating with tiny text.

### SUCCESS TEST

- one explicit Memory visual owner;
- no component/route visual `<style>` block after cutover;
- `Today | Core | Precision | Marked | Repair` remains available;
- real browser journey proves queue navigation, reveal, rating and at least one Marked/Repair path still function;
- visible learner text is never below 15px on the representative Mac surface;
- main Memory cognitive stage remains dominant and rails stay readable;
- screenshot review confirms high density without tiny admin-style chrome.

### CUTOVER / DELETE CONDITION

The component-local legacy style block is removed in the same accepted slice. Do not leave an inactive second Memory owner behind merely because the external stylesheet wins.

---

## Slice 3 — System Exit / official Question ownership convergence

**State:** AFTER Slice 2B unless a concrete dependency changes scheduling

### OLD

Later-stage System Exit / Question presentation remains mixed with broad Xizong presentation/runtime component styling; #351 attempts to improve readability through another override layer.

### NEW

One explicit later-stage surface owner, preserving the existing System Recall → official System sweep → Repair/Return semantics and exact question/runtime truth.

### SUCCESS TEST

Readable System Recall and official-question workspace with no change to Question Truth, Crosswalk, attempt history, Repair or Evidence semantics.

### DELETE CONDITION

Remove superseded later-stage presentation ownership after representative real-system browser acceptance passes.

---

## Slice 4 — Legacy cleanup + shared Shell adoption

Only after migrated surfaces are stable:

- identify broad `xizong-presentation.css` selectors that no Current DOM can reach;
- physically delete obsolete System/Home/Memory/later-stage compatibility and legacy paths in bounded groups;
- preserve Block rules until Block receives its own migration/ownership decision rather than deleting them for symmetry;
- resync from `main` after the English-owned shared Base Shell / collapsible global K rail lands;
- adapt only Xizong-local geometry needed to coexist with that accepted shared Shell;
- never reimplement the global rail inside Xizong.

Migration is complete only when old and new paths no longer compete for responsibility **and** unreachable migration code has been physically removed or explicitly retained for a named still-current owner.

## PR discipline

Each implementation PR answers one acceptance question. Do not mix the shared-shell program, Xizong semantic changes, content changes, or unrelated lane work into this migration.
