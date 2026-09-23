# U4｜文件、存储、备份与数字记忆：重要文件不是“存在某处”就安全

数字资产最危险的错觉之一：

> **文件在云盘里，所以有备份。**

真正要分开：

- storage；
- sync；
- backup；
- archive；
- recovery。

它们解决不同问题。

---

## 1｜先定义 owner

每类重要文件应该知道：

- primary location；
- owner；
- backup；
- retention；
- sharing；
- delete rule。

如果一个文件：

> 到处都有副本，

反而可能没人知道：

> 哪个是真正版本。

---

## 2｜文件结构的目标是“找得到”

好结构通常满足：

- ownership obvious；
- names stable；
- hierarchy not too deep；
- search works；
- archive separated from active work。

不要追求：

> 完美分类学。

---

## 3｜命名规则应该可持续

有价值的元素可能包括：

- date；
- project；
- version；
- status；
- subject。

例如：

> 2026-09-23_project_decision-note.md

比：

> final_final_v2_new.md

更可靠。

---

## 4｜Sync 解决“多个设备保持一致”

同步适合：

- active documents；
- cross-device work；
- collaboration。

但如果误删一个文件：

> 删除可能同步到所有设备。

所以 sync：

> 不是 backup。

---

## 5｜Backup 解决“坏状态以后回去”

备份应该能应对：

- accidental delete；
- device failure；
- corruption；
- ransomware；
- account / service issue；
- bad edit。

因此需要：

> independent recoverable copy。

---

## 6｜多个 failure domain 比多个同位置副本更有用

三个硬盘：

> 都放在同一个包里，

面对：

- fire；
- theft；
- water damage；

并不是真正独立。

Library of Congress 的个人数字保存建议也强调：

> 多个介质 / 不同地点。

---

## 7｜Backup schedule 跟资产变化速度匹配

每天都在变的工作文件：

> 需要更高频保护。

多年不变的 archive：

> 可以低频检查。

不要所有数据：

> 一个 cadence。

---

## 8｜Restore test 是 backup 的最终证据

定期抽一个：

- file；
- folder；
- device state；

真正恢复。

检查：

- file opens；
- version correct；
- permission works；
- key metadata exists。

Backup dashboard 绿色：

> 只证明流程报告成功。

---

## 9｜重要格式要考虑长期可读性

长期资料优先考虑：

- common / documented formats；
- exportability；
- no unnecessary DRM；
- source + usable derivative when needed。

某个 app 私有格式：

> 如果 app 消失，

资产可能被锁住。

---

## 10｜Archive 和 active files 分开

Active：

> 经常改。

Archive：

> 已完成，需要长期保存。

两者混在一起：

- search clutter；
- accidental edits；
- sync load；

都会增加。

---

## 11｜Photos / media 也需要 selection

全部保存：

> 不等于保存得好。

长期可以做：

- select；
- metadata；
- album / event；
- original retention；
- redundant copy。

数字记忆也需要：

> curation。

---

## 12｜U4 的 data card

~~~text
critical data：
primary location：
sync：
backup：
independent copy：
offsite / separate location：
version history：
restore test：
archive：
file format：
export path：
owner：
retention：
last recovery proof：
~~~

数字资产管理成熟不是：

> 存储越来越多。

而是：

> **真正重要的东西始终找得到、拿得回、打不开风险可控。**
