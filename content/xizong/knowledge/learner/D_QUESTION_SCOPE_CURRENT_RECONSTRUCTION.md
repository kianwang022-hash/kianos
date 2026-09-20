# D Question Scope — Current Reconstruction

Status: **PASS / CLOSED AFTER BOUNDED OWNER REPAIR**  
Date: 2026-09-20  
Scope: D — Neuro / Sensory / Motor / Orthopedics exact official System-question membership

Canonical owner:

`content/xizong/knowledge/learner/d-neuro-sensory-motor-orthopedics-question-scope.json`

## 1｜Required evidence

Trusted D System-question membership must be derived from reviewed evidence such as:

```text
official qid
→ reviewed Lecture/source position
→ Current D Primary owner
```

or an explicit Chat-reviewed Question→D relation.

Forbidden substitutes remain:

- practice subject/chapter taxonomy;
- Outline placement;
- Block/KP membership inference;
- question-text keyword guessing;
- historical-count fitting.

## 2｜Previous blocker and what changed

The previous BLOCKED receipt correctly observed that the **historical frozen D System pool** contained only:

```text
142 qids
= 139 neural/sensory/skeletal-muscle
+ 3 orthopedic
```

It then treated this as evidence that the historical 3,750-row locator layer lacked orthopedic positioning.

Fresh raw-locator readback falsified that inference.

The reviewed routing actually contains:

```text
217 qids
→ source = surgery lecture
→ lecture_scope_key starts with surgery|五、骨科|
```

Most of these rows have `source_page = null` or a legacy non-Lecture page value, but their reviewed `source_sha256 + lecture_scope_key` locator is intact.

The original routing validator itself permits `source_page = null` for non-gap rows as long as the reviewed source SHA and Lecture scope key are present.

Therefore the missing evidence layer named by the previous blocker **does exist at Lecture-section granularity**.

## 3｜Why the old resolver only returned 3 orthopedic questions

The frozen `resolveSystemClosureFromSourceUnion` resolver treated:

- known source-page rows by page-union ownership;
- null-page rows by an all-pages-covered scope test.

That rule was sufficient for the old frozen 8-System pool but under-resolved Current D orthopedics.

It does not erase the underlying reviewed qid→Lecture-scope locator.

## 4｜Current orthopedic owner reconciliation

Current D O1–O16 explicitly owns Primary surgery Source across the same reviewed `surgery|五、骨科|...` scopes, including:

- movement-system deformity;
- chronic injury and nerve entrapment;
- hand injury, knee injury, AVN and traumatic peripheral nerve injury;
- fracture principles;
- spine/pelvis/spinal-cord trauma;
- cervical/lumbar degenerative compression;
- upper/lower limb fractures and dislocations;
- pyogenic bone/joint infection;
- orthopedic TB;
- OA/AS/RA orthopedic comparison coordinates;
- bone tumors.

Thus:

```text
reviewed qid
→ reviewed orthopedic Lecture scope
→ Current D Primary owner
```

is complete for these 217 rows.

## 5｜Cross-System owner attack

### Bone/joint infection and TB

Retained in D.

C owns shared infection/TB language. D O13/O14 own organ-specific bone/joint anatomy, imaging, structural consequences and Current surgery-source treatment questions.

### Bone tumors

Retained in D.

Tumor-general and myeloma clonal Primary remain external, but D O16 owns Current surgery-supported bone-tumor classification, imaging, representative lesions and treatment questions.

### RA

One qid is transferred out of D:

`xizong-official-2007-n150`

It tests general RA medical Primary:

- inflammatory identity;
- age/sex pattern;
- symmetric-joint pattern;
- RF positivity.

Current O15 explicitly keeps RA immune/medical Primary in C/H17 and owns only orthopedic/surgical comparison coordinates.

Therefore this qid is transferred to C.

## 6｜Accepted identity

```text
historical exact D resolver qids        = 142
reviewed orthopedic Lecture-scope qids = 217
overlap                                 =   3
union before owner transfer             = 356
RA Primary transferred D → C            =   1
Current exact D scope                    = 355
inventory SHA256                        = 129657b6612e2c9b26ea98b44fabd2d864d3c273e8dd91bfa1c9020d1d97b0be
unresolved membership ambiguity          =   0
```

The numerical coincidence `356 candidate qids == 356 canonical D KPs` has **zero evidentiary weight** and was not used to choose membership.

## 7｜Question / Knowledge boundary

D System membership does not create:

- Question→Block mapping;
- Question→Logic Group mapping;
- Question→KP mapping.

Reviewed relation truth remains separate and may be sparse.

No learner attempt, mastery, W/U, Memory, holdout or review state belongs here.

## 8｜Verdict

```text
D S2 exact official System-question membership = PASS_AFTER_BOUNDED_REPAIR
Current qids = 355
```

D K/L/Content remain accepted. D Projection remains the separate active/eligible downstream gate.

Program exact-scope lane continues to **E**.
