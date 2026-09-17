# LexicalOS Current Runtime Re-acceptance Audit — 2026-09-17

Issue: #323  
Base: `main@7ad396225891a413c686676dd5b1933612079268`  
Gate: R / Runtime  
Upstream: S/K/L/P PASS  

## Acceptance question

Under `LEARNING_ACCEPTANCE.md`, Runtime is BLOCKED only when the intended learner behavior cannot be executed correctly: for example PASS is absent, Repair exists only on paper, Chat return cannot be applied naturally, a cross-surface resume location is lost, or stable correct work is forced into manufactured review/debt.

The Current Lexical learning contract requires:

```text
Coverage mainline
→ learner-controlled Fast Pass or Depth
→ exact local + only when warranted
→ optional small Repair / Challenge branch
→ real-context evidence
→ fade/reactivate
→ Coverage remains available
```

No fixed due queue, overdue wall, mandatory review quota or all-Repair-before-Coverage rule is allowed. Astro executes low-friction actions; Chat may adapt selection/diagnosis; Kian retains final agency.

## Current executable Runtime

Current implementation already executes the material loop:

- Vocabulary Home defaults to Study / Continue and keeps Search, Repair and Challenge as separate optional modes;
- last Coverage ordinal is persisted and can be resumed;
- Word Study supports Mastered/Known Fast Pass, Fuzzy/Unknown Depth routing, Recall → Reveal, Prev/Next and keyboard traversal;
- exact local `+` creates target-level evidence rather than whole-card debt;
- shared evidence ledger/reducer is the Repair authority;
- Home Repair and Word Repair reflect the same derived ACTIVE targets;
- manual clear produces dormancy/agency rather than mastery;
- Challenge accepts a `kianos.lexical.challenge_packet.v1` whose challenge list is an explicit selected subset, not an automatic all-ACTIVE queue;
- Challenge wrong/correct/reconstruction paths update exact target evidence;
- Challenge packet/cursor/session evidence resumes after browser refresh;
- Return Packet exports meaningful evidence rather than requiring a daily empty ritual;
- exact English → Lexical handoff can activate a target and later qualified English evidence can dormancy the same target;
- unrelated targets are not cleared by another target's evidence;
- there are no canonical `due_at` / `next_due_at` fields and missed days create no debt.

Existing Functional First browser evidence already proves these behaviors on real Current pages rather than synthetic serializers.

## Primary attack — does “all ACTIVE in Repair tab” violate selective Repair?

`VocabularyHomeEvidenceBridge.astro` calls `compileRepairTargets(readLedger())` and renders every currently ACTIVE target, grouped by Word. At first glance this is broader than the Evidence contract phrase “select a small useful Repair subset”.

Fresh judgment: **this is not a Runtime blocker in the Current product**.

Reasons:

1. The Repair list is an optional visibility/inventory surface, not the default learner session. Home opens on Study/Continue.
2. Coverage can proceed without entering Repair and without clearing any ACTIVE target.
3. The UI contains no due/overdue semantics and no rule that Repair must be cleared before Coverage.
4. The actual Challenge execution surface consumes an explicit packet; Chat can select a small useful subset based on fresh evidence/capacity without changing the ledger or hiding the rest of the inventory.
5. `LEARNING_CONTRACT.md` explicitly assigns adaptive recurrence/selection strategy to Chat rather than demanding a fixed Astro scheduler.
6. Showing all ACTIVE evidence-backed targets remains useful for inspection and does not by itself change their evidence semantics.

Therefore the missing “recommended current Repair subset + reason” presentation is a **non-blocking Runtime/product debt**, not a failure of the intended executable learner journey.

## Other blocker attacks

### Forced review / debt

PASS. Known Fast Pass creates zero Repair debt; Fuzzy/Unknown Depth alone creates zero future Repair; missed days manufacture no queue.

### Exact target admission / clearing

PASS. Local `+`, manual clear, Challenge failure/success and English lexical evidence operate on exact target identities.

### Challenge execution

PASS. Import/start/answer/repair/reconstruction/continue/complete paths exist; interruption and reload resume exact packet index/question identity; session evidence survives.

### Return / cross-surface execution

PASS. Return events are exportable; English lexical return is replay-idempotent and updates the shared ledger; Home/Word projections react to the same ledger.

### Coverage preservation

PASS. Continue cursor is independent of Repair eligibility and there is no “clear Repair first” gate.

### Learner U

Not part of R acceptance. Browser/synthetic proof cannot replace real learner use; U remains UNTESTED.

## R verdict

`R = PASS_WITH_DEBT — Current generation`

No known Current Runtime defect prevents or semantically distorts the intended learner loop. The current product is ready to execute Coverage, selective local Repair, Challenge, return and resume correctly.

Named non-blocking debt:

> The Repair tab currently exposes the full ACTIVE inventory rather than a first-class “recommended small session subset + why now” view. This is optional product/UX improvement because Chat can already compile a bounded Challenge subset and Coverage is never blocked by the inventory.

This debt must not be converted into a calendar scheduler, fixed quota, overdue wall or mandatory Repair-clearing rule.

## Downstream

With R accepted, E becomes the next active gate. The concrete Current E attack is identity evolution: canonical sense lifecycle records already contain `active`, `deprecated`, `merged` and `merged_into_sense_id`; persisted evidence must resolve explicit valid lineage or fail closed rather than leaving stale evidence attached to an unrenderable/incorrect target.

## Learner boundary

This audit creates no real learner state and grants no U.