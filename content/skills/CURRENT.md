# Skills Current

Role: thin routing entry for the generic learner-facing Skill Library.

## Current product

Skill Library turns a promoted Personal capability into a concrete learner product using the same KianOS separation already proven in exam subjects:

```text
Content
→ Visual projection
→ Runtime learner progress
```

Current first instance:

- `high-energy` — 高精力自我调节

## Owners

| Need | Owner |
| --- | --- |
| Cross-skill learning semantics | `content/skills/LEARNING_CONTRACT.md` |
| Skill discovery/order | `content/skills/manifest.json` |
| Exact skill learner content | `content/skills/<skill>/manifest.json` + referenced assets |
| Generic Astro projection | `static-web/src/lib/skills.mjs` + `static-web/src/pages/skills/**` |
| Skill visual language | `static-web/src/styles/skills.css` |
| Browser-local resume/progress | `static-web/src/lib/skillRuntimeClient.mjs` |

Personal OS still owns why a capability deserves portfolio space, demand discovery and cross-domain personal judgment. KianOS owns the learner-facing Skill content once activated.

## Boundary

- Do not make every Personal interest a Skill.
- Do not build one Astro implementation per Skill.
- New Skill content should normally require no Visual/Runtime code changes.
- Source Review is content quality evidence, not learner evidence.
- File existence is not learning completion.
- Health/medical Skills must preserve professional-evaluation boundaries and must not become diagnosis products.

## Stop / reopen

V1 is complete when one generic renderer can project `high-energy` from content only, save a lightweight learner resume locally, and pass build/regression. Add more Runtime machinery only after real use shows a concrete need.
