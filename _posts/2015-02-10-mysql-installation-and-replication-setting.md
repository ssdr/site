---
title: 源码安装Mysql以及主从复制配置
category: tools
tags: mysql
---

## mysql源码安装
下午跟xm一起过了一遍mysql源码安装过程，由于机器配置过老，花了半个多钟头。其中还是有一些坑的。

1.下载mysql源码包

    wget http://cdn.mysql.com/Downloads/MySQL-5.6/mysql-5.6.14.tar.gztar
    xvf mysql-5.6.14.tar.gzcd mysql-5.6.14

2.mysql源码编译需要cmake工具，因此下载cmake包安装

    yum -y install make gcc-c++ cmake bison-devel  ncurses-devel

3.编译安装mysql，比较耗时

    cmake -DCMAKE_INSTALL_PREFIX=/data/liuyan/mysql -DMYSQL_DATADIR=/data/liuyan/mysqldata -DSYSCONFDIR=/etc -DWITH_MYISAM_STORAGE_ENGINE=1 -DWITH_INNOBASE_STORAGE_ENGINE=1 -DMYSQL_UNIX_ADDR=/data/liuyan/mysqldata/mysql.sock -DMYSQL_TCP_PORT=3306 -DENABLED_LOCAL_INFILE=1 -DWITH_PARTITION_STORAGE_ENGINE=1 -DEXTRA_CHARSETS=all -DDEFAULT_CHARSET=utf8 -DDEFAULT_COLLATION=utf8_general_ci
    make && make install

4.用户权限
使用下面的命令查看是否有mysql用户及用户组

    cat /etc/passwd 查看用户列表
    cat /etc/group  查看用户组列表

如果没有就创建

    groupadd mysqluseradd -g mysql mysql

修改/usr/local/mysql权限

    chown -R mysql:mysql /usr/local/mysql

5.进入安装路径，执行初始化配置脚本，创建系统自带的数据库和表，并创建my.conf

    scripts/mysql_install_db --basedir=/data/liuyan/mysql --datadir=/data/liuyan/mysqldata --user=mysql

6.添加服务，拷贝服务脚本到init.d目录，并设置开机启动

    cp support-files/mysql.server /etc/init.d/mysqld
    service mysqld start --启动MySQL

7.执行下面的命令修改root密码

    mysql -uroot  mysql < SET PASSWORD = PASSWORD('123456');

若要设置root用户可以远程访问，执行

    mysql < GRANT ALL PRIVILEGES ON *.* TO 'root'@'172.16.%' IDENTIFIED BY 'password' WITH GRANT OPTION;

**注意**：

有时候数据库已经有用户名密码你登陆不上，可以有如下解决办法：

- 首先，在my.cnf中添加`skip-grant-tables`，表示登陆不进行身份验证；
- 然后，重启mysql服务，则直接mysql -hxxx -Pxxx不使用账户就可以登陆数据库；
- 最后，修改用户名密码`update user set password=PASSWORD(123456) where user='root'`；

以后使用mysql -hxxx -Pxxx -uroot -p123456就可以登陆了。如果不能远程登录，则运行一下命令`GRANT ALL PRIVILEGES ON *.* TO ‘myuser’@'%’ IDENTIFIED BY ‘mypassword’ WITH GRANT OPTION;`即可。

## 配置主从replication
假设主mysql109，从mysql110。

1.首先，配置主从复制最好要求主从mysql版本一致。如果不能保证一致，则从mysql的版本号至少高于主mysql的版本号。

2.在主mysql添加为从mysql用于复制的用户，赋予REPLICATION SLAVE权限：

    GRANT REPLICATION SLAVE ON *.* TO 'slave'@'192.168.20.109' IDENTIFIED BY '123456';

这里需要注意的是，如果主109上的数据库是从其他机器拷贝过来的，使用slave账户登录恐怕看不到该数据库库，可以GRANT `ALL PRIVILEGES` ON...

3.修改主数据库的配置文件my.cnf,开启BINLOG，并设置server-id的值，修改之后必须重启Mysql服务：

    [mysqld]
    log-bin = /home/mysql/log/mysql-bin.log
    server-id=1

4.之后可以得到主服务器当前二进制日志名和偏移量，这个操作的目的是为了在从数据库启动后，从这个点开始进行数据的恢复

    mysql> show master status\G;
    File: mysql-bin.000003
    Position: 243

5.现在可以停止主数据的的更新操作，并生成主数据库的备份。我们可以通过mysqldump导出数据到从数据库，注意在导出数据之前先对主数据库进行READ LOCK，以保证数据的一致性：

    flush tables with read lock;
    mysqldump -h127.0.0.1 -p3306 -uroot -ptest > /tmp/test.sql
    unlock tables;

当然了，你也可以直接用cp命令将数据文件复制到从数据库去，但是有可能出问题。由于mysql有MYISAM和INNODB两种存储引擎，前者数据可以直接拷贝，后者直接拷贝数据可能不可用，详情见[这里](http://www.cnblogs.com/brucexuyg/archive/2012/06/22/2558755.html)。

6.将刚才主数据备份的test.sql复制到从数据库，进行导入。

7.接着修改从数据库的my.cnf,增加server-id参数,指定复制使用的账户,主数据库服务器的ip,端口以及开始执行复制日志的文件和位置。

    [mysqld]
    server-id=2
    master-host =192.168.10.109
    master-user=slave
    master-pass=123456
    master-port =3306
    master-connect-retry=60
    replicate-do-db =test

如果mysql不识别master-类指令，请使用一下指令手动修改：

    change master to master_host='192.168.10.109',master_user='slave',master_password='123456';

8.从mysql启动slave进程：

    start slave;

9.在从mysql上进行show salve status验证

    show slave status\G;

配置好主从后，110从109下载bin-log到本地保存为relay-log，110的从mysql通过执行relay-log里面的操作从而达到replication的目的。
### faq
109的数据库数据是从另一个线上环境导出的，将数据库导入109时出现很多错误日志，通过`mysql_upgrade`可以解决。

