# D Neuro · Sensory · Motor · Orthopedics — Phase 1 Route Decision

Status: **PASS_AFTER_SELF_ADVERSARIAL_REPAIR — sparse causal readiness DAG + low-switching default**  
Depends on: `D_PHASE0_LEARNING_CALIBRATION.md` + Current D `system.json` + N1–N11/O1–O16 medical Core  
Learner Truth: none

## 1｜Decision

D uses:

> **SPARSE CAUSAL READINESS DAG WITH A LOW-SWITCHING DEFAULT ROUTE**

The readiness graph answers only:

> **Which earlier D model must already exist because the current Block intentionally does not teach it again?**

The default route answers a different question:

> **Given several legal ready Blocks, what order minimizes source/device/topic switching for Kian?**

Default first-pass route remains:

```text
N1 → N2 → N3 → N4
→ N5 → N6 → N7
→ N8 → N9 → N10 → N11
→ O1 → O2 → O3 → O4 → O5
→ O6 → O7 → O8 → O9 → O10 → O11 → O12
→ O13 → O14 → O15 → O16
```

This serial-looking default is **not** the legality graph and is **not** medical ontology.

It remains useful because it:

- keeps contiguous physiology and surgery Source clusters together;
- preserves strong causal chains such as N1→N2, N2→N3/N4, N5→N6/N7 and N5+N8→N11;
- places N11 immediately before the spine/nerve-heavy orthopedic cluster even though O1/O2 themselves do not hard-require N11;
- keeps O2 before regional fracture application;
- keeps later destructive structural disease together for compression;
- reduces arbitrary switching while preserving legal branch movement.

## 2｜Hard prerequisite rule

A dependency is **hard** only when all are true:

1. the earlier Block owns a model the current Block relies on;
2. the current Block intentionally does not rebuild that model;
3. entering without it would force hidden guessing or accidental duplicate teaching;
4. a bounded reactivation/minimal repair would not be enough to form the current Block honestly.

These do **not** create a hard edge by themselves:

- ordinal/file order;
- “usually learned before”;
- useful comparison;
- shared anatomy;
- a prior Block being frequently referenced;
- source continuity;
- an old frontmatter `prerequisites` list;
- an integration/orientation map that is helpful but not semantically necessary.

External-owner knowledge follows the lane rule:

```text
already genuinely learned → Recall / reactivate
not yet learned → smallest-sufficient owner/Chat/Source repair for the current action
```

unless a separate Current owner explicitly makes it a true prerequisite. Repository construction never assumes Kian already learned it.

## 3｜Sparse readiness table

| Block | Hard requires inside D | Benefits from / reactivates | Why the edge is or is not hard |
| --- | --- | --- | --- |
| N1 | none | membrane/electrical baseline | D entry substrate |
| N2 | N1 | membrane Ca²⁺/AP baseline | synaptic release assumes neuron/AP/fiber language |
| N3 | N2 | cell signaling + autonomic language | transmitter/receptor effects assume the synaptic layer already exists |
| N4 | N2 + N3 | N1 AP/conduction | NMJ is a specialized synapse using ACh/N2 before muscle execution |
| N5 | N1 + N2 | existing sensory examples | general sensation needs conduction + synaptic projection language |
| N6 | N5 | N3 receptor/effect discrimination | special vision instantiates the general sensory model |
| N7 | N5 | N1 membrane/conduction | special hearing instantiates the general sensory model |
| N8 | N2 | N4 actuator; N5 feedback; N3 transmitter examples | motor-control physiology needs neural integration; full muscle/NMJ and sensory Blocks improve it but are not required to form it |
| N9 | N2 | N5 nonspecific-projection/arousal interface | EEG/sleep is network-state physiology; the N5 arousal bridge is useful but can be reactivated minimally |
| N10 | N2 | N9 state continuity; N3 autonomic/receptor language; endocrine/volume/temperature owners | learning/LTP and hypothalamic control need network/synapse language, not full N9 as a prerequisite |
| N11 | N5 + N8 | N1 tract details; targeted O3/O4/O5 visuals | localization synthesizes sensory distribution + motor/reflex/UMN-LMN evidence |
| O1 | none | N11; N4/N5; shared orthopedic Source figures | O1 is an integration/orientation coordinate, not a gate that must block entry to orthopedic medical Core |
| O2 | none | O1; pathology repair; A1 perfusion/shock | fracture principles are a self-contained common model; O1 is useful orientation only |
| O3 | O2 + N11 | A1 shock/perfusion; A2 ventilatory pump | acute spine/pelvis trauma applies fracture principles and requires neurologic level localization |
| O4 | N11 | O1; O3 acute-trauma contrast | chronic root/cord/cauda compression requires the localization bridge, not prior acute trauma |
| O5 | N11 | O1; N1 regeneration; N4 denervation; O2 associated trauma | named peripheral-nerve trauma requires the localization bridge; fracture principles are conditional context |
| O6 | O2 | O1; O5/N11 neuro-risk maps | regional upper-limb fractures apply the common fracture model; full O5 is not required to learn local nerve risk |
| O7 | O2 | O1; O5/N11 neuro-risk maps | regional lower-limb fractures apply the common fracture model; full O5 is not required |
| O8 | none | O1; O2 open-injury/source-control; O5 nerve map; O6 hand/upper-limb context | hand trauma/replant is a compact tissue-priority model and can reactivate missing fracture/nerve language locally |
| O9 | none | O1; O7 knee bony-trauma context | ligament/meniscus stability model is self-contained |
| O10 | none | O1; O7 femoral-neck/hip blood-supply context; pathology ischemia | AVN owns its perfusion→collapse model and does not require prior fracture learning |
| O11 | N11 for full-Block closure | O1; O5 named-nerve map; O6 shoulder; O9 knee | soft-tissue overload unit can stand alone; full Block includes root-vs-entrapment localization, for which N11 is the true prerequisite |
| O12 | none | O1; O4 nonstructural-scoliosis/root-pain contrast | developmental deformity is a self-contained age/growth model |
| O13 | none | O1; C H20/H25 infection/source-control; pathology inflammation | organ-specific bone/joint infection can form with bounded reactivation of common infection language |
| O14 | none | O1; O13 pyogenic contrast; C H21 TB; A2/R7 pulmonary-TB treatment entry | TB structural model does not semantically depend on learning pyogenic infection first |
| O15 | none | O1; C H17 RA; O10 secondary OA; O14 spine/TB comparison | OA/AS/RA structural coordinate is self-contained; prior disease Blocks are comparison value only |
| O16 | none | O1; O9 tumor-general; C H8 MM; O2/O13/O14/O15 comparisons | bone-tumor organ model can form with bounded tumor-general reactivation; prior D diseases sharpen differential but are not prerequisites |

