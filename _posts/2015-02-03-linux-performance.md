---
title: "Linux性能调优工具"
description: ""
category: tools
tags: [linux, performance, tools]
---

* 目录
{:toc #markdown-toc}

## 分析工具集合

    strace
    netstat
    perf
    dtrace
    stap
    iotop
    blktrace
    top
    pidstat
    mpstat
    dstat
    vmstat
    ping
    tcpdump
    ip
    nicstat
    slabtop
    free
    sar
    /proc

## 基本工具
- uptime: show load averages(1min, 5mins, 15mins), no more than cpu count

- top: system-wide and per-process summaries

- mpstat: check for hot threads, unbalanced workoads

    mpstat -P ALL 1

- iostat: 磁盘IO统计

    iostat -xkdz 1

- vmstat: 虚拟内存使用统计

    vmstat 1

- free: 内存使用情况统计(KB)

- ping: 测网络时延

- dstat: 比vmstat更友好，彩色

## 中级工具
- sar: system activity reporter

    pageing -B; block device -d; run queue -q

- netstat: various network protocol statistics using -s

- pidstat: very useful process breakdowns

    pidstat -d l disk io

- strace: system call tracer

    strace -tttT -p pid

> "high application latency often caused by *resource io*, and most resource io is performed by *syscalls*"

- tcpdump: 嗅探网络包，dump到文件

        tcpdump -i eth4 -w /tmp/out.tcpdump
        tcpdump -nr /tmp/out.tcpdump

- blktrace: tracing块设备IO事件

- iotop: 进程的磁盘IO

    iotop -bod5

- slabtop: kernel slab allocator usage top

    slabtop -sc        # shows where kerrnel momory is consumed

- sysctl: 系统设置

- /proc: read statistic sources directly

## 高级工具
- perf: performance counters

    perf stat gzip file1

- dtrace: programmable, real-time, dynamic and static tracing

        dtrace -n 'provider:module:function:name /predicate/ {action}'
                    probe description               filter

- systemtap: static and dynamic tracing, probes, tapsets, scripts,...


