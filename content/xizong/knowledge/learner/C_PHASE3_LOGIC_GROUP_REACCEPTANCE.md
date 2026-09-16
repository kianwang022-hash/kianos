# C Hematology · Immunity · Infection — Phase 3 Logic-Group Re-acceptance

Status: **IN PROGRESS — H1–H6 exact semantic partition accepted**  
Scope accepted in this checkpoint: **6 / 27 Blocks, 94 / 423 stable KPs, 31 Logic Groups**  
Medical identity change: **NONE**  
Question mapping change: **NONE**  
Learner Truth: **NONE**

Depends on:

- `C_PHASE0_LEARNING_CALIBRATION.md`
- `C_PHASE1_ROUTE_DECISION.md`
- `C_PHASE2_BLOCK_CONTROL.md`
- Current C `system.json`
- canonical H1–H27 Block Markdown

## 1｜Acceptance rule

Every accepted Logic Group must satisfy all of the following:

1. own one local learner question / cognitive job;
2. include only stable KPs already owned by the canonical Block;
3. cover each KP exactly once inside that Block;
4. preserve Source conflicts / boundaries rather than smoothing them away;
5. avoid grouping by equal KP count, Markdown section count, page count or question taxonomy;
6. have a cognition-specific closure rather than generic “can explain” language;
7. support one coherent original-Lecture contact before retrieval where practical;
8. permit learner order to differ from stable KP order only when that improves cognition without changing identity.

This checkpoint explicitly falsifies the Phase-2 planning estimate. H1/H2/H3 require more groups than the rough shape because exact semantic review found real task boundaries. **No target count is being defended.**

---

# 2｜H1 — 造血、CBC、Ret与骨髓诊断语言

Stable KP coverage: **13 / 13**  
Accepted Logic Groups: **6**

The Block Framework still gives the diagnostic map at entry. Formal retrieval of KP01 is deliberately delayed into the final diagnostic-integration group with KP12–13; otherwise KP01 becomes empty taxonomy before the learner has built the blood-cell/readout substrate.

## C-H01-LG01｜RBC结构与物理行为

- **KP:** 02–03
- **Cognitive job:** `CAUSAL_CHAIN + DISCRIMINATION`
- **Goal:** connect RBC construction and biconcave geometry to deformability, rouleaux/ESR and osmotic fragility without treating those three readouts as interchangeable.
- **Closure:** given a change in cell shape, plasma composition or extracellular tonicity, predict which of deformability / ESR / osmotic fragility should change and state which object each readout is actually observing.
- **Continuity rationale:** KP02–03 form one physical model. H1-SC01 remains live: hereditary-spherocytosis ESR direction is not silently resolved.

## C-H01-LG02｜红系生产—成熟—清除闭环

- **KP:** 04–06
- **Cognitive job:** `CAUSAL_CHAIN`
- **Goal:** reconstruct low-O2 → HIF/EPO → erythroid maturation/Ret → mature RBC lifetime → extravascular/intravascular clearance as one production–turnover loop.
- **Closure:** from anemia/low oxygen plus Ret and destruction clues, explain whether the marrow is being stimulated, whether delivery is occurring, and where normal/abnormal turnover evidence would appear.
- **Continuity rationale:** EPO, Ret and RBC clearance answer one lifecycle question and should be learned as one chain rather than three fact islands.

## C-H01-LG03｜WBC数量：池子移动还是实际生产变化

- **KP:** 07
- **Cognitive job:** `LOCALIZATION`
- **Goal:** distinguish circulation-pool redistribution from marrow production and preserve only the minimum monocyte/macrophage and T/B identity needed by later C Blocks.
- **Closure:** when peripheral neutrophils or leukocyte proportions change, state why a count change does not automatically prove immediate marrow overproduction and name the later owner when immune detail is required.
- **Continuity rationale:** this is a genuine standalone learner problem; merging it with platelet biology would create a mixed-task group merely to avoid a singleton.

## C-H01-LG04｜巨核—血小板身份与五动作 Recall

