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

This applies to learner-facing A integration, not to the existence of A as a taxonomy parent. A may remain the structural parent of A1/A2/A3 even if its visible learning projection later collapses toward zero.

A must never create an independent required study quota, KP inventory, question quota, Memory queue, review debt, or completion burden.

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

A is therefore **not** a new layer placed above the other broad domains.

The repository currently has eight numbered System owners because A is unusually important and large and has been decomposed into three independently owned Systems:

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

So three granularities must not be confused:

- **macro-domain taxonomy** = A / B / C / D / E / F;
- **Current System owner granularity** = A1 / A2 / A3 / B / C / D / E / F;
- **learner route** = whatever sequence best serves the current exam phase.

Hard rule:

> **Owner granularity ≠ highest conceptual taxonomy ≠ learner route.**

---

## 2｜Why A is specially decomposed into A1 / A2 / A3

A1/A2/A3 receive independent System status because that decomposition materially serves the 275+ target, not because heart, lung and kidney are unrelated.

A split is justified when a child domain has enough of the following:

- large exam/content volume;
- a coherent local causal mother model;
- substantial independent first-pass learning work;
- distinct Block / Logic Group / KP organization;
- enough question coverage and error modes to justify independent verification;
- enough runtime/governance scope to justify independent continuation and Acceptance.

A1, A2 and A3 meet that bar.

This is a deliberate asymmetry:

> **A is one top-level macro-domain whose exam importance and internal scale justify three first-class child Systems.**

The split is a performance decision. It must make learning, verification, repair and review easier than one giant A owner would.

---

## 3｜What the A parent owns

A owns only cross-child relations whose value appears specifically because two or more child Systems are integrated.

A does **not** own the union of all heart + lung + kidney facts.

A may own:

- the minimal relationship among A1/A2/A3;
- cross-System localization coordinates;
- explicit pairwise interfaces;
- external interfaces to B/C/D/E/F where needed;
- later compression where one shared reconstruction safely replaces repeated child review.

A must not own:

- local formulas merely because they can be displayed together;
- disease-specific diagnosis/treatment already explained in A1/A2/A3;
- copied KP content;
- a second question taxonomy;
- a second Memory/review queue;
- an independent mandatory completion state.

Admission test:

> **If one child System can explain a relation completely without losing why it matters, the relation does not need A-level ownership.**

---

## 4｜Structural invariant: A is a three-edge triangle

The cleanest A-level Logic is not a long “whole-body story”. It is a triangle of three high-value pairwise couplings:

```text
                 A2 Respiratory
                /              \
      O₂ delivery                CO₂ / acid–base
              /                    \
     A1 Circulation —— perfusion / volume —— A3 Urinary
```

This triangle is the primary structural claim.

Each edge must justify itself independently.

### Edge A1 ↔ A2｜Oxygen Delivery

```text
lung oxygenation
→ arterial oxygen content
→ cardiac output / distribution
→ tissue O₂ delivery
```

Key discrimination:

> **oxygenation failure ≠ oxygen-content failure ≠ flow failure ≠ distribution/use failure**

Why this belongs at A level:

- A2 can explain oxygenation but not whether enough oxygenated blood reaches tissue.
- A1 can explain flow but not whether the blood was adequately oxygenated.
- Hb/RBC mass enters as an explicit external C-domain interface rather than being silently owned by A.

Pulmonary circulation, right-heart load and pulmonary vascular coupling may appear later as derived detail on this edge if they prove exam-useful; they are not admitted as a separate primitive yet.

### Edge A1 ↔ A3｜Perfusion ↔ Volume

```text
cardiac output / arterial pressure
→ renal perfusion
→ renal Na-water handling + RAAS / distal regulation
→ extracellular / effective arterial blood volume
→ venous return + preload + vascular load
→ cardiac output / pressure
```

Key discrimination:

> **kidney function depends on perfusion while kidney regulation helps set the volume state that determines future perfusion.**

Why this belongs at A level:

- A1 alone cannot close the long-term volume/perfusion feedback.
- A3 alone cannot explain renal perfusion as an independent upstream variable.
- this edge directly links shock/prerenal reasoning, volume state, RAAS and heart–kidney feedback without creating a new disease chapter.

