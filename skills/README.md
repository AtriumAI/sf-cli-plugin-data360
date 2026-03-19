# Data Cloud Skills for Claude Code

7 skills mapping 1:1 to the [Data Cloud Reference Architecture](https://architect.salesforce.com/diagrams/data-cloud-reference-architecture):

```
Connect → Prepare → Harmonize & Unify → Segment, Analyze & Predict → Act
                              ↑
                          Retrieve (cross-cutting)
                              ↑
                       sf-data360 (orchestrator)
```

## Skills

| Skill                  | Phase                      | What it does                                                    |
| ---------------------- | -------------------------- | --------------------------------------------------------------- |
| `sf-data360`           | Orchestrator               | Multi-phase pipelines, data spaces, data kits, recipes          |
| `sf-data360-connect`   | Connect                    | Connections, connectors, connector metadata                     |
| `sf-data360-prepare`   | Prepare                    | Data streams, DLOs, transforms, Document AI                     |
| `sf-data360-harmonize` | Harmonize & Unify          | DMOs, mappings, relationships, identity resolution, data graphs |
| `sf-data360-segment`   | Segment, Analyze & Predict | Segments, calculated insights, ML predictions                   |
| `sf-data360-act`       | Act                        | Activations, data actions, data shares                          |
| `sf-data360-retrieve`  | Retrieve                   | SQL queries, vector search, async queries, search indexes       |

## Installation

```bash
# Install the CLI plugin first
sf plugins install @gthoppae/plugin-data360

# Then install skills (symlink into Claude Code skills directory)
for skill in sf-data360 sf-data360-connect sf-data360-prepare sf-data360-harmonize sf-data360-segment sf-data360-act sf-data360-retrieve; do
  ln -sf "$(pwd)/$skill" ~/.claude/skills/$skill
done
```

## Prerequisites

- Salesforce CLI (`sf`) installed
- `plugin-data360` installed or linked
- Target org authenticated: `sf org login web -a <alias>`
- Data Cloud provisioned on the org
