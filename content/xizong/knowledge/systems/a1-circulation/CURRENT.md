# Xizong A1 Circulation Current

Role: independently continued Xizong System Work Cursor + restart entry  
Parent: `content/xizong/CURRENT.md`

This file does not own medical Core, lane learning semantics, Acceptance Truth, or Kian's learner progress.

---

## Work Cursor

**Scope:** A1 — Circulation  
**Active engineering stage:** fresh **Runtime Loop** re-acceptance  
**Blocker:** none upstream; second executed browser run required after one Runtime closure defect was repaired  
**Next action:** rerun the standard Xizong QA browser journey against the repaired Logic Group closure semantics. If the full real-browser journey passes, close R and activate E. Do not perform U.

Current fresh progress:

```text
S        RE-ACCEPTED
K        RE-ACCEPTED after semantic repair
L        RE-ACCEPTED
Content  CLOSED
P        RE-ACCEPTED after Projection repair
R        ACTIVE — one executed defect repaired; verification rerun next
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

### First real-browser run

QA #352 / run `34769191043` reached the Runtime journey after all static/shared regressions and the Astro build had passed.

The browser journey successfully proved, in order:

- clean Block starts at orientation with no manufactured completion;
- Block → Logic Group → group-level original-Lecture stage transitions;
- entering a Logic Group creates no learning evidence;
- early KP Recall navigation is rejected;
- early `Reveal Core` is rejected;
- confirming one Logic Group's original-Lecture contact marks only that group's KPs (`4/19` in B2) learned;
- learned KP reveal becomes available;
- first Recall evidence persists;
- refresh restores mid-group Recall state;
- the first Logic Group closes after Recall;
- early Block Recall after only one Logic Group is rejected;
- completing all Logic Group UI transitions releases Block Recall.

The run then exposed a real Runtime gap before R could PASS:

> Group closure was triggered by **rating the final-position KP**, not by proving **every KP in that Logic Group had Recall evidence**.

This meant arrow navigation could theoretically skip a middle KP and still close the group by rating the final KP.

### Runtime repair

The shared `XizongBlockV6.astro` transition now uses:

```text
rate current KP
→ search current Logic Group for first KP with no Recall rating
→ if one exists: return to that first gap
→ only when none remain: enter group_close
```

The same bounded repair also improved the browser evidence report to print learned / recalled totals and missing KP IDs on failure.

Repair commit landed on main as:

`83b2ffbd313557451e4ec8fb454236d331b160d4` — `xizong: require complete Logic Group recall before closure`

The one-off repair workflow has been retired. The normal QA/browser journey is now the only verification path.

---

## R fresh-audit contract

The verification rerun must still prove the complete path:

1. clean Block with zero manufactured progress;
2. Logic Group entry without implicit learning evidence;
3. early KP Recall / Reveal rejection;
4. current-group-only formal Lecture contact;
5. **all-KP evidence required before Logic Group closure**;
6. refresh/resume preserving stage/group/KP state;
7. full-Block Recall gate;
8. Block completion requiring original-Lecture confirmation + KP Recall + Block Recall;
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
→ if FAIL: smallest responsible runtime owner
```
