---
title: "用户手册之epoll"
description: ""
category: manual
tags: [manual, epoll]
---

# epoll - IO事件通知

	#include <sys/epoll.h>

## 描述
epoll的API接口用于监听多个文件描述符上的IO事件。分为边缘触发和水平触发两种模式。以下	系统调用接口用于创建和管理epoll实例：

 - int epoll_create(int size)：创建epoll实例，返回表示该实例的文件描述符。
 size用来告诉内核这个监听的数目一共有多大。需要注意的是，当创建好epoll句柄后，它就是会占用一个fd值，所以在使用完epoll后，必须调用close()关闭，否则可能导致fd被耗尽。
 - int epoll_ctl(int epfd, int op, int fd, struct epoll_event* event)：事件注册函数，注册感兴趣的文件描述符，注册到epoll实例上的文件描述符集合称为epoll集合。
 第一个参数是epoll_create()的返回值，
 第二个参数表示动作，用三个宏来表示：
   EPOLL_CTL_ADD：注册新的fd到epfd中；
   EPOLL_CTL_MOD：修改已经注册的fd的监听事件；
   EPOLL_CTL_DEL：从epfd中删除一个fd；
  第三个参数是需要监听的fd，
  第四个参数是告诉内核需要监听什么事，struct epoll_event结构如下：

{% highlight c %}

struct epoll_event {
  __uint32_t events;
  epoll_data_t data;
};

typedef union epoll_data {
  void *ptr;
  int fd;
  __uint32_t u32;
  __uint64_t u64;
} epoll_data_t;

{% endhighlight %}

events可以是以下几个宏的集合：

	EPOLLIN： 表示对应的文件描述符可以读（包括对端SOCKET正常关闭）；
	EPOLLOUT： 表示对应的文件描述符可以写；
	EPOLLPRI： 表示对应的文件描述符有紧急的数据可读（这里应该表示有带外数据到来）；
    EPOLLERR： 表示对应的文件描述符发生错误；
    EPOLLHUP： 表示对应的文件描述符被挂断；
    EPOLLET： 将EPOLL设为边缘触发模式（默认为水平触发）；
    EPOLLONESHOT： 只监听一次事件，当监听完这次事件之后，如果还需要继续监听这个socket的话，需要再次把这个socket加入到EPOLL队列里。
 - int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout)：等待IO事件，如果当前没有事件发生，阻塞调用线程。
 参数events 用来从内核得到事件的集合；
 参数maxevents 告之内核这个events 有多大，这个maxevents 的值不能大于创建epoll_create()时的size；
该函数返回需要处理的事件数目，如返回0表示已超时。

### 水平触发和边缘触发

 - Edge Triggered (ET) 边缘触发：只有数据到来，才触发，不管缓存区中是否还有数据。
 - Level Triggered (LT) 水平触发：只要有数据都会触发。

两种机制的区别，请看以下场景：

 1. 代表管道读端(rfd)的文件描述符被注册到epoll实例上；
 2. 向管道写端写入2KB数据；
 3. 调用epoll_wait()返回rfd，表示文件描述符读取操作准备就绪；
 4. 通过rfd，从管道读端读取1KB数据；
 5. 调用epoll_wait()完成。

如果使用EPOLLET将rfd注册到epoll实例上，尽管文件输入缓冲区仍有数据，第5步的epoll_wait调用完成可能挂起；而对端应用会等待传输剩下的1KB数据。造成这种结果的原因是边缘触发的原理是只有当监听的文件描述符状态发生变化时才会递交事件。所以，在第5步调用者可能一直等待数据，而此时数据其实已经在缓冲区里了。

在以上例子中，在第2步完成写操作，导致产生rfd上的可读事件，该事件在第3步被epoll捕获返回。因为在第4步没有读取所有缓冲区的数据，导致第5步中的epoll_wait可能永久阻塞。

使用EPOLLET模式的应用程序应该设置文件描述符为非阻塞模式，以防止同时处理多个文件描述符的任务由于阻塞读或阻塞写而饿死。使用边缘触发epoll的两条建议：

 1. 非阻塞文件描述符；
 2. 只有在读或写返回EAGAIN时等待事件。

如果使用水平触发模式（默认），epoll相当于更快的poll，poll可以使用的地方，都可以使用epoll。

### /proc接口
	/proc/sys/fs/epoll/max_user_watches (since Linux 2.6.28)

规定用户可以注册到epoll实例上的文件描述符数目。该限制针对每个用户ID。每个文件描述符消耗90字节的32位系统空间，160字节的64为系统空间。max_user_watches的默认值为可用内存的1/25除以单位注册的消耗字节数。

### 使用示例
在该例中，监听器为一个非阻塞socket（listen已调用）。do_use_fd使用新的就绪文件描述符，直到read或write返回EAGAIN。在获得EAGAIN以后，事件驱动的状态机应用应该记录当前状态，以便于在下次调用do_use_fd时继续读写操作。

{% highlight c %}

#define MAX_EVENTS 10
struct epoll_event ev, events[MAX_EVENTS];
int listen_sock, conn_sock, nfds, epollfd;

/* Set up listening socket, 'listen_sock' (socket(),
   bind(), listen()) */

