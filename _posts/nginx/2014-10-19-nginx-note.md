---
title: "Nginx命令"
description: "Nginx相关"
category: Nginx
tags: nginx
---

## nginx源码
### 目录结构
```
.
├── auto            自动检测系统环境以及编译相关的脚本
│   ├── cc          关于编译器相关的编译选项的检测脚本
│   ├── lib         nginx编译所需要的一些库的检测脚本
│   ├── os          与平台相关的一些系统参数与系统调用相关的检测
│   └── types       与数据类型相关的一些辅助脚本
├── conf            存放默认配置文件，在make install后，会拷贝到安装目录中去
├── contrib         存放一些实用工具，如geo配置生成工具（geo2nginx.pl）
├── html            存放默认的网页文件，在make install后，会拷贝到安装目录中去
├── man             nginx的man手册
└── src             存放nginx的源代码
    ├── core        nginx的核心源代码，包括常用数据结构的定义，以及nginx初始化运行的核心代码如main函数
    ├── event       对系统事件处理机制的封装，以及定时器的实现相关代码
    │   └── modules 不同事件处理方式的模块化，如select、poll、epoll、kqueue等
    ├── http        nginx作为http服务器相关的代码
    │   └── modules 包含http的各种功能模块
    ├── mail        nginx作为邮件代理服务器相关的代码
    ├── misc        一些辅助代码，测试c++头的兼容性，以及对google_perftools的支持
    └── os          主要是对各种不同体系统结构所提供的系统函数的封装，对外提供统一的系统调用接口
```
### auto
`auto/options`的目的主要是处理用户选项，并由选项生成一些全局变量的值，这些值在其它文件中会用到。该文件也会输出configure的帮助信息。   

`auto/init`该文件的目的在于初始化一些临时文件的路径，检查echo的兼容性，并创建Makefile。   

`auto/sources`该文件的主要作用是定义不同功能或系统所需要的文件的变量。根据功能，分为CORE/REGEX/EVENT/UNIX/FREEBSD/HTTP等。   

每一个功能将会由四个变量组成   
`_MODULES`表示此功能相关的模块，最终会输出到`ngx_modules.c`文件中，即动态生成需要编译到nginx中的模块；   
`INCS`表示此功能依赖的源码目录，查找头文件的时候会用到，在编译选项中，会出现在'-I'中；   
`DEPS`显示指明在Makefile中需要依赖的文件名，即编译时，需要检查这些文件的更新时间；   
`SRCS`表示需要此功能编译需要的源文件。

## nginx的命令行控制
### 启动时另行指定配置文件
    ./nginx -c nginx.conf

### 启动时另行指定安装目录
    ./nginx -p /usr/local/nginx/

### 测试配置信息是否有错误
    ./nginx -t

### 显示nginx版本信息
    ./nginx -v

### 显示编译阶段的参数
    ./nginx -V

### 快速停止服务
    向master进程发送`TERM`信号
    ./nginx -s stop
    等同于kill -s SIGTERM master-pid / kill -s SIGINT master-pid

### 优雅的停止服务
    向master进程发送`QUIT`信号
    ./nginx -s quit
    等同于kill -s SIGQUIT master-pid

### 优雅停止worker进程
    kill -s SIGWINCH worker-pid

快速与优雅的区别：   
快速：worker进程和master进程在收到信号后会立即跳出循环，退出进程；   
优雅：先关闭监听端口，停止接收新的连接，然后把当前正在处理的连接全部处理完，最后在退出进程。

### 使运行中的nginx重读配置项并生效
    ./nginx -s reload
    等同于kill -s SIGHUP master-pid

### 日志文件回滚
先重命名或转移日志文件，然后-s reopen日志将打入新的日志文件

    ./nginx -s reopen
    等同于kill -s SIGUSR1 master-pid

### 平滑升级nginx
新版本替换旧版本二进制文件

    kill -s SIGUSR2 master-pid-old #新旧版本同时运行
    kill -s SIGQUIT master-pid-old #优雅关闭旧版本

## nginx日志
`ngx_http_log_module`用于记录HTTP请求的访问日志。

默认情况下，`access_log` 会使用 combined 的配置来记录访问日志

    log_format combined '$remote_addr - $remote_user [$time_local]  '
               '"$request" $status $body_bytes_sent '
               '"$http_referer" "$http_user_agent"';

日志通过\^A分割

    log_format abc "$remote_addr^A$remote_user^A$time_local^A$request_method^A$uri^A$args^A$server_protocol"
            "^A$status^A$body_bytes_sent^A$http_referer"
            "^A$http_user_agent";

`ngx_errlog_module`为其他模块提供基本的记录日志功能。

## ngx_module_t内容

```
ngx_module_t *ngx_modules[] = {
    // 全局core模块
    &ngx_core_module,
    &ngx_errlog_module,
    &ngx_conf_module,
    &ngx_emp_server_module,
    &ngx_emp_server_core_module,

    // event模块
    &ngx_events_module,
    &ngx_event_core_module,
    &ngx_kqueue_module,

    // 正则模块
    &ngx_regex_module,

    // http模块
    &ngx_http_module,
    &ngx_http_core_module,
    &ngx_http_log_module,
    &ngx_http_upstream_module,

    // http handler模块
    &ngx_http_static_module,
    &ngx_http_autoindex_module,
    &ngx_http_index_module,
    &ngx_http_auth_basic_module,
    &ngx_http_access_module,
    &ngx_http_limit_conn_module,
    &ngx_http_limit_req_module,
    &ngx_http_geo_module,
    &ngx_http_map_module,
    &ngx_http_split_clients_module,
    &ngx_http_referer_module,
    &ngx_http_rewrite_module,
    &ngx_http_proxy_module,
    &ngx_http_fastcgi_module,
    &ngx_http_uwsgi_module,
    &ngx_http_scgi_module,
    &ngx_http_memcached_module,
    &ngx_http_empty_gif_module,
    &ngx_http_browser_module,
    &ngx_http_upstream_ip_hash_module,
    &ngx_http_upstream_keepalive_module,
    //此处是第三方handler模块

    // http filter模块, 组成倒序链
    &ngx_http_write_filter_module,
    &ngx_http_header_filter_module,
    &ngx_http_chunked_filter_module,
    &ngx_http_range_header_filter_module,
    &ngx_http_gzip_filter_module,
    &ngx_http_postpone_filter_module,
    &ngx_http_ssi_filter_module,
    &ngx_http_charset_filter_module,
    &ngx_http_userid_filter_module,
    &ngx_http_headers_filter_module,
    // 第三方filter模块
    &ngx_http_copy_filter_module,
    &ngx_http_range_body_filter_module,
    &ngx_http_not_modified_filter_module,
    NULL
};
```
http filter模块，filter模块会将所有的filter handler排成一个倒序链，所以在最前面的最后执行。上面的例子中，&ngx_http_write_filter_module最后执行，ngx_http_not_modified_filter_module最先执行。注意，我们加载的第三方filter模块是在copy_filter模块之后，headers_filter模块之前执行。


