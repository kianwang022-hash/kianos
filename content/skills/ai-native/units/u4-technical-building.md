# U4｜AI 原生技术构建：不必手写一切，但必须能控制真实系统

AI 可以越来越多地：

- 写代码；
- 改代码；
- 生成配置；
- 接 API；
- 修 bug；
- 写测试；
- 部署。

这不意味着：

> **技术能力不再重要。**

它改变的是：

> **什么技术能力最值得自己拥有。**

AI-native builder 不必追求：

> 每一行都亲手写。

但必须逐渐拥有：

> **系统控制能力。**

---

## 1｜技术控制的最低表面

至少要逐渐熟悉：

~~~text
文件 / 目录
terminal
Git
diff
代码结构
依赖
环境变量
API
JSON / 常见数据格式
日志
测试
构建
部署
~~~

不是为了背命令。

而是为了：

> AI 做错时，你知道现实里去哪里看。

---

## 2｜先会看，再追求会写

AI 时代一个高 ROI 顺序是：

~~~text
能读结构
↓
能看 diff
↓
能运行
↓
能看错误
↓
能验证
↓
能做小修改
↓
需要时再深入手写
~~~

如果你看不懂：

> AI 改了哪些文件，

那就很难判断：

> 它是不是越界了。

---

## 3｜Git 是控制面，不只是备份

Git 的核心价值不是：

> 上传代码。

而是：

- 看改了什么；
- 知道什么时候改的；
- 回到旧版本；
- 隔离实验；
- review；
- 合并；
- 对比。

AI 会让改代码的速度极快。

越快：

> 越需要 version control。

---

## 4｜每次改动尽量小而可验证

一个坏模式：

~~~text
让 AI 一次改 25 个文件
↓
最后跑不起来
↓
不知道哪一步坏了
~~~

更好：

~~~text
确认 owner
↓
最小改动
↓
运行 / test
↓
看 diff
↓
再推进
~~~

不是所有任务都必须一行一行改。

而是：

> **保持失败可定位。**

---

## 5｜Terminal 是现实检查接口

很多关键真相不会出现在聊天里。

而是在：

- build output；
- test result；
- process status；
- git status；
- logs；
- file system；
- dependency manager。

所以 terminal 能力的价值是：

> **把模型的语言世界接回真实运行世界。**

你不必手写复杂 shell。

但应该知道：

> 现在该检查什么真值。

---

## 6｜API 要理解 5 个基本问题

使用任何 API 时至少要知道：

~~~text
我在请求什么 endpoint / action？
输入 schema 是什么？
身份 / permission 是什么？
返回什么？
失败怎么表现？
~~~

再加：

- rate limit；
- timeout；
- retry；
- pagination；
- idempotency；

就足以覆盖大量真实问题。

不需要一开始学完整后端工程。

---

## 7｜环境变量和 secret 不是普通文本

API key、token、password 等：

> 不应该被随便写进代码、prompt、日志或 Git。

AI 能看到什么：

> 也应该被当成权限设计的一部分。

基本习惯：

- secret 与代码分开；
- 不把 secret commit；
- 限制最小权限；
- 泄露后及时 rotate；
- log 中避免打印敏感值。

---

## 8｜Debug 不是继续叫 AI 猜

真正 debug 更像：

~~~text
现象是什么
↓
稳定复现吗
↓
最小失败位置在哪
↓
日志 / error / test 说什么
↓
最近改了什么
↓
哪个假设可以被证伪
↓
做最小修复
↓
重新验证
~~~

AI 可以帮助提出假设。

但：

> **真正的运行证据应该负责淘汰错误假设，而不是让模型靠语言把一个解释说圆。**

日志、测试和运行结果本身也可能不完整，所以复杂问题常常需要把多条证据放在一起，而不是迷信某一个 signal。

---

## 9｜Deployment 是另一层现实

本地能跑：

> 不等于线上能跑。

部署会引入：

- 环境差异；
- 网络；
- secret；
- permission；
- data；
- concurrency；
- observability；
- rollback。

所以“AI 帮我写完”以后还要问：

> **真正运行环境发生了什么？**

---

## 10｜什么时候值得深入学手写技术

不是所有 manual skill 都应该深学。

更值得深入的情况：

- 你反复 debug 同一类问题；
- AI 经常在这里误导你；
- 该层决定架构；
- 出错成本高；
- 你无法验证 AI 输出；
- 你需要性能 / 安全 /可维护性判断；
- 这项能力长期会复利。

不值得深挖的情况：

> 低频、低风险、很容易验证、AI 可稳定完成。

---

## 11｜AI-native builder 的最小构建回路

~~~text
inspect
↓
understand owner
↓
plan smallest change
↓
AI / human modify
↓
run
↓
test
↓
inspect diff
↓
fix
↓
commit / ship
↓
observe
~~~

如果 AI 越来越强：

> 这个回路不会消失。

它只会让：

> **生成步骤变得更便宜。**

控制、验证和判断反而更重要。
