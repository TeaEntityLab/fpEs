import {
  compose, curry, trampoline,
  chunk, range, tail, shift, unique, snooze,
  clone, propEq, get, matches, memoize,
  flatten, flattenMap, unary, pipe, debounce, schedule, ifelse, not, spread, gather, partial, partialRight, partialProps, when, prop, foldl, foldr, take,
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

	it ('range', function () {
		JSON.stringify(range(0)).should.equal('[]');
		JSON.stringify(range(5)).should.equal('[0,1,2,3,4]');
	});

	it ('pipe', function () {
		pipe((x)=>x*10, (x)=>x+10, (x)=>x-8)(4).should.equal(42);
		pipe((x,y)=>x*y, (x)=>x+2)(4,10).should.equal(42);
	});

	it ('debounce', function () {
		var r = debounce(()=>{}, 100);
		(typeof r.ref).should.not.equal('undefined');
		(typeof r.cancel).should.equal('function');
		clearTimeout(r.ref);
	});

	it ('schedule', function () {
		var r = schedule(()=>{}, 1000);
		(typeof r.ref).should.not.equal('undefined');
		(typeof r.cancel).should.equal('function');
		r.cancel();
	});

	it ('ifelse', function () {
		ifelse(()=>true, ()=>'was_else', ()=>'was_fn').should.equal('was_fn');
		ifelse(()=>false, ()=>'was_else', ()=>'was_fn').should.equal('was_else');
	});

	it ('not', function () {
		not(x=>true, 1).should.equal(false);
		not(x=>false, 1).should.equal(true);
	});

	it ('spread', function () {
		spread((a,b)=>a+b)([1,2]).should.equal(3);
	});

	it ('gather', function () {
		JSON.stringify(gather(x=>x, 1,2,3)).should.equal('[1,2,3]');
	});

	it ('partial', function () {
		partial((a,b,c)=>a+b+c, 1,2)(3).should.equal(6);
	});

	it ('partialRight', function () {
		partialRight((a,b,c)=>a+b+c, 3)(1,2).should.equal(6);
	});

	it ('partialProps', function () {
		partialProps(({a,b,c})=>a+b+c, {a:1})({b:2,c:3}).should.equal(6);
	});

	it ('when', function () {
		when(()=>true, ()=>'fn').should.equal('fn');
		(when(()=>false, ()=>'fn') === undefined).should.equal(true);
	});

	it ('prop', function () {
		prop('a')({a:1}).should.equal(1);
		(prop('b')({a:1}) === undefined).should.equal(true);
	});

	it ('unary', function () {
		unary(parseInt)('10', 0, 3).should.equal(10);
	});

	it ('memoize', function () {
		var callCount = 0;
		var fn = memoize(function(x) { callCount++; return x * 2; });
		fn(5).should.equal(10);
		callCount.should.equal(1);
		fn(5).should.equal(10);
		callCount.should.equal(1);
		fn(6).should.equal(12);
		callCount.should.equal(2);
	});

	it('curry empty invocation', function () {
		(()=>curry(()=>{})()).should.throw();
	});

	it('debounce cancel', function () {
		var r = debounce(()=>{}, 100);
		r.cancel();
	});

	it('schedule cancel', function () {
		var r = schedule(()=>{}, 1000);
		(typeof r.ref).should.not.equal('undefined');
		r.cancel();
	});

	it('find not found', function () {
		should(find(x=>false, [1,2,3])).equal(undefined);
	});

	it('findIndex not found', function () {
		findIndex(x=>false, [1,2,3]).should.equal(-1);
	});

	it('findLast not found', function () {
		should(findLast(x=>false, [1,2,3])).equal(undefined);
	});

	it('findLastIndex not found', function () {
		findLastIndex(x=>false, [1,2,3]).should.equal(-1);
	});

	it('trampoline immediate', function () {
		trampoline(function(x) { return x + 1; })(5).should.equal(6);
	});

	it('tail single element', function () {
		JSON.stringify(tail([1])).should.equal('[]');
	});

	it('shift empty', function () {
		(shift([]) === undefined).should.equal(true);
	});

	it('take zero', function () {
		JSON.stringify(take(0, [1,2,3])).should.equal('[]');
	});

	it('head returns first element', function () {
		head([42, 1, 2]).should.equal(42);
	});

	it('reverse string', function () {
		reverse('abc').should.equal('cba');
	});

	it('reverse single element', function () {
		JSON.stringify(reverse([1])).should.equal('[1]');
	});

	it('flatten already flat', function () {
		JSON.stringify(flatten([1,2,3])).should.equal('[1,2,3]');
	});

	it('flatten empty array', function () {
		JSON.stringify(flatten([])).should.equal('[]');
	});

	it('map on empty array', function () {
		JSON.stringify(map(x=>x*2)([])).should.equal('[]');
	});

	it('filter on empty array', function () {
		JSON.stringify(filter(x=>true)([])).should.equal('[]');
	});

	it('foldl foldr with empty', function () {
		foldl((x,y)=>x+y, 0)([]).should.equal(0);
		foldr((x,y)=>x+y, 0)([]).should.equal(0);
	});

	it('fromPairs empty', function () {
		JSON.stringify(fromPairs([])).should.equal('{}');
	});

	it('initial single element', function () {
		JSON.stringify(initial([1])).should.equal('[]');
	});

	it('head empty array', function () {
		JSON.stringify(head([])).should.equal('[]');
	});

	it('tail empty', function () {
		JSON.stringify(tail([])).should.equal('[]');
	});

	it('unique empty', function () {
		JSON.stringify(unique([])).should.equal('[]');
	});

	it('unique single', function () {
		JSON.stringify(unique([42])).should.equal('[42]');
	});

	it('reverse empty string', function () {
		reverse('').should.equal('');
	});

	it('drop right zero with filter', function () {
		JSON.stringify(drop([1,2,3], 0, "right", x=>x>1)).should.equal('[2,3]');
	});

	it('snooze zero', function () {
		return snooze(0).then(()=>'ok').then((x)=>x.should.equal('ok'));
	});

	it('nth out of bounds', function () {
		(nth([1,2,3], 10) === undefined).should.equal(true);
	});

	it('initial empty', function () {
		JSON.stringify(initial([])).should.equal('[]');
	});

	it('contains empty', function () {
		contains([], 1).should.equal(false);
	});

	it('matches empty rule', function () {
		matches({})({a:1}).should.equal(true);
	});

	it('fill with object', function () {
		JSON.stringify(fill([1,2], {a:1})).should.equal('[{"a":1},{"a":1}]');
	});

	it('zip single array', function () {
		JSON.stringify(zip(['a','b','c'])).should.equal('[["a"],["b"],["c"]]');
	});

	it('take positive n empty list', function () {
		JSON.stringify(take(4, [])).should.equal('[]');
	});

	it('curry extra args', function () {
		curry((x, y) => x + y)(1, 2, 3).should.equal(3);
	});

	it('curry single call', function () {
		curry((x, y, z) => x + y + z)(1, 2, 3).should.equal(6);
	});

	it('clone NaN', function () {
		(clone(NaN) === null).should.equal(true);
	});

	it('clone number', function () {
		clone(0).should.equal(0);
	});

	it('compact empty with type', function () {
		JSON.stringify(compact([], '')).should.equal('[]');
	});

	it('compose single', function () {
		compose((x)=>x+1)(5).should.equal(6);
	});

	it('not direct', function () {
		not(x=>x>3, 5).should.equal(false);
		not(x=>x>3, 1).should.equal(true);
	});

	it('compose identity', function () {
		(()=>compose()(42)).should.throw();
	});

	it('reduce empty with init', function () {
		reduce((a,b)=>a+b, 0)([]).should.equal(0);
	});

	it('reduce direct', function () {
		reduce((a,b)=>a+b, 0, [1,2,3]).should.equal(6);
	});

	it('curry progressive', function () {
		var f = curry((x, y, z) => x + y + z);
		f(1)(2)(3).should.equal(6);
	});

	it('debounce cancel returns', function () {
		var r = debounce(()=>{}, 100);
		var result = r.cancel();
		(typeof r.cancel).should.equal('function');
		r.cancel.should.not.throw();
	});

	it('schedule cancel returns', function () {
		var r = schedule(()=>{}, 1000);
		var result = r.cancel();
		(typeof r.cancel).should.equal('function');
		r.cancel.should.not.throw();
	});

	it('pull values not found', function () {
		JSON.stringify(pull([1,2,3], 4,5)).should.equal('[1,2,3]');
	});

	it('differenceWithDup no difference', function () {
		JSON.stringify(differenceWithDup([1,2,3], [1,2,3])).should.equal('[]');
	});

	it('intersection no match', function () {
		JSON.stringify(intersection([1,2], [3,4])).should.equal('[]');
	});
})

