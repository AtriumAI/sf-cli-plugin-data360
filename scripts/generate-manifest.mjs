#!/usr/bin/env node --loader ts-node/esm --no-warnings=ExperimentalWarning
/**
 * Generate the command manifest snapshot.
 * Usage: node --loader ts-node/esm scripts/generate-manifest.mjs
 */
import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateManifest } from '../test/helpers/commandDiscovery.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '../test/fixtures/command-manifest.json');

const manifest = await generateManifest();
await writeFile(OUTPUT, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote ${manifest.commandCount} commands to ${OUTPUT}`);
