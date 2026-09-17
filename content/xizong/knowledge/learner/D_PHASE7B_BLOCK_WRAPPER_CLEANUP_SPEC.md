# D Neuro · Sensory · Motor · Orthopedics — Phase 7B Block Wrapper Cleanup Spec

Status: **EXECUTION SPEC — CONTENT STAGE**  
Depends on: accepted D K + L + `d-neuro-sensory-motor-orthopedics-content.json`  
Scope: **canonical Block wrapper semantics only**  
Forbidden: KP medical-Core rewrite, LG redesign, Projection/UI, Runtime

---

## 0｜Purpose

D canonical Block Markdown currently mixes two responsibilities:

1. valid medical Core / Source provenance / KP identity;
2. legacy learner-route wrapper metadata and prose created before the final accepted D Learning Logic.

Phase 7B removes the stale second learner route while preserving medical Core byte/semantic identity as far as practical.

Hard rule:

> **This phase edits the wrapper around Core, not the Core itself.**

---

## 1｜Files in scope

Exactly the 27 canonical D Block Markdown owners:

```text
N1–N11 under n-n1-n11/
O1–O16 under o-o1-o16/
```

Do not rename files. Legacy filename suffixes are packaging history, not authority.

---

## 2｜Deterministic frontmatter cleanup

For every D Block Markdown:

### Remove learner-route duplication

Remove frontmatter fields:

```yaml
prerequisites:
next_blocks:
```

Reason:

- hard readiness belongs only to accepted `d-neuro-sensory-motor-orthopedics-learning.json → system_route.requires`;
- default route / `benefits_from` also belong only to the accepted Learning owner;
- Block Markdown owns medical Core, not a second learner-route graph.

Do **not** replace these with a second locally copied readiness list.

### Preserve

Preserve unchanged unless a separate upstream defect is discovered:

```text
block_id
stable KP ids/order
study_refs / provenance
title/order
outline units/counts
visual_gates
Source gap/conflict fields
ownership/boundary statements that remain medically correct
```

`study_refs.action = recall / recall_apply / primary / integration...` may remain because it records Source/ownership action, not machine hard readiness.

---

## 3｜Old route inventory → accepted interpretation

The current frontmatter contains historical relations like these. They must **not** survive as hard readiness after wrapper cleanup.

### Neural

| Block | Legacy prerequisite signal | Accepted interpretation |
| --- | --- | --- |
| N1 | membrane/electrical baseline | benefit/reactivation only |
| N2 | N1 + membrane baseline | no inside-D hard prerequisite; N1 benefit |
| N3 | N1 + N2 + cell-signaling/autonomic baseline | no inside-D hard prerequisite; local/bounded reactivation |
| N4 | N1 + N2 + N3 + membrane baseline | no inside-D hard prerequisite; benefits only |
| N5 | N1 + N2 + membrane baseline | no inside-D hard prerequisite; benefits only |
| N6 | N5 + N3 + membrane baseline | no inside-D hard prerequisite; N5/N3 benefit |
| N7 | N5 + membrane baseline | no inside-D hard prerequisite; N5/N1 benefit |
| N8 | N1 + N2 + N3 + N4 | no inside-D hard prerequisite; benefits only |
| N9 | N2 + N5 | no inside-D hard prerequisite; benefits only |
| N10 | N2 + N3 + N9 | no inside-D hard prerequisite; benefits only |
| N11 | N1 + N5 + N8 | **true hard readiness; remains only in accepted Learning owner** |

### Orthopedics

| Block | Legacy prerequisite signal | Accepted interpretation |
| --- | --- | --- |
| O1 | N1/N4/N5/N8/N11 | no hard prerequisite; integration/orientation may form independently |
| O2 | O1 + repair/shock baselines | no hard prerequisite; benefits/local repair |
| O3 | O1 + O2 + N11 + shock/ventilatory baselines | **hard N11 only**; others benefit/reactivation |
| O4 | N11 + O1 + O3 | **hard N11 only** |
| O5 | N1 + N4 + N11 + O1 + O2 | **hard N11 only** |
| O6 | O2 + O5 + N11 | no hard prerequisite; benefits only |
| O7 | O2 + O5 | no hard prerequisite; benefits only |
| O8 | O2 + O5 | no hard prerequisite; benefits only |
| O9 | O1 | no hard prerequisite |
| O10 | O7 | no hard prerequisite |
| O11 | N11 + O5 | no whole-Block hard prerequisite; N11 local reactivation only for LG05 |
| O12 | O11 | no hard prerequisite |
| O13 | common infection/source-control owners | external/local reactivation when available; not D hard legality |
| O14 | common TB/R7 + O13 | benefits/external reactivation; not D hard legality |
| O15 | H17 + O10 + O14 | benefits/external reactivation; not D hard legality |
| O16 | tumor-general/H8/O2/O13/O14 | benefits/external reactivation; not D hard legality |

Machine truth remains only:

```text
N1 + N5 + N8 → N11
N11 → O3 / O4 / O5
```

---

## 4｜FIRST PASS wrapper templates

Do not copy one literal flow across all 27 Blocks.

