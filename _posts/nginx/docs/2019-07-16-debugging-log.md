---
title: 调试日志
category: Nginx文档
permalink: /ngx-docs/:title/
---

要开启调试日志，首先需要在配置nginx时`打开调试功能`，然后编译：

    ./configure --with-debug ...

然后在配置文件中设置error_log的级别为`debug`：

    error_log  /path/to/log  debug;

nginx的windows二进制版本总是将调试日志开启的，因此只需要设置debug的日志级别即可。

注意，**重新定义错误日志时，如过没有指定debug级别，调试日志会被屏蔽**。

下面的例子里，在server层中重新定义的日志就屏蔽了这个虚拟主机的调试日志：

    error_log  /path/to/log  debug;
    http {
        server {
            error_log  /path/to/log;
            ...

为了避免这个问题，注释这行重新定义日志的配置，或者也给日志指定debug级别：

    error_log  /path/to/log  debug;
    http {
        server {
            error_log  /path/to/log  debug;
            ...

另外，也可以只针对选定的客户端地址开启调试日志：

    error_log  /path/to/log;
    events {
        debug_connection   192.168.1.1;
        debug_connection   192.168.10.0/24;
    }
