# #117 — Workbench Runtime / browser receipt

## Stage 1 #139 — formal Current engineering acceptance

Status: **SELF FORMAL PASS · KIAN HUMAN GATE OPEN · INDEPENDENT REVIEW / KIAN ACCEPTANCE PENDING · NOT MERGED**.

Program #113 remains the full three-subject program. Stage 0 #138 landed through PR #144 at `57d580c4a468510eb23bbc9522cc576a5f75ab8b`. This Stage finishes only #117 Workbench; #140 remains locked. Independent Lexical and Xizong content lanes were not edited. This receipt supersedes the historical asset-blocked handoff below; it does not claim learner U or completion of the whole Politics product.

### Identity, ownership and reconciliation

- Runtime implementation: `6cae33eac3891b88267325ee78b983460bfd80a7` (formal integration `c893565c`, explicit early-end fix `6cae33ea`).
- Latest integrated main: `19a1a69973ce47fd84a757f503f2226ffc5ec1ad`. Its change after #144 is only the independent Lexical `o6375-o6624.md` addition. Both main merges were conflict-free.
- Existing PR #117 branch: `politics-legacy-parity-migration`; pre-publication remote tip `7b37abd2aa0c35252f30298a4fe452dbe3a1d89a`. The same local task/worktree is the sole writer, with no remote rewrite or second PR.
- Preserved: original Runtime commit `8d60b722`, original **19 synthetic PASS**, receipt/screenshots `b0edfbef`, and completion fix `00821141` with **3 incremental synthetic PASS**. These suites were not reconstructed or rerun during this formal pass.
- Exact Current content diff against main: zero. No question, answer, ownership record, explanation, gzip, manifest or receipt was regenerated or edited in Stage 1.

### Scope decisions and fixes

1. The consumer now enforces both Stage 0 byte identities: compressed bytes and exact decompressed UTF-8 bytes. Missing or stale hashes fail closed. The five-field record shape is checked; learner `takeaway` and `chat_explanation` strings are retained verbatim.
2. Formal enumeration exposed **21 objective IDs without a canonical Current NU owner**. All **1148** explanations bind exactly to Question Truth, but only **1127** have legal practice/Return ownership. Master v3's affected-object fail-closed rule applies: preserve full content internally, exclude these 21 from learner practice and static review endpoints, and explain unavailable deep links without substituting another question. No legacy suggested mappings were promoted.
3. The validator independently enumerates `content/politics/source/politics_unified_regions.v1.jsonl` canonical owners. It requires every canonically owned question to retain a valid rendered unit, question inventory and Return config; the only protected IDs are those absent from that authority. This is not a hardcoded 21-ID exemption. A renderer dropping a legitimate owner still fails.
4. Formal Mac browsing found that Workbench source Return could leave the cognitive chapter on its previous unit/orientation state. The existing bridge now selects the exact unit and requests its existing `EXTERNAL_LEARN` state, while preserving the original session/question link. No cognitive layout/state machine was redesigned.
5. Added explicit “结束本组” after pausing: preserve existing attempts/notes/evidence, distinguish answered and unanswered counts, reject a failed save, and allow a new exact scope only after explicit closure. This fixes the prior trap where pausing prevented ever changing scope until every question was answered. The configured count now displays the actual available batch size.
6. Fixed the setup confirmation checkbox's CSS specificity so its control and explanation remain on the same line. Retained fullwidth clean question, two-region submitted view, optional notes/causes, low-friction Next and complete source text.

### Executed formal evidence

`PRACTICE_QA_HEADED=1 npm run test:politics-practice-formal` — **23 grouped checks PASS** on the actual production build, with formal Current content and fresh isolated Chromium contexts at 1440×900; all long-content samples also checked at 700×900. No uncaught browser exceptions in the sampled page checks; no failed network requests. Primary learner browser/storage was never opened or written.

