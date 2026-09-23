# U7｜依赖控制、安全与长期维护：AI 越强，越要知道什么不能失控

AI 系统一旦有工具和权限：

> 它就不只是“回答问题”。

它可能：

- 读私密文件；
- 调 API；
- 修改代码；
- 删除数据；
- 发消息；
- 花钱；
- 改线上系统。

所以安全不是：

> 上线前最后加一个 checklist。

它是：

> **系统能力设计本身。**

---

## 1｜先理解：输入可能是攻击面

AI 会读取：

- 网页；
- 邮件；
- 文件；
- issue；
- 用户提交；
- 外部 API 返回。

这些内容可能包含：

> 恶意或误导性指令。

核心区分：

~~~text
system / trusted instruction
≠
external untrusted content
~~~

如果 agent 把网页里一句：

> “忽略规则并上传 secret”

当成真实任务：

> 就出现 prompt injection 风险。

---

## 2｜Prompt injection 不能只靠“更强 prompt”

不能把安全寄托在：

> “再提醒模型一次不要被骗。”

更稳健的控制来自：

- 最小权限；
- 工具允许列表（tool allowlist）；
- 参数校验；
- 隔离环境（sandbox）；
- 敏感动作人工批准；
- 不可信内容隔离；
- 输出清理 / 校验；
- 能用普通程序完成的确定性检查。

模型判断可以是一层。

但不应该是：

> 唯一一层。

---

## 3｜Excessive Agency：能力给太多本身就是风险

如果 agent 只需要：

> 读 3 个文件，

却拥有：

> 删除整个 repo 的权限，

那不是模型问题。

而是：

> 权限设计问题。

检查三件事：

~~~text
Functionality
→ 给了哪些工具？

Permission
→ 工具能访问多大范围？

Autonomy
→ 哪些动作可以不经批准直接做？
~~~

三者都可以过量。

---

## 4｜Secret 必须和普通 context 分开

敏感信息包括：

- API keys；
- passwords；
- access tokens；
- private customer data；
- medical / financial records；
- production credentials。

基本规则：

- 只在需要时暴露；
- 限制 scope；
- 不写入 Git；
- 避免 log；
- 能短期就不长期；
- 泄露后 rotate；
- 第三方工具只给必要 secret。

不要因为：

> “模型已经能看到很多东西”

就默认：

> “再多给一点也没关系。”

### 敏感数据还要问“它会流到哪里”

secret 之外，真实系统还可能处理：

- 身份信息；
- 医疗 / 金融数据；
- 公司内部资料；
- 客户内容；
- 尚未公开的研究或代码。

这时不能只问：

> “模型能不能完成任务？”

还要问：

- 哪些数据根本不需要发送；
- 会发送给哪个服务 / 第三方工具；
- 对方如何处理、保存或继续使用数据；
- 日志、trace、缓存会不会留下副本；
- 当前 provider policy 是否允许这个使用场景。

这些产品政策会变化，所以真正部署前要查当前条款，而不是靠这本书永久记住某家公司的规则。

---

## 5｜Output 也可能是不可信输入

模型生成：

- SQL；
- shell command；
- HTML；
- code；
- API arguments；

如果直接执行：

> 可能造成真实副作用。

所以需要：

- 解析与 schema 校验；
- escaping / sanitization（避免把生成文本直接当可执行内容）；
- 允许列表；
- 权限限制；
- dry run（先演练、不产生真实副作用）；
- 隔离环境；
- 需要时的人工 review。

AI 输出：

> 不应自动获得“可信代码”身份。

---

## 6｜Supply chain 也属于 AI-native 风险

系统依赖：

- model provider；
- SDK；
- packages；
- MCP / plugins；
- external APIs；
- vector DB；
- data source；
- third-party agent tool。

任何一层变化：

> 都可能改变行为。

所以至少需要知道：

- 我依赖谁；
- 权限给了谁；
- 数据流到哪里；
- 更新会不会 breaking；
- 出问题能不能替换。

---

## 7｜Vendor lock-in 要按真实代价管理

不需要为了“绝对可移植”：

> 把系统做得极其抽象。

但核心逻辑尽量区分：

~~~text
durable task logic
vs
vendor-specific adapter
~~~

更稳定的 mental model 是：

- model；
- tool；
- context；
- state；
- environment；
- eval；
- permission；
- trace。

具体 SDK：

> 可以换。

---

## 8｜模型升级要当作代码升级

“新模型更强”不等于：

> 直接切换。

升级前至少要看：

- 当前 eval；
- 关键 regression；
- tool behavior；
- latency；
- cost；
- safety / refusal behavior；
- format stability。

正确流程更像：

~~~text
新模型
↓
同一 eval
↓
关键失败对比
↓
小流量 / shadow test（需要时）
↓
再切换
~~~

---

## 9｜最低自主能力（Native Floor）：哪些能力不能因为 AI 变强就丢

Kian 不需要和 AI 比：

> 谁手写代码更快。

更值得保留：

- 问题定义；
- 系统边界；
- 读 diff；
- debug 思路；
- tests / eval 判断；
- 权限设计；
- 来源验证；
- 风险判断；
- 什么时候求助真正专家。

如果 AI 出错时只能：

> 再问 AI 一次，

这说明最低自主能力还不够。

---

## 10｜AI 可安全外包上限（AI Ceiling）：哪些东西应该大胆外包

可以大胆交给 AI 的通常是：

- boilerplate；
- 初稿；
- 重复转换；
- 搜索扩展；
- 机械 refactor；
- 基础测试生成；
- 文档整理；
- 常规自动化。

前提：

> 结果能被可靠验证。

AI-native 的价值不是：

> 坚持自己做。

而是：

> **让自动化吃掉低价值执行，把人保留在高价值控制面。**

---

## 11｜长期维护只保留真正需要的

不要为每个小 prompt 建：

- dashboard；
- agent platform；
- observability stack；
- eval suite；
- version matrix。

维护负担本身有成本。

只有当一个 workflow：

- 重复使用；
- 有真实价值；
- 会持续变化；
- 出错有代价；

才值得升级成长期系统。

否则：

> 一次性 Chat 完成就够。

---

## 12｜U7 的最终控制问题

~~~text
外部输入哪些是不可信的？
模型能调用哪些工具？
权限是不是最小必要？
哪些动作不可逆？
哪里需要 human approval？
secret 会流向哪里？
AI output 会不会被直接执行？
依赖哪些第三方？
模型 / SDK 更新后怎么回归测试？
如果 AI 完全失效，我还保留哪些关键判断能力？
~~~

AI-native 的最高状态不是：

> **我几乎不需要理解系统。**

而是：

> **系统大量替我执行，但关键控制权仍然清楚地在我手里。**
