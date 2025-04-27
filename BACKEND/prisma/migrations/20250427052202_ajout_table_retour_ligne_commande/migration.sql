-- CreateTable
CREATE TABLE "RetourLigneCommande" (
    "id_retour_lignecommande" SERIAL NOT NULL,
    "id_retour" INTEGER NOT NULL,
    "id_lignecommande" INTEGER NOT NULL,

    CONSTRAINT "RetourLigneCommande_pkey" PRIMARY KEY ("id_retour_lignecommande")
);

-- AddForeignKey
ALTER TABLE "RetourLigneCommande" ADD CONSTRAINT "RetourLigneCommande_id_retour_fkey" FOREIGN KEY ("id_retour") REFERENCES "Retour"("id_commande_retour") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetourLigneCommande" ADD CONSTRAINT "RetourLigneCommande_id_lignecommande_fkey" FOREIGN KEY ("id_lignecommande") REFERENCES "LigneCommande"("id_lignecommande") ON DELETE CASCADE ON UPDATE CASCADE;
