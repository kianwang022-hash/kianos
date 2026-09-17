# KianOS Root Current

**Repository:** `kianwang022-hash/kianos`  
**Role:** root engineering router + Control Tower entry

`CURRENT.md` is not project history, learner progress, or a second Truth database.

---

## Root Work Cursor — Same-day Launch Closure

**Outcome:** KianOS learner website must be landed today as a stable, visually accepted, directly usable learning surface.  
**Current stage:** `L1/L2 — Shared Visual Foundation + Shared Shell` is in PR #389. Kian accepted the overall real-browser direction; only the requested stronger/clearer Chinese Rail + Subject Strip typography remains before this layer may close.  
**Root blocker:** none.  
**Scope rule:** no new architecture, no new governance, no opportunistic feature work until launch closure.

Today is a **closure program**, not a broad rebuild.

### Launch order

```text
#389 L1/L2 Shared Visual Foundation + Shared Shell
→ L3 Home first viewport
→ accepted subject/task blueprints on the shared foundation
   - English core task workspaces
   - Politics Natural Unit
   - Xizong current mature learner path
   - Lexical inheritance check
→ External Reading through the same shared Reading Workspace when #373 is reconciled
→ whole-site smoke / Current-sync proof
→ LAUNCH
```

Lower layers inherit the stable shared visual decisions. Do not reopen accepted Content / Learning / Runtime semantics for visual convenience, and do not redesign a surface whose learner layout was already accepted unless Kian explicitly asks or the Learning model materially changed.

### Hard launch freeze

Until launch closes:

- do not add new Contracts / registries / routers / validators;
- do not start new feature families;
- do not expand optional Visual / Projection / content enrichment merely for completeness;
- do not merge stale/local visual work simply because it already exists;
- do not spend time on ownership cleanup that does not change today's learner experience or launch safety;
- do not make unrelated subject CI or raw `main` distance a launch blocker.

Independent content work may continue in separate Chats only when it does not touch the launch write-set or consume Control-Tower attention.

---

## Today’s merge policy

Existing open work is evidence/candidate work, not automatically part of launch.

- **Shared Visual / Shell #389** — first landing candidate. It owns the shared visual foundation and shell chrome only; subject-native geometry remains local.
- **Home #387** — preserve functional/read-model work. Reconcile its presentation with #389 rather than redesigning Home architecture again; merge only after the real first viewport passes Human Gate.
- **Politics #386** — preserve accepted Natural Unit geometry/learner hierarchy as evidence. Do not let its pre-#389 CSS redefine shared typography/palette/chrome; reuse the geometry under the new shared foundation.
- **Xizong #385** — presentation-owner cleanup is not a same-day launch prerequisite. Merge only if it becomes necessary for a launch-visible defect or materially lowers the exact launch change cost without expanding scope.
- **English #373** — this is **not a separate External Reading UI project**. External Reading is another data source for the same shared Reading Workspace. After #389 lands, reconcile the overlapping shared navigation change; if the existing runtime/answer-gating checks remain green, it may land as shared-Reader integration without a second visual design cycle. The External inventory may remain a simple material chooser.

Hard rule:

> **Today we merge the smallest coherent set that produces the accepted learner website, not every nearly-finished branch.**

---

## Product ownership model for launch

```text
RULE / MODEL     why / knowledge-quality rule / learning logic / interaction logic
CONTENT          Source + AI-reconstructed canonical learning assets
VISUAL           shared visual + subject visual + accepted surface blueprints
ENGINEERING      renderer / Runtime / state / sync / interaction implementation
CONTROL          reads the above and reports current state; creates no second Truth
```

Website is a consumer/execution surface, not a second content owner.

Normal content path:

```text
Chat reads canonical Content
→ discuss / edit the one GitHub owner
→ main
→ repository-wide Current sync
→ existing renderer shows the new Current
```

Normal visual path:

```text
global visual change → one shared visual owner
subject-wide visual change → one subject visual owner
accepted task layout change → its surface blueprint/owner
```

Same task type should reuse one renderer/runtime where semantics are the same. Different data sources do not justify duplicate UI.

---

## Launch acceptance

Website launch requires all of the following:

### 1. Visual
- shared typography / weight / contrast / spacing feel accepted;
- no thin/weak learner-facing typography as the default voice;
- no obvious generic SaaS/dashboard smell on Home or representative subject surfaces;
- already accepted subject/task layout blueprints remain recognizable after shared visual inheritance;
- representative `1512×982` screenshots reviewed;
- obvious overflow/layout failures absent on required narrow fallback.

### 2. Functional
- global navigation / K rail works;
- Home primary next/resume paths work;
- mature task renderers remain usable: Reading, question/attempt, Recall/Learn, Translation, Writing, Lexical as applicable;
- External Reading, when landed, uses the same Reading Workspace rather than a second runtime/UI;
- one representative real learner path per mature subject opens and remains usable;
- Timer does not block learner interaction;
- no semantic/content rewrite is required merely to render the accepted UI.

### 3. Delivery

```text
accepted main change
→ Current mirror reaches exact main
→ Astro serves the Current repository
→ learner-visible change appears without manual Git work
```

### 4. Change-cost sanity
- a global typography change resolves upstream rather than through subject-by-subject patching;
- subject-native geometry stays locally owned;
- canonical content remains direct-editable without duplicate page copy;
- adding another valid External Reading object requires content/data change, not another reader implementation.

### 5. Human Gate
Kian must accept the real learner-facing visual result. CI/build/browser green alone cannot close the launch.

---

## What is explicitly deferred past launch

Unless a real launch blocker proves otherwise:

- broad CSS/ownership archaeology;
- decorative/polish work for the External Reading inventory beyond a clear material chooser;
- further Xizong presentation-owner cleanup;
- Politics visual polish beyond what the shared foundation + accepted Natural Unit geometry require;
- optional Lexical Runtime convenience debt;
- nonessential governance cleanup;
- any new feature or abstraction not required for today's learner website.

---

## User-intent boundary

Root routing follows `AGENTS.md`.

A bare learner continuation such as `继续英语 / 继续政治 / 继续循环` defaults to **learning use**, not this engineering cursor.

Enter root/lane engineering Current only when the request is actually BUILD / UI / CONTROL.

---

## Lane entrypoints

| Scope | Engineering Work Cursor |
| --- | --- |
| Xizong | `content/xizong/CURRENT.md` |
| English | `content/english/CURRENT.md` |
| Politics | `content/politics/CURRENT.md` |
| LexicalOS | `content/lexical/CURRENT.md` |
| Cross-subject scheduling | `EXAM_ORCHESTRATOR_CONTRACT.md` |

Known engineering scope may go directly to its local Current. Root Current is not a mandatory read.

---

## Control Tower reporting

For launch work report only:

```text
Stage
Done
Real blocker
Next
Human Gate
```

Do not expose CI/branch/SHA detail unless it changes the decision.

---

## Root operating rule

```text
Kian intent
→ narrow owner
→ minimum change
→ representative proof
→ Human Gate
→ land
→ stop
```

**Today’s optimization target is a finished learning website, not a more complete engineering project.**
