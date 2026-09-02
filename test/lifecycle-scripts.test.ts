/**
 * Tier 4: install lifecycle scripts — `sf plugins install <slug>#<ref>` must build.
 *
 * npm runs `prepare` for git dependencies so they can compile from source; without
 * it the `files` allowlist ships a package with no /lib and therefore no commands.
 * These assertions are declarative because the scripts are — the end-to-end check
 * is scripts/verify-install.sh, which mutates global SF CLI state and cannot be a
 * unit test.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

type PackageJson = {
  scripts: Record<string, string>;
  files: string[];
  engines: { node: string };
  oclif: { commands: string };
};

/** Node majors that must stay installable: 24 is the agent image, the rest are developer machines. */
const SUPPORTED_NODE_MAJORS = [20, 22, 24, Number(process.versions.node.split('.')[0])];

/** Runs a package.json script body the way npm does on POSIX: `sh -c`, in the given cwd. */
const runScript = (body: string, cwd: string): number =>
  spawnSync('sh', ['-c', body], { cwd, stdio: 'ignore' }).status ?? 1;

describe('install lifecycle scripts', () => {
  let pkg: PackageJson;
  let tsconfig: { compilerOptions: { outDir: string } };

  before(async () => {
    pkg = JSON.parse(await readFile(resolve(ROOT, 'package.json'), 'utf8')) as PackageJson;
    tsconfig = JSON.parse(await readFile(resolve(ROOT, 'tsconfig.json'), 'utf8')) as typeof tsconfig;
  });

  describe('prepare', () => {
    it('exists, so npm builds the package on a git install', () => {
      assert.ok(pkg.scripts.prepare, 'package.json needs a `prepare` script or git-slug installs ship no commands');
    });

    it('compiles TypeScript', () => {
      assert.match(pkg.scripts.prepare, /\btsc -p \./);
    });

    it('generates the oclif manifest', () => {
      assert.match(pkg.scripts.prepare, /\boclif manifest\b/);
    });

    it('does not delegate to `build`, whose lint step would fail a consumer install', () => {
      assert.doesNotMatch(pkg.scripts.prepare, /\b(yarn|npm run|wireit) build\b/);
    });
  });

  describe('postinstall', () => {
    it('is guarded on a git checkout', () => {
      assert.match(pkg.scripts.postinstall, /-d \.git/);
    });

    it('exits 0 in a consumer install, where .git is absent', () => {
      const dir = mkdtempSync(join(tmpdir(), 'data360-postinstall-'));
      try {
        assert.equal(runScript(pkg.scripts.postinstall, dir), 0);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    it('exits 0 in a git checkout even when husky is unavailable', () => {
      const dir = mkdtempSync(join(tmpdir(), 'data360-postinstall-'));
      try {
        mkdirSync(join(dir, '.git'));
        assert.equal(runScript(pkg.scripts.postinstall, dir), 0);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe('files', () => {
    it('ships the directory oclif.commands resolves against', () => {
      const commandsRoot = pkg.oclif.commands.replace(/^\.\//, '').split('/')[0];
      assert.ok(
        pkg.files.includes(`/${commandsRoot}`),
        `oclif.commands is ${pkg.oclif.commands} but files does not include /${commandsRoot}`
      );
    });

    it('ships the oclif manifest', () => {
      assert.ok(pkg.files.includes('/oclif.manifest.json'));
    });

    it('has prepare emit into the shipped commands directory', () => {
      const commandsRoot = pkg.oclif.commands.replace(/^\.\//, '').split('/')[0];
      assert.equal(tsconfig.compilerOptions.outDir, commandsRoot);
    });
  });

  describe('engines', () => {
    it('admits every Node major we install on', () => {
      const match = /^>=\s*(\d+)/.exec(pkg.engines.node);
      assert.ok(match, `engines.node must be an open-ended >= range, got ${pkg.engines.node}`);
      const min = Number(match[1]);
      for (const major of SUPPORTED_NODE_MAJORS) {
        assert.ok(min <= major, `engines.node ${pkg.engines.node} excludes Node ${major}`);
      }
    });

    it('sets no upper bound, so a new Node major does not block installs', () => {
      assert.doesNotMatch(pkg.engines.node, /</);
    });
  });
});
