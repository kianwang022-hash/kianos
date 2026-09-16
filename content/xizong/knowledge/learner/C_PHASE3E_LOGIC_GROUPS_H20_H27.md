# C Hematology · Immunity · Infection — Phase 3E Exact Logic Groups H20–H27

Status: **PASS — H20–H27 exact semantic partition accepted**  
Scope: **8 Blocks, 106 stable KPs, 35 Logic Groups**  
Cumulative Phase-3: **27 / 27 Blocks, 423 / 423 KPs, 134 Logic Groups**  
Medical identity change: **NONE**  
Complete infectious-disease backfill: **0**  
Organ-owner duplication: **0**

This final exact-review batch keeps infection reasoning anchored to:

```text
site / space
+ host
+ tissue response
+ persistent source
→ spread / systemic danger
→ action
```

Organism names remain subordinate unless the Current Source makes them the decisive discriminator.

---

# H20 — 感染共同语言

Stable KP coverage: **13 / 13**  
Accepted Logic Groups: **4**

## C-H20-LG01｜感染五问：病原—空间—宿主—反应—源控制

- **KP:** 01–04
- **Cognitive job:** `LOCALIZATION + CAUSAL_CHAIN`
- **Goal:** distinguish pathogen presence from invasion, combine real anatomical space with host defense and tissue-reaction pattern, and keep weak host reaction from being mistaken for mild infection.
- **Closure:** from a febrile/local lesion case, identify the true infection space, host state and expected tissue reaction before naming a disease or drug.
- **Continuity rationale:** these four KPs form the common infection model and the five major tissue-response categories.

## C-H20-LG02｜感染分类语言：混合、特异、机会、二重

- **KP:** 05–06
- **Cognitive job:** `DISCRIMINATION + RECOGNITION`
- **Goal:** separate mixed infection and course labels from specific infection, opportunity infection and antibiotic-selection-driven superinfection.
- **Closure:** distinguish “host became permissive” from “broad antibiotics selected replacement flora” and avoid treating the Source examples as a complete pathogen curriculum.
- **Continuity rationale:** these are naming categories answering different causal questions; learning them together is safer than memorizing labels independently.

## C-H20-LG03｜治疗与证据：抗菌药、源控制、预防/联合用药、取样空间

- **KP:** 07–10
- **Cognitive job:** `SOURCE_CONTROL + DECISION_LOCALIZATION + EVIDENCE_STACK`
- **Goal:** keep drug action separate from mechanical source control, preserve Current Source prophylaxis/combination precision, and choose specimens that match the suspected infection space.
- **Closure:** for a surgical infection scenario, decide whether antimicrobials are indicated, whether source control is non-substitutable and where the sample should come from; use Source-specific timing only when the question calls for it.
- **Continuity rationale:** these KPs form one action/evidence layer after the infection has been localized.

## C-H20-LG04｜器官 owner、局部/全身分流与最终算法

- **KP:** 11–13
- **Cognitive job:** `LOCALIZATION + BOUNDARY_RECALL`
- **Goal:** return organ infections to A/B/D/E owners, distinguish local infection from systemic danger without relying on fever/WBC alone, and route to H21–H26.
- **Closure:** execute entry → space → host → reaction → source → owner / severity route and state when the case must leave H20 for H25 or H26.
- **Continuity rationale:** these are the Block exit and ownership guards.

**Learner order:** `LG01 → LG02 → LG03 → LG04`.  
**Coverage:** `{1..13}` exactly once.

---

# H21 — 结核跨器官整合

Stable KP coverage: **13 / 13**  
Accepted Logic Groups: **4**

## C-H21-LG01｜TB共同病理：控制病原也制造干酪坏死

- **KP:** 01–03
- **Cognitive job:** `CAUSAL_CHAIN + VISUAL_RECOGNITION`
- **Goal:** connect cell-mediated containment and delayed injury to granuloma/caseation and retain the Source cell-wall-component precision only as bounded explanatory detail.
- **Closure:** reconstruct a tuberculous granuloma and explain why granuloma formation and tissue destruction coexist.
- **Continuity rationale:** immune logic, Source bacterial-component interface and histologic granuloma are one shared TB model.

