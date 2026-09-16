# C Hematology · Immunity · Infection — Phase 3B Exact Logic Groups H7–H11

Status: **PASS — H7–H11 exact semantic partition accepted**  
Scope: **5 / 5 Blocks, 100 / 100 stable KPs, 29 Logic Groups**  
Cumulative with H1–H6 receipt: **11 / 27 Blocks, 194 / 423 KPs, 60 Logic Groups**  
Medical identity change: **NONE**  
Question mapping change: **NONE**  
Learner Truth: **NONE**

The acceptance rules are inherited from `C_PHASE3_LOGIC_GROUP_REACCEPTANCE.md`. This batch focuses on clonal hematology and deliberately rejects marker/classification-list grouping without an explicit evidence role.

---

# H7 — 克隆性造血与 MDS

Stable KP coverage: **13 / 13**  
Accepted Logic Groups: **4**

## C-H07-LG01｜病态 / 无效造血：工厂在转，但产品不合格

- **KP:** 01–04
- **Cognitive job:** `CAUSAL_CHAIN + EVIDENCE_STACK`
- **Goal:** connect abnormal clone → dysplastic maturation → ineffective output, then use peripheral counts/Ret and marrow morphology to prove that active marrow does not equal effective hematopoiesis.
- **Closure:** from cytopenia plus marrow activity/morphology, explain why MDS differs from simple nutrient deficiency and from AA low-production failure; name what dysplasia can prove and what it cannot prove alone.
- **Continuity rationale:** identity, peripheral output and three-lineage dysplasia are one upstream disease model; the detailed morphology list remains visual/MI-D rather than a separate memorization group.

## C-H07-LG02｜blast、分型、克隆证据与风险：分类表必须挂回同一进展轴

- **KP:** 05–09
- **Cognitive job:** `EVIDENCE_STACK + PRECISION_CLUSTER`
- **Goal:** treat FAB/WHO names, FISH and IPSS-R as different views of one question: how far the abnormal clone has progressed and how dangerous it is.
- **Closure:** given blast percentage, Auer status, cytogenetics and blood counts, state which evidence defines category, which proves clonality, which estimates prognosis, and when the case leaves MDS for H9 acute leukemia.
- **Continuity rationale:** KP05–09 share one risk/progression axis. H7-SB01 and H7-SB02 remain explicit; no external classification/treatment update is imported.

## C-H07-LG03｜MDS 与巨幼 / AA：先分“原料成熟失败、工厂熄火、克隆性病态”

- **KP:** 10–11
- **Cognitive job:** `DISCRIMINATION`
- **Goal:** distinguish MDS from megaloblastic anemia and AA using marrow activity, dysplasia/clonal evidence, Ret, morphology and nutrient evidence.
- **Closure:** solve a macrocytic/pancytopenic vignette by naming the single discriminator that changes the next owner rather than pattern-matching “big cells” or “three lines low”.
- **Continuity rationale:** these are the two highest-value false neighbors of MDS.

## C-H07-LG04｜风险结果到治疗，再回病例算法

- **KP:** 12–13
- **Cognitive job:** `DECISION_LOCALIZATION + LOCALIZATION`
- **Goal:** map Current Source risk/age/blast/cytogenetic information onto chemotherapy, HSCT, hypomethylating or special 5q treatment roles, then re-run the full MDS algorithm.
- **Closure:** from a fresh case, establish MDS first, risk it second, and only then choose the Source-supported treatment role; explicitly reject “classification name → automatic treatment” shortcuts.
- **Continuity rationale:** treatment only makes sense after the risk model; KP13 enforces the reasoning order.

**Learner order:** `LG01 → LG02 → LG03 → LG04`.  
**Coverage:** `{1..13}` exactly once.

---

# H8 — 多发性骨髓瘤

Stable KP coverage: **16 / 16**  
Accepted Logic Groups: **5**

## C-H08-LG01｜浆细胞克隆怎样同时形成 CRAB

- **KP:** 01–04
- **Cognitive job:** `CAUSAL_CHAIN + SYNDROME_ORGAN_MAP`
- **Goal:** separate abnormal plasma cells from their secreted product, then connect marrow occupation / bone destruction to anemia, bone disease, hypercalcemia and secondary organ effects.
- **Closure:** from bone pain + anemia/high calcium/renal clues, reconstruct the common plasma-cell-clone upstream rather than treating CRAB as four unrelated diseases.
- **Continuity rationale:** KP01–04 establish the cell/structure arm of MM before protein-mediated effects enter.

