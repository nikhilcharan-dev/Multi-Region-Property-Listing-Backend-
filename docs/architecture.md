# Multi-Region Property Listing Backend --- Architecture

## Overview

This system simulates a globally distributed backend deployed across two
regions:

-   US Region
-   EU Region

Each region runs: - A stateless backend service - A PostgreSQL database
instance

NGINX acts as a global reverse proxy and performs routing and failover.
Kafka is used for asynchronous cross-region data replication.

------------------------------------------------------------------------

## High-Level Architecture

Client \| v NGINX Reverse Proxy \| \|---- /us/\* ---\> backend-us ---\>
db-us \| \|---- /eu/\* ---\> backend-eu ---\> db-eu \| v Kafka \| v
Cross-Region Consumer

------------------------------------------------------------------------

## Components

### 1. NGINX

Responsibilities: - Routes traffic based on path prefix (/us, /eu) -
Automatically fails over to the secondary region - Logs upstream
response times - Single public entry point

Failover logic: - /us/\* → backend-us (primary), backend-eu (backup) -
/eu/\* → backend-eu (primary), backend-us (backup)

------------------------------------------------------------------------

### 2. Backend Services (US & EU)

Each backend: - Is stateless - Connects to its local PostgreSQL
database - Publishes update events to Kafka - Consumes events from the
other region - Implements optimistic locking - Enforces idempotency via
X-Request-ID

------------------------------------------------------------------------

### 3. PostgreSQL (db-us, db-eu)

Each region has an independent database.

Schema includes: - properties - idempotency_keys

The `version` column enables optimistic locking. The `updated_at` column
enables replication lag calculation.

------------------------------------------------------------------------

### 4. Kafka (Event-Driven Replication)

Topic: property-updates

Write flow: 1. Property updated in US 2. Event published to Kafka 3. EU
consumer receives event 4. EU updates its local database

Consumers ignore messages originating from their own region.

This design: - Decouples regions - Improves write latency - Enables
eventual consistency

------------------------------------------------------------------------

## Data Consistency Model

This system uses: - Optimistic Concurrency Control - Eventual
Consistency

### Optimistic Locking

Each property has a `version` column.

Update succeeds only if: WHERE id = ? AND version = ?

If version mismatch: - Return 409 Conflict - Client must re-fetch and
retry

------------------------------------------------------------------------

## Idempotency

All PUT requests must include:

X-Request-ID

Behavior: - First request → processed normally - Duplicate request → 422
Unprocessable Entity

Stored in `idempotency_keys` table.

------------------------------------------------------------------------

## Replication Lag

Each backend tracks the last consumed Kafka message timestamp.

Endpoint: GET /:region/replication-lag

Returns: { "lag_seconds": 2.5 }

------------------------------------------------------------------------

## Failover Behavior

If backend-us is down: Requests to /us/\* are automatically routed to
backend-eu.

NGINX uses: - backup upstream servers - proxy_next_upstream - failure
thresholds

------------------------------------------------------------------------

## Observability

-   NGINX logs include upstream_response_time
-   Backend logs include:
    -   replication events
    -   optimistic lock conflicts
    -   idempotency violations

------------------------------------------------------------------------

## Why This Architecture?

This design reflects real-world systems where: - Low latency is
required - High availability is critical - Regions must operate
independently - Writes must not block on cross-region replication

This system is: - Horizontally scalable - Failure tolerant - Eventually
consistent
