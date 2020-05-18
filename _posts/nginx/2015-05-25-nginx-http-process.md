---
title: nginx http框架的执行流程
category: Nginx
---

## http请求处理阶段
    post_read
    server_rewrite
    find_config
    rewrite
    post_rewrite
    preaccess
    access
    post_access
    try_files
    content
    log

## 处理http包体
两种处理方式：
接受包体到内存或文件中和直接丢弃包体。

请求的引用计数count
http模块每进行一类新的操作（为请求添加新事件、把一些已经由定时器、epoll中移除的事件重新加入其中等），都需要将请求的引用计数加一。
`ngx_http_close_request()`负责检查引用计数，引用计数为0时才真正销毁请求。

### 接受包体
ngx_http_read_client_request_body()
ngx_http_do_read_client_request_body()
ngx_http_read_client_request_body_handler()

### 丢弃包体
ngx_http_discard_request_body()
ngx_http_read_discarded_request_body()
ngx_http_discarded_request_body_handler()

## 发送http响应
ngx_http_send_header(): ngx_http_header_filter()
ngx_http_output_filter()
ngx_http_writer()

## 结束http请求
ngx_http_close_connection()

关闭tcp连接。

ngx_http_free_request()

释放请求对应的ngx_http_request_t结构体。

ngx_http_close_request()

关闭请求。引用计数减一。只有引用计数为0时才会释放请求。

ngx_http_finalize_connection()

检查引用计数，并解决keepalive和子请求的问题


ngx_http_terminate_request()

强制结束请求，用于非正常结束场景。引用计数强行置一，然后close。

ngx_http_finalize_request()

最常用的http模块结束请求的方法。


---
*参考自<<深入理解Nginx>>(陶辉 著)*
