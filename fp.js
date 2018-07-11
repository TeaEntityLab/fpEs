const reuseables = require("./_helpers/reusables");

function compose(...fns) {
  return fns.reduce(function (f, g) {return function (...args) {return f(g(...args))}})
};
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

function contains (list, value){
  if (arguments.length == 1) {
    // Manually currying
    value = list;
    return (list) => contains(list, value);
  }

  return list.reduce((accum, currentValue)=>{
    return accum ? true : currentValue === value;
  }, false)
}

function difference(...values) {
  let {main, follower} = reuseables.getMainAndFollower(values);

  let concatWithoutDuplicate = [...new Set(main.concat(follower))];

  return Array.prototype.slice.call(concatWithoutDuplicate, main.length, concatWithoutDuplicate.length)
}

function differenceWithDup (...values) {
  let {main, follower} = reuseables.getMainAndFollower(values);

  return follower.filter(x=> {
    return !(contains(main,x));
  })
}

function zip(...list) {
  let result = [];
    for(let i=0; i<list[0].length; i++)
      result[i] = list.map(x=>x[i]);
  return result;
}

var reduce = curry(function (f, init, ...second) {
  // console.log(arguments);
  var list;
  if (arguments.length < 3) {
    if (Array.isArray(init)) {
      // Simple reduce
      return init.reduce(f);
    } else {
      // Pass this round, currying it (manual currying)
      return function (list) {return reduce(f, init, list)}
    }
  } else {
    list = second[0];
  };
  return list.reduce(f, init)
});
var foldl = curry(function (f, init, list) {return list.reduce(f, init)});
function flatten(list) {
  return list.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}
var map = curry(function (f, list) {return list.map(f)});
var reverse = function (list) {return typeof list === 'string' ? list.split('').reverse().join('') : Array.prototype.slice.call(list, 0).reverse()};
var prop = curry(function (prop, obj) {return obj[prop]});
var ifelse = curry(function(test, elsef, f) {return test() ? f() : elsef()});

function concat(list,...values) {
  if (values.length == 0) {
    // Manually curry it.
    return function (...values) {return concat(list,...values)}
  }
  let lastValue = values[values.length-1];
  if(typeof lastValue === "function") {
    let excludeLast = values.slice(0,values.length-1);
    return (excludeLast
            .reduce((prev,next)=>(prev.concat(next)),list))
            .filter(lastValue);
  }
  return values.reduce((prev,next)=>(prev.concat(next)),list);
}

