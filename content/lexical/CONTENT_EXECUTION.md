# Lexical Content Execution

Status: operating protocol; production is controlled by `CURRENT.md`.  
Content quality: `CONTENT_ASSET_CONTRACT.md`. Learner rules: `LEARNING_CONTRACT.md`.  
This file owns transport, bounded execution and recovery mechanics only. It cannot grant semantic PASS or reactivate Catalog work.

## 1. Package is not a Chat turn

A package is an allocation/landing container, normally about 150–250 owners (200 is a planning target, not a quota). A semantic shard is the bounded unit that actually closes. A Chat turn normally closes at most one shard and leaves a durable checkpoint rather than exhausting context.

A shard is often 25–50 owners, but **semantic/byte budget wins over count**. A rich cluster may need far fewer; simple healthy owners may permit more. Increasing package size while retaining per-word remote reads/writes is prohibited as a throughput strategy.

Engineering budgets are not learner study quotas. Initial tool defaults are 48,000 compact UTF-8 bytes and at most 50 owners per returned bundle. Tune only with measured output size and semantic complexity. Do not shorten lexical truth to hit a byte budget.

## 2. One local-close cycle

`Current + contract hashes → compact Current owner/dependency bundle → fresh judgments → staged patch → validation → complete final-object readback → local receipt → integrate / CI → main acceptance`

One package may contain several closed shards in one PR. A bounded shard may land separately when capacity or an interruption makes that safer. Neither one PR per 12 words nor one compulsory monolithic 200-word PR is canonical.

Do not inspect several shards into a repair-spec backlog. A semantic checkpoint immediately before applying the same shard is valid; a growing future repair queue is not. Naming the work S-series, Batch or Wave does not change this rule. There is no new numbering system to memorize.

## 3. What may be compressed

Keep all semantic fields, active and reference senses, Core, Expansion, usage/form/register boundaries, stable IDs, lifecycle, uncertainty, relevant evidence and resolved Relation payloads. Unknown fields survive by default.

The initial tool omits only top-level provenance/lookup pointers and known operational record metadata from the **review view**, while retaining original bytes in the repository and exact file hashes. Metadata is not deleted by a semantic edit. Shared Relation objects are included once per bundle, with each Word's relation references preserved.

An oversized word fails explicitly. Expand the one-owner budget or inspect a bounded coherent object, never truncate a record or hide an unsent field behind an automatic PASS. A compact bundle is a transport projection, not a new semantic owner.

## 3A. Module-level stability receipt

Every fresh owner review must record a module matrix before closure.

Required module keys:

```text
core
senses
familiar_new
construction
phraseology
decision_boundary
relation_confusable
register_stance
family_morphology
form_identity
productive_use
repair_test
```

Each key is exactly one of:

```text
NOT_NEEDED
PRESERVE
UPGRADED
BLOCKED
```

For every `UPGRADED` or `BLOCKED` module, record at least one allowed change reason from `CONTENT_ASSET_CONTRACT.md §4A`.

A `NO_CHANGE` owner may still be `DEPTH_READY`; its module matrix proves that no module was silently skipped.

During **Baseline v2 full re-validation**, every owner/module must still receive a fresh judgment under the frozen rules; historical module state cannot skip the read.

After Baseline v2 closes, a later maintenance pass must read the latest closed module matrix and may not rewrite a `PRESERVE` module unless new evidence establishes an allowed gap.

This matrix belongs in the receipt / audit evidence, not in semantic Natural Owners.

---

## 3B. One-shard Kian Human Gate

Baseline-v2 review is **read-first, one report, one approval, then automatic closure**.

The normal interaction unit is one bounded shard, normally up to 50 owners.

Required sequence:

```text
fresh-read the whole shard
→ judge Content + Repair Test needs together
→ run the mandatory Production self-adversarial attack in §3C
→ freeze the post-attack proposal
→ give Kian one plain-language shard report
→ Kian approves once
→ automatically apply only the reported/approved Content fixes
→ automatically write the reported/approved Repair Test blueprints
→ rebuild derived Final Learner Objects
→ complete final-object readback + validation
→ write the local receipt / advance the exact cursor
→ immediately begin the next shard
→ return the next shard report
```

The single pre-change report should cover the whole shard and include only decision-relevant items:

- words/modules with a real Content problem, why it matters, and the smallest proposed fix;
- exact lexical targets that deserve a Repair Test blueprint and why;
- words that need no change / no Test may be summarized rather than expanded one by one;
- learner-page/UI impact (normally **none**).

One Kian approval for that shard authorizes all items explicitly included in that report:

- the reported Word / Relation / Form semantic fixes;
- the reported Repair Test blueprint writes;
- mechanical Final Learner Object materialization;
- validation / receipt updates;
- exact cursor advancement to the next shard.

