# KianOS

KianOS is the clean Current repository for learning content and the Astro learner runtime.

The active model is intentionally small:

`Source Truth → Chat-approved GitHub Current content → Astro learner UI → local learner state`

- `content/` owns shared editable learning content.
- `static-web/` owns learner-facing UI and interaction.
- learner state stays outside shared content and is local-only.
- `EXAM_ORCHESTRATOR_CONTRACT.md` owns cross-subject exam scheduling, hard Gates, capacity arbitration, score-closure, and material-refresh timing; it does not replace subject-local learning or learner truth.
- `kianwang022-hash/kianos-legacy` is recovery/reference only and is never a normal input.

## Where to start

KianOS does **not** maintain a second hand-written progress overview.

For live project status and continuation:

```text
work / routing rules
→ AGENTS.md

whole-project current status
→ CURRENT.md

exact subject / module status
→ the routed lane CURRENT.md

formal accepted readiness
→ the exact ACCEPTANCE.md owner
```

If Kian wants a human-readable whole-system progress summary, Chat should read the current owners live and generate it on demand. Do not use historical Overview / Status / Migration documents as a substitute for Current.

Historical PRs, migration ledgers, audits and retired design notes are evidence only unless a Current owner explicitly routes to them.

## Normal Mac learner use

For normal study, use the dedicated disposable Current mirror rather than the development worktree.

One-time install, or repair if the Current service is unhealthy:

```bash
npm run current:install
```

Check that GitHub main, the local Current mirror, LaunchAgent, private learner-state bridge and localhost are ready. The doctor also reports External Reading private-source readiness as a separate warning/pass item:

```bash
npm run current:doctor
```

Open the learner site during normal use:

```bash
npm run current:open
```

Create a manual copy of the latest complete learner checkpoint when you want an extra backup:

```bash
npm run current:backup
```

The backup is written to `~/Documents/KianOS Backups/` with private file permissions. Before the first real learner checkpoint exists, the command exits cleanly and reports that there is nothing to back up.

After installation, the macOS LaunchAgent keeps the dedicated Current mirror synced to GitHub `main` and serves the learner site on `http://127.0.0.1:4321/`. Learner checkpoints live outside the disposable mirror in the private KianOS application-support directory.

The development worktree remains separate and should not be used as the normal learner runtime.

## Development run

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
