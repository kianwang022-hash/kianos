# KianOS Architecture

Status: **CURRENT — accepted top-level architecture**  
Version: **2.0**

This document defines the smallest durable architecture needed for KianOS to remain understandable, restartable, editable and useful over long-term real study.

Its job is not to describe every file, workflow or implementation detail. Its job is to answer:

> **What are the permanent responsibilities in KianOS, who owns them, and how do they fit together without creating duplicate truth?**

`PROJECT_DEFINITION.md` remains the higher owner for why KianOS exists and what success means.

---

# 1｜The five durable responsibilities

KianOS has five top-level responsibilities:

```text
                         RULE / MODEL
              why / knowledge quality / learning /
                    interaction / boundaries
                              │
             ┌────────────────┼────────────────┐
             ↓                ↓                ↓
         CONTENT           VISUAL         ENGINEERING
         what to learn     how it appears   how it runs
             │                │                │
             └────────────────┴────────────────┘
                              ↓
                           WEBSITE
                     learner execution surface

                              ↑
                           CONTROL
                 reads current state; creates no Truth
```

These are **responsibilities**, not five separate databases and not five mandatory file types.

A responsibility may be implemented by one or several narrow canonical owners. The hard rule is that one fact/decision still has one canonical owner.

---

## 1.1 RULE / MODEL｜why the system behaves this way

Rule / Model is the upstream logic that gives KianOS its learning intent.

It includes five kinds of rule:

### Purpose
Why this learner/domain exists and what outcome it optimizes.

Examples:

- English optimizes future exam performance on new material, not framework completion;
- Politics optimizes reliable score gain per learner time;
- Xizong builds a mechanism-centered, retrievable, progressively compressed medical model;
- Lexical builds fast, correct, transferable lexical access.

### Knowledge-quality rule
What counts as a **good AI-reconstructed knowledge asset** rather than copied source material.

The AI role is not to display the lecture/book again. It must transform reliable Source into learner-worthy Knowledge according to domain-specific rules.

Examples may include:

- mechanism / causal relations / boundaries / precision in Xizong;
- semantic relations / historical logic / confusable boundaries in Politics;
- transferable task models / decision rules in English;
- Core / senses / familiar-new branches / constructions / phraseology / confusables in Lexical.

### Learning logic
How the approved knowledge should actually be learned, recalled, applied, repaired and compressed.

### Interaction logic
What learner actions mean and which transitions are legitimate.

Examples: whole-passage Reading attempt, conditional repair, Recall→Reveal, Writing revision, question Submit, low-friction stable exit.

### Boundaries
What downstream layers are forbidden from inventing.

Hard boundary:

```text
Content does not decide page layout.
Visual does not invent knowledge.
Engineering does not invent Learning Logic.
Website does not become a second content owner.
Control does not manufacture Truth.
```

Root rules live in root authority. Domain-specific rules live in the domain Learning / Content contracts that genuinely own those differences.

---

## 1.2 CONTENT｜the durable learning asset

Content is the most important long-lived learner asset in GitHub.

Its normal causal chain is:

```text
SOURCE
reliable original material / question / provenance
        ↓
KNOWLEDGE
AI-reviewed reconstruction of what is actually worth learning
        ↓
LEARNING CONTENT
canonical assets used by learner paths

+ questions
+ explanations
+ reviewed relations
+ examples
+ reference / enrichment where justified
```

### Source is not a separate top-level layer

Source is the factual/provenance foundation inside Content.

Source answers:

> **What reliable raw material are we allowed to learn from?**

Knowledge answers:

> **Has AI actually transformed that material into a coherent, accurate, learner-worthy knowledge model?**

A copied lecture, copied PDF, teacher chapter order, raw question taxonomy, or rendered source text is not automatically good Knowledge.

### Website-disappearance rule

Canonical Content must remain coherent and valuable if the current Astro website disappears tomorrow.

The website is a consumer of Content, never its semantic owner.

### Normal content change path

```text
Kian + Chat
→ read exact canonical owner
→ discuss / improve content
→ edit one GitHub owner
→ main
→ Current mirror sync
→ existing renderer shows the new Current
```

Routine content change should not require editing a duplicate page copy.

---

## 1.3 VISUAL｜stable presentation of accepted meaning

Visual owns how already-approved meaning appears to the learner.

Visual has three scopes:

