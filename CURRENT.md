# KianOS Root Current

Role: **Control Tower + root router**  
Rule: current routing/status only. No semantic Truth, Acceptance ledger, learner progress, or duplicated child-task cursor.

---

## Active programs

| Program | State | Continue from |
| --- | --- | --- |
| Website / UI launch | **ACTIVE** | `static-web/CURRENT.md` |
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

---

## Cross-program status

### Website / UI
- English UI vertical: landed.
- Lexical / Vocabulary learner surfaces: landed.
- Xizong material learner UI: landed through whole-paper Hidden/Seal/Review.
- Politics learner UI: the only remaining material subject-UI closure.
- Shared learner-data / Chat handoff durability and final regression remain launch work.
- Material Visual changes still require real-browser screenshot + Kian Human Gate before merge.

Exact branch / PR / screenshot state belongs to `static-web/CURRENT.md` or the exact UI owner.

### Content
- Xizong is the only broad active Content program; its exact tasks/progress live in `content/xizong/CONTENT_MAINLINE.md` and child cursors.
- English and Politics have no broad semantic rebuild active.
- Lexical broad architecture rebuild/audit remains closed. A bounded **Baseline-v2 lexical content re-validation** is active under frozen module rules; after that, Lexical returns to evidence-triggered maintenance rather than periodic full-catalog rewriting.

Do not copy System counts, batch counts, phase numbers, Crosswalk totals, or exact next actions into Root. Read them from their canonical cursor on demand.

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
