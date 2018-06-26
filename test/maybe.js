var Maybe = require('../maybe');

describe('Maybe', function () {
  it('New', function () {
			var m = Maybe.just(1);
	});
  it('map', function () {
			var m = Maybe.just(1).map((a)=>a+2).map((a)=>a+3);
      m.unwrap().should.equal(6)
	});
  it('isPresent', function () {
			var m;

      m = Maybe.just(1);
      m.isPresent().should.equal(true)
      m.isNull().should.equal(false)
      m = Maybe.just(null);
      m.isPresent().should.equal(false)
      m.isNull().should.equal(true)
      m = Maybe.just(undefined);
      m.isPresent().should.equal(false)
      m.isNull().should.equal(true)
	});
  it('or', function () {
			var m;

      m = Maybe.just(1);
      m.or(3).unwrap().should.equal(1)
      m.or(4).unwrap().should.equal(1)
      m = Maybe.just(null);
      m.or(3).unwrap().should.equal(3)
      m.or(4).unwrap().should.equal(4)
      m = Maybe.just(undefined);
      m.or(3).unwrap().should.equal(3)
      m.or(4).unwrap().should.equal(4)
	});
  it('letDo', function () {
			var m;
      var v;

      m = Maybe.just(1);
      v = 0;
      m.letDo(function () {
        v = 1;
      });
      v.should.equal(1)
      m = Maybe.just(null);
      v = 0;
      m.letDo(function () {
        v = 1;
      });
      v.should.equal(0)
      m = Maybe.just(undefined);
      v = 0;
      m.letDo(function () {
        v = 1;
      });
      v.should.equal(0)
	});
  it('map', function () {
			var m;

      m = Maybe.just(1).map((x)=>x+2).map((x)=>x+3);
      m.unwrap().should.equal(6);
	});
  it('flatMap', function () {
			var m;

      m = Maybe.just(1).flatMap((x)=>Maybe.just(x+2)).flatMap((x)=>Maybe.just(x+3));
      m.unwrap().should.equal(6);
	});
  it('fantasyland monad', function () {
      var a;
      var f;
      var m;

      a = 1;
      f = (x) => Maybe.of(x + 1);
      Maybe.of(a).chain(f).unwrap().should.equal(f(a).unwrap());

      m = Maybe.of(1);
      m.chain(Maybe.of).unwrap().should.equal(m.unwrap());
  });
  it('ap', function () {
			var m;
      var f;
      var u;
      var v;
      var x;
      var y;

      m = Maybe.just(1);
      m.ap(Maybe.of(x => x)).unwrap().should.equal(m.unwrap());

      x = 1;
      f = (x) => x + 1;
      Maybe.of(x).ap(Maybe.of(f)).unwrap().should.equal(Maybe.of(f(x)).unwrap());

      u = Maybe.of(f);
      y = 1;
      Maybe.of(y).ap(u).unwrap().should.equal(u.ap(Maybe.of(f => f(y))).unwrap());
	});
})
