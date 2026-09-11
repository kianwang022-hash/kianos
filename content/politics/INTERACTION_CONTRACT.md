# Politics Interaction Contract

Status: CURRENT

This file defines how mature Politics Current content should interact with the learner. It does not own political knowledge. Subject-specific learning files remain the teaching-semantic owners.

## 1. Shared learner loop

The shared first-round loop is:

`Orientation → Chengfeng continuous learning → short closure → Xiao1000 verification → smallest sufficient repair when needed → continue`

Later phases may add Unit/Block compression, selective Memory, and Mock transfer.

Only this top-level loop is shared across subjects. Internal teaching shape remains subject-specific.

## 2. Learner attention order

During first-round learning, attention priority is:

1. current cognitive question;
2. current Chengfeng content;
3. only the minimum orientation/boundary needed to understand it;
4. Xiao1000 verification after natural closure;
5. repair only when evidence shows a failure.

Question counts, memory counts, scheduler labels, source metadata, and engineering taxonomy must not dominate the learning surface.

## 3. Progressive disclosure

Default display should be quiet.

### Before a chapter / unit
Show only:
- where this content sits;
- why it appears now;
- the core question it solves.

### During Chengfeng learning
Keep Chengfeng continuous and visually primary. Teaching projection may add small anchors, relation maps, stage markers, or boundaries, but must not become a second lecture.

### At natural closure
Use one short reconstruction cue. Do not create a large recall workflow unless later evidence justifies it.

### Verification
Show the currently relevant Xiao1000 questions only after the owning content is learned.

### Stable correct
`✓ → continue`

Do not force a full explanation.

### Wrong / uncertain
Open only enough information to resolve the first meaningful failure.

Repair order:
1. fixed wording / hat / identity confusion → show decisive distinction;
2. concept boundary confusion → show the smallest relevant boundary;
3. relation / stage / theory-position confusion → reopen the relevant teaching bridge;
4. whole Natural Unit model broken → return to the owning Chengfeng segment;
5. repeated cross-unit confusion → use compression/review.

After repair, return the learner to the interrupted path.

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

If a Suyi mind-map structure materially improves orientation, absorb the useful relation into the approved learning projection. Do not expose a parallel Suyi course merely because the source exists.

## 6. Xiao1000 behavior

Xiao1000 validates learning; it does not organize learning.

- release by owning Natural Unit / natural subsection;
- preserve original question/options/answer;
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

The runtime may remember the learner's most recently opened Politics chapter in private browser/device state and offer a Continue entry from the Politics home.

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

The default daily Politics handoff therefore carries only meaningful Wrong/Uncertain evidence plus last location. It is private learner evidence and must not be committed to shared Current.

`kianos.politics.return_packet.v1` is a runtime handoff shape, not a political-knowledge owner. Chat consumes it to decide the smallest next repair, compression, or content/runtime correction.

Repeated failure may justify stronger reconstruction or review. A clean stable answer should not create ritual review debt merely because the question exists.

## 9. Astro implementation rule

Astro should provide reusable interaction primitives, not political semantics.

Useful primitives include:
- orientation panel;
- continuous source reader;
- subject-specific map/strip;
- short closure/reveal;
- question attempt;
- uncertain marker;
- minimal repair drawer;
- exact source jump;
- next-unit continuation;
- lane Continue entry;
- compact Wrong/Uncertain handoff.

If a better explanation, relation, boundary, hierarchy, or stage story can live in Current content, update the content owner instead of hard-coding it in Astro.

## 10. Quality test

A Politics learner screen is good when:
- the learner knows what they are trying to understand now;
- Chengfeng remains the obvious mainline;
- only useful supporting structure is visible;
- a correct answer costs almost no extra time;
- a failure sends the learner back to the smallest useful source;
- meaningful Wrong/Uncertain evidence can return to Chat without manual reconstruction;
- the page feels simpler as the backend becomes richer.
