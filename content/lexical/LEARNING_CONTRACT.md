# LexicalOS Learning Contract

## Goal

LexicalOS exists to build **fast, correct contextual lexical access**.

The learner already has broad repeated exposure to CET-4/CET-6, TOEFL, and postgraduate-exam vocabulary. The main problem is therefore not basic word-list coverage. The system should prioritize depth where it matters:

- familiar-new senses;
- high-value polysemy;
- word feel / mental compression;
- constructions and phrase skeletons;
- confusable boundaries;
- fast recognition and selection in real context.

Do not optimize for dictionary completion, sense-count completion, or total review-card count.

## Product principle

`Natural Owner semantics → Depth Scan → selective Repair → Challenge → Return Packet → next learning day → real transfer`

Shared Current owns durable lexical semantics and durable learning rules. Astro turns them into low-friction learner actions. Chat owns semantic and learning judgment and may update both content and interaction design from real learner feedback.

Private learner answers, progress, repair state, timing, and session history are not shared lexical semantic owners. They may live in local/private interaction state or learner packets, but must not become a parallel lexical truth.

## Natural semantic authority

Lexical learning must project from Current Natural Owners:

- Word Natural Owner owns word-local semantics;
- Relation Natural Owner owns genuine cross-word semantic relationships;
- generated tests, learner notes, and interaction state do not become semantic owners;
- Astro must not invent a sense, construction, phrase, or contrast merely because a learning template expects one.

If interaction exposes a semantic gap or error, repair the Natural Owner. If a generated question is bad, repair or discard the question rather than changing lexical truth to fit the question.

## Content completeness vs review selectivity

LexicalOS must keep **learning completeness** separate from **review admission**.

The durable rule is:

`complete learning object != permanent review burden`

For a learner-worthy word, the first-pass Depth object may be rich. It should preserve the full high-value semantic/use-space needed for real comprehension and production: Core / Word Feel, important senses, familiar-new senses, genuine polysemy, constructions, phrase skeletons, useful collocations/phraseology, material contrast boundaries, and learner-relevant form/register distinctions.

**Core is a compression layer, not the whole word. Expansion is a first-class semantic/use-space layer, not optional decoration.** Do not reduce cognitive load by deleting learner-worthy Expansion. Control load through hierarchy, scanability, selective Reveal structure, and evidence-driven Repair.

Review remains selective: only the smallest unstable lexical objects should enter active Repair / Challenge / Memory. A learner may therefore inspect a rich word once while only one missed familiar-new sense, one construction, or one contrast becomes future review debt.

Detailed content-asset quality and semantic-upgrade acceptance are governed by `content/lexical/CONTENT_ASSET_CONTRACT.md`.

## Main learner loop: Depth Scan

The default vocabulary action is **one rich word card, one fast deep scan**. Do not turn every sense, construction, or relation into a separate mandatory card.

### Recall side

Before Reveal, show a compact **Recall Map** that tells the learner how deeply to search memory without giving the answers.

Examples:

- `3V + (2+1)A`
- `2N + 1V`
- `by ~`
- `~ A from B`
- `from ~ to ~`

Rules:

- counts describe **learner-worthy active meanings**, not dictionary sense counts;
- `(2+1)A`, `(1+1)V`, etc. indicate that one high-value branch is especially easy to miss behind familiarity; the Recall side should not reveal what that branch is;
- phrase/construction skeletons may appear when the skeleton itself is worth active retrieval;
- do not list trivial or already-automatic preposition patterns merely for completeness;
- the purpose is to interrupt familiarity illusion: `this word looks familiar` must not automatically mean `all important uses are accessible`.

No typing is required on the Recall side. The learner retrieves mentally, then Reveals.

### Reveal side

Reveal is not a dictionary dump. It is a **high-value learner map**.

Default order:

1. Core / Word Feel — a compact mental model that helps compress the word;
2. high-value learner meanings matching the Recall Map;
3. important constructions / phrase skeletons attached to the relevant meaning where possible;
4. useful collocations / phraseology when they materially improve access or production;
5. necessary confusable or contrast boundary only when it materially improves recognition or selection;
6. learner-relevant form / register / usage notes when they change interpretation or use.

A genuinely rich familiar word may be deep. Do **not** impose an arbitrary small sense cap merely to keep every card visually identical. The constraint is learning value and scanability, not dictionary completeness.

Use short anchors only when the anchor materially improves later recognition. Do not force one example sentence per meaning.

Reference-only, historical, technical micro-senses, or low-value completeness material belongs in Explore/Search, not the main Depth Scan.

## The `+` repair action

Every high-value expansion that may need repair can expose a `+` action.

`+` means:

> **This specific lexical object is not yet fast, stable, or automatic enough.**

It does **not** mean only `I have never seen this before`.

The learner may press `+` when an item is:

- genuinely new;
- recognized only after Reveal;
- slow or fuzzy;
- understood passively but not self-retrievable;
- a familiar-new sense that was missed;
- a construction, phrase, or collocation that is not automatic;
- a confusable boundary that would still cause hesitation;
- a productive expression the learner wants available for writing/translation.

