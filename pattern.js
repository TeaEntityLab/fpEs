class Pattern {
  constructor(matches, effect) {
    this.matches = matches;
    this.effect = effect;
  }
}

function isNotNumber(v) {
  return isNaN(v) || v.toString().trim() === '';
}

function inCaseOfEqual (value, effect) {
  return new Pattern((v)=>value === v, effect);
}
function inCaseOfNumber (effect) {
  return new Pattern((v)=>!isNotNumber(v), (v)=>effect(+v));
}
function inCaseOfNaN (effect) {
  return new Pattern(isNotNumber, (v)=>effect(+v));
}
function inCaseOfString (effect) {
  return new Pattern((v)=> typeof v === 'string', (v)=>effect(+v));
}
function inCaseOfObject (effect) {
  return new Pattern((v)=> v && typeof v === "object" && (!Array.isArray(v)), effect);
}
function inCaseOfArray (effect) {
  return new Pattern((v)=> v && Array.isArray(v), effect);
}
function inCaseOfClass (theClass, effect) {
  return new Pattern((v)=> v instanceof theClass, effect);
}
function inCaseOfNull (effect) {
  return new Pattern((v)=> v === null || v === undefined, effect);
}
function inCaseOfRegex (regex, effect) {
  return new Pattern((v)=> {
    if (typeof regex === 'string') {
      regex = new RegExp(regex);
    }

    return regex.test(v);
  }, effect);
}

function TypeInCaseOf (matches) {
  return new Pattern(matches, ()=>true);
}

function TypeMatchesAllPatterns (...patterns) {
  return TypeInCaseOf((v)=>{
    let matched = true;
    for (let pattern of patterns) {
      matched = matched && pattern.matches(v);
    }
    return matched;
  });
}

function TypeADT(adtDef) {
  let patterns = [];

  let primaryTypesMapping = [

    (adt) => {
      let theType = TypeString;
      return adt === theType || adt === String || theType.matches(adt) ? theType : undefined;
    },
    (adt) => {
      let theType = TypeNumber;
      return adt === theType || adt === Number || theType.matches(adt) ? theType : undefined;
    },


    (adt) => {
      let theType = TypeNull;
      return adt === theType || theType.matches(adt) ? theType : undefined;
    },
    (adt) => {
      let theType = TypeInCaseOf((v) => (! (TypeObject.matches(v) || TypeArray.matches(v))) && TypeNaN.matches(v));
      return adt === TypeNaN || theType.matches(adt) ? theType : undefined;
    },
  ];
  for (let theTypeMapping of primaryTypesMapping) {
    let theType = theTypeMapping(adtDef);
    if (theType) {
      return theType;
    }
  }

  if (TypeArray.matches(adtDef)) {

    let subPatternsForOr = adtDef.map((subAdt) => {
      return TypeADT(subAdt);
    });
    subPatternsForOr.push(otherwise(()=>false));
    let TypeSubVFromAdt = TypeInCaseOf((subV)=>{
      return either(subV, ...subPatternsForOr);
    });

    patterns.push(TypeArray);
    patterns.push(TypeInCaseOf((v)=>{
      return v.map((item)=>{
        return TypeSubVFromAdt.matches(item);
      }).reduce((prevResult, x) => x || prevResult, false);

    }));
  } else if (TypeObject.matches(adtDef)) {

    let patternsForAnd = [];
    for (let key in adtDef) {
      if (adtDef.hasOwnProperty(key)) {
        let fieldName = key;
        patternsForAnd.push(TypeInCaseOf((v)=>{
          return v.hasOwnProperty(fieldName) && TypeADT(adtDef[fieldName]).matches(v[fieldName]);
        }));
      }
    }

    patterns.push(TypeObject);
    patterns.push(TypeMatchesAllPatterns(...patternsForAnd));
  }
  return TypeMatchesAllPatterns(...patterns);
}

function otherwise (effect) {
  return new Pattern(()=>true, effect);
}

function either(value, ...patterns) {
  for (let pattern of patterns) {
    // console.log(pattern.matches(value));

		if (pattern.matches(value)) {
			return pattern.effect(value);
		}
	}

  throw new Error(`Cannot match ${JSON.stringify(value)}`);
}

class PatternMatching {
  constructor(...patterns) {
    this.patterns = patterns;
  }

  matchFor(value) {
    return either(value, ...this.patterns);
  }
}

class CompData {
  constructor(type, ...values) {
    this.type = type;
    this.values = values;
  }
}

class CompType {
  effect(...values) {
    if (this.matches(...values)) {
      return new CompData(this, values);
    }
  }

  apply(...values) {
    return this.effect(...values);
  }
}

class SumType extends CompType {
  constructor(...types) {
    super();
    this.types = types;
  }

  matches(...values) {
    var type = this.innerMatches(...values);
    if (type) {
      return true;
    }

    return false;
  }
  effect(...values) {
    var type = this.innerMatches(...values);
    if (type) {
      return type.effect(...values);
    }
  }
  innerMatches(...values) {
    for (let type of this.types) {
      if (type.matches(...values)) {
        return type;
      }
    }
  }
}

class ProductType extends CompType {
  constructor(...types) {
    super();
    this.types = types;
  }

  matches(...values) {
    if (values.length != this.types.length) {
      return false;
    }

    for (var i = 0; i < values.length; i++) {
      if (! this.types[i].matches(values[i])) {
        return false;
      }
    }

    return true;
  }
}

var TypeNumber = inCaseOfNumber(()=>true);
var TypeString = inCaseOfString(()=>true);
var TypeNaN = inCaseOfNaN(()=>true);
var TypeObject = inCaseOfObject(()=>true);
var TypeArray = inCaseOfArray(()=>true);
var TypeNull = inCaseOfNull(()=>true);
function TypeEqualTo(value) {
  return inCaseOfEqual(value, ()=>true);
}
function TypeClassOf(theClass) {
  return inCaseOfClass(theClass, ()=>true);
}
function TypeRegexMatches(regex) {
  return inCaseOfRegex(regex, ()=>true);
}

module.exports = {
  either,
  Pattern,
  PatternMatching,
  inCaseOfEqual,
  inCaseOfNumber,
  inCaseOfString,
  inCaseOfNaN,
  inCaseOfObject,
  inCaseOfArray,
  inCaseOfClass,
  inCaseOfNull,
  inCaseOfRegex,
  otherwise,

  SumType,
  ProductType,
  CompType,

  TypeNumber,
  TypeString,
  TypeNaN,
  TypeObject,
  TypeArray,
  TypeNull,
  TypeEqualTo,
  TypeClassOf,
  TypeRegexMatches,
  TypeInCaseOf,
  TypeMatchesAllPatterns,
  TypeADT,
};
