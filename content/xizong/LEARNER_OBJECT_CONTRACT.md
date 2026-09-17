# Xizong Learner Object Contract

Status: CURRENT  
Scope: learner-facing content resolution / Projection consumption  
Authority: `content/xizong/LEARNING_CONTRACT.md` remains the owner of learning semantics; this file owns only how Current content is resolved into one learner-facing object.

---

## 1｜Why this object exists

Xizong currently has several legitimate content sources:

- canonical System / Block / KP owners;
- `主提示`, Source locator and Outline locator;
- reviewed Precision / Visual cues;
- generic Extension assets;
- reviewed Connection / Pathway relations;
- compiled System / Block Cognitive Projection.

Those sources must not become independent DOM owners.

The learner-facing runtime therefore resolves them once into a **single read-only learner object** before rendering. Rendering may choose a layout, but it must not rediscover semantic ownership by querying DOM shape, counting enhancer components, or reinterpreting Current fields.

This object is a Projection/runtime composition. It is **not** a new medical truth owner and must never copy edited medical Core back into `content/xizong/knowledge/**`.

---

## 2｜Authority order

Resolution follows this order:

```text
canonical medical / learner owner
→ Current System-specific Learning owner
→ reviewed Precision / Visual / Extension / Connection enrichment
→ compiled Cognitive Projection when available
→ learner-object resolver
→ UI renderer
```

If two inputs disagree, the resolver must fail closed or preserve the higher-authority owner. It must not silently choose the field that is easiest to render.

`主提示` remains instructional / retrieval scaffolding. It is not medical Core.

---

## 3｜What each learner level consumes

| Surface | Must consume | May consume | Must not become |
| --- | --- | --- | --- |
| Guide | bounded first-learning explanation, System/Block route, intuitive failure warnings | reviewed explanatory provenance | second Lecture, recurring gate, medical Core owner |
| System Framework | System mother model, main chain, failure structure, judgment axes, Block route | compiled System Projection | prose worksheet or duplicated KP corpus |
| Block Framework | Block causal model, local route, boundaries, formulas/comparisons | compiled Block Projection, block-safe Extension | permanent content column or second Lecture |
| Logic Group | LG identity, short goal, closure, ordered KP membership | LG Visual, Connection, Precision, Extension | independent large page or Source-contact boundary by itself |
| KP Learn | canonical Prompt + full Core + Source + Outline | current-owner Precision, Visual, Extension, Connection / boundary support | answer-protected Recall card, separate enhancer stack, replacement Lecture |
| KP Recall | same compact Prompt on a clean front; Core after Reveal | only stage-safe post-Reveal Precision / Visual / Extension / Connection | pre-Reveal answer leak |
| LG Closure | one local closure target plus useful post-learn exactness/forward connection | group Precision / post-Reveal Extension | second review session |
| Block Closure | Block Recall result + explicit Block Complete gate | release descriptor for Memory integration | automatic immediate review debt |

The table is a consumption contract, not a pixel/layout contract.

---

## 4｜`KpLearnerObject`

Runtime schema: `kianos.xizong.learner_object.v1`.

Every canonical KP resolves to exactly one object:

```text
identity
  system_id / block_id / logic_group_id / kp_id / display_id / title

prompt
  canonical
  (private personal override is Runtime learner state, not stored here)

core
  canonical KP answer-bearing body

source
  exact Lecture locator when present

outline
  exact Outline locator when present

precision[]
  reviewed exact-memory items owned by this KP

visual[]
  reviewed Visual cues owned by this KP, with reviewed source-visual bundles when available

extension[]
  reviewed generic Extension assets owned by this KP

connection[]
  reviewed relations explicitly anchored to this KP when such relations exist

learn_steps[]
  phase = core | detail | precision | extension | connection | visual
  available = whether the Current object actually has that phase
  refs = semantic refs inside this same learner object

recall
  front = identity + prompt only
  post_reveal_refs = answer-bearing fields that may return after Reveal
```

The resolver must not manufacture an unavailable phase merely to make all KPs visually symmetrical.

### Core normalization

The existing Markdown loader historically names the canonical KP body `detailMarkdown`. That historical field name does not downgrade the content. In the learner object it resolves to **Core**, because the accepted current KP body is the complete canonical answer-bearing knowledge package used by KP Recall.

