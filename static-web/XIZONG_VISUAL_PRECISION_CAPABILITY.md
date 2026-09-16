# Xizong Visual / Precision Capability

Status: **CURRENT PRODUCT CAPABILITY CONTRACT**  
Scope: shared Xizong learner runtime; content coverage may remain sparse and System-specific.  
Learning authority remains `content/xizong/LEARNING_CONTRACT.md` plus Current medical / learner owners.  
Formal generic asset ownership additionally follows `content/xizong/EXTENSION_ASSET_CONTRACT.md`.

---

## 1｜Visual is a conditional learning support, not a separate program

Visual belongs inside the same accepted Xizong learning chain.

```text
current Block / Source-contact segment
        ↓
does this object genuinely depend on seeing a figure / image / curve / spatial relation?
        ├─ no  → normal Lecture / Recall path
        └─ yes → Visual Gate
                   ↓
             original Visual Truth
                   ↓
             optional persistent Extension asset
                   ↓
             continue the same learning path
```

Hard rule:

> **Visual Gate ≠ web screenshot requirement ≠ asset-completeness project ≠ learner completion gate.**

A valid Visual Gate may be satisfied by a precise original-source reminder such as `病理 Lecture P193` when that is the safest and lowest-friction learner action.

---

## 2｜Truth, Gate, Extension and Projection are different layers

### Visual Truth

Original Lecture / PDF / reviewed Source Page owns the visual truth.

This includes pathology morphology, imaging, anatomy, physiologic curves, mechanism diagrams, original tables and other source-local visual relationships.

### Visual Gate

A Visual Gate says:

> this learner object is materially safer or easier to understand/recover by looking at a visual, and the owning object plus exact source location are known.

A Visual Gate does not itself require a copied image in KianOS.

### Extension Asset

A formal Extension persists a high-value learner asset under a stable owner/slot when repeat availability materially improves learning.

Current generic families are:

- `SOURCE_VISUAL`;
- `STRUCTURED_TABLE`;
- `SUMMARY_VISUAL`.

The generic Extension layer supports replacement under the same stable learner-role slot, so a future reviewed MarginNote/user summary can replace an inferior asset without changing KP/LG identity or renderer code.

### Projection / Attention timing

Projection decides whether an available visual/precision object should be learner-visible now, post-Reveal, collapsed/reference-only, or absent from the current stage.

The learner should normally see the useful object/task itself rather than backend Visual/Projection taxonomy.

---

## 3｜Selection rule: sparse, high-value, demand-driven

Visual / Extension content is deliberately not exhaustive.

Prefer a persistent asset when at least one is true:

- morphology / imaging recognition is itself important;
- spatial relation is materially degraded by prose;
- curve or mechanism geometry carries the learning target;
- a dense comparison is substantially better as a native structured table;
- the same visual is repeatedly useful enough to justify one-click revisit;
- Kian later provides a clearly superior reviewed MarginNote / user summary worth preserving.

Do not formalize or batch-produce an asset merely because:

- the Lecture contains a figure;
- a Visual cue exists;
- a System has not yet reached the same visual coverage percentage as another System;
- the page looks empty without an image;
- a screenshot is mechanically easy to produce.

Current / future reviewed Visual candidate lists may remain as candidate pools. Their existence does not make them an active construction backlog that must be completed before study.

---

## 4｜Structured table vs image

When the important meaning is losslessly representable as rows/columns, prefer `STRUCTURED_TABLE` over a screenshot.

Examples:

- drug / target / site comparison;
- diagnostic or classification boundary;
- stable mechanism comparison;
- high-value numeric criteria.

Use `SOURCE_VISUAL` when the visual geometry itself matters, such as:

- pathology / radiology recognition;
- anatomy / spatial localization;
- curves;
- directional pathway geometry;
- original source diagrams where converting to prose/table would destroy the learning value.

Use `SUMMARY_VISUAL` only when the reviewed authored organization itself carries value that should be preserved visually.

---

## 5｜Precision is orthogonal to Visual

Precision is selective exactness support for thresholds, numbers, classification boundaries, drug/time pairings, marker/operation pairings and similar details.

Visual and Precision may coincide, but neither implies the other.

Examples:

```text
pathology morphology image
= Visual, not necessarily Precision

Light criteria exact ratios
= Precision + comparison; best represented as structured data

PV loop
= Visual geometry + mechanism; may also contain exact labels
```

`MI-G / MI-D`, Precision class and Visual need are separate semantic dimensions. The renderer must not collapse them into one importance badge.

---

## 6｜Learner timing / Attention Projection

Visual / Precision should enter the learner surface only when they help the current action.

Typical learner-facing routing:

- **本轮带走** — exact/current item important enough to survive this pass;
- **按需辅助** — Visual / table / source support worth opening now if needed;
- **可以后置** — low-coupling Precision that must not block the mechanism;
- **后面再学 / 串联** — a future owner / relation to notice but not expand now.

Answer-bearing Visual / Extension / Precision content must not leak onto a clean Recall front.

The right rail's default job is attention allocation, not displaying every available asset or a workflow checklist.

---

## 7｜Current asset compatibility

Current legacy Source Visual packs may still live under:

`content/xizong/knowledge/learner/*-source-visuals.json`

with emitted assets under the existing source-visual directory.

They remain valid compatibility content and must not be mass-migrated merely for schema symmetry.

New formal Extension content should use the generic `*-extensions.json` model governed by `content/xizong/EXTENSION_ASSET_CONTRACT.md` when appropriate.

The shared renderer / loader must support zero, partial or richer enrichment without System-specific component branches.

Required fail-closed behavior includes:

- invalid owner / schema;
- duplicate active slot/cue ownership;
- missing referenced asset;
- missing / invalid provenance when required;
- malformed structured table;
- unsafe display timing / Recall leakage.

Content completeness is never a build or Block-completion gate.

---

## 8｜Progressive availability and work scheduling

Engineering/content availability is orthogonal to learner progress.

```text
missing Visual / Extension
≠ learner prerequisite missing
≠ learner failure
≠ unfinished Block
≠ reason to delay study
```

Future Visual / Extension work should normally be triggered by:

- real study arriving at the owning Block/LG/KP;
- a repeated confusion that a figure/table would solve;
- a real visual-recognition requirement;
- a poor current source presentation that deserves a structured replacement;
- a superior reviewed MarginNote/user asset.

Already reviewed but unmaterialized assets may remain queued as optional candidates until they earn priority. Do not run system-wide screenshot production just to close a catalog.

---

## 9｜Hard boundaries

This capability may not change:

- canonical medical ownership;
- System / Block / Logic Group / KP identity or learner order;
- original Lecture as the continuous external-primary source;
- System-specific Source-contact granularity;
- Lecture-attached TTSX surface ownership;
- Recall/completion timing or Evidence meaning;
- Memory admission;
- Question ownership / reviewed-only routing;
- Wrong / Uncertain repair semantics;
- learner U.

Visual / Precision / Extension enriches an accepted route; it does not define a new route.

---

## 10｜Durable direction

```text
Canonical medical Core
        ↓
accepted Learning / Source-contact semantics
        ↓
Visual Gate / Precision need
        ↓
optional Extension asset
        ↓
Projection / Attention timing
        ↓
shared learner renderer
```

The durable product rule is:

> **Stable owner, optional replaceable asset, sparse high-value display, no independent Visual curriculum.**
