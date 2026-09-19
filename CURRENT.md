# KianOS Root Current

Role: **Control Tower + root Work Cursor/router**  
Rule: current routing/status only. No semantic Truth, Acceptance ledger, learner progress, or duplicated child-task cursor.

---

## Active programs

| Program | State | Continue from |
| --- | --- | --- |
| Website / UI launch | **STEADY — final CSS ownership closure complete; Gate 5 engineering freeze** | `static-web/CURRENT.md` |
| Xizong Content | **ACTIVE** | `content/xizong/CONTENT_MAINLINE.md` |
| English Content | **STEADY** — no broad rebuild | `content/english/CURRENT.md` |
| Politics Content | **STEADY** — reopen only concrete defects | `content/politics/CURRENT.md` |
| Lexical backend Content | **ACTIVE — bounded Baseline-v2 re-validation; broad architecture rebuild remains closed** | `content/lexical/CURRENT.md` |

Website launch and Content improvement are independent unless an exact dependency says otherwise.

---

## Unified entrypoint

Natural language is enough:

```text
看看整个主线
看看西综主线
看看政治 UI
英语现在做到哪
```

Control routes through the relevant owner chain and reads the latest exact cursor before reporting.

Typical Xizong Content path:

```text
root CURRENT
→ content/xizong/CURRENT.md
→ content/xizong/CONTENT_MAINLINE.md
→ exact active CURRENT / continuation cursor
```

Typical website path:

```text
root CURRENT
→ static-web/CURRENT.md
→ exact subject / surface owner
```

Task creation, persistence, active-ref freshness and artifact+cursor atomicity are operating rules owned by `AGENTS.md`; they are not duplicated here.

Shared authority routing:
- durable ownership / inheritance → `AUTHORITY_INHERITANCE_CONTRACT.md`;
- machine owner topology → `AUTHORITY_OWNERSHIP.json`.

---

## Cross-program status

### Website / UI
- English UI vertical: landed.
- Lexical / Vocabulary learner surfaces: landed.
- Xizong material learner UI: landed through whole-paper Hidden/Seal/Review.
- Politics learner UI: landed through final Practice Human Gate (#470).
- All material subject learner UI is landed; the final non-redesign UI/CSS ownership consolidation is complete.
- Chat-owned Home, subject-owned durable evidence/typed Return reconciliation and the private checkpoint layer are landed. Post-CSS-closure Final Cross-subject Regression and Mac Visual Gate passed; broad website engineering is frozen.
- Material Visual changes still require real-browser screenshot + Kian Human Gate before merge.

Exact branch / PR / screenshot state belongs to `static-web/CURRENT.md` or the exact UI owner.

### Content
- Xizong is the only broad active Content program; its exact tasks/progress live in `content/xizong/CONTENT_MAINLINE.md` and child cursors.
- English and Politics have no broad semantic rebuild active.
- Lexical broad architecture rebuild/audit remains closed. A bounded **Baseline-v2 lexical content re-validation** is active under frozen module rules; after that, Lexical returns to evidence-triggered maintenance rather than periodic full-catalog rewriting.

Do not copy System counts, batch counts, phase numbers, Crosswalk totals, or exact next actions into Root. Read them from their canonical cursor on demand.

---

## Launch closure mainline

Website launch now follows one fixed closure sequence:

```text
Gate 1  Subject Final Acceptance
        Xizong / English / Politics fresh audits converge on truthful Current claims

Gate 2  Shared Learner Data / Chat Handoff
        Chat owns cross-subject strategy; typed plans/returns and private durable checkpoints close

Gate 3  Home integration
        Home consumes Chat plan + subject-owned Resume/evidence without inventing strategy

Gate 4  Cross-subject final regression
        Timer / Resume / sync / restart / handoff / three-subject switching prove one coherent runtime

Gate 5  Launch / engineering freeze
        broad website construction stops; reopen only concrete learner-visible defects
```

**Current state: Gates 1–5 are closed; Gate 5 engineering freeze is active.** Broad website construction stops here. Reopen only the smallest responsible owner for a concrete learner-visible or durability defect.

This is a routing sequence, not a second progress dashboard. Exact subject findings stay in subject Current / Acceptance owners.

---

## Control output

For a whole-project status request, report only:

```text
Active programs
Current stage
Next durable action
Real blocker
Human Gate when relevant
```

Then drill down only when Kian selects a program/task.

---

## Stop rule

Root Control must remain small.

Do not add:
- domain learning rules;
- Visual style rules;
- engineering implementation rules;
- product trees already owned elsewhere;
- child progress snapshots;
- exact task queues;
- history / CI logs / branch archaeology.

If Root needs those details to answer a request, route to the real owner and read them live.
