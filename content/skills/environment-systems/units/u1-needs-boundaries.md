# U1｜需求、环境与系统边界：先定义任务，再决定搭什么

个人系统最常见的浪费是：

> **先买设备，再找用途。**

成熟顺序应该反过来：

~~~text
真实任务
↓
当前摩擦
↓
失败代价
↓
最低必要系统
↓
维护成本
↓
是否值得升级
~~~

---

## 1｜先列真实任务

例如：

- deep work；
- study；
- video call；
- coding；
- gaming；
- media；
- fitness；
- family storage；
- travel；
- photo / video；
- AI workload。

每个任务需要的：

> compute / display / network / storage / space

都不同。

---

## 2｜把“想要”分成 problem 和 preference

Problem：

> 8G 内存导致多窗口实际卡顿。

Preference：

> 想要更大的屏幕。

两者都可以合理。

但 ROI 不同。

---

## 3｜先看最贵 failure

问：

- 文件丢失；
-账号失守；
-电脑坏；
-网络断；
-电源问题；
-服务停；
-硬盘坏；

哪个真正伤害最大。

优先保护：

> **高后果 failure。**

---

## 4｜系统复杂度必须由价值买单

一个 NAS、VLAN、automation、homelab：

> 都可以很有趣。

但如果：

- setup 花很多时间；
-经常维护；
- 没有真实需求；

就变成：

> hobby infrastructure。

这不一定坏。

但不要误认成：

> 生产力必需品。

---

## 5｜Buy / build / service 三种 owner

一个需求可以：

### Buy

直接买成熟产品。

### Build

自己做。

### Service

外包给专业服务。

默认优先：

> 最低维护成本的成熟解。

除非 build 本身：

> 是学习 / hobby / strategic control。

---

## 6｜单点故障要和后果匹配

如果只有一个：

- charging cable；
- monitor；
- entertainment console；

坏了不严重。

不需要全冗余。

如果只有一个：

- password recovery；
- important drive；
- internet for critical work；

需要更强 resilience。

---

## 7｜系统 owner 要清楚

家里重要系统最好知道：

- 谁知道账号；
- 谁能恢复；
- 设备在哪；
- warranty；
- subscription；
- service contact。

尤其多人共享：

> 隐性 owner 很危险。

---

## 8｜Maintenance budget 也是约束

任何系统都有：

- update；
- cleaning；
- charging；
- renew；
- cable；
- compatibility；
- troubleshooting。

购买时只看：

> acquisition cost

会低估真实成本。

---

## 9｜环境设计要考虑“切换成本”

例如：

- study → video meeting；
- PC → console；
- laptop → external monitor；
- work → fitness。

如果每次切换需要：

> 十分钟插线 / 搬东西，

系统会改变行为。

---

## 10｜高频摩擦值得优先优化

每天发生 5 次的小摩擦：

> 累积很大。

一年一次的小摩擦：

> 不一定值得自动化。

所以优化 priority 可以看：

~~~text
frequency × friction × consequence
~~~

---

## 11｜不要把未来想象需求当 current requirement

“以后可能跑本地大模型”：

> 可以影响 upgrade path。

但不等于今天就必须：

> 买最高配置。

把：

- current；
- likely near-term；
- speculative future；

分开。

---

## 12｜U1 的 system-demand card

~~~text
real tasks：
current friction：
frequency：
largest failure：
maintenance cost：
current must-have：
nice-to-have：
future option：
buy / build / service：
single point of failure：
owner：
upgrade trigger：
what should remain simple：
~~~

系统素养成熟不是：

> 什么都自己懂。

而是：

> **知道哪里需要控制，哪里应该买成熟解，哪里根本不用优化。**
