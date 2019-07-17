const mPromise = require('./mPromise')

new mPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})
  .then(res => {
    return new mPromise((resolve, reject) => {
      resolve('hehe')
    })
  })
  .then(res => {
    console.log('xixi', res)
  })
