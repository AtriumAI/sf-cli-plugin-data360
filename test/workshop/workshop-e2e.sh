#!/usr/bin/env bash
# =============================================================================
# GPS Data 360 Hands-On Workshop — E2E Test Script via CLI Plugin
# =============================================================================
#
# Usage:
#   ./workshop-e2e.sh [--org <alias>] [--phase <phase>] [--dry-run]
#
# Phases:
#   b1  - Knowledge bundle verify (deploy is UI-only)
#   b2  - Search index creation
#   b3  - Vector search queries
#   a0  - Doctor / connectivity check
#   a1  - Ingest Salesforce data (Sales bundle verify + Case stream)
#   a2  - Ingest external data (Redshift zero-copy)
#   a3  - Data ingestion verification
#   a4  - Identity Resolution
#   a6  - Calculated Insights
#   a7  - Data Graphs
#   a9  - Segmentation
#   all - Run all phases in order (default)
#
# Examples:
#   ./workshop-e2e.sh --org d360-badge --phase a2
#   ./workshop-e2e.sh --org d360-unstructured-badge --phase b2
#   ./workshop-e2e.sh --org d360-badge --phase all --dry-run
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DEFS="${SCRIPT_DIR}/definitions"

# Use global sf binary (linked to local plugin code via `sf plugins link .`)
# Override with SF env var to use a different binary (e.g. SF=./bin/dev.js)
SF="${SF:-sf}"

# Defaults
ORG="${ORG:-d360-badge}"
PHASE="all"
DRY_RUN=false

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --org)   ORG="$2"; shift 2 ;;
    --phase) PHASE="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

# Helpers
run() {
  echo ""
  echo ">>> $*"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "    [DRY RUN — skipped]"
  else
    "$@"
  fi
}

banner() {
  echo ""
  echo "============================================================"
  echo "  $1"
  echo "============================================================"
}

pause() {
  if [[ "$DRY_RUN" == "false" ]]; then
    echo ""
    echo "--- $1 ---"
    read -rp "Press Enter to continue (or Ctrl+C to abort)..."
  fi
}

# =============================================================================
# Phase A0: Doctor / Connectivity Check
# =============================================================================
phase_a0() {
  banner "A0: Doctor — Connectivity Check"
  run "$SF" data360 doctor -o "$ORG"
}

# =============================================================================
# Phase A1: Ingest Salesforce Data (Module 01)
# =============================================================================
phase_a1() {
  banner "A1: Ingest Salesforce Data"

  echo "-- A1a: Verify Sales Data Bundle --"
  echo "    NOTE: data-kit status is per-component and needs an org-specific component name."
  echo "    Run manually: $SF data360 data-kit status -o $ORG --name Sales --component <component>"

  echo ""
  echo "-- A1b: Cleanup Phone Mappings (Contact HomePhone -> E164, Lead Phone -> E164) --"
  echo "    NOTE: Requires existing mapping IDs. List mappings first:"
  run "$SF" data360 dmo mapping-list -o "$ORG"
  echo "    Then update via: $SF data360 dmo mapping-update-field -o $ORG -f definitions/cleanup-*.json"
  echo "    (Mapping cleanup definition files are org-specific — create after listing.)"

  echo ""
  echo "-- A1c: Load Case Data Stream --"
  run "$SF" data360 data-stream create-from-object -o "$ORG" \
    --object Case --category Engagement --event-date-field CreatedDate

  echo ""
  echo "-- A1d: Map Case -> Case DMO --"
  run "$SF" data360 dmo map-to-canonical -o "$ORG" \
    --dlo Case_Home__dll --dmo ssot__Case__dlm --dry-run
  run "$SF" data360 dmo map-to-canonical -o "$ORG" \
    --dlo Case_Home__dll --dmo ssot__Case__dlm \
    --map "Status__c=ssot__CaseStatus__c,AccountId__c=ssot__AccountId__c,ContactId__c=ssot__IndividualId__c"

  echo ""
  echo "-- A1e: Verify --"
  run "$SF" data360 data-stream list -o "$ORG"
  run "$SF" data360 dlo list -o "$ORG"
  run "$SF" data360 query sql -o "$ORG" --sql 'SELECT COUNT(*) FROM "Case_Home__dll"'
}

