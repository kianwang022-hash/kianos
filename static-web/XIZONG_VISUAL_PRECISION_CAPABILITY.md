# Xizong Visual / Precision Capability

Status: **CURRENT PRODUCT CAPABILITY CONTRACT**  
Scope: Current-eligible **A1 / A2 / A3** first; future Systems may reuse the same capability only when their content owners authorize it.  
Parent product status: `static-web/XIZONG_PRODUCT_STATUS.md`  
Learning authority remains `content/xizong/LEARNING_CONTRACT.md` + Current medical / learner owners.

## 1｜Separation rule

Visual / Precision must be split into three responsibilities:

```text
shared renderer / runtime capability
        ↑
stable cue / anchor / source-object binding
        ↑
independently upgradable content packs
```

The UI/runtime may land before content coverage is complete. A System with zero, partial, or richer Visual/Precision content must use the same renderer.

Missing content means **render nothing extra**. Do not create placeholder debt, fake completeness, or a second learner path.

Adding, replacing, refining, or removing a Visual crop / Precision cue is content work and must not require redesigning the shared UI.

## 2｜Visual selection

Visual is a **sparse high-value enhancement layer**, not blanket screenshot coverage.

Chat owns semantic selection. Prefer source visuals when the source image materially beats prose for learning, especially morphology, imaging, spatial relationships, curves, mechanism diagrams, or dense comparison tables.

Do not batch-capture every Lecture image merely to look complete. A1/A2/A3 may remain intentionally partial; Kian may later identify useful missing images and those can be added as content-only upgrades.

## 3｜Precision selection

Precision is selective exactness support for thresholds, numbers, classification boundaries, drug/time pairings, equal-sign ownership, and other details that benefit from explicit exact recall.

Precision must not leak onto the clean Recall front. KP-bound Precision stays post-Reveal; group-bound Precision stays at the accepted later learning moment.

Absence from the Precision index does not downgrade canonical content.

## 4｜Content-pack contract

System Visual packs live as Current content manifests under:

`content/xizong/knowledge/learner/*-source-visuals.json`

Each bundle is keyed by the stable Visual cue id and contains reviewed physical Source Object metadata plus an emitted asset path. Assets live under:

`static-web/src/assets/xizong/source-visuals/`

The shared bridge must discover valid Current manifests generically. Renderer code must not gain one import / special case per disease, Block, KP, or new image.

Required fail-closed behavior:

- invalid manifest schema / authority → fail;
- duplicate cue ownership → fail;
- missing asset → fail;
- derived asset hash drift → fail;
- missing Source Object identity → fail.

Content completeness itself is **not** a build gate.

## 5｜Initial authorized scope

A1 / A2 / A3 comprise 38 Blocks / 805 canonical KPs in the current eligible product surface.

A2 already owns a selective Learning Cue index and serves as the first reference content pack. A1/A3 content packs may be created incrementally after Chat medical/learning judgment; they do not need to reach exhaustive image coverage before the UI ships.

## 6｜Hard boundaries

This capability may not change:

- canonical medical ownership;
- Block / Logic Group / KP identity or learner order;
- original Lecture as the continuous external-primary source;
- Recall/completion timing or Evidence meaning;
- Memory admission;
- Question ownership / reviewed-only routing;
- Wrong / Uncertain repair semantics;
- learner U.

Visual / Precision enrichment can improve presentation and content support without reopening accepted S/K/L/P/R/E claims merely to keep engineering active.
