# Politics Interaction Contract

Status: CURRENT

This file defines how mature Politics Current content should interact with the learner. It does not own political knowledge. Subject-specific learning files remain the teaching-semantic owners.

It inherits:

- the root surface invariant from `SYSTEM_CONTRACT.md`: **an interaction primitive does not own a learner action merely because it can technically render or execute it**;
- the shared Mac-first cognitive presentation grammar from `static-web/PRESENTATION_CONTRACT.md`;
- Politics surface ownership from `content/politics/LEARNING_CONTRACT.md`.

The shared presentation grammar governs Website representation. Normal Chat content learning does not require reading shared presentation, static-web or Runtime contracts.


## 0. Kian-visible reading and discussion entry — no setup prompt required

[Learning §2](LEARNING_CONTRACT.md#2-active-first-round-learning-chain) owns action selection and surface roles. Follow the current request without asking Kian to restate a mode.

**Content authority:** Chat consumes canonical Politics Content; it does not own a parallel durable version of the chapter. It may rephrase, expand, question or locally repair the accepted model, Core and prompts, but it must not reconstruct a new model/prompt/Memory split from a teacher brief, old conversation or current Website shape. If canonical Content is missing or defective, use the best source-grounded local explanation for the current need and repair or state the exact Content limitation rather than silently creating another course.

### Minimal commands

- `开始马原` / another subject: locate its accepted fixed reading entry under Learning §2; an explicitly named chapter enters that chapter. If no accepted reading edition is available, state the exact candidate/missing boundary rather than inventing delivery. Explicit `教我` / `讲解` requests use the existing substantive explanation and fixed model. No Runtime lookup or old-chat recap is a prerequisite; starting does not reset prior evidence.
- `重新开始…`: restart the requested learner-facing route without deleting prior evidence.
- A specific question: answer that question from the relevant owned explanation and Source when needed; no whole-course restart.
- `直接复习一章` / `复习这一章` / `压缩这一章`: enter the named/current chapter's existing review under Learning §2 and §0.7. Ask only which chapter if neither the request nor reliable context identifies it.

Kian names the subject, chapter or question to study. Follow-ups may use the explicit target in this conversation; if the target is unclear, ask “想学哪一章或哪个问题？” Do not search prior Chats, Resume or learner progress to choose it. When Kian requests progress diagnosis or learning/breakthrough planning, use the actual evidence read path and limits in §8 instead; this is distinct from choosing a lesson.

### The ordinary reading / discussion read path

Reuse the teaching rules and model already recovered in this conversation while their version and relevant scope remain unchanged. For a self-contained source clarification or follow-up question, read only the relevant passage or owned explanation; use the fuller path below only when subject/chapter context changes the answer. Do not reread the manifest or whole subject model for every question.

Resolve the version once: use current main unless Kian explicitly selected another branch/revision for this task. A selected candidate may supply its current teaching text within the stated local Source limits; it is not thereby merged into main or admitted in every scope. Keep subsequent reads on that same version.

```text
requested subject/chapter and action
→ learning/manifest.json: subjects[subject].teaching_preparation.subject_model
→ that subject's current_assets chapter JSON: orientation + fixed model + NU relations
→ chapter's accepted reading/explanation/review pointer for the requested action; existing brief supplies owned support, not automatic proof of a delivered reading edition
→ current explanation / review section: node main prompts + adjacent full answers
→ necessary existing precision object or Source passage only for the dependent claim
```

The chapter JSON locates the stable model; the brief supplies substantive explanations and the current review/prompt answers. Neither a heading list nor `teaching_beats` alone is a full lesson. Do not invent a same-named file: Marxism C00 explicitly points to `learning/marxism/teaching-candidate/subject-model.md` for both first entry and `c00-source-review`. Marxism C01 uses `learning/marxism/ch01.json` and `learning/marxism/teaching-candidate/ch01.brief.md` (`c01-learner-entry` for first explanation; `c01-source-review` for the current review). Xi C01 uses `learning/xi/subject-map.json`, `learning/xi/ch01.json` and `learning/xi/teaching-candidate/ch01.brief.md` (C01-S00–S03 explanation/prompts, S91 compression, S92 current retention depth).

For ordinary review/compression, locate the existing current quick-review section with its complete node prompts and adjacent answers; do not enter a first-retrieval/test section merely because it appears earlier in the brief. If a chapter pointer is missing, use the manifest's chapter directory and that chapter's actual quick-review heading; if the content cannot be read, state the specific missing section rather than inventing prompts or treating headings as complete content. Chapter-local testing directions apply only when Kian explicitly asks to be tested, as Learning §0.7 specifies.

Read only the relevant section after locating it. Ordinary learning does not require root/domain engineering `CURRENT.md`, PR history, old review signatures, inventories or a new Acceptance pass. The directory name `teaching-candidate` and an old appendix are not current admission decisions: use the selected version's current scope statement and item-level restrictions. Unknown adoption remains unknown; a usable local explanation does not certify the whole prepared package, Memory admission, Website delivery or learner progress.

Reuse a source-checked current review at its recorded scope instead of regenerating it at every new Chat. Read the actual Chengfeng passage and necessary tables/images when the request is to compress a new source range, verify wording, resolve a conflict or fill a stated gap; headings/locators alone cannot support those claims. New retention decisions require the route-specific evidence under Learning §6.1; do not treat the designated Leg baseline as the entire required scope. Existing current retention conclusions and valid reviewed objects are not reopened merely because the conversation changed. Do not narrate routing unless a genuine limitation affects the answer.

### What the live lesson should feel like

The prepared package is **teacher preparation**, not a script.

The learner should experience:
- one coherent question or tension being solved;
- each new concept appearing because the current explanation needs it;
- examples and analogies chosen freely when they help;
- decisive conditions/boundaries explained at the moment they matter;
- secondary classifications, quotations and exact wording filled into an already-built model;
- short explanatory questions answered in the same flow; self-checks only in the explicitly requested testing mode under Learning §2;
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

Learning Contract §2 owns learner actions and surface roles, §0.7 owns same-model compression, and §6.1 owns source-grounded selective Memory. This Interaction contract does not establish a second learning or admission owner. Internal teaching shape remains subject-specific, and the chosen path may cross surfaces.

### 1.1 Chat Content reuse

Read the requested substantive content through §0. A teacher brief is backstage support, not a script or a substitute for a newly requested source inspection. Its current source-checked review and owned explanations are reusable Content. Keep valid model relationships and exact identities stable; do not force Source into a conflicting brief or silently correct Source from general knowledge.

A source-based review follows the learner's stated studied scope without requiring a new teaching pass. Explicitly commissioned draft preparation is not learner progress. Existing precision cards are optional artifacts until their current retention role is justified under Learning §6.1.

### 1.2 First-contact classroom behavior

For a teaching request under Learning §2, do not expose the prepared package as a table of contents to be read through. The learner should experience **one problem being solved**, not a sequence of metadata-backed mini-lessons.

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

During review, follow Learning §0.7: first present one compact whole-model view, with the meaningful relations and each learned node’s complete existing Main Prompts together at that natural node, rather than in a separate lookup table. “看框架就行，答案可以有” permits short answer words that clarify a relation; it does not request every node’s full answer paragraph. Expand the relevant owned answer when Kian asks or needs it, or provide full answers when explicitly requested. Add worthwhile residual Precision only when applicable. Full answers stay available in reading/review; hide them only for an explicitly requested clean retrieval attempt. Exact failures can justify local repair, but are not a prerequisite for currently approved precision. During first study, do not force a repeated reveal or testing ritual into the explanation.

The quick-review wording remains Kian's self-use asset. It can be refined and stored later in the existing chapter brief, but normal teaching does not pause to maintain that file.


## 2. Learner attention order

During first-round learning, attention priority is:

1. current cognitive question / Natural Unit position;
2. the current learning action selected under Learning §2;
3. necessary conditions/boundaries in that explanation, with original Chengfeng images/text for calibration when needed;
4. Chat-assisted encoding and exact rehearsal when approved targets become timely, without exposing the entire precision inventory at first entry;
5. Xiao1000 verification in Astro/KianOS web after the relevant whole-item prerequisites are learned;
6. adaptive practice of the approved baseline and evidence-specific repair.

Question counts, memory counts, scheduler labels, source metadata, engineering taxonomy, and a duplicate web lecture must not dominate the learning path.

## 3. Progressive disclosure

Learning §2 owns the fixed-reading / discussion / practice split. The following distinguishes reading/Chat cognition from the Website's bounded practice and real-record role under Learning §7; it is not a Website teaching backlog.

### Before a chapter / unit

The accepted reading edition or explicitly requested Chat explanation gives subject position, why-now, the core question and the same meaningful model. Do not build these as a parallel Website learning surface. Source locators remain available when calibration is needed.

### During reading or Chat discussion

Follow the requested scope and current Content. Explain necessary conditions and boundaries where they are needed; do not force the learner to supply missing understanding by returning to the handout. The Website remains for practice, feedback and records, not a companion model reader or continuous lecture. Question-bound submitted feedback may include the smallest necessary source explanation.

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

For requested diagnosis/planning, Chat reads the actual accessible records through §8 or an existing Review packet; manually opening Review/exporting is not a universal prerequisite. Use only available question-level evidence and annotations to identify underlying problems. A summary supports only its reported scope; missing detail must not be invented. Then choose the smallest justified source return, reconstruction, exact-retention review or retest.

### 3.1 Existing state identifiers — compatibility only

`ORIENT`, `EXTERNAL_LEARN`, `RETURN / CLOSE`, `VERIFY`, `REPAIR` and `CONTINUE` are existing native identifiers, not new learning prerequisites or an authorization to build Website model teaching. Preserve existing records and compatibility; do not rename or delete states as part of this settings change.

The current product division follows Learning §§2/7: fixed reading and Chat discussion outside the Website; Website clean practice → submitted feedback → real evidence → continue/return. User-authorized record reading or an existing Review packet can support later Chat diagnosis and breakthrough planning. Neither a state transition nor an AI-generated example proves actual learning, completion or mastery.

### 3.2 Politics semantic presentation grammar

The existing semantic names below remain valid Content / compatibility vocabulary. They do not require Website presentation: only the practice/feedback/record subset permitted by Learning §7 is active there; reading and discussion may use the wider meanings.

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

Do not materialize these roles as a Website lesson. Content owns their meanings; Learning §7 limits the consumer action.

### 3.3 Existing practice workspace

Preserve the current usable practice/feedback layout and the shared presentation requirements. Do not redesign the Website into a model map, reading edition or chapter workspace merely because those components exist.

During a clean Xiao1000 or Recall attempt, answer-bearing Content remains hidden. After submit, the existing feedback may show the owned explanation, checking and source locator. Wrong/Uncertain records actual evidence without forcing a Chat switch or a new UI ceremony. Only a reproduced usability blocker justifies the smallest scoped repair.

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

Xiao1000 does not organize the course. Its learner attempt behavior is below; proactive Content-production test-point checking belongs to Learning §3.1.2 and does not require or fabricate a learner error.

- release by owning Natural Unit / natural subsection;
- preserve original question/options/answer;
- answer in the Astro/KianOS web Politics question surface after the owning content is learned;
- Wrong/Uncertain records Evidence and continues by default; it is not an immediate repair/source-switch trigger;
- when a source-grounded repair is actually warranted, Chengfeng is the first-round Source owner to return to, not a second explanation textbook; the learner may also choose an optional immediate source return;
- stable correct should pass fast;
- repeated questions are allowed later with a different cognitive task.

## 7. Memory and review

First-round Politics should be understanding-led, not memory-count-led.

Admission and required mastery/accuracy inherit Learning §6.1; model-prompt versus independent precision placement inherits §0.7. Prior Leg-only or no-residual judgments apply only to their inspected scope, not to newly justified secondary targets. Kian may freely choose currently source-reviewed cards without a day plan; optional access does not make the entire catalog recommended recitation. Chat helps select/encode only when useful or requested, and the Website records actual retrieval. Never claim a source-reviewed or Leg-filtered requirement without its actual route-specific evidence.

Use the same Content identity through teaching, compression, exact answer and repair. A conceptual failure reopens the smallest model relation; a wording/list/pairing failure receives focused encoding and retrieval; a transfer failure receives an application task. Correct performance stays cheap, without automatically deleting the approved baseline. Do not mistake “I recognize the revealed answer” for unaided retrieval or `STABLE` for machine-verified mastery.

Review should tell the learner what to do and why, not expose scheduler internals such as D1/D3/D7 labels.

## 8. Continue and Return / Handoff

Politics inherits the KianOS-wide Continue and Return/Handoff capabilities without creating a second Politics scheduler.

### Continue

Existing private session position and source locators may remain available for compatibility and exact practice return. They do not select the next reading lesson, prove study completion or authorize expanded Website learning functionality.

This is personal session position, not shared Current and not a semantic owner.

### Read actual evidence before diagnosis or planning

Use the existing private-record transport owned by [privateDailyLearningPacketRelay](../../static-web/scripts/privateDailyLearningPacketRelay.mjs), with native subject coverage supplied by [privateSubjectCheckpoints](../../static-web/src/lib/privateSubjectCheckpoints.mjs). The current read locator is repository `kianwang022-hash/kian-personal-os`, branch `runtime/kianos-learning`, file `runtime/kianos-learning/current.json`, accessed through the authorized GitHub connection. This is private learner evidence, not an engineering Current or a new public record owner; do not copy learner payloads into this repository.

Before using it, inspect its schema/version, generated time, study day/timezone, subject coverage, warnings and any provided content/task revisions. Compare freshness with the learning period being discussed; an old or unknown/missing subject payload is not zero learning. The remote Packet is a summary, not guaranteed real-time sync or complete per-question attempt/note history. Read existing detailed native evidence or a detailed Review packet only when the dependent diagnosis needs it; if unavailable, report the exact evidence gap rather than infer it from grouped counts. Manual export is only a fallback when needed evidence is not otherwise accessible, not the default read gate. Preserve raw history and distinguish current, stale and unknown-version evidence; an old answer-key result must not silently become current performance.

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

Politics does not auto-send a daily Chat handoff. Dot/Chat may read actual accessible learner records for the user-requested diagnosis and planning; an existing learner-triggered Review packet is one supported route, not the sole permission to read available evidence. Current packet scope and omissions must be disclosed rather than filled with invented records. Existing default exclusion of stable-correct answers does not prove that no successful attempts occurred.

`kianos.politics.return_packet.v1` is the batch Review handoff shape, not a political-knowledge owner. Chat consumes the learner-triggered packet to identify recurring patterns and decide the smallest justified repair, compression, Memory/Precision admission, retest, or Content/runtime correction.

Repeated failure may justify stronger reconstruction or review. One Wrong/Uncertain event does not automatically create a per-question Chat ritual, and a clean stable answer should not create review debt merely because the question exists.

## 9. Astro implementation rule

Inherit the limited practice, submitted-feedback and real-record responsibilities in Learning §7. No reading edition, model teaching, continuous lecture, chapter closure UI or new learning engine is commissioned here. Preserve usable pages, identities and history; repair only verified in-scope blockers.

The component is downstream of the permitted action and Content meaning. Do not make Content fit a renderer or hard-code a second answer set. Existing broader primitives are compatibility assets, not an implementation queue. Rule changes and saved reading HTML do not prove Website delivery or deployment.

## 10. Quality test

A Politics learner experience is good when:
- the learner knows what they are trying to understand or do now without scanning the whole page;
- detailed study and compression are grounded in the requested Chengfeng text and required images;
- Chat fulfils the current learning action under Learning §2 using the existing Content;
- useful Suyi cognition has been absorbed/accounted for without creating a second Suyi course;
- Astro keeps self-selected Memory reachable without a Chat plan and preserves optional planned retrieval, verification and return;
- the first reading explains each cue answer; ordinary review keeps the same model and complete prompts with answers available; only explicitly requested clean retrieval hides answer members;
- source-reviewed availability is not confused with required mastery/accuracy under Learning §6.1 or universal verbatim recitation;
- approved proactive precision can be delivered without a fabricated Wrong event, while unsupported/pending targets remain excluded;
- new teacher wording and the corresponding Website answer agree after Source reconciliation;
- the existing practice workspace stays usable without adding model-teaching or reading widgets;
- question submission, feedback and actual record handling remain clear and bounded;
- Xiao1000 questions enter Astro only after the owning source-grounded content is learned;
- clean attempts are not contaminated by framework/answer leakage;
- switching between original source, Workbench, Review, and Chat is clear and low-friction;
- a correct answer costs almost no extra time;
- Wrong/Uncertain is recorded without forcing an immediate context switch;
- meaningful accumulated Wrong/Uncertain evidence can be exported to Chat as one batch without manual reconstruction;
- the learner never has to wonder which of two competing surfaces is the real place to study the same content;
- the KianOS surface feels simpler as the backend becomes richer.
