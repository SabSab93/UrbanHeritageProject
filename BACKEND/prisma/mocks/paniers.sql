CREATE TABLE "Panier" (
   id_panier SERIAL PRIMARY KEY,
   id_client INTEGER, 
   date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   statut_panier statut_panier_enum NOT NULL, 
   FOREIGN KEY (id_client) REFERENCES "Client"(id_client) ON DELETE CASCADE
);


CREATE TABLE "PanierLigne" (
   id_panier_ligne SERIAL PRIMARY KEY,
   id_panier INTEGER NOT NULL,
   id_maillot INTEGER NOT NULL,
   taille_maillot taille_maillot_enum NOT NULL,
   quantite INTEGER NOT NULL CHECK (quantite > 0),
   FOREIGN KEY (id_panier) REFERENCES "Panier"(id_panier) ON DELETE CASCADE,
   FOREIGN KEY (id_maillot) REFERENCES "Maillot"(id_maillot) ON DELETE CASCADE
);
