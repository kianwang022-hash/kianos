# Business / Product Source Review

Status: READY SOURCE REVIEW  
Role: whole-book evidence and boundary map for business-product; 后台证据边界，不是 learner-facing 商业术语表。

商业与产品包含大量经验性框架。这里必须区分：

- 直接可验证的经济关系；
- 有研究支持的实验原则；
- 政府 /教育机构的商业实践框架；
- accelerator / company 的实战经验；
- 仅仅流行的创业口号。

不把最后一类升级成定律。

---

## S1｜Personal capability requirement

Source:
kian-personal-os/SKILLS.md — Business, product & distribution.

Accepted:
- role = convert real needs into real value and eventually real payment;
- scope includes opportunity, customer, product, commercial, distribution and validation;
- mother loop = need → product → user → payment → evidence → iterate or stop.

Boundary:
- Kian-specific portfolio demand, not external proof.

---

## S2｜NSF I-Corps — customer discovery

Sources:
https://www.nsf.gov/funding/initiatives/i-corps/about-teams
https://www.nsf.gov/funding/initiatives/i-corps/information-accepted-national-teams

Accepted:
- customer discovery requires direct contact with potential customers, partners and stakeholders;
- the goal is evidence about customer segments, value propositions and potential product-market fit;
- discovery should change the business-model path rather than merely produce a presentation.

Boundary:
- I-Corps is designed especially around science / deep-tech commercialization;
- its interview volume and program cadence are not universal quotas for every business;
- interviews are evidence, not demand proof by themselves.

---

## S3｜U.S. SBA — market research, business model, marketing / sales, break-even

Sources:
https://www.sba.gov/counseling/plan-your-business/
https://www.sba.gov/business-guide/manage-your-business/marketing-sales

Accepted:
- market research combines customer and economic information;
- competitive analysis should include direct and indirect alternatives;
- business planning must connect customer segments, value proposition, channels, cost structure and revenue streams;
- break-even and contribution margin make basic price / cost constraints explicit.

Boundary:
- SBA material is broad small-business guidance, not a universal startup sequence;
- break-even does not capture retention, CAC, support burden, cash timing or strategic uncertainty.

---

## S4｜Christensen et al. — Jobs to Be Done

Source:
https://hbr.org/2016/09/know-your-customers-jobs-to-be-done

Accepted:
- customer choice can be investigated by asking what progress / outcome a person was trying to achieve in a concrete situation;
- context and alternatives may be more informative than demographic labels alone.

Boundary:
- JTBD is a useful lens, not a single scientifically settled theory of all purchasing behavior;
- do not turn it into mandatory interview vocabulary.

---

## S5｜Y Combinator — product-market fit / early startup practice

Sources:
https://www.ycombinator.com/blog/the-real-product-market-fit/
https://www.ycombinator.com/blog/ycs-essential-startup-advice/

Accepted:
- early teams should stay close to users and real product use;
- scaling before a product reliably solves a meaningful problem can magnify waste;
- manual / unscalable delivery can be rational when it cheaply creates learning and initial value.

Boundary:
- YC advice is accelerator experience, not neutral causal evidence;
- there is no universal PMF threshold, growth rate or founder ritual;
- fundraising, hype or team size are not product-market evidence.

---

## S6｜Stripe — practical pricing guidance

Sources:
https://stripe.com/resources/more/value-driven-pricing
https://stripe.com/resources/more/pricing-a-product

Accepted:
- pricing should consider customer value, willingness to pay, alternatives, costs and business goals;
- packaging / pricing can vary by customer segment and value metric;
- pricing should be observed and iterated after launch.

Boundary:
- Stripe is a commercial vendor;
- stated willingness to pay can differ from real purchase behavior;
- no single pricing method dominates every market.

---

## S7｜Microsoft Research — online controlled experiments

Sources:
https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/
https://www.microsoft.com/en-us/research/publication/the-benefits-of-controlled-experimentation-at-scale/

Accepted:
- properly designed randomized controlled experiments can identify causal effects of product changes on measured outcomes;
- experimentation can challenge confident internal product beliefs.

Boundary:
- A/B tests require suitable traffic, randomization, trustworthy instrumentation, metrics and implementation;
- experiment validity can be broken by allocation / tracking problems, interference and other data-quality defects;
- short-term metric movement may not represent long-term value;
- early products often need qualitative / manual evidence before large-scale experimentation is useful;
- causal estimates are scoped to the tested intervention, measured outcome, population and time window; they do not establish the whole business case.

