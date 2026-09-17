# Xizong Content / Product Status

Status: **CURRENT HUMAN ROUTER · CONTENT + PRODUCT / ENGINEERING IN ONE VIEW · NON-AUTHORITATIVE SUMMARY**  
Domain router: `content/xizong/CURRENT.md`  
Acceptance truth: scoped System `CURRENT.md / ACCEPTANCE.md`  
Learning authority: `content/xizong/LEARNING_CONTRACT.md` + `content/xizong/knowledge/learner/study-policy.json`  
Presentation authority: `static-web/PRESENTATION_CONTRACT.md` + `static-web/XIZONG_REPRESENTATION_GATE.md`  
Projection authority: `content/xizong/projection/PROJECTION_CONTRACT.md`  
Shared Platform authority: root `AUTHORITY_INHERITANCE_CONTRACT.md` + `AUTHORITY_OWNERSHIP.json`  
Safety / review: `XIZONG_UI_REVIEW_PROTOCOL.md`

> This file is the single low-friction progress/status view for Xizong content assets and product engineering. It summarizes Current owners; it never creates Acceptance Truth, medical truth, learner state, question membership, Visual coverage or readiness.
>
> If this summary conflicts with a scoped `CURRENT.md`, `ACCEPTANCE.md`, canonical asset or contract, the scoped owner wins.

No percentage-complete score is used. Optional Visuals, Crosswalk relations and other sparse assets are intentionally not required to reach 100% coverage.

---

# 1｜Current product model

Xizong is **one learning product and one learner Runtime**. Visual, Precision, Extension, TTSX checkpoints, Recall, official questions, second pass, Memory and Repair are conditional capabilities inside the same system; they are not parallel apps or curricula.

First-pass learning remains:

```text
System Framework
→ Block Framework
→ continuous original Lecture in iPad / MarginNote
   + Mac KP Learn companion (Prompt + full Core + locators + useful support)
→ KP Recall
→ Logic Group closure
→ Block Recall
→ Block Complete
→ idempotent Memory release
→ after the System is actually learned: System Recall
→ official System question sweep
→ W/U smallest-sufficient Repair / exact Return
```

Hard distinctions:

```text
Logic Group            = retrieval / local-closure unit
Source-contact segment = continuous original-Lecture execution unit
TTSX                    = source-local checkpoint completed in Lecture / MarginNote
Official System qids    = KianOS Question Runtime after the System model exists
```

Do not collapse these because a UI component happens to be easier that way.

---

# 2｜Content / asset progress

Legend:

- **PASS / CLOSED** — scoped Acceptance explicitly accepts it.
- **CURRENT** — durable asset/implementation is on `main`; this alone does not create scoped PASS.
- **PARTIAL** — real reviewed assets exist; sparse/incremental coverage is intentional.
- **ELIGIBLE** — upstream gate permits the next stage; the next stage itself is not yet accepted.
- **BLOCKED** — a named unresolved boundary blocks the claim.
- **CANDIDATE** — work exists outside Current acceptance.
- **SUBSTRATE** — source/canonical-looking material exists but no Current acceptance is asserted here.

| System | Source / official-question scope | Knowledge | Learning | Content realization | Guide / Framework | Visual / Precision / Extension | Question→Knowledge | Next content action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **A1 Circulation** | **PASS**; exact System sweep **376 qids** | **PASS** · 12 Blocks / 312 KP | **PASS** | **CLOSED** | Current Beginner Guide + Framework | **PARTIAL by design** · reviewed Source Visual + cues/Precision | progressive reviewed subset | real learner U; only concrete additive repair/Visual/Crosswalk work |
| **A2 Respiratory** | **PASS**; exact System sweep **359 qids** | **PASS** · 12 Blocks / 236 KP | **PASS** | accepted Current scope | Current Beginner Guide + Framework | **PARTIAL by design** · reviewed Source Visual + Precision/cues | progressive reviewed subset | real learner U; additive high-value assets only |
| **A3 Urinary** | **PASS**; exact System sweep **243 qids** | **PASS** · 14 Blocks / 257 KP | **PASS** | accepted Current scope | Current Beginner Guide + Framework | **PARTIAL by design** · reviewed Source Visual + structured-table Extension | progressive reviewed subset | real learner U; additive Extension/Crosswalk only |
| **B Digestive / Metabolic / Endocrine / Tumor** | **BLOCKED**: exact Current official-question membership not accepted | **PASS** · 38 Blocks / 600 KP | **PASS** · 170 LG | accepted substrate; no broad rewrite implied | Current Beginner Guide + Framework | **PARTIAL / candidate-rich**; no System-wide Visual quota | progressive reviewed subset | close exact question scope; dedicated downstream acceptance; materialize only high-value Visual/Extension |
| **C Hematology / Immunity / Infection** | no accepted exact System question-scope claim | **PASS** · 27 Blocks / 423 KP | **PASS_AFTER_REPAIR** · 133 LG | downstream eligible from accepted K/L | no Guide required merely for symmetry | sparse absence is legal | progressive reviewed subset | dedicated downstream P; Visual only where cognition benefits |
| **D Neuro / Sensory / Motor / Orthopedics** | S1 first-learning boundary candidate PASS; S2 exact official membership unaccepted | candidate 27 Blocks / 356 KP | candidate 128 LG | **frozen behind fresh L acceptance** | not Current | future Visual-heavy scope; visual-source debt must remain explicit | no scoped accepted mapping | **Fresh Independent L Audit → if PASS, Content Realization / Optimization → P/R/E** |
| **E Reproductive / Breast** | **SUBSTRATE** | **SUBSTRATE** (`E1–E14` + `SR1–SR6`) | not accepted | not Current | not Current | not started / no coverage claim | no scoped claim | bounded **Source + Knowledge** construction / audit; L only after K is trustworthy |
| **F Remaining Clinical** | **SUBSTRATE** | canonical block substrate exists | not accepted | not Current | not Current | not started / no coverage claim | no scoped claim | later bounded S/K construction after higher-priority D/E |

