# D Neuro · Sensory · Motor · Orthopedics — Phase 1 Route Decision

Status: **PASS — causal readiness DAG + low-switching default accepted for LG construction**  
Depends on: `D_PHASE0_LEARNING_CALIBRATION.md` + Current D `system.json` + N1–N11/O1–O16 medical Core  
Learner Truth: none

## 1｜Decision

D uses:

> **CAUSAL READINESS DAG WITH A LOW-SWITCHING DEFAULT ROUTE**

The readiness graph decides what must already exist in the learner model. The default route is only a low-friction path and does not turn every earlier ordinal Block into a hard prerequisite.

Default first-pass route:

```text
N1 → N2 → N3 → N4
→ N5 → N6 → N7
→ N8 → N9 → N10 → N11
→ O1 → O2 → O3 → O4 → O5
→ O6 → O7 → O8 → O9 → O10 → O11 → O12
→ O13 → O14 → O15 → O16
```

Why a serial-looking default is still acceptable:

- it minimizes device/source/topic switching across coherent physiology and surgery clusters;
- it preserves the strong causal chains N1→N2→N3/N4, N5→special senses, N8→N11 and O1/O2→regional trauma;
- it lets N9/N10 consume their contiguous physiology source before N11 closes the neural branch as a localization bridge;
- it keeps O3/O4/O5 together as spine/nerve localization applications and O6/O7 together as regional trauma;
- it keeps infection/TB/arthritis/tumor as a late organ-structure branch without pretending they are consequences of earlier fractures;
- true flexibility remains legal through the readiness graph below.

## 2｜Hard prerequisite rule

A dependency is hard only when entering the Block without it would leave a missing model that the Block intentionally does not teach again.

These are **not** hard by themselves:

- old file/ordinal order;
- useful comparison;
- same organ or nearby page;
- a prior Block being frequently referenced;
- a prerequisite list inherited from an older execution file when Current learning can safely reactivate/minimally repair it.

External-owner knowledge is treated as:

```text
already genuinely learned → Recall / reactivate
not yet learned → smallest-sufficient Chat/source repair for the current D action
```

unless the D Block genuinely cannot form without the full external model. Learning construction does not manufacture Kian's prior learner state.

## 3｜Block readiness table

| Block | Hard requires inside D | Benefits from / reactivates | Prepares / returns to |
| --- | --- | --- | --- |
| N1 | none | membrane/electrical baseline | N2, N5, N11, O5 |
| N2 | N1 | membrane Ca²⁺/AP baseline | N3, N5, N8, N9 |
| N3 | N2 | cell signaling + autonomic language | N4, N8, N10 |
| N4 | N2 + N3 | N1 AP/conduction | N8; locomotor actuator model |
| N5 | N1 + N2 | existing general sensory examples | N6, N7, N9, N11 |
| N6 | N5 | N3 receptor/effect discrimination; membrane baseline | visual physiology/localization |
| N7 | N5 | N1 membrane/conduction | auditory/vestibular discrimination |
| N8 | N2 + N4 | N3 transmitters; N5 feedback language | N11; motor-control/UMN-LMN coordinate |
| N9 | N2 + N5 | network synchrony examples | N10 |
| N10 | N9 + N2 | N3 autonomic/receptor language; prior endocrine/volume/temperature owners | E/F interfaces; neural state integration |
| N11 | N5 + N8 | N1 conduction; targeted O3/O4/O5 source visuals | O1, O3, O4, O5 |
| O1 | N11 | N4 muscle function; N5 pain/sensation; O-source common figures | every orthopedic branch |
| O2 | O1 | pathology repair; A1 perfusion/shock | O3, O6, O7, O8; fracture complications generally |
| O3 | O2 + N11 | A1 shock/perfusion; A2 ventilatory pump | acute spine/pelvis/cord danger model |
| O4 | O1 + N11 | O3 acute spine contrast | chronic root/cord/cauda compression |
| O5 | O1 + N11 | N1 regeneration; N4 denervation; O2 associated trauma | O6/O7 neuro-risk, O8 hand, O11 entrapment |
| O6 | O2 + O5 | N11 localization | upper-limb regional trauma |
| O7 | O2 + O5 | lower-limb load/vascular interfaces | O10 AVN; lower-limb trauma |
| O8 | O2 + O5 | O6 hand/upper-limb context | hand function / reconstruction interface |
| O9 | O1 | O7 knee bony-trauma context | O11/O15 comparisons |
| O10 | O7 | pathology ischemia/necrosis | O15 secondary OA interface |
| O11 | O5 for full-Block closure | O1; O6 shoulder; O9 knee; soft-tissue Source unit can be contacted before O5 if separately needed | chronic load + entrapment model |
| O12 | O1 | O4 nonstructural scoliosis/root-pain contrast | developmental structure model |
| O13 | O1 | C H20/H25 infection/source-control + pathology inflammation | O14; infection structural model |
| O14 | O13 | C H21 TB common model + A2 pulmonary-TB treatment entry | O15/O16 differential |
| O15 | O1 | C H17 RA Primary; O10 secondary OA; O14 spine/TB comparison | chronic joint structural coordinate |
| O16 | O1 | O9 tumor-general gate; C H8 MM; O2/O13/O14/O15 comparisons | final pathology/structure discrimination branch |

