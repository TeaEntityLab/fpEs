class MonadIODef {
  constructor(effect) {
    this.effect = effect;
  }

  then(fn) {
    var self = this;
    return new MonadIODef(function () {
      return fn(self.effect());
    });
  }
  bind(fn) {
    return this.then(fn);
  }
  map(fn) {
    return this.then(fn);
  }
  flatMap(fn) {
    return this.then((result)=>fn(result).effect());
  }
  of(ref) {
    var m = new MonadIODef(()=>ref);
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

  subscribe(fn, asynchronized) {
    if (asynchronized) {
      return Promise.resolve(0).then(this.effect).then(fn);
    }

    fn(this.effect())
    return fn;
  }
}

var MonadIO = new MonadIODef({});
MonadIO.fromPromise = function (p) {
  var m = new MonadIODef(function () {
    return MonadIO.doM(function *() {
      return yield p;
    });
  });
  return m;
};
MonadIO.promiseof = function (ref) {
  return Promise.resolve(ref);
};
MonadIO.wrapGenerator = function (genDef) {
  var gen = genDef();
  function step(value) {
      var result = gen.next(value);
      if (result.done) {
          return result.value;
      }
      if (result.value instanceof MonadIODef) {
          return result.value.subscribe((x)=>x, true).then(step);
      }
      return result.value.then(step);
  }
  return step;
};
MonadIO.generatorToPromise = function (genDef) {
  return Promise.resolve().then(MonadIO.wrapGenerator(genDef));
}
MonadIO.doM = function (genDef) {
  return MonadIO.wrapGenerator(genDef)();
};

module.exports = MonadIO;
