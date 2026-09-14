# #117 — Workbench Runtime / browser receipt

## Stage 1 #139 handoff — 2026-09-14

Status: **HANDOFF READY · FORMAL CURRENT INTEGRATION BLOCKED · STAGE 1 EXIT NOT MET**.

Program #113: Stage 0 #138 has a reviewed-for-submission artifact in PR #144, but #144 is still OPEN/unmerged. Latest fetched main is `947bd82004090e6b534d5c438c9416fb81c29c6b` and still has the previous learner-explanation manifest/invalid asset. Stage 1 remains the only execution scope; Stage 2 #140 is locked. Lexical and Xizong B–F content work is independent and untouched.

### Single writer and preserved implementation

This local execution task, owning `/Users/ben/KianOSBeta-issue117`, is the #117 branch writer for this handoff. The app inventory showed no other active execution task; branch workflow runs were completed, and repeated remote readbacks held at `6820d20cfa5064a70acbc0275d2211b116cd1657`. That remote tip is an ancestor of the existing local Runtime commits. The later temporary workflow churn described in the historical receipt below is no longer the current remote tip.

Existing implementation `8d60b722`, receipt/screenshots `b0edfbef`, and the exported handoff patch remain preserved. Latest main was merged into the task branch without conflicts; no prior Runtime patch was recreated. Publication uses an ordinary fast-forward push to the existing #117 branch, never force push. No second overlapping PR or branch writer is introduced.

### Incremental implementation and evidence

The prior 19 synthetic combinations remain recorded below and were not rerun. Code inspection found a separate completion bug: completing a session retained an exact session/question URL, but refresh rejected that URL solely because status was `completed`. The client now restores that exact completed summary, still rejecting a different session/question. The completed screen uses the existing compact header and hides setup controls that cannot usefully act there. “Start another” restores setup explicitly. Timer seconds now floor consistently across minute boundaries.

Only three new browser checks were run, using the existing isolated fixture, production-built component and a visible Chromium window at 1440×900:

1. Completed exact-URL refresh preserves summary, session bytes and immutable first attempts; no inert setup controls remain.
2. A stale completed-question target is still rejected without replacing saved state.
3. Starting another session after refresh preserves prior first-attempt records.

Result: **3/3 PASS**. Command: `PRACTICE_QA_ONLY=completion PRACTICE_QA_HEADED=1 npm run test:politics-practice`. The test filter writes a separate output directory and does not overwrite the existing 19-check report. Source hashes are included in the new report.

- [Incremental machine report](../output/playwright/issue139-completion/journeys.json)
- [Completed refresh screenshot](../output/playwright/issue139-completion/completed-refresh.png)
- [Current Politics QA log](../output/playwright/issue139-completion/politics-qa.log)
- [Production build log](../output/playwright/issue139-completion/production-build.log)

`npm run qa:politics` was executed: existing Current bindings/K03/repair-memory passed, then formal practice validation failed with `POLITICS_PRACTICE_LEARNER_EXPLANATION_COMPRESSED_SHA_MISMATCH`. A separate `npm run build` was executed and reached the formal review-resource generator, failing at the same strict asset gate. These are **FAIL/BLOCKED**, not PASS. No #144 branch asset was injected or promoted locally to bypass the Current prerequisite.

### Formal integration still pending

After #144 actually enters main: reconcile the accepted asset and its exact decoded/compressed hash contract in the consumer; enumerate formal IDs/source/NU bindings; run formal P-J1–8 and negative controls; inspect actual long/correct/wrong/uncertain Mac content; run Politics QA and the complete production build. No formal-data or independent product review evidence is claimed yet.

### KIAN HUMAN GATE — NOT OPEN

There is no successfully built formal Current Workbench to open yet. The isolated synthetic build is engineering evidence only, not a substitute human acceptance surface. Once the dependency lands and formal tests pass, provide a live formal route plus 3–6 product-focused interactions covering setup, single/multiple, Wrong/Uncertain, note/refresh, and exact Return, with explicit reject conditions. Do not ask Kian to re-run hashes or CI.

No merge, #140 work, real learner-state mutation, deployment or learner U. Keep #117 Draft and Stage 1 incomplete while waiting for the admitted upstream asset.

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
