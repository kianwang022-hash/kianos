# Xizong Product Brief — top-level logic & projection architecture freeze

Status: **PRODUCT / INTERACTION BASELINE ACCEPTED — PROJECTION CALIBRATION + FINAL MAC VISUAL HANDOFF STILL OPEN**  
Parent UI cursor: `static-web/CURRENT.md`  
Learning authority: `content/xizong/LEARNING_CONTRACT.md`  
Lane router: `content/xizong/CURRENT.md`  
Shared projection grammar: `static-web/PRESENTATION_CONTRACT.md`  
**UI review safety protocol: `static-web/XIZONG_UI_REVIEW_PROTOCOL.md`**  
Preference owner: `static-web/KIAN_UI_PREFERENCES.md`  
Style owner: `static-web/UI_STYLE_BRIEF.md`

This file records accepted learner-visible Xizong product and Projection architecture decisions before Codex implementation. It does **not** change medical Content, Learning Logic, Evidence semantics, learner progress, or the S/K/L/P/R/E/U status of any System.

For any mature Xizong surface discussion, `XIZONG_UI_REVIEW_PROTOCOL.md` is a mandatory companion read before local UI recommendation. Product decisions live here; the protocol owns the whole-flow-before-local-optimization review method.

The detailed surface owners in §6 now own accepted composition/interaction decisions. They must not be treated as still-undiscussed merely because an earlier version of this brief said so. Product acceptance, Projection validation, implementation acceptance and real Mac visual acceptance remain separate.

## Naming lock｜Guide ≠ Framework

Learner-facing terminology is now explicit:

```text
Guide / Beginner Guide
= skippable, beginner-readable explanatory text
= helps Kian understand why the System / Block is organized this way
= may accelerate first-pass comprehension
= must not become a second Lecture

System Framework
= recurring structured System-level cognitive model / canvas
= mechanism / variables / failure structure / judgment axes / Block route

Block Framework
= recurring structured Block-level cognitive map
= makes the upcoming Core / Lecture navigable
```

Hard naming rule:

> **Guide means explanation; Framework means structure.**

Do not call a System cognitive canvas, mechanism map, relation model or Block cognitive map a learner-facing `Guide`. The historical file path `XIZONG_SYSTEM_GUIDE_DESIGN.md` is retained only for compatibility; that file now owns the **System Framework** surface, not the Beginner Guide text asset.

---



# 0｜Optimization-first operating rule

Xizong UI productization starts from the **existing Current closed learning/Projection/Runtime loop**, not from raw Content as if no learner surface existed.

For a System such as A1 whose scoped Acceptance already records `S/K/L/P/R/E = PASS`, normal UI/product discussion must assume the accepted Projection and Runtime are the baseline unless fresh contradictory evidence identifies a concrete defect. Visual/product work does not by itself reopen L, P, R or E.

The default chain for UI work is therefore:

```text
Current Learning / Content authority
→ existing accepted Projection behavior
→ existing Runtime / Evidence / Repair / Return
→ Projection optimization audit
→ Mac-wide product recommendation
```

Not:

```text
Current Content
→ invent a new learner flow / page model from scratch
→ reconnect Runtime afterward
```

## Required four-way Projection audit before recommending changes

Every mature Xizong learner surface must first classify the existing implementation into:

### `KEEP`

The existing Projection/interaction already expresses the accepted cognition or Runtime well enough and must be preserved semantically.

Examples include accepted Logic Group Lecture continuity, neutral Recall fronts, answer gating, learner-state guards, evidence persistence and exact Return behavior.

### `OPTIMIZE`

The existing semantic object / learner behavior is correct, but its Mac-wide geometry, typography, density, hierarchy, simultaneous visibility, interaction cost or visual polish can improve.

`OPTIMIZE` must not silently change the learner contract.

### `RESTORE_FROM_CURRENT`

Current Content / Learning support already owns useful semantics, but the existing Projection drops them, over-compresses them, hides them behind unnecessary disclosure, or projects only a lossy label.

Restoration means exposing **already-authoritative Current semantics** through a better Projection. It is not permission to add new medical explanation.

### `DEMOTE`

The current learner surface exposes something real but it should not compete with the current cognitive action: e.g. engineering/provenance chrome, redundant counts, permanent shortcut instructions, or a legitimate later-stage capability shown before learner eligibility.

