# Xiao1000 learner-facing explanation layer

Current learner-facing payload contains **only** two derived fields bound by exact stable question ID:

- `takeaway` — 一句话带走
- `chat_explanation` — 精修解析

It intentionally does **not** contain or own `stem`, `options`, `canonical_answer`, `xiao_reference` / 肖1000原解析, source blocks, learner state, scheduler state, or mastery state.

Question/answer/source truth remains owned by `content/politics/source/xiao_2027_questions.jsonl` and its source provenance owners. The historical 1148-record package is retained only as migration provenance by SHA256; its low-quality OCR/source explanation is not part of this learner-facing Current layer.
