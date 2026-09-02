# Testing Methodology

## Overview

The plugin uses a 4-tier testing strategy designed to catch regressions without requiring a live Salesforce org. All tests run locally with mocked API responses.

```
Tier 1: Smoke Tests          — Do all 160 commands import and have valid metadata?
Tier 2: CRUD Base Tests       — Do the 6 CRUD base classes build correct requests?
Tier 3: Hand-Tuned Tests      — Do custom commands (name resolution, SQL, etc.) work?
Tier 4: Inventory Snapshot    — Has any command been added, removed, or changed?
```

Total: **109 tests**, ~10 seconds.

## Running Tests

```bash
# Full suite (all 4 tiers)
npx mocha 'test/**/*.test.ts' --timeout 120000

# Fast tests only (Tier 2 + 3 + utilities, ~1 sec)
npx mocha 'test/shared/**/*.test.ts' 'test/commands/crud/*.test.ts' 'test/commands/handtuned/*.test.ts'

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

## Tier 2: CRUD Base Class Tests (26 tests)

**Files:** `test/commands/crud/*.test.ts`

Tests the shared CRUD base classes using real command subclasses with mocked API:

| Base Class        | Test File            | What's Tested                                      |
| ----------------- | -------------------- | -------------------------------------------------- |
| CrudListCommand   | `crudList.test.ts`   | Pagination, arrayKey, batchSize, mapRecord         |
| CrudGetCommand    | `crudGet.test.ts`    | Path injection, response mapping                   |
| CrudCreateCommand | `crudCreate.test.ts` | POST body, ID extraction                           |
| CrudDeleteCommand | `crudDelete.test.ts` | DELETE + query params (shouldDeleteDataLakeObject) |
| CrudUpdateCommand | `crudUpdate.test.ts` | PATCH path, definition-file body, empty-id guard   |
| CrudActionCommand | `crudAction.test.ts` | POST path injection, endpoint construction         |

**What it catches:** Regression in shared request building, pagination, response parsing.

## Tier 3: Hand-Tuned Command Tests (34 tests)

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
| multi-param endpoints   | `multi-path-param.test.ts`        | Both :params resolved on the 4 reachable cmds; deny-listed throw  |

**What it catches:** Broken name resolution, wrong query params, wrong HTTP method, response parsing errors.

## Tier 4: Inventory Snapshot (7 tests)

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

## Shared Utility Tests (16 tests)

**Files:** `test/shared/*.test.ts`

| Utility        | Tests | What's Tested                                                            |
| -------------- | ----- | ------------------------------------------------------------------------ |
| pathBuilder    | 16    | Param injection/encoding, unresolved-token guard, query-string building  |
| definitionFile | 4     | JSON loading, validation (rejects arrays, invalid JSON, missing files)   |
| asyncPoller    | 3     | Export shape, failure status detection                                   |
| nameResolver   | 8     | Case-insensitive match, ID passthrough, missing name/ID errors, arrayKey |

## Packaging Tests (18 tests)

**File:** `test/lifecycle-scripts.test.ts`

Asserts the `package.json` lifecycle scripts that make `sf plugins install <slug>#<ref>` work:

- `prepare` exists and runs both `tsc -p .` and `oclif manifest`
- `prepare` does not delegate to `build`, whose lint step would fail a consumer install
- `compile` regenerates the manifest and declares it as output, so a linked plugin never reads a stale one
- `postinstall` runs `husky install` when `.git` exists, never runs it when it does not, and exits 0 either way
- `postinstall` applies the node compat patch to the tree it landed in, and survives a missing applier
- `files` ships the compat applier, without which `postinstall` would silently patch nothing
- `files` ships the directory `oclif.commands` resolves against, and `tsconfig` emits into it
- `engines.node` admits every Node major we install on, with no upper bound

The `postinstall` cases execute the real script body under `sh -c`, in a throwaway cwd laid out like an
installed package, against a `husky` stub first on `PATH` that records its argv and exits non-zero.
Asserting on the recorded argv and on the rewritten `buffer-equal-constant-time` proves each half of the
body actually ran, rather than the trailing `|| exit 0` making any outcome pass. They are skipped on
Windows, where npm runs the body through `cmd.exe` and neither `sh` nor the stub's shebang exists.

**What it catches:** A `prepare` dropped in a merge, an ungated `postinstall`, a `files`/`outDir` mismatch.

The end-to-end check cannot be a unit test — it needs a network install of a pushed commit:

```bash
bash scripts/verify-install.sh <ref>   # defaults to the local HEAD
```

It installs into a throwaway `SF_DATA_DIR`, so an existing `sf plugins link .` survives the run.

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
