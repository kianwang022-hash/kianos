# D Phase 3B — Exact Logic Groups for O1–O16

Status: **PASS — orthopedic branch 206 / 206 stable KPs partitioned exactly once**  
Scope: O1–O16 only  
Depends on: D Phase 0–2 receipts + Current D orthopedic Core  
Medical identity change: **none**

## 1｜Partition rules

- `members` are stable KP ordinals inside each canonical Block owner.
- every ordinal appears exactly once;
- group size follows the local orthopedic problem, not a quota;
- a regional fracture name is not automatically a Logic Group;
- visual-dependent force/displacement/anatomy/imaging relations require original Source contact;
- Source conflicts remain conflict-bound precision and are never silently reconciled;
- Source contact follows Phase-0 natural Source units, not one trip per LG.

Orthopedic total:

```text
16 Blocks
206 stable KPs
72 Logic Groups
coverage = 206 / 206 exactly once
```

---

# O1｜骨科进入地图 — 10 KP / 4 LG

### O1-LG01｜症状先定位结构，再分病因
- members: `[1,2,3]`
- job: `STRUCTURE_LOCALIZATION`
- goal: turn pain/deformity/limited motion/numbness/weakness into a first owning structure and then a causal family rather than a disease-name guess.
- closure: for a new musculoskeletal complaint, state the likely structure and at least two plausible causal families before naming a diagnosis.
- rationale: these KPs are the shared entrance coordinate for every later orthopedic Block.

### O1-LG02｜稳定性、急危与神经血管复查
- members: `[4,5,6]`
- job: `STRUCTURE_STABILITY_DANGER`
- goal: separate apparent alignment from true stability and prioritize life/limb/neurovascular danger before function.
- closure: identify what can deteriorate after movement/reduction and name what must be rechecked before and after intervention.
- rationale: stability and danger are coupled operational decisions, not independent fact cards.

### O1-LG03｜检查工具与证据层
- members: `[7,8]`
- job: `EVIDENCE_STACK`
- goal: assign X-ray/CT/MRI/nuclear/electrophysiology/arthroscopy and symptom–sign–image–pathology layers to the question each actually answers.
- closure: choose the next test for a stated uncertainty and explain what that test cannot prove.
- rationale: both KPs govern evidence role rather than disease content.

### O1-LG04｜治疗目标与神经定位桥
- members: `[9,10]`
- job: `INTEGRATION_BRIDGE`
- goal: connect orthopedic treatment goals with N11 lesion-level localization without duplicating either later disease treatment or neurology.
- closure: describe how “preserve life/limb/function” changes after the deficit is localized to bone/joint/cord/root/nerve.
- rationale: this is the handoff from neural localization into orthopedic action.

Coverage O1: `1–10 exactly once`.

---

# O2｜骨折概论 — 16 KP / 6 LG

### O2-LG01｜骨折原因与分类是不同坐标
- members: `[1,2]`
- job: `DISCRIMINATION`
- goal: separate mechanism/cause from stability, completeness and open/closed dimensions.
- closure: classify a new fracture on each axis without treating one label as the whole diagnosis.
- rationale: these two KPs create the reusable fracture identity space.

### O2-LG02｜开放骨折：污染边界与清创
- members: `[3,4]`
- job: `SOURCE_CONTROL + URGENT_ACTION`
- goal: connect contamination, the prohibition on pushing contaminated bone back and wash–excise–preserve–repair debridement logic.
- closure: state the first local priorities in an open-fracture scenario and why closure/fixation cannot precede contamination control.
- rationale: both KPs are one source-control chain.

### O2-LG03｜骨折诊断门槛
- members: `[5]`
- job: `URGENT_RECOGNITION`
- goal: use specific fracture signs without requiring their presence or intentionally provoking them.
- closure: decide when fracture is already established and what absence of a specific sign does not exclude.
- rationale: a natural singleton because the task is diagnostic threshold, not healing or treatment.

### O2-LG04｜愈合—失败—影响因素
- members: `[6,7,8,9]`
- job: `REPAIR_TIMELINE`
- goal: link clinical union, biological phases, delayed/non/malunion and local/systemic determinants into one recovery model.
- closure: given delayed recovery, identify whether the problem is time, biology, blood supply/contact/stability or function and predict the relevant failure pattern.
- rationale: the four KPs are one time-dependent repair chain.

### O2-LG05｜早晚并发症与骨筋膜室红旗
- members: `[10,11,12]`
- job: `URGENT_RECOGNITION + COMPLICATION_MAP`
- goal: separate early systemic/local emergencies from late immobility/infection/joint/ischemic consequences, with persistent severe pain as compartment-syndrome escalation.
- closure: classify a complication by timing and identify which one cannot wait for routine fracture management.
- rationale: complication timing only becomes useful when immediate danger is embedded in the same map.

### O2-LG06｜复位—固定—功能锻炼是一套目标链
- members: `[13,14,15,16]`
- job: `DECISION_CHAIN`
- goal: connect reduction standard, closed/open reduction, fixation choice and early functional exercise as complementary rather than competing actions.
- closure: choose the treatment objective and explain why stable fixation is the prerequisite for safe early function, not its opposite.
- rationale: these KPs form the universal fracture-management loop reused by regional Blocks.

