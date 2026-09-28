# KianOS Governance Acceptance

Status: **ACCEPTED**
Role: current acceptance truth for KianOS top-level governance only.

This file does not own Project Definition, Architecture, worker rules, domain semantics, learner state, project state or work progress.

## Current verdict

```text
Architecture target             CURRENT
Authority / owner structure     CURRENT
Anti-drift mechanism            IMPLEMENTED / TARGETED CI PASS
Fresh-Chat whole-system         PASS FOR CURRENT PRE-USE GOVERNANCE
Failure / degraded-path attack  PASS FOR CURRENT PRE-USE GOVERNANCE
Long-horizon real-use / soak    PASSIVE OBSERVATION / NOT A GOVERNANCE BLOCKER

GOVERNANCE ACCEPTED             CURRENT
```

This acceptance is claim-scoped. It accepts the **current pre-use governance architecture and failure semantics**. It does not manufacture learner Real-U, future Source behavior, future platform changes or indefinite long-run soak evidence.

The new whole-system maturity/stress campaign in Personal Issue #53 may discover a concrete defect and reopen only the smallest dependent governance claim. The existence of that audit does not by itself invalidate this current baseline.

## Current acceptance basis

The prior `REVALIDATION_REQUIRED` state was introduced because the top-level architecture and cross-system boundaries changed materially during Three-System Architecture Convergence. The convergence subsequently completed its Fresh-Chat / failure-path attack stage and closed on 2026-09-26.

The current evidence satisfies this owner's re-acceptance gate:

1. **Known-scope Fresh Chat recovery — PASS.** Current routing resolves through current owners without relying on conversation archaeology; whole-system recovery was exercised during final convergence acceptance.
2. **Representative Current uniqueness — PASS.** Root / program / exact-owner routing was reconciled so representative cross-system and KianOS hot paths do not require competing hand-maintained Current mirrors.
3. **Missing/stale upstream evidence is dependency-local — PASS.** Current cross-system contracts require UNKNOWN / degraded behavior only for dependent claims/actions rather than poisoning unrelated healthy work.
4. **Retired/history assets stay off Current resolution — PASS.** Current routers and lifecycle owners explicitly separate active truth from historical acceptance/implementation evidence.
5. **Representative invalid derived/lifecycle states fail closed — PASS.** Authority/projection consistency plus lifecycle/review-witness regression coverage exercise stale, invalid and missing-evidence failure classes.
6. **Normal legitimate changes do not require manual Current synchronization — PASS for current governance scope.** Canonical-owner + consumer/projection rules and current delivery/recovery paths remove the prior need for multiple hand-maintained Current mirrors.

The final convergence evidence is preserved in Personal `cross-system/ACCEPTANCE.md` and closed Personal Issue #47. Those are supporting evidence; this file remains the authoritative KianOS governance acceptance owner for the claim above.

## Evidence preserved at native owners

- `PROJECT_DEFINITION.md` owns current product requirements.
- `ARCHITECTURE.md` owns current durable KianOS responsibilities.
- `AUTHORITY_INHERITANCE_CONTRACT.md` owns authority inheritance, Change Continuity, Change Propagation, Current/History and closure rules.
- `AUTHORITY_OWNERSHIP.json` owns the machine-readable shared-owner topology.
- `tools/authority_consistency_audit.py` and `tools/authority_projection_audit.py` enforce structural authority/projection boundaries.
- `tools/test_anti_drift_invariants.py` adversarially tests representative closure, review-witness and derived-projection freshness failures.

These prove their exact scopes. A future acceptance claim must still follow changed meaning + actual dependency; a current PASS is not permission to reuse stale evidence after a material architecture change.

## Reopen rule

Reopen this acceptance only when current evidence shows a governance-relevant dependency changed or a concrete defect invalidates one of the accepted premises above, for example:

- Fresh Chat can no longer recover the correct owner cheaply;
- a second Current / shadow authority becomes decision-active;
- stale/missing evidence poisons unrelated healthy work;
- retired/history assets re-enter Current resolution;
- invalid derived/lifecycle states stop failing closed;
- ordinary legitimate changes again require manual synchronization across multiple Current mirrors.

Normal learner friction, a domain-content defect, a new Source, or a local product bug does not automatically invalidate top-level governance unless it actually breaks a governance premise.

## History boundary

Prior A1–A6 test narratives, old commit SHAs, CI run IDs and migration details remain available in Git history. They are historical evidence and are intentionally not copied into this Current acceptance owner.

Do not use an old PASS label from Git history as current acceptance after a material architecture change. Revalidate only the real dependent claim.