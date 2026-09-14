# Politics Xiao1000 Learner Explanation Promotion Receipt

Status: `CURRENT_DERIVED_ASSET_PROMOTION_READY`

Date: 2026-09-14

Scope: bounded promotion of the historical learner-facing Xiao1000 explanation package into Current Politics content. This does **not** reopen Politics Learning/Projection and does **not** modify Current Question Truth.

## User-authorized ruler

The user explicitly judged the historical package to be the same Xiao1000 question set and authorized a light identity-level check followed by promotion. Therefore this promotion does not perform a new 1148-record political semantic re-audit and does not treat the historical `251 PENDING` regular-QA labels as a new Current learning gate.

Historical QA labels are retained inside the derived records as provenance only.

## Exact historical source authentication

Recovered/uploaded historical file:

- historical filename: `politics_question_explanation_final_freeze_candidate.v1.json`
- SHA256: `e48d2b06ec1747f97451d147dc172a9b2acf9219d19c5f274c539dc400efbdec`
- expected/pinned SHA256: exact match
- schema: `politics_chat_question_explanation_final_pro_audited_freeze_candidate_v1`
- package status: `FINAL_PRO_AUDIT_PASS_FREEZE_CANDIDATE`
- records: `1148`
- subject counts: Marx `396`, Mao `115`, Ethics/Law `166`, History `251`, Xi `220`
- unique `runtime_question_id`: `1148`
- unique historical `question_id`: `1148`
- empty `takeaway`: `0`
- empty `chat_explanation`: `0`
- empty `xiao_reference.text`: `0`

## Current identity / correction sentinels

Current Question Truth remains:

- `content/politics/source/xiao_2027_questions.jsonl`
- Current manifest SHA256: `67cdd96c6fe53eb8b5e879c9e9ed487f58cea60c648e53cd720bd8a2fda9e40d`
- Current training-ready records: `1148`

The historical package directly carries stable Current-style `runtime_question_id` values (`xiao_2027_*`). The five historical records explicitly marked `PRIOR_ANSWER_IDENTITY_CORRECTION` were checked against Current Question Truth before promotion:

- `xiao_2027_marx_multiple_016` → Current `AB`
- `xiao_2027_marx_multiple_031` → Current `AB`
- `xiao_2027_marx_multiple_056` → Current `AB`
- `xiao_2027_marx_multiple_114` → Current `AB`
- `xiao_2027_marx_multiple_120` → Current `AB`

All five match the historical package's corrected `canonical_answer` sentinel. The promoted derived asset nevertheless contains **no `canonical_answer` field**, so it cannot override Current answer truth.

## Current owner design

Owner root:

`content/politics/derived/xiao1000-learner-explanations/`

Files:

- `manifest.json`
- `asset.v1.json.gz`
- `PROMOTION_RECEIPT.md`

`asset.v1.json.gz` is deterministic gzip of UTF-8 JSON.

Derived payload SHA256 (before gzip):

`958f0581deeb9708797884b97eee4f3d69158d3fa58bcdbf2a1e0c7b70070fcd`

Compressed asset SHA256:

`236f7992a0753de547a1a6db96983fab1d08f1dc146ad45aba0c9d6820989e56`

Promoted per-question fields:

- stable `question_id` = historical `runtime_question_id`
- `legacy_question_id`
- `subject`
- `takeaway`
- `chat_explanation`
- typed `xiao_reference` text + source id/book page/PDF page
- historical QA/audit labels as provenance only

Intentionally excluded:

- `stem`
- `options`
- `canonical_answer`
- historical `source_blocks`

Reason: Current already owns Question Truth and current source/knowledge bindings. Copying those fields would create a duplicate question database or allow stale historical source summaries to compete with Current authority.

## Runtime contract for downstream wiring

Consumer rule:

`Current question_id -> exact derived record by question_id`

If a derived record is missing or cannot bind to a Current question ID, fail closed for the refined learner-facing explanation layer. Never synthesize a replacement and never fall back to OCR as `chat_explanation`.

Current Question Truth always supplies stem/options/answer. The derived owner supplies only the restored learner-facing explanation layer.

## Boundary

This receipt closes the content-promotion part of historical recovery. It does **not** claim Workbench runtime/browser acceptance, Mac UI acceptance, or learner `U`. Those remain downstream implementation/evidence work under the active Politics productization lane.
