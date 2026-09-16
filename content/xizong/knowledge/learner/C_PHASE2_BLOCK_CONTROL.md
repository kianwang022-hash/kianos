# C Hematology · Immunity · Infection — Phase 2 Block Control

Status: **PASS — 27/27 Blocks controlled for exact Logic-Group review**  
Depends on: `C_PHASE0_LEARNING_CALIBRATION.md`, `C_PHASE1_ROUTE_DECISION.md`  
Medical identity: **27 Blocks / 423 stable KPs unchanged**

## 1｜Purpose

This phase determines, for every C Block, what the learner is trying to form, what must remain continuous, where the Block must stop, and what type of local closure is needed before exact KP→Logic-Group partition.

It does **not** yet freeze exact KP membership or final Logic Group count.

## 2｜Global Block-control rules

1. One Block remains one coherent medical problem; no Block split/merge for learning convenience.
2. One Logic Group should close one learner question, not one Markdown section or a fixed KP quota.
3. Whole-LG original Lecture contact is preferred over KP-by-KP app switching.
4. Source conflicts, historical terms and visual gates stay visible as conditional context; they do not become extra Logic Groups by themselves.
5. Precision-only detail may live inside the owning group or selective Precision surface; do not create a group whose only job is “miscellaneous numbers”.
6. Cross-System material is Recall / Apply / explicit deferred owner, not duplicated Primary.
7. Block Recall compresses the final Block model; it must not become a replay of all group labels.

## 3｜27-Block control table

The “LG shape” count is a fresh partition hypothesis to constrain Phase 3. It is **not a quota**; Phase 3 may change it when exact KP semantics demand.

| Block | KP | First-pass learner target | Stop-line | Phase-3 LG shape |
| --- | ---: | --- | --- | ---: |
| H1 | 13 | build blood-production life cycle + five evidence layers so later disease starts from localization | no full anemia/hemolysis/leukemia/immune disease; normal hemostasis only recall | ~5 |
| H2 | 15 | reason from antigen/antibody direction → compatibility → minimal component → reaction | no full transplant immunology; no external transfusion-guideline replacement | ~5 |
| H3 | 18 | localize anemia by MCV×Ret, then use iron/B12/folate evidence without confusing morphology with cause | no H4/H5 full disease; no repeat of B metabolic pathways | ~4 |
| H4 | 14 | recognize global marrow production failure and distinguish it from infiltration/dysplasia/nutrient failure | no full MDS/leukemia; transplant/IST detail only Current Source precision | ~3 |
| H5 | 16 | localize hemolysis as intravascular/extravascular + intrinsic/extrinsic and read evidence as a stack | no full RBC biochemistry; do not turn every hereditary cause into a separate mini-course | ~4 |
| H6 | 18 | first localize the failed hemostatic layer, then build ITP as a concrete platelet-destruction/production model | normal hemostasis remains A1 recall; no full vWD/hemophilia/DIC curriculum beyond Source boundary | ~4 |
| H7 | 13 | move from clone/dysplasia language to MDS identity, risk and transformation boundary | no H9/H10/H11 subtype detail; molecular foundation remains B/O9 recall | ~3 |
| H8 | 16 | connect plasma-cell clone → monoclonal protein → marrow/bone/renal/immune consequences → evidence | no orthopedic/renal specialty management duplication | ~3 |
| H9 | 29 | identify acute leukemia, determine lineage/subtype with layered evidence, then surface urgent APL/leukostasis/TLS exits | no modern WHO/ICC expansion or external treatment guideline overwrite | ~5 |
| H10 | 10 | connect BCR-ABL clone to mature granulocytic expansion and phase transition | do not re-teach acute leukemia; treatment remains Current Source precision | ~3 |
| H11 | 32 | distinguish node/tissue lymphoma patterns, representative entities, stage/prognosis and evidence without marker-list learning | no complete immunology or modern lymphoma guideline expansion | ~5 |
| H12 | 12 | establish only the minimum immune dictionary needed to distinguish effector direction and I–IV hypersensitivity | no complete complement, antigen-presentation, cytokine or lymphocyte-development curriculum | ~3 |
| H13 | 13 | localize which defense layer is missing, then place HIV/CD4 loss and opportunistic consequences in that map | no full ART regimen / infectious-disease curriculum | ~3 |
| H14 | 12 | decide who attacks whom and when; separate rejection timing/morphology from GVHD direction | no transplant-medicine guideline expansion | ~3 |
| H15 | 15 | enter rheumatology through syndrome/organ combination, then assign evidence and drug roles | do not pre-teach H16–H19 full diseases | ~3 |
| H16 | 21 | build SLE as immune-complex + cytotoxic blood branch + APS thrombotic branch, then map antibody roles and organs | no full lupus-nephritis/obstetric/anticoagulation specialty pathway | ~4 |
| H17 | 20 | connect synovitis → pannus → irreversible joint destruction, then use clinical/imaging/evidence to justify early disease modification | orthopedic reconstruction and external biologic guidelines are downstream/out of Source | ~4 |
| H18 | 12 | connect exocrine-gland immune infiltration to dryness, testing and extra-gland/NHL risk | no generic sicca differential encyclopedia | ~3 |
| H19 | 18 | localize by vessel size + organ combination, then use ANCA/pathology/angiography as role-specific evidence | no complete vasculitis guideline catalogue | ~4 |
| H20 | 13 | reason infection by pathogen–site–host–reaction–source-control before naming organisms | no complete microbiology/pharmacology/infectious-disease course | ~3 |
| H21 | 13 | integrate TB common pathology, primary/secondary/disseminated patterns and cross-organ routing | pulmonary/renal/GI/orthopedic treatment stays with owning Systems | ~3 |
| H22 | 10 | distinguish meningeal vs parenchymal infection by site and pathology | detailed neurology treatment/localization stays with D | ~3 |
| H23 | 17 | distinguish typhoid/dysentery and infectious ulcer morphology, then compare with noninfectious GI owners | no second digestive curriculum; malaria remains only explicit supporting gap bridge | ~3 |
| H24 | 17 | compare granulomatous/parasitic pathology, syphilis stages and STI morphology/interfaces | reproductive management stays with E; no full STI treatment curriculum | ~3 |
| H25 | 16 | map superficial/deep local infection to anatomic space, persistent source and drainage/debridement need | no complete antimicrobial course; hand anatomy only to the decision depth required | ~4 |
| H26 | 9 | recognize systemic deterioration and run pathogen/culture + source + perfusion actions in parallel | preserve historical Source terminology; no silent SOFA/qSOFA/lactate/pressor guideline import | ~3 |
| H27 | 11 | distinguish toxin-mediated disinhibition from clostridial muscle necrosis and connect each to urgent prevention/source control | neural detail stays with D; no full toxin pharmacology expansion | ~3 |

