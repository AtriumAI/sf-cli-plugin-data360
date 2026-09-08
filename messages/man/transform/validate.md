NAME
sf data360 transform validate

SYNOPSIS
sf data360 transform validate -o <org> -f <file>

DESCRIPTION
Validate a data transform definition before creating it. Takes the same definition shape
as "transform create". A valid definition returns an example of the target object output
structure; an invalid one returns the issues found. Nothing is created either way.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file (required) Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/data-transforms-validation

EXAMPLE DEFINITION

    {
      "name": "IndividualStreaming",
      "label": "IndividualStreaming",
      "description": "",
      "type": "Streaming",
      "definition": {
        "expression": "SELECT Individual__dll.id__c as id__c FROM Individual__dll",
        "targetDlo": "Individual_target__dll",
        "type": "SQL"
      }
    }

NOTES

- Available from API v62.0
- Pre-create validation: it takes a definition, not the name of an existing transform
- Response shape: { "issues": [ { "errorCode", "errorMessage", "errorSeverity" } ], "outputDataObjects": [] }
- The command logs only that the call succeeded — read "issues" with --json to see whether the definition is valid

SEE ALSO
sf data360 transform create

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
