# LexicalOS Evidence / Memory Contract

Status: DESIGN SPECIFIED — implementation and E acceptance are not implied.  
Parent: `LEARNING_CONTRACT.md`. Scope: private lexical evidence, Repair lifecycle and session compilation.  
This file owns the previously unresolved detailed Evidence / Memory semantics. `ACCEPTANCE.md` alone owns readiness claims.

## 1. Three separate meanings of coverage

- **Content coverage**: an engineer has judged an exact Current Word + dependencies under `CONTENT_ASSET_CONTRACT.md`.
- **Learner traversal**: Kian has encountered/passed a word in private study history.
- **Transfer evidence**: an identifiable lexical object was actually understood, discriminated or produced in context.

These are different facts. Neither a content receipt nor a Coverage cursor proves mastery. A correct English answer does not prove every word in the passage was understood.

The whole Word is the learning container. A specific sense, construction, collocation, relation boundary, form distinction or Core distinction is the repair unit.

## 2. Record observations; derive demands on learner time

Private events store what happened, not a fake mastery percentage. A minimal event must be identifiable, attributable and interpretable:

- stable event identity and origin; occurrence time, not just import time;
- Word identity; exact target ID, or owner-local locator with an owner revision/fingerprint;
- event kind and outcome;
- relevant source task / Challenge identity and context identity;
- recognition / discrimination / production demand when it changes interpretation;
- assistance, answer exposure, same-session reconstruction and unseen-context status when relevant.

Do not collect every click. Keep coverage/checkpoint, meaningful card routing, local `+`, meaningful target-level performance, explicit clear/reactivate, and content/question defect signals. Depth opening is not evidence of learning or failure.

The v1 packet remains a compatibility transport. Missing identity, demand or context-quality fields limit the conclusions that can be drawn; they must not be silently fabricated during migration. A v1 `study_day` labels provenance, not a mandatory next-day schedule. Private event payloads never enter shared GitHub content.

## 3. Identity, deduplication and corrections

Import must be idempotent. Re-importing the same event cannot add debt or count as another success. A reused ID with different payload is an integrity conflict, not a new observation.

Use occurrence/causal order to fold events. A late import is not a fresh failure. Ambiguous ordering or unresolved target identity is quarantined for reconciliation and creates no automatic lexical debt. A v1 event without an ID may receive a deterministic import identity, but uncertainty about two genuinely distinct observations must remain visible.

Owner-local array positions without a revision are not durable target identities. If a sense is merged, split or retired, resolve an explicit Current lineage mapping; do not move evidence to a neighboring sense by spelling or index. Historical evidence remains historical. Unresolved remapping freezes that target's inference, not Coverage or the whole catalog.

When a previously scored item is discovered to be defective, exclude its scoring contribution and recompute the derived Repair state. Do not preserve a false learner failure merely because it arrived earlier.

## 4. Routing is not admission

`Unknown / Fuzzy / Known / Mastered` is a current whole-card Depth routing judgment. It does not create future whole-card testing obligations.

- Unknown → Depth → Next may leave **zero** Repair targets.
- Known → local `+` may activate only that local object.
- Content `SAFE_SIMPLE` / `DEPTH_READY` suggests available content; it cannot override Kian's choice.
- Manual reopening is always possible without prior debt.

## 5. Repair lifecycle

Derived eligibility is intentionally small:

| State | Meaning | Legitimate transitions |
| --- | --- | --- |
| NONE | No evidence-backed future Repair claim | exact `+` or qualified meaningful failure → ACTIVE |
| ACTIVE | This target currently merits consideration | sufficient target-matched evidence or explicit clear → DORMANT |
| DORMANT | History retained; no ordinary scheduled Repair | newer exact `+` or qualified counterevidence → ACTIVE |

DORMANT does not mean permanently mastered. Manual clear means learner agency, not demonstrated competence. Do not use elapsed calendar days to turn NONE/DORMANT into ACTIVE.

Diagnosis and unresolved identity/content defects are flags/actions, not a proliferating mastery-state machine. Repeated informative failure changes the diagnostic form: inspect sense boundary, construction, task attribution or question validity instead of multiplying identical repetitions.

## 6. Admission and evidence qualification

