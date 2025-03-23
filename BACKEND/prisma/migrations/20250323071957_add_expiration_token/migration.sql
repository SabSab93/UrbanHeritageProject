-- CreateEnum
CREATE TYPE "choix_livraison" AS ENUM ('livraison domicile', 'livraison point relai');

-- CreateEnum
CREATE TYPE "choix_livreur" AS ENUM ('chronopost', 'ups');

-- CreateEnum
CREATE TYPE "methode_livraison" AS ENUM ('livraison_rapide', 'livraison_classique');

-- CreateEnum
CREATE TYPE "motif_retour" AS ENUM ('taille', 'correspond pas');

-- CreateEnum
CREATE TYPE "status_enum" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "statut_commande" AS ENUM ('en cours de preparation', 'en cours de livraison', 'livré', 'en retard');

-- CreateEnum
CREATE TYPE "type_remboursement" AS ENUM ('echange', 'avoir');

-- CreateEnum
CREATE TYPE "type_role" AS ENUM ('invité', 'inscrit');

-- CreateTable
CREATE TABLE "Account" (
    "id_account" BIGSERIAL NOT NULL,
    "nom_account" VARCHAR(255) NOT NULL,
    "date_creation" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" "status_enum" NOT NULL DEFAULT 'active',
    "chiffre_affaires_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "nombre_commandes" INTEGER NOT NULL DEFAULT 0,
    "derniere_activite" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id_account")
);

-- CreateTable
CREATE TABLE "Avoir" (
    "id_commande_retour_avoir" BIGSERIAL NOT NULL,
    "numero_avoir" VARCHAR(100),
    "date_avoir" DATE,
    "avoir_hors_ue" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Avoir_pkey" PRIMARY KEY ("id_commande_retour_avoir")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id_commande" BIGSERIAL NOT NULL,
    "id_lignecommande" BIGINT NOT NULL,
    "date_commande" DATE,
    "statut_commande" "statut_commande",
    "prix_ttc" DECIMAL NOT NULL DEFAULT 0,

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id_commande")
);

-- CreateTable
CREATE TABLE "Facture" (
    "numero_facture" BIGSERIAL NOT NULL,
    "date_facture" DATE,
    "facture_hors_ue" BOOLEAN DEFAULT false,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("numero_facture")
);

-- CreateTable
CREATE TABLE "LigneCommande" (
    "id_lignecommande" BIGSERIAL NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 0,
    "prix_ht" DECIMAL NOT NULL DEFAULT 0,
    "montant_tva" DECIMAL NOT NULL DEFAULT 0,
    "prix_ttc" DECIMAL NOT NULL DEFAULT 0,

    CONSTRAINT "LigneCommande_pkey" PRIMARY KEY ("id_lignecommande")
);

-- CreateTable
CREATE TABLE "Livraison" (
    "id_livraison" BIGSERIAL NOT NULL,
    "id_typelivraison" BIGINT NOT NULL,
    "date_livraison" DATE,
    "adresse_livraison" VARCHAR(500) NOT NULL DEFAULT '',
    "code_postal_livraison" VARCHAR(5),
    "ville_livraison" VARCHAR(100) NOT NULL DEFAULT '',
    "pays_livraison" VARCHAR(100) NOT NULL DEFAULT '',

    CONSTRAINT "Livraison_pkey" PRIMARY KEY ("id_livraison")
);

-- CreateTable
CREATE TABLE "Retour" (
    "id_commande_retour" BIGSERIAL NOT NULL,
    "motif_retour" "motif_retour",
    "date_retour" DATE,
    "type_remboursement" "type_remboursement",
    "droit_retour" BOOLEAN NOT NULL DEFAULT false,
    "reception_retour" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Retour_pkey" PRIMARY KEY ("id_commande_retour")
);

-- CreateTable
CREATE TABLE "Role" (
    "type_role" "type_role" NOT NULL DEFAULT 'invité',

    CONSTRAINT "Role_pkey" PRIMARY KEY ("type_role")
);

-- CreateTable
CREATE TABLE "Token" (
    "id_token" TEXT NOT NULL,
    "valeur_token" TEXT NOT NULL,
    "expiration_token" TIMESTAMP(3) NOT NULL,
    "create_at_token" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id_token")
);

-- CreateTable
CREATE TABLE "TypeLivraison" (
    "id_typelivraison" BIGSERIAL NOT NULL,
    "methode_livraison" "methode_livraison",
    "choix_livreur" "choix_livreur",
    "choix_livraison" "choix_livraison",
    "prix_livraison" INTEGER,

    CONSTRAINT "TypeLivraison_pkey" PRIMARY KEY ("id_typelivraison")
);

-- CreateIndex
CREATE UNIQUE INDEX "Avoir_numero_avoir_key" ON "Avoir"("numero_avoir");

-- CreateIndex
CREATE INDEX "index_statut_commande" ON "Commande"("statut_commande");

-- CreateIndex
CREATE UNIQUE INDEX "Token_valeur_token_key" ON "Token"("valeur_token");

-- AddForeignKey
ALTER TABLE "Avoir" ADD CONSTRAINT "Avoir_id_commande_retour_avoir_fkey" FOREIGN KEY ("id_commande_retour_avoir") REFERENCES "Commande"("id_commande") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_id_lignecommande_fkey" FOREIGN KEY ("id_lignecommande") REFERENCES "LigneCommande"("id_lignecommande") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_id_typelivraison_fkey" FOREIGN KEY ("id_typelivraison") REFERENCES "TypeLivraison"("id_typelivraison") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Retour" ADD CONSTRAINT "Retour_id_commande_retour_fkey" FOREIGN KEY ("id_commande_retour") REFERENCES "Commande"("id_commande") ON DELETE NO ACTION ON UPDATE NO ACTION;
