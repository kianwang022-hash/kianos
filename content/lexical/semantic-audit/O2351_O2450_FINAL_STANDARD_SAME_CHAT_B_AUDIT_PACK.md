# BF23 o2351–o2450 — Same-Chat B Changed-Owner Readback

Status: **PASS_WITH_CORRECTIONS**

Independence note: **BLIND_FIRST_NOT_ENFORCED**.

## Coverage

- Production scope: **100 / 100**
- affected owners: **35**
- PRESERVE: **65**
- BLOCKED: **0**
- changed Word owners read back: **40 / 40** (35 in-range + 5 remote)
- new Relation owners read back: **5 / 5**
- relation manifest read back: **1 / 1**
- Human-Gated new knowledge groups: **11 / 11**
- Final Learner Objects: **7,946 / 7,946**
- executor hash / duplicate / write-scope guards: **PASS**

## Human-Gated groups — PASS

1. hold → held → held
2. hole ↔ whole homophone confusable
3. honor / honour regional spelling
4. horse ↔ hoarse common-pronunciation overlap with dialect caveat
5. hour ↔ our pronunciation overlap with accent-dependent alternatives
6. house noun /haʊs/ vs verb /haʊz/
7. human ↔ humane near-form decision boundary, pending one overlap refinement below
8. humor / humour regional spelling
9. hurt → hurt → hurt
10. hypothesis → hypotheses
11. imaginary ↔ imaginative near-form decision boundary

## B corrections

### B23-01 — o2354 hole + hole↔whole Relation
Verdict: **REFINE_UPGRADE**

- Move the existing L2 make-a-hole verb ahead of L3 branches so the L2 block is contiguous.
- Tighten Core wording for the golf branch to the owned Sense: one hole / playing period on a golf course.
- The Relation target is the adjective Sense of `whole`; learner wording must therefore say `whole = 完整的/全部的`, not use noun `整体` as if it were the anchored target Sense.

### B23-02 — o2362 honey
Verdict: **REFINE_UPGRADE**

The existing L2 vocative/endearment branch was correctly added to Core but remains after three L3 branches in sort order. Move it directly after L1 honey, then keep all L3 branches below it.

### B23-03 — o2363 honor
Verdict: **REFINE_UPGRADE**

The new honor/honour Form is correct. Core still says “贞操 / a woman's virtue or chastity” although the only active noun Sense owns honor/respect/esteem and contains no chastity meaning. Remove the unsupported Core wording; do not create a new Sense.

### B23-04 — o2365 hook
Verdict: **REFINE_UPGRADE**

The L3 bend-into-a-hook branch is correctly outside default Core, but active L2 `hooked on` is still sorted after that L3 branch. Move L2 hooked-on before L3 bend.

### B23-05 — o2399 human + human↔humane Relation
Verdict: **REFINE_UPGRADE**

The Relation is useful but its current absolute wording conflicts with the preserved L3 human Sense “showing kindness and sympathy”.

Correct boundary:
- default `human` = relating to people/humankind;
- `human` also has a lower-priority overlapping compassionate/human-hearted Sense;
- for the learner decision “人道的/仁慈的，尤其强调减轻痛苦”, `humane` is the standard choice.

Do not delete the L3 human Sense and do not collapse the two Word owners.

## Other findings — PASS

- all tightened L1/L2 ordering fixes from Production Self Attack
- all requested negative-space removals
- remote whole relation refs preserve its existing semantic-neighbor Relation
- horse/hoarse and hour/our claims correctly avoid universal-accent overstatement
- house pronunciation ownership is Form, not fake Relation
- hypothesis plural is Form, not new Sense
- imaginary/imaginative boundary is clean
- relation manifest = 448

## Batch verdict

```text
BF23_PRODUCTION = PASS
HUMAN_GATE = APPROVED
MATERIALIZATION = PASS
B_READBACK = PASS_WITH_CORRECTIONS
CORRECTION_ORDINALS = 2354, 2362, 2363, 2365, 2399
NEW_HUMAN_GATE_REQUIRED = NO
FINAL_LEARNER_OBJECTS = PASS 7946/7946
```
