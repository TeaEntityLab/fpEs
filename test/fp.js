import {
  compose, curry, trampoline,
  chunk, range, tail, shift, unique, snooze,
  clone, propEq, get, matches, memoize,
  flatten, flattenMap, unary, foldl, foldr, take,
  compact, concat, contains, difference, differenceWithDup,
  reverse, map, reduce, filter, drop, fill,
  join, intersection, find, findLast, findIndex, findLastIndex, head, fromPairs, initial, nth,
  pull, sortedIndex, sortedUniq, union,zip, unzip
} from '../fp';

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
  it('trampoline', function () {
      function fib (n) {
          return trampoline(function inner_fib(n, a, b) {
              if (n === 0) {return a;}
              if (n === 1) {return b;}
              return () => inner_fib(n - 1, b, a + b);
          })(n, 0, 1);
      };
			fib(70).should.equal(190392490709135);
	});
  it('chunk', function () {
			JSON.stringify(chunk(range(7),3)).should.equal('[[0,1,2],[3,4,5],[6]]')
	});
  it('snooze', function () {
			return snooze(20).then(()=>'ok').then((x)=>x.should.equal('ok'));
	});
  it('unique', function () {
			JSON.stringify(unique([0,0,1,2,3,3,4,5,3,4,5,6])).should.equal('[0,1,2,3,4,5,6]')
	});
  it('tail shift take', function () {
			JSON.stringify(tail(range(3))).should.equal('[1,2]')
			JSON.stringify(shift(range(3))).should.equal('0')
      JSON.stringify(take(4, range(3))).should.equal('[0,1,2]')
			JSON.stringify(take(3, range(3))).should.equal('[0,1,2]')
			JSON.stringify(take(2, range(3))).should.equal('[0,1]')
			JSON.stringify(take(1, range(3))).should.equal('[0]')
	});
  it('propEq get matches', function () {
			(propEq(1)('a')({a:1})).should.equal(true);
			(propEq(1)('a')({b:1})).should.equal(false);
			(matches({a:1})({a:1})).should.equal(true);
			(matches({b:1})({a:1})).should.equal(false);
			(get({b:1})('b')).should.equal(1);
	});
  it('clone', function () {
			(clone(null) === null).should.equal(true);
			(clone(undefined) === undefined).should.equal(true);

			JSON.stringify(clone(chunk(range(7),3))).should.equal('[[0,1,2],[3,4,5],[6]]')
			JSON.stringify(clone({a:3,b:4,c:{d:5}})).should.equal('{"a":3,"b":4,"c":{"d":5}}')
	});
  it('flatten, flattenMap, reverse, map, reduce, filter', function () {
      // console.log(map((x)=>x*x)([1,2,3]));


      JSON.stringify(flatten([[[[[[[0],1],2],3],4],5],6])).should.equal('[0,1,2,3,4,5,6]')
      JSON.stringify(flattenMap((x)=>[x*x,x*x])([1,2,3])).should.equal('[1,1,4,4,9,9]')
      JSON.stringify(flattenMap(unary(parseInt))(["+1","+2","+3"])).should.equal('[1,2,3]')

      JSON.stringify(reverse([6,5,4,3,2,1,0])).should.equal('[0,1,2,3,4,5,6]')
			JSON.stringify(map((x)=>x*x)([1,2,3])).should.equal('[1,4,9]')
			JSON.stringify(reduce((x,y)=>x+y, 0)([1,2,3])).should.equal('6')
			JSON.stringify(reduce((x,y)=>x+y)([1,2,3])).should.equal('6')
			JSON.stringify(foldr((x,y)=>x>y?x+y:0, 4)([1,2,3])).should.equal('10')
			JSON.stringify(foldl((x,y)=>x>y?x+y:0, 0)([1,2,3])).should.equal('0')
			JSON.stringify(filter((x)=>x>2)([1,2,3])).should.equal('[3]');

      (reduce((x,y)=>x+y, 0)([]) === 0).should.equal(true)

			JSON.stringify(compose(reduce((x,y)=>x+y, 0), map((x)=>x*x), filter((x)=>x<4), flatten)
        ([[[[[[[0],1],2],3],4],5],6]))
        .should.equal('14');
	});

	it ('should compact by returning all truthy values', () => {
		JSON.stringify(compact([1,2,false, "", 3])).should.equal("[1,2,3]");
	});
	it ('should compact with second argument', () => {
		JSON.stringify(compact(["John",1, 2, "Jane"],'')).should.equal('["John","Jane"]');
	});
	it ('should compact in currying way', () => {
		JSON.stringify(compose(compact(''))(["John",1, 2, "Jane"])).should.equal('["John","Jane"]');
	});

	it ('should concat arrays', () => {
    JSON.stringify(concat([1,2,3],4,5)).should.equal("[1,2,3,4,5]")
		JSON.stringify(concat([1,2,3],[4],[5])).should.equal("[1,2,3,4,5]")
		JSON.stringify(concat([1,2,3],[4,5])).should.equal("[1,2,3,4,5]")
	});
  it ('should concat in currying way', () => {
    JSON.stringify(compose(concat([1,2,3]))(4,5)).should.equal("[1,2,3,4,5]")
  });
	it ('should concat with a function', () => {
		JSON.stringify(concat([1,2,3],4,5, x=>x>3)).should.equal("[4,5]")
	});


	it ('should return boolean if value is contain in array or not', () => {
		contains([2,3,4,5],5).should.equal(true)
	});
	it ('should return boolean if value is contain in array or not in currying way', () => {
		contains(5)([2,3,4,5]).should.equal(true)
	});



	it (`should find the difference between 2 arrays
		when no other arguments are specified with the first as main without duplicates`, () => {
		JSON.stringify(difference(
			["Naa", "Kofi", "Mensah"],
			["Naa", "Mensah", "Tsatsu", "Amevor","Amevor"]))
			.should.equal('["Tsatsu","Amevor"]');
	});

	it ('should find the difference between the 3rd and 1st arrays ', () => {
		JSON.stringify(difference(
			["May","Joe","John"],
		["Jane", "Joe", "John","Kay","May","Q"],
		["May", "Suzzie", "Fri"],
		3,1)).should.equal('["Joe","John"]')
	});

	it ('should find the difference between the 1st and 3rd arrays', () => {
		JSON.stringify(difference(
			["May","Joe","John"],
		["Jane", "Joe", "John","Kay","May","Kai"],
		["May", "Kwei", "Fri"],
		1,3)).should.equal('["Kwei","Fri"]')
	});



	it ('should find the difference between the 1st and 3rd arrays', () => {
		JSON.stringify(differenceWithDup(
			["May","Joe","John"],
		["Jane", "Joe", "John","Kay","May","Kai"],
		["May", "Kwei", "Fri", "Fri"],
		1,3)).should.equal('["Kwei","Fri","Fri"]')
	});

	it (`should find the difference between 2 arrays
		when no other arguments are specified with the first as main
		even when no duplicates are involved`, () => {
		JSON.stringify(differenceWithDup(
			["Naa", "Kofi", "Mensah"],
			["Naa", "Mensah", "Tsatsu", "Amevor"]))
			.should.equal('["Tsatsu","Amevor"]');
	});

	it ('should find the difference between the 3rd and 1st arrays with duplicates', () => {
		JSON.stringify(differenceWithDup(
			["May","Joe","John","Joe"],
		["Jane", "Joe", "John","Kay","May","Q"],
		["May", "Suzzie", "Fri"],
		3,1)).should.equal('["Joe","John","Joe"]')
	});




	it ('should return array when dropCount is 0 and no function is passed', () => {
		JSON.stringify(drop([1,2,3],0)).should.equal('[1,2,3]');
	});
	it ('should return array when dropCount is 0 and no function is passed and either right or left is passed', () => {
		JSON.stringify(drop([1,2,3],0,"left")).should.equal('[1,2,3]');
		JSON.stringify(drop([1,2,3],0,"right")).should.equal('[1,2,3]');
	});
	it ('should drop one element from left when only array is passed as argument', () => {
		JSON.stringify(drop([1,2,3])).should.equal('[2,3]');
	});
	it ('should drop one element from left when array and left is passed as argument', () => {
		JSON.stringify(drop([1,2,3],1,"left")).should.equal('[2,3]');
	});
	it ('should drop one element from right when array and right is passed as argument', () => {
		JSON.stringify(drop([1,2,3],1,"right")).should.equal('[1,2]');
	});
	it ('should drop specified number of elements from left when only array and dropCount is passed as argument', () => {
		JSON.stringify(drop([1,2,3],2)).should.equal('[3]');
	});
	it ('should drop specified number of elements from left when left is passed as argument', () => {
		JSON.stringify(drop([1,2,3],2,"left")).should.equal('[3]');
	});
	it ('should drop specified number of elements from right when right is passed as argument', () => {
		JSON.stringify(drop([1,2,3],2,"right")).should.equal('[1]');
	});

	it ('should drop specified number of elements from left and filter remaining values with passed in function', () => {
		JSON.stringify(drop([1,2,3,4,5,6],3,"left",x=>x>5)).should.equal('[6]');
	});
	it ('should drop specified number of elements from right and filter remaining values with passed in function', () => {
		JSON.stringify(drop([1,2,3,4,5,6],3,"right",x=>x>2)).should.equal('[3]');
	});
	it ('should drop specified number of elements from right and filter remaining values with passed in function in currying way', () => {
		JSON.stringify(drop(3,"right",x=>x>2)([1,2,3,4,5,6])).should.equal('[3]');
	});


	it ('should fill and return new array with specified value', () => {
		JSON.stringify(fill([1,2,3],4)).should.equal('[4,4,4]');
	});
	it ('should fill Array object and return new array with specified value', () => {
		JSON.stringify(fill(Array(3),4)).should.equal('[4,4,4]');
	});
	it ('should fill array with specified value till the end when endIndex isn\'t provided', () => {
		JSON.stringify(fill([1,1,3,3,5],"*",0)).should.equal('["*","*","*","*","*"]');
	});
	it ('should fill array with specified value till the end when endIndex and startIndex aren\'t provided', () => {
		JSON.stringify(fill([1,1,3,3,5],"*")).should.equal('["*","*","*","*","*"]');
	});
	it ('should fill array at specified indexes with specified value', () => {
		JSON.stringify(fill([1,1,3,3,5],"*",0,2)).should.equal('["*","*","*",3,5]');
	});
	it ('should return array when startIndex is greater than array', () => {
		JSON.stringify(fill([1,1,3,3,5],"*",5)).should.equal('[1,1,3,3,5]');
	});
	it ('should return array when startIndex and endIndex are greater than array', () => {
		JSON.stringify(fill([1,1,3,3,5],"*",6,6)).should.equal('[1,1,3,3,5]');
	});
	it ('should return array when startIndex and endIndex are greater than array in currying way', () => {
		JSON.stringify(fill("*",6,6)([1,1,3,3,5])).should.equal('[1,1,3,3,5]');
	});


	it ('should return first element\'s index for which function equals true', () => {
		JSON.stringify(findIndex(x=>x%2==0, [1,3,4,2,6])).should.equal('2');
    JSON.stringify(find(x=>x%2==0, [1,3,4,2,6])).should.equal('4');
		JSON.stringify(compose(findIndex(x=>x%2==0), map((x)=>x/2))([2,6,8,4,12])).should.equal('2');
	});


	it ('should return last element\'s index for which function equals true', () => {
		JSON.stringify(findLastIndex(x=>x%2==0, [1,3,4,2,6])).should.equal('4');
		JSON.stringify(findLast(x=>x%2==0, [1,3,4,2,6])).should.equal('6');
    JSON.stringify(compose(findLastIndex(x=>x%2==0), map((x)=>x/2))([2,6,8,4,12])).should.equal('4');
	});


	it ('should return empty array if passed in array is empty', () => {
		JSON.stringify(head([])).should.equal('[]');
	});
	it ('should return first element if array contains elements', () => {
		JSON.stringify(head([1,2,3])).should.equal('1');
	});


	it ('should return an object with key-values pairs from array', () => {
		JSON.stringify(fromPairs([['a', 1], ['b', 2]])).should.equal('{"a":1,"b":2}')
	});


	it ('should return all but last value of array', () => {
		JSON.stringify(initial([1,2,3,4])).should.equal('[1,2,3]');
	});



	it (`should find the intersection between 2 arrays
		when no other arguments are specified with the first as main`, () => {
		JSON.stringify(intersection(
			["Naa", "Kofi", "Mensah"],
			["Naa", "Mensah", "Tsatsu", "Amevor"]))
			.should.equal('["Naa","Mensah"]');
	});

	it ('should find the intersection between the 3rd and 1st arrays ', () => {
		JSON.stringify(intersection(
			["May","Joe","John"],
		["Jane", "Joe", "John","Kay","May","Q"],
		["Joe", "Suzzie", "May"],
		3,1)).should.equal('["Joe","May"]')
	});

	it ('should find the intersection between the 1st and 3rd arrays', () => {
		JSON.stringify(intersection(
			["May","Joe","John"],
		["Jane", "Joe", "John","Kay","May","Q"],
		["Joe", "Suzzie", "May"],
		1,3)).should.equal('["May","Joe"]')
	});


	it ('should join 2 arrays with speficied joiner', () => {
		(join("~",[1,2],[3,4])).should.equal('1~2~3~4');
	});

	it ('should join several arrays with specified joiner', () => {
		(join("~",[1,2],[3,4],[5,6],[7,8])).should.equal('1~2~3~4~5~6~7~8');
	});
	it ('should join several arrays in currying way', () => {
		(join("~")([1,2],[3,4],[5,6],[7,8])).should.equal('1~2~3~4~5~6~7~8');
	});


	it ('should return nth value at the index number specified', () => {
		nth([1,2,3,4],2).should.equal(3);
	});
	it ('should return nth value at the index number specified in currying way', () => {
		nth(2)([1,2,3,4]).should.equal(3);
	});

	it ('should return the nth value starting from the end when a negative number is specified', () => {
		nth([1,2,3,4],-2).should.equal(2);
	});


	it ('should return array excluding specified values', () => {
		JSON.stringify(pull(["Naa","Esi","Aku","Awo","Ajo"],"Ajo","Aku"))
			.should.equal('["Naa","Esi","Awo"]')
	});



	it ('should return lowest index of value if to be added to array', () => {
		sortedIndex(["Aaron", "Joe"], "Fred").should.equal(1);
	});

	it (`should correctly return lowest index of value
		if to be added to array even if it's an array of numbers`, () => {
		sortedIndex([1, 30, 4],21).should.equal(2);
	});

	it (`should correctly return lowest last index if value and array are of different types`, () => {
		sortedIndex([30, 50, 15], "Fred").should.equal(3);
	});

	it (`should correctly return lowest index of value
		if to be added to array even if it's an array of numbers`, () => {
		sortedIndex([4, 5, 5, 5, 6], 5).should.equal(1);
	});



	it (`should correctly return highest index of value
		if to be added to array even if it's an array of numbers`, () => {
		sortedIndex([4, 5, 5, 5, 6], 5,"last").should.equal(4);
	});
	it (`should correctly return highest index of value
		if to be added to array even if it's an array of numbers in currying way`, () => {
		sortedIndex(5,"last")([4, 5, 5, 5, 6]).should.equal(4);
	});

	it (`should correctly return highest last index if value and array are of different types`, () => {
		sortedIndex([30, 50, 15], "Fred","last").should.equal(3);
	});

	it ('should return array excluding specified values in currying way', () => {
		JSON.stringify(pull("Ajo","Aku")(["Naa","Esi","Aku","Awo","Ajo"]))
			.should.equal('["Naa","Esi","Awo"]')
	});



	it ('should return sorted array of numbers without duplicates', () => {
		JSON.stringify(sortedUniq([1,2,2,3,4])).should.equal("[1,2,3,4]")
	});

	it ('should return sorted array of letters without duplicates', () => {
		JSON.stringify(sortedUniq(["Apple","Cat","Boy","Boy"]))
			.should.equal('["Apple","Boy","Cat"]')
	});


	it ('should unify 2 arrays without duplicates', () => {
		JSON.stringify(union([2],[1,2])).should.equal('[2,1]');
	});
	it ('should unify 2 arrays without duplicates in currying way', () => {
		JSON.stringify(union([2])([1,2])).should.equal('[2,1]');
	});

	it ('should unify 2 arrays with duplicates', () => {
		JSON.stringify(union([2],[1,2],true)).should.equal('[2,1,2]');
	});
	it ('should unify 2 arrays with duplicates in currying way (many forms)', () => {
		JSON.stringify(union([2])([1,2],true)).should.equal('[2,1,2]');
		JSON.stringify(union([1,2],true)([2])).should.equal('[2,1,2]');
	});


	it ('should zip arrays into one array', () => {
		JSON.stringify(zip(['a', 'b'], [1, 2], [true, false])).should.equal('[["a",1,true],["b",2,false]]')
	});

	it (`should zip arrays into one array and return null ("undefined")
		as index values for arrays with length less than that of the first array`, () => {
		JSON.stringify(zip(['a', 'b','c'], [1, 2], [true, false])).should.equal(`[["a",1,true],["b",2,false],["c",${null},${null}]]`)
	});

	it (`should zip arrays into one array and not return null ("undefined")
		as index values for arrays with length greater than that of the first array`, () => {
		JSON.stringify(zip(['a', 'b'], [1, 2, 3], [true, false])).should.equal(`[["a",1,true],["b",2,false]]`)
	});


	it ('should unzip arrays into one array', () => {
		JSON.stringify(unzip([["a",1,true],["b",2,false]])).should.equal('[["a","b"],[1,2],[true,false]]')
	});
})