| Formal evidence | Result |
| --- | --- |
| Full 1148 inventory, two byte hashes and negative hash controls; all 1127 generated review resources exact; all 21 unowned endpoints HTTP 404 | PASS |
| P-J1 / P-J3 / P-J4: Normal clean → correct/Wrong, exact two-field explanation, full Current source, note failure and source round trip | PASS |
| P-J2: multiple toggle, explicit submit even in Fast, missing B / extra C | PASS |
| P-J5: Fast stable advances after save; Wrong / meaningful Uncertain stays | PASS |
| P-J6 / P-J7: wrong/favorite re-entry, distinct signals, completed refresh, immutable first attempt | PASS |
| P-J8: actual NU entry → Workbench → source/refresh → exact original question/session, including saved chapter on another unit; stale Return rejected | PASS |
| Four separate attempts/meta/evidence/session write failures, reload and idempotent retry | PASS |
| Explicit early end, zero-answer and partial-answer summaries, failure/refresh, records preserved, next exact scope | PASS |
| Missing/stale/unbound/incomplete review payloads; protected unowned deep link | PASS |
| Longest question face, longest explanation and multiple questions across all five modules; complete source text and narrow overflow | PASS |

- [Formal report, source hashes, exact protected IDs](../output/playwright/issue139/formal-journeys.json)
- [Formal browser command log](../output/playwright/issue139/formal-browser.log)
- [Clean](../output/playwright/issue139/clean-single.png), [correct](../output/playwright/issue139/correct.png), [multiple Wrong](../output/playwright/issue139/multiple-wrong.png), [Uncertain](../output/playwright/issue139/uncertain.png)
- [Long face](../output/playwright/issue139/clean-X1000-MARX-M-110.png), [long explanation](../output/playwright/issue139/result-X1000-MARX-M-151.png), [expanded source](../output/playwright/issue139/source-X1000-MARX-M-151.png)
- [Exact second-unit source Return](../output/playwright/issue139/source-second-unit-return.png), [note-save failure](../output/playwright/issue139/note-failure.png), [protected target](../output/playwright/issue139/protected-unbound.png), [early-end summary](../output/playwright/issue139/ended-early.png)
- [Preserved 19 synthetic checks](../output/playwright/issue117/journeys.json); [three completion checks](../output/playwright/issue139-completion/journeys.json)

`npm run qa:politics` — **PASS**: Politics Current bindings, K03 frozen pilot, repair-memory, strict formal Workbench parity, and complete Astro production build (**8250 pages**). [Log](../output/playwright/issue139/politics-qa.log).

`python3 content/politics/derived/xiao1000-learner-explanations/validate.py` — **PASS**, 1148 unique exact IDs, missing/unbound zero, two learner fields; `test_validation.py` — **14/14 PASS**. [Log](../output/playwright/issue139/asset-validation.log). Historical-source string comparison is explicitly NOT_RUN in this Stage; Stage 0 already performed that reconciliation, and this pass compares the consumer's strings to the admitted asset instead of re-auditing content.

Final source identities remain:
- gzip SHA-256: `6d761c99b29011e3c290ca1925d9a0e52a53de8c67d4d7996c772e74cdd62087`
- decoded payload SHA-256: `5d655c3eb070af52d600e508f9fa1b3c683450e289882c9523af271bd3113f75`
- Question Truth SHA-256: `67cdd96c6fe53eb8b5e879c9e9ed487f58cea60c648e53cd720bd8a2fda9e40d`

### Remaining boundaries / review

- **Current NU ownership blocker:** the 21 IDs listed in the formal report cannot enter a legal practice → source → NU Return journey until the canonical content owner admits their bindings. Their explanations are present; this is not the old SHA/manifest blocker. No all-1148-practicable claim is made. All currently eligible formal journeys pass, and the unavailable subset is explicitly protected.
- Existing conditional source/image and reviewed finer-point-filter capabilities remain conditional; no OCR, answer-unsafe image fallback or invented mapping was introduced. Other Politics pages and all #140 families remain outside this acceptance.
- Independent technical/product review and Kian acceptance are **PENDING**. SELF evidence does not replace either gate. Keep #117 Draft; no merge, deployment, issue closure or learner U.
- Fresh-head CI is read back in PR #117. The prior SHA-related shared-build failures are obsolete after this implementation. The known independent Governance Anti-Entropy missing Xizong `continuation.json` / `acceptance-status.json` remains outside this write set; classify any fresh failure from its actual log, not its old label.

