# Xizong Cross-System Projection Normalization

Status: **FROZEN DESIGN INPUT — NO CONTENT / LEARNING GATE REOPEN**  
Scope: learner-facing Xizong Projection productization across currently projectable Systems  
Parent product brief: `static-web/XIZONG_PRODUCT_BRIEF.md`  
Review protocol: `static-web/XIZONG_UI_REVIEW_PROTOCOL.md`  
Learning authority: `content/xizong/LEARNING_CONTRACT.md`

This file records the accepted normalization boundary discovered while comparing A1 Circulation, A2 Respiratory and A3 Urinary before Mac-wide UI productization.

It does **not** change medical Core, learning order, learner evidence, Runtime semantics or existing S/K/L/P/R/E/U claims.

---

# 1｜Observed Current asymmetry

The three mature Systems share the same accepted learner architecture but do not currently expose identical Projection-support files.

## A1 Circulation

Current owns:

- System `system.json`;
- `a1-circulation-learning.json` with Block `first_pass_focus / stop_line / recall_spine` and Logic Group `goal / closure`;
- canonical Block Core with Block orientation / Framework / KP prompts;
- shared System / Block / Recall / Memory / Repair / Return Runtime.

Current learner directory does **not** contain dedicated:

- `a1-circulation-learning-cues.json`;
- `a1-circulation-pathways.json`.

A1 also retains explicit Source-locator debt in its scoped Acceptance; Projection must not manufacture exact source locators that Current does not own.

## A2 Respiratory

A2 contains the same common System / learning-support / Block-Core baseline **plus** two explicit Projection-enrichment owners:

### `a2-respiratory-learning-cues.json`
Role:

`SELECTIVE_PRECISION_AND_VISUAL_TRIGGER_INDEX_ONLY`

It owns selective learner-facing timing/index metadata for:

- `precision_index`;
- `visual_bindings`;
- KP- or Logic-Group-level anchors;
- exact source-local visual locators / micro-tasks when explicitly Current-owned.

It explicitly does not replace medical Core or create a second owner.

### `a2-respiratory-pathways.json`
Role:

`MECHANISM_PROJECTION_AND_CROSS_BLOCK_REACTIVATION_ONLY`

It owns explicit Projection support for:

- `system_failure_views`;
- failure-to-System-spine focus;
- variables / optional parallel focus;
- reviewed cross-Block connection cues;
- Reserve-learning timing / later reactivation.

A2 therefore currently has a richer **Projection-enrichment layer** than A1/A3.

## A3 Urinary

Current owns:

- System `system.json`;
- `a3-urinary-learning.json` with complete Block focus / stop-line / recall-spine / Logic Group goal / closure;
- canonical Block Core with structured `study_refs`, frequent exact `讲义定位`, Frameworks and explicit first-round Lecture guidance;
- a learning-owner `visual_rule` requiring exact original/source-local routes where figures/tables matter;
- shared System / Block / Recall / Memory / Repair / Return Runtime.

Current learner directory does **not** contain dedicated:

- `a3-urinary-learning-cues.json`;
- `a3-urinary-pathways.json`.

Therefore A3 is not missing its learner loop; its Projection-support semantics are mainly retained in the Block Core / learning owner instead of being separately compiled into the A2 enrichment schemas.

---

# 2｜Interpretation

This asymmetry is **not by itself an L/P failure**.

A1, A2 and A3 already have scoped accepted Projection / Runtime / Evidence claims. The current difference is best treated as a **productization / Projection-enrichment normalization problem**, unless fresh contradictory evidence identifies a real upstream semantic defect.

Do not reinterpret:

```text
A2 has more Projection-support files
```

as:

```text
A1/A3 medical or learning content is therefore incomplete.
```

Also do not assume the opposite:

```text
A1/A3 P PASS
```

means every useful Current relation is already optimally structured for the future Mac product.

The correct productization question is:

> Which Current-supported presentation semantics should be compiled into a common learner-facing ViewModel, regardless of how each System currently stores them?

---

# 3｜Frozen normalization decision

**Normalize downstream at the Cognitive Projection / ViewModel layer, not upstream by forcing identical source-file schemas.**

Accepted architecture:

```text
System Current
+ System learning support
+ Block Core
+ optional Current enrichment owners (cues / pathways / etc.)
        ↓
Xizong Projection Compiler
        ↓
normalized learner-facing ViewModel capabilities
        ↓
shared Mac-wide System / Block / Logic / KP workspaces
        ↓
existing Runtime / Evidence / Repair / Return
```

Do **not** require every System to own matching physical files merely for symmetry.

Forbidden normalization:

```text
A2 has learning-cues/pathways
→ create empty or guessed A1/A3 copies
→ call schemas unified
```

That would create parallel/empty owners and could silently invent relations.