## C-H08-LG02｜M蛋白 / 轻链：蛋白多为什么反而感染、黏、出血、伤肾

- **KP:** 05–09
- **Cognitive job:** `CAUSAL_CHAIN + EVIDENCE_STACK`
- **Goal:** connect monoclonal protein excess to loss of normal polyclonal immunity, hyperviscosity, rouleaux/ESR, bleeding/amyloid interfaces and overflow light-chain renal injury; use the case portrait only as a combined clue set.
- **Closure:** given TP/Alb, BJP, ESR/rouleaux, infection or renal findings, identify which protein-mediated mechanism is active and state why one M-protein clue is not the whole diagnosis.
- **Continuity rationale:** these KPs are the secretion-product arm of the same clone. H8-SB01/H8-SB02 stay Source-bound.

## C-H08-LG03｜诊断 + 分期：证明克隆后，再压缩肿瘤负荷与肾/风险

- **KP:** 10–13
- **Cognitive job:** `EVIDENCE_STACK + PRECISION_CLUSTER`
- **Goal:** establish MM using marrow monoclonal plasma cells + M-protein evidence, then distinguish D-S tumor-load/A-B renal axes from ISS β2-MG/albumin risk compression.
- **Closure:** given diagnostic evidence and staging values, state what proves MM, what only stages it, and why BJP negativity or one organ finding cannot replace the two main diagnostic evidence lines.
- **Continuity rationale:** diagnosis and staging are sequential evidence decisions; numerical tables stay attached to their purpose rather than becoming standalone memory islands.

## C-H08-LG04｜治疗候选、预后与器官威胁

- **KP:** 14–15
- **Cognitive job:** `DECISION_LOCALIZATION + URGENT_PARALLEL_ACTION`
- **Goal:** use symptom/organ-damage status and transplant candidacy for Current Source therapy while keeping immediate threats (hypercalcemia, renal damage, cord compression) visible.
- **Closure:** identify whether the case first needs threat recognition versus routine induction planning and choose the Source-supported transplant/non-transplant treatment role without importing newer regimens.
- **Continuity rationale:** treatment and prognosis are downstream of disease burden and organ threat, not separate drug-list tasks.

## C-H08-LG05｜最终 MM 病例算法

