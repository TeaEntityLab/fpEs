var Monad = require('../src/monad');

describe('Monad', function () {
  it('New', function () {
			var m = Monad.just(1);
	});
  it('flatMap', function () {
			var m = Monad.just(1).flatMap((a)=>a+2).flatMap((a)=>a+3);
      m.unwrap().should.equal(6)
	});
  it('isPresent', function () {
			var m;

      m = Monad.just(1);
      m.isPresent().should.equal(true)
      m.isNull().should.equal(false)
      m = Monad.just(null);
      m.isPresent().should.equal(false)
      m.isNull().should.equal(true)
      m = Monad.just(undefined);
      m.isPresent().should.equal(false)
      m.isNull().should.equal(true)
	});
  it('or', function () {
			var m;

      m = Monad.just(1);
      m.or(3).unwrap().should.equal(1)
      m.or(4).unwrap().should.equal(1)
      m = Monad.just(null);
      m.or(3).unwrap().should.equal(3)
      m.or(4).unwrap().should.equal(4)
      m = Monad.just(undefined);
      m.or(3).unwrap().should.equal(3)
      m.or(4).unwrap().should.equal(4)
	});
  it('letDo', function () {
			var m;
      var v;

      m = Monad.just(1);
      v = 0;
      m.letDo(function () {
        v = 1;
      });
      v.should.equal(1)
      m = Monad.just(null);
      v = 0;
      m.letDo(function () {
        v = 1;
      });
      v.should.equal(0)
      m = Monad.just(undefined);
      v = 0;
      m.letDo(function () {
        v = 1;
      });
      v.should.equal(0)
	});
})
