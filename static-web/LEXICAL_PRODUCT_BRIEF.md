# Lexical Visual / Surface Blueprint — Candidate

Status: **VOCABULARY V2 LEARNER SURFACE ACCEPTED — 2026-09-18**  
Parent Visual authority: `static-web/PRESENTATION_CONTRACT.md`  
Preference owner: `static-web/KIAN_UI_PREFERENCES.md`  
Rule / Model owner: `content/lexical/LEARNING_CONTRACT.md`  
Content-quality owner: `content/lexical/CONTENT_ASSET_CONTRACT.md`  
Control router: `content/lexical/CURRENT.md`

This file defines the **candidate learner-facing Vocabulary / Lexical product model** under Architecture v2.

It does not own lexical semantics, learner state, evidence meaning, scheduler policy or Engineering implementation.

Material page geometry remains candidate until Kian reviews real-browser screenshots, except the accepted L3 Depth baseline recorded below.

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

## 3｜Vocabulary Home — accepted role

Home is a **lexical workbench / router**, not a progress dashboard.

It should answer quickly:

- where to continue Coverage;
- how much new-word capacity remains today;
- whether any whole-word `Unknown / Fuzzy` judgments deserve one same-day revisit;
- whether a small high-value exact Repair action is worth doing now;
- how to search the canonical lexicon;
- how to enter Challenge when justified;
- whether an English-origin return context is active.

Accepted priority:

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

Same-day revisit is **ephemeral routing support**, not Repair: it is derived from today's latest whole-card judgment, disappears after a later `Known / Mastered` judgment, and never becomes overdue debt.

---

## 4｜Word Study — accepted learner model

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

The current accepted baseline keeps Recall compact, preserves the accepted keyboard entry, and allows simple words to Fast Pass without forced Reveal. Rich words may use the Recall Map as the entry to accepted Depth.

---

## 5｜Accepted Vocabulary / Lexical visual family

Status: **ACCEPTED by Kian — 2026-09-18**

This section owns the shared learner-facing visual language for Vocabulary / Lexical inside the English product family. It is upstream of exact Fast Pass / Depth / Repair / Challenge surface geometry.

Hard inheritance:

```text
Shared Visual
→ English family shell / control language
→ Lexical visual family
→ exact learner surface
```

Exact learner surfaces may specialize lexical learning geometry. They may not invent a new page theme, font system, palette, card language or chrome.

### Product identity

Vocabulary / Lexical must first feel like part of **English / KianOS**, not a separate green dictionary application.

Navigation ownership is:

```text
L1 global rail  → English
L2 English      → Vocabulary
L3 Vocabulary   → Overview | Learn | Repair | Research
```

A local `← English` control is a parent return/breadcrumb, not another navigation level.

When the learner enters Vocabulary, **do not stack the parent English L2 bar above the Vocabulary bar**. Vocabulary is a child workspace that temporarily owns the single visible top navigation surface:

```text
← English | Vocabulary | Overview | Learn | Repair | Research | 我的 / 设置
```

English remains active in the L1 global rail, which preserves subject identity without duplicate chrome.

Within Vocabulary L3, **Learn is an action destination, not another dashboard**:

```text
Overview = today/workbench
Learn    = enter the current Coverage word directly
Repair   = exact Repair workspace
Research = lookup / semantic exploration
```

Do not create a separate Learn home that repeats Overview state, recent history or same-day revisit controls.

`我的 / 设置` is a **low-frequency utility layer**, not a fifth L3 learning workspace. It may own stable preferences, interpretable learner-state views and local learner-data backup/restore. It must not become an account dashboard or duplicate canonical lexical content.



Inherit from Shared Visual / English family:

- page canvas / ordinary surfaces;
- navigation / return controls;
- ordinary buttons, inputs and overlays;
- normal border / radius / elevation language;
- normal Chinese UI typography;
- shared spacing / density discipline.

Forbidden family forks include:

- cream / yellow paper-like page themes;
- broad gray-green or pale-green surface washes;
- Lexical-specific decorative gradients;
- a separate button/control family;
- a separate UI font stack;
- coloring the page merely to create “Lexical identity”.

### Accent ownership

Accepted direction:

> **Shared English shell + very restrained deep-green lexical semantic markers.**

Role split:

