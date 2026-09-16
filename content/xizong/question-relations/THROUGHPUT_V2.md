# Crosswalk C2 Throughput v2

Status: implementation note; semantic authority remains Current Knowledge + REVIEWED relation rows.

## Goal

Reduce mechanical review/CI overhead without relaxing the exact-owner gate.

## Runtime

- Default accepted batch target: 25–40 relations.
- Candidate packet: 100 questions.
- `pending-reviewed-batches` remains transport only.
- Materializer now advances canonical shards, deletes staging, and advances `continuation.json` in the same deterministic pass.
- Relation-only PRs use Crosswalk Fast QA.
- Fast QA still runs manifest validation, Crosswalk validation, review-pipeline validation and Astro build.
- A full Xizong contract/browser regression is automatically added when a batch crosses a 50-relation coverage boundary.
- Knowledge/UI/runtime changes continue to use the full Xizong QA workflow.

## Review acceleration

`build-xizong-kp-lookup-index.mjs` generates a non-authoritative index containing exact KP identifiers, titles/snippets, canonical paths and current Git blob SHA. It is only a locator. Chat must still inspect the exact Current owner before authoring a REVIEWED relation.

## Invariants

- no inferred targets;
- missing mapping remains legal;
- source conflicts do not get silently resolved;
- one canonical positive-truth owner under `content/xizong/question-relations/`;
- reverse lookup remains derived;
- throughput changes do not alter learner-facing UI/runtime semantics.