## 4｜Material dependency repairs vs legacy/frontmatter lists

The Learning route intentionally corrects several inherited overstatements without changing medical Core:

### O4 does not hard-require O3

O3 = acute trauma/instability + cord injury.  
O4 = chronic degenerative space loss compressing root/cord/cauda.

Both consume N11, but O3's acute trauma model is a comparison benefit, not a prerequisite for understanding O4.

### O5 does not hard-require O2

Traumatic peripheral-nerve localization fundamentally needs N11 + orthopedic entry coordinate. Fracture/open-injury principles from O2 matter when combined trauma is present, but they do not define the nerve-localization model.

The low-switching default still keeps O2 before O5.

### O12 does not hard-require O11

Developmental deformity is not downstream of chronic overuse/entrapment. O11→O12 survives only as a convenient default ordering, not as causal dependency.

### O15 does not hard-require O10/O14

OA/AS/RA structural discrimination has its own Source model. AVN→secondary OA and TB→spine/joint destruction are useful contrasts. They do not create the OA/AS/RA model.

### O16 does not hard-require all prior disease Blocks

O16's essential external baseline is tumor-general language; O13/O14/O15 are high-value differential comparators. Their absence should trigger bounded reactivation/repair, not fabricate a false prerequisite chain.

## 5｜Readiness graph

```text
N1 → N2 ───────────────┬→ N3 → N4 ─────→ N8 ──┐
 │                     │                       │
 └────────→ N5 ────────┼→ N6                  ├→ N11
             │         ├→ N7                  │
             └────────→ N9 → N10              │
                                                ↓
                                               O1
                         ┌──────────────────────┼───────────────┐
                         ↓                      ↓               ↓
                        O2                     O4              O12
                     ┌───┼────┐                 ↑
                     ↓   ↓    ↓                 │
                    O3  O6   O7                 │
                         ↑    ↑                  │
                         └─O5─┘──────────────────┘
                           │
                           ├→ O8
                           └→ O11

O1 → O9
O7 → O10
O1 + C infection baseline → O13 → O14
O1 + RA/tumor/contrast reactivation → O15 / O16
```

The graph is intentionally sparse. “Benefits from” relations are not promoted into hard edges.

## 6｜What may legally move earlier

When true requirements are available and source continuity benefits, these moves are legal:

- N6 and N7 may swap after N5.
- N8 may begin once N2/N4 are established; N6/N7 are not prerequisites for motor control.
- N9/N10 are a state/higher-function branch and do not gate N8 or N11. A locomotor-focused session may place N8→N11 before N9/N10, but the default keeps P366–390 physiology continuity and closes N11 last.
- O4 may move directly after O1/N11; O3 is not a hard predecessor.
- O5 may move before O3/O4 when peripheral-nerve continuity is the active learning goal.
- O9 and O12 may move earlier after O1 because they do not require the fracture branch.
- O13 may begin after O1 plus sufficient common infection/source-control language, without waiting for O2–O12.
- O15 may begin after O1 plus sufficient RA common language; O10/O14 are comparison benefits.
- O16 may begin once the tumor-general baseline and O1 structural coordinate exist; prior D disease Blocks improve differential compression but are not all prerequisites.

