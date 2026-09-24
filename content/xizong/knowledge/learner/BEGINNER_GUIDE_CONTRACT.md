# Xizong System Beginner Guide Contract

Status: **CURRENT**  
Scope: `content/xizong/knowledge/learner/*-guide.md`  
Parent authority: `content/xizong/LEARNING_CONTRACT.md`  
Medical truth owners: Current `content/xizong/knowledge/systems/**/system.json` + canonical Block Markdown  
Learning-route owners: Current System-specific `*-learning.json` + `study-policy.json`  
Current Guide path resolver: `content/xizong/knowledge/learner/guide-bindings.json`

## 1｜Why this layer exists

A Current `system.json` can correctly own the System mission, mother model, variables, failure modes, judgment axes and Block route while still being too compressed for a learner entering the System for the first time.

The Beginner Guide restores that missing **explanation / orientation layer**:

```text
Current System semantics
+ Current learning guidance
+ canonical Block-level learning structure
→ beginner-readable explanation
```

Naming is intentionally strict:

```text
Guide = explanatory prose that accelerates first-pass understanding
Framework = structured System / Block cognitive model
```

A Guide may explain a Framework, but it is not itself the Framework and does not own the Framework's medical relations.

It answers questions such as:

- 这个系统到底在维持什么？
- 为什么这些 Block 要这样组织，而不是按教材目录重读？
- 第一次进入时脑内先放哪张总图？
- 疾病出现时先沿哪几个 Failure / judgment coordinates 定位？
- 进入一个 Block 后，Framework、Logic Group、KP、Memory Routing 各自做什么？

It is **not** a second textbook and **not** a revived legacy System Guide authority.

## 2｜Authority boundary

A Beginner Guide has **no independent medical semantic authority**.

It may:

- explain relationships already owned by Current `system.json` / Block Core;
- translate accepted structure into beginner-readable language;
- explain why a Current Block route or DAG is cognitively useful;
- point to accepted learner guidance and memory semantics;
- preserve a useful metaphor, ordering move or explanatory contrast from bounded historical provenance **only after Current re-verification**.

It may not:

- introduce a new medical fact, threshold, drug rule, treatment decision or diagnostic criterion;
- silently change System / Block / KP identity or learning order;
- invent Question→KP relations, Source locators or Source-contact units;
- turn historical Guide prose into a parallel Current owner;
- use historical page ranges, implementation status or old scope claims as Current truth;
- infer MI-G / MI-D membership when the Current Block owner does not explicitly provide it.

When explanatory prose conflicts with a Current owner, the prose loses and must be rewritten or removed.

## 3｜Required Current inputs

Each Beginner Guide must name the exact Current owners it explains.

Minimum inputs:

1. Current System `system.json` — mission, mother model / spine, variables, relations, failure modes, judgment axes, route / DAG;
2. Current System-specific `*-learning.json` — first-pass focus, stop lines, recall spines, Logic Group goals / closure and accepted source-contact policy where present;
3. canonical Block Markdown only when the Guide describes a Block-owned Framework / Memory Routing pattern;
4. `content/xizong/LEARNING_CONTRACT.md` and `study-policy.json` for shared learning semantics.

A Beginner Guide must not become the owner of those inputs merely because it explains them more fluently.

### Current path resolution

`guide-bindings.json` is the only Current Beginner Guide path resolver.

For systems explicitly listed there:

```text
guide-bindings.json
→ Current learner/*-guide.md
```

The resolver only selects an explanation asset. It never elevates a Guide above `system.json`, Block Core or the accepted System Learning owner.

Systems absent from `guide-bindings.json` simply have no separate Beginner Guide surface. They continue through their canonical Current System/Learning owners and never fall back to a pre-cutover System Guide.

## 4｜Bounded historical provenance rule

Historical System Guides may be read only as **bounded provenance for explanation recovery**.

For A1 / A2 / A3 / B, the allowed historical substrate for this migration is the **last full version immediately before retirement**. Earlier Guide generations are out of scope unless a later audit names a concrete unresolved provenance question.

