---
title: 虚拟主机名称
category: Nginx文档
permalink: /ngx-docs/:title/
---

* 目录
{:toc #markdown-toc}

虚拟主机名使用`server_name`指令定义，用于决定由某台虚拟主机来处理请求。虚拟主机名可以使用`确切的名字，通配符，或者是正则表达式`来定义：

    server {
        listen       80;
        server_name  example.org  www.example.org;
        ...
    }

    server {
        listen       80;
        server_name  *.example.org;
        ...
    }

    server {
        listen       80;
        server_name  mail.*;
        ...
    }

    server {
        listen       80;
        server_name  ~^(?<user>.+)\.example\.net$;
        ...
    }

nginx以名字查找虚拟主机时，如果名字可以匹配多于一个主机名定义，比如同时匹配了通配符的名字和正则表达式的名字，那么nginx按照`下面的优先级别`进行查找，并选中第一个匹配的虚拟主机：

1. 确切的名字；
2. 最长的以星号起始的通配符名字：*.example.org；
3. 最长的以星号结束的通配符名字：mail.*；
4. 第一个匹配的正则表达式名字（按在配置文件中出现的顺序）。
5. 通配符名字

**通配符名字只可以在名字的起始处或结尾处包含一个星号，并且星号与其他字符之间用点分隔**。所以，“www.\*.example.org”和“w\*.example.org”都是非法的。不过，上面的两个名字可以使用正则表达式描述，即“~^www\..+\.example\.org\$”和“~^w.\*\.example\.org\$”。星号可以匹配名字的多个节（各节都是以点号分隔的）。“\*.example.org”不仅匹配www.example.org，也匹配www.sub.example.org。

有一种形如“.example.org”的特殊通配符，它可以既匹配确切的名字“example.org”，又可以匹配一般的通配符名字“*.example.org”。

## 正则表达式名字

nginx使用的正则表达式兼容PCRE。为了使用正则表达式，虚拟主机名必须以`波浪线“~”`起始：

    server_name  ~^www\d+\.example\.net$;

否则该名字会被认为是个确切的名字，如果表达式含星号，则会被认为是个通配符名字（而且很可能是一个非法的通配符名字）。不要忘记设置“^”和“$”锚点，语法上它们不是必须的，但是逻辑上是的。同时需要注意的是，`域名中的点“.”需要用反斜线“\”转义`。`含有“{”和“}”的正则表达式需要被引用`，如：

    server_name  "~^(?<name>\w\d{1,3}+)\.example\.net$";

否则nginx就不能启动，错误提示是：

    directive "server_name" is not terminated by ";" in ...

命名的正则表达式捕获组在后面可以作为变量使用：

    server {
        server_name   ~^(www\.)?(?<domain>.+)$;

        location / {
            root   /sites/$domain;
        }
    }

PCRE使用下面语法支持命名捕获组：

    ?<name>    从PCRE-7.0开始支持，兼容Perl 5.10语法
    ?'name'    从PCRE-7.0开始支持，兼容Perl 5.10语法
    ?P<name>    从PCRE-4.0开始支持，兼容Python语法

如果nginx不能启动，并显示错误信息：

    pcre_compile() failed: unrecognized character after (?< in ...

说明PCRE版本太旧，应该尝试使用?P<name>。捕获组也可以以数字方式引用：

    server {
        server_name   ~^(www\.)?(.+)$;

        location / {
            root   /sites/$2;
        }
    }

不过，这种用法只限于简单的情况（比如上面的例子），因为数字引用很容易被覆盖。

## 其他类型的名字

有一些主机名会被特别对待。

如果需要用一个非默认的虚拟主机处理请求头中不含“Host”字段的请求，需要指定一个空名字：

    server {
        listen       80;
        server_name  example.org  www.example.org  "";
        ...
    }

如果server块中没有定义server_name，nginx使用空名字作为虚拟主机名。

nginx 0.8.48版本以下（含）在同样的情况下会使用机器名作为虚拟主机名。
如果以“$hostname”（nginx 0.9.4及以上版本）定义虚拟主机名，机器名将被使用。

如果使用IP地址而不是主机名来请求服务器，那么请求头的“Host”字段包含的将是IP地址。可以将IP地址作为虚拟主机名来处理这种请求：

    server {
        listen       80;
        server_name  nginx.org
                     www.nginx.org
                     ""
                     192.168.1.1
                     ;
        ...
    }

在匹配所有的服务器的例子中，可以见到一个奇怪的名字`“_”`：

    server {
        listen       80  default_server;
        server_name  _;
        return       444;
    }

这没什么特别的，它只不过是`成千上万的与真实的名字绝无冲突的非法域名中的一个`而已。当然，也可以使用“--”和“!@#”等等。

nginx直到0.6.25版本还支持一个特殊的名字`“*”`，这个名字一直被错误地理解成是一个匹配所有的名字。但它从来没有像匹配所有的名字，或者通配符那样工作过，而是用来支持一种功能，此功能现在已经改由`server_name_in_redirect指令`提供支持了。所以，现在这个特殊的名字“*”已经过时了，应该使用server_name_in_redirect指令取代它。需要注意的是，**使用server_name指令无法描述匹配所有的名字或者默认服务器**。这是listen指令的属性，而不是server_name指令的属性。可以定义两个服务器都监听\*:80和\*:8080端口，然后指定一个作为端口\*:8080的默认服务器，另一个作为端口\*:80的默认服务器：

    server {
        listen       80;
        listen       8080  default_server;
        server_name  example.net;
        ...
    }

    server {
        listen       80  default_server;
        listen       8080;
        server_name  example.org;
        ...
    }

## 优化
确切名字和通配符名字存储在`哈希表`中。哈希表和监听端口关联。哈希表的尺寸在配置阶段进行了优化，可以以最小的CPU缓存命中失败来找到名字。设置哈希表的细节参见[这篇文档](http://nginx.org/en/docs/hash.html)。

nginx首先搜索确切名字的哈希表，如果没有找到，搜索以星号起始的通配符名字的哈希表，如果还是没有找到，继续搜索以星号结束的通配符名字的哈希表。

因为名字是按照域名的节来搜索的，所以搜索通配符名字的哈希表比搜索确切名字的哈希表慢。注意特殊的通配符名字“.example.org”存储在通配符名字的哈希表中，而不在确切名字的哈希表中。

**正则表达式是一个一个串行的测试，所以是最慢的，而且不可扩展。**

鉴于以上原因，请尽可能使用确切的名字。举个例子，如果使用example.org和www.example.org来访问服务器是最频繁的，那么将它们明确的定义出来就更为有效：

    server {
        listen       80;
        server_name  example.org  www.example.org  *.example.org;
        ...
    }

下面这种方法相比更简单，但是效率也更低：

    server {
        listen       80;
        server_name  .example.org;
        ...
    }

如果定义了大量名字，或者定义了非常长的名字，那可能需要在http配置块中使用`server_names_hash_max_size`和`server_names_hash_bucket_size`指令进行调整。server_names_hash_bucket_size的默认值可能是32，或者是64，或者是其他值，取决于CPU的缓存行的长度。如果这个值是32，那么定义“too.long.server.name.example.org”作为虚拟主机名就会失败，而nginx显示下面错误信息：

    could not build the server_names_hash,
    you should increase server_names_hash_bucket_size: 32

出现了这种情况，那就需要将指令的值扩大一倍：

    http {
        server_names_hash_bucket_size  64;
        ...
    }

如果定义了大量名字，得到了另外一个错误：

    could not build the server_names_hash,
    you should increase either server_names_hash_max_size: 512
    or server_names_hash_bucket_size: 32

那么应该先尝试设置server_names_hash_max_size的值差不多等于名字列表的名字总量。如果还不能解决问题，或者服务器启动非常缓慢，再尝试提高server_names_hash_bucket_size的值。

如果只为一个监听端口配置了唯一的主机，那么nginx就完全不会测试虚拟主机名了（也不会为监听端口建立哈希表）。不过，有一个例外，如果定义的虚拟主机名是一个含有捕获组的正则表达式，这时nginx就不得不执行这个表达式以得到捕获组。
