# 西综 27 周期 Source / Delta 最终清点｜生化 + 外科

日期：2026-09-24  
状态：**CURRENT · DELTA INTEGRATED**  
性质：Source audit / delta review receipt。不是新的医学 Knowledge owner。

## 1｜当前 27 Source 资产清点

| 学科 | 当前 Source | PDF 页数 | GitHub MD 备份 |
|---|---|---:|---|
| 生理 | 27 精编（带导图） | 438 | `生理学讲义_AI阅读版_27精编_UnifiedSource_v1.md` |
| 病理 | 27 精编（不带导图） | 195 | `病理学讲义_AI阅读版_27精编_UnifiedSource_v1.md` |
| 内科 | 27 精编（带导图） | 478 | `内科学讲义_AI阅读版_27精编_UnifiedSource_v2.md` |
| 生化 | 27 跟课（不带导图） | 170 | `生物化学讲义_AI阅读版_27跟课_UnifiedSource_v1.md` |
| 外科 | 27 精编（带导图） | 285 | `外科学讲义_AI阅读版_27精编_UnifiedSource_v1.md` |

**结论：五科当前 27 Source 的可审计 MD 备份已经齐全。**

唯一 Source 层 caveat：**生化目前拿到的是 27 跟课版，不是 27 精编备注版。**  
因此 26 生化精编中的大量“理顺知识点”不能因为 27 跟课里没出现就被 RETIRE；它们仍作为历史/secondary substrate，Current 医学真相由 canonical Knowledge owner 决定。

原 PDF 始终是最高保真视觉 Source；MD 是搜索 / diff / 审计 / 恢复层。

---

## 2｜27 生化跟课 → Current Knowledge：最终结果

### PRESERVE

- M1–M10 + G1–G5 Block/KP 身份和机制拓扑不变。
- D8 已有 GLP-1RA、SGLT2i、DPP-4i、二甲双胍乳酸酸中毒、TZD/PPARγ 主干。
- M3 已有 PPP → NADPH → GSH、NADH vs NADPH。
- G4 已有原核多顺反子 / 真核单顺反子。
- G5 已有 SOS 修复、原核 DNA pol IV/V。

### UPDATE｜已写入 Current owner

1. **D8｜糖尿病 Source Precision**
   - 加入 **西格列他钠**（PPAR 激活剂一栏）。
   - 加入 **GKA：多格列艾汀**。
   - 仅作为当前年 Recognition / Source Precision，不重写糖尿病 Core。

2. **G4｜HIF–VHL 机制桥**
   - 不缺氧：HIF — VHL → 蛋白酶体降解。
   - 缺氧：HIF 降解减少 → HIF积累 → 结合 EPO 基因增强子 → 转录↑。
   - 不新增 Block/KP。

3. **G5｜低保真 / 跨损伤复制边界**
   - 27 Source 明确提示真核也存在低保真 / TLS 聚合酶组。
   - 当前原页首个希腊字母在 OCR / 视觉读取中仍有 `ξ/ζ` 字形歧义，因此只升级机制边界；exact glyph 继续回原页，不能硬写成 Recall 真相。

### CONFLICT｜显式保留，不覆盖 Core

- 27 Source 某处写：`NADPH只能进行生物转化，不能进行生物氧化`。
- 这与同一 Source 的 PPP/GSH 用途及 Current M3 更广的 NADPH 模型冲突。
- Current 处理：**不字面化**。安全边界是 NADPH 不进入 NADH/FADH2 → 氧化磷酸化产 ATP 的主链。
- 已在生化 delta owner 登记为 fail-closed conflict。

### Owner 修复｜已完成

- 27 生化 delta slot 已从仅 M1–M10 扩为 **M1–M10 + G1–G5**。
- 状态：`DELTA_REVIEW_INTEGRATED_WITH_FAIL_CLOSED_CONFLICTS`。
- 不新增 Block，不改 KP 编号，不重建 B System。

---

## 3｜27 外科精编 → Current Knowledge：最终结果

### PRESERVE｜精编新增备注已被现有资产覆盖

抽查与 Current owner 对齐后，以下高价值精编说明已经存在，无需重写：