### Edge A2 ↔ A3｜CO₂ / Acid–Base

```text
cellular metabolism
→ CO₂ + non-volatile acid production
→ lung changes CO₂ elimination rapidly
↔ kidney changes HCO₃⁻ conservation/generation and H⁺ excretion more slowly
→ pH stability
```

Key discrimination:

> **lung and kidney are coupled acid–base actuators acting through PaCO₂ and HCO₃⁻ on the same pH problem, with different time scales.**

Why this belongs at A level:

- respiratory and metabolic components cannot be fully localized from only one child System;
- compensation logic inherently crosses A2/A3;
- the shared relation is more useful than duplicating acid–base framing independently in both children.

---

## 5｜Why the triangle is stronger than a giant SuperSystem narrative

The triangle has four advantages for the 275+ goal:

1. **Minimality:** only three primitive cross-child relations are admitted.
2. **Localizability:** a mixed case can first be placed on one edge before opening detailed child knowledge.
3. **No forced all-three reasoning:** many questions need only A1↔A2, A1↔A3 or A2↔A3; the third child can remain invisible.
4. **Progressive compression:** three edges can plausibly collapse into a very thin second-round/final-sprint skeleton.

All-three phenomena are therefore treated as **compositions of edges**, not automatically as new top-level primitives.

Examples such as shock + AKI, heart failure + pulmonary congestion + renal response, or respiratory failure + acid–base disturbance may traverse two or three edges, but that does not create a fourth “multi-organ” curriculum.

Hard rule:

> **Do not promote a derived three-organ scenario into a new primitive unless repeated 306 reasoning cannot be handled cleanly by composing the three admitted edges.**

---

## 6｜Derived whole-body loop: useful explanation, not the primary invariant

A whole-body loop can still summarize the three edges:

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

But this long loop is **secondary**.

If later Content can express the A parent more efficiently with the three-edge triangle alone, the long loop does not deserve learner-facing space.

This protects A3 from being awkwardly appended to an “oxygen-delivery story” and keeps the Logic from becoming grander than the exam requires.

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

A coordinate survives only if it helps at least one admitted edge.

---

## 8｜External interfaces — explicit non-closure

A is not a complete model of the organism. Important inputs remain externally owned:

- **Hb / RBC mass** → C / Hematology; modifies arterial O₂ content on the A1↔A2 edge.
- **metabolic demand / substrate use / CO₂ production** → B / metabolism-endocrine interface.
- **autonomic and endocrine control** → D/B interfaces where appropriate.
- **systemic inflammation / infection** → C-domain interface.
- **hepatic and other non-renal clearance / metabolism** → outside A.

Hard rule:

> **An interface may enter A without transferring ownership of its source domain.**

A is a top-level peer, not a whole-body master owner.

---

## 9｜Conceptual parent ≠ mandatory learner step

A being the parent of A1/A2/A3 does not automatically mean every learner path must execute A before, between or after every child System.

The stable Logic is only:

```text
A = common macro-domain parent
A1/A2/A3 = independently learnable first-class child Systems
three pairwise edges = A-level cross-child compression
```

Whether A-level Content should appear before, between or after child Systems is a later Content/Learn decision and must be justified by net score utility.

Hard rule:

> **Parent existence does not earn learner contact time.**

---

## 10｜Exam-phase utility constraint

The eventual learner-facing A projection may have different thickness across phases, but it must become **thinner as the exam approaches**, never thicker.

### First round

Potential value only:

- make a genuine pairwise relation easier when it first becomes relevant;
- prevent duplicated or isolated mechanism learning;
- orient a child System without delaying Lecture / Block mainline.

Not allowed:

- a separate A lecture;
- a new memorization list;
- a mandatory A completion task merely because A exists.

### Second round

Expected highest potential value:

- edge-based cross-System discrimination;
- mixed-case localization;
- replacing duplicated review with one shared reconstruction where safe;
- faster switching between A1/A2/A3 when a question crosses ownership.

### Final sprint

Potential value only if the A model collapses into an extremely thin retrieval skeleton that saves time.

Not allowed:

- rereading a long A document;
- an independent A Recall schedule;
- late addition of details that belong to A1/A2/A3.

These are utility constraints only. Exact timing is intentionally not defined at Logic stage.

---