The default remains stable because unnecessary shuffling costs attention and source switching.

## 7｜Five non-gating partial-System reconstructions

These are short compression checkpoints, not new hierarchy/mastery objects and not required to unlock the next Block.

### PSR-D1｜Signal → sensation → actuator

After N1–N7:

```text
stimulus / command
→ membrane/axon
→ synapse/receptor
→ sensory transduction or NMJ
→ AP / coding / force output
→ where can the first failure occur?
```

Closure: the learner can distinguish membrane/axon, synapse/receptor, sensory transduction and muscle-execution failures rather than treating “神经异常” as one layer.

### PSR-D2｜Control → localization

After N8–N11:

```text
controller / descending system / reflex arc
→ tone + reflex + strength + sensation
→ central / cord / conus-cauda / root / named nerve / NMJ-muscle
→ urgent red flag?
```

Closure: a new weakness/numbness case is localized by evidence pattern before disease name.

### PSR-D3｜Trauma / stability / neurovascular danger

After O1–O7:

```text
force + structure
→ displacement / stability
→ open/closed + blood supply + nerve/vessel/compartment/cord risk
→ imaging question
→ reduction/fixation/functional goal
```

Closure: a fracture/dislocation case is not reduced to memorizing the eponym; the learner can name the immediate danger and treatment objective.

### PSR-D4｜Load / perfusion / growth / local function

After O8–O12:

```text
local tissue / load / blood supply / growth stage
→ pain or functional loss
→ reversible irritation vs structural failure vs ischemic collapse vs developmental fixation
→ evidence
→ function-preserving treatment window
```

Closure: hand/knee/chronic-load/AVN/deformity cases are routed by tissue and mechanism rather than one generic “骨科慢性病” list.

### PSR-D5｜Destructive structural disease

After O13–O16:

```text
pyogenic / TB / degenerative-inflammatory / tumor
→ tissue-of-origin + tempo
→ imaging / pathology / source-control or evidence role
→ stability / neuro/function threat
→ owner-appropriate treatment direction
```

Closure: chronic pain/destruction/lesion cases are separated by mechanism and evidence instead of a single image sign.

## 8｜Final System reconstruction

Authorized only after all 27 D Blocks are actually learned in private learner state.

Prompt skeleton:

1. Rebuild the information–control–execution–structure–feedback mother model.
2. Given pain, numbness, weakness or functional loss, first choose neural layer vs structural layer.
3. If neural, localize transduction/conduction/synapse-central-control/UMN-LMN/root/nerve/NMJ-muscle.
4. If structural, localize tissue, stability, neurovascular danger, perfusion, load/growth and destructive cause.
5. Use D failure modes/judgment axes to choose the smallest owning Block or external owner that needs reopening.
6. Rebuild the three loops: sensory-localization, motor-feedback, structural-repair.

Forbidden:

- reciting 27 Block titles as “System Recall”;
- treating N1→O16 default order as medical ontology;
- turning special senses into prerequisites for orthopedic disease;
- importing missing complete neurology/ophthalmology/ENT content;
- replacing real visual contact with memorized prose;
- treating repair/engineering completion as learner mastery.

## 9｜Phase-1 verdict

```text
route mode                              CAUSAL_READINESS_DAG_WITH_LOW_SWITCHING_DEFAULT
default route                           N1→N11 → O1→O16
hard prerequisites                      REDUCED_TO_TRUE_MODEL_DEPENDENCIES
O4←O3 hard dependency                   REJECT
O5←O2 hard dependency                   REJECT
O12←O11 hard dependency                 REJECT
O15←O10/O14 hard dependency             REJECT
flexible branch movement                ACCEPT
partial-System reconstructions          5 / NON_GATING
next stage                              27-Block control + exact 356-KP LG partition
```
