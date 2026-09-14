# Xizong B S2 Physiology — Endocrine Exact Membership 2013–2021

Status: `PASS_BOUNDED`  
Scope: B-System Physiology endocrine exact official-question membership, years 2013–2021  
Authority: evidence shard only; `SOURCE.md` remains B Source owner and `content/xizong/questions/` remains Current Question Truth.

This shard uses Current Physiology endocrine Source + exact Current Question Truth and judges membership by the **tested construct**, not by where the question happens to be printed or by hormone names in options.

It does not create Question→Block/KP mappings and does not modify stable System / Block / KP identity.

---

## 1｜Admitted exact qids

Count: **22 exact qids**.

### 2013 — 3

- `xizong-official-2013-n021` — consequence of adrenal-cortex hypofunction; **B adrenal/endocrine Primary**.
- `xizong-official-2013-n022` — chemical nature of thyroid hormone; **B endocrine-common / thyroid Primary**.
- `xizong-official-2013-n121` — insulin suppressing A-cell glucagon secretion as paracrine regulation; **B endocrine-common / islet Primary**.

### 2014 — 3

- `xizong-official-2014-n021` — GH promotes growth indirectly through IGF; **B GH Primary**.
- `xizong-official-2014-n022` — ACTH / glucocorticoid rise in stress; **B HPA/GC Primary**.
- `xizong-official-2014-n023` — liver as the major target of glucagon for glucose metabolism; **B islet/glucagon Primary**.

### 2015 — 2

- `xizong-official-2015-n021` — thyroid-hormone synthesis step not catalyzed by TPO; **B thyroid Primary**.
- `xizong-official-2015-n023` — somatostatin suppressing insulin by paracrine action; **B islet-control Primary**.

### 2016 — 3

- `xizong-official-2016-n021` — GH shifts fuel use from glucose toward fat; **B GH Primary**.
- `xizong-official-2016-n022` — oral glucose causes more insulin than IV glucose through GIP / incretin effect; **B islet / gut–islet endocrine Primary**.
- `xizong-official-2016-n023` — final formation site of active 1,25-(OH)2-vitamin D3; **B calcium-regulating endocrine Primary, A3 renal interface**.

### 2017 — 2

- `xizong-official-2017-n015` — GH effect on substrate metabolism; **B GH Primary**.
- `xizong-official-2017-n119` — PTH secretion controlled mainly by metabolite feedback; **B calcium/PTH Primary**.

### 2018 — 2

- `xizong-official-2018-n014` — thyroid hormone acts through nuclear receptor; **B thyroid Primary**.
- `xizong-official-2018-n015` — calcitriol raises both blood calcium and phosphate; **B calcium/calcitriol Primary**.

### 2019 — 3

- `xizong-official-2019-n014` — GH excess causing pituitary glycosuria / hyperglycemic metabolic abnormality; **B GH Primary**.
- `xizong-official-2019-n015` — thyroid hormone is most important for embryonic brain development; **B thyroid Primary**.
- `xizong-official-2019-n016` — HPA cortex system is the major stress-response system; **B HPA/GC Primary**.

### 2020 — 2

- `xizong-official-2020-n014` — thyroid hormone is anabolic at physiologic level but catabolic when excessive; **B thyroid Primary**.
- `xizong-official-2020-n015` — glucocorticoid permissive effect on norepinephrine vasoconstriction; **B GC Primary**.

### 2021 — 2

- `xizong-official-2021-n014` — markedly elevated IGF-1 suggesting acromegaly; **B GH/IGF Primary**.
- `xizong-official-2021-n015` — bilateral adrenalectomy rapidly fatal because adrenal-cortex hormones are lost; **B adrenal/GC Primary**.

---

## 2｜Current Source support

The Current Physiology Source explicitly preserves the six endocrine owners used here:

- endocrine overview: secretion modes, feedback and pituitary control;
- CT / PTH / calcitriol;
- GH / IGF and its protein/lipid/glucose effects;
- insulin / glucagon, including paracrine control and incretin physiology;
- thyroid hormone synthesis, nuclear receptor and systemic effects;
- HPA / glucocorticoid stress physiology and permissive action.

