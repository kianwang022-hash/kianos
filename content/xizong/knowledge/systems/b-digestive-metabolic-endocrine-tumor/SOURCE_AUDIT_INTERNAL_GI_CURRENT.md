# Xizong B S2 Internal Medicine — Current GI/Liver/Pancreas Exact Membership 2013–2025

Status: `PASS_BOUNDED`  
Scope: B-System Internal Medicine digestive / liver / pancreas official-question membership directly recoverable from the Current Unified Internal Medicine Source, years 2013–2025  
Authority: S2 evidence shard only; `SOURCE.md` remains B Source owner and Current Question Truth remains canonical qid identity.

This tranche admits **Internal-medicine-owned diagnosis / mechanism / medical-management questions**. Operative / perioperative / procedural questions printed as cross-links inside Internal chapters are explicitly carried to the Surgery source tranche instead of being double-owned here.

No Question→Block/KP relations are created.

---

## 1｜Method

```text
Current Internal Source exact qtag / case range
+ exact Current Question Truth identity
+ tested medical construct
+ subject-owner check: Internal vs Surgery cross-link
+ neighboring-System collision attack
→ B System Internal evidence membership
```

`tested construct > chapter adjacency > disease-name occurrence`.

Multi-question ranges are expanded to exact qids before counting.

---

## 2｜Admitted exact qids

Count: **110 unique exact qids**.

### A. GERD — 10

Source ranges:

- `2016N66`
- `2017N79–81`
- `2019N50`
- `2020N50`
- `2021N49`
- `2022N50`
- `2023N49`
- `2025N50`

Expanded exact count: `10`.

Tested constructs include GERD recognition, acid-suppression / symptom-management principles and differential reasoning taught in the Current Internal source.

### B. Gastritis — 6

- `2015N171`
- `2017N50`
- `2018N50`
- `2019N156`
- `2020N156`
- `2022N51`

Expanded exact count: `6`.

### C. Peptic ulcer / upper-GI bleeding medical model — 22

- `2013N66`
- `2013N68`
- `2013N99–101`
- `2014N99–101`
- `2015N66`
- `2015N143–144`
- `2016N67`
- `2018N51`
- `2019N51`
- `2020N51`
- `2021N50`
- `2021N68–69`
- `2021N156`
- `2025N79–81`

Expanded exact count: `22`.

The admitted set is restricted to ulcer / bleeding recognition, etiologic reasoning, medical diagnosis and medical treatment within the Internal owner. Surgery-specific cross-links are deferred in Section 3.

### D. Intestinal tuberculosis / tuberculous peritonitis — 6

- `2021N51`
- `2024N51`
- `2025N51`
- `2025N68–70`

Expanded exact count: `6`.

B owns the digestive-organ disease model here; complete TB infection/immunopathology remains an infection interface.

### E. IBD — 13

- `2013N143–144`
- `2014N68`
- `2017N156`
- `2019N79–81`
- `2020N52`
- `2023N79–81`
- `2024N50`
- `2025N52`

Expanded exact count: `13`.

### F. IBS — 6

- `2016N68`
- `2018N79–81`
- `2025N130–131`

Expanded exact count: `6`.

### G. Hepatic encephalopathy — 10

- `2014N66`
- `2015N99–101`
- `2018N52`
- `2019N52`
- `2021N79–81`
- `2022N52`

Expanded exact count: `10`.

#### Source-adjacency repair: `2019N52`

The Current Unified Internal source happens to print `2019N52` beside diabetes material, but the stem is:

`long hepatitis history + upper-GI bleeding + spider nevi + new confusion → first consider hepatic encephalopathy`.

Decision: **GI/liver Primary**, not diabetes/endocrine. It was therefore excluded from the endocrine tranche and admitted here exactly once.

### H. HCC — Internal diagnosis / medical evidence layer — 10

- `2013N171`
- `2014N171`
- `2015N79`
- `2017N51`
- `2020N79–81`
- `2024N79–81`

Expanded exact count: `10`.

Operative / rupture-management / surgery-specific HCC questions printed in the same chapter are deferred to Surgery evidence rather than counted here.

### I. Cirrhosis / portal hypertension — 21

- `2013N57`
- `2013N67`
- `2014N67`
- `2016N99–101`
- `2016N143–144`
- `2017N41`
- `2017N52`
- `2018N68–69`
- `2021N41`
- `2022N156`
- `2023N50`
- `2023N70–72`
- `2023N130–131`
- `2024N52`

