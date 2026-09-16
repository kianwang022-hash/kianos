# C Hematology · Immunity · Infection — Phase 1 Route Decision

Status: **PASS — C causal readiness route accepted for Logic-Group construction**  
Depends on: `C_PHASE0_LEARNING_CALIBRATION.md` + Current C `system.json` + H1–H27 medical Core  
Learner Truth: none

## 1｜Decision

C uses:

> **CAUSAL READINESS DAG WITH A LOW-SWITCHING DEFAULT ROUTE**

The readiness graph defines what may legally move earlier. The default route is only a low-friction learner path; it does not turn every preceding Block into a prerequisite.

Default first-pass route:

```text
H1 → H2 → H3 → H4 → H5 → H6
→ H7 → H8 → H9 → H10 → H11
→ H12 → H13 → H14
→ H15 → H16 → H17 → H18 → H19
→ H20 → H21 → H22 → H23 → H24
→ H25 → H26 → H27
```

Why this serial-looking default is acceptable here:

- the hard dependency graph is much simpler than B;
- each branch is source-contiguous and semantically coherent;
- frequent branch switching would cost more than it gains;
- the route moves from blood readout → blood disease → clonal disease → immune/rheumatic disease → infection, which matches increasing dependence on the diagnostic language established upstream;
- flexibility is preserved when a Block's true requirements are already satisfied.

## 2｜Hard prerequisite vs benefit

A prerequisite is hard only when entering the Block without it would break the learner model. Similarity, prior file order and useful comparison are not hard prerequisites.

| Block | Hard requires | Benefits from / reactivates | Returns to / prepares |
| --- | --- | --- | --- |
| H1 | none inside C | A1 normal hemostasis recall; A2 O2 transport; A3 EPO; B RBC metabolism | H2–H7 and all later CBC/marrow reasoning |
| H2 | H1 | A3 electrolyte/acid-base; A1 shock/volume | H14 alloimmunity; transfusion support across hematology |
| H3 | H1 | B iron/B12/folate + one-carbon; A3 EPO; A2 O2 delivery | H4/H5; anemia interface across later Blocks |
| H4 | H1 + H3 | H2 transfusion support | marrow-failure contrast with H7/H9 |
| H5 | H1 + H3 | B heme/bilirubin/RBC metabolism; H2 transfusion direction | H6/H12/H16 immune destruction interfaces |
| H6 | H1 + A1 normal-hemostasis recall | H2/H4/H5 comparisons | H9 APL/DIC interface; bleeding localization generally |
| H7 | H1 + B/O9 tumor-molecular baseline | H4 marrow-failure contrast | H8–H11 clonal branch |
| H8 | H7 | H1 marrow language; A3 overflow-protein/renal interface | plasma-cell disease integration |
| H9 | H7 | H1; H6 DIC; B nucleotide/molecular baseline | H10/H11 and acute-leukemia emergency language |
| H10 | H7 | H9 acute-leukemia contrast | H11 / clonal reconstruction |
| H11 | H7 | H8/H9/H10 evidence language; H12 immune identity later | lymphoid-tissue / immune / tumor interface |
| H12 | minimum inflammation baseline | H1 WBC/B-cell/T-cell identity; H2/H5/H6 antibody-mediated examples | H13–H19 and infection-host language |
| H13 | H12 | H11 lymphoma interface; A2 opportunity-infection/TB | H20/H21 immune-host infection reasoning |
| H14 | H12 + H2 | transplant / transfusion examples | alloimmune direction model |
| H15 | H12 | H13/H14 boundaries | H16–H19 rheumatology branch |
| H16 | H12 + H15 | A3 glomerular model; A1 thrombosis | SLE/APS multi-organ integration |
| H17 | H12 + H15 | D future orthopedic boundary | RA integration |
| H18 | H12 + H15 | H11 lymphoma interface; A3 RTA interface | Sjögren integration |
| H19 | H12 + H15 | A3 RPGN/ANCA interface | vasculitis integration |
| H20 | H12 + H13 + inflammation baseline | organ-specific infection owners | H21–H27 common infection language |
| H21 | H20 + A2 R7 TB owner | H13 immune-deficiency host; A3/B organ TB owners | cross-organ TB integration only |
| H22 | H20 | D future neuro anatomy/pathology | CNS infection pathology handoff |
| H23 | H20 | B digestive ulcer/IBD comparison | infectious intestinal morphology |
| H24 | H20 + H12 | H21 granuloma comparison; E future STI owner | schistosoma/STI pathology interfaces |
| H25 | H20 | H13 immune-deficient host | H26/H27 source-control / urgent infection branch |
| H26 | H20 + H25 + A1 shock/perfusion | A2 respiratory failure; A3 AKI | infection-source-perfusion parallel response |
| H27 | H20 + H25 | D future neural inhibition / muscle contraction | toxin vs necrotizing infection discrimination |

