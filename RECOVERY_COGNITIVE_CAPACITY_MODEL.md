# Recovery & Cognitive Capacity Model

Status: CURRENT MODEL SPEC  
Authority: `EXAM_ORCHESTRATOR_CONTRACT.md §4.5`  
Scope: private wellness/recovery evidence used by Chat/Steward to constrain exam-study capacity, cognitive load and time placement.  
Not a medical device, diagnosis system, subject-priority engine, or autonomous scheduler.

---

## 0｜Purpose

This model answers one bounded question:

> Given current sleep/wake history, circadian timing, wearable recovery context, subjective-functional state and observed study performance, what constraint should Chat place on **usable cognitive capacity, high-load tolerance and task placement** today?

It does **not** decide whether Xizong / English / Politics matters more. Gate, Demand, workload and score evidence remain the priority owners.

The production relation is:

```text
Apple Health / wearable observations
+ subjective-functional observations
+ task-performance outcomes
        ↓
Recovery & Cognitive Capacity Model
        ↓
private recovery context
  - day capacity envelope
  - intraday load curve
  - high-load tolerance
  - block / recovery hints
  - confidence / missingness
        ↓
Chat / Steward
        ↓
existing kianos.exam.chat-plan.v1
```

No recovery output is learner mastery Truth.

---

# 1｜Design decisions absorbed from mature systems

## 1.1 Biomathematical fatigue models — ADOPT the backbone

**Three-Process Model / SAFTE-FAST / Unified Model of Performance (UMP)** establish the useful decomposition:

```text
homeostatic sleep pressure
+ circadian modulation
+ sleep inertia
→ alertness / neurobehavioral-performance expectation
```

SAFTE-FAST operationalizes circadian function, a homeostatic sleep reservoir and sleep inertia. UMP improves handling of chronic sleep restriction, slower recovery and individual differences.

Decision:

- ADOPT the S / C / I architecture.
- ADOPT a slow cumulative-restriction state so one recovery night does not unrealistically erase several short nights.
- ADOPT individualization from real performance outcomes.
- DO NOT copy proprietary commercial scheduling algorithms.
- SAFTEr is a research reference, not a production dependency.

## 1.2 RISE — ADAPT two output scales

RISE separates daily energy magnitude from circadian peaks/dips.

Decision:

```text
Day Capacity Envelope
!=
Intraday Load Curve
```

A bad recovery day may lower the envelope without changing the approximate timing of circadian peaks. High sleep debt may flatten the usable peaks.

## 1.3 Oura / Polar / WHOOP — ADAPT personalized recovery context

Useful common patterns:

- compare physiology with the individual's own history;
- use overnight measurements to improve context consistency;
- combine HRV with resting/sleeping HR and sleep rather than trusting one marker;
- use multi-timescale history rather than one-night reactions;
- treat respiratory rate / temperature-like deviations mainly as anomaly context.

Decision:

- multi-signal evidence;
- robust within-person baselines;
- consistent measurement window;
- no population-HRV readiness threshold;
- no one-day HRV overreaction.

## 1.4 Apple Readiness — INTEGRATE only as an optional external feature

On supported Apple Watch models, Apple Readiness already fuses activity, recent sleep and daytime/overnight vitals against recent baselines.

Decision:

- treat it as an optional external summary / comparison feature;
- never require it;
- when raw components are available, do not count Readiness plus the same raw components as independent evidence;
- Apple Readiness may validate direction, not own the KianOS decision.

## 1.5 Garmin Body Battery — LEARN_FROM dynamic reserve

Garmin's charge/drain framing captures an important product idea: recovery is dynamic during the day.

Decision:

- allow naps, rest, daytime stress/activity and successful functional re-entry to update the current state;
- do not freeze the whole day's decision from one morning snapshot.

## 1.6 Apple Health Data Hub / Whoordan — ADAPT data engineering

Useful implementation patterns:

- provenance on every metric;
- local/private raw-data boundary;
- explicit missing-data handling;
- source/device continuity;
- long-horizon time-series storage when needed;
- never fabricate unsupported HealthKit values.

Decision:

- raw health samples remain private;
- generic semantics and fixtures may live in GitHub;
- device/source changes invalidate direct baseline comparison until bridged by new calibration.

