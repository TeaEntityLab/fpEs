# fpEs — API Reference

> Complete export surface of **fpes v1.2.0**, generated from source introspection and verified
> by executing each module. Companion to [`OVERVIEW.md`](./OVERVIEW.md).
>
> **Stability legend:**
> - **supported** — shown in the README.
> - **leaked** — exported, tested, and working, but README-silent (the author's own term; see
>   commit `7a4afce` "Add some leaked common functions"). Safe to use.
> - **internal** — implementation detail; do **not** depend on it.

## How to read this doc

`require('fpes')` returns a flat namespace: `Maybe`, `MonadIO`, `Publisher`, plus every `fp` and
`pattern` export spread to the top level. Subpath imports (`fpes/maybe`, `fpes/fp`,
`fpes/pattern`, `fpes/monadio`, `fpes/publisher`) return that single module.

Curried functions accept arguments one group at a time; most also work fully applied.

---

## Maybe (`fpes/maybe`)

`Maybe` is a singleton instance of an internal `MaybeDef` class. `None` is the shared empty
value. `Some` is any present value. Fantasy Land aliases live on the prototype (Maybe only).

### Static / constructor

| Symbol | Kind | Stability | Summary |
|--------|------|-----------|---------|
| `of(ref)` / `just(ref)` | fn | supported | Wrap a value; `null`/`undefined` → `None`. |
| `fromFalsy(ref)` | fn | leaked | Falsy (`0`,`''`,`false`,`null`) → `None`, else `Some`. |
| `fromPredicate(pred, val)` | fn | leaked | `Some(val)` if `pred(val)`, else `None`; curries on 1 arg. |
| `empty()` / `zero()` | fn | leaked | Return `None` (Fantasy Land monoid/plus identity). |

### Instance methods

| Symbol | Kind | Stability | Summary |
|--------|------|-----------|---------|
| `isPresent()` / `isNull()` | fn | supported | Presence test. |
| `unwrap()` / `extract()` | fn | supported / leaked | Get the raw value (`None` → `null`). |
| `map(fn)` / `then(fn)` | fn | supported | Transform the value (`None` short-circuits). |
| `flatMap(fn)` / `chain(fn)` / `bind(fn)` | fn | supported / leaked | Monadic bind; `fn` returns a `Maybe`. |
| `or(ref)` / `alt(m)` | fn | supported / leaked | Fallback value **on `None` only** (no-op on `Some`). |
| `orDo(fn)` | fn | supported | Lazy fallback on `None` (runs `fn()`). |
| `letDo(fn)` / `extend(fn)` | fn | supported / leaked | Map on `Some` (no-op on `None`). |
| `filter(pred)` | fn | leaked | Keep value if `pred` holds, else `None`. |
| `reduce(reducer, init)` | fn | leaked | `reducer(init, value)`; `None` → `init`. |
| `join()` | fn | leaked | Flatten a nested `Maybe`. |
| `ap(maybeFn)` | fn | leaked | Applicative — **FL order:** `value.ap(Maybe.of(fn))`. |
| `chainRec(f, i)` | fn | leaked | Stack-safe recursive chain (trampolined). |
| `equals(m)` | fn | leaked | Value equality (SameValueZero; `NaN` equals `NaN`). |
| `toList()` | fn | leaked | `[value]` for `Some`, `[]` for `None`. |
| `toString()` | fn | leaked | `Some(<json>)` or `None`. |
| `fantasy-land/*` | fn | leaked | Fantasy Land aliases: `of`,`empty`,`zero`,`map`,`ap`,`chain`,`join`,`alt`,`extend`,`extract`,`equals`,`reduce`,`filter`. |
| `ref` | field | internal | The wrapped value. Do not read directly. |

---

## MonadIO (`fpes/monadio`)

A **lazy** IO monad. Effects are stored and only run on `subscribe`.

### Static

