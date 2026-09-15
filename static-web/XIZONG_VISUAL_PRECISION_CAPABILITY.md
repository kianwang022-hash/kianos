# Xizong Visual / Precision Capability

Status: **CURRENT PRODUCT CAPABILITY CONTRACT**  
Scope: shared Xizong learner runtime; content coverage may remain sparse and System-specific.  
Learning authority remains `content/xizong/LEARNING_CONTRACT.md` plus Current medical / learner owners.

## 1｜Separation rule

```text
shared renderer / runtime capability
        ↑
stable cue / anchor / source-object binding
        ↑
independently upgradable content packs
```

Visual / Precision capability and Visual / Precision content are separate concerns.

A System may have zero, partial, or richer enrichment without changing learner Runtime. Missing enrichment means render nothing extra; it must not create learner debt, fake incompleteness, or a second learning path.

## 2｜Selection rule

Visual is sparse high-value support, not blanket screenshot coverage. Prefer source visuals only when the image materially beats prose for morphology, imaging, spatial relationships, curves, mechanisms, or dense comparison structures.

Precision is selective exactness support for thresholds, numbers, classification boundaries, drug/time pairings, equal-sign ownership, and similar details that benefit from explicit exact recall.

Neither layer may leak answer-bearing material onto the clean Recall front.

## 3｜Content packs

Current Visual content packs live under:

`content/xizong/knowledge/learner/*-source-visuals.json`

Each bundle is keyed by the stable Visual cue id and may contain reviewed Source Object metadata plus emitted asset paths under:

`static-web/src/assets/xizong/source-visuals/`

The shared bridge discovers valid Current manifests generically. New Systems, Blocks, KPs, diseases, or images must not require one-off renderer branches.

Required fail-closed behavior at render/build boundary:

- invalid manifest schema / authority → fail;
- duplicate cue ownership → fail;
- missing referenced asset → fail;
- missing Source Object identity → fail.

Provenance hashes may remain in content packs for audit, but the learner renderer must not invent a second Visual authority merely to verify them.

Content completeness is not a build gate.

## 4｜Progressive availability

Engineering/content availability is orthogonal to learner progress.

A missing Visual / Precision pack means that enrichment capability is unavailable for that object; it does **not** mean the learner failed a prerequisite or left required work incomplete. Available Learn / Recall / Question / Repair paths continue normally.

Future content can enter the existing capability slots without changing learner journey or completion denominators.

## 5｜Hard boundaries

This capability may not change:

- canonical medical ownership;
- System / Block / Logic Group / KP identity or learner order;
- original Lecture as the continuous external-primary source;
- Recall/completion timing or Evidence meaning;
- Memory admission;
- Question ownership / reviewed-only routing;
- Wrong / Uncertain repair semantics;
- learner U.

Visual / Precision enriches an accepted route; it does not define a new route.
