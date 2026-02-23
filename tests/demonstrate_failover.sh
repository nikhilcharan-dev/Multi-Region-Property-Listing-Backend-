#!/bin/bash

echo "Starting services..."
docker-compose up -d --build
sleep 15

echo "Calling US health endpoint..."
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/us/health

echo "Stopping backend-us..."
docker stop backend-us
sleep 5

echo "Calling US endpoint again (should hit EU)..."
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/us/health

echo "Checking EU backend logs..."
docker logs backend-eu | tail -n 20

echo "Failover demonstration complete."