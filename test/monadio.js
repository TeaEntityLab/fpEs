var Monad = require('../src/monad');
var {asof, doM} = require('../src/monadio');

describe('MonadIO', () => {
  it('doM', () => {
      var p = undefined;
			var v = 0;

      v = 0;
      p = doM(function *() {
        var value = yield asof(5);
        var value2 = yield asof(11);
        var value3 = yield Monad.just(3);
        return value + value2 + value3;
      });

      return p.then((v)=>v.should.equal(19));
	});
})