```text
Shared Visual
→ site-wide typography / weight / palette / spacing / radius / elevation / shared controls

Subject Visual
→ English / Politics / Xizong visual language where the domain genuinely differs

Accepted Surface Blueprint
→ stable task geometry already accepted by Kian
```

Examples of Accepted Surface Blueprints:

- Reading: passage left / complete question set right;
- Cloze: full passage / full 20-row answer sheet;
- Translation: source left / learner translation right;
- Writing: prompt/material left / dominant essay workspace right;
- Politics: accepted Natural Unit workspace geometry;
- Xizong: accepted System / Block / Recall / Memory / Question workspaces;
- Lexical: accepted word / Depth / Challenge geometry inside English learner navigation.

### Accepted design is an asset

Once a learner surface has passed Kian's Human Gate, later CSS refactors, Shell changes, owner cleanup, or new Chats do **not** reopen its layout by default.

A surface is redesigned only when:

1. Kian explicitly asks to redesign it; or
2. upstream Rule / Learning Logic changes enough that the accepted geometry no longer expresses the real task.

### Visual does not own semantics

Visual may choose hierarchy, spacing, typography, layout, disclosure and interaction affordance.

It may not decide what the knowledge means, what a question tests, or what the learner should learn.

---

## 1.4 ENGINEERING｜make the approved system executable

Engineering implements Rule + Content + Visual.

Typical Engineering owners include:

- loaders / adapters;
- shared or domain renderers;
- Runtime/state;
- Reading / Question / Recall / Translation / Writing / Lexical workspaces;
- answer gating;
- learner interaction persistence;
- Timer;
- navigation;
- keyboard behavior;
- GitHub → local Current sync;
- Astro implementation;
- browser/runtime validation and CI.

### Runtime is part of Engineering

Runtime does not form another top-level architecture.

Rule decides what a learner action means. Runtime makes it executable.

Example:

```text
RULE
Reading is a whole-passage clean attempt before formal review.

ENGINEERING
store answers + Uncertain
→ protect answer key
→ Submit
→ score
→ expose bounded review only afterward
```

If Runtime behaves differently from the approved Rule, Runtime is wrong; the system does not reinterpret the Learning Logic merely to preserve implementation convenience.

### Reuse same task behavior

When two content sources use the same learner task semantics, prefer one renderer/runtime.

Example:

```text
Reading A exam objects ─┐
External Reading objects ├→ shared Reading Workspace
other compatible reading ┘
```

Different data sources do not justify duplicate UI or duplicate Runtime.

---

## 1.5 CONTROL｜know where everything is

Control is a read/control responsibility, not a new Truth database.

Control reads the narrow current owners needed to answer:

- what Rule is active;
- what Content is mature / missing;
- what Visual is accepted / pending;
- what Engineering capability exists / is blocked;
- what Acceptance evidence exists;
- what learner state is known when that private state is legitimately available;
- what should happen next.

Control normally reports in a compact form:

```text
Stage
Next
Blocker
Owner
Human Gate when relevant
```

`CURRENT.md` is an **engineering Work Cursor / router** inside Control. It is not learner progress and not semantic Truth.

A bare learner request such as `继续英语` does not automatically mean `continue the engineering CURRENT`.

---

# 2｜Three cross-cutting truth guards

The five responsibilities are constrained by three truth guards.

These guards are **not additional product layers**.

## 2.1 Source Truth

Reliable factual/source boundaries must remain explicit.

Do not silently invent missing source facts, official answers, provenance, mappings, or quoted teaching content.

## 2.2 Learner Truth

Learner Truth answers:

> **What has Kian actually studied, attempted, repaired, retained, forgotten, deferred or demonstrated?**

It is private learner/runtime evidence.

Engineering readiness, page existence, accepted Content, CI success or a Work Cursor must never manufacture learner progress.

## 2.3 Acceptance Truth

Acceptance answers:

> **What quality/readiness claim has actually been demonstrated?**

`LEARNING_ACCEPTANCE.md` owns the S/K/L/P/R/E/U standard.

A file existing, page rendering, build passing, Runtime working or screenshot looking good may support Acceptance, but does not replace the applicable evidence standard.

---

# 3｜S / K / L / P / R / E / U is acceptance, not architecture

The acceptance gates map naturally onto the five-responsibility model:

