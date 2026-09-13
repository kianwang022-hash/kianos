# Xizong B S2 Physiology Source Audit

Status: IN_PROGRESS_EVIDENCE  
Scope: B — Physiology exact official-question membership  
Current closed mini-batch: 2013–2016, digestive physiology + energy metabolism / body temperature  
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

## 2｜First-party Physiology source regions used in this mini-batch

Raw source: `27精编生理合集【带导图】.pdf`.

Primary B regions:

- digestive overview / GI motility control — question block around physical PDF P209;
- oral cavity and esophagus — question block at physical PDF P215;
- gastric digestion — question block at physical PDF P225;
- intestinal digestion — `真题解析·肠内消化` in the Current GI section;
- intestinal absorption — question block at physical PDF P243;
- energy metabolism and body temperature — Chapter 7, Current question block spanning the late P240s–P254 region.

Important negative-space rule: a B-owned tested construct may be supported by a general physiology chapter outside these regions. The canonical example in this batch is `2013N1`, taught under transmembrane transport but testing intestinal luminal glucose uptake.

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

All 22 qids above resolve in Current sharded Question Truth and match the Lecture-attached tested construct closely enough for exact System-membership admission.

Question Truth classification fields are not used as evidence; they are null/unowned in these Current records. Membership here is reconstructed from first-party Source + Current immutable question identity.

---

## 4｜Negative-space / collision adjudication

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

## 6｜Mini-batch verdict

`S2-PHYS-2013-2016-GI-ENERGY = PASS_BOUNDED`

Meaning:

- 22 exact qids admitted;
- every admitted qid resolves in Current Question Truth;
- Source-chapter location was not used as a substitute for semantic ownership;
- explicit negative-space/collision cases were tested;
- no unresolved blocker remains **inside this mini-batch**;
- this is **not** an overall Physiology S PASS and **not** a B S PASS.

Next S-only step:

> continue Physiology GI + energy membership for the remaining years, using the same tested-construct / negative-space rule, then audit Physiology endocrine separately.

K/L/P/R/E remain frozen.