Coverage O2: `1–16 exactly once`.

---

# O3｜脊柱、骨盆骨折与脊髓损伤 — 17 KP / 6 LG

### O3-LG01｜现场保护 + 结构/功能双轴
- members: `[1,2]`
- job: `STRUCTURE_STABILITY_DANGER`
- goal: protect spinal alignment and run structural stability and neurologic function in parallel from the first contact.
- closure: in a trauma case, state safe movement/imaging direction and separately report stability risk and neurologic status.
- rationale: these are the two non-substitutable first actions.
- visual: `VISUAL_REQUIRED`

### O3-LG02｜颈椎受力模式决定损伤结构
- members: `[3,4,5,6]`
- job: `FORCE_DISPLACEMENT_FUNCTION`
- goal: connect flexion/compression/extension/upper-cervical structures to compression-dislocation, Jefferson/burst, Hangman and odontoid/atlantoaxial patterns.
- closure: derive the likely injured level/structure and neural danger from the force direction instead of memorizing eponyms.
- rationale: all four are one cervical force–stability map.
- visual: `VISUAL_REQUIRED`

### O3-LG03｜胸腰与骨盆：失稳、出血和伴伤
- members: `[7,8,9]`
- job: `STRUCTURE_STABILITY_DANGER`
- goal: distinguish Chance-type axial instability from pelvic-ring instability and prioritize hemorrhagic shock while preserving the urinary-sequence Source conflict.
- closure: identify whether the current threat is mechanical instability, massive bleeding or associated organ injury and flag conflict-bound wording rather than reconciling it.
- rationale: this is the non-cervical high-energy structural-danger branch.
- visual: `VISUAL_REQUIRED`

### O3-LG04｜脊髓损伤先分震荡/不全/完全
- members: `[10,11]`
- job: `LAYER_LOCALIZATION + DISCRIMINATION`
- goal: separate transient concussion, incomplete cord patterns and complete loss using tract combinations.
- closure: derive anterior/posterior/central/hemicord pattern from motor/deep/pain-temperature findings.
- rationale: the classification must exist before timing/level details.
- visual: `VISUAL_REQUIRED`

### O3-LG05｜脊休克、完全损伤平面与圆锥/马尾
- members: `[12,13,14]`
- job: `DIRECTION_TIMING + LAYER_LOCALIZATION`
- goal: prevent acute flaccidity from being mislabeled LMN injury and combine level with conus/cauda features.
- closure: use time + upper/lower-limb UMN/LMN pattern + saddle/sphincter evidence to localize the lesion and flag the current Source timing boundary.
- rationale: these three solve the “what level and what phase?” question.
- visual: `VISUAL_REQUIRED`

### O3-LG06｜并发症、治疗出口与病例算法
- members: `[15,16,17]`
- job: `URGENT_PARALLEL_ACTION`
- goal: connect respiratory/urinary/pressure/autonomic complications and Current treatment timing to a complete acute case route.
- closure: name the cannot-wait threats and the parallel structural/neurologic/support actions without importing a modern SCI guideline.
- rationale: these KPs close the Block after localization is established.

Coverage O3: `1–17 exactly once`.

---

# O4｜颈腰椎退行性压迫 — 18 KP / 5 LG

### O4-LG01｜空间变小如何变成根/髓压迫
- members: `[1,2,3,4]`
- job: `SPATIAL_VISUAL_MODEL + MECHANISM_CHAIN`
- goal: connect disc/uncinate anatomy, segment→root mapping, mechanical/chemical/immune radicular pain and imaging roles.
- closure: given a level and symptoms, identify the compressed object and choose the imaging layer that can confirm it.
- rationale: structure, root rule, pain mechanism and evidence are one compression foundation.
- visual: `VISUAL_REQUIRED`

### O4-LG02｜颈椎病按压迫对象分型
- members: `[5,6,7,8]`
- job: `LAYER_LOCALIZATION`
- goal: distinguish radiculopathy, myelopathy and the Current Source sympathetic/vertebral-artery/esophageal interfaces by the object producing symptoms.
- closure: classify a new cervical presentation as local root vs broad cord vs other Source-supported type and identify myelopathic red flags.
- rationale: this is the cervical Source unit’s primary partition.

### O4-LG03｜颈椎体征与鉴别
- members: `[9,10]`
- job: `DISCRIMINATION`
- goal: combine root/cord signs and segmental patterns with near-neighbor differential diagnoses.
- closure: choose the smallest decisive sign or distribution that separates cervical root/cord disease from peripheral/shoulder/non-spinal alternatives.
- rationale: examination only becomes useful when it changes the differential.
- visual: `VISUAL_REQUIRED`

### O4-LG04｜腰椎间盘突出：形态→根→查体→治疗
- members: `[11,12,13,14,15]`
- job: `SPATIAL_VISUAL_MODEL + DECISION_CHAIN`
- goal: connect disc morphology with clinical sciatica, L4/L5/S1 motor-sensory-reflex triads, SLR patterns and root/cauda treatment thresholds.
- closure: localize a new lumbar-disc case to the relevant root/cauda state and justify conservative vs surgical escalation.
- rationale: these five are one lumbar-disc decision chain.
- visual: `VISUAL_REQUIRED`

