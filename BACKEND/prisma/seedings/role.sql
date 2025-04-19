-- Insertion des rôles dans la table "Role"
INSERT INTO "Role" (id_role, type_role)
VALUES 
   (1, 'invite'),
   (2, 'inscrit')
ON CONFLICT (id_role) DO NOTHING;


