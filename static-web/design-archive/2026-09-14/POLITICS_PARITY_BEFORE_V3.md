# Politics Legacy Functional Parity → Current Architecture

Status: **MIGRATION CONTRACT READY · IMPLEMENTATION / PARITY ACCEPTANCE NOT YET CLAIMED**  
Scope: Politics learner-facing Legacy capability reconciliation and Current-native parity  
Program: #113  
Refined explanation dependency: #115  
Product authority: `static-web/POLITICS_PRODUCT_STATUS.md` + accepted detailed Politics design owners  
Learning / interaction authority: `content/politics/LEARNING_CONTRACT.md` + `content/politics/INTERACTION_CONTRACT.md`

This file exists because Kian explicitly requested:

> **把之前的政治功能完整复刻到我们的新架构。**

`完整复刻` here means **functional parity under the Current architecture**, not a byte-for-byte React/Python port and not restoration of Legacy semantics that Kian later rejected or Current contracts retired.

---

# 0｜Parity definition

The migration succeeds only when every materially useful Legacy learner capability has one explicit disposition:

```text
PARITY_REQUIRED_CURRENT
PARITY_REQUIRED_AFTER_ASSET_PROMOTION
CURRENT_NATIVE_EQUIVALENT
SUPERSEDED_BY_ACCEPTED_CURRENT
OUT_OF_SCOPE_NON_LEARNER_INFRA
BLOCKED_WITH_EXACT_REASON
```

Hard rule:

> **No useful learner-facing capability may disappear merely because the architecture was rebuilt. No superseded Legacy workflow may return merely because it once existed.**

Therefore:

```text
functional parity
≠ copy Legacy code
≠ copy Legacy scheduler/mastery model
≠ preserve every old dashboard widget

functional parity
= preserve the learner capability / information / control / evidence / return behavior
  in the newest accepted Product + Learning + Runtime architecture
```

When a Legacy capability and a later explicit Kian decision conflict, the later decision wins and the Legacy capability must be marked `SUPERSEDED_BY_ACCEPTED_CURRENT`, not silently migrated.

---

# 1｜Bounded historical authority

This task is explicitly authorized historical recovery/reconciliation.

Primary Legacy references:

- `kianos-legacy/runtime/frontend/src/learning/PoliticsWorkbench.jsx`
- `kianos-legacy/runtime/frontend/src/learning/PoliticsWorkbench.css`
- `kianos-legacy/runtime/frontend/src/learning/PoliticsCurrentRules.js`
- `kianos-legacy/runtime/backend/app/learning_politics/service.py`
- exact historical Politics assets only when a Current promotion task names them, including #115.

Legacy is evidence for **what functionality existed**. It is not Current political-semantic authority.

Current authority remains:

- `content/politics/CURRENT.md`
- `content/politics/LEARNING_CONTRACT.md`
- `content/politics/INTERACTION_CONTRACT.md`
- accepted Current Content / Projection / Question Truth
- `static-web/POLITICS_PRODUCT_STATUS.md`
- detailed accepted Politics Product / subject design owners
- current Runtime / Evidence / Repair / Return implementations.

Do not roam unrelated Legacy subsystems or reintroduce historical architecture by association.

---

# 2｜Current product constraints that control the migration

The Current Politics first-round loop is:

```text
Orientation / current Natural Unit
→ Chengfeng continuous study on iPad / MarginNote
→ lightweight optional close / checkpoint
→ Xiao1000 verification in KianOS web
→ stable correct → continue cheaply
   OR Wrong / meaningful Uncertain
   → smallest sufficient repair
   → owning Chengfeng source / Chat when useful
   → exact return
→ meaningful Resume / next action
```

The migration must preserve:

- Chengfeng as continuous original source surface;
- Suyi as absorbed background framework, not second learner course;
- Xiao1000 as verification, not first-learning scheduler;
- stable correct path extremely cheap;
- first attempt immutable;
- Wrong / meaningful Uncertain evidence without manufacturing review debt;
- exact source / question / Unit return;
- Current subject-specific Projection geometry;
- Mac-wide Dense Calm;
- no exposed backend scheduler internals as the normal learner experience.

