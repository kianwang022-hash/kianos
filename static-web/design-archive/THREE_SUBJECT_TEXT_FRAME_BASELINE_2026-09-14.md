# KianOS 三科文字框设计回退基线｜2026-09-14

Status: **IMMUTABLE DESIGN / ROLLBACK REFERENCE**  
Scope: English + Politics + Xizong learner-facing text frames and accepted spatial/interaction intent  
Purpose: preserve Kian's current bottom-line design so later Astra/Codex visual optimization can be safely compared, rejected, or rolled back without reconstructing the long Chat again.

---

## 1｜Pinned snapshot

The exact rollback snapshot is:

```text
repository: kianwang022-hash/kianos
commit: 55e78e5034ec4f352c1b15025237002857aa83f3
primary frame handoff:
  static-web/CODEX_THREE_SUBJECT_IMPLEMENTATION.md
version inside file:
  v2.1 · 2026-09-14
```

This commit is the durable historical identity of the current three-subject text-frame baseline.

Even if the working execution prompt is later simplified, de-framed, reclassified, or replaced by a stronger Astra master, **this pinned snapshot remains the rollback source**.

Do not rewrite history by claiming a later optimized UI was the original accepted text-frame design.

---

## 2｜What this archive protects

The snapshot preserves the full frame/design handoff as it existed at the pinned commit, including:

- English Home / Reading A / Cloze / Part B / Translation / Writing / First Learning related frames and behavior;
- Politics Home / five-subject cognitive geometry / Natural Unit / Xiao1000 clean and submitted-result related frames and behavior;
- Xizong Home / System Guide / Block Workspace / Logic Group / KP Recall / Question Sweep / Hidden / Recall related frames and behavior;
- the distinctions among `DESIGN_VERBATIM`, `DESIGN_BEHAVIOR`, and `EXECUTION_SYNTHESIS`;
- Mac-wide / high-density / no-semantic-thinning constraints;
- answer-gating, simultaneous-visibility, Front/Reveal, exact Return and other spatial/interaction responsibilities represented by the frames.

This archive preserves **the whole v2.1 handoff**, not only frames later classified as hard geometry invariants.

---

## 3｜Archive role after Astra optimization

This file is **not** intended to force future Astra/Codex to pixel-copy ASCII boxes.

Future execution may classify old frames into categories such as:

```text
GEOMETRY_INVARIANT
DESIGN_REFERENCE
HISTORICAL / SYNTHESIS_REFERENCE
```

and may give Astra broad visual/composition freedom where semantics are protected.

However:

> **execution freedom must never destroy rollbackability.**

If a future UI experiment becomes worse, confusing, too generic, too sparse, too card-heavy, or materially drifts from Kian's accepted learning experience, the pinned snapshot is the bottom-line comparison source.

---

## 4｜Rollback / comparison procedure

To inspect the exact archived handoff locally:

```bash
git show 55e78e5034ec4f352c1b15025237002857aa83f3:static-web/CODEX_THREE_SUBJECT_IMPLEMENTATION.md
```

To restore that historical file into a temporary comparison copy:

```bash
git show 55e78e5034ec4f352c1b15025237002857aa83f3:static-web/CODEX_THREE_SUBJECT_IMPLEMENTATION.md \
  > /tmp/CODEX_THREE_SUBJECT_IMPLEMENTATION.baseline.md
```

Do not mechanically restore the whole old repository state when only UI composition is being compared. Current Content / Question Truth / Evidence / Runtime owners remain Current-first.

---

## 5｜Future-change rule

- Do not delete this archive merely because the live prompt changes.
- Do not silently repoint this archive to a newer commit.
- If Kian later explicitly accepts a materially new bottom-line design and wants a new rollback floor, create a **new dated archive entry** instead of mutating this one.
- A later UI may be much more polished than these frames; visual superiority does not erase the historical baseline.
- The baseline protects product intent and rollback. It does not manufacture learner `U`, Content truth, or visual acceptance of future implementations.

---

## 6｜Current note

At the time this archive was created, a new Astra three-subject site master also existed on `main`, but Kian had **not yet finalized the final Pro-reviewed execution prompt**. Therefore this archive intentionally freezes the older detailed text-frame handoff as the safety floor while visual/interaction latitude is still being discussed.
