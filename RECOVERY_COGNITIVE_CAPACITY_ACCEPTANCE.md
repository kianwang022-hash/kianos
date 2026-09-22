# Recovery & Cognitive Capacity — Acceptance

Status: CURRENT ACCEPTANCE OWNER
Artifact owner: `RECOVERY_COGNITIVE_CAPACITY_MODEL.md`
Acceptance standard: `LEARNING_ACCEPTANCE.md §5.9`

---

## Current verdict

```text
Same-Chat adversarial design attack: PASS
Fresh independent Pre-Use Final Audit: UNTESTED
Real personal calibration: UNTESTED
U / real learner validation: UNTESTED

READY_FOR_REAL_USER_TRIAL: NO
```

The model must not be intentionally used to alter Kian's real study plan until the Fresh Independent Pre-Use Final Audit below passes on the exact current candidate.

A same-Chat attack is useful defect discovery, but under the repository-wide acceptance rule it does not satisfy the strongest independence requirement.

---

# 1｜Same-Chat self-attack result

The first adversarial pass attacked the model as if Kian were a normal, inconsistent human rather than a clean sensor feed.

Material issues found and repaired before this acceptance record:

1. **Circadian overclaim risk** — repeated wake time could reflect alarms/social schedule rather than physiological phase.
   - Repair: circadian timing is now explicitly a behavioral proxy; alarm/travel/irregular schedules reduce phase confidence.

2. **Exercise monotonicity error** — physical load could be treated as if more activity always reduced cognition.
   - Repair: moderate activity may improve alertness; only context/repeated personal evidence determines direction.

3. **Caffeine masking error** — good subjective alertness after caffeine could be mistaken for recovery.
   - Repair: caffeine is masking/confounding context and never recovery credit.

4. **Severe sleep restriction override error** — a brief 'I feel fine' could erase strong sleep-loss evidence.
   - Repair: severe acute restriction remains a strong prior; hard work may be trialed in bounded blocks but prolonged vigilance-sensitive work stays conservative until function is demonstrated.

5. **Temporal leakage risk** — later study outcomes could accidentally justify an earlier same-day prediction.
   - Repair: only information available before the decision may be used to evaluate that decision; outcome data update future state only.

6. **Missingness interpretation risk** — not wearing the device could be read as poor recovery.
   - Repair: missing wearable data remains UNKNOWN; repeated missingness is data-quality context only.

No personal-data claim was created by these repairs.

---

# 2｜Fresh independent audit protocol

The final auditor must start from current `main@HEAD` and read, in order:

1. `LEARNING_ACCEPTANCE.md §5.9`
2. `EXAM_ORCHESTRATOR_CONTRACT.md §4.5`
3. `RECOVERY_COGNITIVE_CAPACITY_MODEL.md`
4. this Acceptance file

Before reading the Same-Chat findings above in detail where practical, the auditor should independently write expected behavior for the mandatory scenario set below.

The auditor must attack both:

- false-positive constraint: the model unnecessarily suppresses good study;
- false-negative constraint: the model confidently schedules hard work when evidence says it should not.

Final verdict:

```text
Pre-Use Final Audit: PASS / PASS_WITH_DEBT / BLOCKED
READY_FOR_REAL_USER_TRIAL: YES / NO
```

PASS_WITH_DEBT is legal only for debt that cannot alter the real study decision, evidence interpretation, health boundary, privacy boundary or recovery fallback.

---

# 3｜Mandatory realistic-human scenario matrix

Every row must be reasoned from the current model, not from an implementation's desired answer.

