# Skill Ecosystem Scan

Status: CURRENT
Role: bounded pre-build discovery contract for new Skills and material Skill upgrades.

## Why

Before KianOS creates original learner content, integrations, Visual or Runtime, it should check whether mature external capability already exists.

The goal is not “find more tools”.

The goal is:

> **reuse mature capability where it lowers attention, engineering and maintenance cost; build only the Kian-specific gap.**

## Default scan

For a new Skill, Chat should consider:

1. current connected capabilities;
2. relevant available plugins;
3. mature GitHub / open-source projects;
4. official standards / first-party docs / APIs;
5. strong scientific / professional evidence;
6. mature courses, benchmarks, templates or curricula;
7. reusable KianOS / Personal patterns.

Not every lane must be searched every time.

## Current known capability substrate

Already-available or already-integrated capability families that should be checked before building equivalents:

- GitHub + authorized desktop/terminal execution;
- Google Calendar / Gmail / Drive;
- Figma;
- Health;
- Finances;
- Quartr;
- BioRender.

High-value optional capability families discovered for future demand:

- Scite — scientific literature / citation-context intelligence;
- Wolfram — rigorous computational verification;
- PostHog — product analytics / experiments / surveys / errors;
- Expedia — live travel inventory / price / availability.

These names are examples of the current ecosystem, not frozen architecture. Future scans should discover better or more relevant options when they exist.

## GitHub search standard

When GitHub is relevant, search for the real problem rather than the Skill title alone.

Example:

```text
Need: learn and verify personal energy regulation

Bad search:
"high energy skill"

Better searches:
"fatigue self monitoring"
"sleep diary open source"
"behavior experiment tracker"
"health education interactive"
```

Evaluate the project on:
- exact problem fit;
- maintenance recency;
- docs;
- tests;
- architecture quality;
- license;
- dependency burden;
- reusable data models / validation / UX;
- whether it actually works in a comparable real context.

Stars are weak evidence.

## Decision record

Only preserve candidates that change design.

For each:

```text
Candidate:
Capability solved:
Evidence of maturity:
Decision: ADOPT | INTEGRATE | ADAPT | LEARN_FROM | IGNORE
Why:
Maintenance consequence:
```

## Hard rule

Do not build a KianOS-native substitute merely because Chat can code it.

Do not integrate a mature tool merely because it exists.

The correct outcome is the smallest capability stack that satisfies the real success condition.
