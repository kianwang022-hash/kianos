# U6｜维护、故障定位与恢复：先保住数据和回滚能力，再开始修

系统故障最危险的反应是：

> **一上来乱改很多东西。**

改得越多：

> 越难知道到底哪里有问题。

成熟 troubleshooting 更像：

~~~text
保数据
↓
界定范围
↓
找最近变化
↓
最小复现
↓
一次改一个变量
↓
验证
↓
rollback / recover
~~~

---

## 1｜先确认影响范围

问：

- 一个 app？
- 一个 device？
- 一个 account？
- 整个 network？
- 一个 file？
- 一整块 storage？
- 所有人还是只有我？

范围越小：

> root cause space 越小。

---

## 2｜最近变化是高价值线索

包括：

- update；
- install；
- permission；
- cable；
- account；
- setting；
- new device；
- storage full；
- network change。

不是说：

> 最新变化一定是原因。

但它值得优先查。

---

## 3｜先区分“数据风险”和“功能故障”

如果：

> 设备暂时不能用，

但数据安全：

> 可以慢慢修。

如果：

> disk 有异常 / file corruption / account compromise，

先：

> 停止高风险操作，保全数据。

---

## 4｜最小复现减少噪声

例如：

- same cable, other device；
- same device, other network；
- same file, other app；
- same account, web vs app；
- one browser profile。

每个 comparison：

> 都在缩小故障层。

---

## 5｜一次只改一个变量

同时：

- 重装；
- 换 cable；
- reset settings；
- update driver；

即使问题好了：

> 也不知道为什么。

这会让下一次：

> 仍然不会修。

---

## 6｜Logs / status 信息要先看“事实”

可能包括：

- error message；
- storage health；
- sync status；
- router status；
- account security log；
- battery health；
- system log。

不要一看到：

> 一个 warning

就把它当 root cause。

需要和 failure：

> 对齐。

---

## 7｜Rollback 是系统能力

更新 / 迁移前知道：

- backup；
- previous config；
- uninstall；
- version rollback；
- restore point；
- export。

没有 rollback：

> 每次改变都更危险。

---

## 8｜Reinstall 是后期手段，不是第一步

重装可能：

> 暂时把问题清掉。

但代价：

- time；
- lost state；
- hidden data risk；
- root cause unknown。

只有当：

> 更便宜的定位已失败

或重建本身就是最快恢复方式时：

> 再做。

---

## 9｜Replace vs repair 要看 lifetime

设备 / 服务问题可以问：

- repair cost；
- downtime；
- expected remaining life；
- security support；
- new system migration；
- replacement cost。

不要因为 sunk cost：

> 无限修老设备。

---

## 10｜Maintenance 只保留高 ROI

可能包括：

- updates；
- backup check；
- dust / cooling；
- storage capacity；
- battery；
- subscription review；
- router / device support lifecycle。

不需要：

> 每月做 30 项 checklist。

---

## 11｜恢复流程最好提前写

高价值系统可以知道：

~~~text
device dead
→ replacement / loaner
→ restore data
→ restore credentials
→ validate key apps
~~~

发生事故时：

> 不用一边慌一边设计流程。

---

## 12｜U6 的 troubleshooting card

~~~text
symptom：
scope：
last known good：
recent change：
data risk：
minimal reproduction：
comparison：
error / log：
one variable to change：
rollback：
backup：
recovery path：
repair vs replace：
what evidence confirms fixed：
~~~

故障处理成熟不是：

> 会很多玄学招数。

而是：

> **每一次修复都让你更确定发生了什么，而且不会为了修功能先把数据毁掉。**
