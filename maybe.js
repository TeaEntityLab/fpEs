function isNull(ref) {
  return ref === undefined || ref === null
}
function isMaybe(m) {
  return m instanceof MaybeDef
}
function isNone(m) {
  return m === None
}

class MaybeDef {
  constructor(ref) {
    this.ref = ref
  }
  of(ref) {
    if (isNull(ref) || isNone(ref)) {
      return None
    }

    var m = new MaybeDef(ref)
    return m
  }
  fromFalsy(ref) {
    return ref ? this.of(ref) : None
  }
  fromPredicate(predicate, value) {
    if (arguments.length > 1) {
      return predicate(value) ? this.of(value) : None
    }

    return (x) => this.fromPredicate(predicate, x)
  }

  isNull() {
    //   return isNull(this.ref)
    return false
  }
  isPresent() {
    // return !this.isNull()
    return true
  }
  unwrap() {
    return this.ref
  }
  toString() {
    // return `Maybe(${JSON.stringify(this.ref)})`
    return `Some(${JSON.stringify(this.ref)})`
  }
  toList() {
    return [this.ref]
  }
  empty() {
    return None
  }
  zero() {
    return None
  }

  or(ref) {
    // return this.isNull() ? this.of(ref) : this
    return this
  }
  orDo(fn) {
    // if (this.isNull()) {
    //   // return this.then(fn);
    //   // NOTE: It's expectable: null cases
    //   return this.of(fn());
    // }
    return this
  }
  letDo(fn) {
    // if (this.isPresent()) {
    //   return this.then(fn);
    // }
    // return this
    return this.then(fn)
  }

  then(fn) {
    return this.of(this.flatMap(fn))
  }
  flatMap(fn) {
    return fn(this.ref)
  }
  join() {
    let ref = this.ref
    if (isMaybe(ref)) {
      return ref.join()
    }

    return this
  }
  reduce(reducer, initVal) {
    return reducer(initVal, this.ref)
  }
  filter(predicate) {
    return predicate(this.ref) ? this.of(this.ref) : None
  }
  ap(fnM) {
    return fnM.chain(f => this.map(f))
  }
  chainRec (f, i) {
    let result
    let x = i
    do {
      result = f((x) => {return {value: x, done: false}}, (x) => {return {value: x, done: true}}, x).unwrap()
      x = result.value
    } while (!result.done)
    return this.of(result.value)
  }
  equals(m) {
    return isMaybe(m) && m.unwrap() === this.ref
  }

  ['fantasy-land/of'](value) {
    return this.of(value)
  }
  ['fantasy-land/empty']() {
    return this.empty()
  }
  ['fantasy-land/zero']() {
    return this.zero()
  }
  ['fantasy-land/extract']() {
    return this.extract()
  }
  ['fantasy-land/equals']() {
    return this.equals(...arguments)
  }
  ['fantasy-land/map']() {
    return this.map(...arguments)
  }
  ['fantasy-land/ap']() {
    return this.ap(...arguments)
  }
  ['fantasy-land/alt']() {
    return this.alt(...arguments)
  }
  ['fantasy-land/chain']() {
    return this.chain(...arguments)
  }
  ['fantasy-land/join']() {
    return this.join(...arguments)
  }
  ['fantasy-land/extend']() {
    return this.extend(...arguments)
  }
  ['fantasy-land/reduce']() {
    return this.reduce(...arguments)
  }
  ['fantasy-land/filter']() {
    return this.filter(...arguments)
  }
}

// Expectable cases of Null
var None = Object.assign(new MaybeDef(), {
  isNull: function() {
    return true
  },
  isPresent: function() {
    return false
  },
  unwrap: function() {
    return null
  },
  toString: function() {
    return 'None'
  },
  toList: function() {
    return []
  },

  or: function(ref) {
    return this.of(ref)
  },
  orDo: function(fn) {
    return this.of(fn())
  },
  letDo: function(fn) {
    return this
  },

  join: function() {
    return None
  },
  reduce: function(reducer, initVal) {
    return initVal
  },
  filter: function() {
    return None
  },
  ap: function(fnM) {
    return None
  },
  equals: function(m) {
    return isNone(m)
  },
})

// Prevent avoiding aliases in case of leaking.
MaybeDef.prototype.just = MaybeDef.prototype.of;
MaybeDef.prototype.chain = MaybeDef.prototype.flatMap;
MaybeDef.prototype.bind = MaybeDef.prototype.then;
MaybeDef.prototype.map = MaybeDef.prototype.then;

// [MaybeDef].forEach((classInstance) => {
//   classInstance.prototype.alt = classInstance.prototype.or
//   classInstance.prototype.extend = classInstance.prototype.letDo
//   classInstance.prototype.extract = classInstance.prototype.unwrap
// })
// NOTE: There's only one class for speed-up purposes (ES5 code-gen & .js file size)
MaybeDef.prototype.alt = MaybeDef.prototype.or
MaybeDef.prototype.extend = MaybeDef.prototype.letDo
MaybeDef.prototype.extract = MaybeDef.prototype.unwrap


var Maybe = new MaybeDef({})

module.exports = Maybe
