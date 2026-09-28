# Xizong System Framework — accepted design direction

Status: **CURRENT — ACCEPTED SYSTEM FRAMEWORK DESIGN**  
Parent: `static-web/XIZONG_PRODUCT_BRIEF.md`  
Review safety: `static-web/XIZONG_UI_REVIEW_PROTOCOL.md`  
Shared evolvability requirement: root `PROJECT_DEFINITION.md` R10 + `ARCHITECTURE.md` §7.1

This file records the accepted learner-facing System Framework direction. It does not change medical Content, Learning Logic, learner order, Evidence semantics, learner progress, or S/K/L/P/R/E/U claims.

This owner is the accepted **System Framework** design. The separate **Beginner Guide** is the skippable explanatory text asset under `content/xizong/knowledge/learner/*-guide.md`.

Naming boundary:

```text
Beginner Guide = explain in readable prose
System Framework = show the structured System model
Block Framework = show the structured Block model
```

A Framework may use spatial relations, coordinates, comparison or failure geometry only when Current owns them. It must not rewrite the Beginner Guide into a diagram, and the Beginner Guide must not become a second Framework owner.

## 0.5｜2026-09-18 accepted Mac-wide L3

The accepted learner-facing System workbench is:

```text
compact System identity / mission        GUIDE | FRAMEWORK
────────────────────────────────────────────────────────────
BLOCK ROUTE | dominant Guide or System Framework
            | + conditional Context only when selected
```

Accepted interaction/composition decisions:

- Mac wide landscape is the design origin.
- Beginner Guide and System Framework are two views of the same System workbench, but remain semantically distinct:
  - Guide = explanatory prose;
  - Framework = structured cognitive model.
- Block Route remains persistently visible because it materially carries System position and free navigation.
- KP / Outline counts are not primary Route information.
- There is **no permanent right inspector**.
- Selected Block duplicate panel, permanent help and keyboard instructions are removed from repeated-use System UI.
- Failure selection may temporarily open a bounded Context region; closing it returns the width to the main cognitive stage.
- System Exit / System Recall / official questions remain hidden until real learner eligibility.
- Guide prose is loaded from the Current Guide resolver and may change through Content without page-layout rewrites.
- Framework consumes Current System semantics and must remain usable across materially different Systems such as A1/A2/A3 without System-name conditionals.
- Chinese learner typography follows the shared broad/full-bodied CJK baseline; page-local negative tracking is not used.
- Long Guide content may scroll inside the main cognitive stage. One-viewport closure is not a goal.

Human Gate evidence for this L3 used materially different views:

- A1 Beginner Guide;
- A1 System Framework;
- A2 System Framework.

Kian accepted the direction before targeted CI. Content wording remains independently editable through its canonical GitHub owners and does not require reopening this visual L3 unless the presentation contract itself changes.

## 1｜Role in the learner loop

System Framework remains first-pass **orientation**, not Recall, not a chapter catalogue, and not a second Lecture.

```text
Xizong Home / Continue
→ optional Beginner Guide when genuinely useful
→ System Framework
→ understand the System-level model / coordinates / failure logic
→ choose a Block
→ Block Workspace
```

System Recall / System Exit remains later-stage and must not compete with first-pass orientation before learner eligibility.

## 2｜Mac-wide composition — ACCEPTED DIRECTION

