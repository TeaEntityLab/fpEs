import Publisher from '../publisher';

describe('Publisher', function () {
  it('sync', function () {
      var p = new Publisher();
      var v = 0;

      v = 0;
      p.subscribe((i)=>v=i);

      p.publish(1);
      v.should.equal(1)
      // Clear
      p.clear()
      p.publish(2);
      v.should.equal(1)
	});
  it('async', function (done) {
      var p = new Publisher();
      var v = 0;

      v = 0;
      p.subscribe((i)=>v=i);
      p.publish(1, true);
      v.should.equal(0)

      this.timeout(500);
      setTimeout(()=>{
        v.should.equal(1)
        done();
      },30);
	});
  it('unsubscribe', function () {
      var p = new Publisher();
      var v = 0;
      var callback = (i)=>v=i;

      v = 0;
      p.subscribe(callback);
      p.publish(1);
      v.should.equal(1)
      v = 0;
      p.unsubscribe(callback);
      p.publish(1);
      v.should.equal(0)
	});
  it('map', function (done) {
      var p = new Publisher();
      var v = 0;

      v = 0;
      p.map((x)=>x+2).map((x)=>x+3).subscribe((i)=>v=i);
      p.publish(1, true);
      v.should.equal(0);

      this.timeout(500);
      setTimeout(()=>{
        v.should.equal(6)
        done();
      },30);
	});
  it('clear - subscriber should not receive after clear', function () {
      var p = new Publisher();
      var v = 0;
      var callback = (i)=>v=i;

      p.subscribe(callback);
      p.publish(1);
      v.should.equal(1);
      p.clear();
      p.publish(2);
      v.should.equal(1);
	});
  it('clear - on empty publisher should not throw', function () {
      var p = new Publisher();
      p.clear();
	});
  it('duplicate subscribe - same callback only called once', function () {
      var p = new Publisher();
      var count = 0;
      var callback = (i)=>count++;

      p.subscribe(callback);
      p.subscribe(callback);
      p.publish(1);
      count.should.equal(1);
	});
  it('duplicate subscribe - subscriber count stays correct', function () {
      var p = new Publisher();
      var count = 0;
      var callback = (i)=>count++;

      p.subscribe(callback);
      p.subscribe(callback);
      p.publish(1);
      p.publish(1);
      count.should.equal(2);
	});
  it('multiple subscribers - all 3 receive the value', function () {
      var p = new Publisher();
      var results = [];

      p.subscribe((i)=>results.push(i));
      p.subscribe((i)=>results.push(i));
      p.subscribe((i)=>results.push(i));
      p.publish(1);
      results.should.eql([1,1,1]);
	});
  it('multiple subscribers - different callbacks tracking different variables', function () {
      var p = new Publisher();
      var a = 0, b = 0, c = 0;

      p.subscribe((i)=>a=i);
      p.subscribe((i)=>b=i);
      p.subscribe((i)=>c=i);
      p.publish(42);
      a.should.equal(42);
      b.should.equal(42);
      c.should.equal(42);
	});
  it('unsubscribe - never subscribed should not throw or affect others', function () {
      var p = new Publisher();
      var v = 0;

      p.subscribe((i)=>v=i);
      p.unsubscribe(function(){});
      p.publish(1);
      v.should.equal(1);
	});
  it('multiple publishes - subscriber receives all in order', function () {
      var p = new Publisher();
      var results = [];

      p.subscribe((i)=>results.push(i));
      p.publish(1);
      p.publish(2);
      p.publish(3);
      results.should.eql([1,2,3]);
	});
  it('map with unsubscribe on original - mapping still works', function () {
      var p = new Publisher();
      var v = 0;

      var mapped = p.map((x)=>x+2);
      mapped.subscribe((i)=>v=i);
      p.unsubscribe(function(){});
      p.publish(1);
      v.should.equal(3);
	});
  it('async with multiple subscribers', function (done) {
      var p = new Publisher();
      var v1 = 0, v2 = 0;

      p.subscribe((i)=>v1=i);
      p.subscribe((i)=>v2=i);
      p.publish(42, true);
      v1.should.equal(0);
      v2.should.equal(0);

      this.timeout(500);
      setTimeout(()=>{
        v1.should.equal(42);
        v2.should.equal(42);
        done();
      },30);
	});
})

