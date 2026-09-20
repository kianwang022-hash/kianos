# Xizong F Remaining Clinical Current

Role: F System Work Cursor / restart entry  
Parent: `content/xizong/CURRENT.md`  
Program owner: `content/xizong/CONTENT_MAINLINE.md`  
Acceptance owner: `content/xizong/knowledge/systems/f-remaining-clinical/ACCEPTANCE.md`

This file owns work cursor only. It does not own medical Core, Learning semantics, Projection truth, Runtime truth or Kian learner progress.

---

## Current Work Cursor

**Scope:** F — Remaining Clinical  
**Lane-A role:** **NEXT MEDICAL CONTENT PRIORITY**  
**Stable Current identity:** **9 Blocks / 121 canonical KP**  
**Active gate:** **L — fresh independent Learning acceptance**  
**Source state:** **S1 PASS after approved Source rebind; bounded unresolved exact fields remain explicit / fail-closed**  
**Earliest eligible next action:** **fresh independent L audit of the built F Learning candidate**  
**Downstream:** Content / P / R / E frozen behind accepted Learning

```text
S1 medical / first-learning Source boundary = PASS
S2 exact official-question membership        = UNTESTED / separate later boundary
K Knowledge                                  = PASS_AFTER_BOUNDED_REPAIR
L Learning Logic                             = UNTESTED / CANDIDATE_READY_FOR_INDEPENDENT_AUDIT
Content                                      = NOT_STARTED / downstream-frozen
P / R / E                                    = downstream-frozen
U Learner Use                                = no claim
```

Active builder branch: **work/f-phase3-learning-logic-20260920-v2**

Fresh K acceptance:

`content/xizong/knowledge/learner/F_PHASE2_FRESH_INDEPENDENT_K_ACCEPTANCE.md`

Learning candidate:

`content/xizong/knowledge/learner/f-remaining-clinical-learning.json`

Fresh L audit entry:

`content/xizong/knowledge/learner/F_PHASE4_FRESH_INDEPENDENT_L_AUDIT_BRIEF.md`

---

## Stable Current identity

Canonical Block root:

`content/xizong/knowledge/systems/f-remaining-clinical/blocks/`

Current canonical identity:

```text
F1–F9 Blocks = 9 / 9
canonical KP IDs = 121 / 121 unique
duplicate KP IDs = 0
```

Current shared System fields also group only:

```text
F1–F2  acute exposure
F3–F4  barrier / tissue injury
F5–F6  perioperative
F7–F8  anesthesia
F9     low-connectivity tail
```

The global Knowledge manifest now reconciles to **159 numbered Blocks / 2517 numbered canonical KPs**. With A1–D = 130 Blocks / 2184 KP and E = 20 / 212, F must be exactly **9 / 121**.

---

## Historical Guide boundary

Transition Guide:

`content/xizong/knowledge/system-guides/西综剩余总论_独立模块_System_Guide_v1_完整导学_认知依赖与学习顺序.md`

The Guide's old 12-Block operational route is **not Current F Block identity**.

Its old Blocks 1–3 were physiology-foundation items (internal environment / membrane transport / signaling) that are not present among Current canonical F Block owners. Current F1–F9 correspond to the Guide's former remaining-clinical Blocks 4–12 by topic.

A current F `system.json` Knowledge candidate now exists. The Guide remains transition/reference substrate for Source clues only; its old 12-Block route must not be revived as stable identity or learner order.

---

## Source rebind result — S1 PASS

The repository itself still does not mount the required original F page images, but approved Current lecture sources were recovered from the user's File Library and re-read by title/page locator. Source authority is therefore available even though the binary pages are not copied into this repository.

Re-bound Source titles include:

- `27 外科跟课合集改.pdf`;
- `外科学讲义_AI阅读版.md`;
- `内科学讲义_AI阅读版_最终UnifiedSource_v2.md` / equivalent Current internal-medicine unified source.

Opaque File-Library object IDs are intentionally not persisted. Durable provenance uses source title + printed/PDF page locator.

### Verified closures and bounded remaining gaps

1. **F1 — Toxicology general**
   - internal medicine book P286–287 / sequence P287–288;
   - original-page review required for visual maps / bounded exact Source reading.

2. **F2 — Organophosphate / cholinergic crisis**
   - book P288–292 / sequence P289–293;
   - original-page review required for severity / atropinization and related Study-specific mappings.

3. **F3 — Asepsis + open wound initial care**
   - surgery book P228 / 27-follow PDF P283;
   - original page absent; delayed-primary / secondary-closure taxonomy remains Source-limited and one Source conflict remains explicit.

