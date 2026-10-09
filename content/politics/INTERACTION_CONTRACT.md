# Politics Interaction Contract

Status: CURRENT

This file defines how mature Politics Current content should interact with the learner. It does not own political knowledge. Subject-specific learning files remain the teaching-semantic owners.

It inherits:

- the root surface invariant from `SYSTEM_CONTRACT.md`: **an interaction primitive does not own a learner action merely because it can technically render or execute it**;
- the shared Mac-first cognitive presentation grammar from `static-web/PRESENTATION_CONTRACT.md`;
- Politics surface ownership from `content/politics/LEARNING_CONTRACT.md`.

The shared presentation grammar governs Website representation. Normal Chat content learning does not require reading shared presentation, static-web or Runtime contracts.


## 0. Kian-visible teaching default — no setup prompt required

The learner's current mode is defined in [Learning §2](LEARNING_CONTRACT.md#2-active-first-round-learning-chain): **Chengfeng detailed study; Chat clarification, compression and selective memory encoding.** Do not make Kian repeat this choice or reopen a full Chat course.

**Content authority:** Chat consumes canonical Politics Content; it does not own a parallel durable version of the chapter. It may rephrase, expand, question or locally repair the accepted model, Core and prompts, but it must not reconstruct a new model/prompt/Memory split from a teacher brief, old conversation or current Website shape. If canonical Content is missing or defective, use the best source-grounded local explanation for the current need and repair or state the exact Content limitation rather than silently creating another course.

### Minimal commands

- `开始马原` / another subject: enter the subject total model and its opening question; an explicitly named chapter enters that chapter directly. Do not make a Runtime lookup or old-chat recap a prerequisite. Starting does not reset prior evidence or require a full replacement lecture.
- `重新开始…`: restart the requested learner-facing route without deleting prior evidence.
- A specific question: answer that question from the relevant owned explanation and Source when needed; no whole-course restart.
- `直接复习一章` / `复习这一章` / `压缩这一章`: use the named/current chapter's existing source-faithful model, node main prompts and full answers under Learning §0.7. Do not require another lesson or an answer-by-answer test before showing the review. Ask only which chapter if neither the request nor reliable context identifies it.

Kian names the subject, chapter or question to study. Follow-ups may use the explicit target in this conversation; if the target is unclear, ask “想学哪一章或哪个问题？” Do not search prior Chats, Resume or learner progress to choose it.

### The ordinary Chat read path

Reuse the teaching rules and model already recovered in this conversation while their version and relevant scope remain unchanged. For a self-contained source clarification or follow-up question, read only the relevant passage or owned explanation; use the fuller path below only when subject/chapter context changes the answer. Do not reread the manifest or whole subject model for every question.

Resolve the version once: use current main unless Kian explicitly selected another branch/revision for this task. A selected candidate may supply its current teaching text within the stated local Source limits; it is not thereby merged into main or admitted in every scope. Keep subsequent reads on that same version.

```text
requested subject/chapter and action
→ learning/manifest.json: subjects[subject].teaching_preparation.subject_model
→ that subject's current_assets chapter JSON: orientation + fixed model + NU relations
→ chapter's action-matched explanation/review pointer, or its existing brief in teaching_preparation.chapter_directory
→ current explanation / review section: node main prompts + adjacent full answers
→ necessary existing precision object or Source passage only for the dependent claim
```

The chapter JSON locates the stable model; the brief supplies substantive explanations and the current review/prompt answers. Neither a heading list nor `teaching_beats` alone is a full lesson. Do not invent a same-named file: Marxism C00 explicitly points to `learning/marxism/teaching-candidate/subject-model.md` for both first entry and `c00-source-review`. Marxism C01 uses `learning/marxism/ch01.json` and `learning/marxism/teaching-candidate/ch01.brief.md` (`c01-learner-entry` for first explanation; `c01-source-review` for the current review). Xi C01 uses `learning/xi/subject-map.json`, `learning/xi/ch01.json` and `learning/xi/teaching-candidate/ch01.brief.md` (C01-S00–S03 explanation/prompts, S91 compression, S92 current retention depth).

