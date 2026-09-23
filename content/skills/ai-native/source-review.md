# AI-native Source Review

Status: READY SOURCE REVIEW  
Role: 后台证据与时效边界，不是 learner-facing API 手册。  
Scope: whole-book Source review for ai-native.

The book is intentionally vendor-light. Fast-changing product details may appear in examples, but durable learner claims should rest on stable engineering / human-AI / risk principles.

---

## 1｜Source set

### S1 · Personal capability requirement

kian-personal-os/SKILLS.md — section AI-native building & automation.

Use for:
- Kian-specific demand;
- target identity: AI-native builder with technical control, not prompt-only use;
- capability scope: collaboration, orchestration, technical building, dependency control.

Boundary:
- internal requirement source, not external evidence for general AI claims.

### S2 · NIST AI RMF 1.0 + Generative AI Profile

Sources:  
https://www.nist.gov/itl/ai-risk-management-framework  
https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10

Use for:
- risk management as an ongoing system concern;
- generative-AI-specific risk awareness;
- governance / measurement / management framing.

Boundary:
- risk framework, not a coding tutorial or universal architecture recipe;
- AI RMF 1.0 is under revision, so high-risk deployment must current-first check the latest NIST material.

### S3 · Anthropic, Building Effective Agents (2024)

Source:  
https://www.anthropic.com/engineering/building-effective-agents

Use for:
- distinction between predefined workflows and more autonomous agents;
- simplest-solution-that-works principle;
- latency / cost trade-offs;
- routing, parallelization, orchestrator-workers and evaluator-optimizer patterns;
- grounding progress in environment feedback.

Boundary:
- vendor-authored practical guidance, not proof that these are the only valid architectures.

### S4 · OpenAI, A practical guide to building agents

Source:  
https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/

Use for:
- agent as model-managed workflow + tools + guardrails;
- model selection following task performance requirements;
- eval baseline before optimizing cost / latency;
- tools extending capability but needing explicit definitions and boundaries.

Boundary:
- product-oriented guidance; exact APIs / model names are volatile and should not become core learner knowledge.

### S5 · OpenAI eval guidance / Specify → Measure → Improve

Source:  
https://openai.com/index/evals-drive-next-chapter-of-ai/

Use for:
- define what good means before evaluation;
- connect eval design to real task outcomes;
- regression-oriented iteration rather than subjective prompt tweaking.

Boundary:
- evaluation details vary by task; automated graders do not replace domain judgment when the task itself requires human evaluation.

### S6 · GitHub Docs — pull-request review and continuous integration

Sources:  
https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request  
https://docs.github.com/en/pull-requests/get-started/about-pull-requests

Use for:
- diffs, review, automated checks and CI as normal software-control surfaces;
- code change should be inspectable and testable before merge.

Boundary:
- GitHub is one implementation; durable concept is versioned change + review + automated verification.

### S7 · OWASP Top 10 for LLM / GenAI Applications 2025

Source:  
https://genai.owasp.org/llm-top-10/

Use for:
- prompt injection;
- sensitive-information disclosure;
- supply-chain risk;
- improper output handling;
- excessive agency;
- other LLM application security failure modes.

Boundary:
- risk list is not exhaustive and is not a complete security architecture.

### S8 · Amershi et al., Guidelines for Human-AI Interaction (CHI 2019)

Sources:  
https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/  
https://doi.org/10.1145/3290605.3300233

Use for:
- human-AI systems need explicit handling for normal use, error, correction and change over time;
- human control / feedback design is part of system quality.

Boundary:
- broad HCI guidance predates current frontier-agent systems; use for durable interaction principles, not current model capability claims.

---

## 2｜Claim → Source map

| Capability | Main support | Boundary |
| --- | --- | --- |
| C1 problem / decomposition | S1 + software / task-design synthesis | no universal decomposition depth |
| C2 context / instructions | S1 + S7 | no magic-prompt claim; context needs are task-specific; external content can be untrusted |
| C3 model / tool / human division | S3 + S4 + S8 | model quality and pricing change; tool output can still be stale / partial / misconfigured |
| C4 technical building | S1 + S6 | GitHub / terminal are examples, not mandatory vendor lock; review is one evidence layer |
| C5 eval / debugging | S4 + S5 + S6 | eval metrics must match real task; automated graders have limits; fixed sets can overfit / drift |
| C6 agents / automation | S3 + S4 | agents are conditional architecture choices, not higher maturity |
| C7 dependency / security | S2 + S7 + S8 | security needs domain-specific threat modeling beyond a checklist |

---

## 3｜Durable boundaries

### Prompting is not the whole Skill

