# KianOS Learning Acceptance Standard

This document defines the repository-wide acceptance standard for KianOS learning lanes and independently entered learner-facing sub-lanes.

It answers one question:

> **When may we truthfully say that a module is ready for the learner, and when has real learner use actually validated it?**

This is not a UI checklist and not an engineering-completion checklist. A content file existing, a page rendering, a build passing, a source inventory being complete, or a simulated journey succeeding may all be useful evidence, but none of them alone proves a learning system is closed.

The governing causal direction is:

```text
Source Truth
→ Knowledge Audit
→ Learning-Path Audit
→ Learner Calibration
→ Content Reconstruction / Optimization
→ Content Closure Audit
→ Learning UX / Projection Design
→ Runtime Implementation
→ Module E2E Acceptance
→ Learner Acceptance
→ Evidence-based Revision
```

This is a **causal direction, not a repository-wide one-way waterfall**. Within one audited scope, Projection or Runtime may expose a real Knowledge/Learning defect and send that dependency chain back upstream. What must not happen is using downstream engineering progress to pretend an upstream learning question was settled.

Independent scopes may be audited and advanced concurrently at any justified hierarchy depth. A blocked gate in one Politics subject, Xizong System, English module, or other independent scope does not freeze unrelated siblings merely because they share a parent.

After core modules are individually ready, KianOS enters a separate final layer:

```text
Module Acceptance
→ Global / Home Integration
→ Home E2E Acceptance
→ Learner whole-system use
```

Home is therefore a final integration/routing layer, not a place to compensate for unfinished domain learning models.

---

# 1｜Two acceptance layers

## 1.1 Module Acceptance

Every first-class subject lane or independently entered learner sub-lane must be accepted on its own cognition and learning path before Home may treat it as learner-ready.

Examples include:

- Xizong systems such as A1 Circulation or A2 Respiratory when independently entered;
- English Lexical, Reading, Cloze, Reading B, Translation, Writing;
- Politics learning/runtime lanes;
- future first-class learning modules.

A domain-level page or global Home satisfying a capability does **not** automatically make every child module ready.

Module acceptance is local. Independently continued children under the same parent may each own a different current active gate and may progress concurrently when no real dependency links them.

## 1.2 Global / Home Acceptance

Once core modules are mature enough, KianOS must pass a separate system-level acceptance focused on:

- navigation;
- private learner state;
- Continue;
- pending/repair/review routing;
- cross-module handoff;
- fresh/holdout protection;
- Chat bridges;
- integration QA;
- realistic whole-day learner journeys.

Home must integrate mature modules without flattening their cognition into one shared workflow.

A parent/global integration gate becomes active only when its own prerequisites are actually satisfied. Parenthood alone does not create a serial queue among child modules.

---

# 2｜Module acceptance gates: S / K / L / P / R / E / U

Every module is audited with seven gates:

```text
S｜Source
K｜Knowledge
L｜Learning
P｜Projection
R｜Runtime
E｜Evidence
U｜User Validation
```

Do not replace these with vague language such as “80% done”, “basically closed”, or “build is green”.

## 2.1 Gate status vocabulary

Use these statuses when precision matters:

```text
PASS
PASS_WITH_DEBT
BLOCKED
UNTESTED
```

### PASS

The intended learner journey has no known acceptance defect at this gate for the audited scope.

### PASS_WITH_DEBT

The gate is usable for the intended journey, but a **non-blocking** improvement remains. The debt must be named and must not alter the claimed learning behavior.

Examples:

- a label could be clearer but the next action is still unambiguous;
- a mobile spacing issue is mildly inconvenient but does not hide content or change the learning action;
- a reference section could be easier to navigate but first learning and repair are unaffected.

`PASS_WITH_DEBT` must not be used to wave through a real learner-flow defect.

### BLOCKED

A known defect can change learning semantics, prevent the intended action, leak protected evidence, manufacture debt/mastery, lose required evidence, or make the learner unable to complete the claimed path correctly.

Examples:

