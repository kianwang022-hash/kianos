# Xizong Extension Asset Contract

Status: CURRENT_SUBORDINATE  
Authority: CHAT_APPROVED_SUBORDINATE  
Scope: formal learner-facing Xizong Extension assets  
Parent authority: `content/xizong/LEARNING_CONTRACT.md` + `content/xizong/knowledge/learner/study-policy.json`

This contract formalizes how Xizong learner-facing **Extension assets** are admitted, owned, replaced, rendered and maintained.

It does **not** create a second learning baseline, second medical owner, second Lecture, or second learner-state store. If any rule here appears to conflict with the Current Xizong Learning Contract, shared study policy, or canonical medical owner, fail closed and defer to those upstream owners.

---

## 1｜Why this layer exists

Xizong needs a durable place for high-value assets that improve learning without redefining canonical medical truth:

- source figures and diagnostic images;
- editable comparison tables;
- high-quality reviewed summary figures / tables from MarginNote or later user uploads;
- other sparse learner-worthy additions approved by Chat.

The stable medical spine remains:

```text
System → Block → Logic Group → canonical KP
```

Extension assets attach to that spine. They do not become a parallel curriculum.

The design goal is:

> **Stable owner, replaceable asset.**

A better table or figure should be able to replace the current asset without renumbering KPs, changing Logic Group identity, rewriting the renderer, or creating a new medical owner.

---

## 2｜Truth and ownership boundary

### Medical truth

Canonical medical meaning remains owned by Current medical Core and the referenced Source Truth.

An Extension asset may:

- visualize;
- compare;
- compress;
- orient;
- remind;
- expose a spatial / morphological relationship;
- make a reviewed source object easier to revisit.

It may not silently introduce or override medical claims.

If an Extension asset conflicts with canonical Core or reviewed Source Truth, the asset is repaired, replaced or removed. The asset does not win because it is visually clearer.

### Stable owner

Every formal Extension asset must attach to a real stable owner:

- Block;
- Logic Group;
- canonical KP.

A learner-facing cue may be used as a display hook, but cue identity is not the medical owner.

### Stable slot

Formal assets should use a stable `slot_id` representing the learner role of the asset. File path, crop filename and current revision are implementation details.

Example:

```text
slot_id: urinary-b03-lg05-diuretic-targets
owner: urinary-b03-lg05
```

A future improved asset keeps the same slot when it serves the same learner role.

---

## 3｜Formal asset families

V1 recognizes three formal learner-facing asset families.

### `STRUCTURED_TABLE`

Use when the main value is semantic comparison that can be represented losslessly as rows / columns.

Typical examples:

- drug / target / site comparisons;
- diagnostic criteria;
- classification boundaries;
- mechanism comparisons;
- high-value numeric tables.

Default rule:

> If the table can be faithfully represented as structured text, prefer a structured table over a screenshot.

Benefits:

- editable;
- searchable;
- accessible;
- responsive on different screens;
- easy to update when Current changes.

The table remains a projection / compression of reviewed truth, not a new truth owner.

### `SOURCE_VISUAL`

Use when the visual itself carries information that is materially degraded by conversion to prose or a native table.

Typical examples:

- pathology morphology;
- radiology / imaging;
- anatomy / spatial relationships;
- physiologic curves;
- mechanism diagrams whose geometry / direction is itself the learning target;
- original source graphics where visual recognition matters.

Original PDF / Source Page remains Visual Truth.

### `SUMMARY_VISUAL`

Use when a reviewed authored visual summary is itself learner-worthy, including a future high-quality MarginNote screenshot or user-uploaded summary figure / table.

A Summary Visual is not automatically formal merely because the user marked it important. Chat must approve its learner role and owner.

If a summary is primarily an ordinary editable comparison table, prefer `STRUCTURED_TABLE`. Use `SUMMARY_VISUAL` when the authored visual organization itself is part of the value.

---

## 4｜Admission gate: sparse, high-value, not exhaustive

Formal Extension assets are deliberately selective.

An inline asset should normally satisfy at least one of:

1. the learner relationship is materially easier to understand visually than from prose;
2. visual recognition is itself examinable or clinically meaningful;
3. the asset materially reduces repeated learning friction;
4. the asset places several important mechanisms / boundaries into one useful spatial frame;
5. the asset is a genuinely superior reviewed summary worth returning to later.

Do not formalize an asset merely because:

- the Lecture contains a figure or table;
- a Visual cue exists;
- a coverage metric would increase;
- the page looks empty without an image;
- a screenshot is faster to implement than a structured representation.

Hard rule:

> **Visual cue ≠ mandatory inline asset.**

A source locator + micro-task may remain the correct projection indefinitely.

Do not bulk-screenshot Lecture for completeness.

---

## 5｜Provenance and candidate workflow

Every formal asset must preserve provenance sufficient to recover its semantic basis.

Recommended provenance kinds:

- `LECTURE_SOURCE` — direct source crop / table reconstruction from reviewed Lecture;
- `MARGINNOTE_REVIEWED` — user-created or user-selected MarginNote asset reviewed by Chat;
- `USER_UPLOAD_REVIEWED` — later user upload reviewed by Chat;
- `CHAT_STRUCTURED_FROM_CURRENT` — structured projection compiled from accepted Current Core / reviewed Source.

