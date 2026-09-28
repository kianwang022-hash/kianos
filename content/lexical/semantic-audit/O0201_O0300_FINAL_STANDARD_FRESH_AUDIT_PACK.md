# Lexical Closure Audit — o0201–o0300 Final-Standard Backfill

- **Candidate:** BF02
- **Scope:** `o0201–o0300`
- **Candidate branch:** `work/lexical-continuous-bf02-20260921`
- **Owner-read / post-correction head:** `cbe86b9f058f265d0b6042cdb467e97737933648`
- **Current main drift-check head:** `7684b411a64ebcc4ece7eb93299f5456261ce6b6`
- **Production proposal:** `content/lexical/execution/manifests/o0201-o0300.production-c-lookahead.md`
- **Production proposal blob:** `4e496fdcc141b2cd194cba5a7c9a345ffde0172e`
- **Content contract blob:** `e24ee14086ad711469ba56030a71df72e0d4910c`
- **Audit contract blob:** `9fa1dc0491a6b0affa677b0444262b6203d09756`
- **Router spec blob / version:** `94fa18d48bf4f42f2d8c51bf15705244efb14c48` / `1.0.0`
- **Final Learner manifest blob:** `221dc6bdc6accd69627c6a232b6e63cd275d52ce`
- **Audit mode:** STRICT
- **Blind-first:** BLIND_FIRST_NOT_ENFORCED
- **Reason:** same Chat performed frozen-proposal materialization and closure audit under Kian's batch-landing instruction.

## Coverage

```text
scope owner transport: 100/100
changed in-range Word owners reverse-read: 24/24
shared external Word owner readback: 1/1 (flat)
shared Relation/Form closures inspected: 3/3
Repair Test final blueprints: 15/15
changed/shared Final Learner readback: 25/25
Final Learner objects: 7,946
Final Learner shards: 125
BLOCKED: 0
new learner semantic scope: 0
```

The 100-owner frozen review bundle from workflow run `35447077885` / artifact `10585925160` was retained as the full-scope transport baseline. Candidate-specific closure then read back every changed owner and shared target from the materialized branch.

## Production result preserved

The frozen BF02 Production proposal remains materially correct:

- 24 owners need bounded correction;
- 76 owners remain no-change;
- no new learner semantic delta exists;
- standing Repair Test debt contracts from 44 to 15;
- pseudo-Constructions are removed instead of creating fake semantic objects;
- family edges are re-anchored to the correct source/target senses;
- duplicate or misplaced Relation/Form truth is moved to its natural owner;
- stable sense lifecycle is preserved for `argument`, `arrange`, and `aspect`.

## Audit findings

Three local defects were found during candidate/FLOB/Test readback.

### 1. archeology spelling Form projection

**Verdict:** REFINE_UPGRADE  
**Severity:** LOCAL  
**Risk family:** form_projection

The spelling-variant Form initially populated `variants[]` using spelling records. The FLOB builder interprets `variants[]` as pronunciation variants, producing blank reading/IPA rows.

**Correction applied:** keep the preferred/accepted spelling distinction in `boundary` + `boundaries[]`, set pronunciation `variants=[]`.

**Readback:** PASS — FLOB now shows the spelling boundary with no blank IPA rows.

### 2. answer ↔ reply/respond Relation title

**Verdict:** REFINE_UPGRADE  
**Severity:** LOCAL  
**Risk family:** relation_projection

The retained broader Relation used `target_expression = "answer ↔ reply/respond"`, causing FLOB to render `answer ↔ answer ↔ reply/respond`.

**Correction applied:** normalize target expression to `reply/respond`.

**Readback:** PASS — FLOB title is now exactly `answer ↔ reply/respond`.

### 3. arrive Repair blueprint target

**Verdict:** REFINE_UPGRADE  
**Severity:** LOCAL  
**Risk family:** testability_targeting

The surviving blueprint diagnoses one combined decision model: physical `arrive at/in` plus abstract `arrive at a conclusion/decision/figure`. Its old target pointed only to one construction.

**Correction applied:** retarget the blueprint to `record.core_concept` so one diagnostic maps to the complete decision model it actually tests.

**Readback:** PASS.

## Key closure readback

Confirmed after correction:

- `annual`: weak family edge removed;
- `answer`: only the broader response-verb boundary survives;
- `antique`, `arch`, `assassinate`: pseudo-Constructions removed;
- `any`: polarity/free-choice decision model present;
- `anybody`: rare “important person” branch stays Reference, not Core;
- `apartment ↔ flat`: reciprocal regional-choice Relation present;
- `apparent`: real `it is apparent that` construction retained;
- `appeal`: request / attraction / appeal-to-evidence / legal-appeal branches separated;
- `appendix`: `appendicitis` removed as a false appendix collocation;
- `application / appreciate / approach / approve`: family anchors corrected;
- `argument`: literary-summary branch is reference-only with lineage preserved;
- `arouse`, `assassinate`: transitivity corrected;
- `arrange`, `aspect`: duplicate branch merges preserve lifecycle;
- `array`: `an array of ...` belongs to broad-range sense;
- `arrest`: Core distinguishes custody / stopping progress / capturing attention;
- `arrive`: abstract-result phrase is not stored under physical-place usage;
- `ascend`: throne usage is not duplicated under physical-climb branch;
- `archeology`: spelling distinction is Form truth, not Relation truth.

## Repair Test closure

Final standing set: **15**.

`antenna, anxious, any, anything, anyway, appeal, apply, appropriate, approve, approximate, arise, arrive, articulate, ask, asleep`

This 44 → 15 contraction preserves exact diagnostic targets and removes generic/duplicative standing Test debt.

## Drift closure

Between BF01 merge base `d138873b4b38e3b70eba4d3a7c3460bc8b076fed` and current main `7684b411a64ebcc4ece7eb93299f5456261ce6b6`, no `content/lexical/**` file changed.

No candidate semantic refreeze is required.

## Final result

```text
LOCAL findings: 3
MATERIAL findings: 0
IDENTITY findings: 0
BLOCKED: 0
new Human semantic delta: 0
broad semantic reopen: NO
Final Learner closure: 7,946 / 125 shards
Repair Test closure: 15
```

**Final batch result: PASS_WITH_CORRECTIONS**

All three corrections are already materialized and read back. No unresolved semantic or identity issue remains. This batch is eligible for bounded reconciliation and merge, but is not eligible as strongest blind-auditor independence evidence because `BLIND_FIRST_NOT_ENFORCED`.
