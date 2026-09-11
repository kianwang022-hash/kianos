# Xizong Knowledge

`content/xizong/knowledge/` is the durable Current knowledge plane for Chat-approved Xizong learning content.

## Ownership

There must be one semantic owner for each layer.

- **System level** — prefer `systems/**/system.json` whenever a same-system file exists on Current `main@HEAD`. Its lifecycle status (for example `CURRENT` or `FREEZE_CANDIDATE`) describes maturity; it does not authorize the old guide to remain a parallel owner.
- **Transitional System substrate** — for a system that does not yet have `system.json`, the corresponding file under `system-guides/` remains the temporary System-level substrate.
- **Block / medical Core** — canonical Block Markdown under `systems/**` owns Block/KP medical content.
- **Logic groups / framework nodes** — structural learning indexes only. They organize stable identities but do not override Block/KP medical Core.
- **KP** — canonical KP records stay under their canonical Block owner with stable identity and order.
- **Overlay** — `overlays/o9-tumor-general/` remains a separately retained overlay.
- **Shared learning support** — `learner/` may carry shared fields and identity joins needed by Current learning projections. It is not personal learner state and must not become a second semantic owner.

## System upgrade rule

System-by-system v6 work updates the natural owner in place:

`old System Guide substrate → current system.json owner → Astro projection`

Once a same-system `system.json` exists, keep the old System Guide only as prior substrate/reference unless a later explicitly approved cleanup removes it. Do not read both as competing truths.

## Boundaries

- Preserve the stable 159 Block / 2514 canonical KP identity unless an explicit Chat-approved semantic change says otherwise.
- Astro may parse, validate, group, and render Current knowledge, but it cannot invent or override Xizong semantics.
- Personal progress, attempts, wrong/uncertain state, notes, timing, scheduling, and history remain local learner state.
- Legacy Vault controls, audit/final-gate evidence, old runtime/release infrastructure, migration control planes, and fallback snapshots are not Current semantic owners.