- **KP:** 16
- **Cognitive job:** `LOCALIZATION + EVIDENCE_STACK`
- **Goal:** compress clone → protein → organ damage → diagnostic proof → stage → treatment candidate into one executable route.
- **Closure:** solve a fresh MM-like vignette while explicitly rejecting “bone pain = MM”, “M spike = complete diagnosis”, and “BJP negative = no MM”.
- **Continuity rationale:** this singleton is the Block execution algorithm.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05`.  
**Coverage:** `{1..16}` exactly once.

---

# H9 — 急性白血病

Stable KP coverage: **29 / 29**  
Accepted Logic Groups: **7**

The Phase-2 rough estimate of five groups is rejected. Exact review shows separate clinical, evidence, subtype and response-monitoring tasks that would be damaged by overcompression.

## C-H09-LG01｜急性身份与 Source 分类：先懂“早期分化停滞”，再看 FAB 名字

- **KP:** 01–04
- **Cognitive job:** `CAUSAL_CHAIN + PRECISION_CLUSTER`
- **Goal:** connect proliferative advantage + differentiation block to acute-vs-chronic identity, then use ALL/AML FAB tables only as Source-specific morphology language.
- **Closure:** from a blast-heavy case, explain why it is biologically acute, identify the likely lineage/maturation question, and state which FAB precision needs the original table rather than rote recitation.
- **Continuity rationale:** disease identity gives classification its meaning; H9-SB01–03 and H9-SC01 remain live.

## C-H09-LG02｜临床双出口：正常造血被压 + 肿瘤细胞外侵

- **KP:** 05–09
- **Cognitive job:** `SYNDROME_ORGAN_MAP + DISCRIMINATION`
- **Goal:** derive anemia/infection/bleeding from marrow failure and distinguish sternum, liver/spleen, green tumor, gingiva/skin, node/mediastinum and CNS/testis infiltration clues.
- **Closure:** given a symptom/organ pattern, identify whether it is marrow-output failure, direct infiltration or a sanctuary-site issue and avoid confusing gingival bleeding with gingival infiltration or node disease with lymphoma alone.
- **Continuity rationale:** these five KPs share the “where did the clone cause the phenotype?” question.

## C-H09-LG03｜外周 → 骨髓 → Auer / 化学 + NAP：先把急性和系别方向立住

- **KP:** 10–13, 19
- **Cognitive job:** `EVIDENCE_STACK + DISCRIMINATION`
- **Goal:** use CBC/smear as a clue, marrow as acute-threshold evidence, Auer/cytochemistry as lineage direction and NAP only as an auxiliary discriminator against CML/leukemoid patterns.
- **Closure:** explain what each evidence layer adds, why Auer-negative does not equal ALL and why NAP cannot diagnose leukemia independently of marrow/clone evidence.
- **Continuity rationale:** KP19 belongs here semantically even though it appears later in stable KP order; all five KPs are first-line diagnostic discrimination tools.

## C-H09-LG04｜流式 + 遗传：从“哪一系”推进到“哪一亚型 / 预后”，APL在这里闭合身份

- **KP:** 14–18
- **Cognitive job:** `EVIDENCE_STACK + DISCRIMINATION`
- **Goal:** distinguish B/T/NK/AML immunophenotype combinations, then use characteristic cytogenetics/fusions for subtype/prognosis and integrate APL as M3 + Auer/MPO + characteristic flow + t(15;17)/PML-RARA + DIC risk.
- **Closure:** from flow and cytogenetic data, state which result identifies lineage, which refines subtype/prognosis and why one CD or one chromosome never substitutes for the whole evidence stack.
- **Continuity rationale:** APL is the best test of whether morphology, flow and genetics have truly been integrated rather than memorized separately.

## C-H09-LG05｜危急出口 + Current Source 分型治疗

- **KP:** 20–25
- **Cognitive job:** `URGENT_PARALLEL_ACTION + DECISION_LOCALIZATION`
- **Goal:** recognize tumor-lysis/high-urate renal injury, leukostasis and APL differentiation/DIC danger, then branch to APL / non-M3 AML / ALL Source treatment and G-CSF boundary.
- **Closure:** in a new acute-leukemia case, identify what can harm the patient now, run prevention/support in parallel, and choose the Source-supported subtype treatment without delaying danger control or importing modern external regimens.
- **Continuity rationale:** these KPs form the “after subtype evidence, what must happen now?” decision layer.

## C-H09-LG06｜治疗结果不是治愈：CR → MRD → toxicity

- **KP:** 26–28
- **Cognitive job:** `EVIDENCE_STACK + PRECISION_CLUSTER`
- **Goal:** distinguish complete remission from residual disease and keep drug-organ toxicity as treatment evidence rather than main disease ontology.
- **Closure:** given improved counts/clinical state, state what is still required for CR, why MRD can remain after CR, and when a new organ finding should trigger a treatment-toxicity check.
- **Continuity rationale:** response, residual disease and toxicity are the post-treatment observation layer.

## C-H09-LG07｜最终急性白血病病例算法

- **KP:** 29
- **Cognitive job:** `LOCALIZATION + EVIDENCE_STACK + URGENT_PARALLEL_ACTION`
- **Goal:** execute marrow-failure/infiltration → acute threshold → lineage/subtype → genetics → urgent exits → treatment → CR/MRD in order.
- **Closure:** solve a fresh acute-leukemia vignette while refusing to jump from WBC, Auer, one CD or one fusion directly to the whole diagnosis/treatment plan.
- **Continuity rationale:** singleton execution algorithm.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05 → LG06 → LG07`.  
**Coverage:** `{1..29}` exactly once; KP19 is semantically reordered into LG03 without identity change.

---

# H10 — 慢性髓系白血病 CML

Stable KP coverage: **10 / 10**  
Accepted Logic Groups: **4**

## C-H10-LG01｜慢性期身份：成熟粒细胞克隆 + BCR–ABL + 巨脾 / NAP

- **KP:** 01–05
- **Cognitive job:** `CAUSAL_CHAIN + EVIDENCE_STACK + DISCRIMINATION`
- **Goal:** connect BCR–ABL-driven clonal expansion with retained maturation, the mature granulocyte spectrum, marrow hyperplasia/giant spleen, Ph evidence and low NAP vs leukemoid reaction.
- **Closure:** from WBC differential/spleen/NAP/Ph evidence, explain why this is a clonal mature-spectrum disease rather than reactive neutrophilia or H9 acute leukemia.
- **Continuity rationale:** KP01–05 jointly define chronic-phase CML; none of the auxiliary clues should stand alone.

## C-H10-LG02｜加速 → 急变：成熟秩序怎样逐步丢失

