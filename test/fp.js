var {
  compose, curry,
  chunk, range,
  clone,
  reverse, map, reduce, filter,compact, concat,difference
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
  it('clone', function () {
			(clone(null) === null).should.equal(true);
			(clone(undefined) === undefined).should.equal(true);

			JSON.stringify(clone(chunk(range(7),3))).should.equal('[[0,1,2],[3,4,5],[6]]')
			JSON.stringify(clone({a:3,b:4,c:{d:5}})).should.equal('{"a":3,"b":4,"c":{"d":5}}')
	});
  it('reverse, map, reduce, filter', function () {
			JSON.stringify(reverse([6,5,4,3,2,1,0])).should.equal('[0,1,2,3,4,5,6]')
			JSON.stringify(map([1,2,3],(x)=>x*x)).should.equal('[1,4,9]')
			JSON.stringify(reduce([1,2,3],(x,y)=>x+y)).should.equal('6')
			JSON.stringify(filter([1,2,3],(x)=>x>2)).should.equal('[3]')
	});

	it ('should compact by returning all truthy values', () => {
		JSON.stringify(compact([1,2,false, "", 3])).should.equal("[1,2,3]");
	});
	it ('should compact with second argument', () => {
		JSON.stringify(compact(["John",1, 2, "Jane"],'')).should.equal('["John","Jane"]');
	});

	it ('should concat arrays', () => {
		JSON.stringify(concat([1,2,3],4,5)).should.equal("[1,2,3,4,5]")
		JSON.stringify(concat([1,2,3],[4,5])).should.equal("[1,2,3,[4,5]]")
	});
	it ('should concat with a function', () => {
		JSON.stringify(concat([1,2,3],4,5, x=>x>3)).should.equal("[4,5]")
	});
	
	it ('should find the difference between two arrays ', () => {
		JSON.stringify(difference(
			["May","Joe","John"], 
		["Jane", "Joe", "John","Kay","May","Q"],
		["May", "Suzzie", "Fri"],
		3,1)).should.equal('["Joe","John"]')
		JSON.stringify(difference(
			["May","Joe","John"], 
		["Jane", "Joe", "John","Kay","May","Kai"],
		["May", "Kwei", "Fri"],
		1,3)).should.equal('["Kwei","Fri"]')
	});
})
