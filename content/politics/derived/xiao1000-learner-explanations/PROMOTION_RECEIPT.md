# Politics Xiao1000 Learner Explanation Promotion Receipt

Status: `STAGE_0_RECONCILIATION_VALIDATED_IN_PR`
Date: 2026-09-14
Issue: #138; original promotion: #124
Base main: `9e4e706b8f3b6b6861e68b900c19db21974f3b1c`

## Scope and source authentication

This receipt updates the current packaging evidence for the already authorized 1148-record promotion. It does not repeat the semantic migration or claim #117 Runtime/UI acceptance. The approved learner payload is `takeaway` + `chat_explanation`; all other source text and historical QA labels remain provenance outside this derived asset.

The existing file `politics_question_explanation_final_freeze_candidate.v1.json` was located in the local Study Politics runtime corpus. Its 7,339,650 bytes match the exact SHA recorded by #124. Its schema is `politics_chat_question_explanation_final_pro_audited_freeze_candidate_v1`, status `FINAL_PRO_AUDIT_PASS_FREEZE_CANDIDATE`, and record count 1148. This is an authenticated existing original, not reconstructed political content.

The mechanical operation selects only existing identity metadata and the two learner fields, sorts records by exact stable ID, serializes canonical JSON, and packs valid gzip. It copies `takeaway` and `chat_explanation` verbatim without trimming, normalization, rewriting, OCR, fuzzy matching, or generation. Historical `runtime_question_id` is the Current `question_id`; historical `question_id` is preserved as `legacy_question_id`. All 2296 learner strings and all identity metadata compare exactly with this source.

## Defect resolved

The previous committed file was 14,998 bytes with SHA256 `dcefd135cf6c711909627a76ed23c055ec2839b7dc7f36ba9fb4bfd079c80883`. It was not valid gzip: its first bytes were `7d8b165e`, so no JSON payload could be decoded. The original promotion commit contains those same invalid bytes. The cause of the corruption is not established.

The prior manifest/receipt also pinned stale payload digest `958f0581deeb9708797884b97eee4f3d69158d3fa58bcdbf2a1e0c7b70070fcd` and compressed digest `236f7992a0753de547a1a6db96983fab1d08f1dc146ad45aba0c9d6820989e56`, while still admitting `xiao_reference` and historical QA. Neither old digest is asserted to authenticate the new two-field asset. They are retained here only as diagnosis evidence.

## Final asset and hash meaning

Owner: `content/politics/derived/xiao1000-learner-explanations/`.

- Payload: 650,905 bytes of UTF-8 JSON, keys sorted, compact separators, literal Unicode, one final LF, records sorted by stable ID.
- Gzip: 172,514 bytes; RFC 1952 deflate level 9, mtime 0, no filename, OS byte 255; CRC/trailer and full decompression verified.
- `derived_payload_sha256` hashes exactly the decompressed bytes, including LF.
- `compressed_asset_sha256` hashes exactly the committed gzip file.

- `derived_payload_sha256`: `5d655c3eb070af52d600e508f9fa1b3c683450e289882c9523af271bd3113f75`
- `compressed_asset_sha256`: `6d761c99b29011e3c290ca1925d9a0e52a53de8c67d4d7996c772e74cdd62087`
- `question_truth_sha256`: `67cdd96c6fe53eb8b5e879c9e9ed487f58cea60c648e53cd720bd8a2fda9e40d`
- `historical_source_sha256`: `e48d2b06ec1747f97451d147dc172a9b2acf9219d19c5f274c539dc400efbdec`

The owner manifest, parent Politics manifest, README, this receipt, and actual asset agree. Admitted per-record fields are `question_id`, `legacy_question_id`, `subject`, `takeaway`, `chat_explanation`. The first three are identity metadata, and only the last two are learner content. Strict schema validation rejects additional record or envelope fields. The asset excludes `xiao_reference`, historical QA, `stem`, `options`, `canonical_answer`, and source blocks.

## Exact binding and content evidence

- Current Question Truth: `content/politics/source/xiao_2027_questions.jsonl`, unchanged at the hash above.
- All 1148 Current `training_ready` single/multiple IDs exactly equal the asset's ID set; duplicate/missing/unbound counts are all 0. The 24 material/reference-only records are not admitted.
- Unique legacy IDs: 1148. Subject and identity metadata agree with the authenticated original and Current.
- Subject counts: Marx 396, Mao 115, Ethics/Law 166, History 251, Xi 220.
- Empty learner fields: 0. Content comparison: 2296 of 2296 strings exactly unchanged.
- Existing `PRIOR_ANSWER_IDENTITY_CORRECTION` sentinels `xiao_2027_marx_multiple_016`, `_031`, `_056`, `_114`, `_120` all retain Current answer `AB`. This is a five-sentinel identity check, not a new answer audit; the asset contains no answers.

## Validation commands and results

From the repository root:

```sh
python3 content/politics/derived/xiao1000-learner-explanations/validate.py --historical-source /path/to/politics_question_explanation_final_freeze_candidate.v1.json
python3 content/politics/derived/xiao1000-learner-explanations/test_validation.py
(cd static-web && node scripts/validate-politics-runtime.mjs)
```

- Exact binding/content validator: PASS, including authenticated original-content comparison.
- Asset validator regression suite: PASS, 14 tests including forbidden-field subcases (isolated temporary copies only; no real learner state).
- Independent Node `gunzipSync` / SHA256 / JSON readback: PASS, 1148 unique IDs.
- Existing Politics Current binding validation: PASS — 5 subjects, 53 chapters, 151 units, 448 source owners, 1156 question references; 0 unresolved sources/questions; Question Truth inventory 1172. These chapter references are not the 1148 unique objective asset records and are not substituted for the exact-ID proof.
- Existing K03 pilot and repair/memory validation: PASS as included by the Current binding command.

## Boundary and stop

No source Question Truth, canonical answer, options, source provenance, #117 Runtime/UI, learner state, or other subject work is changed. No deployment, release promotion, merge, browser journey, or learner U is claimed. The PR remains the review surface; this receipt is not a main landing claim.

Stage 0 ends with this bounded content/metadata PR. Stop here; do not automatically start #139 or downstream Politics/English/Xizong work. Downstream consumers should use the reconciled manifest and exact byte-hash meanings when that work is separately resumed.
