import {
  either, PatternMatching, Pattern,
  inCaseOfEqual, inCaseOfRegex, inCaseOfNull, inCaseOfClass, inCaseOfNumber, inCaseOfNaN, inCaseOfString, inCaseOfObject, inCaseOfArray,
  otherwise,

  SumType, ProductType, CompType,
  TypeNumber,
  TypeString,
  TypeNaN,
  TypeObject,
  TypeArray,
  TypeNull,
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
})
