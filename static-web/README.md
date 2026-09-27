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
→ POLITICS_PRODUCT_BRIEF.md
→ POLITICS_*_DESIGN.md
→ POLITICS_UI_REVIEW_PROTOCOL.md

Xizong
→ XIZONG_PRODUCT_BRIEF.md
→ XIZONG_*_DESIGN.md
→ XIZONG_REPRESENTATION_GATE.md
→ XIZONG_UI_REVIEW_PROTOCOL.md
→ XIZONG_VISUAL_* when the exact claim requires them

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

## Change path

For a material Website change:

```text
real user need / defect
→ exact Rule / Product / Content / Visual basis
→ actual consumer
→ smallest implementation delta
→ Candidate real-browser proof
→ applicable native acceptance / Human Gate
→ durable merge + managed Current promotion
→ stable consumer readback
```

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