- **KP:** 08–09
- **Cognitive job:** `CAUSAL_CHAIN + BOUNDARY_RECALL`
- **Goal:** connect megakaryocyte origin to platelet identity and recall adhesion–aggregation–release–contraction–procoagulant-surface actions without reopening normal hemostasis as a second Primary.
- **Closure:** from endothelial injury, reconstruct the platelet action sequence and correctly route full coagulation/anticoagulation/fibrinolysis back to A1 rather than expanding H1.
- **Continuity rationale:** KP08 gives the product identity and KP09 gives what that product does; they are inseparable for later ITP/bleeding reasoning.

## C-H01-LG05｜血液作为流体内环境

- **KP:** 10–11
- **Cognitive job:** `DISCRIMINATION + BOUNDARY_RECALL`
- **Goal:** distinguish Hct/viscosity, crystalloid vs colloid osmotic pressure and pH as different properties of blood, while routing full hemodynamics/water-acid-base models to their owning Systems.
- **Closure:** given a change in Hct, plasma protein, electrolyte or ventilation/renal handling, identify which blood variable is directly affected and what must be reopened outside H1 for the complete mechanism.
- **Continuity rationale:** these are the blood-environment properties remaining after cell-specific biology; they share a “what physical property is this measuring?” discrimination task.

## C-H01-LG06｜五层证据与最终故障树

- **KP:** 01, 12–13
- **Cognitive job:** `EVIDENCE_STACK + LOCALIZATION`
- **Goal:** integrate lineage identity with CBC → Ret → smear → marrow aspirate → biopsy and route single-/multi-lineage abnormalities to production, maturation, loss/destruction, distribution, clone or structural marrow failure.
- **Closure:** from an unfamiliar CBC/Ret/smear pattern, choose the next evidence layer, explain what it can add that the prior layer cannot, and route the case to H3/H4/H5/H6/H7–H11 without prematurely naming a disease.
- **Continuity rationale:** KP01 is a useful Block-entry orientation but its *retrieval* becomes meaningful only after the physical/cellular substrate exists; KP12–13 complete the same diagnostic question.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05 → LG06`, with Block Framework orientation before LG01.  
**Coverage:** `{1..13}` exactly once.

---

# 3｜H2 — 血型、交叉配血与成分输血

Stable KP coverage: **15 / 15**  
Accepted Logic Groups: **6**

## C-H02-LG01｜ABO身份：抗原、抗体、H/A1/A2与遗传

- **KP:** 01–05
- **Cognitive job:** `DIRECTION_TIMING + DISCRIMINATION`
- **Goal:** build the ABO object model from RBC antigen vs plasma antibody, H precursor, A1/A2 precision, IgM/IgG identity and inheritance.
- **Closure:** given donor/recipient ABO phenotype or a variant clue, state which antigen/antibody direction creates risk and avoid using “O万能” or one table cell without checking the actual component/direction.
- **Continuity rationale:** these five KPs answer “what is carried on the cell, what is in plasma, and why?” before transfusion decisions begin.

## C-H02-LG02｜Rh致敏：第一次暴露与后续风险

- **KP:** 06
- **Cognitive job:** `DIRECTION_TIMING`
- **Goal:** distinguish Rh/D from naturally occurring ABO antibodies and preserve the sensitization/time sequence.
- **Closure:** explain why a first D exposure and a later exposure have different risk, including the maternal–fetal interface, while keeping H2-SC01 explicit rather than inventing a rule that Rh-negative donors inherently carry anti-D.
- **Continuity rationale:** Rh sensitization is a separate time-dependent mechanism; forcing it into ABO or product-choice groups would blur the key difference.

## C-H02-LG03｜输什么、输多少、怎样判相容

- **KP:** 07–10
- **Cognitive job:** `DECISION_LOCALIZATION + DIRECTION_TIMING`
- **Goal:** choose the minimum necessary blood component and amount, then apply crossmatch direction and Source-specific loss thresholds.
- **Closure:** from anemia/hemorrhage/coagulation-factor deficiency and a donor–recipient pairing, first identify the missing function, then choose component/amount and state why major crossmatch compatibility outranks “universal donor/recipient” labels.
- **Continuity rationale:** transfusion principles, crossmatch, blood-loss scale and component selection are one decision workflow. H2-SC02/H2-SC03 remain explicit boundaries.

## C-H02-LG04｜输血反应第一分流

- **KP:** 11–13
- **Cognitive job:** `DISCRIMINATION + URGENT_PARALLEL_ACTION`
- **Goal:** distinguish febrile, hemolytic, allergic, volume-overload and GVHD directions from timing/sign patterns, then connect the reaction to its target/attacker.
- **Closure:** given a post-transfusion symptom cluster, identify the leading reaction, name the key evidence that separates it from close alternatives, and state the immediate Source-bounded response direction without turning the Block into a bedside transfusion guideline.
- **Continuity rationale:** KP11 is the comparison map; KP12–13 supply the major branches.

## C-H02-LG05｜大量输血的成分性负担

- **KP:** 14
- **Cognitive job:** `CAUSAL_CHAIN + PRECISION_CLUSTER`
- **Goal:** tie citrate, stored-RBC potassium, temperature and dilution/consumption to alkalosis, hyperkalemia, hypocalcemia, hypothermia and coagulopathy.
- **Closure:** from a massive-transfusion complication, trace it back to the responsible blood-product property and route full electrolyte/acid-base treatment back to A3.
- **Continuity rationale:** this is one dense mechanism cluster and should not be diluted by unrelated autologous-transfusion rules.

## C-H02-LG06｜自体输血的来源与安全边界

- **KP:** 15
- **Cognitive job:** `DECISION_LOCALIZATION + PRECISION_CLUSTER`
- **Goal:** distinguish salvage, hemodilution and predonation by where the blood comes from and when contamination makes salvage unsafe.
- **Closure:** given a surgical/trauma scenario, identify whether an autologous route is Source-supported and which contamination/time boundary rules it out.
- **Continuity rationale:** self-donation is a separate source-selection problem; a singleton LG is justified rather than making a mixed “miscellaneous transfusion” group.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05 → LG06`.  
**Coverage:** `{1..15}` exactly once.

