# Xizong B Source Truth

Status: CURRENT_CANDIDATE  
Scope: B — Digestive / Metabolic / Endocrine / Tumor  
Role: B System Source boundary + source-adjudication owner  
Parent gate: root `LEARNING_ACCEPTANCE.md` → `S｜Source`

This file owns **what Current first-party source material B may rely on, what B owns versus only recalls/applies, and how known source errors/conflicts/gaps are adjudicated before Knowledge is rebuilt**.

It does **not** own B medical Knowledge, learner order, Logic Groups, question→Block/KP relations, Runtime, Acceptance status, or Kian's learner state.

Hard rule:

> **Source evidence may be wrong, conflicting, incomplete or versioned. S must expose and adjudicate that fact before K is allowed to turn it into canonical medical Knowledge.**

---

## 1｜Current source set and precedence

### 1.1 Raw first-party Project PDFs

The Current Project source set used for this fresh B audit is:

| Domain | Current raw Project source | S status |
| --- | --- | --- |
| Physiology | `27精编生理合集【带导图】.pdf` | CURRENT raw source |
| Pathology | `27病理精编版合集【不带导图】.pdf` | CURRENT raw source |
| Internal Medicine | `内科_27内科精编版合集_带导图.pdf` | CURRENT raw source |
| Surgery | `27 外科跟课合集改.pdf` | CURRENT raw source |
| Biochemistry / Molecular Biology | `生化_26生化.pdf` | **PROVISIONAL raw source — no newer biochemistry PDF is currently present in the Project source set** |

The 26 biochemistry PDF is therefore usable only as the Current available B biochemistry baseline. It must not be described as the newest/latest version. A future newer source triggers a bounded delta audit; it does not silently rewrite Current truth.

### 1.2 Derived readable assets

`*_AI阅读版.md`, UnifiedSource files, Block Markdown, embedded ledgers and source-local reconstructions are **derived access / locator / reconstruction aids**.

They do not outrank the raw Project PDF when a claim is about what the source actually says.

Precedence for Source claims:

```text
Current raw Project PDF
→ source-faithful Current Unified/readable derivative when raw text/figure is inaccessible
→ Block-local source binding / reconstruction evidence
→ old guide / historical substrate only when explicitly needed
```

If a derived layer disagrees with a readable raw PDF, classify it as a derived-reading defect; do not manufacture a raw-source conflict.

### 1.3 Internal source precedence

When one raw source contradicts itself:

```text
formal chapter body / explicit stable table / repeated internally consistent chain
> isolated side-note / mnemonic / crowded figure annotation
```

When two first-party subjects legitimately use different exam-era conventions, preserve both provenance labels instead of silently merging them into one universal medical rule.

When a source statement is unsafe to admit into downstream Knowledge and no Current first-party source resolves it, **exclude the disputed precision from S-admitted truth** and require K to reconstruct it from admissible authoritative evidence rather than guessing.

---

## 2｜B ownership rule

B Source ownership is not “anything medically related to digestion/metabolism/endocrine”.

For every source region, ownership must be one of:

```text
PRIMARY
RECALL
APPLY / INTERFACE
DEFER / OUT-OF-SCOPE
```

A related mechanism does not transfer Primary ownership.

Current Block evidence supports these recurring boundaries:

- normal GI motility/secretion/digestion/absorption → B Primary;
- digestive organ disease and abdominal-surgical decisions assigned to D Blocks → B Primary;
- metabolism, enzymes, vitamins, lipid/amino-acid/nucleotide/heme pathways and molecular biology assigned to M/G Blocks → B Primary under the provisional 26 biochemistry source;
- endocrine common language plus thyroid/adrenal/calcium-PTH/GH and diabetes assigned to D Blocks → B Primary to the explicitly source-supported depth;
- complete renal water/electrolyte/acid-base/CKD-MBD model → A3 Primary, B only interface/Recall where needed;
- complete hematology/coagulation/hemolytic-disease model → C or other owning System, B only biochemical/organ interfaces;
- complete immune/infection model → owning System; B owns organ-specific GI/liver consequences only where its first-party source does;
- reproductive endocrine/pregnancy management → E or later owning scope; B only interfaces;
- complete neurologic localization → D System, not B;
- tumor-general morphology/behavior → O9 / tumor-general owner; B owns organ-specific digestive/endocrine tumor application and its G molecular foundation only;
- modern comprehensive oncology/pharmacology/guideline replacement → not silently imported into Current B Source.

