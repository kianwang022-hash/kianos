# Lexical Closure Audit — o0501–o0600 Final-Standard Backfill

- **Candidate:** BF05
- **Scope:** `o0501–o0600`
- **Candidate readback head:** `4690918ee422b04593f63196b66080d17d515d81`
- **Frontier base:** `14dea5a3a58d0e0a45a8defb1b055ea7df96b9cf`
- **Latest main drift-check head:** `c044ab2a39026caf9000b638f1888e94f563fd68`
- **Production proposal:** `content/lexical/execution/manifests/o0501-o0600.final-sweep-a-proposal.md`
- **Production proposal blob:** `def8c8d75f0358eeec7f2c31448544ad65d8a41a`
- **Audit mode:** STRICT
- **Blind-first:** BLIND_FIRST_NOT_ENFORCED

## Coverage

```text
frozen Production owner coverage: 100/100
bounded corrections: 17
approved new-material owners: 7
unique affected in-range owners: 23
shared external Word dependencies checked: 4 (bear, bind, lend, smart)
shared Relation closures: 3
Repair Test blueprints: 45 -> 22
Final Learner Objects: 7,946
Final Learner shards: 125
BLOCKED: 0
```

## Materialized result

Confirmed:

- blade beef-cut branch is Reference-only;
- block / blur / bottom promoted phraseology is owned by stable Constructions;
- blood idioms `bad blood` and `in cold blood` are explicit phraseology, while temperament/hunting branches are Reference-only;
- bloom transitive make-flourish branch and blow botanical branch are Reference-only;
- bleed owns `bleed → bled → bled` plus the approved money/resources/jobs drain branch;
- bolster one-member pseudo-Relation is retired;
- bore / born coalesce with BF04 `bear → bore → borne/born` Form truth without losing independent lexical bore/born content;
- borrow↔lend is a reciprocal direction/argument Relation;
- bound coalesces with BF04 `bind → bound → bound` Form truth and owns `be bound by sth`;
- top brass is explicit phraseology rather than a literal-metal collocation;
- breach owns the approved legal/security transitive branch plus `be in breach of sth`;
- break, breed, bring own approved irregular Forms;
- breath↔breathe is reciprocal;
- bright↔smart is reciprocal and anchored to smart's intelligence Sense rather than the stale quick/brisk Sense;
- broadcast owns the approved public-dissemination branch plus broadcast/broadcasted Form truth;
- broom specialist plant Sense is outside default Study;
- Test debt contracts from 45 to 22 without creating standing Tests merely because new Content was admitted.

## Pre-materialization dependency reconciliation

The frozen bright↔smart contrast was semantically useful, but its existing Relation owner pointed at smart's `quick and brisk` Sense instead of the intended intelligence branch.

**Correction applied before candidate freeze:**

- target Sense changed to `sense:smart:cfed592e737451a3`;
- source/target definitions aligned to intelligence;
- reciprocal smart→bright view added.

**Readback:** PASS — both FLOB directions now express the intended intelligence boundary.

## Closure-audit findings

### 1. block promoted-pattern duplication

**Severity:** LOCAL  
**Risk family:** construction_projection

`block sb/sth from doing sth` was correctly promoted into a stable Construction, but the same raw fixed-pattern collocation remained active.

**Correction:** remove the raw active collocation while retaining the Construction.

**Readback:** PASS — the pattern appears once, as Construction.

### 2. blur promoted-pattern duplication

**Severity:** LOCAL  
**Risk family:** construction_projection

`blur the line/distinction between A and B` was correctly promoted, but its raw collocations remained learner-visible.

**Correction:** remove those raw active collocations while retaining the Construction.

**Readback:** PASS — the decision phrase appears once, as Construction.

### 3. bottom-line promoted-pattern duplication

**Severity:** LOCAL  
**Risk family:** construction_projection

`the bottom line` was promoted to explicit phraseology, but a second raw `bottom line` usage remained under the adjective branch.

**Correction:** remove both raw idiomatic bottom-line collocations while retaining the Construction; literal bottom-shelf usage remains.

**Readback:** PASS.

## Repair Test closure

Final standing set: **22**.

First half (12):
`blame, blast, blaze, blend, blind, blunder, board, boast, boil, border, born, borrow`

Second half (10):
`bother, bottle, bound, bow, brace, brand, breath, breathe, breeze, brief`

Key retargets:

- born → shared bear Form decision;
- borrow → borrow↔lend reciprocal Relation;
- bound → exact bound-to / bound-for / bound-by decision model;
- breath → breath↔breathe reciprocal confusable Relation.

No standing Test is created for newly admitted bleed/blow/breach/break/breed/bring/broadcast Content solely because the Content is worth preserving.

## Drift closure

Main advanced from BF05 frontier base `14dea5a3a58d0e0a45a8defb1b055ea7df96b9cf` to `c044ab2a39026caf9000b638f1888e94f563fd68`, but the drift contains **no `content/lexical/**` changes**.

No semantic refreeze is required.

## Final result

```text
LOCAL findings: 3
MATERIAL findings: 0
IDENTITY findings: 0
unresolved findings: 0
new Human semantic delta required: NO
broad semantic reopen: NO
Final Learner closure: 7,946 / 125 shards
Repair Test closure: 22
```

**Final batch result: PASS_WITH_CORRECTIONS**

All three local corrections are materialized and read back. BF05 is ready for bounded reconciliation and merge.
