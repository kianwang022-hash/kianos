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

## 2｜Content / Visual / Runtime

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

## 3｜Verification

Teaching and verification must be separable when answer exposure would contaminate evidence.

Evidence strength generally rises as familiarity falls:

```text
same-item correction
< changed-context success
< repeated stable real-use performance
```

Stable evidence exits cheaply.

Wrong / Uncertain does not automatically create a large review queue. Chat should choose the smallest responsible Repair.

## 4｜Source rule

Use the smallest source set that is strong enough for the decision.

More citations do not automatically improve the Skill.

High-consequence claims require stronger Source and a higher human judgment floor.

## 5｜Resume

A fresh learner entry should answer cheaply:
- what this Skill is for;
- what the current learning asset is;
- what has been visited/completed locally;
- what to do next.

Do not require repo knowledge.

## 6｜Anti-overengineering

FAIL when a Skill becomes:
- a second textbook without learner value;
- a status dashboard;
- an engagement feed;
- a mandatory logging ritual;
- a Skill-specific frontend implementation without a real geometry need;
- a reason to keep engineering after the bottleneck is actual practice.

The generic success shape is:

> prepared Content → clear Visual → protected Verify / Real Use → Evidence-guided Repair.
