---
title: Leetcode 2 - Add Two Numbers
category: leetcode
---

> You are given two linked lists representing two non-negative numbers. The digits are stored in reverse order and each of their nodes contain a single digit. Add the two numbers and return it as a linked list.

> Input: (2 -> 4 -> 3) + (5 -> 6 -> 4)
>
> Output: 7 -> 0 -> 8

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
 // Note: The Solution object is instantiated only once and is reused by each test case.
ListNode *addTwoNumbers(ListNode *l1, ListNode *l2) {
    int add = 0;
    int carry = 0;
    int left = 0;
    int i = 0;
    ListNode *p, *q;
    ListNode *n = NULL;
    ListNode *head;
    ListNode *tmpNode;
    
    for(p=l1,q=l2; p&&q; p=p->next,q=q->next) {
        add = p->val + q->val + carry;
        carry = add / 10;
        left = add % 10;
        
        tmpNode = new ListNode(left);
        if(!n){
            n = tmpNode;
        }
        else {
            n->next = tmpNode;
            n = n->next;
        }
        if(i == 0) {
            head = n;
            i = 1;
        }
    }
    
    for(; p; p=p->next) {
        add = p->val + carry;
        carry = add / 10;
        left = add % 10;
        
        tmpNode = new ListNode(left);
        if(!n){
            n = tmpNode;
        }
        else {
            n->next = tmpNode;
            n = n->next;
        }
    }

    for(; q; q=q->next) {
        add = q->val + carry;
        carry = add / 10;
        left = add % 10;
        
        tmpNode = new ListNode(left);
        if(!n){
            n = tmpNode;
        }
        else {
            n->next = tmpNode;
            n = n->next;
        }
    }
    
    if(carry != 0) {
        tmpNode = new ListNode(carry);
        if(!n){
            n = tmpNode;
        }
        else {
            n->next = tmpNode;
            n = n->next;
        }
    }
    
    return head;
}
```

做法很朴素，主要思想就是遍历链表做运算，注意考虑进位。上面的代码效率不高主要原因是new操作的内存开销，此处可以改进，利用已有的节点。

---
*详见[这里](https://leetcode.com/submissions/detail/3008957/)*
