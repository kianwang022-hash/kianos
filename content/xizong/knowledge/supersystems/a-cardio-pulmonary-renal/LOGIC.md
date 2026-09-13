# A · Cardio–Pulmonary–Renal Macro-Domain Logic

Status: LOGIC CANDIDATE · CONTENT NOT ADMITTED  
Role: top-level A-domain integration logic for A1 Circulation + A2 Respiratory + A3 Urinary  
Current medical owners remain: `a1-circulation/system.json`, `a2-respiratory/system.json`, `a3-urinary/system.json` and their canonical Block/KP Core.

> Terminology note: the repository path currently says `supersystems/` and older files may say `SuperSystem`. In Logic, **A is not a tier above B/C/D/E/F**. A is a top-level macro-domain peer of B/C/D/E/F. A1/A2/A3 are a privileged decomposition of A.

This file answers only:

> **What is A at the top Xizong level, why are A1/A2/A3 split into first-class Systems, what cross-System logic belongs to their common parent, and what must never be promoted upward?**

It does **not** define teaching content, learner sequence, Recall implementation, UI, runtime state, questions, Memory, or Acceptance.

---

## 0｜Highest constraint: 275+ or do not expose it to the learner

The A-level integration has no learner-facing value merely because it is medically elegant, conceptually higher-level, visually impressive, or architecturally symmetric.

Its only legitimate learner-facing reason to exist is to improve Kian's probability of reaching:

> **306 西医综合 275+**

Every later Content / Learn / UI decision must pass at least one of these tests:

```text
Does it make first-round understanding faster or more stable?
OR
Does it reduce repeated review and improve second-round discrimination / cross-System application?
OR
Does it make final-sprint retrieval materially faster and thinner?
```

If not, that learner-facing projection is not admitted.

Hard rule:

> **Compression that creates more study burden than retrieval / transfer / score value is negative value and must not reach the learner.**

This rule applies to A-level teaching/projection, not to the existence of A as a taxonomy parent. Even if learner-facing A integration later proves useless, A can remain the structural parent of A1/A2/A3 while its visible learning content collapses toward zero.

The A parent must never create an independent required study quota, KP inventory, question quota, Memory queue, review debt, or completion burden.

---

## 1｜Top-level taxonomy: A is peer to B/C/D/E/F

The intended highest-level Xizong grouping is conceptually:

```text
A · Cardio–Pulmonary–Renal
B · Digestive / Metabolic / Endocrine ...
C · Hematology / Immunity / Infection
D · Neuro / Sensory / Motor / Orthopedics
E · Reproductive / Breast
F · Remaining integrated clinical domains
```

A is therefore **not** a new layer placed above the other current Systems.

The current repository reports eight numbered Systems because A is unusually large and important and has been decomposed into three independently owned Systems:

```text
A
├─ A1 Circulation
├─ A2 Respiratory
└─ A3 Urinary

B
C
D
E
F
```

So two different granularities must not be confused:

- **macro-domain taxonomy** = A / B / C / D / E / F;
- **Current System owner granularity** = A1 / A2 / A3 / B / C / D / E / F.

The manifest's eight numbered Systems describe durable artifact/owner units. They do not prove that A1/A2/A3 should be interpreted as top-level conceptual peers of B/C/D/E/F.

Hard rule:

> **Owner granularity ≠ highest conceptual taxonomy ≠ learner route.**

---

## 2｜Why A is specially decomposed into A1 / A2 / A3

A1/A2/A3 receive independent System status because that decomposition is useful for the 275+ target, not because heart, lung and kidney are unrelated.

A split is justified when a child domain has enough of the following:

- large exam/content volume;
- a coherent local causal mother model;
- substantial independent first-pass learning work;
- distinct Block / Logic Group / KP organization;
- enough question coverage and error modes to justify independent verification;
- enough engineering/runtime scope to justify independent continuation and Acceptance.

A1, A2 and A3 meet that bar.

This creates a deliberate asymmetry:

> **A is one top-level functional domain that receives three first-class implementation/learning Systems because the exam benefit of decomposing it is high.**

The split is a performance decision, not a claim that their physiology should be learned as isolated worlds.

If another macro-domain later becomes too large and receives similar first-class subdivisions, that would be the same pattern. It would not create another mysterious tier above A/B/C/D/E/F.

---

## 3｜What the A parent actually owns

A owns only the **cross-child relations whose value appears specifically because A1, A2 and A3 are integrated**.

A does not own the union of all heart + lung + kidney facts.

The A parent may own:

