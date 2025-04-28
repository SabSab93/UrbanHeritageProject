/*
  Warnings:

  - Added the required column `id_commande_retour` to the `Avoir` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Avoir" ADD COLUMN     "id_commande_retour" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "LigneCommande" ADD COLUMN     "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id_client" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Avoir" ADD CONSTRAINT "Avoir_id_commande_retour_fkey" FOREIGN KEY ("id_commande_retour") REFERENCES "Retour"("id_commande_retour") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_id_maillot_fkey" FOREIGN KEY ("id_maillot") REFERENCES "Maillot"("id_maillot") ON DELETE RESTRICT ON UPDATE CASCADE;
