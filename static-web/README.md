# KianOS Astro Runtime

`static-web/` is the KianOS product frontend plus website execution/Runtime implementation surface for Current assets.

- Content is read from `../content/` at build time.
- Astro may project and interact with Current content but may not author domain semantics.
- State remains with its native owner: high-frequency learner state stays browser-local, while compact private recovery/checkpoint data and authorized transport use the existing private Runtime paths described in `LOCAL_CURRENT_SYNC.md`.
- Product/interaction semantics come from the applicable product/architecture owner; this directory does not become a second semantic owner.
- Missing Current assets fail closed; there is no legacy fallback.

Build: `npm install && npm run build`
