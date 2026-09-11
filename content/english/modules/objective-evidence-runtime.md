# English Objective Evidence / Transfer Runtime v1

**Status:** CURRENT v1  
**Established on:** 2026-09-12  
**Scope:** shared post-attempt evidence, Chat return, and transfer-claim semantics for Cloze, Reading A, and Reading B.  
**Parent authority:** `content/english/modules/objective-runtime.md`.

This file operationalizes the frozen Objective Runtime. It does not change the frozen cognitive objects or the frozen passage/set-level review rule.

---

## 1｜Core rule

> **A question is an evidence event. A repair thread / transfer claim is the tracked learning object.**

Therefore:

- one wrong question does not imply one weakness;
- several wrong questions may belong to one repair thread;
- a repaired historical question is not itself the object that needs future spaced repetition;
- only a reusable ability/procedure claim that still needs proof should remain `TRANSFER_PENDING`.

The learner-facing review unit remains one complete passage / set.

---

## 2｜Evidence / review flow

```text
PASSAGE_OR_SET_ATTEMPT
↓
PASS
or
REPAIR_NEEDED
↓
PASSAGE_OR_SET_CHAT_PACKET
↓
WHOLE_UNIT_DIAGNOSIS
↓
0..n REPAIR_THREADS
↓
route each thread
├─ Lexical ability owner
├─ Reading ability owner
└─ task-specific procedure owner
↓
repair completed
↓
only justified reusable task-specific claims become TRANSFER_PENDING
↓
later fresh passage/set packet carries active claims back to Chat
↓
Chat judges whether the fresh material is relevant transfer evidence
↓
TRANSFER_PENDING / CLOSED / REOPENED
```

The browser must not infer semantic mastery merely from `N correct attempts`.

---

## 3｜Repair thread

A **repair thread** is the smallest sufficient unit that explains and repairs one meaningful failure.

Canonical fields:

- `threadId` — local ID within one review return;
- `scope` — `local | shared | coupled | structure`;
- `itemIds` — question / blank / placement IDs that supply evidence;
- `route` — `lexical | reading | cloze | reading_a | reading_b`;
- `summary` — concise statement of the first meaningful failure and repair.

Rules:

- dependent/cascading items belong to the same thread when one cause explains them;
- Reading B swaps/cascades should normally be coupled or structure threads rather than duplicated local threads;
- Cloze blanks sharing one sentence/discourse or lexical cause may be one shared thread;
- Reading A questions sharing one passage representation or evidence-boundary failure may be one shared thread;
- threads routed to Lexical or Reading do not create duplicate objective-task memory objects.

---

## 4｜Task-specific transfer claim

A **transfer claim** is a reusable task procedure that has been repaired but is not yet proven on sufficiently fresh evidence.

Examples:

- Cloze: “when two near-synonyms both fit rough Chinese meaning, test construction/collocation before choosing”;
- Reading A: “for scope-shift distractors, explicitly compare quantifier/scope before accepting paraphrase”;
- Reading B: “after a locally plausible placement, verify forward fit and the remaining global candidate map”.

Do **not** create a task claim for:

- a one-off mistake with little future value;
- a lexical sense / phrase / construction that belongs to LexicalOS;
- a sentence/discourse representation deficit that belongs to Reading;
- a vague label such as “be more careful”;
- every wrong item merely because it was wrong.

A task claim should exist only when future unseen execution is worth checking.

---

## 5｜Why transfer closure remains Chat-mediated

The static learner runtime can reliably know:

- what passage/set was attempted;
- answers, outcomes, uncertainty, and trajectory;
- formal answers after the answer gate;
- canonical source/task metadata that already exists.

It generally cannot reliably know whether a future Cloze blank or Part B placement presents the **same semantic opportunity** as a free-text procedure claim.

Therefore Current must not fake automatic closure by rules such as:

- “three later correct passages = mastered”;
- “one full-score set = close every pending claim”;
- “same task section = relevant transfer opportunity”.

Instead, active claims are carried into later passage/set Chat packets. Chat decides whether the new material actually tests the same behavior and whether the evidence is strong enough to close or reopen the claim.

This keeps the strongest evidence as real transfer rather than item repetition or arbitrary counters.

---

## 6｜Private Transfer Claim Store

Transfer claims are personal learner state and must remain private/device-local by default.

