NAME
sf data360 connection run

SYNOPSIS
sf data360 connection run -o <org> --name <action>

DESCRIPTION
Run Data 360 connection.

FLAGS
--api-version Override API version (default: 66.0)
--name (required) Connection action to run (the :command path segment)
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/connections/actions/:command

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
