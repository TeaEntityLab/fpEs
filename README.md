# fpEs
Functional Programming for EcmaScript(Javascript)

## Monad

Example:

```javascript
var m;

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