describe('Publisher - extended coverage', function () {
	// subscribe return semantics
	it('subscribe returns the callback', function () {
		var p = new Publisher();
		var fn = i=>i;
		(p.subscribe(fn) === fn).should.equal(true);
	});
	it('duplicate subscribe returns undefined and does not re-add', function () {
		var p = new Publisher();
		var fn = i=>i;
		p.subscribe(fn);
		(p.subscribe(fn) === undefined).should.equal(true);
		p.subscribers.length.should.equal(1);
	});

	// map sets origin link
	it('map links derived publisher to its origin', function () {
		var p = new Publisher();
		var m = p.map(x=>x+1);
		(m.origin === p).should.equal(true);
	});

	// multi-subscriber ordering across publishes
	it('delivers to subscribers in subscription order across publishes', function () {
		var p = new Publisher();
		var got = [];
		p.subscribe(i=>got.push('a'+i));
		p.subscribe(i=>got.push('b'+i));
		p.publish(1);
		p.publish(2);
		got.join(',').should.equal('a1,b1,a2,b2');
	});

	// unsubscribe stops delivery to that callback only
	it('unsubscribe halts further delivery to that callback', function () {
		var p = new Publisher();
		var v = 0;
		var cb = i=>v=i;
		p.subscribe(cb);
		p.publish(5);
		v.should.equal(5);
		p.unsubscribe(cb);
		p.publish(9);
		v.should.equal(5);
	});
	it('unsubscribe one of many leaves others intact', function () {
		var p = new Publisher();
		var a = 0, b = 0;
		var ca = i=>a=i, cb = i=>b=i;
		p.subscribe(ca);
		p.subscribe(cb);
		p.unsubscribe(ca);
		p.publish(7);
		a.should.equal(0);
		b.should.equal(7);
	});

	// clear removes all
	it('clear removes every subscriber', function () {
		var p = new Publisher();
		var w = 0;
		p.subscribe(i=>w=i);
		p.publish(3);
		p.clear();
		p.subscribers.length.should.equal(0);
		p.publish(7);
		w.should.equal(3);
	});

	// map chaining transforms cumulatively
	it('map chain applies transforms in order', function () {
		var p = new Publisher();
		var z;
		p.map(x=>x*2).map(x=>x+1).subscribe(i=>z=i);
		p.publish(10);
		z.should.equal(21);
	});

	// map is independent from raw subscription
	it('mapped and raw subscribers both receive on publish', function () {
		var p = new Publisher();
		var raw, mapped;
		p.subscribe(i=>raw=i);
		p.map(x=>x*10).subscribe(i=>mapped=i);
		p.publish(4);
		raw.should.equal(4);
		mapped.should.equal(40);
	});

	// publish with no subscribers is a no-op
	it('publish with no subscribers does not throw', function () {
		var p = new Publisher();
		(()=>p.publish(1)).should.not.throw();
	});

	// async publish defers all subscribers
	it('async publish defers delivery to all subscribers', function (done) {
		var p = new Publisher();
		var v1 = 0, v2 = 0;
		p.subscribe(i=>v1=i);
		p.subscribe(i=>v2=i);
		p.publish(42, true);
		v1.should.equal(0);
		v2.should.equal(0);
		this.timeout(500);
		setTimeout(()=>{
			v1.should.equal(42);
			v2.should.equal(42);
			done();
		}, 30);
	});

	// async map chain
	it('async publish through map chain', function (done) {
		var p = new Publisher();
		var v = 0;
		p.map(x=>x+1).map(x=>x*2).subscribe(i=>v=i);
		p.publish(4, true);
		v.should.equal(0);
		this.timeout(500);
		setTimeout(()=>{
			v.should.equal(10);
			done();
		}, 30);
	});

	// re-subscribe after clear works
	it('can subscribe again after clear', function () {
		var p = new Publisher();
		var v = 0;
		p.subscribe(i=>v=i);
		p.clear();
		p.subscribe(i=>v=i*2);
		p.publish(5);
		v.should.equal(10);
	});
});