Demotion does not delete mature capability. It changes learner-facing timing / prominence while preserving valid Runtime ownership.

## Reopen / redesign threshold

A proposal may move beyond `KEEP / OPTIMIZE / RESTORE_FROM_CURRENT / DEMOTE` only when fresh evidence shows a real upstream defect.

Before proposing a learner-flow redesign, the discussion must be able to name:

```text
which Current semantic / accepted behavior is wrong
→ which owner is responsible
→ which earliest gate / stage must reopen
→ why simple Projection optimization is insufficient
```

Without that evidence, do not redesign the learning flow.

## Recommendation protocol

Before drawing a replacement UI or proposing a new surface model, Sol / Chat must first follow `XIZONG_UI_REVIEW_PROTOCOL.md`, then:

```text
1. read the Current Logic / Content owner needed for the surface;
2. read the existing Current Projection implementation;
3. read the relevant Runtime / Evidence / Repair / Return behavior;
4. enumerate the important existing learner-facing functions;
5. classify each material part as KEEP / OPTIMIZE / RESTORE_FROM_CURRENT / DEMOTE;
6. only then recommend Mac-wide geometry or asset changes.
```

A simplified ASCII mockup is allowed only **after** this audit and represents spatial organization, not permission to replace an accepted high-density asset with a thinner summary.

## Relationship to Projection asset compilation

The Cognitive Projection Asset Compilation stage is also **optimization-first**.

Its job is to materialize stable ViewModels for the already accepted cognition and product decisions, analogous to the Politics compilation lane. It may improve representation metadata and recover Current semantics currently lost by the renderer, but it must not reinterpret a closed learner loop as a blank-slate content-design task.

---

# 1｜Frozen product boundary

Xizong web is not a second textbook and not a document browser.

The approved first-pass model remains external-primary:

```text
System orientation
→ choose Block
→ Block orientation
→ current Logic Group orientation
→ iPad / MarginNote original Lecture: continuous study of the whole Logic Group
→ return once to KianOS
→ KP Recall for that Logic Group
→ Logic Group closure
→ next Logic Group
→ Block Recall
→ Block Complete
```

After the relevant System has actually been learned, later stages may expose:

```text
System Recall
→ official System question sweep
→ Wrong / meaningful Uncertain repair
→ short post-question System reconstruction
```

Runtime capability never authorizes a learner-facing stage before the learner has legitimately reached it.

Hard learner-facing boundaries:

- original Lecture in MarginNote remains the continuous first-learning owner;
- KianOS owns orientation, cognitive positioning, selective cues, retrieval, closure, verification, repair routing and later review;
- KP is a stable canonical knowledge identity, **not automatically the learner-facing first-learning order**;
- Logic Group is the local continuity / closure unit inside a Block;
- stable correct work must remain cheap;
- Wrong / meaningful Uncertain opens only the smallest useful repair;
- engineering readiness must never be rendered as learner progress.

---

# 2｜Content authority vs Projection asset upgrade

## 2.1 Content remains authoritative and unchanged by UI work

Medical / learning owners decide **what is true and what the learner contract means**.

UI / Projection work may not silently:

- rewrite medical claims;
- alter accepted terminology merely for cleaner copy;
- invent causal links, hierarchy, comparison, ownership, priority or learner order that Current does not support;
- infer Question→KP relations;
- convert historical / Legacy material back into Current authority;
- turn Projection into a hidden second Lecture.

## 2.2 Projection assets may be upgraded substantially

Projection is allowed to create a better learner-facing **representation layer** without semantic drift.

Allowed Projection work includes:

- regrouping Current fields into learner-facing semantic objects;
- defining stable Cognitive ViewModels;
- assigning Current structures to representation roles such as chain / map / matrix / compare / hierarchy / decision structure **when the Current semantics support that shape**;
- specifying first-view hierarchy, spatial placement, simultaneous visibility and stateful emphasis;
- preserving one Current semantic object across ORIENT / RECALL / REPAIR / CLOSE states with different visibility;
- compiling source locators, Logic Group ownership, KP coverage and existing learner-support fields into stable presentation assets;
- defining `projection_shape` / geometry metadata as presentation semantics, provided it does not create new domain semantics.

Accepted architecture:

```text
Current Medical / Learning Content
→ Xizong Cognitive Projection Assets
→ stable System / Block / Logic / KP ViewModels
→ reusable Mac-wide learner workspaces
→ existing Runtime / Evidence / Repair / Return
```

