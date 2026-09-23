# U4｜UI/UX、可用性与无障碍：截图漂亮，不代表产品好用

UI 最容易被社交媒体训练成：

> **看截图。**

但 UX 存在于：

> **连续使用过程。**

真正问题是：

- 用户能不能开始；
- 能不能理解；
- 能不能完成；
- 出错以后能不能恢复；
- 系统有没有给足反馈。

---

## 1｜从 user task 开始

设计一个页面前先问：

> 用户来这里要完成什么？

不是：

> “这个页面应该放哪些组件？”

task 清楚以后，

才能判断：

- information；
- CTA；
- flow；
- priority。

---

## 2｜System status 必须可见

用户需要知道：

- loading；
- saved；
- selected；
- submitted；
- failed；
- syncing；
- offline；
- complete。

如果系统做了事：

> 用户却不知道，

就会重复点击 / 猜测。

---

## 3｜Navigation 应该降低“我在哪”的成本

用户应该容易知道：

- current location；
- back path；
- next step；
- major sections。

如果 navigation 需要：

> 先学习设计师自己的分类逻辑，

成本太高。

---

## 4｜Error prevention 比 error message 更值钱

可以通过：

- constraints；
- sensible defaults；
- confirmation；
- preview；
- validation；
- destructive-action separation；

减少错误。

不要等用户错了：

> 再写一段聪明 error copy。

---

## 5｜Error recovery 要告诉用户下一步

弱：

> “Something went wrong.”

更有用：

- what happened；
- what remained safe；
- what user can do；
- whether retry helps；
- whether data is saved。

---

## 6｜Consistency 降低学习成本

同一个 action：

> 尽量有相似 pattern。

但一致性不是：

> 所有页面完全一样。

GOV.UK 的原则就是：

> consistent, not uniform。

---

## 7｜Accessibility 是 product quality

Apple 当前 HIG 把 accessible interface 描述为：

- intuitive；
- perceivable；
- adaptable。

W3C WCAG 2.2 提供：

> web content accessibility 的具体 success criteria。

这不是：

> compliance-only。

很多 accessibility 修复本身会改善：

> 普通用户体验。

---

## 8｜支持 text scaling 会逼设计暴露脆弱结构

如果字体放大后：

- overlap；
- truncate；
- CTA 消失；
- hierarchy 崩；

说明 layout：

> 很可能本来就过度脆弱。

所以 accessibility test：

> 也是结构 test。

---

## 9｜User research 不是“用户说什么就做什么”

用户擅长提供：

- pain；
- behavior；
- confusion；
- context；
- expectation。

但最终 solution：

> 仍然需要 design judgment。

不要把 research 变成：

> feature voting。

---

## 10｜Prototype 用来回答具体未知

一个 prototype 可以测试：

- flow；
- concept；
- hierarchy；
- interaction；
- copy；
- comprehension。

不要为了“做 prototype”：

> 做一个已经 polished 的假产品。

原型精度：

> 应匹配问题。

---

## 11｜Usability test 看行为，不只听评价

高价值观察：

- 找不到；
- hesitation；
- wrong click；
- repeated backtracking；
- misunderstanding；
- task failure。

“我觉得挺好看”：

> 不是 usability 证据。

---

## 12｜Design system 的价值是收掉重复决策

它可以规定：

- tokens；
- components；
- patterns；
- spacing；
- typography；
- states。

这样团队不用：

> 每个页面重新发明按钮。

但它不能决定：

> 这个页面到底需不需要按钮。

---

## 13｜U4 的 UX card

~~~text
primary user：
primary task：
entry point：
success state：
system status：
navigation：
major error：
prevention：
recovery：
accessibility：
text scaling：
keyboard / alternate input：
non-color cue：
prototype question：
observed user behavior：
design-system reuse：
one flow-level problem：
~~~

UI/UX 成熟不是：

> 页面越来越精致。

而是：

> **用户越来越少需要理解设计本身。**
