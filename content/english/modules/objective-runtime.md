# English Objective Runtime v1 — FROZEN

**Status:** FROZEN  
**Frozen on:** 2026-09-12  
**Scope:** English I objective-task runtime shared by Cloze, Reading A, and Reading B.  
**Parent authority:** `content/english/LEARNING_CONTRACT.md`.

This file is the canonical Current owner for cross-task objective-runtime semantics. Task/module contracts may extend it with task-specific cognition or UI, but must not override the frozen rules below without new learner evidence and an explicit re-freeze.

Where older generic/module wording appears to describe a question-level “review object”, interpret that only as an **internal repair slice**. It does not change the user-facing review unit defined here.

---

## 1｜Architecture

English is organized around four capability lines plus task-specific trainers.

### Capability lines

- **Lexical** — rapid, correct access to words, senses, phrases, constructions, contrasts, and confusables in context.
- **Reading** — build an accurate language/discourse representation that supports correct judgment.
- **Translation** — reconstruct an understood English representation into faithful, natural Chinese while preserving information and relations.
- **Writing** — actively generate acceptable English from task constraints under exam conditions.

### Objective-task trainers

- **Cloze** — best-fit decision under slot constraints.
- **Reading A** — evidence-based option adjudication after comprehension.
- **Reading B / Part B** — discourse reconstruction and cohesion-based placement/matching.

These trainers do not own duplicate lexical or reading knowledge systems. When the first meaningful failure belongs to Lexical or Reading, route it back to that canonical ability owner.

Writing A / Writing B are output modes inside Writing rather than separate base abilities.

---

## 2｜Shared Objective Decision Runtime

All three objective trainers share the same abstract decision runtime:

```text
input
→ infer target / demand
→ form candidate hypotheses
→ test against evidence / constraints
→ adjudicate
→ answer + confidence
→ diagnose only when needed
→ smallest sufficient repair
→ later unseen transfer evidence
```

The task-specific parameterization is:

| Trainer | Target / demand | Candidates | Decisive evidence |
| --- | --- | --- | --- |
| Cloze | what the slot requires | four lexical/expression candidates | lexical/collocational, syntactic, sentence-semantic, inter-sentence, global-discourse constraints |
| Reading A | what the question actually requires | four propositions/options | passage evidence + inference boundary + option contrast |
| Reading B | what structural/discourse role is missing | candidate sentence/paragraph/title/placement | backward fit + forward fit + cohesion + discourse role + global consistency |

---

## 3｜Frozen review-unit rule

> **Training evidence may be item-level; learner–Chat review is passage/set-level.**

Equivalent rule:

> **Evidence granularity may be smaller than Review granularity.**

The normal user-facing minimum review unit is:

- **Cloze:** one complete cloze passage / its full question set;
- **Reading A:** one complete reading passage + all questions belonging to that passage;
- **Reading B:** one complete Part B material/set.

The learner is not expected to enter Chat and review Q1, then Q2, then Q3 as separate conversations.

Question / blank / placement objects remain valid **internal evidence and diagnosis units**. The runtime may record answer, correctness, uncertainty, answer trajectory, candidate competition, or local repair evidence per item. Chat should first inspect the passage/set as one attempt, then decide whether several wrong items share one root cause, whether some are dependent/cascading errors, and what the smallest sufficient repair scope is.

For Reading B especially, repair scope may be:

1. **Local** — one placement and its minimum before/after context;
2. **Coupled** — two or more positions/candidates whose relationship caused the error;
3. **Structure-level** — the passage/discourse skeleton when one structural misunderstanding generated multiple downstream errors.

Dependent errors must not be counted as independent weaknesses merely because several answer slots are wrong.

---

## 4｜Objective runtime state machine

```text
ATTEMPT
↓
PASS
or
REPAIR_NEEDED
↓
ROOT_CAUSE
├─ Lexical
├─ Reading / comprehension / discourse representation
└─ task-specific decision procedure
↓
REPAIR
↓
TRANSFER_PENDING
↓
later fresh / unseen evidence
↓
CLOSED
```

Rules:

