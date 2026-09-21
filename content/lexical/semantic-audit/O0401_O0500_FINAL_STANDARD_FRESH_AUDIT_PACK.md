# Lexical Closure Audit — o0401–o0500 Final-Standard Backfill

- **Candidate:** BF04
- **Scope:** `o0401–o0500`
- **Candidate readback head:** `f7e9ec38ddbb77167978d887600533e32338e58e`
- **Frontier base:** `8268f595387a855d2fe048bb3245f121a1754446`
- **Latest main drift-check head:** `2cbd7b54af4e576b2186dc71641260644cc6aeeb`
- **Production proposal:** `content/lexical/execution/manifests/o0401-o0500.final-sweep-a-proposal.md`
- **Audit mode:** STRICT
- **Blind-first:** BLIND_FIRST_NOT_ENFORCED

## Coverage

```text
frozen Production owner coverage: 100/100
bounded corrections: 18
approved Expansion/Form assets: 8
unique changed in-range owners: 24
shared external Word owners: 4
shared Relation closures: 5
retired weak generic Relations: 3
Repair Test blueprints: 43 -> 22
Final Learner Objects: 7,946
Final Learner shards: 125
BLOCKED: 0
```

## Materialized result

Confirmed:

- bar Core now predicts bar/rod, pub/bar, barrier, and prohibit branches;
- barren noun branch is Reference-only;
- base has the approved chemistry noun Sense;
- basement weak family depth is removed;
- basis owns basis→bases Form/pronunciation identity;
- bathroom↔toilet, believe↔think, beside↔besides, bias↔prejudice are reciprocal;
- bearing low-leverage endurance/childbearing branches are Reference-only;
- beef cattle-raising/slaughtering branch is Reference-only;
- bear, beat, become, begin, behavior/behaviour, bend, bind and bite own the approved Form truth;
- begin and bill use stable learner Constructions rather than raw pseudo-structures;
- beneficial→beneficiary generic family depth is removed;
- besides↔also/too/likewise weak generic Relations are retired;
- between pseudo-Construction is coalesced into the existing among↔between Relation;
- billion long-scale 10^12 material is explicitly historical/obsolete Reference truth;
- bind's bound-to/bound-by model now allows inevitability and context-dependent obligation;
- Test debt contracts from 43 to 22 without creating new standing Tests merely because Content was admitted.

## Closure-audit findings

### 1. prejudice reciprocal display target

**Severity:** LOCAL  
**Risk family:** relation_projection

The reciprocal bias↔prejudice view initially inherited stale display metadata and rendered as `prejudice ↔ prejudice`.

**Correction:** explicitly set the reciprocal target/display expression to `bias`.

**Readback:** PASS — FLOB now renders `prejudice ↔ bias`.

### 2. bearing Core after Reference demotion

**Severity:** LOCAL  
**Risk family:** layer_projection

The two low-leverage bearing branches were correctly moved to Reference, but Core wording still told the learner to expect endurance/childbearing.

**Correction:** align Core summary/decision clusters to only relevance/effect, direction, demeanor and mechanical bearing.

**Readback:** PASS — Final Learner Object contains only the four active default Study branches and matching Core wording.

## Repair Test closure

Final standing set: **22**.

First half:
`bargain, base, bathe, bay, bear, bearing, beef, beg, behalf, behave`

Second half:
`believe, bell, belong, beneficial, benefit, beside, between, bias, bid, bill, bind, bit`

Key retargets:

- bear → exact `bear → bore → borne/born` Form decision;
- bearing → exact `have a bearing on sth` Construction;
- between → among↔between shared Relation;
- bias → bias↔prejudice shared Relation;
- bind → corrected `bound to / bound by` Construction;
- bill → whole structure decision rather than a stale single-construction target.

## Drift closure

Between BF04 frontier base and current main, no `content/lexical/**` file changed.

No candidate semantic refreeze is required.

## Final result

```text
LOCAL findings: 2
MATERIAL findings: 0
IDENTITY findings: 0
unresolved findings: 0
new Human semantic delta required: NO
broad semantic reopen: NO
Final Learner closure: 7,946 / 125 shards
Repair Test closure: 22
```

**Final batch result: PASS_WITH_CORRECTIONS**

Both local corrections are already materialized and read back. BF04 is ready for bounded reconciliation and merge.
