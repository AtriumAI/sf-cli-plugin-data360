NAME
sf data360 docai generate-schema

SYNOPSIS
sf data360 docai generate-schema -o <org> -f <file>

DESCRIPTION
Generate a Document AI extraction schema from sample files. The action is org-level:
it reads the model and the sample documents from the definition file and returns a JSON
schema. It is not scoped to a Document AI configuration, so there is no --name.

FLAGS
--api-version Override API version (default: 66.0)
--definition-file (required) Path to JSON definition file
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

API
POST /ssot/document-processing/actions/generate-schema

EXAMPLE DEFINITION

    {
      "mlModel": "llmgateway__OpenAIGPT4Omni_08_06",
      "files": [
        { "mimeType": "image/png", "data": "<base64>" }
      ]
    }

NOTES

- Available from API v63.0
- Response shape: { "error": null, "schema": "<JSON string>" } — read it with --json
- Files travel as base64 inside the definition body, so keep samples small
- See also: sf data360 man docai detect-schema

TESTING
Unit tested: yes
Live tested: no
Smoke tested: yes
