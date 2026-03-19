NAME
sf data360 identity-resolution run

SYNOPSIS
sf data360 identity-resolution run -o <org> --name <name>

DESCRIPTION
Run a Data 360 identity resolution ruleset.

FLAGS
--api-version Override API version (default: 66.0)
--name Resource name or ID
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/<see source>

NOTES - Auto-resolves name/label to record ID - rulesetId is permanent — can't reuse after deletion - Unified DMO: UnifiedssotIndividual{RulesetId}\_\_dlm

SEE ALSO
sf data360 identity-resolution list
sf data360 identity-resolution get

TESTING
Unit tested: yes
Live tested: yes (2026-03-18)
Smoke tested: yes