### O4-LG05｜椎管狭窄与全Block压迫算法
- members: `[16,17,18]`
- job: `LAYER_LOCALIZATION + DISCRIMINATION`
- goal: distinguish neurogenic claudication and root/cord/cauda/hard-soft paralysis patterns, then compress the whole Block to `压到谁 → 哪层证据 → 红旗`.
- closure: route a chronic axial-compression case without reopening N11 Primary and identify when symptoms exceed ordinary conservative pain care.
- rationale: this is the Block-level localization exit.

Coverage O4: `1–18 exactly once`.

---

# O5｜创伤性周围神经损伤 — 15 KP / 5 LG

### O5-LG01｜平面—功能—再生共同语言
- members: `[1,2,3]`
- job: `LAYER_LOCALIZATION + REPAIR_TIMELINE`
- goal: use injury plane, lost action, sensory territory and deformity while understanding high/low lesions and Tinel as regeneration evidence.
- closure: localize a lesion to a level and state what Tinel can and cannot prove about recovery.
- rationale: these KPs define the universal nerve-localization method before named maps.

### O5-LG02｜臂丛空间骨架与近端损伤
- members: `[4,5,6]`
- job: `SPATIAL_VISUAL_MODEL`
- goal: map root–trunk–division–cord–branch and distinguish winged vs squared shoulder and root-avulsion/Horner high-level danger.
- closure: infer the breadth of deficit from a plexus level and identify why root avulsion requires a different repair direction.
- rationale: proximal architecture must precede terminal-nerve memorization.
- visual: `VISUAL_REQUIRED`

### O5-LG03｜正中—尺—桡三条上肢动作轴
- members: `[7,8,9,10,11]`
- job: `SPATIAL_VISUAL_MODEL + DISCRIMINATION`
- goal: organize median/ulnar/radial function by flexion-opposition / intrinsic hand / extension and then use deep-branch exceptions to test level logic.
- closure: from lost action + sensation + deformity, identify the nerve and whether the lesion is high, low or branch-specific.
- rationale: named nerve facts become retrievable only when compressed into competing action axes.
- visual: `VISUAL_REQUIRED`

### O5-LG04｜下肢股—坐骨—胫—腓总轴
- members: `[12,13]`
- job: `SPATIAL_VISUAL_MODEL + DISCRIMINATION`
- goal: distinguish knee extension/reflex from posterior-chain function and plantarflexion vs dorsiflexion/eversion patterns.
- closure: localize a lower-limb motor/sensory deficit to femoral, sciatic, tibial or common peroneal level.
- rationale: the two KPs form one branching lower-limb map.
- visual: `VISUAL_REQUIRED`

### O5-LG05｜根 vs 命名神经 + 创伤处理出口
- members: `[14,15]`
- job: `INTEGRATION_BRIDGE + URGENT_PARALLEL_ACTION`
- goal: keep root/dermatome-myotome-reflex evidence separate from named-nerve territory and prioritize life/blood supply/open injury before repair.
- closure: distinguish root from nerve in a mixed case and state the immediate trauma actions plus later repair evidence path.
- rationale: this closes O5 back to N11/O2 without duplicating them.

Coverage O5: `1–15 exactly once`.

---

# O6｜上肢骨折与脱位 — 12 KP / 4 LG

### O6-LG01｜肩带—肩—近端肱骨
- members: `[1,2,3,4]`
- job: `FORCE_DISPLACEMENT_FUNCTION`
- goal: move from the general upper-limb entry to clavicle, shoulder dislocation and proximal-humerus patterns while protecting deep neurovascular structures and shoulder function.
- closure: derive the likely deformity/danger and treatment objective from force, age and whether the injury is bone or joint.
- rationale: these form one shoulder-girdle functional unit.
- visual: `VISUAL_REQUIRED`

### O6-LG02｜肱骨干—儿童肘：危险结构优先
- members: `[5,6,7,8]`
- job: `FORCE_DISPLACEMENT_FUNCTION + URGENT_RECOGNITION`
- goal: connect humeral-shaft muscle pull/radial-nerve danger with supracondylar neurovascular/compartment risk and distinguish elbow dislocation from radial-head subluxation.
- closure: in an arm/elbow case, identify the immediately threatened nerve/vessel/compartment and use age + posterior-triangle/mechanism to discriminate the injury.
- rationale: these are contiguous high-risk arm/elbow structures.
- visual: `VISUAL_REQUIRED`

### O6-LG03｜前臂是耦合旋转系统
- members: `[9,10]`
- job: `FORCE_DISPLACEMENT_FUNCTION`
- goal: distinguish Galeazzi/Monteggia while understanding why two-bone alignment and rotation make anatomical reduction important.
- closure: identify which bone fractures and which joint dislocates, then explain the functional cost of residual angulation/rotation.
- rationale: both KPs are about radius–ulna coupling.
- visual: `VISUAL_REQUIRED`