# =============================================================================
# Phase A2: Ingest External Data — Redshift Zero-Copy (Module 02)
# =============================================================================
phase_a2() {
  banner "A2: Ingest External Data — Redshift Zero-Copy"

  echo "-- A2a: Create Redshift Connection --"
  run "$SF" data360 connection create -o "$ORG" -f "${DEFS}/redshift-connection.json"

  pause "Test the Redshift connection in the UI before proceeding"

  echo ""
  echo "-- A2b: Attendance stream (zero-copy, acceleration OFF) --"
  run "$SF" data360 data-stream create -o "$ORG" -f "${DEFS}/attendance-stream.json"

  echo ""
  echo "-- A2c: Attendee stream (accelerated, weekly refresh) --"
  run "$SF" data360 data-stream create -o "$ORG" -f "${DEFS}/attendee-stream.json"

  pause "Wait for data streams to finish initial ingestion"

  echo ""
  echo "-- A2d: Map Attendee -> Individual + Contact Point Email --"
  run "$SF" data360 dmo mapping-create -o "$ORG" -f "${DEFS}/attendee-individual-mapping.json"
  run "$SF" data360 dmo mapping-create -o "$ORG" -f "${DEFS}/attendee-email-mapping.json"

  echo ""
  echo "-- A2e: Custom Attendance DMO + Mapping + Relationship --"
  run "$SF" data360 dmo create -o "$ORG" -f "${DEFS}/attendance-dmo.json"
  run "$SF" data360 dmo mapping-create -o "$ORG" -f "${DEFS}/attendance-dmo-mapping.json"
  run "$SF" data360 dmo relationship-create -o "$ORG" -f "${DEFS}/attendance-relationship.json"
}

# =============================================================================
# Phase A3: Data Ingestion Recap / Verification (Module 03)
# =============================================================================
phase_a3() {
  banner "A3: Data Ingestion Verification"

  run "$SF" data360 data-stream list -o "$ORG" --all
  run "$SF" data360 dlo list -o "$ORG" --all
  run "$SF" data360 query sql -o "$ORG" \
    --sql 'SELECT * FROM "Attendance__dlm" LIMIT 10'
  run "$SF" data360 query sql -o "$ORG" \
    --sql "SELECT * FROM \"ssot__Individual__dlm\" WHERE \"ssot__LastName__c\" = 'Bailey'"
}

# =============================================================================
# Phase A4: Identity Resolution (Module 04)
# =============================================================================
phase_a4() {
  banner "A4: Identity Resolution"

  run "$SF" data360 identity-resolution create -o "$ORG" \
    -f "${DEFS}/identity-resolution-main.json"

  echo ""
  echo "Running identity resolution (this takes ~15 minutes)..."
  run "$SF" data360 identity-resolution run -o "$ORG" --name Main

  pause "Wait for Identity Resolution to complete (~15 min)"

  echo ""
  echo "-- Verify: Bailey unified records --"
  run "$SF" data360 query sql -o "$ORG" --sql \
    "SELECT ui.\"ssot__FirstName__c\", ui.\"ssot__LastName__c\", ui.\"ssot__Id__c\", link.\"ssot__DataSourceId__c\" FROM \"UnifiedIndividual__dlm\" AS ui JOIN \"IndividualIdentityLink__dlm\" AS link ON ui.\"ssot__Id__c\" = link.\"UnifiedRecordId__c\" WHERE ui.\"ssot__LastName__c\" = 'Bailey'"
}

# =============================================================================
# Phase A5: CRM Enrichment (Module 05) — UI-only, skip
# =============================================================================

# =============================================================================
# Phase A6: Calculated Insights (Module 06)
# =============================================================================
phase_a6() {
  banner "A6: Calculated Insights — Avg Engagement Score"

  run "$SF" data360 calculated-insight create -o "$ORG" \
    -f "${DEFS}/avg-engagement-score-ci.json"

  echo ""
  echo "Running calculated insight..."
  run "$SF" data360 calculated-insight run -o "$ORG" \
    --name Unified_Individual_Avg_Engagement_Score

  pause "Wait for CI to finish processing"

  echo ""
  echo "-- Verify --"
  run "$SF" data360 query sql -o "$ORG" \
    --sql 'SELECT * FROM "Unified_Individual_Avg_Engagement_Score__cio" LIMIT 10'
}

# =============================================================================
# Phase A7: Data Graphs (Module 07)
# =============================================================================
phase_a7() {
  banner "A7: Data Graphs — Individual Case and Attendance"

  run "$SF" data360 data-graph create -o "$ORG" \
    -f "${DEFS}/individual-case-attendance-dg.json"

  echo ""
  echo "Building data graph (Monthly refresh)..."
  run "$SF" data360 data-graph refresh -o "$ORG" \
    --name Individual_Case_and_Attendance

  pause "Wait for Data Graph to finish building"

  echo ""
  echo "-- Verify metadata --"
  run "$SF" data360 data-graph metadata -o "$ORG" \
    --name Individual_Case_and_Attendance

  echo ""
  echo "-- Verify data (replace <unified-id> with Lauren Bailey's ID) --"
  echo "    $SF data360 data-graph data -o $ORG --name Individual_Case_and_Attendance --id <unified-id>"
}