```text
Shared English shell / neutral chrome
→ product, navigation and ordinary task controls

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

## 5.4｜Accepted L3 Depth baseline

Status: **ACCEPTED by Kian — 2026-09-18**

Human-Gate evidence came from real 1440×900 Chromium captures after the Final Learner Object direct-consumption cutover.

Accepted representative fixture family:

```text
ambulance  → SAFE_SIMPLE / no earned Reference
access     → rich polysemy + Family Reference
row        → same-word pronunciation split without repeated Sense overlays
stationary → Confusable Reference
charge     → genuinely long rich object; scrolling allowed
```

Also preserved as semantic-layout sentinels:

```text
abstract   → Chinese Word Feel + Sense + structured Form + Family
sanction   → contronym Word Feel + Senses + Constructions; no fake Reference
write      → ordinary Senses + real write ↔ right Confusable
```

Accepted visual/interaction baseline:

- neutral English-family page canvas;
- substantial editorial serif headword / English lexical calibration;
- full-bodied readable Chinese sans;
- Chinese learner meaning before English calibration;
- restrained deep-green semantic markers only;
- Word Feel is a compact header semantic zone, not a card stack;
- Sense = one clear bordered learning object;
- sense-local phrases remain inside the Sense;
- Word-owned Construction stays in main flow;
- Reference is earned and appears only for real Confusable / Form / Family / relation objects;
- no empty right rail;
- rich Mac geometry remains approximately 68–70% primary / 30–32% Reference when Reference exists;
- Bottom Dock remains stable and visible;
- one-screen fit is preferred when natural, **not a hard requirement**;
- genuinely rich words may scroll; visual compression must not delete meaningful learner content;
- redundant canonical/provenance expressions must be resolved upstream in the Final Learner Object, never hidden heuristically by the renderer.

Accepted architecture underneath this visual baseline:

```text
Natural Owner
→ explicit Content-owned learner dispositions
→ materialized Final Learner Object
→ Website fixed mapping
```

The Website may decide typography, spacing and responsive geometry. It must not decide semantic inclusion, importance, merge survival, dedupe, relation placement or learner value.

### Baseline change rule

Minor polish that preserves the accepted composition may proceed through normal browser QA.

A material change to any of the following requires a fresh Kian Human Gate:

- primary / Reference composition;
- Word Feel / Sense / Construction / Reference visual grammar;
- typography hierarchy;
- palette / broad surface treatment;
- Bottom Dock interaction model;
- introduction of new persistent learner-facing regions;
- any change that reintroduces duplicate learner information into the surface.

The accepted baseline must not drift back toward:

- cream / gray-green editorial-sheet treatment;
- English-first learner hierarchy;
- tiny or thin Chinese text;
- flattened or under-explained Reference rail;
- generic card piles;
- empty persistent Reference width;
- front-end semantic filtering.

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

## 7｜Repair — accepted role

Status: **ACCEPTED by Kian — 2026-09-18**

Human Gate accepted the ACTIVE / WRONG / RECONSTRUCTION / EMPTY family shown in real 1440×900 browser captures. Challenge is the execution mode inside Repair, so this acceptance covers the visible Repair session geometry and its core interaction language.

Repair is a **direct execution session**, not an inventory-management page and not a second study Home.

Primary flow:

```text
current exact Repair objects
→ Chat selects / compiles a small useful Test set
→ website executes the session continuously
→ ← ↑ ↓ → answer
→ correct / wrong evidence
→ wrong only: minimal Repair explanation
→ optional Reconstruction
→ Next
```

The learner should normally enter Repair and immediately continue the current Test when a valid local Challenge Packet already exists.

Repair has three visible states:

```text
EMPTY
→ no current Repair
→ continue Learn

WAITING
→ current Repair exists but no Test is loaded
→ wait for Chat compilation / sync

ACTIVE
→ Test loaded
→ continuous spatial-choice session
```

The active Mac-wide surface should devote most width to the Test. A narrow current-target rail may show word identity, target kind, source evidence, demand and an optional “查看完整词义” escape hatch. It must not reveal the answer or force full-word rereading.

A Repair inventory may remain available in a collapsed transparency section for confirmation / positioning only. It is not the normal click-by-click interaction path.

Manual Challenge Packet JSON import is a compatibility / debug control only and must not occupy the normal learner surface.

Forbidden:

- overdue wall;
- calendar-generated urgency;
- mandatory queue clearing;
- full-card re-study when one local object is the actual problem;
- making the learner open every Repair object manually before testing;
- making packet transport / engineering controls the visual center of Repair.

---

## 8｜Challenge — accepted Repair execution mode

Status: **ACCEPTED by Kian — 2026-09-18**

Challenge remains a test job, but it is **not a peer Vocabulary L3 destination**. It is the primary execution mode inside Repair when Chat decides that a target deserves a Test.

One Challenge tests one named lexical demand with the smallest useful high-information form.

Default interaction for current spatial-choice Challenge:

```text
← ↑ → ↓
→ record exact result
→ correct: continue
→ wrong: show minimum Repair
→ Reconstruction when supplied
→ continue
```

Examples include:

- contextual sense discrimination;
- construction slot choice;
- phrase completion;
- confusable boundary;
- constrained Translation/Writing production.

Chat owns adaptive Test selection / generation. Astro owns fast presentation, keyboard interaction, local resume and evidence capture. Challenge must not become another semantic content owner.

A saved local Test must resume automatically when Repair is entered. Leaving Repair must release the four-direction keyboard controls.

After resolution:

```text
stable evidence
→ target may become dormant when the evidence contract allows

meaningful failure
→ keep / reactivate the exact Repair target
→ change diagnosis or Test form when needed

English-origin context
→ return to the originating English task when appropriate
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

## 10｜English handoff — accepted

Status: **ACCEPTED by Kian — 2026-09-18**

English and Lexical feel like one product even though their semantic owners remain separate.

Accepted interaction:

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

## 12｜Human Gate closure

Status: **ALL MATERIAL VOCABULARY V2 HUMAN GATES ACCEPTED — 2026-09-18**

Accepted sequence:

1. **Vocabulary Home**
2. **SAFE_SIMPLE Fast Pass**
3. **DEPTH_READY Recall entry**
4. **DEPTH_READY Reveal**
5. **Repair**
6. **Challenge**
7. **English → Lexical → exact return**

The accepted geometry is now frozen for normal use. Build success remains insufficient to reopen it; only concrete learner-visible evidence or an explicit Kian request may do so.

---

## 13｜Exam-cycle closure

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
