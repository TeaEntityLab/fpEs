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