## 4｜Self-adversarial readiness repair

An initial Phase-1 version still carried several **helpful-order relations as hard edges**. That would have created false UI/runtime locks later.

The following edges are now explicitly rejected:

### N8 ← N4

N4 completes the NMJ/muscle actuator, but N8’s core learner problem is spinal/motor-control organization. N8 requires N2 neural integration; N4 is a valuable actuator interface, not a hard gate.

### N9 ← N5

N5 contributes nonspecific-projection/arousal language, but N9 itself owns the sleep/wake network-state model. N5 is reactivation value, not a hard prerequisite.

### N10 ← N9

N9 and N10 are contiguous in Source and remain adjacent in the default route. Higher cortical function and hypothalamic homeostasis do not require complete EEG/sleep learning. N2 is the true shared neural-network substrate.

### O1 ← N11

N11 makes later orthopedic neurologic localization much stronger, but O1 itself is a structure–stability–danger–evidence/function integration map. Making N11 a hard prerequisite would falsely serialize the whole orthopedic branch behind the neural branch.

### O2 ← O1

O1 is useful orientation. The fracture common model in O2 is self-contained and must remain independently learnable.

### O6/O7 ← O5

Named nerve risk matters in regional trauma, but full traumatic peripheral-nerve learning is not necessary before learning the fracture/dislocation model. Missing local nerve detail can be reactivated minimally.

### O8 ← O2/O5

Hand trauma/replant is not merely “fracture + nerve injury”. It has its own tissue-viability/coverage/function logic. O2/O5 are interfaces, not gates.

### O10 ← O7

Femoral-neck fracture is an important AVN cause/interface, but the ischemia→necrosis→collapse model is self-contained.

### O14 ← O13

Pyogenic infection is a powerful comparator, not a prerequisite for TB. Retaining this edge would confuse discrimination value with causal dependency.

Previously rejected edges remain rejected:

- O4 ← O3;
- O5 ← O2;
- O12 ← O11;
- O15 ← O10/O14;
- O16 ← O2/O13/O14/O15.

## 5｜Sparse readiness graph

```text
N1 → N2 ───────→ N3 ─────→ N4
 │      │
 │      ├──────────────→ N8 ─────┐
 │      ├──────────────→ N9      │
 │      └──────────────→ N10     │
 └────────→ N5 ─→ N6             │
             └──→ N7             │
             └───────────────────┤
                                 ↓
                                N11
                                 │
                    ┌────────────┼──────────────┐
                    ↓            ↓              ↓
                   O3           O4             O5
                    ↑
                   O2 ─────────→ O6
                    └───────────→ O7

N11 ─→ O11 (for full Block closure)

independent orthopedic entry Blocks under the default O1 orientation:
O1, O2, O8, O9, O10, O12, O13, O14, O15, O16
```