Explicit Current conflict rule:

`content/politics/INTERACTION_CONTRACT.md` states that review should tell the learner what to do and why, **not expose scheduler internals such as D1/D3/D7 labels**, and Politics must not create a second scheduler.

---

# 3｜Legacy capability inventory and Current disposition

## 3.1 Politics overview / Home

| Legacy capability | Legacy evidence | Current disposition | Required Current behavior |
| --- | --- | --- | --- |
| Current learning / continue CTA | `PoliticsOverview`, current Unit + CTA | **PARITY_REQUIRED_CURRENT / CURRENT_NATIVE_EQUIVALENT** | Politics Home has one meaningful Continue using real private learner position; exact Unit/action when available. |
| Five-subject free entry | subject controls / unit browsing | **PARITY_REQUIRED_CURRENT** | Free entry to Marxism / History / Mao / Xi / Ethics-Law. |
| Today review summary | `politicsOverviewReview` | **CURRENT_NATIVE_EQUIVALENT, REFRAMED** | Show only genuine Wrong / Uncertain / active repair or phase-owned task when useful; no empty congratulation card. |
| Position / NU counts | `politicsPositionPanel` | **SUPERSEDED AS PRIMARY UI** | Location remains; engineering-style counts must not dominate Home. |
| Subject/chapter question coverage | coverage panels | **PARITY_CAPABILITY_SECONDARY** | Practice coverage may remain available as secondary practice reference if grounded in actual attempts; it is never mastery/progress. |
| Target score panel | target score / objective split | **SUPERSEDED_BY_ACCEPTED_CURRENT** | Do not foreground static score KPI in Politics Home. Study target may live elsewhere if separately owned. |
| Long-term stage gates | `POLITICS_STAGE_GATES` | **SUPERSEDED AS HOME UI** | Phase ownership may remain in Learning/plan owners; do not recreate dashboard strip. |

### Home parity acceptance

A learner who previously used Politics for `where am I / continue / enter a subject / handle real problems` must still be able to do so with equal or lower friction. Removing dashboards is allowed only because the accepted Current Home explicitly demotes them.

---

## 3.2 Natural Unit learning / source handoff

| Legacy capability | Current disposition | Required Current behavior |
| --- | --- | --- |
| browse all subjects / chapters / Natural Units | **PARITY_REQUIRED_CURRENT** | Free NU navigation; no restrictive wizard. |
| chapter quick jump | **PARITY_REQUIRED_CURRENT** | Current subject/chapter/NU navigation remains directly reachable. |
| show current NU and its next learning action | **PARITY_REQUIRED_CURRENT** | Current Projection workspace foregrounds one NU and meaningful next action. |
| Chengfeng source handoff | **PARITY_REQUIRED_CURRENT / CURRENT_NATIVE_EQUIVALENT** | Exact/bounded locator + look-for; continuous source remains iPad/MarginNote. |
| `complete_natural_unit` explicit legacy state | **SUPERSEDED / RECONCILE TO CURRENT** | Do not restore a generic mandatory “讲义完成” button if Current product says optional close; preserve only evidence writes that the current contract still requires. |
| mandatory `讲义 → 短回忆 → 配套题` gate | **SUPERSEDED_BY_ACCEPTED_CURRENT** | Current Politics return/close is lightweight and may be mentally performed; do not restore a large mandatory Recall ceremony. |
| Natural Unit Recall assets | **PARITY_CAPABILITY_PHASE_OWNED** | Preserve Current-owned Recall/compression objects for review/repair/later phase; not automatic first-round gate. |
| Precision Recall assets | **PARITY_CAPABILITY_PHASE_OWNED** | Keep selective precision where Current owns it; not displayed merely because Legacy had a queue. |
| first-ready Xiao checkpoint | **PARITY_REQUIRED_CURRENT** | Only questions whose owning content is ready become first-round verification tasks; exact question identity retained. |
| cross-Unit locked / deferred question handling | **PARITY_REQUIRED_CURRENT** | Preserve reviewed ownership / deferral; UI must not silently release questions early. |

