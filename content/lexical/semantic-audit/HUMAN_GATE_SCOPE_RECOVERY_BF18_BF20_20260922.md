# Human Gate Scope Recovery — BF18 / BF19 / BF20 — 2026-09-22

Status: **RECOVERED**

## Controlling scope

The explicit conversation control for the relevant `p` was:

- approve **BF18 only**;
- exact BF18 scope = seven new Form groups;
- do **not** extend that approval to BF19 or BF20.

A later grouped-approval artifact incorrectly broadened that token to BF19 and BF20.

## Impact

- BF18: valid; its seven approved Form groups remain canonical.
- BF19: valid existing-truth repairs from PR #808 are retained, but ten new Form groups were not authorized.
- BF20: never materialized under the incorrect approval, so no content rollback was required.

## Recovery action

Official recovery package:

`BF19-human-gate-scope-recovery-v1`

Executor commit:

`ad23ac85627dcafb4ec7c1645bfc6141f29488bc`

The recovery removed exactly the ten BF19 `form_identity` additions and rebuilt all 7,946 Final Learner Objects. Readback confirmed all ten Form objects are absent while existing-truth BF19 corrections remain.

## Gate state after recovery

- BF18 = CLOSED
- BF19 = WAITING_HUMAN_GATE for its exact ten frozen Form groups
- BF20 = REVIEW_AHEAD_FROZEN / UNAPPROVED
- BF21 = not started

Future approval tokens are checkpoint-specific unless Kian explicitly states a broader scope.
