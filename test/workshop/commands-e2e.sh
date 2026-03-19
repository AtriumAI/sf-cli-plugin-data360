#!/usr/bin/env bash
# =============================================================================
# Plugin Commands E2E Test — Tests untested commands against live org
# =============================================================================
#
# Usage:
#   ./commands-e2e.sh [--org <alias>] [--topic <topic>] [--dry-run]
#
# Topics: transform, docai, connection, data-space, query-async,
#         profile, insight, metadata, data-stream-crud, dlo-crud,
#         dmo-crud, segment-crud, activation, search-index-crud, all
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SF="${SF:-sf}"
ORG="${ORG:-wh}"
TOPIC="all"
DRY_RUN=false
PASS=0
FAIL=0
SKIP=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --org)   ORG="$2"; shift 2 ;;
    --topic) TOPIC="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

run() {
  local desc="$1"; shift
  echo ""
  echo "  TEST: $desc"
  echo "  CMD:  $*"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "  [DRY RUN]"
    ((SKIP++))
    return 0
  fi
  local output
  if output=$("$@" 2>&1); then
    echo "  PASS"
    ((PASS++))
    return 0
  else
    echo "  FAIL: $output" | head -3
    ((FAIL++))
    return 1
  fi
}

run_expect_fail() {
  local desc="$1"; shift
  echo ""
  echo "  TEST (expect error): $desc"
  echo "  CMD:  $*"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "  [DRY RUN]"
    ((SKIP++))
    return 0
  fi
  local output
  if output=$("$@" 2>&1); then
    echo "  UNEXPECTED PASS — expected failure"
    ((FAIL++))
    return 1
  else
    echo "  PASS (got expected error)"
    ((PASS++))
    return 0
  fi
}

banner() {
  echo ""
  echo "============================================================"
  echo "  $1"
  echo "============================================================"
}

# =============================================================================
# Transform (13 commands)
# =============================================================================
test_transform() {
  banner "TRANSFORM (13 commands)"

  run "transform list" \
    "$SF" data360 transform list -o "$ORG"

  run "transform get" \
    "$SF" data360 transform get -o "$ORG" --name StaticCurrencyRatesTransform_Home

  run "transform history" \
    "$SF" data360 transform history -o "$ORG" --name StaticCurrencyRatesTransform_Home

  run "transform schedule-get" \
    "$SF" data360 transform schedule-get -o "$ORG" --name StaticCurrencyRatesTransform_Home

  run "transform refresh-status" \
    "$SF" data360 transform refresh-status -o "$ORG" --name StaticCurrencyRatesTransform_Home

  # Write operations — test with caution
  run "transform validate (expect pass or informative error)" \
    "$SF" data360 transform validate -o "$ORG" --name StaticCurrencyRatesTransform_Home || true

  # Skip destructive: create, delete, update, run, cancel, retry, schedule-set
  echo "  SKIPPED: create, delete, update, run, cancel, retry, schedule-set (destructive)"
  ((SKIP+=7))
}

# =============================================================================
# DocAI (9 commands)
# =============================================================================
test_docai() {
  banner "DOCAI (9 commands)"

  run "docai config-list" \
    "$SF" data360 docai config-list -o "$ORG"

  run "docai config-get" \
    "$SF" data360 docai config-get -o "$ORG" --name test_insurance_policy

  run "docai global-config" \
    "$SF" data360 docai global-config -o "$ORG"

  run "docai generate-schema" \
    "$SF" data360 docai generate-schema -o "$ORG" --name test_insurance_policy || true

  # Skip: config-create, config-delete, config-update, config-run, extract (need files/payloads)
  echo "  SKIPPED: config-create, config-delete, config-update, config-run, extract (need payloads)"
  ((SKIP+=5))
}

