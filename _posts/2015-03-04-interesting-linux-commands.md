---
title: 一些有意思的Linux命令
category: knowledge
tags: linux
---

* 目录
{:toc #markdown-toc}

### !!
执行上一次命令
以root用户的身份执行上一次的指令

    sudo !!

执行上一个命令，并替换，可用于修正上次输入的命令

    ^foo^bar
    或
    !!:gs/foo/bar

### !*
重用上一次命令的所有参数，`ESC+.`为上次命令的最后一个参数

### 快速查看ascii码表

    man ascii

### ctrl+u, ctrl+y
输入某个命令，关闭该命令，去查看你忘记的部分，恢复关闭的命令，继续输入。
**这个命令很好用**

    ctrl+u 查看备忘
    ctrl+y 恢复命令

### ctrl+l
清屏，同clear命令

### (cd /tmp && ls)
进入某个目录，执行某个命令（如ls），然后跳回当前目录。如果收尾不加括号，不跳回当前目录

### time read (ctrl-d停止)
简单实用的秒表

### 列出最常用的命令

    history | awk '{a[$2]++}END{for(i in a){print a[i] " " i}}' | sort -rn | head

### 获取计算机位数
32位？64位？

    getconf LONG_BIT

### 列出占用内存最高的n个进程

    ps aux | sort -nk +4 | tail

### pushd /dir/you/want/to/go
将当前工作目录存入栈中，并进入你想进入的目录，之后用`popd`可以回到当前工作目录

### 使用AWK显示部分文本
`grep -A # pattern file.txt`只能查看匹配模式的特定行文本

    awk '/start_pattern/,/stop_pattern/' file.txt

### nc -l 80 < file.txt
通过http协议80端口共享文件

客户端接收文件：

    nc ip 80 > file.txt

### 简单http服务
将当前目录结构用于web服务，http://$HOSTNAME:8000/

    python -m SimpleHTTPServer

### mv filename.{old, new}
快速重命名文件，old->new

### mtr baidu.com
网络分析工具，`mtr=ping+traceroute`

### nl readme.txt
为文件标注行号

### shuf
生成随机组合

### ss
socket统计

### last
显示登陆用户列表

### curl ifconfig.me
获取外部ip地址

### tree
以树形显示目录内容

### pstree
以树形显示进程列表

### lsof

    sudo lsof -nP -iTCP:端口号 -sTCP:LISTEN
    不加 sudo 只能查看以当前用户运行的程序

参数说明：

    -n 表示不显示主机名
    -P 表示不显示端口俗称
    -i<条件> 列出符合条件的进程 [46][proto][@host|addr][:svc_list|port_list]
    -s<p:s>  exclude(^)|select protocol (p = TCP|UDP) states by name(s).
    -p<进程号> 列出指定进程号所打开的文件

---
本文提到的命令大部分来自 [commandlinefu.com](http://www.commandlinefu.com/commands/browse/sort-by-votes)。