describe('Fp - extended coverage', function () {
	// compose / pipe arity & composition
	it('compose 3 fns left-to-right inside-out', function () {
		compose(x=>x+1, x=>x*2, x=>x-3)(10).should.equal(15);
	});
	it('pipe 3 fns left-to-right', function () {
		pipe(x=>x-3, x=>x*2, x=>x+1)(10).should.equal(15);
	});
	it('compose preserves multi-arg innermost fn', function () {
		compose(x=>x+1, (a,b)=>a*b)(4,5).should.equal(21);
	});
	it('pipe single fn is identity-like', function () {
		pipe(x=>x*3)(7).should.equal(21);
	});

	// curry boundaries
	it('curry 4-arity fully progressive', function () {
		curry((a,b,c,d)=>a+b+c+d)(1)(2)(3)(4).should.equal(10);
	});
	it('curry 4-arity mixed grouping', function () {
		curry((a,b,c,d)=>a+b+c+d)(1,2)(3)(4).should.equal(10);
		curry((a,b,c,d)=>a+b+c+d)(1)(2,3)(4).should.equal(10);
		curry((a,b,c,d)=>a+b+c+d)(1,2,3)(4).should.equal(10);
	});
	it('curry exact arity single shot', function () {
		curry((a,b,c,d)=>a+b+c+d)(1,2,3,4).should.equal(10);
	});

	// chunk variants
	it('chunk uneven leaves remainder', function () {
		JSON.stringify(chunk([1,2,3,4,5],2)).should.equal('[[1,2],[3,4],[5]]');
	});
	it('chunk size 1 wraps each element', function () {
		JSON.stringify(chunk([1,2,3],1)).should.equal('[[1],[2],[3]]');
	});
	it('chunk size >= length yields single chunk', function () {
		JSON.stringify(chunk([1,2,3],10)).should.equal('[[1,2,3]]');
	});

	// memoize collisions / distinct
	it('memoize object args collide via stringify', function () {
		var calls = 0;
		var fn = memoize(function (o) { calls++; return o.x; });
		fn({x:1}); fn({x:2});
		calls.should.equal(1); // both -> '[object Object]'
	});
	it('memoize distinct primitive keys', function () {
		var calls = 0;
		var fn = memoize(function (a,b) { calls++; return a+b; });
		fn(1,2).should.equal(3);
		fn(1,2).should.equal(3);
		fn(2,3).should.equal(5);
		calls.should.equal(2);
	});

	// take currying & bounds
	it('take curried form', function () {
		JSON.stringify(take(2)([9,8,7,6])).should.equal('[9,8]');
	});
	it('take more than length returns all', function () {
		JSON.stringify(take(99, [1,2])).should.equal('[1,2]');
	});

	// nth negative behavior (documented quirk)
	it('nth -3 returns last of length-3', function () {
		nth([10,20,30],-3).should.equal(30);
	});
	it('nth zero index', function () {
		nth([10,20,30],0).should.equal(10);
	});
	it('nth curried negative', function () {
		nth(-3)([10,20,30]).should.equal(30);
	});

	// drop left + filter
	it('drop left then filter even', function () {
		JSON.stringify(drop([1,2,3,4,5,6],2,'left',x=>x%2===0)).should.equal('[4,6]');
	});
	it('drop default direction equals left', function () {
		JSON.stringify(drop([1,2,3,4],2)).should.equal('[3,4]');
	});

	// concat with function filter on multiple arrays
	it('concat multiple arrays then filter', function () {
		JSON.stringify(concat([1,2,3],[4,5,6],x=>x>3)).should.equal('[4,5,6]');
	});
	it('concat empty values returns curried fn', function () {
		(typeof concat([1,2,3])).should.equal('function');
		JSON.stringify(concat([1,2,3])(4,5)).should.equal('[1,2,3,4,5]');
	});

	// join currying & multi
	it('join curried with two arrays', function () {
		join('-')([1,2],[3]).should.equal('1-2-3');
	});
	it('join single array', function () {
		join('+', [1,2,3]).should.equal('1+2+3');
	});

	// union curry forms
	it('union dup curried (list,true)(other)', function () {
		JSON.stringify(union([1,2],true)([2,3])).should.equal('[2,3,1,2]');
	});
	it('union no-dup default', function () {
		JSON.stringify(union([1,2],[2,3])).should.equal('[1,2,3]');
	});

	// intersection with explicit indices
	it('intersection 1st vs 3rd by index', function () {
		JSON.stringify(intersection(['a','b'],['x'],['b','a'],1,3)).should.equal('["a","b"]');
	});

	// sortedUniq strings
	it('sortedUniq sorts and dedups strings', function () {
		JSON.stringify(sortedUniq(['b','a','b','c'])).should.equal('["a","b","c"]');
	});

	// sortedIndex last for numbers with duplicates
	it('sortedIndex last among duplicates', function () {
		sortedIndex([1,2,2,2,3],2,'last').should.equal(4);
	});

	// unzip round-trips zip
	it('unzip transposes pairs', function () {
		JSON.stringify(unzip([[1,2],[3,4]])).should.equal('[[1,3],[2,4]]');
	});
	it('zip/unzip round trip', function () {
		var z = zip([1,2,3],[4,5,6]);
		JSON.stringify(unzip(z)).should.equal('[[1,2,3],[4,5,6]]');
	});

	// not curry single-arg path (no extra args)
	it('not with no extra args negates nullary fn', function () {
		not(()=>false).should.equal(true);
		not(()=>true).should.equal(false);
	});

	// gather single-arg path -> empty gather
	it('gather with only fn passes empty array', function () {
		gather(x=>x.length).should.equal(0);
		JSON.stringify(gather(x=>x)).should.equal('[]');
	});

	// partial / partialRight single-arg (no preset args)
	it('partial with no preset args forwards later args', function () {
		partial((a,b,c)=>a+b+c)(1,2,3).should.equal(6);
	});
	it('partialRight with no preset args forwards later args', function () {
		partialRight((a,b,c)=>a+b+c)(1,2,3).should.equal(6);
	});
	it('partial presets then later', function () {
		partial((a,b,c,d)=>`${a}${b}${c}${d}`, 'a','b')('c','d').should.equal('abcd');
	});
	it('partialRight presets appended last', function () {
		partialRight((a,b,c,d)=>`${a}${b}${c}${d}`, 'c','d')('a','b').should.equal('abcd');
	});

	// pull with only list (no values to remove)
	it('pull with no values returns list unchanged', function () {
		JSON.stringify(pull([1,2,3])).should.equal('[1,2,3]');
	});
	it('pull removes all occurrences', function () {
		JSON.stringify(pull([1,2,1,3,1],1)).should.equal('[2,3]');
	});

	// clone deep independence
	it('clone deep object is independent', function () {
		var orig = {a:{b:1}};
		var cl = clone(orig);
		cl.a.b = 99;
		orig.a.b.should.equal(1);
	});
	it('clone array is independent', function () {
		var orig = [[1],[2]];
		var cl = clone(orig);
		cl[0][0] = 42;
		orig[0][0].should.equal(1);
	});

	// compact with numeric type filter
	it('compact keeps only numbers when typ is number', function () {
		JSON.stringify(compact([1,'a',2,null,3,undefined],0)).should.equal('[1,2,3]');
	});
	it('compact keeps only strings when typ is string', function () {
		JSON.stringify(compact([1,'a',2,'b'],'')).should.equal('["a","b"]');
	});

	// fold direction sensitivity
	it('foldr folds right-to-left', function () {
		foldr((acc,x)=>acc+'-'+x, 'i')([1,2,3]).should.equal('i-3-2-1');
	});
	it('foldl folds left-to-right', function () {
		foldl((acc,x)=>acc+'-'+x, 'i')([1,2,3]).should.equal('i-1-2-3');
	});

	// flattenMap
	it('flattenMap maps then flattens', function () {
		JSON.stringify(flattenMap(x=>[x,x*10])([1,2])).should.equal('[1,10,2,20]');
	});

	// fill inclusive range
	it('fill within explicit index range (inclusive end)', function () {
		JSON.stringify(fill([0,0,0,0,0],9,1,3)).should.equal('[0,9,9,9,0]');
	});

	// reverse immutability
	it('reverse does not mutate source array', function () {
		var a = [1,2,3];
		reverse(a);
		JSON.stringify(a).should.equal('[1,2,3]');
	});

	// difference with explicit indices (1st vs 3rd)
	it('difference 1st vs 3rd by index', function () {
		JSON.stringify(difference(['a','b','c'],['z'],['b','x'],1,3)).should.equal('["x"]');
	});

	// trampoline returns immediately for non-function
	it('trampoline returns non-function result directly', function () {
		trampoline(x=>x*2)(21).should.equal(42);
	});

	// unary ignores extra args
	it('unary applies only first arg', function () {
		unary((a,b)=>b===undefined)(1).should.equal(true);
	});

	// spread / gather inverse-ish
	it('spread applies array as args', function () {
		spread((a,b,c)=>a+b+c)([1,2,3]).should.equal(6);
	});

	// when truthy/falsy
	it('when returns undefined for false test', function () {
		(when(()=>false, ()=>'x') === undefined).should.equal(true);
	});
	it('when runs fn for true test', function () {
		when(()=>true, ()=>'x').should.equal('x');
	});

	// ifelse both branches
	it('ifelse picks fn branch when test true', function () {
		ifelse(()=>true, ()=>'else', ()=>'fn').should.equal('fn');
	});
	it('ifelse picks else branch when test false', function () {
		ifelse(()=>false, ()=>'else', ()=>'fn').should.equal('else');
	});

	// propEq / get / matches combos
	it('propEq false on mismatch', function () {
		propEq(1)('a')({a:2}).should.equal(false);
	});
	it('matches partial rule subset', function () {
		matches({a:1})({a:1,b:2}).should.equal(true);
		matches({a:1,c:3})({a:1,b:2}).should.equal(false);
	});

	// head / tail / initial / shift interplay
	it('head/tail decompose list', function () {
		head([1,2,3]).should.equal(1);
		JSON.stringify(tail([1,2,3])).should.equal('[2,3]');
	});
	it('initial drops last', function () {
		JSON.stringify(initial([1,2,3])).should.equal('[1,2]');
	});

	// fromPairs round trips with object
	it('fromPairs builds object from entries', function () {
		JSON.stringify(fromPairs([['x',1],['y',2]])).should.equal('{"x":1,"y":2}');
	});
});

