---
title: cplusplus.com系列之C++11新特性：可变参数模板
category: knowledge
tags: cpp
---

* 目录
{:toc #markdown-toc}

## 介绍
在C++11之前，当实现函数对象（functor）和tuple，使用模板有诸多限制。使用早期标准实现这些东西除了需要预处理元编程（preprocessor metaprogramming）以外，还需要多次重复类似的代码。而有了可变参数模板（variadic templates），使用模板更容易，更清晰，也更节省内存。

### 什么是可变参数模板
可变参数模板是可以携带任意数量、任意类型参数的模板。类和函数都可以是可变参数的。下面是可变参数类模板：

    template<typename... Arguments>
    class VariadicTemplate;

以下几种实例化该类型模板的方式都是正确的：

    VariadicTemplate<double, float> instance;
    VariadicTemplate<bool, unsigned short int, long> instance;
    VariadicTemplate<char, std::vector<int>, std::string, std::string, std::vector<long long>> instance;

可变参数模板参数数量可以为零，例如下面的定义方式也是合法的C++11语法：

    VariadicTemplate<> instance;

但是，如果你像下面这样定义类模板：

    template<typename T, typename... Arguments>
    class VariadicTemplate;

那么你需要至少设置一个类型作为模板参数，除非默认类型已经被初始化，如下：

    template<typename T = int, typename... Arguments>
    class VariadicTemplate;

### 语法-省略号操作符（...）
省略号操作符用于C++中的不同上下文。它的名字来自于C中的生理机制。在给机制中，程序员可以创建带有可变数量变量的函数。可能在C/C++中使用该机制最著名的函数应该是C标准库中的printf函数：

    int printf (const char* format, ... );

省略机制同样可以用于预处理器的宏中。带有可变数量参数的宏称为可变参数宏（variadic macro）。

    #define VARIADIC_MACRO(...)

在C++中，省略操作符多了一个用法：异常处理。该操作符用在try块之后的catch块中：

    try{
        // Try block.
    }
    catch(...){
        // Catch block.
    }

在这里，省略操作符表示catch块将捕获try块抛出的任何异常。

在C++11，可变参数模板是省略操作符的另一个用法。它的工作原理类似于上面的所描述的省略机制，但更复杂一点：

    template<typename... Arguments>
    void SampleFunction(Arguments... parameters);

这是一个函数模板。可变参数模板的可变参数称为参数组（parameter packs）。这些打包组会在后面被解压到函数参数内部。例如，你创建了一个函数了之前的可变长参数函数模板：

    SampleFunction<int, int>(16, 24);

等价的函数模板会像这样：

    template<typename T, typename U>
    void SampleFunction(T param1, U param2);

### 语法-sizeof...操作符
另一个使用可变参数模板的操作符是sizeof...操作符。不像sizeof操作符可以确定一个类型的大小，sizeof...操作符可以用于确定传入可变参数模板的类型数量。如下：

    template<typename... Arguments>
    class VariadicTemplate{
    private:
        static const unsigned short int size = sizeof...(Arguments);
    };

### 语法-两个省略号操作符......
有时候写作`......`，有时候写作`... ...`，可能最清晰的方式是`...,...`。三种方式等同。

该语法可用于使用省略机制的可变参数函数模板：

    template<typename... Arguments>
    void SampleFunction(Arguments......){

    }

### 可变参数模板使用-继承和初始化列表
当涉及到类时，可变参数类模板可能用于继承和初始化列表。受益于可变参数模板，继承可以这样：

    template<typename... BaseClasses>
    class VariadicTemplate : public BaseClasses...

当我们想在构造函数中使用初始化列表调用父类的构造函数作为模板参数时，可以这样：

    template<typename... BaseClasses>
    class VariadicTemplate : public BaseClasses...{
    public:
        VariadicTemplate(BaseClasses&&... base_classes) : BaseClasses(base_classes)...{

        }
    };

我们看到，在C++11中构造函数参数列表引入了一个新的操作符-右值操作符（&&），允许右值引用，关于右值引用，请看[这篇文章](http://thbecker.net/articles/rvalue_references/section_01.html)。

### 可变参数模板使用-可变参数类模板特化
和类模板一样，可变参数类模板也可以特化。模板特化的例子：

```c++
template<typename T>
class Template{
public:
    void SampleFunction(T param){

    }
};

template<>
class Template<int>{
public:
    void SampleFunction(int param){

    }
};
```

可变参数模板的例子：

```c++
template<typename... Arguments>
class VariadicTemplate{
public:
    void SampleFunction(Arguments... params){

    }
};

template<>
class VariadicTemplate<double, int, long>{
public:
    void SampleFunction(double param1, int param2, long param3){

    }
};
```

## 结论
在C++中模板是一个强大的特性。现在有了可变参数模板，模板已经更加强大了。可变参数模板是实现delegate和tuple值得信赖的方式。而且，与C类型的省略机制不同，可变参数模板提供了一种类型安全的机制代替前者。

---
本文翻译自：[C++11 - New features - Variadic templates](http://www.cplusplus.com/articles/EhvU7k9E/)
