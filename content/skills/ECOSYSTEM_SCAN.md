# Skill Ecosystem Scan

Status: OPTIONAL BOUNDED TOOL  
Role: reuse / build-vs-integrate check when external capability could materially change a Skill design.

## Trigger

Use this only when at least one is true:

- a mature external course / standard may already solve the learning sequence;
- a plugin / API / connected app could remove meaningful manual work;
- a mature open-source project could replace substantial native implementation;
- the domain has an authoritative professional or technical standard that should shape the product;
- reuse could materially reduce KianOS maintenance.

Do **not** run this merely because a new Skill exists.

## Small scan order

Inspect only the lanes relevant to the current decision:

1. existing connected capability;
2. mature course / textbook / benchmark;
3. official standard / first-party documentation;
4. high-quality scientific or professional evidence;
5. mature open-source implementation;
6. reusable KianOS / Personal pattern.

## Decision

Preserve only candidates that change design:

```text
Candidate:
Capability solved:
Decision: ADOPT | INTEGRATE | ADAPT | LEARN_FROM | IGNORE
Why:
Maintenance consequence:
```

## Stop

Stop when further search would not change the learner design or build-vs-reuse decision.

The goal is not an ecosystem catalog. The goal is to avoid rebuilding mature capability when reuse is genuinely cheaper.
