# Xizong B S2 Physiology — Whole-Physiology Negative-Space Sweep 2013–2021

Status: `PASS_BOUNDED`  
Scope: Current Physiology Question Truth outside the obvious digestive + energy/temperature source regions, years 2013–2021  
Authority: evidence shard only; `SOURCE.md` remains B Source owner and `content/xizong/questions/` remains Current Question Truth.

This sweep asks one closure question:

> Did the source-region audit miss any **B-owned digestive / absorption / energy-temperature tested construct** merely because the official question lived in another Physiology chapter or used another System's phenotype, trigger or option vocabulary?

It does not decide the separate endocrine batch and does not create Question→Block/KP mappings.

---

## 1｜Starting set

Already closed GI + energy/temperature membership for 2013–2021:

- 2013–2016: `22` exact admitted qids;
- 2017–2021: `25` exact admitted qids;
- starting subtotal: `47`.

Known cross-unit B questions are already inside that 47-qid set:

- `2013N1` / `2017N1` — intestinal glucose entry despite being printed with general membrane transport;
- `2020N4` / `2021N136` — intrinsic-factor / terminal-ileal B12 absorption despite hematologic phenotype;
- `2020N5` — hepatic synthetic failure causing coagulation disorder despite the phenotype living at a coagulation interface.

The negative-space sweep therefore looks for **additional** cases outside the obvious GI/energy chapters and attacks false-positive ownership aggressively.

---

## 2｜General control / membrane-transport false positives

### 2014N1 / 2015N1 — generic regulation, not B

- `2014N1` asks which activity is mainly completed by a neural reflex; postprandial glucose normalization appears only as an option.
- `2015N1` asks which activity is mainly completed by humoral regulation; sweating-induced oliguria and food-triggered salivation are option examples.

Decision: `EXCLUDE from B Primary`.

The tested construct is **mode of physiological regulation**, not glucose control, thermoregulation, renal water handling or salivary physiology.

### 2014N2 — renal glucose transport

Question target: glucose reabsorption at the renal-tubule luminal membrane.

Decision: `EXCLUDE → A3 renal Primary`.

This is the same organ-ownership rule already used elsewhere: shared SGLT/transport logic does not make renal reabsorption a B absorption question.

### 2015N151 and similar receptor/signaling questions — generic signaling

`2015N151` asks which ligands signal through enzyme-linked receptors; insulin is one correct ligand, but the tested object is receptor-class signal transduction.

Decision: `EXCLUDE from GI+energy`; do not admit by hormone vocabulary.

The same rule applies to general second-messenger / receptor-class questions whose option lists contain insulin or thyroid hormone.

---

## 3｜Blood / hematology interfaces

### 2014N5 — vitamin K appears, but coagulation machinery is tested

Question target: which coagulation factors require vitamin K for synthesis.

Decision: `EXCLUDE from B GI+energy; C/hemostasis Primary for this tested construct`.

Vitamin identity alone is not enough to transfer a coagulation-factor question to B.

### 2014N152 — thyroid hormone appears, but erythropoiesis is tested

Question target: factors that promote red-cell production.

Decision: `EXCLUDE from B GI+energy`; blood/erythropoiesis remains the tested construct.

### 2015N152 — folate / B12 deficiency causing megaloblastic anemia

Question target: which nutrient deficiencies cause megaloblastic anemia.

Decision remains: `DEFER_CROSS_SYSTEM_ADJUDICATION`.

This is not added to the GI+energy set. It differs from `2020N4` / `2021N136`, where the decision point is explicitly gastric intrinsic factor / terminal-ileal absorption. `2015N152` directly asks nutrient-deficiency → hematologic phenotype and must be reconciled later against the biochemistry/vitamin and C-boundary owner rather than guessed here.

### 2020N4 / 2021N136 — already captured, no duplicate

These stay B Primary for the **absorption etiology** and C interface for the full megaloblastic-anemia model. The sweep adds no new qid.

