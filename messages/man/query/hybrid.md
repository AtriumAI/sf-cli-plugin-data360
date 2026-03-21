NAME
sf data360 query hybrid

SYNOPSIS
sf data360 query hybrid -o <org>

DESCRIPTION
Run hybrid search (vector + keyword) on a Data Cloud search index.

FLAGS
--api-version Override API version (default: 66.0)
--index Search index name
--limit Maximum results to return
--prefilter Pre-filter expression (e.g. "Type\_\_c='Home'")
--query Natural language query text
--target-org (required) Target org alias or username
--timing Print timing breakdown to stderr

PREFILTER SYNTAX
Pre-filters narrow results before ranking by matching field values on the
search index. The field must be configured as a pre-filter field when
creating the search index.

Examples:
--prefilter "Type_of_Insurance**c='Home'"
--prefilter "Category**c='Billing'"

Omit --prefilter (or pass empty string) to search without filtering.

API
POST /ssot/<see source>

SEE ALSO
sf data360 query vector
sf data360 search-index list
sf data360 query sql

TESTING
Unit tested: no
Live tested: no
Smoke tested: no
