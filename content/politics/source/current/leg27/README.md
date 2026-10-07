# LEG27 当前 retention Source

版本：2027。状态：**AVAILABLE / MD_INGESTED / INSPECT_BY_SCOPE**；fidelity：**PASS_WITH_UNCLEAR**。按最新用户指令，仅入库上册和下册。

| 原文件 | 角色 | PDF 页数 | Markdown | fidelity | UNCLEAR 页数 / 页码 |
| --- | --- | ---: | --- | --- | --- |
| 冲刺背诵手册上册.pdf | DESIGNATED_RETENTION_SOURCE | 234 | [LEG27-UPPER.md](LEG27-UPPER.md) | PASS_WITH_UNCLEAR | 12：78, 104, 107, 130–131, 138, 141, 165, 177, 192, 194, 204 |
| 冲刺背诵手册下册.pdf | DESIGNATED_RETENTION_SOURCE | 87 | [LEG27-LOWER.md](LEG27-LOWER.md) | PASS_WITH_UNCLEAR | 5：2, 31, 60, 79–80 |

上下册共同构成当前腿姐 designated retention source，用于在实际检查过的原文范围内判断 retention necessity，以及 recognition / conceptual paraphrase / complete membership / exact pairing / genuinely fixed wording 的恢复深度；辅助区分模型内主提示与模型外高精度 residual / Memory / Precision。

Markdown 保留全部物理页锚点和原文顺序。`[UNCLEAR: ...]` 标明原扫描中仍无法可靠辨认的局部裁切、小字或手写图注；该位置不得用于精确知识、答案或 retention 判断，必须回到 SHA-256 绑定的原 PDF 对应物理页解决。页码锚点完整和视觉校对记录不构成零转录错误保证。

Source 已入库不等于章节 retention 已审完，也不证明现有 473 张卡已被腿姐筛选。具体章节必须读取对应 Source 页面后才获得该范围的筛选结论；本任务不改写乘风主模型、不自动制造 Memory。历史 LEG26 和模型知识均未用于补字；颜色不转成必背等级。

自测本按用户最新指令不入库，既有辅助材料语义保持原状。原 PDF 来自用户明确指定的 `/Users/ben/Downloads/` 文件，本地路径不视为 GitHub PDF 下载入口；仓库只提交 Markdown 与 QA。

## 原文件身份

- `冲刺背诵手册上册.pdf`：234 PDF pages；SHA-256 `ae002999fa731f6fb06a99deaa3b39a7cfd68923382cab064ae0ab191cb1b6e9`。
- `冲刺背诵手册下册.pdf`：87 PDF pages；SHA-256 `9bf8f5147fbb3683705d06a87d5d350ede78c58fc05d83a27d42824c3f5b35a1`。

提取方法、视觉校对范围、缺陷修复及全部未解决位置见 [QUALITY_REPORT.md](QUALITY_REPORT.md)。
