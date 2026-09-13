# A · Cardio–Pulmonary–Renal SuperSystem Logic

Status: DRAFT · LOGIC ONLY  
Role: cross-System integration logic owner for A1 Circulation + A2 Respiratory + A3 Urinary  
Current medical owners remain: `a1-circulation/system.json`, `a2-respiratory/system.json`, `a3-urinary/system.json` and their canonical Block/KP Core.

This file answers only:

> **Why does a Cardio–Pulmonary–Renal SuperSystem deserve to exist, what cross-System problem does it compress, and what must it never own?**

It does **not** yet define learner order, teaching content, Recall, UI, runtime state, questions, Memory, or Acceptance.

---

## 0｜Exam-first constraint

The SuperSystem has no value merely because it is medically elegant, conceptually higher-level, visually impressive, or architecturally symmetric.

Its only legitimate reason to exist is to improve Kian's probability of reaching the Xizong target:

> **306 西医综合 275+**

Every later Learn / Content / UI decision must therefore pass a strict utility test:

```text
Does this make first-pass understanding faster or more stable?
OR
Does this make second-pass discrimination / cross-System application better?
OR
Does this make final-sprint retrieval materially faster and thinner?
```

If the answer is **no**, the feature/content/review step is not admitted.

Hard rule:

> **Compression that creates more study burden than retrieval/transfer value is negative value and must be deleted, even if the model is intellectually correct.**

This means the SuperSystem is a **performance overlay**, not a new curriculum layer.

It must never create an independent required study quota, independent KP inventory, independent question quota, or independent Memory/review debt.

---

## 1｜Problem this layer exists to solve

A1, A2 and A3 are each coherent local causal Systems, but important 306 reasoning often crosses their borders before a disease label is known.

The missing compression is not another organ chapter. It is a whole-body answer to four recurring questions:

1. **Can oxygen enter blood?**
2. **Can oxygenated blood reach tissue in enough flow?**
3. **Is the circulating fluid volume/composition compatible with stable perfusion and cellular function?**
4. **Can CO₂, non-volatile acid, water, electrolytes and renal-excreted solutes be removed or regulated fast enough to keep the internal environment viable?**

Without an integration layer, these relations are repeatedly reconstructed ad hoc across Respiratory, Circulation and Urinary. The SuperSystem exists only if it compresses those repeated cross-System relations without duplicating the Systems themselves.

---

## 2｜SuperSystem mission

> **Maintain tissue viability by coupling gas exchange, blood flow and extracellular-fluid regulation into one core homeostatic loop with explicit interfaces to the rest of the organism.**

The three Systems contribute different irreducible functions:

- **Respiratory:** load O₂ into blood, remove CO₂, and regulate the respiratory side of acid–base balance.
- **Circulation:** generate and distribute pressure/flow so blood actually reaches organs and returns to the heart.
- **Urinary:** regulate extracellular volume, water, electrolytes, bicarbonate/non-volatile acid handling and renal-solute excretion; renal perfusion simultaneously depends on the circulation it helps stabilize.

None of the three alone owns tissue oxygen delivery or whole-body homeostasis.

A3 is required **not because the kidney is another oxygen-delivery organ**, but because tissue viability depends on a stable circulating medium and because kidney ↔ circulation feedback determines future volume/perfusion while kidney ↔ lung coupling stabilizes acid–base state.

---

## 3｜Mother model

```text
external O₂
→ ventilation / alveolar opening
→ diffusion + V/Q matching
→ arterial O₂ content
→ cardiac output + pressure + flow distribution
→ tissue O₂ delivery / cellular use
→ CO₂ + non-volatile acid + renal-excreted solute load
→ lung removes CO₂
→ kidney regulates water / Na / K / HCO₃⁻ / H⁺ and renal-solute excretion
→ circulating volume + composition are reset
→ venous return / cardiac filling
→ loop repeats
```

This is a **closed core physiological loop with explicit external interfaces**, not three chapters placed side by side and not a complete model of the whole organism.

The minimum high-level relationship is:

```text
Tissue delivery = Flow × Blood content
Homeostatic stability = adequate delivery + adequate gas/renal-solute removal + controlled circulating volume/composition
```