---

# 4｜Xiao1000 Workbench — protected full parity surface

The accepted Product explicitly preserves the historical Workbench interaction and submitted-result information architecture. This section has the strongest parity requirement.

## 4.1 Practice entry and scope

| Capability | Disposition | Requirement |
| --- | --- | --- |
| Continue current session / Resume | **PARITY_REQUIRED_CURRENT** | Resume exact active question/session where meaningful; no “most recently opened” regression. |
| subject filter | **PARITY_REQUIRED_CURRENT** | all / five subject scopes where valid. |
| chapter filter | **PARITY_REQUIRED_CURRENT** | scoped training without page-by-page hard coding. |
| optional knowledge-point filter | **PARITY_REQUIRED_CURRENT WHEN CURRENT MAPPING SUPPORTS IT** | pending mapping must not be shown as exact. |
| optional Natural Unit scope | **PARITY_REQUIRED_CURRENT** | use Current reviewed unit/question relations only. |
| question type filter | **PARITY_REQUIRED_CURRENT** | single / multiple / all as Current Question Truth supports. |
| target count 5/10/20/40 or equivalent | **PARITY_REQUIRED_CURRENT CAPABILITY** | learner can choose bounded session length; exact UI may modernize. |
| normal scoped practice | **PARITY_REQUIRED_CURRENT** | clean scoped session. |
| random practice | **PARITY_REQUIRED_CURRENT SECONDARY MODE** | retain as optional free-practice capability if it does not violate protected material/phase rules. |
| wrong-question revisit | **PARITY_REQUIRED_CURRENT, CURRENT-SEMANTIC** | available through real retained Wrong evidence; do not recreate artificial due debt. |
| favorite practice | **PARITY_REQUIRED_CURRENT** | favorite remains an explicit learner-owned signal. |
| `due` mode | **SUPERSEDED_BY_ACCEPTED_CURRENT** | do not restore old scheduler/due semantics. Current review/Attention decides what actually deserves return. |

## 4.2 Clean attempt — full parity

Must preserve:

- verified structured question text;
- full-width question stem;
- Mac 2×2 options when option length permits;
- original question-face/image check as optional source verification;
- single-choice and multiple-choice behavior;
- `Uncertain`;
- Favorite;
- mark-for-discussion;
- Normal / Fast interaction mode;
- answer gating / no correctness leak before submit;
- elapsed time;
- answer-change trajectory;
- session identity / current question progression;
- keyboard path and pointer path producing the same result;
- typed fields suspending global shortcuts;
- failure to persist evidence must not masquerade as success.

### Fast semantics

Legacy Fast single-choice submitted immediately and auto-advanced after a stable correct result. Preserve the accepted low-friction intent, subject to Current Evidence/persistence guarantees.

Multiple choice remains toggle + explicit submit; Fast must not guess when selection is complete.

## 4.3 Submitted result — exact historical IA parity

```text
left summary / evidence
→ correct / wrong
→ 一句话带走
→ learner answer vs formal answer
→ missing / extra option delta when relevant
→ optional learner error-cause mark
→ learner personal note

right knowledge review
→ 理解这道题
→ Current / Chengfeng source blocks
→ 肖1000原解析 or admitted bounded supplemental reference
→ Next / exact Return
```

Required data identities:

```text
takeaway          = learner-facing 一句话带走 / 一句话解析
chat_explanation  = AI-refined 理解这道题
xiao_reference    = separate Xiao1000 original / admitted supplemental reference
```

`takeaway` / `chat_explanation` are NOT OCR/PDF source explanation. Their Current promotion is owned by #115.

Disposition:

