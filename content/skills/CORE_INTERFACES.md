# Core Skill Interfaces

Status: CURRENT  
Role: bounded cross-Skill ownership / handoff map for mature foundational Skills.

Scope of this pass:
- `decision-quality`
- `information-research`
- `adaptive-learning`

This file is **not** a learner book, not a new acceptance system and not a giant ontology.

It records only concepts and handoffs that survived comparison across multiple mature Skills.

---

## 1｜Three distinct owners

### Decision Quality owns

Questions such as:

- What am I actually deciding?
- Which goals / constraints / tradeoffs matter?
- Which alternatives are real?
- How much uncertainty is acceptable?
- Would another piece of information plausibly change the action?
- When is analysis enough and commitment appropriate?
- After the outcome, what should update in the decision model?

Decision does **not** own source validation or skill formation.

### Information Research owns

Questions such as:

- What information task follows from the question?
- Where does a claim actually come from?
- How strong is the evidence for this claim?
- Is it current and applicable to this population / context / time?
- How should conflicting evidence be synthesized?
- Which AI-produced statements must be checked against real sources?

Research does **not** decide the user's values / tradeoffs and does not turn accepted knowledge into trained capability.

### Adaptive Learning owns

Questions such as:

- Is this capability worth forming, and what would “enough” look like?
- What already exists in the learner and what gap is actually blocking performance?
- What practice geometry matches the target capability?
- How should accepted Source be reconstructed into callable Knowledge?
- What performance would demonstrate the capability?
- Does it transfer under changed context and real use?
- When should learning stop expanding and move into use?

Learning does **not** certify the underlying claim / Source and does not own cross-goal resource allocation once the question becomes “is more investment still worth it?”

---

## 2｜Reusable concepts that are genuinely shared

These concepts recur across the mature Skills, but their **owner-specific meaning must remain visible**.

### A. Start from the real question / demand

Do not begin from a method, course, source or tool.

- Decision: what choice is actually being made?
- Research: what information would answer the real question?
- Learning: what capability is actually worth possessing?

### B. Define “enough” before the system expands

Open-ended search, analysis and learning all grow without a stop condition.

But “enough” is owner-specific:

- Decision: enough to act responsibly under the remaining uncertainty.
- Research: enough credible / applicable evidence for the current question.
- Learning: enough capability for the target success condition.

Do not collapse these into one generic completion score.

### C. Separate input quality, capability quality and action quality

These are different failure surfaces:

```text
credible Source / evidence
≠
callable learner capability
≠
good decision under real goals and uncertainty
≠
good outcome
```

A strong source can be misunderstood.
A strong capability can be applied to the wrong goal.
A good decision can still have a bad outcome.

### D. Keep assistance semantics visible

AI / tools may lower execution cost without proving native capability or removing human judgment.

The relevant question is not “AI or no AI”, but:

- what may be delegated;
- what must remain independently verifiable;
- what minimum autonomous judgment is required because consequences are high, verification is hard or errors are hard to reverse.

### E. Route failure to the earliest responsible owner

When something fails, do not restart the whole system.

Examples:

- wrong / stale / unsupported claim → Research;
- correct input but learner cannot explain / perform / transfer → Learning;
- evidence and capability are adequate but action framing / tradeoff is wrong → Decision;
- outcome surprises despite a reasonable process → inspect which model assumption actually changed before rewriting everything.

Repair the smallest object that would change the next action.

### F. Reality updates models, but does not erase process distinctions

Real use / outcomes may reopen any owner.

However:

- outcome quality is not identical to decision quality;
- one successful use is not stable capability;
- one new paper is not the whole evidence state;
- one anecdote does not become a universal rule.

---

## 3｜Conditional handoffs

There is no mandatory linear pipeline.

Use the smallest path that the real problem needs.

### Decision → Research

Route to Research when a missing fact / probability / mechanism / current condition could materially change the choice.

Return to Decision when the evidence is good enough for the decision at hand.

### Decision → Learning

Route to Learning when the chosen path requires a capability Kian does not yet possess at the required level.

Return to Decision when the question becomes whether additional time / money / attention spent on improving that capability is still worth its opportunity cost.

### Research → Learning

Research establishes the best currently accepted input.

Learning reconstructs that input into a usable mental / procedural capability when the user actually needs to know or perform it.

If reconstruction exposes a missing source, unresolved contradiction, stale claim or weak evidence, reopen Research.

### Learning / Research → Decision

Neither Research nor Learning should silently turn “what appears true” or “what I can do” into “what I should choose”.

Values, alternatives, downside, opportunity cost and commitment remain Decision work.

### Real use → earliest responsible owner

Observed failure or surprise routes back only where the new evidence belongs:

```text
source / evidence problem → Research
capability / transfer problem → Learning
framing / tradeoff / action-threshold problem → Decision
```

---

## 4｜What this pass deliberately does NOT extract

Do not promote the following into shared laws merely because several books mention them:

- one universal seven-step sequence;
- one universal evidence ladder for every domain;
- one mandatory baseline test;
- one standard practice format;
- one generic “confidence score” across Research, Learning and Decision;
- one shared frontend workflow;
- one master ontology of every concept in every Skill.

The books remain independently useful.

Shared structure exists only where reuse reduces future duplication or owner confusion.

---

## 5｜Rule for future Skills

A new Skill may reuse these interfaces when relevant, but must still answer:

```text
What is this Skill's unique capability?
Which shared owner supplies upstream input?
Which owner receives downstream output?
What remains domain-specific and must not be abstracted away?
```

Do not copy full chapters from Decision, Research or Learning into a domain Skill.

Reference the upstream capability and teach only the domain-specific transformation.

---

## 6｜Reopen rule

Reopen this file only when:

- another mature Skill reveals a repeated concept that genuinely changes authoring or routing;
- an existing interface causes concrete duplication or ownership conflict;
- real learner use shows that the current boundary is wrong.

Do not reopen because a larger taxonomy can be imagined.
