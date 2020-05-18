---
title: 算法：寻找最长回文子串 - 第一部分
category: algorithm
---

> 给定字符串S，在S中找出其最长回文子串。

这个有趣的问题曾出现在Greplin编程挑战上，并且也经常在面试中被问到。为什么？因为这个问题有多种解决方法。据我所知就有五种方法，你准备挑战了嘛？

**常犯的错误**

有的人试图这样快速解决问题，这是一种错误的做法：反转S变为S'，找出S和S‘之间最长公共子串，那就是最长的回文子串。

这看上去是这么回事儿，让我来举个栗子。

比如，S=“caba”，S'="abac"，两个字符串的最长公共子串是“aba”，这是正确答案。

再看另一个例子。S="abacdfgdcaba"，S'=“abacdgfdcaba”，两个字符串的公共子串是“abacd”.很明显这不是一个回文串。

我们看到这种情况下最长公共子串的方法失效了。我们可以这样修改，每次我们找到一个最长公共子串，都检查一下是否子串的索引和反转子串的原始索引相同。如果相同，更新当前找到的最长回文串；否则，继续寻找下一个最长公共子串。

这是时间复杂度为O(N\*N)的DP解决方案，使用O(N\*N)的空间（可以优化成O(N)）。

### 暴力法 O(N\*N\*N)
暴力法穷举子串所有可能的起止位置，然后验证它是否为回文。这样的子串共有C(N,2)种。

因为验证每个子串的时间复杂度是O(N)，所以该方法的时间复杂度是O(N\*N\*N)。

### 动态规划 O(N\*N)时间+O(N\*N)空间
为了从动态规划的方法的角度改进暴力法，我们首先思考一下如何避免重复验证回文有效性的计算。比如，对于字符串"ababa"，如果我们知道了"bab"是回文，那么如果最左边和最右边的字母相同，那必定"ababa"是回文。

以下是更一般的表述：

    定义P[i,j] <- true 如果Si ... Sj是回文，否则false

那么，

    P[i,j] <- (P[i+1, j-1] and Si=Sj)

更一般的情况是：

    P[i,i] <- true
    P[i,i+1] <- (Si=Si+1)

这就是动态规划，我们先初始化一个和两个字符的回文，然后进而计算出所有三个字符的回文，以此类推。

```c++
string longestPalindromeDP(string s) {
  int n = s.length();
  int longestBegin = 0;
  int maxLen = 1;
  bool table[1000][1000] = {false};
  for (int i = 0; i < n; i++) {
    table[i][i] = true;
  }
  for (int i = 0; i < n-1; i++) {
    if (s[i] == s[i+1]) {
      table[i][i+1] = true;
      longestBegin = i;
      maxLen = 2;
    }
  }
  for (int len = 3; len <= n; len++) {
    for (int i = 0; i < n-len+1; i++) {
      int j = i+len-1;
      if (s[i] == s[j] && table[i+1][j-1]) {
        table[i][j] = true;
        longestBegin = i;
        maxLen = len;
      }
    }
  }
  return s.substr(longestBegin, maxLen);
}
```

### 更简单的方法 O(N\*N)时间+O(N)空间
我们知道，回文是中心对称的。因此，回文可以从中间展开，共有2N-1种中心。

你可能会问为什么是2N-1不是N？因为回文中心可以在两个字母中间。这种回文有偶数个字符，比如"abba"，它的中心在两个b之间。

因为从中心展开回文的时间复杂度是O(N)，所以总耗时O(N\*N)。

```c++
string expandAroundCenter(string s, int c1, int c2) {
  int l = c1, r = c2;
  int n = s.length();
  while (l >= 0 && r <= n-1 && s[l] == s[r]) {
    l--;
    r++;
  }
  return s.substr(l+1, r-l-1);
}

string longestPalindromeSimple(string s) {
  int n = s.length();
  if (n == 0) return "";
  string longest = s.substr(0, 1);  // a single char itself is a palindrome
  for (int i = 0; i < n-1; i++) {
    string p1 = expandAroundCenter(s, i, i);
    if (p1.length() > longest.length())
      longest = p1;

    string p2 = expandAroundCenter(s, i, i+1);
    if (p2.length() > longest.length())
      longest = p2;
  }
  return longest;
}
```

---

有没有O(N)的解决方案？肯定有，只不过就不那么简单了。O(N)的解决方案将在下一篇博客中解释。

---

*本文翻译自[这里](http://articles.leetcode.com/2011/11/longest-palindromic-substring-part-i.html)*
