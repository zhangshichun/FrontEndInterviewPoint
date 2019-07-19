const MyPromise = require('./MyPromise')

const mPromise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})
mPromise
  .then(res => {
    console.log('2', mPromise)
    return new MyPromise((resolve, reject) => {
      resolve('hehe')
    })
  })
  .then(res => {
    console.log('xixi', res)
  })
console.log('1', mPromise)
