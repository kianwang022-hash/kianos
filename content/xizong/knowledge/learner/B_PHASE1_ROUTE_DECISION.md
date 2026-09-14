# B Phase 1 Route Decision — causal DAG + partial-System checkpoints

Status: **PHASE1_DECISION_EVIDENCE — NOT A SECOND LEARNING OWNER**  
Scope: `B — Digestive / Metabolic / Endocrine / Tumor`  
Execution task: GitHub Issue `#135`  
Phase 0 rubric: `B_PHASE0_LEARNING_CALIBRATION.md`  
Canonical B Learning owner remains: `b-digestive-metabolic-endocrine-tumor-learning.json`

This file freezes the accepted Phase 1 construction decision so Phase 2 can integrate it into the single canonical B Learning owner. Runtime / Projection must not consume this receipt directly. The current `L_CANDIDATE.system_route` remains unaccepted and must not outrank this decision during Phase 2 construction.

---

# 1｜Phase 1 verdict

**PASS.**

The current B route has real causal insight but is over-linearized.

Fresh Current-first review against:

- accepted B `system.json` Knowledge DAG;
- six Phase-0 calibration Blocks;
- Current canonical Block owner prerequisite / Recall / Defer contracts across GI, metabolism, endocrine, molecular and hepatobiliary branches;

found four material route defects:

1. The current route places `D5–D8` after only `M1–M4`, while Current D5/D7/D8 explicitly consume later lipid / fasting / nitrogen models. The frontmatter references are themselves sometimes over-broad, so the fix is a true dependency DAG rather than `learn M1–M10 first`.
2. `ARC2_CORE_METABOLISM` and `ARC4_METABOLIC_BRANCHES` are not separate sequential learner stages. M5→M6→M7 and M8/M9/M10 have real cross-dependencies with M2–M4; metabolism is one branched network.
3. `G1–G5` cannot remain the last Arc. G1 requires M1+M9, and organ-tumor Blocks such as D11/D18 explicitly require the molecular + pathology Tumor Gate before organ-specific tumor application.
4. `ARC5_GI_CLINICAL` is not one chain. Upper-GI disease, chronic bowel disease, abdominal-space/surgical emergency and colorectal/tumor paths branch and later rejoin.

Therefore:

```text
old model
7 serial Arcs + one direct_route

→ REJECT as learner-order authority

accepted model
causal readiness DAG
+ low-switching default route
+ non-gating partial-System reconstruction checkpoints
```

---

# 2｜Relationship vocabulary

Use only relations that materially change learner readiness or return behavior.

### `REQUIRES`
The target Block cannot form its intended complete first-pass model safely without the source model already existing.

### `BENEFITS_FROM`
Prior learning materially reduces load / improves discrimination, but the target can still form correctly without making it a hard gate.

### `INDEPENDENT_BRANCH`
Once its own prerequisites are satisfied, the branch may be learned without waiting for unrelated siblings.

### `RETURNS_TO / REACTIVATES`
A later Block deliberately calls a previously learned model back into working memory; this is not new Primary ownership.

Hard rule:

> A source-local `Recall` or historical `prerequisites` list is evidence for dependency judgment, not automatic proof that every named item is a hard gate.

---

# 3｜Accepted dependency graph

## 3.1 GI normal input / processing foundation

```text
D1 → D2 → D3 → D4
```

Classification:

- `D1 REQUIRES none inside B` for the normal GI control foundation.
- `D2 REQUIRES D1` — organ movement/secretion uses the control language.
- `D3 REQUIRES D2` — duodenal pancreatic/biliary response begins from the gastric output state and extends the continuous digestion chain.
- `D4 REQUIRES D3` — selective absorption assumes macromolecules have already been processed into absorbable units.

This is the strongest genuinely serial B sub-chain and is retained.

---

## 3.2 Metabolic network｜one branched network, not ARC2 then ARC4