- **KP:** 06–07
- **Cognitive job:** `CAUSAL_CHAIN + PRECISION_CLUSTER`
- **Goal:** integrate blast/basophil/platelet/spleen/treatment-response/extra-cytogenetic signals into acceleration, then recognize acute transformation.
- **Closure:** determine the phase from a multi-signal case and explain why progression is not “WBC got even higher”.
- **Continuity rationale:** KP06–07 are one disease-progression movie. H10-SB01 remains Source-bound.

## C-H10-LG03｜治疗：靶点压制、根治与特殊人群

- **KP:** 08
- **Cognitive job:** `DECISION_LOCALIZATION`
- **Goal:** distinguish TKI targeting BCR–ABL, HSCT as Current Source curative interface and interferon for Source-specific special contexts.
- **Closure:** from phase/context/eligibility, name the Source-supported treatment role and its target without importing resistance mutation/modern monitoring algorithms.
- **Continuity rationale:** treatment is a discrete decision after clone and phase are known.

## C-H10-LG04｜急性 vs CML 比较 + 最终病例算法

- **KP:** 09–10
- **Cognitive job:** `DISCRIMINATION + LOCALIZATION`
- **Goal:** compare maturation, blast, spleen, nodes, Ph and NAP, then execute mature spectrum → clone proof → stage → treatment.
- **Closure:** solve a WBC-high case and identify the minimum evidence needed to distinguish acute leukemia, CML and leukemoid response before treatment routing.
- **Continuity rationale:** KP09 compresses the main false neighbor; KP10 turns it into an executable route.

**Learner order:** `LG01 → LG02 → LG03 → LG04`.  
**Coverage:** `{1..10}` exactly once.

---

# H11 — 淋巴瘤

Stable KP coverage: **32 / 32**  
Accepted Logic Groups: **9**

The Phase-2 rough five-group shape is rejected. The 32-KP Block contains distinct common-entry, mature-B, precursor/Burkitt, T/NK, HL-clinical, RS/CHL-pathology and integrative-evidence tasks.

## C-H11-LG01｜共同入口：活检定组织，B症状/分期定范围，HL/NHL先分大方向

- **KP:** 01–06
- **Cognitive job:** `EVIDENCE_STACK + LOCALIZATION + DISCRIMINATION`
- **Goal:** start from progressive painless node/extranodal mass, preserve biopsy as diagnostic owner, separate marrow-infiltration anemia from immune hemolysis, apply B symptoms and I–IV stage, then compare HL vs NHL spread patterns.
- **Closure:** from a node case, state what proves lymphoma, what only stages it, whether anemia reflects marrow vs hemolysis, and why marrow aspirate cannot replace tissue architecture.
- **Continuity rationale:** these KPs form the universal lymphoma entry before subtype memorization begins.

## C-H11-LG02｜成熟 B-NHL：类型、行为与治疗角色必须绑在一起

- **KP:** 07–11
- **Cognitive job:** `DISCRIMINATION + DECISION_LOCALIZATION`
- **Goal:** place DLBCL, follicular and CLL/SLL on mature-B/indolent-to-aggressive axes, use CD20/CHOP-R and MALT interfaces by role, and understand transformation rather than memorize an unordered subtype list.
- **Closure:** given architecture/marker/behavior clues, choose the mature-B subtype direction, classify its behavior and state the Current Source treatment role without using one marker as the diagnosis.
- **Continuity rationale:** treatment, subtype and biological speed are one mature-B decision space.

## C-H11-LG03｜前体 / Burkitt：高度侵袭，但“长得快”不等于同一种病

- **KP:** 12–14
- **Cognitive job:** `DISCRIMINATION + EVIDENCE_STACK`
- **Goal:** distinguish precursor B/T lymphoblastic tumors from Burkitt using age/site, TdT/CD34, morphology/starry-sky, EBV, t(8;14)/MYC and blood-vs-tissue presentation.
- **Closure:** separate T-lymphoblastic mediastinal disease, B-ALL-like presentation and Burkitt abdominal/jaw patterns and explicitly preserve the H9/H11 historical Burkitt naming boundary.
- **Continuity rationale:** these are the high-grade/precursor false neighbors that most easily collapse into a “young patient + fast tumor” list.

## C-H11-LG04｜T / NK-NHL：用部位、形态和表型定位，不强造统一假机制

- **KP:** 15–18
- **Cognitive job:** `RECOGNITION + DISCRIMINATION`
- **Goal:** map the Source-supported T/NK family and retain high-value identities: cutaneous T/Sézary, ALCL/CD30/t(2;5), NK/T/EBV/nasal-midline.
- **Closure:** given skin/blood, youth/CD30 or nasal/EBV clues, identify the relevant T/NK direction and name which image/marker must confirm it.
- **Continuity rationale:** the Source itself contains heterogeneous T/NK entities; this LG explicitly avoids inventing a single fake mechanism to make the list tidy.

