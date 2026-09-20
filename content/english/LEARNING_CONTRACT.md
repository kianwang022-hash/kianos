# English Learning Contract

Status: **CURRENT**  
Role: highest learner-facing Rule / Model for the **English** product

English is a learner-facing top-level product. Vocabulary / Lexical and External Reading are English child functions in the learner product tree.

LexicalOS may still keep independent backend canonical ownership and engineering continuation because lexical truth is large and specialized. That backend independence does **not** make Lexical a separate learner-facing subject beside English.

---

## 0｜Purpose

English I target: **80–85+**.

Score channels:

```text
Objective = 60
  Cloze = 10
  Reading A = 40
  Part B = 10

Translation = 10
Writing = 30
```

English optimizes:

```text
expected exam points gained / protected
+ reduced execution variance / latency
---------------------------------------
learner time
+ future review debt
+ fresh-material opportunity cost
+ switching / interaction friction
```

Therefore English is optimized for **future performance on new material**, not framework completion, explanation volume, review completion, or the number of stored evidence objects.

---

## 1｜K — what counts as good English knowledge

English Knowledge is not a teacher-summary archive and not a collection of page notes.

AI should reconstruct source/task evidence into **transferable capability assets** that remain useful on unseen material.

Good English Knowledge should:

- describe the real decision the learner must make;
- preserve the proposition / relation structure needed for that decision;
- distinguish reusable rules from one-off explanation;
- preserve task-specific cognition where Reading A / Cloze / Part B / Translation / Writing genuinely differ;
- route word-local sense / phrase / construction / collocation / confusable truth to Lexical rather than duplicating it;
- keep validated deep material available as repair/reference without making it compulsory first learning;
- avoid turning teacher chapter order, question taxonomy, runtime states, or current UI into the knowledge model.

Hard rule:

> **Minimize learner burden, not knowledge truth.**

A learner-facing path may hide, defer or collapse valid content when it is low-value for the current action. The valid semantics must remain correctly owned somewhere explicit.

A good English asset should still make sense if the current webpage disappeared.

---

## 2｜English capability architecture

English has three learner-facing score channels:

1. **Objective 60** — Cloze / Reading A / Part B;
2. **Translation 10**;
3. **Writing 30**.

`Objective` is a scoring/runtime family, not a semantic parent that erases task differences.

### Shared Objective decision kernel

```text
represent the relevant input
→ identify the current demand
→ form the real candidate space
→ test candidates against decisive evidence / constraints
→ adjudicate
→ execute and leave
```

Task specialization:

- **Cloze** — slot demand + lexical / syntactic / discourse constraints → best fit;
- **Reading A** — question demand + decisive passage evidence + option propositions → adjudication;
- **Part B** — discourse skeleton + required role + candidate role + global reconciliation.

The kernel is a composition aid, not a compulsory learner checklist.

---

## 3｜Shared Representation primitive

English has one genuine cross-task primitive:

> **Representation = recover the proposition / relation structure needed for the current task.**

Useful sub-primitives include, when relevant:

- clause / proposition hierarchy;
- attachment;
- reference;
- negation / quantifier / modality / degree scope;
- logical relation;
- paragraph / discourse relation and progression.

Representation is not a separate permanent course or mandatory page. It becomes visible when a real task failure shows that the input model is unstable.

Lexical sense / phrase / construction / collocation / confusable failures remain owned by Lexical.

---

## 4｜Learning phases

### A. Calibration / targeted first learning

Use synthetic or already-exposed material to discover which frameworks are actually needed.

First-learning assets are **complete-but-skippable repair reservoirs**, not a checklist that every proficient learner must finish.

### B. Performance building

Clean tasks dominate learner time.

Stable performance exits quickly. Evidence capture stays small and automatic where possible.

### C. Consolidation / recurring-failure repair

Spend extra learner time only where evidence supports a reusable, recurring, expensive, or still-unstable failure.

### D. Whole-paper execution / mock

Later preparation must train the full 180-minute paper: task order, pacing, switching, fatigue, completion, answer-sheet/delivery risk, and time-allocation tradeoffs.

This is a later phase, not a second permanent course.

---

## 5｜Default learner loop

```text
Perform cleanly
→ Fast triage
→ stable: EXIT
→ cheap one-off correction: understand and leave
→ meaningful recurring / ambiguous / high-cost failure: smallest useful repair
→ return to performance
```

A later fresh validation target exists only when it could realistically change future study allocation or confidence in a reusable behavior.

Pending backend state must not summon a learner task by itself.

---

## 6｜Wrong / Uncertain are signals, not automatic debt

`Wrong`, `Unanswered`, and `Uncertain` preserve evidence. They do not automatically determine review depth.

- wrong / unanswered usually deserves at least quick triage;
- uncertain-correct may fast-pass after a cheap confirmation;
- repeated or expensive uncertainty deserves deeper repair;
- stable correct / confident work should not expand.

Do not convert every fragile-correct item into a full review session.

---

## 7｜Attempt unit, diagnostic context and repair scope are different

