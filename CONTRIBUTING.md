# Contributing

> This is an unofficial, internal project. Contributions are welcome from invited collaborators.

## Ways to Contribute

### 1. Test commands on your org

The fastest way to help — see [STATUS.md](STATUS.md#help-wanted--testing-on-your-org) for the list of commands that need live testing. Even a "it worked" confirmation is valuable.

### 2. Report bugs

Open an issue with:

- Command you ran (full command with flags)
- Error message or unexpected output
- Org type (sandbox, DE, production)
- API version (check with `sf data360 man <topic> <command>`)

### 3. Fix bugs

1. Clone the repo and set up: see [INSTALL.md](INSTALL.md)
2. Create a branch: `git checkout -b fix/description`
3. Make your change
4. Run tests: `npx mocha 'test/**/*.test.ts' --timeout 120000`
5. If you added/removed/changed a command, regenerate the manifest:
   ```bash
   node --loader ts-node/esm scripts/generate-manifest.mjs
   ```
6. Commit (conventional commits enforced):
   ```bash
   git commit -m "fix: description of what was fixed"
   ```
7. Push and open a PR

### 4. Add new commands

1. Add the command file in `src/commands/data360/<topic>/<command>.ts`
2. Add a man page in `messages/man/<topic>/<command>.md`
3. Regenerate the manifest
4. Run tests — smoke and inventory tests will catch metadata issues
5. If the command has custom logic, add a test in `test/commands/handtuned/`

## Code Standards

- TypeScript strict mode
- ESLint + Prettier enforced via pre-commit hooks
- Conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`)
- All commands must have: `summary`, `examples`, `enableJsonFlag`, `target-org` flag

## Testing

See [TESTING.md](TESTING.md) for the full testing methodology. Key commands:

```bash
# Must pass before PR
npx mocha 'test/**/*.test.ts' --timeout 120000

# Quick check during development
npx tsc --noEmit
```

## Questions

Open an issue or reach out to the repo owner.