- a required task instruction is missing;
- formal answers leak before a clean attempt;
- whole-set cognition is projected as isolated items;
- diagnosis is recorded as mastery;
- a repair/transfer state exists only on paper and cannot be executed;
- return from Chat can mutate the wrong learner object.

### UNTESTED

The gate/path has not received enough evidence to judge. `UNTESTED` is not failure, but it cannot be described as PASS.

`UNTESTED` is also **not a scheduling status**. Several downstream gates may be UNTESTED while only one gate is currently eligible for work.

## 2.2 Gate activation is dependency-scoped

For one audited scope, the local `CURRENT.md` identifies the **earliest unresolved acceptance gate that is eligible on the current dependency chain**.

That gate is the current active acceptance work. Later dependent gates remain downstream-frozen even if their status vocabulary is still `UNTESTED`.

Example:

```text
S  PASS
K  PASS
L  PASS
P  UNTESTED   ← ACTIVE / earliest unresolved eligible gate
R  UNTESTED   ← downstream-frozen
E  UNTESTED   ← downstream-frozen
U  UNTESTED   ← real learner use not yet eligible
```

Do not reinterpret this as four parallel TODOs.

When P passes, R may become active if no other dependency blocks it. If P fails and reopens K/L, the affected downstream chain freezes again.

This rule is local to the scope. Independent siblings may simultaneously have different active gates:

```text
Xizong A2        K active
Politics History P active
English Writing  E active
```

Hierarchy does not serialize those scopes.

Hard distinction:

```text
Gate status
= what evidence supports

Gate activation
= what the local Work Cursor is allowed to advance now
```

Do not add a second acceptance-status enum merely to encode scheduling. Use the existing status vocabulary plus the local Current's active/frozen dependency state.

## 2.3 Blocker vs improvement

Acceptance should be strict about **learning blockers**, not perfectionistic about every possible improvement.

Ask:

> **If this issue remains, can the learner still execute the intended path with correct semantics and preserved evidence?**

- **No** → blocker; the relevant gate is BLOCKED.
- **Yes, with only bounded friction/polish debt** → it may be PASS_WITH_DEBT.

Do not keep a mature module permanently “unfinished” because more polish can be imagined. Equally, do not downgrade a real learning-flow defect into “polish” just to reach PASS.

---

## S｜Source — Is the factual/source boundary reliable?

A module passes Source only when its authoritative material boundary is clear enough to support downstream learning without silent guessing.

Check:

- canonical Source Truth is identified;
- current source coverage is known;
- stable object identity exists where needed;
- supplied/original passages, questions, options, official answers, lectures, or other source facts are preserved faithfully;
- source gaps are explicit rather than silently fabricated;
- normal operation uses current `main@HEAD`;
- historical/legacy material is not a hidden runtime fallback;
- provenance is distinguishable from Current learning semantics;
- protected unseen material can remain protected.

Source closure does **not** imply learning closure.

---

## K｜Knowledge — Is the canonical learning asset correct and complete enough?

Knowledge concerns the domain/ability model before UI.

Check:

- canonical owner/path is clear;
- hierarchy reflects the real capability/knowledge structure rather than merely teacher order or question taxonomy;
- stable high-value concepts are actually taught, not merely named;
- important mechanisms, relations, boundaries, and execution rules are present;
- duplicate semantic owners are avoided;
- other ability owners are routed to rather than copied when appropriate;
- examples/drills support the intended concept;
- the asset is sufficient for first learning without becoming an encyclopedia;
- rare/personalized edge cases remain adaptive Chat territory unless repeated evidence justifies canonical treatment.

The canonical content should still make sense if the webpage disappeared.

> **If the team is still asking “what should this section actually teach?” while constructing UI, Knowledge is not closed.**

---

## L｜Learning — Does the path match how the learner should actually form the ability?

Correct content can still be taught in the wrong order.

Learning acceptance asks:

- What does the learner already know?
- Is this first learning, review, repair, or transfer?
- What must be learned continuously rather than as isolated cards?
- What can be skipped safely?
- What is the natural learner-facing unit?
- When should active recall/output occur?
- When should official/fresh tasks enter?
- What should static assets teach and what should Chat adapt?
- What counts as real evidence of learning?

