const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

module.exports = class mPromise {
  constructor(fn) {
    this._resolve = res => {
      if (this.state !== PENDING) {
        return
      }
      setTimeout(() => {
        this.state = RESOLVED
        this.thenMethod && this.thenMethod(res)
      }, 0)
    }
    this.then = (onFulfilled, onRejected) => {
      this.onRejected = onRejected
      return new mPromise((resolve, reject) => {
        this.thenMethod = res => {
          if (onFulfilled instanceof Function) {
            try {
              const onFulfilledRes = onFulfilled(res)
              if (onFulfilledRes instanceof mPromise) {
                onFulfilledRes.then(
                  res => {
                    resolve(res)
                  },
                  () => {}
                )
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
      if (this.onRejected) {
        this.onRejected(err)
        return
      }
      this.onException && this.onException(err)
    }
    this.catch = onException => {
      this.onException = onException
    }
    this.state = PENDING
    fn(this._resolve, this._reject)
  }
  static resolve(value) {
    if (value instanceof mPromise) {
      return mPromise
    }
    return new mPromise((resolve, reject) => {
      resolve(value)
    })
  }
  static reject(value) {
    if (value instanceof mPromise) {
      return mPromise
    }
    return new mPromise((resolve, reject) => {
      reject(value)
    })
  }
  /**
   * @param {Iterator} promiseArr
   * @returns {mPromise}
   * @description
   * 1. 首先解释下入参，大多数情况下Promise.all的入参是一个数组，数组的每个元素都是Promise实例，
   * 但实际上入参允许是具备Iterator接口的对象，但返回的每个成员都必须是Promise实例
   * 2. 其原则为， Iterator接口的每个成员， 状态都为fulfilled时， 返回的Promise实例变为fulfilled状态，且
   * resolve方法入参为一个数组，数组的元素为每个Promise实例的返回值。
   * 3. 方法返回的Promise实例的.catch方法， 会抛出Iterator接口中， 第一个变为rejected状态的异常值。
   */
  static all(promiseArr) {
    // 先将遍历体转换为数组，然后将非promise元素转换为Promis实例
    const mPromiseArr = Array.from(promiseArr).map(item => {
      if (item instanceof mPromise) {
        return item
      }
      return mPromise.resolve(item)
    })
    return new mPromise((resolve, reject) => {
      let count = 0
      let totle = promiseArr.length
      const resArr = new Array(totle)
      mPromiseArr.forEach((item, index) => {
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
}
