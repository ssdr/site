---
layout: default
title: "Libevent文档"
description: "libevent documentation"
category: manual
tags: [libevent, 网络, 高性能, 事件触发]
---

## 简介
libevent是用于开发高可用网络服务器的事件通知库。当特定事件发生于文件描述符上或者事件超时以后，libevent的API提供了一种执行回调函数的机制。而且，libevent支持信号回调或超时回调。
libevent用于替代事件驱动的网络服务器中的事件循环。应用程序只需调用`event_dispatch()`，然后动态添加或移除事件，而不需要改变事件循环。
当前，libevent支持/dev/poll，kqueue(2)，select(2)，poll(2)，epoll(4)。此外，它也支持实时信号。内部事件机制与暴露在外的事件API完全独立，libevent的简单更新就可以提供新的功能，而不需要重新设计应用程序。因此，libevent可以用于开发可抑制程序，提供了一种独立于操作系统的高可扩展事件通知机制。libevent也可用于多线程程序中。libevent可以在Linux，*BSD，Mac OS X，Solaris和Windows上编译。
## 标准使用
任何使用libevent的程序都必须包含`<event.h>`头文件，编译时向linker传递`-levent`参数。在使用库中的任何函数之前，必须调用`event_init()`或者`event_base_new()`做一次初始化。
## 事件通知
对于任何一个你想监控的文件描述符，你必须声明一个事件结构体，并调用`event_set()`初始化结构体成员，通过调用`event_add()`将结构体添加到监控事件列表，以便设置通知。事件结构体必须分配在`堆`上，最后，调用`event_dispatch()`启动事件循环，开始事件调度。
## I/O缓存
libevent对事件回调做了回调，叫作一个缓存事件。一个缓存事件提供了输入输出缓冲区。缓存事件的用户不需要直接处理IO请求，而是在输入缓冲区里面读取，写入输出缓冲区。
一旦通过`bufferevent_new()`初始化，bufferevent结构就可以通过`bufferevent_enable()`和`bufferevent_disable()`反复使用。不需要直接对socket进行读写操作，你需要调用`bufferevent_read()`和`bufferevent_write()`。
当事件可读时，缓存事件会在试图在文件描述符上产生读操作，然后调用读回调函数。当输出缓冲区大小小于特定大小（默认为0）时，写回调被执行。
## 定时器
libevent也可用于产生定时器，定时器用于定时后执行回调函数。`evtimer_set()`准备一个用于定时器的事件结构体。`evtimer_add()`启动定时器，`evtimer_del()`禁用定时器。
## 超时器
除了简单的定时器，libevent还可以给文件描述符指定一个超时事件，这样尽管文件描述上没有活动产生，但超时时间到达，同样会触发事件。`timeout_set()`准备一个用于超时器的事件结构体。一旦初始化，事件必须使用`timeout_add()`激活，使用`timeout_del()`取消。
## 异步DNS解析
libevent提供了一个异步DNS解析器用于替代标准的DNS解析功能。该功能可以通过包含`<evdns.h>`导入你的应用程序。使用任何函数之前，你必须调用`evdns_init()`初始化库。要将域名解析成ip地址，可以调用`evdns_resolve_ipv4()`。要反向查询，可以调用`evdns_resolve_reverse()`。为了避免阻塞，所有这些函数都使用回调。
## 事件驱动的HTTP服务器
libevent提供了一个非常简单的事件驱动HTTP服务器，可以很容易地嵌入到应用程序中，用于处理HTTP请求。
要使用该功能，需要添加头文件`<evhttp.h>`到你的应用程序中。通过调用`evhttp_new()`常见服务器，`evhttp_bind_socket()`用于绑定监听的地址和端口号。然后你可以注册一个或多个回调函数用于处理用户请求。通过`evhttp_set_cb()`可以对每个URI指定回调函数。回调函数还可以通过`evhttp_set_gencb()`注册，如果没有对指定URI绑定其他回调，该毁掉会被调用。
## RPC框架
libevent提供了一个用于创建客户端服务器RPC的框架。

---
*本文翻译自：[libevent Documentation](http://www.monkey.org/~provos/libevent/doxygen-2.0.1/index.html)*
