---
title: "作为程序猿，你需要知道的"
category: knowledge
date: 2019-07-22
---

* 目录
{:toc #markdown-toc}

计算机行业技术繁杂，并且更新换代频繁，但总有一些一成不变的东西。

## 语言C/C++
* 空类
* C和C++的区别
* 引用和指针
* 常量指针和指针常量
* C和C++函数互调/extern "C"的用处
* 源代码到可执行程序的流程
* 简述几种内存分配方式/内存模型
* 聚合和组合
* 构造函数/析构函数(虚函数)
* new/delete和malloc/free区别和联系
* 虚函数/多态实现原理
* 如何定义一个只能在栈上或者堆上生成对象的类？

## Linux操作系统
### 基础
* 常用命令

    find，grep，awk，sed，lsof，ps，netstat

* vim，shell
* gcc/gdb/makefile
* 版本管理git/svn

### 多路复用
* 同步/异步
* 阻塞/非阻塞
* select/epoll
* 带超时机制的connect函数


## 协议
### TCP
* 协议栈
* 连接建立/数据传输/连接断开
* TCP状态转换：TIME_WAIT/CLOSE_WAIT


### HTTP
* 响应码
* 206，301，302，304理解
* chunked

### HTTPs
* cypher suits: like ECDHE-ECDSA-AES256-GCM-SHA384
    - key establishment(dh or rsa)
    - authentication(certificate type)
    - confidentiality(a symmetric cipher)
    - integrity(a hash function)

### HTTP2

### QUIC

## 设计模式
* 单例模式实现/线程安全/垃圾回收
* reactor模式
* bridge模式
* 工厂模式

## 视频
### h264/h265
### flv
### mp4
### hls

## 开源
* nginx/openresty

    内部数据结构的实现细节
    启动过程
    事件模型
    内存池管理
    配置解析流程

* ngx-lua-module
* lua/luajit
* libevent/epoll
* redis
* memcached
* twemproxy
* atlas/mysql-proxy
* webbench, ab, axel, wrk
* protobuf
* thrift

## 算法与数据结构
* 数组
* 链表
* 字符串
* 栈
* 队列
* 二叉树
* 哈希表
* 搜索
* 排序

* 循环/递归
* 动态规划

### 练练手
* String类声明
* char* strcpy(const char* src, char* dst)实现/memcpy实现
* 不使用判断语句获取两个数中较大的一个
* 如何判断一个链表是否有环，环的入口
* 如何判断两个链表是否重合，找到重合点
* 最长递增子序列(LIS)
* 最长增长子串
* 最长不重复子序列
* 最长不重复子串
* 子数组最大和
* 子数组最大乘机
* 最大值栈/最大值队列
* 最大频率栈
* LRU


---
*创建于2014.12.25/更新于2016.5.16/更新于2019.7.22*

