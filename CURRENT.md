# KianOS Current

**Repository:** `kianwang022-hash/kianos`  
**Branch:** `main`

## Active product model

`Source Truth → Chat-approved GitHub Current content → Astro learner runtime → local learner state`

`main@HEAD` is the only normal shared Current authority. `kianos-legacy` is recovery/reference only.

## Current owners

- Xizong: `content/xizong/`
- English: `content/english/`
- LexicalOS: `content/lexical/`
- Politics: `content/politics/`
- Learner UI/function runtime: `static-web/`

## Current asset state

### Xizong

The accepted Xizong owner roots are now present on `main`:

- `content/xizong/knowledge/`
- `content/xizong/questions/`
- `content/xizong/question_explanations/`
- `content/xizong/question-relations/`
- `content/xizong/explanations/`

Within `knowledge/`, System ownership is resolved by the Current owner rules in `content/xizong/knowledge/manifest.json`:

- same-system `system.json` present → it is the System-level owner;
- no `system.json` yet → the corresponding `system-guides/` file remains transitional substrate;
- canonical Block Markdown remains the Block/KP medical Core owner.

System-by-system v6 upgrades are **active Current content work**, not migration. They update natural owners in place and must not be overwritten by migrated snapshots.

### English

Current now contains:

- `content/english/manifest.json`
- `content/english/provenance.json`
- `content/english/source/question_bank.v1.json`
- `content/english/source/reading_corpus.v1.json`
- `content/english/source/global_source_truth.v1.json`

Astro Reading remains source-gated to Current assets only.

### LexicalOS

The canonical natural-owner corpus is present under `content/lexical/canonical/`, while `content/lexical/words/answer.json` remains the representative runtime word owner currently projected by Astro.

Lexical natural-owner auditing and L0-first semantic review are **active Current work**. Migration does not freeze, replace, or roll those owners back.

### Politics

Politics durable Current owners under `content/politics/` are present and remain the authority. Generated historical projections and legacy runtime/recovery files are not Current owners.

### Astro runtime

`static-web/` is the clean Astro learner runtime. Runtime coverage may lag content coverage: Astro should project only Current assets it explicitly supports, and missing projections must not be filled by legacy fallback.

## Migration boundary

The legacy repository knowledge-asset transport is **closed** after the accepted missing owner trees were admitted to the new repository in commit `cfa0a2e5826ab0d2dc076067d28334e938e0af87`.

The migration dual-read exception is therefore closed for normal work. Future reads from `kianos-legacy` require an explicit recovery, rollback, historical comparison, or newly authorized migration/recovery task.

Active Xizong v6 upgrades, Lexical semantic review/natural-owner audit, Astro projection expansion, and future source repairs are all new-repo Current work. They are not permission to re-import or prefer older legacy content.

## Known inherited source-asset gap

B1 Markdown references `Block1_正常机械循环_v6_assets/*`, but that media directory was absent from the pinned tracked legacy Block tree. Current must fail visibly on that missing asset rather than fabricate or silently remove the reference.
