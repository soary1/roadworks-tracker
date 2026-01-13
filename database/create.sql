create database roadworks_tracker;
\c roadworks_tracker;

CREATE TABLE role (
  id            BIGSERIAL PRIMARY KEY,
  label         VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE account (
  id                BIGSERIAL PRIMARY KEY,
  username          VARCHAR(80) NOT NULL UNIQUE,
  pwd               VARCHAR(255) NOT NULL, 
  role_id           BIGINT NOT NULL REFERENCES role(id),

  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login        TIMESTAMP NULL,

  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  is_locked         BOOLEAN NOT NULL DEFAULT FALSE,

  attempts          INT NOT NULL DEFAULT 0,
  last_failed_login TIMESTAMP NULL,
  max_attempts      INT NOT NULL DEFAULT 3,

  CONSTRAINT chk_attempts_nonneg CHECK (attempts >= 0),
  CONSTRAINT chk_max_attempts_pos CHECK (max_attempts > 0)
);

CREATE INDEX idx_account_role_id ON account(role_id);

CREATE TABLE status_account (
  id      BIGSERIAL PRIMARY KEY,
  label   VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE account_status (
  id                BIGSERIAL PRIMARY KEY,
  account_id        BIGINT NOT NULL REFERENCES account(id) ON DELETE CASCADE,
  status_account_id BIGINT NOT NULL REFERENCES status_account(id),
  updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_account_status_account_id ON account_status(account_id);
CREATE INDEX idx_account_status_status_id  ON account_status(status_account_id);


CREATE TABLE status_road (
  id      BIGSERIAL PRIMARY KEY,
  label   VARCHAR(50) NOT NULL UNIQUE
);


CREATE TABLE society_btp (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  siret       VARCHAR(30) NOT NULL UNIQUE,
  address     VARCHAR(255) NOT NULL,
  phone       VARCHAR(30),
  email       VARCHAR(150),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE signalement (
  id           BIGSERIAL PRIMARY KEY,
  account_id   BIGINT NOT NULL REFERENCES account(id) ON DELETE CASCADE,

  description  TEXT NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),

  location     VARCHAR(255) NOT NULL,   
  picture      TEXT,                    
  surface      NUMERIC(12,2),           -- optional: m²

  CONSTRAINT chk_surface_nonneg CHECK (surface IS NULL OR surface >= 0)
);

CREATE INDEX idx_signalement_account_id ON signalement(account_id);


CREATE TABLE signalement_work (
  id                  BIGSERIAL PRIMARY KEY,
  signalement_id      BIGINT NOT NULL REFERENCES signalement(id) ON DELETE CASCADE,
  society_btp_id      BIGINT NOT NULL REFERENCES society_btp(id),

  start_date          DATE,
  end_date_estimation DATE,
  price               NUMERIC(14,2),
  real_end_date       DATE,

  CONSTRAINT chk_price_nonneg CHECK (price IS NULL OR price >= 0),
  CONSTRAINT chk_dates_logic CHECK (
    (start_date IS NULL OR end_date_estimation IS NULL OR end_date_estimation >= start_date)
    AND
    (start_date IS NULL OR real_end_date IS NULL OR real_end_date >= start_date)
  )
);

CREATE INDEX idx_work_signalement_id ON signalement_work(signalement_id);
CREATE INDEX idx_work_society_id     ON signalement_work(society_btp_id);


CREATE TABLE signalement_status (
  id              BIGSERIAL PRIMARY KEY,
  signalement_id  BIGINT NOT NULL REFERENCES signalement(id) ON DELETE CASCADE,
  status_road_id  BIGINT NOT NULL REFERENCES status_road(id),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sig_status_signalement_id ON signalement_status(signalement_id);
CREATE INDEX idx_sig_status_status_id      ON signalement_status(status_road_id);

CREATE TABLE session (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  BIGINT NOT NULL REFERENCES account(id) ON DELETE CASCADE,

  token       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMP NOT NULL,

  ip_address  VARCHAR(64),
  user_agent  TEXT,

  CONSTRAINT chk_expires_after_created CHECK (expires_at > created_at)
);

CREATE INDEX idx_session_account_id ON session(account_id);
CREATE INDEX idx_session_expires_at ON session(expires_at);