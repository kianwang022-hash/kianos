# A · Cardio–Pulmonary–Renal SuperSystem Logic

Status: LOGIC CANDIDATE · CONTENT NOT ADMITTED  
Role: cross-System compression logic for A1 Circulation + A2 Respiratory + A3 Urinary  
Current medical owners remain: `a1-circulation/system.json`, `a2-respiratory/system.json`, `a3-urinary/system.json` and their canonical Block/KP Core.

This file answers only:

> **Why does a Cardio–Pulmonary–Renal SuperSystem deserve to exist, what cross-System problem does it compress, and under what conditions should it disappear?**

It does **not** define teaching content, learner sequence, Recall implementation, UI, runtime state, questions, Memory, or Acceptance.

---

## 0｜Highest constraint: 275+ or delete it

The SuperSystem has no value merely because it is medically elegant, conceptually higher-level, visually impressive, or architecturally symmetric.

Its only legitimate reason to exist is to improve Kian's probability of reaching:

> **306 西医综合 275+**

Every later Learn / Content / UI decision must pass at least one of these tests:

```text
Does it make first-round understanding faster or more stable?
OR
Does it reduce repeated review and improve second-round discrimination / cross-System application?
OR
Does it make final-sprint retrieval materially faster and thinner?
```

If not, it is not admitted.

Hard rule:

> **Compression that creates more study burden than retrieval / transfer / score value is negative value and must be deleted, even when the model is intellectually correct.**

Therefore the SuperSystem is a **performance overlay**, not a new curriculum layer.

It must never create an independent required study quota, KP inventory, question quota, Memory queue, review debt, or completion burden.

---

## 1｜Architectural status: Overlay, not a mandatory hierarchy level

Current Xizong natural learning units remain:

```text
System
→ Block
→ Logic Group
→ KP
```

The SuperSystem does **not** automatically change this into:

```text
SuperSystem
→ System
→ Block
→ Logic Group
→ KP
```

That would make every first-pass route longer merely because a higher abstraction exists.

Instead:

```text
A1 / A2 / A3 normal mainline
        ↕
optional cross-System SuperSystem overlay
```

The overlay appears only when its compression is useful and may remain completely invisible during local learning where one System already explains the problem efficiently.

This distinction is fundamental:

- **System hierarchy** = stable medical / learning ownership.
- **SuperSystem overlay** = selective cross-System compression and retrieval aid.
- **learner route** = phase- and evidence-dependent; it does not have to pass through every abstraction layer.

Hard rule:

> **Higher abstraction does not earn a mandatory learner step.**

---

## 2｜Problem this layer exists to solve

A1, A2 and A3 are each coherent local causal Systems, but important 306 reasoning can cross their borders before a disease label is known.

The missing compression is not another organ chapter. It is a compact answer to four recurring organism-level questions:

1. **Can oxygen enter blood?**
2. **Can oxygenated blood reach tissue in enough flow?**
3. **Is circulating volume/composition compatible with stable perfusion and cellular function?**
4. **Can CO₂, non-volatile acid, water, electrolytes and renal-excreted solutes be removed or regulated fast enough to keep the internal environment viable?**

Without an integration layer, these relations may need to be repeatedly reconstructed across Respiratory, Circulation and Urinary.

The overlay exists only if it **reduces** that reconstruction cost.

---

## 3｜SuperSystem mission

> **Maintain tissue viability by coupling gas exchange, blood flow and extracellular-fluid regulation into one core homeostatic loop with explicit interfaces to the rest of the organism.**

The three Systems contribute different irreducible functions:

- **Respiratory:** load O₂ into blood, remove CO₂, regulate the respiratory side of acid–base balance.
- **Circulation:** generate and distribute pressure/flow so blood reaches organs and returns to the heart.
- **Urinary:** regulate extracellular volume, water, electrolytes, bicarbonate/non-volatile acid handling and renal-solute excretion; renal perfusion simultaneously depends on the circulation it helps stabilize.

A3 belongs here **not because kidney is another oxygen-delivery organ**, but because tissue viability requires a stable circulating medium and because kidney ↔ circulation feedback determines future volume/perfusion while kidney ↔ lung coupling stabilizes acid–base state.

No single A System owns the organism-level problem.

---

## 4｜Mother model

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