Formal provenance should include the relevant source locator(s), source identity/hash when available, and review basis.

### User / MarginNote candidate flow

A future user upload enters as a candidate, not automatically as canonical content.

Chat classifies it as one of:

```text
PERSONAL_ONLY
FORMAL_EXTENSION
REPLACE_EXISTING_SLOT
CORE_REPAIR_CANDIDATE
NO_CHANGE
```

`PERSONAL_ONLY` remains outside canonical Project Source / formal repository content.

`FORMAL_EXTENSION` or `REPLACE_EXISTING_SLOT` requires a real owner, provenance and display policy before Codex performs mechanical ingestion.

---

## 6｜Revision and replacement

The current learner registry should point to the active revision of a slot.

For a stable slot:

```text
same learner role
→ keep slot_id
→ increment revision
→ replace active payload
```

Do not create a new KP, Logic Group or cue merely because a better visual/table arrives.

Git history preserves superseded files. The Current registry does not need to accumulate every historical revision unless a future audit requirement explicitly justifies it.

A replacement must preserve or improve the accepted learner role. If the new asset changes the medical meaning or learning role, it is not a mechanical replacement and must return to Chat.

---

## 7｜Display policy and Recall neutrality

Extension assets must not leak answers into a clean Recall surface by default.

Formal assets should declare an explicit display timing. V1 allowed timings:

- `ORIENTATION_SAFE` — reviewed as non-leaking and useful before learning;
- `LEARNING_MOMENT` — shown at the relevant Logic Group / learning moment;
- `POST_REVEAL` — shown only after the answer / model is revealed;
- `REFERENCE_ONLY` — folded or explicitly opened when needed.

Safe default when timing is absent or uncertain:

```text
POST_REVEAL / REFERENCE_ONLY
```

Structured tables, summary screenshots and source figures that contain direct answers must not appear on the clean Recall front.

The existing Xizong rule remains: iPad / MarginNote is the external-primary continuous Lecture surface; KianOS assets are selective support and must not turn KianOS into a second full Lecture reader.

---

## 8｜Canonical representation

Future generic formal Extension registries should be owner-centered and slot-centered rather than filename-centered.

A minimal logical shape is:

```json
{
  "slot_id": "urinary-b03-lg05-diuretic-targets",
  "owner": {
    "block_id": "urinary-b03",
    "logic_group_id": "urinary-b03-lg05"
  },
  "cue_id": "a3-b03-lg05-visual",
  "asset_type": "STRUCTURED_TABLE",
  "revision": 1,
  "provenance": {
    "kind": "LECTURE_SOURCE",
    "source_locator": "生理 Lecture PDF P293"
  },
  "display_policy": {
    "timing": "POST_REVEAL",
    "default_state": "COLLAPSED"
  },
  "payload": {}
}
```

`cue_id` is optional and is a projection hook, not the stable asset identity.

Image payloads may contain path, dimensions, alt text and hashes. Structured-table payloads should contain machine-readable columns and rows rather than an image encoding of the table.

---

## 9｜Backward compatibility

Current `*-source-visuals.json` manifests and `kianos.xizong.source_visual_bundles.v1` remain valid accepted compatibility assets.

Hard rules:

- do not mass-migrate A1/A2/A3 merely for schema symmetry;
- do not invalidate accepted Source Visuals because a generic Extension layer now exists;
- migrate or replace an existing slot only when maintenance value or learner value justifies it;
- future systems should prefer the generic Extension layer once its runtime support is accepted.

Existing Source Visuals may coexist with future structured tables or summary assets as long as their learner roles are distinct and non-duplicative.

---

## 10｜Validation requirements

A formal Extension implementation must fail closed on at least:

- unknown owner anchor;
- duplicate active `slot_id`;
- invalid or missing revision;
- missing provenance;
- unsupported asset type;
- missing image file / bad image hash when image-backed;
- malformed structured-table schema;
- unsafe display timing that violates Recall-front neutrality;
- a formal asset that silently changes Core identity or Source precedence.

Validation may prove structural correctness. It does not prove learner usefulness; learner usefulness remains a Chat / real-use judgment.

---

## 11｜Chat / Codex responsibility split

### Chat owns

- whether an asset deserves to exist;
- asset family;
- owner / stable slot;
- semantic basis;
- display timing;
- replacement vs new slot;
- Personal vs Formal vs Core-repair routing;
- whether an existing source table should stay an image or become structured.

### Codex owns bounded mechanical execution

- source extraction / crop;
- structured-data transcription after the semantic shape is fixed;
- hash / file placement;
- registry wiring;
- migration mechanics;
- validators;
- browser QA / readback;
- PR / CI / merge / branch cleanup.

`EXECUTION_AUTONOMY != SEMANTIC_AUTHORITY` remains hard.

---

## 12｜Durable direction

The long-term learner model is:

```text
Canonical Core = stable medical answer
Lecture = full Source Truth / coverage substrate
Extension Asset Layer = sparse, replaceable, high-value learning support
Personal evidence / MarginNote state = private learner state
```

For formal Extensions:

> **Owner stays stable; asset may improve continuously.**

This preserves the Current Xizong learning architecture while making figures, tables and later user-provided summaries cheap to update rather than expensive to rebuild.
