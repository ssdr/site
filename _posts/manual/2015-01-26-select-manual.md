---
title: "用户手册之select"
description: ""
category: manual
tags: [manual, select]
---

# select,  pselect,  FD_CLR,  FD_ISSET, FD_SET, FD_ZERO - 同步IO多路复用    

## 用法

{% highlight c %}

/* According to POSIX.1-2001 */
#include <sys/select.h>
/* According to earlier standards */
#include <sys/time.h>
#include <sys/types.h>
#include <unistd.h>

int select(int nfds, fd_set *readfds, fd_set *writefds,
		   fd_set *exceptfds, struct timeval *timeout);
void FD_CLR(int fd, fd_set *set);
int  FD_ISSET(int fd, fd_set *set);
void FD_SET(int fd, fd_set *set);
void FD_ZERO(fd_set *set);

#include <sys/select.h>
int pselect(int nfds, fd_set *readfds, fd_set *writefds,
			fd_set *exceptfds, const struct timespec *timeout,
			const sigset_t *sigmask);

{% endhighlight %}

## 描述

select()和pselect()允许程序监听多个文件描述符，等待直到一个或多个文件描述符下的IO操作就绪。如果一个文件描述符可以非阻塞的进行IO操作，我们认为该文件描述符准备就绪。

select()和pselect()的区别：

1. 对于超时，select使用`timeval`结构（秒和微秒），而pselect使用`timespec`结构（秒和纳秒）
2. select会更新超时时间，以提示剩余时间，pselect不会改变该参数
3. select没有sigmask参数，相当于pselect的sigmask参数为NULL

### 三类文件描述符会被监听。
位于`readfds`中的文件描述符被监听是否可读（即读操作不阻塞）；位于`writefds`中的文件描述符被监听写操作是否不阻塞；位于`exceptfds`的文件描述符用于监听异常。`退出时，三类集合被就地修改（modified in place）以指示哪些文件描述符状态改变。`如果没有要监听的文件描述符，对应的集合置位NULL。

`readfds`监听是否有数据可从集合中的任何文件描述符可读。select()返回后，除了那些立即可读的文件描述符外，所有的文件描述符被清空。

`writefds`监听是否有空间向集合中的任何文件描述符写数据。select()返回后，除了那些立即可写的文件描述符外，所有的文件描述符被清空。

### 四个宏函数用于操作集合。
`FD_ZERO()`用于清空集合。`FD_SET()`用于添加一个文件描述符到集合，`FD_CLR()`用于从集合删除一个文件描述符。`FD_ISSET()`用于测试文件描述符是否属于集合，在select()调用返回之后使用。

`nfds`=三类集合中文件描述符最高值+1。

超时参数指定了select()阻塞等待文件描述符就绪的最小时间间隔。`如果timeout不为NULL，而且timeval的两个域都为零，则select()立即返回。如果timeout为NULL（即无timeout），则select()永远阻塞。`

sigmask是指向信号mask的指针，如果不为NULL，pselect()先用sigmask指向的信号mask替换当前的信号mask，然后执行select()，最后恢复之前的信号mask。

以下调用除了超时精度的不同，其他完全相同：

{% highlight c %}

ready = pselect(nfds, &readfds, &writefds, &exceptfds, timeout, &sigmask);

{% endhighlight %}

和

{% highlight c %}

sigset_t origmask;
pthread_sigmask(SIG_SETMASK, &sigmask, &origmask);
ready = select(nfds, &readfds, &writefds, &exceptfds, timeout);
pthread_sigmask(SIG_SETMASK, &origmask, NULL);

{% endhighlight %}

超时数据结构

{% highlight c %}

struct timeval {
	long    tv_sec;         /* seconds */
	long    tv_usec;        /* microseconds */
};

struct timespec {
	long    tv_sec;         /* seconds */
	long    tv_nsec;        /* nanoseconds */
};

{% endhighlight %}

为了实现一个高精度定时器，可以调用select()，并传参：三个监听集合为空，nfds为0，非空的超时时间。

### 注意

在linux系统，select()调用更改超时参数来反应剩余的时间，而在其他系统一般不这么做。这可能导致一些问题：

1. 在linux读取timeout的代码被移植到其他系统上时，读取的timeout不变；
2. 在事件循环中不经过重新初始化，多次调用select()重用timeout的代码被移植到linux系统下会出问题，因为timeout改变了。