For Objective tasks, keep the clean attempt unit whole:

- Cloze: complete passage/set;
- Reading A: complete passage + its questions;
- Part B: complete material/set.

When deep Chat review is justified, the complete passage/set is the diagnostic context envelope.

After diagnosis, repair may be local, coupled, shared, or structure-level.

Prefer the smallest set of independent failures that explains meaningful score loss:

```text
many dependent errors
→ one upstream repair

but

two genuinely independent high-value failures
→ two repairs
```

---

## 8｜Evidence and transfer

Evidence strength generally rises as memory residue falls:

```text
same-item correction
< later clean success
< fresh task success on the same demand
< repeated stable performance under normal time pressure
```

`correct once ≠ mastery`, but `not mastery` does not mean `must schedule another test`.

A transfer target is justified only when future evidence could change a real learner decision.

Clean later work may remain silent and need not be turned into closure ceremony.

### Bounded Performance Profile

English may derive a **bounded task-local performance profile** from private attempt history so Chat can reason over speed / exposure / assistance / repeated task evidence without shipping the entire raw history on every Daily Packet.

This profile is telemetry, not a second learner ledger.

Hard rules:

- raw attempt history remains the private learner truth;
- the packet may include only a bounded recent exact-attempt window per task plus fixed-size derived counts;
- Reading A / Cloze / Part B / Translation / Writing / External Reading remain separate task families;
- raw elapsed time is never compared across different task types as if seconds meant the same thing;
- uncalibrated timing is UNKNOWN, not slow;
- exposed or assisted work cannot be promoted to independent-transfer evidence merely because it was correct;
- `independent_transfer_candidate` means evidence eligibility only, never mastery;
- Translation / Writing do not receive fake auto-scores;
- External Reading remains growth evidence, not English-I score evidence;
- the profile cannot create Review debt, choose the next task, or rank tasks by itself.

The purpose is operational compression:

```text
private raw history
→ bounded task-local telemetry
→ Chat interpretation under this Learning Contract
```

not a hidden scheduler or mastery engine.

---

## 9｜Reading / Cloze / Part B interaction boundary

Objective tasks remain **clean whole-unit attempts**.

The learner should normally see the full task material needed to make the real exam decision.

Formal answers remain protected before Submit.

After Submit:

- stable correct work stays quiet;
- Wrong / meaningful Uncertain may reveal bounded explanation / repair;
- whole-unit context remains available when errors may be coupled;
- optional Chat escalation is secondary, not mandatory.

Reading A exam material and External Reading use the same Reading task family when their interaction semantics are the same. Different data sources do not justify duplicate reader/runtime implementations.

---

## 10｜Translation

Minimal model:

```text
Represent the English meaning / relations
→ Reconstruct the same meaning in natural Chinese
→ Deliver under exam constraints
```

Fidelity / preservation is a cross-cutting invariant, not a mandatory fourth stage.

Useful diagnostic dimensions include omitted / added / distorted information, attachment, reference, scope, relation, degree/modality, and Chinese reconstruction quality.

Preserve the first translation because it exposes process failure.

Stable calibrated work may PASS without full Chat review. Reference translations are optional post-attempt tools.

Same-item Reconstruction is repair evidence, not mastery.

---

## 11｜Writing

Writing has six genuine base primitives:

```text
1. Task / genre fulfillment
2. Content generation
3. Organization / development
4. English realization
5. Register + high-value error control
6. Timed delivery
```

Small Writing and Big Writing are task-mode specializations, not extra base primitives.

An integrated walkthrough is practice, not a primitive.

Writing feedback should choose the smallest set of high-value independent failures, weighted by score impact and reuse.

Do not repair cosmetic sophistication while more important task/content/control problems remain.

Direct mode remains valid; do not force a plan merely for system completeness.

---

## 12｜Teacher / framework material

Teacher material is a **knowledge source and repair reservoir**, not automatically the learner order.

Rules:

- extract validated transferable rules;
- reorganize by learner decision/capability when needed;
- do not preserve chapter order as learner order by default;
- do not create a second course merely because rich material exists;
- do not delete valid knowledge when the learner-facing path becomes shorter.

---

## 13｜Fresh material and External Reading

Unseen true-exam material remains limited diagnostic capital. Use synthetic / exposed material for teaching and software validation when sufficient, and consume protected true-exam material for real performance, calibration, or high-value transfer — not to close a database state.

**External Reading has a different primary job:** add high-quality reading volume after ordinary English-I papers stop providing enough growth stimulus.

Current preferred source order:

1. legacy TOEFL / TPO academic reading, especially the existing TPO 56–65 pool;
2. IELTS Academic reading, especially the existing IELTS 17–19 pool;
3. selected periodical reading only when it adds a useful topic/style range that the two exam-grade pools do not provide.

External Reading may share the Reading workspace geometry and low-friction evidence plumbing, but **source identity does not grant Reading-A cognition**.

