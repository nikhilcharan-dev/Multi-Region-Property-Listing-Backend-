# Multi-Region Property Listing Backend

A distributed, multi-region backend system simulating global property
listing services across US and EU regions.

This project demonstrates:

-   Multi-region deployment architecture
-   NGINX reverse proxy with automatic failover
-   Asynchronous cross-region replication using Kafka
-   PostgreSQL per-region databases
-   Optimistic locking for concurrency control
-   Idempotent API design
-   Replication lag monitoring
-   Fully containerized infrastructure with Docker Compose
-   Automated integration tests

------------------------------------------------------------------------

# 🏗 Architecture Overview

```
                Client
                   |
                   v
          NGINX Reverse Proxy
               /           \
              /             \
        /us/*                 \eu/*
            |                     |
            v                     v
       backend-us            backend-eu
            |                     |
            v                     v
           db-us                 db-eu
                \               /
                 \             /
                  v           v
                      Kafka
                        |
                        v
            Cross-Region Consumer
```
------------------------------------------------------------------------

# Tech Stack

-   Node.js (Express)
-   PostgreSQL
-   Apache Kafka
-   NGINX
-   Docker & Docker Compose
-   Jest (Integration Testing)

------------------------------------------------------------------------

# Features

## 1. Multi-Region Routing

-   /us/\* routes to US backend
-   /eu/\* routes to EU backend
-   Automatic failover if primary region fails

## 2. Optimistic Locking

Each property has a version column.

Update succeeds only if: WHERE id = ? AND version = ?

If version mismatch: - Returns HTTP 409 Conflict

## 3. Idempotency

All PUT requests require X-Request-ID header.

-   First request → processed
-   Duplicate request → HTTP 422

Stored in idempotency_keys table.

## 4. Event-Driven Replication

-   Updates publish events to Kafka topic: property-updates
-   Opposite region consumes and applies changes
-   Eventual consistency across regions

## 5. Replication Lag Monitoring

Endpoint: GET /:region/replication-lag

Returns: { "lag_seconds": 2.4 }

------------------------------------------------------------------------

## 📁 Project Structure

```
multi-region-property/
│
├── docker-compose.yml
│
├── nginx/
│
├── backend/
│
├── seeds/
│
├── tests/
│
└── docs/
```

------------------------------------------------------------------------

# Setup Instructions

## 1. Start System

docker-compose down -v

docker-compose up -d --build

Wait until all services show (healthy).

## 2. Health Check

curl http://localhost:8080/us/health 

curl http://localhost:8080/eu/health

------------------------------------------------------------------------

# API Usage

## Update Property

PUT /us/properties/:id

Headers: Content-Type: application/json X-Request-ID: unique-id

Body: { "price": 500000, "version": 1 }

Success → 200 OK\
Version conflict → 409\
Duplicate request → 422

------------------------------------------------------------------------

# Testing

Run automated tests:

npm test

Demonstrate failover:

bash tests/demonstrate_failover.sh

------------------------------------------------------------------------

# Failover Demonstration

1.  Stop US backend: docker stop backend-us

2.  Call US endpoint: curl http://localhost:8080/us/health

Request will be served by EU backend.

------------------------------------------------------------------------

# Database Schema

properties: - id (BIGINT, PK) - price (DECIMAL) - bedrooms (INTEGER) -
bathrooms (INTEGER) - region_origin (VARCHAR) - version (INTEGER) -
updated_at (TIMESTAMP)

idempotency_keys: - request_id (VARCHAR, PK) - created_at (TIMESTAMP)

------------------------------------------------------------------------

# Consistency Model

-   Strong consistency within a region
-   Eventual consistency across regions
-   Optimistic concurrency control
-   Deterministic conflict rejection

------------------------------------------------------------------------

# Why This Matters

This architecture mirrors real-world globally distributed systems where:

-   High availability is required
-   Latency must be minimized
-   Regions must operate independently
-   Writes must not block on cross-region replication

------------------------------------------------------------------------

# Author
Nikhil Charan
