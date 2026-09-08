/**
 * Tier 3: docai detect-schema — definition body plus a threshold query param.
 */
import assert from 'node:assert/strict';
import { runCommand } from '../../helpers/runCommand.js';
import DocaiDetectSchema from '../../../src/commands/data360/docai/detect-schema.js';

describe('docai detect-schema', () => {
  const definition = {
    schemaConfigurations: ['Invoice_Schema_v1'],
    mlModel: 'llmgateway__VertexAIGemini25Flash001',
    files: [{ mimeType: 'application/pdf', data: '<base64>' }],
    mode: 'Single',
  };
  const flags = { 'target-org': {}, 'api-version': '67.0', timing: false, definitionBody: definition };

  it('POSTs the definition and appends threshold as a query param', async () => {
    const { requestLog } = await runCommand(DocaiDetectSchema, {
      flags: { ...flags, threshold: '0.9' },
      apiVersion: '67.0',
      defaultResponse: { data: [] },
    });

    assert.equal(requestLog.length, 1);
    assert.equal(requestLog[0].method, 'POST');
    assert.ok(
      requestLog[0].url.endsWith('/document-processing/actions/detect-schema?threshold=0.9'),
      requestLog[0].url
    );
    assert.deepEqual(requestLog[0].body, definition);
  });

  it('omits threshold entirely when unset, leaving the API default in force', async () => {
    const { requestLog } = await runCommand(DocaiDetectSchema, {
      flags,
      apiVersion: '67.0',
      defaultResponse: { data: [] },
    });

    assert.ok(!requestLog[0].url.includes('threshold'), requestLog[0].url);
    assert.ok(!requestLog[0].url.includes('?'), requestLog[0].url);
  });

  it('defaults api-version to 67.0, the version the endpoint requires', () => {
    const declared = DocaiDetectSchema.flags as Record<string, { default?: unknown }>;
    assert.equal(declared['api-version'].default, '67.0');
  });

  it('requests the v67.0 path', async () => {
    const { requestLog } = await runCommand(DocaiDetectSchema, {
      flags,
      apiVersion: '67.0',
      defaultResponse: { data: [] },
    });

    assert.ok(requestLog[0].url.startsWith('/services/data/v67.0/ssot/'), requestLog[0].url);
  });
});