## 1.7 HRV4Training / Bevel / Athlytic — ADAPT practical baseline discipline

These Apple/wearable-centered systems add several operational lessons:

- short rolling baseline and longer "normal range" answer different questions;
- subjective state should be interpreted alongside physiology;
- HRV measurement definition and window must stay consistent;
- sleep-window HRV reduces daytime contextual noise;
- physiology should inform small plan adjustments rather than replace the plan;
- robust filtering / outlier handling matters with Apple Watch sampling.

HRV4Training uses a recent baseline plus a longer normal range and explicitly treats physiology as awareness around an existing plan. Athlytic uses an overnight HRV/RHR recovery view against a longer rolling baseline. Bevel exposes the SDNN/RMSSD distinction and defaults recovery HRV to sleep-window observations.

Decision:

- ADOPT short-baseline + long-normal-range semantics;
- ADOPT sleep-window normalization for recovery HRV when coverage permits;
- ADOPT outlier filtering and explicit formula/source identity;
- DO NOT import their 0–100 scores or assume training readiness equals cognitive readiness.

## 1.8 N-of-1 / individualized UMP — ADOPT personal calibration

Population models are priors. Kian's actual response becomes the stronger local evidence.

Decision:

- use observed exam-task outcomes as the calibration target;
- use chronological / rolling-origin validation;
- show sample size and confidence;
- do not claim causal effects from observational associations.

---

# 2｜Model state

The latent state is:

```text
S_fast = acute homeostatic sleep pressure
S_slow = cumulative sleep-restriction / recovery reserve
C      = circadian phase and time-of-day modulation
I      = sleep inertia after waking
P      = physiological recovery / anomaly context
F      = current subjective-functional state
O      = observed task-performance state
Q      = data quality / provenance confidence
```

These are model concepts. They are not independent biological measurements.

The planning outputs are:

```text
day_capacity_envelope
intraday_load_curve
high_load_tolerance
block_duration_hint
recovery_window_need
current_state_confidence
model_stage
important_conflicts
important_missingness
```

No universal learner-facing readiness score is created.

---

# 3｜Input contract

## 3.1 Tier A — core inputs

Prefer these whenever available:

### Sleep / timing
- main sleep start;
- main sleep end;
- total sleep time;
- sleep opportunity / time in bed when distinguishable;
- wake-after-sleep-onset / fragmentation only when source reliability is adequate;
- naps;
- wake time;
- timezone / travel transition.

### Physiological recovery
- Apple Health `heartRateVariabilitySDNN`;
- resting heart rate or a consistent overnight resting/sleeping-HR proxy;
- respiratory rate;
- wrist temperature deviation when supported and source-consistent.

### Activity/load
- workout identity and duration;
- workout effort / training-load signal when available;
- active energy only as coarse context;
- unusually high physical load.

### Functional state
- current sleepiness;
- mental fatigue;
- attention fragmentation;
- over-arousal / stress;
- pain / illness flag when reported;
- explicit user statement that current cognition is clearly better/worse than usual.

### Learning outcomes
- actual session duration;
- planned vs completed block;
- task family / source identity;
- subject-native accuracy / uncertainty / throughput when comparable;
- early termination or successful completion where the runtime exposes it;
- re-entry success after a recovery intervention.

## 3.2 Tier B — useful supporting inputs

- Apple Readiness, if supported;
- sleep score;
- SpO2 trend;
- step count;
- stand time;
- VO2max;
- daytime HR pattern;
- reported caffeine timing/dose;
- unusual alcohol exposure if volunteered;
- meal / hydration / environment only when they explain a current mismatch.

Tier B signals must not dominate when Tier A evidence disagrees.

## 3.3 Tier C — low-trust / contextual inputs

- consumer sleep-stage minutes as precise biological truth;
- active-energy calories as an exact load measure;
- one isolated daytime HRV sample;
- cross-device HRV values treated as interchangeable;
- population-normal HRV ranges.

They may support interpretation but should receive little or zero direct planning weight.

---

# 4｜Measurement-quality rules

## 4.1 Sleep

Consumer wearables are useful for longitudinal sleep timing/duration but are less reliable for detailed sleep staging.

Therefore:

```text
sleep start/end + total duration  >  exact REM/deep/light minutes
```

