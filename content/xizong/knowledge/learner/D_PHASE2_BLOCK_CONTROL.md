# D Neuro · Sensory · Motor · Orthopedics — Phase 2 Block Control

Status: **PASS — 27/27 Blocks have explicit learner control, Source-contact mode and stop-line**  
Depends on: `D_PHASE0_LEARNING_CALIBRATION.md`, `D_PHASE1_ROUTE_DECISION.md`, Current D `system.json`, all 27 canonical Block owners  
Medical identity: **27 Blocks / 356 KPs frozen**

## 1｜Purpose

Before exact Logic-Group partition, every Block must answer four questions:

1. What single medical problem is this Block trying to make retrievable?
2. What original-Source contact mode preserves continuity?
3. What is the local closure target before Block Recall?
4. What must **not** expand here even if related material exists?

This phase does not assign final KP membership. It prevents Phase 3 from turning a Block into arbitrary equal-size groups.

## 2｜27-Block control matrix

| Block | Main learner problem | Source contact | Local control / stop-line |
| --- | --- | --- | --- |
| N1 | how neural structure supports reception, AP initiation, conduction, transport/support and minimum tract localization | WHOLE_BLOCK_SOURCE | separate neuron/fiber/glia/tract layers; do not expand to full neurology/demyelinating disease |
| N2 | how an AP becomes transmitter release, postsynaptic integration and pre/post-synaptic inhibition/facilitation | WHOLE_BLOCK_SOURCE | keep electrical transmission, release, EPSP/IPSP and modulation as distinct layers; drug/toxin examples stay mechanism interfaces |
| N3 | how nerve → transmitter → receptor → cell → organ effect differs from “transmitter name = effect” | WHOLE_BLOCK_SOURCE | Current autonomic/receptor exam language only; do not build a full central transmitter or autonomic pharmacology catalog |
| N4 | how motor-nerve AP becomes skeletal-muscle force and how load/recruitment/frequency change output | NATURAL_SOURCE_UNITS | NMJ/E-C/contractile/force-regulation layers; no complete myopathy/training/rehab curriculum |
| N5 | how stimuli become coded sensation and how vestibular, pain and projection branches instantiate the common language | NATURAL_SOURCE_UNITS | current Source-supported olfaction/gustation stays recognition/boundary only |
| N6 | how optical image → retinal transduction/network → spatial vision → visual pathway creates localizable vision | NATURAL_SOURCE_UNITS | physiology + short current clinical interfaces only; no ophthalmology/neuro-ophthalmology course |
| N7 | how air sound → mechanical transmission → cochlear frequency map → hair-cell electrical output becomes hearing | NATURAL_SOURCE_UNITS | fault-layer localization only; no full audiology/ENT management |
| N8 | how spinal feedback, brainstem tone, basal ganglia, cerebellum and cortex organize purposeful movement | NATURAL_SOURCE_UNITS | Source-bound motor physiology and minimum lesion examples only; full movement-disorder/rehab medicine deferred |
| N9 | how network synchrony maps to EEG and sleep/wake state | WHOLE_BLOCK_SOURCE | no full sleep medicine, epilepsy or coma diagnosis |
| N10 | how learning/memory/language and hypothalamic homeostasis use different network/controller models | NATURAL_SOURCE_UNITS | preserve two Source units; no cognitive-neurology/psychiatry/hypothalamic-disease expansion |
| N11 | how to localize weakness/numbness by distribution, UMN/LMN, tract, root/nerve, cord/conus/cauda and danger | INTEGRATION_PRIMARY | integrate N1/N5/N8 + targeted surgical visuals; do not re-teach O3/O4/O5 treatment or create full neurology |
| O1 | how to enter an orthopedic case through structure → cause → stability → danger → evidence/function | INTEGRATION_PRIMARY | no broad P143–233 re-read; no new disease treatment Primary |
| O2 | how general fracture logic runs from classification/emergency/open injury through reduction/fixation to healing/complications | WHOLE_BLOCK_SOURCE | common fracture model only; regional eponyms/force patterns stay O3/O6/O7 |
| O3 | how axial trauma combines structural stability, hemorrhagic danger and cord/conus/cauda localization | NATURAL_SOURCE_UNITS | current surgery Source only; no modern external trauma guideline substitution |
| O4 | how degenerative space loss compresses root vs cord vs cauda and changes evidence/treatment direction | NATURAL_SOURCE_UNITS | cervical/lumbar source units; no full pain/rehab/intervention guideline |
| O5 | how traumatic peripheral-nerve level/branch injury is localized and followed into repair direction | NATURAL_SOURCE_UNITS | acute traumatic nerve Primary only; full microsurgical grading/repair/rehab and chronic entrapment deferred |
| O6 | how upper-limb force/muscle pull creates displacement and neighboring nerve/vessel/function risk | WHOLE_BLOCK_SOURCE | Current regional Source treatment wording only; no external modern algorithm |
| O7 | how lower-limb load/blood supply/age/function changes fracture/dislocation danger and goal | WHOLE_BLOCK_SOURCE | Current regional Source only; no arthroplasty/trauma-guideline expansion |
| O8 | how hand trauma prioritizes tissue viability, tendon/nerve/vessel coverage and function/replant timing | WHOLE_BLOCK_SOURCE | current one-page Source; no full hand microsurgery/replant protocol |
| O9 | how force direction maps to ligament/meniscus structure, instability tests and healing potential | WHOLE_BLOCK_SOURCE | no sports-medicine reconstruction protocol beyond Current Source |
| O10 | how blood-supply failure becomes necrosis, collapse and treatment-goal change | WHOLE_BLOCK_SOURCE | no external Ficat/ARCO staging; sidedness Source conflict remains unresolved |
| O11 | how chronic overload injures specific soft tissue and how fixed-space compression injures named nerves | NATURAL_SOURCE_UNITS | two distinct Source units; acute nerve-trauma Primary remains O5 |
| O12 | how growth/age/load turn structural deviation into a time-sensitive deformity model | WHOLE_BLOCK_SOURCE | clubfoot remains explicit Source gap; no model-prior backfill |
| O13 | how pyogenic infection plus anatomy/dead space creates acute drainage and chronic dead-bone/source-control problems | NATURAL_SOURCE_UNITS | C owns common infection; antibiotic-stopping conflict stays Source-level |
| O14 | how TB slow destruction/cold abscess produces spine/joint stability, neural and function consequences | NATURAL_SOURCE_UNITS | common TB treatment stays upstream owner; surgery-label conflict remains unresolved |
| O15 | how OA/AS/RA differ by tissue-of-origin, distribution, imaging and functional consequence | WHOLE_BLOCK_SOURCE | RA immune/medical Primary remains C; morning-stiffness threshold conflict remains explicit |
| O16 | how age/site/aggressiveness/matrix/periosteal reaction/pathology layers identify bone tumors | NATURAL_SOURCE_UNITS | O9 tumor-general + H8 myeloma remain upstream Primary; GCT chemo wording conflict stays explicit |