Exact formulas, coefficients and disease-specific thresholds remain in their canonical System / Block owners until the Content layer intentionally projects them.

---

## 4｜Three cross-System control loops

### Loop A · Oxygen Delivery

```text
lung oxygenation
→ arterial oxygen content
→ cardiac output / distribution
→ tissue delivery
```

Core distinction:

> **oxygenation failure ≠ oxygen-content failure ≠ flow failure ≠ distribution/use failure**

The SuperSystem owns this distinction as a cross-System coordinate. It does not own the detailed causes inside A1/A2 or hematology.

### Loop B · Perfusion ↔ Volume

```text
cardiac output / arterial pressure
→ renal perfusion
→ renal Na-water handling + RAAS / distal regulation
→ extracellular / effective arterial blood volume
→ venous return + preload + vascular load
→ cardiac output / pressure
```

Core distinction:

> **the kidney depends on perfusion while simultaneously helping set the volume state that determines future perfusion.**

This feedback loop is the main reason A1 and A3 cannot be understood as completely independent at organism level.

### Loop C · CO₂ / Acid–Base

```text
cellular metabolism
→ CO₂ + non-volatile acid production
→ lung changes CO₂ elimination rapidly
↔ kidney changes HCO₃⁻ conservation/generation and H⁺ excretion more slowly
→ pH stability
```

Core distinction:

> **respiratory and renal acid–base control are two coupled actuators acting through PaCO₂ and HCO₃⁻ on the same pH problem, with different response time scales.**

Detailed acid–base rules remain in A2/A3 content owners.

### Why only three loops for now

Pulmonary circulation/right-heart coupling, congestion, edema and other cross-organ phenomena are currently treated as **derived intersections** of Oxygen Delivery and Perfusion↔Volume rather than promoted to a fourth top-level loop.

Hard rule:

> **Do not create another SuperSystem loop unless the existing three repeatedly fail to localize an important cross-System problem without awkward exceptions.**

---

## 5｜Shared coordinates

The SuperSystem should remain compressible to a small coordinate set. Candidate cross-System coordinates are:

- **Flow / perfusion:** CO, organ perfusion, effective arterial blood volume.
- **Pressure:** systemic arterial pressure and relevant upstream/downstream pressure relationships.
- **Oxygen state:** PaO₂ / SaO₂ / arterial O₂ content / tissue delivery.
- **Volume state:** ECF volume / effective arterial blood volume / venous return.
- **Gas–acid state:** PaCO₂ / HCO₃⁻ / pH.
- **Renal response:** renal perfusion / GFR as consequence and regulator interface.

These are integration coordinates, not a new canonical fact list.

---

## 6｜External interfaces — deliberate non-closure

A1+A2+A3 do **not** form a completely closed model of the organism. The SuperSystem must expose important inputs from other domains rather than silently absorb them.

Examples:

- **Hb / RBC mass** → owned by Hematology; affects arterial O₂ content.
- **metabolic demand / substrate use / CO₂ production** → interfaces with metabolism/endocrine.
- **autonomic and endocrine control** → may cross into neuro/endocrine owners even when A1/A3 use those signals locally.
- **systemic inflammation / infection** → may alter vascular tone, permeability, lung function and kidney perfusion but remains owned by the relevant defense/infection domain.
- **hepatic and other non-renal clearance / metabolism** → remains outside this SuperSystem even when a case alters circulating composition.

Hard rule:

> **An interface may enter the SuperSystem model without transferring ownership of the source domain.**

---

## 7｜Phase utility requirement

The same SuperSystem is allowed to have different thickness across exam phases. It must become **thinner as the exam approaches**, never thicker.

### First round｜建模，不加课

Allowed value:

- reduce the cost of understanding why A1/A2/A3 connect;
- prevent isolated memorization of perfusion, oxygenation, volume and acid–base mechanisms;
- provide a small orientation frame when entering or crossing Systems.

Forbidden:

- a separate SuperSystem lecture before the three Systems;
- memorizing a new fact list;
- delaying the main Lecture/Block path merely to complete integration material.

First-round success means:

> **A123 becomes easier to understand with the overlay than without it, with negligible extra workload.**

### Second round｜判别与迁移

This is expected to be the SuperSystem's highest-value phase.