---

# 4｜Common Projection capability contract

The later Projection Compilation lane must normalize System-specific Current inputs into common capabilities such as the following. Exact implementation field names remain open until the final Xizong Projection schema freeze.

```text
SystemProjection
  orientation_objects[]
  mother_model
  system_coordinates[]
  failure_modes[]
  failure_views[]          optional, explicit Current only
  block_route[]

BlockProjection
  center_question
  orientation_objects[]   may contain multiple cognitive shapes
  first_pass_focus
  recall_spine
  stop_line
  logic_groups[]
  source_context

LogicGroupProjection
  goal
  closure
  kp_coverage[]
  source_locators[]
  visual_cues[]            optional
  precision_cues[]         optional
  incoming_connections[]   optional
  outgoing_connections[]   optional
  reserve_hooks[]          optional

KPProjection
  neutral_prompt
  canonical_core
  source_locator           optional / fail-closed
  precision_cues[]         optional
  visual_cues[]            optional
```

Important: **common capability does not mean every System must populate every capability.**

Empty / absent is valid when Current does not own the presentation relation.

---

# 5｜No-guess compilation rule

Projection compilation may reorganize and index Current semantics but may not invent missing domain relations.

For A2:

- accepted `learning-cues` and `pathways` may be consumed directly as Current enrichment inputs.

For A1 / A3:

- existing System / learning-support / Block-Core semantics may be projected where the relation is explicit;
- exact source locators may only be projected when Current owns them;
- a statement such as A3's `visual_rule` authorizes preserving explicit source-local visual routes, **not inventing which image or page should be a Visual cue**;
- absence of a reviewed connection / failure focus / cue remains absence until a legitimate Current owner supplies it.

A1's known locator debt must remain visible to the compiler as debt; it must not be repaired by model intuition during UI asset generation.

---

# 6｜A2 is an exemplar, not cross-System semantic authority

A2's enrichment design demonstrates useful Projection-support categories:

- selective Precision timing;
- source-local Visual triggers;
- failure-view focus;
- cross-Block reactivation;
- Reserve-learning hooks.

These categories are strong candidates for the shared Xizong Projection vocabulary.

However:

> **A2 data is not the answer key for A1 or A3.**

A1/A3 enrichment must be compiled independently from their own Current owners. Do not transfer respiratory relation shapes, cue density or timing assumptions merely for schema parity.

---

# 7｜Shared component rule

Future shared Xizong learner components must consume the **normalized Projection capability contract**, not branch on System-specific physical files.

Prefer:

```text
viewModel.logicGroup.visualCues
viewModel.logicGroup.precisionCues
viewModel.connections.incoming
viewModel.failureView
```

Not:

```text
if A2 learning-cues file exists ...
if A3 ...
if A1 ...
```

The existing optional loaders (`xizongLearningCues.mjs`, `xizongPathways.mjs`) remain Current implementation evidence. The later productization may replace/absorb their responsibilities behind the normalized Projection layer while preserving semantics and Runtime behavior.

---

# 8｜Cross-System safety before shared Block UI changes

Because `XizongBlockV6.astro` and related helpers are shared, any Block-workspace productization must pressure-test at least:

```text
A1 — mature baseline without separate cue/pathway enrichment
A2 — mature baseline with learning-cues + pathways enrichment
A3 — mature baseline with strongly structured Block Core / source locators but no separate enrichment files
```

A shared UI change is unsafe if it works for A1 but silently loses A2 Visual / Precision / Connection timing, or if it assumes A2-style metadata exists for A3/A1.

Likewise it must not discard A3's richer Core orientation/source-local structure merely because A1 stores less locator metadata.

---

# 9｜Timing

Do not immediately retrofit A1/A3 source owners merely to match A2 during the current UI-discussion phase.

Frozen sequence remains:

```text
read whole learner loop
→ freeze Mac-wide surface responsibilities
→ pressure-test A1 / A2 / A3 + heterogeneous Blocks
→ freeze Xizong Projection schema / capabilities
→ separate Projection Compilation lane
→ independently compile each System from its own Current owners
→ validate semantic preservation and cross-System coverage
→ Codex implementation
```

If compilation later demonstrates a genuine Current owner gap that cannot be represented without inventing semantics, reopen only the smallest responsible upstream owner at that time.

---

# 10｜Compact decision

```text
A1 / A2 / A3 learning loop
= already shared and accepted

Current Projection-support storage
= asymmetric

Correct normalization target
= downstream Cognitive Projection ViewModel

A2 learning-cues/pathways
= useful exemplar + Current A2 input
≠ mandatory physical-file template for every System

A1/A3 missing explicit enrichment relation
= stay empty / unresolved unless their own Current supports compilation
≠ AI guess
```