### O6-LG04｜远端桡骨 + 上肢整合出口
- members: `[11,12]`
- job: `DISCRIMINATION + SYSTEM_COMPRESSION`
- goal: derive Colles/Smith/Barton from impact, distal-fragment direction and joint-surface involvement, then compress the whole upper limb to danger/function priorities.
- closure: identify the distal-radius pattern from geometry and state why neurovascular check, rotation and joint congruity outrank eponym recall.
- rationale: KP12 turns the distal pattern into a Block-level exit rather than a separate new topic.
- visual: `VISUAL_REQUIRED`

Coverage O6: `1–12 exactly once`.

---

# O7｜下肢骨折与脱位 — 15 KP / 5 LG

### O7-LG01｜髋脱位：方向、关节破坏与早期复位
- members: `[1,2,3,4]`
- job: `STRUCTURE_STABILITY_DANGER + DECISION_CHAIN`
- goal: connect weight-bearing/blood-supply entry with posterior/anterior/central dislocation posture, Epstein structural severity and Current reduction/surgery thresholds.
- closure: identify dislocation direction and immediate danger from posture/force and explain when closed reduction is no longer enough.
- rationale: all four belong to the hip-dislocation Source unit.
- visual: `VISUAL_REQUIRED`

### O7-LG02｜股骨颈—转子间：血供、年龄与治疗目标
- members: `[5,6,7,8]`
- job: `DISCRIMINATION + DECISION_CHAIN`
- goal: separate four femoral-neck classification axes, clinical shortening/rotation and age/fitness/treatment from extracapsular intertrochanteric injury.
- closure: use blood-supply risk, displacement, age and expected function to distinguish fixation/arthroplasty directions and femoral-neck vs intertrochanteric identity.
- rationale: this is one proximal-femur blood-supply decision model.
- visual: `VISUAL_REQUIRED`

### O7-LG03｜股骨干与髌骨：大失血 vs extensor/joint surface
- members: `[9,10]`
- job: `STRUCTURE_STABILITY_DANGER`
- goal: contrast femoral-shaft systemic/neurovascular danger with patellar extensor-mechanism and articular-congruity goals.
- closure: name the dominant danger/functional target before selecting treatment.
- rationale: both are knee-adjacent but fail for different reasons, making contrast useful.

### O7-LG04｜胫腓骨：部位决定神经、间室、血供与开放伤
- members: `[11,12]`
- job: `STRUCTURE_STABILITY_DANGER + SOURCE_CONTROL`
- goal: connect tibial segment/common-peroneal/compartment/nonunion risk with contamination severity and fixation direction.
- closure: in a tibia/fibula case, identify the site-specific complication and explain why soft tissue/contamination can override implant preference.
- rationale: open injury is inseparable from tibial location and blood supply.
- visual: `VISUAL_REQUIRED`

### O7-LG05｜踝足稳定与下肢红线压缩
- members: `[13,14,15]`
- job: `FORCE_DISPLACEMENT_FUNCTION + SYSTEM_COMPRESSION`
- goal: distinguish ligament sprain from intra-articular trimalleolar fracture and compress lower-limb danger to hip blood supply, long-bone bleeding, compartment/neural risk and joint matching.
- closure: choose the treatment objective from soft-tissue vs articular injury and state the four lower-limb red lines before naming the exact procedure.
- rationale: this closes the distal weight-bearing chain and the whole Block.
- visual: `VISUAL_REQUIRED`

Coverage O7: `1–15 exactly once`.

---

# O8｜手外伤与再植 — 7 KP / 3 LG

### O8-LG01｜存活—覆盖—稳定—功能位
- members: `[1,2,3]`
- job: `URGENT_PARALLEL_ACTION`
- goal: prioritize perfusion/repair timing, coverage depth and function-preserving immobilization instead of treating wound closure as completion.
- closure: choose what must be repaired now, what may be staged and what coverage/fixation preserves future hand function.
- rationale: these three define the tissue-priority hierarchy.

### O8-LG02｜再植价值、时间与保存
- members: `[4,5]`
- job: `DIRECTION_TIMING`
- goal: connect injury-edge quality with ischemia time and dry-cold sealed preservation while preserving Current Source time limits.
- closure: judge relative replant viability and identify correct specimen preservation without importing microsurgical protocol.
- rationale: success probability and ischemic preservation are one viability decision.

### O8-LG03｜血供证据与手外伤出口
- members: `[6,7]`
- job: `EVIDENCE_STACK + SYSTEM_COMPRESSION`
- goal: use Allen collateral-flow evidence and compress the case to viability→coverage→stability→nerve/tendon→function.
- closure: explain what Allen tests and run the five-layer hand-trauma exit.
- rationale: closes the Block on perfusion plus function.
- visual: `VISUAL_REQUIRED`

Coverage O8: `1–7 exactly once`.

---

# O9｜膝韧带与半月板损伤 — 7 KP / 3 LG

### O9-LG01｜受力—结构—愈合潜力
- members: `[1,2,3]`
- job: `FORCE_DISPLACEMENT_FUNCTION + DISCRIMINATION`
- goal: connect half-flexion/compression/rotation with meniscal injury, vascular zones and distinguish tear morphology from combined ligament-meniscus identity.
- closure: infer the likely injured structure and healing potential from mechanism + tear/zone information.
- rationale: these are the structural inputs before examination.
- visual: `VISUAL_REQUIRED`

