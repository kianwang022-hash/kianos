# Politics Forecast Model

Status: **ACTIVE SUBJECT FORECAST OWNER**

Role: estimate Politics workload, uncertainty and Gate risk for Chat. It does **not** choose today's task and does not replace the cross-subject Orchestrator.

Target:
- Protect 70
- Push 75

## 1. Forecast outputs

Politics Forecast keeps three outputs separate:

### A. Structural facts
- 160 Current Natural Units;
- 528 single-choice + 620 multiple-choice Xiao1000 learning items;
- cumulative first-attempt evidence by question type;
- current open Review problems;
- current Memory/analysis evidence when available;
- current future-source readiness.

### B. Workload / capacity
Estimate how much capacity may be required under explicit parameter assumptions.

### C. Score-path confidence
Describe how much evidence exists for:
- Objective path;
- Analysis path;
- current-year freshness;
- timed / whole-paper execution.

No output may convert Xiao1000 accuracy directly into an exam score.

---

## 2. Current computational owner

Implementation:

`static-web/src/lib/politicsForecast.mjs`

The module returns:

`kianos.politics.forecast.v1`

Role:

`SUBJECT_WORKLOAD_AND_RISK_EVIDENCE_NOT_STRATEGY`

It never outputs:
- next action;
- priority;
- target allocation;
- learner debt.

Those remain Chat decisions.

---

## 3. First-round workload model

For an explicit scenario:

```text
first-round minutes
=
remaining NU reactivation
+ remaining single-choice attempts
+ remaining multiple-choice attempts
+ projected Repair
+ selective Memory
```

Projected Repair uses:

```text
existing open problems
+ projected future W/U signals
→ divide by root-cause compression ratio
→ Repair clusters
→ Repair minutes
```

This deliberately avoids:

```text
1 Wrong = 1 Repair task
```

because that would systematically overestimate debt.

---

## 4. Natural Unit uncertainty

Current learner state does not own an independent “NU fully learned” checkbox.

Therefore:

- question-contact Units are progress evidence;
- navigation position is a structural prior;
- neither is automatically proof of source-learning completion.

Forecast may expose multiple unit-remainder cases:

- navigation tail;
- Units with no first-attempt evidence;
- full-catalog stress case;
- explicit remaining-Unit input when later learner evidence supports one.

The model must not hide this uncertainty behind one fake number.

---

## 5. Stress grid

Default adversarial axes are intentionally wide:

```text
NU reactivation          3 / 5 / 8 / 12 min
single attempt           0.5 / 0.8 / 1.1 min
multiple attempt         0.8 / 1.2 / 1.6 min
single W/U               5% / 10% / 15%
multiple W/U             15% / 25% / 35%
signals / Repair cluster 2 / 4 / 6
Repair cluster           4 / 8 min
Memory                   5 / 10 / 20 min/day
```

Full Cartesian grid:

**5832 scenarios per Unit-remainder case.**

These are not a probability distribution.

The reported `stress_grid_fit_fraction` means:

> fraction of deliberately varied stress combinations that fit inside the tested capacity window.

It is a robustness metric, not Kian's chance of finishing.

---

## 6. Baseline robustness readback

Zero-progress structural stress slice, 30-day window:

### All NU-speed scenarios

Historical readback from the current model family:

```text
1.0 h/day   very fragile
1.5 h/day   materially scenario-dependent
2.0 h/day   substantially more robust
2.5 h/day   near-complete robustness across the tested grid
```

### Fast-reactivation slice only

This slice restricts NU reactivation to 3–5 minutes while still varying question time, W/U, Repair compression and Memory.

30 days:

```text
1.0 h/day   fit ≈ 3.2%
1.5 h/day   fit ≈ 66.6%
2.0 h/day   fit ≈ 98.8%
2.5 h/day   fit = 100%
```

23 days after a one-week disruption:

```text
1.0 h/day   fit = 0%
1.5 h/day   fit ≈ 17.6%
2.0 h/day   fit ≈ 77.9%
2.5 h/day   fit ≈ 98.6%
```

Interpretation:

- 1.5h/day may be sufficient when Politics reactivation is genuinely fast and repair/memory pressure stays controlled;
- it is not robust to a bad week;
- 2h/day has much more slack in the same fast-reactivation family;
- none of these values should become a permanent daily quota before real learner evidence is available.

---

## 7. Sensitivity rules

The model must identify which parameter changes total workload most.

Expected high-sensitivity families:

- NU reactivation time;
- multiple-choice attempt time;
- Memory daily cost;
- Repair compression quality;
- multiple-choice W/U.

Real learner evidence may reorder this list.

A Forecast conclusion must name its largest current sensitivity rather than reporting a single unexplained total.

---

## 8. Personal P20/P50/P80

Personal interval is **blocked** until sufficient observed learner samples exist.

Before enough samples:

```text
CALIBRATION_PENDING
→ no personal P20/P50/P80
→ use stress ranges + explicit assumptions
```

After enough real samples:

```text
observed throughput / workload samples
→ empirical interval
→ P20 / P50 / P80
```

The current implementation requires at least 7 supplied observed samples before emitting the empirical interval. This threshold controls whether an interval is displayed; it does not itself prove score capability.

If the samples are heterogeneous or contaminated, Chat may keep the interval UNKNOWN/wide despite the count.

---

## 9. Score-path confidence

Early phase:

- Objective evidence can accumulate from clean first attempts, W/U structure and later transfer;
- Analysis remains wide/UNKNOWN until real output appears;
- current-year exactness remains source-gated.

Later phase:

- current-year handbook/current-affairs;
- Xiao8/Xiao4;
- independent analysis output;
- timed delivery;
- whole-paper execution

may narrow score-path uncertainty.

No model should output “Politics 73.4” in September merely because workload can be estimated.

---

## 10. Forecast decision boundary

Forecast may tell Chat:

- current workload range;
- capacity robustness;
- which assumption dominates uncertainty;
- what evidence would most change the estimate;
- whether the current Gate is structurally fragile.

Forecast may not tell the learner:

- do exactly N questions today;
- study exactly X minutes because P50 says so;
- repeat a stable module;
- open a second scheduler.

Today's task remains an adaptive Chat decision under the Politics Learning Contract and cross-subject capacity competition.

---

## 11. Recalibration

As Real Learner U arrives, replace broad seeds with observed evidence where legitimate:

- actual Politics minutes;
- single/multiple first-attempt throughput;
- single/multiple W/U;
- Repair cluster compression;
- Memory retention/relapse;
- Analysis practice cost;
- current-year source assimilation cost;
- timed output degradation.

A real contradiction reopens the model. The stress grid is not protected from learner evidence.
