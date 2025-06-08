---
title: gtest首次实践
category: tools
tags: gtest
---

> gtest测试框架是Google的开源C++单元测试框架，是遵循 New BSD License （可用作商业用途）的开源项目。

> gtest测试框架是在不同平台上（Linux，Mac OS X，Windows，Cygwin，Windows CE和Symbian）为编写C++测试而产生的。它是基于xUnit架构的测试框架，支持自动发现测试，丰富的断言集，用户定义的断言，death测试，致命与非致命的失败，类型参数化测试，各类运行测试的选项和XML的测试报告。

> 本文简单介绍gtest测试框架的使用方法。

### 构建gtest
#### 下载源代码
    git clone https://github.com/svn2github/gtest.git

#### build
    mkdir $BUILD_DIR
    cd $BUILD_DIR
    cmake $GTEST_DIR
    make

完成以上操作后将在当前目录下生产`libgtest.a`和`libgtest_main_a`两个静态库文件。

### 使用gtest
#### 编写待测试代码
头文件foo.h

```c++
#ifndef GTEST_FOO_H_
#define GTEST_FOO_H_

int Foo(int a, int b);

#endif
```

源文件foo.cpp

```c++
#include "foo.h"

// 求两个数的最大公约数
int Foo(int a, int b)
{
    if (a == 0 || b == 0)
    {
        throw "don't do that";
    }
    int c = a % b;
    if (c == 0)
        return b;

    return Foo(b, c);
}
```

#### 编写单元测试代码
foo_utest.cpp

```c++
#include "gtest/gtest.h"
#include "foo.h"

TEST(FooTest, HandleNoneZeroInput)
{
        EXPECT_EQ(2, Foo(4, 10));
        EXPECT_EQ(6, Foo(30, 18));
}

int main(int argc, char *argv[])
{
        testing::InitGoogleTest(&argc, argv);
        return RUN_ALL_TESTS();
}
```

#### 编译代码
    g++ -c foo.cpp
    g++ -c foo_utest.cpp
    g++ -o test foo.o foo_utest.o /path/to/libgtest.a -lpthread

#### 运行代码
    ./test

结果如下

```c++
Running main() from gtest_main.cc
[==========] Running 1 test from 1 test case.
[----------] Global test environment set-up.
[----------] 1 test from FooTest
[ RUN      ] FooTest.HandleNoneZeroInput
[       OK ] FooTest.HandleNoneZeroInput (0 ms)
[----------] 1 test from FooTest (0 ms total)

[----------] Global test environment tear-down
[==========] 1 test from 1 test case ran. (0 ms total)
[  PASSED  ] 1 test.
```

#### 几点说明
你也可以在foo_utest.cpp中不给定main函数，而是用libgtest_main.a中的默认main函数，此时的最后的编译命令是这样的：

    g++ -o test foo.o foo_utest.o /path/to/libgtest_main.a /path/to/libgtest.a -lpthread

注意上面两个库的位置不能颠倒，否可会出错:(

另外，由于测试框架内部使用了多线程，所以编译时需要添加pthread库。

### 结论
总体来看，gtest用来做单元测试还是挺简单的。从前面的简单示例，我们对使用gtest进行测试的基本流程有了大概的了解。关于gtest测试框架的层次结构，简单地讲，每个基于gtest的测试过程，是可以分为多个TestSuite级别，而每个TestSuite级别又可以分为多个TestCae级别。这样分层的结构的好处，是可以针对不同的TestSuite级别或者TestCae级别设置不同的参数、事件机制等，并且可以与实际测试的各个模块层级相互对应，便于管理。gtest的几个优点：

    1. 我们的测试案例本身就是一个exe工程，编译之后可以直接运行，非常的方便。
    2. 编写测试案例变的非常简单（使用一些简单的宏如TEST），让我们将更多精力花在案例的设计和编写上。
    3. 提供了强大丰富的断言的宏，用于对各种不同检查点的检查。
    4. 提高了丰富的命令行参数对案例运行进行一系列的设置。

---
*具体参考[这里](http://www.cnblogs.com/coderzh/archive/2009/04/06/1426755.html)*
