# English Learner Surface Closure

Status: **RETIRED — historical implementation matrix only**  
Current control owner: `content/english/CURRENT.md` + `static-web/CURRENT.md`  
Current Rule / Model: `content/english/LEARNING_CONTRACT.md`  
Current Visual authority: `static-web/PRESENTATION_CONTRACT.md` + `static-web/ENGLISH_PRODUCT_BRIEF.md`  

> Do not resume the old closure branch or treat the states below as Current architecture. Keep this file only as bounded historical evidence for accepted surface details.

This file is an implementation/outlet matrix only. It MUST NOT change English learning logic, evidence semantics, Resume priority, task ownership, protected-material boundaries, or learner truth.

English is already accepted through `S/K/L/P/R/E`; this closure exists only to make the final Mac learner surface faithfully consume the accepted product semantics with lower visible ceremony and no hidden asset loss.

---

## 1 | Closure rule

Every accepted English capability must end in one of these states:

- `PRIMARY` — directly visible in the normal learner task surface;
- `CONTEXTUAL` — visible only when the current task/problem makes it useful;
- `OPTIONAL_TOOL` — explicitly available but never a required learner step;
- `BACKEND_ONLY` — retained for runtime/evidence integrity but must not compete with learner content;
- `DEFERRED_VISUAL` — semantics are correct; final visual convergence remains;
- `DEFECT` — current learner projection contradicts accepted product semantics and must be corrected with zero semantic diff.

There is no valid state equivalent to `exists in data/code but no one knows where it belongs`.

---

## 2 | Lane-level surfaces

| Capability / asset | Canonical role | Final learner outlet | Current state | Closure |
| --- | --- | --- | --- | --- |
| English Home | routing + capability orientation | one dense Mac-wide task hub | present | `DEFERRED_VISUAL` |
| Meaningful Resume | highest-value unfinished learner action | Home, visually dominant only when real unfinished work exists | present | `PRIMARY` |
| Objective / Translation / Writing Guides | optional first learning + targeted intervention | first-class optional Guide entries; never prerequisites | present | `PRIMARY` |
| Lexical lookup | read-only cross-lane lookup | selection/context action with exact return to originating task | present in product contract; per-surface integration must be verified | `OPTIONAL_TOOL` |
| backend availability / source health | implementation integrity | not learner chrome unless task cannot open | partially visible | `BACKEND_ONLY` |
| provenance / hashes / source paths | evidence/debug | hidden secondary diagnostics, not normal learner surface | visible in several task details panels | `BACKEND_ONLY` |

### Home visual target

Preserve the current family routing and Resume semantics, but converge toward the recent KianOS visual language:

- dark forest-green structural navigation;
- pale/white work surface;
- high useful density with strong hierarchy;
- no giant hero whitespace;
- no generic card pile;
- Guides remain visible but secondary to real productive Resume / task entry;
- Mac horizontal width should carry task relationships instead of producing blank margins.

---

## 3 | Reading A

Semantic owner: Objective current owners.  
Accepted native geometry: complete passage left + full question set right, both independently scrollable.

| Capability / asset | Final outlet | Current implementation | Closure |
| --- | --- | --- | --- |
| full passage | left reading pane | present | `PRIMARY` |
| all questions visible together | right question sheet | present (`row.hidden = false`) | `PRIMARY` |
| active question | keyboard/focus only | present | `CONTEXTUAL` |
| Q1–Qn top navigator | not required for visibility; at most quiet accelerator | still prominent | `DEFECT` — demote/remove from normal chrome |
| Prev / Next question buttons | not required for visibility; keyboard focus may remain | prominent in header | `DEFECT` — demote |
| whole-task timer | quiet task context | present | `PRIMARY` |
| current choices / trajectory | selection + automatic evidence | present | `PRIMARY` / backend evidence |
| Uncertain | per-question signal | present | `PRIMARY` |
| submit gate | one whole-passage submit | present | `PRIMARY` |
| Wrong / Uncertain review | in-place while passage + all questions remain | present | `PRIMARY` |
| quick local cause | optional cheap triage | present | `CONTEXTUAL` |
| whole-passage Chat | optional escalation when useful | present | `OPTIONAL_TOOL` |
| highlight / context selection | lightweight learner annotation | present | `OPTIONAL_TOOL` |
| History | secondary local history | present below task | `OPTIONAL_TOOL` — must not lengthen primary workspace |
| provenance | debug/evidence | visible details | `BACKEND_ONLY` |

### Reading A convergence rule

Do not change whole-attempt state, answer gating, Uncertain, trajectory, timer, continuous-session behavior, review evidence, or Resume semantics. Final work is mainly chrome/density/scroll composition.

---

## 4 | Cloze

Accepted native geometry: complete passage left + all 20 blank rows together right; four candidates arranged like exam paper on Mac.

