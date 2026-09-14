# Xizong B S2 Internal Medicine — Current Endocrine Exact Membership 2013–2025

Status: `PASS_BOUNDED`  
Scope: B-System Internal Medicine endocrine official-question membership directly recoverable from the Current Unified Internal Medicine Source, years 2013–2025  
Authority: S2 evidence shard only; `SOURCE.md` remains B Source owner and `content/xizong/questions/` remains Current Question Truth.

No Question→Block/KP relation is created here. Existing System / 38 Blocks / 600 canonical KPs remain hard assets and are not modified.

---

## 1｜Method

Current Internal Medicine Source is used as the first-party locator and content substrate. Multi-question case tags such as `YYYYN88-90` are expanded to exact immutable qids in Current Question Truth.

Admission rule:

```text
Current Internal Source exact tag / case range
+ exact Current Question Truth identity
+ tested-construct ownership under SOURCE.md
+ cross-owner collision attack
→ B System membership
```

The disease name or the chapter where a question is printed is not enough by itself.

---

## 2｜Admitted exact qids

Count: **77 unique exact qids**.

### A. Graves / thyrotoxicosis — 21

- `2013N108–110` — Graves diagnosis → TRAb confirmation → antithyroid-drug treatment.
- `2016N174` — Graves ophthalmopathy activity indicators.
- `2017N88–90` — Graves vs thyroiditis / diagnostic evidence / treatment.
- `2018N55` — thyrotoxic periodic paralysis.
- `2020N76–78` — atrial fibrillation presentation → hyperthyroidism as cause → treat underlying disease.
- `2021N88–90` — Graves diagnosis / drug choice / treatment logic.
- `2022N88–90` — Graves confirmation, methimazole-associated neutropenia, management boundary.
- `2024N159` — recurrent Graves during lactation and inappropriate treatment choices.
- `2025N88–90` — Graves diagnosis, TRAb, and treatment choice including pregnancy-planning boundary.

Exact qids:
`2013N108,109,110; 2016N174; 2017N88,89,90; 2018N55; 2020N76,77,78; 2021N88,89,90; 2022N88,89,90; 2024N159; 2025N88,89,90`.

### B. Hypothyroidism — 9

- `2019N88–90` — hypothyroidism recognition → thyroid-function confirmation → replacement principle.
- `2020N88–90` — hypothyroidism with cardiac/pericardial manifestations and treatment reasoning.
- `2021N70–72` — hypothyroid clinical case / diagnostic-treatment chain in the Current Internal source.

Exact qids:
`2019N88,89,90; 2020N88,89,90; 2021N70,71,72`.

### C. Primary aldosteronism — 4

- `2013N74` — first-line treatment by subtype / aldosterone antagonism.
- `2014N73` — earliest and most common clinical manifestation.
- `2016N74` — high-value differential against thyrotoxic periodic paralysis / renal tubular acidosis; Current source keys thyrotoxic periodic paralysis in this case, but the case is retained as an endocrine differential question within B.
- `2024N55` — aldosterone/renin-ratio confirmation in the Current Study test frame.

Exact qids:
`2013N74; 2014N73; 2016N74; 2024N55`.

### D. Pheochromocytoma — 5

- `2015N174` — cardiovascular presentations including sustained/paroxysmal hypertension, orthostatic hypotension and shock.
- `2018N88–90` — recognition → adrenal localization → acute alpha-blockade safety.
- `2025N55` — clinical features / adrenal vs extra-adrenal secretion pattern.

Exact qids:
`2015N174; 2018N88,89,90; 2025N55`.

### E. Cushing syndrome — 7

- `2014N108–110` — phenotype relevance → biochemical confirmation → adrenal-adenoma treatment and postoperative steroid-replacement logic.
- `2020N159` — clinical manifestations of Cushing syndrome.
- `2021N54` — Cushing diagnostic / localization construct in Current source.
- `2022N55` — etiologic diagnosis when ACTH and cortisol are elevated.
- `2023N54` — etiologic localization after ACTH measurement.

Exact qids:
`2014N108,109,110; 2020N159; 2021N54; 2022N55; 2023N54`.

### F. Endocrine-system common localization language — 3

- `2013N174` — bilateral adrenal-cortical hyperplasia with hypertension/hypokalemia across primary aldosteronism / Cushing disease differential.
- `2018N159` — endocrine-gland destruction causing hypofunction (T1DM / Addison / Hashimoto pattern).
- `2021N159` — adrenal diseases associated with hypertension and hypokalemia.

Exact qids:
`2013N174; 2018N159; 2021N159`.

### G. Diabetes mellitus / acute and chronic complications / treatment — 28