Forbidden architecture:

```text
Current
→ AI invents a cleaner summary / relation
→ UI presents that invention as canonical learning content
```

Projection upgrade therefore means **presentation/representation engineering**, not medical-content rewriting.

Root `PROJECT_DEFINITION.md` R10 and `ARCHITECTURE.md` §7.1 own content evolvability. This brief inherits them: ordinary content refinement should normally be absorbed by assets/Projection, not named-topic page branches. A new view label alone does not implement a new learning behavior or authorize an Evidence change.

---

# 3｜Politics pattern reused only at the architecture level

Xizong should reuse the successful Politics productization pattern:

```text
Current Content
→ semantic projection
→ stable Cognitive ViewModel
→ reusable cognitive primitives
→ shared Mac-wide workspace shell
→ existing Runtime / Evidence / Repair / Return
```

But Xizong must not inherit Politics cognitive shapes.

Xizong owns its own likely representation families, including where Current supports them:

- mechanism / causal chain;
- System mother model;
- variable / coordinate model;
- failure propagation;
- comparison / discrimination;
- hierarchy / classification;
- decision structure;
- Visual Gate;
- exact / precision object;
- Logic Group map;
- Block/System reconstruction.

The shell may be shared; cognition-specific geometry must remain local to the actual System / Block / Logic object.

---

# 4｜Primary environment: Mac wide landscape

Mac wide landscape is the design origin for Xizong learner surfaces.

iPad remains the companion device for continuous original-Lecture reading in MarginNote. Narrow layouts remain required as responsive fallback but do not define the primary information architecture.

Hard spatial principle:

> **Use width to keep simultaneously useful cognitive relations visible; use state changes for real learning-sequence transitions.**

Mac-wide Xizong should prefer:

- horizontal parallelism where relations are simultaneous;
- side-by-side comparison where discrimination matters;
- persistent local context when it materially helps the current cognitive task;
- comfortable readable text and dense useful information;
- local scrolling / long surfaces when semantic density genuinely requires it;
- typography, alignment, spatial grouping and relation drawing before card piles.

Do not pursue `one viewport` as a goal when it would thin a genuine high-density Framework or a useful explanatory Guide.

Accepted density rule:

> **Presentation compression ≠ semantic compression.**

A Guide may be long and information-dense. UI should reduce disorder and interaction tax, not delete useful first-round content for visual cleanliness.

---

# 5｜Shared Xizong workspace grammar

