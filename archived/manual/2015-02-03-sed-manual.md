---
title: "用户手册之sed"
description: ""
category: manual
tags: [manual, sed]
---

## SED简介
用于过滤和转换文本的流编辑器。sed在Linux下是个强大的工具，这里主要说替换：

1、替换并输出（不修改源文件）：

	sed  's/dog/cat/g' file      ##dog被替换的内容，cat替换的内容

2、备份后直接替换至源文件：

	sed -i.bak 's/dog/cat/g' file

3、替换第n行到第m行：

	sed 'n,ms/dog/cat/g' file  ##n、m为数字

4、替换内容xxx和***之间的内容：

	sed '/A/,/B/s/dog/cat/g' file  ##替换A和B之间的内容

5、一次替换多个多个内容：

	sed  -e  's/dog1/cat1/g' -e  's/dog2/cat2/g' file

## 一个特殊用法
通常我们使用sed的时候使用单引号：

	echo "aaaa" | sed -n 's/aaaa/bbbb/p'
	bbbb

但是如果我们想使用变量来替换呢？

	b=bbbb
	echo "aaaa" | sed -n 's/aaaa/$b/p'
	$b
没有被替换，输出是$b。  单引号中$b  shell 没有解释并替换。

那我们可以将单引号换成双引号：

	b=bbbb
	echo "aaaa" | sed -n "s/aaaa/$b/p" 
	bbbb

如果b=bbbb/bbbb,再进行替换呢？

	echo "aaaa" | sed -n "s/aaaa/$b/p"
	sed: -e expression #1, char 13: unknown option to `s

出错了！原因是$b中的/被用作了s命令匹配！

将sed中/ 替换成# 就行了：

	b=bbbb/bbbb
	echo "aaaa" | sed -n "s#aaaa#$b#p" 
	bbbb/bbbb