Use stage composition mainly as a repeated trend, never as the sole reason to change a study day.

## 4.2 HRV

Apple Health exposes HRV as SDNN; products such as WHOOP commonly use RMSSD.

Hard rule:

> Different HRV definitions, devices or measurement windows are not one continuous metric.

For Apple Health HRV:

- preserve `metric = heartRateVariabilitySDNN`;
- prefer sleep-window observations for next-day recovery comparison;
- use a robust nightly summary;
- use log transform before longitudinal z-like normalization when sample density permits;
- store sample count and time coverage;
- one or two opportunistic samples = low confidence, not zero recovery.

A device/source transition starts a new baseline epoch unless overlap data establishes a bridge.

## 4.3 Resting / sleeping heart rate

Use one consistent definition across days. Do not mix Apple-generated daily RHR, minimum sleep HR and arbitrary overnight average as if identical.

## 4.4 Respiratory rate / temperature / SpO2

Use primarily for **deviation detection**. Their planning role increases when several signals shift together or subjective health also changes.

They are not diagnosis.

## 4.5 Activity / energy

Apple Watch energy-expenditure estimates have meaningful measurement error.

Use:

- workout duration / effort / training load when available;
- active energy as a coarse load feature;
- never convert calories directly into cognitive-capacity minutes.

---

# 5｜Personal baselines

No single fixed window owns baseline.

Maintain conceptually:

```text
acute      1–3 days      immediate change
recent     3–7 days      short trend
medium     ~14–28 days   current-normal context
long       ~60–90 days   stable personal anchor
```

The exact window used for a metric may differ with data density.

For a continuous metric `x`, prefer robust normalization:

```text
center = median(long-baseline values)
scale  = 1.4826 * MAD
robust_deviation = (x - center) / max(scale, epsilon)
```

For right-skewed HRV, log-transform before normalization when enough observations exist.

Baseline eligibility requires:

- same metric definition;
- same source epoch;
- comparable measurement window;
- adequate sample coverage;
- no obvious corruption.

If these fail, output `UNKNOWN`; do not silently substitute zero or population norms.

---

# 6｜Sleep / circadian engine

## 6.1 S_fast — acute pressure

S_fast is driven by:

- time awake;
- recent sleep duration;
- sleep timing;
- naps;
- acute sleep restriction.

Use the classical homeostatic-process shape as a prior, not as personalized truth.

## 6.2 S_slow — cumulative restriction

A separate slow state prevents the false assumption:

> one normal night completely repairs several restricted nights.

S_slow should incorporate multi-day sleep history and decay gradually during recovery.

UMP / chronic-sleep-restriction research is the conceptual prior.

## 6.3 C — circadian modulation

Initial phase estimate may use:

- repeated sleep midpoint;
- repeated wake time;
- recent schedule shifts;
- travel/timezone;
- light/activity information when available.

Stage 0/1 may use a generic harmonic prior around the inferred phase.

Stage 2 should learn Kian's clock-time effect from actual comparable task outcomes using cyclic / harmonic terms, adjusted for sleep pressure.

Do not hard-code a universal "2 PM crash."

## 6.4 I — sleep inertia

I is highest immediately after waking and decays with time awake.

Because consumer sleep-stage labels are imperfect, waking from "deep sleep" must not be given strong planning weight unless repeated personal evidence supports it.

Naps can generate a smaller new inertia interval.

---

# 7｜Physiological recovery engine P

P is a multivariate context, not an HRV score.

Core directions:

```text
HRV SDNN below personal baseline       -> possible recovery strain
RHR above personal baseline            -> possible recovery strain
respiratory rate unusual               -> anomaly support
temperature unusual                    -> anomaly support
large recent physical load             -> recovery demand context
```

Use evidence agreement.

Examples:

```text
HRV ↓ + RHR ↑ + respiratory rate ↑
=> stronger evidence than HRV ↓ alone

HRV ↓ alone + normal subjective state + normal task performance
=> preserve the conflict; do not automatically constrain the day
```

Avoid double counting highly correlated measures.

Apple Readiness / Oura / WHOOP-like scores, when available, are treated as external composite evidence and must not be added as though independent from their component inputs.

---

# 8｜Functional engine F and performance engine O

Wearables cannot observe cognitive capability directly.

