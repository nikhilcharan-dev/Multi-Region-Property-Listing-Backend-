# API Specification

Base URL: http://localhost:8080

------------------------------------------------------------------------

# Health Endpoints

## GET /us/health

## GET /eu/health

Response: 200 OK

Purpose: Verifies that the regional backend is healthy and reachable
through NGINX.

------------------------------------------------------------------------

# Update Property

## PUT /:region/properties/:id

Example: PUT /us/properties/123

Headers: Content-Type: application/json X-Request-ID:
`<unique-uuid>`{=html}

Request Body: { "price": 500000, "version": 1 }

Description: Updates a property listing using optimistic locking. The
request must include the current version number.

------------------------------------------------------------------------

## Success Response (200 OK)

{ "id": 123, "price": 500000, "bedrooms": 3, "bathrooms": 2,
"region_origin": "us", "version": 2, "updated_at":
"2026-02-21T10:00:00.000Z" }

Behavior: - Version is incremented - updated_at is refreshed - Kafka
event is published

------------------------------------------------------------------------

# Error Responses

## 400 Bad Request

Returned when X-Request-ID header is missing.

{ "error": "Missing X-Request-ID" }

------------------------------------------------------------------------

## 409 Conflict

Returned when version mismatch occurs (optimistic locking failure).

{ "error": "Version conflict" }

Client Resolution Strategy: 1. Re-fetch latest property 2. Retry with
updated version

------------------------------------------------------------------------

## 422 Unprocessable Entity

Returned when duplicate X-Request-ID is detected.

{ "error": "Duplicate request" }

------------------------------------------------------------------------

# Replication Lag

## GET /:region/replication-lag

Example: GET /eu/replication-lag

Response: { "lag_seconds": 2.4 }

Description: Returns the time difference between the last consumed Kafka
message and the current system time.

------------------------------------------------------------------------

# Kafka Event Schema

Topic: property-updates

Message Format: { "id": 123, "price": 500000, "bedrooms": 3,
"bathrooms": 2, "region_origin": "us", "version": 2, "updated_at":
"2026-02-21T10:00:00.000Z" }

Behavior: - Published after successful update - Consumed by the opposite
region - Applied to local database

------------------------------------------------------------------------

# Consistency Guarantees

-   Strong consistency within a region
-   Eventual consistency across regions
-   Deterministic conflict detection (409)
-   Idempotent write operations (422 on duplicates)

------------------------------------------------------------------------

# Testing Instructions

Start services: docker-compose up -d

Run integration tests: npm test

Demonstrate failover: bash tests/demonstrate_failover.sh