## C-H21-LG02｜原发 / 继发 / HIV宿主：免疫背景决定播散与形态

- **KP:** 04–08
- **Cognitive job:** `DISCRIMINATION + CAUSAL_CHAIN`
- **Goal:** compare primary lymphohematogenous spread, secondary bronchogenic/localized cavitary disease, cavity–shedding relation, hematogenous/miliary spread and immunodeficient atypical TB.
- **Closure:** given host/background/location/cavity/lymph-node clues, identify the likely host-state pattern and predicted spread route without re-teaching R7 treatment.
- **Continuity rationale:** these five KPs are one host–spread movie.

## C-H21-LG03｜肺外器官地图：解释传播，诊疗回 owner

- **KP:** 09–11
- **Cognitive job:** `CONNECTION + BOUNDARY_RECALL`
- **Goal:** route renal/genitourinary, intestinal/peritoneal, CNS/nodal/female-reproductive/bone-joint TB by likely spread and canonical owner.
- **Closure:** from an extra-pulmonary TB clue, explain the propagation path and name the correct Primary owner rather than expanding a second organ-specific clinical model.
- **Continuity rationale:** these three KPs are the cross-organ ownership map.

## C-H21-LG04｜肉芽肿鉴别 + TB跨器官反向算法

- **KP:** 12–13
- **Cognitive job:** `DISCRIMINATION + LOCALIZATION`
- **Goal:** distinguish TB from chronic schistosomal granuloma and syphilitic gumma, then execute host → spread → organ → owner.
- **Closure:** solve a granulomatous multi-organ vignette without duplicating any existing TB Primary or using “granuloma” as a disease label.
- **Continuity rationale:** the comparison is the falsification test for the final routing algorithm.

**Learner order:** `LG01 → LG02 → LG03 → LG04`.  
**Coverage:** `{1..13}` exactly once.

---

# H22 — 流脑与乙脑

Stable KP coverage: **10 / 10**  
Accepted Logic Groups: **3**

## C-H22-LG01｜流脑：脑膜空间的化脓性炎

- **KP:** 01–05
- **Cognitive job:** `LOCALIZATION + VISUAL_RECOGNITION + URGENT_RECOGNITION`
- **Goal:** distinguish meninges/subarachnoid pus from brain parenchyma, connect meningococcal identity/season/transmission with membrane anatomy/pathology and recognize fulminant systemic danger despite relatively mild local meningitis.
- **Closure:** from site/pathology/systemic clues, identify meningococcal meningitis and explain why local CNS appearance cannot be used to grade systemic severity.
- **Continuity rationale:** KP01 is shared comparison orientation; KP02–05 close the meningococcal branch.

## C-H22-LG02｜乙脑：脑实质变质 + 神经元/胶质反应

- **KP:** 06–09
- **Cognitive job:** `CAUSAL_CHAIN + VISUAL_RECOGNITION + DISCRIMINATION`
- **Goal:** connect neuronal injury/liquefactive softening to sieve-like lesions, perivascular lymphocyte cuffs and astrocyte/microglia/oligodendrocyte response identities.
- **Closure:** identify the four characteristic tissue/cell patterns on description/image and distinguish neuronophagia from satellitosis without expanding a full neurology course.
- **Continuity rationale:** these four KPs are one brain-parenchymal pathology model.

## C-H22-LG03｜流脑 vs 乙脑 vs 结脑最终分流

- **KP:** 10
- **Cognitive job:** `DISCRIMINATION + BOUNDARY_RECALL`
- **Goal:** separate membrane/purulent, parenchymal/degenerative and basal TB meningitis entries, then return detailed clinical management to the appropriate owner/Source gap.
- **Closure:** solve a fresh CNS-infection pathology vignette while preserving H22-SC01 rather than silently rewriting the astrocyte-fiber wording conflict.
- **Continuity rationale:** singleton final comparison.

**Learner order:** `LG01 → LG02 → LG03`.  
**Coverage:** `{1..10}` exactly once.

---

# H23 — 伤寒、菌痢与感染性肠溃疡

Stable KP coverage: **17 / 17**  
Accepted Logic Groups: **6**

