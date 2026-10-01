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

CREATE TABLE IF NOT EXISTS url_clicks (
    id BIGSERIAL PRIMARY KEY,
    url_id BIGINT NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_url_clicks_url_id
    ON url_clicks(url_id);

CREATE INDEX IF NOT EXISTS idx_url_clicks_clicked_at
    ON url_clicks(clicked_at);