### O9-LG02｜方向性查体不是试验名清单
- members: `[4,5]`
- job: `EVIDENCE_STACK`
- goal: map rotational compression, side stress and anterior/posterior translation to the structure being stressed, including Apley’s dual role.
- closure: from the maneuver mechanics, predict whether pain or laxity supports meniscus/collateral/cruciate injury.
- rationale: mechanics explains why one named test can touch different structures.
- visual: `VISUAL_REQUIRED`

### O9-LG03｜MRI→关节镜 + 病例出口
- members: `[6,7]`
- job: `EVIDENCE_STACK + SYSTEM_COMPRESSION`
- goal: preserve MRI as noninvasive localization and arthroscopy as direct intra-articular confirmation, after mechanism and directional instability have narrowed the target.
- closure: run `mechanism → lock/laxity → targeted exam → MRI → scope if needed` without using pain alone as localization.
- rationale: evidence only becomes meaningful after structural hypothesis formation.

Coverage O9: `1–7 exactly once`.

---

# O10｜股骨头无菌性坏死 — 8 KP / 3 LG

### O10-LG01｜缺血上游：创伤血供与全身危险因素
- members: `[1,2,3]`
- job: `MECHANISM_CHAIN`
- goal: establish aseptic necrosis as ischemic bone infarction and connect traumatic lateral-epiphyseal-artery injury with Current nontraumatic risk factors while preserving the sidedness conflict.
- closure: classify a risk factor as blood-supply upstream and explain why infection logic does not apply.
- rationale: all three are causes of the same ischemic first failure.
- visual: `VISUAL_REQUIRED`

### O10-LG02｜症状→早期影像→塌陷时间轴
- members: `[4,5,6]`
- job: `EVIDENCE_STACK + REPAIR_TIMELINE`
- goal: use nonspecific hip exam, X-ray stages and MRI/nuclear early evidence as different points on necrosis→repair→collapse progression.
- closure: identify why early X-ray may miss disease and place an imaging finding on the pre-collapse vs collapse/degeneration timeline.
- rationale: these KPs form the diagnostic time axis.
- visual: `VISUAL_REQUIRED`

### O10-LG03｜是否塌陷决定治疗目标
- members: `[7,8]`
- job: `DECISION_CHAIN + SYSTEM_COMPRESSION`
- goal: convert staging into “preserve head before irreversible collapse vs replace end-stage joint” rather than memorize procedures.
- closure: state the treatment objective from collapse/secondary-OA status and reconstruct the complete ischemia→collapse chain.
- rationale: final decision is the natural closure of the AVN model.

Coverage O10: `1–8 exactly once`.

---

# O11｜慢性损伤与神经卡压 — 13 KP / 5 LG

### O11-LG01｜反复负荷模型与一般治疗边界
- members: `[1,2]`
- job: `MECHANISM_CHAIN + DECISION_CHAIN`
- goal: define chronic injury as cumulative load/friction/degeneration and use reduce-load/therapy/drug/surgery escalation without importing rehab or injection protocols.
- closure: identify the repeatedly stressed structure and choose the lowest treatment layer that addresses the mechanism.
- rationale: this is the shared chronic-injury foundation.

### O11-LG02｜肩周炎：粘连僵硬需要活动，不是长期固定
- members: `[3,4]`
- job: `DISCRIMINATION + DECISION_CHAIN`
- goal: connect multidirectional shoulder restriction with capsular adhesion, MRI/self-limited course and active motion, contrasting post-dislocation immobilization.
- closure: distinguish capsular chronic stiffness from acute injury and explain why prolonged suspension worsens the target problem.
- rationale: recognition and treatment are one mechanism-specific pair.

### O11-LG03｜肌腱/腱鞘局部过载
- members: `[5,6]`
- job: `STRUCTURE_LOCALIZATION`
- goal: localize lateral-epicondyle extensor traction versus stenosing tendon-sheath “tunnel” mechanics and use the appropriate exam/treatment boundary.
- closure: identify tendon attachment vs tendon sheath as the first failed object from the provoking action.
- rationale: both are focal soft-tissue friction/traction disorders.

### O11-LG04｜软骨与儿童骨骺的慢性负荷
- members: `[7,8,9]`
- job: `GROWTH_TIME_WINDOW + DISCRIMINATION`
- goal: separate patellar cartilage injury, tibial-tubercle apophyseal overload and childhood femoral-head osteochondropathy from acute fracture and adult AVN.
- closure: use age, tissue and load/blood-supply context to choose the correct chronic model and preserve steroid-treatment boundaries.
- rationale: these are growth/cartilage-dependent chronic injuries rather than nerve entrapment.

### O11-LG05｜固定空间卡压→命名神经→根性鉴别
- members: `[10,11,12,13]`
- job: `LAYER_LOCALIZATION + SYSTEM_COMPRESSION`
- goal: map four compression spaces to named nerves, use carpal tunnel as a complete model, distinguish entrapment from root disease and compress the Block to structural overuse vs neural compression.
- closure: localize a chronic numbness/weakness case to root or named nerve/space and state whether reducing load, preserving motion or decompression is the relevant direction.
- rationale: all four solve the chronic nerve-compression route and final Block split.
- visual: `VISUAL_REQUIRED`