epollfd = epoll_create(10);
if (epollfd == -1) {
    perror("epoll_create");
    exit(EXIT_FAILURE);
}

ev.events = EPOLLIN;
ev.data.fd = listen_sock;
if (epoll_ctl(epollfd, EPOLL_CTL_ADD, listen_sock, &ev) == -1) {
    perror("epoll_ctl: listen_sock");
    exit(EXIT_FAILURE);
}

for (;;) {
    nfds = epoll_wait(epollfd, events, MAX_EVENTS, -1);
    if (nfds == -1) {
        perror("epoll_pwait");
        exit(EXIT_FAILURE);
    }

    for (n = 0; n < nfds; ++n) {
        if (events[n].data.fd == listen_sock) {
            conn_sock = accept(listen_sock,
                            (struct sockaddr *) &local, &addrlen);
            if (conn_sock == -1) {
                perror("accept");
                exit(EXIT_FAILURE);
            }
            setnonblocking(conn_sock);
            ev.events = EPOLLIN | EPOLLET;
            ev.data.fd = conn_sock;
            if (epoll_ctl(epollfd, EPOLL_CTL_ADD, conn_sock,
                        &ev) == -1) {
                perror("epoll_ctl: conn_sock");
                exit(EXIT_FAILURE);
            }
        } else {
            do_use_fd(events[n].data.fd);
        }
    }
}

{% endhighlight %}

## QA

 1. 用于区分注册到epoll集合中的文件描述符的key是什么？
	 文件描述符number和打开文件名描述符句柄。
 2. 注册相同文件描述符到epoll实例两次会怎么样？
	 可能得到EEXSIT错误。也可能添加重复的文件描述符到同一个epoll实例。如果重复的文件描述符注册了不同的事件mask，这对过滤事件有用。
 3. 两个epoll实例能够等待同一个文件描述符吗，如果可以，事件会通知给两个epoll文件描述符吗？
	 是的，可以通知给两个，但小心编程。
 4. epoll文件描述符本身是可以poll/epll/select的吗？
	 是的，如果epoll文件描述符有等待事件，那么表示是可读的。
 5. 如果将epoll文件描述符本身放到epoll集合中会怎么样？
	 epoll_ctl调用会失败EINVAL。但你可以将epoll文件描述符放到另一个epoll集合中。
 6. 能否通过Unix domain socket将epoll文件描述符发送给另一个进程？
	 可以，但是没有意义，因为得到该文件描述符的进程的epoll集合中没有该文件描述符副本。
 7. 关闭文件描述符会导致其自动从epoll集合中删除吗？
	 是的，但注意以下几点。文件描述符是一个打开文件句柄的引用，如果文件描述符经过dup、fcntl或fork被拷贝，会创建指向同一个文件句柄的新文件描述符。打开的文件句柄会一直存在直到指向它的所有文件描述符都关闭了。只有指向文件句柄的所有文件描述符都关闭了，文件描述符才会从epoll集合中删除（除非显示调用epoll_ctl EPOLL_CTL_DEL删除）。这意味着，尽管epoll集合中的文件描述符已经关闭，如果指向同一个文件句柄的文件描述符仍然打开着，文件描述符上的事件仍可能被通知。
 8. 如果调用epoll_wait期间多个事件发生，他们会被一起通知还是分开通知？
	 一起通知。
 9. 在文件描述符上的操作是否会影响已经收集但尚未通知的事件？
	 你可以在文件描述符上做两个操作。删除操作没有意义，修改操作会再次读取可用的IO。
 10. 当使用EPOLLET时，是否需要连续读写文件描述符直到返回EAGAIN？
	从epoll_wait返回事件说明此文件描述符可以进行IO操作。你必须认为它是就绪的直到下次读写返回EAGAIN。何时使用、如何使用文件描述符完全取决于你。
	对于packet-oriented文件（数据包socket），检查读写IO缓冲区结束的唯一方式是继续读写直到返回EAGAIN。
	对于stream-oriented文件（管道，FIFO，流socket），读写IO缓冲区结束的条件也可以通过检测读写目标文件描述符的数量来判断。例如，如果调用read要求读取一定数目的数据，但返回了不足量的数据，你可以确定完成了多少缓冲区的读取。write同理。

## 陷阱和避免方法

 - 饿死（边缘触发）
如果IO缓存空间很大，为了读写为完，导致其他文件不能被处理，即出现饿死现象。

解决方案：维护一个就绪列表，在数据结构中标记文件描述符就绪，让应用程序记住哪些文件需要处理，但仍在就绪队列里round robin。

 - 如果使用了事件缓存。。。
 如果使用了事件缓存，或者保存了epoll_wait返回的所有事件，保证有办法可以动态关闭。假设你有100个事件（epoll_wait()返回），在事件#47中关闭了事件#13。如果你移除事件结构并关闭事件#13的文件描述符，你的时间缓存可能仍认为#13的文件描述符上仍有事件等待。

解决方案：在处理事件#47时，调用epoll_ctl(EPOLL_CTL_DEL)删除并关闭#13文件描述符，标记对应的数据结构为删除状态，并链接到清除列表。如果你发现有其他事件使用#13文件描述符，你可以知道文件描述符在之前已经删除了。