Shared enzyme/cofactor language:

```text
M1
↓
M2  carbon oxidation / TCA / OXPHOS
```

From there the network branches and reconverges:

```text
M2 → M3        RBC / PPP / NADPH
M2 → M4        glycogen / gluconeogenesis

D4 + M1 → M5  lipoprotein transport
M2 + M5 + D3 + M1 → M6  cholesterol / phospholipid / bile acid
M2 + M3 + M4 + M6 + D4 → M7  TAG / FA / beta-oxidation / ketone

M1 + M2 + M3 + M4 + M7 + D4 → M8  amino acid / nitrogen / one-carbon
M1 + M2 + M3 + M8 → M9             nucleotide / antimetabolite
M1 + M2 + M3 + M6 + M8 → M10       heme / bilirubin / biotransformation
```

Dependency interpretation:

- `M1 REQUIRES` no B metabolic predecessor; D4 protein-absorption context `BENEFITS_FROM` but does not make M1 impossible.
- `M2 REQUIRES M1` for enzyme/cofactor language.
- `M3 REQUIRES M2` for glycolysis / redox substrate.
- `M4 REQUIRES M2`; M3 only contributes a neighboring G-6-P branch.
- `M5 REQUIRES M1`; `BENEFITS_FROM D3/D4` for external-lipid entry/CM context.
- `M6 REQUIRES M1 + M2 + M5`; `BENEFITS_FROM D3` for bile-salt GI context.
- `M7 REQUIRES M2 + M3 + M4 + M6`; `BENEFITS_FROM D4` for absorbed-lipid entry.
- `M8 REQUIRES M1 + M2 + M3 + M4 + M7`; `BENEFITS_FROM D4` for amino-acid/B12 entry.
- `M9 REQUIRES M1 + M3 + M8`; M2 energy language is supportive rather than a separate new gate once the upstream network exists.
- `M10 REQUIRES M1 + M2 + M3 + M6 + M8`.

### Important correction to old frontmatter breadth

Do **not** interpret `D5 prerequisites: M1-M10` or `D7 prerequisites: M1-M10` as proof that M9/M10 must be learned before energy/endocrine control. M9 primarily unlocks the molecular-information branch; M10 primarily unlocks bilirubin/hepatic-biliary clinical reasoning.

---

## 3.3 Energy / endocrine control branch

### D5｜energy / temperature / stress / nutrition

Accepted direct prerequisites:

```text
REQUIRES D4 + M2 + M4 + M7 + M8
```

The rest of M1–M8 is already transitively available through those owners. M9/M10 are **not** hard prerequisites.

### D6｜endocrine common language

```text
REQUIRES external P0 signal-transduction language
BENEFITS_FROM D5 + M1 + M6
```

D5→D6 remains a good low-switching default, but not because D6's axis/feedback model logically cannot exist before D5.

### D7｜fed–fasting / pancreatic hormones

```text
REQUIRES D5 + D6 + M2–M8 metabolic state model
```

This is why the old route `M1–M4 → D5–D8 → M5–M10` is not acceptable.

### D8｜diabetes

```text
REQUIRES D7
REACTIVATES M2–M8
BENEFITS_FROM M5/M6 lipid-transport/cholesterol discrimination for chronic-risk context
```

`M9` is not accepted as a hard D8 prerequisite merely because the old frontmatter listed `M2–M9`.

### D21 / D22 / D23｜endocrine organ branches

```text
D21 REQUIRES D6
D22 REQUIRES D6
D23 REQUIRES D6
```

Additional relations:

- D21 `REACTIVATES M2–M7` for metabolic/circulatory effects.
- D21 contains organ-tumor Primary, so full continuous D21 learning should occur after the Tumor Gate defined below.
- D22 `BENEFITS_FROM M6` (steroid precursor) and `M8` (tyrosine/catecholamine interface), plus previously learned circulation/renal interfaces.
- D23 `BENEFITS_FROM D21` for thyroid-surgery/C-cell interfaces and requires its external renal/VitD interface only where Current says so.

