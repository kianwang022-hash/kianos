# BF21 o2151–o2250 — Same-Chat B Changed-Owner Readback

Status: **PASS_WITH_CORRECTIONS**

Independence note: **BLIND_FIRST_NOT_ENFORCED**.

This is the required changed-owner B readback after BF21 materialization. It verifies the 39 written paths, including remote Form owners and the new hair↔hare Relation. It does not claim strongest fresh-reviewer independence.

## Coverage

- Production scope: **100 / 100**
- Production affected owners: **33**
- PRESERVE owners: **67**
- changed Word owners read back: **36 / 36** (32 in-range + 4 remote)
- new Relation owners read back: **1 / 1**
- relation manifest read back: **1 / 1**
- Human-Gated new knowledge groups: **7 / 7**
- Final Learner Objects: **7,946 / 7,946**
- BLOCKED: **0**

## Human-Gated groups

PASS:

1. o2155 go — go / going / went / gone
2. o2162 good + o5388 well + o0474 better + o0471 best — shared comparison surfaces without collapsing frozen Word owners
3. o2166 goose — goose / geese
4. o2203 grey — grey / gray regional spelling identity
5. o2208 grind + o2214 ground — grind / ground / ground while preserving independent word:ground
6. o2216 grow — grow / grew / grown
7. o2239 hair + o5546 hare — reciprocal homophone confusable Relation

The hair↔hare Relation is a genuine cross-word learner decision boundary and is correctly owned as Relation truth rather than Form identity.

## B corrections

### B21-01 — o2206 grim
Verdict: **REFINE_UPGRADE**  
Risk family: Core↔sense integrity  
Severity: **LOCAL**

The promoted modern branch is valid, but `core_meaning` / mental-model wording says “very serious / worrying” beyond the active branch's owned definition (“causing fear or dread; unpleasant”). Keep the L1 promotion; narrow Core summary to the actual active sense.

### B21-02 — o2179 graduate
Verdict: **REFINE_UPGRADE**  
Risk family: Form ownership / Core negative space  
Severity: **IDENTITY**

The noun/adjective vs verb pronunciation boundary is correctly migrated to Form/Identity. Two residues remain:
- the old one-member pronunciation Relation owner still publishes the same truth even though the Word no longer references it;
- default Core still contains unsupported “mark with degrees/divisions” wording and the L3 measuring-instrument branch.

Narrow correction: retire the old Relation projection, preserve its historical owner file, and keep default Core to learner-use graduate verb/noun/adjective plus degree-conferring verb.

### B21-03 — o2215 group
Verdict: **REFINE_UPGRADE**  
Risk family: negative space / layer placement  
Severity: **LOCAL**

The L1 grouping verb was correctly promoted, but default Core still lists the chemistry L2 and mathematical L3 specialist noun branches. Preserve both active; remove them from default Core.

### B21-04 — o2220 guard
Verdict: **REFINE_UPGRADE**  
Risk family: layer placement  
Severity: **LOCAL**

`guard against` is correctly promoted from L3 to useful Expansion/L2, but it remains in the default Core verb cluster. Preserve it at L2; default Core stays physical protection plus ordinary guard noun/device.

### B21-05 — o2233 gut
Verdict: **REFINE_UPGRADE**  
Risk family: negative space / layer placement  
Severity: **LOCAL**

The L1 “gut an animal” verb is correctly promoted, but the rare geographic “narrow channel/strait” L2 noun remains in default Core. Preserve it active in Expansion; remove only that specialist branch from Core.

## Other readback findings

PASS:
- God/god capitalization Form ownership
- graduate pronunciation Form payload itself
- grant construction deduplication
- grave→gravity seriousness anchor
- guide→guidance advisory anchor
- grey verb I/T structure
- guilt responsibility vs remorse separation
- gun signal/salute correction
- guy ordinary-person priority
- habit ordinary repeated-behavior priority
- hail taxi usage ownership
- half / hand / handicap ordering
- all remote shared Form endpoints
- hair↔hare reciprocal Relation path/refs/payload
- relation manifest 440
- executor hash/dependency/write-scope guards

## Batch verdict

```text
BF21_PRODUCTION = PASS
HUMAN_GATE = APPROVED
MATERIALIZATION = PASS
B_READBACK = PASS_WITH_CORRECTIONS
CORRECTION_ORDINALS = 2179, 2206, 2215, 2220, 2233
NEW_HUMAN_GATE_REQUIRED = NO
FINAL_LEARNER_OBJECTS = PASS 7946/7946
```

After these five bounded refinements plus retirement of the stale graduate Relation projection, rebuild 7,946 Final Learner Objects and perform one final readback.
