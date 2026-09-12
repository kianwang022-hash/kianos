# KianOS System Contract

This document owns two questions:

> **What minimum platform capabilities should a mature first-class learner surface provide across KianOS?**
>
> **What cross-KianOS boundary prevents a technically capable surface from silently taking ownership of a learning action?**

It does not define domain cognition, formal learning-asset construction order, S/K/L/P/R/E/U acceptance criteria, branch workflow, or lane progress.

- construction order → `LEARNING_ASSET_STANDARD.md`
- acceptance/readiness → `LEARNING_ACCEPTANCE.md`
- shared static-web projection grammar → `static-web/PRESENTATION_CONTRACT.md`
- repository/lane routing → `AGENTS.md` + `CURRENT.md`
- branch/concurrency → `BRANCH_LIFECYCLE.md`

## 1. Federated platform model

KianOS is one system with multiple domain lanes and independently entered sub-lanes.

```text
root Current
→ lane Current
→ first-class sub-lane Current when useful
→ natural owners
→ learner surface
```

Shared platform capability does not imply shared cognition or identical UI.

A lane may differ in:

- natural learning unit;
- first-learning order;
- error taxonomy;
- evidence granularity;
- repair logic;
- scheduler/review behavior;
- transfer semantics;
- UI layout.

A mature implementation from one lane may be an engineering reference. It is never an upstream semantic requirement for another lane.

### 1.1 Multi-surface learner reality

A learner journey may span more than one device, application, or environment, for example:

- Chat for adaptive orientation, diagnosis, or semantic repair;
- `static-web/` for KianOS-owned navigation, checkpoints, attempts, evidence capture, return, or other approved interactions;
- an original lecture/PDF/reader/notebook surface for continuous source study;
- an external task environment for fresh Reading, media, physical practice, or real-world transfer.

These are **learning surfaces**, not governance scopes. They do not automatically become semantic owners merely because content can be rendered there.

Hard invariant:

```text
Source ownership ≠ Surface ownership.
Content availability ≠ Render entitlement.
Runtime capability ≠ Learning-surface authority.
```

For every important learner action whose location materially changes cognition or friction, the relevant domain Learning Contract must determine one of the following before Projection/Runtime is allowed to decide it:

- the primary surface;
- that the action is genuinely surface-agnostic;
- the companion/reference surfaces that may assist;
- any forbidden substitution;
- the handoff needed between surfaces.

Do not infer surface ownership from the existence of an Astro component, repository field, source loader, or historical implementation.

## 2. Shared learner-surface baseline

A mature first-class learner lane or independently entered sub-lane should provide the capabilities below when they are genuinely needed by that surface.

A surface is responsible only for the learner actions assigned to it by the applicable Learning Contract. A capability listed below is not permission for one surface to absorb an action owned elsewhere.

### Current

The surface resolves from explicit Current owners and fails closed on missing/invalid dependencies.

It must not silently use historical, legacy, stale, guessed, or compatibility content as semantic fallback.

### Continue

The learner can resume without reconstructing the product's execution position manually.

Keep two states separate:

- shared construction/work position → repository Work Cursor / `CURRENT.md`;
- personal learning position/progress → private learner state.

The shared Work Cursor must never be used as proof of personal learner progress.

A retained machine-only `continuation.*` file, if one is ever genuinely required, is an implementation detail named by Current—not the cross-KianOS Continue contract and not a second Work Cursor.

### Navigate / Explore

The learner can reach the relevant Current object with low friction using a domain-appropriate map, index, search, navigator, or equivalent.

Do not force every lane into one navigation component.

### Repair / Review

The surface can expose material that actually needs repair/review without manufacturing debt from stable correct work.

Stable correct work should be able to pass quickly.

### Verify / Challenge / Transfer

The surface has an appropriate way to test whether the intended capability works.

The mechanism may be official questions, generated challenges, closure tasks, reconstruction, fresh transfer, or another domain-appropriate form.

Verification follows the domain contract, not a shared card template.

### Return / Handoff

Meaningful learner evidence can return to Chat in a compact form sufficient to change the next action.

A handoff should preserve enough identity/evidence to determine:

- which learner object/task was involved;
- what failed, remained uncertain, or was marked for repair;
- what judgment/repair is now required.

Private learner evidence remains private and is not committed into shared Current.

