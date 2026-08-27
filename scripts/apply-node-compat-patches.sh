#!/usr/bin/env bash
# Applies the patches/ compat fixes into an installed node_modules tree.
#
# Must run AFTER the final `yarn install` (including `--production`): pruning
# re-links node_modules from the cache and would revert an earlier apply.
set -euo pipefail

cd "$(dirname "$0")/.."

patch_file="$PWD/patches/buffer-equal-constant-time-node22.patch"
target='*/buffer-equal-constant-time/index.js'

# -execdir runs git apply inside each copy's dir, so -p3 strips
# a/node_modules/buffer-equal-constant-time/ down to index.js.
find node_modules -path "$target" -execdir git apply -p3 "$patch_file" ';'

# find -execdir swallows git apply's exit status, so assert every copy got patched.
total=$(find node_modules -path "$target" | wc -l | tr -d "[:space:]")
patched=$(find node_modules -path "$target" -exec grep -l allocUnsafeSlow {} + | wc -l | tr -d "[:space:]")
if [ "$total" != "$patched" ]; then
  echo "apply-node-compat-patches: patched $patched of $total buffer-equal-constant-time copies" >&2
  exit 1
fi
echo "apply-node-compat-patches: buffer-equal-constant-time patched ($patched copies)"
