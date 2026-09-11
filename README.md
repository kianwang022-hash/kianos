# KianOS

KianOS is the clean Current repository for learning content and the Astro learner runtime.

The active model is intentionally small:

`Source Truth → Chat-approved GitHub Current content → Astro learner UI → local learner state`

- `content/` owns shared editable learning content.
- `static-web/` owns learner-facing UI and interaction.
- learner state stays outside shared content and is local-only.
- `kianwang022-hash/kianos-legacy` is recovery/reference only and is never a normal input.

This repository is rebuilt clean-room from explicitly admitted Current assets. Historical runtime, Site, release, compatibility, issue-driven control planes, and legacy governance are not inherited by default.
