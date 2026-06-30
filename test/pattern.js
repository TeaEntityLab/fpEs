import {
  either, PatternMatching, Pattern, Matchable,
  inCaseOfEqual, inCaseOfRegex, inCaseOfNull, inCaseOfClass, inCaseOfNumber, inCaseOfNaN, inCaseOfString, inCaseOfObject, inCaseOfArray, inCaseOfFunction, inCaseOfPattern, inCaseOfPatternMatching, inCaseOfCompType, inCaseOfCompTypeMatchesWithSpread,
  otherwise,

  SumType, ProductType, CompType, CompData,
  TypeNumber,
  TypeString,
  TypeNaN,
  TypeObject,
  TypeArray,
   TypeNull,
   TypeFunction,
   TypePattern,
   TypePatternMatching,
   TypeCompType,
   TypeEqualTo,
  TypeClassOf,
  TypeRegexMatches,
  TypeInCaseOf, TypeMatchesAllPatterns, TypeADT, TypeCompTypeMatchesWithSpread,
} from '../pattern';

describe('SumType', function () {
  it('Common', function () {
    var s;
    s = new SumType(new ProductType(TypeString, TypeNumber), new ProductType(TypeRegexMatches('c+')));
    (s.apply("1", "2asdf") !== undefined).should.equal(false);
    (s.apply("1", 2) !== undefined).should.equal(true);

    (s.apply("1") !== undefined).should.equal(false);
    (s.apply("ccc") !== undefined).should.equal(true);
	});
  it('Structural(Manual)', function () {
    var s;

    var patternList = [
      TypeObject,
      TypeInCaseOf((v) => (+v.id) >= 0),
      TypeInCaseOf((v) => TypeObject.matches(v.user) && v.user.id >= 0),
      otherwise(()=>false),
    ];

    var customType = TypeMatchesAllPatterns(...patternList);

    s = new SumType(new ProductType(TypeString, TypeNumber), new ProductType(customType));
    (s.apply("1", "2asdf") !== undefined).should.equal(false);
    (s.apply("1", 2) !== undefined).should.equal(true);

    (s.apply({id: -1,}) !== undefined).should.equal(false);
    (s.apply({id: 30,}) !== undefined).should.equal(false);
    (s.apply({id: 30,user: {id: -1,}}) !== undefined).should.equal(false);
    (s.apply({id: 30,user: {id: 20,}}) !== undefined).should.equal(true);
	});
  it('Structural(ADT) Object', function () {
    var s;

    var adt = {
      id: Number,
      user: {
        id: Number,
      },
    };

    var customType = TypeADT(adt);

    s = new SumType(new ProductType(customType));
    (s.apply(undefined) !== undefined).should.equal(false);
    (s.apply(null) !== undefined).should.equal(false);
    (s.apply([]) !== undefined).should.equal(false);
    (s.apply({id: 30,}) !== undefined).should.equal(false);
    (s.apply({id: 30,user: {id: NaN,}}) !== undefined).should.equal(false);

    (s.apply({id: 30,user: {id: 20,}}) !== undefined).should.equal(true);
	});
  it('Structural(ADT) Array', function () {
    var s;

    var adt = [
      {
        id: Number,
        user: {
          id: Number,
        },
      },
      {
        id: Number,
        data: {
          id: Number,
        },
        nodata: TypeNull,
      },
    ];

    var customType = TypeADT(adt);

    s = new SumType(new ProductType(customType));
    (s.apply(undefined) !== undefined).should.equal(false);
    (s.apply(null) !== undefined).should.equal(false);
    (s.apply([{id: 30,}]) !== undefined).should.equal(false);
    (s.apply([{id: 30,user: {id: NaN,}}]) !== undefined).should.equal(false);
    (s.apply([{id: 30,newdata: {id: 20,}}, {id: 30,user: {id: 20,}}]) !== undefined).should.equal(false);
    (s.apply([{id: 30,data: {id: 20,}, nodata: 33}, {id: 30,user: {id: 20,}}]) !== undefined).should.equal(false);

    (s.apply([]) !== undefined).should.equal(true);
    (s.apply([{id: 30,user: {id: 20,}}]) !== undefined).should.equal(true);
    (s.apply([{id: 30,data: {id: 20,}}, {id: 30,user: {id: 20,}}]) !== undefined).should.equal(true);
	});
  it('Structural(ADT) Composite with rules', function () {
    var s;
    var adt;
    var customType;

    // Pattern
    customType = TypeADT({
      arrayWithOrder: TypeCompTypeMatchesWithSpread(new SumType(new ProductType(TypeString, TypeNumber))),
    });
    s = new SumType(new ProductType(customType));
    (s.apply(undefined) !== undefined).should.equal(false);
    (s.apply(null) !== undefined).should.equal(false);
    (s.apply([]) !== undefined).should.equal(false);
    (s.apply({arrayWithOrder: [12, "id"]}) !== undefined).should.equal(false);
    (s.apply({arrayWithOrder: ["id", 12]}) !== undefined).should.equal(true);

    // PatternMatching
    customType = TypeADT({
      arrayWithOrder: new PatternMatching(TypeCompTypeMatchesWithSpread(new SumType(new ProductType(TypeString, TypeNumber))), otherwise((x)=>false)),
    });
    s = new SumType(new ProductType(customType));
    (s.apply(undefined) !== undefined).should.equal(false);
    (s.apply(null) !== undefined).should.equal(false);
    (s.apply([]) !== undefined).should.equal(false);
    (s.apply({arrayWithOrder: [12, "id"]}) !== undefined).should.equal(false);
    (s.apply({arrayWithOrder: ["id", 12]}) !== undefined).should.equal(true);

    // Function
    customType = TypeADT({
      arrayWithOrder: (list) => new SumType(new ProductType(TypeString, TypeNumber)).matches(...list),
    });
    s = new SumType(new ProductType(customType));
    (s.apply(undefined) !== undefined).should.equal(false);
    (s.apply(null) !== undefined).should.equal(false);
    (s.apply([]) !== undefined).should.equal(false);
    (s.apply({arrayWithOrder: [12, "id"]}) !== undefined).should.equal(false);
    (s.apply({arrayWithOrder: ["id", 12]}) !== undefined).should.equal(true);

    // CompType
    customType = TypeADT({
      data: new SumType(new ProductType(TypeString)),
    });
    s = new SumType(new ProductType(customType));
    (s.apply(undefined) !== undefined).should.equal(false);
    (s.apply(null) !== undefined).should.equal(false);
    (s.apply([]) !== undefined).should.equal(false);
    (s.apply({data: [12, "id"]}) !== undefined).should.equal(false);

    (s.apply({data: "the string"}) !== undefined).should.equal(true);
	});
  it('Structural(ADT) Function rule', function () {
      var s;
      var customType = TypeADT(Function);
      s = new SumType(new ProductType(customType));
      (s.apply(()=>42) !== undefined).should.equal(true);
      (s.apply(42) !== undefined).should.equal(false);
  });
  it('Structural(ADT) NaN rule', function () {
      var s;
      var customType = TypeADT(TypeNaN);
      s = new SumType(new ProductType(customType));
      (s.apply(NaN) !== undefined).should.equal(true);
      (s.apply(42) !== undefined).should.equal(false);
  });
  it('Structural(ADT) NaN literal', function () {
      var s;
      var customType = TypeADT(NaN);
      s = new SumType(new ProductType(customType));
      (s.apply(NaN) !== undefined).should.equal(true);
      (s.apply(42) !== undefined).should.equal(false);
  });
  it('Structural(ADT) empty object', function () {
      var s;
      var customType = TypeADT({});
      s = new SumType(new ProductType(customType));
      (s.apply(undefined) !== undefined).should.equal(false);
      (s.apply({}) !== undefined).should.equal(true);
      (s.apply({a:1}) !== undefined).should.equal(true);
  });
  it('Structural(ADT) empty array', function () {
      var s;
      var customType = TypeADT([]);
      s = new SumType(new ProductType(customType));
      (s.apply(undefined) !== undefined).should.equal(false);
      (s.apply([]) !== undefined).should.equal(true);
  });
  it('SumType extra args no match', function () {
      var st = new SumType(new ProductType(TypeString));
      st.matches("hello", "extra").should.equal(false);
  });
  it('Structural(ADT) with RegExp', function () {
      var s;
      var customType = TypeADT(RegExp);
      s = new SumType(new ProductType(customType));
      (s.apply(/test/) !== undefined).should.equal(true);
      (s.apply(42) !== undefined).should.equal(true);
  });
});
describe('pattern', function () {
  it('PatternMatching', function () {
      new PatternMatching(inCaseOfObject((x)=>JSON.stringify(x)), otherwise((x)=>false)).matchFor({}).should.equal("{}");
      new PatternMatching(inCaseOfObject((x)=>JSON.stringify(x)), otherwise((x)=>false)).matchFor([]).should.equal(false);
	});
  it('inCaseOfObject', function () {
      either({}, inCaseOfObject((x)=>JSON.stringify(x)), otherwise((x)=>false)).should.equal("{}");
      either([], inCaseOfObject((x)=>JSON.stringify(x)), otherwise((x)=>false)).should.equal(false);
      either(null, inCaseOfObject((x)=>JSON.stringify(x)), otherwise((x)=>false)).should.equal(false);
      either(undefined, inCaseOfObject((x)=>JSON.stringify(x)), otherwise((x)=>false)).should.equal(false);
      either('', inCaseOfObject((x)=>JSON.stringify(x)), otherwise((x)=>false)).should.equal(false);
      either(0, inCaseOfObject((x)=>JSON.stringify(x)), otherwise((x)=>false)).should.equal(false);
	});
  it('inCaseOfRegex', function () {
      either('ccc', inCaseOfRegex('c+', (x)=>true), otherwise((x)=>false)).should.equal(true);
      either('ccc', inCaseOfRegex(/c+/, (x)=>true), otherwise((x)=>false)).should.equal(true);
      either('', inCaseOfRegex('c+', (x)=>true), otherwise((x)=>false)).should.equal(false);
	});
  it('inCaseOfNull', function () {
      either(null, inCaseOfNull((x)=>true), otherwise((x)=>false)).should.equal(true);
      either(undefined, inCaseOfNull((x)=>true), otherwise((x)=>false)).should.equal(true);
      either('', inCaseOfNull((x)=>true), otherwise((x)=>false)).should.equal(false);
      either(0, inCaseOfNull((x)=>true), otherwise((x)=>false)).should.equal(false);
	});
  it('inCaseOfArray', function () {
      either([], inCaseOfArray((x)=>JSON.stringify(x)), otherwise((x)=>false)).should.equal("[]");
      either({}, inCaseOfArray((x)=>JSON.stringify(x)), otherwise((x)=>false)).should.equal(false);
	});
  it('inCaseOfClass', function () {
      either(new Number(1), inCaseOfClass(Number, (x)=>x+1), otherwise((x)=>x+2)).should.equal(2);
      either(new String("1"), inCaseOfClass(String, (x)=>x), otherwise((x)=>false)).should.equal("1");

      either(new String("1"), inCaseOfClass(Number, (x)=>x), otherwise((x)=>false)).should.equal(false);
      either(new Number(1), inCaseOfClass(String, (x)=>x+1), otherwise((x)=>false)).should.equal(false);
	});
  it('inCaseOfNumber', function () {
      either(new Number(1), inCaseOfNumber((x)=>x+1), otherwise((x)=>x+2)).should.equal(2);
      either(1, inCaseOfNumber((x)=>x+1), otherwise((x)=>x+2)).should.equal(2);
      either("1", inCaseOfNumber((x)=>x+1), otherwise((x)=>x+2)).should.equal(2);
      either('', inCaseOfNumber((x)=>x+1), otherwise((x)=>3)).should.equal(3);
      either(' ', inCaseOfNumber((x)=>x+1), otherwise((x)=>3)).should.equal(3);
      either(NaN, inCaseOfNumber((x)=>x+1), otherwise((x)=>3)).should.equal(3);
	});
  it('inCaseOfString', function () {
      either("1", inCaseOfString((x)=>true), otherwise((x)=>false)).should.equal(true);
      either(1, inCaseOfString((x)=>true), otherwise((x)=>false)).should.equal(false);
	});
  it('inCaseOfNaN', function () {
      either(1, inCaseOfNaN((x)=>true), otherwise((x)=>false)).should.equal(false);
      either("1", inCaseOfNaN((x)=>true), otherwise((x)=>false)).should.equal(false);
      either(NaN, inCaseOfNaN((x)=>true), otherwise((x)=>false)).should.equal(true);
	});
  it('otherwise', function () {
      var err = undefined;

      err = undefined;
			either(1, inCaseOfEqual(1, (x)=>x+1)).should.equal(2);
      (err !== undefined).should.equal(false);

      err = undefined;
			try {
        either(1, inCaseOfEqual(2, (x)=>x+1));
      } catch (e) {
        err = e;
      }
      (err !== undefined).should.equal(true);

      err = undefined;
			try {
        either(1, inCaseOfEqual(2, (x)=>x+1), otherwise((x)=>x+2)).should.equal(3);
      } catch (e) {
        err = e;
        console.log(e);
      }
      (err !== undefined).should.equal(false);
	});
  it('inCaseOfFunction', function () {
      either(()=>42, inCaseOfFunction((x)=>true), otherwise((x)=>false)).should.equal(true);
      either(42, inCaseOfFunction((x)=>true), otherwise((x)=>false)).should.equal(false);
	});
  it('inCaseOfPattern', function () {
      var p = new Pattern((v)=>true, (v)=>v);
      either(p, inCaseOfPattern((x)=>true), otherwise((x)=>false)).should.equal(true);
      either(42, inCaseOfPattern((x)=>true), otherwise((x)=>false)).should.equal(false);
	});
  it('inCaseOfPatternMatching', function () {
      var pm = new PatternMatching(inCaseOfEqual(1, ()=>'one'), otherwise(()=>'other'));
      either(pm, inCaseOfPatternMatching((x)=>true), otherwise((x)=>false)).should.equal(true);
      either(42, inCaseOfPatternMatching((x)=>true), otherwise((x)=>false)).should.equal(false);
	});
  it('inCaseOfCompType', function () {
      var st = new SumType(new ProductType(TypeString));
      either(st, inCaseOfCompType((x)=>true), otherwise((x)=>false)).should.equal(true);
      either(42, inCaseOfCompType((x)=>true), otherwise((x)=>false)).should.equal(false);
	});
  it('inCaseOfCompTypeMatchesWithSpread', function () {
      var st = new SumType(new ProductType(TypeString, TypeNumber));
      either(["hello", 42], inCaseOfCompTypeMatchesWithSpread(st, (x)=>true), otherwise((x)=>false)).should.equal(true);
      either([42, "hello"], inCaseOfCompTypeMatchesWithSpread(st, (x)=>true), otherwise((x)=>false)).should.equal(false);
	});
  it('TypeEqualTo', function () {
      TypeEqualTo(1).matches(1).should.equal(true);
      TypeEqualTo(1).matches(2).should.equal(false);
	});
  it('TypeClassOf', function () {
      TypeClassOf(Number).matches(new Number(1)).should.equal(true);
      TypeClassOf(Number).matches("1").should.equal(false);
	});
  it('TypeInCaseOf', function () {
      TypeInCaseOf((v)=>v>3).matches(5).should.equal(true);
      TypeInCaseOf((v)=>v>3).matches(1).should.equal(false);
	});
  it('TypeMatchesAllPatterns', function () {
      var pat = TypeMatchesAllPatterns(TypeString, TypeInCaseOf((v)=>v.length > 2));
      pat.matches("abc").should.equal(true);
      pat.matches("ab").should.equal(false);
      pat.matches(123).should.equal(false);
	});
  it('Pattern', function () {
      var p = new Pattern((v)=>v===1, (v)=>v+1);
      p.matches(1).should.equal(true);
      p.matches(2).should.equal(false);
      p.effect(1).should.equal(2);
	});
  it('CompData', function () {
      var pt = new ProductType(TypeString);
      var cd = pt.effect("test");
      (cd !== undefined).should.equal(true);
      cd.type.should.equal(pt);
      cd.values.should.be.an.Array();
	});
  it('either throw on no match', function () {
      (()=>either(42, inCaseOfEqual(1, ()=>true))).should.throw();
	});
  it('SumType.effect returns CompData', function () {
      var st = new SumType(new ProductType(TypeString, TypeNumber));
      var result = st.effect("hello", 42);
      (result !== undefined).should.equal(true);
      result.type.should.equal(st.types[0]);
	});
  it('ProductType.effect returns CompData', function () {
      var pt = new ProductType(TypeString, TypeNumber);
      var result = pt.effect("hello", 42);
      (result !== undefined).should.equal(true);
      result.type.should.equal(pt);
  });
  it('TypeFunction', function () {
      TypeFunction.matches(()=>{}).should.equal(true);
      TypeFunction.matches(42).should.equal(false);
  });
  it('TypePattern', function () {
      var p = new Pattern(()=>true, ()=>true);
      TypePattern.matches(p).should.equal(true);
      TypePattern.matches(42).should.equal(false);
  });
  it('TypePatternMatching', function () {
      var pm = new PatternMatching(inCaseOfEqual(1, ()=>true), otherwise(()=>false));
      TypePatternMatching.matches(pm).should.equal(true);
      TypePatternMatching.matches(42).should.equal(false);
  });
  it('TypeCompType', function () {
      var st = new SumType(new ProductType(TypeString));
      TypeCompType.matches(st).should.equal(true);
      TypeCompType.matches(42).should.equal(false);
  });
  it('TypeInCaseOf no match', function () {
      TypeInCaseOf(()=>false).matches(42).should.equal(false);
  });
  it('TypeEqualTo objects', function () {
      TypeEqualTo({a:1}).matches({a:1}).should.equal(false); // different refs
      var obj = {a:1};
      TypeEqualTo(obj).matches(obj).should.equal(true); // same ref
  });
  it('either match without otherwise', function () {
      either(1, inCaseOfEqual(1, (x)=>x+1)).should.equal(2);
  });

  it('CompType.apply', function () {
      var pt = new ProductType(TypeString, TypeNumber);
      var result = pt.apply("hello", 42);
      (result !== undefined).should.equal(true);
      result.type.should.equal(pt);
  });

  it('SumType.apply', function () {
      var st = new SumType(new ProductType(TypeString, TypeNumber));
      var result = st.apply("hello", 42);
      (result !== undefined).should.equal(true);
      result.type.should.equal(st.types[0]);
  });

  it('SumType.innerMatches', function () {
      var st = new SumType(new ProductType(TypeString));
      var result = st.apply("test");
      (result !== undefined).should.equal(true);
  });

  it('TypeNumber string', function () {
      TypeNumber.matches("123").should.equal(true);
  });
  it('ProductType wrong length', function () {
      var pt = new ProductType(TypeString);
      pt.matches("a", "b").should.equal(false);
  });
  it('TypeRegexMatches standalone', function () {
      TypeRegexMatches('c+').matches('ccc').should.equal(true);
      TypeRegexMatches('d+').matches('abc').should.equal(false);
  });
  it('Matchable base class', function () {
      (()=>new Matchable().matches(42)).should.throw();
  });
  it('Matchable subclass', function () {
      class IsPositive extends Matchable {
          matches(v) { return v > 0; }
      }
      (new IsPositive()).matches(5).should.equal(true);
      (new IsPositive()).matches(-1).should.equal(false);
  });
  it('TypeMatchesAllPatterns empty', function () {
      var pat = TypeMatchesAllPatterns();
      pat.matches(42).should.equal(true);
  });
  it('PatternMatching empty', function () {
      var pm = new PatternMatching();
      (()=>pm.matchFor(42)).should.throw();
  });
  it('SumType empty types', function () {
      var st = new SumType();
      st.matches(42).should.equal(false);
  });
  it('ProductType empty types', function () {
      var pt = new ProductType();
      pt.matches().should.equal(true);
  });
  it('inCaseOfString effect', function () {
      either("42", inCaseOfString((x)=>x), otherwise(()=>0)).should.equal(42);
  });
  it('inCaseOfNumber effect', function () {
      either("3.14", inCaseOfNumber((x)=>x), otherwise(()=>0)).should.equal(3.14);
  });
  it('CompType effect no match', function () {
      var pt = new ProductType(TypeString);
      (pt.effect(42) === undefined).should.equal(true);
  });
  it('either first match wins', function () {
      either(1, inCaseOfEqual(1, ()=>'first'), inCaseOfEqual(1, ()=>'second')).should.equal('first');
  });
})

