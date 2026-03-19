---
name: sf-data360-prepare
description: >
  Data Cloud Prepare phase — data streams, DLOs, data transforms,
  Document AI, and unstructured data processing.
  TRIGGER when: user creates or manages data streams, DLOs, data
  transforms, or Document AI configurations. Also trigger for
  "create-from-object" or "data stream" mentions.
  DO NOT TRIGGER when: working with DMOs/mappings (use sf-data360-harmonize),
  connections (use sf-data360-connect), or querying (use sf-data360-retrieve).
license: MIT
metadata:
  version: '1.0.0'
  phase: 'Prepare'
---

# Data Cloud — Prepare Phase (sf-data360-prepare)

> **Always append `2>/dev/null` to `sf data360` commands** to suppress the linked ESM module warning.

Ingests data from connections into Data Lake Objects (DLOs). Handles data streams, transforms, and unstructured data processing.

## Commands (~34)

### Data Streams

```bash
sf data360 data-stream list -o <org>
sf data360 data-stream get -o <org> --name Account_Home
sf data360 data-stream create -o <org> -f stream.json
sf data360 data-stream create-from-object -o <org> --object Contact --connection SalesforceDotCom_Home
sf data360 data-stream run -o <org> --name <stream>
sf data360 data-stream delete -o <org> --name Account_Home          # also deletes DLO
sf data360 data-stream delete -o <org> --name Account_Home --keep-dlo  # keeps DLO
```

### Data Lake Objects

```bash
sf data360 dlo list -o <org>
sf data360 dlo get -o <org> --name Contact_Home__dll
sf data360 dlo create -o <org> -f dlo.json
sf data360 dlo delete -o <org> --name <dlo>
```

### Data Transforms

```bash
sf data360 transform list -o <org>
sf data360 transform get -o <org> --name MyTransform
sf data360 transform create -o <org> -f transform.json
sf data360 transform validate -o <org> --name MyTransform
sf data360 transform run -o <org> --name MyTransform
sf data360 transform history -o <org> --name MyTransform
```

### Document AI

```bash
sf data360 docai config-list -o <org>
sf data360 docai config-create -o <org> -f config.json
sf data360 docai generate-schema -o <org> --name MyDocConfig
sf data360 docai extract -o <org> -f extract-request.json
```

## Inspecting Data Streams

```bash
# List streams (does NOT include record counts)
sf data360 data-stream list -o <org>

# To get record counts, query each DLO via SQL:
sf data360 query sql -o <org> --sql 'SELECT COUNT(*) FROM "Contact_Home__dll"'
```

The `data-stream list --json` response fields per stream include: `name`, `connectorType`, `streamType`, `lastRunStatus`, `recordCount` (sometimes present), `lastRunDate`.

### Interpreting connector types in stream list

| connectorType    | streamType          | lastRunStatus | Meaning                                                          |
| ---------------- | ------------------- | ------------- | ---------------------------------------------------------------- |
| SalesforceDotCom | SFDC                | SUCCESS       | CRM connector, synced on platform schedule                       |
| External         | —                   | NONE          | BYOL (Bring Your Own Lake) / zero-copy, never accelerated/cached |
| External         | —                   | SUCCESS       | BYOL with acceleration enabled, data cached                      |
| S3 / SFTP        | CONNECTORSFRAMEWORK | SUCCESS       | File-based ingestion                                             |

---

## Key Gotchas

### Stream types

| Type                  | Use when                   | Field control                             |
| --------------------- | -------------------------- | ----------------------------------------- |
| `SFDC`                | Quick CRM object ingestion | Auto-discovers fields, limited control    |
| `CONNECTORSFRAMEWORK` | Full control needed        | Explicit field definitions, custom labels |

- **`SFDC` streams sync on platform schedule** (~10-15 min) — `data-stream run` won't work for CRM connectors
- **`CONNECTORSFRAMEWORK`** gives full control over fields, labels, and formulas
- **Redshift/Snowflake/BigQuery** streams are UI-only (API unsupported)

### DLO field naming

- CRM `Customer_ID__c` → DLO `Customer_ID_c` (single underscore, no `__c`)
- **Labels are immutable** after creation — get them right the first time
- Custom fields: `__c` suffix becomes `_c` in DLO names

### Data stream delete

- Default: also deletes the associated DLO
- Use `--keep-dlo` to preserve the DLO when re-creating a stream

## Definition File Template

```json
{
  "name": "Object_Name_Stream",
  "label": "Object Name Stream",
  "datasource": "SalesforceDotCom_Home",
  "datastreamType": "CONNECTORSFRAMEWORK",
  "connectorInfo": {
    "connectorType": "SalesforceDotCom",
    "connectorDetails": {
      "name": "SalesforceDotCom_Home",
      "sourceObject": "Custom_Object__c"
    }
  },
  "dataLakeObjectInfo": {
    "label": "Object Name",
    "name": "Object_Name__dll",
    "category": "Profile",
    "dataspaceInfo": [{ "name": "Default" }],
    "dataLakeFieldInputRepresentations": [
      { "name": "Id", "label": "Record ID", "dataType": "Text", "isPrimaryKey": true },
      { "name": "Field_Name_c", "label": "Field Label", "dataType": "Text", "isPrimaryKey": false }
    ]
  },
  "sourceFields": [
    { "name": "Id", "dataType": "Text" },
    { "name": "Field_Name__c", "dataType": "Text" }
  ],
  "mappings": [],
  "refreshConfig": {
    "isAccelerationEnabled": true,
    "refreshMode": "UPSERT",
    "frequency": { "frequencyType": "HOURLY" }
  }
}
```

**Note**: `category` is `Profile`, `Engagement`, or `Other`. Engagement streams require `eventDateTimeFieldName`.

## Previous Phase ← [sf-data360-connect](../sf-data360-connect/SKILL.md)

## Next Phase → [sf-data360-harmonize](../sf-data360-harmonize/SKILL.md)