The main Depth Card should not require whole-word `UNKNOWN / FUZZY / KNOW / PASS` ratings. The important state is often local: Core may be fully known while one sense, construction, phrase, or relation needs repair.

A learner with no detected problem should be able to `Reveal → scan → Next` with no extra interaction.

## Repair targets, not permanent cards

A `+` or observed lexical failure creates a **repair target**, not a permanent fixed flashcard.

One lexical object may generate different Challenge surfaces over time without multiplying into many permanent cards.

Examples:

- familiar-new sense → contextual meaning / paraphrase discrimination;
- construction → slot completion / constrained selection;
- phrase → phrase completion or contextual interpretation;
- confusable relation → forced contrast;
- word feel → cross-context discrimination;
- productive need → selection / mini-translation / constrained production.

The system should preserve the target and evidence, not require one pre-authored question for every active meaning in the lexicon.

## Challenge generation

Challenge is a **test layer**, not a semantic layer and not a prebuilt one-question-per-sense bank.

Questions may be generated freely from the valid Current lexical object and its relations. The test layer may improve incrementally over time: useful questions and patterns may be retained, weak or ambiguous ones may be repaired or discarded, and new challenge forms may be added later.

### Challenge admission

Only a small subset of possible lexical objects should be tested proactively. Strong admission signals include:

- learner pressed `+`;
- Reading / Cloze / Translation / Writing exposed a real lexical failure or uncertainty;
- a prior Challenge was wrong, slow, or unstable;
- the same object has recurring evidence of weakness;
- a small, selective blind probe of a high-value hidden-risk branch.

Do not generate a test simply because a Word Owner contains a sense or because the corpus contains a lexical object.

### Blind probes

Blind probes exist specifically to catch familiarity illusion: the learner may believe a familiar word is fully known while a high-value branch is missing.

They must remain selective. A high-value unmarked branch may occasionally be tested; a correct result should normally disappear without creating review debt. A failure activates only that specific repair target.

## Protect unseen exam evidence

Lexical Challenges should **not** use unattempted true-exam, TPO, or other intentionally held-out unseen source sentences merely because they are available in English source assets.

Default Challenge material may be freely generated. Real unseen Reading/Cloze/Translation material is more valuable as later transfer evidence and should remain clean until its first real attempt.

Once material has already been legitimately exposed, it may be reused when useful, but generated Challenge remains the normal default.

## Challenge interaction

Challenge interaction should be fast enough to support many high-value judgments without turning lexical repair into UI work.

For selection tasks with up to four choices, place choices spatially and use the four arrow keys as direct answers:

- `← / ↑ / ↓ / →` selects the option in that position and submits immediately;
- do not require a second Enter confirmation for ordinary low-risk Challenge choices;
- two-choice tasks naturally use left/right;
- three- and four-choice tasks use the same spatial muscle memory;
- `Space` may serve Reveal / Next according to state.

After a correct answer, feedback should normally be minimal and movement fast.

After a wrong answer, show only the smallest sufficient repair, then reconstruct with a fresh or altered context when needed. Do not turn every wrong choice into a full lexical lecture.

Keyboard and mouse actions should represent the same learner decision; keyboard is the preferred high-speed path.

## Daily Challenge scheduling

Daily Challenge is **compiled from current evidence**, not treated as an ever-growing `due cards` queue.

### Next-day carry rules

- A learner-added `+` should normally receive its first real Challenge on the **next learning day**, not immediately after Reveal. Immediate same-card retesting is weak evidence and should not be the default.
- `WRONG` / `Again` during Challenge receives the smallest sufficient repair plus at most one same-session reconstruction when useful, and the target must return in the next learning day's compiled Challenge.
- Slow / hesitant / fuzzy performance should normally receive a targeted next-day probe without forcing a large same-session review chain.
- A defective or ambiguous generated question does not create learner repair debt.
- Repeated failure remains a next-day obligation, but the repair method must change rather than repeating near-identical questions.

### Daily priority order

When compiling the next Challenge, prioritize:

1. previous-day `WRONG` / `Again` and repeated failures;
2. previous-day explicit `+` targets;
3. previous-day slow / fuzzy targets;
4. older unresolved repair targets only when they still have meaningful evidence value;
5. a small minority of blind probes, only after real repair obligations are covered.

Blind probes must never displace explicit repair evidence merely to satisfy a sampling quota.

If repair load is unusually high, reduce or remove blind probes and reduce new Depth volume before creating a large automatic review backlog.

### Fading

- A clean next-day Challenge after a prior `+` or failure may move the target out of immediate obligation; it does not need another next-day test merely to satisfy a fixed interval.
- Later fresh Challenge success or successful real-context use is stronger evidence and may move the target to dormant.
- Strong later unseen-context success may cancel weaker planned artificial review when there is no contradictory recent evidence.
- A new real failure immediately reactivates the smallest affected target.
- Missed calendar days must not manufacture an `overdue` pile. The next session is recompiled from unresolved evidence rather than from elapsed-card debt.