## C-H23-LG01｜肠道病理四轴：部位—炎症—溃疡—并发症

- **KP:** 01
- **Cognitive job:** `LOCALIZATION`
- **Goal:** establish the coordinate system before disease names.
- **Closure:** describe an unfamiliar intestinal lesion on the four axes and predict what type of narrowing/bleeding/perforation risk its structure creates.
- **Continuity rationale:** singleton mother model.

## C-H23-LG02｜伤寒：巨噬增生 → 平行溃疡 → 出血/穿孔

- **KP:** 02–06
- **Cognitive job:** `CAUSAL_CHAIN + VISUAL_RECOGNITION + PRECISION_CLUSTER`
- **Goal:** connect acute mononuclear-macrophage proliferation/typhoid nodules with terminal-ileal lymphoid structure, longitudinal ulcers, weekly stages and Source recognition signs.
- **Closure:** derive the ulcer direction from lymphoid architecture and explain why hemorrhage/perforation rather than annular obstruction is the characteristic danger.
- **Continuity rationale:** these five KPs tell one typhoid pathology story; low-frequency recognition detail stays secondary.

## C-H23-LG03｜菌痢：直乙假膜 → 浅地图溃疡；中毒性型局部轻全身重

- **KP:** 07–10
- **Cognitive job:** `CAUSAL_CHAIN + DISCRIMINATION`
- **Goal:** connect rectosigmoid location, fibrinous pseudomembrane and superficial map-like ulcer to mucus/bloody stool/tenesmus, then distinguish toxic dysentery’s heavy systemic toxicity with mild local lesions.
- **Closure:** identify ordinary vs toxic dysentery from local/systemic relationship and explain why lack of deep ulceration does not mean the systemic case is mild.
- **Continuity rationale:** these four KPs are one bacillary-dysentery branch with its major exception.

## C-H23-LG04｜疟疾 Source Gap：accounted, not invented

- **KP:** 11
- **Cognitive job:** `BOUNDARY_RECALL`
- **Goal:** retain only the Source-supported intermittent-fever/afebrile alternation, chronic splenomegaly and WBC-decrease interface while explicitly leaving unsupported Outline detail unresolved.
- **Closure:** state the currently safe malaria interface and refuse to fill the missing complete disease model from memory.
- **Continuity rationale:** singleton Source-gap guard is preferable to contaminating another disease group.

## C-H23-LG05｜感染性 / 炎症性肠溃疡比较网

- **KP:** 12–16
- **Cognitive job:** `DISCRIMINATION + VISUAL_RECOGNITION + BOUNDARY_RECALL`
- **Goal:** compare TB vs typhoid structural orientation, bacillary dysentery, amoebic/interface lesions, UC/CD and upper-GI ulcer/tumor patterns by site/orientation/depth/continuity while returning full models to B owners.
- **Closure:** identify a lesion from morphology and site, then state which disease owner must be reopened for full diagnosis/treatment.
- **Continuity rationale:** these KPs are explicitly comparison/ownership material rather than five new GI courses.

## C-H23-LG06｜最终 intestinal-infection algorithm

