# 西综 27 周期 Source / Delta 最终清点｜生化 + 外科

日期：2026-09-24  
性质：Source audit / delta review receipt。不是新的医学 Knowledge owner。

## 1. 当前 Source 清点

| 学科 | 当前 27 周期资料 | MD 状态 | 说明 |
|---|---|---|---|
| 生理 | 27 精编（带导图） | 已有 AI 阅读版 | 当前 Source 已覆盖 |
| 病理 | 27 精编（不带导图） | 已有 AI 阅读版 | 当前 Source 已覆盖 |
| 内科 | 27 精编（带导图） | 已有 UnifiedSource | 当前 Source 已覆盖 |
| 生化 | 27 跟课（不带导图） | **本轮新建** | 当前年跟课 Source；不是“精编备注版” |
| 外科 | 27 精编（带导图） | **本轮新建** | 当前年精编 Source，含大量“理顺/串联”说明 |

本轮新建：

- `生物化学讲义_AI阅读版_27跟课_UnifiedSource_v1.md`
  - Source: `27生化跟课版合集【不带导图】.pdf`
  - PDF: 170 pages
  - SHA-256: `17d991896f0edea0b2e1274fdee76862998a1f3bd0c4bad03155bf9e4b27ce1c`
- `外科学讲义_AI阅读版_27精编_UnifiedSource_v1.md`
  - Source: `27外科精编版【带导图】.pdf`
  - PDF: 285 pages
  - SHA-256: `523cc9111b69f7eb77b928234d2e86f7e2ba9949e962eac2c5a240219b5cd9a0`

原则：原 PDF 仍是最高保真视觉 Source；MD 是可检索、可 diff、可审计备份层。

---

## 2. 生化 27 跟课 vs 既有资产

### 总结

**不重建 M1–M10 / G1–G5。**  
27 跟课的主要变化是 Source 编排、补充例子和少量当前年 Precision；现有机制型 Knowledge 拓扑优于讲义顺序，应保持稳定。

### PRESERVE

- M1–M10 / G1–G5 Block/KP 身份不变。
- 现有 D8 已覆盖 GLP-1RA、SGLT2i、DPP4i、二甲双胍乳酸酸中毒、TZD/PPARγ 等主干。
- M3 已覆盖 PPP → NADPH → GSH、NADH vs NADPH。
- G4 已覆盖原核多顺反子 / 真核单顺反子、HIF 作为缺氧诱导转录因子。
- G5 已覆盖 SOS 修复和原核 DNA pol IV/V。

### UPDATE 候选

1. **B/D8｜糖尿病 Precision**
   - 新 Source 明确加入 `西格列他钠`（PPAR 激活剂一栏）。
   - 新 Source 明确加入葡萄糖激酶激活剂 GKA：`多格列艾汀`。
   - 当前 D8 尚无这两个药名。
   - 建议：作为 **Source Precision / Recognition** 加入，不改变糖尿病 Core 决策模型。

2. **B/G4｜HIF–VHL 缺氧感知链**
   - 新 Source 明确：不缺氧时 HIF–VHL → 蛋白酶体降解；缺氧时 HIF 降解减少并结合 EPO 基因增强子。
   - 当前 G4 有 HIF，但缺 VHL 这一机制桥。
   - 建议：补一个小型机制连接，不新增 Block/KP。

3. **B/G5｜低保真 / 跨损伤复制 Precision**
   - 新 Source 末页将 SOS/低保真聚合酶并列：
     - 原核：DNA pol IV / V
     - 真核：DNA pol ζ / η / ι / κ
   - 当前 G5 已有原核 IV/V，缺真核这一组。
   - 建议：加入 **Precision / confusable boundary**，不扩成完整 DNA polymerase 新课程。

### CONFLICT / 不应直接覆盖

- 新 Source 某页写有：`NADPH只能进行生物转化，不能进行生物氧化`。
- 同一 27 Source 的 PPP / GSH 内容及当前 M3 都把 NADPH 用于抗氧化、还原合成、生物转化等。
- 因此不能把“只能进行生物转化”字面化写入 canonical Core。
- 建议保留的考试边界是：**NADPH 不进入 NADH/FADH2 → 氧化磷酸化产 ATP 的主链**；该句登记为 Source wording conflict。

### Source-owner 元数据

现有 `xizong-2027-biochemistry-delta-slot.json` 原先只列 M1–M10，但这份 27 生化 Source 还完整覆盖 G1–G5。  
应把 delta 作用域修正为 **M1–M10 + G1–G5**，避免基因部分成为 owner 漏洞。

---

## 3. 外科 27 精编 vs 既有资产

### 总结

27 精编相对 27 跟课最大的增量是大量 **“理顺知识点 / 串联 / 临床解释”层**。  
但抽查 Current canonical 后，大部分高价值语义已经存在；因此不应把整本精编备注重新灌进 Knowledge，而应只做小范围 delta。

### 已经覆盖，直接 PRESERVE

以下精编增量在 Current Knowledge 中已经存在：