Expanded exact count: `21`.

### J. Acute pancreatitis — Internal core medical model — 6

- `2015N67`
- `2022N79–81`
- `2023N51`
- `2024N156`

Expanded exact count: `6`.

These cover the medical disease model: recognition, severity / laboratory interpretation, complications and non-operative management to the depth owned by Internal Medicine. Surgery / procedural cases are carried forward separately.

---

## 3｜Explicit Surgery cross-links — DEFER, do not double-count here

The Current Internal source intentionally prints several Surgery-oriented questions next to the same diseases. They are **not lost** and they are **not counted in the 110 Internal-evidence qids**.

### PUD / upper-GI bleeding surgery cross-links

- `2013N80` — post-gastric-surgery dumping syndrome interface.
- `2016N82` — pyloric-obstruction perioperative preparation.
- `2017N95–96` — perforation / operative decision chain.
- `2020N57` — variceal bleeding proportion / surgery-linked teaching context.
- `2023N98–99` — post-Billroth-II complication chain.

Action: `DEFER → Surgery S2 adjudication`.

### HCC surgery cross-links

- `2016N177`
- `2018N96–97`
- `2019N100–102`
- `2021N161`
- `2022N162`
- `2024N132–133`

These include transplant / resection / rupture / operative or surgical oncology decisions.

Action: `DEFER → Surgery S2 adjudication`.

### Acute-pancreatitis surgery / critical-care cross-links

- `2013N82`
- `2014N114–117`
- `2015N114–115`
- `2016N111–112`
- `2016N176`
- `2017N163`
- `2018N98–99`
- `2022N160`
- `2023N96–97`
- `2025N160`

Action: `DEFER → Surgery S2 adjudication` unless fresh Surgery readback shows that a particular tested construct is actually Internal-owned. No semantic verdict is forced here merely because the qid is printed in the Internal chapter.

This is subject-evidence separation only. Many of these questions are expected to remain **B System** after Surgery review.

---

## 4｜Neighboring-System boundaries

### Complete renal water/electrolyte / acid-base remains A3

Cirrhosis / DKA / vomiting can cause renal or acid-base consequences, but a question whose tested decision is renal transport, GFR, ADH water handling or complete acid-base physiology is not imported into this Internal B tranche merely because a B disease triggered it.

### Complete hematology / coagulation remains C

GI bleeding and liver disease may produce anemia/coagulopathy, but complete blood-cell morphology / coagulation cascade remains C unless the tested construct is specifically B organ failure causing that complication.

### Complete infection remains its owner

Intestinal TB and TB peritonitis are B digestive disease applications. General TB microbiology / immunopathology is not re-owned.

### Surgery owns operative procedure decisions

B as a System includes surgery diseases, but S2 subject evidence remains separated. Internal Medicine does not become the evidence owner for operative technique simply because a cross-link is printed in the Internal Lecture.

---

## 5｜Exact-count reconciliation

```text
GERD                         10
Gastritis                     6
PUD / UGIB medical           22
Intestinal TB / TB peritonitis 6
IBD                           13
IBS                            6
Hepatic encephalopathy       10
HCC medical evidence         10
Cirrhosis                     21
Acute pancreatitis medical    6
--------------------------------
Current Internal GI total   110
```

All categories are disjoint after `2019N52` is routed to hepatic encephalopathy and Surgery cross-links are deferred.

`110` is an evidence result, not a target.

---

## 6｜Batch verdict

`S2-IM-GI-CURRENT-2013-2025 = PASS_BOUNDED`

- admitted Internal-evidence exact qids: `110`;
- multi-question ranges expanded before counting;
- source-adjacency error `2019N52` repaired;
- Surgery cross-links isolated rather than double-counted;
- renal / hematology / infection boundaries protected;
- no Question→Block/KP mapping created.

Current Internal source tranches now closed:

```text
Endocrine current  77
GI/liver/pancreas 110
---------------------
subtotal          187
```

This `187` is **not** yet unique overall Internal closure because older sparse years / 2026 reconstruction, whole-Internal negative space and cross-subject dedupe remain open.

Next S-only step: reconstruct older sparse Internal Medicine B membership and 2026 Current Question Truth, then run whole-Internal negative-space + dedupe before declaring Internal Medicine PASS.

K/L/P/R/E remain frozen.
