---
title: "快速清空文件内容"
description: "清空文件"
category: knowledge
tags: [linux]
---

# 快速清空文件的几种方法

    $ : > filename #其中的 : 是一个占位符, 不产生任何输出.
    $ > filename
    $ echo "" > filename
    $ echo /dev/null > filename
    $ echo > filename
    $ cat /dev/null > filename

