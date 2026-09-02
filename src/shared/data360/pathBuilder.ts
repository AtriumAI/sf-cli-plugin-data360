/**
 * Build parameterized API paths with query string support.
 *
 * @example buildPath('/data-transforms/:name/run', { name: 'MyTransform' }, { dataspace: 'default' })
 */
import { SfError } from '@salesforce/core';

/** A surviving :token would ship a malformed URL and 404 opaquely. */
const assertResolved = (template: string, path: string): string => {
  const unresolved = path.match(/:[a-zA-Z]\w*/g);
  if (unresolved) {
    throw new SfError(
      `Endpoint ${template} needs values for ${unresolved.join(', ')}.`,
      'DATA360_UNRESOLVED_PATH_PARAM'
    );
  }
  return path;
};

export const buildPath = (
  template: string,
  params?: Record<string, string>,
  query?: Record<string, string | number | boolean | undefined>
): string => {
  let path = template;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      // Leave the token in place when there is no value: encodeURIComponent would
      // substitute the literal "undefined" and assertResolved would see nothing wrong.
      if (value) path = path.replace(`:${key}`, encodeURIComponent(value));
    }
  }

  // Before the query concat: a query value may legitimately contain a colon.
  assertResolved(template, path);

  if (query) {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    }
    if (parts.length > 0) {
      path += `?${parts.join('&')}`;
    }
  }

  return path;
};

/**
 * Replace the first :param in a path template with the given value.
 * Used by CRUD base classes where the endpoint template has Postman-style
 * param names but we only have a single resource ID from the --name flag.
 *
 * @example injectResourceId('/data-lake-objects/:recordIdOrDeveloperName', 'MyDLO')
 */
export const injectResourceId = (template: string, id: string): string =>
  assertResolved(template, id ? template.replace(/:[a-zA-Z]\w*/, encodeURIComponent(id)) : template);