- while #115 unresolved → **PARITY_REQUIRED_AFTER_ASSET_PROMOTION**;
- never substitute OCR `explanation`;
- never regenerate 1148 records and call them recovered historical assets;
- missing/blocked exact question ID fails closed and is reported as parity incomplete.

## 4.4 Result-side learner controls

| Legacy control | Disposition |
| --- | --- |
| missing/extra answer delta | **PARITY_REQUIRED_CURRENT** |
| optional error cause: memory / understanding / options / careless | **PARITY_REQUIRED_CURRENT, OPTIONAL** |
| personal note | **PARITY_REQUIRED_CURRENT** |
| autosave + visible save status | **PARITY_REQUIRED_CURRENT** |
| page-exit persistence attempt / do-not-silently-drop | **PARITY_REQUIRED_CURRENT** |
| Next | **PARITY_REQUIRED_CURRENT** |
| exact Return to current Unit / originating practice entry | **PARITY_REQUIRED_CURRENT / CURRENT_NATIVE_EQUIVALENT** |
| source blocks + source-gap labels | **PARITY_REQUIRED_CURRENT WHERE ADMITTED** |
| original Xiao reference expansion | **PARITY_REQUIRED_CURRENT** |

Do not insert a new mandatory `结构 / 易混 / diagnosis` stage around the historical information architecture.

---

# 5｜Session lifecycle and evidence parity

Legacy Workbench supported:

- start scoped session;
- resume active session;
- exact current-question progression;
- completion count/target;
- session result summary;
- correct count / accuracy / elapsed time;
- return to origin after a Unit checkpoint;
- exact planned entry into question/NU/recall/review task;
- first-attempt outcome;
- `certainty` / discussion mark / learner cause / note;
- answer changes / elapsed seconds.

Current-native parity requirements:

1. preserve first attempt as immutable evidence;
2. preserve enough event identity to recover exact question/session/Unit;
3. persist before auto-advance when the Current evidence contract requires persistence;
4. session completion never overwrites the original question attempt;
5. optional post-session summary may preserve count/time/accuracy as **practice result**, never mastery;
6. planned/deep link into a valid exact question or Unit remains possible;
7. unknown/stale target fails closed; do not silently substitute another question;
8. History/back/refresh/private local state must not create duplicate first attempts accidentally.

Current `PoliticsUnitReturnEnhancer` already provides mature pieces such as preserved first-attempt snapshots, persistence-failure protection, precise source repair and exact question return. These are `CURRENT_NATIVE_EQUIVALENT` and should be integrated rather than replaced with older Legacy state code.

---

# 6｜Favorite / Uncertain / discussion / note semantics

These learner-owned controls are distinct and must stay distinct.

```text
Favorite
= learner wants to keep / find this question again

Uncertain
= learner's uncertainty about the attempt

Mark for discussion
= learner explicitly wants later Chat/discussion attention

Optional error cause
= learner's self-attribution after a problem

Personal note
= free learner annotation attached to that attempt/question context
```

Do not collapse all of them into one generic `Marked`, and do not infer mastery from any one of them.

Stable correct may be Favorite/Marked-for-discussion without becoming Wrong. Wrong may be immediately understood without becoming mandatory future debt.

---

# 7｜Original question image / source-verification parity

Legacy exposed verified structured text as the normal question face and allowed optional original-image checking.

Parity requirement:

- Current verified structured question face remains normal;
- source image / question face remains reachable when the current asset exists;
- image checking is optional, not a mandatory page change;
- answer/explanation must remain gated until legitimate submission/reveal;
- source image does not become a competing question database.

---

# 8｜Practice coverage / analytics parity without dashboard regression

Legacy surfaced:

- unique answered count;
- first-attempt accuracy;
- total accuracy;
- chapter/subject question coverage;
- active wrong count;
- weak knowledge points/recommendation when evidence existed;
- session report and error-type counts.

Disposition:

### Preserve capability, demote presentation

These may remain available as **secondary practice analytics** only when they are grounded in actual learner attempts and clearly labelled as practice coverage/result, not knowledge mastery.

