const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

module.exports = class mPromise {
  constructor(fn) {
    this._resolve = (res) => {
      if (this.state !== PENDING) {
        return
      }
      setTimeout(() => {
        this.state = RESOLVED
        this.thenMethod && this.thenMethod(res)
      }, 0)
    }
    this.then = (onFulfilled, onRejected) => {
      return new mPromise((resolve, reject) => {
        this.thenMethod = (res) => {
          if (onFulfilled instanceof Function) {
            const onFulfilledRes = onFulfilled(res)
            if (onFulfilledRes instanceof mPromise) {
              onFulfilledRes.then(res => {
                resolve(res)
              }, () => {})
            } else {
              resolve(onFulfilledRes)
            }
          }
        }
      })
    }
    this._reject = (err) => {

    }
    this.state = PENDING
    fn(this._resolve, this._reject)
  }
}