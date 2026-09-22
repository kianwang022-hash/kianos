# Skill Library Learning Contract

Status: CURRENT
Role: highest shared learner-facing rule for non-exam Skills rendered by KianOS.

## 0｜Purpose

A Skill is not a folder of notes.

A promoted Skill exists to make a real capability appear in reality with the lowest useful learner friction.

Default lifecycle:

```text
Personal demand discovery
→ success condition
→ bounded Ecosystem / Capability Scan
→ capability / logic map
→ Source Truth / Source Review
→ learner Guide / Framework
→ Learn
→ protected Verify / real task
→ Evidence
→ smallest Repair
→ changed-context Transfer / Real Use
→ next loop
```

The exact cognition inside the loop is domain-specific.

## 1｜Ownership

Personal OS owns:
- whether the capability deserves attention;
- demand discovery;
- personal context and cross-domain trade-offs;
- the reusable New Domain Learning meta-skill.

KianOS Skill Content owns:
- learner-facing Guide / Framework / Unit content;
- content-local source bindings/review;
- verification assets;
- the current content route.

Runtime owns only learner interaction/progress facts. Runtime does not redefine content truth.

Chat owns interpretation, source curation, evidence judgment, Repair choice and adaptive next-step reasoning.


## 2｜Ecosystem / Capability Scan — mandatory before original build

Before creating a new Skill or making a material Skill upgrade, Chat must first ask:

> **What already exists that can be reused, connected, adapted or learned from?**

This scan is not broad browsing for inspiration. It is a bounded attempt to avoid rebuilding mature capability.

### 2.1｜Scan order

Use the smallest useful subset of these lanes:

1. **Existing connected capability**
   - GitHub + authorized desktop / terminal execution;
   - Calendar / Gmail / Drive;
   - Figma;
   - Health;
   - Finances;
   - Quartr;
   - BioRender;
   - other already-connected tools relevant to the exact Skill.

2. **Available high-value plugins / external capability**
   - scientific literature / citation intelligence such as Scite;
   - rigorous computation / knowledge engines such as Wolfram;
   - product analytics / experimentation such as PostHog;
   - real-world travel inventory such as Expedia;
   - other plugins discovered for the exact demand.

   These are capability candidates, not mandatory dependencies. Connection happens only when the real Skill need justifies it.

3. **GitHub / mature open-source projects**
   - search for projects that already solve the same or adjacent problem;
   - inspect architecture, docs, tests, activity, maintenance state and license when material;
   - prefer reusable patterns, data structures, validators, benchmarks and learner UX over raw star count.

4. **Official standards / first-party documentation / APIs**
   - use when the Skill touches a formal protocol, framework, regulated domain or software platform.

5. **Scientific / professional evidence**
   - use when claims affect health, medicine, finance, cognition, safety or another evidence-sensitive domain.

6. **Courses / textbooks / benchmarks / templates**
   - use when a mature pedagogical sequence or evaluation benchmark already exists.

7. **Internal reuse**
   - inspect KianOS / Personal patterns before introducing a new abstraction;
   - reuse proven Content / Visual / Runtime geometry when the semantics fit.

### 2.2｜Decision output

Every material candidate should end in exactly one of:

- **ADOPT** — use the mature solution directly;
- **INTEGRATE** — connect it as an external capability / plugin;
- **ADAPT** — reuse a pattern or component with bounded changes;
- **LEARN_FROM** — borrow principles / benchmarks / architecture only;
- **IGNORE** — real mismatch, poor quality, excessive dependency or maintenance cost.

The scan should record only decisions that change the Skill design. Do not create a permanent catalog of everything found.

### 2.3｜Quality gates

A GitHub project is not “good” merely because it has many stars.

When material, check:
- fit to the exact demand;
- recency / active maintenance;
- documentation quality;
- tests / validation;
- dependency and security burden;
- license / reuse boundary;
- whether adoption would reduce or increase KianOS maintenance;
- whether the project proves real capability or only attractive presentation.

A plugin is not valuable merely because it is powerful.

Prefer it when it:
- removes manual data transfer;
- adds a real-world data source;
- adds an action surface Chat cannot otherwise reach;
- adds an independent verification layer;
- materially reduces engineering / operational friction.

