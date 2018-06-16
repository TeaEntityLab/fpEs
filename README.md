# fpEs
Functional Programming for EcmaScript(Javascript

# Why

Originally I would like to have some features of Optional & Rx-like & PubSub functions;

however somehow that's too heavy if including them at the same time.

Thus the implementation just includes the core functions, and more clear to use.



As I programmed some sync or async cases, finally I separated async interactions to the other module named `MonadIO`, and `Monad` itself just keeps simple `flapMap()`.

(`MonadIO` concepts are just as *Haskell* one :P)

# Installation

## Node.js

* Installation:

```bash
npm i fpes
```

## Brower

bundled files for web/browser usages:

[all](https://unpkg.com/fpes/dist/bundle.min.js)

---

[fp](https://unpkg.com/fpes/dist/fp.min.js)

[monad](https://unpkg.com/fpes/dist/monad.min.js)

[monadio](https://unpkg.com/fpes/dist/monadio.min.js)

[pattern](https://unpkg.com/fpes/dist/pattern.min.js)

[publisher](https://unpkg.com/fpes/dist/publisher.min.js)

# Usage

## Import

* You can include the entire library:

```javascript
import fpEs from 'fpEs';
```

* There are 5 modules in this library, you can include them individually:
  * Facades:
    * monad
    * monadio
    * publisher
  * FP functions:
    * fp
    * pattern

Just include things you need:

```javascript
import Monad from "fpEs";
// or this one:
/*
import Monad from "fpEs/Monad";
*/

var m = Monad.just(1); // It works
```

or

```javascript
import {
  compose, curry,
} from "fpEs";
```

or

```javascript
import {
  compose, curry,
} from "fpEs/fp";
```

## Common FP (Compose, Curry)

Example:

```javascript

import {
  compose, curry,
} from "fpEs/fp";

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
} from "fpEs/pattern";

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

## Monad (Sync)

Example:

```javascript

import Monad from "fpEs/Monad";

var m;

// flatMap (sync)

m = Monad.just(1).flatMap((x)=>x+2).flatMap((x)=>x+3);
console.log(m.unwrap()); // 6

// isPresent/isNull

m = Monad.just(1);
console.log(m.isPresent()); // true
console.log(m.isNull()); // false
m = Monad.just(null);
console.log(m.isPresent()); // false
console.log(m.isNull()); // true
m = Monad.just(undefined);
console.log(m.isPresent()); // false
console.log(m.isNull()); // true

// Or

m = Monad.just(1);
console.log(m.or(3).unwrap()); // 1
console.log(m.or(4).unwrap()); // 1
m = Monad.just(null);
console.log(m.or(3).unwrap()); // 3
console.log(m.or(4).unwrap()); // 4
m = Monad.just(undefined);
console.log(m.or(3).unwrap()); // 3
console.log(m.or(4).unwrap()); // 4

// letDo

m = Monad.just(1);
v = 0;
m.letDo(function () {
  v = 1;
});
console.log(v); // 1
m = Monad.just(null);
v = 0;
m.letDo(function () {
  v = 1;
});
console.log(v); // 0
m = Monad.just(undefined);
v = 0;
m.letDo(function () {
  v = 1;
});
console.log(v); // 0

```

## MonadIO/Rx.Observable (Async,Sync)

Example:

```javascript

import Monad from "fpEs";
import MonadIO from "fpEs";
var {promiseof, doM} = MonadIO;



var p = undefined;
var m = MonadIO.just(0);
var v = 0;

// sync

m = MonadIO.just(0);
v = 0;
m
.flatMap((val)=>val+1)
.flatMap((val)=>val+2)
.flatMap((val)=>val+3)
.subscribe((val)=>v=val);

console.log(v); // 6

// async

m = MonadIO.just(0);
v = 0;
p = m
.flatMap((val)=>val+1)
.flatMap((val)=>val+2)
.flatMap((val)=>val+3)
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
  var value3 = yield Monad.just(3);
  var value4 = yield MonadIO.just(3);
  return value + value2 + value3 + value4;
});

p.then((x)=>console.log(x)); // 22

```

## Publisher(PubSub-like)

Example:

```javascript

import Publisher from "fpEs/publisher";

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

// flatMap

p = new Publisher();
v = 0;

p.flatMap((x)=>x+2).flatMap((x)=>x+3).subscribe((i)=>v=i);
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
