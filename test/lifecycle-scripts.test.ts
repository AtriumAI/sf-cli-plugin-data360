/**
 * Tier 4: install lifecycle scripts — `sf plugins install <slug>#<ref>` must build.
 *
 * npm runs `prepare` for git dependencies so they can compile from source; without
 * it the `files` allowlist ships a package with no /lib and therefore no commands.
 * The `postinstall` cases execute the real script body against a recording `husky`
 * stub, so they prove the guard rather than the trailing error swallow. The
 * end-to-end check is scripts/verify-install.sh, which needs a network install.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync, readFileSync, copyFileSync } from 'node:fs';
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
  wireit: { compile: { command: string; output: string[] } };
};

/** Node majors that must stay installable: 24 is the agent image, the rest are developer machines. */
const SUPPORTED_NODE_MAJORS = [20, 22, 24, Number(process.versions.node.split('.')[0])];

/** The script bodies run through `cmd.exe` on Windows, where `sh` and the stub shebang do not exist. */
const itPosix = process.platform === 'win32' ? it.skip : it;

const APPLIER = 'scripts/apply-node-compat-patches.mjs';
const COMPAT_TARGET = 'node_modules/buffer-equal-constant-time/index.js';

/** buffer-equal-constant-time@1.0.1 as published — the applier rewrites line 4. */
const UPSTREAM_COMPAT_SOURCE = [
  '/*jshint node:true */',
  "'use strict';",
  "var Buffer = require('buffer').Buffer; // browserify",
  "var SlowBuffer = require('buffer').SlowBuffer;",
  '',
  'module.exports = bufferEq;',
].join('\n');

type PostinstallRun = { status: number; huskyArgv: string | null; compatPatched: boolean };

/**
 * Runs the `postinstall` body the way npm does on POSIX — `sh -c`, in a throwaway cwd laid out
 * like an installed package — with a `husky` stub first on PATH that records its argv and exits
 * non-zero. Asserting on the recorded argv and the rewritten module proves each half of the body
 * actually ran, which the trailing `|| exit 0` would otherwise hide.
 */
const runPostinstall = (body: string, opts: { git: boolean; shipApplier?: boolean }): PostinstallRun => {
  const dir = mkdtempSync(join(tmpdir(), 'data360-postinstall-'));
  try {
    if (opts.git) mkdirSync(join(dir, '.git'));
    if (opts.shipApplier ?? true) {
      mkdirSync(join(dir, 'scripts'));
      copyFileSync(resolve(ROOT, APPLIER), join(dir, APPLIER));
    }
    mkdirSync(join(dir, dirname(COMPAT_TARGET)), { recursive: true });
    writeFileSync(join(dir, COMPAT_TARGET), UPSTREAM_COMPAT_SOURCE);

    const binDir = join(dir, 'bin');
    mkdirSync(binDir);
    const log = join(dir, 'husky-argv.log');
    writeFileSync(join(binDir, 'husky'), `#!/bin/sh\necho "$@" > '${log}'\nexit 3\n`, { mode: 0o755 });
    const result = spawnSync('sh', ['-c', body], {
      cwd: dir,
      stdio: 'pipe',
      encoding: 'utf8',
      // node itself must stay reachable; everything else is pinned so the host yarn/husky cannot leak in.
      env: { ...process.env, PATH: [binDir, dirname(process.execPath), '/usr/bin', '/bin'].join(':') },
    });
    return {
      status: result.status ?? 1,
      huskyArgv: existsSync(log) ? readFileSync(log, 'utf8').trim() : null,
      compatPatched: readFileSync(join(dir, COMPAT_TARGET), 'utf8').includes('allocUnsafeSlow'),
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

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

  describe('compile', () => {
    it('regenerates the manifest, which the oclif loader prefers over the files on disk', () => {
      assert.match(pkg.wireit.compile.command, /\boclif manifest\b/);
    });

    it('declares the manifest as build output, so `yarn clean` owns it', () => {
      assert.ok(pkg.wireit.compile.output.includes('oclif.manifest.json'));
    });
  });

  describe('postinstall', () => {
    it('does not shell out to yarn, which a consumer machine need not have', () => {
      assert.doesNotMatch(pkg.scripts.postinstall, /\byarn\b/);
    });

    it('gates on a git checkout without a POSIX test builtin, so Windows takes the same branch', () => {
      assert.match(pkg.scripts.postinstall, /existsSync\(['"]\.git['"]\)/);
    });

    itPosix('installs the hooks in a git checkout, and survives husky failing', () => {
      const { status, huskyArgv } = runPostinstall(pkg.scripts.postinstall, { git: true });
      assert.equal(huskyArgv, 'install');
      assert.equal(status, 0);
    });

    itPosix('never invokes husky in a consumer install, where .git is absent', () => {
      const { status, huskyArgv } = runPostinstall(pkg.scripts.postinstall, { git: false });
      assert.equal(huskyArgv, null);
      assert.equal(status, 0);
    });

    itPosix('applies the node compat patch to the tree it landed in, git checkout or not', () => {
      assert.equal(runPostinstall(pkg.scripts.postinstall, { git: false }).compatPatched, true);
      assert.equal(runPostinstall(pkg.scripts.postinstall, { git: true }).compatPatched, true);
    });

    itPosix('still exits 0 when the applier was left out of the published files', () => {
      const { status, compatPatched } = runPostinstall(pkg.scripts.postinstall, { git: false, shipApplier: false });
      assert.equal(compatPatched, false);
      assert.equal(status, 0);
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

    it('ships the node compat applier, which postinstall runs from the installed package dir', () => {
      assert.ok(pkg.files.includes(`/${APPLIER}`), `files must include /${APPLIER} or postinstall patches nothing`);
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
