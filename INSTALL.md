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

This also compiles: the `prepare` script runs `tsc -p . && oclif manifest`, so a fresh clone is ready to
link. The flip side is that a TypeScript error now fails `yarn install` itself — use
`yarn install --ignore-scripts` to get dependencies down past a broken tree.

## Step 3: Recompile After Changes

```bash
yarn compile
```

`yarn compile` regenerates `oclif.manifest.json` alongside `lib/`. Prefer it over a bare `npx tsc`: the
oclif loader reads the manifest in preference to the files on disk, so a stale one hides a newly added
command from `sf plugins link .` and `bin/dev.js`. `yarn clean` removes both.

### Alternative: Install Without a Clone

To consume the plugin rather than develop it, install straight from the git slug — npm runs `prepare`, so
the install builds from source:

```bash
sf plugins install AtriumAI/sf-cli-plugin-data360#<ref>
```

The fork is unsigned, so the CLI prompts to confirm the install. Steps 3 and 4 do not apply.

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
/sf-data360 query all segments and their member counts on myorg
/sf-data360 how many unified profiles do I have on myorg

# Or use phase-specific skills:
/sf-data360-retrieve find all individuals named Chris on myorg
/sf-data360-harmonize show me field mappings between Contact_Home__dll and ssot__Individual__dlm on myorg
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

Recompile first, then re-link. Use `yarn compile`, not a bare `npx tsc` — a command added since the last
manifest write stays invisible until the manifest is regenerated:

```bash
yarn compile
sf plugins link .
```

## Running Tests

```bash
# All tests (109 tests, ~10 sec)
npx mocha 'test/**/*.test.ts' --timeout 120000

# Fast tests only (~1 sec)
npx mocha 'test/lib/**/*.test.ts' 'test/commands/crud/*.test.ts' 'test/commands/handtuned/*.test.ts'

# Verify command inventory
npx mocha 'test/commands/inventory.test.ts' --timeout 120000
```
