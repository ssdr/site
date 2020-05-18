---
title: Leetcode 3 - Longest Substring Without Repeating Characters 
category: leetcode
---

> Given a string, find the length of the longest substring without repeating characters. 
> 
> For example, the longest substring without repeating letters for "abcabcbb" is "abc", which the length is 3. 
> 
> For "bbbbb" the longest substring is "b", with the length of 1.


```cpp
// abcbcdecd
int lengthOfLongestSubstring(string s) {
    // hash存储字符的索引，初始化为-1
    int hash[256];
    memset(hash, -1, 256*sizeof(int));
    int stp = 0, len = 0;
    int maxlen = 0;
    for(int i=0;i<s.size();i++) {
        if(hash[s[i]] >= stp) {
            len = i - stp;
            if(len > maxlen) {
                maxlen = len;
            }
            // 起始位置步进到下一个位置
            stp = hash[s[i]] + 1;
        }
        // 每次更新当前字符的索引(重要)
        hash[s[i]] = i;
    }
    len = s.size() - stp;
    return maxlen>len ? maxlen : len;
}
```

---
*详见[这里](https://leetcode.com/discuss/29225/clean-c-code-by-using-hash)*
