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
  map: function (arr, fn) {
    return arr.map(fn);
  },
  reduce: function (arr, fn) {
    return arr.reduce(fn);
  },
  filter: function (arr, fn) {
    return arr.filter(fn);
  },
  /**
   * Returns truthy values from an array.
   * When typ is supplied, returns new array of specified type
   */
  compact: function (arr,typ) {
    if(arguments.length === 1) {
      return arr.filter(x=>x);
    } return arr.filter(x=> typeof x === typeof typ);
  },
  /**
   * Concats arrays.
   * Concats arrays using provided function
   */
  concat: function (arr,...values) {
    let lastValue = values[values.length-1];
    if(typeof lastValue === "function") {
      let excludeLast = values.slice(0,values.length-1);
      return (arr.concat(excludeLast)).filter(lastValue);
    }
    return arr.concat(values)
  },
  /**
   * Compares two arrays, first one as main and second
      as follower. Returns values in follower that aren't in main.
   */
  difference: function (...values) {
    let lastButOne = (+values[values.length-2])-1;
    let lastOne = (+values[values.length-1])-1;
  
  if(typeof (lastButOne || lastOne) != "number")
    return values;

  let main = values[lastButOne];
    let follower = values[lastOne];
  
  let concatWithoutDuplicate = [...new Set(main.concat(follower))]
  
  return concatWithoutDuplicate.slice(main.length, concatWithoutDuplicate.length)
  }
};
