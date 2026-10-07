# LEG27 当前 retention Source（候选转录）

版本：2027。状态：**BLOCKED**，不是高保真入库完成。按最新用户指令，仅收录上册和下册。

| 原文件 | 角色 | PDF 页数 | Markdown | fidelity | UNCLEAR 页数/页码 |
| --- | --- | ---: | --- | --- | --- |
| 冲刺背诵手册上册.pdf | DESIGNATED_RETENTION_SOURCE | 234 | [LEG27-UPPER.md](LEG27-UPPER.md) | BLOCKED / OCR_CANDIDATE | 228 页：2–5, 9–12, 14, 16–234 |
| 冲刺背诵手册下册.pdf | DESIGNATED_RETENTION_SOURCE | 87 | [LEG27-LOWER.md](LEG27-LOWER.md) | BLOCKED / OCR_CANDIDATE | 85 页：2–50, 52–87 |

上下册共同构成当前腿姐 designated retention source。其用途是按**实际检查过的原 PDF 范围**判断 retention necessity 和 recognition / conceptual paraphrase / complete membership / exact pairing / genuinely fixed wording 的深度；再区分模型内主提示与模型外高精度 residual / Memory / Precision。

候选 Markdown 是检索与原页定位入口。`[UNCLEAR: PDF pX OCR LX]` 后的文字是尚未可靠确认的 OCR 候选，不是被确认的原文；`UNCLEAR_PAGE` 阻断其标明的表格、连线或图示关系。两套 OCR 一致也不等于全页逐字视觉认证。**不得把候选全文作为已验证精确 Source 自动消费。** 相关精确字段必须回到本 README 的 SHA-256 绑定 PDF 对应物理页核对。

Source 入库不授权改写乘风主模型、不自动制造 Memory，不证明任何章节完成 retention review，也不证明既有 473 张卡已获得腿姐筛选。历史 LEG26 和模型知识均未用于补字。颜色未转换成必背等级。

自测本按用户最新指令不入库；既有辅助材料语义保持原状。

原文件位于本次用户明确指定的 `/Users/ben/Downloads/` 路径；不把本机路径视为 GitHub 可下载 PDF。仓库仅提交 Markdown、定位和 QA，不提交 PDF。

## 原文件身份

- `冲刺背诵手册上册.pdf`：SHA-256 `ae002999fa731f6fb06a99deaa3b39a7cfd68923382cab064ae0ab191cb1b6e9`；234 PDF pages。
- `冲刺背诵手册下册.pdf`：SHA-256 `9bf8f5147fbb3683705d06a87d5d350ede78c58fc05d83a27d42824c3f5b35a1`；87 PDF pages。

完整方法、抽检边界、所有未解决位置和锚点 QA 见 [QUALITY_REPORT.md](QUALITY_REPORT.md)。
