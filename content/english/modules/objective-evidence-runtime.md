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
- a diagnosis is not yet a completed repair;
- a repaired historical question is not itself the object that needs future spaced repetition;
- only a reusable task procedure that has actually been repaired and still needs fresh proof may become `TRANSFER_PENDING`.

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
smallest useful repair
↓
learner re-execution / reconstruction
↓
REPAIR_COMPLETED evidence
↓
only justified reusable task-specific claims become TRANSFER_PENDING
↓
later fresh passage/set carries the unresolved claim plus enough task context back to Chat
↓
Chat judges whether the fresh material genuinely tested the same procedure
↓
TRANSFER_PENDING / CLOSED
↓
later strong fresh contradictory evidence when relevant
↓
REOPENED → TRANSFER_PENDING
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
- `summary` — concise statement of the first meaningful failure;
- `repairCompleted` — whether the learner actually completed the selected repair / re-execution;
- `repairEvidence` — concise evidence of what the learner successfully reconstructed or re-executed.

Rules:

- `repairCompleted=false` is a valid diagnosed thread; it must not be promoted into task-specific transfer debt;
- `repairCompleted=true` requires learner action, not passive explanation alone;
- dependent/cascading items belong to the same thread when one cause explains them;
- Reading B swaps/cascades should normally be coupled or structure threads rather than duplicated local threads;
- Cloze blanks sharing one sentence/discourse or lexical cause may be one shared thread;
- Reading A questions sharing one passage representation or evidence-boundary failure may be one shared thread;
- threads routed to Lexical or Reading do not create duplicate objective-task memory objects.

---

## 4｜Task-specific transfer claim

A **transfer claim** is a reusable task procedure that:

1. was exposed by real evidence;
2. was repaired through learner re-execution/reconstruction;
3. is worth checking on a genuinely new opportunity;
4. is not better owned by Lexical or Reading.

Examples:

- Cloze: “when two near-synonyms both fit rough Chinese meaning, test construction/collocation before choosing”;
- Reading A: “for scope-shift distractors, explicitly compare quantifier/scope before accepting paraphrase”;
- Reading B: “after a locally plausible placement, verify forward fit and the remaining global candidate map”.

Do **not** create a task claim for:

- a diagnosis that has not yet been repaired;
- a one-off mistake with little future value;
- a lexical sense / phrase / construction that belongs to LexicalOS;
- a sentence/discourse representation deficit that belongs to Reading;
- a vague label such as “be more careful”;
- every wrong item merely because it was wrong.

`newClaims` may reference only a task-specific repair thread with `repairCompleted=true` and non-empty `repairEvidence`.

---

## 5｜Why transfer closure remains Chat-mediated

The static learner runtime can reliably know:

- what passage/set was attempted;
- answers, outcomes, uncertainty, and trajectory;
- formal answers after the answer gate;
- canonical source/task metadata that already exists.

It generally cannot reliably know whether a future item presents the **same semantic opportunity** as a free-text procedure claim.

Therefore Current must not fake automatic closure by rules such as:

- “three later correct passages = mastered”;
- “one full-score set = close every pending claim”;
- “same task section = relevant transfer opportunity”.

A transfer-check packet must carry enough current task context for Chat to judge relevance. A compact outcome map alone is insufficient when the claim could have been tested by a stable-correct item; include the necessary prompt/options/candidate context for the fresh unit when pending claims are being evaluated.

---

## 6｜Private Transfer Claim Store

Transfer claims are personal learner state and remain private/device-local by default.

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
- source repair evidence;
- creation/update timestamps;
- compact later evidence events.

Active `TRANSFER_PENDING` claims are carried into normal future transfer-check packets. CLOSED claims may be retained as bounded private history and may be exposed only conservatively as **reopen candidates** when a later fresh attempt contains meaningful contradictory problem evidence.

Legacy Reading A question-level `WATCH` signals are not canonical transfer claims and must not be automatically migrated into this store.

---

## 7｜Handoff snapshot

Copying a whole-passage/set packet to Chat creates a private handoff snapshot for that object.

Canonical browser key pattern:

`kianos-english-objective-handoff-v1:<task>:<objectId>`

It records at minimum:

- task + objectId;
- packet mode;
- `activeClaimIds` actually supplied for possible transfer update;
- `reopenCandidateIds` actually supplied for conservative reopen consideration;
- creation time.

The importer uses this snapshot as an authorization/evidence boundary:

- a claim cannot be CLOSED merely because Chat returns a matching arbitrary ID;
- a CLOSED claim cannot be REOPENED unless it was explicitly supplied as a reopen candidate in this fresh problem packet;
- ordinary diagnosis-only returns may still save repair threads, but claim-state changes require a matching handoff snapshot.

This does not make the browser the semantic judge. It prevents an unrelated or stale return block from mutating private mastery state.

---

## 8｜Review Return Packet v1

Marker:

`KIANOS_OBJECTIVE_RETURN_V1`

Schema shape:

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
      "route": "cloze",
      "summary": "rough-meaning comparison overrode the decisive construction",
      "repairCompleted": true,
      "repairEvidence": "learner reconstructed the slot demand, named the decisive construction, and re-decided the competitor pair"
    }
  ],
  "newClaims": [
    {
      "claimId": "optional-stable-id",
      "sourceThreadId": "t1",
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
- `newClaims` requires a matching task-specific completed repair thread;
- lexical/reading routes may appear in `threads` but must not be duplicated in `newClaims`;
- repeated import of the same return must be idempotent and must not manufacture duplicate debt;
- `claimUpdates` may reference only claim IDs actually supplied by the matching handoff;
- `CLOSED` requires the claim to be pending, a different fresh object to genuinely test it, and non-empty evidence;
- `REOPENED` requires the claim to be closed, to have been supplied as a reopen candidate, a different fresh object to contain meaningful contradictory problem evidence, and non-empty evidence;
- if the current fresh set does not actually test a claim, leave it unchanged;
- a persistence failure must not silently report success, clear the learner’s pasted return text, or leave an avoidable partial mutation.

The learner may paste the whole Chat response; the importer extracts the marked JSON block rather than requiring manual JSON editing.

---

## 9｜Future handoff behavior

When the learner submits a passage/set:

- problem evidence → `REVIEW`;
- clean + active claims → optional `TRANSFER_CHECK`;
- problem evidence + active claims → `REVIEW_AND_TRANSFER_CHECK`;
- clean + no active claims → `PASS`, no Chat requirement.

For transfer checking, the packet must contain the unresolved claim plus enough fresh task context to judge whether the same behavior was actually demanded.

When a fresh problem attempt exists, the packet may additionally include a small bounded list of recent CLOSED task claims as **reopen candidates**. Their presence does not imply relevance or reopening. Chat must explicitly establish a direct contradiction before returning `REOPENED`.

---

## 10｜Relationship to Reading A legacy runtime

Under Objective Runtime v1:

- question-level evidence remains useful internally;
- whole-passage diagnosis selects the repair scope before canonical local repair is exposed;
- durable transfer state is claim-level rather than question-level WATCH;
- the old question-level WATCH store is legacy private state and is not a Current authority.

---

## 11｜Closure principle

> **The client preserves evidence boundaries; Chat adjudicates semantics; learner re-execution proves repair; fresh real tasks provide transfer evidence.**

Optimize for minimal learner friction:

- no manual taxonomy per question;
- no mandatory claim creation;
- no permanent wrong-question bank;
- no arbitrary “3 PASS = mastery” counter;
- no need to send stable clean work to Chat unless an unresolved claim makes transfer checking useful;
- no new future debt from diagnosis alone.
