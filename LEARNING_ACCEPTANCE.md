# KianOS Learning Acceptance Standard

This document defines the repository-wide acceptance standard for KianOS learning lanes and learner-facing sub-lanes.

It answers one question:

> **When may we truthfully say that a subject/module is ready for the learner, and when may KianOS as a whole be considered closed enough for real use?**

This is not a UI checklist and not an engineering completion checklist. A content file existing, a page rendering, a build passing, or a question bank being complete are each useful evidence, but none of them alone proves a learning system is closed.

The governing sequence is:

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

After core modules are individually ready, KianOS enters a separate final layer:

```text
Module Acceptance
→ Global / Home Integration
→ Home E2E Acceptance
→ Learner whole-system use
```

The Home layer is therefore a **final integration and routing layer**, not a place to compensate for unfinished domain learning models.

---

# 1｜Two acceptance layers

KianOS uses two different acceptance layers.

## 1.1 Module Acceptance

Every first-class subject lane or independently entered learner sub-lane must be accepted on its own cognition and learning path before the Home layer may treat it as learner-ready.

Examples include:

- Xizong systems such as A1 Circulation or A2 Respiratory when independently entered;
- English Lexical, Reading, Cloze, Reading B, Translation, Writing;
- Politics learning/runtime lanes;
- future first-class learning modules.

A domain-level page or global Home satisfying a capability does **not** automatically make every child module ready.

## 1.2 Global / Home Acceptance

Once the core modules are individually mature enough, KianOS must pass a separate system-level acceptance focused on:

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

---

# 2｜Module acceptance gates: S / K / L / P / R / E / U

Every module should be audited with seven gates.

```text
S｜Source
K｜Knowledge
L｜Learning
P｜Projection
R｜Runtime
E｜Evidence
U｜User Validation
```

A vague statement such as “80% done” or “closed” should be replaced with an explicit gate status whenever precision matters.

---

## S｜Source — Is the factual/source boundary reliable?

A module passes Source only when its authoritative material boundary is clear enough to support downstream learning without silent guessing.

Check:

- canonical Source Truth is identified;
- current source coverage is known;
- stable object identity exists where needed;
- supplied/original passages, questions, options, official answers, lectures, or other source facts are preserved faithfully;
- source gaps are explicit rather than silently fabricated;
- `main@HEAD` Current is used for normal operation;
- historical/legacy material is not a hidden runtime fallback;
- provenance is distinguishable from Current learning semantics;
- protected unseen material can remain protected.

Source closure does **not** imply learning closure.

Examples:

- “376 official circulation questions are exactly scoped” may pass Source for that question inventory while the circulation first-learning runtime is still incomplete.
- “all Translation sets resolve from Current” may pass Source while the productive runtime still lacks PASS or transfer closure.

---

## K｜Knowledge — Is the canonical learning asset correct and complete enough?

Knowledge is about the domain model itself, before UI.

Check:

- canonical owner/path is clear;
- the content hierarchy reflects the underlying capability or knowledge structure, not merely a teacher’s chapter order or a question-type taxonomy;
- stable high-value concepts are actually taught, not only named;
- important mechanisms, relations, boundaries, and execution rules are present;
- duplicate semantic owners are avoided;
- another ability owner is referenced/routed rather than copied when appropriate;
- examples/drills support the intended concept;
- the asset is complete enough for first learning without trying to become an encyclopedia;
- rare boundaries and personalized edge cases remain adaptive Chat territory unless repeated evidence justifies canonical treatment.

The canonical content should still make sense if the webpage were removed.

> **If the team is still asking “what should this section actually teach?” during UI construction, Knowledge is not closed yet.**

---

## L｜Learning — Does the path match how this learner should actually form the ability?

Correct content can still be taught in the wrong order.

Learning acceptance asks:

- What does the learner already know?
- Is this first learning, review, repair, or transfer?
- What must be learned continuously rather than as isolated cards?
- What can be skipped safely?
- What is the natural learner-facing unit?
- When should active recall/output occur?
- When should official questions or fresh tasks enter?
- What should Chat do, and what should the static asset teach by itself?
- What counts as real evidence of learning?

The path must be calibrated to the learner’s real state rather than inferred from engineering progress.

### Hard rule: Engineering State ≠ Learner State

```text
Shared Current / continuation
= what the product or repository is building / validating

Private Learner State
= what the learner has actually studied / attempted / passed / deferred
```

Never infer personal learning progress from an engineering cursor.

Examples of forbidden inference:

- repository next action is “validate A1 System Exit” → therefore learner should do System Recall;
- runtime supports a final test → therefore learner has reached final test;
- a module page exists → therefore its content should be shown now.

The correct next learner action comes from current conversation evidence and/or private learner state, not shared engineering state.

### Learning order must be causally sensible

Examples:

