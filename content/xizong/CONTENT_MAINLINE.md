# Xizong Content Mainline

Status: **CURRENT PROGRAM COORDINATION · DURABLE CHAT-RECOVERY OWNER**  
Parent router: `content/xizong/CURRENT.md`  
Human status view: `static-web/XIZONG_PRODUCT_STATUS.md`

This file exists so long-running Xizong content work does **not depend on Chat memory**. It owns program-level coordination only: what lane is active, what may run in parallel, dependencies, and the next durable restart point. Exact scoped `CURRENT.md` / `ACCEPTANCE.md` / canonical owners always win.

## Fresh-Chat restart

```text
main@HEAD
→ content/xizong/CURRENT.md
→ content/xizong/CONTENT_MAINLINE.md
→ exact lane owner
→ exact scoped CURRENT / ACCEPTANCE / canonical asset
→ work
```

Old Chats, prompts, Issue titles and branch names are provenance, not Current truth.

---

# 1｜Durable content lanes

Xizong content production has three long-running lanes:

```text
A. MAIN MEDICAL CONTENT
   D → E → F
   Source / Knowledge / Learning / Content realization

B. QUESTIONS
   exact official System question scope where unresolved
   + progressive Question → Knowledge Crosswalk

C. VISUAL / EXTENSION
   sparse high-value SOURCE_VISUAL / STRUCTURED_TABLE / SUMMARY_VISUAL
```

Precision, Guide/Framework and Projection are downstream/content-attached capabilities, not extra independent catalog-completion programs.

---

# 2｜Lane A — Main medical content

## D｜Neuro / Sensory / Motor / Orthopedics — ACTIVE PRIORITY

Upstream candidate owner: PR #284 / `work/xizong-d-content-20260916`.

Current accepted candidate state:

```text
S1 Source boundary                     PASS
S2 exact official-question membership  UNTESTED / separate later boundary
K  Knowledge                           PASS
L  Learning Logic                      PASS_AFTER_REPAIR
Content Realization / Optimization     ACTIVE
P / R / E                              downstream-frozen
U                                      no claim
```

Stable candidate identity remains 27 Blocks / 356 KP / 128 LG.

Fresh independent L is **no longer the active gate**. Phase 6 found and repaired readiness/prerequisite defects, then fresh re-acceptance passed. The active medical-content branch is:

`work/xizong-d-content-realization-20260917`

Current Content stage is Phase 7 realization/cleanup. It is removing stale learner-route wrappers, realizing accepted readiness/source-unit roles, and auditing LG/Block content sufficiency without broad medical-Core rewriting.

Important boundary:

> Active realization candidate ≠ Content PASS.

Required sequence now:

```text
finish D Content Realization / Optimization
→ fresh Content acceptance / readback
→ only then scoped P / Projection
→ high-value D Visual / Extension realization
→ Runtime / downstream acceptance
```

Do not start formal D Projection/Runtime or promote candidate Visual debt merely because shared infrastructure already exists.

## E｜Reproductive / Breast — PARALLEL GROUNDWORK

E may proceed independently while D realization runs:

```text
bounded Source reconstruction / audit
→ Knowledge construction / audit
→ independent K acceptance
→ Learning construction
→ builder self-adversarial Learning attack
→ fresh independent L acceptance
```

For substantial System-level Learning reconstruction, builder self-review cannot promote L by itself. E/F inherit the root production rule restored in `LEARNING_ASSET_STANDARD.md` / `LEARNING_ACCEPTANCE.md`; downstream P remains frozen until fresh L acceptance.

Do not copy D topology into E for symmetry.

## F｜Remaining Clinical — LATER

F remains later than D/E unless exam priority or a real dependency justifies reprioritization.

---

# 3｜Lane B — Questions

## B0｜Bounded production-protocol recovery — ACTIVE ON RECOVERY BRANCH

A Current-first recovery task is restoring production semantics that survived only in historical receipts while the final assets remained Current.

Bounded scope:

```text
repository learning-asset production
→ restore Knowledge falsification / bounded fresh readback
→ restore substantial-L self-adversarial + fresh-independent acceptance
→ restore substantial Content closure readback before P

Xizong Question Explanation
→ restore adaptive FAST/deep production rule
→ repair stale README/manifest process pointer
→ add production-integrity validation

cross-domain recovery scan
→ verify English / Politics / Lexical production owners
→ distinguish intentional conditional/retired paths from true lost production authority
→ repair only confirmed cases
→ close this temporary recovery task
```

