#!/usr/bin/env node
/**
 * Code generator: Parses Postman collection and generates command scaffolds
 * using the CRUD base classes.
 *
 * Usage: node scripts/generate-commands.mjs [--dry-run] [--group <name>]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Config ───

const POSTMAN_PATH = join(
  __dirname,
  '../../../2025-10-26-skills/postman/Salesforce Data 360 Connect APIs.postman_collection.json'
);
const COMMANDS_DIR = join(__dirname, '../src/commands/data360');

const DRY_RUN = process.argv.includes('--dry-run');
const FILTER_GROUP = process.argv.includes('--group') ? process.argv[process.argv.indexOf('--group') + 1] : undefined;

// ─── Mapping from Postman folders to CLI topics ───

const FOLDER_TO_TOPIC = {
  'Activation Targets': 'activation-target',
  Activations: 'activation',
  'Calculated Insights': 'calculated-insight',
  Connections: 'connection',
  'Data Action Targets': 'data-action-target',
  'Data Actions': 'data-action',
  'Data Clean Room': 'cleanroom',
  'Data Graphs': 'data-graph',
  'Data Kits': 'data-kit',
  'Data Lake Objects': 'dlo',
  'Data Model Objects': 'dmo',
  'Data Spaces': 'data-space',
  'Data Streams': 'data-stream',
  'Data Transforms': 'transform',
  'Document AI': 'docai',
  'Identity Resolutions': 'identity-resolution',
  Insights: 'insight',
  'Machine Learning': 'ml',
  Metadata: 'metadata',
  'Private Network Routes': 'private-route',
  Profile: 'profile',
  'Query V1 & V2': 'query',
  'Query (Current)': 'query',
  'Search Index': 'search-index',
  Segments: 'segment',
  'Universal ID Lookup': 'universal-id',
};

// ─── Endpoints that already exist (skip) ───

const EXISTING_COMMANDS = new Set([
  'data360/doctor',
  'data360/query/sql',
  'data360/query/vector',
  'data360/query/describe',
  'data360/search-index/list',
]);

// ─── Parse Postman collection ───

function extractEndpoints(collection) {
  const endpoints = [];
  for (const folder of collection.item) {
    const folderName = folder.name;
    if (!folder.item) continue;
    if (folderName === 'Auth' || folderName === 'Limits') continue;

    for (const item of folder.item) {
      if (!item.request) continue;
      const method = item.request.method;
      const urlObj = item.request.url;
      let raw = '';
      if (typeof urlObj === 'string') raw = urlObj;
      else if (urlObj?.raw) raw = urlObj.raw;

      const match = raw.match(/\/ssot\/(.+?)(\?|$)/);
      if (!match) continue;

      let path = match[1];
      path = path.replace(/\{\{[^}]+\}\}/g, (m) => {
        const name = m.replace(/[{}]/g, '');
        return `:${name}`;
      });

      const pathParams = [...path.matchAll(/:(\w+)/g)].map((m) => m[1]);

      endpoints.push({ name: item.name, method, path: `/ssot/${path}`, pathParams, folderName });
    }
  }
  return endpoints;
}

// ─── Determine action name ───

function deriveAction(endpoint) {
  const name = endpoint.name.toLowerCase();
  const method = endpoint.method;
  const hasParams = endpoint.pathParams.length > 0;

  if (name.includes('collection') || (name.startsWith('get ') && !hasParams)) return 'list';
  if (name.startsWith('create ')) return 'create';
  if (name.startsWith('delete ')) return 'delete';
  if (name.startsWith('update ') || name.startsWith('replace ')) return 'update';
  if (name.startsWith('get ') && hasParams) return 'get';

  if (name.includes('run ')) return 'run';
  if (name.includes('cancel ')) return 'cancel';
  if (name.includes('retry ')) return 'retry';
  if (name.includes('refresh ')) return 'refresh-status';
  if (name.includes('validate ')) return 'validate';
  if (name.includes('accept ')) return 'accept';
  if (name.includes('reject ')) return 'reject';
  if (name.includes('count ')) return 'count';
  if (name.includes('deactivate ')) return 'deactivate';
  if (name.includes('publish ')) return 'publish';
  if (name.includes('upsert ')) return 'upsert';
  if (name.includes('test ')) return 'test';
  if (name.includes('extract ')) return 'extract';
  if (name.includes('generate ')) return 'generate-schema';
  if (name.includes('lookup ')) return 'lookup';
  if (name.includes('predict')) return 'predict';
  if (name.includes('undeploy')) return 'undeploy';

  if (name.includes('schema') && method === 'GET') return 'schema-get';
  if (name.includes('schema') && method === 'PUT') return 'schema-upsert';
  if (name.includes('database')) return 'databases';
  if (name.includes('endpoint')) return 'endpoints';
  if (name.includes('field')) return 'fields';
  if (name.includes('preview')) return 'preview';
  if (name.includes('sitemap') && method === 'GET') return 'sitemap-get';
  if (name.includes('sitemap') && method === 'PUT') return 'sitemap-upsert';
  if (name.includes('schedule') && method === 'GET') return 'schedule-get';
  if (name.includes('schedule') && method === 'PUT') return 'schedule-set';
  if (name.includes('history')) return 'history';
  if (name.includes('members') && method === 'PUT') return 'members-upsert';
  if (name.includes('members') && method === 'GET') return 'members';
  if (name.includes('member') && method === 'GET') return 'member-get';
  if (name.includes('metadata') && !name.includes('calculated')) return 'metadata';
  if (name.includes('signing key')) return 'generate-key';
  if (name.includes('global config')) return 'global-config';
  if (name.includes('config') && method === 'GET' && !hasParams) return 'config';
  if (name.includes('jobs')) return 'jobs';
  if (name.includes('templates')) return 'templates';
  if (name.includes('data') && name.includes('by lookup')) return 'data-by-lookup';
  if (name.includes('data') && name.includes('by id')) return 'data-by-id';
  if (name.includes('rows')) return 'rows';
  if (name.includes('status')) return 'status';
  if (name.includes('dependencies') || name.includes('dependency')) return 'dependencies';
  if (name.includes('batch')) return 'batch';
  if (name.includes('platforms')) return 'platforms';
  if (name.includes('audience') && name.includes('data')) return 'data';

  return method.toLowerCase();
}

// ─── Resolve subtopics ───

function resolveSubtopic(endpoint, topic, action) {
  const path = endpoint.path;

  if (topic === 'ml') {
    if (path.includes('/alerts')) return { topic: 'ml', action: action === 'create' ? 'alert-create' : 'alert-update' };
    if (path.includes('/configured-models')) return { topic: 'ml', action: `model-${action}` };
    if (path.includes('/model-artifacts')) return { topic: 'ml', action: `artifact-${action}` };
    if (path.includes('/predict')) return { topic: 'ml', action: 'predict' };
    if (path.includes('/partitions')) return { topic: 'ml', action: `partition-${action}` };
    if (path.includes('/setup-versions')) return { topic: 'ml', action: `setup-version-${action}` };
  }

  if (topic === 'cleanroom') {
    if (path.includes('/collaborations') && path.includes('/actions/')) {
      if (action === 'accept') return { topic, action: 'collaboration-accept' };
      if (action === 'reject') return { topic, action: 'collaboration-reject' };
      if (action === 'run') return { topic, action: 'collaboration-run' };
      if (action === 'jobs') return { topic, action: 'collaboration-jobs' };
    }
    if (path.includes('/collaborations')) return { topic, action: `collaboration-${action}` };
    if (path.includes('/providers') && path.includes('/templates')) return { topic, action: 'provider-templates' };
    if (path.includes('/providers')) return { topic, action: `provider-${action}` };
    if (path.includes('/specifications')) return { topic, action: `specification-${action}` };
    if (path.includes('/templates')) return { topic, action: 'template-list' };
  }

  if (topic === 'dmo') {
    if (path.includes('/data-model-object-mappings') && path.includes('/field-mappings')) {
      return { topic, action: action === 'delete' ? 'mapping-delete-fields' : 'mapping-update-field' };
    }
    if (path.includes('/data-model-object-mappings')) return { topic, action: `mapping-${action}` };
    if (path.includes('/relationships')) {
      if (path.match(/relationships\/:/) && endpoint.method === 'DELETE')
        return { topic, action: 'relationship-delete' };
      return { topic, action: `relationship-${action}` };
    }
  }

  if (topic === 'connection') {
    if (path.includes('/connectors'))
      return { topic, action: endpoint.pathParams.length > 0 ? 'connector-get' : 'connector-list' };
    if (path.includes('/schema/actions/test')) return { topic, action: 'test-schema' };
    if (path.includes('/actions/test'))
      return { topic, action: path.includes('/:connectionId/actions') ? 'test-existing' : 'test' };
    if (path.includes('/actions/') && !path.includes('/test'))
      return { topic, action: path.includes('/:connectionId/actions') ? 'run-existing' : 'run' };
    if (path.includes('/database-schemas')) return { topic, action: 'database-schemas' };
    if (path.includes('/databases') && !path.includes('/database-schemas')) return { topic, action: 'databases' };
    if (path.includes('/endpoints')) return { topic, action: 'endpoints' };
    if (path.includes('/objects/') && path.includes('/fields')) return { topic, action: 'fields' };
    if (path.includes('/objects/') && path.includes('/preview')) return { topic, action: 'preview' };
    if (path.includes('/objects') && !path.includes('/fields') && !path.includes('/preview'))
      return { topic, action: 'objects' };
    if (path.includes('/schema') && endpoint.method === 'GET') return { topic, action: 'schema-get' };
    if (path.includes('/schema') && endpoint.method === 'PUT') return { topic, action: 'schema-upsert' };
    if (path.includes('/sitemap') && endpoint.method === 'GET') return { topic, action: 'sitemap-get' };
    if (path.includes('/sitemap') && endpoint.method === 'PUT') return { topic, action: 'sitemap-upsert' };
    if (action === 'update' && endpoint.method === 'PUT') return { topic, action: 'replace' };
  }

  if (topic === 'docai') {
    if (path.includes('/configurations') && path.includes('/actions/run')) return { topic, action: 'config-run' };
    if (path.includes('/configurations') && endpoint.pathParams.length > 0)
      return { topic, action: `config-${action}` };
    if (path.includes('/configurations') && action === 'list') return { topic, action: 'config-list' };
    if (path.includes('/configurations') && action === 'create') return { topic, action: 'config-create' };
    if (path.includes('/global-config')) return { topic, action: 'global-config' };
  }

  if (topic === 'data-space') {
    if (path.endsWith('/members') && endpoint.method === 'PUT') return { topic, action: 'members-upsert' };
    if (path.match(/\/members\/:/)) return { topic, action: 'member-get' };
    if (path.endsWith('/members') && endpoint.method === 'GET') return { topic, action: 'members' };
  }

  if (topic === 'profile') {
    if (path.includes('/calculated-insights')) return { topic, action: 'calculated-insight' };
    if (path.match(/\/profile\/:.+\/:.+$/)) return { topic, action: 'child' };
    if (path.includes('/metadata/:')) return { topic, action: 'metadata-get' };
    if (path.endsWith('/metadata')) return { topic, action: 'metadata' };
    if (path.match(/\/profile\/:.+\/:/)) return { topic, action: 'query-by-key' };
    if (path.match(/\/profile\/:[^/]+$/)) return { topic, action: 'query' };
  }

  if (topic === 'insight') {
    if (path.includes('/metadata/:')) return { topic, action: 'metadata-get' };
    if (path.endsWith('/metadata')) return { topic, action: 'metadata' };
    if (path.includes('/calculated-insights')) return { topic, action: 'query' };
  }

  if (topic === 'query') {
    if (path.includes('/query-sql') && path.includes('/rows')) return { topic, action: 'async-rows' };
    if (path.includes('/query-sql') && endpoint.method === 'DELETE') return { topic, action: 'async-cancel' };
    if (path.includes('/query-sql') && endpoint.method === 'GET') return { topic, action: 'async-status' };
    if (path.includes('/query-sql') && endpoint.method === 'POST') return { topic, action: 'async-create' };
    if (path.includes('/queryv2') && path.includes('nextBatch')) return { topic, action: 'v2-batch' };
    if (path.includes('/queryv2')) return { topic, action: 'sqlv2' };
    if (path.endsWith('/query') && endpoint.method === 'POST') return { topic, action: 'sql-v1' };
  }

  if (topic === 'segment' && action === 'deactivate') {
    if (endpoint.name.toLowerCase().includes('by id')) return { topic, action: 'deactivate-by-id' };
  }

  if (topic === 'data-graph') {
    if (path.includes('/metadata')) return { topic, action: 'metadata' };
    if (path.includes('/data/') && path.includes('/:id')) return { topic, action: 'data-by-id' };
    if (path.includes('/data/')) return { topic, action: 'data' };
    if (path.includes('/actions/refresh')) return { topic, action: 'refresh' };
  }

  if (topic === 'data-kit') {
    if (path.includes('/undeploy')) return { topic, action: 'undeploy' };
    if (path.includes('/dependencies')) return { topic, action: 'dependencies' };
    if (path.includes('/deployment-status')) return { topic, action: 'status' };
  }

  if (topic === 'activation') {
    if (path.includes('/data')) return { topic, action: 'data' };
    if (path.includes('/activation-external-platforms')) return { topic, action: 'platforms' };
  }

  // Transform sub-resources
  if (topic === 'transform') {
    if (path.includes('/run-history')) return { topic, action: 'history' };
    if (path.includes('/schedule') && endpoint.method === 'GET') return { topic, action: 'schedule-get' };
    if (path.includes('/schedule') && endpoint.method === 'PUT') return { topic, action: 'schedule-set' };
    if (path.includes('/data-transforms-validation')) return { topic, action: 'validate' };
  }

  // Segment members
  if (topic === 'segment') {
    if (path.includes('/members')) return { topic, action: 'members' };
  }

  // Search index config
  if (topic === 'search-index') {
    if (path.includes('/config')) return { topic, action: 'config' };
  }

  // Metadata
  if (topic === 'metadata') {
    if (path.endsWith('/metadata')) return { topic, action: 'get' };
    if (path.includes('/data-graphs/metadata')) return { topic, action: 'data-graph' };
    if (path.includes('/insight/metadata/:')) return { topic, action: 'insight-detail' };
    if (path.includes('/insight/metadata')) return { topic, action: 'insight' };
    if (path.includes('/profile/metadata/:')) return { topic, action: 'profile-detail' };
    if (path.includes('/profile/metadata')) return { topic, action: 'profile' };
  }

  // Data action target signing key
  if (topic === 'data-action-target') {
    if (path.includes('/signing-key')) return { topic, action: 'generate-key' };
  }

  // Cleanroom collaboration jobs
  if (topic === 'cleanroom') {
    if (path.includes('/jobs')) return { topic, action: 'collaboration-jobs' };
  }

  return { topic, action };
}

// ─── Determine base class ───

function determineBaseClass(method, action) {
  if (action.endsWith('-list') || action === 'list') return 'CrudListCommand';
  const getActions = [
    'get',
    'metadata',
    'metadata-get',
    'config',
    'global-config',
    'schema-get',
    'sitemap-get',
    'schedule-get',
    'history',
    'members',
    'member-get',
    'data-by-lookup',
    'data-by-id',
    'data',
    'rows',
    'status',
    'dependencies',
    'endpoints',
    'databases',
    'database-schemas',
    'fields',
    'objects',
    'templates',
    'jobs',
    'lookup',
    'preview',
    'query',
    'query-by-key',
    'child',
    'calculated-insight',
    'platforms',
    'v2-batch',
    'connector-get',
    'connector-list',
    'data-graph',
    'insight',
    'insight-detail',
    'profile',
    'profile-detail',
  ];
  if (getActions.includes(action)) return method === 'GET' ? 'CrudGetCommand' : 'CrudListCommand';
  if (
    action.endsWith('-create') ||
    action === 'create' ||
    action === 'predict' ||
    action === 'extract' ||
    action === 'generate-schema' ||
    action === 'generate-key'
  )
    return 'CrudCreateCommand';
  if (
    action.endsWith('-update') ||
    action === 'update' ||
    action === 'replace' ||
    action === 'schema-upsert' ||
    action === 'sitemap-upsert' ||
    action === 'schedule-set' ||
    action === 'members-upsert'
  )
    return 'CrudUpdateCommand';
  if (action.endsWith('-delete') || action === 'delete' || action === 'mapping-delete-fields')
    return 'CrudDeleteCommand';
  return 'CrudActionCommand';
}

// ─── Generate command file ───

function generateCommandFile(spec) {
  const className = `Data360${toPascalCase(spec.topic)}${toPascalCase(spec.action)}`;
  const importDepth = spec.topic.split('/').length + 1; // commands/data360/topic/action.ts
  const relBase = '../'.repeat(importDepth + 1);

  const lines = [];

  // Determine which imports we need
  const needsNameFlag =
    spec.idParam &&
    !spec.action.endsWith('list') &&
    spec.action !== 'create' &&
    !spec.action.endsWith('-create') &&
    spec.action !== 'predict' &&
    spec.action !== 'extract' &&
    spec.action !== 'generate-schema';

  if (needsNameFlag) {
    lines.push(`import { Flags } from '@salesforce/sf-plugins-core';`);
  }

  switch (spec.baseClass) {
    case 'CrudListCommand':
      lines.push(`import { CrudListCommand, listFlags } from '${relBase}shared/data360/crudBase.js';`);
      break;
    case 'CrudGetCommand':
      lines.push(`import { CrudGetCommand } from '${relBase}shared/data360/crudBase.js';`);
      lines.push(`import { data360Flags } from '${relBase}shared/data360/Data360Command.js';`);
      break;
    case 'CrudCreateCommand':
      lines.push(`import { CrudCreateCommand, mutationFlags } from '${relBase}shared/data360/crudBase.js';`);
      break;
    case 'CrudUpdateCommand':
      lines.push(`import { CrudUpdateCommand, mutationFlags } from '${relBase}shared/data360/crudBase.js';`);
      break;
    case 'CrudDeleteCommand':
      lines.push(`import { CrudDeleteCommand } from '${relBase}shared/data360/crudBase.js';`);
      lines.push(`import { data360Flags } from '${relBase}shared/data360/Data360Command.js';`);
      break;
    case 'CrudActionCommand':
      lines.push(`import { CrudActionCommand } from '${relBase}shared/data360/crudBase.js';`);
      lines.push(`import { data360Flags } from '${relBase}shared/data360/Data360Command.js';`);
      break;
  }

  lines.push('');

  // Class declaration
  const extendsType =
    spec.baseClass === 'CrudListCommand' || spec.baseClass === 'CrudGetCommand'
      ? `${spec.baseClass}<Record<string, unknown>>`
      : spec.baseClass;

  lines.push(`export default class ${className} extends ${extendsType} {`);
  lines.push(`  public static readonly summary = '${spec.summary}';`);
  lines.push(`  public static readonly examples = ['$ sf data360 ${spec.topic} ${spec.action} --target-org myorg'];`);
  lines.push(`  public static readonly enableJsonFlag = true;`);
  lines.push('');

  // Flags
  let flagsSource = 'data360Flags';
  if (spec.baseClass === 'CrudListCommand') flagsSource = 'listFlags';
  if (spec.baseClass === 'CrudCreateCommand' || spec.baseClass === 'CrudUpdateCommand') flagsSource = 'mutationFlags';

  if (needsNameFlag) {
    lines.push(`  public static readonly flags = {`);
    lines.push(`    ...${flagsSource},`);
    lines.push(`    name: Flags.string({`);
    lines.push(`      char: 'n',`);
    lines.push(`      summary: 'Name or ID of the resource.',`);
    lines.push(`      required: true,`);
    lines.push(`    }),`);
    lines.push(`  };`);
  } else {
    lines.push(`  public static readonly flags = {`);
    lines.push(`    ...${flagsSource},`);
    lines.push(`  };`);
  }

  lines.push('');
  lines.push(`  protected readonly endpoint = '${spec.endpoint}';`);

  // Columns for list/get commands
  if (spec.baseClass === 'CrudListCommand' || spec.baseClass === 'CrudGetCommand') {
    lines.push('');
    lines.push('  protected readonly columns = [');
    lines.push("    { key: 'name', name: 'Name' },");
    lines.push("    { key: 'status', name: 'Status' },");
    lines.push('  ];');
  }

  // Extra properties
  if (spec.baseClass === 'CrudUpdateCommand' && spec.httpMethod === 'PUT') {
    lines.push('');
    lines.push("  protected readonly updateMethod = 'PUT' as const;");
  }
  if (spec.baseClass === 'CrudActionCommand' && spec.httpMethod && spec.httpMethod !== 'POST') {
    lines.push('');
    lines.push(`  protected readonly httpMethod = '${spec.httpMethod}' as const;`);
  }

  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

// ─── Helpers ───

function toPascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Main ───

function main() {
  const collection = JSON.parse(readFileSync(POSTMAN_PATH, 'utf-8'));
  const endpoints = extractEndpoints(collection);
  console.log(`Found ${endpoints.length} endpoints in Postman collection`);

  const specs = [];
  const seen = new Set();
  let skipped = 0;

  for (const ep of endpoints) {
    const topic = FOLDER_TO_TOPIC[ep.folderName];
    if (!topic) {
      console.log(`  SKIP (no topic mapping): ${ep.folderName} / ${ep.name}`);
      skipped++;
      continue;
    }

    if (FILTER_GROUP && ep.folderName !== FILTER_GROUP) continue;

    const baseAction = deriveAction(ep);
    const resolved = resolveSubtopic(ep, topic, baseAction);
    const finalTopic = resolved.topic;
    const finalAction = resolved.action;

    const key = `${finalTopic}/${finalAction}`;
    if (seen.has(key)) {
      skipped++;
      continue;
    }
    seen.add(key);

    // Check if already implemented
    if (
      EXISTING_COMMANDS.has(`data360/${finalTopic}/${finalAction}`) ||
      EXISTING_COMMANDS.has(`data360/${finalAction}`)
    ) {
      console.log(`  SKIP (exists): data360/${finalTopic}/${finalAction}`);
      skipped++;
      continue;
    }

    const baseClass = determineBaseClass(ep.method, finalAction);

    // Convert ssot path to endpoint template (strip /ssot prefix)
    const endpoint = ep.path.replace(/^\/ssot/, '');

    const filePath = join(COMMANDS_DIR, finalTopic, `${finalAction}.ts`);
    const summary = `${capitalize(finalAction.replace(/-/g, ' '))} Data 360 ${topic.replace(/-/g, ' ')}.`;

    specs.push({
      topic: finalTopic,
      action: finalAction,
      baseClass,
      endpoint,
      idParam: ep.pathParams[0],
      filePath,
      summary,
      httpMethod: ep.method,
    });
  }

  console.log(`\nWill generate ${specs.length} commands (${skipped} skipped)\n`);

  if (DRY_RUN) {
    for (const spec of specs) {
      const rel = spec.filePath.replace(COMMANDS_DIR + '/', '');
      console.log(`  ${spec.baseClass.padEnd(20)} ${spec.topic}/${spec.action.padEnd(25)} → ${rel}`);
    }
    console.log(`\nTotal: ${specs.length} commands`);
    return;
  }

  let created = 0;
  let existed = 0;
  for (const spec of specs) {
    if (existsSync(spec.filePath)) {
      existed++;
      continue;
    }

    const dir = dirname(spec.filePath);
    mkdirSync(dir, { recursive: true });

    const content = generateCommandFile(spec);
    writeFileSync(spec.filePath, content);
    created++;
    console.log(`  CREATED: ${spec.topic}/${spec.action}`);
  }

  console.log(`\nDone. Created ${created}, already existed ${existed}.`);
}

main();
