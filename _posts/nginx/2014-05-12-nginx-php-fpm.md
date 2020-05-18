---
layout: default
title: "为大流量网站优化Nginx和PHP-FPM"
description: "Nginx优化"
category: Nginx
tags: [nginx, php-fpm]
---

> 在使用了七年的nginx和php以后，我们学到了一些给大流量网站的nginx和php-fpm做优化的东西。

## 1. 将TCP换成Unix domain套接字
透过回环接口Unix domain套接字提供了更好的性能（更少的数据拷贝和上下文切换）。
需要注意的是，Unix domain套接字只对运行在服务器本机上的程序是可达的（很显然，不涉及网络）。

    upstream backend
    {
        # UNIX domain sockets
        server unix:/var/run/fastcgi.sock;

        # TCP sockets
        # server 127.0.0.1:8080;
    }

## 2. 调整worker进程数目
现代的硬件设备都具有多个处理器，nginx可以善加利用多个物理或虚拟处理器核心。
通常情况下，web服务器机器不会同时提供多个服务（比如，同时提供web服务和打印服务），因此，你需要设置nginx使用所有可用的处理器，nginx的worker进程不是多线程的。
要查看你的机器上有多少处理器：

    cat /proc/cpuinfo | grep processor
在nginx的配置文件nginx.conf中，设置worker进程数为机器核心数。
增加worker进程连接数，设置multi_accept为ON，如果是linux系统，使用epoll。

    # We have 16 cores
    worker_processes 16;

    # connections per worker
    events
    {
        worker_connections 4096;
        multi_accept on;
    }

## 3. 设置upsteam负载均衡
根据经验，相同机器上的多个upatream后端会产生更高的吞吐量。
例如，你想支持1000个子请求，将它们分到两个后端，每个处理500个。

    upstream backend {
        server unix:/var/run/php5-fpm.sock1 weight=100 max_fails=5 fail_timeout=5;
        server unix:/var/run/php5-fpm.sock2 weight=100 max_fails=5 fail_timeout=5;
    }

## 4. 关闭access日志文件
access日志对性能的影响很大，因为大流量网站的日志文件涉及大量跨线程同步的I/O操作。

    access_log off;
    log_not_found off;
    error_log /var/log/nginx-error.log warn;
如果你不想关闭access日志文件，至少要缓存它们。

    access_log /var/log/nginx/access.log main buffer=16k;

## 5. 使用GZip
    gzip on;
    gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1100;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;

## 6. 缓存经常访问的文件的信息
    open_file_cache max=200000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

## 7. 调整客户端超时时间
    client_max_body_size 500M;
    client_body_buffer_size 1m;
    client_body_timeout 15;
    client_header_timeout 15;
    keepalive_timeout 2 2;
    send_timeout 15;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    client_max_body_size 500M;

## 8. 调整输出缓存
    fastcgi_buffers 256 16k;
    fastcgi_buffer_size 128k;
    fastcgi_connect_timeout 3s;
    fastcgi_send_timeout 120s;
    fastcgi_read_timeout 120s;
    reset_timedout_connection on;
    server_names_hash_bucket_size 100;

## 9. 微调/etc/sysctl.conf文件
    # Recycle Zombie connections
    net.inet.tcp.fast_finwait2_recycle=1
    net.inet.tcp.maxtcptw=200000

    # Increase number of files
    kern.maxfiles=65535
    kern.maxfilesperproc=16384

    # Increase page share factor per process
    vm.pmap.pv_entry_max=54272521
    vm.pmap.shpgperproc=20000

    # Increase number of connections
    vfs.vmiodirenable=1
    kern.ipc.somaxconn=3240000
    net.inet.tcp.rfc1323=1
    net.inet.tcp.delayed_ack=0
    net.inet.tcp.restrict_rst=1
    kern.ipc.maxsockbuf=2097152
    kern.ipc.shmmax=268435456

    # Host cache
    net.inet.tcp.hostcache.hashsize=4096
    net.inet.tcp.hostcache.cachelimit=131072
    net.inet.tcp.hostcache.bucketlimit=120

    # Increase number of ports
    net.inet.ip.portrange.first=2000
    net.inet.ip.portrange.last=100000
    net.inet.ip.portrange.hifirst=2000
    net.inet.ip.portrange.hilast=100000
    kern.ipc.semvmx=131068

    # Disable Ping-flood attacks
    net.inet.tcp.msl=2000
    net.inet.icmp.bmcastecho=1
    net.inet.icmp.icmplim=1
    net.inet.tcp.blackhole=2
    net.inet.udp.blackhole=1

## 10. 监控
持续监控打开连接的数目，内存释放和等待线程的数目。
当超过设定的阈值时，设置警报通知。你可以自行搭建报警服务，或者使用[ServerDensity](http://serverdensity.io/)。
一定要安装nginx的[stub status](http://wiki.nginx.org/HttpStubStatusModule)模块，你需要重新编译nginx。

    ./configure --with-http_ssl_module --with-http_stub_status_module --without-mail_pop3_module --without-mail_imap_module --without-mail_smtp_module make install BATCH=yes

---
*本文翻译自：[Optimizing NGINX and PHP-fpm for high traffic sites](http://www.softwareprojects.com/resources/programming/t-optimizing-nginx-and-php-fpm-for-high-traffic-sites-2081.html)*
