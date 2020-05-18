---
title: Leetcode 153 - Find Minimum in Rotated Sorted Array
category: leetcode
---

> Suppose a sorted array is rotated at some pivot unknown to you beforehand.
>
> (i.e., 0 1 2 4 5 6 7 might become 4 5 6 7 0 1 2).
>
> Find the minimum element.
>
> You may assume no duplicate exists in the array.

## 递归二分比较

```cpp
int findMin(vector<int> &num) {
        // 找最小的元素最简单可以在O(n)时间复杂度找到
        // 但应该可以用O(logn)时间找到
        return findmin(num, 0, num.size()-1);
    }
    
    int findmin(vector<int> &num, int s, int e) {
        if(num[s]<=num[e]) return num[s];
        else if(e-s == 1) return num[e];
        
        int mid = (s + e) / 2;
        if(num[mid] > num[s]) { // 左边递增
            if(num[s] > num[e]) {
                return findmin(num, mid, e);
            } else {
                return num[s];
            }
        } else if(num[mid] < num[s]) { // 右边递增
            if(num[s] > num[e]) {
                return findmin(num, s, mid);
            } else {
                return num[s];
            }
        }
    }
```

---
*详见[这里](https://leetcode.com/submissions/detail/23945660/)*
