# B Extension Semantic Audit — D1–D4

Status: CHAT_SEMANTIC_REVIEWED
Date: 2026-09-16
Scope: B Digestive / Metabolic / Endocrine / Tumor — D1–D4 only
Authority role: semantic review receipt for Projection/Extension work; subordinate to the frozen Xizong learning baseline, `content/xizong/LEARNING_CONTRACT.md`, B Current Learning owner, and `content/xizong/EXTENSION_ASSET_CONTRACT.md`.

## Governing decision

B first-pass remains MarginNote/original-Lecture primary. KianOS must not turn D1–D4 into a second lecture. Extension assets are therefore sparse and owner-bound.

For this slice, only assets that materially reduce cognitive friction beyond the ordinary whole-LG Lecture contact are formalized. Text-heavy or easily replaceable source tables are not automatically screenshotted. Native structured tables are preferred when spatial/graphical fidelity is not the learning value.

## Approved formal Extension assets

### 1. D1 / b-d01-lg01 — slow-wave threshold / action-potential / contraction relation
- type: `SOURCE_VISUAL`
- stable slot: `b-d01-lg01-slow-wave-threshold-contraction`
- source: Physiology Lecture PDF P208
- learner role: preserve the geometric relationship among slow wave, mechanical threshold, electrical threshold/action potentials and contraction strength/rhythm.
- display: `LEARNING_MOMENT`
- rationale: waveform/threshold geometry is irreducibly visual; a native table would lose the key spatial relation.

### 2. D2 / b-d02-lg03 — parietal-cell HCl secretion mechanism
- type: `SOURCE_VISUAL`
- stable slot: `b-d02-lg03-parietal-cell-acid-secretion`
- source: Physiology Lecture PDF P222
- learner role: walk carbonic-anhydrase generation of H+/HCO3-, apical H+-K+-ATPase/K+ recycling and basolateral Cl-/HCO3- handling in one cell-level map.
- display: `LEARNING_MOMENT`
- rationale: membrane-side localization and transporter direction are the learning value.

### 3. D3 / b-d03-lg01 — pancreatic duct vs acinar secretion localization
- type: `SOURCE_VISUAL`
- stable slot: `b-d03-lg01-pancreatic-duct-acinar-secretion`
- source: Physiology Lecture PDF P231
- learner role: spatially separate duct-cell HCO3-/water secretion from acinar-cell enzyme secretion, while retaining the source-supported Secretin/VIP vs CCK/gastrin/vagal localization.
- display: `LEARNING_MOMENT`
- rationale: cell/duct/acinus localization is materially easier from the source schematic than prose.

### 4. D3 / b-d03-lg04 — three high-frequency GI hormones comparison
- type: `STRUCTURED_TABLE`
- stable slot: `b-d03-lg04-gi-hormone-comparison`
- source: Physiology Lecture PDF P237 (book page 209)
- learner role: compare gastrin, secretin and CCK by source cell, strongest/representative stimuli, major stomach/intestinal/pancreatic/biliary effects and net gastric-emptying direction.
- display: `POST_REVEAL` (or the closest generic non-leaking folded timing supported by Current)
- rationale: this is text/comparison knowledge; native searchable/editable table is more maintainable than a screenshot.
- hard rule: mechanically transcribe Current source; do not complete from model memory.

### 5. D4 / b-d04-lg02 — B12 relay + long-chain lipid relay
- type: `SOURCE_VISUAL`
- stable slot: `b-d04-lg02-b12-long-chain-lipid-relays`
- source: Physiology Lecture PDF P241
- learner role: compare two multi-station special absorption paths: B12 stomach/R-protein/pancreas/intrinsic-factor/ileum relay and long-chain lipid micelle/re-esterification/chylomicron/lymph relay.
- display: `LEARNING_MOMENT`
- rationale: the multi-organ spatial relay and portal-vs-lymph destination are the learning value.

## Explicit deferrals / no-asset decisions in D1–D4

- D1 / b-d01-lg02 ENS + autonomic control: `LOCATOR_ONLY` for now. The source ENS positional figure is useful, but the accepted LG task is a control comparison; current whole-LG Lecture contact is sufficient and an inline asset would add more surface than value.
- D1 / b-d01-lg03 Ca2+-CaM-MLCK execution: `LOCATOR_ONLY` for now. The source cross-muscle comparison table is broader than this LG and would encourage a second-course summary. Consider a future structured comparison only if real use shows a recurring confusion.
- D2 / b-d02-lg01 oral-esophageal-LES entry: `LOCATOR_ONLY`.
- D2 / b-d02-lg02 gastric accommodation/emptying: `LOCATOR_ONLY` despite a usable P218 source figure. It is understandable during the whole-LG Lecture contact and does not currently earn persistent inline surface.
- D2 / b-d02-lg04 mucosal defense: `LOCATOR_ONLY`; a compact structured table may be added later if real use justifies it.
- D3 / b-d03-lg02 bile/bile salts/fat digestion: `LOCATOR_ONLY`; avoid duplicating the D4 long-chain lipid relay asset.
- D3 / b-d03-lg03 intestinal/colonic motility: `LOCATOR_ONLY`.
- D4 / b-d04-lg01 absorption interface + blood/lymph destination: `LOCATOR_ONLY`; D4 LG02 source visual already carries the most valuable spatial split.
- D4 / b-d04-lg03 sugar/peptide/iron/calcium transport: `LOCATOR_ONLY` for first release. Candidate future `STRUCTURED_TABLE` if MarginNote/real-use evidence shows repeated comparison cost.

## Negative-space decision

D1–D4 do not need one formal asset per Logic Group. Missing inline assets are intentional and compatible with the accepted B Learning owner. The original Lecture remains the complete figure/table substrate.
