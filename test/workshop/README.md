# GPS Data 360 Hands-On Workshop — CLI E2E Test

End-to-end test of the `sf data360` plugin (192 commands) against the 9-module GPS workshop.

## Target Orgs

| Org Alias                 | Purpose                                                                       |
| ------------------------- | ----------------------------------------------------------------------------- |
| `d360-badge`              | Part A — Workshop modules 01-09 (Sales bundle, Redshift, IR, CI, DG, Segment) |
| `d360-unstructured-badge` | Part B — Knowledge bundle, Search Index, Vector Search                        |

## CLI vs UI-Only Operations

| Module                 | CLI Automatable                                 | UI-Only                                                            |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| 00 Prework             | `doctor`                                        | SDO setup, Einstein, Data Cloud provisioning, Sales bundle install |
| 01 Ingest SF Data      | Case stream, DMO mapping, phone cleanup         | Sales Data Bundle deploy                                           |
| 02 Ingest External     | Connection, streams, DMO, mapping, relationship | Connection test UI                                                 |
| 03 Ingestion Recap     | All queries                                     | —                                                                  |
| 04 Identity Resolution | Create, run, verify                             | —                                                                  |
| 05 CRM Enrichment      | —                                               | Related list, Lightning page edits                                 |
| 06 Calculated Insights | Create, run, verify                             | —                                                                  |
| 07 Data Graphs         | Create, refresh, verify                         | —                                                                  |
| 08 Explore Data        | All queries                                     | —                                                                  |
| 09 Segmentation        | Create, publish, count, members                 | —                                                                  |
| B1 Knowledge           | Verify queries                                  | Knowledge bundle deploy                                            |
| B2 Search Index        | Create, monitor, list                           | —                                                                  |
| B3 Vector Search       | Query, SQL verify                               | —                                                                  |
| B4 Retriever/Agent     | —                                               | Setup UI, Metadata API (`sf project deploy`)                       |

## Quick Start

```bash
# Verify connectivity
./workshop-e2e.sh --org d360-badge --phase a0

# Dry run (prints commands without executing)
./workshop-e2e.sh --org d360-badge --phase all --dry-run

# Run a specific phase
./workshop-e2e.sh --org d360-badge --phase a2

# Run verification queries
./verify.sh --org d360-badge
```

## Phases

| Phase | Module  | Description                                                                    |
| ----- | ------- | ------------------------------------------------------------------------------ |
| `a0`  | Prework | Doctor connectivity check                                                      |
| `a1`  | 01      | Sales bundle verify, Case stream + mapping                                     |
| `a2`  | 02      | Redshift connection, Attendance/Attendee streams, DMO + mapping + relationship |
| `a3`  | 03      | Data ingestion verification queries                                            |
| `a4`  | 04      | Identity Resolution create + run (~15 min)                                     |
| `a6`  | 06      | Calculated Insight: avg engagement score                                       |
| `a7`  | 07      | Data Graph: Individual + CI + Case + Attendance                                |
| `a8`  | 08      | Explore Data verification queries                                              |
| `a9`  | 09      | Segment: highly engaged + low feedback                                         |
| `b1`  | B1      | Knowledge bundle verify (deploy via UI)                                        |
| `b2`  | B2      | Search index creation (vector)                                                 |
| `b3`  | B3      | Vector search queries                                                          |
| `all` | All     | Run B first (vectorization priority), then A                                   |

## Definition Files

All JSON payloads derived from the [Python Demo Builder](~/Downloads/d360-demo-builder-main/) patterns:

| File                                       | API Resource                                        | Source                            |
| ------------------------------------------ | --------------------------------------------------- | --------------------------------- |
| `redshift-connection.json`                 | `POST /ssot/connections`                            | Workshop doc                      |
| `attendance-stream.json`                   | `POST /ssot/data-streams`                           | `create_all_poc_streams.py`       |
| `attendee-stream.json`                     | `POST /ssot/data-streams`                           | `create_all_poc_streams.py`       |
| `attendance-dmo.json`                      | `POST /ssot/data-model-objects`                     | `create_poc_dmos_and_mappings.py` |
| `attendance-dmo-mapping.json`              | `POST /ssot/data-model-object-mappings`             | `create_poc_dmos_and_mappings.py` |
| `attendee-individual-mapping.json`         | `POST /ssot/data-model-object-mappings`             | Workshop doc                      |
| `attendee-email-mapping.json`              | `POST /ssot/data-model-object-mappings`             | Workshop doc                      |
| `attendance-relationship.json`             | `POST /ssot/data-model-objects/{dmo}/relationships` | `create_dmo_relationships.py`     |
| `identity-resolution-main.json`            | `POST /ssot/identity-resolutions`                   | `create_identity_resolution.py`   |
| `avg-engagement-score-ci.json`             | `POST /ssot/calculated-insights`                    | `create_lifetime_value_ci.py`     |
| `individual-case-attendance-dg.json`       | `POST /ssot/data-graphs`                            | `create_data_graph.py`            |
| `highly-engaged-low-feedback-segment.json` | `POST /ssot/segments`                               | `create_no_purchase_segment.py`   |
| `knowledge-search-index.json`              | `POST /ssot/search-index`                           | Postman collection                |

## Key Risks

- **Redshift creds** (`gps_workshop_user / 0copyAug2025`) may expire — test connection early
- **d360-badge** already has IR/CI/Segment from Trailhead — workshop creates new ones with different names
- **Wait times**: IR ~15 min, CI ~5 min, Data Graph ~5 min, Search Index ~10 min
- **Module 05** (CRM Enrichment) is entirely UI-only
- **Retrievers/Prompt Templates/Agentforce** not in plugin scope — document as gap

## Payload Notes

- **IR rulesets**: `matchRules[].criteria[].matchMethodType` = `fuzzy` / `exact` / `exactnormalized`
- **CIs**: SQL-based (`definitionType: "CALCULATED_METRIC"`, `expression: "SELECT ..."`)
- **Segments**: SQL-based DBT model (`segmentType: "Dbt"`, `includeDbt.models.models[].sql`)
- **Data Graphs**: Nested `sourceObject.relatedObjects` with `recencyCriteria` for time filters
- **Relationships**: `cardinality: "ManyToOne"`, `relationshipOwner: "DataCloud"`
- **Search Index**: e5_large_v2 embeddings, HNSW index, COSINE similarity, passage_extraction chunking
