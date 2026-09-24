# KianOS Governance Acceptance

Status: **REVALIDATION_REQUIRED**
Role: current acceptance truth for KianOS top-level governance only.

This file does not own Project Definition, Architecture, worker rules, domain semantics, learner state or work progress.

## Current verdict

```text
Architecture target         CURRENT
Authority / owner structure CURRENT
Anti-drift mechanism        IMPLEMENTED / TARGETED CI PASS
Fresh-Chat whole-system     REVALIDATION_REQUIRED
Long-run failure-path       REVALIDATION_REQUIRED

GOVERNANCE ACCEPTED         NOT YET RE-CLOSED
```

Reason:

> The top-level architecture and cross-system boundaries changed materially during the Three-System Architecture Convergence project. Historical governance PASS evidence predates those changes and cannot be silently reused as exact-current acceptance.

## Evidence already preserved

- `PROJECT_DEFINITION.md` owns current product requirements.
- `ARCHITECTURE.md` owns current durable KianOS responsibilities.
- `AUTHORITY_INHERITANCE_CONTRACT.md` owns authority inheritance, Change Continuity, Change Propagation, Current/History and closure rules.
- `AUTHORITY_OWNERSHIP.json` owns the machine-readable shared-owner topology.
- `tools/authority_consistency_audit.py` and `tools/authority_projection_audit.py` enforce structural authority/projection boundaries.
- `tools/test_anti_drift_invariants.py` adversarially tests representative closure, review-witness and derived-projection freshness failures.
- The Authority Consistency workflow passed after the new anti-drift mutation tests were connected.

These prove their exact scopes. They do **not** by themselves prove Fresh-Chat recovery, all historical cleanup, real-use resilience or the final converged architecture.

## Re-acceptance gate

Governance may return to `ACCEPTED` only after the convergence project reaches its Fresh-Chat / failure-path attack stage and demonstrates at least:

1. known-scope Fresh Chat recovery without conversation archaeology;
2. no competing Current owner on representative cross-system and KianOS hot paths;
3. missing/stale upstream evidence degrades only dependent claims/actions;
4. retired/history assets do not re-enter Current resolution;
5. representative invalid derived/lifecycle states fail closed;
6. normal legitimate changes do not require manual synchronization of multiple Current mirrors.

Acceptance must describe the exact current architecture, not a prior redesign.

## History boundary

Prior A1–A6 test narratives, old commit SHAs, CI run IDs and migration details remain available in Git history. They are historical evidence and are intentionally not copied into this Current acceptance owner.

Do not use an old PASS label from Git history as current acceptance after a material architecture change.