module.exports = {
  compose : compose,
  pipe: function (...fns) {return compose(...fns.reverse())},

  curry,
  chunk: curry(function (list, chunk_size) {return Array(Math.ceil(list.length / chunk_size)).fill().map(function (_, index) {return index * chunk_size}).map(function (begin) {return Array.prototype.slice.call(list, begin, begin + chunk_size)})}),
  range: function(n) {
    return Array.apply(null,Array(n)).map(function (x,i) {return i})
  },
  snooze: ms => new Promise(resolve => setTimeout(resolve, ms)),
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

  map,
  reduce,
  foldl,
  foldr: curry(function (f, init, list) {return list.reduceRight(f, init)}),
  filter: curry(function (f, list) {return list.filter(f)}),
  flattenMap: curry(function (f, list) {return compose(flatten, map)(f, list)}),

  ifelse,
  unary: curry(function (f, arg) {return f(arg)}),
  not: curry(function (f, ...args) {return !f(...args)}),
  spread: curry(function (f, args) {return f(...args)}),
  gather: curry(function (f, ...args) {return f(args)}),
  partial: curry(function (f, ...presetArgs) {return function (...laterArgs) {return f(...presetArgs, ...laterArgs)}}),
  partialRight: curry(function (f, ...presetArgs) {return function (...laterArgs) {return f(...laterArgs, ...presetArgs)}}),
  partialProps: curry(function(f,presetArgsObj, laterArgsObj) {return f(Object.assign( {}, presetArgsObj, laterArgsObj))}),
  when: curry(function(test, f) {return ifelse(test, function(){return undefined}, f)}),
  trampoline: function (f) {
    return function (...args){
        var result = f( ...args )
        while (typeof result === "function") {
            result = result()
        }
        return result
    }
  },

  flatten,
  reverse,
  unique: function (list) {return list.filter(function (val, i, list) {return list.indexOf(val) === i})},
  tail: function (list) {return list.length > 0 ? Array.prototype.slice.call(list, 1) : list},
  shift: function (list) {return Array.prototype.slice.call(list, 0).shift()},
  take: curry(function take(n, list) {
    if (n > 0 && list.length > 0) {
      var val = list.shift();
      return [].concat(val, take(n - 1, Array.prototype.slice.call(list, 0)))
    }
    return [];
  }),

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

    return function() {
      var args = Array.prototype.slice.call(arguments);

      if (args in memo) {
        return memo[args];
      }
      return (memo[args] = fn.apply(this, args));
    };
  },
  clone: function (obj) {
    if (obj === undefined || obj === NaN) {
      return obj;
    }
    return JSON.parse(JSON.stringify(obj))
  },

  /**
   * Returns truthy values from an array.
   * When typ is supplied, returns new array of specified type
   */
  compact: function compact(list,typ) {
    if(arguments.length === 1) {
      if (Array.isArray(list)) {
        // if the only one param is an array
        return list.filter(x=>x);
      } else {
        // Curry it manually
        typ = list;
        return function (list) {return compact(list, typ)};
      }
    }
    return list.filter(x=> typeof x === typeof typ);
  },
  /**
   * Concats arrays.
   * Concats arrays using provided function
   */
  concat: concat,
  /**
   * Returns true if value specified in present in array.
   * @param list {Array} array to be looped
   * @param value array to check for in array
   * @returns boolean
   */
  contains: contains,
  /**
   * Compares two arrays, first one as main and second
      as follower. Returns values in follower that aren't in main
      excluding duplicate values in follower
   * @param 1st Any number of individual arrays
   * @param 2nd {number} Position number of array to be used as main
   * @param 3rd {number} Position number of to be used as follower
   * @return {Array} of values in follower but not in main without duplicate
   */
  difference: difference,
  /**
   * Compares two arrays, first one as main and second
      as follower. Returns values in follower that aren't in main
      including duplicate values in follower.
   * @param 1st Any number of individual arrays
   * @param 2nd {number} Position number of array to be used as main
   * @param 3rd {number} Position number of to be used as follower
   * @return {Array} of values in follower but not in main including duplicate
   */
  differenceWithDup: differenceWithDup,
  /**
   * Drops specified number of values from array either through left or right.
   * Uses passed in function to filter remaining array after values dropped.
   * Default dropCount = 1
   */
  drop: function drop(list,dropCount=1,direction="left",fn=null) {

    // If the first argument is not kind of `array`-like.
    if (!(list && Array.isArray(list))) {
      // Manually currying
      let args = arguments;
      return (list) => drop(list, ...args);
    }

    if(dropCount === 0 && !fn) {
      return Array.prototype.slice.call(list, 0)
    };

    if(arguments.length === 1 || direction === "left") {
      if (!fn) {
        return Array.prototype.slice.call(list, +dropCount);
      }

      return (Array.prototype.slice.call(list, +dropCount)).filter(x=>fn(x));
    }
    if(direction === "right"){
      if(!fn) {
        return Array.prototype.slice.call(list, 0, list.length-(+dropCount));
      }
      if(dropCount === 0) {return (Array.prototype.slice.call(list, 0)).filter(x=>fn(x))};

      return (Array.prototype.slice.call(list, 0, list.length-(+dropCount))).filter(x=>fn(x));
    }
  },
  /**
   * Fills array using specified values.
   * Can optionally pass in start and index of array to fill.
   * Default startIndex = 0. Default endIndex = length of array.
   */
  fill: function fill(list, value, startIndex=0, endIndex=list.length){
    if (!(list && Array.isArray(list))) {
      // Manually currying
      let args = arguments;
      return (list) => fill(list, ...args);
    }

    return Array(...list).map((x,i)=> {
      if(i>= startIndex && i <= endIndex) {
        return x=value;
      } else {
        return x;
      }
    });
  },
  /**
   * Returns first element for which function
      returns true
   */
  find: curry(function(fn, list){
    let entry = reuseables.findArrayEntry(fn, list);
    if (entry) {
      return entry[1];
    }
  }),
  /**
   * Returns index of first element for which function
      returns true
   */
  findIndex: curry(function(fn, list){
    let entry = reuseables.findArrayEntry(fn, list);
    if (entry) {
      return entry[0];
    }

    return -1;
  }),
  /**
   * Returns last element for which function
      returns true
   */
  findLast: curry(function(fn, list){
    let entry = reuseables.findLastArrayEntry(fn, list);
    if (entry) {
      return entry[1];
    }
  }),
  /**
   * Returns index of last element for which function
      returns true
   */
  findLastIndex: curry(function(fn, list){
    let entry = reuseables.findLastArrayEntry(fn, list);
    if (entry) {
      return entry[0];
    }

    return -1;
  }),
  /**
   * Returns the first element of an array.
   * Returns an empty array when an empty is empty
   */
  head: function(list) {
    return list.length == 0 ? [] : list[0];
  },
  /**
   * Constructs an object out of key-value pairs arrays.
   */
  fromPairs: function(list) {
    let obj = {};
    list.forEach(x=> obj[x[0]] = x[1]);
    return obj;
  },
  /**
   * Returns all elements of an array but the last
   */
  initial: function(list) {
    return Array.prototype.slice.call(list, 0, list.length-1);
  },
  /**
   * Returns values in two comparing arrays without repetition.
   * Arrangement of resulting array is determined by main array.
   * @param 1st Any number of individual arrays
   * @param 2nd {number} Position number of array to be used as main
   * @param 3rd {number} Position number of to be used as follower
   * @returns values found in both arrays
   */
  intersection: function (...values) {
    let list = [];
    let {main, follower} = reuseables.getMainAndFollower(values);

    main.forEach(x=>{
      if(list.indexOf(x) ==-1) {
        if(follower.indexOf(x) >=0) {
          if(list[x] ==undefined) list.push(x) }
      }
    })
    return list;
  },
  /**
   * Converts array elements to string joined by specified joiner.
   * @param joiner Joins array elements
   * @param values different individual arrays
   */
  join : function join(joiner, ...values) {
    if (values.length > 0) {
      return concat([],...values).join(joiner);
    }

    // Manually currying
    return (...values) => join(joiner, ...values);
  },
  /**
   * Returns the nth value at the specified index.
   * If index is negative, it returns value starting from the right
   * @param list the array to be operated on
   * @param indexNum the index number of the value to be retrieved
   */
  nth: function nth(list, indexNum) {
    if (arguments.length == 1) {
      // Manually currying
      indexNum = list;
      return (list) => nth(list, indexNum);
    }

    if(indexNum >= 0) {
      return list[+indexNum]
    };
    return [...list].reverse()[list.length+indexNum];
  },
  pull: function pull(list, ...values){
    if ( !(list && Array.isArray(list)) ) {
      // Manually currying
      let args = arguments;
      return (list) => pull(list, ...args);
    }

    return differenceWithDup(values, list);
  },
  /**
   * Returns the lowest index number of a value if it is to be added to an array.
   * @param list {Array} array that value will be added to
   * @param value value to evaluate
   * @param valueIndex {string} accepts either 'first' or 'last'.
   *  Specifies either to return the first or last index if the value is to be added to the array.
   * Default is 'first'
   * @returns {number}
   */
  sortedIndex: function sortedIndex(list, value, valueIndex) {
    if (!(list && Array.isArray(list))) {
      // Manually currying
      let args = arguments;
      return (list) => sortedIndex(list, ...args);
    }

    return reuseables.sorter(list, value, valueIndex);
  },
  /**
   * Returns sorted array without duplicates
   * @param list {Array} array to be sorted
   * @returns {Array} sorted array
   */
  sortedUniq: function(list){
    const listNoDuplicate = difference([],list);
    if(typeof list[0] == "number") {
      return listNoDuplicate.sort((a,b)=>a-b);
    }

    return listNoDuplicate.sort();
  },
  /**
   * Returns unified array with or without duplicates.
   * @param list1 {Array} first array
   * @param list2 {Array} second array
   * @param duplicate {boolean} boolean to include duplicates
   * @returns {Array} array with/without duplicates
   */
  union: function union(list1, list2, duplicate=false) {
    if ( arguments.length < 2 ) {
      // Manually currying
      let args1 = arguments;

      return (...args2) => union(...args1, ...args2);
    } else if (arguments.length === 2 && (! Array.isArray(list2))) {
      // curring union(_, list, duplicate) cases
      // Manually currying
      let args = arguments;
      return (list) => union(list, ...args);
    }

    if(duplicate) {
      return differenceWithDup([],list1.concat(list2));
    }
    return difference([],list1.concat(list2));
  },
  /**
   * Returns an array of arrays of merged values of corresponding indexes.
   * @param list {Array} arrays to be merged.
   */
  zip: zip,
  /**
   * Returns array of arrays the first of which contains all of the first elements in the input arrays, 
      the second of which contains all of the second elements, and so on.
      @param list {Array} Array of grouped elements to be processed.
   */
  unzip: (list)=> zip(...list)
};