Coverage O11: `1–13 exactly once`.

---

# O12｜运动系统畸形 — 10 KP / 3 LG

### O12-LG01｜年龄/生长是治疗变量 + 肌性斜颈
- members: `[1,2]`
- job: `GROWTH_TIME_WINDOW`
- goal: establish developmental deformity as a moving target and apply the age-window idea to SCM contracture without expanding other pediatric surgery topics.
- closure: infer head/chin direction and explain why earlier soft-tissue correction differs from later fixed deformity management.
- rationale: torticollis is the simplest concrete instance of the Block’s age-window model.

### O12-LG02｜DDH：结构不匹配随负重变成步态问题
- members: `[3,4,5,6,7]`
- job: `SPATIAL_VISUAL_MODEL + GROWTH_TIME_WINDOW`
- goal: connect shallow acetabulum/laxity with pre-walking signs, weight-bearing gait changes, age-specific imaging and progressively structural treatment.
- closure: from age + exam + image, identify the DDH stage and explain why the treatment becomes more reconstructive as age increases.
- rationale: these five are one developmental-hip trajectory.
- visual: `VISUAL_REQUIRED`

### O12-LG03｜结构性侧凸与 Cobb 治疗窗口
- members: `[8,9,10]`
- job: `SPATIAL_VISUAL_MODEL + GROWTH_TIME_WINDOW`
- goal: separate structural from reversible/nonstructural scoliosis, recognize thoracic functional consequences and use Current Cobb thresholds as a treatment ladder.
- closure: decide structural vs nonstructural, identify severity/function impact and choose observation/brace/surgery direction from the Source-bound angle.
- rationale: classification, phenotype and angle are one scoliosis decision model.
- visual: `VISUAL_REQUIRED`

Coverage O12: `1–10 exactly once`; clubfoot remains an external Source gap and is not assigned phantom KPs.

---

# O13｜化脓性骨与关节感染 — 13 KP / 4 LG

### O13-LG01｜感染空间：骨髓腔、关节腔与儿童髋传播
- members: `[1,13]`
- job: `SOURCE_CONTROL + SPATIAL_VISUAL_MODEL`
- goal: localize infection to bone vs joint and understand the physis/capsule anatomy that can let pediatric hip osteomyelitis seed the joint.
- closure: from pain/swelling/deep-tenderness/anatomic site, choose the infected space and predict whether spread into a neighboring joint is anatomically plausible.
- rationale: KP13 is the spatial completion of KP1; non-contiguous membership is intentional.
- visual: `VISUAL_REQUIRED`

### O13-LG02｜急性血源性骨髓炎：干骺端→脓肿→引流
- members: `[2,3,4,5]`
- job: `MECHANISM_CHAIN + SOURCE_CONTROL`
- goal: connect pediatric metaphyseal trapping and deep pain with MRI/layered aspiration and antibiotic + decompression logic while preserving the stopping-wording conflict.
- closure: identify the best early evidence and explain why persistent local pressure/pain despite systemic improvement demands source control rather than simply more analgesia.
- rationale: cause, recognition, evidence and action are one acute-bone-infection loop.
- visual: `VISUAL_REQUIRED`

### O13-LG03｜化脓性关节炎：渗出进展与关节腔清除
- members: `[6,7,8]`
- job: `SOURCE_CONTROL + EVIDENCE_STACK`
- goal: connect joint-space infection phenotype with aspiration fluid progression and functional-position immobilization plus effective cavity clearance.
- closure: interpret aspiration appearance as disease progression and state when aspiration/irrigation must escalate rather than relying on systemic antibiotics alone.
- rationale: these KPs are one joint-cavity model.

### O13-LG04｜慢性骨髓炎：死骨—死腔—包壳—清除时机
- members: `[9,10,11,12]`
- job: `SOURCE_CONTROL + REPAIR_TIMELINE`
- goal: model how avascular sequestrum/involucrum/sinus/dead space self-maintain infection and why radical clearance has timing constraints during acute flare.
- closure: identify what must be removed/filled/drained and explain why large sequestra or immature involucrum change timing.
- rationale: the chronic disease is a structural source-control problem, not prolonged acute infection.
- visual: `VISUAL_REQUIRED`

Coverage O13: `1–13 exactly once`; `[1,13]` is intentionally non-contiguous.

---

# O14｜骨与关节结核 — 13 KP / 4 LG

### O14-LG01｜慢性结核破坏 + 冷脓肿 + 双门槛治疗
- members: `[1,2,3,4,5]`
- job: `DISCRIMINATION + SOURCE_CONTROL`
- goal: distinguish slow TB destruction from pyogenic infection and metastasis using site/tempo/space while preserving anti-TB/surgery Current wording and the contraindication-label conflict.
- closure: recognize a Source-supported osteoarticular TB pattern, choose MRI/structural evidence and explain why cold abscess does not automatically follow pyogenic incision logic.
- rationale: these five form the whole-system TB entry before organ-specific spine/hip branches.
- visual: `VISUAL_REQUIRED`

