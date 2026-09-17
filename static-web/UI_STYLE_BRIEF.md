# KianOS UI Style Brief

Status: **CURRENT SHARED VISUAL DIRECTION — BOUNDED IMPLEMENTATION CALIBRATION**  
Scope: learner-facing static-web  
Preference owner: `KIAN_UI_PREFERENCES.md`  
Execution: `CODEX_ASTRA_THREE_SUBJECT_SITE_EXECUTION.md` v3.0+  
Semantic parent: `PRESENTATION_CONTRACT.md` + domain Product/Learning/Interaction owners

## 1｜目标气质

**专业知识工作台的内容组织 + 现代桌面产品的完成度。** 这不是“学术/现代”的数字比例，也不是对某品牌的复制。内容、模型、题目、写作是主角；导航和软件自身退后。

设计原点是 Mac 横屏：中高有用信息密度、低混乱、足够大且有对比的字、明显层级、稳定阅读节奏。横向面积用于同时有用的上下文，不用于更多 badge/dashboard。窄窗口可靠降级，不反过来规定桌面布局。

避免 tiny learner text、巨型 Hero/空白、默认卡片堆、每段圆角框、装饰渐变/高饱和多色、工程状态、假进度和游戏化学习债务。

## 2｜自主选择与边界

当前字体/色值不是必须先让 Kian 逐项审批的 blocker。Astra 可在代表任务上建立一次一致的 font stack/字号/spacing/neutral-accent/control tokens，再跨科复用；不能每页一套，也不能借此推翻已接受的成熟构图。

优先现有可用、合法字体与系统栈；先解决正文和题目读得舒服。具体字号/行距/列宽由真实长内容、Mac viewport 与浏览器结果决定，不以 8–10px 主内容换“高密度”，也不放大标题制造“高级感”。

### Learner-visible type floor

只要学习界面选择把一段文字默认显示出来，就等于告诉 Kian：**这值得读取或识别。** 因此不能用 tiny type 来表示“次要”。次要信息应通过位置、颜色、字重、分组和是否默认显示来降权，而不是通过增加辨认成本来降权。

- Mac 主学习界面中，默认可见、需要 learner 读取/识别的文字，**原则上不得低于 15px**。
- 正文、解释、关系说明、题目辅助说明通常应 **≥16px**；主要标题按真实层级继续更大。
- 只有纯装饰符号或明确无需读取的视觉符号可以低于该 floor；工程 ID、debug/status、内部 provenance 若不值得读，应隐藏或按需展开，而不是以 9–12px 常驻。
- `metadata`、`secondary`、`quiet` 不等于 `tiny`。视觉降权不能以显著增加阅读注意力消耗为代价。
- 一屏密度不足时，优先减少重复 chrome、合并布局、使用横向空间或局部滚动；不要先缩字。
- 真实浏览器验收应主动检查 visible learner text 是否跌破 floor，而不是只检查主标题和正文。

偏克制的 neutral base + 一个协调 accent family，状态还有文字/形状辅助，不仅靠颜色。作答前 selected 只表示我的选择，不能使用暗示正确的样式。对错/Uncertain/保存失败各有清楚、克制的区别。

普通 polish 自主；大幅更换整体风格或结构按 master L3。Professional 不等于陈旧后台，modern 不等于卡片墙。

## 3｜组织优先级

先用 typography → alignment → rhythm/indentation/grouping → thin rules/subtle backgrounds；确有语义/交互边界才用 card/border。阴影只为真实浮层，圆角克制一致。

重要模型和第一轮有用内容直接可见；不得为“干净”移进一串 accordion。深层参考、非当前时机内容与受保护答案按领域规则显示，不为填满页面而补空 category。

Guide 可有密度、有长内容、可滚动；不是一屏摘要。英文长阅读行长受控，考试选项保留纸面扫描感，写作输入像 authoring workspace 而非后台表单。

## 4｜控件与反馈

主/次/quiet action 区别明确但不夸张。Focus/keyboard focus 可见；pointer 与键盘同语义；输入框、select、contenteditable、中文输入法组合输入优先于学习快捷键。快捷提示可发现但不长期占大面积。

保留滚动/选中/任务位置，稳定路径不跳布局。Save/loading/disabled/error/fail-closed 状态清楚且可恢复；不能为 Fast 吞掉保存失败，也不能让退出静默丢草稿。破坏性 reset 仍保留必要安全边界，不套用“少确认”。

## 5｜Motion

允许服务状态理解的细腻 hover/focus/选择、局部展开、submit/reveal、必要 linked-object 定位；不延迟下一题，不抢滚动或焦点。

禁止 spring/bounce、页面飞入、大面积滑动、逐卡 stagger、滚动炫技与纯表演动画。Respect reduced motion。内容加载后尽量不跳布局，反馈不能漏出尚未允许的答案。

## 6｜统一语言，不统一模板

三科共享排版/间距/控件/焦点/错误和返回质量；Reading 全文+全题、Cloze 全20行、Part B 全图、Translation 源文+输出、Writing prompt+authoring、西综/政治认知模型各守原生几何。

Home：meaningful Continue、稳定科目/任务入口、安静的 Guide/工具；不是方法说明墙、全部章节目录或工程 dashboard。Guide 的低摩擦入口遵守 master §4，不能只是被折叠隐藏的帮助链接。

## 7｜主题范围与验收

新 dark-mode 工程不作为本轮前置或目标；已存在的有效主题/可访问性不删除。实际用到的主题均保持基本可读性。

实现 → 实际浏览器 → 代表截图/互动自查 → 修明显缺陷 → 复测。不是满足固定几轮就合格，也不无止境美化。截图覆盖 Mac 主场景、问题/保护态、长内容与窄窗。有限机器测试不能替代真实视觉审查；Kian 尚未接受的结构 alternative 不推广。

本文件不改变 Learning、Content、Evidence、几何保护或 learner U。旧视觉简报原文存 `design-archive/2026-09-14/UI_STYLE_BEFORE_V3.md`，其“先审批所有 tokens 才能开工”阶段要求已退出执行。
