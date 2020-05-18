---
title: Leetcode 4 - Median of Two Sorted Arrays
category: leetcode
---

> There are two sorted arrays A and B of size m and n respectively. Find the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).

### 朴素解法
两个数组都是有序的，直观的做法是，先归并两个数组，然后很容易获取中位数。这个方法的时间负责度貌似是O(m+n)。


```cpp
double findMedianSortedArrays(int A[], int m, int B[], int n)
{
    //先归并，然后判断m+n的奇偶性
    vector<int> V(m+n);
    merge(A, A+m, B, B+n, V.begin());
    if((m+n)%2) {
        return (double)V[(m+n)/2];
    } else {
        return ( (double)V[(m+n)/2] + V[(m+n)/2-1] ) / 2;
    }
}
```

我们求的是中位数，不需要归并排序这么复杂的操作，可以用一个计数器，遍历两个数组直到找到中位数为止。但这个做法的时间复杂度仍然是O(m+n)。

### 思考
其实看到题目里的时间复杂度要求O(log(m+n))就应该想到使用类似二分查找的策略完成此题。具体代码以后奉上:)

---
*请看[这里](https://leetcode.com/submissions/detail/22540657/)*
