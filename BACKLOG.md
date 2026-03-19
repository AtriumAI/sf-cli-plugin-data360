# Plugin Backlog

Bugs and enhancements discovered during Trailhead project walkthrough testing.

## Bugs

### ~~B1: `--map` flag loses duplicate source keys~~ FIXED

- **Found in**: Step 2b (Lead Phone → ContactPointPhone)
- **Issue**: `--map "Id__c=ssot__PartyId__c,Id__c=ssot__Id__c"` only keeps the last entry because JavaScript `Map` overwrites duplicate keys.
- **Impact**: Can't map one DLO field to two DMO fields (e.g., Id → both PK and PartyId).
- **Workaround**: Use `dmo mapping-create -f definition.json` with explicit JSON `fieldMapping` array.
- **Fix**: Change `--map` parsing to use an array of pairs instead of a Map. Either:
  - Support repeated `--map` flags: `--map Id__c=ssot__PartyId__c --map Id__c=ssot__Id__c`
  - Or parse as array: `--map "Id__c=ssot__PartyId__c;Id__c=ssot__Id__c"` (semicolon-separated)
- **Files**: `src/commands/data360/dmo/map-to-canonical.ts`

### ~~B2: `data-stream delete` missing `shouldDeleteDataLakeObject` param~~ FIXED

- **Found in**: Step 2a (deleting Lead_Home stream)
- **Issue**: `sf data360 data-stream delete` fails with "Required request parameter missing: shouldDeleteDataLakeObject"
- **Fix**: Add `--keep-dlo` boolean flag (default: delete DLO). Pass `shouldDeleteDataLakeObject` query param.
- **Files**: `src/commands/data360/data-stream/delete.ts`, `src/shared/data360/crudBase.ts` (CrudDeleteCommand needs query param support)

### B3: `data-stream create-from-object` can't set formula fields

- **Found in**: Step 2a
- **Issue**: The `SFDC` stream type auto-discovers fields but doesn't allow custom labels. Formula fields created via PATCH always get `label = name`.
- **Root cause**: Only `CONNECTORSFRAMEWORK` stream type with explicit `dataLakeFieldInputRepresentations` supports custom labels.
- **Fix**: Not a bug per se — document the limitation. Consider adding a `create-from-object-advanced` command that:
  1. Discovers fields from connector API
  2. Allows formula field definitions via `--formula-file`
  3. Creates using `CONNECTORSFRAMEWORK` with explicit fields

### ~~B4: `calculated-insight list` returns empty — response uses `collection.items`~~ FIXED

- **Found in**: Step 4 (Calculated Insight inspection)
- **Issue**: `sf data360 calculated-insight list` returns 0 results even when insights exist.
- **Root cause**: The `/ssot/calculated-insights` API returns `{ collection: { items: [...] } }` instead of the standard top-level array or `{ data: [...] }` pattern. The `extractArray` helper in `pagination.ts` can't reach `collection.items` (only handles one level of nesting).
- **Fix**: Either:
  - Support dotted `arrayKey` (e.g., `collection.items`) in `extractArray`
  - Or override in the CI list command to flatten the response before pagination
- **Files**: `src/shared/data360/pagination.ts`, `src/commands/data360/calculated-insight/list.ts`

### ~~B5: `search-index get/delete --name` doesn't resolve developer name~~ FIXED

- **Found in**: Workshop B2 (Search Index creation)
- **Issue**: `search-index get --name My_kav` returns empty fields. `search-index delete --name My_kav` fails with "not found". Both need the record ID instead.
- **Fix**: The get/delete commands need to resolve developer name to ID, or the endpoint path needs the ID injected differently.
- **Files**: `src/commands/data360/search-index/get.ts`, `src/commands/data360/search-index/delete.ts`

### B6: `identity-resolution list` doesn't display names

- **Found in**: Workshop A4 (Identity Resolution)
- **Issue**: `identity-resolution list` returns a table with empty Name/Status columns even when rulesets exist.
- **Root cause**: Response structure doesn't match the column extraction logic.
- **Files**: `src/commands/data360/identity-resolution/list.ts`

### ~~B7: `identity-resolution run --name` doesn't resolve name~~ FIXED

- **Found in**: Workshop A4
- **Issue**: `identity-resolution run --name Main` fails with "Identity Resolution not found: Main". Needs the record ID.
- **Workaround**: Use `sf api request rest` with the ID directly.
- **Fix**: Same pattern as B5 — resolve name/label to ID before calling the action endpoint.
- **Files**: `src/commands/data360/identity-resolution/run.ts`

### B8: `dmo relationship-create` missing `--name` flag for DMO path param

