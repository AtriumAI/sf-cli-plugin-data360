---
name: sf-data360-segment
description: >
  Data Cloud Segment, Analyze & Predict phase — segments, calculated
  insights, and data analysis.
  TRIGGER when: user creates segments, calculated insights, or analyzes
  Data Cloud data patterns.
  DO NOT TRIGGER when: working with DMOs/mappings (use sf-data360-harmonize),
  activations (use sf-data360-act), or SQL queries (use sf-data360-retrieve).
license: MIT
metadata:
  version: '1.0.0'
  phase: 'Segment, Analyze & Predict'
---

# Data Cloud — Segment, Analyze & Predict (sf-data360-segment)

> **Always append `2>/dev/null` to `sf data360` commands** to suppress the linked ESM module warning.

Creates market segments and calculated insights from unified data.

## Commands (~19)

### Segments

```bash
sf data360 segment list -o <org>
sf data360 segment get -o <org> --name <segment>
sf data360 segment create -o <org> -f segment.json --api-version 64.0
sf data360 segment publish -o <org> --name My_Segment        # auto-resolves name → marketSegmentId
sf data360 segment count -o <org> --name <segment>
sf data360 segment members -o <org> --name <segment>
sf data360 segment deactivate -o <org> --name <segment>
sf data360 segment delete -o <org> --name <segment>
```

### Calculated Insights

```bash
sf data360 calculated-insight list -o <org>
sf data360 calculated-insight get -o <org> --name Lifetime_Value
sf data360 calculated-insight create -o <org> -f ci.json
sf data360 calculated-insight run -o <org> --name Lifetime_Value
sf data360 calculated-insight delete -o <org> --name <ci>
```

### Insights

```bash
sf data360 insight query -o <org>
sf data360 insight metadata -o <org>
```

## Key Gotchas

### Segment SQL

- **Cannot JOIN to `__cio` objects** (Calculated Insights) — use inline aggregation instead
- Must use `<>` not `!=` (strict SQL conformance)
- Model `name` field is cosmetic — API parses SQL to find the segmentOn DMO
- **Create often fails on v66** — use `--api-version 64.0`
- Case DMO field is `ssot__CaseStatusId__c` not `ssot__CaseStatus__c`

### Segment definition template

```json
{
  "name": "High_Value_Customers",
  "displayName": "High Value Customers",
  "segmentOn": "UnifiedssotIndividualMain__dlm",
  "segmentType": "DBT",
  "sqlStatement": "SELECT ssot__Id__c FROM UnifiedssotIndividualMain__dlm ui JOIN ssot__SalesOrder__dlm so ON ui.ssot__Id__c = so.ssot__IndividualId__c GROUP BY ssot__Id__c HAVING SUM(so.ssot__TotalAmount__c) > 1000",
  "publishStatus": "DRAFT"
}
```

### Calculated Insights

- `calculated-insight run --name` needs `__cio` suffix for the CI object
- `expression` field is raw SQL with fully qualified `DMO.field` references
- CI objects are queryable via SQL but not joinable in segment SQL

### Querying segment members

`segment members` returns only internal IDs — not useful for names/details. Instead, query via SQL:

```bash
# 1. Find the segment membership table (naming: Individual_Unified_SM_{timestamp}__dlm)
sf data360 dmo list --all -o <org> | grep -i "SM_"

# 2. Query member details by joining membership table to unified DMO
sf data360 query sql -o <org> --sql '
  SELECT ui.ssot__FirstName__c, ui.ssot__LastName__c, ui.ssot__Id__c
  FROM Individual_Unified_SM_1773830479886__dlm sm
  JOIN UnifiedIndividual__dlm ui ON sm.Id__c = ui.ssot__Id__c
  LIMIT 5'
```

- Join key is `sm.Id__c = ui.ssot__Id__c` (not KQ_Id\_\_c)
- Replace the `SM_{timestamp}` with the actual table from `dmo list`
- Replace `UnifiedIndividual__dlm` with your actual unified DMO name

### Publish workflow

```bash
# 1. Create segment
sf data360 segment create -o <org> -f segment.json --api-version 64.0

# 2. Publish (triggers evaluation)
sf data360 segment publish -o <org> --name My_Segment

# 3. Check member count
sf data360 segment list -o <org>
```

## Previous Phase ← [sf-data360-harmonize](../sf-data360-harmonize/SKILL.md)

## Next Phase → [sf-data360-act](../sf-data360-act/SKILL.md)
