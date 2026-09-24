# Xizong Knowledge

`content/xizong/knowledge/` is the durable Current knowledge plane for Chat-approved Xizong learning content.

## Ownership

There must be one semantic owner for each layer.

- **System level** — `systems/**/system.json` is the single Current System-level owner for A1–F. Missing System ownership fails closed; there is no legacy Guide fallback.
- **Block / medical Core** — canonical Block Markdown under `systems/**` owns Block/KP medical content.
- **Logic groups / framework nodes** — structural learning indexes only. They organize stable identities but do not override Block/KP medical Core.
- **KP** — canonical KP records stay under their canonical Block owner with stable identity and order.
- **Overlay** — `overlays/o9-tumor-general/` remains a separately retained overlay.
- **Shared learning support** — `learner/` may carry shared fields and identity joins needed by Current learning projections. It is not personal learner state and must not become a second semantic owner.

## System upgrade rule

System changes update the natural Current owner in place:

`Current Source / Block Core → system.json / accepted Learning owner → Product projection`

Pre-cutover System Guide provenance lives in Git history only. It is not part of normal routing, fallback or Current semantic resolution.

## Boundaries

- Preserve the stable 159 Block / 2517 canonical KP identity unless an explicit Chat-approved semantic change says otherwise.
- Astro may parse, validate, group, and render Current knowledge, but it cannot invent or override Xizong semantics.
- Personal progress, attempts, wrong/uncertain state, notes, timing, scheduling, and history remain local learner state.
- Legacy Vault controls, audit/final-gate evidence, old runtime/release infrastructure, migration control planes, and fallback snapshots are not Current semantic owners.