The Current Lecture itself prints several of these exact tags, including `2013N121–122`, `2017N118–119`, `2015N21`, `2016N22`, `2018N14`, `2019N15`, `2020N14`, and the related endocrine chapter series. Old/current page placement is used only as evidence, not as the membership rule.

---

## 3｜Explicit exclusions / neighboring-owner collisions

### 2013N122 — Current endocrine overview example, but A3 remains Primary

`2013N122` asks the secretion mode by which vasopressin promotes collecting-duct water reabsorption.

The endocrine overview prints it as an example of blood-borne hormonal regulation, but the tested effector process is ADH acting on the collecting duct, a renal-water-control mechanism.

Decision: `EXCLUDE from B Primary → A3 Primary; endocrine-common Recall/interface only`.

This is an intentional example of **Source location not overriding System ownership**.

### 2015N22 — sympathoadrenal emergency response

Question target: which system is immediately mobilized when environmental conditions change acutely; answer is the sympathetic–adrenal-medulla system.

Decision: `EXCLUDE from B endocrine Primary` because the tested controller is generic sympathoadrenal/autonomic emergency regulation. B adrenal physiology may Recall catecholamine interfaces, but this is not a B endocrine-owned decision variable.

### 2017N118 — oxytocin regulation

Question target: regulation form of oxytocin secretion.

Decision: `EXCLUDE → reproductive/neuroendocrine owner`, not B Primary. Its presence beside PTH in an endocrine-overview B pair does not transfer reproductive ownership.

### Generic autonomic questions

Examples such as `2013N20` and `2019N13` ask broad sympathetic/parasympathetic effects; insulin or GI behavior appears as one option/effect.

Decision: `EXCLUDE from B endocrine Primary`.

### Generic signal-transduction sets

`2013N156`, `2014N151`, `2015N151`, `2019N136`, `2020N136` test general receptor / second-messenger / cell-signaling classification. Insulin or thyroid hormone may appear among the options, but the object being tested is general cell signaling.

Decision: `EXCLUDE from this B endocrine membership slice`.

The older `2012N21` remains a bounded endocrine-common edge case in the 2005–2012 shard because its entire decision is framed as “which hormone uses IP3/DG”; this does not authorize absorbing the later generic signaling sets.

### Reproductive endocrine remains outside B

Examples include ovarian/testicular/placental and sex-steroid questions (`2013N23–24`, `2014N24`, `2016N24`, `2018N16`, `2020N16`, `2021N16`).

Decision: `EXCLUDE → reproductive owner`.

### Thermogenesis already belongs to the closed GI+energy slice

`2015N154` and `2021N138` are not duplicated here because the tested construct is thermogenesis / energy metabolism, even though endocrine hormones are the answer entities.

---

## 4｜Boundary decisions worth preserving

### 2016N23 — kidney location does not automatically make it A3

The question asks where **active calcitriol is finally generated**. The Current calcium-regulating-hormone chapter explicitly teaches skin → liver → kidney activation and the PTH–1α-hydroxylase connection.

Decision: **B calcium-endocrine Primary, A3 renal interface.** The tested object is hormone activation within the calcium axis, not renal transport or water/electrolyte handling.

### 2016N22 — GI hormone answer, endocrine endpoint

The oral-vs-IV glucose question is about the incretin enhancement of **insulin secretion**. Current Source places this within the insulin/glucagon chapter and explicitly frames the gut–islet axis as feed-forward endocrine control.

Decision: **B endocrine/islet Primary**, not duplicate GI digestion ownership.

---

## 5｜Batch verdict

`S2-PHYS-ENDOCRINE-2013-2021 = PASS_BOUNDED`

- admitted exact qids: `22`;
- all 22 resolve in Current Question Truth;
- endocrine-common, calcium, GH, islet, thyroid and GC constructs are directly supported by Current Physiology Source;
- renal/ADH, reproductive, generic autonomic and generic signaling false positives were explicitly rejected;
- thermogenesis questions already in the 96-qid GI+energy set were not double-counted;
- no unresolved blocker remains inside this 2013–2021 endocrine batch.

Next S-only tranche: `2022–2026` Physiology endocrine exact membership, followed by endocrine whole-Physiology negative-space closure.

K/L/P/R/E remain frozen.
