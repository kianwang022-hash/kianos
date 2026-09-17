# Xizong Content Mainline

Status: **CURRENT PROGRAM COORDINATION · DURABLE CHAT-RECOVERY OWNER**  
Parent router: `content/xizong/CURRENT.md`  
Human status view: `static-web/XIZONG_PRODUCT_STATUS.md`

This file exists so long-running Xizong content work does **not depend on Chat memory**.

It owns only the **program-level coordination** of the active content-production lanes: what is active, what may run in parallel, what depends on what, and where a fresh Chat must resume. It does **not** own medical truth, scoped Acceptance, learner state, Question Truth, Crosswalk truth, Extension truth, or UI semantics.

If this file conflicts with an exact scoped owner, the scoped owner wins.

---

## 0｜Fresh-Chat restart

For any content-production Chat, start here:

```text
main@HEAD
→ content/xizong/CURRENT.md
→ content/xizong/CONTENT_MAINLINE.md
→ exact lane owner below
→ exact scoped CURRENT / ACCEPTANCE / canonical asset
→ work
```

Do not reconstruct the program from old Chats, old prompts, stale Issues, branch names, or PR summaries.

The only purpose of a Chat prompt is to select a lane. The lane state itself must be recoverable from GitHub.

---

# 1｜Current content program in one view

Xizong content production currently has **three durable lanes**.

```text
A. MAIN MEDICAL CONTENT
   D → E → F
   Source / Knowledge / Learning / Content realization

B. QUESTIONS
   exact System official-question scope where unresolved
   + progressive Question → Knowledge Crosswalk

C. VISUAL / EXTENSION
   sparse high-value Source Visual / Structured Table / Summary Visual
   attached only to stable accepted owners
```

These are independent work streams when their write sets and semantic dependencies do not overlap.

Precision, Guide/Framework and Projection are **not separate fourth/fifth/sixth content programs**:

- Precision is admitted from real exact-memory content while the medical owner is being built or reviewed;
- Guide / Framework follows accepted Learning / Projection semantics;
- Projection begins only after the relevant content / Learning truth is stable enough to project safely.

---

# 2｜Lane A — Main medical content

## Current priority

### D｜Neuro / Sensory / Motor / Orthopedics

Current restart owner:

- candidate work: PR #284 / `work/xizong-d-content-20260916`;
- Fresh Independent L Audit is the current semantic gate;
- candidate scale: 27 Blocks / 356 KP / 128 LG;
- Content Realization / Optimization remains frozen until fresh L acceptance passes.

Required sequence:

```text
Fresh Independent L Audit
→ PASS
→ Content Realization / Optimization
→ scoped P / Projection
→ high-value Visual / Extension realization
→ Runtime / downstream acceptance
```

Do not skip the independent L gate merely because the candidate validates structurally or because the shared renderer can display it.

If the fresh audit returns `REVISION_REQUIRED`, repair the earliest responsible D owner and repeat fresh acceptance before advancing.

### E｜Reproductive / Breast

E may run **in parallel with D audit / D realization** because it starts earlier in the dependency chain.

Current role:

```text
bounded Source reconstruction / audit
→ Knowledge construction / audit
→ independent K acceptance
→ only then Learning construction
```

Do not copy D Learning topology into E merely for symmetry.

### F｜Remaining Clinical

F remains later than D / E by default.

Advance F only when:

- D/E capacity frees up; or
- exam priority / a real upstream dependency justifies reprioritization.

Do not start broad F work merely to keep all Systems visually symmetrical.

## Lane A restart rule

A fresh medical-content Chat must read:

```text
content/xizong/CURRENT.md
→ this file
→ exact System CURRENT / ACCEPTANCE if present
→ exact Source / Knowledge / Learning owners
```

The mainline decides **which System / stage is next**. The System owner decides **what is true inside that System**.

---

# 3｜Lane B — Questions

Questions contain two distinct programs and they must not be collapsed.

## B1｜Exact official System question scope

Question Truth exists independently of System membership.

Where exact System sweep membership is not accepted, close that scope as its own bounded semantic task.

Current high-value unresolved scope includes:

- B exact official-question membership;
- later D S2 exact official-question membership after D content boundary is stable enough;
- C / E / F only when their scoped owners are ready to support an honest claim.

System membership does **not** imply Block/KP mapping.

## B2｜Question → Knowledge Crosswalk

Durable owner:

`content/xizong/question-relations/`

Current program stage:

`C2_BROAD_BASIC_COVERAGE`

Canonical work cursor:

`content/xizong/question-relations/continuation.json`

Canonical positive mapping truth:

> only explicit `REVIEWED` rows under `content/xizong/question-relations/`.

Fresh-Chat restart:

```text
question-relations/README.md
→ CALIBRATION.md
→ THROUGHPUT_V2.md
→ manifest.json
→ continuation.json
→ next evidence-driven review packet
```

Rules:

- no linear ordinal frontier;
- no inferred target from title/page/System membership/model prior;
- missing mapping is legal;
- exact Current owner review is required;
- normal accepted batch size is quality-first, commonly 25–40 relations;
- candidate packets may be larger;
- relation-only batches use the accepted materializer + Crosswalk fast QA lane;
- a Crosswalk batch does **not** require UI redevelopment.

This mainline should **not** be updated for every ordinary Crosswalk batch. `continuation.json` owns batch-level continuation. Update this file only if the Crosswalk stage / policy materially changes.

---

# 4｜Lane C — Visual / Extension

Durable semantic contract:

`content/xizong/EXTENSION_ASSET_CONTRACT.md`

Representation policy:

`static-web/XIZONG_REPRESENTATION_GATE.md`

Visual / Extension is a **continuous selective program**, not a coverage program.

