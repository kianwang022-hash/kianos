# Lexical Visual / Surface Blueprint — Candidate

Status: **CANDIDATE — Architecture v2 adaptation; Kian Human Gate required**  
Parent Visual authority: `static-web/PRESENTATION_CONTRACT.md`  
Preference owner: `static-web/KIAN_UI_PREFERENCES.md`  
Rule / Model owner: `content/lexical/LEARNING_CONTRACT.md`  
Content-quality owner: `content/lexical/CONTENT_ASSET_CONTRACT.md`  
Control router: `content/lexical/CURRENT.md`

This file defines the **candidate learner-facing Vocabulary / Lexical product model** under Architecture v2.

It does not own lexical semantics, learner state, evidence meaning, scheduler policy or Engineering implementation.

Material page geometry remains candidate until Kian reviews real-browser screenshots.

---

## 1｜Product placement

Learner-facing tree:

```text
English
└─ Vocabulary / Lexical
```

Backend semantic ownership remains independently Lexical.

Hard consequence:

> English may invoke Lexical, but must not create a second vocabulary system.

External English context can activate or validate exact Lexical targets only through the shared Lexical identity/evidence model.

---

## 2｜Primary learner jobs

Lexical has four primary learner jobs and three supporting actions.

### Primary

1. **Coverage / Study** — keep moving through Main Words with minimal friction.
2. **Depth** — learn a rich lexical object when it actually deserves renewed attention.
3. **Repair** — revisit only exact unstable objects with real evidence.
4. **Challenge** — test a named lexical demand with a small high-information task.

### Supporting

5. **Fast Pass** — immediate exit for stable/simple words.
6. **Search / Explore** — canonical reference lookup without automatic learner-state mutation.
7. **English handoff** — temporary contextual lookup/repair and exact return to the originating English task.

These jobs must not be flattened into one dashboard or one card template.

---

## 3｜Vocabulary Home — candidate role

Home is a **lexical workbench / router**, not a progress dashboard.

It should answer quickly:

- where to continue Coverage;
- whether a small high-value Repair action is worth doing now;
- how to search the canonical lexicon;
- how to enter Challenge when justified;
- whether an English-origin return context is active.

Candidate priority:

```text
Continue Coverage
>
small meaningful Repair when present
>
Search / Explore
>
Challenge / reference controls
```

Do not foreground:

- 7,946 as a gamified completion percentage;
- overdue counts;
- giant mastery statistics;
- dormant evidence inventory;
- engineering metadata.

No fixed words/day target belongs on Home unless a separate scheduler owner explicitly supplies one.

---

## 4｜Word Study — candidate learner model

A Main Word is the learning container, but not every word deserves the same surface weight.

### A. Fast-Pass shape

For SAFE_SIMPLE or subjectively stable words, the desired experience is approximately:

```text
word
+ enough identity to make the judgment safely
→ Known / Mastered / Fast Pass
→ Next
```

No forced Reveal ceremony.

No need to show every valid reference field before moving on.

### B. Depth shape

When Kian chooses Depth:

```text
optional useful Recall
→ Reveal one coherent lexical object
→ local + only on unstable exact objects
→ Next
```

Depth may be rich.

The UI should preserve semantic hierarchy rather than splitting Core / senses / constructions / relations / form into equal dashboard cards.

Preferred hierarchy derives from Rule:

1. Word identity;
2. Core / Word Feel;
3. high-value senses;
4. sense-local Expansion;
5. construction / phrase skeletons;
6. phraseology / collocation;
7. contrast / confusable boundary;
8. form / pronunciation / register distinctions;
9. productive family/reference where justified.

### Recall

Recall earns space only when it exposes familiarity illusion or materially improves retrieval.

The current centered “word + Recall Map” is **not yet accepted merely because it exists**.

Human Gate must decide whether:

- it is the correct default Depth entry;
- it should be smaller / denser;
- it should disappear for SAFE_SIMPLE;
- its notation is immediately useful at real study speed.

