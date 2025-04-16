-- Insertion de 3 utilisateurs dans la table Utilisateur
INSERT INTO "Utilisateur" (id_utilisateur, nom_account, status, vente_total, nombre_commandes)
VALUES 
   (1, 'julien_martin', 'active', 120.50, 3),
   (2, 'claire_dupont', 'active', 85.00, 2),
   (3, 'guest_user', 'active', 0.00, 0);

-- Insertion dans la table Client (avec les bons rôles)
INSERT INTO "Client" (
   id_client, id_role, nom_client, prenom_client, civilite, date_naissance_client,
   adresse_client, code_postal_client, ville_client, pays_client, mot_de_passe, adresse_mail_client
)
VALUES 
   (1, 2, 'Martin', 'Julien', 'homme', '1995-03-10',
    '10 rue des Lilas', '75000', 'Paris', 'France', 'hashed_password_1', 'julien.martin@example.com'),

   (2, 2, 'Dupont', 'Claire', 'femme', '1990-06-25',
    '22 avenue République', '69000', 'Lyon', 'France', 'hashed_password_2', 'claire.dupont@example.com');
   
INSERT INTO "Client" (id_client, id_role)
VALUES (3, 1);


-- Génération des tokens
INSERT INTO "Token" (id_utilisateur, valeur_token, date_expiration)
VALUES 
   (1, 'token_inscrit_1', NOW() + INTERVAL '24 hours'),
   (2, 'token_inscrit_2', NOW() + INTERVAL '24 hours'),
   (3, 'token_invite', NOW() + INTERVAL '24 hours');