The path must be calibrated to the learner’s real state rather than inferred from engineering progress.

### Hard rule: Engineering State ≠ Learner State

```text
Shared Current / continuation
= what the product/repository is building or validating

Private Learner State
= what the learner has actually studied / attempted / passed / deferred
```

Never infer personal learning progress from an engineering cursor.

Examples of forbidden inference:

- repository next action is “validate System Exit” → therefore learner should do System Recall;
- runtime supports a final test → therefore learner has reached it;
- a module page exists → therefore its content should be shown now.

The next learner action comes from conversation evidence and/or private learner state.

### Learning order must be causally sensible

Examples:

- Xizong first learning should not ask for System Recall before System/Block learning exists in the learner;
- Translation should not force Diagnosis when a clean attempt is stable and confident;
- Writing should not burn protected true exams merely to teach cold-start mechanics when synthetic material can teach the mechanism;
- Objective English review should remain passage/set-level even if internal evidence is item-level.

Learner order is not automatically construction order. Two independently owned assets may be constructed/accepted concurrently even when the approved learner path later consumes them sequentially, provided neither construction depends on an unresolved decision in the other.

---

## P｜Projection — Does the learner-facing display serve the learning path?

> **Content structure ≠ page structure.**

A canonical asset may contain Global Map, Core Blocks, Skill Map, deep reference content, runtime rules, and routing notes. The learner does not necessarily need to see all of these at once.

Check:

- first learning foregrounds the correct path;
- complete content is skippable when proficiency makes sections unnecessary;
- progressive disclosure protects clean attempts and lowers visual load;
- navigation supports natural jumps without turning Skill Map into a compulsory curriculum;
- long reference/runtime sections are demoted/folded when appropriate;
- answer/reference/model output is not revealed before the intended attempt;
- density, typography, and interaction cost fit real study use;
- projection does not change or invent domain semantics;
- different modules may look/behave differently when their cognition differs.

The correct question is:

> **At this moment in the learning path, what should the learner see and do next?**

not:

> “What headings exist in the Markdown?”

---

## R｜Runtime — Can the intended learning behavior actually be executed?

A learning contract on paper is not enough.

Runtime may include, depending on the module:

- Framework / first learning entry;
- Recall;
- clean Attempt;
- PASS;
- Wrong / Uncertain routing;
- Diagnosis;
- smallest useful Repair;
- learner Reconstruction / re-generation;
- Block/System closure;
- Review;
- Chat handoff and return;
- later Transfer.

Check especially for forced debt.

> **Stable correct work should be able to pass without manufactured review or repair.**

Runtime fails when, for example:

- a source path moved but the scanner still reads an old owner;
- a clean attempt is forced into diagnosis because PASS is absent;
- a whole-set task can be completed from a partial entry;
- Chat can receive a packet but return cannot be applied naturally;
- transfer/closure exists only as prose and has no executable path.

---

## E｜Evidence — Does the system preserve and use the right learning evidence?

Evidence must match module cognition.

Check:

- learner-facing review unit is appropriate;
- internal evidence may be finer-grained without forcing a fine-grained user workflow;
- first meaningful evidence is preserved where useful;
- root causes are distinguished from dependent/cascade errors;
- diagnosis is not mistaken for repair;
- repair evidence is not mistaken for mastery;
- fresh/unseen transfer outranks remembered-item correction;
- only reusable/high-value failures become durable review debt;
- irrelevant later material does not falsely confirm/refute a pending target;
- closure is based on meaningful evidence, not arbitrary counters;
- private learner evidence stays private.

### Evidence granularity may be smaller than Review granularity

Examples:

- one Reading passage is reviewed as one learner-facing unit even though evidence is per question;
- one Translation set is reviewed as a whole even though first-translation evidence remains segment-bound;
- one Writing essay is learner-facing even though diagnosis may identify one paragraph/proposition/span.

### Shared rule ≠ private learner strategy

Shared Current may define fresh/holdout semantics, evidence states, and scheduling constraints. It must not hard-code one learner’s chosen holdout years, personal progress, wrong/uncertain history, timing, notes, or transfer ledger as product truth.

