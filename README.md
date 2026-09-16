# KianOS

KianOS is the clean Current repository for learning content and the Astro learner runtime.

The active model is intentionally small:

`Source Truth → Chat-approved GitHub Current content → Astro learner UI → local learner state`

- `content/` owns shared editable learning content.
- `static-web/` owns learner-facing UI and interaction.
- learner state stays outside shared content and is local-only.
- `EXAM_ORCHESTRATOR_CONTRACT.md` owns cross-subject exam scheduling, hard Gates, capacity arbitration, score-closure, and material-refresh timing; it does not replace subject-local learning or learner truth.
- `kianwang022-hash/kianos-legacy` is recovery/reference only and is never a normal input.

## Run locally

From the repository root:

```bash
npm run setup   # first run, or after dependency changes
npm run dev
```

Then open the local URL printed by Astro (normally `http://localhost:4321/`).

Other root commands:

```bash
npm run build
npm run preview
```

You no longer need to `cd static-web` before running the learner runtime.

## Deferred work

Intentional postponements across **all KianOS lanes** use one lightweight parking lot: GitHub Issue #5, `KianOS Deferred Queue`.

See `DEFERRED.md` for the rule. Active work stays in each lane's Current owner / continuation; only explicitly postponed work with real future value goes into the shared Deferred Queue.

This repository is rebuilt clean-room from explicitly admitted Current assets. Historical runtime, Site, release, compatibility, issue-driven control planes, and legacy governance are not inherited by default.
