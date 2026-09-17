# Xizong UI Architecture Migration

Status: **ACTIVE MIGRATION · Slice 1 candidate implemented, acceptance pending**  
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

**State:** IMPLEMENTED CANDIDATE · targeted CI/browser acceptance still required

### OLD

System Workspace behavior was Current after PR #339, but presentation responsibility was split across:

- `static-web/src/styles/xizong-presentation.css` legacy System rules;
- `static-web/src/styles/xizong-system-workspace.css` convergence overrides;
- `static-web/src/components/XizongSystemV6.astro` component-local `<style>`;
- `static-web/src/pages/xizong/[system]/index.astro` page-global style patch.

The learner effect could be acceptable while ownership was not.

### NEW CANDIDATE

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

### MACHINE GUARDS

- `scripts/validate-xizong-system-style-ownership.mjs` fails if the route/component regains CSS ownership, legacy `xv6*` class tokens return to the Current component, `!important` recovery appears, or the retired V6 component returns;
- `scripts/test-xizong-system-workspace.mjs` checks A1/A2/A3 Current namespace, purpose-first representation, 15px visible-text floor, three-region geometry, Block selection, Failure behavior and no generated dependency graph;
- `.github/workflows/xizong-system-workspace.yml` provides targeted build + browser acceptance for this surface.

### SUCCESS TEST

Representative A1/A2/A3 System pages preserve:

- purpose-first framework composition;
- ordered System spine behavior;
- Block selection + Enter behavior;
- Failure focus behavior;
- dependency no-auto-graph behavior;
- readable learner text floor;
- stable Mac-wide three-region workspace;
- no System Recall leak into normal first-pass System Framework.

### CUTOVER CONDITION

Targeted ownership validation, Astro build and representative browser acceptance all pass on the candidate PR without relying on retired System DOM/classes/component/page style owners.

### DELETE CONDITION

Already deleted from the active runtime:

- `XizongSystemV6.astro`;
- component-local System style block;
- page-local System style block;
- Current DOM dependency on `xv6System*` selectors.

Remaining physical dead-code deletion:

- remove the unreachable historical System selectors from `xizong-presentation.css` during the bounded legacy-cleanup slice after adjacent owners are separated, so editing that broad file cannot accidentally damage Home/Block/other still-current rules.

### ROLLBACK / FAIL-CLOSED

If semantic/runtime behavior changes or representative System browser acceptance regresses, do not restore a compatibility override stack. Repair or revert the new isolated System surface before promotion.

---

## Slice 2 — Home + Memory ownership convergence

**State:** NEXT after Slice 1 acceptance

### OLD

Home styles currently live inside broad `xizong-presentation.css`. Memory has substantial component-local styling. Draft PR #351 proposes an additional `xizong-peripheral-workspaces.css` override layer.

### NEW

- preserve useful product changes from #351 only where still justified, especially an explicit standalone Memory entry from Xizong Home;
- Home presentation receives one clear Xizong Home owner;
- Memory presentation receives one clear Memory owner;
- do not land `xizong-peripheral-workspaces.css` as a permanent second owner.

### SUCCESS TEST

Home remains a dense learner workbench with meaningful Continue/System entry and explicit Memory access. Memory preserves `Today | Core | Precision | Marked | Repair`, current keyboard/evidence behavior and readable Mac-wide geometry.

### DELETE CONDITION

After accepted cutover, remove the superseded Home/Memory rules from active runtime ownership and component inline style blocks. Broad-file dead selectors may then be physically removed in the bounded cleanup slice.

---

## Slice 3 — System Exit / official Question ownership convergence

**State:** AFTER Slice 2 unless a concrete dependency changes scheduling

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
