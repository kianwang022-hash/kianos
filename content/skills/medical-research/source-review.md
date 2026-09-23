# Medical Research Source Review

Status: READY SOURCE REVIEW
Role: whole-book evidence / methodology / ethics / reproducibility boundary for medical-research.

This Skill is about producing and communicating evidence.

It must not become:
- publication gaming;
- p-value optimization;
- method-name memorization;
- data dredging;
- causal language without identification;
- a reporting-checklist substitute for design;
- AI-generated science without accountable validation;
- an authorship-credit optimization system.

---

## S1｜Personal capability requirement

Source:
kian-personal-os/SKILLS.md — Medical research & scientific practice.

Accepted:
- scientific question formation;
- literature and critical appraisal;
- design, epidemiology, biostatistics and causal reasoning;
- data analysis / interpretation;
- trials / EBM;
- writing, figures and presentation;
- peer review / publication judgment;
- project management / collaboration;
- reproducibility;
- AI-assisted research validation.

Boundary:
- Personal demand source, not methodological evidence.

---

## S2｜NIH — Rigor and Reproducibility

Source:
https://grants.nih.gov/policy-and-compliance/policy-topics/reproducibility

Accepted:
- scientific rigor means strict application of scientific method to unbiased and well-controlled design, methodology, analysis, interpretation and reporting;
- reproducibility and transparency are part of biomedical scientific quality;
- rigor is not only a statistical-analysis concern.

Boundary:
- NIH grant requirements are jurisdiction / funder specific;
- this book uses the durable rigor principles, not every current grant-form requirement.

---

## S3｜National Academies — Reproducibility and Replicability in Science

Sources:
https://www.nationalacademies.org/read/25303
https://www.nationalacademies.org/read/25303/chapter/2

Accepted:
- computational reproducibility and independent replication are distinct ideas;
- science is self-correcting partly through checking results and inferences;
- failure to reproduce / replicate can reveal error, hidden conditions or new scientific questions.

Boundary:
- non-replication is not automatic proof of misconduct or false original work;
- reproducibility does not rescue a poorly posed causal question.

---

## S4｜SPIRIT 2025 + CONSORT 2025

Source:
https://www.consort-spirit.org/published-statements

Accepted:
- SPIRIT 2025 is the current updated protocol-reporting statement for randomized trials;
- CONSORT 2025 is the current updated reporting statement for randomized trials;
- trial protocols and reports require transparent prespecified and observed-method / result documentation.

Boundary:
- reporting statements are reporting tools, not complete risk-of-bias or trial-quality scores;
- exact checklist items are current-first and should be checked at use time.

---

## S5｜PRISMA 2020 + EQUATOR

Sources:
https://www.prisma-statement.org/prisma-2020
https://www.equator-network.org/
https://www.equator-network.org/reporting-guidelines/

Accepted:
- PRISMA 2020 provides current reporting guidance for systematic reviews;
- EQUATOR maintains a current library mapping study types to reporting guidelines;
- main study families use different reporting standards.

Boundary:
- correct reporting does not make the underlying evidence unbiased;
- not every research question is a systematic review;
- choose the guideline based on actual study design, not journal appearance.

---

## S6｜WMA Declaration of Helsinki 2024

Sources:
https://www.wma.net/what-we-do/medical-ethics/declaration-of-helsinki/
https://www.wma.net/policies-post/wma-declaration-of-helsinki/

Accepted:
- the 2024 version is the current official Declaration;
- human-participant research must protect rights, dignity, autonomy, privacy and confidentiality;
- informed consent, ethics review and appropriate participant protections remain central;
- human-participant research should be registered before recruitment in a publicly accessible database;
- research results, including negative / inconclusive results, carry dissemination obligations;
- scientific rigor and integrity are ethically relevant.

Boundary:
- applicable law, local IRB / ethics committee and regulatory rules remain jurisdiction-specific;
- Helsinki principles do not replace local operational requirements.

---

## S7｜NIH Clinical Trial Registration / Reporting

Sources:
https://grants.nih.gov/policy-and-compliance/policy-topics/clinical-trials/reporting/nih-policy
https://grants.nih.gov/grants/policy/nihgps/HTML5/section_4/4.1.3_clinical_trials_registration_and_reporting_in_clinicaltrials.gov_requirement.htm

Accepted:
- NIH-funded clinical trials are expected to register and report summary results through ClinicalTrials.gov under applicable NIH policy;
- public registration / reporting supports transparency and reduces hidden-result problems.

Boundary:
- exact legal / regulatory applicability differs by funder, jurisdiction and trial;
- the March 2026 NIH Grants Policy Statement is current execution information, not a permanent universal rule for all research.

---

## S8｜ICMJE Recommendations — current January 2026

Sources:
https://www.icmje.org/recommendations/
https://www.icmje.org/recommendations/browse/roles-and-responsibilities/defining-the-role-of-authors-and-contributors.html
https://www.icmje.org/recommendations/browse/roles-and-responsibilities/author-responsibilities--conflicts-of-interest.html
https://www.icmje.org/recommendations/browse/roles-and-responsibilities/responsibilities-in-the-submission-and-peer-peview-process.html

Accepted:
- authorship carries both credit and accountability;
- authorship should reflect substantive contribution, drafting / critical revision, approval and accountability under current ICMJE criteria;
- relevant relationships / activities and conflicts require transparent disclosure;
- reviewer confidentiality and conflict management matter;
- current ICMJE guidance warns about inappropriate AI use where confidentiality or correctness cannot be assured.

Boundary:
- ICMJE recommendations are publication guidance, not universal law;
- journal-specific policies can differ;
- AI-use policies are particularly volatile and must be re-checked.

---

## Claim → Source map

