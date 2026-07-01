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

describe('MonadIO - extended coverage', function () {
	// Laziness: effect runs only on subscribe
	it('is lazy until subscribed', function () {
		var ran = false;
		var m = MonadIO.just(0).map(()=>{ ran = true; return 1; });
		ran.should.equal(false);
		m.subscribe(()=>{});
		ran.should.equal(true);
	});

	// sync subscribe returns the callback
	it('sync subscribe returns its callback', function () {
		var fn = v=>v;
		(MonadIO.just(1).subscribe(fn) === fn).should.equal(true);
	});

	// chain === flatMap
	it('chain and flatMap are equivalent', function () {
		var a, b;
		MonadIO.just(2).chain(x=>MonadIO.just(x+1)).subscribe(v=>a=v);
		MonadIO.just(2).flatMap(x=>MonadIO.just(x+1)).subscribe(v=>b=v);
		a.should.equal(b);
		a.should.equal(3);
	});

	// bind === then === map
	it('bind, then, map aliases agree', function () {
		var m1, m2, m3;
		MonadIO.just(3).bind(x=>x+1).subscribe(v=>m1=v);
		MonadIO.just(3).then(x=>x+1).subscribe(v=>m2=v);
		MonadIO.just(3).map(x=>x+1).subscribe(v=>m3=v);
		m1.should.equal(4);
		m2.should.equal(4);
		m3.should.equal(4);
	});

	// map chaining
	it('chained maps accumulate', function () {
		var v;
		MonadIO.just(1).map(x=>x+1).map(x=>x*3).map(x=>x-2).subscribe(r=>v=r);
		v.should.equal(4);
	});

	// wrapGenerator on plain generator
	it('wrapGenerator runs a plain generator to its return', function () {
		MonadIO.wrapGenerator(function*(){ return 99; })().should.equal(99);
	});
	it('wrapGenerator on empty generator returns undefined', function () {
		(MonadIO.wrapGenerator(function*(){})() === undefined).should.equal(true);
	});

	// async subscribe defers callback
	it('async subscribe defers callback to microtask', function () {
		var order = [];
		var m = MonadIO.just(0).map(()=>{ order.push('eff'); return 5; });
		return m.subscribe(v=>order.push('sub'+v), true).then(()=>{
			order.join(',').should.equal('eff,sub5');
		});
	});

	// doM mixing all yieldable kinds
	it('doM mixes promise, Maybe, MonadIO, fromPromise', function () {
		return doM(function*(){
			var a = yield promiseof(5);
			var b = yield Maybe.just(11);
			var c = yield MonadIO.just(3);
			var d = yield MonadIO.fromPromise(Promise.resolve(3));
			return a + b + c + d;
		}).then(v=>v.should.equal(22));
	});

	// generatorToPromise resolves through a Promise boundary
	it('generatorToPromise resolves yields', function () {
		return generatorToPromise(function*(){
			var a = yield promiseof(2);
			var b = yield MonadIO.just(3);
			return a + b;
		}).then(v=>v.should.equal(5));
	});

	// fromPromise via async subscribe
	it('fromPromise delivers resolved value via async subscribe', function () {
		return MonadIO.fromPromise(Promise.resolve(7)).subscribe(v=>v, true).then(v=>v.should.equal(7));
	});

	// promiseof wraps in resolved promise
	it('promiseof yields a resolved promise', function () {
		return MonadIO.promiseof(42).then(v=>v.should.equal(42));
	});

	// ap applies wrapped fn
	it('ap applies a wrapped function', function () {
		var v;
		MonadIO.just(5).ap(MonadIO.of(x=>x*2)).subscribe(r=>v=r);
		v.should.equal(10);
	});

	// of/just construct constant effect
	it('of and just wrap a constant', function () {
		var a, b;
		MonadIO.of(8).subscribe(v=>a=v);
		MonadIO.just(8).subscribe(v=>b=v);
		a.should.equal(8);
		b.should.equal(8);
	});

	// doM returning immediately
	it('doM with no yields returns the value', function () {
		return Promise.resolve(doM(function*(){ return 13; })).then(v=>v.should.equal(13));
	});

	// nested doM
	it('doM nested generator composition', function () {
		return doM(function*(){
			var a = yield MonadIO.fromPromise(Promise.resolve(4));
			var b = yield promiseof(a * 2);
			return b + 1;
		}).then(v=>v.should.equal(9));
	});

	// Regression: a None yielded inside doM must short-circuit the generator
	// (the Maybe monad transformer aborts), not resume it with undefined.
	it('doM short-circuits when a None is yielded', function () {
		var reached = false;
		var result = doM(function*(){
			var a = yield Maybe.just(1);
			var b = yield Maybe.empty();   // None
			reached = true;
			return Maybe.just(a + b);
		});
		result.isNull().should.equal(true);
		reached.should.equal(false);
	});
	it('doM short-circuits when the first yield is None', function () {
		var reached = false;
		var result = doM(function*(){
			var a = yield Maybe.empty();   // None at the very first step
			reached = true;
			return Maybe.just(a);
		});
		result.isNull().should.equal(true);
		reached.should.equal(false);
	});
	it('doM still threads through when every yielded Maybe is Just', function () {
		var reached = false;
		var result = doM(function*(){
			var a = yield Maybe.just(4);
			var b = yield Maybe.just(7);
			reached = true;
			return Maybe.just(a + b);
		});
		reached.should.equal(true);
		result.isNull().should.equal(false);
		result.join().unwrap().should.equal(11);
	});
});