Do **not** insert a second approval gate between Content and Repair Test work, and do not ask again before starting the next shard. The next Human Gate is the next shard's combined report.

Hard rules:

- no semantic Content or Repair Test mutation before the shard approval;
- no bundling hidden extra fixes into an approved shard;
- approval for one shard does not authorize unreported fixes in later shards;
- `PRESERVE` / `NOT_NEEDED` decisions may be recorded without mutation;
- mechanical derived materialization after approved changes does not need separate approval;
- if writeback/readback exposes a **new semantic problem not present in the approved report**, stop that new mutation and surface it in the next report rather than silently expanding scope;
- a critical correctness defect may be reported immediately, but still waits for approval unless leaving it unmodified would corrupt already-running data.

Learner-page / UI changes remain governed separately and are never implied by Content approval.

---

## 3C. Production self-adversarial attack — mandatory before Human Gate

Baseline-v2 production must not send its first draft judgment directly to Kian.

After the whole Human-Gate batch has received a fresh owner/module judgment, the **same Production Chat** performs one bounded self-adversarial pass before writing the report.

This is stronger than casual self-review, but it is **not independent audit evidence**.

Required challengers:

```text
A. OVER-UPGRADE
   If we do nothing, would the learner actually lose a material decision,
   transfer advantage, or high-leverage Expansion?
   If no, remove/narrow the proposed mutation.

B. UNDER-UPGRADE
   What is the strongest plausible missed Core/Decision or high-leverage Expansion?
   Look especially for familiar-new branches, non-obvious Form, morphology,
   academic/professional use, and real cross-word boundaries.

C. LAYER PLACEMENT
   Is this truth correctly placed in Core / Expansion / Reference?
   Good knowledge in the wrong attention layer is still a defect.

D. OWNER PLACEMENT
   Does the truth belong to Word, Relation, or Form/Identity?
   Do not manufacture a Relation because a Form boundary exists, or a fake Sense
   because pronunciation/capitalization owns the distinction.

E. NEGATIVE SPACE
   What should deliberately stay out of default Study?
   Attack dictionary-completeness inflation, rare specialist micro-senses,
   historical trivia, and decorative family trees.

F. TEST INFLATION
   If the learner answered the proposed Test wrong, would that change the next
   Repair decision?
   If no, do not prebuild the Test merely because the Content is worth learning.

G. EXAM-ONLY OVERPRUNING
   Did exam priority cause us to discard a genuinely high-leverage lexical asset
   that supports broader vocabulary growth, academic English, morphology,
   pronunciation/form recognition, or productive transfer?
```

The post-attack judgment supersedes the first draft.

Record at batch level:

```text
draft upgrades/tests
→ self-attack removals
→ self-attack additions
→ self-attack re-layerings / owner corrections
→ final proposed Human-Gate set
```

The learner-facing Human Gate sees only the **post-attack** proposal, with plain-language before → after examples.

Same-Chat self-attack may never be described as fresh or independent acceptance.

## 4. Fresh judgment and readback

Each owner in a shard receives exactly one current-generation decision:

- operation: `NO_CHANGE` or `UPGRADED`;
- final quality: `SAFE_SIMPLE`, `DEPTH_READY` or `BLOCKED`;
- a concise, actual semantic rationale;
- the complete module matrix from §3A;
- explicit allowed change reason(s) for every upgraded / blocked module;
- exact before/dependency hashes and final view identity;
- for BLOCKED: the unmet requirement and smallest admissible closure evidence.

Old `FRESH_PASS_NO_CHANGE` / `VERIFIED_NO_DELTA` labels describe no mutation; they do not independently establish final quality. Reference-only is a placement decision for valid low-value material, not a shortcut for excluding an ordinary Main Word from coverage.

A simple word may pass quickly after reading its actual semantic object. Field presence, old audit approval, a no-diff file or a green validator cannot manufacture that judgment.

Final-object accountability covers **every** owner. For an unchanged owner whose own and dependency hashes still match, the just-reviewed full view may be reused without another remote fetch. Modified owners need their complete staged final view, not just a diff. Any relevant dependency/contract change invalidates only affected conclusions. Never substitute “read rich changed words only” for coverage of the rest.

## 5. Tool boundary and commands

`tools/lexical_shard.py` is a standard-library transport/staging tool. It does not call a model, classify semantic quality, mutate the source repository, push Git, merge a PR or update Acceptance. It outputs one bounded bundle or one staged candidate at a time.

```sh
python tools/lexical_shard.py export --root . --start 25 --end 224 --out /tmp/review.json
python tools/lexical_shard.py prepare --root . --bundle /tmp/review.json --patch /tmp/patch.json --out /tmp/candidate.json
python tools/lexical_shard.py publish-plan --root . --bundle /tmp/review.json --candidate /tmp/candidate.json --ack /tmp/readback.json --out /tmp/plan.json
```

