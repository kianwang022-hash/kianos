# Politics Mao Acceptance

Status: CURRENT  
Scope: 毛泽东思想和中国特色社会主义理论体系概论 C00–C08  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: Mao scoped Acceptance Truth

This file owns current acceptance claims for the independently continued Mao subject. It does not own Source Truth, Politics-wide contracts, Work Cursor, runtime code, or Kian's private learner progress.

---

## Gate status

```text
S  PASS
K  PASS
L  PASS
P  PASS
R  PASS
E  PASS
U  UNTESTED   ← learner-only
```

Supplemental content conclusion:

```text
C00–C08 Current content closure  PASS
```

Allowed conclusion:

> **Mao is module-ready for real learner test under the Current Politics surface contract: S/K/L/P/R/E are accepted. U remains UNTESTED until Kian actually uses a named Mao learner path.**

Do not promote this to learner-validated, mastered, or later-transfer-validated.

---

## S/K + Content｜PASS

The 2026-09-13 fresh Source/Knowledge review attacked all 9 chapters against all 18 canonical Mao Natural Units; all 18 are P0.

```text
C00–C08  REPAIRED
9 reviewed / 9 repaired / 0 keep / 0 blocked
Content closure PASS
```

The repaired upstream defect was over-compression: valid problem→answer spines had lost some P0 fixed identities, role hierarchies, causal/historical relations and high-value boundaries. Those were restored without turning KianOS into a second Chengfeng textbook.

Frozen source roles:

```text
Chengfeng  continuous first-round mainline + primary semantic source
Suyi       framework / exactness / past-exam cross-check input
Xiao1000   verification/evidence, not first-learning order
KianOS     orientation / bridge / boundary / compression / repair companion
```

Source provenance owner: `content/politics/learning/mao/source-review.json`.

Executed evidence:
- Static Web Politics QA #510 (`34758627084`) → PASS
- Mao fresh content audit → 9/9 chapters, 18/18 canonical P0 Natural Units, 0 blocker

---

## L｜PASS

Review owner: `content/politics/learning/mao/learning-review.json`.

Fresh disposition:

```text
C00–C08  9 KEEP / 0 REPAIR / 0 BLOCKED
```

Accepted whole-book reasoning chain remains problem-first and continuous:

```text
为什么必须中国化时代化
→ 毛泽东思想怎样形成并成为第一个重大理论成果
→ 半殖民地半封建中国怎样革命
→ 革命胜利后为什么还要完成社会主义改造
→ 制度建立后中国自己的社会主义建设道路怎样探索
→ 改革开放后为什么形成接续发展的中国特色社会主义理论体系
→ 邓小平理论重新回答什么是社会主义、怎样建设社会主义
→ “三个代表”怎样回答新的党建与执政实践问题
→ 科学发展观怎样回答发展质量、结构与长期性问题
→ 新时代问题交给新思想继续承接
```

No chapter Logic rewrite was required merely to manufacture work. The accepted route keeps Natural Unit identity/order intact, preserves cross-chapter continuity and exam discrimination, and avoids mandatory recall rituals for symmetry.

---

## P｜PASS after one repair

Review owner: `content/politics/learning/mao/projection-review.json`.

Fresh disposition:

```text
8 KEEP / C04 REPAIR / 0 BLOCKED
```

Real P defect: C04-S01 accepted Content owns four parallel `answers[]`; the generic Politics projection understood only a singular answer field and silently dropped the core responses.

Repair:

```text
accepted Mao Content/Logic unchanged
→ Mao-scoped projection adapter restores plural answers when generic teaching.answer is empty
→ learner-facing core answer survives Projection
```

Owner: `static-web/src/lib/politicsMaoProjection.mjs`.

Executed evidence:
- Static Web Politics QA #536 (`34767639225`) → PASS
- Mao Projection closure guard → PASS
- Current bindings + production Astro build → PASS

Projection PASS does not move Chengfeng continuous reading into Astro; iPad/MarginNote remains the original first-study surface.

---

## R｜PASS after one repair

Mode: `EXECUTED + ADVERSARIAL`  
Journey owner: `static-web/scripts/test-politics-mao-runtime.mjs`

First real R failure:

```text
Mao rendered valid Current Xiao1000 questions
→ conservative Natural Unit fallback existed
→ fallback allowlist covered only Marxism / History
→ Mao received zero executable Unit Return configs
```

This was a Runtime ownership defect, not an S/K/L/P defect.

Narrow repair:

```text
Mao may use existing NATURAL_UNIT_SAFE_FALLBACK
mastery_claim = NONE
Xi / Ethics-Law unchanged
```

Owner: `static-web/src/lib/politicsUnitReturn.mjs`.

Final executed evidence:
- Static Web Politics QA #544 (`34770594438`) → PASS
- Politics Functional First Journey #56 (`34770594522`) → PASS
- Mao Runtime artifact → 64/64 checks PASS

R proves the real Mao path can execute:

```text
Orientation
→ external Chengfeng handoff
→ return / optional closure
→ Current Xiao1000
→ stable fast continuation
   OR Wrong/Uncertain → owning source → repair return
→ meaningful resume / refresh / Politics Home Continue
```

The original result and complete first-attempt object remain unchanged through repair return and refresh. `STABLE` remains this-pass evidence only, never mastery.

---

## E｜Fresh Evidence re-acceptance — PASS after one repair

Review owner: `content/politics/learning/mao/evidence-review.json`  
Whole-module audit: `static-web/scripts/audit-politics-mao-evidence.mjs`  
Browser journey: `static-web/scripts/test-politics-mao-evidence.mjs`

### Strongest attack / first real E failure