- **Found in**: Workshop A2e (Attendance relationship)
- **Issue**: Endpoint is `/data-model-objects/:dataModelObjectName/relationships` but no flag exists to provide the DMO name. The `:dataModelObjectName` placeholder is never replaced.
- **Workaround**: Use `sf api request rest` directly.
- **Fix**: Add `--name` flag and inject it into the endpoint path.
- **Files**: `src/commands/data360/dmo/relationship-create.ts`

### ~~B9: `dmo list` pagination caps at 50 records~~ FIXED

- **Found in**: Workshop B2 (couldn't find KAV DMO)
- **Issue**: `dmo list --all` returns only 50 DMOs even though the standard catalog has hundreds. The `--all` flag doesn't paginate past the first page.
- **Root cause**: Pagination logic may not be triggering for the DMO list endpoint.
- **Files**: `src/commands/data360/dmo/list.ts`, `src/shared/data360/pagination.ts`

### B10: `data-stream create` doesn't support Redshift/external database connectors

- **Found in**: Workshop A2b (Attendance stream)
- **Issue**: API returns "REDSHIFT is not supported" for `datastreamType: "CONNECTORSFRAMEWORK"` with Redshift datasource.
- **Root cause**: The Data Streams Connect API only supports SFDC, S3, SFTP, IngestApi, and similar connectors — not zero-copy database connectors like Redshift.
- **Impact**: Redshift/Snowflake/BigQuery data stream creation is UI-only.
- **Fix**: Document as a known platform limitation. Consider adding a helpful error message in the plugin.

## Enhancements

### E1: New command `data-stream create-advanced`

- **Rationale**: Full control over field selection, labels, formula fields, and stream type
- **Approach**:
  1. Discover fields from connector: `POST /connections/{connId}/objects/{obj}/fields`
  2. Accept `--formula-file` for formula field definitions (name, label, formula, return type)
  3. Accept `--include-fields` / `--exclude-fields` for field selection
  4. Create using `CONNECTORSFRAMEWORK` with explicit `dataLakeFieldInputRepresentations`
  5. Apply naming convention: custom fields `__c` → `_c` for DLO names
- **Note**: Connector `fields` endpoint returns `type` not `dataType` — map accordingly
- **Priority**: High — this is the key gap for fully automated pipeline creation

### E2: New command `connection fields`

- **Rationale**: Need to discover available fields on a CRM object before creating a stream
- **Endpoint**: `POST /connections/{connectionId}/objects/{objectName}/fields`
- **Output**: Table of field name, label, type, isCalculated
- **Depends on**: Need connection ID — add `connection list --connector-type SalesforceDotCom`

### E3: Improve `dmo map-to-canonical` with `--map` duplicate key support

- See B1 above. Also consider:
  - `--map-file` flag for complex mappings (JSON array of source→target pairs)
  - Better error message when duplicate keys detected

### E4: Add query param support to CrudDeleteCommand

- Some delete endpoints need query parameters (e.g., `shouldDeleteDataLakeObject`)
- CrudDeleteCommand currently only injects the resource ID
- Add optional `deleteParams` method that subclasses can override

### E5: Support `--connector-type` filter on `connection list`

- The connections API requires `connectorType` parameter
- Our `connection list` command doesn't pass it, causing API errors
- Add as required or optional flag

### E6: Document `CONNECTORSFRAMEWORK` vs `SFDC` stream types

- Add to best practices doc and command help text
- Key difference: `SFDC` auto-discovers fields, `CONNECTORSFRAMEWORK` gives full control
- Users should know when to use each

### E7: `connection create` doesn't support external connector credentials

- **Found in**: Workshop A2a (Redshift connection)
- **Issue**: API expects `credentials` and `parameters` fields, not `connectionProperties`. External connectors (Redshift, Snowflake, etc.) require UI-based setup.
- **Fix**: Investigate the connection input schema per connector type and support credential fields.

### E8: `data-kit status` should parse namespace prefix and show bundle details

- **Found in**: Workshop A1 (Sales bundle verification)
- **Issue**: `data-kit status --name Sales` returns empty. The actual kit name is `cdp_crm_dk1__Sales` with namespace prefix.
- **Fix**: Either accept short name and resolve, or show all kits with component details (streams count, component types).
- **Reference**: `/ssot/data-kits` returns `dataKitDetails[].components[]` with `developerName`, `label`, `componentType`, `streams[]`.

### E9: `data-kit dependencies` command — show bundle component dependencies

- **Rationale**: Useful for understanding what a bundle deploys before installing.
- **Endpoint**: `GET /ssot/data-kits/{dataKitName}/components/{componentName}/dependencies?componentType={type}`
- **Component types**: ActivationTarget, CalculatedInsight, DataAction, DataActionTarget, DataConnection, DataGraph, DataLakeObject, DataSemanticSearch, DataShare, DataStreamBundle, DataTransform, IdentityResolution, MarketSegment, MarketSegmentActivation, MlConfiguredModel, MlPredictionJob, MlRetriever, SemanticModel
- **Reference**: `~/src/salesforce-docs/current/platform/data360-connect-api-data-kits.md`

### ~~E10: Fix name resolution across all commands (systematic)~~ PARTIALLY DONE

- **Found in**: Workshop B2, A4, A9 — multiple commands can't resolve by name/label
- **Issue**: `search-index get/delete`, `identity-resolution run/list`, `segment publish/list` all fail to resolve developer name or label to ID.
- **Root cause**: Generated CRUD commands inject `--name` into URL path literally, but many endpoints need the record ID instead.
- **Fix**: Add a resolve step — list → find by name → use ID. Could be in `crudBase.ts` as a `resolveNameToId()` helper.
- **Priority**: High — this is the #1 UX friction across the plugin.

### E11: `segment create` should support `--api-version 64.0` default for segments

- **Found in**: Workshop A9
- **Issue**: Segment create fails on v66 but works on v64 for the same payload.
- **Fix**: Override default API version for segment commands, or document the version requirement.

### E12: Segment SQL gotchas documentation

- **Found in**: Workshop A9
- **Gotchas to document**:
  - Cannot JOIN to `__cio` objects (Calculated Insights) — use inline aggregation
  - Must use `<>` not `!=` (strict SQL conformance)
  - Case DMO field is `ssot__CaseStatusId__c` not `ssot__CaseStatus__c`
  - Model `name` field is cosmetic — API parses SQL to find the DMO

## Observations (not bugs)

### O1: DLO field labels are immutable after creation

- This is a platform characteristic, not a plugin issue
- Caused by big data infrastructure (Apache Spark schema)
- **Must get labels right at creation time** — no rename possible

### O2: CRM connector runs on platform schedule

- `data-stream run` fails for `SalesforceDotCom` connector type
- Error: "Connector type SalesforceDotCom is not allowed to run in non-interactive mode"
- Data syncs on platform schedule (~10-15 min default)
- Consider documenting this in `data-stream run` help text

### ~~B13: `connection connector-get` — name not found~~ FIXED

- **Found in**: Commands E2E test (wh org)
- **Issue**: `connector-get --name SalesforceDotCom` returns "does not found". May need different connector name format or the endpoint uses a different identifier.
- **Files**: `src/commands/data360/connection/connector-get.ts`

### B14: `connection test` missing `--name` flag

- **Found in**: Commands E2E test (wh org)
- **Issue**: No `--name` flag. Same pattern as B8.
- **Files**: `src/commands/data360/connection/test.ts`

### ~~B15: `connection get` — passes name but endpoint expects connection ID~~ FIXED

- **Found in**: Commands E2E test (wh org)
- **Issue**: `connection get --name SalesforceDotCom_Home` returns "Entity ID Not Valid". The endpoint needs the connection record ID, not the name.
- **Fix**: Resolve connection name to ID via list endpoint (similar to E10).
- **Files**: `src/commands/data360/connection/get.ts`

### ~~B16: `connection objects/databases` — wrong HTTP method (GET instead of POST)~~ FIXED

- **Found in**: Commands E2E test (wh org)
- **Issue**: Both `objects` and `databases` use GET but the API requires POST. Also `:connectionId` path param not injected.
- **Fix**: Change to POST and resolve connection name to ID.
- **Files**: `src/commands/data360/connection/objects.ts`, `src/commands/data360/connection/databases.ts`

### ~~B17: `query sql-v1`, `sqlv2`, `v2-batch`, `async-create` — non-functional stubs~~ FIXED

- **Found in**: Commands E2E test (wh org)
- **Issue**: Auto-generated stubs with no `--sql` or `-f` flag. They extend `CrudActionCommand` but have no way to pass a SQL body. Only `query sql` (hand-crafted) and `query vector` work.
- **Fix**: Hand-tune like `query sql` — add `--sql` flag, POST the body, format results. Or add `-f` definition file support.
- **Files**: `src/commands/data360/query/sql-v1.ts`, `sqlv2.ts`, `v2-batch.ts`, `async-create.ts`
- **Priority**: High — async queries needed for large result sets

### B19: `data-space members` — "Request failed" on valid data space

- **Found in**: Commands E2E test (wh org)
- **Issue**: `data-space members --name default` returns generic "Request failed". May need query params or POST method.
- **Files**: `src/commands/data360/data-space/members.ts`

### B20: `data-space member-get` — path param `:dataSpaceMemberObjectName` not injected

- **Found in**: Commands E2E test (wh org)
- **Issue**: Path param placeholder sent literally to API. Needs a second `--member` flag.
- **Files**: `src/commands/data360/data-space/member-get.ts`

### B21: `dmo mapping-list` — requires DMO name query param not exposed

- **Found in**: Commands E2E test (wh org)
- **Issue**: "DMO or Source Object (CRM) developer Name is missing". The API requires a DMO name as query param but the command doesn't accept one.
- **Files**: `src/commands/data360/dmo/mapping-list.ts`

### B19: `dmo relationship-list` — path param `:dataModelObjectName` not injected

- **Found in**: Commands E2E test (wh org)
- **Issue**: Same pattern as B8. Path param sent literally.
- **Files**: `src/commands/data360/dmo/relationship-list.ts`

### B20: `data-space member-get` — path param `:dataSpaceMemberObjectName` not injected

- **Found in**: Commands E2E test (wh org)
- **Issue**: Path param placeholder sent literally to API. Needs a second `--member` or similar flag.
- **Files**: `src/commands/data360/data-space/member-get.ts`

### B18: `data-space members` — "Request failed" on valid data space

- **Found in**: Commands E2E test (wh org)
- **Issue**: `data-space members --name default` returns generic "Request failed". May need query params or POST method.
- **Files**: `src/commands/data360/data-space/members.ts`

### ~~B21: `transform validate` missing `--name` flag~~ FIXED

- **Found in**: Commands E2E test (wh org)
- **Issue**: Endpoint needs transform name in path but no `--name` flag exists.
- **Same pattern as**: B8 (relationship-create)
- **Files**: `src/commands/data360/transform/validate.ts`

### ~~B22: `docai generate-schema` missing `--name` flag~~ FIXED

- **Found in**: Commands E2E test (wh org)
- **Issue**: Endpoint needs config name in path but no `--name` flag exists.
- **Same pattern as**: B8, B13
- **Files**: `src/commands/data360/docai/generate-schema.ts`

### ~~B11: `segment publish --name` doesn't resolve developer name~~ FIXED

- **Found in**: Workshop A9
- **Issue**: `segment publish --name Highly_Engaged_but_Low_Feedback` fails with "resource does not exist". Needs the `marketSegmentId`.
- **Workaround**: Use `sf api request rest` with the segment ID from `segment list`.
- **Files**: `src/commands/data360/segment/publish.ts`

### B12: `segment list` doesn't display names

- **Found in**: Workshop A9
- **Issue**: Same display bug as B6 — empty Name/Status columns.
- **Files**: `src/commands/data360/segment/list.ts`

### O3: CaseHistory API name is `CaseHistory2`

- The Salesforce object "Case History" has API name `CaseHistory2`, not `CaseHistory`
- Using `CaseHistory` fails with `SystemModstamp not available`
- Document in `create-from-object` help text or add a known-alias map

### O4: IR rulesetId is permanent — cannot be reused after deletion

- Deleting an IR ruleset doesn't free its `rulesetId` — the unified DMOs persist
- Must use a new rulesetId for each re-creation
- Unified DMO naming pattern: `Unifiedssot{Object}{RulesetIdCapitalized}__dlm`

### O5: Segment SQL cannot reference `__cio` objects

- The segment DBT SQL parser cannot resolve Calculated Insight objects
- Workaround: use inline aggregation (GROUP BY / HAVING) instead of JOIN to `__cio`
- This is a platform limitation, not a plugin bug

### O6: Data Graph API requires `type` on every related object + all key/KQ fields

- **Every related object node must have a `type`**: `derived` (root), `bridge` (unified link), `standard` (standard DMOs), `custom` (custom DMOs), `calculated` (CIs)
- CI fields need `"ciFieldType": "MEASURE"` or `"DIMENSION"` — without it: "Minimum Number of CI Measures required"
- **All Key Qualifier fields must be included** in the fields array (KQ_Id, KQ_IndividualId, etc.)
- **Foreign key / join fields must be in fields** (e.g., ssot**IndividualId**c for Case→Individual)
- **Engagement DMOs require recency criteria** — both time (DAY) and record (RECORD) limits
- The UI auto-selects all key/KQ/FK fields; the API does not — you must specify them explicitly
- Without `type` on nodes, the API accepts the create but the build silently fails with "Processing Failed"

### O7: Redshift/zero-copy data stream creation is API-unsupported

- The Data Streams Connect API does not support creating streams for zero-copy database connectors (Redshift, Snowflake, BigQuery)
- Supported: SFDC, S3, SFTP, IngestApi, CONNECTORSFRAMEWORK (for S3/SFTP-type connectors)
- The connector exists (`REDSHIFT` in `/ssot/connectors`) but stream creation returns "REDSHIFT is not supported"
- Redshift stream creation is UI-only

### O8: Search index API vs UI metadata registration

- Search indexes created via REST API work for queries but may not register in UI metadata
- Trailhead validators check UI-side metadata, not the SSOT API
- For TH validation, create search indexes via UI Advanced Setup
