# fpEs

[![npm download](https://img.shields.io/npm/dt/fpes.svg)](https://www.npmjs.com/package/fpes)
[![npm version](https://img.shields.io/npm/v/fpes.svg)](https://www.npmjs.com/package/fpes)
[![codecov](https://codecov.io/gh/TeaEntityLab/fpEs/branch/master/graph/badge.svg)](https://codecov.io/gh/TeaEntityLab/fpEs)
<!-- CI: Travis inactive; test workflow pending migration to GitHub Actions -->

[![license](https://img.shields.io/github/license/TeaEntityLab/fpEs.svg?style=social&label=License)](https://github.com/TeaEntityLab/fpEs)
[![stars](https://img.shields.io/github/stars/TeaEntityLab/fpEs.svg?style=social&label=Stars)](https://github.com/TeaEntityLab/fpEs)
[![forks](https://img.shields.io/github/forks/TeaEntityLab/fpEs.svg?style=social&label=Fork)](https://github.com/TeaEntityLab/fpEs)


Functional Programming for EcmaScript(Javascript)

# Why

Originally I would like to have some features of Optional & Rx-like & PubSub functions;

however somehow that's too heavy if including them at the same time.

Thus the implementation just includes the core functions, and more clear to use.

## Special thanks:
  * [purify](https://github.com/gigobyte/purify) (Inspiration from parts of Maybe implementations for [Fantasy-Land Specs](https://github.com/fantasyland/fantasy-land))

# Installation

## Node.js

node >= 8.3.0

* Installation:

```bash
npm i fpes
```

## Browser

bundled files for web/browser usages:

[all](https://unpkg.com/fpes@1.2.0/dist/bundle.min.js)

---

[fp](https://unpkg.com/fpes@1.2.0/dist/fp.min.js)

[maybe](https://unpkg.com/fpes@1.2.0/dist/maybe.min.js)

[monadio](https://unpkg.com/fpes@1.2.0/dist/monadio.min.js)

[pattern](https://unpkg.com/fpes@1.2.0/dist/pattern.min.js)

[publisher](https://unpkg.com/fpes@1.2.0/dist/publisher.min.js)

# Usage

## Import

In the browser bundle, the global name is `fpEs` (see webpack `library` setting). In Node/npm, install and import the package as `fpes` (all lowercase).

* You can include the entire library:

```javascript
import fpEs from 'fpes';
```

* There are 5 modules in this library, you can include them individually:
  * Facades:
    * maybe
    * monadio
    * publisher
  * FP functions:
    * fp
    * pattern

Just include things you need:

```javascript
import {Maybe} from "fpes";
// or this one:
/*
import Maybe from "fpes/maybe";
*/

var m = Maybe.just(1); // It works
```

or

```javascript
import {
  compose, curry,
} from "fpes";
```

or

```javascript
import {
  compose, curry,
} from "fpes/fp";
```

## Common FP (Compose, Curry)

Example:

```javascript

import {
  compose, curry,
} from "fpes/fp";

// compose

console.log(compose((x)=>x-8, (x)=>x+10, (x)=>x*10)(4)) // 42
console.log(compose((x)=>x+2, (x,y)=>x*y)(4,10)) // 42

// curry

console.log(curry((x, y, z) => x + y + z)(1,2,3)) // 6
console.log(curry((x, y, z) => x + y + z)(1)(2,3)) // 6
console.log(curry((x, y, z) => x + y + z)(1,2)(3)) // 6
console.log(curry((x, y, z) => x + y + z)(1)(2)(3)) // 6

```

## PatternMatching

Example:

```javascript

import {
  either,
  inCaseOfObject, inCaseOfEqual, inCaseOfClass, otherwise,

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
} from "fpes/pattern";

// PatternMatching

console.log(either({}, inCaseOfObject((x)=>JSON.stringify(x)), otherwise((x)=>false))); // "{}"
console.log(either([], inCaseOfObject((x)=>JSON.stringify(x)), otherwise((x)=>false))); // false
console.log(either(null, inCaseOfObject((x)=>JSON.stringify(x)), otherwise((x)=>false))); // false
console.log(either(undefined, inCaseOfObject((x)=>JSON.stringify(x)), otherwise((x)=>false))); // false
console.log(either("", inCaseOfObject((x)=>JSON.stringify(x)), otherwise((x)=>false))); // false

// otherwise

var err = undefined;

err = undefined;
either(1, inCaseOfEqual(1, (x)=>x+1)).should.equal(2);
(err === undefined).should.equal(true);

err = undefined;
try {
  either(1, inCaseOfEqual(2, (x)=>x+1));
} catch (e) {
  err = e;
}
(err === undefined).should.equal(false);

err = undefined;
try {
  either(1, inCaseOfEqual(2, (x)=>x+1), otherwise((x)=>x+2)).should.equal(3);
} catch (e) {
  err = e;
  console.log(e);
}
(err === undefined).should.equal(true);

// SumType

var s;
s = new SumType(new ProductType(TypeString, TypeNumber), new ProductType(TypeRegexMatches('c+')));
console.log(s.apply("1", "2asdf") === undefined); // true
console.log(s.apply("1", 2) === undefined); // false

console.log(s.apply("1") === undefined); // true
console.log(s.apply("ccc") === undefined); // false

```

## Maybe (Sync)

Example:

```javascript

import Maybe from "fpes/maybe";

var m;

// map (sync)

m = Maybe.just(1).map((x)=>x+2).map((x)=>x+3);
console.log(m.unwrap()); // 6

// isPresent/isNull

m = Maybe.just(1);
console.log(m.isPresent()); // true
console.log(m.isNull()); // false
m = Maybe.just(null);
console.log(m.isPresent()); // false
console.log(m.isNull()); // true
m = Maybe.just(undefined);
console.log(m.isPresent()); // false
console.log(m.isNull()); // true

// Or

m = Maybe.just(1);
console.log(m.or(3).unwrap()); // 1
console.log(m.or(4).unwrap()); // 1
m = Maybe.just(null);
console.log(m.or(3).unwrap()); // 3
console.log(m.or(4).unwrap()); // 4
m = Maybe.just(undefined);
console.log(m.or(3).unwrap()); // 3
console.log(m.or(4).unwrap()); // 4

// letDo

m = Maybe.just(1);
v = 0;
m.letDo(function () {
  v = 1;
});
console.log(v); // 1
m = Maybe.just(null);
v = 0;
m.letDo(function () {
  v = 1;
});
console.log(v); // 0
m = Maybe.just(undefined);
v = 0;
m.letDo(function () {
  v = 1;
});
console.log(v); // 0

// letDo & orDo
m = Maybe.just(0);
v = m.letDo(function (p) {
  return p + 2
}).orDo(function () {
  return 3
}).unwrap();
console.log(v); // 2
m = Maybe.just(undefined);
v = m.letDo(function (p) {
  return p + 2
}).orDo(function () {
  return 3
}).unwrap();
console.log(v); // 3

```

## MonadIO/Rx.Observable (Async,Sync)

Example:

```javascript

import Maybe from "fpes/maybe";
import MonadIO from "fpes/monadio";
var {promiseof, doM} = MonadIO;



var p = undefined;
var m = MonadIO.just(0);
var v = 0;

// sync

m = MonadIO.just(0);
v = 0;
m
.map((val)=>val+1)
.map((val)=>val+2)
.flatMap((val)=>MonadIO.just(val+1).map((val)=>val+1).map((val)=>val+1))
.subscribe((val)=>v=val);

console.log(v); // 6

// async

m = MonadIO.just(0);
v = 0;
p = m
.map((val)=>val+1)
.map((val)=>val+2)
.map((val)=>val+3)
.subscribe((val)=>v=val, true); // Async: true

console.log(v); // 0
p.then(function () {
  console.log(v); // 6
});

// DoNotation

v = 0;
p = doM(function *() {
  var value = yield promiseof(5);
  var value2 = yield promiseof(11);
  var value3 = yield Maybe.just(3);
  var value4 = yield MonadIO.just(3);
  return value + value2 + value3 + value4;
});

p.then((x)=>console.log(x)); // 22

```

## Publisher(PubSub-like)

Example:

```javascript

import Publisher from "fpes/publisher";

var p = new Publisher();
var v = 0;

// sync

p = new Publisher();
v = 0;
p.subscribe((i)=>v=i);
p.publish(1);

console.log(v); // 1

// async

p = new Publisher();
v = 0;

p.subscribe((i)=>v=i);
p.publish(1, true); // Async: true
console.log(v); // 0

setTimeout(()=>{
  console.log(v); // 1
},100);

// map

p = new Publisher();
v = 0;

p.map((x)=>x+2).map((x)=>x+3).subscribe((i)=>v=i);
p.publish(1, true);
console.log(v); // 0

setTimeout(()=>{
  console.log(v); // 6
},100);

// unsubscribe

p = new Publisher();
v = 0;
var callback = (i)=>v=i;

p.subscribe(callback);
p.publish(1);
console.log(v); // 1
v = 0;
p.unsubscribe(callback);
p.publish(1);
console.log(v); // 0

```

# Development

## Prerequisites

* Node `^22.18.0 || >=24.11.0` (required by Babel 8 dev toolchain)
* Consumer runtime: `>= 8.3.0` (see `engines` in `package.json`)

## Release Checklist

1. `npm test` — all tests pass
2. `npm run build` — webpack bundles compiled
3. `npm pack --dry-run --json` — verify tarball contents (no test/config leak)
4. `git tag -a v<version> -m "Release <version>"` — create version tag
5. `npm login` — authenticate to npm
6. `npm publish` (add `--otp=<code>` if 2FA enabled)
7. `git push --follow-tags` — push commits and tags
8. Verify unpkg: `https://unpkg.com/fpes@<version>/dist/bundle.min.js`
