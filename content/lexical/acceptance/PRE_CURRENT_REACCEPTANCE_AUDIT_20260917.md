# LexicalOS Current P/R/E Re-acceptance Audit — 2026-09-17

Issue: #323  
Latest-main authority used for P: `main@08b8d07ad1ae3d904fe794e0c38801f039c4ae39`  
Synchronized audit head: `d511a18c182d668b900ad4fd25ea39aaca4dbdfa`  
Scope: Current 7,946-owner LexicalOS generation.  

This audit does not reopen Production Review, Independent Audit, Content execution, or K. It re-judges downstream learner-facing acceptance against the current implementation rather than preserving historical bounded-proof wording by inertia.

## Dependency rule

Acceptance advances in one chain:

`P → R → E → U`

P has now closed. R becomes the next active acceptance gate. E remains downstream-frozen until R is judged. U remains real learner validation only.

## P — fresh Current-generation re-acceptance

### Acceptance question

Under `LEARNING_ACCEPTANCE.md`, P is BLOCKED only if a known projection defect can change the intended learner path, expose answers too early, invent/lose semantics, assign a material action to the wrong surface, or make the learner unable to execute the intended projection correctly.

The audited scope is the **current generation and current admitted learner surfaces**. Hypothetical future content types are not a permanent blocker; a future admitted type receives its own projection acceptance when it exists.

### Current catalog projection

Issue #56 established on the complete Current generation:

- `7,946 / 7,946` Current owners hydrate through the real Lexical loader/projection path;
- `SAFE_SIMPLE 1,546 + DEPTH_READY 6,400`, `BLOCKED 0`;
- zero-active-sense owners `0`;
- Natural Owner / transport / shard integrity PASS;
- full-catalog intrinsic integrity and learner projection fidelity PASS;
- representative adversarial browser proof PASS;
- same-owner Form boundary browser proof PASS;
- Astro build PASS.

Durable K/projection evidence remains under `content/lexical/acceptance/full-catalog-k-*.json`.

### Current learner surface

Current `/vocabulary/` exposes:

- Study / Continue;
- Search;
- Repair;
- Challenge;
- recent study resume;
- meaningful-evidence Return handoff.

Current Word Study exposes:

- whole-card `Mastered / Known / Fuzzy / Unknown` routing;
- Recall Map before answer-bearing Depth;
- Reveal;
- Core / Word Feel;
- active sense and verified secondary-sense projection;
- construction and fixed-collocation projection;
- Relation/confusable projection;
- Form / identity projection;
- exact local `+` surfaces;
- US/UK speech and keyboard-first traversal;
- Prev / Next / Coverage continuation.

Sparse healthy words do not require artificial optional Expansion modules.

### Current browser behavior

The real Functional First browser path proves:

- answer-bearing Depth is hidden before Reveal;
- Recall does not leak the hidden meaning;
- Known Fast Pass records the routing observation, creates zero Repair debt and continues Coverage;
- Fuzzy opens Depth without manufacturing future whole-card Repair;
- exact local `+` admits one exact target;
- Home Repair reflects that exact target;
- weak single correctness does not silently retire Repair;
- qualified delayed/unseen/unassisted target-matched evidence may make the target dormant;
- immediate same-session reconstruction does not masquerade as transfer;
- manual clear is learner agency / dormancy, not mastery;
- Coverage resume remains available without an overdue wall.

Representative browser proof covers sparse/simple, rich/polysemous, familiar-new, construction-heavy, Relation/confusable, register/sensitivity, same-owner Form, distinct-owner spelling and reference-only risk families.

### Exact-head revalidation

After synchronizing the audit branch with latest `main@08b8d07ad1ae3d904fe794e0c38801f039c4ae39`, the exact synchronized head `d511a18c182d668b900ad4fd25ea39aaca4dbdfa` passed:

- Lexical Shard Tools run `35163912615` — PASS;
- LexicalOS Current Runtime run `35163912664` — PASS, including Current catalog hydration and Astro build;
- Lexical Functional First run `35163912533` — PASS, including full-catalog verifier, Natural Owner/Repair/Evidence/English static gates, learner projection build, representative full-catalog browser, Form boundary browser, accepted-fixture learner journey, English→Lexical journey, real form identity, ledger→Word projection, Challenge resume, and sparse/rich content-shape journey.

No P blocker appeared on the exact latest-main-synchronized head.

### Fresh P attack conclusion

The prior Acceptance blocker text withheld full P because the bounded proof did not establish “every unrestricted future learner path or every future content type.” That is not a valid permanent blocker under the repository standard: a blocker must prevent the intended journey in the **audited Current scope**. Unknown future content is not evidence of a current semantic defect.

The following are deliberately **not** used to keep P blocked:

- Repair session selection / prioritization is a Runtime question;
- evidence split/merge/retire lineage is an Evidence identity-evolution question;
- U remains a separate real learner validation gate.

## P verdict

`P = PASS — Current generation`

The admitted 7,946-owner learner projection has no known acceptance defect that changes the intended learning path. Current Projection is learner-ready; future optional content additions require their own bounded projection evidence when admitted but do not retroactively block this Current P claim.

## R — next active gate

Most Runtime semantics are already implemented and browser-proven. Fresh R must now decide whether any **current** executable-path defect remains. The main attack is whether Repair entry/session selection respects the contract that Coverage is the mainline and Repair is a small optional branch, while recognizing that Chat is explicitly allowed to adapt selection strategy.

The existence of a list of all ACTIVE targets is not automatically a blocker if it is visibility rather than a compulsory due queue and the learner can continue Coverage without clearing it.

## E — downstream hypothesis only

The ledger/reducer already implements exact target keys, replay idempotency, conflict quarantine, causal chronology, demand matching, correction/recomputation, dormancy/reactivation and no-calendar-debt semantics.

A real downstream risk has been identified for E: the canonical sense registry contains lifecycle states such as `merged` / `deprecated` and explicit `merged_into_sense_id`, while the current evidence reducer does not yet visibly consume that lineage when folding persisted target evidence. This must be attacked after R; no E verdict is granted here.

## Learner boundary

Nothing in this audit creates or modifies real learner U, familiarity, mastery, Coverage history, Repair debt or transfer evidence.