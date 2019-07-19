# 手动实现一个 promise

## 规范

首先，让我们明确一下，我们要实现的究竟是什么？
Promise 实际上是一个规范，具体可以参考：[Promise/A+](https://promisesaplus.com/)  
而我们要做的，仅仅是实现规范而已，接下来，让我们一步一步，从易到难写出一个简单的 Promise 实现。

## STEP 1 搭建基础框架

Promise 是一个什么？
按照我们的使用惯例，这类需要使用 new 关键字来生成的，通常是一个类。

```
class MyPromise {
  constructor() {}
}
```

这样，我们有了一个最简单的 MyPromise 类。  
其次，我们要想一想，在构造函数中，我们要怎么去定义这个类，它的入参是什么，又有哪些必备的属性？  
以下是我们常用的写法：

```
new Promise((resolve, reject) => { ... })
```

由此可见，入参是一个 function,而且,这个 function 里还包含了两个入参，分别为 resolve 方法和 reject 方法。  
此外，根据规范，Promise 的实例应该具备 state(状态),value(值)和 reason(异常原因)。  
另外，它的实例还有 then()方法、catch()方法。(try 和 finally 方法的提案太新，可以暂时不实现)  
此外，它还包含四个静态方法：resolve()、reject()、all()、race()。  
知道了这些，我们就可以搭建出一个基本的框架了。

```
class MyPromise {
  constructor(fn) {
    this.state = undefined // 状态
    this.value = undefined // 值
    this.reason = undefined // 异常原因
    this.then = (callback) => {} // then 方法
    this.catch = (callback) => {} // catch方法
  }
  // 以下皆为静态方法
  static resolve(value){ }
  static reject(value){ }
  static all(promiseArr) { }
  static race(promiseArr) {}
}
```

如上，就是 MyPromise 的基本骨架了，下一节，就让我们来实现其中最核心的构造函数，以及.then 方法吧。

## STEP 2 核心：构造函数与 then 函数

首先，让我们给三个状态定义一下常量，并且初始化一下

```
const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

class MyPromise {
    constructor(fn) {
        this.state = PENDING
        ...
    }
}
```

接下来，我们需要处理一下入参 fn 的问题。  
这个方法，它还包含两个入参，并且其中的内容，是在实例化时立刻执行的，并且是同步的。请看下面的例子：

```
new Promise((resolve, reject) => {console.log(1)})
console.log(2)
// 1
// 2
```

因此，我们代码如下：

```
class MyPromise {
  constructor(fn) {
    this.state = PENDING
    this.value = undefined
    this.reason = undefined
    this._resolve = res => { }
    this._reject = err => { }
    fn(this._resolve, this._reject)
    ...
  }
  ...
}
```

此时，我们需要好好考虑一下，当入参的 fn 中，调用 resolve 方法时，都发生了什么？  
首先，实例的状态会变，从'pending'变为'resolved',实例的 value 属性会被赋值，然后，实例的.then(onFulfilled, onRejected) 中的 onFulfilled 方法会被调用，且 res 这个入参就是 resolve(x) 中返回的值 x。  
reject 时同理，不过调用的是 onRejected；
但这里有个细节需要注意。
那就是 then 方法的回调，是异步的，而状态的改变却是同步，这里我们可以写个例子看看。

```
const a = new Promise((resolve, reject) => {resolve(1)}).then(res => console.log(1, a))
console.log(2, a)
// 2 {value: 1, state: 'resolved'}
// 1 {value: 1, state: 'resolved'}
```

可以看出来，Promise 先执行了同步的内容，才执行的回调中的内容，而且在同步的 console.log(2, a)中，其 state 已经变成了'resolved'。  
而且，.then()方法实际返回的夜市一个 Promise 实例，这样才可以保证链式调用。  
因此，此处我们可以简单地实现为：

```
class MyPromise {
  constructor(fn) {
    ...
    this.then = (onFulfilled, onRejected) => {
      this.onRejected = onRejected
      return new MyPromise((resolve, reject) => {
        this.thenMethod = res => {
            // 此处先不考虑.then中返回的是Promise实例的情况
            // 将then中onFulfilled的执行内容先封装个方法存起来，后期再执行
            const onFulfilledRes = onFulfilled(res)
            resolve(onFulfilledRes)
        }
      })
    }
    this._resolve = res => {
      if (this.state !== PENDING) {
        return
      }
      this.value = res
      this.state = RESOLVED
      setTimeout(() => {
        // 异步地执行.then中被保存起来的，onFulfilledRes的内容
        this.thenMethod && this.thenMethod(res)
      }, 0)
    }
  }
}
```

这样，一个最简单的 Promise 的核心就出来了。  
再加上异常处理和捕获，主体部分就能完成撰写：

```
const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

class MyPromise {
  constructor(fn) {
    this.state = PENDING
    this.value = undefined
    this.reason = undefined

    this._resolve = res => {
      if (this.state !== PENDING) {
        return
      }
      setTimeout(() => {
        this.value = res
        this.state = RESOLVED
        this.thenMethod && this.thenMethod(res)
      }, 0)
    }
    this.then = (onFulfilled, onRejected) => {
      this.onRejected = onRejected
      return new MyPromise((resolve, reject) => {
        this.thenMethod = res => {
          if (onFulfilled instanceof Function) {
            try {
              const onFulfilledRes = onFulfilled(res)
              if (onFulfilledRes instanceof MyPromise) {
                onFulfilledRes.then(res => {
                  resolve(res)
                })
              } else {
                resolve(onFulfilledRes)
              }
            } catch (err) {
              reject(err)
            }
          }
        }
      })
    }
    this._reject = err => {
      this.state = REJECTED
      this.reason = err
      if (this.onRejected) {
        this.onRejected(err)
        return
      }
      this.onException && this.onException(err)
    }
    this.catch = onException => {
      this.onException = onException
    }
    fn(this._resolve, this._reject)
  }
}
```

## STEP 3 收汁，几个简单的静态方法

众所周知，es6 的 class 标准，是允许定义静态方法的，如下：

```
class A {
static sayHello(){console.log('hello')}
}

A.sayHello()
// hello
```

静态方法不属于某个实例，而是属于这个类本身，Promise.resolve()、Promise.reject()、Promise.all()、Promise.race()  
在已经铺好了核心代码的情况下，静态方法显得如此轻松。

```
class MyPromise {
    ...
  /**
   * @param {any} value
   * @returns {MyPromise}
   */
  static resolve(value) {
    if (value instanceof MyPromise) {
      return MyPromise
    }
    return new MyPromise((resolve, reject) => {
      resolve(value)
    })
  }

  /**
   * @param {any} value
   * @returns {MyPromise}
   */
  static reject(value) {
    if (value instanceof MyPromise) {
      return MyPromise
    }
    return new MyPromise((resolve, reject) => {
      reject(value)
    })
  }

  /**
   * @param {Iterator} promiseArr
   * @returns {MyPromise}
   * @description
   * 1. 首先解释下入参，大多数情况下Promise.all的入参是一个数组，数组的每个元素都是Promise实例，
   * 但实际上入参允许是具备Iterator接口的对象，但返回的每个成员都必须是Promise实例
   * 2. 其原则为， Iterator接口的每个成员， 状态都为fulfilled时， 返回的Promise实例变为fulfilled状态，且
   * resolve方法入参为一个数组，数组的元素为每个Promise实例的返回值。
   * 3. 方法返回的Promise实例的.catch方法， 会抛出Iterator接口中， 第一个变为rejected状态的异常值。
   */
  static all(promiseArr) {
    // 先将遍历体转换为数组，然后将非promise元素转换为Promis实例
    const MyPromiseArr = Array.from(promiseArr).map(item => {
      if (item instanceof MyPromise) {
        return item
      }
      return MyPromise.resolve(item)
    })
    return new MyPromise((resolve, reject) => {
      let count = 0
      let totle = promiseArr.length
      const resArr = new Array(totle)
      MyPromiseArr.forEach((item, index) => {
        item
          .then(res => {
            resArr[index] = res
            count++
            if (count == totle) {
              resolve(resArr)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    })
  }

  /**
   * @param {Iterator} promiseArr
   * @returns {MyPromise}
   * @description
   * 1. 首先解释下入参，大多数情况下Promise.all的入参是一个数组，数组的每个元素都是Promise实例，
   * 但实际上入参允许是具备Iterator接口的对象，但返回的每个成员都必须是Promise实例;(如果不是promise,则转换成promise)
   * 2. 其原则为， Iterator接口的每个成员， 第一个状态都为fulfilled时， 返回的Promise实例变为fulfilled状态，且
   * resolve方法入参为一个数组，数组的元素为第一个Promise实例的返回值。
   * 3. 方法返回的Promise实例的.catch方法， 会抛出Iterator接口中， 第一个变为rejected状态的异常值。
   */
  static race(promiseArr) {
    const MyPromiseArr = Array.from(promiseArr).map(item => {
      if (item instanceof MyPromise) {
        return item
      }
      return MyPromise.resolve(item)
    })
    return new MyPromise((resolve, reject) => {
      MyPromiseArr.forEach(item => {
        item
          .then(res => {
            resolve(res)
          })
          .catch(err => {
            reject(err)
          })
      })
    })
  }
}
```

## 总结

好了，现在，一个完整的 Promise 就被我们手写出来了。  
完整代码已经上传了 github,感兴趣的朋友可以 down 下来看看，并且欢迎给我一颗宝贵的小星星。  
[代码地址](https://github.com/zhangshichun/FrontEndInterviewPoint/tree/master/%E6%89%8B%E5%86%99Promise)
谢谢！
