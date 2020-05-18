---
title: 源码安装Nginx
category: Nginx文档
permalink: /ngx-docs/:title/
---

使用`configure`命令进行创建。它最后会创建makefile文件。`configure命令`支持如下参数：

 - --prefix=path - Nginx的安装根目录。

 该路径用于configure命令和nginx.conf中配置的所有相对路径。默认路径为/usr/local/nginx。

 - --sbin-path=path - Nginx可执行文件名。

 仅用于安装时，默认是prefix/sbin/nginx。

 - --conf-path=path - nginx.conf配置文件名。

 `-c选项`可以用于指定nginx启动时的配置文件。默认是prefix/conf/nginx.conf。

 - --pid-path=path - nginx pid文件名。

 安装完成后可以通过`pid指令`在nginx.conf中配置。默认为prefix/logs/nginx.pid。

 - --error-log-path=path - 错误、警告和诊断信息文件名。

 安装完成后可以通过`error_log指令`在nginx.conf中配置。默认是prefix/logs/error.log。

 - --http-log-path=path - HTTP服务器的请求日志文件名。

 安装完成后可以通过`access_log指令`在nginx.conf中配置。默认是prefix/logs/access.log。

 - --user=name - 设置未授权用户名。

 工作进程会使用其证书。安装完成后可以通过`user指令`在nginx.conf中配置。默认是nobody。

 - --group=name - 设置组的名字。

 具体用法同--user。默认也是nobody。

 - --with-select_module/--without-select_module - 使用select module处理事件驱动。

 如果系统不支持其他方法如kqueue、epoll、rtsig、/dev/poll等，自动使用该选项。

 - --with-poll_module/--without-poll_module - 用法同select。

 - --without-http_gzip_module - 不安装http gzip module。

 根据配置文件中指定的content-type压缩HTTP的响应包。需要zlib库的支持。

 - --without-http_rewrite_module - 不安装http rewrite module。

 该模块提供HTTP请求在nginx服务内部的重定向功能，依赖PCRE库。

 - --without-http_proxy_module - 不安装http proxy module。

 该模块提供基本的HTTP反向代理功能。

 - --with-http_ssl_module - 安装http ssl module。

 该模块是nginx支持ssl协议，提供HTTPS服务，依赖OpenSSL库。

 - --with-pcre=path - 指定PCRE源码目录。

 使用PCRE库解析配置文件中location的正则表达式。

 - --with-pcre-jit - 编译带jit的PCRE库。

 - --with-zlib=path - 指定zlib库的源码目录。

 如果使用了gzip压缩功能，需要zlib库的支持。

 - --with-cc-opt=parameters - 设置额外参数到CFLAGS变量中。

 例如，`--with-cc-opt="-D FD_SETSIZE=2048"`，`--with-cc-opt="-I /usr/local/include"`。

 - --with-ld-opt=parameters - 链接阶段设置额外参数。

 例如，`--with-ld-opt="-L /usr/local/lib"`。


**使用示例**：

    ./configure
        --sbin-path=/usr/local/nginx/nginx
        --conf-path=/usr/local/nginx/nginx.conf
        --pid-path=/usr/local/nginx/nginx.pid
        --with-http_ssl_module
        --with-pcre=../pcre-4.4
        --with-zlib=../zlib-1.1.3
