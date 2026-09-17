# KianOS Root Current

**Repository:** `kianwang022-hash/kianos`  
**Role:** root Work Cursor + scope router

`CURRENT.md` is a navigation/control surface, not a Truth owner and not project history.

---

## Root Work Cursor

**Active scope:** Project management stabilization — Home summary  
**Current stage:** 把总控制台的必要信息接到 Home；详细状态仍留在 `/current/`  
**Blocker:** none  
**Next action:** 验收 Home 简明系统状态；通过后进入共享 UI 基础收口，并先用 Lexical 做一个小范围真实证明，不同时迁移四科。

Top-level governance is accepted and remains frozen. This is implementation of `PROJECT_MANAGEMENT_CONTRACT.md`, not a new root architecture.

---

## Root authority

- project requirements / invariants → `PROJECT_DEFINITION.md`
- project architecture → `ARCHITECTURE.md`
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
→ PROJECT_MANAGEMENT_CONTRACT.md
→ exact affected authority chain only
→ work
```

Normal target is roughly 2–4 precise reads after scope resolution. Whole-exam status is the deliberate exception because it spans the Orchestrator plus multiple subject owners.

Do not use historical repositories, retired branches, migration records, old Issues, or prior Chats as normal Current fallback.

Keep these distinctions everywhere:

```text
Artifact Truth ≠ Acceptance Truth ≠ Learner Truth ≠ Work Cursor
Hierarchy = ownership/routing
Dependency = scheduling
Learner order = learner experience sequence
```

This file should remain small. Progress history belongs in Git history / exact evidence owners, not here.