- **KP:** 17
- **Cognitive job:** `LOCALIZATION + DISCRIMINATION`
- **Goal:** execute site → inflammation → ulcer → complication → owner.
- **Closure:** solve a fresh intestinal pathology vignette without using an isolated ulcer mnemonic as the whole diagnosis.
- **Continuity rationale:** singleton execution algorithm.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05 → LG06`.  
**Coverage:** `{1..17}` exactly once.

---

# H24 — 血吸虫病与性传播疾病

Stable KP coverage: **17 / 17**  
Accepted Logic Groups: **5**

## C-H24-LG01｜血吸虫传播与“主要损害是谁”

- **KP:** 01–02
- **Cognitive job:** `CAUSAL_CHAIN + DISCRIMINATION`
- **Goal:** preserve the three Source transmission conditions and distinguish cercarial/juvenile vascular-pulmonary effects from egg-mediated major tissue injury.
- **Closure:** from exposure + tissue damage, state which parasite stage is responsible for the dominant lesion without expanding the full life cycle.
- **Continuity rationale:** entry and damaging stage are one upstream model.

## C-H24-LG02｜虫卵结节：急性嗜酸反应 → 慢性假结核肉芽肿 → organ interface

- **KP:** 03–08
- **Cognitive job:** `CAUSAL_CHAIN + VISUAL_RECOGNITION + DISCRIMINATION`
- **Goal:** reconstruct Hoeppli/eosinophilic acute lesion, organization into epithelioid/foreign-body chronic granuloma, distinguish it from TB and route colonic/hepatic consequences to B.
- **Closure:** recognize acute vs chronic schistosomal lesions and explain the TB discriminators before running the reverse-identification chain.
- **Continuity rationale:** these six KPs are the complete Source-supported schistosomal pathology movie.

## C-H24-LG03｜梅毒：血管炎 → 三期 → 树胶肿 / 巨细胞鉴别

- **KP:** 09–13
- **Cognitive job:** `CAUSAL_CHAIN + VISUAL_RECOGNITION + DISCRIMINATION`
- **Goal:** connect obliterative endarteritis/perivascular plasma cells to stage identity, tertiary cardiovascular/neural disease, gumma morphology and Langhans-vs-foreign-body giant-cell context.
- **Closure:** identify syphilitic pathology by vascular/plasma-cell/stage/morphology evidence and distinguish gumma from TB without adding missing serology/treatment.
- **Continuity rationale:** these five KPs are one Source-supported syphilis pathology model.

## C-H24-LG04｜HPV condyloma vs gonorrheal suppuration

- **KP:** 14–15
- **Cognitive job:** `DISCRIMINATION + BOUNDARY_RECALL`
- **Goal:** distinguish HPV6/11 koilocytosis at moist mucocutaneous junctions from acute purulent genitourinary gonorrhea and preserve reproductive/STI treatment boundaries.
- **Closure:** from pathology/site clues, separate the two and state what full reproductive/STI model is not owned by H24.
- **Continuity rationale:** two high-frequency STI pathology identities form one direct comparison without pretending they share a natural disease course.

## C-H24-LG05｜四病理主角比较 + H24反向算法

- **KP:** 16–17
- **Cognitive job:** `DISCRIMINATION + LOCALIZATION`
- **Goal:** compress schistosomal egg/eosinophil/granuloma, syphilitic vasculitis/plasma cell/gumma, HPV koilocyte and gonorrheal purulence, then route organ consequences out.
- **Closure:** solve a fresh pathology vignette from its dominant cell/structure and stop at the correct Source boundary.
- **Continuity rationale:** KP16 explicitly warns there is no single natural disease course; KP17 operationalizes that comparison.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05`.  
**Coverage:** `{1..17}` exactly once.

---

# H25 — 局部感染与源控制

Stable KP coverage: **16 / 16**  
Accepted Logic Groups: **5**

## C-H25-LG01｜源控制原则 + 病原行为塑造感染空间

- **KP:** 01–02
- **Cognitive job:** `SOURCE_CONTROL + CAUSAL_CHAIN`
- **Goal:** connect persistent source/high-pressure/necrotic space to drainage/debridement and use staphylococcal localization vs streptococcal spread as a tissue-behavior axis rather than a culture substitute.
- **Closure:** identify when antibiotics cannot solve the mechanical/spatial failure and predict whether a lesion tends to localize or diffuse.
- **Continuity rationale:** source-control logic and pathogen tissue behavior are the Block’s upstream model.

## C-H25-LG02｜浅部感染 + source-control timing exceptions

- **KP:** 03–08
- **Cognitive job:** `DISCRIMINATION + SOURCE_CONTROL + URGENT_RECOGNITION`
- **Goal:** distinguish furuncle/carbuncle/cellulitis/erysipelas and special cellulitis, then derive why ordinary fluctuation timing fails in dangerous triangle, airway, hand high-pressure and nonpurulent erysipelas contexts.
- **Closure:** from superficial infection location/boundary/purulence/danger, choose whether/when to incise and explain the exception rather than applying one universal rule.
- **Continuity rationale:** six KPs form the shallow-space discrimination and timing decision layer.

