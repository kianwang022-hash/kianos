# 个人系统流程验收 · 首版

一个可重复运行的本地验收入口，检查“实际操作产生的学习事实能否保存和恢复”。只挂载已有合成练习 fixture 与生产组件，不创建测试平台、不修改产品逻辑、不读取真实学习记录。

## 运行

在 `static-web/` 执行：

```sh
node scripts/personal-system-acceptance/run.mjs
node scripts/personal-system-acceptance/run.mjs --prove-detector
```

需要本机已有 Astro、Playwright 和 Chromium。脚本不安装软件、不下载浏览器。若 Playwright 默认浏览器路径不存在，可指定已安装浏览器：

```sh
KIANOS_TEST_CHROME='/absolute/path/to/installed/chromium' \
  node scripts/personal-system-acceptance/run.mjs --prove-detector
```

使用当前 checkout 内独立的 `node_modules`。已有依赖可通过现成的 `ensureCandidateDependencies` 按 manifest/proof 核对并复制；拒绝把整个 `node_modules` 链接到另一工作副本。Playwright 和浏览器版本写入报告。

每次输出唯一目录：`static-web/.qa/output/playwright/personal-system-acceptance/run-*/`。入口会打印可打开的 `report.md`；`report.json` 供机器消费。报告、截图、trace、日志、原生状态快照全部是合成数据。`.qa` 已被仓库忽略。需要回收报告时，删除选定的 `run-*` 目录即可；运行资源与报告分开，运行结束会自动清理。

退出码：`0` 全部实际业务场景通过，且请求的故障证明通过；`1` 业务/检测/清理失败；`2` 环境阻断，业务场景未运行。缺少依赖、启动失败或权限拒绝不能记作业务通过。

## 三个用户流程与原生组件验收

| 场景 | 真实操作 | 必须验证的原生结果 |
| --- | --- | --- |
| 原生 KP/System 证据 | 完整生产 Astro 组件接收合成 Recall 操作及配额失败 | 重复 KP 事实保留、三种 System phase 正确；未展开及配额失败不能推进或覆盖历史 |
| 保存与恢复 | 开始合成题组、选择 A、提交、写备注、刷新、关闭 context、空 context 重开 | 第一题首答为 WRONG/A；仅一条复盘事件；备注、session ID、题序、当前位置、原始首答完全相同；磁盘 checkpoint 内容一致且权限 600 |
| 跨学习日 | 浏览器时钟从上海 2030-01-01 23:59 跨到 01-02 00:01，再提交第二题并恢复 | 第一题事实及旧日期不变；第二题归新日期；两条不同 event ID；新 checkpoint 日期为 01-02；空 context 恢复两题与当前位置 |
| 存档断网恢复 | 已保存空题组后中断 checkpoint GET/PUT，继续答题、备注、刷新，然后恢复连接 | 本地事实保留；尚未确认存档警告可见；磁盘尚未拥有新事实；恢复后磁盘内容一致、警告消失、空 context 可恢复 |

断网限定为私有 checkpoint 网络故障；静态题面和解析仍可用，不宣称整站离线缓存已验收。触发存档复用生产的离开页面 `blur` flush 路径。跨日只调整隔离浏览器的时钟，计时器保持正常运行，不调整 Mac 系统时间。三个用户流程不预填 learner localStorage；新增原生组件探针只写入独立 context 中的合成已学/作答前置状态。不替换 `hasFocus`、Web Locks、writer 或 checkpoint 冲突保护。

HTTP 成功只用于环境就绪；业务成功要求生产 UI 提交产生的原生首答/复盘/session、真实私有磁盘文件和重新打开的空浏览器三者一致。原生结果对比不包含渲染时自然变化的最后访问时间，也不把题目可见当成答题成功。

## 故障证明

`--prove-detector` 使用同一组业务断言再跑四个独立故障样本：

| 注入 | 必须失败的断言 |
| --- | --- |
| `legacy-fixture-revision`：在临时副本移除 `taskRevision`，回放已证实的旧 fixture 缺字段问题 | `REFRESH_UI_RESULT` |
| `false-ack`：PUT 返回 HTTP 200 + 匹配的 saved ID，但不落盘 | `DURABLE_RESULT` |
| `stale-read`：空 context 收到第一天旧 checkpoint | `RESTORED_RESULT` |
| `stuck-offline`：恢复阶段仍中断 PUT | `RECOVERY_DURABLE_RESULT` |

故障样本的业务结果始终保留 `FAIL`。只有注入确实触发、且命中预先指定断言、且清理通过，检测能力才记为 `PASS`。任意启动错误、selector 超时或其他断言失败都不能冒充“成功抓住故障”。

