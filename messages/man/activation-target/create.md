NAME
sf data360 activation-target create

SYNOPSIS
sf data360 activation-target create -o <org> -f <file>

DESCRIPTION
Create Data 360 activation target.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/activation-targets

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
