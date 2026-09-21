# L1 Shared Runtime Closure

Status: **CANDIDATE / NOT ACCEPTED**
Source baseline: `7cfbd9d643d0bae59fb5237986d5c21b66e15c8e` (fresh main checked).
Candidate: `work/l1-shared-runtime-closure-20260921`.
Actual Mac/browser execution envelope: #728. A created Issue is not an executed run.

```
L1_SHARED_RUNTIME_CLOSURE_READY = NO
MATERIAL_BLOCKERS = B1, B2, B3, B4, B5
```

This is one bounded lane result, not a registry, new architecture, subject audit,
or whole-system verdict. `CURRENT.md` remains the work cursor.

## Exact-base continuation on the same PR #732

Continuation input: uploaded `KianOS_L1_PR732_Continuation_Patch.zip`.
The fresh PR head was `1f37c2ec425079c6159e4352c4c86c7fe80aa950`; all five
baseline Git blobs and all five uploaded candidate blobs were verified before
application. No transplant from another branch, new PR or new Issue was used.

Candidate delta, not acceptance:

- B3: English plan basis includes the existing Lexical evidence ledger, intake
  records and card-routing evidence. Pronunciation preferences/navigation/UI-only
  keys remain excluded. One storage-key enumeration is reused across subjects.
  Bad evidence JSON, profile or timer cannot mint an empty valid basis. Packet
  time is null with warning when unreadable, not fabricated zero minutes.
- B2: private reprojection invokes the existing Lexical adapter and the same
  Xizong question/canonical scope builders and block input fields as Home.
  Restore warnings and coverage now reach `projection.packet`, the uploaded
  object. Failed subject reconstruction clears executable basis/plan while
  preserving healthy subject exports. Native differential parity remains open.
- B1/B4: raw receipt bytes enter the existing shared checkpoint; valid restore
  preserves those exact bytes, newer local receipt wins, corrupt receipt yields
  warning without becoming APPLIED. Receipt participates in outer rollback.
  Local emptiness and shared capture are evaluated after asynchronous checkpoint
  reads; denied reads do not authorize recovery writes. Corrupt timer data cannot
  be saved as a normalized empty checkpoint. File-store CAS remains open.

Proof actually rerun in the Linux Node v22.16.0 sandbox:

```text
original 33 cases on verified PR head: 11 PASS / 22 FAIL
original 33 cases after continuation:  33 PASS / 0 FAIL
original 33 + 8 bounded edge cases:    41 PASS / 0 FAIL
existing control transaction cases:   10 PASS (native/transport doubles)
existing actual Xizong D1 adapter:    PASS
existing fingerprint vectors:        1004 PASS
```

The new regression is `scripts/test-l1-continuation.mjs`; all original 33
scenarios are retained. The eight additions cover raw-byte receipt recovery,
outer warnings, post-await recovery/capture, denied/inconsistent storage reads,
and corrupt timer capture. Existing control-test changes only extend dependency
doubles for the new imports; the ten assertions, native D1 and 1004 vectors remain.
The existing Private Chat Control workflow includes this test before its native,
build and browser checks. Wiring is not proof that a workflow ran or passed.
Sandbox clone/build provisioning was unavailable (GitHub DNS failure); complete
native/browser/build, real Mac and remote receipt/readback are NOT ACCEPTED here.

Remaining continuation work (same B1–B5, no new framework):

- B1 OPEN: partial/corrupt/coupled subject capture/restore, legitimate deletion
  and native archive/reset distinction, file-store stale-write/CAS proof.
- B2 OPEN: same-input production browser/private packet comparison and healthy
  subject behavior with damaged native sibling payloads, beyond isolated doubles.
- B3 OPEN: M5 live Home still caches ready state on render-only callbacks;
  Source-version propagation and native Resume preservation need real proof.
