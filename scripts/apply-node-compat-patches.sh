#!/usr/bin/env bash
# Strict wrapper around the patch applier, kept for callers that invoke it by name
# (the agent image runs it after its final `yarn install --production`).
set -euo pipefail
exec node "$(dirname "$0")/apply-node-compat-patches.mjs" --strict "$@"
