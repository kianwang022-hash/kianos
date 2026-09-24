---
type: fresh_learning_audit_checkpoint
schema_version: 1
system_id: hematology_immunity_infection
stage: L
status: PRE_CANDIDATE_MODEL_FROZEN
semantic_authority: FRESH_AUDIT_EVIDENCE_ONLY
main_examined: d36a93f81eaf4bb4aca29a649457bd9fd59068fe
pr_number: 255
candidate_opened_before_checkpoint: false
receipts_opened_before_checkpoint: false
---

# C｜血液—免疫—感染 Fresh L Pre-Candidate Checkpoint

> 本文件是 fresh auditor 在打开 PR #255 Learning candidate / shards / Phase3 receipts **之前**形成并冻结的独立模型。它只是一份 audit evidence，不是 canonical Learning owner，不得与最终 `c-hematology-immunity-infection-learning.json` 并列成第二套 authority。
>
> GitHub PR metadata 在取得 head SHA 时自动返回过 PR body；fresh auditor 已看到 builder 的摘要性自述，但在本 checkpoint 中不使用其中的 Logic Group 数量、结论或 repair 解释作为答案 key。candidate / shards / receipts 本体在本 checkpoint 冻结前均未打开。

## 1｜Fresh reconstruction basis

本 checkpoint 只依赖：

- `AGENTS.md`；
- `content/xizong/CURRENT.md`；
- `content/xizong/LEARNING_CONTRACT.md`；
- `content/xizong/knowledge/learner/study-policy.json`；
- root `LEARNING_ASSET_STANDARD.md` / `LEARNING_ACCEPTANCE.md` 的 stage semantics；
- C `system.json`；
- H1–H27 canonical Block Core；
- C Source / ownership boundaries；
- fresh-audit protocol 仅作当时的审计方法，不作 candidate 答案；一次性协议保存在 Git history。

本 checkpoint 的基本约束：

1. Block 是第一轮连续学习主单元；LG 只能服务局部认知闭环，不能把 Lecture 切碎。
2. iPad / MarginNote 原讲义是 first-pass external-primary；KianOS 是 orientation / retrieval / compression surface，不是第二本讲义。
3. canonical KP identity ≠ learner order ≠ page order ≠ question taxonomy。
4. default route 只允许表达低切换、低摩擦的学习默认路径，不能被伪装成医学 ontology。
5. Learning correctness > Projection loader compatibility；如果自然闭环要求非连续 KP membership，P 后续适配 L。
6. later pass 必须 progressively thinner；canonical KP 存在不自动制造永久 review debt。

---

# 2｜Candidate-blind learner route

## 2.1 默认低切换路线

默认低切换路线可保持：

```text
H1 → H2 → H3 → H4 → H5 → H6
→ H7 → H8 → H9 → H10 → H11
→ H12 → H13 → H14
→ H15 → H16 / H17 / H18 / H19
→ H20 → H21 / H22 / H23 / H24
→ H25 → H26 → H27
```

但这不是硬 DAG 的等价物。自然 readiness graph 更接近以下结构。

## 2.2 Hard prerequisite vs benefits_from

### Blood foundation

- **H1**：血液分支硬 Gate；H3–H11 至少需要其 CBC / Ret / morphology / marrow evidence language。
- **H2**：在 H1 后可独立学习。它不是 H3–H5 的硬前置；对 H6 的输血 / 急症支持、对 H14 的 ABO / transfusion-GVHD direction 是 `benefits_from / recall_apply`。
- **H3**：H4 / H5 的强前置，因为后两者都要求先有 anemia coordinate。跨系统铁、B12/folate、RBC metabolism 只调用既有 owner，不在 C 重取 Primary。
- **H4 与 H5**：是 H3 后的 sibling branches；互相不是硬 prerequisite。
- **H6**：真正的硬前置是正常止血 owner（Circulation B4）+ H1 的 Plt / marrow language。H4 / H5 是 differential / Evans / marrow compare 的 `benefits_from`；H2 是 treatment-support `benefits_from`。不能因为 front-matter 写了多个 prerequisites 就把它们全部解释成学习阻塞门槛。

