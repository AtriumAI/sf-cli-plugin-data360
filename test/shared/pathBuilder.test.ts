/**
 * Tier 1: pathBuilder — a surviving :token must never reach the wire.
 */
import assert from 'node:assert/strict';
import { buildPath, injectResourceId } from '../../src/shared/data360/pathBuilder.js';

const isUnresolvedParamError = (err: Error): boolean => {
  assert.equal(err.name, 'DATA360_UNRESOLVED_PATH_PARAM');
  return true;
};

describe('injectResourceId', () => {
  it('resolves a single-param template', () => {
    assert.equal(injectResourceId('/data-lake-objects/:recordIdOrDeveloperName', 'MyDLO'), '/data-lake-objects/MyDLO');
  });

  it('URL-encodes the id', () => {
    assert.equal(injectResourceId('/segments/:segmentId', 'a b/c'), '/segments/a%20b%2Fc');
  });

  it('passes through a template with no params', () => {
    assert.equal(injectResourceId('/data-model-object-mappings', 'ignored'), '/data-model-object-mappings');
  });

  it('throws on a two-param template rather than shipping a :token', () => {
    assert.throws(
      () => injectResourceId('/data-kits/:dataKitName/components/:componentName/deployment-status', 'Sales'),
      isUnresolvedParamError
    );
  });

  it('names every leftover param in the message', () => {
    assert.throws(
      () => injectResourceId('/universalIdLookup/:entityName/:dataSourceId/:dataSourceObjectId/:sourceRecordId', 'E'),
      (err: Error) => {
        const leftover = err.message.split('needs values for ')[1];
        // The first param was substituted, so only the other three are still missing.
        assert.equal(leftover, ':dataSourceId, :dataSourceObjectId, :sourceRecordId.');
        return true;
      }
    );
  });
});

describe('buildPath', () => {
  it('resolves every param it is given', () => {
    assert.equal(
      buildPath('/connections/:connectionId/objects/:resourceName/fields', {
        connectionId: '0hMdL000001lCRlUAM',
        resourceName: 'Account',
      }),
      '/connections/0hMdL000001lCRlUAM/objects/Account/fields'
    );
  });

  it('URL-encodes param values', () => {
    assert.equal(
      buildPath('/data-spaces/:idOrName/members', { idOrName: 'my space' }),
      '/data-spaces/my%20space/members'
    );
  });

  it('throws when a pathParams override misses a param', () => {
    assert.throws(
      () => buildPath('/data-kits/:dataKitName/components/:componentName/dependencies', { dataKitName: 'Sales' }),
      isUnresolvedParamError
    );
  });

  it('throws rather than substituting the literal "undefined" for a missing value', () => {
    assert.throws(
      () =>
        buildPath('/connections/:connectionId/objects/:resourceName/fields', {
          connectionId: 'c1',
          resourceName: undefined as unknown as string,
        }),
      isUnresolvedParamError
    );
  });

  it('throws rather than emitting a // segment for an empty value', () => {
    assert.throws(() => buildPath('/data-spaces/:idOrName/members', { idOrName: '' }), isUnresolvedParamError);
  });

  it('throws when called with no params on a parameterized template', () => {
    assert.throws(() => buildPath('/connections/:connectionId/databases'), isUnresolvedParamError);
  });

  it('does not throw when a query VALUE contains a colon', () => {
    assert.equal(
      buildPath('/data-model-object-mappings', undefined, { since: '2026-09-01T00:00:00Z' }),
      '/data-model-object-mappings?since=2026-09-01T00%3A00%3A00Z'
    );
  });

  it('does not throw when a query KEY contains a colon', () => {
    assert.equal(buildPath('/segments', undefined, { 'ns:field': 'v' }), '/segments?ns%3Afield=v');
  });

  it('appends the query string after the params are resolved', () => {
    assert.equal(
      buildPath('/data-spaces/:idOrName/members', { idOrName: 'default' }, { limit: 10 }),
      '/data-spaces/default/members?limit=10'
    );
  });
});
