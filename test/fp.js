var fp = require('../src/fp');

describe('Fp', () => {
  it('compose', () => {
			fp.compose((x)=>x-8, (x)=>x+10, (x)=>x*10)(4).should.equal(42)
			fp.compose((x)=>x+2, (x,y)=>x*y)(4,10).should.equal(42)
	});
  it('curry', () => {
			fp.curry((x, y, z) => x + y + z)(1,2,3).should.equal(6)
			fp.curry((x, y, z) => x + y + z)(1)(2,3).should.equal(6)
			fp.curry((x, y, z) => x + y + z)(1,2)(3).should.equal(6)
			fp.curry((x, y, z) => x + y + z)(1)(2)(3).should.equal(6)
	});
})
