---
title: ngx_http_core_module模块
category: Nginx文档
permalink: /ngx-docs/:title/
---

* 目录
{:toc #markdown-toc}

# listen指令

```shell
Syntax:     listen address[:port] [default_server] [ssl] [http2 | spdy] [proxy_protocol]
                  [setfib=number] [fastopen=number] [backlog=number] [rcvbuf=size] [sndbuf=size]
                  [accept_filter=filter] [deferred] [bind] [ipv6only=on|off] [reuseport]
                  [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]];
            listen port [default_server] [ssl] [http2 | spdy] [proxy_protocol] [setfib=number]
                  [fastopen=number] [backlog=number] [rcvbuf=size] [sndbuf=size] [accept_filter=filter]
                  [deferred] [bind] [ipv6only=on|off] [reuseport] [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]];
            listen unix:path [default_server] [ssl] [http2 | spdy] [proxy_protocol]
                  [backlog=number] [rcvbuf=size] [sndbuf=size] [accept_filter=filter] [deferred] [bind]
                  [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]];
Default:    listen *:80 | *:8000;
Context:    server
```

## address[:port]
设置监听地址和端口或者Unix Domain Socket的文件路径，用于服务器接收请求。
可以同时设定地址和端口，也可以只设定地址或只设定端口。地址也可以是域名，比如：

```shell
listen 127.0.0.1:8000;
listen 127.0.0.1;
listen 8000;
listen *:8000;
listen localhost:8000;
```

IPV6地址在中括号中指定：

```shell
listen [::]:8000;
listen [::1];
```

指定Unix Doamin Socket以*unix:*开头：

```shell
listen unix:/var/run/nginx.sock;
```

如果只指定了地址，端口会默认使用80。如果没有配置listen指令，端口会使用80，如果80不可用则使用8000。

## default_server
指定默认主机，如果不指定，第一个会作为默认主机。

## ssl
指示所有经过该端口接收的请求应该以SSL模式工作。

## http2
配置端口接收HTTP2连接。一般情况下，应该同时开启ssl选项，但Nginx也可以配置成不适用SSL接收HTTP2连接。

## spdy
配置端口接收SPDY连接。一般情况下，应该同时开启ssl选项，但Nginx也可以配置成不适用SSL接收SPDY连接。

## proxy_protocol
指示所有经过该端口接收的请求都适用PROXY协议。

## socket相关选项
listen指令还提供了一些和socket系统调用相关的配置选项。这些配置选项可以再任何listen指令中指定，但每个address:port对只能指定一次。

### setfib=number
当前仅FreeBSD有效。

### fastopen=number
为监听的socket开启TCP Fast Open功能，并指定尚未完成三次握手的连接队列的最大长度。

### backlog=number
指定listen()调用的backlog参数，以限制pending连接队列的最大长度。
默认情况下，FreeBSD，DragonBSD和MacOS系统backlog设置为-1，其他平台设置为511。

### rcvbuf/sndbuf=number
为监听socket设置接收缓冲区大小和发送缓冲区大小。

### accept_filter=filter
仅FreeBSD和NetBSD 5.0+有效。

### deferred
在Linux系统上指示使用deferred accept()（TCP_DEFER_ACCEPT的socket选项）。

### bind
针对给定的address:port对单独执行bind()调用。如果存在不同的address但相同port的多个listen指令，并且有一个listen指令监听了指定端口的所有地址(*:port)，此时nginx只会对*:port执行bind()。
值得注意的是，此时getsockname()系统调用可用于确定接收连接的address。如果给定的address:port对指定了setfib, backlog, rcvbuf, sndbuf, accept_filter, deferred, ipv6only 或 so_keepalive 参数，那么始终会单独执行bind()。

### ipv6only=on|off
该参数（通过IPV6_V6ONLY socket选项）用于决定一个监听了通配符(::)地址的IPv6 socket是仅接收IPv6连接还是IPv6和IPv4连接都接收。
该选项默认开启。仅在启动时设置一次。

### reuseport
该参数指示为每个worker进程创建单独的监听socket，允许内核在worker进程间分配进入的连接。
该参数当前仅在linux 3.9+，DragonFly BSD和FreeBSD 12+有效。

### so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]
该参数用于为监听socket设定"TCP keepalive"行为。如果没有设置该选项，将应用操作系统设置。
如果设置为"on"，socket将开启SO_KEEPALIVE选项。如果设置为"off"，会关闭SO_KEEPALIVE选项。
有些操作系统支持为每个socket设定TCP keepalive参数，这些参数包括TCP_KEEPIDLE, TCP_KEEPINTVL和 TCP_KEEPCNT。
在这些操作系统（如linux 2.4+）中可以使用keepidle, keepintvl和 keepcnt配置参数。
可以不设置一个或两个参数，此时使用操作系统设置作为对应的参数设置。例如：

    so_keepalive=30m::10

此时，会设置空闲超时时间（TCP_KEEPIDLE）30分钟，探测时间间隔（TCP_KEEPINTVL）则使用系统默认值，探测次数（TCP_KEEPCNT）设置为10次。

## 例子

    listen 127.0.0.1 default_server accept_filter=dataready backlog=1024;

---
*[Nginx listen](http://nginx.org/en/docs/http/ngx_http_core_module.html#listen)*




