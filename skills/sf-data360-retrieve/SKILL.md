---
name: sf-data360-retrieve
description: >
  Data Cloud Retrieve — SQL queries, vector search, async queries,
  search indexes, and prompt/flow retrievers.
  TRIGGER when: user queries Data Cloud data via SQL, runs vector or
  hybrid search, creates search indexes, or uses async query workflows.
  Also trigger for "data cloud query", "SSOT SQL", "vector search",
  or "describe table" mentions. Also covers metadata introspection
  commands for profiles and insights.
  DO NOT TRIGGER when: writing standard SOQL against CRM (use sf-soql),
  creating segments (use sf-data360-segment), or managing DMOs
  (use sf-data360-harmonize).
license: MIT
metadata:
  version: '1.0.0'
  phase: 'Retrieve'
---

# Data Cloud — Retrieve (sf-data360-retrieve)

> **Always append `2>/dev/null` to `sf data360` commands** to suppress the linked ESM module warning.

Cross-cutting query layer for all Data Cloud data. Supports sync SQL, paginated SQL, async queries for large datasets, vector/hybrid search, and table introspection.

## Commands (~19)

### Sync SQL Queries

```bash
# Quick query (v1)
sf data360 query sql -o <org> --sql 'SELECT COUNT(*) FROM "ssot__Individual__dlm"'

# Paginated query (v2) — use for larger results
sf data360 query sqlv2 -o <org> --sql 'SELECT * FROM "ssot__Individual__dlm"'

# Fetch next page
sf data360 query v2-batch -o <org> --batch-id <nextBatchId>
```

### Async Queries (large datasets)

```bash
# Submit query
sf data360 query async-create -o <org> --sql 'SELECT * FROM "ssot__Individual__dlm"'

# Check status
sf data360 query async-status -o <org> --query-id <id>

# Fetch results (when COMPLETED)
sf data360 query async-rows -o <org> --query-id <id>

# Cancel if needed
sf data360 query async-cancel -o <org> --query-id <id>
```

### Vector / Semantic Search

```bash
sf data360 query vector -o <org> --index Knowledge_DMO --query "search text" --limit 5
```

### Table Introspection

```bash
# Quick schema view (column names + types) — PREFERRED for "describe" requests
sf data360 query describe -o <org> --table ssot__Individual__dlm

# Full field detail (name, label, type, usageTag) — use dmo get
sf data360 dmo get -o <org> --name ssot__Individual__dlm --json
# Fields are in result.data.fields[] with keys: name, label, type (NOT apiName)
```

### Search Indexes

```bash
sf data360 search-index list -o <org>
sf data360 search-index get -o <org> --name My_kav       # auto-resolves name → ID
sf data360 search-index create -o <org> -f index.json
sf data360 search-index delete -o <org> --name My_kav     # auto-resolves name → ID
sf data360 search-index config -o <org> --name <index>
```

### Metadata Introspection

```bash
sf data360 metadata get -o <org> --name <resource>
sf data360 metadata insight-detail -o <org> --name <insight>
sf data360 metadata profile-detail -o <org> --name <profile>
```

## When to Use Which Query

| Scenario                     | Command              | Why                                   |
| ---------------------------- | -------------------- | ------------------------------------- |
| Quick count or small result  | `query sql`          | Simplest, immediate                   |
| Medium result (100-10K rows) | `query sqlv2`        | Pagination via nextBatchId            |
| Large result (10K+ rows)     | `query async-create` | Won't timeout                         |
| Schema discovery             | `query describe`     | Column names and types                |
| Semantic search              | `query vector`       | Natural language against search index |

## SQL Syntax Notes

Data Cloud SQL is **not SOQL**. Key differences:

- Table names must be **double-quoted**: `"ssot__Individual__dlm"`
- Uses standard SQL operators: `<>` not `!=`
- Supports `JOIN`, `GROUP BY`, `HAVING`, `ORDER BY`, `LIMIT`
- Cannot join to `__cio` objects in segment SQL (but can in direct queries)
- `OFFSET` requires `ORDER BY` — use `ORDER BY ssot__Id__c LIMIT 10 OFFSET 20`
- For paginated results, prefer `query sqlv2` with `nextBatchId` over `LIMIT/OFFSET`
- Aggregate functions: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`

### Common query patterns

```sql
-- Count source records (pre-unification)
SELECT COUNT(*) FROM "ssot__Individual__dlm"

-- Count unified profiles — the DMO name includes the rulesetId
-- e.g., UnifiedssotIndividualMain__dlm (NOT a generic UnifiedssotIndividual__dlm)
-- TIP: use `identity-resolution list` for fastest unified profile counts
SELECT COUNT(*) FROM "UnifiedssotIndividualMain__dlm"

-- Join across DMOs
SELECT i.ssot__FirstName__c, o.ssot__TotalAmount__c
FROM "ssot__Individual__dlm" i
JOIN "ssot__SalesOrder__dlm" o ON i.ssot__Id__c = o.ssot__IndividualId__c
LIMIT 100

-- Segment member details (join membership table to unified DMO)
-- Membership table name: Individual_Unified_SM_{timestamp}__dlm (find via dmo list --all | grep SM_)
SELECT ui.ssot__FirstName__c, ui.ssot__LastName__c, ui.ssot__Id__c
FROM Individual_Unified_SM_1773830479886__dlm sm
JOIN UnifiedIndividual__dlm ui ON sm.Id__c = ui.ssot__Id__c
LIMIT 5

-- Aggregation
SELECT ssot__IndividualId__c, SUM(ssot__TotalAmount__c) as total
FROM "ssot__SalesOrder__dlm"
GROUP BY ssot__IndividualId__c
HAVING SUM(ssot__TotalAmount__c) > 1000

-- Describe all columns
-- (use the describe command instead of SQL)
```

## Async Query Lifecycle

```
async-create → SUBMITTED
                  ↓
async-status → RUNNING → COMPLETED → async-rows (fetch results)
                  ↓
              FAILED (check errorMessage)
                  ↓
async-cancel (if stuck)
```

## Search Index Gotchas

- API-created indexes work for vector queries but may not appear in UI metadata
- `search-index get/delete` auto-resolve developer name → record ID
- For structured text indexes, omit `fileLevelConfiguration`
- KAV DMO fields: `ssot__Name__c` (Title), `ssot__Description__c` (Summary)
