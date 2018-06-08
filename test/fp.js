var {
  compose, curry,
  chunk, range, tail, shift,
  clone,
  flatten, reverse, map, reduce, filter,
} = require('../fp');

describe('Fp', function () {
  it('compose', function () {
			compose((x)=>x-8, (x)=>x+10, (x)=>x*10)(4).should.equal(42)
			compose((x)=>x+2, (x,y)=>x*y)(4,10).should.equal(42)
	});
  it('curry', function () {
			curry((x, y, z) => x + y + z)(1,2,3).should.equal(6)
			curry((x, y, z) => x + y + z)(1)(2,3).should.equal(6)
			curry((x, y, z) => x + y + z)(1,2)(3).should.equal(6)
			curry((x, y, z) => x + y + z)(1)(2)(3).should.equal(6)
	});
  it('chunk', function () {
			JSON.stringify(chunk(range(7),3)).should.equal('[[0,1,2],[3,4,5],[6]]')
	});
  it('tail shift', function () {
			JSON.stringify(tail(range(3))).should.equal('[1,2]')
			JSON.stringify(shift(range(3))).should.equal('0')
	});
  it('clone', function () {
			(clone(null) === null).should.equal(true);
			(clone(undefined) === undefined).should.equal(true);

			JSON.stringify(clone(chunk(range(7),3))).should.equal('[[0,1,2],[3,4,5],[6]]')
			JSON.stringify(clone({a:3,b:4,c:{d:5}})).should.equal('{"a":3,"b":4,"c":{"d":5}}')
	});
  it('flatten, reverse, map, reduce, filter', function () {
      // console.log(map((x)=>x*x)([1,2,3]));


      JSON.stringify(flatten([[[[[[[0],1],2],3],4],5],6])).should.equal('[0,1,2,3,4,5,6]')

      JSON.stringify(reverse([6,5,4,3,2,1,0])).should.equal('[0,1,2,3,4,5,6]')
			JSON.stringify(map((x)=>x*x)([1,2,3])).should.equal('[1,4,9]')
			JSON.stringify(reduce((x,y)=>x+y)([1,2,3])).should.equal('6')
			JSON.stringify(filter((x)=>x>2)([1,2,3])).should.equal('[3]');

      (reduce((x,y)=>x+y)([]) === undefined).should.equal(true)

			JSON.stringify(compose(reduce((x,y)=>x+y), map((x)=>x*x), filter((x)=>x<4), flatten)
        ([[[[[[[0],1],2],3],4],5],6]))
        .should.equal('14');
	});
})