### Clonal branch

- **H7**：硬前置 H1 + tumor/molecular gate；H4 是明确 soft compare，不应升格为硬 prerequisite。
- **H8**：H7 + H1 为强前置；肾脏 overflow protein language 是 recall/apply。
- **H9**：H7 + H1 + tumor/molecular gate 为强前置；H6(DIC) 与 nucleotide metabolism 为 soft recall/apply。
- **H10**：H7 + H9 为强前置，因为其核心是“较成熟粒系克隆 vs acute-blast model”与 phase progression。
- **H11**：H7 + tumor gate 为强前置；H9 为 soft evidence-language support；H12 只提供最低 B/T/NK interface，不能为了 H11 把完整免疫学提前补齐。

### Immune / rheum branch

- **H12**：免疫支路真正 Gate。病理 inflammation interface 是必要背景；H2/H5/H6 中的输血、溶血、血细胞破坏只是 exemplars / benefits_from，不应成为 H12 的硬阻塞。
- **H13**：H12 硬前置。
- **H14**：H12 硬前置；H2 的 ABO / transfusion / donor-recipient direction 是强 recall interface，但不需重学 H2。
- **H15**：H12 硬前置；H13/H14 只是 boundary recall。
- **H16 / H17 / H18 / H19**：H12 + H15 为共同硬 Gate，四者是 sibling disease branches。H16→H17→H18→H19 的顺序只是低切换默认，不是疾病间 prerequisite ontology。
- H18 对 H11 只需 lymphoma warning interface；H19 对 renal ANCA owner 只需 recall/apply。

### Infection branch

- **H20**：pathology inflammation language 是最直接的硬背景。H12/H13 对宿主反应与免疫缺陷非常有利，默认路线中应已学；但 H20 的基本“pathogen-space-host-response-source control”坐标本身不能被错误表述成完整免疫学课程的下游。
- **H21**：H20 + respiratory R7 owner 是强前置；H13 对 HIV host 是 benefits_from，K13 / D12 是器官 recall owners。
- **H22**：H20 + inflammation hard/strong；neuro N1 只为细胞 identity benefits_from。
- **H23**：H20 强前置；D12 对 intestinal comparison 很有价值，但不是伤寒 / 菌痢病理本身的 ontology prerequisite。
- **H24**：H20 是共同入口；H12 支持Ⅳ型接口；H21 只负责 TB granuloma comparison。H24 内部 A 血吸虫与 B STI 必须保持两个独立连续单元。
- **H25**：H20 硬前置；pathology inflammation / H13 只做 soft support。
- **H26**：H20 + H25 + Circulation B12 为真正的三线 readiness：病原、source control、perfusion。ARDS/AKI/DIC只作出口 interface。
- **H27**：H20 + H25 为强前置；N1–N4 是破伤风机制的 recall/apply，缺失时可 bounded cue，不应把整套 neuro 课程变成 C 的 mandatory blocker。

---

# 3｜Per-Block natural cognitive task model

本节不预设 Logic Group 数量。每条只回答：第一轮完成这个 Block 后，学习者应该获得什么局部可执行能力；哪些内容天然应闭环；哪些只是 reconstruction / comparison，不应被造成人工碎片。

## H1｜造血、CBC、Ret与骨髓诊断语言

自然任务：面对异常 CBC，不猜病名，而能沿“哪一系 → 单系/多系 → Ret是否匹配 → smear → marrow cell layer / structure layer”定位故障。

自然闭环：
- 三系共同生命史 + evidence layers；
- RBC production / EPO / Ret / normal clearance；
- WBC、Plt最低身份与正常止血 ownership boundary；
- CBC–Ret–smear–aspirate–biopsy 的诊断 reconstruction。

后置算法 KP 可以与前面 evidence-layer KP 非连续重组；这类非连续 grouping 是自然的，只要不是为了 loader。

## H2｜血型、交叉配血与成分输血

自然任务：先判 antigen/antibody 攻击方向，再完成 ABO/Rh、crossmatch、component choice、reaction recognition 与 volume/metabolic risk。