The common Mac-wide workspace may use these spatial roles:

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│ Location / current cognitive state / meaningful Resume                       │
├──────────────────────┬───────────────────────────────────────┬────────────────┤
│ Object Map / Nav     │ Primary Cognitive Stage               │ Context        │
│ conditional          │ dominant learner object / action      │ conditional    │
├──────────────────────┴───────────────────────────────────────┴────────────────┤
│ local next action / external handoff / return when needed                    │
└───────────────────────────────────────────────────────────────────────────────┘
```

These are **roles, not mandatory fixed columns**.

Hard rule:

> **Shell can stay stable; cognitive geometry must vary with Current semantics.**

Do not force every System, Block or Logic Group into one diagram or generic card template.

Examples of legitimate variation to test later:

- normal mechanical circulation may emphasize a mechanism chain / variable model;
- valve disease may require comparison geometry;
- arrhythmia may require discrimination / decision geometry;
- heart failure may require failure / compensation propagation;
- another Block may need an entirely different Current-supported geometry.

These examples are **pressure-test categories**, not frozen medical Projection content.

---

# 6｜Accepted learner-facing surface family and detail owners

The responsibilities below remain shared product boundaries. Exact accepted surface decisions live once in these owners; follow their open/accepted distinctions rather than reproducing their rules here.

| Surface | Detailed product owner |
| --- | --- |
| Xizong Home | `static-web/XIZONG_HOME_DESIGN.md` |
| System Framework / Cognitive Canvas | `static-web/XIZONG_SYSTEM_GUIDE_DESIGN.md` |
| Block / Logic Group / handoff / KP Recall / Block Recall / After Learn | `static-web/XIZONG_BLOCK_WORKSPACE_DESIGN.md` |
| System Recall / question interaction / hidden results / review | `static-web/XIZONG_SYSTEM_COMPLETION_DESIGN.md` |

These do not have to be separate URLs; several may be states of one workspace. Accepted responsibility/composition is not final styling or screenshot acceptance.

## A｜Xizong Home

Responsibilities:

```text
meaningful Continue
→ free System entry
→ real Wrong / Uncertain handoff only when useful
```

Do not foreground engineering counts, repository readiness, fake progress or permanent method explanation.

The accepted Mac Home composition and conditional attention region are owned by `XIZONG_HOME_DESIGN.md`.

## B｜System Framework / Orientation

Responsibilities:

```text
understand the Current System-level model
→ preserve Current System coordinates / relations / boundaries
→ understand the available Block route
→ choose a Block
```

System Framework is the recurring structured orientation surface, not a chapter catalogue and not a prose course. It may be high-density and extend beyond one viewport. The separate Beginner Guide remains a skippable explanatory text entrance used only when it materially accelerates first-pass understanding.

System Recall / System Exit stays later-stage and must not compete with first-pass orientation before learner eligibility.

The accepted Block Route / System Canvas / conditional Context direction is owned by `XIZONG_SYSTEM_GUIDE_DESIGN.md`.

## C｜Block Workspace

Responsibilities:

```text
Block orientation
+ current Logic Group positioning
+ existing Logic Projection continuity
+ MarginNote handoff / return
```

Block Workspace must preserve the already accepted Logic Projection behavior:

```text
Logic Group orientation
→ continuous original-Lecture contact for the whole Logic Group
→ one return
→ this Logic Group's KP Recall
→ group closure
```

Do not regress to KP-by-KP app switching. Accepted geometry and cue timing are owned by `XIZONG_BLOCK_WORKSPACE_DESIGN.md`, not pending rediscovery.

## D｜KP Recall Workspace

Responsibilities:

- neutral Recall front;
- protect answer-type title / canonical answer until legitimate Reveal;
- retain the accepted `Space / 1–4 / Enter / ← / →` Recall interaction grammar as governed by shared Presentation + domain Evidence semantics;
- show canonical Current Core after Reveal without learner-facing semantic rewriting;
- preserve the owning Logic Group context;
- collect Recall evidence without turning scoring UI into the medical model.

The accepted Front / Reveal and whole-workspace answer-protection decisions are in `XIZONG_BLOCK_WORKSPACE_DESIGN.md` §9. Xizong's post-Reveal rating gate is not removed by a more permissive shared shortcut example.

## E｜Block Recall

Responsibility:

> reconstruct / run the Block model after the owned Logic Groups close, rather than rereading all KP.

Accepted Front / Reconstruction and completion separation are in `XIZONG_BLOCK_WORKSPACE_DESIGN.md` §11. Final styling remains open; the learner behavior is not an undiscussed blank slate.

## F｜System Completion / later System stage

Only when learner state legitimately permits:

```text
System Recall
→ official question sweep
→ smallest W/U repair
→ post-question System reconstruction
```

Accepted high-throughput question interaction, independent result visibility, learner marking, bounded Quick Review and System Recall composition are owned by `XIZONG_SYSTEM_COMPLETION_DESIGN.md`.

These product decisions do not prove that the new question behavior is already implemented. Compatibility with current Evidence/Runtime must be resolved before adopting it.

## G｜After-Learn

Includes existing responsibilities such as:

- Memory for formally learned but unstable objects;
- Reserve / deferred relations where Current owns them;
- bounded Chat repair / review handoff;
- evidence-preserving return.

Accepted timing and distinct Memory / Reserve / Chat Repair responsibilities are in `XIZONG_BLOCK_WORKSPACE_DESIGN.md` §12. Do not redesign these from scratch merely for visual consistency.

## H｜Xizong-wide practice / whole-paper product direction

Whole-paper practice belongs to Xizong-wide Practice, not to one System's completion page. System practice and whole-paper practice should reuse the question workbench where their native task semantics permit it.

The accepted entry model separates three decisions:

```text
question scope: by System / whole paper
answer speed: normal / fast
result visibility: hidden / immediate
```

Speed/result interaction and protection are owned by `XIZONG_SYSTEM_COMPLETION_DESIGN.md` §§3–9. Whole-paper runs default to hidden results. A paper ending does not itself authorize a score/answer reveal: the learner chooses whether to inspect results. Whole-paper navigation/order must come from Current Question Truth, not System route order.

Paper completion/review stays in the same task context rather than forcing a separate dashboard. Final entry/completion styling and score-calculation/Evidence compatibility remain open. Do not infer question count, option count or earned points from illustrative Chat mockup numbers.

---

# 7｜Protected existing Logic Projection contract

Current A1 Projection acceptance already protects these behaviors and future UI work must preserve them unless the upstream Learning contract is explicitly reopened:

```text
P1  Logic Group continuous Lecture contact; no KP-by-KP app switching
P2  neutral Recall front; formal answer stays gated until Reveal
P3  later stages fail closed against learner-state prerequisites
P4  System Recall / Exit are later-stage; first-pass System is orientation-first
P5  governance/provenance metadata stays out of learner chrome
P6  Projection does not invent Question→KP binding
```

The UI productization is therefore a **Projection optimization**, not a new learner-flow invention.

---

# 8｜Interaction principle: click to change cognition, not to recover hidden structure

Accepted Xizong interaction rule:

> **把点击用在切换认知对象，不要用在获得本来就该看到的信息。**

On Mac wide:

- important first-round Guide structure should normally be visible by default;
- switching System / Block / Logic Group / KP is a legitimate cognitive-object change;
- moving from orientation to external Lecture, Recall, Repair or Closure is a legitimate state change;
- repeated accordions / details / modals whose only purpose is hiding useful orientation information should be removed or demoted;
- progressive disclosure remains appropriate for true reference/deep/later material and for protected answers.

---

# 9｜Projection compilation — independently owned, validation-gated

Kian has assigned bulk expression-layer work to a separate **Xizong Cognitive Projection Asset Compilation Lane**. Product/UI discussion should not duplicate that lane's per-Block writes.

Canonical compilation owners:

- binding/schema/responsibility rules → `content/xizong/projection/PROJECTION_CONTRACT.md`;
- coverage/accounting → `content/xizong/projection/manifest.json`;
- calibration evidence and remaining validation dependency → `content/xizong/projection/CALIBRATION_BATCH_01.md`, or the successor explicitly named by the compilation owner.

Read their latest Current state. Do not infer an active worker, a completed validator, a frozen schema or a finished batch merely from the existence of this assignment.

The accepted calibration assets are not by themselves production-schema or full-compilation acceptance. Bulk production remains conditional on exact binding/freshness/visibility validation and the applicable schema-freeze evidence.

Expected compilation responsibilities remain:

```text
read Current System / learning-support / Block Core / existing Projection contract
→ identify Current-supported cognitive structure
→ produce stable learner-facing ViewModel
→ preserve provenance / identity
→ no medical semantic mutation
```

System / Block / Logic Group / KP-Recall responsibilities may be represented without requiring one file per KP. Exact field names, selectors, schema revisions and compiler rules belong to the Projection contract, not a second schema maintained in this brief.

The compiler may encode semantic role, geometry intent and state visibility. Shared font/palette/spacing tokens remain with `UI_STYLE_BRIEF.md`; the compiler must not turn each Block into a hard-coded pixel page.

---

# 10｜Program sequence and parallel boundaries

The construction dependencies remain:

```text
accepted learning/product responsibilities
→ representative cognitive-shape calibration
→ validated/frozen Projection contract
→ eligible Current asset compilation
→ bounded implementation consuming those assets
→ real browser / Mac screenshot review
→ semantic/evidence regression checks
→ scoped product/user acceptance
```

Product/UI finalization and compilation may now progress in parallel where they do not depend on each other's unresolved decisions:

```text
Product / UI lane
  accepted surface reconciliation
  → shared visual choices + dense/long-content layout decisions
  → precise implementation brief + screenshot acceptance criteria

