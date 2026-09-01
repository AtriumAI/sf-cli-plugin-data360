/**
 * Tier 3: the four agent-reachable commands whose endpoint carries two :params.
 *
 * Each must resolve BOTH params, and must declare a flag for the second one —
 * an undeclared flag is an oclif parse failure before any HTTP request.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import { Data360Command } from '../../../src/shared/data360/Data360Command.js';
import ConnectionFields from '../../../src/commands/data360/connection/fields.js';
import ConnectionRunExisting from '../../../src/commands/data360/connection/run-existing.js';
import DataKitDependencies from '../../../src/commands/data360/data-kit/dependencies.js';
import DataKitStatus from '../../../src/commands/data360/data-kit/status.js';
import UniversalIdLookup from '../../../src/commands/data360/universal-id/lookup.js';

// The cases span List/Get/Action bases, whose result types differ.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData360Command = (new (...args: any[]) => Data360Command<any>) & { flags: Record<string, unknown> };

const baseFlags = { 'target-org': {}, 'api-version': '66.0', timing: false };

const isUnresolvedParamError = (err: Error): boolean => {
  assert.equal(err.name, 'DATA360_UNRESOLVED_PATH_PARAM');
  return true;
};

const cases: Array<{
  label: string;
  Command: AnyData360Command;
  secondFlag: string;
  flags: Record<string, unknown>;
  expectedPath: string;
  defaultResponse: unknown;
}> = [
  {
    label: 'connection fields',
    Command: ConnectionFields as AnyData360Command,
    secondFlag: 'object',
    flags: { ...baseFlags, all: false, name: '0hMdL000001lCRlUAM', object: 'Account' },
    expectedPath: '/services/data/v66.0/ssot/connections/0hMdL000001lCRlUAM/objects/Account/fields',
    defaultResponse: { data: [] },
  },
  {
    label: 'connection run-existing',
    Command: ConnectionRunExisting as AnyData360Command,
    secondFlag: 'command',
    flags: { ...baseFlags, name: '0hMdL000001lCRlUAM', command: 'run' },
    expectedPath: '/services/data/v66.0/ssot/connections/0hMdL000001lCRlUAM/actions/run',
    defaultResponse: {},
  },
  {
    label: 'data-kit dependencies',
    Command: DataKitDependencies as AnyData360Command,
    secondFlag: 'component',
    flags: { ...baseFlags, name: 'Sales', component: 'Account' },
    expectedPath: '/services/data/v66.0/ssot/data-kits/Sales/components/Account/dependencies',
    defaultResponse: {},
  },
  {
    label: 'data-kit status',
    Command: DataKitStatus as AnyData360Command,
    secondFlag: 'component',
    flags: { ...baseFlags, name: 'Sales', component: 'Account' },
    expectedPath: '/services/data/v66.0/ssot/data-kits/Sales/components/Account/deployment-status',
    defaultResponse: {},
  },
];

describe('multi-param path resolution', () => {
  for (const { label, Command, secondFlag, flags, expectedPath, defaultResponse } of cases) {
    describe(label, () => {
      it('resolves both path params, leaving no :token', async () => {
        const { requestLog } = await runCommand(Command, { flags, defaultResponse });

        assert.equal(requestLog.length, 1);
        assert.ok(requestLog[0].url.startsWith(expectedPath), `expected ${expectedPath}, got ${requestLog[0].url}`);
        assert.ok(!requestLog[0].url.split('?')[0].includes(':'));
      });

      it(`declares --${secondFlag} as required, so omitting it fails at parse time`, () => {
        const flag = Command.flags[secondFlag] as { required?: boolean } | undefined;
        assert.ok(flag, `--${secondFlag} must be declared or oclif rejects the invocation outright`);
        assert.equal(flag.required, true);
      });

      it('throws rather than requesting when the second param is missing', async () => {
        await assert.rejects(
          runCommand(Command, { flags: { ...flags, [secondFlag]: undefined }, defaultResponse }),
          isUnresolvedParamError
        );
      });
    });
  }

  describe('universal-id lookup (deny-listed, no flags designed)', () => {
    it('fails loudly with the three leftover params rather than issuing a request', async () => {
      await assert.rejects(
        runCommand(UniversalIdLookup, {
          flags: { ...baseFlags, name: 'ssot__Individual__dlm' },
          defaultResponse: {},
        }),
        (err: Error) => {
          isUnresolvedParamError(err);
          assert.equal(
            err.message.split('needs values for ')[1],
            ':dataSourceId, :dataSourceObjectId, :sourceRecordId.'
          );
          return true;
        }
      );
    });
  });
});
