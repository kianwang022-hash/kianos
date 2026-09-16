# C Hematology · Immunity · Infection — Phase 3D Exact Logic Groups H15–H19

Status: **PASS — H15–H19 exact semantic partition accepted**  
Scope: **5 Blocks, 86 stable KPs, 25 Logic Groups**  
Cumulative: **19 / 27 Blocks, 317 / 423 KPs, 98 Logic Groups**  
Medical identity change: **NONE**  
Antibody-list-first grouping: **REJECTED**  
External guideline expansion: **0**

This receipt inherits Phase-3 acceptance rules. Rheumatology is organized as:

```text
syndrome / organ combination
→ evidence role
→ activity / damage localization
→ treatment role
```

Serology never becomes the disease ontology.

---

# H15 — 风湿诊断语言与治疗角色

Stable KP coverage: **15 / 15**  
Accepted Logic Groups: **5**

## C-H15-LG01｜从主诉组成综合征，再进疾病家族

- **KP:** 01–03
- **Cognitive job:** `LOCALIZATION + SYNDROME_ORGAN_MAP`
- **Goal:** use joint axis + systemic-organ axis + time axis to place a case into connective-tissue, spondyloarthritis, degenerative, crystal/metabolic or infection-related families before serology.
- **Closure:** given a joint/systemic complaint, describe the syndrome and disease-family direction without naming a disease from one antibody or one joint.
- **Continuity rationale:** identity, five families and three-axis entry are one routing problem.

## C-H15-LG02｜风湿证据四层：筛查、特异、活动、器官损害

- **KP:** 04–06
- **Cognitive job:** `EVIDENCE_STACK + DISCRIMINATION`
- **Goal:** assign ANA/RF, disease-specific antibodies, complement/ESR/CRP and organ tests to the question each can answer.
- **Closure:** for a positive ANA/RF or inflammatory marker, state what it supports, what it cannot prove and which organ-specific evidence must be added before changing the disease model.
- **Continuity rationale:** these KPs are one evidence-role hierarchy; marker names are subordinate to role.

## C-H15-LG03｜治疗四层：症状快不等于病程被控制

- **KP:** 07–10
- **Cognitive job:** `DECISION_LOCALIZATION + DISCRIMINATION`
- **Goal:** distinguish NSAID symptom relief, GC rapid suppression/bridge, conventional DMARD disease control and targeted/biologic disease control by role and speed.
- **Closure:** given active symptoms and organ severity, choose the required treatment *role* and explain why quick symptomatic improvement cannot substitute for disease-modifying control.
- **Continuity rationale:** KP07 provides the map; KP08–10 calibrate each role and speed.

## C-H15-LG04｜三个 bounded recognition models：认出来，但不扩成新课程

- **KP:** 11–13
- **Cognitive job:** `RECOGNITION + BOUNDARY_RECALL`
- **Goal:** recognize the Current Source high-signal entries for systemic sclerosis, inflammatory myopathy/dermatomyositis and gout, then stop at the explicit overview boundary.
- **Closure:** from a high-signal clue set (Raynaud/finger/ILD, Gottron/heliotrope/Jo-1, nocturnal first-MTP/tophus), route to the correct overview identity and state what full model is **not** owned here.
- **Continuity rationale:** these three are intentionally grouped as a “bounded recognition gate”: the shared learner question is whether an overview-level pattern is recognized without manufacturing three unsupported full subcourses.

## C-H15-LG05｜皮肤 / 器官线索与最终风湿路由