自然闭环：
- ABO/Rh compatibility mechanism；
- crossmatch + component selection；
- transfusion reactions；
- massive/autologous transfusion boundaries。

不能把“万能供/受者”口号当主模型。

## H3｜贫血总坐标、缺铁与巨幼

自然任务：Hb确认 anemia 后用 MCV × Ret 定位；再区分 iron depletion sequence 与 nuclear maturation failure。

自然闭环：
- anemia coordinate / MCV × Ret；
- IDA：storage → transport/functional iron → Hb，及 therapy response；
- megaloblastic minimal model + B12/folate boundary；
- pancytopenia / morphology / final algorithm reconstruction。

不能因 canonical 存在而把 B12/folate / one-carbon Primary 从 biochem 抢回。

## H4｜再生障碍性贫血

自然任务：识别“marrow global failure”并用 peripheral three-line output + hypocellular marrow + megakaryocyte loss 区别 consumption/destruction/dysplasia。

自然闭环：
- failure identity + output evidence；
- marrow confirmation + severity / differentials；
- danger/support + definitive/immunosuppressive treatment roles。

## H5｜溶血性贫血

自然任务：先证明 destruction + marrow compensation，再定位 intravascular/extravascular/in situ，最后追 intrinsic/extrinsic cause 与 targeted tests。

自然闭环：
- prove + localize hemolysis；
- representative intrinsic/extrinsic diseases；
- PNH mechanism→clinical→test→treatment；
- six-disease comparison / final algorithm 只作 compression/reconstruction，不替代主线。

## H6｜出血性疾病

自然任务：**先建立 bleeding localization coordinate，再进入 ITP 细节。**

必须先有：
```text
浅表/黏膜 → vessel/platelet
深部/关节/肌肉 → coagulation
delayed rebleed → fibrinolysis
+ Plt/BT/PT/APTT/TT first screen
```

随后 ITP 才能被理解为“isolated platelet failure with immune destruction + impaired production, normal coagulation times”。

原 Lecture 的连续顺序可以保留；实现方式应是 Block Orientation 在进入 Lecture 前给坐标，而不是把 Lecture P197–202 强拆重排。KP numbering 把 ITP 放前面不等于认知上先学 ITP。

自然闭环：
- bleeding localization / screening coordinate；
- ITP identity + marrow/evidence；
- ITP emergency / first-line / second-line；
- vWD/hemophilia/DIC 只保留最低 discrimination / boundary，不扩完整 course。

## H7｜MDS

自然任务：理解“marrow active ≠ effective hematopoiesis”，用 dysplasia + clone evidence + blast load 把 MDS 与 AA / megaloblastic / AML 分开。

自然闭环：
- clone + ineffective/dysplastic output；
- morphology + cytogenetic evidence roles；
- blast / FAB-WHO / IPSS-R 作为 risk naming layer，而非目录背诵；
- differential + risk-directed treatment。

## H8｜MM

自然任务：把 plasma-cell clone 统一解释为 marrow occupancy + osteolysis + M-protein/light-chain burden，再沿 three evidence lines 完成 diagnosis and staging。

自然闭环：
- clone→CRAB causal outputs；
- M-protein / light-chain / renal evidence；
- diagnosis: marrow clone + monoclonal protein + organ damage；
- staging / organ threat / transplant-candidate treatment role。

## H9｜急性白血病

自然任务：从 acute-blast identity 出发，严格分层理解证据：
```text
peripheral clue
→ marrow acute threshold
→ morphology/Auer
→ cytochemistry
→ flow lineage
→ chromosome/fusion subtype/prognosis
```
随后识别 APL/DIC、leukostasis、tumor-lysis/high-uric-acid danger，再进入 treatment / CR / MRD。

关键边界：五层证据不能压成一张“分类表”；但也不能每二三个 KP 就打断 P209–217 连续 Lecture。

## H10｜CML

自然任务：识别“mature granulocytic clone + BCR-ABL”并沿 chronic→accelerated→blast phase 看到成熟秩序逐步丢失；同时与 leukemoid / acute leukemia 区分。

