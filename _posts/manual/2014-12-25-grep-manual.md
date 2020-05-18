---
title: "用户手册之grep"
description: ""
category: manual
tags: [manual, grep]
---

## 名字
grep, egrep, fgrep - 打印匹配模式的行
## 用法
    grep [OPTIONS] PATTERN [FILE...]
    grep [OPTIONS] [-e PATTERN | -f FILE] [FILE...]
## 选项
### 匹配控制
    -e PATTERN, --regexp=PATTERN 使用PATTERN作为匹配模式
    -f FILE, --file=FILE 从文件获取模式，每行一个
    -i 忽略大小写
    -v 反向匹配
    -w, --word-regexp 选择匹配整个单词的行
    -x, --line-regexp 选择完全匹配整行的行
### 输出控制
    -c, --count 输出匹配行数目
    --color[=WHEN], --colour[=WHEN] 颜色显示匹配项，WHEN取值[never, always, auto]
    -L, --files-without-match 打印没有匹配的文件名
    -l, --files-with-matches 打印有匹配的文件名
    -m NUM, --max-count=NUM 达到最大匹配数时停止读取文件
    -o, --only-matching 仅输出匹配行的匹配部分
    -q, --quiet, --silent 无任何输出，找到匹配立刻返回0，即使是发生错误
### 输出行前缀控制
    -b, --byte-offset 打印匹配部分的偏移量
    -H, --with-filename 打印匹配行的文件名，多文件时的默认行为
    -h, --no-filename 不打印匹配行的文件名，单文件时的默认行为
    -n, --line-number 打印行号
### 上下文行控制
    -A NUM, --after-context=NUM 打印匹配后的NUM行
    -B NUM, --before-context=NUM 打印匹配前的NUM行
    -C NUM, -NUM, --context=NUM 打印NUM行上下文
## 正则表达式
正则表达式表述了一个字符串集合的模式，正则表达式的构成类似于数学表达式，都使用操作符组成的短小表达式。
### 字符和括号表达式
括号表达式是由[和]括起来的一组字符。它表示括号里的某个字符；如果该组字符以^开头，表示任何不在该列表中的字符。例如，正则表达式[0123456789]表示任何个位数字。   
括号表达式里可以书写range表达式，range表达式由两个字符以及分隔符-组成。例如，[a-d]等同于[abcd]。   
一些预定义的字符类：   
    
    [:alnum:]
    [:alpha:]
    [:cntrl:]
    [:digit:]
    [:graph:]
    [:lower:]
    [:print:]
    [:punct:]
    [:space:]
    [:upper:]
    [:xdigit:]
### 锚
^和$分别表示空字符串的开头和结尾
### 反斜杠和特殊表达式
    \<和\>分别表示空字符串的word开始和结束。
    \b word边界
    \B 非word边界
    \w 同[[:alnum:]]
    \W 同[^[:alnum:]]
### 重复
    ? 0次或1次
    * 大于等于0次
    + 大于等于1次
    {n} n次
    {n,} 大于等于n次
    {,m} 小于等于m次
    {n,m} 大于等于n次，且小于等于m次
### 基本和扩展正则表达式
在基本正则表达式中，一些元字符如?, +, {, |, (等失去特殊含义，要使用需要前面加\如\?, \+, \{, \|, \(。   
egrep不支持{元字符，而一些egrep的实现支持\{,所以在grep -E中可移植脚本应该避免{，应该使用[{]来匹配{。
