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
-- SEED DATA (1500 ROWS)
-- ============================================

INSERT INTO properties (id, price, bedrooms, bathrooms, region_origin)
SELECT
    generate_series(1, 1500),
    (random() * 1000000 + 50000)::DECIMAL,
    (random() * 5)::INTEGER,
    (random() * 3)::INTEGER,
    'us';  -- Will override in EU container if needed