- **KP:** 14–15
- **Cognitive job:** `SYNDROME_ORGAN_MAP + LOCALIZATION`
- **Goal:** treat skin/mucosal clues as routing evidence only, then send the case to H16–H19 using organ combination + evidence role + activity/damage layer.
- **Closure:** solve a fresh multi-system rheumatology entry case and explain why the visible skin/antibody clue is insufficient by itself.
- **Continuity rationale:** KP14 supplies cross-disease visible clues; KP15 turns them into the Block exit algorithm.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05`.  
**Coverage:** `{1..15}` exactly once.

---

# H16 — SLE 与 APS

Stable KP coverage: **21 / 21**  
Accepted Logic Groups: **6**

## C-H16-LG01｜三条损伤支路：免疫复合物、抗细胞、APS

- **KP:** 01
- **Cognitive job:** `CAUSAL_CHAIN + SYNDROME_ORGAN_MAP`
- **Goal:** establish SLE as a three-branch model before any antibody list: immune-complex multi-organ injury, direct anti-cell cytopenia and antiphospholipid thrombosis.
- **Closure:** from an SLE manifestation, name which branch best explains it and why the same disease can express more than one immune-injury mechanism.
- **Continuity rationale:** singleton mother model; it must precede serology to prevent marker-first learning.

## C-H16-LG02｜SLE证据角色：筛查、特异、活动、器官关联

- **KP:** 02–05, 08–09
- **Cognitive job:** `EVIDENCE_STACK + DISCRIMINATION`
- **Goal:** place ANA, dsDNA, Sm, ENA, anti-cell antibodies, complement/inflammation and organ evidence into explicit roles rather than one “SLE antibody” bucket.
- **Closure:** given a panel, identify which result screens, which is most specific, which tracks activity/kidney, which explains a blood/organ manifestation and which results do not track activity.
- **Continuity rationale:** these six KPs answer one evidence-role question. H16-SC01 stays visible: the conflicting historical question answer is not silently corrected.

## C-H16-LG03｜APS：实验室名字反直觉，但临床主轴是血栓

- **KP:** 06–07
- **Cognitive job:** `DISCRIMINATION + CAUSAL_CHAIN`
- **Goal:** bind LA/aCL/anti-β2GPI to arterial/venous thrombosis, recurrent pregnancy loss and thrombocytopenia while rejecting the “anticoagulant name = bleeding disorder” shortcut.
- **Closure:** from thrombosis/pregnancy/platelet evidence, identify the APS branch and state the current Source boundary around formal criteria, long-term anticoagulation and obstetric management.
- **Continuity rationale:** antibody identity and clinical phenotype are one APS submodel.

## C-H16-LG04｜病理落点：小体/细胞、肾、皮肤、心脾血管

- **KP:** 10–13
- **Cognitive job:** `VISUAL_RECOGNITION + CAUSAL_CHAIN`
- **Goal:** connect immune injury to lupus body/cell, wire-loop kidney, lupus band/skin and Libman-Sacks/onion-skin spleen/fibrinoid vascular damage.
- **Closure:** from a pathology image/description, identify the organ/pathologic anchor and reconnect it to the correct upstream SLE branch without expanding full nephrology/cardiology.
- **Continuity rationale:** these are the major pathology anchors that make the abstract immune model visible.

## C-H16-LG05｜临床多器官模型：皮黏—浆膜/关节—血液—肾/神经

- **KP:** 14–18
- **Cognitive job:** `SYNDROME_ORGAN_MAP + DISCRIMINATION`
- **Goal:** reconstruct the SLE clinical combination, distinguish Jaccoud from RA erosive disease, separate cytopenia mechanisms and use renal/neuro clues as high-risk exits.
- **Closure:** from a multi-organ vignette, build the organ combination first, then use the serologic evidence stack to close the diagnosis instead of using ANA alone.
- **Continuity rationale:** five KPs form the clinical phenotype and diagnostic order.

## C-H16-LG06｜治疗 / 危象 / SLE-vs-APS danger routing

- **KP:** 19–21
- **Cognitive job:** `URGENT_PARALLEL_ACTION + DECISION_LOCALIZATION`
- **Goal:** distinguish background control, immunosuppressive disease treatment, lupus crisis escalation and APS thrombotic danger.
- **Closure:** identify whether the current threat is inflammatory organ damage/crisis or thrombosis/APS and choose the Source-supported treatment role without importing external dosing/criteria.
- **Continuity rationale:** treatment only makes sense after the current danger branch is named.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05 → LG06`.  
**Coverage:** `{1..21}` exactly once.

---

# H17 — 类风湿关节炎 RA

Stable KP coverage: **20 / 20**  
Accepted Logic Groups: **5**

## C-H17-LG01｜滑膜 → 血管翳 → 侵蚀：RA为什么必须早控制病程

- **KP:** 01–05
- **Cognitive job:** `CAUSAL_CHAIN + VISUAL_RECOGNITION + DISCRIMINATION`
- **Goal:** connect CD4-centered immune background to proliferative synovitis, pannus, cartilage/bone destruction and rheumatoid nodule; contrast the resulting structural disease with rheumatic arthritis.
- **Closure:** explain the irreversible structure-damage chain and use it to distinguish RA from transient/nonerosive inflammatory arthritis.
- **Continuity rationale:** these five KPs are the causal/pathologic foundation; treatment logic later depends on it.

## C-H17-LG02｜临床关节 + 关节外模式：结构损害已经如何表现

- **KP:** 06–10
- **Cognitive job:** `SYNDROME_ORGAN_MAP + DISCRIMINATION`
- **Goal:** integrate morning stiffness, symmetric wrist/MCP/PIP pattern, irreversible deformities, extra-articular disease, Felty and Caplan.
- **Closure:** from a clinical pattern, distinguish active inflammatory symptoms, late structural damage and special systemic syndromes; preserve the 30-min vs historical 1-hour morning-stiffness Source conflict.
- **Continuity rationale:** these KPs answer the phenotype question after the pannus mechanism is established.

## C-H17-LG03｜证据：RF / ACPA +影像；证据角色不等于病名

