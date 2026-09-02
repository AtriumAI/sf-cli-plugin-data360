#!/usr/bin/env bash
# Verifies `sf plugins install <slug>#<ref>` yields a working sf data360.
set -euo pipefail

REF="${1:-HEAD}"
SLUG="AtriumAI/sf-cli-plugin-data360"

cleanup() { sf plugins uninstall "@gthoppae/sf-cli-plugin-data360" >/dev/null 2>&1 || true; }
trap cleanup EXIT

cleanup
# The fork is unsigned, so `plugins install` prompts for trust; answer it so this
# runs without a TTY. pipefail still surfaces a failed install.
printf 'y\n' | sf plugins install "${SLUG}#${REF}"

# A plugin that installed but did not build reports no commands.
sf data360 --help >/dev/null
count=$(sf data360 --help 2>&1 | grep -cE '^\s{2,}[a-z]')
[ "$count" -gt 0 ] || { echo "verify-install: no data360 topics found" >&2; exit 1; }

# Spot-check a read-only command resolves (no org call).
sf data360 dmo list --help >/dev/null
echo "verify-install: ok (${count} topics)"
