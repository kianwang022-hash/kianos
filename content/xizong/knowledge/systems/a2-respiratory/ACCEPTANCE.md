# Xizong A2 Respiratory Acceptance

Status: CURRENT  
Scope: A2 Respiratory  
Standard: root `LEARNING_ACCEPTANCE.md`  
Role: A2 scoped Acceptance Truth

This file owns current S/K/L/P/R/E/U readiness claims for A2 Respiratory.

It does not own medical Core, lane/System learning semantics, Work Cursor, or Kian's private learner state.

---

<a id="a2-teaching-adoption-20261006"></a>
<a id="a2-r02-r03-deep-model-quality-20261008"></a>
## 2026-10-08｜R2–R3 连续模型与原有依赖深度复核

**限定内容与原生消费者验收：PASS。范围为 R2、R3；不提升原图、浏览器、Stable 或真实学习 U 的验收。** 本次依 [#1113](https://github.com/kianwang022-hash/kianos/issues/1113) 和现有 [Learning Contract §0](../../../LEARNING_CONTRACT.md#learning-outcome)、[Lecture Replacement Contract §3.1–§4](../../learner/LECTURE_REPLACEMENT_CONTRACT.md#teaching-topology-annotations) 持续推进。A1 深验已由 [#1277](https://github.com/kianwang022-hash/kianos/pull/1277) 交付；R1 的既有验收保留，不从此处外推其余 A2 或全部 A/B 的医学质量。

### 原位模型与实际阅读入口

| 唯一 canonical owner | 已实读、交叉复核的医学关系 | 原完整标题与 Prompt |
|---|---|---|
| [R2 肺换气、气体运输与呼吸调节](./blocks/Block2_肺换气_气体运输与呼吸调节_学习阅读版_v1_最终执行版.md)，blob `66439342b04a031869535068055ef30a2642263b` | VA 与 Q 同时供给交换单位；梯度定向、膜条件约束通量；O₂ 去程与 CO₂ 回程由 Bohr/Haldane 耦合；外周/中枢输入并行，通气输出回调血气。氧合、携氧、利用和 CO₂ 排出分别定位，呼衰类型依条件和实际血气。 | 16 项，原样附于对应自然节点；隐藏括注后仍有完整关系与反馈。 |
| [R3 COPD](./blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md)，blob `11f169fb064d0f192e1c505e84036d84202262fc` | 气道/肺实质损伤按表型并行汇合；呼气受限与呼气时间不足解释动态未排空/PEEPi；区域 VA/Q、弥散面积、整体有效通气分开；肺高压、右心负荷、呼衰和气胸各接自己的上游；稳定与急性处理按当前状态选择。 | 21 项，原样附于对应自然节点；测量和症状是观察，未被写成病因阶段。 |

原 System、37 个完整 native KP 记录和所有解释性 Core 保留；对 12 个 A2 Block 的实际 native 读取也证明 **236 KP × 10 个字段**均与原复核基线 `4ad568852c6ecda4c584c14196ac25ec9da26105` 相同，涵盖 identity、title、Prompt、Core、Source/Outline 和组归属。旧 teaching 全文未改，其有效解释继续接在 Current 模型的对应节点；[正常 Chat 入口](../../learner/README.md#accepted-a2-respiratory-teaching-basis) 已选择这两份 canonical §1A，教学与压缩复述使用同一原文。实际 `--model` 与原生检查返回完整 authored 模型，不再选择旧 teaching 的顺排目录。

模型区之外仅有三个明确同步点，均消除与既有 Core 的矛盾：R2 MI-G14 区分严重低氧与过高 CO₂ 的直接抑制；R2 Exit12 不再预设 CO 中毒 PvO₂ 恒下降；R3 Exit11 不再预设所有 COPD 必经“先动态、后静态顺应性”的时序。其余 MI-G/MI-D、Exit、学习切片、出处和图门禁逐字保留。Learning 仅修正 R2/R3 各自 first-pass focus 与 recall spine，以及 R2 LG01 的 closure（梯度决定方向、膜厚/面积影响通量）；组成员、stop lines 和其他政策未改。

### 既有 Memory 的真实依赖变化

保持原 **32 条 cue、26 项 prepared admission、17 个 visual binding**，所有 item、完整答案、助记、ID、anchor、成员、Core refs、Source 和六项未准入状态不变。五项既有 `owner_sha256` 在逐字段对比原/当前 owner 后最小更新：`a2-r01-kp02-precision`、`a2-r02-kp03-precision`、`a2-r02-lg04-precision`、`a2-r03-lg03-precision`、`a2-r03-lg05-precision`。R1 KP02 的既有 R3 KP06 依赖，以及 R3 LG05 的既有 R2 KP15 依赖均保留，未凭本地 Block 文件未变而漏掉跨块影响。

这些 Learning 变更具有真实语义。当前 descriptor 保留 R1 KP02、R2 KP03/LG01/LG04/Block、R3 LG03/LG05/Block 及相关五张卡的实际 revision 变化；未将其归零为纯包装等价，也未改私人历史或制造完成/掌握。26 个物理 receipt 均与实际 `preparedNativeCueWitness` 相符，12 个实际 descriptor 与写入前审定候选一致。原 frozen golden 不变：测试先严格断言已审新值，再在独立比较副本中恢复精确列出的历史元数据，继续校验全部原答案、身份、上下文及未变字段；任意答案、owner、revision 或缺卡的变异仍失败。

### 从原历史见证复核的题目关系

原 R2/R3 共 **58 条**正式关系全部对照完整题干、选项、题型、答案和原映射理由。使用四个原 effective Knowledge blob 的实际 native 快照，以及 43 个原 Question Truth blob；58 个正式题目对象与原 Truth 逐对象相同。原基线已有 51 条 stale，不能用本次 Core 未变自动续签这些旧见证。

- **8 条**原映射 scope 的 Core、identity/title 与 Current 精确连续，保留原医学理由；**49 条**经实际 Current 题目复审后保留原 target 并写入新的逐题理由。
- **57 条 current / 1 条原样保留 stale**；正式题目和答案、Primary/supporting、原有 Block 级路由均不改。其余关系逐对象保留。全库此时为 **1,842 current / 1,201 stale / 3,043 总计**，1,200 条非 R2/R3 stale 与 A1 已交付版本完全相同；全库 strict freshness 仍非全绿。

| 保留原 stale 的正式题目 | 精确证据缺口与边界 |
|---|---|
| `xizong-official-2015-n009`，原 Primary `respiratory-r02-kp05` | 题干写“吸入气的氧分压大于 60 mmHg”，原 Primary 定义氧分压/含量/容量/饱和度；KP07/11 的饱和度阈值是动脉血 PaO₂，不能直接代替吸入气或肺泡 PO₂。现有 Explanation 也混写区室，未建立独立 Source conflict 边界。本轮保留原整条关系、答案和 target，不改题干来制造通过。 |

### 实际执行与未提升的证据

- 原内容入口检查 **158 PASS**，覆盖 A1 全 12 Block、R1–R3 及既有异构样例；包括 R2/R3 完整原文、37 个准确注释、隐藏注释、错误身份反证和实际 CLI。
- 原生 prepared Memory **A2 212 / A3 229 / B 611 PASS**；既有 pre-entry **A3 89 / B 327 PASS**。两份历史 raw/pre-entry 基线均从原输入独立复现；R2/R3 在这个旧 pre-entry consumer 的 Framework 原本与当前均为 absent，唯一实际输出差异是已审 R2 MI-G14。此测试不冒称该 consumer 新增了 Framework 恢复。
- A3 browser 脚本只将原历史 descriptor 比较接入同一已验证断言，语法检查 PASS；本轮未运行 browser。生产 runtime、全部原 fixtures/goldens 与工作流未改。
- 原生题目 manifest 同步与正常 Crosswalk 检查 PASS。保留一个有具体证据缺口的 stale，不降低 fail-closed 规则。
- Semantic Adapter、Production Projection 与 Projection Current reconciliation PASS；159/159 Current owners 和 Surgery 的 38 单元/59 绑定/52 Block/7 Learning 依赖仍 PASS。本次 R2/R3 Projection 使用既有 `RESOLVE_BINDING` / `OWNER_REF`，没有失效的 strict canonical witness 或旧自然语言 selector，未添加派生补丁。
- 保留 R2 的 65 可见 Outline 行与 catalog 64、原 O₂/CO₂ 符号差异、CO 旧说法等既有 Source 边界；R2 10 项、R3 14 项原图门禁未因模型或已存在资产而关闭。R2 三张既存图的本轮检视不代表全部原 PDF 像素已复核。

本回执不承诺学习者已接触原 Source、进入 Recall、掌握模型或产生私人 Memory/Repair 证据。网站构建及浏览器结果以该批 PR 的确切 CI 为准；A1 阶段已证实的 Politics 投影版本阻塞仍归其原 owner。

## 2026-10-06｜A2 teaching and prepared Memory System adoption

**Status: ACCEPTED — respiratory-r01 through respiratory-r12 only.** Under Kian's task-scoped one-System authorization in [#1113](https://github.com/kianwang022-hash/kianos/issues/1113), this receipt adopts the twelve reviewed compact teaching/same-model compressed-review inputs and their bounded post-Chat/prepared-Memory integration in [#1207](https://github.com/kianwang022-hash/kianos/pull/1207). The tested product head is `428d41d7d50faaac3dc95f1653f0831d684b8c50`; the [normal Chat route](../../learner/README.md#accepted-a2-respiratory-teaching-basis) lists all twelve exact inputs.

**Reader-consumption correction (2026-10-06):** the [bounded A2/A3 repair receipt](../a3-urinary/ACCEPTANCE.md#a2-a3-reader-consumer-repair-20261006) supersedes the earlier blanket compressed-reader/external-route proof for these twelve inputs. R5–R8 regain existing model-node full Prompts; R9–R12 receive existing-owner footer routes; R1–R4 are unchanged. The accepted model, Core, all prepared identities/answers and all six unadmitted cues below are preserved. The linked receipt owns the exact repair proof and remaining delivery/U limits.

### Teaching and existing-owner scope

- All twelve actual compact defaults and expanded narratives were independently read against Current System/Learning and [Learning Contract §0](../../../LEARNING_CONTRACT.md#learning-outcome). Their natural models, full canonical title〔Prompt〕 bindings, System bridges and model/external coverage retain **236 KP / 62 LG**, all **111 MI-D topic destinations** and the original visual/Source obligations. These are observed accounting results, not an instruction to derive topology from KP/LG order or make 111 cards. R8→R12 respiratory-failure support and R9's exact arrhythmia qualifier were corrected before reader freeze.
- The twelve reader files are byte-preserved from independent acceptance. Their original `CANDIDATE_DERIVATION` headers and candidate wording remain review-time provenance; this receipt supersedes that admission boundary only for this exact teaching use. `medical_authority:false`, dependency freshness and original Source limits remain binding. No new canonical medical model, Core, System, Learning membership, question relation or visual asset is introduced.
- **26 original Precision identities are admitted: 16 KP-owned and 10 LG-owned.** All **32 original cue IDs, cue text, KP/LG anchors and ordered memberships**, plus all **17 visual cues**, remain intact. Existing `shared-fields.json#/precision_fields/{cue-id}` owns each complete answer, condition, aid and provenance; the existing A2 index alone admits it through a discriminated `NATIVE_CUE` ref. Whole native member/Core witnesses and every required dependency's identity/metadata/Block qualifications fail closed on missing, stale, moved, duplicate or extra witnesses. No new registry, parser, cache, per-member card, fake KP owner or dependency-created learning target is added.
- All **176 A1 prepared identities and native descriptors** remain unchanged. Genuine LG cards keep empty `kpId` and real `logicGroupId`; historical owner equality, evidence, marks, released-at and content history survive. A2 same-ID owner-context upgrades now retain the old context/resolution/owner in the existing history path. Both generic A2 descriptor paths omit new fallback cards for unadmitted cues, while general historical records remain preserved and selected prepared views exclude them.

### Exact admission holds and Source limits

Six original cues remain unadmitted; no partial answer or broad-Core fallback is relabeled as their exact delivery:

- `a2-r04-lg03-precision`: missing FeNO numeric scope and unspecified weekly PEF calculation.
- `a2-r04-lg05-precision`: course severe-attack PEF percentage lacks its denominator.
- `a2-r07-lg05-precision`: PPD millimetre thresholds absent from frozen Current.
- `a2-r08-lg05-precision`: the original additional low-frequency imaging-number scope is unsupported.
- `a2-r09-kp18-precision`: requested acute-PE ECG numbers are absent; chronic-cor-pulmonale numbers are not substitutes.
- `a2-r07-lg06-precision`: a complete Current-supported treatment proposal remains unadmitted because accepted Learning says 足量 while Current Core says 适量. This receipt does not amend Learning or resolve that medical/source choice.

R4 and R7 consequently have zero prepared availability. Supported Core, unchanged awareness cues and Source destinations remain accessible. R12's candidate-only AB/SB standardization definition remains excluded; the existing A3 destination is routing, not a new A3 review. R6/R11 pathology page-locator conflicts, R9's partial different-source visual support, original question-count discrepancies and R1/R10 older Extension shortcuts keep their recorded boundaries. Frozen Current course/drug/procedure/oxygen/edition qualifications remain explicit; no fresh original-PDF pixels, guideline validity, Source contact or clinical competence is claimed.

### Executed native and actual consumer proof

- Independent native/adversarial proof passes **212 checks** with frozen pre-integration content/identity oracles. Independent execution of the actual shipped A2 controllers passes **58 checks**, including the reproduced/fixed R11 title/sidebar answer leak. A1 actual controllers pass **46** and A1 native regression passes **60**. All **12 A1 + 12 A2** post-Chat controller fixtures retain Source, visual, prerequisite, TTSX and completion gates, save-failure behavior and real rating semantics.
- [Final Memory CI run37472841320](https://github.com/kianwang022-hash/kianos/actions/runs/37472841320) built the actual website and passed **13 grouped A2 browser cases**, the unchanged **25 A1 prepared cases**, **54 Workspace cases** and **36 genuine full-release cases**. [Artifact11417587778](https://github.com/kianwang022-hash/kianos/actions/runs/37472841320/artifacts/11417587778), ZIP SHA256 `f3ae0e249270749f2efcda84ff123c13588c8d0a4119d1cc3f15f5f5f5e8248d`, was independently hash-verified and actual screenshots inspected.
- A2 browser cases cover KP R1, true multi-KP LG R2, qualified anticoagulation/procedure/staging/ventilation samples R9–R12, held KP/LG/R7 LG06, old same-ID owner-context history, Browse, hidden Recall, full Reveal, explicit rating, reload/reopen, failed availability/rating save and unavailable-writer behavior. The final R11 KP21/KP22/LG whole visible Recall screenshots show original answer-free cues in headers and the complete sidebar; numeric T thresholds and contralateral M/N answer assignments no longer leak from canonical owner titles. Browse retains the canonical titles; content/identity/evidence are untouched.
- [Final Block Workspace run37472841014](https://github.com/kianwang022-hash/kianos/actions/runs/37472841014) passed **78 checks** in the actual built-preview KP Learn/Recall journey, including iPad Source-confirmation reachability, exact native title/position, personal Prompt/marks, clean Front, Source/TTSX and completion semantics. [Artifact11416524546](https://github.com/kianwang022-hash/kianos/actions/runs/37472841014/artifacts/11416524546), ZIP SHA256 `3eb57e26c3d0583ca9f6f960f12d6ed45e7193e50f47a0b2d2f4a7d947837d1c`, was independently hash-verified; final iPad and clean-Recall screenshots were read. A development-only Astro toolbar was the proven earlier hit-test interceptor; the same assertion now tests the built product. Display-number heuristics were replaced by exact canonical-title/native-ID assertions, not removed. No product layout was changed for that environment defect.
- Overall exact-product CI is **9 PASS / 4 known-owner FAIL**, not all green. [A2 relation](https://github.com/kianwang022-hash/kianos/actions/runs/37472841168), [B+C](https://github.com/kianwang022-hash/kianos/actions/runs/37472841077), [Mac](https://github.com/kianwang022-hash/kianos/actions/runs/37472841706) and [QA Return](https://github.com/kianwang022-hash/kianos/actions/runs/37472840987) retain their earlier-main exact failures: `reviewed_relation_question_exists`, `b_biochemistry_repair_missing_axis_fails_closed`, `wrong_auto_flips_to_back` and `reviewed_wu_creates_one_visible_memory_repair:0`. Their existing owners remain responsible; no assertion, mapping rule or source witness was weakened to make this batch pass.

### Evidence and delivery boundary

The current Learning Contract's lawful sequence is Chat model → native KP retrieval/prepared Memory → Block/System reconstruction → broad Lecture/question calibration. Earlier Lecture-first engineering sequences below retain their recorded scope; they are not the sole legal entry for these accepted Chat lessons. Navigation, post-Chat entry, dependency reads and prepared availability alone create no Source contact, Learned, rating, completion, full-Block release or Today debt. Explicit Recall observations and later genuine completion retain their existing native requirements.

**Learner U remains UNTESTED.** This scoped adoption does not mean Kian has studied Respiratory, viewed original images, mastered the content or created due work. It does not adopt other Systems, the whole #1150 branch, legacy/Library retirement or unrelated performance/relation repairs. Main merge placement and actual Current/Stable served-SHA delivery are separate claims; this receipt does not assert either.

---

## Gate status

```text
S  PASS
K  PASS — fresh bottom-up re-accepted
L  PASS
P  PASS
R  PASS — executed Functional First browser journey
E  PASS — executed state/evidence/repair journey
U  UNTESTED by every real learner path
```

Allowed conclusion:

> **A2 Respiratory is Functional First ready for actual study. S/K/L/P/R/E are accepted for the recorded scope. Every real learner U path remains UNTESTED.**

Not allowed:

> learner-validated / Respiratory learned / System Recall due now / questions due now.

---

## Current evidence boundary

### S — PASS

Current Source scope remains exactly **359 official A2 Question Truth IDs** under the accepted fail-closed source boundary. The fresh audit found no evidence requiring a new A2 Source unit merely because a topic is clinically interesting outside Current 306 scope.

### K — PASS · fresh re-accepted

The fresh audit independently attacked completeness, minimality and ownership rather than treating stable counts or old Acceptance as the answer.

Accepted result:

- **12 canonical Blocks / 236 stable KPs / 62 Logic Groups** remain;
- no Block/KP split, merge or renumber is justified;
- R1/R2/R3/R4/R5/R7 remain coherent natural units;
- the most suspicious combined Blocks also survive minimality attack:
  - R6: chronic suppuration + structural destruction + drainage/cavity discrimination;
  - R8: restrictive–diffusion–hypoxemia discrimination across ILD/silicosis and related alveolar patterns;
  - R9: chronic PVR load vs acute pulmonary vascular obstruction under one RV-load model;
  - R11: lung-cancer Primary with a small mediastinal spatial-localization tail;
  - R12: shared oxygenation/ventilation failure endpoint;
- no new medical Block or broad Content rewrite is required.

A real System-level defect was repaired:

- old failure language omitted **blood O2-carrying / oxygen-content failure**, even though R2 teaches that PaO2/SaO2 does not equal Hb/CaO2 or tissue oxygen delivery;
- broad “persistent structural destruction / occupying lesion” was demoted from primitive status because those diseases compose from more specific functional failures;
- ventilatory mechanics/pump failure is now separated from respiratory controller/neural-drive failure;
- a judgment axis explicitly distinguishes **PaO2/SaO2 hypoxemia vs Hb/CaO2 carrying failure**;
- matching `a2-respiratory-pathways.json` failure views were reconciled.

Current minimal A2 failure language is:

```text
FM1 airway obstruction
FM2 ventilatory mechanics / pump expansion failure
FM3 alveolar filling or collapse
FM4 diffusion-membrane failure
FM5 V/Q mismatch
FM6 pulmonary vascular resistance / pathway failure
FM7 respiratory controller / neural-drive failure
FM8 blood O2-carrying / oxygen-content failure
```

Complete anemia, toxicology and other non-respiratory etiologies remain with their owning Systems; A2 only owns the interface needed to localize oxygen-delivery failure correctly.

### L — PASS

The accepted Xizong learning constitution remains sufficient and was not expanded during this closure:

`System orientation → Block/Logic Group Lecture-first learning → KP Recall → Logic Group closure → Block Recall → System Recall before questions → official System sweep → smallest-sufficient W/U repair → return → post-question reconstruction`.

Continuous Lecture consumption remains external-primary on iPad/MarginNote. KianOS remains orientation, retrieval, compression, evidence and repair rather than a second mandatory Lecture reader.

No new A2 ritual, Recall layer, question set or learner burden was introduced by the fresh audit.

### P — PASS

No visual redesign was required. Current shared System/Block surfaces project the accepted semantics sufficiently for Functional First use. Presentation polish is not part of this gate closure.

### R — PASS · executed browser evidence

The current Runtime was exercised through a real Playwright browser journey rather than accepted from page existence or source inspection alone.

`Xizong A2 Functional First Journey` run `34755440083` passed after correcting an earlier **test-only locator bug**. The successful journey executed:

- R1 first-learning state write;
- refresh resume at the saved stage/KP;
- premature Recall fail-closed behavior;
- Lecture evidence as a hard Block-completion prerequisite;
- successful Block completion only after required evidence;
- home Continue → recent Block;
- completed-System → System Recall;
- learner-selected whole-paper holdout;
- official System question sweep;
- correct-but-Uncertain state transition;
- W/U repair handoff and return path.

`Static Web Xizong QA` run `34755440116` passed Current validators and Astro build on the same repaired candidate.

### E — PASS · executed evidence semantics

The same browser journey verified the critical evidence contracts in execution:

- an unlearned KP cannot manufacture Recall evidence;
- a Block cannot manufacture `completed=true` without Lecture + Learn + Recall + Block Recall evidence;
- question results remain keyed to real Question Truth IDs;
- stable work is not forced into repair;
- repair input accepts only current real Wrong/Uncertain question IDs;
- precise Question→Block/KP routing uses repository-reviewed relations only;
- routed repair reaches the owning Block through the repair inbox;
- imported repair evidence is `REPAIR_ONLY`;
- repair does not rewrite the original question evidence;
- the original sweep tab/mainline remains available for natural return;
- Current-version evidence guards continue to archive/invalidate stale Block/System/question/repair evidence rather than silently reusing it.

Evidence class:

> **EXECUTED BROWSER ENGINEERING EVIDENCE — NOT REAL LEARNER U**

### U — UNTESTED

No repository, CI, fixture or headless browser run can establish real learner validation. Only Kian's actual use can create U evidence, and U remains path-scoped.

---

## Functional First stop rule

A2 engineering is complete for the current scope.

Do not reopen accepted gates for visual polish or speculative improvement. New work requires concrete contradictory Source, medical, state/evidence, Runtime or real learner evidence and must reopen only the smallest responsible owner.

Visual/interaction implementation may later be delegated to Codex. Codex may improve layout, responsiveness, components and micro-interactions, but must not change canonical medical ownership, Block/KP identity or learner order, Lecture-first semantics, completion/state meanings, evidence semantics, Memory admission, Question ownership/reviewed routing, W/U repair semantics, or repair/return progression.

---

## U paths awaiting real evidence

All remain `UNTESTED` until Kian genuinely uses them:

- sustained System orientation → Block first-learning flow;
- real iPad/MarginNote ↔ KianOS handoff;
- real weak KP Recall → Memory / Chat repair → natural return;
- real completed System → System Recall → holdout → question sweep → W/U repair → post-question Recall;
- sustained multi-session Continue/resume behavior.

Passing one later U path must not silently promote the others.

---

## Truth boundaries

### Artifact Truth

- System owner → `content/xizong/knowledge/systems/a2-respiratory/system.json`
- medical Core → `content/xizong/knowledge/systems/a2-respiratory/blocks/`
- lane learning semantics → `content/xizong/LEARNING_CONTRACT.md`
- detailed learning policy/support/pathways → `content/xizong/knowledge/learner/`
- official questions / explanations / reviewed relations → Xizong content roots
- learner Runtime / Functional First journey → `static-web/`

### Learner Truth

Private learner/browser/conversation evidence only.

This Acceptance does not mean Kian has started Respiratory, reached any Recall stage, attempted official questions, created repair/review debt, or validated any U path.

## R1 continuous causal teaching model / full-Prompt acceptance — 2026-10-08

**Bounded content / derived-consumer verification: PASS. Live learner acceptance: UNTESTED.**

This scoped improvement implements existing [Xizong Learning Contract §0](../../../LEARNING_CONTRACT.md#learning-outcome) and [Lecture Replacement Contract §3.1–§4](../../learner/LECTURE_REPLACEMENT_CONTRACT.md#teaching-topology-annotations); no new learning rule, standalone asset or extra learner step is created.

- **Current owner:** canonical [R1 Block §1A](./blocks/Block1_正常通气力学与肺功能_学习阅读版_v1_最终执行版.md) (Git blob `335ed66dd2ba02d79d03ce2a894e3350a4289d18`). It replaces only the compressed in-model Prompt tree with one authored continuous physiological flow: respiratory-muscle input → pleural mechanical coupling / transpulmonary pressure → alveolar-versus-atmosphere pressure gradient → gas flow; elastic/airway resistance modify this same process, with capacities, spirometry and effective ventilation remaining **measurements**, never upstream drivers. Pressure/flow conditions, inspiratory/expiratory phase differences, obstruction/restriction discrimination and downstream R2/disease boundaries remain explicit. Measurement-first is still permitted as a preparatory vocabulary order; it is not represented as a causal stage of ventilation.
- **Identity/preservation:** exactly 15 current titles and full formal Prompts are attached to existing mechanism, load, evidence and reconstruction locations. Hiding every annotation leaves a continuous physiological model; it does not rely on KP order for medical arrows. All text outside §1A is byte-identical to pre-change canonical R1, including all 15 KP identities, original titles/Prompts/Core, Source/Outline and diagram gates, MI-G/MI-D and existing review conditions. Current reviewed Memory/Precision and private learner state were not changed. Remaining A2 Blocks and A1 B1/A3 B5/B D8 models were not modified.
- **Native consumer:** the existing read-only `inspect-xizong-content.mjs respiratory r01 --model` returns this exact Current model, not a separate diagram. The existing learner route now selects canonical R1 §1A as the primary model; old b01 teaching is optional explanatory presentation, not alternate medical authority. Cognitive Projection's single R1 Core blob witness was refreshed because its unchanged original owners are still used by the Website.
- **Actual verification:** 99 content-inspection checks, native semantic adapter, Production Projection, Projection Current reconciliation, reviewed relation freshness and question-manifest synchronization all PASS in the isolated candidate. Three current reviewed Question→Knowledge records referring to R1's prior whole-file blob update only their `knowledge_revalidated_blob_sha`, after confirming the text outside §1A is identical. Question mapping, formal answer, source-revision witnesses and primary/support identities remain unchanged; the manifest was regenerated by its native synchronizer.
- **Limits:** the bounded checks do not assert independently reaudited original Source accuracy, real source contact, user understanding, Memory re-admission, website Stable release, full A/B 76-Block quality acceptance or real learner U evidence. Existing unrelated A1/A2 browser assertions and historical acceptance remain separately owned.
