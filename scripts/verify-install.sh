#!/usr/bin/env bash
# Verifies `sf plugins install <slug>#<ref>` yields a working sf data360.
set -euo pipefail

cd "$(dirname "$0")/.."

# pacote resolves a committish against `git ls-remote`, where HEAD is the remote
# symbolic ref — so default to the local commit, and require that it is pushed.
REF="${1:-$(git rev-parse HEAD)}"
SLUG="AtriumAI/sf-cli-plugin-data360"

git branch -r --contains "$REF" 2>/dev/null | grep -q . || {
  echo "verify-install: ${REF} is not on any remote branch — push it first" >&2
  exit 1
}

# Install into a throwaway oclif data dir: a global install would clobber the
# developer's `sf plugins link .`, which the workshop scripts depend on.
SF_DATA_DIR="$(mktemp -d)"
export SF_DATA_DIR
trap 'rm -rf "$SF_DATA_DIR"' EXIT

# The fork is unsigned, so `plugins install` prompts for trust; answer it so this
# runs without a TTY. pipefail still surfaces a failed install.
printf 'y\n' | sf plugins install "${SLUG}#${REF}"

# A plugin that installed but did not build reports no commands.
help="$(sf data360 --help 2>&1)"
count=$(grep -cE '^[[:space:]]{2,}[a-z]' <<<"$help" || true)
[ "$count" -gt 0 ] || { echo "verify-install: no data360 help entries found" >&2; exit 1; }

# Spot-check a read-only command resolves (no org call).
sf data360 dmo list --help >/dev/null
echo "verify-install: ok (${count} help entries)"
