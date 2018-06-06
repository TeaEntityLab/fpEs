function curry(fn) {
  return (...xs) => {
    if (xs.length === 0) {
      throw Error('EMPTY INVOCATION');
    }
    if (xs.length >= fn.length) {
      return fn(...xs);
    }
    return curry(fn.bind(null, ...xs));
  };
}

class Pattern {
  constructor(matches, effect) {
    this.matches = matches;
    this.effect = effect;
  }
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

class CompType {}

class SumType extends CompType {
  constructor(...types) {
    super(...types);
    this.types = types;
  }

  matches(...values) {
    for (let type of this.types) {
      if (type.matches(...values)) {
        return true;
      }
    }

    return false;
  }
}

module.exports = {
  compose: function (...fns) {
    return fns.reduce((f, g) => (...args) => f(g(...args)))
  },
  curry,

  either,
  Pattern,
  PatternMatching,
  inCaseOfEqual: function (value, effect) {
    return new Pattern((v)=>value === v, effect);
  },
  inCaseOfNumber: function (effect) {
    return new Pattern((v)=> !(isNaN(v) || v.toString() === ''), (v)=>effect(+v));
  },
  inCaseOfObject: function (effect) {
    return new Pattern((v)=> v && typeof v === "object" && (!Array.isArray(v)), effect);
  },
  inCaseOfArray: function (effect) {
    return new Pattern((v)=> v && Array.isArray(v), effect);
  },
  inCaseOfClass: function (theClass, effect) {
    return new Pattern((v)=> v instanceof theClass, effect);
  },
  inCaseOfRegex: function (regex, effect) {
    return new Pattern((v)=> {
      if (typeof regex === 'string') {
        regex = new RegExp(regex);
      }

      return regex.test(v);
    }, effect);
  },
  inCaseOfNull: function (effect) {
    return new Pattern((v)=> v === null || v === undefined, effect);
  },
  otherwise: function (effect) {
    return new Pattern(()=>true, effect);
  },
};
