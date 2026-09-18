# Archived historical evidence

> **RETIRED / NON-CURRENT.** Preserved only for bounded historical evidence. Current work must route through `AGENTS.md → CURRENT.md → exact owner`. Do not use this file as a progress/status/execution authority.

---

# Xizong Block Presentation Ownership Audit

Status: **FRESH CURRENT AUDIT · IMPLEMENTATION NOT YET CUT OVER**  
Scope: Current learner-visible Block presentation only  
Parent router: `content/xizong/CURRENT.md` → `XIZONG_UI_MIGRATION.md`  
Semantic boundary: `content/xizong/LEARNING_CONTRACT.md` + `LEARNER_OBJECT_CONTRACT.md` remain upstream; this audit does not change Learning, Runtime, Question, Evidence or learner state.

## 1｜Audit question

After Home / System / Memory / System Exit single-owner convergence and closed-surface cleanup through PR #379, does the Current Block workspace still have competing presentation owners?

**Finding: YES.**

The Block behavior is Current and browser-accepted, but its final learner surface is assembled by multiple active Xizong-specific CSS owners plus a JS inline geometry override. This is current architecture debt, not a new learning-model problem.

## 2｜Current route

```text
xizong/[system]/[block].astro
→ XizongBlockV6
→ XizongLearnerObjectBridge
→ XizongBlockWorkspaceShell
→ XizongBlockAuxLayoutSync
→ XizongVisibleTypeFloor
→ XizongStudyEnhancer
→ Recall / Memory / Evidence / Repair / Stage guards
```

The route also consumes Shared Platform and generic runtime presentation from `Base.astro`.

## 3｜Owner classification

### A. Shared / generic primitives — preserve

These are not competing Xizong exact-surface owners and must not be copied into a Block stylesheet:

| Path | Role | Disposition |
| --- | --- | --- |
| `src/layouts/Base.astro` | registered Shared Platform shell markup | PRESERVE / external Xizong ownership |
| `src/styles/shared-shell.css` | registered Shared Platform shell style | PRESERVE / external Xizong ownership |
| `src/styles/global.css` | shared tokens / primitives | PRESERVE |
| `src/styles/runtime.css` | generic `portedStudy*` / learner-runtime presentation substrate | PRESERVE as base primitive |

`runtime.css` may provide the neutral default appearance. The migration target is to make **all Xizong Block-specific refinement** come from one exact owner above that substrate.

### B. Active competing Block presentation owners — migrate

| Current path | Current responsibility | Audit disposition |
| --- | --- | --- |
| `src/styles/xizong-presentation.css` | broad Xizong Block typography / rails / Recall / local layout | MIGRATE Block-specific rules |
| `src/styles/xizong-dense-calm.css` | Block density / reading widths / rails / Recall / responsive refinement | MIGRATE Block-specific rules; preserve unrelated/ambiguous after-Learn rules until separately proven |
| `src/styles/viewport-workspaces.css` | Mac viewport fitting, Block flex/scroll/Recall geometry | MIGRATE Current Block rules |
| `src/styles/site-visual-tuning.css` | late desktop Block tuning and type/layout overrides | MIGRATE Current Block rules |
| `XizongBlockV6.astro` `<style>` | Block orientation / Logic / Lecture / Recall / Attention presentation | MIGRATE; Runtime script stays |
| `XizongBlockWorkspaceShell.astro` global `<style>` | one-screen Mac geometry + aux rail; many `!important` overrides | MIGRATE; behavior script stays |
| `XizongVisibleTypeFloor.astro` global `<style>` | 15/16px floor implemented as cascade recovery with `!important` | FOLD INTO exact Block owner; retire recovery owner |
| `XizongLearnerObjectBridge.astro` global `<style>` | learner assets, visuals, tables, KP Learn companion, aux surface | MIGRATE presentation; representation/runtime script stays |
| `XizongCognitiveProjectionStage.astro` `<style>` | Block Framework representation surface | MIGRATE presentation; semantic representation plan stays |
| `XizongStudyEnhancer.astro` `<style>` | learner dock + additional Block layout overrides | MIGRATE presentation; local learner-state behavior stays |

The important point is not the number of files by itself. These owners currently **style overlapping DOM**. Examples include:

- `.portedStudyLayout` receives widths from runtime base, dense-calm, xizong-presentation, site tuning, viewport workspace, WorkspaceShell, StudyEnhancer and JS inline style;
- `.portedStudyIdentity`, `.portedStudyOutline`, `.portedStudyChain`, Recall cards and aux surfaces receive multiple later overrides;
- WorkspaceShell uses `!important` to beat earlier owners;
- VisibleTypeFloor then uses another `!important` layer to recover readable type from 8–14px declarations below it.

That is exactly the ownership pattern the migration is intended to eliminate.

### C. Behavior-coupled geometry — preserve behavior, change interface

`XizongBlockAuxLayoutSync.astro` is behavior-only except for this presentation write:

```text
layout.style.setProperty('grid-template-columns', value, 'important')
```

