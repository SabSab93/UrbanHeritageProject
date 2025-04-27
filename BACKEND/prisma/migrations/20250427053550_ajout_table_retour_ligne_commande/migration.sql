/*
  Warnings:

  - The primary key for the `RetourLigneCommande` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_retour_lignecommande` on the `RetourLigneCommande` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Retour" ALTER COLUMN "date_retour" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "RetourLigneCommande" DROP CONSTRAINT "RetourLigneCommande_pkey",
DROP COLUMN "id_retour_lignecommande",
ADD CONSTRAINT "RetourLigneCommande_pkey" PRIMARY KEY ("id_retour", "id_lignecommande");

-- AddForeignKey
ALTER TABLE "Retour" ADD CONSTRAINT "Retour_id_commande_retour_fkey" FOREIGN KEY ("id_commande_retour") REFERENCES "Commande"("id_commande") ON DELETE CASCADE ON UPDATE CASCADE;