自然闭环：
- clone/maturity/Ph identity；
- phase progression evidence；
- leukemoid/acute differentiation；
- TKI/HSCT current-source roles。

## H11｜淋巴瘤

自然任务：从 progressive painless node / extranodal mass 进入，保住 **tissue architecture + cell origin + behavior + stage** 四维，再学习 HL 与 NHL 的主要类型。

自然闭环：
- common entry + biopsy + staging；
- NHL：B/T/NK major subtype recognition by structure + phenotype + chromosome, not list alone；
- HL：RS cell + inflammatory background + CHL/NLPHL identity；
- treatment role by type/stage。

高风险：大量 subtype KP 若只是“名称—CD—染色体”串表而没有组织结构 / 行为 / 病例入口，应判 listification red。

## H12｜最低免疫共同语言

自然任务：只学当前 Source 支持的 minimum language：速发过敏、antibody-direct、immune-complex deposition、T-cell delayed damage，并把“耐受丧失”保持为有 Source Gap 的接口。

自然闭环：
- minimum roles B/CD4/CD8/antibody/complex；
- four hypersensitivity actions；
- cross-disease discrimination；
- tolerance concept + explicit unknown。

禁止补完整 complement cascade、APC、cytokine network、lymphocyte development、class switching、central/peripheral tolerance mechanism。

## H13｜免疫缺陷与 HIV/AIDS

自然任务：先按 T/B/combined/phagocyte-function 定位 failure，再理解 HIV 的 CD4 target vs reservoir、entry、host-response loss、opportunistic infection/tumor outputs。

不能扩 HIV diagnosis thresholds / ART / PEP / complete pathogen course。

## H14｜移植排斥与 GVHD

自然任务：第一问永远是“谁攻击谁”，第二问 time, 第三问 vascular vs interstitial pathology；超急/急/慢与 GVHD 由 direction + time + lesion layer 分开。

不能扩 HLA matching workflow、immunosuppressive regimens、organ-specific transplant course。

## H15｜风湿诊断语言与治疗角色

自然任务：从 syndrome/organ combination 出发，将 evidence 分为 screening / specificity / activity / organ evidence，再把 NSAID/GC/DMARD 的 symptom vs disease-control 角色分开。

它是 H16–H19 的 diagnostic gate；不能用 antibody-positive = diagnosis。

## H16｜SLE + APS

自然任务：把 SLE 拆成 immune-complex organ deposition、antibody-mediated cytopenia、antiphospholipid thrombosis 三路；抗体必须按 screening / specificity / activity / organ association 使用。

APS 学的是 thrombosis + pregnancy loss + thrombocytopenia 的 paradox，不是 antibody-name matching。

## H17｜RA

自然任务：从 synovitis → neovascularization/pannus → cartilage/bone destruction → deformity，解释为什么 early DMARD disease control 与 symptom control 必须分开；RF/CCP/MRI/X-ray 只作为 evidence roles。

## H18｜Sjögren

自然任务：从 exocrine-gland immune infiltration 推出口/眼干与保护功能丢失，再扩展 renal tubular / hematologic / skin / lymphoma warning；SSA/SSB 不能单独认病。

## H19｜系统性血管炎 + Behçet

自然任务：先 vessel caliber / artery-vs-vein + organ combination，再用 ANCA / biopsy / angiography 校正。

自然闭环：
- vessel-wall injury consequences + caliber map；
- evidence-role map；
- MPA organ pattern；
- Behçet independent whole-vessel phenotype。

特别防止把 ANCA pair 当“见抗体认病”。

## H20｜感染共同语言

自然任务：建立 pathogen—space—host—tissue response—source control 五问；感染是进入/定植/侵袭/局限或播散的空间事件。

只保留 mixed/opportunistic/superinfection 与 antimicrobial general role；禁止扩成 complete microbiology / antimicrobial pharmacology / infectious medicine。

## H21｜结核跨器官整合

自然任务：**不是第二次完整结核课**。只把 immune background → spread route → organ landing 压成 cross-organ map，并把每个器官导回其 canonical owner。