- same-item correction is repair evidence, not mastery;
- a wrong item does not automatically become long-term memory;
- a one-off hesitation does not automatically become a durable weakness;
- later success on genuinely fresh material is stronger evidence than repeated success on remembered material;
- closure should follow sufficient transfer evidence, not arbitrary spaced repetition of the same old item.

---

## 5｜Cloze v1

### Cognitive object

> **Slot Constraint → Best Fit**

Operational path:

```text
context
→ infer slot demand before relying on options
→ identify active constraints
→ compare the genuinely competing candidates
→ find the decisive constraint
→ choose best fit
```

High-value constraints may be lexical/collocational, syntactic/constructional, sentence-semantic, inter-sentence relational, or global-discourse constraints.

A Cloze repair should not default to explaining all four words. The valuable diagnostic question is usually:

> What did this slot require, and which constraint actually separated the competing candidates?

### Root-cause routing

- unknown sense / phrase / construction / collocation / confusable → **Lexical**;
- sentence/discourse relation was not represented correctly → **Reading**;
- representation was available but best-fit comparison procedure failed → **Cloze task-specific repair**.

### Memory admission

Do not create a permanent Cloze mistake bank by default. Durable future work should be admitted only when it exposes:

- a reusable lexical object;
- a recurring comprehension/representation failure;
- a repeated Cloze procedural failure whose transfer remains weak.

Task-specific procedural claims live as temporary **TRANSFER_PENDING** evidence and should disappear after later unseen success.

---

## 6｜Reading A v1 relationship

### Cognitive object

> **Comprehension → decisive evidence → option adjudication**

Reading A remains governed by its module contract for task-specific interaction, but this file controls the cross-task runtime and review-unit semantics.

The learner completes the passage before review. Internal question-level evidence may be used to locate local failures, but Chat review begins from the complete passage attempt and merges shared causes/dependencies before deciding repair scope.

A remembered old question answered correctly is weak mastery evidence; later correct reasoning on fresh material is stronger.

---

## 7｜Reading B / Part B v1

### Cognitive object

> **Discourse Reconstruction**

Operational path:

```text
build rough discourse skeleton
→ infer the missing/required role at each position
→ compress candidates by discourse role
→ test backward fit
→ test forward fit
→ test cohesion evidence
→ reconcile globally
```

Local keyword overlap is evidence, not authority. A candidate may fit one adjacent sentence yet still be wrong because its discourse role or global placement is wrong.

Because one early placement can distort later candidate relationships, Part B diagnosis must support dependency/cascade analysis rather than treating every wrong slot as an independent weakness.

Long-term review should target reusable lexical/reading objects or a genuinely recurring Part B procedure failure, not memorization of one historical ordering.

---

## 8｜Evidence hierarchy

A useful cross-objective ordering is:

```text
remembered answer
<
can explain the repaired known item
<
can execute the same decision rule on a targeted new contrast
<
later clean success on fresh material
<
repeated independent transfer across unseen contexts
```

The exact evidence object may differ by task, but the direction is frozen:

> **later unseen transfer > repeated local success**

---

## 9｜Relationship to Translation and Writing

This Objective Runtime does **not** govern Translation/Writing cognition. They inherit the common rules from `content/english/LEARNING_CONTRACT.md`, including:

- ability formation before material/UI organization;
- Clean Attempt before diagnosis;
- preserve first meaningful evidence rather than only polished output;
- begin repair at the first meaningful failure;
- smallest sufficient repair;
- `correct once ≠ mastery`;
- later fresh transfer as stronger evidence;
- selective memory admission rather than storing every observed problem;
- lexical failures route to LexicalOS rather than duplicate local word systems;
- module-specific cognitive objects and non-isomorphic UI.

Translation then applies its own canonical module contract at `content/english/modules/translation.md`.

Writing currently inherits the common Learning Contract directly until a Writing-specific module contract is frozen. Its future module contract may extend common rules for Writing A/B, but must not redefine the shared English learning philosophy merely to create a separate system.

---

## 10｜Do not reopen casually

This v1 is frozen as the objective-task baseline.

Do not reopen it because a UI component is inconvenient, because one source/book uses a different taxonomy, or because each exam section appears separately on the paper.

Reopen only when new learner evidence materially contradicts the frozen model. Implementation work should adapt to this semantic baseline, not silently mutate it.
