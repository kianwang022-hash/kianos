# Politics Highest-Maturity Stage Plan

Status: **ACTIVE POLITICS MATURITY OWNER · BROAD ENGINEERING STOP**
Parent acceptance bar: `EXAM_SUBJECT_MATURITY_STANDARD.md`
Politics acceptance bar: `MATURITY_REQUIREMENTS.md`
Active owner: PR #638 · `work/politics-later-readiness-20260920`

## Ownership

```text
Shared Exam Subject Maturity Standard
→ defines what every subject must prove

Politics MATURITY_REQUIREMENTS
→ adapts that bar to Politics

Politics MATURITY_STAGE_PLAN
→ owns the Politics maturity continuation cursor

exact Politics owners
→ own Forecast / Analysis / Future Source / learner evidence
```

The shared maturity candidate is not a Politics continuation branch.

## Current truth

```text
T1 Objective reconciliation       CLOSED
T2 Early Objective Forecast       CURRENT-SOURCE BUILD CLOSED
                                  clean score calibration EVIDENCE-GATED
T3 Analysis foundation/evidence   CLOSED at pre-current-year boundary
T4 Future Source ingress prep     CLOSED
T5+                               SOURCE / REAL-U / EVIDENCE GATED
```

### T1 — Objective reconciliation

Closed without rebuilding first-round Politics.

Owners / evidence:
- `SCORE_ABILITY_MATRIX.md`;
- `MATERIAL_INVENTORY.md`;
- current first-round Acceptance / Workbench evidence.

Preserve:
- Chengfeng continuous first round;
- Xiao1000 as full learning material, not a clean score holdout;
- single / multiple distinction;
- W/U → causal compression;
- selective Memory;
- stable work becomes cheaper.

### T2 — Early Objective Forecast

Current-source build is closed.

Owners:
- `FORECAST_MODEL.md`;
- `FORECAST_STRESS_REPORT.md`;
- `static-web/src/lib/politicsForecast.mjs`.

Forecast owns workload / uncertainty / sensitivity only. It does not choose today's task and may not convert Xiao1000 learning exposure directly into an exam score.

The remaining score-calibration step waits for appropriate clean/current evidence and Real U.

### T3 — Analysis foundation

Closed at the pre-current-year boundary.

Owners:
- `analysis-output/README.md`;
- `analysis-output/SCORING_RUBRIC.md`;
- `static-web/src/lib/politicsAnalysisEvidence.mjs`.

Capability chain:

```text
IDENTIFY
→ SKELETON
→ MATERIAL BINDING
→ FORMULATION
→ DELIVER
→ TRANSFER
```

No aggregate mastery score. Historical material can supply task geometry / scaffolds; current-year exact wording remains source-gated.

### T4 — Future Source readiness

Engineering preparation is closed.

Owners:
- `later-stage/INGESTION_RULES.md`;
- `later-stage/manifest.json`;
- `mock-final/README.md`.

Known source families:
- handbook / memory;
- current affairs;
- Xiao8;
- Xiao4.

Real current-year Source must be bound before annual exact wording or current-affairs truth gains authority.

## What happens now

The next broad input is learner evidence, not another maturity architecture stage:

```text
real Politics study
→ NU / Xiao1000 / Review / Memory / Analysis evidence
→ Real Learner U
→ Forecast recalibration
→ smallest responsible repair only
```

## Reopen engineering only when

1. a current learner action is blocked by a concrete defect;
2. missing evidence would make Chat choose the wrong action;
3. a real Future Source has arrived and must be ingested;
4. Real U exposes a material capability gap;
5. Protect 70 is threatened by a specific capability needing bounded repair.

## Stop when

- only the shared standard can be made more elaborate;
- architecture could be more complete;
- a later feature may someday be useful;
- no Real U exists but model precision could still be increased;
- a second Politics scheduler / mastery score / learner ledger would only make the diagram look cleaner.

## Fresh-Chat restart

```text
main@HEAD
→ AGENTS.md
→ content/politics/CURRENT.md
→ active Politics maturity owner #638
→ content/politics/MATURITY_STAGE_PLAN.md
→ exact owner only if a reopen condition is present
```

Read the shared maturity standard only when checking whether Politics still satisfies the upstream acceptance bar.
