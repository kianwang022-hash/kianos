# Clean-room Migration Whitelist

Source repository: `kianwang022-hash/kianos-legacy`  
Pinned source commit: `40e0fdefb9150fc011b37b303f3f24720ef61186`

Only explicitly admitted Current assets may enter the new repository. Legacy governance/runtime/release trees are excluded by default.

## Phase 1 — transferred

### Astro runtime
- `static-web/**` is the new learner-facing Astro UI/function baseline.
- Useful Local UI/behavior was ported, but old React APIs, caches, Site runtime, fallback logic, and server learner state are not dependencies.

### Xizong representative Current
- `content/xizong/knowledge/systems/a1-circulation/blocks/Block1_正常机械循环_学习阅读版_v7_最终执行版.md`

### Lexical representative Current
- `content/lexical/words/answer.json`

`word:answer` is transported as the natural word owner. Its accepted/source record is preserved; migration itself performs no semantic repair.

## Phase 1 — approved source identity, transfer pending

### English
The Current owners to transfer mechanically are:
- `content/english/manifest.json`
- `content/english/source/question_bank.v1.json`
- `content/english/source/reading_corpus.v1.json`

The large minified source stores have not yet been copied into the new repository through the available bounded connector path. Until exact transfer lands, Reading fails closed and must not use legacy or historical Read Plane fallback.

## Later migration

- remaining accepted Xizong Current
- full Lexical canonical owner set
- full English Current owners
- Politics Current
- only mechanical tools still proven necessary in the new architecture

Full-asset migration and global QA are a separate bounded phase. Accepted content is not semantically re-reviewed merely because it moves repositories.

## Explicitly not inherited

- legacy `AGENTS.md` / governance control planes
- `runtime/**`
- `releases/**`
- old Site/release infrastructure
- historical Issues as execution authority
- compatibility/fallback snapshots
- learner state or learner databases
- generated/historical Read Planes unless an exact future Current dependency is explicitly admitted

## Migration invariant

If new Astro needs a missing asset, fail closed and admit the exact Current dependency first. Never solve a missing Current asset by broad-copying legacy or inventing replacement domain semantics.