Examples already supported by Current Blocks:

- D12 recalls shared TB immunopathology instead of re-owning the complete TB model;
- D14 explicitly routes cryptorchidism/hydrocele out to reproductive ownership;
- D11/D15/D18 recall tumor-general language rather than rebuilding a second tumor-general owner;
- D17 uses coagulation/shock/renal failure as interfaces without claiming those complete models;
- D23 recalls renal VitD/CKD-MBD interfaces rather than moving renal ownership into B.

---

## 3｜Fresh Source adjudication ledger

The following items were rechecked against the raw Project PDFs during the fresh S audit. Their previous labels such as `待核对`, `SOURCE_CONFLICT`, `VISUAL_SOURCE_GAP`, or AI-reading uncertainty do not by themselves remain Current adjudication.

### 3.1 Confirmed source errors / unsafe source statements

These source statements **must not be propagated as canonical medical truth**. K may later reconstruct the correct rule from admissible evidence.

#### B-SERR-001｜Physiology P400 — hyperthyroidism / PTH typo

Raw physiology places the statement “甲状腺功能亢进患者PTH过度分泌” inside the PTH excess / bone-resorption context, while the same page's surrounding model concerns hyperparathyroidism and later text identifies parathyroid hyperfunction.

**S decision:** treat `甲状腺功能亢进` in that sentence as a raw-source wording error. Do not teach “hyperthyroidism causes PTH over-secretion” from this line.

#### B-SERR-002｜Pathology P82 — calcitonin “升钙升磷” side-note

The same pathology page's medullary-carcinoma body says C-cell calcitonin secretion can cause hypocalcemia, while its side-note labels CT “升钙升磷”. Formal physiology source independently gives CT a blood-Ca/P-lowering direction.

**S decision:** the isolated pathology side-note is rejected from downstream truth; formal calcium-regulation source wins for this axis.

#### B-SERR-003｜Internal Medicine P107 — normal saline “高氯性碱中毒”

The raw internal-medicine PDF itself contains this phrase; it is not merely OCR invented by the AI-readable layer.

**S decision:** exclude this isolated acid-base claim from B Source-admitted truth. Do not use it to build Knowledge. K must use the owning acid-base physiology/renal evidence for the actual mechanism.

#### B-SERR-004｜Surgery P30 — TB ascites “草绿色透明液” shortcut

Internal Medicine's TB-peritonitis source gives straw-yellow fluid as the dominant description; Surgery's quick puncture table uses “草绿色透明液”. These cannot both serve as equal Primary descriptions of TB peritonitis.

**S decision:** for D12's complete TB-peritonitis model, Internal Medicine is Primary. The Surgery quick-table color phrase is rejected as a reliable defining feature; D13 may retain only the general role of diagnostic paracentesis.

#### B-SERR-005｜Biochemistry P25 — F-1,6-BP listed as FBPase-1 inhibitor

The raw 26 biochemistry PDF lists both F-1,6-DP and F-2,6-DP as inhibitors of fructose-1,6-bisphosphatase-1, while the same pathway uses F-1,6-BP as the reaction substrate.

**S decision:** reject “F-1,6-BP is an inhibitor” from downstream truth. Preserve only the stable pathway identity until K reconstructs regulation correctly.

#### B-SERR-006｜Biochemistry phospholipid map — phospholipase over-generalization

The raw source includes both a phospholipid cleavage-position diagram and the blanket phrase “磷脂酶水解一定会得到甘油二酯”, and also labels phosphatidic-acid→DAG in a way that conflates the relevant enzyme identity.

**S decision:** do not admit the blanket “all phospholipases yield DAG” rule or the ambiguous PA→DAG enzyme label as canonical truth. Stable phospholipid identities/routes remain usable; exact enzyme mapping requires K reconstruction.

#### B-SERR-007｜Biochemistry nucleotide/urea diagrams — CO₂ labeled “甲酰基”

Raw biochemistry places `CO₂（甲酰基）` beside carbamoyl-phosphate / pyrimidine-synthesis diagrams.

**S decision:** reject the `CO₂ = 甲酰基` terminology from downstream truth. The source still supports CO₂ participation in the relevant reaction; exact chemical role is a K-level reconstruction.

#### B-SERR-008｜Biochemistry nucleotide map — UTP→CTP described as methylation

The raw source separately shows UTP→CTP with glutamine and dUMP→dTMP with one-carbon participation, but an explanatory line calls UTP→CTP the core methylation step.

