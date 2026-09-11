# KianOS System Contract

KianOS is one learning system with multiple domain lanes. The lanes may have different cognition, content models, and UI, but they inherit the same minimum platform capabilities.

## Global Current

`CURRENT.md` at repository root is the system-wide Current overview.

- It describes the whole KianOS, not one subject.
- Domain manifests and continuations are child Current objects under the root Current.
- A lane manifest may define local ownership/readiness, but it must not become a parallel top-level Current authority.
- `main@HEAD` remains the only normal shared Current state.
- Runtime readiness must be derived from real Current assets and validation rather than maintained as a second semantic truth.

The hierarchy is:

`KianOS Current → lane Current owner/manifest → natural content owners → learner runtime`

## Shared lane baseline

Every first-class learner lane should provide the following capabilities. The learner-facing names and cognitive implementation may differ by subject.

### 1. Current

The lane has an explicit Current owner/readiness entry and fail-closed source boundary.

The learner should be able to tell that the runtime is using Current content rather than legacy, stale, or guessed material.

### 2. Continue

The lane supports continuation without requiring the learner to reconstruct where work stopped.

Two kinds of continuation remain separate:

- shared construction/work continuation: GitHub continuation cursor;
- personal session position/progress: private local/device state.

Do not put personal progress into shared Current merely to implement Continue.

### 3. Navigate / Explore

The learner can reach the relevant current learning object with low friction.

This may be a System/Block map, chapter index, passage navigator, vocabulary search, or another domain-appropriate navigation surface. Do not force every lane to expose a literal search box.

### 4. Repair / Review

The lane can surface only the evidence that actually needs repair or review.

Stable correct material should pass quickly. Do not turn the existence of content into automatic review debt.

### 5. Verify / Challenge / Transfer

The lane has an appropriate way to test whether the target capability actually works.

Examples include official questions, generated lexical Challenge, closure questions, translation re-generation, writing transfer, or later unseen material. Verification must follow the lane's own cognitive contract rather than a shared card template.

### 6. Return / Handoff

Meaningful learner evidence can return to Chat in a compact form that is sufficient to change the next action.

The packet/hand-off format may differ by lane. At minimum it should preserve enough identity and evidence to distinguish:

- what object was being learned or tested;
- what failed, was uncertain, or was explicitly marked for repair;
- what kind of next repair or judgment is needed.

Private learner evidence remains private and is not committed into shared Current.

### 7. Deferred

All lanes use the repository-wide Deferred Queue defined in `DEFERRED.md` and GitHub Issue #5.

Do not create separate lane backlogs for ordinary postponed work unless the learner explicitly asks for one.

### 8. Validation

The lane and runtime must fail closed on missing/invalid Current dependencies and should have an appropriate validation path.

Validation may include source identity/hash checks, schema checks, deterministic hydration checks, runtime build checks, and real learner validation. A build passing is not the same thing as learning quality being proven.

## Shared capability, different cognition

The baseline is intentionally non-isomorphic.

Examples:

- LexicalOS: Depth Scan → selective Repair → generated Challenge → Return Packet.
- Xizong: System/Block/KP learning → official-question verification → Wrong/Uncertain repair → Study Packet / Chat return plan.
- English Reading: clean passage attempt → passage-level review → root-cause repair → later transfer → session handoff.
- Politics: orientation → Chengfeng continuous learning → short closure → Xiao1000 verification → minimal repair → learner handoff.

These lanes should share platform capabilities without being forced into one error taxonomy, one scheduler, one review card, or one UI layout.

## Basic-capability audit rule

When a first-class lane is added or materially rebuilt, check the eight baseline capabilities above.

If a capability is intentionally absent because the lane does not need it, state why. If it is genuinely missing, mark the lane Partial and either:

- make it the active next task; or
- park it in the global Deferred Queue when the learner explicitly postpones it.

Do not call a lane fully learner-ready merely because its content exists or its page builds.
