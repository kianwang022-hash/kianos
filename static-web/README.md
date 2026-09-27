# KianOS Website / Product Surface

Role: **static orientation for `static-web/`**. Live Website implementation/delivery status is owned by `CURRENT.md`. This README is not a Product, Visual or Runtime owner.

`static-web/` contains two things that must stay conceptually separate:

```text
PRODUCT / VISUAL TRUTH
→ how accepted KianOS meaning should appear and behave

ENGINEERING / RUNTIME
→ how the Website actually renders, interacts, persists and delivers it
```

The Website consumes canonical Content from `../content/`; it does not become a second Content owner.

## Zone map

### Shared Product / Visual

```text
KIAN_UI_PREFERENCES.md
→ accepted KianOS-specific visual / interaction requirements

UI_STYLE_BRIEF.md
→ shared visual language

PRESENTATION_CONTRACT.md
→ representation / blueprint / visual acceptance semantics

PRODUCT_SURFACE_CONTRACT.md
→ Home / Steward / Radar / Subject / Global Dock functional split
```

### Product / domain visual owners

```text
Steward
→ STEWARD_PRODUCT_CONTRACT.md

English
→ ENGLISH_PRODUCT_BRIEF.md
→ ENGLISH_GUIDE_DESIGN.md when needed

Politics
→ POLITICS_PRODUCT_BRIEF.md — accepted Politics product boundary
→ POLITICS_UI_REVIEW_PROTOCOL.md — whole-loop / Surface-Mapping-safe UI change method
→ POLITICS_MARXISM_DESIGN.md — Marxism cognitive grammar
→ POLITICS_HISTORY_C01_DESIGN.md — accepted History grammar; C01 is calibration/reference, not active pilot
→ POLITICS_MAO_DESIGN.md — Mao cognitive grammar
→ POLITICS_XI_DESIGN.md — Xi cognitive grammar
→ POLITICS_ETHICS_LAW_DESIGN.md — Ethics-Law cognitive grammar

Xizong
→ XIZONG_PRODUCT_BRIEF.md — accepted Xizong product / Projection boundary
→ XIZONG_UI_REVIEW_PROTOCOL.md — whole-flow-before-local-optimization method
→ XIZONG_VISUAL_LANGUAGE.md — Xizong-only L2 visual specialization
→ XIZONG_HOME_DESIGN.md — Xizong Home surface
→ XIZONG_SYSTEM_FRAMEWORK_DESIGN.md — System Framework surface
→ XIZONG_BLOCK_WORKSPACE_DESIGN.md — Block workspace surface
→ XIZONG_SYSTEM_COMPLETION_DESIGN.md — System Recall / completion handoff surface
→ XIZONG_PRACTICE_DESIGN.md — formal Practice Workbench
→ XIZONG_MEMORY_PRODUCT.md — Memory product / runtime boundary
→ XIZONG_REPRESENTATION_GATE.md — representation eligibility/safety gate
→ XIZONG_VISUAL_PRECISION_CAPABILITY.md — exact bounded Visual/Precision capability
→ XIZONG_VISUAL_REFERENCE.md — non-authoritative screenshot/reference evidence

Lexical
→ LEXICAL_PRODUCT_BRIEF.md
```

Task/domain semantics still come from the exact `../content/<domain>/` owner. Product/Visual files may present accepted meaning; they may not invent it.

### Website implementation / Runtime

```text
src/
→ pages / components / client-runtime libraries / styles

scripts/
→ browser QA / validators / Current delivery / Candidate runtime / maintenance

public/
→ emitted public assets

astro.config.mjs + package.json
→ Website build/runtime configuration
```

### Current / delivery

```text
CURRENT.md
→ Website implementation/delivery cursor + symptom router

LOCAL_CURRENT_SYNC.md
→ managed local Current delivery/recovery details
```

Candidate `4322` is the ordinary UI/Human-Gate engineering lane. Managed Current `4321` is Stable learner/use runtime.

## BUILD / UI implementation path

This section describes Website **BUILD**, not the full CREATE → BUILD → AUDIT → REAL USE lifecycle. If product/learning/visual meaning is still open, resolve it in CREATE first through the exact owner.

```text
accepted CREATE basis / concrete implementation defect
→ exact Rule / Product / Content / Visual owner
→ actual consumer
→ smallest implementation delta
→ Candidate real-browser proof
→ applicable native/local proof + Human Gate
→ durable merge + managed Current promotion
→ stable consumer readback
```

After BUILD, a broader AUDIT—when warranted—independently verifies that the promoted Website faithfully realizes the accepted design under real consumer/state/failure paths. This README does not define that audit method.

A Website claim is not accepted merely because a route, selector, screenshot or build exists. The applicable Acceptance owner decides what evidence is sufficient.

## Content / consumer boundary

Normal durable content change should look like:

```text
canonical Content changes
→ existing projection/adapter when needed
→ existing Website consumer
→ visible/runtime effect
```

If Current Content/Rule/Visual should affect the product but no real consumer shows the effect, that is a consumer defect—not a reason to duplicate the content inside the page.

Conversely, material learner/product behavior visible in the Website must trace back to a legitimate Current owner rather than becoming page-local semantic invention.

## Runtime/state boundary

- browser/private learner state stays with its native Runtime owner;
- compact private recovery/checkpoint/control transport uses the existing private Runtime paths;
- Candidate test state is non-authoritative;
- missing Current assets fail closed;
- history/legacy is not a semantic fallback.

## Principle

**Product/Visual defines the accepted experience; Engineering realizes it; Acceptance proves the real consumer.**
