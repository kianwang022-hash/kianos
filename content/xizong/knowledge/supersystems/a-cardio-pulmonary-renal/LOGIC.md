# A · Cardio–Pulmonary–Renal Macro-Domain Logic

Status: LOGIC CANDIDATE · CORE STRUCTURE PROVISIONAL · CONTENT NOT ADMITTED  
Role: top-level A-domain integration logic for A1 Circulation + A2 Respiratory + A3 Urinary  
Current medical owners remain: `a1-circulation/system.json`, `a2-respiratory/system.json`, `a3-urinary/system.json` and their canonical Block/KP Core.

> Terminology note: the repository path currently says `supersystems/` and older files may say `SuperSystem`. In Logic, **A is not a tier above B/C/D/E/F**. A is a top-level macro-domain peer of B/C/D/E/F. A1/A2/A3 are a privileged decomposition of A.

This file answers only:

> **What is A at the top Xizong level, why are A1/A2/A3 split into first-class Systems, what structural cross-System logic belongs to their common parent, and what must never be promoted upward?**

It does **not** define teaching content, learner sequence, Recall implementation, UI, runtime state, questions, Memory, or Acceptance.

---

## 0｜Highest constraint: 275+ or do not expose it to the learner

The A-level integration has no learner-facing value merely because it is medically elegant, conceptually higher-level, visually impressive, or architecturally symmetric.

Its only legitimate learner-facing reason to exist is to improve Kian's probability of reaching:

> **306 西医综合 275+**

Every later Content / Learn / UI decision must pass at least one test:

```text
faster / more stable first-round understanding
OR
less repeated review + better second-round discrimination / cross-System application
OR
faster, thinner final-sprint retrieval
```

If not, that learner-facing projection is not admitted.

Hard rule:

> **Compression that creates more study burden than retrieval / transfer / score value is negative value and must not reach the learner.**

This applies to learner-facing A integration, not to A's existence as a taxonomy parent. A may remain the structural parent of A1/A2/A3 even if visible A-level learning content later collapses toward zero.

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

Three granularities must not be confused:

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

> **A is one top-level macro-domain whose exam importance and internal scale justify three first-class child Systems.**

The split is a performance decision. It must make learning, verification, repair and review easier than one giant A owner would.

---

## 3｜A parent ownership: structural compression, not medical Core

A does **not** become a fourth medical owner over heart + lung + kidney.

A may own only structural integration semantics whose value appears specifically because child boundaries are crossed:

- which child Systems are connected;
- the minimal joining relation between them;
- cross-System localization coordinates;
- routing / compression relationships;
- external interfaces to B/C/D/E/F;
- later shared reconstruction that can safely replace duplicated review.

All detailed medical truth stays in the existing child System / Block owners.

A must not own:

- local formulas merely because they can be displayed together;
- disease-specific diagnosis/treatment already explained below;
- copied KP content;
- a second question taxonomy;
- a second Memory/review queue;
- an independent mandatory completion state.

Admission test:

> **If one child owner already explains the medical relation completely, A may at most index / route / compress that relation; it must not recreate a second Primary.**

---

## 4｜Structural invariant: A is a three-edge triangle

The cleanest A-level Logic is a triangle of three pairwise couplings:

```text
                 A2 Respiratory
                /              \
      O₂ delivery                CO₂ / acid–base
              /                    \
     A1 Circulation —— perfusion / volume —— A3 Urinary
```

This triangle is the primary structural claim.

The important point is **not** that all three edges need equal learner-facing Content. The structural triangle is symmetric; medical ownership is not.

---

## 5｜Edge A1 ↔ A2 · Oxygen Delivery

Minimal relation:

```text
lung oxygenation
→ arterial O₂ state / content
× circulation flow / distribution
→ tissue O₂ delivery
```

Key discrimination:

> **oxygenation failure ≠ oxygen-content failure ≠ flow failure ≠ distribution/use failure**

### Existing owner pattern

- A2 Block 2 already owns pulmonary exchange, Hb/oxygen-content language and explicitly calls circulation for pulmonary flow, CO and tissue-oxygen-delivery interface.
- A1 owns CO, pressure, flow distribution and perfusion mechanics.
- Hb/RBC mass remains an external C/Hematology input.

### A-level role

**Split-primary joining interface.**

A does not reteach A2 gas transport or A1 circulation. It may own only the structural join:

```text
oxygen state/content × flow = delivery problem
```

Pulmonary circulation/right-heart load remains derived/local unless later evidence proves it needs additional A-level compression.

---

## 6｜Edge A1 ↔ A3 · Perfusion ↔ Volume

Minimal relation:

```text
cardiac output / arterial pressure
→ renal perfusion
→ renal Na-water / RAAS response
→ effective circulating volume
→ venous return / preload / vascular load
→ future circulation
```

Key discrimination:

> **kidney function depends on perfusion while kidney regulation helps set the volume state that determines future perfusion.**

### Existing owner pattern

- A1 Block 2 already includes the kidney–fluid system as the long-term ECF / blood-volume controller inside circulation regulation.
- A3 owns renal perfusion sensing, RAAS, Na-water handling, volume regulation and renal consequence.

### A-level role

**Dual-local feedback compression.**

This is exactly the kind of relation where two child Systems legitimately teach different sides of the same feedback loop. A may compress the loop for orientation/review, but may not create another RAAS / volume / shock curriculum.

This edge is a strong candidate for reducing repeated second-round review.

---

## 7｜Edge A2 ↔ A3 · CO₂ / Acid–Base

Minimal relation:

```text
PaCO₂ respiratory component
↔ HCO₃⁻ / H⁺ renal-metabolic component
→ pH + compensation / mixed-process localization
```

Key discrimination:

> **lung and kidney act on the same acid–base problem through different variables and time scales.**

### Existing owner pattern

A3 Block 5 is already the **unique complete Primary** for water/electrolyte/acid–base integration and explicitly treats respiratory PaCO₂ as Recall / Integrate input from A2.

### A-level role

**Routing / compression edge only.**

A must **not** build a second acid–base model.

The A-level value, if any, is only to preserve the A2↔A3 seam during cross-System retrieval and late compression.

This is the strongest current example of the rule:

> **cross-System relation ≠ parent-level medical ownership.**

---

## 8｜Why the triangle is stronger than a giant SuperSystem narrative

The triangle has four advantages for the 275+ goal:

1. **Minimality:** only three primitive cross-child relations.
2. **Localizability:** a mixed case can be placed on one edge before opening child detail.
3. **No forced all-three reasoning:** the third child can remain invisible when unnecessary.
4. **Progressive compression:** the structure can plausibly become extremely thin in later phases.

All-three phenomena are treated as **compositions of edges**, not automatically as new primitives.

Examples such as shock + AKI, heart failure + pulmonary congestion + renal response, or respiratory failure + acid–base disturbance may traverse multiple edges, but that does not create a fourth “multi-organ” curriculum.

Hard rule:

> **Do not promote a derived three-organ scenario into a primitive unless repeated 306 reasoning cannot be handled cleanly by composing admitted edges.**

---

## 9｜Derived whole-body loop: secondary, disposable representation

A whole-body loop can summarize the three edges:

```text
external O₂
→ lung oxygenation
→ blood O₂ state/content
→ circulation flow / distribution
→ tissue delivery / use
→ CO₂ + fixed-acid + renal-solute load
→ lung CO₂ removal + renal composition/volume regulation
→ venous return / future perfusion
→ loop repeats
```

But this long loop is **not** the Logic primitive.

If later Content can express A more efficiently with the triangle alone, the loop should disappear from learner-facing projection.

This prevents A3 from being awkwardly appended to an oxygen-delivery story and prevents “whole-body elegance” from becoming study burden.

---

## 10｜Minimal coordinates

Candidate A-level coordinates are deliberately few:

- **Flow / perfusion:** CO, organ perfusion, effective arterial blood volume.
- **Oxygen state/content:** PaO₂ / SaO₂ / Hb interface / arterial O₂ content.
- **Volume state:** ECF / effective arterial blood volume / venous return.
- **Gas–acid state:** PaCO₂ / HCO₃⁻ / pH.
- **Renal response interface:** renal perfusion / GFR / Na-water response.

These are localization coordinates, not a new fact list.

A coordinate survives only if it helps an admitted edge and cannot be omitted without loss of useful compression.

---

## 11｜External interfaces — explicit non-closure

A is not a complete model of the organism. Important inputs remain externally owned:

- **Hb / RBC mass** → C / Hematology.
- **metabolic demand / substrate use / CO₂ production** → B / metabolism-endocrine interface.
- **autonomic / endocrine control** → D/B interfaces where appropriate.
- **systemic inflammation / infection** → C-domain interface.
- **hepatic and other non-renal clearance / metabolism** → outside A.

Hard rule:

> **An interface may enter A without transferring ownership of its source domain.**

A is a top-level peer, not a whole-body master owner.

---

## 12｜Conceptual parent ≠ mandatory learner step

Stable Logic:

```text
A = common macro-domain parent
A1/A2/A3 = independently learnable first-class child Systems
three pairwise edges = A-level structural compression index
```

This does **not** imply a mandatory route through A before/between/after each child System.

Whether learner-facing A Content appears at all, and when, is a later Content/Learn decision subject to score utility.

