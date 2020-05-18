---
title:  转换rewrite规则
category: Nginx文档
permalink: /ngx-docs/:title/
---

## 重定向到主站
共享站点的管理员，习惯于只在Apache下使用.htaccess文件配置所有信息，通常会将下面规则

    RewriteCond  %{HTTP_HOST}  example.org
    RewriteRule  (.*)          http://www.example.org$1

翻译成nginx配置是这样：

    server {
        listen       80;
        server_name  www.example.org  example.org;
        if ($http_host = example.org) {
            rewrite  (.*)  http://www.example.org$1;
        }
        ...
    }

这种做法是错的，`复杂而且低效`。正确的方式是为example.org定义一个`单独的服务器`：

    server {
        listen       80;
        server_name  example.org;
        return       301 http://www.example.org$request_uri;
    }

    server {
        listen       80;
        server_name  www.example.org;
        ...
    }

在0.9.1版本（含）以前，可以这样实现重定向：

    rewrite      ^ http://www.example.org$request_uri?;

再举一个例子，处理一个和刚才相反的逻辑：既不是来自example.com，又不是来自www.example.com：

    RewriteCond  %{HTTP_HOST}  !example.com
    RewriteCond  %{HTTP_HOST}  !www.example.com
    RewriteRule  (.*)          http://www.example.com$1

应该按下面这样分开定义example.com、www.example.com和其他站点：

    server {
        listen       80;
        server_name  example.com www.example.com;
        ...
    }

    server {
        listen       80 default_server;
        server_name  _;
        return       301 http://example.com$request_uri;
    }

在0.9.1版本（含）以前，可以这样实现重定向：

    rewrite      ^ http://example.com$request_uri?;

## 转化混合规则

典型的混合规则如下：

    DocumentRoot /var/www/myapp.com/current/public

    RewriteCond %{DOCUMENT_ROOT}/system/maintenance.html -f
    RewriteCond %{SCRIPT_FILENAME} !maintenance.html
    RewriteRule ^.*$ %{DOCUMENT_ROOT}/system/maintenance.html [L]

    RewriteCond %{REQUEST_FILENAME} -f
    RewriteRule ^(.*)$ $1 [QSA,L]

    RewriteCond %{REQUEST_FILENAME}/index.html -f
    RewriteRule ^(.*)$ $1/index.html [QSA,L]

    RewriteCond %{REQUEST_FILENAME}.html -f
    RewriteRule ^(.*)$ $1/index.html [QSA,L]

    RewriteRule ^/(.*)$ balancer://mongrel_cluster%{REQUEST_URI} [P,QSA,L]

转换成nginx配置应该是这样：

    location / {
        root       /var/www/myapp.com/current/public;

        try_files  /system/maintenance.html
                   $uri  $uri/index.html $uri.html
                   @mongrel;
    }

    location @mongrel {
        proxy_pass  http://mongrel;
    }
