import { Flags } from '@salesforce/sf-plugins-core';
import { CrudUpdateCommand, mutationFlags } from '../../../shared/data360/crudBase.js';

export default class Data360DmoMappingUpdateField extends CrudUpdateCommand {
  public static readonly summary = 'Add or update field mappings on an existing DLO→DMO mapping.';
  public static readonly description =
    'PATCHes the field-mappings collection of an existing object-level mapping. The definition is the ' +
    'object-mapping request shape (sourceEntityDeveloperName, targetEntityDeveloperName, fieldMapping[]); ' +
    'fieldMapping needs to list only the pairs being added or changed — the API merges them into the ' +
    'existing set. --name is the OBJECT-level mapping developer name (from mapping-list/mapping-get).';
  public static readonly examples = [
    '$ sf data360 dmo mapping-update-field --target-org myorg --name S3_Subscribers_Individual -f add-pairs.json',
  ];
  public static readonly enableJsonFlag = true;

  public static readonly flags = {
    ...mutationFlags,
    name: Flags.string({
      char: 'n',
      summary: 'Developer name of the object-level mapping (ObjectSourceTargetMap).',
      required: true,
    }),
    // The PATCH body is the whole point of this command — an empty body is never intended.
    // Re-declared rather than spread: spreading the inherited flag yields an unnameable
    // inferred type that fails declaration emit (TS2742) even though --noEmit passes.
    'definition-file': Flags.file({
      char: 'f',
      summary: 'Path to a JSON definition file. Use "-" for stdin.',
      exists: false,
      required: true,
    }),
  };

  protected readonly endpoint = '/data-model-object-mappings/:objectSourceTargetMapDeveloperName/field-mappings';
}
