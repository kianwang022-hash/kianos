# Xiao1000 learner-facing explanation layer

Current learner-facing content contains exactly two derived fields:

- `takeaway` — 一句话带走
- `chat_explanation` — 精修解析

Each record also carries identity metadata: exact stable `question_id`, preserved `legacy_question_id`, and `subject`. There are 1148 records (Marx 396, Mao 115, Ethics/Law 166, History 251, Xi 220), bound to precisely the 1148 Current `training_ready` single/multiple questions. The 24 reference-only material questions are outside this asset.

The asset contains no `xiao_reference`, `historical_quality`, `stem`, `options`, `canonical_answer`, source blocks, or learner state. Question/answer/source truth remains owned by `content/politics/source/xiao_2027_questions.jsonl` and its source provenance owners. Historical OCR/source explanation and QA labels stay in the authenticated source package; they are not learner-facing fields or fallbacks.

## Packaging and exact hashes

Stage 0 / #138 mechanically repacked the existing, authenticated #124 source after the committed gzip proved invalid. All 2296 learner strings were copied verbatim; no explanation was generated or semantically re-audited. See `PROMOTION_RECEIPT.md` for the evidence and boundaries.

The JSON object has `schema`, `content_version`, and `records`. Records sort by stable `question_id`; JSON is UTF-8, sorted object keys, compact separators, literal Unicode, and one final LF. Gzip uses deflate level 9, zero mtime, no filename, and OS byte 255. The payload hash means the exact decompressed bytes (including the final LF); it is not an earlier serialization or a provenance-only digest. The gzip hash means the exact committed compressed bytes.

- `derived_payload_sha256`: `5d655c3eb070af52d600e508f9fa1b3c683450e289882c9523af271bd3113f75`
- `compressed_asset_sha256`: `6d761c99b29011e3c290ca1925d9a0e52a53de8c67d4d7996c772e74cdd62087`
- `question_truth_sha256`: `67cdd96c6fe53eb8b5e879c9e9ed487f58cea60c648e53cd720bd8a2fda9e40d`
- `historical_source_sha256`: `e48d2b06ec1747f97451d147dc172a9b2acf9219d19c5f274c539dc400efbdec`

## Read-only validation

From the repository root:

```sh
python3 content/politics/derived/xiao1000-learner-explanations/validate.py
python3 content/politics/derived/xiao1000-learner-explanations/test_validation.py
(cd static-web && node scripts/validate-politics-runtime.mjs)
```

For the additional exact content-preservation proof, supply the existing historical file (SHA pinned above):

```sh
python3 content/politics/derived/xiao1000-learner-explanations/validate.py --historical-source /path/to/politics_question_explanation_final_freeze_candidate.v1.json
```

Without that optional file, the validator checks Current packaging, both byte hashes, metadata/docs, exact IDs, subject counts, and the two-field shape; it explicitly reports the historical string comparison as NOT_RUN. The local file is not required by Runtime or CI and is not copied into this repository. No command writes learner state or repairs an asset to make validation pass.
