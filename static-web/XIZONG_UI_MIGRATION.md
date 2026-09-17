# Xizong UI Architecture Migration

Status: **ACTIVE MIGRATION · Slice 1 ACCEPTED / CUT OVER ON MAIN · Slice 2 ACTIVE**  
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

## Slice 2 — Home + Memory ownership convergence

**State:** **ACTIVE**

### OLD

Home styles currently live inside broad `xizong-presentation.css`. Memory has substantial component-local styling. Draft PR #351 proposes an additional `xizong-peripheral-workspaces.css` override layer.

### BOUNDED #351 TRIAGE

PR #351 is evidence/candidate material, not a package to merge wholesale.

Preserve where still justified:

- an explicit standalone Memory entry from Xizong Home;
- the useful browser/type-floor acceptance intent for Home and Memory.

Do **not** inherit:

- `xizong-peripheral-workspaces.css` as a permanent second visual owner;
- inline Home `style="font-size:16px"` recovery patches;
- the System-route duplicate Recall-dialog click fallback unless Slice 3 produces a real Runtime defect that requires repair at the actual Runtime owner.

The Home/Memory work must be rebuilt against Current main, not stacked on #351's override architecture.

### NEW TARGET

- Home presentation receives one clear Xizong Home owner;
- Memory presentation receives one clear Memory owner;
- Home exposes meaningful Continue/System work plus explicit standalone Memory access;
- Memory keeps `Today | Core | Precision | Marked | Repair` and existing learner/evidence semantics;
- no permanent `peripheral` mega-stylesheet or page-inline visual fixes.

### SUCCESS TEST

Home remains a dense learner workbench with meaningful Continue/System entry and explicit Memory access. Memory preserves `Today | Core | Precision | Marked | Repair`, current keyboard/evidence behavior and readable Mac-wide geometry.

### CUTOVER / DELETE CONDITION

After accepted cutover:

- Home and Memory Current routes consume their intended owners only;
- superseded active Home/Memory rules and component inline style owners are removed;
- unreachable broad-file selectors are eligible for bounded physical deletion in the later cleanup slice.

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