Acceptable destinations include:

- optional session result;
- secondary practice/reference panel;
- meaningful Attention/Chat handoff when repeated evidence genuinely supports it.

Do not restore them as the dominant Politics Home dashboard.

### Weak-area inference

A weak area may surface only when evidence is sufficient and the relation to the Current owner is reviewed. Otherwise remain silent. The Legacy behavior itself already guarded against premature weak-point labels; preserve that caution.

---

# 9｜Legacy Review lane — capability mapping, not scheduler resurrection

Legacy contained:

```text
Today / D1 / D3 / D7 / D14 / D0
review cards
QUESTION_RETRY
FRESH_VALIDATION
MIXED_SESSION
KP_RECALL
PRECISION_RECALL
NATURAL_UNIT_RECALL
copy daily politics study pack
imported Chat review plan / execution flow
```

The cadence UI and a second scheduler conflict with Current and are **SUPERSEDED_BY_ACCEPTED_CURRENT**.

The useful learning capabilities map as follows:

| Legacy review function | Current-native parity |
| --- | --- |
| QUESTION_RETRY | retained Wrong/meaningful Uncertain question review when actually useful |
| FRESH_VALIDATION | phase/evidence-owned fresh validation only when a reusable claim needs checking |
| MIXED_SESSION | optional mixed/free practice; not an automatic due debt |
| KP_RECALL | only when Current Politics assets/phase activate it |
| PRECISION_RECALL | selective exact-formulation review when admitted |
| NATURAL_UNIT_RECALL | compression/reconstruction when phase/evidence justifies it |
| copy daily pack | compact Current Wrong/Uncertain + last-location handoff / equivalent export |
| Chat plan import | exact imported repair/return capability where Current owns it; no mandatory JSON ritual merely for display |

The learner must still be able to revisit useful material. The migration may remove scheduler labels and rituals, but not the underlying learner capability.

---

# 10｜Legacy first-round recall gate — explicit supersession

Legacy implemented:

```text
Lecture complete
→ one compact Natural Unit recall gate
→ Xiao1000
```

Later Kian/Product decisions simplified Politics first-round return/close. Current accepted behavior is a **lightweight optional mental close/checkpoint**, not a mandatory state-machine Recall page.

Therefore the old compulsory gate is:

**`SUPERSEDED_BY_ACCEPTED_CURRENT`**.

Important distinction:

- this does not delete Current Recall/precision assets;
- this does not delete later Review/compression;
- this does not permit Xiao1000 before the owning Chengfeng content is learned;
- it only removes an obsolete mandatory learner ceremony.

Do not use “full parity” to restore a workflow Kian explicitly optimized away.

---

# 11｜Current-native functions that are already better than Legacy and must survive

The migration must preserve and integrate these Current functions instead of replacing them with older implementations:

- compiled five-subject Cognitive Projection assets and subject-specific geometries;
- exact Current ref resolution / fail-closed Projection behavior;
- current private Continue / last-location path;
- compact Wrong/Uncertain handoff packet;
- first-attempt preservation in `PoliticsUnitReturn`;
- localStorage persistence failure stops false progression;
- reviewed Question→Natural Unit/node relation boundaries;
- precise source repair link;
- `修完回这一题` exact return;
- event-local repair provenance;
- no repair success rewriting first attempt;
- no stable correct creating ritual review debt.

Parity migration is additive toward the accepted Current product, not a rollback to Legacy architecture.

---

# 12｜Legacy capabilities intentionally NOT migrated as learner product

These are not parity defects:

1. D1/D3/D7/D14/D0 scheduler labels and due-driven learner workflow;
2. automatic review debt merely because time elapsed;
3. persistent overview dashboards dominated by readiness/coverage counts;
4. target-score / stage-gate blocks as normal Politics Home chrome;
5. old mandatory first-pass short Recall gate;
6. old backend/private API architecture itself;
7. old source paths / localhost / Study filesystem as runtime API;
8. Legacy mastery meaning, if any, that conflicts with Current Evidence semantics;
9. duplicated Chengfeng continuous reader;
10. any old generated asset that was explicitly excluded from Current until separately promoted.

