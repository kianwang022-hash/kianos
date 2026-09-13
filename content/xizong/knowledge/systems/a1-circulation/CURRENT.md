# Xizong A1 Circulation Current

Role: independently continued Xizong System Work Cursor + restart entry  
Parent: `content/xizong/CURRENT.md`

This file does not own medical Core, lane learning semantics, Acceptance Truth, or Kian's learner progress.

---

## Work Cursor

**Scope:** A1 — Circulation  
**Active engineering stage:** fresh **Runtime Loop** re-acceptance  
**Blocker:** none at S/K/L, Content Closure, or P  
**Next action:** execute realistic browser-local A1 learner journeys against the freshly accepted Projection: Logic Group lecture handoff → group Recall/closure → Block Recall/completion → resume/return → System Recall gating. Attack early jumps, refresh/resume, malformed/stale local state, and completion prerequisites. Do not perform U.

Current fresh progress:

```text
S        RE-ACCEPTED
K        RE-ACCEPTED after semantic repair
L        RE-ACCEPTED
Content  CLOSED
P        RE-ACCEPTED after Projection repair
R        ACTIVE fresh attack
E        downstream-frozen behind R
U        real learner only / external workflow
```

> Engineering evidence must not manufacture learner progress. This Chat stops before U.

---

## P closure receipt

Fresh Projection / Interaction audit inspected the actual A1 learner-facing implementation rather than canonical strings alone.

Three real Projection defects were found and repaired:

1. **KP-by-KP app switching** — the old Block projection sent the learner back to the Lecture per KP. It now preserves Logic Group continuity: `学习节定位 → MarginNote 原讲义连续完成这一节 → 本节 KP Recall → 本节 closure → 下一学习节`.
2. **future-stage / answer leakage** — later learner stages could be navigated to before prerequisite learning contact. Shared stage guards now fail closed before KP Reveal/Recall, Block Recall/completion, and System Recall/sweep when prerequisite learner evidence is absent.
3. **governance chrome on the learner surface** — Xizong now keeps `Canonical projection / sha / Source path / System Current` and source-foot governance metadata out of the primary learner chrome while preserving provenance in canonical owners/validators.

Durable contract:

- `static-web/scripts/validate-xizong-a1-projection.mjs`
- wired into `.github/workflows/static-web-xizong-qa.yml`

Regression reconciliation:

- QA #345 proved the new A1 Projection contract itself PASS and exposed stale A2 validator expectations;
- A2 validator was updated to the shared Logic Group continuity/stage-guard semantics;
- QA #346 then passed A2 and exposed the same stale expectation in A3;
- A3 validator was updated without changing A3 medical/Learning owners;
- **QA #347 (`34768893981`) completed SUCCESS**, including A1 learner contract, A1 fresh Projection contracts, A2/A3 shared runtime regressions, B probes, shared repair-inbox contracts, and Astro build.

P fresh verdict: **PASS**. The defect owner was Projection/interaction; no L or medical Content rollback was required.

---

## R fresh-audit contract

Fresh R must execute material state transitions in a real browser/runtime environment, not infer readiness from source-string checks.

At minimum prove:

1. clean Block starts with no manufactured learning evidence;
2. entering a Logic Group does not itself mark its KPs learned;
3. direct navigation to KP Recall / answer reveal before formal Lecture contact fails closed;
4. confirming one Logic Group's original-Lecture contact marks only that group's KPs formally contacted;
5. Recall/rating progresses only within the current Logic Group and closes the group only after its KPs are actually recalled;
6. refresh restores the real stage/group/KP state without inventing progress;
7. Block Recall remains unavailable until all Logic Groups have formal learning contact + KP Recall;
8. Block completion requires the approved completion evidence, including original-Lecture confirmation and Block Recall;
9. Continue returns to the last real route/state;
10. System Recall remains unavailable until all 12 A1 Blocks are genuinely marked complete in engineering-test state;
11. state/version guards fail closed on stale or malformed evidence rather than silently accepting it.

Fresh R may use engineering fixture state to reach late transitions, but those fixtures are test evidence only and must never be written as Kian's Learner Truth.

If R finds a learner-facing sequencing defect, reopen P/L only at the smallest responsible owner. Otherwise close R and activate E.

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
→ exact shared/A1 runtime owner(s) named by the failing transition
→ execute realistic browser journey
→ work
```
