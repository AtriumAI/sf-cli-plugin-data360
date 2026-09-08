NAME
sf data360 connection test-definition

SYNOPSIS
sf data360 connection test-definition -o <org> -f <file>

DESCRIPTION
Test a connector definition before creating the connection. Takes the same definition
shape the test endpoint documents — connectorType, method, and the credential and
parameter attributes — and reports whether it can connect. Nothing is created.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file (required) Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/connections/actions/test

EXAMPLE DEFINITION

    {
      "connectorType": "AwsRdsPostgres",
      "method": "Ingress",
      "credentials": {
        "attributes": [
          { "name": "username", "value": "<USER>" },
          { "name": "password", "value": "<PASSWORD>" }
        ],
        "parameters": {
          "attributes": [
            { "name": "connection_url", "value": "<HOST>:<PORT>" }
          ]
        }
      }
    }

NOTES

- Available from API v62.0
- Tests a definition, not an existing connection — use "connection test" or "connection test-existing" for that
- The attribute names differ per connector type; "connection connector-list" shows the available types
- Response shape: { "success": true, "errors": [ { "errorCode", "message" } ] } — read it with --json

SEE ALSO
sf data360 connection test
sf data360 connection test-existing
sf data360 connection create

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
