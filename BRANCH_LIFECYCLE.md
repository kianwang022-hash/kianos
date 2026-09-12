# KianOS Branch Lifecycle

This repository has one durable shared Current authority: `main@HEAD`.

Work branches are temporary execution surfaces. They are not Current owners, continuation stores, recovery authorities, or long-lived project state.

## Default rule

`WORK_BRANCH -> land accepted work on main -> verify Current -> retire branch`

A task is not fully closed while its temporary branch remains live without an explicit continuing purpose.

## Branch states

Every non-`main` branch is conceptually one of three states:

### ACTIVE

The branch still contains independent work that has not yet been accepted into Current.

Keep it only while that work is genuinely active or still needs review/reconciliation.

### MERGED

The branch head is already an ancestor of `main@HEAD`.

It must be deleted automatically. Git history already preserves the work.

### SUPERSEDED

The exact branch commits may not be ancestors of `main` because work was squash-merged, cherry-picked, reimplemented, or replaced by a later accepted Current solution, but the branch no longer owns any needed independent continuation.

Once the responsible Chat verifies that Current contains the accepted result, the branch must be explicitly marked retired and deleted. Do not keep it "just in case"; Git history is the recovery plane.

## Closure checklist

Before reporting a branch-backed task as closed, frozen, accepted, or moved back to `main`, the responsible Chat must check:

1. the accepted result exists on current `main@HEAD`;
2. the relevant acceptance/QA state is recorded where required;
3. no private learner state or unreviewed unique work exists only on the branch;
4. the branch has no continuing task purpose;
5. the branch is retired in the same work session.

If step 3 or 4 is false, keep the branch and state why it remains ACTIVE.

## Automatic cleanup

`.github/workflows/branch-hygiene.yml` is the execution layer.

On pushes to `main` it:

- deletes every non-`main` branch whose head is fully merged into `main`;
- deletes branches explicitly listed in `.github/retired-branches.txt` after a Chat has verified semantic supersession;
- leaves every other unmerged branch untouched.

This means automation may delete only two safe classes:

- commit-merged branches; or
- explicitly retired branches.

It must never guess that a diverged branch is obsolete from age, name, or topic similarity.

## Standing authorization

The learner has explicitly authorized repository-wide automatic deletion of:

- temporary branches fully merged into `main`; and
- diverged branches explicitly entered into the retired-branch ledger after Current verification.

This standing authorization does **not** authorize deleting an unmerged branch that has not been explicitly retired.

## Migration / audit branches

Bounded migration, import, transfer, calibration, audit, repair, and acceptance branches are temporary by default. When their bounded task closes and accepted results are in Current, they must be retired under the same rule.

## Main stays special

`main` is never deleted or rewritten by branch hygiene.

Branch hygiene is repository maintenance only. It does not change semantic authority, learner evidence, acceptance status, or the recovery boundary.