## 8.1 F — current functional state

Subjective state is valid evidence, especially when it disagrees with wearable proxies.

Minimum useful state:

```text
sleepiness
mental_fatigue
attention_arousal
physical_discomfort_or_illness
```

Do not force a questionnaire every time. Natural-language statements in Chat may provide the observation.

## 8.2 O — observed performance

O is the strongest personalization path.

A session becomes useful calibration evidence only when:

- task family is known;
- source/difficulty is reasonably comparable or modeled;
- timing is known;
- outcome is not obviously censored by an external interruption;
- subject runtime evidence is valid.

Useful outcome targets:

1. **Block effectiveness**
   - completed effectively vs degraded/aborted.

2. **Task-family performance residual**
   - current throughput / accuracy relative to that task family's own baseline.

3. **Usable cognitive minutes**
   - observed effective work before sustained degradation, only when availability was not the limiting factor.

4. **Recovery re-entry**
   - whether a recovery action was followed by restored real-task function.

Actual minutes alone are not proof of capacity: Calendar constraints, motivation, interruptions and task availability can censor the observation.

---

# 9｜Cognitive-load interface

Recovery constrains task load; subject owners still define learning semantics.

A task may optionally expose:

```text
load_class = high | medium | low
```

For later personalization it may also expose a sparse vector:

```text
sustained_attention
working_memory_reasoning
retrieval_precision
production_output
```

Each dimension is ordinal, not pseudo-precise.

Examples:

- difficult fresh Xizong reasoning may be high reasoning + retrieval;
- English whole-paper may be high sustained attention;
- familiar lexical review may be lower load;
- Politics memory review may be moderate retrieval with lower reasoning.

Exact mappings remain subject-owned and can be revised without changing the recovery model.

---

# 10｜Decision layer

## 10.1 Calendar capacity stays separate

```text
available_clock_time
!=
usable_cognitive_capacity
```

Calendar / real-world obligations own available clock time.

The recovery model may constrain what portion is realistically usable and where high-load work should be placed. It may not create extra hours.

## 10.2 Conservative asymmetry

Poor recovery may justify reducing or redistributing demand.

Good recovery does **not** automatically create more study obligation.

Until personal calibration proves otherwise:

- positive signals mainly protect the existing plan;
- negative multi-layer signals may shorten / relocate high-load blocks;
- a "great" wearable morning is not permission to exceed sustainable workload.

## 10.3 Intraday curve

The curve is a ranking of broad windows, not a minute-perfect forecast.

Each window may expose:

```text
high_load_fit = preferred | acceptable | constrained | unknown
confidence
why
```

Current functional evidence can override an older morning prediction.

## 10.4 Re-entry test

When Chat changes load because of suspected transient fatigue:

```text
bounded recovery action
→ return to real task
→ observe actual function
→ update state
```

Do not manufacture a separate test merely to calibrate the model.

---

# 11｜Calibration lifecycle

## Stage 0 — cold start / 0–14 useful days

Goal: data quality and baseline establishment.

Use:

- sleep/wake timing;
- obvious acute sleep restriction;
- time since wake;
- clear subjective-functional impairment;
- major multi-signal anomaly.

Do not:

- trust daily HRV noise;
- fit personal coefficients;
- react strongly to sleep-stage composition;
- inflate workload from "good recovery."

Outputs are mostly timing / load-placement guidance plus explicit uncertainty.

## Stage 1 — robust heuristic personalization

Enter when enough same-source history exists.

Use:

- robust personal deviations;
- multi-signal agreement;
- 3/7/28/60-day trends where available;
- subject-native task outcomes;
- conservative bounded plan changes.

## Stage 2 — outcome-calibrated model

Fit personal predictive models only after enough eligible outcome samples exist.

Candidate models, in order:

1. regularized linear / quantile regression for continuous outcomes;
2. regularized logistic model for block success;
3. dynamic linear / state-space model for time-varying coefficients;
4. Extended Kalman-style online individualization if it demonstrably improves rolling prediction.

Do not start with random forests / neural networks merely because they are available.

## Stage 3 — mature online calibration

A feature earns operational weight only when it adds out-of-sample value.

Use rolling-origin chronological evaluation:

```text
train on past
→ predict next window
→ score
→ advance
```

