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

`Orientation → Chengfeng continuous learning on original iPad/MarginNote surface → short closure/checkpoint → Xiao1000 verification in Astro/KianOS web → smallest sufficient repair when needed → continue`

Later phases may add Unit/Block compression, selective Memory, and Mock transfer.

Only this top-level cognitive loop is shared across subjects. Internal teaching shape remains subject-specific, and the path is allowed to cross surfaces.

## 2. Learner attention order

During first-round learning, attention priority is:

1. current cognitive question / Natural Unit position;
2. current Chengfeng content **on its original iPad/MarginNote lecture surface**;
3. only the minimum Astro/Chat orientation, framework, boundary, checkpoint, or locator needed to understand/continue it;
4. Xiao1000 verification in Astro/KianOS web after natural closure;
5. repair only when evidence shows a failure.

Question counts, memory counts, scheduler labels, source metadata, engineering taxonomy, and a duplicate web lecture must not dominate the learning path.

## 3. Progressive disclosure

Default Astro display should be quiet and companion-like when another surface owns the active learning action.

### Before a chapter / unit
Show only:
- where this content sits;
- why it appears now;
- the core question it solves;
- the smallest useful absorbed framework/relation scaffold;
- where to continue in the original Chengfeng lecture when a locator is needed.

### During Chengfeng learning
The original iPad/MarginNote Chengfeng lecture is primary.

Astro may keep the current Natural Unit, learning question, checkpoint, relation anchor, boundary, absorbed Suyi framework object, or source locator visible when useful, but it must **not** render Chengfeng as a competing continuous lecture reader.

A minimal source excerpt is allowed only when it serves a bounded repair/orientation decision. It must not expand by convenience into a second full lecture.

### At natural closure
Use one short reconstruction/checkpoint cue. Do not create a large recall workflow unless later evidence justifies it.

### Verification
Open the currently relevant Xiao1000 questions in the Astro/KianOS web question surface only after the owning content is learned.

The web owns the attempt interaction and evidence capture. Original question/options/official answer remain source-owned, and Xiao1000 still does not determine first-learning order.

### Stable correct
`✓ → continue`

Do not force a full explanation.

### Wrong / uncertain
Open only enough information to resolve the first meaningful failure.

Repair order:
1. fixed wording / hat / identity confusion → show decisive `Exact` / `Boundary` distinction;
2. concept boundary confusion → show the smallest relevant `Compare` / `Boundary`;
3. relation / stage / theory-position confusion → reopen the relevant `Chain` / `Map` / teaching bridge;
4. whole Natural Unit model broken → return to the owning Chengfeng segment on the original source surface;
5. repeated cross-unit confusion → use compression/review.

After repair, return the learner to the interrupted path and surface.

### 3.1 Politics cognitive state model

Politics uses the shared presentation contract through the following first-round state model:

```text
ORIENT
→ EXTERNAL_LEARN
→ RETURN / CLOSE
→ VERIFY
→ stable correct → CONTINUE
→ wrong / uncertain → REPAIR → VERIFY or CONTINUE
```

Later phases may add `REVIEW`, `PRECISION`, and `MOCK / TRANSFER` states when the applicable contract makes them learner-relevant.

These states are not backend status labels for display everywhere. At runtime, one state owns the dominant learner task.

### 3.1A Later-stage consolidation state model

Later-stage Politics uses a chapter-fast interaction model rather than a per-node drill loop:

```text
RECONSTRUCT
→ CHECK
→ [TARGETED_CONTENT_RECALL only for failed groups]
→ [PRECISION when active]
→ [EVIDENCE_REVIEW when prior W/U exists]
→ [RETEST when useful]
→ wrong / uncertain → REPAIR → RETEST or CLOSE
→ CLOSE
```

Square-bracket states are conditional. They appear only when real chapter/phase evidence justifies them.

Interaction rules:

- `RECONSTRUCT` is one chapter-level or large-structure **one-shot attempt**. It should recover the framework plus as much important attached content as possible.
- `CHECK` compares that one-shot attempt against the L-owned grouped recall rubric. It is not a second active-recall pass.
- `TARGETED_CONTENT_RECALL` opens only groups that were materially missing, confused, or too weak during the one-shot attempt.
- a group recalled correctly during `RECONSTRUCT` must not be asked again merely because a group object exists.
- `PRECISION` shows only source-legitimate active/admitted exactness. Candidate-only inventory remains dormant.
- high-delta Xi wording and current legal/normative exactness require their current-source freshness gate before exact recall can activate.
- `EVIDENCE_REVIEW` prioritizes real historical Wrong / meaningful Uncertain evidence over generic extra review.
- `RETEST` is selective verification; a stable chapter does not owe a full Xiao1000 rerun.
- `REPAIR` opens only the smallest broken relation, boundary, source segment or exact item.
- `CLOSE` exits cheaply and records phase-scoped consolidation evidence without implying mastery.