## C-H11-LG05｜HL 临床 / 治疗：范围决定局部 vs 系统治疗

- **KP:** 19–20
- **Cognitive job:** `SYNDROME_ORGAN_MAP + DECISION_LOCALIZATION`
- **Goal:** connect HL clinical patterns and stage to Current Source ABVD/BV-AVD/radiotherapy roles.
- **Closure:** from age/fever/pruritus/node pattern and stage, recognize HL direction and choose the Source-supported treatment *scope* rather than memorizing regimen letters independently.
- **Continuity rationale:** clinical presentation and stage-sensitive treatment are one HL decision problem.

## C-H11-LG06｜RS / NLPHL / CHL：先认肿瘤细胞与背景，再谈亚型

- **KP:** 21–25
- **Cognitive job:** `EVIDENCE_STACK + DISCRIMINATION`
- **Goal:** distinguish typical RS and variants, NLPHL popcorn/B-cell phenotype and CHL common RS+mixed-inflammatory background; keep the CHL incidence-source conflict explicit.
- **Closure:** from a pathology/marker image, identify the tumor-cell identity and background, separate NLPHL from CHL, and state which incidence ordering depends on the question’s discipline.
- **Continuity rationale:** morphology and background are the prerequisite to the four CHL subtype patterns; H11-SC01/H11-SC02 remain live.

## C-H11-LG07｜CHL 四型：陷窝 / 混合 / 淋巴富 / 淋巴少

- **KP:** 26–29
- **Cognitive job:** `DISCRIMINATION + VISUAL_RECOGNITION`
- **Goal:** compare the four CHL subtypes by characteristic cell/background, demographic/site, EBV direction and Current Source prognosis.
- **Closure:** from an image + demographic/background clue set, distinguish the four Source subtypes while preserving the two discipline-specific incidence rankings.
- **Continuity rationale:** these KPs are one direct four-way comparison and should remain together.

## C-H11-LG08｜染色体 + 免疫表型：确认身份，不替代活检

- **KP:** 30–31
- **Cognitive job:** `EVIDENCE_STACK + DISCRIMINATION`
- **Goal:** use characteristic translocations and marker combinations to confirm B/T/NK/plasma/RS identities and separate near neighbors such as CLL/SLL vs mantle cell.
- **Closure:** given a marker/translocation panel, identify what subtype it supports and explicitly state the tissue/morphology evidence it cannot replace.
- **Continuity rationale:** the two summary tables are a cross-branch evidence Safety Net, not a new taxonomy owner.

## C-H11-LG09｜最终淋巴瘤病例算法

- **KP:** 32
- **Cognitive job:** `LOCALIZATION + EVIDENCE_STACK`
- **Goal:** execute node/extranodal entry → biopsy → structure/cell source → marker/genetic confirmation → reverse-order stage → behavior/target → Current treatment.
- **Closure:** solve a fresh lymphoma vignette without diagnosing from node size, one CD, one translocation or marrow involvement alone.
- **Continuity rationale:** singleton execution algorithm.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05 → LG06 → LG07 → LG08 → LG09`.  
**Coverage:** `{1..32}` exactly once.

---

# Checkpoint accounting

```text
H7   13 KP → 4 LG
H8   16 KP → 5 LG
H9   29 KP → 7 LG
H10  10 KP → 4 LG
H11  32 KP → 9 LG
------------------
    100 KP → 29 LG

batch omissions                0
batch duplicate membership     0
medical identity changes       0
question relation changes      0
Source conflicts erased        0
external classification import 0
```

Cumulative Phase-3 progress:

```text
H1–H6   94 KP → 31 LG
H7–H11 100 KP → 29 LG
---------------------
H1–H11 194 KP → 60 LG

Blocks accepted     11 / 27
KPs accepted       194 / 423
```

## Next exact review batch

`H12–H19` — minimum immune language + alloimmunity + rheumatology.

Challenge focus:

- no complete normal-immunology backfill;
- no antibody-list Logic Groups unless the cognitive job is evidence-role discrimination;
- keep effector direction / target / timing separate from organ syndrome and evidence role;
- force rheumatology to start from syndrome + organ combination, not serology pattern matching;
- preserve H12 Source gaps and H16/H17 conflicts rather than “correcting” them from generic medical knowledge.
