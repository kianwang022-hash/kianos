# KianOS Local Current Sync

Status: CURRENT local-delivery contract  
Scope: learner-facing KianOS on Kian's Mac  
Canonical upstream: `kianwang022-hash/kianos@main`

## Purpose

KianOS exists to let Chat-backed canonical work become learner-facing output without a manual Git ceremony.

The intended path is:

```text
Chat / GitHub change
→ accepted change lands on GitHub main
→ dedicated Mac Current mirror detects the new main SHA
→ the whole repository updates atomically to origin/main
→ Astro restarts against that exact Current
→ localhost presents the new Current
```

This is a whole-repository contract. It is not Lexical-only. Changes under Xizong, English, Politics, Lexical, shared Runtime, shared UI, manifests and other canonical content all travel through the same mirror.

## Two-worktree rule

The auto-synced learner site must not reuse a normal development worktree.

```text
~/KianOS-current   = disposable read-only mirror of origin/main
normal dev repo    = branches / local edits / implementation work
```

The Current mirror is allowed to hard-reset to `origin/main`. The supervisor refuses to do this unless `.git/kianos-current-mirror` exists.

This prevents a GitHub update from destroying local development changes and removes the need for merge/pull decisions from the learning workflow.

## Runtime

`static-web/scripts/kianos-current-sync.mjs`:

1. checks `origin/main` on a short interval;
2. compares the remote SHA with the mirror HEAD;
3. fetches and hard-resets the dedicated mirror when main advances;
4. refreshes npm dependencies only when package inputs changed;
5. restarts Astro so canonical files outside `static-web/src/` cannot remain stale through an HMR/watch-boundary miss;
6. keeps the site running through transient network failures.

Default check interval: **8 seconds**.

## macOS install

From any trusted checkout of this repo:

```bash
cd static-web
npm run current:install
```

The installer:

- creates `~/KianOS-current` unless `KIANOS_CURRENT_DIR` is supplied;
- installs `static-web` dependencies;
- creates `~/Library/LaunchAgents/com.kianos.current-mirror.plist`;
- starts a persistent background supervisor;
- opens `http://127.0.0.1:4321/`.

Logs live under:

```text
~/Library/Logs/KianOS/current.out.log
~/Library/Logs/KianOS/current.err.log
```

## Safety / truth boundary

- GitHub `main` remains the durable shared Artifact/Current source for this delivery path.
- The Mac Current mirror does not become a new canonical owner.
- Browser-local learner state remains browser-local unless its own Evidence contract says otherwise.
- Network failure keeps the last successfully synced Current available; it must not silently invent a newer state.
- A branch or PR preview is a separate development surface and must not overwrite the Current mirror.

## Product expectation

For normal learning, Kian should not need to run `git pull`, choose a branch, resolve a worktree state, or restart Astro after Chat lands an accepted update on main.

Manual Git remains an engineering activity, not a learner workflow.
