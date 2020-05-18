---
title: 用户手册之fork
category: manual
---

## fork - 生成子进程
### 用法
	#include <unistd.h>
	pid_t fork(void);

### 描述
通过复制调用进程来产生新进程。新进程（子进程）是调用进程（父进程）的副本，除了：

 - 子进程拥有自己独一无二的进程ID，并且它的PID不与任何存在的组ID相同 setpgid()
 - 子进程的PID就是父进程ID 
 - 子进程不继承父进程的内存锁 mlock(), mlockall()
 - 子进程的资源占用率和CPU事件被重置为0 getrusage(), times()
 - 子进程的pending信号集初始化为空 sigpending()
 - 子进程不继承父进程的信号量 semop()
 - 子进程不继承父进程的记录锁 fcntl()
 - 子进程不继承父进程的计时器 setitimer(), alarm(), timer_create()
 - 子进程不继承父进程的异步IO操作和异步IO上下文 aio_read(), aio_write(), io_setup()
 
以上是POSIX.1-2001标准，以下是Linux特有的：
 
 
 - 子进程不继承父进程的目录更改通知事件 F_NOTIFY
 - prctl() PR_SET_PDEATHSIG置位，使得父进程退出时子进程收不到信号
 - 用madvise() MADV_DONTFORK标记的内存映射不会通过fork传递
 - 子进程的退出信号始终是SIGCHLD
 
注意以下几点
 - 子进程只包含一个线程，并且有fork产生。父进程的整个虚拟地址空间被复制给子进程，包括互斥器、条件变量和其他的pthread对象；这种行为带来的问题pthread_atfork可能有帮助。
 - 子进程继承了父进程打开文件描述符。父进程和子进程指向相同的文件描述符。也就是说，两个进程的文件描述符共享相同的打开文件状态标志、当前文件偏移和信号驱动IO属性。
 - 子进程继承了父进程打开消息队列描述符。父进程和子进程指向相同的消息队列描述符。也就是说，两个描述符共享相同的标志。
 - 子进程继承了父进程打开目录流的集合。POSIX.1-2001说父子进程中的目录流可能共享目录流位置，但Linux/glibc没这么做。

### 返回值
如果成功，父进程中返回子进程的PID，子进程返回0。

如果失败，父进程返回-1，不创建子进程，errno被设置。

### ERRORS
EAGAIN - fork()不能分配足够的内存空间来拷贝父进程的页表，不能为子进程分配task结构

ENOMEM - 因为内存紧张，分配所需的内核结构失败

### NOTES
Linux下，fork通过copy-on-write机制实现，所以此处fork的唯一penalty就是复制父进程页表所需的时间和内存，以及为子进程创建唯一的task结构。

从内核2.3.3开始，不必直接执行系统调用，glibc提供了fork函数作为NPTL线程实现的一部分，用于执行带参数的系统调用clone。glibc封装函数调用pthread_atfork实现的fork处理函数。

---
*具体实例，看[这里](http://ssdr.github.io/2014/12/pipe-manual/)*
