import Monad from "../src/monad";
import MonadIO from "../src/monadio";
var {asof, doM} = MonadIO;

describe('MonadIO', function () {
  it('sync', function () {
      var m = MonadIO.just(0);
			var v = 0;

      v = 0;
      m
      .flatMap((val)=>val+1)
      .flatMap((val)=>val+2)
      .flatMap((val)=>val+3)
      .subscribe((val)=>v=val);

      v.should.equal(6);
	});
  it('async', function () {
      var p = undefined;
      var m = MonadIO.just(0);
			var v = 0;

      v = 0;
      p = m
      .flatMap((val)=>val+1)
      .flatMap((val)=>val+2)
      .flatMap((val)=>val+3)
      .subscribe((val)=>v=val, true);

      return p.then(()=>v.should.equal(6));
	});
  it('doM', function () {
      var p = undefined;
			var v = 0;

      v = 0;
      p = doM(function *() {
        var value = yield asof(5);
        var value2 = yield asof(11);
        var value3 = yield Monad.just(3);
        var value4 = yield MonadIO.just(3);
        return value + value2 + value3 + value4;
      });

      return p.then((v)=>v.should.equal(22));
	});
})
