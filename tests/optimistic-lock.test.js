const axios = require('axios');

const BASE_URL = "http://localhost:8080";

async function getCurrentVersion(id) {
  const result = await axios.get(`${BASE_URL}/us/properties/${id}`);
  return result.data.version;
}

test("Concurrent updates should result in one 200 and one 409", async () => {

  const propertyId = 20;

  const version = await getCurrentVersion(propertyId);

  const request1 = axios.put(`${BASE_URL}/us/properties/${propertyId}`, {
    price: 700000,
    version
  }, {
    headers: { "X-Request-ID": "lock-" + Date.now() + "-1" }
  });

  const request2 = axios.put(`${BASE_URL}/us/properties/${propertyId}`, {
    price: 800000,
    version
  }, {
    headers: { "X-Request-ID": "lock-" + Date.now() + "-2" }
  });

  const results = await Promise.allSettled([request1, request2]);

  const statuses = results.map(r =>
    r.status === "fulfilled"
      ? r.value.status
      : r.reason.response.status
  );

  expect(statuses).toContain(200);
  expect(statuses).toContain(409);
});