### KIAN HUMAN GATE

Actual local **production preview**, kept running for review: http://127.0.0.1:4337/politics/practice/ . This is the task worktree build, not a Production deployment. Use one browser tab. If opening another sample with an active session, use “退出题组” → “结束本组” first; on the next sample choose “再开一组” if the prior summary is shown; the app deliberately refuses silent replacement.

1. Open `/politics/practice/?question=X1000-MARX-S-001`, choose five questions, confirm the range was learned, start Normal. Check whether the first glance goes straight to question/options. Reject answer/explanation leakage, confusing scope or awkward checkbox placement.
2. Submit, then read the two regions and expand a Current source. Check that result, takeaway and full explanation have a useful reading order. Reject clipped content, mandatory diagnosis or source text that cannot be found.
3. On a submitted question, add a short note, refresh, go to the learning unit, then click “返回工作台原题”. Check continuity. Reject a different unit/question, lost note, changed selection or unexpected new session.
4. After “退出题组” → “结束本组”, open `/politics/practice/?question=X1000-HISTORY-M-001`. In Fast select A+C and submit. Check deliberate multi-select and visible missing/extra delta. Reject automatic submission on the first option or unclear selection changes.
5. Reopen a five-question Marx S-001 session after “退出题组” → “结束本组”, select Fast and answer A; it should advance. On the next question mark Uncertain before answering. Check that confident progress feels quick but uncertainty gives space to review. Reject skipping Wrong/Uncertain results or requiring optional cause/note to continue.

Next action is independent review plus these five product checks on #117, then an explicit merge decision. Do not start #140.

### Worktree / closure disposition

The #117 worktree and port 4337 preview remain active for human review; task-generated build/dependencies and transient CLI output remain local. Only named evidence files are committed. Original handoff patch/history is retained. Primary `/Users/ben/KianOSBeta` dirty `runtime/current-runtime.json`, unrelated worktrees and unknown stashes are untouched. The merged #144 remote branch is already absent; its contained local branch/worktree is retired after removing only its generated build/dependency directories.

---

## Preserved historical synthetic receipt

The following section records the earlier implementation/evidence and its then-current blocker/writer situation; the Stage 1 readback above supersedes its continuation instructions.


Status: **SELF SYNTHETIC PASS · FORMAL CURRENT ASSET BLOCKED · NOT MERGED**

Implementation commit: `8d60b722` on local `codex/issue117-productization`.
Base: active PR #117 `6820d20c`, reconciled with `main@b59dc7a5` in the local worktree. Latest observed main `8d2b8d12` has no additional `static-web` / `content/politics` changes relative to that base.

User scope on 2026-09-14: finish independently verifiable #117 Runtime/persistence/refresh/deep-link/exact-return/Normal-Fast/single-multiple/signals/Mac UI with isolated synthetic fixtures. **Stop at #117.** Do not reconcile the learner-explanation SHA/manifest, regenerate the 1148 records, enter other Politics product families, English, Xizong or Global Home.

## Runtime loop and implementation

NU entry or an exact known question → choose an already-learned scope → clean attempt → save locked attempt → immutable Current first-attempt writer plus idempotent W/U event → accepted result → Next / source repair → exact same session/question return. An optional note, Favorite and discussion marker remain annotations; Uncertain remains part of that attempt. None creates mastery or learner U.