```text
S  Source      → is Source reliable?
K  Knowledge   → did Source become high-quality learner-worthy Knowledge?
L  Learning    → is the Rule / Learning Logic correct?
P  Projection  → does the learner-facing presentation serve that Learning Logic?
R  Runtime     → can Engineering execute the intended behavior?
E  Evidence    → are meaningful learner observations preserved/interpreted correctly?
U  User        → did Kian actually use the path successfully?
```

These are **quality gates**, not seven top-level product layers.

Construction order and acceptance remain separate responsibilities:

```text
LEARNING_ASSET_STANDARD.md
= how a learning asset is built

LEARNING_ACCEPTANCE.md
= what evidence permits us to call it ready
```

---

# 4｜Projection is optional derivation, not a mandatory architecture layer

Projection / presentation transformation may be useful when the same canonical cognition must appear differently by learner state.

Example:

```text
same canonical knowledge
├─ Learn: full explanation
├─ Recall: answer-bearing parts hidden
├─ Repair: failed relation foregrounded
└─ Review: compressed representation
```

In those cases:

```text
Canonical Content
→ derived presentation / projection
→ renderer
```

But ordinary Content does not need a ceremonial Projection hop when the existing renderer can consume it directly:

```text
Canonical Content
→ renderer
```

Hard rules:

- Projection is derived, not independently edited semantic Truth;
- Projection must not invent missing relations/content;
- Projection must not become a second canonical knowledge copy;
- a renderer may fail closed when semantics are insufficient rather than guess.

---

# 5｜Backend ownership tree ≠ learner product tree

KianOS distinguishes **backend ownership** from **learner-facing navigation**.

A scope may deserve an independent backend lane because it has substantial canonical assets, independent maintenance, bounded continuation or parallel work.

That does not require it to appear as a learner-facing top-level product.

## 5.1 Current learner product tree

The accepted top-level learner product is:

```text
Home
├─ 西综
├─ 政治
└─ English
   ├─ Reading A
   ├─ Cloze
   ├─ Part B
   ├─ Translation
   ├─ Writing
   ├─ Vocabulary / Lexical
   └─ External Reading
```

Lexical may retain independent backend canonical ownership and engineering continuation where that lowers ambiguity and protects lexical Truth.

But learner-facing Vocabulary / Lexical is an **English child function**, not a fourth subject beside English.

Likewise, External Reading is an English child surface and another data source for the shared Reading task family, not another top-level product.

Hard distinction:

```text
backend lane / canonical ownership
≠
learner navigation level
```

---

# 6｜Ownership hierarchy and concurrency

KianOS remains federated and restartable.

Backend ownership may use:

```text
Root
→ Lane
→ independently continuable Sub-lane when justified
→ Canonical Owners
→ learner execution
```

Hierarchy answers:

> **Who owns this responsibility and which rules does it inherit?**

Hierarchy does **not** determine work order.

Scheduling follows real dependency:

```text
no real dependency → proceed independently
real dependency    → freeze only the affected downstream chain
```

A parent/child or sibling relationship alone does not create serialization.

Examples:

- independent Xizong Systems may be constructed concurrently;
- Politics subjects may progress concurrently;
- lexical content batches may progress independently when their real write sets do not conflict;
- learner order may still be sequential even when artifact construction is parallel.

Hard distinction:

```text
ownership hierarchy
≠ construction dependency
≠ learner order
≠ learner product navigation
```

---

# 7｜One owner per responsibility

One current fact, rule, semantic object, acceptance claim or learner-state fact has one canonical owner for its responsibility.

Other layers may:

- reference;
- derive;
- adapt;
- render;
- validate;

They may not maintain a competing mutable copy.

Examples:

- medical Knowledge stays in canonical Xizong content, not Astro markup;
- lexical truth stays in lexical Natural Owners, not Reading pages;
- shared typography stays in the shared visual owner, not repeated subject CSS;
- learner progress stays in private learner state, not repository CURRENT;
- Home consumes subject projections/read models; it does not recreate subject cognition.

If two owners appear to maintain the same fact, resolve ownership upstream instead of adding synchronization glue.

---

# 8｜CURRENT and Fresh Chat

`CURRENT.md` is a small engineering router / Work Cursor.

It answers only:

```text
scope
current active engineering stage
real blocker
next engineering action
exact owners needed to continue
```

It is not:

