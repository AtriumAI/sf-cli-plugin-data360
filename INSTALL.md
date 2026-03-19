# Installation & Setup Guide

> **DISCLAIMER**: This is NOT an official Salesforce product. No support, warranty, or maintenance is provided. Use at your own risk.

## Prerequisites

| Requirement    | Version                   | Check              |
| -------------- | ------------------------- | ------------------ |
| Node.js        | >= 18                     | `node --version`   |
| Salesforce CLI | Latest                    | `sf --version`     |
| yarn           | v1.x                      | `yarn --version`   |
| Data Cloud     | Provisioned on target org | Setup → Data Cloud |
| Git            | Any                       | `git --version`    |

## Step 1: Clone the Plugin

```bash
git clone git@github.com:gthoppae/sf-cli-plugin-data360.git
cd sf-cli-plugin-data360
```

## Step 2: Install Dependencies

```bash
yarn install
```

## Step 3: Compile

```bash
yarn compile
# or: npx tsc
```

## Step 4: Link to Salesforce CLI

```bash
sf plugins link .
```

Verify the plugin is installed:

```bash
sf plugins | grep data360
# Should show: @gthoppae/sf-cli-plugin-data360 1.0.0 (link)
```

## Step 5: Authenticate to a Data Cloud Org

```bash
# Web-based login (opens browser)
sf org login web -a myorg

# Verify
sf org display -o myorg
```

Your org must have Data Cloud provisioned. Check: Setup → Data Cloud.

## Step 6: Verify the Plugin Works

```bash
# List available topics
sf data360 man

# Test a read-only command
sf data360 dmo list -o myorg

# Run a simple query
sf data360 query sql -o myorg --sql 'SELECT COUNT(*) FROM "ssot__Individual__dlm"'
```

## Installing Claude Code / Cursor Skills (Optional)

If you use Claude Code or Cursor Agent, install the 7 Data Cloud skills:

```bash
git clone git@github.com:gthoppae/sf-data360-skills.git
cd sf-data360-skills
for skill in sf-data360 sf-data360-connect sf-data360-prepare sf-data360-harmonize sf-data360-segment sf-data360-act sf-data360-retrieve; do
  ln -sf "$(pwd)/$skill" ~/.claude/skills/$skill
done
```

Restart your Claude Code / Cursor session for skills to take effect.

### Using Skills

```bash
# In Claude Code or Cursor, invoke with slash command:
/sf-data360 give me a full inventory of data cloud on myorg

# Or use phase-specific skills:
/sf-data360-retrieve find all individuals named Chris on myorg
/sf-data360-harmonize show me field mappings for Contact on myorg
```

## Updating the Plugin

```bash
cd sf-cli-plugin-data360
git pull
yarn install
yarn compile
```

No need to re-link — `sf plugins link` persists across updates.

## Uninstalling

```bash
# Remove the plugin link
sf plugins uninstall @gthoppae/sf-cli-plugin-data360

# Remove skills (optional)
for skill in sf-data360 sf-data360-connect sf-data360-prepare sf-data360-harmonize sf-data360-segment sf-data360-act sf-data360-retrieve; do
  rm -f ~/.claude/skills/$skill
done
```

## Troubleshooting

### "Warning: linked ESM module" message

This is normal for linked plugins. Commands work correctly — the warning is cosmetic. Add `2>/dev/null` to suppress:

```bash
sf data360 dmo list -o myorg 2>/dev/null
```

### "No default environment found"

You forgot `-o <org>`. All commands require a target org:

```bash
sf data360 dmo list -o myorg    # correct
sf data360 dmo list              # error
```

### "ConnectorType must be provided"

The `connection list` command requires `--connector-type`:

```bash
sf data360 connection list -o myorg --connector-type SalesforceDotCom
```

### "DMO or Source Object developer Name is missing"

The `dmo mapping-list` command requires both `--source` and `--target`:

```bash
sf data360 dmo mapping-list -o myorg --source Contact_Home__dll --target ssot__Individual__dlm
```

### Commands return only 50 results

Use `--all` for full results (especially `dmo list`):

```bash
sf data360 dmo list --all -o myorg
```

### Plugin not found after linking

Recompile first, then re-link:

```bash
npx tsc
sf plugins link .
```

## Running Tests

```bash
# All tests (86 tests, ~1 min)
npx mocha 'test/**/*.test.ts' --timeout 120000

# Fast tests only (~1 sec)
npx mocha 'test/lib/**/*.test.ts' 'test/commands/crud/*.test.ts' 'test/commands/handtuned/*.test.ts'

# Verify command inventory
npx mocha 'test/commands/inventory.test.ts' --timeout 120000
```

## Man Pages

Every command has a detailed man page:

```bash
sf data360 man                        # list all topics
sf data360 man dmo list               # command reference
sf data360 man segment publish        # with gotchas and testing status
sf data360 man concepts dmo           # learn what a DMO is
```