For ordinary review/compression, locate the existing current quick-review section with its complete node prompts and adjacent answers; do not enter a first-retrieval/test section merely because it appears earlier in the brief. If a chapter pointer is missing, use the manifest's chapter directory and that chapter's actual quick-review heading; if the content cannot be read, state the specific missing section rather than inventing prompts or treating headings as complete content. Chapter-local testing directions apply only when Kian explicitly asks to be tested, as Learning §0.7 specifies.

Read only the relevant section after locating it. Ordinary learning does not require root/domain engineering `CURRENT.md`, PR history, old review signatures, inventories or a new Acceptance pass. The directory name `teaching-candidate` and an old appendix are not current admission decisions: use the selected version's current scope statement and item-level restrictions. Unknown adoption remains unknown; a usable local explanation does not certify the whole prepared package, Memory admission, Website delivery or learner progress.

Reuse a source-checked current review at its recorded scope instead of regenerating it at every new Chat. Read the actual Chengfeng passage and necessary tables/images when the request is to compress a new source range, verify wording, resolve a conflict or fill a stated gap; headings/locators alone cannot support those claims. New retention decisions require the exact designated Leg passage under Learning §6.1. Existing current retention conclusions and valid reviewed objects are not reopened merely because the conversation changed. Do not narrate routing unless a genuine limitation affects the answer.

### What the live lesson should feel like

The prepared package is **teacher preparation**, not a script.

The learner should experience:
- one coherent question or tension being solved;
- each new concept appearing because the current explanation needs it;
- examples and analogies chosen freely when they help;
- decisive conditions/boundaries explained at the moment they matter;
- secondary classifications, quotations and exact wording filled into an already-built model;
- occasional short reconstruction or 2–3 item self-check only when it helps the current chunk;
- the same fixed model returning at review/compression.

The learner should **not** experience:
- GitHub/file/NU/K/Memory IDs as a classroom table of contents;
- `node 01 → definition → common error → node 02` recital;
- a teacher brief being paraphrased section by section;
- repeated re-teaching just because a new Chat started;
- a second framework for “easy memory” after the canonical model already exists.

### Teacher freedom and hard invariants

Chat is free to vary wording, analogy, pacing, examples, questioning style, chunk size and local explanation order.

Chat must preserve:
- the Current subject total model and chapter reconstruction spine;
- Content-owned node main prompts and the model-bound versus residual-Memory split;
- the prepared problem/dependency route and decisive relations when Chat teaching is requested;
- Source-supported conditions and boundaries;
- reviewed exact-target identity/answer/checking semantics;
- actual learner position and evidence boundaries.

A good lesson is therefore **stable in cognition, flexible in teaching**.


### Inline compression during learning

