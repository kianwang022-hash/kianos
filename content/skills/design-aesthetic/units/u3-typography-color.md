# U3｜字体、排版、色彩与可读性：先让信息读得懂，再谈风格

排版最容易被误解成：

> **选字体。**

但真正 typography system 还包括：

- size；
- weight；
- line height；
- line length；
- spacing；
- hierarchy；
- alignment；
- contrast；
- responsive behavior。

字体只是其中一部分。

---

## 1｜正文第一目标是 legibility

Apple 当前 HIG 仍强调：

- readable size；
- sufficient weight；
- appropriate contrast；
- adaptable text sizes。

如果一个字体很“有个性”：

> 但小字号下难读，

它就不适合作为主要正文。

---

## 2｜字体家族（typeface）数量越多，层级越容易失控

一个设计不需要：

> 每个层级都不同字体。

通常更稳的是：

- limited typefaces；
- clear weight / size hierarchy；
- repeatable styles。

太多字体：

> 会让每个区块都像不同系统。

---

## 3｜Type scale 要建立“关系”

不是：

> 标题 36、正文 16

就结束。

要看：

- H1 vs H2 差异；
- title vs metadata；
- body vs caption；
- CTA vs body；
- mobile scaling。

真正层级应该：

> 一眼可区分。

---

## 4｜Line height 影响阅读节奏

行距过紧：

> 眼睛容易串行。

过松：

> 段落会碎。

合适行距取决于：

- typeface；
- size；
- line length；
- density；
- language。

没有一个万能数字。

---

## 5｜Line length 太长会提高追踪成本

长段正文如果一行过长：

> 眼睛回到下一行开头更难。

太短：

> 又会频繁换行。

所以内容型设计要：

> 给正文合理阅读宽度。

---

## 6｜Weight 不只是“更粗 = 更重要”

如果所有标题都 bold：

> hierarchy 仍然不清楚。

Weight 要和：

- size；
- color；
- spacing；
- position；

组合。

---

## 7｜Color role 要先于 palette

先定义颜色角色：

- background；
- surface；
- text；
- secondary text；
- accent；
- success；
- warning；
- error；
- selected；
- disabled。

然后再选具体 hue。

这样系统：

> 比“先找一套漂亮 palette”更稳。

---

## 8｜对比度是可读性的硬约束之一

W3C WCAG 2.2 对普通文本有明确 contrast 规则。

不需要把每个设计都只做成：

> 黑白。

但要接受：

> **低对比如果损害阅读，就不是高级感。**

---

## 9｜颜色不要成为唯一 signal

如果：

> 红 = 错误，绿 = 正确

但没有：

- icon；
- text；
- position / shape；

部分用户可能无法区分。

关键状态最好：

> 多通道表达。

---

## 10｜品牌色应该有“稀缺性”

Apple 当前 branding guidance 也提醒：

> brand color 过度使用会削弱其影响。

所以 accent color：

> 越重要越不应该到处都是。

品牌识别还可以来自：

- type；
- imagery；
- tone；
- spacing；
- motion；
- shape。

---

## 11｜Color emotion 不是普遍真理

“蓝色 = 信任”
“红色 = 激情”

这类 rule：

> 太粗。

颜色意义会受：

- culture；
- category；
- context；
- saturation；
- surrounding colors；
- brand history；

影响。

所以 color psychology：

> 只能当 hypothesis。

---

## 12｜U3 的 type / color card

~~~text
primary typeface：
body legibility：
type scale：
weight hierarchy：
line height：
line length：
paragraph spacing：
text/background contrast：
color roles：
critical states：
non-color cues：
brand accent：
too many typefaces?：
too many colors?：
largest readability risk：
~~~

排版和色彩成熟不是：

> 让人注意到字体和颜色。

而是：

> **读者几乎不需要意识到它们，就已经顺利读懂了。**