## C-H25-LG03｜甲沟 / 指头：封闭指端高压决定疼痛进程与切口

- **KP:** 09–11
- **Cognitive job:** `SOURCE_CONTROL + VISUAL_RECOGNITION + PRECISION_CLUSTER`
- **Goal:** trace paronychia progression to felon, interpret pain relief as possible ischemic nerve damage, and preserve Source-specific incision/anesthesia boundaries.
- **Closure:** distinguish the two spaces, identify when decompression is urgent and explain why incision boundaries protect distal function.
- **Continuity rationale:** disease progression, high-pressure danger and operative boundary are one fingertip-space problem.

## C-H25-LG04｜掌深间隙 / 腱鞘 / 滑囊：空间图决定切哪里

- **KP:** 12–15
- **Cognitive job:** `LOCALIZATION + VISUAL_RECOGNITION + SOURCE_CONTROL`
- **Goal:** distinguish thenar vs midpalmar spaces, explain dorsal edema without a dorsal source, map tendon-sheath spread and protect transverse-crease/nerve/tendon boundaries.
- **Closure:** localize a hand infection to the actual deep space and select the correct Source-bounded drainage direction rather than cutting where swelling looks largest.
- **Continuity rationale:** these four KPs are one anatomical routing map and require original visuals.

## C-H25-LG05｜最终 local-infection algorithm

- **KP:** 16
- **Cognitive job:** `LOCALIZATION + SOURCE_CONTROL + URGENT_RECOGNITION`
- **Goal:** execute space → purulence/necrosis/pressure → immediate danger → timing → source-control action → H26 escalation.
- **Closure:** solve a fresh local-infection case while explicitly rejecting “all red lesions get cut” and “wait for fluctuation in every hand/airway case”.
- **Continuity rationale:** singleton execution algorithm.

**Learner order:** `LG01 → LG02 → LG03 → LG04 → LG05`.  
**Coverage:** `{1..16}` exactly once.

---

# H26 — 脓毒症

Stable KP coverage: **9 / 9**  
Accepted Logic Groups: **3**

## C-H26-LG01｜全身失控识别：高低双向 + Source病原提示

- **KP:** 01–04
- **Cognitive job:** `URGENT_RECOGNITION + DISCRIMINATION`
- **Goal:** recognize escalation from infection to systemic danger using high/low temperature and WBC, perfusion/organ threat and Source-specific G−/staph/anaerobe/fungal clues without treating those clues as etiologic proof.
- **Closure:** identify a severe-infection pattern even when fever/WBC are low and state why pathogen clues cannot replace culture/source search.
- **Continuity rationale:** these KPs answer “is this now dangerous systemic infection and what Source clue family is present?”

## C-H26-LG02｜病原证据 + 三条并行行动：抗菌、源控、灌注

- **KP:** 05–08
- **Cognitive job:** `EVIDENCE_STACK + URGENT_PARALLEL_ACTION + SOURCE_CONTROL`
- **Goal:** choose blood/local/catheter samples, interpret repeated negative cultures cautiously, start the Current Source 1-hour IV-antibiotic line, control the source and add volume/perfusion action when shock appears.
- **Closure:** run all three treatment lines in parallel and explain which failure remains if only one or two lines are completed.
- **Continuity rationale:** sampling and treatment are one time-critical workflow; full hemodynamics remain B12.

## C-H26-LG03｜最终 sepsis Source-bound algorithm

- **KP:** 09
- **Cognitive job:** `URGENT_PARALLEL_ACTION + BOUNDARY_RECALL`
- **Goal:** execute focus → systemic high/low → perfusion/organ → culture → antimicrobial → source control → circulation → reassessment, while preserving the historical Lecture terminology/scoring gap.
- **Closure:** solve a fresh case without silently importing SOFA/qSOFA/lactate/pressor algorithms not owned by Current Source.
- **Continuity rationale:** singleton execution algorithm and historical-boundary guard.

**Learner order:** `LG01 → LG02 → LG03`.  
**Coverage:** `{1..9}` exactly once.

---

# H27 — 破伤风与气性坏疽

Stable KP coverage: **11 / 11**  
Accepted Logic Groups: **4**

