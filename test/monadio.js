import Maybe from '../maybe';
import MonadIO from '../monadio';
var {promiseof, doM, generatorToPromise} = MonadIO;

describe('MonadIO', function () {
  it('sync', function () {
      var m = MonadIO.just(0);
			var v = 0;

      v = 0;
      m
      .map((val)=>val+1)
      .map((val)=>val+2)
      .flatMap((val)=>MonadIO.just(val+1).map((val)=>val+1).map((val)=>val+1))
      .subscribe((val)=>v=val);

      v.should.equal(6);
	});
  it('async', function () {
      var p = undefined;
      var m = MonadIO.just(0);
			var v = 0;

      v = 0;
      p = m
      .map((val)=>val+1)
      .map((val)=>val+2)
      .map((val)=>val+3)
      .subscribe((val)=>v=val, true);

      return p.then(()=>v.should.equal(6));
	});
  it('doM', function () {
      var p = undefined;
			var v = 0;

      v = 0;
      p = doM(function *() {
        var value = yield promiseof(5);
        var value2 = yield promiseof(11);
        var value3 = yield Maybe.just(3);
        var value4 = yield MonadIO.just(3);
        var value5 = yield MonadIO.fromPromise(Promise.resolve(3));
        return value + value2 + value3 + value4 + value5;
      });

      return p.then((v)=>v.should.equal(25));
	});
  it('generatorToPromise', function () {
      var p = undefined;
			var v = 0;

      v = 0;
      p = generatorToPromise(function *() {
        var value = yield promiseof(5);
        var value2 = yield promiseof(11);
        var value3 = yield Maybe.just(3);
        var value4 = yield MonadIO.just(3);
        var value5 = yield MonadIO.fromPromise(Promise.resolve(3));
        return value + value2 + value3 + value4 + value5;
      });

      return p.then((v)=>v.should.equal(25));
	});
  it('ap', function () {
      MonadIO.just(1).ap(MonadIO.of(x=>x+1)).subscribe(v=>v.should.equal(2));
  });
  it('fromPromise', function () {
      return MonadIO.fromPromise(Promise.resolve(5)).subscribe(v=>v.should.equal(5), true);
  });
  it('promiseof', function () {
      return MonadIO.promiseof(42).then(v=>v.should.equal(42));
  });
  it('wrapGenerator', function () {
      var fn = MonadIO.wrapGenerator(function*(){return 42});
      fn().should.equal(42);
  });
  it('doM empty', function () {
      return Promise.resolve(doM(function*(){return 0})).then(v=>v.should.equal(0));
  });
  it('doM with MonadIO', function () {
      return doM(function*(){var v = yield MonadIO.just(5); return v+3}).then(v=>v.should.equal(8));
  });
  it('subscribe with callback', function () {
      MonadIO.just(1).subscribe((v)=>{v.should.equal(1)});
  });
  it('just/of', function () {
      MonadIO.just(10).subscribe(v=>v.should.equal(10));
  });
  it('fromPromise chained', function () {
      return doM(function*() {
          var v = yield MonadIO.fromPromise(Promise.resolve(3));
          return v * 2;
      }).then(v=>v.should.equal(6));
  });
  it('wrapGenerator empty', function () {
      var fn = MonadIO.wrapGenerator(function*(){});
      (fn() === undefined).should.equal(true);
  });
  it('doM async with MonadIO', function () {
      return doM(function*(){
          var v = yield MonadIO.just(Promise.resolve(5));
          return v;
      }).then(v=>v.should.equal(5));
  });
  it('fromPromise immediate', function () {
      return MonadIO.fromPromise(Promise.resolve(99)).subscribe(v=>v.should.equal(99), true);
  });
})