No claim should imply that better wording alone produces reliable systems.

Durable system quality also depends on:
- task definition;
- context;
- tools / data;
- verification;
- permissions;
- runtime behavior;
- maintenance.

### Tool output is not absolute truth

Reading files, databases, logs or live APIs usually gives better current-state evidence than relying on model memory.

But tools can still be:
- stale;
- partial;
- misconfigured;
- reading the wrong owner.

Increase independent verification when consequences rise.

### Human approval is not automatically safety

A human gate only adds meaningful control when the person:
- can see the relevant evidence;
- has enough time and capability to understand it;
- can genuinely reject the action;
- is not reduced to repetitive rubber-stamping.

Human approval does not replace least privilege, tests, reversibility or deterministic controls.

### More agentic is not automatically better

Use agent complexity only when task uncertainty or dynamic tool selection earns the extra:
- cost;
- latency;
- failure surface;
- observability burden.

### More autonomy requires stronger control

When systems can take actions, permissions and reversibility become part of capability design.

### AI-generated code is still software

It inherits ordinary needs:
- version control;
- tests;
- debugging;
- dependency management;
- security;
- deployment discipline.

### Evaluation is not a theater metric

A score is useful only if:
- it corresponds to the intended task;
- examples are representative enough to change decisions;
- regressions can be detected;
- fixed eval sets are refreshed with unseen / production evidence when reality changes;
- human judgment remains where the criterion itself is subjective or high-stakes.

### Vendor APIs are volatile

Do not teach a current API surface as if it were a durable mental model.

Durable concepts:
- model;
- context;
- tool;
- environment;
- state;
- permissions;
- evaluation;
- observability;
- stop conditions.

---

## 4｜Known volatility gate

Re-check current vendor documentation before teaching:
- exact model names;
- API names;
- SDK syntax;
- pricing;
- context limits;
- current tool availability;
- hosted agent products;
- retention / data-use policies.

These details belong to current task execution, not permanent book memory.

---

## 5｜Whole-book attack targets

Before promotion to READY, attack at least:

1. prompt-technique overfit — does any section imply clever prompts replace system design?
2. agent overengineering — does the book reward unnecessary autonomy / multi-agent complexity?
3. vendor lock-in — are volatile vendor products presented as durable capability?
4. eval theater — do evals measure what is easy rather than what matters?
5. technical-control theater — can the learner still be helpless when generated code breaks?
6. security checklist illusion — are prompt injection / secrets / permissions treated too shallowly?
7. Native Floor confusion — does AI-can-do-it get mistaken for Kian-no-longer-needs-judgment?
8. Research / Decision boundary collision — are evidence truth and value / commitment quietly re-owned here?

Promotion requires concrete repair of material defects, not a second endless audit.
---
## 6｜Cross-Skill owner boundary

### Decision Quality owns
- 这个目标是否值得做；
- 价值、机会成本、风险取舍；
- 是否继续投入更多钱 / 时间 / 注意力。

AI-native receives an accepted objective and builds the execution system.

### Information Research owns
- 外部事实 / claim / citation 是否可信；
- 来源、证据强度、时效与适用性。

AI-native can operate search / tools and verify system behavior, but does not silently certify research truth.

### Adaptive Learning owns
- 哪些 AI / technical capabilities Kian 必须亲自形成；
- 怎么验证最低自主能力；
- 能力形成以后什么时候停止继续学。

AI-native is one high-leverage application domain of that Learning engine.

---
## 7｜Closure pass 1 — 2026-09-23
Whole-book bounded self-attack completed against prompt overfit, agent overengineering, vendor lock-in, eval theater, technical-control theater, security checklist illusion, Native Floor confusion and owner collision.

Material repairs:
- environment / tool output 改成 current-state evidence，并保留 stale / partial / misconfiguration 风险；
- human gate 增加信息可见、真实拒绝权和 rubber-stamp boundary；
- eval 增加 fresh sample / production case / distribution-change 边界；
- security 增加 sensitive-data flow / provider-policy current check；
- learner jargon 第一次出现时补中文含义；
- Research / Decision / Learning owner 重新锁定；
- exact vendor surface 继续保持 volatility gate。

Verdict:

> **PASS — learner-ready at the Content layer.**

This does **not** claim:
- Kian has mastered the Skill;
- every task needs an eval suite, workflow or agent;
- any current vendor / API is permanent;
- one security checklist is sufficient for a high-risk system;
- one successful demo proves stable reliability;
- real learner-use evidence already exists.

Reopen only for a real learner question, material content defect, Source/security/vendor change that alters a durable claim, or real-use evidence that exposes the earliest responsible owner.
