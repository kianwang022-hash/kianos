# KianOS Static-Web Current

Role: **learner website Visual / Engineering Work Cursor only**

This file answers one question:

> **What learner-facing website work is actually current now?**

It does not own Rule / Model, domain Content, Acceptance Truth, learner progress, or cross-subject scheduling.

Upstream authority:

- root status / launch decision → `../CURRENT.md`
- architecture → `../ARCHITECTURE.md`
- Visual → `PRESENTATION_CONTRACT.md`, `UI_STYLE_BRIEF.md`, `KIAN_UI_PREFERENCES.md`
- shared Engineering → `../SYSTEM_CONTRACT.md`
- domain cognition / Content → exact domain canonical owners

---

## Current product state

Shared Visual Foundation + Shared Shell have landed on `main` through #389.

Current learner-facing stage:

```text
shared foundation / shell
→ Home
→ reuse accepted English / Politics / Xizong / Lexical surface blueprints
→ representative functional + visual smoke
→ launch
```

Root website blocker: **none at the architecture level**.

Do not reopen accepted architecture, learning logic or task geometry merely because an old implementation branch or historical screenshot differs.

---

## Learner product tree

```text
Home
├─ 西综
├─ 政治
└─ English
   ├─ Reading A
   ├─ Cloze
   ├─ Part B
   ├─ Translation
   ├─ Writing
   ├─ Vocabulary / Lexical
   └─ External Reading
```

Lexical keeps an independent backend canonical owner because its asset scale and semantics justify it. Learner-facing product placement remains under English.

---

## Website responsibility boundary

The website is a consumer and execution surface, not a second knowledge base.

Normal content path:

```text
canonical Content
→ existing loader / renderer
→ learner surface
```

Only use derived presentation when learner state genuinely requires a different visible form.

```text
simple case:   Content → renderer
stateful case: Content → derived presentation → renderer
```

Do not copy knowledge into Astro/components for convenience.

---

## Visual rule

Accepted surface geometry is a durable design asset.

A new Chat may:

- inherit current Shared Visual;
- fix responsive / overflow / accessibility defects;
- clean implementation while preserving the blueprint.

A new Chat may not redesign an accepted Reading / Writing / Translation / Politics Natural Unit / Xizong workspace / Lexical task surface unless Kian explicitly reopens it or upstream Learning Logic materially changes.

External Reading is not a separate visual product. Compatible External Reading content uses the same accepted Reading blueprint.

---

## Engineering rule

Engineering executes approved learner behavior; it does not own Knowledge or Learning Logic.

Reuse Runtime/renderer when the learner is making the same decision with the same evidence meaning.

Examples:

```text
Reading A + External Reading
→ one Reading task family / workspace

same A–D decision grammar
→ shared question behavior where semantics match
```

Different-looking Content does not require a new Runtime. Similar-looking screens do not justify sharing when cognition differs.

---

## Current implementation debt

The major known website debt is historical global style stacking: `Base.astro` still carries more subject/polish/convergence CSS than the target architecture wants.

Target ownership is already fixed:

```text
Base
→ shared visual foundation + shell + truly global runtime only

subject entry
→ subject-level visual/runtime

task workspace
→ task-specific geometry/interaction
```

Do not add new subject-specific global Base imports.

Clean existing layers only in bounded slices with browser proof, and only when they block launch quality or materially lower future change cost. Do not turn launch into broad CSS archaeology.

---

## Historical PRs / documents

Old release PRs, screenshots, artifacts and migration notes are evidence only.

They are not Current continuation authority and must not pull a fresh Chat back into retired projects.

Open/stale PRs may contain useful implementation evidence, but replay only the exact still-valid behavior/geometry onto current `main`; never merge an old branch merely because substantial work exists there.

---

## Fresh-Chat entry

Known website task should normally resolve in roughly 2–3 precise reads:

```text
this CURRENT
→ exact Visual or Engineering authority
→ exact surface / implementation owner
→ work
```

For subject-specific work, read that subject's Learning/Content owner only when the requested change depends on its semantics.

Do not load repository history as ritual.

---

## Launch acceptance

Website launch requires real learner-facing proof, not just CI:

- Home first viewport works and is visually accepted;
- shared typography / contrast / shell remain accepted;
- representative mature English / Politics / Xizong / Lexical paths preserve their accepted geometry;
- major learner actions still function;
- Timer/navigation do not block interaction;
- no obvious required narrow-screen overflow;
- `main` reaches the Current mirror and Astro without manual Git work;
- ordinary Content and Visual changes remain cheap through their canonical owners.

Material Visual closes only with Kian's Human Gate.

---

## Compact operating rule

```text
current main
→ preserve Rule + Content Truth
→ reuse frozen blueprint / shared runtime
→ smallest website change
→ representative browser proof
→ Human Gate when visual
→ land
→ stop
```

**Optimization target: a stable learner website that stays cheap to fill with continuously improving canonical Content.**