**S decision:** reject that explanatory line. Do not propagate UTP→CTP as a methylation reaction.

#### B-SERR-009｜Biochemistry amino-acid side-note — “all amino acids → acetyl-CoA → fatty acid”

This blanket statement appears in the raw source and conflicts with the same source's own glucogenic/ketogenic distinctions.

**S decision:** reject the blanket statement from downstream truth.

#### B-SERR-010｜Physiology P404 — stomach-discovered GH factor mislabeled as GHRH

The raw physiology source places “最初在胃黏膜发现” under wording labeled as a growth-hormone-releasing hormone entry, while the same section separately lists hypothalamic GHRH.

**S decision:** treat the stomach-discovered clause as a mislabeled/unsafe precision and exclude that naming linkage. Preserve the stable hypothalamic GHRH/SST GH-regulation axis; do not silently invent a replacement source label inside S.

### 3.2 Versioned / conditional source statements — preserve provenance, do not flatten

#### B-SVER-001｜D15 Dixon distal margin 1 cm vs 2 cm

The raw Surgery source contains a newer low-rectal/sphincter-preserving `≥1 cm` rule and a traditional/older `≥2 cm` Dixon rule; historical exam material also tests 2 cm.

**S decision:** this is versioned/conditional exam-source provenance, not one unresolved universal cutoff. Downstream Knowledge must preserve context/version rather than choose one number without qualifier.

#### B-SVER-002｜D22 aldosterone/renin ratio >30 vs >50

The raw Internal Medicine body gives `>30`, while a source-local 2024 question uses `>50` as the keyed option.

**S decision:** preserve both as source-era/assay/exam-context evidence. Do not create one universal ARR threshold from B Source alone.

#### B-SVER-003｜Biochemistry essential-fatty-acid list

The 26 source lists linoleic acid, linolenic acid and arachidonic acid together as essential-fatty-acid study items.

**S decision:** preserve this only as a 26-source exam convention. It is not permission to make an unqualified modern biochemical universality claim downstream.

### 3.3 Derived-reading defects resolved by raw PDF

#### B-SRES-001｜M2 glycolysis sequence

An earlier AI/semantic reconstruction blurred where NADH and ATP arise around G3P → 1,3-BPG → 3-PG → 2-PG → PEP.

The raw PDF itself is sufficiently clear on the pathway ordering.

**S decision:** this is **not** a Current raw-source conflict. Treat the older conflict label as a derived-reading defect. Raw PDF controls.

### 3.4 Source-present but exact precision remains excluded / unresolved

These are not permission to guess.

#### B-SAMB-001｜M7 glycerol complete-oxidation ATP number

The raw source's text/figure layer exposes `16.5/18.5` near the glycerol energy accounting but the present machine-readable Project representation does not stably identify the exact intended mapping.

**S decision:** source is present; precision remains excluded until the raw visual is directly verified or K derives it from accepted energy-accounting rules. This is not a reason to invent one number.

#### B-SAMB-002｜G3 EF-G exact GTPase wording

The source clearly supports EF-G-mediated translocation using GTP, while exact “EF-G itself is/is not a GTPase” wording is inconsistent/unstable in the available source layers.

**S decision:** admit only `EF-G mediates translocation and the process uses GTP`; exclude the disputed enzyme-property precision from Source truth pending K-level authoritative reconstruction.

#### B-SAMB-003｜G4 enhancer promoter-specificity wording

P169's precise enhancer/promoter-specificity wording is not stable in the machine-readable source layer.

**S decision:** admit only the stable source claims that enhancer is a cis-regulatory element and has flexible position/distance/orientation behavior in the study model. Do not assert “strict specificity” or “no specificity” from this source.

#### B-SAMB-004｜G5 double-strand-break repair taxonomy

The raw source diagram places homologous-recombination language and DNA-PK/XRCC4 on one broad double-strand-break repair map without reliably separating modern HR versus NHEJ taxonomy.

**S decision:** admit only the higher-level claim that the source covers double-strand-break repair interfaces. Exact subtype ownership/mechanism must be reconstructed at K if required.

#### B-SAMB-005｜M10 UGT / Fe²⁺ claim

The Block derivative records a P082 statement that UGT conjugation requires Fe²⁺, but the Current Project text extraction has not independently recovered a stable raw-PDF line supporting that exact pairing.

**S decision:** exclude the Fe²⁺ precision. Admit the stable UCB → hepatic conjugation → CB chain and UGT/UDP-glucuronate interface only to the level directly supported by reliable source evidence.