---

# 4｜H3 — 贫血总坐标、缺铁与巨幼细胞性贫血

Stable KP coverage: **18 / 18**  
Accepted Logic Groups: **5**

## C-H03-LG01｜贫血起手式：Hb → MCV → Ret

- **KP:** 01–06
- **Cognitive job:** `LOCALIZATION + EVIDENCE_STACK`
- **Goal:** separate “is there anemia / how severe?” from “what size are cells?” and “is marrow response appropriate?”, then place common hypoxic compensation after localization.
- **Closure:** from Hb/MCV/Ret and a short clinical context, route the case to production/maturation vs loss/destruction and select the next evidence family without equating MCV with diagnosis.
- **Continuity rationale:** KP01–06 together create the coordinate system. Splitting MCV and Ret into separate groups would destroy the actual diagnostic task.

## C-H03-LG02｜IDA：从漏铁到空仓库再到成品不足

- **KP:** 07–11
- **Cognitive job:** `CAUSAL_CHAIN + EVIDENCE_STACK`
- **Goal:** connect chronic loss/need/absorption, iron transport-storage identities, tissue iron deficiency, three-stage laboratory evolution and treatment-response timeline.
- **Closure:** given symptoms plus iron studies before or after therapy, state where the patient is on the loss → storage depletion → functional iron deficit → Hb decline / recovery sequence and why Ret can improve before Hb/storage.
- **Continuity rationale:** these KPs tell one disease story; separating “treatment” from the time-course would remove the reversal evidence that proves the model.

## C-H03-LG03｜小细胞贫血：真缺铁 vs 锁铁 vs 利用失败 vs 珠蛋白问题

- **KP:** 12–13
- **Cognitive job:** `DISCRIMINATION`
- **Goal:** use SI/TS/SF/TIBC/marrow-iron directions and hepcidin to separate IDA, ACD, sideroblastic anemia and thalassemia at the level supported by Current Source.
- **Closure:** reconstruct the iron-profile direction for the four patterns and explain the upstream failure rather than memorizing a table row.
- **Continuity rationale:** KP12 supplies the comparison; KP13 explains the hardest confusable pattern (ACD) causally.

## C-H03-LG04｜巨幼：DNA成熟失败与B12安全边界