R7 继续拥有 TB pathology/clinical/chemotherapy Primary；K13/D12/ortho 分别拥有 organ-specific course。

## H22｜流脑 vs 乙脑

自然任务：先判 meninges/subarachnoid vs brain parenchyma，再用 purulent exudate vs neuronal degenerative/liquefactive injury 解释 pathology and symptom emphasis。

只学 Source-supported pathology recognition，不补 CSF / antimicrobial / ICU course。

## H23｜伤寒、菌痢与感染性肠溃疡

自然任务：用 location—reaction—ulcer shape—complication 四轴推导，不从口诀开跑；D12/D10/D11 only compare owners。

## H24｜血吸虫 + STI

**必须保留两个独立连续学习单元。**

- Unit A：schistosoma egg deposition → eosinophilic acute lesion → chronic pseudotuberculous granuloma / fibrosis；
- Unit B：syphilis / condyloma / gonorrhea 各自独立 pathology identity。

它们只共享 H20 的 pathogen→tissue-response coordinate，不允许造“共同病程”LG，也不允许为了一个 Block 强迫 A/B 互相 prerequisite。

## H25｜局部感染与源控制

自然任务：以 anatomy / space / pressure / necrosis / source-control 为主，而不是 disease-name list。

核心闭环：
```text
localized vs diffuse vs closed high-pressure space
+ pus / necrosis / devitalized tissue / functional threat
→ antibiotics alone enough?
→ drain / debride / decompress / remove source
```

手部 high-pressure space 必须解释为何 intervention threshold 更低。

## H26｜脓毒症

自然任务：感染失去局限后，同时推进 pathogen sampling+IV antimicrobial、source control、perfusion/resuscitation 三条线；高温/WBC高与低温/WBC低都可能危险。

**硬边界**：当前 Source 没有完整 SOFA/qSOFA、lactate threshold、vasopressor/fluid guideline。不得用现代指南静默替换历史 Lecture terminology。

## H27｜破伤风 + 气性坏疽

两病有共同入口“spore-forming anaerobic wound + toxin”，但必须保持两条完全不同的主电影：

- tetanus：retrograde axonal transport → Renshaw/glycine inhibition failure → sustained motor excitation / stimulus-triggered spasm；
- gas gangrene：toxin → myonecrosis + edema + gas + worsened anaerobic space → hemolysis/systemic toxicity → wide debridement/source control。

不能退化成 pathogen-name list；共同点只负责 initial discrimination，不抹掉 neural vs myonecrotic causal models。

---

# 4｜High-risk attack hypotheses frozen before candidate

1. **H6 order counterexample**：若 candidate 让 learner 先闭环 ITP mechanism/treatment，之后才首次形成 bleeding localization coordinate，则认知顺序错误；正确做法是 orientation 先给 coordinate，同时保留原 Lecture 连续性。
2. **H9 grouping counterexample**：若 morphology / cytochemistry / flow / genetics 被一个“分类表LG”折叠，证据角色丢失；若每层又拆成过小的频繁 KianOS handoff，也同样失败。
3. **H11 grouping counterexample**：若 NHL/HL subtypes 主要按 list/CD/chromosome grouping，而非 tissue structure + origin + behavior + stage，判过度列表化。
4. **H12 source-boundary counterexample**：任何 complete complement/cytokine/APC/lymphocyte-development/tolerance mechanism expansion 直接 red。
5. **H15–H19 evidence-role counterexample**：antibody positivity 被写成 diagnosis closure、或 RF/CCP/ANA/ANCA/SSA-SSB role 未分 screening/specificity/activity/organ evidence，直接 red。
6. **H20–H27 scope counterexample**：任何完整 infectious-medicine/antimicrobial/vaccine/organ-specific infection course expansion red。
7. **H21 ownership counterexample**：若重新教学肺TB全病程/chemotherapy 或器官-specific diagnosis-treatment，而不是 integration + route-back，red。
8. **H24 grouping counterexample**：任何把 schistosomiasis 与 STI 强造成共同 disease-course / sequential prerequisite 的 LG red。
9. **H25 mechanism counterexample**：若主线退化为“疖/痈/蜂窝/丹毒/手感染列表”，而 space-pressure-necrosis-source-control 不是 closure 主轴，red。
10. **H26 source-boundary counterexample**：出现 SOFA/qSOFA / lactate cutoffs / modern fluid-pressor algorithm 等 current Source外 guideline，red。
11. **H27 grouping counterexample**：若只有 organism/manifestation/treatment compare table，而没有 tetanus neural chain 与 gas-gangrene myonecrosis/source-control chain，red。

