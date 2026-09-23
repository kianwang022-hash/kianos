# U2｜设备生态、计算与连接：规格只有在真实任务里才有意义

设备比较很容易变成：

> CPU、GPU、RAM、刷新率、接口数字大战。

真正问题是：

> **哪组规格解决当前 bottleneck，而且不会制造更大的迁移和维护成本。**

---

## 1｜Compute 要按 workload 看

不同任务 bottleneck 不同：

- browser / chat → RAM / responsiveness；
- video editing → CPU / GPU / codec；
- local AI → VRAM / RAM / software stack；
- gaming → GPU / CPU / display；
- coding → CPU / RAM / storage / toolchain。

“更强 CPU”：

> 不是万能升级。

---

## 2｜Memory 决定“同时能保留多少工作状态”

RAM 不只是：

> benchmark。

当多个：

- browser tabs；
- Chat windows；
- IDE；
- documents；
- local tools；

同时打开，

memory pressure 会直接影响：

> workflow continuity。

所以 capacity 应该：

> 匹配真实并发。

---

## 3｜Storage 看容量 + speed + failure

需要区分：

- OS / apps；
- active project；
- large media；
- archive；
- backup。

一个 SSD 很快：

> 但如果它同时是唯一副本，

系统仍然很脆弱。

---

## 4｜Display 是 cognition interface

看：

- size；
- resolution；
- scaling；
- refresh；
- brightness；
- text clarity；
- viewing distance；
- multiple-window behavior。

“32 inch 4K”：

> 不自动比 27 inch 更好。

要看：

> desk distance + task + scaling。

---

## 5｜Port / cable 是真实系统的一部分

很多 friction 来自：

- wrong USB standard；
- insufficient power；
- display bandwidth；
- dock limitation；
- cable quality；
- adapter chain。

不要只看：

> 设备理论规格。

链路最弱一环：

> 决定实际体验。

---

## 6｜Ecosystem integration 可以显著降低摩擦

例如：

- clipboard；
- file transfer；
- account；
- device handoff；
- accessory reuse。

这些 convenience 有真实价值。

但也要问：

> 离开这个 ecosystem 时，我的数据和 workflow 是否能迁移。

---

## 7｜Cross-platform 不是目标本身

为了“永不 lock-in”：

> 全部用最通用、最差体验的方案

也不成熟。

更好：

- critical data portable；
- high-value convenience 接受合理 lock-in；
- export path 清楚。

---

## 8｜Upgrade 应由 constraint 触发

有意义 upgrade signal：

- memory pressure；
- render / compile time 影响工作；
- unsupported software；
- battery / reliability；
- port limitation；
- display constraint。

不是：

> 新型号发布。

---

## 9｜设备生命周期包括退役

设备退役要处理：

- data export；
- secure erase；
- account unlink；
- accessory；
- resale / recycle；
- warranty records。

“换新”：

> 不是把旧设备扔进柜子。

---

## 10｜Shared device 要有 profile 和 privacy boundary

家庭设备如果共享：

- user profile；
- browser；
- photos；
- password；
- cloud；
- payment；

需要明确：

> 哪些共享，哪些隔离。

---

## 11｜购买判断要看 total cost

包括：

- hardware；
- accessories；
- software；
- subscriptions；
- repair；
- replacement；
- energy；
- migration time。

便宜设备如果：

> 每天制造高 friction，

也可能贵。

---

## 12｜U2 的 device card

~~~text
primary task：
current bottleneck：
CPU：
GPU：
RAM：
storage：
display：
ports：
network：
software compatibility：
ecosystem benefit：
lock-in：
migration path：
maintenance：
total cost：
upgrade trigger：
~~~

设备素养成熟不是：

> 认识更多参数。

而是：

> **知道哪一个参数真的改变自己的工作。**