### 2020N5 — already captured, no duplicate

Cirrhosis → reduced hepatic coagulation-factor synthesis is retained as B organ-specific mechanism with C owning the complete coagulation cascade. No new qid is added.

---

## 4｜Renal trigger-vs-mechanism collisions

### 2014N17 — sweating is only the trigger

Question target: why urine volume falls after heavy sweating.

Decision: `EXCLUDE → A3 renal Primary` because the decisive path is osmolality / vasopressin / renal water handling.

### 2015N17 — glucose is only the osmotic solute

Question target: polyuria after a small intravenous load of concentrated glucose.

Decision: `EXCLUDE → A3 renal Primary` because the tested mechanism is increased tubular-fluid solute concentration / osmotic diuresis.

This matches the older `2005N15` rule.

---

## 5｜Autonomic / neuro false positives

### 2013N20 / 2014N156 / 2015N156 / 2019N13

These ask broad sympathetic / parasympathetic functional characteristics or outputs. GI motility, insulin release, glycogen breakdown or energy storage appear as effects/options within a whole-autonomic-system question.

Decision: `EXCLUDE from B Primary` for this GI+energy slice.

A GI or metabolic effect inside a generic autonomic question does not transfer ownership from the autonomic/neuro control construct.

---

## 6｜Circulatory questions containing “metabolism” language

### 2014N153 / 2015N153 / 2018N138

- `2014N153` asks causes of increased tissue-fluid formation; “metabolic acidosis” is one option.
- `2015N153` asks which microvascular structures are regulated by local metabolites.
- `2018N138` asks factors increasing coronary blood flow; myocardial metabolic activity is an option.

Decision: `EXCLUDE from B GI+energy`.

Here “metabolic” describes local circulatory control or an option entity, not whole-body energy metabolism / substrate handling.

---

## 7｜Endocrine candidates carried forward, not double-counted

The whole-Physiology scan confirms a substantial set of B-system endocrine questions outside the GI/energy chapters, including questions on:

- hormone secretion modes / pituitary control;
- calcium-regulating hormones and active vitamin D;
- GH / IGF and GH metabolic effects;
- insulin / glucagon / incretin physiology;
- thyroid-hormone synthesis, receptor, effects and feedback;
- glucocorticoid / stress physiology.

Representative qids in 2013–2021 include `2013N121–122`, `2014N21–23`, `2015N21–23`, `2016N21–23`, `2017N15`, `2017N118–119`, `2018N14–15`, `2019N14–16`, `2020N14–15`, `2021N14–15`.

Decision: `DEFER → Physiology endocrine S2`.

Two important exceptions are already correctly owned by the GI/energy slice because the **tested construct itself** is energy/temperature:

- `2015N154` — humoral factors markedly enhancing thermogenesis;
- `2021N138` — endocrine hormones participating in human thermogenesis.

These remain in the existing 47 and are not duplicated into the endocrine count later unless an explicit single-owner rule says otherwise.

---

## 8｜Readback rule and verdict

Across the 2013–2021 Physiology Source, every plausible cross-chapter GI/energy candidate was handled by the same rule:

`tested construct > disease label / hormone name / option vocabulary / trigger / Lecture chapter location`.

Result:

`S2-PHYS-NEGSPACE-2013-2021-GI-ENERGY = PASS_BOUNDED`

- new GI/energy qids added: `0`;
- 2013–2021 admitted GI+energy count remains `47`;
- known cross-unit B questions were already captured by the source-region audit;
- renal, neuro/autonomic, circulation, blood and generic-control false positives were explicitly rejected;
- `2015N152` remains explicit cross-system debt rather than being silently forced into this slice;
- endocrine questions remain explicit carry-forward work.

Next S-only tranche: whole-Physiology negative-space sweep `2022–2026`; after that closes, start the separate Physiology endocrine exact-membership batch.

K/L/P/R/E remain frozen.
