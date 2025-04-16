-- CreateEnum
CREATE TYPE "choix_livraison_enum" AS ENUM ('livraison_domicile', 'livraison_point_relai');

-- CreateEnum
CREATE TYPE "choix_livreur_enum" AS ENUM ('chronopost', 'ups');

-- CreateEnum
CREATE TYPE "civilite_enum" AS ENUM ('femme', 'homme', 'non_specifie');

-- CreateEnum
CREATE TYPE "methode_livraison_enum" AS ENUM ('livraison_rapide', 'livraison_classique');

-- CreateEnum
CREATE TYPE "motif_retour_enum" AS ENUM ('taille', 'non_conforme', 'probleme_qualite');

-- CreateEnum
CREATE TYPE "status_enum" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "statut_commande_enum" AS ENUM ('en_cours', 'livraison', 'livre', 'retard');

-- CreateEnum
CREATE TYPE "statut_panier_enum" AS ENUM ('en_cours', 'abandonne', 'transforme');

-- CreateEnum
CREATE TYPE "statut_reduction_type_enum" AS ENUM ('active', 'expiree', 'annulee');

-- CreateEnum
CREATE TYPE "taille_maillot_enum" AS ENUM ('XS', 'S', 'M', 'L', 'XL');

-- CreateEnum
CREATE TYPE "type_mouvement_enum" AS ENUM ('entree', 'sortie');

-- CreateEnum
CREATE TYPE "type_personnalisation_enum" AS ENUM ('name', 'color', 'name_color');

-- CreateEnum
CREATE TYPE "type_reduction_enum" AS ENUM ('pourcentage', 'montant_fixe', 'frais_livraison', 'autre');

-- CreateTable
CREATE TABLE "ApplicationReduction" (
    "id_commande" INTEGER NOT NULL,
    "id_reduction" INTEGER NOT NULL,

    CONSTRAINT "ApplicationReduction_pkey" PRIMARY KEY ("id_commande","id_reduction")
);

-- CreateTable
CREATE TABLE "Artiste" (
    "id_maillot_artiste" SERIAL NOT NULL,
    "nom_artiste" VARCHAR(100) NOT NULL,
    "prenom_artiste" VARCHAR(100) NOT NULL,
    "pays_artiste" VARCHAR(100) NOT NULL DEFAULT ' ',
    "date_naissance_artiste" VARCHAR(100) NOT NULL DEFAULT ' ',
    "site_web_artiste" VARCHAR(500) NOT NULL DEFAULT ' ',
    "url_image_artiste_1" TEXT NOT NULL DEFAULT ' ',
    "url_image_artiste_2" TEXT NOT NULL DEFAULT ' ',
    "url_image_artiste_3" TEXT NOT NULL DEFAULT ' ',
    "description_artiste_1" TEXT NOT NULL DEFAULT ' ',
    "description_artiste_2" TEXT NOT NULL DEFAULT ' ',
    "description_artiste_3" TEXT NOT NULL DEFAULT ' ',
    "url_instagram_reseau_social" TEXT,
    "url_tiktok_reseau_social" TEXT,

    CONSTRAINT "Artiste_pkey" PRIMARY KEY ("id_maillot_artiste")
);

-- CreateTable
CREATE TABLE "Association" (
    "id_maillot_association" SERIAL NOT NULL,
    "nom_association" VARCHAR(100) NOT NULL,
    "numero_identification_association" VARCHAR(100) NOT NULL,
    "adresse_siege_social_association" TEXT NOT NULL DEFAULT ' ',
    "pays_association" VARCHAR(100) NOT NULL DEFAULT ' ',
    "site_web_association" VARCHAR(100) NOT NULL DEFAULT ' ',
    "url_image_association_1" TEXT NOT NULL DEFAULT ' ',
    "url_image_association_2" TEXT NOT NULL DEFAULT ' ',
    "url_image_association_3" TEXT NOT NULL DEFAULT ' ',
    "description_association_1" TEXT NOT NULL DEFAULT ' ',
    "description_association_2" TEXT NOT NULL DEFAULT ' ',
    "description_association_3" TEXT NOT NULL DEFAULT ' ',

    CONSTRAINT "Association_pkey" PRIMARY KEY ("id_maillot_association")
);

