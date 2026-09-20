# External Reading Incremental Source Contract v1

Status: CURRENT OPTIONAL SOURCE CONTRACT

Purpose: admit new private External Reading assets without changing the fixed legacy TPO56–65 / IELTS17–19 source contract and without inventing questions.

## Activation boundary

The optional private manifest lives at:

`INCREMENTAL/manifest.json`

It is inactive unless the public External Reading manifest registers its exact SHA-256.

Activation is fail-closed:

```
public expected incremental-manifest SHA
→ private INCREMENTAL/manifest.json exact hash match
→ every registered source/questions/answers file exact hash match
→ compile
```

An unregistered or hash-mismatched incremental tree is never compiled in production.

## Manifest schema

`kian.external.incremental-manifest.v1`

Minimum:

```json
{
  "schema": "kian.external.incremental-manifest.v1",
  "objects": [
    {
      "object_id": "stable-private-object-id",
      "source_family": "FUTURE_INCREMENTAL",
      "source_format": "SOURCE_PACKAGE_MARKDOWN",
      "practice_role": "READING_GROWTH",
      "collection": "Publisher / Source Collection",
      "title": "Article title",
      "source_path": "INCREMENTAL/source-id/article.md",
      "source_sha256": "<sha256>",
      "source_url": "https://...",
      "questions_path": null,
      "questions_sha256": null,
      "answers_path": null,
      "answers_sha256": null,
      "completion_requirement": "READ_ONLY_OK",
      "warnings": []
    }
  ]
}
```

All registered paths must stay inside the private source root.

## Source Package → runtime body boundary

The archival extractor may produce a Source Package containing metadata, the article body, and an `extraction_check`.

Do **not** point `source_path` at that whole archival wrapper if it would expose YAML metadata or extraction diagnostics as learner prose.

Admission must split it into:

```
archival Source Package
├─ metadata / extraction_check → private provenance / meta.json
└─ complete cleaned article body → normalized/article.md
                                      ↑
                             incremental source_path
```

`normalized/article.md` preserves the complete source body and meaningful headings/quotes/figures, but excludes intake-control metadata and extraction diagnostics from the learner-facing text.

## Three valid object modes

### 1. Questionless source

No `questions_path` and no `answers_path`.

Runtime:
- article is readable;
- question count is 0;
- workspace opens directly in Reading Only;
- no Submit action;
- finishing the reading is a legitimate completion event.

### 2. Source-native questions without formal key

Register `questions_path`, omit `answers_path`.

Runtime:
- source-native questions are preserved;
- answers can be entered;
- formal answer status is `SOURCE_NATIVE_NO_KEY`;
- submission does not manufacture a formal key;
- review remains manual/source-bound.

### 3. Source-native questions with source-backed key

Register both `questions_path` and `answers_path`.

Runtime:
- formal answers remain unavailable before Submit;
- after Submit they are revealed through the normal answer endpoint;
- this does not imply English-I question-type semantics.

## Question schema

`kian.external.incremental-questions.v1`

```json
{
  "schema": "kian.external.incremental-questions.v1",
  "source_text": "optional source-native question block",
  "questions": [
    {
      "ordinal": 1,
      "source_ordinal": 1,
      "prompt": "Question text",
      "options": {
        "A": "Option A",
        "B": "Option B"
      },
      "response_kind": "single_choice",
      "source_text": "Exact source-native question representation",
      "warnings": []
    }
  ]
}
```

No question semantics are inferred from prose. This file must come from source-native material or an explicitly admitted derived asset.

## Answer schema

`kian.external.incremental-answers.v1`

```json
{
  "schema": "kian.external.incremental-answers.v1",
  "answers": {
    "1": "A"
  }
}
```

Answer keys are optional. They must never be guessed.

## Source families

Typical values:

- `FUTURE_INCREMENTAL` — authentic long-form Reading Growth;
- `TOEFL_CURRENT` — current ETS-source-native objects;
- `IELTS_ACADEMIC` — newly admitted official IELTS Academic material.

The runtime may display additional registered family values without requiring a new UI family.

## Legacy invariants

Incremental admission must not weaken these fixed gates:

- legacy TPO: 10 collections / 30 passages / 395 questions / 395 answer slots;
- legacy IELTS17–19: 3 books / 12 tests / 36 passages / 480 questions;
- legacy private-source hash gate remains exact.

Incremental counts are additive and separately reported.

## Learner boundary

Source admission does not create learner exposure.

Machine retrieval, compiler QA, or Chat review never changes `UNSEEN` to `EXPOSED`.

## Product boundary

Do not create questions to make the UI look complete.

Questionless authentic reading is a first-class External Reading object.
