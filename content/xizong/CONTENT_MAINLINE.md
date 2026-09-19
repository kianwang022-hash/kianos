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

## D｜Neuro / Sensory / Motor / Orthopedics — CONTENT CLOSED / DOWNSTREAM HANDOFF

Current accepted state:

```text
S1 Source boundary                     PASS
S2 exact official-question membership  UNTESTED / separate later boundary
K  Knowledge                           PASS
L  Learning Logic                      PASS_AFTER_REPAIR
Content Realization / Optimization     PASS
P  Projection                          UNTESTED / next eligible D gate
R / E                                  downstream-frozen
U                                      no claim
```

Stable D identity remains 27 Blocks / 356 KP / 128 LG.

Fresh independent Content closure is recorded in:

`content/xizong/knowledge/learner/D_PHASE7E_FRESH_INDEPENDENT_CONTENT_CLOSURE.md`

D is no longer the active Lane-A **content** construction task. The next D dependency is scoped Projection; do not reopen D Content without a concrete Source/Knowledge/Learning/Content defect.

## E｜Reproductive / Breast — ACTIVE CONTENT PRIORITY

E now owns the earliest unblocked Lane-A medical-content work.

Current durable substrate exists under:

- `content/xizong/knowledge/systems/e-reproductive-breast/e-e1-e14/`
- `content/xizong/knowledge/systems/e-reproductive-breast/sr-sr1-sr6/`

E does **not** yet have its own accepted scoped `CURRENT / ACCEPTANCE / system.json`. Therefore the true next stage is not “copy D Phase 7”; it is:

```text
bounded Source reconstruction / boundary
→ Knowledge reconstruction
→ independent K acceptance
→ Learning Logic construction
→ independent L acceptance
→ Content Realization
→ LG-by-LG Content sufficiency / density audit
→ fresh independent Content closure
```

Use D Phase 7 only to calibrate realization quality and failure modes after E reaches Content. Do not copy D Block/LG/Source-contact topology for symmetry.

## F｜Remaining Clinical — LATER

F remains later than D/E unless exam priority or a real dependency justifies reprioritization.

---

# 3｜Lane B — Questions

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

# 5｜Unified D / E / F generation rule

D / E / F inherit the same construction standard already proven across mature Xizong systems.

Authority chain:

```text
LEARNING_ASSET_STANDARD.md
→ content/xizong/LEARNING_CONTRACT.md
→ exact System Source / Knowledge / Learning owner
→ this Mainline for program sequencing
```

The shared generation sequence is:

```text
1. Source reconstruction / boundary
2. Knowledge reconstruction
3. independent K acceptance
4. Learning Logic construction
5. independent L acceptance
6. Content Realization
7. LG-by-LG Content sufficiency / density audit
8. fresh independent Content closure
9. only then downstream P / R / E where needed
```

Content Realization should use the stable responsibility set matured during D Phase 7:

```text
ORIENTATION
SOURCE_CONTACT
RETRIEVAL
CORE_CHECK
BOUNDARY
COMPRESSION
```

These are content responsibilities, not mandatory file fields or UI sections.

A / B / C are calibration evidence for quality and failure modes. They are not templates to copy.

Therefore keep synchronized:

- Source truth / gap discipline;
- Knowledge quality bar;
- Learning / Content construction sequence;
- independent audit expectations;
- Recall-front answer protection;
- website-disappearance test;
- no duplicate medical truth;
- no UI/Runtime semantics inside Content.

Do **not** synchronize by symmetry:

- Block count or size;
- KP count;
- Logic Group count;
- Source-contact granularity;
- prerequisite graph / default route;
- Visual quantity;
- compression topology.

Each System must derive those from its own Source and cognition.

Hard rule:

> Use A/B/C to calibrate quality, not to manufacture D/E/F shape.

D Phase 7 is the current calibration for how accepted Knowledge + Learning become durable Content. E/F should start with this method rather than inventing a separate realization model, while remaining free to produce different medical topology when their Source requires it.

Fresh-chat execution rule:

```text
read main@HEAD
→ this Mainline
→ exact active System cursor/owner
→ inherit the unified generation rule above
→ continue the earliest unresolved stage
```

Do not reopen the generation standard unless fresh evidence shows the shared method itself is wrong.

---

# 6｜Default concurrency

```text
Medical:
E Source / Knowledge reconstruction = active content priority
+ D scoped Projection may proceed independently downstream

Questions:
Crosswalk C2 batches
+ bounded official System-scope tasks

Visual:
small high-value reviewed batches on already-stable owners
```

Parallel work is safe only with independent write sets and no unresolved semantic dependency. When `main` moves, sync/rebuild the small batch; never force an old long-lived branch over newer Current truth.

---

# 7｜Relation to website / engineering mainline

Website engineering is separate under `static-web/` and `XIZONG_PRODUCT_STATUS.md`.

Current website sequence after #331 is System Workspace convergence; content lanes do not wait for it. Conversely, shared renderer availability never promotes unaccepted medical content.

---

# 8｜Definition of “continue”

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

# 9｜Current snapshot

```text
MAIN MEDICAL CONTENT
D Content PASS / CLOSED
→ D P / high-value Visual / Runtime downstream

ACTIVE CONTENT PRIORITY
E Source reconstruction / boundary
→ Knowledge
→ K acceptance
→ Learning
→ Content

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