# =============================================================================
# Connection (23 commands) — read-only inspection
# =============================================================================
test_connection() {
  banner "CONNECTION (23 commands)"

  run "connector-list" \
    "$SF" data360 connection connector-list -o "$ORG"

  run "connector-get (SalesforceDotCom)" \
    "$SF" data360 connection connector-get -o "$ORG" --name SalesforceDotCom || true

  # connection list requires connectorType — test the error
  run_expect_fail "connection list (no connector type — known bug E5)" \
    "$SF" data360 connection list -o "$ORG"

  run "connection test (SalesforceDotCom_Home)" \
    "$SF" data360 connection test -o "$ORG" --name SalesforceDotCom_Home || true

  run "connection get" \
    "$SF" data360 connection get -o "$ORG" --name SalesforceDotCom_Home || true

  run "connection objects" \
    "$SF" data360 connection objects -o "$ORG" --name SalesforceDotCom_Home || true

  run "connection databases" \
    "$SF" data360 connection databases -o "$ORG" --name SalesforceDotCom_Home || true

  # Skip: create, delete, update, replace, run, endpoints, fields, preview,
  #        schema-get/upsert, sitemap-get/upsert, test-existing, run-existing,
  #        test-schema, database-schemas
  echo "  SKIPPED: create, delete, update, replace, run, endpoints, fields, preview, schema/sitemap, test-existing, run-existing, test-schema, database-schemas (need specific setup)"
  ((SKIP+=16))
}

# =============================================================================
# Data Space (7 commands)
# =============================================================================
test_data_space() {
  banner "DATA-SPACE (7 commands)"

  run "data-space list" \
    "$SF" data360 data-space list -o "$ORG"

  run "data-space get" \
    "$SF" data360 data-space get -o "$ORG" --name default

  run "data-space members" \
    "$SF" data360 data-space members -o "$ORG" --name default || true

  run "data-space member-get" \
    "$SF" data360 data-space member-get -o "$ORG" --name default || true

  # Skip: create, update, members-upsert (write operations)
  echo "  SKIPPED: create, update, members-upsert (write operations)"
  ((SKIP+=3))
}

# =============================================================================
# Query Async (4 commands) + describe
# =============================================================================
test_query_async() {
  banner "QUERY ASYNC (5 commands)"

  run "query describe" \
    "$SF" data360 query describe -o "$ORG" --table Account_Home__dll

  # sql-v1 and sqlv2 are POST endpoints — need definition file with SQL
  run "query sql-v1 (via stdin)" \
    bash -c 'echo "{\"sql\":\"SELECT COUNT(*) FROM \\\"Account_Home__dll\\\"\"}" | '"$SF"' data360 query sql-v1 -o '"$ORG"' -f -'

  run "query sqlv2 (via stdin)" \
    bash -c 'echo "{\"sql\":\"SELECT COUNT(*) FROM \\\"Account_Home__dll\\\"\"}" | '"$SF"' data360 query sqlv2 -o '"$ORG"' -f -'

  # v2-batch needs --name (job ID) — skip without a real job
  echo "  SKIPPED: v2-batch (needs job ID from sqlv2)"
  ((SKIP+=1))

  # Async: create via definition file
  run "query async-create (via stdin)" \
    bash -c 'echo "{\"sql\":\"SELECT COUNT(*) FROM \\\"Account_Home__dll\\\"\"}" | '"$SF"' data360 query async-create -o '"$ORG"' -f -'

  # async-status, async-rows, async-cancel need a job ID from async-create
  echo "  SKIPPED: async-status, async-rows, async-cancel (need job ID from async-create)"
  ((SKIP+=3))
}

# =============================================================================
# Profile (5 commands)
# =============================================================================
test_profile() {
  banner "PROFILE (5 commands)"

  run "profile metadata" \
    "$SF" data360 profile metadata -o "$ORG"

  run "profile metadata-get" \
    "$SF" data360 profile metadata-get -o "$ORG" || true

  run "profile query" \
    "$SF" data360 profile query -o "$ORG" || true

  run "profile calculated-insight" \
    "$SF" data360 profile calculated-insight -o "$ORG" || true

  run "profile child" \
    "$SF" data360 profile child -o "$ORG" || true
}