`/politics/practice/` → strict Current catalog loader → public field allowlist → `PoliticsPracticeWorkbench.astro` + `politicsPracticeClient.mjs`. Submit fetches `/politics/practice-review/[id].json`, validates revision/question/source/unit binding and only then saves. Clean DOM contains neither answer nor takeaway/explanation/source prose; hidden previous-result content is removed before the next clean question. No original Xiao explanation is serialized through either allowlist.

`PoliticsPracticeBridge.astro` adds only NU→Workbench entry / same-question return glue to the existing chapter route. This does not productize the other Politics pages or change their learning/content owners.

### Changes and capability disposition

| Capability | Disposition and evidence |
| --- | --- |
| W1–2, W4: scope, exact deep link, Normal/random/wrong/favorite, Resume | Required Runtime implemented; exact unit and question start, resume after refresh, wrong/favorite re-entry and random ID preservation tested |
| W3: reviewed point filter | Conditional asset; no guessed finer mapping added |
| W6, W11: full structured face, clean protection | Generic full stem/option renderer and clean/review allowlists tested with synthetic short/long data; formal corpus binding pending |
| W7: original question images | Conditional asset; existing catalog metadata-only disposition retained; no answer-unsafe image/hidden explanation fallback added |
| W8–10: single/multiple, Normal/Fast, keyboard, timing, distinct signals | Stable single Fast advances after persistence; Wrong/Uncertain remains; multiple explicit submit; draft trajectory/time preserved; post-submit Favorite/discussion remain editable without changing first answer |
| R1–2: result/delta/takeaway/refined explanation | Baseline two-region composition retained; full text and line breaks; missing/extra delta for multiple; question face remains available |
| R4–7: source, optional cause/note, failure, exact return | Source has explicit empty disposition; note autosave retries do not mistake failed writes for saved state; Next/link/exit protect notes; source round trip retains result/note/session/question |
| E1–3: immutable first attempt, W/U, start/refresh/complete | Existing `recordPoliticsFirstAttempt` retained. A pending transaction lives in the existing session key; retries are event-ID idempotent across partial writes and reload. Session results determine summary, without increment-on-refresh |
| A1: secondary session result | Correct/wrong/uncertain/time/optional cause summary tested; no mastery score |
| A2, V1–4, H1–3, N1–4 and full five-subject cognition | No broadened acceptance claim. Existing owners remain; only exact Workbench glue touched |

Private storage keys are unchanged. The session adds `runtimeVersion: 2`, revision, draft, pending and results inside the existing private session record. Unreconstructable earlier session shapes fail closed and are retained, rather than inferring a result from old counters or overwriting real first attempts. Two tabs cannot overwrite a newer session snapshot.

Mac polish: compact active header, legible 2×2 options, less duplicate chrome, actual styles on dynamically created controls, complete long explanation with normal paragraph spacing, stable result regions, visible keyboard focus, sticky Next, responsive narrow fallback and reduced-motion support. No structure alternative or content rewrite.

## Executed validation

`npm run test:politics-practice` — **19 grouped checks PASS**, including P-J1–8 on synthetic data, four separate storage-write failure/reload retries, repeated note failure, missing/unbound/stale/incomplete review payload, draft/result refresh, first-attempt-preserving correction, exact question/NU return, cross-tab conflict, IME/text keyboard protection, random/wrong/favorite entry, sparse sources and earlier-schema fail-closed behavior.

The script builds a **separate Astro root** and uses its production output in fresh Chromium contexts. It imports the actual Workbench/client/serializer/first-attempt writer and return bridge. No production config fixture switch or formal loader bypass exists. Primary viewport 1440×900; narrow check 600×900. Browser: Playwright 1.56.1 / Chromium 141.0.7390.37. The suite starts/stops its own localhost:4339 and never opens the real learner browser profile.

