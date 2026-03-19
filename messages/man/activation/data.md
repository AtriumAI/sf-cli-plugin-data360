NAME
sf data360 activation data

SYNOPSIS
sf data360 activation data -o <org> --name <name>

DESCRIPTION
Data Data 360 activation.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
GET /ssot/activations/:activationId/data

TESTING
Unit tested: no
Live tested: no
Smoke tested: yes