## 11｜Kill rule: preserve taxonomy, kill useless projection

If real use shows noticeable extra learning/maintenance time without lower errors, lower review cost or faster retrieval:

- **keep** A as the macro-domain parent if the taxonomy remains useful;
- **collapse or delete** learner-facing A Content / Learn steps / UI that fail to add value;
- never preserve them because engineering work was already spent.

A large independent A curriculum is itself evidence that Logic-to-Content translation failed.

---

## 12｜Implication for B / C / D / E / F

B/C/D/E/F are already top-level macro-domain peers of A in the intended conceptual taxonomy.

They do not need to be “promoted into SuperSystems”.

The future question is only:

> **Does any broad macro-domain benefit from first-class child-System decomposition similar to A1/A2/A3?**

That decision must be made only for 275+ utility: content volume, causal independence, learner continuity, question/error structure and review efficiency.

No symmetry rule applies.

---

## 13｜Logic acceptance tests before Content

Content is not admitted until the following survive challenge.

### Test 1 · Taxonomy coherence

Can A be one coherent macro-domain while A1/A2/A3 remain independently coherent child Systems?

Current answer: **yes, provisionally**.

### Test 2 · Decomposition utility

Would merging A1/A2/A3 into one ordinary broad System make first learning, continuation, verification or review materially worse?

Current answer: **yes** — their scale and causal independence justify first-class decomposition.

### Test 3 · Edge necessity

Does each admitted primitive genuinely need two child Systems?

- A1↔A2 Oxygen Delivery → **yes, provisionally**.
- A1↔A3 Perfusion↔Volume → **yes, provisionally**.
- A2↔A3 CO₂/Acid–Base → **yes, provisionally**.

### Test 4 · Triangle sufficiency

Can major A-level mixed reasoning be composed from these three edges without adding a fourth primitive?

Current answer: **likely yes; requires continued challenge before freeze**.

### Test 5 · Non-duplication

Can A remain substantially smaller than any one child System while all local medical truth stays below?

Required answer before Content: **yes**.

### Test 6 · 275+ utility

Is there a plausible route for the three-edge compression to reduce understanding/review/retrieval cost or mixed-case error without adding a new course?

Required answer before Content: **yes**.

### Test 7 · Graceful failure

If learner-facing A integration later proves useless, can it disappear while A1/A2/A3 remain intact?

Required answer: **yes**.

---

## 14｜Current Logic decision

**Provisional Logic decision:**

```text
A is a top-level macro-domain peer of B/C/D/E/F.
A1/A2/A3 are privileged first-class child Systems because decomposition materially serves the 275+ goal.
A-level integration is best modeled as three pairwise interfaces, not a fourth giant course:
  A1↔A2 = Oxygen Delivery
  A1↔A3 = Perfusion ↔ Volume
  A2↔A3 = CO₂ / Acid–Base
All-three cases are compositions unless evidence proves otherwise.
A-level taxonomy does not imply a mandatory learner step.
```

For now, use the plain semantic label:

> **A · Cardio–Pulmonary–Renal｜心肺肾**

Do not freeze a more decorative title such as `Delivery & Homeostasis` until Content proves that wording improves compression rather than merely sounding elegant.

`SuperSystem` may remain a temporary engineering/path label, but it must not imply that A sits above B/C/D/E/F.

---

## 15｜Freeze gate before Content

Do not create Content merely because this Logic sounds elegant.

Before Logic is frozen, challenge at least these questions:

- Is the A1↔A2 edge truly best compressed around oxygen delivery, or does pulmonary circulation require equal primitive status?
- Is A1↔A3 perfusion↔volume sufficient to cover the high-value heart–kidney interface without dragging in disease detail?
- Is A2↔A3 acid–base genuinely cross-System at the level needed for 306, or can child owners already handle it without duplication?
- Can major all-three cases be composed from the triangle instead of becoming a fourth curriculum?
- Are A1/A2/A3 split because of real 275+ utility rather than historical file organization?
- Can all A-level candidate Content stay much smaller than any child System?
- Can learner-facing A collapse to nearly zero if real use shows no benefit?

Only after these survive should **Content** ask:

> **What is the minimum information necessary to express these three A-level edges without teaching A1/A2/A3 twice?**
