# English Post-Optimization Fresh Re-acceptance Audit — 2026-09-14

Status: **AUDIT COMPLETE / RECONCILIATION REQUIRED**  
Scope: **English K/L learner-facing semantic audit only** — Objective / Translation / Writing  
Base: `main@8d2b8d12a7a912f6ca6dd038608f6c6ef1a4d362`  
Authority: `AGENTS.md` → `content/english/CURRENT.md` → `content/english/LEARNING_CONTRACT.md` → scoped Current / Acceptance → current canonical learning owners.

This receipt is **audit evidence, not Acceptance Truth**. It does not mutate learner state, Source, Runtime, Evidence, Projection implementation, or existing scoped `ACCEPTANCE.md` ledgers. Old PASS labels and validators were treated as prior claims rather than answer keys.

## Why this audit exists

The Functional First fresh re-acceptance closed before later content-optimization merges changed the current learner-facing first-learning artifacts:

- Writing optimization landed via PR #74;
- Translation optimization landed via PR #77;
- Objective optimization landed via PR #79.

Therefore the current optimized artifacts required direct readback against the current English Learning Contract rather than inheriting the earlier K/L PASS automatically.

## Audit method

For each module:

1. read the current scoped Work Cursor and Acceptance owner;
2. read the actual current learner-facing learning artifact(s), not only summaries;
3. attack completeness and unnecessary learner burden simultaneously;
4. verify parent/child semantic ownership and LexicalOS boundary;
5. check whether old/deep reference material can contradict the current learner path;
6. inspect the actual learner projection where needed to distinguish projected defects from non-projected reference metadata;
7. assign the earliest responsible layer without manufacturing downstream reopenings.

No protected unseen exam material was consumed.

---

# 1. Objective — Reading A / Cloze / Reading B

## Current objects read

- `content/english/modules/objective-learning.md`
- `content/english/modules/reading-a.md`
- `content/english/modules/cloze.md`
- `content/english/modules/reading-b.md`
- `content/english/modules/objective/CURRENT.md`
- `content/english/modules/objective/ACCEPTANCE.md`
- parent `content/english/LEARNING_CONTRACT.md`

## Fresh verdict

**K = PASS**  
**L = PASS**

The later Objective optimization does not invalidate the accepted semantic model.

### What survived attack

- Reading A remains **evidence-based option adjudication**, not generic reading comprehension.
- Cloze remains **best-fit selection under slot constraints**, not twenty isolated vocabulary questions.
- Reading B / Part B remains **discourse reconstruction + global reconciliation**, not Reading A with another layout.
- The shared Objective kernel is a composition aid rather than a compulsory learner checklist.
- Shared English Representation is visible only when task performance exposes a need; it does not become a second mandatory course.
- Lexical sense / phrase / construction / collocation / confusable truth still routes to LexicalOS.
- Whole passage/set clean attempt remains distinct from diagnostic context and repair scope.
- Stable correct work can exit quickly; Wrong / Uncertain remain signals rather than automatic debt.
- All four real Part B forms are represented explicitly without flattening their target demands.
- The current first-learning asset is complete enough to establish the decision models while remaining skippable for already-stable learners.

### Negative-space checks

No current semantic gap was found that requires:

- restoring a question-type curriculum;
- making Skill Maps mandatory;
- forcing per-question deep review;
- merging the three Objective tasks into one generic method;
- creating a duplicate lexical knowledge owner;
- reopening Runtime or Evidence merely because content was optimized.

**Objective post-optimization reconciliation result: PASS.**

---

# 2. Translation

## Current objects read

- `content/english/modules/translation/learning.md`
- `content/english/modules/translation/learning.reference.md`
- `content/english/modules/translation/CURRENT.md`
- `content/english/modules/translation/ACCEPTANCE.md`
- actual learner projection `static-web/src/pages/translation-learn.astro`
- parent `content/english/LEARNING_CONTRACT.md`

## Fresh verdict

**K = PASS**  
**L = REPAIR_REQUIRED (bounded learner-facing example defect)**

The three-part productive model remains correct:

`REPRESENT → RECONSTRUCT faithfully → DELIVER`

Fidelity remains correctly owned as a cross-cutting invariant rather than a fourth mandatory course. The defect is narrower than the model itself.

## T1 — learner-facing Fidelity example is slightly self-contradictory

**Severity:** MATERIAL-LOCAL  
**Responsible owner:** `content/english/modules/translation/learning.md`  
**Earliest layer:** Learning content / example realization

The Integrated Walkthrough uses the synthetic sentence:

> `The growing reliance on systems designed to simplify decisions may create new problems when users assume that these systems are always reliable.`

The proposed Chinese reconstruction introduces two avoidable shifts while the same asset teaches strict meaning preservation:

