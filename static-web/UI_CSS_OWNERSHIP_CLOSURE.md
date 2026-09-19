# UI / CSS Ownership Closure

Status: **ACTIVE · post-Human-Gate non-redesign closure**

Purpose: finish the website ownership cleanup without changing accepted learner presentation.

## Current Base inventory

Current `Base.astro` still carries four classes of presentation imports.

### Shared / allowed in Base
- `global.css`
- `shared-visual-foundation.css`
- `runtime.css`
- `shared-shell.css`
- `study-timer.css`
- `shared-workspace-composition.css`

### Subject-owned debt still loaded globally
- `xizong-dense-calm.css`
- `english.css`
- `politics-presentation.css`
- `xizong-presentation.css`
- `lexical-presentation.css`
- `english-presentation.css`

### Historical / mixed ownership still requiring readback
- `visual-convergence.css`
- `site-visual-tuning.css`

## Batch 1

`stage-one-composition.css` and `viewport-workspaces.css` were adjacent global imports and jointly expressed cross-site workspace composition.

This batch concatenates the exact Current contents in the same cascade order into:

`shared-workspace-composition.css`

No selector/value is rewritten. The old source files remain temporarily until the branch proves no other importer depends on them.

## Next

1. inspect `visual-convergence.css` and `site-visual-tuning.css` selector ownership;
2. move subject presentation imports out of Base to the narrowest subject entrypoint, one subject at a time;
3. retire superseded files only after importer proof;
4. run representative Home / English / Politics / Xizong / Lexical browser regression;
5. any material visual delta returns to Kian Human Gate.

## Stop condition

Closure is complete only when Base contains genuinely shared presentation/runtime concerns, accepted Surface Blueprints remain visually unchanged, and representative cross-subject regression passes.