| Capability / asset | Final outlet | Current implementation | Closure |
| --- | --- | --- | --- |
| complete passage | left pane | present | `PRIMARY` |
| all 20 blanks together | right question sheet | technically present (`row.hidden = false`) | `PRIMARY` |
| four options per blank | one horizontal A/B/C/D row on Mac; 2x2 only when necessary | currently vertical stacked option cards | `DEFECT` |
| active blank | focus / keyboard only | projected as prominent `ACTIVE SLOT` | `DEFECT` — demote |
| 01–20 dot navigator | unnecessary for revealing rows | prominent | `DEFECT` — remove/demote |
| Prev / Next blank | optional accelerator only | prominent | `DEFECT` — demote |
| Uncertain | current/focused blank signal | present | `PRIMARY` |
| trajectory | automatic evidence | present | backend evidence |
| one whole-passage submit | bottom of right sheet | present | `PRIMARY` |
| answer reveal after submit only | same sheet | present | `PRIMARY` |
| Wrong / Uncertain review | retain whole passage + all rows; no one-blank wizard | semantics present; visual treatment needs convergence | `DEFERRED_VISUAL` |
| whole-passage Chat | optional when problems are coupled/recurring | shared Objective handoff path | `OPTIONAL_TOOL` |

### Cloze convergence rule

This is a Projection/UI correction only. Do not change attempt/evidence semantics. The dominant change is to make the right side feel like an exam answer sheet, not twenty mini app cards plus a slot wizard.

---

## 5 | Part B

Accepted native geometry: complete source/candidate inventory + full placement/order map; coupled errors remain visible.

| Capability / asset | Final outlet | Current implementation | Closure |
| --- | --- | --- | --- |
| all four Current forms | native form-specific workspace | present | `PRIMARY` |
| original directions | top contextual instruction | present when available | `PRIMARY` |
| full source/comments/material | main source pane | present | `PRIMARY` |
| candidate pool | simultaneously visible | present | `PRIMARY` |
| complete 41–45 map | simultaneously visible | present | `PRIMARY` |
| ordering skeleton / fixed givens | dedicated order map | present | `PRIMARY` |
| single-use / repeat policy | visible only as real source constraint | present | `PRIMARY` |
| per-target Uncertain | local signal | present | `PRIMARY` |
| whole-set submit | one submit | present | `PRIMARY` |
| coupled review | preserve full map | present in geometry | `PRIMARY` |
| whole-set Chat | optional structure diagnosis | optional | `OPTIONAL_TOOL` |

### Part B convergence rule

No architecture change is justified. Preserve its task-native geometry and apply only density/typography/status polish consistent with current KianOS visual language.

---

## 6 | Translation

Accepted native geometry: full source left + complete learner translation right. Normal learner experience should feel like translation, not a runtime state machine.

| Capability / asset | Final outlet | Current implementation | Closure |
| --- | --- | --- | --- |
| complete source | left pane, always visible | present | `PRIMARY` |
| all segment inputs | right work pane | present | `PRIMARY` |
| first translation preservation | automatic immutable evidence after meaningful completion | present | backend integrity + quiet confirmation |
| Reference protection | hidden during clean attempt; explicit post-attempt reveal | present | `OPTIONAL_TOOL` |
| stable PASS | cheap exit | present | `PRIMARY` |
| real problem | affected segment/scope + learner reconstruction | present semantically | `PRIMARY` |
| stage labels `01/02/03/04`, `TRANSFER_PENDING`, `REPAIR_COMPLETE` | runtime internals | highly visible | `DEFECT` — demote to backend/quiet state |
| `复制 Handoff → paste Chat Return JSON → 导入` | compatibility/runtime mechanism | normal visible learner ritual | `DEFECT` — must not be normal path |
| Chat semantic diagnosis | discuss full set directly in Chat when useful | currently mediated by packet/import UI | `OPTIONAL_TOOL` — direct Chat handoff/return to workspace |
| pending transfer claims | backend observation state; silent unless naturally relevant | pending panel exists, hidden initially | `BACKEND_ONLY` by default |
| local History | secondary tool | present | `OPTIONAL_TOOL` |
| provenance | debug/evidence | visible details | `BACKEND_ONLY` |

### Translation target interaction

Normal learner flow after convergence:

```text
translate the complete set
→ preserve first version automatically / quietly
→ stable: PASS / next
→ problem: optional Chat discussion or local reference
→ learner revises affected segment(s) in the same workspace
→ return to performance
```

Machine-readable return may remain internally for evidence/Resume compatibility, but learner must not be required to copy JSON merely to make the site understand the same discussion.

---

## 7 | Writing

Accepted native geometry: prompt/requirements left + dominant authoring workspace right. Direct mode and lightweight planned mode are both valid.