- Xizong first learning should not ask for System Recall before System/Block learning exists in the learner.
- Translation should not force Diagnosis when a clean attempt is stable and confident.
- Writing should not burn protected true exams merely to teach cold-start mechanics if synthetic material can teach the mechanism first.
- Objective English review should remain passage/set-level even if internal evidence is item-level.

---

## P｜Projection — Does the learner-facing display serve the learning path?

Projection begins only after Knowledge and Learning are sufficiently clear.

> **Content structure ≠ page structure.**

A canonical asset may contain Global Map, Core Blocks, Skill Map, deep reference content, runtime rules, and material-routing notes. The learner does not necessarily need to see all of those at once.

Check:

- first learning foregrounds the correct path;
- complete content is skippable where learner proficiency makes sections unnecessary;
- progressive disclosure protects clean attempts and lowers visual load;
- navigation supports natural jumps without turning a Skill Map into a compulsory curriculum;
- long reference/runtime sections can be demoted, folded, or moved out of the first-learning reading stream when appropriate;
- answer/reference/model output is not revealed before the intended attempt;
- UI density, typography, and interaction cost fit real study use;
- the projection does not change or invent domain semantics;
- different modules are allowed to look and behave differently when their cognition differs.

The correct design question is:

> **At this moment in the learning path, what should the learner see and what should they do next?**

not:

> “What headings exist in the Markdown?”

---

## R｜Runtime — Can the intended learning behavior actually be executed?

A learning contract on paper is not enough.

Runtime acceptance requires the real paths to exist.

Depending on the module, this may include:

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

Examples of runtime failure even when content is mature:

- a source path moved but the scanner still reads the old owner;
- clean Translation attempts are forced into Diagnosis because no PASS branch exists;
- a whole-set attempt can be “completed” after only one segment is entered;
- Chat can receive a packet but the learner must manually retype the return judgment;
- a later transfer rule exists only as prose with no executable state path.

---

## E｜Evidence — Does the system preserve and use the right learning evidence?

Evidence must match the module’s cognition.

Check:

- learner-facing review unit is appropriate;
- internal evidence may be finer-grained without forcing fine-grained user workflow;
- first meaningful evidence is preserved where useful;
- upstream/root causes are distinguished from dependent/cascade errors;
- repair evidence is not mistaken for mastery;
- fresh/unseen transfer outranks repeated correction of remembered material;
- only reusable/high-value failures become durable review debt;
- irrelevant later material does not falsely confirm or refute a pending target;
- closure is based on meaningful evidence, not arbitrary counters;
- private learner evidence stays private.

### Evidence granularity may be smaller than Review granularity

Examples:

- one Reading passage is reviewed as one learner-facing unit even though evidence is per question;
- one Translation set is reviewed as a whole even though first-translation evidence should remain segment-bound;
- one Writing essay is the learner-facing unit even though diagnosis may identify one paragraph, proposition, or lexical span.

### Shared rule ≠ private learner strategy

Shared Current may define:

- fresh/protected material semantics;
- holdout support;
- evidence states;
- scheduling constraints.

It must not hard-code one learner’s private choices as product truth.

Example:

```text
Shared rule:
respect protected unseen / holdout material

Private learner state:
which exact years or sets are currently held out
```

A learner’s chosen holdout years, personal progress, wrong/uncertain history, session timing, notes, and transfer ledger are private state unless the user explicitly chooses another storage model.

---

## U｜User Validation — Has the learner actually used it?

This gate cannot be replaced by architecture discussion, build success, screenshots, or simulated QA.

Before U, the team may say:

> **Module is ready for learner testing.**

Only after real use should it say:

> **Learner-validated for the tested path.**

Real learner validation observes friction such as:

- where the learner does not understand the content;
- where the learner wants to skip;
- where too much information appears at once;
- where an answer/reference appears too early;
- where Chat is invoked too early or too late;
- where the learner cannot tell the next action;
- whether a Core Block actually forms the intended capability;
- whether return from repair/review is natural;
- whether the Skill Map can explain real failure;
- whether the module remains usable after sustained study rather than only a short demo.

Real friction outranks speculative polish.

---

# 3｜Allowed readiness language

Use precise language instead of one overloaded word such as “closed”.

Recommended vocabulary:

- **Source-ready** — S passes for the relevant source boundary.
- **Knowledge-ready** — S + K pass; the semantic asset is mature enough to design learning around.
- **Learning-design ready** — S + K + L pass.
- **Module ready for learner test** — S + K + L + P + R + E pass; U pending.
- **Learner-validated** — U has real evidence for the tested journey.

A module may also be described explicitly as Partial, for example:

```text
S ✅
K ✅
L ✅
P ⏳
R ❌
E partial
U ❌
```

Do not replace this with “basically closed” when the missing gate changes real learner behavior.

---

# 4｜What must NOT be used as a substitute for acceptance