| Symbol | Kind | Stability | Summary |
|--------|------|-----------|---------|
| `of(ref)` / `just(ref)` | fn | supported | Wrap a value as a pure effect. |
| `doM(genFn)` | fn | supported | Do-notation: run a generator, awaiting yielded Promise/MonadIO/Maybe. Returns a Promise. |
| `promiseof(ref)` | fn | supported | `Promise.resolve(ref)`. |
| `fromPromise(p)` | fn | leaked | Lift a Promise into a `MonadIO`. |
| `generatorToPromise(genFn)` | fn | leaked | Like `doM` but always returns a Promise. |
| `wrapGenerator(genFn)` | fn | internal | Step engine behind `doM`. |

### Instance methods

| Symbol | Kind | Stability | Summary |
|--------|------|-----------|---------|
| `map(fn)` / `then(fn)` | fn | supported | Transform the eventual value (lazy). |
| `flatMap(fn)` / `chain(fn)` | fn | supported / leaked | Bind; `fn` returns a `MonadIO`. |
| `bind(fn)` | fn | leaked | Alias of `then`. |
| `ap(monadFn)` | fn | leaked | Applicative apply. |
| `subscribe(fn, async?)` | fn | supported | **Runs** the effect; `async === true` schedules via Promise. |
| `effect` | field | internal | The stored thunk. Do not read directly. |

---

## Publisher (`fpes/publisher`)

A minimal PubSub / observable event bus.

| Symbol | Kind | Stability | Summary |
|--------|------|-----------|---------|
| `new Publisher()` | ctor | supported | Create a bus. |
| `subscribe(fn)` | fn | supported | Register a handler (deduped); returns `fn`. |
| `unsubscribe(fn)` | fn | supported | Remove a handler. |
| `publish(value, async?)` | fn | supported | Emit to all handlers; `async === true` schedules via Promise. |
| `map(fn)` | fn | supported | Return a derived `Publisher` of mapped values. |
| `clear()` | fn | leaked | Remove all handlers. |
| `subscribers` / `origin` | field | internal | Handler list / upstream link. Do not depend on. |

---

## fp (`fpes/fp`)

Ramda/Lodash-style utilities. **All 59 are public API**; only `compose`, `curry`, `map` appear
in the README — the other 56 are "leaked" (working, tested, undocumented).

### Function & composition

| Symbol | Curried | Stability | Summary |
|--------|:------:|-----------|---------|
| `compose(...fns)` | – | supported | Right-to-left composition. |
| `pipe(...fns)` | – | leaked | Left-to-right composition. |
| `curry(fn)` | – | supported | Curry by arity (rest params count as 0). |
| `partial(fn, ...pre)` | yes | leaked | Bind leading args. |
| `partialRight(fn, ...pre)` | yes | leaked | Bind trailing args. |
| `partialProps(fn, preObj, lateObj)` | yes | leaked | Merge preset + later prop objects. |
| `unary(fn, arg)` | yes | leaked | Call `fn` with a single arg. |
| `spread(fn, args)` | yes | leaked | Apply an array as args. |
| `gather(fn, ...args)` | yes | leaked | Collect args into one array param. |
| `not(fn, ...args)` | yes* | leaked | `!fn(...args)` — *fires immediately for `not(fn)` (see gotchas). |
| `ifelse(test, elseF, fn)` | yes | leaked | Branch on `test()`. |
| `when(test, fn)` | yes | leaked | `fn()` if `test()` else `undefined`. |
| `trampoline(fn)` | – | leaked | Stack-safe recursion (loop while result is a fn). |
| `memoize(fn)` | – | leaked | Cache results by args (see gotchas re: key collisions). |
| `debounce(fn, ms)` | yes | leaked | `{ ref, cancel }` around `setTimeout`. |
| `schedule(fn, ms)` | yes | leaked | `{ ref, cancel }` around `setInterval`. |
| `snooze(ms)` | – | leaked | `Promise` that resolves after `ms`. |