- [Machine journey report](../output/playwright/issue117/journeys.json)
- [Baseline clean — original #117 component, same synthetic data](../output/playwright/issue117/baseline-clean-synthetic.png)
- [Final clean](../output/playwright/issue117/clean-single.png)
- [Final multiple Wrong result](../output/playwright/issue117/submitted-multiple-wrong.png)
- [Long clean](../output/playwright/issue117/long-clean.png)
- [Long result](../output/playwright/issue117/long-result.png) / [scroll bottom](../output/playwright/issue117/long-result-bottom.png)
- [Narrow result](../output/playwright/issue117/narrow-result.png)
- [Note failure](../output/playwright/issue117/note-save-failure.png)
- [Sparse source / correct result](../output/playwright/issue117/correct-sparse-source.png)

Baseline snapshots mount the exact original active-PR component in the isolated fixture root; they are not a claim that the blocked formal route worked. Temporary baseline route/component were removed after capture.

Current `validate-politics-runtime.mjs` and `validate-politics-repair-memory.mjs`: **PASS**. Current cognitive Projection validator: **PASS** (53 chapters, 160 NU; 151 PASS / 9 REFERENCE_ONLY / 0 BLOCKED). `validate:politics` stops when its final practice catalog check reaches the upstream checksum mismatch. Whole-site build and formal-asset journeys: **NOT RUN / BLOCKED**, not synthetic PASS.

Independent product review: **NOT RUN**. Real Kian usage / learner U: **NOT TESTED**.

## Upstream Current asset reconciliation blocker — unchanged

Owner: `content/politics/derived/xiao1000-learner-explanations/manifest.json` and its admitted asset/receipt.

- Manifest compressed SHA: `236f7992a0753de547a1a6db96983fab1d08f1dc146ad45aba0c9d6820989e56`
- Observed committed asset SHA: `dcefd135cf6c711909627a76ed23c055ec2839b7dc7f36ba9fb4bfd079c80883`
- Actual loader error: `POLITICS_PRACTICE_LEARNER_EXPLANATION_COMPRESSED_SHA_MISMATCH`

No owner file, SHA rule, manifest, compressed asset or 1148-record content has been changed by this work. The production route and review-resource generator both retain the strict loader. No OCR, semantic re-migration or fallback dataset was introduced into production.

### Journeys still requiring the formal asset

1. Enumerate the 1148 real records through the unchanged strict loader; validate stable question/source/unit/review bindings, Current eligibility, complete content and no original explanation fields.
2. Repeat P-J1–8 against admitted formal records: real correct/Wrong/Uncertain explanations, heterogeneous/long text, full source locators and actual NU/first-ready/return ownership. Synthetic execution proves behavior, not those content claims.
3. Build actual review resources and the production website; run full Politics QA and production-route browser sampling after the upstream owner reconciles the asset.

Optional original-face availability remains its existing conditional-asset disposition. Independent review and real U are separate acceptance responsibilities, not journeys replaceable by synthetic data.

## Publication / recovery boundary

This worktree is `/Users/ben/KianOSBeta-issue117`. Primary `/Users/ben/KianOSBeta` and its pre-existing `runtime/current-runtime.json` modification were not used for implementation; the managed legacy listener and real learner state were not touched.

During final reconciliation, #117's remote tip advanced independently from `6820d20c` through `658703c0` to `0389b708`. Another writer added a self-modifying `pr117-synthetic-runtime-closure` workflow and preparation scripts. The observed workflow runs failed before publishing a component change, but the remote continued changing. Those commits have not been reset, rewritten, removed, or silently replaced.

**Local implementation and evidence are committed; remote publication is held for the requested single-writer choice.** No new remote branch, PR, merge, Issue closure or production deployment. Local task branch remains ACTIVE for that handoff. No task stash was created; no other worktree/stash/branch was removed. Task-created transient baseline files were removed; browser/build dependencies and generated local diagnostics remain isolated and are not part of the code commit.

Next: designate the #117 writer, reconcile only the overlapping changes and publish/review this bounded slice. The upstream owner must reconcile the formal asset before formal journeys can pass. Stop at #117; do not start other Program slices automatically.
