class Pattern {
  constructor(matches, effect) {
    this.matches = matches;
    this.effect = effect;
  }
}

function inCaseOfEqual (value, effect) {
  return new Pattern((v)=>value === v, effect);
}
function inCaseOfNumber (effect) {
  return new Pattern((v)=> !(isNaN(v) || v.toString() === ''), (v)=>effect(+v));
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

class CompType extends Pattern {
  apply(...value) {
    return this.effect(...value);
  }
}

class SumType extends CompType {
  constructor(...types) {
    super(null, null);
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

var TypeObject = new CompType();

module.exports = {
  either,
  Pattern,
  PatternMatching,
  inCaseOfEqual,
  inCaseOfNumber,
  inCaseOfObject,
  inCaseOfArray,
  inCaseOfClass,
  inCaseOfNull,
  inCaseOfRegex,
  otherwise,

  SumType,
  CompType,
  TypeObject,
};
