NAME
sf data360 dmo map-to-canonical

SYNOPSIS
sf data360 dmo map-to-canonical -o <org>

DESCRIPTION
Map a DLO to a canonical (ssot\_\_) DMO with auto-matching.

FLAGS
--api-version Override API version (default: 66.0)
--dataspace Data space name (default: default)
--dlo DLO developer name
--dmo DMO developer name
--dry-run Preview without creating
--exclude-fields Comma-separated fields to exclude
--include-fields Comma-separated fields to include
--map Manual mapping overrides (DloField=DmoField pairs)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

NOTES - Use --dry-run to preview before creating - --map supports duplicate source keys: --map "Id**c=ssot**PartyId**c,Id**c=ssot**Id**c"

SEE ALSO
sf data360 dmo mapping-list
sf data360 dmo mapping-create

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