- the organism-level mother model connecting gas exchange, blood flow and extracellular-fluid regulation;
- a small set of cross-System loops;
- shared localization coordinates used to distinguish which child System is failing;
- explicit external interfaces to other macro-domains;
- later phase compression where one cross-System reconstruction safely replaces duplicated review.

A must not own:

- local A1/A2/A3 formulas merely because they can be displayed together;
- disease-specific diagnosis/treatment already explained inside a child System;
- copied KP content;
- a second question bank or question taxonomy;
- a second Memory/review queue;
- an independent mandatory completion state.

Admission test for any A-level relation:

> **If one child System can explain the relation completely without losing the reason it matters, the relation does not need A-level ownership.**

---

## 4｜A-domain problem statement

A1, A2 and A3 are coherent local causal Systems, but the common A domain solves one organism-level problem:

> **Can the body maintain viable tissue delivery while keeping the circulating internal environment compatible with continued function?**

This can be decomposed into four recurring questions:

1. **Can O₂ enter blood?**
2. **Can blood with adequate content reach tissue in adequate flow?**
3. **Is circulating volume/composition compatible with stable perfusion and cellular function?**
4. **Can CO₂, non-volatile acid, water, electrolytes and renal-excreted solutes be removed or regulated fast enough to keep that system viable?**

The A-level model exists to compress the repeated reconstruction required when a problem crosses child boundaries.

It does not need to appear when a local A1/A2/A3 model already solves the task efficiently.

---

## 5｜A-domain mother model

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

Exact formulas, coefficients, disease thresholds, diagnosis and treatment remain in canonical child System / Block owners.

---

## 6｜Three admitted A-level loops

### Loop A · Oxygen Delivery

```text
lung oxygenation
→ arterial oxygen content
→ cardiac output / distribution
→ tissue delivery
```

Key distinction:

> **oxygenation failure ≠ oxygen-content failure ≠ flow failure ≠ distribution/use failure**

The A parent may own the distinction as a localization coordinate. Detailed causes remain local or external.

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

### Why only three for now

Pulmonary circulation/right-heart coupling, congestion, edema and similar phenomena are currently treated as **derived intersections** of Oxygen Delivery and Perfusion↔Volume.

Do not create a fourth A-level loop unless repeated real 306 reasoning shows that the existing three cannot localize an important cross-System problem without awkward exceptions.

---

## 7｜Minimal shared coordinates

Candidate A-level coordinates are deliberately few:

- **Flow / perfusion:** CO, organ perfusion, effective arterial blood volume.
- **Pressure:** systemic arterial pressure and relevant upstream/downstream pressure relations.
- **Oxygen state:** PaO₂ / SaO₂ / arterial O₂ content / tissue delivery.
- **Volume state:** ECF volume / effective arterial blood volume / venous return.
- **Gas–acid state:** PaCO₂ / HCO₃⁻ / pH.
- **Renal response:** renal perfusion / GFR as consequence and regulator interface.

These are coordinates for localization and compression, not a new fact list to memorize.

---

## 8｜External interfaces — explicit non-closure

A is not a complete model of the organism. Important inputs remain externally owned:

- **Hb / RBC mass** → Hematology; modifies arterial O₂ content.
- **metabolic demand / substrate use / CO₂ production** → metabolism/endocrine.
- **autonomic and endocrine control** → neuro/endocrine interfaces where appropriate.
- **systemic inflammation / infection** → defense/infection owners.
- **hepatic and other non-renal clearance / metabolism** → outside A.

Hard rule:

> **An interface may enter the A model without transferring ownership of its source domain.**

This boundary is especially important because A is a top-level macro-domain peer, not a whole-body master owner.

---

## 9｜Conceptual parent ≠ mandatory learner step

A being the parent of A1/A2/A3 does not automatically mean every learner path must execute:

```text
A orientation
→ A1
→ A orientation again
→ A2
→ A orientation again
→ A3
→ A completion
```

That would confuse taxonomy with learning workflow and can directly harm the 275+ objective.

The stable truth is only:

```text
A = common macro-domain context
A1/A2/A3 = independently learnable first-class child Systems
```

Whether A-level content should appear before, between or after child Systems is a later Content/Learn decision and must be justified by net score utility.

Therefore:

> **Parent existence does not earn learner contact time.**

---

## 10｜Exam-phase utility constraint

The eventual A-level projection may have different thickness across phases, but it must become **thinner as the exam approaches**, never thicker.

### First round

Potential value only:

- reduce the cost of understanding genuine A1/A2/A3 intersections;
- prevent isolated memorization where one shared mechanism is enough;
- orient a child System without delaying its Lecture / Block mainline.

