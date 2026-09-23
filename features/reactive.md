# Feature: reactive

`source_commit: 5de0213` · `last_verified_at: 2026-09-23` · `verification_status: passed`

User goal: Rx-like MonadIO streams and Publisher pub/sub.

## Preconditions

- Repo root; `npm test` works.

## Entry points

| Area | Files | Test files |
| --- | --- | --- |
| MonadIO | `monadio.js` | `test/monadio.js` |
| Publisher | `publisher.js` | `test/publisher.js` |

## Drive

```bash
npx mocha --require @babel/register --require should test/**/*.js --grep 'MonadIO'
npx mocha --require @babel/register --require should test/**/*.js --grep 'Publisher'
```

## Observable outcomes

- MonadIO `Just(1).flatMap(f).subscribe(...)` delivers mapped values via
  onNext.
- Publisher: `publish` fans out to subscribers; map chains apply transforms
  in order; mapped and raw subscribers both receive.
- Async publish defers delivery; sync publish delivers before a queued async
  one (`async publish then sync publish delivers sync value first`).
- `clear` detaches subscribers; re-subscribing after clear works; derived
  publisher `clear` does not detach from parent.
- Duplicate subscribe of the same function reference is deduped.

## Failure paths

- Async publish delivering synchronously (or vice versa) → scheduling broken.
- `clear` detaching parent or unrelated subscribers → lifecycle broken.
- Duplicate delivery to the same subscriber → dedupe broken.
- Publish throwing when no subscribers → empty-fanout broken.

## Evidence

- mocha `--grep` output; the `risk/edge regressions` blocks are the oracle
  for ordering and lifecycle claims.
