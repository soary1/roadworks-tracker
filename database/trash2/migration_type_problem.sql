-- Migration: Ajouter tous les types de problèmes pour aligner mobile et backend

-- Supprimer les anciens types (optionnel, commenter si vous voulez les garder)
-- DELETE FROM type_problem;

-- Insérer les nouveaux types alignés avec le mobile
INSERT INTO type_problem (icone, libelle) VALUES
    ('🕳️', 'pothole'),
    ('🚧', 'blocked_road'),
    ('🚨', 'accident'),
    ('🏗️', 'construction'),
    ('💧', 'flooding'),
    ('🪨', 'debris'),
    ('⚠️', 'poor_surface'),
    ('❓', 'other')
ON CONFLICT DO NOTHING;

-- Afficher les types après migration
SELECT * FROM type_problem ORDER BY id;
