NAME
sf data360 connection create

SYNOPSIS
sf data360 connection create -o <org> -f <file>

DESCRIPTION
Create Data 360 connection.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/connections

EXAMPLES
sf data360 connection create -o myorg -f heroku-postgres.json
sf data360 connection create -o myorg -f redshift.json

EXAMPLE DEFINITION — Heroku Postgres
{
"connectorType": "HerokuPostgres",
"label": "My Heroku DB",
"name": "My_Heroku_DB",
"method": "Ingress",
"credentials": [
{ "paramName": "credentialType", "value": "UsernamePasswordAuthentication" },
{ "paramName": "user", "value": "<HEROKU_DB_USER>" },
{ "paramName": "password", "value": "<HEROKU_DB_PASSWORD>" }
],
"parameters": [
{ "paramName": "jdbc_connection_url", "value": "<HOST>:<PORT>" },
{ "paramName": "DATABASE", "value": "<DATABASE_NAME>" }
]
}

EXAMPLE DEFINITION — Amazon Redshift
{
"connectorType": "REDSHIFT",
"label": "My Redshift",
"name": "My_Redshift",
"method": "Ingress",
"credentials": [
{ "paramName": "authenticationOption", "value": "usernameAndPassword" },
{ "paramName": "username", "value": "<REDSHIFT_USER>" },
{ "paramName": "password", "value": "<REDSHIFT_PASSWORD>" }
],
"parameters": [
{ "paramName": "url", "value": "<HOST>:<PORT>" },
{ "paramName": "database", "value": "<DATABASE_NAME>" },
{ "paramName": "hasPrivateNetworkRoute", "value": "false" }
]
}

NOTES

- Each connector type has different credential/parameter names
- To discover params for a new connector type, create one via UI then inspect:
  sf api request rest "/services/data/v66.0/ssot/connections/<id>" -o <org>
- Use "sf data360 connection connector-list" to see available connector types

TESTING
Unit tested: no
Live tested: yes (Redshift, HerokuPostgres — 2026-03-21)
Smoke tested: yes
