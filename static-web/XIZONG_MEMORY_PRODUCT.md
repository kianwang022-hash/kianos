# Xizong Memory Workspace

Status: **IMPLEMENTATION CONTRACT · PHASE 1**  
Learning authority: `content/xizong/LEARNING_CONTRACT.md` §12.5–12.7  
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

## 3｜Release is library availability, not Today debt

Block Complete eventually releases every canonical KP Core card plus every valid current-owner Precision card and learner Marked fragments for that Block.

Release means the objects become available in `Core` / `Precision` / `Marked`. It does **not** mark all of them due today.

The current Study policy does not prescribe a fixed 0-1-3-7 style interval table. Therefore Phase-1 scheduling is deliberately **signal-driven rolling priority**, not a fabricated SRS calendar.

Today is rebuilt from current learner evidence:

- explicit weak / unstable evidence raises priority;
- explicit learner review requests raise priority;
- active Repair stays in Repair and may also contribute attention to the owning card;
- stable evidence lowers priority but does not delete the card from its permanent library;
- merely being released does not create an immediate due item.

Future interval calibration may add a time-based policy only through a reviewed execution-policy change; it must not be smuggled in as UI convenience.

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
→ build descriptor from the already-resolved Current learner object
→ releaseBlockMemory(...)
→ return to Block flow
```

The bridge must be tiny, idempotent and downstream of real Block Complete. It must not infer completion from DOM presence or from the existence of canonical content.