- B3/B4 OPEN (M3): plan validation currently precedes native staging, but the
  final `writeExamChatPlan` validates against the changed shadow. An English
  learner declaration can therefore self-stale a plan in the same command.
  The plan must bind the pre-command evidence snapshot, then apply the explicit
  native operations atomically without exempting unrelated later evidence.
  This continuation does not claim that ordering defect fixed.
- B4 OPEN: actual receipt local -> checkpoint -> relay/readback, restart replay,
  older/stale-late commands and receipt failure against native/real endpoints.
- B5 OPEN: full candidate browser/build plus actual Mac/restart/hot-path proof;
  no learner deployment, Mac acceptance, or remote receipt acceptance claimed.

Only the directly useful repeated per-subject basis enumeration was collapsed.
Retired deterministic planner, Home unused large catalog, broader duplicate
subject enumeration, legacy recovery helpers and Website Current history remain
`DEFER_UNTIL_LANE_STABLE`. No native/Personal/watcher semantics were modified.

The original findings and proof below are retained as baseline evidence; the
continuation delta above supersedes only their explicitly repaired statements.

## Production shape / simplification

```
subject-native localStorage + shared Timer/profile
  -> dailyLearningPacketRuntime -> dailyLearningPacket (one v1 packet)
  -> Chat (judgment only)

subject-native localStorage + shared control
  -> privateCheckpointRuntime -> privateLearnerCheckpoint client
  -> privateLearnerBridge -> privateLearnerStore (outside disposable mirror)
  -> privateDailyLearningPacket -> SAME packet producer
  -> privateDailyLearningPacketRelay -> private runtime/kianos-learning ref

Chat -> private Personal control command
  -> privateControlRelaySync -> privateControlStore
  -> privateControlBridge -> privateControlRuntime
  -> native staged operations + explicit Chat Plan -> Home/read model
  -> local receipt -> localhost receipt store
  -> durable checkpoint/remote receipt path: NOT CLOSED (B2/B4)

Current sync -> staged Astro build -> static server -> accepted learner surface
BaseFrame -> restore -> Timer -> autosave/control polling
```

KEEP: one packet schema, native subject evidence/Return semantics, one shared
checkpoint family, explicit Chat control and no-plan native entry, private/public
boundary, staged Current delivery. Nothing here owns study allocation or Forecast
interpretation.

COLLAPSE: whole-storage command snapshot/diff becomes a lazy read-through staging
view with an explicit command write-set. The local apply receipt is part of that
transaction, rather than a separately swallowed write. Duplicate receipt retry
reuses the accepted result, not the native mutation.

SIMPLIFY: #727 D1 fills only missing Xizong durable keys and preserves existing
values; no new preservation ledger or diagnostic-key registry. FNV-1a64 arithmetic
uses two limbs instead of per-character BigInt allocations, preserving the exact
existing fingerprints. This does NOT expand evidence coverage or fix B3.

RETIRE: the command-wide raw storage snapshot and all-key reverse diff. Do not
remove other mechanisms without a demonstrated production dependency check.
Historical Current cleanup is deferred until actual lane stability.

## Current-first findings / bounded repair

### Candidate-repaired, isolated proof only

- Catalog await could revert newer unrelated Politics evidence and delete a newly
  written Xizong key. Async input now resolves before staging; only actual command
  writes are committed, with observed-value conflict checks.
- Lost/HTTP-error receipt could never be repaired by the idempotent path. Retry now
  republishes the same receipt without rerunning native operations and validates
  the localhost response/echo. `receipt_saved` is localhost acknowledgement only,
  not GitHub persistence or learner completion.
- Failed local receipt write could leave state applied and falsely publish APPLIED.
  The receipt now participates in the local transaction and failed writes roll back.
  Later rejected commands no longer erase the durable last-applied local receipt.
- Xizong D1: complete checkpoint 3 -> partial local 1 -> restore -> save shrank to 1.
  Candidate fill-only restore gives 3, preserves newer local position, and replays
  as a no-op. Direct partial capture and other failure cases remain B1.

