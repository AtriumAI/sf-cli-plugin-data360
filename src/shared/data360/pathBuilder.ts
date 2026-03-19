/**
 * Build parameterized API paths with query string support.
 *
 * @example buildPath('/data-transforms/:name/run', { name: 'MyTransform' }, { dataspace: 'default' })
 */

export const buildPath = (
  template: string,
  params?: Record<string, string>,
  query?: Record<string, string | number | boolean | undefined>
): string => {
  let path = template;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    }
  }

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
  template.replace(/:[a-zA-Z]\w*/, encodeURIComponent(id));
