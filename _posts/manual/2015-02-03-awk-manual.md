---
title: "用户手册之awk"
description: ""
category: manual
tags: [manual, awk]
---

## AWK 简介
AWK 是一种“样式扫描和处理语言”。它允许您创建简短的程序，这些程序读取输入文件、为数据排序、处理数据、对输入执行计算以及生成报表。它的名称取自于它的创始人 Alfred Aho、 Peter Weinberger 和 Brian Kernighan 姓氏的首个字母。

基本上来说，awk 可以从输入（ 标准输入，或一个或多个文件 ）中是否存在指定模式的记录（ 即文本行 ）。每次发现匹配时，就执行相关联的动作（ 例如写入到标准输出或外部文件 ）。

## AWK 语言基础
AWK 程序可以由一行或多行文本构成，其中核心部分是包含一个模式和动作的组合。

	pattern { action }

`模式`( pattern ) 用于匹配输入中的每行文本。对于匹配上的每行文本，awk 都执行对应的 `动作`( action )。模式和动作之间使用花括号隔开。awk 顺序扫描每一行文本，并使用 `记录分隔符`（一般是换行符）将读到的每一行作为 记录，使用 `域分隔符`( 一般是空格符或制表符 ) 将一行文本分割为多个 域， 每个域分别可以使用 $1, $2, … $n 表示。$1 表示第一个域，$2 表示第二个域，$n 表示第 n 个域。 `$0 表示整个记录`。模式或动作都可以不指定，缺省模式的情况下，将匹配所有行。缺省动作的情况下，将执行动作 {print}，即打印整个记录。

## 使用 awk 分解出日志中的信息
以下面的示例日志为例：
 
	202.189.63.115 - - [31/Aug/2012:15:42:31 +0800] "GET / HTTP/1.1" 200 1365 "-" "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20100101 Firefox/15.0.1"

把域分隔符修改为 `“ `：

	 awk -F\" '{print $6}' access.log        # 浏览器

### 统计浏览器类型
如果我们想知道那些类型的浏览器访问过网站，并按出现的次数倒序排列，我可以使用下面的命令：

 	awk -F\" '{print $6}' access.log | sort | uniq -c | sort -fr
此命令行首先解析出浏览器域，然后使用管道将输出作为第一个 sort 命令的输入。第一个 sort 命令主要是为了方便 uniq 命令统计出不同浏览器出现的次数。最后一个 sort 命令将把之前的统计结果倒序排列并输出。

### 发现系统存在的问题
我们可以使用下面的命令行，统计服务器返回的状态码，发现系统可能存在的问题。

 	awk '{print $9}' access.log | sort | uniq -c | sort
正常情况下，状态码 200 或 30x 应该是出现次数最多的。40x 一般表示客户端访问问题。50x 一般表示服务器端问题。

### 有关状态码的 awk 命令示例
查找并显示所有状态码为 404 的请求

 	awk '($9 ~ /404/)' access.log
统计所有状态码为 404 的请求

 	awk '($9 ~ /404/)' access.log | awk '{print $9,$7}' | sort
现在我们假设某个请求 ( 例如 : URI: /path/to/notfound ) 产生了大量的 404 错误，我们可以通过下面的命令找到这个请求是来自于哪一个引用页，和来自于什么浏览器。

 	awk -F\" '($2 ~ "^GET /path/to/notfound "){print $4,$6}' access.log

### 追查谁在盗链网站图片
系统管理员有时候会发现其他网站出于某种原因，在他们的网站上使用保存在自己网站上的图片。如果您想知道究竟是谁未经授权使用自己网站上的图片，我们可以使用下面的命令：

 	awk -F\" '($2 ~ /\.(jpg|gif|png)/ && $4 !~ /^http:\/\/www\.example\.com/) {print $4}' access.log | sort | uniq -c | sort
注意：使用前，将 www.example.com 修改为自己网站的域名。
### 与访问 IP 地址相关的命令
统计共有多少个不同的 IP 访问：

 	awk '{print $1}' access.log |sort|uniq|wc – l
统计每一个 IP 访问了多少个页面：

 	awk '{++S[$1]} END {for (a in S) print a,S[a]}' log_file
将每个 IP 访问的页面数进行从小到大排序：

 	awk '{++S[$1]} END {for (a in S) print S[a],a}' log_file | sort -n
查看某一个 IP（例如 202.106.19.100 ）访问了哪些页面：

 	grep ^202.106.19.100 access.log | awk '{print $1,$7}'
统计 2012 年 8 月 31 日 14 时内有多少 IP 访问 :

	awk '{print $4,$1}' access.log | grep 31/Aug/2012:14 | awk '{print $2}'| sort | uniq | wc -l
统计访问最多的前十个 IP 地址

 	awk '{print $1}' access.log |sort|uniq -c|sort -nr |head -10

### 与响应页面大小的命令
列出传输大小最大的几个文件

 	cat access.log |awk '{print $10 " " $1 " " $4 " " $7}'|sort -nr|head -100
列出输出大于 204800 byte ( 200kb) 的页面以及对应页面发生次数

 	cat access.log |awk '($10 > 200000){print $7}'|sort -n|uniq -c|sort -nr|head -100

