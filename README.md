# KianOS

Role: **static product/repository orientation**. Live engineering/status routing is owned by `CURRENT.md`; worker entry/routing is owned by `AGENTS.md`. This README is a map, not a second rulebook, Current, Acceptance ledger or semantic owner.

KianOS is Chat's durable **knowledge + visual + runtime + reality-feedback** product extension for Kian.

## Human-facing system map

```text
KianOS
├─ 2027 Postgraduate Exam System
│  ├─ durable exam design / orchestration
│  │  → EXAM_ORCHESTRATOR_CONTRACT.md
│  │  → EXAM_ORCHESTRATOR_CURRENT.json is a checked DERIVED_PROJECTION
│  │
│  ├─ learner systems
│  │  ├─ Xizong   → content/xizong/README.md
│  │  ├─ English  → content/english/README.md
│  │  │  └─ Vocabulary is learner-facing under English;
│  │  │     canonical lexical backend → content/lexical/README.md
│  │  └─ Politics → content/politics/README.md
│  │
│  ├─ product surfaces
│  │  → static-web/PRODUCT_SURFACE_CONTRACT.md
│  │  → exact Product / Surface owners under static-web/
│  │
│  └─ shared execution / Runtime
│     → SYSTEM_CONTRACT.md
│     → exact runtime / Resume / Return / Evidence / Delivery owner
│
├─ Skills / promoted non-exam capabilities
│  → content/skills/README.md
│
└─ future independently continuable capabilities
   → establish the requirement / owner boundary before BUILD
```

This is a **logical capability hierarchy**, not a folder-placement rule. Physical repository location does not change semantic ownership.

## Shared root owners

- KianOS purpose / success requirements → `PROJECT_DEFINITION.md`
- permanent KianOS responsibilities and hierarchy → `ARCHITECTURE.md`
- authority inheritance / Change Continuity / propagation / Current-history separation → `AUTHORITY_INHERITANCE_CONTRACT.md`
- machine-readable shared-owner topology → `AUTHORITY_OWNERSHIP.json`
- worker intent / entry routing → `AGENTS.md`
- current engineering/status routing → `CURRENT.md`
- execution coordination / batching / delivery discipline → `PROJECT_MANAGEMENT_CONTRACT.md`
- shared Engineering / Runtime capabilities → `SYSTEM_CONTRACT.md`
- formal learning-asset construction → `LEARNING_ASSET_STANDARD.md`
- learning readiness / evidence → `LEARNING_ACCEPTANCE.md`
- Website Product / Visual / Runtime map → `static-web/README.md`
- machine enforcement → `tools/` + `.github/`

Several durable owners intentionally remain at repository root because many consumers depend on their stable paths. Do not move them merely for cosmetic folder symmetry.

## Development / acceptance boundary

`ARCHITECTURE.md` owns KianOS's **callable CBA** (`CREATE → BUILD → AUDIT`). CBA is entered only when Kian explicitly invokes it or an already-bound engineering task declares it active; it is not the default path for ordinary use or ordinary changes.

```text
ordinary use / ordinary bounded change
→ AGENTS.md
→ semantic-impact tripwire
→ actual consumer / smallest correct effect

explicit CBA
→ ARCHITECTURE.md → CREATE → BUILD → AUDIT

explicit readiness / final audit
→ applicable Acceptance owner directly

REAL USE
→ native/private execution or learner evidence
```

A Current cursor locates work; it does not replace design. Historical PRs, migration ledgers, audits and retired design notes are evidence only unless a Current owner explicitly routes to them.

## Where to start

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
→ exact Rule / Product / Visual owner
→ Change Continuity through AUTHORITY_INHERITANCE_CONTRACT.md
```

Known-scope work should normally reach the responsible owner in a few precise reads.

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

## History boundary

`kianwang022-hash/kianos-legacy` is recovery/reference only and is never a normal Current input. Git history preserves retired construction detail without making it current authority.

## Principle

**One need → one owner chain → one real consumer → claim-scoped evidence.**

Keep root orientation stable, read narrowly, change the earliest responsible owner, verify the real effect, and stop.
