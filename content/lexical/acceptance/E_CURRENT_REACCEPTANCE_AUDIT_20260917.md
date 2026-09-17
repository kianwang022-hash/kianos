# LexicalOS Current Evidence Re-acceptance Audit — 2026-09-17

Issue: #323  
Base: `main@9ceedc2eece273b91fd2034b5cbf9d918941f7bf`  
Gate: E / Evidence  
Upstream: S/K/L/P PASS; R PASS_WITH_DEBT  

## Fresh blocker found

The previous Evidence implementation was already strong on event identity, replay idempotency, conflict quarantine, causal chronology, attribution, demand matching, correction/recomputation, dormancy/reactivation and no-calendar-debt semantics.

Fresh Current attack found one real blocker instead of preserving the historical bounded label by inertia:

> persisted learner evidence could still reference a stable sense ID that Current Content had explicitly merged or deprecated, while the reducer folded evidence only by the historical event target ID.

That could produce two invalid outcomes:

1. explicit Current merge lineage was ignored, losing evidence that should affect the successor target;
2. deprecated/no-successor evidence could remain ACTIVE even though no Current learner surface could render or repair that target, creating invisible/orphan debt.

## Real Current fixture

`abnormal@7` already contains the required lifecycle truth in its Current Word owner:

- `sense:abnormal:3271d9f4317951c3` — `merged`;
- explicit successor `sense:abnormal:98807d28524a5607` — Current active sense;
- `sense:abnormal:eb663cac3ad15b02` — `deprecated`, no successor.

Authority is the existing Word owner `identity_refs.senses`; no parallel identity database or semantic owner was invented.

## Repair

### Current lineage projection

`static-web/src/lib/lexical.mjs` now projects compact non-active sense lineage from each Current Word owner into:

- individual Word answers;
- Vocabulary Home summaries.

The semantic owner remains the Current Word artifact. The runtime projection only carries identity lifecycle metadata required to interpret private learner evidence.

### Evidence ledger behavior

`static-web/src/lib/lexicalEvidence.mjs` now preserves an `identity_lineage` projection alongside learner events.

Rules:

- historical learner events are never rewritten;
- explicit `merged → successor` lineage remaps derived Repair state onto the Current successor target;
- deprecated/no-successor lineage is `FROZEN` and creates no actionable Repair debt;
- conflicting lineage fails closed to `FROZEN`;
- cyclic lineage fails closed;
- correction matching may cross an explicit Current merge because both historical/current target IDs resolve to the same Current target;
- event replay/idempotency semantics remain unchanged.

This is identity projection, not learner evidence and not a mastery state.

### Browser registration

- Vocabulary Home reconciles persisted ledger identity against all Current summary lineage before compiling Repair.
- Direct Word entry registers that Word's Current lineage synchronously before `VocabularyWordRuntime` reads the ledger.

Therefore a user does not need to visit Home first for old evidence to reconcile safely.

## Durable tests

### Reducer / Current-owner gate

`static-web/scripts/validate-lexical-evidence-identity-lineage.mjs` uses the real `abnormal@7` Current owner and proves:

- explicit merge projects old evidence to the exact successor;
- historical event payload remains old/historical;
- reconciliation is idempotent and manufactures zero learner observations;
- successor evidence and merged historical evidence fold into one causal state;
- deprecated/no-successor evidence freezes and creates zero active Repair targets;
- another Natural Owner cannot be remapped by this lineage;
- conflicting lineage freezes rather than guesses;
- question correction can cross an explicit merge;
- Return transport does not rewrite event history.

Result on PR #327 head `9c12c5e8d57410dca5e373640448cbe248c827d9`: **PASS**.

### Real browser gate

`static-web/scripts/test-lexical-functional-first-identity-lineage-browser.mjs` seeds real persisted old evidence, enters `/vocabulary/7/` directly and proves:

- Current merge lineage is registered before Word Repair projection;
- old merged evidence restores the Current successor's `+` state;
- deprecated evidence is frozen and absent from actionable Repair;
- neither old target is rendered as a learner action;
- Word summary counts only the one Current successor;
- Home Repair shows the same one Current target and no invisible deprecated debt;
- clearing the Current successor removes actionable Repair while preserving historical old events;
- Home then reports no evidence-backed Repair.

Result on PR #327 head `9c12c5e8d57410dca5e373640448cbe248c827d9`: **PASS**.

### Full regression

On the same exact head:

- LexicalOS Current Runtime run `35165384491` — PASS, including Current catalog hydration and Astro build;
- Lexical Functional First run `35165384498` — PASS;
- the new static identity-lineage gate — PASS;
- the new real-browser identity-lineage journey — PASS;
- all pre-existing full-catalog, Form, accepted-fixture, English handoff, ledger projection, Challenge resume and sparse/rich browser gates — PASS.

## Fresh E verdict

`E = PASS — Current generation`

No known Current evidence defect now loses, misattributes, guesses or invisibly preserves learner evidence across the audited identity lifecycle. Explicit merge follows explicit Current authority; absent/ambiguous successor fails closed without debt; history remains history.

This acceptance covers the Current admitted evidence model and Current identity lifecycle. Future new lifecycle shapes require bounded evidence when introduced; hypothetical future shapes are not a reason to keep Current E blocked.

## U boundary

E PASS does not establish learner mastery, transfer or product usefulness under real study. `U` remains **UNTESTED** until Kian actually uses the learner flow and supplies private learner evidence.