`export` and `prepare` are inspection/staging only. `publish-plan` refuses unless Current has the exact standalone directive `Catalog execution: ACTIVE`; a PAUSED directive wins. Production activation is a deliberate Current change, never a CLI side effect.

Patch format:

```json
{"bundle_id":"exact bundle hash","decisions":[{"ordinal":25,"operation":"UPGRADED","quality":"DEPTH_READY","rationale":"actual fresh reasoning","edits":[{"pointer":"/record/core_concept","value":{"mental_model_cn":"complete reviewed replacement for this field"}}]}]}
```

The decisions array must contain every bundled ordinal exactly once. A NO_CHANGE decision has no edits. The illustrative patch above is not lexical content evidence. Use stable array identities; replace a complete named field rather than editing a numeric array position. Original unmentioned fields survive.

Readback acknowledgment contains the exact `candidate_id`, a reviewer identifier, and `reviewed_views` mapping every bundled ordinal to its final view hash. The tool reconstructs the candidate from original files and declared edits before producing Git tree elements. Rehashed but contradictory views/candidates are rejected.

The resulting receipt is `LOCAL_CLOSED_PENDING_INTEGRATION`, **not main acceptance**. Apply all approved tree elements in one isolated branch commit; run the existing Natural Owner/integration checks and exact-head CI, including cache/projection consistency. Only then reconcile current main, publish, read back final identities and count accepted coverage. Never copy all files from an old branch or advance K merely because the local receipt exists.

Initial implementation supports Word-local edits only. Relation/Form changes require a narrow shared-owner handoff; they are not silently patched by ordinal workers. This is an explicit capability boundary, not permission to bury cross-owner debt.

## 6. Continuation without a long Chat

For an activated package, its machine manifest owns only range allocation and shard checkpoints, not a second human Work Cursor. It records: package ID, acceptance generation, baseline/contract fingerprints, claimed nonoverlapping ranges, exact write/read sets, shard statuses, receipt/commit identities, unresolved holes and the next smallest action.

Use `PENDING → REVIEWING → STAGED → LOCAL_CLOSED → INTEGRATED`, with `BLOCKED`/`INTERRUPTED` when appropriate. Reviewed-terminal count, accepted count, integrated count and contiguous frontier are different quantities. A BLOCKED word may not stop independent ranges, but it remains a visible gap and never counts as accepted.

Do not create an active package manifest while Catalog is paused. On interruption, persist at most the current bounded shard checkpoint. A staged or branch-committed patch is not accepted main content. Next Chat reads Current → active package/checkpoint → the exact current shard, not old Chat history or every prior receipt.

## 6A. Content lane cannot edit learner pages

Continuous lexical Content execution may mutate canonical lexical owners, derived learner objects, Repair Test blueprints and receipts only.

It must not modify `static-web/**`, learner-page layout, navigation, typography, interactions, renderer semantic inclusion, or accepted Vocabulary surface geometry.

If final-object readback reveals that correct Content is not faithfully shown, emit a bounded renderer defect and route it to the UI owner. Do not distort Content to compensate.

---

## 7. Concurrency and history

Ordinals may be allocated to 2–3 workers only after the single-worker transport/closure path is proven. Allocation ranges are disjoint; shared Relation/Form writes go to one reconciler using current hashes. No stacked branch dependencies. An unrelated main advance does not invalidate independent work; changed read/write sets or contracts do.

Historical candidates are opt-in accelerators for a **named bounded salvage task**, never default input. Read Current first; retain veto power; accept useful semantics as a new current patch. Do not merge a historical CURRENT/ACCEPTANCE or replay its old acceptance labels.

Historical branch disposition lives in `execution/historical-routes.json`. Preserve unique work until a bounded salvage review or verified archive makes deletion safe. Exact duplicate refs may be retired after their shared head is verified. Age, branch name and ahead/behind counts alone are not semantic acceptance or deletion proof.

## 8. Stop retrying non-progress

At most one retry of an unchanged transport/CI operation. Then change method or return the precise checkpoint and infrastructure limitation. Do not cycle through old commits, ZIPs, branch names and the same oversized response. No permanent requirement for an unavailable historical artifact unless the claim is historical fidelity itself.

Differentiate `SEMANTIC_BLOCKED`, `SHARED_OWNER_HANDOFF`, `STALE_READ_SET`, `BUNDLE_OVERSIZED`, `TRANSPORT_UNAVAILABLE`, `CI_EXECUTION_UNAVAILABLE` and `INTEGRATION_PENDING`. An infrastructure failure cannot become a semantic failure or a false PASS.

Stop the turn while there is still room to checkpoint and explain the result. Measure semantic decisions, accepted/integrated owners, payload bytes, remote round trips, repetitions and failure recovery separately. A transport-only pilot on 50 current owners proves transport only: semantic acceptance delta and learner-state mutation remain zero.
