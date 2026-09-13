# Xizong UI Review Protocol — whole-flow-before-local-optimization

Status: **CURRENT DESIGN SAFETY PROTOCOL**  
Scope: learner-facing Xizong UI / Projection discussion and product recommendations  
Product owner: `static-web/XIZONG_PRODUCT_BRIEF.md`  
Learning authority: `content/xizong/LEARNING_CONTRACT.md`  
Shared execution policy: `content/xizong/knowledge/learner/study-policy.json`

This file does not own medical Content, Learning Logic, Projection semantics, Runtime semantics, Evidence semantics, learner progress, or visual style. It owns one narrower responsibility:

> **Before discussing or recommending a local Xizong UI change, understand the complete learner journey that the local surface participates in, so a local optimization cannot silently damage the global learning loop.**

---

# 1｜Hard rule: whole flow before local UI

Do not begin a Xizong UI recommendation after reading only the page/component currently under discussion.

Before recommending changes to any mature Xizong learner surface, first reconstruct the relevant end-to-end Current journey far enough to answer:

```text
Where does the learner come from?
→ what cognitive action happens here?
→ what evidence/state is created here?
→ what does the next stage require from this stage?
→ what happens on stable/correct work?
→ what happens on Wrong / meaningful Uncertain?
→ where does repair occur?
→ how does the learner return to the interrupted mainline?
→ what later review / compression / holdout semantics depend on this state?
```

A local page may look visually inefficient while still carrying an important global state-transition or evidence responsibility. Do not optimize that responsibility away merely because it is not visually elegant in isolation.

Hard failure mode to avoid:

```text
read one page
→ optimize its local appearance / interaction
→ accidentally break gating, evidence, repair, return, holdout, later review or compression
```

Required approach:

```text
understand whole learner loop
→ locate the local surface inside that loop
→ audit existing Projection / Runtime responsibilities
→ optimize only what is truly local
→ re-check upstream + downstream invariants
```

---

# 2｜Current Xizong journey that local UI must respect

The lane-level first-pass journey is:

```text
System orientation
→ choose Block
→ Block orientation
→ current Logic Group orientation
→ original Lecture / MarginNote continuous study for the whole Logic Group
→ one return to KianOS
→ KP Recall for that Logic Group
→ Logic Group closure
→ next Logic Group
→ Block Recall
→ Block Complete
→ after the System has actually been learned: System Recall
→ official System question sweep
→ stable correct: continue cheaply
   OR Wrong / meaningful Uncertain: smallest sufficient repair
→ exact reviewed return to the responsible Block/KP when available
→ short post-question System reconstruction
→ later selective Memory / Review / subsequent-pass compression
```

This journey is not a UI proposal. It is inherited Current Learning behavior. Local product work must fit it rather than reconstruct it from scratch.

Detailed machine execution remains owned by `study-policy.json` and the relevant Runtime/Evidence components.

---

# 3｜Global invariants to check before and after every local recommendation

A local UI optimization is acceptable only when all relevant invariants remain true.

## 3.1 External-primary first learning

- original Lecture / MarginNote remains the continuous first-learning owner;
- KianOS remains orientation / cue / retrieval / closure / compression / repair-routing support;
- do not turn Astro into a second continuous textbook merely because more Content can be rendered.

## 3.2 Natural learning granularity

```text
System
→ Block
→ Logic Group
→ KP identity
```

- Block is the main continuous first-learning problem unit;
- Logic Group protects local continuity / closure;
- KP is stable canonical identity, not automatically first-learning order;
- do not regress to KP-by-KP app switching.

## 3.3 First-pass closure gates

The first-pass policy includes, where applicable:

- formal Lecture contact for owned KPs;
- at least one active KP Recall;
- Logic Group closure;
- Block Recall;
- pre-question System Recall;
- System-wide official-question coverage sweep;
- durable Wrong / Uncertain repair evidence;
- short post-question System reconstruction.

UI work must not create a visually convenient shortcut that bypasses a legitimate gate or manufactures a gate that Learning does not require.

## 3.4 Recall / answer protection

- neutral Recall front remains neutral;
- answer-type title / canonical answer remains protected until legitimate Reveal;
- future-stage content must fail closed when learner prerequisites are not met;
- visual reorganization must not leak the answer through sidebars, previews, maps or inspectors.

## 3.5 Question semantics and holdout

- official questions are evidence / coverage probes, not owners of learning order;
- stable correct + clear reason remains fast;
- correct-but-not-sure remains Uncertain;
- Wrong / Uncertain are the main repair inputs;
- only explicit reviewed Question→Knowledge relations may drive precise routing;
- protected full-paper / unseen holdout material must remain excluded from ordinary System sweep until intentionally used.

## 3.6 Repair and return

