var Monad = require('../src/monad');
var {asof, doM} = require('../src/monadio');
var Publisher = require('../src/publisher');

describe('Publisher', () => {
  it('sync', () => {
      var p = new Publisher();
      var v = 0;

      v = 0;
      p.subscribe((i)=>v=i);
      p.publish(1);

      v.should.equal(1)
	});
  it('async', () => {
      var p = new Publisher();
      var v = 0;

      v = 0;
      p.subscribe((i)=>v=i);
      p.publish(1, true);
      v.should.equal(0)
	});
})