Preliminary total if these shapes survive exact review: about **96 Logic Groups**. This is a planning estimate only and is not an acceptance target.

## 4｜Block-specific partition principles

### H1–H6｜Do not group by physiology vs internal medicine file source

The learner needs diagnostic continuity:

```text
normal production / readout
→ abnormal localization
→ disease evidence
```

So Source-file boundaries must not create artificial group boundaries. H1, H3, H5 and H6 in particular should group by localization task and causal relation, not by which lecture supplied the fact.

### H7–H11｜Evidence layers must stay distinguishable

Clonal disease groups should preserve the distinction between:

- clone / lineage / maturation identity;
- morphology / cytochemistry;
- immunophenotype;
- genetics;
- organ/tissue behavior;
- urgency / prognosis / Source treatment precision.

No group may imply that one marker is sufficient to own the diagnosis.

### H12–H19｜Avoid antibody-list grouping

Immune/rheumatic groups should be organized around:

```text
mechanism / effector direction
→ syndrome / organ pattern
→ evidence role
→ decision / treatment role
```

A “list of antibodies” group is acceptable only when the cognitive task is explicitly to distinguish what each antibody means; otherwise it is rote taxonomy and should be folded into the disease model.

### H20–H27｜Anatomy and source control outrank organism lists

Infection groups should preserve:

```text
site / space
+ host
+ tissue response
+ persistent source
→ spread / systemic danger
→ action
```

Organism names are evidence/precision inside that model unless the Current Source makes the organism itself the decisive discriminant.

## 5｜Logic-Group closure styles

Phase 3 should choose closure by cognition rather than boilerplate.

Examples:

- `LOCALIZATION`: given a small evidence set, identify the failed layer and next discriminating check.
- `CAUSAL_CHAIN`: reconstruct trigger → mechanism → phenotype and predict a change.
- `EVIDENCE_STACK`: explain what each evidence layer adds and which cannot substitute for another.
- `DISCRIMINATION`: separate 2–4 confusable patterns using decisive conditions.
- `DIRECTION_TIMING`: state attacker, target, mechanism and time relation.
- `SYNDROME_ORGAN_MAP`: reconstruct organ pattern from one upstream disease model.
- `SOURCE_CONTROL`: identify why drug-only therapy is insufficient and what source action changes the system.
- `URGENT_PARALLEL_ACTION`: run simultaneous lines without letting etiologic precision delay immediate danger control.

Generic closure such as “can explain the above” is not acceptable.

## 6｜Phase-2 verdict

```text
27/27 Blocks reviewed for learning control      PASS
423 KP medical identity                         FROZEN
uniform Logic-Group size                        REJECT
provisional Logic-Group shape                   ~96 / NOT A QUOTA
Block stop-lines                                EXPLICIT
cross-System duplication                        FORBIDDEN
next stage                                      exact KP→Logic-Group semantic partition
```