- **KP:** 14–16
- **Cognitive job:** `CAUSAL_CHAIN + DISCRIMINATION`
- **Goal:** connect B12/folate-related DNA synthesis failure to nuclear–cytoplasmic asynchrony, trace the B12 absorption chain, and preserve the neurologic-risk distinction.
- **Closure:** from macrocytosis plus gastric/pancreatic/ileal or neurologic clues, locate the likely failure in the B12/folate branch and state why folate-only correction cannot be treated as proof that B12 risk is absent.
- **Continuity rationale:** mechanism, absorption and B12-vs-folate discrimination form one coherent macrocytic-anemia problem. H3-SB01 remains live.

## C-H03-LG05｜范围/形态线索与最终贫血算法

- **KP:** 17–18
- **Cognitive job:** `RECOGNITION + LOCALIZATION`
- **Goal:** use pancytopenia and RBC morphology only as routing clues, then re-run Hb → MCV → Ret → specific evidence to avoid morphology-only diagnosis.
- **Closure:** from an unfamiliar anemia with a smear or multi-lineage abnormality, explain what the morphology/range can and cannot prove and route to H4/H5/H7–H11 or an external owner as appropriate.
- **Continuity rationale:** KP17 deliberately downgrades morphology to evidence; KP18 prevents it from hijacking the core algorithm. H3-SC01 remains explicit.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05`.  
**Coverage:** `{1..18}` exactly once.

---

# 5｜H4 — 再生障碍性贫血

Stable KP coverage: **14 / 14**  
Accepted Logic Groups: **4**

## C-H04-LG01｜骨髓工厂为什么整体停摆

- **KP:** 01–04
- **Cognitive job:** `CAUSAL_CHAIN`
- **Goal:** connect AA identity, Source-listed causes and seed–soil–immune suppression to three-line output failure and its time pattern.
- **Closure:** from a suspected AA case, explain why the three lineages fall together, why platelets can become the earliest/most fragile output and why the model is production failure rather than peripheral consumption.
- **Continuity rationale:** KP01–04 are the disease’s upstream causal model; cause and mechanism should not be separated from the output they create.

## C-H04-LG02｜外周 + 多部位骨髓：证明低增生

- **KP:** 05–08
- **Cognitive job:** `EVIDENCE_STACK + DISCRIMINATION`
- **Goal:** combine Ret/MCV/NAP/negative hepatosplenomegaly with multi-site aspirate/biopsy and marrow morphology.
- **Closure:** choose which peripheral and marrow evidence is required to prove global low production, explain why a single active marrow site cannot overturn the whole pattern, and separate AA megakaryocytes from ITP/MDS directions.
- **Continuity rationale:** KP05–08 answer one evidentiary question: “how do I know the factory is globally low rather than merely seeing low cells in blood?”

## C-H04-LG03｜严重度与鉴别：先看风险指标，再分相邻病

- **KP:** 09–10
- **Cognitive job:** `DISCRIMINATION + PRECISION_CLUSTER`
- **Goal:** interpret Ret absolute count / ANC / Plt severity gates, then distinguish AA from MDS, leukemia, PNH and hypersplenism by marrow, morphology, hemolysis and organ findings.
- **Closure:** from pancytopenia plus marrow/Ret/organ data, determine whether the pattern meets Current Source severe/very-severe direction and name the single next discriminator that redirects a confusable case.
- **Continuity rationale:** severity and differential are the two decisions that immediately follow proof of AA identity.

## C-H04-LG04｜近期危险与四层治疗角色

- **KP:** 11–14
- **Cognitive job:** `URGENT_PARALLEL_ACTION + DECISION_LOCALIZATION`
- **Goal:** prioritize infection/bleeding support, then distinguish HSCT, immunosuppression and hematopoietic stimulation by what layer each changes.
- **Closure:** from age/severity/infection/donor status and current ANC/Plt risk, choose the Source-supported treatment role and state why transfusion/support, growth stimulation, immune suppression and HSCT are not substitutes for one another.
- **Continuity rationale:** KP11–14 form one action hierarchy after diagnosis and severity are established.

**Learner order:** `LG01 → LG02 → LG03 → LG04`.  
**Coverage:** `{1..14}` exactly once.

---

# 6｜H5 — 溶血性贫血

Stable KP coverage: **16 / 16**  
Accepted Logic Groups: **5**

## C-H05-LG01｜先证明溶血，再定位破坏位置

- **KP:** 01–06
- **Cognitive job:** `EVIDENCE_STACK + LOCALIZATION`
- **Goal:** combine destruction evidence with marrow compensation, then distinguish intravascular, extravascular and intramedullary ineffective erythropoiesis.
- **Closure:** from anemia/Ret/bilirubin/haptoglobin/free-Hb/urine/spleen clues, prove whether hemolysis is actually present, identify the likely location and explain at least one common false jump (Ret high, jaundice, dark urine, fragments).
- **Continuity rationale:** these six KPs are the indispensable common diagnostic algorithm; disease names should not precede it.

## C-H05-LG02｜RBC自身缺陷：膜、酶、珠蛋白

- **KP:** 07–09
- **Cognitive job:** `DISCRIMINATION + CAUSAL_CHAIN`
- **Goal:** contrast hereditary spherocytosis, G6PD deficiency and thalassemia by the failed RBC property, morphology, destruction location and confirmatory evidence.
- **Closure:** given a family/trigger/smear/osmotic-fragility/enzyme/Hb-electrophoresis clue set, identify the failed intrinsic layer and state why a visually similar clue does not automatically prove one disease.
- **Continuity rationale:** these are the three major intrinsic-RBC failure types (membrane, enzyme, globin). H5-SC01 remains unresolved where Source conflicts.

## C-H05-LG03｜免疫性溶血：温抗体 vs 冷抗体

- **KP:** 10
- **Cognitive job:** `DISCRIMINATION + DIRECTION_TIMING`
- **Goal:** distinguish IgG/warm/extravascular from IgM/cold/intravascular direction and connect the difference to Coombs/cold-agglutinin evidence and treatment role.
- **Closure:** from temperature, antibody, smear and hemolysis-location clues, choose warm vs cold direction and explain why splenic removal logic differs.
- **Continuity rationale:** this is a complete standalone comparison problem; merging it into intrinsic RBC disorders would erase the external-immune attack distinction.

## C-H05-LG04｜PNH：从干细胞克隆到慢性血管内溶血

- **KP:** 11–14
- **Cognitive job:** `CAUSAL_CHAIN + EVIDENCE_STACK`
- **Goal:** connect acquired stem-cell/GPI-anchor failure → CD55/59 loss → complement hemolysis → clinical thrombosis/AA/iron-loss pattern → FLAER/flow evidence → treatment roles.
- **Closure:** reconstruct the full PNH chain from mechanism to test and treatment and explain why it is simultaneously an acquired intrinsic membrane defect, a chronic intravascular hemolysis and a marrow/clonal interface.
- **Continuity rationale:** mechanism, phenotype, test and treatment are one disease model and should not be learned as four separate lists.

## C-H05-LG05｜六病坐标与最终溶血算法

- **KP:** 15–16
- **Cognitive job:** `DISCRIMINATION + LOCALIZATION`
- **Goal:** compress representative hemolytic diseases onto identity/location/morphology/test/treatment axes and re-run the common algorithm before disease-specific testing.
- **Closure:** given a novel hemolysis vignette, localize first, then select the minimal confirmatory test rather than pattern-matching directly to one remembered disease row.
- **Continuity rationale:** KP15 is comparison compression; KP16 enforces the correct reasoning order.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05`.  
**Coverage:** `{1..16}` exactly once.

