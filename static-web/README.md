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

## Human-facing design inheritance

Kian should be able to recover the current Website design without remembering old Chats, CSS history or implementation details.

```text
SHARED WEBSITE REQUIREMENTS
├─ PRODUCT_SURFACE_CONTRACT.md
│  → what Home / Steward / Radar / Subject / Global Dock are for
├─ PRESENTATION_CONTRACT.md
│  → how Visual inheritance, Surface Blueprints and Human Gate work
├─ UI_STYLE_BRIEF.md
│  → shared visual language
└─ KIAN_UI_PREFERENCES.md
   → KianOS-wide accepted visual / interaction preferences
            ↓ inherited by every product

PRODUCT / DOMAIN DESIGN OWNER
├─ Steward  → STEWARD_PRODUCT_CONTRACT.md
├─ English  → ENGLISH_PRODUCT_BRIEF.md
├─ Politics → POLITICS_PRODUCT_BRIEF.md
├─ Xizong   → XIZONG_PRODUCT_BRIEF.md
└─ Lexical  → LEXICAL_PRODUCT_BRIEF.md
            ↓ refine only their own product

SURFACE / TASK DESIGN OWNER
→ exact accepted page/workspace design when the product has one
            ↓

ENGINEERING IMPLEMENTATION
→ component / CSS / Runtime realizes the inherited design
→ implementation order or CSS cascade never becomes design authority
```

Hard rules:
- shared Website owners define common requirements, not one universal page layout;
- every independently meaningful product/domain keeps its own current Product/Visual design owner;
- a Surface owner may refine its product, but may not silently contradict its product parent or shared Website requirements;
- if a lower design genuinely needs to conflict with a parent, reopen that parent/child design decision explicitly in CREATE rather than letting CSS/source order decide;
- if the current design cannot be resolved from this map + exact owner chain, treat that as `OWNER_UNRESOLVED`, not permission to infer from Legacy, screenshots, old PRs or current CSS;
- old implementation/history may explain provenance, but it does not issue current design instructions.

For a normal Website request:

```text
“改这个页面 / 这个板块”
→ shared Website requirements
→ exact Product / Domain design owner
→ exact Surface owner when one exists
→ BUILD implementation
→ Candidate Human Gate when material
```

This README is the map, not another design owner.

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

Browser checks use the declared Playwright development dependency. Reuse a compatible, proof-matched dependency tree through the existing Candidate setup; if none exists, run `npm install --no-package-lock --no-audit --no-fund` once in `static-web`. If Playwright reports a missing Chromium executable, run `npx playwright install chromium` once; later checks reuse its browser cache. Do not rebuild `node_modules` or substitute a system Chrome overlay for each bounded check. Run only the existing browser check needed for the affected behavior.

For interactive browser inspection, use the official Playwright CLI. The reusable local tool version is `@playwright/cli@0.1.21`; check `playwright-cli --version` and install once with `npm install --global @playwright/cli@0.1.21` only when unavailable. Existing repository regressions keep their declared Playwright dependency. The CLI uses the installed Chrome through its supported `--browser=chrome` option, without changing repository dependencies or browser-cache links.

Use the exact Candidate URL and a unique session name for this run:

```bash
task_session="kianos-<task>-<unique-run>"
candidate_url="http://127.0.0.1:4322/<affected-route>"
PLAYWRIGHT_MCP_OUTPUT_DIR=output/playwright playwright-cli -s="$task_session" open "$candidate_url" --browser=chrome --idle-timeout=300000
playwright-cli -s="$task_session" snapshot
# Interact using references from the current snapshot; inspect the affected behavior.
playwright-cli -s="$task_session" close
```

The default in-memory browser profile is isolated; do not attach a learner browser or load its storage for ordinary BUILD proof. A real visual Human Gate uses `--headed` when needed. Keep the same named session across interactions, refresh snapshots after navigation, and close it on success or failure. The idle timeout is a crash backstop, not successful teardown. Stop the Candidate only if this task started it, then verify that its process/port is gone. Never use global `close-all` / `kill-all` as task cleanup. Browser observations support only the requested claim; the worker still compares them with the accepted requirement and must-preserve behavior.

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
