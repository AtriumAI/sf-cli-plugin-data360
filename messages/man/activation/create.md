NAME
sf data360 activation create

SYNOPSIS
sf data360 activation create -o <org> -f <file>

DESCRIPTION
Create Data 360 activation.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/activations

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