Compare against simpler baselines:

- Calendar / time-of-day only;
- sleep timing/duration only;
- S/C/I only;
- S/C/I + physiology;
- full model including functional/performance feedback.

A more complex model must not replace a simpler model unless the added features produce stable decision-relevant improvement.

---

# 12｜Validation metrics

Do not optimize one generic model score.

For each target:

### Day usable minutes
- MAE / median absolute error;
- signed bias;
- calibration by low / normal / high predicted capacity bands.

### Block success
- Brier score;
- calibration curve;
- false-negative cost: unnecessarily suppressing a good high-load block;
- false-positive cost: placing high-load work into a clearly degraded window.

### Performance residual
- MAE / rank correlation;
- direction accuracy;
- task-family coverage.

### Operational usefulness
- fewer failed high-load blocks;
- less unnecessary plan reduction;
- better use of high-quality windows;
- no increase in sleep / recovery instability caused by the scheduler.

No future probability is reported as calibrated until enough held-out personal evidence supports that claim.

---

# 13｜Conflict, missingness and anomaly rules

## 13.1 Wearable good / function bad

Trust current functional evidence enough to reduce immediate load.

Possible explanations remain open: stress, illness, task saturation, data gaps, circadian error.

## 13.2 Wearable bad / function good

Do not punish the current block solely from physiology.

Continue with bounded observation and watch for degradation.

## 13.3 Missing sleep or device not worn

Do not infer poor recovery.

State = `UNKNOWN`.

## 13.4 Source/device change

Start a new baseline epoch.

If overlapping measurements exist, a bridge can later be learned; otherwise do not splice the time series.

## 13.5 Travel / timezone shift

Reset circadian confidence downward and use local timestamps plus recent sleep timing. Do not assume the old phase transfers instantly.

## 13.6 Illness / concerning symptoms

Health evaluation outranks productivity optimization.

The model stops trying to explain persistent or concerning symptoms as "study fatigue."

---

# 14｜ChatGPT Health extraction protocol

When connected Apple Health data are available, Chat may use Health as the first data backend.

Preferred sequence for a planning/review request:

1. read the connected health summary when general context is needed;
2. inspect synced metric availability / date coverage;
3. retrieve actual samples for the required windows;
4. inspect the attached data when Health returns a file;
5. preserve local timestamps and source identity;
6. build the private recovery context;
7. combine it with the current Daily Learning Packet / real study evidence;
8. generate the normal Chat Plan.

Core Apple Health identifiers:

```text
sleepAnalysis
heartRateVariabilitySDNN
restingHeartRate
heartRate
respiratoryRate
workout
appleExerciseTime
activeEnergyBurned
stepCount
oxygenSaturation        optional
bodyTemperature         optional where available
```

Do not request every metric every day merely because it exists.

### Initial baseline pull

When Watch data first becomes available:

- sleep: as much valid history as the current device/source provides;
- HRV/RHR/respiratory rate: enough data to establish short + medium baseline;
- workouts/activity: enough context to identify unusual load;
- preserve the actual coverage start rather than pretending 60 days exist.

### Daily planning pull

Prefer:

- last night / current day;
- recent 3–7 days;
- baseline summaries only as needed.

Avoid repeatedly downloading unchanged long raw history if an equivalent cached/aggregated baseline is already trusted.

---

# 15｜Private recovery-context projection

Conceptual schema:

```json
{
  "schema": "kianos.recovery-context.v1",
  "study_day": "YYYY-MM-DD",
  "generated_at": "ISO-8601",
  "source_epoch": "stable-source-id",
  "model_stage": "cold_start | heuristic | calibrated | online",
  "state": {
    "sleep_pressure_fast": "low | normal | elevated | unknown",
    "sleep_restriction_slow": "low | normal | elevated | unknown",
    "circadian": {
      "phase_confidence": "low | medium | high",
      "windows": []
    },
    "sleep_inertia": "low | elevated | unknown",
    "physiological_recovery": "favorable | typical | strained | conflicting | unknown",
    "functional_state": "good | mixed | degraded | unknown"
  },
  "planning": {
    "day_capacity_envelope": {
      "status": "normal | constrained | unknown",
      "minutes_low": null,
      "minutes_high": null
    },
    "high_load_tolerance": "normal | reduced | unknown",
    "block_duration_hint": "normal | shorter | unknown",
    "recovery_window_need": "none | useful | strong | unknown",
    "intraday_load_curve": []
  },
  "quality": {
    "overall": "low | medium | high",
    "missing": [],
    "conflicts": [],
    "source_notes": []
  }
}
```