---

## 5｜Depth visual language

Candidate direction:

> **editorial lexical sheet, not component dashboard.**

Use the Mac-wide screen to keep the lexical object coherent.

Prefer:

- strong English serif treatment for lexical headwords/examples where helpful;
- substantial readable Chinese sans-serif for explanations;
- typography and alignment before cards;
- clear sense hierarchy;
- sense-local Expansion kept spatially near its owner;
- subtle boundaries for Relations / Form / Reference when they are secondary;
- local `+` attached to the exact object it affects.

Avoid:

- one rounded card per sense;
- one panel per backend field;
- tiny metadata;
- large empty hero regions;
- hiding first-round useful semantics behind many repeated expand clicks.

Exact columns / proportions remain open until screenshot Human Gate.

---

## 5.5｜Legacy interaction baseline — preserve

The legacy 4173 Lexical study surface is a **positive interaction asset**, not historical debt.

Architecture v2 may change semantic ownership, learner modes, exact Repair identity and English handoff, but should preserve the proven low-friction study interaction unless a Human Gate explicitly replaces it.

### Whole-card keyboard contract

Before Reveal:

```text
← / ↑ / Space
→ Reveal / 查看完整词义

click Familiar / Mastered
→ may still Fast Pass without Reveal
```

After Reveal:

```text
←  Unknown
↑  Fuzzy
→  Familiar
↓  Mastered

Backspace
→ Undo the immediately preceding whole-card routing judgment

S
→ pronounce current word
```

The four arrow keys belong to **whole-card judgment**. They must not be repurposed for local sense/construction navigation.

### Exact local Repair keyboard contract

Architecture v2 adds local Repair without taking over the legacy arrow map:

```text
J / K
→ move among exact learner-worthy local Repair objects

+
→ toggle the currently focused exact object into / out of Repair
```

Inline local `+` remains clickable.

This is intentionally separate from whole-card Unknown / Fuzzy / Familiar / Mastered.

### Bottom action dock

Study mode should keep a stable bottom action dock as the visible keyboard legend.

Before Reveal:

```text
Reveal | Familiar | Mastered | Undo | Note
```

After Reveal:

```text
Unknown | Fuzzy | Familiar | Mastered | Undo | Note
```

The Dock is part of the learning interaction, not decorative chrome.

Lookup mode does not show whole-card rating actions.

---

## 6｜Whole-card judgment versus local Repair

The surface must visibly preserve this distinction:

```text
Unknown / Fuzzy / Known / Mastered
→ what should I do with this whole word now?

local +
→ should this exact sense / construction / phrase / boundary return later?
```

Do not visually merge them into one rating system.

Unknown/Fuzzy may open Depth now without creating future whole-word debt.

A rich Depth encounter may end with zero local `+` targets.

---

## 7｜Repair — candidate role

Repair is not “all active debt.”

Normal Repair entry should prefer a **small evidence-backed current subset** only when that is useful.

For each surfaced target, show enough to answer:

- what exact lexical object is unstable;
- why it is appearing now;
- what demand is being tested or repaired;
- how to leave quickly when stable.

The full active inventory may remain available as secondary reference.

Forbidden:

- overdue wall;
- calendar-generated urgency;
- mandatory queue clearing;
- full-card re-study when one local object is the actual problem.

---

## 8｜Challenge — candidate role

Challenge is a test workspace.

One challenge should test one named lexical demand with the smallest useful high-information form.

Examples:

- contextual sense discrimination;
- construction slot choice;
- phrase completion;
- confusable boundary;
- constrained Translation/Writing production.

Challenge must not become another semantic content owner.

After resolution:

```text
stable
→ exit / continue

meaningful failure
→ exact Repair target

English-origin context
→ return to originating English task when appropriate
```

---

## 9｜Search / Explore

Search is the direct door to complete Current lexical truth.

