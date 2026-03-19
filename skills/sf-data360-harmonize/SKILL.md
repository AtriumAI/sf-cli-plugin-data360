---
name: sf-data360-harmonize
description: >
  Data Cloud Harmonize & Unify phase — DMOs, field mappings, relationships,
  identity resolution, data graphs, and unified profiles.
  TRIGGER when: user creates or manages DMOs, field mappings, relationships,
  identity resolution rulesets, data graphs, or unified profiles. Also
  trigger for "map-to-canonical", "relationship", "identity resolution",
  or "unified profile" mentions.
  DO NOT TRIGGER when: creating data streams (use sf-data360-prepare),
  managing segments (use sf-data360-segment), or querying
  (use sf-data360-retrieve).
license: MIT
metadata:
  version: '1.0.0'
  phase: 'Harmonize & Unify'
---

# Data Cloud — Harmonize & Unify Phase (sf-data360-harmonize)

> **Always append `2>/dev/null` to `sf data360` commands** to suppress the linked ESM module warning.

Maps ingested data to canonical Data Model Objects, creates relationships between them, resolves identities across sources, and builds data graphs for holistic views.

## Commands (~35)

### Data Model Objects

```bash
sf data360 dmo list --all -o <org>                    # all DMOs (uses pagination)
sf data360 dmo get -o <org> --name ssot__Individual__dlm
sf data360 dmo create -o <org> -f dmo.json
sf data360 dmo create-from-dlo -o <org> --dlo Contact_Home__dll
sf data360 dmo delete -o <org> --name <dmo>
```

### Field Mappings

```bash
sf data360 dmo mapping-list -o <org> --source Contact_Home__dll --target ssot__Individual__dlm
sf data360 dmo mapping-create -o <org> -f mapping.json
sf data360 dmo map-to-canonical -o <org> --dlo Contact_Home__dll --dmo ssot__Individual__dlm --dry-run
sf data360 dmo map-to-canonical -o <org> --dlo Contact_Home__dll --dmo ssot__Individual__dlm
sf data360 dmo mapping-delete -o <org> --name <mapping>
```

### Relationships

```bash
sf data360 dmo relationship-list -o <org> --name <sourceDMO>
sf data360 dmo relationship-create -o <org> --name <sourceDMO> -f relationship.json
sf data360 dmo relationship-delete -o <org> --name <relationship>
```

### Identity Resolution

```bash
sf data360 identity-resolution list -o <org>
sf data360 identity-resolution create -o <org> -f ir-ruleset.json
sf data360 identity-resolution run -o <org> --name Main      # auto-resolves name → ID
sf data360 identity-resolution get -o <org> --name <ir>
sf data360 identity-resolution delete -o <org> --name <ir>
```

### Data Graphs

```bash
sf data360 data-graph get -o <org> --name MyGraph
sf data360 data-graph create -o <org> -f data-graph.json
sf data360 data-graph refresh -o <org> --name MyGraph
sf data360 data-graph delete -o <org> --name MyGraph
```

### Unified Profiles

```bash
sf data360 profile query -o <org> --name <profile-id>
sf data360 profile metadata -o <org>
```

### Universal ID

```bash
sf data360 universal-id lookup -o <org> --name <id>
```

## Key Gotchas

### Inspecting DMO schema

To describe a DMO's fields, use `query describe` (fastest) or `dmo get --json`:

```bash
# Quick column list
sf data360 query describe -o <org> --table ssot__Individual__dlm

# Full detail (JSON) — fields are at result.data.fields[]
sf data360 dmo get -o <org> --name ssot__Individual__dlm --json
# Each field has: name, label, type, creationType, isDistinct, usageTag
# NOTE: field key is "name" (NOT "apiName")
```

There is NO `dmo describe` command — use `query describe` or `dmo get`.

### DMO field naming

```
DLO field: Customer_ID_c     (single _c)
DMO field: Customer_ID_c__c  (double __c appended)
Standard:  ssot__PartyId__c  (ssot__ prefix)
```

### Mapping patterns

- `map-to-canonical --dry-run` previews auto-matching before creating
- One DLO field can map to multiple DMO fields: `--map "Id__c=ssot__PartyId__c,Id__c=ssot__Id__c"`
- `mapping-list` uses API v64.0 (auto-defaulted) — v66 returns errors

### Relationship template

```json
{
  "relationships": [
    {
      "sourceObjectName": "Order_Header__dlm",
      "targetObjectName": "ssot__Individual__dlm",
      "cardinality": "ManyToOne",
      "sourceFieldName": "Customer_ID_c__c",
      "targetFieldName": "ssot__PartyId__c",
      "relationshipOwner": "DataCloud"
    }
  ]
}
```

- Cardinality is from **source** perspective: `ManyToOne` = many orders per individual
- Field is `relationshipOwner` (singular, not `owner` or `relationshipsOwner`)
- Use `sourceObjectName`/`targetObjectName` (not `sourceEntity`)

### Identity Resolution

- `rulesetId` is **permanent** — can't reuse after deletion
- **Unified DMO naming**: `Unifiedssot{Object}{RulesetIdCapitalized}__dlm` (e.g., `UnifiedssotIndividualMain__dlm`). There is no generic `UnifiedssotIndividual__dlm` — each ruleset creates its own.
- **To find unified profile counts**, use `identity-resolution list` (shows `totalUnifiedProfiles` directly) — faster than querying the unified DMO
- To find the unified DMO name: `dmo list --all -o <org> | grep -i unified` (must use `--all` since unified DMOs are often past position 50 in the catalog)
- Match methods (lowercase): `fuzzy`, `exact`, `exactnormalized`
- `sourcesequence` rule type is lowercase on create

### Data Graph

- Every node must have `type`: `derived` (root), `bridge` (link), `standard`, `custom`, `calculated`
- CI fields need `ciFieldType: "MEASURE"` or `"DIMENSION"`
- **All Key Qualifier and FK fields must be explicitly included** (UI auto-selects, API doesn't)
- Engagement DMOs require recency criteria (both `DAY` and `RECORD` limits)
- Without proper `type`, create succeeds but build **silently fails**

## Previous Phase ← [sf-data360-prepare](../sf-data360-prepare/SKILL.md)

## Next Phase → [sf-data360-segment](../sf-data360-segment/SKILL.md)