-- CreateTable
CREATE TABLE "Avis" (
    "id_avis" SERIAL NOT NULL,
    "id_maillot" INTEGER NOT NULL,
    "id_client" INTEGER NOT NULL,
    "date_avis" TIMESTAMP(6),
    "classement_avis" INTEGER NOT NULL,
    "titre_avis" VARCHAR(300) NOT NULL DEFAULT ' ',
    "description_avis" TEXT NOT NULL DEFAULT ' ',

    CONSTRAINT "Avis_pkey" PRIMARY KEY ("id_avis")
);

-- CreateTable
CREATE TABLE "Avoir" (
    "id_avoir" SERIAL NOT NULL,
    "numero_avoir" VARCHAR(100),
    "date_avoir" TIMESTAMP(6),
    "avoir_hors_ue" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Avoir_pkey" PRIMARY KEY ("id_avoir")
);

-- CreateTable
CREATE TABLE "Client" (
    "id_client" SERIAL NOT NULL,
    "nom_client" VARCHAR(100),
    "prenom_client" VARCHAR(100),
    "civilite" "civilite_enum" NOT NULL DEFAULT 'non_specifie',
    "date_naissance_client" TIMESTAMP(6),
    "adresse_client" VARCHAR(500),
    "code_postal_client" VARCHAR(5),
    "ville_client" VARCHAR(100),
    "pays_client" VARCHAR(100),
    "mot_de_passe" TEXT,
    "adresse_mail_client" VARCHAR(100),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id_client")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id_commande" SERIAL NOT NULL,
    "id_client" INTEGER NOT NULL,
    "date_commande" TIMESTAMP(6),
    "statut_commande" "statut_commande_enum" NOT NULL,

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id_commande")
);

-- CreateTable
CREATE TABLE "Facture" (
    "numero_facture" VARCHAR(100) NOT NULL,
    "id_commande" INTEGER NOT NULL,
    "date_facture" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "facture_hors_ue" BOOLEAN DEFAULT false,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("numero_facture")
);

-- CreateTable
CREATE TABLE "LigneCommande" (
    "id_lignecommande" SERIAL NOT NULL,
    "id_commande" INTEGER NOT NULL,
    "id_maillot" INTEGER NOT NULL,
    "taille_maillot" "taille_maillot_enum" NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 0,
    "prix_ht" DECIMAL NOT NULL DEFAULT 0,
    "taux_tva" DECIMAL NOT NULL DEFAULT 20.0,

    CONSTRAINT "LigneCommande_pkey" PRIMARY KEY ("id_lignecommande")
);

-- CreateTable
CREATE TABLE "Livraison" (
    "id_livraison" SERIAL NOT NULL,
    "id_typelivraison" INTEGER NOT NULL,
    "id_commande" INTEGER NOT NULL,
    "date_livraison" TIMESTAMP(6),
    "adresse_livraison" VARCHAR(500) NOT NULL DEFAULT '',
    "code_postal_livraison" VARCHAR(5),
    "ville_livraison" VARCHAR(100) NOT NULL DEFAULT '',
    "pays_livraison" VARCHAR(100) NOT NULL DEFAULT '',

    CONSTRAINT "Livraison_pkey" PRIMARY KEY ("id_livraison")
);

