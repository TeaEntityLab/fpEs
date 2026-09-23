# Feature: core

`source_commit: 5de0213` · `last_verified_at: 2026-09-23` · `verification_status: passed`

User goal: Optional/Maybe semantics (fantasy-land compatible) and Fp
function helpers.

## Preconditions

- Repo root; `npm test` works (VERIFY.md → Launch, Doctor).

## Entry points

| Area | Files | Test files |
| --- | --- | --- |
| Maybe/Optional | `maybe.js` | `test/maybe.js` |
| Fp functions | `fp.js` | `test/fp.js` |
| Package entry | `index.js` | covered by all |

## Drive

```bash
npx mocha --require @babel/register --require should test/**/*.js --grep 'Maybe'
npx mocha --require @babel/register --require should test/**/*.js --grep '^Fp'
```

## Observable outcomes

- `Maybe.just(1).isPresent()` → true; `Maybe.just(null)` and
  `Maybe.just(undefined)` → `isPresent()` **false**, `isNull()` **true**
  (just of null/undefined collapses to None — the nil-vs-empty distinction).
- `Maybe.just(null).or(3).unwrap()` → 3; `Maybe.just(1).or(3).unwrap()` → 1.
- `Maybe.equals` handles NaN (`Maybe equals NaN` block).
- None short-circuits through `map`/`chain`/`bind`/`chainRec` (regression
  blocks); `letDo` runs only when present.
- Fp: `pipe`/`compose` ordering, `map`/`reduce`/`filter` over arrays,
  `getMainAndFollower` numeric-index handling.

## Failure paths

- `just(null)` treated as present → the nil-vs-empty distinction is broken.
- None not short-circuiting through chain/chainRec → monad laws broken.
- `or` returning fallback when a value exists → extraction inverted.
- Fp helpers mutating input arrays → purity contract broken.

## Evidence

- mocha `--grep` output per block above.
- The regression describe-blocks (`None short-circuit`, `chainRec None`,
  `risk/edge`) are the oracle — do not weaken them.
