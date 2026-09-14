# Xizong B S2 Physiology — Endocrine Exact Membership 2022–2026

Status: `PASS_BOUNDED`  
Scope: B-System Physiology endocrine exact official-question membership, years 2022–2026  
Authority: evidence shard only; `SOURCE.md` remains B Source owner and `content/xizong/questions/` remains Current Question Truth.

Current 27-edition Physiology Source exposes most of this recent endocrine membership directly in the endocrine overview / calcium / islet / thyroid / glucocorticoid teaching regions. Membership is still decided by the tested construct, not by mere Lecture adjacency.

This shard does not create Question→Block/KP mappings and does not modify stable Block/KP identity.

---

## 1｜Admitted exact qids

Count: **13 exact qids**.

### 2022 — 3

- `xizong-official-2022-n013` — steroid hormones bind nuclear receptors; **B endocrine-common receptor logic Primary**.
- `xizong-official-2022-n014` — excessive glucocorticoid secretion causing osteoporosis; **B GC Primary**.
- `xizong-official-2022-n015` — sympathetic activation suppressing insulin secretion; **B islet-control Primary**.

### 2023 — 4

- `xizong-official-2023-n015` — manifestations of hyperthyroidism; **B thyroid Primary**.
- `xizong-official-2023-n118` — calcitriol raises both blood calcium and phosphate; **B calcium/calcitriol Primary**.
- `xizong-official-2023-n119` — PTH raises calcium and lowers phosphate; **B calcium/PTH Primary**.
- `xizong-official-2023-n141` — Cushing syndrome blood-cell changes from glucocorticoid effects; **B GC Primary, blood phenotype interface**.

### 2024 — 3

- `xizong-official-2024-n014` — PTH promotes renal formation of active vitamin D3; **B calcium/PTH Primary, A3 renal interface**.
- `xizong-official-2024-n015` — chronic high-dose cortisol cannot be stopped abruptly because ACTH feedback suppression leads to adrenal-cortex atrophy; **B HPA/GC Primary**.
- `xizong-official-2024-n141` — endocrine hormone excess causing osteoporosis (cortisol, thyroid hormone, PTH); **B endocrine integrative / bone-effect Primary**.

### 2025 — 2

- `xizong-official-2025-n016` — fasting decreases thyroid-hormone secretion; **B HPT/thyroid Primary**.
- `xizong-official-2025-n140` — identify hormones secreted by the anterior pituitary; **B endocrine-common pituitary Primary**.

### 2026 — 1

- `xizong-official-2026-n015` — GIP directly increases insulin without first raising blood glucose; **B islet/incretin Primary**.

---

## 2｜Current Source support

Current Physiology Source directly supports the full admitted set:

- endocrine-common chapter: chemical classes / nuclear receptors and anterior-pituitary identity;
- calcium chapter: PTH and calcitriol Ca/P directions, kidney 1α-hydroxylation and PTH stimulation of active vitamin-D formation;
- islet chapter: sympathetic α2-dominant inhibition of insulin plus GIP / GLP-1 gut–islet feed-forward control;
- thyroid chapter: hyperthyroid systemic effects and fasting / cold / neural-humoral regulation of TH output;
- glucocorticoid chapter: HPA feedback, adrenal-cortex atrophy after chronic exogenous GC, bone effects and blood-cell redistribution.

`2026N15` is especially clear in Current Source: GIP is identified as the physiologic GI-hormone stimulus that directly promotes insulin secretion, while several other GI hormones act mainly through blood-glucose elevation.

---

## 3｜Explicit exclusions / no-double-count rules

### 2024N139 — endocrine answers, energy tested construct

Question target: hormones that stimulate thermogenesis quickly and briefly.

Decision: **already owned by the closed GI+energy/temperature slice; do not duplicate in endocrine membership**.

### 2022N16 / 2023N16 / 2024N16 / 2025N141 / 2026N16 — reproductive physiology

These test endometrial cycle, inhibin, post-tubal-ligation reproductive cycling, testosterone physiology or pre-ovulatory estrogen output.

Decision: `EXCLUDE → reproductive owner`.

### 2024N13 — hypothalamic feeding-center localization

Question target: stimulation site causing hyperphagia.

Decision: `EXCLUDE → neuro/hypothalamic Primary` despite downstream body-weight / metabolic consequences.

### 2024N140 — atropine / muscarinic blockade

Question target: generic autonomic effects after atropine.

Decision: `EXCLUDE from B endocrine Primary`.

### 2025N139 — renal GFR disease effects

Diabetes appears as an option, but the tested construct is GFR.

Decision: `EXCLUDE → A3 renal Primary`.

### Generic molecular / cell-signaling questions remain outside this endocrine slice

Examples around protein-kinase-coupled signaling, RNA/protein structure or general receptor pathways are not absorbed simply because insulin/GH or nuclear receptors can use those mechanisms.

Decision: tested generic molecular/cellular mechanism remains with its molecular/cell-function owner unless the question explicitly asks endocrine classification/effect.

---

## 4｜Boundary decisions worth preserving

### 2024N14 — kidney site, endocrine decision

The tested question is which hormone promotes renal formation of active vitamin D3. Current calcium-endocrine Source teaches this as the PTH → renal 1α-hydroxylase → calcitriol axis.

Decision: **B calcium/PTH Primary; A3 renal interface**.

### 2023N141 — blood count phenotype, GC decision

Although the answer is expressed as RBC / lymphocyte / eosinophil count changes, the question asks the systemic physiologic effects of Cushing/GC excess.

Decision: **B GC Primary; blood phenotype is interface**, just as organ-specific hormone effects remain endocrine-owned when hormone action is the tested construct.

### 2025N140 — prolactin option does not force reproductive ownership

The question asks **which hormones are secreted by the anterior pituitary**, a general endocrine structural classification. PRL is one member of the answer set, but the decision variable is pituitary endocrine identity, not lactation physiology.

Decision: **B endocrine-common Primary**.

---

## 5｜Batch verdict

`S2-PHYS-ENDOCRINE-2022-2026 = PASS_BOUNDED`

- admitted exact qids: `13`;
- all 13 resolve in Current Question Truth;
- Current Physiology Source directly supports their endocrine constructs;
- reproductive, neuro, renal and generic autonomic/molecular collisions were explicitly rejected;
- thermogenesis qids already owned by GI+energy were not double-counted;
- no unresolved blocker remains inside this 2022–2026 endocrine batch.

### Endocrine source-region subtotal so far

- 2005–2012: `25`
- 2013–2021: `22`
- 2022–2026: `13`
- **subtotal = 60 exact admitted qids**

This is not yet overall Physiology S2 PASS. Next S-only step: whole-Physiology endocrine negative-space / dedupe sweep across 2005–2026, then evaluate Physiology S2 closure.

K/L/P/R/E remain frozen.
