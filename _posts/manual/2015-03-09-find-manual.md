---
title: 用户手册之find （未完待续）
category: manual
---

## find - 在目录中搜索文件
用法

	find [-H] [-L] [-P] [-D debugopts] [-Olevel] [path...] [expression]

## 描述
### 选项
选项`-H`、`-L`，`-P`控制对符号链接的操作。跟在后面的参数被看作被查找的文件或目录名，直到遇到第一个以`'-'`开始的参数，或者参数`'('`或`'!'`。之后的所有参数用于描述搜索表达式。如果没有指定目录，使用当前目录。如果没有指定搜索表达式，使用`-print`。 

## 使用示例

1, 用文件名查找文件, 在当前目录及其子目录
find -name "filename"

2, 用文件名查找文件, 忽略大小写, 在当前目录及其子目录
find -iname "filename"

3, 使用mindepth和maxdepth限定搜索指定目录的深度
在根目录及其子目录查找passwd文件
find / -name passwd 
在根目录及其1层深的子目录查找passwd文件
find / -maxdepth 2 -name passwd
在第2层和第4层目录之间查找passwd文件
find / -mindepth 3 -maxdepth 5 -name passwd

4, 在find命令查找到的文件上执行命令
find -iname "filename" -exec md5sum {} \;

5, 相反匹配
find -not -iname "filename"

6, 找到home目录及子目录下所有的空文件(0字节文件)
find ~ -empty

7, 查找5个最大的文件
find . -type f -exec ls -s {} \; | sort -n -r | head -5

8, 查找5个最小的文件(不包括空文件)
find . -not -empty -type f -exec ls -s {} \; | sort -n  | head -5

9，使用-type查找指定文件类型的文件
查找所有的隐藏文件
find . -type f -name ".*"
s: socket
f: 普通文件
d: 目录

10，查找所有的在ordinary_file之后创建修改的文件
find -newer ordinary_file

11，通过文件大小查找文件
find ~ -size +100M
find ~ -size -100M
find ~ -size 100M 
+：比指定尺寸大
-：比指定尺寸小
没有符号表示和给定尺寸一样大

12，用find命令删除大型打包文件
删除大于100M的*.zip文件
find / -type f -name *.zip -size +100M -exec rm -i {} \;

13，在查找到的文件列表结果上直接执行命令
find < CONDITION to Find files > -exec < OPERATION > \;

14，仅仅在当前文件系统中搜索
-xdev Don’t descend directories on other filesystems.
在/目录及其子目录下搜索当前文件系统(也就是/挂载的文件系统)中所有以.log结尾的文件
find / -xdev -name "*.log"

15，find -name "*.txt" cp {} {}.bkup \;

16，将错误重定向到/dev/nul
find -name "*.txt" 2>>/dev/null

17，将文件名中的空格换成下划线
find . -type f -iname “*.mp3″ -exec rename “s/ /_/g” {} \;
