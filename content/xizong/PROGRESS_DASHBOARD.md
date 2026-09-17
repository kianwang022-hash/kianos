# Xizong Progress Dashboard

Status: **DERIVED HUMAN DASHBOARD · NON-AUTHORITATIVE**  
Last reconciled against: `main@47b774e5f2b44eacd7dc24307e229b811cb84cc4`  
Purpose: give Kian / Chat one low-friction view of **content assets + engineering/product progress** without collapsing independent Truth owners into one score.

> This file is a dashboard, not an Acceptance owner, Artifact owner, Work Cursor or learner-state owner.
>
> If a cell conflicts with a scoped `CURRENT.md`, `ACCEPTANCE.md`, canonical asset, or Product/Presentation contract, the scoped owner wins. Do not use this dashboard to manufacture PASS, learner progress, question membership, Visual coverage, or readiness.

## 0｜How to read this dashboard

Legend:

- **PASS / CLOSED** — the named scoped Acceptance owner explicitly accepts it.
- **CURRENT** — the durable implementation/asset is on `main`; this does not by itself create a scoped S/K/L/P/R/E PASS.
- **PARTIAL** — real reviewed assets exist, but sparse/incremental coverage is intentional.
- **ELIGIBLE** — upstream gate permits the next stage; the next stage itself is not accepted.
- **BLOCKED** — a named unresolved boundary blocks that claim.
- **CANDIDATE** — work exists on a non-Current branch/PR and is not yet Current Acceptance Truth.
- **SUBSTRATE** — canonical-looking source files/directories exist, but no independent Current acceptance is asserted here.
- **UNTESTED** — no accepted evidence for that stage.

No percentage-complete score is used. Optional Visuals, Crosswalk relations and other sparse assets are not supposed to reach 100% coverage merely for symmetry.

---

# A｜Content / Asset progress

| System | Source / official-question scope | Knowledge | Learning | Content realization | Guide / Framework | Visual / Precision / Extension | Question→Knowledge relations | Next content action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **A1 Circulation** | **PASS**; exact System sweep scope **376** qids | **PASS** · 12 Blocks / 312 KP | **PASS** | **CLOSED** | Current Beginner Guide + Block pre-entry semantics | **PARTIAL by design**: reviewed Source Visual pack + cues/Precision; missing visuals legal | Progressive reviewed subset of shared Crosswalk corpus | Real learner U; otherwise only additive high-value Visual/Crosswalk/content repair from concrete evidence |
| **A2 Respiratory** | **PASS**; exact System sweep scope **359** qids | **PASS** · 12 Blocks / 236 KP | **PASS** | Accepted Functional-First scope; no broad rewrite due | Current Beginner Guide + Block pre-entry semantics | **PARTIAL by design**: reviewed Source Visual pack + Precision/cues; add only when learning value is clear | Progressive reviewed subset | Real learner U; additive reviewed Visual/Crosswalk only when useful |
| **A3 Urinary** | **PASS**; exact System sweep scope **243** qids | **PASS** · 14 Blocks / 257 KP | **PASS** | Accepted current scope | Current Beginner Guide + Block pre-entry semantics | **PARTIAL by design**: Current generic Extension registry with reviewed `SOURCE_VISUAL` + `STRUCTURED_TABLE` assets | Progressive reviewed subset | Real learner U; additive high-value Extension/Crosswalk only |
| **B Digestive / Metabolic / Endocrine / Tumor** | **BLOCKED**: exact Current official-question membership owner not accepted | **PASS** · 38 Blocks / 600 KP | **PASS** · 170 LG | Existing medical Core is accepted substrate for L; no new broad rewrite implied | Current Beginner Guide + Block pre-entry semantics | **PARTIAL / candidate-rich**: semantic audits/specs exist; no Current B system-owned Extension/Source-Visual registry found at this snapshot | Progressive reviewed subset; missing relation legal | Close exact B question scope independently; perform dedicated B P acceptance; materialize only reviewed high-value Visual/Extension assets |
| **C Hematology / Immunity / Infection** | No accepted exact System question-scope claim in C Acceptance | **PASS** · 27 Blocks / 423 KP | **PASS_AFTER_REPAIR** · 133 LG | Eligible downstream of accepted K/L; no symmetry rewrite required | No migrated Beginner Guide required merely for symmetry | Sparse absence is legal; no materialized C-specific Visual/Extension owner claimed here | Crosswalk unchanged by C L acceptance; progressive globally | Dedicated C P task using accepted non-contiguous LG + Block/canonical-source contact; add Visuals only where cognition benefits |
| **D Neuro / Sensory / Motor / Orthopedics** | **CANDIDATE**: S1 first-learning boundary PASS on PR #284; S2 exact official membership UNTESTED | **CANDIDATE**: 27 Blocks / 356 KP; K PASS claimed by #284 candidate, not promoted here to main Acceptance | **CANDIDATE**: 128 LG awaiting Fresh Independent L Audit | **FROZEN behind L** | Not Current; do not manufacture from older Guides | Visual-heavy future scope; #284 explicitly preserves O1–O5 visual-source debt | Not accepted as a D System mapping program | **Fresh Independent L Audit → if PASS, Content Realization / Optimization**; only then P/Visual/Runtime |
| **E Reproductive / Breast** | **SUBSTRATE only** | **SUBSTRATE**: `E1–E14` + `SR1–SR6` directories exist | Not accepted | Not started as Current construction claim | Not Current | Not started / no coverage claim | No scoped claim | Start bounded **Source + Knowledge** construction/audit; Learning only after K boundary is trustworthy |
| **F Remaining Clinical** | **SUBSTRATE only** | **SUBSTRATE**: canonical block directory exists | Not accepted | Not started as Current construction claim | Not Current | Not started / no coverage claim | No scoped claim | Later bounded Source + Knowledge construction after higher-priority D/E work |