### 2.4｜Build-vs-reuse rule

Original implementation is justified only when at least one is true:

- no mature solution fits the actual success condition;
- existing solutions impose more maintenance / dependency cost than a bounded native implementation;
- Kian-specific learner semantics are the differentiator;
- privacy / ownership / offline constraints require local control;
- the needed capability is small enough that integration would be more complex than implementation.

Otherwise prefer reuse.

### 2.5｜Attention rule

The Ecosystem Scan has a stop condition.

Stop scanning when:
- at least one credible solution exists for each material capability question;
- remaining uncertainty would not change ADOPT / INTEGRATE / ADAPT / LEARN_FROM / IGNORE;
- the next bottleneck is actual learner content, implementation or real-world evidence.

Do not let “researching existing tools” become another avoidance loop.


## 3｜Content / Visual / Runtime

### Content

Each Skill lives under `content/skills/<skill>/` with one manifest and only the assets the Skill actually needs.

Guide is explanatory orientation, not a second encyclopedia.

Unit content should make the capability usable, not maximize coverage.

Source Review records:
- source;
- admitted claim;
- learner use;
- boundary / what it does not prove.

### Visual

One generic Astro renderer projects all Skills.

Visual may:
- make Guide/Framework easier to read;
- expose the current route;
- separate Learn and Verify;
- show a quiet Resume.

Visual may not invent Skill semantics or require Skill-specific code for ordinary new content.

### Runtime

V1 Runtime may remember:
- most recently opened Skill/asset;
- visited assets;
- learner-marked completion of a reading asset.

That is execution progress only.

It may not infer:
- mastery;
- transfer;
- verified performance;
- a health score;
- future scheduling debt.


## 4｜Learn Control — make material become capability

The shared Skill lifecycle does **not** imply one universal teaching method.

The learner surface must route practice by the type of capability being built, preserve clean evidence when useful, and stop calling exposure "learning".

### 4.1｜Baseline Gate — test before teaching only when it is informative

Before the first learner exposure to a capability unit, ask:

> **Would a clean unseen baseline produce useful information without creating avoidable risk or noise?**

Use a pre-learning baseline when:
- Kian can make a meaningful attempt without first being taught the answer;
- the attempt can reveal current capability rather than random guessing;
- the task is low-risk enough to attempt;
- prior exposure would materially contaminate the evidence.

Skip or soften the baseline when:
- a true novice could only guess;
- the task is safety-critical / medically or financially consequential;
- the real baseline already exists in durable evidence;
- the baseline would cost more attention than it would save.

A baseline exists to compress future learning, not to generate a score.

### 4.2｜Practice Geometry Router — train the cognition the real task requires

Do not default every Skill to reading + quiz.

Choose the smallest geometry that matches the capability:

| Capability type | Default learning geometry |
| --- | --- |
| Knowledge / mental model | retrieve, explain, compare, reconstruct relationships |
| Discrimination / judgment | contrasted cases, decisive cues, uncertainty, changed-context classification |
| Procedure / software / building | perform the workflow, debug failure, ship a working artifact |
| Communication / social | live production, role-play when useful, then real interaction and feedback |
| Physical / perceptual | embodied repetitions, external feedback, representative conditions |
| Decision / governance | scenario analysis, policy/rules, actual decisions, later outcome review |
| Creative / taste | produce, compare, critique, revise, build a reference library through use |
| Mixed capability | combine only the geometries required by the actual success condition |

The real task has priority over the convenient exercise.

### 4.3｜Unit Closure Contract

Every material learning unit must be able to answer:

```text
Target capability:
Why this unit exists now:
Prerequisites:
Learner asset:
Practice geometry:
Allowed assistance:
Verification mode:
Exit evidence:
Changed-context transfer target:
Real-use manifestation:
```

Not every field must appear on the learner-facing page, but the design must resolve them.

A unit is too broad if its target cannot be demonstrated in one coherent performance family.

### 4.4｜Assistance Mode — distinguish Kian's capability from system capability

Verification must state what assistance is legitimate for the success condition.

