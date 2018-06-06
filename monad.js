class MonadDef {
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
    return this.isPresent() ? this : new MonadDef(ref);
  }
  letDo(fn) {
    if (this.isPresent()) {
      fn();
    }
  }

  then(fn) {
    return new MonadDef(fn(this.ref));
  }
  flatMap(fn) {
    return this.then(fn);
  }

  unwrap() {
    return this.ref;
  }
}

var Monad = {};
Monad.just = function (ref) {
  var m = new MonadDef(ref);
  return m;
};
Monad.of = Monad.just;

module.exports = Monad;