## 返回值
如果成功，返回在三类集合中的文件描述符的数量（即，readfds、writefds、exceptfds中二进制含有1的个数）；如果超时，返回0；如果错误，返回-1，errno相应被设置，此时，集合以及超时为未定义状态，不应该使用它们。

## 错误

 - EBADF 无效的文件描述符（可能文件描述符已关闭，或者出现错误）
 - EINTR 捕捉到信号
 - EINVAL nfds为负值，或者timeout中的值无效
 - ENOMEM 无法为内部tables分配内存

## notes
fd_set是一段固定大小的缓冲区。执行带有负fd值或不小于FD_SETSIZE的fd值的FD_CLR()和FD_SET()会导致未定义行为。另外，POSIX要求fd为有效的文件描述符。

传统情况，timeval结构在`<sys/time.h>`定义，两个域都是long类型（如上所示）。

POSIX.1-2001情况，timeval结构在`<sys/select.h>`定义，域的类型在`<sys/types.h>`定义，如下：

{% highlight c %}

struct timeval {
	time_t         tv_sec;     /* seconds */
	suseconds_t    tv_usec;    /* microseconds */
};

{% endhighlight %}

所以，包含什么头文件取决于你想使用哪种结构。

**多线程应用**

如果被select监听的文件描述符被另一个线程关闭，结果是未定义的。在一些UNIX系统上，select()非阻塞并返回，标示文件描述符准备就绪。在Linux和一些其他系统，在其他线程关闭文件描述符对select不起作用。

**Linux notes**

pselect()由glibc实现，底层的系统调用是pselect6()。该系统调用与glibc的包裹函数（pselect）有些不同。

Linux的pselect6()系统调用修改timeout参数，而glibc的包裹函数通过`向系统调用传递一个timeout的局部变量`隐藏了这一行为。因此glibc的pselect()不会修改timeout参数，这是POSIX.1-2001的要求。

## 注意事项

1. 尽量使用不带timeout的select。如果没有数据可用，程序将无事可做。依赖超时的代码通常来说不可移植或难于调试。
2. 为了效率考虑，nfds应该精确计算。
3. 如果select调用后你不打算检查结果，请不要将该文件描述符添加到监听集合中。
4. 在调用select后，应该检查所有集合中的所有文件描述符是否准备就绪。
5. 函数read、recv、write、send不一定读读写所请求的数量的数据。如果它读写了你请求数量的数据，说明你的网络状况比较好。但情况不会一直都是这样。你应该处理函数只读写一个字节的情况。
6. 不要一次只读写一个字节的数据，除非你非常确定你有很少的数据要处理。每次读写的数据不是你的缓冲区大小，这将会是很低效的。
7. 函数read、recv、write、send和select一样可以返回-1，同事errno置为EINTR或EAGAIN。这些结果必须妥善处理。`如果你的程序不会捕获任何信号，你不应该得到EINTR错误。如果你的程序没有设置非阻塞IO，你不应该得到EAGAIN错误。`
8. 不要向read、recv、write、send函数传递长度为0的缓冲区。
9. 如果read、recv、write、send等函数返回，错误不是7中所列的或者输入函数返回0（表明文件结尾），那么你不应该将文件描述符再次放回select。
10. 每次调用select，需要重新初始化timeout，因为有些系统会修改该结构，pselect不会。
11. 因为select会修改文件描述符集合，如果是在循环中调用select，那么每次调用前需要重新初始化集合。

## usleep
以下代码可以实现usleep功能：

{% highlight c %}

struct timeval tv;
tv.tv_sec = 0;
tv.tv_usec = 200000;  /* 0.2 seconds */
select(0, NULL, NULL, NULL, &tv);

{% endhighlight %}

## 例子
{% highlight c %}

#include <stdio.h>
#include <stdlib.h>
#include <sys/time.h>
#include <sys/types.h>
#include <unistd.h>

int
main(void)
{
	fd_set rfds;
	struct timeval tv;
	int retval;

	/* Watch stdin (fd 0) to see when it has input. */
	FD_ZERO(&rfds);
	FD_SET(0, &rfds);

	/* Wait up to five seconds. */
	tv.tv_sec = 5;
	tv.tv_usec = 0;

	retval = select(1, &rfds, NULL, NULL, &tv);
	/* Don't rely on the value of tv now! */

	if (retval == -1)
		perror("select()");
	else if (retval)
		printf("Data is available now.\n");
		/* FD_ISSET(0, &rfds) will be true. */
	else
		printf("No data within five seconds.\n");

	exit(EXIT_SUCCESS);
}

{% endhighlight %}