The graph deliberately looks much sparser than the default route. That is correct.

## 6｜Default route vs legal movement

The default route remains unchanged because low switching is valuable even when hard dependencies are sparse.

Legal examples:

- N6 and N7 may swap after N5.
- N8 may start after N2; N4/N5 improve integration but are not gates.
- N9 and N10 may swap or move around N8 once N2 exists; the default keeps them together for Source continuity.
- N11 may occur after N5+N8 even if N9/N10 remain for later.
- O1 may be used as orthopedic orientation without requiring N11.
- O2 may be learned independently; O3 waits for both O2+N11.
- O4/O5 may start once N11 exists, independent of O2/O3.
- O6/O7 require O2, not O5.
- O8/O9/O10/O12/O13/O14/O15/O16 may enter when their own Source/external baseline is available; their late serial placement is a low-switching default only.
- O11 soft-tissue Source unit may be contacted earlier, but full Block closure waits for N11 because root-vs-entrapment discrimination is part of the accepted Block model.

## 7｜Five non-gating Partial-System Reconstructions

These are compression checkpoints, not readiness gates.

### PSR-D1｜Signal → Sensation → Actuator

After N1–N7 are actually learned:

```text
stimulus / command
→ membrane/axon
→ synapse/receptor
→ sensory transduction or NMJ
→ AP / coding / force output
→ first failed layer?
```

Closure: distinguish membrane/axon, synapse/receptor, sensory transduction and muscle-execution failures without replaying Block titles.

### PSR-D2｜Control → Localization

After N8–N11 are actually learned:

```text
controller / descending system / reflex arc
→ tone + reflex + strength + sensation
→ central / cord / conus-cauda / root / named nerve / NMJ-muscle
→ urgent red flag?
```

Closure: localize a new weakness/numbness case before disease name.

### PSR-D3｜Trauma / Stability / Neurovascular danger

After O1–O7 are actually learned:

```text
force + structure
→ displacement / stability
→ open/closed + blood supply + nerve/vessel/compartment/cord risk
→ imaging question
→ reduction/fixation/functional goal
```

Closure: route a trauma case by danger and function rather than eponym.

### PSR-D4｜Load / Perfusion / Growth / Local function

After O8–O12 are actually learned:

```text
local tissue / load / blood supply / growth stage
→ pain or functional loss
→ acute deficit vs chronic overload/entrapment vs ischemic collapse vs developmental fixation
→ evidence
→ function-preserving treatment window
```

Closure: route focal/chronic orthopedic cases by first failed tissue and mechanism.

### PSR-D5｜Destructive structural disease

After O13–O16 are actually learned:

```text
pyogenic / TB / degenerative-inflammatory / tumor
→ tissue/site + tempo
→ imaging / pathology / source-control evidence
→ stability / neural / function threat
→ correct owner / treatment direction
```

Closure: separate destructive structural disease by mechanism and evidence role rather than one image sign.

## 8｜Final System reconstruction

Authorized only after all 27 D Blocks are actually learned in private learner state.

Prompt skeleton:

1. rebuild the information–control–execution–structure–feedback mother model;
2. given pain/numbness/weakness/deformity/function loss, choose neural vs structural first owner;
3. if neural, localize transduction/conduction/synapse-control/UMN-LMN/cord-root-nerve/NMJ-muscle;
4. if structural, localize tissue, stability, neurovascular danger, perfusion, load/growth and destructive cause;
5. use D failure modes/judgment axes to reopen only the smallest owning Block/external owner;
6. rebuild sensory-localization, motor-feedback and structural-repair loops.

Forbidden:

- reciting 27 Block titles as “System Recall”;
- treating default order as medical ontology;
- turning special senses into orthopedic prerequisites;
- importing missing complete neurology/ophthalmology/ENT content;
- replacing real visual contact with memorized prose;
- treating engineering/repair state as learner mastery.

## 9｜Phase-1 verdict

```text
route mode                                  SPARSE_CAUSAL_READINESS_DAG_WITH_LOW_SWITCHING_DEFAULT
default route                               N1→N11 → O1→O16 (unchanged as guidance)
false hard edges found by self-audit         YES
false hard edges repaired                    YES
O1 as universal orthopedic hard gate         REJECT
O5 as universal regional-trauma hard gate    REJECT
O13→O14 hard serialization                   REJECT
comparison benefit = prerequisite            REJECT
partial-System reconstructions               5 / NON_GATING
next                                          keep Phase 3 exact LG partition; repair compiled Learning candidate route map before fresh audit
```
