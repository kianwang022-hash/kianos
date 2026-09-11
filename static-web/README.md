# KianOS Astro Runtime

`static-web/` is the learner-facing UI/function layer for Current content.

- Content is read from `../content/` at build time.
- Astro may project and interact with Current content but may not author domain semantics.
- Learner state is browser-local only.
- Missing Current assets fail closed; there is no legacy fallback.

Build: `npm install && npm run build`
