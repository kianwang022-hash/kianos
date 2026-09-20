# B Question Scope — Current Reconstruction

Status: **PASS / CLOSED AFTER EXACT-RESOLVER REPAIR**  
Date: 2026-09-20  
Scope: B — Digestive / Metabolic / Endocrine / Tumor exact official System-question membership

Canonical owner:

`content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-question-scope.json`

## 1｜Question

B System-question membership is not inferred from question stems, Outline placement or nullable Current classification fields.

The authoritative recovery chain is:

```text
official question
→ reviewed primary Lecture position
→ reviewed System Source-page union
→ approved partial / collision adjudication
→ exact System qid membership
```

Question→Block / LG / KP mapping remains a separate reviewed relation layer.

## 2｜Exact historical resolver

Pinned recovery repository:

`kianwang022-hash/kianos-site-v238-recovery@a38444057dd46fbf1765052d17c5f6b6a018d2f7`

Executable resolver:

- `app/learning/xizong-question-pool.js`
- blob `8b73c9e0a49e02ad3cf296832f90dd19fe4da161`
- function `resolveSystemClosureFromSourceUnion`

Inputs:

- 3,750-row question→Lecture locator:
  - `public/xizong-system-source-routing.v1.local.json`
  - blob `e184f0fc899de0a6bf47c5b194fe328d2f1977de`;
- reviewed System Source coverage / collision contract:
  - `public/xizong-system-official-scope.v2.local.json`
  - blob `b239dba8e3e2969b47a534be9d5daa3e001ab5d3`;
- executable QA:
  - `tests/xizong-system-official-scope-local-apply.test.mjs`
  - blob `d9a678c0eed481359e15b729469d0c6d393165f8`.

The QA requires all eight frozen System pools to match exactly:

```text
circulation                         376
digestive-metabolic-endocrine     1072
final-clinical-modules              27
hematology-immunity-infection      326
neuro-sensory-motor-orthopedics    142
reproductive-breast                 35
respiratory                         359
urinary                             243
--------------------------------------
total                              2580
```

This is executable evidence, not a desired-count target.

## 3｜Resolver semantics

The original resolver does not assign System ownership from keywords.

For a routed question:

1. registered Source-gap rows create no fixed membership;
2. if `source_page` is known, candidate Systems are those whose **unioned approved Source pages for that source SHA** contain that page;
3. if `source_page` is null, the resolver uses the reviewed `source_scope_pages` set for `source SHA + lecture_scope_key`; a candidate System must cover the entire reviewed page set for that scope;
4. question-specific approved partial-boundary exceptions override normal ownership;
5. if one System remains, it owns the question;
6. if multiple Systems remain, only the approved collision decision for that exact source/scope may resolve ownership;
7. unresolved ownership fails closed.

This explains why some Lecture interfaces do not import an entire neighboring chapter into B.

## 4｜Current Question Truth identity

Current Question Truth:

`content/xizong/questions/`

Current immutable ID inventory:

`0abc1a3cadbb41b36808fe86ff58c21ede6f4297312e9fb4c2da62b865ef2c82`

The historical routing and Current Question Truth use the same 3,750 stable qid namespace.

## 5｜Repair of the first Current reconstruction

The first B Current reconstruction reached the correct **count** 1072 with an approximate scope/page join, but fresh readback of the original executable resolver showed the **inventory was not exact**.

Delta:

```text
count before repair                  = 1072
count after exact-resolver repair    = 1072
wrongly admitted IDs removed         = 13
exact-resolver IDs restored          = 13
```

The removed set included C-owned lymphoma questions, proving that count equality was insufficient evidence.

No count fitting was used in the repair. The canonical owner now uses the exact executable historical resolver inventory.

## 6｜Accepted scope identity

```text
question_count = 1072
year range     = 2005–2026
inventory SHA = d7817ecc0c57346bb04ea3a6a5417d0c11f2daba0ca8178b3424fb82d256510f
```

Hash convention matches accepted A3:

```text
sort qids by year/question number
→ one qid per line
→ retain final newline
→ SHA256
```

Fresh reconciliation against the Current B System owner found no additional Current boundary delta after the exact historical resolver was restored.

## 7｜Boundary

This PASS means only:

> exact first-pass official **B System question membership** is accepted.

It does **not** mean:

- Question→Block mapping;
- Question→Logic Group mapping;
- Question→KP mapping;
- learner attempt/progress;
- B Projection/Runtime/Evidence PASS.

Reviewed Question→Knowledge relations remain separate and may be sparse.

## 8｜Verdict

```text
B S official-question membership = PASS
exact inventory = 1072 qids
inventory repair = CLOSED
```

B K/L remain accepted. B Projection remains its separate active/eligible gate.

Program-level exact-question completion lane continues to **C**.
