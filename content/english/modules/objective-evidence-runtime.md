# English Objective Evidence / Transfer Runtime v2

**Status:** RE-ACCEPTED LOGIC CANDIDATE  
**Scope:** optional deep-review evidence and backend transfer semantics for Cloze, Reading A, and Part B.  
**Parent authority:** `content/english/modules/objective-runtime.md`.

## 1. Core rule

> **A question is evidence. A repair thread exists only when deep review needs one. A transfer claim exists only when later observation is worth its future cost.**

Therefore:

- one wrong question does not imply one weakness;
- a quick one-off correction may end with no repair thread at all;
- several wrong items may share one thread;
- several genuinely independent high-value failures may remain separate;
- diagnosis is not completed repair;
- same-item correction is not mastery;
- pending backend state does not create learner work by itself.

## 2. Evidence flow

Default:

```text
ATTEMPT
→ PASS
or
→ FAST TRIAGE
   → QUICK_RESOLVED → next performance
   or
   → OPTIONAL DEEP REVIEW
      → 0..n repair threads
      → smallest repair / re-execution where useful
      → optional backend transfer claim
      → return to performance
```

Later normal work may opportunistically support, contradict, or leave a claim untouched.

There is no default `clean + pending claim → transfer-check task` path.

## 3. Repair thread

When deep review is justified, a repair thread may preserve:

- `threadId`;
- `scope` — `local | shared | coupled | structure`;
- `itemIds` supplying evidence;
- `route` — lexical / representation / task-specific;
- concise failure summary;
- current transport field `repairCompleted` for whether learner re-execution actually occurred;
- current transport field `repairEvidence` for concise learner repair evidence when it did.

These field names are the current private handoff interface, not evidence that every miss must create a thread.

Compatibility note: current runtime may still encode shared Representation as route `reading`. Treat that label as an implementation alias, not a distinct canonical Reading course.

Rules:

- no thread is required for an error that was cheaply understood and has no durable value;
- dependent/cascading items should share a thread;
- genuinely independent high-value problems may remain separate;
- `repairCompleted=true` requires learner action when the repair claim depends on re-execution;
- LexicalOS / shared Representation failures must not create duplicate objective-task memory objects.

## 4. Task-specific transfer claim

A transfer claim is backend private state for a **reusable task-specific procedure** that:

1. was exposed by real evidence;
2. was actually repaired;
3. still has meaningful uncertainty;
4. is important enough that later evidence could change study allocation;
5. is not better owned by LexicalOS or shared Representation.

Do not create one for:

- one-off error already understood;
- diagnosis without repair;
- lexical or representation knowledge;
- vague carelessness labels;
- cosmetic procedure preferences;
- every wrong item.

`newClaims` may reference only a task-specific completed repair thread with non-empty repair evidence.

## 5. Pending means dormant observation, not scheduled work

`TRANSFER_PENDING` means:

> if a later normal task genuinely tests this procedure, the result is useful evidence.

It does **not** mean:

- show a learner panel now;
- choose a fresh item just to test it;
- block progression;
- create an overdue queue;
- require Chat on an otherwise clean attempt.

This is the key burden boundary.

## 6. Transfer closure remains semantic

The client can store attempts and evidence boundaries, but it generally cannot know whether a later item tested the same semantic procedure.

Therefore:

- do not auto-close by count;
- do not close every claim after one full-score set;
- same section does not imply same transfer opportunity;
- when a deep review packet already exists for another real problem, relevant pending claims may be included opportunistically for Chat judgment;
- unrelated pending claims remain invisible and unchanged.

## 7. Private store

Canonical browser key may remain:

`kianos-english-objective-transfer-claims-v1`

Shared GitHub Current never stores personal learner claims, answers, errors, timestamps, or closure history.

A claim may preserve:

- `claimId`;
- task;
- statement;
- status;
- source task object / repair evidence;
- bounded later evidence history.

Legacy Reading A question-level WATCH state is non-canonical and must not return to the learner path.

## 8. Handoff snapshot

When the learner **chooses optional deep review**, copying a passage/set packet may create a private snapshot:

`kianos-english-objective-handoff-v1:<task>:<objectId>`

It may authorize only the claim IDs actually included in that packet and protects against stale/unrelated return blocks mutating private state.

The snapshot is an evidence boundary, not a learner milestone.

## 9. Review Return Packet

Marker may remain:

`KIANOS_OBJECTIVE_RETURN_V1`

A return may contain:

- `threads` — only the repair threads deep review actually needed;
- `newClaims` — only justified repaired task-specific procedures;
- `claimUpdates` — only relevant claims actually supplied in the matching handoff.

Rules:

- import is idempotent;
- persistence failure must not report false success or erase the learner's pasted return;
- CLOSED requires fresh relevant evidence;
- REOPENED requires fresh contradictory problem evidence;
- unrelated claims remain unchanged;
- empty / quick-resolved triage does not need a return packet.

## 10. Future attempt behavior

After submit:

```text
clean stable → PASS
problem / meaningful uncertainty → FAST TRIAGE
```

If fast triage escalates to deep review, that packet may also carry any **actually relevant** active/reopen claims.

A clean attempt with pending claims remains clean and proceeds normally. Pending state is not sufficient reason to surface transfer UI or consume Chat time.

## 11. Closure principle

> **Preserve evidence automatically; spend learner attention only when evidence can change the next action.**

Optimize for:

- no manual taxonomy requirement;
- no mandatory claim creation;
- no permanent wrong-question bank;
- no arbitrary mastery counters;
- no clean-work Chat requirement caused by backend state;
- no future debt from diagnosis alone;
- no fresh-material consumption for bookkeeping.