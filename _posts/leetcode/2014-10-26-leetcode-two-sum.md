---
title: "Leetcode 1 - Two Sum"
description: "two sum"
category: leetcode
tags: [leetcode, cpp]
---
## Two Sum
> Given an array of integers, find two numbers such that they add up to a specific target number.
The function twoSum should return indices of the two numbers such that they add up to the target, where index1 must be less than index2. Please note that your returned answers (both index1 and index2) are not zero-based.
You may assume that each input would have exactly one solution.
Input: numbers={2, 7, 11, 15}, target=9
Output: index1=1, index2=2

### 最笨的方法
```cpp
vector<int> twoSum(vector<int> &numbers, int target) {
    vector<int> ret(2, -1);
    for(int i=0;i<numbers.size();i++)
        for(int j=i+1;j<numbers.size();j++) {
            if(target==numbers[i]+numbers[j]) {
                ret[0]=i+1;
                ret[1]=j+1;
                return ret;
            }
        }
    return ret;
}
```
很简单可惜不符合时间要求。。。
![Time Limit Exceeded](/images/post/timeup.png)
### 一种高效的方法
```cpp
vector<int> twoSum(vector<int> &numbers, int target) {
    map<int, int> m;
    vector<int> ret;
    for(int i=0;i<numbers.size();i++) {
        if(m.find(numbers[i])==m.end()) {
            m[target-numbers[i]] = i;
        } else {
            ret.push_back(m[numbers[i]]+1);
            ret.push_back(i+1);
            return ret;
        }
    }
    return ret;
}
```
通过一个map结构暂存第一个元素的位置，便于找到第二个元素时得到两个位置。

---
*详见[这里](https://leetcode.com/submissions/detail/20425200/)*