Compression behavior is owned once by [Learning §0.7](LEARNING_CONTRACT.md#07-three-layer-learner-compression--build-it-while-learning). During the middle of a requested explanation, compression is optional. **Once a complete chapter or major argument block has actually finished, Chat must perform the Learning §0.7 closure compression before moving into the next chapter / major block; Kian should not have to ask for it.** During a requested source review, compression remains the deliverable.

Keep the mainline high-density. Main prompts compress worthwhile model-bound memory, not every explanatory branch: first apply Learning §6.1 to both memory destinations, then place naturally grouped content on its model node and residual exact fragments in Memory under §0.7. On first reading, explain the full supported answer in adjacent prose; ordinary review may keep necessary answers beside the model and complete prompts; omit answer-bearing material only for an explicitly requested clean retrieval attempt. Pure explanation stays in the mainline without forced prompts. Do not turn a count into an unsupported recitation requirement or duplicate model memory as routine cards.

Preserve the accepted simple reading presentation rather than adding tools: compact chapter logic/cues with continuous review content. No repeated reveal clicks, quizzes, source-QA panels or Memory inventories unless requested. An HTML save is not a website deployment or memory-plan application.

## 1. Shared learner loop

The shared first-round loop is:

`Chengfeng detailed study → source-faithful model → Leg-informed necessity/accuracy selection → model-bound main prompts + complementary fragment Memory; Xiao1000 / Recall → smallest justified repair`

Learning Contract §2 owns this loop and §6.1 owns source-grounded selective Memory. This Interaction contract follows them; it does not establish a second teaching or admission owner.

Only this top-level cognitive loop is shared across subjects. Internal teaching shape remains subject-specific, and the path is allowed to cross surfaces.

### 1.1 Chat Content reuse

Read the requested substantive content through §0. A teacher brief is backstage support, not a script or a substitute for a newly requested source inspection. Its current source-checked review and owned explanations are reusable Content. Keep valid model relationships and exact identities stable; do not force Source into a conflicting brief or silently correct Source from general knowledge.

A source-based review follows the learner's stated studied scope without requiring a new teaching pass. Explicitly commissioned draft preparation is not learner progress. Existing precision cards are optional artifacts until their current retention role is justified under Learning §6.1.

### 1.2 First-contact classroom behavior

When Kian explicitly requests Chat teaching, do not expose the prepared package as a table of contents to be read through. The learner should experience **one problem being solved**, not a sequence of metadata-backed mini-lessons.

Default move:
```text
chapter-level tension/question
→ explain only what is needed to cross the current logical gap
→ that answer creates the next necessary question
→ continue the same argument
→ at natural closure, point back to the fixed reconstruction spine
```

Node numbers, NU/K IDs, A/B/C dispositions, Memory IDs and teacher-brief headings are teacher coordinates. They stay backstage unless the learner explicitly asks for structure/provenance. A local explanation may mention the stable node for orientation, but it must not turn “node traversal” into the pedagogy itself.

If a first lesson starts sounding like `definition → paraphrase → common error → next definition`, recover the chapter's core problem and ask what unresolved relation makes the next concept necessary. Secondary detail can be filled after the model exists; do not mistake completeness assets for the live teaching surface.

### 1.3 Compression stays backstage until it helps

During an explicitly requested lesson, continue the explanation. For a compression/review request, deliver the source-faithful review directly; do not turn the following optional classroom guidance into a gate.

Do not visibly produce a review sentence, expansion cue, Memory mapping, or GitHub note after every coherent block merely because the block has closed. **Ordinary paragraph/block closure is only permission to compress; a completed chapter or major argument block that is about to hand off to the next chapter / major block is a mandatory compression boundary.**

Use an explicit compression moment:
- **must:** the learned chapter / major argument is complete and the lesson is about to cross into the next chapter / major block;
- **may:** Kian asks to compress / review;
- **may:** one short sentence would clearly stabilize a model that has just become understandable;

At a mandatory chapter/major-block closure, do not reteach. Return briefly to the same canonical model, show the Main Prompts for the actually learned nodes, preserve only the necessary high-value boundaries, mention residual Memory only if it exists, then continue. For a smaller optional closure, one relation sentence or one plain-language reconstruction cue is enough.

Never introduce a cue that requires explanation of the cue itself. If the cue needs its own lesson, omit it.

Precision/Memory remains a separate later layer. Do not inspect the Memory catalog during live explanation unless an exact fact is currently needed to teach the argument correctly or Kian explicitly asks about what must be memorized.

During review, follow Learning §0.7: traverse the same model with each learned node’s complete existing Main Prompts presented at that natural node, rather than in a separate lookup table; add worthwhile residual Precision only when applicable. Full answers stay available in reading/review; hide them only for an explicitly requested clean retrieval attempt. Exact failures can justify local repair, but are not a prerequisite for currently approved precision. During first study, do not force a repeated reveal or testing ritual into the explanation.

The quick-review wording remains Kian's self-use asset. It can be refined and stored later in the existing chapter brief, but normal teaching does not pause to maintain that file.


## 2. Learner attention order

During first-round learning, attention priority is:

1. current cognitive question / Natural Unit position;
2. the requested Chengfeng source-study, clarification or compression task;
3. necessary conditions/boundaries in that explanation, with original Chengfeng images/text for calibration when needed;
4. Chat-assisted encoding and exact rehearsal when approved targets become timely, without exposing the entire precision inventory at first entry;
5. Xiao1000 verification in Astro/KianOS web after the relevant whole-item prerequisites are learned;
6. adaptive practice of the approved baseline and evidence-specific repair.

Question counts, memory counts, scheduler labels, source metadata, engineering taxonomy, and a duplicate web lecture must not dominate the learning path.

## 3. Progressive disclosure

Default Astro display should be quiet and companion-like when another surface owns the active learning action.

### Before a chapter / unit
Show only:
- where this content sits;
- why it appears now;
- the core question it solves;
- the smallest useful absorbed framework/relation scaffold;
- the Chengfeng Source locator when calibration is needed.

### During Chat teaching
Chat leads only the explanation Kian requested; Chengfeng remains the detailed-study and compression basis. This is help within one course, not a replacement course.

Astro may keep the current Natural Unit, learning question, checkpoint, relation anchor, boundary, absorbed Suyi framework object, or source locator visible when useful, but it must **not** render Chengfeng as a competing continuous lecture reader.

A minimal source excerpt is allowed only when it serves a bounded repair/orientation decision. It must not expand by convenience into a second full lecture.

### At natural closure
At an ordinary pause, offer one short reconstruction/checkpoint cue only when useful; it may be skipped. The chapter/major-argument transition follows the required learned-scope compression in Learning §0.7, without making every small pause a closure. Natural Unit identity is not a one-sitting requirement. Pausing/resuming within Chat teaching or Source calibration does not require a web checkpoint or prove completion. Do not create a large recall ceremony or make answering a gate to continuation. Proactive precision follows Learning Contract §6.1; this paragraph creates no schedule.

Closure and later review must return to the chapter's fixed reconstruction spine from Learning Contract §0.5. Chat may expand a node, suppress detail, blank a node for Recall or approach one node from a question/example, but it must not improvise a different overall chapter framework when Current has not changed. After any local detour, restate the stable node/relationship it belongs to so the learner's index is reinforced rather than rebuilt.

### Encoding and exact retrieval
After the relevant model is understood, Chat follows Learning Contract §3.2: identify what must be exact, organize it with meaningful cues/contrasts, recover the authoritative wording and explain the checking criteria. Explanation, aid and answer are distinct. Useful first-round exactness is not postponed merely because no question has been missed.

Use a small natural group rather than a wall of lists or mechanically isolated words. When Kian explicitly requests exact retrieval practice, start with a clear unaided prompt; optional help follows an attempt. Ordinary explanation and framework review may show the answers directly. A mnemonic is optional and must not replace the approved answer. First rehearsal is a teaching action, not an invented Website event or a mastery declaration.

The Website executes learner-selected source-reviewed items or an optional existing Memory plan: prompt → learner retrieval → reveal answer/checking content → `FORGOT / FUZZY / STABLE` self-report → continue. Do not pre-reveal answer-bearing hints in a clean Recall or Xiao1000 task. Fields not consumed by the existing loader/renderer are not implemented merely because an author added them to a file.

### Verification
Open the currently relevant Xiao1000 questions in the Astro/KianOS web question surface only after the owning content is learned.

The web owns the attempt interaction and evidence capture. Original question/options/official answer remain source-owned, and Xiao1000 still does not determine first-learning order.

### Stable correct
`✓ → continue`

Do not force a full explanation.

### Wrong / uncertain
Do not interrupt the question session with a mandatory Chat or repair workflow.

After submit, show the same question-bound backside Content used for every submitted result:

- `takeaway`;
- refined explanation;
- exact/safest Current Chengfeng locator when available;
- learner cause / note / favorite / discussion controls.

Record Wrong / Uncertain Evidence and let the learner continue. The Chengfeng locator is a reference/optional return, not an automatic redirect.

Diagnosis happens later when the learner intentionally opens Review and exports a batch learning packet. Chat then looks across the accumulated questions and learner annotations, compresses them into the smallest real underlying problems, and decides whether any source return, reconstruction, Memory/Precision admission, retest, or Content correction is justified.

### 3.1 Politics cognitive state model

The following retains the existing native state identifiers for reference. Chat continuous teaching and same-model compression are conceptual learning responsibilities under [Learning Contract §2](LEARNING_CONTRACT.md#2-active-first-round-learning-chain), not new Runtime enums or proof that the Website has migrated:

```text
ORIENT
→ EXTERNAL_LEARN
→ RETURN / CLOSE
→ WORKBENCH VERIFY
→ submitted backside Content
→ record Evidence / optional learner cause-note
→ CONTINUE

later, learner-triggered:
REVIEW BATCH → CHAT DIAGNOSIS → optional targeted follow-up
```

Later phases may add `REVIEW`, `PRECISION`, and `MOCK / TRANSFER` states when the applicable contract makes them learner-relevant.

The existing Website Source subflow remains a companion to external Chengfeng study. These identifiers do not establish what Kian has studied or prove a website migration; actual product delivery needs its own evidence.

#### `ORIENT`
Dominant task: know what problem this Natural Unit solves and how it sits in the subject/chapter structure.

Primary Politics semantic objects:
- `Problem`;
- a small `Map` / `Chain` / `Compare` / `Boundary` matching the subject model;
- `Handoff / Locator` to Chengfeng.

#### `EXTERNAL_LEARN`
Native Website Source subflow: point to the owning Chengfeng materials for detailed study or calibration. Chat explains on request; `EXTERNAL_LEARN` is not evidence that source study occurred.

Astro is companion-only. It may preserve:
- current `Problem`;
- compact framework / relation anchor;
- what to look for;
- source locator;
- return/checkpoint action.

It remains a companion to the learner-selected source study and requested Chat help.

#### `RETURN / CLOSE`
Native return/closure cue, used only when useful. Chat separately compresses the same taught model at natural closure; this responsibility does not rename or implement a Runtime state.

Use the smallest justified reconstruction object. This may be:
- a `Recall` derived from the earlier `Map` / `Chain`;
- a short closure question;
- one key `Boundary` / `Anchor`.

Do not create a large recall ritual merely because the UI supports one.

#### `VERIFY`
Dominant task: answer the currently first-ready Xiao1000 task cleanly.

The question/task owns the Cognitive Stage. Framework/reference content must not leak the answer before submission.

#### `REPAIR`
Dominant task: fix the first meaningful failure and return.

Repair representation follows failure shape instead of opening one generic explanation panel.

#### `CONTINUE`
Dominant task: know what is stable, what remains uncertain if anything, and the next Natural Unit / learner action.

Closure should be compact; do not turn it into a dashboard.

### 3.2 Politics semantic presentation grammar

Politics uses the shared semantic roles in `static-web/PRESENTATION_CONTRACT.md`, with these lane-specific meanings:

- `Problem` — the central political-theory / historical / normative question of the current Natural Unit;
- `Map` — subject position, theory hierarchy, conceptual topology, or absorbed Suyi framework;
- `Chain` — causal reasoning, historical development, mechanism-like theory relation, or `problem → response → consequence` sequence;
- `Compare` — confusable theory positions, hats/roles, historical choices, or moral/legal concepts;
- `Boundary` — exact scope distinction such as what a formulation includes, excludes, or must not be confused with;
- `Anchor` — a scarce organizing relation that should survive the Unit;
- `Exact` — fixed formulation, identity, timeline point, list item, legal wording, or later precision target;
- `Handoff / Locator` — the exact Chengfeng location / next cross-device action;
- `Recall` — hidden-node / hidden-relation reconstruction rather than answer-first summary;
- `Question / Task` — Xiao1000 clean attempt;
- `Repair` — smallest semantics matching the actual failure;
- `Closure` — compact Unit result and next action.

Do not mechanically materialize all roles for every Unit. The content semantics decide which shapes exist.

### 3.3 Mac landscape workspace behavior

Politics inherits the Mac / wide-landscape primary workspace from `static-web/PRESENTATION_CONTRACT.md`.

Default composition should therefore behave like a cognitive workspace rather than a vertically stretched chapter document:

- thin top `Location / State` context;
- large central `Cognitive Stage` for the current Problem / Map / Recall / Xiao1000 task / Repair;
- right `Contextual Inspector` for currently useful Suyi-derived framework detail, Chengfeng locator, Exact object, evidence, or bounded repair;
- broad left navigation only when it materially helps orientation; otherwise collapse it into breadcrumb/location context.

Politics should use horizontal space to show relationships and discrimination, not to display more counters/cards.

During a clean Xiao1000 attempt, answer-bearing Content remains hidden. After submit, the formal Workbench backside may show the prebuilt explanation and locator; Wrong/Uncertain alone does not turn the learning workspace into a mandatory Repair surface.

## 4. Subject-specific interaction shapes

### Marxism
Primary interaction: relation and reasoning chain.

Prefer:
- cause/relation arrows;
- contrast boundaries;
- mechanism reconstruction;
- one question asking why the next concept must appear.

Avoid turning philosophy into isolated definition cards.

### History
Primary interaction: historical movie.

Prefer:
- stage strip / timeline;
- `previous road → problem → new force/idea → turning point → consequence`;
- explicit success/limit double judgments;
- historical significance only after the event chain is clear.

Avoid date-list-first learning.

### Mao / Chinese Marxism theory development
Primary interaction: historical problem → theory response → position in theory sequence.

Prefer:
- what Chinese problem existed;
- what theory answered it;
- why that answer was needed then;
- what belongs to route/program/experience/position;
- how later theory inherits and develops earlier theory.

Avoid pure theory-name chronology or giant fixed-formulation lists.

### Xi / New Thought
Primary interaction: hierarchy and role.

Before memorizing wording, classify the statement as one of:
- direction / position;
- value stance;
- goal;
- fundamental guarantee;
- driving force;
- principle;
- system/institution;
- path/method;
- field-specific deployment.

Prefer hierarchy maps, role labels, and confusable-boundary comparisons. Teach the approved fixed-target baseline under Learning Contract §6.1; use Xiao1000 and Recall evidence to adjust rehearsal and identify additional gaps, not to exclude proactive precision.

Avoid turning first-round learning into a hat-memorization queue.

### Ethics / Law
Primary interaction: concept boundary + normative judgment + situational application.

Prefer:
- `concept A vs concept B` boundaries;
- identify which social relationship / normative layer the question belongs to;
- short situational judgments;
- rights/obligations, personal/social, moral/legal distinction.

Avoid abstract slogan repetition when a concrete judgment can test understanding better.

## 5. Suyi behavior

Suyi is background framework input for Chat, not a default learner surface.

Its useful value must be **consumed into KianOS cognition**, not merely acknowledged as an optional source.

For a declared Politics content-closure scope, materially relevant Suyi framework/relation/boundary input should receive an explicit disposition such as:

- `ABSORBED` — becomes an approved `Map` / `Chain` / `Compare` / `Boundary` / `Anchor` / bridge/compression object;
- `DUPLICATE` — already represented adequately by Current Chengfeng-derived learning semantics;
- `CROSS_UNIT` — valid but belongs to another Natural Unit / compression owner;
- `REPAIR_ONLY` — useful only after a specific failure;
- `REFERENCE_ONLY` — valuable context but not first-round projection;
- `REJECTED / UNSUPPORTED` — not adopted because it is misleading, source-specific method preference, unsupported, or outside the Current learner need.

The exact storage format is a Content-stage decision. The Logic requirement is that useful Suyi cognition is **accounted for rather than silently dropped**, while the learner is still not required to study Suyi as a second course.

Do not expose a parallel Suyi reader merely because the source exists.

## 6. Xiao1000 behavior

Xiao1000 validates learning; it does not organize learning.

- release by owning Natural Unit / natural subsection;
- preserve original question/options/answer;
- answer in the Astro/KianOS web Politics question surface after the owning content is learned;
- Wrong/Uncertain records Evidence and continues by default; it is not an immediate repair/source-switch trigger;
- when a source-grounded repair is actually warranted, Chengfeng is the first-round Source owner to return to, not a second explanation textbook; the learner may also choose an optional immediate source return;
- stable correct should pass fast;
- repeated questions are allowed later with a different cognitive task.

## 7. Memory and review

First-round Politics should be understanding-led, not memory-count-led.

Admission and recommended burden inherit Learning §6.1: Leg-informed baseline, justified individual gaps and later output requirements. Kian may freely choose currently source-reviewed cards without a day plan; optional access does not make the entire catalog recommended recitation. Chat helps select/encode only when useful or requested, and the Website records actual retrieval. Never claim a Leg-filtered baseline without reading the exact designated source.

Use the same Content identity through teaching, compression, exact answer and repair. A conceptual failure reopens the smallest model relation; a wording/list/pairing failure receives focused encoding and retrieval; a transfer failure receives an application task. Correct performance stays cheap, without automatically deleting the approved baseline. Do not mistake “I recognize the revealed answer” for unaided retrieval or `STABLE` for machine-verified mastery.

Review should tell the learner what to do and why, not expose scheduler internals such as D1/D3/D7 labels.

## 8. Continue and Return / Handoff

Politics inherits the KianOS-wide Continue and Return/Handoff capabilities without creating a second Politics scheduler.

### Continue

The runtime may remember the learner's most recently opened Politics chapter / Natural Unit and, when useful, the last external-source locator in private browser/device state and offer a Continue entry from the Politics home.

This is personal session position, not shared Current and not a semantic owner.

### Return / Handoff

Stable correct Xiao1000 answers do not need to enter the daily handoff by default.

The minimum Politics handoff evidence is:

- Current subject and chapter identity;
- owning Natural Unit when available;
- stable Xiao1000 `question_id`;
- learner choice and official answer when the question produced repair evidence;
- observable outcome: `WRONG` or `UNCERTAIN`;
- event time / study day.

For cross-surface Chengfeng repair/return, also preserve a stable source locator when the Current source model provides one and it materially reduces resume friction.

Politics does not auto-send a daily Chat handoff. Wrong/Uncertain evidence accumulates privately until the learner intentionally opens Review and exports a batch learning packet. Stable correct answers stay out of that packet by default.

`kianos.politics.return_packet.v1` is the batch Review handoff shape, not a political-knowledge owner. Chat consumes the learner-triggered packet to identify recurring patterns and decide the smallest justified repair, compression, Memory/Precision admission, retest, or Content/runtime correction.

Repeated failure may justify stronger reconstruction or review. One Wrong/Uncertain event does not automatically create a per-question Chat ritual, and a clean stable answer should not create review debt merely because the question exists.

## 9. Astro implementation rule

Astro should provide reusable representation/interaction primitives, not political semantics and not a substitute Chengfeng course.

Useful Politics primitives may implement approved semantic roles such as:
- cognitive-stage Problem;
- current Natural Unit / source locator;
- external-primary study checkpoint / return;
- subject-specific Map / Chain / Compare / Boundary;
- short Recall / closure reveal;
- Xiao1000 Question / Task attempt;
- uncertain marker;
- contextual Repair inspector;
- minimal decisive source excerpt when necessary;
- exact source jump;
- next-unit continuation;
- lane Continue entry;
- compact Wrong/Uncertain handoff.

The primitive/component is downstream of the semantic role. Do not make content conform to a generic card schema merely because the component exists.

`continuous source reader` is **not** an approved first-round Politics primitive for Chengfeng. A shared component may still exist for another domain or reference use, but Politics must not use it to create a second required course. An explicitly requested quick-review HTML is permitted as a source-faithful projection, not another source owner.

If a better explanation, relation, boundary, hierarchy, or stage story can live in Current content, update the content owner instead of hard-coding it in Astro.

## 10. Quality test

A Politics learner experience is good when:
- the learner knows what they are trying to understand or do now without scanning the whole page;
- detailed study and compression are grounded in the requested Chengfeng text and required images;
- Chat explains or compresses the requested scope without a compulsory replacement course;
- useful Suyi cognition has been absorbed/accounted for without creating a second Suyi course;
- Astro keeps self-selected Memory reachable without a Chat plan and preserves optional planned retrieval, verification and return;
- the first reading explains each cue answer; ordinary review keeps the same model and complete prompts with answers available; only explicitly requested clean retrieval hides answer members;
- source-reviewed availability is not confused with Leg-informed retention necessity or must-recite wording;
- approved proactive precision can be delivered without a fabricated Wrong event, while unsupported/pending targets remain excluded;
- new teacher wording and the corresponding Website answer agree after Source reconciliation;
- the Mac landscape workspace uses space to make relations/discrimination clearer rather than simply adding widgets;
- the central Cognitive Stage has one dominant task and the Inspector remains secondary/contextual;
- Xiao1000 questions enter Astro only after the owning source-grounded content is learned;
- clean attempts are not contaminated by framework/answer leakage;
- switching between original source, Workbench, Review, and Chat is clear and low-friction;
- a correct answer costs almost no extra time;
- Wrong/Uncertain is recorded without forcing an immediate context switch;
- meaningful accumulated Wrong/Uncertain evidence can be exported to Chat as one batch without manual reconstruction;
- the learner never has to wonder which of two competing surfaces is the real place to study the same content;
- the KianOS surface feels simpler as the backend becomes richer.