---

# 7｜H6 — 出血性疾病

Stable KP coverage: **18 / 18**  
Accepted Logic Groups: **5**

The Block-level Framework supplies the general bleeding localization before Lecture. The formal KP sequence remains Source-friendly: ITP is learned first from the Current Lecture, then the broader hemostatic discrimination is retrieved and finally recompressed in the case algorithm. This avoids forcing a page-hopping learner route merely because the conceptual overview appears first in KianOS.

## C-H06-LG01｜ITP：破坏 + 生成障碍的证据栈

- **KP:** 01–05
- **Cognitive job:** `EVIDENCE_STACK + DISCRIMINATION`
- **Goal:** connect immune destruction/production impairment to mucocutaneous phenotype, marrow megakaryocyte maturation pattern, peripheral tests and Evans boundary.
- **Closure:** from isolated thrombocytopenia ± anemia, distinguish ITP from marrow production failure and Evans using smear/marrow/coagulation/hemolysis evidence instead of “Plt low = ITP”.
- **Continuity rationale:** mechanism, phenotype, marrow and peripheral evidence jointly establish the ITP identity; Evans is the key boundary that tests whether the model generalizes.

## C-H06-LG02｜ITP当前危险与治疗层级

- **KP:** 06–09
- **Cognitive job:** `URGENT_PARALLEL_ACTION + DECISION_LOCALIZATION`
- **Goal:** identify emergency bleeding scenarios, then distinguish immediate platelet support, rapid immune suppression, first-line GC and second-line TPO/anti-CD20/splenectomy roles.
- **Closure:** from Plt, active-bleeding site and procedural/pregnancy context, state whether the case is urgent and choose the Source-supported treatment *role* without letting slow therapy substitute for immediate hemostasis.
- **Continuity rationale:** KP06–09 are one severity-to-action sequence. The vinca-drug naming conflict and route-of-administration Source gap remain explicit.

