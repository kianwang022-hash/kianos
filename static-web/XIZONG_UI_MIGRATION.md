# Xizong UI Architecture Migration

Status: ACTIVE MIGRATION PLAN  
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
→ delete the superseded style path
→ only then expand to the next surface
```

Shared Base Shell / global rail are explicitly out of scope until the parallel English-owned shared-shell change lands on `main`.

---

## Slice 1 — System Workspace single visual owner

### OLD

System Workspace behavior is Current after PR #339, but presentation responsibility is split across:

- `static-web/src/styles/xizong-presentation.css` legacy System rules;
- `static-web/src/styles/xizong-system-workspace.css` convergence overrides;
- `static-web/src/components/XizongSystemV6.astro` component-local `<style>`;
- `static-web/src/pages/xizong/[system]/index.astro` page-global style patch.

The learner effect may be acceptable, but ownership is not.

### NEW

`static-web/src/styles/xizong-system-workspace.css` becomes the sole System Framework visual owner.

The component owns semantic markup + interaction only.  
The page owns composition + later-stage wiring only.  
`xizong-presentation.css` no longer owns System Workspace geometry/typography.

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

All System-specific visual rules required by the Current System Workspace exist in `xizong-system-workspace.css`, and browser acceptance passes without relying on the removed legacy/component/page style owners.

### DELETE CONDITION

Delete the superseded System rule block from `xizong-presentation.css` and remove System visual `<style>` blocks from the component/page in the same accepted slice.

### ROLLBACK / FAIL-CLOSED

If semantic/runtime behavior changes or representative System browser acceptance regresses, do not keep a compatibility override stack. Revert the slice and repair the single intended owner before retrying.

---

## Slice 2 — Home + Memory ownership convergence

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

After accepted cutover, remove the superseded Home/Memory rules from broad legacy owners and component inline style blocks.

---

## Slice 3 — System Exit / official Question ownership convergence

### OLD

Later-stage System Exit / Question presentation remains mixed with broad Xizong presentation/runtime component styling; #351 attempts to improve readability through another override layer.

### NEW

One explicit later-stage surface owner, preserving the existing System Recall → official System sweep → Repair/Return semantics and exact question/runtime truth.

### SUCCESS TEST

Readable System Recall and official-question workspace with no change to Question Truth, Crosswalk, attempt history, Repair or Evidence semantics.

### DELETE CONDITION

Remove superseded later-stage presentation rules after representative real-system browser acceptance passes.

---

## Slice 4 — Legacy cleanup + shared Shell adoption

Only after slices 1–3 are stable:

- identify Xizong presentation rules with no remaining owner responsibility;
- delete obsolete compatibility/override paths;
- resync from `main` after the English-owned shared Base Shell / collapsible global K rail lands;
- adapt only Xizong-local geometry needed to coexist with that accepted shared Shell;
- never reimplement the global rail inside Xizong.

Migration is complete only when old and new paths no longer compete for the same responsibility.

## PR discipline

Each implementation PR answers one acceptance question. Do not mix the shared-shell program, Xizong semantic changes, content changes, or unrelated lane work into this migration.