### Source owners behind the A–C rows

- A1 Acceptance: `knowledge/systems/a1-circulation/ACCEPTANCE.md`
- A2 Acceptance: `knowledge/systems/a2-respiratory/ACCEPTANCE.md`
- A3 Acceptance: `knowledge/systems/a3-urinary/ACCEPTANCE.md`
- B Acceptance: `knowledge/systems/b-digestive-metabolic-endocrine-tumor/ACCEPTANCE.md`
- C Acceptance: `knowledge/systems/c-hematology-immunity-infection/ACCEPTANCE.md`
- D candidate: PR #284 / `work/xizong-d-content-20260916`

Do not promote B/C/D merely because the shared renderer can display their representative topology.

---

# B｜Visual / Precision / Extension program

The Visual program is **not a coverage-completion program**.

Current invariant:

```text
Visual Truth
→ Visual Gate
→ optional reviewed Extension / Source Visual
→ Representation Gate
→ learner UI only when it lowers learning cost
```

Therefore:

- `Visual cue exists` ≠ `web image required`;
- `Projection MAP/NETWORK/TREE exists` ≠ `draw a diagram`;
- `asset exists` ≠ `show it now`;
- missing optional Visual/Extension ≠ learner debt;
- spatial/anatomic/morphologic/waveform cognition can justify strong Visual priority;
- ordinary lists/mechanisms default to structured text / simple chain / table / formula when safer.

Current materialized examples:

| Scope | Current materialized state |
| --- | --- |
| A1 | `a1-circulation-source-visuals.json` — Current, sparse/high-value, partial-by-design; reviewed pathology + physiology assets including PV mechanics/electrophysiology |
| A2 | `a2-respiratory-source-visuals.json` — Current sparse reviewed Source Visual pack; pathology/curve/clinical-spatial anchors can grow additively |
| A3 | `a3-urinary-extensions.json` — Current generic Extension registry with Source Visual + native structured-table assets |
| B | Reviewed semantic audit/execution specs exist for selected batches; no Current B system-specific Extension registry found in this snapshot |
| C | No system-specific materialized Visual/Extension completeness claim; absence remains legal |
| D | Future Visual-heavy scope; O1–O5 source-visual debt explicitly preserved in candidate rather than hidden |

Representation owner: `static-web/XIZONG_REPRESENTATION_GATE.md`.

---

# C｜Official questions / Crosswalk progress

## Canonical Question Truth

`content/xizong/questions/` owns **3,750 immutable Current official-question IDs** with stems/options/official answers/provenance. Question explanations, mappings and learner attempts are separate layers.

Accepted System first-pass sweep scopes currently visible in Current owners:

```text
A1 Circulation   376
A2 Respiratory   359
A3 Urinary       243
B                BLOCKED — exact System membership not accepted
C                no accepted exact scope claim in current C Acceptance
D                S2 UNTESTED in candidate
E/F              no scoped claim
```