## C-H06-LG03｜出血定位：形态 + Plt/BT + PT/APTT/TT

- **KP:** 10–13
- **Cognitive job:** `LOCALIZATION + DISCRIMINATION`
- **Goal:** localize vascular/platelet/coagulation/fibrinolysis/combined abnormalities from bleeding pattern and first-line tests; use vWD vs hemophilia as a falsification case.
- **Closure:** given superficial/deep/delayed bleeding plus Plt/PT/APTT/TT, identify the failed hemostatic layer and explain why normal PT/APTT does not exclude ITP and isolated APTT prolongation does not automatically equal hemophilia.
- **Continuity rationale:** classification, phenotype, screening tests and one high-value comparison all answer the same first diagnostic question.

## C-H06-LG04｜扩展止血证据、纤溶/DIC与药物角色

- **KP:** 14–17
- **Cognitive job:** `EVIDENCE_STACK + PRECISION_CLUSTER`
- **Goal:** organize vascular/coagulation/anticoagulation/fibrinolysis panels, 3P/FDP/D-dimer, the minimum Source-supported DIC model and hemostatic-drug roles without creating a complete DIC curriculum.
- **Closure:** when first-line localization is insufficient, choose the relevant extended evidence family, state what a positive fibrinolysis marker does *not* prove, and explain why DIC can cause thrombosis and bleeding simultaneously.
- **Continuity rationale:** these KPs are the second-line evidence/action layer after basic localization; H6’s DIC boundary remains live.

## C-H06-LG05｜最终出血病例算法

- **KP:** 18
- **Cognitive job:** `LOCALIZATION + DISCRIMINATION`
- **Goal:** compress the entire Block into bleeding phenotype → CBC/Plt → first-line coagulation tests → targeted extended evidence → marrow/hemolysis/urgent action.
- **Closure:** solve a fresh bleeding vignette while explicitly rejecting at least two common shortcuts (purpura=ITP, low Plt=ITP, APTT↑=hemophilia, normal PT/APTT=no bleeding disorder, no splenomegaly=ITP).
- **Continuity rationale:** this singleton is the Block’s final execution algorithm and should not be diluted inside the extended-test group.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05`, with the Block Framework localization cue visible before LG01.  
**Coverage:** `{1..18}` exactly once.

---

# 8｜Checkpoint accounting

```text
Blocks reviewed                 6 / 27
Stable KPs reviewed             94 / 423
Accepted Logic Groups           31
KP omissions                    0
KP duplicate membership         0
Block/KP identity changes       0
Question-mapping changes        0
Source conflicts erased         0
Source boundaries expanded      0
uniform-quota corrections       H1/H2/H3 exceeded Phase-2 rough shape where semantics required
```

Per-Block accepted group counts:

```text
H1  13 KP → 6 LG
H2  15 KP → 6 LG
H3  18 KP → 5 LG
H4  14 KP → 4 LG
H5  16 KP → 5 LG
H6  18 KP → 5 LG
-----------------
    94 KP → 31 LG
```

## Next exact review batch

`H7–H11` — clonal hematology.

Challenge focus:

- prevent marker/classification lists from becoming Logic Groups;
- preserve morphology / cytochemistry / immunophenotype / genetics as distinct evidence roles;
- separate disease identity from Source-specific treatment precision;
- keep APL / leukostasis / tumor-lysis / other urgent exits visible without turning H9 into an emergency-medicine course;
- test whether H11’s 32 KPs really justify ~5 groups or require more.