Formal asset families:

- `SOURCE_VISUAL`;
- `STRUCTURED_TABLE`;
- `SUMMARY_VISUAL`.

Core rule:

```text
stable accepted medical owner
→ Visual Gate
→ if high value: formal Extension slot
→ Representation Gate decides if/how it appears now
```

Never:

```text
Projection has MAP / TREE / NETWORK
→ therefore draw a diagram
```

And never:

```text
Lecture has a figure
→ therefore screenshot it into KianOS
```

## Current system direction

### A1 / A2 / A3

Already have sparse reviewed Visual / Extension assets.

Default work is only:

- concrete repair;
- clearly superior slot replacement;
- new high-value asset earned by real learning friction.

No bulk coverage program.

### B / C

Add assets only where:

- the Current medical owner is stable;
- Visual cognition materially lowers reconstruction cost;
- provenance and stable owner / slot can be established.

No System-wide screenshot quota.

### D

D is expected to be Visual-heavy, especially:

- neuroanatomy;
- tract / root / named nerve localization;
- visual pathway / field defects;
- spinal tracts;
- imaging;
- orthopedic force / displacement / fracture morphology.

But D formal assets must follow accepted D content / Learning truth. Before acceptance, Visual work may preserve explicit candidate/source debt; it must not silently promote candidate material to Current formal Extension truth.

### E / F

Same rule: stable owner first, formal Visual second.

## Visual restart rule

A fresh Visual Chat reads:

```text
content/xizong/CURRENT.md
→ this file
→ EXTENSION_ASSET_CONTRACT.md
→ XIZONG_REPRESENTATION_GATE.md
→ target System CURRENT / ACCEPTANCE
→ existing Extension / Source Visual registries
→ exact Source / owner
```

Then select the next **highest-value** small batch. There is no percentage-complete target.

---

# 5｜Precision / Guide / Projection routing

These should not become separate drifting programs.

## Precision

Precision belongs to exact-memory semantics already owned by the medical content.

When content review identifies values / thresholds / drugs / timing / classification / other exact material:

```text
medical owner establishes truth
→ learner object exposes Precision
→ Memory makes it available after the accepted learning stage
```

Do not create Precision merely to populate the right rail.

## Guide / Framework

Guide / Framework follows accepted System / Block Learning and Projection semantics.

Do not write a second Lecture or create Guide content before the underlying owner is stable.

## Projection

Projection begins only when accepted semantics are sufficient.

Projection describes cognition; Representation decides presentation. Do not rewrite medical truth to make rendering convenient.

---

# 6｜Concurrency rules

The durable default parallelism is:

```text
Medical lane:
D Fresh L / D realization
+ E S/K groundwork

Question lane:
Crosswalk C2 batches
+ bounded System question-scope tasks where needed

Visual lane:
small high-value reviewed batches
```

Safe parallelism requires independent write sets and no unresolved semantic dependency.

Examples:

- D Fresh L Audit and E Source audit may run concurrently;
- Crosswalk A/B/C review batches may run while D is audited;
- A1/A2/A3 additive Visual work may run while D content is built;
- D formal Visual realization must wait for the relevant D owner to be stable enough;
- a Question mapping must wait for a stable exact Current owner if the intended target is still candidate-only.

When main advances during a batch, synchronize / rebuild the small batch. Never force an older long-lived branch over newer Current work.

---

# 7｜Definition of “continue”

For a fresh Chat, “continue the Xizong content mainline” means:

1. read latest `main@HEAD`;
2. read `content/xizong/CURRENT.md`;
3. read this file;
4. choose the highest-priority unblocked lane / stage;
5. read that lane's exact owner;
6. execute one bounded batch or stage;
7. merge accepted work;
8. update the exact owner / cursor;
9. update this file **only if the program-level stage or dependency changed**.

Do not treat old prompts as the continuation owner.

---

# 8｜Update policy for this file

Update `CONTENT_MAINLINE.md` only when one of these changes materially:

- D / E / F moves to a new S/K/L/P/R/E or realization stage;
- the priority order among D/E/F changes;
- a new System becomes the main construction target;
- a Question program stage changes;
- a new bounded System question-scope task becomes materially active / closes;
- Visual / Extension policy or System-level Visual readiness materially changes;
- a new durable content-production lane is admitted or retired.

Do **not** update it for:

- every Crosswalk batch;
- every individual image crop;
- every PR number;
- every CI rerun;
- every learner session;
- ordinary additive asset counts.

Those belong to their exact lane owners / Git history.

---

# 9｜Relation to website / engineering mainline

Website / Runtime engineering is a separate shared-product mainline under `static-web/` and `XIZONG_PRODUCT_STATUS.md`.

Content work should not wait for unrelated UI convergence.

Conversely, shared engineering availability does not promote unaccepted medical content.

Reopen shared engineering from a content lane only when:

- an accepted new System exposes a real shared-shell incompatibility; or
- a Current content asset cannot be consumed without violating an existing contract.

---

# 10｜Current snapshot

At this snapshot the intended program is:

```text
MAIN MEDICAL CONTENT
D Fresh Independent L Audit
→ D Content Realization / Optimization
→ D downstream P / high-value Visual / Runtime acceptance

PARALLEL MEDICAL GROUNDWORK
E Source + Knowledge
→ K acceptance
→ Learning construction

LATER
F bounded Source + Knowledge

QUESTIONS
B exact official-question scope where unaccepted
+ Crosswalk C2 continuous reviewed batches

VISUAL
continuous sparse high-value Extension batches
A1/A2/A3 = additive only
B/C = selective only
D = Visual-heavy after stable accepted owners
```

This snapshot coordinates work. It does not override any exact scoped Current / Acceptance owner.