## C-H27-LG01｜共同污染伤入口 + 神经毒素 vs 产气肌坏死分流

- **KP:** 01–02
- **Cognitive job:** `DISCRIMINATION + CAUSAL_CHAIN`
- **Goal:** retain the shared G+/spore/anaerobic/soil/hypoxic-wound exotoxin entry, then immediately split by target: inhibitory neural circuit vs muscle/cell membrane.
- **Closure:** from a contaminated wound, identify which downstream movie must be tested next rather than learning both as generic anaerobic infections.
- **Continuity rationale:** common entry and decisive branch are one orientation problem.

## C-H27-LG02｜破伤风：逆向运输 → 去抑制 → 痉挛；免疫/清创/气道并行

- **KP:** 03–07
- **Cognitive job:** `CAUSAL_CHAIN + URGENT_PARALLEL_ACTION + PRECISION_CLUSTER`
- **Goal:** connect retrograde axonal transport, Renshaw/glycine disinhibition, stimulus-triggered conscious spasms and muscle sequence to active/passive immunization, wound source control and airway protection.
- **Closure:** reconstruct the neural chain, identify the earliest/most dangerous muscle involvement and distinguish active antibody generation from immediate neutralization of free toxin while preserving Current Source immunization/antibiotic boundaries.
- **Continuity rationale:** mechanism, phenotype, immunization and treatment answer one tetanus emergency model.

## C-H27-LG03｜气性坏疽：产气肌坏死 → 失活判据 → 广泛源控制

- **KP:** 08–10
- **Cognitive job:** `CAUSAL_CHAIN + VISUAL_RECOGNITION + SOURCE_CONTROL`
- **Goal:** connect toxin/cell-membrane injury to pain/swelling/gas/black-malodorous wound/hemolysis, recognize the reverse-identification cluster and use discoloration/no contraction/no bleeding to determine debridement scope.
- **Closure:** identify gas gangrene before waiting for fluctuation/full culture and select debridement of nonviable tissue/muscle compartment or amputation according to Source boundaries.
- **Continuity rationale:** disease movie, recognition and source-control extent are one fast-moving tissue-failure problem.

## C-H27-LG04｜最终 contaminated-wound emergency algorithm

- **KP:** 11
- **Cognitive job:** `DISCRIMINATION + URGENT_PARALLEL_ACTION`
- **Goal:** choose tetanus vs gas-gangrene path, execute the distinct life-saving actions and monitor systemic toxicity/shock → H26.
- **Closure:** solve a fresh contaminated-wound emergency without treating both branches as ordinary purulent infection.
- **Continuity rationale:** singleton execution algorithm.

**Learner order:** `LG01 → LG02 → LG03 → LG04`.  
**Coverage:** `{1..11}` exactly once.

---

# Final Phase-3 accounting

```text
H20  13 KP → 4 LG
H21  13 KP → 4 LG
H22  10 KP → 3 LG
H23  17 KP → 6 LG
H24  17 KP → 5 LG
H25  16 KP → 5 LG
H26   9 KP → 3 LG
H27  11 KP → 4 LG
------------------
    106 KP → 34 LG
```

Correct batch total: **34 Logic Groups**. The preliminary “35” planning count was falsified during exact partition; no quota is defended.

Full C exact-review accounting:

```text
H1–H6     94 KP → 31 LG
H7–H11   100 KP → 29 LG
H12–H14   37 KP → 13 LG
H15–H19   86 KP → 26 LG
H20–H27  106 KP → 34 LG
-----------------------
C total  423 KP → 133 LG

Blocks accepted              27 / 27
Stable KPs accepted          423 / 423
KP omissions                 0
KP duplicate membership      0
Block/KP identity changes    0
Question relation changes    0
Source conflicts erased      0
External medicine expansion  0
```

## Phase-3 verdict

```text
Exact KP→Logic-Group semantic partition   PASS
27/27 Block natural-unit review           PASS
423/423 stable KP coverage                PASS
uniform quota                             REJECTED
source-boundary preservation              PASS
next stage                                compile single C Learning owner + progressive compression / negative-space acceptance
```