-- CreateTable
CREATE TABLE "Maillot" (
    "id_maillot" SERIAL NOT NULL,
    "id_tva" INTEGER NOT NULL,
    "nom_maillot" VARCHAR(100) NOT NULL DEFAULT '',
    "pays_maillot" VARCHAR(100) NOT NULL DEFAULT '',
    "description_maillot" TEXT NOT NULL DEFAULT '',
    "composition_maillot" TEXT NOT NULL DEFAULT '',
    "url_image_maillot_1" TEXT NOT NULL DEFAULT ' ',
    "url_image_maillot_2" TEXT NOT NULL DEFAULT ' ',
    "url_image_maillot_3" TEXT NOT NULL DEFAULT ' ',
    "origine" TEXT NOT NULL DEFAULT '',
    "tracabilite" TEXT NOT NULL DEFAULT '',
    "entretien" TEXT NOT NULL DEFAULT '',
    "prix_ht_maillot" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Maillot_pkey" PRIMARY KEY ("id_maillot")
);

-- CreateTable
CREATE TABLE "MaillotPersonnalisation" (
    "id_maillot" INTEGER NOT NULL,
    "id_personnalisation" INTEGER NOT NULL,

    CONSTRAINT "MaillotPersonnalisation_pkey" PRIMARY KEY ("id_maillot","id_personnalisation")
);

-- CreateTable
CREATE TABLE "Panier" (
    "id_panier" SERIAL NOT NULL,
    "id_client" INTEGER,
    "date_creation" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "statut_panier" "statut_panier_enum" NOT NULL,

    CONSTRAINT "Panier_pkey" PRIMARY KEY ("id_panier")
);

-- CreateTable
CREATE TABLE "PanierLigne" (
    "id_panier_ligne" SERIAL NOT NULL,
    "id_panier" INTEGER NOT NULL,
    "id_maillot" INTEGER NOT NULL,
    "taille_maillot" "taille_maillot_enum" NOT NULL,
    "quantite" INTEGER NOT NULL,

    CONSTRAINT "PanierLigne_pkey" PRIMARY KEY ("id_panier_ligne")
);

-- CreateTable
CREATE TABLE "Personnalisation" (
    "id_personnalisation" SERIAL NOT NULL,
    "type_personnalisation" "type_personnalisation_enum" NOT NULL,
    "prix_ht" DECIMAL NOT NULL,
    "description" TEXT NOT NULL DEFAULT 0,

    CONSTRAINT "Personnalisation_pkey" PRIMARY KEY ("id_personnalisation")
);

-- CreateTable
CREATE TABLE "Reduction" (
    "id_reduction" SERIAL NOT NULL,
    "code_reduction" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "valeur_reduction" DECIMAL(10,2) NOT NULL,
    "date_debut_reduction" TIMESTAMP(6),
    "date_fin_reduction" TIMESTAMP(6),
    "type_reduction" "type_reduction_enum" NOT NULL,
    "statut_reduction" "statut_reduction_type_enum" NOT NULL,
    "date_creation" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reduction_pkey" PRIMARY KEY ("id_reduction")
);

-- CreateTable
CREATE TABLE "Retour" (
    "id_commande_retour" INTEGER NOT NULL,
    "motif_retour" "motif_retour_enum" NOT NULL,
    "date_retour" TIMESTAMP(6) NOT NULL,
    "droit_retour" BOOLEAN NOT NULL DEFAULT false,
    "reception_retour" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Retour_pkey" PRIMARY KEY ("id_commande_retour")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id_stock" SERIAL NOT NULL,
    "id_maillot" INTEGER NOT NULL,
    "taille_maillot" "taille_maillot_enum" NOT NULL,
    "quantite_entree" INTEGER NOT NULL DEFAULT 0,
    "quantite_sortie" INTEGER NOT NULL DEFAULT 0,
    "quantite_total" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id_stock")
);

-- CreateTable
CREATE TABLE "StockMaillot" (
    "id_stock_maillot" SERIAL NOT NULL,
    "id_stock" INTEGER NOT NULL,
    "quantite_stock" INTEGER NOT NULL DEFAULT 0,
    "type_mouvement" "type_mouvement_enum" NOT NULL,
    "date_mouvement" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMaillot_pkey" PRIMARY KEY ("id_stock_maillot")
);