describe('pattern - extended coverage', function () {
	// Type* default thunks fire their ()=>true effect when used directly in either()
	it('TypeNumber as effect-pattern returns true', function () {
		either(5, TypeNumber).should.equal(true);
		either('42', TypeNumber).should.equal(true);
	});
	it('TypeString as effect-pattern returns true', function () {
		either('x', TypeString).should.equal(true);
	});
	it('TypeNaN as effect-pattern returns true', function () {
		either(NaN, TypeNaN).should.equal(true);
		either('', TypeNaN).should.equal(true);
	});
	it('TypeObject as effect-pattern returns true', function () {
		either({a:1}, TypeObject).should.equal(true);
	});
	it('TypeArray as effect-pattern returns true', function () {
		either([1,2], TypeArray).should.equal(true);
	});
	it('TypeNull as effect-pattern returns true', function () {
		either(null, TypeNull).should.equal(true);
		either(undefined, TypeNull).should.equal(true);
	});
	it('TypeFunction as effect-pattern returns true', function () {
		either(()=>1, TypeFunction).should.equal(true);
	});
	it('TypePattern as effect-pattern returns true', function () {
		either(new Pattern(()=>true, ()=>1), TypePattern).should.equal(true);
	});
	it('TypePatternMatching as effect-pattern returns true', function () {
		either(new PatternMatching(otherwise(()=>1)), TypePatternMatching).should.equal(true);
	});
	it('TypeCompType as effect-pattern returns true', function () {
		either(new SumType(new ProductType(TypeString)), TypeCompType).should.equal(true);
	});
	it('TypeEqualTo as effect-pattern returns true on match', function () {
		either(7, TypeEqualTo(7)).should.equal(true);
	});
	it('TypeClassOf as effect-pattern returns true on instance', function () {
		either(new Number(1), TypeClassOf(Number)).should.equal(true);
	});
	it('TypeRegexMatches as effect-pattern returns true on match', function () {
		either('ccc', TypeRegexMatches('c+')).should.equal(true);
	});

	// TypeADT primary type mappings
	it('TypeADT(String) constructs type matching strings', function () {
		var t = new SumType(new ProductType(TypeADT(String)));
		(t.apply('hi') !== undefined).should.equal(true);
		(t.apply(5) !== undefined).should.equal(false);
	});
	it('TypeADT(Number) constructs type matching numbers', function () {
		var t = new SumType(new ProductType(TypeADT(Number)));
		(t.apply(5) !== undefined).should.equal(true);
	});
	it('TypeADT(TypeNumber instance) maps to number type', function () {
		var t = new SumType(new ProductType(TypeADT(TypeNumber)));
		(t.apply(5) !== undefined).should.equal(true);
	});
	it('TypeADT(TypeString instance) maps to string type', function () {
		var t = new SumType(new ProductType(TypeADT(TypeString)));
		(t.apply('a') !== undefined).should.equal(true);
	});
	it('TypeADT(undefined) maps to TypeNull', function () {
		TypeADT(undefined).should.equal(TypeNull);
		TypeADT(undefined).matches(null).should.equal(true);
	});
	it('TypeADT(TypeNaN) maps to NaN type', function () {
		var t = new SumType(new ProductType(TypeADT(TypeNaN)));
		(t.apply(NaN) !== undefined).should.equal(true);
		(t.apply(5) !== undefined).should.equal(false);
	});
	it('TypeADT(Pattern rule) reuses the pattern', function () {
		var t = new SumType(new ProductType(TypeADT(new Pattern(v=>v>3, ()=>true))));
		(t.apply(5) !== undefined).should.equal(true);
		(t.apply(1) !== undefined).should.equal(false);
	});
	it('TypeADT(function rule) wraps as TypeInCaseOf', function () {
		var t = new SumType(new ProductType(TypeADT(v=>v === 'ok')));
		(t.apply('ok') !== undefined).should.equal(true);
		(t.apply('no') !== undefined).should.equal(false);
	});
	it('TypeADT(PatternMatching) wraps as matchFor', function () {
		var pm = new PatternMatching(inCaseOfEqual(1, ()=>true), otherwise(()=>false));
		var t = new SumType(new ProductType(TypeADT(pm)));
		(t.apply(1) !== undefined).should.equal(true);
	});
	it('TypeADT(CompType) reuses the comp type', function () {
		var inner = new SumType(new ProductType(TypeString));
		var t = new SumType(new ProductType(TypeADT(inner)));
		(t.apply('hello') !== undefined).should.equal(true);
	});

	// CompData constructed directly with only a type (no values)
	it('CompData with only type has empty values', function () {
		var pt = new ProductType(TypeString);
		var sample = pt.effect('x');
		var CompData = sample.constructor;
		var cd = new CompData(pt);
		cd.type.should.equal(pt);
		JSON.stringify(cd.values).should.equal('[]');
	});
	it('CompData stores spread values as a single values array', function () {
		var pt = new ProductType(TypeString, TypeNumber);
		var cd = pt.effect('a', 1);
		// CompType.effect calls new CompData(this, values) -> values nested once
		cd.values.length.should.equal(1);
		JSON.stringify(cd.values[0]).should.equal('["a",1]');
	});

	// ProductType element mismatch (equal length, an element fails)
	it('ProductType rejects when an element type fails', function () {
		new ProductType(TypeString, TypeNumber).matches('a', 'notnum').should.equal(false);
	});
	it('ProductType accepts when all element types pass', function () {
		new ProductType(TypeString, TypeNumber).matches('a', 5).should.equal(true);
	});

	// inCaseOf effect coercion (+v)
	it('inCaseOfString effect receives coerced number', function () {
		either('42', inCaseOfString(x=>x), otherwise(()=>0)).should.equal(42);
	});
	it('inCaseOfNumber effect receives coerced number', function () {
		either('3.5', inCaseOfNumber(x=>x), otherwise(()=>0)).should.equal(3.5);
	});

	// either fall-through & ordering
	it('either throws when nothing matches', function () {
		(()=>either(99, inCaseOfEqual(1, ()=>true), inCaseOfEqual(2, ()=>true))).should.throw();
	});
	it('either returns first matching effect', function () {
		either('x', inCaseOfString(()=>'str'), otherwise(()=>'other')).should.equal('str');
	});
	it('otherwise catches anything', function () {
		either(Symbol('z'), otherwise(()=>'caught')).should.equal('caught');
	});

	// SumType / ProductType structural composition
	it('SumType matches any member ProductType', function () {
		var s = new SumType(new ProductType(TypeString), new ProductType(TypeNumber));
		s.matches('a').should.equal(true);
		s.matches(1).should.equal(true);
		// {} coerces to NaN -> neither string nor number member matches
		s.matches({}).should.equal(false);
	});
	it('SumType with no matching member returns false', function () {
		var s = new SumType(new ProductType(TypeString));
		s.matches(1).should.equal(false);
	});
	it('nested SumType-of-SumType matches', function () {
		var inner = new SumType(new ProductType(TypeNumber));
		var outer = new SumType(new ProductType(TypeString), inner);
		outer.matches(5).should.equal(true);
		outer.matches('s').should.equal(true);
	});

	// TypeMatchesAllPatterns conjunction
	it('TypeMatchesAllPatterns requires every pattern', function () {
		var t = TypeMatchesAllPatterns(TypeString, TypeInCaseOf(v=>v.length===3));
		t.matches('abc').should.equal(true);
		t.matches('ab').should.equal(false);
		t.matches(123).should.equal(false);
	});

	// inCaseOfCompTypeMatchesWithSpread on a plain (non-array) value
	it('inCaseOfCompTypeMatchesWithSpread matches non-spread value', function () {
		var st = new SumType(new ProductType(TypeString));
		either('hi', inCaseOfCompTypeMatchesWithSpread(st, ()=>true), otherwise(()=>false)).should.equal(true);
	});
	it('inCaseOfCompTypeMatchesWithSpread matches spread array', function () {
		var st = new SumType(new ProductType(TypeString, TypeNumber));
		either(['hi', 1], inCaseOfCompTypeMatchesWithSpread(st, ()=>true), otherwise(()=>false)).should.equal(true);
	});

	// PatternMatching.matchFor delegates to either
	it('PatternMatching.matchFor returns matched effect', function () {
		var pm = new PatternMatching(inCaseOfEqual(1, ()=>'one'), otherwise(()=>'other'));
		pm.matchFor(1).should.equal('one');
		pm.matchFor(2).should.equal('other');
	});
});