### Collection & iteration

| Symbol | Curried | Stability | Summary |
|--------|:------:|-----------|---------|
| `map(fn, list)` | yes | supported | Map. |
| `filter(fn, list)` | yes | leaked | Filter. |
| `reduce(fn, init, ...list)` | yes | leaked | Left fold (variadic list). |
| `foldl(fn, init, list)` | yes | leaked | Left fold. |
| `foldr(fn, init, list)` | yes | leaked | Right fold. |
| `flatten(list)` | – | leaked | One-level flatten. |
| `flattenMap(fn, list)` | yes | leaked | Map then flatten. |
| `range(n)` | – | leaked | `[0..n-1]`. |
| `chunk(list, size)` | yes | leaked | Split into size-`n` chunks. |
| `take(n, list)` | yes | leaked | First `n` (immutable). |
| `drop(list, n, dir?, fn?)` | manual | leaked | Drop `n` from left/right, optional filter. |
| `head(list)` | – | leaked | First element (`[]` if empty). |
| `tail(list)` | – | leaked | All but first. |
| `initial(list)` | – | leaked | All but last. |
| `shift(list)` | – | leaked | First element (non-mutating). |
| `nth(list, i)` | manual | leaked | Index; **negative is mirror-flipped** (see gotchas). |
| `reverse(list)` | – | leaked | Reverse array or string. |
| `unique(list)` | – | leaked | Dedupe (first-seen order). |
| `sortedUniq(list)` | – | leaked | Dedupe + sort (numeric-aware). |
| `sortedIndex(list, val, pos?)` | manual | leaked | Insertion index for a value. |
| `contains(list, val)` | – | leaked | Membership test. |
| `find(fn, list)` | yes | leaked | First match. |
| `findLast(fn, list)` | yes | leaked | Last match. |
| `findIndex(fn, list)` | yes | leaked | Index of first match (`-1` if none). |
| `findLastIndex(fn, list)` | yes | leaked | Index of last match (`-1` if none). |
| `fill(list, val, start?, end?)` | manual | leaked | Fill range with a value (immutable). |
| `compact(list, typ?)` | manual | leaked | Drop falsy (or keep by `typeof typ`). |
| `pull(list, ...vals)` | manual | leaked | Remove given values. |

### Set operations & zips

| Symbol | Curried | Stability | Summary |
|--------|:------:|-----------|---------|
| `concat(list, ...arrays)` | – | leaked | Concatenate arrays. |
| `union(a, b, dup?)` | manual | leaked | Union, optional duplicates. |
| `intersection(...arrays)` | – | leaked | Common values (main-ordered). |
| `difference(...arrays)` | – | leaked | In follower, not in main (deduped). |
| `differenceWithDup(...arrays)` | – | leaked | Difference keeping duplicates. |
| `zip(...lists)` | – | leaked | Zip parallel arrays. |
| `unzip(list)` | – | leaked | Inverse of `zip`. |
| `fromPairs(list)` | – | leaked | `[[k,v]]` → object. |

### Object / lens-ish

| Symbol | Curried | Stability | Summary |
|--------|:------:|-----------|---------|
| `prop(key, obj)` | yes | leaked | Read a property. |
| `propEq(val, key, obj)` | yes | leaked | `obj[key] === val`. |
| `get(obj, key)` | yes | leaked | Property read (obj-first). |
| `matches(rule, obj)` | yes | leaked | Shallow object match. |
| `clone(obj)` | – | leaked | JSON deep clone (`undefined`/`NaN` pass through). |

---

## pattern (`fpes/pattern`)

Pattern matching and algebraic data types. 39 exports; 17 shown in README.

### Matching entry points