Progressive availability is legal:

```text
accepted K/L
≠ compiled Projection
≠ product route ready
≠ official question scope accepted
≠ learner progress
```

Shared renderer availability must never promote a later System's scoped Acceptance.

---

# 3｜Visual / Precision / Extension

Visual is conditional support, not a completion program.

```text
Visual Truth
→ Visual Gate
→ optional reviewed Extension / Source Visual
→ Representation Gate
→ learner UI only when it lowers learning cost
```

Current rules:

- `Visual cue exists` ≠ web image required;
- `MAP / NETWORK / TREE` exists ≠ draw a graph;
- asset existence ≠ automatic surface entitlement;
- missing optional Visual/Extension ≠ learner debt;
- ordinary lists/mechanisms normally prefer structured text / simple chain / table / formula;
- spatial, anatomic, morphologic, waveform and image-recognition cognition can justify strong Visual priority;
- Precision is orthogonal to Visual and may be current or deferred by learning timing.

Materialized examples:

| Scope | Current state |
| --- | --- |
| A1 | reviewed sparse/high-value Source Visual pack; physiology/pathology anchors |
| A2 | reviewed sparse Source Visual pack; pathology / curves / spatial anchors grow additively |
| A3 | generic Extension registry with reviewed `SOURCE_VISUAL` + `STRUCTURED_TABLE` |
| B | reviewed semantic candidates/specs exist; no symmetry-driven System-wide Visual registry required |
| C | no completeness claim; absence is legal |
| D | expected Visual-heavy domain; only accepted high-value assets should materialize after L/content truth is stable |

Formal ownership: `content/xizong/EXTENSION_ASSET_CONTRACT.md` and `XIZONG_VISUAL_PRECISION_CAPABILITY.md`.

---

# 4｜Official questions / Crosswalk

## Question Truth

`content/xizong/questions/` owns **3,750 immutable Current official-question IDs** with stem/options/official answer/provenance. Explanations, mappings and learner attempts are separate layers.

Accepted System first-pass scope currently visible:

```text
A1   376
A2   359
A3   243
B    BLOCKED — exact System membership not accepted
C    no accepted exact scope claim
D    S2 not accepted
E/F  no scoped claim
```

System membership does **not** imply Question→Block/KP mapping.

## Reviewed Question→Knowledge Crosswalk

`content/xizong/question-relations/` is an independent progressive content program.

Current snapshot baseline:

- **701 REVIEWED relations**;
- **70 shards**;
- inferred relations = **0**;
- missing mapping is legal and does not block practice;
- reverse Block/KP→Question lookup derives only from reviewed positive rows;
- normal batch throughput may remain small and quality-first.

```text
3,750 Question Truth
≠ 3,750 reviewed Question→KP mappings
```

Crosswalk may grow independently without another UI redesign.

---

# 5｜Shared product / engineering progress

