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
  unwrap() {
    return this.ref;
  }

  or(ref) {
    return this.isNull() ? new MaybeDef(ref) : this;
  }
  orDo(fn) {
    if (this.isNull()) {
      // return this.then(fn);
      // NOTE: It's expectable: null cases
      return this.of(fn());
    }
    return this
  }
  letDo(fn) {
    if (this.isPresent()) {
      return this.then(fn);
    }
    return this
  }

  then(fn) {
    return new MaybeDef(fn(this.unwrap()));
  }
  bind(fn) {
    return this.then(fn);
  }
  map(fn) {
    return this.then(fn);
  }
  flatMap(fn) {
    return fn(this.unwrap());
  }
  of(ref) {
    var m = new MaybeDef(ref);
    return m;
  }
  just(ref) {
    return this.of(ref);
  }
  ap(fnM) {
    return fnM.chain(f => this.map(f));
  }
  chain(fn) {
    return this.flatMap(fn);
  }
  chainRec (f, i) {
    let result;
    let x = i;
    do {
      result = f((x) => {return {value: x, done: false}}, (x) => {return {value: x, done: true}}, x).unwrap();
      x = result.value;
    } while (!result.done);
    return this.of(result.value);
  }
  equals(m) {
    return m instanceof MaybeDef && m.unwrap() === this.unwrap();
  }
}

var Maybe = new MaybeDef({});

module.exports = Maybe;
