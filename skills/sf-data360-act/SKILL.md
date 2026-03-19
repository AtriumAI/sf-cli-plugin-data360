---
name: sf-data360-act
description: >
  Data Cloud Act phase — activations, activation targets, data actions,
  and data action targets for pushing data to downstream systems.
  TRIGGER when: user manages activations, activation targets, data actions,
  or data shares. Also trigger for "activate segment", "push to marketing
  cloud", or "ad audience" mentions.
  DO NOT TRIGGER when: creating segments (use sf-data360-segment),
  working with DMOs (use sf-data360-harmonize), or querying
  (use sf-data360-retrieve).
license: MIT
metadata:
  version: '1.0.0'
  phase: 'Act'
---

# Data Cloud — Act Phase (sf-data360-act)

> **Always append `2>/dev/null` to `sf data360` commands** to suppress the linked ESM module warning.

Pushes segments and data to downstream systems — Salesforce apps, marketing platforms, ad networks, and external systems via activations and data actions.

## Commands (~18)

### Activations

```bash
sf data360 activation list -o <org>
sf data360 activation get -o <org> --name <activation>
sf data360 activation create -o <org> -f activation.json
sf data360 activation update -o <org> --name <activation> -f update.json
sf data360 activation delete -o <org> --name <activation>
sf data360 activation platforms -o <org>
sf data360 activation data -o <org> --name <activation>
```

### Activation Targets

```bash
sf data360 activation-target list -o <org>
sf data360 activation-target get -o <org> --name <target>
sf data360 activation-target create -o <org> -f target.json
sf data360 activation-target update -o <org> --name <target> -f update.json
```

### Data Actions

```bash
sf data360 data-action list -o <org>
sf data360 data-action create -o <org> -f action.json
```

### Data Action Targets

```bash
sf data360 data-action-target list -o <org>
sf data360 data-action-target get -o <org> --name <target>
sf data360 data-action-target create -o <org> -f target.json
sf data360 data-action-target delete -o <org> --name <target>
sf data360 data-action-target generate-key -o <org> --name <target>
```

## Activation Workflow

```bash
# 1. List available platforms
sf data360 activation platforms -o <org>

# 2. Create activation target (destination)
sf data360 activation-target create -o <org> -f target.json

# 3. Create activation (links segment to target)
sf data360 activation create -o <org> -f activation.json

# 4. Verify
sf data360 activation list -o <org>
sf data360 activation data -o <org> --name <activation>
```

## Activation Destinations

| Destination       | Type               | Notes                      |
| ----------------- | ------------------ | -------------------------- |
| Salesforce CRM    | Standard Connector | Copy fields, related lists |
| Marketing Cloud   | Standard Connector | Journey Builder, audiences |
| Google Ads / Meta | Ad Audiences       | AdTech ecosystem           |
| Mulesoft          | Data Actions       | Any system integration     |
| External Systems  | Data Shares / BYOL | JDBC, Power BI, etc.       |

## Previous Phase ← [sf-data360-segment](../sf-data360-segment/SKILL.md)
