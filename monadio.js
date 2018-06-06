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
  flatMap(fn) {
    return this.then(fn);
  }

  subscribe(fn, asynchronized) {
    if (asynchronized) {
      return Promise.resolve(0).then(this.effect).then(fn);
    }

    fn(this.effect())
    return fn;
  }
}

var MonadIO = {};
MonadIO.just = function (ref) {
  var m = new MonadIODef(()=>ref);
  return m;
};
MonadIO.of = MonadIO.just;
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
MonadIO.doM = function (genDef) {
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
  return step();
};

module.exports = MonadIO;
