WHAT IS A DMO?

    A Data Model Object (DMO) is the canonical schema in Data Cloud.
    Think of it as the "target table" that holds harmonized data from
    one or more sources.

    Raw data arrives in a DLO (Data Lake Object) — one per source.
    A DMO is the unified view that multiple DLOs map into.

    Example:
      Contact (CRM) → Contact_Home__dll (DLO) → ssot__Individual__dlm (DMO)
      Lead (CRM)    → Lead_Home__dll (DLO)    → ssot__Individual__dlm (DMO)

    Both Contact and Lead data end up in the same Individual DMO.

WHERE IT FITS

    Connect → Prepare → [HARMONIZE & UNIFY] → Segment → Act
                              ↑ you are here

    DLOs live in Prepare. DMOs live in Harmonize.
    Field mappings connect DLO fields → DMO fields.

KEY TERMS

    DMO         Data Model Object — canonical schema (suffix: __dlm)
    DLO         Data Lake Object — raw ingested data (suffix: __dll)
    Standard    Pre-built DMOs: ssot__Individual__dlm, ssot__Account__dlm, etc.
    Custom      Your own DMOs for objects not in the standard model
    Mapping     Links a DLO field to a DMO field (source → target)
    Relationship  Links two DMOs (e.g., Order ManyToOne Individual)

STANDARD vs CUSTOM DMOs

    Standard DMOs (1000+ in the catalog):
      ssot__Individual__dlm         Person/Contact
      ssot__Account__dlm            Company/Account
      ssot__SalesOrder__dlm         Orders
      ssot__Case__dlm               Service Cases
      ssot__ContactPointEmail__dlm  Email addresses
      ssot__ContactPointPhone__dlm  Phone numbers

    Custom DMOs (you create these):
      Attendance__dlm               Workshop attendance
      Loyalty_Member__dlm           Loyalty program data

    Standard DMOs have pre-defined fields with ssot__ prefix.
    Custom DMOs have fields you define.

FIELD NAMING (CRITICAL)

    This is the #1 source of errors in Data Cloud:

    ┌─────────────────────┬──────────────────┬────────────────────┐
    │ Layer               │ Convention       │ Example            │
    ├─────────────────────┼──────────────────┼────────────────────┤
    │ Salesforce Object   │ Double __c       │ Customer_ID__c     │
    │ DLO field           │ Single _c        │ Customer_ID_c      │
    │ Custom DMO field    │ Double __c on DLO│ Customer_ID_c__c   │
    │ Standard DMO field  │ ssot__ prefix    │ ssot__PartyId__c   │
    └─────────────────────┴──────────────────┴────────────────────┘

    The CRM field Customer_ID__c becomes Customer_ID_c in the DLO,
    then Customer_ID_c__c in a custom DMO field definition.

    Standard DMO fields always start with ssot__ (e.g., ssot__FirstName__c).

HOW MAPPINGS WORK

    A mapping connects one DLO to one DMO, field by field:

    Contact_Home__dll           ssot__Individual__dlm
    ─────────────────           ─────────────────────
    Id__c                  →    ssot__Id__c
    Id__c                  →    ssot__PartyId__c       (yes, same source, two targets)
    FirstName__c           →    ssot__FirstName__c
    LastName__c            →    ssot__LastName__c
    Email__c               →    ssot__EmailAddress__c  (name differs!)

    One DLO field CAN map to multiple DMO fields (e.g., Id → both Id and PartyId).
    Use --dry-run to preview before creating:

      sf data360 dmo map-to-canonical -o <org> \
        --dlo Contact_Home__dll --dmo ssot__Individual__dlm --dry-run

COMMON MISTAKES

    1. Using dmo list without --all
       Default returns only 50 DMOs. The catalog has 1000+.
       Unified DMOs from identity resolution are often past position 50.
       Always: sf data360 dmo list --all -o <org>

    2. Confusing DLO and DMO field names
       DLO: Customer_ID_c (single _c)
       DMO: Customer_ID_c__c (double __c)
       Standard: ssot__PartyId__c (ssot__ prefix)

    3. Looking for "dmo describe"
       There is no dmo describe command. Use:
       sf data360 query describe -o <org> --table ssot__Individual__dlm

    4. Trying to rename DLO field labels after creation
       Labels are immutable (Apache Spark limitation). Get them right the first time.

TRY IT

    # List all DMOs (use --all!)
    sf data360 dmo list --all -o <org> 2>/dev/null

    # Get a specific DMO with all its fields
    sf data360 dmo get -o <org> --name ssot__Individual__dlm 2>/dev/null

    # Describe the schema (column names + types)
    sf data360 query describe -o <org> --table ssot__Individual__dlm 2>/dev/null

    # See field mappings from a DLO to this DMO
    sf data360 dmo mapping-list -o <org> \
      --source Contact_Home__dll --target ssot__Individual__dlm 2>/dev/null

    # Preview auto-matching before creating a mapping
    sf data360 dmo map-to-canonical -o <org> \
      --dlo Contact_Home__dll --dmo ssot__Individual__dlm --dry-run 2>/dev/null

    # Count records in the DMO
    sf data360 query sql -o <org> \
      --sql 'SELECT COUNT(*) FROM "ssot__Individual__dlm"' 2>/dev/null

SEE ALSO

    sf data360 man concepts field-naming     Field naming conventions deep dive
    sf data360 man concepts pipeline         How DMOs fit in the full pipeline
    sf data360 man concepts identity-resolution   How DMOs become unified profiles
    sf data360 man dmo list                  Command reference
    sf data360 man dmo mapping-list          Command reference
    sf data360 man dmo map-to-canonical      Command reference
