var Publisher = require('../publisher');

describe('Publisher', function () {
  it('sync', function () {
      var p = new Publisher();
      var v = 0;

      v = 0;
      p.subscribe((i)=>v=i);
      p.publish(1);

      v.should.equal(1)
	});
  it('async', function () {
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
      },100);
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
  it('map', function () {
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
      },100);
	});
})