# =============================================================================
# Phase A8: Explore Data (Module 08) — verification queries
# =============================================================================
phase_a8() {
  banner "A8: Explore Data — Verification Queries"

  run "$SF" data360 dlo get -o "$ORG" --name Attendance__dll
  run "$SF" data360 query sql -o "$ORG" --sql 'SELECT * FROM "Attendance__dlm" LIMIT 10'
  run "$SF" data360 query sql -o "$ORG" \
    --sql 'SELECT * FROM "Unified_Individual_Avg_Engagement_Score__cio" LIMIT 10'
  echo ""
  echo "Data graph query (replace <lauren-id>):"
  echo "    $SF data360 data-graph data -o $ORG --name Individual_Case_and_Attendance --id <lauren-id>"
}

# =============================================================================
# Phase A9: Segmentation (Module 09)
# =============================================================================
phase_a9() {
  banner "A9: Segmentation — Highly Engaged but Low Feedback"

  run "$SF" data360 segment create -o "$ORG" \
    -f "${DEFS}/highly-engaged-low-feedback-segment.json"

  echo ""
  echo "Publishing segment..."
  run "$SF" data360 segment publish -o "$ORG" \
    --name Highly_Engaged_but_Low_Feedback

  pause "Wait for segment to finish publishing"

  echo ""
  echo "-- Verify --"
  run "$SF" data360 segment count -o "$ORG" \
    --name Highly_Engaged_but_Low_Feedback
  run "$SF" data360 segment members -o "$ORG" \
    --name Highly_Engaged_but_Low_Feedback
}

# =============================================================================
# Phase B1: Knowledge Bundle Verify (Module — Part B)
# =============================================================================
phase_b1() {
  banner "B1: Knowledge Bundle — Deploy via UI, Verify via CLI"

  echo "NOTE: Deploy the Knowledge data bundle manually:"
  echo "  Data Cloud -> Data Streams -> New -> Salesforce CRM -> Knowledge data bundle -> Deploy"
  pause "Deploy the Knowledge bundle in the UI, then press Enter"

  run "$SF" data360 data-stream list -o "$ORG"
  run "$SF" data360 dlo list -o "$ORG"
  run "$SF" data360 query sql -o "$ORG" \
    --sql 'SELECT COUNT(*) FROM "KnowledgeArticleVersion_Home__dll"'
}

# =============================================================================
# Phase B2: Search Index Creation
# =============================================================================
phase_b2() {
  banner "B2: Search Index — Vector Search on Knowledge Articles"

  echo "-- Check search index config --"
  run "$SF" data360 search-index config -o "$ORG"

  echo ""
  echo "-- Create search index --"
  run "$SF" data360 search-index create -o "$ORG" \
    -f "${DEFS}/knowledge-search-index.json"

  echo ""
  echo "Waiting for search index to become Ready (Submitted -> In Progress -> Ready)..."
  echo "Monitor with: $SF data360 search-index get -o $ORG --name My_kav"

  pause "Wait for search index status to be Ready"

  run "$SF" data360 search-index get -o "$ORG" --name My_kav
  run "$SF" data360 search-index list -o "$ORG"
}

# =============================================================================
# Phase B3: Vector Search Queries
# =============================================================================
phase_b3() {
  banner "B3: Vector Search Queries"

  run "$SF" data360 query vector -o "$ORG" \
    --index My_kav --query "how to reset password" --limit 5
  run "$SF" data360 query vector -o "$ORG" \
    --index My_kav --query "return policy" --limit 5

  echo ""
  echo "-- Verify chunk and index DMOs --"
  run "$SF" data360 query sql -o "$ORG" \
    --sql 'SELECT * FROM "My_kav_chunk__dlm" LIMIT 5'
  run "$SF" data360 query sql -o "$ORG" \
    --sql 'SELECT * FROM "My_kav_index__dlm" LIMIT 5'
}

# =============================================================================
# Phase Router
# =============================================================================
run_phase() {
  case "$1" in
    a0)  phase_a0 ;;
    a1)  phase_a1 ;;
    a2)  phase_a2 ;;
    a3)  phase_a3 ;;
    a4)  phase_a4 ;;
    a6)  phase_a6 ;;
    a7)  phase_a7 ;;
    a8)  phase_a8 ;;
    a9)  phase_a9 ;;
    b1)  phase_b1 ;;
    b2)  phase_b2 ;;
    b3)  phase_b3 ;;
    all)
      # Part B first (vectorization is priority)
      phase_a0
      phase_b1
      phase_b2
      phase_b3
      # Then Part A
      phase_a1
      phase_a2
      phase_a3
      phase_a4
      phase_a6
      phase_a7
      phase_a8
      phase_a9
      ;;
    *) echo "Unknown phase: $1"; exit 1 ;;
  esac
}

echo "============================================================"
echo "  GPS Data 360 Workshop — E2E Test"
echo "  Org:   $ORG"
echo "  Phase: $PHASE"
echo "  Dry:   $DRY_RUN"
echo "============================================================"

run_phase "$PHASE"

banner "DONE"
echo "Workshop E2E test complete for phase: $PHASE"
