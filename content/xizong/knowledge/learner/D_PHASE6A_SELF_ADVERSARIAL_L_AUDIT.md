# D Neuro · Sensory · Motor · Orthopedics — Phase 6A Self-Adversarial L Audit

Status: **REPAIRED_CANDIDATE_READY_FOR_FRESH_INDEPENDENT_AUDIT**  
Scope: D Learning Logic only  
Evidence mode: **ADVERSARIAL + STRUCTURAL**  
Independence: **SELF** — this is builder-side falsification, not fresh independent acceptance

## 1｜Audit target

Candidate under attack:

`content/xizong/knowledge/learner/d-neuro-sensory-motor-orthopedics-learning.json`

Inherited authority:

- root `LEARNING_ASSET_STANDARD.md`
- root `LEARNING_ACCEPTANCE.md`
- `content/xizong/LEARNING_CONTRACT.md`
- `content/xizong/knowledge/learner/study-policy.json`
- Current D `system.json`
- 27 canonical D Block Core owners

The audit did **not** use green UI/runtime behavior as proof and did not create Learner Truth.

## 2｜Strongest failure hypothesis found

The first compiled candidate had a materially over-serial readiness graph.

It correctly stated that the default route was not a prerequisite chain, but its machine-readable `requires` map still promoted several **helpful ordering / comparison / integration relations** into hard gates.

This would later have allowed Projection/Runtime to produce false locks such as:

```text
N11 not complete → O1 unavailable
O5 not complete  → O6/O7/O8 unavailable
O13 not complete → O14 unavailable
O7 not complete  → O10 unavailable
N9 not complete  → N10 unavailable
```

Those locks are not justified by the medical/Learning model.

Verdict before repair:

> **L candidate = MATERIAL DEFECT / NOT PROMOTABLE**

## 3｜Prerequisite test reapplied

A hard prerequisite must satisfy all four:

1. earlier Block owns a model the current Block actually consumes;
2. current Block does not intentionally rebuild it;
3. missing it would force hidden guessing or duplicate teaching;
4. bounded reactivation/minimal repair would not be sufficient.

If a relation only improves source continuity, comparison quality, integration richness or learner comfort, it belongs in `benefits_from` / default routing, not `requires`.

## 4｜Hard-edge repairs

### Neural branch

#### N8

Before:

```text
requires = N2 + N4
```

After:

```text
requires = N2
benefits_from = N4 + N5 + N3
```

Why: N8 is motor-control organization. Full NMJ/skeletal-muscle actuator learning improves the closed-loop model but is not required for reflex/tone/basal-ganglia/cerebellar/cortical-control formation.

#### N9

Before:

```text
requires = N2 + N5
```

After:

```text
requires = N2
benefits_from = N5
```

Why: N5 nonspecific-projection/arousal language is useful, but N9 itself owns EEG/sleep/wake network-state learning.

#### N10

Before:

```text
requires = N9 + N2
```

After:

```text
requires = N2
benefits_from = N9 + N3 + external homeostasis/endocrine owners
```

Why: N9→N10 remains an excellent low-switching Source order, but complete sleep learning is not a semantic prerequisite for memory/language/hypothalamic control.

### Orthopedic branch

#### O1

Before:

```text
requires = N11
```

After:

```text
requires = none
benefits_from = N11 + N4/N5
```

Why: O1 is an integration/orientation map. It must not become a universal gate that serializes all orthopedic learning behind completion of the neural branch.

#### O2

Before:

```text
requires = O1
```

After:

```text
requires = none
benefits_from = O1
```

Why: general fracture classification/healing/treatment is self-contained.

#### O4 / O5

Before:

```text
O4 requires O1 + N11
O5 requires O1 + N11
```

After:

```text
O4 requires N11
O5 requires N11
O1 = helpful orientation only
```

Why: root/cord/cauda and named-nerve localization truly consume N11; O1 is not a missing medical model.

#### O6 / O7

Before:

```text
requires = O2 + O5
```

After:

