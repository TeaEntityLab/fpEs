import Maybe from '../maybe';

describe('Maybe', function () {
  it('New/Convert', function () {
			var m
      m = Maybe.just(0);
      m.toList().length.should.equal(1)
      m.toList()[0].should.equal(0)
      m.toString().should.equal('Some(0)')
      m = Maybe.empty()
      m.toList().length.should.equal(0)
      m.toString().should.equal('None')

      Maybe.fromFalsy(0).should.equal(Maybe.empty())
      Maybe.fromFalsy('').should.equal(Maybe.empty())
      Maybe.fromFalsy(NaN).should.equal(Maybe.empty())
      Maybe.fromFalsy(null).should.equal(Maybe.empty())
      Maybe.fromFalsy(undefined).should.equal(Maybe.empty())

      Maybe.fromPredicate((x) => x > 3, 3).should.equal(Maybe.empty())
      Maybe.fromPredicate((x) => x > 3, 4).unwrap().should.equal(4)
      Maybe.fromPredicate((x) => x > 3)(5).unwrap().should.equal(5)
	});
  it('map/bind', function () {
			var m;
      m = Maybe.just(1).map((a)=>a+2).map((a)=>a+3);
      m.unwrap().should.equal(6)
      m = Maybe.just(1).bind((a)=>a+2).bind((a)=>a+3);
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

      // letDo vs orDo
      m = Maybe.just(0);
      v = m.letDo(function (p) {
        return p + 2
      }).orDo(function () {
        return 3
      }).unwrap();
      v.should.equal(2);
      m = Maybe.just(undefined);
      v = m.letDo(function (p) {
        return p + 2
      }).orDo(function () {
        return 3
      }).unwrap();
      v.should.equal(3);
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
  it('fantasy-land/monad', function () {
      var a;
      var f;
      var m;

      a = 1;
      f = (x) => Maybe.of(x + 1);
      Maybe.of(a).chain(f).unwrap().should.equal(f(a).unwrap());

      m = Maybe.of(1);
      m.chain(Maybe.of).unwrap().should.equal(m.unwrap());
  });
  it('fantasy-land/chainRec', function () {
      Maybe.chainRec((next, done, x) => Maybe.of(x < 1000000 ? next(x + 1) : done(x)), 0).unwrap().should.equal(1000000);

      function fibChainRec (next, done, args) {
          var n = args[0], a = args[1], b = args[2];

          if (n === 0) {return Maybe.of(done(a));}
          if (n === 1) {return Maybe.of(done(b));}
          return Maybe.of(next([n - 1, b, a + b]));
      };

      ((n)=>Maybe.chainRec(fibChainRec, [n, 0, 1]))(70).unwrap().should.equal(190392490709135);
  });
  it('fantasy-land/equals', function () {
      Maybe.of(32).equals(Maybe.of(32)).should.equal(true);
  });
  it('fantasy-land/join', function () {
      Maybe.of(Maybe.of(Maybe.zero())).join().should.equal(Maybe.empty());
      Maybe.of(Maybe.of(Maybe.of(1))).join().unwrap().should.equal(1);
  });
  it('fantasy-land/reduce', function () {
      Maybe.of(1).reduce(x => x * 3, 3).should.equal(9);
      Maybe.of(undefined).reduce(x => x * 3, 3).should.equal(3);
  });
  it('fantasy-land/filter', function () {
      Maybe.of(1).filter(x => x > 3).should.equal(Maybe.empty());
      Maybe.of(undefined).filter(x => x > 3).should.equal(Maybe.empty());
      Maybe.of(4).filter(x => x > 3).unwrap().should.equal(4);
  });
  it('fantasy-land/ap', function () {
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
  it('zero', function () {
      Maybe.zero().should.equal(Maybe.empty());
	});
  it('extract alias', function () {
      Maybe.just(5).extract().should.equal(5);
      should(Maybe.empty().extract()).equal(undefined);
	});
  it('extend alias', function () {
      Maybe.just(1).extend(x => x + 2).unwrap().should.equal(3);
      Maybe.empty().extend(x => x).isNull().should.equal(true);
	});
  it('alt alias', function () {
      Maybe.just(1).alt(Maybe.just(3)).unwrap().should.equal(1);
      Maybe.empty().alt(Maybe.just(3)).isNull().should.equal(true);
	});
  it('then method', function () {
      Maybe.just(1).then(x => x + 2).unwrap().should.equal(3);
      Maybe.empty().then(x => null).isNull().should.equal(true);
	});
  it('None identity', function () {
      Maybe.empty().should.equal(Maybe.empty());
	});
  it('just null/undefined', function () {
      Maybe.just(null).isNull().should.equal(true);
      Maybe.just(undefined).isNull().should.equal(true);
	});
  it('fantasy-land aliases', function () {
      Maybe['fantasy-land/of'](1).unwrap().should.equal(1);
      Maybe['fantasy-land/empty']().should.equal(Maybe.empty());
      Maybe['fantasy-land/zero']().should.equal(Maybe.empty());
      Maybe.just(1)['fantasy-land/map'](x => x + 1).unwrap().should.equal(2);
      Maybe.just(1)['fantasy-land/chain'](x => Maybe.just(x + 1)).unwrap().should.equal(2);
      Maybe.just(1)['fantasy-land/extract']().should.equal(1);
      Maybe.just(1)['fantasy-land/extend'](x => x + 1).unwrap().should.equal(2);
      Maybe.empty()['fantasy-land/alt'](Maybe.just(1)).isNull().should.equal(true);
	});
  it('multiple chaining', function () {
      Maybe.just(3).map(x => x * 2).flatMap(x => Maybe.just(x + 1)).map(x => x / 7).unwrap().should.equal(1);
  });
  it('None unwrap', function () {
      (Maybe.empty().unwrap() === null).should.equal(true);
  });
  it('None filter', function () {
      Maybe.empty().filter(()=>true).isNull().should.equal(true);
  });
  it('None ap', function () {
      Maybe.empty().ap(Maybe.of(x=>x)).isNull().should.equal(true);
  });
  it('None equals', function () {
      Maybe.empty().equals(Maybe.empty()).should.equal(true);
      Maybe.empty().equals(Maybe.just(1)).should.equal(false);
  });
  it('None orDo', function () {
      Maybe.empty().orDo(()=>42).unwrap().should.equal(42);
  });
  it('None reduce', function () {
      Maybe.empty().reduce((acc,x)=>acc+x, 99).should.equal(99);
  });
  it('None join', function () {
      Maybe.empty().join().isNull().should.equal(true);
  });
  it('just preserves 0', function () {
      Maybe.just(0).isPresent().should.equal(true);
      Maybe.just(0).unwrap().should.equal(0);
  });
  it('fromFalsy truthy', function () {
      Maybe.fromFalsy(1).isPresent().should.equal(true);
      Maybe.fromFalsy(1).unwrap().should.equal(1);
  });
})

describe('Maybe - extended coverage', function () {
	// Functor laws
	it('functor identity', function () {
		Maybe.of(5).map(x=>x).unwrap().should.equal(5);
	});
	it('functor composition', function () {
		var f = x=>x+1, g = x=>x*2;
		Maybe.of(5).map(x=>g(f(x))).unwrap()
			.should.equal(Maybe.of(5).map(f).map(g).unwrap());
	});

	// Monad laws
	it('monad left identity', function () {
		var f = x=>Maybe.of(x+1);
		Maybe.of(5).chain(f).unwrap().should.equal(f(5).unwrap());
	});
	it('monad right identity', function () {
		Maybe.of(5).chain(Maybe.of).unwrap().should.equal(5);
	});
	it('monad associativity', function () {
		var f = x=>Maybe.of(x+1), g = x=>Maybe.of(x*2);
		Maybe.of(5).chain(f).chain(g).unwrap()
			.should.equal(Maybe.of(5).chain(x=>f(x).chain(g)).unwrap());
	});

	// toList
	it('Just.toList wraps value', function () {
		JSON.stringify(Maybe.of(7).toList()).should.equal('[7]');
	});
	it('None.toList is empty', function () {
		JSON.stringify(Maybe.empty().toList()).should.equal('[]');
	});

	// reduce
	it('Just.reduce applies reducer with init', function () {
		Maybe.of(5).reduce((acc,x)=>acc+x, 10).should.equal(15);
	});
	it('None.reduce returns init untouched', function () {
		Maybe.empty().reduce((acc,x)=>acc+x, 10).should.equal(10);
	});

	// or / orDo
	it('Just.or keeps original value', function () {
		Maybe.of(1).or(9).unwrap().should.equal(1);
	});
	it('None.or substitutes fallback', function () {
		Maybe.empty().or(9).unwrap().should.equal(9);
	});
	it('Just.orDo keeps original value', function () {
		Maybe.of(1).orDo(()=>9).unwrap().should.equal(1);
	});
	it('None.orDo runs fallback fn', function () {
		Maybe.empty().orDo(()=>9).unwrap().should.equal(9);
	});

	// equals matrix
	it('equals true for same wrapped value', function () {
		Maybe.of(3).equals(Maybe.of(3)).should.equal(true);
	});
	it('equals false for different wrapped values', function () {
		Maybe.of(3).equals(Maybe.of(4)).should.equal(false);
	});
	it('equals false against non-Maybe', function () {
		Maybe.of(3).equals(3).should.equal(false);
	});
	it('None.equals true vs None, false vs Just', function () {
		Maybe.empty().equals(Maybe.empty()).should.equal(true);
		Maybe.empty().equals(Maybe.of(1)).should.equal(false);
	});

	// fromFalsy
	it('fromFalsy 0 is None', function () {
		Maybe.fromFalsy(0).isNull().should.equal(true);
	});
	it('fromFalsy truthy wraps value', function () {
		Maybe.fromFalsy('hi').unwrap().should.equal('hi');
	});

	// fromPredicate forms
	it('fromPredicate pass (2-arg)', function () {
		Maybe.fromPredicate(x=>x>0, 5).unwrap().should.equal(5);
	});
	it('fromPredicate fail (2-arg)', function () {
		Maybe.fromPredicate(x=>x>0, -1).isNull().should.equal(true);
	});
	it('fromPredicate curried', function () {
		Maybe.fromPredicate(x=>x>0)(5).unwrap().should.equal(5);
		Maybe.fromPredicate(x=>x>0)(-1).isNull().should.equal(true);
	});

	// then on Just
	it('Just.then maps and rewraps', function () {
		Maybe.of(1).then(x=>x+5).unwrap().should.equal(6);
	});

	// join depth
	it('join collapses triple-nested Maybe', function () {
		Maybe.of(Maybe.of(Maybe.of(8))).join().unwrap().should.equal(8);
	});
	it('None.join stays None', function () {
		Maybe.empty().join().isNull().should.equal(true);
	});

	// filter
	it('Just.filter keeps when predicate true', function () {
		Maybe.of(5).filter(x=>x>3).unwrap().should.equal(5);
	});
	it('Just.filter drops to None when predicate false', function () {
		Maybe.of(1).filter(x=>x>3).isNull().should.equal(true);
	});
	it('None.filter stays None', function () {
		Maybe.empty().filter(()=>true).isNull().should.equal(true);
	});

	// ap
	it('Just.ap applies wrapped fn', function () {
		Maybe.of(5).ap(Maybe.of(x=>x*2)).unwrap().should.equal(10);
	});
	it('None.ap stays None', function () {
		Maybe.empty().ap(Maybe.of(x=>x)).isNull().should.equal(true);
	});

	// presence with falsy-but-present 0
	it('Just(0) is present (not null)', function () {
		Maybe.of(0).isPresent().should.equal(true);
		Maybe.of(0).isNull().should.equal(false);
		Maybe.of(0).unwrap().should.equal(0);
	});
	it('None is absent', function () {
		Maybe.empty().isPresent().should.equal(false);
		Maybe.empty().isNull().should.equal(true);
	});

	// toString
	it('Just.toString shows Some(...)', function () {
		Maybe.of([1,2]).toString().should.equal('Some([1,2])');
		Maybe.of('a').toString().should.equal('Some("a")');
	});
	it('None.toString shows None', function () {
		Maybe.empty().toString().should.equal('None');
	});

	// aliases consistency
	it('just/of are equivalent', function () {
		Maybe.just(1).unwrap().should.equal(Maybe.of(1).unwrap());
	});
	it('chain/flatMap equivalent', function () {
		Maybe.of(1).chain(x=>Maybe.of(x+1)).unwrap()
			.should.equal(Maybe.of(1).flatMap(x=>Maybe.of(x+1)).unwrap());
	});
	it('map/bind/then aliases agree on Just', function () {
		Maybe.of(1).map(x=>x+1).unwrap().should.equal(2);
		Maybe.of(1).bind(x=>x+1).unwrap().should.equal(2);
		Maybe.of(1).then(x=>x+1).unwrap().should.equal(2);
	});
	it('extract alias unwraps', function () {
		Maybe.of(42).extract().should.equal(42);
	});
	it('alt alias keeps present', function () {
		Maybe.of(1).alt(Maybe.of(2)).unwrap().should.equal(1);
	});
	it('extend alias maps over present', function () {
		Maybe.of(1).extend(x=>x+2).unwrap().should.equal(3);
	});

	// empty/zero point to None singleton
	it('empty and zero are the None singleton', function () {
		Maybe.empty().should.equal(Maybe.zero());
		Maybe.empty().should.equal(Maybe.empty());
	});

	// chaining pipeline
	it('multi-step Just pipeline', function () {
		Maybe.of(3).map(x=>x*2).chain(x=>Maybe.of(x+1)).map(x=>x/7).unwrap().should.equal(1);
	});
});

describe('Maybe - None short-circuit (regression)', function () {
	// Regression: None.map/then/chain/flatMap used to call fn(undefined) and
	// leak a Some(NaN); they must short-circuit and stay None.
	it('None.map stays None and does not call fn', function () {
		var called = false;
		var result = Maybe.empty().map(function (x) { called = true; return x + 1; });
		result.isNull().should.equal(true);
		called.should.equal(false);
	});
	it('None.then stays None and does not call fn', function () {
		var called = false;
		var result = Maybe.empty().then(function (x) { called = true; return x + 1; });
		result.isNull().should.equal(true);
		called.should.equal(false);
	});
	it('None.chain stays None and does not call fn', function () {
		var called = false;
		var result = Maybe.empty().chain(function (x) { called = true; return Maybe.of(x + 1); });
		result.isNull().should.equal(true);
		called.should.equal(false);
	});
	it('None.flatMap stays None and does not call fn', function () {
		var called = false;
		var result = Maybe.empty().flatMap(function (x) { called = true; return Maybe.of(x + 1); });
		result.isNull().should.equal(true);
		called.should.equal(false);
	});
	it('None.bind stays None', function () {
		Maybe.empty().bind(function (x) { return x + 1; }).isNull().should.equal(true);
	});
	it('None short-circuit holds across a chain', function () {
		Maybe.empty().map(x=>x+1).chain(x=>Maybe.of(x*2)).then(x=>x-3).isNull().should.equal(true);
	});

	// Just must still apply fn (no over-short-circuit)
	it('Just.map still applies fn after the fix', function () {
		Maybe.of(1).map(x=>x+1).unwrap().should.equal(2);
	});
	it('Just.chain still applies fn after the fix', function () {
		Maybe.of(1).chain(x=>Maybe.of(x+1)).unwrap().should.equal(2);
	});
	it('Just.flatMap returns the inner value the fn produces', function () {
		Maybe.of(1).flatMap(x=>Maybe.of(x+1)).unwrap().should.equal(2);
	});
	it('monad laws still hold for Just after the fix', function () {
		// left identity
		var f = x=>Maybe.of(x+1);
		Maybe.of(5).chain(f).unwrap().should.equal(f(5).unwrap());
		// right identity
		Maybe.of(5).chain(Maybe.of).unwrap().should.equal(5);
	});
});

describe('Maybe - chainRec None regression', function () {
	it('None.chainRec short-circuits, returns None, and does not call fn', function () {
		var called = false;
		var result = Maybe.empty().chainRec(function (next, done, x) {
			called = true;
			return Maybe.of(done(x));
		}, 0);
		result.isNull().should.equal(true);
		called.should.equal(false);
	});
});

describe('Maybe - None fantasy-land regressions', function () {
	it('fantasy-land/reduce returns init', function () {
		Maybe.empty()['fantasy-land/reduce'](function (acc, x) { return acc + x; }, 99).should.equal(99);
	});
	it('fantasy-land/filter returns None and does not call predicate', function () {
		var called = false;
		var result = Maybe.empty()['fantasy-land/filter'](function (x) { called = true; return true; });
		result.isNull().should.equal(true);
		called.should.equal(false);
	});
	it('fantasy-land/equals is true for None and false for Some', function () {
		Maybe.empty()['fantasy-land/equals'](Maybe.empty()).should.equal(true);
		Maybe.empty()['fantasy-land/equals'](Maybe.just(1)).should.equal(false);
	});
});