describe('Fp - bug-fix regressions', function () {
	// difference: dedup offset must use the deduped main size, not raw
	// main.length, otherwise internal duplicates in `main` shift the slice.
	it('difference handles internal duplicates in main', function () {
		JSON.stringify(difference([1,1,2],[2,3])).should.equal('[3]');
		JSON.stringify(difference([1,1],[1,2,3])).should.equal('[2,3]');
	});
	it('difference unchanged when main has no duplicates', function () {
		JSON.stringify(difference([1,2],[2,3])).should.equal('[3]');
		JSON.stringify(difference(['a','b','c'],['z'],['b','x'],1,3)).should.equal('["x"]');
	});
	// difference keeps string / array-like generality: main.concat(follower)
	// is preserved so a string follower is split char-wise, not appended whole.
	it('difference preserves string (array-like) inputs', function () {
		JSON.stringify(difference('ab','bc')).should.equal('["c"]');
		// dup chars in main used to overshoot the slice — now also fixed
		JSON.stringify(difference('aab','bc')).should.equal('["c"]');
	});


	// take must not mutate its input array (it used list.shift()).
	it('take does not mutate its input', function () {
		var src = [1,2,3,4];
		JSON.stringify(take(2, src)).should.equal('[1,2]');
		JSON.stringify(src).should.equal('[1,2,3,4]');
	});
	// take is now array-like-safe: it slices instead of Array#shift, so
	// strings and arguments objects work (they threw on list.shift before).
	it('take accepts string and arguments (array-like) inputs', function () {
		JSON.stringify(take(2, 'abcd')).should.equal('["a","b"]');
		var argsFix = function () { return take(2, arguments); };
		JSON.stringify(argsFix('a','b','c','d')).should.equal('["a","b"]');
	});


	// fill: Array(...list) hit the single-numeric Array(len) trap; a
	// one-element numeric array produced sparse nulls instead of a fill.
	it('fill handles a single-element numeric array', function () {
		JSON.stringify(fill([5], 9)).should.equal('[9]');
		JSON.stringify(fill([7], '*')).should.equal('["*"]');
	});

	// intersection: the inner `list[x] == undefined` guard indexed by value,
	// dropping elements whose value collided with an already-filled index.
	it('intersection keeps elements colliding with array indices', function () {
		JSON.stringify(intersection([2,0],[2,0])).should.equal('[2,0]');
		JSON.stringify(intersection([0,1,2],[0,1,2])).should.equal('[0,1,2]');
		JSON.stringify(intersection([1,0],[1,0])).should.equal('[1,0]');
	});

	// getMainAndFollower: last two args are index selectors only when both are
	// plain numbers; a single-element array like [9] is the main list, not index 9.
	describe('getMainAndFollower numeric array indices', function () {
		it('difference treats single-element numeric array as main not index', function () {
			JSON.stringify(difference([9], [1,2,3])).should.equal('[1,2,3]');
		});
		it('differenceWithDup treats single-element numeric array as main not index', function () {
			JSON.stringify(differenceWithDup([9], [1,2,3])).should.equal('[1,2,3]');
		});
		it('difference still honors explicit main/follower index selectors', function () {
			JSON.stringify(difference(['a','b','c'], ['z'], ['b','x'], 1, 3)).should.equal('["x"]');
		});
	});

	it('pull missing value does not throw when value is numeric', function () {
		JSON.stringify(pull([1,2,3], 9)).should.equal('[1,2,3]');
	});
});