Canonical browser key:

`kianos-english-objective-transfer-claims-v1`

Shared GitHub Current must never contain the learner’s personal claims, answers, errors, timestamps, or closure history.

A stored claim should preserve at minimum:

- `claimId`;
- `task` — `cloze | reading_a | reading_b`;
- `statement`;
- `status` — `TRANSFER_PENDING | CLOSED`;
- source passage/set ID;
- source repair thread / item IDs when available;
- creation/update timestamps;
- compact transfer-history events when Chat later updates the claim.

The runtime may retain CLOSED claims as bounded private history, but only active `TRANSFER_PENDING` claims should be placed into future handoff packets.

Legacy Reading A question-level `WATCH` signals are not canonical transfer claims and must not be automatically migrated into this store.

---

## 7｜Review Return Packet v1

After reviewing one passage/set, Chat should append one machine-readable return block when the learner wants the website to retain review/transfer state.

Marker:

`KIANOS_OBJECTIVE_RETURN_V1`

JSON schema shape:

```json
{
  "schema": "kianos.english.objective_review_return.v1",
  "task": "cloze",
  "objectId": "stable-set-id",
  "threads": [
    {
      "threadId": "t1",
      "scope": "shared",
      "itemIds": ["q3", "q7"],
      "route": "reading",
      "summary": "one sentence-relation misunderstanding explains both blanks"
    }
  ],
  "newClaims": [
    {
      "claimId": "optional-stable-id",
      "sourceThreadId": "t2",
      "statement": "check the decisive construction before choosing between near-synonyms"
    }
  ],
  "claimUpdates": [
    {
      "claimId": "existing-claim-id",
      "status": "CLOSED",
      "evidence": "fresh set directly tested the same decision and execution was stable"
    }
  ]
}
```

### Return rules

- `threads` represent whole-unit diagnosis, not one automatic thread per wrong item;
- `newClaims` contains only task-specific reusable procedure claims justified by the repair;
- lexical/reading routes may appear in `threads` but must not be duplicated in `newClaims`;
- `claimUpdates` may reference only active claims supplied in the incoming packet;
- allowed update decisions are `TRANSFER_PENDING`, `CLOSED`, or `REOPENED`;
- `CLOSED` requires relevant fresh transfer evidence, not merely correction of the source item;
- `REOPENED` means later strong fresh evidence materially contradicts a previously closed/assumed-stable claim;
- if the current fresh set does not actually test a pending claim, leave it unchanged rather than manufacturing evidence.

The learner may paste the whole Chat response into the importer; the runtime should extract the marked JSON block rather than requiring manual editing of JSON.

---

## 8｜Future handoff behavior

A normal problem passage/set packet includes active task claims after the attempt evidence.

When the learner submits a clean passage/set:

- if there are no active task claims, stable PASS should remain low-friction and no Chat handoff is required;
- if active task claims exist, the surface may expose one quiet **transfer-check handoff**;
- using that handoff is optional and exists only to let fresh material test unresolved claims;
- do not turn every clean passage into compulsory review.

Incoming packet modes may therefore be:

- `REVIEW` — current passage/set contains wrong/unanswered/uncertain evidence;
- `TRANSFER_CHECK` — current passage/set is clean but active claims may be testable;
- `REVIEW_AND_TRANSFER_CHECK` — both are true.

---

## 9｜Relationship to Reading A legacy runtime

Reading A previously maintained question-level `WATCH` signals derived from per-question local repair choices and automatically matched later question metadata.

Under Objective Runtime v1:

- question-level evidence remains useful;
- local repair controls may remain available after whole-passage diagnosis;
- **durable transfer state must move to claim-level tracking**;
- the old question-level WATCH store is legacy private state and is not a Current authority;
- Current learner pages should stop creating/updating that legacy WATCH store once the claim-level runtime is active.

This change does not invalidate useful historical attempts; it only stops treating one question as the durable mastery object.

---

## 10｜Closure principle

> **The client stores state; Chat adjudicates semantic transfer; fresh real tasks provide the evidence.**

The runtime should optimize for minimal learner friction:

- no manual taxonomy per question;
- no mandatory claim creation;
- no permanent wrong-question bank;
- no arbitrary “3 PASS = mastery” counter;
- no need to send stable clean work to Chat unless an unresolved claim makes transfer checking useful.
