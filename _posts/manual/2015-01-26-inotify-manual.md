---
title: "用户手册之inotify"
description: ""
category: manual
tags: [manual, inotify]
---
# inotify - 监控文件系统事件
## 描述
inotify API提供了一种监控文件系统事件的机制。它可以用于监控单个文件或目录。当监控目录时，inotify会返回目录本身的事件以及目录内部文件的事件。

相关的系统调用：`inotify_init`, `inotify_add_watch`, `inotify_rm_watch`, `read`, `close`。

`inotify_init`生成inotify实例，并返回对应的文件描述符。

`inotify_add_watch`操作inotify实例相关的监控列表。监控列表中的每一个元素标示了一个文件或目录的路径名，以及内核可以监控的一系列事件。`inotify_add_watch`可以创建一个新的监控元素，也可以修改已存在的监控元素。每一个监控元素拥有唯一的监控描述符（该API返回的一个整数）。

`inotify_rm_watch`用于删除监控列表中的元素。

当所有的inotify实例对应的文件描述符都关闭了，内核释放回收资源，所有相关的监控自动释放。

为了确定什么事件发生，应用程序从inotify文件描述符读取数据。如果没有事件发生，假设文件描述符为阻塞模式，read调用阻塞直至有一个事件发生。

每次`read`成功返回包含一个或多个一下结构的缓冲区：

{% highlight c %}

struct inotify_event {
     int      wd;       /* Watch descriptor */
     uint32_t mask;     /* Mask of events */
     uint32_t cookie;   /* Unique cookie associating related
   						events (for rename(2)) */
     uint32_t len;      /* Size of name field */
     char     name[];   /* Optional null-terminated name */
};

{% endhighlight %}

wd为监听描述符；

mask表示监听的事件；

cookie为与事件相关的整数，仅用于重命名事件。

当监听目录中的文件上有时间返回时，name域有效。标示相对与监听目录的文件路径名，为null-terminated。

len为name长度，包括空字节。每个inotify_event结构的长度为sizeof(struct inotify_event)+len。

如果给read的缓冲区过小，不足以容纳下一个事件信息，结果取决于内核版本。为了保证可以读取至少一个事件信息，请设定缓冲区大小为sizeof(struct inotify_event) + NAME_MAX + 1。

### inotify事件
inotify_add_watch的mask参数以及读取inotify文件描述符时返回的inotify_event结构的mask域都是标示inotify事件的bit掩码。以下bit可以在调用inotify_add_watch时在mask中指定，也可以通过read调用在mask域返回：

	IN_ACCESS 读取文件*
	IN_ATTRIB 文件的元数据改变*
	IN_CLOSE_WRITE 以写模式打开的文件关闭*
	IN_CLOSE_NOWRITE 以非写模式打开的文件关闭*
	IN_CREATE 在监听的目录下创建文件或目录*
	IN_DELETE 在监听的目录下删除文件或目录*
	IN_DELETE_SELF 监听的文件或目录本身被删除
	IN_MODIFY 文件被修改*
	IN_MOVE_SELF 监听的文件或目录被移动
	IN_MOVED_FROM 文件被移出监听目录*
	IN_MOVED_TO 文件被移进监听目录*
	IN_OPEN 文件被打开*
当监听一个目录时，以上带星号的事件可以发生于目录中的文件上，此时，返回的inotify_event的name域记录了目录中的文件名。

`IN_ALL_EVENTS`表示以上所有事件。

另外，`IN_MOVE`等同于IN_MOVED_FROM | IN_MOVED_TO；`IN_CLOSE`等同于IN_CLOSE_WRITE | IN_CLOSE_NOWRITE。

还有一些事件可以在inotify_add_watch的mask中指定：

	IN_DONT_FOLLOW (linux 2.6.15)如果是一个符号链接，不解引用目录名
	IN_EXCL_UNLINK (linux 2.6.36)默认情况下，监听目录时，尽管目录中的子元素被unlink，子元素上仍然产生事件。IN_EXCL_UNLINK就是为了改变此默认行为，unlink后不再产生事件
	IN_MASK_ADD 在已存在的监听mask中添加（OR）事件
	IN_ONESHOT 监听目录名的事件一次，之后从监听列表删除
	IN_ONLYDIR (linux 2.6.15)仅监听目录

还有一些事件可以在read返回的mask中指定：

	IN_IGNORED 移除监听，或显示地（inotify_rm_watch），或自动地（文件被删除或文件系统被unmount）
	IN_ISDIR 事件的监听目标是目录
	IN_Q_OVERFLOW 事件队列移除（此事件wd为-1）
	IN_UNMOUNT 包含监听目标的文件系统被unmount
### /proc接口
以下接口用于限制inotify的内核内存消耗：

	/proc/sys/fs/inotify/max_queued_events inotify_init用于设置监听事件的上限（events）
	/proc/sys/fs/inotify/max_user_instances 每个用户ID可以创建的inotify实例个数上限（inotify instances）
	/proc/sys/fs/inotify/max_user_watches 每个用户ID可以创建的watch个数上限（watches）
## 限制和附加说明
监听目录的inotify不是递归的：要监听目录中的子目录，必须创建独立的监听。对于比较大的目录树来说，这通常比较耗时。

inotify API不提供触发事件的用户或进程的任何信息。

注意事件队列可能溢出。此时，事件丢失。健壮的程序需要处理事件可能丢失的情况。

inotify API通过文件名表示文件，但当应用经常处理事件时，文件名可能被删除或修改。

如果在监听整个目录树，并在目录中创建了一个子目录，请记住，当你为子目录创建监听的时候，子目录中可能已经创建了新文件（该文件不会触发事件发生）。因此，在添加监听后，你需要立即扫描子目录的内容。

---
*详细信息请看：[inotify manual](http://manpages.debian.org/cgi-bin/man.cgi?query=inotify&apropos=0&sektion=0&manpath=Debian+7.0+wheezy&format=html&locale=en)*
