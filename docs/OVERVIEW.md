# fpEs — Project Overview & Findings

> Audit-derived overview of what fpEs is, where it came from, its full surface area,
> its non-obvious behaviors, and how to actually use it. Companion to [`API.md`](./API.md).
> Last verified against **v1.2.0** (source executed, not inferred, except where marked
> `[INFERENCE]`).

## What fpEs is

fpEs is a **zero-runtime-dependency, ES5-targeted JavaScript functional-programming
micro-toolkit** that bundles five small pillars into one library:

| Pillar | Module | What it gives you |
|--------|--------|-------------------|
| Optional / Maybe | `maybe` | A Fantasy-Land–compatible `Maybe` for null-safety |
| IO monad + Observable-style subscribe | `monadio` | Lazy effects, `subscribe`, and generator do-notation |
| PubSub | `publisher` | A tiny observable event bus |
| Utility belt | `fp` | Ramda/Lodash-style point-free collection & function helpers |
| Pattern matching + ADTs | `pattern` | `either`/`inCaseOf*`, plus `SumType`/`ProductType`/`TypeADT` |

It has **no runtime dependencies**, ships ES5 bundles for the browser (global `fpEs`) and
CommonJS modules for Node/npm (package `fpes`, all lowercase).

## Origins & scope

- First commit **2018-06-04** by **John Lee** (`johnteee@gmail.com`); primary maintainer
  throughout (771 commits total, the bulk being Dependabot bumps).
- The optional type was originally named **`Monad`** (`src/monad.js`) and later **renamed to
  `Maybe`** (`bd146f0` "Correct the name of Maybe", ~12 days later).
- Build order (from `git log --reverse`): Maybe (as Monad) → curry/compose → MonadIO →
  Publisher → PatternMatching → SumType → the large `fp` utility expansion (2018-06-08..17).
- Second contributor **alf** (`alfmohenu`) added many of the array utilities (`compact`,
  `concat`, `difference`, `drop`, `fill`, `findIndex`, `findLastIndex`, `head`, `fromPairs`,
  `initial`, `intersection`, `join`, `nth`, `sortedIndex`, `union`, `zip`, ...).