```text
English-I Reading A
→ English-I question demand / evidence boundary / option adjudication

legacy TOEFL / TPO
→ reading-growth material
→ source-native TOEFL question semantics only when those questions are actually imported

IELTS Academic
→ reading-growth material
→ source-native IELTS question semantics only when those questions are actually imported

questionless article / passage-only import
→ read / comprehend / optionally note or Chat-repair
→ no invented questions
```

Therefore:

- do not teach TOEFL/IELTS question methods as if they were English-I Reading-A methods;
- do not reinterpret TOEFL/IELTS questions through the Reading-A Skill Map merely because the same visual workspace is reused;
- shared gains such as proposition representation, discourse tracking, reading speed, lexical access and long-passage stamina may transfer naturally across sources;
- future TOEFL preparation may build source-native TOEFL task semantics on top of the same imported TPO material without rewriting English-I Reading logic;
- Content may describe source/pool identity and intended use, but it must not claim Kian's actual exposure state. Real exposure remains private learner evidence shared across ordinary study, External Reading and mock wherever the material identity is the same.

---

## 14｜Interaction quality

A learner-facing action earns its place only if it materially improves at least one of:

- expected score;
- speed / reliability;
- repair quality;
- future transfer judgment;
- return speed from failure to real performance.

No mandatory ritual unless it earns its place.

Recall, Orientation, Closure, Handoff, Memory, Framework, Active Check, repair check and UI transitions are tools, not ceremonies.

---

## 15｜Resume

Resume means **highest-value unfinished learner action**, not the most recently opened page.

Priority normally favors:

1. unfinished clean attempt;
2. already-active meaningful repair;
3. naturally relevant high-value validation;
4. otherwise a new high-value performance task.

This priority is applied by **Chat over current learner evidence**. Website/Runtime may expose factual unfinished state and execute an explicit typed English Session Instruction, but must not encode its own cross-task score/ranking algorithm or infer the next English task when no Chat instruction exists.

Passed work and dormant pending claims must not drag the learner backward.

---

## 16｜Boundary with Lexical

Learner-facing product:

```text
English
└─ Vocabulary / Lexical
```

Semantic ownership remains distinct:

```text
Lexical owns lexical semantics and lexical repair.
English owns task performance and non-lexical Representation repair.
```

Typical route:

```text
English task lexical failure
→ exact sense / phrase / construction / relation
→ smallest Lexical repair
→ return to originating English task
```

Reading / Cloze / Translation / Writing must not create duplicate local vocabulary systems.

---

## 17｜Acceptance boundary

Structural presence is not learner success.

```text
STRUCTURAL ≠ EXECUTED ≠ ADVERSARIAL ≠ REAL learner evidence
```

A validator may protect invariants, but it must not define a decomposition as correct merely because it can count exact Blocks, pages, strings, or runtime states.

When a simpler implementation preserves knowledge truth and the same learning value with lower learner burden, the simpler implementation wins.


## 18｜Fresh final-audit operational clarifications

These clarify existing Learning Logic; they do not add a prerequisite course.

- **Entry:** task-first assumes the minimum ability to start that specific task, not proficiency in another task. When unknown, use a bounded synthetic/exposed attempt or the precise First Learning node. Writing Small and Big must not borrow readiness from reading ability. Reading a Guide is not evidence of independent performance. Already-established ability needs no compulsory synthetic completion.
- **Stable exit:** correct/acceptable work may leave cheaply. This is an exit decision, not mastery. Known answer memory, assistance, missing requirements or failure of an explicitly agreed time budget disqualify a stable-transfer claim. No task budget means timing is uncalibrated, not that the website may invent a deadline or repair debt. Do not require explanations from every correct answer.
- **Timed uncertainty:** a repair search order is not permission to spend unlimited exam time. At the exam boundary preserve the best available answer/output and unresolved uncertainty; no learning workflow may prevent timely delivery.
- **Exposure:** Content defaults describe a pool/object policy, not Kian's exposure history. Missing private records mean unknown. A learner statement may establish unseen status before a clean attempt; it cannot erase recorded exposure. Ordinary study and mock have separate answer states but one material identity/exposure truth. Merely using another page, device or session does not make a material fresh again.
- **First evidence:** bind task identity, consumed Content revision, attempt identity, first output and any later repair. A Content update must not silently reinterpret an old attempt. Same-item reconstruction remains repair evidence.
- **Lexical:** exact target and exact demand both matter. Recognition must not close a Production claim. Lookup alone does not mutate Lexical learning state. A formal multi-target return validates fully before any task/lexical mutation; replay cannot manufacture a second event.
- **Chat:** the website may follow the already-explicit Chat task order, never rank other tasks. Potentially eligible evidence is not automatically semantically relevant to a pending target. Same task kind does not select a target for the learner.
- **External:** External Reading is a Reading-growth source adapter, not a second English-I Reading-A course. TPO 56–65 is the preferred academic-growth pool and IELTS 17–19 the secondary pool; periodicals are optional breadth. Adapters reuse the Reading workspace only where interaction semantics fit, preserve source-native question identity, use the same private exposure ledger, and never treat Content metadata as learner testimony. Unsupported question forms fail closed; questionless reading stays questionless.