Useful modes:

- **NATIVE** — Kian must perform without AI / external answer generation;
- **TOOL_ALLOWED** — ordinary tools are part of the real task;
- **AI_ASSISTED** — effective AI use is itself part of the target capability;
- **EXPERT_GATED** — real performance requires qualified human review or supervision.

Do not label a polished AI-assisted artifact as native personal mastery when the Native Floor has not been demonstrated.

### 4.5｜Promotion Ladder — exposure is not capability

Use this evidence ladder when useful:

```text
ORIENTED
→ DIRECTLY_DEMONSTRATED
→ CHANGED_CONTEXT_TRANSFER
→ REAL_USE
→ STABLE
```

Meaning:

- **ORIENTED** — learner has read / understood the model;
- **DIRECTLY_DEMONSTRATED** — can perform a near-form task without answer leakage;
- **CHANGED_CONTEXT_TRANSFER** — succeeds when surface features or context change;
- **REAL_USE** — capability appears in an actual decision / project / conversation / performance;
- **STABLE** — repeated evidence across time or context shows the capability is reliable enough for its stakes.

Not every Skill needs to reach STABLE.

The required promotion level comes from the original success condition and consequence of failure.

Never promote on:
- file existence;
- page completion;
- self-reported understanding alone;
- same-item correction alone.

### 4.6｜Difficulty and Feedback Control

Practice should remain informative.

When performance is:
- **too easy / highly familiar** → increase delay, variability, context change or realism;
- **productive but imperfect** → keep the task and give the smallest feedback that changes the next attempt;
- **chaotic / mostly guessing** → shrink scope, restore prerequisites or add scaffolding;
- **unsafe / high-consequence** → move to simulation, source review or expert-gated practice before real action.

Feedback timing is domain-dependent.

Use immediate feedback when early procedural error, safety or misconception makes continued blind practice costly.

Delay feedback when clean retrieval / verification would otherwise be contaminated.

There is no universal "always immediate" or "always delayed" rule.

### 4.8｜Discussion / Reflection Channel

After learner content, Kian may bring questions, objections, personal examples or alternative interpretations back to Chat.

This channel is **optional**.

Use it to:
- resolve genuine conceptual friction;
- test whether the Guide maps to Kian's reality;
- identify missing distinctions or poor explanations;
- update learner content when the problem is in the material;
- update the learner model when the new information is about Kian.

Do not:
- force a Socratic conversation after every page;
- count comfortable discussion as verification by default;
- replace protected Verify with hints leaked through discussion;
- turn ordinary curiosity into mandatory review debt.

Discussion may generate a new hypothesis or Repair target. Capability evidence still comes from the appropriate performance / transfer / real-use layer.


### 4.7｜Maintenance Gate

Do not automatically create spaced review for every Skill.

Add maintenance only when:
- the capability decays without use;
- future failure is costly;
- real use is too infrequent to maintain it naturally;
- or evidence shows regression.

If normal real-world use already maintains the capability, real use is the maintenance plan.


## 5｜Verification

Teaching and verification must be separable when answer exposure would contaminate evidence.

Evidence strength generally rises as familiarity falls:

```text
same-item correction
< changed-context success
< repeated stable real-use performance
```

Stable evidence exits cheaply.

Wrong / Uncertain does not automatically create a large review queue. Chat should choose the smallest responsible Repair.

## 6｜Source rule

Use the smallest source set that is strong enough for the decision.

More citations do not automatically improve the Skill.

High-consequence claims require stronger Source and a higher human judgment floor.

## 7｜Resume

A fresh learner entry should answer cheaply:
- what this Skill is for;
- what the current learning asset is;
- what has been visited/completed locally;
- what to do next.

Do not require repo knowledge.

## 8｜Anti-overengineering

FAIL when a Skill becomes:
- a second textbook without learner value;
- a status dashboard;
- an engagement feed;
- a mandatory logging ritual;
- a Skill-specific frontend implementation without a real geometry need;
- a reason to keep engineering after the bottleneck is actual practice.

The generic success shape is:

> prepared Content → clear Visual → protected Verify / Real Use → Evidence-guided Repair.