Future explicitly reviewed supporting detail may populate the `detail` phase separately. Until then, `detail.available=false` is valid.

---

## 5｜Group and Block composition

A Block learner object contains:

- Block identity + canonical Framework/attention fields;
- optional compiled `cognitive_projection`;
- block-owned Extension assets;
- ordered Logic Group objects;
- ordered KP learner objects.

Each Logic Group object contains:

- identity / goal / closure / ordered KP ids;
- optional reviewed `cognitiveRoute` copied from the System-specific Learning owner when present;
- group-owned Precision / Visual / Extension;
- `connection.incoming[]` and `connection.outgoing[]` derived only from reviewed Pathway authority.

`cognitiveRoute` is a read-only learner projection of Learning structure:

```text
shape
organizingQuestion
nodes[] = id + learner-facing label + canonical kpIds[]
edges[] = from + to + reviewed relation kind/label
```

Hard boundary:

- the learner-object resolver may validate and normalize the route, but must not invent it;
- KP order alone never becomes an edge;
- absent route remains absent;
- route nodes may group multiple KPs, but when a route exists every owning Logic Group KP must resolve exactly once;
- route is answer-bearing orientation by default and must not leak onto KP Recall Front / Block Recall Front merely because it exists in the learner object.

A renderer should therefore ask the learner object for the active owner rather than recomputing ownership from current DOM text or `MutationObserver`-visible counters.

---

## 6｜Answer-protection contract

KP Recall protection applies to the **complete answer-bearing workspace**.

Before Reveal, the renderable front may contain only:

- KP identity / location;
- canonical or private Prompt;
- non-answer-bearing navigation/runtime chrome.

The following are answer-bearing by default and must stay behind Reveal in Recall:

- Core;
- Precision;
- Visual;
- Extension;
- answer-bearing Connection detail;
- source/outline content excerpts beyond non-answer-bearing locators.

The learner object may contain those fields in memory, but the Recall projection must expose them only through `post_reveal_refs`; front renderers must not traverse the full object recursively.

---

## 7｜Visual is first-class at KP scope

A reviewed Visual anchor may belong to a Logic Group **or an exact KP**.

KP Visual is therefore supported by contract. It is not an error state.

- during KP Learn: a useful KP Visual may be shown in the auxiliary companion region;
- during KP Recall: the same answer-bearing Visual stays hidden until Reveal;
- Source Visual bundles remain provenance-backed support and do not replace the original Lecture / MarginNote source.

Any runtime check that rejects all `anchor.kp_id` Visuals is obsolete once this resolver is active.

---

## 8｜Extension and Connection rules

Extension and Connection are enrichment families inside the owning learner object.

They must not:

- create their own learning order;
- mutate canonical owner identity;
- mount by guessing incidental CSS class positions;
- duplicate one asset under multiple learner owners;
- convert `REFERENCE_ONLY` into a mandatory step.

Stable Extension `slot_id` remains the replaceable learner-role identity. Pathway/Connection identity remains owned by reviewed relation data.

---

## 9｜Renderer boundary

The runtime may expose a small fixed set of **semantic slots** such as:

```text
block_orientation
logic_group_prelearn
kp_learn_aux
kp_recall_post_reveal
logic_group_postlearn
```

These slots are contracts between resolver and renderer. They are not medical owners.

A single learner-asset renderer may place the already-resolved assets into those slots. Precision / Visual / Extension / Connection must not each run independent DOM-discovery logic.

Final geometry, styling, card shape, split ratios and responsive behavior remain Product/UI work and are intentionally outside this contract.

---

## 10｜Validation invariants

A Current learner-object build must prove at least:

1. every canonical KP in the Block appears exactly once;
2. KP/LG anchors resolve only to real Current owners;
3. no medical Core is invented by Projection;
4. reviewed KP Visuals resolve successfully;
5. Recall front contains no answer-bearing payload;
6. every answer-bearing auxiliary family is reachable only after Reveal in Recall;
7. missing optional Precision / Visual / Extension / Connection stays absent rather than generating fake debt;
8. compiled Cognitive Projection may enrich System/Block orientation but never becomes a second KP medical owner.
