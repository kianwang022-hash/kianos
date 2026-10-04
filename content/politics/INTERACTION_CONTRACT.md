# Politics Interaction Contract

Status: CURRENT

This file defines how mature Politics Current content should interact with the learner. It does not own political knowledge. Subject-specific learning files remain the teaching-semantic owners.

It inherits:

- the root surface invariant from `SYSTEM_CONTRACT.md`: **an interaction primitive does not own a learner action merely because it can technically render or execute it**;
- the shared Mac-first cognitive presentation grammar from `static-web/PRESENTATION_CONTRACT.md`;
- Politics surface ownership from `content/politics/LEARNING_CONTRACT.md`.

The shared presentation grammar decides how approved cognition is represented. This file decides the Politics-specific cognitive states and semantic shapes that the shared grammar must represent.

## 1. Shared learner loop

The shared first-round loop is:

`Total model → progressive Chat explanation → same-model compression → Chat encoding / exact rehearsal → authorized Website Memory retrieval; first-ready Xiao1000 Workbench → prebuilt backside + Evidence → continue; learner-triggered Review and Recall return → Chat diagnosis / adaptive review, including no extra action`

Learning Contract §2 owns this loop and §6.1 owns source-grounded selective Memory. This Interaction contract follows them; it does not establish a second teaching or admission owner.

Only this top-level cognitive loop is shared across subjects. Internal teaching shape remains subject-specific, and the path is allowed to cross surfaces.

## 2. Learner attention order

During first-round learning, attention priority is:

1. current cognitive question / Natural Unit position;
2. current source-grounded **Chat continuous explanation**;
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
Chat is primary; Chengfeng remains Source basis, not a parallel course.

Astro may keep the current Natural Unit, learning question, checkpoint, relation anchor, boundary, absorbed Suyi framework object, or source locator visible when useful, but it must **not** render Chengfeng as a competing continuous lecture reader.

A minimal source excerpt is allowed only when it serves a bounded repair/orientation decision. It must not expand by convenience into a second full lecture.

### At natural closure
Offer one short reconstruction/checkpoint cue only when useful; it may be skipped. Natural Unit identity is not a one-sitting requirement. Pausing/resuming within Chat teaching or Source calibration does not require a web checkpoint or prove completion. Do not create a large recall ceremony at closure. Scheduled proactive precision follows Learning Contract §6.1 and does not require waiting for a later mistake.

### Encoding and exact retrieval
After the relevant model is understood, Chat follows Learning Contract §3.2: identify what must be exact, organize it with meaningful cues/contrasts, recover the authoritative wording and explain the checking criteria. Explanation, aid and answer are distinct. Useful first-round exactness is not postponed merely because no question has been missed.

Use a small natural group rather than a wall of lists or mechanically isolated words. Start with a clear unaided prompt; optional help follows an attempt. A mnemonic is optional and must not replace the approved answer. First rehearsal is a teaching action, not an invented Website event or a mastery declaration.

The Website executes the selected Current catalog items under the existing Memory plan: prompt → learner retrieval → reveal answer/checking content → `FORGOT / FUZZY / STABLE` self-report → continue. Do not pre-reveal answer-bearing hints in a clean Recall or Xiao1000 task. Fields not consumed by the existing loader/renderer are not implemented merely because an author added them to a file.

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

The existing Website Source subflow supports Source calibration only in this learning model. Its old primary-learning copy has not been migrated by this rule change. Native identifiers and Runtime implementation remain unchanged; the conceptual Chat teaching stages must not be read as implemented Website states.

#### `ORIENT`
Dominant task: know what problem this Natural Unit solves and how it sits in the subject/chapter structure.

Primary Politics semantic objects:
- `Problem`;
- a small `Map` / `Chain` / `Compare` / `Boundary` matching the subject model;
- `Handoff / Locator` to Chengfeng.

#### `EXTERNAL_LEARN`
Native Website Source subflow: consult the owning Chengfeng images/text when calibration is needed. Continuous explanation belongs to Chat under the Learning Contract; `EXTERNAL_LEARN` is not a new Chat Runtime state.

Astro is companion-only. It may preserve:
- current `Problem`;
- compact framework / relation anchor;
- what to look for;
- source locator;
- return/checkpoint action.

It remains a companion to Chat teaching; original Source calibration remains available when necessary.

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

Admission and target scope inherit Learning Contract §6.1: proactive source-approved baseline, individual gaps and later output requirements are independent routes. Understanding-led does not mean error-only Memory. Chat owns memory encoding, useful first rehearsal, plan selection and subsequent interpretation; the Website owns planned retrieval and native evidence capture.

Use the same Content identity through teaching, compression, exact answer and repair. A conceptual failure reopens the smallest model relation; a wording/list/pairing failure receives focused encoding and retrieval; a transfer failure receives an application task. Correct performance stays cheap, without automatically deleting the approved baseline. Do not mistake “I recognize the revealed answer” for unaided retrieval or `STABLE` for machine-verified mastery.

Review should tell the learner what to do and why, not expose scheduler internals such as D1/D3/D7 labels.

## 8. Continue and Return / Handoff

Politics inherits the KianOS-wide Continue and Return/Handoff capabilities without creating a second Politics scheduler.

### Continue

The runtime may remember the learner's most recently opened Politics chapter / Natural Unit and, when useful, the last external-source locator in private browser/device state and offer a Continue entry from the Politics home.

This is personal session position, not shared Current and not a semantic owner.

Continue must not imply that the learner resumes by reading duplicated Chengfeng text in Astro. When Chat teaching is next, use the actual available Chat resume/coverage evidence; an external locator supports Source calibration only. Existing website position alone must not be relabeled as Chat completion or resume evidence.

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

`continuous source reader` is **not** an approved first-round Politics primitive for Chengfeng. A shared component may still exist for another domain or reference use, but Politics must not use it to create a second continuous course alongside Chat.

If a better explanation, relation, boundary, hierarchy, or stage story can live in Current content, update the content owner instead of hard-coding it in Astro.

## 10. Quality test

A Politics learner experience is good when:
- the learner knows what they are trying to understand or do now without scanning the whole page;
- Chat remains the single continuous teaching mainline with Chengfeng Source basis;
- original iPad/MarginNote images/text support necessary Source calibration;
- useful Suyi cognition has been absorbed/accounted for without creating a second Suyi course;
- Astro shows only useful orientation/framework/checkpoint/planned-retrieval/verification/repair/return structure;
- Chat can recover the first-lesson route, exact targets, encoding aids and checking criteria from the owning content without reconstructing a second course;
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