A historical idea is migratable only when all four conditions hold:

1. it improves comprehension rather than merely adding more detail;
2. its underlying medical / learning semantics still resolve to Current owners;
3. stale execution state, page ranges, old Block authority and old Source policy are removed;
4. the Current Guide records that the historical item was migrated as an explanatory pattern, not as authority.

Preferred historical imports:

- useful mother-model metaphors;
- a high-level mechanism spine;
- a failure-localization frame;
- a DAG / branch explanation;
- a distinction that prevents beginner category errors.

Non-migratable by default:

- old `Scope Audit` inventories;
- old source-page maps;
- old implementation progress;
- old timing estimates;
- legacy Block / Stage identity;
- stale deferred/primary ownership decisions;
- old claims that Current System / Learning owners superseded.

## 5｜Required Guide shape

A Current Beginner Guide should stay compact enough to be read before learning, normally containing:

```text
Authority boundary
→ System problem / mission
→ one mother model
→ first-pass coordinates / distinctions
→ Failure / judgment map
→ Block route or dependency DAG explained in learner language
→ how to enter one Block
→ memory semantics
→ bounded provenance note
```

The Guide should not duplicate every KP or every Block body.

## 6｜Block handoff semantics

The Guide may explain the shared handoff, but System-specific learning owners remain authoritative for the exact source-contact unit.

Conceptually:

```text
System Beginner Guide
→ Block center question / Framework
→ accepted original-Lecture contact
→ Logic Group / KP learning and retrieval
→ Group / Block closure
→ Memory Routing where Current-owned
```

Do **not** reinterpret this as “one Source trip per Logic Group”. Source-contact granularity stays with the accepted System learning owner and `LEARNING_CONTRACT.md`.

Explicit Block pre-entry extraction and typing are governed by `BLOCK_PREENTRY_CONTENT_CONTRACT.md`; the Beginner Guide may explain those jobs but does not own their membership.

## 7｜Framework and Memory Routing are distinct content jobs

### Framework

Framework is the Block-level cognitive map that makes the upcoming Core navigable. It may be a mechanism spine, sequence, coordinate system, comparison frame or decision structure already present in canonical Block content.

Framework is answer-bearing orientation content. It must not be reduced to a generic decorative card or inferred from UI layout.

### MI-G

`MI-G` is **gating memory**: exact or compact material whose absence would obstruct continued understanding / retrieval in the current System. It belongs to first-pass carry-now semantics when the Current Block owner explicitly marks it.

### MI-D

`MI-D` is **deferrable exact memory**: material that should be retained and scheduled, but should not block the mechanism-learning line once it has been correctly located.

`MI-D` does not mean “unimportant”. It means “can move out of the immediate mechanism gate”.

### Memory Routing

Memory Routing is the Current content decision that routes explicit items between immediate gating and deferred exact-memory handling. It is **not** personal progress, due-date scheduling, rating history or Runtime state.

Projection / Runtime may consume these semantics later, but they may not invent them.

The normative extraction boundary for these four jobs is `BLOCK_PREENTRY_CONTENT_CONTRACT.md`.

## 8｜Projection boundary

A Beginner Guide is eligible for future `SYSTEM_GUIDE` projection consumption, but adding this content asset alone does **not** claim Runtime adoption.

Likewise, a Block Framework / MI-G / MI-D / Memory Routing section existing in canonical content does not mean current Projection already exposes it. Projection exit must be audited separately and fail closed when the Current owner has no explicit asset.

`guide-bindings.json` is content-path resolution only; it does not itself modify `SYSTEM_GUIDE` Projection or the Astro semantic adapter.

## 9｜Acceptance rule

A Beginner Guide is acceptable only when a fresh reader can use it to answer:

1. what the System is trying to keep stable;
2. what the mother model is;
3. which first-failure coordinates matter;
4. why the Block route / DAG has its current shape;
5. what to do when entering a Block;
6. what the Guide does **not** own.

More prose is not automatically better. The success condition is **better first-pass orientation without creating a second truth layer**.
