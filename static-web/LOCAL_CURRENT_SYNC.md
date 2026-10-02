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
→ the dedicated checkout updates to origin/main
→ affected Lexical objects are compiled; unchanged input/output proofs are reused
→ Astro builds that exact Current in a background staging slot
→ the completed slot atomically replaces the served website
→ the already-open localhost page detects the new SHA without interrupting an active foreground task
→ the page reloads when the learner leaves that tab/window and returns, or the next natural navigation loads the new document
→ learner sees the new Current without a forced mid-task refresh
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
5. validates the Lexical input/output cache, recompiles changed Word owners and relation dependants only, then builds Astro into a staging slot and atomically promotes it; the old website stays available during the build;
6. writes the exact local Current SHA to `static-web/public/__kianos-current.json` inside the disposable mirror;
7. the shared Base polls that localhost-only status and records a pending browser refresh when the synced SHA changes;
8. an active foreground learner page is never force-reloaded solely because main advanced; returning to the page after leaving it performs the pending refresh, while natural navigation already loads the newest Current;
9. transient network failure keeps the last successfully synced site usable; a failed build preserves the served SHA and reports a separate target SHA/error. The same failed source is not rebuilt on every poll or process restart. A new source SHA resumes automatically.

Lexical cache state is disposable and ignored by Git (`static-web/.cache/lexical-projection`). Reuse requires clean source-tree identity and verified output hashes; dirty inputs, missing outputs or corrupt cache cause bounded repair/recompilation. No cache is a semantic owner. The builder resolves all affected references before overwriting any projection shards.

Astro candidate builds may memoize immutable Xizong owner/projection reads **inside that one build process only**. `kianos-safe-astro-build.mjs` explicitly enables this build-local cache; ordinary Node validators and the dev server do not. A new build/release starts with a fresh module graph, so this optimization cannot carry stale owner data across releases or replace canonical Content truth.

For an explicit engineering retry after an environmental repair, run the supervisor once with `KIANOS_SYNC_ONCE=1 KIANOS_RETRY_FAILED_BUILD=1`. Do not use retries to suppress a content error.

Ordinary explanation and lexical owner updates have read-only content CI; full browser/system QA remains for runtime/schema changes and explicit integration checkpoints. Astro still performs one site build per accepted update; this change does not claim incremental page rendering.

Default main check interval: **8 seconds**.  
Default browser Current check interval: **3 seconds**.

The status file is local delivery state, not a canonical repository owner and not learner Evidence.

### Build-context isolation

A reusable release is identified by source SHA **and** `clientBuildContextHash` of the supervisor's build environment, normalized against its control checkout. The same hash is passed to complete/client-artifact builds and persisted as `contextHash` in the built `dist/__kianos-current.json`. Compiler receipts remain optional for complete builds. Only the hash is added to delivery metadata; source paths and environment values are not copied into this receipt.

Same-SHA idle, control-only reuse, existing-release reuse, startup and runtime readiness all require this context to match. A receipt without context is untrusted and requires one new build. `KIANOS_STUDYHUB_MODE`, source path and other non-ignored build environment changes therefore cannot silently reuse a private artifact in a public configuration. This is environment identity, not a new content revision or learner fact; private source integrity remains with its source owner.

New worktrees live at `releases/<sha>-<contextHash>` beneath the existing release root; `active` and `previous` retain their existing roles. A retained directory with a missing/corrupt receipt is rebuilt in a unique sibling, never erased or overwritten. Preparation returns its exact directory for probe, activation and rejected-candidate cleanup. Build failures are suppressed only for the same SHA **and** context, so a failed private configuration cannot block a public build of the same source.

Serving requires a matching built receipt before any process starts, including cold/offline startup and recovery after failure. Previous `/_astro/` assets may be used only within the same context. Readiness checks both SHA and context. Same-context failures may continue or restore the prior site; after a context change, failure preserves the old artifacts and pointers but leaves an incompatible site unserved. Availability is deliberately sacrificed instead of exposing old private content. Existing open-browser content is not remotely erased by changing the server configuration.

Environment changes take effect by restarting the managed supervisor with the new environment. A one-shot build changes delivery pointers; it cannot rewrite another already-running supervisor's environment or authorize stopping unrelated processes. Context checks do not install credentials, configure StudyHub, or deploy a private source automatically.

The bounded synthetic regression is `node scripts/test-current-build-context.mjs`. It uses local Git fixtures, the production static server with synthetic private bridges, ephemeral loopback ports and no real learner/source state.

## macOS install

From any trusted checkout of this repo, once:

```bash
npm run current:install
```

The same command also exists inside `static-web/`, but normal learner operations should use the root command surface.

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

The actual durable local shape is intentionally small:

```text
~/Library/Application Support/KianOS/
├─ learner-state/
│  ├─ latest.json            latest validated shared + subject checkpoint
│  └─ restore-safety/        pre-restore safety copies when restore is used
└─ external-reading/
   └─ bundle.v2.json         private compiled TPO / IELTS runtime bundle when source is present

~/Documents/KianOS Backups/
└─ kianos-learner-*.json     explicit manual checkpoint copies created by current:backup
```

There is no filesystem mirror of every browser event and no separate handoff outbox/returns store in Current V1. High-frequency learner state stays in browser storage; the filesystem checkpoint stores only the compact recovery payload worth surviving browser-profile loss / migration.

Operational commands from the repo root:

```bash
npm run current:doctor
npm run current:open
npm run current:backup
npm run current:restore -- --from "$HOME/Documents/KianOS Backups/<backup-file>.json"
```

Restore validates the backup first, preserves the previous private checkpoint under `restore-safety/`, and does not clear existing browser-local state. Existing local learner evidence wins by design.

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

For normal learning, Kian should not need to run `git pull`, choose a branch, resolve a worktree state, restart Astro, or manually refresh the browser after Chat lands an accepted update on main. Current delivery must also not interrupt an active foreground task merely to display that update a few seconds sooner.

Manual Git remains an engineering activity, not a learner workflow.