Hard boundaries:

- no medical Core rewrite;
- no 3,750-question uniform enrichment campaign;
- no UI / Runtime redesign;
- no learner-state mutation;
- no new durable architecture layer when an existing owner can carry the recovered rule.

This is a temporary recovery task, not a fourth long-running Xizong content lane.

Keep two truths separate.

## B1｜Exact official System question scope

High-value unresolved bounded work currently includes B exact System membership and later D S2 once the D boundary is stable enough. System membership does not imply Block/KP mapping.

## B2｜Question → Knowledge Crosswalk

Durable owner: `content/xizong/question-relations/`  
Stage: `C2_BROAD_BASIC_COVERAGE`  
Batch cursor: `content/xizong/question-relations/continuation.json`

Restart:

```text
question-relations/README.md
→ CALIBRATION.md
→ THROUGHPUT_V2.md
→ manifest.json
→ continuation.json
→ next evidence-driven review packet
```

Rules remain: REVIEWED rows only are positive mapping truth; no linear frontier; no inferred target; missing mapping is legal; exact Current owner review is required. Ordinary batch progress belongs to `continuation.json`, not this file.

---

# 4｜Lane C — Visual / Extension

Authority: `content/xizong/EXTENSION_ASSET_CONTRACT.md`  
Representation: `static-web/XIZONG_REPRESENTATION_GATE.md`

This is a selective value program, not a coverage program.

```text
stable accepted medical owner
→ Visual Gate
→ high-value formal Extension slot if warranted
→ Representation Gate decides if/how it appears
```

A1/A2/A3: additive repair/replacement only.  
B/C: selective high-value assets only.  
D: expected Visual-heavy, but formal assets follow stable/accepted D content owners; current candidate/source debt may be preserved without promotion.  
E/F: stable owner first, formal Visual second.

No percentage-complete target exists.

---

# 5｜Default concurrency

```text
Medical:
D Content Realization / acceptance
+ E Source / Knowledge groundwork

Questions:
Crosswalk C2 batches
+ bounded official System-scope tasks

Visual:
small high-value reviewed batches on already-stable owners
```

Parallel work is safe only with independent write sets and no unresolved semantic dependency. When `main` moves, sync/rebuild the small batch; never force an old long-lived branch over newer Current truth.

---

# 6｜Relation to website / engineering mainline

Website engineering is separate under `static-web/` and `XIZONG_PRODUCT_STATUS.md`.

Current website sequence after #331 is System Workspace convergence; content lanes do not wait for it. Conversely, shared renderer availability never promotes unaccepted medical content.

---

# 7｜Definition of “continue”

“Continue Xizong content mainline” means:

1. read latest main and this program owner;
2. choose the highest-priority unblocked lane;
3. if this file names an active branch/PR, read the exact task cursor from that ref;
4. read the exact owner;
5. execute one bounded stage/batch;
6. update the task result **and exact lane cursor in the same branch/PR**;
7. merge accepted work and cursor together;
8. update this file only when a program-level stage/dependency/active-task set changes.

“Create a Xizong content task” means:

1. resolve whether it belongs to an existing lane or changes the program task set;
2. write it immediately into the narrow exact CURRENT/cursor or this Mainline;
3. verify the repository write;
4. only then report the task as created.

A task mentioned only in Chat is not a durable Xizong task.

Do not update this file for each Crosswalk batch, image crop, CI rerun, PR number or learner session.

---

# 8｜Current snapshot

```text
MAIN MEDICAL CONTENT
D L PASS_AFTER_REPAIR
→ D Content Realization / Optimization ACTIVE
→ Content acceptance
→ D P / high-value Visual / Runtime downstream

PARALLEL MEDICAL
E Source + Knowledge
→ K acceptance
→ Learning

LATER
F Source + Knowledge

QUESTIONS
B exact official-question scope where unresolved
+ Crosswalk C2 continuous reviewed batches

VISUAL
continuous sparse high-value Extension batches
A1/A2/A3 additive only
B/C selective
D Visual-heavy only after stable accepted content owners
```

This file coordinates work; it does not override scoped Current / Acceptance truth.