Lookup alone is read-only.

Search may expose:

- active learner-worthy Content;
- lower-priority valid reference-only material;
- provenance when explicitly requested.

It must not:

- manufacture Unknown/Fuzzy state;
- create Repair merely because a word was opened;
- force the Search user into Coverage sequencing.

---

## 10｜English handoff

English and Lexical should feel like one product even though their semantic owners remain separate.

Target interaction:

```text
English task
→ select exact lexical token / receive lexical diagnosis
→ open exact Lexical owner with task context preserved
→ inspect / learn / optionally mark exact +
→ Return to exact originating task and position
```

The return path is part of the interaction contract, not optional polish.

Part B / Writing / External Reading should use the same shared bridge when their text semantics permit it; no page-local dictionary copies.

Ordinary lookup remains read-only. Only explicit local `+` or qualified evidence creates future Repair.

---

## 11｜Shared Visual constraints

Lexical inherits Dense Calm and Kian's UI preferences:

- Mac-wide is the design origin;
- no duplicate English subject nav when the shared K rail already owns navigation;
- default-visible learner text >= 15px, normally larger;
- English lexical text may use the stronger legacy/4173 serif editorial reference;
- Chinese UI/explanation text stays full-bodied and readable;
- use useful density rather than decorative whitespace;
- no card/panel pile;
- no engineering/status metadata competing with learner content;
- use horizontal space only when the regions carry useful current information.

---

## 12｜Human Gate sequence

Do not accept Lexical UI from build success.

Human Gate order:

1. **Vocabulary Home**
2. **SAFE_SIMPLE Fast Pass**
3. **DEPTH_READY Recall entry**
4. **DEPTH_READY Reveal**
5. **Repair**
6. **Challenge**
7. **English → Lexical → exact return**

For each material surface:

```text
current real screenshot
→ discuss learner purpose
→ candidate implementation
→ same-size real screenshot
→ Kian Human Gate
→ only then freeze geometry
```

---

## 13｜Open decisions

These are intentionally unresolved:

- whether Home should retain visible Study/Search/Repair/Challenge tabs or use a denser workbench composition;
- whether Recall should be a separate full-stage front, a compact top zone, or conditional only;
- exact SAFE_SIMPLE one-glance information required for a reliable Fast Pass;
- exact Mac-wide Depth geometry;
- whether local `+` is always visible or appears on hover/focus while remaining discoverable;
- Repair subset composition and explanation density;
- Challenge workspace geometry;
- how much English-origin context should remain visible inside Lexical before it becomes distracting.

Resolve these through the Rule + real learner screenshots, not legacy inheritance.


---

## 14｜Exam-cycle closure

Lexical v2 must support the full 2026-09-18 → 2026-12-20 exam cycle without another functional architecture rebuild.

```text
Phase A / B
→ Coverage / Fast Pass / chosen Depth
→ contextual lookup as needed

Phase C
→ Coverage maintenance
→ real English lexical failure → exact Repair
→ later fresh evidence may fade/reactivate the same target

Phase D
→ targeted Repair / Challenge
→ Translation / Writing productive lexical demand
→ full-task English evidence remains primary transfer evidence

Phase E
→ no broad new lexical course
→ high-value active Repair / fast lookup / output support only
→ aggressive exit for stable material
```

Later phase changes may alter priority, subset and task demand. They must not require a separate Lexical second-pass site, sprint site or duplicate learner-state model.

Architecture-v2 acceptance requires:

1. Study / Lookup / Repair consume the same canonical Word owners;
2. Lookup does not advance Coverage merely by opening a Word;
3. Repair targets the exact unstable object rather than forcing whole-card relearning;
4. Challenge tests recognition / discrimination / production without becoming semantic truth;
5. English evidence activates / validates lexical targets through the shared evidence model;
6. exact Resume / Return survives later-phase use;
7. Final Sprint can shrink visible work to high-value active objects without new architecture.