describe('Fp - risk/edge regressions', function () {
	it('contains throws TypeError on string arg (no array-like support)', function () {
		(() => contains('abc', 'b')).should.throw();
	});
	it('chunk(list, 0) throws RangeError', function () {
		(() => chunk([1, 2, 3], 0)).should.throw();
	});
	it('chunk(list, -1) throws RangeError', function () {
		(() => chunk([1, 2, 3], -1)).should.throw();
	});
	it('range(-2) throws RangeError', function () {
		(() => range(-2)).should.throw();
	});
	it('sortedUniq on mixed types sorts numerically then trailing strings', function () {
		JSON.stringify(sortedUniq([3, 1, 'a', 2])).should.equal('[1,2,3,"a"]');
	});
	it('zip pads missing pairs with null when first array is longer', function () {
		JSON.stringify(zip([1, 2, 3], [4, 5])).should.equal('[[1,4],[2,5],[3,null]]');
	});
	it('compact(list, typ) keeps elements whose typeof matches typ', function () {
		JSON.stringify(compact([1, 'a', 2, 'b'], 0)).should.equal('[1,2]');
	});
	it('difference with explicit trailing numeric positions selects main/follower by index', function () {
		JSON.stringify(difference([9, 9], [1, 2], [3, 4], 2, 3)).should.equal('[3,4]');
	});
	it('union(a, b, true) keeps duplicates', function () {
		JSON.stringify(union([1, 2], [2, 3], true)).should.equal('[1,2,2,3]');
	});
	it('take with n greater than length or zero', function () {
		JSON.stringify(take(10, [1, 2, 3])).should.equal('[1,2,3]');
		JSON.stringify(take(0, [1, 2, 3])).should.equal('[]');
	});
	it('nth out of bounds returns undefined', function () {
		(nth([1, 2, 3], 10) === undefined).should.equal(true);
	});
	it('clone deep-copies so mutation does not affect the original', function () {
		var original = {a: {b: 1}};
		var copy = clone(original);
		copy.a.b = 99;
		original.a.b.should.equal(1);
		copy.a.b.should.equal(99);
		(original !== copy).should.equal(true);
	});
});