| Capability | Main support | Hard boundary |
| --- | --- | --- |
| C1 question / protocol | S2 + S4 | protocol clarity does not make an unimportant question important |
| C2 design / causal | S2 + scientific methodology | design label ≠ identification validity |
| C3 measurement / data | S2 + S3 | reproducible data processing cannot rescue invalid measurement |
| C4 statistics / interpretation | S2 + methodological boundary | statistical significance ≠ effect importance / causality |
| C5 ethics / reproducibility | S2 + S3 + S6 + S7 | ethics approval / registration are necessary governance, not quality guarantees |
| C6 writing / peer review | S4 + S5 + S8 | reporting guideline compliance ≠ unbiased study |
| C7 project / AI | S8 + AI-native interface | automation does not transfer scientific accountability to AI |

---

## Durable boundaries

### Question comes before convenient analysis

Do not start with:
> “What can I publish from these columns?”

Start with:
> “What uncertainty matters, and can this dataset validly address it?”

Secondary-data research can begin from available data, but the final question must still be honestly constrained by what the data can identify.

### Design label is not validity

“RCT”, “cohort”, “case-control” and “meta-analysis” are not quality scores.

Validity depends on:
- selection;
- measurement;
- confounding;
- follow-up;
- missingness;
- adherence / exposure definition;
- analysis;
- reporting.

### Statistical significance is not scientific importance

A p value does not provide:
- effect magnitude;
- clinical importance;
- probability the hypothesis is true;
- causal validity;
- replication probability.

Always inspect effect, uncertainty and design.

### Model complexity is not scientific depth

A complex model can improve prediction or fit.

It can also:
- overfit;
- hide leakage;
- amplify measurement problems;
- make interpretation less stable.

Use the lowest complexity that answers the question adequately unless added complexity earns its cost.

### Prediction and causation are different

A strong predictor is not automatically an intervention target.

A causal research question needs explicit causal assumptions and a design / analysis strategy aligned to them.

### Reproducibility is broader than code

Code and environment help computational reproducibility.

Scientific reproducibility also depends on:
- data definitions;
- protocol;
- analysis choices;
- provenance;
- transparent deviations.

### Reporting guideline is not a quality certificate

CONSORT / STROBE / PRISMA / STARD / TRIPOD and related standards help readers see what was done.

They do not prove it was well designed.

### Ethics is not paperwork

Ethics review, consent, participant protection, privacy and scientific value are part of the same research system.

A scientifically weak study can still impose unjustified burden.

### Publication is not truth status

Peer review and journal prestige are evidence about process / filtering.

They do not erase:
- bias;
- error;
- selective reporting;
- conflicts;
- irreproducibility.

### Authorship is accountability, not reward allocation

Authorship decisions should be addressed early and updated with actual contributions.

Do not trade authorship purely for hierarchy, access or favors.

### AI output must preserve provenance and verification

Never let AI:
- invent references;
- silently alter data;
- produce code no one checks;
- upload confidential manuscripts / participant data to systems without permission;
- write conclusions stronger than the design supports.

---

## Volatility gate

Before acting on:
- current CONSORT / SPIRIT versions;
- current journal AI policy;
- current ICMJE wording;
- trial registration requirements;
- ClinicalTrials.gov deadlines;
- IRB / ethics forms;
- data-sharing mandates;
- funder open-access policy;
- journal reporting checklist;
- statistical software / package behavior;

re-check current authoritative sources.

---

## Whole-book attack targets

Before READY, attack:
1. question-after-data;
2. design-name theater;
3. p-value worship;
4. causal overclaim;
5. model-complexity theater;
6. reproducibility theater;
7. reporting-guideline-as-quality;
8. publication-status bias;
9. authorship politics;
10. AI laundering;
11. ethics-as-paperwork;
12. Research / Information / Clinical owner collision.

Promotion requires one bounded repair pass, not recurring meta-research audits.
---
## Closure pass 1 — 2026-09-23

Whole-book bounded self-attack completed against:
- question-after-data;
- design-name theater;
- p-value worship;
- causal overclaim;
- model-complexity theater;
- reproducibility theater;
- reporting-guideline-as-quality;
- publication-status bias;
- authorship politics;
- AI laundering;
- ethics-as-paperwork;
- Research / Information / Clinical owner collision.

Material repairs:
- research questions are forced to identify a real knowledge gap, target estimand and honest dataset limits before analysis;
- design labels are separated from identification validity and causal assumptions;
- statistics are anchored on effect magnitude, uncertainty, assumptions and scientific relevance rather than significance status;
- prediction, association and causal questions remain separate;
- reproducibility includes data definitions, protocol, provenance, code, environment and transparent deviations rather than “a script exists”;
- reporting guidelines are kept as transparency tools, not quality certificates;
- publication and journal prestige are not treated as truth status;
- current SPIRIT / CONSORT 2025, Helsinki 2024 and ICMJE January 2026 standards are explicitly current-first;
- authorship is tied to contribution and accountability rather than hierarchy or favor exchange;
- AI-assisted search / coding / drafting / analysis retains human ownership, confidentiality, provenance and verification requirements;
- Information Research owns evidence retrieval / appraisal, Medical Research owns evidence production, and Medicine / Clinical Judgment owns patient-level application.

Verdict:

> **PASS — learner-ready at the Content layer.**

This does **not** claim:
- Kian has independent research-methodology mastery;
- any design name guarantees validity;
- p values establish truth or clinical importance;
- reproducible code proves a scientifically valid study;
- reporting-checklist compliance proves low bias;
- publication proves truth;
- AI can be an accountable author or scientific owner;
- current journal / ethics / registration rules are permanent;
- learner real-project evidence already exists.

Reopen only for a real learner question, material content defect, durable Source change, real research-project evidence, or a methodology need created by an actual project.
