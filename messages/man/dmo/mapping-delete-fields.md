NAME
sf data360 dmo mapping-delete-fields

SYNOPSIS
sf data360 dmo mapping-delete-fields -o <org> --name <object-mapping-developer-name> --field-mapping <field-mapping-developer-name>

DESCRIPTION
Delete one field pair from a DLO→DMO mapping. The object-level mapping and its
other pairs stay. --name is the mapping's developerName and --field-mapping the
pair's developerName (<sourceField>_fieldmap_<targetField>); mapping-list
returns both.

FLAGS
--api-version Override API version (default: 66.0)
--dataspace Data space name (default: default)
--field-mapping (required) Field-level mapping developer name (FieldSourceTargetMap)
--name (required) Object-level mapping developer name (ObjectSourceTargetMap)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
DELETE /ssot/data-model-object-mappings/:objectSourceTargetMapDeveloperName/field-mappings/:fieldSourceTargetMapDeveloperName?dataspace=<name>

NOTES

- Salesforce documents only PATCH on this item path; DELETE on it removed only that pair live (204 on v66.0 and v67.0, dataspace=default)
- DELETE on the collection path answers "Field Source Target Name is missing"
- A non-default data space is unverified

TESTING
Unit tested: yes
Live tested: yes (2026-10-20)
Smoke tested: yes