---

## U｜User Validation — Has the learner actually used it?

U cannot be replaced by architecture discussion, build success, screenshots, simulated QA, synthetic E2E, or another model’s review.

Before U, the strongest allowed statement is:

> **Module ready for learner test.**

Only after real use may we say:

> **Learner-validated for the tested path.**

### U is path-scoped, not all-or-nothing

A module can have different real-use evidence for different journeys.

Example:

```text
Reading A
clean attempt → PASS                    U: PASS
wrong → whole-passage review → repair   U: PASS
later fresh transfer → CLOSED           U: UNTESTED
```

Do not flatten this into either “Reading A U passed” or “Reading A U failed”. Record exactly which learner journey was actually used.

Typical U paths may include:

- first-learning / Fast Track;
- stable clean PASS;
- wrong/uncertain → diagnosis → repair → return;
- later fresh transfer closure;
- reopen after later contradictory evidence;
- sustained multi-session use when relevant.

Real learner validation observes friction such as:

- where content is unclear;
- where the learner naturally wants to skip;
- where too much information appears at once;
- where reference/answer appears too early;
- where Chat is invoked too early/late;
- where next action is unclear;
- whether Core Blocks actually change ability;
- whether return from repair is natural;
- whether Skill Map explains real failures;
- whether the module remains usable during sustained study.

Real friction outranks speculative polish.

---

# 3｜Allowed readiness language

Use precise language:

- **Source-ready** — S passes for the relevant boundary.
- **Knowledge-ready** — S + K pass.
- **Learning-design ready** — S + K + L pass.
- **Module ready for learner test** — S + K + L + P + R + E are PASS or legitimately PASS_WITH_DEBT; U is still untested/partial by path.
- **Learner-validated for <path>** — real U evidence exists for that named journey.

A module may be reported as:

```text
S  PASS
K  PASS
L  PASS
P  PASS_WITH_DEBT  — mobile spacing only
R  PASS
E  PASS
U  clean path: PASS
   repair path: PASS
   transfer path: UNTESTED
```

Do not call a module “basically closed” when a missing gate changes real learner behavior.

Do not describe downstream `UNTESTED` gates as simultaneously active when an earlier dependent gate has not closed.

---

# 4｜What must NOT substitute for acceptance

These are evidence, not acceptance by themselves:

- Astro build passes;
- CI once passed on an older commit;
- Markdown is long/detailed;
- source inventory is complete;
- expected pages/buttons exist;
- a runtime contract is written;
- a question bank is attached;
- a taxonomy looks mature;
- simulated QA succeeds;
- current engineering stage is advanced.

Acceptance targets the learner journey on **current `main@HEAD`**.

Progress or failure in an independent sibling scope is also not acceptance evidence for the current scope.

---

# 5｜Module development lifecycle

Default mainline for one dependency chain:

```text
1. Source / Knowledge Audit
2. Learning-Path Audit
3. Learner Calibration where assumptions matter
4. Content Reconstruction / Optimization
5. Content Closure Audit
6. Learning UX / Projection Design
7. Runtime Implementation
8. Module E2E Acceptance
9. Learner Test
10. Evidence-based Revision
```

This sequence is iterative: a concrete downstream defect may reopen the earliest upstream gate that actually explains it. Do not reopen mature gates merely because more features can be imagined.

This lifecycle does not serialize independent modules. Different scopes may be at different lifecycle steps at the same time.

## 5.1 Source / Knowledge Audit

Determine what is true, complete, duplicated, missing, fragmented, or incorrectly organized. Do not start from UI.

## 5.2 Learning-Path Audit

Determine how this learner should form the capability from their real starting point. Do not assume teacher order is learner order.

## 5.3 Learner Calibration

When the path materially depends on personal facts, use already-known evidence about prior exposure, current level, study time, fresh-material status, preferred granularity/continuity, Chat boundaries, and device/friction constraints. Do not ask repetitive questions.

## 5.4 Content Reconstruction / Optimization

Reorganize canonical assets around ability formation/knowledge structure. UI must not become a hidden second textbook.