## 3｜Readiness graph

```text
H1
├─ H2 ───────────────→ H14
├─ H3 → H4
│     └→ H5 ────────→ H12 / H16 interfaces
├─ H6
└─ [B/O9 tumor baseline] → H7
                          ├→ H8
                          ├→ H9 → H10
                          └────────→ H11

H12
├→ H13 ──────────────→ H20
├→ H14
└→ H15
    ├→ H16
    ├→ H17
    ├→ H18
    └→ H19

H20
├→ H21
├→ H22
├→ H23
├→ H24
└→ H25 → H26
        └→ H27
```

External inputs are interfaces, not hidden new C Blocks.

## 4｜What may move earlier

The following flexibility is legal when it materially improves source continuity:

- H2 may be postponed after H6 if the learner wants one uninterrupted anemia/bleeding branch; it is not required for H3–H6.
- H7 clonal hematology may begin once H1 and the B/O9 tumor baseline are genuinely available; H2–H6 are not all hard prerequisites.
- H12 may begin after its minimum inflammation / cell-identity inputs are available; finishing the whole clonal branch is not a hard prerequisite.
- H15 may begin after H12; H13/H14 are neighboring immune branches, not mandatory precursors.
- H21–H24 may reorder after H20 when the relevant external organ-owner background is available.
- H26 and H27 require the source-control language from H25; their exact order may swap if source continuity warrants, though H26 first is the default because it closes the systemic-danger path.

Flex must not change Block/KP identity or create a new curriculum order owner outside this Learning artifact.

## 5｜Four non-gating partial-System reconstructions

These are short compression checkpoints only. They create no new canonical hierarchy, completion state, mastery score or Memory debt.

### PSR-C1｜Blood localization

After H1–H6:

```text
blood-cell abnormality
→ which lineage?
→ production/maturation vs peripheral loss/destruction/distribution?
→ quantity vs function?
→ bleeding: platelet/vascular vs coagulation vs consumption/fibrinolysis?
→ which evidence layer changes the next action?
```

Closure: the learner can route anemia, pancytopenia, hemolysis and bleeding into the correct next model without naming diseases from one isolated test.

### PSR-C2｜Clonal hematology

After H7–H11:

```text
clone + lineage + maturation stage
→ marrow/peripheral pattern
→ morphology/cytochemistry/immunophenotype/genetics
→ organ infiltration / protein / node architecture
→ urgent subtype or complication
```

Closure: the learner does not treat WBC count, one CD marker or one chromosome as the whole diagnosis.

### PSR-C3｜Immune / rheumatology

After H12–H19:

```text
insufficient defense vs self-directed injury vs alloimmune direction
→ effector mechanism
→ target / organ combination
→ evidence role
→ treatment role / current danger
```

Closure: a positive antibody is interpreted by role and organ context rather than used as a standalone disease label.

### PSR-C4｜Infection

After H20–H27:

```text
pathogen / exposure
→ anatomical site / source
→ host defense
→ tissue reaction / spread
→ source control
→ systemic/perfusion/organ threat
```

Closure: infection is localized as a host–pathogen–space problem and organ-specific treatment is returned to the owning System rather than duplicated inside C.

## 6｜Final System reconstruction

Authorized only after all 27 Blocks are actually learned in private learner state.

Prompt skeleton:

1. Rebuild the production–update and blood-readout model.
2. From a blood-count abnormality, choose production/maturation vs destruction/loss/distribution vs clone vs function.
3. Rebuild the immune decision: insufficient defense vs self-directed injury vs alloimmune direction.
4. Rebuild the infection decision: pathogen–site–host–reaction–source control.
5. Use Current C failure modes and judgment axes to localize the first failure and current danger before reopening a Block for 306 Source precision.

Forbidden:

- reciting 27 Block titles as System Recall;
- treating default route as medical ontology;
- using question order as learner order;
- importing missing immunology/infectious-disease content to make the reconstruction look complete.

## 7｜Phase-1 verdict

```text
route mode                         CAUSAL_READINESS_DAG_WITH_LOW_SWITCHING_DEFAULT
stable default                     H1 → ... → H27
hard prerequisites                 REDUCED_TO_TRUE_MODEL_DEPENDENCIES
file-order-as-prerequisite          REJECT
branch flexibility                 ACCEPT
partial-System checkpoints          4 / NON_GATING
next stage                         27-Block control → exact Logic Group partition
```
