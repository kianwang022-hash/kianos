# Politics Marxism Current

Role: independently continued Politics subject Work Cursor + restart entry  
Parent: `content/politics/CURRENT.md`

This file does not own Marxism Source Truth, teaching content, Politics learning/interaction semantics, Acceptance Truth, or Kian's learner progress.

---

## Work Cursor

**Scope:** whole-subject Marxism acceptance  
**Accepted upstream:** whole-subject S PASS / K PASS  
**Active / earliest unresolved stage:** L — whole-subject global first-ready parity  
**Blocker:** Politics QA run #348 (`34700709835`) passed `Audit Marxism batch content closure` and then failed `Audit Marxism global first-ready parity`. P/R/E remain frozen downstream.  
**Next action:** inspect only the global first-ready parity audit and its exact failing L owner; repair the concrete parity red, rerun L, and write L PASS durably before unlocking P.

The repaired S/K blocker was a stale top-level declaration in `ch02.json`: K03 had already become an embedded Natural Unit inside S01 but was still listed in top-level `source_bindings.natural_unit_ids`. Commit `e558a9951ef4e314c3eff87bd939df1e29d029ac` aligned the declaration without changing K03 content. The same content gate then passed.

### Whole-subject acceptance cursor

```text
S  PASS
K  PASS
L  FAIL
P  UNTESTED
R  UNTESTED
E  UNTESTED
U  UNTESTED
```

### Accepted pilot boundary

`POL27-CF-MARX-C02-K03` remains:

```text
S  PASS
K  PASS
L  PASS
P  PASS
R  PASS
E  PASS
U  UNTESTED
```

K03 is ready for a learner test path; it does **not** make whole Marxism learner-ready and does not mean Kian has studied K03.

---

## Frozen / out of scope

While L is red:

- keep whole-subject S/K frozen PASS unless concrete contradiction evidence reopens them;
- do not promote P/R/E from Artifact completeness or from the automatically skipped downstream assertions;
- do not reopen K03 S–E without concrete new evidence;
- do not create a second Suyi learner course;
- do not let Xiao1000 determine first-round learning order;
- do not modify History / Mao / Xi / Ethics-Law by convenience;
- do not mutate private learner progress / Wrong-Uncertain / Return Packet state.

---

## Required reads

For ordinary re-entry:

1. `content/politics/learning/marxism/ACCEPTANCE.md`
2. the workflow/script owning `Audit Marxism global first-ready parity`
3. exact failing L owner only after the executable assertion identifies it

Do not reread the content-closure owner by default; S/K are now accepted and frozen.

---

## Truth references

### Artifact Truth

- canonical owner map → `content/politics/manifest.json`
- source/provenance → `content/politics/source/` + `content/politics/provenance.json`
- lane learning semantics → `content/politics/LEARNING_CONTRACT.md`
- interaction semantics → `content/politics/INTERACTION_CONTRACT.md`
- Marxism teaching projection → `content/politics/learning/marxism/`
- learner runtime → Politics surfaces under `static-web/`

### Acceptance Truth

`content/politics/learning/marxism/ACCEPTANCE.md`

### Learner Truth

Private browser / Return Packet / conversation evidence only. Shared Artifact / Acceptance / Work state cannot manufacture Kian's learning progress.

---

## Fresh-Chat target

Known scope `Politics Marxism acceptance` should normally recover as:

```text
Marxism CURRENT
→ Marxism ACCEPTANCE
→ L: failed global first-ready parity assertion
→ exact failing L owner only
→ work
```

No Politics-wide Acceptance, retired continuation/history, unrelated subject, legacy repository, or prior Chat is required for ordinary Marxism continuation.