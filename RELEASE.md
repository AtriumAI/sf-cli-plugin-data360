# Release Process

## Version Strategy

Both repos use the same version tag to stay in sync:

- **Plugin:** `github.com/gthoppae/sf-cli-plugin-data360`
- **Skills:** `github.com/gthoppae/sf-data360-skills`

| Bump            | When                                          | Example       |
| --------------- | --------------------------------------------- | ------------- |
| `patch` (0.0.x) | Bug fix, man page update, skill prompt tuning | 0.0.5 → 0.0.6 |
| `minor` (0.x.0) | New commands, new concept pages, new skills   | 0.0.6 → 0.1.0 |
| `major` (x.0.0) | Breaking changes, stable release              | 0.1.0 → 1.0.0 |

## Release Steps

### 1. Plugin-only change (bug fix, new command, man page)

```bash
cd ~/src/tries/sf-cli-plugins/plugin-data360-essentials

# Make changes, run tests
npx mocha 'test/**/*.test.ts' --timeout 120000

# If commands added/removed/changed:
node --loader ts-node/esm scripts/generate-manifest.mjs

# Bump version (choose: patch | minor | major)
npm version patch -m "chore: bump to %s"

# Push
git push origin main --tags

# Sync skills tag
cd ~/src/tries/sf-cli-plugins/sf-data360-skills
VERSION=$(cd ~/src/tries/sf-cli-plugins/plugin-data360-essentials && node -p "require('./package.json').version")
git tag -a "v${VERSION}" -m "v${VERSION} — sync with plugin"
git push origin main --tags
```

### 2. Skills-only change (prompt tuning, gotcha update)

```bash
cd ~/src/tries/sf-cli-plugins/sf-data360-skills

# Make changes, commit
git add -A && git commit -m "fix: description"

# Sync tag with current plugin version
VERSION=$(cd ~/src/tries/sf-cli-plugins/plugin-data360-essentials && node -p "require('./package.json').version")
git tag -a "v${VERSION}" -m "v${VERSION} — skill update" --force
git push origin main --tags --force
```

### 3. Both change together

```bash
# Plugin first (source of truth)
cd ~/src/tries/sf-cli-plugins/plugin-data360-essentials
npx mocha 'test/**/*.test.ts' --timeout 120000
npm version patch -m "chore: bump to %s"
git push origin main --tags

# Skills second
cd ~/src/tries/sf-cli-plugins/sf-data360-skills
git add -A && git commit -m "fix: description"
VERSION=$(cd ~/src/tries/sf-cli-plugins/plugin-data360-essentials && node -p "require('./package.json').version")
git tag -a "v${VERSION}" -m "v${VERSION} — sync with plugin"
git push origin main --tags
```

## Pre-Release Checklist

- [ ] Tests pass: `npx mocha 'test/**/*.test.ts' --timeout 120000`
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Manifest regenerated (if commands changed): `node --loader ts-node/esm scripts/generate-manifest.mjs`
- [ ] Man pages updated (if commands changed)
- [ ] STATUS.md updated (if testing coverage changed)
- [ ] Both repos tagged with same version

## Updating install.sh for Users

After a release, users update by re-running install.sh or:

```bash
cd ~/sf-data360/sf-cli-plugin-data360 && git pull && yarn install && npx tsc
cd ~/sf-data360/sf-data360-skills && git pull
```

Skills symlinks auto-update (they point to the repo directory).
