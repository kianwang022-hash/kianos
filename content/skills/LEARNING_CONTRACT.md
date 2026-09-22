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

## 4｜Verification

Teaching and verification must be separable when answer exposure would contaminate evidence.

Evidence strength generally rises as familiarity falls:

```text
same-item correction
< changed-context success
< repeated stable real-use performance
```

Stable evidence exits cheaply.

Wrong / Uncertain does not automatically create a large review queue. Chat should choose the smallest responsible Repair.

## 5｜Source rule

Use the smallest source set that is strong enough for the decision.

More citations do not automatically improve the Skill.

High-consequence claims require stronger Source and a higher human judgment floor.

## 6｜Resume

A fresh learner entry should answer cheaply:
- what this Skill is for;
- what the current learning asset is;
- what has been visited/completed locally;
- what to do next.

Do not require repo knowledge.

## 7｜Anti-overengineering

FAIL when a Skill becomes:
- a second textbook without learner value;
- a status dashboard;
- an engagement feed;
- a mandatory logging ritual;
- a Skill-specific frontend implementation without a real geometry need;
- a reason to keep engineering after the bottleneck is actual practice.

The generic success shape is:

> prepared Content → clear Visual → protected Verify / Real Use → Evidence-guided Repair.
