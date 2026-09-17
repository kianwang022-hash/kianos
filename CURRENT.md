# KianOS Root Current

**Repository:** `kianwang022-hash/kianos`  
**Role:** root Work Cursor + scope router

`CURRENT.md` is a navigation/control surface, not a Truth owner and not project history.

---

## Root Work Cursor

**Active scope:** Parallel learner-facing convergence under the accepted shared UI rules  
**Current stage:** the 4173-style shared Shell is on `main`; durable shared ownership is now explicit, while lane work proceeds independently by owner  
**Blocker:** none at root; a shared implementation path may still have only one active writer at a time  
**Next action:** run the current parallel assignments below. Each lane edits only its owned surface. Shared-owner changes route through `AUTHORITY_INHERITANCE_CONTRACT.md` + `AUTHORITY_OWNERSHIP.json` rather than becoming a subject-local fork.

### Current parallel assignment

| Lane | Current responsibility | Shared-shell rule |
| --- | --- | --- |
| English | **English UI architecture + legacy `4173` visual convergence**; this Chat is also the **current writer** for shared Shell changes when cross-lane Shell work is required | Shared Shell is a **Shared Platform authority**, not English semantic ownership. English may modify the registered shared implementation owner during this assignment, then land it on `main` for all lanes to consume. |
| Xizong | **Xizong learner-facing UI convergence** in the current Chat | Xizong consumes the shared owner from `main`; it must not independently recreate or fork the global `K` rail / Base Shell. |
| Politics | Continue **explicit content → learner-surface mapping** (#352 / current Politics mapping lane) | Do not start broad Politics UI redesign until the mapping owner is stable enough for downstream consumption. |
| Lexical | No new broad parallel UI rewrite while current convergence is active | Preserve accepted Lexical visual proof; consume Shared Platform owners without reopening Lexical semantics. |

Hard coordination rule:

> **Shared Platform has durable owners; each shared implementation path has at most one current writer. Subject surfaces may refine locally but may not create a competing shared Truth.**

If a subject needs a change to Shared Shell / global nav / shared UI primitives, do not patch it locally. Route the shared change to the current writer, land it on `main`, then rebase/sync the subject work and continue.

Top-level governance is accepted and remains frozen. `AUTHORITY_INHERITANCE_CONTRACT.md` makes the existing architecture rule executable: lower scopes may refine higher scopes, never contradict or duplicate them.

---

## Root authority

- project requirements / invariants → `PROJECT_DEFINITION.md`
- project architecture → `ARCHITECTURE.md`
- authority inheritance / anti-drift → `AUTHORITY_INHERITANCE_CONTRACT.md`
- machine-readable owner topology → `AUTHORITY_OWNERSHIP.json`
- worker entry / operating rules → `AGENTS.md`
- cross-lane project-management execution → `PROJECT_MANAGEMENT_CONTRACT.md`
- governance acceptance → `GOVERNANCE_ACCEPTANCE.md`
- learning-asset construction order → `LEARNING_ASSET_STANDARD.md`
- S/K/L/P/R/E/U readiness → `LEARNING_ACCEPTANCE.md`
- shared learner-surface capabilities → `SYSTEM_CONTRACT.md`
- cross-subject exam scheduling / phase Gates / material timing → `EXAM_ORCHESTRATOR_CONTRACT.md`
- branch lifecycle → `BRANCH_LIFECYCLE.md`
- intentionally postponed work → `DEFERRED.md`

`EXAM_ORCHESTRATOR_CURRENT.json` is a checked machine projection of the Orchestrator contract for runtime consumption; it is not a competing authority.

These owners are referenced, not copied into lane Current files.

---

## Lane entrypoints

| Scope | Work Cursor entry |
| --- | --- |
| Xizong | `content/xizong/CURRENT.md` |
| English | `content/english/CURRENT.md` |
| LexicalOS | `content/lexical/CURRENT.md` |
| Politics | `content/politics/CURRENT.md` |
| Cross-subject Exam Orchestrator / Home scheduling | `EXAM_ORCHESTRATOR_CONTRACT.md` |

Known target scope may go directly to its local Current once governance is understood. Root Current is not a mandatory ritual read for ordinary lane continuation.

Parent lanes are routers/owners, not global child queues. Independent child scopes may progress concurrently unless a real dependency links them.

---

## Whole-exam / three-subject status rule

When Kian asks about the whole exam system, overall progress, remaining work, Home scheduling, today's/this week's allocation, or when engineering can stop, do **not** answer from subject lanes alone.

Minimum read:

```text
EXAM_ORCHESTRATOR_CONTRACT.md
+ Xizong CURRENT/status
+ English CURRENT
+ Politics CURRENT
(+ Lexical CURRENT when vocabulary/product readiness matters)
```

If the question is about product / website closure, also inspect Current Home / Orchestrator implementation or product evidence under `static-web/`.

Report separately:

```text
Subject readiness
Cross-subject / Home readiness
Whole-system readiness = both
```

Hard rule:

> **Never call the whole exam system “basically finished” without accounting for Home / Exam Orchestrator.**

Subject engineering PASS does not imply learner progress or cross-subject scheduling closure.

---

## Compact routing rules

For a known scope:

```text
target CURRENT
→ exact required owner(s)
→ work
```

For cross-layer/root integration work:

```text
root CURRENT
→ AUTHORITY_INHERITANCE_CONTRACT.md + AUTHORITY_OWNERSHIP.json when ownership/derivation/sync is involved
→ PROJECT_MANAGEMENT_CONTRACT.md when cross-lane execution is involved
→ exact affected authority chain only
→ work
```

Normal target is roughly 2–4 precise reads after scope resolution. Whole-exam status is the deliberate exception because it spans the Orchestrator plus multiple subject owners.

Do not use historical repositories, retired branches, migration records, old Issues, or prior Chats as normal Current fallback.

Keep these distinctions everywhere:

```text
Artifact Truth ≠ Acceptance Truth ≠ Learner Truth ≠ Work Cursor ≠ Derived Read Model
Hierarchy = ownership/routing
Dependency = scheduling
Learner order = learner experience sequence
Current writer ≠ durable authority owner
```

This file should remain small. Progress history belongs in Git history / exact evidence owners, not here.
