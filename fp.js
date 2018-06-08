function curry(fn) {
  return function (...xs) {
    if (xs.length === 0) {
      throw Error('EMPTY INVOCATION');
    }
    if (xs.length >= fn.length) {
      return fn(...xs);
    }
    return curry(fn.bind(null, ...xs));
  };
}
var prop = curry(function (prop, obj) {return obj[prop]});

module.exports = {
  compose: function (...fns) {
    return fns.reduce(function (f, g) {return function (...args) {return f(g(...args))}})
  },
  pipe: function (...fns) {return compose(...fns.reverse())},

  curry,
  chunk: curry(function (array, chunk_size) {return Array(Math.ceil(array.length / chunk_size)).fill().map(function (_, index) {return index * chunk_size}).map(function (begin) {return array.slice(begin, begin + chunk_size)})}),
  range: function(n) {
    return Array.apply(null,Array(n)).map(function (x,i) {return i})
  },
  debounce: curry(function (fn, timeout) {
    var ref = setTimeout(fn, timeout)
    return {
      ref,
      cancel: function () {return clearTimeout(ref)},
    }
  }),
  schedule: curry(function (fn, interval) {
    var ref = setInterval(fn, interval)
    return {
      ref,
      cancel: function () {return clearInterval(ref)},
    }
  }),

  map: curry(function (f, list) {return list.map(f)}),
  reduce: curry(function (f, list) {return list.length > 0 ? list.reduce(f) : undefined}),
  filter: curry(function (f, list) {return list.filter(f)}),

  flatten: function flatten(list) {
    return list.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
  },
  unique: function (list) {return list.filter(function (v, i, a) {return a.indexOf(v) === i})},
  tail: function (list) {return list.length > 0 ? list.slice(1) : list},
  reverse: function (list) {return list.reverse()},
  shift: function (list) {return list.shift()},

  prop,
  propEq: curry(function (val, p, obj) {return prop(p)(obj) === val}),
  get: curry(function (obj, p) {return prop(p, obj)}),
  matches: curry(function (rule, obj) {
    for(var k in rule) {
      if ((!obj.hasOwnProperty(k))||obj[k]!==rule[k]) {return false}
    }
    return true;
  }),
  memoize: function (fn) {
    var memo = {};
    var slice = Array.prototype.slice;

    return function() {
      var args = slice.call(arguments);

      if (args in memo) {
        return memo[args];
      }
      return (memo[args] = fn.apply(this, args));
    };
  },
  clone: function (obj) {
    if (! obj) {
      return obj;
    }
    return JSON.parse(JSON.stringify(obj))
  },
};
