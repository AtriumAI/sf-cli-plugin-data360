---
name: sf-data360
description: >
  Salesforce Data Cloud orchestrator — multi-phase pipeline setup, doctor,
  data spaces, data kits, and cross-cutting workflows.
  TRIGGER when: user says "set up data cloud", "create a pipeline",
  "data360 doctor", manages data spaces or data kits, or needs a
  multi-step Data Cloud workflow spanning connect→prepare→harmonize→act.
  DO NOT TRIGGER when: working on a single phase (use the phase-specific
  sf-data360-* skill), standard SOQL (use sf-soql), or Apex (use sf-apex).
license: MIT
metadata:
  version: '1.0.0'
  scoring: 'manual verification against live org'
  plugin: '@gthoppae/plugin-data360'
---

# Salesforce Data Cloud Orchestrator (sf-data360)

Cross-cutting orchestrator for Salesforce Data Cloud (Data 360). Use when the task spans multiple phases of the Data Cloud reference architecture, or for platform-level resources like data spaces and data kits.

## When This Skill Owns the Task

Use `sf-data360` when the work involves:

- Multi-phase pipeline setup (Connect → Prepare → Harmonize → Segment → Act)
- Data spaces (`sf data360 data-space *`)
- Data kits (`sf data360 data-kit *`)
- Health checks (`sf data360 doctor`)
- "Set up a Customer 360 POC" type requests
- Troubleshooting across multiple Data Cloud components

Delegate to phase-specific skills when the user is working on a single phase:

| Phase                           | Skill                                                    | Ref Arch Column            |
| ------------------------------- | -------------------------------------------------------- | -------------------------- |
| Connections, connectors         | [sf-data360-connect](../sf-data360-connect/SKILL.md)     | Connect                    |
| Streams, DLOs, transforms       | [sf-data360-prepare](../sf-data360-prepare/SKILL.md)     | Prepare                    |
| DMOs, mappings, IR, data graphs | [sf-data360-harmonize](../sf-data360-harmonize/SKILL.md) | Harmonize & Unify          |
| Segments, insights, ML          | [sf-data360-segment](../sf-data360-segment/SKILL.md)     | Segment, Analyze & Predict |
| Activations, data actions       | [sf-data360-act](../sf-data360-act/SKILL.md)             | Act                        |
| SQL queries, vector search      | [sf-data360-retrieve](../sf-data360-retrieve/SKILL.md)   | Retrieve                   |

---

## Required Context to Gather First

- **Target org** alias (`-o <alias>`)
- **Scenario**: new pipeline from scratch, extend existing, or inspect/troubleshoot?
- **Data sources**: which CRM objects or external systems?
- **Target outcomes**: unified profiles? segments? activations? queries?
- **Data space**: `default` or custom?

---

## Execution Rules

**Always append `2>/dev/null` to `sf data360` commands** to suppress the linked ESM module warning that pollutes output:

```bash
# Good
sf data360 segment list -o <org> 2>/dev/null

# Bad — warning noise fills the context
sf data360 segment list -o <org>
```

For `--json` output, use `2>/dev/null` and pipe to python/jq for parsing.

---

## Plugin Setup

```bash
# Install the plugin
sf plugins install @gthoppae/plugin-data360

# Or link for development
cd plugin-data360 && sf plugins link .

# Verify
sf data360 doctor -o <org>
```

---

## Quick Reference: Common Follow-up Patterns

When the user asks follow-up questions, use these patterns directly:

### "Show me N members from segment X"

`segment members` only returns opaque IDs. Use SQL instead:

```bash
# 1. Get segment membership table name
sf data360 dmo list --all -o <org> | grep SM_
# 2. Join membership table to unified DMO (join key: sm.Id__c = ui.ssot__Id__c)
sf data360 query sql -o <org> --sql 'SELECT u.ssot__FirstName__c, u.ssot__LastName__c FROM "Individual_Unified_SM_{timestamp}__dlm" sm JOIN "UnifiedIndividual__dlm" u ON sm.Id__c = u.ssot__Id__c LIMIT 5'
```

### "Describe table X" / "What fields does X have?"

```bash
sf data360 query describe -o <org> --table ssot__Individual__dlm
```

There is NO `dmo describe` command. Use `query describe` or `dmo get --json`.

### "How many records in each stream?"

`data-stream list` has no record counts. Query each DLO:

```bash
sf data360 query sql -o <org> --sql 'SELECT COUNT(*) FROM "Contact_Home__dll"'
```

For detailed patterns, load the phase-specific skill: `/sf-data360-segment`, `/sf-data360-retrieve`, etc.

---

## Discover Existing State

Always start by inspecting what's already configured:

```bash
# Connections require --connector-type; check streams first to find types in use
sf data360 data-stream list -o <org>
# Then query connections by type (common: SalesforceDotCom, REDSHIFT, S3)
sf data360 connection list -o <org> --connector-type SalesforceDotCom
sf data360 dmo list --all -o <org>              # MUST use --all, default returns only 50
sf data360 identity-resolution list -o <org>    # fastest way to get unified profile counts
sf data360 segment list -o <org>
sf data360 calculated-insight list -o <org>
```