describe('pattern - null safety (regression)', function () {
	// Regression: TypeNumber.matches(null/undefined) used to throw on null.toString()
	it('TypeNumber.matches(null) returns false without throwing', function () {
		TypeNumber.matches(null).should.equal(false);
	});
	it('TypeNumber.matches(undefined) returns false without throwing', function () {
		TypeNumber.matches(undefined).should.equal(false);
	});
	it('TypeNumber still matches real numbers and numeric strings', function () {
		TypeNumber.matches(5).should.equal(true);
		TypeNumber.matches('5').should.equal(true);
	});
	it('TypeNaN.matches(null) returns true without throwing', function () {
		TypeNaN.matches(null).should.equal(true);
	});

	// Regression: TypeADT(null) used to crash; now maps to TypeNull
	it('TypeADT(null) maps to TypeNull', function () {
		TypeADT(null).should.equal(TypeNull);
		TypeADT(null).matches(null).should.equal(true);
	});
	it('TypeADT(null) inside a ProductType matches null, rejects numbers', function () {
		var t = new SumType(new ProductType(TypeADT(null)));
		(t.apply(null) !== undefined).should.equal(true);
		(t.apply(5) !== undefined).should.equal(false);
	});
	it('TypeADT object with a null field no longer crashes', function () {
		var t = new SumType(new ProductType(TypeADT({ id: Number, parent: null })));
		(t.apply({ id: 1, parent: null }) !== undefined).should.equal(true);
		(t.apply({ id: 1, parent: 5 }) !== undefined).should.equal(false);
	});
});
