# English Learning Contract

## Goal

- English I target: **80–85+**.
- Objective-section training target: **60/60**.
- The system is optimized for score reliability under real exam conditions, not for maximizing explanation volume, taxonomy coverage, or course completion.

## Product principle

`Content → Display → Interaction`

Shared Current stores durable source truth and learning semantics. Astro turns those semantics into low-friction learner actions. Chat owns semantic and learning judgments and may update both content and interaction design from real learner feedback.

Private answers, progress, wrong/uncertain marks, comments, timing, and session history are interaction implementation details. They are not shared semantic owners and must not be written into shared Current content.

## Default learning loop

`Clean Attempt → Judge → locate first meaningful failure only if needed → smallest sufficient repair → reconstruct → transfer`

Rules:

- Stable correct performance passes quickly.
- Wrong, uncertain, fragile, or meaningful execution anomalies may expand.
- Expansion stops at the first meaningful failure that is sufficient to explain the performance.
- Repair is local by default. Do not turn one local error into a full lesson unless evidence requires it.
- Correct once does not prove mastery; later unseen transfer is stronger evidence.
- The learner should not maintain a complex diagnostic taxonomy. Chat performs semantic diagnosis from observable evidence.

## Progressive disclosure

Backend content may be rich; the learner surface should be precise.

- Before submission: preserve a clean exam-like attempt. No answer, evidence, explanation, teacher note, or prior-attempt leakage.
- Stable correct: show the minimum needed to move on.
- Judge failure: focus on the decisive option contrast.
- Locate failure: return to the passage and re-identify minimal decisive evidence.
- Sentence/proposition failure: expose only the necessary sentence or span for reconstruction.
- Lexical failure: route to the canonical LexicalOS object when appropriate.
- Discourse failure: expose the minimum paragraph/structure context required.
- Execution failure: show only the evidence needed to change the exam behavior.

Interaction is preferred over passive explanation whenever the learner can reconstruct the answer or representation directly.

## Module-specific cognitive objects

Do not force one taxonomy or one review card across modules.

### Reading A

Primary path:

`understand → locate evidence → adjudicate options → execute`

Default review object:

`question + minimal decisive evidence + chosen/correct contrast`

Question type is not assumed to be the root cause.

### Cloze

Primary path:

`slot demand → lexical/syntactic/discourse constraints → candidate best fit`

Default review object:

`local context + decisive constraints + high-value candidate contrast`

Do not explain the full passage when a phrase, sense, or local constraint is sufficient.

### Part B

Primary path:

`discourse structure → missing/required role → cohesion constraints → candidate fit`

Default review object:

`before/after context + discourse role + decisive fit constraint`

Structure may be more important than sentence-level detail.

### Translation

Primary path:

`English representation → proposition recovery → Chinese realization`

Preserve the learner's first translation. Diagnose whether the first failure is English understanding or Chinese realization before repairing.

### Writing

Primary path:

`task → content → structure → language → error control → time`

Preserve the learner's first draft. Do not replace it by default with a model essay. Repair the highest-value scoring layer first.

## Vocabulary / LexicalOS

LexicalOS is the canonical owner for lexical knowledge.

- Simple words remain L0-first.
- Preserve true polysemy, familiar-new senses, high-value phrases/constructions, contrasts, and confusables.
- Reading/Cloze/Translation lexical failures should route back to the canonical lexical object rather than create duplicate module-specific word explanations.
- The practical target is fast, correct access in real context, not dictionary-style sense accumulation.

## Teacher and method material

Teacher material is a **repair reservoir**, not the default learning path.

- Start from real attempts where possible.
- Call teacher methods only when observed evidence shows a stable need.
- Validated personal methods should stay few, compact, and behaviorally useful.
- Do not let method labels replace direct evidence from the text or task.

## External reading

External reading exists mainly to provide fresh unseen input and transfer testing.

- True-exam memory residue can make reused material less diagnostic; fresh TPO, IELTS, periodicals, and other suitable texts may therefore be added over time.
- External reading depth is adaptive. A normal successful passage may be `read → answer → done`.
- Use sentence reconstruction, paragraph mapping, closed-book compression, or full reconstruction only when the actual failure requires them.
- Treat genuinely unseen material as limited diagnostic capital. Do not expose holdout content before its first clean attempt.
- External materials are for private learner use unless explicitly reclassified later.

## Interaction quality bar

Any new button, label, panel, field, or persistent structure must answer at least one of these questions:

1. Does it improve score reliability?
2. Does it reduce friction in a high-value learning action?
3. Does it preserve evidence needed for better diagnosis?
4. Does it enable a more precise repair or transfer test?

If not, remove or avoid it.

The system should become **richer in backend learning value and smaller in learner-facing noise**.
