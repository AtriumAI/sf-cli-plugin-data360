/**
 * Command execution helper for testing Data 360 commands with mocked API.
 *
 * Instantiates a command, injects a mock Org, stubs framework methods,
 * and captures all output and API requests for assertions.
 */
import { Data360Command } from '../../src/shared/data360/Data360Command.js';
import { createMockOrg, MockOrgOptions, RequestLog } from './mockOrg.js';

export type RunOptions = MockOrgOptions & {
  /** Flag values to inject (as if parsed from CLI args). */
  flags: Record<string, unknown>;
  /** Override API version (default: '66.0'). */
  apiVersion?: string;
  /** Receives each log line as it is written, so output stays readable when run() throws. */
  onLog?: (line: string) => void;
};

export type RunResult<T> = {
  result: T;
  requestLog: RequestLog[];
  output: string[];
  tableData: unknown[];
  /** The column set the command handed the table, so a wrong column is visible to a test. */
  tableColumns: Array<{ key: string; name: string }>;
  styledHeaders: string[];
  warnings: string[];
};

/**
 * Run a Data360Command subclass in isolation with mocked API.
 *
 * @param CommandClass - The command class to instantiate and run
 * @param options - Flags, mock responses, and optional API version
 */
export const runCommand = async <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CommandClass: new (...args: any[]) => Data360Command<T>,
  options: RunOptions
): Promise<RunResult<T>> => {
  const { org, requestLog } = createMockOrg(options);
  const apiVersion = options.apiVersion ?? '66.0';

  // Create instance — try constructor first (to get field initializers like endpoint),
  // fall back to Object.create if constructor throws on missing oclif config.
  let cmd: Data360Command<T> & {
    org: typeof org;
    apiVersion: string;
    showTiming: boolean;
    tStart: number;
    tParsed: number;
  };
  try {
    cmd = new CommandClass([], {} as never) as typeof cmd;
  } catch {
    cmd = Object.create(CommandClass.prototype) as typeof cmd;
  }

  // Inject mock org and config
  cmd.org = org;
  cmd.apiVersion = apiVersion;
  cmd.showTiming = false;
  cmd.tStart = 0;
  cmd.tParsed = 0;

  const output: string[] = [];
  const tableData: unknown[] = [];
  const tableColumns: Array<{ key: string; name: string }> = [];
  const styledHeaders: string[] = [];
  const warnings: string[] = [];

  // Stub parseData360Flags — returns flags and sets org/apiVersion
  (cmd as unknown as Record<string, unknown>).parseData360Flags = async () => {
    cmd.org = org;
    cmd.apiVersion = apiVersion;
    return options.flags;
  };

  // Stub parse — returns { flags } for commands that call this.parse(CommandClass)
  (cmd as unknown as Record<string, unknown>).parse = async () => ({
    flags: options.flags,
    args: {},
    argv: [],
    raw: [],
    metadata: {},
    nonExistentFlags: {},
  });

  // Capture output methods
  cmd.log = (...args: string[]) => {
    const line = args.join(' ');
    output.push(line);
    options.onLog?.(line);
  };
  cmd.logToStderr = () => {};
  (cmd as unknown as Record<string, unknown>).warn = (msg: string | Error) => {
    warnings.push(typeof msg === 'string' ? msg : msg.message);
    return msg;
  };
  (cmd as unknown as Record<string, unknown>).table = (opts: {
    data?: unknown[];
    columns?: Array<{ key: string; name: string }>;
  }) => {
    if (opts?.data) tableData.push(...opts.data);
    if (opts?.columns) tableColumns.push(...opts.columns);
  };
  (cmd as unknown as Record<string, unknown>).styledHeader = (header: string) => {
    styledHeaders.push(header);
  };
  (cmd as unknown as Record<string, unknown>).emitTiming = () => {};

  // Stub error to throw (so test can catch it)
  (cmd as unknown as Record<string, unknown>).error = (msg: string | Error) => {
    throw typeof msg === 'string' ? new Error(msg) : msg;
  };

  const result = await cmd.run();

  return { result, requestLog, output, tableData, tableColumns, styledHeaders, warnings };
};
