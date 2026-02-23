-- ============================================
-- CREATE TABLE: properties
-- ============================================

CREATE TABLE IF NOT EXISTS properties (
    id BIGINT PRIMARY KEY,
    price DECIMAL NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    region_origin VARCHAR(2) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- CREATE TABLE: idempotency_keys
-- ============================================

CREATE TABLE IF NOT EXISTS idempotency_keys (
    request_id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- SEED DATA
-- Generates 2000 realistic property records
-- ============================================

INSERT INTO properties (id, price, bedrooms, bathrooms, region_origin)
SELECT
    gs AS id,

    -- Realistic property price range
    ROUND((random() * 900000 + 100000)::numeric, 2) AS price,

    -- Bedrooms: 1–6
    FLOOR(random() * 6 + 1)::INTEGER AS bedrooms,

    -- Bathrooms: 1–4
    FLOOR(random() * 4 + 1)::INTEGER AS bathrooms,

    -- Default region (will be overridden for EU)
    'us' AS region_origin

FROM generate_series(1, 2000) AS gs;