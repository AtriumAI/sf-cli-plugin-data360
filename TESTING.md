# Testing Methodology

## Overview

The plugin uses a 4-tier testing strategy designed to catch regressions without requiring a live Salesforce org. All tests run locally with mocked API responses.

```
Tier 1: Smoke Tests          — Do all 160 commands import and have valid metadata?
Tier 2: CRUD Base Tests       — Do the 6 CRUD base classes build correct requests?
Tier 3: Hand-Tuned Tests      — Do custom commands (name resolution, SQL, etc.) work?
Tier 4: Inventory Snapshot    — Has any command been added, removed, or changed?
```

Total: **86 tests**, ~51 seconds.

## Running Tests

```bash
# Full suite (all 4 tiers)
npx mocha 'test/**/*.test.ts' --timeout 120000

# Fast tests only (Tier 2 + 3 + utilities, ~1 sec)
npx mocha 'test/lib/**/*.test.ts' 'test/commands/crud/*.test.ts' 'test/commands/handtuned/*.test.ts'

# Smoke test only (Tier 1, ~50 sec — imports all 160 commands)
npx mocha 'test/commands/smoke.test.ts' --timeout 120000

# Inventory snapshot only (Tier 4)
npx mocha 'test/commands/inventory.test.ts' --timeout 120000
```

## Tier 1: Smoke Tests (8 tests)

**File:** `test/commands/smoke.test.ts`

Dynamically discovers and imports all 160 command files, then validates:

- All commands import without errors
- All have a `summary` (non-empty)
- All have `enableJsonFlag = true`
- All have `examples` array
- All have `target-org` flag
- All have `api-version` flag

**What it catches:** Broken imports, missing flags, missing metadata after refactoring.

## Tier 2: CRUD Base Class Tests (13 tests)

**Files:** `test/commands/crud/*.test.ts`

Tests the shared CRUD base classes using real command subclasses with mocked API:

| Base Class        | Test File            | What's Tested                                      |
| ----------------- | -------------------- | -------------------------------------------------- |
| CrudListCommand   | `crudList.test.ts`   | Pagination, arrayKey, batchSize, mapRecord         |
| CrudGetCommand    | `crudGet.test.ts`    | Path injection, response mapping                   |
| CrudCreateCommand | `crudCreate.test.ts` | POST body, ID extraction                           |
| CrudDeleteCommand | `crudDelete.test.ts` | DELETE + query params (shouldDeleteDataLakeObject) |
| CrudUpdateCommand | `crudUpdate.test.ts` | PATCH path injection, definition-file body         |
| CrudActionCommand | `crudAction.test.ts` | POST path injection, endpoint construction         |

**What it catches:** Regression in shared request building, pagination, response parsing.

## Tier 3: Hand-Tuned Command Tests (15 tests)

**Files:** `test/commands/handtuned/*.test.ts`

Tests commands with custom `run()` implementations:

| Command                 | Test File                         | What's Tested                                                     |
| ----------------------- | --------------------------------- | ----------------------------------------------------------------- |
| identity-resolution run | `identity-resolution-run.test.ts` | Name→ID resolution, 18-char ID passthrough, error on missing name |
| segment publish         | `segment-publish.test.ts`         | Name→marketSegmentId resolution                                   |
| connection get          | `connection-get.test.ts`          | Name→ID with connectorType requirement                            |
| query sqlv2             | `query-sqlv2.test.ts`             | POST body, nextBatchId pagination, empty results                  |
| query async-\*          | `query-async.test.ts`             | Create/status/rows/cancel lifecycle                               |
| dmo mapping-list        | `dmo-mapping-list.test.ts`        | Custom query params, nested response parsing                      |

**What it catches:** Broken name resolution, wrong query params, wrong HTTP method, response parsing errors.

## Tier 4: Inventory Snapshot (6 tests)

**File:** `test/commands/inventory.test.ts`

Compares current command metadata against a checked-in snapshot (`test/fixtures/command-manifest.json`):

- Command count matches
- No commands removed
- No commands added without updating snapshot
- Base classes consistent
- Endpoints consistent
- Flags consistent

**What it catches:** Unintentional additions/removals, changed endpoints or flags, base class changes.

**Regenerating the snapshot:**

```bash
node --loader ts-node/esm scripts/generate-manifest.mjs
```

## Shared Utility Tests (42 tests)

**Files:** `test/lib/data360/*.test.ts`

| Utility        | Tests | What's Tested                                                            |
| -------------- | ----- | ------------------------------------------------------------------------ |
| pathBuilder    | 13    | Path param injection, query string building, URL encoding                |
| queryResult    | 4     | Metadata parsing, display row formatting, vector match extraction        |
| sql            | 3     | Identifier quoting, vector search SQL building                           |
| pagination     | 3     | Export shape, type validation                                            |
| apiVersion     | 4     | Default version, normalization, SSOT path building                       |
| definitionFile | 4     | JSON loading, validation (rejects arrays, invalid JSON, missing files)   |
| asyncPoller    | 3     | Export shape, failure status detection                                   |
| nameResolver   | 8     | Case-insensitive match, ID passthrough, missing name/ID errors, arrayKey |

## Test Helpers

### `test/helpers/mockOrg.ts`

Creates a mock `Org` with a fake connection that logs all API requests:

```typescript
const { org, requestLog } = createMockOrg({
  responses: new Map([
    ['/segments', { segments: [{ apiName: 'Seg1', ... }] }],
  ]),
});
```

- Matches responses by URL (longest match wins)
- Logs method, URL, and body for every request
- No real network calls

### `test/helpers/runCommand.ts`

Executes a Data360Command subclass in isolation:

```typescript
const { result, requestLog, tableData } = await runCommand(SegmentList, {
  flags: { 'target-org': {}, 'api-version': '66.0', all: false },
  responses: new Map([...]),
});
```

- Instantiates command with mocked org
- Captures `log()`, `table()`, `styledHeader()` output
- Returns result + request log for assertions

## Live Testing

Live tests against real orgs are run manually using the E2E test scripts:

```bash
# Workshop E2E (multi-step pipeline)
test/workshop/workshop-e2e.sh --org <alias>

# Commands E2E (all topics)
test/workshop/commands-e2e.sh --org <alias> --topic <topic>
```

These require an authenticated org with Data Cloud provisioned.

## What's NOT Tested

- **Commands that need org-specific setup:** transform validate, docai generate-schema, async query lifecycle against real data
- **Platform limitations:** Redshift stream creation (API unsupported), CRM connector manual sync
- **UI-side behavior:** Search index UI metadata registration, segment UI validation

## Adding Tests for New Commands

### For a new CRUD command (uses base class):

The smoke test and inventory test cover it automatically. No additional test needed unless it has custom `queryParams` or `mapRecord`.

### For a new hand-tuned command:

Create `test/commands/handtuned/<command-name>.test.ts`:

```typescript
import { runCommand } from '../../helpers/runCommand.js';
import MyCommand from '../../../src/commands/data360/topic/command.js';

describe('my command', () => {
  it('sends correct request', async () => {
    const { requestLog, result } = await runCommand(MyCommand, {
      flags: { 'target-org': {}, 'api-version': '66.0', name: 'test' },
      responses: new Map([['/my-endpoint', { data: [...] }]]),
    });
    assert.equal(requestLog[0].method, 'POST');
    assert.ok(requestLog[0].url.includes('/my-endpoint'));
  });
});
```

### After any change:

```bash
# Regenerate manifest if commands were added/removed/changed
node --loader ts-node/esm scripts/generate-manifest.mjs

# Run tests
npx mocha 'test/**/*.test.ts' --timeout 120000
```