- repair targets the first meaningful failure and the smallest sufficient object;
- no reviewed precise relation → do not guess a Block/KP mapping;
- system W/U repair may hand off to Chat and, when reviewed relations exist, to the responsible Block Repair Inbox;
- repair evidence must not overwrite original Recall evidence;
- repair success is not automatically mastery;
- the learner must be able to return to the interrupted question/System mainline.

## 3.7 Memory / Reserve / Hook / Precision timing

Do not treat these as generic sidebar widgets.

- Memory is selective, not every seen item;
- Reserve may be visible early but must not invade the current mainline;
- Connection Hook is a relationship notice, not current mastery debt;
- Precision is an accuracy attribute, not a mastery stage;
- Visual cues appear when they help the owning current learning action;
- timing is owned by Current learning policy/assets, not by available screen space.

## 3.8 Compression direction

Later learning must become thinner:

```text
first pass: full model
→ second pass: discrimination / precision / application
→ late review: compressed causal skeleton + high-value boundaries / true weak points
```

A UI change must not make later review accidentally longer or force first-pass detail into every later stage.

## 3.9 Learner truth boundary

- engineering readiness ≠ Kian has learned it;
- S/K/L/P/R/E PASS ≠ learner progress;
- accepted Runtime capability ≠ authorization to expose a future learner stage now;
- U requires real Kian use.

---

# 4｜Required read set before discussing a mature surface

Read the **smallest complete journey**, not the smallest local component.

For an accepted System such as A1, the review set normally includes:

```text
1. `content/xizong/LEARNING_CONTRACT.md`
2. `content/xizong/knowledge/learner/study-policy.json`
3. relevant System K owner (`system.json`)
4. relevant System L owner (`*-learning.json`)
5. exact Block Core when the surface depends on Block semantics
6. existing Projection implementation for the local surface
7. existing Runtime stage guard / completion behavior
8. relevant Evidence / Memory / Repair / Return implementation
9. later upstream/downstream surface when the proposed change can affect it
10. scoped Acceptance owner to distinguish closed behavior from open visual polish
```

Examples:

### Discussing System Guide
Do not read only `XizongSystemV6.astro`. Also understand:

```text
System orientation
→ Block entry
→ later System Recall
→ holdout
→ official question sweep
→ W/U repair
→ return / post-question reconstruction
```

### Discussing Block Workspace / KP Recall
Do not read only `XizongBlockV6.astro`. Also understand:

```text
Logic Group orientation
→ external Lecture contact
→ KP Recall
→ group closure
→ Block Recall / completion
→ Memory / Reserve / Hook / Precision
→ System-question repair returning into the Block
```

The purpose is not broad archaeology. It is to understand the exact live loop the local surface participates in.

---

# 5｜Optimization-first audit

After the whole journey is understood, classify each material local element before recommending change:

```text
KEEP
OPTIMIZE
RESTORE_FROM_CURRENT
DEMOTE
```

These categories are defined in `XIZONG_PRODUCT_BRIEF.md`.

Do not add a fifth implicit category called “replace because a cleaner UI can be imagined.”

A genuine redesign/reopen requires fresh evidence of an upstream defect and must identify the earliest responsible owner/gate.

---

# 6｜Global-impact check for every recommendation

Before presenting a UI recommendation to Kian, explicitly check internally:

```text
Learning Logic impact        none / named
Projection semantic impact   none / named
Runtime gating impact        none / named
Evidence impact              none / named
Repair/Return impact         none / named
Holdout/freshness impact     none / named
Memory/Review impact         none / named
Cross-System shared-code impact none / named
```

If any impact is non-trivial, the recommendation must address it before acceptance.

A visually attractive mockup is not enough.

---

# 7｜Discussion order with Kian

For each Xizong surface, discussion should follow:

```text
A. whole-flow position — what role this surface plays in the complete learner journey
B. existing closed behavior — what already works and must survive
C. local Projection audit — KEEP / OPTIMIZE / RESTORE_FROM_CURRENT / DEMOTE
D. Mac-wide recommendation — geometry, density, visibility, controls
E. upstream/downstream safety check
F. Kian acceptance
G. durable Product Brief update
```

Do not lead with a mockup before A–C are clear.

---

# 8｜Relationship to Cognitive Projection asset compilation

The later Xizong Cognitive Projection Asset Compilation lane must receive both:

- the frozen learner-facing product decisions;
- this whole-flow safety protocol.

Compilation is not allowed to optimize one object in isolation if doing so changes how another stage consumes its identity, state, timing, evidence or return path.

Projection assets may improve representation, recover Current semantics lost in the renderer, and provide stable Mac-wide geometry metadata. They may not become a hidden second learning architecture.

---

# 9｜Compact rule

> **先看完整闭环，再看局部页面；先保护已经闭合的学习行为，再优化 Projection；任何局部漂亮都不能以全局学习链出错为代价。**