-- CreateTable
CREATE TABLE "TVA" (
    "id_tva" SERIAL NOT NULL,
    "taux_tva" INTEGER NOT NULL,
    "description_tva" VARCHAR(100) NOT NULL,

    CONSTRAINT "TVA_pkey" PRIMARY KEY ("id_tva")
);

-- CreateTable
CREATE TABLE "TypeLivraison" (
    "id_typelivraison" INTEGER NOT NULL,
    "methode_livraison" "methode_livraison_enum" NOT NULL,
    "choix_livreur" "choix_livreur_enum" NOT NULL,
    "choix_livraison" "choix_livraison_enum" NOT NULL,
    "prix_livraison" INTEGER NOT NULL,

    CONSTRAINT "TypeLivraison_pkey" PRIMARY KEY ("id_typelivraison")
);

-- CreateTable
CREATE TABLE "test" (
    "id_test" SERIAL NOT NULL,
    "date_creation" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_pkey" PRIMARY KEY ("id_test")
);

-- CreateIndex
CREATE UNIQUE INDEX "Avoir_numero_avoir_key" ON "Avoir"("numero_avoir");

-- CreateIndex
CREATE UNIQUE INDEX "Client_adresse_mail_client_key" ON "Client"("adresse_mail_client");

-- CreateIndex
CREATE UNIQUE INDEX "Reduction_code_reduction_key" ON "Reduction"("code_reduction");

-- AddForeignKey
ALTER TABLE "ApplicationReduction" ADD CONSTRAINT "ApplicationReduction_id_reduction_fkey" FOREIGN KEY ("id_reduction") REFERENCES "Reduction"("id_reduction") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Artiste" ADD CONSTRAINT "Artiste_id_maillot_artiste_fkey" FOREIGN KEY ("id_maillot_artiste") REFERENCES "Maillot"("id_maillot") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Association" ADD CONSTRAINT "Association_id_maillot_association_fkey" FOREIGN KEY ("id_maillot_association") REFERENCES "Maillot"("id_maillot") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "Client"("id_client") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_id_maillot_fkey" FOREIGN KEY ("id_maillot") REFERENCES "Maillot"("id_maillot") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "Client"("id_client") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_id_commande_fkey" FOREIGN KEY ("id_commande") REFERENCES "Commande"("id_commande") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LigneCommande" ADD CONSTRAINT "LigneCommande_id_maillot_fkey" FOREIGN KEY ("id_maillot") REFERENCES "Maillot"("id_maillot") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_id_typelivraison_fkey" FOREIGN KEY ("id_typelivraison") REFERENCES "TypeLivraison"("id_typelivraison") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Maillot" ADD CONSTRAINT "Maillot_id_tva_fkey" FOREIGN KEY ("id_tva") REFERENCES "TVA"("id_tva") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MaillotPersonnalisation" ADD CONSTRAINT "MaillotPersonnalisation_id_maillot_fkey" FOREIGN KEY ("id_maillot") REFERENCES "Maillot"("id_maillot") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MaillotPersonnalisation" ADD CONSTRAINT "MaillotPersonnalisation_id_personnalisation_fkey" FOREIGN KEY ("id_personnalisation") REFERENCES "Personnalisation"("id_personnalisation") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Panier" ADD CONSTRAINT "Panier_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "Client"("id_client") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PanierLigne" ADD CONSTRAINT "PanierLigne_id_maillot_fkey" FOREIGN KEY ("id_maillot") REFERENCES "Maillot"("id_maillot") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PanierLigne" ADD CONSTRAINT "PanierLigne_id_panier_fkey" FOREIGN KEY ("id_panier") REFERENCES "Panier"("id_panier") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "StockMaillot" ADD CONSTRAINT "StockMaillot_id_stock_fkey" FOREIGN KEY ("id_stock") REFERENCES "Stock"("id_stock") ON DELETE CASCADE ON UPDATE NO ACTION;
