#!/usr/bin/env node
/**
 * Applies compat fixes into whichever node_modules tree this package landed in.
 *
 * Runs from `postinstall`, so it must never fail an install: a tree with no copy of the
 * target, an already-patched copy, or an upstream rewrite are all no-ops. `--strict`
 * turns "found a copy and could not patch it" into exit 1, for the agent image, which
 * applies this after its final `yarn install --production` (pruning re-links
 * node_modules from the cache and would revert an earlier apply).
 *
 * buffer-equal-constant-time@1.0.1 (transitive dep of jwa) reads SlowBuffer.prototype at
 * load time, and buffer.SlowBuffer is undefined on Node 26 (still a live function on Node
 * 24). Unreachable today — the only consumer, jwa@2.0.1, requires this module lazily and
 * only when crypto.timingSafeEqual is absent, i.e. on Node < 6.6 — so if an upstream
 * change breaks this and re-cutting it is costly, deleting it is defensible provided that
 * reachability still holds.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MODULE = 'buffer-equal-constant-time';
const FROM = "var SlowBuffer = require('buffer').SlowBuffer;";
const TO = [
  '// Fallback: buffer.SlowBuffer is deprecated (Node 22) and removed in a future major.',
  "var SlowBuffer = require('buffer').SlowBuffer || function (n) { return Buffer.allocUnsafeSlow(n); };",
].join('\n');
const MARKER = 'allocUnsafeSlow';

const dirs = (path) => {
  try {
    return readdirSync(path, { withFileTypes: true }).filter((e) => e.isDirectory());
  } catch {
    return [];
  }
};

/** Every copy of MODULE in a node_modules tree — npm hoists, but nests on version conflicts. */
function* copiesIn(nodeModules) {
  for (const entry of dirs(nodeModules)) {
    const path = join(nodeModules, entry.name);
    if (entry.name === MODULE) yield join(path, 'index.js');
    else if (entry.name.startsWith('@')) for (const scoped of dirs(path)) yield* copiesIn(join(path, scoped.name, 'node_modules'));
    else if (entry.name !== '.bin') yield* copiesIn(join(path, 'node_modules'));
  }
}

/** The dev checkout has one tree at the package root; an installed plugin sits inside the consumer's. */
function* trees() {
  for (let dir = PKG_ROOT, prev = null; dir !== prev; prev = dir, dir = dirname(dir)) {
    yield join(dir, 'node_modules');
  }
}

const seen = new Set();
let patched = 0;
let failed = 0;

for (const tree of trees()) {
  for (const file of copiesIn(tree)) {
    if (seen.has(file)) continue;
    seen.add(file);
    let source;
    try {
      source = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    if (source.includes(MARKER)) continue;
    if (!source.includes(FROM)) {
      failed += 1;
      console.error(`apply-node-compat-patches: ${file} does not match the expected source, skipping`);
      continue;
    }
    try {
      writeFileSync(file, source.replace(FROM, TO));
      patched += 1;
    } catch (error) {
      failed += 1;
      console.error(`apply-node-compat-patches: could not write ${file}: ${error.message}`);
    }
  }
}

console.log(`apply-node-compat-patches: ${MODULE} — ${patched} patched, ${seen.size - patched - failed} already current, ${failed} skipped`);
if (process.argv.includes('--strict') && failed > 0) process.exit(1);