> **Parent existence does not earn learner contact time.**

---

## 13｜Exam-phase utility constraint

The eventual learner-facing A projection must become thinner as the exam approaches.

### First round

Potential value only:

- make a genuine edge easier when it first becomes relevant;
- prevent duplicated/isolated mechanism learning;
- orient without delaying Lecture / Block mainline.

Not allowed: separate A lecture, new memorization list, mandatory A completion.

### Second round

Expected highest potential value:

- edge-based discrimination;
- mixed-case localization;
- deduplicated review;
- faster routing between A1/A2/A3.

### Final sprint

Only valuable if it becomes an extremely thin retrieval skeleton that saves time.

Not allowed: long rereading, independent A Recall schedule, late new details.

Exact timing remains outside Logic.

---

## 14｜Kill rule: preserve taxonomy, kill useless projection

If real use shows noticeable extra learning/maintenance time without lower errors, lower review cost or faster retrieval:

- keep A as macro-domain parent if taxonomy remains useful;
- collapse/delete learner-facing A Content / Learn steps / UI that fail to add value;
- never preserve them because engineering work was already spent.

A large independent A curriculum is evidence that Logic-to-Content translation failed.

---

## 15｜Implication for B / C / D / E / F

B/C/D/E/F are already top-level macro-domain peers of A.

They do not need to be “promoted into SuperSystems”.

Future question only:

> **Does a broad macro-domain benefit from first-class child-System decomposition similar to A1/A2/A3?**

No symmetry rule applies.

---

## 16｜Logic acceptance tests before Content

### Test 1 · Taxonomy coherence

A as one macro-domain + A1/A2/A3 as independently coherent child Systems.

**Result: PASS at Logic level.**

### Test 2 · Decomposition utility

A1/A2/A3 scale, causal independence and independent learning/verification justify first-class decomposition.

**Result: PASS at Logic level.**

### Test 3 · Existing-edge evidence

The three edges are not invented solely by this parent:

- A2 explicitly calls circulation CO/flow/tissue-delivery interface.
- A1 explicitly calls kidney–fluid long-term volume control.
- A3 acid–base Primary explicitly calls respiratory PaCO₂ and circulation/shock prerequisites.

**Result: PASS for existence of the three structural seams.**

### Test 4 · Ownership discipline

Can the edges exist without moving medical Primary upward?

- A1↔A2 → split-primary joining interface.
- A1↔A3 → dual-local feedback compression.
- A2↔A3 → A3-primary; A-level routing/compression only.

**Result: PASS provisionally.**

### Test 5 · Triangle sufficiency

Can major A-level mixed reasoning be composed from three edges without a fourth primitive?

**Result: NOT YET FROZEN.** Continue challenge before Content.

### Test 6 · 275+ utility

Can the eventual A projection plausibly reduce understanding/review/retrieval cost without becoming a new course?

**Result: PLAUSIBLE, not yet proven by real use.** This permits Content design only after Logic freeze; it does not prove learner value.

### Test 7 · Graceful failure

Can learner-facing A integration disappear while A1/A2/A3 remain intact?

**Result: PASS.**

---

## 17｜Current Logic decision

```text
A is a top-level macro-domain peer of B/C/D/E/F.
A1/A2/A3 are privileged first-class child Systems because decomposition serves 275+.
A itself is not a fourth medical course or medical-Core owner.
Its structural core is three pairwise seams:
  A1↔A2 = Oxygen Delivery
  A1↔A3 = Perfusion ↔ Volume
  A2↔A3 = CO₂ / Acid–Base routing seam
The three seams have different underlying medical owners and must not be forced into symmetric Content.
All-three cases are compositions unless evidence proves otherwise.
A taxonomy does not imply mandatory learner contact.
```

For now use the plain label:

> **A · Cardio–Pulmonary–Renal｜心肺肾**

Do not freeze a decorative title such as `Delivery & Homeostasis` until Content proves that wording actually improves compression.

`SuperSystem` may remain a temporary engineering/path label, but it must not imply that A sits above B/C/D/E/F.

---

## 18｜Freeze gate before Content

One unresolved Logic question remains material:

> **Are the three edges sufficient for the high-value A-level 306 reasoning, or is there a fourth primitive that cannot be cleanly represented as a derived composition?**

Before Logic is frozen, specifically challenge:

- pulmonary circulation / right-heart coupling;
- congestion / edema;
- shock / perfusion / oxygen-delivery interactions;
- multi-organ failure patterns;
- whether any of those truly demand a new primitive rather than composition of existing edges.

Also verify that all eventual A-level Content can remain **far smaller than any one child System**.

Only after that should Content ask:

> **What is the minimum information necessary to express these structural seams without teaching A1/A2/A3 twice?**