Not allowed:

- a separate A lecture;
- a new memorization list;
- a mandatory completion task merely because A exists.

### Second round

Expected highest potential value:

- cross-System discrimination;
- mixed-case localization;
- replacing duplicated review with one shared reconstruction where safe;
- heart–kidney volume/perfusion reasoning;
- lung–kidney acid–base reasoning;
- oxygenation/content/flow separation.

### Final sprint

Potential value only if it becomes an extremely thin retrieval skeleton that saves time.

Not allowed:

- rereading a long A document;
- an independent A Recall schedule;
- late addition of details that belong to A1/A2/A3.

These are utility constraints only. Exact learner timing is intentionally not defined at Logic stage.

---

## 11｜What must die if it adds burden

A taxonomy parent and learner-facing A integration are different things.

If real use shows noticeable extra learning/maintenance time without lower errors, lower review cost or faster retrieval:

- **keep** A as the macro-domain parent if it remains a useful taxonomy/ownership concept;
- **collapse or delete** the learner-facing A integration Content / Learn step / UI projection that failed to add value;
- do not preserve it merely because engineering work was already spent.

A large independent A curriculum is itself evidence that the Logic-to-Content translation has failed.

---

## 12｜Implication for B / C / D / E / F

B/C/D/E/F are already top-level macro-domain peers of A in the intended conceptual taxonomy.

They therefore do **not** need to be “promoted into SuperSystems”.

The relevant future question is different:

> **Does any one of B/C/D/E/F become large enough that it benefits from first-class child-System decomposition similar to A1/A2/A3?**

That decision must be made only for 275+ utility: content volume, causal independence, learner continuity, question/error structure and review efficiency.

No symmetry rule applies.

Possible legitimate long-term shape:

```text
A → A1 / A2 / A3
B → remains one broad owner
C → remains one broad owner
D → later splits if useful
E → remains one broad owner
F → remains integration/remaining-clinical owner
```

or any other asymmetric structure that performs better.

---

## 13｜Logic acceptance tests before Content

Content is not admitted until the following Logic tests survive:

### Test 1 · Taxonomy coherence

Can A be stated as one coherent macro-domain problem while A1/A2/A3 remain independently coherent child Systems?

Current answer: **yes, provisionally**.

### Test 2 · Decomposition utility

Would merging A1/A2/A3 into one ordinary broad System make first learning, continuation, verification or review materially worse?

Current answer: **yes** — their scale and causal independence justify first-class decomposition.

### Test 3 · Parent-value test

Does A contain meaningful cross-child relations that are awkward or repetitive when reconstructed only inside A1/A2/A3?

Current candidate evidence: Oxygen Delivery, Perfusion↔Volume, CO₂/Acid–Base.

### Test 4 · Non-duplication

Can A remain small while all local medical truth stays in child owners?

Required answer before Content: **yes**.

### Test 5 · 275+ utility

Is there a plausible path for A-level compression to reduce understanding/review/retrieval cost or mixed-case error without adding a new course?

Required answer before Content: **yes**.

### Test 6 · Graceful failure

If learner-facing A integration later proves useless, can it be removed while A1/A2/A3 remain intact?

Required answer: **yes**.

---

## 14｜Current Logic decision

**Provisional Logic decision:**

```text
A is a top-level macro-domain peer of B/C/D/E/F.
A1/A2/A3 are privileged first-class child Systems because decomposition materially serves the 275+ goal.
A-level integration owns only cross-child compression.
A-level taxonomy does not imply a mandatory learner step.
```

Working semantic name:

> **A · Delivery & Homeostasis｜输送与内环境稳态**

Descriptive label:

> **Cardio–Pulmonary–Renal｜心肺肾**

`SuperSystem` may remain a temporary engineering/path label, but it must not imply that A sits above B/C/D/E/F.

---

## 15｜Freeze gate before Content

Do not create Content merely because this Logic sounds elegant.

Before Logic is frozen, challenge at least these questions:

- Is `Delivery & Homeostasis` genuinely the best parent problem, or does it overfit A3 to heart/lung language?
- Does each of the three admitted loops require the A parent, or is any one actually local enough to stay below?
- Are A1/A2/A3 split because of real 275+ utility rather than historical file organization?
- Does A-level compression have a believable second-round/final-sprint payoff?
- Can all A-level candidate content stay substantially smaller than any one child System?
- Can learner-facing A collapse to nearly zero if real use shows no benefit?

Only after these survive should **Content** ask:

> **What is the minimum information necessary to express the A parent without teaching A1/A2/A3 twice?**