- The README credits **[purify](https://github.com/gigobyte/purify)** as inspiration for the
  Fantasy-Land Maybe implementation.

**Author-stated motivation** (README "Why"): wanted "Optional & Rx-like & PubSub functions,"
but combining full stacks was "too heavy," so fpEs ships "the core functions" only.

> Note on "Rx-like": this is the author's own word, but `MonadIO` is a **one-shot lazy IO
> monad with an Observable-style `subscribe`**, not an RxJS-style multi-value stream library.
> Treat it as IO + do-notation, not as reactive streams. The framing "one small lib instead of
> Ramda + RxJS + PubSub" is a reasonable shorthand, but only Optional/Rx-like/PubSub are
> author-claimed — the "Ramda" mapping is `[INFERENCE]`.

## Package surfaces: `fpes` (npm) vs `fpEs` (browser)

- **Node/npm:** install `fpes` (lowercase) and import lowercase subpaths:
  `require('fpes')`, `require('fpes/maybe')`, `require('fpes/fp')`, etc.
- **Browser bundle:** the UMD global is **`fpEs`** (mixed case). See the `dist/*.min.js` files.
- The mixed-case project name `fpEs` is the brand; the installable package is `fpes`.

## Module map (entry point)

`index.js` builds a **flat namespace** — the whole `fp` and `pattern` surfaces are spread in
alongside the three facade constructors:

```js
module.exports = {
  Maybe:     require('./maybe'),
  MonadIO:   require('./monadio'),
  Publisher: require('./publisher'),
  ...require('./fp'),       // ~59 utilities spread to top level
  ...require('./pattern'),  // ~39 matchers/types spread to top level
};
```

So `require('fpes')` gives you `Maybe`, `MonadIO`, `Publisher`, and every `fp` + `pattern`
export at the top level. Subpath imports (`fpes/fp`, `fpes/pattern`) return that module directly.

## Findings (audit log)

1. **The README documents only a small fraction of the real API.** Using an honest
   name-mention test (discarding substring false positives like "**ap**ply", "tool**chain**",
   "features **of**"), roughly **13 symbols are documented vs ~37 undocumented across the
   facades**, and in `fp` only **3 of 59** exports (`compose`, `curry`, `map`) appear in the
   README. The rest are fully working, tested, public API — just README-silent.
2. **"Leaked" is the author's own term.** Commit `7a4afce` is literally titled *"Add some
   leaked common functions"* (added `get`, `matches`, `memoize`), and `maybe.js` carries the
   comment *"Prevent avoiding aliases in case of leaking."* In this project "leaked" means
   **exported-but-undocumented surface**, not a security leak. See [`API.md`](./API.md) for the
   full catalog.
3. **`fp` has no true "leaked" noise** — all 59 exports are intentional public API. The genuine
   internal-only surface to avoid depending on is small: `Maybe.ref`, `MonadIO.effect`,
   `Publisher.subscribers`, `MonadIO.wrapGenerator`, and the raw `Pattern`/`Matchable` classes.
4. **Maybe is Fantasy Land compliant** and exposes `fantasy-land/*` aliases (Maybe **only** —
   `fp` and `monadio` have no such aliases). It interoperates with the Fantasy Land ecosystem.
5. **Everything below was runtime-verified** against v1.2.0 source; the gotchas and scenarios
   are executed, not inferred (exceptions marked `[INFERENCE]`).

## Gotchas & boundaries

All six are **intended behavior or locked-by-tests quirks** — none are open bugs. Document and
work with them; do not expect them to change.

1. **`Maybe.ap` uses Fantasy Land argument order.** The receiver holds the *value*, the argument
   holds the *wrapped function*:
   ```js
   Maybe.of(10).ap(Maybe.of(x => x + 1)).unwrap(); // 11
   // Maybe.of(fn).ap(Maybe.of(10)) throws — wrong order
   ```
2. **`fp.not` does not curry the way you'd expect.** Its signature is
   `(fn, ...args) => !fn(...args)`; rest params make `curry` see arity 1, so `not(pred)` fires
   *immediately* as `!pred()`. Call it in one shot: `not(pred, x)` → `!pred(x)`.
3. **`fp.nth` negative indices are mirror-flipped vs Ramda/Lodash** (locked by tests at
   `test/fp.js:314` and `:769-777`). `nth([1,2,3,4], -1)` → **1** (the first element), and
   `nth(list, -list.length)` → the last. The JSDoc "starting from the right" is **misleading**;
   negative `n` reverses then indexes at `length + n`.
4. **`Maybe.letDo` is bind-like; `or`/`orDo` are no-ops on `Some`.** On a present value, `or`
   and `orDo` return the same `Maybe` (no fallback runs); `letDo(fn)` maps the value. On `None`,
   it's the mirror: `letDo` is a no-op, `or`/`orDo` supply the fallback. Use `orDo(() => def)`
   for defaults, not `or` on a value you expect to be present.
5. **`MonadIO` is lazy.** `map`/`then`/`flatMap` only *build* an effect; **nothing runs until
   `.subscribe()`**. Verified: a side effect stayed at `ran === 0` after building the pipeline
   and became `1` only after `subscribe`. Pass `subscribe(fn, true)` for async execution.
6. **Fantasy Land aliases are Maybe-scoped.** `fantasy-land/map`, `.../chain`, `.../ap`,
   `.../of`, `.../equals`, etc. exist on `Maybe` only.

## Scenarios cookbook

All snippets below were **executed** against v1.2.0 (outputs shown are real) unless marked
`[INFERENCE]`.

### 1. Null-safe config / env resolution — `maybe`

Deep `x && x.y` chains and `||` defaults wrongly treat `0`/`''` as missing. `Maybe` makes
absence explicit and keeps a single pipeline:

```js
import Maybe from 'fpes/maybe';

function resolvePort(env) {
  const positive = Maybe.fromPredicate(n => n > 0);
  return Maybe.fromFalsy(env.PORT)   // '' / undefined → None
    .map(Number)
    .chain(positive)                 // flatMap alias; None if <= 0
    .filter(n => n < 65536)
    .orDo(() => 3000)                // None → fallback
    .unwrap();
}
// {} → 3000 · {PORT:''} → 3000 · {PORT:'8080'} → 8080 · {PORT:'0'} → 3000 · {PORT:'99999'} → 3000
```

### 2. Lazy IO: compose effects, run once on subscribe — `monadio`

Assemble a job without running it; execute exactly when you subscribe (great for testability):

```js
import MonadIO from 'fpes/monadio';

let ran = 0;
const job = MonadIO.just({ rows: 10 })
  .map(cfg => ({ ...cfg, batch: 100 }))
  .flatMap(cfg => MonadIO.of(() => { ran++; return cfg.rows * cfg.batch; }))
  .flatMap(run => MonadIO.of(run()));

// ran === 0 here — nothing executed yet
job.subscribe(result => console.log(result)); // ran === 1, result === 1000
job.subscribe(result => console.log(result), true); // async (Promise) execution
```

### 3. Async do-notation mixing Promise + Maybe — `monadio` + `maybe`

`doM` runs a generator where each `yield` awaits a Promise, a `MonadIO`, or a `Maybe`. Yielding
a `None` short-circuits:

```js
import Maybe from 'fpes/maybe';
import MonadIO from 'fpes/monadio';
const { doM, promiseof, fromPromise } = MonadIO;

const checkout = userId => doM(function* () {
  const id   = yield promiseof(userId);
  const user = yield Maybe.fromPredicate(x => x != null, id); // None aborts the flow
  const cart = yield fromPromise(fetch(`/api/cart/${user.unwrap()}`).then(r => r.json()));
  return { user: user.unwrap(), items: cart.items };
});
checkout(42).then(console.log); // Promise resolving to the combined result
```

### 4. Normalize messy webhook / wire payloads — `pattern`

`either` + `inCaseOf*` + `otherwise` replaces `switch(typeof …)` with an explicit, defaulted
match:

```js
import { either, inCaseOfNull, inCaseOfString, inCaseOfObject, otherwise } from 'fpes/pattern';

const normalize = raw => either(raw,
  inCaseOfNull(()   => ({ type: 'noop' })),
  inCaseOfString(s  => ({ type: 'text', value: s })),
  inCaseOfObject(o  => o.type ? o : { type: 'unknown', payload: o }),
  otherwise(()      => ({ type: 'fallback' })));

// null → {type:'noop'} · 'hi' → {type:'text',value:'hi'}
// {type:'click',id:1} → passthrough · {a:1} → {type:'unknown',payload:{a:1}}
```
> `either` throws if nothing matches and no `otherwise` is given — always provide `otherwise`
> for open inputs.

### 5. Runtime shape validation with ADTs — `pattern`

Declare a schema once as an algebraic data type and reuse it in handlers and tests:

```js
import { TypeADT, TypeString, TypeNumber } from 'fpes/pattern';

const User = TypeADT({ name: TypeString, age: TypeNumber });
User.matches({ name: 'Ada', age: 36 }); // true
User.matches({ name: 'Ada' });          // false
```
`SumType`/`ProductType` compose these into tagged unions and records (see
[`API.md`](./API.md)). `[INFERENCE]` for the exact `SumType.apply` ergonomics beyond `matches`.

### 6. Event bus with derived streams — `publisher`

A tiny PubSub where `map` returns a derived publisher:

```js
import Publisher from 'fpes/publisher';

const bus = new Publisher();
const seen = [];
bus.map(x => x * 2).subscribe(v => seen.push(v));
bus.publish(5);   // seen: [10]
bus.publish(6);   // seen: [10, 12]
bus.publish(7, true); // async publish (Promise-scheduled)
// bus.unsubscribe(fn) / bus.clear() to detach
```

### 7. Ramda-style data munging — `fp`

The README shows only `compose`/`curry`, but the full utility belt is available:

```js
import { pipe, chunk, zip, fromPairs, sortedUniq, memoize, trampoline } from 'fpes/fp';

pipe(x => x + 1, x => x * 2)(5);          // 12  (left-to-right; compose is right-to-left)
chunk([1,2,3,4,5], 2);                    // [[1,2],[3,4],[5]]
zip([1,2],[3,4]);                         // [[1,3],[2,4]]
fromPairs([['a',1],['b',2]]);             // {a:1, b:2}
sortedUniq([3,1,2,1,3]);                  // [1,2,3]
const slow = memoize(x => x * 2);         // caches by args
const sum = trampoline(function rec(n, acc = 0) { // stack-safe recursion
  return n === 0 ? acc : () => rec(n - 1, acc + n);
});
sum(1000000);                             // no stack overflow
```

## Further reading

- [`API.md`](./API.md) — full export tables, curry status, and the leaked/alias appendix.
- [`../README.md`](../README.md) — install, browser bundles, tutorial examples.
- [`../CHANGELOG.md`](../CHANGELOG.md) — versioned behavior changes.
