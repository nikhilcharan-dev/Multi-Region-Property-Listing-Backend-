const axios = require('axios');
const { execSync } = require('child_process');

const BASE_URL = "http://localhost:8080";

test(
  "Update in US should replicate to EU",
  async () => {

    const propertyId = 40;

    const versionRes = await axios.get(`${BASE_URL}/us/properties/${propertyId}`);
    const version = versionRes.data.version;

    await axios.put(`${BASE_URL}/us/properties/${propertyId}`, {
      price: 123456,
      version
    }, {
      headers: { "X-Request-ID": "rep-" + Date.now() }
    });

    // Wait longer for Kafka replication
    await new Promise(resolve => setTimeout(resolve, 8000));

    const result = execSync(
      `docker exec db-eu psql -U postgres -d properties -t -c "SELECT price FROM properties WHERE id=${propertyId};"`
    ).toString().trim();

    expect(result).toBe("123456");
  },
  15000 // 🔥 increase test timeout to 15 seconds
);