The **decision** is Runtime-owned and legitimate:

```text
outline collapsed?
chain collapsed?
aux weight = none / light / rich?
→ choose left/right column state
```

The **CSS property** should not remain a competing inline visual owner.

Target interface:

```text
Runtime derives state
→ writes data attributes and/or CSS custom-property inputs
→ xizong-block-workspace.css owns grid-template-columns
```

No learner-state or aux-weight semantics change.

### D. Mounted but not active first-pass visual owners

`XizongQuestionCrosswalkReverse.astro` contains component CSS, but the Current Block route mounts it inside a parent `hidden aria-hidden="true"` query bridge. It remains a canonical deep-link/query capability and does not participate in the visible first-pass Block workspace.

Do not pull it into the Block cutover merely for symmetry.

### E. Behavior / Evidence bridges — preserve

The current Repair / Evidence / Memory / Last Location / Stage Guard bridges are not presentation owners for this audit. Preserve their storage keys, event semantics and evidence contracts.

## 4｜Residual dead selectors outside the active Block problem

Fresh audit also found unreachable pre-Current residue in broad cross-surface files:

- retired Home / System selectors in `viewport-workspaces.css`;
- retired System selectors in `site-visual-tuning.css`;
- pre-shared-shell `.productBar / .productNav / productBrand*` selectors in `xizong-dense-calm.css` while Current `Base.astro` now uses `kianosShell* / kianosSubject*` markup.

These rules are **dead cleanup debt**, not the active Block problem. They may be physically removed in a later bounded cleanup, but must not be mixed into the Block live-owner cutover unless needed for exact ownership proof.

## 5｜Target architecture

One exact Block presentation owner:

```text
xizong/[system]/[block].astro
→ XizongBlockV6 + existing behavior/semantic bridges
→ xizong-block-workspace.css    ← sole Xizong Block-specific visual owner
```

Allowed upstream presentation:

```text
shared-shell.css    Shared Platform shell
runtime.css         generic ported learner-runtime primitives
xizong-block-workspace.css
                    exact Xizong Block refinement
```

Not allowed after cutover:

- Block-specific component `<style>` / `<style is:global>` in the active visible components listed above;
- Block-specific rules in `xizong-presentation.css`, `xizong-dense-calm.css`, `viewport-workspaces.css`, or `site-visual-tuning.css`;
- JS writing `grid-template-columns` with `important`;
- a separate VisibleTypeFloor cascade-recovery stylesheet/component;
- a second polish/override stylesheet;
- Runtime or learner-object changes merely to make CSS easier.

## 6｜Runtime invariants

The implementation must preserve exactly:

- Block Learn / source-contact timing;
- Logic Group navigation and closure;
- KP Learn companion semantics;
- KP Recall reveal/rating/keyboard behavior;
- Block Recall / Block Complete prerequisites;
- localStorage / sessionStorage keys and learner state;
- dynamic aux `none / light / rich` classification;
- outline/aux collapse behavior;
- learner-object Representation Gate decisions;
- Visual / Precision / Extension timing;
- Block Complete → Memory release;
- Repair / Evidence / Return semantics;
- query-only Crosswalk bridge behavior.

A style migration must not create learner-U claims.

## 7｜Acceptance for the Block cutover

The next implementation slice is accepted only if all of the following hold:

1. **Static ownership gate**
   - route imports exactly one Xizong Block stylesheet;
   - active visible Block components have no local visual style blocks;
   - broad Xizong/cross-surface styles no longer target Current Block-specific selectors;
   - exact Block owner contains no `!important` recovery layer;
   - runtime base / Shared Shell remain external owners.

2. **Runtime diff guard**
   - `XizongBlockV6` behavior script unchanged;
   - learner-object / StudyEnhancer semantic and storage behavior unchanged;
   - AuxLayoutSync changes only the presentation handoff, not state derivation.

3. **Real browser states**
   - representative A1 / A2 / A3 / B / C Block pages;
   - Block Learn;
   - source contact / KP Learn companion where applicable;
   - Logic Group with none/light/rich auxiliary states;
   - KP Recall front and Reveal;
   - Block Recall / Block Complete;
   - outline collapsed / aux collapsed combinations;
   - Visual / structured-table auxiliary where Current assets exist.

4. **Readability / geometry**
   - default-visible learner text floor remains >=15px; body learner copy >=16px where the Current gate requires it;
   - Mac-wide one-screen workspace remains readable without tiny-text compensation;
   - rich aux gets width only when current representation requires it;
   - no cheap dashboard/card proliferation.

5. **Regression**
   - Representative Workspace;
   - Golden Journey;
   - A2 Functional First;
   - Static Web Xizong QA;
   - Memory auto-release / Evidence paths already covered by their owning gates when touched;
   - screenshot inspection before merge.

## 8｜Audit exit

**Audit result: admit the next bounded implementation slice as `Block presentation single-owner convergence`.**

Do not combine it with Shared Platform changes or broad dead-selector housekeeping. The latter remains named cleanup debt for the final migration closeout.