Projection lane
  calibration validation / mutation tests
  → production contract freeze
  → eligible System/Block compilation + handoff
```

Boundaries:

- Product/UI does not edit per-Block Projection assets to compete with the compilation lane.
- Compilation does not invent learner flows, replace medical content or decide final visual tokens.
- Neither lane claims that the other has executed merely because a handoff was written.
- A real cross-lane contract defect is reported to its exact owner; unrelated scope work need not stop.
- Independent English / Politics / Lexical / Xizong construction is not rescheduled by this brief.

Before the corresponding implementation begins, reconcile:

1. the exact accepted surface and shared visual choices;
2. its required validated Projection inputs;
3. Current Runtime / Evidence / Repair / Return compatibility;
4. the bounded write-set and real screenshot/test plan.

Question compatibility has an additional explicit dependency: append-preserved attempt history, result exposure and learner-mark semantics must be reviewed under the responsible Runtime/Evidence owners before the new multi-pass / hidden-result question product is implemented. This is not a blocker for unrelated Guide asset compilation or independent visual specification.

Codex still owns production Astro/CSS/JS, browser iteration and the bounded implementation PR. Product/UI discussion does not silently start production implementation.

---

# 11｜Current-first design read path

For ordinary Xizong UI discussion, read only the exact relevant owners:

```text
XIZONG_UI_REVIEW_PROTOCOL
+ KIAN_UI_PREFERENCES / UI_STYLE_BRIEF
→ the applicable detailed surface owner in §6
→ Current Learning / System / Block / support owners needed for that surface
→ existing Projection / Runtime / Evidence / Repair / Return behavior
→ recommendation
```

For mature/accepted behavior, **do not stop after upstream Content or a design document** when making implementation or runtime-quality claims. Inspect the actual behavior/implementation appropriate to the claim.

For compilation, continue through the exact owners in §9 rather than rediscovering its schema from this product brief.

Do not default to retired System Guides, Legacy repos, historical branches, old audit sidecars or old Chat narratives. Historical material may be used only for an explicitly bounded migration/recovery/reference task and never silently becomes semantic authority.

---

# 12｜Accepted vs still open

## Accepted product baseline

- external-primary first-pass learner chain and stable canonical identities;
- whole-flow-before-local-optimization and KEEP / OPTIMIZE / RESTORE_FROM_CURRENT / DEMOTE method;
- the detailed Home, System Guide and Block-family responsibilities/composition recorded in §6 owners;
- protected KP/Block/System Recall with complete Current content at the appropriate Reveal state;
- timing-sensitive Visual / Precision / Connection / Reserve, not generic permanent widgets;
- System-question normal/fast input, learner-controlled marking and independent hidden/immediate result policy;
- Xizong-wide rather than single-System ownership for whole-paper practice;
- Mac-wide design origin, useful density, readable text and low interaction cost;
- content evolvability inherited from root R10, without duplicate canonical cognition for each learning pass;
- independent Product/UI and Projection work, joined only at actual implementation dependencies.

## Still open — do not convert to PASS from this document

- final shared font stack / typography scale, palette, spacing, control/state tokens and dark-mode scope (`UI_STYLE_BRIEF.md` §12);
- exact Mac measurements, dense-content composition, responsive fallback and final aesthetics;
- remaining whole-paper entry/completion presentation and score/Evidence compatibility;
- exact production Projection schema/validation/coverage as owned by the compilation lane;
- multi-attempt question history and hidden-result/marking compatibility with Current Runtime/Evidence;
- actual renderer/runtime adoption and complete return/resume regression;
- real Mac screenshots, Kian visual acceptance and real learner use.

A conversation agreement, JSON file, structural receipt or green build must not be reported as completing these separate checks.

## Mac acceptance scenarios to resolve in the visual handoff

These scenarios operationalize existing preferences; they are not a report of executed browser tests or a new learning gate.

| Scenario | What must be demonstrated |
| --- | --- |
| Short and long Current content | The short object is intentional rather than padded with fake content; the long object retains useful semantics and readable type. |
| Chain + comparison + boundary in one Block | Simultaneous relations remain clear without a universal card stack or one-shape-per-Block shortcut. |
| Context absent / present | No permanent empty rail; opening help must not lose the original task, reading location or meaningful controls. |
| Guide vs Recall Front/Reveal | Rich orientation and protected retrieval can coexist; no title/map/context answer leak merely to fill space. |
| Fast questions, visible vs hidden results | No post-correctness certainty ritual; hidden results must not leak via icons, color, counts, filters or correctness-dependent progression. |
| Backtrack / Chat / source return / reload | Return targets and real private state are preserved; navigation itself must not manufacture a learning attempt. |
| Narrow Mac window / readable zoom | Reduce layout complexity before shrinking learner text or dropping content; exact fallback is reviewed visually. |

Use real Current objects and actual browser screenshots for the implementation review. These criteria do not replace Kian's aesthetic judgment or authorize changing domain learning/evidence semantics.
