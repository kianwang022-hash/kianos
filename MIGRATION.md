# Clean-room Migration Whitelist

Source repository: `kianwang022-hash/kianos-legacy`  
Pinned source commit: `40e0fdefb9150fc011b37b303f3f24720ef61186`

Only assets explicitly admitted here may be copied into new Current. Legacy governance/runtime/release trees are excluded by default.

## Phase 1 — admitted

### Runtime
- `static-web/**` from the pinned legacy snapshot, as the Astro UI/function baseline.

### Xizong representative dependency
- `content/xizong/knowledge/systems/a1-circulation/blocks/Block1_正常机械循环_学习阅读版_v7_最终执行版.md`

### Lexical representative dependencies
- `content/lexical/canonical/lookup/spelling/an.json`
- the exact Current word shard referenced by `word:answer`

### English representative dependencies
- `content/english/manifest.json`
- `content/english/source/question_bank.v1.json`
- `content/english/source/reading_corpus.v1.json`

## Explicitly not inherited in Phase 1

- legacy `AGENTS.md` / governance control planes
- `runtime/**`
- `releases/**`
- old Site/release infrastructure
- historical Issues as execution authority
- compatibility/fallback snapshots
- learner state or learner databases
- old generated read planes unless later proven necessary as Current dependencies

## Migration invariant

Content migration is copy-preserving: no semantic rewrite, repair, merging, or reinterpretation is performed merely because an asset moves repositories. Semantic changes require a separate Chat-owned decision.

If a copied Astro surface requires an undeclared legacy asset, fail closed and add that exact dependency to this whitelist before migration rather than importing a broad legacy tree.
