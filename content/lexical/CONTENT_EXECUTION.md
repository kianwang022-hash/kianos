# Lexical Content Execution

Status: **CURRENT maintenance protocol · broad catalog production CLOSED**  
Parent router: `content/lexical/CURRENT.md`

This file owns only the **mechanical execution boundary for bounded Lexical maintenance**. It does not own Word / Relation / Form semantics, learner state, Acceptance Truth, a production frontier, or a second Current cursor.

## 1. Current boundary

The 7,946-word broad semantic campaign is closed.

Current rules:

- there is no active A / B / C production lane;
- there is no active ordinal frontier, live batch, package queue, Human-Gate board, or review branch;
- old batch manifests, receipts and completed review state are provenance only;
- accepted lexical truth defaults to PRESERVE;
- broad semantic re-review remains frozen by `FINAL_SEMANTIC_FREEZE.md`;
- maintenance reopens only for a concrete defect, admitted new Source, explicit new scope, or real learner evidence that exposes a concrete content/product defect.

Current authority remains:

```text
content/lexical/CURRENT.md
→ applicable Content / Learning rule
→ exact Word / Relation / Form owner
→ affected derived consumer only when needed
```

Historical execution state must never choose a Current next action.

## 2. Maintenance execution path

For an admitted bounded repair:

```text
Current defect / admitted Source / explicit scope
→ read latest exact Natural Owner + real semantic dependencies
→ make the smallest evidence-supported owner delta
→ run changed-owner / dependency QA
→ rebuild derived Final Learner Objects when their inputs changed
→ verify the affected real consumer only when presentation/runtime behavior changed
→ durable readback
→ stop
```

There is no cursor advancement after a maintenance repair. A second independent defect is a new bounded task, not continuation of an old catalog campaign.

## 3. Current tools

### Bounded transport

`tools/lexical_shard.py` remains a standard-library inspection/staging helper.

It may:

- export a bounded complete Current-owner/dependency view;
- verify bundle integrity and byte limits;
- prepare a candidate from explicit edits;
- produce a publication plan only when the root Lexical `CURRENT.md` explicitly activates catalog execution.

Current `content/lexical/CURRENT.md` contains no `Catalog execution: ACTIVE` directive, so publication-plan behavior fails closed today. The tool is transport, not a production cursor or semantic authority.

Its active regression owner is:

`.github/workflows/lexical-shard-tools.yml`

### Derived Final Learner Objects

`tools/lexical_build_final_learner_objects.py` is the deterministic derived-object materializer/validator.

Natural Owners remain semantic authority. Final Learner Objects under `content/lexical/learner/final/` are derived learner assets and may be rebuilt from Current owners; a derived rebuild never creates new lexical truth.

Active gates:

- `.github/workflows/lexical-content-fast-qa.yml` for bounded content changes;
- `.github/workflows/lexical-runtime.yml` for the learner-facing derived/runtime path.

### Read-only diagnostics

The remaining `tools/lexical_*_audit.py` / owner-lineage diagnostics are on-demand evidence tools. They may identify a concrete local defect; their existence does not authorize another full-catalog campaign or create a persistent review queue.

## 4. Historical execution evidence

The following classes may remain because they are bounded provenance, not Current control:

- completed `execution/dual-review*.json` campaign records;
- `execution/manifests/**`;
- `execution/mutation-receipts/**`;
- `execution/receipts/**`;
- `execution/historical-routes.json`;
- historical semantic-review / reconciliation evidence.

Normal maintenance must not read these to discover “where to continue.” Git history remains the fallback for removed controller implementations and superseded runtime protocols.

The former live-batch board, three-Chat runtime, continuous implementation queue and final-mutation executor are retired from Current operation. They must not be recreated unless a new explicit catalog-wide scope is accepted and the current owner is deliberately changed first.

## 5. Concurrency and stale-input safety

Before a semantic write:

- refresh the exact owner revision;
- refresh every material semantic dependency in the write/read set;
- reconcile only real overlapping changes;
- never force an old package over newer Current truth.

Unrelated `main` movement is not a blocker.

For a multi-file bounded repair, prefer one atomic Git write set after the semantic decision is fixed. A stale owner/dependency blocks only that repair.

## 6. Verification and stop

Use the smallest proof that establishes the requested effect:

```text
exact owner read
→ bounded repair
→ changed-owner/dependency validator
→ derived rebuild only if affected
→ real consumer proof only if affected
→ readback
→ stop
```

Do not run a full-catalog semantic audit, full-site/browser suite, or historical campaign harness for a routine local maintenance change unless the exact defect genuinely crosses that boundary.