| Capability / asset | Final outlet | Current implementation | Closure |
| --- | --- | --- | --- |
| prompt / role / audience / visual task | left context pane | present | `PRIMARY` |
| essay editor | dominant right pane | present | `PRIMARY` |
| optional plan | lightweight optional region | present | `OPTIONAL_TOOL` |
| Direct mode | first-class clean path | present | `PRIMARY` |
| first meaningful plan/content preservation | automatic evidence | present | backend integrity |
| first draft preservation | automatic immutable evidence | present | backend integrity + quiet confirmation |
| timer + word count | quiet authoring context | accepted requirement; final surface presence must be verified | `VERIFY` |
| whole-essay Chat review | direct semantic coaching in Chat | present only through explicit packet/import flow | `DEFECT` |
| structured Chat Return JSON | internal/compatibility only | normal visible learner ritual | `DEFECT` |
| smallest repair / learner re-generation | return to editor with concise repair cue | semantic machinery exists | `PRIMARY` after UI simplification |
| Repair Check stage | backend evidence rule, not compulsory visible course step | highly visible stage | `DEFECT` — demote |
| `TRANSFER_PENDING` / `REPAIR_COMPLETE` | backend state | prominent completion surfaces | `DEFECT` — demote |
| History | secondary local tool | present | `OPTIONAL_TOOL` |
| provenance / protected-material diagnostics | integrity | visible details/meta | `BACKEND_ONLY` |

### Writing target interaction

```text
write
→ submit / preserve first draft
→ stable: leave
→ if review wanted/needed: open Chat with essay context
→ discuss highest-value issue(s)
→ return to the same Writing workspace
→ learner revises / rewrites
```

The website owns the artifact and revision workspace. Chat owns semantic essay coaching. Do not duplicate Chat's diagnosis as another learner dashboard.

---

## 8 | Guides

| Guide asset | Current outlet | Closure |
| --- | --- | --- |
| Objective Global Map / Reading A / Cloze / Part B Core + deep Skill Map | `/objective-learn/` | `PRIMARY` optional Guide |
| Translation First Learning + deeper repair/reference | `/translation-learn/` | `PRIMARY` optional Guide |
| Writing six primitives + Small/Big specialization + deep repair/reference | `/writing-learn/` | `PRIMARY` optional Guide |

Hard rule: visual convergence may reorganize but MUST NOT semantically thin these validated learning assets. Guides may exceed one viewport. Local navigation/scrolling is preferred over accordion fragmentation or deletion.

Guide never outranks productive Resume and never creates completion debt.

---

## 9 | Cross-surface closure

### Must remain visible when useful

- exact current task/material;
- task-native full geometry;
- learner input / current choices;
- Uncertain where applicable;
- timing where it informs performance;
- direct submit / exit;
- real Wrong/Uncertain delta after submit;
- smallest useful repair cue;
- clear return to interrupted task after Lexical/Chat handoff.

### Must become quiet or backend-only

- source hashes / provenance paths;
- evidence ledger details;
- pending transfer claims when current work is unrelated;
- internal state-machine names;
- synthetic closure terminology;
- JSON import/export ceremony used only to satisfy implementation bookkeeping.

### Must not be manufactured

- English-wide Memory lane merely for symmetry with Xizong;
- mandatory post-task Review;
- Guide completion percentage;
- fresh-material validation task created just to close backend evidence;
- duplicate lexical truth inside English.

---

## 10 | Implementation order

### Phase A — Objective visual convergence

1. Reading A: demote redundant question-nav / Prev-Next chrome while preserving focus/keyboard behavior.
2. Cloze: convert right pane into full exam-paper 20-row layout with horizontal A/B/C/D candidates; remove active-slot wizard dominance.
3. Part B: density/typography/status polish only.
4. Browser screenshots at real Mac-wide dimensions; no semantic diff.

### Phase B — Productive convergence

1. Translation: keep source + whole authored translation; demote runtime stages; remove JSON round-trip from normal learner path while retaining internal compatibility where required.
2. Writing: keep prompt + dominant editor; expose quiet timer/word count; Chat review becomes direct optional handoff; repair returns to editor without learner-facing state-machine ceremony.
3. Preserve Resume and immutable first-evidence semantics.

### Phase C — Home / Guides / family coherence

1. Compress giant whitespace on English Home while keeping meaningful Resume dominant when present.
2. Keep Guides first-class but optional.
3. Apply current KianOS visual language consistently without flattening task-native geometry.
4. Verify Lexical lookup + exact return from Reading / Cloze / Translation.

---

## 11 | Acceptance

English visual convergence is acceptable only when all are true:

- no semantic diff against accepted English contracts;
- Reading A, Cloze, Part B preserve their full native exam geometry;
- Translation and Writing feel like productive work, not exposed workflow engines;
- stable work exits quickly;
- problem-only UI adds weight only after a real problem;
- Guide content density is preserved;
- Mac width is materially used;
- typography is comfortable and information density is high without disorder;
- no primary learner page becomes an engineering console;
- real browser screenshots are reviewed, not only build/validator output.