This is a **closed core physiological loop with explicit external interfaces**. It is not three chapters placed side by side and not a complete model of the whole organism.

Minimum relationship:

```text
Tissue delivery = Flow × Blood content

Homeostatic stability
= adequate delivery
+ adequate gas / renal-solute removal
+ controlled circulating volume / composition
```

Exact formulas, coefficients, disease thresholds, diagnosis and treatment remain in canonical System / Block owners.

---

## 5｜Three admitted cross-System loops

### Loop A · Oxygen Delivery

```text
lung oxygenation
→ arterial oxygen content
→ cardiac output / distribution
→ tissue delivery
```

Key distinction:

> **oxygenation failure ≠ oxygen-content failure ≠ flow failure ≠ distribution/use failure**

The overlay owns the distinction, not the detailed causes.

### Loop B · Perfusion ↔ Volume

```text
cardiac output / arterial pressure
→ renal perfusion
→ renal Na-water handling + RAAS / distal regulation
→ extracellular / effective arterial blood volume
→ venous return + preload + vascular load
→ cardiac output / pressure
```

Key distinction:

> **the kidney depends on perfusion while helping set the volume state that determines future perfusion.**

### Loop C · CO₂ / Acid–Base

```text
cellular metabolism
→ CO₂ + non-volatile acid production
→ lung changes CO₂ elimination rapidly
↔ kidney changes HCO₃⁻ conservation/generation and H⁺ excretion more slowly
→ pH stability
```

Key distinction:

> **lung and kidney are coupled acid–base actuators acting through PaCO₂ and HCO₃⁻ on the same pH problem, with different time scales.**

### Why only three

Pulmonary circulation/right-heart coupling, congestion, edema and similar phenomena are currently treated as **derived intersections** of Oxygen Delivery and Perfusion↔Volume.

Do not create a fourth loop unless repeated real 306 reasoning shows that the existing three cannot localize an important cross-System problem without awkward exceptions.

---

## 6｜Minimal shared coordinates

Candidate integration coordinates are deliberately few:

- **Flow / perfusion:** CO, organ perfusion, effective arterial blood volume.
- **Pressure:** systemic arterial pressure and relevant upstream/downstream pressure relations.
- **Oxygen state:** PaO₂ / SaO₂ / arterial O₂ content / tissue delivery.
- **Volume state:** ECF volume / effective arterial blood volume / venous return.
- **Gas–acid state:** PaCO₂ / HCO₃⁻ / pH.
- **Renal response:** renal perfusion / GFR as consequence and regulator interface.

These are coordinates for localization, not a new fact list to memorize.

---

## 7｜External interfaces — explicit non-closure

A1+A2+A3 do not form a complete model of the organism. Important inputs remain externally owned:

- **Hb / RBC mass** → Hematology; modifies arterial O₂ content.
- **metabolic demand / substrate use / CO₂ production** → metabolism/endocrine.
- **autonomic and endocrine control** → neuro/endocrine interfaces where appropriate.
- **systemic inflammation / infection** → defense/infection owners.
- **hepatic and other non-renal clearance / metabolism** → outside this SuperSystem.

Hard rule:

> **An interface may enter the model without transferring ownership of its source domain.**

---

## 8｜Phase utility requirement

The same overlay may have different thickness across exam phases. It must become **thinner as the exam approaches**, never thicker.

### First round｜建模，不加课

Allowed value:

- make A1/A2/A3 easier to understand where they genuinely intersect;
- prevent isolated memorization of perfusion, oxygenation, volume and acid–base mechanisms;
- provide a tiny orientation frame when a cross-System relation is needed.

Forbidden:

- a separate SuperSystem lecture before A1/A2/A3;
- a new memorization list;
- delaying Lecture / Block mainline to “finish integration”.

Success criterion:

> **better local understanding with negligible extra workload.**

### Second round｜判别、迁移、减少重复

Expected highest-value phase.

Allowed value:

- discriminate oxygenation vs O₂-content vs flow/perfusion failure;
- reason through heart–kidney volume/perfusion feedback;
- connect respiratory and renal acid–base responses;
- localize mixed cases before jumping to disease labels;
- replace repeated review of duplicated cross-System mechanisms with one shared reconstruction when safe.

Success criterion:

> **fewer repeated reviews + faster localization + better mixed-question/case discrimination.**

### Final sprint｜极薄调用骨架

Allowed value:

- one rapid organism-level reconstruction;
- a few decisive cross-System distinctions;
- a fast entry point for mixed-case localization.

Forbidden:

- rereading a long SuperSystem document;
- an independent Recall schedule;
- adding details that belong to System-level review.

Success criterion:

> **retrieval is faster because the overlay exists.**

If the final version cannot become substantially thinner than earlier use, progressive compression has failed.

---

## 9｜Admission rule for any future SuperSystem

There is **no requirement** that Xizong have a symmetric set of SuperSystems.

A123 is a pilot because it already exposes strong cross-System loops and A3 explicitly reserved the higher cardio-pulmonary-renal owner.

B / C / D / E / F do not automatically become SuperSystems merely because their directories combine multiple domains.

Any future SuperSystem must independently prove:

1. repeated cross-System reconstruction exists;
2. a small shared model materially reduces that cost;
3. the shared model improves exam reasoning or review compression;
4. it does not duplicate local medical owners;
5. it does not create meaningful new maintenance burden.

Possible outcomes are all legitimate:

```text
A has a durable SuperSystem overlay
B remains one broad System/domain
C gains only one cross-System overlay
D/E/F gain none
```

Architecture follows score utility, not symmetry.

---

## 10｜What this layer must NOT become

The SuperSystem is invalid if it becomes any of the following:

- a fourth Lecture covering heart, lung and kidney again;
- a new KP namespace duplicating A1/A2/A3 facts;
- a new question taxonomy or question owner;
- a mandatory review queue creating independent Memory debt;
- a disease encyclopedia organized by “multi-organ disease”;
- a second owner for local formulas, thresholds, diagnoses, drugs or procedures;
- a UI-first diagram whose semantics do not exist independently of the page;
- a reason to force all other Xizong Systems into symmetric SuperSystems;
- a fixed extra learning step regardless of performance value.

A relation belongs here only when its value comes specifically from integrating **two or more Systems / external interfaces**.

---

## 11｜Compression + score-utility test

The overlay earns continued existence only if all are true:

1. **Cross-System necessity:** removing it materially increases repeated reconstruction across A1/A2/A3.
2. **Compression gain:** useful integration remains a small mother model + few loops/coordinates.
3. **No duplication:** local medical truth stays in System / Block / KP owners.
4. **Transfer value:** it helps localize unfamiliar or mixed cases before disease-label recall.
5. **Phase value:** at least one exam phase receives material benefit and later use becomes thinner.
6. **Net workload benefit:** added contact time is outweighed by reduced relearning, faster retrieval, better discrimination or fewer cross-System errors.
7. **Reversibility:** removal does not damage A1/A2/A3.

Hard kill rule:

> **If real use shows noticeable extra learning/maintenance time without lower errors, lower review cost or faster retrieval, collapse or delete the overlay.**

A large independent curriculum is itself evidence that the Logic has failed.

---

## 12｜Current Logic decision

**KEEP A123 provisionally as an optional performance overlay, not as a mandatory new learner hierarchy level.**

Working semantic name:

> **A · Delivery & Homeostasis｜输送与内环境稳态**

Engineering description:

> **Cardio–Pulmonary–Renal SuperSystem**

Naming is not yet the important decision. The important decision is the contract:

```text
local problem → stay inside owning System
cross-System problem → overlay may compress
no compression gain → overlay stays invisible
no score/workload value in real use → overlay dies
```

---

## 13｜Logic freeze gate before Content

Do **not** create Content or UI merely because this file exists.

Before Content is admitted, Logic must remain stable under these challenges:

- removing A1, A2 or A3 should break a genuinely important admitted loop;
- every top-level relation should require at least two Systems/interfaces;
- local disease detail should be explainable without moving ownership upward;
- three loops should cover the intended high-value intersections without obvious bloat;
- the overlay should plausibly save more study/review time than it costs;
- no other Xizong domain should be promoted merely for structural symmetry.

Only after these conditions are accepted should **Content** ask:

> **What is the minimum information necessary to realize this Logic across first round, second round and final sprint?**

Learn / learner timing can then be derived from the accepted Logic + admitted minimum Content rather than inventing a new course in advance.