When the approved learner path crosses surfaces, Runtime should also preserve enough position/identity for the learner to return to the correct external or KianOS-owned surface without reconstructing the workflow manually.

### Deferred

Intentionally postponed work with real future value uses the repository-wide Deferred Queue defined in `DEFERRED.md` and GitHub Issue #5.

Active work position is not Deferred.

### Validation

The surface has validation appropriate to the risks it can introduce.

This may include source identity/hash checks, schema checks, deterministic hydration, targeted runtime tests, build checks, browser journeys, and real learner use.

A green build is evidence, not learning acceptance by itself.

## 3. Capability inheritance

A domain-level home satisfying a capability does not automatically satisfy it for every independently entered child surface.

Examples:

- English Reading, Translation, Writing, Cloze, or Reading B may require their own executable Continue/Repair/Return paths.
- Xizong Systems may share runtime infrastructure while retaining System/Block/KP cognition.
- LexicalOS may use word/relation Natural Owners and generated Challenge without becoming a template for Politics.
- Politics may use Natural Units and Xiao1000 verification without inheriting English evidence granularity.

Surface ownership is inherited only when the upstream contract actually defines a shared learner action. An external-primary action remains external-primary until a Learning Contract explicitly changes it; a shared platform primitive cannot silently override that decision.

When a sub-lane becomes independently entered and independently continued, give it its own Current entrypoint only when that reduces reads and ambiguity. Do not create hierarchy for hierarchy's sake.

## 4. Shared-runtime boundary

`static-web/` is the common **KianOS-owned learner execution layer**. It is not the presumptive primary surface for every learning action.

Shared components/utilities are appropriate when the **learner decision** is genuinely shared, for example generic navigation primitives or handoff transport.

Shared runtime must not:

- invent domain semantics;
- become a second content owner;
- force one lane's error model onto another;
- infer personal learner progress from repository state;
- read historical/legacy material as fallback;
- turn optional platform capability into mandatory learner ritual;
- duplicate an external-primary learning experience merely because the source is loadable;
- convert a source/reference viewer into the primary learning surface without explicit Learning-Logic authority;
- make the learner maintain two competing primary surfaces for the same cognitive action.

When an external surface is primary, `static-web/` may still provide the approved companion behavior—orientation, locator, checkpoint, attempt, evidence capture, repair routing, Continue, Return/Handoff, or another bounded action—without becoming a substitute course/reader.

### 4.1 Shared projection grammar

`static-web/PRESENTATION_CONTRACT.md` owns the shared **representation and interaction grammar** for the KianOS web surface after cognition and surface ownership have already been approved upstream.

It defines the default Mac / wide-landscape workspace model, cognitive-state foregrounding, semantic presentation roles, progressive disclosure, and Dense Calm interaction baseline.

It must not decide domain semantics or override a domain Learning Contract. A Politics `Map`, Xizong mechanism `Chain`, English Reading task surface, and Lexical contrast may use different concrete representations while inheriting the same rule:

```text
current cognitive state
+ semantic role
+ approved surface ownership
→ learner-facing representation
```

The primary KianOS web design origin is the learner's real Mac landscape workspace. Narrower-window responsive behavior is a required fallback, not permission to design the main surface as a vertically stretched mobile/document page.

## 5. Surface maturity rule

The shared baseline is a maturity contract, not permission to jump ahead in construction.

Whether a surface is allowed to implement Projection/Runtime/Evidence yet is governed by `LEARNING_ASSET_STANDARD.md`.

Whether the implemented surface is ready to claim PASS is governed by `LEARNING_ACCEPTANCE.md`.

This document only defines the cross-KianOS capabilities and surface boundaries a mature surface should eventually expose when they are relevant.

## 6. Design test

Before adding a shared platform abstraction, ask:

> **Is the learner making the same kind of decision across these lanes?**

- yes → sharing may reduce friction;
- no → keep the implementation/domain logic separate.

Before moving a learner action onto a different surface, also ask:

> **Did the Learning Contract authorize this surface to own that cognitive action, or is implementation capability being mistaken for learner need?**

Before choosing a learner-facing component/layout, also ask:

> **What cognitive state and semantic role is being represented, and would the representation still be correct if the current component library did not exist?**

KianOS should converge on common infrastructure only where cognition is actually common, and should centralize learner actions only where surface ownership is actually justified.