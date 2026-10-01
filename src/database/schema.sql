CREATE TABLE IF NOT EXISTS urls (
    id BIGSERIAL PRIMARY KEY,
    short_code VARCHAR(20) NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    custom_alias VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    click_count BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_urls_expires_at
    ON urls(expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_urls_custom_alias
    ON urls(custom_alias)
    WHERE custom_alias IS NOT NULL;
