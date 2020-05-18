---
title: Nginx模块梳理
category: Nginx
---

> 当前Nginx共提供111个模块，分类如下：

# 10个CORE模块
* ngx_core_module
    - 提供main conf下的指令，如deamon等
* ngx_errlog_module
    - 仅提供errlog指令
* ngx_events_module
    - 仅提供event指令块
* ngx_http_module
    - 仅提供http指令块
* ngx_mail_module
    - 仅提供mail指令块
* ngx_stream_module
    - 仅提供stream指令块
* ngx_thread_pool_module
    - 仅提供thread_pool指令
* ngx_regex_module
    - 仅提供pcre_jit指令
* ngx_openssl_module
    - 仅提供ssl_engine指令
* ngx_google_perftools_module
    - 仅提供google_perftools_profiles指令

# 1个CONF模块
* ngx_conf_module
    - 仅提供include指令

# 9个EVENT模块
* ngx_event_core_module
* ngx_epoll_module
* ngx_select_module
* ngx_kqueue_module
* ngx_poll_module
* ngx_devpoll_module
* ngx_eventport_module
* ngx_win32_poll_module
* ngx_win32_select_module

# 65个HTTP模块
* ngx_http_core_module
* 略

# 19个STREAM模块
* ngx_stream_core_module
* 略

# 7个MAIL模块
* ngx_mail_core_module
* 略