The following are evidence, not acceptance by themselves:

- Astro build passes;
- CI once passed on an older commit;
- Markdown is long/detailed;
- a source inventory is complete;
- all expected pages exist;
- all buttons render;
- a runtime contract is written;
- a question bank is attached;
- the module has a nice taxonomy;
- the current engineering stage is advanced.

The acceptance target is always the learner journey on **current `main@HEAD`**, not a prior green build or an intended design.

---

# 5｜Module development lifecycle

The default mainline for substantial learning modules is:

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

## 5.1 Source / Knowledge Audit

Determine what is true, complete, duplicated, missing, overly fragmented, or incorrectly organized.

Do not start from UI.

## 5.2 Learning-Path Audit

Determine how this learner should actually form the capability from their real starting point.

Do not assume a teacher’s content order is the optimal learner order.

## 5.3 Learner Calibration

When the path depends materially on personal facts, calibrate against the learner:

- prior exposure;
- current level;
- realistic study time;
- fresh-material status;
- preferred continuity / granularity;
- Chat boundaries;
- device / friction constraints when relevant.

Do not ask repetitive questions when those facts are already known.

## 5.4 Content Reconstruction / Optimization

Reorganize the canonical asset around ability formation or knowledge structure.

The canonical asset should own stable learning semantics. UI should not become a hidden second textbook.

## 5.5 Content Closure Audit

Before UI, audit:

- missing core content;
- unnecessary expansion;
- duplication;
- first-learning continuity;
- examples / synthetic drills;
- Chat boundary;
- true-exam/fresh-material protection;
- cross-owner duplication;
- whether the Skill Map/reference map has accidentally become a compulsory syllabus.

If no real gap remains, stop adding content.

## 5.6 Learning UX / Projection Design

Design the display and interaction from the learning path, not from the Markdown headings.

## 5.7 Runtime Implementation

Make the actual attempt/recall/repair/review/transfer behavior executable.

## 5.8 Module E2E Acceptance

Simulate realistic learner journeys on current `main@HEAD`, including at least:

- a stable/clean path that can pass without manufactured debt;
- a failure/uncertainty path that reaches the smallest useful repair and returns correctly;
- a later verification/transfer path when the module claims such closure.

## 5.9 Learner Test

The learner uses the real product.

## 5.10 Evidence-based Revision

Revise only from concrete defects, friction, missing stable content, or repeated learner evidence. Do not reopen mature architecture merely because more features can be imagined.

---

# 6｜Global / Home Acceptance

Home is a final system-integration layer.

Its job is **not** to own subject cognition. Its job is to route the learner correctly among already-mature modules.

## 6.1 Home prerequisites

Before Home is treated as final integration rather than exploratory scaffolding, core modules should have passed enough of S–E that Home is not being asked to hide missing domain behavior.

A module with unresolved P0/P1 learner-flow defects must remain visibly Partial rather than being presented as complete merely because Home can link to it.

## 6.2 Home must reflect the learner’s real study world

Home should make it easy to understand:

- what major learning lanes exist;
- what is actually available now;
- what the learner can continue;
- what genuinely needs attention;
- how to enter a module directly without reconstructing the whole repository.

Home may present a coherent system map without exposing every internal file, skill node, or engineering stage.

## 6.3 Continue must come from private learner state

Home must never infer personal progress from shared engineering state.

```text
GitHub Current / continuation
→ what the product is building or validating

Private learner state
→ what this learner actually did and should continue
```

A correct Home Continue should not require the learner to remember where they stopped, but it also must not invent progress.

## 6.4 Pending must represent real debt only

Home may surface genuinely useful pending work, such as:

- Wrong / Uncertain repair;
- unfinished Block / task;
- TRANSFER_PENDING target;
- due review;
- unfinished Reconstruction;
- explicitly deferred learner action when appropriate.

Do not generate red badges merely because content exists, a learner hesitated once, or a repair path is technically available.

> **Availability is not debt.**

## 6.5 Home unifies navigation/state, not cognition

Home may provide shared shells such as:

- Current;
- Continue;
- navigation;
- pending/review summary;
- Chat bridge entry;
- global return.

But once the learner enters a module, the module’s own learning cognition governs.

Examples:

```text
Xizong
System → Block → Lecture/KP → Recall → official questions → repair

Translation
First Learning / Clean Attempt → PASS or Repair → Reconstruction → later transfer

Writing
First Learning → synthetic generation → full output → repair → fresh Writing

Objective English
passage/set Attempt → whole-unit review → root-cause repair → later transfer
```

Do not force these into one universal card flow for frontend consistency.

## 6.6 Fresh / holdout protection must survive Home routing

Home recommendations and Continue must respect private protected-unseen choices.

Shared Current defines the semantics; private learner state determines the learner’s current protected sets/years/material.