- **KP:** 11–14
- **Cognitive job:** `EVIDENCE_STACK + DISCRIMINATION`
- **Goal:** distinguish RF from anti-CCP/ACPA, demote the broad immunoglobulin pairing list to MI-D, and connect MRI early soft-tissue evidence to the X-ray structural progression.
- **Closure:** decide what supports early RA, what is nonspecific, what images early inflammation versus accumulated damage and why seronegative RA remains possible.
- **Continuity rationale:** KP13 stays inside the evidence group only as a low-priority Source pairing Safety Net; it does not become RA ontology.

## C-H17-LG04｜治疗：症状控制 + DMARD病程控制

- **KP:** 15–17
- **Cognitive job:** `DECISION_LOCALIZATION + CAUSAL_CHAIN`
- **Goal:** connect irreversible pannus damage to the need for early DMARDs while keeping NSAID/GC rapid symptom/bridge roles and MTX/targeted/biologic escalation distinct.
- **Closure:** choose the Source-supported treatment role from disease activity/organ involvement and explain why pain relief alone cannot protect joint structure.
- **Continuity rationale:** these three KPs are one therapy architecture, not a drug list.

## C-H17-LG05｜两套诊断 Source + SLE comparison

- **KP:** 18–20
- **Cognitive job:** `DISCRIMINATION + BOUNDARY_RECALL`
- **Goal:** preserve the internal-medicine four-dimensional diagnostic frame and historical surgery 4/7 standard as two Source contexts, then compare RA vs SLE on erosion, kidney, platelets, complement and treatment.
- **Closure:** answer a diagnostic-standard question according to its Source context and distinguish RA from SLE without synthesizing a fake unified criterion set.
- **Continuity rationale:** diagnosis-context management and high-value SLE comparison are the Block exit/falsification layer.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05`.  
**Coverage:** `{1..20}` exactly once.

---

# H18 — 原发性干燥综合征

Stable KP coverage: **12 / 12**  
Accepted Logic Groups: **5**

## C-H18-LG01｜腺体浸润 → 口眼分泌失败

- **KP:** 01–04
- **Cognitive job:** `CAUSAL_CHAIN + SYNDROME_ORGAN_MAP`
- **Goal:** connect autoimmune exocrine-gland infiltration to salivary/lacrimal failure and the characteristic oral/ocular phenotype.
- **Closure:** distinguish true glandular secretion failure from simple thirst/dehydration and explain why caries/parotid disease follow loss of saliva function.
- **Continuity rationale:** identity, mechanism, mouth and eye are one exocrine-failure model.

## C-H18-LG02｜系统病输出：关节、肾小管、皮血、淋巴瘤风险

- **KP:** 05–08
- **Cognitive job:** `SYNDROME_ORGAN_MAP + DISCRIMINATION`
- **Goal:** prove Sjögren is systemic by linking nonerosive joints, RTA/low-K/alkaline urine, purpura/cytopenia and persistent parotid/NHL-MALT warning signs.
- **Closure:** from an extra-gland manifestation, route to the correct organ owner and distinguish Sjögren from RA/SLE/dehydration or ordinary parotid swelling.
- **Continuity rationale:** these are the major extra-gland outputs and downstream danger signal.

## C-H18-LG03｜证据：SSA/SSB + 腺体病理 / 功能

- **KP:** 09–10
- **Cognitive job:** `EVIDENCE_STACK`
- **Goal:** combine SSA/SSB with lip-gland biopsy and salivary/tear functional tests; preserve the Source reading boundary around “highest specificity”.
- **Closure:** state what serology supports, why lip-gland biopsy is the current gold-standard evidence and why one antibody cannot replace glandular pathology/function.
- **Continuity rationale:** serology and direct gland evidence answer complementary questions.

## C-H18-LG04｜治疗按“局部分泌失败 vs 系统器官炎症”分流

- **KP:** 11
- **Cognitive job:** `DECISION_LOCALIZATION`
- **Goal:** separate secretagogue/supportive treatment from GC/immunosuppression when internal organs are involved.
- **Closure:** classify treatment role from organ involvement without expanding external biologic/dose algorithms.
- **Continuity rationale:** singleton treatment decision.

## C-H18-LG05｜皮肤线索只是入口，不是疾病身份证

- **KP:** 12
- **Cognitive job:** `RECOGNITION + CONNECTION`
- **Goal:** use the Source skin-lesion comparison as a cross-disease routing Safety Net while refusing to diagnose from morphology alone.
- **Closure:** from a skin clue, name the likely owner(s) to reopen and the systemic evidence still required.
- **Continuity rationale:** singleton cross-System recognition Safety Net; mixing it with treatment would create an incoherent group.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05`.  
**Coverage:** `{1..12}` exactly once.

---

