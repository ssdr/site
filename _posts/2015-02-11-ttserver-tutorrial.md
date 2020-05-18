---
title: TTserver教程
category: tools
tags: ttserver
---

* 目录
{:toc #markdown-toc}


# 介绍
Tokyo Tyrant(TT)是Tokyo Cabinet DBM的网络接口。TT用于解决并发远程连接TC带来的问题。包括管理数据库的服务进程和客户端访问库。

TT支持所有兼容Memcached和HTTP的协议，因此几乎所有的平台和编程语言都可以使用TT。

由于服务端使用TC的抽象接口，客户端可以通过通用接口使用六类接口：内存hash数据库，内存tree数据库，hash，B+ tree数据库，定长数据库，表数据库。

# 服务端程序

## ttserver

{% highlight c %}

ttserver [-host name] [-port num] [-thnum num] [-tout num] [-dmn] [-pid path] [-kl] [-log path] [-ld|-le] [-ulog path] [-ulim num] [-uas] [-sid num] [-mhost name] [-mport num] [-rts path] [-rcc] [-skel name] [-mul num] [-ext path] [-extpc name period] [-mask expr] [-unmask expr] [dbname]

{% endhighlight %}

发送SIGINT和SIGTERM信号（ctrl-c），正常停止程序；
发送SIGHUP信号，重启服务；
如果端口号小于等于0，使用unix domain socket；
命令成功返回0，失败返回非0。

## ttservctl
服务启动脚本

## ttulmgr
导入导出更新日志的工具

# 客户端程序

## tcrtest
功能和性能测试工具

## tcrmttest
多线程下的功能测试工具

## tcrmgr
远程数据库API及其应用的测试和调试工具

# Tutorial

## 基本用法

    ttserver

默认用法，端口1978，内存hash数据库，用于保存cache数据。

    tcrmgr put localhost one first

测试保存数据

    tcrmgr get localhost one

测试获取数据

    tcrmgr mget localhost one two three

测试一次获取多条数据

    ttserver casket.tch

通过指定`.tch`后缀文件名，启动hash数据库库（非内存）
保存数据，关闭数据库，在重新打开，可以获取上次存的数据（此处略）

## daemon

    ttserver -dmn -pid /tmp/ttserver.pid /tmp/casket.tch

注意，指定pid文件目录，并且使用绝对路径

     kill -TERM `cat /tmp/ttserver.pid`

关闭后端进程，发送TERM信号

## 备份和恢复
以下是一个备份恢复的例程。

1，启动服务

    ttserver casket.tch

2，保存数据

    tcrmgr put localhost one first
    tcrmgr put localhost two second
    tcrmgr put localhost three third

3，使用`tcrmgr copy`命令备份数据库文件，注意，文件在服务端的文件系统中创建

    tcrmgr copy localhost backup.tch

4，通过ctrl-c终止服务，并删除数据库文件

    rm casket.tch

5，从备份文件恢复数据库，并重启服务

     cp backup.tch casket.tch
     ttserver casket.tch

6，检查数据一致性，成功~

    tcrmgr mget localhost one two three

## 更新日志
以下是一个通过更新日志恢复的例程。

1，启动服务，开启ulog

    ttserver -ulog /path/to/ulog casket.tch

2，保存数据

    tcrmgr put localhost one first
    tcrmgr put localhost two second
    tcrmgr put localhost three third

3，通过ctrl-c终止服务，并删除数据库文件

    rm casket.tch

4，重启服务

    mv ulog ulog-back
    mkdir ulog
    ttserver -ulog ulog casket.tch

5，在客户端，通过`tcrmgr restore`命令恢复数据库

    tcrmgr restore localhost ulog-back

6，检查数据一致性，成功~

    tcrmgr mget localhost one two three

## 复制
复制是一种用于多个数据库服务器的数据同步机制。源服务器为master，目标服务器为slave。复制机制的先决条件：

 - mater必须开启ulog
 - master必须指定唯一ID
 - 每个slave必须开启ulog，因为他们可能成为master（fail over时）
 - 每个slave必须指定唯一ID，原因同上
 - 每个slave必须指定master的地址和端口号
 - 每个slave必须指定复制时间戳文件

以下描述如何启动一主（端口1978）一从（端口1979）复制。

1，启动master

    mkdir ulog-1
    ttserver -port 1978 -ulog ulog-1 -sid 1 casket-1.tch

2，启动slave

    mkdir ulog-2
    ttserver -port 1979 -ulog ulog-2 -sid 2
             -mhost localhost -mport 1978 -rts 2.rts casket-2.tch

3，向master存数据

    tcrmgr put -port 1978 localhost one first
    tcrmgr put -port 1978 localhost two second
    tcrmgr put -port 1978 localhost three third

4，检查主从一致性

    tcrmgr mget -port 1978 localhost one two three
    tcrmgr mget -port 1979 localhost one two three

5，假设主挂掉，ctrl-c，移除数据库文件

    rm casket-1.tch

6，关闭从，ctrl-c，重启为新的主

    ttserver -port 1979 -ulog ulog-2 -sid 2 casket-2.tch

7，添加新的从（端口1980）

    mkdir ulog-3.tch
    ttserver -port 1980 -ulog ulog-3 -sid 3
             -mhost localhost -mport 1979 -rts 3.rts casket-3.tch

8，检查新主新从的一致性

    tcrmgr mget -port 1979 localhost one two three
    tcrmgr mget -port 1980 localhost one two three

为了支持更高的可用性，TT支持`dual master`（两个服务互相复制，互相做主从）。注意，同时更新主可能出现不一致性。

## 设置复制
不宕机设置数据库的复制，首先，准备下面的脚本用于备份操作，保存为"ttbackup.sh"，设置可执行权限。

{% highlight c %}

#!/bin/sh
srcpath="$1"
destpath="$1.$2"
rm -f "$destpath"
cp -f "$srcpath" "$destpath"

{% endhighlight %}

然后，启动master，开启ulog

    mkdir ulog-1
    ttserver -port 1978 -ulog ulog-1 -sid 1 casket-1.tch

存储一些数据

    tcrtest write -port 1978 localhost 10000

检查一致性

    tcrmgr list -port 1978 -pv localhost

备份数据库库

    tcrmgr copy -port 1978 localhost '@./ttbackup.sh'

确认备份文件保存为“casket-1.tch.xxxx”，（xxxx为backup文件的时间戳），然后启动slave

    cp casket-1.tch.xxxxx casket-2.tch
    echo xxxxx > 2.rts
    mkdir ulog-2
    ttserver -port 1979 -ulog ulog-2 -sid 2 -rts 2.rts casket-2.tch

注意以上操作没有指定master。我们模拟在设置replica的时候，master写入了一些数据

    tcrmgr put -port 1978 localhost one first
    tcrmgr put -port 1978 localhost two second
    tcrmgr put -port 1978 localhost three third

检查主从差异

    tcrmgr inform -port 1978 localhost
    tcrmgr inform -port 1979 localhost

为slave指定master，此时开始主从复制，差异消失

    tcrmgr setmst -port 1979 -mport 1978 localhost localhost

确认slave的master，差异消失

    tcrmgr inform -port 1979 -st localhost

## 调优

 1. 如果你使用hash数据库，设置"#bnum=xxx"以提高性能，此参数设置bucket数量，应该多于保存的数据条数；
 2. 如果你使用B+树数据库，设置"#lcnum=xxx#bnum=yyy"以提高性能，lcnum指定缓存的最大叶子节点数，如果内存允许，应该大一些，bnum指定bucket数量，应该多于保存的数据条数的1/128；
 3. 如果大量用户访问服务，确保将每个进程的文件描述符数量限制设为ulimit；
 4. 为了处理服务峰值访问时的高速查询，可以设置内存hash/tree数据库和文件hash/tree数据库联合复制。master处理内存数据库，用于高峰期间的查询，因为其不能保证数据的持久性，通过将数据存于文件数据库的slave复制弥补其不足。

## memcached客户端

## http客户端

---
*详情请看：[Fundamental Specifications of Tokyo Tyrant](http://fallabs.com/tokyotyrant/spex.html)*

*另外，听说[Kyoto Tycoon: a handy cache/storage server](http://fallabs.com/kyototycoon/)性能更好*
