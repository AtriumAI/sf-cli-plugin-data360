NAME
sf data360 data-stream create-from-object

SYNOPSIS
sf data360 data-stream create-from-object -o <org> --name <name>

DESCRIPTION
Create a CRM data stream from a Salesforce object.

FLAGS
--api-version Override API version (default: 66.0)
--category  
 --dataspace Data space name (default: default)
--event-date-field  
 --name Resource name or ID
--object  
 --refresh-mode  
 --target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

SEE ALSO
sf data360 data-stream create
sf data360 dmo create-from-dlo

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