---

## Claim → Source map

| Capability | Main support | Hard boundary |
| --- | --- | --- |
| C1 opportunity / market | S1 + S2 + S3 | trend ≠ opportunity; market-size estimate ≠ reachable demand |
| C2 customer discovery | S2 + S4 | interviews ≠ purchase proof; stated preference can mislead |
| C3 product / MVP | S2 + S5 | MVP has no universal size or build-time rule |
| C4 pricing / economics | S3 + S6 | WTP questions are weaker than real behavior; break-even is partial |
| C5 positioning / distribution | S3 + S5 | no universal channel; product quality alone does not create reach |
| C6 commercial experiments | S2 + S7 | A/B testing is conditional, not the default for every early problem |
| C7 repeat / scale / stop | S5 + S3 + Decision interface | no universal PMF metric; resource commitment remains Decision |

---

## Durable boundaries

### Interview theater

A customer saying:
> sounds useful

is not equivalent to:
> I changed behavior, accepted risk, spent time or paid.

Interview quality improves when questions focus on concrete past behavior, current workflow, alternatives and constraints.

### PMF is not a badge

Product-market fit is a useful shorthand for strong repeated demand, but there is no universal single metric that establishes it for every business.

Use domain-relevant combinations such as:
- retention / repeat use;
- repeated purchase;
- pull from customers;
- sales repeatability;
- willingness to accept switching cost;
- economics that do not deteriorate with every additional customer.

### MVP is not a religion

The smallest product is not automatically the best experiment.

The artifact must still:
- expose the risky assumption;
- deliver enough value for behavior to be meaningful;
- avoid misleading users.

### Payment is strong evidence, not omniscient evidence

A payment can still come from:
- novelty;
- discount;
- one unusual customer;
- budget that will not renew.

Look for repeatability and retention.

### Product taste is not feature voting

Customer evidence constrains product decisions.

It does not eliminate the need to synthesize:
- coherent experience;
- technical possibilities;
- strategy;
- simplicity;
- long-term product direction.

The reverse is also true: “taste” cannot be used to ignore repeated evidence that users fail, leave, refuse to buy or cannot understand the product.

### Metrics can be gamed

A metric is useful only if it tracks the outcome that matters.

Acquisition without retention, revenue without margin, engagement without customer value and conversion purchased at unsustainable cost can all create false progress.

### Scaling is conditional

Scale only after enough evidence exists that the thing being amplified is desirable and economically survivable.

This is a decision under uncertainty, not a universal maturity threshold. Different businesses can rationally scale different components at different times.

---

## Whole-book attack targets

Before READY, attack:
1. interview theater;
2. PMF mythology;
3. MVP cargo cult;
4. vanity metrics;
5. pricing fantasy;
6. growth-at-all-costs;
7. product-taste-vs-data false dichotomy;
8. distribution-after-product thinking;
9. Decision / Research / Communication owner collisions.

Promotion requires one bounded repair pass, not recurring audit.
---
## Closure pass 1 — 2026-09-23

Whole-book bounded self-attack completed against:
- interview theater;
- PMF mythology;
- MVP cargo cult;
- vanity metrics;
- pricing fantasy / false precision;
- growth-at-all-costs / premature scaling;
- product-taste-vs-data false dichotomy;
- distribution-after-product thinking;
- Decision / Research / Communication owner collision.

Material repairs:
- MVP from a fixed “two hard conditions” definition to a bounded design check;
- A/B claims narrowed to scoped causal estimates under valid randomization / measurement / implementation;
- experiment section adds allocation / tracking / interference validity checks;
- scale language changed from “prove then scale” to accumulating repeatability evidence under uncertainty;
- pivot language changed from “proved” to “supported by evidence”;
- Sales boundary separated from deep persuasion / negotiation capability;
- business jargon first-use translated into learner language;
- current NSF I-Corps 100-interview rule retained only as an explicit program-specific example, not a universal quota.

Verdict:

> **PASS — learner-ready at the Content layer.**

This does **not** claim:
- Kian has mastered business / product capability;
- interviews, payment, retention or any single metric proves product-market fit;
- every early product needs an A/B test;
- every business should be a scalable software company;
- every successful business follows one startup sequence;
- learner real-use evidence already exists.

Reopen only for a real learner question, material content defect, Source change that alters a durable claim, or real commercial evidence that exposes the earliest responsible owner.