The UI must not expose this model as a long wizard, mandatory counters, or state taxonomy. It should feel like:

```text
一次把这一章想回来
→ 看真正漏了什么
→ 只补漏掉的大块 / 少量精确点
→ 做真正薄弱的题
→ 下一章
```

Backend state may be richer than the learner-facing workflow.

#### `ORIENT`
Dominant task: know what problem this Natural Unit solves and how it sits in the subject/chapter structure.

Primary Politics semantic objects:
- `Problem`;
- a small `Map` / `Chain` / `Compare` / `Boundary` when it materially reduces later source-reading load;
- `Handoff / Locator` to Chengfeng.

#### `EXTERNAL_LEARN`
Dominant task: learn the owning Chengfeng Natural Unit on iPad/MarginNote.

Astro is companion-only. It may preserve:
- current `Problem`;
- compact framework / relation anchor;
- what to look for;
- source locator;
- return/checkpoint action.

It must not compete with the iPad lecture.

#### `RETURN / CLOSE`
Dominant task: re-establish the Natural Unit model after leaving the original lecture surface.

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

During a clean Xiao1000 attempt the Inspector must remain quiet enough to prevent answer leakage. After Wrong/Uncertain, the same space may become a bounded Repair surface.

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

Prefer hierarchy maps, role labels, and confusable-boundary comparisons. Use Xiao1000 evidence to decide which fixed formulations need later precision.

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
- wrong/uncertain should repair to Chengfeng rather than open a second explanation textbook;
- stable correct should pass fast;
- repeated questions are allowed later with a different cognitive task.

## 7. Memory and review

First-round Politics should be understanding-led, not memory-count-led.

Selective precision becomes prominent only when evidence shows that a fixed formulation, list, identity, boundary, timeline, or legal wording needs exact retention.

Review should tell the learner what to do and why, not expose scheduler internals such as D1/D3/D7 labels.

## 8. Continue and Return / Handoff

Politics inherits the KianOS-wide Continue and Return/Handoff capabilities without creating a second Politics scheduler.

### Continue

The runtime may remember the learner's most recently opened Politics chapter / Natural Unit and, when useful, the last external-source locator in private browser/device state and offer a Continue entry from the Politics home.

This is personal session position, not shared Current and not a semantic owner.

Continue must not imply that the learner resumes by reading duplicated Chengfeng text in Astro. When Chengfeng study is next, Continue should route/point the learner back to the original iPad/MarginNote source position and keep the Astro companion state aligned.

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

The default daily Politics handoff therefore carries only meaningful Wrong/Uncertain evidence plus last location. It is private learner evidence and must not be committed to shared Current.

`kianos.politics.return_packet.v1` is a runtime handoff shape, not a political-knowledge owner. Chat consumes it to decide the smallest next repair, compression, or content/runtime correction.

Repeated failure may justify stronger reconstruction or review. A clean stable answer should not create ritual review debt merely because the question exists.

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

`continuous source reader` is **not** an approved first-round Politics primitive for Chengfeng. A shared component may still exist for another domain or reference use, but Politics must not use it to take over Chengfeng continuous study.

If a better explanation, relation, boundary, hierarchy, or stage story can live in Current content, update the content owner instead of hard-coding it in Astro.

## 10. Quality test

A Politics learner experience is good when:
- the learner knows what they are trying to understand or do now without scanning the whole page;
- Chengfeng remains the obvious single mainline **without requiring a duplicate Astro lecture**;
- the original iPad/MarginNote source surface remains primary during continuous Chengfeng study;
- useful Suyi cognition has been absorbed/accounted for without creating a second Suyi course;
- Astro shows only useful orientation/framework/checkpoint/verification/repair/return structure;
- the Mac landscape workspace uses space to make relations/discrimination clearer rather than simply adding widgets;
- the central Cognitive Stage has one dominant task and the Inspector remains secondary/contextual;
- Xiao1000 questions enter Astro only after the owning Chengfeng content is learned;
- clean attempts are not contaminated by framework/answer leakage;
- switching between original source, Astro, and Chat is clear and low-friction;
- a correct answer costs almost no extra time;
- a failure sends the learner back to the smallest useful semantic object/source/action;
- meaningful Wrong/Uncertain evidence can return to Chat without manual reconstruction;
- the learner never has to wonder which of two competing surfaces is the real place to study the same content;
- the KianOS surface feels simpler as the backend becomes richer.