If Kian later explicitly asks to restore one of these as a learner feature, treat it as a new product decision rather than smuggling it in under “parity”.

---

# 13｜Migration work packages

## M0 — inventory / evidence lock

- read latest main;
- hash / identify exact Legacy Workbench files used as reference;
- inventory all learner controls/actions/data dependencies;
- map each capability to the table above;
- report any newly discovered capability before implementation rather than silently dropping it.

## M1 — Current data / asset parity

- verify 1148 Question Truth / question-face / mapping identity;
- close #115 `takeaway + chat_explanation` migration or record blocked IDs;
- verify source/provenance blocks consumed by submitted result;
- no duplicate question database.

## M2 — Current-native Workbench runtime parity

Implement/reconcile:

- practice scope controls;
- session start/resume/progression;
- Normal/Fast;
- single/multiple safety;
- Favorite / Uncertain / discussion mark;
- elapsed time / answer changes;
- optional error cause;
- personal note + robust persistence;
- exact first-attempt evidence;
- exact origin Return;
- optional source image check;
- post-session result capability.

Reuse Current Evidence/UnitReturn where equivalent; do not resurrect Legacy state storage wholesale.

## M3 — submitted-result parity

After #115 Current promotion:

- historical left/right information architecture;
- takeaway;
- learner answer/formal answer + missing/extra delta;
- optional cause / note;
- AI refined explanation;
- Current source blocks;
- separate original Xiao reference;
- Next/exact Return.

## M4 — secondary practice/review capability reconciliation

- random / wrong / favorite / mixed scoped practice;
- secondary practice analytics;
- useful phase-owned recall/precision/validation;
- daily compact handoff;
- no due/scheduler resurrection.

## M5 — browser parity acceptance

Representative scenarios:

- single normal correct;
- single Fast correct + safe auto-next;
- single Wrong;
- correct + Uncertain;
- Favorite and discussion mark independently;
- multi-select missing/extra delta;
- personal note save success/failure + navigation;
- original-image check;
- exact NU checkpoint → Workbench → exact return;
- refreshed/back session recovery;
- blocked/missing refined explanation ID;
- session complete → origin return;
- free scoped practice by subject/chapter/point/NU/type/count;
- wrong/favorite secondary entry;
- no due/D1/D3/D7 UI regression;
- Mac-wide screenshots of clean attempt and submitted result.

---

# 14｜Parity ledger required in implementation PR

The implementation PR must include one ledger row for every capability in this contract:

```text
capability
→ legacy evidence path / symbol
→ disposition
→ Current owner / implementation
→ test / browser evidence
→ screenshot when learner-visible
→ status: implemented / current-equivalent / superseded / blocked
```

No row may be silently absent.

`SUPERSEDED` requires naming the accepted Current rule that replaced it. `BLOCKED` requires the exact dependency and why guessing would be unsafe.

---

# 15｜Acceptance / closure

Politics Legacy parity may claim complete only when:

1. every capability above has an explicit disposition;
2. all `PARITY_REQUIRED_CURRENT` capabilities are executable in the new architecture;
3. all admitted `PARITY_REQUIRED_AFTER_ASSET_PROMOTION` content is available or exact blocked IDs are named;
4. Current-native Evidence/Repair/Return invariants remain intact;
5. no Legacy scheduler/mastery/source fallback has leaked back in;
6. Question Truth and first-attempt truth are unchanged except through authorized Current owners;
7. real browser tests and Mac-wide screenshot review pass;
8. independent Chat/Pro review confirms no useful learner function was silently lost;
9. Kian reviews any genuine product-choice difference;
10. authorized merge → main readback → temporary branch retirement.

This closure is **functional parity**, not learner `U` or mastery.
