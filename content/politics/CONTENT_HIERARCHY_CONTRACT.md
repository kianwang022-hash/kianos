# Politics Content Hierarchy Contract

Status: **CURRENT CANDIDATE — Content Layer**

Role: define **learner attention hierarchy** for accepted Politics content before Projection/UI presentation.

Authority order:

1. `LEARNING_CONTRACT.md` — what the learner is trying to achieve;
2. `INTERACTION_CONTRACT.md` — when each cognitive state owns attention;
3. `CONTENT_SEMANTICS_CONTRACT.md` — what semantic objects exist;
4. this file — which accepted objects deserve attention first, later, or only on demand;
5. Projection / Astro — downstream consumers only.

This file does **not** own political knowledge, source truth, pixels, cards, columns, font sizes, or diagram choice.

---

## 1 | Core invariant

> **If KianOS chooses to show content by default, it is asking the learner to spend attention on it. That attention cost must be justified by the Content layer, not guessed by the UI.**

Therefore:

```text
accepted semantic content
→ learner attention tier
→ state filter (ORIENT / EXTERNAL_LEARN / CLOSE / VERIFY / REPAIR)
→ Projection / representation
→ UI
```

A field existing in JSON does not entitle it to default learner visibility.
A Projection object existing does not make all of its detail equally important.
Suyi being useful does not make Suyi a second learner course.

---

## 2 | Five learner tiers

### `H1_ORIENTATION_CORE`

The smallest content needed to know **what this Natural Unit is solving and what structural relation to hold while entering Chengfeng**.

Typical content:
- current `Problem`;
- one minimal primary relation / comparison / stage / hierarchy skeleton when it materially reduces source-reading load;
- Chengfeng locator + small `look_for` list.

H1 is not a summary of the whole Unit. It is the entry scaffold.

### `H2_FIRST_ROUND_CARRY`

Content the learner should normally **carry out of first learning**.

Typical content:
- decisive `Boundary`;
- scarce `Anchor`;
- Current-selected `FIRST_ROUND_EXACT`;
- a short relation needed to prevent a predictable first-round misunderstanding.

H2 may be available during Orientation when necessary, but must not automatically compete with H1.

### `H3_SUPPORTING_UNDERSTANDING`

Useful explanation that helps the learner understand H1/H2 but does not deserve equal default attention.

Typical content:
- node meanings under a structural skeleton;
- secondary relation chains;
- explanatory context;
- absorbed Suyi reasoning that improves understanding but is not itself the main first-round carry target.

H3 should be readable and easy to reach, but normally does not dominate the first screen.

### `H4_ON_DEMAND`

Valid content whose value depends on timing or learner need rather than first-entry attention.

Typical content:
- `PRECISION_NOT_ORIENTATION` / `LATER_PRECISION` objects;
- optional closure / reconstruction detail;
- next-bridge detail;
- extra comparison or context useful after the main model is established.

H4 is not low-quality content. It is **not first-entry content**.

### `H5_REPAIR_REFERENCE`

Content that should appear only for a specific repair, lookup, provenance, or reference need.

Typical content:
- `REPAIR_ONLY`;
- `REFERENCE_OR_QUESTION_TRIGGERED`;
- Suyi `REPAIR_ONLY` / `REFERENCE_ONLY` material;
- source evidence ids / provenance;
- engineering ids and schema metadata;
- protected reference-only content.

H5 must never leak into default learning simply because a generic renderer can print it.

---

## 3 | Default mapping from Current semantic roles

The defaults below prevent 151 PASS Natural Units from requiring manual priority tagging.
Explicit Content-owned overrides are allowed only for real semantic exceptions.

| Current object | Default learner tier |
| --- | --- |
| `problem` | `H1_ORIENTATION_CORE` |
| primary `framework_maps` / primary relation skeleton | `H1_ORIENTATION_CORE` for labels + decisive relations; explanatory node detail is `H3_SUPPORTING_UNDERSTANDING` |
| primary timeline / compare / hierarchy selected by Current Projection | `H1_ORIENTATION_CORE` for the skeleton; explanatory detail is `H3_SUPPORTING_UNDERSTANDING` |
| `relation_chains` used only as secondary reasoning | `H3_SUPPORTING_UNDERSTANDING` |
| `boundaries` | `H2_FIRST_ROUND_CARRY` unless explicitly repair-only |
| `anchors` | `H2_FIRST_ROUND_CARRY` |
| precision `FIRST_ROUND_EXACT` | `H2_FIRST_ROUND_CARRY` |
| precision `PRECISION_NOT_ORIENTATION` | `H4_ON_DEMAND` |
| precision `LATER_PRECISION` | `H4_ON_DEMAND` |
| precision `REFERENCE_OR_QUESTION_TRIGGERED` | `H5_REPAIR_REFERENCE` |
| precision `REPAIR_ONLY` | `H5_REPAIR_REFERENCE` |
| `source_handoff.locator` + `look_for` | `H1_ORIENTATION_CORE` as an operational handoff, not knowledge content |
| `source_handoff.source_owner_ids` | `H5_REPAIR_REFERENCE` / provenance; not default learner copy |
| `recall_seed` | `H4_ON_DEMAND` at close/review time |
| optional `closure_cue` | `H4_ON_DEMAND` until `RETURN / CLOSE` owns the state |
| `after_this` / next bridge | `H4_ON_DEMAND` until `CONTINUE` owns the state |
| `source_evidence`, schema/status/audit ids | `H5_REPAIR_REFERENCE` |

