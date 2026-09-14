# Xizong B S2 Pathology — Whole-Pathology Negative-Space / G5-vs-O9 Reconciliation

Status: `PASS_BOUNDED`  
Scope: Current Pathology Source + Current Pathology-band Question Truth, 2005–2026, outside the already closed B organ slices  
Authority: evidence shard only; `SOURCE.md` remains B Source owner and Current Question Truth remains canonical question identity.

Starting B organ-Pathology inventory:

```text
2005–2012 organ reconstruction   17
2013–2025 Current-source organ   51
2026 Current reconstruction       3
-----------------------------------
organ-Pathology subtotal         71
```

This sweep attacks two kinds of error:

1. false negatives: a B-owned construct taught in a general Pathology region but missed by organ-first scanning;
2. false positives: tumor-general / general-injury / infection questions that mention B organs but are not B Primary.

The key authority boundary from `SOURCE.md` is:

```text
tumor-general morphology/behavior → O9 Primary
B → organ-specific digestive/endocrine tumor application + G molecular foundation
```

---

## 1｜B G5 molecular questions inside the Pathology tumor-general pages

Current Pathology P189–193 directly prints several official questions whose **tested construct is not O9 morphology/behavior**, but canonical B `G5｜DNA损伤、癌基因、重组与分子技术`.

G5 itself explicitly owns:

- proto-oncogene / oncogene activation;
- tumor-suppressor / p53 control;
- DNA damage interfaces;
- sequencing / molecular detection tools.

Therefore the following exact qids are admitted to B System membership even though their first-party Pathology locator sits in the tumor-general chapter.

### `xizong-official-2013-n048`

Stem: which proto-oncogene is mainly activated into an oncogene by point mutation → `RAS`.

Decision: `B G5 Primary`.

Reason: tested construct is **molecular oncogene activation mode**, not tumor differentiation, grade, invasion or metastasis.

### `xizong-official-2016-n051`

Stem: effective technique for detecting whether colorectal-cancer `RAS` proto-oncogene is activated → sequencing.

Decision: `B G5 Primary; colorectal organ example is application context`.

Reason: the decision variable is **sequence-level molecular detection**, explicitly owned by G5. It is not a generic colorectal morphology question and not O9.

### `xizong-official-2016-n166`

Stem: principal p53 actions after DNA damage → G1 arrest + apoptosis.

Decision: `B G5 Primary`.

Reason: G5 owns the p53 “stop → repair / fail → die” molecular gate; O9 only recalls this molecular substrate when teaching tumor behavior.

### `xizong-official-2024-n148`

Stem: which genes are proto-oncogenes → RAS / MYC.

Decision: `B G5 Primary`.

Reason: tested construct is the molecular identity of growth-promoting genes, directly within G5.

### Molecular addition count

`4` unique qids.

These four are not duplicated into O9 and must be deduped when the later Biochemistry/Molecular subject tranche is audited.

---

## 2｜O9 remains Primary for true tumor-general questions

The following classes are **not** moved into B merely because B contains organ tumors or because molecular terms appear nearby:

- anaplasia / differentiation;
- grade vs stage;
- tumor parenchyma vs stroma;
- benign / malignant / borderline naming;
- general invasion / metastasis;
- generic precancerous-lesion comparison;
- general cancer vs sarcoma / IHC lineage discrimination;
- tumor growth autonomy / clonality;
- generic viral/chemical carcinogenesis lists.

Representative explicit exclusions:

- `2013N47` — anaplasia;
- `2013N49` — CK+/vimentin− → carcinoma lineage;
- `2013N50` — compare cancer risk across precancerous lesions from different organs;
- `2013N164` — generic carcinoid characteristics;
- `2014N46` — hereditary-tumor category;
- `2014N134` — choristoma / 迷离瘤 definition using ectopic pancreas in stomach;
- `2015N46` — identify carcinoma in situ across organ examples;
- `2016N46` — benign-tumor naming;
- `2016N165` — tumor parenchyma vs stromal cells;
- `2017N148` / `2025N149` — EBV tumor/disease association as tumor-etiology / infection interface;
- `2018N33`, `2018N152`, `2019N32`, `2020N32`, `2020N149`, `2021N150`, `2022N30`, `2022N33`, `2023N35`, `2023N40`, `2024N32` — general tumor language/behavior.

Decision: `EXCLUDE from B Primary → O9 / other owning overlay`.

A gastric or colorectal word in an option does not override the fact that the question is testing a cross-organ tumor-general rule.

---

## 3｜Organ-specific exceptions inside tumor-general pages remain B

The negative-space readback also found/confirmed true B organ questions embedded in the tumor-general pages. These are already incorporated into the repaired organ shard and therefore add **0 new qids here**:

- `2014N133` — chronic atrophic gastritis morphology;
- `2014N167` — gastric-mucosal precancerous lesions.

Their tested construct is restricted to the gastric organ model, unlike the surrounding O9 questions.

---

## 4｜General-injury pages: B organ examples do not transfer ownership

Whole-Pathology keyword scanning outside the obvious B chapters found several B-organ examples in general Pathology sections. They remain outside B because the tested construct is generic injury/repair language.

### `2013N43` / `2025N29` — Mallory body

Alcoholic-liver hepatocytes are the example, but the tested construct is intracellular inclusion / cell-injury morphology or composition.

Decision: `EXCLUDE from B organ Primary → general cell-injury owner`.

### `2015N41` — healed acute erosive gastritis

The gastric lesion is an example used to test **regeneration / repair outcome**.

Decision: `EXCLUDE → general repair owner`, not B gastritis Primary.

### `2016N42` — bowel content draining from an appendectomy incision

The abdominal-surgical setting is an example used to identify a **fistula / abnormal repair channel**.

Decision: `EXCLUDE → general repair / wound-complication language owner`; B may later apply the concept clinically.

---

## 5｜Infection pages: only organ application crosses into B

Already admitted organ applications:

- `2011N133` — intestinal-TB transverse ulcer;
- `2013N54` — intestinal-TB ulcer direction from mucosal lymphatics;
- `2017N36` — intestinal TB causing stenosis.

Not admitted:

- pulmonary TB, generic granuloma, caseous necrosis, bacillary virulence;
- intestinal amoebiasis / typhoid / bacillary dysentery inflammatory-type questions (`2011N134`, `2012N55`, `2022N35`, `2026N40`, etc.).

Decision: complete infection/immunopathology remains with the infection owner. B owns only the explicit digestive-organ consequence where the organ lesion itself is the tested decision.

---

## 6｜2026 false-negative check

Current readable Pathology does not yet print 2026 question tags, so 2026 was scanned directly from exact Current Question Truth against Current Pathology Source.

B Pathology membership recovered:

- `2026N36` — interface/piecemeal hepatitis necrosis;
- `2026N37` — Graves / diffuse toxic goiter histology;
- `2026N39` — T2DM islet amyloid change.

No additional 2026 Pathology-band B candidate remains after rejecting generic injury, lung/cardiac pathology, small-cell-lung markers and bacillary dysentery.

---

## 7｜Negative-space verdict

`S2-PATH-NEGSPACE-G5-O9 = PASS_BOUNDED`

Results:

```text
new organ qids from final negative-space sweep  0
new B G5 molecular qids                          4
O9/general/infection false positives          rejected explicitly
unresolved Pathology membership ambiguity        0
```

Unique Pathology-derived B membership before subject closure:

```text
organ Pathology  71
G5 molecular      4
-------------------
subtotal          75
```

The `75` is an evidence result, never a target.

K/L/P/R/E remain frozen until overall B Source closes.
