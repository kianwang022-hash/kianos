# Xizong B S2 Physiology — Endocrine Whole-Physiology Negative-Space Sweep

Status: `PASS_BOUNDED`  
Scope: endocrine-facing B membership false-positive / false-negative sweep across Current Physiology Question Truth, 2005–2026  
Authority: evidence shard only; `SOURCE.md` remains B Source owner and `content/xizong/questions/` remains Current Question Truth.

Starting endocrine exact membership:

- 2005–2012: `25`
- 2013–2021: `22`
- 2022–2026: `13`
- subtotal: `60`

The sweep asks whether any additional **endocrine-owned** Physiology question was missed outside the obvious endocrine chapter/question regions and whether any admitted question should instead be owned by renal, neuro/autonomic, reproductive, blood, circulation or generic cell-signaling scope.

---

## 1｜False-negative attack

Current endocrine Source covers six Primary domains:

1. endocrine common language / chemical classes / receptor and secretion-control language;
2. CT / PTH / calcitriol;
3. GH / IGF;
4. insulin / glucagon / incretin physiology;
5. thyroid physiology;
6. HPA / glucocorticoid physiology.

Cross-checking Current Question Truth outside those obvious regions found **no additional unresolved endocrine-owned qid** after the three endocrine batches.

The following “outside-region” patterns were explicitly rechecked rather than assumed absent:

- insulin / TH names inside generic receptor or signal-transduction questions;
- ADH / aldosterone in renal-water/electrolyte questions;
- catecholamine effects in autonomic/cardiovascular questions;
- EPO in erythropoiesis questions;
- oxytocin / sex hormones / placenta in reproductive questions;
- endocrine hormone names in thermogenesis questions.

No new endocrine qid is added by this sweep.

---

## 2｜False-positive attack

### Generic cell signaling

Questions such as `2013N156`, `2014N151`, `2015N151`, `2019N136`, `2020N136` test general receptor / second messenger / cell-signaling architecture.

Decision: `EXCLUDE from B endocrine Primary` when the tested object is generic cell signaling rather than endocrine classification/effect.

### Renal water/electrolyte control

ADH concentration/dilution, sweating→ADH→urine concentration, renal glucose transport, GFR and related questions remain A3 Primary.

`2013N122` is preserved as an explicit boundary example: it is printed in Current endocrine overview to illustrate blood-borne hormonal action, but its concrete effector is vasopressin-driven collecting-duct water reabsorption. Current B Source boundary reserves the complete renal-water model to A3, so this qid is not admitted to B Primary in this S2 inventory.

### Autonomic / sympathoadrenal control

Broad sympathetic/parasympathetic questions and immediate sympathoadrenal emergency-control questions remain neuro/circulation control unless the hormone physiology itself is what is being tested.

Thus `2015N22` is not B Primary, while GC permissive-action / HPA questions remain B.

### Reproductive endocrine

Oxytocin, ovarian/testicular/placental physiology and sex-steroid reproductive effects remain E/later Primary.

`2017N118` is therefore not admitted even though Current endocrine overview uses it as an example of neural control of hormone secretion.

### Blood / erythropoiesis

EPO and complete erythropoiesis remain blood/renal interface, not B endocrine Primary.

### Thermogenesis

`2015N154`, `2021N138`, `2024N139` remain in the already-closed GI+energy/temperature membership because **thermogenesis** is the tested construct. They are not counted a second time in endocrine.

---

## 3｜Edge-case consistency

The decision rule is:

```text
tested construct
> hormone name / disease label / trigger / answer entity / Lecture page location
```

Consequences:

- PTH → renal 1α-hydroxylase questions are B calcium-endocrine when the hormone axis is tested;
- ADH → collecting-duct water handling is A3 when renal water control is tested;
- GC → blood-cell redistribution is B when GC systemic action is tested;
- EPO → RBC production is blood/renal interface when erythropoiesis is tested;
- GIP → direct insulin stimulation is B islet/endocrine when incretin control is tested;
- CCK/secretin/gastrin GI secretion/motility questions remain GI physiology, not endocrine merely because the molecules are hormones.

---

## 4｜Verdict

`S2-PHYS-ENDOCRINE-NEGSPACE-2005-2026 = PASS_BOUNDED`

- new endocrine qids added: `0`;
- endocrine exact membership remains `60`;
- endocrine false-positive collisions were explicitly attacked;
- known renal / neuro / reproductive / blood / thermogenesis interfaces remain outside this endocrine count;
- no unresolved endocrine membership ambiguity remains in Current Physiology scope.

This closes the endocrine sub-batch only. Physiology subject closure still needs the one deferred cross-domain vitamin/hematology collision to be adjudicated and then the Physiology tranche can be accepted as a whole.

K/L/P/R/E remain frozen.
