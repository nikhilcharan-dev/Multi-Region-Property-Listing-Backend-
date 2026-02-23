# Conflict Resolution Strategy

## Overview

In a distributed multi-region system, concurrent updates to the same
resource can lead to data conflicts. This project uses **Optimistic
Concurrency Control (OCC)** to detect and prevent conflicting writes.

The system does not automatically merge conflicting updates. Instead, it
rejects conflicting requests and requires the client to retry with the
latest version of the resource.

------------------------------------------------------------------------

## Why Optimistic Locking?

In distributed systems:

-   Network latency makes synchronous cross-region locking impractical
-   Distributed locks reduce availability
-   High write latency degrades user experience

Optimistic locking allows: - High availability - Low write latency -
Simple and predictable conflict detection

------------------------------------------------------------------------

## How It Works

Each property record contains a `version` column.

Example:

  id   price    version
  ---- -------- ---------
  1    500000   1

When updating a property, the client must include the current version.

### Update Query

UPDATE properties SET price = ?, version = version + 1, updated_at =
NOW() WHERE id = ? AND version = ?;

If: - The version matches → update succeeds - The version does not match
→ no rows updated → conflict detected

------------------------------------------------------------------------

## Conflict Detection

If the update affects 0 rows:

The API returns:

HTTP 409 Conflict

{ "error": "Version conflict" }

This indicates another client has already modified the record.

------------------------------------------------------------------------

## Client Resolution Strategy

When a 409 Conflict occurs, the client should:

1.  Re-fetch the latest version of the property
2.  Apply changes again
3.  Retry the update using the new version number

This ensures data integrity without requiring distributed locks.

------------------------------------------------------------------------

## Cross-Region Conflict Handling

Since updates are replicated asynchronously via Kafka:

-   Conflicts are resolved locally before publishing
-   Replicated updates contain the full new state
-   Consumers apply the latest version directly

Because the version is incremented before publishing, replicated writes
remain consistent across regions.

------------------------------------------------------------------------

## Why Not Automatic Merging?

Automatic merge strategies can: - Introduce complex business logic -
Lead to unintended data overwrites - Create unpredictable system
behavior

For real estate listings, deterministic rejection (409) is safer and
easier to reason about.

------------------------------------------------------------------------

## Consistency Model

This system provides:

-   Strong consistency within a region
-   Eventual consistency across regions
-   Deterministic conflict rejection

------------------------------------------------------------------------

## Summary

The conflict resolution strategy ensures:

-   No lost updates
-   No distributed locks
-   High availability
-   Clear client-side resolution path

This approach mirrors real-world distributed systems used in globally
deployed applications.