System membership does **not** imply Question→Block/KP mapping.

## Question → Knowledge Crosswalk

`content/xizong/question-relations/` is an independent progressive content program.

Snapshot at this dashboard baseline:

- **701 REVIEWED relations**;
- **70 shards**;
- inferred relations = **0**;
- missing mapping is legal and does not block practice;
- reverse Block/KP→Question lookup is derived only from reviewed positive rows;
- normal throughput target = **25–40 accepted relations per batch**, quality first;
- periodic full regression returns at 50-relation coverage boundaries.

This means the honest model is:

```text
3,750 Question Truth
≠ 3,750 reviewed Question→KP mappings
```

Crosswalk can keep growing independently without another UI redesign.

---

# D｜Shared engineering / product progress

| Capability | Current state | Scope / boundary |
| --- | --- | --- |
| Shared semantic adapter | **CURRENT** | A1/A2/A3/B/C; preserves heterogeneous LG membership and Source-contact semantics |
| Unified learner object | **CURRENT** | Prompt + Core + Source + Outline + Precision + Visual + Extension + Connection resolved once |
| Purpose-first Representation Gate | **CURRENT** | Safe fallback to structured text; geometry/asset presence never mandates a graph/component |
| One-screen Block workspace | **CURRENT on main via #331** | `Logic Map | KP Learn/Recall | dynamic auxiliary`; local scrolling; readable type floor |
| KP Learn companion | **CURRENT** | Mac Prompt + full Core + locators while original Lecture remains continuous on iPad/MarginNote |
| Dynamic Visual/Precision auxiliary region | **CURRENT** | rich reviewed Visual/table expands; light Precision/Connection shrinks; empty rail gives space back |
| Recall-front answer protection | **CURRENT** | Workspace-wide; answer-bearing Core/Visual/Precision/Extension hidden until Reveal |
| Block Framework composition | **CURRENT** | Multiple Projection objects compose one learner Framework; no object-count/card-count equivalence |
| Crosswalk visible placement | **CURRENT** | Hidden/query-only in normal first-pass Block workspace |
| Standalone Memory workspace | **CURRENT** | `Today | Core | Precision | Marked | Repair` via merged Memory phase |
| Block Complete → Memory release | **CURRENT** | Idempotent downstream release of Core/current-owner Precision + carried private Prompt/Marked state |
| Shared official Question Runtime | **CURRENT capability** | Usable only where honest System question scope / scoped acceptance permits it |
| Repair inbox / version guards | **CURRENT shared capability** | Do not promote B/C scoped R/E without their own Acceptance evidence |
| Representative A1/A2/A3/B/C browser workspace matrix | **CURRENT engineering regression gate** | Proves shared shell/topology compatibility; explicitly **not** B/C P/R/E Acceptance authority |
| Real learner U | **UNTESTED unless Kian actually studies the path** | CI/browser fixtures never create learner truth |

Current final Block integration baseline:

`main@47b774e5f2b44eacd7dc24307e229b811cb84cc4` via PR #331.

---

# E｜What can run in parallel now

```text
PRODUCT / REAL-USE AXIS
Current #331 workspace
→ real Kian study use
→ concrete friction / U evidence
→ reopen only the smallest responsible owner if needed

CONTENT AXIS 1
D Fresh Independent L Audit
→ PASS: D Content Realization / Optimization
→ then D Projection / high-value Visual / Runtime acceptance

CONTENT AXIS 2
E Source + Knowledge groundwork
→ independent K acceptance
→ only then Learning construction

INDEPENDENT QUESTION AXIS
Crosswalk C2 reviewed batches
+ System question-scope work where unresolved (especially B, later D)

ADDITIVE VISUAL AXIS
Only reviewed high-value Source Visual / structured-table / summary assets
→ never block otherwise accepted learning merely for coverage symmetry
```

F should remain later than D/E unless a real dependency or exam-priority reason changes the order.

---

# F｜Update rule

Refresh this dashboard only after a material change such as:

- scoped Acceptance status changes;
- a System enters/leaves a construction stage;
- official System question scope is accepted/blocked;
- a material Visual/Extension program is admitted;
- a shared engineering capability lands on `main`;
- a new Current System becomes independently routed.

Do **not** update it for every PR, CI rerun, individual visual crop, Crosswalk batch, or learner session.

When updating, read the scoped owners first and preserve this rule:

> **Dashboard summarizes Truth; Dashboard never creates Truth.**