Home must not consume or recommend protected fresh material merely because it is technically available.

## 6.7 Chat entry should follow learning need

Chat is not a global decoration button.

Typical pattern:

```text
stable clean work
→ no Chat needed

wrong / uncertain / ambiguous / repeated failure
→ compact Handoff to Chat

Chat semantic judgment
→ Return to runtime

later fresh evidence when relevant
→ transfer adjudication / closure
```

Home may summarize that a pending repair/transfer exists, but it must not itself invent the semantic judgment.

---

# 7｜Global learner-journey acceptance

Final Home acceptance should test realistic cross-module days rather than only individual page URLs.

Example journey A:

```text
Open Home
→ Continue yesterday’s Xizong Block
→ finish learning
→ Recall
→ official questions
→ two W/U items
→ Chat repair
→ Block close
→ later Nightly Review
→ return Home
→ state is correct
```

Example journey B:

```text
Open Home
→ enter English Translation
→ clean whole-set Attempt
→ stable + confident
→ PASS with zero manufactured debt
→ return Home
```

Example journey C:

```text
Open Home
→ Translation clean Attempt
→ Need Review
→ whole-set Handoff to Chat
→ primary failure + smallest repair
→ learner Reconstruction
→ TRANSFER_PENDING
→ later fresh Translation tests same underlying demand
→ evidence adjudicated
→ CLOSED
→ return Home
```

Example journey D:

```text
Open Home
→ first-time Writing
→ First Learning
→ skip already-mastered parts
→ synthetic partial task
→ synthetic/full output
→ repair if needed
→ first fresh true-exam attempt only after gate
→ return Home
```

Global acceptance fails if these journeys reveal problems such as:

- Home guesses a learner stage from engineering state;
- module state contaminates another module;
- private state is written into shared Current;
- protected fresh material is consumed incorrectly;
- stable clean work is turned into review debt;
- return from Chat loses the learning object;
- the learner cannot identify the next action;
- navigation exposes implementation structure rather than learning structure;
- build is green while the current learner path is broken.

---

# 8｜Acceptance report format for module chats

When a module chat is asked whether its lane is ready/closed, use this as the default report skeleton:

```text
MODULE: <name>
CURRENT OWNER(S): <canonical Current paths>

S Source:      ✅ / ⏳ / ❌
K Knowledge:   ✅ / ⏳ / ❌
L Learning:    ✅ / ⏳ / ❌
P Projection:  ✅ / ⏳ / ❌
R Runtime:     ✅ / ⏳ / ❌
E Evidence:    ✅ / ⏳ / ❌
U User Test:   ✅ / ⏳ / ❌

P0 blockers:
- ...

Structural gaps:
- ...

What should NOT be expanded now:
- ...

Next smallest meaningful work:
- ...

Allowed conclusion:
- Source-ready / Knowledge-ready / Learning-design ready /
  Module ready for learner test / Learner-validated / Partial
```

The report should cite or identify concrete Current evidence rather than infer completion from reputation, prior chats, or historical green builds.

---

# 9｜Repository-wide hard rules derived from acceptance

These rules apply across KianOS:

1. **Source coverage ≠ learning closure.**
2. **Correct content ≠ correct learning path.**
3. **Content structure ≠ page structure.**
4. **Page exists ≠ learner should see/use it now.**
5. **Build/QA pass ≠ learner-ready.**
6. **A prior green commit does not prove current `main@HEAD`.**
7. **Engineering State ≠ Learner State.**
8. **Shared semantic rule ≠ private learner strategy/configuration.**
9. **Evidence granularity may be smaller than Review granularity.**
10. **Stable correct work should pass without manufactured debt.**
11. **Same-item correction is repair evidence, not mastery.**
12. **Later fresh transfer is stronger evidence than remembered local success.**
13. **Upstream/root cause should absorb dependent cascade errors when justified.**
14. **Chat should make semantic/adaptive judgments; UI should not fake them.**
15. **Home unifies routing and state, not domain cognition.**
16. **Home is a final integration layer, not a substitute for unfinished modules.**
17. **Real learner use is the final acceptance evidence.**

---

# 10｜Relationship to other root governance

- `AGENTS.md` defines Current authority, read/write boundaries, content ownership, runtime boundaries, and repository operating rules.
- `SYSTEM_CONTRACT.md` defines the minimum platform capabilities every first-class learner surface should expose.
- `LEARNING_ACCEPTANCE.md` defines the order and evidence required before those capabilities may be called a learner-ready module, and defines the final Global/Home acceptance layer.
- `CURRENT.md` describes the current system state; it must not become private learner progress.
- Domain manifests/continuations remain child Current objects and must not override these root-level rules.

When a lane-specific contract conflicts with this document on acceptance semantics, the lane may specialize cognition but may not weaken the distinction between source/content/build completion and real learner readiness without explicit repository-level revision.
