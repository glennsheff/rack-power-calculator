-- AiFi Rack Power Calculator — Postgres schema
-- Run via: node db/seed.js (idempotent — safe to re-run)

CREATE TABLE IF NOT EXISTS hardware_items (
  id                  TEXT        PRIMARY KEY,
  name                TEXT        NOT NULL DEFAULT '',
  model               TEXT        NOT NULL DEFAULT '',
  category            TEXT        NOT NULL DEFAULT 'other',
  power_watts         INTEGER     NOT NULL DEFAULT 0,
  peak_power_watts    INTEGER     NOT NULL DEFAULT 0,
  heat_output_btu     INTEGER     NOT NULL DEFAULT 0,
  power_supply_count  SMALLINT    NOT NULL DEFAULT 0,
  power_supply_type   TEXT        NOT NULL DEFAULT '',
  rack_units          NUMERIC(4,2) NOT NULL DEFAULT 0,
  weight_kg           NUMERIC(7,2) NOT NULL DEFAULT 0,
  notes               TEXT        NOT NULL DEFAULT '',
  status              TEXT        NOT NULL DEFAULT 'active',
  poe_powered         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hardware_items_name_idx ON hardware_items (name);
CREATE INDEX IF NOT EXISTS hardware_items_status_idx ON hardware_items (status);

CREATE TABLE IF NOT EXISTS rack_configurations (
  id                      TEXT        PRIMARY KEY,
  name                    TEXT        NOT NULL DEFAULT '',
  store_name              TEXT        NOT NULL DEFAULT '',
  region                  TEXT        NOT NULL DEFAULT 'US',
  items                   JSONB       NOT NULL DEFAULT '[]'::jsonb,
  desired_runtime_minutes SMALLINT    NOT NULL DEFAULT 15,
  include_redundancy      BOOLEAN     NOT NULL DEFAULT FALSE,
  ambient_temp_celsius    NUMERIC(4,1) NOT NULL DEFAULT 25,
  notes                   TEXT        NOT NULL DEFAULT '',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rack_configurations_updated_at_idx
  ON rack_configurations (updated_at DESC);