### O14-LG02｜脊柱结核：型别、截瘫机制与清除指征
- members: `[6,7,8]`
- job: `SPATIAL_VISUAL_MODEL + URGENT_RECOGNITION`
- goal: distinguish lumbar-edge vs thoracic-central patterns, early active compression vs late structural/vascular paraplegia and surgery indications.
- closure: localize the destructive pattern and state whether current neurologic deficit reflects active compressive material or late deformity/scarring/vascular injury.
- rationale: these are one spine-specific stability/neural-threat model.
- visual: `VISUAL_REQUIRED`

### O14-LG03｜髋结核：转移痛、4字/Thomas与病变范围手术
- members: `[9,10,11,12]`
- job: `STRUCTURE_LOCALIZATION + DISCRIMINATION`
- goal: prevent referred knee pain and nonspecific 4-character/Thomas signs from becoming disease labels, then use actual hip destruction range for treatment direction.
- closure: localize the pathology to the hip and distinguish synovial/bony/whole-joint functional loss while explaining what the named signs really mean.
- rationale: symptoms, signs and surgery all depend on the same hip structural extent.
- visual: `VISUAL_REQUIRED`

### O14-LG04｜脊柱破坏四联鉴别出口
- members: `[13]`
- job: `DISCRIMINATION`
- goal: compress pyogenic/TB/metastasis/degenerative spinal patterns by tempo, interval, abscess/pedicle/osteophyte/bamboo evidence.
- closure: select the decisive spatial/tempo feature for a new destructive-spine case and return to the correct owner.
- rationale: natural singleton because it is a cross-Block compression rather than new TB Primary.
- visual: `VISUAL_REQUIRED`

Coverage O14: `1–13 exactly once`.

---

# O15｜OA、AS 与 RA 骨科坐标 — 12 KP / 4 LG

### O15-LG01｜OA：软骨退变→力线/影像→功能重建
- members: `[2,3,4,5]`
- job: `MECHANISM_CHAIN + DECISION_CHAIN`
- goal: connect primary/secondary cartilage degeneration with mechanical phenotype, asymmetric narrowing/subchondral/bone-spur imaging and treatment escalation.
- closure: distinguish OA from inflammatory disease and state whether the current goal is load/pain control, alignment correction or joint reconstruction.
- rationale: these four are the complete OA structural model.
- visual: `VISUAL_REQUIRED`

### O15-LG02｜AS：骶髂起点→中轴蔓延→竹节与功能
- members: `[6,7,8,9]`
- job: `SPATIAL_VISUAL_MODEL + DECISION_CHAIN`
- goal: connect SI/enthesis origin and inflammatory activity pattern with early MRI, later fusion/bamboo-spine and function-first treatment.
- closure: identify AS from SI-centered distribution rather than generic back pain and preserve glucocorticoid/source treatment boundaries.
- rationale: these four are one axial inflammatory-structure chain.
- visual: `VISUAL_REQUIRED`

### O15-LG03｜RA 只做骨科 Recall
- members: `[10]`
- job: `INTEGRATION_BRIDGE`
- goal: reactivate synovial origin, symmetric small-joint destruction and irreversible deformity without duplicating H17 immune/medical Primary.
- closure: state the structural RA coordinate and explicitly route serology/systemic/drug detail back to H17.
- rationale: a natural singleton because the Primary owner is external.

### O15-LG04｜三病最终鉴别：软骨—骶髂—滑膜
- members: `[1,11,12]`
- job: `DISCRIMINATION`
- goal: use tissue of origin, age/sex, axial vs peripheral/small-joint distribution, activity rhythm and imaging/serology role to compare OA/RA/AS while preserving the RA morning-stiffness Source conflict.
- closure: classify a new chronic-joint case using at least three independent axes and flag threshold-specific questions as Source-bound precision.
- rationale: KP1 is intentionally retrieved with the two final comparison KPs after disease-specific models form.

Coverage O15: `1–12 exactly once`; `[1,11,12]` intentionally non-contiguous.

---

# O16｜骨肿瘤 — 20 KP / 8 LG

### O16-LG01｜先判侵袭性，再看证据层和全身范围
- members: `[1,2,3,4]`
- job: `EVIDENCE_STACK + DISCRIMINATION`
- goal: separate benign/aggressive behavior, imaging hypothesis, biopsy confirmation, metastasis survey and supportive lytic/blastic lab direction.
- closure: build a bounded candidate set from behavior + evidence and state why neither periosteal reaction nor lab alone is diagnostic.
- rationale: these four define the general bone-tumor diagnostic workflow.
- visual: `VISUAL_REQUIRED`

### O16-LG02｜骨软骨瘤自然史与恶变报警
- members: `[5,6]`
- job: `GROWTH_TIME_WINDOW + URGENT_RECOGNITION`
- goal: connect adolescent metaphyseal exostosis/cortex–medulla continuity with post-physeal growth/pain/soft-tissue change as malignant-warning violation of natural history.
- closure: identify why “grows again after skeletal maturity” changes the evidence threshold.
- rationale: identity and malignant transformation are one natural-history pair.
- visual: `VISUAL_REQUIRED`

