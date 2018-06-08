module.exports = {
  compose: function (...fns) {
    return fns.reduce((f, g) => (...args) => f(g(...args)))
  },
  curry: function curry(fn) {
    return (...xs) => {
      if (xs.length === 0) {
        throw Error('EMPTY INVOCATION');
      }
      if (xs.length >= fn.length) {
        return fn(...xs);
      }
      return curry(fn.bind(null, ...xs));
    };
  },
  chunk: (array, chunk_size) => Array(Math.ceil(array.length / chunk_size)).fill().map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size)),
  range: function(n) {
    return Array.apply(null,Array(n)).map((x,i) => i)
  },
  debounce: function(fn, timeout) {
    var ref = setTimeout(fn, timeout)
    return {
      ref,
      cancel: ()=>clearTimeout(ref),
    }
  },
  schedule: function(fn, interval) {
    var ref = setInterval(fn, interval)
    return {
      ref,
      cancel: ()=>clearInterval(ref),
    }
  },
  clone: function (obj) {
    if (! obj) {
      return obj;
    }
    return JSON.parse(JSON.stringify(obj))
  },
  reverse: function (arr) {
    return arr.reverse();
  },
};
