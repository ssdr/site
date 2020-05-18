---
title: Leetcode 8 - String to Integer(atoi)
category: leetcode
---

> 实现atoi的功能：转换字符串为整数。注意考虑输入字符串的各种可能性。

```c
int atoi(string str) {
    long res=0;
    //删除前面的空格
    int i=0, sign=1, len=str.length();
    while(str[i]==' ' && i<len) {
        i++;
    }
    if(len==0 || i==len)return 0;
    
    //考虑符号
    if(str[i]=='-') {
        i++;
        sign=-1;
    } else if(str[i]=='+') {
        i++;
    }
    
    for(;i<len;i++) {
    	 //注意溢出的提前判断
        if(res>INT_MAX || str[i]<'0' || str[i]>'9') {
            break;
        } else {
            res = res*10 + (str[i]-'0');
        }
    }
    if(res>INT_MAX) {
        return sign==1?INT_MAX:INT_MIN;
    }
    
    return res*sign;
}

```
---
*详见[这里](https://leetcode.com/submissions/detail/22712240/)*