- **D15 直肠癌**：肛门外括约肌 / 肛提肌优先于单纯距离规则；Dixon/Miles 与 5/7 cm、切缘冲突已显式保留。
- **O4 颈腰椎**：L4 膝反射、L4/L5/S1 定位；马尾以二便/括约肌红旗分流，鞍区感觉异常不机械等于立即手术。
- **O13 急性骨髓炎**：早期 MRI、分层穿刺、X 线早期可阴性。
- **O2 开放性骨折**：6–8 h 清创；有效抗生素条件下 24 h Source 口径。
- **A2 胸部损伤**：4–7 肋、连枷胸反常呼吸 vs 开放性气胸纵隔摆动。
- **E13/E14 乳腺癌**：钼靶/超声/病理、ER/PR/HER2/Ki-67、保乳/改良根治/腋窝策略等。
- **F8 麻醉**：腰麻 vs 硬膜外空间、全脊髓麻醉、平面影响因素。

这些不需要重写或重新拆 Block。

### 明确需要升级

1. **F4 烧伤｜关闭 F4-SG01**
   - 27 精编原页现已可直接验证补液图和算例。
   - Source 明确：
     - Ⅰ度不计入补液公式；
     - 第 1 个 24 h：Ⅱ+Ⅲ度面积 × 体重 × **1.5 mL**，另加 2000 mL 葡萄糖液；
     - 晶体 : 胶体 = **2 : 1**（即 1.0 + 0.5 mL/kg/%）；
     - 前 8 h 输入晶胶液的一半，后 16 h 输入另一半；
     - 第 2 个 24 h：晶胶液减半，2000 mL 水分/葡萄糖液保持。
   - 当前 F4 正因原图不可访问而 fail-closed。
   - **这是本轮最明确的 Source Gap closure。**
   - 建议：更新 F4 Source locator / visual gate / KP08 Precision，不改变 F4 Block/KP 身份。

2. **D19 胆道｜T 管 Precision**
   - 27 精编补充了明确时间轴：
     - 术后第 **2 周** T 管造影；
     - 无残石且通畅 → 试夹；
     - 无残石一般 **4 周**拔管；
     - 有残石 → **4–8 周**经窦道胆道镜取石。
   - 当前 D19 Core 故意只写“数周”，把精确周数留给 MI-D。
   - 建议：**Core 不改，升级 MI-D / Precision Memory**。

3. **D19 AOSC｜加一个诊断边界**
   - 精编原页明确写“**征象可以不全部出现**”。
   - 当前 D19 有 Reynolds 五联征和紧急减压，但容易被读成“必须凑齐五联征”。
   - 建议：在 KP16 增加一句 boundary：典型五联征用于识别，但临床/题目不要求全部出现；核心是梗阻 + 感染/脓毒症 + 紧急减压。

4. **F5 围术期｜血糖 Precision**
   - 精编新增：术前空腹血糖通常以 **<8.3 mmol/L** 为宜；尿酮应阴性；DKA 是择期手术禁忌。
   - 当前 F5 已保留围术期 5.6–11.2 mmol/L 的总体范围，但没有 8.3 这一精确考试口径。
   - 建议：作为 **MI-D / Source Precision** 增补，避免替换 F5 的整体风险模型。

### Source 可用性升级，但语义 Gap 仍保留

5. **F3 无菌术 / 开放伤**
   - 27 精编 P228 原页现已可访问，视觉 gate 可从“原页不可得”改为 Source available。
   - 但新 Source 仍只说“哪些伤口不一期缝合”，没有完整定义延期一期 / 二期闭合的时限与操作标准。
   - 所以 **F3-SG01 不能关闭**。

6. **F9 微创**
   - 27 精编 P229 原页现已可访问，体表肿物图和 CO₂ 气腹入口可核对。
   - 但 Source 仍只有“腹腔镜可有与 CO₂ 气腹相关并发症”，没有稳定完整并发症表。
   - 所以 **F9-SG01 继续 fail-closed**，不能用模型常识补表。

---

## 4. 最小升级清单

按优先级：

| 优先级 | Owner | 动作 |
|---|---|---|
| P0 | F4 | 关闭烧伤补液 Source Gap；写入精确公式和视觉 Source locator |
| P0 | 生化 delta slot | 扩 owner 范围 M1–M10 → M1–M10 + G1–G5 |
| P1 | D8 | 补西格列他钠、多格列艾汀 Source Precision |
| P1 | G4 | 补 HIF–VHL 缺氧感知机制桥 |
| P1 | G5 | 补真核低保真 DNA pol ζ/η/ι/κ |
| P1 | D19 | T 管 2w / 4w / 4–8w Precision；AOSC“五联征可不全”边界 |
| P2 | F5 | 补术前空腹血糖 <8.3 mmol/L、尿酮阴性 |
| P2 | F3 | 仅更新视觉 Source availability；保留 SG01 |
| P2 | F9 | 仅更新视觉 Source availability；保留 SG01 |
| HOLD | M3 | NADPH 新备注登记 conflict，不覆盖 canonical Core |

## 5. 不需要做的事

- 不重建 B / D / E / F System。
- 不改 Block / KP 编号。
- 不按新讲义目录重新组织 Knowledge。
- 不把所有“理顺知识点”机械复制进 canonical Content。
- 不把 Source 备注当成自动正确的医学真相。
- 不因新 Source 到达而重跑整套 Questions / Crosswalk / Runtime。

结论：本轮属于 **Source replacement + bounded semantic delta**。真正需要进入 canonical Knowledge 的改动很小，主要是 F4 Source Gap closure、少量生化/胆道/围术期 Precision，以及一个 NADPH wording conflict。