Primary geometry:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ System identity / mission / current selected Block                          │
├──────────────────────┬───────────────────────────────────────────────────────┤
│ BLOCK ROUTE          │ SYSTEM COGNITIVE CANVAS                               │
│ sticky               │ mother model / spine                                  │
│                      │ + parallel controls                                    │
│ B1                   │                                                       │
│ B2                   │ system language / variables / relations                │
│ B3                   │                                                       │
│ ...                  │ case coordinates / judgment axes                       │
│                      │                                                       │
│                      │ failure map / dependency or cross-Block objects         │
│                      │ only when Current supports them                         │
└──────────────────────┴───────────────────────────────────────────────────────┘
```

When a contextual object is actively selected, the workspace may temporarily become:

```text
Block Route | System Canvas | Context
```

The Context region is conditional. Do not reserve a permanent empty inspector.

Hard rule:

> **The stable shell is shared; the actual cognitive geometry comes from each System's Current semantics.**

A1 Circulation must not define A2/A3 layout semantics merely because its current model is convenient to render.

## 3｜System Canvas — ACCEPTED

The System Canvas should project the System's Current cognitive model spatially rather than flattening it into a stack of generic panels/cards.

Where Current supports them, the canvas may express:

- mother model / main spine;
- parallel controls;
- core variables / coordinates;
- equations / stable relations;
- judgment axes / discrimination coordinates;
- Failure Modes / failure propagation;
- dependency / cross-Block relation objects;
- other explicit Current System-level cognition.

Full Current semantics are preserved. Presentation compression must not become semantic compression.

### Example pressure-test directions

A1 may emphasize:

```text
volume pool / venous return
→ pump + valves
→ arterial pressure / resistance
→ microcirculation exchange
→ venous recovery
→ return to heart
```

with parallel rhythm/electrical, neurohumoral-volume and coronary oxygen-supply control, plus P/Q/R/V and mechanical coordinates when Current owns them.

A2 may emphasize its air → airway → pump/thorax → alveoli → membrane → VA/Q → Hb → tissue model and respiratory localization axes.

A3 may emphasize perfusion → filtration → tubular handling → concentration/hormonal control → fluid/electrolyte/acid-base → urine evidence → urinary outlet.

These are Current-supported examples, not a universal schema.

## 4｜System language / variables / relations — ACCEPTED

Do not default to a separate `Core Variables` card merely because the current implementation has one.

Where helpful, project variables / relations as a System-language region integrated with the cognitive model.

Examples of legitimate representation include:

```text
P / Q / R / V
CO = HR × SV
MAP ≈ CO × TPR
Q ≈ ΔP / R
```

or the corresponding A2/A3 language from their own Current owners.

Exact layout is System-specific and may evolve with Projection assets.

## 5｜Judgment axes as cognitive coordinates — ACCEPTED

When Current owns paired judgment axes, represent them as real discrimination coordinates rather than a pile of pills/chips.

Example shape:

```text
upstream congestion  ─────────  downstream hypoperfusion
pressure load        ─────────  volume load
acute                ─────────  chronic
compensated          ─────────  decompensated
stable               ─────────  unstable
```

Only render Current-owned axes. Do not invent axes for visual symmetry.

## 6｜Failure focus — ACCEPTED

Failure Modes remain an important System-level learner interaction.

Default state shows the System model and a light Failure Map / selector. When a Current-supported Failure is selected:

```text
System Canvas
→ emphasize affected nodes / relations when reviewed Projection support exists
→ optionally dim unrelated regions
→ show bounded Failure Context only when useful
```

Context may include Current-owned:

- failure chain;
- affected variables;
- parallel focus;
- relevant system-local relation.

A2 already has explicit optional `system_failure_views`. A1/A3 or future Systems must not receive guessed focus nodes merely to imitate A2.

## 7｜Block Route — ACCEPTED

The left Block Route stays because it materially helps first-pass orientation and free navigation.

Prioritize:

```text
Block identity
+ readable Block title
+ sequence / relation to the System route
```

Demote KP / Outline counts unless they materially help the learner decision.

The route may visually express real Current dependency/relation information where owned, but must not manufacture a DAG merely for aesthetics.

Selecting a Block changes learner focus. `Enter` / click may open the selected Block directly.

## 8｜Current implementation audit disposition

### KEEP

- System mission / identity;
- mother model / spine;
- parallel controls;
- core variables / relations;
- judgment axes;
- Failure Modes;
- optional Current-supported Failure focus behavior;
- free Block selection and direct entry;
- Current dependency / cross-Block information when genuinely owned;
- System Recall as later-stage only.

### OPTIMIZE

- replace panel/card stacking with one System Cognitive Canvas plus structured lower regions;
- increase learner text size / contrast for sustained Mac use;
- use width for simultaneous relations rather than permanent chrome;
- make Failure selection update the System model in place;
- express coordinates / relations spatially where Current supports them.

### DEMOTE

- permanent Selected Block duplicate panel;
- permanent Keyboard/help panel;
- KP / Outline counts as primary learner information;
- Source/provenance/hash chrome;
- first-pass System Recall shortcuts;
- generic card/border treatment for every semantic object.

### RESTORE_FROM_CURRENT

Where the existing renderer flattens Current relation structure into chips, panels or lossy labels, restore the Current relation as spatial cognitive structure without changing medical semantics.

## 9｜Content-evolution / multi-pass compatibility — ACCEPTED CONSTRAINT

System Framework must satisfy root Content Evolvability requirements.

Normal medical/content evolution should be absorbed through Current / Projection assets rather than topic-specific page rewrites.

Do not implement patterns such as:

```text
if system === circulation → hard-code P/Q/R/V truth in page code
if system === respiratory → hard-code VA/Q semantic graph in page code
```

The System workspace should consume semantic presentation objects / Projection support and remain usable when Current objects are added, removed, reordered or enriched.

Optional enrichment remains optional: one System may have reviewed pathway/failure/connection support another lacks.

### Multi-pass reuse

The System's canonical cognition should remain reusable across learner stages/passes:

```text
ORIENT      → full System Framework
RECALL      → protected / compressed System reconstruction
SECOND_PASS → thinner application/discrimination/precision/case projection when later assets exist
LATE        → highly compressed skeleton / high-value boundaries when later assets exist
```

This file does not define second-pass medical content now. It only requires that first-pass implementation not trap the System cognition in a one-pass-only page structure.

## 10｜Interaction / visual direction

Mac-wide design follows Dense Calm:

- structurally rich, not empty;
- content/model more visible than software chrome;
- larger readable learner typography;
- restrained color;
- use alignment, lines, relation drawing and spatial grouping before cards;
- no permanent unused right rail;
- shortcuts are discoverable but not permanent primary content;
- one viewport is not a closure requirement; allow scrolling when Current System cognition is genuinely dense.

## 11｜Acceptance boundary

This is an accepted Product/Projection direction, not implementation acceptance.

Before final UI acceptance still require:

```text
Projection asset compilation
→ Runtime implementation against Current assets
→ real Mac-wide screenshots across materially different Systems
→ no semantic loss / no guessed optional enrichment
→ Sol structural/aesthetic review
→ Kian acceptance
```
