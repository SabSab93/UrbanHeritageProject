

-- Étape 1 : Création de la commande
INSERT INTO "Commande" (id_client, date_commande, statut_commande)
VALUES (1, CURRENT_TIMESTAMP, 'en_cours')
RETURNING id_commande;
-- Supposons que l'id_commande retourné est 1



-- Étape 2 : Ajout de lignes de commande
-- Achat de 2 maillots (id_maillot = 1, taille = M, prix HT = 30€, TVA = 20%)
INSERT INTO "LigneCommande" (
   id_commande, id_maillot, taille_maillot,
   quantite, prix_ht, taux_tva
)
VALUES (
   1, 1, 'M',
   2, 30.00, 20.0
);

-- Achat de 1 maillot (id_maillot = 2, taille = L, prix HT = 35€, TVA = 20%)
INSERT INTO "LigneCommande" (
   id_commande, id_maillot, taille_maillot,
   quantite, prix_ht, taux_tva
)
VALUES (
   1, 2, 'L',
   1, 35.00, 20.0
);

-- Étape 3 : Appliquer la réduction "WELCOME10" (id_reduction = 1 supposé)
INSERT INTO "ApplicationReduction" (id_commande, id_reduction)
VALUES (1, 1);

-- Étape 4 : Récap de la commande
SELECT * FROM "Commande" WHERE id_commande = 1;
SELECT * FROM "LigneCommande" WHERE id_commande = 1;
SELECT * FROM "ApplicationReduction" WHERE id_commande = 1;