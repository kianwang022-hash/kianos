# KianOS Branch Lifecycle

This repository has one durable shared Current authority: `main@HEAD`.

Work branches are temporary execution surfaces. They are not Current owners, continuation stores, recovery authorities, or long-lived project state.

## Default rule

`WORK_BRANCH → land accepted work on main → verify Current → retire branch`

A task is not fully closed while its temporary branch remains live without an explicit continuing purpose.

## Branch states

### ACTIVE

The branch still contains independent work that has not yet been accepted or intentionally remains under review/reconciliation.

Keep it only while that purpose is real.

### MERGED / mechanically proven superseded

A branch is safe for automatic retirement when current Git/GitHub facts prove one of:

- its head is an ancestor of `main@HEAD`; or
- for a non-Codex branch, its live head exactly equals the recorded head SHA of a merged PR whose base is `main`, and it has no open PR;
- for a Codex branch, its exact Issue is completed and its live head exactly matches a merged PR head under the stricter Codex lifecycle.

Git history already preserves the work.

### SEMANTICALLY SUPERSEDED BUT NOT MECHANICALLY PROVEN

A squash/cherry-pick/reimplementation can make a branch obsolete even when Git ancestry or exact-head proof is unavailable.

Do **not** maintain a permanent retired-branch ledger for this class.

Instead, the responsible Chat performs one bounded Current verification:

1. accepted result exists on current `main@HEAD`;
2. no private learner state or unique unreviewed work remains only on the branch;
3. no open/continuing task still needs the branch;
4. delete the exact branch in that same work session.

If any point cannot be proven, leave the branch ACTIVE and state the uncertainty. Age, name similarity, an old closed PR, or a vaguely similar Current implementation is never deletion proof.

## Automatic cleanup

`.github/workflows/branch-hygiene.yml` is intentionally mechanical and fail-closed.

On pushes to `main` it may retire only:

- commit-merged branches;
- exact-head merged-to-main non-Codex branches with no open PR;
- completed Codex branches that satisfy their exact Issue + merged-head proof.

Every other non-main branch survives automatically.

This keeps automation stateless: current GitHub facts decide, not a historical list of branch names.

## Standing authorization

Kian has authorized automatic deletion only for the mechanically proven classes above.

Semantic supersession outside those classes is a bounded repository-maintenance action after Current verification; it is not delegated to a standing historical ledger.

## Migration / audit branches

Migration, import, transfer, calibration, audit, repair and acceptance branches are temporary by default. Close and remove them when their bounded result is accepted and no unique work remains.

## Main stays special

`main` is never deleted or rewritten by branch hygiene.

Branch hygiene is repository maintenance only. It does not change semantic authority, learner evidence, acceptance status or any Current owner.