| # | Human situation | Required safe behavior |
|---:|---|---|
| 1 | New Watch, only 2 nights of data, user feels normal | Cold-start; no personal HRV judgment; no numeric capacity prediction; ordinary plan survives |
| 2 | 4h sleep, HRV looks favorable, user says 'weirdly energetic' | Severe restriction is not erased; no workload bonus; bounded high-load trial only |
| 3 | 8h sleep + normal vitals, but real task performance collapses after 30 min | Current function overrides favorable proxy for immediate load; investigate mismatch |
| 4 | HRV low for one night, RHR/sleep/function normal | Do not punish the day from one marker |
| 5 | HRV low + RHR high + respiratory rate shifted + user feels ill | Strong anomaly/health boundary; do not turn it into aggressive productivity tuning |
| 6 | Watch not worn overnight | Recovery state UNKNOWN; use ordinary capacity/subject evidence; no invented bad recovery |
| 7 | Apple Watch model/source changes | Start new source epoch; do not splice baseline blindly |
| 8 | External app provides RMSSD while Apple Health baseline is SDNN | Keep metrics separate; no cross-formula baseline |
| 9 | User flies across 8 time zones | Circadian confidence drops; local-time schedule + recent sleep guide placement |
| 10 | Midday nap | Reduce acute sleep pressure as supported; add temporary post-wake inertia; do not reset circadian phase |
| 11 | 20–30 min moderate exercise before study | Do not automatically classify as drain; observe personal functional effect |
| 12 | Very heavy workout previous day, physiology strained, function currently normal | Context raises caution, but current good function permits bounded observation rather than automatic shutdown |
| 13 | 4h sleep + large caffeine dose + 'I feel fine' | Caffeine is masking context, not recovery; severe restriction safeguard remains |
| 14 | Sleep stages report very little deep sleep but duration/timing/function are normal | No material plan change from stage minutes alone |
| 15 | Apple Readiness high and raw HRV/RHR/sleep are also present | Avoid double counting composite + components |
| 16 | Apple Readiness low but raw components and function are normal | Preserve conflict; composite does not own the decision |
| 17 | Last Health sync is stale by 48h | Stale physiology cannot be treated as current recovery evidence |
| 18 | Sleep record is partial/fragmented due sync failure | Quality falls; do not infer true short sleep without adequate coverage |
| 19 | Calendar offers 4h, model thinks cognition could support 7h | Plan cannot exceed real clock-time capacity |
| 20 | Calendar offers 10h, recovery context is constrained | Available hours do not imply usable cognition; place/shorten load conservatively |
| 21 | Circadian low window + Xizong hard reasoning + low-load review both available | Preserve subject priority but put the lower-load task in the poorer window when feasible |
| 22 | User strongly wants to keep a hard block despite a constrained day | Inform and bound risk; preserve user agency; do not manufacture medical prohibition |
| 23 | Same-session outcome is available only after the block | It may update future state, never retroactively improve the prediction that scheduled it |
| 24 | New Xizong source is substantially harder than prior samples | Do not attribute slower throughput to recovery without task/source comparability |
| 25 | Session ends early because of a phone call | Treat outcome as censored/interrupted, not cognitive failure |
| 26 | Persistent fatigue with normal wearable data | Do not explain it away as productivity noise; health boundary remains available |
| 27 | All wearable signals look excellent | Protect the plan; do not create extra study obligation |
| 28 | Wearable looks poor but several comparable real blocks remain strong | Do not overreact; repeated personal outcome evidence may later recalibrate physiology weight |
| 29 | Only one late-evening HRV sample exists | Low confidence; do not compare it directly with a sleep-window baseline |
| 30 | Very long sleep after an illness-like day | Do not label 'more sleep = bonus readiness'; retain anomaly/recovery context |
| 31 | User wakes by alarm much earlier than habitual schedule | Do not call alarm time the biological circadian phase; reduce phase confidence |
| 32 | Good morning prediction but afternoon stress event changes function | Current functional state can update the intraday decision; morning snapshot is not frozen |
| 33 | Health connector is unavailable | Ordinary Steward planning continues from clock capacity + subject evidence; recovery uncertainty only where decision-relevant |
| 34 | Health data contains an impossible/corrupt value | Fail closed for that metric/source; no silent normalization into plausible recovery |
| 35 | Multiple correlated recovery metrics all derive from the same underlying signal | Do not count correlation as independent evidence strength |
| 36 | Personal model has only a handful of outcomes | Stay heuristic; no calibrated probability claim |

Mandatory result for every row:

```text
PASS
or
DEFECT → earliest responsible model rule → bounded repair → re-run
```

No row may be waived because the scenario is inconvenient.

---

# 4｜Model maturity attacks beyond scenarios

## A. Simpler-baseline challenge

Compare, once real data exists:

```text
B0 = Calendar + subject evidence only
B1 = B0 + sleep duration/timing
B2 = B1 + S/C/I
B3 = B2 + physiology
B4 = B3 + current functional state
B5 = B4 + personal outcome calibration
```

A later model may operationally replace an earlier one only if it adds stable held-out decision value, safety or calibration. Otherwise keep the simpler model.

## B. Ablation attack

Remove one signal family at a time. If a supposed key metric can disappear without changing held-out usefulness, its operational weight should shrink rather than being defended.

## C. Wrong-direction attack

Explicitly test whether:

- low HRV always leads to reduced work;
- high HRV always leads to more work;
- more sleep always means more capacity;
- more exercise always means less capacity;
- subjective state always overrides objective context;
- wearable context always overrides subjective state.

Any unconditional version is a defect.

## D. Confidence attack

Ask whether the same output would still be emitted if:

- sample count were cut in half;
- one source were stale;
- one signal disagreed;
- device identity changed;
- task family changed.

If confidence remains unchanged without justification, the confidence model is defective.

## E. Privacy / boundary attack

Verify:

- raw health samples are not committed to public GitHub;
- health context does not become learner mastery;
- recovery does not become a second exam scheduler;
- health anomaly context is not presented as diagnosis;
- optional Health failure does not block studying.

---

# 5｜Evidence required before first intentional use

To change this file to `READY_FOR_REAL_USER_TRIAL: YES`, the fresh independent auditor must provide:

1. exact audited `main@HEAD`;
2. 36/36 mandatory scenario results;
3. defects found + repairs, if any;
4. simpler-baseline / ablation / confidence attack conclusions at the level possible without personal data;
5. confirmation that no MATERIAL decision-changing defect remains;
6. explicit statement that personal predictive calibration is still UNTESTED;
7. readback that the accepted model/contract/acceptance files are the exact post-repair Current.

When real Watch data arrives, Stage 0 may begin only after this gate passes.

Real-use U remains separate and may reopen the model.