第一项是**已证实的旧 fixture 缺字段回放**：旧题目缺少 `taskRevision`，生产客户端会写入 `taskRevisions: {}`，原生 `politicsSessionMatchesCatalog` 会拒绝刷新恢复。本阶段已修复共享合成 catalog 的身份生产；正常运行无需临时适配。负向样本仅在临时副本中删除身份，保护和断言均不改变。旧 task7 候选及失败证据保留。

其余三项是**故障签名的受控注入**，不冒称历史产品版本回放。来源是现有 `test-private-checkpoint-bootstrap-browser.mjs` 中的保存失败提示、有效本地状态保留及最新位置恢复，以及 `test-politics-practice-journey.mjs` 中的首答/复盘刷新不重复验收。断网正向场景会实际触发并验证现有修复行为；负向样本证明验收器不会被假成功、旧快照或未恢复网络欺骗。

## 隔离、复用与范围

- 每次创建临时 root；每个场景再独占 private learner/control/packet/external/generated roots、动态 loopback 端口和空 BrowserContext。拒绝 4321/4322，也不提供外部 URL、端口或 private root 参数。
- 子进程环境先删除继承的全部 `KIANOS_*`，再调用现有 `isolatedCandidateEnv`，显式提供所有 private roots；生产静态服务使用 `--release-probe-only` 的现有隔离检查。远端 relay 关闭，浏览器非本场景 origin 的请求被拦截。
- 只启动自己的无持久 profile Chromium，绝不连接现有用户浏览器/CDP。只停止自己创建的 PID/process group，验证端口关闭、private roots 删除；信号退出也走清理。SIGKILL/断电无法保证 finally 执行，报告路径和临时 root 会记录在运行输出/报告中；只清理确认属于该次运行的目录。
- 构建只复制 `scripts/fixtures/politics-practice` 的合成 source/catalog，使用生产 `BaseFrame`、`PoliticsPracticeWorkbench`、`browserLearnerWriter`、`privateCheckpointRuntime`、`privateLearnerStore` 和静态服务。构建与报告不改生产 route/config/manifest。
- 报告记录关键生产/共享 fixture 文件的运行前后 SHA-256，并要求完全一致。`run-plan.json` 在启动时先写入，保留本次临时 root 与计划，即使中断也不会把缺少结果当成功。
- 复用 Current doctor 的“transport 与 learner evidence 分离”判断边界；managed Current doctor 本轮明确 `NOT_RUN`，因为临时 fixture 没有 Current mirror/LaunchAgent，不能把它伪装为 Current readiness。此前 A2 readiness 修复不重做。
- 不覆盖 writer 多页面竞争、日程链路/筛选、完整正式语料、真实学习效果或部署；这些在每份报告中列为未运行。现有真实 U 与独立内容项目不受影响。

依据：`AGENTS.md` → `static-web/CURRENT.md` 的 checkpoint 症状入口 → `SYSTEM_CONTRACT.md §6`、`LOCAL_CURRENT_SYNC.md` 的私有事实边界与上述生产 owners。本阶段复用 `../test-support/` 的隔离、readiness、cleanup 和原生 owner 验收接口；没有新增产品语义、事实注册表或第二套 checkpoint 合同。

## 本轮供独立架构审查的观察

1. **原生合同与 fixture 演进脱节（已复现并在本候选修复）**：旧 `fixtures/politics-practice/catalog.mjs` 不提供 `taskRevision`；`src/lib/politicsPracticeClient.mjs` 的 `startSession` 写入 per-task revision map，`politicsPracticeState.mjs:politicsSessionMatchesCatalog` 则要求每项为字符串。已让共享合成 catalog 生产身份，刷新恢复通过；没有放宽保护。
2. **测试环境能力依赖隐含**：`static-web/package.json` 不声明 Playwright，`test-private-control-browser.mjs` 却要求 1.60+ 原生 focus 支持；`fixtures/politics-practice/README.md` 的安装示例仍指定 1.56.1。本机实际可用组合为 Playwright 1.63.0 + 已安装 Chromium 148，通过显式路径使用；不是默认为可用的可重现锁定环境。
3. **服务启动/隔离/清理重复且形式不同**：`test-politics-practice-journey.mjs` 使用固定端口与 Astro preview；`test-lexical-same-day-relearn-browser.mjs` 启 Candidate；`test-private-checkpoint-bootstrap-browser.mjs` 启独立静态服务/浏览器。现有 `isolatedCandidateEnv` 已能承载大部分隔离，但各入口对 bootstrap、consumer readiness、fixture root 和资源清理仍自行编排。本阶段抽取小型共用接口，由本工具和 Current runtime reload 测试共同调用；未批量重写其他测试或共享状态接口。
