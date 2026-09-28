# BF22 o2251–o2350 — Same-Chat B Changed-Owner Readback

Status: **PASS_WITH_CORRECTIONS**

Independence note: **BLIND_FIRST_NOT_ENFORCED**.

## Coverage

- Production scope: **100 / 100**
- affected: **32**
- PRESERVE: **68**
- BLOCKED: **0**
- changed Word owners read back: **33 / 33** (32 in-range + remote o0129 air)
- new Relation owners read back: **3 / 3**
- relation manifest read back: **1 / 1**
- Human-Gated new knowledge groups: **10 / 10**
- Final Learner Objects: **7,946 / 7,946**
- executor hash / dependency / duplicate / scope guards: **PASS**

## Human-Gated groups — PASS

1. hang: ordinary `hung`; execution branch `hanged`
2. harbor / harbour regional spelling
3. hard ↔ hardly near-form semantic confusable
4. have → had → had
5. heal ↔ heel homophone confusable
6. hear → heard → heard while preserving hear↔here
7. heir ↔ air homophone confusable with remote o0129 entrypoint
8. herb UK/US pronunciation identity
9. hide → hid → hidden
10. hit → hit → hit / hitting

Existing canonical Relations hear↔here, historic↔historical, have↔own, hesitate↔pause, hit↔strike remain single-owned and were not duplicated.

## B corrections

### B22-01 — o2253 handsome
Verdict: **REFINE_UPGRADE**  
Risk: sense wording  
Severity: LOCAL

The Chinese learner wording was correctly narrowed to “可观的；相当大的；丰厚的”, but the active L2 English definition still says `generous or ample`, which can invite the unwanted personality/generosity reading. Narrow both English definition and label to amount/size: `considerable or ample in amount, size, or value`.

### B22-02 — o2285 headline
Verdict: **REFINE_UPGRADE**  
Risk: Core negative space  
Severity: LOCAL

The L3 publicize-widely verb is correctly outside default Core, but `core_meaning_cn/en` and mental model still say “宣传/publicity”. Narrow Core summary to headline/news heading/summary and the ordinary add-a-headline verb.

### B22-03 — o2348 hit
Verdict: **REFINE_UPGRADE**  
Risk: Core↔L1 integrity  
Severity: LOCAL

The existing `hit = affect badly/severely` branch is correctly promoted to L1 and included in the Core cluster, but the Core summary still only says “打；击中 / strike…reach a target”. Update the compact Core summary to include the promoted high-value “严重影响/打击” branch without adding new meaning.

## Other readback findings — PASS

- all requested L3 negative-space removals
- hard adverb L1 ordering
- have experience/illness branch in Core
- heat intransitive branch at L2
- hedge noncommittal verb at L2 with intransitive syntax
- heel body-part L1 restoration
- historic family duplicate removed while historic↔historical Relation remains
- air/heir, heal/heel and hard/hardly Relation ownership and reciprocal refs
- relation manifest count = 443

## Batch verdict

```text
BF22_PRODUCTION = PASS
HUMAN_GATE = APPROVED
MATERIALIZATION = PASS
B_READBACK = PASS_WITH_CORRECTIONS
CORRECTION_ORDINALS = 2253, 2285, 2348
NEW_HUMAN_GATE_REQUIRED = NO
FINAL_LEARNER_OBJECTS = PASS 7946/7946
```
