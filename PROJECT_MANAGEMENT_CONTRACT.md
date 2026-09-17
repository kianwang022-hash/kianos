# KianOS Project Management Contract

Status: **CURRENT**  
Scope: cross-lane execution management and delivery discipline

This contract exists to make the accepted KianOS architecture **easy to operate**.

It does not own project purpose, domain learning semantics, Artifact Truth, Acceptance Truth, Learner Truth, or lane Work Cursors.

Management objective:

> **Keep backend rigor; make normal use, modification and continuation simple.**

---

# 1｜Management success

A management rule is useful only when it lowers one or more of:

- continuation cost;
- change cost;
- coordination cost;
- learner friction;
- regression risk.

Engineering sophistication is not an outcome by itself.

KianOS should normally feel like:

```text
Kian says the desired effect
→ worker finds the correct owner
→ one bounded change
→ targeted proof
→ visible result
```

not:

```text
request
→ repository archaeology
→ multiple competing owners
→ broad coordination
→ repeated CI / rebase rituals
→ result eventually appears
```

---

# 2｜Three normal change paths

Most ordinary work should enter one of three paths.

## Content

```text
canonical Content / Learning owner
→ targeted validation / projection update when required
→ main
→ Current mirror
→ existing learner surface consumes the new Current
```

Ordinary content change must not require hand-editing a second copy inside page code.

## Visual

```text
shared visual primitive when truly global
OR subject/surface visual owner when local
→ representative screenshot
→ Human visual gate when taste is material
→ targeted regression
→ main
```

Do not solve visual change by editing every subject independently.

## Runtime / behavior

```text
exact behavior owner
→ preserve semantic contract
→ focused functional evidence
→ main
```

Do not encode content truth or visual policy inside runtime merely because implementation access is convenient.

---

# 3｜UI program: top-down only

The current learner-facing UI program is layered:

```text
L1 Shared Visual Foundation
→ L2 Shared Shell
→ L3 Home / cross-product surfaces
→ L4 Subject visual language
→ L5 Surface families
→ L6 page/state exceptions
```

Rules:

1. a lower layer inherits higher-layer visual decisions;
2. local task geometry may differ when cognition requires it;
3. local CSS must not silently redefine shared typography, global navigation or shared primitives;
4. a higher-layer visual defect is fixed upstream, not patched repeatedly downstream;
5. Functional/Structural PASS does not equal Visual/Human PASS;
6. a layer is not visually closed until representative real surfaces are reviewed.

The UI program does not reopen accepted Content / Learning / Runtime semantics merely for visual convenience.

---

# 4｜Change Cost Test

Every architecture/ownership cleanup must eventually make a real change cheaper.

Representative acceptance questions:

```text
“全站正文更厚一点”
→ should resolve to one shared visual owner

“改一个 KP / word sense / Politics learner payload”
→ should resolve to one canonical semantic owner

“Politics Natural Unit 右栏更窄”
→ should resolve to one Politics surface owner

“某一个 390px 页面溢出”
→ should resolve to the narrowest responsive/page owner
```

If an ordinary change still requires tracing many CSS files, editing duplicated content, or coordinating unrelated lanes, ownership is not finished even when CI is green.

Hard rule:

> **Architecture quality is measured partly by the cost of the next legitimate change.**

---

# 5｜Scope and blocker handoff

One Chat/worker owns one bounded acceptance question at a time.

When a scope discovers a blocker owned elsewhere:

```text
current scope
→ record exact blocker + required effect
→ stop local expansion
→ narrow owning scope fixes it
→ return only closure result / changed contract
→ original scope revalidates the affected slice
```

Do not make the blocked Chat follow another owner's debug process, CI logs, screenshots and branch history.

Unrelated `main` movement is not a blocker. Reconcile only for real dependency, shared-authority change or write-set overlap.

---

# 6｜Context budget

Context is a project resource.

Default known-scope entry is defined in `AGENTS.md` and should normally reach effective work after roughly 2–3 precise reads.

For substantial cross-layer work, compress upstream reading into:

```text
Goal
Owner / authority chain
Must preserve
Affected / not affected
Write-set
Success / stop condition
```

Then work from the compressed context.

Avoid putting multiple PR histories, large CI logs, browser artifacts and unrelated owner debugging into one long-running Chat. Split by real owner/slice, not by arbitrary file count.

---

# 7｜Control Tower

The Control Tower is a **read model**, not another project database.

For each relevant scope, report only:

```text
Stage
Next
Blocker
Owner
Human Gate (when relevant)
```

Detailed PR/SHA/CI information stays backend unless it changes the decision or Kian asks for it.

Whole-system status must distinguish:

```text
engineering readiness
learner progress
cross-subject scheduling/readiness
```

Never infer learner progress from engineering PASS.

---

# 8｜Delivery path

Accepted repository changes land on GitHub `main`.

The intended normal delivery path remains:

```text
Chat edits the correct canonical owner
→ accepted change lands on main
→ repository-wide Current mirror updates
→ Astro consumes the exact Current
→ Kian sees the change without manual Git work
```

The local Current mirror is a delivery projection, not a second Truth owner.

Kian should not normally need to choose branches, pull manually, restart Astro, or edit a duplicate webpage copy.

---

# 9｜Completion means requested effect

These are evidence, not automatic completion:

- file created;
- code refactored;
- PR merged;
- CI green;
- browser test green;
- visual owner consolidated.

Completion language must match the requested effect.

Examples:

- visual task → representative surface is genuinely visually acceptable;
- sync task → main change reaches the real learner site automatically;
- content task → canonical change is consumed without page-specific duplicate editing;
- ownership task → next legitimate modification is materially cheaper.

Stop once the bounded effect is good enough. Do not enter endless polish or architecture perfection.

---

# 10｜Governance growth is default-denied

Do not answer ordinary friction with another Contract, router, registry, Current class, validator, status layer or abstraction.

Before adding durable governance, prove:

1. a recurring real responsibility is not representable by an existing owner;
2. reuse/simplification would create ambiguity or duplicate Truth;
3. the new object lowers long-term continuation or change cost.

Otherwise, simplify the narrow existing owner.

---

# 11｜Engineering stop condition

KianOS is a learning product, not a permanent software-construction project.

Large-scale engineering should close when the system is:

- learning-correct enough for real use;
- visually acceptable for daily use;
- stable enough for normal work;
- cheap to change through clear owners.

After that, default behavior is:

```text
real learner use
→ observe real friction
→ reopen only the smallest responsible owner
```

Do not continue broad construction merely because further architectural neatness is possible.
