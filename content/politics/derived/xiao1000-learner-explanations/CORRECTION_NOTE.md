# Learner explanation asset correction

Per Kian's explicit correction on 2026-09-14, the Current derived Xiao1000 learner-facing explanation layer should contain only:

- `takeaway` — 一句话带走
- `chat_explanation` — 精修解析

`xiao_reference` / 肖1000原解析 is intentionally excluded from this derived learner-facing asset because its OCR/source-text quality is materially lower. The canonical Xiao1000 Question Truth remains separately owned by `content/politics/source/xiao_2027_questions.jsonl`; this correction does not alter stem/options/canonical answer/source provenance there.

Consumers must not surface `xiao_reference` from the derived learner-facing explanation owner and must not regenerate it as a fallback.
