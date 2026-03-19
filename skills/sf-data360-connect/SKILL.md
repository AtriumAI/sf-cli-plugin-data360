---
name: sf-data360-connect
description: >
  Data Cloud Connect phase — connections, connectors, and connector services.
  TRIGGER when: user manages Data Cloud connections, lists connectors,
  tests connections, browses connection objects/databases/fields, or
  sets up new data source connections.
  DO NOT TRIGGER when: creating data streams (use sf-data360-prepare),
  working with DMOs (use sf-data360-harmonize), or querying data
  (use sf-data360-retrieve).
license: MIT
metadata:
  version: '1.0.0'
  phase: 'Connect'
---

# Data Cloud — Connect Phase (sf-data360-connect)

> **Always append `2>/dev/null` to `sf data360` commands** to suppress the linked ESM module warning.

Manages connections to external data sources. This is the first phase of any Data Cloud pipeline — you must have a working connection before creating data streams.

## Commands (~23)

```bash
# Connectors (available types)
sf data360 connection connector-list -o <org>
sf data360 connection connector-get -o <org> --name SalesforceCRM

# Connections (configured instances) — REQUIRES --connector-type
sf data360 connection list -o <org> --connector-type SalesforceDotCom
sf data360 connection list -o <org> --connector-type REDSHIFT

# To see ALL connections across types, query each known type:
for ct in SalesforceDotCom REDSHIFT S3 SFTP; do
  echo "=== $ct ===" && sf data360 connection list -o <org> --connector-type $ct 2>/dev/null
done

# Get a specific connection (auto-resolves name to ID)
sf data360 connection get -o <org> --name SalesforceDotCom_Home
sf data360 connection create -o <org> -f connection.json
sf data360 connection test -o <org> --name <connection>
sf data360 connection delete -o <org> --name <connection>

# Browse connection metadata
sf data360 connection objects -o <org> --name SalesforceDotCom_Home
sf data360 connection databases -o <org> --name <connection> --connector-type REDSHIFT
sf data360 connection fields -o <org> --name <connection>
```

## Key Gotchas

- **`connection list` REQUIRES `--connector-type`** — the API mandates this. There is no "list all connections" command. Query each type separately.
- **Connector type for list/get**: use `SalesforceDotCom` (the connection connector type), NOT `SalesforceCRM` (that's the connector catalog name)
- **Common connector types**: `SalesforceDotCom`, `REDSHIFT`, `S3`, `SFTP`, `Snowflake`, `BigQuery`
- **To discover what's on an org**: check `data-stream list` first — it shows connector types per stream, then query those types
- **`connection get/objects/databases` auto-resolve name → ID** via the list endpoint
- **External connectors** (Redshift, Snowflake, BigQuery) require UI-based credential setup — the API doesn't support credential fields
- **`connection objects/databases`** use POST (not GET) — handled internally

## Prerequisites

Before connecting external sources, ensure:

1. The connector type is available: `connection connector-list`
2. Required permissions are set on the Data Cloud Salesforce Connector permission set
3. **"View All Fields"** permission on custom objects (commonly missed!)

## Next Phase → [sf-data360-prepare](../sf-data360-prepare/SKILL.md)

Once connections are established, create data streams to ingest data.
