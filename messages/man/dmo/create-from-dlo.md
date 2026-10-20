NAME
sf data360 dmo create-from-dlo

SYNOPSIS
sf data360 dmo create-from-dlo -o <org>

DESCRIPTION
Create a DMO from an existing DLO with auto-mapping. Each DMO field takes the
type the DLO declares for it (GET /ssot/data-lake-objects/<dlo>, fields[].dataType),
so Currency, Percent, Email, Phone and Url fields keep their types and pass the
mapping's type-parity check. A field with no declared type falls back to its
SQL column type.

FLAGS
--api-version Override API version (default: 66.0)
--category  
 --dataspace Data space name (default: default)
--dlo DLO developer name
--dmo DMO developer name
--exclude-fields Comma-separated fields to exclude
--include-fields Comma-separated fields to include
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/query, GET /ssot/data-lake-objects/<dlo>, POST /ssot/data-model-objects, POST /ssot/data-model-object-mappings?dataspace=<name>

NOTES

- When the DMO gets a Currency field, the API adds a system field cdp_sys_record_currency\_\_c (Text); the DLO's cdp_sys_record_currency\_\_c is mapped onto it, whatever --include-fields/--exclude-fields say, and no custom field is created for it (live, 2026-10-20)
- POST /ssot/data-model-objects accepted Currency, Percent, Email, Phone and Url verbatim (live, 2026-10-20)

SEE ALSO
sf data360 dmo create
sf data360 dmo map-to-canonical

TESTING
Unit tested: yes
Live tested: yes (2026-10-20)
Smoke tested: yes
