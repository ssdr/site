---
title: Nginx如何处理请求
category: Nginx文档
permalink: /ngx-docs/:title/
---

* 目录
{:toc #markdown-toc}

## 基于名字的虚拟主机
Nginx首先选定由哪一个虚拟主机来处理请求。让我们从一个简单的配置（其中全部3个虚拟主机都在端口*:80上监听）开始：

    server {
        listen      80;
        server_name example.org www.example.org;
        ...
    }

    server {
        listen      80;
        server_name example.net www.example.net;
        ...
    }

    server {
        listen      80;
        server_name example.com www.example.com;
        ...
    }

在这个配置中，nginx仅仅检查请求的`Host`头以决定该请求应由哪个虚拟主机来处理。
如果Host头没有匹配任意一个虚拟主机，或者请求中根本没有包含Host头，那nginx会将请求分发到定义在此端口上的`默认虚拟主机`。
在以上配置中，`第一个被列出的虚拟主机即nginx的默认虚拟主机——这是nginx的默认行为`。
而且，可以显式地设置某个主机为默认虚拟主机，即在"listen"指令中设置"default_server"参数：

    server {
        listen      80 default_server;
        server_name example.net www.example.net;
        ...
    }

"default_server"参数从0.8.21版开始可用。在之前的版本中，应该使用"default"参数代替。
请注意"default_server"是监听端口的属性，而不是主机名的属性。后面会对此有更多介绍。

## 如何防止处理未定义主机名的请求
如果不允许请求中缺少Host头，可以定义如下主机，丢弃这些请求：

    server {
        listen       80;
        server_name  "";
        return       444;
    }

在这里，我们设置主机名为空字符串以匹配未定义Host头的请求，而且返回了一个nginx特有的，非http标准的返回码444，它可以用来关闭连接。

从0.8.48版本开始，这已成为主机名的默认设置，所以可以省略server_name ""。而之前的版本使用机器的hostname作为主机名的默认值。

## 基于域名和IP混合的虚拟主机
下面让我们来看一个复杂点的配置，在这个配置里，有几个虚拟主机在不同的地址上监听：

    server {
        listen      192.168.1.1:80;
        server_name example.org www.example.org;
        ...
    }

    server {
        listen      192.168.1.1:80;
        server_name example.net www.example.net;
        ...
    }

    server {
        listen      192.168.1.2:80;
        server_name example.com www.example.com;
        ...
    }

这个配置中，nginx首先测试请求的IP地址和端口是否匹配某个server配置块中的listen指令配置。
接着nginx继续测试请求的Host头是否匹配这个server块中的某个server_name的值。 如果主机名没有找到，nginx将把这个请求交给默认虚拟主机处理。
例如，一个从192.168.1.1:80端口收到的访问www.example.com的请求将被监听192.168.1.1:80端口的默认虚拟主机处理，本例中就是第一个服务器，因为这个端口上没有定义名为www.example.com的虚拟主机。

`默认服务器是监听端口的属性`，所以不同的监听端口可以设置不同的默认服务器：

    server {
        listen      192.168.1.1:80;
        server_name example.org www.example.org;
        ...
    }

    server {
        listen      192.168.1.1:80 default_server;
        server_name example.net www.example.net;
        ...
    }

    server {
        listen      192.168.1.2:80 default_server;
        server_name example.com www.example.com;
        ...
    }

## 一个简单PHP站点配置
现在我们来看在一个典型的，简单的PHP站点中，nginx怎样为一个请求选择location来处理：

    server {
        listen      80;
        server_name example.org www.example.org;
        root        /data/www;

        location / {
            index   index.html index.php;
        }

        location ~* \.(gif|jpg|png)$ {
            expires 30d;
        }

        location ~ \.php$ {
            fastcgi_pass  localhost:9000;
            fastcgi_param SCRIPT_FILENAME
                          $document_root$fastcgi_script_name;
            include       fastcgi_params;
        }
    }

首先，nginx使用`前缀匹配`找出最准确的location，这一步nginx会忽略location在配置文件出现的顺序。
上面的配置中，唯一的前缀匹配location是"/"，而且因为它可以匹配任意的请求，所以被作为最后一个选择。
接着，nginx继续按照配置中的顺序依次匹配正则表达式的location，匹配到第一个正则表达式后停止搜索，匹配到的location将被使用。
如果没有匹配到正则表达式的location，则使用刚刚找到的最准确的前缀匹配的location。

请注意所有location匹配测试`只使用请求的URI部分，而不使用参数部分`。这是因为写参数的方法很多，比如：

    /index.php?user=john&page=1
    /index.php?page=1&user=john

除此以外，任何人在请求串中都可以随意添加字符串：

    /index.php?page=1&something+else&user=john

现在让我们来看使用上面的配置，请求是怎样被处理的：

1. 请求"/logo.gif"。
首先匹配上location "/"，然后匹配上正则表达式"\.(gif|jpg|png)$"。
因此，它将被后者处理。根据"root /data/www"指令，nginx将请求映射到文件/data/www/logo.gif"，并发送这个文件到客户端。
2. 请求"/index.php"。
首先也匹配上location "/"，然后匹配上正则表达式"\.(php)\$"。
因此，它将被后者处理，进而被发送到监听在localhost:9000的FastCGI服务器。
fastcgi_param指令将FastCGI的参数SCRIPT_FILENAME的值设置为"/data/www/index.php"，接着FastCGI服务器执行这个文件。
变量\$document_root等于root指令设置的值，变量\$fastcgi_script_name的值是请求的uri，"/index.php"。
3. 请求"/about.html"。
仅能匹配上location "/"，因此，它将使用此location进行处理。
根据"root /data/www"指令，nginx将请求映射到文件"/data/www/about.html"，并发送这个文件到客户端。
4. 请求"/"的处理更为复杂。它仅能匹配上location "/"，因此，它将使用此location进行处理。
然后，index指令使用它的参数和"root /data/www"指令所组成的文件路径来检测对应的文件是否存在。
如果文件/data/www/index.html不存在，而/data/www/index.php存在，此指令将执行一次内部重定向到"/index.php"，
接着nginx将重新寻找匹配"/index.php"的location，就好像这次请求是从客户端发过来一样。
正如我们之前看到的那样，这个重定向的请求最终交给FastCGI服务器来处理。


