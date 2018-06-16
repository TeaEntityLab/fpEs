class MaybeDef {
  constructor(ref) {
    this.ref = ref;
  }

  isNull() {
    return this.ref === undefined || this.ref === null;
  }
  isPresent() {
    return ! this.isNull();
  }

  or(ref) {
    return this.isPresent() ? this : new MaybeDef(ref);
  }
  letDo(fn) {
    if (this.isPresent()) {
      fn();
    }
  }

  then(fn) {
    return new MaybeDef(fn(this.ref));
  }
  bind(fn) {
    return this.then(fn);
  }
  map(fn) {
    return this.then(fn);
  }

  unwrap() {
    return this.ref;
  }
}

var Maybe = {};
Maybe.just = function (ref) {
  var m = new MaybeDef(ref);
  return m;
};
Maybe.of = Maybe.just;

module.exports = Maybe;