4. **F4 — Burns**
   - surgery book P200–202 / PDF P248–250;
   - **first-24h complete fluid coefficient / body-weight–area formula / half-day distribution remains visual-only Source Gap**.

5. **F6 — Postoperative recovery / incision / complications — REBOUND / CLOSED**
   - surgery book P211–215 / PDF P262–266;
   - original Source confirms **1–4 d** early noninfectious fever tendency and **2–7 d** increased infection likelihood; prior typography uncertainty is closed.

6. **F8 — Local / regional / neuraxial anesthesia — REBOUND / CLOSED**
   - surgery book P217–220 / PDF P269–272;
   - P270 nerve-block complication matrix was re-read from the approved original PDF and is no longer a Source-reading gap; exact visual pairing remains original-Source-owned.

7. **F9 — Laparoscopy + surface lesions**
   - surgery book P229–230 / PDF P284–285;
   - laparoscopy complication list remains Source-reading gap.

Remaining exact gaps belong to Current exam Source, so they stay explicit and must not be repaired from model prior. They do not prevent System-level Source closure because their authority, scope and failure behavior are now explicit enough for Knowledge reconstruction to proceed fail-closed.

### Preserved nonblocking boundaries

- F5 internal Study conflicts such as hypertension thresholds remain explicit rather than silently reconciled;
- F7 does not expand into complete modern anesthesiology / difficult-airway / MAC / extubation curricula;
- modern toxicology, burn-center, ERAS, LAST, transplant, dermatopathology and full pharmacology remain genuine out-of-scope negative space.

---

## Accepted Knowledge — PASS_AFTER_BOUNDED_REPAIR

Canonical Knowledge owner:

`content/xizong/knowledge/systems/f-remaining-clinical/system.json`

Fresh independent acceptance:

`content/xizong/knowledge/learner/F_PHASE2_FRESH_INDEPENDENT_K_ACCEPTANCE.md`

Verdict:

```text
FRESH_K_PASS_AFTER_BOUNDED_REPAIR
```

Fresh independent audit preserved the 9-Block / 121-KP identity and found one bounded System-level defect: the original mother model treated harmful acute disturbance and planned surgery/anesthesia as if they shared one universal source-control chain.

The repaired accepted K model uses two related but non-identical contexts:

```text
F1–F4  acute disturbance-control
       harmful input / contamination / tissue injury
       → immediate threat
       → vital support + source control when applicable
       → bounded specific control
       → iatrogenic risk / recovery

F5–F8  intervention-safety
       urgency + physiologic reserve
       → intended surgery / anesthesia + action space
       → vital support / monitoring
       → iatrogenic risk
       → recovery / deviation

F9     low-connectivity residual tail
       ownership split first
```

Source control is now conditional rather than universal. Planned surgery/anesthesia is an `INTERVENTION_CONTEXT`, not mislabeled as a harmful `DISTURBANCE_SOURCE`.

Preserved boundaries:

- F1/F2/F3/F4/F9 exact Source gaps remain fail-closed;
- F6/F8 verified Source rebind closures remain closed;
- external shock/airway/renal/liver/infection/NMJ/tumor truth remains with its real owner;
- S2 exact official-question membership remains UNTESTED;
- no learner route, hard readiness, LG decomposition or Source-contact choreography was accepted at K.

---

## Learning candidate — BUILT / NOT ACCEPTED

Candidate owner:

`content/xizong/knowledge/learner/f-remaining-clinical-learning.json`

Construction receipt:

`content/xizong/knowledge/learner/F_PHASE3_LEARNING_LOGIC_CONSTRUCTION.md`

Fresh audit entry:

`content/xizong/knowledge/learner/F_PHASE4_FRESH_INDEPENDENT_L_AUDIT_BRIEF.md`

Builder-candidate shape:

```text
9 Blocks / 121 canonical KP
40 Logic Groups
5 WHOLE_BLOCK_SOURCE
3 NATURAL_SOURCE_UNITS
1 INTEGRATION_PRIMARY (F9)
0 inside-F hard prerequisite edges
2 non-gating Partial-System Reconstructions
```

The candidate preserves the accepted dual-context K repair and keeps F9 ownership-first/low-connectivity. Zero hard edges and F9 integration-primary are candidate claims, not accepted truth.

## Next action

```text
fresh independent L audit
→ PASS / bounded repair / BLOCKED
→ only on L PASS: Content Realization / closure
```

Do not copy D/E topology for symmetry. Content / Projection / Runtime / Evidence remain frozen until L acceptance.
