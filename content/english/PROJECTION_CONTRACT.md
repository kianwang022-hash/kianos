# English Projection Contract

Role: learner-facing projection contract for the English lane.

This file adapts Kian's explicitly authorized Cognition interaction principles to English without creating a runtime dependency on the cognition repository. English learning semantics remain owned by `content/english/LEARNING_CONTRACT.md`; this contract only governs how those semantics are projected into learner-facing UI.

## 1. Projection follows capability logic

English is projected from its capability architecture, not from repository folders or exam section names.

Primary learner model:

```text
Lexical access
Reading representation / judgment
Translation reconstruction
Writing generation
```

Task-specific trainers such as Cloze and Part B remain subordinate to the capability they train. They may have dedicated workspaces because their cognitive objects differ, but they must not become peer top-level product lanes merely because the exam gives them separate section labels.

Repository structure, content headings, acceptance gates and page structure are different things.

> Content structure != page structure.

The UI should reveal the next useful learning action, not mirror every canonical owner.

## 2. Resume before browse

Default learner entry should answer, in this order:

1. What should I continue now?
2. Which capability am I training?
3. If I am stuck, where is the smallest useful repair surface?
4. Only then: what else exists?

Catalogs and complete maps remain available, but should not dominate the first screen.

## 3. Progressive disclosure

Before a clean attempt, protect first-attempt evidence and unseen diagnostic capital.

After an attempt:

- stable correct / strong work should pass with very little UI;
- wrong, uncertain, fragile or diagnostically valuable work may expand;
- diagnosis should expose only the information needed for the next action;
- repair should return to re-execution rather than end in passive explanation;
- transfer targets stay hidden before the fresh attempt when revealing them would cue the answer.

Construction metadata, gate codes, hashes, source gaps and acceptance details belong in developer/current surfaces unless they materially change the learner's next action.

## 4. Dense Calm

English uses a calm workbench rather than a marketing page or a wall of cards.

Target feel:

> medium-high information density + comfortably readable type + strong hierarchy + restrained visual noise + low-friction actions

Do not implement generic minimalism as tiny text plus empty space. Do not implement readability as oversized cards, headings or padding.

### Wide-screen rule

Readable does not mean oversized.

On Mac / landscape / wide screens, additional width should primarily buy:

- parallel context;
- visible relationships;
- passage + questions;
- source + reconstruction;
- plan + draft / revision;
- context rails or navigation when useful.

It should not proportionally enlarge font size, cards, spacing or hero blocks.

Use bounded scale:

- work-area H1: about 28–34 px;
- ordinary body: about 15–18 px depending on task;
- long English reading body: about 17.5–18.5 px with a bounded reading measure;
- dense metadata may be smaller but must not carry primary learning meaning.

## 5. Capability-specific workspaces

Shared chrome is allowed; learning interactions are not forced into one template.

### Reading

Primary object: text representation -> decisive evidence -> option adjudication.

Use wide screens for passage/question parallelism. Keep the passage measure bounded; do not stretch prose across the entire display.

### Translation

Primary object: English representation -> relation preservation -> Chinese reconstruction.

The learner should be able to keep source, preserved first attempt and current reconstruction mentally or visually connected. Reference material appears only when allowed by the evidence stage.

### Writing

Primary object: task constraints -> content -> structure -> English realization -> control -> timed delivery.

Preserve first planning/draft evidence. Do not let model output become the center of the workspace.

### Lexical

Primary object: fast, correct contextual access.

Optimize retrieval, discrimination and later contextual validation rather than dictionary accumulation.

### Cloze / Part B

Dedicated trainer surfaces are justified by their distinct decision problems, but remain visibly part of English rather than separate product domains.

## 6. Evidence without dashboard theater

Evidence exists to improve diagnosis and transfer decisions, not to make the learner stare at system state.

Learner-facing state should prefer plain next-action language such as:

- Continue
- Clean Attempt
- Review needed
- Repair
- Try again
- Fresh validation pending

Internal S/K/L/P/R/E acceptance status, source hashes and other construction diagnostics remain accessible through Current/system surfaces, not primary learning cards.

## 7. Interaction quality test

A learner-facing element earns its place only if it does at least one of the following:

- clarifies the current capability or next action;
- reduces friction in a high-value learning action;
- preserves evidence needed for diagnosis;
- enables a better repair or fresh transfer test;
- helps the learner understand where the ability process broke.

Otherwise remove, collapse or move it out of the primary surface.

## 8. Non-goals

This contract does not:

- rewrite English source/content owners;
- change accepted answer/evidence semantics;
- merge different cognitive objects into one generic page;
- create a second learner-state database;
- force every Cognition feature into an exam workflow.

Cognition supplies design constraints. English remains the domain owner.