# Failover Walkthrough

## Overview

This document demonstrates how automatic regional failover works in the
Multi-Region Property Listing Backend.

NGINX acts as the global reverse proxy and automatically reroutes
traffic to a healthy backend if the primary regional backend becomes
unavailable.

------------------------------------------------------------------------

## Architecture Context

Primary routing rules:

-   /us/\* → backend-us (primary), backend-eu (backup)
-   /eu/\* → backend-eu (primary), backend-us (backup)

Failover is handled by: - upstream backup servers - proxy_next_upstream
directive - health checks - max_fails and fail_timeout settings

------------------------------------------------------------------------

## Step-by-Step Failover Demonstration

### Step 1 --- Start All Services

docker-compose up -d --build

Wait until all containers show:

(healthy)

Verify health:

curl http://localhost:8080/us/health

Expected: 200 OK

------------------------------------------------------------------------

### Step 2 --- Confirm Primary Routing

Check backend-us logs:

docker logs backend-us

You should see the request handled by backend-us.

------------------------------------------------------------------------

### Step 3 --- Simulate Failure

Stop the US backend:

docker stop backend-us

This simulates a regional outage.

------------------------------------------------------------------------

### Step 4 --- Trigger Failover

Call the same endpoint again:

curl http://localhost:8080/us/health

Expected: 200 OK

Even though backend-us is down.

------------------------------------------------------------------------

### Step 5 --- Verify Traffic Was Rerouted

Check EU backend logs:

docker logs backend-eu

You should now see the request handled by backend-eu, even though the
path was /us/health.

This confirms successful failover.

------------------------------------------------------------------------

## Why Failover Works

NGINX upstream configuration:

upstream us_backend { server backend-us:8000 max_fails=3
fail_timeout=10s; server backend-eu:8000 backup; }

When backend-us: - Fails health checks - Returns error codes (500, 502,
503, 504) - Times out

NGINX automatically routes traffic to the backup server.

------------------------------------------------------------------------

## Recovery Behavior

If backend-us is restarted:

docker start backend-us

After it becomes healthy again, it resumes serving as the primary
backend for /us/\* requests.

Failover is automatic and transparent to clients.

------------------------------------------------------------------------

## Availability Model

This design ensures:

-   No single regional failure brings down the system
-   Clients continue receiving 200 OK responses
-   Traffic reroutes within milliseconds
-   No manual intervention required

------------------------------------------------------------------------

## Production Considerations

In a real-world deployment:

-   Health checks would be more advanced
-   TLS termination would be enabled
-   Load balancing across multiple instances per region would be used
-   Cross-region DNS routing could be layered on top

------------------------------------------------------------------------

## Summary

The failover mechanism guarantees:

-   High availability
-   Automatic recovery
-   Transparent routing
-   Regional resilience

This mirrors real-world high-availability architectures used in global
distributed systems.