---

# 5｜First-pass surface model frozen before candidate

一个 Block 的默认执行应是：

```text
KianOS Block orientation / bounded cue
→ iPad/MarginNote 连续原 Lecture（不被每个LG频繁打断）
→ 回 KianOS 做该自然段 / 自然问题的 Active Recall
→ LG closure：回答“现在面对新的 evidence/case 能做什么”
→ 继续同一 Block 下一自然段
→ Block reconstruction / recall
```

因此 LG 不是强制“Lecture每学几个KP就来回切应用”的 UI choreography。对短 Block，可整段 Lecture 后一次性进入多组 retrieval；对 H9/H11 等长 Block，可在原 Lecture 自然 section boundary 做少量 handoff，但不能按固定 KP count 微切。

有效 closure 必须是 ability statement，例如：

- “能用 MCV×Ret 把 anemia 送入 production/maturation vs loss/destruction branch”；
- “能把 acute leukemia 的不同证据层放回 lineage/subtype/prognosis role”；
- “能判断 local infection 何时 antibiotics insufficient and source control needed”。

“记住这一组内容 / 复习这些KP”不算 closure。

---

# 6｜Progressive compression model frozen before candidate

## First pass

- 完整理解 causal model；
- canonical KP 至少一次 formal learning contact + active recall；
- high-value precision 首轮即进入；
- Source conflicts / gaps explicit；
- 不要求每个 imperfect recall 阻塞 Block。

## Second pass

重点只保留：

```text
discrimination
+ decisive evidence
+ high-value precision
+ case application
+ real Wrong / Uncertain / repaired-not-fresh-verified
```

不是 423 KP 全量重放。

## Late pass

进一步压为：

```text
System / branch causal skeleton
+ decisive boundaries
+ truly unstable precision
+ fresh cases / real weakness
```

稳定 singleton / MI-D / source-bound reference 不因 canonical identity 自动进入 review queue。

---

# 7｜Alternate-route falsification model

为了防止 default order 冒充 ontology，至少保留这些合法替代：

- H1 → H3 → H4/H5 与 H1 → H2 可以并行；
- H6 在 B4+H1 ready 后即可学，H4/H5只改善 differential richness；
- H12 可以在 clonal branch 前开始，也可以按低切换默认在 H11 后开始；它不是 H7–H11 的硬医学前置；
- H16/H17/H18/H19 是 H15 后 sibling branches，不应互相硬依赖；
- H21/H22/H23/H24 在 H20 ready 后可按 source/学习负荷调整，默认顺序主要为低切换；
- H25 → H26 是强因果串联；H27 与 H26 不需互为 prerequisite，H27主要依赖 H20/H25。

如果 candidate 把上述默认顺序全部编码成 hard prerequisite DAG，则属于 readiness overclaim。

---

# 8｜Pre-candidate checkpoint conclusion

在未读取 candidate 的状态下，本 fresh model 认为 C Learning Logic 成败不取决于某个预设 Logic Group 数，而取决于：

1. 27 Block 是否保住各自自然认知任务；
2. hard prerequisite 是否没有把 compare/recall/interface 错升格；
3. H6/H9/H11/H12/H15–19/H20–27 的上述高风险反例能否被排除；
4. first-pass 是否仍以连续 Lecture 为主，不把 KianOS 变第二讲义；
5. non-contiguous grouping 是否由真实 closure 驱动；
6. later passes 是否真正 progressively compressed；
7. Source / owner / learner-state / question-mapping boundaries 是否保持完整。

**Checkpoint frozen. Candidate may now be opened.**
