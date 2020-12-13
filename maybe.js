function isNull(ref) {
  return ref === undefined || ref === null
}

class MaybeDef {
  constructor(ref) {
    this.ref = ref
  }

  isNull() {
    return false
  }
  isPresent() {
    return true
  }
  unwrap() {
    return this.ref
  }
  empty() {
    return None
  }
  zero() {
    return None
  }

  or(ref) {
    return this
  }
  orDo(fn) {
    return this
  }
  letDo(fn) {
    return this.then(fn)
  }

  then(fn) {
    return this.of(this.flatMap(fn))
  }
  flatMap(fn) {
    return fn(this.unwrap())
  }
  of(ref) {
    if (isNull(ref)) {
      return None
    }

    var m = new MaybeDef(ref)
    return m
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
    return m instanceof MaybeDef && m.unwrap() === this.unwrap()
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
}

// Expectable cases of Null
class NoneDef extends MaybeDef {
  isNull() {
    return true
  }
  isPresent() {
    return false
  }
  unwrap() {
    return null
  }

  or(ref) {
    return this.of(ref)
  }
  orDo(fn) {
    return this.of(fn())
  }
  letDo(fn) {
    return this
  }

  ap(fnM) {
    return None
  }
  equals(m) {
    return m instanceof MaybeDef && m.isNull()
  }
}

// Prevent avoiding aliases in case of leaking.
[MaybeDef, NoneDef].forEach((classInstance) => {
  classInstance.prototype.chain = classInstance.prototype.flatMap
  classInstance.prototype.just = classInstance.prototype.of
  classInstance.prototype.alt = classInstance.prototype.or
  classInstance.prototype.bind = classInstance.prototype.then
  classInstance.prototype.map = classInstance.prototype.then
})


var Maybe = new MaybeDef({})
var None = new NoneDef()

module.exports = Maybe
