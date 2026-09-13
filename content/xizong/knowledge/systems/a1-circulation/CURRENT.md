# Xizong A1 Circulation Current

Role: independently continued Xizong System Work Cursor + restart entry  
Parent: `content/xizong/CURRENT.md`

This file does not own medical Core, lane learning semantics, Acceptance Truth, or Kian's learner progress.

---

## Work Cursor

**Scope:** A1 — Circulation  
**Active engineering stage:** fresh **Runtime Loop** re-acceptance  
**Blocker:** none upstream; executed browser verification rerun required after two Runtime defects were repaired  
**Next action:** run the standard Xizong QA browser journey against both Runtime repairs. If the complete real-browser path passes, close R and activate E. Do not perform U.

Current fresh progress:

```text
S        RE-ACCEPTED
K        RE-ACCEPTED after semantic repair
L        RE-ACCEPTED
Content  CLOSED
P        RE-ACCEPTED after Projection repair
R        ACTIVE — two executed Runtime defects repaired; full verification rerun next
E        downstream-frozen behind R
U        real learner only / external workflow
```

> Engineering evidence must not manufacture learner progress. This Chat stops before U.

---

## P closure receipt

Fresh Projection / Interaction audit found and repaired three real learner-facing defects:

1. **KP-by-KP app switching** → replaced by Logic Group continuous original-Lecture contact followed by group Recall/closure;
2. **future-stage / answer leakage** → shared stage guard now fails closed before unearned KP Reveal/Recall, Block Recall/completion and System Recall/sweep;
3. **governance chrome on learner surface** → canonical/source/hash/current metadata remains in repository truth but is hidden from the primary Xizong learner chrome.

Durable contract: `static-web/scripts/validate-xizong-a1-projection.mjs`.

Regression reconciliation:

- QA #345: A1 fresh Projection PASS; stale A2 probe exposed;
- QA #346: A2 PASS; stale A3 probe exposed;
- **QA #347 / run `34768893981`: SUCCESS** across A1 Projection, A2/A3 shared regressions, B probes, repair inbox and Astro build.

P fresh verdict: **PASS**.

---

## R executed-browser evidence so far

Durable executable journey:

`static-web/scripts/test-xizong-a1-browser-journey.mjs`

It launches Astro preview + headless Chrome through CDP and writes `.qa/xizong-a1-browser-runtime.json`. It is part of the standard Xizong QA workflow after the Astro build.

### Browser run 1｜QA #352 / `34769191043`

The journey passed clean start, Logic Group entry, no manufactured learning, early Recall/Reveal rejection, current-group-only Lecture contact, mid-group refresh/resume, first-group closure and early Block Recall rejection.

It then exposed Runtime defect R1:

> Logic Group closure depended on rating the final-position KP rather than proving every KP in that Logic Group had Recall evidence.

Repair landed as:

`83b2ffbd313557451e4ec8fb454236d331b160d4` — `xizong: require complete Logic Group recall before closure`

Current transition:

```text
rate current KP
→ find first current-group KP without Recall evidence
→ if found: return to that gap
→ only if none remain: group_close
```

### Browser run 2｜QA #353 / `34769447361`

The repaired journey progressed further and explicitly proved:

- **19/19 B2 KPs formally contacted**;
- **19/19 B2 KPs recalled**;
- no missing Recall IDs;
- Block Recall stayed locked before all group evidence;
- Block Recall completion advanced to Block close.

It then exposed Runtime defect R2:

> `XizongBlockV6` and `XizongStudyEnhancer` both controlled the Block-complete button. The Block runtime could briefly enable completion after KP + Block Recall while `lectureRead=false`, then the enhancer disabled it on the next observer frame. Submission was still guarded, but the learner-facing affordance had a transient false-ready state.

Repair landed as:

`2e5cde38fee9d78f9a0841fa766b6d3e3696d05f` — `xizong: unify Block completion prerequisite gate`

`XizongBlockV6.canComplete()` now directly requires the same browser-local original-Lecture confirmation used by the shared guard:

```text
all KP formal learning contact
+ all KP Recall evidence
+ Block Recall complete
+ original Lecture one-pass confirmation
→ Block complete may become available
```

The one-off repair workflow has been retired. Normal QA/browser execution is the only verification path.

---

## R fresh-audit contract

The full rerun must prove the complete path without another semantic gap:

1. clean Block with zero manufactured progress;
2. Logic Group entry without implicit learning evidence;
3. early KP Recall / Reveal rejection;
4. current-group-only formal Lecture contact;
5. all-KP Recall evidence required before Logic Group closure;
6. refresh/resume preserving stage/group/KP state;
7. full-Block Recall gate;
8. Block completion requiring original-Lecture confirmation + KP Recall + Block Recall with no transient false-ready state;
9. Continue return to the last real route;
10. System Recall unavailable before all 12 Blocks and available after engineering fixture completion;
11. explicit holdout required before official System sweep;
12. malformed browser-local state falls back without manufacturing progress.

Engineering fixture state may reach late transitions, but it remains test evidence only and never becomes Kian's Learner Truth.

If the rerun finds another concrete Runtime defect, repair the smallest responsible Runtime/Projection owner and repeat. If it passes, close R and activate E.

---

## Frozen while R is active

- no medical Content rewrite without a runtime-discovered semantic contradiction;
- no visual polish expansion;
- no Question→KP inference;
- no learner-progress claims;
- no U execution;
- no unrelated sibling-System mutation except shared-runtime regression fixes strictly required by the same shared contract.

---

## Truth references

### Artifact Truth

- System owner → `content/xizong/knowledge/systems/a1-circulation/system.json`
- medical Core → `content/xizong/knowledge/systems/a1-circulation/blocks/`
- lane Learning constitution → `content/xizong/LEARNING_CONTRACT.md`
- shared policy → `content/xizong/knowledge/learner/study-policy.json`
- A1 Learning support → `content/xizong/knowledge/learner/a1-circulation-learning.json`
- learner-facing Projection/Runtime → Xizong surfaces under `static-web/`

### Acceptance Truth

`content/xizong/knowledge/systems/a1-circulation/ACCEPTANCE.md`

### Learner Truth

Private learner/browser/conversation evidence only.

---

## Fresh-Chat target

```text
A1 CURRENT
→ A1 ACCEPTANCE
→ normal Xizong QA browser Runtime journey
→ if PASS: R close → E active
→ if FAIL: smallest responsible Runtime owner
```
