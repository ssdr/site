---
title: "time_wait和close_wait"
category: knowledge
tags: tcp
---

### TCP的11个状态

 - CLOSED
 - LISTEN
 - SYN_SENT
 - SYN_RECV
 - ESTABLISHED
 - CLOSE_WAIT
 - LAST_ACK
 - FIN_WAIT1
 - FIN_WAIT2
 - CLOSING
 - TIME_WAIT

MSL: Maximum Segment Lifetime, the maximum time a segment can live in the network before being discarded.

 The end that performs the `active close` goes through the `TIME_WAIT` state; while the end performs the `passive close` enters the `CLOSE_WAIT` state. Note that either end (the server or the client) can perform the active close!

### 详细说明
1. TIME_WAIT
主动关闭端发送FIN后进入FIN_WAIT1状态，之后受到对端ACK进入FIN_WAIT2状态；之后收到对端发送的FIN请求并对该FIN分节`ACK`，即进入TIME_WAIT状态。
TIME_WAIT的持续时间是2MSL，大概是1-4分钟。
TIME_WAIT存在的意义？
最后主动关闭端发送的ACK可能在网络中丢失，于是对端会重发FIN分节。而TCP维持了连接信息，会重发丢失的ACK而不是发送RST分节。
另外一个原因是为了让网络上重复的分节过期失效，防止破坏后面的连接。

2. CLOSE_WAIT
当一端被动接受到FIN分节发送ACK后即进入CLOSE_WAIT状态。
CLOSE_WAIT状态是为了等待应用程序关闭socket。
如果连接长时间处于CLOSE_WAIT状态，说明你的程序有问题。事实上，CLOSE_WAIT状态可以长期存在，直至你显示地关闭socket。使用完后关闭socket释放连接资源是应用程序的责任。

### 结论
大部分情况下，我们不需要关系TIME_WAIT状态，但是需要小心CLOSE_WAIT状态。

---
*参考文章：[www.zhuzhaoyuan.com](http://blog.zhuzhaoyuan.com/2009/03/a-word-on-time_wait-and-close_wait/)*
