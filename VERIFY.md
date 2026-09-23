# VERIFY — fpEs

How an agent launches, checks, drives, and cleans up verification of this
library. Read this plus the relevant `features/*.md` file before touching the
code.

`source_commit: 5de0213` · `last_verified_at: 2026-09-23` · `verification_status: passed`

## Launch

```bash
cd <repo root>
npm test
```

Runs mocha with `@babel/register` + `should` over `test/**/*.js` — 528 tests,
~1s. `node_modules/` is checked in / already installed; if it is missing,
`npm ci` (not `npm install` — keep the lockfile authoritative).

## Doctor

```bash
npx mocha --require @babel/register --require should test/maybe.js --grep 'Maybe$'   # smoke: core Maybe block only
node -e "const {Maybe} = require('./index.js'); console.log(Maybe.just(1).isPresent())"   # → true
```

A healthy tree: smoke block PASS, full suite 528 passing, `node -e` prints
`true`.

## Drive

- Per feature: run the mocha `--grep` pattern in the feature file's Drive
  section, e.g.
  `npx mocha --require @babel/register --require should test/**/*.js --grep 'Fp'`.
- For behavior not covered by a test, write a scratch driver **outside** the
  repo (e.g. `/tmp/fpes-driver/check.js`) that does
  `require('<repo root>/index.js')` — never add driver files inside the repo.

## Evidence

- Save mocha output to files under a scratch dir
  (e.g. `/tmp/fpes-evidence/`).
- For scratch drivers, record the driver source plus its stdout.

## When a check fails

Classify before fixing — four different failures need four different repairs:

| Class | Meaning | Repair |
| --- | --- | --- |
| Product regression | Library behavior changed for the worse | Report; do not edit the map or tests to match |
| Doc drift | The map/VERIFY.md no longer matches the library | Update the doc; the product is fine |
| Spec/oracle error | The acceptance spec or test expectation is wrong | Oracles are read-only; propose the change for review |
| Harness failure | Toolchain, node_modules, babel, or environment broke | Fix the harness; the product is fine |

Never "fix" a failing check by editing the map or a test to describe the new
behavior — that hides product regressions. If the new behavior is intentional,
the map/test update is a separate reviewed change.

## Cleanup

- Remove scratch driver dirs and evidence dirs you created.
- `git status` must show no modifications inside the repo.