- project history;
- Acceptance evidence ledger;
- learner progress;
- semantic content;
- a second Contract.

## Fresh Chat target

Once intent and scope are known, normal work should reach effective action after roughly **2–3 precise reads**, 4 only when a real cross-authority boundary exists.

Normal read patterns:

```text
LEARN
→ actual learner/runtime state
→ domain Rule only when needed
→ learn

BUILD
→ target CURRENT
→ exact Rule / Content owner
→ work

UI
→ shared/local Visual owner
→ accepted Surface Blueprint
→ exact implementation owner
→ work

CONTROL
→ root/lane Current + only required owners
→ report
```

Broad repository archaeology is a routing defect, not a normal continuation method.

Historical repositories, old Issues, retired branches and prior Chats are evidence for bounded recovery/history tasks only; they are not normal Current semantic fallback.

---

# 9｜Content evolvability and change-cost tests

KianOS succeeds only if the next legitimate change is cheap.

## 9.1 Content change

Representative test:

> `改这个 KP / word sense / Politics teaching object。`

Expected path:

```text
canonical owner
→ targeted validation / derived presentation only if required
→ existing renderer
```

No duplicate page edit.

## 9.2 Global visual change

Representative test:

> `全站正文更厚一点。`

Expected path:

```text
one shared visual owner
→ inherited by learner surfaces
```

Not subject-by-subject CSS repair.

## 9.3 Subject/surface geometry change

Representative test:

> `Politics Natural Unit 右栏更窄。`

Expected path:

```text
Politics surface visual owner
```

Not a global visual rewrite.

## 9.4 Runtime defect

Representative test:

> `Reading Submit 坏了。`

Expected path:

```text
Reading interaction Rule
+ exact Reading Runtime owner
→ focused repair
```

No Learning redesign unless the defect proves the existing Rule itself is wrong.

---

# 10｜Rules inherit; they do not multiply

Repository-wide invariants live once at the highest valid owner.

Domain/sub-lane contracts add only genuine local differences.

Do not create a new Contract, registry, router, Current type, status layer or abstraction merely because an implementation feels complicated.

Before adding durable architecture, prove:

1. a recurring real responsibility has no valid existing owner;
2. simplification/reuse cannot represent it without ambiguity or duplicate Truth;
3. the new object lowers long-term continuation or change cost.

Otherwise simplify the narrow existing owner.

---

# 11｜Architecture acceptance tests

This Architecture remains valid only while it passes these observable tests.

## A1｜Fresh Chat Test

Known intent + known scope → effective work in roughly 2–3 precise reads without prior-chat reconstruction.

## A2｜Owner Uniqueness Test

For any important current fact or rule, `Who owns this?` has one clear answer.

## A3｜Truth Separation Test

Artifact/Content reality, Acceptance, Learner Truth and engineering Work Cursor remain separately resolvable.

## A4｜Content Change Absorption Test

Ordinary legitimate Content evolution reaches the learner through asset change + existing renderer/runtime without page-specific semantic rewrite.

## A5｜Visual Change Cost Test

Global visual change resolves globally; subject/surface geometry resolves locally; accepted Surface Blueprints do not reopen accidentally.

## A6｜Parallel Work Test

Independent scopes can proceed concurrently without false parent/sibling serialization or broad rebase rituals.

## A7｜Learning Closure Test

Engineering completion cannot substitute for S/K/L/P/R/E/U evidence or real learner U.

## A8｜Three-month Entropy Test

Continued use should not recreate:

- giant Current/history files;
- duplicate semantic owners;
- repeated rules across lanes;
- UI copies of canonical content;
- subject-local forks of shared visual/runtime infrastructure;
- Fresh Chats that need repository-wide archaeology.

If these recur, architecture must be simplified at the earliest responsible owner.

---

# 12｜Compact operating model

For ordinary KianOS work, keep this mental model:

```text
RULE       why / quality / learning / interaction
CONTENT    what to learn
VISUAL     how it appears
ENGINEERING how it runs
CONTROL    where we are
```

Constrained by:

```text
Source Truth
Learner Truth
Acceptance
```

Normal product flow:

```text
Rule
↓
Content + Visual
↓
Engineering
↓
Website
```

Control observes and routes the system from the side.

The website is the learner-facing execution surface. **The durable asset is the Rule + Content + accepted Visual/Engineering model behind it, not the page itself.**