Allowed value:

- distinguish oxygenation vs O₂-content vs flow/perfusion failure;
- reason through heart–kidney volume/perfusion feedback;
- connect respiratory and renal acid–base responses;
- localize cross-System cases before jumping to disease labels;
- compress repeated mechanisms instead of reviewing three Systems independently where one shared model is sufficient.

Second-round success means:

> **fewer repeated reviews + faster cross-System localization + better discrimination on mixed questions/cases.**

### Final sprint｜极薄调用骨架

Allowed value:

- one rapid organism-level reconstruction;
- a few decisive cross-System distinctions;
- a compact entry point for mixed-case localization.

Forbidden:

- rereading a long SuperSystem document;
- maintaining an independent recall schedule;
- adding new details that should have remained in System-level review.

Final-sprint success means:

> **the overlay can be reconstructed quickly enough to save time, not consume it.**

If the final version cannot become substantially thinner than the first-round version, the design has failed progressive compression.

---

## 8｜What this layer must NOT become

The SuperSystem is invalid if it becomes any of the following:

- a fourth Lecture covering heart, lung and kidney again;
- a new KP namespace duplicating A1/A2/A3 facts;
- a new question taxonomy or question owner;
- a mandatory review queue that creates independent Memory debt;
- a disease encyclopedia organized by “multi-organ disease”;
- a second owner for local System formulas, thresholds, diagnoses, drugs or procedures;
- a UI-first diagram whose semantics do not exist independently of the page;
- a reason to force all other Xizong Systems into symmetric SuperSystems;
- a fixed extra learning step that must be completed regardless of whether it improves exam performance.

A relation belongs here only when its value comes specifically from integrating **two or more Systems / external interfaces**.

---

## 9｜Compression and score-utility test

This layer earns its existence only if all are true:

1. **Cross-System necessity:** removing it materially increases repeated reconstruction across A1/A2/A3.
2. **Compression gain:** the useful integration can remain a small mother model + a few cross-System loops/coordinates.
3. **No duplication:** local medical truth remains in existing System / Block / KP owners.
4. **Transfer value:** the model helps localize unfamiliar cases before a disease label is known.
5. **Phase value:** it has a clear role in first round, second round and/or final sprint, with later phases becoming thinner.
6. **Net workload benefit:** any added learning time is outweighed by reduced relearning, faster retrieval, better discrimination or fewer cross-System mistakes.
7. **Reversibility:** if real use shows no added retrieval/transfer/score value, the layer can be removed without damaging A1/A2/A3.

Hard kill rule:

> **If real use shows that Kian must spend noticeable extra time learning/maintaining the SuperSystem but it does not reduce errors, review time or retrieval latency, delete or collapse it.**

If the layer requires a large independent curriculum to feel useful, Logic has failed and should be redesigned rather than expanded.

---

## 10｜Current Logic decision

**Provisional decision: KEEP the A1+A2+A3 SuperSystem concept only as a performance overlay.**

Reason: A1, A2 and A3 each own a different irreducible actuator in the same organism-level delivery/homeostasis problem, and A3 already explicitly reserves `cardio-pulmonary-renal SuperSystem` for a higher owner instead of pre-building it locally.

But existence is conditional:

> **No proven compression / transfer / exam-phase value → no durable SuperSystem.**

Current working name:

> **A · Delivery & Homeostasis｜输送与内环境稳态**

Alternative descriptive name retained for engineering clarity:

> **Cardio–Pulmonary–Renal SuperSystem**

Naming is not yet frozen; semantics above are the Logic owner.

---

## 11｜Gate to the next layer

Do **not** design Content / UI yet.

The next layer is **Learn**, and it must solve a stricter problem than “how to teach this model”:

> **How can this overlay reduce total study/review cost and improve 275+ exam performance across first round, second round and final sprint without becoming a new course?**

Learn is allowed to proceed only if it can define:

- when the overlay appears and when it stays invisible;
- the minimum learner contact needed in first round;
- how second-round mixed-question/case evidence should invoke it;
- how it collapses into an extremely thin final-sprint skeleton;
- a kill/rollback criterion when real use shows no net value.

Only after Learn is accepted should Content decide exactly what is shown, and only after Content should UI project it.