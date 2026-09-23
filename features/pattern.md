# Feature: pattern

`source_commit: 5de0213` · `last_verified_at: 2026-09-23` · `verification_status: passed`

User goal: SumType definitions and pattern matching.

## Preconditions

- Repo root; `npm test` works.

## Entry points

| Area | Files | Test files |
| --- | --- | --- |
| SumType | `pattern.js` (SumType) | `test/pattern.js` (SumType block) |
| pattern matching | `pattern.js` | `test/pattern.js` |

## Drive

```bash
npx mocha --require @babel/register --require should test/**/*.js --grep 'SumType'
npx mocha --require @babel/register --require should test/**/*.js --grep 'pattern'
```

## Observable outcomes

- SumType constructors produce tagged values; match dispatches on the tag.
- Pattern matching is null-safe (`pattern - null safety (regression)` block).
- Exhaustiveness/wildcard behavior per the extended-coverage block.

## Failure paths

- Match dispatching to the wrong branch → tag comparison broken.
- Null/undefined input crashing instead of falling through → null-safety
  regression.
- SumType constructor accepting invalid arity → construction guard broken.

## Evidence

- mocha `--grep` output; the null-safety regression block is the oracle.