# =============================================================================
# Insight (3 commands)
# =============================================================================
test_insight() {
  banner "INSIGHT (3 commands)"

  run "insight metadata" \
    "$SF" data360 insight metadata -o "$ORG"

  run "insight metadata-get" \
    "$SF" data360 insight metadata-get -o "$ORG" || true

  run "insight query" \
    "$SF" data360 insight query -o "$ORG" || true
}

# =============================================================================
# Metadata (3 commands)
# =============================================================================
test_metadata() {
  banner "METADATA (3 commands)"

  run "metadata get" \
    "$SF" data360 metadata get -o "$ORG"

  run "metadata insight-detail" \
    "$SF" data360 metadata insight-detail -o "$ORG" || true

  run "metadata profile-detail" \
    "$SF" data360 metadata profile-detail -o "$ORG" || true
}

# =============================================================================
# Data Stream CRUD (get, update, delete, run)
# =============================================================================
test_data_stream_crud() {
  banner "DATA-STREAM CRUD (4 commands)"

  run "data-stream get" \
    "$SF" data360 data-stream get -o "$ORG" --name Account_Home

  run "data-stream run" \
    "$SF" data360 data-stream run -o "$ORG" --name Account_Home || true

  # Skip: update, delete (destructive)
  echo "  SKIPPED: update, delete (destructive)"
  ((SKIP+=2))
}

# =============================================================================
# DLO CRUD (create, update, delete)
# =============================================================================
test_dlo_crud() {
  banner "DLO CRUD (3 commands)"

  run "dlo get" \
    "$SF" data360 dlo get -o "$ORG" --name Account_Home__dll

  run "dlo update" \
    "$SF" data360 dlo update -o "$ORG" || true

  # Skip: create, delete (destructive/need payload)
  echo "  SKIPPED: create, delete (need payload or destructive)"
  ((SKIP+=2))
}

# =============================================================================
# DMO CRUD (remaining untested)
# =============================================================================
test_dmo_crud() {
  banner "DMO CRUD (remaining commands)"

  run "dmo get" \
    "$SF" data360 dmo get -o "$ORG" --name ssot__Individual__dlm || true

  run "dmo mapping-list" \
    "$SF" data360 dmo mapping-list -o "$ORG" || true

  run "dmo relationship-list" \
    "$SF" data360 dmo relationship-list -o "$ORG" || true

  run "dmo create-from-dlo" \
    "$SF" data360 dmo create-from-dlo -o "$ORG" || true

  # Skip: delete, update, mapping-get, mapping-delete, mapping-delete-fields,
  #        mapping-update-field, relationship-delete (destructive/need IDs)
  echo "  SKIPPED: delete, update, mapping-get/delete/update, relationship-delete (need IDs)"
  ((SKIP+=7))
}

# =============================================================================
# Segment CRUD (remaining untested)
# =============================================================================
test_segment_crud() {
  banner "SEGMENT CRUD (remaining commands)"

  run "segment list" \
    "$SF" data360 segment list -o "$ORG"

  run "segment get" \
    "$SF" data360 segment get -o "$ORG" || true

  # Skip: delete, update, members, deactivate, deactivate-by-id (need existing segment)
  echo "  SKIPPED: delete, update, members, deactivate, deactivate-by-id (need segment)"
  ((SKIP+=5))
}

# =============================================================================
# Search Index CRUD (remaining: update)
# =============================================================================
test_search_index_crud() {
  banner "SEARCH-INDEX CRUD (remaining commands)"

  run "search-index get (ADL_GF_EAT_Docs)" \
    "$SF" data360 search-index get -o "$ORG" --name ADL_GF_EAT_Docs

  run "search-index config" \
    "$SF" data360 search-index config -o "$ORG"

  # Skip: update (need payload), create/delete tested already
  echo "  SKIPPED: update (need payload)"
  ((SKIP+=1))
}

