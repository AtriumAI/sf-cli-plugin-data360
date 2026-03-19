NAME
sf data360 dmo create-from-dlo

SYNOPSIS
sf data360 dmo create-from-dlo -o <org>

DESCRIPTION
Create a DMO from an existing DLO with auto-mapping.

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
POST /ssot/<see source>

SEE ALSO
sf data360 dmo create
sf data360 dmo map-to-canonical

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
