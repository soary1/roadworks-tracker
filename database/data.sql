-- ═══════════════════════════════════════════════════════════════════════════
-- DONNÉES INITIALES - Roadworks Tracker
-- ═══════════════════════════════════════════════════════════════════════════

-- Rôles
INSERT INTO role (libelle) VALUES ('MANAGER') ON CONFLICT (libelle) DO NOTHING;
INSERT INTO role (libelle) VALUES ('USER') ON CONFLICT (libelle) DO NOTHING;

-- Statuts de compte
INSERT INTO status_account (libelle) VALUES ('ACTIVE') ON CONFLICT (libelle) DO NOTHING;
INSERT INTO status_account (libelle) VALUES ('INACTIVE') ON CONFLICT (libelle) DO NOTHING;
INSERT INTO status_account (libelle) VALUES ('LOCKED') ON CONFLICT (libelle) DO NOTHING;

-- Statuts de signalement
INSERT INTO status_signalement (libelle) VALUES ('PENDING') ON CONFLICT (libelle) DO NOTHING;
INSERT INTO status_signalement (libelle) VALUES ('VALIDATED') ON CONFLICT (libelle) DO NOTHING;
INSERT INTO status_signalement (libelle) VALUES ('IN_PROGRESS') ON CONFLICT (libelle) DO NOTHING;
INSERT INTO status_signalement (libelle) VALUES ('COMPLETED') ON CONFLICT (libelle) DO NOTHING;
INSERT INTO status_signalement (libelle) VALUES ('REJECTED') ON CONFLICT (libelle) DO NOTHING;

-- Configuration par défaut
-- max_attempts = 3 (nombre de tentatives avant blocage)
-- session_duration = 24 (durée de session en heures)
INSERT INTO config (max_attempts, session_duration) 
SELECT 3, 24 
WHERE NOT EXISTS (SELECT 1 FROM config);

-- Types de problèmes routiers
INSERT INTO type_problem (libelle, icone) VALUES ('Nid de poule', '🕳️') ON CONFLICT DO NOTHING;
INSERT INTO type_problem (libelle, icone) VALUES ('Fissure', '⚡') ON CONFLICT DO NOTHING;
INSERT INTO type_problem (libelle, icone) VALUES ('Affaissement', '📉') ON CONFLICT DO NOTHING;
INSERT INTO type_problem (libelle, icone) VALUES ('Inondation', '🌊') ON CONFLICT DO NOTHING;
INSERT INTO type_problem (libelle, icone) VALUES ('Obstacle', '🚧') ON CONFLICT DO NOTHING;
INSERT INTO type_problem (libelle, icone) VALUES ('Signalisation manquante', '⚠️') ON CONFLICT DO NOTHING;
INSERT INTO type_problem (libelle, icone) VALUES ('Éclairage défaillant', '💡') ON CONFLICT DO NOTHING;
INSERT INTO type_problem (libelle, icone) VALUES ('Autre', '📝') ON CONFLICT DO NOTHING;

-- Compte Manager par défaut (mot de passe: admin123)
-- Le hash BCrypt de 'admin123' est généré avec BCryptPasswordEncoder
INSERT INTO account (username, pwd, id_role, is_active, is_locked, attempts)
SELECT 
    'admin@roadworks.mg',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGe6cL6sF2G9W1T.8xVQMGC0dVJu', -- admin123
    (SELECT id FROM role WHERE libelle = 'MANAGER'),
    true,
    false,
    0
WHERE NOT EXISTS (SELECT 1 FROM account WHERE username = 'admin@roadworks.mg');
