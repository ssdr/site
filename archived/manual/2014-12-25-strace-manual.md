---
title: "用户手册之strace"
description: ""
category: manual
tags: [manual, strace]
---
## strace - 跟踪系统调用和信号
## 描述
最简单的情况，strace跟踪特定命令直至退出。可以阻截并记录系统调用和进程所获取的信号。系统调用的名字、参数和返回值被打印到标准错误输出上或特定文件中（`-o`）。   
strace是个很棒的工具。当源文件不可用时你会发现该工具是无价之宝，你甚至不需要重新编译代码。你也可以通过它学习操作系统和系统调用。由于系统调用和信号是发生在用户态/内核态接口的事件，该工具对于bug定位，合理性检测和检测竞态条件都非常有用。   
strace的每行输出包括系统调用的名字，包括在括号内的参数以及其返回值。   
例如，`cat /dev/null`的输出如下：

	open("/dev/null", O_RDONLY) = 3
发生错误时的输出包括错误码以及错误字符串：

	open("/foo/bar", O_RDONLY) = -1 ENOENT (No such file or directory)
信号输出，中断命令`sleep 666`的输出：

	sigsuspend([] <unfinished ...>
       --- SIGINT (Interrupt) ---
       +++ killed by SIGINT +++
当一个系统调用被执行同时另一个系统调用在不同的线程/进程上被执行，strace会尽量保持系统调用的事件次序，标记正在执行的调用为`unfinished`。当系统调用返回时标记为`resumed`。

	[pid 28772] select(4, [3], NULL, NULL, NULL <unfinished ...>
       [pid 28779] clock_gettime(CLOCK_REALTIME, {1130322148, 939977000}) = 0
       [pid 28772] <... select resumed> )      = 1 (in [3])

## 选项
	-c 统计每个系统调用的时间、调用次数和错误数，并在程序退出时报告统计概要

	-d 在标准错误输出strace自身的调试信息

	-f 跟踪子进程（被跟踪进程通过fork系统调用创建）

	-ff 如果`-o filename`选项生效，每个进程跟踪信息都输出到filename.pid中

	-h 帮助信息

	-i 打印指令地址

	-q 不打印attaching,detaching信息

	-r 打印每个系统调用的相对时间戳

	-t 打印时间前缀

	-tt 时间前缀包含毫秒

	-ttt 自epoch来的时间

	-T 显示系统调用时间

	-v 输出详细信息

	-V 版本信息

	-x 以十六进制形式输出所有非ascii字符串

	-xx 以十六进制形式输出所有字符串

	-a column 返回值所在的列（默认是40）

## 重点掌握

	-e expr 过滤跟踪哪些事件以及如何跟踪的表达式

表达式格式

	[qualifier=][!]value1[,value2]...

其中，`qualifier`包括`trace`（默认）, `abbrev`, `verbose`, `raw`, `signal`, `read`或者`write`；`value`和qualifier相关。例如，`-eopen`等同于`-e trace=open`，表示只跟踪open系统调用。而`-etrace=!open`表示跟踪出open以外的所有系统调用。另外，`all`和`none`作为value的意思是显而易见的。

