---
title: NC文件传输
category: tools
tags: nc
---

通过nc命令实现A，B机器之间的文件传输，注意两个机器必须可以互通。

假设从机器A往机器B传输文件file.txt。

### 机器B端

    nc -l 3140 > /tmp/file.txt

3140为监听的端口，/tmp/file.txt为存储的文件路径。

### 机器A端

    nc ip_B port_B < file.txt

ip_B和port_B分别为机器B端的IP地址和监听端口。


Done. :)