Admission normally requires an explicit local `+` or a valid target-specific lexical failure. Challenge failure counts only when the question is valid, the target is resolved and the observed failure actually bears on it.

One slow response, a whole-card Fuzzy feeling, an unexplained wrong Reading answer or a question defect is not automatic lexical debt. Repeated clear uncertainty/slowness may earn attention only with context and diagnostic attribution.

An English failure may be lexical, representational, strategic, or defective-source related. Unresolved attribution must not silently default to vocabulary. Return only the smallest resolved lexical target to LexicalOS; English retains task-level and non-lexical repair.

## 7. Retirement and reactivation

Compare evidence for the **same target and required demand**, with its quality and recency. Do not implement a universal ranking that lets any real-task success erase any artificial failure.

A clean, delayed, unassisted, informative contextual Challenge success may make a low-severity target dormant. Later unseen real-context success may remove an unnecessary planned artificial test. A severe/repeated problem may justify a further discriminating observation; this is a diagnostic decision, not a mandatory repetition count.

Immediate same-context reconstruction after seeing the answer proves repair execution at most; it does not prove delayed stability. Multiple clicks on the same item are not multiple independent transfer successes.

Reading recognition does not discharge a Writing production problem. Correct passage/set performance counts only where success on the particular lexical object is evidenced. Another sense of the same word cannot retire this target.

A later valid, target-matched failure can reactivate immediately. An older late-imported failure cannot pretend to be new. Explicit learner clear/reactivate events retain their proper causal position.

## 8. Session compilation

Compile from validated current evidence and current learner capacity, not from an accumulating calendar due list:

`resolve/deduplicate → reconcile corrections and newer evidence → derive target eligibility → diagnose repeated failure → select a small useful Repair subset → preserve Coverage continuation`

Coverage remains the long-run learner mainline. Repair is optional to enter now, skippable/deferable and never a prerequisite wall. Missed days create no punitive debt. No fixed daily word, review-item or review-minute quota belongs here. A delayed test needs separation from answer exposure, but not a permanent 0-1-3-7 schedule.

Astro executes low-friction actions and stores private evidence; Chat adapts selection and diagnostic strategy; Kian retains final agency. An empty day requires no empty Return Packet ceremony. The compiler returns reasons with selected targets so stale scheduling cannot outrank fresh evidence.

## 9. Design acceptance scenarios — not recorded learner outcomes

These are normative test oracles. Implementations must execute them in isolated synthetic state; writing this table is not E or U PASS.

| Scenario | Required outcome |
| --- | --- |
| Unknown, full Depth, Next, no `+`/failure | no Repair debt |
| Known, `+` on one construction | only that construction ACTIVE |
| Same packet imported twice | one observation; same derived state |
| Same event ID, conflicting payload | integrity quarantine; no second score |
| Delayed old failure imported after later clear/success | not treated as a new reactivation |
| Answer shown, immediate reconstruction correct | no claim of delayed transfer |
| Valid delayed target-matched contextual success | eligible for dormancy without ritual repeat count |
| Reading success, production-only weakness | production claim not automatically retired |
| Passage answer correct without target attribution | no blanket lexical success |
| Another sense of same word succeeds | this target unchanged |
| Question later found defective | its failure contribution withdrawn; state recomputed |
| Stable-ID split/merge without clear mapping | local identity reconciliation; no guessed transfer |
| Miss several days | no manufactured overdue pile; Coverage resumes |
| Repeated valid failure | change diagnosis/test form, not just frequency |
| Manual clear | DORMANT by agency; no mastery claim |
| Fresh real-context target failure after dormancy | precise reactivation; other senses unchanged |

## 10. Functional First proof boundary

P must prove faithful Fast Pass / Depth / Recall / Reveal / local `+` projection on an explicitly accepted bounded fixture. R must prove transitions, private persistence, resume and return paths. E must separately prove event fidelity, idempotency, attribution, lifecycle and recomputation against the scenarios above. R PASS cannot manufacture E PASS. Real learner U remains separate and must not be demanded as an engineering test before Kian has studied.

A bounded Functional First slice does not require pretending the whole 7,946-word catalog is accepted. Conversely, its success cannot grant unrestricted full-catalog readiness. Stop expanding UI/architecture once the scoped real learning loop is usable; later styling must preserve these semantics.