### O16-LG03｜骨巨细胞瘤：交界行为与治疗冲突
- members: `[7,8]`
- job: `DISCRIMINATION + DECISION_CHAIN`
- goal: recognize 20–40-year epiphyseal eccentric soap-bubble lesion and connect stage/operability to surgery/denosumab while preserving chemotherapy wording as conflict.
- closure: distinguish GCT from simple benign lesions and state the stable treatment trunk without pretending the chemotherapy conflict is resolved.
- rationale: identity and treatment cannot be learned safely apart because “no periosteal reaction” does not equal harmless.
- visual: `VISUAL_REQUIRED`

### O16-LG04｜骨肉瘤 vs 尤文：年龄、骨段、基质/骨膜与系统表现
- members: `[9,10]`
- job: `DISCRIMINATION`
- goal: contrast adolescent metaphyseal osteoid-forming/Codman-sunburst disease with pediatric diaphyseal/pelvic onion-skin/systemic Ewing pattern and pyogenic mimic.
- closure: classify a new aggressive pediatric/young lesion by age + segment + matrix/periosteal + systemic context before pathology.
- rationale: these are the highest-yield competing aggressive primary tumors.
- visual: `VISUAL_REQUIRED`

### O16-LG05｜软骨/骨/淋巴/脊索/骨样骨瘤特殊坐标
- members: `[11,12,13]`
- job: `DISCRIMINATION`
- goal: route short-bone chondroma/pelvic chondrosarcoma/surface osteoma, lymphoma/chordoma and aspirin-responsive osteoid osteoma by distinctive site/matrix/behavior.
- closure: identify which unusual feature (site, calcification/matrix, melt-ice pattern, chordal location or night-pain response) meaningfully narrows the candidate.
- rationale: these are lower-volume but exam-distinct special tumors best learned by contrast.
- visual: `VISUAL_REQUIRED`

### O16-LG06｜肿瘤样病变：囊性、出血性与纤维性
- members: `[14,15,16]`
- job: `DISCRIMINATION`
- goal: separate simple cyst, aneurysmal bone cyst and fibrous dysplasia by age/site/radiographic architecture and surgical danger.
- closure: distinguish clear cystic, septated expansile/bleeding and ground-glass/deformity patterns and state the main treatment goal.
- rationale: these three compete as tumor-like lesions rather than malignant neoplasms.
- visual: `VISUAL_REQUIRED`

### O16-LG07｜年龄—骨段矩阵 + 骨膜反应边界
- members: `[17,18]`
- job: `DISCRIMINATION_TREE + SPATIAL_VISUAL_MODEL`
- goal: use age/site as priors and periosteal response as growth-speed evidence without turning any one radiographic sign into a diagnosis.
- closure: given age + bone segment + periosteal pattern, produce a short ranked candidate set and name at least one counterexample.
- rationale: these KPs are the reusable compression map for all preceding tumor identities.
- visual: `VISUAL_REQUIRED`

### O16-LG08｜脊柱破坏鉴别 + final five-step tumor route
- members: `[19,20]`
- job: `SYSTEM_COMPRESSION + DISCRIMINATION`
- goal: distinguish metastasis/TB/OA/AS spinal patterns and close every bone-lesion case through aggressiveness→age→site→image→biopsy/owner.
- closure: route a new bone pain/mass/pathologic-fracture case without collapsing MM, metastasis and primary bone tumor into one owner.
- rationale: this is the Block and D destructive-structure exit.
- visual: `VISUAL_REQUIRED`

Coverage O16: `1–20 exactly once`.

---

# Accounting

| Block | KP | LG |
| --- | ---: | ---: |
| O1 | 10 | 4 |
| O2 | 16 | 6 |
| O3 | 17 | 6 |
| O4 | 18 | 5 |
| O5 | 15 | 5 |
| O6 | 12 | 4 |
| O7 | 15 | 5 |
| O8 | 7 | 3 |
| O9 | 7 | 3 |
| O10 | 8 | 3 |
| O11 | 13 | 5 |
| O12 | 10 | 3 |
| O13 | 13 | 4 |
| O14 | 13 | 4 |
| O15 | 12 | 4 |
| O16 | 20 | 8 |
| **Total** | **206** | **72** |

Validation statement:

```text
orthopedic stable KP universe = 206
assigned membership count = 206
duplicate membership = 0
missing membership = 0
out-of-range membership = 0
stable KP identity mutation = 0
```

Combined D state after Phase 3A + 3B:

```text
27 Blocks
356 stable KPs
128 Logic Groups
N branch = 150 KP / 56 LG
O branch = 206 KP / 72 LG
assigned membership = 356 / 356 exactly once
```

## Phase-3B verdict

```text
O1–O16 exact semantic partition          PASS
206/206 stable KPs                       ACCOUNTED EXACTLY ONCE
72 groups                                OUTCOME, NOT QUOTA
non-contiguous membership                ALLOWED WHEN COGNITIVELY REQUIRED
visual-dependent groups                  EXPLICIT
Source conflicts                         PRESERVED, NOT RECONCILED
regional eponym = automatic group        REJECT
next                                     compile single D Learning candidate + progressive compression audit
```
