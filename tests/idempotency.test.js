const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const BASE_URL = "http://localhost:8080";

test("Duplicate X-Request-ID should return 422", async () => {

  const propertyId = 30;

  const versionRes = await axios.get(`${BASE_URL}/us/properties/${propertyId}`);
  const version = versionRes.data.version;

  const requestId = uuidv4();

  await axios.put(`${BASE_URL}/us/properties/${propertyId}`, {
    price: 555555,
    version
  }, {
    headers: { "X-Request-ID": requestId }
  });

  try {
    await axios.put(`${BASE_URL}/us/properties/${propertyId}`, {
      price: 555555,
      version
    }, {
      headers: { "X-Request-ID": requestId }
    });
  } catch (err) {
    expect(err.response.status).toBe(422);
  }
});