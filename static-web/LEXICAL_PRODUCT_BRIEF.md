# Lexical Visual / Surface Blueprint — Candidate

Status: **L2 VISUAL FAMILY ACCEPTED — L3 surface blueprints remain Human-Gate candidates**  
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

Mac-wide single-screen fit is a **preferred density outcome, not a hard requirement**. A genuinely rich lexical object may scroll.

The hard requirement is different:

> **Do not make the learner reread the same knowledge merely because canonical ownership stores it in multiple fields or object types.**

Default Depth consumes a Content-owned Final Learner Object. Core compression, Sense detail, Construction reuse and Reference boundaries must each have a distinct learner job. Canonical redundancy / provenance remains upstream; the learner surface should not repeat it.

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

## 5｜Accepted L2 Vocabulary / Lexical visual family

Status: **ACCEPTED by Kian — 2026-09-18**

This section owns the shared learner-facing visual language for Vocabulary / Lexical inside the English product family. It is upstream of exact Fast Pass / Depth / Repair / Challenge surface geometry.

Hard inheritance:

```text
L1 Shared Visual
→ English family shell / control language
→ this Lexical L2 family
→ L3 exact surface blueprint
```

L3 may specialize lexical learning geometry. It may not invent a new page theme, font system, palette, card language or chrome.

### Product identity

Vocabulary / Lexical must first feel like part of **English / KianOS**, not a separate green dictionary application.

Inherit from Shared Visual / English family:

- page canvas / ordinary surfaces;
- navigation / return controls;
- ordinary buttons, inputs and overlays;
- normal border / radius / elevation language;
- normal Chinese UI typography;
- shared spacing / density discipline.

Forbidden L2 forks include:

- cream / yellow paper-like page themes;
- broad gray-green or pale-green surface washes;
- Lexical-specific decorative gradients;
- a separate button/control family;
- a separate UI font stack;
- coloring the page merely to create “Lexical identity”.

### Accent ownership

Accepted direction:

> **English shell + very restrained deep-green lexical semantic markers.**

Role split:

```text
English blue / neutral
→ product, navigation and ordinary task chrome

Lexical deep green
→ lexical semantic structure only
```

Deep green may mark POS / semantic type labels, Word Feel structure cues, Construction type labels, local `+` / Repair focus, Reference-card titles or current lexical focus.

Deep green must not become the normal body-text color, page background, rail background, full Sense fill or broad decorative paint.

### Typography hierarchy

Learner scan order:

```text
word identity
→ Chinese semantic定位
→ English lexical calibration
→ usable phrase / construction
```

Accepted roles:

- **Headword** — substantial editorial serif; strongest lexical identity.
- **Word Feel / Core Chinese** — Shared CJK sans; strong compact semantic model.
- **Sense Chinese definition** — **first body-reading layer**; Shared CJK sans; visually stronger / earlier than English definition.
- **Sense English definition** — editorial serif; precise calibration after Chinese; never a heavy headline by default.
- **Phrase / Construction English** — editorial serif with enough weight to remain quickly scannable.
- **Phrase Chinese gloss** — CJK sans, immediately readable.
- **POS / semantic-type / structure labels** — Shared UI/CJK sans with restrained deep-green accent.
- **Reference body** — Chinese sans plus English serif only where genuinely lexical.
- ordinary learner-visible text keeps the Shared Visual readability floor; secondary does not mean thin / tiny / pale.

Use the shared serif role (`Iowan Old Style → Charter → Palatino → Georgia fallback`) rather than hard-wiring Georgia as the Lexical voice.

### Container grammar

Container choice follows the semantic owner rather than backend-field count.

```text
Word Feel
→ header semantic zone; not an ordinary card

Sense
→ one clear bordered learning object

sense-owned phrase / collocation
→ stays inside its Sense; no extra page-level card

Word-owned Construction
→ one main-workspace section container + internal pattern rows

Reference
→ independent cards for genuine cross-sense / cross-word / form / family objects
```

Sense object:

- ordinary Shared/English surface;
- thin neutral border;
- restrained family-consistent radius;
- no default shadow;
- no green fill;
- use Mac width to keep meaning + use spatially close;
- child phrases / fixed structures use light local emphasis, not nested card piles.

Reference cards are intentionally real cards because each represents an independent reference object such as Confusable, Form / Pronunciation or productive Family. They remain compact, white / neutral, thin-bordered and normally unshadowed.

Do not flatten the whole page into borderless rows merely to look “editorial”, and do not wrap every field in a generic card.

### Mac-wide family geometry

Default rich lexical workspace:

```text
Primary lexical learning   ≈ 68–70%
Reference                  ≈ 30–32%
```

Reference width is **earned**. If no useful Reference objects exist, the primary workspace expands instead of preserving an empty rail.

Reference uses the same neutral page family; it is not a broad tinted side panel.

### Chrome / scrolling / controls

- keep page-local top context thin: return / mode / traversal / useful position only;
- do not permanently expose method instructions, engineering state or keyboard tutorials above the learner object;
- use vertical height for lexical learning;
- rich lexical content may scroll naturally;
- Reference may remain simultaneously visible on Mac and scroll locally when needed;
- Word Feel must not become a giant sticky hero;
- Bottom Dock remains a stable, low-height keyboard/action legend and stays visible without becoming a second decorative theme;
- local `+` remains attached to its exact semantic object and stays visually quiet until hover/focus/active.

### Family continuity across learner jobs

Fast Pass / Depth / Repair / Challenge / Lookup must feel like states/jobs of one Vocabulary product rather than separate microsites.

```text
same shell
+ same headword / Chinese / English lexical typography roles
+ same semantic accent
+ same Reference grammar
+ same local Repair grammar
→ different disclosure / focus according to learner job
```

Depth may reveal a rich lexical object. Repair may foreground one unstable local object. Neither is permission to redesign the family.

### Legacy boundary

Legacy / 4173 remains positive **evidence** for:

- strong lexical English typography;
- fast scanning;
- low-friction keyboard study;
- useful sense / usage spatial grouping.

It is not authority to restore legacy palette, chrome, cards, runtime semantics or every historical visual decision.

### Failed L3 candidate boundary

The 2026-09-18 cream / gray-green “editorial sheet” Depth screenshots are **Human-Gate FAILED** and are not a future visual baseline.

Their Rule / Content ownership corrections may be retained where semantically correct. Their local theme, English-first body hierarchy, flattened Reference rail and page material treatment must not be inherited merely because browser/CI checks passed.

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
- exact L3 Depth composition inside the accepted L2 68–70% / 30–32% family geometry;
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
