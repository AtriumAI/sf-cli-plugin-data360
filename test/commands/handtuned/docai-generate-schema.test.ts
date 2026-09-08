/**
 * Tier 3: docai generate-schema — org-level action with a definition body.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import DocaiGenerateSchema from '../../../src/commands/data360/docai/generate-schema.js';

describe('docai generate-schema', () => {
  const definition = {
    mlModel: 'llmgateway__OpenAIGPT4Omni_08_06',
    files: [{ mimeType: 'image/png', data: 'base64' }],
  };

  it('POSTs the definition to the org-level action with no path param', async () => {
    const { requestLog, result } = await runCommand(DocaiGenerateSchema, {
      flags: { 'target-org': {}, 'api-version': '66.0', timing: false, definitionBody: definition },
      defaultResponse: { error: null, schema: '{"schema":{}}' },
    });

    assert.equal(requestLog.length, 1);
    assert.equal(requestLog[0].method, 'POST');
    assert.ok(requestLog[0].url.endsWith('/ssot/document-processing/actions/generate-schema'), requestLog[0].url);
    assert.deepEqual(requestLog[0].body, definition);
    assert.equal(result.success, true);
  });

  it('declares --definition-file as required and no --name', () => {
    const flags = DocaiGenerateSchema.flags as Record<string, { required?: boolean }>;
    assert.equal(flags['definition-file'].required, true);
    assert.equal(flags.name, undefined);
  });
});
