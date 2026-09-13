# Xizong B S2 Physiology Source Audit

Status: IN_PROGRESS_EVIDENCE  
Scope: B — Physiology exact official-question membership  
Current closed mini-batches: **2013–2016 + 2017–2021**, digestive physiology + energy metabolism / body temperature  
Authority: **evidence ledger only**. `SOURCE.md` remains the B Source owner; `content/xizong/questions/` remains Current Question Truth.

This file must not be used as K/L authority and must not create Question→Block/KP mappings.

---

## 1｜Fresh S2 method

For each candidate question:

1. start from Current raw Project Physiology PDF `27精编生理合集【带导图】.pdf`;
2. use the AI-readable derivative only as a locator for Lecture question tags and physical PDF pages;
3. resolve every `YYYYNxxx` against Current Question Truth by immutable `question_id`;
4. judge B membership by the **tested construct**, not by keyword, option entity, old classification, or the Lecture chapter where the question happened to be printed;
5. attack negative space and neighboring-System collisions before admitting the qid;
6. keep System membership separate from future Block/KP mapping.

Hard rule:

> A question is B-Primary only when the decision being tested is owned by B. Merely mentioning glucose, GI organs, hormones, vitamins, or B diseases does not transfer ownership.

---

## 2｜First-party Physiology source regions used in this audit

Raw source: `27精编生理合集【带导图】.pdf`.

Primary B regions:

- digestive overview / GI motility control — question block around physical PDF P209;
- oral cavity and esophagus — question block at physical PDF P215;
- gastric digestion — question block around physical PDF P225–P229;
- intestinal digestion — Current GI question blocks around physical PDF P230–P239;
- intestinal absorption — question block around physical PDF P243–P244;
- energy metabolism and body temperature — Chapter 7, Current question block around physical PDF P245–P255.

Important negative-space rule: a B-owned tested construct may be supported by a general physiology chapter outside these regions. Canonical examples are `2013N1` / `2017N1` (intestinal glucose uptake taught with membrane transport), `2020N4` / `2021N136` (B12 absorption mechanism taught with blood), and `2020N5` (hepatic synthetic failure taught with coagulation).

---

## 3｜Closed mini-batch: 2013–2016

### 3.1 Admitted exact qids

Count: **22 exact qids**.

#### 2013 — 7

- `xizong-official-2013-n001` — intestinal glucose entry into enterocyte; **B Primary, cross-unit support**.
- `xizong-official-2013-n012` — GI motility shared by stomach and small intestine; B Primary.
- `xizong-official-2013-n013` — salivary amylase optimal pH; B Primary.
- `xizong-official-2013-n123` — main heat-loss mode when environmental temperature equals skin temperature; B Primary (energy/temperature).
- `xizong-official-2013-n124` — main heat-loss mode at 25°C; B Primary (energy/temperature).
- `xizong-official-2013-n125` — factor inhibiting intestinal calcium absorption; B Primary (intestinal absorption tested construct).
- `xizong-official-2013-n126` — factor promoting intestinal iron absorption; B Primary (intestinal absorption tested construct).

`2013N125–126` are a shared-option B pair in the Lecture. Current Question Truth resolves both exact IDs. `2013N126` is stored as reviewed/corrected Question Truth; its Current qid/stem remains admissible for membership.

#### 2014 — 5

- `xizong-official-2014-n011` — vagal postganglionic transmitter causing gastrin release; B Primary.
- `xizong-official-2014-n012` — bile mechanism promoting fat digestion/absorption; B Primary.
- `xizong-official-2014-n013` — nutrient absorbed through intestinal lacteals; B Primary.
- `xizong-official-2014-n014` — respiratory quotient around 0.7; B Primary (energy metabolism).
- `xizong-official-2014-n154` — conditions/diseases with increased BMR; B Primary because the **tested construct is BMR**, despite options naming diseases owned by other Systems.

#### 2015 — 5

