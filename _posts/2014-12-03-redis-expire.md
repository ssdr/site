---
title: "Redis中key的过期时间问题"
description: "Redis key的过期时间问题"
category: knowledge
tags: redis
---

## redis过期时间问题

我们知道redis有一个设置key的过期时间的命令expire，当key设置了过期时间时，过期时间到达key将在内存中被删除。好了，问题来了，如果没有设置过期时间会发生什么呢？

答案是不会删除key，直到到达设置的内存最大值。

先来看看redis的相关配置

    maxmemory <bytes>

不要使用多于指定字节数的内存。当达到内存上限时，redis将根据回收策略尝试这移除key。

如果redis无法移除key，或者回收策略设置成了`noeviction`，redis会想所有占用内存的命令报错（如set，lpush等），但会正常回复只读命令（如get)。

当redis被用作LRU缓存或对一个实例做内存限制时，这个选项很有用。

WARNING:如果该选项打开的redis上挂有从库，用于主从复制的输出缓冲区大小会占用使用的内存数，因此网络故障或resync不会触发回收key循环。

简言之，如果有从库，建议将该选项设小一点，以便系统有空闲内存用于从库的输出缓存（设置了`noeviction`策略的忽略此建议）

    maxmemory-policy volatile-lru

回收策略，即redis达到maxmemory时，采用什么策略删除key。你有五个可选项：

    volatile-lru    采用LRU算法删除带有expire的key（默认）
    allkeys-lru     采用LRU算法删除任意key
    volatile-random 任意删除带有expire的key
    allkeys-random  删除任意key
    volatile-ttl    删除最接近expire的key
    noeviction      不删除，直接对写命令返回错误

    maxmemory-samples 3

LRU算法和最小ttl算法并不是精确算法（为了节省内存）。例如，默认情况下，redis会检查三个key，并选择一个最近最少使用的key做删除。