D21→D22→D23 is therefore a **low-switching default**, not a hard sibling dependency chain.

---

# 4｜Molecular information / tumor gate

## 4.1 Molecular branch

Current prerequisites support:

```text
M1 + M9 → G1
G1 + M1 → G2
G1 + G2 + M1 + M8 → G3
G1 + G3 → G4
G1 + G2 + G3 + G4 + M9 → G5
```

Default learner sequence remains:

```text
G1 → G2 → G3 → G4 → G5
```

because those dependencies are real, not merely file order.

### G5 internal learner-order correction from Phase 0

Stable KP identity remains unchanged, but learner order must be:

```text
KP01–05  abnormal growth control
→ KP12–13 mutation / DNA repair
→ KP06–11 molecular tools
```

not stable file/KP order.

## 4.2 Tumor Gate

For B organ-tumor application, define the prerequisite conceptually as:

```text
Tumor Gate
= G molecular branch complete
+ O9 pathology tumor-general model available
```

O9 is an external retained overlay and is not added to the 38 numbered B Blocks.

The Tumor Gate must precede complete first-pass learning of organ Blocks whose Current Primary meaning includes substantive tumor diagnosis/pathology/management, including at minimum:

```text
D11  esophageal / gastric tumors
D15  colorectal cancer component
D18  HCC
D20  pancreatic tumors
D21  thyroid cancers
```

D19 also contains biliary tumors; the gate should be reactivated for those LGs, but D19's main pipeline/obstruction model is primarily gated by D3/M6/M10/D17 rather than by tumor cognition.

Hard rule:

> G1–G5 cannot remain a final afterthought Arc after these organ-tumor Blocks.

---

# 5｜GI / abdominal clinical branch

The old `D9→D10→D11→D12→D13→D14→D15` sequence is a useful low-switching listing, but not one causal chain.

## 5.1 Upper-GI path

```text
D9 REQUIRES D2
D10 REQUIRES D2 + D9
D11 REQUIRES D9 + D10 + Tumor Gate
```

D11 is therefore the true closure of this upper-GI disease/tumor path.

## 5.2 Chronic bowel path

```text
D12 BENEFITS_FROM D1–D4
D12 REQUIRES / reuses external Respiratory R7 TB common model for the TB-specific path where Current says TB pathology is already Primary there
```

D12 is not causally downstream of D11.

## 5.3 Abdominal-space / surgical-emergency path

```text
D13 INDEPENDENT_BRANCH after its external inflammation/shock interfaces
D14 BENEFITS_FROM D13 and REACTIVATES D1 mechanics
```

D14 can be understood without making D13 an artificial hard gate, but the default should keep D13→D14 because D13 supplies peritoneal irritation, contamination/bleeding and source-control language.

## 5.4 Colorectal / anorectal closure

```text
D15 REQUIRES Tumor Gate for its colorectal-cancer Primary
BENEFITS_FROM D12 + D14
REACTIVATES lower-GI location / obstruction / inflammation models
```

Thus D15 is a convergence Block, not merely “the next chapter after D14”.

---

# 6｜Hepatic / biliary / pancreatic branch

## D16｜viral hepatitis pathology

```text
REQUIRES external pathology injury/inflammation gate
BENEFITS_FROM / REACTIVATES M10 bilirubin/hepatic-processing language
```

M10 is not required to understand the morphology of D16, so it is not made an artificial hard gate here.

## D17｜cirrhosis / portal hypertension / HE

Current owner supports hard prerequisites:

```text
REQUIRES D16 + M8 + M10
+ external repair/fibrosis
+ external portal-pressure interface
```

## D18｜HCC

```text
REQUIRES D16 + D17 + Tumor Gate
```

## D19｜biliary pipeline / jaundice / stone / infection