- `xizong-official-2015-n011` — gastric receptive relaxation innervation; B Primary.
- `xizong-official-2015-n012` — colipase role in fat digestion; B Primary.
- `xizong-official-2015-n013` — substance mainly absorbed in ileum (Vit B12); B Primary.
- `xizong-official-2015-n014` — normal body-temperature variation; B Primary.
- `xizong-official-2015-n154` — humoral factors markedly increasing thermogenesis; B Primary (energy/temperature tested construct).

#### 2016 — 5

- `xizong-official-2016-n011` — determinant of stomach/small-intestine peristaltic frequency (slow-wave rhythm); B Primary.
- `xizong-official-2016-n012` — consequences of complete gastric parietal-cell absence; B Primary.
- `xizong-official-2016-n013` — major GI hormone promoting pancreatic digestive-enzyme secretion; B Primary.
- `xizong-official-2016-n014` — mechanism of chills at onset of fever; B Primary under energy/temperature physiology.
- `xizong-official-2016-n154` — circumstances markedly increasing energy metabolism; B Primary.

### 3.2 Current Question Truth reconciliation

All 22 qids above resolve in Current sharded Question Truth and match the source-tested construct closely enough for exact System-membership admission.

Question Truth classification fields are not used as evidence; they are null/unowned in these Current records. Membership here is reconstructed from first-party Source + Current immutable question identity.

---

## 4｜Negative-space / collision adjudication for 2013–2016

### B-S2P-NEG-001｜2013N1 — INCLUDE despite general-chapter location

`2013N1` is taught in the general transmembrane-transport region, but the actual stem asks how glucose moves from the intestinal lumen into an enterocyte.

Decision: **INCLUDE B Primary**. Source chapter location does not outrank the tested GI-absorption construct.

### B-S2P-NEG-002｜2014N2 — EXCLUDE to A3

`2014N2` asks glucose reabsorption at the renal-tubule luminal membrane.

Decision: **EXCLUDE from B Primary; A3/renal ownership**. Shared transporter logic does not transfer organ ownership.

### B-S2P-NEG-003｜2014N154 — INCLUDE despite foreign option entities

The options include acute leukemia, thyrotoxicosis, polycythemia and diabetes, but the question asks which conditions increase **basal metabolic rate**.

Decision: **INCLUDE B Primary**. Option entities may belong to C/endocrine/other clinical owners; the tested decision variable is energy metabolism.

### B-S2P-NEG-004｜2014N1 / 2015N1 / 2016N1 — do not absorb by incidental B terms

These questions test general regulation/homeostasis or renal-fluid responses. Mentions such as postprandial glucose or endocrine/volume effects are examples/distractors, not B ownership evidence.

Decision: **not admitted by this B physiology batch**.

### B-S2P-NEG-005｜2015N152 — DEFER collision, not silently admitted

This X question asks which vitamin deficiencies cause megaloblastic anemia. It touches B vitamin/absorption interfaces and C hematology phenotype.

Decision: **DEFER_CROSS_SYSTEM_ADJUDICATION**. Do not count it in this digestive/energy mini-batch and do not assign it to C or B by keyword alone. Revisit during the biochemistry/vitamin and C-boundary reconciliation.

### B-S2P-NEG-006｜2015N156 / 2016N151 — EXCLUDE from this B primary slice

- `2015N156` tests general parasympathetic-system functional characteristics; GI effect is only one feature.
- `2016N151` tests generic exocytosis across cell types; an endocrine-cell example does not make the tested construct B-specific.

Decision: **not B Primary for this slice**.

---

## 5｜Resolved temporary concern

An earlier working note suspected `2014N11` had conflicting Source-unit attribution with energy metabolism. Fresh raw/Lecture readback resolves this: `2014N11` is the gastric-digestion question on vagal postganglionic gastrin-releasing transmission. The energy-metabolism question about the strongest specific dynamic action is `2025N11`, not `2014N11`.