### Suyi disposition mapping

Suyi does not receive a separate learner hierarchy.

- `ABSORBED` → inherits the tier of the semantic object it strengthens;
- `DUPLICATE` → no extra learner surface;
- `CROSS_UNIT` → belongs to the owning Unit / compression object;
- `REPAIR_ONLY` → H5;
- `REFERENCE_ONLY` → H5;
- `REJECTED / UNSUPPORTED` → no learner surface.

---

## 4 | Explicit override

When the default mapping is wrong for a genuine semantic reason, the owning semantic object may declare:

```json
{
  "learner_tier": "H2_FIRST_ROUND_CARRY"
}
```

Allowed values:

- `H1_ORIENTATION_CORE`
- `H2_FIRST_ROUND_CARRY`
- `H3_SUPPORTING_UNDERSTANDING`
- `H4_ON_DEMAND`
- `H5_REPAIR_REFERENCE`

Overrides are semantic decisions, not layout preferences.
They require a learner-facing reason in the bounded content audit when they materially change the default.

Hard guards:
- `problem` cannot be demoted below H1;
- `FIRST_ROUND_EXACT` cannot be demoted below H2 without changing its upstream learning priority;
- `REFERENCE_ONLY` / `REPAIR_ONLY` cannot be promoted into H1–H3 merely for visual richness;
- provenance / engineering ids cannot be promoted into H1–H4;
- an override cannot request a component, layout, diagram, color, or size.

---

## 5 | State filter

Hierarchy is filtered by the active learner state defined in `INTERACTION_CONTRACT.md`.

### `ORIENT`
Default visible attention:
- H1;
- only the smallest H2 needed to prevent immediate misunderstanding.

H3/H4/H5 do not become first-screen content merely because they exist.

### `EXTERNAL_LEARN`
Astro remains companion-only:
- compact H1 problem / structural anchor;
- Chengfeng locator + `look_for`;
- a decisive H2 boundary only when materially useful.

### `RETURN / CLOSE`
- one compact H2 carry target;
- the now-timely H4 closure / reconstruction cue.

### `VERIFY`
Question/task owns attention.
H1–H4 content that can leak the answer stays quiet before submission.

### `REPAIR`
The failure shape may temporarily promote the **smallest relevant** H2–H5 object.
Nothing else is promoted with it.

### `CONTINUE`
Show only the stable carry result and the now-timely H4 next bridge.

---

## 6 | Content object internal hierarchy

A semantic object is not one indivisible attention block.

For example, a `framework_map` contains:

```text
relation skeleton / labels        → usually H1
node explanatory meanings         → usually H3
source_evidence / owner ids       → H5
```

Likewise a chain may expose only the sequence skeleton first while keeping explanatory detail in H3.

This rule prevents a valid rich backend object from becoming a dense learner-facing card simply because all fields are available.

---

## 7 | Batch acceptance

Politics Content Hierarchy is acceptable for broad consumption when:

1. all 151 `PASS` Natural Units resolve to a deterministic hierarchy without UI inference;
2. the 9 `REFERENCE_ONLY` owners do not become teaching hierarchy;
3. every PASS Unit has an H1 `Problem` and a valid Chengfeng handoff when Current owns one;
4. Current-selected `first_round_exact` resolves only to H2;
5. secondary reasoning does not silently rise to H1 merely because its field name contains `Map`, `Chain`, `Timeline`, or similar;
6. source evidence, engineering ids and raw backend keys remain H5/non-default;
7. subject-specific cognition remains intact;
8. real learner use may still reveal a mis-tiered object; that should reopen the smallest Content owner, not trigger a generic UI redesign.

The target is not fewer facts. The target is **lower attention cost with no semantic loss**.
