NAME
sf data360 docai detect-schema

SYNOPSIS
sf data360 docai detect-schema -o <org> -f <file> [--threshold <0-1>]

DESCRIPTION
Detect which extraction schema best matches a document. Scores the document against the
named schemas and returns the matches at or above the threshold, in single or
multi-schema mode.

FLAGS
--api-version Override API version (default: 67.0)
--definition-file (required) Path to JSON definition file
--threshold Minimum matching score (0-1); the API default is 0.80
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/document-processing/actions/detect-schema?threshold=<score>

EXAMPLE DEFINITION

    {
      "schemaConfigurations": ["Invoice_Schema_v1", "Receipt_Schema_v2"],
      "mlModel": "llmgateway__VertexAIGemini25Flash001",
      "files": [
        { "mimeType": "application/pdf", "data": "<base64>" }
      ],
      "mode": "Single"
    }

NOTES

- Available from API v67.0 only — this command defaults to 67.0 rather than the plugin-wide 66.0
- --threshold becomes a query param; leave it off to take the API default
- Response shape: { "data": [ { "schemaConfiguration", "matchingScore", "totalFieldsInSchema", "matchingFieldsInSchema" } ] }

SEE ALSO
sf data360 docai generate-schema
sf data360 docai config-list

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