## 5.5 Content Closure Audit

Audit missing core content, unnecessary expansion, duplication, first-learning continuity, examples/synthetic drills, Chat boundary, fresh-material protection, cross-owner duplication, and whether a Skill/reference map became a compulsory syllabus. If no real gap remains, stop adding content.

## 5.6 Learning UX / Projection Design

Design display/interaction from the learning path, not Markdown headings.

## 5.7 Runtime Implementation

Make attempt/recall/repair/review/return/transfer behavior executable.

## 5.8 Module E2E Acceptance

Simulate realistic journeys on current `main@HEAD`, including at least:

- stable clean PASS with no manufactured debt;
- failure/uncertainty → smallest useful repair → correct return;
- later verification/transfer when closure is claimed;
- persistence/idempotency/error paths when they can mutate learner evidence.

This can prove S–E behavior for the tested scope. It cannot prove U.

## 5.9 Learner Test

The learner uses the real product. Record U by path.

## 5.10 Evidence-based Revision

Revise only from concrete defects, friction, missing stable content, or repeated learner evidence.

---

# 6｜Global / Home Acceptance

Home is a final system-integration layer. It routes among already-mature modules; it does not own subject cognition.

## 6.1 Home prerequisites

Core modules must have passed enough of S–E that Home is not hiding missing domain behavior. Any unresolved blocker remains visible as BLOCKED rather than being disguised by navigation.

Global/Home integration depends only on the child capabilities it actually claims. It must not create an artificial requirement that every sibling module finish before any integration work can begin unless the claimed journey truly spans all of them.

## 6.2 Home must reflect the learner’s real study world

Home should make it easy to understand:

- what major learning lanes exist;
- what is actually available now;
- what the learner can continue;
- what genuinely needs attention;
- how to enter a module directly.

It may present a coherent map without exposing every internal file/skill/engineering stage.

## 6.3 Continue must come from private learner state

```text
GitHub Current / continuation
→ what the product is building/validating

Private learner state
→ what the learner actually did and should continue
```

Home must not invent progress.

## 6.4 Pending must represent real debt only

Pending may include Wrong/Uncertain repair, unfinished learning units, valid `TRANSFER_PENDING` targets, due review, unfinished Reconstruction, or explicitly deferred learner actions.

Do not create red badges merely because content exists, the learner hesitated once, or a repair path is technically available.

> **Availability is not debt.**

## 6.5 Home unifies navigation/state, not cognition

Shared Home shells are allowed; once the learner enters a module, that module’s cognition governs.

Examples:

```text
Xizong
System → Block → Lecture/KP → Recall → official questions → repair

Translation
First Learning / Clean Attempt → PASS or Repair → Reconstruction → later transfer

Writing
First Learning → generation → full output → repair → fresh Writing

Objective English
passage/set Attempt → whole-unit review → root-cause repair → later transfer
```

Do not force these into one universal frontend card flow.

## 6.6 Fresh / holdout protection must survive Home routing

Shared Current defines semantics; private learner state determines currently protected sets/years/material. Home must not consume protected diagnostic capital merely because it is available.

## 6.7 Chat entry should follow learning need

```text
stable clean work
→ no Chat needed

wrong / uncertain / ambiguous / repeated failure
→ compact whole-unit Handoff

Chat semantic judgment + learner repair
→ Return to runtime

later fresh evidence when relevant
→ transfer adjudication / closure
```

Home may surface pending state; it must not invent semantic judgment.

---

# 7｜Global learner-journey acceptance

Final Home acceptance should test realistic cross-module days rather than only page URLs.

Examples:

```text
Open Home
→ Continue Xizong Block
→ learning → Recall → official questions
→ W/U → Chat repair → close
→ Nightly Review → Home
```

```text
Open Home
→ English Translation
→ clean whole-set Attempt
→ stable/confident PASS
→ zero manufactured debt
→ Home
```

```text
Open Home
→ objective/translation problem attempt
→ whole-unit Chat diagnosis
→ smallest repair + learner re-execution
→ TRANSFER_PENDING
→ later fresh task genuinely tests same demand
→ CLOSED
→ Home
```

