# Politics Forecast Stress Report

Status: **BUILDER STRESS REPORT — not Real Learner calibration**

Owner: `content/politics/FORECAST_MODEL.md`

## Tested invariants

The current forecast implementation is required to preserve:

1. More remaining work cannot reduce estimated workload.
2. Slower task-time assumptions cannot reduce estimated workload.
3. Higher W/U cannot reduce Repair demand when all other assumptions are held equal.
4. Worse root-cause compression cannot reduce Repair demand.
5. Higher daily capacity cannot reduce stress-grid fit.
6. Unknown/insufficient observed samples cannot emit personal P20/P50/P80.
7. A full stress grid is not labeled a completion probability.
8. Navigation/question contact cannot silently become source-learning completion.
9. Xiao1000 accuracy cannot be converted directly into exam score.
10. Forecast cannot output next-action/priority/target-minutes strategy fields.
11. Missing later Analysis/current-year source keeps total-score confidence wide/unknown.
12. Explicit learner evidence may narrow a structural Unit case without rewriting historical evidence.
13. Missing later-stage cost components keep whole-cycle workload UNKNOWN.
14. Explicit Analysis/source/Mock ranges add monotonically to whole-cycle workload rather than becoming hidden constants.

## Current automated test owner

`static-web/scripts/test-politics-forecast.mjs`

It attacks:

- 5832-scenario grid size;
- capacity monotonicity;
- parameter-stress monotonicity;
- personal-interval sample gate;
- extreme over-counted attempt input;
- missing evidence;
- later-source UNKNOWN vs READY boundary;
- no-strategy invariant.

The subject Daily Packet test also asserts:

- question type is preserved;
- cumulative single/multiple first-attempt counts are exported separately.

## Remaining Forecast attacks before final maturity

Still required:

- real learner backfit once U exists;
- bad-week and capacity-collapse replay against real data;
- multiple-choice W/U materially worse than single;
- Memory relapse after stable period;
- Repair-cluster compression worse than seed range;
- future-source assimilation unexpectedly expensive — now representable as an explicit later-stage workload range; Real U/real Source still supplies the value;
- Analysis first-output cost much larger than planned;
- current-year fresh evidence contradicting Xiao1000-derived optimism;
- same workload under reordered irrelevant metadata gives same conclusion;
- stale/partial Daily Packet preserves UNKNOWN instead of fake stability.

No current report claims Kian-specific calibration.
