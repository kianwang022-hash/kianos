# English Product / UI Status

Status: **PRODUCT / INTERACTION DESIGN FROZEN · FUNCTIONAL FIRST CLOSED THROUGH E · PRODUCTIZATION IMPLEMENTATION / MAC ACCEPTANCE OPEN**  
Role: current English learner-facing productization status / Codex handoff router  
Lane cursor: `content/english/CURRENT.md`  
Detailed design owner: `static-web/ENGLISH_PRODUCT_BRIEF.md`  
Shared presentation grammar: `static-web/PRESENTATION_CONTRACT.md`  
Preference owner: `static-web/KIAN_UI_PREFERENCES.md`  
Style owner: `static-web/UI_STYLE_BRIEF.md`

This file supersedes only stale stage/cursor wording in `ENGLISH_PRODUCT_BRIEF.md`, especially `ACTIVE DISCUSSION BRIEF` and `Next unresolved English surface`. It does not replace the accepted detailed product decisions there and does not change English Learning / Runtime / Evidence semantics.

## Current closure

English lane Functional First is closed:

```text
Objective     S/K/L/P/R/E PASS · U UNTESTED
Translation   S/K/L/P/R/E PASS · U UNTESTED
Writing       S/K/L/P/R/E PASS · U UNTESTED
```

The learner-facing family has already been discussed and accepted at product / interaction / Mac-wide composition level:

```text
English Home / meaningful Resume
Reading A
Cloze
Part B
Translation
Writing
First Learning / targeted intervention
Lexical read-only handoff / exact return
```

The remaining work is downstream productization implementation, real browser geometry, screenshot review and zero-semantic-diff acceptance. It is not another blank-slate product discussion.

## Frozen product model

English remains **Digital Workbook + Adaptive Coach**.

Hard product rules:

- Mac wide landscape is the design origin;
- real exam task / passage / prompt / learner output is foreground;
- task-native whole-object geometry outranks component convenience;
- stable work stays quiet and exits cheaply;
- Wrong / meaningful Uncertain may expose the smallest useful triage / repair;
- First Learning is complete but skippable and preferably entered from a real task need;
- Chat owns semantic coaching where Chat is lower-friction;
- LexicalOS remains a separate truth owner; read-only lookup alone does not create Lexical learner state;
- engineering/runtime state must not dominate learner chrome;
- Resume means highest-value unfinished or unresolved real work, not generic due debt.

Task-native geometry is frozen:

```text
Reading A    passage left + full question set right
Cloze        complete passage left + all 20 blank rows right
Part B       full material / candidate pool / placement-or-order map
Translation  full source + full translation workspace
Writing      prompt / requirements + dominant authoring area
```

Detailed accepted behavior remains in `ENGLISH_PRODUCT_BRIEF.md`.

## English Home / Resume reconciliation

The old Product Brief footer that called Home / Resume unresolved is superseded.

Accepted Home responsibility:

```text
English
→ highest-value meaningful Continue when one exists
→ Objective 60: Reading A / Cloze / Part B
→ Translation 10
→ Writing 30
→ First Learning / targeted coaching as secondary support
→ LexicalOS as secondary supply lane
```

The existing `static-web/src/pages/english.astro` already implements the basic capability-first lane split and ROI Resume concept. Productization work may optimize presentation and complete missing task-family Resume coverage, but must not reopen the product model merely because the current page predates the final family brief.

## Current handoff

```text
accepted English Product Brief
+ current Functional First Runtime / Evidence
+ Kian UI preferences / shared style
→ bounded Codex implementation
→ real Mac browser screenshots / journeys
→ independent Chat/Pro product review
→ same-PR fixes
→ Kian acceptance
→ zero-semantic-diff merge
→ English SUBJECT_CLOSED_FOR_HOME
```

No additional English product-discussion gate is required unless fresh contradictory evidence identifies a real upstream defect.
