#!/usr/bin/env bash
# =============================================================================
# GPS Data 360 Workshop — Verification Queries
# =============================================================================
#
# Usage:
#   ./verify.sh [--org <alias>]
#
# Runs read-only verification queries to check workshop state.
# Safe to run multiple times. Uses the local dev binary.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Use global sf binary (linked to local plugin code via `sf plugins link .`)
# Override with SF env var to use a different binary (e.g. SF=./bin/dev.js)
SF="${SF:-sf}"

ORG="${1:-d360-badge}"
if [[ "${1:-}" == "--org" ]]; then ORG="$2"; fi

banner() {
  echo ""
  echo "--- $1 ---"
}

# Connectivity
banner "Doctor"
"$SF" data360 doctor -o "$ORG"

# Data Streams
banner "Data Streams"
"$SF" data360 data-stream list -o "$ORG" --all

# DLOs
banner "Data Lake Objects"
"$SF" data360 dlo list -o "$ORG" --all

# DLO row counts
banner "DLO Row Counts"
"$SF" data360 query sql -o "$ORG" --sql 'SELECT COUNT(*) AS case_rows FROM "Case_Home__dll"' 2>/dev/null || echo "  Case_Home__dll: not found"
"$SF" data360 query sql -o "$ORG" --sql 'SELECT COUNT(*) AS attendee_rows FROM "Attendee__dll"' 2>/dev/null || echo "  Attendee__dll: not found"

# Attendance (zero-copy — may show 0 in DLO but returns data via query)
banner "Attendance DMO (zero-copy)"
"$SF" data360 query sql -o "$ORG" --sql 'SELECT * FROM "Attendance__dlm" LIMIT 5' 2>/dev/null || echo "  Attendance__dlm: not found"

# Individual — Bailey lookup
banner "Individual: Bailey Records"
"$SF" data360 query sql -o "$ORG" --sql "SELECT \"ssot__DataSourceId__c\", \"ssot__Id__c\", \"ssot__FirstName__c\", \"ssot__LastName__c\" FROM \"ssot__Individual__dlm\" WHERE \"ssot__LastName__c\" = 'Bailey'" 2>/dev/null || echo "  No Bailey records or Individual DMO not ready"

# Identity Resolution — Unified Bailey
banner "Unified Individual: Bailey"
"$SF" data360 query sql -o "$ORG" --sql "SELECT ui.\"ssot__FirstName__c\", ui.\"ssot__LastName__c\", ui.\"ssot__Id__c\", link.\"ssot__DataSourceId__c\" FROM \"UnifiedIndividual__dlm\" AS ui JOIN \"IndividualIdentityLink__dlm\" AS link ON ui.\"ssot__Id__c\" = link.\"UnifiedRecordId__c\" WHERE ui.\"ssot__LastName__c\" = 'Bailey'" 2>/dev/null || echo "  Identity Resolution not run yet"

# Calculated Insight
banner "Calculated Insight: Avg Engagement Score"
"$SF" data360 query sql -o "$ORG" --sql 'SELECT * FROM "Unified_Individual_Avg_Engagement_Score__cio" LIMIT 5' 2>/dev/null || echo "  CI not created yet"

# Data Graph
banner "Data Graph: Individual Case and Attendance"
"$SF" data360 data-graph metadata -o "$ORG" --name Individual_Case_and_Attendance 2>/dev/null || echo "  Data Graph not created yet"

# Segment
banner "Segment: Highly Engaged but Low Feedback"
"$SF" data360 segment count -o "$ORG" --name Highly_Engaged_but_Low_Feedback 2>/dev/null || echo "  Segment not created yet"

# Search Index (Part B — may be on different org)
banner "Search Index: My_kav"
"$SF" data360 search-index get -o "$ORG" --name My_kav 2>/dev/null || echo "  Search index not created on this org"

echo ""
echo "=== Verification complete ==="
