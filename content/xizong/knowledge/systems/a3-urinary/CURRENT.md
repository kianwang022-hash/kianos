# Xizong A3 Urinary Current

Role: independently continued Xizong System Work Cursor + restart entry  
Parent: `content/xizong/CURRENT.md`

This file does not own medical Core, Xizong learning semantics, Acceptance Truth, or Kian's learner progress.

---

## Work Cursor

**Scope:** A3 Urinary  
**Active / earliest unresolved stage:** `U — real learner validation only`  
**S status:** PASS — bounded Current reconstruction; 243 official questions, inventory SHA256 `bd8082bf9b82d00411f5d3dcaa09f56626c0c08b688e108f728f7da6e2f9b84e`.  
**K status:** PASS — Current System owner preserves 14 Blocks / 257 stable KPs / 75 Logic Groups.  
**L status:** PASS — original Lecture is external-primary on iPad / MarginNote; KianOS owns orientation / Recall / closure / compression / repair; Chat is adaptive companion.  
**P status:** PASS — A3 projects honestly through shared System/Block surfaces without duplicating the original Lecture or fabricating Question→KP mappings.  
**R status:** PASS — executable Block/System Runtime, source-contact gates, Recall/completion guards, 243-question sweep, reviewed-only repair, resume and content-version invalidation are accepted.  
**E status:** PASS — Block evidence is single-writer; repeated real Recall attempts are preserved; Memory/repair do not rewrite original Recall; System→Block W/U repair uses a fail-closed cross-tab-safe inbox/bridge; stale Block/System evidence is archived/invalidated; A1/A2 regressions + shared inbox contract + A3 Runtime/Evidence + Astro build passed run `34720315859` (#194).  
**Engineering blocker:** none.  
**Current allowed conclusion:** **A3 is module-ready for learner test.**  
**Next action:** no further engineering acceptance work is authorized merely to move the cursor. U begins only when Kian actually chooses to study A3 and provides real learner-path evidence. Until then, preserve S/K/L/P/R/E as accepted Current and do not infer learner progress.

---

## Accepted engineering substrate

Frozen unless contradictory evidence appears:

- `S / K / L / P / R / E = PASS`;
- Source scope = 243 official questions across 2005–2026;
- 14 canonical Blocks / 257 stable KPs / 75 Logic Groups;
- original Lecture/MarginNote remains the primary continuous source surface;
- KianOS remains orientation / retrieval / closure / compression / repair, not a second Lecture reader;
- Lecture-attached questions remain in the original Lecture workflow;
- every stable KP receives formal first-pass learning contact and at least one active Recall before Block completion;
- Block Recall follows actual Block learning;
- System Recall occurs only after all 14 Blocks have actually closed in private learner state;
- official A3 System question sweep follows pre-question System Recall and learner-selected full-paper holdout;
- stable correct work has a no-repair path;
- Wrong / Uncertain alone enter repair;
- precise Question→Knowledge routing is reviewed-only; missing mappings stay missing;
- repair evidence is `REPAIR_ONLY` and does not rewrite original Recall/mastery;
- later meaningful fresh Recall/transfer remains stronger mastery evidence;
- learner progress, holdout choices, W/U history, notes and review state remain private Learner Truth.

---

## Accepted Evidence closure

Current Evidence owners / guards include:

- `static-web/src/components/XizongMemoryReviewV6.astro` — normal Block evidence owner;
- `static-web/src/components/XizongBlockEvidenceGuard.astro` — Block Current-version archive/reset;
- `static-web/src/components/XizongSystemEvidenceGuard.astro` — System/question Current-version archive/reset;
- `static-web/src/components/XizongSystemExitRuntime.astro` — System Recall/question-result evidence;
- `static-web/src/components/XizongSystemRepairReturn.astro` — actual-W/U + reviewed-only System repair handoff;
- `static-web/src/components/XizongRepairInboxBridge.astro` — atomic System→Block repair-inbox consumption;
- `static-web/scripts/validate-xizong-a2-evidence.mjs`;
- `static-web/scripts/validate-xizong-a2-repair-return.mjs`;
- `static-web/scripts/validate-xizong-repair-inbox.mjs`;
- `static-web/scripts/validate-xizong-a3-runtime.mjs`;
- `static-web/scripts/validate-xizong-a3-evidence.mjs`.

Accepted E invariants:

1. actual repeated KP Recall attempts remain distinct evidence even when the rating repeats;
2. old persisted Recall state may bootstrap once without manufacturing repeated attempts;
3. selective Memory can clear current weak debt without rewriting first Recall;
4. Chat repair can close an active repair task but remains `REPAIR_ONLY` rather than mastery;
5. stable correct System-question work does not create repair debt;
6. W/U repair accepts only actual current W/U question IDs and only repository-reviewed precise relations;
7. System page does not write a Block evidence document directly;
8. System→Block repair is delivered through a separate inbox with question provenance;
9. Block bridge writes the owning evidence store successfully before clearing the inbox;
10. repeated inbox consumption is idempotent by inbox identity;
11. an already-open Block tab receives inbox changes through browser storage events and reloads after successful consumption so stale in-memory state cannot overwrite imported evidence;
12. Block/System Current-version changes archive/invalidate stale learner/question/repair/inbox evidence;
13. pre-question / mid-sweep / post-question System Recall remain distinguishable;
14. learner-selected whole-paper holdout remains private and excluded wholesale from the ordinary System sweep.

Validation:

GitHub Actions run `34720315859` (#194) on PR #46 candidate head `c3d68ccbc88a592c54eee3dbd9e5154da789b53d` passed:

- A1 learner contract;
- all three A3 Source validators;
- A2 runtime/evidence/repair regressions;
- shared repair-inbox contract;
- A3 Runtime contracts;
- A3 Evidence contracts;
- Astro build.

Earlier failed candidate runs #180 / #181 were stale validator expectations during the E migration and failed before A3 Evidence executed; they are not Evidence failure claims against the accepted final model.

---

## U — real learner validation only

U is now eligible but **not satisfied**.

Engineering State ≠ Learner State:

```text
Repository / CI says:
A3 is ready for learner test.

It does NOT say:
Kian has started, completed, recalled, answered, repaired, or validated A3.
```

When Kian actually starts A3, collect path-scoped real-use evidence naturally rather than staging a ritual test. Useful U observations include:

- whether System orientation gives enough context before B1;
- whether the handoff to iPad / MarginNote feels natural and low-friction;
- whether the Block / Logic Group cues help attention without becoming a second Lecture;
- whether KP Recall timing feels cognitively right in real learning;
- whether Block completion/resume matches actual study behavior;
- later, whether System Recall → 243-question sweep is natural;
- whether W/U → Chat → repair inbox → owning Block → return to questions preserves the interrupted mainline;
- whether any surface is too dense, too early, redundant or unclear during sustained use.

Real learner friction may reopen the earliest responsible L/P/R/E decision. Do not pre-emptively polish speculative issues in place of U.

---

## Frozen / out of scope before real U evidence

- do not reopen S/K/L/P/R/E without concrete contradictory evidence;
- do not resume historical HLK archaeology;
- do not rewrite accepted medical Blocks/KPs merely to keep engineering active;
- do not move continuous Lecture reading into Astro;
- do not duplicate Lecture-attached questions into KianOS;
- do not infer Question→Block/KP relations;
- do not invent synthetic learner progress to close U;
- do not claim learner-validated until Kian actually uses the named path.

---

## Truth references

### Artifact Truth

- Source scope → `content/xizong/knowledge/learner/a3-urinary-question-scope.json`
- System Knowledge → `content/xizong/knowledge/systems/a3-urinary/system.json`
- medical Core → `content/xizong/knowledge/systems/a3-urinary/blocks/`
- lane Learning constitution → `content/xizong/LEARNING_CONTRACT.md`
- shared study policy → `content/xizong/knowledge/learner/study-policy.json`
- A3 learning support → `content/xizong/knowledge/learner/a3-urinary-learning.json`
- Projection / Runtime / Evidence mechanics → `static-web/`

### Acceptance Truth

`content/xizong/knowledge/systems/a3-urinary/ACCEPTANCE.md`

### Learner Truth

Private learner/browser/conversation evidence only.