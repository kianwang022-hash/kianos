# B Question Scope — Current Reconstruction

Status: **PASS / CLOSED**  
Date: 2026-09-20  
Scope: B — Digestive / Metabolic / Endocrine / Tumor exact official System-question membership

Canonical owner:

`content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-question-scope.json`

## 1｜Question

The task is not to classify 3,750 questions again from stems.

The accepted recovery path is:

```text
official question
→ reviewed primary Lecture position
→ B Source coverage
→ approved scope-collision decision
→ Current B negative-space check
→ exact System qid membership
```

Question→Block / LG / KP mapping remains a separate reviewed relation layer.

## 2｜Historical position evidence

Reviewed historical routing:

`kianwang022-hash/kianos-site-v238-recovery@a38444057dd46fbf1765052d17c5f6b6a018d2f7`

- `public/xizong-system-source-routing.v1.local.json`
- Git blob: `e184f0fc899de0a6bf47c5b194fe328d2f1977de`
- 3,750 rows
- each row records stable `question_id`, primary Lecture source SHA, `lecture_scope_key`, and source page when available.

Reviewed System Source coverage:

- `public/xizong-system-official-scope.v2.local.json`
- Git blob: `b239dba8e3e2969b47a534be9d5daa3e001ab5d3`
- B coverage entries: **43**
- historical B base-pool count: **1072**, used only as a post-hoc sanity check, never as a target.

Current Question Truth preserves the same immutable 3,750-ID inventory:

`0abc1a3cadbb41b36808fe86ff58c21ede6f4297312e9fb4c2da62b865ef2c82`

## 3｜Deterministic candidate rule

For every reviewed 3,750-row routing record:

1. registered Source-gap rows do not create fixed System membership;
2. source SHA must match a B coverage owner;
3. when a B coverage row has a `lecture_scope_key`, the routed question must have that exact Lecture scope;
4. when a routed page is known, it must lie inside B's accepted page range;
5. when the routed page is null, exact Lecture-scope identity is retained as a candidate and resolved by the accepted boundary;
6. coverage with no Lecture-scope key requires page-range inclusion;
7. reviewed collision decisions are applied;
8. Current B owner negative space is applied last.

This method reproduced accepted A3 exactly and exposed the same bounded owner/collision behavior already documented by A1/A2 recovery. It does not use Current nullable question classification fields or keyword inference.

## 4｜Relevant historical collision decisions

Preserved reviewed decisions:

- **SYSCOPE-COLLISION-02** — internal medicine gastritis belongs B rather than C;
- **SYSCOPE-COLLISION-04** — physiology endocrine overview belongs B rather than E;
- **SYSCOPE-COLLISION-07** — surgery “other neck/chest disease” does not belong B/E; its reviewed owner is respiratory.

No new collision was invented from question text.

## 5｜Fresh Current boundary defect

The deterministic historical-position candidate produced **1074** B candidates.

Two rows came from a stale broad D23 interface:

- `xizong-official-2006-n020`
  - Current stem: completion time of a reflex mainly depends on the number of central synapses;
- `xizong-official-2006-n021`
  - Current stem: inhibitory postsynaptic potential physiology.

Both route to:

`physiology|第十章 神经系统|2.突触传递、中枢抑制和易化`

Current D23 owner is now explicit:

- Primary = physiology P399–406 calcium-regulating hormones + GH/IGF;
- surgery P6–7 parathyroid sub-scope;
- Neuro/P0 is only bounded Recall for low-calcium excitability.

Therefore general reflex / synaptic physiology is external Neuro truth, not B Primary.

These two qids were excluded by Current owner boundary, not by count fitting.

Result:

```text
historical-position candidates = 1074
Current boundary exclusions    = 2
final accepted B scope         = 1072
unresolved ambiguities         = 0
```

## 6｜Accepted scope identity

```text
question_count = 1072
year range     = 2005–2026
inventory SHA = 2fb2cbb8287a4f5da73bc20afc344823c9022cba708fb99d5d04569a391c8ab8
```

Hash convention matches the accepted A3 owner:

```text
sort qids by year/question number
→ one qid per line
→ retain final newline
→ SHA256
```

## 7｜Boundary

This PASS means only:

> the exact first-pass official **B System question membership** is accepted.

It does **not** mean:

- Question→Block mapping;
- Question→Logic Group mapping;
- Question→KP mapping;
- learner attempt/progress;
- B Projection/Runtime/Evidence PASS.

Reviewed Question→Knowledge relations remain separate and may be sparse.

## 8｜Verdict

```text
B S official-question membership sub-boundary = PASS
```

B K/L remain accepted. B Projection remains its separate active/eligible gate.

Program-level exact-question completion lane may now continue to **C**.