# H19 — 系统性血管炎与贝赫切特病

Stable KP coverage: **18 / 18**  
Accepted Logic Groups: **5**

## C-H19-LG01｜共同血管模型 + 口径分类

- **KP:** 01–02
- **Cognitive job:** `CAUSAL_CHAIN + LOCALIZATION`
- **Goal:** connect vessel-wall inflammation to stenosis/occlusion/thrombosis/ischemia versus wall destruction/hemorrhage/aneurysm, then classify by large/medium/small/variable caliber.
- **Closure:** from an organ event, infer the likely vessel-caliber problem before using serology.
- **Continuity rationale:** mechanism and caliber are the universal coordinate system for the Block.

## C-H19-LG02｜证据角色：ANCA / AECA / biopsy / angiography

- **KP:** 03–07
- **Cognitive job:** `EVIDENCE_STACK + DISCRIMINATION`
- **Goal:** separate IIF c/p patterns from PR3/MPO targets, use disease pairings as support, demote nonspecific AECA, and distinguish biopsy diagnosis from large/medium-vessel angiographic range mapping.
- **Closure:** choose the correct evidence modality for a suspected vasculitis and state why ANCA or a negative segmental biopsy cannot independently close/exclude every case.
- **Continuity rationale:** all five KPs answer “what evidence is appropriate for what vessel problem?”

## C-H19-LG03｜MPA / pauci-immune organ model + renal cross-rheum comparison

- **KP:** 08–11, 17
- **Cognitive job:** `SYNDROME_ORGAN_MAP + DISCRIMINATION + CONNECTION`
- **Goal:** integrate glomerular, pulmonary, skin/mucosal and peripheral-nerve MPA patterns, Current treatment role and the crucial distinction between type-III RPGN and type-III hypersensitivity; compare renal localization across SLE/Sjögren/MPA/RA/Behçet.
- **Closure:** solve a pulmonary-renal vignette, state why pauci-immune ANCA disease is not immune-complex hypersensitivity, and route full renal/pulmonary models back to their owners.
- **Continuity rationale:** KP17 belongs here because its value is to localize MPA renal disease against the other rheumatic models.

## C-H19-LG04｜Behçet clinical identity: variable-caliber vessel + oral/genital/eye/skin/system clues

- **KP:** 12–15
- **Cognitive job:** `SYNDROME_ORGAN_MAP + RECOGNITION`
- **Goal:** connect variable-caliber arterial/venous vasculitis to recurrent painful oral/genital ulcers, eye disease, skin/thrombophlebitis, gut/joint and pathergy clues.
- **Closure:** recognize Behçet from the *combination*, distinguish painful oral ulcers from SLE’s usually painless ulcers and avoid reducing the disease to a small-vessel category.
- **Continuity rationale:** vascular identity and clinical combination are one disease model.

## C-H19-LG05｜Behçet scoring boundary + treatment routing

- **KP:** 16, 18
- **Cognitive job:** `PRECISION_CLUSTER + DECISION_LOCALIZATION`
- **Goal:** preserve only the three Source-secure 2-point items and route therapy by internal-organ/eye vs oral ulcer vs recurrent mucocutaneous phenotype.
- **Closure:** answer only the score precision the original Source safely supports, identify the appropriate treatment role and explicitly leave unverified score rows/modern biologics outside Current.
- **Continuity rationale:** scoring and treatment are the final decision layer; H19-SR01 remains open rather than being filled from memory.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05`.  
**Coverage:** `{1..18}` exactly once.

---

# Checkpoint accounting

```text
H15  15 KP → 5 LG
H16  21 KP → 6 LG
H17  20 KP → 5 LG
H18  12 KP → 5 LG
H19  18 KP → 5 LG
------------------
     86 KP → 26 LG

batch omissions                 0
batch duplicate membership      0
antibody-list-only LGs           0
medical identity changes         0
Source conflicts erased          0
external guideline expansion     0
```

Cumulative Phase-3 progress:

```text
H1–H6    94 KP → 31 LG
H7–H11  100 KP → 29 LG
H12–H14  37 KP → 13 LG
H15–H19  86 KP → 26 LG
-----------------------
H1–H19  317 KP → 99 LG

Blocks accepted     19 / 27
KPs accepted       317 / 423
```

## Next exact review batch

`H20–H27` — infection common language + selected infectious pathology + local infection / source control / sepsis / tetanus-gas gangrene.

Challenge focus:

- site / host / tissue response / source control before organism list;
- preserve organ-specific infection ownership in A/B/D/E;
- H21 TB is cross-organ integration, not a second TB treatment owner;
- H22–H24 pathology recognition must not become full infectious-disease medicine;
- H26 historical sepsis terminology must remain explicit;
- no antimicrobial/vaccine/modern-sepsis guideline backfill.
