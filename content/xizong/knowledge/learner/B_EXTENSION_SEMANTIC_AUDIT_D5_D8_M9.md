# B Extension Semantic Audit — D5–D8 + M9

Status: CHAT_SEMANTIC_REVIEWED
Date: 2026-09-16
Scope: B Digestive / Metabolic / Endocrine / Tumor — D5, D6, D7, D8, M9
Authority role: bounded semantic review receipt for Extension work; subordinate to frozen Xizong learning baseline, `content/xizong/LEARNING_CONTRACT.md`, current B Learning owner, and `content/xizong/EXTENSION_ASSET_CONTRACT.md`.

## Governing decision

Original Lecture / MarginNote remains the continuous first-pass surface. This audit formalizes only persistent assets that materially improve visual localization or repeated high-value discrimination. A useful source figure is not automatically an inline asset.

For this slice, the final accepted set is **7 formal assets = 4 SOURCE_VISUAL + 3 STRUCTURED_TABLE**.

## Approved formal Extension assets

1. **D5 / b-d05-lg03 — fever set-point control**
   - slot: `b-d05-lg03-fever-setpoint-control`
   - type: `SOURCE_VISUAL`
   - source: Physiology Lecture PDF P250
   - role: preserve the set-point / warm-sensitive / cold-sensitive response geometry used to distinguish fever from non-set-point hyperthermia.
   - display: `LEARNING_MOMENT`

2. **D6 / b-d06-lg02 — hypothalamus–pituitary–target axis architecture**
   - slot: `b-d06-lg02-hypothalamic-pituitary-axis`
   - type: `SOURCE_VISUAL`
   - source: Physiology Lecture PDF P395
   - role: spatially preserve hypothalamus → pituitary → target-gland / direct-target branches before feedback localization.
   - display: `LEARNING_MOMENT`

3. **D7 / b-d07-lg01 — insulin receptor signaling / storage-effect map**
   - slot: `b-d07-lg01-insulin-signaling-storage`
   - type: `SOURCE_VISUAL`
   - source: Physiology Lecture PDF P407
   - role: connect insulin receptor / IRS / PI3K-AKT signaling to GLUT4 and storage/anabolic effects without rewriting the pathway.
   - display: `LEARNING_MOMENT`

4. **D7 / b-d07-lg02 — beta-cell glucose sensing and insulin secretion**
   - slot: `b-d07-lg02-beta-cell-glucose-sensing`
   - type: `SOURCE_VISUAL`
   - source: Physiology Lecture PDF P408
   - role: preserve the glucose → GK/ATP → KATP closure → depolarization → Ca2+ entry → granule release chain and the source-supported biphasic secretion context.
   - display: `LEARNING_MOMENT`

5. **D8 / b-d08-lg01 — T1DM vs T2DM natural-history comparison**
   - slot: `b-d08-lg01-t1dm-t2dm-comparison`
   - type: `STRUCTURED_TABLE`
   - source: Internal Medicine Lecture printed P254 (physical PDF P310 in current unified source)
   - role: compare source-supported mechanism, beta-cell state, age/body-habitus tendency, DKA/HHS tendency, early insulin need, C-peptide/insulin pattern and other fields actually present in the reviewed source table.
   - display: `POST_REVEAL`
   - hard rule: native table only; no screenshot duplicate; do not modernize the source from external guidelines.

6. **D8 / b-d08-lg02 — DKA vs HHS acute-crisis discrimination**
   - slot: `b-d08-lg02-dka-hhs-discrimination`
   - type: `STRUCTURED_TABLE`
   - source: Internal Medicine Lecture printed P255–P256 (physical PDF P311–P312)
   - role: organize only the current-source discrimination axes needed by the LG: typical context, glucose/ketone/acid-base/osmolality orientation, key tests and major treatment distinctions. Preserve exact source thresholds when transcribed.
   - display: `POST_REVEAL`
   - hard rule: no current-guideline substitution; source truth only.

7. **M9 / b-m09-lg03 — nucleotide antimetabolite target map**
   - slot: `b-m09-lg03-antimetabolite-targets`
   - type: `STRUCTURED_TABLE`
   - source: Biochemistry Lecture `26生化.pdf` P076
   - role: map the source-listed 6-MP, allopurinol, cytarabine, 5-FU, MTX and azaserine to the exact source target/reaction layer and resulting nucleotide-supply effect.
   - display: `POST_REVEAL`
   - hard rule: mechanically transcribe source; no pharmacology completion from model memory.

## Explicit deferrals / negative space

- D5 LG01 energy measurement/RQ/BMR: `LOCATOR_ONLY` for now. The source is mostly text/table; persistent inline value does not exceed Lecture contact enough to justify another table.
- D5 LG02 core temperature / heat production-loss: `LOCATOR_ONLY`; the current source cartoons/tables are understandable in the Lecture and do not need permanent duplication.
- D5 LG04 stress metabolism + EN/PN: `SUMMARY_CANDIDATE` / locator-only for now. Surgical source is text-heavy and the current D5 owner records a visual-source gap. A future Kian/MarginNote reviewed decision summary is preferable to freezing a weak screenshot.
- D6 LG01 secretion language, LG03 feedback, LG04 chemical class/receptor, LG05 localization, LG06 hypertension-low-K application: locator-only in this release. P396 contains usable feedback/classification material, but one persistent axis visual is sufficient for first release; do not turn D6 into a mini endocrine textbook.
- D7 LG03 modulation network and LG04 fed/fasting integration: locator-only; D7’s two accepted source visuals cover the most spatially expensive mechanisms.
- D8 LG03 chronic complications, LG04 diagnostic/function testing, LG05 long-term drugs: locator-only / future structured-summary candidates. D8 first release keeps only the two highest-value discrimination tables; drug tables in particular are likely to benefit from later reviewed MarginNote summaries.
- M9 LG01 purine supply/recovery and LG02 pyrimidine/deoxy/dTMP: locator-only. P074 contains a useful source comparison, but the causal reconstruction is short and should remain active rather than become another persistent table. LG03 antimetabolite mapping is the repeated comparison cost worth formalizing.

## Negative-space rule

Seven formal assets across these 22 Logic Groups are intentional. Do not fill missing LGs for visual coverage, symmetry, or because a source page contains a figure/table. Future Kian MarginNote screenshots may be promoted into stable slots only after Chat review under the Extension Asset contract.