The first fresh Mao E browser run kept the important first-attempt fields correctly:

```text
subject / chapter / unit / question
outcome
selected answer
correct answer
study day / observed time
```

But it failed `mao_e_event_keeps_repair_source_anchor`.

The failure was real: a Wrong/Uncertain event did **not** itself preserve where its owning Chengfeng repair source lived. Source return could still work in the immediate Runtime, but after the learner navigated elsewhere a later Return Packet would otherwise depend too heavily on mutable `last_location` to reconstruct repair provenance.

This was classified as an **Evidence defect**. S/K/L/P/R were not reopened.

### Narrow E repair

Mao now mounts `static-web/src/components/PoliticsEvidenceEnhancer.astro`.

For the matching newest Mao Wrong/Uncertain event only, it adds:

```text
repair_source_anchor
repair_source_owner_ids
```

These are derived from the Current owning Mao Unit/source model. Existing first-attempt fields remain unchanged. The repair is Mao-scoped and does not enable Xi/Ethics-Law.

### Executed E evidence

Final audited head before Acceptance docs: `f838f8a470478793df68c950a490363bbe8d6f62`.

**Static Web Politics QA**
- run #553 (`34771525967`) → **PASS**

**Politics Functional First Journey**
- run #65 (`34771525987`) → **PASS**
- shared Politics Functional First → PASS
- Mao Runtime regression → PASS
- Mao Evidence model audit → PASS
- Mao Evidence browser journey → PASS

Whole-module Evidence model coverage:

```text
C00–C08                 9 / 9 chapters
Unit Return configs     17
question evidence slots 107
model assertions        181
failures                0
```

The whole-module audit proves across every executable Mao Evidence config:

1. evidence scope is non-empty and bounded;
2. `mastery_claim` remains `NONE`;
3. evidence precision remains approved (`NATURAL_UNIT_SAFE_FALLBACK` or source-validated finer mapping);
4. the first WRONG attempt records once and a later STABLE attempt cannot overwrite it;
5. WRONG survives Unit evaluation as repair debt;
6. UNCERTAIN stays semantically distinct from WRONG and STABLE;
7. all-STABLE means this-pass stability only, not mastery;
8. out-of-scope evidence is rejected.

The browser journey additionally proves:

- clean STABLE attempts create no Wrong/Uncertain handoff debt;
- a real ch00 Wrong event retains subject/chapter/unit/question/choice/answer/outcome plus `source-POL27-CF-MAO-C00` and stable source-owner ids;
- repair/return does not rewrite or erase the original Wrong evidence;
- after navigation moves `last_location` to ch08, the exported Return Packet still carries the original ch00 Wrong event and its ch00 repair provenance independently;
- a correct-but-uncertain answer remains `UNCERTAIN`;
- forced persistence failure visibly fails closed, stores no manufactured first attempt, keeps Unit Return closed, and leaves the learner at `VERIFY` rather than pretending closure.

### Accepted E semantics

```text
first attempt       immutable once recorded
WRONG / UNCERTAIN   distinct durable repair evidence
STABLE              this-pass stability only
repair              does not rewrite history or imply mastery
mastery_claim       NONE
repair provenance   event-local; not inferred from mutable last_location
out-of-scope input  rejected
persistence failure fail closed
learner evidence    private browser / Return Packet only
```

### Transfer boundary

Fresh/holdout transfer is a later review/mock phase under the Politics Learning Contract. It was **not executed** as part of first-round Mao E, and E does not pretend otherwise.

Durable invariant:

> Future fresh/holdout transfer evidence may strengthen or challenge earlier evidence, but it must append/reconcile; it must never overwrite first-attempt truth.

Not creating a fake later-transfer workflow is intentional and follows the Politics anti-overengineering rule.

---

## Negative space / what S–E PASS does not mean

Mao S/K/L/P/R/E PASS does **not** mean:

- Chengfeng has moved into KianOS as a second continuous reader;
- every P0 fact is mandatory active recall or Memory debt;
- all backend `content_support` should be immediately visible;
- every Natural Unit needs a mandatory recall/checkpoint ritual;
- STABLE means long-term mastery;
- repair converts historical Wrong/Uncertain evidence into a clean first attempt;
- later fresh/holdout transfer has already been executed;
- Kian has studied, mastered, or validated any Mao chapter.

---

## Stage boundary

```text
S/K/L/P/R/E  PASS / CLOSED under Current engineering contract
U            UNTESTED / learner-only
```

No Mao engineering stage remains active by default. The next legitimate whole-module action is **real learner use**.

A future real learner defect may reopen only its earliest responsible gate. More architecture, page polish, or simulated evidence cannot manufacture U.

---

## Truth boundaries

### Artifact Truth
- teaching assets → `content/politics/learning/mao/ch00.json` … `ch08.json`
- Source/Knowledge reviews → `source-review.json` + `semantic-review.json`
- Learning/Projection reviews → `learning-review.json` + `projection-review.json`
- Evidence review → `evidence-review.json`
- Mao projection adapter → `static-web/src/lib/politicsMaoProjection.mjs`
- Unit Return runtime → `static-web/src/lib/politicsUnitReturn.mjs`
- Mao Evidence provenance enhancer → `static-web/src/components/PoliticsEvidenceEnhancer.astro`
- R/E executable guards → Mao scripts under `static-web/scripts/`
- shared Politics semantics → `content/politics/LEARNING_CONTRACT.md` + `content/politics/INTERACTION_CONTRACT.md`

### Acceptance Truth
This file.

### Learner Truth
Private browser / Return Packet / conversation evidence only.

> **Mao is ready for learner test; it is not learner-validated. U remains UNTESTED until real Kian use.**
