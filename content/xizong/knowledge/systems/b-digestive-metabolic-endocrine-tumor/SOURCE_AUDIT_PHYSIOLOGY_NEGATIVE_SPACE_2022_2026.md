# Xizong B S2 Physiology — Whole-Physiology Negative-Space Sweep 2022–2026

Status: `PASS_BOUNDED`  
Scope: Current Physiology Question Truth outside the obvious digestive + energy/temperature source regions, years 2022–2026  
Authority: evidence shard only; `SOURCE.md` remains B Source owner and `content/xizong/questions/` remains Current Question Truth.

This sweep asks whether the 2022–2026 GI + energy/temperature source-region audit missed any B-owned tested construct merely because it appeared in another Physiology chapter.

It does not decide the separate endocrine batch and does not create Question→Block/KP mappings.

---

## 1｜Starting set

Already closed 2022–2026 GI + energy/temperature membership:

- admitted exact qids: `15`;
- evidence owner: `SOURCE_AUDIT_PHYSIOLOGY_2022_2026.md`.

The sweep re-checks general control, membrane transport, blood, circulation, renal, autonomic/neuro and endocrine-facing questions.

---

## 2｜General-control / transport false positives

### 2022N136 / 2023N1 / 2024N1 / 2025N1

- `2022N136` tests generic negative-feedback characteristics;
- `2023N1` tests existence of feed-forward control;
- `2024N1` tests feedback information in an automatic-control system;
- `2025N1` tests the definition of internal environment; GI digestive fluid is only an option.

Decision: `EXCLUDE from B GI+energy`.

These questions use general regulation/homeostasis language rather than a B-owned digestive or energy decision variable.

### 2022N1 / 2023N2 / 2025N2

- `2022N1` tests which process uses an antiporter; intestinal glucose entry is only one option while the keyed construct is renal H+ transport;
- `2023N2` tests generic simple diffusion; glycerol is the keyed example;
- `2025N2` tests generic Ca2+ pump physiology.

Decision: `EXCLUDE from B GI+energy`.

Substrate or organ examples do not transfer a generic membrane-transport question into B.

---

## 3｜Circulation / blood false positives

### 2024N5 — “local metabolites” are a microcirculation controller

Question target: regulation of precapillary sphincter tone.

Decision: `EXCLUDE → circulation Primary`.

“Local metabolic products” here describe local vascular control, not whole-body energy metabolism.

### 2023N137 / 2024N4 — anticoagulation

Protein C / TFPI / heparin / coagulation-factor regulation are hemostatic constructs.

Decision: `EXCLUDE from B GI+energy` despite any vitamin or liver interfaces that may exist elsewhere.

### 2023N138 — Hb–O2 binding

Decision: `EXCLUDE → respiratory/blood gas transport Primary`.

No B-owned energy/temperature decision is being tested.

---

## 4｜Renal trigger-vs-mechanism collisions

### 2022N118 — renal glucose reabsorption

Question target: nephron segment responsible for most glucose reabsorption.

Decision: `EXCLUDE → A3 renal Primary`.

Glucose identity does not transfer renal transport into B.

### 2025N13 — heavy sweating is only the trigger

Question target: receptor location driving ADH increase and urine concentration after heavy sweating.

Decision: `EXCLUDE → A3 / renal-water-control Primary`.

Sweating belongs to thermoregulation, but the tested decision is osmoreceptor → ADH → renal water handling.

---

## 5｜Autonomic / neuro false positives

### 2023N13 / 2024N140

- `2023N13` asks which autonomic postganglionic fiber is sympathetic adrenergic; salivation / sweat are option contexts.
- `2024N140` asks atropine effects; anhidrosis is one effect among a generic muscarinic-blockade set.

Decision: `EXCLUDE from B GI+energy`.

The tested construct is autonomic/neuropharmacologic control, not salivary or heat-loss physiology itself.

---

## 6｜Known GI / energy qids remain correctly captured

The whole-Physiology sweep does not add or remove the already admitted 2022–2026 qids, including:

- `2022N8`, `2022N138`, `2022N139`;
- `2023N8`, `2023N9`, `2023N139`;
- `2024N8`, `2024N9`, `2024N138`, `2024N139`;
- `2025N9`, `2025N10`, `2025N11`, `2025N138`;
- `2026N10`.

`2026N10` remains a bounded Current reconstruction: Current Question Truth asks which substance preserves pancreatic-lipase action, keyed to colipase; Current Physiology Source supports the same mechanism even though the machine-readable Lecture layer does not expose a stable `2026N10` tag.

---

## 7｜Endocrine candidates carried forward

The scan confirms multiple endocrine-facing B candidates outside the GI/energy slice, including:

- `2022N14` — glucocorticoid excess effects;
- `2022N15` — factors suppressing insulin secretion;
- `2023N15` — hyperthyroid manifestations;
- `2023N118–119` — PTH / calcitriol calcium-phosphate effects;
- `2023N141` — Cushing-related blood-cell changes;
- `2024N14` — PTH stimulation of active vitamin-D synthesis;
- `2024N15` — why chronic exogenous cortisol cannot be stopped abruptly;
- `2024N141` — endocrine causes of osteoporosis;
- `2025N16` — stimuli reducing thyroid-hormone secretion;
- `2025N140` — anterior-pituitary hormones;
- `2026N15` — incretin/GIP question: hormone directly increasing insulin without first raising blood glucose.

Decision: `DEFER → Physiology endocrine S2`.

`2026N15` is deliberately not counted in the GI shard even though the answer is a GI hormone; the tested endpoint is islet hormone control / incretin physiology, so it belongs in the endocrine membership batch and must not be double-counted.

Energy/temperature questions whose tested construct is thermogenesis remain exceptions already owned by the GI+energy slice, e.g. `2024N139`.

---

## 8｜Verdict

`S2-PHYS-NEGSPACE-2022-2026-GI-ENERGY = PASS_BOUNDED`

- new GI/energy qids added: `0`;
- 2022–2026 admitted GI+energy count remains `15`;
- generic control / membrane transport / circulation / renal / autonomic false positives were explicitly rejected;
- endocrine candidates are preserved as explicit carry-forward work;
- no unresolved GI/energy candidate remains in 2022–2026 negative space.

### Whole GI + energy/temperature closure across 2005–2026

- source-region exact membership: `96` qids;
- negative-space 2005–2012: `0` added;
- negative-space 2013–2021: `0` added;
- negative-space 2022–2026: `0` added;
- **GI + energy/temperature exact membership = 96, negative-space closed**.

Next S-only task: start the separate **Physiology endocrine exact-membership** batch. Overall Physiology S2 remains open until that batch and its own negative-space reconciliation close.

K/L/P/R/E remain frozen.
