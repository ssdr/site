---
title: Leetcode 7&8 - Reverse Integer & Palindrome Number
category: leetcode
---

### Reverse Ingeger


> Reverse digits of an integer.

> Example1: x = 123, return 321

> Example2: x = -123, return -321


```cpp

int reverse(int x) {
    // 记录符号
    int sign = (x>0) ? 1 : -1;
    // 只考虑整数，注意这里不能简单的abs
    // 应该先转为long类型后再abs
    // 因为int的最小值-2147483648 abs后溢出，wtf
    long xx = abs((long)x);
    long res=0;
    while(xx) {
        res = res*10 + xx%10;
        xx /= 10;
    }
    
    // 转换后溢出，int: -2147483648～2147483647 
    if(res>INT_MAX){
        return 0;
    }
    
    return (sign>0) ? res : (-1)*res;
}

```

### Palindrome Number

> Determine whether an integer is a palindrome. Do this without extra space.

```cpp

bool isPalindrome(int x) {
    // 反转后如果相等说明是回文
    if(x<0) return false;
    long xx=x, res=0;
    while(xx) {
        res = res*10 + xx%10;
        xx /= 10;
    }
    if(res == long(x)) {
        return true;
    } else {
        return false;
    }
}

```

---
*详见[这里](https://leetcode.com/submissions/detail/23188556/)*
*还有[这里](https://leetcode.com/submissions/detail/23190352/)*