### B1 — checkpoint integrity / isolation still open

Exact-main probes also reproduced: one corrupt Lexical payload prevents healthy
Xizong restore; an English conflict prevents healthy sibling restore; corrupt
local Lexical aborts capture; partial Lexical capture replaces a full payload with
a smaller one. Actual main file-store execution proved an older late write can
replace a newer checkpoint. Atomic rename is not revision/CAS protection.

Owners: `privateSubjectCheckpoints`, `privateCheckpointRuntime`,
`privateLearnerCheckpoint`, `privateLearnerBridge`, `privateLearnerStore`,
`sharedControlCheckpoint`.

Do not blindly union remote keys: native English attempt archival legitimately
removes the current key. Preserve native deletion/reset semantics and actual
English/Lexical coupling; request an exact native completeness/deletion interface
where existing truth cannot distinguish deletion from partial loss. Test stale
async reads/writes and recovery without overwriting newer local facts.

### B2 — legal packet paths are not yet proven equivalent

Actual private reconstruction restores xizong/english/politics only, although the
adapter inventory includes Lexical. It also omits Home's Xizong question/canonical
scope arguments. The native scope consumer uses those inputs for current-scope
and non-System-domain evidence; whole-file replacement from #640 would remove
current main's inputs. Shared control checkpoint omits the apply receipt. Relay
publishes `projection.packet`, not the separate warning/coverage wrapper.

Owners: `privateDailyLearningPacket`, `dailyLearningPacketRuntime`,
`dailyLearningPacket`, `privateDailyLearningPacketRelay`, shared checkpoint.
Reuse input assembly/native producers, preserve missing/corrupt coverage, and prove
native differential parity. Do not invent Xizong or Lexical projection semantics.

### B3 — freshness and live Home state still open

Exact main basis/validator probes reproduced:
- canonical Lexical ledger update leaves the old plan ready;
- malformed native evidence can be fingerprinted into an accepted basis;
- malformed shared profile can likewise support an accepted basis.
Known English evidence changes, capacity changes, settled Timer projection changes,
and old-day plans do invalidate at the validator; navigation-only change does not.
Timer reader also normalizes malformed/missing ledger data to an empty ledger;
its corruption-to-UNKNOWN behavior needs an actual producer/consumer regression.

Home's same-tab profile and Timer callbacks call render without reloading cached
plan state; native evidence storage keys are not in its reload filter. The pure
Chat read model keeps native continues when cross-subject plan is absent/stale,
but that does not prove live browser freshness or recovery.

Owners: `examChatPlan`, shared Timer/persistence, `examOrchestratorClient`,
`examPlanReadModel`. Establish native evidence/revision boundaries, do not hash
all localStorage. Source/schema drift and same-day browser replan remain unproven.

### B4 — end-to-end receipt/replay closure still open

Local transaction regressions are not the complete receipt chain. The inbound
relay does not publish a GitHub receipt itself; the checkpoint currently omits the
browser apply receipt. Persisted command, fetched command, applied command and
learner completion must remain separate. Verify generic older-after-newer/in-flight
commands, restart replay, expiry, failed receipt transport, rejected-command
handling and local/server/private-remote receipt divergence on real production
interfaces. Preserve last successful apply proof during errors.

Owners: `privateControlCommand`, `privateControlRuntime`, `privateControlStore`,
`privateControlBridge`, `privateControlRelaySync`, shared checkpoint/packet bridge.

### B5 — integration / actual Mac proof and final cleanup missing

