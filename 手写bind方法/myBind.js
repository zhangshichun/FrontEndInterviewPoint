Function.prototype.myBind = function(context, ...args) {
  if (typeof this !== 'function') {
    throw new Error('Function should be callable')
  }
  const fnToBind = this
  const fnBound = function(...fnArgs) {
    return fnToBind.apply(context, args.concat(fnArgs))
  }
  const fnPro = function() {}
  if (this.prototype) {
    fnPro.prototype = this.prototype
  }
  fnBound.prototype = new fnPro()
  return fnBound
}