Decision: **no Current Source conflict**; discard the temporary concern rather than preserve false debt.

---

## 6｜Mini-batch verdict: 2013–2016

`S2-PHYS-2013-2016-GI-ENERGY = PASS_BOUNDED`

Meaning:

- 22 exact qids admitted;
- every admitted qid resolves in Current Question Truth;
- Source-chapter location was not used as a substitute for semantic ownership;
- explicit negative-space/collision cases were tested;
- no unresolved blocker remains **inside this mini-batch**;
- this is **not** an overall Physiology S PASS and **not** a B S PASS.

---

## 7｜Closed mini-batch: 2017–2021

### 7.1 Admitted exact qids

Count: **25 exact qids**.

#### 2017 — 5

- `xizong-official-2017-n001` — glucose crossing the intestinal brush border; **B Primary, cross-unit support**.
- `xizong-official-2017-n008` — intestinal fat absorption; B Primary.
- `xizong-official-2017-n009` — food oxygen caloric equivalent; B Primary (energy metabolism).
- `xizong-official-2017-n137` — forms of small-intestinal movement; B Primary.
- `xizong-official-2017-n141` — sweat physiology; B Primary under thermoregulation.

#### 2018 — 4

- `xizong-official-2018-n007` — gastrin and delayed gastric emptying; B Primary.
- `xizong-official-2018-n008` — vitamins synthesized by large-intestinal bacteria; B Primary.
- `xizong-official-2018-n009` — BMR calculation from oxygen consumption / body surface area; B Primary.
- `xizong-official-2018-n139` — evidence supporting the body-temperature set-point model; B Primary.

#### 2019 — 4

- `xizong-official-2019-n006` — lower esophageal sphincter physiology; B Primary.
- `xizong-official-2019-n007` — bile salts and fat digestion/absorption; B Primary.
- `xizong-official-2019-n008` — energy expenditure that cannot ultimately become body heat (external muscular work); B Primary.
- `xizong-official-2019-n139` — properties/actions/secretion modes of GI hormones; B Primary.

#### 2020 — 6

- `xizong-official-2020-n004` — distal-ileum resection causing megaloblastic anemia through B12 malabsorption; **B Primary, C phenotype interface**.
- `xizong-official-2020-n005` — cirrhosis causing coagulation disorder through reduced hepatic coagulation-factor synthesis; **B Primary, C coagulation interface**.
- `xizong-official-2020-n008` — determinant of maximal gastric acid secretory capacity (parietal-cell number); B Primary.
- `xizong-official-2020-n009` — mixed micelles in intestinal lipid absorption; B Primary.
- `xizong-official-2020-n010` — strongest non-shivering thermogenic tissue (brown adipose tissue); B Primary.
- `xizong-official-2020-n139` — factors enhancing gastric emptying after a meal; B Primary.

#### 2021 — 6

- `xizong-official-2021-n008` — physiologic consequence after cholecystectomy relevant to bile concentration/fat digestion; B Primary.
- `xizong-official-2021-n009` — nutrient whose physical and biological caloric values differ (protein); B Primary.
- `xizong-official-2021-n118` — GI hormone primarily promoting pancreatic enzyme secretion; B Primary.
- `xizong-official-2021-n119` — GI hormone primarily promoting pancreatic water/HCO3− secretion; B Primary.
- `xizong-official-2021-n136` — causes of B12 deficiency through intrinsic-factor / terminal-ileal absorption failure; **B Primary, C phenotype interface**.
- `xizong-official-2021-n138` — endocrine hormones participating in thermogenesis; B Primary because **thermogenesis is the tested construct**.

### 7.2 Current Question Truth reconciliation

All 25 qids above resolve in Current sharded Question Truth. Their question identities are exact and independent of old classification fields.

The raw Physiology source directly contains these attached official-question identities across the GI, energy/temperature, blood-interface and general-transport regions. Cross-unit admission is therefore evidence-backed rather than inferred from general medical knowledge.