```text
requires = O2
benefits_from = O5/N11
```

Why: regional fractures apply the common fracture model. Full traumatic peripheral-nerve learning is helpful for complications but not necessary to form the fracture model.

#### O8

Before:

```text
requires = O2 + O5
```

After:

```text
requires = none
benefits_from = O2 + O5 + O6
```

Why: hand trauma/replant has an independent tissue-viability/coverage/function model; it is not simply “fracture + nerve injury”.

#### O9

Before:

```text
requires = O1
```

After:

```text
requires = none
benefits_from = O1/O7
```

#### O10

Before:

```text
requires = O7
```

After:

```text
requires = none
benefits_from = O7 + O1
```

Why: femoral-neck fracture is an important AVN interface, not a prerequisite for the ischemia→necrosis→collapse model.

#### O11

Before:

```text
requires = O5
```

After:

```text
requires = N11 for full-Block closure
benefits_from = O5
```

Why: the chronic soft-tissue Source unit is independent, but full O11 includes root-vs-entrapment localization. N11 is the actual prerequisite; O5’s acute traumatic nerve model is not.

#### O12 / O13 / O15 / O16

Before:

```text
requires O1
```

After:

```text
requires = none
O1 = orientation benefit only
```

Why: developmental deformity, orthopedic infection, OA/AS/RA structure and bone tumor models are not causally downstream of an orientation Block.

#### O14

Before:

```text
requires = O13
```

After:

```text
requires = none
benefits_from = O13 + common TB owner
```

Why: pyogenic infection is a strong discriminator, not a prerequisite for learning osteoarticular TB.

## 5｜Sparse graph after repair

True inside-D hard dependencies now reduce to:

```text
N1 → N2 → N3 → N4
 │    ├────────→ N8
 │    ├────────→ N9
 │    └────────→ N10
 └→ N5 → N6
      └→ N7
N5 + N8 → N11

O2 + N11 → O3
N11 → O4
N11 → O5
O2 → O6
O2 → O7
N11 → O11 (full-Block closure)
```

All other seriality in the default route is guidance / low-switching preference, not hard legality.

This is intentionally sparse.

## 6｜Alternative routes re-tested

### Locomotor-first compression

```text
N1/N2 → N4 → N8 → N5 → N11
→ O1/O2/O3/O4/O5/O6/O7
```

Legal after repair. N9/N10 can remain later because they do not gate N11.

### Orthopedic early branch

```text
O1 orientation
→ O2 fracture common model
→ O6/O7 regional trauma
```

Legal without completing the full neural branch. Only O3/O4/O5 and full O11 require N11.

### Destructive-disease branch

```text
O13 / O14 / O15 / O16
```

May be constructed/learned when their own Source and external baselines are available; they are not falsely chained to O1→...→O12 or to each other. Default late clustering remains useful for low switching and PSR-D5 compression.

## 7｜Other Phase-5 repairs rechecked

No regression found in:

- mixed Source-contact classes;
- N11/O1 integration-primary behavior;
- `VISUAL_REQUIRED ≠ separate source trip`;
- exact 356 KP / 128 LG semantic partition;
- non-contiguous LG membership;
- O12 Source gap preservation;
- Source-conflict preservation;
- external-owner negative space;
- smallest-sufficient repair and return;
- no learner-state manufacture.

## 8｜Self-audit verdict

```text
pre-repair candidate                       NOT PROMOTABLE
material defect                            OVER-SERIAL HARD READINESS EDGES
repair                                     SPARSE TRUE-PREREQUISITE DAG
356 KP / 128 LG partition                  UNCHANGED
Source-contact semantics                   UNCHANGED
visual / negative-space semantics          UNCHANGED
builder-side adversarial verdict           REPAIRED_CANDIDATE_READY
independence                               SELF
fresh independent L acceptance             STILL REQUIRED BEFORE L PASS
P/R/E                                      REMAIN FROZEN
```

This receipt is construction evidence only. It does not promote L to PASS by itself.
