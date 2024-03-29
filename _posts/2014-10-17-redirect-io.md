---
layout: default
title: "重定向输出"
description: ""
category: tools
tags: [linux, redirect-io]
---


## 标准IO重定向
解释下`2>&1`含义。

先看一个例子：

    0 2 * * * /u01/test.sh >/dev/null 2>&1 &

这句话的意思就是`在后台执行该脚本，并将错误输出重定向到标准输出，然后将标准输出全部放到/dev/null，也就是清空`。

在这里有有几个数字的意思：

    0表示标准输入
    1表示标准输出
    2表示错误输出

我们也可以这样写：

    0 2 * * * /u01/test.sh  >/u01/out.file &  --这里没写，默认是标准输出1
    0 2 * * * /u01/test.sh  1>/u01/out.file &
    0 2 * * * /u01/test.sh  2>/u01/out.file &
    0 2 * * * /u01/test.sh  2>/u01/out.file  2>&1 &

将tesh.sh 命令输出重定向到out.file, 即输出内容不打印到屏幕上，而是输出到out.file文件中。

* 2>&1 是将错误输出重定向到标准输出。 然后将标准输入重定向到文件out.file。
* &1 表示的是文件描述1，表示标准输出，如果这里少了&就成了数字1，就表示重定向到文件1。
* 最后的& 表示后台执行

### 测试

ls 2>1 ： 不会报没有2文件的错误，但会输出一个空的文件1；

ls xxx 2>1： 没有xxx这个文件的错误输出到了1中；

ls xxx 2>&1： 不会生成1这个文件了，不过错误跑到标准输出了；

ls xxx >out.txt 2>&1 == ls xxx 1>out.txt 2>&1；  因为重定向符号>默认是1，这句就把错误输出和标准输出都传到out.txt 文件中。

2>&1写在后面的原因:

`command > file 2>&1` 等价于 `command  1>file 2>&1`
首先是command > file 将标准输出重定向到file中，2>&1 是标准错误拷贝了标准输出，也就是同样被重定向到file中，最终结果就是标准输出和错误都被重定向到file中。

如果改成：`command 2>&1 >file`
首先是command 2>&1 标准错误拷贝了标准输出的行为，但此时标准输出还是在终端。>file 后输出才被重定向到file，但标准错误仍然保持在终端。

-----
*2020/10/28 重新编辑*

