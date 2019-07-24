# parseInt 陷阱

## 从一道面试题说起

前端圈内流传着一道非常经典，但是非常容易踩坑的面试题。如下：

```
["1", "2", "3"].map(parseInt)

// A. ["1", "2", "3"]
// B. [1, 2, 3]
// C. [0, 1, 2]
// D. other
```

请问，你认为表达式的返回值会是神马？  
相信大多数人的第一反应便是应该选 B。  
但正如你所料，选 B 是不对的。  
答案是 D。  
真正的产出是： [1, NaN, NaN]

```
["1", "2", "3"].map(parseInt)

// [1, NaN, NaN]
```

到这里，许多人都会问出心中不解的疑惑:为什么呢？

## map 方法

Array.prototype.map 函数是大家常用的一个方法，具体用法在本文就不详细展开了，有兴趣的可以参考[mdn 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map)

> map() 方法创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果。

在本题中需要注意的是，它提供给函数的不是 1 个入参，而是 3 个。

```
["1", "2", "3"].map((item, index, arr) => {...})
```

这一点至关重用。
item: 也就是数组中的"1", "2", "3"
index: 当前遍历数组的下标，0, 1, 2
arr: 数组的引用["1", "2", "3"](在本题中不重要)

## parseInt 方法

parseInt 也是大家编程过程中常用的方法，常见于将字符串、浮点数转换成整型的数。

```
parseInt("1") // 1
parseInt(1.3) // 1
```

但实际上，该方法的入参是有两个的。
让我们看看 mdn 上的文档。[文档地址]（https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/parseInt）

> parseInt(string, radix) string 为字符串，radix 为介于 2-36 之间的数。使用者告诉这个函数 string（比如 11）是 radix（比如 2）进制的，函数将固定返回 string 以十进制时显示的数（3）
> 以下是例子：

```
parseInt(10, 0) // 10，因为不存在0进制，因此仍然会作为默认值10进制处理
parseInt(10, 1) // NaN, 10 超出了1进制的范畴，所以此处返回NaN
parseInt(10, 2) // 2众所周知，在2进制中，10是2
parseInt(10, 3) // 3
……
```

知道了这一点，结合 map 方法的用法，我们便可以快速整理出本题的解题思路，答案如下：

```
[parseInt("1", 0), parseInt("2", 1), parseInt("3", 2)]

parseInt("1", 0) // 1, 因为不存在0进制，因此仍然会作为默认值10进制处理
parseInt("2", 1) // NaN, 2超出了1进制的范畴
parseInt("3", 2) // NaN, 3超出了2进制的范畴
```

## parseInt 方法的一些拓展和细节

以下例子均返回 15:

```
parseInt("0xF", 16);
parseInt("F", 16);
parseInt("17", 8);
parseInt(021, 8);
parseInt("015", 10);   // parseInt(015, 10); 返回 15
parseInt(15.99, 10);
parseInt("15,123", 10);
parseInt("FXX123", 16);
parseInt("1111", 2);
parseInt("15 * 3", 10);
parseInt("15e2", 10);
parseInt("15px", 10);
parseInt("12", 13);
```

以下例子均返回 NaN:

```
parseInt("Hello", 8); // 根本就不是数值
parseInt("546", 2);   // 除了“0、1”外，其它数字都不是有效二进制数字
```

以下例子均返回 -15：

```
parseInt("-F", 16);
parseInt("-0F", 16);
parseInt("-0XF", 16);
parseInt(-15.1, 10);
parseInt(" -17", 8);
parseInt(" -15", 10);
parseInt("-1111", 2);
parseInt("-15e1", 10);
parseInt("-12", 13);
```

下例中全部返回 4:

```
parseInt(4.7, 10);
parseInt(4.7 * 1e22, 10); // 非常大的数值变成 4
parseInt(0.00000000000434, 10); // 非常小的数值变成 4
```

下面的例子返回 224:

```
parseInt("0e0",16);
```

## 总结

关于 parseInt 的陷阱，本期就介绍到这里。  
欢迎访问我的 github，并给我一颗爱的小星星~
