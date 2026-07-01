# Changelog

## 1.2.0

### Build & Tooling
- Upgraded Babel dev toolchain to 8.x (`@babel/core`, `@babel/cli`, `@babel/preset-env`, `@babel/register`, `@babel/plugin-transform-runtime`, `@babel/runtime`)
- Pinned `.babelrc` to IE 11 target to preserve ES5 bundle output
- Modernized webpack compression: replaced `brotli-webpack-plugin` with native `zlib.brotliCompress` via `compression-webpack-plugin`
- Upgraded `webpack-cli` to `^6`, `compression-webpack-plugin` to `^11`, `babel-loader` to `^10`
- Fixed `dev` script: `webpack -d --watch` → `webpack --mode development --watch`
- Fixed `clean` script: removed no-op `sed` pipe, use `find dist -name '*.js*' -delete`
- Added test gate to `release` script: `npm test && npm publish && git push --follow-tags`
- Added `exports` field to `package.json` for formal subpath imports
- Updated Travis CI Node matrix to `22.18`, `24.11`, `node` (Babel 8 dev floor)
- Added GitHub Actions CodeQL workflow
- Added Dependabot config for npm and github-actions ecosystems

### Package Hygiene
- Added `files` allowlist to prevent test/config/.omx leakage in npm tarball
- Cleaned `.gitignore`: replaced contradictory `dist/*.js*` negation with clean `dist/`
- Fixed `.travis.yml` typo: `scripts:` → `script:`
- Corrected runtime `engines.node` to `>=8.3.0` (separate from dev/build floor)

### Bug Fixes
- **`pattern.js` `isNotNumber`**: added null/undefined guard before `isNaN` check; prevents `TypeNumber.matches(null)` throw and fixes `TypeADT(null)` resolving to `TypeNull`
- **`pattern.js` `inCaseOfNumber`**: reject booleans and arrays as numbers (global `isNaN` coerced `true`→1, `[1]`→1); numeric strings still accepted
- **`pattern.js` `inCaseOfString`**: pass value unchanged instead of coercing with `+v` (was turning `'abc'`→`NaN`, `'42'`→number)
- **`pattern.js` `inCaseOfRegex`**: save/restore `lastIndex` for `/g`/`/y` regexes to prevent repeated-match alternation
- **`maybe.js` `flatMap`**: short-circuit to `None` when `isNull()` instead of calling `fn(undefined)` and leaking `Some(NaN)`
- **`maybe.js` `chainRec`**: short-circuit to `None` when any recursive step returns `None` instead of throwing on `null.value`
- **`maybe.js` `equals`**: use SameValueZero semantics so `Maybe.of(NaN).equals(Maybe.of(NaN))` is true
- **`maybe.js` Fantasy Land aliases**: fixed `fantasy-land/reduce`, `fantasy-land/filter`, `fantasy-land/equals` on `None` to bypass broken aliases
- **`fp.js` `difference`**: fixed duplicate-main offset bug (sliced by raw `main.length` instead of deduped `new Set(main).size`)
- **`fp.js` `take`**: fixed mutation bug (`list.shift()` mutated caller's array and threw on strings/`arguments`); now uses `list[0]` + `slice`
- **`fp.js` `fill`**: fixed sparse-array bug on single numeric element (`Array(...[5])` → sparse length-5); now uses `Array.from`
- **`fp.js` `intersection`**: removed incorrect `if(list[x] == undefined)` guard that indexed by value and dropped `0`
- **`_helpers/reusables.js` `getMainAndFollower`**: fixed single-element numeric arrays being treated as explicit index args; now requires both trailing values to be `typeof === 'number'`

### Documentation
- Fixed all README import specifiers: `fpEs` → `fpes` (package name is lowercase; `fpEs` failed on case-sensitive filesystems)
- Corrected README Node requirement: `>= 6.0` → `>= 8.3.0`
- Pinned unpkg links to `@1.2.0`
- Removed dead Travis CI badge
- Added browser-global vs npm-package naming note
- Added Development section with dev/build Node floor
- Added Release Checklist section

### Tests
- Grew test suite from 264 to 491 passing tests
- Added regression tests for all bug fixes above
- Added fp public API regression and entry-point tests
- Added pattern string coercion and global regex `lastIndex` regressions
- Added Maybe `chainRec` step-None, NaN equality, and None Fantasy Land alias regressions
- Added TypeNumber boolean/array coercion boundary tests
- Added `getMainAndFollower` numeric-array-index regression tests
