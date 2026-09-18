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

### 3.1A Later-stage consolidation execution model

Later-stage Politics does **not** give the web a fixed review strategy.

The interaction boundary is:

```text
Chat
→ chooses this session's review actions from Current K + learner evidence + phase/time budget
→ sends an explicit plan

Web
→ executes that plan faithfully
→ captures learner evidence
→ returns evidence / resume state

Chat
→ decides what to do next
```

The web must not infer:

- which chapter content deserves recall;
- which K boundary is important now;
- whether a candidate should become Precision;
- whether a whole chapter or only one item should be reviewed;
- whether a retest is worth the time;
- whether a learner should close the chapter.

Those are Chat decisions.

### Chat planning input: evidence facts, not Web recommendations

Before Chat composes a consolidation plan, it must be able to receive the bounded private learner evidence that materially affects the decision.

Reuse the existing Politics private evidence / `kianos.politics.return_packet.v1` handoff semantics rather than creating a Web scheduler.

For consolidation entry, the handoff/evidence snapshot may include:

- requested subject / chapter / Current anchor identity;
- unresolved or still-meaningful historical `WRONG` / `UNCERTAIN` question ids and owning content refs;
- prior exact/Precision evidence when it exists;
- last meaningful learner position / interrupted action when relevant;
- recent session outcomes needed to avoid repeating already-stable work.

The Web may filter mechanically by explicit scope / state such as 'unresolved W/U for this anchor'. It must not rank, score, recommend, or decide what Chat should review.

The planning direction is therefore:

```text
private learner evidence facts + Current K + phase/time context
→ Chat strategy
→ consolidation_plan.v1
```

The exact query/export transport is Runtime/Evidence implementation work. The Learning/Interaction requirement is that Chat must not be forced to guess learner state or reconstruct it manually from UI history.

### Minimal plan semantics

The durable semantic interface is `kianos.politics.consolidation_plan.v1`.

This name defines the **minimum meaning** the later Runtime must preserve. It does not force one transport technology, file location, API endpoint, or UI component.

A plan contains:

```text
scope
- subject_id
- phase = CONSOLIDATION
- anchor_ref = explicit Current chapter / subject-level review owner / cross-chapter Knowledge owner
- chapter_id = optional context when the session is chapter-anchored

actions[]
- action_id
- type
- explicit target refs / question ids as needed
- learner-facing prompt when needed
- explicit reveal / source refs when needed
- explicit target-guard evidence refs whenever the referenced target requires admission / freshness / phase proof
```

Allowed action types:

- `RECONSTRUCT`
- `TARGETED_RECALL`
- `PRECISION`
- `QUESTION_RETEST`
- `SOURCE_REPAIR`
- `CHAT_REPAIR_RETURN`
- `CLOSE`

#### Target addressing is explicit, never inferred

Chat must address learner content explicitly.

Preferred addressing:

1. a stable canonical object id when the Current object owns one;
2. otherwise, the exact Current owner path + an exact JSON Pointer / equivalent deterministic subpath selected by Chat.

Examples:

```text
stable id:
POL27-MEM-MARX-C02-K03-M01

owner + subpath:
content/politics/learning/ethics-law/ch06.json
#/later_stage_knowledge/compression_model/decisive_boundaries/0
```

The runtime resolves the supplied address literally. It must not search neighboring fields, infer a 'similar' object, or choose a sibling item because the requested object lacks a dedicated id.

A future Content/K repair may add better stable ids, but the Runtime must not require that cleanup before it can faithfully execute an explicit Chat plan.

#### Target guards follow the target, not the action label

Every explicit target ref keeps its canonical eligibility / freshness / phase boundary regardless of which action type references it.

Hard rule:

```text
target is candidate-only / freshness-gated / phase-gated
→ that guard still applies inside RECONSTRUCT / TARGETED_RECALL / PRECISION / REPAIR / any other action
→ changing the action label cannot bypass the target's own gate
```

Examples:

- a candidate-only Memory object cannot be surfaced through `TARGETED_RECALL` merely to avoid a `PRECISION` guard;
- Xi high-delta exact wording cannot be surfaced in Consolidation until its current-year source gate passes;
- current legal/normative exactness cannot be surfaced until the applicable legal/source recheck passes;
- an `ANALYSIS_OUTPUT`-only hook cannot be used as ordinary Consolidation recall merely because Chat referenced it.

The Web is not deciding whether the target is worth learning. It is only enforcing the canonical target boundary already owned upstream.

If the runtime cannot verify a referenced target's eligibility / phase / freshness boundary, it must fail closed and return a bounded blocker to Chat rather than infer permission.

Guard precedence is specific-to-general:

```text
target-local admission_blocker / freshness_gate / semantic role
>
target-owner local policy
>
parent phase_scope
>
generic Politics Memory/Review policy
```

Therefore:

- an `analysis_output_hooks` target remains Analysis-Output-only even when its parent `later_stage_knowledge.phase_scope` also contains `CONSOLIDATION`;
- an explicit target `admission_blocker` or freshness gate must be resolved before exposure, even when a generic admission policy lists W/U as a possible reason to create future debt;
- a parent object saying a phase is supported is permission for that owner family to participate in the phase, not permission to surface every child object in that phase.

This precedence is target-boundary validation, not Web review strategy.

#### Scope is not chapter-only

The scope model must support cross-chapter consolidation when Current K owns a genuine cross-chapter structure.

Examples include History meeting / land-policy / person-document / ideological-liberation lines.

Therefore:

- `anchor_ref` is required and identifies the Current owner being reviewed;
- `chapter_id` is optional context, not the universal review unit;
- Chat may compose a plan around a chapter, a subject-level horizontal asset, or another accepted Current review owner;
- Web must not force a cross-chapter plan back into one chapter merely because the route/component is chapter-oriented.

This keeps the interface generic without making Web decide review granularity.

#### Action requirements

`RECONSTRUCT`
- Chat supplies the learner-facing reconstruction prompt;
- the prompt is an instruction/question, not a hidden answer-bearing substitute for gated Current content;
- Chat supplies the explicit Current K refs that may be used for reveal/check;
- any answer-bearing reveal/check payload must resolve through those refs and inherit their target guards;
- Web must not expand the prompt into additional chapter topics.

`TARGETED_RECALL`
- Chat supplies the exact Current object/group refs to retrieve now;
- if no stable id exists, Chat supplies owner path + exact deterministic subpath;
- Web must not append sibling objects because they are nearby or share a field.

`PRECISION`
- Chat supplies the exact source-grounded target ref;
- Chat supplies the activation basis, for example real W/U evidence or active phase requirement;
- when Current K marks the domain as high-delta/current-law sensitive, Chat also supplies the applicable current-source/freshness evidence ref;
- Web validates the supplied refs/state shape and fails closed when required guard data is absent;
- Web does not decide whether a candidate deserves activation.

`QUESTION_RETEST`
- Chat supplies explicit stable Xiao1000 `question_id` values;
- Web does not select additional questions or expand to the chapter bank.

`SOURCE_REPAIR`
- Chat supplies the exact owning source locator / source ref;
- Web routes there without synthesizing a replacement lecture.

`CHAT_REPAIR_RETURN`
- Web returns the bounded learner evidence/object identity needed for Chat repair;
- after Chat decides the repair, Web resumes from the explicit returned plan/action.

`CLOSE`
- Chat may explicitly close the current consolidation session;
- Web may always let the learner exit the UI, but it must not infer semantic chapter closure from counters, elapsed time, or content availability.

#### No strategy fields in Web

The plan/runtime interface must not create Web-owned strategy fields such as:

- importance score;
- review priority;
- due score;
- recommended next K object;
- automatic chapter completeness;
- inferred Precision need;
- inferred question selection;
- inferred close readiness.

If Chat needs those judgments, they remain Chat/private-strategy logic and arrive only as already-decided actions.

The runtime may validate object identity, availability, source guard presence, state safety and evidence persistence. It may **not** replace missing Chat decisions with semantic inference from raw JSON.

### Return evidence semantics

The durable return meaning is `kianos.politics.consolidation_return.v1`.

It is **private learner evidence**, not shared Current truth.

The return contains only enough evidence for Chat to make the next decision:

```text
scope
- subject_id
- phase = CONSOLIDATION
- anchor_ref
- chapter_id = optional context

events[]
- action_id
- action_type
- observable outcome
- blocked target / guard reason when execution fails closed
- learner response / selection when needed
- W/U marker when produced
- stable content/question/source identity

resume
- interrupted action / next explicit action when one exists
- source locator when a cross-surface repair is active
```

The return must not include a Web-authored recommendation such as "review this next" or "chapter mastered".

Chat consumes the evidence and may send a new `consolidation_plan.v1`.

### Semantic grading boundary

The Web does not semantically grade open-ended Politics reconstruction / recall.

For open recall, Web may:

- capture the learner response;
- reveal / juxtapose the exact Chat-selected Current refs;
- capture learner `WRONG` / `UNCERTAIN` / self-check evidence when the interaction calls for it;
- return the response + refs to Chat for semantic judgment.

Web may perform deterministic checking only when the answer rule is already explicit and mechanical, for example:

- Xiao1000 official-answer comparison;
- an exact Precision target with an already-approved exact answer payload / accepted normalization rule.

Web must not infer missing concepts, decide which part of a free response is semantically sufficient, or generate the next repair target from the learner's prose. Those judgments belong to Chat.

### Runtime capability, not strategy

The web should provide reusable functionality for:

- clean answer / recall attempt;
- reveal or compare against explicitly selected content;
- targeted recall of an explicitly selected object/group;
- exact/Precision recall for an explicitly activated item;
- Xiao1000 attempt/retest by explicit question id;
- Wrong / Uncertain marking;
- source locator / repair handoff;
- compact evidence summary;
- Return to Chat;
- resume / close.

No capability becomes mandatory merely because it exists.

### Subject shape is carried by content + Chat plan

Shared runtime controls may be common, but the plan payload must preserve the selected subject cognition:

- Marxism can carry a relation/mechanism prompt;
- History can carry a causal-movie prompt;
- Mao can carry a problem→theory→identity prompt;
- Xi can carry hierarchy/role prompts;
- Ethics/Law can carry boundary/situation prompts.

The renderer executes those semantics; it does not invent a common Politics review template.

### Learner-facing simplicity

The learner should experience only the current action, for example:

```text
想一遍这一章
```

or:

```text
只补这个边界
```

or:

```text
重做这 2 道旧错题
```

The learner should not see the backend plan schema, K candidate inventory, scheduler logic or why Chat did not select other available content.
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

During later-stage consolidation, the same private evidence channel may also be queried/exported as a bounded **fact snapshot** before Chat plans the next session. This is not a recommendation surface.

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

For later-stage consolidation, `kianos.politics.consolidation_return.v1` is the **session-level execution return** defined in §3.1A. It does not replace the compact daily handoff.

Relationship:

```text
consolidation_return.v1
= what happened in the current Chat-selected session

return_packet.v1
= compact cross-session / Chat handoff extracted from meaningful evidence
```

A runtime may derive the compact handoff from session events, but must not invent additional review recommendations while doing so.

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