| Symbol | Kind | Stability | Summary |
|--------|------|-----------|---------|
| `either(value, ...patterns)` | fn | supported | Match `value`; runs first matching pattern's effect. Throws if none match and no `otherwise`. |
| `otherwise(effect)` | fn | supported | Catch-all pattern. |
| `PatternMatching` | class | supported* | Reusable matcher (name shown, usage sparse). |
| `Pattern` | class | internal | Raw `(matches, effect)` pair; prefer `inCaseOf*`. |
| `Matchable` | class | internal | Base class for types. |

### `inCaseOf*` guards

| Symbol | Stability | Matches |
|--------|-----------|---------|
| `inCaseOfEqual(val, effect)` | supported | strict `===` |
| `inCaseOfClass(cls, effect)` | supported | `instanceof cls` |
| `inCaseOfObject(effect)` | supported | plain object (not array/null) |
| `inCaseOfNumber(effect)` | leaked | number (rejects boolean/array; accepts numeric strings) |
| `inCaseOfString(effect)` | leaked | `typeof === 'string'` |
| `inCaseOfNaN(effect)` | leaked | `NaN`/non-number |
| `inCaseOfArray(effect)` | leaked | `Array.isArray` |
| `inCaseOfNull(effect)` | leaked | `null`/`undefined` |
| `inCaseOfFunction(effect)` | leaked | `instanceof Function` |
| `inCaseOfRegex(regex, effect)` | leaked | regex test (restores `lastIndex` for `/g`,`/y`) |
| `inCaseOfPattern(effect)` | leaked | value is a `Pattern` |
| `inCaseOfPatternMatching(effect)` | leaked | value is a `PatternMatching` |
| `inCaseOfCompType(effect)` | leaked | value is a `CompType` |
| `inCaseOfCompTypeMatchesWithSpread(ct, effect)` | leaked | array-spread or direct comp-type match |

### `Type*` predicates (matcher objects)

`Type*` are the `()=>true` forms of the guards, usable in ADT/comp-type composition.

| Symbol | Stability | Summary |
|--------|-----------|---------|
| `TypeNumber` `TypeString` `TypeNaN` `TypeObject` `TypeArray` `TypeNull` | supported | Primitive matchers. |
| `TypeEqualTo(val)` `TypeClassOf(cls)` `TypeRegexMatches(rx)` | supported | Parameterized matchers. |
| `TypeFunction` `TypePattern` `TypePatternMatching` `TypeCompType` | leaked | Structural matchers. |
| `TypeInCaseOf(matches)` | leaked | Custom predicate matcher. |
| `TypeMatchesAllPatterns(...patterns)` | leaked | Conjunction (all must match). |
| `TypeCompTypeMatchesWithSpread(ct)` | leaked | Spread-aware comp-type matcher. |
| `TypeADT(adtDef)` | leaked | Match an object against a `{key: Type}` schema. |

### Algebraic data types

| Symbol | Kind | Stability | Summary |
|--------|------|-----------|---------|
| `SumType(...types)` | class | supported | Tagged union — matches if **any** member matches. |
| `ProductType(...types)` | class | supported | Record/tuple — matches if **all** members match (positional). |
| `CompType` | class | supported | Base composite type (`apply`/`matches`). |

---

## Appendix: leaked / alias / Fantasy Land coverage

- **fp:** 56 of 59 exports are undocumented in the README (all public, all tested).
- **Maybe:** ~30 undocumented instance/static members, including 13 `fantasy-land/*` aliases and
  the short aliases `chain`/`bind`/`alt`/`extend`/`extract`.
- **pattern:** 22 of 39 exports undocumented.
- **MonadIO:** `fromPromise`, `generatorToPromise` undocumented; `wrapGenerator` is internal.
- **Publisher:** `clear` undocumented.

**Do not depend on** (internal): `Maybe.ref`, `MonadIO.effect`, `MonadIO.wrapGenerator`,
`Publisher.subscribers`, `Publisher.origin`, and the raw `Pattern`/`Matchable` classes.

_Last verified: v1.2.0 (source introspection + runtime execution)._
