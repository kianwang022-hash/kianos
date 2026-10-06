# Xizong Memory Workspace

Status: **CURRENT PRODUCT / RUNTIME CONTRACT**  
Learning authority: `content/xizong/LEARNING_CONTRACT.md` §8\
Execution policy: `content/xizong/knowledge/learner/study-policy.json`  
Visual reference: `static-web/XIZONG_VISUAL_REFERENCE.md`

This file owns the learner-facing Memory product boundary and private runtime shape. It does not redefine medical Core, Precision truth, learning order, Block Complete semantics or official Question Evidence.

## 1｜Product boundary

Memory is a standalone Xizong workspace:

```text
Today | Core | Precision | Marked | Repair
```

It is not an `After Learn` panel appended below every Block.

Phase 1 deliberately builds the Memory model and `/xizong/memory/` workspace **without modifying `XizongBlockV6` Block Complete**. The Block-complete release bridge is a later integration step so this lane does not conflict with the Block workspace lane.

## 2｜Persistent learner state

Browser-private schema:

```text
kianos.xizong.memory.v1

released_blocks{}
cards{}
prompt_overrides{}
marks{}
evidence[]
attention{}
repair_tasks[]
```

Stable card identities:

```text
Core      core:<kp_id>
Precision precision:<current_precision_cue_id>
```

Releasing the same Block twice is idempotent **for the same canonical content revision**. Weakness never creates another card identity.

When the stable Block/KP identity remains the same but the canonical Block source/content revision changes:

```text
same card identity
→ refresh Core / Precision payload from the Current learner object
→ preserve historical Memory evidence as historical evidence
→ set contentChangedAt on changed cards
→ surface CONTENT_CHANGED_AFTER_LAST_EVIDENCE when prior evidence predates the refreshed content
```

This revision refresh is allowed even if the Block Evidence Guard has already archived/reset first-pass study completion for the new revision. It must not replay an old first-pass `unknown/fuzzy` signal, manufacture mastery, or create a second card identity.

### Core card

A released Core card stores enough current-owner material to remain useful independently:

- System / Block / LG / KP identity;
- canonical Prompt;
- canonical Core HTML / source metadata;
- content/source version metadata.

The learner-facing front uses the private Prompt override when one exists; reset restores the canonical Prompt without mutating canonical content.

### Precision card

A released Precision card preserves the exact reviewed Precision identity and owner anchor.

Current learning-cue indexes sometimes state **what must eventually be exact** without copying the exact answer into the cue itself. Runtime must not hallucinate or regex-guess that answer. The release descriptor may therefore carry:

- `cue` — reviewed exactness target;
- `answer_html` — only when an exact Current-owner answer has been resolved safely;
- `owner_context_html` / owner refs — safe fallback context when isolated exact answer is not yet materialized.

Browse / Recall must display that distinction honestly. Missing isolated answer is an asset-resolution gap, not permission to invent one.

Prepared answer/aid resolution may use an explicitly reviewed `prepared_memory_ref` in the existing learning-cue index, referring to the original `shared-fields.json` memory item. It stores only identity and current KP/item witnesses, not a second answer copy or registry. The resolver verifies exact Source/KP ownership, cue identity, unique aliases and both witnesses; stale or ambiguous bindings fail closed. Original answer scope, Source conflicts and valid memory aids travel inside the protected answer payload. Retained metadata without such an admitted reference is not automatically released.

Adding an exact answer to a formerly cue-only object makes that payload answer-bearing: KP Recall must honor POST_REVEAL, and Memory Recall must hide answer plus aid until Reveal. Same-ID refresh preserves history and revalidates changed meaning through the existing revision mechanism; it does not replay first-pass ratings or create automatic Today debt.

## 3｜Release is library availability, not Today debt

Block Complete eventually releases every canonical KP Core card plus every valid current-owner Precision card and learner Marked fragments for that Block.

Before completion, B1 may explicitly open its thirteen already-admitted prepared
Precision items in native Browse, as required by Learning Contract §0's
Chat → Website retrieval sequence. This card-only availability reuses the
selective cue index and resolved learner object; it does not admit retained
metadata, release Core, write a Block release receipt, or import learner ratings.
Source contact, learned flags, completion, attention and historical evidence
remain unchanged. Reopening preserves the same identities and revision history.
The later genuine Block Complete still owns the normal first-release handoff.
Persistence must succeed before navigation; unreadable storage or a failed save
leaves the prior record in place. The bounded B1 Browse URL only selects a view
and yields to the existing authenticated Chat session path.

Release means the objects become available in `Core` / `Precision` / `Marked`. It does **not** mark all of them due today.

Today combines **signal-driven rolling priority** with the selective delayed rechecks defined by `content/xizong/knowledge/learner/study-policy.json` → `memory_admission.retention_clock`. That execution-policy owner defines the current cadence and anti-inflation rules; time passage alone never creates review debt for untouched released cards.

Today is rebuilt from current learner evidence:

- explicit weak / unstable evidence raises priority;
- explicit learner review requests raise priority;
- policy-qualified delayed rechecks contribute due attention for selectively admitted cards;
- active Repair stays in Repair and may also contribute attention to the owning card;
- stable evidence lowers priority but does not delete the card from its permanent library;
- merely being released does not create an immediate due item.

Changes to interval calibration require a reviewed execution-policy change; they must not be smuggled in as UI convenience.

## 4｜Weak is a view over evidence

`Weak` is computed from preserved observations. It is never a second card corpus.

Examples of weak evidence:

- `unknown` / `fuzzy` Recall;
- later Wrong / Uncertain evidence routed to the same stable card;
- repeated weak Memory Recall.

Examples of stabilizing evidence:

- later `known` / `mastered` Memory Recall;
- stronger later fresh application evidence when integrated.

Repair evidence never rewrites the original observation and never automatically proves mastery.

## 5｜Views

### Today

A ranked rolling queue of released Core / Precision cards with a real attention signal. No artificial same-day wall after Block completion.

### Core

All released Core cards. Filterable later by System / Block / weak state. Normal interaction:

```text
Prompt → Space / Reveal → canonical Core → rating
```

### Precision

All released Precision cards with two modes:

- **Browse** — cue + resolved exact answer/context visible immediately;
- **Recall** — cue first, answer/context protected until Space / Reveal, then rating.

### Marked

Private exact fragments selected from Prompt / Core and anchored to the owning KP. Marking is attention, not automatic weakness. Marked is primarily low-friction rereading.

### Repair

Bounded active tasks returned from Chat / questions / discriminating checks. Repair is not another Memory family and does not duplicate Core/Precision identity.

## 6｜Private annotation semantics

`prompt_overrides[kp_id]` stores private wording only. Canonical Prompt remains available and restorable.

A mark records:

```text
mark_id
kp_id
card_id
surface = PROMPT | CORE
text
created_at
review_requested
```

A mark never mutates canonical Core and never implies the whole KP is weak.

## 7｜Integration boundary

Phase 1 may expose pure functions to create release descriptors and apply an idempotent Block release, but it must not alter the Block completion state machine.

Final integration is:

```text
real Block Complete
→ persist Current Block state
→ emit explicit kianos:xizong-block-complete semantic event
→ build descriptor from the already-resolved Current learner object
→ releaseBlockMemory(...)
→ return to Block flow
```

The bridge also performs one idempotent startup check for a Block completed before the bridge mounted. It must remain tiny and downstream of real Block Complete; it must not infer completion from a DOM click, DOM presence or the existence of canonical content.
