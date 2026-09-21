# Lexical Closure Audit — o1001–o1100 Final-Standard Backfill

- **Candidate:** BF10
- **Scope:** `o1001–o1100`
- **Semantic / Final-Learner owner-read head:** `61fa8f00d7f3aebb3ebd653a85255d18ea6d8829`
- **Latest main at audit close:** `1f75acebe693ec8205ee07eeca0610d646c9851a`
- **Production proposal blob:** `8ef77795ea29460d16599f2dae0c836983d18741`
- **Production module matrix blob:** `5c7b008ee6975c46ba85bb9b7d4a7a039bd72f93`
- **Content contract blob:** `e24ee14086ad711469ba56030a71df72e0d4910c`
- **Audit contract blob:** `9fa1dc0491a6b0affa677b0444262b6203d09756`
- **Final semantic freeze blob:** `1803953d7568143a499ed2fb0f12a5a263dd8955`
- **Audit mode:** STRICT
- **Blind-first:** `BLIND_FIRST_NOT_ENFORCED`

## Independence boundary

Kian explicitly requested continuous same-Chat execution. This Chat had already read Production's detailed proposal before auditing the materialized candidate. The audit is valid for semantic, identity, ownership, source-fidelity and Repair-Test defect discovery, but it is **not reviewer-independence evidence**.

## Coverage

```text
scope owners: 100/100
Production-affected owners reverse-reviewed: 18/18
complex owners: 86/86
complex NO_CHANGE owners: 68/68
simple NO_CHANGE fast-gated: 14/14
simple NO_CHANGE deep sample: 10/14
simple sample: 1006, 1016, 1025, 1030, 1045, 1067, 1073, 1074, 1096, 1097

Form/identity owners in scope: 11/11
Relation/confusable owners in scope: 9/9
secondary-expansion owners in scope: 2/2
family-bearing owners in scope: 8/8
cross-range dependency explicitly read: infectious@o2521

Repair Test blueprints: 25 -> 21
Repair Test targets resolved: 21/21
Final Learner Objects: 7,946 / 125 shards
BLOCKED: 0
```

The BF10 materialization itself is structurally sound:
- contagious↔infectious moved to the canonical hash-derived physical owner path and is reciprocal;
- the old contagious relation physical path is absent;
- contest learner truth is Form/Identity-owned and the redundant Relation has zero live views;
- continual↔continuous is reciprocal and preserves the existing external horizontal evidence;
- the 21 retained Repair Tests match the frozen final set.

## Findings

### F1 — conscience / conscious / conscientious cluster

**Production verdict:** NO_CHANGE on lexical Content; retained Repair Test at o1013  
**Audit verdict:** `FLIP_TO_UPGRADE`  
**Severity:** MATERIAL / OWNER  
**Risk family:** `RELATION_CLUSTER / LEARNER_PROJECTION`

The retained three-way learner boundary is not actually materialized as a three-way shared Relation:
- the relation owner has only a conscience source view;
- its members omit `conscientious`;
- `conscious` and `conscientious` Word owners have no relation refs;
- the Final Learner Object renders a self-repeating title: `conscience ↔ conscience ↔ conscious`.

The existing external-horizontal evidence already states the intended three-way boundary:
`conscience = moral sense; conscious = aware; conscientious = careful/dutiful`.

**Bounded correction:** preserve the same relation_id and evidence, make the relation a genuine three-member shared owner, add reciprocal Word refs/views for o1014/o1015, and use source-specific target expressions containing only the other two words.

### F2 — o1062 `contribute`

**Production verdict:** NO_CHANGE Content; Repair Test retarget only  
**Audit verdict:** `FLIP_TO_UPGRADE`  
**Severity:** MATERIAL / STRUCTURE  
**Risk family:** `TRANSITIVITY / ARGUMENT_PATTERN`

The main “give/contribute” Sense contains direct-object examples (`contribute money`, `contribute an article`) and the accepted reusable Construction `contribute sth to sth / contribute to sth`, but the Sense is still marked purely `vi. + to`.

**Bounded correction:** change that existing Sense to I/T and make the governing pattern explicitly cover `vt. + sth + to + target` and `vi. + to + target`. No new meaning or Sense.

### F3 — o1058 `contract`

**Production operation:** UPGRADE (family correction)  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL / OWNER  
**Risk family:** `COLLOCATION_OWNERSHIP`

The noun Sense “合同；契约” still owns `contract with sb` with the meaning “与某人签订合同”, while the actual verb Sense already owns the same lexical structure.

**Bounded correction:** retire the noun-owned duplicate collocation projection and keep the verb-owned `contract with sb`. The contract→contractor family correction remains valid.

### F4 — o1076 `convert`

**Production operation:** UPGRADE (remove generic family debt)  
**Audit verdict:** `REFINE_UPGRADE`  
**Severity:** MATERIAL / STRUCTURE  
**Risk family:** `TRANSITIVITY / ARGUMENT_PATTERN`

The religion branch is correctly marked `I/T` and contains both:
- `convert sb to a religion`;
- `convert to a religion`.

But its governing pattern still says only `vt. + object`.

**Bounded correction:** keep I/T; change the governing pattern to explicitly cover transitive conversion of someone and intransitive conversion to a religion.

## Findings not escalated

- confront's existing passive familiar-new branch was successfully promoted out of L3;
- consider→considerable, constitution→constitutional, consult→consultation, consume→consumer and contract→contractor family boundaries are useful and non-decorative;
- consistent→consistently, constant→constantly, constitute→constitutive and convert→convertible default family debt was removed as frozen;
- `be consumed by/with`, `to the contrary`, and `around the corner` are visible without new standing Test debt;
- continual↔continuous preserves the overlap warning and does not teach a false absolute rule;
- converge is now intransitive with on/upon/toward;
- all 21 Repair Test targets resolve.

## Source fidelity

```text
continual↔continuous external-horizontal evidence: PRESERVED
conscience/conscious/conscientious external-horizontal evidence: PRESERVED
contagious↔infectious: INHERITED_SOURCE_GAP_NONBLOCKING
fabricated evidence/provenance: NONE
```

The contagious↔infectious boundary predates BF10's physical-owner migration and currently carries no source evidence metadata. BF10 does not fabricate provenance; the gap is recorded as inherited and non-blocking for this ownership repair.

## Batch verdict

```text
MATERIAL findings: 4
LOCAL findings: 0
complex NO_CHANGE false-pass: 2/68 = 2.94%
simple sampled NO_CHANGE false-pass: 0/10 = 0%
IDENTITY_RISK verdicts: 0
BLOCKED: 0

new Human semantic delta required: NO
broad semantic reopen required: NO
pre-reconciliation batch result: PASS_WITH_CORRECTIONS
```

All four findings are bounded corrections inside existing learner truth.
