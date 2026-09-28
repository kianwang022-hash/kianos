# KianOS Worker Instructions

Role: **intent and task router only**. Cross-system boundaries: Personal `KERNEL.md §2`. Callable product-development architecture: `ARCHITECTURE.md → CBA`. Execution: `PROJECT_MANAGEMENT_CONTRACT.md`. Acceptance: native owner + `LEARNING_ACCEPTANCE.md`.

## 1｜Start with the request, not a lifecycle label

| Request | Default path |
| --- | --- |
| LEARN / USE | use the product/native learner state directly |
| Ordinary change / bug / UI tweak | concrete effect → semantic-impact tripwire → actual consumer → smallest correct change |
| Explicit `调用 CBA` / `CBA` | enter `ARCHITECTURE.md → CBA` |
| Explicit AUDIT / bound Audit Issue | current accepted design + exact artifact + real consumer/state |
| CONTROL / long project | bound Issue; otherwise `CURRENT.md` only to find the current task |

**Do not classify every task into CREATE / BUILD / AUDIT.** Those stages are active only inside an explicitly invoked/bound CBA run. A bare subject continuation remains learning, not engineering.

## 2｜Semantic-impact tripwire

Before an ordinary KianOS modification, ask whether the requested change could alter:

- primary learner/user action;
- Attention / information hierarchy;
- visibility or progressive disclosure;
- interaction order / reachable controls;
- state or Evidence meaning;
- cross-surface/shared ownership.

If clearly **no**, work directly in the existing consumer/implementation and prove the affected effect.

If **yes or uncertain**, read **one primary related Product/Learning/Visual/Interaction owner + the actual consumer**. Read another owner only when that first evidence proves a real dependency.

This is how a request such as “右侧宽一点” can be recognized as either a simple CSS adjustment or a change that starves the Primary Cognitive Stage and therefore touches Attention semantics.

For Xizong, use the existing bounded preflight in `content/xizong/CURRENT.md`; it follows the same one-owner-first rule.

## 3｜Modification boundaries

Keep the smallest useful working set:

```text
requested effect
→ related meaning only if impact requires it
→ actual consumer
→ must preserve
→ proof / stop
```

Existing accepted rule + broken implementation = repair the implementation. Do not invent another rule, runtime, page-local semantic copy or CSS override layer.

Normal corrections use `PROJECT_MANAGEMENT_CONTRACT.md → Concrete Repair Fast Lane`. Material unresolved product/learning/visual choices go to Kian. A real design choice may require a Candidate Human Gate; a correctness fix does not require reapproving accepted design.

During AUDIT, stay on the same task: self-attack the diagnosis, load only the newly relevant context, repair the smallest real defect, replay it and true dependents, then continue. Exhaustive Audit scope is not reduced by faster repair.

## 4｜Owner / Current / history

Owner resolution is backstage: use it when persisting durable meaning, resuming long-running work, resolving conflicts or crossing shared/system boundaries. It is **not** a precondition for every ordinary task.

A bound Issue is a compact control anchor: Goal / Phase / Next / Blocker + decision-changing failures only. It is not a second Contract.

Current locates; semantic owners define; code implements; real evidence proves. Use current truth, not closed PRs/Issues or Chat memory. If a long-task anchor is unreadable, only its dependent progress becomes UNKNOWN/BLOCKED.

## 5｜Execution and stop

Use GitHub when current repository truth or a real modification matters. Batch coherent changes; use Candidate/browser only as needed for the claim; do not mutate pinned Stable or real learner data.

Codex is an optional executor for heavy/mechanical work, not another truth owner. No active request means no background work.

Report the real result and remaining blocker. Stop when the requested effect is proven or a real unresolved semantic/authority decision is reached.
