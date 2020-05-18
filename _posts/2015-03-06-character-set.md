---
title: "字符编码"
description: ""
category: knowledge
tags: character-set
---

## 字符编码
ASCII编码，定长一个字节，只能表示大小写字母、数字和一些符号

显然不够

中文GB2312，日文Shift-JIS，韩文Euc-kr等各国标准，多个字节

冲突，多语言混合会乱码


![头疼](http://www.liaoxuefeng.com/files/attachments/0013872491802084161ec9ef7d143a897e1584819535656000/0)

Unicode应运而生，常用的两个字节，生僻的四个字节，比如`A`的ASCII编码是`01000001`，而Unicode编码则是`00000000 01000001`。

乱码消失了，但是如果存储的文本全是英文，Unicode编码会比ASCII编码多一倍的存储空间。

UTF-8编码，可变长编码，1-6个字节不等，字母是一个字节，汉字通常是三个字节，生僻的会有4-6个字节。
UTF-8编码包含了ASCII编码。

在计算机内存中，统一使用Unicode编码，当需要保存到硬盘或需要传输时，转换成UTF-8编码。

