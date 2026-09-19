# D Neuro · Sensory · Motor · Orthopedics — Phase 6D Readiness DAG Repair Brief

Status: **BUILDER REPAIR REQUIRED**  
Triggered by: `D_PHASE6C_FRESH_INDEPENDENT_L_AUDIT.md`  
Gate: **L — Learning Logic**  
Scope: **readiness hard/soft semantics only**

This brief is a builder entrypoint. It does not authorize Content, Projection, Runtime, Evidence, Knowledge or medical-Core changes.

---

## 1｜Repair target

Canonical candidate:

`content/xizong/knowledge/learner/d-neuro-sensory-motor-orthopedics-learning.json`

Earliest responsible object:

```text
system_route.requires
+ directly coupled benefits_from / flex_rule consistency
```

Do not change LG identity/membership, Source-contact classes, Visual semantics or PSRs unless this bounded repair uncovers a direct contradiction.

---

## 2｜Hard-edge rule

For every current `requires` edge ask:

> If this edge is deleted, can the later Block still form correctly from its own accepted Primary Source, with at most a bounded local reactivation rather than hidden guessing or full duplicate teaching?

If **yes**:

```text
NOT HARD
→ default_route and/or benefits_from
```

If **no**, because the current Block explicitly consumes an earlier owner and intentionally does not rebuild it:

```text
HARD
→ requires
```

Source order, pleasant sequence, comparison value, lower cognitive friction, frequent co-testing or later integration are not sufficient reasons for a hard gate.

---

## 3｜Minimum known corrections

### Neural branch

Fresh audit requires these current hard relations to be removed/demoted:

```text
N2:  remove hard N1
N3:  remove hard N2
N4:  remove hard N2, N3
N5:  remove hard N1, N2
N6:  remove hard N5
N7:  remove hard N5
N8:  remove hard N2
N9:  remove hard N2
N10: remove hard N2
```

Preserve useful order by adding/moving the relevant owners into `benefits_from` where not already present. The current low-switching default route may remain unchanged.

Required under-gating repair:

```text
N11 requires = N1 + N5 + N8
```

Reason: N11 is integration-primary and explicitly performs N1/N5/N8 retrieval. N11-LG02 consumes the N1 cord-tract coordinate rather than owning a new full first-teaching pass.

### Orthopedic branch

Remove/demote these false hard relations:

```text
O3:  remove hard O2; retain hard N11
O6:  remove hard O2
O7:  remove hard O2
O11: remove whole-Block hard N11
```

Keep:

```text
O3 requires N11
O4 requires N11
O5 requires N11
```

For O11, preserve `N11` as a benefit/reactivation for the chronic nerve-entrapment portion. If a future Learning schema supports finer readiness granularity, only the root-vs-named-nerve entrapment closure (`O11-LG05`) is a candidate for a narrower prerequisite. Do not lock O11-LG01–LG04 behind N11.

---

## 4｜Expected repaired graph shape

The fresh audit does not require the builder to copy a cosmetic graph. It requires the hard legality to be no broader than the true dependency.

The minimum supported inside-D hard structure after the known repair is:

```text
N1 + N5 + N8 → N11

N11 → O3
N11 → O4
N11 → O5
```

Everything else currently identified by the fresh audit is learner-order / reactivation / integration benefit rather than hard legality.

If the builder wants to retain any additional hard edge, the repair receipt must prove all of the following from Current Source/Core:

1. the earlier Block owns information actually consumed by the later Block;
2. the later Block intentionally does not rebuild it;
3. missing it would create hidden guessing or material duplicate first teaching;
4. a bounded local repair would not be sufficient.

Do not retain an edge merely because the default route already places the earlier Block first.

---

## 5｜Required consistency updates

After editing `requires`:

- move demoted relations to `benefits_from` when they remain pedagogically useful;
- update `flex_rule` so prose and machine legality match;
- keep `default_route` as low-switching guidance unless a new contradiction is found;
- regenerate/read back structural DAG accounting;
- confirm all 27 keys remain present;
- confirm no unknown node, self-edge or cycle;
- confirm Source-contact and LG membership are byte/semantic unchanged unless explicitly justified.

Do not change accepted Source conflict/gap semantics.

---

## 6｜Required builder evidence

Builder repair receipt must show:

```text
before requires map
→ edge-by-edge delete test
→ after requires map
→ demoted benefits_from relations
→ DAG accounting
→ explicit statement that LG / Source-contact / Visual / compression objects were not opportunistically redesigned
```

Builder may run a self-adversarial check, but self evidence cannot promote L.

---

## 7｜Exit condition

After bounded repair:

```text
L = REPAIRED_CANDIDATE / AWAITING FRESH RE-AUDIT
Content = FROZEN
P/R/E = FROZEN
```

A new fresh independent auditor must re-test at minimum:

- the repaired hard DAG for both over- and under-gating;
- N11 N1/N5/N8 readiness;
- O11 partial independence;
- unchanged default-route flexibility;
- no regression to Source-contact continuity, LG topology or compression.

Only that new independent verdict may promote L.
