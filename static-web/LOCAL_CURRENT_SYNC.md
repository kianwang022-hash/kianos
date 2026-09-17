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
→ the already-open localhost page detects the new SHA and reloads
→ learner sees the new Current
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
6. writes the exact local Current SHA to `static-web/public/__kianos-current.json` inside the disposable mirror;
7. the shared Base polls that localhost-only status and reloads an already-open page when the synced SHA changes;
8. transient network failure keeps the last successfully synced site usable.

Default main check interval: **8 seconds**.  
Default browser Current check interval: **3 seconds**.

The status file is local delivery state, not a canonical repository owner and not learner Evidence.

## macOS install

From any trusted checkout of this repo, once:

```bash
cd static-web
npm run current:install
```

The installer:

- creates `~/KianOS-current` unless `KIANOS_CURRENT_DIR` is supplied;
- installs `static-web` dependencies;
- creates `~/Library/LaunchAgents/com.kianos.current-mirror.plist`;
- starts a persistent background supervisor;
- keeps the stable learner origin at `http://127.0.0.1:4321/` by default;
- if that port is occupied by a clearly identifiable old **KianOS Astro** process, stops that stale listener before installing Current;
- refuses to kill unrelated processes merely because they use the same port;
- opens the Current site after installation.

Logs live under:

```text
~/Library/Logs/KianOS/current.out.log
~/Library/Logs/KianOS/current.err.log
```

## Persistent learner-data root

The disposable Current mirror and private learner data must never share lifecycle.

```text
~/KianOS-current
= disposable read-only mirror of public GitHub Current

~/Library/Application Support/KianOS/
= private durable learner-data root on Kian's Mac
```

The learner-data root is **not** part of the Git worktree and must never be hard-reset when GitHub Current advances.

The expected durable local shape is intentionally small:

```text
learner-data/
├─ checkpoints/   compact daily / periodic recovery snapshots
├─ handoff/
│  ├─ outbox/     packets explicitly exported for Chat
│  └─ returns/    validated Chat/domain return packets when locally retained
└─ backups/       optional local export snapshots
```

High-frequency browser state may remain in browser storage when that is the cheapest correct owner. The filesystem root exists for information that is worth recovering across browser resets / migrations; it is not a requirement to mirror every localStorage key.

Actual learner data must not be committed to the public `kianos` repository. Repository files may define schemas and synthetic fixtures only.

---

## Safety / truth boundary

- GitHub `main` remains the durable shared Artifact/Current source for this delivery path.
- The Mac Current mirror does not become a new canonical owner.
- Browser-local learner state remains browser-local unless its own Evidence contract says otherwise.
- Network failure keeps the last successfully synced Current available; it must not silently invent a newer state.
- A branch or PR preview is a separate development surface and must not overwrite the Current mirror.
- The supervisor has a tested fail-closed marker guard; normal development checkouts are never hard-reset by this mechanism.

## Product expectation

For normal learning, Kian should not need to run `git pull`, choose a branch, resolve a worktree state, restart Astro, or manually refresh the browser after Chat lands an accepted update on main.

Manual Git remains an engineering activity, not a learner workflow.