# =============================================================================
# Activation (7 commands)
# =============================================================================
test_activation() {
  banner "ACTIVATION (7 commands)"

  run "activation list" \
    "$SF" data360 activation list -o "$ORG"

  run "activation platforms" \
    "$SF" data360 activation platforms -o "$ORG"

  # Skip: create, delete, get, update, data (need existing activation)
  echo "  SKIPPED: create, delete, get, update, data (need activation)"
  ((SKIP+=5))
}

# =============================================================================
# Activation Target (4 commands)
# =============================================================================
test_activation_target() {
  banner "ACTIVATION-TARGET (4 commands)"

  run "activation-target list" \
    "$SF" data360 activation-target list -o "$ORG"

  # Skip: create, get, update (need payload)
  echo "  SKIPPED: create, get, update (need payload)"
  ((SKIP+=3))
}

# =============================================================================
# Private Route (4 commands)
# =============================================================================
test_private_route() {
  banner "PRIVATE-ROUTE (4 commands)"

  run "private-route list" \
    "$SF" data360 private-route list -o "$ORG"

  # Skip: create, delete, get
  echo "  SKIPPED: create, delete, get"
  ((SKIP+=3))
}

# =============================================================================
# Data Action (2 commands)
# =============================================================================
test_data_action() {
  banner "DATA-ACTION (2 commands)"

  run "data-action list" \
    "$SF" data360 data-action list -o "$ORG"

  # Skip: create
  echo "  SKIPPED: create (need payload)"
  ((SKIP+=1))
}

# =============================================================================
# Data Action Target (5 commands)
# =============================================================================
test_data_action_target() {
  banner "DATA-ACTION-TARGET (5 commands)"

  run "data-action-target list" \
    "$SF" data360 data-action-target list -o "$ORG"

  # Skip: create, delete, get, generate-key
  echo "  SKIPPED: create, delete, get, generate-key (need setup)"
  ((SKIP+=4))
}

# =============================================================================
# Universal ID (1 command)
# =============================================================================
test_universal_id() {
  banner "UNIVERSAL-ID (1 command)"

  run_expect_fail "universal-id lookup (requires --name)" \
    "$SF" data360 universal-id lookup -o "$ORG"
}

# =============================================================================
# Phase Router
# =============================================================================
run_topic() {
  case "$1" in
    transform)        test_transform ;;
    docai)            test_docai ;;
    connection)       test_connection ;;
    data-space)       test_data_space ;;
    query-async)      test_query_async ;;
    profile)          test_profile ;;
    insight)          test_insight ;;
    metadata)         test_metadata ;;
    data-stream-crud) test_data_stream_crud ;;
    dlo-crud)         test_dlo_crud ;;
    dmo-crud)         test_dmo_crud ;;
    segment-crud)     test_segment_crud ;;
    search-index-crud) test_search_index_crud ;;
    activation)       test_activation ;;
    activation-target) test_activation_target ;;
    private-route)    test_private_route ;;
    data-action)      test_data_action ;;
    data-action-target) test_data_action_target ;;
    universal-id)     test_universal_id ;;
    all)
      test_transform
      test_docai
      test_connection
      test_data_space
      test_query_async
      test_profile
      test_insight
      test_metadata
      test_data_stream_crud
      test_dlo_crud
      test_dmo_crud
      test_segment_crud
      test_search_index_crud
      test_activation
      test_activation_target
      test_private_route
      test_data_action
      test_data_action_target
      test_universal_id
      ;;
    *) echo "Unknown topic: $1"; exit 1 ;;
  esac
}

echo "============================================================"
echo "  Plugin Commands E2E Test"
echo "  Org:   $ORG"
echo "  Topic: $TOPIC"
echo "  Dry:   $DRY_RUN"
echo "============================================================"

run_topic "$TOPIC"

echo ""
echo "============================================================"
echo "  RESULTS: $PASS passed, $FAIL failed, $SKIP skipped"
echo "============================================================"
