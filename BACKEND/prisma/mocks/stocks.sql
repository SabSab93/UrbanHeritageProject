
-- ===============================
-- Données de test
-- ===============================

-- Création d'une entrée de stock brute
INSERT INTO "Stock" (id_maillot, taille_maillot)
VALUES (1, 'M') RETURNING id_stock;

-- L’ID retourné est par exemple 1. On teste les mouvements :

-- Ajout d’un mouvement d’entrée de 10 unités
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement)
VALUES (1, 10, 'entree');

-- Ajout d’un mouvement de sortie de 3 unités
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement)
VALUES (1, 3, 'sortie');

-- ===============================
-- Vérification
-- ===============================

SELECT * FROM "Stock";
SELECT * FROM "StockMaillot";



-- ===============================
-- Création des stocks de base pour 4 maillots (id_maillot de 1 à 4)
-- ===============================

-- Maillot 1
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (1, 'S');
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (1, 'M');
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (1, 'L');
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (1, 'XL');

-- Maillot 2
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (2, 'S');
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (2, 'M');
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (2, 'L');
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (2, 'XL');

-- Maillot 3
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (3, 'S');
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (3, 'M');
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (3, 'L');
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (3, 'XL');

-- Maillot 4
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (4, 'S');
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (4, 'M');
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (4, 'L');
INSERT INTO "Stock" (id_maillot, taille_maillot) VALUES (4, 'XL');

-- ===============================
-- Ajout des mouvements d'entrée
-- ===============================

-- Maillot 1 - 10 unités pour chaque taille
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (1, 10, 'entree');
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (2, 10, 'entree');
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (3, 10, 'entree');
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (4, 10, 'entree');

-- Maillot 2 - quantités variées
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (5, 5, 'entree');
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (6, 15, 'entree');
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (7, 15, 'entree');
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (8, 10, 'entree');

-- Maillot 3 - 8 à 10 unités
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (9, 8, 'entree');
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (10, 10, 'entree');
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (11, 10, 'entree');
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (12, 10, 'entree');

-- Maillot 4 - un peu plus de stock
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (13, 10, 'entree');
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (14, 10, 'entree');
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (15, 15, 'entree');
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (16, 15, 'entree');



-- Maillot 1
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (2, 2, 'sortie'); -- M
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (4, 1, 'sortie'); -- XL

-- Maillot 2
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (6, 3, 'sortie'); -- M
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (7, 1, 'sortie'); -- L

-- Maillot 3
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (10, 2, 'sortie'); -- M

-- Maillot 4
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (15, 4, 'sortie'); -- L
INSERT INTO "StockMaillot" (id_stock, quantite_stock, type_mouvement) VALUES (16, 2, 'sortie'); -- XL



-- ===============================
-- Vérification
-- ===============================
SELECT * FROM "Stock" ORDER BY id_stock;
SELECT * FROM "StockMaillot" ORDER BY id_stock_maillot;
