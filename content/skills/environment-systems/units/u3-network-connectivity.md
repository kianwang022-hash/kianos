# U3｜网络、连接与家庭服务：先定位哪一层坏了

“网不好”太粗。

网络问题可能来自：

- ISP；
- modem / gateway；
- router；
- wired network；
- Wi-Fi；
- device；
- DNS；
- application service。

如果不分层：

> 很容易乱换设备。

---

## 1｜Bandwidth 是吞吐量

适合描述：

> 同时能传多少数据。

高 bandwidth 对：

- large download；
- cloud sync；
- multiple streams；

重要。

但不代表：

> interaction 一定快。

---

## 2｜Latency 是响应速度

Gaming、remote desktop、voice/video：

> 对 latency 更敏感。

1000 Mbps + 高 latency：

> 仍然可能体验差。

---

## 3｜Packet loss / jitter 会破坏实时体验

即使 speed test 看起来高：

- packet loss；
- unstable latency；

也会让：

- calls；
- games；
- streaming；

出现问题。

---

## 4｜Wi-Fi coverage 是空间问题

影响：

- wall；
- floor；
- distance；
- interference；
- router placement；
- band；
- client device。

所以 router 放置：

> 可能比换套餐更重要。

---

## 5｜有条件时关键固定设备优先 wired

例如：

- desktop；
- console；
- NAS；
- media box；

wired connection 可以：

- reduce interference；
- increase stability；
- simplify diagnosis。

不需要：

> 全屋所有设备都拉线。

---

## 6｜Router 是 security boundary

要保持：

- non-default admin credential；
- supported firmware；
- sensible security settings；
- remote management only if truly needed。

具体 Wi-Fi standard / encryption：

> current-first。

---

## 7｜IoT 要考虑权限和生命周期

Smart camera、speaker、light、appliance：

可能拥有：

- microphone；
- camera；
- cloud account；
- network access。

购买前问：

- vendor support；
- updates；
- local control；
- cloud dependency；
- account security；
- failure behavior。

---

## 8｜Guest / untrusted device 可以隔离

访客和不可信 IoT：

> 不一定需要和核心电脑 / storage 在同一 trust domain。

是否值得 segmentation：

> 看 stakes 和 complexity。

家庭环境不要为了“专业”：

> 强行做企业网络。

---

## 9｜DNS / app outage 不要误判成本地网络坏

如果：

- 只有一个网站不行；
- 其他设备正常；
- speed normal；

可能是：

> service side。

诊断先做最小对照：

- another device；
- another service；
- wired vs Wi-Fi；
- local vs internet。

---

## 10｜网络架构应该有一张简单图

至少知道：

~~~text
ISP
→ gateway
→ router
→ switch / AP
→ key devices
~~~

这样故障时：

> 不需要从零猜。

---

## 11｜网络升级看真实 use case

更高 bandwidth 值不值：

看：

- simultaneous users；
- cloud workload；
- streaming；
- upload needs；
- remote work；
- local transfer。

不是：

> 运营商最大套餐一定最好。

---

## 12｜U3 的 network card

~~~text
ISP：
gateway：
router：
wired：
Wi-Fi AP：
coverage dead zone：
bandwidth：
latency：
packet loss / jitter：
critical devices：
IoT / guest：
firmware：
service dependency：
problem layer：
next diagnostic comparison：
upgrade trigger：
~~~

网络素养成熟不是：

> 会配置复杂 VLAN。

而是：

> **网络出问题时知道先查哪一层，正常时几乎不用想它。**
