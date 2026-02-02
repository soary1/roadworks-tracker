-- Migration: Ajouter la table security_log pour les logs d'accès aux signalements

CREATE TABLE IF NOT EXISTS security_log (
    id SERIAL PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id BIGINT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_security_log_user_id ON security_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_log_action ON security_log(action);
CREATE INDEX IF NOT EXISTS idx_security_log_created_at ON security_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_log_resource ON security_log(resource_type, resource_id);
