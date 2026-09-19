# UI / CSS Ownership Closure

Status: **ACTIVE · implementation closed · regression pending**

Purpose: finish the website ownership cleanup without changing accepted learner presentation.

## Current ownership

### Shared Base

`Base.astro` is now shared-only and delegates structural/runtime behavior to style-free `BaseFrame.astro`.

Shared presentation/runtime owners loaded by Base:

- `global.css`
- `shared-visual-foundation.css`
- `runtime.css`
- `visual-convergence.css`
- `shared-workspace-composition.css`
- `shared-shell.css`
- `study-timer.css`

`visual-convergence.css` was re-read after de-globalization. Its English/Politics/Xizong class references are confined to Home `.commandSubject` composition; it does not directly style subject pages and remains a legitimate shared/Home composition owner.

### Subject layouts

- English → `EnglishBase.astro` → `english.css` + `english-presentation.css`
- Politics → `PoliticsBase.astro` → `politics-presentation.css` + `politics-visual-tuning.css`
- Xizong → `XizongBase.astro` → `xizong-dense-calm.css` + `xizong-presentation.css` + `xizong-visual-tuning.css`
- Lexical → `LexicalBase.astro` → `lexical-presentation.css`

All known learner-facing subject pages now route through the applicable subject layout rather than using shared Base as a subject-style carrier.

## Retired historical owners

The following superseded layers are removed:

- `stage-one-composition.css`
- `viewport-workspaces.css`
- `site-visual-tuning.css`

The first two are preserved, in original cascade order and without selector/value rewrite, inside `shared-workspace-composition.css`.

The mixed `site-visual-tuning.css` was split into Politics/Xizong owners without rewriting selector/declaration values.

## Automated ownership gate

`static-web/scripts/test-ui-css-ownership.mjs` now verifies:

1. exact Base/subject-layout style ownership and order;
2. BaseFrame remains presentation-style free;
3. retired styles do not exist or remain referenced;
4. subject pages cannot silently fall back to shared Base;
5. subject CSS cannot leak back into shared Base.

The gate is included in `test:final-cross-subject`.

## Remaining closure

1. exact-head Astro build;
2. CSS ownership gate;
3. representative Home / English / Politics / Xizong / Lexical browser regression;
4. macOS visual regression / screenshot evidence where the existing workflow provides it;
5. if no material visual delta exists, record PASS and merge;
6. if a material visual delta appears, return only that affected surface to Kian Human Gate.

## Stop condition

Closure is complete only when the current exact head passes the ownership gate and representative cross-subject regression with accepted learner presentation preserved.