## 3｜Cross-Block anti-duplication rules

### N1/N8/N11

```text
N1 = tract / fiber structure + minimum pattern
N8 = motor-control physiology + UMN/LMN language
N11 = evidence combination / localization algorithm
```

N11 may retrieve these owners but must not duplicate their full Primary content.

### N11/O3/O4/O5

```text
N11 = where is the lesion?
O3 = acute axial trauma + cord danger
O4 = chronic degenerative compression
O5 = traumatic named peripheral nerve injury
```

A localization cue is not permission to pull treatment Primary upstream into N11.

### O1/O2/regional trauma

```text
O1 = universal orthopedic entry coordinate
O2 = universal fracture management/healing model
O3/O6/O7 = regional anatomy + force + local danger + function
```

Regional Blocks apply the common model rather than teaching O1/O2 again.

### O5/O11

```text
O5 = acute traumatic nerve injury
O11 = chronic fixed-space entrapment + chronic soft-tissue overload
```

They share nerve maps but not causal model.

### O13/O14/O15/O16 vs upstream Systems

D owns organ-specific structural consequences and current surgery evidence. C/B/O9 continue to own common infection, RA immune medicine, myeloma/tumor-general foundations.

## 4｜Visual closure policy by Block

Visual contact is **material** for:

- N1 tract/incomplete-cord interfaces;
- N5 vestibular axes;
- N6 optics/retina/field/visual pathway;
- N7 cochlear spaces, traveling wave and hair-cell transduction;
- N8 spindle/tendon/brainstem/basal-ganglia/cerebellar/downstream maps;
- N11 tract/root/nerve/cord localization;
- O2–O7 force/displacement/anatomy/neurovascular relations;
- O9 structural stability tests;
- O10 perfusion/collapse imaging;
- O13–O16 structural destruction / radiology / tumor-pattern discrimination where Source provides figures.

Rule:

> Visual-required LG closure needs real original-Source visual contact. A text prompt may orient or test retrieval but cannot certify never-seen spatial evidence.

Current O1–O5 repository visual-source gaps remain live. Phase 3 will mark visual-dependent groups but cannot close that Source debt.

## 5｜Precision / conflict control

Precision is shown only when it changes a 306 judgment or owns a current Source distinction.

High-density precision clusters are expected in:

- N1 fiber classification / tract patterns;
- N3 receptor-organ effects;
- N4 force curves/channel locations;
- N6 visual optics/field/pathway;
- N8 motor-control comparisons;
- N10 cortical/hypothalamic localization;
- O2 fracture/open-injury/healing definitions;
- O4 root levels;
- O5 named peripheral nerves;
- O6/O7 regional fracture pairing;
- O12 age/angle/treatment windows;
- O13–O16 diagnostic/treatment Source precision.

Source conflicts are **not** Precision facts to memorize as reconciled truth. They remain explicitly conflicting and must surface only when relevant.

## 6｜Repair return

Wrong / Uncertain evidence in D should route to the smallest failed object:

```text
wrong layer / mechanism
→ one LG repair

spatial relation never formed
→ original visual Source return

precision unstable but model intact
→ Precision recall / Memory

cross-System baseline missing
→ smallest-sufficient external-owner / Chat repair

source wording conflict
→ source-context check, not medical-prior overwrite
```

After repair, return to the interrupted D Block. Do not expand a future Block simply because it is related.

## 7｜Phase-2 verdict

```text
27 / 27 Block control                         PASS
Block medical identity                        PRESERVE
Source-contact mode                           EXPLICIT PER BLOCK
Integration-primary N11 / O1                  PRESERVE
visual-dependent closure                       EXPLICIT
cross-Block Primary duplication                REJECT
external-owner duplication                     REJECT
Source-conflict silent resolution              REJECT
next stage                                    exact 356-KP Logic-Group partition
```
