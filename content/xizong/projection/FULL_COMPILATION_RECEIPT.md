# Xizong Cognitive Projection — Full A1/A2/A3 Compilation Receipt

Status: **FULL A1/A2/A3 ACCOUNTING + EXECUTED ASSET VALIDATION — SEMANTIC / RENDERER / MAC ACCEPTANCE NOT INFERRED**  
Compilation commit: `3cb882691ace183d46f771b910b354d0419e9d07`  
Validated code/assets: `8055864098ae2feee7c1ee8794d676eda33c6ae9`  
Projection contract: `content/xizong/projection/PROJECTION_CONTRACT.md`  
Current manifest: `content/xizong/projection/manifest.json`

## 1｜Compiled scope

```text
A1 Circulation   1 SystemProjection + 12 BlockProjection
A2 Respiratory   1 SystemProjection + 12 BlockProjection
A3 Urinary       1 SystemProjection + 14 BlockProjection

Total            3 SystemProjection + 38 BlockProjection = 41 assets
Canonical KP identities resolved: 805
```

Every numbered Block in this A1/A2/A3 manifest has a durable Projection owner. B and other future Systems are outside this validation claim; repository existence is not compilation eligibility.

This work does not modify canonical medical Core, stable Block/KP identity, Question Truth, learner evidence, Runtime state, learning order or S/K/L/P/R/E/U claims.

## 2｜Projection richness model

Seven heterogeneous calibration Blocks retain explicit Current-supported geometry:

```text
A1 B1   mechanism chain + formula language + framework
A1 B7   inference + four-valve compare + boundary
A1 B10  stability-first decision algorithm + ECG/perfusion boundary
A1 B11  feedback/compensation loop + wet/cold coordinate
A2 R1   measurement/mechanics + Visual/Precision/Connection enrichment
A3 B1   spatial/directional/measurement/control map + source handoff
A3 B5   five-variable coordinate + priority/acid-base algorithm + narrow external-source provenance
```

The remaining 31 Blocks use `BASELINE_CURRENT` references to:

```text
canonical Current Block Guide
+ first-pass focus / stop line
+ recall spine
+ Logic Group map
+ external handoff policy
+ protected Recall views
+ optional reviewed enrichment
```

Coverage does not require invented diagrams for symmetry. It also does not prove that the 31 baseline representations have already received the same rich spatial treatment as the seven calibration examples. A complete reference to a Guide is not proof that the eventual renderer presents its full useful semantics well.

## 3｜Architecture result and limits

At the asset level, one BlockProjection/SystemProjection family accommodates A1/A2/A3 without named-topic page branches:

- multiple cognitive objects per Block;
- role separate from geometry;
- medical text referenced rather than copied into a second owner;
- optional A2 cues/pathways without fake A1/A3 sidecars;
- A3 B5 external admission retained as narrow provenance;
- reusable view references rather than separately authored first-pass/Recall medical bodies.

These are structural properties. They do not establish clinical correctness, semantic suitability of every geometry, completeness of all learner-visible content, or production renderer compliance.

## 4｜Binding-aware freshness

The policy separates:

```text
STRICT_BLOB
- scope-local MEDICAL_CORE used by DERIVED_FRAGMENT
- narrow EXTERNAL_SOURCE_CONTRACT

RESOLVE_BINDING
- SYSTEM_CORE
- LEARNING_SUPPORT
- SELECTIVE_CUES
- PATHWAYS
```

Shared structured source changes require exact typed re-resolution rather than automatic sibling-wide staleness:

```text
file changes
→ resolve this asset's exact pointer / reviewed item / filter
→ valid binding → revalidated
→ removed / invalid binding → fail the dependent asset
```

**File packaging ≠ semantic dependency.**

A same-type text edit being resolvable is not semantic approval. The Current medical/learning owner remains responsible for the changed meaning. Strict-source re-pinning still requires targeted review/recompile, not blind hash refresh.

## 5｜Optional enrichment

A2 binds reviewed indexes by item ID or exact owning-Block predicates:

```text
precision_index  where anchor.block_id == current Block
visual_bindings  where anchor.block_id == current Block
connections      where source.block_id == current Block
connections      where target.block_id == current Block
```

The validator returns actual matched objects, checks supported filter fields, ownership/endpoints, declared anchors and timing policy. A real zero-match optional result is legal; a misspelled predicate is not a valid substitute for absence. A3 B5 external admission remains strict-pinned provenance, not learner answer content.

## 6｜Executed validation evidence — 2026-09-14

### Historical baseline, not sufficient proof

Original Projection run `34795172243` at `3cb882691ace183d46f771b910b354d0419e9d07` reported success. Replaying the old validator also produced green results in runs `34795361200` and `34795494921`.

Fresh negative probes exposed real detection gaps despite that green baseline:

- `OWNER_REF` returned success without resolving the canonical owner;
- `INDEX_MATCH` did not validate/return the actual match set;
- removing the protection flag could bypass the old front check;
- answer-bearing support/KP policies could evade the object-only visibility check;
- missing pins and falsely safe-tagged bindings were insufficiently guarded;
- a broken anchored selector could be rescued by an unrelated later structure.

Therefore the previous receipt's broad interpretation of `neutral_front: PASS` and helper self-tests is superseded for these claims. The old run remains historical evidence of the old checks, not proof of the stronger requirements.

### Current executable validator

Entrypoint:

```text
python3 -B content/xizong/projection/tools/validate_projection.py --self-test --json report.json
```

Version: `1.1.0`  
Evidence mode: **EXECUTED + ADVERSARIAL**  
Independence: **SELF**  
Validation scope: **ASSET_BINDINGS_AND_DECLARATIVE_VISIBILITY_ONLY**