The exact numerical spacing and sampling knobs remain tunable runtime parameters. The durable rule is **evidence-driven carry, bounded Challenge, fast fading, and no mechanical review debt**.

## Evidence strength

Evidence is not equal.

A useful default ordering is:

`isolated word recall`
`< targeted sentence recall`
`< construction / contrast discrimination`
`< successful Reading / Cloze / Translation use`
`< later unseen-context success`

Rules:

- correct once is not mastery;
- repeated button presses are weaker than later successful transfer;
- real-context success may reduce or eliminate planned artificial review;
- a new real-context failure may reactivate a previously dormant repair target immediately.

## Memory admission and fading

The 7,946 Main Words must **not** become 7,946 permanent review obligations, and active senses must not become one-card-per-sense debt.

Enter active repair/review when there is meaningful evidence such as:

- `+`;
- wrong / uncertain / slow real use;
- familiar-new sense failure;
- high-value construction instability;
- recurring confusable failure;
- high-value production need.

Default to no persistent review for:

- stable simple L0/Core knowledge;
- later real-context natural success;
- low-value specialized micro-senses;
- historical/reference-only content;
- completeness-only evidence;
- already automatic basics.

Stable knowledge should fade to dormant rather than demand ritual re-proving. Future counterevidence may reactivate the smallest affected lexical object.

## Return Packet is a mandatory next-day input

The learner's daily Return Packet is **not merely a history log**. It is a mandatory input to the next learning day's generation.

`Day N learning / Challenge → Return Packet → Chat judgment → Day N+1 content`

When Chat receives a Return Packet, meaningful problems must be incorporated into the next day's learner packet or repair plan. Do not ignore them in favor of a pre-existing mechanical schedule.

At minimum, distinguish these observable outcomes:

- learner-added `+` → enter Repair;
- `WRONG` / `Again` / clearly unknown → high-priority repair and later re-test in a changed context;
- slow / hesitant / fuzzy → lighter reinforcement or targeted probe;
- stable repeated success → lower priority / fade;
- ambiguous or defective generated question → repair/discard the question and do not count it as learner failure;
- explanation or semantic content appears wrong → inspect and, if necessary, repair the Natural Owner;
- repeated failure of the same target → change the repair method, not merely repeat near-identical questions.

### Minimum packet evidence

The runtime should capture the minimum evidence Chat needs without asking the learner to maintain backend taxonomy manually.

For a meaningful lexical event, preserve when available:

- session / study-day identity;
- `word_id` and ordinal;
- target kind such as Core, sense, construction, collocation/phrase, relation/confusable, word feel, or productive need;
- stable target identity such as `sense_id`, `collocation_id`, `relation_id`, or another Current owner-local stable locator when available;
- source of evidence: Depth `+`, Challenge, Reading, Cloze, Translation, Writing, or blind probe;
- observable outcome: added, correct, wrong, slow/fuzzy, Again, question issue, or semantic issue;
- the generated question/answer trace only when needed to diagnose a wrong judgment or defective question.

Do not copy whole lexical definitions into the packet when a stable Natural Owner identity is sufficient. The packet points back to lexical truth; it does not duplicate it.

### Feedback outranks mechanical scheduling

Fresh evidence has priority over a stale scheduler.

Examples:

- a target nominally scheduled much later but failed today should return sooner;
- a target nominally due tomorrow but was just handled successfully in strong real context may be delayed or removed;
- repeated failure should trigger stronger reconstruction or boundary repair rather than simple repetition.

Every meaningful problem in the Return Packet must affect the next-day compilation. Explicit `+`, `WRONG`, `Again`, and repeated-failure evidence must not disappear silently. The next-day response may change form — Challenge, focused repair, boundary reconstruction, or semantic repair — but the evidence must be consumed.

## Module feedback into LexicalOS

English modules should send precise lexical failures back to the canonical lexical object instead of creating separate module-specific vocabulary systems.

Typical routing:

- Reading lexical failure → exact sense / phrase / construction → smallest lexical repair → return to Reading;
- Cloze candidate-contrast failure → lexical/relation boundary → repair → return to slot;
- Translation proposition-recovery failure → familiar-new sense / construction → repair → retranslate;
- Writing expression need → productive lexical object → repair / later Challenge.

The module keeps its task evidence; LexicalOS keeps lexical semantics and repair targeting.

## Explore / Search

Depth Study and full lexical exploration are different goals.

- **Study / Depth**: fast retrieval, high-value expansion, selective repair;
- **Explore / Search**: complete inspection of Current lexical knowledge, including richer reference/evidence material when useful.

Do not force Explore completeness into the Study card.

## Interaction quality bar

Any learner-facing element must earn its place by doing at least one of the following:

1. deepen active retrieval without leaking the answer;
2. expose a high-value hidden lexical gap;
3. reduce friction in selecting a repair target;
4. create a cleaner Challenge judgment;
5. preserve evidence that changes the next learning action.

If it does none of these, remove it.

The intended direction is:

**deep content, light interaction, selective repair, strong transfer evidence, and no review debt for knowledge that is already automatic.**