---

## 8｜Negative-space / collision adjudication for 2017–2021

### B-S2P-NEG-007｜2017N1 — INCLUDE; same rule as 2013N1

The question lives with general membrane transport but asks specifically about luminal glucose entry across the intestinal brush border.

Decision: **B Primary**. General transport is the mechanism substrate; the tested organ process is intestinal absorption.

### B-S2P-NEG-008｜2018N1 / 2019N1 / 2020N1 / 2021N1 — EXCLUDE generic control/homeostasis

These questions test generic feedback, steady state, set-point/control, or internal-environment concepts.

Decision: **not B Primary merely because temperature, glucose, hormones or digestion can use those generic control principles**.

`2020N1` is especially useful negative-space evidence: it asks the generic definition of a control-system set point. By contrast `2018N139` explicitly tests the **body-temperature set-point model** and is B energy/temperature Primary.

### B-S2P-NEG-009｜2020N4 — INCLUDE B, do not hand the whole question to C because the answer is “anemia”

The decisive mechanism is loss of terminal-ileal B12 absorption after distal ileal resection. The raw Physiology lecture explicitly reconstructs the `intrinsic factor → ileal B12 absorption → megaloblastic phenotype` chain.

Decision: **B Primary; C Recall/interface for the hematologic phenotype**.

### B-S2P-NEG-010｜2020N5 — INCLUDE B organ-specific interface, not the complete coagulation model

The question asks why a cirrhosis patient develops coagulation disorder. The raw Physiology source explicitly states that the bleeding tendency is mainly due to reduced hepatic synthesis of coagulation factors.

Decision: **B Primary for liver synthetic failure → complication; C retains the complete coagulation-factor cascade and coagulation-disorder model**.

This does not violate `SOURCE.md`: B may own an organ-specific consequence while only recalling the shared coagulation machinery.

### B-S2P-NEG-011｜2021N136 — INCLUDE B absorption etiology, not C full anemia model

The actual decision is which gastric/intrinsic-factor/terminal-ileal failures produce B12 deficiency. The raw Source presents the absorption chain directly.

Decision: **B Primary; C Recall/interface for megaloblastic-anemia phenotype/morphology**.

This differs from deferred `2015N152`, which directly asks which nutrient deficiencies produce megaloblastic anemia and therefore remains a B-vitamin/C-hematology ownership collision until the biochemistry/vitamin boundary is audited.

### B-S2P-NEG-012｜2018N8 / 2021N138 — tested construct outranks entity labels

- `2018N8` mentions vitamins, but tests **large-intestinal bacterial synthesis** → GI physiology, B Primary.
- `2021N138` lists endocrine hormones, but tests **thermogenic regulation** → energy/temperature, B Primary.

Decision: do not route by option vocabulary.

---

## 9｜Mini-batch verdict: 2017–2021

`S2-PHYS-2017-2021-GI-ENERGY = PASS_BOUNDED`

Meaning:

- 25 exact qids admitted;
- all 25 resolve in Current Question Truth;
- two high-risk blood/GI interface cases (`2020N4`, `2021N136`) and one liver/coagulation interface (`2020N5`) were explicitly adjudicated;
- generic-control false positives were explicitly attacked;
- no unresolved blocker remains **inside this mini-batch**.

### Running subtotal

`2013–2021 GI + energy/temperature = 47 exact admitted qids`

This subtotal is **not** the final Physiology System scope. Earlier years (2005–2012) and later years (2022–2026) still require the same fresh reconciliation, and Physiology endocrine is a separate S2 sub-batch.

---

## 10｜Next S-only step

Continue:

1. `2005–2012` GI + energy/temperature;
2. `2022–2026` GI + energy/temperature;
3. final GI/energy negative-space sweep across all Physiology official questions;
4. only then start the separate Physiology endocrine membership batch.

K/L/P/R/E remain frozen.