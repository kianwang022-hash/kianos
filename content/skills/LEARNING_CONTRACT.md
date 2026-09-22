# Skill Library Learning Contract

Status: CURRENT  
Role: shared learner-facing rule for promoted non-exam Skills.

## 0｜Purpose

A Skill is not a folder of notes. It exists to make a real capability appear with low learner friction.

Default loop:

```text
Personal demand discovery
→ success condition
→ capability / logic map
→ Source Truth / Source Review
→ Guide / Framework
→ domain-appropriate Learn / Practice
→ protected Verify or real task
→ Evidence
→ smallest Repair
→ changed-context Transfer / Real Use
→ next loop
```

The outer loop is shared. The cognition inside it is domain-specific.

## 1｜Ownership

**Personal OS owns**
- whether the capability deserves attention;
- demand discovery and personal constraints;
- cross-domain trade-offs;
- the reusable New Domain Learning meta-skill.

**KianOS Skill Content owns**
- learner-facing Guide / Framework / Unit content;
- content-local source bindings / Source Review;
- verification assets;
- current learner route.

**Runtime owns**
- only execution facts needed for Resume, such as last asset / visited / explicit read completion.

**Chat owns**
- interpretation;
- source curation;
- evidence judgment;
- Repair;
- next-step adaptation;
- optional discussion when Kian has a real question.

No layer may infer mastery from page existence or page completion.

## 2｜Reuse check — conditional, not ritual

Before building original material or machinery, check existing courses, standards, tools, plugins, open-source projects or internal KianOS patterns **only when a mature external capability could materially change the design**.

Use `ECOSYSTEM_SCAN.md` for that bounded case.

Do not run a broad ecosystem scan by default. Stop as soon as further search would not change build-vs-reuse or learner design.

## 3｜Content / Visual / Runtime

### Content

Each active Skill lives under:

`content/skills/<skill>/`

with one manifest and only the assets it actually needs.

A Guide is explanatory orientation, not a second encyclopedia.

Source Review records:
- source;
- admitted claim;
- learner use;
- boundary / what the source does not prove.

### Visual

One generic Astro renderer projects ordinary Skills.

A new ordinary Skill should normally be a Content-only addition.

Skill-specific Visual code requires a real domain geometry need, not branding preference.

### Runtime

V1 may remember:
- last opened Skill / asset;
- visited assets;
- explicit learner-marked read completion.

These are navigation / execution facts only.

Runtime must not infer:
- mastery;
- transfer;
- verified performance;
- health / readiness scores;
- scheduling debt.

All learner-state writes use the existing shared learner-writer ownership boundary.

## 4｜Unit learning

A material Unit is the smallest coherent capability slice that can be demonstrated, exited or repaired.

Detailed design semantics live once in `UNIT_CONTRACT.md`.

The unit must resolve, when material:
- target capability and why now;
- prerequisites;
- whether a clean baseline is informative;
- learner asset;
- domain-appropriate practice geometry;
- allowed assistance;
- verification mode;
- exit evidence;
- changed-context transfer / real-use target.

Do not default every Skill to reading + quiz.

Examples:
- mental model → retrieve / explain / reconstruct;
- judgment → contrasted cases / decisive cues / uncertainty;
- software → build / debug / ship;
- communication → live production / real interaction;
- physical skill → embodied practice / external feedback;
- decision skill → scenarios / real decisions / later outcome review.

## 5｜Evidence and promotion

Useful evidence usually strengthens as answer leakage and familiarity fall:

```text
orientation / understood explanation
< direct clean demonstration
< changed-context transfer
< real use
< repeated stable real use
```

Not every Skill needs the top rung. The original success condition and consequence of failure determine how much evidence is enough.

Never promote capability from:
- file existence;
- page completion;
- comfortable discussion;
- same-item correction alone.

Stable evidence exits cheaply.

Wrong / Uncertain should trigger only the smallest responsible Repair. A later transfer check exists only when it can change a real future decision.

## 6｜Discussion channel

After learner content, Kian may bring questions, objections, personal examples or alternative interpretations back to Chat.

This is optional.

Use discussion to:
- resolve genuine conceptual friction;
- test whether the model fits Kian's reality;
- discover a missing distinction;
- improve learner Content;
- form a Repair hypothesis.

Do not:
- force Socratic conversation after every page;
- treat discussion itself as verification;
- leak protected Verify answers through hints;
- turn curiosity into review debt.

## 7｜Maintenance

Do not automatically create spaced review for every Skill.

Add maintenance only when:
- the capability decays without use;
- future failure is costly;
- real use is too infrequent to maintain it naturally;
- or evidence shows regression.

If ordinary real use maintains the capability, real use is the maintenance plan.

## 8｜Resume

A fresh learner entry should answer cheaply:
- what this Skill is for;
- what the current learner asset is;
- what has been visited / explicitly read;
- what to do next.

Do not require repo knowledge.

## 9｜Stop rule

FAIL when the Skill becomes:
- a second textbook without learner value;
- a status dashboard;
- an engagement feed;
- a mandatory logging ritual;
- a universal quiz engine;
- a Skill-specific frontend without a real geometry need;
- a reason to keep engineering after the bottleneck is actual practice.

The intended product shape is:

> prepared Content → clear Visual → appropriate Practice / Verify → Evidence-guided Repair → Real Use.