| Capability | Current state | Boundary |
| --- | --- | --- |
| Shared Base Shell / global K rail | **CURRENT via #367 · external Xizong ownership** | Xizong consumes the registered Shared Platform owner from `main`; it does not fork rail/navigation behavior |
| Shared semantic adapter | **CURRENT** | A1/A2/A3/B/C; preserves heterogeneous LG and Source-contact semantics |
| Unified learner object | **CURRENT** | Prompt + Core + Source + Outline + Precision + Visual + Extension + Connection resolved once |
| Purpose-first Representation Gate | **CURRENT** | geometry/asset presence never mandates a graph/component; ambiguous layout falls back to safer representation |
| One-screen Block workspace | **CURRENT via #331** | `Logic Map | KP Learn/Recall | dynamic auxiliary`; behavior is accepted, presentation ownership still needs an explicit audit |
| System Workspace single-owner architecture | **CURRENT via #368** | `XizongSystemWorkspace` + isolated `xzSystem*` namespace + `xizong-system-workspace.css` |
| Home single-owner workbench | **CURRENT via #370** | isolated `xzHome*` namespace + `xizong-home-workspace.css`; explicit standalone Memory entry |
| Standalone Memory single-owner architecture | **CURRENT via #371** | exact existing Memory markup/Runtime + `xizong-memory-workspace.css`; 15px floor; auto-release/evidence unchanged |
| System Exit / official Question architecture | **CURRENT via #374** | `xzExitStage` + `xizong-system-exit-workspace.css`; Recall/Question/W-U/SECOND_PASS/Crosswalk/Repair Runtime preserved |
| Closed-surface legacy cleanup | **CURRENT via #376 / #377 / #379** | broad presentation debt, `.xizongLaterStage`, and hidden dense-calm Home/System/Exit owners physically removed; Block rules intentionally preserved |
| KP Learn companion | **CURRENT** | Mac Prompt + full Core + locators while original Lecture remains continuous on iPad/MarginNote |
| Dynamic auxiliary rail | **CURRENT** | rich reviewed Visual/table expands; light Precision/Connection shrinks; empty support returns space to Core |
| Recall-front protection | **CURRENT** | answer-bearing Core/Visual/Precision/Extension hidden before Reveal |
| Block Framework composition | **CURRENT** | multiple Projection objects compose one learner Framework; one object does not imply one card |
| Crosswalk normal placement | **CURRENT** | query-only / hidden in normal first-pass Block workspace |
| Block Complete → Memory | **CURRENT** | idempotent release of Core/current-owner Precision + private Prompt/Marked state |
| Shared official Question Runtime | **CURRENT capability** | usable only where honest System question scope / scoped Acceptance permits it |
| Repair / evidence guards | **CURRENT shared capability** | shared capability never auto-promotes B/C scoped R/E |
| Representative A1/A2/A3/B/C Block browser matrix | **CURRENT regression gate** | proves shared implementation compatibility, not later-System Acceptance |
| Real learner U | **UNTESTED unless Kian actually studies** | CI/browser fixtures never create learner truth |

Current engineering baselines:

```text
Shared Shell                         #367
Block one-screen integration         #331
System single-owner                  #368
Home single-owner                    #370
Memory single-owner                  #371
System Exit / Question single-owner  #374
Broad closed-surface cleanup         #376
Later-stage residue cleanup          #377
Dense-calm hidden-owner cleanup      #379
```

The UI migration is now in **remaining ownership-graph audit** under `XIZONG_UI_MIGRATION.md`. Home / System / Memory / System Exit are closed architecture surfaces unless a concrete Current defect or real learner-U finding reopens them. The audit must determine the next bounded Xizong presentation responsibility rather than assuming one from symmetry.

---

# 6｜Runtime / product invariants

Keep one Runtime family. Historical `V6` suffixes are implementation names, not permission to create parallel products.

Do **not** create:

- `V7` merely to solve integration;
- a separate Visual runtime;
- a separate TTSX runtime;
- a second Evidence store;
- a due-wall / overdue scheduler that overrides learner agency;
- a Xizong-specific copy of Shared Shell / global navigation.

TTSX remains source-local in MarginNote; KianOS owns reviewed release bookkeeping and lightweight completion, not duplicate answering.

Official questions remain one shared Question Runtime with preserved attempt history (`FIRST_PASS / SECOND_PASS / LATE_REVIEW`). Missing Crosswalk mapping is legal.

---

# 7｜Current parallel work and next sequence

## Website / product mainline

```text
DONE  shared semantic adapter / learner object
DONE  Block Framework + Representation Gate
DONE  one-screen Block Workspace behavior (#331)
DONE  Block Complete → standalone Memory release
DONE  A1/A2/A3/B/C representative Block browser matrix
DONE  accepted Shared Shell consumed from main (#367)
DONE  System Workspace single-owner cutover (#368)
DONE  Home single-owner cutover (#370)
DONE  Memory single-owner cutover (#371)
DONE  System Exit / official Question cutover (#374)
DONE  closed-surface CSS cleanup (#376 / #377 / #379)
ACTIVE remaining Xizong presentation ownership-graph audit
NEXT  one bounded implementation slice only if that audit proves a real competing owner
LATER real learner-U acceptance
```

## Content mainline

```text
D Fresh Independent L Audit
→ if PASS: D Content Realization / Optimization
→ D Projection / high-value Visual / Runtime acceptance

parallel:
E bounded Source + Knowledge groundwork

independent:
Crosswalk reviewed batches
+ unresolved System official-question scope (especially B, later D)

F remains later unless exam priority or a real dependency changes the order.
```

Visual work stays additive and high-value; it must not become a symmetry-driven backlog that blocks otherwise accepted learning.

---

# 8｜Update rule

Update this file only after a material change such as:

- scoped Acceptance changes;
- a System enters/leaves a construction stage;
- official System question scope changes;
- a material Visual/Extension program is admitted;
- a shared engineering capability lands on main;
- the website/product mainline moves to a new workspace;
- a presentation ownership migration materially closes or reopens a learner surface.

Do not update for every CI rerun, individual visual crop, Crosswalk batch or learner session.

> **Status summarizes Truth; Status never creates Truth.**