Global acceptance fails when Home guesses learner stage from engineering state, contaminates module state, leaks private state, consumes protected fresh material, manufactures review debt, loses the learning object across Chat return, or makes the learner reconstruct repository implementation details to know what to do.

---

# 8｜Acceptance report format for module chats

Use this default report skeleton:

```text
MODULE: <name>
CURRENT OWNER(S): <canonical Current paths>
ACTIVE GATE: <earliest unresolved eligible gate>
DEPENDENCY: <exact unresolved prerequisite or none>
DOWNSTREAM: <frozen gates, if any>

S Source:      PASS / PASS_WITH_DEBT / BLOCKED / UNTESTED
K Knowledge:   PASS / PASS_WITH_DEBT / BLOCKED / UNTESTED
L Learning:    PASS / PASS_WITH_DEBT / BLOCKED / UNTESTED
P Projection:  PASS / PASS_WITH_DEBT / BLOCKED / UNTESTED
R Runtime:     PASS / PASS_WITH_DEBT / BLOCKED / UNTESTED
E Evidence:    PASS / PASS_WITH_DEBT / BLOCKED / UNTESTED

U User Validation by path:
- <journey A>: PASS / BLOCKED / UNTESTED
- <journey B>: PASS / BLOCKED / UNTESTED

Blocking defects:
- ...

Non-blocking debt:
- ...

What should NOT be expanded now:
- ...

Next smallest meaningful work:
- ...

Allowed conclusion:
- Source-ready / Knowledge-ready / Learning-design ready /
  Module ready for learner test / Learner-validated for <path> / Blocked
```

Reports should identify concrete Current evidence rather than infer completion from reputation, prior chats, historical green builds, or sibling progress.

---

# 9｜Repository-wide hard rules derived from acceptance

1. **Source coverage ≠ learning closure.**
2. **Correct content ≠ correct learning path.**
3. **Content structure ≠ page structure.**
4. **Page exists ≠ learner should see/use it now.**
5. **Build/QA/simulation pass ≠ learner validation.**
6. **A prior green commit does not prove current `main@HEAD`.**
7. **Engineering State ≠ Learner State.**
8. **Shared semantic rule ≠ private learner strategy/configuration.**
9. **Evidence granularity may be smaller than Review granularity.**
10. **Stable correct work should pass without manufactured debt.**
11. **Diagnosis ≠ repair; repair ≠ mastery.**
12. **Same-item correction is repair evidence, not mastery.**
13. **Later fresh transfer is stronger evidence than remembered local success.**
14. **Upstream/root cause should absorb dependent cascade errors when justified.**
15. **Chat should make semantic/adaptive judgments; UI should preserve evidence boundaries rather than fake them.**
16. **A real blocker and an optional improvement are not the same acceptance status.**
17. **U is path-scoped and requires real learner use.**
18. **Home unifies routing/state, not domain cognition.**
19. **Home is a final integration layer, not a substitute for unfinished modules.**
20. **UNTESTED ≠ ACTIVE; the local Work Cursor activates only the earliest unresolved eligible gate on a dependency chain.**
21. **Hierarchy ≠ scheduling; independent scopes at any depth may progress concurrently.**
22. **Learner order ≠ construction dependency; one must not silently serialize the other.**

---

# 10｜Relationship to other root governance

- `AGENTS.md` defines Current authority, read/write boundaries, content ownership, runtime boundaries, and repository operating rules.
- `ARCHITECTURE.md` separates ownership hierarchy from dependency-driven scheduling.
- `SYSTEM_CONTRACT.md` defines minimum platform capabilities every first-class learner surface should expose.
- `LEARNING_ACCEPTANCE.md` defines the evidence required before those capabilities may be called learner-ready and defines final Global/Home acceptance.
- `CURRENT.md` describes current system state; it must not become private learner progress.
- Domain manifests/continuations are child Current objects and cannot override these root-level acceptance rules.

When a lane-specific contract conflicts with this document on acceptance semantics, the lane may specialize cognition but may not weaken the distinction between source/content/build completion and real learner readiness without explicit repository-level revision.