The #728 watcher selected this task, but returned AUTO_EXECUTION_FAILED with
exit code 1 and no executor branch/PR or browser proof. This is a concrete
execution failure, not accepted Mac proof; do not retry it blindly.
Full native/browser tests, static-server and Astro restart, fresh browser restore,
private endpoint/remote readback, exact Home states and real hot-path measurements
are not accepted. Existing historical CI/Mac receipts do not prove this candidate.
Current delivery code was read: previous dist is retained during staged builds;
mirror sync is marker-guarded; private data defaults outside the mirror. This is
code evidence, not new restart/deployment proof. Do not deploy to real learner data
or use Kian as QA to fill the gap.

## Proof actually run

`node --experimental-vm-modules static-web/scripts/test-l1-control-transactions.mjs`

- 10 control orchestration checks (native adapters and transport explicitly doubled).
- D1 exact native Xizong adapter: 3 -> 1 -> restore/save 3, newer local retained.
- 1004 public basis fingerprint vectors: exact prior identities retained, including
  UTF-16 edge cases and 1 MiB synthetic input. No timing threshold in CI.

Parent sandbox: Linux / Node v22.16.0, not Kian's Mac. Original modules were Git-blob
SHA verified before unchanged baseline probes. 1 MiB raw hash primitive, five runs:
baseline 332.5–343.8 ms; candidate 4.6–5.2 ms. This is not full Packet/Home latency.
The 2000-unrelated-key control test verifies fewer than 20 raw reads, not a full
learner workload claim. No personal learner payload or protected source was used.

## Selective reconciliation / lane handoffs

#727: only D1's fill-missing invariant is reconciled in the shared adapter. D2/D3
and their native tests are untouched; no whole-PR merge and no Ultra verdict.

#640 at `418c8a24607d5708c6fbd5dac1f7828e199c61b7`:
- `dailyLearningPacket`, `examChatPlan`, `privateControlRuntime`: byte-identical to
  baseline main, so no transplant is needed.
- `dailyLearningPacketRuntime`: reject wholesale replacement; retain main's Xizong
  scope/day inputs. Lexical-only presence/error intent requires the exact native
  L2 producer interface and parity proof before accepting a small composition delta.

L2: native English/Lexical evidence and Source revision/completeness/deletion
interfaces; no independent landing of shared basis/packet/control files.
L3: D2/D3 remain native; provide existing canonical Xizong scope/revision inputs;
consume D1 only after shared candidate acceptance, not from this isolated proof.
L4: consume only evidence-grounded plans and stage-correct receipts; no prompt or
Charter edits in L1. Missing hooks/proofs are not Real-U calibration gates.
L5: #728 returned AUTO_EXECUTION_FAILED (exit 1, no executor proof).
Existing L5 task #729 owns any bounded executor-capability diagnosis; it must
not restart the learner service or edit shared Runtime. Reuse one real doctor
result, keep optional preparation failures separate from required Current
delivery, and do not create a second watcher or ask Kian to collect logs.

## Exclusive shared landing boundary / stop

L1 final landing: the shared lib/bridge/runtime/Current owners named above; Home
`src/pages/index.astro`, `src/components/ExamOrchestratorHome.astro`, shared bootstrap
in `src/layouts/BaseFrame.astro`; shared Timer/context persistence; existing Current
sync/static server; and their smallest affected tests/workflows. Native subject
files, Personal decision owners and background architecture are excluded.

Candidate implementation retains the original `privateControlRuntime.mjs`,
`privateSubjectCheckpoints.mjs` and `examChatPlan.mjs` changes. The continuation
adds only `dailyLearningPacket.mjs`, `sharedControlCheckpoint.mjs`,
`privateCheckpointRuntime.mjs`, `scripts/privateDailyLearningPacket.mjs`, the
bounded regression/dependency-double changes, existing workflow wiring, this
result and the active Current entry. Other copied native files used for isolated
tests are unchanged, not part of the continuation write-set.

After B1–B5 are closed on the same accepted candidate: record the requested ten
exit fields, slim Current without deleting acceptance evidence, and stop broad
shared engineering. Only a concrete shared defect or final composition failure
may reopen it. Until then, do not set L1 ready or whole-system Final PASS.