```text
REQUIRES D3 + M6 + M10 + D17
BENEFITS_FROM D18 for liver-lesion imaging discrimination
```

## D20｜pancreatitis / pancreatic tumors

```text
REQUIRES D3 + M1 + M7 + D19
REACTIVATES Tumor Gate for the pancreatic-tumor component
```

Default hepatic branch therefore remains close to:

```text
M10 ready
→ D16
→ D17
→ D18
→ D19
→ D20
```

but D18 is not a hard prerequisite for D19, and the dependency graph preserves that distinction.

---

# 7｜Accepted low-switching default route

The DAG owns legality. The sequence below is only the **default route** chosen to reduce switching while respecting all hard dependencies.

```text
A｜normal GI foundation
D1 → D2 → D3 → D4

B｜metabolic state foundation needed for energy / pancreatic control
M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8

C｜energy / endocrine control
D5 → D6 → D7 → D8

D｜molecular gate before organ tumors
M9 → G1 → G2 → G3 → G4 → G5
+ O9 pathology tumor-general gate before first organ-tumor Block

E｜endocrine organ branch
D21 → D22 → D23

F｜upper GI + bowel + abdominal clinical branches
D9 → D10 → D11
D12
D13 → D14
→ D15 after D12/D14 + Tumor Gate

G｜hepatic chemical prerequisite + hepatobiliary/pancreas
M10
→ D16 → D17
→ D18
→ D19 → D20
```

This route is deliberately **not** one global hard chain.

### Legal flex examples

Once prerequisites are met:

- D9/D10 may move earlier after D2 without waiting for metabolism/endocrine work.
- D12 and D13 are independent sibling branches and may move earlier when source continuity is better.
- D22 can move earlier after D6 without waiting for D21 when learner/source continuity favors it.
- M10 can move immediately after M8/M6 if an early liver branch is desired.
- M9→G may move earlier once M8 is ready if an organ-tumor Block is the next target.

Hard rule:

> `default_route` reduces switching; it does not manufacture prerequisites.

---

# 8｜Intermediate compression decision

## Verdict: YES, but **not as Arc completion stages**

B is too large for:

```text
38 Block Recalls
→ first meaningful whole-System reconstruction
```

But adding Arc as another canonical learner unit / mastery gate would violate the purpose of the Xizong unit model and add ceremony.

Accepted solution:

> **Partial-System Reconstruction Checkpoints**

Properties:

- not a new medical identity;
- not a fifth canonical unit beside System/Block/Logic Group/KP;
- no separate mastery score;
- no completion prerequisite for unrelated branches;
- no Memory debt creation merely because the checkpoint exists;
- uses only already learned Blocks to reconstruct the relevant slice of the accepted B System mother model;
- short and thinner than replaying Block Recalls.

## Six checkpoint families

### `PSR-1｜GI_INPUT`
After D1–D4 naturally close:

```text
motility/control
→ secretion/digestion
→ selective absorption
→ portal/lymph entry
```

### `PSR-2｜METABOLIC_NETWORK`
After the metabolic branch is sufficiently closed (ultimately M1–M10):

```text
enzyme/cofactor language
→ carbon/ATP/redox
→ storage/mobilization
→ lipid transport
→ nitrogen/one-carbon
→ nucleotide supply
→ bilirubin/hepatic chemical handling
```

It may be revisited incrementally as M9/M10 close; this checkpoint must not force M9/M10 before D5–D8.

### `PSR-3｜ENDOCRINE_CONTROL`
After D5–D8 and D21–D23 are available:

```text
energy state
→ common axis/feedback language
→ pancreatic control / diabetes
→ thyroid/adrenal/calcium-GH localization
```

### `PSR-4｜GI_ABDOMINAL_CLINICAL`
After D9–D15 naturally close:

```text
movement/outlet
vs mucosal/inflammatory
vs bleeding/perforation/obstruction
vs abdominal-space emergency
vs organ-tumor localization
```