**Important**: `dmo list` without `--all` returns only 50 DMOs. The standard catalog has 1000+. Unified DMOs (from identity resolution) are often past position 50.

---

## Pipeline Recipes

### Recipe 1: CRM Object → Unified Profile (minimal)

```bash
# 1. Verify CRM connector exists
sf data360 connection list -o <org> --connector-type SalesforceDotCom

# 2. Create data stream from CRM object
sf data360 data-stream create-from-object -o <org> --object Contact --connection SalesforceDotCom_Home

# 3. Auto-map DLO to canonical DMO
sf data360 dmo map-to-canonical -o <org> --dlo Contact_Home__dll --dmo ssot__Individual__dlm --dry-run
sf data360 dmo map-to-canonical -o <org> --dlo Contact_Home__dll --dmo ssot__Individual__dlm

# 4. Create identity resolution
sf data360 identity-resolution create -o <org> -f ir-ruleset.json
sf data360 identity-resolution run -o <org> --name Main

# 5. Verify
sf data360 query sql -o <org> --sql 'SELECT COUNT(*) FROM "ssot__Individual__dlm"'
```

### Recipe 2: Full POC Pipeline (multi-object)

```bash
# Connect: verify connector
sf data360 connection list -o <org> --connector-type SalesforceDotCom

# Prepare: create streams for each object
sf data360 data-stream create -o <org> -f definitions/customer-stream.json
sf data360 data-stream create -o <org> -f definitions/order-stream.json

# Harmonize: DMOs + mappings + relationships
sf data360 dmo create -o <org> -f definitions/order-dmo.json
sf data360 dmo mapping-create -o <org> -f definitions/customer-mapping.json
sf data360 dmo mapping-create -o <org> -f definitions/order-mapping.json
sf data360 dmo relationship-create -o <org> --name Order_Header__dlm -f definitions/order-relationship.json

# Unify: identity resolution
sf data360 identity-resolution create -o <org> -f definitions/ir-ruleset.json
sf data360 identity-resolution run -o <org> --name Main

# Analyze: calculated insight
sf data360 calculated-insight create -o <org> -f definitions/lifetime-value-ci.json
sf data360 calculated-insight run -o <org> --name Lifetime_Value

# Segment: create and publish
sf data360 segment create -o <org> -f definitions/high-value-segment.json --api-version 64.0
sf data360 segment publish -o <org> --name High_Value_Customers

# Verify the full pipeline
sf data360 query sql -o <org> --sql 'SELECT COUNT(*) FROM "ssot__Individual__dlm"'
sf data360 segment list -o <org>
```

---

## Platform-Level Commands

```bash
# Data spaces
sf data360 data-space list -o <org>
sf data360 data-space get -o <org> --name default
sf data360 data-space members -o <org> --name default

# Data kits (bundles)
sf data360 data-kit status -o <org> --name Sales

# Health check
sf data360 doctor -o <org>
```

---

## API Version Guide

| Resource             | Stable Version | Notes                             |
| -------------------- | -------------- | --------------------------------- |
| Data streams         | v62.0+         | Use for stream creation           |
| DMOs, mappings       | v64.0          | mapping-list auto-defaults to v64 |
| Segments             | v64.0          | Create often fails on v66         |
| Data graphs          | v65.0+         |                                   |
| Most other endpoints | v66.0          | Plugin default                    |

Override per-command: `--api-version 64.0`

---

## Field Naming Conventions (CRITICAL)

```
Context              │ Format              │ Example
─────────────────────┼─────────────────────┼──────────────────
Salesforce Object    │ Double __c          │ Customer_ID__c
Data Lake Object     │ Single _c           │ Customer_ID_c
Data Model Object    │ Double __c on DLO   │ Customer_ID_c__c
Standard DMOs        │ ssot__ prefix       │ ssot__PartyId__c
DLO suffix           │ __dll               │ Contact_Home__dll
DMO suffix           │ __dlm               │ ssot__Individual__dlm
```

---

## Cross-Skill Integration

| Need                                 | Delegate to | Reason                                         |
| ------------------------------------ | ----------- | ---------------------------------------------- |
| Create custom objects/fields in CRM  | sf-metadata | Objects must exist before Data Cloud ingestion |
| Deploy permissions for DC Connector  | sf-deploy   | "View All Fields" permission required          |
| Load test data into CRM objects      | sf-data     | Populate source objects before stream sync     |
| Write Apex querying unified profiles | sf-apex     | SSOT query from Apex                           |
| Build Flows triggered by DC events   | sf-flow     | Platform event automation                      |
| Query CRM data directly              | sf-soql     | SOQL vs Data Cloud SQL                         |

---

## Output Format

```text
Pipeline: <recipe name or custom>
Phases completed: Connect ✓ | Prepare ✓ | Harmonize ✓ | Segment ✓ | Act ○
Commands run: <count>
Verification: <query results>
Next steps: <what remains>
```
