---
title: Leetcode 6 - Zigzag Conversion
category: leetcode
---

> 蛇形输出字符串

```cpp
/*
两行：
1 3 5                   2
2 4 6                   2

三行：
1   5   9   d           4
2 4 6 8 a c             2
3   7   b               4

四行：
1     7     d           6
2   6 8   c             4 2
3 5   9 b               2 4
4     a                 6

五行：
1       9       e       8
2     8 a     d f       6 2
3   7   b   f   g       4 4
4 6     c e     h       2 6
5       d       i       8
*/
string convert(string s, int nRows) {
    if(nRows<=1 || nRows>=s.length())return s;
    string res;
    // 逐行输出
    for(int i=1;i<=nRows;i++) {
        int p=i-1;
        // 特殊处理首行和尾行
        if(i==1 || i==nRows) {
            while(p<s.length()) {
                res.push_back(s[p]);
                p+=2*(nRows-1);
            }
        } else {
            // 步长
            int delta=2*(nRows-i);
            while(p<s.length()) {
                res.push_back(s[p]);
                p+=delta;
                // 改变步长
                delta=2*(nRows-1)-delta;
            }
        }
    }
    return res;
}
```

---
*详见[这里](https://leetcode.com/submissions/detail/22795779/)*