Code blobs:

```text
validate_projection.py  827a8e3671ad3168f5d0b293996d8bbb68f5c5e4
test_projection.py      ba18312a728bf1cb4b7c8a87047f3d798a619bcc
```

Execution chain:

1. Exact scoped Current inputs were downloaded from Actions and verified against their Git blob inventory.
2. The revised validator and suite passed locally on all 41 assets.
3. Candidate run `34796520999` passed the same suite. All 41 generated candidate asset blobs were individually matched to the locally tested bytes.
4. Canonical read-only workflow `.github/workflows/xizong-projection.yml` then ran against the **committed tree** at `8055864098ae2feee7c1ee8794d676eda33c6ae9`.

Committed-tree run: **`34796838978`**  
Job: **`103831476051`**  
Conclusion: **SUCCESS**  
Report artifact: **`10330221073`**, `xizong-projection-report`

Actual output:

```text
XIZONG_PROJECTION_VALIDATION: PASS
coverage: 3 systems / 38 blocks / 41 assets / 805 KP identities
mutation/control tests: 86/86 passed; failed=0
boundary: asset validation only; no browser/runtime/medical/learner acceptance claim
```

The valid baseline resolves **396 bindings**. The workflow also verified that `content/xizong/knowledge` had no tracked or untracked worktree changes after testing. Mutations are in-memory overlays, not edited source files.

### What the 86 checks exercise

- full Current manifest and all seven heterogeneous calibration examples;
- schema/ID collisions, unsupported fields and inline-answer injection;
- canonical System/Block/KP/LG ownership;
- exact source IDs, required pins, strict staleness and type guards;
- exact JSON pointers, escaped keys and invalid array indexes;
- Markdown heading/marker/anchor uniqueness, fence boundaries and adjacent structures;
- required protected views, source-derived allowlists, support/context/handoff/provenance channels;
- optional index IDs, predicates, matched objects, anchors and timing;
- external admission scope/hash restrictions;
- full accounting, duplicate/missing/unlisted assets;
- positive controls for valid absence, lawful revalidation and presentation-object changes.

### Locality controls — actual full-validator outcomes

| Mutation/control | Observed outcome |
| --- | --- |
| Change unrelated B2 metadata in shared learning JSON | All 41 pass |
| Edit B7 referenced text without changing its value type | All 41 re-resolve successfully |
| Remove B7 `recall_spine` | Only B7 fails; other 40 pass |
| Change B7 `recall_spine` from string to object | Only B7 fails; other 40 pass |
| Change B7 strict Core bytes | Only B7 is STALE; other 40 pass |
| Re-pin the reviewed test-only B7 revision | All 41 pass without changing page code |
| Change A3 B5 external admission bytes | Only A3 B5 is STALE; other 40 pass |
| Reorder/add a presentation object using an existing Current binding | All 41 pass |
| Add answer/closure fields to a route item | Testable neutral payload still emits IDs/labels only |

The re-pin test establishes mechanics, not permission to skip semantic review. The route test establishes the declarative projection helper, not production DOM behavior.

## 7｜Bounded metadata corrections

Across 41 Projection assets, the migration makes **355 validation-metadata edits**:

- add exact resolved `FIELD_REF.value_type`;
- make object `answer_bearing` explicit where omitted;
- constrain accepted Block Recall maps with `LABELS_AND_IDS_ONLY`;
- make `ID_AND_NEUTRAL_PROMPT_ONLY` explicit on KP fronts;
- correct A3 B5's external-contract root pointer from `"/"` to `""`.

No medical prose, stable medical identity, original question, learner order or learner evidence is rewritten. Source hashes were not blindly refreshed to make tests green.

The temporary input-capture/candidate-export workflow is removed from the final tree. The existing canonical Projection workflow is reused with read-only permissions; no automatic source migration or write-back runs in ordinary CI.

## 8｜Existing Runtime evidence stays separate

Historical Xizong QA run `34795172110` at `3cb882691ace183d46f771b910b354d0419e9d07` passed its A1/A2/A3 contracts, Astro build and A1 Runtime/Evidence journeys. That is evidence about that earlier implementation/commit.

This validation task does not promote it into proof that a new renderer consumes Projection, nor into current browser answer-leak safety. The production Runtime and private learner state were not modified here.

## 9｜Not claimed

This receipt does not claim:

- B or every future System is compiled/validated;
- medical-semantic acceptance or complete source-to-view semantic coverage;
- production Astro adoption or all learner-visible geometry fully upgraded;
- DOM/tooltip/accessibility/keyboard neutral-front safety;
- Mac aesthetics or responsive acceptance;
- question attempt-history migration or whole-paper Runtime;
- new S/K/L/P/R/E/U PASS or Kian learner progress;
- independent-auditor evidence from SELF-authored tests.

The former calibration validator dependency is closed **for the executed asset/binding/declarative-visibility scope**. Schema extension and downstream adoption still need their own applicable acceptance evidence.

## 10｜Next dependency

Do not restart A1/A2/A3 bulk production merely because this validation finishes. The assets already exist.

Use these validated inputs for the next bounded content-to-projection/consumer compatibility review. Address concrete gaps only; do not reopen medical Core or repeat historical archaeology without cause. Then the separately authorized implementation lane may consume them and perform real browser/Mac acceptance.

Question attempt history remains a separate Runtime/Evidence task: later attempts must not overwrite first-pass evidence, and marking/result exposure must remain compatible with the accepted hidden/immediate question design. This is not a blocker for unrelated Guide asset validation.
