# KianOS

Role: **static product/repository orientation**. Live engineering/status routing is owned by `CURRENT.md`; worker entry/routing is owned by `AGENTS.md`. This README is not a second Current, Acceptance ledger or semantic owner.

KianOS is Chat's durable **knowledge + visual + runtime + reality-feedback** product extension for Kian.

## Human-facing system map

Think about KianOS in these zones:

```text
WHY / SYSTEM
→ PROJECT_DEFINITION.md
→ ARCHITECTURE.md
→ SYSTEM_CONTRACT.md

HOW WORK ENTERS / CONTINUES
→ AGENTS.md
→ CURRENT.md
→ PROJECT_MANAGEMENT_CONTRACT.md when execution coordination matters

AUTHORITY / CHANGE SAFETY
→ AUTHORITY_INHERITANCE_CONTRACT.md
→ AUTHORITY_OWNERSHIP.json
→ SEMANTIC_BASE_VALIDITY.md
→ BRANCH_LIFECYCLE.md

BUILD QUALITY / ACCEPTANCE
→ LEARNING_ASSET_STANDARD.md
→ LEARNING_ACCEPTANCE.md
→ GOVERNANCE_ACCEPTANCE.md only for top-level governance claims

EXAM CROSS-SUBJECT RULES
→ EXAM_ORCHESTRATOR_CONTRACT.md
→ EXAM_ORCHESTRATOR_CURRENT.json
→ EXAM_SUBJECT_MATURITY_STANDARD.md

DOMAIN KNOWLEDGE / LEARNING
→ content/
   ├─ xizong/   → content/xizong/README.md
   ├─ english/  → content/english/README.md
   ├─ politics/ → content/politics/README.md
   ├─ lexical/  → content/lexical/README.md
   └─ skills/

PRODUCT / WEBSITE / RUNTIME
→ static-web/

MACHINE ENFORCEMENT
→ tools/
→ .github/
```

These are **logical zones, not separate truth systems**. Several durable root owners intentionally remain at repository root because many consumers depend on their stable paths. Do not move them merely for cosmetic folder symmetry.

## Requirement → reality lifecycle

The shared cross-system lifecycle is owned upstream in Personal OS `KERNEL.md §2 / Requirement → Reality change loop`. KianOS specializes it as:

```text
real need / outcome
→ recover current KianOS owner + parent design basis
→ Rule / Content / Visual / Engineering change only where needed
→ Product / Runtime integration
→ delivery to the real consumer
→ native acceptance + end-to-end reality acceptance
→ real-use evidence
→ revise the earliest responsible owner when reality changes the accepted meaning
```

Local optimization is a delta against the current parent basis, not permission to redesign nearby layers.

## Core product flow

```text
Chat / accepted Rule
→ GitHub canonical Rule + Content + Visual
→ Engineering / Runtime
→ Product / Website
→ private real-use evidence when applicable
→ Chat
```

- `content/` owns durable Knowledge / learning Content that has earned canonical asset status.
- `static-web/` owns shared/product Visual, website implementation and Runtime surfaces.
- private learner/execution state stays outside shared canonical Content.
- raw PDFs, videos, transcripts and other unprocessed references normally remain in Drive / Library / Files / original sources until a real KianOS need justifies Knowledge reconstruction.
- formal learning assets keep their full Source → Knowledge → Learning Logic → Content → Visual/Runtime quality chain.
- `EXAM_ORCHESTRATOR_CONTRACT.md` owns durable cross-subject exam orchestration Rule/Model, not today's adaptive allocation or subject-local learner truth.
- `kianwang022-hash/kianos-legacy` is recovery/reference only and is never a normal input.

Chat is the open-ended cognition layer. KianOS Runtime may execute bounded approved logic and return reality evidence, but does not silently become a second strategy brain.

## Where to start

Do not infer live status from this README.

```text
normal learner/product use
→ exact product/domain runtime or Resume owner

engineering / build / audit request
→ AGENTS.md
→ CURRENT.md only when routing/status is needed
→ exact owner

formal readiness claim
→ exact ACCEPTANCE owner

design / optimization
→ exact Rule/Product/Visual owner
→ Change Continuity before material change
```

Known-scope work should normally reach the responsible owner in a few precise reads. Historical PRs, migration ledgers, audits and retired design notes are evidence only unless a Current owner explicitly routes to them.

## Normal Mac learner use

For normal study, use the dedicated disposable Current mirror rather than the development worktree.

```bash
npm run current:install
npm run current:doctor
npm run current:open
```

Manual private-checkpoint backup / restore when needed:

```bash
npm run current:backup
npm run current:restore -- --from "$HOME/Documents/KianOS Backups/<backup-file>.json"
```

The managed learner site is served on `http://127.0.0.1:4321/`. Private learner checkpoints live outside the disposable public Current mirror.

## Development

From the repository root:

```bash
npm run setup
npm run dev
npm run build
npm run preview
```

Ordinary Website UI / Human-Gate iteration uses the Website Candidate lane documented in `static-web/CURRENT.md`; stable 4321 is not the scratch-preview surface.

## Deferred work

Intentional postponements across KianOS use GitHub Issue #5, `KianOS Deferred Queue`. Active work remains in the exact Current/work-cursor or canonical owner.

## Principle

**One need → one owner chain → one real consumer → claim-scoped evidence.**

Keep root orientation stable, read narrowly, change the earliest responsible owner, verify the real effect, and stop.