### `PSR-5｜HEPATOBILIARY_PANCREAS`
After D16–D20:

```text
hepatocyte injury/reconstruction
→ portal + synthetic failure
→ tumor / biliary obstruction / jaundice
→ pancreatic enzyme or tumor failure
```

### `PSR-6｜INFORMATION_TUMOR`
After G1–G5 + O9:

```text
DNA storage
→ replication / expression / regulation
→ mutation + repair
→ clonal control failure
→ pathology tumor behavior
→ organ application
```

These checkpoints replace the need for seven serial Arcs as learner-facing stages.

---

# 9｜Disposition of current seven Arcs

| Current Arc | Phase 1 disposition | Reason |
| --- | --- | --- |
| ARC1 GI_INPUT | `KEEP_AS_PSR` | D1–D4 is a real serial normal-function chain |
| ARC2 CORE_METABOLISM | `MERGE` | cannot stand separately from M5–M10 dependency network |
| ARC3 CONTROL | `KEEP_AS_PSR` | useful endocrine control compression, but not a serial stage |
| ARC4 METABOLIC_BRANCHES | `MERGE` into PSR-2 | M5–M10 feed and depend on earlier metabolism; one branched network |
| ARC5 GI_CLINICAL | `KEEP_AS_PSR / SPLIT_ROUTE_INTERNAL` | good compression region, wrong as one causal chain |
| ARC6 HEPATOBILIARY_PANCREAS | `KEEP_AS_PSR` | real shared liver/biliary/pancreas localization model with dependencies |
| ARC7 INFORMATION | `KEEP_AS_PSR / MOVE_EARLIER_WHEN_NEEDED` | real branch, but must precede organ-tumor application rather than sit last |

Net result:

```text
7 serial Arcs
→ retired as learner-order model

6 non-gating Partial-System Reconstruction checkpoint families
→ accepted as intermediate compression strategy
```

---

# 10｜Phase 1 falsification / negative-space audit

Strongest alternatives challenged:

### Alternative A｜Keep current seven Arcs and only add dependency labels
Rejected because the direct route still places D5–D8 before required later metabolic models and G after organ-tumor application.

### Alternative B｜Simplest fix: learn all M1–M10 before any endocrine/clinical Block
Rejected as over-gating. M9 is primarily a prerequisite for G/information; M10 is primarily required for liver/bilirubin/biliary branches. Forcing both before D5–D8 adds source volume without causal value.

### Alternative C｜No intermediate compression; just Block Recall → final System Recall
Rejected because 38 Blocks / 600 KPs create an avoidable long-range integration gap.

### Alternative D｜Make Arc a new mandatory learner unit with completion state
Rejected because it creates ceremony and a new unit/granularity when a short partial-System reconstruction can solve the compression problem without new mastery semantics.

### Alternative E｜Respect every canonical Block `prerequisites` field as hard truth
Rejected because Phase 1 found over-broad lists such as D5 `M1-M10` and D8 `M2-M9`; Current Block text itself shows several listed models are interfaces rather than necessary prerequisites.

---

# 11｜Phase 1 exit-gate verdict

PASS:

- default route is now causally explainable;
- hard prerequisites are separated from beneficial prior context;
- major cross-Block returns have explicit owners;
- old seven Arc shape is no longer assumed;
- intermediate compression is justified without adding a new canonical learner unit;
- G/tumor and M/hepatobiliary timing defects are explicitly corrected;
- no medical Core / KP identity changed;
- P/R/E remain frozen.

## Next eligible phase

**Phase 2 — all 38 Block learning-control upgrade.**

Phase 2 must integrate this decision into the single B Learning owner using selective `KEEP / UPGRADE / REPARTITION / BLOCKED`; it must not begin full Logic Group semantic re-acceptance beyond the partition rationale needed for each Block.