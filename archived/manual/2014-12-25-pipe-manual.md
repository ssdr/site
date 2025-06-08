---
title: "用户手册之pipe"
description: ""
category: manual
tags: [manual, pipe]
---
## pipe, pipe2 - 创建管道
	#include <unistd.h>
	int pipe(int pipefd[2]);
## 描述
pipe()创建管道，用于进程间通信的单向数据通道。`pipefd`用于返回指向管道末端的两个文件描述符。`pipefd[0]`指向管道的读末端，`pipefd[1]`指向管道的写末端。内核缓存写到缓存中的数据直到被读取。详细信息见`pipe(7)`。
## 返回值
成功返回0，错误返回-1，`errno`相应被设置。
