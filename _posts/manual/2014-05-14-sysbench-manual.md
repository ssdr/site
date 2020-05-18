---
title: "用户手册之sysbench"
description: "sysbench使用"
category: manual
tags: [manual, sysbench]
---

## 1. 简介
SysBench是一个模块化、跨平台、多线程的性能评测工具，用于评测运行着数据库的高负载下的操作系统参数。该评测工具不需要用户建立复杂的数据库评测方案甚至不需要安装数据库就可以获知系统性能。
### SysBench特性
当前版本允许测试以下系统参数（对应不同的测试模式）：  
 
- 文件I/O性能
- 调度性能
- 内存分配和传输性能
- POSIX线程实现性能
- 数据库服务器性能

### 设计
原理很简单，SysBench运行指定数目的线程并行处理请求。请求的负载根据测试模式的不同而不同。用户可以限定请求的数目或者请求的时间，或者两者同时限定。   
可用的测试模式通过模块编译实现，用户可以添加添加自己的测试模式。

### 几个链接
- [Home page](http://sysbench.sf.net/)
- [Download](http://sf.net/projects/sysbench/)
- [Mailing lists](http://sourceforge.net/p/sysbench/mailman/sysbench-general/)

### 安装
标注安装流程   

	./configure
	make
	make install
以上过程会使用安装到默认安装目录下的MySQL，如果你的MySQL头文件目录和库文件目录不在默认目录下，你可以在./configure时显式添加参数--with-mysql-includes和--with-mysql-libs。   
如果不想使用MySQL，添加编译参数--without-mysql，这样的话所有数据库相关的测试模式不可用。

## 2. 使用
### 通用语法
	sysbench [common-options] --test=name [test-options] command
command简要介绍   

- prepare   
	做一些准备性工作，如用于oltp测试的填充测试数据库
- run   
	执行测试，带--test=name参数
- cleanup   
	测试完毕后清除临时数据
- help   
	显示帮助信息，带--test=name参数
	
### 命令选项

选项 | 描述 | 默认值
--- | ---- | ----
--num-threads | 创建的工作线程数目 | 1
--max-requests | 请求数，0表示不限制 | 10000
--max-time | 测试执行的秒数，0表示不限制 | 0
--forced-shutdown | --max-time时间后，等待多长时间强制关闭 | off
--thread-stack-size | 每个线程栈大小 | 32K
--init-rng | 是否随机数发生器初始化 | off
--report-interval | 统计上报间隔 | 0
--test | 运行的测试模式 | required
--debug | 打印debug信息 | off
--validate | 尽量执行结果的有效性测试 | off
--help | 帮助信息 | off
--verbosity | 日志级别，0critical，5debug | 4
--percentile | 百分数。。。 | 95

## 3. 测试模式
### CPU
SysBench中最简单的测试模式。测试内容为素数计算，--cpu-max-primes指定计算到的最大素数。所有计算使用64位整数。   
每个线程并发执行直到有一个线程达到最大素数或超过指定的总时间。   

	sysbench --test=cpu --cpu-max-primes=20000 run
### 线程
用于测试调度性能，即大量线程竞争锁资源的情况。   
SysBench创建指定数目的线程和互斥锁。然后每个线程执行请求互斥锁和cpu资源的请求，调度器将线程置于执行队列，然后释放互斥锁，调度器重新调度线程执行。对于每个请求，以上步骤循环执行数次。   

选项 | 描述 | 默认值
--- | --- | ----
--thread-yields | 每个请求执行循环次数 | 1000
--thread-locks | 创建互斥锁数目 | 8

	sysbench --num-threads=64 --test=threads --thread-yields=100 --thread-locks=2 run
### 互斥锁
该测试用于模拟所有线程并发运行访问互斥锁的情形（比如为全局变量增加计数），因此，该测试的目的是测试锁的性能。

选项 | 描述 | 默认值
--- | --- | ---
--mutex-num | 互斥锁数目，随机加锁 | 4096
--mutex-locks | 每个请求互斥锁加锁数目 | 50000
--mutex-loops | 加锁前空循环次数 | 10000
### 内存
用于测试内存读写性能。

选项 | 描述 | 默认值
--- | --- | ---
--memory-block-size | 内存块大小 | 1K
--memory-scope | 可取值：global，local。标示每个线程可访问的内存块类型 | global
--memory-total-size | 传输数据的总大小 | 100G
--memory-oper | 内存操作类型，可取值：read，write | 100G
### 文件IO
用于测试文件IO负载性能，在prepare阶段SysBench生成一定数目特定大小的文件，在run阶段，每个线程对这些文件做IO操作。*详细说明暂略*

	$ sysbench --num-threads=16 --test=fileio --file-total-size=3G --file-test-mode=rndrw prepare
	$ sysbench --num-threads=16 --test=fileio --file-total-size=3G --file-test-mode=rndrw run
	$ sysbench --num-threads=16 --test=fileio --file-total-size=3G --file-test-mode=rndrw cleanup
### oltp
用于测试真实数据库性能，在prepare阶段，在特定数据库（默认sbtest）中创建如下数据表：
	
	CREATE TABLE `sbtest` (
	  `id` int(10) unsigned NOT NULL auto_increment,
	  `k` int(10) unsigned NOT NULL default '0',
	  `c` char(120) NOT NULL default '',
	  `pad` char(60) NOT NULL default '',
	  PRIMARY KEY  (`id`),
	  KEY `k` (`k`) );
这个数据表被自动填充了特定行的数据。
在run阶段，可以使用以下执行模式：
#### a) 简单型
每个线程执行简单查询

	SELECT c FROM sbtest WHERE id=N 
N取值[1, <*tablesize*>]
#### b) 高级事务型
每个线程在数据表上执行事务，如果表和库支持事务，使用BEGIN/COMMIT开始/结束事务；否则，使用LOCK TABLES/UNLOCK TABLES。如果一些行在事务中被删除，相同的行会在事务中被重新插入，因此该测试不会改变数据表，因此可以对相同的表进行多次测试。
命令支持的事务语句：

* 点查询
* 区间查询
* 区间SUM查询
* 区间ORDER BY查询
* 区间DISTINCT查询
* 对索引列的UPDATE
* 对非索引列的UPDATE
* 删除
* 插入

#### c) 非事务型
类似于简单型，但可以选择所要执行的查询（不仅限于SELECT）。与高级事务型不同，该类型测试不保存请求间的数据表，所以你需要重新cleanup/prepare重建数据表。

选项 | 描述 | 默认值
--- | --- | ---
--oltp-test-mode | 执行类型，可取值：simple，complex，nontrx | complex
--oltp-read-only | 只读模式，UPDATE, DELETE, INSERT不可执行 | off
--oltp-skip-trx | 忽略BEGIN/COMMIT | off
--oltp-reconnect-mode | 重连模式，可取值：session，query，transaction，random | session
--oltp-range-size | 查询区间大小 | 100
--oltp-point-selects | 在一个事务中点查询的数目 | 10
--oltp-simple-ranges | 单个事务中区间查询数 | 1
--oltp-sum-ranges | 单个事务中区间SUM查询数 | 1
--oltp-order-ranges | 单个事务中区间ORDER BY查询数 | 1
--oltp-distinct-ranges | 单个事务中区间DISTINCT查询数 | 1
--oltp-index-updates | 单个事务中索引UPDATE查询数 | 1
--oltp-non-index-updates | 单个事务中非索引UPDATE查询数 | 1
--oltp-nontrx-mode | 非事务型查询类型，可取值：select, update_key, update_nokey, insert, delete | select
--oltp-connect-delay | 连接到数据库后多少毫秒后睡眠 | 10000
--oltp-user-delay-min | 每个请求后，到睡眠的最小毫秒数 | 0
--oltp-user-delay-max | 每个请求后，到睡眠的最大毫秒数 | 0
--oltp-table-name | 测试数据表名 | sbtest
--oltp-table-size | 测试数据表行数 | 10000
--oltp-dist-type | 随机数分布，可取值：uniform，gauss，special（指定百分比） | special
--oltp-dist-pct | 为special参数指定的百分比 | 1
--oltp-dist-res | *你妹你真复杂* | 75
--db-ps-mode | *不大懂* 可取值：disable，auto | auto

MySQL相关参数

选项 | 描述 | 默认值
--- | --- | ---
--mysql-host | MySQL服务主机 | localhost
--mysql-port | MySQL服务端口 | 3306
--mysql-socket | 和MySQL服务器通信的Unix套接字文件 | 
--mysql-user | MySQL用户名 | user
--mysql-password | MySQL密码 | 
--mysql-db | MySQL数据库名，SysBench不会自动创建该数据库，必须你手动创建并为用户授权 | sbtest
--mysql-table-engine | 数据库表类型，可取值：myisam, innodb, heap, ndbcluster, bdb, maria, falcon, pbxt | innodb
--mysql-ssl | 使用SSL连接 | no
--myisam-max-rows | MyISAM表最大行数 | 1000000
--mysql-create-options | 传递给CREATE TABLE的额外参数 | 

	$ sysbench --test=oltp --mysql-table-engine=myisam --oltp-table-size=1000000 --mysql-socket=/tmp/mysql.sock prepare
	$ sysbench --num-threads=16 --max-requests=100000 --test=oltp --oltp-table-size=1000000 --mysql-socket=/tmp/mysql.sock --oltp-read-only=on run
第一条命令使用套接字文件在MySQL中创建sbtest数据库，并创建MyISAM表sbtest，然后向表中填充1M数据项。   
第二条命令执行测试，包含16个客户线程，发起100000请求。


---
*本文翻译自：[SysBench Manual](http://sysbench.sourceforge.net/docs/)*
