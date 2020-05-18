---
title: 一点proxy_pass的注意事项
category: Nginx
---

以下配置摘自nginx.conf 里的server 段：

    server {
        listen 80;
        server_name abc.163.com ;
        location / {
            proxy_pass http://ent.163.com/ ;
        }
        location /star/ {
            proxy_pass http://ent.163.com ;
        }
    }

里面有两个location，我先说第一个，/ 。其实这里有两种写法，分别是：

    location / {
        proxy_pass http://ent.163.com/ ;
    }
    location / {
        proxy_pass http://ent.163.com ;
    }

出来的效果都一样的。

第二个location，/star/。同样两种写法都有，得出来的结果就不一样了。

    location /star/ {
        proxy_pass http://ent.163.com ;
    }

当访问 http://abc.163.com/star/ 的时候，nginx 会代理访问到 http://ent.163.com/star/ ，并返回给我们。

    location /star/ {
        proxy_pass http://ent.163.com/ ;
    }

当访问 http://abc.163.com/star/ 的时候，nginx 会代理访问到 http://ent.163.com/ ，并返回给我们。

这两段配置的区别在于， `proxy_pass http://ent.163.com/ ;` 中的`”/”`，令得出来的结果完全不同。

前者，相当于告诉nginx，我这个location，是代理访问到http://ent.163.com 这个server的，我的location是什么，nginx 就把location 加在proxy_pass 的 server 后面，这里是/star/，所以就相当于 http://ent.163.com/star/。如果是location /blog/ ，就是代理访问到 http://ent.163.com/blog/。

后者，相当于告诉nginx，我这个location，是代理访问到http://ent.163.com/的，http://abc.163.com/star/ == http://ent.163.com/ ，可以这样理解。改变location，并不能改变返回的内容，返回的内容始终是http://ent.163.com/ 。 如果是location /blog/ ，那就是 http://abc.163.com/blog/ == http://ent.163.com/ 。

这样，也可以解释上面那个location / 的例子了，/ 加在server 的后面，仍然是 / ，所以，两种写法出来的结果是一样的。

PS: 如果是 location ~* ^/start/(.*)\.html 这种正则的location，是不能写”/”上去的，nginx -t 也会报错的。因为，路径都需要正则匹配了嘛，并不是一个相对固定的locatin了，必然要代理到一个server。

---
*转自[这里](http://www.cnblogs.com/naniannayue/archive/2010/08/07/1794520.html)*