---

## 4｜True Source gaps versus projection/parse debt

### 4.1 True / learner-relevant source gaps

A true Source gap means the raw first-party source set itself does not safely support the requested precision.

Current explicit examples:

- D9: the exact “how many hours before sleep should GERD patients stop eating?” number is not recoverable from the Current raw Internal Medicine source text; do not fill it from general memory.
- D6: no single complete modern endocrine dynamic-testing table is owned by Current B Source; only the source-supported minimum logic may be learned.
- D23: Current source supports GH normal physiology and minimum syndrome recognition, not a complete modern pituitary/GH diagnostic-imaging-treatment model.
- M/G: where the 26 source itself is ambiguous or internally wrong, downstream K must reconstruct rather than promote the bad sentence.
- Biochemistry version debt: no newer biochemistry PDF currently exists in the Project source set; the entire M/G source is explicitly provisional against future newer-source delta review.

### 4.2 Not a Source gap: raw PDF exists, repo/derivative lacks embedded visual

Many Blocks currently say `VISUAL_SOURCE_GAP` because the repository artifact or AI-readable Markdown lacks mounted `SOURCE_PAGES` / stable image extraction.

For this fresh S audit:

```text
raw PDF present in Project
+ original Lecture/MarginNote is the approved primary reading surface
→ NOT a missing Source
```

Such items are **projection/access/parse debt**, unless the raw PDF itself is missing or unreadable for the learner.

Do not use a missing repo screenshot as evidence that the source material does not exist.

---

## 5｜Block-local source bindings

The canonical Block Markdown remains the narrow owner of each Block's local source locator, including:

- Primary page/range;
- local Outline/embedded-question coverage;
- Recall / Apply / Defer links;
- source-local visual gate;
- source-local conflict/gap evidence.

This `SOURCE.md` owns the **Current adjudication** when a local file still contains an older `待核对` or ambiguous label.

Therefore:

> **local Block source binding = where the evidence lives; `SOURCE.md` = what Current S has decided that evidence is allowed to mean.**

A stale local `SOURCE_CONFLICT / 待核对` label does not reopen an item already explicitly adjudicated above; a new contradictory raw-source observation does.

---

## 6｜S1 negative-space / collision checklist

Fresh S1 review has specifically challenged these high-risk ownership edges:

- GI physiology ↔ later GI disease;
- TB organ disease ↔ respiratory/infection common model;
- diabetes ↔ renal/cardiovascular/neuro complications;
- abdominal trauma/acute abdomen ↔ shock/coagulation/critical-care owners;
- thyroid/parathyroid ↔ renal Ca/P and reproductive endocrine;
- liver disease ↔ coagulation, renal failure, infection and tumor-general;
- organ tumor ↔ O9 tumor-general + G molecular foundation;
- RBC/heme/iron/B12 interfaces ↔ hematology;
- molecular biology ↔ complete genetics/oncology/pharmacology beyond the Current source.

No fresh evidence so far justifies moving those neighboring complete models into B Primary ownership.

---

## 7｜S1 conclusion

Fresh Source-boundary reconstruction is now allowed to conclude only:

> **The B medical/source ownership boundary is usable as a Current S1 substrate, provided the error exclusions, version labels, true source gaps and provisional 26-biochemistry status above remain explicit.**

This is **not root `S PASS`**.

Root S remains active because B still lacks a fresh accepted **exact official-question System membership owner** reconciled to this Source boundary and Current Question Truth.

The next eligible work inside S is therefore only:

```text
S1 Source boundary/adjudication owner
→ S2 exact official-question membership
→ negative-space / collision falsification
→ deterministic qid validation
→ only then overall S acceptance decision
```

K remains downstream-frozen.

---

## 8｜S2 hard constraints

The future B question-scope owner must:

- enumerate stable exact `xizong-official-YYYY-nNNN` IDs;
- resolve every ID against Current Question Truth;
- derive membership from this accepted source boundary plus explicit inclusion/exclusion/collision decisions;
- never target a desired historical count such as `1072`;
- never use nullable Current `classification.system/block/chapter/subject` fields as hidden authority;
- never infer Question→Block / Logic Group / KP relations from System membership;
- test neighboring-System false positives and likely B false negatives;
- preserve real ambiguity instead of count-fitting it away;
- produce a deterministic unique inventory and integrity hash.

Until that exists and survives falsification, **S stays open and K/L stay frozen**.
