# B Phase 3 Logic Group Re-acceptance

Status: **SEMANTIC REVIEW COMPLETE / MATERIALIZATION PENDING — NOT PHASE3 PASS YET**  
Scope: `B — Digestive / Metabolic / Endocrine / Tumor`  
Execution task: GitHub Issue `#135`  
Canonical/derived Learning owner target: `content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning.json`

This file is durable construction/acceptance evidence only. It is **not** a second Learning owner and Runtime / Projection must not consume it.

---

## 1｜What is complete

A fresh Current-first semantic review has been completed across:

```text
38 / 38 stable Blocks
600 / 600 stable KPs
old candidate LGs + every proposed split/reorder
```

The review used Phase 0 A1-quality calibration, Phase 1 causal-readiness decisions, Phase 2 Block controls and actual canonical Block/KP Core.

Every proposed Logic Group was judged on:

- whether the included KPs form one natural continuous cognitive task;
- the task type (`causal / compare / discrimination / localization / decision / technique-map / boundary / connection / exactness`, etc.);
- a cognition-specific learner `goal`;
- a specific, falsifiable `closure`;
- split / merge / reorder alternatives;
- single-KP justification where applicable;
- preservation of exact stable KP coverage without changing medical Core.

The final semantic result is:

```text
stable Blocks       38
stable KPs          600
final Logic Groups  170
KP coverage          600 / 600 exactly once
medical KP changes   0
```

`170` is an output of semantic judgment, not a target count.

---

## 2｜Material structural changes from the old 150-LG candidate

The following Blocks require real repartition / learner-order change rather than prose-only semantic upgrade:

- **M1** — separate protein physicochemical handling from enzyme mechanism, and enzyme mechanism from kinetics/perturbation.
- **M7** — split `KP13–15` ketone-state chain from `KP16` essential-fatty-acid connection island.
- **M8** — split `KP1–3` amino-acid identity/classification from `KP4–7` derivatives/donor map.
- **D6** — expand three oversized groups into six distinct jobs: common hormone language, axis architecture, feedback, chemical class/receptor, clinical localization, high-BP/low-K application.
- **D7** — split target-tissue insulin signaling (`KP1–3`) from beta-cell glucose sensing/secretion (`KP4–5`).
- **D15** — repartition into seven jobs; specifically isolate `KP4` perioperative preparation, `KP13` premalignant/molecular island and `KP14` dentate-line coordinate.
- **D18** — isolate `KP15` liver-lesion imaging comparison from resectability/treatment/emergency decision.
- **D19** — major repartition into nine jobs so benign/inflammatory biliary learning does not become incorrectly gated by tumor cognition; Tumor Gate is reactivated only for the actual gallbladder-cancer / cholangiocarcinoma groups.
- **D21** — split the oversized hyperthyroid evidence/treatment/crisis/special-boundary group and isolate `KP29` thyroglossal-duct-cyst recognition from thyroid surgical safety.
- **G1** — split nucleic-acid identity/direction from DNA structure/packaging/stability.
- **G3** — separate protein maturation (`KP14`) from the targeting/translation-interference boundary (`KP15`).
- **G5** — preserve stable KP identity but change learner order to:

```text
KP01–05  tumor-control failure
→ KP12–13 mutation / DNA repair
→ KP06–11 molecular tools
```

This matches canonical G5 Framework semantics: first learn how abnormal control/damage arises, then how it is detected/manipulated.

---

## 3｜Important KEEP decisions after falsification

Fresh review did **not** rewrite/repartition by default.

Examples deliberately retained:

- `D1 KP06` remains a justified singleton molecular execution closure.
- `M1 KP06–08` remains together as a **physicochemical handling / technique** unit rather than being forced into a causal chain.
- `D8` keeps five relatively large groups because each corresponds to a real clinical work unit: classification/natural history, acute crisis, chronic organ damage, diagnosis/function, management/drug decision.
- `D10 KP20–25` remains continuous because it answers one escalation/reconstruction problem: medical control failure → gastrectomy → reconstruction-specific complications.
- `D13` retains four surgical work units; its current partition is already strongly action-oriented.
- `D17 KP19` remains a singleton `CONNECTION_BOUNDARY`: it contains the cirrhosis→gallstone and cirrhosis→nutrition/protein interfaces and must not be forced into the HE causal chain merely to eliminate a singleton.
- `D23` remains explicitly two-axis at Block level: calcium/PTH/VitD and GH/IGF are parallel models, not one invented causal chain.
- `G4` retains three groups because chromatin access, prokaryotic operon control and eukaryotic multilayer expression control are natural closures.

---

## 4｜Phase 0–3 compiled semantic spec

The accepted Phase 3 semantic construction has been compiled into:

`static-web/scripts/build-xizong-b-learning-candidate.mjs`

Generator commit:

`6fe522e121dad8c544d4453c4b778fd2afa290d3`

The generator now encodes:

- 170 cognition-specific Logic Groups;
- `cognitive_job + goal + closure + continuity_rationale` per group;
- explicit Current-grounded stop-lines for all 38 Blocks;
- Phase-1 readiness relations and low-switching default route;
- six non-gating Partial-System Reconstruction checkpoints;
- LG-scoped Tumor Gate semantics for mixed organ Blocks;
- G5 learner-order exception without KP renumbering;
- exact-once KP coverage validation that permits learner order to differ from stable KP order;
- hard checks for `38 Blocks / 600 KPs / 170 Logic Groups`.

The output construction status is designed to remain:

`PHASE3_SEMANTIC_CLOSED_PENDING_PROGRESSIVE_COMPRESSION_AUDIT`

so Phase 3 completion still does **not** claim L PASS.

Static read-back of the Current generator confirms:

```text
logicGroupCount === 170
38-Block identity hard check
exact-per-Block KP coverage hard check
system route = CAUSAL_READINESS_DAG_WITH_LOW_SWITCHING_DEFAULT
phase3_status = PASS_BY_FRESH_SEMANTIC_REVIEW
```

---

## 5｜Why Phase 3 is not marked PASS yet

The single derived Learning owner currently on `main` is still the old materialization:

```text
logic_group_count = 150
system_route.mode = CAUSAL_DEFAULT_WITH_SOURCE_CONTINUITY_FLEX
authority = CHAT_APPROVED_UPGRADE_WORK
```

Therefore accepting Phase 3 now would create a false split between the reviewed construction spec and the actual owner consumed downstream.

The existing push materializer did not run for connector-authored commits. An explicit Issue-#135 trigger was added, and PR `#145` added `workflow_dispatch` as a durable manual entrypoint; neither connector-generated event can be treated as proof of materialization.

Manual materializer support entered main through:

- `f64858d57557dcd4a2a305ec540d9ab3b22f2e15` — Issue-comment trigger support;
- PR `#145` / merge `a7db07eb74226c63ee34f12935a3f3fde034372e` — `workflow_dispatch` support.

### Required closure event

Run GitHub Actions workflow:

`Xizong B Learning Candidate`

via its manual `workflow_dispatch` entry.

The workflow itself is fail-closed: after executing the generator, the only permitted write is:

`content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning.json`

and it commits the derived owner back to `main`.

---

## 6｜Phase 3 exit checks after materialization

Phase 3 may become PASS only after the generated owner on `main` is read back and confirms all of the following:

```text
stable_block_count = 38
stable_kp_count = 600
logic_group_count = 170
coverage = exactly once
route mode = CAUSAL_READINESS_DAG_WITH_LOW_SWITCHING_DEFAULT
G5 learner order = [KP01–05, KP12–13, KP06–11]
D15 groups = 7
D18 groups = 4
D19 groups = 9
D21 groups = 11
G1 groups = 4
G3 groups = 5
old generic goal/closure boilerplate = 0
```

Then, and only then:

```text
Phase 3 = PASS
Phase 4 = eligible
```

Until that event, Issue #135 must remain at **Phase 3 ACTIVE / MATERIALIZATION PENDING** and P/R/E remain frozen.