Numeric capacity bounds remain null until enough personal evidence supports them. Categorical planning can operate earlier.

This object is private transient planning context. Raw personal health data must not be committed into the public repository.

---

# 16｜What not to build

Do not build:

- a 0–100 Kian readiness score;
- a second exam scheduler;
- a public Health ledger;
- a population-HRV grading table;
- a sleep-stage optimization engine;
- an ML model trained on tiny mixed-task data;
- a "bad Watch day = no Xizong" rule;
- a historical hour-debt system;
- a health anomaly detector pretending to diagnose disease.

---

# 17｜Operational stop line

The model is ready for real use when:

1. Watch / Apple Health dynamic metrics are actually synced;
2. the first Health extraction preserves metric/source/timestamp identity;
3. Stage 0 context can be produced without inventing missing values;
4. current Daily Learning Packet and real Calendar capacity remain intact;
5. Chat can place or constrain task load without changing subject priority ownership;
6. raw health data remains private.

After that, the next work is **calibration from real use**, not more architecture.

---

# 18｜Evidence / ecosystem references

Scientific / fatigue modeling:

- Åkerstedt T, Folkard S. Three-process model of alertness and performance: https://pubmed.ncbi.nlm.nih.gov/9095372/
- Åkerstedt T et al. S/C validation: https://pubmed.ncbi.nlm.nih.gov/7761737/
- McCauley P et al. Homeostatic model for sleep-loss performance: https://pubmed.ncbi.nlm.nih.gov/18938181/
- Unified Model of Performance validation: https://pubmed.ncbi.nlm.nih.gov/26518594/
- Real-time individualization of UMP: https://pubmed.ncbi.nlm.nih.gov/28436072/
- Trait-like vulnerability to sleep loss: https://pubmed.ncbi.nlm.nih.gov/15164894/
- SAFTE-FAST overview: https://www.saftefast.com/overview
- SAFTEr research implementation: https://github.com/InstituteBehaviorResources/SAFTEr

Mature consumer systems:

- Apple Readiness: https://support.apple.com/en-us/128112
- Oura Readiness: https://support.ouraring.com/hc/en-us/articles/360025589793-An-Introduction-to-Your-Readiness-Score
- Polar Nightly Recharge: https://www.polar.com/en/smart-coaching/nightly-recharge
- Garmin Body Battery: https://www.garmin.com/en-US/garmin-technology/health-science/body-battery/
- WHOOP Recovery: https://www.whoop.com/us/en/thelocker/how-does-whoop-recovery-work-101/
- RISE Energy Schedule: https://help.risescience.com/hc/en-us/articles/40672503374871-How-does-RISE-predict-my-Energy-Schedule
- HRV4Training QuickStart / baseline semantics: https://www.hrv4training.com/quickstart-guide.html
- Athlytic recovery / 60-day baseline: https://athlyticapp.helpscoutdocs.com/article/13-getting-started
- Bevel HRV / recovery semantics: https://www.bevel.health/blog/the-basics-heart-rate-variability

Wearable measurement limits:

- Apple Watch HRV/RHR serial validation: https://pubmed.ncbi.nlm.nih.gov/39409260/
- Multi-device sleep/HRV validation: https://pubmed.ncbi.nlm.nih.gov/36016077/
- 2025 wrist-wearable sleep staging validation: https://pubmed.ncbi.nlm.nih.gov/40303381/
- 2026 wearable sleep meta-analysis: https://pubmed.ncbi.nlm.nih.gov/42175611/
- 2026 Apple Watch accuracy living systematic review: https://pubmed.ncbi.nlm.nih.gov/41513748/

Open-source implementation patterns:

- Apple Health Data Hub: https://github.com/3356153957/apple-health-data-hub
- Whoordan: https://github.com/W4rd2/whoordan
- Soma: https://github.com/heisenbuggs/Soma
- N-of-1: https://github.com/oisinmcgrath/n-of-1