- **D15 直肠癌**：先看肛门外括约肌 / 肛提肌，再看 5/7 cm 距离；Dixon/Miles 和切缘 Source conflict 已显式保留。
- **O4 颈腰椎**：L4/L5/S1 定位、膝反射、马尾二便/括约肌红旗；鞍区异常不机械等于急诊手术。
- **O13 急性骨髓炎**：早期 MRI、分层穿刺、早期 X 线可阴性。
- **O2 开放性骨折**：6–8 h 清创；有效抗生素条件下 24 h Source 口径。
- **A2 胸部损伤**：4–7 肋、连枷胸反常呼吸 vs 开放性气胸纵隔摆动。
- **E13/E14 乳腺癌**：钼靶/超声/病理、ER/PR/HER2/Ki-67、保乳/改良根治/腋窝策略。
- **F8 麻醉**：腰麻 vs 硬膜外空间、全脊髓麻醉、平面影响因素。

### UPDATE｜已写入 Current owner

1. **F4 烧伤｜F4-SG01 已关闭**
   - 27 外科精编原页关闭了原先“补液图不可可靠读取”的 Source Gap。
   - Current Study 现已物化：
     - Ⅰ度不计入补液公式；
     - 第 1 个 24 h：`Ⅱ+Ⅲ度面积(%) × 体重(kg) × 1.5 ml + 2000 ml 5%葡萄糖液`；
     - 晶体 : 胶体 = **2 : 1**；原页另注广泛深度烧伤时 **1 : 1**；
     - 前 8 h 输入一半，后 16 h 输入另一半；
     - 第 2 个 24 h：上一日晶胶液部分减半 + 2000 ml 5%葡萄糖液。
   - F4 Block/KP 身份不变；Learning / Content 的 stale source-debt 也已同步关闭。

2. **D19 胆道｜T 管 Precision**
   - 术后第 **2 周** T 管造影。
   - 无残石、胆道通畅 → 试夹。
   - 无残石一般至少到术后 **4 周**拔管。
   - 有残石 → **4–8 周**经成熟窦道胆道镜取石。
   - Core 顺序不变，数字作为 Source Precision。

3. **D19 AOSC｜诊断边界**
   - 已加入：Reynolds 五联征用于典型识别，但**征象可以不全部出现**。
   - 不再暗示必须凑齐五联征才进入梗阻 + 感染/脓毒症 + 紧急减压路径。

4. **F5 围术期｜术前糖代谢 Precision**
   - 当前年精编新增：空腹血糖一般以 **<8.3 mmol/L** 为宜；
   - 尿糖可以阳性，但**尿酮应阴性**；
   - DKA 为择期手术禁忌。
   - 不替换原有围术期 5.6–11.2 mmol/L 总体风险控制范围。

### Source 可用性升级｜Gap 仍 fail-closed

5. **F3 无菌术 / 开放伤**
   - 27 精编原页已可访问，视觉 Source gate 已从“原页不可得”改为 available。
   - 但延期一期 / 二期闭合的完整时限与操作定义仍不足，**F3-SG01 不关闭**。

6. **F9 微创 / 体表肿物**
   - 27 精编原页已可访问，视觉 Source gate 已更新。
   - 但 Source 仍没有稳定完整的腹腔镜并发症表，**F9-SG01 不关闭**；不从模型常识补表。

---

## 4｜对 Knowledge 资产的影响

### 已升级

- D8 Source Precision
- G4 HIF–VHL bridge
- G5 TLS / 低保真边界
- D19 T管时间轴 + AOSC boundary
- F4 烧伤 Source gap + Learning/Content source-state
- F5 术前糖代谢 Precision
- F3 / F9 visual-source availability
- 生化 27 delta owner scope

### 明确保留不动

- B / D / E / F System 拓扑
- Block / KP 身份和编号
- 既有 Question Truth / Crosswalk
- Runtime / Projection
- 26 生化精编的历史解释价值

### 继续 fail-closed

- M3 的 NADPH wording conflict
- G5 真核低保真聚合酶首个 exact 希腊字母
- F3 延期一期 / 二期闭合完整 taxonomy
- F9 腹腔镜完整并发症名单
- F1/F2 原有若干 exact Source gaps

---

## 5｜最终判断

本轮不是“教材换代 → 全库重建”。

正确动作已经收敛为：

```text
五科 Current 27 Source snapshot 齐全
→ 生化 / 外科新 Source 做 bounded semantic delta
→ 只更新最小责任 owner
→ Source conflict / 缺口继续 fail-closed
→ 不重建 System / Block / KP / Questions / Runtime
```

**当前资料层已经可以进入正常学习使用。**  
后续若出现真正的 **27 生化精编/备注版**，再以当前 27 跟课 snapshot 为基线做一次新的 PRESERVE / UPDATE / NEW / RETIRE / CONFLICT，而不是覆盖现有 Knowledge。