1. `The growing reliance ...` becomes `人们越来越依赖...`, supplying an explicit generic human agent that the source noun phrase does not itself specify.
2. `when users assume...` becomes `如果使用者...`, shifting an occurrence/context relation toward an explicit conditional.

Neither destroys the overall example, but this is exactly the kind of boundary the Fidelity section tells the learner not to blur. A first-learning exemplar should be cleaner than the rule it illustrates.

### Bounded target

Keep the same synthetic sentence and teaching point, but use a reconstruction that does not add an unsupported actor and does not unnecessarily strengthen `when` into `if`, e.g. a Chinese rendering equivalent to:

`对那些旨在简化决策的系统的依赖日益加深；当使用者想当然地认为这些系统始终可靠时，这种依赖可能带来新的问题。`

Wording need not be identical to this target; the semantic constraint is the authority.

## T2 — stale deep-reference self-description conflicts with Current route

**Severity:** LOCAL / NON-PROJECTED REFERENCE METADATA  
**Responsible owner:** `content/english/modules/translation/learning.reference.md`

The preserved deep reservoir still labels itself:

- `Current learner-facing 能力资产`;
- first learning as four peer Core Learning Blocks.

Current Translation authority now says three productive cores with Fidelity as a cross-cutting invariant. This is stale self-description inside the preserved old asset.

### Projection check

`static-web/src/pages/translation-learn.astro` reads only current `translation/learning.md`; it does **not** render `learning.reference.md`. Therefore this stale header is not presently contaminating the normal learner surface and does **not** independently reopen Projection.

### Bounded target

Reconcile reference metadata/status without re-promoting the old four-block route. Preserve the valid deep body as a repair/reference reservoir.

**Translation audit result: HOLD FOR BOUNDED L REPAIR + reference-status reconciliation.**

---

# 3. Writing

## Current objects read

- `content/english/modules/writing/learning.md`
- `content/english/modules/writing/learning.reference.md`
- `content/english/modules/writing/CURRENT.md`
- `content/english/modules/writing/ACCEPTANCE.md`
- actual learner projection `static-web/src/pages/writing-learn.astro`
- parent `content/english/LEARNING_CONTRACT.md`

## Fresh verdict

**K = PASS**  
**L = PASS on the current learner-facing path**  
**Reference metadata reconciliation recommended**

### What survived attack

The optimized main asset preserves exactly six genuine base primitives:

1. Task / genre fulfillment;
2. Content generation;
3. Organization / development;
4. English realization;
5. Register + high-value error control;
6. Timed delivery.

Small / Big Writing remain task-mode specializations rather than extra primitives. Synthetic practice remains practice rather than a seventh/eighth ability. The content correctly separates “no content yet” from “content exists but English realization fails,” uses information gain rather than paragraph-count ritual, and keeps whole-essay generation as the formal learner unit.

The learner route is targeted/skippable and explicitly returns to real Writing rather than requiring framework completion.

## W1 — stale deep-reference learning-order language

**Severity:** LOCAL / NON-PROJECTED REFERENCE METADATA  
**Responsible owner:** `content/english/modules/writing/learning.reference.md`

The old reservoir still calls itself `Current learner-facing` and says first learning should build the whole map then continuously learn Core Learning Blocks before entering valuable true-exam work. Current Writing authority instead makes First Learning targeted/skippable and grounds true-exam entry in actual productive Runtime evidence, not guide completion.

### Projection check

`static-web/src/pages/writing-learn.astro` consumes the current Writing learning projection derived from `learning.md`; the old `learning.reference.md` header is not the normal First Learning surface. Therefore this conflict is not currently sufficient to reopen Writing L/P.

### Bounded target

Reconcile the preserved reference asset's status/entry instructions so it cannot masquerade as the current mandatory learner route while retaining valid deep semantics.

**Writing post-optimization learner-facing result: PASS, with bounded reference-metadata debt.**

---

# 4. Cross-module conclusion

```text
Objective
K PASS
L PASS

Translation
K PASS
L REPAIR_REQUIRED — one learner-facing Fidelity example
+ one non-projected stale reference metadata conflict

Writing
K PASS
L PASS on current learner-facing path
+ one non-projected stale reference metadata conflict
```

No finding justifies reopening English Source, Runtime, Evidence, learner state, or protected-material boundaries.

The correct next step is **bounded reconciliation only**:

1. repair Translation Integrated Walkthrough fidelity;
2. reconcile Translation reference status/header without restoring the four-stage learner route;
3. reconcile Writing reference status/header without restoring mandatory framework completion;
4. reread the three exact surfaces;
5. then reconcile scoped Acceptance Truth.

Do not expand this into a new English architecture redesign. Do not infer `U` from this audit.