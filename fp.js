function curry(fn) {
  return (...xs) => {
    if (xs.length === 0) {
      throw Error('EMPTY INVOCATION');
    }
    if (xs.length >= fn.length) {
      return fn(...xs);
    }
    return curry(fn.bind(null, ...xs));
  };
}

module.exports = {
  compose: function (...fns) {
    return fns.reduce((f, g) => (...args) => f(g(...args)))
  },
  curry,
};
