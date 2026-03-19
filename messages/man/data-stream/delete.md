NAME
sf data360 data-stream delete

SYNOPSIS
sf data360 data-stream delete -o <org> --name <name>

DESCRIPTION
Delete Data 360 data stream.

FLAGS
--api-version Override API version (default: 66.0)
--keep-dlo Keep the DLO when deleting the stream
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
DELETE /ssot/data-streams/:recordIdOrDeveloperName

NOTES - Default: also deletes the associated DLO - Use --keep-dlo to preserve the DLO

SEE ALSO
sf data360 data-stream list

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
