# 手动实现一个 bind 方法

## bind 方法简介

在正式手写之前，你得知道 bind 方法是一个什么东西，在 MDN 上，如此介绍它：

> bind()方法创建一个新的函数，在 bind()被调用时，这个新函数的 this 被 bind 的第一个参数指定，其余的参数将作为新函数的参数供调用时使用。

[链接：点我跳转](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)  
如果你还没有看明白，不要紧，下面这个例子会向您展示它的用法：

```
const boy = {
  age: 3,
  getAge: function() {
    return this.age;
  }
}
const getAge = boy.getAge
getAge()
// undefined

const boyGetAge = getAge.bind(boy)
boyGetAge()
// 3
```

上面的例子中，getAge 方法，虽然是 boy 的 getAge 方法，但是因为它在内部调用了 this，因此在运行时，this 指向了全局对象，也就是 window，因此 window.age 是 undfined。  
但是 boyGetAge 方法，却可以让内部的 this 正确地指向 boy 对象，得到正确的 3。  
这个例子，官方是这样描述的：

> bind() 最简单的用法是创建一个函数，不论怎么调用，这个函数都有同样的 this 值。JavaScript 新手经常犯的一个错误是将一个方法从对象中拿出来，然后再调用，期望方法中的 this 是原来的对象（比如在回调中传入这个方法）。如果不做特殊处理的话，一般会丢失原来的对象。基于这个函数，用原始的对象创建一个绑定函数，巧妙地解决了这个问题：

接下来，我们看一下 bind 方法的第二个用法：偏函数。

```
function add(a, b) {
	return a + b
}

add(1,2)
// 3
// 1 + 2 = 3

const newAdd = add.bind(null, 3)
newAdd(1,2)
// 4
// 3 + 1 = 4
```

发现没？3 会取代 1 成为第一个入参，而 1 顺位到了第二个入参，2 因为成为了第三个入参而没有被调用。  
官方如此解释：

> bind()的另一个最简单的用法是使一个函数拥有预设的初始参数。只要将这些参数（如果有的话）作为 bind()的参数写在 this 后面。当绑定函数被调用时，这些参数会被插入到目标函数的参数列表的开始位置，传递给绑定函数的参数会跟在它们后面。

好，常用的用法主要就以上两点，知道了以上用法，我们就可以开始手写一个 bind 方法了。

## STEP 1 实现上下文绑定

首先，bind 是属于方法的方法，而且它返回一个方法，并不改变原有方法。因此，它需要被挂到原型链上。

```

```
