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
})