### Template A — `WHOLE_BLOCK_SOURCE`

Use for:

```text
N1 N2 N3 N9
O2 O6 O7 O8 O9 O10 O12 O15
```

Content wording should express:

```text
KianOS bounded orientation / attention
→ one continuous original Lecture contact for this compact coherent Source unit
→ normal return to KianOS
→ accepted LG retrieval + closure
→ Block Recall
```

Rules:

- full KianOS KP Core is not a compulsory second continuous read;
- Source visuals are consumed in the original Lecture;
- Core is checked/revealed/repaired after retrieval as needed.

### Template B — `NATURAL_SOURCE_UNITS`

Use for:

```text
N4 N5 N6 N7 N8 N10
O3 O4 O5 O11 O13 O14 O16
```

Content wording should express:

```text
Block orientation
→ Source Unit 1 continuous original Lecture contact
→ return + relevant LG retrieval/closure
→ Source Unit 2 ...
→ ...
→ Block Recall after all units/LGs close
```

Hard invariant:

> Source Unit count comes from accepted Learning; LG count must never cause extra device bouncing.

Exact Source-unit → LG realization lives in:

`d-neuro-sensory-motor-orthopedics-content.json`

Do not copy it into a second divergent table inside every Block unless the Block needs a human-readable stop line.

### Template C — `INTEGRATION_PRIMARY`

Use for:

```text
N11 O1
```

Content wording should express:

```text
KianOS integration/orientation/retrieval is primary
→ retrieve accepted prior owners where truly required/available
→ targeted Source return only for decisive visuals, exact wording or uncertainty
→ LG closure / Block Recall
```

Forbidden:

```text
new mandatory continuous N11 Lecture pass
new mandatory continuous O1 whole-orthopedics Lecture pass
```

---

## 5｜Block-specific wrapper corrections

### N11

Current stale wording:

```text
FIRST PASS 固定流程
Framework → 对应生理 / 外科 Lecture 与原图 → ...
```

Replace role semantics with:

```text
Integration Primary
→ hard consume N1 + N5 + N8
→ KianOS localization synthesis/retrieval
→ targeted tract/root/nerve/cord Source visual or surgery wording return only when needed
→ no new full neurology/orthopedic Lecture pass
```

Keep medical Core and Source-boundary warnings unchanged.

### O1

Current stale wrapper includes broad neural `prerequisites` and `Primary Study` wording across the whole orthopedic chapter.

Replace role semantics with:

```text
Orthopedic entry integration/orientation
→ no hard D prerequisite
→ KianOS forms structure–stability–danger–evidence–function coordinate
→ targeted shared Source visual / evidence wording when available
→ specific disease Primary stays O2–O16
```

Do not imply `N1–N11 已建立` as learner truth.

### O11

Make explicit that:

```text
LG01–04 chronic soft-tissue/growth unit = independent of N11
LG05 chronic nerve-entrapment unit = may reactivate N11 root-vs-named-nerve language
```

No whole-Block gate.

### O3/O4/O5

Wrapper may state one true hard dependency:

```text
N11 localization bridge required
```

Do not locally recreate the full prerequisite graph or claim O2/O1 completion is mandatory.

---

## 6｜Default-route prose repair

Search Block introductions/ownership prose for phrases equivalent to:

```text
N1已经建立...
N1–N3已经建立...
N5已建立...
前序已经完成...
把 N1–N11 已建立的...
```

Decision rule:

### True hard dependency

May say:

```text
本 Block 消费已形成的 N11 / N1+N5+N8 模型；缺失则不能完成该 integration closure。
```

### Benefits-from / default route

Use language like:

```text
按默认低切换路线可直接复用 X；
若尚未完整学过 X，只做当前动作所需的最小局部 reactivation，不阻塞本 Block Primary Source 形成。
```

Never manufacture actual learner completion.

---

## 7｜Core-preservation guard

Phase 7B must not opportunistically edit:

```text
<!-- kianos:kp id=... --> identity
KP ordering
medical definitions/mechanisms
diagnostic/treatment facts
Source conflict values
Source gap values
visual gate membership
Outline primary accounting
```

If a wrapper cleanup reveals a real medical contradiction, stop that file and reopen the earliest responsible upstream owner rather than silently fixing it in Phase 7B.

---

## 8｜Validation / receipt requirements

After Phase 7B execution, record:

```text
27/27 Block wrappers inspected
prerequisites field count = 0
next_blocks field count = 0
27/27 first-pass role semantics match accepted Source-contact mode
N11/O1 integration-primary wording = PASS
O11 whole-Block gate wording absent
O3/O4/O5 true N11 dependency preserved semantically
KP ids/order unchanged
Source gap/conflict fields unchanged
```

Content still does not PASS at Phase 7B. Next is LG-by-LG content sufficiency/density audit.

---

## 9｜Exit

Expected Phase-7B exit:

```text
wrapper authority cleanup      PASS
medical Core                   unchanged
accepted Learning              unchanged
Content stage                  ACTIVE
next                            Phase 7C neural content sufficiency/density audit
P/R/E                           frozen
```