- `2013N73` — elderly T2DM with mainly postprandial hyperglycemia: treatment choice.
- `2014N74` — symptomatic hyperglycemia with ketonuria: insulin treatment.
- `2014N174` — diabetes testing / HbA1c / insulin-C-peptide interpretation.
- `2015N73` — diabetic retinopathy management boundary.
- `2015N74` — sulfonylurea choice with renal-function consideration.
- `2015N108–110` — HHS diagnosis → effective osmolality → fluid/insulin treatment.
- `2016N73` — DKA vs HHS discrimination.
- `2016N108–110` — DKA clinical recognition / diagnostic-treatment chain.
- `2017N55` — clinical basis for T1DM diagnosis.
- `2017N159` — treatment-related hypokalemia across DKA / insulin / Graves-eye steroid interfaces.
- `2019N55` — DKA recognition.
- `2019N159` — immune-mediated T1DM clinical features.
- `2020N55` — nocturnal hypoglycemia → Somogyi effect.
- `2022N159` — DKA treatment principles.
- `2023N88–90` — microvascular/autonomic complications, BP treatment, insulin intensification in long-standing T2DM.
- `2023N159` — DKA fluid / insulin / bicarbonate treatment boundaries.
- `2024N88–90` — diabetes diagnosis / treatment principle / MODY recognition.
- `2025N71–72` — DKA coma recognition and Kussmaul breathing.
- `2025N159` — drugs that stimulate pancreatic insulin secretion.

Exact qids:
`2013N73; 2014N74,174; 2015N73,74,108,109,110; 2016N73,108,109,110; 2017N55,159; 2019N55,159; 2020N55; 2022N159; 2023N88,89,90,159; 2024N88,89,90; 2025N71,72,159`.

---

## 3｜Explicit source-adjacency correction

### `2019N52` — EXCLUDE from endocrine; route to GI/liver batch

Current Unified Internal source prints `2019N52` next to diabetes questions, but the stem is:

`cirrhosis / upper-GI bleeding context → new agitation/confusion → first consider hepatic encephalopathy`.

Tested construct: **hepatic encephalopathy precipitated by GI bleeding in chronic liver disease**.

Decision:

`B GI/liver Primary; not endocrine membership.`

This is a direct demonstration that Source adjacency does not outrank the tested construct. The qid is carried into the Internal GI tranche rather than lost.

---

## 4｜Cross-owner boundaries preserved

### Kidney interfaces do not automatically move diabetes/endocrine questions to A3

Examples such as diabetic nephropathy treatment choice or glucose-lowering drug selection under renal impairment remain B when the tested decision is **diabetes management**. A3 still owns the complete renal transport / CKD / acid-base model.

### Cardiac manifestations do not move Graves/hypothyroid questions to circulation when endocrine disease is the decision variable

`2020N76–78` uses atrial fibrillation as presentation, but the causal diagnosis and treatment question explicitly resolve to hyperthyroidism. B endocrine owns the endocrine disease; circulation remains interface.

### Surgery is not silently absorbed

This tranche includes medical treatment choices taught as part of endocrine disease management. It does not pre-claim Surgery-owned operative technique / perioperative procedural questions that will be audited in the Surgery source tranche.

### Drug questions are admitted only when they are disease-management decisions

Antithyroid-drug adverse effects, DKA/HHS insulin/fluid treatment, sulfonylurea selection and endocrine-specific alpha blockade are included because the tested construct is the B disease-treatment model, not generic pharmacology.

---

## 5｜Current Question Truth reconciliation

All 77 exact qids are deterministic Current Question Truth identities under the year/range shard rule.

Representative direct readbacks confirm the exact case-chain identities, including:

- `2013N108–110` Graves case;
- `2014N108–110` Cushing case;
- `2015N108–110` HHS case;
- `2018N88–90` pheochromocytoma case;
- `2019N88–90` hypothyroidism case;
- `2022N88–90` Graves / antithyroid-drug neutropenia case;
- `2023N88–90` long-standing T2DM complications case;
- `2024N88–90` diabetes / MODY case;
- `2025N88–90` Graves case.

Null historical classification fields are not used as evidence.

---

## 6｜Batch verdict

`S2-IM-ENDOCRINE-CURRENT-2013-2025 = PASS_BOUNDED`

- exact admitted qids: `77`;
- all current endocrine Source blocks represented: Graves, hypothyroidism, primary aldosteronism, pheochromocytoma, Cushing, endocrine-common localization, diabetes;
- one source-adjacency false positive (`2019N52`) explicitly rerouted to the liver/GI tranche;
- renal/cardiac/drug/surgical interfaces remain bounded rather than silently re-owned;
- no Question→Block/KP mapping created;
- no count target used.

This is **not** overall Internal Medicine S2 PASS.

Next S-only work:
1. audit the Current GI/liver/pancreas Internal source tags, including `2019N52`;
2. separate Internal-owned medical diagnosis/treatment from Surgery-owned operative decisions printed as cross-links;
3. reconstruct older sparse years and 2026 where needed;
4. run whole-Internal negative-space + dedupe against closed Physiology/Pathology before subject closure.

K/L/P/R/E remain frozen.
