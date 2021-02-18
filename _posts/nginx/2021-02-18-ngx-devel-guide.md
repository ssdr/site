---
title: Nginx开发指南
category: Nginx
---

* 目录
{:toc #markdown-toc}

# 简介

## 代码目录结构

* auto - 构建脚本
* src
  * core - 基本数据结构类型和方法：字符串，数组，日志，pool等。
  * event - 事件框架核心
    * modules - 事件通知模块：epoll，kqueue，select等。
  * http - 核心http模块和通用代码
    * modules - 其他http模块
    * v2 - http2相关
  * mail - mail相关模块
  * os - 操作系统平台相关代码
    * unix
    * win32
  * stream - stream模块

## 头文件

下面两个头文件必须包含在所有nginx文件的开头：

```
#include <ngx_config.h>
#include <ngx_core.h>
```

另外，http相关的代码应当包含如下头文件：

```
#include <ngx_http.h>
```

Mail相关的代码应当包含：

```
#include <ngx_mail.h>
```

Stream相关的代码应当包含：

```
#include <ngx_stream.h>
```

## 整数类型

为了更好的通用型目的，nginx代码提供两个整数类型：ngx_int_t和ngx_uint_t，这两个类型分别是intptr_t和uintptr_t的别名。

## 通用返回值

Nginx中大部分函数返回以下返回值：

* NGX_OK：操作成功时返回。
* NGX_ERROR：操作失败时返回。
* NGX_AGAIN：操作未完成时返回，函数后续会再次别调用。
* NGX_DECLINED：操作拒绝时返回，比如，配置中关闭了某个功能可以在功能处理函数中返回该值。注意，这不是一个错误。
* NGX_BUSY：资源不可用时返回。
* NGX_DONE：操作完成或在其他地方继续时返回。也用作表示成功的状态码。
* NGX_ABORT：函数异常退出时返回，也用作表示失败的状态码。

## 错误处理

宏ngx_errno用于返回上一次的系统错误码。在POSIX系统平台它对应errno变量，在Windows系统它对应GetLastError()调用的返回值。

宏ngx_socket_errno用于返回上一次的socket错误码。和ngx_errno宏一样，在POSIX系统平台它对应errno变量，但在Windows系统它对应WSAGetLastError()调用的返回值。

多次访问ngx_errno和ngx_socket_errno宏的值可能带来性能问题。如果一个错误值可能被使用多次，请将它保存在ngx_err_t类型的本次变量中使用。

设置错误使用ngx_set_errno(errno)和ngx_set_socket_errno(errno)两个宏。

ngx_errno和ngx_socket_errno宏的值可以传递给打印日志的函数ngx_log_error()和ngx_log_debugX()，此时，系统错误文本会添加到日志中。

下面是使用ngx_errno的一个例子：

```
ngx_int_t
ngx_my_kill(ngx_pid_t pid, ngx_log_t *log, int signo)
{
    ngx_err_t  err;

    if (kill(pid, signo) == -1) {
        err = ngx_errno;

        ngx_log_error(NGX_LOG_ALERT, log, err, "kill(%P, %d) failed", pid, signo);

        if (err == NGX_ESRCH) {
            return 2;
        }

        return 1;
    }

    return 0;
}
```

# 字符串 String

## 简介

在Nginx中使用无符号字符指针 u_char*来表示C字符串。

Nginx的字符串类型ngx_str_t的定义如下：

```
typedef struct {
    size_t      len;
    u_char     *data;
} ngx_str_t;
```

其中，len保存了字符串的长度，data保存了字符串数据。

ngx_str_t保存的字符串末尾可能包含\0也可能不包含。大部分情况下是不包含\0结尾的。

但是在某些代码中（比如，解析配置的代码），ngx_str_t表示的字符串是以\0结尾的，这么做的目的是简化字符串比较和更易于向系统调用传递字符串。

Nginx中的字符串操作在src/core/ngx_string.h中定义，其中很多是对标准C函数的简单封装，如：

* ngx_strcmp()
* ngx_strncmp()
* ngx_strstr()
* ngx_strlen()
* ngx_strchr()
* ngx_memcmp()
* ngx_memset()
* ngx_memcpy()
* ngx_memmove()

其他的字符串函数是Nginx特有的：

* ngx_memzero() - 用0填充内存
* ngx_explicit_memzero() - 和ngx_memzero()一样，但这个函数永远不会被编译器的dead-store-elimination优化所移除。该方法可用于清除敏感数据，如密码，私钥等。
* ngx_cpymem() - 和ngx_memcpy()一样，但返回最终的目的地址，因此，可用于一次串联多个字符串。
* ngx_movemem() - 和ngx_memmove()一样，但返回最终的目的地址。
* ngx_strlchr - 字符串中查找某个字符，源字符串使用首尾地址界定。

以下方法用于字符串的大小写转化和比较：

* ngx_tolower()
* ngx_toupper()
* ngx_strlow()
* ngx_strcasecmp()
* ngx_strncasecmp()

以下宏用于简化字符串初始化：

* ngx_string(text) - 从C字符串常量text中初始化ngx_str_t类型字符串
* ngx_null_string - 初始化一个ngx_str_t类型的空字符串
* ngx_str_set(str, text) - 从C字符串常量text中初始化ngx_str_t类型字符串变量str
* ngx_str_null(str) - 以空字符串初始化ngx_str_t类型字符串str

## 字符串格式化

以下格式化方式支持Nginx特有的类型：

* ngx_sprintf(buf, fmt, ...)
* ngx_snprintf(buf, max, fmt, ...)
* ngx_slprintf(buf, last, fmt, ...)
* ngx_vslprintf(buf, last, fmt, args)
* ngx_vsnprintf(buf, max, fmt, args)

这些格式化方法支持的格式化参数的完整列表在src/core/ngx_string.c文件中定义。

部分参数如下：

* %O - off_t
* %T - time_t
* %z - ssize_t
* %i - ngx_int_t
* %p - void *
* %V - ngx_str_t *
* %s - u_char *
* %*s - size_t + u_char *
**

你可以在大部分类型前面前置u使其成为无符号类型。如果要转化成16进制输出，使用X或者x。

例如：

```
u_char      buf[NGX_INT_T_LEN];
size_t      len;
ngx_uint_t  n;

/* set n here */

len = ngx_sprintf(buf, "%ui", n) — buf;
```

## 数字转换

Nginx中实现了多种数字转换方法。

以下四个函数将给定长度的字符串转换为指定类型的正整数。错误返回NGX_ERROR。

* ngx_atoi(line, n) - ngx_int_t
* ngx_atosz(line, n) - ssize_t
* ngx_atoof(line, n) - off_t
* ngx_atotm(line, n) - time_t

下面两个数字转换函数，错误也返回NGX_ERROR。

* ngx_atofp(line, n, point) - 字符串表示的浮点数转换为ngx_int_t类型正整数。结果会将小数点左移若干位，位数由point参数指定。比如，ngx_atofp("10.5", 4, 2)返回1050。
* ngx_hextoi(line, n) - 将十六进制表示的正整数转换为ngx_int_t类型正整数。

## 正则表达式

## 时间

# 容器类型

## 数组 Array

## 链表 List

## 双向链表 Queue

## 红黑树 RB-Tree

## 哈希表 Hash

## 通配符匹配


# 内存管理

## 堆栈 Heap

## 池 Pool

## 共享内存

## 日志

## 生命周期 Cycle

## 缓冲区 Buffer


# 网络

## 链接 Connection


# 事件驱动

## 事件

## I/O 事件

## 定时器事件

## 后处理事件

## 事件循环

## 进程

## 线程


# 模块

## 添加新模块

## 核心模块

## 配置指令


# HTTP

## 链接 Connction

## 请求 Request

## 配置

## 处理阶段


# 变量

## 访问已存在的变量

## 创建新变量

## 复杂值

## 请求重定向

## 子请求

## 终止请求

## 请求体

## 响应

## 响应头

## 响应头过滤处理

## 响应体

## 响应体过滤处理

## 创建过滤模块

## 缓冲区复用

## 负载均衡

## 例子


# 编程风格

## 通用规范

## 文件

## 注释

## 预处理器

## 类型

## 变量

## 函数

## 表达式

## 条件和循环

## 标签

## 调试内存问题


# 常见问题

## 写C模块

## C字符串

## 全局变量

## 手动内存管理

## 线程

## 阻塞库

## HTTP请求到外部服务
